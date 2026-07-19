'use strict';

const assert = require('assert');
const {Pixel_Buffer} = require('../core/gfx-core');
const Pixel_Buffer_Perf_Focus_Enh = require('../core/pixel-buffer-6-perf-focus-enh');
const Pixel_Pos_List = require('../core/pixel-pos-list');

const make = (width, height, bipp, rowAlignmentBytes = 1, extra = {}) =>
    new Pixel_Buffer({
        size: [width, height],
        bits_per_pixel: bipp,
        rowAlignmentBytes,
        ...extra
    });

const testPixelBufferLegacyHelpers = () => {
    let passed = 0;
    let failed = 0;

    const test = (description, fn) => {
        try {
            fn();
            passed++;
            console.log(`  ${description}: \x1b[32m✔ Passed\x1b[0m`);
        } catch (error) {
            failed++;
            console.log(`  ${description}: \x1b[31m✘ Failed\x1b[0m`);
            console.error(`    ${error.stack || error}`);
        }
    };

    console.log('Running Pixel Buffer legacy-helper tests...');

    test('mask_each_pixel and get_mask_each_px cover packed, grey and RGBA input', () => {
        const packed = make(10, 2, 1, 4);
        [0, 3, 8, 11, 19].forEach(index => packed.set_pixel_by_idx(index, 1));
        const inverse = packed.mask_each_pixel(value => value === 0);
        for (let index = 0; index < 20; index++) {
            assert.strictEqual(inverse.get_pixel_by_idx(index), packed.get_pixel_by_idx(index) ^ 1);
        }

        const grey = make(3, 2, 8, 4);
        [1, 2, 3, 4, 5, 6].forEach((value, index) => grey.set_pixel_by_idx(index, value));
        const even = grey.get_mask_each_px(value => (value & 1) === 0);
        assert.deepStrictEqual(
            Array.from({length: 6}, (_, index) => even.get_pixel_by_idx(index)),
            [0, 1, 0, 1, 0, 1]
        );

        const rgba = make(3, 2, 32, 16);
        for (let index = 0; index < 6; index++) rgba.set_pixel_by_idx(index, [index, 2, 3, 4]);
        const high = rgba.mask_each_pixel(color => color[0] >= 3);
        assert.deepStrictEqual(
            Array.from({length: 6}, (_, index) => high.get_pixel_by_idx(index)),
            [0, 0, 0, 1, 1, 1]
        );
    });

    test('apply_mask uses canonical pixel access and preserves source layout', () => {
        const source = make(4, 2, 8, 4);
        const mask = make(4, 2, 1, 4);
        for (let index = 0; index < 8; index++) source.set_pixel_by_idx(index, index + 10);
        [1, 4, 6].forEach(index => mask.set_pixel_by_idx(index, 1));

        const result = source.apply_mask(mask, 1);
        assert.deepStrictEqual(
            Array.from({length: 8}, (_, index) => result.get_pixel_by_idx(index)),
            [255, 11, 255, 255, 14, 255, 16, 255]
        );
        assert.strictEqual(result.bytes_per_row, source.bytes_per_row);
    });

    test('paint_solid_border handles every layout through horizontal spans', () => {
        const image = make(5, 4, 24, 4);
        image.color_whole([1, 2, 3]);
        const bordered = image.paint_solid_border(1, [9, 8, 7]);

        assert.deepStrictEqual([...bordered.get_pixel([0, 0])], [9, 8, 7]);
        assert.deepStrictEqual([...bordered.get_pixel([4, 2])], [9, 8, 7]);
        assert.deepStrictEqual([...bordered.get_pixel([2, 2])], [1, 2, 3]);
        assert.deepStrictEqual([...image.get_pixel([0, 0])], [1, 2, 3]);
        for (let y = 0; y < 4; y++) {
            assert.strictEqual(bordered.ta[y * bordered.bytes_per_row + 15], 0);
        }

        const packed = make(9, 3, 1, 4);
        const packedBorder = packed.paint_solid_border(1, 1);
        assert.deepStrictEqual(
            Array.from({length: 9}, (_, x) => packedBorder.get_pixel([x, 1])),
            [1, 0, 0, 0, 0, 0, 0, 0, 1]
        );
    });

    test('color_rect clips once across every edge and ignores distant rectangles', () => {
        for (const bipp of [1, 8, 24, 32]) {
            const image = make(5, 3, bipp, 8);
            const color = bipp === 1 ? 1
                : bipp === 8 ? 91
                    : bipp === 24 ? [91, 92, 93]
                        : [91, 92, 93, 94];
            image.color_rect([-2, -100, 3, 2], color);
            const beforeDistantRect = image.ta.slice();
            image.color_rect([40_000, 0, 40_001, 1], color);

            assert.deepStrictEqual(image.ta, beforeDistantRect);
            for (let y = 0; y < 3; y++) {
                for (let x = 0; x < 5; x++) {
                    const value = image.get_pixel([x, y]);
                    const expected = x < 3 && y < 2
                        ? color
                        : (bipp <= 8 ? 0 : new Array(bipp / 8).fill(0));
                    assert.deepStrictEqual(
                        typeof value === 'number' ? value : [...value],
                        expected
                    );
                }
            }
            for (let y = 0; y < 3; y++) {
                assert.deepStrictEqual(
                    [...image.ta.subarray(
                        y * image.bytes_per_row + image.layout.rowDataBytes,
                        (y + 1) * image.bytes_per_row
                    )],
                    new Array(image.bytes_per_row - image.layout.rowDataBytes).fill(0)
                );
            }
        }
    });

    test('crop and uncrop use row copies without treating padding as pixels', () => {
        const image = make(5, 4, 8, 4);
        for (let index = 0; index < 20; index++) image.set_pixel_by_idx(index, index + 1);
        const cropped = image.crop(1);
        assert.deepStrictEqual(
            Array.from({length: 6}, (_, index) => cropped.get_pixel_by_idx(index)),
            [7, 8, 9, 12, 13, 14]
        );

        const expanded = cropped.uncrop(1, 0);
        assert.strictEqual(expanded.size[0], 5);
        assert.strictEqual(expanded.size[1], 4);
        assert.deepStrictEqual(
            Array.from({length: 6}, (_, index) => expanded.get_pixel([1 + index % 3, 1 + Math.floor(index / 3)])),
            [7, 8, 9, 12, 13, 14]
        );

        const packed = make(5, 3, 1, 4);
        packed.set_pixel([2, 1], 1);
        const packedCrop = packed.crop(1);
        assert.strictEqual(packedCrop.get_pixel([1, 0]), 1);
        assert.strictEqual(packedCrop.uncrop(1, 0).get_pixel([2, 1]), 1);

        const positioned = make(5, 4, 8, 4);
        positioned.pos = [100000, -100000];
        const positionedCrop = positioned.crop(1);
        assert.deepStrictEqual([...positionedCrop.pos], [100001, -99999]);
        assert.deepStrictEqual([...positionedCrop.uncrop(1, 0).pos], [100000, -100000]);
    });

    test('packed byte-index iteration and x-span iteration respect row stride', () => {
        const image = make(10, 2, 1, 4);
        const byteIndexes = [];
        image.each_pixel_byte_index(index => byteIndexes.push(index));
        assert.deepStrictEqual(byteIndexes, [
            0, 0, 0, 0, 0, 0, 0, 0, 1, 1,
            4, 4, 4, 4, 4, 4, 4, 4, 5, 5
        ]);

        [2, 3, 4, 8, 10, 11, 19].forEach(index => image.set_pixel_by_idx(index, 1));
        const spans = [];
        image.each_x_span((x0, x1, y, color) => spans.push([x0, x1, y, color]));
        assert.deepStrictEqual(spans, [
            [0, 1, 0, 0], [2, 4, 0, 1], [5, 7, 0, 0], [8, 8, 0, 1], [9, 9, 0, 0],
            [0, 1, 1, 1], [2, 8, 1, 0], [9, 9, 1, 1]
        ]);
    });

    test('new_resized supports packed, grey and RGBA buffers', () => {
        const grey = make(2, 2, 8, 4);
        [1, 2, 3, 4].forEach((value, index) => grey.set_pixel_by_idx(index, value));
        const large = grey.new_resized([4, 4]);
        assert.deepStrictEqual(
            Array.from({length: 16}, (_, index) => large.get_pixel_by_idx(index)),
            [1, 1, 2, 2, 1, 1, 2, 2, 3, 3, 4, 4, 3, 3, 4, 4]
        );

        const packed = make(2, 1, 1, 4);
        packed.set_pixel([0, 0], 1);
        const packedLarge = packed.new_resized([4, 1]);
        assert.deepStrictEqual(
            Array.from({length: 4}, (_, index) => packedLarge.get_pixel_by_idx(index)),
            [1, 1, 0, 0]
        );

        const rgba = make(1, 1, 32, 8);
        rgba.set_pixel([0, 0], [5, 6, 7, 8]);
        assert.deepStrictEqual([...rgba.new_resized([2, 2]).get_pixel([1, 1])], [5, 6, 7, 8]);
    });

    test('copy_rect_by_bounds_to clips into the requested target rectangle', () => {
        const source = make(4, 3, 8, 4);
        for (let index = 0; index < 12; index++) source.set_pixel_by_idx(index, index + 1);
        const target = make(3, 3, 8, 4);
        target.color_whole(99);
        source.copy_rect_by_bounds_to([-1, -1, 2, 2], target);
        assert.deepStrictEqual(
            Array.from({length: 9}, (_, index) => target.get_pixel_by_idx(index)),
            [99, 99, 99, 99, 1, 2, 99, 5, 6]
        );

        const packedSource = make(5, 1, 1, 4);
        packedSource.set_pixel([2, 0], 1);
        const packedTarget = make(3, 1, 1, 4);
        packedSource.copy_rect_by_bounds_to([1, 0, 4, 1], packedTarget);
        assert.deepStrictEqual(
            Array.from({length: 3}, (_, index) => packedTarget.get_pixel_by_idx(index)),
            [0, 1, 0]
        );

        const rgbSource = make(2, 1, 24, 4);
        rgbSource.set_pixel([0, 0], [7, 8, 9]);
        const rgbTarget = make(1, 1, 24, 4);
        assert.strictEqual(
            rgbSource.copy_rect_by_bounds_to_24bipp([0, 0, 1, 1], rgbTarget),
            rgbTarget
        );
        assert.deepStrictEqual([...rgbTarget.get_pixel([0, 0])], [7, 8, 9]);
    });

    test('single-point polygon masks retain their offset', () => {
        const image = make(2, 2, 8);
        const mask = image.draw_filled_polygon_to_1bipp_pixel_buffer_mask([[70000, -3]]);
        assert.deepStrictEqual(mask.size, [1, 1]);
        assert.strictEqual(mask.get_pixel([0, 0]), 1);
        assert.deepStrictEqual(mask.__offset, [70000, -3]);
    });

    test('place_image_from_pixel_buffer supports clipping, byte formats and packed OR', () => {
        const source = make(3, 2, 24, 4);
        for (let index = 0; index < 6; index++) source.set_pixel_by_idx(index, [index + 1, 2, 3]);
        const target = make(4, 3, 24, 4);
        target.place_image_from_pixel_buffer(source, [-1, 1]);
        assert.deepStrictEqual([...target.get_pixel([0, 1])], [2, 2, 3]);
        assert.deepStrictEqual([...target.get_pixel([1, 2])], [6, 2, 3]);
        assert.deepStrictEqual([...target.get_pixel([2, 1])], [0, 0, 0]);

        const packedSource = make(3, 1, 1, 4);
        packedSource.set_pixel([1, 0], 1);
        const packedTarget = make(5, 1, 1, 4);
        packedTarget.color_whole(1);
        packedTarget.place_image_from_pixel_buffer(packedSource, [1, 0]);
        assert.deepStrictEqual(
            Array.from({length: 5}, (_, index) => packedTarget.get_pixel_by_idx(index)),
            [1, 0, 1, 0, 1]
        );
        const orTarget = make(5, 1, 1, 4);
        orTarget.color_whole(1);
        orTarget.place_image_from_pixel_buffer(packedSource, [1, 0], {or: true});
        assert.deepStrictEqual(
            Array.from({length: 5}, (_, index) => orTarget.get_pixel_by_idx(index)),
            [1, 1, 1, 1, 1]
        );

        const self = make(2, 3, 8);
        [1, 2, 3, 4, 5, 6].forEach((value, index) => self.set_pixel_by_idx(index, value));
        self.place_image_from_pixel_buffer(self, [0, 1]);
        assert.deepStrictEqual(
            Array.from({length: 6}, (_, index) => self.get_pixel_by_idx(index)),
            [1, 2, 1, 2, 3, 4]
        );
    });

    test('8bipp convolution and inversion leave aligned padding canonical', () => {
        const image = make(5, 5, 8, 4);
        for (let index = 0; index < 25; index++) image.set_pixel_by_idx(index, index);
        const identity = new Float32Array([0, 0, 0, 0, 1, 0, 0, 0, 0]);
        const convolved = image.apply_square_convolution(identity);
        assert.deepStrictEqual(
            Array.from({length: 25}, (_, index) => convolved.get_pixel_by_idx(index)),
            Array.from({length: 25}, (_, index) => index)
        );
        convolved.invert();
        assert.strictEqual(convolved.get_pixel_by_idx(0), 255);
        assert.strictEqual(convolved.get_pixel_by_idx(24), 231);
        for (let y = 0; y < 5; y++) {
            assert.deepStrictEqual([...convolved.ta.subarray(y * 8 + 5, y * 8 + 8)], [0, 0, 0]);
        }
    });

    test('RGBA identity convolution preserves interior alpha and row padding', () => {
        const image = make(5, 5, 32, 32);
        for (let index = 0; index < 25; index++) {
            image.set_pixel_by_idx(index, [index, index + 1, index + 2, index + 3]);
        }
        const identity = new Float32Array([0, 0, 0, 0, 1, 0, 0, 0, 0]);

        const convolved = image.apply_square_convolution(identity);

        assert.deepStrictEqual([...convolved.ta], [...image.ta]);
    });

    test('region measurement and small-block filling use logical RGBA rows', () => {
        const image = make(4, 3, 32, 32);
        image.color_whole([1, 2, 3, 4]);
        image.set_pixel([2, 1], [9, 8, 7, 6]);
        assert.strictEqual(image.measure_color_region_size(2, 1, 2), 1);
        image.flood_fill_small_color_blocks(2, 5, 6, 7, 8);
        assert.deepStrictEqual([...image.get_pixel([2, 1])], [5, 6, 7, 8]);
        assert.deepStrictEqual([...image.get_pixel([0, 0])], [1, 2, 3, 4]);
        assert.strictEqual(image.count_pixels_with_color([1, 2, 3, 4]), 11);
        assert.strictEqual(image.count_pixels_with_color(5, 6, 7, 8), 1);

        image.self_replace_color([5, 6, 7, 8], [9, 10, 11, 12]);
        assert.deepStrictEqual([...image.get_pixel([2, 1])], [9, 10, 11, 12]);
    });

    test('boundary iteration visits degenerate edges once and count_colors is callable', () => {
        const column = make(1, 3, 8);
        [1, 2, 3].forEach((value, index) => column.set_pixel_by_idx(index, value));
        const positions = [];
        column.each_outer_boundary_pixel((value, pos) => positions.push([pos[0], pos[1], value]));
        assert.deepStrictEqual(positions, [[0, 0, 1], [0, 1, 2], [0, 2, 3]]);

        const padded = make(3, 2, 8, 4);
        [1, 2, 1, 2, 3, 3].forEach((value, index) => padded.set_pixel_by_idx(index, value));
        assert.strictEqual(padded.count_colors(), 3);
    });

    test('typed-word metadata uses byte divisibility and overflow-safe division', () => {
        const aligned = make(8, 1, 8);
        assert.strictEqual(aligned.ta_is_64bit_divisible, true);
        assert.strictEqual(aligned.ta_is_32bit_divisible, true);
        assert.ok(aligned.ta64 instanceof BigUint64Array);

        const backing = new ArrayBuffer(9);
        const unaligned = make(8, 1, 8, 1, {ta: new Uint8Array(backing, 1, 8)});
        assert.strictEqual(unaligned.ta_is_64bit_divisible, true);
        assert.strictEqual(unaligned.ta64, false);

        const proto = Pixel_Buffer_Perf_Focus_Enh.prototype;
        const segments32 = Object.getOwnPropertyDescriptor(
            proto,
            'number_of_32bit_segments_per_32bit_divisible_row'
        ).get;
        const segments64 = Object.getOwnPropertyDescriptor(
            proto,
            'number_of_64bit_segments_per_64bit_divisible_image'
        ).get;
        assert.strictEqual(segments32.call({bits_per_row: 2 ** 40}), 2 ** 35);
        assert.strictEqual(segments64.call({bits_per_image_1bipp: 2 ** 42}), 2 ** 36);
    });

    test('pixel-position regions retain origins above the signed 16-bit limit', () => {
        const image = make(40_002, 1, 8);
        image.set_pixel([40_000, 0], 17);
        image.set_pixel([40_001, 0], 29);
        const positions = Pixel_Pos_List.fromArray([[40_000, 0], [40_001, 0]]);

        const region = image.copy_pixel_pos_list_region(positions, 0);

        assert.deepStrictEqual([...region.pos], [40_000, 0]);
        assert.deepStrictEqual([...region.size], [2, 1]);
        assert.deepStrictEqual(
            Array.from({length: 2}, (_, index) => region.get_pixel_by_idx(index)),
            [17, 29]
        );
    });

    return {passed, failed};
};

if (require.main === module) {
    const result = testPixelBufferLegacyHelpers();
    console.log(`\nTest summary: ${result.passed} passed, ${result.failed} failed.`);
    process.exit(result.failed > 0 ? 1 : 0);
}

module.exports = testPixelBufferLegacyHelpers;
