'use strict';

/*
 * fill_polygons: exact-area anti-aliased polygon fill with integer arithmetic.
 *
 * Every coordinate is quantised once to 1/256 px (round half up). Each edge is
 * cut at row and column boundaries; the crossing points are integer floor
 * divisions of differences, so they do not depend on where the edge sits on
 * the pixel grid. Each cell piece adds its signed trapezoid area (doubled, in
 * 1/65536 px units) to a Float64 accumulator holding exact integers. A row's
 * prefix sum is the winding-weighted coverage of each pixel; the fill takes
 * min(1, |sum|). Polygons given in one call therefore form one union: shared
 * edges cancel exactly, overlaps clamp, and an oppositely wound ring cuts a
 * hole (the non-zero rule).
 *
 * Consequences, all exact:
 * - the same bytes in every JavaScript engine (no floating-point rounding
 *   decides a pixel);
 * - an integer `offset` translates the pixels exactly, so a band or window of
 *   a larger render is byte-identical to the same pixels of the whole render;
 * - reversing an edge negates its contribution exactly.
 *
 * Memory: the accumulator covers the polygons' bounding box intersected with
 * the clip and the buffer, processed in horizontal strips of at most
 * ACC_BUDGET cells. Strip height does not change any pixel.
 */

const ONE = 256;               // subpixel units per pixel
const TWO_ONE = 512;
const FULL = 131072;           // accumulated units for a fully covered pixel (2 * 256 * 256)
const ACC_BUDGET = 1 << 21;    // cells per strip (16 MiB of Float64)
const SAFE = 4503599627370496; // 2^52: products below this are exact doubles

let acc = new Float64Array(0);       // kept all-zero between calls
let quantised = new Float64Array(0); // quantised coordinates, reused
let acc_dirty = false;

// floor(n / d) for integers n, d with d > 0 and |n| <= 2^52.
const floor_div = (n, d) => {
    let q = Math.floor(n / d);
    const r = n - q * d;
    if (r < 0) q -= 1;
    else if (r >= d) q += 1;
    return q;
};

// floor(a * b / d) for integers, d > 0. Falls back to BigInt when a * b is
// too large to be exact in a double (coordinates beyond about 2^17 px).
const floor_mul_div = (a, b, d) => {
    const p = a * b;
    if (p < SAFE && p > -SAFE) return floor_div(p, d);
    const big = BigInt(a) * BigInt(b);
    const bd = BigInt(d);
    let q = big / bd;
    if (big % bd < BigInt(0)) q -= BigInt(1);
    return Number(q);
};

const is_int = Number.isInteger;

const check_byte = (value, what) => {
    if (!is_int(value) || value < 0 || value > 255) {
        throw new TypeError(`${what} must be an integer from 0 to 255`);
    }
    return value;
};

// -> [c0, c1, c2, alpha]; for 8bpp c0 is the grey value.
const normalise_color = (color, bipp) => {
    if (bipp === 8) {
        if (typeof color === 'number') return [check_byte(color, 'Colour'), 0, 0, 255];
        if (color && (color.length === 1 || color.length === 2)) {
            return [
                check_byte(color[0], 'Colour'), 0, 0,
                color.length === 2 ? check_byte(color[1], 'Alpha') : 255
            ];
        }
        throw new TypeError('An 8bpp colour is a grey value: a number, [v] or [v, a]');
    }
    if (!color || (color.length !== 3 && color.length !== 4)) {
        throw new TypeError('Colour must be [r, g, b] or [r, g, b, a]');
    }
    return [
        check_byte(color[0], 'Colour'),
        check_byte(color[1], 'Colour'),
        check_byte(color[2], 'Colour'),
        color.length === 4 ? check_byte(color[3], 'Alpha') : 255
    ];
};

const check_pb = (pb, name) => {
    if (!pb || !pb.ta || !pb.size) {
        throw new TypeError(`${name} needs a Pixel_Buffer`);
    }
    const bipp = pb.bipp;
    if (bipp !== 8 && bipp !== 24 && bipp !== 32) {
        throw new TypeError(`${name} supports 8, 24 and 32bpp buffers, not ${bipp}bpp`);
    }
    return bipp;
};

