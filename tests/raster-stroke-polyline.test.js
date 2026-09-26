'use strict';

const assert = require('assert');
const {Pixel_Buffer} = require('../core/gfx-core');
const {fill_polygons} = require('../core/raster/fill-polygons');
const {stroke_polyline} = require('../core/raster/stroke-polyline');

const signed_area = flat => {
    let a = 0;
    const n = flat.length >> 1;
    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        a += flat[2 * i] * flat[2 * j + 1] - flat[2 * j] * flat[2 * i + 1];
    }
    return a / 2;
};
const total_area = polygons => polygons.reduce((sum, p) => sum + signed_area(p), 0);
const near = (a, b, eps, what) => assert(Math.abs(a - b) <= eps, `${what}: ${a} vs ${b}`);
const points_of = flat => {
    const out = [];
    for (let i = 0; i < flat.length; i += 2) out.push([flat[i], flat[i + 1]]);
    return out;
};

/*
 * Independent reference for the region an SVG stroke covers: the union of
 * each segment's rectangle, a wedge per join (miter quadrilateral or bevel
 * triangle; a disc for round joins) and the caps. Coverage is estimated by
 * point sampling on an S x S grid per pixel.
 */
const convex_contains = (poly, x, y) => {
    // poly: [[x, y], ...] convex, either orientation
    let sign = 0;
    for (let i = 0; i < poly.length; i++) {
        const [ax, ay] = poly[i], [bx, by] = poly[(i + 1) % poly.length];
        const c = (bx - ax) * (y - ay) - (by - ay) * (x - ax);
        if (c !== 0) {
            if (sign === 0) sign = c > 0 ? 1 : -1;
            else if ((c > 0 ? 1 : -1) !== sign) return false;
        }
    }
    return true;
};
const reference_pieces = (flat, {width, join = 'miter', miter_limit = 4, cap = 'butt', closed = false}) => {
    const p = points_of(flat), h = width / 2, n = p.length;
    const segs = closed ? n : n - 1;
    const pieces = [], discs = [];
    const u = [];
    for (let i = 0; i < segs; i++) {
        const a = p[i], b = p[(i + 1) % n];
        const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
        const ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L;
        u.push([ux, uy]);
        let ax = a[0], ay = a[1], bx = b[0], by = b[1];
        if (!closed && cap === 'square') {
            if (i === 0) { ax -= h * ux; ay -= h * uy; }
            if (i === segs - 1) { bx += h * ux; by += h * uy; }
        }
        const nx = -uy * h, ny = ux * h;
        pieces.push([[ax + nx, ay + ny], [bx + nx, by + ny], [bx - nx, by - ny], [ax - nx, ay - ny]]);
    }
    const first = closed ? 0 : 1, last = closed ? n - 1 : n - 2;
    for (let k = first; k <= last; k++) {
        const u1 = u[(k - 1 + segs) % segs], u2 = u[k % segs], v = p[k];
        if (join === 'round') { discs.push([v[0], v[1], h]); continue; }
        const cross = u1[0] * u2[1] - u1[1] * u2[0];
        if (Math.abs(cross) < 1e-12) continue;
        const s = cross > 0 ? -1 : 1, dot = u1[0] * u2[0] + u1[1] * u2[1];
        const n1 = [-u1[1], u1[0]], n2 = [-u2[1], u2[0]];
        const a = [v[0] + s * h * n1[0], v[1] + s * h * n1[1]], b = [v[0] + s * h * n2[0], v[1] + s * h * n2[1]];
        if (join === 'miter' && 2 <= miter_limit * miter_limit * (1 + dot)) {
            const k2 = s * h / (1 + dot);
            pieces.push([v, a, [v[0] + k2 * (n1[0] + n2[0]), v[1] + k2 * (n1[1] + n2[1])], b]);
        } else {
            pieces.push([v, a, b]);
        }
    }
    if (!closed && cap === 'round') {
        discs.push([p[0][0], p[0][1], h], [p[n - 1][0], p[n - 1][1], h]);
    }
    return {pieces, discs};
};
const segment_distance = (x, y, [ax, ay], [bx, by]) => {
    const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy;
    const t = L2 === 0 ? 0 : Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / L2));
    return Math.hypot(x - ax - t * dx, y - ay - t * dy);
};
const inside_reference = (pieces, discs, x, y) => {
    for (const piece of pieces) if (convex_contains(piece, x, y)) return true;
    for (const [cx, cy, r] of discs) if ((x - cx) * (x - cx) + (y - cy) * (y - cy) <= r * r) return true;
    return false;
};
const reference_coverage = (flat, options, w, h, S = 64) => {
    const {pieces, discs} = reference_pieces(flat, options);
    const out = new Float64Array(w * h);
    for (let py = 0; py < h; py++) {
        for (let px = 0; px < w; px++) {
            // A pixel farther than half its diagonal from every boundary is
            // wholly inside or wholly outside: one sample decides it.
            const cx = px + 0.5, cy = py + 0.5;
            let nearest = Infinity;
            for (const piece of pieces) {
                for (let i = 0; i < piece.length; i++) {
                    nearest = Math.min(nearest, segment_distance(cx, cy, piece[i], piece[(i + 1) % piece.length]));
                }
            }
            for (const [dx, dy, r] of discs) nearest = Math.min(nearest, Math.abs(Math.hypot(cx - dx, cy - dy) - r));
            if (nearest > 0.71) {
                out[py * w + px] = inside_reference(pieces, discs, cx, cy) ? 255 : 0;
                continue;
            }
            let count = 0;
            for (let sy = 0; sy < S; sy++) {
                const y = py + (sy + 0.5) / S;
                for (let sx = 0; sx < S; sx++) {
                    const x = px + (sx + 0.5) / S;
                    let inside = false;
                    for (const piece of pieces) {
                        if (convex_contains(piece, x, y)) { inside = true; break; }
                    }
                    if (!inside) {
                        for (const [cx, cy, r] of discs) {
                            if ((x - cx) * (x - cx) + (y - cy) * (y - cy) <= r * r) { inside = true; break; }
                        }
                    }
                    if (inside) count++;
                }
            }
            out[py * w + px] = 255 * count / (S * S);
        }
    }
    return out;
};
const render = (polygons, w, h) => {
    const pb = new Pixel_Buffer({size: [w, h], bits_per_pixel: 8});
    fill_polygons(pb, polygons, 255);
    return pb.ta;
};
// The prototype's stroker: a quad per segment plus a wedge per join, summed.
const naive_polygons = (flat, options) => {
    const {pieces} = reference_pieces(flat, options);
    return pieces.map(piece => {
        const f = piece.flat();
        return signed_area(f) >= 0 ? f : points_of(f).reverse().flat();
    });
};
const coverage_error = (got, ref) => {
    let over = 0, under = 0;
    for (let i = 0; i < ref.length; i++) {
        const d = got[i] - ref[i];
        if (d > over) over = d;
        if (-d > under) under = -d;
    }
    return {over, under};
};

