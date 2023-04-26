
/*
    Roadmap - towards 0.0.24
        Move tested and relevant algorithms to ta_math where appropriate.
        More resizing examples - could use Erte Ale.
        Perf Opt

        Also worth moving relevant inner working of VFPX into ta_math. ???


*/



const eg_mod_name = 'subpixels';


const {each} = require('lang-mini');

const fnlfs = require('fnlfs');
const {obs} = require('fnl');
//const create = require('./create_eg_pbs');
const { PerformanceObserver, performance } = require('perf_hooks');

const ta_math = require('../../ta-math');

const {resize_ta_colorspace} = ta_math;
//  makes more sense there!

// Then the examples will use a proper example runner structure. Won't be all that complex, will allow observation of examples.
//  
const {Pixel_Buffer} = require('../../gfx-core');

// Could make into separate module as it seems generally useful. It would also help progress towards jsgui4, which will use more external references (still to my ecosystem).
const Virtual_Float_Pixel = require('../../virtual-float-pixel');


// Shoud not need gfx-server for these details.



const run_examples = (gfx_server) => obs((next, complete, error) => {
    const pb_24bipp_color_square = create.generate_color_square();
    const pb_8bipp_patch = (() => {
        const res = create.patch_1();
        res.bipp = 8;
        return res;
    })();
    //console.log('pb_8bipp_patch.bipp', pb_8bipp_patch.bipp);

    const pb_24bipp_patch = create.patch_1();
    const pastel = create.generate_32x32_24bipp_pastel();
    // The pastel image will be a good one to begin working on resizing with
    //  (enlarging in particular, using floating point pixel reference and weighted merging)

    //let console = {
    //    log: () => {}
    //}

    // Some examples of creating a new image from subpixel reads...
    // iterate over a different pixel range
    // so, come up with a larger pixel space, eg 100x100 (same ar)

    // maybe we need more than taf_pos.
    //  the pixels / subpixels could be of a sifferent size.
    //  if so, do similar calculations...?

    // Or... use the larger pixel space, and calculate a pixel ratio so we can do 1px sized reads on specific places in the source image?

    // Think we need some more maths...
    //  Want to be able to read a subpixel area which may not be a 1x1 square.

    // Scaling back from a pixel in the dest to a pixel in the source.

    // Possibly correctly centered pixel-sized reads on the source would work?
    //  as an approximation?
    // we could use the dest to source mapping to work out the positions of centers of the virtual pixels we want to read from.

    // seems like it's worth trying that reading / sampling method. Can compare results with other methods.
    //  this could be really fast and accurate.

    // Initialise sample objects...

    // and examples in an array, with names.

    // All examples are sync.
    //  Saving them won't be.


    // math copy between 24bipp

    // then want a function that reads a pixel based on floating point position.
    //  read all (4) pixels it overlaps
    //  calculate the relative proportion it's within each (should add up to 1), will use as weightings
    //  create a merged pixel color from the colors extracted and the weightings.
    //  this is a step to facilitate image resizing using a smooth and fast algorithm.

    // may go into ta_math.


    // optional result ta?
    //  and would set it if we need to create it.

    // Won't pass in the result ta for the moment.
    //  May be OK to allocate a bit of memory for the fn call?
    //   Investigate optimizatins but no need to optimize absolutely everything (yet).
    //    Need to compare optimized implementations to more basic ones.


    // const read_merged_subpixel(ta_source, ta_colorspace, taf_subpixel_pos, taf_subpixel_size)

    //const calc_bounds = ()

    //  reading subpixels will be useful for image upscaling.

    // May be worth doing area calculations...
    //  Area within each of the 2 or 4 possible pixels.

    // Can also read non-square subpixels.

    // pixel reading and merging by weights function here...
    //  should consider typed array map.

    // Copy into pixel?

    // Copy into destination ta at a specified index?
    //  saves having to create a px res object, and copy that into place.

    // read_merged_vfpx_24bipp_write?
    //  for the moment at least.
    //   will be given the ta and the byidx.

    // use a static accumulator?

    

    




    /*

    const calc_ipx_coverage_areas = (vfp) => {
        const arr_ipx = [
            [0, 0]
        ];
        const res = arr_ipx.map(area => [area, vfp.get_ipx_coverage(area)]);
        return res;
    }
    */

    const eg_vfpx_info = vfp => {

        // .only_total_coverage?
        //  no edges?

        // want to be able to get the edge thicknesses using floating point.
        //  need to consider corner cases too...

        // Edge proportions being 1
        //  meaning corner proportions are also 1.
        //  Makes sense at least...
        //   But seems better to bypass these calculations.
        //   some kind of no_partial_edges property would be of use.

        //  and only if it knows there are partial edges does it calculate / provide? their values.

        // Corner proportions also work out to be 1 when they don't matter.
        //  A usable corner proportion value anyway.

        // Could more quickly set these all to 1 when we see that there are no partial edges
        //  tai any coverage matches tai full coverages.
        // f_size, i_size?

        // more precision in the names makes a lot of sense,
        // f_area too.

        // num_any_coverage_px can be used for some special cases, eg 1, 2(, 4?)

        // .weights?
        // .ipx_weights
        //   that would make a lot of sense
        // .i_width (any coverage)
        //  makes sense in some ways, as we'll need the width the most when looping through these weights.
        //   the returned ta could also have a .width property?

        // i_any_coverage_width is definitely clearer what it means.


        // pastel.resize resizes iteself.
        //  would overwrite its own pb.



        // pastel.new_resized([12, 12]);
        //  would do the superpixel sampling.

        // later on, resizing with inline / inloop weight calculations...
        //  would use the weights immediately.
        //  will be nice to test this against an already working method, and benchmark.

        const merged_pastel_rbg = read_merged_vfpx(pastel.ta, pastel.ta_colorspace, vfp);

        console.log('merged_pastel_rbg', merged_pastel_rbg);
        






        // get the merged pixel value from pastel?
        //  pastel.get_merged_fpx(vfp);
        //   


        return {
            size: vfp.size,
            i_size: vfp.i_size,
            pos: vfp.pos,
            bounds: vfp.bounds,
            area: vfp.area,
            num_any_coverage_px: vfp.num_any_coverage_px,
            i_any_coverage_width: vfp.i_any_coverage_width,
            i_any_coverage_bounds: vfp.i_any_coverage_bounds,
            i_total_coverage_bounds: vfp.i_total_coverage_bounds,
            no_partial_edges: vfp.no_partial_edges,
            f_ltrb_edge_proportions: vfp.f_ltrb_edge_proportions,
            f_tl_tr_bl_br_corner_proportions: vfp.f_tl_tr_bl_br_corner_proportions,
            //ipx_coverage_areas: calc_ipx_coverage_areas(vfp),
            weights: vfp.weights,
            merged_pastel_rbg: merged_pastel_rbg
        }
    }

    // a function that is only mathematical, uses the tas, but not the pbs...

    


    // could get the new resized ta, then give it to a new pb.
    //  the new pb would take that ta as its own.




    const new_resized_pb = (pb, size) => {
        const source_ta = pb.ta;
        const dest_size = new Int16Array(size);
        const dest = new pb.constructor({
            size: dest_size,
            bits_per_pixel: pb.bipp
        });
        resize_ta_colorspace(pb.ta, pb.ta_colorspace, dest_size, dest.ta);
        return dest;
    }


    // Now want to create upscaled resized image.
    //  Or write a general image resizing function within ta_maths, that uses VFPX?

    // read_merged_vfpx_from_ta_colorspace(ta_source, colorspace, vfpx);
    //  gets the weights
    //  merges the weights
    //  provides the result.

    // doing it more within the maths and array level will help general implementations, and these function can be used within classes such as pb too.


    const normal_pos = [14.4, 6.2];


    // Not so sure about making resizing examples here.
    //  Could be time for a resize.js examples
    //   Building code there and integrating it into lower levels.

    


    const examples = [
        // Ask the Pixel_Buffer which iteration algorithm to use?
        //  Want to present a simple API... will eventually have a resize_ta(ta_source, colorspace_source, dest_size), and won't use the Virtual_Pixel class their either.

        // resize_32x32_to_16x16_24bipp_pastel
        //  and resize it to other amounts.
        //   eg 13x13

        // then integrate resizing into codebase, and make an actual resize example.
        //  release 0.0.24 will have good resize support within the API.
        //   also lower level resizing functions on the ta / maths level.


        // functions using more pure maths to do the resizing...
        //  will optimize to C++ better / more easily.



        

        //false,


        // for the moment, it's worth implementing some example resizing code here.
        ['resize_32x32_24bipp_pastel_to_16x16', () => {

            // simpler type of resizing, should make use of all having total pixel coverage special case.

            // will go over the 32x32 virtual pixel view...
            //  maybe virtual pixel view is a useful abstraction here too...?

            // any optimization for iterating over virtual pixel space?
            //  

            //console.log('resize_32x32_24bipp_pastel_to_16x16');

            const new_size = new Int16Array([16, 16]);
            const pb_res = new_resized_pb(pastel, new_size);
            return pb_res;

        }],
        //false,
        ['resize_32x32_24bipp_pastel_to_12x12', () => {

            // simpler type of resizing, should make use of all having total pixel coverage special case.

            // will go over the 32x32 virtual pixel view...
            //  maybe virtual pixel view is a useful abstraction here too...?

            // any optimization for iterating over virtual pixel space?
            //  


            const new_size = new Int16Array([12, 12]);
            const pb_res = new_resized_pb(pastel, new_size);
            return pb_res;


        }],
        ['resize_32x32_24bipp_pastel_to_36x36', () => {
            const new_size = new Int16Array([36, 36]);
            const pb_res = new_resized_pb(pastel, new_size);
            return pb_res;
        }],
        ['resize_32x32_24bipp_pastel_to_50x50', () => {


            const new_size = new Int16Array([50, 50]);
            performance.mark('A');
            const pb_res = new_resized_pb(pastel, new_size);
            performance.mark('B');
            performance.measure('A to B', 'A', 'B');

            return pb_res;
        }],

        ['resize_32x32_24bipp_pastel_to_1000x1000', () => {


            // Currently rather slow at this large size...
            //  Mathematical function that creates no new variables during any of the loops.
            //   Completely inline operations...?
            //   Large algorithm?
            //   Don't create the weight object, directly accumulate.
            //    This is something that could be done now / sooner.
            //    

            
            



            const new_size = new Int16Array([1000, 1000]);
            performance.mark('C');
            const pb_res = new_resized_pb(pastel, new_size);
            performance.mark('D');
            performance.measure('C to D', 'C', 'D');

            return pb_res;
        }],
        false,

        // Get the weightings matrix from the VFP...

        ['vfpx_0c0_1x1', () => {
            const vfp = new Virtual_Float_Pixel([0, 0], [1, 1]);
            return eg_vfpx_info(vfp);
        }],
        //false, 
        ['vfpx_10p4c10p4_3p5x0p2', () => {
            const vfp = new Virtual_Float_Pixel(normal_pos, [3.5, 0.2]);
            return eg_vfpx_info(vfp);

        }],
        ['vfpx_10p4c10p4_3p5x1p1', () => {
            const vfp = new Virtual_Float_Pixel(normal_pos, [3.5, 1.1]);
            return eg_vfpx_info(vfp);
        }],
        //false,
        ['vfpx_10p4c10p4_3p5x1p8', () => {
            const vfp = new Virtual_Float_Pixel(normal_pos, [3.5, 1.8]);
            return eg_vfpx_info(vfp);
        }],
        ['vfpx_10p4c10p4_3p5x2p4', () => {
            const vfp = new Virtual_Float_Pixel(normal_pos, [3.5, 2.4]);
            return eg_vfpx_info(vfp);
        }],
        ['vfpx_10p4c10p4_3p5x2p6', () => {
            const vfp = new Virtual_Float_Pixel(normal_pos, [3.5, 2.6]);
            return eg_vfpx_info(vfp);
        }],
        ['vfpx_10p4c10p4_3p5x2p7', () => {
            const vfp = new Virtual_Float_Pixel(normal_pos, [3.5, 2.7]);
            return eg_vfpx_info(vfp);
        }],
        // Now let's try taller virtual pixels...
        // 0.2, 0.8, 1.1, 1.8, 2.4, 2.6, 2.7
        ['vfpx_10p4c10p4_0p2x3p5', () => {
            const vfp = new Virtual_Float_Pixel(normal_pos, [0.2, 3.5]);
            return eg_vfpx_info(vfp);
        }],
        ['vfpx_10p4c10p4_0p8x3p5', () => {
            const vfp = new Virtual_Float_Pixel(normal_pos, [0.8, 3.5]);
            return eg_vfpx_info(vfp);
        }],
        ['vfpx_10p4c10p4_1p1x3p5', () => {
            const vfp = new Virtual_Float_Pixel(normal_pos, [1.1, 3.5]);
            return eg_vfpx_info(vfp);
        }],
        ['vfpx_10p4c10p4_1p8x3p5', () => {
            const vfp = new Virtual_Float_Pixel(normal_pos, [1.8, 3.5]);
            return eg_vfpx_info(vfp);
        }],
        ['vfpx_10p4c10p4_2p4x3p5', () => {
            const vfp = new Virtual_Float_Pixel(normal_pos, [2.4, 3.5]);
            return eg_vfpx_info(vfp);
        }],
        ['vfpx_10p4c10p4_2p6x3p5', () => {
            const vfp = new Virtual_Float_Pixel(normal_pos, [2.6, 3.5]);
            return eg_vfpx_info(vfp);
        }],
        ['vfpx_10p4c10p4_2p7x3p5', () => {
            const vfp = new Virtual_Float_Pixel(normal_pos, [2.7, 3.5]);
            return eg_vfpx_info(vfp);
        }]
    ]
    

    const l_examples = examples.length;
    let eg_name, fn_example, res_eg;


    (async() => {
        const res_all_egs = {};

        for (let c = 0; c < l_examples; c++) {
            //console.log('examples[c]', examples[c]);
            if (examples[c] === false) {
                // means stop all running of examples.
                break;
            }

            [eg_name, fn_example] = examples[c];

            if (eg_name) {
                res_eg = fn_example();
                if (res_eg instanceof Pixel_Buffer) {
                    await fnlfs.ensure_directory_exists('./output/' + eg_mod_name + '/');
                    await gfx_server.save_pixel_buffer('./output/' + eg_mod_name + '/' + eg_name + '.png', res_eg, {
                        format: 'png'
                    });
                } else {
                    /*
                    console.log('NYI - need to save non-pb results from examples / tests.');
                    console.log('');
                    console.log(eg_name);
                    console.log('-'.repeat(eg_name.length));
                    console.log('');
                    console.log(res_eg);
                    */
                    res_all_egs[eg_name] = res_eg;
                }
            }
        }
        // console.log(JSON.stringify(myObject, null, 4));

        const json_res = JSON.stringify(res_all_egs, null, 4);
        console.log('res_all_egs', json_res);

        // Then processing for the examples...
        //  Want to compute the total weights for each of them.
        //   They should add up to 1.



        // Also, corners shouldn't have heigher 

        each(res_all_egs, (res, name) => {
            const {weights, pos, size} = res;

            console.log('[pos, size]', [pos, size]);
            console.log('name', name);
            //console.log('t_weight', t_weight);
            console.log('weights', weights);

            let t_weight = 0;
            each(weights, weight => t_weight += weight);

            console.log('t_weight', t_weight);

        })

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

    })

}