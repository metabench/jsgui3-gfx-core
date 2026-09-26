'use strict';

/*
 * stroke_polyline: expand a polyline into outline polygons. Pure geometry: it
 * never touches a pixel buffer, so any painter (fill_polygons, Canvas2D
 * fill with the non-zero rule) can fill the same polygons.
 *
 * Output: an array of flat [x0, y0, x1, y1, ...] polygons that must be filled
 * together as one non-zero union. An open polyline gives one polygon; a closed
 * one gives two rings (outer and inner, opposite orientation). Outlines have
 * non-negative signed area (sum of x_i * y_(i+1) - x_(i+1) * y_i), the same
 * orientation as the pattern faces.
 *
 * Joins. The outer side of a join gets the miter point, the two bevel
 * corners, or an arc. The inner side gets the intersection of the two inner
 * offset lines whenever that intersection lies within both neighbouring
 * segments' rectangles. The outline then has winding number exactly 1 inside
 * the stroke, so an exact-area fill (sum then clamp) does not over-cover the
 * inside of the join. When a neighbouring segment is too short for that, the
 * inner side goes through the vertex itself (the "pivot"); the covered set is
 * still exactly the stroke, with winding 2 where the two segment rectangles
 * overlap.
 *
 * With side A = p - h n and side B = p + h n (n the left normal of the
 * segment direction u, h half the width), an outline is side A forward then
 * side B backward.
 */

const ROUND_TOLERANCE = 0.01;   // px: largest gap between an arc and its chords
const MAX_ARC_SEGMENTS = 1024;
const MIN_SEGMENT = 1e-9;
const JOINS = new Set(['miter', 'bevel', 'round']);
const CAPS = new Set(['butt', 'square', 'round']);

const to_points = points => {
    if (!points || typeof points.length !== 'number') {
        throw new TypeError('stroke_polyline needs points: [x0, y0, x1, y1, ...]');
    }
    let flat = points;
    if (points.length > 0 && typeof points[0] !== 'number') {
        flat = [];
        for (const point of points) {
            if (!point || point.length !== 2) {
                throw new TypeError('Points given as pairs must be [x, y]');
            }
            flat.push(point[0], point[1]);
        }
    }
    if (flat.length % 2 !== 0) {
        throw new TypeError('A flat point list must have an even number of coordinates');
    }
    const xs = [], ys = [];
    for (let i = 0; i < flat.length; i += 2) {
        const x = flat[i], y = flat[i + 1];
        if (typeof x !== 'number' || typeof y !== 'number' ||
            !Number.isFinite(x) || !Number.isFinite(y)) {
            throw new TypeError('Polyline coordinates must be finite numbers');
        }
        const k = xs.length;
        if (k > 0 && Math.hypot(x - xs[k - 1], y - ys[k - 1]) <= MIN_SEGMENT) continue;
        xs.push(x);
        ys.push(y);
    }
    return {xs, ys};
};

const read_options = options => {
    const opts = options || {};
    const width = opts.width === undefined ? 1 : opts.width;
    if (typeof width !== 'number' || !(width >= 0) || !Number.isFinite(width)) {
        throw new TypeError('width must be a finite number >= 0');
    }
    const join = opts.join === undefined ? 'miter' : opts.join;
    if (!JOINS.has(join)) throw new TypeError(`join must be 'miter', 'bevel' or 'round', not ${String(join)}`);
    const cap = opts.cap === undefined ? 'butt' : opts.cap;
    if (!CAPS.has(cap)) throw new TypeError(`cap must be 'butt', 'square' or 'round', not ${String(cap)}`);
    const miter_limit = opts.miter_limit === undefined ? 4 : opts.miter_limit;
    if (typeof miter_limit !== 'number' || !(miter_limit >= 1)) {
        throw new TypeError('miter_limit must be a number >= 1');
    }
    return {width, join, cap, miter_limit, closed: opts.closed === true};
};

