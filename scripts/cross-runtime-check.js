'use strict';

/*
 * Cross-runtime check for the vector rasteriser: renders pattern fixtures
 * with fill_paint_op into 32bpp buffers in Node, on the Chromium main thread
 * and in a Chromium Web Worker, and compares the SHA-256 of the RGBA bytes.
 * It also encodes each browser render with encode_png_async (CompressionStream)
 * and checks, in Node, that the PNG decodes to the Node render's pixels.
 *
 *   node scripts/cross-runtime-check.js [--out result.json] [fixture-id@target ...]
 *
 * Needs esbuild and playwright (with its Chromium). They are looked up in
 * GFX_ESBUILD / GFX_PLAYWRIGHT, then in ../jsgui3-server/node_modules, then as
 * ordinary packages; without them the script prints a message and exits 0.
 * In a Worker, lang-mini needs `self.window = self` before it loads, so the
 * worker bundle starts with that line. Not part of npm test.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');

const root = path.resolve(__dirname, '..');
const F = require(path.join(root, 'tests', 'pattern-fixtures'));
const {Pixel_Buffer} = require(path.join(root, 'core', 'gfx-core'));

const load = (env, name) => {
    const candidates = [process.env[env], path.join(root, '..', 'jsgui3-server', 'node_modules', name), name].filter(Boolean);
    for (const candidate of candidates) {
        try {
            return {module: require(candidate), from: candidate};
        } catch (error) {
            // try the next place
        }
    }
    return null;
};

const args = process.argv.slice(2);
let out_file = null;
const wanted = [];
for (let i = 0; i < args.length; i++) {
    if (args[i] === '--out') out_file = args[++i];
    else wanted.push(args[i]);
}
const ids = wanted.length ? wanted : ['star-hexagon@418', 'acute-rosettes@418', 'star-and-cross@418'];

const render_node = scene => {
    const pb = new Pixel_Buffer({size: [scene.W, scene.H], bits_per_pixel: 32});
    pb.color_whole([...scene.ground, 255]);
    for (const op of scene.ops) pb.fill_paint_op(op);
    return pb;
};

// Minimal PNG decoder (8-bit RGBA) for the browser PNGs.
const decode_rgba_png = bytes => {
    const buf = Buffer.from(bytes);
    let p = 8, width = 0, height = 0;
    const idat = [];
    while (p < buf.length) {
        const length = buf.readUInt32BE(p), type = buf.toString('ascii', p + 4, p + 8);
        if (type === 'IHDR') {
            width = buf.readUInt32BE(p + 8);
            height = buf.readUInt32BE(p + 12);
            if (buf[p + 16] !== 8 || buf[p + 17] !== 6) throw new Error('expected 8-bit RGBA');
        } else if (type === 'IDAT') idat.push(buf.subarray(p + 8, p + 8 + length));
        p += 12 + length;
    }
    const raw = zlib.inflateSync(Buffer.concat(idat));
    const row = width * 4, out = new Uint8Array(row * height);
    for (let y = 0; y < height; y++) {
        const t = raw[y * (row + 1)];
        for (let i = 0; i < row; i++) {
            const x = raw[y * (row + 1) + 1 + i];
            const a = i >= 4 ? out[y * row + i - 4] : 0;
            const b = y ? out[(y - 1) * row + i] : 0;
            const c = i >= 4 && y ? out[(y - 1) * row + i - 4] : 0;
            let pred = 0;
            if (t === 1) pred = a;
            else if (t === 2) pred = b;
            else if (t === 3) pred = (a + b) >> 1;
            else if (t === 4) {
                const q = a + b - c, pa = Math.abs(q - a), pb = Math.abs(q - b), pc = Math.abs(q - c);
                pred = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
            }
            out[y * row + i] = (x + pred) & 255;
        }
    }
    return {width, height, pixels: out};
};

const ENTRY = `
const {Pixel_Buffer, encode_png_async} = require(${JSON.stringify(path.join(root, 'core', 'gfx-core.js'))});
const hex = buffer => Array.from(new Uint8Array(buffer), b => b.toString(16).padStart(2, '0')).join('');
self.GFX_RUN = async scene => {
    const t0 = performance.now();
    const pb = new Pixel_Buffer({size: [scene.W, scene.H], bits_per_pixel: 32});
    pb.color_whole([scene.ground[0], scene.ground[1], scene.ground[2], 255]);
    for (const op of scene.ops) pb.fill_paint_op(op);
    const ms = performance.now() - t0;
    const hash = hex(await crypto.subtle.digest('SHA-256', pb.ta));
    const t1 = performance.now();
    const png = await encode_png_async(pb, {dpi: 96});
    return {hash, ms, png_ms: performance.now() - t1, png: Array.from(png)};
};
`;

(async () => {
    const esbuild = load('GFX_ESBUILD', 'esbuild');
    const playwright = load('GFX_PLAYWRIGHT', 'playwright');
    if (!esbuild || !playwright) {
        console.log(`cross-runtime check skipped: ${!esbuild ? 'esbuild' : 'playwright'} not found ` +
            '(set GFX_ESBUILD / GFX_PLAYWRIGHT to the package paths)');
        return;
    }
    const manifest = F.load_manifest();
    const fixtures = ids.map(key => {
        const entry = manifest.entries.find(e => `${e.id}@${F.entry_tag(e)}` === key);
        if (!entry) throw new Error(`no fixture ${key}`);
        return {key, scene: F.load_scene(entry)};
    });

    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gfx-core-cross-runtime-'));
    const entry_file = path.join(dir, 'entry.js');
    fs.writeFileSync(entry_file, ENTRY);
    const built = esbuild.module.buildSync({
        entryPoints: [entry_file], bundle: true, platform: 'browser', format: 'iife',
        write: false, logLevel: 'error', metafile: true
    });
    const bundle = built.outputFiles[0].text;
    fs.rmSync(dir, {recursive: true, force: true});

    const node = {};
    for (const {key, scene} of fixtures) {
        render_node(scene);                                   // warm-up
        const t0 = performance.now();
        const pb = render_node(scene);
        node[key] = {hash: crypto.createHash('sha256').update(pb.ta).digest('hex'), ms: performance.now() - t0, pixels: pb.ta};
    }

    const browser = await playwright.module.chromium.launch();
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
    // A localhost page is a secure context, which crypto.subtle needs; the
    // request never leaves Playwright.
    await page.route('http://localhost/gfx-core-cross-runtime.html', route => route.fulfill({
        contentType: 'text/html',
        body: '<!doctype html><title>gfx-core cross-runtime</title>'
    }));
    await page.goto('http://localhost/gfx-core-cross-runtime.html');
    await page.addScriptTag({content: bundle});
    const version = browser.version();

    const main = {};
    for (const {key, scene} of fixtures) {
        await page.evaluate(s => self.GFX_RUN(s), scene);     // warm-up
        main[key] = await page.evaluate(s => self.GFX_RUN(s), scene);
    }
    const worker_results = await page.evaluate(async ({src, scenes}) => {
        const code = 'self.window = self;\n' + src + '\nself.onmessage = async e => {' +
            ' const out = []; for (const s of e.data) { await self.GFX_RUN(s); out.push(await self.GFX_RUN(s)); }' +
            ' self.postMessage(out); };';
        const worker = new Worker(URL.createObjectURL(new Blob([code], {type: 'text/javascript'})));
        return new Promise((resolve, reject) => {
            worker.onmessage = e => resolve(e.data);
            worker.onerror = e => reject(new Error(e.message));
            worker.postMessage(scenes);
        });
    }, {src: bundle, scenes: fixtures.map(f => f.scene)});
    await browser.close();

    const rows = [];
    let ok = errors.length === 0;
    fixtures.forEach(({key}, i) => {
        const n = node[key], m = main[key], w = worker_results[i];
        const png_main = decode_rgba_png(m.png), png_worker = decode_rgba_png(w.png);
        const same = (a, b) => a.length === b.length && Buffer.compare(Buffer.from(a), Buffer.from(b)) === 0;
        const row = {
            fixture: key,
            node_sha256: n.hash,
            main_equal: m.hash === n.hash,
            worker_equal: w.hash === n.hash,
            png_main_decodes_equal: same(png_main.pixels, n.pixels),
            png_worker_decodes_equal: same(png_worker.pixels, n.pixels),
            node_ms: +n.ms.toFixed(2),
            main_ms: +m.ms.toFixed(2),
            worker_ms: +w.ms.toFixed(2),
            main_png_ms: +m.png_ms.toFixed(2),
            png_bytes: m.png.length
        };
        ok = ok && row.main_equal && row.worker_equal && row.png_main_decodes_equal && row.png_worker_decodes_equal;
        rows.push(row);
    });
    const result = {
        chromium: version,
        node: process.version,
        esbuild: esbuild.from,
        playwright: playwright.from,
        bundle_bytes: Buffer.byteLength(bundle),
        all_identical: ok,
        errors,
        rows
    };
    console.log(`Chromium ${version}, Node ${process.version}, bundle ${result.bundle_bytes} bytes`);
    console.table(rows.map(({node_sha256, ...rest}) => ({...rest, sha256: node_sha256.slice(0, 16)})));
    if (errors.length) console.log(errors);
    console.log(ok ? 'all identical' : 'MISMATCH');
    if (out_file) fs.writeFileSync(out_file, JSON.stringify(result, null, 1));
    if (!ok) process.exitCode = 1;
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
