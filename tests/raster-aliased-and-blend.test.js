'use strict';

const assert = require('assert');
const {Pixel_Buffer} = require('../core/gfx-core');
const {fill_polygon_aliased} = require('../core/raster/fill-polygon-aliased');

const make = (w, h, bipp, fill) => {
    const pb = new Pixel_Buffer({size: [w, h], bits_per_pixel: bipp});
    if (fill !== undefined) pb.color_whole(fill);
    return pb;
};
const on_pixels = pb => {
    const set = [];
    for (let y = 0; y < pb.size[1]; y++) {
        for (let x = 0; x < pb.size[0]; x++) if (pb.ta[y * pb.bytes_per_row + x]) set.push(`${x},${y}`);
    }
    return set;
};
const shifted = (pixels, dx, dy) => pixels.map(p => {
    const [x, y] = p.split(',').map(Number);
    return `${x + dx},${y + dy}`;
});
const mulberry32 = seed => () => {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const runRasterAliasedAndBlendTests = () => {
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

    console.log('Running fill_polygon_aliased and blend: over tests...');

    const square = x0 => [x0, 2.25, x0 + 4, 2.25, x0 + 4, 5.25, x0, 5.25];

    test('aliased fill: a 4 x 3 square fills the same 12 pixels wherever it sits (draw_polygon: 16 or 20)', () => {
        const at = x0 => {
            const pb = make(20, 10, 8);
            const returned = pb.fill_polygon_aliased(square(x0), 255);
            assert.strictEqual(returned, pb);
            return on_pixels(pb);
        };
        const a = at(1.3), b = at(11.3), c = at(9.3), d = at(-0.7);
        assert.strictEqual(a.length, 12);
        assert.deepStrictEqual(b, shifted(a, 10, 0));
        assert.deepStrictEqual(c, shifted(a, 8, 0));
        // At x0 = -0.7 one column of centres (x = -0.5) is off the buffer.
        assert.deepStrictEqual(d, shifted(a, -2, 0).filter(p => !p.startsWith('-')));
        assert.strictEqual(d.length, 9);
        // The public draw_polygon, for comparison (unchanged behaviour).
        const legacy = x0 => {
            const pb = make(20, 10, 8);
            pb.draw_polygon([[x0, 2.25], [x0 + 4, 2.25], [x0 + 4, 5.25], [x0, 5.25]], 255, true);
            return on_pixels(pb).length;
        };
        assert.deepStrictEqual([legacy(-0.7), legacy(9.3)], [16, 20]);
    });

    test('aliased fill: integer translation moves the pixel set exactly (random polygons, offset option)', () => {
        const random = mulberry32(3);
        for (let k = 0; k < 40; k++) {
            const flat = [];
            const n = 3 + (k % 6);
            for (let i = 0; i < n; i++) flat.push(3 + 20 * random(), 3 + 20 * random());
            const a = make(60, 60, 8), b = make(60, 60, 8);
            fill_polygon_aliased(a, flat, 1);
            const dx = Math.floor(random() * 30), dy = Math.floor(random() * 30);
            fill_polygon_aliased(b, flat, 1, {offset: [dx, dy]});
            assert.deepStrictEqual(on_pixels(b), shifted(on_pixels(a), dx, dy));
        }
    });

    test('aliased fill: centres on an edge count on the left and top only, so shared edges draw once', () => {
        const pb = make(5, 5, 8);
        fill_polygon_aliased(pb, [0.5, 0.5, 2.5, 0.5, 2.5, 2.5, 0.5, 2.5], 1);
        assert.deepStrictEqual(on_pixels(pb), ['0,0', '1,0', '0,1', '1,1']);
        // Two triangles sharing a diagonal through pixel centres: disjoint, union = square.
        const t1 = make(8, 8, 8), t2 = make(8, 8, 8);
        fill_polygon_aliased(t1, [0.5, 0.5, 6.5, 0.5, 6.5, 6.5], 1);
        fill_polygon_aliased(t2, [0.5, 0.5, 6.5, 6.5, 0.5, 6.5], 1);
        const p1 = new Set(on_pixels(t1)), p2 = on_pixels(t2);
        assert(p2.every(p => !p1.has(p)), 'no pixel drawn twice');
        assert.strictEqual(p1.size + p2.length, 36);
    });

    test('aliased fill: non-zero rule, no outline, rows outside untouched, all formats', () => {
        const star = [];
        for (let i = 0; i < 5; i++) {
            const t = -Math.PI / 2 + i * 4 * Math.PI / 5;
            star.push(10 + 8 * Math.cos(t), 10 + 8 * Math.sin(t));
        }
        const pb = make(21, 40, 8, 7);
        fill_polygon_aliased(pb, star, 200);
        assert.strictEqual(pb.ta[10 * pb.bytes_per_row + 10], 200, 'pentagram centre filled (non-zero)');
        for (let y = 19; y < 40; y++) {
            for (let x = 0; x < 21; x++) assert.strictEqual(pb.ta[y * pb.bytes_per_row + x], 7);
        }
        for (const [bipp, color, stored] of [[1, 1, null], [24, [1, 2, 3], [1, 2, 3]], [32, [1, 2, 3], [1, 2, 3, 255]], [32, [1, 2, 3, 4], [1, 2, 3, 4]]]) {
            const img = make(10, 10, bipp);
            fill_polygon_aliased(img, [2, 2, 8, 2, 8, 8, 2, 8], color);
            if (bipp === 1) {
                assert.strictEqual(img.get_pixel([5, 5]), 1);
                assert.strictEqual(img.get_pixel([1, 5]), 0);
            } else {
                assert.deepStrictEqual([...img.get_pixel([5, 5])], stored);
                assert.deepStrictEqual([...img.get_pixel([8, 5])], new Array(bipp / 8).fill(0));
            }
        }
        const clipped = make(10, 10, 8);
        fill_polygon_aliased(clipped, [0, 0, 10, 0, 10, 10, 0, 10], 1, {clip: [2, 3, 5, 9]});
        assert.strictEqual(on_pixels(clipped).length, 3 * 6);
        assert.throws(() => fill_polygon_aliased(make(4, 4, 24), [0, 0, 1, 0, 1, 1], 5), /24bpp colour/);
        assert.throws(() => fill_polygon_aliased(make(4, 4, 8), [0, 0, 1, 0, 1], 5), /even number/);
        assert.throws(() => fill_polygon_aliased(make(4, 4, 1), [0, 0, 1, 0, 1, 1], 2), /0 or 1/);
    });

    test('place_image_from_pixel_buffer blend: over composites 32bpp; the default copy is unchanged', () => {
        const dst = () => make(4, 1, 32, [200, 10, 10, 255]);
        const src = make(2, 1, 32);
        src.ta.set([0, 0, 255, 0, 0, 0, 255, 128]);
        const copied = dst().place_image_from_pixel_buffer(src, [1, 0]);
        assert.deepStrictEqual([...copied.ta], [200, 10, 10, 255, 0, 0, 255, 0, 0, 0, 255, 128, 200, 10, 10, 255]);
        const over = dst().place_image_from_pixel_buffer(src, [1, 0], {blend: 'over'});
        assert.deepStrictEqual([...over.ta], [200, 10, 10, 255, 200, 10, 10, 255, 100, 5, 133, 255, 200, 10, 10, 255]);
        const explicit = dst().place_image_from_pixel_buffer(src, [1, 0], {blend: 'replace'});
        assert.deepStrictEqual([...explicit.ta], [...copied.ta]);
        // Over a transparent destination the source is kept as it is.
        const clear = make(2, 1, 32);
        clear.place_image_from_pixel_buffer(src, [0, 0], {blend: 'over'});
        assert.deepStrictEqual([...clear.ta], [0, 0, 0, 0, 0, 0, 255, 128]);
        // Half over half: alpha 128 + 128 * 127 / 255 = 191.75; R = 255 * 32640 / 48896 = 170.2.
        const half = make(1, 1, 32, [0, 0, 255, 128]);
        const red = make(1, 1, 32, [255, 0, 0, 128]);
        half.place_image_from_pixel_buffer(red, [0, 0], {blend: 'over'});
        assert.deepStrictEqual([...half.ta], [170, 0, 85, 192]);
        // Clipping at negative positions.
        const edge = dst().place_image_from_pixel_buffer(src, [-1, 0], {blend: 'over'});
        assert.deepStrictEqual([...edge.ta.subarray(0, 4)], [100, 5, 133, 255]);
        // Formats without alpha copy; unknown modes are rejected.
        const rgb = make(3, 1, 24, [9, 9, 9]);
        rgb.place_image_from_pixel_buffer(make(1, 1, 24, [1, 2, 3]), [1, 0], {blend: 'over'});
        assert.deepStrictEqual([...rgb.ta], [9, 9, 9, 1, 2, 3, 9, 9, 9]);
        assert.throws(() => dst().place_image_from_pixel_buffer(src, [0, 0], {blend: 'multiply'}), /blend/);
    });

    return {passed, failed};
};

if (require.main === module) {
    const {passed, failed} = runRasterAliasedAndBlendTests();
    console.log(`\nTest summary: ${passed} passed, ${failed} failed.`);
    process.exit(failed > 0 ? 1 : 0);
}

module.exports = runRasterAliasedAndBlendTests;
