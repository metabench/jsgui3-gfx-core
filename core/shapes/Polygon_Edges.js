const DEBUG = require('./is_debug');
const TA_Table_8_Columns = require('./TA_Table_8_Columns');

class Polygon_Edges extends TA_Table_8_Columns {
    constructor(polygon) {
        const ptap = polygon.ta_points;
        const num_points = ptap.length >> 1; // Divide length by 2 to get number of points

        let num_edges = 0;

        // Loop to determine the number of edges
        for (let i = 0; i < num_points; i++) {
            const y1 = ptap[(i << 1) + 1]; // i * 2 + 1 becomes (i << 1) + 1, efficient bitwise multiply
            const y2 = ptap[(((i + 1) % num_points) << 1) + 1]; // Proper multiplication by 2 for the lookup

            if (y1 !== y2 || y1 === y2) { // Count horizontal edges as well
                num_edges++;
            }
        }

        super(num_edges);
        this.sorted_indices = new Uint32Array(num_edges);

        this.populate_edges(polygon);
        this.sort_by_y1_then_x1();
    }

    populate_edges(polygon) {
        const ptap = polygon.ta_points;
        const num_points = ptap.length >> 1;
        const {sorted_indices} = this;

        let row = 0;
        for (let i = 0; i < num_points; i++) {

            const ix2 = i << 1;

            const indx2 = ((i + 1) % num_points) << 1;

            const x1 = ptap[ix2];
            const y1 = ptap[ix2 + 1];
            const x2 = ptap[indx2];
            const y2 = ptap[indx2 + 1];

            if (y1 !== y2 || y1 === y2) { // Include horizontal edges
                const is_horizontal = (y1 === y2) ? 1 : 0;
                this.set(row, 0, y1 < y2 ? x1 : x2); // x1
                this.set(row, 1, Math.min(y1, y2)); // y1
                this.set(row, 2, y1 < y2 ? x2 : x1); // x2
                this.set(row, 3, Math.max(y1, y2)); // y2
                this.set(row, 4, (y1 !== y2) ? (x2 - x1) / (y2 - y1) : 0); // Slope (0 for horizontal)
                this.set(row, 5, is_horizontal); // is_horizontal (1 for horizontal, 0 otherwise)
                sorted_indices[row] = row;
                row++;
            }
        }

        if (DEBUG) {
            console.log('Edges populated:', Array.from({ length: this.row_count }, (_, i) => ({
                x1: this.get(i, 0),
                y1: this.get(i, 1),
                x2: this.get(i, 2),
                y2: this.get(i, 3),
                slope: this.get(i, 4),
                is_horizontal: this.get(i, 5),
            })));
        }
    }

    sort_by_y1_then_x1() {
        this.sorted_indices.sort((a, b) => {
            const y1A = this.get(a, 1);
            const y1B = this.get(b, 1);
            if (y1A !== y1B) return y1A - y1B;
            const x1A = this.get(a, 0);
            const x1B = this.get(b, 0);
            return x1A - x1B;
        });

        if (DEBUG) {
            console.log(
                'Sorted edges by y1, then x1:',
                this.sorted_indices.map((index) => ({
                    x1: this.get(index, 0),
                    y1: this.get(index, 1),
                    x2: this.get(index, 2),
                    y2: this.get(index, 3),
                    slope: this.get(index, 4),
                    is_horizontal: this.get(index, 5),
                }))
            );
        }
    }
}

module.exports = Polygon_Edges;
