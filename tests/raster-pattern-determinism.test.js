'use strict';

/*
 * Determinism on the pattern fixtures: every scene rendered twice, in
 * opposite orders and into fresh buffers, gives the same SHA-256. The second
 * pass runs after every other scene has used the shared scratch buffers, so
 * any state leaking between calls would show. 24 and 32bpp renders agree.
 */

const assert = require('assert');
const crypto = require('crypto');
const F = require('./pattern-fixtures');

const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');

const runRasterPatternDeterminismTests = () => {
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

    console.log('Running pattern determinism tests...');

    const manifest = F.load_manifest();
    const scenes = manifest.entries.map(entry => ({key: entry.scene.file, scene: F.load_scene(entry), entry}));

    test('81 fixture scenes give identical SHA-256 across two runs in opposite orders', () => {
        const first = new Map();
        for (const {key, scene} of scenes) first.set(key, sha256(F.render_scene(scene).ta));
        const mismatches = [];
        for (const {key, scene} of [...scenes].reverse()) {
            if (sha256(F.render_scene(scene).ta) !== first.get(key)) mismatches.push(key);
        }
        assert.strictEqual(first.size, 81);
        assert.deepStrictEqual(mismatches, []);
        // Distinct designs give distinct images (the hash is not constant).
        assert(new Set(first.values()).size > 70);
    });

    test('32bpp renders have the same colours as 24bpp renders and stay opaque', () => {
        for (const {entry, scene} of scenes) {
            if (F.entry_tag(entry) !== '418' || !manifest.subset.some(s => s.id === entry.id)) continue;
            const rgb = F.render_scene(scene).ta;
            const rgba = F.render_scene(scene, {bits_per_pixel: 32}).ta;
            for (let p = 0, q = 0; p < rgb.length; p += 3, q += 4) {
                if (rgb[p] !== rgba[q] || rgb[p + 1] !== rgba[q + 1] || rgb[p + 2] !== rgba[q + 2] || rgba[q + 3] !== 255) {
                    assert.fail(`${entry.id}: pixel ${p / 3} differs`);
                }
            }
        }
    });

    return {passed, failed};
};

if (require.main === module) {
    const {passed, failed} = runRasterPatternDeterminismTests();
    console.log(`\nTest summary: ${passed} passed, ${failed} failed.`);
    process.exit(failed > 0 ? 1 : 0);
}

module.exports = runRasterPatternDeterminismTests;
