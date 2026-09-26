'use strict';

/*
 * PNG encoding for 8, 24 and 32bpp Pixel_Buffers (PNG colour types 0, 2 and
 * 6, 8 bits per sample).
 *
 * - encode_png(pb, options): synchronous, Node only (node:zlib). Uint8Array.
 * - encode_png_async(pb, options): browser, Worker or Node, through
 *   CompressionStream('deflate'). Promise of a Uint8Array.
 * - Png_Row_Encoder: streaming; accepts rows one at a time and hands PNG
 *   bytes to a `write` callback, so a print-size image is never held whole.
 *
 * Options: dpi (writes a pHYs chunk), srgb (true, false or a rendering
 * intent 0-3; default true writes an sRGB chunk with intent 0, perceptual),
 * filter ('adaptive' by default: per row, the filter with the smallest sum
 * of absolute signed residuals, as libpng does; or 'none', 'sub', 'up',
 * 'average', 'paeth'). encode_png also takes level (zlib 0-9, default 6).
 *
 * This module never loads node:zlib at the top level, so browser bundles of
 * gfx-core do not pull it in.
 */

const SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];
const FILTERS = {none: 0, sub: 1, up: 2, average: 3, paeth: 4};
const COLOUR_TYPES = {8: 0, 24: 2, 32: 6};
const IDAT_SIZE = 65536;            // bytes of zlib data per IDAT chunk

const CRC_TABLE = (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        table[n] = c >>> 0;
    }
    return table;
})();

const crc32 = (bytes, start, end) => {
    let c = 0xffffffff;
    for (let i = start; i < end; i++) c = CRC_TABLE[(c ^ bytes[i]) & 255] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
};

const chunk = (type, data) => {
    const out = new Uint8Array(12 + data.length);
    const view = new DataView(out.buffer);
    view.setUint32(0, data.length);
    for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
    out.set(data, 8);
    view.setUint32(8 + data.length, crc32(out, 4, 8 + data.length));
    return out;
};

const concat = parts => {
    let length = 0;
    for (const part of parts) length += part.length;
    const out = new Uint8Array(length);
    let offset = 0;
    for (const part of parts) {
        out.set(part, offset);
        offset += part.length;
    }
    return out;
};

const read_options = (options, bits_per_pixel) => {
    const opts = options || {};
    if (!(bits_per_pixel in COLOUR_TYPES)) {
        throw new TypeError(`PNG encoding supports 8, 24 and 32bpp, not ${bits_per_pixel}bpp`);
    }
    const filter = opts.filter === undefined ? 'adaptive' : opts.filter;
    if (filter !== 'adaptive' && !(filter in FILTERS)) {
        throw new TypeError(`filter must be 'adaptive', 'none', 'sub', 'up', 'average' or 'paeth', not ${String(filter)}`);
    }
    let dpi = null;
    if (opts.dpi !== undefined && opts.dpi !== null) {
        if (typeof opts.dpi !== 'number' || !(opts.dpi > 0) || !Number.isFinite(opts.dpi)) {
            throw new TypeError('dpi must be a positive number');
        }
        dpi = opts.dpi;
    }
    const srgb = opts.srgb === undefined ? true : opts.srgb;
    let intent = null;
    if (srgb === true) intent = 0;
    else if (Number.isInteger(srgb) && srgb >= 0 && srgb <= 3) intent = srgb;
    else if (srgb !== false) throw new TypeError('srgb must be true, false or a rendering intent from 0 to 3');
    return {filter, dpi, intent, level: opts.level};
};

// Signature, IHDR, then sRGB and pHYs when requested.
const header_bytes = (width, height, bits_per_pixel, {dpi, intent}) => {
    const ihdr = new Uint8Array(13);
    const view = new DataView(ihdr.buffer);
    view.setUint32(0, width);
    view.setUint32(4, height);
    ihdr[8] = 8;
    ihdr[9] = COLOUR_TYPES[bits_per_pixel];
    const parts = [Uint8Array.from(SIGNATURE), chunk('IHDR', ihdr)];
    if (intent !== null) parts.push(chunk('sRGB', Uint8Array.of(intent)));
    if (dpi !== null) {
        const ppm = Math.round(dpi / 0.0254);
        const phys = new Uint8Array(9);
        const pv = new DataView(phys.buffer);
        pv.setUint32(0, ppm);
        pv.setUint32(4, ppm);
        phys[8] = 1;                                   // unit: metre
        parts.push(chunk('pHYs', phys));
    }
    return concat(parts);
};

