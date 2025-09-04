const Pixel_Buffer_Core_Draw_Polygons = require('./pixel-buffer-1.2-core-draw-polygon');
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
        let i_byte = 0;
        let i_px = 0;
        const bypp = this.bytes_per_pixel;
        const ta = this.ta;
        const l = ta.length;
        const res_mask = new this.constructor({
            size: this.size,
            bits_per_pixel: 1
        });
        if (bipp === 1) {
            console.trace();
            throw 'NYI';
        } else if (bipp === 8) {
            console.trace();
            throw 'NYI';
        } else if (bipp === 24 || bipp === 32) {
            while (i_byte < l) {
                const ta_sub = ta.slice(i_byte, i_byte + bypp);
                const px_on = cb_pixel(ta_sub) ? 1 : 0;
                res_mask.set_pixel_by_idx(i_px, px_on);
                i_byte += bypp;
                i_px++;
            }
        }
        return res_mask;
    }
    apply_mask(pb_mask, mr, mg, mb, ma) {
        let res = this.blank_copy();
        res.flood_fill(0, 0, 255, 255, 255, 255);
        let px;
        pb_mask.each_pixel((x, y, r, g, b, a) => {
            if (r === mr && g === mg && b === mb && a === ma) {
                px = this.get_pixel(x, y);
                res.set_pixel(x, y, px[0], px[1], px[2], px[3])
            }
        })
        return res;
    }
    'get_mask_each_px'(fn_mask) {
        const bipp = this.bipp;
        console.log('get_mask_each_px bipp', bipp);
        const res_mask = new this.constructor({
            size: this.size,
            bits_per_pixel: 1
        })
        if (bipp === 1) {
            let byte = 0,
                bit = 0; 
            console.trace();
            throw 'NYI'
            const ta = this.ta,
                l = ta.length;
            while (byte < l) {
            }
        } else if (bipp === 8) {
            console.trace();
            throw 'NYI';
        } else if (bipp === 24) {
            let byte_pos = 0,
                i_px = 0;
            const l = this.ta.length;
            while (byte_pos < l) {
                const ta_px = this.ta.slice(byte_pos, byte_pos + 3);
                const mask_res = fn_mask(ta_px);
                byte_pos += 3;
            }
        } else if (bipp === 32) {
            console.trace();
            throw 'NYI';
        }
        return res_mask;
    }
}
module.exports = Pixel_Buffer_Core_Masks;