const runRasterStrokePolylineTests = () => {
    let passed = 0;
    let failed = 0;

    const test = (description, fn) => {
        try {
            fn();
            console.log(`  ${description}: \x1b[32m✔ Passed\x1b[0m`);
            passed++;
        } catch (error) {
            console.log(`  ${description}: \x1b[31m✘ Failed\x1b[0m`);
            console.error(error && error.stack ? error.stack : error);
            failed++;
        }
    };

    console.log('Running stroke_polyline geometry tests...');

    test('a butt-capped segment is its rectangle, with positive signed area', () => {
        const out = stroke_polyline([1, 2, 11, 2], {width: 4});
        assert.strictEqual(out.length, 1);
        assert.deepStrictEqual(out[0], [1, 0, 11, 0, 11, 4, 1, 4]);
        assert.strictEqual(signed_area(out[0]), 40);
        const diagonal = stroke_polyline([[0, 0], [3, 4]], {width: 2});
        near(signed_area(diagonal[0]), 10, 1e-12, 'diagonal area');
    });

    test('square caps extend both ends by half the width', () => {
        const out = stroke_polyline([1, 2, 11, 2], {width: 4, cap: 'square'});
        assert.deepStrictEqual(out[0], [-1, 0, 13, 0, 13, 4, -1, 4]);
    });

    test('a right-angle miter has its corner at h * sqrt(2) and resolves the inner join', () => {
        const out = stroke_polyline([0, 0, 10, 0, 10, 10], {width: 2, join: 'miter'});
        assert.strictEqual(out.length, 1);
        const pts = points_of(out[0]);
        // Outer miter corner at (11, -1); inner corner at (9, 1): no pivot at (10, 0).
        assert(pts.some(([x, y]) => Math.abs(x - 11) < 1e-12 && Math.abs(y + 1) < 1e-12));
        assert(pts.some(([x, y]) => Math.abs(x - 9) < 1e-12 && Math.abs(y - 1) < 1e-12));
        assert(!pts.some(([x, y]) => x === 10 && y === 0));
        near(Math.hypot(11 - 10, -1 - 0), Math.SQRT2, 1e-12, 'miter length / 2');
        // Exact L-shaped area: 11 x 2 + 2 x 9... = (0..11 x -1..1) + (9..11 x 1..10)
        near(signed_area(out[0]), 22 + 18, 1e-9, 'L area');
    });

    test('miter length follows 1 / sin(angle / 2) and falls back to bevel past the limit', () => {
        // Interior angle 20 degrees: miter ratio 1 / sin(10 deg) = 5.76.
        const phi = 20 * Math.PI / 180;
        const pts = [0, 0, 20, 0, 20 - 20 * Math.cos(phi), 20 * Math.sin(phi)];
        const h = 1;
        const has = (poly, [x, y]) => points_of(poly[0]).some(([px, py]) => Math.hypot(px - x, py - y) < 1e-9);
        // Outer side: the miter point, and the two bevel corners at distance h.
        const m = [20 + h / Math.tan(phi / 2), -h];
        const a = [20, -h], b = [20 + h * Math.sin(phi), h * Math.cos(phi)];
        near(Math.hypot(m[0] - 20, m[1]), h / Math.sin(phi / 2), 1e-12, 'miter length');
        const miter = stroke_polyline(pts, {width: 2 * h, join: 'miter', miter_limit: 12});
        const bevel = stroke_polyline(pts, {width: 2 * h, join: 'miter', miter_limit: 4});
        assert(has(miter, m) && !has(miter, a) && !has(miter, b), 'miter within the limit');
        assert(has(bevel, a) && has(bevel, b) && !has(bevel, m), 'bevel past the limit');
        // The miter adds exactly the triangle a, m, b.
        near(signed_area(miter[0]) - signed_area(bevel[0]),
            h * h / Math.tan(phi / 2) * (1 + Math.cos(phi)) / 2, 1e-9, 'miter tip area');
        const explicit = stroke_polyline(pts, {width: 2 * h, join: 'bevel'});
        assert.deepStrictEqual(explicit, bevel);
    });

    test('closed polylines give an outer and an inner ring whose areas net to the band', () => {
        const square = [0, 0, 10, 0, 10, 10, 0, 10];
        const out = stroke_polyline(square, {width: 2, closed: true});
        assert.strictEqual(out.length, 2);
        const areas = out.map(signed_area).sort((a, b) => a - b);
        near(areas[0], -64, 1e-9, 'inner ring');
        near(areas[1], 144, 1e-9, 'outer ring');
        const reversed = stroke_polyline([0, 10, 10, 10, 10, 0, 0, 0], {width: 2, closed: true});
        near(total_area(reversed), 80, 1e-9, 'reversed net');
        assert.deepStrictEqual(render(out, 14, 14), render(reversed, 14, 14));
        // A repeated closing point is dropped.
        const repeated = stroke_polyline([...square, 0, 0], {width: 2, closed: true});
        near(total_area(repeated), 80, 1e-9, 'repeated net');
    });

    test('filled outlines match the union of segment rectangles and join wedges (no over-coverage at 1 px)', () => {
        const zigzag = [2.3, 3.1, 9.7, 14.2, 15.4, 2.8, 23.9, 13.6, 30.2, 4.4];
        for (const join of ['miter', 'bevel', 'round']) {
            for (const width of [1, 2.5]) {
                const opts = {width, join, miter_limit: 12};
                const ref = reference_coverage(zigzag, opts, 34, 18);
                const got = render(stroke_polyline(zigzag, opts), 34, 18);
                const {over, under} = coverage_error(got, ref);
                assert(over <= 6 && under <= 6, `${join} w=${width}: over ${over.toFixed(1)} under ${under.toFixed(1)}`);
            }
        }
        // The prototype's summed quads and wedges over-cover the inside of each join.
        const naive = coverage_error(render(naive_polygons(zigzag, {width: 1, join: 'miter', miter_limit: 12}), 34, 18),
            reference_coverage(zigzag, {width: 1, join: 'miter', miter_limit: 12}, 34, 18));
        assert(naive.over > 30, `naive over-coverage ${naive.over}`);
    });

    test('closed and capped strokes match the reference region', () => {
        const cases = [
            [[3.5, 3.2, 20.7, 4.1, 17.3, 15.6, 5.1, 13.9], {width: 1.3, closed: true, join: 'miter', miter_limit: 12}],
            [[3.5, 3.2, 20.7, 4.1, 17.3, 15.6, 5.1, 13.9], {width: 3, closed: true, join: 'round'}],
            [[4.2, 9.1, 12.6, 5.3, 20.1, 12.8], {width: 3.2, cap: 'square', join: 'bevel'}],
            [[4.2, 9.1, 12.6, 5.3, 20.1, 12.8], {width: 3.2, cap: 'round', join: 'round'}]
        ];
        for (const [pts, opts] of cases) {
            const ref = reference_coverage(pts, opts, 25, 19);
            const got = render(stroke_polyline(pts, opts), 25, 19);
            const {over, under} = coverage_error(got, ref);
            assert(over <= 6 && under <= 6, `${JSON.stringify(opts)}: over ${over.toFixed(1)} under ${under.toFixed(1)}`);
        }
    });

    test('short segments at sharp joins pivot through the vertex without holes', () => {
        // Segments shorter than the join overlap: the outline goes through the
        // vertex, so the covered set is exact and only edge pixels may gain.
        const pts = [3, 10, 12, 10, 12.6, 9.2, 4, 7.5];
        const opts = {width: 4, join: 'miter', miter_limit: 4};
        const out = stroke_polyline(pts, opts);
        const flat = out[0];
        assert(points_of(flat).some(([x, y]) => x === 12 && y === 10), 'pivot through the vertex');
        const ref = reference_coverage(pts, opts, 18, 16);
        const got = render(out, 18, 16);
        const {under} = coverage_error(got, ref);
        assert(under <= 6, `under ${under}`);
        for (let i = 0; i < ref.length; i++) {
            if (ref[i] >= 254.9) assert.strictEqual(got[i], 255, 'interior pixel');
        }
    });

    test('degenerate input: repeated points, zero width, single points and closed pairs', () => {
        assert.deepStrictEqual(stroke_polyline([1, 1, 1, 1, 5, 1, 5, 1], {width: 2}),
            stroke_polyline([1, 1, 5, 1], {width: 2}));
        assert.deepStrictEqual(stroke_polyline([0, 0, 5, 5], {width: 0}), []);
        assert.deepStrictEqual(stroke_polyline([], {width: 2}), []);
        assert.deepStrictEqual(stroke_polyline([3, 3], {width: 2}), []);
        assert.deepStrictEqual(stroke_polyline([3, 3], {width: 2, cap: 'square'}), [[2, 2, 4, 2, 4, 4, 2, 4]]);
        // Chords sit at most 0.01 px inside the circle: area within perimeter * 0.01.
        near(signed_area(stroke_polyline([3, 3], {width: 2, cap: 'round'})[0]), Math.PI, 2 * Math.PI * 0.01, 'dot area');
        // A closed two-point path is its segment with the joins as ends.
        assert.deepStrictEqual(stroke_polyline([0, 0, 6, 0], {width: 2, closed: true}),
            stroke_polyline([0, 0, 6, 0], {width: 2}));
        // Collinear interior points do not change the outline's area.
        near(signed_area(stroke_polyline([0, 0, 3, 0, 7, 0, 10, 0], {width: 2})[0]), 20, 1e-12, 'collinear');
        // A full reversal is covered on both sides without a spike.
        const back = stroke_polyline([0, 5, 10, 5, 4, 5], {width: 2, join: 'miter', miter_limit: 100});
        for (const [, y] of points_of(back[0])) assert(y >= 4 - 1e-9 && y <= 6 + 1e-9);
    });

    test('round caps and joins approximate the circle within 0.01 px', () => {
        const out = stroke_polyline([0, 0, 10, 0], {width: 6, cap: 'round'});
        const pts = points_of(out[0]);
        for (const [x, y] of pts) {
            const d = x < 0 ? Math.hypot(x, y) : x > 10 ? Math.hypot(x - 10, y) : Math.abs(y);
            near(d, 3, 1e-9, 'on the outline');
        }
        // Every chord's midpoint is within 0.01 px of the circle.
        for (let i = 0; i < pts.length; i++) {
            const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length];
            const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
            if (mx < 0) assert(3 - Math.hypot(mx, my) <= 0.01 + 1e-12, 'start cap chord');
            if (mx > 10) assert(3 - Math.hypot(mx - 10, my) <= 0.01 + 1e-12, 'end cap chord');
        }
        near(signed_area(out[0]), 60 + Math.PI * 9, 2 * Math.PI * 3 * 0.01, 'capsule area');
        const joint = stroke_polyline([0, 0, 10, 0, 10, 10], {width: 6, join: 'round'});
        const outer = points_of(joint[0]).filter(([x, y]) => x > 10 && y < 0);
        assert(outer.length > 3);
        for (const [x, y] of outer) near(Math.hypot(x - 10, y), 3, 1e-9, 'join arc');
    });

    test('options are validated', () => {
        assert.throws(() => stroke_polyline([0, 0, 1], {width: 1}), /even number/);
        assert.throws(() => stroke_polyline([0, 0, 1, NaN], {width: 1}), /finite/);
        assert.throws(() => stroke_polyline([0, 0, 1, 1], {width: -1}), /width/);
        assert.throws(() => stroke_polyline([0, 0, 1, 1], {width: 1, join: 'arcs'}), /join/);
        assert.throws(() => stroke_polyline([0, 0, 1, 1], {width: 1, cap: 'flat'}), /cap/);
        assert.throws(() => stroke_polyline([0, 0, 1, 1], {width: 1, miter_limit: 0.5}), /miter_limit/);
        assert.throws(() => stroke_polyline(null, {width: 1}), /points/);
        // Typed arrays and point pairs are accepted.
        assert.deepStrictEqual(stroke_polyline(new Float64Array([1, 2, 11, 2]), {width: 4}),
            stroke_polyline([[1, 2], [11, 2]], {width: 4}));
    });

    return {passed, failed};
};

if (require.main === module) {
    const {passed, failed} = runRasterStrokePolylineTests();
    console.log(`\nTest summary: ${passed} passed, ${failed} failed.`);
    process.exit(failed > 0 ? 1 : 0);
}

module.exports = runRasterStrokePolylineTests;
