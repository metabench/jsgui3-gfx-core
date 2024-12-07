


const Pixel_Buffer_Core_Draw_Lines = require('./pixel-buffer-1.1-core-draw-line');

const Polygon_Scanline_Edges = require('./shapes/Polygon_Scanline_Edges');


let {resize_ta_colorspace, copy_rect_to_same_size_8bipp, copy_rect_to_same_size_24bipp, dest_aligned_copy_rect_1to4bypp,

    get_ta_bits_that_differ_from_previous_as_1s, right_shift_32bit_with_carry,
    xor_typed_arrays, each_1_index, count_1s,

    draw_polygon_outline_to_ta_1bipp, ensure_polygon_is_ta, calc_polygon_stroke_points_x_y


} = require('./ta-math');


const Polygon = require('./shapes/Polygon');

const ScanlineProcessor = require('./shapes/ScanlineProcessor');

class Pixel_Buffer_Core_Draw_Polygons extends Pixel_Buffer_Core_Draw_Lines {
    constructor(spec) {
        
        super(spec);

        
        
        
    }

    gpt_draw_polygon_filling(polygon) {




        const edges = [];
        const num_points = polygon.length / 2;

        const [w, h] = this.size;
    
        // Create edges for the polygon, connecting the last point to the first
        for (let i = 0; i < num_points; i++) {
            const x1 = polygon[i * 2];
            const y1 = polygon[i * 2 + 1];
            const x2 = polygon[((i + 1) % num_points) * 2];
            const y2 = polygon[((i + 1) % num_points) * 2 + 1];
    
            // Skip degenerate edges with the same start and end points
            if (x1 === x2 && y1 === y2) continue;
    
            // Only add non-horizontal edges
            if (y1 !== y2) {
                // Standardize edge creation to ensure consistent ordering
                const is_y1_lower = y1 < y2;
                edges.push({
                    x1: is_y1_lower ? x1 : x2,
                    y1: Math.min(y1, y2),
                    x2: is_y1_lower ? x2 : x1,
                    y2: Math.max(y1, y2),
                    slope: (x2 - x1) / (y2 - y1)
                });
            }
        }
    
        // Sort edges by y1, then by x1 for ties
        edges.sort((a, b) => a.y1 - b.y1 || a.x1 - b.x1);
    
        let active_edges = [];
        let edge_index = 0;
    
        // Process scanlines from top to bottom within the image bounds
        for (let y = 0; y < h; y++) {
            // Add edges that start at this y to the active edge list
            while (edge_index < edges.length && edges[edge_index].y1 === y) {
                active_edges.push(edges[edge_index]);
                edge_index++;
            }
    
            // Remove edges that end before this y
            active_edges = active_edges.filter(e => e.y2 > y);
    
            // Sort active edges by the current x-intercept for the scanline
            active_edges.sort((a, b) => a.x1 - b.x1);

            const aelm1 = active_edges.length - 1;

            //console.log('active_edges', active_edges);
    
            // Fill pixels between pairs of intersections
            for (let i = 0; i < aelm1; i += 2) {
                const x_start = Math.ceil(active_edges[i].x1);
                const x_end = Math.floor(active_edges[i + 1].x1);
    
                for (let x = x_start; x <= x_end; x++) {

                    const pixel_index = y * w + x;
                    this.ta[pixel_index >> 3] |= (128 >> (pixel_index & 0b111));

                    //this.set_pixel_on_1bipp_xy(x, y); // Fill with a color of 1 (binary for bitmask)
                }
            }
    
            // Update x-intercepts for active edges for the next scanline
            for (let edge of active_edges) {
                edge.x1 += edge.slope;
            }
        }
    }

    class_enh_gpt_draw_polygon_filling(polygon) {
        // Ensure the polygon is in the correct format
        polygon = Polygon.ensure_is(polygon);
    
        // Create a Polygon_Scanline_Edges instance for the polygon
        const polygon_scanline_edges = new Polygon_Scanline_Edges(polygon);
    
        // Get the size of the target bitmap (e.g., width and height)
        const [w, h] = this.size;
    
        // Create a ScanlineProcessor instance to handle the rendering logic
        const processor = new ScanlineProcessor(polygon_scanline_edges, w, h, this.ta);
        // Start processing and filling the polygon
        processor.process();
    }

    gpt_draw_filled_polygon(polygon) {
        draw_polygon_outline_to_ta_1bipp(this.ta, this.size[0], polygon);
        // Really want faster scanline drawing.
        // class_enh_gpt_draw_polygon_filling
        this.class_enh_gpt_draw_polygon_filling(polygon);
        //this.gpt_draw_polygon_filling(polygon);
    }

    

    draw_color_1_filled_polygon_1bipp(polygon) {
        //return this._polygon_class_xspans_attempt_draw_color_1_filled_polygon_1bipp(polygon);
        //return this.__bitwise_attempt_draw_color_1_filled_polygon_1bipp(polygon);
        return this.gpt_draw_filled_polygon(polygon);
    }


