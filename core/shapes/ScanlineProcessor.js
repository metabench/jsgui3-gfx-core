const DEBUG = require('./is_debug');

class ScanlineProcessor {
    constructor(polygon_scanline_edges, width, height, bitmap, options = {}) {
        this.edges = polygon_scanline_edges;
        this.width = width;
        this.height = height;
        this.bitmap = bitmap;
        this.dataView = new DataView(bitmap.buffer, bitmap.byteOffset, bitmap.byteLength);
        this.draw_edges = options.draw_edges || false; // Option to draw edges
    }

    process_1bipp() {
        if (DEBUG) {
            console.log(`Processing polygon fill: width=${this.width}, height=${this.height}`);
        }

        const h = this.height, edges = this.edges;

        for (let y = 0; y < h; y++) {
            edges.update_active_edges(y);
            edges.sort_active_edges_by_x();

            if (DEBUG) {
                console.log(`Scanline ${y}: Active Edges`, edges.active_edges.slice(0, edges.num_active_edges));
            }

            if (this.draw_edges) {
                this.fill_scanline_with_edges_1bipp(y);
            } else {
                this.fill_scanline_no_edges_1bipp(y);
            }
            this._update_x_intercepts();
        }
    }

    _set_pixels_span_1bipp(bitmap, row_offset, x_start, x_end) {
        const total_pixels = x_end - x_start + 1;
        const start_index = row_offset + x_start;
        
        const end_index = row_offset + x_end;
        let pixel_index = start_index;

        if (total_pixels < 12) {
            // Default behavior for fewer than 16 pixels
            
            for (; pixel_index <= end_index; pixel_index++) {
                const byte_offset = pixel_index >> 3;
                bitmap[byte_offset] |= (128 >> (pixel_index & 7));
            }

            
        } else {
            const start_byte = start_index >> 3;
            const start_bit_offset = pixel_index & 7;
            let num_pixels_remaining = total_pixels;
            if (total_pixels < 90) {
                //let pixel_index = row_offset + x_start;
                //const start_byte = pixel_index >> 3;
                
                

                // Handle first byte if not aligned
                if (start_bit_offset !== 0) {
                    const bits_to_set = Math.min(8 - start_bit_offset, num_pixels_remaining);
                    bitmap[start_byte] |= ((0xFF >> (8 - bits_to_set)) << (8 - start_bit_offset - bits_to_set));
                    pixel_index += bits_to_set;
                    num_pixels_remaining -= bits_to_set;
                }

                // Handle remaining whole bytes
                while (num_pixels_remaining >= 8) {
                    const byte_offset = pixel_index >> 3;
                    bitmap[byte_offset] |= 0xFF;
                    pixel_index += 8;
                    num_pixels_remaining -= 8;
                }

                // Handle remaining bits
                if (num_pixels_remaining > 0) {
                    const byte_offset = pixel_index >> 3;
                    bitmap[byte_offset] |= (0xFF << (8 - num_pixels_remaining));
                }
            } else {
                const dataView = this.dataView;
                //let pixel_index = row_offset + x_start;
                //const start_byte = pixel_index >> 3;
                //const start_bit_offset = pixel_index & 7;
                //let num_pixels_remaining = total_pixels;

                // Handle first byte if not aligned
                if (start_bit_offset !== 0) {
                    const bits_to_set = Math.min(8 - start_bit_offset, num_pixels_remaining);
                    bitmap[start_byte] |= ((0xFF >> (8 - bits_to_set)) << (8 - start_bit_offset - bits_to_set));
                    pixel_index += bits_to_set;
                    num_pixels_remaining -= bits_to_set;
                }

                // Handle 64-bit chunks
                while (num_pixels_remaining >= 64) {
                    const byte_offset = pixel_index >> 3;
                    dataView.setBigUint64(byte_offset, 0xFFFFFFFFFFFFFFFFn, false);
                    pixel_index += 64;
                    num_pixels_remaining -= 64;
                }

                // Handle remaining whole bytes
                while (num_pixels_remaining >= 8) {
                    const byte_offset = pixel_index >> 3;
                    bitmap[byte_offset] |= 0xFF;
                    pixel_index += 8;
                    num_pixels_remaining -= 8;
                }

                // Handle remaining bits
                if (num_pixels_remaining > 0) {
                    const byte_offset = pixel_index >> 3;
                    bitmap[byte_offset] |= (0xFF << (8 - num_pixels_remaining));
                }
            }
        } 
        
        
        

       
    }

    