const iend_bytes = () => chunk('IEND', new Uint8Array(0));

const paeth = (a, b, c) => {
    const p = a + b - c;
    const pa = p > a ? p - a : a - p;
    const pb = p > b ? p - b : b - p;
    const pc = p > c ? p - c : c - p;
    if (pa <= pb && pa <= pc) return a;
    return pb <= pc ? b : c;
};

/*
 * Filter one row with filter type t into dst[at...] (dst may be null to only
 * measure). prev is the unfiltered row above (zeros for the first row).
 * Returns the sum of |residual| with residuals read as signed bytes, stopping
 * early once it reaches `limit`.
 */
const apply_filter = (t, row, prev, bpp, dst, at, limit) => {
    const n = row.length;
    const k = bpp < n ? bpp : n;
    let sum = 0;
    // The first bpp bytes have no left neighbour (a = 0, c = 0).
    for (let i = 0; i < k; i++) {
        const x = row[i];
        const v = t === 0 || t === 1 ? x : t === 3 ? (x - (prev[i] >> 1)) & 255 : (x - prev[i]) & 255;
        if (dst) dst[at + i] = v;
        else sum += v < 128 ? v : 256 - v;
    }
    if (dst) {
        switch (t) {
            case 0: for (let i = k; i < n; i++) dst[at + i] = row[i]; break;
            case 1: for (let i = k; i < n; i++) dst[at + i] = (row[i] - row[i - bpp]) & 255; break;
            case 2: for (let i = k; i < n; i++) dst[at + i] = (row[i] - prev[i]) & 255; break;
            case 3: for (let i = k; i < n; i++) dst[at + i] = (row[i] - ((row[i - bpp] + prev[i]) >> 1)) & 255; break;
            default:
                for (let i = k; i < n; i++) dst[at + i] = (row[i] - paeth(row[i - bpp], prev[i], prev[i - bpp])) & 255;
        }
        return 0;
    }
    let v;
    switch (t) {
        case 0:
            for (let i = k; i < n && sum < limit; i++) { v = row[i]; sum += v < 128 ? v : 256 - v; }
            break;
        case 1:
            for (let i = k; i < n && sum < limit; i++) { v = (row[i] - row[i - bpp]) & 255; sum += v < 128 ? v : 256 - v; }
            break;
        case 2:
            for (let i = k; i < n && sum < limit; i++) { v = (row[i] - prev[i]) & 255; sum += v < 128 ? v : 256 - v; }
            break;
        case 3:
            for (let i = k; i < n && sum < limit; i++) {
                v = (row[i] - ((row[i - bpp] + prev[i]) >> 1)) & 255;
                sum += v < 128 ? v : 256 - v;
            }
            break;
        default:
            for (let i = k; i < n && sum < limit; i++) {
                v = (row[i] - paeth(row[i - bpp], prev[i], prev[i - bpp])) & 255;
                sum += v < 128 ? v : 256 - v;
            }
    }
    return sum;
};

// Write the filter byte and filtered row at out[offset]. Returns the filter used.
const filter_row = (mode, row, prev, bpp, out, offset) => {
    let t = mode === 'adaptive' ? -1 : FILTERS[mode];
    if (t < 0) {
        // libpng's heuristic: smallest sum of |residual| read as signed bytes.
        let best = Infinity;
        for (let f = 0; f < 5; f++) {
            const sum = apply_filter(f, row, prev, bpp, null, 0, best);
            if (sum < best) {
                best = sum;
                t = f;
            }
        }
    }
    out[offset] = t;
    apply_filter(t, row, prev, bpp, out, offset + 1, Infinity);
    return t;
};

const check_pb = pb => {
    if (!pb || !pb.ta || !pb.size) throw new TypeError('PNG encoding needs a Pixel_Buffer');
    return pb.bipp;
};

