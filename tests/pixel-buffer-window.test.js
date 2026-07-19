'use strict';

const assert = require('assert');
const {Pixel_Buffer} = require('../core/gfx-core');

const runPixelBufferWindowTests = () => {
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

    const make = (width, height, bitsPerPixel, extra = {}) => new Pixel_Buffer({
        size: [width, height],
        bits_per_pixel: bitsPerPixel,
        ...extra
    });

    const colorAt = (bitsPerPixel, index) => {
        if (bitsPerPixel === 8) return index + 1;
        if (bitsPerPixel === 24) return [index + 1, index + 21, index + 41];
        return [index + 1, index + 21, index + 41, index + 61];
    };

    const asArray = value => typeof value === 'number' ? value : [...value];

    console.log('Running Pixel_Buffer source-window tests...');

    test('all source aliases attach and populate a window at spec.pos', () => {
        const source = make(4, 3, 8, {rowAlignmentBytes: 4});
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 4; x++) {
                source.set_pixel([x, y], y * 4 + x + 1);
            }
        }

        for (const alias of ['window_to', 'source', 'window_to_source']) {
            const window = new Pixel_Buffer({
                size: [3, 2],
                [alias]: source,
                pos: [1, 1],
                rowAlignmentBytes: 4
            });
            assert.strictEqual(window.source, source);
            assert.deepStrictEqual([...window.pos], [1, 1]);
            assert.strictEqual(window.bipp, 8);
            assert.deepStrictEqual(
                Array.from({length: 6}, (_, index) => window.get_pixel_by_idx(index)),
                [6, 7, 8, 10, 11, 12]
            );
            assert.deepStrictEqual([...window.ta.subarray(3, 4)], [0]);
            assert.deepStrictEqual([...window.ta.subarray(7, 8)], [0]);
        }

        const options = {size: [2, 1], pos: [2, 0]};
        const viaMethod = source.new_window(options);
        assert.deepStrictEqual(options, {size: [2, 1], pos: [2, 0]});
        assert.deepStrictEqual([...viaMethod.ta], [3, 4]);

        const detached = make(2, 1, 8);
        detached.source = source;
        detached.pos = new Int32Array([1, 2]);
        detached.copy_from_source();
        assert.deepStrictEqual([...detached.ta], [10, 11]);
    });

    test('source aliases and format contradictions fail at construction', () => {
        const source8 = make(2, 2, 8);
        const other8 = make(2, 2, 8);
        const source24 = make(2, 2, 24);

        assert.throws(() => new Pixel_Buffer({
            size: [1, 1],
            source: source8,
            window_to: other8
        }), /Conflicting source and window_to|Conflicting window_to and source/);
        assert.throws(() => new Pixel_Buffer({
            size: [1, 1],
            source: source8,
            bits_per_pixel: 24
        }), /contradicts/);
        assert.throws(() => new Pixel_Buffer({
            size: [1, 1],
            source: {}
        }), /another Pixel Buffer/);
        assert.throws(() => {
            source8.source = source24;
        }, /expected 8bipp/);
    });

    test('coordinate inputs preserve safe integers and expose coherent derived state', () => {
        const image = make(3, 5, 8, {
            pos_center: new Float64Array([3_000_000_000, -3_000_000_000]),
            pos_bounds: new Int32Array([-40_000, -30_000, 40_000, 30_000])
        });

        assert.ok(image.pos instanceof Float64Array);
        assert.deepStrictEqual([...image.pos], [2_999_999_999, -3_000_000_002]);
        assert.deepStrictEqual([...image.pos_center], [3_000_000_000, -3_000_000_000]);
        assert.deepStrictEqual([...image.edge_offsets_from_center], [-1, -2, 2, 3]);
        assert.deepStrictEqual([...image.minus_pos], [-2_999_999_999, 3_000_000_002]);
        assert.deepStrictEqual([...image.pos_bounds], [-40_000, -30_000, 40_000, 30_000]);

        image.pos = [Number.MAX_SAFE_INTEGER - 2, Number.MIN_SAFE_INTEGER + 2];
        assert.deepStrictEqual(
            [...image.pos],
            [Number.MAX_SAFE_INTEGER - 2, Number.MIN_SAFE_INTEGER + 2]
        );
        assert.throws(() => {
            image.pos = [1.5, 2];
        }, /safe integer/);
        assert.throws(() => {
            image.pos = [1];
        }, /2-element/);
        assert.throws(() => image.move([10, 0]), /safe-integer/);

        assert.throws(() => make(3, 5, 8, {
            pos: [10, 20],
            pos_center: [10, 20]
        }), /different window positions/);
    });

    test('byte-format windows copy padded rows and zero every clipped area', () => {
        for (const bitsPerPixel of [8, 24, 32]) {
            const source = make(3, 2, bitsPerPixel, {rowAlignmentBytes: 8});
            for (let y = 0; y < 2; y++) {
                for (let x = 0; x < 3; x++) {
                    source.set_pixel([x, y], colorAt(bitsPerPixel, y * 3 + x));
                }
            }

            const window = source.new_window({
                size: [4, 3],
                pos: [-1, -1],
                rowAlignmentBytes: 16
            });
            for (let y = 0; y < 3; y++) {
                for (let x = 0; x < 4; x++) {
                    const sourceX = x - 1;
                    const sourceY = y - 1;
                    const inSource = sourceX >= 0 && sourceX < 3 && sourceY >= 0 && sourceY < 2;
                    const expected = inSource
                        ? colorAt(bitsPerPixel, sourceY * 3 + sourceX)
                        : bitsPerPixel === 8 ? 0 : new Array(bitsPerPixel / 8).fill(0);
                    assert.deepStrictEqual(asArray(window.get_pixel([x, y])), expected);
                }
                const dataEnd = y * window.bytes_per_row + window.layout.rowDataBytes;
                const rowEnd = (y + 1) * window.bytes_per_row;
                assert.deepStrictEqual(
                    [...window.ta.subarray(dataEnd, rowEnd)],
                    new Array(rowEnd - dataEnd).fill(0)
                );
            }

            // Moving from one clipped edge to another must not retain pixels
            // that were present in the previous window position.
            window.move([4, 2]);
            assert.deepStrictEqual(
                [...window.calc_source_target_valid_bounds_overlap()],
                [3, 1, 3, 2],
                'a non-overlap should be represented by zero-width bounds'
            );
            for (let y = 0; y < 3; y++) {
                for (let x = 0; x < 4; x++) {
                    const sourceX = x + 3;
                    const sourceY = y + 1;
                    const inSource = sourceX >= 0 && sourceX < 3 && sourceY >= 0 && sourceY < 2;
                    const expected = inSource
                        ? colorAt(bitsPerPixel, sourceY * 3 + sourceX)
                        : bitsPerPixel === 8 ? 0 : new Array(bitsPerPixel / 8).fill(0);
                    assert.deepStrictEqual(asArray(window.get_pixel([x, y])), expected);
                }
            }
        }
    });

    test('1bipp windows copy MSB-first bits while preserving tails and padding', () => {
        const source = make(9, 2, 1, {rowAlignmentBytes: 4});
        source.set_pixel([0, 0], 1);
        source.set_pixel([8, 0], 1);
        source.draw_horizontal_line([2, 5], 1, 1);

        const window = source.new_window({
            size: [7, 3],
            pos: [-2, 0],
            rowAlignmentBytes: 4
        });
        const expectedSet = new Set(['2,0', '4,1', '5,1', '6,1']);
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 7; x++) {
                assert.strictEqual(
                    window.get_pixel([x, y]),
                    expectedSet.has(`${x},${y}`) ? 1 : 0
                );
            }
            const rowStart = y * window.bytes_per_row;
            assert.strictEqual(window.ta[rowStart] & 0x01, 0, 'tail bit must remain zero');
            assert.deepStrictEqual(
                [...window.ta.subarray(rowStart + 1, rowStart + window.bytes_per_row)],
                [0, 0, 0]
            );
        }
    });

    test('wide source coordinates, bounded iteration and move_next_px do not wrap', () => {
        const wide = make(40_002, 1, 8);
        wide.set_pixel([40_001, 0], 231);
        const wideWindow = wide.new_window({size: [1, 1], pos: [40_001, 0]});
        assert.strictEqual(wideWindow.get_pixel([0, 0]), 231);
        assert.deepStrictEqual([...wideWindow.bounds_within_source], [40_001, 0, 40_002, 1]);
        assert.deepStrictEqual([...wide.size_bounds], [0, 0, 40_002, 1]);
        assert.deepStrictEqual(
            [...wideWindow.calc_source_target_valid_bounds_overlap()],
            [40_001, 0, 40_002, 1]
        );

        const source = make(2, 2, 8);
        source.set_pixel([0, 0], 10);
        source.set_pixel([1, 0], 11);
        source.set_pixel([0, 1], 12);
        source.set_pixel([1, 1], 13);
        const iterator = source.new_window({
            size: [1, 1],
            pos: [-1, 0],
            pos_bounds: [-1, 0, 2, 2]
        });
        const visited = [];
        iterator.each_pos_within_bounds(() => {
            visited.push([[...iterator.pos], iterator.get_pixel([0, 0])]);
        });
        assert.deepStrictEqual(visited, [
            [[-1, 0], 0], [[0, 0], 10], [[1, 0], 11],
            [[-1, 1], 0], [[0, 1], 12], [[1, 1], 13]
        ]);

        const stepper = source.new_window({
            size: [1, 1],
            pos: [-1, 0],
            pos_bounds: [-1, 0, 2, 2]
        });
        const steps = [];
        let next;
        while ((next = stepper.move_next_px()) !== false) steps.push([...next]);
        assert.deepStrictEqual(steps, [
            [0, 0], [1, 0], [-1, 1], [0, 1], [1, 1]
        ]);
    });

    test('centered windows and greyscale thresholding use current pixel APIs', () => {
        const source = make(5, 3, 8);
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 5; x++) source.set_pixel([x, y], y * 5 + x);
        }
        const centered = source.new_centered_window([3, 1]);
        assert.deepStrictEqual([...centered.pos], [1, 1]);
        assert.deepStrictEqual([...centered.pos_center], [2, 1]);
        assert.deepStrictEqual([...centered.ta], [6, 7, 8]);

        const greyscale = make(3, 2, 8, {rowAlignmentBytes: 4});
        [0, 127, 128, 129, 200, 1].forEach((value, index) => {
            greyscale.set_pixel_by_idx(index, value);
        });
        const thresholded = greyscale.threshold_gs(128);
        assert.deepStrictEqual(
            Array.from({length: 6}, (_, index) => thresholded.get_pixel_by_idx(index)),
            [0, 0, 255, 255, 255, 0]
        );
        assert.strictEqual(thresholded.ta[3], 0);
        assert.strictEqual(thresholded.ta[7], 0);
    });

    return {passed, failed};
};

if (require.main === module) {
    const {passed, failed} = runPixelBufferWindowTests();
    console.log(`\nTest summary: ${passed} passed, ${failed} failed.`);
    process.exit(failed > 0 ? 1 : 0);
}

module.exports = runPixelBufferWindowTests;
