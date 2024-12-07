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

const Pixel_Buffer_Core_Masks = require('./pixel-buffer-1.5-core-mask');

class Pixel_Buffer_Core_Reference_Implementations extends Pixel_Buffer_Core_Masks {
    constructor(spec) {
        if (spec instanceof Pixel_Buffer_Core_Reference_Implementations) {
            spec = {
                bits_per_pixel: spec.bits_per_pixel,
                size: spec.size,
                ta: spec.ta
            }
        }
        let silent_update_bits_per_pixel;
        let silent_update_bytes_per_pixel;
        if (spec.window_to) {
            spec.bits_per_pixel = spec.window_to.bits_per_pixel;
        }
        const pos = new Int16Array(2);
        const size = new Int16Array(2);
        let ta; // flexible, can be redefined? Can still make read-only in userland.

        super(spec);

        
        
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
        this.paint = new Pixel_Buffer_Painter({
            pb: this
        });
    }

    // Some will need to be a bit more optimised for perf rather than readability. Do want clear code though.

    // Not quite sure why this is failing on 1 bipp right now....

    each_pixel(callback) {
        // Want optimised but still idiomatic
        const {ta_pos_scratch, bipp, bypp, size, ta} = this;

        // And a ta_color_scratch perhaps?
        //   ta_24bipp_color_scratch maybe...
        //   ta_rgb or ta_rgba?
        //    number of bits makes more sense. more flexible.

        // Could call each_pixel_pos, and increment a byte index.

        // read_bit_from_byte

        //const bfb = (byte, bit_index) => (byte >> bit_index) & 1;

        if (bipp === 1) {

            // Should not be too hard to implement....

            //let i_pixel = 0;
            // and the number of pixels....
            const [w, h] = size;

            let i_byte = 0, i_bit = 0;
            //let input_byte = ta[0];

            const ta_cb_pos = new Uint32Array(2);

            for (let y = 0; y < h; y++) {
                ta_cb_pos[1] = y;
                for (let x = 0; x < w; x++) {
                    ta_cb_pos[0] = x;
                    //const px_color = (input_byte >> i_bit) & 1;
                    // not sure why this is not working right.

                    const got_px_color = this.get_pixel_1bipp(ta_cb_pos);

                    
                    callback(ta_cb_pos, got_px_color);

                    //i_bit++;
                    if (i_bit === 8) {
                        //i_byte++;
                        //i_bit = 0;
                        //input_byte = ta[i_byte];
                    }
                    //i_pixel++;
                }

            }


            



            //console.trace();
            //throw 'NYI';
        } else if (bipp === 8) {
            // Function to iterate through positions could work.
            // Nested for loops seems a bit simpler...
            //ta_pos_scratch[0] = 0;
            //ta_pos_scratch[1] = 0;
            let pixel_idx = 0;
            this.each_pixel_pos((pos, stop) => {
                callback(pos, ta[pixel_idx++], stop);
            });
            //


        } else if (bipp === 24) {
            // Provide direct access with a subarray?
            //  Could be better for idiomatic writing.
            //  Though setting values would maybe / likely be quicker and mean less allocations.

            const {ta_24bit_color} = this;
            let byte_idx = 0;
            this.each_pixel_pos((pos, stop) => {
                ta_24bit_color[0] = ta[byte_idx++];
                ta_24bit_color[1] = ta[byte_idx++];
                ta_24bit_color[2] = ta[byte_idx++];
                callback(pos, ta_24bit_color, stop);
            });

        } else if (bipp === 32) {
            const {ta_32bit_color} = this;
            let byte_idx = 0;
            this.each_pixel_pos((pos, stop) => {
                ta_32bit_color[0] = ta[byte_idx++];
                ta_32bit_color[1] = ta[byte_idx++];
                ta_32bit_color[2] = ta[byte_idx++];
                ta_32bit_color[3] = ta[byte_idx++];
                callback(pos, ta_32bit_color, stop);
            });
        }

        // Could advance through the positions?
        // Advancing through bit indexes.

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

    // Could have a 'paint' file / module.
    'paint_solid_border'(thickness, color) {

        // separate methods for different bipps, this fn chooses one?

        return this.process((me, res) => {
            let x, y;
            const [w, h] = this.size;
            if (this.bytes_per_pixel === 4) {
                // top two rows
                for (y = 0; y < thickness; y++) {
                    for (x = 0; x < w; x++) {
                        res.set_pixel(x, y, color[0], color[1], color[2], color[3]);
                    }
                }
                for (y = h - thickness; y < h; y++) {
                    for (x = 0; x < w; x++) {
                        res.set_pixel(x, y, color[0], color[1], color[2], color[3]);
                    }
                }
                for (y = 0; y < h; y++) {
                    for (x = 0; x < thickness; x++) {
                        res.set_pixel(x, y, color[0], color[1], color[2], color[3]);
                    }
                }
                for (y = 0; y < h; y++) {
                    for (x = w - thickness; x < w; x++) {
                        res.set_pixel(x, y, color[0], color[1], color[2], color[3]);
                    }
                }
            } else if (this.bytes_per_pixel === 3) {
                // top two rows
                for (y = 0; y < thickness; y++) {
                    for (x = 0; x < w; x++) {
                        res.set_pixel(x, y, color[0], color[1], color[2]);
                    }
                }
                for (y = h - thickness; y < h; y++) {
                    for (x = 0; x < w; x++) {
                        res.set_pixel(x, y, color[0], color[1], color[2]);
                    }
                }
                for (y = 0; y < h; y++) {
                    for (x = 0; x < thickness; x++) {
                        res.set_pixel(x, y, color[0], color[1], color[2]);
                    }
                }
                for (y = 0; y < h; y++) {
                    for (x = w - thickness; x < w; x++) {
                        res.set_pixel(x, y, color[0], color[1], color[2]);
                    }
                }
            } else {
                console.trace();
                throw 'NYI';
            }
            return res;
        })
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
        this.each_px(pos => {
            this.set_pixel(pos, color);
        })
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

        // .num_pixels????

        const [w, h] = this.size;
        const num_pixels = w * h;

        let bit_idx = 0, byte_idx = bit_idx >> 3;

        for (let c = 0; c < num_pixels; c++) {

            byte_idx = bit_idx >> 3;
            cb(byte_idx);



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


    // Pixel_Buffer_Pair_Complex_Operation class possibly?
    //   Or just Operation.



    // get_pre_operation_alignment_info ....


    
    // And could define such a class which has got requirements / invarients to do with 



    // This is used when drawing filled polygons.

    
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
module.exports = Pixel_Buffer_Core_Reference_Implementations;
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
