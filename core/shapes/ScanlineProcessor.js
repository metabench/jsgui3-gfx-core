const DEBUG = require('./is_debug');

const Polygon_Scanline_Edges = require('./Polygon_Scanline_Edges');

class ScanlineProcessor {
    constructor(polygon_scanline_edges, width, height, bitmap) {
        this.edges = polygon_scanline_edges;
        this.width = width;
        this.height = height;
        this.bitmap = bitmap;
    }

    process() {

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

            this.fill_scanline(y);
            this._update_x_intercepts();
        }
    }

    fill_scanline(scanline_y) {
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

            if (x_start <= x_end) {
                let x = x_start;
                let pixel_index = row_offset + x;

                while (x++ <= x_end) {
                    const byte_offset = pixel_index >> 3;
                    bitmap[byte_offset] |= (128 >> (pixel_index & 7));
                    pixel_index++;
                }

                if (DEBUG) {
                    console.log(`Scanline ${scanline_y}: Filling span from x=${x_start} to x=${x_end}`);
                }
            } else if (DEBUG) {
                console.warn(`Scanline ${scanline_y}: Invalid span x_start=${x_start}, x_end=${x_end}`);
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
