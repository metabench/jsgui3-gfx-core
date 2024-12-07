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

// 

// May be worth considering some kind of virtual (non-JS-class) rectangles that can be accessed through operations on 
//.  a single class instance that internally uses a ta efficiently?
//.   Could have an API that returns Rectangle class instances but internally keeps all the data in a single (large enough) ta.
//.     That would likely be best regarding performance concerns.



// Rectangular_Geometry_Virtual_Container perhaps....

// That could be a really specific class for 

// Could have some kind of lower level Geometry_Container.
//.Or Rect_Geometry_Container
//.  With capabilities and optimisations specifically for multiple rectangles on a 2d plane.

// Could allow dealing with many rectangles without using the garbage collector for them.

// Does seem worth using 'prop' function for brevity.

const {prop, get_set} = require('obext');

// But want to be able to have this within a coord system where the y coordinates increase downwards.

// rect.box???

// rect.ta may help in some / many cases.

// .rect.box perhaps????
// .rect.coords ? .r.c?

// and have jsgui3-html make use of this Rectangle class.
//.  will support collision detection / avoidance for controls, which will help controls dynamically rearrange themselves.

// X_Spans collection?
// Multiple classes to represent x spans?
//   Such as where they are all of a set color?

// X_Spans_Of_Colour???

// [bit_i, x, y, ]




