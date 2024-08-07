//const Pixel_Buffer_Core = require('./pixel-buffer-core');

const Pixel_Buffer_Advanced_TypedArray_Properties = require('./pixel-buffer-advanced-typedarray-properties');
const kernels = require('./convolution-kernels/kernels');

class Pixel_Buffer_Idiomatic_Enh extends Pixel_Buffer_Advanced_TypedArray_Properties {
    constructor(...a) {
        super(...a);
    }

    each_pixel_pos(callback) {
        const {ta_pos_scratch, size} = this;
        let ctu = true;
        const stop = () => {
            ctu = false;
        }

        for (ta_pos_scratch[1] = 0; ctu === true && ta_pos_scratch[1] < size[1]; ta_pos_scratch[1]++) {
            for (ta_pos_scratch[0] = 0; ctu === true && ta_pos_scratch[0] < size[0]; ta_pos_scratch[0]++) {
                callback(ta_pos_scratch, stop);
            }
        }


    }

    count_colors() {
        const map_colors = {};
        let res = 0;
        this.each_pixel_ta((pos, color) => {
            const colstr = color.toString();
            if (!map_colors[colstr]) {
                map_colors[colstr] = true;
                res++;
            }
        });
        return res;
    }

    // Some will need to be a bit more optimised for perf rather than readability. Do want clear code though.

    // Not quite sure why this is failing on 1 bipp right now....

    each_pixel(callback) {
        // Want optimised but still idiomatic
        const {ta_pos_scratch, bipp, bypp, size, ta} = this;

        // And a ta_color_scratch perhaps?
        //   ta_24bipp_color_scratch maybe...
        //   ta_rgb or ta_rgba?
        //    number of bits makes more sense. more flexible.

        // Could call each_pixel_pos, and increment a byte index.

        // read_bit_from_byte

        //const bfb = (byte, bit_index) => (byte >> bit_index) & 1;

        if (bipp === 1) {

            // Should not be too hard to implement....

            //let i_pixel = 0;
            // and the number of pixels....
            const [w, h] = size;

            let i_byte = 0, i_bit = 0;
            //let input_byte = ta[0];

            const ta_cb_pos = new Uint32Array(2);

            for (let y = 0; y < h; y++) {
                ta_cb_pos[1] = y;
                for (let x = 0; x < w; x++) {
                    ta_cb_pos[0] = x;
                    //const px_color = (input_byte >> i_bit) & 1;
                    // not sure why this is not working right.

                    const got_px_color = this.get_pixel_1bipp(ta_cb_pos);

                    
                    callback(ta_cb_pos, got_px_color);

                    //i_bit++;
                    if (i_bit === 8) {
                        //i_byte++;
                        //i_bit = 0;
                        //input_byte = ta[i_byte];
                    }
                    //i_pixel++;
                }

            }


            



            //console.trace();
            //throw 'NYI';
        } else if (bipp === 8) {
            // Function to iterate through positions could work.
            // Nested for loops seems a bit simpler...
            //ta_pos_scratch[0] = 0;
            //ta_pos_scratch[1] = 0;
            let pixel_idx = 0;
            this.each_pixel_pos((pos, stop) => {
                callback(pos, ta[pixel_idx++], stop);
            });
            //


        } else if (bipp === 24) {
            // Provide direct access with a subarray?
            //  Could be better for idiomatic writing.
            //  Though setting values would maybe / likely be quicker and mean less allocations.

            const {ta_24bit_color} = this;
            let byte_idx = 0;
            this.each_pixel_pos((pos, stop) => {
                ta_24bit_color[0] = ta[byte_idx++];
                ta_24bit_color[1] = ta[byte_idx++];
                ta_24bit_color[2] = ta[byte_idx++];
                callback(pos, ta_24bit_color, stop);
            });

        } else if (bipp === 32) {
            const {ta_32bit_color} = this;
            let byte_idx = 0;
            this.each_pixel_pos((pos, stop) => {
                ta_32bit_color[0] = ta[byte_idx++];
                ta_32bit_color[1] = ta[byte_idx++];
                ta_32bit_color[2] = ta[byte_idx++];
                ta_32bit_color[3] = ta[byte_idx++];
                callback(pos, ta_32bit_color, stop);
            });
        }

        // Could advance through the positions?
        // Advancing through bit indexes.

    }

    blur(size = 3, sigma = 2) {
        let kernel = kernels.get_gauss(size, sigma);
        return this.apply_square_convolution(kernel);
    }



    count_pixels_with_color(color) {
        let res = 0;
        // could find out here what format the color is...

        console.log('idiomatic count_pixels_with_color');

        const {bipp} = this;


        if (bipp <= 8) {
            this.each_pixel((pos, pixel_color) => {
                //console.log('pixel_color', pixel_color);
                //console.log('color', color);

                if (pixel_color === color) res++;
                //console.trace();
                //throw 'NYI';
            });
        } else if (bipp === 24) {
            this.each_pixel((pos, pixel_color) => {
                //console.log('pixel_color', pixel_color);
                //console.log('color', color);

                if (pixel_color[0] === color[0] && pixel_color[1] === color[1] && pixel_color[2] === color[2]) {
                    res++;
                }
    
    
    
                //console.trace();
                //throw 'NYI';
            });
        } else if (bipp === 32) {
            this.each_pixel((pos, pixel_color) => {
                //console.log('pixel_color', pixel_color);
                //console.log('color', color);

                if (pixel_color[0] === color[0] && pixel_color[1] === color[1] && pixel_color[2] === color[2] && pixel_color[3] === color[3]) {
                    res++;
                }
    
    
    
                //console.trace();
                //throw 'NYI';
            });
        } else {
            console.trace();
            throw 'NYI';
        }

        //console.log('res', res);

        return res;

        
    }
}

module.exports = Pixel_Buffer_Idiomatic_Enh;