const normalise_offset = offset => {
    if (offset === undefined || offset === null) return [0, 0];
    if (!offset || offset.length !== 2 || !is_int(offset[0]) || !is_int(offset[1])) {
        throw new TypeError('offset must be [ox, oy] in integer pixels');
    }
    return [offset[0], offset[1]];
};

// Intersect an optional [x0, y0, x1, y1] clip (x1, y1 exclusive) with the buffer.
const normalise_clip = (clip, width, height) => {
    if (clip === undefined || clip === null) return [0, 0, width, height];
    if (!clip || clip.length !== 4 || !is_int(clip[0]) || !is_int(clip[1]) ||
        !is_int(clip[2]) || !is_int(clip[3])) {
        throw new TypeError('clip must be [x0, y0, x1, y1] in integer pixels');
    }
    return [
        Math.max(0, clip[0]), Math.max(0, clip[1]),
        Math.min(width, clip[2]), Math.min(height, clip[3])
    ];
};

const normalise_blend = blend => {
    if (blend === undefined || blend === 'over') return 'over';
    if (blend === 'replace') return 'replace';
    throw new TypeError(`blend must be 'over' or 'replace', not ${String(blend)}`);
};

// Accept an array of polygons, where each polygon is a flat [x0, y0, x1, y1, ...]
// array-like or an array of [x, y] pairs. A single flat polygon is also accepted.
const list_polygons = polygons => {
    if (!polygons || typeof polygons.length !== 'number') {
        throw new TypeError('polygons must be an array of flat coordinate arrays');
    }
    if (polygons.length > 0 && typeof polygons[0] === 'number') return [polygons];
    return polygons;
};

const flatten_pairs = polygon => {
    const flat = new Array(polygon.length * 2);
    for (let i = 0; i < polygon.length; i++) {
        const point = polygon[i];
        if (!point || point.length !== 2) {
            throw new TypeError('A polygon given as points must contain [x, y] pairs');
        }
        flat[2 * i] = point[0];
        flat[2 * i + 1] = point[1];
    }
    return flat;
};

/*
 * Quantise every polygon into the shared scratch array. Returns
 * {starts, counts, n, bbox} where bbox is in subpixels, or null when no
 * polygon has three or more points.
 */
const quantise = (polygons, ox, oy) => {
    const list = list_polygons(polygons);
    const flats = new Array(list.length);
    let total = 0;
    for (let p = 0; p < list.length; p++) {
        let polygon = list[p];
        if (!polygon || typeof polygon.length !== 'number') {
            throw new TypeError('Each polygon must be a flat coordinate array');
        }
        if (polygon.length > 0 && typeof polygon[0] !== 'number') polygon = flatten_pairs(polygon);
        if (polygon.length % 2 !== 0) {
            throw new TypeError('A flat polygon must have an even number of coordinates');
        }
        flats[p] = polygon;
        total += polygon.length;
    }
    if (quantised.length < total) quantised = new Float64Array(Math.max(total, quantised.length * 2));
    const q = quantised;
    const starts = [], counts = [];
    const oxs = ox * ONE, oys = oy * ONE;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    let k = 0;
    for (let p = 0; p < flats.length; p++) {
        const flat = flats[p];
        const n = flat.length >> 1;
        const start = k;
        for (let i = 0; i < flat.length; i += 2) {
            const x = flat[i], y = flat[i + 1];
            if (typeof x !== 'number' || typeof y !== 'number' ||
                !Number.isFinite(x) || !Number.isFinite(y)) {
                throw new TypeError('Polygon coordinates must be finite numbers');
            }
            // x * 256 is exact in binary floating point; Math.round is round half up.
            const X = Math.round(x * ONE) + oxs;
            const Y = Math.round(y * ONE) + oys;
            q[k++] = X;
            q[k++] = Y;
        }
        if (n < 3) continue;
        for (let i = start; i < k; i += 2) {
            const X = q[i], Y = q[i + 1];
            if (X < minX) minX = X;
            if (X > maxX) maxX = X;
            if (Y < minY) minY = Y;
            if (Y > maxY) maxY = Y;
        }
        starts.push(start);
        counts.push(n);
    }
    if (starts.length === 0 || minY === maxY) return null;
    return {starts, counts, bbox: [minX, minY, maxX, maxY]};
};

