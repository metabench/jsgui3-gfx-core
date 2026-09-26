'use strict';

/*
 * Pattern oracle: every fixture scene rendered with fill_paint_op against the
 * paired SVG rendered by sharp (librsvg) at density 72.
 *
 * Gates (build plan section 5.2):
 * - 418 px, all 45 templates: MAE <= 0.25 and at most 0.10 % of pixels more
 *   than 16 levels off;
 * - tile junctions within 2 levels (2 x 1 and 1 x 2 blocks, 9 templates);
 * - 160 and 1000 px: no regression against tests/fixtures/pattern-oracle-baseline.json,
 *   which holds the first run's values. Set GFX_ORACLE_UPDATE_BASELINE=1 to
 *   rewrite it; it is written automatically when missing.
 *
 * Skipped with a message when sharp is not installed. Set
 * GFX_ORACLE_RESULTS=<file> to save every measurement as JSON.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const F = require('./pattern-fixtures');

const BASELINE_FILE = path.join(__dirname, 'fixtures', 'pattern-oracle-baseline.json');
const GATE = {mae: 0.25, pct16: 0.10, junction: 2};
// Allowed drift before a ratcheted size counts as a regression. On the
// machine that recorded the baseline both renders are deterministic and the
// values repeat exactly; the slack absorbs a different librsvg build.
const RATCHET = {mae: 0.002, over16: 2};

const round6 = v => Math.round(v * 1e6) / 1e6;

const summarise = rows => {
    const worst_mae = rows.reduce((a, b) => (b.mae > a.mae ? b : a));
    const worst_pct = rows.reduce((a, b) => (b.pct16 > a.pct16 ? b : a));
    return {
        n: rows.length,
        mae_median: F.median(rows.map(r => r.mae)),
        mae_max: worst_mae.mae,
        mae_worst: worst_mae.id,
        pct16_median: F.median(rows.map(r => r.pct16)),
        pct16_max: worst_pct.pct16,
        pct16_worst: worst_pct.id,
        max_level: Math.max(...rows.map(r => r.max))
    };
};

const runRasterPatternOracleTests = async () => {
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

    console.log('Running pattern oracle tests (fill_paint_op against librsvg)...');

    let sharp;
    try {
        sharp = require('sharp');
    } catch (error) {
        console.log('  sharp is not installed: pattern oracle skipped (npm install to run it)');
        return {passed, failed};
    }

    const manifest = F.load_manifest();

    test('fixture files match the SHA-256 values in their manifest', () => {
        for (const entry of manifest.entries) {
            for (const file of [entry.scene, entry.svg]) {
                const bytes = fs.readFileSync(path.join(F.FIXTURE_DIR, file.file));
                const hash = crypto.createHash('sha256').update(bytes).digest('hex');
                assert.strictEqual(hash, file.sha256, file.file);
            }
        }
        assert.strictEqual(manifest.entries.length, 81);
    });

    const decode_svg = async entry => {
        const {data, info} = await sharp(F.load_svg(entry), {density: 72})
            .removeAlpha().raw().toBuffer({resolveWithObject: true});
        return {data: new Uint8Array(data.buffer, data.byteOffset, data.length), info};
    };

    // Render every entry; keep the 418 tile and block pixels only until the
    // template's junctions are measured.
    const results = {};
    const junctions = [];
    const by_id = new Map();
    for (const entry of manifest.entries) {
        if (!by_id.has(entry.id)) by_id.set(entry.id, {});
        by_id.get(entry.id)[F.entry_tag(entry)] = entry;
    }
    for (const [id, tags] of by_id) {
        const pixels = {};
        for (const [tag, entry] of Object.entries(tags)) {
            const scene = F.load_scene(entry);
            const pb = F.render_scene(scene);
            const ref = await decode_svg(entry);
            if (ref.info.width !== scene.W || ref.info.height !== scene.H || ref.info.channels !== 3) {
                throw new Error(`${entry.svg.file}: librsvg gave ${ref.info.width} x ${ref.info.height}`);
            }
            const cmp = F.compare_rgb(pb.ta, ref.data, scene.W, scene.H);
            if (!results[tag]) results[tag] = [];
            results[tag].push({id, group: entry.group, mode: entry.mode, W: scene.W, H: scene.H, ...cmp});
            if (tag.startsWith('418')) pixels[tag] = {gfx: pb.ta, ref: ref.data, W: entry.W, H: entry.H};
        }
        if (pixels['418x2x1'] && pixels['418x1x2']) {
            const {W, H} = pixels['418'];
            junctions.push({
                id,
                gfx: F.seam_stats(pixels['418'].gfx, pixels['418x2x1'].gfx, pixels['418x1x2'].gfx, W, H),
                librsvg: F.seam_stats(pixels['418'].ref, pixels['418x2x1'].ref, pixels['418x1x2'].ref, W, H)
            });
        }
    }

    const summary = {};
    for (const tag of Object.keys(results)) summary[tag] = summarise(results[tag]);
    for (const tag of ['418', '160', '1000']) {
        const s = summary[tag];
        console.log(`    ${tag} px (${s.n}): MAE median ${s.mae_median.toFixed(4)} max ${s.mae_max.toFixed(4)} (${s.mae_worst});` +
            ` >16 levels median ${s.pct16_median.toFixed(4)} % max ${s.pct16_max.toFixed(4)} % (${s.pct16_worst})`);
    }
    const jx = Math.max(...junctions.map(j => j.gfx.join_x_max));
    const jy = Math.max(...junctions.map(j => j.gfx.join_y_max));
    const rx = Math.max(...junctions.map(j => j.librsvg.join_x_max));
    const ry = Math.max(...junctions.map(j => j.librsvg.join_y_max));
    console.log(`    junctions (${junctions.length}): gfx-core max x ${jx}, y ${jy}; librsvg's own max x ${rx}, y ${ry}`);

    test('418 px: 45 templates within MAE 0.25 and 0.10 % of pixels over 16 levels', () => {
        const rows = results['418'];
        assert.strictEqual(rows.length, 45);
        const bad = rows.filter(r => !(r.mae <= GATE.mae && r.pct16 <= GATE.pct16));
        assert.deepStrictEqual(bad.map(r => `${r.id} MAE ${r.mae.toFixed(4)} >16 ${r.pct16.toFixed(4)} %`), []);
    });

    test('418 px: tile junctions within 2 levels in 2 x 1 and 1 x 2 blocks', () => {
        assert.strictEqual(junctions.length, 9);
        const bad = junctions.filter(j => j.gfx.join_x_max > GATE.junction || j.gfx.join_y_max > GATE.junction);
        assert.deepStrictEqual(bad.map(j => `${j.id} x ${j.gfx.join_x_max} y ${j.gfx.join_y_max}`), []);
    });

    // Ratchet 160 and 1000 px against the first run.
    let baseline = null;
    const update = process.env.GFX_ORACLE_UPDATE_BASELINE === '1';
    if (!update && fs.existsSync(BASELINE_FILE)) baseline = JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf8'));
    if (!baseline) {
        baseline = {
            note: 'First-run oracle values: gfx-core fill_paint_op against sharp/librsvg at density 72. ' +
                'tests/raster-pattern-oracle.test.js fails if a template gets worse than this by more than ' +
                `MAE ${RATCHET.mae} or ${RATCHET.over16} pixels over 16 levels.`,
            recorded: new Date().toISOString(),
            sharp: sharp.versions.sharp,
            librsvg: sharp.versions.rsvg,
            node: process.version,
            sizes: {}
        };
        for (const tag of ['160', '418', '1000']) {
            baseline.sizes[tag] = {};
            for (const r of results[tag]) {
                baseline.sizes[tag][r.id] = {mae: round6(r.mae), over16: r.over16, pct16: round6(r.pct16), max: r.max};
            }
        }
        fs.writeFileSync(BASELINE_FILE, JSON.stringify(baseline, null, 1) + '\n');
        console.log(`    baseline recorded in ${path.relative(path.join(__dirname, '..'), BASELINE_FILE)}`);
    }
    for (const tag of ['160', '1000']) {
        test(`${tag} px: no regression against the recorded baseline (9 templates)`, () => {
            const rows = results[tag];
            assert.strictEqual(rows.length, 9);
            const bad = [];
            for (const r of rows) {
                const base = baseline.sizes[tag] && baseline.sizes[tag][r.id];
                if (!base) {
                    bad.push(`${r.id}: not in the baseline`);
                    continue;
                }
                if (r.mae > base.mae + RATCHET.mae) bad.push(`${r.id}: MAE ${r.mae.toFixed(6)} > ${base.mae}`);
                if (r.over16 > base.over16 + RATCHET.over16) bad.push(`${r.id}: ${r.over16} px over 16 > ${base.over16}`);
            }
            assert.deepStrictEqual(bad, []);
        });
    }

    if (process.env.GFX_ORACLE_RESULTS) {
        fs.writeFileSync(process.env.GFX_ORACLE_RESULTS, JSON.stringify({
            sharp: sharp.versions.sharp, librsvg: sharp.versions.rsvg, node: process.version,
            summary, results, junctions
        }, null, 1));
    }

    return {passed, failed};
};

if (require.main === module) {
    runRasterPatternOracleTests().then(({passed, failed}) => {
        console.log(`\nTest summary: ${passed} passed, ${failed} failed.`);
        process.exit(failed > 0 ? 1 : 0);
    });
}

module.exports = runRasterPatternOracleTests;
