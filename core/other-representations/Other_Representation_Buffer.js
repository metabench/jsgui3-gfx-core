


class Other_Representation_Buffer {
    constructor(spec = {}) {
        if (!spec || typeof spec !== 'object') {
            throw new TypeError('Other representation options must be an object');
        }
        if (spec.invariants !== undefined && !Array.isArray(spec.invariants)) {
            throw new TypeError('invariants must be an array');
        }

        // Own the list rather than retaining (and allowing subclasses to
        // mutate) a caller-owned array.
        this.invariants = Object.freeze([...(spec.invariants || [])]);

    }

    // test pb against invarients...

    pb_invariants_check(pb) {

        const {invariants} = this;
        let res = true;
        for (const inv of invariants) {
            const test = typeof inv === 'function' ? inv : inv && inv.test_pb;
            if (typeof test !== 'function') {
                throw new TypeError('Each invariant must be a function or expose test_pb(pb)');
            }
            if (test.call(inv, pb)) {

            } else {
                res = false;
                break;
            }
        }
        return res;

    }

}

module.exports = Other_Representation_Buffer;

// Other_2_Color_Representation_Buffer
//   and it could require the pixel buffer to be 1 bipp???
//     requirements for any pixel buffer it operates on would make sense.

// But also consider invariants for pixel buffers.
//   To help alignments etc.

// Other representations of 1 bipp

// Other_Representation_Of_1_Bit_Per_Pixel_Buffer






