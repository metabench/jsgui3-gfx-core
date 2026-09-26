'use strict';

/*
 * Vector raster benchmark on the pattern fixtures.
 *
 *   node benchmarks/raster-benchmark.js [--runs 15] [--out result.json] [--no-sharp] [--no-png]
 *
 * For each template at 418 px (45) and 1000 px (9): the ground fill plus
 * every op through fill_paint_op into a reused 24bpp buffer, three warm-up
 * renders, then --runs timed renders; the per-template figure is the median.
 * The PNG section encodes each 418 px tile with encode_png ('adaptive' and
 * 'none') and reports times and sizes. Target from the build plan: at most
 * 10 ms per 418 x 724 tile in Node.
 *
 * With sharp installed, a child process times librsvg's render of each
 * paired SVG (density 72, raw RGB) and sharp's PNG encoding of the same
 * tiles, for comparison. It runs in its own process because libvips works on
 * a thread pool: timed in the same process, it slowed the single-threaded
 * gfx-core measurements that followed two- to threefold.
 */

const path = require('path');
const fs = require('fs');
const {spawnSync} = require('child_process');
const F = require(path.join(__dirname, '..', 'tests', 'pattern-fixtures'));
const {Pixel_Buffer, encode_png} = require(path.join(__dirname, '..', 'core', 'gfx-core'));

const args = process.argv.slice(2);
const option = (name, fallback) => {
    const i = args.indexOf(name);
    return i >= 0 ? args[i + 1] : fallback;
};
const RUNS = Number(option('--runs', 15));
const OUT = option('--out', null);
const SHARP_CHILD = args.includes('--sharp-child');

const time_sync = fn => {
    for (let i = 0; i < 3; i++) fn();
    const t = [];
    for (let i = 0; i < RUNS; i++) {
        const t0 = performance.now();
        fn();
        t.push(performance.now() - t0);
    }
    return F.median(t);
};
const time_async = async fn => {
    for (let i = 0; i < 3; i++) await fn();
    const t = [];
    for (let i = 0; i < RUNS; i++) {
        const t0 = performance.now();
        await fn();
        t.push(performance.now() - t0);
    }
    return F.median(t);
};

const entries_for = (manifest, tag) => manifest.entries.filter(e => F.entry_tag(e) === tag);

// Child process: librsvg renders and sharp PNG encoding, printed as JSON.
const run_sharp_child = async () => {
    const sharp = require('sharp');
    const manifest = F.load_manifest();
    const out = {sharp: sharp.versions.sharp, librsvg: sharp.versions.rsvg, render_ms: {}, png: []};
    for (const tag of ['418', '1000']) {
        out.render_ms[tag] = {};
        for (const entry of entries_for(manifest, tag)) {
            const svg = F.load_svg(entry);
            out.render_ms[tag][entry.id] = await time_async(() => sharp(svg, {density: 72}).removeAlpha().raw().toBuffer());
        }
    }
    for (const entry of entries_for(manifest, '418')) {
        const pb = F.render_scene(F.load_scene(entry));
        const input = Buffer.from(pb.ta.buffer, pb.ta.byteOffset, pb.ta.length);
        const raw = {raw: {width: pb.size[0], height: pb.size[1], channels: 3}};
        const ms = await time_async(() => sharp(input, raw).png().toBuffer());
        out.png.push({ms, bytes: (await sharp(input, raw).png().toBuffer()).length});
    }
    process.stdout.write(JSON.stringify(out));
};

const summary = rows => {
    const ms = rows.map(r => r.ms);
    const worst = rows.reduce((a, b) => (b.ms > a.ms ? b : a));
    const out = {
        n: rows.length,
        median_ms: +F.median(ms).toFixed(2),
        min_ms: +Math.min(...ms).toFixed(2),
        max_ms: +worst.ms.toFixed(2),
        worst: worst.id,
        over_10ms: rows.filter(r => r.ms > 10).map(r => r.id)
    };
    if (rows[0].librsvg_ms !== undefined) {
        const ratios = rows.map(r => r.ms / r.librsvg_ms);
        out.librsvg_median_ms = +F.median(rows.map(r => r.librsvg_ms)).toFixed(2);
        out.librsvg_max_ms = +Math.max(...rows.map(r => r.librsvg_ms)).toFixed(2);
        out.ratio_median = +F.median(ratios).toFixed(2);
        out.ratio_max = +Math.max(...ratios).toFixed(2);
    }
    return out;
};

