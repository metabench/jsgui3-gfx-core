'use strict';

const assert = require('assert');
const {resize_ta_colorspace} = require('../core/ta-math/transform');
const {Pixel_Buffer} = require('../core/gfx-core');
const Float32Convolution = require('../core/convolution');
const Palette = require('../core/palette');
const Dynamic_XSpans = require('../core/dynamic-xspans');
const Other_Representation_Of_1_Bit_Per_Pixel_Buffer = require(
    '../core/other-representations/of_1bipp/Other_Representation_Of_1_Bit_Per_Pixel_Buffer'
);
const Wrapping_Scanlines_Toggle_Color_Span_Lengths = require(
    '../core/other-representations/of_1bipp/wrapping_scanlines/toggle_color_span_lengths/Wrapping_Scanlines_Toggle_Color_Span_Lengths'
);
const YRows_XSpans = require(
    '../core/other-representations/yrows-xspans-core-reference-implementation'
);

const colorspace24 = (width, height, stride = width * 3) =>
    new Int32Array([width, height, 3, stride, 24, stride * 8]);

const referenceResize24 = (source, sourceWidth, sourceHeight, destWidth, destHeight) => {
    const dest = new Uint8ClampedArray(destWidth * destHeight * 3);
    let destByte = 0;
    for (let destY = 0; destY < destHeight; destY++) {
        const top = destY * sourceHeight / destHeight;
        const bottom = (destY + 1) * sourceHeight / destHeight;
        for (let destX = 0; destX < destWidth; destX++) {
            const left = destX * sourceWidth / destWidth;
            const right = (destX + 1) * sourceWidth / destWidth;
            const area = (right - left) * (bottom - top);
            for (let channel = 0; channel < 3; channel++) {
                let value = 0;
                for (let sourceY = Math.floor(top); sourceY < Math.ceil(bottom); sourceY++) {
                    const yOverlap = Math.max(
                        0,
                        Math.min(bottom, sourceY + 1) - Math.max(top, sourceY)
                    );
                    for (let sourceX = Math.floor(left); sourceX < Math.ceil(right); sourceX++) {
                        const xOverlap = Math.max(
                            0,
                            Math.min(right, sourceX + 1) - Math.max(left, sourceX)
                        );
                        value += source[(sourceY * sourceWidth + sourceX) * 3 + channel] *
                            xOverlap * yOverlap;
                    }
                }
                dest[destByte + channel] = value / area;
            }
            destByte += 3;
        }
    }
    return dest;
};

