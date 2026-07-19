const Shape = require('./Shape');

// new Rectangle([w, h], [x, y]); seems like the most standard format.
//.  Does seem best when defining the rectangle.
//.    Possibly have some default parameter order property? Or a bit of online explanation?

const {tof, is_array, get_item_sig, is_arr_of_t} = require('lang-mini');

const Rectangle = require('./Rectangle');

//.  what it is, where it is???
//.  or [pos, size]????
// But it can exist without its position (usually / in theory at least).

const {draw_polygon_outline_to_ta_1bipp,
    ensure_polygon_is_ta,

    right_shift_32bit_with_carry,
    xor_typed_arrays,
    each_1_index,
    count_1s,
    fast_find_next_set_ta_bit,
    get_ta_bits_that_differ_from_previous_as_1s,
    get_bit,
    calc_polygon_stroke_points_x_y} = require('../ta-math');


const is_numeric_typed_array = obj =>
    ArrayBuffer.isView(obj) &&
    !(obj instanceof DataView) &&
    !(obj instanceof BigInt64Array) &&
    !(obj instanceof BigUint64Array);

const coordinate_array = values => {
    let min = Infinity, max = -Infinity;
    let all_integers = true;

    for (let i = 0; i < values.length; i++) {
        const value = values[i];
        if (typeof value !== 'number' || !Number.isFinite(value)) {
            throw new TypeError('Polygon coordinates must be finite numbers');
        }
        if (Number.isInteger(value)) {
            if (!Number.isSafeInteger(value)) {
                throw new RangeError('Polygon integer coordinates must be safe integers');
            }
        } else {
            all_integers = false;
        }
        if (value < min) min = value;
        if (value > max) max = value;
    }

    if (all_integers && min >= 0 && max <= 0xFFFFFFFF) {
        return new Uint32Array(values);
    }
    if (all_integers && min >= -0x80000000 && max <= 0x7FFFFFFF) {
        return new Int32Array(values);
    }
    return new Float64Array(values);
};

const normalize_array_points = spec => {
    if (spec.length === 0) throw new RangeError('Polygon requires at least three points');

    const first = spec[0];
    if (Array.isArray(first) || ArrayBuffer.isView(first)) {
        if (spec.length < 3) throw new RangeError('Polygon requires at least three points');
        let min = Infinity, max = -Infinity;
        let all_integers = true;
        for (const point of spec) {
            if (point == null || point.length !== 2) {
                throw new TypeError('Polygon points must be [x, y] pairs');
            }
            const x = point[0], y = point[1];
            if (typeof x !== 'number' || !Number.isFinite(x) ||
                typeof y !== 'number' || !Number.isFinite(y)) {
                throw new TypeError('Polygon coordinates must be finite numbers');
            }
            if (Number.isInteger(x)) {
                if (!Number.isSafeInteger(x)) {
                    throw new RangeError('Polygon integer coordinates must be safe integers');
                }
            } else {
                all_integers = false;
            }
            if (Number.isInteger(y)) {
                if (!Number.isSafeInteger(y)) {
                    throw new RangeError('Polygon integer coordinates must be safe integers');
                }
            } else {
                all_integers = false;
            }
            if (x < min) min = x;
            if (y < min) min = y;
            if (x > max) max = x;
            if (y > max) max = y;
        }

        const CoordinateArray = all_integers && min >= 0 && max <= 0xFFFFFFFF
            ? Uint32Array
            : (all_integers && min >= -0x80000000 && max <= 0x7FFFFFFF
                ? Int32Array
                : Float64Array);
        const result = new CoordinateArray(spec.length * 2);
        let write = 0;
        for (const point of spec) {
            result[write++] = point[0];
            result[write++] = point[1];
        }
        return result;
    }

    if ((spec.length & 1) !== 0 || spec.length < 6) {
        throw new RangeError('Polygon requires at least three [x, y] pairs');
    }
    return coordinate_array(spec);
};


// Extend a TA_Table perhaps?
//   Or it's just a Matrix?

// TA_Matrix

// A table is more about expressing it as a list of records.


const Polygon_Scanline_Edges = require('./Polygon_Scanline_Edges');




class Polygon extends Shape {
    // Set the points but with an offset too????

