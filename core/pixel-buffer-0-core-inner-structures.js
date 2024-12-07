
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
let ta_math = require('./ta-math')
let {resize_ta_colorspace, copy_rect_to_same_size_8bipp, copy_rect_to_same_size_24bipp, dest_aligned_copy_rect_1to4bypp} = ta_math;

// Core structures first?

// inner core



class Pixel_Buffer_Core_Inner_Structures {
    constructor(spec) {
        if (spec instanceof Pixel_Buffer_Core_Inner_Structures) {
            spec = {
                bits_per_pixel: spec.bits_per_pixel,
                size: spec.size,
                ta: spec.ta
            }
        }
        if (spec.window_to) {
            spec.bits_per_pixel = spec.window_to.bits_per_pixel;
        }
        const pos = new Int16Array(2);
        const size = new Int16Array(2);
        let ta; // flexible, can be redefined? Can still make read-only in userland.
        ro(this, 'ta', () => {
            return ta;
        });
        ro(this, 'buffer', () => {
            return ta;
        });
        const ta_bpp = new Uint8Array(2);
        ta_bpp[1] = 8; // byte to bit multiplier. will stay as 8.
        const _24bipp_to_8bipp = () => {
            const old_ta = ta;
            const new_ta = ta = new Uint8Array(this.num_px);
            const l_read = old_ta.length;
            let iby_read = 0, iby_write = 0;
            while (iby_read < l_read) {
                new_ta[iby_write++] = Math.round((old_ta[iby_read++] + old_ta[iby_read++] + old_ta[iby_read++]) / 3);
            }
        }
        const _change_bipp_inner_update = (old_bipp, new_bipp) => {
            if (old_bipp === 24) {
                if (new_bipp === 8) {
                    _24bipp_to_8bipp();
                } else {
                    console.trace();
                    throw 'NYI';
                }
            } else {
                console.trace();
                throw 'NYI';
            }
        }
        const def_bipp = {
            get() { return ta_bpp[0]; },
            set(value) { 
                console.log('value', value);
                const old_bipp = ta_bpp[0];
                ta_bpp[0] = value;
                _change_bipp_inner_update(old_bipp, ta_bpp[0]);
            },
            enumerable: true,
            configurable: false
        }
        Object.defineProperty(this, 'bits_per_pixel', def_bipp);
        Object.defineProperty(this, 'bipp', def_bipp);
        const def_bypp = {
            get() { return ta_bpp[0] / 8; },
            set(value) { 
                const old_bipp = ta_bpp[0];
                ta_bpp[0] = value * 8;
                _change_bipp_inner_update(old_bipp, ta_bpp[0]);
            },
            enumerable: true,
            configurable: false
        }
        Object.defineProperty(this, 'bytes_per_pixel', def_bypp);
        Object.defineProperty(this, 'bypp', def_bypp);
        const def_bypr = {
            get() {
                return size[0] * ta_bpp[0] / 8;
            }
        }
        Object.defineProperty(this, 'bytes_per_row', def_bypr);
        Object.defineProperty(this, 'bypr', def_bypr);
        Object.defineProperty(this, 'pos', {
            get() { return pos; },
            set(value) {
                if (value instanceof Int16Array) {
                    if (value.length === 2) {
                        pos[0] = value[0];
                        pos[1] = value[1];
                    }
                }
            },
            enumerable: true,
            configurable: false
        });
        const pos_bounds = new Int16Array(4);
        const pos_center = new Int16Array(2);
        const edge_offsets_from_center = new Int16Array(4);
        ro(this, 'pos_center', () => pos_center);
        ro(this, 'edge_offsets_from_center', () => edge_offsets_from_center);
        Object.defineProperty(this, 'pos_bounds', {
            get() {
                return pos_bounds; 
            },
            set(value) {
                const tv = tf(value);
                if (tv === 'a') {
                    if (value.length === 4) {
                        pos_bounds.set(value);
                    } else {
                        throw 'Expected Array with .length 4, value.length: ' + value.length;
                    }
                } else {
                    console.trace();
                    console.log('pos_bounds set tv', tv);
                    throw 'Expected Array';
                }
            },
            enumerable: true,
            configurable: false
        });
        const minus_pos = new Int16Array(2);
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
            set(value) {
                if (value instanceof Int16Array) {
                    if (value.length === 2) {
                        size[0] = value[0];
                        size[1] = value[1];
                    }
                } else {
                    console.trace();
                    throw 'NYI';
                }
            },
            enumerable: true,
            configurable: false
        });
        if (spec instanceof Pixel_Pos_List) {
            throw 'NYI - change to 1bipp';
            const ppl = spec;
            const bounds = ppl.bounds;
            const ppl_size = new Uint16Array(2);
            ppl_size[0] = bounds[2] - bounds[0];
            ppl_size[1] = bounds[3] - bounds[1];
            this.bits_per_pixel = 8;
            const bpp = this.bytes_per_pixel = 1;
            this.size = new Uint16Array([ppl_size[0] + 4, ppl_size[1] + 4]);
            this.pos = new Int16Array([bounds[0], bounds[1]]);
            const bpr = this.bytes_per_row = bpp * this.size[0];
            const buf = this.ta = this.buffer = new Uint8ClampedArray(this.size[0] * this.size[1]);
            const l = buf.length;
            for (var c = 0; c < l; c++) buf[c] = 255;
            ppl.each_pixel(pixel_pos => {
                buf[(bpr * (pixel_pos[1] - bounds[1])) + (pixel_pos[0] - bounds[0])] = 0;
            });
        } else {
            if (spec.buffer) {
                if (spec.buffer instanceof Buffer) {
                    ta = new Uint8ClampedArray(spec.buffer.buffer);
                } else {
                    ta = spec.buffer;
                }
            }
            if (spec.ta) {
                ta = spec.ta;
            }
            if (spec.size) {
                size[0] = spec.size[0];
                size[1] = spec.size[1];
            } else {
                throw 'Expected: size [x, y] property in the Pixel_Buffer_Core specification';
            }
            if (spec.bytes_per_pixel && !spec.bits_per_pixel) spec.bits_per_pixel = spec.bytes_per_pixel * 8;
            spec.bits_per_pixel = spec.bits_per_pixel || 32;
            if (spec.bits_per_pixel) {
                if (spec.bits_per_pixel != 1 && spec.bits_per_pixel != 8 && spec.bits_per_pixel != 24 && spec.bits_per_pixel != 32) {
                    console.log('spec.bits_per_pixel', spec.bits_per_pixel);
                    console.trace();
                    throw 'Invalid bits_per_pixel value of ' + spec.bits_per_pixel + ', must be 8, 24 or 32, default is 32.';
                } else {
                    // bits per row...


                    //   but there could be some kind of round to 64 bit row alignment for 1bipp.

                    


                    ta_bpp[0] = spec.bits_per_pixel;
                }
            }
            /*
            const bytes_per_pixel = this.bytes_per_pixel = this.bits_per_pixel / 8;
            this.bytes_per_row = bytes_per_pixel * this.size[0];
            */

            let auto_adjust_ta_length_to_multiple_of_8 = true;
            //    if it would be tiny anyway, don't.



            if (size && !this.buffer) {
                //ta = new Uint8ClampedArray(Math.ceil((ta_bpp[0] / 8) * this.size[0] * this.size[1]));

                this.bits_per_row = size[0] * this.bits_per_pixel;

                let proposed_ta_length = Math.ceil((ta_bpp[0] / 8) * (size[0] * size[1]));

                if (auto_adjust_ta_length_to_multiple_of_8) {
                    const r8 = proposed_ta_length % 8;
                    if (r8 > 0) {
                        proposed_ta_length += (8 - r8);
                    }
                }
                
                ta = new Uint8Array(proposed_ta_length);
            }
            if (spec.color) {
                this.color_whole(spec.color);
            }
        }
        ro(this, 'meta', () => {
            return {
                size: this.size,
                bits_per_pixel: this.bits_per_pixel,
                bytes_per_pixel: this.bytes_per_pixel,
                bytes_per_row: this.bytes_per_row
            }
        });
        if (spec.window_to || spec.source || spec.window_to_source) {
            pb_source = spec.window_to || spec.source || spec.window_to_source;
            const log_info = () => {
                console.log('Pixel_Buffer_Core (or subclass) needs to act as a window to another Pixel Buffer.')
                console.log('pb_source', pb_source);
                console.log('pb_source.size', pb_source.size);
                console.log('spec.pos', spec.pos);
                console.log('spec.pos_center', spec.pos_center);
                console.log('this.pos', this.pos);
                console.log('this.pos_my_center_within_source', this.pos_my_center_within_source);
                console.log('spec', spec);
            }
        }
        if (spec.pos_bounds) {
            this.pos_bounds = spec.pos_bounds;
        }
        this.move = ta_2d_vector => {
            pos[0] += ta_2d_vector[0];
            pos[1] += ta_2d_vector[1];
            if (this.source) {
                this.copy_from_source();
            }
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
            const source_size = this.source.size;
            if (pos[0] + size[0] < source_size[0]) {
                pos[0]++;
            } else {
                if (pos[1] + size[1] < source_size[1]) {
                    pos[0] = 0;
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
        
        /*
        ro(this, 'bytes_per_row', () => {
            return this.size[0] * this.bytes_per_pixel;
        });
        */
        this.tabrw = new Typed_Array_Binary_Read_Write(ta);
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
