
const lang = require('lang-mini');
const {
    each,
    fp,
    tof,
    get_a_sig,
    are_equal,
    tf
} = lang;
const maxui64 = ~0n;
const Pixel_Pos_List = require('./pixel-pos-list');
const oext = require('obext');
const {ro, prop} = oext;
const Typed_Array_Binary_Read_Write = require('./Typed_Array_Binary_Read_Write');
const {
    createPixelBufferStorage,
    canonicalizePixelBufferStorage
} = require('./pixel-buffer-layout');
let ta_math = require('./ta-math')
let {resize_ta_colorspace, copy_rect_to_same_size_8bipp, copy_rect_to_same_size_24bipp, dest_aligned_copy_rect_1to4bypp} = ta_math;

const readAliasedSpecValue = (spec, names) => {
    let value;
    let valueName;

    for (const name of names) {
        if (spec[name] !== undefined) {
            if (valueName !== undefined && spec[name] !== value) {
                throw new TypeError(
                    `Conflicting ${valueName} and ${name} values in Pixel Buffer specification`
                );
            }
            value = spec[name];
            valueName = name;
        }
    }

    return value;
};

const BITS_PER_PIXEL_SPEC_NAMES = ['bits_per_pixel', 'bitsPerPixel', 'bipp'];
const BYTES_PER_PIXEL_SPEC_NAMES = ['bytes_per_pixel', 'bytesPerPixel', 'bypp'];
const ROW_STRIDE_SPEC_NAMES = ['rowStrideBytes', 'row_stride_bytes', 'bytes_per_row', 'bypr'];
const ROW_ALIGNMENT_SPEC_NAMES = ['rowAlignmentBytes', 'row_alignment_bytes'];
const SOURCE_SPEC_NAMES = ['window_to', 'source', 'window_to_source'];

const isCoordinateArray = value => (
    Array.isArray(value) ||
    (ArrayBuffer.isView(value) && !(value instanceof DataView))
);

const validateCoordinateArray = (value, expectedLength, name) => {
    if (!isCoordinateArray(value) || value.length !== expectedLength) {
        throw new TypeError(`${name} must be a ${expectedLength}-element array or typed array`);
    }

    for (let index = 0; index < expectedLength; index++) {
        if (!Number.isSafeInteger(value[index])) {
            throw new TypeError(`${name}[${index}] must be a safe integer`);
        }
    }
};

const setCoordinates = (target, value, name) => {
    validateCoordinateArray(value, target.length, name);
    target.set(value);
};

const validatePixelBufferSource = (value, expectedBitsPerPixel) => {
    if (value === undefined || value === null) return undefined;
    if (!(value instanceof Pixel_Buffer_Core_Inner_Structures)) {
        throw new TypeError('Pixel Buffer source must be another Pixel Buffer');
    }
    if (
        expectedBitsPerPixel !== undefined &&
        value.bits_per_pixel !== expectedBitsPerPixel
    ) {
        throw new TypeError(
            `Pixel Buffer source is ${value.bits_per_pixel}bipp; expected ${expectedBitsPerPixel}bipp`
        );
    }
    return value;
};

// Core structures first?

// inner core