/*
 * One edge piece inside one row: from (xa, ya) to (xb, yb), 0 <= ya < yb <= 256,
 * in subpixels relative to the window's left edge and the row's top. `cover`
 * sign is dir. Walks the columns it crosses; parts left of the window carry
 * their full cover into column 0 (exact for every pixel in the window), parts
 * right of it are dropped (they only affect pixels further right).
 */
const accumulate_row_piece = (a, base, w, xa, ya, xb, yb, dir) => {
    const wide = w * ONE;
    if (xa === xb) {
        if (xa >= wide) return;
        const dy = (yb - ya) * dir;
        if (xa <= 0) {
            a[base] += dy * TWO_ONE;
            return;
        }
        const c = Math.floor(xa / ONE);
        const f = 2 * (xa - c * ONE);
        a[base + c] += dy * (TWO_ONE - f);
        a[base + c + 1] += dy * f;
        return;
    }
    const ddy = yb - ya;
    if (xa < xb) {
        if (xa >= wide) return;
        if (xb <= 0) {
            a[base] += ddy * dir * TWO_ONE;
            return;
        }
        const ddx = xb - xa;
        let px = xa, py = ya, c;
        if (xa < 0) {
            const y0 = ya + floor_mul_div(-xa, ddy, ddx);
            a[base] += (y0 - ya) * dir * TWO_ONE;
            px = 0;
            py = y0;
            c = 0;
        } else {
            c = Math.floor(xa / ONE);
        }
        for (;;) {
            const left = c * ONE;
            const boundary = left + ONE;
            if (boundary >= xb) {
                const cover = (yb - py) * dir;
                const f = (px - left) + (xb - left);
                a[base + c] += cover * (TWO_ONE - f);
                a[base + c + 1] += cover * f;
                return;
            }
            const yc = ya + floor_mul_div(boundary - xa, ddy, ddx);
            const cover = (yc - py) * dir;
            const f = (px - left) + ONE;
            a[base + c] += cover * (TWO_ONE - f);
            a[base + c + 1] += cover * f;
            px = boundary;
            py = yc;
            c++;
            if (c >= w) return;
        }
    }
    // xa > xb: x decreases along the piece.
    if (xb >= wide) return;
    if (xa <= 0) {
        a[base] += ddy * dir * TWO_ONE;
        return;
    }
    const ndx = xa - xb;
    let px = xa, py = ya, c;
    if (xa > wide) {
        const y0 = ya + floor_mul_div(xa - wide, ddy, ndx);
        px = wide;
        py = y0;
        c = w - 1;
    } else {
        c = Math.ceil(xa / ONE) - 1;
    }
    for (;;) {
        const left = c * ONE;
        if (left <= xb) {
            const cover = (yb - py) * dir;
            const f = (px - left) + (xb - left);
            a[base + c] += cover * (TWO_ONE - f);
            a[base + c + 1] += cover * f;
            return;
        }
        const yc = ya + floor_mul_div(xa - left, ddy, ndx);
        const cover = (yc - py) * dir;
        const f = px - left;
        a[base + c] += cover * (TWO_ONE - f);
        a[base + c + 1] += cover * f;
        px = left;
        py = yc;
        c--;
        if (c < 0) {
            a[base] += (yb - py) * dir * TWO_ONE;
            return;
        }
    }
};

/*
 * One polygon edge, in subpixels relative to the strip's top-left corner.
 * The strip has `rows` rows of `w` pixels; the accumulator row stride is
 * `stride`.
 */
const accumulate_edge = (a, stride, w, rows, x0, y0, x1, y1) => {
    if (y0 === y1) return;
    let dir = 1;
    if (y0 > y1) {
        let t = x0; x0 = x1; x1 = t;
        t = y0; y0 = y1; y1 = t;
        dir = -1;
    }
    const bottom = rows * ONE;
    if (y1 <= 0 || y0 >= bottom) return;
    const wide = w * ONE;
    if (x0 >= wide && x1 >= wide) return;
    const dx = x1 - x0, dy = y1 - y0;
    let ya = y0, xa = x0;
    if (ya < 0) {
        ya = 0;
        xa = x0 + floor_mul_div(-y0, dx, dy);
    }
    let r = Math.floor(ya / ONE);
    const end = y1 < bottom ? y1 : bottom;
    if (x0 <= 0 && x1 <= 0) {
        // Entirely left of the window: full cover into column 0 of each row.
        while (ya < end) {
            const row_bottom = (r + 1) * ONE;
            const yb = y1 < row_bottom ? y1 : row_bottom;
            a[r * stride] += (yb - ya) * dir * TWO_ONE;
            ya = yb;
            r++;
        }
        return;
    }
    while (ya < end) {
        const top = r * ONE;
        const row_bottom = top + ONE;
        let yb, xb;
        if (y1 <= row_bottom) {
            yb = y1;
            xb = x1;
        } else {
            yb = row_bottom;
            xb = x0 + floor_mul_div(row_bottom - y0, dx, dy);
        }
        accumulate_row_piece(a, r * stride, w, xa, ya - top, xb, yb - top, dir);
        xa = xb;
        ya = yb;
        r++;
    }
};

