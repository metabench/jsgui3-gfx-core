

const eg_mod_name = 'window_to';
const fnlfs = require('fnlfs');
const {obs} = require('fnl');


const create = require('./create_eg_pbs');


// Can have some simple example test images.


const { PerformanceObserver, performance } = require('perf_hooks');
const Convolution = require('../convolution');

const new_gauss_conv_kernel = require('../own_ver/gaussian-convolution-kernel/gck');

const ta_math = require('../ta-math');

// Then the examples will use a proper example runner structure. Won't be all that complex, will allow observation of examples.
//  
const {Pixel_Buffer} = require('../gfx-core');

const run_examples = (gfx_server) => obs((next, complete, error) => {
    const pb_24bipp_color_square = create.generate_color_square();
    const pb_8bipp_patch = (() => {
        const res = create.patch_1();
        res.bipp = 8;
        return res;
    })();
    //console.log('pb_8bipp_patch.bipp', pb_8bipp_patch.bipp);
    const pb_24bipp_patch = create.patch_1();

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


    // Will be good to have functional conv definitions.



    // Initialise sample objects...

    // and examples in an array, with names.

    // All examples are sync.
    //  Saving them won't be.


    // math copy between 24bipp

    const examples = [
        ['beginning_convolve_sharpen-8bipp_patch', () => {

            // Not the full convolve API here, but still does a convolution.
            //  Before long want accelerated C++ convolutions.

            // Use a 3x3 window for the moment.
            // 3x3 conv. Set the values (for the moment, will be a simple sharpen conv)
            
            
            const pb_window = pb_8bipp_patch.new_window({
                size: [3, 3],
                pos_bounds: [-1, -1, pb_8bipp_patch.size[0] - 1, pb_8bipp_patch.size[1] - 1],
                pos: [-1, -1]
            });

            // Write the iteration code here?
            //  already have copy_from_source
            //  will have copy made when the window is created.

            const pos_window = pb_window.pos;
            const ta_window = pb_window.ta;

            const pb_conv_res = new Pixel_Buffer({
                size: pb_8bipp_patch.size,
                bits_per_pixel: 8
            });

            let i_write = 0;
            const ta_conv_res = pb_conv_res.ta;
            performance.mark('F');
            pb_window.each_pos_within_bounds(() => {
                ta_conv_res[i_write++] = conv_s3_sharpen.calc_from_8bipp_ta(ta_window);
            });

            performance.mark('G');
            performance.measure('F to G', 'F', 'G');

            return pb_conv_res;
            //return pb_dest;
        }],
        ['beginning_convolve_sharpen-24bipp_patch', () => {

            // Not the full convolve API here, but still does a convolution.
            //  Before long want accelerated C++ convolutions.


            // Use a 3x3 window for the moment.
            // 3x3 conv. Set the values (for the moment, will be a simple sharpen conv)
            

            // window centered on source pixel?
            //  position binding? Was able to bypass this complexity for the moment.
            //   possibly work on it to make a nicer API?
            //    api just for the convolution function? maybe moving pixel windows centered on a pixel would be useful elsewhere.



            // Various kinds of edge detection will be useful too.
            



            
            const pb_window = pb_24bipp_patch.new_window({
                size: [3, 3],
                pos_bounds: [-1, -1, pb_8bipp_patch.size[0] - 1, pb_8bipp_patch.size[1] - 1],
                pos: [-1, -1]
            });

            // Write the iteration code here?
            //  already have copy_from_source
            //  will have copy made when the window is created.

            const pos_window = pb_window.pos;
            const ta_window = pb_window.ta;

            const pb_conv_res = new Pixel_Buffer({
                size: pb_8bipp_patch.size,
                bits_per_pixel: 24
            });

            let i_write = 0;
            const ta_conv_res = pb_conv_res.ta;
            performance.mark('I');

            // and a temp color? a const color we get within that function?

            //  could do ta_conv_res.set with the px value.
            //   may be faster than the assignment statements?

            // Maybe it doesnt work on already very bold images.
            //  Seems no different from the source.
            //   Unlike the greyscale, there is no further margin for color intensity.
            //    (image is at full sharpness, all differences are of 255!!!)
            //     could be a 3 bit image :)

            // May be better to blur this color example patch. It works :).


            pb_window.each_pos_within_bounds(() => {
                //ta_conv_res[i_write++] = conv_s3_sharpen.calc_from_24bipp_ta(ta_window);

                const rgb = conv_s3_sharpen.calc_from_24bipp_ta(ta_window);
                ta_conv_res[i_write++] = rgb[0];
                ta_conv_res[i_write++] = rgb[1];
                ta_conv_res[i_write++] = rgb[2];

            });

            performance.mark('J');
            performance.measure('I to J', 'I', 'J');

            return pb_conv_res;
            //return pb_dest;
        }],
        ['beginning_convolve_blur-24bipp_patch', () => {

            // Not the full convolve API here, but still does a convolution.
            //  Before long want accelerated C++ convolutions.


            // Use a 3x3 window for the moment.
            // 3x3 conv. Set the values (for the moment, will be a simple sharpen conv)
            
            
            const pb_window = pb_24bipp_patch.new_window({
                size: [3, 3],
                pos_bounds: [-1, -1, pb_8bipp_patch.size[0] - 1, pb_8bipp_patch.size[1] - 1],
                pos: [-1, -1]
            });

            // Write the iteration code here?
            //  already have copy_from_source
            //  will have copy made when the window is created.

            const pos_window = pb_window.pos;
            const ta_window = pb_window.ta;

            const pb_conv_res = new Pixel_Buffer({
                size: pb_8bipp_patch.size,
                bits_per_pixel: 24
            });

            let i_write = 0;
            const ta_conv_res = pb_conv_res.ta;
            performance.mark('K');

            // and a temp color? a const color we get within that function?

            //  could do ta_conv_res.set with the px value.
            //   may be faster than the assignment statements?

            // Maybe it doesnt work on already very bold images.
            //  Seems no different from the source.
            //   Unlike the greyscale, there is no further margin for color intensity.
            //    (image is at full sharpness, all differences are of 255!!!)
            //     could be a 3 bit image :)

            // May be better to blur this color example patch.

            // Can definitely get it faster than this, even just in JS.

            pb_window.each_pos_within_bounds(() => {
                //ta_conv_res[i_write++] = conv_s3_sharpen.calc_from_24bipp_ta(ta_window);
                const rgb = conv_gauss_3_sigma_1p6.calc_from_24bipp_ta(ta_window);
                ta_conv_res[i_write++] = rgb[0];
                ta_conv_res[i_write++] = rgb[1];
                ta_conv_res[i_write++] = rgb[2];
            });

            performance.mark('L');
            performance.measure('K to L', 'K', 'L');

            return pb_conv_res;
            //return pb_dest;
        }] /*,
        ['eg_2', () => {
            //return pb_dest;
        }],
        ['eg_3', () => {
            //return pb_dest;
        }] */
    ];

    const l_examples = examples.length;
    let eg_name, fn_example, res_eg;


    (async() => {
        for (let c = 0; c < l_examples; c++) {
            [eg_name, fn_example] = examples[c];
            res_eg = fn_example();
            if (res_eg instanceof Pixel_Buffer) {
                await fnlfs.ensure_directory_exists('./output/' + eg_mod_name + '/');
                await gfx_server.save_pixel_buffer('./output/' + eg_mod_name + '/' + eg_name + '.png', res_eg, {
                    format: 'png'
                });
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

    //const gfx_server = require('jsgui3-gfx-server')
    const obs_run_examples = run_examples(gfx_server);

    obs_run_examples.on('next', e_example => {

    })

}