class Pixel_Buffer_Core_Inner_Structures {
    constructor(spec) {
        if (spec instanceof Pixel_Pos_List) {
            throw new Error('Pixel_Pos_List construction is not implemented');
        }

        if (spec instanceof Pixel_Buffer_Core_Inner_Structures) {
            spec = {
                bits_per_pixel: spec.bits_per_pixel,
                size: spec.size,
                rowStrideBytes: spec.bytes_per_row,
                rowAlignmentBytes: spec.layout.rowAlignmentBytes,
                ta: spec.storage
            };
        }

        if (!spec || typeof spec !== 'object') {
            throw new TypeError('A Pixel Buffer specification object is required');
        }

        if (!spec.size || spec.size.length !== 2) {
            throw new TypeError('Expected a size [width, height] property in the Pixel Buffer specification');
        }

        const source = validatePixelBufferSource(
            readAliasedSpecValue(spec, SOURCE_SPEC_NAMES)
        );
        const requestedBitsPerPixel = readAliasedSpecValue(
            spec,
            BITS_PER_PIXEL_SPEC_NAMES
        );
        if (
            source &&
            requestedBitsPerPixel !== undefined &&
            requestedBitsPerPixel !== source.bits_per_pixel
        ) {
            throw new TypeError(
                `bits_per_pixel contradicts the ${source.bits_per_pixel}bipp source`
            );
        }
        let bitsPerPixel = source
            ? source.bits_per_pixel
            : requestedBitsPerPixel;
        const requestedBytesPerPixel = readAliasedSpecValue(
            spec,
            BYTES_PER_PIXEL_SPEC_NAMES
        );

        if (bitsPerPixel === undefined) {
            bitsPerPixel = requestedBytesPerPixel === undefined
                ? 32
                : requestedBytesPerPixel * 8;
        } else if (requestedBytesPerPixel !== undefined) {
            const compatible = bitsPerPixel === 1
                ? requestedBytesPerPixel === 0 || requestedBytesPerPixel === 0.125
                : requestedBytesPerPixel * 8 === bitsPerPixel;
            if (!compatible) {
                throw new TypeError('bytes_per_pixel contradicts bits_per_pixel');
            }
        }

        const rowStrideBytes = readAliasedSpecValue(
            spec,
            ROW_STRIDE_SPEC_NAMES
        );
        const rowAlignmentBytes = readAliasedSpecValue(
            spec,
            ROW_ALIGNMENT_SPEC_NAMES
        );
        if (spec.ta !== undefined && spec.buffer !== undefined && spec.ta !== spec.buffer) {
            throw new TypeError('Conflicting ta and buffer storage views in Pixel Buffer specification');
        }
        const suppliedStorage = spec.ta !== undefined ? spec.ta : spec.buffer;
        const storageResult = createPixelBufferStorage({
            width: spec.size[0],
            height: spec.size[1],
            bitsPerPixel,
            rowStrideBytes,
            rowAlignmentBytes
        }, suppliedStorage);
        const {layout, storage, ta} = storageResult;
        const size = Object.freeze([layout.width, layout.height]);

        // Float64Array preserves every safe-integer coordinate. Pixel positions
        // can be negative or lie outside the image when this buffer is a window,
        // so dimensions alone cannot safely determine a narrower representation.
        const pos = new Float64Array(2);

        Object.defineProperties(this, {
            layout: {value: layout, enumerable: true},
            ta: {value: ta, enumerable: true},
            buffer: {value: ta, enumerable: true},
            storage: {value: storage, enumerable: true},
            bits_per_pixel: {value: layout.bitsPerPixel, enumerable: true},
            bipp: {value: layout.bitsPerPixel, enumerable: true},
            bytes_per_pixel: {value: layout.bytesPerPixel, enumerable: true},
            bypp: {value: layout.bytesPerPixel, enumerable: true},
            bytes_per_row: {value: layout.rowStrideBytes, enumerable: true},
            bypr: {value: layout.rowStrideBytes, enumerable: true},
            bits_per_row: {value: layout.rowDataBits, enumerable: true}
        });

        Object.defineProperty(this, 'pos', {
            get() { return pos; },
            set(value) {
                setCoordinates(pos, value, 'pos');
            },
            enumerable: true,
            configurable: false
        });
        const pos_bounds = new Float64Array(4);
        const pos_center = new Float64Array(2);
        const edge_offsets_from_center = new Float64Array(4);
        let has_pos_bounds = false;

        Object.defineProperty(this, 'pos_center', {
            get() {
                pos_center[0] = pos[0] + Math.floor(size[0] / 2);
                pos_center[1] = pos[1] + Math.floor(size[1] / 2);
                return pos_center;
            },
            set(value) {
                validateCoordinateArray(value, 2, 'pos_center');
                const next_x = value[0] - Math.floor(size[0] / 2);
                const next_y = value[1] - Math.floor(size[1] / 2);
                if (!Number.isSafeInteger(next_x) || !Number.isSafeInteger(next_y)) {
                    throw new RangeError('pos_center places the window outside the safe-integer coordinate range');
                }
                pos[0] = next_x;
                pos[1] = next_y;
            },
            enumerable: true,
            configurable: false
        });
        Object.defineProperty(this, 'edge_offsets_from_center', {
            get() {
                const center_x = Math.floor(size[0] / 2);
                const center_y = Math.floor(size[1] / 2);
                edge_offsets_from_center[0] = -center_x;
                edge_offsets_from_center[1] = -center_y;
                edge_offsets_from_center[2] = size[0] - center_x;
                edge_offsets_from_center[3] = size[1] - center_y;
                return edge_offsets_from_center;
            },
            enumerable: true,
            configurable: false
        });
        Object.defineProperty(this, 'pos_bounds', {
            get() {
                return pos_bounds; 
            },
            set(value) {
                setCoordinates(pos_bounds, value, 'pos_bounds');
                has_pos_bounds = true;
            },
            enumerable: true,
            configurable: false
        });
        const minus_pos = new Float64Array(2);
        Object.defineProperty(this, 'minus_pos', {
            get() {
                if (pos) {
                    minus_pos[0] = pos[0] * -1;
                    minus_pos[1] = pos[1] * -1;
                    return minus_pos;
                }
            },
            enumerable: true,
            configurable: false
        });
        Object.defineProperty(this, 'size', {
            get() { return size; },
            set() {
                throw new TypeError('Pixel Buffer size is immutable; create a new buffer instead');
            },
            enumerable: true,
            configurable: false
        });

        const meta = Object.freeze({
            size,
            bits_per_pixel: layout.bitsPerPixel,
            bytes_per_pixel: layout.bytesPerPixel,
            bytes_per_row: layout.rowStrideBytes,
            layout
        });
        Object.defineProperty(this, 'meta', {
            value: meta,
            enumerable: true
        });

        let pb_source = source;
        Object.defineProperty(this, 'source', {
            get() { return pb_source; },
            set(value) {
                pb_source = validatePixelBufferSource(value, layout.bitsPerPixel);
            },
            enumerable: true,
            configurable: false
        });

        if (spec.pos !== undefined) {
            this.pos = spec.pos;
        }
        if (spec.pos_center !== undefined) {
            if (spec.pos !== undefined) {
                validateCoordinateArray(spec.pos_center, 2, 'pos_center');
                const expected_x = pos[0] + Math.floor(size[0] / 2);
                const expected_y = pos[1] + Math.floor(size[1] / 2);
                if (
                    spec.pos_center[0] !== expected_x ||
                    spec.pos_center[1] !== expected_y
                ) {
                    throw new TypeError('pos and pos_center specify different window positions');
                }
            } else {
                this.pos_center = spec.pos_center;
            }
        }

        if (spec.color !== undefined) {
            this.color_whole(spec.color);
        }

        // Supplied buffers remain shared and mutable. Normalizing their unused
        // row bytes here establishes the layout invariant once, outside hot paths.
        canonicalizePixelBufferStorage(ta, layout);

        if (spec.pos_bounds) {
            this.pos_bounds = spec.pos_bounds;
        }
        this.move = ta_2d_vector => {
            validateCoordinateArray(ta_2d_vector, 2, 'move vector');
            const next_x = pos[0] + ta_2d_vector[0];
            const next_y = pos[1] + ta_2d_vector[1];
            if (!Number.isSafeInteger(next_x) || !Number.isSafeInteger(next_y)) {
                throw new RangeError('move would exceed the safe-integer coordinate range');
            }
            pos[0] = next_x;
            pos[1] = next_y;
            if (this.source) {
                this.copy_from_source();
            }
            return pos;
        }
        this.each_pos_within_bounds = (callback) => {
            const has_source = !!this.source;
            for (pos[1] = pos_bounds[1]; pos[1] < pos_bounds[3]; pos[1] ++) {
                for (pos[0] = pos_bounds[0]; pos[0] < pos_bounds[2]; pos[0] ++) {
                    if (has_source) this.copy_from_source();
                    callback();
                }
            }
        }
        this.move_next_px = () => {
            let left = 0;
            let top = 0;
            let right;
            let bottom;

            if (has_pos_bounds) {
                left = pos_bounds[0];
                top = pos_bounds[1];
                right = pos_bounds[2];
                bottom = pos_bounds[3];
            } else {
                if (!this.source) {
                    throw new Error('move_next_px requires a source or pos_bounds');
                }
                right = this.source.size[0] - size[0] + 1;
                bottom = this.source.size[1] - size[1] + 1;
            }

            if (pos[0] + 1 < right) {
                pos[0]++;
            } else {
                if (pos[1] + 1 < bottom) {
                    pos[0] = left;
                    pos[1]++;
                } else {
                    return false;
                }
            }
            if (this.source) {
                this.copy_from_source();
            }
            return pos;
        }
        
        this.tabrw = new Typed_Array_Binary_Read_Write(ta, layout.bitOrder);
        this.dv = this.tabrw.dv;
    }
    
