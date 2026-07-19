'use strict';

const assert = require('assert');
const {Pixel_Buffer} = require('../core/gfx-core');
const Pixel_Buffer_Core_Get_Set_Pixels = require('../core/pixel-buffer-1-core-get-set-pixel');

const ACCESS_METHODS = [
    'get_pixel_byte_bit_1bipp',
    'get_pixel_byte_bit_BE_1bipp',
    'set_pixel_on_1bipp_by_pixel_index',
    'set_pixel_on_1bipp_xy',
    'set_pixel_on_1bipp',
    'set_pixel_off_1bipp_by_pixel_index',
    'set_pixel_off_1bipp',
    'set_pixel_1bipp',
    'set_pixel_by_idx_1bipp',
    'set_pixel_8bipp',
    'set_pixel_24bipp',
    'set_pixel_32bipp',
    'set_pixel_by_idx_8bipp',
    'set_pixel_by_idx_24bipp',
    'set_pixel_by_idx_32bipp',
    'set_pixel_by_idx',
    'set_pixel',
    'get_pixel_by_idx_1bipp',
    'get_pixel_by_idx_8bipp',
    'get_pixel_by_idx_24bipp',
    'get_pixel_by_idx_32bipp',
    'get_pixel_by_idx',
    'get_pixel_1bipp',
    'get_pixel_8bipp',
    'get_pixel_24bipp',
    'get_pixel_32bipp',
    'get_pixel'
];

const colorFor = (bipp, seed) => {
    if (bipp === 1) return seed & 1;
    if (bipp === 8) return seed & 255;
    const length = bipp >> 3;
    return Array.from({length}, (_, channel) => (seed + channel * 47) & 255);
};

const asArray = value => typeof value === 'number' ? value : [...value];

const createSeededRandom = initialSeed => {
    let state = initialSeed >>> 0;
    return limit => {
        state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
        return state % limit;
    };
};

