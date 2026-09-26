'use strict';

const assert = require('assert');
const zlib = require('zlib');
const {Pixel_Buffer} = require('../core/gfx-core');
const {encode_png, encode_png_async, Png_Row_Encoder, crc32} = require('../core/png-encoder');
const F = require('./pattern-fixtures');

// Parse PNG chunks, checking every CRC.
const read_chunks = png => {
    const bytes = Buffer.from(png.buffer, png.byteOffset, png.length);
    assert.deepStrictEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
    const chunks = [];
    let p = 8;
    while (p < bytes.length) {
        const length = bytes.readUInt32BE(p);
        const type = bytes.toString('ascii', p + 4, p + 8);
        const data = bytes.subarray(p + 8, p + 8 + length);
        assert.strictEqual(bytes.readUInt32BE(p + 8 + length), crc32(bytes, p + 4, p + 8 + length), `${type} CRC`);
        chunks.push({type, data});
        p += 12 + length;
    }
    assert.strictEqual(p, bytes.length);
    return chunks;
};

// Independent decoder for 8-bit colour types 0, 2 and 6: inflate and unfilter.
const decode = png => {
    const chunks = read_chunks(png);
    const ihdr = chunks[0].data;
    const width = ihdr.readUInt32BE(0), height = ihdr.readUInt32BE(4);
    const bpp = {0: 1, 2: 3, 6: 4}[ihdr[9]];
    const raw = zlib.inflateSync(Buffer.concat(chunks.filter(c => c.type === 'IDAT').map(c => c.data)));
    const row_bytes = width * bpp;
    assert.strictEqual(raw.length, (row_bytes + 1) * height);
    const out = new Uint8Array(row_bytes * height);
    const filters = [];
    for (let y = 0; y < height; y++) {
        const t = raw[y * (row_bytes + 1)];
        filters.push(t);
        for (let i = 0; i < row_bytes; i++) {
            const x = raw[y * (row_bytes + 1) + 1 + i];
            const a = i >= bpp ? out[y * row_bytes + i - bpp] : 0;
            const b = y > 0 ? out[(y - 1) * row_bytes + i] : 0;
            const c = i >= bpp && y > 0 ? out[(y - 1) * row_bytes + i - bpp] : 0;
            let pred = 0;
            if (t === 1) pred = a;
            else if (t === 2) pred = b;
            else if (t === 3) pred = (a + b) >> 1;
            else if (t === 4) {
                const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
                pred = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
            } else assert.strictEqual(t, 0);
            out[y * row_bytes + i] = (x + pred) & 255;
        }
    }
    return {width, height, colour_type: ihdr[9], pixels: out, filters, chunks};
};

// The pixel bytes of a buffer without row padding.
const tight = pb => {
    const bpp = pb.bipp >> 3, row = pb.size[0] * bpp;
    const out = new Uint8Array(row * pb.size[1]);
    for (let y = 0; y < pb.size[1]; y++) out.set(pb.ta.subarray(y * pb.bytes_per_row, y * pb.bytes_per_row + row), y * row);
    return out;
};

// sharp's raw() output turns a one-channel image into RGB unless asked for grey.
const sharp_pixels = async (sharp, png) => {
    const input = Buffer.from(png.buffer, png.byteOffset, png.length);
    const meta = await sharp(input).metadata();
    let pipeline = sharp(input);
    if (meta.channels === 1) pipeline = pipeline.toColourspace('b-w');
    const {data, info} = await pipeline.raw().toBuffer({resolveWithObject: true});
    return {pixels: new Uint8Array(data.buffer, data.byteOffset, data.length), channels: info.channels, meta};
};

