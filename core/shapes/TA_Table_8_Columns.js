class TA_Table_8_Columns {
    constructor(row_count) {
        this.row_size = 8; // Fixed row size of 8
        this.row_count = row_count;
        this.ta = new Float32Array(this.row_size * this.row_count);
        const sorted_indices = this.sorted_indices = new Uint32Array(this.row_count); // Sorted logical indices

        for (let i = 0; i < row_count; i++) {
            sorted_indices[i] = i;
        }
    }

    get(row, col) {
        return this.ta[(row << 3) + col];
    }

    set(row, col, value) {
        this.ta[(row << 3) + col] = value;
    }

    sort_indices(comparator) {
        this.sorted_indices.sort((a, b) => comparator(a, b, this));
    }
}

module.exports = TA_Table_8_Columns;
