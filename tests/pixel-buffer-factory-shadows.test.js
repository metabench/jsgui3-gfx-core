'use strict';

const assert = require('assert');
const {Pixel_Buffer} = require('../core/gfx-core');
const Pixel_Buffer_Core_Inner_Structures =
    require('../core/pixel-buffer-0-core-inner-structures');
const Pixel_Buffer_Core_Reference_Implementations =
    require('../core/pixel-buffer-2-core-reference-implementations');
const Pixel_Buffer_Core = require('../core/pixel-buffer-3-core');
const Pixel_Pos_List = require('../core/pixel-pos-list');
const {
    unsafeGetPixel,
    unsafeSetPixel
} = require('../core/pixel-buffer-pixel-access');

const IMPLEMENTATIONS = [
    Pixel_Buffer_Core_Inner_Structures,
    Pixel_Buffer_Core_Reference_Implementations,
    Pixel_Buffer_Core,
    Pixel_Buffer
];

const colorAt = (bipp, x, y) => {
    if (bipp === 1) return (x + y) & 1;
    if (bipp === 8) return (x * 17 + y * 43) & 255;
    return Array.from(
        {length: bipp >> 3},
        (_, channel) => (x * 17 + y * 43 + channel * 71) & 255
    );
};

const asValue = color => typeof color === 'number' ? color : [...color];

const fillWithOracle = image => {
    const expected = [];
    for (let y = 0; y < image.size[1]; y++) {
        for (let x = 0; x < image.size[0]; x++) {
            const color = colorAt(image.bipp, x, y);
            unsafeSetPixel(image, [x, y], color);
            expected.push(asValue(color));
        }
    }
    return expected;
};

const readAll = image => {
    const values = [];
    for (let y = 0; y < image.size[1]; y++) {
        for (let x = 0; x < image.size[0]; x++) {
            values.push(asValue(unsafeGetPixel(image, [x, y])));
        }
    }
    return values;
};

const withoutConsoleLog = fn => {
    const original = console.log;
    console.log = () => {};
    try {
        return fn();
    } finally {
        console.log = original;
    }
};

const assertCanonicalPadding = image => {
    for (let y = 0; y < image.size[1]; y++) {
        const rowStart = y * image.bytes_per_row;
        const padding = image.ta.subarray(
            rowStart + image.layout.rowDataBytes,
            rowStart + image.bytes_per_row
        );
        assert.deepStrictEqual([...padding], new Array(padding.length).fill(0));
        if (image.bipp === 1 && image.layout.tailMask !== 0xFF) {
            const tail = image.ta[rowStart + image.layout.rowDataBytes - 1];
            assert.strictEqual(tail & ~image.layout.tailMask, 0);
        }
    }
};

