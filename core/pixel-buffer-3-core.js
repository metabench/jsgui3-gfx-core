/*
    Maybe want an Image class that internally uses both Pixel_Buffer as well as X_Spans.
    Being able to handle multiple modes could be useful.
    Some modes will be more optimal for some operations.
    Drawing X_Spans will be sometimes a lot faster than drawing pixels.
    Then could get the output as a pixel buffer.
    Could keep one specific data structure up-to-date, and then when another representation is needed it renders the image into that
    data structure.
    May want to move some higher level algorithms upwards - ones that could work on top of either image type so long as there are
    lower level functions that do things like set_pixel.
    Could have optimised implementations for some things what work on those data structures.
    Static_X_Spans - Would be a good format to represent a shape. Maybe good format for saving to disk.
    Dynamic_X_Spans - Would be a good format for drawing a shape. Probably good for flood fills and other operations that modify the image.
        Dynamic_X_Spans seems more useful for the moment.
    Pixel_Buffer_Core could possibly use Dynamic_X_Spans when it does a draw_pollygon filled operation.
        The X_Spans idea came about as a way to do faster flood fills.
        A highly optimised Dynamic_X_Spans should be particularly useful for this.
            Flood fills will remove / join together some X Spans.
    Maybe Pixel_Buffer_Enh will use these Dynamic_X_Spans in order to do some things quicker (too)
    Polygon shape drawing seems core in terms of API, but somewhat higher level compared to some other features and algorithms.
    Possibly a Polygon that could draw itself to image data structures would work well.
*/
/*
    1 Small / trivial change
       2 mins going on 10 mins
    2  Small change
       5 mins going on 30 mins
    3  Medium-Small task
       15 mins going on 1.5h
       could be an easier version of a 4 - needs an optimized algorithm to be written and tested, it doesnt require further R&D.
    4
       45 mins going on 4.5(+)h
        as in could be an underestimated 5?
        may require thinking about maths & optimization
    5 Moderate - a few hours
        2 hours if it turns out to be relatively easy
        going on a day
    6
        0.5 days to 3 days
    7   (some level of overhaul or new API design involved)
        1.5 days to 1 week
    8  
        1 week to 3 weeks
    9 Programming / API overhaul
        3 weeks to 6 weeks
    10 Huge overhaul / major rewrite / a medium-large project of its own
        1 month to 3 months
*/
/*
const _roadmap = {
    '0.0.22': [
        ['pb.bypp = 1 convert to greyscale', 'done', 3, 'Medium small task requiring writing of optimized algorithm']
    ],
    '0.0.23': [
        'Convolutions', 
        `
        Task Size and Complexity Measure: 5 changed to 6.5
            Going into a larger properties overhaul - new size 6 or 7
        Rethinking and implementing pos_bounds
            pos_within_source_bounds
        Rename pos
            pos_within_source
            In this case, can't assume all positions are relative to the self pb, so need to be extra explicit in the variable names regarding what they relate to.
        Consider other pos type variables. Explicit names for what they do.
            pos_iteration_within_self
            pos_cursor_within_self
        Better to have more API-based centering, and adjust the central position?
            Possibly not best for convolution, for perf reasons.
            Don't want more calculations done during iteration...?
            Maybe don't need to deal with centering as directly right now?
                Seems useful for convolutions, centering the window of the px is a core part of the convolution logic. Worth having the platform support it as easily as possible.
        new_window
            implemented
        new_centered_window() ???
            NOT doing this for the moment. done new_window
            centered on 0,0.
            center of that window corresponds to a pixel in this window.
            bounds determined...
                does make sense for the moment.
                implement this fn, makes sense for convs right now.
            get_conv_window?
        new_convolved(convolution) - using this.
        `
        ['window view into specific channel?'],
        ['run convolution on 8bipp image?', 'maybe', 'not yet'],
        ['Convolution Class', ],
        ['Bug fix move_next_px, need to use boundary ranges for proper movement of the window within a source', 4, [
            ['cancelled - doing pb.pos_bounds', 'pb.window_movement_bounds', `
                Need to make / finish function
                Considering different types of bounds
            `],
            ['pos_bounds', `
                consider iterate_pos_within_bounds
                just each_pos_px?
                As well as positions, need to properly calculate iteration values and indexes.
                Put these into a typed array, access them through use of a function
            `]
        ]]
    ],
    '0.0.24': [
        'Moving of mathematical code to ta_math where possible and suitable.',
        'Current size: >6000 lines. Can it be brought down to 1000? Still kept v performant?',
        ['new_resized', 'clearly creates a new pb']
    ],
    '0.0.25': [
        'Improvements / optimization to resize',
        'Facilitate usage of C++ acceleration.'
    ]
}
*/
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
const Pixel_Buffer_Painter = require('./pixel-buffer-painter');
let ta_math = require('./ta-math')
let {resize_ta_colorspace, copy_rect_to_same_size_8bipp, copy_rect_to_same_size_24bipp, dest_aligned_copy_rect_1to4bypp} = ta_math;

const Pixel_Buffer_Core_Reference_Implementations = require('./pixel-buffer-2-core-reference-implementations');