const runTransformAndPrototypeTests = () => {
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

    console.log('Running transform and prototype tests...');

    test('24bipp resize preserves constants in mixed, one-axis and former NYI ratios', () => {
        for (const [sourceWidth, sourceHeight, destWidth, destHeight] of [
            [1, 1, 1, 7],
            [2, 4, 4, 2],
            [2, 6, 4, 2],
            [6, 2, 2, 4]
        ]) {
            const source = new Uint8ClampedArray(sourceWidth * sourceHeight * 3).fill(100);
            const result = resize_ta_colorspace(
                source,
                colorspace24(sourceWidth, sourceHeight),
                [destWidth, destHeight]
            );
            assert.deepStrictEqual(
                [...result],
                new Array(destWidth * destHeight * 3).fill(100)
            );
        }
    });

    test('24bipp resize matches an area-overlap oracle for asymmetric image data', () => {
        for (const [sourceWidth, sourceHeight, destWidth, destHeight] of [
            [7, 5, 3, 8],
            [6, 4, 2, 2]
        ]) {
            const source = new Uint8ClampedArray(sourceWidth * sourceHeight * 3);
            for (let index = 0; index < source.length; index++) {
                source[index] = index * 67 % 256;
            }
            const expected = referenceResize24(
                source, sourceWidth, sourceHeight, destWidth, destHeight
            );
            const actual = resize_ta_colorspace(
                source,
                colorspace24(sourceWidth, sourceHeight),
                [destWidth, destHeight]
            );
            assert.deepStrictEqual([...actual], [...expected]);
        }
    });

    test('24bipp identity resize remains exact beyond the old Int16 x limit', () => {
        const width = 40000;
        const source = new Uint8ClampedArray(width * 3);
        for (let index = 0; index < source.length; index++) source[index] = index % 251;
        const actual = resize_ta_colorspace(source, colorspace24(width, 1), [width, 1]);
        assert.deepStrictEqual(actual, source);
        assert.strictEqual(actual[32768 * 3], source[32768 * 3]);
        assert.strictEqual(actual[actual.length - 1], source[source.length - 1]);
    });

    test('24bipp resize observes source row stride and validates storage', () => {
        const source = new Uint8ClampedArray(24);
        source.set([1, 2, 3, 4, 5, 6], 0);
        source.set([7, 8, 9, 10, 11, 12], 12);
        assert.deepStrictEqual(
            [...resize_ta_colorspace(source, colorspace24(2, 2, 12), [2, 2])],
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
        );
        assert.throws(
            () => resize_ta_colorspace(new Uint8Array(3), colorspace24(2, 1), [1, 1]),
            /storage/i
        );
    });

    test('convolution module loads and calculates 8/24bipp values', () => {
        const convolution = new Float32Convolution({size: [1, 1], value: [0.5]});
        assert.strictEqual(convolution.calc_from_8bipp_ta(new Uint8Array([100])), 50);
        assert.deepStrictEqual(
            [...convolution.calc_from_24bipp_ta(new Uint8Array([100, 80, 60]))],
            [50, 40, 30]
        );

        const exposedSize = convolution.size;
        const exposedCenter = convolution.xy_center;
        exposedSize[0] = 99;
        exposedCenter[0] = 99;
        assert.deepStrictEqual([...convolution.size], [1, 1]);
        assert.deepStrictEqual([...convolution.xy_center], [0, 0]);
        assert.strictEqual(convolution.num_px, 1);
        assert.strictEqual(convolution.ta.length, 1);
        assert.throws(
            () => new Float32Convolution({size: [2, 1], value: [1, 1]}),
            /positive odd/i
        );
        assert.throws(
            () => new Float32Convolution({size: [3, 3], value: [1]}),
            /length/i
        );
    });

    test('8/24bipp Pixel_Buffer convolution preserves padded identity images', () => {
        const identity = new Float32Convolution({
            size: [3, 3],
            value: [
                0, 0, 0,
                0, 1, 0,
                0, 0, 0
            ]
        });

        const source = new Pixel_Buffer({
            size: [3, 3],
            bits_per_pixel: 24,
            rowAlignmentBytes: 4
        });
        assert.strictEqual(source.bytes_per_row, 12);
        let valueIndex = 0;
        for (let y = 0; y < 3; y++) {
            const row = y * source.bytes_per_row;
            for (let byte = 0; byte < 9; byte++) {
                source.ta[row + byte] = valueIndex++ * 17 % 256;
            }
        }
        const result = source.new_convolved(identity);
        assert.deepStrictEqual([...result.ta], [...source.ta]);
        for (let y = 0; y < 3; y++) {
            assert.deepStrictEqual(
                [...result.ta.subarray(y * 12 + 9, y * 12 + 12)],
                [0, 0, 0]
            );
        }

        const greySource = new Pixel_Buffer({
            size: [3, 3],
            bits_per_pixel: 8,
            rowAlignmentBytes: 4
        });
        assert.strictEqual(greySource.bytes_per_row, 4);
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 3; x++) {
                greySource.ta[y * 4 + x] = y * 3 + x + 1;
            }
        }
        const greyResult = greySource.new_convolved(identity);
        assert.deepStrictEqual([...greyResult.ta], [...greySource.ta]);
        for (let y = 0; y < 3; y++) {
            assert.strictEqual(greyResult.ta[y * 4 + 3], 0);
        }

        const fractional = new Float32Convolution({size: [1, 1], value: [0.2]});
        const fractionalGrey = new Pixel_Buffer({size: [1, 1], bits_per_pixel: 8});
        const fractionalRgb = new Pixel_Buffer({size: [1, 1], bits_per_pixel: 24});
        fractionalGrey.set_pixel([0, 0], 13);
        fractionalRgb.set_pixel([0, 0], [13, 13, 13]);
        assert.strictEqual(
            fractionalGrey.new_convolved(fractional).get_pixel([0, 0]),
            3
        );
        assert.deepStrictEqual(
            [...fractionalRgb.new_convolved(fractional).get_pixel([0, 0])],
            [3, 3, 3]
        );
    });

    test('Palette validates, owns and exposes valid color arrays', () => {
        const input = [[0, 0, 0], new Uint8Array([255, 255, 255])];
        const palette = new Palette(input);
        input[0][0] = 99;
        assert.deepStrictEqual(palette[0], [0, 0, 0]);
        assert.strictEqual(palette.length, 2);
        assert.strictEqual(palette.channel_count, 3);
        assert.strictEqual(palette.indexOf([255, 255, 255]), 1);
        assert.strictEqual(palette.has([1, 2, 3]), false);
        assert.throws(() => new Palette([[0], [0, 0]]), /same channel count/i);
    });

    test('representation inheritance keeps invariants and constructs wrapping sources', () => {
        const callerInvariants = [{test_pb: () => true}];
        const representation = new Other_Representation_Of_1_Bit_Per_Pixel_Buffer({
            invariants: callerInvariants
        });
        assert.strictEqual(callerInvariants.length, 1, 'caller array must not be mutated');
        assert.strictEqual(representation.invariants.length, 2);

        const oneBitSource = {bits_per_pixel: 1, ta: new Uint8Array(1)};
        const wrapping = new Wrapping_Scanlines_Toggle_Color_Span_Lengths(oneBitSource);
        assert.strictEqual(wrapping.source, oneBitSource);
        assert.throws(
            () => new Wrapping_Scanlines_Toggle_Color_Span_Lengths({
                source: {bits_per_pixel: 8, ta: new Uint8Array(1)}
            }),
            /1bipp/i
        );
    });

    test('YRows_XSpans writes, splits and merges spans without losing updates', () => {
        const image = new YRows_XSpans({size: [8, 1], default_color: false});
        assert.strictEqual(image.default_color, false);
        for (const x of [2, 3, 5, 4]) image.set_pixel([x, 0], true);
        assert.deepStrictEqual(image.rows[0], [[2, 5, true]]);

        image.set_pixel([3, 0], false);
        assert.deepStrictEqual(image.rows[0], [[2, 2, true], [4, 5, true]]);
        image.set_pixel([3, 0], true);
        assert.deepStrictEqual(image.rows[0], [[2, 5, true]]);
        assert.strictEqual(image.get_pixel([1, 0]), false);
        assert.strictEqual(image.get_pixel([4, 0]), true);
    });

    test('Dynamic_XSpans grows, exports active data and iterates triples', () => {
        const spans = new Dynamic_XSpans({capacity: 1});
        spans.push([1, 3, 7]);
        spans.push(5, 8, 9);
        assert.strictEqual(spans.length, 2);
        assert(spans.capacity >= 2);
        assert.deepStrictEqual([...spans.ta], [1, 3, 7, 5, 8, 9]);
        assert.deepStrictEqual([...spans].map(span => [...span]), [[1, 3, 7], [5, 8, 9]]);
        spans.clear();
        assert.strictEqual(spans.length, 0);
    });

    return {passed, failed};
};

if (require.main === module) {
    const result = runTransformAndPrototypeTests();
    console.log(`\nTest summary: ${result.passed} passed, ${result.failed} failed.`);
    process.exit(result.failed === 0 ? 0 : 1);
}

module.exports = runTransformAndPrototypeTests;
