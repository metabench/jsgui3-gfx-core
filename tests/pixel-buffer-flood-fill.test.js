'use strict';

const assert = require('assert');
const {Pixel_Buffer} = require('../core/gfx-core');

const runPixelBufferFloodFillTests = () => {
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

    const alignmentFor = bipp => bipp === 1 || bipp === 8 ? 4 : bipp === 24 ? 8 : 16;
    const make = (width, height, bipp) => new Pixel_Buffer({
        size: [width, height],
        bits_per_pixel: bipp,
        rowAlignmentBytes: alignmentFor(bipp)
    });
    const colorFor = (bipp, id) => {
        if (bipp === 1) return id & 1;
        if (bipp === 8) return id;
        if (bipp === 24) return [id, id + 1, id + 2];
        return [id, id + 1, id + 2, id + 3];
    };
    const asArray = value => typeof value === 'number' ? value : [...value];
    const sameColor = (left, right) => {
        if (typeof left === 'number') return left === right;
        return left.length === right.length && left.every((value, index) => value === right[index]);
    };
    const setGrid = (image, grid) => {
        for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x < grid[y].length; x++) image.set_pixel([x, y], grid[y][x]);
        }
    };
    const assertGrid = (image, expected) => {
        for (let y = 0; y < expected.length; y++) {
            for (let x = 0; x < expected[y].length; x++) {
                assert.deepStrictEqual(asArray(image.get_pixel([x, y])), expected[y][x], `pixel ${x},${y}`);
            }
        }
    };
    const callFloodFill = (image, x, y, color) => {
        if (typeof color === 'number') return image.flood_fill(x, y, color);
        return image.flood_fill(x, y, ...color);
    };
    const paddingBytes = image => {
        const result = [];
        for (let y = 0; y < image.size[1]; y++) {
            const start = y * image.bytes_per_row + image.layout.rowDataBytes;
            const end = (y + 1) * image.bytes_per_row;
            for (let byte = start; byte < end; byte++) result.push(image.ta[byte]);
        }
        return result;
    };

    console.log('Running Pixel_Buffer flood-fill tests...');

    test('8/24/32bipp exhausted queues do not jump to a disconnected origin component', () => {
        for (const bipp of [8, 24, 32]) {
            const image = make(5, 3, bipp);
            const target = colorFor(bipp, 10);
            const wall = colorFor(bipp, 70);
            const replacement = colorFor(bipp, 130);
            const grid = Array.from({length: 3}, () =>
                [target, target, wall, target, target].map(color =>
                    typeof color === 'number' ? color : color.slice()));
            setGrid(image, grid);

            // Non-zero padding makes accidental tight-row addressing visible.
            for (let y = 0; y < image.size[1]; y++) {
                image.ta.fill(0xA5,
                    y * image.bytes_per_row + image.layout.rowDataBytes,
                    (y + 1) * image.bytes_per_row);
            }
            const paddingBefore = paddingBytes(image);
            callFloodFill(image, 4, 1, replacement);

            const expected = grid.map(row => row.map((color, x) =>
                x > 2 ? replacement : color));
            assertGrid(image, expected);
            assert.deepStrictEqual(paddingBytes(image), paddingBefore, `${bipp}bipp padding`);
        }
    });

    test('randomized 1/8/24/32bipp fills match a simple four-connected reference', () => {
        let seed = 0xC0FFEE;
        const random = limit => {
            seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
            return seed % limit;
        };

        for (const bipp of [1, 8, 24, 32]) {
            for (let iteration = 0; iteration < 30; iteration++) {
                const width = 1 + random(9);
                const height = 1 + random(8);
                const image = make(width, height, bipp);
                const palette = bipp === 1
                    ? [colorFor(bipp, 0), colorFor(bipp, 1)]
                    : [colorFor(bipp, 11), colorFor(bipp, 41), colorFor(bipp, 81)];
                const grid = Array.from({length: height}, () =>
                    Array.from({length: width}, () => {
                        const color = palette[random(palette.length)];
                        return typeof color === 'number' ? color : color.slice();
                    }));
                setGrid(image, grid);

                const startX = random(width);
                const startY = random(height);
                const target = grid[startY][startX];
                const replacement = bipp === 1 ? 1 - target : colorFor(bipp, 173);
                const expected = grid.map(row => row.map(color =>
                    typeof color === 'number' ? color : color.slice()));
                const queue = [[startX, startY]];
                expected[startY][startX] = replacement;
                for (let read = 0; read < queue.length; read++) {
                    const [x, y] = queue[read];
                    const neighbours = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]];
                    for (const [nx, ny] of neighbours) {
                        if (nx >= 0 && ny >= 0 && nx < width && ny < height &&
                            sameColor(expected[ny][nx], target)) {
                            expected[ny][nx] = replacement;
                            queue.push([nx, ny]);
                        }
                    }
                }

                callFloodFill(image, startX, startY, replacement);
                assertGrid(image, expected);
                assert.deepStrictEqual(
                    paddingBytes(image),
                    new Array(paddingBytes(image).length).fill(0),
                    `${bipp}bipp iteration ${iteration} padding`
                );
                if (bipp === 1 && image.layout.tailMask !== 0xFF) {
                    for (let y = 0; y < height; y++) {
                        const tailByte = y * image.bytes_per_row + image.layout.rowDataBytes - 1;
                        assert.strictEqual(image.ta[tailByte] & ~image.layout.tailMask, 0);
                    }
                }
            }
        }
    });

    test('single-pixel and one-dimensional images fill correctly for every supported depth', () => {
        for (const bipp of [1, 8, 24, 32]) {
            for (const [width, height, x, y] of [[1, 1, 0, 0], [1, 7, 0, 3], [7, 1, 3, 0]]) {
                const image = make(width, height, bipp);
                const target = colorFor(bipp, bipp === 1 ? 0 : 25);
                const replacement = colorFor(bipp, bipp === 1 ? 1 : 155);
                image.color_whole(target);
                callFloodFill(image, x, y, replacement);
                for (let py = 0; py < height; py++) {
                    for (let px = 0; px < width; px++) {
                        assert.deepStrictEqual(asArray(image.get_pixel([px, py])), replacement);
                    }
                }
            }
        }
    });

    test('all depths validate the starting coordinate before touching storage', () => {
        for (const bipp of [1, 8, 24, 32]) {
            const image = make(3, 2, bipp);
            const before = image.ta.slice();
            const replacement = colorFor(bipp, 1);
            for (const [x, y] of [[-1, 0], [0, -1], [3, 0], [0, 2], [0.5, 0]]) {
                assert.throws(() => callFloodFill(image, x, y, replacement), RangeError);
                assert.deepStrictEqual(image.ta, before);
            }
        }
    });

    test('1bipp fill allocates a bounded span frontier rather than a fixed 16 MiB stack', () => {
        const image = make(1024, 1024, 1);
        image.color_whole(1);
        image.set_pixel([512, 512], 0);

        const OriginalUint16Array = global.Uint16Array;
        const OriginalUint32Array = global.Uint32Array;
        const allocations = [];
        const trackingConstructor = Original => new Proxy(Original, {
            construct(target, args) {
                if (typeof args[0] === 'number') allocations.push(args[0]);
                return Reflect.construct(target, args, target);
            }
        });
        global.Uint16Array = trackingConstructor(OriginalUint16Array);
        global.Uint32Array = trackingConstructor(OriginalUint32Array);
        try {
            image.flood_fill_1bipp(512, 512, 1);
        } finally {
            global.Uint16Array = OriginalUint16Array;
            global.Uint32Array = OriginalUint32Array;
        }

        assert.strictEqual(image.get_pixel([512, 512]), 1);
        assert.ok(allocations.length > 0, 'expected a typed span stack allocation');
        assert.ok(Math.max(...allocations) <= 768,
            `largest temporary coordinate array was ${Math.max(...allocations)} elements`);
    });

    test('direct 1bipp entry points preserve four-connectivity and packed-row padding', () => {
        const image = make(11, 5, 1);
        image.color_whole(0);
        for (let y = 0; y < 5; y++) image.set_pixel([5, y], 1);
        image.flood_fill_c1_1bipp(new Uint16Array([8, 2]));
        for (let y = 0; y < 5; y++) {
            for (let x = 0; x < 11; x++) {
                assert.strictEqual(image.get_pixel([x, y]), x >= 5 ? 1 : 0, `${x},${y}`);
            }
            const tailByte = y * image.bytes_per_row + image.layout.rowDataBytes - 1;
            assert.strictEqual(image.ta[tailByte] & ~image.layout.tailMask, 0);
            assert.deepStrictEqual(
                [...image.ta.subarray(y * image.bytes_per_row + image.layout.rowDataBytes,
                    (y + 1) * image.bytes_per_row)],
                new Array(image.bytes_per_row - image.layout.rowDataBytes).fill(0)
            );
        }
    });

    test('flood_fill_self_get_pixel_pos_list reports exactly the changed region', () => {
        for (const bipp of [1, 8, 24, 32]) {
            const image = make(4, 3, bipp);
            const target = colorFor(bipp, bipp === 1 ? 0 : 12);
            const wall = colorFor(bipp, bipp === 1 ? 1 : 72);
            const replacement = colorFor(bipp, bipp === 1 ? 1 : 142);
            const grid = Array.from({length: 3}, () => [target, wall, target, target]);
            setGrid(image, grid);
            const list = image.flood_fill_self_get_pixel_pos_list(
                new Uint32Array([3, 1]), replacement
            );
            assert.deepStrictEqual([...list].sort(),
                [[2, 0], [2, 1], [2, 2], [3, 0], [3, 1], [3, 2]].sort());
            for (let y = 0; y < 3; y++) {
                assert.deepStrictEqual(asArray(image.get_pixel([0, y])), target);
                assert.deepStrictEqual(asArray(image.get_pixel([1, y])), wall);
                assert.deepStrictEqual(asArray(image.get_pixel([2, y])), replacement);
                assert.deepStrictEqual(asArray(image.get_pixel([3, y])), replacement);
            }
        }
    });

    test('outer-boundary flood helpers leave enclosed regions untouched', () => {
        const binary = make(5, 5, 1);
        for (let x = 1; x <= 3; x++) {
            binary.set_pixel([x, 1], 1);
            binary.set_pixel([x, 3], 1);
        }
        for (let y = 1; y <= 3; y++) {
            binary.set_pixel([1, y], 1);
            binary.set_pixel([3, y], 1);
        }
        binary.flood_fill_off_pixels_from_outer_boundary_on_1bipp();
        for (let y = 0; y < 5; y++) {
            for (let x = 0; x < 5; x++) {
                assert.strictEqual(binary.get_pixel([x, y]), x === 2 && y === 2 ? 0 : 1);
            }
        }

        for (const bipp of [8, 24, 32]) {
            const image = make(5, 5, bipp);
            const given = colorFor(bipp, 20);
            const wall = colorFor(bipp, 80);
            const replacement = colorFor(bipp, 150);
            image.color_whole(given);
            for (let x = 1; x <= 3; x++) {
                image.set_pixel([x, 1], wall);
                image.set_pixel([x, 3], wall);
            }
            for (let y = 1; y <= 3; y++) {
                image.set_pixel([1, y], wall);
                image.set_pixel([3, y], wall);
            }
            image.flood_fill_given_color_pixels_from_outer_boundary(given, replacement);
            for (let y = 0; y < 5; y++) {
                for (let x = 0; x < 5; x++) {
                    const expected = x === 2 && y === 2 ? given
                        : (x >= 1 && x <= 3 && y >= 1 && y <= 3 ? wall : replacement);
                    assert.deepStrictEqual(asArray(image.get_pixel([x, y])), expected, `${bipp}: ${x},${y}`);
                }
            }
        }
    });

    test('inner 1bipp flood helper fills holes without changing the exterior', () => {
        const image = make(5, 5, 1);
        for (let x = 1; x <= 3; x++) {
            image.set_pixel([x, 1], 1);
            image.set_pixel([x, 3], 1);
        }
        for (let y = 1; y <= 3; y++) {
            image.set_pixel([1, y], 1);
            image.set_pixel([3, y], 1);
        }
        image.flood_fill_inner_pixels_off_to_on_1bipp();
        for (let y = 0; y < 5; y++) {
            for (let x = 0; x < 5; x++) {
                const expected = x >= 1 && x <= 3 && y >= 1 && y <= 3 ? 1 : 0;
                assert.strictEqual(image.get_pixel([x, y]), expected, `${x},${y}`);
            }
        }
    });

    test('same-color fills are no-ops and preserve the existing return conventions', () => {
        const binary = make(2, 2, 1);
        binary.color_whole(1);
        const beforeBinary = binary.ta.slice();
        assert.strictEqual(binary.flood_fill_1bipp(0, 0, 1), 0);
        assert.deepStrictEqual(binary.ta, beforeBinary);

        for (const bipp of [8, 24, 32]) {
            const image = make(2, 2, bipp);
            const color = colorFor(bipp, 42);
            image.color_whole(color);
            const before = image.ta.slice();
            assert.strictEqual(callFloodFill(image, 0, 0, color), image);
            assert.deepStrictEqual(image.ta, before);
        }
    });

    console.log(`\nPixel_Buffer flood-fill tests: ${passed} passed, ${failed} failed`);
    return {passed, failed};
};

if (require.main === module) {
    const result = runPixelBufferFloodFillTests();
    if (result.failed > 0) process.exitCode = 1;
}

module.exports = runPixelBufferFloodFillTests;
