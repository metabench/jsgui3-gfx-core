
/*
    Roadmap - towards 0.0.24
        Move tested and relevant algorithms to ta_math where appropriate.
        More resizing examples - could use Erte Ale.
        Perf Opt

        Also worth moving relevant inner working of VFPX into ta_math. ???


*/



const eg_mod_name = 'resize';


const {each} = require('lang-mini');
const fnlfs = require('fnlfs');
const {obs} = require('fnl');
const create = require('../create_eg_pbs');
const { PerformanceObserver, performance } = require('perf_hooks');

const ta_math = require('../../ta-math');

const {resize_ta_colorspace} = ta_math;
//  makes more sense there!

// Then the examples will use a proper example runner structure. Won't be all that complex, will allow observation of examples.
//  
const {Pixel_Buffer} = require('../../gfx-core');

// Could make into separate module as it seems generally useful. It would also help progress towards jsgui4, which will use more external references (still to my ecosystem).
const Virtual_Float_Pixel = require('../../virtual-float-pixel');

const run_examples = (gfx_server, erte_ale, westminster_bridge) => obs((next, complete, error) => {
    const pb_24bipp_color_square = create.generate_color_square();
    const pb_8bipp_patch = (() => {
        const res = create.patch_1();
        res.bipp = 8;
        return res;
    })();
    //console.log('pb_8bipp_patch.bipp', pb_8bipp_patch.bipp);

    const pb_24bipp_patch = create.patch_1();
    const pastel = create.generate_32x32_24bipp_pastel();

    

    

    



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

    console.log('erte_ale.size', erte_ale.size);

    
    //console.log('new_size', new_size);
    


    const examples = [
        // Ask the Pixel_Buffer which iteration algorithm to use?
        //  Want to present a simple API... will eventually have a resize_ta(ta_source, colorspace_source, dest_size), and won't use the Virtual_Pixel class their either.

        // resize_32x32_to_16x16_24bipp_pastel
        //  and resize it to other amounts.
        //   eg 13x13

        // then integrate resizing into codebase, and make an actual resize example.
        //  release 0.0.24 will have good resize support within the API.
        //   also lower level resizing functions on the ta / maths level.


        // Larger fn calls help warm-up / V8 optimizing things.

        

        //false,

        

        ['resize_erte_ale_0p1', () => {
            console.log('resize_erte_ale_0p1');
            // simpler type of resizing, should make use of all having total pixel coverage special case.
            // will go over the 32x32 virtual pixel view...
            //  maybe virtual pixel view is a useful abstraction here too...?

            // any optimization for iterating over virtual pixel space?
            //  

            //console.log('resize_32x32_24bipp_pastel_to_16x16');
            let scale = 0.1;
            let new_size = new Int16Array([Math.round(erte_ale.size[0] * scale), Math.round(erte_ale.size[1] * scale)]);

            //const new_size = new Int16Array([16, 16]);
            performance.mark('I');
            const pb_res = erte_ale.new_resized(new_size);
            performance.mark('J');
            performance.measure('I to J', 'I', 'J');
            return pb_res;
            

        }],
        

        ['resize_westminster_bridge_0p1', () => {
            console.log('resize_westminster_bridge_0p1');
            // simpler type of resizing, should make use of all having total pixel coverage special case.

            // will go over the 32x32 virtual pixel view...
            //  maybe virtual pixel view is a useful abstraction here too...?

            // any optimization for iterating over virtual pixel space?
            //  

            // Not so quick at 631ms... but that's still quite good for JS.

            //console.log('resize_32x32_24bipp_pastel_to_16x16');
            let scale = 0.1;
            let new_size = new Int16Array([Math.round(westminster_bridge.size[0] * scale), Math.round(westminster_bridge.size[1] * scale)]);

            //const new_size = new Int16Array([16, 16]);
            performance.mark('M');
            const pb_res = westminster_bridge.new_resized(new_size);
            performance.mark('N');
            performance.measure('M to N', 'M', 'N');
            return pb_res;
        }],

        ['resize_westminster_bridge_0p2', () => {
            console.log('resize_westminster_bridge_0p2');
            // simpler type of resizing, should make use of all having total pixel coverage special case.

            // will go over the 32x32 virtual pixel view...
            //  maybe virtual pixel view is a useful abstraction here too...?

            // any optimization for iterating over virtual pixel space?
            //  

            // Not so quick at 631ms... but that's still quite good for JS.

            //console.log('resize_32x32_24bipp_pastel_to_16x16');
            let scale = 0.2;
            let new_size = new Int16Array([Math.round(westminster_bridge.size[0] * scale), Math.round(westminster_bridge.size[1] * scale)]);

            //const new_size = new Int16Array([16, 16]);
            performance.mark('K');
            const pb_res = westminster_bridge.new_resized(new_size);
            performance.mark('L');
            performance.measure('K to L', 'K', 'L');
            return pb_res;
        }],


        ['resize_westminster_bridge_0p3', () => {
            console.log('resize_westminster_bridge_0p3');
            // simpler type of resizing, should make use of all having total pixel coverage special case.

            // will go over the 32x32 virtual pixel view...
            //  maybe virtual pixel view is a useful abstraction here too...?

            // any optimization for iterating over virtual pixel space?
            //  

            // Not so quick at 631ms... but that's still quite good for JS.

            //console.log('resize_32x32_24bipp_pastel_to_16x16');
            let scale = 0.3;
            let new_size = new Int16Array([Math.round(westminster_bridge.size[0] * scale), Math.round(westminster_bridge.size[1] * scale)]);

            //const new_size = new Int16Array([16, 16]);
            performance.mark('I');
            const pb_res = westminster_bridge.new_resized(new_size);
            performance.mark('J');
            performance.measure('I to J', 'I', 'J');
            return pb_res;
        }],

        //false,

        ['resize_westminster_bridge_0p95', () => {
            console.log('resize_westminster_bridge_0p95');
            // simpler type of resizing, should make use of all having total pixel coverage special case.

            // will go over the 32x32 virtual pixel view...
            //  maybe virtual pixel view is a useful abstraction here too...?

            // any optimization for iterating over virtual pixel space?
            //  

            // Not so quick at 631ms... but that's still quite good for JS.

            //console.log('resize_32x32_24bipp_pastel_to_16x16');
            let scale = 0.95;
            let new_size = new Int16Array([Math.round(westminster_bridge.size[0] * scale), Math.round(westminster_bridge.size[1] * scale)]);

            //const new_size = new Int16Array([16, 16]);
            performance.mark('I');
            const pb_res = westminster_bridge.new_resized(new_size);
            performance.mark('J');
            performance.measure('I to J', 'I', 'J');
            return pb_res;
        }],
        ['resize_westminster_bridge_1p05', () => {
            // simpler type of resizing, should make use of all having total pixel coverage special case.
            console.log('resize_westminster_bridge_1p05');

            // will go over the 32x32 virtual pixel view...
            //  maybe virtual pixel view is a useful abstraction here too...?

            // any optimization for iterating over virtual pixel space?
            //  

            // Not so quick at 631ms... but that's still quite good for JS.

            //console.log('resize_32x32_24bipp_pastel_to_16x16');
            let scale = 1.05;
            let new_size = new Int16Array([Math.round(westminster_bridge.size[0] * scale), Math.round(westminster_bridge.size[1] * scale)]);

            //const new_size = new Int16Array([16, 16]);
            performance.mark('K');
            const pb_res = westminster_bridge.new_resized(new_size);
            performance.mark('L');
            performance.measure('K to L', 'K', 'L');
            return pb_res;
        }],

        //false,

        ['resize_erte_ale_0p87', () => {
            console.log('resize_erte_ale_0p87');
            // simpler type of resizing, should make use of all having total pixel coverage special case.

            // will go over the 32x32 virtual pixel view...
            //  maybe virtual pixel view is a useful abstraction here too...?

            // any optimization for iterating over virtual pixel space?
            //  

            //console.log('resize_32x32_24bipp_pastel_to_16x16');
            let scale = 0.87;
            let new_size = new Int16Array([Math.round(erte_ale.size[0] * scale), Math.round(erte_ale.size[1] * scale)]);

            //const new_size = new Int16Array([16, 16]);
            performance.mark('G');
            const pb_res = erte_ale.new_resized(new_size);
            performance.mark('H');
            performance.measure('G to H', 'G', 'H');
            return pb_res;
        }],

        // functions using more pure maths to do the resizing...
        //  will optimize to C++ better / more easily.


        // Works really quickly.
        //  Shrinking (by a small amount?) may be a lot slower.

        ['resize_erte_ale_1p22', () => {
            console.log('resize_erte_ale_1p22');
            // simpler type of resizing, should make use of all having total pixel coverage special case.

            // will go over the 32x32 virtual pixel view...
            //  maybe virtual pixel view is a useful abstraction here too...?

            // any optimization for iterating over virtual pixel space?
            //  

            //console.log('resize_32x32_24bipp_pastel_to_16x16');
            let scale = 1.22;
            let new_size = new Int16Array([erte_ale.size[0] * scale, erte_ale.size[1] * scale]);

            //const new_size = new Int16Array([16, 16]);
            performance.mark('E');
            const pb_res = erte_ale.new_resized(new_size);
            performance.mark('F');
            performance.measure('E to F', 'E', 'F');
            return pb_res;
            

        }],

        //false,

        // Slower, but not so bad actually.
        //  An optimized algo that doesn't use the VFPX would be faster.
        //   May find that it's dealing with 3x3 squares at maximum.
        //    Could have an optimized and slightly longwinded shrinking algo to deal with that situation.


        // Could have optimized 50% downscaling, and 200% upscaling. Pixel halving / doubling - even weights but still need to calculate.


        
        

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
            const pb_res = pastel.new_resized(new_size);
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
            const pb_res = pastel.new_resized(new_size);
            return pb_res;


        }],
        ['resize_32x32_24bipp_pastel_to_36x36', () => {
            const new_size = new Int16Array([36, 36]);
            const pb_res = pastel.new_resized(new_size);
            return pb_res;
        }],
        ['resize_32x32_24bipp_pastel_to_50x50', () => {


            const new_size = new Int16Array([50, 50]);
            performance.mark('A');
            const pb_res = pastel.new_resized(new_size);
            performance.mark('B');
            performance.measure('A to B', 'A', 'B');

            return pb_res;
        }],

        ['resize_32x32_24bipp_pastel_to_1000x1000', () => {
            console.log('resize_32x32_24bipp_pastel_to_1000x1000');


            // Currently rather slow at this large size...
            //  Mathematical function that creates no new variables during any of the loops.
            //   Completely inline operations...?
            //   Large algorithm?
            //   Don't create the weight object, directly accumulate.
            //    This is something that could be done now / sooner.
            //    



            const new_size = new Int16Array([1000, 1000]);
            performance.mark('C');
            const pb_res = pastel.new_resized(new_size);
            performance.mark('D');
            performance.measure('C to D', 'C', 'D');

            return pb_res;
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

        //const json_res = JSON.stringify(res_all_egs, null, 4);
        //console.log('res_all_egs', json_res);

        // Then processing for the examples...
        //  Want to compute the total weights for each of them.
        //   They should add up to 1.



        // Also, corners shouldn't have heigher 

        /*

        each(res_all_egs, (res, name) => {
            const {weights, pos, size} = res;

            //console.log('[pos, size]', [pos, size]);
            //console.log('name', name);
            //console.log('t_weight', t_weight);
            //console.log('weights', weights);

            //let t_weight = 0;
            //each(weights, weight => t_weight += weight);
            //console.log('t_weight', t_weight);

        })
        */

    })();
});

if (require.main === module) {

    (async() => {
        const obs = new PerformanceObserver((items) => {
            console.log(items.getEntries()[0].duration, 'ms');
            performance.clearMarks();
        });
        obs.observe({ entryTypes: ['measure'] });

        // Would be best not to have the example need this (probably).

        const gfx_server = require('jsgui3-gfx-server');
        //  Depends on gfx server working. gfx server depends on gfx

        // creata a non-server PB from the one we load...
        // new PB(pb)

        const erte_ale = new Pixel_Buffer(await gfx_server.load_pixel_buffer('../source_images/Erte Ale Volcano.jpg'));
        const westminster_bridge = new Pixel_Buffer(await gfx_server.load_pixel_buffer('../source_images/Ultimate-Travel-Guide-to-London.jpg'));
    
        // load the Erte Ale image.

        //console.log('erte_ale.ta', erte_ale.ta);
        //console.log('Pixel_Buffer', Pixel_Buffer);
        //throw 'stop';
    
    
        const obs_run_examples = run_examples(gfx_server, erte_ale, westminster_bridge);
    
        obs_run_examples.on('next', e_example => {
    
        })
    })();

    

}