class Pixel_Buffer_Core extends Pixel_Buffer_Core_Reference_Implementations {
    constructor(spec) {
        super(spec);
        const pos = new Int16Array(2);
        const size = new Int16Array(2);
        
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
            
        }
        
    }
    new_convolved(convolution) {
        const res = this.blank_copy();
        const xy_conv_center = convolution.xy_center;
        const edge_distances_from_center_px_edge = new Int16Array(4);
        edge_distances_from_center_px_edge[0] = xy_conv_center[0] * -1;
        edge_distances_from_center_px_edge[1] = xy_conv_center[1] * -1;
        edge_distances_from_center_px_edge[2] = edge_distances_from_center_px_edge[0] + convolution.size[0] - 1;
        edge_distances_from_center_px_edge[3] = edge_distances_from_center_px_edge[1] + convolution.size[1] - 1;
        const pb_window = this.new_window({
            size: convolution.size,
            pos_bounds: [edge_distances_from_center_px_edge[0], edge_distances_from_center_px_edge[1], this.size[0] - edge_distances_from_center_px_edge[2], this.size[1] - edge_distances_from_center_px_edge[3]],
            pos: [edge_distances_from_center_px_edge[0], edge_distances_from_center_px_edge[1]]
        });
        const pos_window = pb_window.pos;
        const ta_window = pb_window.ta;
        /*
        const pb_conv_res = new Pixel_Buffer({
            size: pb_8bipp_patch.size,
            bits_per_pixel: 24
        });
        */
        let i_write = 0;
        const ta_conv_res = res.ta;
        pb_window.each_pos_within_bounds(() => {
            const rgb = convolution.calc_from_24bipp_ta(ta_window);
            ta_conv_res[i_write++] = rgb[0];
            ta_conv_res[i_write++] = rgb[1];
            ta_conv_res[i_write++] = rgb[2];
        });
        return res;
    }
    new_resized(size) {
        const dest = new this.constructor({
            size: size,
            bits_per_pixel: this.bipp
        });
        resize_ta_colorspace(this.ta, this.ta_colorspace, dest.size, dest.ta);
        return dest;
    }
    copy_rect_by_bounds_to(ta_bounds, pb_target) {
        console.log('pb.copy_rect_by_bounds_to');
        const bipp = this.bipp;
        if (bipp === 24) {
            return this.copy_rect_by_bounds_to_24bipp(ta_bounds, pb_target)
        } else {
            console.trace();
            throw 'NYI';
        }
    }
    each_px_convolution(ta_size, pb_conv_window, ta_pos, callback) {
        console.trace();
        throw 'NYI';
        ta_pos[0] = 0;
        ta_pos[1] = 0;
        if (are_equal(pb_conv_window.size, ta_size)) {
        } else {
        }
    }
    get_1bipp_threshold_8bipp(ui8_threshold) {
        const bipp = this.bits_per_pixel;
        if (bipp === 8) {
            const res = new this.constructor({
                bits_per_pixel: 1,
                size: this.size
            });
            const rta = res.ta;
            const ta = this.ta;
            const cpx = this.num_px;
            let i_px = 0;
            let i_dest_byte = 0, i_dest_bit = 7;
            let meets_threshold = false;
            let out_byte = 0;
            while (i_px < cpx) {
                meets_threshold = ta[i_px] >= ui8_threshold;
                if (meets_threshold) {
                    out_byte = out_byte | Math.pow(2, i_dest_bit)
                } else {
                }
                i_px++;
                i_dest_bit--;
                if (i_dest_bit === -1) {
                    rta[i_dest_byte] = out_byte;
                    i_dest_bit = 7;
                    i_dest_byte++;
                    out_byte = 0;
                }
            }
            return res;
        } else {
            console.trace();
            throw 'get_1bipp_threshold_8bipp: Unsupported bits_per_pixel ' + bipp;
        }
    }
    to_8bipp() {
        const bipp = this.bits_per_pixel;
        if (bipp === 1) {
            const res = new this.constructor({
                size: this.size,
                bits_per_pixel: 8
            })
            let i_px = 0;
            let i_byte = 0;
            const num_bytes = this.ta.length;
            while (i_byte < num_bytes) {
                for (var b = 0; b < 8; b++) {
                    const color = this.get_pixel_by_idx_1bipp(i_px) === 1 ? 255 : 0;
                    res.set_pixel_by_idx_8bipp(i_px++, color);
                }
                i_byte++;
            }
            return res;
        } else if (bipp === 8) {
            return this.clone();
        } else if (bipp === 24) {
            console.trace();
            throw 'NYI';
        } else if (bipp === 32) {
            console.trace();
            throw 'NYI';
        }
    }
    to_24bipp() {
        const bipp = this.bits_per_pixel;
        const bypp = this.bytes_per_pixel;
        let i_px = 0;
        const num_px = this.size[0] * this.size[1];
        if (bipp === 1) {
            const res = new this.constructor({
                size: this.size,
                bits_per_pixel: 24
            })
            let i_byte = 0;
            const num_bytes = this.ta.length;
            while (i_byte < num_bytes) {
                for (var b = 0; b < 8; b++) {
                    const color = this.get_pixel_by_idx_1bipp(i_px) === 1 ? new Uint8ClampedArray([255, 255, 255]) : new Uint8ClampedArray([0, 0, 0]);
                    res.set_pixel_by_idx_24bipp(i_px++, color);
                }
                i_byte++;
            }
            return res;
        } else if (bipp === 8) {
            const res = new this.constructor({
                size: this.size,
                bits_per_pixel: 24
            });
            const ta_res = res.ta;
            const ta = this.ta, l = ta.length;
            let pos_w = 0, c = 0;
            for (c = 0; c < l; c++) {
                ta_res[pos_w++] = ta[c];
                ta_res[pos_w++] = ta[c];
                ta_res[pos_w++] = ta[c];
            }
            return res;
        } else if (bipp === 24) {
            return this.clone();
        } else if (bipp === 32) {
            const res = new this.constructor({
                size: this.size,
                bits_per_pixel: 24
            })
            console.trace();
            throw 'NYI';
            while (i_px < num_px) {
                const col_32 = this.get_pixel_by_idx_32bipp(i_px)
                i_px += bypp;
            }
            return res;
        }
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
    color_whole(color) {
        if (this.bytes_per_pixel === 1) {
            const ta_32_scratch = new Uint32Array(12);
            ta_32_scratch[0] = this.size[0] * this.size[1];
            const buf = this.buffer;
            let i;
            for (i = 0; i < ta_32_scratch[0]; i++) {
                buf[i] = color;
            }
        } else if (this.bytes_per_pixel === 3) {
            const ta_32_scratch = new Uint32Array(12);
            ta_32_scratch[0] = this.size[0] * this.size[1] * 3;
            const buf = this.buffer;
            let i, c = 0;
            for (i = 0; i < ta_32_scratch[0]; i++) {
                buf[c++] = color[0];
                buf[c++] = color[1];
                buf[c++] = color[2];
            }
        } else if (this.bytes_per_pixel === 4) {
            const ta_32_scratch = new Uint32Array(12);
            ta_32_scratch[0] = this.size[0] * this.size[1] * 4;
            const buf = this.buffer;
            let i, c = 0;
            for (i = 0; i < ta_32_scratch[0]; i++) {
                buf[c++] = color[0];
                buf[c++] = color[1];
                buf[c++] = color[2];
                buf[c++] = color[3];
            }
        } else {
            throw 'Unsupported this.bytes_per_pixel: ' + this.bytes_per_pixel;
        }
        return this;
    }
    crop(size) {
        let new_size = new Uint16Array([this.size[0] - size * 2, this.size[1] - size * 2]);
        let res = new this.constructor({
            bytes_per_pixel: this.bytes_per_pixel,
            size: new_size
        });
        if (this.pos) {
            res.pos = new Int16Array([this.pos[0] - size, this.pos[1] - size])
        }
        this.each_pixel_ta((pos, color) => {
            const new_pos = new Int16Array([pos[0] - size, pos[1] - size]);
            if (new_pos[0] >= 0 && new_pos[0] < new_size[0] && new_pos[1] >= 0 && new_pos[1] < new_size[1]) {
                res.set_pixel_ta(new_pos, color);
            }
        });
        return res;
    }
    uncrop(size, color) {
        let res = new this.constructor({
            bytes_per_pixel: this.bytes_per_pixel,
            size: new Uint16Array([this.size[0] + size * 2, this.size[1] + size * 2])
        })
        if (this.pos) res.pos = this.pos;
        if (this.pos) {
        }
        res.color_whole(color);
        console.log('size', size);
        this.each_pixel_ta((pos, color) => {
            res.set_pixel_ta(new Uint16Array([pos[0] + size, pos[1] + size]), color);
        })
        return res;
    }
    color_rect(bounds, color) {
        console.trace();
        throw 'NYI';
    }
    each_pixel_byte_index(cb) {
        const {bipp} = this;
        let ctu = true;
        const stop = () => ctu = false;
        if (bipp === 8) {
            const buf = this.buffer, l = buf.length, bpp = this.bytes_per_pixel;
            for (let c = 0; ctu && c < l; c += bpp) {
                cb(c, stop);
            }
        } else if (bipp === 24) {
            const buf = this.buffer, l = buf.length, bpp = this.bytes_per_pixel;
            for (let c = 0; ctu && c < l; c += bpp) {
                cb(c, stop);
            }
        } else if (bipp === 32) {
            const buf = this.buffer, l = buf.length, bpp = this.bytes_per_pixel;
            for (let c = 0; ctu && c < l; c += bpp) {
                cb(c, stop);
            }
        } else {
            console.trace();
            throw 'NYI';
        }
    }
    /*
    each_pixel_pos(cb) {
        const b = this.size;
        const pos = new Int16Array(2);
        for (pos[1] = 0; pos[1] < b[1]; pos[1]++) {
            for (pos[0] = 0; pos[0] < b[0]; pos[0]++) {
                cb(pos);
            }
        }
    }
    */
    each_ta_24bipp(ta_pos, ta_px_value, ta_info, callback) {
        const bipp = this.bipp;
        if (bipp === 24) {
            if (ta_pos instanceof Int16Array || ta_pos instanceof Int32Array && ta_pos.length >= 2) {
                if (ta_px_value instanceof Uint8ClampedArray && ta_px_value.length >= 3) {
                    if (ta_info instanceof Uint32Array && ta_info.length >= 4) {
                        const ta = this.ta;
                        ta_info[0] = this.size[0];
                        ta_info[1] = this.size[1];
                        ta_info[2] = 0;
                        ta_info[3] = 24; // bipp;
                        const update = () => {
                            ta[ta_info[2] * 3] = ta_px_value[0];
                            ta[ta_info[2] * 3 + 1] = ta_px_value[1];
                            ta[ta_info[2] * 3 + 2] = ta_px_value[2];
                        }
                        for (ta_pos[1] = 0; ta_pos[1] < ta_info[1]; ta_pos[1]++) {
                            for (ta_pos[0] = 0; ta_pos[0] < ta_info[0]; ta_pos[0]++) {
                                ta_px_value[0] = ta[ta_info[2] * 3];
                                ta_px_value[1] = ta[ta_info[2] * 3 + 1];
                                ta_px_value[2] = ta[ta_info[2] * 3 + 2];
                                callback(update);
                                ta_info[2]++;
                            }
                        }
                    }
                }
            }
        } else {
            throw 'each_ta_24bipp error: bipp must be 24, bipp: ' + bipp;
        }
    }
    each_ta_1bipp(ta_pos, ta_px_value, ta_info, callback) {
        const bipp = this.bipp;
        if (bipp === 1) {
            const [w, h] = this.size;
            for (ta_pos[1] = 0; ta_pos[1] < h; ta_pos[1]++) {
                for (ta_pos[0] = 0; ta_pos[0] < w; ta_pos[0]++) {
                    const px = this.get_pixel_1bipp(ta_pos);
                    ta_px_value[0] = px;
                    callback(px, ta_pos);
                }
            }
        } else {
            throw 'each_ta_1bipp error: bipp must be 1, bipp: ' + bipp;
        }
    }
    each_px_on_1bipp(ta_pos, ta_px_value, ta_info, callback) {
        const bipp = this.bipp;
        if (bipp === 1) {
            const [w, h] = this.size;
            for (ta_pos[1] = 0; ta_pos[1] < h; ta_pos[1]++) {
                for (ta_pos[0] = 0; ta_pos[0] < w; ta_pos[0]++) {
                    if (this.get_pixel_1bipp(ta_pos) === 1 | 0) {
                        callback(1 | 0, ta_pos);
                    }
                }
            }
        } else {
            throw 'each_ta_1bipp error: bipp must be 1, bipp: ' + bipp;
        }
    }
    each_px(ta_pos, ta_px_value, ta_info, callback) {
        const bipp = this.bipp;
        if (bipp === 1) {
            return this.each_ta_1bipp(ta_pos, ta_px_value, ta_info, callback);
        } else if (bipp === 8) {
            return this.each_ta_8bipp(ta_pos, ta_px_value, ta_info, callback);
        } else if (bipp === 24) {
            return this.each_ta_24bipp(ta_pos, ta_px_value, ta_info, callback);
        } else if (bipp === 32) {
            return this.each_ta_32bipp(ta_pos, ta_px_value, ta_info, callback);
        } else {
            console.trace();
            throw 'Unsupported bipp: ' + bipp;
        }
    }
    paint_pixel_list(pixel_pos_list, color) {
        pixel_pos_list.each_pixel(pos => {
            this.set_pixel_ta(pos, color);
        });
    }
    'get_pixel_byte_bit_1bipp'(pos) {
        /*
        */
        const idx = pos[1] * this.size[0] + pos[0];
        const byte = idx >> 3;
        const bit = (idx & 0b111);
        return {byte, bit};
    }
    'get_pixel_byte_bit_BE_1bipp'(pos) {
        const idx = pos[1] * this.size[0] + pos[0];
        const byte = idx >> 3;
        const bit = (idx & 0b111);
        return {byte, bit};
    }
    set_pixel_on_1bipp_by_pixel_index(pixel_index) {
        this.ta[pixel_index >> 3] |= (128 >> (pixel_index & 0b111));
    }

    'set_pixel_on_1bipp_xy'(x, y) {
        const pixel_index = y * this.size[0] + x;
        this.ta[pixel_index >> 3] |= (128 >> (pixel_index & 0b111));
    }

    'set_pixel_on_1bipp'(pos) {
        const pixel_index = pos[1] * this.size[0] + pos[0];
        this.ta[pixel_index >> 3] |= (128 >> (pixel_index & 0b111));
    }
    set_pixel_off_1bipp_by_pixel_index(pixel_index) {
        this.ta[pixel_index >> 3] &= (~(128 >> (pixel_index & 0b111))) & 255;
    }
    'set_pixel_off_1bipp'(pos) {
        const pixel_idx = pos[1] * this.size[0] + pos[0];
        this.ta[pixel_idx >> 3] &= (~(128 >> (pixel_idx & 0b111))) & 255;
    }
    'set_pixel_1bipp'(pos, color) {
        const idx_bit = (pos[1] * this.size[0]) + pos[0];
        const byte = idx_bit >> 3;
        const bit = (idx_bit & 0b111);
        if (color === 1) {
            this.ta[byte] |= (128 >> bit);
        } else {
            this.ta[byte] &= (~(128 >> bit)) & 255;
        }
    }
    'set_pixel_8bipp'(pos, color) {
        const idx = pos[1] * this.size[0] + pos[0];
        this.ta[idx] = color;
    }
    'set_pixel_24bipp'(pos, color) {
        const idx = pos[1] * this.size[0] + pos[0];
        let byte = idx * 3;
        this.ta[byte++] = color[0];
        this.ta[byte++] = color[1];
        this.ta[byte] = color[2];
    }
    'set_pixel_32bipp'(pos, color) {
        const idx = pos[1] * this.size[0] + pos[0];
        let byte = idx * 4;
        this.ta[byte++] = color[0];
        this.ta[byte++] = color[1];
        this.ta[byte++] = color[2];
        this.ta[byte] = color[3];
    }
    'set_pixel_by_idx_8bipp'(idx, color) {
        const byte = idx;
        this.ta[byte] = color;
    }
    'set_pixel_by_idx_24bipp'(idx, color) {
        const byte = idx * 3;
        this.ta[byte] = color[0];
        this.ta[byte + 1] = color[1];
        this.ta[byte + 2] = color[2];
    }
    'set_pixel_by_idx_32bipp'(idx, color) {
        const byte = idx * 4;
        this.ta[byte] = color[0];
        this.ta[byte + 1] = color[1];
        this.ta[byte + 2] = color[2];
        this.ta[byte + 3] = color[3];
    }
    'set_pixel_by_idx'(idx, color) {
        const a = arguments;
        const l = a.length;
        const bipp = this.bipp;
        if (bipp === 1) {
            return this.set_pixel_by_idx_1bipp(a[0], a[1]);
        } else if (bipp === 8) {
            if (l === 2) {
                return(this.set_pixel_by_idx_8bipp(a[0], a[1]));
            }
        } else if (bipp === 24) {
            if (l === 2) {
                return(this.set_pixel_by_idx_24bipp(a[0], a[1]));
            }
        } else if (bipp === 32) {
            if (l === 2) {
                return(this.set_pixel_by_idx_32bipp(a[0], a[1]));
            }
        }
    }
    'set_pixel'(pos, color) {
        const a = arguments;
        const l = a.length;
        const bipp = this.bipp;
        if (bipp === 1) {
            return(this.set_pixel_1bipp(a[0], a[1]));
        } else if (bipp === 8) {
            if (l === 2) {
                return(this.set_pixel_8bipp(a[0], a[1]));
            }
        } else if (bipp === 24) {
            if (l === 2) {
                return(this.set_pixel_24bipp(a[0], a[1]));
            }
        } else if (bipp === 32) {
            if (l === 2) {
                return(this.set_pixel_32bipp(a[0], a[1]));
            }
        } else {
            console.trace();
            throw 'unsupported bipp: ' + bipp;
        }
    }
    'get_pixel_by_idx_1bipp'(idx) {
        /*
        const idx = pos[1] * this.size[0] + pos[0];
        const byte = idx >> 3;
        const bit = (idx & 0b111);
        */
        const byte = idx >> 3;
        const bit = (idx & 0b111);
        const pow = 128 >> bit;
        return ((this.ta[byte] & pow) === pow) ? 1 : 0;
    }
    'get_pixel_by_idx_8bipp'(idx) {
        const byte = idx;
        return this.ta[byte];
    }
    'get_pixel_by_idx_24bipp'(idx) {
        const byte = idx * 3;
        return this.ta.slice(byte, byte + 3);
    }
    'get_pixel_by_idx_32bipp'(idx) {
        const byte = idx * 4;
        return this.ta.slice(byte, byte + 4);
    }
    'get_pixel_by_idx'(idx) {
        const bipp = this.bits_per_pixel;
        if (bipp === 1) {
            return this.get_pixel_by_idx_1bipp(idx);
        } else if (bipp === 8) {
            return this.get_pixel_by_idx_8bipp(idx);
        } else if (bipp === 24) {
            return this.get_pixel_by_idx_24bipp(idx);
        } else if (bipp === 32) {
            return this.get_pixel_by_idx_32bipp(idx);
        } else {
            throw 'Unsupported bipp'
        }
    }
    'get_pixel_1bipp'(pos) {
        const idx = (pos[1] * this.size[0]) + pos[0];
        const byte = idx >> 3;
        return ((this.ta[byte] & 128 >> (idx & 0b111)) !== 0) ? 1 : 0;
    }
    'get_pixel_8bipp'(pos) {
        const idx = pos[1] * this.size[0] + pos[0];
        const byte = idx;
        return this.ta[byte];
    }
    'get_pixel_24bipp'(pos) {
        const idx = pos[1] * this.size[0] + pos[0];
        const byte = idx * 3;
        return this.ta.slice(byte, byte + 3);
    }
    'get_pixel_32bipp'(pos) {
        const idx = pos[1] * this.size[0] + pos[0];
        const byte = idx * 4;
        return this.ta.slice(byte, byte + 4);
    }
    'get_pixel'(pos) {
        const bipp = this.bits_per_pixel;
        if (bipp === 1) {
            return this.get_pixel_1bipp(pos);
        } else if (bipp === 8) {
            return this.get_pixel_8bipp(pos);
        } else if (bipp === 24) {
            return this.get_pixel_24bipp(pos);
        } else if (bipp === 32) {
            return this.get_pixel_32bipp(pos);
        } else {
            console.trace();
            throw 'bits per pixels error';
        }
    }
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


    // Pixel_Buffer_Pair_Complex_Operation class possibly?
    //   Or just Operation.



    // get_pre_operation_alignment_info ....


    
    // And could define such a class which has got requirements / invarients to do with 



    // This is used when drawing filled polygons.

    'draw_1bipp_pixel_buffer_mask_1bipp'(pb_1bipp_mask, dest_pos, color) {





        const arr_on_xspans_implementation = () => {

            // Getting it as an arr_rows_arr_x_on_spans representation using a class could help.
            //   Or the 'other representaion' type class.

            // May be able to have a faster internal algorithm for that.
            //   Maybe a typed array backed class? Maybe a typed array.

            const arr_rows_arr_on_xspans = pb_1bipp_mask.calculate_arr_rows_arr_x_on_spans_1bipp();
            const [width, height] = pb_1bipp_mask.size;

            const [dest_x, dest_y] = dest_pos;

            /*
            for (const row of arr_rows_arr_on_xspans) {

                for (const xonspan of row) {
                    xonspan[0] += dest_x;
                    xonspan[1] += dest_x;
                }
                
                //this.draw_horizontal_line_on_1bipp_inclusive(xonspan, y + dest_y);
            }
                */
            
            // Not sure the spans are inclusive...

            if (color === 1) {
                //let y = 0;
                //let [dest_x, dest_y] = dest_pos;
                for (let y = 0; y < height; y++) {
                    //const arr_row_xspans_on = arr_rows_arr_on_xspans[y];
                    const target_y = y + dest_y;
                    //if (arr_row_xspans_on.length > 0) {
                    for (const xonspan of arr_rows_arr_on_xspans[y]) {
                        xonspan[0] += dest_x;
                        xonspan[1] += dest_x;
                        this.draw_horizontal_line_on_1bipp_inclusive(xonspan, target_y);
                    }
                    //}
                }
            } else {
                //let y = 0;
                
                for (let y = 0; y < height; y++) {
                    //const arr_row_xspans_on = arr_rows_arr_on_xspans[y];
                    const target_y = y + dest_y;
                    //if (arr_row_xspans_on.length > 0) {
                    for (const xonspan of arr_rows_arr_on_xspans[y]) {
                        xonspan[0] += dest_x;
                        xonspan[1] += dest_x;
                        this.draw_horizontal_line_off_1bipp_inclusive(xonspan, target_y);
                    }
                    //}
                }
            }

            // Get it as an other representation of a 1 bipp image
            
        }

        // Possibly a faster way to do it?



        // realigned 64 bit???

        //  does the mask not fit in 64 bit alignment?
        //  does the dest?
        //  does the position within the dest?
        //    if so, can realign / move the pixels in the source.
        //    seems best to do things simply with the typed arrays where possible.

        // or copy the aligned part fast then cover the other part.

        // The limited case fast aligned copy right now is fairly good.





        /*

        const aligned_64_bit_implementation = () => {

            const pb_source = pb_1bipp_mask;
            const pb_dest = this;

            const dest_start_pxi = dest_pos[1] * pb_dest.size[0] + dest_pos[0];
            //   So, need to work out how many pixels it is off from being divisible by 8.
            //     No, that is 0 in this case.
            //   Work out how many pixels it's off from being divisible by 64.
            //     And that typed array wouln't be able to cover the very end either ????




            //  And the end pxi too???? Will there be enough space in the typed array to make that typed array???







            // get both the source and dest taui64

            const sta64 = new BigUint64Array(pb_source.ta.buffer, pb_source.ta.byteOffset);
            const dta64 = new BigUint64Array(pb_dest.ta.buffer, pb_dest.ta.byteOffset);

            // Then the start position of where it will be written...

            const write_start_pos = dest_start_pxi >>> 6;
            //const bpr_diff = 




            const write_pos_line_jump = ((pb_dest.size[0] - pb_source.size[0]) >>> 6) - 2;

            //   number of 64 bit values per row - number of 64 bit values in source pb row


            // Just a slightly tricky calculation????

            //const dest_l




            //const write_pos_line_jump = pb_dest.size[0] - 

            // So, write it line by line....
            //   reading each line too....

            let w_pos = write_start_pos, r_pos = 0;

            const [w, h] = pb_source.size;

            // 

            // And then the remaining number of 64 byte pieces from the end of the dest draw line to its beginning on the next line.


            // and an x loop that loops through the 8 byte pieces...

            const num_64bit_values_per_row = w >>> 6;

            //console.log('num_64bit_values_per_row', num_64bit_values_per_row);
            //console.log('w', w);

            //console.trace();
            //throw 'stop';


            if (color === 1) {
                for (let y = 0; y < h; y++) {
                    for (let x64 = 0; x64 < num_64bit_values_per_row; x64++) {

                        // drawing it as a mask, so if it's in color 1, then it will be doing 'or'.

                        //console.log('dta64[w_pos]', dta64[w_pos]);
                        //console.log('sta64[r_pos]', sta64[r_pos]);

                        //console.log('r_pos', r_pos);
                        //console.log('w_pos', w_pos);
                        //console.log('y', y);
                        //console.log('x64', x64);
                        //console.log('pb_source.size', pb_source.size);

                        //console.log('sta64.length', sta64.length);

                        //dta64[w_pos] = dta64[w_pos] | (sta64[r_pos++]);

                        dta64[w_pos] |= (sta64[r_pos++]);
                        
                        w_pos++;
                    }
                    //w_pos--;
                    //w_pos += write_pos_line_jump;
                }
            } else {
                for (let y = 0; y < h; y++) {
                    for (let x64 = 0; x64 < num_64bit_values_per_row; x64++) {

                        // drawing it as a mask, so if it's in color 1, then it will be doing 'or'.

                        //console.log('dta64[w_pos]', dta64[w_pos]);
                        //console.log('sta64[r_pos]', sta64[r_pos]);

                        //console.log('r_pos', r_pos);
                        //console.log('w_pos', w_pos);
                        //console.log('y', y);
                        //console.log('x64', x64);
                        //console.log('pb_source.size', pb_source.size);

                        //console.log('sta64.length', sta64.length);

                        dta64[w_pos] = dta64[w_pos] & (~(sta64[r_pos++]));
                        
                        w_pos++;


                    }
                    //w_pos--;
                    w_pos += write_pos_line_jump;
                }
            }
        }

        */

        // realigned reads system will work and be more versitile.

        //   still would requite dest 64 bit alignment????
        //     or do a more logical way and go row by row through it, doing whatever 8 byte operations are suitable.

        // but can't draw outside of the bounds of the thing itself.


        // but with realigned reads, want it to be similar.
        //   but maybe we actually do need to copy the aligned parts where possible, so do the fastest 64 bit operations in the places that they cover.

        //   could do the OR operation on the parts of it that are outside the bounds, keeping / putting back in place the things that are already there.


        // Getting a really good optimisation for pixel drawing should help quite a lot.







        



        




        const bit_realigned_64_bit_implementation = () => {

            const pb_source = pb_1bipp_mask;
            const pb_dest = this;


            const size_source = pb_source.size;
            //  And each row width should be / is divisible by 64.
            const w_source = size_source[0];
            const h_source = size_source[1];


            const size_dest = pb_dest.size;
            //  And each row width should be / is divisible by 64.
            const w_dest = size_dest[0];
            //const h_dest = size_dest[1];

            //const ta_source = pb_source.ta;
            //const ta_dest = pb_dest.ta;

            const iterate_dest_shift_reads = () => {

                //console.log('');

                // Maybe best to find the full range.
                //   Or the range for the rows?
                //   No, get it fully precise.

                
                // Dest start pxi
                // Dest end pxi

                // Pxi of the start of the first row (won't be selected if ourside of draw range)
                // Pxi of the end of the last row    (won't be selected if ourside of draw range)

                // Better to get a smaller writing range....
                //   Though 


                const dest_start_pxi = (dest_pos[1] * pb_dest.size[0]) + dest_pos[0];


                const dest_start_row_end_pxi = dest_start_pxi + pb_source.size[0];

                //const dest_end_pxi = dest_start_row_end_pxi + (pb_source.size[1] * pb_dest.size[0]);

                //const dest_end_pxi = (dest_pos[1] + pb_source.size[1]) * pb_dest.size[0] + dest_pos[0] + pb_source.size[0];


                // How long is that range?

                //const num_px_in_dest_draw_range = dest_end_pxi - dest_start_pxi;


                //console.log('num_px_in_dest_draw_range', num_px_in_dest_draw_range);
                // Needs to be divisible by 64???

                //console.log('num_px_in_dest_draw_range % 64', num_px_in_dest_draw_range % 64);
                //   Probably does need be be divisible by 64, at least for now.


                // And how many px (bits) is the draw range from the start of each row?


                const num_px_from_dest_row_start_to_draw_box_start = dest_pos[0];
                // num px to row end from shape end...

                const num_px_from_draw_box_end_to_dest_row_end = pb_dest.size[0] - pb_source.size[0] - num_px_from_dest_row_start_to_draw_box_start;
                

                //console.log('num_px_from_dest_row_start_to_draw_box_start', num_px_from_dest_row_start_to_draw_box_start);
                //console.log('num_px_from_draw_box_end_to_dest_row_end', num_px_from_draw_box_end_to_dest_row_end);


                const num_px_line_jump = num_px_from_draw_box_end_to_dest_row_end + dest_pos[0];

                const num_ui64_line_jump = (num_px_line_jump >>> 6) - 1; // This part looks right at least.



                // Then how many full bytes?
                // How many full 64 bit chunks?


                // Anyway, iterate these 64 bit values, within, or not fully within, the draw range.
                //   Will have some overlaps, need to be careful about handling that correctly.

                // so, need the 64 bit index.

                // i64 could make sense - index within 64 bit space.

                const dest_start_i64 = dest_start_pxi >>> 6;
                const dest_start_i64_rb = dest_start_pxi % 64;

                //console.log('dest_start_i64', dest_start_i64);
                //console.log('dest_start_i64_rb', dest_start_i64_rb);


                const dest_start_row_end_i64 = dest_start_row_end_pxi >>> 6;
                //const dest_start_row_end_i64_rb = dest_start_row_end_pxi % 64;

                //console.log('dest_start_row_end_i64', dest_start_row_end_i64);
                //console.log('dest_start_row_end_i64_rb', dest_start_row_end_i64_rb);


                // dest_start_row_end_i64_rb px into the last one.
                //  so it will be an inclusive number of them.

                const num_64_bit_at_least_partial_parts_per_row = (dest_start_row_end_i64 - dest_start_i64) + 1;
                //console.log('num_64_bit_at_least_partial_parts_per_row', num_64_bit_at_least_partial_parts_per_row);
                // number of pixels to offset to the left????
                //   or really, it's 32 pixels in.....
                // do the 0th one...
                // Maybe best to read the dest to a local variable, keep it rather than read it twice from the ta.
                // dest_start_row_end_pxi
                // dest start row end....
                
                // And the end of the first line....

                // 

                // And the number of 64 bit chunks to write...
                //   How much of each one will be written to?


                // And the remainder at the end too....


                // So best to go through each row????
                // Maybe iterating the 'y' coordinates of the dest space that will be drawn to.
                //    Does make most sense really....

                let i64_dest = dest_start_i64;

                let i64_source = 0;

                const y_top = dest_pos[1], y_bottom = y_top + h_source;
                const sta64 = new BigUint64Array(pb_source.ta.buffer, pb_source.ta.byteOffset, pb_source.ta.byteLength / 8);
                //const dta64 = new BigUint64Array(pb_dest.ta.buffer, pb_dest.ta.byteOffset + byte_start); // To the end I think???

                const dta64 = new BigUint64Array(pb_dest.ta.buffer, pb_dest.ta.byteOffset, pb_dest.ta.byteLength / 8); // To the end I think???
                const bi_dest_start_i64_rb = BigInt(dest_start_i64_rb);
                //  and then 64 minus that
                // so how many bits to shift the right part to the right????
                const bi_right_right_shift_bits = 64n - bi_dest_start_i64_rb;
                const dest_row_middle_ui64_count = num_64_bit_at_least_partial_parts_per_row - 2;

                for (let y = y_top; y < y_bottom; y++) {
                    const process_0th_64bit_part = () => {
                        // Maybe could even do it using bytes????
                        //   Though doing it in one operation really will be best.
                        // So, need to read from the beginning of the dest row....
                        //console.log('dest_row_starting_ui64', dest_row_starting_ui64);
                        //console.log('dest_row_starting_ui64_but_only_with_the_original_left_part_there', dest_row_starting_ui64_but_only_with_the_original_left_part_there);

                        // Then add in the part from the destination....
                        //   But the left part needs to be moved to the right.
                        //const source_row_starting_ui64_but_left_part_is_shifted_right = (sta64[i64_source] >> bi_dest_start_i64_rb) >> 32n;

                        // Hmmmm not so sure on endianness here - is that messing things up.

                        // left shift here???
                        //   not sure why that works! endianness problem.
                        //     as these numbers are LE, not BE, so I think.


                        //const dest_row_starting_ui64 = dta64[i64_dest];
                        //const dest_row_starting_ui64_but_only_with_the_original_left_part_there = (dest_row_starting_ui64 << bi_right_right_shift_bits) >> bi_right_right_shift_bits;
                        //const source_row_starting_ui64_but_left_part_is_shifted_right = (sta64[i64_source] << bi_dest_start_i64_rb);
                        //const new_value_to_write = dest_row_starting_ui64_but_only_with_the_original_left_part_there | source_row_starting_ui64_but_left_part_is_shifted_right;
                        //dta64[i64_dest] = new_value_to_write;


                        dta64[i64_dest] = ((dta64[i64_dest] << bi_right_right_shift_bits) >> bi_right_right_shift_bits) | (sta64[i64_source] << bi_dest_start_i64_rb);

                        // Could use an XOR mask I think.
                        //   With all 1s on the right.

                        // 2 to the power of 
                        // so would be an 'or' operation upon something which has had that part removed already.
                        i64_dest++;


                        //  Would not have completed copying the 1st 64bit value from the source.
                        //i64_source++;
    
                    }
                    // and a local variable for the previous / left item from the source.

                    const process_middle_64bit_parts = () => {
                        // And a loop on the inner part....

                        //console.log('dest_row_middle_ui64_count', dest_row_middle_ui64_count);


                        for (let i_mid = 0; i_mid < dest_row_middle_ui64_count; i_mid++) {
                            // Will need to read 2 parts from the source....
                            // left_source_ui64 
                            // the index of the left source one.
                            //const left_source_ui64_as_read = sta64[i64_source];
                            //const right_source_ui64_as_read = sta64[i64_source + 1];
                            // How many bits from the left, how many bits from the right?
                            // But it's the right part from the source left.
                            //const left_source_ui64_right_part_used = left_source_ui64_as_read >> bi_right_right_shift_bits;
                            // and the left part will be used on the right
                            //const right_source_left_part_used = right_source_ui64_as_read << bi_dest_start_i64_rb;
                            //const combined_lr = left_source_ui64_right_part_used | right_source_left_part_used;
                            //dta64[i64_dest] = combined_lr;
                            dta64[i64_dest++] = (sta64[i64_source] >> bi_right_right_shift_bits) | (sta64[i64_source + 1] << bi_dest_start_i64_rb);
                            //const left_source_left_only = 
                            // then the value to write - 
                            //i64_dest++;
                            i64_source++;
                        }
                        // num_inner_64bit_parts
                    }

                    
    
                    const process_last_64bit_part = () => {
    
                        // just write to max ui64???????
                        // get the right part of the dest row....
                        //const right_source_ui64_as_read = sta64[i64_source];
                        //const right_part_of_source_shifted_left = (right_source_ui64_as_read >> bi_right_right_shift_bits);
                        //const dest_row_ending_ui64 = dta64[i64_dest];
                        //const masked_dest_row_ending_ui64 = (dest_row_ending_ui64);
                        //const new_value_to_write = masked_dest_row_ending_ui64 | right_part_of_source_shifted_left;
                        //dta64[i64_dest] = new_value_to_write;


                        dta64[i64_dest] = (dta64[i64_dest]) | (sta64[i64_source] >> bi_right_right_shift_bits);

                        i64_dest++;
                        i64_source++;
                    }

                    process_0th_64bit_part();
                    process_middle_64bit_parts();
                    process_last_64bit_part();

                    // Then do the line jump.

                    i64_dest += num_ui64_line_jump;
                    //console.log('process_0th_64bit_part', process_0th_64bit_part);

                }


                //for (let y = dest_pos[0], )


            }

            iterate_dest_shift_reads();



            // May be easier to do shifted reads....

            //   So would iterare through every 64bit value being written.


            /*

            const first_attempt_shifting_writes = () => {

                if (w_source > 0) {
                    // and then the number of (complete) 64 bit parts....
                    const num_complete_64_bit_parts_per_row = w_source >>> 6;
                    const num_bits_per_row_remaining_after_complete_64_bit_parts = w_source % 64;

                    console.log('num_complete_64_bit_parts_per_row', num_complete_64_bit_parts_per_row);
                    console.log('num_bits_per_row_remaining_after_complete_64_bit_parts', num_bits_per_row_remaining_after_complete_64_bit_parts);

                    // so iterate through the values in the rows....

                    const sta64 = new BigUint64Array(pb_source.ta.buffer, pb_source.ta.byteOffset);
                    const dta64 = new BigUint64Array(pb_dest.ta.buffer, pb_dest.ta.byteOffset);

                    let rpos_64 = 0;

                    // byte index perhaps....

                    let bit_index = 0;


                    // The writing bit index....?

                    //   The coordinates etc only get complex with writing it. Reading it this way is simple.

                    // Also have some dest_x, dest_y???
                    //   Have code in the loop advance the dest pb to the next line.
                    // OK, so what is the dest line skip in bytes????

                    const dest_line_wrap_num_skip_bits = (w_dest - w_source);
                    const dest_line_wrap_num_skip_bytes = dest_line_wrap_num_skip_bits >>> 3;

                    // and then is the number of bytes divisible by 8????

                    // What is the 'shift to right when writing' bits offset?
                    //   Or shift to left?
                    //    It could depend on where the space is available, if it comes to it.

                    // Do want to identify the contiguous 64 bit chunks in the dest?
                    //   Though it is tricky because of misalignment.

                    // For every read value, need to know where and what type of shift to do.
                    //   Shift in from right, keeping the existing bits on the left.

                    //   Shift in from the left, keeping the existing bits on the right.

                    // And need to know how the values that get read are to be split in the destination.
                    //   Each of the reads in the realigned write will be split to be written in 2 separate values.
                    //     So probably need to use 'or' logic quite a lot, at least when writing the second one.
                    //       But at start and end, its as though the first or second parts of that chunk are already in place.


                    // So calculate which 2 64 bit values are to be written to.
                    //   maybe have pos1 and pos2, increment them together, pos2 always up by 1.





                    // And we will have a write_bit_index too????

                    //  Or just keep track what the offsets are from....
                    //    And handle jumps at the ends of the rows.

                    // This does look like it could wind up being a very fast algorithm.





                    

                    // then do the line jumps of both at the ends of the lines....






                    // Should not need to be byte aligned??? 64 bit aligned?


                    if (dest_line_wrap_num_skip_bytes % 8 === 0) {

                        // We can use this.
                        const dest_line_wrap_num_skip_64s = dest_line_wrap_num_skip_bytes >>> 3;
                        //   seems easy enough then, that's the number that get skipped at the end of each line....


                        let wpos_64_1 = (dest_pos[1] * pb_dest.size[0] + dest_pos[0]) >>> 6;
                        let wpos_64_2 = wpos_64_1 + 1;


                        const px_offset_to_right_within_pos1 = BigInt((dest_pos[1] * pb_dest.size[0] + dest_pos[0]) % 64);

                        const px_offset_to_right_within_pos2 = BigInt(64n - px_offset_to_right_within_pos1);
                        // Though here there is a kind of 'remapping' going on.
                        //   Iterating a cursor through may be easiest...
                        //     Though some multiplications can be really fast.


                        // So having a dest start pointer would make sense....

                        for (let source_y = 0; source_y < h_source; source_y++) {
                            // Then iterate through the items in that row....


                            for (let source_x = 0; source_x < w_source; source_x++) {
                                // Then iterate through the items in that row....

                                if (bit_index === 0) {
                                    const read_64_bit_value = sta64[rpos_64++];
                                    //console.log('read_64_bit_value', read_64_bit_value);


                                    // And make 2 values out of it...???
                                    //   But need to apply mask differently....
                                    //     Get left side of it as 1 64 bit int, the right side as the other.

                                    // so shift the left of it to the right?????
                                    //    get rid of the part on the right to start with???


                                    //const offset_from_right????


                                    // But we want the left side from the source in the right side of the dest???
                                    //   No, in left side of dest, but on the right of it.


                                    // Need to keep the first part of what has been read.
                                    const left_side_64 = read_64_bit_value >> px_offset_to_right_within_pos1;



                                    const right_side_64 = read_64_bit_value << px_offset_to_right_within_pos2;


                                    //const left_side_64 = ((read_64_bit_value >> px_offset_to_right_within_pos1) << px_offset_to_right_within_pos1) >> px_offset_to_right_within_pos2 ;
                                    ///const right_side_64 = ((read_64_bit_value << px_offset_to_right_within_pos1) >> px_offset_to_right_within_pos1) << px_offset_to_right_within_pos1;

                                    //const right_side_64 = ((read_64_bit_value << px_offset_to_right_within_pos1) >> px_offset_to_right_within_pos1) << px_offset_to_right_within_pos2 ;

                                    // or write it as an 'and'???

                                    // do need to apply it as an 'and' I think.
                                    ///   or really 'replace'?
                                    // write it as an 'or'?


                                    // So need to write the left side of it in place....
                                    //   But it's on the right.
                                    //    OR it with what's already there - except we need to remove the parts of 'already there'.


                                    const already_there_on_left = (dta64[wpos_64_1] >> px_offset_to_right_within_pos1) << px_offset_to_right_within_pos1;

                                    const already_there_on_right = (dta64[wpos_64_2] << px_offset_to_right_within_pos2) >> px_offset_to_right_within_pos2;


                                    // Then an 'and' operation I think.

                                    //   Shouldn't be too tricky to write it!!!!



                                    //  then apply an 'or' to what's on the left.



                                    const l_64 = already_there_on_left | left_side_64;
                                    const r_64 = already_there_on_right | right_side_64;


                                    dta64[wpos_64_1] = l_64;
                                    dta64[wpos_64_2] = r_64;

                                    
                                    

                                    // px_offset_to_right_within_pos2


                                    // write it....

                                    // What is the byte offset (to the right) within the first write pos?


                                    wpos_64_1++;
                                    wpos_64_2++;





                                    // Then, at this point, we write it appropriately.

                                }
                                

                                //const read_64_bit_value = sta64[rpos_64++];
                                //  then see about how to put that value into the dest, and how much of it, how to shift it.

                                //   likely seems that it will need to go into 2 different destination 64 bit blocks as well.
                                //      Needs to leave pixels outside its draw area unchanged.


                                bit_index++;
                                if (bit_index === 64) bit_index = 0;
                                //  But then when it gets set back to 0???


                                



                                
            
            
                            }

                            wpos_64_1 += dest_line_wrap_num_skip_64s;
                            wpos_64_2 += dest_line_wrap_num_skip_64s;



                        }







                    } else {
                        console.trace();
                        throw 'Alignment issue'
                    }







                    


                }

            }

            */


            //first_attempt_shifting_writes();


            // Read 2 at once, split....
            //   But definitely looks better to set the source.





            // Work out the bit alignments and realignments???


            // For now, go through the source.

            // source width / 64
            //   and the remainder too....

            

            // May be easiest here to use the full sized typed array that covers the whole of the dest image.
            //   Prob will make calculations easier / more standard.

            

            








        }


        // a byte-realigned copy...
        //   So where it can be done if a typed array is made that starts on a different byte.





        // Do want to make and test the 64 bit aligned writing.

        // fully aligned 64 bit????
        //   same size, same shape, a very direct set of operations.

        // To a dest_pos that is divisible by 8

        // Maybe make a pixel_index number.

        const test_can_do_aligned_64_bit = () => (this.bits_per_row % 64 === 0 && this.bits_per_row >= 64) && 
            (dest_pos[1] * pb_1bipp_mask.size[0] + dest_pos[0]) % 64 === 0 &&
            pb_1bipp_mask.bits_per_row % 64 === 0 && pb_1bipp_mask.bits_per_row >= 64;


        const test_can_do_bit_realigned_64_bit = () => (this.bits_per_row % 64 === 0 && this.bits_per_row >= 64) && 
        
        pb_1bipp_mask.bits_per_row % 64 === 0 && pb_1bipp_mask.bits_per_row >= 64;


        // But a realigned 64 bit copy...
        //   Depending on how much realignment would need to be done....

        // Finding how things are out of line when it comes to doing the 64 bit operations.





        




        // approach_selecting

        const approach_selecting = () => {

            //let can_do_aligned_64_bit = test_can_do_aligned_64_bit();

            //let can_do_aligned_64_bit = false;

            // And the realigned version...
            //   row width does have to be divisible by 64 on both source and dest
            //   can realign left?right? however many pixels.

            // Maybe create some kind of shifted / realigned pattern first?





            /*

            const res_64_bit_alignment_test = test_aligned_64bit();
            //console.log('res_64_bit_alignment_test', res_64_bit_alignment_test);
            if (res_64_bit_alignment_test.pass === true) {
                can_do_aligned_64_bit = true;
            }
                */

            // A test to see what is possible....


            //if (can_do_aligned_64_bit) {

                //console.log('doing aligned 64 bit assignement');
            //    return aligned_64_bit_implementation();

            //} else 
            {

                // But it will only work in some cases.
                //   May need to increase row lengths to make it possible.
                //     Both for the source and the dest.





                const can_do_bit_realigned_64_bit = test_can_do_bit_realigned_64_bit();
                if (can_do_bit_realigned_64_bit) {

                    // So do that realigned 64 bit operation...
                    //   Need to work out how many bytes and in which direction things will need to shift.
                    //     What is the pixel index?
                    //     What is the byte index?
                    //       What is the remainder?

                    return arr_on_xspans_implementation();

                    //return bit_realigned_64_bit_implementation();
                    //console.log('should do byte realigned 64 bit assignment');
                } else {
                    return arr_on_xspans_implementation();
                }
                
            }

            // 


        }
        return approach_selecting();

        //return arr_on_xspans_implementation();
    }

    'draw_1bipp_pixel_buffer_mask'(pb_1bipp_mask, dest_pos, color) {

        const {bipp} = this;

        if (bipp === 1) {
            return this.draw_1bipp_pixel_buffer_mask_1bipp(pb_1bipp_mask, dest_pos, color);
        } else {
            const arr_on_xspans_implementation = () => {

                // Getting it as an arr_rows_arr_x_on_spans representation using a class could help.
                //   Or the 'other representaion' type class.
    
    
                const arr_rows_arr_on_xspans = pb_1bipp_mask.calculate_arr_rows_arr_x_on_spans_1bipp();
                const [width, height] = pb_1bipp_mask.size;
    
                let y = 0;
                let [dest_x, dest_y] = dest_pos;
                for (y = 0; y < height; y++) {
                    const arr_row_xspans_on = arr_rows_arr_on_xspans[y];
                    if (arr_row_xspans_on.length > 0) {
                        for (const xonspan of arr_row_xspans_on) {
                            xonspan[0] += dest_x;
                            xonspan[1] += dest_x;
                            this.draw_horizontal_line(xonspan, y + dest_y, color);
                        }
                    }
                }
    
                
                
            }
            return arr_on_xspans_implementation();
        }



        // This could wind up being used on a low level by many different functions.



        /*
        const iterate_set_pixel_implementation = () => {
            console.log('  iterate_set_pixel_implementation');
            const pb_source = pb_1bipp_mask;
            const ta_pos = new Int16Array(2);
            const ta_px_value = new Uint8ClampedArray(3);
            const ta_info = new Uint32Array(4);
            const px_dest_pos = new Uint16Array(2);
            const {bipp} = this;
            if (bipp === 1) {
                pb_source.each_px_on_1bipp(ta_pos, ta_px_value, ta_info, (mask_px_color, pos) => {
                    px_dest_pos[0] = pos[0] + dest_pos[0];
                    px_dest_pos[1] = pos[1] + dest_pos[1];
                    this.set_pixel_on_1bipp(px_dest_pos);
                });
            } else {
                pb_source.each_px_on_1bipp(ta_pos, ta_px_value, ta_info, (mask_px_color, pos) => {
                    px_dest_pos[0] = pos[0] + dest_pos[0];
                    px_dest_pos[1] = pos[1] + dest_pos[1];
                    this.set_pixel(px_dest_pos, color);
                });
            }
        }
        */

        // Looks like a different alternative representation could work well.

        //   May also want to explore customised loading of methods.
        //     As in, different classes that will be called on to do specific algorithms, or do something that can be done with a variety of algorithms.


        // Getting a representation of it that will be as fast as possible to draw.
        //   Some kind of color toggle spans over wrapping scans could be very fast indeed in many cases.
        //     Maybe creating it within a scratch ta as well.

        // And then some color toggle span lengths or similar with some kind of extra row alignment?
        //   The wrapping could / would be different in some cases, so could draw them back to a pb by drawing horizontal lines
        //     over the destination lines, and ceasing the line at the end in cases where the color span wraps to the next line,
        //     and beginning it (again) on the next line in the destination image at the appropriate space.



        // simple implementation....
        //   iterate the pixels in the pixel buffer, setting them in the destination.

        // or read line by line, maintain both read and dest coords....

    /*

        const basic_implementation = () => {
            let mask_x = 0, mask_y = 0, [x, y] = dest_pos;
            const [mask_w, mask_h] = pb_1bipp_mask.size;
            const x_line_start_value = x;
            // But could have a 1 bipp version too...

            const {bits_per_pixel} = this;

            if (bits_per_pixel === 1) {
                for (mask_y = 0; mask_y < mask_h; mask_y++) {
                    x = x_line_start_value;
                    for (mask_x = 0; mask_x < mask_w; mask_x++) {
                        if (pb_1bipp_mask.get_pixel_1bipp([mask_x, mask_y]) === 1) {
                            this.set_pixel_1bipp([x, y], color);
                        }
                        x++;
                        //this.set_pixel
                    }
                    y++;
                }
            } else {
                for (mask_y = 0; mask_y < mask_h; mask_y++) {
                    x = x_line_start_value;
                    for (mask_x = 0; mask_x < mask_w; mask_x++) {
                        if (pb_1bipp_mask.get_pixel_1bipp([mask_x, mask_y]) === 1) {
                            this.set_pixel([x, y], color);
                        }
                        x++;
                        //this.set_pixel
                    }
                    y++;
                }
            }

            
        }

        return basic_implementation();
        
    */





        // Could also make another parallel implementation that gets these spans, by rows, into a typed array.
        //   Even using a scratch typed array.
        //     If we have a decent amount of scratch space we can use that.

        // Also worth looking into using a 64 bit typed array.
        //   Could have that alongside the normal one.
        //     An invarient could be that a typed array length is a multiple of 64.

        // Definitely want to get into these high efficiency modes.
        //   Being able to do aligned 64 bit operations would probably help a lot with speed.

        // Creating some data structures / representations with the correct alignments to work quickly.

        //   And each row length being a multiple of 64 bits.
        //     Bit-shifting whole rows.
        //       Or copying / applying rows with a bitshift done while applying.

        // Doing a direct, aligned or realigned write using binary operation in some cases, rather than representing as the line spans.


        // A pixel_buffer option for auto-padding the rows to be a multiple of 64 bits long?
        //   Though that would change some row calculations.
        

        // auto_ta_8_byte_aligned_length

        // start using .bits_per_row



        // Try direct aligned write???



        // But 64 bit long rows...
        //   And when it aligns regarding 64 bit placing...
        // Direct correspondance between the 64 bit typed arrays when it comes to pixel positions (as in offsets are multiples of 64)

        // Planning type calculations to determine if it can be done in the most rapid way, then what steps could be taken to get it to that
        //   state and then do it.


        // The 'write as 




        
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
    'to_8bit_greyscale'() {
        if (this.bytes_per_pixel === 1) {
            return this;
        } else if (this.bytes_per_pixel === 3) {
            const res = new this.constructor({
                'size': this.size,
                'bits_per_pixel': 8
            });
            if (this.pos) res.pos = this.pos;
            const bres = res.buffer;
            let i = 0;
            this.each_pixel((pos, color) => {
                bres[i++] = Math.round((color[0] + color[1] + color[2]) / 3);
            });
            return res;
        } else if (this.bytes_per_pixel === 4) {
            const res = new this.constructor({
                'size': this.size,
                'bits_per_pixel': 8
            });
            if (this.pos) res.pos = this.pos;
            const bres = res.buffer;
            let i = 0;
            this.each_pixel((pos, color) => {
                bres[i++] = Math.round((color[0] + color[1] + color[2]) / 3);
            });
            return res;
        }
    }
    'to_32bit_rgba'() {
        var res = new this.constructor({
            'size': this.size,
            'bits_per_pixel': 32
        });
        if (this.pos) res.pos = this.pos;
        const bres = res.buffer;
        if (this.bytes_per_pixel === 1) {
            let i = 0, new_v;
            this.each_pixel((pos, v) => {
                bres[i++] = v;
                bres[i++] = v;
                bres[i++] = v;
                bres[i++] = 255;
            });
        } else {
            console.trace();
            throw 'NYI';
        }
        return res;
    }
    '__invert_greyscale_self'() {
        const bres = this.buffer;
        let i = 0;
        this.each_pixel((x, y, v) => {
            bres[i++] = 255 - v;
        });
        return this;
    }
    '__invert_greyscale'() {
        let res = new this.constructor({
            'size': this.size,
            'bits_per_pixel': 8
        });
        if (this.pos) res.pos = this.pos;
        const bres = res.buffer;
        let i = 0;
        this.each_pixel((x, y, v) => {
            bres[i++] = 255 - v;
        });
        return res;
    }
    
    draw_rect(pos_corner, pos_other_corner, color) {
        /*
        const paint_bounds = new Int16Array([20, 300, 180, 320]);
        const paint_color = new Uint8ClampedArray([255, 0, 0]);
        ta_math.fill_solid_rect_by_bounds(pb_dest.ta, pb_dest.bytes_per_row, paint_bounds, 24, paint_color);
        */
        const l = Math.min(pos_corner[0], pos_other_corner[0]);
        const t = Math.min(pos_corner[1], pos_other_corner[1]);
        const r = Math.max(pos_corner[0], pos_other_corner[0]);
        const b = Math.max(pos_corner[1], pos_other_corner[1]);
        //const paint_bounds = new Int16Array([20, 300, 180, 320]);
        //const paint_color = new Uint8ClampedArray([255, 0, 0]);
        const xspan = [l, r];
        for (let y = t; y <= b; y++) {
            this.draw_horizontal_line(xspan, y, color);
        }
    }
    * 'iterate_arr_row_x_on_spans_1bipp'(y) {
    }
    get xspans() {
    }
}
module.exports = Pixel_Buffer_Core;
if (require.main === module) {
    const lg = console.log;
    (async() => {
        const run_examples = async() => {
            lg('Begin run examples');
            const examples = [
                async() => {
                    lg('Begin example 0');
                    const pb = new Pixel_Buffer_Core({
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