const is_integer_typed_array = (obj) => {
    if (ArrayBuffer.isView(obj)) {
        return (
            obj instanceof Int8Array ||
            obj instanceof Uint8Array ||
            obj instanceof Int16Array ||
            obj instanceof Uint16Array ||
            obj instanceof Int32Array ||
            obj instanceof Uint32Array ||
            obj instanceof BigInt64Array ||
            obj instanceof BigUint64Array
        );
    }
    return false;
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
            // Should be an array of pairs.

            const l = spec.length;
            const num_points = l;
            // Determine what data structure to use for the ta points. Could use 16 bit numbers, maybe even 8 bit....
            //   8 bit would be fine (or best) for the smallest polygons. 
            //   Or go strait ahead and use 32 bit??

            // May want to downshift it?
            //   Not to start with.
            const ta_points = new Uint32Array(num_points << 1);
            let i = 0;

            // May as well determine the bounding box here? Maybe not?

            for (const [x, y] of spec) {
                ta_points[i++] = x;
                ta_points[i++] = y;
            }

            this.ta_points = ta_points;
        } else {

            //console.log('spec', spec);

            if (is_integer_typed_array(spec)) {
                this.ta_points = spec;
            } else {
                console.trace();
                throw 'NYI';
            }

            
        }
        //const t_spec = tof(spec);

        //console.log('t_spec', t_spec);
        //
    }


    // Or just as a normal array? Maybe that would be faster.

    get ta_bounding_box() {
        if (!this._ta_bounding_box) {
            const {ta_points} = this, l = ta_points.length;
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

            return this._ta_bounding_box = new Uint32Array([min_x, min_y, max_x, max_y]);
        } else {
            return this._ta_bounding_box;

            //return new Uint32Array([min_x, min_y, max_x, max_y]);
        }
    }


    // Get all the x spans as a ta x1, y, l, c
    //   Seems like the simplest or one of the simplest formats.

    get ta_xylc_x_spans() {

        // count x spans?

        // Count them first with its own count algorithm????

        const downshifted = this.downshifted();
        const tabb = downshifted.ta_bounding_box;

        const offset = this.ta_bounding_box;

        const draw_size = [tabb[2], tabb[3]];
        const [w, h] = draw_size;

        const draw_size_num_pixels = draw_size[0] * draw_size[1];

        // Then see about getting it into an 8 bit aligned ta.
        const r_from_8 = draw_size_num_pixels % 8;
        const has_remainder_byte = r_from_8 !== 0;
        const ta_draw_num_bytes = (draw_size_num_pixels >>> 3) + (has_remainder_byte ? 1 : 0);
        const ta_draw = new Uint8Array(ta_draw_num_bytes);

        // Then draw the downshifted polygon to that ta....

        draw_polygon_outline_to_ta_1bipp(ta_draw, draw_size[0], downshifted.ta_points);
        const ta_x_span_toggles = get_ta_bits_that_differ_from_previous_as_1s(ta_draw, draw_size[0]);


        // Count the number of rows that begin with 1s?
        const num_toggle_bits = count_1s(ta_x_span_toggles);

        //console.log('num_toggle_bits', num_toggle_bits);
        //console.log('ta_x_span_toggles', ta_x_span_toggles);


        // Then go through that ta_x_span_toggles to count the x spans.



        const iterate_to_count_x_spans = () => {
            //let i_w_res = 0;
            //let res = 0;
            let i_row_start = 0, i_row_end = w + 1;
            let cx = 0;
            const found_x_span = (x, y, l, c) => {
                cx++;
            }

            for (let y = 0; y < h; y++) {
                //const row_x0_value = get_bit(ta_x_span_toggles, i_row_start);
                //let color = row_x0_value;

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
                            //found_x_span(0, y, i_next_set_bit - i_row_start, color);
                            //color = (~color)&1;
                        }


                        //console.log('[y, i_next_set_bit]', [y, i_next_set_bit]);

                        //i_last_set_bit = i_next_set_bit;
                    }
                }
                i_row_start += w;
                i_row_end += w;
            }
            return cx;
        }

        const num_x_spans = iterate_to_count_x_spans();
        //console.log('num_x_spans', num_x_spans);

        // x, y, l, c format wanted as result here.

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


            //console.log('ta_xylc_x_spans', ta_xylc_x_spans);

            //console.log('indexes_of_x_spans_touching_image_border', indexes_of_x_spans_touching_image_border);
            //console.log('indexes_of_color_0_x_spans_touching_image_border', indexes_of_color_0_x_spans_touching_image_border);


            // Then find the indexes of those x spans that are contiguous with the image border.
            //   And see about combining the outer shape with the inner (to be filled) shape.

            // 



            // Then do flood-fill from them, through ajacency.
            //   or flood-group extension.

            // Go through them in sequence looking for the above and below adjacencies.

            // How many are in the row below?
            //   Effectively have a sorted list of their positions anyway.

            // Identifying contiguous groups of color 0.

            // For now, just identify the adjacency (index?) ranges?
            //   Or a list of the indexes? Contiguous color adjacencies?

            // This should at least work out a lot faster than previous algorithm.








            // or get a ta of the indexes of which are touching the border?

            // add a bitfield?
            //   bitfield for which of them are around the image edges.

            // count

            // want to iterate with 4 at once.

            

            //console.log('c_touching_image_border', c_touching_image_border);
            //console.log('c_color_0_touching_image_border', c_color_0_touching_image_border);

            // or the color 0 not touching the image border...
            //   determine if those are contiguous with the ones touching the border?

            // seems like a group-type system would help.
            //   plus a 'visited' bitflag?

            // invert indexes???







            // Then could return just those not touching the border, but with no contiguity testing?

            // Do want to do a flood fill from the outside to determine which are contiguous....

            // Though could assemble the results from indexes for the moment.
            //   only [x, y, l] per result x-span.

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



            // A system of adjacency lists?
            //   Allowing for ranges in the row above and the row below.

            // The adjacency lists system will be a way to get flood fill running fast, though maybe it's too indirect.




            
            // get the indexes of the outer color 0 x spans?




            // identify outer contiguous x spans.




            // Then set up / do a group analysis or extraction.
            //   Want to extract the off spans which are no outer.
            //     Maybe assign 'outer' to all x 0 spans that touch the outside?
            //       Or just any x span that touches the outside.

            // touches_border
            // contiguous_space_touches_border????
            // in_contiguous_group_touching_border????

            // Basically flood fill itself will be much faster on groups.

            // Identify as a group all x_spans color 0 touching a border.
            //   Flood-fill from them to identify all color 0 x spans that are contiguous with that border.
            //   Then merge together x spans that are not them - getting the stroke outline and filled shape.




            return res;







            console.trace();
            throw 'NYI';

        }

        return calling_other_fns_attempt();


        const long_possibly_not_yet_working_attempt = () => {

            // [x, y, l] - Will be able to be drawn quickly that way. Simple.

            const downshifted = this.downshifted();
            const tabb = downshifted.ta_bounding_box;

            const offset = this.ta_bounding_box;

            const draw_size = [tabb[2], tabb[3]];
            const [w, h] = draw_size;

            const draw_size_num_pixels = draw_size[0] * draw_size[1];

            // Then see about getting it into an 8 bit aligned ta.
            const r_from_8 = draw_size_num_pixels % 8;
            const has_remainder_byte = r_from_8 !== 0;
            const ta_draw_num_bytes = (draw_size_num_pixels >>> 3) + (has_remainder_byte ? 1 : 0);
            const ta_draw = new Uint8Array(ta_draw_num_bytes);

            // Then draw the downshifted polygon to that ta....

            draw_polygon_outline_to_ta_1bipp(ta_draw, draw_size[0], downshifted.ta_points);
            const ta_x_span_toggles = get_ta_bits_that_differ_from_previous_as_1s(ta_draw, draw_size[0]);


            // Count the number of rows that begin with 1s?

            const num_toggle_bits = count_1s(ta_x_span_toggles);
            // That's the number of toggle positions. (though toggle at the beginning of a row is a little different.)

            const est_max_num_x_spans = h + num_toggle_bits;

            // Then get the indexes of all row beginnings?

            // A 'group' field too? Only applies to the color 0 spans though.
            //   Detect which color 0 x spans it's grouped with?
            //     Touching the outside always being group 1? Even when not actually contiguous.
            //       Join groups down to the lowest group number?



            const num_fields_per_x_span = 5;
            // x1, y, l, c
        
            const ta_x_spans_info = new Uint32Array(est_max_num_x_spans * num_fields_per_x_span);

            

            

            // But we want to number them by row????

            // and the xspan start indexes....


            // Number of x spans per row???

            const y_row_x_span_start_indexes = new Uint32Array(h);

            // Assigning a group to the x_spans...
            //   Determining which above ones they intersect.
            //     Some type of ordered list of 




            // So make it easy to refer to the x spans of any row.

            // Determine which spans above it's connected to.
            //   That's how to determine which group it's part of.

            // Have some kind of cursors for which are the above ones????

            // And moving along the x-spans above?

            // Mainly need to determine their groups.

            // Matching them with the rows above

            // the previous row x span???

            // Which of the x spans are color 0 and on the border of the image?
            let i_row_start = 0, i_row_end = w + 1;

            let i_w = 0;
            const hm1 = h - 1;

            const wp1 = w + 1;

            // Assigning groups to them here probably is required for this algorithm to work.
            //   Want to see which on each row overlap with the next rows.

            let above_row_left_x_span_index, above_row_right_x_span_index;

            // is it on an outside edge???

            // A 'group' number?
            //  And only for the x-off spans?

            let above_row_y;

            // Assign group to x span.

            // And the x span index??

            let i_x_span = 0;
            let row_left_x_span_index;


            // An array of the filled x spans....?
            //   Though maybe just make an array of their indexes here.

            // The count of non-border and non-border touching x_off_spans.

            let num_inner_off_x_spans = 0;


            let i_group = 2;

            // [x, y, l], no need to include the color in these.

            // only assign groups to spans of color 0.



            const set_x_span_group = (i, g) => {
                ta_x_spans_info[i * num_fields_per_x_span + 4] = g;
            }


            const asign_border_group_to_x_span = (i) => {

                // set_x_span_group

                set_x_span_group(i, 1);

                
            }


            const handle_found_new_row_x_span = (x1, y, l, c) => {

                y_row_x_span_start_indexes[y] = i_x_span;
                

                // It borders the left edge.

                if (y >= 1) {
                    above_row_y = y - 1;
                    above_row_left_x_span_index = row_left_x_span_index;
                }
                row_left_x_span_index = i_x_span;

                if (c === 0) {
                    asign_border_group_to_x_span(i_x_span);
                }

            }

            // Need some kind of pointer system for the above x spans.

            // Then which (above) spans are these ajacent to?


            const found_x_span = (x1, y, l, c) => {
                const x2 = x1 + l;

                //console.log(['[x1, x2], y]', [x1, x2], y]);

                if (x1 === 0) {

                    
                    
                    handle_found_new_row_x_span(x1, y, l, c);
                    // it's a new row. 

                } else if (x2 === wp1 || y === 0 || y === hm1) {

                    if (c === 0) {
                        asign_border_group_to_x_span(i_x_span);
                    }

                    
                } else {
                    //console.log('w', w);
                    //console.log(['[x1, x2], y]', [x1, x2], y]);
                    if (c === 0) {
                        // Then this inner group, give it a group number?

                        // Deducing what is above it.... how difficult is that?

                        // Maintaining a pointer / pointers with the row above.





                        //console.log(['[x1, x2], y]', [x1, x2], y]);



                    }
                    // if it's color 0, check for any x spans of color 0 above it

                    // May mean advancing a pointer above...

                    // Can it get any groups from any above rows?

                }


                ta_x_spans_info[i_w++] = x1;
                ta_x_spans_info[i_w++] = y;
                ta_x_spans_info[i_w++] = l;
                ta_x_spans_info[i_w++] = c;
                i_w++;

                // And its group....

                //console.log('[x1, y, l, c]', [x1, y, l, c]);
                i_x_span++;
            }


            for (let y = 0; y < h; y++) {

                // row start color....
                const row_x0_value = get_bit(ta_x_span_toggles, i_row_start);

                // Then I want the distance until the next '1' bit.
                //   Maybe with a maximum?

                let color = row_x0_value;

                /*
                if (row_x0_value !== 0) {
                    console.log([y, row_x0_value]);
                }

                */
                // And rather than a limit, have an absolute boundary of the end of that row?

                // And limit it up to the row end?
                let i_next_set_bit = fast_find_next_set_ta_bit(ta_x_span_toggles, i_row_start, i_row_end);



                if (i_next_set_bit === false) {
                    // Then the row's only span is of the start color.
                    found_x_span(0, y, i_row_end, color);


                } else {
                    found_x_span(0, y, i_next_set_bit - i_row_start, color);
                    color = (~color)&1;


                    let i_last_set_bit = i_next_set_bit;

                    //console.log('[y, i_next_set_bit]', [y, i_next_set_bit]);

                    while (i_next_set_bit !== false && i_next_set_bit < i_row_end) {

                        // That fn seems broken for now.
                        i_next_set_bit = fast_find_next_set_ta_bit(ta_x_span_toggles, i_next_set_bit, i_row_end - i_next_set_bit);

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


                // Then for there it's a different color?

                //if (color === 1) {
                    // then it's a color 1 span from that pos.
                //}




                i_row_start += w;
                i_row_end += w;
            }

            //console.log('i_x_span', i_x_span);

            let c_res_x_spans = 0;

            for (let i = 0; i < i_x_span; i++) {

                let i_ta = i * num_fields_per_x_span;




                const x1 = ta_x_spans_info[i_ta++];
                const y = ta_x_spans_info[i_ta++];
                const l = ta_x_spans_info[i_ta++];
                const c = ta_x_spans_info[i_ta++];
                const g = ta_x_spans_info[i_ta++];


                

                if (c === 0) {
                    if (g !== 1) {
                        //console.log('[x1, y, l, c, g]', [x1, y, l, c, g]);
                        c_res_x_spans++;
                    }
                } else {
                    //c_res_x_spans++;

                }

            }

            // x, y, l - should make sense, be fast to write.

            const num_fields_per_res_row = 3;


            // And want to combine together the x spans, so that color 1 with group non-1 color 0 spans in between get merged into a single x span.
            //   (Or selec them as a single x span later on?)




            const res = new Uint32Array(c_res_x_spans * num_fields_per_res_row);

            let p_res = 0;

            // offset

            const [x_offset, y_offset] = offset;

            //console.log('[x_offset, y_offset]', [x_offset, y_offset]);

            for (let i = 0; i < i_x_span; i++) {

                let i_ta = i * num_fields_per_x_span;

                const x1 = ta_x_spans_info[i_ta++];
                const y = ta_x_spans_info[i_ta++];
                const l = ta_x_spans_info[i_ta++];
                const c = ta_x_spans_info[i_ta++];
                const g = ta_x_spans_info[i_ta++];


                

                if (c === 0) {
                    if (g !== 1) {
                        //console.log('[x1, y, l, c, g]', [x1, y, l, c, g]);
                        //c_res_x_spans++;
                        res[p_res++] = x1 + x_offset;
                        res[p_res++] = y + y_offset;
                        res[p_res++] = l;

                    }
                } else {
                    
                }

            }

            return res;

        }


        // Worth making this more OO and debuggable for the moment.
        


        
        
        // Then write these result values, should be fast / very fast to write to a pixel buffer.
        //   Also quick to reapply the offset, if there is one.

        // Then go through the 

        //console.log('y_row_x_span_start_indexes', y_row_x_span_start_indexes);

        //console.trace();
        //throw 'stop';

        // But may want to get the indexes of all 1s in there.
        //   Getting every x span of every colour to start with?


        


        // Then need to go through that ta, row by row.
        //console.log('ta_x_span_toggles', ta_x_span_toggles);



    }

    // Maybe a ta backed class would be best for storing and interacting with these x-spans, especially for detecting their groups.
    //   Really want to determine inner and outer though. Could be done in that same array it's building?
    //     Alongside it?




    // min x and min y?

    // downshifted offset????

    set offset(value) {
        if (!this._offset) {
            this._offset = new Uint32Array(2);
        }
        if (is_array(value)) {
            this._offset[0] = value[0];
            this._offset[1] = value[1];
        } else {
            console.trace();
            throw 'NYI';
        }
    }

    get offset() {
        if (!this._offset) {
            this._offset = new Uint32Array(2);
        }
        return this._offset;
    }

    downshifted() {

        // Determine the offset from the bounding box mins.

        const [x, y] = this.ta_bounding_box;
        const dx = -x, dy = -y;

        const {ta_points} = this, l = ta_points.length;

        const ta_downshifted_points = new Uint32Array(l);
        let i = 0;
        while (i < l) {
            ta_downshifted_points[i] = ta_points[i++] + dx;
            ta_downshifted_points[i] = ta_points[i++] + dy;
        }

        const res = new Polygon(ta_downshifted_points);
        res.offset = [x, y];
        return res;


    }

    get scanline_edges() {
        const res = new Polygon_Scanline_Edges(this);
        return res;

    }

    // Get a binary image ta that's the right size to hold them?
    //   Or not here, but use it, just not as part of the API.


    // the downshifted function???
    //   gets a new polygon that has been downshifted, and an offset applied.

    // The downshifted polygon, with an offset, would require a smaller ta buffer to draw it within (pre-drawing).


    // bounding_rect???
    //   and return a Rectange object to be best OO.



    // downshift the points.
    //   have an offset property too???

    // get the bounding box????

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