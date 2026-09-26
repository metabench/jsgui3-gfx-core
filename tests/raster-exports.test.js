'use strict';

const assert = require('assert');
const gfx_core = require('../core/gfx-core');

const runRasterExportsTests = async () => {
    let passed = 0;
    let failed = 0;

    const test = async (description, fn) => {
        try {
            await fn();
            console.log(`  ${description}: \x1b[32m✔ Passed\x1b[0m`);
            passed++;
        } catch (error) {
            console.log(`  ${description}: \x1b[31m✘ Failed\x1b[0m`);
            console.error(error && error.stack ? error.stack : error);
            failed++;
        }
    };

    console.log('Running vector raster export tests...');

    await test('gfx-core exports raster, stroke_polyline and the PNG encoders', () => {
        const {raster, stroke_polyline, encode_png, encode_png_async, Png_Row_Encoder, Pixel_Buffer} = gfx_core;
        assert.deepStrictEqual(Object.keys(raster).sort(), ['fill_paint_op', 'fill_polygon_aliased', 'fill_polygons']);
        for (const fn of [...Object.values(raster), stroke_polyline, encode_png, encode_png_async, Png_Row_Encoder]) {
            assert.strictEqual(typeof fn, 'function');
        }
        for (const name of ['fill_polygons', 'fill_paint_op', 'fill_polygon_aliased']) {
            assert.strictEqual(typeof Pixel_Buffer.prototype[name], 'function', name);
        }
        // The pre-existing exports are still there.
        for (const name of ['Pixel_Pos_List', 'Pixel_Buffer', 'Pixel_Buffer_Painter', 'convolution_kernels', 'ta_math', 'Rectangle', 'Rect']) {
            assert(gfx_core[name], name);
        }
    });

    await test('the method and the function forms give the same pixels', async () => {
        const {raster, stroke_polyline, encode_png, encode_png_async, Pixel_Buffer} = gfx_core;
        const op = {color: [180, 40, 20], polygons: [[1.5, 1.5, 12.5, 2.5, 7.5, 11.5]],
            strokes: [{points: [2, 12, 14, 3], width: 1.5, join: 'miter', miter_limit: 12, cap: 'butt'}]};
        const a = new Pixel_Buffer({size: [16, 14], bits_per_pixel: 24});
        const b = new Pixel_Buffer({size: [16, 14], bits_per_pixel: 24});
        a.fill_paint_op(op);
        raster.fill_polygons(b, [...op.polygons, ...stroke_polyline(op.strokes[0].points, op.strokes[0])], op.color);
        assert.deepStrictEqual([...a.ta], [...b.ta]);
        const sync = encode_png(a, {filter: 'none'});
        const asynchronous = await encode_png_async(a, {filter: 'none'});
        assert.strictEqual(sync[0], 137);
        assert.strictEqual(asynchronous[0], 137);
    });

    return {passed, failed};
};

if (require.main === module) {
    runRasterExportsTests().then(({passed, failed}) => {
        console.log(`\nTest summary: ${passed} passed, ${failed} failed.`);
        process.exit(failed > 0 ? 1 : 0);
    });
}

module.exports = runRasterExportsTests;
