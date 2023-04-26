/*
    More in-depth examples of copy methods
    Copying between different bipp pbs?
        Or throwing error if attempted
    Copying bounds defined rect from source to pos in dest
        Need to accoung for different ta row byte length.

    Byte copy, Pixel copy, Row copy, Byte Range copy (could be used when both source and the target have the same size)
        Byte Range copy:
            Could have checked the next_row_byte_skip on both the source and the dest (a and b), seen that it's 0, meaning it's aligned in a way which makes the full copy possible, directly copying a large amount of the ta at once.

    More 1bipp support?
        Less optimized version first (try them?)

    Copying greyscale images to within the space of color images at least makes sense.

    Need a nice variety of optimized js copy algorithms.
    Different optimized pixel writing too?

    Differentiate between bounds size alignment or not?

    Will have simpler / possibly faster copy algorithm when it can be specified as a single copy between 2 bounds of source ta space.


    // function copy_range_from_ta_source(ta_source, ta_dest, )
    //  copy_ta_range(ta_source, ta_dest, byte_idx_source_start, byte_idx_dest_start, length);
    //   could be a useful lower level ta_math function.

    // Possibly could put together ta of range parameters to copy.
    //  Then copy them with one function call.

    // color and greyscale 'patch' images


    


    





    


*/
const fnlfs = require('fnlfs');
const {obs} = require('fnl');
//const create = require('./create_eg_pbs');
const { PerformanceObserver, performance } = require('perf_hooks');

const ta_math = require('../../ta-math');


// Then the examples will use a proper example runner structure. Won't be all that complex, will allow observation of examples.
//  

const {Pixel_Buffer} = require('../../gfx-core');