    constructor(spec) {
        super(spec);

        // Give it the polygon points

        // Functions to get various data derived from that polygon.
        //   A typed array that expresses the x on spans may be most useful.

        if (is_array(spec)) {
            this._ta_points = normalize_array_points(spec);
        } else {
            if (is_numeric_typed_array(spec)) {
                if ((spec.length & 1) !== 0 || spec.length < 6) {
                    throw new RangeError('Polygon requires at least three [x, y] pairs');
                }
                // coordinate_array validates and takes ownership of a copy.
                this._ta_points = coordinate_array(spec);
            } else {
                throw new TypeError('Polygon expects an array or numeric typed array');
            }
        }
    }


    // Or just as a normal array? Maybe that would be faster.

    get ta_bounding_box() {
        if (!this._ta_bounding_box) {
            const ta_points = this._ta_points, l = ta_points.length;
            let min_x = Infinity, min_y = Infinity, max_x = -Infinity, max_y = -Infinity;

            let i = 0;
            let x, y;

            while (i < l) {
                x = ta_points[i++];
                y = ta_points[i++];
                min_x = Math.min(min_x, x);
                min_y = Math.min(min_y, y);
                max_x = Math.max(max_x, x);
                max_y = Math.max(max_y, y);
            }

            this._ta_bounding_box = coordinate_array([min_x, min_y, max_x, max_y]);
        }
        // Do not expose the mutable typed-array cache: corrupting a returned
        // bounding box must not change future geometry or downshift results.
        return this._ta_bounding_box.slice();
    }
    
    get ta_xylc_x_spans() {

        // count x spans?

        // Count them first with its own count algorithm????

        const downshifted = this.downshifted();
        const tabb = downshifted.ta_bounding_box;

        const offset = this.ta_bounding_box;

        // Bounding-box maxima are inclusive pixel coordinates.
        const draw_size = [tabb[2] + 1, tabb[3] + 1];
        const [w, h] = draw_size;

        const draw_size_num_pixels = draw_size[0] * draw_size[1];

        // Then see about getting it into an 8 bit aligned ta.
        const ta_draw_num_bytes = Math.ceil(draw_size_num_pixels / 8);
        const ta_draw = new Uint8Array(ta_draw_num_bytes);

        // Then draw the downshifted polygon to that ta....

        draw_polygon_outline_to_ta_1bipp(ta_draw, draw_size[0], downshifted._get_ta_points());
        const ta_x_span_toggles = get_ta_bits_that_differ_from_previous_as_1s(ta_draw, draw_size[0]);


        // Count the number of rows that begin with 1s?
        const num_toggle_bits = count_1s(ta_x_span_toggles);
        const iterate_to_count_x_spans = () => {
            //let i_w_res = 0;
            //let res = 0;
            let i_row_start = 0, i_row_end = w + 1;
            let cx = 0;
            const found_x_span = (x, y, l, c) => {
                cx++;
            }

            for (let y = 0; y < h; y++) {
                let i_next_set_bit = fast_find_next_set_ta_bit(ta_x_span_toggles, i_row_start, i_row_end - i_row_start - 1);
                //console.log('y, i_next_set_bit', y, i_next_set_bit);


                if (i_next_set_bit === false) {
                    // Then the row's only span is of the start color.
                    found_x_span(0, y, i_row_end);


                } else {
                    found_x_span(0, y, i_next_set_bit - i_row_start);
                    //color = (~color)&1;
                    let i_last_set_bit = i_next_set_bit;

                    while (i_next_set_bit !== false && i_next_set_bit < i_row_end) {

                        // That fn seems broken for now.
                        i_next_set_bit = fast_find_next_set_ta_bit(ta_x_span_toggles, i_next_set_bit, i_row_end - i_next_set_bit - 1);
                        //console.log('y, i_next_set_bit', y, i_next_set_bit);

                        if (i_next_set_bit === false) {
                            // Then the row's only span is of the start color.
                            found_x_span(i_last_set_bit - i_row_start, y, i_row_end - i_last_set_bit);
                        } else {
                            found_x_span(i_last_set_bit - i_row_start, y, i_next_set_bit - i_last_set_bit);
                            i_last_set_bit = i_next_set_bit;
                        }
                    }
                }
                i_row_start += w;
                i_row_end += w;
            }
            return cx;
        }

        const num_x_spans = iterate_to_count_x_spans();

        const num_fields_per_result_item = 4;
        const l_res = num_x_spans * num_fields_per_result_item;

        const res = new Uint32Array(l_res);
        

        const iterate_to_write_result = () => {
            let i_w_res = 0;
            //let res = 0;
            let i_row_start = 0, i_row_end = w + 1;
            let cx = 0;
            const found_x_span = (x, y, l, c) => {
                res[i_w_res++] = x;
                res[i_w_res++] = y;
                res[i_w_res++] = l;
                res[i_w_res++] = c;
                cx++;
                //console.log('cx', cx);
            }

            for (let y = 0; y < h; y++) {
                const row_x0_value = get_bit(ta_x_span_toggles, i_row_start);
                let color = row_x0_value;

                /*
                if (row_x0_value !== 0) {
                    console.log([y, row_x0_value]);
                }

                */
                // And rather than a limit, have an absolute boundary of the end of that row?

                // And limit it up to the row end?
                let i_next_set_bit = fast_find_next_set_ta_bit(ta_x_span_toggles, i_row_start, i_row_end - i_row_start - 1);
                //console.log('y, i_next_set_bit', y, i_next_set_bit);


                if (i_next_set_bit === false) {
                    // Then the row's only span is of the start color.
                    found_x_span(0, y, i_row_end, color);


                } else {
                    found_x_span(0, y, i_next_set_bit - i_row_start, color);
                    color = (~color)&1;
                    let i_last_set_bit = i_next_set_bit;

                    while (i_next_set_bit !== false && i_next_set_bit < i_row_end) {

                        // That fn seems broken for now.
                        i_next_set_bit = fast_find_next_set_ta_bit(ta_x_span_toggles, i_next_set_bit, i_row_end - i_next_set_bit - 1);
                        //console.log('y, i_next_set_bit', y, i_next_set_bit);

                        if (i_next_set_bit === false) {
                            // Then the row's only span is of the start color.
                            found_x_span(i_last_set_bit - i_row_start, y, i_row_end - i_last_set_bit, color);
                        } else {
                            found_x_span(i_last_set_bit - i_row_start, y, i_next_set_bit - i_last_set_bit, color);
                            i_last_set_bit = i_next_set_bit;
                            //found_x_span(0, y, i_next_set_bit - i_row_start, color);
                            color = (~color)&1;
                        }


                        //console.log('[y, i_next_set_bit]', [y, i_next_set_bit]);

                        //i_last_set_bit = i_next_set_bit;
                    }
                }
                i_row_start += w;
                i_row_end += w;
            }
        }

        iterate_to_write_result();
        return res;


    }





