const DEBUG = require('./is_debug');
const Polygon_Edges = require('./Polygon_Edges');

class Scanline_Polygon_Edges extends Polygon_Edges {
    constructor(polygon, options = {}) {
        super(polygon);
        this.active_edges = new Uint32Array(this.row_count); // Backed by typed array
        this.num_active_edges = 0;
        this.allow_horizontal_edges = options.allow_horizontal_edges || false;
    }

    update_active_edges(scanline_y) {
        let write_index = 0;

        const {active_edges, sorted_indices} = this;

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

        const sil = sorted_indices.length;

        // Add new edges that start at this scanline
        for (let i = 0; i < sil; i++) {
            const edge_index = sorted_indices[i];
            const y1 = this.get(edge_index, 1); // y1 is the starting y-coordinate
            const y2 = this.get(edge_index, 3);

            if (y1 === scanline_y && (scanline_y < y2 || (this.allow_horizontal_edges && scanline_y === y2))) {
                active_edges[this.num_active_edges++] = edge_index;
                if (DEBUG) {
                    console.log(
                        `Edge ${edge_index} added (scanline_y=${scanline_y}, y1=${y1}, y2=${y2})`
                    );
                }
            }
        }

        if (DEBUG) {
            console.log(
                `Updated active edges for scanline ${scanline_y}:`,
                active_edges.slice(0, this.num_active_edges)
            );
        }
    }

    sort_active_edges_by_x() {
        this.active_edges.set(
            this.active_edges
                .slice(0, this.num_active_edges)
                .sort((edgeA, edgeB) => this.get(edgeA, 0) - this.get(edgeB, 0))
        );

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
}

module.exports = Scanline_Polygon_Edges;