// round(t / 255) for 0 <= t <= 65025 (checked exhaustively).
const div255 = t => {
    const x = t + 128;
    return (x + (x >> 8)) >> 8;
};

/*
 * Composite one strip's coverage into the buffer and clear the accumulator.
 * m is the 8-bit coverage mask: round(255 * min(1, |sum| / FULL)).
 */
const composite_strip = (pb, a, stride, w, rows, wx0, wy0, rgba, blend) => {
    const ta = pb.ta;
    const bpr = pb.bytes_per_row;
    const bipp = pb.bipp;
    const bypp = bipp >> 3;
    const c0 = rgba[0], c1 = rgba[1], c2 = rgba[2], ca = rgba[3];
    const replace = blend === 'replace';
    for (let r = 0; r < rows; r++) {
        const base = r * stride;
        let o = (wy0 + r) * bpr + wx0 * bypp;
        let s = 0;
        for (let c = 0; c < w; c++, o += bypp) {
            const v = a[base + c];
            if (v !== 0) {
                s += v;
                a[base + c] = 0;
            }
            if (s === 0) continue;
            const abs = s < 0 ? -s : s;
            const m = abs >= FULL ? 255 : (abs * 255 + 65536) >> 17;
            if (m === 0) continue;
            if (bipp === 24) {
                const k = replace || ca === 255 ? m : div255(m * ca);
                if (k === 255) {
                    ta[o] = c0; ta[o + 1] = c1; ta[o + 2] = c2;
                } else if (k !== 0) {
                    const ik = 255 - k;
                    ta[o] = div255(c0 * k + ta[o] * ik);
                    ta[o + 1] = div255(c1 * k + ta[o + 1] * ik);
                    ta[o + 2] = div255(c2 * k + ta[o + 2] * ik);
                }
            } else if (bipp === 32) {
                if (replace) {
                    if (m === 255) {
                        ta[o] = c0; ta[o + 1] = c1; ta[o + 2] = c2; ta[o + 3] = ca;
                    } else {
                        // Premultiplied interpolation between destination and colour.
                        const da = ta[o + 3], im = 255 - m;
                        const sw = ca * m, dw = da * im;          // alpha weights, x255
                        const aw = sw + dw;
                        ta[o + 3] = div255(aw);
                        if (aw === 0) {
                            ta[o] = 0; ta[o + 1] = 0; ta[o + 2] = 0;
                        } else {
                            ta[o] = Math.floor((2 * (c0 * sw + ta[o] * dw) + aw) / (2 * aw));
                            ta[o + 1] = Math.floor((2 * (c1 * sw + ta[o + 1] * dw) + aw) / (2 * aw));
                            ta[o + 2] = Math.floor((2 * (c2 * sw + ta[o + 2] * dw) + aw) / (2 * aw));
                        }
                    }
                } else {
                    const k = ca === 255 ? m : div255(m * ca);
                    if (k === 255) {
                        ta[o] = c0; ta[o + 1] = c1; ta[o + 2] = c2; ta[o + 3] = 255;
                    } else if (k !== 0) {
                        const da = ta[o + 3], ik = 255 - k;
                        if (da === 255) {
                            ta[o] = div255(c0 * k + ta[o] * ik);
                            ta[o + 1] = div255(c1 * k + ta[o + 1] * ik);
                            ta[o + 2] = div255(c2 * k + ta[o + 2] * ik);
                        } else {
                            // Straight-alpha source-over: weights in units of 1/65025.
                            const sw = k * 255, dw = da * ik;
                            const aw = sw + dw;
                            ta[o + 3] = div255(aw);
                            ta[o] = Math.floor((2 * (c0 * sw + ta[o] * dw) + aw) / (2 * aw));
                            ta[o + 1] = Math.floor((2 * (c1 * sw + ta[o + 1] * dw) + aw) / (2 * aw));
                            ta[o + 2] = Math.floor((2 * (c2 * sw + ta[o + 2] * dw) + aw) / (2 * aw));
                        }
                    }
                }
            } else {
                const k = replace || ca === 255 ? m : div255(m * ca);
                if (k === 255) ta[o] = c0;
                else if (k !== 0) ta[o] = div255(c0 * k + ta[o] * (255 - k));
            }
        }
        a[base + w] = 0;
        a[base + w + 1] = 0;
    }
};