const noisy = (w, h, bipp, rowAlignmentBytes = 1, seed = 5) => {
    const pb = new Pixel_Buffer({size: [w, h], bits_per_pixel: bipp, rowAlignmentBytes});
    const random = F.mulberry32(seed);
    const bpp = bipp >> 3;
    for (let y = 0; y < h; y++) {
        for (let i = 0; i < w * bpp; i++) {
            // smooth gradients with noise and flat patches, so every filter gets used
            const flat = (y >> 3) % 3 === 0;
            pb.ta[y * pb.bytes_per_row + i] = flat ? (y * 7) & 255 : (i * 3 + y * 5 + Math.floor(random() * 40)) & 255;
        }
    }
    return pb;
};

const runPngEncoderTests = async () => {
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

    console.log('Running PNG encoder tests...');

    let sharp = null;
    try {
        sharp = require('sharp');
    } catch (error) {
        console.log('  sharp is not installed: the sharp decoding checks are skipped');
    }

    const tile = F.render_scene(F.load_scene(F.load_manifest().entries.find(e => e.id === 'star-and-cross' && F.entry_tag(e) === '418')));

    await test('encode_png round-trips 8, 24 and 32bpp, including padded rows (own decoder)', () => {
        for (const bipp of [8, 24, 32]) {
            for (const align of [1, 8]) {
                const pb = noisy(37, 23, bipp, align);
                const png = encode_png(pb);
                const out = decode(png);
                assert.strictEqual(out.width, 37);
                assert.strictEqual(out.height, 23);
                assert.strictEqual(out.colour_type, {8: 0, 24: 2, 32: 6}[bipp]);
                assert.deepStrictEqual(out.pixels, tight(pb), `${bipp}bpp align ${align}`);
            }
        }
    });

    await test('every filter mode round-trips, and adaptive picks per row', () => {
        const pb = noisy(64, 48, 24);
        const used = new Set();
        for (const filter of ['none', 'sub', 'up', 'average', 'paeth', 'adaptive']) {
            const out = decode(encode_png(pb, {filter}));
            assert.deepStrictEqual(out.pixels, tight(pb), filter);
            if (filter !== 'adaptive') assert(out.filters.every(t => t === {none: 0, sub: 1, up: 2, average: 3, paeth: 4}[filter]));
            else out.filters.forEach(t => used.add(t));
        }
        assert(used.size >= 2, `adaptive used ${[...used]}`);
    });

    await test('sRGB and pHYs chunks: present by default / when dpi is given, in order', () => {
        const pb = noisy(8, 4, 24);
        const types = png => read_chunks(png).map(c => c.type);
        assert.deepStrictEqual(types(encode_png(pb)), ['IHDR', 'sRGB', 'IDAT', 'IEND']);
        assert.deepStrictEqual(types(encode_png(pb, {srgb: false})), ['IHDR', 'IDAT', 'IEND']);
        const chunks = read_chunks(encode_png(pb, {dpi: 300, srgb: 1}));
        assert.deepStrictEqual(chunks.map(c => c.type), ['IHDR', 'sRGB', 'pHYs', 'IDAT', 'IEND']);
        assert.strictEqual(chunks[1].data[0], 1);
        const phys = chunks[2].data;
        assert.strictEqual(phys.readUInt32BE(0), 11811);   // 300 dpi = 11811 px/m
        assert.strictEqual(phys.readUInt32BE(4), 11811);
        assert.strictEqual(phys[8], 1);
    });

    await test('sharp decodes identical RGB, RGBA and grey, and reads the dpi', async () => {
        if (!sharp) return;
        for (const [pb, channels] of [[tile, 3], [noisy(41, 29, 32), 4], [noisy(41, 29, 8), 1], [noisy(40, 30, 24, 8), 3]]) {
            const png = encode_png(pb, {dpi: 300});
            const decoded = await sharp_pixels(sharp, png);
            assert.strictEqual(decoded.meta.channels, channels);
            assert.strictEqual(decoded.channels, channels);
            assert.deepStrictEqual(decoded.pixels, tight(pb));
            assert.strictEqual(decoded.meta.density, 300);
        }
    });

    await test('encode_png_async (CompressionStream) round-trips and matches the sync encoder\'s pixels', async () => {
        for (const pb of [tile, noisy(33, 17, 32, 4), noisy(19, 7, 8)]) {
            const png = await encode_png_async(pb, {dpi: 96});
            assert(png instanceof Uint8Array);
            const out = decode(png);
            assert.deepStrictEqual(out.pixels, tight(pb));
            assert.deepStrictEqual(out.chunks.map(c => c.type).slice(0, 3), ['IHDR', 'sRGB', 'pHYs']);
            if (sharp) assert.deepStrictEqual((await sharp_pixels(sharp, png)).pixels, tight(pb));
        }
    });

    await test('Png_Row_Encoder streams rows from bands into one PNG equal to the whole image', async () => {
        const scene = F.load_scene(F.load_manifest().entries.find(e => e.id === 'star-hexagon' && F.entry_tag(e) === '418'));
        const whole = F.render_scene(scene);
        const parts = [];
        const encoder = new Png_Row_Encoder({
            width: scene.W, height: scene.H, bits_per_pixel: 24, dpi: 150,
            // an asynchronous consumer, like a file stream
            write: bytes => new Promise(resolve => setImmediate(() => { parts.push(Uint8Array.from(bytes)); resolve(); }))
        });
        for (let y0 = 0; y0 < scene.H; y0 += 100) {
            const band = F.render_scene(scene, {window: [0, y0, scene.W, Math.min(100, scene.H - y0)]});
            await encoder.write_rows(band);
        }
        await encoder.end();
        assert.strictEqual(encoder.rows_written, scene.H);
        assert(parts.length >= 3, `${parts.length} writes`);
        const png = Buffer.concat(parts.map(p => Buffer.from(p)));
        const out = decode(new Uint8Array(png));
        assert.deepStrictEqual(out.pixels, tight(whole));
        assert.deepStrictEqual(out.chunks.map(c => c.type).slice(0, 3), ['IHDR', 'sRGB', 'pHYs']);
        assert.strictEqual(out.chunks[out.chunks.length - 1].type, 'IEND');
        if (sharp) assert.deepStrictEqual((await sharp_pixels(sharp, new Uint8Array(png))).pixels, tight(whole));
    });

    await test('Png_Row_Encoder enforces the row count and row length', async () => {
        const make = () => new Png_Row_Encoder({width: 4, height: 2, bits_per_pixel: 32, write: () => {}});
        const short = make();
        await short.write_row(new Uint8Array(16));
        await assert.rejects(() => short.end(), /1 of 2 rows/);
        const extra = make();
        await extra.write_row(new Uint8Array(16));
        await extra.write_row(new Uint8Array(16));
        await assert.rejects(() => extra.write_row(new Uint8Array(16)), /more rows/);
        await extra.end();
        await assert.rejects(() => extra.end(), /already/);
        await assert.rejects(() => make().write_row(new Uint8Array(12)), /16 bytes/);
        assert.throws(() => new Png_Row_Encoder({width: 4, height: 2, bits_per_pixel: 24}), /write/);
    });

    await test('invalid input is rejected', () => {
        const pb = noisy(4, 4, 24);
        assert.throws(() => encode_png(new Pixel_Buffer({size: [8, 1], bits_per_pixel: 1})), /8, 24 and 32bpp/);
        assert.throws(() => encode_png(pb, {filter: 'lzw'}), /filter/);
        assert.throws(() => encode_png(pb, {dpi: -3}), /dpi/);
        assert.throws(() => encode_png(pb, {srgb: 7}), /srgb/);
        assert.throws(() => encode_png(pb, {level: 11}), /level/);
        assert.throws(() => encode_png(null), /Pixel_Buffer/);
    });

    return {passed, failed};
};

if (require.main === module) {
    runPngEncoderTests().then(({passed, failed}) => {
        console.log(`\nTest summary: ${passed} passed, ${failed} failed.`);
        process.exit(failed > 0 ? 1 : 0);
    });
}

module.exports = runPngEncoderTests;
