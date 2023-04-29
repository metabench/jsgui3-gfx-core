
const ta_math = require('./ta-math');


const {fill_solid_rect_by_bounds} = ta_math;


class Pixel_Buffer_Painter {
    constructor(spec) {
        const pb = this.pb = spec.pb || spec.pixel_buffer



        /*
        // Draw line
        // pos1, pos2, color

        // And weight???
        this.line = (pos1, pos2, color) => {

        }
        */

        this.rect = (pos, size, color) => {
            // call the lower level ta_math function.

            // bounds_from_pos_and_size?
            //  calc_bounds(pos, size);

            //console.log('paint rect [pos, size, color]', [pos, size, color]);
            

            const ta_bounds = new Int16Array(4);
            ta_bounds[0] = pos[0];
            ta_bounds[1] = pos[1];
            ta_bounds[2] = pos[0] + size[0];
            ta_bounds[3] = pos[1] + size[1];

            // const fill_solid_rect_by_bounds = (ta_dest, bypr_dest, ta_bounds, bipp, color)

            fill_solid_rect_by_bounds(pb.ta, pb.bypr, ta_bounds, pb.bipp, color);



            return this;  // return the painter.   paint.rect(...).rect(...) etc.



        }
    }
    //rect()
}


module.exports = Pixel_Buffer_Painter;