// All rows of a buffer, filtered, as the uncompressed zlib payload.
const filtered_scanlines = (pb, filter) => {
    const [width, height] = pb.size;
    const bpp = pb.bipp >> 3;
    const row_bytes = width * bpp;
    const stride = pb.bytes_per_row;
    const out = new Uint8Array((row_bytes + 1) * height);
    let prev = new Uint8Array(row_bytes);
    for (let y = 0; y < height; y++) {
        const row = pb.ta.subarray(y * stride, y * stride + row_bytes);
        filter_row(filter, row, prev, bpp, out, y * (row_bytes + 1));
        prev = row;
    }
    return out;
};

// Split a zlib stream into IDAT chunks.
const idat_chunks = zdata => {
    const parts = [];
    for (let i = 0; i < zdata.length; i += IDAT_SIZE) {
        parts.push(chunk('IDAT', zdata.subarray(i, Math.min(zdata.length, i + IDAT_SIZE))));
    }
    if (parts.length === 0) parts.push(chunk('IDAT', zdata));
    return parts;
};

// node:zlib when running in Node, found at call time so bundlers ignore it.
const node_zlib = () => {
    if (typeof process === 'undefined' || !process.versions || !process.versions.node) return null;
    try {
        return typeof module !== 'undefined' && typeof module.require === 'function' ? module.require('zlib') : null;
    } catch (error) {
        return null;
    }
};

/**
 * Encode a Pixel_Buffer as PNG, synchronously (Node's zlib).
 * @param {Pixel_Buffer} pb 8, 24 or 32bpp.
 * @param {Object} [options] {dpi, srgb = true, filter = 'adaptive', level = 6}
 * @returns {Uint8Array}
 */
const encode_png = (pb, options) => {
    const bipp = check_pb(pb);
    const opts = read_options(options, bipp);
    const zlib = node_zlib();
    if (!zlib) {
        throw new Error('encode_png needs Node\'s zlib; use encode_png_async in a browser or Worker');
    }
    const level = opts.level === undefined ? 6 : opts.level;
    if (!Number.isInteger(level) || level < 0 || level > 9) throw new TypeError('level must be an integer from 0 to 9');
    const raw = filtered_scanlines(pb, opts.filter);
    const z = zlib.deflateSync(raw, {level});
    const zdata = new Uint8Array(z.buffer, z.byteOffset, z.length);
    return concat([header_bytes(pb.size[0], pb.size[1], bipp, opts), ...idat_chunks(zdata), iend_bytes()]);
};

const require_compression_stream = name => {
    if (typeof CompressionStream !== 'function') {
        throw new Error(`${name} needs CompressionStream (modern browsers, Workers, Node 18+)`);
    }
};

// zlib-deflate one buffer with CompressionStream.
const deflate_async = async bytes => {
    const stream = new CompressionStream('deflate');
    const writer = stream.writable.getWriter();
    const reader = stream.readable.getReader();
    const parts = [];
    const pump = (async () => {
        for (;;) {
            const {value, done} = await reader.read();
            if (done) return;
            parts.push(value);
        }
    })();
    await writer.ready;
    writer.write(bytes);
    await writer.close();
    await pump;
    return concat(parts);
};

/**
 * Encode a Pixel_Buffer as PNG with CompressionStream (browser, Worker, Node).
 * @param {Pixel_Buffer} pb 8, 24 or 32bpp.
 * @param {Object} [options] {dpi, srgb = true, filter = 'adaptive'}
 * @returns {Promise<Uint8Array>}
 */
const encode_png_async = async (pb, options) => {
    const bipp = check_pb(pb);
    const opts = read_options(options, bipp);
    require_compression_stream('encode_png_async');
    const zdata = await deflate_async(filtered_scanlines(pb, opts.filter));
    return concat([header_bytes(pb.size[0], pb.size[1], bipp, opts), ...idat_chunks(zdata), iend_bytes()]);
};

/**
 * Streaming PNG encoder: rows in, PNG bytes out through `write`.
 *
 *   const enc = new Png_Row_Encoder({width, height, bits_per_pixel, dpi, srgb, filter, write});
 *   await enc.write_row(row);        // width * bytes-per-pixel bytes, top row first
 *   await enc.write_rows(band_pb);   // or every row of a band buffer of the same width
 *   await enc.end();                 // after exactly `height` rows
 *
 * `write(bytes)` receives the signature and header, the IDAT chunks as the
 * compressor produces them, and IEND, in order. It may return a Promise;
 * later writes wait for it.
 */
