'use strict';

/*
 * fill_polygon_aliased: a hard-edged polygon fill for pick buffers (ID
 * colours) and masks. A pixel is filled when its centre is inside the
 * polygon under the non-zero rule; a centre exactly on an edge counts when
 * the edge is on its left (so shared edges are drawn once). Only the rows the
 * polygon covers are visited, and no outline is drawn.
 *
 * Coordinates are quantised to 1/4096 px like fill_polygons and every span
 * end is an exact integer division, so an integer translation moves the
 * filled pixel set exactly: the same shape at x0 = 1.3 and x0 = 11.3 fills
 * the same pixels ten columns apart. (The older draw_polygon(..., true)
 * samples pixel corners and adds a truncated outline: the same 4 x 3 square
 * fills 16 or 20 pixels depending on where it sits.)
 */

const {normalise_offset, normalise_clip, ONE} = require('./fill-polygons');

const HALF = ONE / 2;
const SAFE = 4503599627370496;

// ceil(n / d) for integers n, d with d > 0 and |n| < 2^52.
const ceil_div = (n, d) => {
    let q = Math.ceil(n / d);
    const r = n - q * d;               // in (-d, 0] when q is right
    if (r > 0) q += 1;
    else if (r <= -d) q -= 1;
    return q;
};

const check_color = (color, bipp) => {
    const byte = v => Number.isInteger(v) && v >= 0 && v <= 255;
    if (bipp === 1) {
        if (color !== 0 && color !== 1) throw new TypeError('A 1bpp colour is 0 or 1');
        return color;
    }
    if (bipp === 8) {
        if (!byte(color)) throw new TypeError('An 8bpp colour is an integer from 0 to 255');
        return color;
    }
    if (!color || !(color.length === 3 || (bipp === 32 && color.length === 4)) || ![...color].every(byte)) {
        throw new TypeError(bipp === 24 ? 'A 24bpp colour is [r, g, b]' : 'A 32bpp colour is [r, g, b] or [r, g, b, a]');
    }
    return bipp === 32 && color.length === 3 ? [color[0], color[1], color[2], 255] : [...color];
};

const to_flat = polygon => {
    if (!polygon || typeof polygon.length !== 'number') {
        throw new TypeError('fill_polygon_aliased needs a polygon: [x0, y0, x1, y1, ...]');
    }
    if (polygon.length > 0 && typeof polygon[0] !== 'number') {
        const flat = [];
        for (const point of polygon) {
            if (!point || point.length !== 2) throw new TypeError('Points given as pairs must be [x, y]');
            flat.push(point[0], point[1]);
        }
        return flat;
    }
    if (polygon.length % 2 !== 0) throw new TypeError('A flat polygon must have an even number of coordinates');
    return polygon;
};

/**
 * @param {Pixel_Buffer} pb 1, 8, 24 or 32bpp.
 * @param {Array} polygon flat [x0, y0, x1, y1, ...] or [x, y] pairs, pixel units.
 * @param {number|Array} color 0/1 at 1bpp, a grey value at 8bpp, [r, g, b] or [r, g, b, a].
 * @param {Object} [options] offset [ox, oy] and clip [x0, y0, x1, y1], integer pixels, as for fill_polygons.
 * @returns {Pixel_Buffer} pb
 */
