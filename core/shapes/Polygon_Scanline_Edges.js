const DEBUG = require('./is_debug');
const Polygon_Edges = require('./Polygon_Edges');

class Scanline_Polygon_Edges extends Polygon_Edges {
    constructor(polygon, options = {}) {
        super(polygon);
        this.active_edges = new Uint32Array(this.row_count); // Backed by typed array
        this.x_intercepts = new Float64Array(this.row_count);
        this.num_active_edges = 0;
        this.allow_horizontal_edges = options.allow_horizontal_edges || false;
        this.next_edge_index = 0;
        this.last_scanline_y = null;
    }

    reset() {
        this.num_active_edges = 0;
        this.next_edge_index = 0;
        this.last_scanline_y = null;
        return this;
    }

    update_active_edges(scanline_y) {
        if (this.last_scanline_y !== null && scanline_y <= this.last_scanline_y) {
            this.reset();
        }

        let write_index = 0;

        const {active_edges, sorted_indices, x_intercepts} = this;

        // Remove inactive edges
        for (let i = 0; i < this.num_active_edges; i++) {
            const edge_index = active_edges[i];
            const y2 = this.get(edge_index, 3); // y2 is the ending y-coordinate

            if (scanline_y < y2 || (this.allow_horizontal_edges && scanline_y === y2)) {
                active_edges[write_index++] = edge_index; // Keep active
            } else if (DEBUG) {
                console.log(`Edge ${edge_index} removed (scanline_y=${scanline_y}, y2=${y2})`);
            }
        }

        this.num_active_edges = write_index;

        // The indices are sorted once by y1. Advancing a cursor avoids scanning
        // every polygon edge on every image row and also admits edges which
        // entered above the bitmap (y1 < 0) when processing row zero.
        while (this.next_edge_index < sorted_indices.length) {
            const edge_index = sorted_indices[this.next_edge_index];
            const y1 = this.get(edge_index, 1); // y1 is the starting y-coordinate
            if (y1 > scanline_y) break;

            this.next_edge_index++;
            const y2 = this.get(edge_index, 3);

            if (scanline_y < y2 || (this.allow_horizontal_edges && scanline_y === y2)) {
                active_edges[this.num_active_edges++] = edge_index;
                if (DEBUG) {
                    console.log(
                        `Edge ${edge_index} added (scanline_y=${scanline_y}, y1=${y1}, y2=${y2})`
                    );
                }
            }
        }

        // Re-evaluate from the immutable edge origin instead of accumulating a
        // rounded Float32 delta. This prevents ceil/floor from losing a pixel at
        // exact intersections and makes the edge table reusable.
        for (let i = 0; i < this.num_active_edges; i++) {
            const edge_index = active_edges[i];
            const y1 = this.get(edge_index, 1);
            const x1 = this.get(edge_index, 0);
            const y2 = this.get(edge_index, 3);
            x_intercepts[edge_index] = x1 +
                ((scanline_y - y1) * (this.get(edge_index, 2) - x1)) / (y2 - y1);
        }

        this.last_scanline_y = scanline_y;

        if (DEBUG) {
            console.log(
                `Updated active edges for scanline ${scanline_y}:`,
                active_edges.slice(0, this.num_active_edges)
            );
        }
    }

    sort_active_edges_by_x() {
        const {active_edges, x_intercepts, num_active_edges} = this;

        // Polygon scanlines normally have only a handful of active edges.
        // Insertion sort is allocation-free and performs well for this small,
        // nearly-sorted list.
        for (let i = 1; i < num_active_edges; i++) {
            const edge = active_edges[i];
            const x = x_intercepts[edge];
            let j = i - 1;
            while (j >= 0) {
                const previous = active_edges[j];
                const previous_x = x_intercepts[previous];
                if (previous_x < x || (previous_x === x && previous <= edge)) break;
                active_edges[j + 1] = previous;
                j--;
            }
            active_edges[j + 1] = edge;
        }

        if (DEBUG) {
            console.log(
                `Sorted active edges by x:`,
                this.active_edges.slice(0, this.num_active_edges)
            );
        }
    }

    get_active_edges() {
        // Slice to return only the active edges
        return this.active_edges.slice(0, this.num_active_edges);
    }

    get_x_intercept(edge_index) {
        return this.x_intercepts[edge_index];
    }
}

module.exports = Scanline_Polygon_Edges;