    // x, y, l makes the most sense

    get ta_x_spans_filled() {


        const calling_other_fns_attempt = () => {

            const bb = this.ta_bounding_box;

            const offset_width = bb[2] - bb[0];

            const offset_height = bb[3] - bb[1];
            const ohm1 = offset_height - 1;

            // Maybe need to break this down into OO classes to get it working properly.

            const ta_xylc_x_spans = this.ta_xylc_x_spans;

            //console.log('ta_xylc_x_spans', ta_xylc_x_spans + '');
            //console.trace();
            //throw 'stop';


            const iterate_to_count_x_spans_touching_image_border = () => {
                const ta_l = ta_xylc_x_spans.length;
                const num_x_spans = ta_l / 4;

                //let i_x_span = 0;
                let i_r = 0;
                let c_touching_image_border = 0;

                for (let i_x_span = 0; i_x_span < num_x_spans; i_x_span++) {
                    const x = ta_xylc_x_spans[i_r++], y = ta_xylc_x_spans[i_r++], l = ta_xylc_x_spans[i_r++], c = ta_xylc_x_spans[i_r++];
                    if (x === 0) {
                        c_touching_image_border++
                    } else if (x + l === offset_width) {
                        c_touching_image_border++
                    } else if (y === 0) {
                        c_touching_image_border++
                    } else if (y === ohm1) {
                        c_touching_image_border++
                    }
                }
                return c_touching_image_border;
            }

            const c_touching_image_border = iterate_to_count_x_spans_touching_image_border();

            // Iterate to get the indexes of the x spans touching the border.
            //   Not setting them as a group bitfield for the moment.

            const indexes_of_x_spans_touching_image_border = new Uint32Array(c_touching_image_border);

            const iterate_to_populate_indexes_of_x_spans_touching_image_border = () => {
                let i_r = 0, i_w = 0;

                const ta_l = ta_xylc_x_spans.length;
                const num_x_spans = ta_l / 4;

                //let i_x_span = 0;

                for (let i_x_span = 0; i_x_span < num_x_spans; i_x_span++) {
                    const x = ta_xylc_x_spans[i_r++], y = ta_xylc_x_spans[i_r++], l = ta_xylc_x_spans[i_r++], c = ta_xylc_x_spans[i_r++];
                    if (x === 0) {
                        indexes_of_x_spans_touching_image_border[i_w++] = i_x_span;
                    } else if (x + l === offset_width) {
                        indexes_of_x_spans_touching_image_border[i_w++] = i_x_span;
                    } else if (y === 0) {
                        indexes_of_x_spans_touching_image_border[i_w++] = i_x_span;
                    } else if (y === ohm1) {
                        indexes_of_x_spans_touching_image_border[i_w++] = i_x_span;
                    }
                }
            }
            iterate_to_populate_indexes_of_x_spans_touching_image_border();

            
            const iterate_to_count_color_0_x_spans_touching_image_border = () => {
                const ta_l = ta_xylc_x_spans.length;
                const num_x_spans = ta_l / 4;

                //let i_x_span = 0;
                let i_r = 0;
                let c_touching_image_border = 0;

                for (let i_x_span = 0; i_x_span < num_x_spans; i_x_span++) {
                    const x = ta_xylc_x_spans[i_r++], y = ta_xylc_x_spans[i_r++], l = ta_xylc_x_spans[i_r++], c = ta_xylc_x_spans[i_r++];
                    if (c === 0) {
                        if (x === 0) {
                            c_touching_image_border++;
                        } else if (x + l === offset_width) {
                            c_touching_image_border++;
                        } else if (y === 0) {
                            c_touching_image_border++;
                        } else if (y === ohm1) {
                            c_touching_image_border++;
                        }
                    }
                    
                }
                return c_touching_image_border;
            }

            const c_color_0_touching_image_border = iterate_to_count_color_0_x_spans_touching_image_border();
            //console.log('c_color_0_touching_image_border', c_color_0_touching_image_border);

            const indexes_of_color_0_x_spans_touching_image_border = new Uint32Array(c_color_0_touching_image_border);

            const iterate_to_populate_indexes_of_color_0_x_spans_touching_image_border = () => {
                let i_r = 0, i_w = 0;

                const ta_l = ta_xylc_x_spans.length;
                const num_x_spans = ta_l / 4;

                //let i_x_span = 0;

                for (let i_x_span = 0; i_x_span < num_x_spans; i_x_span++) {
                    const x = ta_xylc_x_spans[i_r++], y = ta_xylc_x_spans[i_r++], l = ta_xylc_x_spans[i_r++], c = ta_xylc_x_spans[i_r++];
                    if (c === 0) {
                        if (x === 0) {
                            indexes_of_color_0_x_spans_touching_image_border[i_w++] = i_x_span;
                        } else if (x + l === offset_width) {
                            indexes_of_color_0_x_spans_touching_image_border[i_w++] = i_x_span;
                        } else if (y === 0) {
                            indexes_of_color_0_x_spans_touching_image_border[i_w++] = i_x_span;
                        } else if (y === ohm1) {
                            indexes_of_color_0_x_spans_touching_image_border[i_w++] = i_x_span;
                        }
                    }
                    
                }
            }
            iterate_to_populate_indexes_of_color_0_x_spans_touching_image_border();


            const invert_indexes = (indexes) => {
                const ta_l = ta_xylc_x_spans.length;
                const num_x_spans = ta_l / 4;
            
                let i_idx = 0; // pointer for indexes array
                let res_idx = 0; // pointer for result array
            
                const res = new Uint32Array(num_x_spans - indexes.length);
            
                // Iterate over each span index
                for (let i_x_span = 0; i_x_span < num_x_spans; i_x_span++) {
                    // Check if the current span index is in the indexes array
                    if (i_idx < indexes.length && indexes[i_idx] === i_x_span) {
                        // If i_x_span matches current index, skip it and move to the next index in indexes
                        i_idx++;
                    } else {
                        // If i_x_span is not in indexes, add it to result array
                        res[res_idx++] = i_x_span;
                    }
                }
            
                return res;
            };
            

            const assemble_res_from_indexes = indexes => {
                //console.log('indexes', indexes);
                const l = indexes.length;
                let i_r = 0, i_w = 0;

                const l_res = l * 3;
                const res = new Uint32Array(l_res);
                //console.log('ta_xylc_x_spans', ta_xylc_x_spans);

                for (let i_index = 0; i_index < l; i_index++) {
                    const i_in_main = indexes[i_index];
                    //console.log('i_index, i_in_main', i_index, i_in_main);
                    const pos_in_main = i_in_main * 4;
                    const x = ta_xylc_x_spans[pos_in_main];
                    const y = ta_xylc_x_spans[pos_in_main + 1];
                    const l = ta_xylc_x_spans[pos_in_main + 2];
                    //console.log('[x, y, l]', [x, y, l]);
                    res[i_w++] = x;
                    res[i_w++] = y;
                    res[i_w++] = l;

                }

                return res;

            }

            const res = assemble_res_from_indexes(invert_indexes(indexes_of_color_0_x_spans_touching_image_border));


            return res;

        }

        return calling_other_fns_attempt();



    }