    toString() {
        /*
        size: Uint32Array [ 1024, 576 ],
        bits_per_pixel: 32,
        bytes_per_pixel: 4,
        bytes_per_row: 4096 }
        */
        return JSON.stringify({
            buffer: 'Uint8ClampedArray length ' + this.buffer.length,
            size: this.size,
            bits_per_pixel: this.bits_per_pixel,
            bytes_per_pixel: this.bytes_per_pixel,
            bytes_per_row: this.bytes_per_row
        });
    }
    /*
    [inspect]() {
        return 'Pixel_Buffer_Core ' + this.toString();
    }
    */
    
    each_pixel_byte_index(cb) {
        const {bipp} = this;
        let ctu = true;
        const stop = () => ctu = false;

        // .num_pixels????

        const [w, h] = this.size;
        const num_pixels = w * h;

        let bit_idx = 0, byte_idx = bit_idx >> 3;

        for (let c = 0; c < num_pixels; c++) {

            byte_idx = bit_idx >> 3;
            bc(byte_idx);



        }
    }
    each_px(callback) {


        const ta_pos = new Int32Array(2);


        const [w, h] = this.size;
        //let x, y;

        // (pos, color, index) would be good callback format.
        let index = 0;

        for (ta_pos[1] = 0; ta_pos[1] < h; ta_pos[1]++) {
            for (ta_pos[0] = 0; ta_pos[0] < w; ta_pos[0]++) {
                const color = this.get_pixel(ta_pos);
                //ta_px_value[0] = px;
                callback(ta_pos, color, index++);
            }
        }
    }
    paint_pixel_list(pixel_pos_list, color) {
        pixel_pos_list.each_pixel(pos => {
            this.set_pixel_ta(pos, color);
        });
    }