const fill_polygon_aliased = (pb, polygon, color, options) => {
    if (!pb || !pb.ta || !pb.size) throw new TypeError('fill_polygon_aliased needs a Pixel_Buffer');
    const bipp = pb.bipp;
    if (bipp !== 1 && bipp !== 8 && bipp !== 24 && bipp !== 32) {
        throw new TypeError(`fill_polygon_aliased supports 1, 8, 24 and 32bpp, not ${bipp}bpp`);
    }
    const value = check_color(color, bipp);
    const opts = options || {};
    const [ox, oy] = normalise_offset(opts.offset);
    const [cx0, cy0, cx1, cy1] = normalise_clip(opts.clip, pb.size[0], pb.size[1]);
    const flat = to_flat(polygon);
    const n = flat.length >> 1;
    if (n < 3) return pb;

    // Quantise; keep numbers small by working relative to a whole-pixel base.
    const xs = new Float64Array(n), ys = new Float64Array(n);
    let minX = Infinity, minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < n; i++) {
        const x = flat[2 * i], y = flat[2 * i + 1];
        if (typeof x !== 'number' || typeof y !== 'number' || !Number.isFinite(x) || !Number.isFinite(y)) {
            throw new TypeError('Polygon coordinates must be finite numbers');
        }
        xs[i] = Math.round(x * ONE) + ox * ONE;
        ys[i] = Math.round(y * ONE) + oy * ONE;
        if (xs[i] < minX) minX = xs[i];
        if (ys[i] < minY) minY = ys[i];
        if (ys[i] > maxY) maxY = ys[i];
    }
    const base_px = Math.floor(minX / ONE);
    const base = base_px * ONE;
    for (let i = 0; i < n; i++) xs[i] -= base;

    // Rows whose centre y*ONE + HALF lies in [minY, maxY).
    const y_first = Math.max(cy0, ceil_div(minY - HALF, ONE));
    const y_end = Math.min(cy1, ceil_div(maxY - HALF, ONE));
    if (y_end <= y_first || cx1 <= cx0) return pb;

    // Span writer: packed 1bpp goes through the buffer's own span routine.
    const ta = pb.ta, bpr = pb.bytes_per_row, bypp = bipp >> 3;
    const span = (y, x0, x1) => {          // pixels x0 .. x1 - 1, already clipped
        if (bipp === 1) {
            pb.draw_horizontal_line_y_x1_x2(y, x0, x1 - 1, value);
            return;
        }
        let o = y * bpr + x0 * bypp;
        if (bipp === 8) {
            ta.fill(value, o, o + (x1 - x0));
        } else if (bipp === 24) {
            for (let x = x0; x < x1; x++, o += 3) {
                ta[o] = value[0]; ta[o + 1] = value[1]; ta[o + 2] = value[2];
            }
        } else {
            for (let x = x0; x < x1; x++, o += 4) {
                ta[o] = value[0]; ta[o + 1] = value[1]; ta[o + 2] = value[2]; ta[o + 3] = value[3];
            }
        }
    };

    const cross_x = [], cross_dir = [];
    for (let y = y_first; y < y_end; y++) {
        const yc = y * ONE + HALF;
        cross_x.length = 0;
        cross_dir.length = 0;
        for (let i = 0, j = n - 1; i < n; j = i++) {
            let xa = xs[j], ya = ys[j], xb = xs[i], yb = ys[i];
            if (ya === yb) continue;
            let dir = 1;
            if (ya > yb) {
                let t = xa; xa = xb; xb = t;
                t = ya; ya = yb; yb = t;
                dir = -1;
            }
            if (yc < ya || yc >= yb) continue;
            // First pixel whose centre is at or right of the crossing:
            // ceil((xa + (yc - ya) (xb - xa) / (yb - ya) - HALF) / ONE).
            const d = yb - ya;
            const p1 = (xa - HALF) * d, p2 = (yc - ya) * (xb - xa);
            const num = p1 + p2;
            const exact = p1 < SAFE && p1 > -SAFE && p2 < SAFE && p2 > -SAFE && num < SAFE && num > -SAFE;
            cross_x.push(exact ? ceil_div(num, ONE * d) : big_first_pixel(xa, ya, xb, yb, yc));
            cross_dir.push(dir);
        }
        // Sort crossings by x (insertion sort: few per row).
        for (let a = 1; a < cross_x.length; a++) {
            const x = cross_x[a], dr = cross_dir[a];
            let b = a - 1;
            while (b >= 0 && cross_x[b] > x) {
                cross_x[b + 1] = cross_x[b];
                cross_dir[b + 1] = cross_dir[b];
                b--;
            }
            cross_x[b + 1] = x;
            cross_dir[b + 1] = dr;
        }
        let winding = 0;
        let start = 0;
        for (let k = 0; k < cross_x.length; k++) {
            const before = winding;
            winding += cross_dir[k];
            if (before === 0 && winding !== 0) start = cross_x[k];
            else if (before !== 0 && winding === 0) {
                const x0 = Math.max(cx0, start + base_px), x1 = Math.min(cx1, cross_x[k] + base_px);
                if (x1 > x0) span(y, x0, x1);
            }
        }
    }
    return pb;
};

// The same first-pixel formula with BigInt, for crossings of huge polygons.
const big_first_pixel = (xa, ya, xb, yb, yc) => {
    const d = BigInt(yb - ya);
    const num = BigInt(xa - HALF) * d + BigInt(yc - ya) * BigInt(xb - xa);
    const den = BigInt(ONE) * d;
    let q = num / den;
    if (num % den > BigInt(0)) q += BigInt(1);
    return Number(q);
};

module.exports = {fill_polygon_aliased};