const run_examples = (gfx_server) => obs((next, complete, error) => {

        
    const pb_24bipp_color_square = create.generate_color_square();
    const pb_8bipp_patch = (() => {
        const res = create.patch_1();
        res.bipp = 8;
        return res;
    })();
    console.log('pb_8bipp_patch.bipp', pb_8bipp_patch.bipp);

    const pb_24bipp_patch = create.patch_1();



    // Initialise sample objects...

    // and examples in an array, with names.

    // All examples are sync.
    //  Saving them won't be.


    // math copy between 24bipp

    const examples = [
        ['math_copy_between_8bipp', () => {
            // Worth cloning the object before using it?

            console.log('running eg math_copy_between_8bipp');

            // Create a Pixel_Buffer, copy various parts from pb_8bipp_patch into it.
            //  These will test and demonstrate different code paths in use.

            const pb_source = pb_8bipp_patch;
            const pb_dest = new pb_8bipp_patch.constructor({
                size: [600, 600],
                bits_per_pixel: 8
            });

            // Lets get chunks around 100, 200px

            // Bytes per row being an important variable to use for both source and dest.

            //const source_copy_bounds = new Int16Array([30, 30, 50, 50]);
            const source_copy_bounds = new Int16Array([50, 50, 225, 225]);
            const dest_pos = new Int16Array([20, 20]);  

            // precalculting the jump at the end of each row...
            //  maybe that can / should be calculated within the function.

            // bytes_pre_row - bytes_per_bounds_row
            //  can calculate inside copy fn.

            console.log('pb_source.bytes_per_pixel', pb_source.bytes_per_pixel);

            // Does it fit within the dest width?

            // Not quite sure what the problem is.

            performance.mark('C');
            ta_math.unaligned_copy_rect_1to4bypp(pb_source.ta, pb_dest.ta, pb_source.bytes_per_row, pb_dest.bytes_per_row, pb_source.bytes_per_pixel, source_copy_bounds, dest_pos);
            performance.mark('D');
            performance.measure('C to D', 'C', 'D');
            
            return pb_dest;
            



            //  versions / lower level versions that use / only use byte indexes?
            //   looks like the math logic leads that way, that's what the operations come down to.
            // ta_math.unaligned_copy_rect_8to32bipp(ta_source, ta_dest, ta_bounds_source, ta_pos_dest, bytes_source_new_row_jump, bytes_dest_new_row_jump)


            //  _bi means byte index version

            // can use byte indexes instead of positions.

            // possibly that fn version would be considerably faster.
            //  possibly the structure in it would be a lot faster still when used inline elsewhere.




            // 9 params here - too many?
            //  folding the last 7 into a single ta could work (well?)


            //  8to32 means the same bipp value but that can be between 8 and 32 bipp
            //   basically not subvivisions of bytes.
            //   1plusbypp?
            //    clearer.

            // Not for working with 1 bipp images.
            //  Worth looking into 2 and 4 bipp images.
            //   Also worth considering other values???

            // Definitely worth making these highly optimized functions for some of the most basic operations.
            //  Then see about porting to C++, WASM, Vulkan, WebGL.





            // The non-byi (byte index) (byidx?) version?
            //  Uses for loops for x and y

            // A version that didn't use x and y could simply use the row jump and other byte index checking to tell when it's done.
            //  Will be fine to do so long as the alignments are right to begin with (it both same number of bypp)

            // Row jump method should be a nice optimization to use.
            //  not using or changing the x, y coords.
            //   sometimes we won't need them. should be faster, as less needs to be updated.







            // say byidx for byte index. byi?

            // ta_math.unaligned_byidx_copy_rect_1plusbypp(ta_source, ta_dest, source_bypr, dest_bypr, bi_source_start, bi_source_end, bi_dest_start, bytes_source_new_row_jump, bytes_dest_new_row_jump)
            //  calculate the skip values itself? For the moment, easier to give them as parameters.

            // make the xy version first.





            // ta_math.unaligned_copy_rect_8to32bipp

            // Copy a few rectangular regions from the source pb.





            // Then copy a few regions / bounds from pb_8bipp_patch

            //  More support for and use of arrays with normal JS numbers?
            //   maybe they are OK, it's worth testing, not assuming.

            // This example will directly use the math function for the copying.

            

            // A more generalised, fast copy function for copying between tas.

            // ta_math.unaligned_copy_rect_8to32bipp(source, dest, bounds_source, pos_dest, ... arguments that are needed for the iteration)
            //  will copy byte ranges where aligned properly (likely rows).



            /*

            // Say 'within' to make it more explicit?
            pb_res.copy_rect_from(pb_8bipp_patch, bounds_within_source, pos_within_dest)
            pb_res.copy_rect_from(pb_8bipp_patch, bounds_source, pos_dest)   

            */






        }],
        ['math_copy_between_24bipp', () => {
            // Worth cloning the object before using it?

            console.log('running eg math_copy_between_24bipp');

            // Create a Pixel_Buffer, copy various parts from pb_8bipp_patch into it.
            //  These will test and demonstrate different code paths in use.

            const pb_source = pb_24bipp_patch;
            const pb_dest = new pb_24bipp_patch.constructor({
                size: [600, 600],
                bits_per_pixel: 24
            });

            // Lets get chunks around 100, 200px

            // Bytes per row being an important variable to use for both source and dest.

            //const source_copy_bounds = new Int16Array([30, 30, 50, 50]);
            const source_copy_bounds = new Int16Array([50, 50, 225, 225]);
            const dest_pos = new Int16Array([20, 20]);
            performance.mark('E');
            ta_math.unaligned_copy_rect_1to4bypp(pb_source.ta, pb_dest.ta, pb_source.bytes_per_row, pb_dest.bytes_per_row, pb_source.bytes_per_pixel, source_copy_bounds, dest_pos);
            performance.mark('F');
            performance.measure('E to F', 'E', 'F');

            // Nice as fast too...

            // Copying values from 8bipp to 24bipp space... will need to do pixel conversion...
            //  Prepare the row to write, then copy it?
            //   could write to a smaller write_row then copy that row all at once.
            //    could get the subset array, and use that to pupulate the write buffer.

            // usage of temportary row read and write buffers may be of use here. Not sure if / how it would change memory localisation optimization.

            // could maybe use a convert_8bipp_row_to_24bipp_row function.
            //  returning a new ta? applying to existing ta?

            // Want to easily be able to copy from a greyscale source to a color one. rgb to rgba as well.

            
            return pb_dest;
        }],
        ['math_copy_8bipp_to_24bipp', () => {
            // Worth cloning the object before using it?
            console.log('running eg math_copy_8bipp_to_24bipp');
            // Create a Pixel_Buffer, copy various parts from pb_8bipp_patch into it.
            //  These will test and demonstrate different code paths in use.

            const pb_source = pb_8bipp_patch;
            const pb_dest = new pb_24bipp_patch.constructor({
                size: [600, 600],
                bits_per_pixel: 24
            });

            // Lets get chunks around 100, 200px

            // Bytes per row being an important variable to use for both source and dest.

            //const source_copy_bounds = new Int16Array([30, 30, 50, 50]);
            const source_copy_bounds = new Int16Array([50, 50, 225, 225]);
            const dest_pos = new Int16Array([20, 20]);
            performance.mark('G');

            // unaligned_copy_rect_1bypp_to_3bypp

            // A simple row preparation function using the subset would make a lot of sense.

            // (ta_source, ta_dest, bypr_source, bypr_dest, ta_source_bounds, ta_dest_pos)


            ta_math.unaligned_copy_rect_1bypp_to_3bypp(pb_source.ta, pb_dest.ta, pb_source.bytes_per_row, pb_dest.bytes_per_row, source_copy_bounds, dest_pos);
            performance.mark('H');
            performance.measure('G to H', 'G', 'H');

            // Nice as fast too...

            // Copying values from 8bipp to 24bipp space... will need to do pixel conversion...
            //  Prepare the row to write, then copy it?
            //   could write to a smaller write_row then copy that row all at once.
            //    could get the subset array, and use that to pupulate the write buffer.

            // usage of temportary row read and write buffers may be of use here. Not sure if / how it would change memory localisation optimization.

            // could maybe use a convert_8bipp_row_to_24bipp_row function.
            //  returning a new ta? applying to existing ta?

            // Want to easily be able to copy from a greyscale source to a color one. rgb to rgba as well.

            // May be worth painging a red rectangle in the bottom of pb_dest

            //

            const paint_bounds = new Int16Array([20, 300, 180, 320]);
            const paint_color = new Uint8ClampedArray([255, 0, 0]);

            ta_math.fill_solid_rect_by_bounds(pb_dest.ta, pb_dest.bytes_per_row, paint_bounds, 24, paint_color);

            









            
            return pb_dest;
        }]
    ];

    const l_examples = examples.length;
    let eg_name, fn_example, res_eg;


    (async() => {


        for (let c = 0; c < l_examples; c++) {
            [eg_name, fn_example] = examples[c];
    
            // precise timing for each example?
            //  would make sense.
    
            res_eg = fn_example();
            //console.log(eg_name + ' result:', res_eg);
    
            if (res_eg instanceof Pixel_Buffer) {
                console.log('Has returned a Pixel_Buffer');
    
                // Save that pb.
    
                // Maybe best to wait for the save to complete.
                await fnlfs.ensure_directory_exists('./output/copy_between_pbs/');


                await gfx_server.save_pixel_buffer('./output/copy_between_pbs/' + eg_name + '.png', res_eg, {
                    format: 'png'
                });
                console.log('eg res pb saved');


    
    
    
            }
            
    
    
    
        }


    })();


    



});



if (require.main === module) {

    const obs = new PerformanceObserver((items) => {
        console.log(items.getEntries()[0].duration, 'ms');
        performance.clearMarks();
    });
    obs.observe({ entryTypes: ['measure'] });

    const gfx_server = require('jsgui3-gfx-server')
    const obs_run_examples = run_examples(gfx_server);

    obs_run_examples.on('next', e_example => {
        // Example results probably?
        //  Or examples can give named output to save?

        // Probably best if each example can raise different output events.



    })

}