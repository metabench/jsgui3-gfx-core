'use strict';

/*
 * fill_paint_op: fill one paint op, the scene format of jsgui3-islamic-art:
 *
 *   { color, polygons: [flat, ...], strokes: [{ points, closed, width, join, miter_limit, cap }] }
 *
 * The strokes are expanded with stroke_polyline, and the expanded strokes and
 * the polygons are filled in ONE union pass with fill_polygons. One op stands
 * for one element of a reference SVG, so pieces of one op never conflate with
 * each other, and separate ops conflate exactly where an SVG renderer's
 * separate elements do. Any other field of the op (such as `kind`) is ignored.
 */

const {fill_polygons} = require('./fill-polygons');
const {stroke_polyline} = require('./stroke-polyline');

const EMPTY = Object.freeze([]);

// The op's polygons and expanded strokes, as one array of flat polygons.
const paint_op_polygons = op => {
    if (!op || typeof op !== 'object') {
        throw new TypeError('A paint op must be an object: { color, polygons, strokes }');
    }
    const polygons = op.polygons === undefined || op.polygons === null ? EMPTY : op.polygons;
    const strokes = op.strokes === undefined || op.strokes === null ? EMPTY : op.strokes;
    if (typeof polygons.length !== 'number' || typeof strokes.length !== 'number') {
        throw new TypeError('A paint op\'s polygons and strokes must be arrays');
    }
    if (strokes.length === 0) return polygons;
    const all = [];
    for (let i = 0; i < polygons.length; i++) all.push(polygons[i]);
    for (let i = 0; i < strokes.length; i++) {
        const stroke = strokes[i];
        if (!stroke || typeof stroke !== 'object') {
            throw new TypeError('Each stroke must be an object: { points, width, ... }');
        }
        const outlines = stroke_polyline(stroke.points, stroke);
        for (let k = 0; k < outlines.length; k++) all.push(outlines[k]);
    }
    return all;
};

/**
 * @param {Pixel_Buffer} pb 8, 24 or 32bpp destination.
 * @param {Object} op { color, polygons, strokes }.
 * @param {Object} [options] clip, offset and blend, as for fill_polygons.
 * @returns {Pixel_Buffer} pb
 */
const fill_paint_op = (pb, op, options) => {
    const polygons = paint_op_polygons(op);
    return fill_polygons(pb, polygons, op.color, options);
};

module.exports = {fill_paint_op, paint_op_polygons};
