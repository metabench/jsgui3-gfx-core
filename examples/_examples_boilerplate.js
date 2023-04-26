

const eg_mod_name = 'examples_boilerplate';
const fnlfs = require('fnlfs');
const {obs} = require('fnl');
const create = require('./create_eg_pbs');
const { PerformanceObserver, performance } = require('perf_hooks');

const ta_math = require('../ta-math');

// Then the examples will use a proper example runner structure. Won't be all that complex, will allow observation of examples.
//  
const {Pixel_Buffer} = require('../gfx');

const run_examples = (gfx_server) => obs((next, complete, error) => {
    const pb_24bipp_color_square = create.generate_color_square();
    const pb_8bipp_patch = (() => {
        const res = create.patch_1();
        res.bipp = 8;
        return res;
    })();
    //console.log('pb_8bipp_patch.bipp', pb_8bipp_patch.bipp);

    const pb_24bipp_patch = create.patch_1();

    // Initialise sample objects...

    // and examples in an array, with names.

    // All examples are sync.
    //  Saving them won't be.


    // math copy between 24bipp

    const examples = [
        ['eg_1', () => {
            //return pb_dest;
        }],
        ['eg_2', () => {
            //return pb_dest;
        }],
        ['eg_3', () => {
            //return pb_dest;
        }]
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

    const gfx_server = require('jsgui3-gfx-server')
    const obs_run_examples = run_examples(gfx_server);

    obs_run_examples.on('next', e_example => {

    })

}