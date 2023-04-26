
/*
    Roadmap - towards 0.0.24
        Move tested and relevant algorithms to ta_math where appropriate.
        More resizing examples - could use Erte Ale.
        Perf Opt

        Also worth moving relevant inner working of VFPX into ta_math. ???


*/



const eg_mod_name = 'convolve';
const {each} = require('lang-mini');
const fnlfs = require('fnlfs');
const {obs} = require('fnl');


// Perhaps the examples could already be in the repo.
//const create = require('./create_eg_pbs');


const { PerformanceObserver, performance } = require('perf_hooks');

const ta_math = require('../ta-math');

const {resize_ta_colorspace} = ta_math;
//  makes more sense there!

// Then the examples will use a proper example runner structure. Won't be all that complex, will allow observation of examples.
//  
const {Pixel_Buffer} = require('../gfx-core');

// Could make into separate module as it seems generally useful. It would also help progress towards jsgui4, which will use more external references (still to my ecosystem).
const Virtual_Float_Pixel = require('../virtual-float-pixel');
const new_gauss_conv_kernel = require('../own_ver/gaussian-convolution-kernel/gck');

const Convolution = require('../convolution');

const conv_s3_sharpen = new Convolution({
    size: [3, 3],
    value: [0, -1, 0, -1, 5, -1, 0, -1, 0]
});


const gkernel = new_gauss_conv_kernel(3, 1.6);
//console.log('gkernel', gkernel);

const conv_gauss_3_sigma_1p6 = new Convolution({
    size: [3, 3],
    value: gkernel
});


const gkernel5 = new_gauss_conv_kernel(5, 3);
const conv_gauss_5_sigma_3 = new Convolution({
    size: [5, 5],
    value: gkernel5
});


const run_examples = (gfx_server, erte_ale, westminster_bridge) => obs((next, complete, error) => {
    const pb_24bipp_color_square = create.generate_color_square();
    const pb_8bipp_patch = (() => {
        const res = create.patch_1();
        res.bipp = 8;
        return res;
    })();
    //console.log('pb_8bipp_patch.bipp', pb_8bipp_patch.bipp);

    const pb_24bipp_patch = new Pixel_Buffer(create.patch_1());
    const pastel = new Pixel_Buffer(create.generate_32x32_24bipp_pastel());

    

    

    



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

        ['blur_patch_24bipp', () => {
            console.log('blur_patch_24bipp');
            //return pb_dest;
            // Setup of the pb could take a while... not sure.


            // It's quite fast still. No noticible slowdown with calling from a pb.
            performance.mark('A');
            const res = pb_24bipp_patch.new_convolved(conv_gauss_3_sigma_1p6);
            performance.mark('B');
            performance.measure('A to B', 'A', 'B');
            return res;

        }],

        false,
        ['blur_westminster_bridge_gauss_3_sigma_1p6', () => {
            //return pb_dest;
            performance.mark('C');
            const res = westminster_bridge.new_convolved(conv_gauss_3_sigma_1p6);
            performance.mark('D');
            performance.measure('C to D', 'C', 'D');
            return res;
        }],
        ['blur_westminster_bridge_conv_gauss_5_sigma_3', () => {
            //return pb_dest;
            performance.mark('E');
            const res = westminster_bridge.new_convolved(conv_gauss_5_sigma_3);
            performance.mark('F');
            performance.measure('E to F', 'E', 'F');
            return res;
        }],
        true,

        

        ['blur_erte_ale_conv_gauss_3_sigma_1p6', () => {
            console.log('blur_erte_ale_conv_gauss_3_sigma_1p6');
            // simpler type of resizing, should make use of all having total pixel coverage special case.
            // will go over the 32x32 virtual pixel view...
            //  maybe virtual pixel view is a useful abstraction here too...?

            // any optimization for iterating over virtual pixel space?
            //  

            //console.log('resize_32x32_24bipp_pastel_to_16x16');
            //let scale = 0.1;
            //let new_size = new Int16Array([Math.round(erte_ale.size[0] * scale), Math.round(erte_ale.size[1] * scale)]);

            //const new_size = new Int16Array([16, 16]);
            performance.mark('I');
            const res = erte_ale.new_convolved(conv_gauss_3_sigma_1p6);
            //const pb_res = erte_ale.new_resized(new_size);
            performance.mark('J');
            performance.measure('I to J', 'I', 'J');
            return res;
            

        }]
    ]

    const l_examples = examples.length;
    let eg_name, fn_example, res_eg;


    (async() => {
        const res_all_egs = {};
        
        let skip = false;
        for (let c = 0; c < l_examples; c++) {
            //console.log('examples[c]', examples[c]);
            if (examples[c] === false) {
                // means stop all running of examples.
                //break;
                skip = true;
            } else if (examples[c] === true) {
                skip = false;
            } else if (!skip) {
                [eg_name, fn_example] = examples[c];

                if (eg_name) {
                    res_eg = fn_example();
                    //console.log('res_eg', res_eg);
                    //console.log('res_eg instanceof Pixel_Buffer', res_eg instanceof Pixel_Buffer);
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
        const gfx_server = require('jsgui3-gfx-server');

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