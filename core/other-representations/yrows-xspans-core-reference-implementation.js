
// Want to make more optimised implementation that's dynamic and uses typed arrays.
//  Maybe each y row will be a linked list or binary tree, or even b+ tree.
//   Binary tree would likely be easier.
//   The B+ tree would itself most likely use linked lists.



// Could make a lower level Pos_Array where positions can be pushed or referenced by index, same API as an array (using proxies)
// but has an underlying typed array implementation that is faster.


// Maybe using functions to handle it for the moment will be better???

// Could put in its own module for the moment....




const oext = require('obext');

const {ro} = oext;

const colors_are_equal = (left, right) => {
    if (left === right) return true;
    const left_is_array = Array.isArray(left) || ArrayBuffer.isView(left);
    const right_is_array = Array.isArray(right) || ArrayBuffer.isView(right);
    if (!left_is_array || !right_is_array || left.length !== right.length) return false;
    for (let index = 0; index < left.length; index++) {
        if (left[index] !== right[index]) return false;
    }
    return true;
};


// And each row has got various spans.

// Calculating the xpans data...
//   Representing shapes in the xpans format.
//   See about having a format, that is easy, where it is all within a typed array.
//     Basically have them as numbers representing on and off.
//       And wrapping into the next line.

// Technically only the width or the height would need to be stored, the other can be calculated.
//   Prob only need to store the width.

// May see about integrating x-spans (platform code for x-spans) into the drawing routines.

// Will be the x-spans bitmap or mask format.







class YRows_XSpans_Core_Reference_Implementation {
    constructor(spec = {}) {
        if (!spec || typeof spec !== 'object') {
            throw new TypeError('YRows_XSpans options must be an object');
        }
        if (!spec.size || !Number.isSafeInteger(spec.size[0]) ||
            !Number.isSafeInteger(spec.size[1]) || spec.size[0] < 0 || spec.size[1] < 0) {
            throw new RangeError('size must contain two non-negative safe integers');
        }

        const size = new Float64Array([spec.size[0], spec.size[1]]);

        // A default_color property?
        // background_color perhaps.
        //  default makes more logical / programming sense.

        const default_color = Object.prototype.hasOwnProperty.call(spec, 'default_color')
            ? spec.default_color
            : 0;

        ro(this, 'default_color', () => {
            return default_color;
        });

        ro(this, 'size', () => size.slice());

        const rows = Array.from({length: size[1]}, () => []);
        ro(this, 'rows', () => rows);



    }


    //  seems best for typed arrays.
    // const areEqual = (first, second) =>
    //  first.length === second.length && first.every((value, index) => value === second[index]);

    // Color can be different types of value.
    //  Could be represented in an array or a typed array.
    //  Need to work on representing colors using JS numbers / ints within JS.
    //   consider 24 bit colors using 32 bit numbers.


    get_pixel(pos) {
        const [x, y] = this._validate_pos(pos);
        const row = this.rows[y];
        for (const span of row) {
            if (x < span[0]) break;
            if (x <= span[1]) return span[2];
        }
        return this.default_color;
    }

    set_pixel(pos, color) {
        const [x, y] = this._validate_pos(pos);
        const row = this.rows[y];
        let containing_index = -1;

        for (let index = 0; index < row.length; index++) {
            const span = row[index];
            if (x < span[0]) break;
            if (x <= span[1]) {
                containing_index = index;
                break;
            }
        }

        const old_color = containing_index === -1
            ? this.default_color
            : row[containing_index][2];
        if (colors_are_equal(old_color, color)) return false;

        // Remove x from its current non-default span, splitting if needed.
        if (containing_index !== -1) {
            const span = row[containing_index];
            const [left, right, span_color] = span;
            if (left === right) {
                row.splice(containing_index, 1);
            } else if (x === left) {
                span[0]++;
            } else if (x === right) {
                span[1]--;
            } else {
                span[1] = x - 1;
                row.splice(containing_index + 1, 0, [x + 1, right, span_color]);
            }
        }

        // Default pixels are represented by gaps between spans.
        if (colors_are_equal(color, this.default_color)) return true;

        let insertion_index = 0;
        while (insertion_index < row.length && row[insertion_index][0] < x) {
            insertion_index++;
        }
        const left_span = insertion_index > 0 ? row[insertion_index - 1] : undefined;
        const right_span = row[insertion_index];
        const joins_left = left_span && left_span[1] + 1 === x &&
            colors_are_equal(left_span[2], color);
        const joins_right = right_span && right_span[0] - 1 === x &&
            colors_are_equal(right_span[2], color);

        if (joins_left && joins_right) {
            left_span[1] = right_span[1];
            row.splice(insertion_index, 1);
        } else if (joins_left) {
            left_span[1] = x;
        } else if (joins_right) {
            right_span[0] = x;
        } else {
            row.splice(insertion_index, 0, [x, x, color]);
        }

        return true;
    }

    each_xspan(y, callback) {
        if (!Number.isSafeInteger(y) || y < 0 || y >= this.size[1]) {
            throw new RangeError('Row is outside the representation');
        }
        if (typeof callback !== 'function') throw new TypeError('callback must be a function');
        for (const span of this.rows[y]) callback(span);
    }

    _validate_pos(pos) {
        if (!pos || !Number.isSafeInteger(pos[0]) || !Number.isSafeInteger(pos[1])) {
            throw new TypeError('Pixel position must contain two safe integers');
        }
        const x = pos[0], y = pos[1];
        if (x < 0 || y < 0 || x >= this.size[0] || y >= this.size[1]) {
            throw new RangeError('Pixel position is outside the representation');
        }
        return [x, y];
    }
}

module.exports = YRows_XSpans_Core_Reference_Implementation;
