const Other_Representation_Of_1_Bit_Per_Pixel_Buffer = require("../../Other_Representation_Of_1_Bit_Per_Pixel_Buffer");


class Wrapping_Scanlines_Toggle_Color_Span_Lengths extends Other_Representation_Of_1_Bit_Per_Pixel_Buffer {

    constructor(spec = {}) {

        const is_pixel_buffer = spec && typeof spec === 'object' &&
            Number.isInteger(spec.bits_per_pixel) && ArrayBuffer.isView(spec.ta);
        const options = is_pixel_buffer ? {source: spec} : spec;
        if (!options || typeof options !== 'object') {
            throw new TypeError('Wrapping scanline options must be an object');
        }

        super(options);

        const source = options.source || options.pb || options.pixel_buffer;
        if (source !== undefined && !this.pb_invariants_check(source)) {
            throw new TypeError('Wrapping scanlines require a 1bipp Pixel Buffer');
        }
        Object.defineProperty(this, 'source', {
            value: source,
            enumerable: true,
            writable: false,
            configurable: false
        });


        // So, be able to accept a Pixel_Buffer as the spec.




        // Give it the pixel buffer as the spec?
        //   Then it could create or be ready to create the alternative representation.

        //  

        // Should probably do / prepare to do calculations to do with how it will represent the data,
        //   and how the data will correspond to the pixel buffer representation of that data.


        // And will it represent the full pixel buffer, or part of it?
        //   A clipped part or an extended (rounded to 64 bits) part?



        // Want a simple API.
        //   Give it the pixel buffer
        //     (check it can generate the representation)
        //     (get some kind of params of the representation)
        //     (generate (and store) the representation)


        // Maybe do lazy calculation.

    }

}

module.exports = Wrapping_Scanlines_Toggle_Color_Span_Lengths;