    set offset(value) {
        if (!this._offset) {
            this._offset = new Float64Array(2);
        }
        if (is_array(value)) {
            if (value.length !== 2 || !Number.isFinite(value[0]) || !Number.isFinite(value[1])) {
                throw new TypeError('Polygon offset must be a finite [x, y] pair');
            }
            this._offset[0] = value[0];
            this._offset[1] = value[1];
        } else {
            throw new TypeError('Polygon offset must be a finite [x, y] pair');
        }
    }

    get ta_points() {
        return this._ta_points.slice();
    }

    // Internal rasterizers need zero-copy, read-only access. Public callers
    // receive an owned snapshot from ta_points.
    _get_ta_points() {
        return this._ta_points;
    }

    get offset() {
        if (!this._offset) {
            this._offset = new Float64Array(2);
        }
        return this._offset.slice();
    }

    downshifted() {

        // Determine the offset from the bounding box mins.

        const [x, y] = this.ta_bounding_box;
        const dx = -x, dy = -y;

        const ta_points = this._ta_points, l = ta_points.length;

        const downshifted_points = new Array(l);
        let i = 0;
        while (i < l) {
            downshifted_points[i] = ta_points[i++] + dx;
            downshifted_points[i] = ta_points[i++] + dy;
        }

        const res = new Polygon(downshifted_points);
        res.offset = [x, y];
        return res;


    }

