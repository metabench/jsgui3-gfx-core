'use strict';

const assert = require('assert');
const {Pixel_Buffer} = require('../core/gfx-core');
const {fill_polygons} = require('../core/raster/fill-polygons');

// Small seeded PRNG so every run draws the same shapes.
const mulberry32 = seed => () => {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const make = (w, h, bipp, fill) => {
    const pb = new Pixel_Buffer({size: [w, h], bits_per_pixel: bipp});
    if (fill !== undefined) pb.color_whole(fill);
    return pb;
};

const same_bytes = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

// A star with fractional vertices, centred on (cx, cy).
const star = (random, cx, cy, r, points) => {
    const flat = [];
    for (let i = 0; i < points * 2; i++) {
        const radius = (i % 2 === 0 ? r : r * (0.35 + 0.3 * random()));
        const t = Math.PI * i / points + random() * 0.2;
        flat.push(cx + radius * Math.cos(t), cy + radius * Math.sin(t));
    }
    return flat;
};

// Copy rows/columns of a buffer's pixels (w x h window at x0, y0).
const crop_bytes = (pb, x0, y0, w, h) => {
    const bypp = pb.bipp >> 3;
    const out = new Uint8Array(w * h * bypp);
    for (let y = 0; y < h; y++) {
        const start = (y0 + y) * pb.bytes_per_row + x0 * bypp;
        out.set(pb.ta.subarray(start, start + w * bypp), y * w * bypp);
    }
    return out;
};

const runRasterFillPolygonsTests = () => {
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

    console.log('Running fill_polygons (integer coverage) tests...');

    test('pixel-aligned squares fill exactly at 8, 24 and 32bpp', () => {
        for (const [bipp, color, blank] of [
            [8, 200, [0]],
            [24, [10, 20, 30], [0, 0, 0]],
            [32, [10, 20, 30, 255], [0, 0, 0, 0]]
        ]) {
            const pb = make(5, 4, bipp);
            const returned = pb.fill_polygons([[1, 1, 4, 1, 4, 3, 1, 3]], color);
            assert.strictEqual(returned, pb);
            const bypp = bipp >> 3;
            for (let y = 0; y < 4; y++) {
                for (let x = 0; x < 5; x++) {
                    const inside = x >= 1 && x < 4 && y >= 1 && y < 3;
                    const got = [...pb.ta.subarray((y * 5 + x) * bypp, (y * 5 + x + 1) * bypp)];
                    const want = inside ? (bipp === 8 ? [color] : color) : blank;
                    assert.deepStrictEqual(got, want, `${bipp}bpp pixel ${x},${y}`);
                }
            }
        }
    });

    test('partial pixels get their exact area, whatever the winding direction', () => {
        const cw = make(4, 4, 8);
        fill_polygons(cw, [[0.5, 0.5, 2.5, 0.5, 2.5, 2.5, 0.5, 2.5]], 255);
        assert.deepStrictEqual([...cw.ta], [
            64, 128, 64, 0,
            128, 255, 128, 0,
            64, 128, 64, 0,
            0, 0, 0, 0
        ]);
        const ccw = make(4, 4, 8);
        fill_polygons(ccw, [[0.5, 0.5, 0.5, 2.5, 2.5, 2.5, 2.5, 0.5]], 255);
        assert.deepStrictEqual([...ccw.ta], [...cw.ta]);
        const pairs = make(4, 4, 8);
        fill_polygons(pairs, [[[0.5, 0.5], [2.5, 0.5], [2.5, 2.5], [0.5, 2.5]]], 255);
        assert.deepStrictEqual([...pairs.ta], [...cw.ta]);
    });

    test('total coverage equals the polygon area', () => {
        const random = mulberry32(7);
        for (let k = 0; k < 20; k++) {
            const pb = make(40, 40, 8);
            const flat = [];
            for (let i = 0; i < 3; i++) flat.push(2 + 36 * random(), 2 + 36 * random());
            fill_polygons(pb, [flat], 255);
            let sum = 0;
            for (const v of pb.ta) sum += v;
            const [ax, ay, bx, by, cx, cy] = flat;
            const area = Math.abs((bx - ax) * (cy - ay) - (cx - ax) * (by - ay)) / 2;
            // Each pixel is rounded to 1/255 and each vertex to 1/4096 px.
            const edge_pixels = 2 * (Math.hypot(bx - ax, by - ay) + Math.hypot(cx - bx, cy - by) + Math.hypot(ax - cx, ay - cy));
            assert(Math.abs(sum / 255 - area) <= 0.5 / 255 * edge_pixels + 0.05, `area ${area} got ${sum / 255}`);
        }
    });

    test('two abutting triangles in one call give 255 on the shared edge (no conflation)', () => {
        const union = make(8, 8, 8);
        fill_polygons(union, [[0, 0, 8, 0, 8, 8], [0, 0, 8, 8, 0, 8]], 255);
        assert(union.ta.every(v => v === 255));
        // Separate calls composite coverage twice: the diagonal drops to 192.
        const separate = make(8, 8, 8);
        fill_polygons(separate, [[0, 0, 8, 0, 8, 8]], 255);
        fill_polygons(separate, [[0, 0, 8, 8, 0, 8]], 255);
        assert.strictEqual(Math.min(...separate.ta), 192);
        // Fractional shared edge as well.
        const frac = make(10, 10, 24, [0, 0, 0]);
        fill_polygons(frac, [[0.3, 0.2, 9.7, 1.1, 5.2, 9.9], [0.3, 0.2, 5.2, 9.9, 0.1, 6.3]], [255, 255, 255]);
        const alone = make(10, 10, 24, [0, 0, 0]);
        fill_polygons(alone, [[0.3, 0.2, 9.7, 1.1, 5.2, 9.9, 0.1, 6.3]], [255, 255, 255]);
        assert(same_bytes(frac.ta, alone.ta));
    });

    test('overlaps union by clamping and an opposite ring cuts a hole', () => {
        const pb = make(10, 10, 8);
        fill_polygons(pb, [[1, 1, 7, 1, 7, 7, 1, 7], [3.5, 3.5, 9, 3.5, 9, 9, 3.5, 9]], 255);
        const ref = make(10, 10, 8);
        fill_polygons(ref, [[1, 1, 7, 1, 7, 3.5, 9, 3.5, 9, 9, 3.5, 9, 3.5, 7, 1, 7]], 255);
        assert(same_bytes(pb.ta, ref.ta));
        const hole = make(10, 10, 8);
        fill_polygons(hole, [[1, 1, 9, 1, 9, 9, 1, 9], [3, 3, 3, 7, 7, 7, 7, 3]], 255);
        assert.strictEqual(hole.ta[5 * 10 + 5], 0);
        assert.strictEqual(hole.ta[2 * 10 + 2], 255);
    });

    test('an integer offset translates pixels exactly', () => {
        const random = mulberry32(11);
        for (let k = 0; k < 20; k++) {
            const poly = star(random, 10 + 5 * random(), 10 + 5 * random(), 3 + 7 * random(), 5 + (k % 4));
            const ox = Math.floor(random() * 20) - 3, oy = Math.floor(random() * 20) - 3;
            const a = make(45, 45, 24, [9, 9, 9]);
            fill_polygons(a, [poly], [200, 100, 50], {offset: [ox, oy]});
            const shifted = poly.map((v, i) => v + (i % 2 ? oy : ox));
            const b = make(45, 45, 24, [9, 9, 9]);
            fill_polygons(b, [shifted], [200, 100, 50]);
            // Shifting the coordinates in floating point can move a vertex by one
            // 1/4096 step, so compare with the same shape drawn one pixel over in
            // an offset window: both use exact integer offsets.
            const c = make(45, 45, 24, [9, 9, 9]);
            fill_polygons(c, [poly], [200, 100, 50], {offset: [ox + 1, oy]});
            assert(same_bytes(crop_bytes(a, 0, 0, 44, 45), crop_bytes(c, 1, 0, 44, 45)));
            // The float-shifted copy agrees except possibly at single-step edges.
            let maxd = 0;
            for (let i = 0; i < a.ta.length; i++) maxd = Math.max(maxd, Math.abs(a.ta[i] - b.ta[i]));
            assert(maxd <= 3, `max ${maxd}`);
        }
    });

    test('bands and windows are byte-identical to the whole render', () => {
        const random = mulberry32(23);
        const shapes = [];
        for (let k = 0; k < 12; k++) {
            shapes.push({
                polygons: [star(random, 60 * random(), 50 * random(), 4 + 14 * random(), 5 + (k % 5))],
                color: [Math.floor(255 * random()), Math.floor(255 * random()), Math.floor(255 * random())]
            });
        }
        const W = 61, H = 53, ground = [240, 230, 210];
        const whole = make(W, H, 24, ground);
        for (const s of shapes) whole.fill_polygons(s.polygons, s.color);
        // bands of varying height
        for (let y0 = 0; y0 < H;) {
            const h = Math.min(H - y0, 1 + Math.floor(random() * 11));
            const band = make(W, h, 24, ground);
            for (const s of shapes) band.fill_polygons(s.polygons, s.color, {offset: [0, -y0]});
            assert(same_bytes(band.ta, crop_bytes(whole, 0, y0, W, h)), `band at ${y0}`);
            y0 += h;
        }
        // random windows
        for (let k = 0; k < 60; k++) {
            const w = 1 + Math.floor(random() * 30), h = 1 + Math.floor(random() * 30);
            const x0 = Math.floor(random() * (W - w + 1)), y0 = Math.floor(random() * (H - h + 1));
            const win = make(w, h, 24, ground);
            for (const s of shapes) win.fill_polygons(s.polygons, s.color, {offset: [-x0, -y0]});
            assert(same_bytes(win.ta, crop_bytes(whole, x0, y0, w, h)), `window ${x0},${y0} ${w}x${h}`);
        }
    });

    test('clip limits writing to its rectangle and keeps the pixels inside it', () => {
        const poly = [[2.2, 1.3, 27.8, 4.1, 20.4, 18.7, 3.9, 14.2]];
        const whole = make(30, 20, 32, [5, 6, 7, 255]);
        fill_polygons(whole, poly, [250, 120, 30]);
        const clipped = make(30, 20, 32, [5, 6, 7, 255]);
        fill_polygons(clipped, poly, [250, 120, 30], {clip: [7, 3, 19, 15]});
        for (let y = 0; y < 20; y++) {
            for (let x = 0; x < 30; x++) {
                const i = (y * 30 + x) * 4;
                const inside = x >= 7 && x < 19 && y >= 3 && y < 15;
                const want = inside ? [...whole.ta.subarray(i, i + 4)] : [5, 6, 7, 255];
                assert.deepStrictEqual([...clipped.ta.subarray(i, i + 4)], want, `${x},${y}`);
            }
        }
    });

    test('tall renders split into accumulator strips without changing a pixel', () => {
        // 2100 x 1100 exceeds one strip of the accumulator budget.
        const poly = [[3.3, 2.7, 2090.2, 40.9, 1500.6, 1097.1, 20.8, 1080.4, 900.5, 540.25]];
        const whole = make(2100, 1100, 8);
        fill_polygons(whole, poly, 255);
        for (const [y0, h] of [[0, 300], [300, 450], [750, 350]]) {
            const band = make(2100, h, 8);
            fill_polygons(band, poly, 255, {offset: [0, -y0]});
            assert(same_bytes(band.ta, crop_bytes(whole, 0, y0, 2100, h)), `band ${y0}`);
        }
    });

    test('edges millions of pixels long stay exact (wide-integer path)', () => {
        // The long diagonal is y = x + 1229/4096 after quantisation in both
        // shapes; the huge triangle's crossing products exceed 2^52.
        const huge = make(20, 20, 8);
        fill_polygons(huge, [[-1e6, -1e6 + 0.3, 1e6, 1e6 + 0.3, 1e6, -1e6]], 255);
        const small = make(20, 20, 8);
        fill_polygons(small, [[-5, -4.7, 25, 25.3, 25, -5]], 255);
        assert(same_bytes(huge.ta, small.ta));
        assert(huge.ta.some(v => v > 0 && v < 255));
        // Far-away geometry brought back by an integer offset is also exact.
        const poly = [0.37, 0.61, 17.93, 2.29, 11.11, 14.63, 1.5, 9.1];
        const near = make(20, 20, 8);
        fill_polygons(near, [poly], 255);
        const far = make(20, 20, 8);
        const big = 3000000;
        fill_polygons(far, [poly.map((v, i) => v + (i % 2 ? big : -big))], 255, {offset: [big, -big]});
        assert(same_bytes(near.ta, far.ta));
    });

    test('blend over and replace at 8, 24 and 32bpp', () => {
        // 8bpp grey with alpha: half coverage of a 50% colour over 0.
        const g = make(2, 1, 8, 100);
        fill_polygons(g, [[0, 0, 1, 0, 1, 1, 0, 1]], [255, 128]);
        assert.deepStrictEqual([...g.ta], [178, 100]);
        // 24bpp: full coverage, colour alpha 128 over [0, 0, 0].
        const rgb = make(1, 1, 24, [0, 0, 0]);
        fill_polygons(rgb, [[0, 0, 1, 0, 1, 1, 0, 1]], [255, 255, 255, 128]);
        assert.deepStrictEqual([...rgb.ta], [128, 128, 128]);
        // 32bpp over a transparent destination keeps the colour and uses coverage as alpha.
        const t = make(2, 1, 32, [0, 0, 0, 0]);
        fill_polygons(t, [[0, 0, 1.5, 0, 1.5, 1, 0, 1]], [200, 100, 50]);
        assert.deepStrictEqual([...t.ta], [200, 100, 50, 255, 200, 100, 50, 128]);
        // 32bpp over an opaque destination blends and stays opaque.
        const o = make(1, 1, 32, [0, 0, 0, 255]);
        fill_polygons(o, [[0, 0, 0.5, 0, 0.5, 1, 0, 1]], [255, 255, 255]);
        assert.deepStrictEqual([...o.ta], [128, 128, 128, 255]);
        // replace writes the colour's alpha where coverage is full.
        const r = make(2, 1, 32, [9, 9, 9, 255]);
        fill_polygons(r, [[0, 0, 1, 0, 1, 1, 0, 1]], [1, 2, 3, 40], {blend: 'replace'});
        assert.deepStrictEqual([...r.ta], [1, 2, 3, 40, 9, 9, 9, 255]);
        // replace with a transparent colour erases in proportion to coverage.
        const e = make(1, 1, 32, [200, 100, 50, 255]);
        fill_polygons(e, [[0, 0, 0.5, 0, 0.5, 1, 0, 1]], [0, 0, 0, 0], {blend: 'replace'});
        assert.deepStrictEqual([...e.ta], [200, 100, 50, 127]);
        // A transparent colour with 'over' changes nothing.
        const n = make(1, 1, 24, [1, 2, 3]);
        fill_polygons(n, [[0, 0, 1, 0, 1, 1, 0, 1]], [9, 9, 9, 0]);
        assert.deepStrictEqual([...n.ta], [1, 2, 3]);
    });

    test('invalid input is rejected before any pixel is written', () => {
        const pb = make(4, 4, 24, [1, 1, 1]);
        const square = [[0, 0, 4, 0, 4, 4, 0, 4]];
        assert.throws(() => fill_polygons(make(8, 1, 1), square, 1), /8, 24 and 32bpp/);
        assert.throws(() => pb.fill_polygons([[0, 0, 4, 0, 4]], [9, 9, 9]), /even number/);
        assert.throws(() => pb.fill_polygons([[0, 0, NaN, 0, 4, 4]], [9, 9, 9]), /finite/);
        assert.throws(() => pb.fill_polygons(square, [9, 9, 9], {offset: [0.5, 0]}), /offset/);
        assert.throws(() => pb.fill_polygons(square, [9, 9, 9], {clip: [0, 0, 2]}), /clip/);
        assert.throws(() => pb.fill_polygons(square, [9, 9, 9], {blend: 'multiply'}), /blend/);
        assert.throws(() => pb.fill_polygons(square, [9, 9]), /Colour/);
        assert.throws(() => pb.fill_polygons(square, [9, 9, 300]), /0 to 255/);
        assert.throws(() => make(2, 2, 8).fill_polygons(square, [9, 9, 9]), /grey/);
        assert(pb.ta.every(v => v === 1));
        // Degenerate input is a no-op.
        pb.fill_polygons([], [9, 9, 9]);
        pb.fill_polygons([[0, 0, 4, 4]], [9, 9, 9]);
        pb.fill_polygons([[0, 1, 4, 1, 2, 1]], [9, 9, 9]);
        assert(pb.ta.every(v => v === 1));
    });

    return {passed, failed};
};

if (require.main === module) {
    const {passed, failed} = runRasterFillPolygonsTests();
    console.log(`\nTest summary: ${passed} passed, ${failed} failed.`);
    process.exit(failed > 0 ? 1 : 0);
}

module.exports = runRasterFillPolygonsTests;