class Png_Row_Encoder {
    constructor(spec) {
        const {width, height, bits_per_pixel, write} = spec || {};
        if (!Number.isSafeInteger(width) || width <= 0 || !Number.isSafeInteger(height) || height <= 0) {
            throw new TypeError('Png_Row_Encoder needs positive integer width and height');
        }
        if (typeof write !== 'function') throw new TypeError('Png_Row_Encoder needs a write(bytes) callback');
        this._opts = read_options(spec, bits_per_pixel);
        require_compression_stream('Png_Row_Encoder');
        this.width = width;
        this.height = height;
        this.bits_per_pixel = bits_per_pixel;
        this.rows_written = 0;
        this._bpp = bits_per_pixel >> 3;
        this._row_bytes = width * this._bpp;
        this._prev = new Uint8Array(this._row_bytes);
        this._batch_rows = Math.max(1, Math.floor(IDAT_SIZE / (this._row_bytes + 1)));
        this._batch = null;
        this._batch_used = 0;
        this._ended = false;
        this._write = write;
        this._chain = Promise.resolve();
        this._emit(header_bytes(width, height, bits_per_pixel, this._opts));
        const stream = new CompressionStream('deflate');
        this._writer = stream.writable.getWriter();
        this._pump = this._run_pump(stream.readable.getReader());
        // Keep a failure from surfacing as an unhandled rejection before end().
        this._pump.catch(() => {});
    }

    _emit(bytes) {
        this._chain = this._chain.then(() => this._write(bytes));
        return this._chain;
    }

    async _run_pump(reader) {
        let parts = [], size = 0;
        for (;;) {
            const {value, done} = await reader.read();
            if (done) break;
            parts.push(value);
            size += value.length;
            if (size >= IDAT_SIZE) {
                // Waiting for write() here lets a slow consumer push back on
                // the compressor, and through it on write_row().
                await this._emit(chunk('IDAT', concat(parts)));
                parts = [];
                size = 0;
            }
        }
        if (size > 0) await this._emit(chunk('IDAT', concat(parts)));
    }

    async _flush() {
        if (!this._batch || this._batch_used === 0) return;
        const bytes = this._batch.subarray(0, this._batch_used);
        this._batch = null;
        this._batch_used = 0;
        await this._writer.ready;
        this._writer.write(bytes);
    }

    /** @param {Uint8Array} row width * bytes-per-pixel bytes. */
    async write_row(row) {
        if (this._ended) throw new Error('Png_Row_Encoder: end() was already called');
        if (!row || row.length !== this._row_bytes) {
            throw new TypeError(`Png_Row_Encoder: a row must be ${this._row_bytes} bytes`);
        }
        if (this.rows_written >= this.height) throw new RangeError('Png_Row_Encoder: more rows than height');
        if (!this._batch) this._batch = new Uint8Array(this._batch_rows * (this._row_bytes + 1));
        filter_row(this._opts.filter, row, this._prev, this._bpp, this._batch, this._batch_used);
        this._batch_used += this._row_bytes + 1;
        this._prev.set(row);
        this.rows_written++;
        if (this._batch_used >= this._batch.length) await this._flush();
    }

    /** Every row of a Pixel_Buffer with the encoder's width and format. */
    async write_rows(pb) {
        if (!pb || !pb.ta || !pb.size || pb.size[0] !== this.width || pb.bipp !== this.bits_per_pixel) {
            throw new TypeError('Png_Row_Encoder: write_rows needs a Pixel_Buffer of the same width and bits_per_pixel');
        }
        const stride = pb.bytes_per_row;
        for (let y = 0; y < pb.size[1]; y++) {
            await this.write_row(pb.ta.subarray(y * stride, y * stride + this._row_bytes));
        }
    }

    /** Finish the stream once all rows are written. */
    async end() {
        if (this._ended) throw new Error('Png_Row_Encoder: end() was already called');
        if (this.rows_written !== this.height) {
            throw new RangeError(`Png_Row_Encoder: ${this.rows_written} of ${this.height} rows written`);
        }
        this._ended = true;
        await this._flush();
        await this._writer.close();
        await this._pump;
        await this._emit(iend_bytes());
    }
}

module.exports = {encode_png, encode_png_async, Png_Row_Encoder, crc32};
