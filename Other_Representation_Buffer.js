


class Other_Representation_Buffer {
    constructor(spec = {
        
    }) {
        spec.invariants = spec.invariants || [];

        this.invariants = spec.invariants;

    }

    // test pb against invarients...

    pb_invariants_check(pb) {

        const {invariants} = this;
        let res = true;
        for (const inv of invariants) {
            if (inv.test_pb(pb)) {

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






