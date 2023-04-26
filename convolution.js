/*
    API and Roadmap

    .apply_to(pb)
    .apply_to_pb(pb)
    // 

    // Get new convolved pb from an existing pb.

    // Set it up so a pb is a convolved version of another pb.
    //  window_to


    // pb.get_convolved_window(_to_this)

    // pb.get_convolved

    // Likely to want to keep the original, but produce 1 or more convolved versions.


    pb.clone().convolve(conv)
    // may make sense. not sure if it's the most optimal.

    // system of generating multiple convolved results at once?

    // for the moment, best to convolve a while 8bipp vector....
    //  but handling out of bounds / crossovers...?
    //  better to convolve a confirmed localised 8bipp ta of the same length?

    // worth trying a few different means for this and benchmarking.
    //  also simple functions with simple API would be better ported to C++.

    // Full convolution would require moving the window.
    //  May as well start getting the convolution system working with / through the window_to system.
    //   Then see about getting the convolution API made more properly.

    // Convolution API could use a Pixel_Buffer window to do its job.
    //  or 3 or 4 of them?

    // Need to also work on / do 1 bipp convolutions / image processing.
    //  May be very useful for object detection.


*/



// Convolutions may require / benefit from better mapping / rereferencing between different coord spaces.






const lang = require('lang-mini');




const {
    each,
    fp,
    tof,
    get_a_sig,
    are_equal,
    tf
} = lang;

const oext = require('obext')();

const {ro, prop} = oext;


// Size is read only, set at the beginning.
class Convolution {
    constructor(spec) {
        const size = new Uint16Array(2);

        if (spec.size) {
            size[0] = spec.size[0];
            size[1] = spec.size[1];
        }

        // size property...

        ro(this, 'size', () => size);
        ro(this, 'num_px', () => size[0] * size[1]);

        const xy_center = new Int16Array(2);

        ro(this, 'xy_center', () => {
            xy_center[0] = Math.floor(size[0] / 2);
            xy_center[1] = Math.floor(size[1] / 2);
            return xy_center;
        })
    }
}


// May be worth using this ta in some lower level mathematical convolve operations...
//  Maybe avoid needing this pb moving pixel window too.

// Could see about speeding up the copying during the movement of the pb.


// pb.get_convoled / pb.new_convolved makes sense.
//  new_convolved is nice and clear that it creates a new pb as the result.







// BooleanArray type? Bool1Array? May be worth making this.

class Float32Convolution extends Convolution {
    constructor(spec) {
        super(spec);
        const ta = new Float32Array(this.num_px);
        if (spec.value) {
            const tv = tf(spec.value);
            //console.log('tv', tv);
            if (tv === 'a' || spec.value instanceof Float32Array) {
                if (spec.value.length === this.num_px) {
                    ta.set(spec.value);
                } else {
                    const msg = 'Unexpected value array length: ' + spec.value.length + ', expected this.num_px: ' + this.num_px;
                    throw msg;
                }
            }
            // if it's an array...
            //  check it matches the number of px.

            // tf treating typed array and array the same?
            //  ita being is_typed_array function?
            //   would make sense. tta or tfta? tatf? ttf? atf? dtf for detailed tf?
        }
        // set up the convolve values from the spec?
        //  

        /*

        0    -1   0
        -1   5    -1
        0    -1   0

        [0, -1, 0, -1, 5, -1, 0, -1, 0]

        // Could have a funtion to calculate the convolution.
        //  param being the 2d vector offset from the center.

        */

        // want to directly give the convolution in the spec.
        //  as .ta property? 

        // .conv or .convolution property? .c property shorthand? .value property because its general?
        //  .value makes a lot of sense.

        // ta_res



        ro(this, 'ta', () => ta);

        // Apply a convolution.

        //  Convolution result - could return its own typed array.
        //   Result for each pixel?
        //   Maybe best to build up the total in memory, divide by num_px;
        //    Use a normal JS number for it (for the moment).

        // Convolving space of 8 bit image seems easiest.
        //  Only will convolve a single channel.
        //  Separation of the channels may well work best.



        // convolve_8bipp
        //  separation of channels could take place elsewhere...

        // could do multi-channel-separate-convolve here too.

        // apply_to_8bipp_ta(ta, pos)
        //  returns a number, being the convolution result.
        
        // calc_from_8bipp_ta_pos(ta, pos)


        // will use convolution accumulator.

        //  later will look into not defining / using ANY new valiables when carrying out some functions, only using consts too.

        // .calc_from_8bipp_ta(ta, pos); ???

        // .calc_from_8bipp_matched_size_ta(ta)
        //  use when the relevant pixel numbers have been extracted from their original pb / ta (using a window?)
        //   it gets calculated from its own set of multipliers along with the pixel values.
        //   may work well for data localisation and simd.
        //    can look into optimizing some functions soon using C++ / Vulkan / WebGL / WASM.


        // calc_3channels_from_24bipp_ta(ta)
        //  doing 3 channels at once on the input buffer would allow for decent data localisation and algorithmic speed.

        //  but would need position mapping to do the calculation?
        //   


        //  convolution from a single channel really does make the most sense.
    }

