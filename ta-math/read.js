


const get_instance = () => {


        
    const read_px = (ta_source, ta_colorspace, ta_pos) => {

        // calculate byte index from pos and colorspace

        const bipp = ta_colorspace[4];

        //console.log('read_px bipp', bipp);

        if (bipp === 1) {
            // 1bipp
            console.trace();
            throw 'NYI';
        } else if (bipp === 8) {
            const byi = byi_from_cs_pos(ta_colorspace, ta_pos);
            return ta_source[byi];
        } else if (bipp === 24) {
            const byi = byi_from_cs_pos(ta_colorspace, ta_pos);

            //console.log('byi', byi);

            //console.log('ta_source.subarray(byi, byi + 3)', ta_source.subarray(byi, byi + 3));

            return ta_source.subarray(byi, byi + 3);
        } else if (bipp === 32) {
            const byi = byi_from_cs_pos(ta_colorspace, ta_pos);
            return ta_source.subarray(byi, byi + 4);
        }

        

    }

    //const read_4_px_rect = (ta_source, source_width, bytes_per_pixel, bytes_per_row, pos) => {


    const read_2x1_rect = (ta_source, ta_colorspace, ta_pos) => {
        // will just return the values of these 2 px in a single ta.


        const [x, y] = ta_pos;
        const [width, height, bypp, bypr, bipp, bipr] = ta_colorspace;

        if (x < 0) {
            throw 'x position must be between 0 and (width - 1)'
        }
        if (x > width - 1) {
            throw 'x position must be between 0 and (width - 1)'
        }
        if (y < 0) {
            throw 'y position must be between 0 and height'
        }
        if (y > height) {
            throw 'y position must be between 0 and height'
        }

        let byi_read = (x * bypp) + (y * bypr);

        if (bipp === 1) {
            console.trace();
            throw 'NYI';
        } else if (bipp === 8) {
            // different result sizes... maybe return a specific version of this.
            // unsafe_read_4px_rect(different params?)
            
            // lets do the work here... not so much to do.
            const res = new Uint8ClampedArray(2);
            res[0] = ta_source[byi_read];
            res[1] = ta_source[byi_read + 1];
            //res[2] = ta_source[byi_read + bypr];
            //res[3] = ta_source[byi_read + bypr + 1];

            //res[0] = 


            return res;

        } else if (bipp === 24) {
            const res = new Uint8ClampedArray(6);
            //res[0] = 

            // best to read 2 rows of pixels. 6 bytes per row of the copy space.
            res.set(ta_source.subarray(byi_read, byi_read + 6), 0);
            //byi_read += bypr;
            //res.set(ta_source.subarray(byi_read, byi_read + 6), 6);



            return res;
            
        } else if (bipp === 32) {
            //console.trace();
            //throw 'NYI';
            const res = new Uint8ClampedArray(8);
            //res[0] = 

            res.set(ta_source.subarray(byi_read, byi_read + 8), 0);
            //byi_read += bypr;
            //res.set(ta_source.subarray(byi_read, byi_read + 8), 8);


            return res;
        }

    }


    const read_1x2_rect = (ta_source, ta_colorspace, ta_pos) => {
        // will just return the values of these 2 px in a single ta.


        const [x, y] = ta_pos;
        const [width, height, bypp, bypr, bipp, bipr] = ta_colorspace;

        if (x < 0) {
            throw 'x position must be between 0 and (width - 1)'
        }
        if (x > width - 1) {
            throw 'x position must be between 0 and (width - 1)'
        }
        if (y < 0) {
            throw 'y position must be between 0 and height'
        }
        if (y > height) {
            throw 'y position must be between 0 and height'
        }

        let byi_read = (x * bypp) + (y * bypr);

        if (bipp === 1) {
            console.trace();
            throw 'NYI';
        } else if (bipp === 8) {
            // different result sizes... maybe return a specific version of this.
            // unsafe_read_4px_rect(different params?)
            
            // lets do the work here... not so much to do.
            const res = new Uint8ClampedArray(2);
            res[0] = ta_source[byi_read];
            res[1] = ta_source[byi_read + bypr];
            //res[2] = ta_source[byi_read + bypr];
            //res[3] = ta_source[byi_read + bypr + 1];

            //res[0] = 


            return res;

        } else if (bipp === 24) {
            const res = new Uint8ClampedArray(6);
            //res[0] = 

            // best to read 2 rows of pixels. 6 bytes per row of the copy space.
            res.set(ta_source.subarray(byi_read, byi_read + 3), 0);
            byi_read += bypr;

            res.set(ta_source.subarray(byi_read, byi_read + 3), 3);
            //byi_read += bypr;
            //res.set(ta_source.subarray(byi_read, byi_read + 6), 6);



            return res;
            
        } else if (bipp === 32) {
            //console.trace();
            //throw 'NYI';
            const res = new Uint8ClampedArray(8);
            //res[0] = 

            res.set(ta_source.subarray(byi_read, byi_read + 4), 0);
            byi_read += bypr;
            res.set(ta_source.subarray(byi_read, byi_read + 4), 4);
            //res.set(ta_source.subarray(byi_read, byi_read + 8), 8);


            return res;
        }

    }



    // Hopefully will be v fast!
    //  Consider C++ optimization too - but likely will be implemented and called in C++ because its very low level for some operations.
    const read_2x2_rect = (ta_source, ta_colorspace, ta_pos) => {

        const [x, y] = ta_pos;

        const [width, height, bypp, bypr, bipp, bipr] = ta_colorspace;

        //console.log('read_4_px_rect [width, height, bypp, bypr, bipp, bipr]', [width, height, bypp, bypr, bipp, bipr]);

        // Worth using pixel index / necessary to do so.
        //  Seems to come down to that at the lowest levels.





        // can not read an out of bounds 4px block
        //  should raise an error if it's attempted. it should not be attempted.

        // check it's within bounds...
        //  maybe better not to. see about speed increase when this is commented out.

        if (x < 0) {
            throw 'x position must be between 0 and (width - 1)'
        }
        if (x > width - 1) {
            throw 'x position must be between 0 and (width - 1)'
        }
        if (y < 0) {
            throw 'y position must be between 0 and (height - 1)'
        }
        if (y > height - 1) {
            throw 'y position must be between 0 and (height - 1)'
        }

        let byi_read = (x * bypp) + (y * bypr);

        if (bipp === 1) {
            console.trace();
            throw 'NYI';
        } else if (bipp === 8) {
            // different result sizes... maybe return a specific version of this.
            // unsafe_read_4px_rect(different params?)
            
            // lets do the work here... not so much to do.
            const res = new Uint8ClampedArray(4);
            res[0] = ta_source[byi_read];
            res[1] = ta_source[byi_read + 1];
            res[2] = ta_source[byi_read + bypr];
            res[3] = ta_source[byi_read + bypr + 1];

            //res[0] = 


            return res;

        } else if (bipp === 24) {
            const res = new Uint8ClampedArray(12);
            //res[0] = 

            // best to read 2 rows of pixels. 6 bytes per row of the copy space.
            res.set(ta_source.subarray(byi_read, byi_read + 6), 0);
            byi_read += bypr;
            res.set(ta_source.subarray(byi_read, byi_read + 6), 6);



            return res;
            
        } else if (bipp === 32) {
            //console.trace();
            //throw 'NYI';
            const res = new Uint8ClampedArray(16);
            //res[0] = 

            res.set(ta_source.subarray(byi_read, byi_read + 8), 0);
            byi_read += bypr;
            res.set(ta_source.subarray(byi_read, byi_read + 8), 8);


            return res;
        }






    }

    const read_merged_vfpx_24bipp = (ta_source, colorspace, vfpx) => {

        // Other version of algo that bypasses the vfpx?


        const [width, height, bypp, bypr, bipp, bipr] = colorspace;
        const {weights, i_any_coverage_bounds} = vfpx;
        // 
        const xy = new Int16Array(2);
        let byi_read = 3 * i_any_coverage_bounds[0] + bypr * i_any_coverage_bounds[1];
        let byi_weight = 0;
        // 

        const iw = i_any_coverage_bounds[2] - i_any_coverage_bounds[0];

        const bytes_read_row_end_jump = bypr - iw * 3;
        const acc_rgb = new Float32Array(3);
        // Probably a problem at this merging stage.

        //console.log('colorspace: [width, height, bypp, bypr, bipp, bipr]', [width, height, bypp, bypr, bipp, bipr]);
        //console.log('vfpx.i_size', vfpx.i_size);
        //console.log('vfpx.i_any_coverage_bounds', vfpx.i_any_coverage_bounds);

        //console.log('weights', weights);

        // Direct accumulation without createing any weights object...


        for (xy[1] = i_any_coverage_bounds[1]; xy[1] < i_any_coverage_bounds[3]; xy[1]++) {
            for (xy[0] = i_any_coverage_bounds[0]; xy[0] < i_any_coverage_bounds[2]; xy[0]++) {

                //const ui8_px_value = ta[byte_idx_pb_read];
                //ui8_px_value = ta[byte_idx_pb_read];

                //console.log('byte_idx_pb_read')

                acc_rgb[0] += ta_source[byi_read++] * weights[byi_weight];
                acc_rgb[1] += ta_source[byi_read++] * weights[byi_weight];
                acc_rgb[2] += ta_source[byi_read++] * weights[byi_weight++];
                //ta_res[ta_byte_indexes[1]++] = ta[byi_read[0]++];
                //ta_res[ta_byte_indexes[1]++] = ta[byi_read[0]++];

                // But don't need to copy the px value in many cases.

                //  Maybe have / use lower level fuctions for copying between different pbs / tas.
                //  Iterating spaces.
                //   Iterating spaces defined by a function / equation?
                //    Eg could functionally / mathematically define a circle and draw it.
                
                // got the xy iteration pos set correctly here :)

                // could copy px values?
                //  reading and using them directly may work best....

                //byte_idx_pb_read += bytes_per_pixel;

            }
            // then row jump increase.
            byi_read += bytes_read_row_end_jump;
        }
        // then copy the weighted values into the result...
        /*
        console.log('acc_rgb', acc_rgb);
        if (acc_rgb[0] === 0) {
            console.trace();
            throw 'stop';
        }
        */

        const res = new Uint8ClampedArray(acc_rgb);
        //console.log('read_merged_vfpx_24bipp res', res);
        return res;


    }


    const read_merged_vfpx = (ta_source, colorspace, vfpx) => {
        // get the weights for that vfpx ... very useful to have them!
        //  need to know the any coverage row width
        //console.log('colorspace', colorspace);
        //const [width, height, bypp, bypr, bipp, bipr] = colorspace;
        const bipp = colorspace[4];

        if (bipp === 1) {
            console.trace(); throw 'NYI';
        } else if (bipp === 8) {
            console.trace(); throw 'NYI';
        } else if (bipp === 24) {
            return read_merged_vfpx_24bipp(ta_source, colorspace, vfpx)
        } else if (bipp === 32) {
            console.trace(); throw 'NYI';
        }

        //const {weights, i_total_coverage_bounds} = vfpx;


        // Worth having separate methods... different sized accumulator for different bipp.

        // RGB accumulator...?

        // depending on the number of bipp in the colorspace too.

        



    }

    const each_pixel_in_colorspace = (colorspace, callback) => {
        const [width, height, bypp, bypr, bipp, bipr] = colorspace;
        let byi = 0;
        const xy = new Int16Array(2);
        for (xy[1] = 0; xy[1] < height; xy[1]++) {
            for (xy[0] = 0; xy[0] < width; xy[0]++) {
                callback(xy, byi);
                byi += bypp;
            }
        }
    }

    return {
        read_2x2_rect: read_2x2_rect,
        read_1x2_rect: read_1x2_rect,
        read_2x1_rect: read_2x1_rect,
        read_merged_vfpx_24bipp: read_merged_vfpx_24bipp,
        read_merged_vfpx: read_merged_vfpx,
        get_instance: get_instance,
        each_pixel_in_colorspace: each_pixel_in_colorspace
    }
    


}


module.exports = get_instance();