

// function to read the convolve window?
//  or in a read directory, a 'window'.

// Or calculate it into a parallel data structure?

// Parallel distributed kernels would be useful.


// Direct algorithms as ta math, and test them.


// Single channel convolve here.

// Operate single channel on a multi-channel ta?

// Therefore do multi-channel convolve...?

// A moving pixel window over the pixels...

// Possibly a loop to do that...

// each pixel, then each pixel in the window.
//  window could be best defined by 4 edge offsets.


// Again, will experiment with variety of functions and components of the functions.




/*

each px conv window xy
conv_window_xy
    simple function here that returns the coords of the conv window, that's it.
        coords can be out of bounds


*/

const conv_window_xyltrb = (source_width, source_height, source_bipp, conv_num_pixels_left_of_center, conv_num_pixels_above_center, conv_num_pixels_right_of_center, conv_num_pixels_below_center, callback) => {
    if (source_bipp === 1) {
        console.trace();
        throw 'NYI';
    } else {
        const source_bypp = source_bipp / 8;

        // Could better do the algebra to work out the range that the window moves in.

        // starting position, then moves by the width.

        let x = 0, y = 0, l = x - conv_num_pixels_left_of_center, t = y - conv_num_pixels_above_center, r = 1 + conv_num_pixels_right_of_center, b = 1 + conv_num_pixels_below_center;
        for (y = 0; y < source_height; y++) {
            for (x = 0; x < source_width; x++) {
                callback(x, y, l, t, r, b);
                l++;
                r++;
            }
            t++;
            b++;
        }
    }
}

// A version that also provides out-of-bounds info in the callback?
//  Some boolean and if it's out of bounds the parameters work differently.

// Whenever its below 0 or above the relevant dimension

// reflect_oob would be easy enough to implement.
//  however, would need to be careful about modifying which variables.



// Could have a version that returns the tl byte index.
//  Would set it at the beginning, and iterate it.

const conv_window_byi_tl = (source_width, source_height, source_bipp, conv_num_pixels_left_of_center, conv_num_pixels_above_center, conv_num_pixels_right_of_center, conv_num_pixels_below_center, callback) => {
    if (source_bipp === 1) {
        console.trace();
        throw 'NYI';
    } else {
        const source_bypp = source_bipp / 8;

        // reflected byte indexes would be useful too.
        //  May need a lookup function.





        // Could better do the algebra to work out the range that the window moves in.

        // starting position, then moves by the width.

        // This would need to deal with out-of-bounds questions too.

        let x = 0, y = 0, l = x - conv_num_pixels_left_of_center, t = y - conv_num_pixels_above_center, r = 1 + conv_num_pixels_right_of_center, b = 1 + conv_num_pixels_below_center;
        for (y = 0; y < source_height; y++) {
            for (x = 0; x < source_width; x++) {
                callback(x, y, l, t, r, b);
                l++;
                r++;
            }
            t++;
            b++;
        }
    }
}


