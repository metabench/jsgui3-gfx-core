



const get_instance = () => {


    // Maybe keeping colorspace as a simple array would work best.
    //  Using consts to get the value from the colorspace... would that work well?
    // const [...] = _colorspace_fields

    const byi_from_cs_pos = (colorspace, pos) => {
        const [width, height, bypp, bypr, bipp, bipr] = colorspace;
        //console.log('bypp, bypr', [bypp, bypr]);

        //console.log('pos', pos)
        //console.trace();

        return pos[0] * bypp + pos[1] * bypr;

    }
    // pb.color_space


    // Could read it as a subarray.
    //  Could then be writable too.

    // Optionally set the res into an existing ta.
    //  Benchmarks...





    //  Could work out somewhat faster? Harder to program though???
    //   May be simpler for C++ and making and using wrappers.
    //   Could use consts to refer to positions in arrays?
    //    Would be worth doing speed comparisons.





    // (source, dest, ta_op_info)



    // Or maybe it's worth providing existing tas? Supporting that at least.
    //  The bounds etc are likely to be given as tas.



    // This is really about:  *** Syncronised iteration of an xy position bounds within 2 typed arrays that share the same bits_per_pixel ***



    // Wonder if the end jump value not in a ta slows it down? Compiler needs to guess / support multiple types.
    //  Maybe calling it with numeric types is good?

    // ta_op_further_info seems unnecessary...


    // Try a version with a callback?


    // Compacted param tas could be of use.

    // all in one ta:?
    //  xy, bounds, ta_byte_indexes, bytes_read_row_end_jump


    // Maybe this will be fastest?

    // Maybe make / make standard an Int32Array(16) or so
    //  Could contain other info...


    // Not using this kind of system for the moment. Going with variable names.
    //  Will help porting too.


    /*

    const idx_ta_vars = {
        0: ['xy', 0],
        1: ['xy', 1],
        2: ['bounds', 0],
        3: ['bounds', 1],
        4: ['bounds', 2],
        5: ['bounds', 3],
        6: 'byte_idx_read',
        7: 'byte_idx_write',
        8: 'bytes_read_row_end_jump'

        // Other...?
        / *
        9?  bytes_per_pixel
        10? bytes_per_read_row
        11? bytes_per_write_row

        * /


    }
    */



    // calculate intersecting bounds on 2 given bounds (given as tas)

    const overlapping_bounds = (bounds_1, bounds_2, res_bounds = new Int16Array(4)) => {
        // the area of intersection between both bounds.

        //console.log('overlapping_bounds', overlapping_bounds);
        //console.log('bounds_1', bounds_1);
        //console.log('bounds_2', bounds_2);

        //console.trace();


        // Ensure the result is within the bounds of another...
        //  Need to find the range at which they overlap, if any.

        // A bit more than just ajusting one so it fits within the other?
        //  Maybe not? Could be based on that. Then check that it's not negative?

        // If bounds 1 were to fit within bounds 2, what would those new bounds be?

        // the max value of the lower bounds (x and y)
        // the min value of the higher bounds (x and y)

        //  see if it's positive
        //   otherwise return undefined? false?
        //   false could work well.



        // math.max and min? which would be faster?

        res_bounds[0] = bounds_1[0] < bounds_2[0] ? bounds_2[0] : bounds_1[0];
        res_bounds[1] = bounds_1[1] < bounds_2[1] ? bounds_2[1] : bounds_1[1];
        res_bounds[2] = bounds_1[2] > bounds_2[2] ? bounds_2[2] : bounds_1[2];
        res_bounds[3] = bounds_1[3] > bounds_2[3] ? bounds_2[3] : bounds_1[3];

        //throw 'stop';




        return res_bounds;
    }

    return {
        overlapping_bounds: overlapping_bounds,
        byi_from_cs_pos: byi_from_cs_pos,
        get_instance: get_instance
    }



}

module.exports = get_instance();