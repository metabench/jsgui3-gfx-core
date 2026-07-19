'use strict';

const assert = require('assert');
const {Pixel_Buffer} = require('../core/gfx-core');
const Polygon = require('../core/shapes/Polygon');
const Polygon_Scanline_Edges = require('../core/shapes/Polygon_Scanline_Edges');
const ScanlineProcessor = require('../core/shapes/ScanlineProcessor');

const runPixelBufferRasterShapeTests = () => {
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

    const make = (bipp, rowAlignmentBytes) => new Pixel_Buffer({
        size: [5, 3],
        bits_per_pixel: bipp,
        rowAlignmentBytes
    });

    const colorFor = bipp => bipp === 1
        ? 1
        : bipp === 8
            ? 91
            : bipp === 24
                ? [91, 92, 93]
                : [91, 92, 93, 94];

    const pixelAsArray = value => typeof value === 'number' ? value : [...value];

    console.log('Running clipped raster and polygon scanline tests...');

    test('horizontal spans clip on both sides without touching the next row or padding', () => {
        const cases = [
            [1, 4],
            [8, 8],
            [24, 16],
            [32, 32]
        ];

        for (const [bipp, alignment] of cases) {
            const image = make(bipp, alignment);
            const color = colorFor(bipp);
            image.draw_horizontal_line([-3, 8], 0, color);

            for (let x = 0; x < 5; x++) {
                assert.deepStrictEqual(pixelAsArray(image.get_pixel([x, 0])), color);
                assert.deepStrictEqual(
                    pixelAsArray(image.get_pixel([x, 1])),
                    bipp <= 8 ? 0 : new Array(bipp / 8).fill(0)
                );
            }

            const rowDataBytes = Math.ceil(5 * bipp / 8);
            assert.deepStrictEqual(
                [...image.ta.subarray(rowDataBytes, image.bytes_per_row)],
                new Array(image.bytes_per_row - rowDataBytes).fill(0)
            );
        }
    });

    test('coordinate-form spans clip and out-of-range rows are no-ops', () => {
        for (const bipp of [1, 8, 24, 32]) {
            const image = make(bipp, 8);
            const color = colorFor(bipp);
            image.draw_horizontal_line_y_x1_x2(1, -20, 20, color);
            image.draw_horizontal_line_y_x1_x2(-1, 0, 4, color);
            image.draw_horizontal_line_y_x1_x2(3, 0, 4, color);

            for (let x = 0; x < 5; x++) {
                assert.deepStrictEqual(pixelAsArray(image.get_pixel([x, 1])), color);
                assert.deepStrictEqual(
                    pixelAsArray(image.get_pixel([x, 0])),
                    bipp <= 8 ? 0 : new Array(bipp / 8).fill(0)
                );
                assert.deepStrictEqual(
                    pixelAsArray(image.get_pixel([x, 2])),
                    bipp <= 8 ? 0 : new Array(bipp / 8).fill(0)
                );
            }
        }
    });

    test('partially visible lines are clipped before raster writes', () => {
        for (const bipp of [1, 8, 24, 32]) {
            const image = make(bipp, 8);
            const color = colorFor(bipp);
            image.draw_line([-1000, 0], [1000, 0], color);
            image.draw_line([-20, -20], [-10, -10], color);

            for (let x = 0; x < 5; x++) {
                assert.deepStrictEqual(pixelAsArray(image.get_pixel([x, 0])), color);
                assert.deepStrictEqual(
                    pixelAsArray(image.get_pixel([x, 1])),
                    bipp <= 8 ? 0 : new Array(bipp / 8).fill(0)
                );
            }
        }
    });

    test('line drawing rejects non-finite coordinates and terminates for fractions', () => {
        const image = make(8, 8);
        assert.throws(
            () => image.draw_line([NaN, 0], [1, 1], 91),
            /finite numbers/
        );
        image.draw_line([0.75, 0.25], [4.75, 0.25], 91);
        assert.deepStrictEqual(
            Array.from({length: 5}, (_, x) => image.get_pixel([x, 0])),
            [91, 91, 91, 91, 91]
        );
    });

    test('Polygon preserves signed coordinates, signed bounds, and downshift offsets', () => {
        const polygon = new Polygon([[-2, -3], [4, 0], [0, 4]]);
        assert.ok(polygon.ta_points instanceof Int32Array);
        assert.deepStrictEqual([...polygon.ta_points], [-2, -3, 4, 0, 0, 4]);
        assert.deepStrictEqual([...polygon.ta_bounding_box], [-2, -3, 4, 4]);

        const exposedBounds = polygon.ta_bounding_box;
        exposedBounds.fill(99);
        assert.deepStrictEqual([...polygon.ta_bounding_box], [-2, -3, 4, 4]);

        const downshifted = polygon.downshifted();
        assert.deepStrictEqual([...downshifted.ta_points], [0, 0, 6, 3, 2, 7]);
        assert.deepStrictEqual([...downshifted.offset], [-2, -3]);
        const exposedOffset = downshifted.offset;
        exposedOffset.fill(99);
        assert.deepStrictEqual([...downshifted.offset], [-2, -3]);

        const flat = new Polygon([-2, -3, 4, 0, 0, 4]);
        assert.deepStrictEqual([...flat.ta_points], [...polygon.ta_points]);
    });

    test('Polygon owns point storage and preserves finite fractional coordinates', () => {
        const supplied = new Float64Array([-1.5, -2.25, 4.5, 0.25, 0.5, 4.75]);
        const polygon = new Polygon(supplied);
        supplied[0] = 999;

        assert.ok(polygon.ta_points instanceof Float64Array);
        assert.deepStrictEqual(
            [...polygon.ta_points],
            [-1.5, -2.25, 4.5, 0.25, 0.5, 4.75]
        );
        assert.deepStrictEqual([...polygon.ta_bounding_box], [-1.5, -2.25, 4.5, 4.75]);

        const exposedPoints = polygon.ta_points;
        exposedPoints.fill(99);
        assert.deepStrictEqual(
            [...polygon.ta_points],
            [-1.5, -2.25, 4.5, 0.25, 0.5, 4.75]
        );
        assert.deepStrictEqual([...polygon.ta_bounding_box], [-1.5, -2.25, 4.5, 4.75]);

        const nested = new Polygon([[-0.5, 0.25], [2.5, 0.25], [1, 2.75]]);
        assert.ok(nested.ta_points instanceof Float64Array);
        assert.deepStrictEqual([...nested.ta_points], [-0.5, 0.25, 2.5, 0.25, 1, 2.75]);
    });

    test('filled polygons entering above and left clip across all pixel formats', () => {
        const points = [[-2, -3], [4, -3], [4, 2], [-2, 2]];
        for (const bipp of [1, 8, 24, 32]) {
            const image = make(bipp, 8);
            const color = colorFor(bipp);
            image.draw_polygon(points, color, true);

            for (let y = 0; y < 3; y++) {
                for (let x = 0; x < 5; x++) {
                    const expected = y <= 2
                        ? color
                        : (bipp <= 8 ? 0 : new Array(bipp / 8).fill(0));
                    assert.deepStrictEqual(pixelAsArray(image.get_pixel([x, y])), expected);
                }
            }
        }
    });

    test('filled polygon edge rounding is identical across 1/8/24/32bipp', () => {
        const points = [[0, 0], [2, 5], [5, 5]];
        const rasters = [];
        for (const bipp of [1, 8, 24, 32]) {
            const image = new Pixel_Buffer({
                size: [6, 6],
                bits_per_pixel: bipp,
                rowAlignmentBytes: 8
            });
            const color = bipp === 1
                ? 1
                : bipp === 8
                    ? 255
                    : new Array(bipp / 8).fill(255);
            image.draw_polygon(points, color, true);

            const raster = [];
            for (let y = 0; y < 6; y++) {
                for (let x = 0; x < 6; x++) {
                    const value = image.get_pixel([x, y]);
                    raster.push((typeof value === 'number' ? value : value[0]) === 0 ? 0 : 1);
                }
            }
            rasters.push(raster);
        }

        for (let i = 1; i < rasters.length; i++) {
            assert.deepStrictEqual(rasters[i], rasters[0]);
        }
        assert.strictEqual(rasters[0][1 * 6], 1);
        assert.strictEqual(rasters[0][3 * 6 + 1], 1);
        assert.strictEqual(rasters[0][5 * 6 + 2], 1);
        assert.strictEqual(rasters[0][5 * 6 + 5], 1);
    });

    test('filled polygon strokes include bottom and right boundaries in every format', () => {
        const points = [[1, 1], [6, 1], [6, 6], [1, 6]];
        for (const bipp of [1, 8, 24, 32]) {
            const image = new Pixel_Buffer({size: [8, 8], bits_per_pixel: bipp});
            const color = colorFor(bipp);
            image.draw_polygon(points, color, true);

            for (const position of [[3, 3], [3, 1], [1, 3], [6, 3], [3, 6]]) {
                assert.deepStrictEqual(pixelAsArray(image.get_pixel(position)), color);
            }
            assert.deepStrictEqual(
                pixelAsArray(image.get_pixel([0, 7])),
                bipp <= 8 ? 0 : new Array(bipp / 8).fill(0)
            );
        }
    });

    test('1bipp polygons support every boolean stroke/fill combination', () => {
        const points = [[1, 1], [6, 1], [6, 6], [1, 6]];
        for (const stroke of [0, 1]) {
            for (const fill of [0, 1]) {
                const image = new Pixel_Buffer({size: [8, 8], bits_per_pixel: 1});
                const background = fill ^ 1;
                image.color_whole(background);
                image.draw_polygon_1bipp(points, stroke, fill);

                assert.strictEqual(image.get_pixel_1bipp([3, 3]), fill);
                assert.strictEqual(image.get_pixel_1bipp([3, 1]), stroke);
                assert.strictEqual(image.get_pixel_1bipp([1, 3]), stroke);
                assert.strictEqual(image.get_pixel_1bipp([6, 3]), stroke);
                assert.strictEqual(image.get_pixel_1bipp([3, 6]), stroke);
                assert.strictEqual(image.get_pixel_1bipp([0, 0]), background);
            }
        }

        const wrapper = new Pixel_Buffer({size: [8, 8], bits_per_pixel: 1});
        wrapper.color_whole(1);
        assert.doesNotThrow(() => wrapper.draw_polygon(points, 0, true));
        assert.strictEqual(wrapper.get_pixel_1bipp([3, 3]), 0);
    });

    test('scanline activation includes edges whose start lies above row zero', () => {
        const polygon = new Polygon(new Int32Array([
            -2, -3,
            6, -3,
            6, 4,
            -2, 4
        ]));
        const processor = new ScanlineProcessor(
            new Polygon_Scanline_Edges(polygon),
            8,
            8,
            new Uint8Array(8)
        );
        assert.deepStrictEqual([...processor.iterate_process()], [
            [0, 0, 6],
            [1, 0, 6],
            [2, 0, 6],
            [3, 0, 6]
        ]);
    });

    test('Float64 edge math keeps exact pixel-boundary intersections', () => {
        const polygon = new Polygon([[0, 0], [2, 10], [4, 0]]);
        const edges = new Polygon_Scanline_Edges(polygon);
        assert.ok(edges.ta instanceof Float64Array);

        const processor = new ScanlineProcessor(edges, 8, 11, new Uint8Array(11));
        const spans = [...processor.iterate_process()];
        assert.deepStrictEqual(spans.find(span => span[0] === 5), [5, 1, 3]);

        const large = new Polygon([[16777217, 0], [16777218, 3], [16777219, 0]]);
        const largeEdges = new Polygon_Scanline_Edges(large);
        assert.strictEqual(largeEdges.get(0, 0), 16777217);
    });

    test('processors are reusable and never mutate polygon edge geometry', () => {
        const polygon = new Polygon(new Int32Array([1, 0, 6, 4, 1, 7]));
        const edges = new Polygon_Scanline_Edges(polygon);
        const geometry = [...edges.ta];
        const bitmap = new Uint8Array(8);
        const processor = new ScanlineProcessor(edges, 8, 8, bitmap, {draw_edges: true});

        const expectedSpans = [...processor.iterate_process()];
        assert.deepStrictEqual([...processor.iterate_process()], expectedSpans);
        assert.deepStrictEqual([...edges.ta], geometry);

        const abandoned = processor.iterate_process();
        abandoned.next();
        assert.deepStrictEqual([...processor.iterate_process()], expectedSpans);

        processor.process();
        const first = [...bitmap];
        bitmap.fill(0);
        processor.process_1bipp();
        assert.deepStrictEqual([...bitmap], first);
        assert.deepStrictEqual([...edges.ta], geometry);
    });

    test('active-edge sorting reuses storage and activation advances monotonically', () => {
        const polygon = new Polygon([[0, 0], [7, 3], [5, 7], [2, 6]]);
        const edges = new Polygon_Scanline_Edges(polygon);
        const storage = edges.active_edges;
        let previousCursor = 0;

        for (let y = 0; y < 8; y++) {
            edges.update_active_edges(y);
            edges.sort_active_edges_by_x();
            assert.strictEqual(edges.active_edges, storage);
            assert.ok(edges.next_edge_index >= previousCursor);
            previousCursor = edges.next_edge_index;
        }
    });

    return {passed, failed};
};

module.exports = runPixelBufferRasterShapeTests;

if (require.main === module) {
    const results = runPixelBufferRasterShapeTests();
    if (results.failed > 0) process.exitCode = 1;
}
