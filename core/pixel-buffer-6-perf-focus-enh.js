const Pixel_Buffer_Idiomatic_Enh = require('./pixel-buffer-5-idiomatic-enh');
const {unsafeGetPixel} = require('./pixel-buffer-pixel-access');

const Pixel_Pos_List = require('./pixel-pos-list');
const get_idx_movement_vectors = (f32a_convolution, bpp, bpr) => {
    const c_length = f32a_convolution.length;
    const dimension_size = Math.sqrt(c_length);
    const padding = (dimension_size - 1) / 2;
    const movement_vectors = new Int8Array(c_length * 2);
    let x, y, pos = 0;
    const idx_movement_vectors = new Int32Array(c_length);
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
        return this.ta.byteLength % 8 === 0;
    }
    get ta_is_32bit_divisible() {
        return this.ta.byteLength % 4 === 0;
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
            }
        }
        return false;
    }
    get is_32bit_divisible_image() {
        return this.ta.byteLength % 4 === 0;
    }
    get is_32_divisible_bits_per_row() {
        return this.bits_per_row % 32 === 0;
    }
    get number_of_32bit_segments_per_32bit_divisible_row() {
        return this.bits_per_row / 32;
    }
    get is_64bit_divisible_image() {
        return this.ta.byteLength % 8 === 0;
    }
    get is_64_divisible_bits_per_row() {
        return this.bits_per_row % 64 === 0;
    }
    get number_of_64bit_segments_per_64bit_divisible_row() {
        return this.bits_per_row / 64;
    }
    get bits_per_image_1bipp() {
        return this.size[0] * this.size[1];
    }
    get number_of_64bit_segments_per_64bit_divisible_image() {
        return this.bits_per_image_1bipp / 64;
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
        const width = this.size[0], height = this.size[1];
        const rowStrideBytes = this.bytes_per_row;
        if (rowStrideBytes * 8 === width) {
            const r1shifted_ta = right_shift_32bit_with_carry(ta);
            const xored_against_orig = xor_typed_arrays(ta, r1shifted_ta);
            each_1_index(xored_against_orig, cb);
        } else {
            let previous = 0;
            let logicalIndex = 0;
            for (let y = 0; y < height; y++) {
                const rowStart = y * rowStrideBytes;
                for (let x = 0; x < width; x++, logicalIndex++) {
                    const current = (ta[rowStart + (x >> 3)] & (128 >> (x & 7))) !== 0 ? 1 : 0;
                    if (current !== previous) cb(logicalIndex);
                    previous = current;
                }
            }
        }
    }
    count_1bipp_wrapping_x_span_color_toggles() {
        const {ta} = this;
        const width = this.size[0], height = this.size[1];
        const rowStrideBytes = this.bytes_per_row;
        if (rowStrideBytes * 8 === width) {
            const r1shifted_ta = right_shift_32bit_with_carry(ta);
            const xored_against_orig = xor_typed_arrays(ta, r1shifted_ta);
            return count_1s(xored_against_orig);
        }
        let previous = 0;
        let count = 0;
        for (let y = 0; y < height; y++) {
            const rowStart = y * rowStrideBytes;
            for (let x = 0; x < width; x++) {
                const current = (ta[rowStart + (x >> 3)] & (128 >> (x & 7))) !== 0 ? 1 : 0;
                if (current !== previous) count++;
                previous = current;
            }
        }
        return count;
    }
    'place_image_from_pixel_buffer'(pixel_buffer, dest_pos, options = {}) {
        if (!pixel_buffer || pixel_buffer.bipp !== this.bipp) {
            throw new TypeError('Source and destination Pixel Buffers must use the same pixel format');
        }
        if (!dest_pos || !Number.isInteger(dest_pos[0]) || !Number.isInteger(dest_pos[1])) {
            throw new TypeError('Destination position must contain two integers');
        }

        const destX = dest_pos[0], destY = dest_pos[1];
        const sourceWidth = pixel_buffer.size[0], sourceHeight = pixel_buffer.size[1];
        // Snapshot only self-placement; row-at-a-time writes could otherwise
        // overwrite a later source row in an overlapping move.
        const sourceTa = pixel_buffer === this ? pixel_buffer.ta.slice() : pixel_buffer.ta;
        if (this.bipp !== 1 && destX >= 0 && destY >= 0 &&
            destX + sourceWidth <= this.size[0] && destY + sourceHeight <= this.size[1]) {
            const bytesPerPixel = this.bytes_per_pixel;
            const sourceRowDataBytes = sourceWidth * bytesPerPixel;
            const targetXByte = destX * bytesPerPixel;
            const targetTa = this.ta;
            const sourceStride = pixel_buffer.bytes_per_row;
            const targetStride = this.bytes_per_row;
            for (let y = 0; y < sourceHeight; y++) {
                const sourceStart = y * sourceStride;
                const targetStart = (destY + y) * targetStride + targetXByte;
                targetTa.set(
                    sourceTa.subarray(sourceStart, sourceStart + sourceRowDataBytes),
                    targetStart
                );
            }
            return this;
        }

        const sourceX = Math.max(0, -destX);
        const sourceY = Math.max(0, -destY);
        const targetX = Math.max(0, destX);
        const targetY = Math.max(0, destY);
        const copyWidth = Math.min(sourceWidth - sourceX, this.size[0] - targetX);
        const copyHeight = Math.min(sourceHeight - sourceY, this.size[1] - targetY);
        if (copyWidth <= 0 || copyHeight <= 0) return this;

        if (this.bipp === 1) {
            const useOr = options.or === true;
            for (let y = 0; y < copyHeight; y++) {
                const sourceRow = (sourceY + y) * pixel_buffer.bytes_per_row;
                const targetRow = (targetY + y) * this.bytes_per_row;
                for (let x = 0; x < copyWidth; x++) {
                    const sx = sourceX + x;
                    const tx = targetX + x;
                    const sourceOn = (sourceTa[sourceRow + (sx >> 3)] & (0x80 >> (sx & 7))) !== 0;
                    const targetByte = targetRow + (tx >> 3);
                    const targetMask = 0x80 >> (tx & 7);
                    if (sourceOn) {
                        this.ta[targetByte] |= targetMask;
                    } else if (!useOr) {
                        this.ta[targetByte] &= ~targetMask & 255;
                    }
                }
            }
        } else {
            const bytesPerPixel = this.bytes_per_pixel;
            const copyBytes = copyWidth * bytesPerPixel;
            for (let y = 0; y < copyHeight; y++) {
                const sourceStart = (sourceY + y) * pixel_buffer.bytes_per_row + sourceX * bytesPerPixel;
                const targetStart = (targetY + y) * this.bytes_per_row + targetX * bytesPerPixel;
                this.ta.set(sourceTa.subarray(sourceStart, sourceStart + copyBytes), targetStart);
            }
        }
        return this;
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
            const offset = [arr_points[0][0], arr_points[0][1]];
            const pb_polygon = new this.constructor({
                'bits_per_pixel': 1,
                'size': [1, 1]
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
        const dimensionSize = Math.sqrt(f32a_convolution.length);
        if (!Number.isInteger(dimensionSize) || (dimensionSize & 1) === 0) {
            throw new RangeError('Convolution kernel must have an odd square length');
        }
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
            if (bpp === 1) {
                this.padded_each_pixel_index(padding, (px_idx) => {
                    let value = 0;
                    for (ii = 0; ii < c_length; ii++) {
                        value += f32a_convolution[ii] * buf[px_idx + idx_movement_vectors[ii]];
                    }
                    if (value < 0) value = 0;
                    if (value > 255) value = 255;
                    buf_res[px_idx] = Math.round(value);
                });
            } else if (bpp === 3) {
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
                    // Convolve color channels while preserving the source alpha.
                    // A center-identity kernel must be an identity for RGBA too.
                    ca = buf[px_idx + 3];
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
        if (bypp === 1) {
            if (i_channel !== 0) {
                throw new RangeError('An 8bipp Pixel Buffer only has channel 0');
            }
            return this.clone();
        } else if (bypp === 3 || bypp === 4) {
            if (!Number.isInteger(i_channel) || i_channel < 0 || i_channel >= bypp) {
                throw new RangeError('Channel index is outside the pixel format');
            }
            const res_channel_ta = new this.constructor({
                size: this.size,
                bits_per_pixel: 8
            });
            const target = res_channel_ta.ta;
            const width = this.size[0], height = this.size[1];
            const sourceStrideBytes = this.bytes_per_row;
            if (sourceStrideBytes === width * bypp) {
                let i_byte = i_channel;
                for (let i_px = 0, numPixels = width * height; i_px < numPixels; i_px++) {
                    target[i_px] = ta[i_byte];
                    i_byte += bypp;
                }
            } else {
                let i_px = 0;
                for (let y = 0; y < height; y++) {
                    let i_byte = y * sourceStrideBytes + i_channel;
                    for (let x = 0; x < width; x++) {
                        target[i_px++] = ta[i_byte];
                        i_byte += bypp;
                    }
                }
            }
            return res_channel_ta;
        } else {
            throw new Error('extract_channel does not support packed 1bipp buffers');
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
        const [width, height] = this.size;
        const buf = this.buffer;
        const rowStrideBytes = this.bytes_per_row;

        // Keep the common tightly-packed scan linear. Coordinate arithmetic is
        // only paid once, when a matching pixel is actually found.
        if (rowStrideBytes === width * 4) {
            const pixelCount = width * height;
            for (let pixel = 0, byte = 0; pixel < pixelCount; pixel++, byte += 4) {
                if (buf[byte] === r && buf[byte + 1] === g &&
                    buf[byte + 2] === b && buf[byte + 3] === a) {
                    return [pixel % width, Math.floor(pixel / width)];
                }
            }
        } else {
            for (let y = 0; y < height; y++) {
                let byte = y * rowStrideBytes;
                for (let x = 0; x < width; x++, byte += 4) {
                    if (buf[byte] === r && buf[byte + 1] === g &&
                        buf[byte + 2] === b && buf[byte + 3] === a) {
                        return [x, y];
                    }
                }
            }
        }
    }
    'flood_fill_small_color_blocks'(max_size, r, g, b, a) {
        if (!Number.isInteger(max_size) || max_size <= 0) {
            throw new RangeError('max_size must be a positive integer');
        }
        if (this.bipp !== 8 && this.bipp !== 32) {
            throw new Error('flood_fill_small_color_blocks supports 8bipp and 32bipp buffers');
        }

        const width = this.size[0], height = this.size[1];
        const bypp = this.bytes_per_pixel;
        const stride = this.bytes_per_row;
        const ta = this.ta;
        for (let y = 0; y < height; y++) {
            let byte = y * stride;
            for (let x = 0; x < width; x++, byte += bypp) {
                const alreadyReplacement = ta[byte] === r &&
                    (bypp === 1 || (ta[byte + 1] === g && ta[byte + 2] === b &&
                        (bypp === 3 || ta[byte + 3] === a)));
                if (!alreadyReplacement && this.measure_color_region_size(x, y, max_size) < max_size) {
                    this.flood_fill(x, y, r, g, b, a);
                }
            }
        }
        return this;
    }
    self_replace_color(target_color, replacement_color) {
        const bpp = this.bytes_per_pixel;
        const buf = this.buffer;
        const l = buf.length;
        if (this.bipp === 1) {
            if (target_color !== replacement_color) {
                this.color_whole(replacement_color);
            }
        } else if (bpp === 1) {
            const width = this.size[0], height = this.size[1];
            if (this.bytes_per_row === width) {
                for (let c = 0; c < l; c++) {
                    if (buf[c] === target_color) buf[c] = replacement_color;
                }
            } else {
                for (let y = 0; y < height; y++) {
                    const rowStart = y * this.bytes_per_row;
                    const rowEnd = rowStart + width;
                    for (let c = rowStart; c < rowEnd; c++) {
                        if (buf[c] === target_color) buf[c] = replacement_color;
                    }
                    buf.fill(0, rowEnd, rowStart + this.bytes_per_row);
                }
            }
        } else if (bpp === 3 || bpp === 4) {
            const width = this.size[0], height = this.size[1];
            const rowDataBytes = width * bpp;
            for (let y = 0; y < height; y++) {
                const rowStart = y * this.bytes_per_row;
                const rowEnd = rowStart + rowDataBytes;
                for (let byte = rowStart; byte < rowEnd; byte += bpp) {
                    const matches = buf[byte] === target_color[0] &&
                        buf[byte + 1] === target_color[1] &&
                        buf[byte + 2] === target_color[2] &&
                        (bpp === 3 || buf[byte + 3] === target_color[3]);
                    if (matches) {
                        buf[byte] = replacement_color[0];
                        buf[byte + 1] = replacement_color[1];
                        buf[byte + 2] = replacement_color[2];
                        if (bpp === 4) buf[byte + 3] = replacement_color[3];
                    }
                }
                if (this.bytes_per_row !== rowDataBytes) {
                    buf.fill(0, rowEnd, rowStart + this.bytes_per_row);
                }
            }
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
        const width = this.size[0], height = this.size[1];
        const rowStrideBytes = this.bytes_per_row;
        if (rowStrideBytes === width * 4) {
            for (let byte = 0, end = buf_read.length; byte < end; byte += 4) {
                if (buf_read[byte] === ta_u8[0] && buf_read[byte + 1] === ta_u8[1] &&
                    buf_read[byte + 2] === ta_u8[2] && buf_read[byte + 3] === ta_u8[3]) {
                    buf_read[byte] = ta_u8[4];
                    buf_read[byte + 1] = ta_u8[5];
                    buf_read[byte + 2] = ta_u8[6];
                    buf_read[byte + 3] = ta_u8[7];
                }
            }
        } else {
            for (let y = 0; y < height; y++) {
                const rowEnd = y * rowStrideBytes + width * 4;
                for (let byte = y * rowStrideBytes; byte < rowEnd; byte += 4) {
                    if (buf_read[byte] === ta_u8[0] && buf_read[byte + 1] === ta_u8[1] &&
                        buf_read[byte + 2] === ta_u8[2] && buf_read[byte + 3] === ta_u8[3]) {
                        buf_read[byte] = ta_u8[4];
                        buf_read[byte + 1] = ta_u8[5];
                        buf_read[byte + 2] = ta_u8[6];
                        buf_read[byte + 3] = ta_u8[7];
                    }
                }
            }
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
        let ta_u8 = new Uint8Array(4);
        ta_u8[0] = r;
        ta_u8[1] = g;
        ta_u8[2] = b;
        ta_u8[3] = a;
        const width = this.size[0], height = this.size[1];
        const sourceStride = this.bytes_per_row;
        const targetStride = res.bytes_per_row;
        if (sourceStride === width * 4 && targetStride === width * 4) {
            for (let sourceByte = 0, targetByte = 0, end = buf_read.length;
                sourceByte < end;
                sourceByte += 4, targetByte += 4) {
                const matches = buf_read[sourceByte] === ta_u8[0] &&
                    buf_read[sourceByte + 1] === ta_u8[1] &&
                    buf_read[sourceByte + 2] === ta_u8[2] &&
                    buf_read[sourceByte + 3] === ta_u8[3];
                const value = matches ? 0 : 255;
                buf_write[targetByte] = value;
                buf_write[targetByte + 1] = value;
                buf_write[targetByte + 2] = value;
                buf_write[targetByte + 3] = 255;
            }
        } else {
            for (let y = 0; y < height; y++) {
                let sourceByte = y * sourceStride;
                let targetByte = y * targetStride;
                for (let x = 0; x < width; x++, sourceByte += 4, targetByte += 4) {
                    const matches = buf_read[sourceByte] === ta_u8[0] &&
                        buf_read[sourceByte + 1] === ta_u8[1] &&
                        buf_read[sourceByte + 2] === ta_u8[2] &&
                        buf_read[sourceByte + 3] === ta_u8[3];
                    const value = matches ? 0 : 255;
                    buf_write[targetByte] = value;
                    buf_write[targetByte + 1] = value;
                    buf_write[targetByte + 2] = value;
                    buf_write[targetByte + 3] = 255;
                }
            }
        }
        return res;
    }
    count_pixels_with_color(...args) {
        const {bipp} = this;
        if (bipp === 32) {
            const color = args.length === 1 && args[0] != null && typeof args[0] !== 'number'
                ? args[0]
                : args;
            const r = color[0], g = color[1], b = color[2], a = color[3];
            const buf_read = this.buffer;
            let count = 0;
            const width = this.size[0], height = this.size[1];
            if (this.bytes_per_row === width * 4) {
                for (let byte = 0, end = buf_read.length; byte < end; byte += 4) {
                    if (buf_read[byte] === r && buf_read[byte + 1] === g &&
                        buf_read[byte + 2] === b && buf_read[byte + 3] === a) {
                        count++;
                    }
                }
            } else {
                for (let y = 0; y < height; y++) {
                    let byte = y * this.bytes_per_row;
                    for (let x = 0; x < width; x++) {
                        if (buf_read[byte] === r && buf_read[byte + 1] === g &&
                            buf_read[byte + 2] === b && buf_read[byte + 3] === a) {
                            count++;
                        }
                        byte += 4;
                    }
                }
            }
            return count;
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
        let ta_u8 = new Uint8Array(4);
        ta_u8[0] = r;
        ta_u8[1] = g;
        ta_u8[2] = b;
        ta_u8[3] = a;
        const width = this.size[0], height = this.size[1];
        const sourceStride = this.bytes_per_row;
        const targetStride = res.bytes_per_row;
        if (sourceStride === width * 4 && targetStride === width) {
            for (let sourceByte = 0, targetByte = 0, end = buf_read.length;
                sourceByte < end;
                sourceByte += 4, targetByte++) {
                if (buf_read[sourceByte] === ta_u8[0] &&
                    buf_read[sourceByte + 1] === ta_u8[1] &&
                    buf_read[sourceByte + 2] === ta_u8[2] &&
                    buf_read[sourceByte + 3] === ta_u8[3]) {
                    buf_write[targetByte] = 255;
                }
            }
        } else {
            for (let y = 0; y < height; y++) {
                let sourceByte = y * sourceStride;
                let targetByte = y * targetStride;
                for (let x = 0; x < width; x++, sourceByte += 4, targetByte++) {
                    if (buf_read[sourceByte] === ta_u8[0] &&
                        buf_read[sourceByte + 1] === ta_u8[1] &&
                        buf_read[sourceByte + 2] === ta_u8[2] &&
                        buf_read[sourceByte + 3] === ta_u8[3]) {
                        buf_write[targetByte] = 255;
                    }
                }
            }
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
            const ta_visiting_pixels = new Int32Array(scratch_32[2] * 2);
            scratch_32[8] = y * this.bytes_per_row + x * scratch_32[3];
            ta8_pixels[0] = buffer[scratch_32[8]++];
            ta8_pixels[1] = buffer[scratch_32[8]++];
            ta8_pixels[2] = buffer[scratch_32[8]++];
            ta8_pixels[3] = buffer[scratch_32[8]++];
            ta_visiting_pixels[0] = x;
            ta_visiting_pixels[1] = y;
            ta_pixels_visited[x + y * scratch_32[0]] = 255;
            scratch_32[7] = 2;
            while (scratch_32[6] < scratch_32[7] && scratch_32[10] < scratch_32[9]) {
                scratch_32[4] = ta_visiting_pixels[scratch_32[6]++]; 
                scratch_32[5] = ta_visiting_pixels[scratch_32[6]++]; 
                scratch_32[8] = scratch_32[5] * this.bytes_per_row + scratch_32[4] * scratch_32[3];
                ta8_pixels[4] = buffer[scratch_32[8]++];
                ta8_pixels[5] = buffer[scratch_32[8]++];
                ta8_pixels[6] = buffer[scratch_32[8]++];
                ta8_pixels[7] = buffer[scratch_32[8]++];
                ta16_pixels[0] = ta8_pixels[4] - ta8_pixels[0];
                ta16_pixels[1] = ta8_pixels[5] - ta8_pixels[1];
                ta16_pixels[2] = ta8_pixels[6] - ta8_pixels[2];
                ta16_pixels[3] = ta8_pixels[7] - ta8_pixels[3];
                if (ta16_pixels[0] === 0 && ta16_pixels[1] === 0 && ta16_pixels[2] === 0 && ta16_pixels[3] === 0) {
                    scratch_32[10]++;
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
                const ta_visiting_pixels = new Int32Array(scratch_32[2] * 2);
                scratch_32[8] = y * this.bytes_per_row + x * scratch_32[3];
                ta8_pixels[0] = buffer[scratch_32[8]++];
                ta_visiting_pixels[0] = x;
                ta_visiting_pixels[1] = y;
                ta_pixels_visited[x + y * scratch_32[0]] = 255;
                scratch_32[7] = 2;
                while (scratch_32[6] < scratch_32[7] && scratch_32[10] < scratch_32[9]) {
                    scratch_32[4] = ta_visiting_pixels[scratch_32[6]++]; 
                    scratch_32[5] = ta_visiting_pixels[scratch_32[6]++]; 
                    scratch_32[8] = scratch_32[5] * this.bytes_per_row + scratch_32[4] * scratch_32[3];
                    ta8_pixels[4] = buffer[scratch_32[8]++];
                    ta16_pixels[0] = ta8_pixels[4] - ta8_pixels[0];
                    if (ta16_pixels[0] === 0) {
                        scratch_32[10]++;
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
                }
                return scratch_32[10];
            })();
        } else {
            throw 'unsuppored bytes_per_pixel ' + this.bytes_per_pixel
        }
    }
    'get_pixel_pos_list_of_pixels_with_color'(color) {
        const res = new Pixel_Pos_List();
        const bipp = this.bipp;
        const offsetX = this.pos ? this.pos[0] : 0;
        const offsetY = this.pos ? this.pos[1] : 0;
        this.each_pixel((pos, pxColor) => {
            const matches = bipp === 1 || bipp === 8
                ? pxColor === color
                : bipp === 24
                    ? pxColor[0] === color[0] && pxColor[1] === color[1] && pxColor[2] === color[2]
                    : pxColor[0] === color[0] && pxColor[1] === color[1] &&
                        pxColor[2] === color[2] && pxColor[3] === color[3];
            if (matches) {
                res.add(new Uint16Array([pos[0] + offsetX, pos[1] + offsetY]));
            }
        });
        if (this.pos) res.pos = this.pos;
        res.fix();
        return res;
    }
    'get_ppl_color_region'(pos) {
        console.trace();
        throw 'NYI';
    }
    /**
     * Four-connected scanline flood fill shared by the public 1/8/24/32bipp
     * entry points. Filled spans are marked before they are queued, so a
     * separate image-sized visited bitmap is unnecessary and no coordinate can
     * be queued twice. The typed stack grows in small chunks and is bounded by
     * the number of logical pixels rather than a fixed global reservation.
     *
     * @returns {number} the number of logical pixels changed
     */
    '_scanline_flood_fill'(x, y, r, g, b, a, onPixelFilled) {
        const {bipp, ta} = this;
        if (bipp !== 1 && bipp !== 8 && bipp !== 24 && bipp !== 32) {
            throw new Error('Unsupported bipp: ' + bipp);
        }

        const width = this.size[0];
        const height = this.size[1];
        if (!Number.isInteger(x) || !Number.isInteger(y) ||
            x < 0 || y < 0 || x >= width || y >= height) {
            throw new RangeError('Flood-fill start position is outside the Pixel Buffer');
        }
        if (onPixelFilled !== undefined && typeof onPixelFilled !== 'function') {
            throw new TypeError('onPixelFilled must be a function when supplied');
        }

        const rowStrideBytes = this.bytes_per_row;
        const bytesPerPixel = this.bytes_per_pixel;
        const replacement = new Uint8Array(4);
        if (bipp === 1) {
            // Match set_pixel_1bipp's established convention: only numeric 1
            // means on; every other value means off.
            replacement[0] = r === 1 ? 1 : 0;
        } else {
            replacement[0] = r;
            replacement[1] = g;
            replacement[2] = b;
            replacement[3] = a;
        }

        let target0;
        let target1 = 0;
        let target2 = 0;
        let target3 = 0;
        if (bipp === 1) {
            const startByte = y * rowStrideBytes + Math.floor(x / 8);
            target0 = (ta[startByte] & (0x80 >> (x % 8))) === 0 ? 0 : 1;
        } else {
            const startByte = y * rowStrideBytes + x * bytesPerPixel;
            target0 = ta[startByte];
            if (bytesPerPixel >= 3) {
                target1 = ta[startByte + 1];
                target2 = ta[startByte + 2];
            }
            if (bytesPerPixel === 4) target3 = ta[startByte + 3];
        }

        if (target0 === replacement[0] &&
            (bipp === 1 || bipp === 8 ||
                (target1 === replacement[1] && target2 === replacement[2] &&
                    (bipp === 24 || target3 === replacement[3])))) {
            return 0;
        }

        const matchesTarget = bipp === 1
            ? (px, py) => {
                const byte = py * rowStrideBytes + Math.floor(px / 8);
                const value = (ta[byte] & (0x80 >> (px % 8))) === 0 ? 0 : 1;
                return value === target0;
            }
            : bipp === 8
                ? (px, py) => ta[py * rowStrideBytes + px] === target0
                : bipp === 24
                    ? (px, py) => {
                        const byte = py * rowStrideBytes + px * 3;
                        return ta[byte] === target0 && ta[byte + 1] === target1 &&
                            ta[byte + 2] === target2;
                    }
                    : (px, py) => {
                        const byte = py * rowStrideBytes + px * 4;
                        return ta[byte] === target0 && ta[byte + 1] === target1 &&
                            ta[byte + 2] === target2 && ta[byte + 3] === target3;
                    };

        let changedPixelCount = 0;
        const paintSpan = bipp === 1
            ? (left, right, row) => {
                const rowStart = row * rowStrideBytes;
                const firstByte = Math.floor(left / 8);
                const lastByte = Math.floor(right / 8);
                const firstMask = 0xFF >>> (left % 8);
                const lastMask = (0xFF << (7 - (right % 8))) & 0xFF;
                const value = replacement[0];

                if (firstByte === lastByte) {
                    const mask = firstMask & lastMask;
                    if (value === 1) ta[rowStart + firstByte] |= mask;
                    else ta[rowStart + firstByte] &= ~mask & 0xFF;
                } else {
                    if (value === 1) ta[rowStart + firstByte] |= firstMask;
                    else ta[rowStart + firstByte] &= ~firstMask & 0xFF;
                    if (lastByte > firstByte + 1) {
                        ta.fill(value === 1 ? 0xFF : 0, rowStart + firstByte + 1, rowStart + lastByte);
                    }
                    if (value === 1) ta[rowStart + lastByte] |= lastMask;
                    else ta[rowStart + lastByte] &= ~lastMask & 0xFF;
                }
                changedPixelCount += right - left + 1;
                if (onPixelFilled) {
                    for (let px = left; px <= right; px++) onPixelFilled(px, row);
                }
            }
            : bipp === 8
                ? (left, right, row) => {
                    ta.fill(replacement[0], row * rowStrideBytes + left,
                        row * rowStrideBytes + right + 1);
                    changedPixelCount += right - left + 1;
                    if (onPixelFilled) {
                        for (let px = left; px <= right; px++) onPixelFilled(px, row);
                    }
                }
                : (left, right, row) => {
                    let byte = row * rowStrideBytes + left * bytesPerPixel;
                    for (let px = left; px <= right; px++, byte += bytesPerPixel) {
                        ta[byte] = replacement[0];
                        ta[byte + 1] = replacement[1];
                        ta[byte + 2] = replacement[2];
                        if (bytesPerPixel === 4) ta[byte + 3] = replacement[3];
                        if (onPixelFilled) onPixelFilled(px, row);
                    }
                    changedPixelCount += right - left + 1;
                };

        const pixelCount = width * height;
        const StackArray = width <= 0xFFFFFFFF && height <= 0xFFFFFFFF
            ? Uint32Array
            : Float64Array;
        const stackChunks = [];
        const stackLengths = [];
        let allocatedSpanCapacity = 0;
        let activeChunk = 0;
        let stackSize = 0;

        const allocateChunk = () => {
            const spanCapacity = Math.min(256, pixelCount - allocatedSpanCapacity);
            if (spanCapacity <= 0) {
                throw new RangeError('Flood-fill span stack exceeded the logical pixel count');
            }
            stackChunks.push(new StackArray(spanCapacity * 3));
            stackLengths.push(0);
            allocatedSpanCapacity += spanCapacity;
        };
        allocateChunk();

        const pushSpan = (left, right, row) => {
            let chunk = stackChunks[activeChunk];
            let length = stackLengths[activeChunk];
            if (length === chunk.length) {
                activeChunk++;
                if (activeChunk === stackChunks.length) allocateChunk();
                chunk = stackChunks[activeChunk];
                length = stackLengths[activeChunk];
            }
            chunk[length] = left;
            chunk[length + 1] = right;
            chunk[length + 2] = row;
            stackLengths[activeChunk] = length + 3;
            stackSize++;
        };

        const fillAndPushSpan = (seedX, row) => {
            let left = seedX;
            let right = seedX;
            while (left > 0 && matchesTarget(left - 1, row)) left--;
            while (right + 1 < width && matchesTarget(right + 1, row)) right++;
            paintSpan(left, right, row);
            pushSpan(left, right, row);
            return right;
        };

        fillAndPushSpan(x, y);
        while (stackSize > 0) {
            const chunk = stackChunks[activeChunk];
            const offset = stackLengths[activeChunk] - 3;
            const left = chunk[offset];
            const right = chunk[offset + 1];
            const row = chunk[offset + 2];
            stackLengths[activeChunk] = offset;
            stackSize--;
            if (offset === 0 && activeChunk > 0) activeChunk--;

            const firstAdjacentRow = row > 0 ? row - 1 : -1;
            const secondAdjacentRow = row + 1 < height ? row + 1 : -1;
            for (let adjacentPass = 0; adjacentPass < 2; adjacentPass++) {
                const adjacentRow = adjacentPass === 0 ? firstAdjacentRow : secondAdjacentRow;
                if (adjacentRow < 0) continue;
                let scanX = left;
                while (scanX <= right) {
                    while (scanX <= right && !matchesTarget(scanX, adjacentRow)) scanX++;
                    if (scanX <= right) {
                        scanX = fillAndPushSpan(scanX, adjacentRow) + 1;
                    }
                }
            }
        }

        return changedPixelCount;
    }
    'flood_fill_self_get_pixel_pos_list'(pos, color) {
        if (!(pos instanceof Uint16Array || pos instanceof Uint32Array)) {
            throw new TypeError('pos must be a Uint16Array or Uint32Array');
        }
        if (this.size[0] > 65536 || this.size[1] > 65536) {
            throw new RangeError('Pixel_Pos_List cannot represent coordinates above 65535');
        }
        const res = new Pixel_Pos_List();
        let r = color;
        let g;
        let b;
        let a;
        if (this.bipp === 24 || this.bipp === 32) {
            if (!color || typeof color !== 'object' || color.length < this.bytes_per_pixel) {
                throw new TypeError(`A ${this.bytes_per_pixel}-component replacement color is required`);
            }
            r = color[0];
            g = color[1];
            b = color[2];
            a = color[3];
        }
        this._scanline_flood_fill(pos[0], pos[1], r, g, b, a, (px, py) => {
            res.add([px, py]);
        });
        res.fix();
        return res;
    }
    'flood_fill_c1_1bipp'(pos) {
        if (!pos || typeof pos !== 'object' || pos.length < 2) {
            throw new TypeError('pos must contain x and y coordinates');
        }
        return this.flood_fill_1bipp(pos[0], pos[1], 1);
    }
    'flood_fill_1bipp'(x, y, color) {
        if (this.bipp !== 1) {
            throw new Error('flood_fill_1bipp requires a 1bipp Pixel Buffer');
        }
        const changedPixelCount = this._scanline_flood_fill(x, y, color);
        return changedPixelCount === 0 ? 0 : this;
    }
    'flood_fill'(x, y, r, g, b, a) {
        const {bipp} = this;
        if (bipp === 1) {
            return this.flood_fill_1bipp(x, y, r);
        }
        if (bipp !== 8 && bipp !== 24 && bipp !== 32) {
            throw new Error('Unsupported bipp: ' + bipp);
        }
        this._scanline_flood_fill(x, y, r, g, b, a);
        return this;
    }
    'invert'() {
        const {
            bipp
        } = this;
        if (bipp === 1) {
            const {ta} = this;
            const width = this.size[0], height = this.size[1];
            const rowDataBytes = this.layout ? this.layout.rowDataBytes : Math.ceil(width / 8);
            const rowStrideBytes = this.bytes_per_row;
            const tailBits = width & 7;
            const tailMask = this.layout
                ? this.layout.tailMask
                : (tailBits === 0 ? 0xFF : (0xFF << (8 - tailBits)) & 0xFF);

            if (tailMask === 0xFF && rowDataBytes === rowStrideBytes) {
                const l = ta.length;
                for (let i = 0; i < l; i++) ta[i] = ~ta[i] & 255;
            } else {
                for (let y = 0; y < height; y++) {
                    const rowStart = y * rowStrideBytes;
                    const tailByte = rowStart + rowDataBytes - 1;
                    for (let i = rowStart; i < tailByte; i++) ta[i] = ~ta[i] & 255;
                    ta[tailByte] = (~ta[tailByte] & 255) & tailMask;
                    ta.fill(0, rowStart + rowDataBytes, rowStart + rowStrideBytes);
                }
            }
        } else if (bipp === 8) {
            const width = this.size[0], height = this.size[1];
            if (this.bytes_per_row === width) {
                for (let byte = 0, end = this.ta.length; byte < end; byte++) {
                    this.ta[byte] = 255 - this.ta[byte];
                }
            } else {
                for (let y = 0; y < height; y++) {
                    const rowStart = y * this.bytes_per_row;
                    for (let x = 0; x < width; x++) {
                        this.ta[rowStart + x] = 255 - this.ta[rowStart + x];
                    }
                    this.ta.fill(0, rowStart + width, rowStart + this.bytes_per_row);
                }
            }
        } else if (bipp === 24 || bipp === 32) {
            const bypp = this.bytes_per_pixel;
            const width = this.size[0], height = this.size[1];
            const rowDataBytes = width * bypp;
            if (this.bytes_per_row === rowDataBytes) {
                for (let byte = 0, end = this.ta.length; byte < end; byte += bypp) {
                    this.ta[byte] = 255 - this.ta[byte];
                    this.ta[byte + 1] = 255 - this.ta[byte + 1];
                    this.ta[byte + 2] = 255 - this.ta[byte + 2];
                }
            } else {
                for (let y = 0; y < height; y++) {
                    const rowStart = y * this.bytes_per_row;
                    const rowEnd = rowStart + rowDataBytes;
                    for (let byte = rowStart; byte < rowEnd; byte += bypp) {
                        this.ta[byte] = 255 - this.ta[byte];
                        this.ta[byte + 1] = 255 - this.ta[byte + 1];
                        this.ta[byte + 2] = 255 - this.ta[byte + 2];
                    }
                    this.ta.fill(0, rowEnd, rowStart + this.bytes_per_row);
                }
            }
        }
        return this;
    }
    'or'(other_pb) {
        const {
            bipp
        } = this;
        if (bipp === 1) {
            const other_bipp = other_pb.bipp;
            if (other_bipp === 1) {
                const {ta} = this;
                const other_ta = other_pb.ta;
                const width = this.size[0], height = this.size[1];
                if (other_pb.size[0] === width && other_pb.size[1] === height) {
                    const rowDataBytes = this.layout ? this.layout.rowDataBytes : Math.ceil(width / 8);
                    const rowStrideBytes = this.bytes_per_row;
                    const otherStrideBytes = other_pb.bytes_per_row;
                    const tailBits = width & 7;
                    const tailMask = this.layout
                        ? this.layout.tailMask
                        : (tailBits === 0 ? 0xFF : (0xFF << (8 - tailBits)) & 0xFF);
                    if (tailMask === 0xFF &&
                        rowDataBytes === rowStrideBytes &&
                        rowStrideBytes === otherStrideBytes) {
                        const l = ta.length;
                        for (let i = 0; i < l; i++) ta[i] |= other_ta[i];
                    } else {
                        for (let y = 0; y < height; y++) {
                            const rowStart = y * rowStrideBytes;
                            const otherRowStart = y * otherStrideBytes;
                            for (let xByte = 0; xByte < rowDataBytes; xByte++) {
                                ta[rowStart + xByte] |= other_ta[otherRowStart + xByte];
                            }
                            ta[rowStart + rowDataBytes - 1] &= tailMask;
                            ta.fill(0, rowStart + rowDataBytes, rowStart + rowStrideBytes);
                        }
                    }
                } else {
                    console.trace();
                    throw 'pixel buffer dimensions must match';
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
        const [width, height] = this.size;
        const PositionArray = width > 32767 || height > 32767 ? Int32Array : Int16Array;
        const pos = new PositionArray(2);
        const visit = (x, y) => {
            pos[0] = x;
            pos[1] = y;
            callback(unsafeGetPixel(this, pos), pos);
        };

        for (let x = 0; x < width; x++) visit(x, 0);
        for (let y = 1; y < height; y++) visit(width - 1, y);
        if (height > 1) {
            for (let x = width - 2; x >= 0; x--) visit(x, height - 1);
        }
        if (width > 1) {
            for (let y = height - 2; y > 0; y--) visit(0, y);
        }
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
        } else if (bits_per_pixel === 8) {
            this.each_outer_boundary_pixel((boundaryColor, pos) => {
                if (boundaryColor === given_color) {
                    this.flood_fill(pos[0], pos[1], fill_color);
                }
            });
        } else if (bits_per_pixel === 32) {
            this.each_outer_boundary_pixel((boundaryColor, pos) => {
                if (boundaryColor[0] === given_color[0] && boundaryColor[1] === given_color[1] &&
                    boundaryColor[2] === given_color[2] && boundaryColor[3] === given_color[3]) {
                    this.flood_fill(
                        pos[0], pos[1],
                        fill_color[0], fill_color[1], fill_color[2], fill_color[3]
                    );
                }
            });
        }
        return this;
    }
    each_x_span(cb) {
        if (this.bipp !== 1) {
            throw new Error('each_x_span requires a packed 1bipp Pixel Buffer');
        }
        const [width, height] = this.size;
        const stride = this.bytes_per_row;
        const ta = this.ta;
        for (let y = 0; y < height; y++) {
            const rowStart = y * stride;
            let spanStart = 0;
            let color = (ta[rowStart] & 0x80) === 0 ? 0 : 1;
            for (let x = 1; x < width; x++) {
                const nextColor = (ta[rowStart + (x >> 3)] & (0x80 >> (x & 7))) === 0 ? 0 : 1;
                if (nextColor !== color) {
                    cb(spanStart, x - 1, y, color);
                    spanStart = x;
                    color = nextColor;
                }
            }
            cb(spanStart, width - 1, y, color);
        }
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
