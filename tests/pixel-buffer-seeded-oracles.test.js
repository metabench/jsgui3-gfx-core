'use strict';

const assert = require('assert');
const {Pixel_Buffer} = require('../core/gfx-core');
const {
    unsafeGetPixel,
    unsafeGetPixelByIndex,
    unsafeSetPixel,
    unsafeSetPixelByIndex
} = require('../core/pixel-buffer-pixel-access');

const createRandom = seed => {
    let state = seed >>> 0;
    return limit => {
        state = (Math.imul(state, 1103515245) + 12345) >>> 0;
        return state % limit;
    };
};

const colorFor = (bipp, value) => {
    if (bipp === 1) return value & 1;
    if (bipp === 8) return value & 255;
    return Array.from({length: bipp >> 3}, (_, channel) =>
        (value + channel * 61) & 255
    );
};

const zeroFor = bipp => bipp <= 8 ? 0 : new Array(bipp >> 3).fill(0);
const copyColor = color => typeof color === 'number' ? color : [...color];
const asArray = color => typeof color === 'number' ? color : [...color];

const readAll = image => Array.from(
    {length: image.size[0] * image.size[1]},
    (_, index) => asArray(image.get_pixel_by_idx(index))
);

const runPixelBufferSeededOracleTests = () => {
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

    console.log('Running seeded Pixel_Buffer oracle tests...');

    test('checked and explicit unsafe access are equivalent for proved-valid inputs', () => {
        const random = createRandom(0x51A7E);
        for (const [bipp, alignment] of [[1, 8], [8, 8], [24, 16], [32, 16]]) {
            const checked = new Pixel_Buffer({
                size: [13, 7], bits_per_pixel: bipp, rowAlignmentBytes: alignment
            });
            const unchecked = checked.blank_copy();
            for (let operation = 0; operation < 500; operation++) {
                const x = random(13), y = random(7), index = y * 13 + x;
                const position = [x, y];
                const color = colorFor(bipp, random(256));
                if (operation & 1) {
                    checked.set_pixel(position, color);
                    unsafeSetPixel(unchecked, position, color);
                    assert.deepStrictEqual(
                        asArray(checked.get_pixel(position)),
                        asArray(unsafeGetPixel(unchecked, position))
                    );
                } else {
                    checked.set_pixel_by_idx(index, color);
                    unsafeSetPixelByIndex(unchecked, index, color);
                    assert.deepStrictEqual(
                        asArray(checked.get_pixel_by_idx(index)),
                        asArray(unsafeGetPixelByIndex(unchecked, index))
                    );
                }
            }
            assert.deepStrictEqual(unchecked.storage, checked.storage);
        }
    });

    test('seeded horizontal lines and painter rectangles match a clipped pixel oracle', () => {
        const random = createRandom(0xD12A11);
        for (const [bipp, alignment] of [[1, 4], [8, 4], [24, 8], [32, 8]]) {
            const width = 11, height = 7;
            const image = new Pixel_Buffer({
                size: [width, height], bits_per_pixel: bipp, rowAlignmentBytes: alignment
            });
            const oracle = new Array(width * height).fill(null).map(() => zeroFor(bipp));
            for (let operation = 0; operation < 80; operation++) {
                const color = colorFor(bipp, random(256));
                if (operation & 1) {
                    const y = random(height + 6) - 3;
                    const endpoints = [
                        random(width + 12) - 6,
                        random(width + 12) - 6
                    ].sort((a, b) => a - b);
                    const [x1, x2] = endpoints;
                    image.draw_horizontal_line([x1, x2], y, color);
                    if (y >= 0 && y < height) {
                        const left = Math.max(0, Math.min(x1, x2));
                        const right = Math.min(width - 1, Math.max(x1, x2));
                        for (let x = left; x <= right; x++) {
                            oracle[y * width + x] = copyColor(color);
                        }
                    }
                } else {
                    const x = random(width + 8) - 4;
                    const y = random(height + 8) - 4;
                    const rectWidth = random(width + 3);
                    const rectHeight = random(height + 3);
                    image.paint.rect([x, y], [rectWidth, rectHeight], color);
                    for (let targetY = Math.max(0, y); targetY < Math.min(height, y + rectHeight); targetY++) {
                        for (let targetX = Math.max(0, x); targetX < Math.min(width, x + rectWidth); targetX++) {
                            oracle[targetY * width + targetX] = copyColor(color);
                        }
                    }
                }
                assert.deepStrictEqual(
                    readAll(image),
                    oracle,
                    `bipp=${bipp}, operation=${operation}`
                );
            }
        }
    });

    test('seeded source windows match a zero-filled clipping oracle', () => {
        const random = createRandom(0x71D0);
        for (const [bipp, alignment] of [[1, 4], [8, 4], [24, 8], [32, 8]]) {
            const source = new Pixel_Buffer({
                size: [9, 6], bits_per_pixel: bipp, rowAlignmentBytes: alignment
            });
            const sourceOracle = [];
            for (let index = 0; index < 54; index++) {
                const color = colorFor(bipp, random(256));
                source.set_pixel_by_idx(index, color);
                sourceOracle.push(copyColor(color));
            }
            for (let example = 0; example < 30; example++) {
                const windowWidth = 1 + random(7), windowHeight = 1 + random(5);
                const position = [random(15) - 5, random(12) - 4];
                const window = source.new_window({
                    size: [windowWidth, windowHeight], pos: position,
                    rowAlignmentBytes: alignment
                });
                const expected = [];
                for (let y = 0; y < windowHeight; y++) {
                    for (let x = 0; x < windowWidth; x++) {
                        const sourceX = position[0] + x, sourceY = position[1] + y;
                        expected.push(
                            sourceX >= 0 && sourceX < 9 && sourceY >= 0 && sourceY < 6
                                ? sourceOracle[sourceY * 9 + sourceX]
                                : zeroFor(bipp)
                        );
                    }
                }
                assert.deepStrictEqual(readAll(window), expected);
            }
        }
    });

    test('seeded clipped placement and generated masks match simple oracles', () => {
        const random = createRandom(0xB117);
        for (const [bipp, alignment] of [[1, 4], [8, 4], [24, 8], [32, 8]]) {
            for (let example = 0; example < 24; example++) {
                const source = new Pixel_Buffer({
                    size: [4, 3], bits_per_pixel: bipp, rowAlignmentBytes: alignment
                });
                const sourceOracle = [];
                for (let index = 0; index < 12; index++) {
                    const color = colorFor(bipp, random(256));
                    source.set_pixel_by_idx(index, color);
                    sourceOracle.push(copyColor(color));
                }
                const target = new Pixel_Buffer({
                    size: [7, 5], bits_per_pixel: bipp, rowAlignmentBytes: alignment
                });
                const targetOracle = new Array(35).fill(null).map(() => zeroFor(bipp));
                const position = [random(11) - 4, random(9) - 3];
                target.place_image_from_pixel_buffer(source, position);
                for (let y = 0; y < 3; y++) {
                    for (let x = 0; x < 4; x++) {
                        const targetX = position[0] + x, targetY = position[1] + y;
                        if (targetX >= 0 && targetX < 7 && targetY >= 0 && targetY < 5) {
                            targetOracle[targetY * 7 + targetX] = sourceOracle[y * 4 + x];
                        }
                    }
                }
                assert.deepStrictEqual(readAll(target), targetOracle);

                const mask = source.get_mask_each_px(color => {
                    const first = typeof color === 'number' ? color : color[0];
                    return (first & 1) === 1;
                });
                assert.deepStrictEqual(
                    readAll(mask),
                    sourceOracle.map(color => {
                        const first = typeof color === 'number' ? color : color[0];
                        return first & 1;
                    })
                );
            }
        }
    });

    return {passed, failed};
};

if (require.main === module) {
    const {passed, failed} = runPixelBufferSeededOracleTests();
    console.log(`\nTest summary: ${passed} passed, ${failed} failed.`);
    process.exit(failed > 0 ? 1 : 0);
}

module.exports = runPixelBufferSeededOracleTests;
