const Pixel_Buffer_Perf_Focus_Enh = require('./pixel-buffer-perf-focus-enh');
let {resize_ta_colorspace, copy_rect_to_same_size_8bipp, copy_rect_to_same_size_24bipp, dest_aligned_copy_rect_1to4bypp} = require('./ta-math');
class Pixel_Buffer_Specialised_Enh extends Pixel_Buffer_Perf_Focus_Enh {
    constructor(...a) {
        super(...a);
        const bounds_within_source = new Int16Array(4);
        Object.defineProperty(this, 'bounds_within_source', {
            get() {
                const size = this.size;
                const pos = this.pos;
                bounds_within_source[0] = pos[0];
                bounds_within_source[1] = pos[1];
                bounds_within_source[2] = pos[0] + size[0];
                bounds_within_source[3] = pos[1] + size[1];
                return bounds_within_source;
            },
            /*
            set(value) {
            },*/
            enumerable: true,
            configurable: false
        });
        const size_bounds = new Int16Array(4);
        Object.defineProperty(this, 'size_bounds', {
            get() {
                const size = this.size;
                size_bounds[0] = 0;
                size_bounds[1] = 0;
                size_bounds[2] = size[0];
                size_bounds[3] = size[1];
                return size_bounds;
            },
            enumerable: true,
            configurable: false
        });
        let pb_source;
        Object.defineProperty(this, 'source', {
            get() { return pb_source; },
            set(value) {
                pb_source = value;
            },
            enumerable: true,
            configurable: false
        });
    }
    copy_from_source() {
        const bipp = this.bipp;
        const pb_source = this.source;
        const ta_source = pb_source.ta;
        const ta = this.ta;
        const my_bounds = this.bounds_within_source;
        const source_size_bounds = pb_source.size_bounds;
        if (bipp === 1) {
            console.trace();
            throw 'NYI';
        } else if (bipp === 8 || bipp === 24 || bipp === 32) {
            dest_aligned_copy_rect_1to4bypp(ta_source, ta, pb_source.bytes_per_row, this.bytes_per_pixel, ta_math.overlapping_bounds(my_bounds, source_size_bounds));
        } else {
            console.trace();
            throw 'stop';
        }
    }
    threshold_gs(value) {
        let res = this.clone();
        if (this.bytes_per_pixel === 1) {
            /*
            this.each_pixel((x, y, v, i) => {
                if (v >= value) {
                    res.set_pixel(x, y, 255);
                } else {
                    res.set_pixel(x, y, 0);
                }
            });
            */
            this.each_pixel((pos, color) => {
                if (color >= value) {
                    res.set_pixel(pos[0], pos[1], 255);
                } else {
                    res.set_pixel(pos[0], pos[1], 0);
                }
            });
        }
        return res;
    }
    padded_each_pixel_index(padding, cb) {
        const ta_32_scratch = new Uint32Array(9);
        ta_32_scratch[0] = this.bytes_per_pixel;
        ta_32_scratch[1] = 0; // i
        ta_32_scratch[2] = this.size[0] - padding;
        ta_32_scratch[3] = this.size[1] - padding;
        ta_32_scratch[7] = this.size[0];
        const bpp = this.bits_per_pixel;
        if (bpp === 32) {
            ((cb) => {
                for (ta_32_scratch[5] = padding; ta_32_scratch[5] < ta_32_scratch[3]; ta_32_scratch[5]++) {
                    for (ta_32_scratch[4] = 0; ta_32_scratch[4] < ta_32_scratch[2]; ta_32_scratch[4]++) {
                        cb((ta_32_scratch[5] * ta_32_scratch[7] + ta_32_scratch[4]) * ta_32_scratch[0]);
                    }
                }
            })(cb);
        } else if (bpp === 24) {
            ((cb) => {
                for (ta_32_scratch[5] = padding; ta_32_scratch[5] < ta_32_scratch[3]; ta_32_scratch[5]++) {
                    for (ta_32_scratch[4] = 0; ta_32_scratch[4] < ta_32_scratch[2]; ta_32_scratch[4]++) {
                        cb((ta_32_scratch[5] * ta_32_scratch[7] + ta_32_scratch[4]) * ta_32_scratch[0]);
                    }
                }
            })(cb);
        } else if (bpp === 8) {
            ((cb) => {
                for (ta_32_scratch[5] = padding; ta_32_scratch[5] < ta_32_scratch[3]; ta_32_scratch[5]++) {
                    for (ta_32_scratch[4] = 0; ta_32_scratch[4] < ta_32_scratch[2]; ta_32_scratch[4]++) {
                        cb((ta_32_scratch[5] * ta_32_scratch[7] + ta_32_scratch[4]) * ta_32_scratch[0]);
                    }
                }
            })(cb);
        } else {
            console.trace();
            throw 'NYI';
        }
    }
    new_window(options) {
        options.window_to = this;
        const res = new this.constructor(options);
        res.copy_from_source();
        return res;
    }
    new_centered_window(size_or_options) {
        console.trace();
        throw 'NYI';
        const t1 = tf(size_or_options);
        console.log('t1', t1);
        let size;
        if (t1 === 'a') {
            if (size_or_options.length === 2) {
                size = new Int16Array([size_or_options, size_or_options]);
            } else {
                console.log('size_or_options', size_or_options);
                console.trace();
                throw 'Size array expected length: 2';
            }
        } else if (t1 === 'n') {
            size = new Int16Array([size_or_options, size_or_options]);
        } else {
            console.trace();
            throw 'NYI';
        }
        const res_pb = new this.constructor({
            size: size,
            bits_per_pixel: this.bits_per_pixel,
            window_to: this
        });
    }
    fill_solid_rect_by_bounds() {
        const bounds = this.ta_bounds;
        const bipp = this.bipp;
        if (bipp === 24) {
            const rgb = this.ta_rgb;
            const bytes_per_bounds_row = (bounds[2] - bounds[0]) * this.bypp;
            const solid_row = new Uint8ClampedArray(bytes_per_bounds_row);
            let cc = 0;
            for (let c = 0; c < bytes_per_bounds_row; c++) {
                solid_row[c] = rgb[cc];
                cc++;
                if (cc === 3) cc = 0;
            }
            let write_byte_idx = bounds[0] * this.bypp + bounds[1] * this.bypr;
            for (let i_row = bounds[1]; i_row < bounds[3]; i_row++) {
                this.ta.set(solid_row, write_byte_idx);
                write_byte_idx += this.bypr;
            }
        } else {
            console.trace();
            throw 'NYI';
        }
    }
    calc_source_target_valid_bounds_overlap() {
        const source = this.source;
        const my_bounds = this.bounds_within_source;
        const source_size_bounds = source.size_bounds;
        const res = this.ta_bounds_scratch;
        if (my_bounds[0] < source_size_bounds[0]) {
            res[0] = source_size_bounds[0];
        } else {
            res[0] = my_bounds[0];
        }
        if (my_bounds[1] < source_size_bounds[1]) {
            res[1] = source_size_bounds[1];
        } else {
            res[1] = my_bounds[1];
        }
        if (my_bounds[2] > source_size_bounds[2]) {
            res[2] = source_size_bounds[2];
        } else {
            res[2] = my_bounds[2];
        }
        if (my_bounds[3] > source_size_bounds[3]) {
            res[3] = source_size_bounds[3];
        } else {
            res[3] = my_bounds[3];
        }
        return res;
    }
    copy_rect_by_bounds_to_24bipp(ta_bounds, pb_target) {
        console.trace();
        throw 'NYI';
        const pos = this.ta_pos_scratch;
        const rect_size = this.ta_size_scratch;
        rect_size[0] = ta_bounds[2] - ta_bounds[0];
        rect_size[1] = ta_bounds[3] - ta_bounds[1];
        console.log('rect_size', rect_size);
        const ta_pointers = this.ta_pointers_scratch;
        const ta_target_pointers = pb_target.ta_pointers_scratch;
        console.log('ta_pointers', ta_pointers);
        console.log('ta_target_pointers', ta_target_pointers);
        console.log('pos', pos);
        console.log('ta_bounds', ta_bounds);
        const ta = this.ta;
        const ta_target = pb_target.ta;
        console.log('pb_target.pos', pb_target.pos);
        const ta_safe_bounds_limits = this.ta_bounds_scratch;
        ta_safe_bounds_limits[0] = 0;
        ta_safe_bounds_limits[1] = 0;
        ta_safe_bounds_limits[2] = this.size[0];
        ta_safe_bounds_limits[3] = this.size[1];
        const ta_safe_adjusted_bounds = this.ta_bounds2_scratch;
        const ta_bounds_adjustments = this.ta_bounds3_scratch;
        const ta_bounds_byte_offsets = this.ta_bounds3_scratch;
        if (ta_bounds[0] >= ta_safe_bounds_limits[0]) {
            ta_safe_adjusted_bounds[0] = ta_bounds[0];
            ta_bounds_adjustments[0] = 0;
        } else {
            ta_bounds_adjustments[0] = ta_safe_bounds_limits[0] - ta_bounds[0];
            ta_safe_adjusted_bounds[0] = ta_safe_bounds_limits[0];
        }
        if (ta_bounds[1] >= ta_safe_bounds_limits[1]) {
            ta_safe_adjusted_bounds[1] = ta_bounds[1];
            ta_bounds_adjustments[1] = 0;
        } else {
            ta_bounds_adjustments[1] = ta_safe_bounds_limits[1] - ta_bounds[1];
            ta_safe_adjusted_bounds[1] = ta_safe_bounds_limits[1];
        }
        if (ta_bounds[2] <= ta_safe_bounds_limits[2]) {
            ta_safe_adjusted_bounds[2] = ta_bounds[2];
            ta_bounds_adjustments[2] = 0;
        } else {
            ta_bounds_adjustments[2] = ta_safe_bounds_limits[2] - ta_bounds[2];
            ta_safe_adjusted_bounds[2] = ta_safe_bounds_limits[2];
        }
        if (ta_bounds[3] <= ta_safe_bounds_limits[3]) {
            ta_safe_adjusted_bounds[3] = ta_bounds[3];
            ta_bounds_adjustments[3] = 0;
        } else {
            ta_bounds_adjustments[3] = ta_safe_bounds_limits[3] - ta_bounds[3];
            ta_safe_adjusted_bounds[3] = ta_safe_bounds_limits[3];
        }
        console.log('ta_safe_adjusted_bounds', ta_safe_adjusted_bounds);
        console.log('ta_bounds_adjustments', ta_bounds_adjustments);
        console.log('this.bytes_per_row', this.bytes_per_row);
        const source_bytes_per_row = this.bytes_per_row;
        const bypp = this.bypp;
        const adjusted_safe_bounds_source_read_byte_offsets = this.ta_offsets_scratch;
        adjusted_safe_bounds_source_read_byte_offsets[0] = ta_bounds_adjustments[0] * bypp;
        adjusted_safe_bounds_source_read_byte_offsets[1] = ta_bounds_adjustments[1] * source_bytes_per_row;
        adjusted_safe_bounds_source_read_byte_offsets[2] = ta_bounds_adjustments[2] * bypp;
        adjusted_safe_bounds_source_read_byte_offsets[3] = ta_bounds_adjustments[3] * source_bytes_per_row;
        console.log('adjusted_safe_bounds_source_read_byte_offsets', adjusted_safe_bounds_source_read_byte_offsets);
        const adjusted_safe_bounds_target_write_byte_offsets = pb_target.ta_offsets_scratch;
        const ta_pp_source_read = this.ta_pointerpair_scratch;
        const ta_pp_target_write = pb_target.ta_pointerpair_scratch;
        const bytes_per_row_of_safe_bounds = (ta_safe_adjusted_bounds[2] - ta_safe_adjusted_bounds[0]) * bypp;
        console.log('bytes_per_row_of_safe_bounds', bytes_per_row_of_safe_bounds);
        ta_pp_source_read[0] = adjusted_safe_bounds_source_read_byte_offsets[0] + adjusted_safe_bounds_source_read_byte_offsets[1];
        ta_pp_source_read[1] = ta_pp_source_read[0] + bytes_per_row_of_safe_bounds;
        ta_pp_target_write[0] = 0; // no, it's the left indent of the safe bounds.
        ta_pp_target_write[1] = ta_pp_target_write[0] + bytes_per_row_of_safe_bounds;
        console.log('ta_pp_source_read', ta_pp_source_read);
        console.log('ta_pp_target_write', ta_pp_target_write);
        console.log('pb_target.bytes_per_row', pb_target.bytes_per_row);
        const num_rows_to_copy = ta_safe_adjusted_bounds[3] - ta_safe_adjusted_bounds[1];
        console.log('num_rows_to_copy', num_rows_to_copy);
        for (let c = 0; c < num_rows_to_copy; c++) {
            const sa_source_row = ta.subarray(ta_pp_source_read[0], ta_pp_source_read[1]);
            console.log('sa_source_row', sa_source_row);
        }
        for (pos[1] = ta_bounds[1]; pos[1] < ta_bounds[3]; pos[1]++) {
        }
        if (rect_size[0] === pb_target.size[0] && rect_size[1] === pb_target.size[1]) {
            console.log('rect_size matches target size.')
        }
    }
    'get_ta_contiguous_spans_1bipp_toggle'() {
        const get_count = () => {
            const initial_color = 0;
            let color = initial_color;
            let count_color_changes = 0;
            this.each_pixel(([x, y], px_color) => {
                if (px_color !== color) {
                    count_color_changes++;
                }
                color = px_color;
            });
            count_color_changes++;
            return count_color_changes;
        }
        const get_max_span_length = () => {
            const initial_color = 0;
            let color = initial_color;
            let l = 0;
            let max_l = 0;
            this.each_pixel(([x, y], px_color) => {
                if (px_color !== color) {
                    l = 0;
                } else {
                    l++;
                    if (l > max_l) max_l = l;
                }
                color = px_color;
            });
            return max_l + 1;
        }
        const nccs = get_count();
        const max_xpan_l = get_max_span_length();
        if (max_xpan_l <= 255) {
            const res = new Uint8Array(nccs);
            const initial_color = 0;
            let color = initial_color;
            let count_color_changes = 0;
            let l = -1;
            this.each_pixel(([x, y], px_color) => {
                if (px_color !== color) {
                    res[count_color_changes] = l + 1;
                    count_color_changes++;
                    l = 0;
                } else {
                    l++;
                }
                color = px_color;
            });
            res[count_color_changes] = l + 1;
            return res;
        } else {
            console.trace();
            throw 'stop';
        }
    }
    'count_row_on_xspans_1bipp'(y) {
        let res = 0;
        const width = this.size[0];
        let last_color = 1;
        let current_color;
        let ta_pos = new Uint16Array(2);
        ta_pos[1] = y;
        for (let x = 0; x < width; x++) {
            ta_pos[0] = x;
            current_color = this.get_pixel_1bipp(ta_pos);
            if (current_color === 1) {
                if (current_color === last_color) {
                    if (res === 0) {
                        res++;
                    } else {
                    }
                } else {
                    res++;
                }
            }
            last_color = current_color;
        }
        return res;
    }
    'calculate_ta_row_x_off_x2ygbspans_1bipp'(y) {
        const count_xoffspans = this.count_row_off_xspans_1bipp(y);
        const res = new Uint16Array(count_xoffspans * 5);
        let i_w = 0;
        const width = this.size[0];
        let last_color = 0;
        let current_color;
        let ta_pos = new Uint16Array(2);
        ta_pos[1] = y;
        for (let x = 0; x < width; x++) {
            ta_pos[0] = x;
            current_color = this.get_pixel_1bipp(ta_pos);
            if (current_color === 0) {
                if (current_color === last_color) {
                    if (res.length === 0) {
                        res[i_w++] = x;
                        res[i_w++] = x;
                        res[i_w++] = y;
                        res[i_w++] = 0; // 0 for undefined group here....
                        res[i_w++] = 0; // 0 for undefined border status here
                    } else {
                        res[i_w - 4]++;
                    }
                } else {
                    res[i_w++] = x;
                    res[i_w++] = x;
                    res[i_w++] = y;
                    res[i_w++] = 0; // 0 for undefined group here....
                    res[i_w++] = 0; // 0 for undefined border status here
                }
            }
            last_color = current_color;
        }
        return res;
    }
    'calculate_arr_row_x_off_spans_1bipp'(y) {
            const res = [];
            const width = this.size[0];
            const {ta} = this;
            let last_color = 0;
            let current_color;
            const x_start = 0;
            let idx_bit_overall = ((y * this.size[0]) + x_start) | 0, idx_bit_within_byte = 0 | 0;
            let arr_last;
            let num_bits_remaining = width;
            let x = 0; // an x local value is fine - will update it as necessary
            let has_just_done_multi_read = false;
            let byte_val = 0 | 0;
            while (num_bits_remaining > 0) {
                idx_bit_within_byte = idx_bit_overall & 0b111;
                has_just_done_multi_read = false;
                if (idx_bit_within_byte === 0 && num_bits_remaining >= 8) {
                    byte_val = ta[idx_bit_overall >> 3];
                    if (byte_val === 255) {
                        last_color = 1;
                        has_just_done_multi_read = true;
                        idx_bit_overall += 8;
                        x += 8;
                        num_bits_remaining -= 8;
                    } else if (byte_val === 0) {
                        if (last_color === 0) {
                            if (res.length === 0) {
                                if (arr_last) res.push(arr_last);
                                arr_last = [x, x + 7];
                            } else {
                                arr_last[1] += 8;
                            }
                        } else {
                            if (arr_last) res.push(arr_last);
                            arr_last = [x, x + 7];
                        }
                        x += 8;
                        last_color = 0;
                        num_bits_remaining -= 8;
                        idx_bit_overall += 8;
                        has_just_done_multi_read = true;
                    } else {
                    }
                }
                if (!has_just_done_multi_read) {
                    current_color = ((ta[idx_bit_overall >> 3] & 128 >> (idx_bit_within_byte)) !== 0) ? 1 : 0;
                    if (current_color === 0) {
                        if (current_color === last_color) {
                            if (res.length === 0) {
                                if (arr_last) res.push(arr_last);
                                arr_last = [x, x];
                            } else {
                                arr_last[1]++;
                            }
                        } else {
                            if (arr_last) res.push(arr_last);
                            arr_last = [x, x];
                        }
                    }
                    last_color = current_color;
                    idx_bit_overall++;
                    x++;
                    num_bits_remaining--;
                }
            }
            if (arr_last) res.push(arr_last);
            return res;
    }
    'calculate_arr_rows_arr_x_off_spans_1bipp'() {
        const [width, height] = this.size;
        const res = new Array(height);
        for (let y = 0; y < height; y++) {
            res[y] = this.calculate_arr_row_x_off_spans_1bipp(y);
        }
        return res;
    }
    'calculate_arr_rows_arr_x_on_spans_1bipp'() {
        const [width, height] = this.size;
        const res = new Array(height);
        for (let y = 0; y < height; y++) {
            res[y] = this.calculate_arr_row_x_on_spans_1bipp(y);
        }
        return res;
    }
    'count_row_off_xspans_1bipp'(y) {
        let res = 0;
        const width = this.size[0];
        let last_color = 0;
        let current_color;
        let ta_pos = new Uint16Array(2);
        ta_pos[1] = y;
        for (let x = 0; x < width; x++) {
            ta_pos[0] = x;
            current_color = this.get_pixel_1bipp(ta_pos);
            if (current_color === 0) {
                if (current_color === last_color) {
                    if (res.length === 0) {
                        res++;
                    } else {
                    }
                } else {
                    res++;
                    if (res.length === 0) {
                    } else {
                    }
                }
            }
            last_color = current_color;
        }
        return res;
    }
    'calculate_ta_row_x_on_x2ygbspans_1bipp'(y) {
        const count_xonspans = this.count_row_on_xspans_1bipp(y);
        const res = new Uint16Array(count_xonspans * 5);
        console.log('y, count_xonspans', y, count_xonspans);
        let i_w = 0;
        const width = this.size[0];
        let last_color = 1;
        let current_color;
        let ta_pos = new Uint16Array(2);
        ta_pos[1] = y;
        for (let x = 0; x < width; x++) {
            ta_pos[0] = x;
            current_color = this.get_pixel_1bipp(ta_pos);
            if (current_color === 1) {
                if (current_color === last_color) {
                    if (res.length === 0) {
                        res[i_w++] = x;
                        res[i_w++] = x;
                        res[i_w++] = y;
                        res[i_w++] = 0; // 0 for undefined group here....
                        res[i_w++] = 0; // 0 for undefined border status here
                    } else {
                        res[i_w - 4]++;
                    }
                } else {
                    res[i_w++] = x;
                    res[i_w++] = x;
                    res[i_w++] = y;
                    res[i_w++] = 0; // 0 for undefined group here....
                    res[i_w++] = 0; // 0 for undefined border status here
                }
            }
            last_color = current_color;
        }
        return res;
    }
    'calculate_arr_rows_ta_x_off_x2ygbspans_1bipp'() {
        const [width, height] = this.size;
        const res = new Array(height);
        for (let y = 0; y < height; y++) {
            res[y] = this.calculate_ta_row_x_off_x2ygbspans_1bipp(y);
        }
        return res;
    }
    'calculate_arr_rows_ta_x_on_x2ygbspans_1bipp'() {
        const [width, height] = this.size;
        const res = new Array(height);
        for (let y = 0; y < height; y++) {
            res[y] = this.calculate_ta_row_x_on_x2ygbspans_1bipp(y);
        }
        console.log('* this.ta', this.ta);
        console.log('this.size', this.size);
        return res;
    }
    'calculate_arr_row_x_on_spans_1bipp'(y) {
        const initial_implementation = () => {
                const res = [];
            const width = this.size[0];
            let last_color = 1;
            let current_color;
            let ta_pos = new Uint16Array(2);
            ta_pos[1] = y;
            for (let x = 0; x < width; x++) {
                ta_pos[0] = x;
                current_color = this.get_pixel_1bipp(ta_pos);
                if (current_color === 1) {
                    if (current_color === last_color) {
                        if (res.length === 0) {
                            res.push([x, x]);
                        } else {
                            res[res.length - 1][1]++;
                        }
                    } else {
                        res.push([x, x]);
                    }
                }
                last_color = current_color;
            }
            return res;
        }
        const _64x0 = BigInt(0);
        const _64x1 = ~_64x0;
        const broken_64bit_optimisation_attempt_inlined_consecutive_value_checking_no_x_loop_implementation = () => {
            const COLOR_LOOKING_FOR = 1;
            const COLOR_NOT_LOOKING_FOR = 0;
            const res = [];
            const width = this.size[0];
            const {ta} = this;
            const ab = ta.buffer;
            const dv = new DataView(ab);
            let last_color = 1; // Try keeping it for the moment.
            let current_color;
            const x_start = 0;
            let idx_bit_overall = ((y * this.size[0]) + x_start) | 0, idx_bit_within_byte = 0 | 0;
            let arr_last;
            let num_bits_remaining = width;
            let x = 0; // an x local value is fine - will update it as necessary
            let has_just_done_multi_read = false;
            let byte_val = 0 | 0;
            let _8_byte_val = BigInt(0);
            while (num_bits_remaining > 0) {
                idx_bit_within_byte = idx_bit_overall & 0b111;
                has_just_done_multi_read = false;
                if (idx_bit_within_byte === 0 && num_bits_remaining >= 8) {
                    if (num_bits_remaining >= 64) {
                        _8_byte_val = dv.getBigInt64(idx_bit_overall >> 3);
                        if (_8_byte_val === _64x0) {
                            last_color = 0;
                            has_just_done_multi_read = true;
                            idx_bit_overall += 64;
                            x += 64;
                            num_bits_remaining -= 64;
                        } else if (_8_byte_val === _64x1) {
                            if (last_color === 1) {
                                if (res.length === 0) {
                                    arr_last = [x, x + 63];
                                    res.push(arr_last);
                                } else {
                                    arr_last[1] += 64;
                                }
                            } else {
                                arr_last = [x, x + 63];
                                res.push(arr_last);
                            }
                            x += 8;
                            last_color = 1;
                            num_bits_remaining -= 64;
                            idx_bit_overall += 64;
                            has_just_done_multi_read = true;
                        }
                    } else {
                    }
                    if (!has_just_done_multi_read) {
                        byte_val = ta[idx_bit_overall >> 3];
                        if (byte_val === 255) {
                            if (last_color === 1) {
                                if (res.length === 0) {
                                    arr_last = [x, x + 7];
                                    res.push(arr_last);
                                } else {
                                    arr_last[1] += 8;
                                }
                            } else {
                                arr_last = [x, x + 7];
                                res.push(arr_last);
                            }
                            x += 8;
                            last_color = 1;
                            num_bits_remaining -= 8;
                            idx_bit_overall += 8;
                            has_just_done_multi_read = true;
                        } else if (byte_val === 0) {
                            last_color = 0;
                            has_just_done_multi_read = true;
                            idx_bit_overall += 8;
                            x += 8;
                            num_bits_remaining -= 8;
                        } else {
                        }
                    }
                }
                if (!has_just_done_multi_read) {
                    current_color = ((ta[idx_bit_overall >> 3] & 128 >> (idx_bit_within_byte)) !== 0) ? 1 : 0;
                    if (current_color === 1) {
                        if (current_color === last_color) {
                            if (res.length === 0) {
                                arr_last = [x, x];
                                res.push(arr_last);
                            } else {
                                arr_last[1]++;
                            }
                        } else {
                            arr_last = [x, x];
                            res.push(arr_last);
                        }
                    }
                    last_color = current_color;
                    idx_bit_overall++;
                    x++;
                    num_bits_remaining--;
                }
            }
            return res;
        }
        const inlined_consecutive_value_checking_no_x_loop_implementation = () => {
            const COLOR_LOOKING_FOR = 1;
            const COLOR_NOT_LOOKING_FOR = 0;
            const res = [];
            const width = this.size[0];
            const {ta} = this;
            const ab = ta.buffer;
            const dv = new DataView(ab);
            let last_color = 1; // Try keeping it for the moment.
            let current_color;
            const x_start = 0;
            let idx_bit_overall = ((y * this.size[0]) + x_start) | 0, idx_bit_within_byte = 0 | 0;
            let arr_last;
            let num_bits_remaining = width;
            let x = 0; // an x local value is fine - will update it as necessary
            let has_just_done_multi_read = false;
            let byte_val = 0 | 0;
            while (num_bits_remaining > 0) {
                idx_bit_within_byte = idx_bit_overall & 0b111;
                has_just_done_multi_read = false;
                if (idx_bit_within_byte === 0 && num_bits_remaining >= 8) {
                    /*
                    if (num_bits_remaining >= 64) {
                    } else {
                    }
                    */
                    byte_val = ta[idx_bit_overall >> 3];
                    if (byte_val === 255) {
                        if (last_color === 1) {
                            if (res.length === 0) {
                                arr_last = [x, x + 7];
                                res.push(arr_last);
                            } else {
                                arr_last[1] += 8;
                            }
                        } else {
                            arr_last = [x, x + 7];
                            res.push(arr_last);
                        }
                        x += 8;
                        last_color = 1;
                        num_bits_remaining -= 8;
                        idx_bit_overall += 8;
                        has_just_done_multi_read = true;
                    } else if (byte_val === 0) {
                        last_color = 0;
                        has_just_done_multi_read = true;
                        idx_bit_overall += 8;
                        x += 8;
                        num_bits_remaining -= 8;
                    } else {
                    }
                }
                if (!has_just_done_multi_read) {
                    current_color = ((ta[idx_bit_overall >> 3] & 128 >> (idx_bit_within_byte)) !== 0) ? 1 : 0;
                    if (current_color === 1) {
                        if (current_color === last_color) {
                            if (res.length === 0) {
                                arr_last = [x, x];
                                res.push(arr_last);
                            } else {
                                arr_last[1]++;
                            }
                        } else {
                            arr_last = [x, x];
                            res.push(arr_last);
                        }
                    }
                    last_color = current_color;
                    idx_bit_overall++;
                    x++;
                    num_bits_remaining--;
                }
            }
            return res;
        }
        const inlined_consecutive_value_checking_no_x_loop_delayed_push_implementation = () => {
            const COLOR_LOOKING_FOR = 1;
            const COLOR_NOT_LOOKING_FOR = 0;
            const res = [];
            const width = this.size[0];
            const {ta} = this;
            const ab = ta.buffer;
            const dv = new DataView(ab);
            let last_color = 1; // Try keeping it for the moment.
            let current_color;
            const x_start = 0;
            let idx_bit_overall = ((y * this.size[0]) + x_start) | 0, idx_bit_within_byte = 0 | 0;
            let arr_last;
            let num_bits_remaining = width;
            let x = 0; // an x local value is fine - will update it as necessary
            let has_just_done_multi_read = false;
            let byte_val = 0 | 0;
            while (num_bits_remaining > 0) {
                idx_bit_within_byte = idx_bit_overall & 0b111;
                has_just_done_multi_read = false;
                if (idx_bit_within_byte === 0 && num_bits_remaining >= 8) {
                    /*
                    if (num_bits_remaining >= 64) {
                    } else {
                    }
                    */
                    byte_val = ta[idx_bit_overall >> 3];
                    if (byte_val === 255) {
                        if (last_color === 1) {
                            if (res.length === 0) {
                                if (arr_last) {
                                    res.push(arr_last);
                                }
                                arr_last = [x, x + 7];
                            } else {
                                arr_last[1] += 8;
                            }
                        } else {
                            if (arr_last) {
                                res.push(arr_last);
                            }
                            arr_last = [x, x + 7];
                        }
                        x += 8;
                        last_color = 1;
                        num_bits_remaining -= 8;
                        idx_bit_overall += 8;
                        has_just_done_multi_read = true;
                    } else if (byte_val === 0) {
                        last_color = 0;
                        has_just_done_multi_read = true;
                        idx_bit_overall += 8;
                        x += 8;
                        num_bits_remaining -= 8;
                    } else {
                    }
                }
                if (!has_just_done_multi_read) {
                    current_color = ((ta[idx_bit_overall >> 3] & 128 >> (idx_bit_within_byte)) !== 0) ? 1 : 0;
                    if (current_color === 1) {
                        if (current_color === last_color) {
                            if (res.length === 0) {
                                if (arr_last) {
                                    res.push(arr_last);
                                }
                                arr_last = [x, x];
                            } else {
                                arr_last[1]++;
                            }
                        } else {
                            if (arr_last) {
                                res.push(arr_last);
                            }
                            arr_last = [x, x];
                        }
                    }
                    last_color = current_color;
                    idx_bit_overall++;
                    x++;
                    num_bits_remaining--;
                }
            }
            if (arr_last) {
                res.push(arr_last);
            }
            return res;
        }
        return inlined_consecutive_value_checking_no_x_loop_delayed_push_implementation();
    }
}
const get_contig_x_spans_AND = (ta_contig_x_spans_1, ta_contig_x_spans_2) => {
    if (true || ta_contig_x_spans_1.length === ta_contig_x_spans_2.length) {
        const parallel_iterate_inputs = () => {
            const starting_color = 0;
            const l1 = ta_contig_x_spans_1.length, l2 = ta_contig_x_spans_2.length;
            let r_pos_in_1 = 0, r_pos_in_2 = 0;
            let px_idx_in_1 = 0, px_idx_in_2 = 0;
            let color_in_1 = starting_color, color_in_2 = starting_color;
            let color_in_output = starting_color;
            let pos_idx_in_output = 0;
            let are_in_sync = true;
            let i_read_step = 0;
            const arr_res = [];
            const read_step = () => {
                const span_length_from_1 = ta_contig_x_spans_1[r_pos_in_1], span_length_from_2 = ta_contig_x_spans_2[r_pos_in_2];
                console.log('');
                console.log('i_read_step', i_read_step);
                console.log('are_in_sync', are_in_sync);
                console.log('span_length_from_1', span_length_from_1);
                console.log('span_length_from_2', span_length_from_2);
                if (are_in_sync) {
                    if (px_idx_in_1 === px_idx_in_2) {
                        if (span_length_from_1 === span_length_from_2) {
                            if (are_in_sync) {
                                const same_length_in_sync = span_length_from_1;
                                console.log('same_length_in_sync', same_length_in_sync);
                                px_idx_in_1 += same_length_in_sync;
                                px_idx_in_2 += same_length_in_sync;
                                pos_idx_in_output += same_length_in_sync;
                                r_pos_in_1++;
                                r_pos_in_2++;
                                arr_res.push(same_length_in_sync);
                                color_in_1 = color_in_1 === 1 ? 0 : 1;
                                color_in_2 = color_in_2 === 1 ? 0 : 1;
                                color_in_output = color_in_output === 1 ? 0 : 1;
                            } else {
                                console.trace();
                                throw 'NYI';
                            }
                        } else if (span_length_from_1 > span_length_from_2) {
                            if (are_in_sync) {
                                const num_remaining_in_sync = span_length_from_2;
                                arr_res.push(num_remaining_in_sync);
                                console.trace();
                                throw 'NYI';
                            } else {
                                console.trace();
                                throw 'NYI';
                            }
                        } else {
                            console.trace();
                            throw 'NYI';
                        }
                    } else {
                        console.trace();
                        throw 'NYI';
                    }
                } else {
                    console.trace();
                    throw 'NYI';
                }
                i_read_step++;
            }
            read_step();
            console.log('arr_res', arr_res);
            read_step();
        }
        parallel_iterate_inputs();
    } else {
        console.trace();
        throw 'Length Mismatch';
    }
}
Pixel_Buffer_Specialised_Enh.get_contig_x_spans_AND = get_contig_x_spans_AND;
module.exports = Pixel_Buffer_Specialised_Enh;