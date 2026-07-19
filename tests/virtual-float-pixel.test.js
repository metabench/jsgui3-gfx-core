'use strict';

const assert = require('assert');
const Virtual_Float_Pixel = require('../core/virtual-float-pixel');

const testVirtualFloatPixel = () => {
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

    console.log('Running Virtual_Float_Pixel ownership tests...');

    test('geometry getters cannot desynchronise derived coverage state', () => {
        const pixel = new Virtual_Float_Pixel([0.25, 0.5, 2.25, 3.5]);
        const expected = {
            bounds: [...pixel.bounds],
            pos: [...pixel.pos],
            size: [...pixel.size],
            coverageBounds: [...pixel.i_any_coverage_bounds],
            coverageSize: [...pixel.i_any_coverage_size],
            area: pixel.area,
            count: pixel.num_any_coverage_px
        };

        pixel.bounds.fill(99);
        pixel.pos.fill(99);
        pixel.size.fill(99);
        pixel.i_any_coverage_bounds.fill(99);
        pixel.i_any_coverage_size.fill(99);

        assert.deepStrictEqual([...pixel.bounds], expected.bounds);
        assert.deepStrictEqual([...pixel.pos], expected.pos);
        assert.deepStrictEqual([...pixel.size], expected.size);
        assert.deepStrictEqual([...pixel.i_any_coverage_bounds], expected.coverageBounds);
        assert.deepStrictEqual([...pixel.i_any_coverage_size], expected.coverageSize);
        assert.strictEqual(pixel.area, expected.area);
        assert.strictEqual(pixel.num_any_coverage_px, expected.count);
    });

    test('derived proportions and cached weights are returned as snapshots', () => {
        const pixel = new Virtual_Float_Pixel([0.25, 0.25, 1.25, 1.25]);
        const expectedEdges = [...pixel.f_ltrb_edge_proportions];
        const expectedCorners = [...pixel.f_tl_tr_bl_br_corner_proportions];
        const expectedWeights = [...pixel.weights];

        pixel.f_ltrb_edge_proportions.fill(0);
        pixel.f_tl_tr_bl_br_corner_proportions.fill(0);
        pixel.weights.fill(0);

        assert.deepStrictEqual([...pixel.f_ltrb_edge_proportions], expectedEdges);
        assert.deepStrictEqual([...pixel.f_tl_tr_bl_br_corner_proportions], expectedCorners);
        assert.deepStrictEqual([...pixel.weights], expectedWeights);
    });

    test('setters remain the coherent mutation path', () => {
        const pixel = new Virtual_Float_Pixel([0, 0], [1, 1]);
        pixel.pos = [10.5, -2.5];
        pixel.size = [2, 3];

        assert.deepStrictEqual([...pixel.pos], [10.5, -2.5]);
        assert.deepStrictEqual([...pixel.size], [2, 3]);
        assert.deepStrictEqual([...pixel.bounds], [10.5, -2.5, 12.5, 0.5]);
        assert.strictEqual(pixel.area, 6);
    });

    return {passed, failed};
};

if (require.main === module) {
    const result = testVirtualFloatPixel();
    console.log(`\nTest summary: ${result.passed} passed, ${result.failed} failed.`);
    process.exit(result.failed > 0 ? 1 : 0);
}

module.exports = testVirtualFloatPixel;
