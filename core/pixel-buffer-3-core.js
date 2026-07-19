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
const { ro, prop } = oext;
const Typed_Array_Binary_Read_Write = require('./Typed_Array_Binary_Read_Write');
const Pixel_Buffer_Painter = require('./pixel-buffer-painter');
let ta_math = require('./ta-math')
let { resize_ta_colorspace, copy_rect_to_same_size_8bipp, copy_rect_to_same_size_24bipp, dest_aligned_copy_rect_1to4bypp } = ta_math;

const Pixel_Buffer_Core_Reference_Implementations = require('./pixel-buffer-2-core-reference-implementations');
const Pixel_Buffer_Core_Get_Set_Pixels = require('./pixel-buffer-1-core-get-set-pixel');
const {
    unsafeGetPixel,
    unsafeGetPixel1bipp,
    unsafeSetPixel
} = require('./pixel-buffer-pixel-access');

class Pixel_Buffer_Core extends Pixel_Buffer_Core_Reference_Implementations {
    constructor(spec) {
        super(spec);

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
        const bipp = this.bipp;
        if (bipp !== 8 && bipp !== 24) {
            throw new Error('new_convolved currently supports 8bipp and 24bipp Pixel Buffers only');
        }
        const calc_method = bipp === 8
            ? 'calc_from_8bipp_ta'
            : 'calc_from_24bipp_ta';
        if (!convolution || typeof convolution[calc_method] !== 'function') {
            throw new TypeError('new_convolved requires a compatible convolution object');
        }
        const res = this.blank_copy();
        const xy_conv_center = convolution.xy_center;
        const convolution_size = convolution.size;
        const edge_distances_from_center_px_edge = new Float64Array(4);
        edge_distances_from_center_px_edge[0] = xy_conv_center[0] * -1;
        edge_distances_from_center_px_edge[1] = xy_conv_center[1] * -1;
        edge_distances_from_center_px_edge[2] = edge_distances_from_center_px_edge[0] + convolution_size[0] - 1;
        edge_distances_from_center_px_edge[3] = edge_distances_from_center_px_edge[1] + convolution_size[1] - 1;
        const pb_window = this.new_window({
            size: convolution_size,
            pos_bounds: [edge_distances_from_center_px_edge[0], edge_distances_from_center_px_edge[1], this.size[0] - edge_distances_from_center_px_edge[2], this.size[1] - edge_distances_from_center_px_edge[3]],
            pos: [edge_distances_from_center_px_edge[0], edge_distances_from_center_px_edge[1]]
        });
        const ta_window = pb_window.ta;
        /*
        const pb_conv_res = new Pixel_Buffer({
            size: pb_8bipp_patch.size,
            bits_per_pixel: 24
        });
        */
        let i_write = 0;
        let x_write = 0;
        const width = this.size[0];
        const row_padding = res.bytes_per_row - width * res.bytes_per_pixel;
        const ta_conv_res = res.ta;
        if (bipp === 8) {
            pb_window.each_pos_within_bounds(() => {
                ta_conv_res[i_write++] = Math.round(
                    convolution.calc_from_8bipp_ta(ta_window)
                );
                if (++x_write === width) {
                    x_write = 0;
                    i_write += row_padding;
                }
            });
        } else {
            pb_window.each_pos_within_bounds(() => {
                const rgb = convolution.calc_from_24bipp_ta(ta_window);
                ta_conv_res[i_write++] = rgb[0];
                ta_conv_res[i_write++] = rgb[1];
                ta_conv_res[i_write++] = rgb[2];
                if (++x_write === width) {
                    x_write = 0;
                    i_write += row_padding;
                }
            });
        }
        return res;
    }
    new_resized(size) {
        if (!size || !Number.isSafeInteger(size[0]) || !Number.isSafeInteger(size[1]) ||
            size[0] <= 0 || size[1] <= 0) {
            throw new RangeError('Resize dimensions must be positive safe integers');
        }
        if (size[0] === this.size[0] && size[1] === this.size[1]) {
            return this.clone();
        }
        const dest = new this.constructor({
            size: size,
            bits_per_pixel: this.bipp
        });
        if (this.bipp === 24) {
            // Retain the established area-weighted implementation and its
            // optimized up/down-sampling paths for RGB images.
            resize_ta_colorspace(this.ta, this.ta_colorspace, dest.size, dest.ta);
            return dest;
        }

        const sourceWidth = this.size[0], sourceHeight = this.size[1];
        const targetWidth = dest.size[0], targetHeight = dest.size[1];
        if (this.bipp === 1) {
            for (let targetY = 0; targetY < targetHeight; targetY++) {
                const sourceY = Math.floor(targetY * sourceHeight / targetHeight);
                const sourceRow = sourceY * this.bytes_per_row;
                const targetRow = targetY * dest.bytes_per_row;
                for (let targetX = 0; targetX < targetWidth; targetX++) {
                    const sourceX = Math.floor(targetX * sourceWidth / targetWidth);
                    if ((this.ta[sourceRow + (sourceX >> 3)] & (0x80 >> (sourceX & 7))) !== 0) {
                        dest.ta[targetRow + (targetX >> 3)] |= 0x80 >> (targetX & 7);
                    }
                }
            }
        } else {
            const bytesPerPixel = this.bytes_per_pixel;
            for (let targetY = 0; targetY < targetHeight; targetY++) {
                const sourceY = Math.floor(targetY * sourceHeight / targetHeight);
                const sourceRow = sourceY * this.bytes_per_row;
                let targetByte = targetY * dest.bytes_per_row;
                for (let targetX = 0; targetX < targetWidth; targetX++) {
                    const sourceX = Math.floor(targetX * sourceWidth / targetWidth);
                    let sourceByte = sourceRow + sourceX * bytesPerPixel;
                    for (let component = 0; component < bytesPerPixel; component++) {
                        dest.ta[targetByte++] = this.ta[sourceByte++];
                    }
                }
            }
        }
        return dest;
    }
    copy_rect_by_bounds_to(ta_bounds, pb_target) {
        if (!ta_bounds || ta_bounds.length < 4 ||
            !Number.isInteger(ta_bounds[0]) || !Number.isInteger(ta_bounds[1]) ||
            !Number.isInteger(ta_bounds[2]) || !Number.isInteger(ta_bounds[3])) {
            throw new TypeError('Bounds must contain four integer coordinates');
        }
        if (!pb_target || pb_target.bipp !== this.bipp) {
            throw new TypeError('Source and target Pixel Buffers must use the same pixel format');
        }

        const left = ta_bounds[0], top = ta_bounds[1];
        const right = ta_bounds[2], bottom = ta_bounds[3];
        const requestedWidth = right - left, requestedHeight = bottom - top;
        if (requestedWidth <= 0 || requestedHeight <= 0) {
            throw new RangeError('Bounds must describe a positive-area rectangle');
        }
        if (pb_target.size[0] < requestedWidth || pb_target.size[1] < requestedHeight) {
            throw new RangeError('Target Pixel Buffer is smaller than the requested rectangle');
        }

        const sourceLeft = Math.max(0, left);
        const sourceTop = Math.max(0, top);
        const sourceRight = Math.min(this.size[0], right);
        const sourceBottom = Math.min(this.size[1], bottom);
        if (sourceLeft >= sourceRight || sourceTop >= sourceBottom) return pb_target;

        const targetLeft = sourceLeft - left;
        const targetTop = sourceTop - top;
        const copyWidth = sourceRight - sourceLeft;
        const copyHeight = sourceBottom - sourceTop;
        if (this.bipp === 1) {
            for (let y = 0; y < copyHeight; y++) {
                for (let x = 0; x < copyWidth; x++) {
                    unsafeSetPixel(
                        pb_target,
                        [targetLeft + x, targetTop + y],
                        unsafeGetPixel(this, [sourceLeft + x, sourceTop + y])
                    );
                }
            }
        } else {
            const bytesPerPixel = this.bytes_per_pixel;
            const copyBytes = copyWidth * bytesPerPixel;
            for (let y = 0; y < copyHeight; y++) {
                const sourceStart = (sourceTop + y) * this.bytes_per_row + sourceLeft * bytesPerPixel;
                const targetStart = (targetTop + y) * pb_target.bytes_per_row + targetLeft * bytesPerPixel;
                pb_target.ta.set(this.ta.subarray(sourceStart, sourceStart + copyBytes), targetStart);
            }
        }
        return pb_target;
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
            const width = this.size[0], height = this.size[1];
            const srcStride = this.bytes_per_row;
            const dstStride = res.bytes_per_row;
            for (let y = 0; y < height; y++) {
                let read = y * srcStride;
                let write = y * dstStride;
                let x = 0;
                while (x + 8 <= width) {
                    rta[write++] =
                        (ta[read] >= ui8_threshold ? 0x80 : 0) |
                        (ta[read + 1] >= ui8_threshold ? 0x40 : 0) |
                        (ta[read + 2] >= ui8_threshold ? 0x20 : 0) |
                        (ta[read + 3] >= ui8_threshold ? 0x10 : 0) |
                        (ta[read + 4] >= ui8_threshold ? 0x08 : 0) |
                        (ta[read + 5] >= ui8_threshold ? 0x04 : 0) |
                        (ta[read + 6] >= ui8_threshold ? 0x02 : 0) |
                        (ta[read + 7] >= ui8_threshold ? 0x01 : 0);
                    read += 8;
                    x += 8;
                }
                if (x < width) {
                    let outByte = 0;
                    let mask = 0x80;
                    while (x < width) {
                        if (ta[read++] >= ui8_threshold) outByte |= mask;
                        mask >>= 1;
                        x++;
                    }
                    rta[write] = outByte;
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
            });
            const ta = this.ta, rta = res.ta;
            const width = this.size[0], height = this.size[1];
            const srcStride = this.bytes_per_row, dstStride = res.bytes_per_row;
            for (let y = 0; y < height; y++) {
                let read = y * srcStride;
                let write = y * dstStride;
                let x = 0;
                while (x + 8 <= width) {
                    const value = ta[read++];
                    rta[write++] = value & 0x80 ? 255 : 0;
                    rta[write++] = value & 0x40 ? 255 : 0;
                    rta[write++] = value & 0x20 ? 255 : 0;
                    rta[write++] = value & 0x10 ? 255 : 0;
                    rta[write++] = value & 0x08 ? 255 : 0;
                    rta[write++] = value & 0x04 ? 255 : 0;
                    rta[write++] = value & 0x02 ? 255 : 0;
                    rta[write++] = value & 0x01 ? 255 : 0;
                    x += 8;
                }
                if (x < width) {
                    const value = ta[read];
                    let mask = 0x80;
                    while (x < width) {
                        rta[write++] = value & mask ? 255 : 0;
                        mask >>= 1;
                        x++;
                    }
                }
            }
            return res;
        } else if (bipp === 8) {
            return this.clone();
        } else if (bipp === 24) {
            const res = new this.constructor({
                size: this.size,
                bits_per_pixel: 8
            });
            const ta = this.ta;
            const rta = res.ta;
            const w = this.size[0], h = this.size[1];
            const src_bypr = this.bytes_per_row;
            const dst_bypr = res.bytes_per_row;
            for (let y = 0; y < h; y++) {
                let i_read = y * src_bypr;
                let i_write = y * dst_bypr;
                for (let x = 0; x < w; x++) {
                    const r = ta[i_read], g = ta[i_read + 1], b = ta[i_read + 2];
                    rta[i_write] = Math.round((r + g + b) / 3);
                    i_read += 3;
                    i_write += 1;
                }
            }
            return res;
        } else if (bipp === 32) {
            const res = new this.constructor({
                size: this.size,
                bits_per_pixel: 8
            });
            const ta = this.ta;
            const rta = res.ta;
            const w = this.size[0], h = this.size[1];
            const src_bypr = this.bytes_per_row;
            const dst_bypr = res.bytes_per_row;
            for (let y = 0; y < h; y++) {
                let i_read = y * src_bypr;
                let i_write = y * dst_bypr;
                for (let x = 0; x < w; x++) {
                    const r = ta[i_read], g = ta[i_read + 1], b = ta[i_read + 2];
                    rta[i_write] = Math.round((r + g + b) / 3);
                    i_read += 4;
                    i_write += 1;
                }
            }
            return res;
        }
    }
    to_24bipp() {
        const bipp = this.bits_per_pixel;
        if (bipp === 1) {
            const res = new this.constructor({
                size: this.size,
                bits_per_pixel: 24
            });
            const ta = this.ta, rta = res.ta;
            const width = this.size[0], height = this.size[1];
            const srcStride = this.bytes_per_row, dstStride = res.bytes_per_row;
            for (let y = 0; y < height; y++) {
                let read = y * srcStride;
                let write = y * dstStride;
                let remaining = width;
                while (remaining > 0) {
                    const value = ta[read++];
                    const bits = remaining >= 8 ? 8 : remaining;
                    let mask = 0x80;
                    for (let bit = 0; bit < bits; bit++) {
                        const color = value & mask ? 255 : 0;
                        rta[write++] = color;
                        rta[write++] = color;
                        rta[write++] = color;
                        mask >>= 1;
                    }
                    remaining -= bits;
                }
            }
            return res;
        } else if (bipp === 8) {
            const res = new this.constructor({
                size: this.size,
                bits_per_pixel: 24
            });
            const ta_res = res.ta;
            const ta = this.ta;
            const width = this.size[0], height = this.size[1];
            const srcStride = this.bytes_per_row;
            const dstStride = res.bytes_per_row;
            if (srcStride === width) {
                let write = 0;
                for (let read = 0, length = ta.length; read < length; read++) {
                    const value = ta[read];
                    ta_res[write++] = value;
                    ta_res[write++] = value;
                    ta_res[write++] = value;
                }
            } else {
                for (let y = 0; y < height; y++) {
                    let read = y * srcStride;
                    let write = y * dstStride;
                    for (let x = 0; x < width; x++) {
                        const value = ta[read++];
                        ta_res[write++] = value;
                        ta_res[write++] = value;
                        ta_res[write++] = value;
                    }
                }
            }
            return res;
        } else if (bipp === 24) {
            return this.clone();
        } else if (bipp === 32) {
            const res = new this.constructor({
                size: this.size,
                bits_per_pixel: 24
            });
            const ta = this.ta;
            const rta = res.ta;
            const w = this.size[0], h = this.size[1];
            const src_bypr = this.bytes_per_row;
            const dst_bypr = res.bytes_per_row;
            for (let y = 0; y < h; y++) {
                let i_read = y * src_bypr;
                let i_write = y * dst_bypr;
                for (let x = 0; x < w; x++) {
                    rta[i_write++] = ta[i_read++]; // R
                    rta[i_write++] = ta[i_read++]; // G
                    rta[i_write++] = ta[i_read++]; // B
                    i_read++; // skip Alpha
                }
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
        if (this.bits_per_pixel === 1) {
            const ta = this.ta;
            const width = this.size[0], height = this.size[1];
            const rowDataBytes = this.layout ? this.layout.rowDataBytes : Math.ceil(width / 8);
            const rowStrideBytes = this.bytes_per_row;
            const tailBits = width & 7;
            const tailMask = this.layout
                ? this.layout.tailMask
                : (tailBits === 0 ? 0xFF : (0xFF << (8 - tailBits)) & 0xFF);

            if (color !== 1) {
                ta.fill(0);
            } else if (tailMask === 0xFF && rowDataBytes === rowStrideBytes) {
                // Keep the common, byte-aligned layout on the native bulk-fill path.
                ta.fill(0xFF);
            } else {
                for (let y = 0; y < height; y++) {
                    const rowStart = y * rowStrideBytes;
                    ta.fill(0xFF, rowStart, rowStart + rowDataBytes);
                    ta[rowStart + rowDataBytes - 1] &= tailMask;
                    ta.fill(0, rowStart + rowDataBytes, rowStart + rowStrideBytes);
                }
            }
        } else if (this.bits_per_pixel === 8) {
            const {ta, bytes_per_row: rowStrideBytes} = this;
            const width = this.size[0], height = this.size[1];
            if (rowStrideBytes === width) {
                ta.fill(color);
            } else {
                for (let y = 0; y < height; y++) {
                    const rowStart = y * rowStrideBytes;
                    ta.fill(color, rowStart, rowStart + width);
                    ta.fill(0, rowStart + width, rowStart + rowStrideBytes);
                }
            }
        } else if (this.bits_per_pixel === 24) {
            const {ta, bytes_per_row: rowStrideBytes} = this;
            const width = this.size[0], height = this.size[1];
            const rowDataBytes = width * 3;
            const r = color[0], g = color[1], b = color[2];
            if (rowStrideBytes === rowDataBytes) {
                for (let byte = 0, length = ta.length; byte < length;) {
                    ta[byte++] = r;
                    ta[byte++] = g;
                    ta[byte++] = b;
                }
            } else {
                for (let y = 0; y < height; y++) {
                    const rowStart = y * rowStrideBytes;
                    const rowEnd = rowStart + rowDataBytes;
                    for (let byte = rowStart; byte < rowEnd;) {
                        ta[byte++] = r;
                        ta[byte++] = g;
                        ta[byte++] = b;
                    }
                    ta.fill(0, rowEnd, rowStart + rowStrideBytes);
                }
            }
        } else if (this.bits_per_pixel === 32) {
            const {ta, bytes_per_row: rowStrideBytes} = this;
            const width = this.size[0], height = this.size[1];
            const rowDataBytes = width * 4;
            const r = color[0], g = color[1], b = color[2], a = color[3];
            if (rowStrideBytes === rowDataBytes) {
                for (let byte = 0, length = ta.length; byte < length;) {
                    ta[byte++] = r;
                    ta[byte++] = g;
                    ta[byte++] = b;
                    ta[byte++] = a;
                }
            } else {
                for (let y = 0; y < height; y++) {
                    const rowStart = y * rowStrideBytes;
                    const rowEnd = rowStart + rowDataBytes;
                    for (let byte = rowStart; byte < rowEnd;) {
                        ta[byte++] = r;
                        ta[byte++] = g;
                        ta[byte++] = b;
                        ta[byte++] = a;
                    }
                    ta.fill(0, rowEnd, rowStart + rowStrideBytes);
                }
            }
        } else {
            throw 'Unsupported this.bytes_per_pixel: ' + this.bytes_per_pixel;
        }
        return this;
    }
    crop(size) {
        if (!Number.isInteger(size) || size < 0) {
            throw new RangeError('Crop size must be a non-negative integer');
        }
        const newWidth = this.size[0] - size * 2;
        const newHeight = this.size[1] - size * 2;
        if (newWidth <= 0 || newHeight <= 0) {
            throw new RangeError('Crop size must leave a positive width and height');
        }
        const res = new this.constructor({
            bits_per_pixel: this.bipp,
            size: [newWidth, newHeight],
            rowAlignmentBytes: this.layout.rowAlignmentBytes
        });
        // Cropping removes pixels from the top and left, so the remaining
        // image begins farther into the same coordinate space.
        res.pos = [this.pos[0] + size, this.pos[1] + size];

        if (this.bipp === 1) {
            for (let y = 0; y < newHeight; y++) {
                for (let x = 0; x < newWidth; x++) {
                    unsafeSetPixel(res, [x, y], unsafeGetPixel(this, [x + size, y + size]));
                }
            }
        } else {
            const rowBytes = newWidth * this.bytes_per_pixel;
            const sourceXByte = size * this.bytes_per_pixel;
            for (let y = 0; y < newHeight; y++) {
                const sourceStart = (y + size) * this.bytes_per_row + sourceXByte;
                res.ta.set(
                    this.ta.subarray(sourceStart, sourceStart + rowBytes),
                    y * res.bytes_per_row
                );
            }
        }
        return res;
    }
    uncrop(size, color) {
        if (!Number.isInteger(size) || size < 0) {
            throw new RangeError('Uncrop size must be a non-negative integer');
        }
        const res = new this.constructor({
            bits_per_pixel: this.bipp,
            size: [this.size[0] + size * 2, this.size[1] + size * 2],
            rowAlignmentBytes: this.layout.rowAlignmentBytes
        });
        // Uncropping adds a border above and to the left of the old image.
        res.pos = [this.pos[0] - size, this.pos[1] - size];
        if (color !== undefined) res.color_whole(color);

        if (this.bipp === 1) {
            for (let y = 0; y < this.size[1]; y++) {
                for (let x = 0; x < this.size[0]; x++) {
                    unsafeSetPixel(res, [x + size, y + size], unsafeGetPixel(this, [x, y]));
                }
            }
        } else {
            const rowBytes = this.size[0] * this.bytes_per_pixel;
            const targetXByte = size * this.bytes_per_pixel;
            for (let y = 0; y < this.size[1]; y++) {
                const sourceStart = y * this.bytes_per_row;
                const targetStart = (y + size) * res.bytes_per_row + targetXByte;
                res.ta.set(this.ta.subarray(sourceStart, sourceStart + rowBytes), targetStart);
            }
        }
        return res;
    }
    color_rect(bounds, color) {
        if (!bounds || bounds.length < 4) {
            throw new TypeError('color_rect bounds must contain four coordinates');
        }
        for (let index = 0; index < 4; index++) {
            if (!Number.isSafeInteger(bounds[index])) {
                throw new TypeError('color_rect bounds must be safe integers');
            }
        }
        const left = Math.max(0, bounds[0]);
        const top = Math.max(0, bounds[1]);
        const right = Math.min(this.size[0], bounds[2]);
        const bottom = Math.min(this.size[1], bounds[3]);
        if (left >= right || top >= bottom) return;

        for (let y = top; y < bottom; y++) {
            this.draw_horizontal_line([left, right - 1], y, color);
        }
    }
    each_pixel_byte_index(cb) {
        const { bipp } = this;
        let ctu = true;
        const stop = () => ctu = false;
        if (bipp === 8 || bipp === 24 || bipp === 32) {
            const {ta, bytes_per_pixel: bytesPerPixel, bytes_per_row: rowStrideBytes} = this;
            const width = this.size[0], height = this.size[1];
            const rowDataBytes = width * bytesPerPixel;
            if (rowStrideBytes === rowDataBytes) {
                for (let byte = 0, length = ta.length; ctu && byte < length; byte += bytesPerPixel) {
                    cb(byte, stop);
                }
            } else {
                for (let y = 0; ctu && y < height; y++) {
                    const rowStart = y * rowStrideBytes;
                    for (let x = 0; ctu && x < width; x++) {
                        cb(rowStart + x * bytesPerPixel, stop);
                    }
                }
            }
        } else if (bipp === 1) {
            const width = this.size[0], height = this.size[1];
            const rowStrideBytes = this.bytes_per_row;
            for (let y = 0; ctu && y < height; y++) {
                const rowStart = y * rowStrideBytes;
                for (let x = 0; ctu && x < width; x++) {
                    cb(rowStart + (x >> 3), stop);
                }
            }
        } else {
            throw new Error('Unsupported bits per pixel: ' + bipp);
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
            if ((ta_pos instanceof Int16Array || ta_pos instanceof Int32Array) && ta_pos.length >= 2) {
                if (ta_px_value instanceof Uint8ClampedArray && ta_px_value.length >= 3) {
                    if (ta_info instanceof Uint32Array && ta_info.length >= 4) {
                        const ta = this.ta;
                        ta_info[0] = this.size[0];
                        ta_info[1] = this.size[1];
                        ta_info[2] = 0;
                        ta_info[3] = 24; // bipp;
                        let byteIndex = 0;
                        const update = () => {
                            ta[byteIndex] = ta_px_value[0];
                            ta[byteIndex + 1] = ta_px_value[1];
                            ta[byteIndex + 2] = ta_px_value[2];
                        }
                        for (ta_pos[1] = 0; ta_pos[1] < ta_info[1]; ta_pos[1]++) {
                            byteIndex = ta_pos[1] * this.bytes_per_row;
                            for (ta_pos[0] = 0; ta_pos[0] < ta_info[0]; ta_pos[0]++) {
                                ta_px_value[0] = ta[byteIndex];
                                ta_px_value[1] = ta[byteIndex + 1];
                                ta_px_value[2] = ta[byteIndex + 2];
                                callback(update);
                                ta_info[2]++;
                                byteIndex += 3;
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
                    const px = unsafeGetPixel1bipp(this, ta_pos);
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
                    if (unsafeGetPixel1bipp(this, ta_pos) === 1) {
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
            this.set_pixel(pos, color);
        });
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
            const width = this.size[0], height = this.size[1];
            if (this.bytes_per_row === width * bypp) {
                while (i_px < num_px) {
                    ta_r[i_px] = ta[i_byte];
                    ta_g[i_px] = ta[i_byte + 1];
                    ta_b[i_px] = ta[i_byte + 2];
                    i_px++;
                    i_byte += bypp;
                }
            } else {
                for (let y = 0; y < height; y++) {
                    i_byte = y * this.bytes_per_row;
                    for (let x = 0; x < width; x++) {
                        ta_r[i_px] = ta[i_byte];
                        ta_g[i_px] = ta[i_byte + 1];
                        ta_b[i_px] = ta[i_byte + 2];
                        i_px++;
                        i_byte += bypp;
                    }
                }
            }
            return res;
        } else if (bipp === 8) {
            const res = [this.clone(), this.clone(), this.clone()];
            return res;
        } else {
            console.trace();
            throw 'Unsupported bipp for split_rgb_channels: ' + bipp;
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
        const my_colorspace = this.ta_colorspace;
        if (my_colorspace.length === other_colorspace.length) {
            if (my_colorspace.every((val, i) => val === other_colorspace[i])) {
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
        const bounds = pixel_pos_list.bounds;
        const size = [bounds[2] - bounds[0] + 1, bounds[3] - bounds[1] + 1];
        const res = new this.constructor({
            size: size,
            bits_per_pixel: this.bipp,
            rowAlignmentBytes: this.layout.rowAlignmentBytes
        });
        if (bg_color !== undefined) {
            res.color_whole(bg_color);
        }
        res.pos = [bounds[0], bounds[1]];
        pixel_pos_list.each_pixel((pos) => {
            const color = this.get_pixel(pos);
            const target_pos = [pos[0] - bounds[0], pos[1] - bounds[1]];
            res.set_pixel(target_pos, color);
        });
        return res;
    }


    // Pixel_Buffer_Pair_Complex_Operation class possibly?
    //   Or just Operation.



    // get_pre_operation_alignment_info ....



    // And could define such a class which has got requirements / invarients to do with 



    // This is used when drawing filled polygons.

    'draw_1bipp_pixel_buffer_mask_1bipp'(pb_1bipp_mask, dest_pos, color) {




        // A direct iteration approach could work better.
        // Though (shifting and?) applying the correct boolean operations could work best.



        function draw_bitmap(
            target, target_width, target_height, target_stride,
            source, source_width, source_height, source_stride,
            target_x, target_y, draw_color
        ) {
            const source_data_bytes = Math.ceil(source_width / 8);
            const source_tail_bits = source_width & 7;
            const source_tail_mask = source_tail_bits === 0
                ? 0xFF
                : (0xFF << (8 - source_tail_bits)) & 0xFF;
            const target_tail_bits = target_width & 7;
            const target_tail_mask = target_tail_bits === 0
                ? 0xFF
                : (0xFF << (8 - target_tail_bits)) & 0xFF;
            const set_on = draw_color !== 0;

            // Keep the in-bounds case byte-oriented. Clipped placement is uncommon and
            // deliberately falls back to checked pixel writes rather than aliasing rows.
            if (target_x < 0 || target_y < 0 ||
                target_x + source_width > target_width ||
                target_y + source_height > target_height) {
                const source_x_start = Math.max(0, -target_x);
                const source_x_end = Math.min(source_width, target_width - target_x);
                const source_y_start = Math.max(0, -target_y);
                const source_y_end = Math.min(source_height, target_height - target_y);
                for (let sy = source_y_start; sy < source_y_end; sy++) {
                    const source_row = sy * source_stride;
                    const target_row = (target_y + sy) * target_stride;
                    for (let sx = source_x_start; sx < source_x_end; sx++) {
                        if ((source[source_row + (sx >> 3)] & (128 >> (sx & 7))) !== 0) {
                            const tx = target_x + sx;
                            const target_byte = target_row + (tx >> 3);
                            const mask = 128 >> (tx & 7);
                            if (set_on) target[target_byte] |= mask;
                            else target[target_byte] &= ~mask & 255;
                        }
                    }
                }
                return;
            }

            const bit_offset = target_x & 7;
            for (let row = 0; row < source_height; row++) {
                const source_row_start = row * source_stride;
                const target_row_start = (target_y + row) * target_stride;
                let target_byte_index = target_row_start + (target_x >> 3);

                for (let col = 0; col < source_data_bytes; col++) {
                    let source_byte = source[source_row_start + col];
                    if (col === source_data_bytes - 1) source_byte &= source_tail_mask;
                    if (source_byte === 0) {
                        target_byte_index++;
                        continue;
                    }

                    if (bit_offset === 0) {
                        if (set_on) target[target_byte_index] |= source_byte;
                        else target[target_byte_index] &= ~source_byte & 255;
                    } else {
                        const first_bits = source_byte >>> bit_offset;
                        const carry_bits = (source_byte << (8 - bit_offset)) & 255;
                        if (set_on) {
                            target[target_byte_index] |= first_bits;
                            if (carry_bits !== 0) target[target_byte_index + 1] |= carry_bits;
                        } else {
                            target[target_byte_index] &= ~first_bits & 255;
                            if (carry_bits !== 0) target[target_byte_index + 1] &= ~carry_bits & 255;
                        }
                    }
                    target_byte_index++;
                }

                if (target_tail_mask !== 0xFF) {
                    const target_tail_byte = target_row_start + Math.ceil(target_width / 8) - 1;
                    target[target_tail_byte] &= target_tail_mask;
                }
            }
        }


        const chatgpto1_draw_bitmap_implementation = () => {
            draw_bitmap(
                this.ta, this.size[0], this.size[1], this.bytes_per_row,
                pb_1bipp_mask.ta, pb_1bipp_mask.size[0], pb_1bipp_mask.size[1], pb_1bipp_mask.bytes_per_row,
                dest_pos[0], dest_pos[1], color
            );
        }


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
        //return approach_selecting();

        //return arr_on_xspans_implementation();

        return chatgpto1_draw_bitmap_implementation();
    }

    'draw_1bipp_pixel_buffer_mask'(pb_1bipp_mask, dest_pos, color) {

        const { bipp } = this;

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

    }
    'blank_copy'() {
        const storage = typeof Buffer !== 'undefined' && Buffer.isBuffer(this.storage)
            ? Buffer.alloc(this.storage.length)
            : new this.storage.constructor(this.storage.length);
        const res = new this.constructor({
            'size': this.size,
            'bits_per_pixel': this.bits_per_pixel,
            rowStrideBytes: this.bytes_per_row,
            rowAlignmentBytes: this.layout.rowAlignmentBytes,
            ta: storage
        });
        if (this.pos) res.pos = this.pos;
        return res;
    }
    'clone'() {
        const storage = typeof Buffer !== 'undefined' && Buffer.isBuffer(this.storage)
            ? Buffer.from(this.storage)
            : new this.storage.constructor(this.storage);
        const res = new this.constructor({
            'size': this.size,
            'bits_per_pixel': this.bits_per_pixel,
            rowStrideBytes: this.bytes_per_row,
            rowAlignmentBytes: this.layout.rowAlignmentBytes,
            ta: storage
        });
        if (this.pos) res.pos = this.pos;
        return res;
    }
    'add_alpha_channel'() {
        if (this.bytes_per_pixel === 3) {
            const res = new this.constructor({
                'size': this.size,
                'bytes_per_pixel': 4
            });
            if (this.pos) res.pos = this.pos;
            const source = this.ta, target = res.ta;
            const width = this.size[0], height = this.size[1];
            const sourceStride = this.bytes_per_row;
            const targetStride = res.bytes_per_row;
            for (let y = 0; y < height; y++) {
                let read = y * sourceStride;
                let write = y * targetStride;
                for (let x = 0; x < width; x++) {
                    target[write++] = source[read++];
                    target[write++] = source[read++];
                    target[write++] = source[read++];
                    target[write++] = 255;
                }
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
        } else if (this.bytes_per_pixel === 3) {
            const buf = this.buffer;
            const w = this.size[0], h = this.size[1];
            const src_bypr = this.bytes_per_row;
            const dst_bypr = res.bytes_per_row;
            for (let y = 0; y < h; y++) {
                let i = y * src_bypr;
                let ir = y * dst_bypr;
                for (let x = 0; x < w; x++) {
                    bres[ir++] = buf[i++];
                    bres[ir++] = buf[i++];
                    bres[ir++] = buf[i++];
                    bres[ir++] = 255;
                }
            }
        } else if (this.bytes_per_pixel === 4) {
            return this.clone();
        }
        return res;
    }
    '__invert_greyscale_self'() {
        if (this.bipp !== 8) {
            throw new Error('__invert_greyscale_self requires an 8bipp Pixel Buffer');
        }
        const bres = this.buffer;
        const width = this.size[0], height = this.size[1];
        if (this.bytes_per_row === width) {
            for (let byte = 0, length = bres.length; byte < length; byte++) {
                bres[byte] = 255 - bres[byte];
            }
        } else {
            for (let y = 0; y < height; y++) {
                const rowStart = y * this.bytes_per_row;
                const rowEnd = rowStart + width;
                for (let byte = rowStart; byte < rowEnd; byte++) {
                    bres[byte] = 255 - bres[byte];
                }
                bres.fill(0, rowEnd, rowStart + this.bytes_per_row);
            }
        }
        return this;
    }
    '__invert_greyscale'() {
        return this.clone().__invert_greyscale_self();
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

// Core 3 historically duplicated the complete Core 1 access surface. Install
// the canonical checked descriptors at the same effective lookup position so
// public ownership and descriptor flags remain unchanged while both deep-import
// classes share one implementation.
const canonicalAccessDescriptors = Object.getOwnPropertyDescriptors(
    Pixel_Buffer_Core_Get_Set_Pixels.prototype
);
for (const [name, descriptor] of Object.entries(canonicalAccessDescriptors)) {
    if (/^(?:get_pixel(?:_|$)|set_pixel(?:_|$))/.test(name)) {
        Object.defineProperty(Pixel_Buffer_Core.prototype, name, descriptor);
    }
}

module.exports = Pixel_Buffer_Core;
if (require.main === module) {
    const lg = console.log;
    (async () => {
        const run_examples = async () => {
            lg('Begin run examples');
            const examples = [
                async () => {
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
