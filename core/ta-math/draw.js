


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


const ensure_polygon_is_ta = polygon => {
    if (is_integer_typed_array(polygon)) {
        // Length must be divisible by 2.

        if (polygon.length % 2 === 0) {
            return polygon;
        } else {
            throw 'ta must have even number length, being [x, y] pairs';
        }
    } else {
        return new Uint32Array(polygon.flat());
    }
}


// Polygon really should be as a ta.

const draw_polygon_outline_to_ta_1bipp = (ta, img_width, polygon) => {
    polygon = ensure_polygon_is_ta(polygon);


    // Then go through the points of the polygon....
    //   Connect the dots.

    const num_points = polygon.length >>> 1;
    //console.log('num_points', num_points);
    // then go from point 1 (not 0), looking back at the prev.

    let r = 0, x = polygon[r++], y = polygon[r++], next_x, next_y;
    let dx, dy, sx, sy, err, e2;

    //throw 'stop';

    // set_pixel_on function.....

    const set_pixel_on = (x, y) => {
        const idx_bit = (y * img_width) + x;
        const byte = idx_bit >> 3;
        const bit = (idx_bit & 0b111);
        ta[byte] |= (128 >> bit);
    }



    for (let p = 1; p < num_points; p++) {
        // And compare with the previous....

        next_x = polygon[r++]; next_y = polygon[r++];

        dx = Math.abs(next_x - x);
        dy = Math.abs(next_y - y);
        sx = (x < next_x) ? 1 : -1;
        sy = (y < next_y) ? 1 : -1;
        err = dx - dy;

        while (true) {
            //this.set_pixel_1bipp([x, y], 1);
            set_pixel_on(x, y);

            if (x === next_x && y === next_y) {
                break;
            }

            e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x += sx;
            }

            if (e2 < dx) {
                err += dx;
                y += sy;
            }
        }
        // Draw the line between them....

        x = next_x; y = next_y;
    }

    next_x = polygon[0]; next_y = polygon[1];

    dx = Math.abs(next_x - x);
    dy = Math.abs(next_y - y);
    sx = (x < next_x) ? 1 : -1;
    sy = (y < next_y) ? 1 : -1;
    err = dx - dy;

    while (true) {
        //this.set_pixel_1bipp([x, y], 1);
        set_pixel_on(x, y);

        if (x === next_x && y === next_y) {
            break;
        }

        e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x += sx;
        }

        if (e2 < dx) {
            err += dx;
            y += sy;
        }
    }

    return ta;



    // And have an inline drawing function here?
    //   Or at least re-expressing the set_pixel_on function.

    // converting [x, y] <=> pixel_index

    // draw line function....
    //   copy from before.




}

const remove_duplicates = (ta) => {
    // Step 1: Sort the array by y-values, then by x-values if y's are the same
    quicksort_points(ta); // Assumes quicksort_points is defined as in the previous response

    const numRecords = ta.length >>> 1;

    // Step 2: Count unique entries
    let uniqueCount = 0;
    let prev_x, prev_y;

    for (let i = 0; i < numRecords; i++) {
        const x = ta[i * 2];
        const y = ta[i * 2 + 1];

        if (i === 0 || x !== prev_x || y !== prev_y) {
            uniqueCount++;
            prev_x = x;
            prev_y = y;
        }
    }

    // Step 3: Create a new array with the size of unique entries
    const result = new ta.constructor(uniqueCount * 2);

    // Step 4: Copy unique entries to the result array
    let index = 0;
    prev_x = prev_y = undefined; // Reset previous values for copying loop

    for (let i = 0; i < numRecords; i++) {
        const x = ta[i * 2];
        const y = ta[i * 2 + 1];

        if (i === 0 || x !== prev_x || y !== prev_y) {
            result[index * 2] = x;
            result[index * 2 + 1] = y;
            index++;

            prev_x = x;
            prev_y = y;
        }
    }

    return result;
};