const run = async () => {
    const manifest = F.load_manifest();
    const result = {node: process.version, runs: RUNS, sizes: {}};
    for (const tag of ['418', '1000']) {
        const rows = [];
        for (const entry of entries_for(manifest, tag)) {
            const scene = F.load_scene(entry);
            const pb = new Pixel_Buffer({size: [scene.W, scene.H], bits_per_pixel: 24});
            const ms = time_sync(() => {
                pb.color_whole(scene.ground);
                for (const op of scene.ops) pb.fill_paint_op(op);
            });
            rows.push({id: entry.id, W: scene.W, H: scene.H, ops: scene.ops.length, ms: +ms.toFixed(3)});
        }
        result.sizes[tag] = {rows};
    }
    const png = {adaptive: {ms: [], bytes: 0}, none: {ms: [], bytes: 0}};
    if (!args.includes('--no-png')) {
        const tiles = entries_for(manifest, '418').map(e => F.render_scene(F.load_scene(e)));
        for (const filter of ['adaptive', 'none']) {
            for (const pb of tiles) {
                png[filter].ms.push(time_sync(() => encode_png(pb, {filter})));
                png[filter].bytes += encode_png(pb, {filter}).length;
            }
        }
    }

    let child = null;
    if (!args.includes('--no-sharp')) {
        let has_sharp = true;
        try {
            require.resolve('sharp');
        } catch (error) {
            has_sharp = false;
        }
        if (has_sharp) {
            const r = spawnSync(process.execPath, [__filename, '--sharp-child', '--runs', String(RUNS)],
                {encoding: 'utf8', maxBuffer: 64 * 1024 * 1024});
            if (r.status === 0) child = JSON.parse(r.stdout);
            else console.log('librsvg comparison failed:', r.stderr);
        }
    }
    if (child) {
        result.sharp = child.sharp;
        result.librsvg = child.librsvg;
        for (const tag of ['418', '1000']) {
            for (const row of result.sizes[tag].rows) row.librsvg_ms = +child.render_ms[tag][row.id].toFixed(3);
        }
        png.sharp = {ms: child.png.map(p => p.ms), bytes: child.png.reduce((a, p) => a + p.bytes, 0)};
    }

    for (const tag of ['418', '1000']) {
        const s = result.sizes[tag].summary = summary(result.sizes[tag].rows);
        console.log(`${tag} px, ${s.n} templates: fill_paint_op median ${s.median_ms} ms, min ${s.min_ms}, max ${s.max_ms} (${s.worst})` +
            (tag === '418' ? `; tiles over 10 ms: ${s.over_10ms.length ? s.over_10ms.join(', ') : 'none'}` : '') +
            (s.librsvg_median_ms !== undefined
                ? `; librsvg median ${s.librsvg_median_ms} ms, max ${s.librsvg_max_ms}; gfx/librsvg median ${s.ratio_median}, max ${s.ratio_max}`
                : ''));
    }
    result.png = {};
    for (const [k, v] of Object.entries(png)) {
        if (!v.ms.length) continue;
        result.png[k] = {median_ms: +F.median(v.ms).toFixed(2), max_ms: +Math.max(...v.ms).toFixed(2), total_bytes: v.bytes};
        console.log(`PNG ${k.padEnd(8)} 45 tiles at 418 px: median ${result.png[k].median_ms} ms, max ${result.png[k].max_ms} ms, total ${v.bytes} bytes`);
    }
    if (OUT) fs.writeFileSync(OUT, JSON.stringify(result, null, 1));
};

(SHARP_CHILD ? run_sharp_child() : run()).catch(error => {
    console.error(error);
    process.exitCode = 1;
});