const runPixelBufferFactoryShadowTests = () => {
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

    console.log('Running Pixel_Buffer copy/factory shadow tests...');

    test('the first divergent shadow family retains its existing owners', () => {
        const threeLevelMethods = [
            'blank_copy', 'clone', 'copy_pixel_pos_list_region', 'add_alpha_channel'
        ];
        for (const name of threeLevelMethods) {
            const owners = [
                Pixel_Buffer_Core,
                Pixel_Buffer_Core_Reference_Implementations,
                Pixel_Buffer_Core_Inner_Structures
            ].map(Constructor =>
                Object.getOwnPropertyDescriptor(Constructor.prototype, name)
            );
            assert(owners.every(Boolean), name);
            assert.strictEqual(new Set(owners.map(owner =>
                Function.prototype.toString.call(owner.value)
            )).size > 1, true, name);
        }
        for (const name of ['crop', 'uncrop']) {
            const owners = [
                Pixel_Buffer_Core,
                Pixel_Buffer_Core_Reference_Implementations
            ].map(Constructor =>
                Object.getOwnPropertyDescriptor(Constructor.prototype, name)
            );
            assert(owners.every(Boolean), name);
            assert.notStrictEqual(owners[0].value, owners[1].value, name);
        }
        const channelGetters = [
            Pixel_Buffer_Core,
            Pixel_Buffer_Core_Reference_Implementations,
            Pixel_Buffer_Core_Inner_Structures
        ].map(Constructor =>
            Object.getOwnPropertyDescriptor(
                Constructor.prototype, 'split_rgb_channels'
            ).get
        );
        assert.strictEqual(new Set(channelGetters.map(getter =>
            Function.prototype.toString.call(getter)
        )).size > 1, true);
    });

    test('tight RGB factories agree across every relevant deep-import class', () => {
        for (const Constructor of IMPLEMENTATIONS) {
            const source = new Constructor({size: [3, 2], bits_per_pixel: 24});
            source.pos = [10, 20];
            const expected = fillWithOracle(source);
            const blank = source.blank_copy();
            const clone = source.clone();
            const alpha = withoutConsoleLog(() => source.add_alpha_channel());
            const channels = source.split_rgb_channels;

            assert(blank instanceof Constructor, Constructor.name);
            assert(clone instanceof Constructor, Constructor.name);
            assert(alpha instanceof Constructor, Constructor.name);
            assert(channels.every(channel => channel instanceof Constructor));
            assert.notStrictEqual(blank.storage, source.storage);
            assert.notStrictEqual(clone.storage, source.storage);
            assert.deepStrictEqual(readAll(blank), new Array(6).fill(null).map(() => [0, 0, 0]));
            assert.deepStrictEqual(readAll(clone), expected);
            assert.deepStrictEqual(
                readAll(alpha),
                expected.map(color => [...color, 255])
            );
            assert.deepStrictEqual(
                channels.map(readAll),
                [0, 1, 2].map(channel => expected.map(color => color[channel]))
            );
            assert.deepStrictEqual([...clone.pos], [10, 20]);
            assert.strictEqual(withoutConsoleLog(() => source.add_alpha_channel.call(
                new Constructor({size: [1, 1], bits_per_pixel: 32})
            )).bipp, 32);
        }
    });

    test('padded rows expose lower-level shadow limitations without affecting final dispatch', () => {
        const expectedPixels = [
            [0, 71, 142], [17, 88, 159], [34, 105, 176],
            [43, 114, 185], [60, 131, 202], [77, 148, 219]
        ];
        for (const Constructor of [
            Pixel_Buffer_Core_Inner_Structures,
            Pixel_Buffer_Core_Reference_Implementations
        ]) {
            const source = new Constructor({
                size: [3, 2], bits_per_pixel: 24, rowAlignmentBytes: 4
            });
            fillWithOracle(source);
            const clone = source.clone();
            const alpha = withoutConsoleLog(() => source.add_alpha_channel());
            const channels = source.split_rgb_channels;
            assert.strictEqual(source.bytes_per_row, 12);
            assert.strictEqual(clone.bytes_per_row, 9);
            assert.notDeepStrictEqual(readAll(clone), expectedPixels);
            assert.notDeepStrictEqual(
                readAll(alpha),
                expectedPixels.map(color => [...color, 255])
            );
            assert.notDeepStrictEqual(
                channels.map(readAll),
                [0, 1, 2].map(channel => expectedPixels.map(color => color[channel]))
            );
        }

        for (const Constructor of [Pixel_Buffer_Core, Pixel_Buffer]) {
            const source = new Constructor({
                size: [3, 2], bits_per_pixel: 24, rowAlignmentBytes: 4
            });
            const expected = fillWithOracle(source);
            const blank = source.blank_copy();
            const clone = source.clone();
            const alpha = source.add_alpha_channel();
            const channels = source.split_rgb_channels;
            assert.strictEqual(blank.bytes_per_row, 12);
            assert.strictEqual(clone.bytes_per_row, 12);
            assert.deepStrictEqual(readAll(clone), expected);
            assert.deepStrictEqual(readAll(alpha), expected.map(color => [...color, 255]));
            assert.deepStrictEqual(
                channels.map(readAll),
                [0, 1, 2].map(channel => expected.map(color => color[channel]))
            );
            assertCanonicalPadding(blank);
            assertCanonicalPadding(clone);
        }
    });

    test('pixel-list region copying is correct only at the effective implementation', () => {
        const positions = new Pixel_Pos_List();
        positions.add([1, 0]);
        positions.add([2, 1]);

        for (const Constructor of [
            Pixel_Buffer_Core_Inner_Structures,
            Pixel_Buffer_Core_Reference_Implementations
        ]) {
            const source = new Constructor({size: [3, 2], bits_per_pixel: 24});
            fillWithOracle(source);
            assert.throws(
                () => source.copy_pixel_pos_list_region(positions),
                TypeError
            );
        }

        for (const Constructor of [Pixel_Buffer_Core, Pixel_Buffer]) {
            const source = new Constructor({
                size: [3, 2], bits_per_pixel: 24, rowAlignmentBytes: 4
            });
            fillWithOracle(source);
            const copy = source.copy_pixel_pos_list_region(positions, [9, 9, 9]);
            assert(copy instanceof Constructor);
            assert.deepStrictEqual([...copy.size], [2, 2]);
            assert.deepStrictEqual([...copy.pos], [1, 0]);
            assert.deepStrictEqual(readAll(copy), [
                colorAt(24, 1, 0), [9, 9, 9],
                [9, 9, 9], colorAt(24, 2, 1)
            ]);
            assertCanonicalPadding(copy);
        }
    });

    test('effective crop and uncrop match pixel oracles for every layout', () => {
        assert.strictEqual(
            typeof Pixel_Buffer_Core_Inner_Structures.prototype.crop,
            'undefined'
        );
        const broken = new Pixel_Buffer_Core_Reference_Implementations({
            size: [5, 4], bits_per_pixel: 8
        });
        fillWithOracle(broken);
        assert.throws(() => broken.crop(1), TypeError);
        assert.throws(
            () => withoutConsoleLog(() => broken.uncrop(1, 0)),
            TypeError
        );

        for (const Constructor of [Pixel_Buffer_Core, Pixel_Buffer]) {
            for (const [bipp, alignment] of [[1, 4], [8, 4], [24, 8], [32, 8]]) {
                const source = new Constructor({
                    size: [5, 4], bits_per_pixel: bipp,
                    rowAlignmentBytes: alignment
                });
                source.pos = [10, 20];
                fillWithOracle(source);
                const background = colorAt(bipp, 7, 7);
                const cropped = source.crop(1);
                const uncropped = source.uncrop(1, background);

                assert(cropped instanceof Constructor);
                assert(uncropped instanceof Constructor);
                assert.deepStrictEqual([...cropped.size], [3, 2]);
                assert.deepStrictEqual([...cropped.pos], [11, 21]);
                assert.deepStrictEqual(
                    readAll(cropped),
                    [
                        colorAt(bipp, 1, 1), colorAt(bipp, 2, 1), colorAt(bipp, 3, 1),
                        colorAt(bipp, 1, 2), colorAt(bipp, 2, 2), colorAt(bipp, 3, 2)
                    ].map(asValue)
                );
                assert.deepStrictEqual([...uncropped.size], [7, 6]);
                assert.deepStrictEqual([...uncropped.pos], [9, 19]);
                for (let y = 0; y < 6; y++) {
                    for (let x = 0; x < 7; x++) {
                        const expected = x >= 1 && x <= 5 && y >= 1 && y <= 4
                            ? colorAt(bipp, x - 1, y - 1)
                            : background;
                        assert.deepStrictEqual(
                            asValue(unsafeGetPixel(uncropped, [x, y])),
                            asValue(expected)
                        );
                    }
                }
                assertCanonicalPadding(cropped);
                assertCanonicalPadding(uncropped);
            }
            const invalid = new Constructor({size: [5, 4], bits_per_pixel: 8});
            assert.throws(() => invalid.crop(-1), RangeError);
            assert.throws(() => invalid.crop(3), RangeError);
            assert.throws(() => invalid.uncrop(0.5, 0), RangeError);
        }
    });

    test('effective packed clone and blank preserve tails, padding and ownership', () => {
        for (const Constructor of [Pixel_Buffer_Core, Pixel_Buffer]) {
            const source = new Constructor({
                size: [13, 3], bits_per_pixel: 1, rowAlignmentBytes: 4
            });
            const expected = fillWithOracle(source);
            const clone = source.clone();
            const blank = source.blank_copy();
            assert.strictEqual(clone.bytes_per_row, source.bytes_per_row);
            assert.strictEqual(blank.bytes_per_row, source.bytes_per_row);
            assert.notStrictEqual(clone.storage, source.storage);
            assert.notStrictEqual(blank.storage, source.storage);
            assert.deepStrictEqual(readAll(clone), expected);
            assert.deepStrictEqual(readAll(blank), new Array(39).fill(0));
            assertCanonicalPadding(clone);
            assertCanonicalPadding(blank);
        }
    });

    return {passed, failed};
};

if (require.main === module) {
    const {passed, failed} = runPixelBufferFactoryShadowTests();
    console.log(`\nTest summary: ${passed} passed, ${failed} failed.`);
    process.exit(failed > 0 ? 1 : 0);
}

module.exports = runPixelBufferFactoryShadowTests;