const quicksort_points = (ta) => {
    const partition = (left, right, pivotIndex) => {
        const pivotY = ta[pivotIndex * 2 + 1]; // Pivot y value
        const pivotX = ta[pivotIndex * 2]; // Pivot x value

        // Swap pivot with the rightmost element
        swap(pivotIndex, right);

        let storeIndex = left;

        for (let i = left; i < right; i++) {
            const currentY = ta[i * 2 + 1];
            const currentX = ta[i * 2];
            
            // Compare y-values first, then x-values if y-values are the same
            if (currentY < pivotY || (currentY === pivotY && currentX < pivotX)) {
                swap(i, storeIndex);
                storeIndex++;
            }
        }

        // Move pivot to its final place
        swap(storeIndex, right);

        return storeIndex;
    };

    const quicksort_recursive = (left, right) => {
        if (left < right) {
            const pivotIndex = Math.floor((left + right) / 2); // Choose a middle pivot
            const newPivot = partition(left, right, pivotIndex);

            // Recursively sort the subarrays
            quicksort_recursive(left, newPivot - 1);
            quicksort_recursive(newPivot + 1, right);
        }
    };

    const swap = (i, j) => {
        if (i === j) return;

        // Swap x values
        const tempX = ta[i * 2];
        ta[i * 2] = ta[j * 2];
        ta[j * 2] = tempX;

        // Swap y values
        const tempY = ta[i * 2 + 1];
        ta[i * 2 + 1] = ta[j * 2 + 1];
        ta[j * 2 + 1] = tempY;
    };

    const numRecords = ta.length >>> 1; // Number of records (each record has two values)

    quicksort_recursive(0, numRecords - 1);
    return ta;
};

const calc_polygon_stroke_points_x_y = polygon => {
    polygon = ensure_polygon_is_ta(polygon);

    const arr_stroke_points = [];

    const num_points = polygon.length >>> 1;
    //console.log('num_points', num_points);
    // then go from point 1 (not 0), looking back at the prev.

    let r = 0, x = polygon[r++], y = polygon[r++], next_x, next_y;
    let dx, dy, sx, sy, err, e2;

    //throw 'stop';

    // set_pixel_on function.....

    // and go back further in previousness checks?
    let prev_x, prev_y;

    const set_pixel_on = (x, y) => {
        if (!(prev_x === x && prev_y === y)) {
            arr_stroke_points.push(x, y);
        }
        // But not if it is repeated from previous????
        prev_x = x; prev_y = y;
        
    }



    for (let p = 1; p < num_points; p++) {
        // And compare with the previous....

        next_x = polygon[r++]; next_y = polygon[r++];

        dx = Math.abs(next_x - x);
        dy = Math.abs(next_y - y);
        sx = (x < next_x) ? 1 : -1;
        sy = (y < next_y) ? 1 : -1;
        err = dx - dy;

        while (true) {
            //this.set_pixel_1bipp([x, y], 1);
            set_pixel_on(x, y);

            if (x === next_x && y === next_y) {
                break;
            }

            e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x += sx;
            }

            if (e2 < dx) {
                err += dx;
                y += sy;
            }
        }
        // Draw the line between them....

        x = next_x; y = next_y;

    }

    next_x = polygon[0]; next_y = polygon[1];

    dx = Math.abs(next_x - x);
    dy = Math.abs(next_y - y);
    sx = (x < next_x) ? 1 : -1;
    sy = (y < next_y) ? 1 : -1;
    err = dx - dy;

    while (true) {
        //this.set_pixel_1bipp([x, y], 1);
        set_pixel_on(x, y);

        if (x === next_x && y === next_y) {
            break;
        }

        e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x += sx;
        }

        if (e2 < dx) {
            err += dx;
            y += sy;
        }
    }

    const res = remove_duplicates(quicksort_points(new Uint16Array(arr_stroke_points)));
    return res;


}


module.exports = {
    ensure_polygon_is_ta,
    draw_polygon_outline_to_ta_1bipp,
    calc_polygon_stroke_points_x_y
}