    get scanline_edges() {
        const res = new Polygon_Scanline_Edges(this);
        return res;

    }

}

Polygon.Polygon_Scanline_Edges = Polygon_Scanline_Edges;

Polygon.ensure_is = obj => {
    if (obj instanceof Polygon) {
        return obj;
    } else {
        return new Polygon(obj);
    }
}

module.exports = Polygon;

if (require.main === module) {

    const t0 = process.hrtime();

    //const polygon = new Polygon([[4, 4,], [28, 4], [28, 28], [4, 28]]);


    const polygon = new Polygon([[900, 900,], [200, 200], [1000, 900], [1600, 200], [1000, 1000], [1000, 1100], [1000, 1600], [900, 1600]]);



    const ta_l = polygon.ta_points.length;
    const tabb = polygon.ta_bounding_box;

    const ds_pg = polygon.downshifted();


    // May be able to get that with a fill algorithm that looks into the edges.
    const xsf = polygon.ta_x_spans_filled;

    const l_xsf = xsf.length;
    
    const num_x_spans = l / 3;

    let i = 0;

    for (let c = 0; c < num_x_spans; c++) {
        const x = xsf[i++], y = xsf[i++], l = xsf[i++], x2 = x + l;

    }

    const tt0 = process.hrtime(t0);
    const ms0 = tt0[0] * 1000 + tt0[1] / 1000000

    //console.log('tt0', tt0);
    console.log('ms0', ms0);
    console.log('ta_l', ta_l);
    console.log('tabb', tabb);
    console.log('polygon', polygon);
    console.log('ds_pg', ds_pg);
    console.log('ds_pg.ta_bounding_box', ds_pg.ta_bounding_box);
    console.log('xsf', xsf);



    // Then can this be drawn to a pixel buffer????
    //   Rapid draw of x-span in the [x, y, l] format.





    // Getting the filled polygon x-spans....
    //   Is a somewhat complex procedure, but want to get it running very quick. Some OO will help keep it consistent in terms of usage.

    // Get these x-spans as a typed array?
    //   [x, y, l] ???





    // ta_bounding_box
}