    // 3 channel result would be useful enough.
    //  not so sure about returning a new typed array for the result though.



    // 3 channel and 4 channel convolution functions.
    //  will convolve the channels separately.


    // Setting a convolution by function... this will be cool :)
    //  a formula which is the vector distance from the center.


    // unsafe versions of functions too?
    //  or more versions with different bounds safety checking options.?

    // From 24 bipp - would provide 3 channels of results.

    //  Maybe a function for single channel conv, multi_bypp (3 or 4 presumably)

    // calc_single_channel_from_24bipp_ta(ta_24bipp, i_channel)
    //  a different loop.

    // a multi-channel conv would work faster though.
    //  gets the split channels faster???

    // Seems like some lower level functions for splitting channels etc, dealing with the ta maths, would be very useful.

    // direct convolution of 3 channels on the 3 channel array?
    //  lets get this done - but it makes it harder to write.


    calc_from_24bipp_ta(ta_24bipp, ta_res_color = new Uint8ClampedArray(3)) {
        // maybe 3 loops to do it separately makes the most sense logically.

        // in terms of locality and reading through it, sequential and syncronised is best.

        // so will have 3 accumulators.

        const ta = this.ta;

        //const accumulator = new Float32Array(3);

        let acc_r = 0, acc_g = 0, acc_b = 0;

        // Recycle an accumularoe?
        //  Reference outside variable?
        //   Wouldnt work multithreaded that way... that may be fine.



        // a float accumulator instead?
        //  more precise? better?

        if (ta_24bipp.length === ta.length * 3) {
            //let accumulator = 0;
            const l = ta.length;

            // use 3 accumulators...

            let byi_read = 0;
            //  Seems simple enough here :)
            for (let c = 0; c < l; c++) {
                //accumulator[0] += (ta[c] * ta_24bipp[byi_read++]);
                //accumulator[1] += (ta[c] * ta_24bipp[byi_read++]);
                //accumulator[2] += (ta[c] * ta_24bipp[byi_read++]);

                acc_r += (ta[c] * ta_24bipp[byi_read++]);
                acc_g += (ta[c] * ta_24bipp[byi_read++]);
                acc_b += (ta[c] * ta_24bipp[byi_read++]);
            }
            //console.log('accumulator', accumulator);

            ta_res_color[0] = acc_r;
            ta_res_color[1] = acc_g;
            ta_res_color[2] = acc_b;

            // And clamp the result to between 0 and 255?

            // Math.max(min, Math.min(max, val))

            // Maybe no divide by l?
            //let res = Math.max(0, Math.min(255, accumulator));
            //let res = Math.max(0, Math.min(255, Math.round(accumulator / l)));
            //console.log('res', res);
            //return res;
            //return Math.round(accumulator / l);
            return ta_res_color;
        } else {
            throw 'calc_from_24bipp_ta be the conv ta length * 3. [ta_24bipp.length, ta.length] ' + JSON.stringify([ta_24bipp.length, ta.length]);
        }
    }




    calc_from_8bipp_ta(ta_8bipp) {
        // 

        const ta = this.ta;
        if (ta_8bipp.length === ta.length) {
            let accumulator = 0;
            const l = ta.length;
            for (let c = 0; c < l; c++) {
                accumulator += (ta[c] * ta_8bipp[c]);
            }

            //console.log('accumulator', accumulator);

            // And clamp the result to between 0 and 255?

            // Math.max(min, Math.min(max, val))

            // Maybe no divide by l?
            let res = Math.max(0, Math.min(255, accumulator));
            //let res = Math.max(0, Math.min(255, Math.round(accumulator / l)));

            //console.log('res', res);

            return res;

            //return Math.round(accumulator / l);


        } else {
            throw 'calc_from_8bipp_ta must be given matching ta lengths. [ta_8bipp.length, ta.length] ' + JSON.stringify([ta_8bipp.length, ta.length]);
        }

    }

}

module.exports = Float32Convolution;