    fill_scanline_with_edges_1bipp(scanline_y) {
        const { edges } = this;
        const { active_edges, num_active_edges } = this.edges;

        if (num_active_edges < 2) {
            if (DEBUG) console.log(`Scanline ${scanline_y}: Not enough active edges to form spans.`);
            return;
        }

        const bitmap = this.bitmap;
        const row_offset = scanline_y * this.width;
        const naem1 = num_active_edges - 1;

        for (let i = 0; i < naem1; i += 2) {
            const x_start = Math.round(edges.get(active_edges[i], 0));
            const x_end = Math.round(edges.get(active_edges[i + 1], 0));

            this._set_pixels_span_1bipp(bitmap, row_offset, x_start, x_end);

            //const is_horizontal = edges.get(active_edges[i], 5) === 1; // Check if edge is horizontal

            // Draw the left edge pixel
            //const left_edge_pixel_index = row_offset + x_start;
            //const left_byte_offset = left_edge_pixel_index >> 3;
            //bitmap[left_byte_offset] |= (128 >> (left_edge_pixel_index & 7));

            //if (is_horizontal) {
                // Draw the entire horizontal edge as a span
                
                //continue; // Horizontal edge fully handled here
            //} else {
                // Fill the span between edges
            //    this._set_pixels_span_1bipp(bitmap, row_offset, x_start, x_end);

                // Draw the right edge pixel
                //const right_edge_pixel_index = row_offset + x_end;
                //const right_byte_offset = right_edge_pixel_index >> 3;
                //bitmap[right_byte_offset] |= (128 >> (right_edge_pixel_index & 7));
            //}

            

            if (DEBUG) {
                console.log(`Scanline ${scanline_y}: Processed span from x=${x_start} to x=${x_end}`);
            }
        }
    }

    fill_scanline_no_edges_1bipp(scanline_y) {
        const { edges } = this;
        const { active_edges, num_active_edges } = this.edges;

        if (num_active_edges < 2) {
            if (DEBUG) console.log(`Scanline ${scanline_y}: Not enough active edges to form spans.`);
            return;
        }

        const bitmap = this.bitmap;
        const row_offset = scanline_y * this.width;
        const naem1 = num_active_edges - 1;

        for (let i = 0; i < naem1; i += 2) {
            const x_start = Math.ceil(edges.get(active_edges[i], 0));
            const x_end = Math.floor(edges.get(active_edges[i + 1], 0));

            // Fill the span between edges
            this._set_pixels_span_1bipp(bitmap, row_offset, x_start, x_end);

            if (DEBUG) {
                console.log(`Scanline ${scanline_y}: Filling span from x=${x_start} to x=${x_end}`);
            }
        }
    }

    *iterate_process() {
        const h = this.height, edges = this.edges;

        for (let y = 0; y < h; y++) {
            edges.update_active_edges(y);
            edges.sort_active_edges_by_x();

            if (DEBUG) {
                console.log(`Scanline ${y}: Active Edges`, edges.active_edges.slice(0, edges.num_active_edges));
            }

            yield* this.iterate_scanline(y);
            this._update_x_intercepts();
        }
    }

    *iterate_scanline(scanline_y) {
        const { edges } = this;
        const { active_edges, num_active_edges } = this.edges;

        if (num_active_edges < 2) {
            if (DEBUG) console.log(`Scanline ${scanline_y}: Not enough active edges to form spans.`);
            return;
        }

        for (let i = 0; i < num_active_edges - 1; i += 2) {
            const x_start = Math.ceil(edges.get(active_edges[i], 0));
            const x_end = Math.floor(edges.get(active_edges[i + 1], 0));

            if (x_start <= x_end) {
                yield [scanline_y, x_start, x_end];
            }
        }
    }

    _update_x_intercepts() {
        const edges = this.edges;
        const { active_edges, num_active_edges } = edges;

        for (let i = 0; i < num_active_edges; i++) {
            const edge_index = active_edges[i];
            edges.set(edge_index, 0, edges.get(edge_index, 0) + edges.get(edge_index, 4));

            if (DEBUG) {
                console.log(`Edge ${edge_index}: Updated x=${edges.get(edge_index, 0)} using slope=${edges.get(edge_index, 4)}`);
            }
        }
    }
}

module.exports = ScanlineProcessor;
