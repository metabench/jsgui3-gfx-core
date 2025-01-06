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
        const [w, h] = this.size;
        polygon = Polygon.ensure_is(polygon);
        const polygon_scanline_edges = new Polygon_Scanline_Edges(polygon);
        const processor = new ScanlineProcessor(polygon_scanline_edges, w, h, this.ta);
        processor.process();
    }

    gpt_draw_filled_polygon_1bipp(polygon) {
        polygon = Polygon.ensure_is(ensure_polygon_is_ta(polygon));
        const scanline_processor = new ScanlineProcessor(
            polygon.scanline_edges, 
            this.size[0], 
            this.size[1], 
            this.ta, 
            { draw_edges: true } // Enable edge drawing
        );
        scanline_processor.process_1bipp();
    }

    

    draw_color_1_filled_polygon_1bipp(polygon) {
        return this.gpt_draw_filled_polygon_1bipp(polygon);
    }

    draw_polygon_1bipp(polygon, stroke_color, fill_color = false) {

        polygon = ensure_polygon_is_ta(polygon);
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
        } else {
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

                // Let's have a faster way to draw these.
                //   Likely will use ta.set to set some larger number of pixels all at once, with 24bipp would need to do a num both divisible by 4 and by 3, so use a factor of 12.
                //     Like 144 bytes at once, ie 48 pixels at once.







                // Want to try the different 'flood fill inner pixels' for this polygon drawing.
                //  Will before long try on larger images. Maybe much larger too.



                // Iterate scanline spans????

                const iterate_class_polygon_scanline_spans_implementation = () => {

                    /*
                    const draw_stroke = () => {
                        //let x, y;
                        let prev_x, prev_y;
                        let is_first = true;
                        for (const [x, y] of arr_points) {
                            //console.log('[x, y]', [x, y]);
                            if (!is_first) {
                                this.draw_line([prev_x, prev_y], [x, y], color);
                            }
                            [prev_x, prev_y] = [x, y];
                            is_first = false;
                        }
                        this.draw_line([prev_x, prev_y], arr_points[0], color);
                    }
                    */


                    const draw_filling = () => {
                        const polygon = Polygon.ensure_is(ensure_polygon_is_ta(arr_points));
                        //polygon = polygon);
                    
                        // Create a Polygon_Scanline_Edges instance for the polygon
                        const polygon_scanline_edges = new Polygon_Scanline_Edges(polygon);
                    
                        // Get the size of the target bitmap (e.g., width and height)
                        const [w, h] = this.size;
                    
                        // Create a ScanlineProcessor instance to handle the rendering logic
                        const processor = new ScanlineProcessor(polygon_scanline_edges, w, h, this.ta, { draw_edges: true });

                        // Create the pre-populated array???

                        if (bits_per_pixel === 24) {
                            //const ppal = 96 * 3;
                            const ppal = 64 * 3;
                            const pre_populated_array = new Uint8Array(ppal); // 96 pixels, 288 bytes
                
                            for (let i = 0; i < ppal;) {
                                pre_populated_array[i++] = color[0];
                                pre_populated_array[i++] = color[1];
                                pre_populated_array[i++] = color[2];
                            }

                            for (const [y, x1, x2] of processor.iterate_process()) {
                                this.draw_horizontal_line_24bipp_y_x1_x2(y, x1, x2, color, pre_populated_array, false);

                            }
                        } else {
                            for (const [y, x1, x2] of processor.iterate_process()) {
                                //console.log('[y, x1, x2]', [y, x1, x2]);

                                //this.draw_horizontal_line([x1, x2], y, color);
                                this.draw_horizontal_line_y_x1_x2(y, x1, x2, color);

                                // draw_horizontal_line_y_x1_x2

                            }
                        }

                        
                    }
                    //draw_stroke();
                    draw_filling();
                }

                iterate_class_polygon_scanline_spans_implementation();
            } else {

                // Should make a much faster implementation.
                //   Will not use set_pixel, but will track the pixel index, work out the offset for whichever move (could look it up from ta of 8) and adjust the pixel index, then do an inline set pixel on the ta.


                //let x, y;
                let prev_x, prev_y;
                let is_first = true;
                for (const [x, y] of arr_points) {
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