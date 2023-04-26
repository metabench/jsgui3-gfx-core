



const {
    prom_or_cb
} = require('fnl');

// could stream it.
const fnlfs = require('fnlfs');
const {
    file_type
} = fnlfs;

const {
    extname
} = require('path');

const { PerformanceObserver, performance } = require('perf_hooks');

// If there is not already a performance observer?
//  It measures it twice / writes console output twice.


// options
// max size
// reorient

const formats = require('jsgui3-gfx-formats');
const {
    jpeg
} = formats;

console.log('pre load gfx_server');
const gfx_server = require('jsgui3-gfx-server');
console.log('post load gfx_server');

// Copy the data over to and from a standard pixel buffer (non-server version)?

const gfx = require('../../gfx-core');

const {Pixel_Buffer} = gfx;

const Server_Pixel_Buffer = gfx_server.Pixel_Buffer;

const Convolution = require('../../convolution');
const create = require('../create_eg_pbs');



const ta_math = require('../../ta-math');

//ta_math.copy_rect_8bipp()



// Using generated images rather than samples such as Erte Ale.

// seems to be working / fixed now :)
const copy_from_server_pb = (server_pb) => {
    const res_pb = new Pixel_Buffer({
        size: server_pb.size,
        bits_per_pixel: server_pb.bits_per_pixel
    });
    //res_pb.buffer = res_pb.ta = server_pb.ta;
    res_pb.ta.set(server_pb.ta);
    return res_pb;
}

const copy_to_server_pb = (standard_pb) => {
    const res_pb = new Server_Pixel_Buffer({
        size: standard_pb.size,
        bits_per_pixel: standard_pb.bits_per_pixel
    });
    // Setting the buffer... does not work...?
    res_pb.ta.set(standard_pb.ta);
    //res_pb.buffer = res_pb.ta = standard_pb.ta;
    return res_pb;
}

// Worth having different sub-examples.
//  Would be nice to have the example runs each create their own directory with separate output files.
//   Different options on how many runs get saves / samples. Maybe store diffs or logs that the output is the same.

// Example => Test framework would be very useful in terms of TDD and EDD.

// Clarifying the examples with a bit of a framework would help a lot.
//  Automatic output according to naming convention.


// Examples that generate pixel buffers in particular.
//  May be better to save as png because its lossless.











