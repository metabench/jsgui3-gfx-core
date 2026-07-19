// Maybe some Image_Core class that has the size property.

//   Probably a dynamically allocated ta that will store various xspans.
//     Maybe 10 bytes to start, increase to 100, then 1000, then 4000, then multiples of 2.


// Maybe we do want a class that represents them....


class Dynamic_XSpans {
    constructor(spec = {}) {
        if (Number.isSafeInteger(spec)) spec = {capacity: spec};
        if (!spec || typeof spec !== 'object') {
            throw new TypeError('Dynamic_XSpans options must be an object');
        }

        const capacity = spec.capacity === undefined ? 16 : spec.capacity;
        if (!Number.isSafeInteger(capacity) || capacity < 0) {
            throw new RangeError('capacity must be a non-negative safe integer');
        }
        const ArrayType = spec.ArrayType || Int32Array;
        if (typeof ArrayType !== 'function' || !Number.isInteger(ArrayType.BYTES_PER_ELEMENT)) {
            throw new TypeError('ArrayType must be a typed-array constructor');
        }

        this._ArrayType = ArrayType;
        this._length = 0;
        this._ta = new ArrayType(capacity * 3);
    }

    get length() {
        return this._length;
    }

    get capacity() {
        return this._ta.length / 3;
    }

    get ta() {
        return this._ta.subarray(0, this._length * 3);
    }

    push(span_or_left, right, color) {
        let left = span_or_left;
        if (Array.isArray(span_or_left) || ArrayBuffer.isView(span_or_left)) {
            if (span_or_left.length !== 3) {
                throw new RangeError('An x-span must contain [left, right, color]');
            }
            [left, right, color] = span_or_left;
        }
        if (!Number.isSafeInteger(left) || !Number.isSafeInteger(right) || left > right ||
            !Number.isFinite(color)) {
            throw new TypeError('An x-span requires integer bounds and a numeric color');
        }

        this._ensure_capacity(this._length + 1);
        const offset = this._length * 3;
        this._ta[offset] = left;
        this._ta[offset + 1] = right;
        this._ta[offset + 2] = color;
        this._length++;
        return this._length;
    }

    at(index, target = new this._ArrayType(3)) {
        if (!Number.isSafeInteger(index) || index < 0 || index >= this._length) {
            return undefined;
        }
        if (!ArrayBuffer.isView(target) || target.length < 3) {
            throw new TypeError('target must be a typed array with at least three elements');
        }
        const offset = index * 3;
        target[0] = this._ta[offset];
        target[1] = this._ta[offset + 1];
        target[2] = this._ta[offset + 2];
        return target;
    }

    clear() {
        this._length = 0;
    }

    *_iterator() {
        const span = new this._ArrayType(3);
        for (let index = 0; index < this._length; index++) {
            yield this.at(index, span).slice();
        }
    }

    [Symbol.iterator]() {
        return this._iterator();
    }

    _ensure_capacity(required) {
        if (required <= this.capacity) return;
        const next_capacity = Math.max(required, this.capacity === 0 ? 4 : this.capacity * 2);
        const next = new this._ArrayType(next_capacity * 3);
        next.set(this._ta);
        this._ta = next;
    }

}

module.exports = Dynamic_XSpans;