// Points strictly between the arc's ends, around (cx, cy), radius r, from
// angle a0 through `sweep` radians.
const push_arc = (out, cx, cy, r, a0, sweep) => {
    const step = r > ROUND_TOLERANCE ? 2 * Math.acos(1 - ROUND_TOLERANCE / r) : Math.PI / 2;
    const n = Math.min(MAX_ARC_SEGMENTS, Math.max(1, Math.ceil(Math.abs(sweep) / step)));
    for (let j = 1; j < n; j++) {
        const t = a0 + sweep * j / n;
        out.push(cx + r * Math.cos(t), cy + r * Math.sin(t));
    }
};

const circle = (cx, cy, r) => {
    const out = [cx + r, cy];
    push_arc(out, cx, cy, r, 0, 2 * Math.PI);
    return out;
};

/*
 * Join points for vertex (px, py) between segment directions u1 and u2 (unit)
 * with lengths L1 and L2. Pushes side A points to `sa` and side B points to
 * `sb`, both in forward order.
 */
const push_join = (sa, sb, px, py, u1x, u1y, u2x, u2y, L1, L2, h, join, miter_limit) => {
    const n1x = -u1y, n1y = u1x, n2x = -u2y, n2y = u2x;
    const cross = u1x * u2y - u1y * u2x;
    const dot = u1x * u2x + u1y * u2y;
    const straight = Math.abs(cross) <= 1e-12;
    if (straight && dot > 0) {
        // Straight on: the offset lines meet flush.
        sa.push(px - h * n1x, py - h * n1y);
        sb.push(px + h * n1x, py + h * n1y);
        return;
    }
    // The turn is towards +n when cross > 0, so the outer side is A (-n).
    // A reversal (straight, dot < 0) is treated as a turn towards +n.
    const positive = straight || cross > 0;
    const s = positive ? -1 : 1;            // outer side = p + s h n
    const outer = s < 0 ? sa : sb;
    const inner = s < 0 ? sb : sa;
    const one_plus_dot = 1 + dot;

    // Outer side.
    const ax = px + s * h * n1x, ay = py + s * h * n1y;
    const bx = px + s * h * n2x, by = py + s * h * n2y;
    if (join === 'miter' && one_plus_dot > 1e-12 && 2 <= miter_limit * miter_limit * one_plus_dot) {
        const k = s * h / one_plus_dot;
        outer.push(px + k * (n1x + n2x), py + k * (n1y + n2y));
    } else if (join === 'round') {
        outer.push(ax, ay);
        const a0 = Math.atan2(ay - py, ax - px);
        const sweep = Math.atan2(Math.abs(cross), dot) * (positive ? 1 : -1);
        push_arc(outer, px, py, h, a0, sweep);
        outer.push(bx, by);
    } else {
        outer.push(ax, ay, bx, by);
    }

    // Inner side: the offset-line intersection when both segment rectangles
    // contain the overlap kite, else through the vertex.
    let use_intersection = false;
    if (one_plus_dot > 1e-12) {
        const sin = Math.abs(cross);
        const extent = dot >= 0 ? h * sin : h * sin / one_plus_dot;
        use_intersection = L1 >= extent && L2 >= extent;
    }
    if (use_intersection) {
        const k = -s * h / one_plus_dot;
        inner.push(px + k * (n1x + n2x), py + k * (n1y + n2y));
    } else {
        inner.push(px - s * h * n1x, py - s * h * n1y, px, py, px - s * h * n2x, py - s * h * n2y);
    }
};

const reverse_points = (flat) => {
    const out = new Array(flat.length);
    for (let i = 0, j = flat.length - 2; j >= 0; i += 2, j -= 2) {
        out[i] = flat[j];
        out[i + 1] = flat[j + 1];
    }
    return out;
};

/**
 * Stroke a polyline.
 *
 * @param {Array} points flat [x0, y0, x1, y1, ...] (plain or typed) or [x, y] pairs.
 * @param {Object} [options]
 * @param {number} [options.width=1]
 * @param {string} [options.join='miter'] 'miter', 'bevel' or 'round'.
 * @param {number} [options.miter_limit=4] miter length / width above which a miter becomes a bevel.
 * @param {string} [options.cap='butt'] 'butt', 'square' or 'round'.
 * @param {boolean} [options.closed=false]
 * @returns {Array<Array<number>>} polygons to fill together as one non-zero union.
 */
