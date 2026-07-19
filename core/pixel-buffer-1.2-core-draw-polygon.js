const Pixel_Buffer_Core_Draw_Lines = require('./pixel-buffer-1.1-core-draw-line');

const Polygon_Scanline_Edges = require('./shapes/Polygon_Scanline_Edges');

let {resize_ta_colorspace, copy_rect_to_same_size_8bipp, copy_rect_to_same_size_24bipp, dest_aligned_copy_rect_1to4bypp,

    get_ta_bits_that_differ_from_previous_as_1s, right_shift_32bit_with_carry,
    xor_typed_arrays, each_1_index, count_1s,

    draw_polygon_outline_to_ta_1bipp, calc_polygon_stroke_points_x_y


} = require('./ta-math');


const Polygon = require('./shapes/Polygon');
const ScanlineProcessor = require('./shapes/ScanlineProcessor');
class Pixel_Buffer_Core_Draw_Polygons extends Pixel_Buffer_Core_Draw_Lines {
    constructor(spec) {
        
        super(spec);
        
    }

    gpt_draw_polygon_filling(polygon) {
        polygon = Polygon.ensure_is(polygon)._get_ta_points();
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
            // Admit every edge that has started, including an edge entering the
            // image from above. Its intercept is advanced directly to this row.
            while (edge_index < edges.length && edges[edge_index].y1 <= y) {
                const edge = edges[edge_index];
                if (edge.y2 > y) {
                    edge.current_x = edge.x1 + (y - edge.y1) * edge.slope;
                    active_edges.push(edge);
                }
                edge_index++;
            }
    
            // Remove edges that end before this y
            active_edges = active_edges.filter(e => e.y2 > y);
    
            // Sort active edges by the current x-intercept for the scanline
            active_edges.sort((a, b) => a.current_x - b.current_x);

            const aelm1 = active_edges.length - 1;

            //console.log('active_edges', active_edges);
    
            // Fill pixels between pairs of intersections
            for (let i = 0; i < aelm1; i += 2) {
                const x_start = Math.max(0, Math.ceil(active_edges[i].current_x));
                const x_end = Math.min(w - 1, Math.floor(active_edges[i + 1].current_x));
                const row_start = y * this.bytes_per_row;
    
                for (let x = x_start; x <= x_end; x++) {
                    this.ta[row_start + (x >> 3)] |= 128 >> (x & 7);

                    //this.set_pixel_on_1bipp_xy(x, y); // Fill with a color of 1 (binary for bitmask)
                }
            }
    
            // Update x-intercepts for active edges for the next scanline
            for (let edge of active_edges) {
                edge.current_x += edge.slope;
            }
        }
    }

    class_enh_gpt_draw_polygon_filling(polygon) {
        const [w, h] = this.size;
        polygon = Polygon.ensure_is(polygon);
        const polygon_scanline_edges = new Polygon_Scanline_Edges(polygon);
        const processor = new ScanlineProcessor(polygon_scanline_edges, w, h, this.ta, {
            rowStrideBytes: this.bytes_per_row
        });
        processor.process();
    }

    gpt_draw_filled_polygon_1bipp(polygon) {
        polygon = Polygon.ensure_is(polygon);
        const scanline_processor = new ScanlineProcessor(
            polygon.scanline_edges, 
            this.size[0], 
            this.size[1], 
            this.ta, 
            {
                draw_edges: true,
                rowStrideBytes: this.bytes_per_row
            } // Enable edge drawing
        );
        scanline_processor.process_1bipp();
    }

    

    draw_color_1_filled_polygon_1bipp(polygon) {
        return this.gpt_draw_filled_polygon_1bipp(polygon);
    }

    _draw_polygon_outline_points(polygon, color) {
        let previous_x = polygon[0], previous_y = polygon[1];
        for (let i = 2; i < polygon.length; i += 2) {
            const x = polygon[i], y = polygon[i + 1];
            this.draw_line([previous_x, previous_y], [x, y], color);
            previous_x = x;
            previous_y = y;
        }
        this.draw_line([previous_x, previous_y], [polygon[0], polygon[1]], color);
    }

    draw_polygon_1bipp(polygon, stroke_color, fill_color = false) {

        const polygon_shape = Polygon.ensure_is(polygon);
        polygon = polygon_shape._get_ta_points();
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
                    this.draw_color_1_filled_polygon_1bipp(polygon_shape);
                    this._draw_polygon_outline_points(polygon, 1);
                    return;


                    
                }
            }

            if ((stroke_color !== 0 && stroke_color !== 1) ||
                (fill_color !== 0 && fill_color !== 1)) {
                throw new TypeError('1bipp polygon stroke and fill colors must be 0 or 1');
            }

            // The on/on case above retains the existing direct packed-bit hot
            // path. Other combinations were previously unreachable NYI paths,
            // so compose their fill spans and outline explicitly.
            if (fill_color === 1) {
                this.draw_color_1_filled_polygon_1bipp(polygon_shape);
            } else {
                const processor = new ScanlineProcessor(
                    polygon_shape.scanline_edges,
                    this.size[0],
                    this.size[1],
                    this.ta,
                    {draw_edges: true, rowStrideBytes: this.bytes_per_row}
                );
                for (const [y, x1, x2] of processor.iterate_process()) {
                    this.draw_horizontal_line_off_1bipp_inclusive([x1, x2], y);
                }
            }

            this._draw_polygon_outline_points(polygon, stroke_color);
        }
    }


    'draw_polygon'(arr_points, color, fill = false, stroke_color) {

        const {bits_per_pixel} = this;

        if (bits_per_pixel === 1) {

            if (fill === true) {
                if (stroke_color === undefined) {
                    return this.draw_polygon_1bipp(arr_points, color, color);
                } else {
                    return this.draw_polygon_1bipp(arr_points, stroke_color, color);
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
                        const polygon = Polygon.ensure_is(arr_points);
                        //polygon = polygon);
                    
                        // Create a Polygon_Scanline_Edges instance for the polygon
                        const polygon_scanline_edges = new Polygon_Scanline_Edges(polygon);
                    
                        // Get the size of the target bitmap (e.g., width and height)
                        const [w, h] = this.size;
                    
                        // Create a ScanlineProcessor instance to handle the rendering logic
                        const processor = new ScanlineProcessor(polygon_scanline_edges, w, h, this.ta, {
                            draw_edges: true,
                            rowStrideBytes: this.bytes_per_row
                        });

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
                const outline_points = Polygon.ensure_is(arr_points)._get_ta_points();
                this._draw_polygon_outline_points(
                    outline_points,
                    stroke_color === undefined ? color : stroke_color
                );
            } else {

                // Should make a much faster implementation.
                //   Will not use set_pixel, but will track the pixel index, work out the offset for whichever move (could look it up from ta of 8) and adjust the pixel index, then do an inline set pixel on the ta.


                //let x, y;
                const points = Polygon.ensure_is(arr_points)._get_ta_points();
                let prev_x = points[0], prev_y = points[1];
                for (let i = 2; i < points.length; i += 2) {
                    const x = points[i], y = points[i + 1];
                    this.draw_line([prev_x, prev_y], [x, y], color);
                    prev_x = x;
                    prev_y = y;
                }
                this.draw_line([prev_x, prev_y], [points[0], points[1]], color);
            }
        }
        

        // But a filled polygon is more complex to draw.


        // go through the points doing draw_line.


        // then back to the start.
    }

    
    
}
module.exports = Pixel_Buffer_Core_Draw_Polygons;
