'use strict';

const assert = require('assert');
const {Pixel_Buffer} = require('../core/gfx-core');
const {fill_polygons} = require('../core/raster/fill-polygons');
const {stroke_polyline} = require('../core/raster/stroke-polyline');
const {fill_paint_op, paint_op_polygons} = require('../core/raster/fill-paint-op');

const make = (w, h, fill) => {
    const pb = new Pixel_Buffer({size: [w, h], bits_per_pixel: 24});
    if (fill) pb.color_whole(fill);
    return pb;
};
const same_bytes = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

const runRasterFillPaintOpTests = () => {
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

    console.log('Running fill_paint_op tests...');

    const stroke = {points: [2.5, 3.25, 20.75, 4.5, 16.25, 17.5], closed: false, width: 2.4, join: 'miter', miter_limit: 12, cap: 'butt'};
    const face = [4.3, 1.2, 12.6, 2.1, 8.2, 9.4];   // overlaps the first stroke segment

    test('an op fills its polygons and expanded strokes in one union pass', () => {
        const op = {kind: 'casing', color: [20, 60, 140], polygons: [face], strokes: [stroke]};
        const a = make(24, 20, [240, 232, 211]);
        const returned = a.fill_paint_op(op);
        assert.strictEqual(returned, a);
        const b = make(24, 20, [240, 232, 211]);
        fill_polygons(b, [face, ...stroke_polyline(stroke.points, stroke)], [20, 60, 140]);
        assert(same_bytes(a.ta, b.ta));
        // Filling the face and the stroke separately conflates where they meet.
        const c = make(24, 20, [240, 232, 211]);
        fill_polygons(c, [face], [20, 60, 140]);
        fill_polygons(c, stroke_polyline(stroke.points, stroke), [20, 60, 140]);
        assert(!same_bytes(a.ta, c.ta));
    });

    test('kind and other extra fields are ignored; missing lists are empty', () => {
        const base = {color: [200, 10, 10], polygons: [face], strokes: [stroke]};
        const a = make(24, 20, [0, 0, 0]);
        fill_paint_op(a, base);
        const b = make(24, 20, [0, 0, 0]);
        fill_paint_op(b, {...base, kind: 'weave-band', level: 3, extra: {x: 1}});
        assert(same_bytes(a.ta, b.ta));
        const only_strokes = make(24, 20, [0, 0, 0]);
        fill_paint_op(only_strokes, {color: [9, 9, 9], strokes: [stroke]});
        const only_polygons = make(24, 20, [0, 0, 0]);
        fill_paint_op(only_polygons, {color: [9, 9, 9], polygons: [face]});
        assert(only_strokes.ta.some(v => v !== 0) && only_polygons.ta.some(v => v !== 0));
        const empty = make(24, 20, [1, 2, 3]);
        fill_paint_op(empty, {color: [9, 9, 9], polygons: [], strokes: []});
        assert(empty.ta.every((v, i) => v === [1, 2, 3][i % 3]));
        assert.deepStrictEqual(paint_op_polygons({color: [1, 1, 1], polygons: [face]}), [face]);
    });

    test('offset, clip and blend pass through to fill_polygons', () => {
        const op = {color: [250, 200, 20, 180], polygons: [face], strokes: [stroke]};
        const whole = make(24, 20, [30, 30, 30]);
        fill_paint_op(whole, op);
        const win = make(10, 8, [30, 30, 30]);
        fill_paint_op(win, op, {offset: [-7, -5]});
        for (let y = 0; y < 8; y++) {
            const got = win.ta.subarray(y * 30, y * 30 + 30);
            const want = whole.ta.subarray(((y + 5) * 24 + 7) * 3, ((y + 5) * 24 + 17) * 3);
            assert(same_bytes(got, want), `row ${y}`);
        }
        const clipped = make(24, 20, [30, 30, 30]);
        fill_paint_op(clipped, op, {clip: [0, 0, 12, 20]});
        assert(clipped.ta.subarray(0, 36).every((v, i) => v === whole.ta[i]));
        const rgba = new Pixel_Buffer({size: [24, 20], bits_per_pixel: 32});
        fill_paint_op(rgba, op, {blend: 'replace'});
        assert(rgba.ta.some((v, i) => i % 4 === 3 && v === 180));
    });

    test('malformed ops are rejected', () => {
        const pb = make(4, 4);
        assert.throws(() => fill_paint_op(pb, null), /paint op/);
        assert.throws(() => fill_paint_op(pb, {color: [1, 1, 1], polygons: 5}), /arrays/);
        assert.throws(() => fill_paint_op(pb, {color: [1, 1, 1], strokes: [null]}), /stroke/);
        assert.throws(() => fill_paint_op(pb, {color: [1, 1, 1], strokes: [{points: [0, 0, 1, 1], width: 1, join: 'x'}]}), /join/);
        assert.throws(() => fill_paint_op(pb, {polygons: [face]}), /Colour/);
    });

    return {passed, failed};
};

if (require.main === module) {
    const {passed, failed} = runRasterFillPaintOpTests();
    console.log(`\nTest summary: ${passed} passed, ${failed} failed.`);
    process.exit(failed > 0 ? 1 : 0);
}

module.exports = runRasterFillPaintOpTests;