    // use ensure is polygon class instance function.
    // Polygon.ensure_is

    draw_polygon_1bipp(polygon, stroke_color, fill_color = false) {

        polygon = ensure_polygon_is_ta(polygon);

        // Ensure the polygon is provided as a ta...
        //   

        // Get polygon point coords, as in all the points.


        if (fill_color === undefined || fill_color === false) {
            let x, y;
            let prev_x, prev_y;
            let is_first = true;

            const num_points = polygon.length >>> 1;
            let r = 0;
            //console.log('polygon outline pre draw. num_points: ', num_points);
            //console.log('stroke_color', stroke_color);
            for (let c = 0; c < num_points; c++) {
                x = polygon[r++];
                y = polygon[r++];
                if (!is_first) {
                    this.draw_line([prev_x, prev_y], [x, y], stroke_color);
                }
                [prev_x, prev_y] = [x, y];
                is_first = false;

            }
            //x = polygon[r++];
            //y = polygon[r++];
            this.draw_line([prev_x, prev_y], [polygon[0], polygon[1]], stroke_color);
            //console.log('polygon outline drawn.');

            /*

            for ([x, y] of arr_points) {
                //console.log('[x, y]', [x, y]);
                if (!is_first) {
                    this.draw_line([prev_x, prev_y], [x, y], stroke_color);
                }
                [prev_x, prev_y] = [x, y];
                is_first = false;
            }
            this.draw_line([prev_x, prev_y], arr_points[0], stroke_color);

            */
        } else {
            //console.log('[stroke_color, fill_color]', [stroke_color, fill_color]);
            //console.trace();

            // Getting all the pixels for the outline?????
            //   This could be used to determine the x color 0 spans quickly I suppose, without having to draw things to any buffer bitmap first.
            //     Really want to detect the x color 0 spans that are contiguous with the very edges of the image.

            //throw 'NYI';
            if (stroke_color === 1) {
                if (fill_color === 1) {
                    // A filled polygon

                    // Get filled polygon x-spans
                    //   Draw those x-spans.

                    return this.draw_color_1_filled_polygon_1bipp(polygon);


                    
                } else if (fill_color === 0) {
                    // Needs to be filled with the color 0.
                    //   So basically need to get the outline and the inner shapes, draw them separately.

                    // Need to get the inner part x-spans.

                    console.trace();
                    throw 'NYI';



                }

            } else {

                if (fill_color === 1) {

                    // Only want the internal part of it.
                    console.trace();
                    throw 'NYI';

                } else if (fill_color === 0) {
                    console.trace();
                    throw 'NYI';
                    
                }

            }
        }

        



        



    }


