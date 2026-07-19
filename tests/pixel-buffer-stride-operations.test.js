'use strict';

const assert = require('assert');
const {Pixel_Buffer} = require('../core/gfx-core');

const runPixelBufferStrideOperationTests = () => {
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

    const pb = (width, height, bitsPerPixel, rowAlignmentBytes) => new Pixel_Buffer({
        size: [width, height],
        bits_per_pixel: bitsPerPixel,
        rowAlignmentBytes
    });

    const asArray = value => (
        typeof value === 'number' ? value : [...value]
    );

    console.log('Running padded-row Pixel_Buffer operation tests...');

    test('8/24/32bipp accessors and spans honor padded row strides', () => {
        const cases = [
            {bipp: 8, alignment: 4, bypp: 1, colors: [11, 22, 33]},
            {
                bipp: 24,
                alignment: 4,
                bypp: 3,
                colors: [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
            },
            {
                bipp: 32,
                alignment: 8,
                bypp: 4,
                colors: [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]
            }
        ];

        for (const {bipp, alignment, bypp, colors} of cases) {
            const image = pb(3, 2, bipp, alignment);
            const [first, second, lineColor] = colors;

            image.set_pixel([2, 0], first);
            image.set_pixel_by_idx(3, second);
            assert.deepStrictEqual(asArray(image.get_pixel([2, 0])), first);
            assert.deepStrictEqual(asArray(image.get_pixel_by_idx(3)), second);

            image.draw_horizontal_line([0, 2], 1, lineColor);
            for (let x = 0; x < 3; x++) {
                assert.deepStrictEqual(asArray(image.get_pixel([x, 1])), lineColor);
            }

            const expectedIndexes = [];
            for (let y = 0; y < 2; y++) {
                for (let x = 0; x < 3; x++) {
                    expectedIndexes.push(y * image.bytes_per_row + x * bypp);
                }
            }
            const indexes = [];
            image.each_pixel_byte_index(index => indexes.push(index));
            assert.deepStrictEqual(indexes, expectedIndexes);

            for (let y = 0; y < 2; y++) {
                const paddingStart = y * image.bytes_per_row + 3 * bypp;
                const paddingEnd = (y + 1) * image.bytes_per_row;
                assert.deepStrictEqual(
                    [...image.ta.subarray(paddingStart, paddingEnd)],
                    new Array(paddingEnd - paddingStart).fill(0)
                );
            }
        }
    });

    test('each_pixel skips aligned RGB padding', () => {
        const image = pb(2, 2, 24, 8);
        const colors = [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9],
            [10, 11, 12]
        ];
        colors.forEach((color, index) => image.set_pixel_by_idx(index, color));

        const seen = [];
        image.each_pixel((pos, color) => {
            seen.push([[pos[0], pos[1]], [...color]]);
        });
        assert.deepStrictEqual(seen, [
            [[0, 0], colors[0]],
            [[1, 0], colors[1]],
            [[0, 1], colors[2]],
            [[1, 1], colors[3]]
        ]);
    });

    test('clone and blank_copy preserve the complete layout without sharing storage', () => {
        const supplied = new Uint8Array(32);
        const image = new Pixel_Buffer({
            size: [3, 2],
            bits_per_pixel: 24,
            rowAlignmentBytes: 4,
            ta: supplied
        });
        image.color_whole([9, 8, 7]);
        image.storage.fill(0xA5, image.layout.logicalByteLength);

        const sharedView = new Pixel_Buffer(image);
        assert.strictEqual(sharedView.storage, image.storage);
        assert.deepStrictEqual(sharedView.layout, image.layout);

        const clone = image.clone();
        assert.notStrictEqual(clone.storage, image.storage);
        assert.deepStrictEqual(clone.layout, image.layout);
        assert.deepStrictEqual([...clone.storage], [...image.storage]);

        clone.set_pixel([0, 0], [1, 2, 3]);
        assert.deepStrictEqual([...image.get_pixel([0, 0])], [9, 8, 7]);

        const blank = image.blank_copy();
        assert.strictEqual(blank.bytes_per_row, image.bytes_per_row);
        assert.strictEqual(blank.layout.capacityByteLength, image.layout.capacityByteLength);
        assert.deepStrictEqual([...blank.storage], new Array(32).fill(0));
    });

    test('conversions, channels, and 32bipp placement skip row padding', () => {
        const grey = pb(3, 2, 8, 4);
        [10, 20, 30, 40, 50, 60].forEach((value, index) => {
            grey.set_pixel_by_idx(index, value);
        });
        const rgbFromGrey = grey.to_24bipp();
        for (let index = 0; index < 6; index++) {
            const value = (index + 1) * 10;
            assert.deepStrictEqual([...rgbFromGrey.get_pixel_by_idx(index)], [value, value, value]);
        }

        const rgb = pb(2, 2, 24, 8);
        const colors = [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12]];
        colors.forEach((color, index) => rgb.set_pixel_by_idx(index, color));
        const channels = rgb.split_rgb_channels;
        assert.deepStrictEqual([...channels[0].ta], [1, 4, 7, 10]);
        assert.deepStrictEqual([...channels[1].ta], [2, 5, 8, 11]);
        assert.deepStrictEqual([...channels[2].ta], [3, 6, 9, 12]);
        assert.deepStrictEqual([...rgb.extract_channel(1).ta], [2, 5, 8, 11]);

        const rgba = rgb.add_alpha_channel();
        colors.forEach((color, index) => {
            assert.deepStrictEqual([...rgba.get_pixel_by_idx(index)], [...color, 255]);
        });

        const source = pb(2, 2, 32, 16);
        const sourceColors = [
            [1, 2, 3, 4],
            [5, 6, 7, 8],
            [9, 10, 11, 12],
            [13, 14, 15, 16]
        ];
        sourceColors.forEach((color, index) => source.set_pixel_by_idx(index, color));
        const target = pb(4, 3, 32, 32);
        target.place_image_from_pixel_buffer(source, [1, 1]);
        for (let y = 0; y < 2; y++) {
            for (let x = 0; x < 2; x++) {
                assert.deepStrictEqual(
                    [...target.get_pixel([x + 1, y + 1])],
                    sourceColors[y * 2 + x]
                );
            }
        }
    });

    test('flood fill and color replacement cover logical pixels but preserve padding', () => {
        const cases = [
            {bipp: 8, alignment: 4, source: 10, replacement: [20]},
            {bipp: 24, alignment: 4, source: [1, 2, 3], replacement: [9, 8, 7]},
            {bipp: 32, alignment: 8, source: [1, 2, 3, 4], replacement: [9, 8, 7, 6]}
        ];
        for (const {bipp, alignment, source, replacement} of cases) {
            const image = pb(3, 2, bipp, alignment);
            image.color_whole(source);
            image.flood_fill(0, 0, ...replacement);
            for (let y = 0; y < 2; y++) {
                for (let x = 0; x < 3; x++) {
                    const expected = bipp === 8 ? replacement[0] : replacement;
                    assert.deepStrictEqual(asArray(image.get_pixel([x, y])), expected);
                }
                assert.deepStrictEqual(
                    [...image.ta.subarray(
                        y * image.bytes_per_row + image.layout.rowDataBytes,
                        (y + 1) * image.bytes_per_row
                    )],
                    new Array(image.bytes_per_row - image.layout.rowDataBytes).fill(0)
                );
            }
        }

        const grey = pb(3, 2, 8, 4);
        grey.self_replace_color(0, 9);
        for (let y = 0; y < 2; y++) {
            assert.deepStrictEqual(
                [...grey.ta.subarray(y * 4, y * 4 + 4)],
                [9, 9, 9, 0]
            );
        }

        const rgba = pb(3, 2, 32, 16);
        rgba.color_whole([1, 2, 3, 4]);
        assert.strictEqual(rgba.count_pixels_with_color(1, 2, 3, 4), 6);
        assert.strictEqual(rgba.count_pixels_with_color(0, 0, 0, 0), 0);
    });

    test('mask and callback iterators use payload offsets on padded rows', () => {
        const image = pb(3, 2, 24, 4);
        const colors = [
            [0, 1, 2], [1, 2, 3], [0, 3, 4],
            [1, 4, 5], [1, 5, 6], [0, 6, 7]
        ];
        colors.forEach((color, index) => image.set_pixel_by_idx(index, color));
        const mask = image.mask_each_pixel(color => color[0] === 1);
        assert.deepStrictEqual(
            Array.from({length: 6}, (_, index) => mask.get_pixel_by_idx(index)),
            [0, 1, 0, 1, 1, 0]
        );

        const pos = new Int32Array(2);
        const value = new Uint8ClampedArray(3);
        const info = new Uint32Array(4);
        let logicalIndex = 0;
        image.each_ta_24bipp(pos, value, info, update => {
            if (logicalIndex === 3) {
                value.set([20, 21, 22]);
                update();
            }
            logicalIndex++;
        });
        assert.deepStrictEqual([...image.get_pixel([0, 1])], [20, 21, 22]);
        assert.deepStrictEqual([...image.ta.subarray(9, 12)], [0, 0, 0]);

        const convolutionTarget = pb(5, 5, 24, 16);
        const indexes = [];
        convolutionTarget.padded_each_pixel_index(1, index => indexes.push(index));
        assert.deepStrictEqual(indexes, [
            19, 22, 25,
            35, 38, 41,
            51, 54, 57
        ]);
    });

    test('legacy RGBA scans skip padding and report exact coordinates', () => {
        const image = pb(3, 2, 32, 16);
        const matching = [1, 2, 3, 4];
        const other = [8, 7, 6, 5];
        [matching, other, other, other, other, matching].forEach((color, index) => {
            image.set_pixel_by_idx(index, color);
        });

        assert.deepStrictEqual(image.get_first_pixel_matching_color(...matching), [0, 0]);
        assert.deepStrictEqual(image.get_first_pixel_matching_color(...other), [1, 0]);
        assert.strictEqual(image.get_first_pixel_matching_color(9, 9, 9, 9), undefined);

        const rgbaMask = image.__get_single_color_mask_32(...matching);
        const byteMask = image.__get_single_color_mask(...matching);
        for (let index = 0; index < 6; index++) {
            const isMatch = index === 0 || index === 5;
            assert.deepStrictEqual(
                [...rgbaMask.get_pixel_by_idx(index)],
                isMatch ? [0, 0, 0, 255] : [255, 255, 255, 255]
            );
            assert.strictEqual(byteMask.get_pixel_by_idx(index), isMatch ? 255 : 0);
        }

        image._replace_color(...matching, 10, 20, 30, 40);
        assert.deepStrictEqual([...image.get_pixel_by_idx(0)], [10, 20, 30, 40]);
        assert.deepStrictEqual([...image.get_pixel_by_idx(5)], [10, 20, 30, 40]);
        for (let y = 0; y < 2; y++) {
            assert.deepStrictEqual(
                [...image.ta.subarray(y * 16 + 12, (y + 1) * 16)],
                [0, 0, 0, 0]
            );
        }
    });

    test('threshold, packed conversion, lines, and mask blits remain row-local', () => {
        const grey = pb(9, 3, 8, 4);
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 9; x++) {
                grey.set_pixel([x, y], (x + y) % 3 === 0 ? 200 : 20);
            }
        }
        const binary = grey.get_1bipp_threshold_8bipp(128);
        const expanded = binary.to_8bipp();
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 9; x++) {
                const expectedBit = (x + y) % 3 === 0 ? 1 : 0;
                assert.strictEqual(binary.get_pixel([x, y]), expectedBit);
                assert.strictEqual(expanded.get_pixel([x, y]), expectedBit * 255);
            }
        }

        binary.draw_horizontal_line([0, 8], 1, 1);
        for (let x = 0; x < 9; x++) assert.strictEqual(binary.get_pixel([x, 1]), 1);
        assert.strictEqual(binary.ta[binary.bytes_per_row + 1] & 0x7F, 0);

        const sourceMask = pb(5, 2, 1, 4);
        sourceMask.set_pixel([0, 0], 1);
        sourceMask.set_pixel([4, 0], 1);
        sourceMask.draw_horizontal_line([1, 3], 1, 1);
        const targetMask = pb(9, 4, 1, 4);
        targetMask.draw_1bipp_pixel_buffer_mask_1bipp(sourceMask, [2, 1], 1);
        const expectedOn = new Set(['2,1', '6,1', '3,2', '4,2', '5,2']);
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 9; x++) {
                assert.strictEqual(
                    targetMask.get_pixel([x, y]),
                    expectedOn.has(`${x},${y}`) ? 1 : 0
                );
            }
        }
    });

    return {passed, failed};
};

if (require.main === module) {
    const {passed, failed} = runPixelBufferStrideOperationTests();
    console.log(`\nTest summary: ${passed} passed, ${failed} failed.`);
    process.exit(failed > 0 ? 1 : 0);
}

module.exports = runPixelBufferStrideOperationTests;
