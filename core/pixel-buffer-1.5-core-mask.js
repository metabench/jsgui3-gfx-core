const Pixel_Buffer_Core_Draw_Polygons = require('./pixel-buffer-1.2-core-draw-polygon');
const {
    unsafeGetPixelByIndex,
    unsafeSetPixelByIndex
} = require('./pixel-buffer-pixel-access');
const Polygon_Scanline_Edges = require('./shapes/Polygon_Scanline_Edges');
const ScanlineProcessor = require('./shapes/ScanlineProcessor');
class Pixel_Buffer_Core_Masks extends Pixel_Buffer_Core_Draw_Polygons {
    constructor(spec) {
        super(spec);
    }
    'draw_1bipp_pixel_buffer_mask_1bipp'(pb_1bipp_mask, dest_pos, color) {
        const arr_on_xspans_implementation = () => {
            const arr_rows_arr_on_xspans = pb_1bipp_mask.calculate_arr_rows_arr_x_on_spans_1bipp();
            const [width, height] = pb_1bipp_mask.size;
            const [dest_x, dest_y] = dest_pos;
            if (color === 1) {
                for (let y = 0; y < height; y++) {
                    const target_y = y + dest_y;
                    for (const xonspan of arr_rows_arr_on_xspans[y]) {
                        xonspan[0] += dest_x;
                        xonspan[1] += dest_x;
                        this.draw_horizontal_line_on_1bipp_inclusive(xonspan, target_y);
                    }
                }
            } else {
                for (let y = 0; y < height; y++) {
                    const target_y = y + dest_y;
                    for (const xonspan of arr_rows_arr_on_xspans[y]) {
                        xonspan[0] += dest_x;
                        xonspan[1] += dest_x;
                        this.draw_horizontal_line_off_1bipp_inclusive(xonspan, target_y);
                    }
                }
            }
        }
        const bit_realigned_64_bit_implementation = () => {
            const pb_source = pb_1bipp_mask;
            const pb_dest = this;
            const size_source = pb_source.size;
            const w_source = size_source[0];
            const h_source = size_source[1];
            const size_dest = pb_dest.size;
            const w_dest = size_dest[0];
            const iterate_dest_shift_reads = () => {
                const dest_start_pxi = (dest_pos[1] * pb_dest.size[0]) + dest_pos[0];
                const dest_start_row_end_pxi = dest_start_pxi + pb_source.size[0];
                const num_px_from_dest_row_start_to_draw_box_start = dest_pos[0];
                const num_px_from_draw_box_end_to_dest_row_end = pb_dest.size[0] - pb_source.size[0] - num_px_from_dest_row_start_to_draw_box_start;
                const num_px_line_jump = num_px_from_draw_box_end_to_dest_row_end + dest_pos[0];
                const num_ui64_line_jump = (num_px_line_jump >>> 6) - 1; 
                const dest_start_i64 = dest_start_pxi >>> 6;
                const dest_start_i64_rb = dest_start_pxi % 64;
                const dest_start_row_end_i64 = dest_start_row_end_pxi >>> 6;
                const num_64_bit_at_least_partial_parts_per_row = (dest_start_row_end_i64 - dest_start_i64) + 1;
                let i64_dest = dest_start_i64;
                let i64_source = 0;
                const y_top = dest_pos[1], y_bottom = y_top + h_source;
                const sta64 = new BigUint64Array(pb_source.ta.buffer, pb_source.ta.byteOffset, pb_source.ta.byteLength / 8);
                const dta64 = new BigUint64Array(pb_dest.ta.buffer, pb_dest.ta.byteOffset, pb_dest.ta.byteLength / 8); 
                const bi_dest_start_i64_rb = BigInt(dest_start_i64_rb);
                const bi_right_right_shift_bits = 64n - bi_dest_start_i64_rb;
                const dest_row_middle_ui64_count = num_64_bit_at_least_partial_parts_per_row - 2;
                for (let y = y_top; y < y_bottom; y++) {
                    const process_0th_64bit_part = () => {
                        dta64[i64_dest] = ((dta64[i64_dest] << bi_right_right_shift_bits) >> bi_right_right_shift_bits) | (sta64[i64_source] << bi_dest_start_i64_rb);
                        i64_dest++;
                    }
                    const process_middle_64bit_parts = () => {
                        for (let i_mid = 0; i_mid < dest_row_middle_ui64_count; i_mid++) {
                            dta64[i64_dest++] = (sta64[i64_source] >> bi_right_right_shift_bits) | (sta64[i64_source + 1] << bi_dest_start_i64_rb);
                            i64_source++;
                        }
                    }
                    const process_last_64bit_part = () => {
                        dta64[i64_dest] = (dta64[i64_dest]) | (sta64[i64_source] >> bi_right_right_shift_bits);
                        i64_dest++;
                        i64_source++;
                    }
                    process_0th_64bit_part();
                    process_middle_64bit_parts();
                    process_last_64bit_part();
                    i64_dest += num_ui64_line_jump;
                }
            }
            iterate_dest_shift_reads();
        }
        const test_can_do_aligned_64_bit = () => (this.bits_per_row % 64 === 0 && this.bits_per_row >= 64) && 
            (dest_pos[1] * pb_1bipp_mask.size[0] + dest_pos[0]) % 64 === 0 &&
            pb_1bipp_mask.bits_per_row % 64 === 0 && pb_1bipp_mask.bits_per_row >= 64;
        const test_can_do_bit_realigned_64_bit = () => (this.bits_per_row % 64 === 0 && this.bits_per_row >= 64) && 
        pb_1bipp_mask.bits_per_row % 64 === 0 && pb_1bipp_mask.bits_per_row >= 64;
        const approach_selecting = () => {
            {
                const can_do_bit_realigned_64_bit = test_can_do_bit_realigned_64_bit();
                if (can_do_bit_realigned_64_bit) {
                    return arr_on_xspans_implementation();
                } else {
                    return arr_on_xspans_implementation();
                }
            }
        }
        return approach_selecting();
    }
    'draw_1bipp_pixel_buffer_mask'(pb_1bipp_mask, dest_pos, color) {
        const {bipp} = this;
        if (bipp === 1) {
            return this.draw_1bipp_pixel_buffer_mask_1bipp(pb_1bipp_mask, dest_pos, color);
        } else {
            const arr_on_xspans_implementation = () => {
                //let arr_rows_arr_on_xspans;
                /*
                if (pb_1bipp_mask.arr_rows_arr_on_xspans) {

                } else {
                    pb_1bipp_mask.arr_rows_arr_on_xspans = pb_1bipp_mask.calculate_arr_rows_arr_x_on_spans_1bipp();
                }

                const arr_rows_arr_on_xspans = pb_1bipp_mask.arr_rows_arr_on_xspans;
                */

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
                //pb_1bipp_mask.arr_rows_arr_on_xspans = undefined;
            }
            return arr_on_xspans_implementation();
        }
    }
    mask_each_pixel(cb_pixel) {
        const bipp = this.bits_per_pixel;
        const bypp = this.bytes_per_pixel;
        const ta = this.ta;
        const res_mask = new this.constructor({
            size: this.size,
            bits_per_pixel: 1
        });
        const target = res_mask.ta;
        const width = this.size[0], height = this.size[1];
        const sourceStride = this.bytes_per_row;
        const targetStride = res_mask.bytes_per_row;

        if (bipp === 1) {
            for (let y = 0; y < height; y++) {
                const sourceRow = y * sourceStride;
                const targetRow = y * targetStride;
                for (let x = 0; x < width; x++) {
                    const sourceMask = 0x80 >> (x & 7);
                    const value = (ta[sourceRow + (x >> 3)] & sourceMask) === 0 ? 0 : 1;
                    if (cb_pixel(value)) {
                        target[targetRow + (x >> 3)] |= sourceMask;
                    }
                }
            }
        } else if (bipp === 8) {
            if (sourceStride === width) {
                const pixelCount = width * height;
                for (let pixel = 0; pixel < pixelCount; pixel++) {
                    if (cb_pixel(ta[pixel])) {
                        const y = Math.floor(pixel / width);
                        const x = pixel - y * width;
                        target[y * targetStride + (x >> 3)] |= 0x80 >> (x & 7);
                    }
                }
            } else {
                for (let y = 0; y < height; y++) {
                    const sourceRow = y * sourceStride;
                    const targetRow = y * targetStride;
                    for (let x = 0; x < width; x++) {
                        if (cb_pixel(ta[sourceRow + x])) {
                            target[targetRow + (x >> 3)] |= 0x80 >> (x & 7);
                        }
                    }
                }
            }
        } else if (bipp === 24 || bipp === 32) {
            if (sourceStride === width * bypp) {
                const pixelCount = width * height;
                for (let pixel = 0, sourceByte = 0; pixel < pixelCount; pixel++, sourceByte += bypp) {
                    if (cb_pixel(ta.slice(sourceByte, sourceByte + bypp))) {
                        const y = Math.floor(pixel / width);
                        const x = pixel - y * width;
                        target[y * targetStride + (x >> 3)] |= 0x80 >> (x & 7);
                    }
                }
            } else {
                for (let y = 0; y < height; y++) {
                    let sourceByte = y * sourceStride;
                    const targetRow = y * targetStride;
                    for (let x = 0; x < width; x++) {
                        if (cb_pixel(ta.slice(sourceByte, sourceByte + bypp))) {
                            target[targetRow + (x >> 3)] |= 0x80 >> (x & 7);
                        }
                        sourceByte += bypp;
                    }
                }
            }
        } else {
            throw new Error('Unsupported bits per pixel: ' + bipp);
        }
        return res_mask;
    }
    apply_mask(pb_mask, mr, mg, mb, ma) {
        if (!pb_mask || pb_mask.size[0] !== this.size[0] || pb_mask.size[1] !== this.size[1]) {
            throw new RangeError('Mask and source Pixel Buffers must have matching dimensions');
        }

        const res = this.blank_copy();
        if (this.bipp === 1) {
            res.color_whole(1);
        } else if (this.bipp === 8) {
            res.color_whole(255);
        } else if (this.bipp === 24) {
            res.color_whole([255, 255, 255]);
        } else {
            res.color_whole([255, 255, 255, 255]);
        }

        const pixelCount = this.size[0] * this.size[1];
        const maskBipp = pb_mask.bipp;
        for (let pixel = 0; pixel < pixelCount; pixel++) {
            const maskColor = unsafeGetPixelByIndex(pb_mask, pixel);
            const matches = maskBipp === 1 || maskBipp === 8
                ? maskColor === mr
                : maskBipp === 24
                    ? maskColor[0] === mr && maskColor[1] === mg && maskColor[2] === mb
                    : maskColor[0] === mr && maskColor[1] === mg &&
                        maskColor[2] === mb && maskColor[3] === ma;
            if (matches) {
                unsafeSetPixelByIndex(res, pixel, unsafeGetPixelByIndex(this, pixel));
            }
        }
        return res;
    }
    'get_mask_each_px'(fn_mask) {
        return this.mask_each_pixel(fn_mask);
    }
}
module.exports = Pixel_Buffer_Core_Masks;
