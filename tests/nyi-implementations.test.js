const assert = require('assert');
const { Pixel_Buffer } = require('../core/gfx-core');

const testNYIImplementations = () => {
    let passed = 0;
    let failed = 0;

    const runTest = (description, testFn) => {
        try {
            testFn();
            console.log(`  ${description}: ${'\x1b[32m✔ Passed\x1b[0m'}`);
            passed++;
        } catch (err) {
            console.log(`  ${description}: ${'\x1b[31m✘ Failed\x1b[0m'}`);
            console.error(`    ${err.message || err}`);
            failed++;
        }
    };

    // Helper: read all pixel values using get_pixel for a given buffer
    const readAllPixels8 = (pb) => {
        const vals = [];
        const pos = new Int16Array(2);
        for (let y = 0; y < pb.size[1]; y++) {
            for (let x = 0; x < pb.size[0]; x++) {
                pos[0] = x; pos[1] = y;
                vals.push(pb.get_pixel(pos));
            }
        }
        return vals;
    };

    console.log('Running NYI implementation tests...');

    // =========================================================================
    // to_8bipp() — 24→8
    // =========================================================================
    runTest('to_8bipp: 24bipp → 8bipp greyscale (pure white)', () => {
        const pb = new Pixel_Buffer({ size: [2, 2], bits_per_pixel: 24 });
        pb.ta.fill(255);
        const res = pb.to_8bipp();
        assert.strictEqual(res.bipp, 8, 'Result should be 8bipp');
        assert.strictEqual(res.size[0], 2);
        assert.strictEqual(res.size[1], 2);
        const vals = readAllPixels8(res);
        for (let i = 0; i < vals.length; i++) {
            assert.strictEqual(vals[i], 255, `Pixel ${i} should be 255`);
        }
    });

    runTest('to_8bipp: 24bipp → 8bipp greyscale (RGB color)', () => {
        const pb = new Pixel_Buffer({ size: [1, 1], bits_per_pixel: 24 });
        pb.ta[0] = 100; pb.ta[1] = 150; pb.ta[2] = 200;
        const res = pb.to_8bipp();
        assert.strictEqual(res.bipp, 8);
        const val = res.get_pixel(new Int16Array([0, 0]));
        assert.strictEqual(val, Math.round((100 + 150 + 200) / 3));
    });

    runTest('to_8bipp: 24bipp → 8bipp greyscale (black)', () => {
        const pb = new Pixel_Buffer({ size: [3, 3], bits_per_pixel: 24 });
        pb.ta.fill(0);
        const res = pb.to_8bipp();
        assert.strictEqual(res.bipp, 8);
        const vals = readAllPixels8(res);
        for (let i = 0; i < vals.length; i++) {
            assert.strictEqual(vals[i], 0, `Pixel ${i} should be 0`);
        }
    });

    // =========================================================================
    // to_8bipp() — 32→8
    // =========================================================================
    runTest('to_8bipp: 32bipp → 8bipp (pure red, ignores alpha)', () => {
        const pb = new Pixel_Buffer({ size: [1, 1], bits_per_pixel: 32 });
        pb.ta[0] = 255; pb.ta[1] = 0; pb.ta[2] = 0; pb.ta[3] = 128;
        const res = pb.to_8bipp();
        assert.strictEqual(res.bipp, 8);
        assert.strictEqual(res.get_pixel(new Int16Array([0, 0])), Math.round(255 / 3));
    });

    runTest('to_8bipp: 32bipp → 8bipp (white with zero alpha)', () => {
        const pb = new Pixel_Buffer({ size: [2, 2], bits_per_pixel: 32 });
        const pos = new Int16Array(2);
        for (let y = 0; y < 2; y++) {
            for (let x = 0; x < 2; x++) {
                const byi = y * pb.bytes_per_row + x * 4;
                pb.ta[byi] = 255; pb.ta[byi + 1] = 255;
                pb.ta[byi + 2] = 255; pb.ta[byi + 3] = 0;
            }
        }
        const res = pb.to_8bipp();
        assert.strictEqual(res.bipp, 8);
        const vals = readAllPixels8(res);
        for (let i = 0; i < vals.length; i++) {
            assert.strictEqual(vals[i], 255, `Pixel ${i} should be 255`);
        }
    });

    // =========================================================================
    // to_24bipp() — 32→24
    // =========================================================================
    runTest('to_24bipp: 32bipp → 24bipp (drops alpha)', () => {
        const pb = new Pixel_Buffer({ size: [2, 1], bits_per_pixel: 32 });
        // pixel 0: R=10, G=20, B=30, A=255
        pb.ta[0] = 10; pb.ta[1] = 20; pb.ta[2] = 30; pb.ta[3] = 255;
        // pixel 1: need to calculate correct index
        const byi1 = 1 * 4; // pixel 1 in row 0
        pb.ta[byi1] = 40; pb.ta[byi1 + 1] = 50; pb.ta[byi1 + 2] = 60; pb.ta[byi1 + 3] = 128;

        const res = pb.to_24bipp();
        assert.strictEqual(res.bipp, 24);
        assert.strictEqual(res.size[0], 2);
        assert.strictEqual(res.size[1], 1);
        // pixel 0
        const p0 = res.get_pixel(new Int16Array([0, 0]));
        assert.strictEqual(p0[0], 10); assert.strictEqual(p0[1], 20); assert.strictEqual(p0[2], 30);
        // pixel 1
        const p1 = res.get_pixel(new Int16Array([1, 0]));
        assert.strictEqual(p1[0], 40); assert.strictEqual(p1[1], 50); assert.strictEqual(p1[2], 60);
    });

    runTest('to_24bipp: 32bipp → 24bipp correct pixel count', () => {
        const pb = new Pixel_Buffer({ size: [4, 4], bits_per_pixel: 32 });
        // Fill all actual pixels with value 128
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                const byi = y * pb.bytes_per_row + x * 4;
                pb.ta[byi] = 128; pb.ta[byi + 1] = 128;
                pb.ta[byi + 2] = 128; pb.ta[byi + 3] = 128;
            }
        }
        const res = pb.to_24bipp();
        assert.strictEqual(res.bipp, 24);
        assert.strictEqual(res.num_px, 16);
    });

    // =========================================================================
    // color_rect()
    // =========================================================================
    runTest('color_rect: 8bipp fills rectangle area', () => {
        const pb = new Pixel_Buffer({ size: [10, 10], bits_per_pixel: 8 });
        pb.ta.fill(0);
        pb.color_rect([2, 2, 5, 5], 200);
        assert.strictEqual(pb.get_pixel(new Int16Array([2, 2])), 200, 'Inside rect should be 200');
        assert.strictEqual(pb.get_pixel(new Int16Array([4, 4])), 200, 'Inside rect should be 200');
        assert.strictEqual(pb.get_pixel(new Int16Array([0, 0])), 0, 'Outside rect should be 0');
        assert.strictEqual(pb.get_pixel(new Int16Array([5, 5])), 0, 'Past exclusive end should be 0');
    });

    runTest('color_rect: 24bipp fills rectangle area', () => {
        const pb = new Pixel_Buffer({ size: [8, 8], bits_per_pixel: 24 });
        pb.ta.fill(0);
        const red = new Uint8ClampedArray([255, 0, 0]);
        pb.color_rect([1, 1, 4, 4], red);
        const inside = pb.get_pixel(new Int16Array([2, 2]));
        assert.strictEqual(inside[0], 255, 'R inside should be 255');
        assert.strictEqual(inside[1], 0, 'G inside should be 0');
        assert.strictEqual(inside[2], 0, 'B inside should be 0');
        const outside = pb.get_pixel(new Int16Array([0, 0]));
        assert.strictEqual(outside[0], 0, 'R outside should be 0');
    });

    runTest('color_rect: 32bipp fills rectangle area', () => {
        const pb = new Pixel_Buffer({ size: [8, 8], bits_per_pixel: 32 });
        pb.ta.fill(0);
        const red_alpha = new Uint8ClampedArray([255, 0, 0, 200]);
        pb.color_rect([2, 2, 6, 6], red_alpha);
        // Check inside pixel at (3, 2)
        const byi = (2 * pb.bytes_per_row) + (3 * 4);
        assert.strictEqual(pb.ta[byi], 255, 'R inside');
        assert.strictEqual(pb.ta[byi + 1], 0, 'G inside');
        assert.strictEqual(pb.ta[byi + 2], 0, 'B inside');
        assert.strictEqual(pb.ta[byi + 3], 200, 'A inside');
        assert.strictEqual(pb.ta[0], 0, 'Outside should be 0');
    });

    runTest('color_rect: 1bipp fills rectangle area', () => {
        const pb = new Pixel_Buffer({ size: [16, 16], bits_per_pixel: 1 });
        pb.ta.fill(0);
        pb.color_rect([2, 2, 6, 6], 1);
        assert.strictEqual(pb.get_pixel(new Int16Array([3, 3])), 1, 'Inside rect should be 1');
        assert.strictEqual(pb.get_pixel(new Int16Array([0, 0])), 0, 'Outside rect should be 0');
    });

    // =========================================================================
    // split_rgb_channels — 8bipp
    // =========================================================================
    runTest('split_rgb_channels: 8bipp returns 3 identical clones', () => {
        const pb = new Pixel_Buffer({ size: [4, 4], bits_per_pixel: 8 });
        const pos = new Int16Array(2);
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                pos[0] = x; pos[1] = y;
                pb.set_pixel(pos, (y * 4 + x) * 10);
            }
        }
        const [r, g, b] = pb.split_rgb_channels;
        assert.strictEqual(r.bipp, 8);
        assert.strictEqual(g.bipp, 8);
        assert.strictEqual(b.bipp, 8);
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                pos[0] = x; pos[1] = y;
                const expected = pb.get_pixel(pos);
                assert.strictEqual(r.get_pixel(pos), expected, `R channel (${x},${y})`);
                assert.strictEqual(g.get_pixel(pos), expected, `G channel (${x},${y})`);
                assert.strictEqual(b.get_pixel(pos), expected, `B channel (${x},${y})`);
            }
        }
        // Modifying one clone should not affect others
        r.set_pixel(new Int16Array([0, 0]), 99);
        assert.notStrictEqual(g.get_pixel(new Int16Array([0, 0])), 99, 'Clones should be independent');
    });

    // =========================================================================
    // to_32bit_rgba() — 24→32
    // =========================================================================
    runTest('to_32bit_rgba: 24bipp → 32bipp (adds alpha 255)', () => {
        const pb = new Pixel_Buffer({ size: [2, 1], bits_per_pixel: 24 });
        // Set pixel 0 at byte index 0
        pb.ta[0] = 10; pb.ta[1] = 20; pb.ta[2] = 30;
        // Set pixel 1 at byte index 3
        pb.ta[3] = 40; pb.ta[4] = 50; pb.ta[5] = 60;
        const res = pb.to_32bit_rgba();
        assert.strictEqual(res.bipp, 32);
        // pixel 0 — at byte index 0
        assert.strictEqual(res.ta[0], 10); assert.strictEqual(res.ta[1], 20);
        assert.strictEqual(res.ta[2], 30); assert.strictEqual(res.ta[3], 255);
        // pixel 1 — at byte index 4
        assert.strictEqual(res.ta[4], 40); assert.strictEqual(res.ta[5], 50);
        assert.strictEqual(res.ta[6], 60); assert.strictEqual(res.ta[7], 255);
    });

    // =========================================================================
    // to_32bit_rgba() — 32→32
    // =========================================================================
    runTest('to_32bit_rgba: 32bipp → 32bipp (returns clone)', () => {
        const pb = new Pixel_Buffer({ size: [2, 2], bits_per_pixel: 32 });
        pb.ta[0] = 10; pb.ta[1] = 20; pb.ta[2] = 30; pb.ta[3] = 100;
        const res = pb.to_32bit_rgba();
        assert.strictEqual(res.bipp, 32);
        assert.strictEqual(res.ta[0], 10);
        assert.strictEqual(res.ta[3], 100, 'Alpha should be preserved');
        res.ta[0] = 99;
        assert.strictEqual(pb.ta[0], 10, 'Original should not be mutated');
    });

    // =========================================================================
    // Roundtrip tests
    // =========================================================================
    runTest('Roundtrip: 24bipp → 8bipp → 24bipp preserves greyscale', () => {
        const pb24 = new Pixel_Buffer({ size: [4, 4], bits_per_pixel: 24 });
        const pos = new Int16Array(2);
        const grey = new Uint8ClampedArray([128, 128, 128]);
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                pos[0] = x; pos[1] = y;
                pb24.set_pixel(pos, grey);
            }
        }
        const pb8 = pb24.to_8bipp();
        const pb24b = pb8.to_24bipp();
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                pos[0] = x; pos[1] = y;
                const px = pb24b.get_pixel(pos);
                assert.strictEqual(px[0], 128, `R at (${x},${y})`);
                assert.strictEqual(px[1], 128, `G at (${x},${y})`);
                assert.strictEqual(px[2], 128, `B at (${x},${y})`);
            }
        }
    });

    runTest('Roundtrip: 32bipp → 24bipp → 32bipp preserves RGB', () => {
        const pb32 = new Pixel_Buffer({ size: [2, 2], bits_per_pixel: 32 });
        pb32.ta[0] = 10; pb32.ta[1] = 20; pb32.ta[2] = 30; pb32.ta[3] = 255;
        const byi1 = 1 * 4;
        pb32.ta[byi1] = 40; pb32.ta[byi1 + 1] = 50; pb32.ta[byi1 + 2] = 60; pb32.ta[byi1 + 3] = 128;
        const pb24 = pb32.to_24bipp();
        const pb32b = pb24.to_32bit_rgba();
        // pixel 0
        assert.strictEqual(pb32b.ta[0], 10); assert.strictEqual(pb32b.ta[1], 20);
        assert.strictEqual(pb32b.ta[2], 30); assert.strictEqual(pb32b.ta[3], 255);
        // pixel 1
        assert.strictEqual(pb32b.ta[byi1], 40); assert.strictEqual(pb32b.ta[byi1 + 1], 50);
        assert.strictEqual(pb32b.ta[byi1 + 2], 60); assert.strictEqual(pb32b.ta[byi1 + 3], 255);
    });

    return { passed, failed };
};

module.exports = testNYIImplementations;