const stroke_polyline = (points, options) => {
    const {width, join, cap, miter_limit, closed} = read_options(options);
    const {xs, ys} = to_points(points);
    const h = width / 2;
    if (!(h > 0) || xs.length === 0) return [];
    let n = xs.length;
    let is_closed = closed;
    let cap_style = cap;
    if (is_closed && n > 2 && Math.hypot(xs[n - 1] - xs[0], ys[n - 1] - ys[0]) <= MIN_SEGMENT) {
        xs.pop();
        ys.pop();
        n--;
    }
    if (is_closed && n === 2) {
        // A closed back-and-forth path: its two 180-degree joins are its ends.
        is_closed = false;
        cap_style = join === 'round' ? 'round' : 'butt';
    }
    if (n === 1 || (is_closed && n < 2)) {
        // A zero-length subpath: only square and round caps draw anything.
        if (cap_style === 'square' && !is_closed) {
            const x = xs[0], y = ys[0];
            return [[x - h, y - h, x + h, y - h, x + h, y + h, x - h, y + h]];
        }
        if (cap_style === 'round' && !is_closed) return [circle(xs[0], ys[0], h)];
        return [];
    }

    const segs = is_closed ? n : n - 1;
    const ux = new Array(segs), uy = new Array(segs), len = new Array(segs);
    for (let i = 0; i < segs; i++) {
        const j = (i + 1) % n;
        const dx = xs[j] - xs[i], dy = ys[j] - ys[i];
        const L = Math.hypot(dx, dy);
        ux[i] = dx / L;
        uy[i] = dy / L;
        len[i] = L;
    }

    const sa = [], sb = [];
    if (is_closed) {
        for (let k = 0; k < n; k++) {
            const i1 = (k - 1 + segs) % segs, i2 = k;
            push_join(sa, sb, xs[k], ys[k], ux[i1], uy[i1], ux[i2], uy[i2], len[i1], len[i2], h, join, miter_limit);
        }
        return [sa, reverse_points(sb)];
    }

    // Open: start point, joins, end point.
    let sx = xs[0], sy = ys[0];
    const e = n - 1;
    let ex = xs[e], ey = ys[e];
    const u0x = ux[0], u0y = uy[0], uex = ux[segs - 1], uey = uy[segs - 1];
    if (cap_style === 'square') {
        sx -= h * u0x; sy -= h * u0y;
        ex += h * uex; ey += h * uey;
    }
    sa.push(sx + h * u0y, sy - h * u0x);        // p - h n, with n = (-uy, ux)
    sb.push(sx - h * u0y, sy + h * u0x);        // p + h n
    for (let k = 1; k < e; k++) {
        push_join(sa, sb, xs[k], ys[k], ux[k - 1], uy[k - 1], ux[k], uy[k], len[k - 1], len[k], h, join, miter_limit);
    }
    const eax = ex + h * uey, eay = ey - h * uex;
    const ebx = ex - h * uey, eby = ey + h * uex;
    sa.push(eax, eay);
    sb.push(ebx, eby);
    const outline = sa;
    if (cap_style === 'round') {
        // From A (-n) through +u to B (+n): a half turn in the positive sense.
        push_arc(outline, ex, ey, h, Math.atan2(eay - ey, eax - ex), Math.PI);
    }
    const back = reverse_points(sb);          // B end ... B start
    for (let i = 0; i < back.length; i++) outline.push(back[i]);
    if (cap_style === 'round') {
        // From the start's B point (+n) through -u to its A point (-n).
        const bx = back[back.length - 2], by = back[back.length - 1];
        push_arc(outline, sx, sy, h, Math.atan2(by - sy, bx - sx), Math.PI);
    }
    return [outline];
};

module.exports = {stroke_polyline};
