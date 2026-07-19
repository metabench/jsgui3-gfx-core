'use strict';

const assert = require('assert');
const {Pixel_Buffer} = require('../core/gfx-core');

const runPixelBufferAdvancedPropertyTests = () => {
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

    console.log('Running Pixel_Buffer advanced typed-array property tests...');

    test('scratch buffers are returned on first access and refreshed in place', () => {
        const image = new Pixel_Buffer({size: [3, 2], bits_per_pixel: 8});
        image.ta.set([1, 2, 3, 4, 5, 6]);

        const scratch = image.ta_scratch;
        assert(scratch instanceof Uint8Array);
        assert.notStrictEqual(scratch, image.ta);
        assert.deepStrictEqual([...scratch], [...image.ta]);

        image.ta[0] = 99;
        assert.strictEqual(image.ta_scratch, scratch);
        assert.strictEqual(scratch[0], 99);

        const rowScratch = image.ta_row_scratch;
        assert(rowScratch instanceof Uint8ClampedArray);
        assert.strictEqual(rowScratch.length, image.bytes_per_row);
        assert.strictEqual(image.ta_row_scratch, rowScratch);
    });

    test('coordinate and size scratch arrays widen with validated dimensions', () => {
        const narrow = new Pixel_Buffer({size: [32, 16], bits_per_pixel: 8});
        assert(narrow.ta_pos_scratch instanceof Int16Array);
        assert(narrow.ta_bounds instanceof Int16Array);
        assert(narrow.ta_size_scratch instanceof Uint16Array);

        const wide = new Pixel_Buffer({size: [70000, 1], bits_per_pixel: 8});
        assert(wide.ta_pos_scratch instanceof Int32Array);
        assert(wide.ta_pos_iterator instanceof Int32Array);
        assert(wide.ta_move_vector instanceof Int32Array);
        assert(wide.ta_bounds instanceof Int32Array);
        assert(wide.ta_bounds4_scratch instanceof Int32Array);
        assert(wide.ta_size_scratch instanceof Uint32Array);
        assert(wide.ta_size2_scratch instanceof Uint32Array);
    });

    test('colorspace metadata retains wide dimensions and canonical stride', () => {
        const image = new Pixel_Buffer({
            size: [40000, 1],
            bits_per_pixel: 24,
            rowAlignmentBytes: 16
        });
        assert.deepStrictEqual(
            [...image.ta_colorspace],
            [40000, 1, 3, 120000, 24, 960000]
        );
    });

    return {passed, failed};
};

if (require.main === module) {
    const {passed, failed} = runPixelBufferAdvancedPropertyTests();
    console.log(`\nTest summary: ${passed} passed, ${failed} failed.`);
    process.exit(failed > 0 ? 1 : 0);
}

module.exports = runPixelBufferAdvancedPropertyTests;