const runPixelBufferAccessContractTests = () => {
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

    console.log('Running Pixel_Buffer public access-contract tests...');

    test('the complete existing random-access method surface remains callable', () => {
        const image = new Pixel_Buffer({size: [2, 2], bits_per_pixel: 8});
        for (const name of ACCESS_METHODS) {
            assert.strictEqual(typeof image[name], 'function', `${name} must remain a method`);
        }
        const names = new Set();
        let prototype = Object.getPrototypeOf(image);
        while (prototype && prototype !== Object.prototype) {
            for (const name of Object.getOwnPropertyNames(prototype)) {
                if (/^(get|set)_pixel/.test(name)) names.add(name);
            }
            prototype = Object.getPrototypeOf(prototype);
        }
        for (const name of ACCESS_METHODS) assert(names.has(name), name);
    });

    test('the supported core deep import exposes the same checked access contract', () => {
        const image = new Pixel_Buffer_Core_Get_Set_Pixels({
            size: [3, 2], bits_per_pixel: 24, rowAlignmentBytes: 8
        });
        image.set_pixel([2, 1], [7, 11, 13]);
        assert.deepStrictEqual([...image.get_pixel([2, 1])], [7, 11, 13]);
        const before = image.storage.slice();
        assert.throws(() => image.set_pixel([3, 0], [1, 2, 3]), RangeError);
        assert.throws(() => image.set_pixel_by_idx(6, [1, 2, 3]), RangeError);
        assert.throws(() => image.get_pixel([-1, 0]), RangeError);
        assert.throws(() => image.get_pixel_by_idx(-1), RangeError);
        assert.deepStrictEqual(image.storage, before);
    });

    test('generic coordinate access rejects every outside edge without mutation', () => {
        for (const [bipp, alignment] of [[1, 4], [8, 4], [24, 4], [32, 8]]) {
            const image = new Pixel_Buffer({
                size: [3, 2],
                bits_per_pixel: bipp,
                rowAlignmentBytes: alignment
            });
            image.storage.fill(0x5A);
            const invalid = [[-1, 0], [3, 0], [0, -1], [0, 2], [-1000, 1000]];
            for (const position of invalid) {
                const before = image.storage.slice();
                assert.throws(() => image.set_pixel(position, colorFor(bipp, 91)), RangeError);
                assert.deepStrictEqual(image.storage, before);
                assert.throws(() => image.get_pixel(position), RangeError);
            }
            for (const position of [[0.5, 0], [0, NaN], [Infinity, 0], null, {}]) {
                const before = image.storage.slice();
                assert.throws(() => image.set_pixel(position, colorFor(bipp, 7)), TypeError);
                assert.deepStrictEqual(image.storage, before);
                assert.throws(() => image.get_pixel(position), TypeError);
            }
        }
    });

    test('format-specialized coordinate methods enforce the same bounds policy', () => {
        const formats = [
            {bipp: 1, get: 'get_pixel_1bipp', set: 'set_pixel_1bipp'},
            {bipp: 8, get: 'get_pixel_8bipp', set: 'set_pixel_8bipp'},
            {bipp: 24, get: 'get_pixel_24bipp', set: 'set_pixel_24bipp'},
            {bipp: 32, get: 'get_pixel_32bipp', set: 'set_pixel_32bipp'}
        ];
        for (const {bipp, get, set} of formats) {
            const image = new Pixel_Buffer({size: [3, 2], bits_per_pixel: bipp, rowAlignmentBytes: 8});
            for (const position of [[-1, 1], [3, 0], [0, 2]]) {
                const before = image.storage.slice();
                assert.throws(() => image[set](position, colorFor(bipp, 23)), RangeError);
                assert.deepStrictEqual(image.storage, before);
                assert.throws(() => image[get](position), RangeError);
            }
        }
    });

    test('packed-bit address and on/off helpers cannot reach tails or padding', () => {
        const image = new Pixel_Buffer({
            size: [5, 2],
            bits_per_pixel: 1,
            rowAlignmentBytes: 4
        });
        image.storage.fill(0xA0);
        const before = image.storage.slice();
        for (const position of [[-1, 1], [5, 0], [0, 2]]) {
            assert.throws(() => image.get_pixel_byte_bit_1bipp(position), RangeError);
            assert.throws(() => image.get_pixel_byte_bit_BE_1bipp(position), RangeError);
            assert.throws(() => image.set_pixel_on_1bipp(position), RangeError);
            assert.throws(() => image.set_pixel_off_1bipp(position), RangeError);
            assert.deepStrictEqual(image.storage, before);
        }
        assert.throws(() => image.set_pixel_on_1bipp_xy(-1, 1), RangeError);
        assert.throws(() => image.set_pixel_on_1bipp_xy(5, 0), RangeError);
        assert.deepStrictEqual(image.storage, before);
    });

    test('generic and specialized index access reject invalid logical indexes', () => {
        const formats = [
            {bipp: 1, get: 'get_pixel_by_idx_1bipp', set: 'set_pixel_by_idx_1bipp'},
            {bipp: 8, get: 'get_pixel_by_idx_8bipp', set: 'set_pixel_by_idx_8bipp'},
            {bipp: 24, get: 'get_pixel_by_idx_24bipp', set: 'set_pixel_by_idx_24bipp'},
            {bipp: 32, get: 'get_pixel_by_idx_32bipp', set: 'set_pixel_by_idx_32bipp'}
        ];
        for (const {bipp, get, set} of formats) {
            const image = new Pixel_Buffer({size: [3, 2], bits_per_pixel: bipp, rowAlignmentBytes: 8});
            image.storage.fill(0x3C);
            for (const index of [-1, 6]) {
                const before = image.storage.slice();
                assert.throws(() => image[set](index, colorFor(bipp, 31)), RangeError);
                assert.throws(() => image.set_pixel_by_idx(index, colorFor(bipp, 31)), RangeError);
                assert.deepStrictEqual(image.storage, before);
                assert.throws(() => image[get](index), RangeError);
                assert.throws(() => image.get_pixel_by_idx(index), RangeError);
            }
            for (const index of [0.5, NaN, Infinity, '1']) {
                assert.throws(() => image[set](index, colorFor(bipp, 31)), TypeError);
                assert.throws(() => image[get](index), TypeError);
            }
        }

        const packed = new Pixel_Buffer({size: [5, 2], bits_per_pixel: 1, rowAlignmentBytes: 4});
        const before = packed.storage.slice();
        assert.throws(() => packed.set_pixel_on_1bipp_by_pixel_index(10), RangeError);
        assert.throws(() => packed.set_pixel_off_1bipp_by_pixel_index(-1), RangeError);
        assert.deepStrictEqual(packed.storage, before);
    });

    test('invalid subview access cannot touch logical bytes, spare capacity, or sentinels', () => {
        const backing = new Uint8Array(40).fill(0xD3);
        const supplied = backing.subarray(5, 33);
        const image = new Pixel_Buffer({
            size: [3, 2],
            bits_per_pixel: 24,
            rowAlignmentBytes: 4,
            ta: supplied
        });
        const before = backing.slice();
        for (const position of [[-1, 1], [3, 0], [0, 2]]) {
            assert.throws(() => image.set_pixel(position, [1, 2, 3]), RangeError);
        }
        for (const index of [-1, 6]) {
            assert.throws(() => image.set_pixel_by_idx(index, [1, 2, 3]), RangeError);
        }
        assert.deepStrictEqual(backing, before);
        assert.strictEqual(image.ta.byteOffset, supplied.byteOffset);
        assert.strictEqual(image.storage, supplied);
    });

    test('wide valid coordinates remain supported by checked public access', () => {
        const image = new Pixel_Buffer({size: [40002, 1], bits_per_pixel: 8});
        image.set_pixel([40001, 0], 231);
        assert.strictEqual(image.get_pixel([40001, 0]), 231);
        image.set_pixel_by_idx(40000, 217);
        assert.strictEqual(image.get_pixel_by_idx(40000), 217);
    });

    test('seeded valid access matches an oracle and invalid access is atomic', () => {
        const random = createSeededRandom(0xC0FFEE);
        for (const [bipp, alignment] of [[1, 4], [8, 4], [24, 8], [32, 8]]) {
            for (let caseIndex = 0; caseIndex < 12; caseIndex++) {
                const width = 1 + random(11);
                const height = 1 + random(6);
                const image = new Pixel_Buffer({
                    size: [width, height],
                    bits_per_pixel: bipp,
                    rowAlignmentBytes: alignment
                });
                const emptyColor = bipp <= 8 ? 0 : new Array(bipp >> 3).fill(0);
                const oracle = new Array(width * height).fill(null).map(() => emptyColor);
                for (let operation = 0; operation < 80; operation++) {
                    const x = random(width);
                    const y = random(height);
                    const index = y * width + x;
                    const color = colorFor(bipp, random(256));
                    if ((operation & 1) === 0) image.set_pixel([x, y], color);
                    else image.set_pixel_by_idx(index, color);
                    oracle[index] = color;
                    assert.deepStrictEqual(asArray(image.get_pixel([x, y])), color);
                    assert.deepStrictEqual(asArray(image.get_pixel_by_idx(index)), color);

                    const before = image.storage.slice();
                    const outside = operation & 2 ? [width, y] : [-1, y];
                    assert.throws(() => image.set_pixel(outside, color), RangeError);
                    assert.deepStrictEqual(image.storage, before);
                }
                for (let index = 0; index < oracle.length; index++) {
                    assert.deepStrictEqual(asArray(image.get_pixel_by_idx(index)), oracle[index]);
                }
                for (let y = 0; y < height; y++) {
                    const padding = image.ta.subarray(
                        y * image.bytes_per_row + image.layout.rowDataBytes,
                        (y + 1) * image.bytes_per_row
                    );
                    assert.deepStrictEqual([...padding], new Array(padding.length).fill(0));
                    if (bipp === 1 && image.layout.tailMask !== 0xFF) {
                        const tail = image.ta[y * image.bytes_per_row + image.layout.rowDataBytes - 1];
                        assert.strictEqual(tail & ~image.layout.tailMask, 0);
                    }
                }
            }
        }
    });

    return {passed, failed};
};

if (require.main === module) {
    const {passed, failed} = runPixelBufferAccessContractTests();
    console.log(`\nTest summary: ${passed} passed, ${failed} failed.`);
    process.exit(failed > 0 ? 1 : 0);
}

module.exports = runPixelBufferAccessContractTests;
