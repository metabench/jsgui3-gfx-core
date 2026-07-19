'use strict';

const assert = require('assert');
const { Pixel_Buffer } = require('../core/gfx-core');

const testPixelBufferLayout = () => {
    let passed = 0;
    let failed = 0;

    const runTest = (description, testFn) => {
        try {
            testFn();
            console.log(`  ${description}: ${'\x1b[32m✔ Passed\x1b[0m'}`);
            passed++;
        } catch (err) {
            console.log(`  ${description}: ${'\x1b[31m✘ Failed\x1b[0m'}`);
            console.error(`    ${err && err.stack ? err.stack : err}`);
            failed++;
        }
    };

    const makePixelBuffer = (width, height, bitsPerPixel, extra = {}) => (
        new Pixel_Buffer({
            size: [width, height],
            bits_per_pixel: bitsPerPixel,
            ...extra
        })
    );

    const assertLayoutFields = (layout, expected) => {
        for (const [name, value] of Object.entries(expected)) {
            assert.strictEqual(
                layout[name],
                value,
                `layout.${name} should be ${value}, got ${layout[name]}`
            );
        }
    };

    const expectedTailMask = (width) => {
        const validBits = width & 7;
        return validBits === 0
            ? 0xFF
            : (0xFF << (8 - validBits)) & 0xFF;
    };

    const assertCanonical1bippRows = (pb) => {
        const {
            height,
            rowDataBytes,
            rowStrideBytes,
            tailMask
        } = pb.layout;

        for (let y = 0; y < height; y++) {
            const rowStart = y * rowStrideBytes;
            const lastDataByte = rowStart + rowDataBytes - 1;

            assert.strictEqual(
                pb.ta[lastDataByte] & ((~tailMask) & 0xFF),
                0,
                `row ${y} has non-zero bits outside its tail mask`
            );

            for (
                let byteIndex = rowStart + rowDataBytes;
                byteIndex < rowStart + rowStrideBytes;
                byteIndex++
            ) {
                assert.strictEqual(
                    pb.ta[byteIndex],
                    0,
                    `row ${y} padding byte ${byteIndex - rowStart} should be zero`
                );
            }
        }
    };

    console.log('Running Pixel_Buffer immutable layout tests...');

    runTest('layout is a frozen, canonical source of memory geometry', () => {
        const pb = makePixelBuffer(5, 3, 1);
        const layout = pb.layout;

        assert.ok(layout, 'Pixel_Buffer should expose a layout object');
        assert.ok(Object.isFrozen(layout), 'layout should be frozen');
        assert.ok(Object.isFrozen(pb.size), 'public size should not mutate away from layout');
        assertLayoutFields(layout, {
            width: 5,
            height: 3,
            bitsPerPixel: 1,
            bytesPerPixel: 0,
            rowDataBytes: 1,
            rowStrideBytes: 1,
            logicalByteLength: 3,
            bitOrder: 'msb-first',
            rowPacking: 'byte-aligned',
            rowPaddingPolicy: 'zero-filled',
            rowAlignmentBytes: 1,
            tailMask: 0xF8
        });
        assert.ok(
            layout.capacityByteLength >= layout.logicalByteLength,
            'internal capacity should cover the logical image'
        );
        assert.strictEqual(
            layout.capacityByteLength % 8,
            0,
            'internal capacity should retain 8-byte fast-path alignment'
        );
        assert.strictEqual(pb.bytes_per_row, layout.rowStrideBytes);
        assert.strictEqual(pb.bypr, layout.rowStrideBytes);
        assert.strictEqual(pb.ta.byteLength, layout.logicalByteLength);
        assert.strictEqual(pb.storage.byteLength, layout.capacityByteLength);

        assert.throws(() => {
            layout.width = 99;
        }, TypeError, 'a frozen layout field must not be assignable');
        assert.strictEqual(layout.width, 5);
    });

    runTest('dimensions and bits-per-pixel are validated before allocation', () => {
        const invalidSizes = [
            [0, 1],
            [1, 0],
            [-1, 1],
            [1, -1],
            [1.5, 2],
            [2, 1.5],
            [NaN, 1],
            [1, Infinity],
            ['2', 1],
            [Number.MAX_SAFE_INTEGER + 1, 1]
        ];

        for (const size of invalidSizes) {
            assert.throws(
                () => new Pixel_Buffer({ size, bits_per_pixel: 8 }),
                /width|height|size|dimension|integer|safe/i,
                `size ${String(size)} should be rejected`
            );
        }

        for (const bitsPerPixel of [0, 2, 7, 16, 48, NaN, '8']) {
            assert.throws(
                () => new Pixel_Buffer({
                    size: [1, 1],
                    bits_per_pixel: bitsPerPixel
                }),
                /bits|bipp|pixel|unsupported|invalid/i,
                `bits_per_pixel ${String(bitsPerPixel)} should be rejected`
            );
        }

        assert.throws(
            () => makePixelBuffer(Number.MAX_SAFE_INTEGER, 1, 32),
            /overflow|large|length|size|safe/i,
            'row-size overflow should be rejected before allocation'
        );

        for (const rowAlignmentBytes of [0, 3, (2 ** 52) - 1]) {
            assert.throws(
                () => makePixelBuffer(1, 1, 8, {rowAlignmentBytes}),
                /alignment|power|integer/i,
                `row alignment ${rowAlignmentBytes} should be rejected`
            );
        }
    });

    runTest('dimensions above the old signed-16-bit limit remain valid', () => {
        const pb = makePixelBuffer(40000, 1, 1);
        assert.strictEqual(pb.layout.width, 40000);
        assert.strictEqual(pb.size[0], 40000);
        assert.strictEqual(pb.layout.rowDataBytes, 5000);

        pb.set_pixel([39999, 0], 1);
        assert.strictEqual(pb.get_pixel([39999, 0]), 1);
        assert.strictEqual(pb.ta[4999], 0x01);

        const wideByteBuffer = makePixelBuffer(40000, 1, 8);
        let count = 0;
        let finalX = -1;
        wideByteBuffer.each_pixel((pos) => {
            count++;
            finalX = pos[0];
        });
        assert.strictEqual(count, 40000);
        assert.strictEqual(finalX, 39999);
        assert.strictEqual(wideByteBuffer.ta_colorspace[0], 40000);
        assert.strictEqual(wideByteBuffer.ta_colorspace[3], 40000);
    });

    runTest('format and layout cannot be mutated in place', () => {
        const pb = makePixelBuffer(2, 2, 8);
        const originalLayout = pb.layout;
        const originalTa = pb.ta;
        const originalDataView = pb.dv;

        for (const mutate of [
            () => { pb.bipp = 24; },
            () => { pb.bits_per_pixel = 24; },
            () => { pb.bypp = 3; },
            () => { pb.bytes_per_pixel = 3; },
            () => { pb.size = [3, 3]; },
            () => { pb.size[0] = 3; },
            () => { pb.ta = new Uint8Array(12); }
        ]) {
            assert.throws(mutate, /read.?only|immutable|assign|format|layout|bipp|pixel/i);
            assert.strictEqual(pb.bipp, 8);
            assert.strictEqual(pb.bits_per_pixel, 8);
            assert.strictEqual(pb.layout, originalLayout);
            assert.strictEqual(pb.ta, originalTa);
            assert.strictEqual(pb.dv, originalDataView);
            assert.strictEqual(pb.ta.byteLength, 4);
        }
    });

    runTest('a Buffer subview preserves its offset and bounded capacity', () => {
        const slab = Buffer.alloc(24, 0xA5);
        const supplied = slab.subarray(7, 13);
        const pb = makePixelBuffer(2, 2, 8, { buffer: supplied });

        assertLayoutFields(pb.layout, {
            logicalByteLength: 4,
            capacityByteLength: 6
        });
        assert.strictEqual(pb.storage.buffer, supplied.buffer);
        assert.strictEqual(pb.storage.byteOffset, supplied.byteOffset);
        assert.strictEqual(pb.storage.byteLength, supplied.byteLength);
        assert.strictEqual(pb.ta.buffer, supplied.buffer);
        assert.strictEqual(pb.ta.byteOffset, supplied.byteOffset);
        assert.strictEqual(pb.ta.byteLength, 4);

        pb.set_pixel([0, 0], 11);
        pb.set_pixel([1, 1], 44);
        assert.deepStrictEqual([...slab.subarray(7, 11)], [11, 0xA5, 0xA5, 44]);
        assert.strictEqual(slab[6], 0xA5, 'byte before the supplied view changed');
        assert.strictEqual(slab[11], 0xA5, 'capacity beyond the logical image changed');
        assert.strictEqual(slab[13], 0xA5, 'byte after the supplied view changed');
    });

    runTest('a typed-array subview preserves offset while exposing only logical bytes', () => {
        const backing = new Uint8Array(32);
        backing.fill(0xCC);
        const supplied = new Uint8Array(backing.buffer, 5, 9);
        const pb = makePixelBuffer(3, 2, 8, { ta: supplied });

        assertLayoutFields(pb.layout, {
            rowDataBytes: 3,
            rowStrideBytes: 3,
            logicalByteLength: 6,
            capacityByteLength: 9
        });
        assert.strictEqual(pb.storage.buffer, backing.buffer);
        assert.strictEqual(pb.storage.byteOffset, 5);
        assert.strictEqual(pb.storage.byteLength, 9);
        assert.strictEqual(pb.ta.buffer, backing.buffer);
        assert.strictEqual(pb.ta.byteOffset, 5);
        assert.strictEqual(pb.ta.byteLength, 6);

        pb.set_pixel([2, 1], 77);
        assert.strictEqual(backing[10], 77);
        assert.strictEqual(backing[4], 0xCC);
        assert.strictEqual(backing[11], 0xCC, 'unused capacity should not be touched');
    });

    runTest('short and non-byte storage views are rejected', () => {
        const shortTa = new Uint8Array(5);
        const shortBuffer = Buffer.alloc(5);

        assert.throws(
            () => makePixelBuffer(3, 2, 8, { ta: shortTa }),
            /storage|buffer|short|length|bytes|required/i
        );
        assert.throws(
            () => makePixelBuffer(3, 2, 8, { buffer: shortBuffer }),
            /storage|buffer|short|length|bytes|required/i
        );
        assert.throws(
            () => makePixelBuffer(3, 2, 8, {
                ta: new Uint8Array(6),
                buffer: new Uint8Array(6)
            }),
            /conflict|storage|buffer/i
        );

        for (const storage of [
            new Uint16Array(8),
            new Int8Array(16),
            new DataView(new ArrayBuffer(16)),
            [0, 0, 0, 0, 0, 0]
        ]) {
            assert.throws(
                () => makePixelBuffer(3, 2, 8, { ta: storage }),
                /storage|buffer|byte|Uint8|typed|view/i,
                `${storage.constructor.name} should not be accepted as byte storage`
            );
        }
    });

    runTest('logical length, not spare capacity, defines pixel iteration', () => {
        const supplied = new Uint8Array(32);
        supplied.fill(0xE1);
        const pb = makePixelBuffer(3, 2, 24, { ta: supplied });

        assert.strictEqual(pb.layout.logicalByteLength, 18);
        assert.strictEqual(pb.layout.capacityByteLength, 32);
        assert.strictEqual(pb.ta.length, 18);
        assert.strictEqual(pb.storage.length, 32);

        const byteIndexes = [];
        pb.each_pixel_byte_index(byteIndex => byteIndexes.push(byteIndex));
        assert.deepStrictEqual(byteIndexes, [0, 3, 6, 9, 12, 15]);

        pb.color_whole(new Uint8ClampedArray([1, 2, 3]));
        assert.deepStrictEqual([...pb.ta], [
            1, 2, 3, 1, 2, 3, 1, 2, 3,
            1, 2, 3, 1, 2, 3, 1, 2, 3
        ]);
        assert.deepStrictEqual(
            [...pb.storage.subarray(18)],
            new Array(14).fill(0xE1),
            'bulk operations must not write into spare capacity'
        );
    });

    runTest('1bipp widths 1..17 use independent byte-aligned rows', () => {
        const height = 3;

        for (let width = 1; width <= 17; width++) {
            const pb = makePixelBuffer(width, height, 1);
            const rowBytes = Math.ceil(width / 8);

            assertLayoutFields(pb.layout, {
                rowDataBytes: rowBytes,
                rowStrideBytes: rowBytes,
                logicalByteLength: rowBytes * height,
                tailMask: expectedTailMask(width)
            });

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const value = ((x + y * 3 + width) % 4) === 0 ? 1 : 0;
                    pb.set_pixel([x, y], value);
                }
            }

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const expected = ((x + y * 3 + width) % 4) === 0 ? 1 : 0;
                    assert.strictEqual(
                        pb.get_pixel([x, y]),
                        expected,
                        `${width}x${height} pixel (${x}, ${y})`
                    );
                }
            }
            assertCanonical1bippRows(pb);

            const isolated = makePixelBuffer(width, height, 1);
            isolated.set_pixel([width - 1, 1], 1);
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    assert.strictEqual(
                        isolated.get_pixel([x, y]),
                        y === 1 && x === width - 1 ? 1 : 0,
                        `setting row 1 leaked at width ${width}, pixel (${x}, ${y})`
                    );
                }
            }
        }
    });

    runTest('1bipp uses MSB-first bit order', () => {
        const pb = makePixelBuffer(10, 2, 1);
        for (const x of [0, 1, 7, 8, 9]) {
            pb.set_pixel([x, 0], 1);
        }
        pb.set_pixel([0, 1], 1);

        assert.deepStrictEqual([...pb.ta], [0xC1, 0xC0, 0x80, 0x00]);
        assert.strictEqual(pb.layout.bitOrder, 'msb-first');
        assert.strictEqual(pb.layout.tailMask, 0xC0);

        const viaBinaryHelper = makePixelBuffer(8, 1, 1);
        viaBinaryHelper.tabrw.set_bit(0, 1);
        viaBinaryHelper.tabrw.set_bit(7, 1);
        assert.strictEqual(viaBinaryHelper.ta[0], 0x81);
        assert.strictEqual(viaBinaryHelper.tabrw.get_bit(0), 1);
        assert.strictEqual(viaBinaryHelper.tabrw.get_bit(1), 0);
        assert.strictEqual(viaBinaryHelper.tabrw.get_bit(7), 1);
    });

    runTest('1bipp bulk fill canonicalizes tail bits on every row', () => {
        for (let width = 1; width <= 17; width++) {
            const pb = makePixelBuffer(width, 3, 1);
            pb.color_whole(1);

            for (let y = 0; y < 3; y++) {
                for (let x = 0; x < width; x++) {
                    assert.strictEqual(pb.get_pixel([x, y]), 1);
                }
            }
            assertCanonical1bippRows(pb);

            const { rowDataBytes, rowStrideBytes, tailMask } = pb.layout;
            for (let y = 0; y < 3; y++) {
                const rowStart = y * rowStrideBytes;
                for (let i = 0; i < rowDataBytes - 1; i++) {
                    assert.strictEqual(pb.ta[rowStart + i], 0xFF);
                }
                assert.strictEqual(pb.ta[rowStart + rowDataBytes - 1], tailMask);
            }
        }
    });

    runTest('explicit 1bipp row alignment preserves tail and padding bytes', () => {
        const pb = makePixelBuffer(9, 2, 1, { rowAlignmentBytes: 4 });
        assertLayoutFields(pb.layout, {
            rowDataBytes: 2,
            rowStrideBytes: 4,
            logicalByteLength: 8,
            rowAlignmentBytes: 4,
            tailMask: 0x80
        });

        pb.set_pixel([8, 0], 1);
        pb.set_pixel([0, 1], 1);
        assert.deepStrictEqual([...pb.ta], [0x00, 0x80, 0x00, 0x00, 0x80, 0x00, 0x00, 0x00]);

        pb.color_whole(1);
        assert.deepStrictEqual([...pb.ta], [0xFF, 0x80, 0x00, 0x00, 0xFF, 0x80, 0x00, 0x00]);
        assertCanonical1bippRows(pb);
    });

    runTest('supplied storage is canonicalized without touching spare capacity', () => {
        const supplied = new Uint8Array(10);
        supplied.fill(0xFF);
        const pb = makePixelBuffer(9, 2, 1, {
            rowAlignmentBytes: 4,
            ta: supplied
        });

        assert.strictEqual(pb.layout.logicalByteLength, 8);
        assert.strictEqual(pb.layout.capacityByteLength, 10);
        assert.deepStrictEqual(
            [...pb.ta],
            [0xFF, 0x80, 0x00, 0x00, 0xFF, 0x80, 0x00, 0x00],
            'constructor should clear 1bipp tail bits and row padding'
        );
        assert.deepStrictEqual(
            [...pb.storage.subarray(8)],
            [0xFF, 0xFF],
            'canonicalization should not write beyond logical storage'
        );
        for (let y = 0; y < 2; y++) {
            for (let x = 0; x < 9; x++) {
                assert.strictEqual(pb.get_pixel([x, y]), 1);
            }
        }
    });

    runTest('an explicit row stride is validated and becomes canonical', () => {
        const pb = makePixelBuffer(3, 2, 8, {rowStrideBytes: 5});
        assertLayoutFields(pb.layout, {
            rowDataBytes: 3,
            rowStrideBytes: 5,
            logicalByteLength: 10,
            rowPaddingPolicy: 'zero-filled'
        });
        pb.set_pixel([0, 1], 77);
        assert.strictEqual(pb.ta[5], 77);
        assert.deepStrictEqual([...pb.ta.subarray(3, 5)], [0, 0]);

        assert.throws(
            () => makePixelBuffer(3, 2, 8, {rowStrideBytes: 2}),
            /stride|row|data|small/i
        );
        assert.throws(
            () => makePixelBuffer(3, 2, 8, {
                rowAlignmentBytes: 4,
                rowStrideBytes: 6
            }),
            /stride|align/i
        );
    });

    runTest('8/24/32bipp default row metadata is byte-aligned', () => {
        for (const [bitsPerPixel, bytesPerPixel] of [[8, 1], [24, 3], [32, 4]]) {
            const pb = makePixelBuffer(3, 2, bitsPerPixel);
            const rowDataBytes = 3 * bytesPerPixel;
            assertLayoutFields(pb.layout, {
                width: 3,
                height: 2,
                bitsPerPixel,
                bytesPerPixel,
                rowDataBytes,
                rowStrideBytes: rowDataBytes,
                logicalByteLength: rowDataBytes * 2,
                rowAlignmentBytes: 1,
                tailMask: 0xFF
            });
            assert.strictEqual(pb.bytes_per_row, rowDataBytes);
        }
    });

    runTest('RGB rows can have explicit alignment without exposing padding as pixels', () => {
        const pb = makePixelBuffer(3, 2, 24, { rowAlignmentBytes: 4 });
        assertLayoutFields(pb.layout, {
            rowDataBytes: 9,
            rowStrideBytes: 12,
            logicalByteLength: 24,
            capacityByteLength: 24,
            rowAlignmentBytes: 4
        });

        pb.set_pixel([2, 0], new Uint8ClampedArray([1, 2, 3]));
        pb.set_pixel([0, 1], new Uint8ClampedArray([4, 5, 6]));
        assert.deepStrictEqual([...pb.ta.subarray(6, 9)], [1, 2, 3]);
        assert.deepStrictEqual([...pb.ta.subarray(9, 12)], [0, 0, 0]);
        assert.deepStrictEqual([...pb.ta.subarray(12, 15)], [4, 5, 6]);
        assert.deepStrictEqual([...pb.get_pixel([2, 0])], [1, 2, 3]);
        assert.deepStrictEqual([...pb.get_pixel([0, 1])], [4, 5, 6]);

        const byteIndexes = [];
        pb.each_pixel_byte_index(byteIndex => byteIndexes.push(byteIndex));
        assert.deepStrictEqual(byteIndexes, [0, 3, 6, 12, 15, 18]);

        pb.color_whole(new Uint8ClampedArray([9, 8, 7]));
        assert.deepStrictEqual([...pb.ta.subarray(9, 12)], [0, 0, 0]);
        assert.deepStrictEqual([...pb.ta.subarray(21, 24)], [0, 0, 0]);
        for (let y = 0; y < 2; y++) {
            for (let x = 0; x < 3; x++) {
                assert.deepStrictEqual([...pb.get_pixel([x, y])], [9, 8, 7]);
            }
        }
    });

    return { passed, failed };
};

if (require.main === module) {
    const { passed, failed } = testPixelBufferLayout();
    console.log(`\nTest summary: ${passed} passed, ${failed} failed.`);
    process.exit(failed > 0 ? 1 : 0);
}

module.exports = testPixelBufferLayout;
