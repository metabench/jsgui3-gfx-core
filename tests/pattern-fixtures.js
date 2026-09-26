'use strict';

/*
 * Shared helpers for the pattern fixtures in tests/fixtures/patterns/.
 * The fixtures and their manifest come from jsgui3-islamic-art's
 * tools/export-raster-fixtures.js: for each design, a scene JSON
 * {W, H, ground, ops} and the engine's SVG for the same tile.
 */

const fs = require('fs');
const path = require('path');
const {Pixel_Buffer} = require('../core/gfx-core');
const {paint_op_polygons} = require('../core/raster/fill-paint-op');

const FIXTURE_DIR = path.join(__dirname, 'fixtures', 'patterns');

const load_manifest = () => JSON.parse(fs.readFileSync(path.join(FIXTURE_DIR, 'manifest.json'), 'utf8'));

// '418', '160', '1000', or '418x2x1' / '418x1x2' for blocks.
const entry_tag = entry => (entry.nx === 1 && entry.ny === 1
    ? String(entry.target_w)
    : `${entry.target_w}x${entry.nx}x${entry.ny}`);

const load_scene = entry => JSON.parse(fs.readFileSync(path.join(FIXTURE_DIR, entry.scene.file), 'utf8'));
const load_svg = entry => fs.readFileSync(path.join(FIXTURE_DIR, entry.svg.file));

/*
 * Render a scene into a new buffer (24bpp by default) filled with the ground
 * colour: each op with fill_paint_op, in order. `window` = [x0, y0, w, h]
 * renders only that part of the scene, through an integer offset.
 */
const render_scene = (scene, options = {}) => {
    const bits_per_pixel = options.bits_per_pixel || 24;
    const [x0, y0, w, h] = options.window || [0, 0, scene.W, scene.H];
    const pb = new Pixel_Buffer({size: [w, h], bits_per_pixel});
    pb.color_whole(bits_per_pixel === 32 ? [...scene.ground, 255] : scene.ground);
    const offset = [-x0, -y0];
    for (const op of scene.ops) pb.fill_paint_op(op, {offset});
    return pb;
};

// Strokes expanded once; fill with pb.fill_polygons(op.polygons, op.color, ...).
const prepare_scene = scene => ({
    W: scene.W,
    H: scene.H,
    ground: scene.ground,
    ops: scene.ops.map(op => ({color: op.color, polygons: paint_op_polygons(op)}))
});

// RGB byte arrays of w x h pixels.
const compare_rgb = (a, b, w, h) => {
    let sum = 0, over16 = 0, max = 0;
    for (let i = 0, p = 0; p < w * h; p++, i += 3) {
        const d0 = Math.abs(a[i] - b[i]), d1 = Math.abs(a[i + 1] - b[i + 1]), d2 = Math.abs(a[i + 2] - b[i + 2]);
        sum += d0 + d1 + d2;
        const m = Math.max(d0, d1, d2);
        if (m > 16) over16++;
        if (m > max) max = m;
    }
    return {mae: sum / (w * h * 3), over16, pct16: 100 * over16 / (w * h), max};
};

// Copy a w x h RGB sub-rectangle at (x0, y0) of a tightly packed RGB image of width bw.
const crop_rgb = (buf, bw, x0, y0, w, h) => {
    const out = new Uint8Array(w * h * 3);
    for (let y = 0; y < h; y++) {
        out.set(buf.subarray(((y0 + y) * bw + x0) * 3, ((y0 + y) * bw + x0 + w) * 3), y * w * 3);
    }
    return out;
};

/*
 * The manifest's junction gate (seamStats in the prototype's bench.js): a
 * 2 x 1 and a 1 x 2 block against the 1 x 1 tile, all from one back-end.
 * half_max: largest difference between a block half and the tile.
 * join_x_max / join_y_max: the 2 columns (rows) either side of the join
 * against the tile's last 2 and first 2 columns (rows).
 */
const seam_stats = (tile, b21, b12, W, H) => {
    const halves = [
        compare_rgb(crop_rgb(b21, 2 * W, 0, 0, W, H), tile, W, H),
        compare_rgb(crop_rgb(b21, 2 * W, W, 0, W, H), tile, W, H),
        compare_rgb(crop_rgb(b12, W, 0, 0, W, H), tile, W, H),
        compare_rgb(crop_rgb(b12, W, 0, H, W, H), tile, W, H)
    ];
    const jt = new Uint8Array(4 * H * 3);
    const t1 = crop_rgb(tile, W, W - 2, 0, 2, H), t2 = crop_rgb(tile, W, 0, 0, 2, H);
    for (let y = 0; y < H; y++) {
        jt.set(t1.subarray(y * 6, y * 6 + 6), y * 12);
        jt.set(t2.subarray(y * 6, y * 6 + 6), y * 12 + 6);
    }
    const jx = compare_rgb(jt, crop_rgb(b21, 2 * W, W - 2, 0, 4, H), 4, H);
    const jtv = new Uint8Array(W * 4 * 3);
    jtv.set(crop_rgb(tile, W, 0, H - 2, W, 2), 0);
    jtv.set(crop_rgb(tile, W, 0, 0, W, 2), W * 2 * 3);
    const jy = compare_rgb(jtv, crop_rgb(b12, W, 0, H - 2, W, 4), W, 4);
    return {
        half_max: Math.max(...halves.map(c => c.max)),
        half_max_mae: Math.max(...halves.map(c => c.mae)),
        join_x_max: jx.max,
        join_y_max: jy.max
    };
};

const median = values => {
    const s = [...values].sort((a, b) => a - b);
    const m = s.length >> 1;
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

// Seeded PRNG for reproducible windows.
const mulberry32 = seed => () => {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

module.exports = {
    FIXTURE_DIR,
    load_manifest,
    entry_tag,
    load_scene,
    load_svg,
    render_scene,
    prepare_scene,
    compare_rgb,
    crop_rgb,
    seam_stats,
    median,
    mulberry32
};