    // Maybe a class level that has get and set pixel logic for the different bipps at this level.

    


    get num_px() {
        return this.size[0] * this.size[1];
    }
    get split_rgb_channels() {
        const [bipp, bypp] = [this.bits_per_pixel, this.bytes_per_pixel];
        if (bipp === 24 || bipp === 32) {
            const res = [new this.constructor({
                bits_per_pixel: 8,
                size: this.size
            }), new this.constructor({
                bits_per_pixel: 8,
                size: this.size
            }), new this.constructor({
                bits_per_pixel: 8,
                size: this.size
            })]
            const [r, g, b] = res;
            let i_px = 0;
            const num_px = this.num_px;
            let i_byte = 0;
            const [ta_r, ta_g, ta_b] = [r.ta, g.ta, b.ta];
            const ta = this.ta;
            while (i_px < num_px) {
                ta_r[i_px] = ta[i_byte];
                ta_g[i_px] = ta[i_byte + 1];
                ta_b[i_px] = ta[i_byte + 2];
                i_px++;
                i_byte += bypp;
            }
            return res;
        } else {
            console.trace();
            throw 'NYI';
        }
    }
    process(fn) {
        let res = this.clone();
        return fn(this, res);
    }
    /*
    function typedArraysAreEqual(a, b) {
if (a.byteLength !== b.byteLength) return false;
return a.every((val, i) => val === b[i]);
}
    */
    equals(other_pixel_buffer) {
        let buf1 = this.ta;
        let buf2 = other_pixel_buffer.ta;
        const other_colorspace = other_pixel_buffer.ta_colorspace;
        const my_colorspace = other_pixel_buffer.ta_colorspace;
        if (my_colorspace.length === other_colorspace.length) {
            if(my_colorspace.every((val, i) => val === other_colorspace[i])) {
                if (buf1.length === buf2.length) {
                    return buf1.every((val, i) => val === buf2[i]);
                } else {
                }
            } else {
            }
        }
        return false;
    }
    copy_pixel_pos_list_region(pixel_pos_list, bg_color) {
        let bounds = pixel_pos_list.bounds;
        let size = new Uint16Array([bounds[2] - bounds[0] + 1, bounds[3] - bounds[1] + 1]);
        const res = new this.constructor({
            size: size,
            bytes_per_pixel: this.bytes_per_pixel
        });
        if (this.pos) res.pos = this.pos;
        if (bg_color) {
            res.color_whole(bg_color);
        }
        res.pos = new Int16Array([bounds[0], bounds[1]]);
        pixel_pos_list.each_pixel((pos) => {
            let color = this.get_pixel_ta(pos);
            const target_pos = new Int16Array([(pos[0] - bounds[0]), (pos[1] - bounds[1])]);
            res.set_pixel_ta(target_pos, color);
        });
        return res;
    }
    'blank_copy'() {
        var res = new this.constructor({
            'size': this.size,
            'bits_per_pixel': this.bits_per_pixel
        });
        res.buffer.fill(0);
        if (this.pos) res.pos = this.pos;
        return res;
    }
    'clone'() {
        var res = new this.constructor({
            'size': this.size,
            'bits_per_pixel': this.bits_per_pixel,
            'buffer': new this.buffer.constructor(this.buffer)
        });
        if (this.pos) res.pos = this.pos;
        return res;
    }
    'add_alpha_channel'() {
        console.log('add_alpha_channel this.bytes_per_pixel', this.bytes_per_pixel);
        if (this.bytes_per_pixel === 3) {
            var res = new this.constructor({
                'size': this.size,
                'bytes_per_pixel': 4
            });
            if (this.pos) res.pos = this.pos;
            /*
            this.each_pixel((x, y, r, g, b) => {
                res.set_pixel(x, y, r, g, b, 255);
            });
            */
            const buf = this.buffer,
                res_buf = res.buffer;
            const px_count = this.size[0] * this.size[1];
            let i = 0,
                ir = 0;
            for (let p = 0; p < px_count; p++) {
                res_buf[ir++] = buf[i++];
                res_buf[ir++] = buf[i++];
                res_buf[ir++] = buf[i++];
                res_buf[ir++] = 255;
            }
            return res;
        }
        if (this.bytes_per_pixel === 4) {
            return this;
        }
    }
}
module.exports = Pixel_Buffer_Core_Inner_Structures;
if (require.main === module) {
    const lg = console.log;
    (async() => {
        const run_examples = async() => {
            lg('Begin run examples');
            const examples = [
                async() => {
                    lg('Begin example 0');
                    const pb = new Pixel_Buffer_Core_Reference_Implementations({
                        bits_per_pixel: 1,
                        size: [8, 8]
                    });
                    const ta_pos = new Int16Array(2);
                    ta_pos[0] = 3;
                    ta_pos[1] = 3;
                    pb.set_pixel(ta_pos, 1);
                    lg('End example 0');
                    return pb;
                }
            ]
            const l = examples.length;
            for (var c = 0; c < l; c++) {
                const res_eg = await examples[c]();
                console.log('res_eg ' + c + ':', res_eg);
            };
            lg('End run examples');
        }
        await run_examples();
    })();
}