const calc_all_conv_read_byis_reflect_oob = (source_width, source_height, source_bipp, conv_num_pixels_left_of_center, conv_num_pixels_above_center, conv_num_pixels_right_of_center, conv_num_pixels_below_center) => {

    if (source_bipp === 1) {
        console.trace();
        throw 'NYI';
    } else {
        const source_bypp = source_bipp / 8;



        // Actually ask it the number of channels?
        // And bits / bytes per channel would be useful too.




        let x = 0, y = 0, l = x - conv_num_pixels_left_of_center, t = y - conv_num_pixels_above_center, r = 1 + conv_num_pixels_right_of_center, b = 1 + conv_num_pixels_below_center;

        const conv_w = r - l, conv_h = b - t, conv_num_px = conv_w * conv_h;

        // convs are just single channel (right now).

        // Directly referencing the number of channels would definitely help...
        //  But we can use bypp when iterating pixels. Assuming always 1 byte per channel, but I could change that.




        const img_num_px = source_width * source_height;
        const img_bypr = source_width * source_bypp;


        // Large res ta, all the conv read byis.
        // Smaller px conv byte pos ta.

        const ta_px_conv_byis = new Uint32Array(conv_num_px);

        const last_v_y_full_read = source_height - conv_num_pixels_below_center;

        console.log('conv_h', conv_h);

        console.log('last_v_y_full_read', last_v_y_full_read);

        let ty, tx;


        // Could come up with all the x and y substitutions to begin with.
        //  Would make for simple(r) inner algorithm.


        // two arrays of x and y substitutions.
        //  Then do the lookup on them for every read (for the moment)
        //   Not sure about optimization, could wind up making it slower than some other ways?


        // Need to consider optimization for reflected byis?
        //  Probably calculate the byi from the calculated pixel.


        // ta math core would make sense.
        //  keep various useful things together.
        //   then there will be some more specialised functions in other files and folders.

        




        // Really, want 0 indexed arrays, that then correspond to the reflected y value (somehow)




        // and work out the x and y attempted reading ranges


        const x_min_attempted_read = -1 * conv_num_pixels_left_of_center;
        const x_max_attempted_read = source_width + conv_num_pixels_right_of_center;
        const y_min_attempted_read = -1 * conv_num_pixels_above_center;
        const y_max_attempted_read = source_height + conv_num_pixels_right_of_center;

        //const ta_corrected_reflected_ys = new 


        







        for (y = 0; y < source_height; y++) {

            // check for y being less than 0 or above source_height

            // Yes, treating the out of bounds differently in the loop makes sense for the moment.

            if (y < 0) {
                ty = y * -1;

                // 

            } else if (y > last_v_y_full_read) {
                ty = y - (y - last_v_y_full_read);

                console.log('post ty = y - (y - last_v_y_full_read) ty:', ty);

                //console.trace();
                //throw 'stop';

            } else {

            }


            for (x = 0; x < source_width; x++) {

                // Bounds checking...
                //  But precalcs may be better here anyway?




                //callback(x, y, l, t, r, b);
                l++;
                r++;

                // Moving along all byte index references...

            }
            t++;
            b++;



        }
    }

    
}



// conv_window_


// Iteration of convolution space(s)

const each_px_conv_colorspace_window = (colorspace_source, ta_conv_edge_dists, callback) => {
    const [e_l, e_t, e_r, e_b] = ta_conv_edge_dists;

    const [width, height, bypp, bypr, bipp, bipr] = colorspace_source;
    // Can use a convolution default value
    //  Or out of boundaries, meaning the callback contains fewer pixels.

    //  do this by returning the byte indexes.

    // default pixel value?

    // could have byte index of -1 when it's out of bounds?

    // Could just calculate the lookup offsets.

    //  That would require checking the bounds.

    //  Seems like we do need a way to deal with the borders / out of bounds positions.

    //  Could have a boolean / int value that says if it is in or out of bounds.



    //  May have some functions specifically for dealing with points and byte indexes.


    // better to have the loop system etc that can deal with out of boundaries successfully.


    //const oob_mode = 'extend';


    const oob_mode = 'reflect'; // ??? not needed here?

    // Could create the extended image?
    //  But that's more processing.

    // A function to get the value, but that also deals with out of bounds?
    //  Possibly byte iterators will still be best at the moment.

    // or could have the loops in different areas of the images, so it handles the out of bounds 

    // Maybe even need 9 different loop types?

    // would be easier to do this with a default oob color.

    // reflected borders would make sense.

    // do this loop with the x y position...?

    // conv window l, t, r, b
    //  (moving)



    // want to make use of incrementing all indexes efficiently.
    //  though a version with calculated x and y would be easier to implement and test against for comparison.

    // 

    const conv_num_px = (1 + e_l + e_r) * (1 + e_t + e_b);
    const window_byis = new Float32Array(conv_num_px);


    let w_l, w_t, w_r, w_b;

    w_l = e_l * -1;
    w_t = e_t * -1;
    w_r = e_r;
    w_b = e_b;

    let w_x, w_y;

    let c_x, c_y;
    for (c_y = 0; c_y < height; c_y++) {
        w_t = c_y + e_t * -1;
        w_b = c_y + e_b;
        for (c_x = 0; c_x < width; c_x++) {
            w_l = c_x + e_l * -1;
            w_r = c_x + e_r;


            for (w_y = w_t; w_y <= w_b; w_y++) {
                for (w_x = w_l; w_x <= w_r; w_x++) {
                    // could calculate the byi of the beginning of the convolution.


                }
            }

            // loop through the positions within the window



            // then iterate through the convolution space.
            //  could have special non-loop version for 3x3 and 5x5

            callback(c_x, c_y, window_byis);

            // then interate through the conv window space?
            //  could build up the typed array of byte indexes.

        }
    }

}






module.exports = {
    each_px_conv_colorspace_window: each_px_conv_colorspace_window
}