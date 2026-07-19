'use strict';

const assert = require('assert');
const {Pixel_Buffer, Pixel_Buffer_Painter} = require('../core/gfx-core');

const FORMAT_CASES = [
    {bipp: 1, alignment: 4, color: 1, zero: 0},
    {bipp: 8, alignment: 8, color: 91, zero: 0},
    {bipp: 24, alignment: 4, color: [91, 92, 93], zero: [0, 0, 0]},
    {bipp: 32, alignment: 8, color: [91, 92, 93, 94], zero: [0, 0, 0, 0]}
];

const make = ({bipp, alignment}, width = 5, height = 4) => new Pixel_Buffer({
    size: [width, height],
    bits_per_pixel: bipp,
    rowAlignmentBytes: alignment
});

const normalizedPixel = pixel => typeof pixel === 'number' ? pixel : [...pixel];

const assertPixels = (image, color, zero, isPainted) => {
    for (let y = 0; y < image.size[1]; y++) {
        for (let x = 0; x < image.size[0]; x++) {
            assert.deepStrictEqual(
                normalizedPixel(image.get_pixel([x, y])),
                isPainted(x, y) ? color : zero,
                `unexpected ${image.bipp}bipp pixel at ${x},${y}`
            );
        }
    }
};

const assertPaddingIs = (image, expected) => {
    const rowDataBytes = image.layout.rowDataBytes;
    for (let y = 0; y < image.size[1]; y++) {
        assert.deepStrictEqual(
            [...image.ta.subarray(
                y * image.bytes_per_row + rowDataBytes,
                (y + 1) * image.bytes_per_row
            )],
            new Array(image.bytes_per_row - rowDataBytes).fill(expected)
        );
    }
};