const eg_byte_iteration_info = async() => {
    const pb_24bipp_color_square = create.generate_color_square();
    const pb_8bipp_patch = (() => {
        const res = create.patch_1();
        res.bipp = 8;
        return res;
    })();
    console.log('pb_8bipp_patch.bipp', pb_8bipp_patch.bipp);

    const pb_24bipp_patch = create.patch_1();

    const ta_pos = new Int16Array(2);
    const ta_px_value = new Uint8ClampedArray(3);


    // make general int info array support +-? Better able to hold (memory) offsets that way.
    const ta_info = new Uint32Array(4);

    // And that should be enough to do a fast iteration over the whole image in terms of data allocation.
    //  Could do multiple iterations without needing to reallocate, by reusing these structures.

    // Let's see about using this to get really high perf in both JavaScript and C++.


    // Well this works quickly too :).
    //  Lets see about convolutions....


    // Iterate Window
    //  iterating_window


    // Maybe attempt faster convolve with faster iteration?
    //  Maybe use faster copy on a lower level for the Pixel_Buffer window.


    // To begin with, functions to iterate within a defined range of a single image.
    //  May well be the case that we can image ranges with matching sizes and bpps for copies.


    // Know which parts of an operation are constant, which are not.
    //  Different to which parts use constant variables, as they may all use constant typed arrays.




    // And will also iterate the 24bipp pb.





    // Try this for different bounds sizes too.
    //  Maybe test / example this with some pixel-by-pixel copying / copying and modifying to a new ta.


    // Work on any needed functions / internal implementations on ta of byte_iterate_8bipp_patch



    // Faster copying could be incorporated into other parts now...

    // Could also do / try byte-by-byte row copying.
    //  See if its faster than ta.set(subset).



    // More use of byte iterate iteration...
    //  Within copy_from_source?

    // A module of ta_operations would make sense.
    //  The Pixel_Buffer class will call those functions.
    //   Make the code more modular and portable this way.
    //   Will be able to be ported and implmented in C++ / other languages more easily.

    // Kernels - get applied at each position.










    // byte iterate 24 bipp patch.
    //  will copy a region to a res pb.

    // Yes, quite fast too.
    //  Worth seeing about making C++ versions soon?
    //   Including more mathematical functions?

    // Worth making some ta math functions too.
    //  

    // ta-math.js file







    const byte_iterate_24bipp_patch = () => {
        console.log('byte_iterate_24bipp_patch');
        const bytes_per_pixel = 3;

        const ta_iteration_bounds = new Int16Array([100, 100, 200, 200]);
        const ta_iteration_xy = new Int16Array([ta_iteration_bounds[0], ta_iteration_bounds[1]]);
        const pb_bytes_per_row = pb_24bipp_patch.bypr;
        const iteration_width = ta_iteration_bounds[2] - ta_iteration_bounds[0];
        const iteration_size = new Int16Array([ta_iteration_bounds[2] - ta_iteration_bounds[0], ta_iteration_bounds[3] - ta_iteration_bounds[1]]);
        const iteration_bytes_per_row = iteration_width * bytes_per_pixel;
        const bytes_read_row_end_jump = pb_bytes_per_row - iteration_bytes_per_row;


        const byte_idx_pb_first = (ta_iteration_xy[0] * bytes_per_pixel) + (ta_iteration_xy[1] * pb_bytes_per_row);
        // byte_idx_pb_read
        //  will be incremented after each x by bytes_per_pixel
        //   after each y by the bytes_read_row_end_jump

        // Hopefully this works out to be a much faster system of doing these loops / iterations.
        //  Would port well / better to C++ as well.

        let byte_idx_pb_read = byte_idx_pb_first;


        console.log('ta_iteration_bounds', ta_iteration_bounds);
        console.log('ta_iteration_xy', ta_iteration_xy);
        console.log('pb_bytes_per_row', pb_bytes_per_row);
        console.log('iteration_bytes_per_row', iteration_bytes_per_row);
        console.log('iteration_width', iteration_width);
        console.log('bytes_read_row_end_jump', bytes_read_row_end_jump);
        console.log('byte_idx_pb_first', byte_idx_pb_first);

        const xy = ta_iteration_xy;
        const ta = pb_24bipp_patch.ta;

        // Calculating the average pixel value / color?

        // Seems like a good iteration, without unnecessary calculations of byte positions from x, y

        //let ui8_px_value;


        // Run a convolution on each point?

        // Let's try with smaller bounds, and saving the extracted image.


        // not working????

        const pb_copy_res = new pb_24bipp_patch.constructor({
            bits_per_pixel: 24,
            size: iteration_size
        })

        const ta_res = pb_copy_res.ta;
        let byte_idx_write_res = 0;

        const ta_byte_indexes = new Uint32Array([byte_idx_pb_read, byte_idx_write_res]);


        // ta further info may be better to avoid here (for perf reasons too).
        //  further investigate various overheads
        const ta_op_further_info = new Int32Array([bytes_read_row_end_jump]);



        performance.mark('C');

        //copy_individual_bytes();

        // specifically for 24bipp


        /*

        for (xy[1] = ta_iteration_bounds[1]; xy[1] < ta_iteration_bounds[3]; xy[1]++) {
            for (xy[0] = ta_iteration_bounds[0]; xy[0] < ta_iteration_bounds[2]; xy[0]++) {

                //const ui8_px_value = ta[byte_idx_pb_read];
                //ui8_px_value = ta[byte_idx_pb_read];

                //console.log('byte_idx_pb_read')
                ta_res[byte_idx_write_res++] = ta[byte_idx_pb_read++];
                ta_res[byte_idx_write_res++] = ta[byte_idx_pb_read++];
                ta_res[byte_idx_write_res++] = ta[byte_idx_pb_read++];
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
            byte_idx_pb_read += bytes_read_row_end_jump;
        }

        */

        // So its slower to call this external fn than to call it inline.
        //  Possibly setup then use of the iteration info is significantly faster when inline?
        //  Worth considering.

        


        ta_math.copy_rect_24bipp(xy, ta_iteration_bounds, ta, ta_res, ta_byte_indexes, bytes_read_row_end_jump);


        

        performance.mark('D');
        //console.log('avg', avg);
        //console.log('px_count', px_count);
        performance.measure('C to D', 'C', 'D');



        

        (async() => {
            console.log('saving extracted part of 24bipp patch, using fast byte iteration loop (custom code here)');
            // Soon worth doing some experiments with C++.
            //  Probably worth getting optimized convolutions working in JS first though
            await fnlfs.ensure_directory_exists('./output/byte_iteration_info/');

            await gfx.save_pixel_buffer('./output/byte_iteration_info/extracted_part-24bipp_patch.png', pb_copy_res, {
                format: 'png'
            });

        })();




    }





    const byte_iterate_8bipp_patch = () => {
        console.log('byte_iterate_8bipp_patch');


        // Get / calculate the iteration info.

        //  Let's make it based on an iteration bounds...

        // Could set the iteration_bounds property
        //  Or use a ta for it, provide the ta?
        //   Want to reuse tas where possible.



        // Set or create iteration bounds.

        // Could use a subsection iteration bounds....



        const bytes_per_pixel = 1;



        //const ta_iteration_bounds = new Int16Array([0, 0, pb_8bipp_patch.size[0], pb_8bipp_patch.size[1]]);
        const ta_iteration_bounds = new Int16Array([100, 100, 200, 200]);

        // these wont change.
        const ta_iteration_xy = new Int16Array([ta_iteration_bounds[0], ta_iteration_bounds[1]]);

        const pb_bytes_per_row = pb_8bipp_patch.bypr;
        const iteration_width = ta_iteration_bounds[2] - ta_iteration_bounds[0];

        const iteration_size = new Int16Array([ta_iteration_bounds[2] - ta_iteration_bounds[0], ta_iteration_bounds[3] - ta_iteration_bounds[1]]);


        const iteration_bytes_per_row = iteration_width * bytes_per_pixel;

        const bytes_read_row_end_jump = pb_bytes_per_row - iteration_bytes_per_row;


        // iteration_pixels_per_row?
        //  iteration_width




        // source_bytes_per_row?
        // pb_bytes_per_row, that makes sense.




        // self bytes per row
        // iteration (space) bytes per row




        // Comparison between the ta_iteration_bounds and this.size_bounds
        //  for dealing with its normal coord space.

        // A coord space abstraction could be very useful, also for high quality resizing.
        // Lets get iteration improved and into the 0.0.23 release.
        //  Maybe work on 1bipp coord spaces too, using bute_subindex_bit or similar? ui8_idx_bit_in_byte?
        //   Would (maybe)? make sense as a uint8 value.

        // Yes, would be good to try an iteration bounds ? shape bounds size that differs from own size_bounds.
        //  byte index first read
        //  byte length of row in the iteration / read / shape / rect / rect region bounds
        //   that is bytes_per_row of the ta_iteration_bounds





        //  EITHER:
        //   bytes per row of this (for row copy)
        //  OR
        //   end of row byte jump distance (self bytes per row - iteration (space) bytes per row)





        // maybe just call it xy. will make xyz more explicit.

        // it_xy?
        // it for iteration? Makes sense.


        // end of row jump
        //  for dealing with the (possible) difference between the iteration bounds coordinate space and the (normal? self? size?) coordinate space/
        //   size_bounds for the moment.


        // byte_idx_first_read
        const byte_idx_pb_first = (ta_iteration_xy[0] * bytes_per_pixel) + (ta_iteration_xy[1] * pb_bytes_per_row);
        // byte_idx_pb_read
        //  will be incremented after each x by bytes_per_pixel
        //   after each y by the bytes_read_row_end_jump

        // Hopefully this works out to be a much faster system of doing these loops / iterations.
        //  Would port well / better to C++ as well.

        let byte_idx_pb_read = byte_idx_pb_first;


        console.log('ta_iteration_bounds', ta_iteration_bounds);
        console.log('ta_iteration_xy', ta_iteration_xy);
        console.log('pb_bytes_per_row', pb_bytes_per_row);
        console.log('iteration_bytes_per_row', iteration_bytes_per_row);
        console.log('iteration_width', iteration_width);
        console.log('bytes_read_row_end_jump', bytes_read_row_end_jump);
        console.log('byte_idx_pb_first', byte_idx_pb_first);


        // byte position within row?
        //  maybe x position counter and check is simple enough?

        // and y position value

        // we have ta_iteration_xy
        //  lets keep it updated / use it for the iteration.

        // does make sense for iterating individual pixels rather than doing row copy.

        const xy = ta_iteration_xy;
        const ta = pb_8bipp_patch.ta;

        // Calculating the average pixel value / color?

        // Seems like a good iteration, without unnecessary calculations of byte positions from x, y

        //let ui8_px_value;


        // Run a convolution on each point?

        // Let's try with smaller bounds, and saving the extracted image.


        // not working????

        const pb_copy_res = new pb_8bipp_patch.constructor({
            bits_per_pixel: 8,
            size: iteration_size
        })

        const ta_res = pb_copy_res.ta;

        let byte_idx_write_res = 0;


        

        // Fairly fast iteration....



        // Yes, this is nicely fast at 11ms.
        //  Likely the lower level copy function supporting convolutions can be sped up nicely with
        //  direct pixel copy (rather than rows), test different methods.

        

        // Nice... this is going quick!
        //  and it's working.

        // See about using technique / loops more widely?
        //  Better than the system with the callback?



        // prepare_bounds_iteration_info

        // could provide some constants / other values.
        //  likely will be integrated into pb at some point.
        //   maybe used by?

        // Want to continue easier-to-port code that's outside of pb.
        

        // And separate out the inner function, and better see what variables it uses.


        // Maybe using a position cursor makes sense?
        //  Cursor always applies to a position within this.
        //  A cursor definitely makes sense for drawing and has similarities with other established systems.

        // Carry on working on 0.0.23 until ready to start / do cursors.


        // 0.0.24 - Cursors?
        //  And then a cursor would have a corresponding space within the source image / the parent image.
        //  Put into roadmap. It's an important and useful concept.
        //  Maybe a Cursor class?
        //   Can calculate corresponding points and byte indexes.
        //  Would provide utility outside of the Pixel_Buffer itself.
        //   Would help the pb code to be clearer - so long as it was not deoptimized too much.
        //    Calling more functions generally slows things down. Want less abstraction in some places so the code runs fastest.










        // xy, ta_iteration_bounds, ta_res, ta (ta_read), byte_idx_write_res, byte_idx_pb_read


        // Consider drawing with super-resolution / virtual-super-resolution (clever maths)
        //  Coordinate_Space class?
        //  Coordinate_2D_Space ???


        // Individual byte copy.
        //  May be the fastest way because .set(subset would have overhead of its own.)


        // Faster when there is no function....
        //  Maybe more calls of it would get it to optimize more?
        //   Maybe its worth having the function elsewhere for reference usage as well.


        // copy_individual_bytes(xy, iteration_bounds, ta_res, ta, ta_rw_byte_indexes)


        // Reusage of boilerplate may turn out to be faster than calling functions.
        //  Not sure though.
        //  May have function compilation on first call / it only gets optimized later?



        // Or use an outside function
        //  copy_8bipp_rect_between_tas



        // Worth making it into a function that runs externally.


        // Individual bytes method.
        //  However, could be improved by ysing byte ranges (only?)

        // So we may want to have a variety of different function methodologies there next to each other and available.

        // copy bytes
        // copy pixels
        // copy rows

        // may need custom ones for 1bipp images too.

        //  would be nice to use these within a specific math file.


        //  All of the args would be typed arrays!
        //  Makes sense to separate out some maths code, but code locality is one factor in speed.
        //   May be best keeping copies / versions of it within some specific JS functions. C++ would compile better re code locality.



        // copy_rect_8bipp = (xy, bounds, ta, ta_res, ta_byte_indexes)




        //const copy_rect_ta_to_ta_


        const _slower_to_use_a_fn_here_copy_individual_bytes = () => {


            for (xy[1] = ta_iteration_bounds[1]; xy[1] < ta_iteration_bounds[3]; xy[1]++) {
                for (xy[0] = ta_iteration_bounds[0]; xy[0] < ta_iteration_bounds[2]; xy[0]++) {
    
                    //const ui8_px_value = ta[byte_idx_pb_read];
                    //ui8_px_value = ta[byte_idx_pb_read];
    
                    //console.log('byte_idx_pb_read')
    
                    ta_res[byte_idx_write_res++] = ta[byte_idx_pb_read++];
    
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
                byte_idx_pb_read += bytes_read_row_end_jump;
            }
        }

        const ta_byte_indexes = new Uint32Array([byte_idx_pb_read, byte_idx_write_res]);
        // ta further info may be better to avoid here (for perf reasons too).
        //  further investigate various overheads
        const ta_op_further_info = new Int32Array([bytes_read_row_end_jump]);
        performance.mark('A');

        //copy_individual_bytes();

        // Inline copy works really quickly in comparison to an external function call.
        //  External functions calls could be very useful for prototyping, and will get optimized by V8 / engine improvements.

        


        /*

        for (xy[1] = ta_iteration_bounds[1]; xy[1] < ta_iteration_bounds[3]; xy[1]++) {
            for (xy[0] = ta_iteration_bounds[0]; xy[0] < ta_iteration_bounds[2]; xy[0]++) {

                //const ui8_px_value = ta[byte_idx_pb_read];
                //ui8_px_value = ta[byte_idx_pb_read];

                //console.log('byte_idx_pb_read')
                ta_res[byte_idx_write_res++] = ta[byte_idx_pb_read++];
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
            byte_idx_pb_read += bytes_read_row_end_jump;
        }

        */

        
        // Doing the external function call is indeed a bit slower.
        //  Worth considering overall picture, as well as then finding ways to optimize some function / procedures as much as possible.

        // // bytes_read_row_end_jump : ta_op_further_info[0]

        // seems to slow down the function call more...
        //  possibly only call it with 3 tas?


        // See if it gets faster if / when it's used more.
        //  Stay aware of de-optimization with more function calls.
        //   Consider more inlining on critical functions.
        //    Consider making 'deeply inlined' versions and / or a system to compile them.



        ta_math.copy_rect_8bipp(xy, ta_iteration_bounds, ta, ta_res, ta_byte_indexes, bytes_read_row_end_jump);
        performance.mark('B');
        //console.log('avg', avg);
        //console.log('px_count', px_count);
        performance.measure('A to B', 'A', 'B');
        //console.log('pb_copy_res', pb_copy_res);
        //console.log('pb_copy_res.size', pb_copy_res.size);

        // Saving of data would be better done between different example calls.

        (async() => {
            console.log('saving extracted part of 8bipp patch, using fast byte iteration loop (custom code here)');
            // Soon worth doing some experiments with C++.
            //  Probably worth getting optimized convolutions working in JS first though
            await fnlfs.ensure_directory_exists('./output/byte_iteration_info/');

            await gfx.save_pixel_buffer('./output/byte_iteration_info/extracted_part-8bipp_patch.png', pb_copy_res, {
                format: 'png'
            });

        })();





        





        

        // byte_idx_source_pb_last_px
        //  seems like it would make sense!
        //   especially for overflow protection.






        // Then should be able to do different possible iterations based on the 


        // Could also calculate the last read position?
        //  Maybe it won't need that, would just use the y value.
        //   But maybe it would be more efficient than y counting?
        //    And we'd likely need pixel counting too?
        //     Or comparison of the byte position with a known and precalculated and stored end of row position.
        //      as a more temporary value / variable because it's only valid until the end of the row.





        





        // For copying / reading pixel by pixel
        // For copying / reading row by row
        //  Does not need the row_end_byte_jump





        // Pure functions (apart from known writes), outside of the Pixel_Buffer class.
        //  Used by Pixel_Buffer class.
        // Will be more oriented / completely oriented on numbers and maths.
        //  Maybe will allocate 0 variables at all...
        // All iterators (iteration values) calculated / provided. 

        // Benchmarks to see which techniques actually work.
        //  Possibly, creation and use of arguments will work OK.
        //   Can run tests for this.

        // Tests for speed of different programming tecquniques...
        //  Could have a function in the codebase selected from an array of functions with different techniques.
        //  Could have system to choose the technique based on known perf criteria. Use in benchmarks too, for comparison.








        








        







    }



    
    byte_iterate_8bipp_patch();
    byte_iterate_24bipp_patch();


    // Maybe make 'etdd' module.
    //  Would dogfood itself.

    // Give etdd the example functions, it handles running them, saving output, performing regression analysis on previous example runs.







    // Could do with some other functions.
    //  Beginning of a convolution function?

    // Seems like implementing convolutions into the structure and fabric of Pixel_Buffer makes sense.
    
    // A Convolution object?
    //  F32Convolution? F16Convolution? UI8Convolution? I8Convolution? I32Convolution?

    // Quite a variety of possible convolution types available for different maths.
    //  Could make the convolution data structure flexible / given as a parameter.

    // Float16Convolution makes a lot of sense to start with.
    //  Each pixel in the convolution is a Float16 number.
    // Float32 may be just as optimal / more???
    // Float16 would SIMD better. Float16 should be fine.

    // f16_conv.apply(pb);
    //  should be simple enough grammar / syntax to apply a conv.
    // f16_conv(pb)
    //  making the convolutions themselves functions (that modify the PB) would be cool.

    // Also be able to keep the original pb, have the conv applied to another pb.
    //  window_to could again help here.


    // pb.processes.push(f16_conv);
    //  should be easy enough for this to enable automatic (convolution) processing from the source data in the window.

    // want it so that we can get an original pb
    //  then make window pbs to it that have got convolutions applied.
    //  do this with nice syntax, in a functional way. probably will be fast!
    //   then can speed test and get into C++ optimization.
    //    simpler re-writing / inlining
    //    more complex? simpler? branching of code for specific cases with specific optimizations.
    //     (with choices based on speed testing)


    // Want to use the generated patch1.
    //  Try convolution kernels on it.
    //   Consider convolution data structure.
    //    Split the channels first?

    // May be best to try / do convolutions on greyscale images first.
    //  Using a pb as a convolution view window may be just the right tool for the job.

    // May also be worth making a greyscale window.
    //  Possibly channel splitting window / windows.
    //   Linked Pixel_Buffers?

    // Want to do the convolution view soon.
    //  Have the moving view sorted out well.

    // Want to be able to apply 'processes' to a Pixel_Buffer.
    //  only one that is acting as a window for the moment?


    // 

    // Make a Float16Convolution function (system).
    //  or an object that provides the function that applies on a pb.
    //  would do the convolution after the copy.
    //   meaning we would need to allocate the ta scratch to do it.


    // can convolve functions outside of pb class that apply to the tas in the right format.
    //  pb etc provides a structure / framework for it, but there is also the raw algorithmic match which applies to Typed Arrays.

    //   ----------------------------------------------------------------------------------------------------------------------------
    //   !!!!!SEPARATE TYPED ARRAY PROCESSING CODE FROM NODE / JS / API SPECIFIC CODE TO ENABLE EASIER AND BETTER PORTING TO C++!!!!!
    //   ----------------------------------------------------------------------------------------------------------------------------
    // Design with API in mind too, but use lower level functions to do the heavy lifting.




    // pb.convolve_ta(ta_convolution_data)

    // simplest convolution would apply to the pb itself.
    //  would modify itself.
    //  would use temporary data in the mean time.

    // not so sure of the need for Convolution object... but could prove useful.

    // conv-buffer?
    // Convolution class or function would make sense.

    //  maybe using a pb window to read does make a lot of sense for internal implementation of the conv.
    //   it does some / much of the work already. could make / test other implementations too in near future.



    // Processes (functions) that get apply, some will be convolutions that get defined.
    //  Convolutions get defined as single channel.

    // Float16Convolution.
    //  Would def make sense.

    // Maybe integer / ui8 convolutions too. Maybe for sharpening? Depending on kernel. Could be decent optimization.


    // A data structure specifically for convolutions makes sense.
    //  They will need to be dealt with as a grid.

    // Functional definitions of their values too?
    //  Very appropriate in many cases.

    // Could try applying a Float16 Convolution.


    // Splitting channels, and convolving separately seems like an easier way to get convolutions up and running.

    // Also want to properly convert images to greyscale.

    // pb.bypp = 8;
    //  should be enough??? for the moment, yes.























    //  
    // wpb = pb.new_window({processes: [conv1]});
    //  then it's a window to the full pb view.
    ///  
















    //  Save some results of it.





























    
    // should probably have each_px_8bipp for example.
    //  would make sense to do that to work most efficiently.

    // Could do some things that will rely on each px.
    //  Beginning of code that goes into core, enh, or some kind og plugin / mixin / addon system.

    // Worth looking into node worker threads too.
    //  Relatively simple algorithm / kernel / function processing.



    // will call specific function depending on the bipp.

    // A function that involves updates would be nice as well.
    //  Not so sure about direct access to the pixel...?
    //   An update function could be OK.
    //    Maybe not the best style but it's logical when necessary.
    //     Could compare with direct access. Or even delay the update???






    const calc_avg = () => {
        let px_count = 0;
        const avg = new Float64Array(3);

        performance.mark('A');

        // Seems quite fast so far...
        //  Copying values over though, to look at them...


        // Yes it's fast with the bit copying too.
        //  But what about modification?
        //   can we call a function that sends the update over?
        //    eg invert it?
        //     fast enough?
        //      an update function could work quickly.
        //       not sure. seems that calling functions without giving params helps it to be fast.


        // Working to make each_px as efficient as possible.
        //  If its really fast it could work as a good platform for other really fast functions.

        // Could try to get the average color...?

        

        pb.each_px(ta_pos, ta_px_value, ta_info, () => {
            // Here we use direct reference to the various typed arrays.

            // ta_info: w, h, idx_px, bipp

            // Can we do some color conversion?
            //  Edit in place?
            //   Could use this to make a mask / 1bipp image of selected pixels.
            //    Have a pixel selection function.

            // Explore ways of fast access.
            //  Queued operations? Take place after the convolution?
            //   Maybe would take more space.... Takes place after the convolution has completely passed that space as input?


            //console.log('ta_pos', ta_pos);
            //console.log('ta_px_value', ta_px_value);

            // Want to try some kind of pixel modification.
            //  Perhaps this could work as part os a very fast custom thresholding system?

            avg[0] += ta_px_value[0];
            avg[1] += ta_px_value[1];
            avg[2] += ta_px_value[2];

            // Also want some kind of examples concerning (quickly) setting pixel values.
            //  see about getting an 'update' function in the callback.

            // This is a good sign for fast convolutions.
            //  Other image operations too....


            px_count++;

        });

        avg[0] = avg[0] / px_count;
        avg[1] = avg[1] / px_count;
        avg[2] = avg[2] / px_count;

        performance.mark('B');
        console.log('avg', avg);
        console.log('px_count', px_count);
        performance.measure('A to B', 'A', 'B');

    }
    //calc_avg();

    // Identifying separate color clusters would be useful too.
    //  Consider quantization.
    //   Consider cluster number and 4? bit offset encoding?
    //    8 bit offset encoding? optional offset encoding? Cluster adherence and offsets may be an efficient method of encoding.
    //     3 bit? 6 bit?

    // Could still work on the window to the original system from within each_px.
    //  each_px does iterate quickly over the pixels.
    //   possibly moving a convolution window would not be so slow either.
    //    there will be some relatively fast means of copying between the different data structures.
    //    Operations should work really quickly on typed arrays.

    // Defining Pixel_Buffers with predefined typed arrays?
    //  That way the initialization of new Pixel_Buffers can be done in such a way that reuses memory objects where appropriate.


    // Code specific to Pixel_Buffer to enable it to be efficiently used as a window to another pixel_buffer

    // Fast copy functions between typed arrays are necessary.
    //  Going value by value in a loop works out plenty fast in many cases.



    // pb_copy_rect_to_pb
    // pb_24bipp_copy_rect_to_pb_24bipp
    ///  including copying between pbs with the same number of bit per pixel.

    // Copying a rectangular region needs to work especially quickly.
    //  Will see about variety of optimizations.
    //   May be more possibilities in the future concerning moving references / positions around.
    // A JS array of rows, each a sub-view?
    //  That could be fairly efficient.



    //  will have some fairly optimized ways of doing this.
    //   want it to proceed quickly and directly copy values / data.

    // will have some underlying lower level functionality that will support pixel buffer windows, but is not specific to them.
    //  so far, getting surprisingly fast JS functionality.









    const invert = () => {
        performance.mark('A');
        // Seems quite fast so far...
        //  Copying values over though, to look at them...

        // Yes it's fast with the bit copying too.
        //  But what about modification?
        //   can we call a function that sends the update over?
        //    eg invert it?
        //     fast enough?
        //      an update function could work quickly.
        //       not sure. seems that calling functions without giving params helps it to be fast.

        // Working to make each_px as efficient as possible.
        //  If its really fast it could work as a good platform for other really fast functions.

        // Could try to get the average color...?
        //const avg = new Float64Array(3);

        pb.each_px(ta_pos, ta_px_value, ta_info, (update) => {
            // Here we use direct reference to the various typed arrays.

            // ta_info: w, h, idx_px, bipp

            // Can we do some color conversion?
            //  Edit in place?
            //   Could use this to make a mask / 1bipp image of selected pixels.
            //    Have a pixel selection function.

            // Explore ways of fast access.
            //  Queued operations? Take place after the convolution?
            //   Maybe would take more space.... Takes place after the convolution has completely passed that space as input?

            ta_px_value[0] = 255 - ta_px_value[0];
            ta_px_value[1] = 255 - ta_px_value[1];
            ta_px_value[2] = 255 - ta_px_value[2];
            update();

            // Update does indeed work (very) quickly!
            //  Would likely need to do it somewhat differently in C++. JS compiler inlining maybe will make this work very quickly too.

            //console.log('ta_pos', ta_pos);
            //console.log('ta_px_value', ta_px_value);

            // Want to try some kind of pixel modification.
            //  Perhaps this could work as part os a very fast custom thresholding system?

            //avg[0] += ta_px_value[0];
            //avg[1] += ta_px_value[1];
            //avg[2] += ta_px_value[2];

            // Also want some kind of examples concerning (quickly) setting pixel values.
            //  see about getting an 'update' function in the callback.

            // This is a good sign for fast convolutions.
            //  Other image operations too....
            //px_count++;
        });

        //avg[0] = avg[0] / px_count;
        //avg[1] = avg[1] / px_count;
        //avg[2] = avg[2] / px_count;

        performance.mark('B');
        //console.log('avg', avg);
        //console.log('px_count', px_count);
        performance.measure('A to B', 'A', 'B');

        // Yes, this direct / more direct method is very quick. Even/especially with the update callback.
        //  Have each_px as the basis for a moving convolution window?
        //   Could update the window's Pixel_Buffer pos according to which pixel.
        //    Could also make use of the pixel update function based on the data that is copied from pre-convolution.

        // Have Pixel_Buffer reference and use the memory of a Canvas in the browser?
        //  Would likely be useful.

        // Methods for image composition / compositing as well.
        //  Should get into 3D acceleration and objects too.









        (async() => {
            // Save the inverted volcano file.

            // Soon worth doing some experiments with C++.
            //  Probably worth getting optimized convolutions working in JS first though.

            await gfx.save_pixel_buffer('./output/each_px_inverted-erte_ale.png', pb, {
                format: 'png'
            });



        })();


    }
    //invert();


    

    // 14 ms - its still fast even with adding up an average.



    
    const eg_split_thresh = () => {
        performance.mark('A');

        const [r, g, b] = pb.split_rgb_channels;
        performance.mark('B');
        performance.measure('A to B', 'A', 'B');
        const rthresh = r.get_1bipp_threshold_8bipp(210);
        const thresh_24bipp = rthresh.to_24bipp();
    }


    const save_egs = async() => {
        await gfx.save_pixel_buffer('./output/test_r_channel-erte_ale.png', r, {
            format: 'png'
        });
        await gfx.save_pixel_buffer('./output/test_g_channel-erte_ale.png', g, {
            format: 'png'
        });
        await gfx.save_pixel_buffer('./output/test_b_channel-erte_ale.png', b, {
            format: 'png'
        });
        await gfx.save_pixel_buffer('./output/thresh_24bipp_210-erte_ale.png', thresh_24bipp, {
            format: 'png'
        });
    }

    

    // Could come up with multiple thresholded versions for the different channels.
    //  Want a more efficient and specific thresholding function.

    // The channel splitting function is very fast for JS.

    // threshold function for just one single channel.
    //  or just for 8 bpp for the moment right now.

    // get_mask_threshold_8bipp
    //  maybe better to call them mono or 1bipp.

    // get_threshold_8bipp
    //  would be simple enough to make it only run on 8bipp pixel buffers.

    const general_px_mask_eg = async() => {
        // Lamda function a little slower??
        performance.mark('C');
        const pb_1bipp_mask = pb.mask_each_pixel(pixel_color => pixel_color[0] >= 225);
        performance.mark('D');
        
        
        performance.measure('C to D', 'C', 'D');

        /*
        let l2 = pb_1bipp_mask.ta.length;
        for (let c2 = 0; c2 < l2; c2 ++) {
            //console.log('pb_1bipp_mask.ta[c2]', pb_1bipp_mask.ta[c2]);
        }
        */

        // See about saving this as a 1bpp image...
        // Or turn it into a 24bpp image, save it as a jpeg.

        // .to_24bipp()  - creates a new object and returns it.
        // .to_bipp()

        // Far more functions will operate internally on the Pixel_Buffer.

        // Can use some relatively simple pixel read and write functions.
        //  Not sure quite how well optimized the calls will wind up.
        //   Should be quite fast for JS at least.

        const res_pb_24bipp = pb_1bipp_mask.to_24bipp();

        //console.log('res_pb_24bipp', res_pb_24bipp);

        // Go through the pixels...
        //console.log('res_pb_24bipp.ta', res_pb_24bipp.ta);

        let c_on = 0;
        let tal = res_pb_24bipp.ta.length;

        let i_px = 0;
        const px_count = res_pb_24bipp.size[0] * res_pb_24bipp.size[1];
        

        const save = async() => {
            await gfx.save_pixel_buffer('./output/test_thresh-erte_ale.png', res_pb_24bipp, {
                format: 'png'
            });
        }
        
    }




    
}



// Worth having an example that iterates over the generated patch.
//  A good starting point for convolutions (incl 3 channel convolutions).

// All channels (arithmetically) get convolved separately.
// Algorithmically, may / would be faster to operate on all 3 at once or closer to it.








if (require.main === module) {
    (async() => {
        // Set file paths here...?

        // The inversion is really fast even just in JS at about 15ms.
        //  Likely to be able to perform a load more functions in high speed.
        //  Then look into doing them faster still.

        
        const obs = new PerformanceObserver((items) => {
            console.log(items.getEntries()[0].duration, 'ms');
            performance.clearMarks();
        });
        obs.observe({ entryTypes: ['measure'] });

        


        let res = await eg_byte_iteration_info();


        console.log('res eg_byte_iteration_info', res);
    })();
}