/**
 * Fill polygons as one anti-aliased union.
 *
 * @param {Pixel_Buffer} pb 8, 24 or 32bpp destination.
 * @param {Array} polygons array of flat [x0, y0, x1, y1, ...] arrays (plain
 *   or typed), in pixel units, y down. Arrays of [x, y] pairs are accepted.
 * @param {number|Array} color [r, g, b] or [r, g, b, a]; a grey value at 8bpp.
 * @param {Object} [options]
 * @param {Array} [options.clip] [x0, y0, x1, y1] integer pixels, x1/y1 exclusive.
 * @param {Array} [options.offset] [ox, oy] integer pixels added to every point.
 * @param {string} [options.blend] 'over' (default, source-over in sRGB) or
 *   'replace' (the colour, alpha included, replaces the destination in
 *   proportion to coverage).
 * @returns {Pixel_Buffer} pb
 */
const fill_polygons = (pb, polygons, color, options) => {
    const bipp = check_pb(pb, 'fill_polygons');
    const opts = options || {};
    const rgba = normalise_color(color, bipp);
    const [ox, oy] = normalise_offset(opts.offset);
    const blend = normalise_blend(opts.blend);
    const width = pb.size[0], height = pb.size[1];
    const [cx0, cy0, cx1, cy1] = normalise_clip(opts.clip, width, height);
    const shape = quantise(polygons, ox, oy);
    if (!shape) return pb;
    if (blend === 'over' && rgba[3] === 0) return pb;

    const [minX, minY, maxX, maxY] = shape.bbox;
    const wx0 = Math.max(cx0, Math.floor(minX / ONE));
    const wx1 = Math.min(cx1, Math.ceil(maxX / ONE));
    const wy0 = Math.max(cy0, Math.floor(minY / ONE));
    const wy1 = Math.min(cy1, Math.ceil(maxY / ONE));
    if (wx1 <= wx0 || wy1 <= wy0) return pb;

    const w = wx1 - wx0;
    const stride = w + 2;
    const strip_rows = Math.max(1, Math.min(wy1 - wy0, Math.floor(ACC_BUDGET / stride)));
    const need = stride * strip_rows;
    if (acc.length < need) {
        acc = new Float64Array(need);
        acc_dirty = false;
    } else if (acc_dirty) {
        acc.fill(0);
        acc_dirty = false;
    }
    const a = acc;
    const q = quantised;
    const {starts, counts} = shape;
    const sx = wx0 * ONE;

    acc_dirty = true;
    for (let top = wy0; top < wy1; top += strip_rows) {
        const rows = Math.min(strip_rows, wy1 - top);
        const sy = top * ONE;
        for (let p = 0; p < starts.length; p++) {
            const start = starts[p];
            const n = counts[p];
            const last = start + 2 * (n - 1);
            let px = q[last] - sx, py = q[last + 1] - sy;
            for (let i = start; i <= last; i += 2) {
                const x = q[i] - sx, y = q[i + 1] - sy;
                accumulate_edge(a, stride, w, rows, px, py, x, y);
                px = x;
                py = y;
            }
        }
        composite_strip(pb, a, stride, w, rows, wx0, top, rgba, blend);
    }
    acc_dirty = false;
    return pb;
};

module.exports = {
    fill_polygons,
    // shared with the other raster modules
    normalise_color,
    normalise_offset,
    normalise_clip,
    check_pb,
    floor_div,
    floor_mul_div,
    ONE
};
