//const Pixel_Buffer_Core = require('./pixel-buffer-core');

const Pixel_Buffer_Advanced_TypedArray_Properties = require('./pixel-buffer-4-advanced-typedarray-properties');
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