const runPixelBufferPainterTests = () => {
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

    console.log('Running Pixel_Buffer_Painter rectangle tests...');

    test('rect clips independently at every edge for 1/8/24/32bipp', () => {
        const rectangles = [
            [[-2, 1], [4, 2]],
            [[1, -2], [2, 4]],
            [[3, 1], [4, 2]],
            [[1, 3], [2, 3]]
        ];
        const expected = (x, y) =>
            (x < 2 && y >= 1 && y < 3) ||
            (x >= 1 && x < 3 && y < 2) ||
            (x >= 3 && y >= 1 && y < 3) ||
            (x >= 1 && x < 3 && y === 3);

        for (const format of FORMAT_CASES) {
            const image = make(format);
            for (const [pos, size] of rectangles) {
                image.paint.rect(pos, size, format.color);
            }
            assertPixels(image, format.color, format.zero, expected);
            assertPaddingIs(image, 0);
        }
    });

    test('corner clipping, off-canvas rectangles, and empty rectangles are safe no-ops', () => {
        for (const format of FORMAT_CASES) {
            const image = make(format);
            image.paint.rect([-1, -1], [2, 2], format.color);
            for (const [pos, size] of [
                [[-10, 0], [3, 2]],
                [[0, -10], [2, 3]],
                [[6, 0], [2, 2]],
                [[0, 5], [2, 2]],
                [[1, 1], [0, 2]],
                [[1, 1], [2, 0]]
            ]) {
                image.paint.rect(pos, size, format.color);
            }
            assertPixels(image, format.color, format.zero, (x, y) => x === 0 && y === 0);
            assertPaddingIs(image, 0);
        }
    });

    test('clipped writes do not alias adjacent rows, row padding, or 1bipp tail bits', () => {
        for (const format of FORMAT_CASES) {
            const image = make(format);
            const rowDataBytes = image.layout.rowDataBytes;
            for (let y = 0; y < image.size[1]; y++) {
                image.ta.fill(
                    0xA5,
                    y * image.bytes_per_row + rowDataBytes,
                    (y + 1) * image.bytes_per_row
                );
                if (format.bipp === 1) {
                    image.ta[y * image.bytes_per_row + rowDataBytes - 1] = 0x05;
                }
            }

            image.paint.rect([-3, 1], [5, 1], format.color);
            assertPixels(
                image,
                format.color,
                format.zero,
                (x, y) => y === 1 && x < 2
            );
            assertPaddingIs(image, 0xA5);
            if (format.bipp === 1) {
                for (let y = 0; y < image.size[1]; y++) {
                    assert.strictEqual(image.ta[y * image.bytes_per_row] & 0x07, 0x05);
                }
            }
        }
    });

    test('1bipp rect supports both setting and clearing clipped bit spans', () => {
        const format = FORMAT_CASES[0];
        const image = make(format);
        image.paint.rect([0, 0], [5, 4], 1);
        image.paint.rect([-1, 1], [3, 2], 0);
        assertPixels(image, 1, 0, (x, y) => !(y >= 1 && y < 3 && x < 2));
        for (let y = 0; y < image.size[1]; y++) {
            assert.strictEqual(image.ta[y * image.bytes_per_row] & 0x07, 0);
        }
        assertPaddingIs(image, 0);
    });

    test('1bipp rect handles multi-byte spans without changing row tails or padding', () => {
        const format = FORMAT_CASES[0];
        const image = make(format, 25, 2);
        image.paint.rect([3, 0], [20, 2], 1);
        image.paint.rect([6, 1], [13, 1], 0);
        assertPixels(image, 1, 0, (x, y) =>
            y === 0
                ? x >= 3 && x < 23
                : (x >= 3 && x < 6) || (x >= 19 && x < 23)
        );
        for (let y = 0; y < image.size[1]; y++) {
            assert.strictEqual(image.ta[y * image.bytes_per_row + 3] & 0x7F, 0);
        }
        assertPaddingIs(image, 0);
    });

    test('coordinates beyond the Int16 range clip without wrapping', () => {
        for (const format of FORMAT_CASES) {
            const image = make(format);
            image.paint.rect([-40000, 1], [40002, 1], format.color);
            image.paint.rect([40000, 0], [2, 2], format.color);
            assertPixels(
                image,
                format.color,
                format.zero,
                (x, y) => y === 1 && x < 2
            );
            assertPaddingIs(image, 0);
        }
    });

    test('rect validates safe integer geometry before writing', () => {
        const image = make(FORMAT_CASES[1]);
        for (const [pos, size] of [
            [[NaN, 0], [1, 1]],
            [[0.5, 0], [1, 1]],
            [[Number.MAX_SAFE_INTEGER + 1, 0], [1, 1]],
            [[0, 0], [1.5, 1]],
            [[0, 0], [Number.MAX_SAFE_INTEGER + 1, 1]]
        ]) {
            assert.throws(() => image.paint.rect(pos, size, 91), /safe integers/i);
        }
        assert.throws(() => image.paint.rect([0, 0], [-1, 1], 91), /negative/i);
        assert.throws(
            () => image.paint.rect([Number.MAX_SAFE_INTEGER, 0], [1, 1], 91),
            /bounds must be safe integers/i
        );
        assert.deepStrictEqual([...image.ta], new Array(image.ta.length).fill(0));
    });

    test('rect validates colors for every supported pixel format', () => {
        const invalidColors = [
            [FORMAT_CASES[0], 2],
            [FORMAT_CASES[1], 256],
            [FORMAT_CASES[1], 1.5],
            [FORMAT_CASES[2], [1, 2]],
            [FORMAT_CASES[2], [1, 2, 256]],
            [FORMAT_CASES[3], [1, 2, 3]]
        ];
        for (const [format, color] of invalidColors) {
            const image = make(format);
            assert.throws(() => image.paint.rect([0, 0], [1, 1], color), /color|channels/i);
            assert.deepStrictEqual([...image.ta], new Array(image.ta.length).fill(0));
        }
    });

    test('rect remains chainable and supports the pixel_buffer constructor alias', () => {
        const format = FORMAT_CASES[2];
        const image = make(format);
        assert.strictEqual(
            image.paint.rect([1, 1], [2, 2], format.color),
            image.paint
        );
        const aliasPainter = new Pixel_Buffer_Painter({pixel_buffer: image});
        assert.strictEqual(aliasPainter.rect([0, 0], [1, 1], format.color), aliasPainter);
        assert.deepStrictEqual(normalizedPixel(image.get_pixel([0, 0])), format.color);
    });

    return {passed, failed};
};

module.exports = runPixelBufferPainterTests;
