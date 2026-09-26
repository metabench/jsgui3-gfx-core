'use strict';

/*
 * Band, window and clip identity on the pattern fixtures: parts of a scene
 * rendered on their own (through an integer offset, or a clip) are
 * byte-identical to the same pixels of the whole render. The float
 * prototype differed by +-1 level in 14 of 270 random windows.
 */

const assert = require('assert');
const {Pixel_Buffer} = require('../core/gfx-core');
const F = require('./pattern-fixtures');

const same_bytes = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

const runRasterPatternBandsWindowsTests = () => {
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

    console.log('Running pattern band, window and clip identity tests...');

    const manifest = F.load_manifest();
    const pick = tag => manifest.entries.filter(e => F.entry_tag(e) === tag).map(e => ({id: e.id, scene: F.load_scene(e)}));
    const tiles418 = pick('418');
    const tiles1000 = pick('1000');
    const random = F.mulberry32(2026);

    const check_windows = (items, bands_each, windows_each) => {
        const bad = [];
        let bands = 0, windows = 0;
        for (const {id, scene} of items) {
            const whole = F.render_scene(scene).ta;
            const W = scene.W, H = scene.H;
            // Bands: cut the height at bands_each - 1 random rows.
            const cuts = new Set([0, H]);
            while (cuts.size < bands_each + 1) cuts.add(1 + Math.floor(random() * (H - 1)));
            const edges = [...cuts].sort((a, b) => a - b);
            for (let i = 0; i + 1 < edges.length; i++) {
                const y0 = edges[i], h = edges[i + 1] - y0;
                const band = F.render_scene(scene, {window: [0, y0, W, h]}).ta;
                if (!same_bytes(band, F.crop_rgb(whole, W, 0, y0, W, h))) bad.push(`${id} band ${y0}+${h}`);
                bands++;
            }
            for (let k = 0; k < windows_each; k++) {
                const w = 1 + Math.floor(random() * 160), h = 1 + Math.floor(random() * 160);
                const x0 = Math.floor(random() * (W - w + 1)), y0 = Math.floor(random() * (H - h + 1));
                const win = F.render_scene(scene, {window: [x0, y0, w, h]}).ta;
                if (!same_bytes(win, F.crop_rgb(whole, W, x0, y0, w, h))) bad.push(`${id} window ${x0},${y0} ${w}x${h}`);
                windows++;
            }
        }
        return {bad, bands, windows};
    };

    test('418 px: 7 bands and 6 random windows of each of the 45 templates match the whole render', () => {
        const {bad, bands, windows} = check_windows(tiles418, 7, 6);
        assert.strictEqual(bands, 315);
        assert.strictEqual(windows, 270);
        assert.deepStrictEqual(bad, []);
    });

    test('1000 px: 5 bands and 4 random windows of each of the 9 templates match the whole render', () => {
        const {bad, bands, windows} = check_windows(tiles1000, 5, 4);
        assert.strictEqual(bands + windows, 81);
        assert.deepStrictEqual(bad, []);
    });

    test('clipping a render into quadrants reproduces the whole render', () => {
        for (const {id, scene} of tiles418.slice(0, 12)) {
            const whole = F.render_scene(scene).ta;
            const W = scene.W, H = scene.H, mx = Math.floor(W * 0.37), my = Math.floor(H * 0.61);
            const pb = new Pixel_Buffer({size: [W, H], bits_per_pixel: 24});
            pb.color_whole(scene.ground);
            for (const clip of [[0, 0, mx, my], [mx, 0, W, my], [0, my, mx, H], [mx, my, W, H]]) {
                for (const op of scene.ops) pb.fill_paint_op(op, {clip});
            }
            assert(same_bytes(pb.ta, whole), id);
        }
    });

    return {passed, failed};
};

if (require.main === module) {
    const {passed, failed} = runRasterPatternBandsWindowsTests();
    console.log(`\nTest summary: ${passed} passed, ${failed} failed.`);
    process.exit(failed > 0 ? 1 : 0);
}

module.exports = runRasterPatternBandsWindowsTests;