    'draw_polygon'(arr_points, color, fill = false, stroke_color) {


        // Probably best to have separate 1bipp code path selected at the beginning

        // Convert it to the flat ta of points....
        //   Maybe could get the bounding box at the same time?





        const {bits_per_pixel} = this;

        if (bits_per_pixel === 1) {

            if (fill === true) {

                if (stroke_color === undefined) {
                    return this.draw_polygon_1bipp(arr_points, color, color);
                } else {

                    console.trace();
                    throw 'NYI';

                    if (stroke_color === 1) {
                        //draw_polygon_outline_to_ta_1bipp(this.ta, this.size[0], polygon);
                    } else {
                        
                    }

                    //
                    
                }

                


            } else {
                return this.draw_polygon_1bipp(arr_points, color);

            }


        } else {

            if (fill === true) {

                // Want to try the different 'flood fill inner pixels' for this polygon drawing.
                //  Will before long try on larger images. Maybe much larger too.


                const flood_fill_from_outside_invert_merge_implementation = () => {
                    const bb_points = get_points_bounding_box(arr_points);
                    // And want to get the size / range.

                    // Or, make a pixel_buffer that represents that space.
                    //  Having that pb handle offsets could be very useful.
                    //   Though maybe it would need some lower level changes?
                    //    Don't want to have to complicate code with offset handling all over the place.
                    //     Do offsets in the easiest way, then add further convenience features.

                    //console.log('bb_points', bb_points);

                    const offset = bb_points[0];

                    // + 1 to the polygon size, each dimension???
                    const polygon_size = [
                        [bb_points[1][0] - bb_points[0][0] + 1],
                        [bb_points[1][1] - bb_points[0][1] + 1]
                    ];

                    //console.log('polygon_size', polygon_size);

                    const pb_polygon = new this.constructor({
                        'bits_per_pixel': 1,
                        'size': polygon_size
                    })

                    //console.log('pb_polygon.ta.length', pb_polygon.ta.length);

                    //throw 'stop';

                    // Then draw the polygon to there...

                    const down_offsetted_points = arr_points.map(point => [point[0] - offset[0], point[1] - offset[1]]);

                    //console.log('down_offsetted_points', down_offsetted_points);

                    // or draw the polygon here in color 1?
                    //  as it's going to be used as a mask-type object.

                    let t1 = Date.now();


                    console.log('pre draw 1bipp polygon');
                    pb_polygon.draw_polygon(down_offsetted_points, 1, false);
                    let t2 = Date.now();
                    let td = t2 - t1;
                    console.log('post draw 1bipp polygon ms: ' + td);

                    const pb_polygon_unfilled = pb_polygon.clone();

                    t1 = Date.now();

                    // This flood fill from outside part of the drawing is the slowest part.
                    //  Likely we need a quicker way of checking if any pixels have already been visited.
                    //   Possibly could even use a 1bipp pixel buffer.

                    console.log('pre 1bipp flood fill from outside');

                    pb_polygon.flood_fill_off_pixels_from_outer_boundary_on_1bipp();
                    t2 = Date.now();
                    td = t2 - t1;

                    console.log('post 1bipp flood fill from outside ms:', td);
                    pb_polygon.invert();
                    pb_polygon.or(pb_polygon_unfilled);
                    
                    console.log('pre draw mask');
                    t1 = Date.now();

                    // Could speed this up using xspan drawing.
                    this.draw_1bipp_pixel_buffer_mask(pb_polygon, offset, color);
                    t2 = Date.now();
                    td = t2 - t1;
                    console.log('post draw mask ms:', td);
                }

                // Iterate scanline spans????

                const iterate_class_polygon_scanline_spans_implementation = () => {

                    const draw_stroke = () => {
                        let x, y;
                        let prev_x, prev_y;
                        let is_first = true;
                        for ([x, y] of arr_points) {
                            //console.log('[x, y]', [x, y]);
                            if (!is_first) {
                                this.draw_line([prev_x, prev_y], [x, y], color);
                            }
                            [prev_x, prev_y] = [x, y];
                            is_first = false;
                        }
                        this.draw_line([prev_x, prev_y], arr_points[0], color);
                    }


                    const draw_filling = () => {
                        const polygon = Polygon.ensure_is(ensure_polygon_is_ta(arr_points));
                        //polygon = polygon);
                    
                        // Create a Polygon_Scanline_Edges instance for the polygon
                        const polygon_scanline_edges = new Polygon_Scanline_Edges(polygon);
                    
                        // Get the size of the target bitmap (e.g., width and height)
                        const [w, h] = this.size;
                    
                        // Create a ScanlineProcessor instance to handle the rendering logic
                        const processor = new ScanlineProcessor(polygon_scanline_edges, w, h, this.ta);

                        for (const [y, x1, x2] of processor.iterate_process()) {
                            //console.log('[y, x1, x2]', [y, x1, x2]);

                            this.draw_horizontal_line([x1, x2], y, color);

                        }
                    }

                    draw_stroke();
                    draw_filling();

                    


                    



                }



                

                const fast_flood_fill_inner_implementation = () => {
                    //const t0 = Date.now();
                    //console.log('fast_flood_fill_inner_implementation ------');
                    //console.log('-------------------------------------------\n');

                    //console.log('!!arr_points', !!arr_points);

                    //console.log('arr_points.length', arr_points.length);

                    if (arr_points.length >= 2) {

                        // But make the mask have rows that round to 64 bit....

                        // Should not need to create a new pb for the mask.
                        //   Making a new pb is a bit slow. Speed that up somehow?

                        // A more direct way of drawing would be much better.
                        //  Draw it to a specially designed efficient and compact data structure.
                        //   Directly drawing the shape to an x off/on spans system?
                        // Drawing it to a scratch / buffer ta rather than a new pb.


                        // .ta2 - would create it if needed. Empty to start with.
                        //   Drawing a filled polygon to an empty ta, possibly a new one, possibly not.



                        const pb_mask = this.draw_filled_polygon_to_1bipp_pixel_buffer_mask(arr_points);
                        //  Draw filled polygon I think.
                        const offset = pb_mask.__offset;


                        this.draw_1bipp_pixel_buffer_mask(pb_mask, offset, color);
                        if (stroke_color !== undefined) {
                            this.draw_polygon(arr_points, stroke_color, false);
                        }
                    }
                    // then the basic draw unfilled polygon....

                }
                //fast_flood_fill_inner_implementation();

                iterate_class_polygon_scanline_spans_implementation();
            } else {

                // Should make a much faster implementation.
                //   Will not use set_pixel, but will track the pixel index, work out the offset for whichever move (could look it up from ta of 8) and adjust the pixel index, then do an inline set pixel on the ta.


                let x, y;
                let prev_x, prev_y;
                let is_first = true;
                for ([x, y] of arr_points) {
                    //console.log('[x, y]', [x, y]);
                    if (!is_first) {
                        this.draw_line([prev_x, prev_y], [x, y], color);
                    }
                    [prev_x, prev_y] = [x, y];
                    is_first = false;
                }
                this.draw_line([prev_x, prev_y], arr_points[0], color);
            }
        }
        

        // But a filled polygon is more complex to draw.


        // go through the points doing draw_line.


        // then back to the start.
    }

    
    
}
module.exports = Pixel_Buffer_Core_Draw_Polygons;