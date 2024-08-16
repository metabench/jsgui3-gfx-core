const Other_Representation_Buffer = require("../../Other_Representation_Buffer");


// An invariant that says that:
//   in pb representation it must be 1 bit per pixel
//   it has exactly 2 colors (capability - image could be 1 color only) (possibly with palette, not necessarily 1 and 0 but have to support them at least)


// And then can make the wrapping_scanlines_toggle_color_span_lengths representation.

// Should be a decent way to represent these images.
//   This code here will speed things up in other parts, by being able to use specific representations accordingly, and algorithms available for them.


// Also want classes to do / handle some more specific algorithms.






class Other_Representation_Of_1_Bit_Per_Pixel_Buffer extends Other_Representation_Buffer {
    constructor(spec = {}) {

        // spec.invariants = ...

        spec.invariants = spec.invariants || [];
        spec.invariants.push({
            test_pb(pb) {
                return pb.bits_per_pixel === 1;
            }
        })

        super(spec);
    }

}

module.exports = Other_Representation_Of_1_Bit_Per_Pixel_Buffer;