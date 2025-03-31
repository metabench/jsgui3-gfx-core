const Pixel_Buffer_Idiomatic_Enh = require('./pixel-buffer-5-idiomatic-enh');

const Pixel_Pos_List = require('./pixel-pos-list');
const get_idx_movement_vectors = (f32a_convolution, bpp, bpr) => {
    const c_length = f32a_convolution.length;
    const dimension_size = Math.sqrt(c_length);
    const padding = (dimension_size - 1) / 2;
    const movement_vectors = new Int8Array(c_length * 2);
    let x, y, pos = 0;
    const idx_movement_vectors = new Int16Array(c_length);
    for (y = -1 * padding; y <= padding; y++) {
        for (x = -1 * padding; x <= padding; x++) {
            movement_vectors[pos++] = x;
            movement_vectors[pos++] = y;
        }
    }
    pos = 0;
    let ii, i;
    for (i = 0; i < c_length; i++) {
        x = movement_vectors[pos++];
        y = movement_vectors[pos++];
        idx_movement_vectors[i] = x * bpp + y * bpr;
    }
    return idx_movement_vectors;
}
const get_points_bounding_box = (points) => {
    let min_x = Number.POSITIVE_INFINITY;
    let min_y = Number.POSITIVE_INFINITY;
    let max_x = Number.NEGATIVE_INFINITY;
    let max_y = Number.NEGATIVE_INFINITY;
    for (const [x, y] of points) {
        if (x < min_x) min_x = x;
        if (x > max_x) max_x = x;
        if (y < min_y) min_y = y;
        if (y > max_y) max_y = y;
    }
    return [
        [min_x, min_y],
        [max_x, max_y]
    ];
}
class Pixel_Buffer_Perf_Focus_Enh extends Pixel_Buffer_Idiomatic_Enh {
    constructor(spec) {
        super(spec);
    }
    get ta_is_64bit_divisible() {
        return (this.ta.length & 63) === 0;
    }
    get ta_is_32bit_divisible() {
        return (this.ta.length & 31) === 0;
    }
    get ta64() {
        if (this._ta64) {
            return this._ta64;
        } else {
        }
        if (this.ta_is_64bit_divisible) {
            if (this.ta.byteOffset % 8 === 0) {
                this._ta64 = new BigUint64Array(this.ta.buffer, this.ta.byteOffset, this.ta.byteLength / 8);
                return this._ta64;
            } else {
                console.error("The byte offset is not aligned to 8 bytes.");
            }
        } else  {
            return false;
        }
    }
    get is_32bit_divisible_image() {
        return (this.ta.length & 31) === 0;
    }
    get is_32_divisible_bits_per_row() {
        return (this.bits_per_row & 31) === 0;
    }
    get number_of_32bit_segments_per_32bit_divisible_row() {
        return this.bits_per_row >> 5;
    }
    get is_64bit_divisible_image() {
        return (this.ta.length & 63) === 0;
    }
    get is_64_divisible_bits_per_row() {
        return (this.bits_per_row & 63) === 0;
    }
    get number_of_64bit_segments_per_64bit_divisible_row() {
        return this.bits_per_row >> 6;
    }
    get bits_per_image_1bipp() {
        return this.size[0] * this.size[1];
    }
    get number_of_64bit_segments_per_64bit_divisible_image() {
        return this.bits_per_image_1bipp >> 6;
    }
    iterate_all_ui32_locations_1bipp(cb) {
        const ui32a_px_range = new Uint32Array(4);
        if (this.ta_is_32bit_divisible) {
            if (this.is_32_divisible_bits_per_row) {
                const number_of_32bit_segments_per_32bit_divisible_row = this.number_of_32bit_segments_per_32bit_divisible_row;
                if (number_of_32bit_segments_per_32bit_divisible_row === 1) {
                    const height = this.size[1];
                    const first_x = 0, last_x = 31;
                    ui32a_px_range[0] = first_x;
                    ui32a_px_range[2] = last_x;
                    let y = 0;
                    for (let i = 0; i < height; i++) {
                        ui32a_px_range[1] = y;
                        ui32a_px_range[3] = y;
                        cb(ui32a_px_range);
                        y++;
                    }
                } else if (number_of_32bit_segments_per_32bit_divisible_row === 2) {
                    const height = this.size[1];
                    const number_of_32bit_segments = height * number_of_32bit_segments_per_32bit_divisible_row;
                    let even = true;
                    let y = 0;
                    let first_x = 0, last_x = 63;
                    for (let i = 0; i < number_of_32bit_segments; i++) {
                        ui32a_px_range[0] = first_x;
                        ui32a_px_range[1] = y;
                        ui32a_px_range[2] = last_x;
                        ui32a_px_range[3] = y;
                        cb(ui32a_px_range);
                        if (!even) {
                            y++;
                            first_x = 0; last_x = 31;
                        } else {
                            first_x = 32; last_x = 63;
                        }
                        even = !even;
                    }
                } else {
                    const height = this.size[1];
                    const number_of_32bit_segments = height * number_of_32bit_segments_per_32bit_divisible_row;
                    let y = 0;
                    let first_x = 0, last_x = 31;
                    let i_row_segment = 0;
                    for (let i = 0; i < number_of_32bit_segments; i++) {
                        ui32a_px_range[0] = first_x;
                        ui32a_px_range[1] = y;
                        ui32a_px_range[2] = last_x;
                        ui32a_px_range[3] = y;
                        cb(ui32a_px_range);
                        i_row_segment++;
                        if (i_row_segment < number_of_32bit_segments_per_32bit_divisible_row) {
                            first_x += 32;
                            last_x += 32;
                        } else {
                            i_row_segment = 0;
                            y++;
                            first_x = 0; last_x = 31;
                        }
                    }
                }
            } else {
            }
        } else {
        }
    }
    iterate_all_ui32_locations_values_prev_values_prev_shifted_values_toggle_locations_1bipp(cb) {
        const ui32a_res = new Uint32Array(12);
        if (this.ta_is_32bit_divisible) {
            const {ta} = this;
            const dv = new DataView(ta.buffer, ta.byteOffset, ta.byteLength);
            if (this.is_32_divisible_bits_per_row) {
                const number_of_32bit_segments_per_32bit_divisible_row = this.number_of_32bit_segments_per_32bit_divisible_row;
                if (number_of_32bit_segments_per_32bit_divisible_row === 1) {
                    const height = this.size[1];
                    const first_x = 0, last_x = 31;
                    ui32a_res[0] = first_x;
                    ui32a_res[2] = last_x;
                    let y = 0;
                    let b = 0;
                    for (let i = 0; i < height; i++) {
                        ui32a_res[1] = y;
                        ui32a_res[3] = y;
                        const ui32_value = dv.getUint32(b);
                        ui32a_res[5] = ui32_value;
                        cb(ui32a_res);
                        y++;
                        b+=4;
                    }
                } else if (number_of_32bit_segments_per_32bit_divisible_row === 2) {
                    const height = this.size[1];
                    const number_of_32bit_segments = height * number_of_32bit_segments_per_32bit_divisible_row;
                    let even = true;
                    let y = 0;
                    let b = 0;
                    let first_x = 0, last_x = 63;
                    let ui32_prev_value = 0;
                    for (let i = 0; i < number_of_32bit_segments; i++) {
                        ui32a_res[0] = first_x;
                        ui32a_res[1] = y;
                        ui32a_res[2] = last_x;
                        ui32a_res[3] = y;
                        const ui32_value = dv.getUint32(b);
                        ui32a_res[4] = ui32_prev_value;
                        ui32a_res[5] = ui32_value;
                        cb(ui32a_res);
                        if (!even) {
                            y++;
                            first_x = 0; last_x = 31;
                        } else {
                            first_x = 32; last_x = 63;
                        }
                        even = !even;
                        b+=4;
                        ui32_prev_value = ui32_value;
                    }
                } else {
                    const height = this.size[1];
                    const number_of_32bit_segments = height * number_of_32bit_segments_per_32bit_divisible_row;
                    let y = 0;
                    let first_x = 0, last_x = 31;
                    let i_row_segment = 0;
                    let b = 0;
                    let ui32_prev_value = 0;
                    for (let i = 0; i < number_of_32bit_segments; i++) {
                        ui32a_res[0] = first_x;
                        ui32a_res[1] = y;
                        ui32a_res[2] = last_x;
                        ui32a_res[3] = y;
                        const ui32_value = dv.getUint32(b);
                        ui32a_res[4] = ui32_prev_value;
                        ui32a_res[5] = ui32_value;
                        if (first_x === 0) {
                            ui32a_res[6] = 0;
                        } else {
                            ui32a_res[6] = ui32_prev_value << 31;
                        }
                        ui32a_res[7] = ui32_value >>> 1;
                        ui32a_res[8] = ui32a_res[6] | ui32a_res[7];
                        ui32a_res[9] = ui32_value ^ ui32a_res[8];
                        cb(ui32a_res);
                        i_row_segment++;
                        if (i_row_segment < number_of_32bit_segments_per_32bit_divisible_row) {
                            first_x += 32;
                            last_x += 32;
                        } else {
                            i_row_segment = 0;
                            y++;
                            first_x = 0; last_x = 31;
                        }
                        b+=4;
                        ui32_prev_value = ui32_value;
                    }
                }
            } else {
            }
        } else {
        }
    }
    iterate_all_ui64_locations_1bipp(cb) {
        const ui32a_px_range = new Uint32Array(4);
        if (this.ta_is_64bit_divisible) {
            if (this.is_64_divisible_bits_per_row) {
                const number_of_64bit_segments_per_64bit_divisible_row = this.number_of_64bit_segments_per_64bit_divisible_row;
                if (number_of_64bit_segments_per_64bit_divisible_row === 1) {
                    const height = this.size[1];
                    const first_x = 0, last_x = 63;
                    ui32a_px_range[0] = first_x;
                    ui32a_px_range[2] = last_x;
                    let y = 0;
                    for (let i = 0; i < height; i++) {
                        ui32a_px_range[1] = y;
                        ui32a_px_range[3] = y;
                        cb(ui32a_px_range);
                        y++;
                    }
                } else if (number_of_64bit_segments_per_64bit_divisible_row === 2) {
                    const height = this.size[1];
                    const number_of_64bit_segments = height * number_of_64bit_segments_per_64bit_divisible_row;
                    let even = true;
                    let y = 0;
                    let first_x = 0, last_x = 63;
                    for (let i = 0; i < number_of_64bit_segments; i++) {
                        ui32a_px_range[0] = first_x;
                        ui32a_px_range[1] = y;
                        ui32a_px_range[2] = last_x;
                        ui32a_px_range[3] = y;
                        cb(ui32a_px_range);
                        if (!even) {
                            y++;
                            first_x = 0; last_x = 63;
                        } else {
                            first_x = 64; last_x = 127;
                        }
                        even = !even;
                    }
                } else {
                    const height = this.size[1];
                    const number_of_64bit_segments = height * number_of_64bit_segments_per_64bit_divisible_row;
                    let y = 0;
                    let first_x = 0, last_x = 63;
                    let i_row_segment = 0;
                    for (let i = 0; i < number_of_64bit_segments; i++) {
                        ui32a_px_range[0] = first_x;
                        ui32a_px_range[1] = y;
                        ui32a_px_range[2] = last_x;
                        ui32a_px_range[3] = y;
                        cb(ui32a_px_range);
                        i_row_segment++;
                        if (i_row_segment < number_of_64bit_segments_per_64bit_divisible_row) {
                            first_x += 64;
                            last_x += 64;
                        } else {
                            i_row_segment = 0;
                            y++;
                            first_x = 0; last_x = 63;
                        }
                    }
                }
            } else {
            }
        } else {
        }
    }
    iterate_all_ui64_values_1bipp() {
    }
    iterate_1bipp_wrapping_x_span_color_toggles(cb) {
        const {ta} = this;
        const r1shifted_ta = right_shift_32bit_with_carry(ta);
        const xored_against_orig = xor_typed_arrays(ta, r1shifted_ta);
        each_1_index(xored_against_orig, cb);
    }
    count_1bipp_wrapping_x_span_color_toggles() {
        const {ta} = this;
        const r1shifted_ta = right_shift_32bit_with_carry(ta);
        const xored_against_orig = xor_typed_arrays(ta, r1shifted_ta);
        return count_1s(xored_against_orig);
    }
    'place_image_from_pixel_buffer'(pixel_buffer, dest_pos, options = {}) {
        const {bipp} = this;
        const dest_buffer = this.buffer;
        const source_buffer = pixel_buffer.buffer;
        if (bipp === 32 && pixel_buffer.bits_per_pixel === 32) {
            const dest_w = this.size[0];
            const dest_h = this.size[1];
            const dest_buffer_line_length = dest_w * 4;
            const source_w = pixel_buffer.size[0];
            const source_h = pixel_buffer.size[1];
            const source_buffer_line_length = source_w * 4;
            let source_buffer_line_start_pos, source_buffer_line_end_pos, dest_buffer_subline_start_pos, dest_buffer_start_offset;
            dest_buffer_start_offset = dest_pos[0] * 4;
            for (var y = 0; y < source_h; y++) {
                source_buffer_line_start_pos = y * source_buffer_line_length;
                source_buffer_line_end_pos = source_buffer_line_start_pos + source_buffer_line_length;
                dest_buffer_subline_start_pos = (y + dest_pos[1]) * dest_buffer_line_length;
                source_buffer.copy(dest_buffer, dest_buffer_subline_start_pos + dest_buffer_start_offset, source_buffer_line_start_pos, source_buffer_line_end_pos);
            }
        } else if (bipp === 1) {
            if (pixel_buffer.bipp === 1) {
                if (options.or === true) {
                    return this.draw_1bipp_pixel_buffer_mask_1bipp(pixel_buffer, dest_pos);
                } else {
                    const pb_source = pixel_buffer;
                    const ta_pos = new Int16Array(2);
                    const ta_px_value = new Uint8ClampedArray(3);
                    const ta_info = new Uint32Array(4);
                    const px_dest_pos = new Uint16Array(2);
                    pb_source.each_ta_1bipp(ta_pos, ta_px_value, ta_info, (color, pos) => {
                        px_dest_pos[0] = pos[0] + dest_pos[0];
                        px_dest_pos[1] = pos[1] + dest_pos[1];
                        this.set_pixel(px_dest_pos, color);
                    })
                }
            } else {
                console.trace();
                throw 'must have matching bipp values (expected: 1)';
            }
        } else {
            console.trace();
            console.log('[pixel_buffer, dest_pos, options]', [pixel_buffer, dest_pos, options]);
            throw 'not currently supported';
        }
    }
    draw_filled_polygon_to_1bipp_pixel_buffer_mask(arr_points) {
        if (arr_points.length >= 2) {
            const bb_points = get_points_bounding_box(arr_points);
            const offset = bb_points[0];
            const polygon_size = [
                [bb_points[1][0] - bb_points[0][0] + 1],
                [bb_points[1][1] - bb_points[0][1] + 1]
            ];
            if (polygon_size[0] === 1 && polygon_size[1] === 1 ) {
                const pb_polygon = new this.constructor({
                    'bits_per_pixel': 1,
                    'size': polygon_size
                });
                pb_polygon.ta[0] = 128;
                pb_polygon.__offset = offset;
                return pb_polygon;
            } else if (polygon_size[0] === 2 && polygon_size[1] === 1 || polygon_size[0] === 1 && polygon_size[1] === 2) {
                const pb_polygon = new this.constructor({
                    'bits_per_pixel': 1,
                    'size': polygon_size
                });
                pb_polygon.ta[0] = 192;
                pb_polygon.__offset = offset;
                return pb_polygon;
            } else {
                const pb_polygon = new this.constructor({
                    'bits_per_pixel': 1,
                    'size': polygon_size
                });
                const down_offsetted_points = arr_points.map(point => [point[0] - offset[0], point[1] - offset[1]]);
                pb_polygon.draw_polygon(down_offsetted_points, 1, false);
                pb_polygon.flood_fill_inner_pixels_off_to_on_1bipp();
                pb_polygon.__offset = offset;
                return pb_polygon;
            }
        } else if (arr_points.length === 1) {
            const pb_polygon = new this.constructor({
                'bits_per_pixel': 1,
                'size': polygon_size
            });
            pb_polygon.ta[0] = 128;
            pb_polygon.__offset = offset;
            return pb_polygon;
        }
    }
    get ta2() {
        if (!this._ta2) {
            this._ta2 = new Uint8Array(this.ta.length);
        }
        return this._ta2;
    }
    apply_square_convolution(f32a_convolution) {
        return this.process((orig, res) => {
            const c_length = f32a_convolution.length;
            const dimension_size = Math.sqrt(c_length);
            const padding = (dimension_size - 1) / 2;
            let x, y, pos = 0,
                ii, i;
            const bpp = this.bytes_per_pixel;
            const bpr = this.bytes_per_row;
            const idx_movement_vectors = get_idx_movement_vectors(f32a_convolution, bpp, bpr);
            let cr, cg, cb, ca;
            const buf = this.buffer;
            const buf_res = res.buffer;
            if (bpp === 3) {
                this.padded_each_pixel_index(padding, (px_idx) => {
                    cr = 0;
                    cg = 0;
                    cb = 0;
                    for (ii = 0; ii < c_length; ii++) {
                        i = px_idx + idx_movement_vectors[ii];
                        cr += f32a_convolution[ii] * buf[i++];
                        cg += f32a_convolution[ii] * buf[i++];
                        cb += f32a_convolution[ii] * buf[i++];
                    }
                    if (cr < 0) cr = 0;
                    if (cg < 0) cg = 0;
                    if (cb < 0) cb = 0;
                    if (cr > 255) cr = 255;
                    if (cg > 255) cg = 255;
                    if (cb > 255) cb = 255;
                    buf_res[px_idx++] = Math.round(cr);
                    buf_res[px_idx++] = Math.round(cg);
                    buf_res[px_idx++] = Math.round(cb);
                });
            } else if (bpp === 4) {
                this.padded_each_pixel_index(padding, (px_idx) => {
                    cr = 0;
                    cg = 0;
                    cb = 0;
                    for (ii = 0; ii < c_length; ii++) {
                        i = px_idx + idx_movement_vectors[ii];
                        cr += f32a_convolution[ii] * buf[i++];
                        cg += f32a_convolution[ii] * buf[i++];
                        cb += f32a_convolution[ii] * buf[i++];
                    }
                    ca = 255;
                    if (cr < 0) cr = 0;
                    if (cg < 0) cg = 0;
                    if (cb < 0) cb = 0;
                    if (cr > 255) cr = 255;
                    if (cg > 255) cg = 255;
                    if (cb > 255) cb = 255;
                    buf_res[px_idx++] = Math.round(cr);
                    buf_res[px_idx++] = Math.round(cg);
                    buf_res[px_idx++] = Math.round(cb);
                    buf_res[px_idx++] = Math.round(ca);
                });
            } else {
                throw 'NYI';
            }
            return res;
        })
    }
    extract_channel(i_channel) {
        const bypp = this.bytes_per_pixel;
        const ta = this.ta;
        let i_byte = i_channel;
        let i_px = 0;
        const l = ta.length;
        if (bypp === 3 || bypp === 4) {
            const res_channel_ta = new this.constructor({
                size: this.size,
                bits_per_pixel: 8
            })
            while (i_byte < l) {
                res_channel_ta.set_pixel_by_idx(i_px, ta[i_byte]);
                i_byte += bypp;
                i_px++;
            }
            return res_channel_ta;
        } else {
            console.trace();
            throw 'NYI';
        }
    }
    _custom_convolve(dimension_size, cb) {
        if (dimension_size % 2 !== 1) {
            throw 'dimension_size must be an odd integer';
        }
        const px = new Uint16Array(2);
        const ta16 = new Int16Array(12);
        [ta16[2], ta16[3]] = this.size;
        ta16[4] = this.bytes_per_pixel;
        ta16[5] = ta16[2] * ta16[4] 
        ta16[8] = dimension_size;
        ta16[9] = (ta16[8] - 1) / 2 
        ta16[10] = 0; 
        ta16[11] = ta16[8] * ta16[4];
        let ta32 = new Uint32Array(4);
        ta32[0] = 0; 
        ta32[1] = 0; 
        ta32[2] = ta16[2] * ta16[3] * ta16[4] 
        let conv_pixels = new Uint8Array(ta16[8] * ta16[8] * ta16[8]);
        const buffer = this.buffer;
        for (px[1] = 0; px[1] < ta16[3]; px[1]++) {
            for (px[0] = 0; px[0] < ta16[2]; px[0]++) {
                ta16[6] = px[0] - ta16[8];
                if (ta16[6] > 0 && ta16[6] < ta16[2] - ta16[8]) {
                    ta16[7] = px[1] - ta16[8];
                    if (ta16[7] > 0 && ta16[7] < ta16[3] - ta16[8]) {
                        ta32[1] = ta32[0] -  ta16[9] * ta16[4] -  ta16[9] * ta16[5];
                        ta16[10] = 0;
                        for (ta16[7] = ta16[1]; ta16[7] < ta16[1] + ta16[8]; ta16[7]++) {
                            let sl = buffer.slice(ta32[1], ta32[1] + ta16[11]);
                            for (let c = 0; c < ta16[11]; c++) {
                                conv_pixels[ta16[10] + c] = sl.readUInt8(c);
                            }
                            ta16[10] += ta16[11];
                            ta32[1] += ta16[5];
                        }
                        cb(px, conv_pixels);
                    }
                }
                ta32[0] += ta16[4];
            }
        }
    }
    get_first_pixel_matching_color(r, g, b, a) {
        let px = 0,
            py = 0;
        let [w, h] = this.size;
        let found = false;
        let buf = this.buffer;
        let pos_buf = 0;
        for (py = 0; !found && py < h; py++) {
            for (px = 0; !found && px < w; px++) {
                if (buf[pos_buf] === r && buf[pos_buf + 1] === g && buf[pos_buf + 2] === b && buf[pos_buf + 3] === a) {
                    found = true;
                }
                pos_buf += 4;
            }
        }
        if (found) {
            return [px, py];
        }
    }
    'flood_fill_small_color_blocks'(max_size, r, g, b, a) {
        this.each_pixel((x, y, pr, pg, pb, pa) => {
            if ((r !== pr || g !== pg || b !== pb || a !== pa)) {
                let s = this.measure_color_region_size(x, y, max_size);
                if (s < max_size) {
                    this.flood_fill(x, y, r, g, b, a);
                }
            }
        })
    }
    self_replace_color(target_color, replacement_color) {
        const bpp = this.bytes_per_pixel;
        const buf = this.buffer;
        const l = buf.length;
        if (bpp === 1) {
            for (let c = 0; c < l; c++) {
                if (buf[c] === target_color) buf[c] = replacement_color;
            }
        } else {
            throw 'NYI';
        }
        return this;
    }
    '_replace_color'(r, g, b, a, tr, tg, tb, ta) {
        const buf_read = this.buffer;
        let ta_u8 = new Uint8Array(8);
        ta_u8[0] = r;
        ta_u8[1] = g;
        ta_u8[2] = b;
        ta_u8[3] = a;
        ta_u8[4] = tr;
        ta_u8[5] = tg;
        ta_u8[6] = tb;
        ta_u8[7] = ta;
        const ta_16_scratch = new Uint32Array(8);
        ta_16_scratch[0] = 0; 
        ta_16_scratch[2] = buf_read.length;
        while (ta_16_scratch[0] < ta_16_scratch[2]) {
            if (buf_read[ta_16_scratch[0]] === ta_u8[0] && buf_read[ta_16_scratch[0] + 1] === ta_u8[1] && buf_read[ta_16_scratch[0] + 2] === ta_u8[2] && buf_read[ta_16_scratch[0] + 3] === ta_u8[3]) {
                buf_read[ta_16_scratch[0]] = ta_u8[4];
                buf_read[ta_16_scratch[0] + 1] = ta_u8[5];
                buf_read[ta_16_scratch[0] + 2] = ta_u8[6];
                buf_read[ta_16_scratch[0] + 3] = ta_u8[7];
            } else {
            }
            ta_16_scratch[0] += 4;
        }
    }
    '__get_single_color_mask_32'(r, g, b, a) {
        var res = new this.constructor({
            'size': this.size,
            'bits_per_pixel': 32
        });
        res.buffer.fill(0);
        const buf_read = this.buffer;
        const buf_write = res.buffer;
        const ta_16_scratch = new Uint32Array(8);
        ta_16_scratch[0] = 0; 
        ta_16_scratch[1] = 0; 
        ta_16_scratch[2] = buf_read.length;
        ta_16_scratch[3] = buf_write.length;
        let ta_u8 = new Uint8Array(4);
        ta_u8[0] = r;
        ta_u8[1] = g;
        ta_u8[2] = b;
        ta_u8[3] = a;
        while (ta_16_scratch[0] < ta_16_scratch[2]) {
            if (buf_read[ta_16_scratch[0]] === ta_u8[0] && buf_read[ta_16_scratch[0] + 1] === ta_u8[1] && buf_read[ta_16_scratch[0] + 2] === ta_u8[2] && buf_read[ta_16_scratch[0] + 3] === ta_u8[3]) {
                buf_write[ta_16_scratch[1]++] = 0;
                buf_write[ta_16_scratch[1]++] = 0;
                buf_write[ta_16_scratch[1]++] = 0;
                buf_write[ta_16_scratch[1]++] = 255;
            } else {
                buf_write[ta_16_scratch[1]++] = 255;
                buf_write[ta_16_scratch[1]++] = 255;
                buf_write[ta_16_scratch[1]++] = 255;
                buf_write[ta_16_scratch[1]++] = 255;
            }
            ta_16_scratch[0] += 4;
        }
        return res;
    }
    count_pixels_with_color(...args) {
        const {bipp} = this;
        if (bipp === 32) {
            const [r, g, b, a] = args;
            const buf_read = this.buffer;
            const scratch_32 = new Uint32Array(5);
            scratch_32[0] = 0; 
            scratch_32[2] = buf_read.length;
            scratch_32[4] = 0;
            const ta_16_scratch = new Uint16Array(8);
            let ta_u8 = new Uint8Array(4);
            ta_u8[0] = r;
            ta_u8[1] = g;
            ta_u8[2] = b;
            ta_u8[3] = a;
            while (scratch_32[0] < scratch_32[2]) {
                if (buf_read[scratch_32[0]++] === ta_u8[0] && buf_read[scratch_32[0]++] === ta_u8[1] && buf_read[scratch_32[0]++] === ta_u8[2] && buf_read[scratch_32[0]++] === ta_u8[3]) {
                    scratch_32[4]++;
                }
            }
            return scratch_32[4];
        } else {
            return super.count_pixels_with_color(...args);
        }
    }
    '__get_single_color_mask'(r, g, b, a) {
        var res = new this.constructor({
            'size': this.size,
            'bits_per_pixel': 8
        });
        res.buffer.fill(0);
        const buf_read = this.buffer;
        const buf_write = res.buffer;
        const ta_16_scratch = new Uint16Array(8);
        ta_16_scratch[0] = 0; 
        ta_16_scratch[1] = 0; 
        ta_16_scratch[2] = buf_read.length;
        ta_16_scratch[3] = buf_write.length;
        let ta_u8 = new Uint8Array(4);
        ta_u8[0] = r;
        ta_u8[1] = g;
        ta_u8[2] = b;
        ta_u8[3] = a;
        while (ta_16_scratch[0] < ta_16_scratch[2]) {
            if (buf_read[ta_16_scratch[0]++] === ta_u8[0] && buf_read[ta_16_scratch[0]++] === ta_u8[1] && buf_read[ta_16_scratch[0]++] === ta_u8[2] && buf_read[ta_16_scratch[0]++] === ta_u8[3]) {
                buf_write[ta_16_scratch[1]] = 255;
            }
            ta_16_scratch[1]++;
        }
        return res;
    }
    'measure_color_region_size'(x, y, max) {
        const buffer = this.buffer;
        if (this.bytes_per_pixel === 4) {
            const scratch_32 = new Uint32Array(16);
            scratch_32[0] = this.size[0]; 
            scratch_32[1] = this.size[1]; 
            scratch_32[2] = scratch_32[0] * scratch_32[1];
            scratch_32[3] = this.bytes_per_pixel;
            scratch_32[6] = 0 
            scratch_32[7] = 0 
            scratch_32[8] = 0 
            scratch_32[9] = max;
            const ta8_pixels = new Uint8Array(12);
            scratch_32[10] = 0 
            const ta16_pixels = new Uint8Array(4);
            const ta_pixels_visited = new Uint8Array(scratch_32[2]);
            const ta_visiting_pixels = new Uint16Array(scratch_32[2] * 2);
            scratch_32[8] = scratch_32[3] * (x + (y * scratch_32[0]));
            ta8_pixels[0] = buffer[scratch_32[8]++];
            ta8_pixels[1] = buffer[scratch_32[8]++];
            ta8_pixels[2] = buffer[scratch_32[8]++];
            ta8_pixels[3] = buffer[scratch_32[8]++];
            ta_visiting_pixels[0] = x;
            ta_visiting_pixels[1] = y;
            scratch_32[7] = 2;
            while (scratch_32[6] < scratch_32[7] && scratch_32[10] < scratch_32[9]) {
                scratch_32[4] = ta_visiting_pixels[scratch_32[6]++]; 
                scratch_32[5] = ta_visiting_pixels[scratch_32[6]++]; 
                scratch_32[8] = scratch_32[3] * (scratch_32[4] + (scratch_32[5] * scratch_32[0]));
                ta8_pixels[4] = buffer[scratch_32[8]++];
                ta8_pixels[5] = buffer[scratch_32[8]++];
                ta8_pixels[6] = buffer[scratch_32[8]++];
                ta8_pixels[7] = buffer[scratch_32[8]++];
                ta16_pixels[0] = ta8_pixels[4] - ta8_pixels[0];
                ta16_pixels[1] = ta8_pixels[5] - ta8_pixels[1];
                ta16_pixels[2] = ta8_pixels[6] - ta8_pixels[2];
                ta16_pixels[3] = ta8_pixels[7] - ta8_pixels[3];
                if (ta16_pixels[0] === 0 && ta16_pixels[1] === 0 && ta16_pixels[2] === 0 && ta16_pixels[3] === 0) {
                    if (scratch_32[4] - 1 >= 0 && scratch_32[4] - 1 < scratch_32[0] && ta_pixels_visited[scratch_32[4] - 1 + (scratch_32[0] * scratch_32[5])] === 0) {
                        ta_visiting_pixels[scratch_32[7]++] = scratch_32[4] - 1;
                        ta_visiting_pixels[scratch_32[7]++] = scratch_32[5];
                        ta_pixels_visited[scratch_32[4] - 1 + (scratch_32[0] * scratch_32[5])] = 255;
                    }
                    if (scratch_32[5] - 1 >= 0 && scratch_32[5] - 1 < scratch_32[1] && ta_pixels_visited[scratch_32[4] + (scratch_32[0] * (scratch_32[5] - 1))] === 0) {
                        ta_visiting_pixels[scratch_32[7]++] = scratch_32[4];
                        ta_visiting_pixels[scratch_32[7]++] = scratch_32[5] - 1;
                        ta_pixels_visited[scratch_32[4] + (scratch_32[0] * (scratch_32[5] - 1))] = 255;
                    }
                    if (scratch_32[4] + 1 >= 0 && scratch_32[4] + 1 < scratch_32[0] && ta_pixels_visited[scratch_32[4] + 1 + (scratch_32[0] * scratch_32[5])] === 0) {
                        ta_visiting_pixels[scratch_32[7]++] = scratch_32[4] + 1;
                        ta_visiting_pixels[scratch_32[7]++] = scratch_32[5];
                        ta_pixels_visited[scratch_32[4] + 1 + (scratch_32[0] * scratch_32[5])] = 255
                    }
                    if (scratch_32[5] + 1 >= 0 && scratch_32[5] + 1 < scratch_32[1] && ta_pixels_visited[scratch_32[4] + (scratch_32[0] * (scratch_32[5] + 1))] === 0) {
                        ta_visiting_pixels[scratch_32[7]++] = scratch_32[4];
                        ta_visiting_pixels[scratch_32[7]++] = scratch_32[5] + 1;
                        ta_pixels_visited[scratch_32[4] + (scratch_32[0] * (scratch_32[5] + 1))] = 255
                    }
                }
                scratch_32[10]++;
            }
            return scratch_32[10];
        } else if (this.bytes_per_pixel === 1) {
            return (() => {
                const scratch_32 = new Uint32Array(16);
                scratch_32[0] = this.size[0]; 
                scratch_32[1] = this.size[1]; 
                scratch_32[2] = scratch_32[0] * scratch_32[1];
                scratch_32[3] = this.bytes_per_pixel;
                scratch_32[6] = 0 
                scratch_32[7] = 0 
                scratch_32[8] = 0 
                scratch_32[9] = max;
                const ta8_pixels = new Uint8Array(12);
                scratch_32[10] = 0 
                const ta16_pixels = new Uint8Array(4);
                const ta_pixels_visited = new Uint8Array(scratch_32[2]);
                const ta_visiting_pixels = new Uint16Array(scratch_32[2] * 2);
                scratch_32[8] = scratch_32[3] * (x + (y * scratch_32[0]));
                ta8_pixels[0] = buffer[scratch_32[8]++];
                ta_visiting_pixels[0] = x;
                ta_visiting_pixels[1] = y;
                scratch_32[7] = 2;
                while (scratch_32[6] < scratch_32[7] && scratch_32[10] < scratch_32[9]) {
                    scratch_32[4] = ta_visiting_pixels[scratch_32[6]++]; 
                    scratch_32[5] = ta_visiting_pixels[scratch_32[6]++]; 
                    scratch_32[8] = scratch_32[3] * (scratch_32[4] + (scratch_32[5] * scratch_32[0]));
                    ta8_pixels[4] = buffer[scratch_32[8]++];
                    ta16_pixels[0] = ta8_pixels[4] - ta8_pixels[0];
                    if (ta16_pixels[0] === 0) {
                        if (scratch_32[4] - 1 >= 0 && scratch_32[4] - 1 < scratch_32[0] && ta_pixels_visited[scratch_32[4] - 1 + (scratch_32[0] * scratch_32[5])] === 0) {
                            ta_visiting_pixels[scratch_32[7]++] = scratch_32[4] - 1;
                            ta_visiting_pixels[scratch_32[7]++] = scratch_32[5];
                            ta_pixels_visited[scratch_32[4] - 1 + (scratch_32[0] * scratch_32[5])] = 255;
                        }
                        if (scratch_32[5] - 1 >= 0 && scratch_32[5] - 1 < scratch_32[1] && ta_pixels_visited[scratch_32[4] + (scratch_32[0] * (scratch_32[5] - 1))] === 0) {
                            ta_visiting_pixels[scratch_32[7]++] = scratch_32[4];
                            ta_visiting_pixels[scratch_32[7]++] = scratch_32[5] - 1;
                            ta_pixels_visited[scratch_32[4] + (scratch_32[0] * (scratch_32[5] - 1))] = 255;
                        }
                        if (scratch_32[4] + 1 >= 0 && scratch_32[4] + 1 < scratch_32[0] && ta_pixels_visited[scratch_32[4] + 1 + (scratch_32[0] * scratch_32[5])] === 0) {
                            ta_visiting_pixels[scratch_32[7]++] = scratch_32[4] + 1;
                            ta_visiting_pixels[scratch_32[7]++] = scratch_32[5];
                            ta_pixels_visited[scratch_32[4] + 1 + (scratch_32[0] * scratch_32[5])] = 255
                        }
                        if (scratch_32[5] + 1 >= 0 && scratch_32[5] + 1 < scratch_32[1] && ta_pixels_visited[scratch_32[4] + (scratch_32[0] * (scratch_32[5] + 1))] === 0) {
                            ta_visiting_pixels[scratch_32[7]++] = scratch_32[4];
                            ta_visiting_pixels[scratch_32[7]++] = scratch_32[5] + 1;
                            ta_pixels_visited[scratch_32[4] + (scratch_32[0] * (scratch_32[5] + 1))] = 255
                        }
                    }
                    scratch_32[10]++;
                }
                return scratch_32[10];
            })();
        } else {
            throw 'unsuppored bytes_per_pixel ' + this.bytes_per_pixel
        }
    }
    'get_pixel_pos_list_of_pixels_with_color'(color) {
        let res = new Pixel_Pos_List();
        if (this.pos) {
            console.log('this.pos', this.pos);
            this.each_pixel_ta((pos, px_color) => {
                if (px_color === color) {
                    res.add(new Uint16Array([pos[0] + this.pos[0], pos[1] + this.pos[1]]));
                }
            });
            res.pos = this.pos;
        } else {
            this.each_pixel_ta((pos, px_color) => {
                if (px_color === color) {
                    res.add(pos);
                }
            });
        }
        res.fix();
        return res;
    }
    'get_ppl_color_region'(pos) {
        console.trace();
        throw 'NYI';
    }
    'flood_fill_self_get_pixel_pos_list'(pos, color) {
        const size = this.size;
        if (!(pos instanceof Uint16Array || pos instanceof Uint32Array)) {
            throw 'Wrong pos data type, pos ' + pos;
        }
        if (this.bytes_per_pixel === 4) {
            throw 'NYI'
        } else if (this.bytes_per_pixel === 1) {
            const using_ta_pixels_visited = () => {
                const res = new Pixel_Pos_List();
                const buffer = this.buffer;
                const scratch_32 = new Uint32Array(10);
                scratch_32[0] = this.size[0]; 
                scratch_32[1] = this.size[1]; 
                const size = scratch_32;
                scratch_32[2] = size[0] * size[1];
                scratch_32[3] = this.bytes_per_pixel;
                let cpos = pos.slice();
                scratch_32[6] = 0 
                scratch_32[7] = 0 
                scratch_32[8] = 0 
                scratch_32[9] = 0 
                const obj_pixels_visited = {};
                const ppl_visiting_pixels = new Pixel_Pos_List();
                const ta_visiting_pixels = ppl_visiting_pixels.ta;
                let ccolor;
                scratch_32[8] = scratch_32[3] * (cpos[0] + (cpos[1] * size[0]));
                ccolor = buffer[scratch_32[8]++];
                ppl_visiting_pixels.add(cpos);
                scratch_32[7] = 2;
                while (scratch_32[9] <= scratch_32[2]) {
                    console.log('scratch_32[9]', scratch_32[9]);
                    console.log('scratch_32[2]', scratch_32[2]);
                    cpos[0] = ta_visiting_pixels[scratch_32[6]++];
                    cpos[1] = ta_visiting_pixels[scratch_32[6]++];
                    scratch_32[8] = scratch_32[3] * (cpos[0] + (cpos[1] * size[0]));
                    if (buffer[scratch_32[8]++] - ccolor === 0) {
                        buffer[scratch_32[8] - 1] = color;
                        res.add(cpos);
                        if (cpos[0] - 1 >= 0 && !obj_pixels_visited[cpos[0] - 1 + (size[0] * cpos[1])]) {
                            ppl_visiting_pixels.add(new Uint16Array([cpos[0] - 1, cpos[1]]));
                            scratch_32[7] += 2;
                            obj_pixels_visited[cpos[0] - 1 + (size[0] * cpos[1])] = true;
                        }
                        if (cpos[1] - 1 >= 0 && !obj_pixels_visited[cpos[0] + (size[0] * (cpos[1] - 1))]) {
                            ppl_visiting_pixels.add(new Uint16Array([cpos[0], cpos[1] - 1]));
                            scratch_32[7] += 2;
                            obj_pixels_visited[cpos[0] + (size[0] * (cpos[1] - 1))] = true;
                        }
                        if (cpos[0] + 1 < size[0] && !obj_pixels_visited[cpos[0] + 1 + (size[0] * cpos[1])]) {
                            ppl_visiting_pixels.add(new Uint16Array([cpos[0] + 1, cpos[1]]));
                            scratch_32[7] += 2;
                            obj_pixels_visited[cpos[0] + 1 + (size[0] * cpos[1])] = true;
                        }
                        if (cpos[1] + 1 < size[1] && !obj_pixels_visited[cpos[0] + (size[0] * (cpos[1] + 1))]) {
                            ppl_visiting_pixels.add(new Uint16Array([cpos[0], cpos[1] + 1]));
                            scratch_32[7] += 2;
                            obj_pixels_visited[cpos[0] + (size[0] * (cpos[1] + 1))] = true;
                        }
                    }
                    scratch_32[9]++;
                }
                res.fix();
                return res;
            }
            return using_ta_pixels_visited();
        } else {
            console.trace();
            throw 'NYI';
        }
    }
    'flood_fill_c1_1bipp'(pos) {
        const target_color = this.get_pixel_1bipp(pos);
        let [x, y] = pos;
        if (target_color === 1) {
            return 0;
        } else {
            const ta_stack_fn_calls_inlined_8bipp_visited_matrix_implementation = () => {
                let stack_capacity = 1024 * 1024 * 16; 
                let ta_stack = new Uint16Array(stack_capacity);
                let i_stack_pos = 0;
                let stack_length = 0;
                let px_color;
                let ta_pos = new Uint16Array(2);
                let ta_pos2 = new Uint16Array(2);
                ta_pos[0] = pos[0];
                ta_pos[1] = pos[1];
                if (i_stack_pos < stack_capacity) {
                    ta_stack[i_stack_pos++] = ta_pos[0];
                    ta_stack[i_stack_pos++] = ta_pos[1];
                    stack_length++;
                } else {
                    console.log('stack_length', stack_length);
                    console.log('i_stack_pos', i_stack_pos);
                    console.trace();
                    throw 'NYI - stack exceeded capacity';
                }
                const [width, height] = this.size;
                const ta_already_visited = new Uint8Array(width * height);
                while (stack_length > 0) {
                    ta_pos[0] = ta_stack[i_stack_pos - 2];
                    ta_pos[1] = ta_stack[i_stack_pos - 1];
                    i_stack_pos -= 2;
                    stack_length--;
                    if (i_stack_pos >= stack_capacity - 8) {
                        throw 'Not enough stack for positions yet to visit';
                    }
                    px_color = this.get_pixel_1bipp(ta_pos); 
                    if (px_color === target_color) {
                        this.set_pixel_on_1bipp(ta_pos);
                        if (ta_pos[0] > 0) {
                            ta_pos2[0] = ta_pos[0] - 1;
                            ta_pos2[1] = ta_pos[1];
                            if (ta_already_visited[width * ta_pos2[1] + ta_pos2[0]] === 0) {
                                ta_stack[i_stack_pos++] = ta_pos2[0];
                                ta_stack[i_stack_pos++] = ta_pos2[1];
                                stack_length++;
                            };
                        }
                        if (ta_pos[0] < width - 1) {
                            ta_pos2[0] = ta_pos[0] + 1;
                            ta_pos2[1] = ta_pos[1];
                            if (ta_already_visited[width * ta_pos2[1] + ta_pos2[0]] === 0) {
                                ta_stack[i_stack_pos++] = ta_pos2[0];
                                ta_stack[i_stack_pos++] = ta_pos2[1];
                                stack_length++;
                            };
                        }
                        if (ta_pos[1] > 0) {
                            ta_pos2[0] = ta_pos[0];
                            ta_pos2[1] = ta_pos[1] - 1;
                            if (ta_already_visited[width * ta_pos2[1] + ta_pos2[0]] === 0) {
                                ta_stack[i_stack_pos++] = ta_pos2[0];
                                ta_stack[i_stack_pos++] = ta_pos2[1];
                                stack_length++;
                            };
                        }
                        if (ta_pos[1] < height - 1) {
                            ta_pos2[0] = ta_pos[0];
                            ta_pos2[1] = ta_pos[1] + 1;
                            if (ta_already_visited[width * ta_pos2[1] + ta_pos2[0]] === 0) {
                                ta_stack[i_stack_pos++] = ta_pos2[0];
                                ta_stack[i_stack_pos++] = ta_pos2[1];
                                stack_length++;
                            };
                        }
                        ta_already_visited[width * ta_pos[1] + ta_pos[0]] = 255
                    }
                }
            }
            const horizontal_line_filling_stack_to_visit_store_already_visited_implementation = () => {
                const {ta, size} = this;
                const aa_x_off_spans = this.calculate_arr_rows_arr_x_off_spans_1bipp();
                console.log('aa_x_off_spans', aa_x_off_spans);
                const find_connected_x_off_spans_below = (y, idx_x_off_span) => {
                    const res = [];
                    if (y < aa_x_off_spans.length - 1) {
                        const span1 = aa_x_off_spans[y][idx_x_off_span];
                        console.log('');
                        console.log('span1', span1);
                        const y_below = aa_x_off_spans[y + 1];
                        console.log('y_below', y_below);
                        const l_y_below = y_below.length;
                        for (let i_below = 0; i_below < l_y_below; i_below++) {
                            const range_below = y_below[i_below];
                            const has_overlap = range_below[0] >= span1[0] && range_below[0] <= span1[1] || range_below[1] >= span1[0] && range_below[1] <= span1[1];
                            console.log('range_below', range_below);
                            console.log('has_overlap', has_overlap);
                            if (has_overlap) {
                                res.push(range_below);
                            }
                        }
                    }
                    return res;
                }
                for (let y = 0; y < aa_x_off_spans.length; y++) {
                    const arr_row_x_off_spans = aa_x_off_spans[y];
                    for (let idx_x_off_span = 0; idx_x_off_span < arr_row_x_off_spans.length; idx_x_off_span++) {
                        const x_off_span = arr_row_x_off_spans[idx_x_off_span];
                        const path_xos = [y, idx_x_off_span];
                        console.log('path_xos', path_xos);
                        const spans_connected_below = find_connected_x_off_spans_below(y, idx_x_off_span);
                        console.log('spans_connected_below', spans_connected_below);
                    }
                }
                const old = () => {
                    const calculate_1bipp_row_arr_x_spans_off = y => {
                        const res = [];
                        const width = this.size[0];
                        let last_color = 0;
                        let current_color;
                        let ta_pos = new Uint16Array(2);
                        ta_pos[1] = y;
                        for (let x = 0; x < width; x++) {
                            ta_pos[0] = x;
                            current_color = this.get_pixel_1bipp(ta_pos);
                            if (current_color === last_color) {
                                if (res.length === 0) {
                                    res.push([0, 1]);
                                } else {
                                    res[res.length - 1][1]++;
                                }
                            } else {
                                if (res.length === 0) {
                                    res.push([0, 0]); 
                                    res.push([0, 1]);
                                } else {
                                    res.push([x, x + 1]);
                                }
                            }
                            last_color = current_color;
                        }
                        return res;
                    }
                    const row_x_off_spans = calculate_1bipp_row_arr_x_spans_off(y);
                    console.log('----------------');
                    console.log('row_x_off_spans', row_x_off_spans);
                    if (y > 0) {
                        const row_above_x_off_spans = calculate_1bipp_row_arr_x_spans_off(y - 1);
                        console.log('row_above_x_off_spans', row_above_x_off_spans);
                    }
                    if (y < this.size[1] - 1) {
                        const row_below_x_off_spans = calculate_1bipp_row_arr_x_spans_off(y + 1);
                        console.log('row_below_x_off_spans', row_below_x_off_spans);
                    }
                    console.log('----------------');
                }
            }
            return ta_stack_fn_calls_inlined_8bipp_visited_matrix_implementation();
        }
    }
    'flood_fill_1bipp'(x, y, color) {
        const new_color = color;
        const target_color = this.get_pixel_1bipp([x, y]);
        const [width, height] = this.size;
        if (target_color === new_color) {
            return 0;
        } else {
            const ta_stack_fn_calls_inlined_implementation = () => {
                let stack_capacity = 1024 * 1024 * 8; 
                let ta_stack = new Uint16Array(stack_capacity);
                let i_stack_pos = 0;
                let stack_length = 0;
                let px_color;
                let ta_pos = new Uint16Array(2);
                let ta_pos2 = new Uint16Array(2);
                ta_pos[0] = x;
                ta_pos[1] = y;
                if (i_stack_pos < stack_capacity) {
                    ta_stack[i_stack_pos++] = ta_pos[0];
                    ta_stack[i_stack_pos++] = ta_pos[1];
                    stack_length++;
                } else {
                    console.log('stack_length', stack_length);
                    console.log('i_stack_pos', i_stack_pos);
                    console.trace();
                    throw 'NYI - stack exceeded capacity';
                }
                const pb_already_visited = new Core({
                    size: this.size,
                    bits_per_pixel: 1
                })
                while (stack_length > 0) {
                        ta_pos[0] = ta_stack[i_stack_pos - 2];
                        ta_pos[1] = ta_stack[i_stack_pos - 1];
                        i_stack_pos -= 2;
                        stack_length--;
                    px_color = this.get_pixel_1bipp(ta_pos); 
                    if (px_color === target_color) {
                        this.set_pixel_1bipp(ta_pos, new_color);
                        if (ta_pos[0] > 0) {
                            ta_pos2[0] = ta_pos[0] - 1;
                            ta_pos2[1] = ta_pos[1];
                            if (pb_already_visited.get_pixel_1bipp(ta_pos2) === 0) {
                                if (i_stack_pos < stack_capacity) {
                                    ta_stack[i_stack_pos++] = ta_pos2[0];
                                    ta_stack[i_stack_pos++] = ta_pos2[1];
                                    stack_length++;
                                } else {
                                    console.log('stack_length', stack_length);
                                    console.log('i_stack_pos', i_stack_pos);
                                    console.trace();
                                    throw 'NYI - stack exceeded capacity';
                                }
                            };
                        }
                        if (ta_pos[0] < width - 1) {
                            ta_pos2[0] = ta_pos[0] + 1;
                            ta_pos2[1] = ta_pos[1];
                            if (pb_already_visited.get_pixel_1bipp(ta_pos2) === 0) {
                                if (i_stack_pos < stack_capacity) {
                                    ta_stack[i_stack_pos++] = ta_pos2[0];
                                    ta_stack[i_stack_pos++] = ta_pos2[1];
                                    stack_length++;
                                } else {
                                    console.log('stack_length', stack_length);
                                    console.log('i_stack_pos', i_stack_pos);
                                    console.trace();
                                    throw 'NYI - stack exceeded capacity';
                                }
                            };
                        }
                        if (ta_pos[1] > 0) {
                            ta_pos2[0] = ta_pos[0];
                            ta_pos2[1] = ta_pos[1] - 1;
                            if (pb_already_visited.get_pixel_1bipp(ta_pos2) === 0) {
                                if (i_stack_pos < stack_capacity) {
                                    ta_stack[i_stack_pos++] = ta_pos2[0];
                                    ta_stack[i_stack_pos++] = ta_pos2[1];
                                    stack_length++;
                                } else {
                                    console.log('stack_length', stack_length);
                                    console.log('i_stack_pos', i_stack_pos);
                                    console.trace();
                                    throw 'NYI - stack exceeded capacity';
                                }
                            };
                        }
                        if (ta_pos[1] < height - 1) {
                            ta_pos2[0] = ta_pos[0];
                            ta_pos2[1] = ta_pos[1] + 1;
                            if (pb_already_visited.get_pixel_1bipp(ta_pos2) === 0) {
                                if (i_stack_pos < stack_capacity) {
                                    ta_stack[i_stack_pos++] = ta_pos2[0];
                                    ta_stack[i_stack_pos++] = ta_pos2[1];
                                    stack_length++;
                                } else {
                                    console.log('stack_length', stack_length);
                                    console.log('i_stack_pos', i_stack_pos);
                                    console.trace();
                                    throw 'NYI - stack exceeded capacity';
                                }
                            };
                        }
                        pb_already_visited.set_pixel_1bipp(ta_pos, 1);
                    }
                }
            }
            const ta_stack_fn_calls_inlined_8bipp_visited_matrix_implementation = () => {
                let stack_capacity = 1024 * 1024 * 8; 
                let ta_stack = new Uint16Array(stack_capacity);
                let i_stack_pos = 0;
                let stack_length = 0;
                let px_color;
                let ta_pos = new Uint16Array(2);
                let ta_pos2 = new Uint16Array(2);
                ta_pos[0] = x;
                ta_pos[1] = y;
                if (i_stack_pos < stack_capacity) {
                    ta_stack[i_stack_pos++] = ta_pos[0];
                    ta_stack[i_stack_pos++] = ta_pos[1];
                    stack_length++;
                } else {
                    console.log('stack_length', stack_length);
                    console.log('i_stack_pos', i_stack_pos);
                    console.trace();
                    throw 'NYI - stack exceeded capacity';
                }
                const [width, height] = this.size;
                const ta_already_visited = new Uint8Array(width * height);
                while (stack_length > 0) {
                        ta_pos[0] = ta_stack[i_stack_pos - 2];
                        ta_pos[1] = ta_stack[i_stack_pos - 1];
                        i_stack_pos -= 2;
                        stack_length--;
                    px_color = this.get_pixel_1bipp(ta_pos); 
                    if (px_color === target_color) {
                        this.set_pixel_1bipp(ta_pos, new_color);
                        if (ta_pos[0] > 0) {
                            ta_pos2[0] = ta_pos[0] - 1;
                            ta_pos2[1] = ta_pos[1];
                            if (ta_already_visited[width * ta_pos2[1] + ta_pos2[0]] === 0) {
                                if (i_stack_pos < stack_capacity) {
                                    ta_stack[i_stack_pos++] = ta_pos2[0];
                                    ta_stack[i_stack_pos++] = ta_pos2[1];
                                    stack_length++;
                                } else {
                                    console.log('stack_length', stack_length);
                                    console.log('i_stack_pos', i_stack_pos);
                                    console.trace();
                                    throw 'NYI - stack exceeded capacity';
                                }
                            };
                        }
                        if (ta_pos[0] < width - 1) {
                            ta_pos2[0] = ta_pos[0] + 1;
                            ta_pos2[1] = ta_pos[1];
                            if (ta_already_visited[width * ta_pos2[1] + ta_pos2[0]] === 0) {
                                if (i_stack_pos < stack_capacity) {
                                    ta_stack[i_stack_pos++] = ta_pos2[0];
                                    ta_stack[i_stack_pos++] = ta_pos2[1];
                                    stack_length++;
                                } else {
                                    console.log('stack_length', stack_length);
                                    console.log('i_stack_pos', i_stack_pos);
                                    console.trace();
                                    throw 'NYI - stack exceeded capacity';
                                }
                            };
                        }
                        if (ta_pos[1] > 0) {
                            ta_pos2[0] = ta_pos[0];
                            ta_pos2[1] = ta_pos[1] - 1;
                            if (ta_already_visited[width * ta_pos2[1] + ta_pos2[0]] === 0) {
                                if (i_stack_pos < stack_capacity) {
                                    ta_stack[i_stack_pos++] = ta_pos2[0];
                                    ta_stack[i_stack_pos++] = ta_pos2[1];
                                    stack_length++;
                                } else {
                                    console.log('stack_length', stack_length);
                                    console.log('i_stack_pos', i_stack_pos);
                                    console.trace();
                                    throw 'NYI - stack exceeded capacity';
                                }
                            };
                        }
                        if (ta_pos[1] < height - 1) {
                            ta_pos2[0] = ta_pos[0];
                            ta_pos2[1] = ta_pos[1] + 1;
                            if (ta_already_visited[width * ta_pos2[1] + ta_pos2[0]] === 0) {
                                if (i_stack_pos < stack_capacity) {
                                    ta_stack[i_stack_pos++] = ta_pos2[0];
                                    ta_stack[i_stack_pos++] = ta_pos2[1];
                                    stack_length++;
                                } else {
                                    console.log('stack_length', stack_length);
                                    console.log('i_stack_pos', i_stack_pos);
                                    console.trace();
                                    throw 'NYI - stack exceeded capacity';
                                }
                            };
                        }
                        ta_already_visited[width * ta_pos[1] + ta_pos[0]] = 255
                    }
                }
            }
            return ta_stack_fn_calls_inlined_8bipp_visited_matrix_implementation();
        }
    }
    'flood_fill'(x, y, r, g, b, a) {
        const {
            bipp
        } = this;
        if (bipp === 24) {
            const [w, h] = this.size;
            let fast_stacked_mapped_flood_fill = () => {
                const buffer = this.buffer;
                const scratch_32 = new Uint32Array(16);
                scratch_32[0] = this.size[0]; 
                scratch_32[1] = this.size[1]; 
                scratch_32[2] = scratch_32[0] * scratch_32[1];
                scratch_32[3] = this.bytes_per_pixel;
                scratch_32[6] = 0 
                scratch_32[7] = 0 
                scratch_32[8] = 0 
                scratch_32[9] = 0 
                const ta8_pixels = new Uint8Array(12);
                ta8_pixels[8] = r;
                ta8_pixels[9] = g;
                ta8_pixels[10] = b;
                const ta_pixels_visited = new Uint8Array(scratch_32[2]);
                const ta_visiting_pixels = new Uint16Array(scratch_32[2] * 2);
                scratch_32[8] = scratch_32[3] * (x + (y * scratch_32[0]));
                ta8_pixels[0] = buffer[scratch_32[8]++];
                ta8_pixels[1] = buffer[scratch_32[8]++];
                ta8_pixels[2] = buffer[scratch_32[8]++];
                ta_visiting_pixels[0] = x;
                ta_visiting_pixels[1] = y;
                scratch_32[7] = 2;
                while (scratch_32[9] <= scratch_32[2]) {
                    scratch_32[4] = ta_visiting_pixels[scratch_32[6]++]; 
                    scratch_32[5] = ta_visiting_pixels[scratch_32[6]++]; 
                    scratch_32[8] = scratch_32[3] * (scratch_32[4] + (scratch_32[5] * scratch_32[0]));
                    if (buffer[scratch_32[8]++] - ta8_pixels[0] === 0 && buffer[scratch_32[8]++] - ta8_pixels[1] === 0 && buffer[scratch_32[8]++] - ta8_pixels[2] === 0) {
                        scratch_32[8] -= 3;
                        buffer[scratch_32[8]++] = ta8_pixels[8];
                        buffer[scratch_32[8]++] = ta8_pixels[9];
                        buffer[scratch_32[8]++] = ta8_pixels[10];
                        if (scratch_32[4] - 1 >= 0 && ta_pixels_visited[scratch_32[4] - 1 + (scratch_32[0] * scratch_32[5])] === 0) {
                            ta_visiting_pixels[scratch_32[7]++] = scratch_32[4] - 1;
                            ta_visiting_pixels[scratch_32[7]++] = scratch_32[5];
                            ta_pixels_visited[scratch_32[4] - 1 + (scratch_32[0] * scratch_32[5])] = 255;
                        }
                        if (scratch_32[5] - 1 >= 0 && ta_pixels_visited[scratch_32[4] + (scratch_32[0] * (scratch_32[5] - 1))] === 0) {
                            ta_visiting_pixels[scratch_32[7]++] = scratch_32[4];
                            ta_visiting_pixels[scratch_32[7]++] = scratch_32[5] - 1;
                            ta_pixels_visited[scratch_32[4] + (scratch_32[0] * (scratch_32[5] - 1))] = 255;
                        }
                        if (scratch_32[4] + 1 < scratch_32[0] && ta_pixels_visited[scratch_32[4] + 1 + (scratch_32[0] * scratch_32[5])] === 0) {
                            ta_visiting_pixels[scratch_32[7]++] = scratch_32[4] + 1;
                            ta_visiting_pixels[scratch_32[7]++] = scratch_32[5];
                            ta_pixels_visited[scratch_32[4] + 1 + (scratch_32[0] * scratch_32[5])] = 255;
                        }
                        if (scratch_32[5] + 1 < scratch_32[1] && ta_pixels_visited[scratch_32[4] + (scratch_32[0] * (scratch_32[5] + 1))] === 0) {
                            ta_visiting_pixels[scratch_32[7]++] = scratch_32[4];
                            ta_visiting_pixels[scratch_32[7]++] = scratch_32[5] + 1;
                            ta_pixels_visited[scratch_32[4] + (scratch_32[0] * (scratch_32[5] + 1))] = 255;
                        }
                    }
                    scratch_32[9]++;
                }
                return this;
            }
            return fast_stacked_mapped_flood_fill();
        } else if (bipp === 32) {
            const [w, h] = this.size;
            let fast_stacked_mapped_flood_fill = () => {
                const buffer = this.buffer;
                const scratch_32 = new Uint32Array(16);
                scratch_32[0] = this.size[0]; 
                scratch_32[1] = this.size[1]; 
                scratch_32[2] = scratch_32[0] * scratch_32[1];
                scratch_32[3] = this.bytes_per_pixel;
                scratch_32[6] = 0 
                scratch_32[7] = 0 
                scratch_32[8] = 0 
                scratch_32[9] = 0 
                const ta8_pixels = new Uint8Array(12);
                ta8_pixels[8] = r;
                ta8_pixels[9] = g;
                ta8_pixels[10] = b;
                ta8_pixels[11] = a;
                const ta_pixels_visited = new Uint8Array(scratch_32[2]);
                const ta_visiting_pixels = new Uint16Array(scratch_32[2] * 2);
                scratch_32[8] = scratch_32[3] * (x + (y * scratch_32[0]));
                ta8_pixels[0] = buffer[scratch_32[8]++];
                ta8_pixels[1] = buffer[scratch_32[8]++];
                ta8_pixels[2] = buffer[scratch_32[8]++];
                ta8_pixels[3] = buffer[scratch_32[8]++];
                ta_visiting_pixels[0] = x;
                ta_visiting_pixels[1] = y;
                scratch_32[7] = 2;
                while (scratch_32[9] <= scratch_32[2]) {
                    scratch_32[4] = ta_visiting_pixels[scratch_32[6]++]; 
                    scratch_32[5] = ta_visiting_pixels[scratch_32[6]++]; 
                    scratch_32[8] = scratch_32[3] * (scratch_32[4] + (scratch_32[5] * scratch_32[0]));
                    if (buffer[scratch_32[8]++] - ta8_pixels[0] === 0 && buffer[scratch_32[8]++] - ta8_pixels[1] === 0 && buffer[scratch_32[8]++] - ta8_pixels[2] === 0 && buffer[scratch_32[8]++] - ta8_pixels[3] === 0) {
                        scratch_32[8] -= 4;
                        buffer[scratch_32[8]++] = ta8_pixels[8];
                        buffer[scratch_32[8]++] = ta8_pixels[9];
                        buffer[scratch_32[8]++] = ta8_pixels[10];
                        buffer[scratch_32[8]++] = ta8_pixels[11];
                        if (scratch_32[4] - 1 >= 0 && ta_pixels_visited[scratch_32[4] - 1 + (scratch_32[0] * scratch_32[5])] === 0) {
                            ta_visiting_pixels[scratch_32[7]++] = scratch_32[4] - 1;
                            ta_visiting_pixels[scratch_32[7]++] = scratch_32[5];
                            ta_pixels_visited[scratch_32[4] - 1 + (scratch_32[0] * scratch_32[5])] = 255;
                        }
                        if (scratch_32[5] - 1 >= 0 && ta_pixels_visited[scratch_32[4] + (scratch_32[0] * (scratch_32[5] - 1))] === 0) {
                            ta_visiting_pixels[scratch_32[7]++] = scratch_32[4];
                            ta_visiting_pixels[scratch_32[7]++] = scratch_32[5] - 1;
                            ta_pixels_visited[scratch_32[4] + (scratch_32[0] * (scratch_32[5] - 1))] = 255;
                        }
                        if (scratch_32[4] + 1 < scratch_32[0] && ta_pixels_visited[scratch_32[4] + 1 + (scratch_32[0] * scratch_32[5])] === 0) {
                            ta_visiting_pixels[scratch_32[7]++] = scratch_32[4] + 1;
                            ta_visiting_pixels[scratch_32[7]++] = scratch_32[5];
                            ta_pixels_visited[scratch_32[4] + 1 + (scratch_32[0] * scratch_32[5])] = 255;
                        }
                        if (scratch_32[5] + 1 < scratch_32[1] && ta_pixels_visited[scratch_32[4] + (scratch_32[0] * (scratch_32[5] + 1))] === 0) {
                            ta_visiting_pixels[scratch_32[7]++] = scratch_32[4];
                            ta_visiting_pixels[scratch_32[7]++] = scratch_32[5] + 1;
                            ta_pixels_visited[scratch_32[4] + (scratch_32[0] * (scratch_32[5] + 1))] = 255;
                        }
                    }
                    scratch_32[9]++;
                }
                return this;
            }
            return fast_stacked_mapped_flood_fill();
        } else if (bipp === 8) {
            const [w, h] = this.size;
            let fast_stacked_mapped_flood_fill = () => {
                const v = r;
                const buffer = this.buffer;
                const scratch_32 = new Uint32Array(16);
                scratch_32[0] = this.size[0]; 
                scratch_32[1] = this.size[1]; 
                scratch_32[2] = scratch_32[0] * scratch_32[1];
                scratch_32[3] = this.bytes_per_pixel;
                scratch_32[6] = 0 
                scratch_32[7] = 0 
                scratch_32[8] = 0 
                scratch_32[9] = 0 
                const ta8_pixels = new Uint8Array(12);
                ta8_pixels[8] = v;
                const ta_pixels_visited = new Uint8Array(scratch_32[2]);
                const ta_visiting_pixels = new Uint16Array(scratch_32[2] * 2);
                scratch_32[8] = scratch_32[3] * (x + (y * scratch_32[0]));
                ta8_pixels[0] = buffer[scratch_32[8]++];
                ta_visiting_pixels[0] = x;
                ta_visiting_pixels[1] = y;
                scratch_32[7] = 2;
                while (scratch_32[9] <= scratch_32[2]) {
                    scratch_32[4] = ta_visiting_pixels[scratch_32[6]++]; 
                    scratch_32[5] = ta_visiting_pixels[scratch_32[6]++]; 
                    scratch_32[8] = scratch_32[3] * (scratch_32[4] + (scratch_32[5] * scratch_32[0]));
                    if (buffer[scratch_32[8]++] - ta8_pixels[0] === 0) {
                        scratch_32[8] -= 1;
                        buffer[scratch_32[8]++] = ta8_pixels[8];
                        if (scratch_32[4] - 1 >= 0 && ta_pixels_visited[scratch_32[4] - 1 + (scratch_32[0] * scratch_32[5])] === 0) {
                            ta_visiting_pixels[scratch_32[7]++] = scratch_32[4] - 1;
                            ta_visiting_pixels[scratch_32[7]++] = scratch_32[5];
                            ta_pixels_visited[scratch_32[4] - 1 + (scratch_32[0] * scratch_32[5])] = 255;
                        }
                        if (scratch_32[5] - 1 >= 0 && ta_pixels_visited[scratch_32[4] + (scratch_32[0] * (scratch_32[5] - 1))] === 0) {
                            ta_visiting_pixels[scratch_32[7]++] = scratch_32[4];
                            ta_visiting_pixels[scratch_32[7]++] = scratch_32[5] - 1;
                            ta_pixels_visited[scratch_32[4] + (scratch_32[0] * (scratch_32[5] - 1))] = 255;
                        }
                        if (scratch_32[4] + 1 < scratch_32[0] && ta_pixels_visited[scratch_32[4] + 1 + (scratch_32[0] * scratch_32[5])] === 0) {
                            ta_visiting_pixels[scratch_32[7]++] = scratch_32[4] + 1;
                            ta_visiting_pixels[scratch_32[7]++] = scratch_32[5];
                            ta_pixels_visited[scratch_32[4] + 1 + (scratch_32[0] * scratch_32[5])] = 255;
                        }
                        if (scratch_32[5] + 1 < scratch_32[1] && ta_pixels_visited[scratch_32[4] + (scratch_32[0] * (scratch_32[5] + 1))] === 0) {
                            ta_visiting_pixels[scratch_32[7]++] = scratch_32[4];
                            ta_visiting_pixels[scratch_32[7]++] = scratch_32[5] + 1;
                            ta_pixels_visited[scratch_32[4] + (scratch_32[0] * (scratch_32[5] + 1))] = 255;
                        }
                    }
                    scratch_32[9]++;
                }
                return this;
            }
            return fast_stacked_mapped_flood_fill();
        } else if (bipp === 1) {
            return this.flood_fill_1bipp(x, y, r);
        } else {
            console.trace();
            throw 'Unsupported bipp: ' + bipp;
        }
    }
    'invert'() {
        const {
            bipp
        } = this;
        if (bipp === 1) {
            const {
                ta
            } = this;
            const l = ta.length;
            for (let i = 0; i < l; i++) {
                ta[i] = ~ta[i] & 255;
            }
        } else {
            console.trace();
            throw 'NYI (unsupported bipp) ' + bipp;
        }
    }
    'or'(other_pb) {
        const {
            bipp
        } = this;
        if (bipp === 1) {
            const other_bipp = other_pb.bipp;
            if (other_bipp === 1) {
                const {
                    ta
                } = this;
                const l_my_ta = ta.length;
                const other_ta = other_pb.ta;
                const l_other_ta = other_ta.length;
                if (l_other_ta === l_my_ta) {
                    for (let i = 0; i < l_my_ta; i++) {
                        ta[i] = ta[i] | other_ta[i];
                    }
                } else {
                    console.trace();
                    throw 'lengths of pixel buffer typed arrays must match';
                }
            } else {
                console.trace();
                throw 'bipp values must match (other_pb expected to have bipp: 1)'
            }
        } else {
            console.trace();
            throw 'NYI (unsupported bipp) ' + bipp;
        }
    }
    each_outer_boundary_pixel(callback) {
        let ta_pos = new Uint16Array(2);
        const {size} = this;
        const [w, h] = size;
        ta_pos[0] = 0;
        ta_pos[1] = 0;
        for (ta_pos[0] = 0; ta_pos[0] < w; ta_pos[0]++) {
            const px = this.get_pixel(ta_pos);
            callback(px, ta_pos);
        }
        ta_pos[0]--;
        for (ta_pos[1] = 0; ta_pos[1] < h; ta_pos[1]++) {
            const px = this.get_pixel(ta_pos);
            callback(px, ta_pos);
        }
        ta_pos[1]--;
        for (ta_pos[0] = w - 1; ta_pos[0] > 0; ta_pos[0]--) {
            const px = this.get_pixel(ta_pos);
            callback(px, ta_pos);
        }
        let px = this.get_pixel(ta_pos);
        callback(px, ta_pos);
        for (ta_pos[1] = h - 1; ta_pos[1] > 0; ta_pos[1]--) {
            const px = this.get_pixel(ta_pos);
            callback(px, ta_pos);
        }
        px = this.get_pixel(ta_pos);
        callback(px, ta_pos);
    }
    flood_fill_off_pixels_from_outer_boundary_on_1bipp() {
        this.each_outer_boundary_pixel((b_color, pos) => {
            if (b_color === 0) {
                this.flood_fill_c1_1bipp(pos);
            }
        });
    }
    flood_fill_given_color_pixels_from_outer_boundary(given_color, fill_color) {
        const {
            bits_per_pixel
        } = this;
        if (bits_per_pixel === 24) {
            this.each_outer_boundary_pixel((b_color, pos) => {
                const [r, g, b] = b_color;
                if (r === given_color[0] && g === given_color[1] && b === given_color[2]) {
                    this.flood_fill(pos[0], pos[1], fill_color[0], fill_color[1], fill_color[2]);
                }
            });
        } else if (bits_per_pixel === 1) {
            this.each_outer_boundary_pixel((b_color, pos) => {
                if (b_color === given_color) {
                    this.flood_fill(pos[0], pos[1], fill_color);
                }
            });
        } else {
            console.log('not flood filling');
            console.log('bits_per_pixel', bits_per_pixel);
            throw 'NYI';
            console.trace();
        }
    }
    each_x_span(cb) {
        const [w, h] = this.size;
        const ta_x_span_toggle_bits = get_ta_bits_that_differ_from_previous_as_1s(this.ta);
        let prev_x, prev_y;
        let x_delta, y_delta;
        let color_leading_on_from_current_x_toggle_position;
        const found_empty_rows = (y0, y1_inclusive) => {
        }
        const found_x_span = (x0, x1, y, color) => {
            cb(x0, x1, y, color);
        }
        const complete_previous_row_x_span = () => {
        }
        const complete_any_empty_in_between_rows = () => {
        }
        const complete_current_x_span = (x, y) => {
            found_x_span(prev_x, x - 1, y, color_leading_on_from_current_x_toggle_position);
            color_leading_on_from_current_x_toggle_position^=1;
        }
        const found_row_beginning_color_0_x_span = (x_span_end, y) => {
            found_x_span(0, x_span_end, y, 0);
            color_leading_on_from_current_x_toggle_position = 1;
        }
        const found_row_beginning_color_1_x_span_beginning = (y) => {
            color_leading_on_from_current_x_toggle_position = 1;
        }
        const handle_xy_toggle_position = (x, y) => {
            if (prev_x === undefined) {
                if (y > 0) {
                    found_empty_rows(0, y - 1);
                }
                if (x > 0) {
                    found_row_beginning_color_0_x_span(x, y);
                } else {
                    found_row_beginning_color_1_x_span_beginning(y);
                }
            } else {
                if (y > prev_y) {
                    complete_previous_row_x_span();
                    complete_any_empty_in_between_rows();
                    if (x === 0) {
                        found_row_beginning_color_1_x_span_beginning(y);
                    } else {
                        found_row_beginning_color_0_x_span(x - 1, y);
                    }
                } else {
                    complete_current_x_span(x, y);
                }
            }
            prev_x = x; prev_y = y;
        }
        each_1_index(ta_x_span_toggle_bits, i => {
            const y = Math.floor(i / w);
            const x = i % w;
            handle_xy_toggle_position(x, y);
        });
    }
    not_very_fast_flood_fill_inner_pixels_off_to_on_1bipp() {
        const identify_overlaps = (higher_row_x_spans, lower_row_x_spans) => {
            let i = 0, j = 0;
            const m = higher_row_x_spans.length, n = lower_row_x_spans.length;
            while (i < m && j < n) {
                const a = higher_row_x_spans[i], b = lower_row_x_spans[j];
                if (a.x0_span[1] < b.x0_span[0]) {
                    i++;
                } else if (b.x0_span[1] < a.x0_span[0]) {
                    j++;
                } else {
                    a.connected_below.push(b.idx);
                    b.connected_above.push(a.idx);
                    if (a.x0_span[1] <= b.x0_span[1]) {
                        i++;
                    }
                    if (b.x0_span[1] <= a.x0_span[1]) {
                        j++;
                    }
                }
            }
        }
        const rows_x0spans = this.calculate_arr_rows_arr_x_off_spans_1bipp();
        const arr_all_x_spans = [];
        const arr_y_indexed = new Array(this.size[1]);
        let i2;
        let idx = 0;
        for (let i = 0; i < rows_x0spans.length; i++) {
            const single_row_x0spans = rows_x0spans[i];
            arr_y_indexed[i] = [];
            for (i2 = 0; i2 < single_row_x0spans.length; i2++) {
                const x0_span = single_row_x0spans[i2];
                const o_x0span = {
                    idx: idx++,
                    y: i,
                    x0_span: x0_span,
                    connected_above: [],
                    connected_below: [],
                }
                arr_all_x_spans.push(o_x0span);
                arr_y_indexed[i].push(o_x0span);
            }
        }
        let higher_row_y, lower_row_y;
        let span_above, span_below;
        for (higher_row_y = 0; higher_row_y < this.size[1] - 1; higher_row_y++) {
            identify_overlaps(arr_y_indexed[higher_row_y], arr_y_indexed[higher_row_y + 1]);
        }
        const l = arr_all_x_spans.length;
        let arr_stack_yet_to_visit = [];
        let ui8a_visited_already = new Uint8Array(l);
        let i_group = 0;
        let i_current_group;
        const arr_groups = [];
        const arr_o_groups = [];
        let arr_current_group = [];
        let o_current_group;
        let i_xspan_visiting, xspan_visiting;
        const [width, height] = this.size;
        const hm1 = height - 1, wm1 = width - 1;
        const is_xspan_image_boundary_adjacent = xspan => {
            const {x0_span} = xspan;
            if (xspan.y === 0) return true;
            if (x0_span[0] === 0) return true;
            if (xspan.y === hm1) return true;
            if (x0_span[1] === wm1) return true;
            return false;
        }
        let xspan;
        let idx_span_above, idx_span_below;
        for (let c = 0; c < l; c++) {
            if (ui8a_visited_already[c] === 0) {
                ui8a_visited_already = new Uint8Array(l);
                xspan = arr_all_x_spans[c];
                ui8a_visited_already[c] = 255;
                if (xspan.group === undefined) {
                    i_current_group = i_group++;
                    arr_current_group = [];
                    o_current_group = {
                        index: i_current_group,
                        xspan_indexes: arr_current_group
                    }
                    arr_o_groups.push(o_current_group);
                    arr_groups.push(arr_current_group);
                    if (is_xspan_image_boundary_adjacent(xspan)) {
                        o_current_group.is_boundary_adjacent = true;
                    }
                    xspan.group = i_current_group;
                    arr_current_group.push(c);
                    for (idx_span_above of xspan.connected_above) {
                        if (ui8a_visited_already[idx_span_above] === 0) arr_stack_yet_to_visit.push(idx_span_above);
                    }
                    for (idx_span_below of xspan.connected_below) {
                        if (ui8a_visited_already[idx_span_below] === 0) arr_stack_yet_to_visit.push(idx_span_below);
                    }
                    while (arr_stack_yet_to_visit.length > 0) {
                        i_xspan_visiting = arr_stack_yet_to_visit.pop();
                        if (ui8a_visited_already[i_xspan_visiting] === 0) {
                            xspan_visiting = arr_all_x_spans[i_xspan_visiting];
                            if (is_xspan_image_boundary_adjacent(xspan_visiting)) {
                                o_current_group.is_boundary_adjacent = true;
                            }
                            xspan_visiting.group = i_current_group;
                            arr_current_group.push(i_xspan_visiting);
                            ui8a_visited_already[i_xspan_visiting] = 255;
                            for (idx_span_above of xspan_visiting.connected_above) {
                                if (ui8a_visited_already[idx_span_above] === 0) arr_stack_yet_to_visit.push(idx_span_above);
                            }
                            for (idx_span_below of xspan_visiting.connected_below) {
                                if (ui8a_visited_already[idx_span_below] === 0) arr_stack_yet_to_visit.push(idx_span_below);
                            }
                        }
                    }
                }
            }
        }
        const non_boundary_group_indexes = [];
        for (const g of arr_o_groups) {
            if (!g.is_boundary_adjacent) {
                for (const idx of g.xspan_indexes) {
                    non_boundary_group_indexes.push(idx);
                }
            }
        }
        const write_direct = () => {
            let xspan;
            for (const idx of non_boundary_group_indexes) {
                xspan = arr_all_x_spans[idx];
                this.draw_horizontal_line_on_1bipp_inclusive(xspan.x0_span, xspan.y);
            }
        }
        write_direct();
    }
    flood_fill_inner_pixels_off_to_on_1bipp() {
        return this.not_very_fast_flood_fill_inner_pixels_off_to_on_1bipp();
    }
}
module.exports = Pixel_Buffer_Perf_Focus_Enh;
