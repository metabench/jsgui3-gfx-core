/*
    Will generate and save a fairly small sample image that can be used to run tests on.

    // Black background / border
    
    // White inside, then items of various colors inside that.

    // Samples of different colors
    // Stripes / repetitions of different frequencies.

    //  Will work with paint_solid_rect
    //   Variety of solid rects will be painted onto the pb.


    



*/


const {
    prom_or_cb
} = require('fnl');


const { PerformanceObserver, performance } = require('perf_hooks');


// options
// max size
// reorient

// No, should not need these.
//  Could use something else even.
//  Or have bitmap format included???



// or ta-math
// Copy the data over to and from a standard pixel buffer (non-server version)?

const gfx = require('../gfx-core');

const Pixel_Buffer = gfx.Pixel_Buffer.get_instance();





// Would be nice to have examples boilerplate working, as well as module exports.


// 32x32_24bipp_pastel


const generate_32x32_24bipp_pastel = () => {
    const res = new Pixel_Buffer({
        size: [32, 32],
        bits_per_pixel: 24
    });

    // res.draw_rect?     res.draw.rect?    res.paint.rect?  res.rect? 

    // A Paint object that works on a PB could make a lot of sense.
    //  Keep painting functionality out of the core directly.
    //   Core is becoming more complex and advanced, need to prune and clarify the codebase though.

    // pb.fill_solid_rect_by_bounds() with its arrangement of params makes it hard to use.
    //  not sure about any perf improvement from doing params that way (not through the fn call) either.
    //   already have very high perf funtions with param passing.


    // pb_paint file and later directory makes sense.
    //  Pixel_Buffer_Painter
    //   will use pb and ta_math functionality to do the painting.


    const pos = new Int16Array([0, 0]);
    const size = new Int16Array([16, 16]);


    // pb.paint(object)
    //  so the painter could be a function / class combo?
    //   maybe stop using class for this.

    // pb.paint.object(object) isn't as good.

    // a paint() function would be cool.
    //  and the function itself would have attached functions, working like a class.
    //  later change the painter implementation to move away from being a class and become a function, with .other_fn eg .rect

    //  or .paint is a function that has copies of the function calls of the painter class. that makes sense too.

    // thistle: (224, 187, 228)

    const color = new Uint8ClampedArray([224, 187, 228]);





    res.paint.rect(pos, size, color);

    pos[0] = 16;
    //pos[1] = 16;

    // magic mint: (181, 234, 215) 

    color[0] = 181;
    color[1] = 234;
    color[2] = 215;

    res.paint.rect(pos, size, color);

    pos[1] = 16;
    pos[0] = 0;

    // Cosmic Cobalt: (59, 50, 133)

    color[0] = 59;
    color[1] = 50;
    color[2] = 133;

    res.paint.rect(pos, size, color);

    // Marigold: (238, 174, 33)
    pos[0] = 16;

    color[0] = 238;
    color[1] = 174;
    color[2] = 33;

    res.paint.rect(pos, size, color);

    pos[0] = 8;
    pos[1] = 8;
    color[0] = 255;
    color[1] = 255;
    color[2] = 255;

    res.paint.rect(pos, size, color);







    return res;



}


const generate_color_square = () => {

    const pb_source = new Pixel_Buffer({
        size: [256, 256],
        bits_per_pixel: 24
    });



    const ta_pos = new Int16Array(2);
    const ta_px_value = new Uint8ClampedArray(3);


    // make general int info array support +-? Better able to hold (memory) offsets that way.
    const ta_info = new Uint32Array(4);

    // a version od each_px that does not use any params?
    //  except callback, with update?



    pb_source.each_px(ta_pos, ta_px_value, ta_info, (update) => {
        // Here we use direct reference to the various typed arrays.

        //console.log('ta_pos', ta_pos);

        // ta_info: w, h, idx_px, bipp

        // Can we do some color conversion?
        //  Edit in place?
        //   Could use this to make a mask / 1bipp image of selected pixels.
        //    Have a pixel selection function.

        // Explore ways of fast access.
        //  Queued operations? Take place after the convolution?
        //   Maybe would take more space.... Takes place after the convolution has completely passed that space as input?

        ta_px_value[0] = ta_pos[0];
        ta_px_value[1] = ta_pos[1];
        ta_px_value[2] = 255;
        update();
    });

    return pb_source;

}


const generate_tp1 = () => {

    // new pb 400, 300

    const pb = new Pixel_Buffer({
        size: [400, 300],
        bits_per_pixel: 24
    });

    // pb.ta_rgb_scratch
    //  covers a 24 bit pixel.

    // .ta_rgb
    //  then color_whole can use that primary rgb color.
    //   many operations could use that primary rgb color.

    // .ta_rgb2, ta_rgb3? For operations that use secondary / tertiery colors.
    //  could be of use, and fast.

    // .color_whole with no param specified will use the (primary) .ta_rgb

    // different parts:

    // border black, bg white
    // 
    // 16 x 16 black rectangle
    //  pattern of 4x4 next to it

    // then 20x20 black rectangle
    //  pattern of 5x5 next to it

    // black to red fade
    // black to green fade
    // black to blue fade



    // Maybe make a simpler 1st patch with more limited number of colors


    // Likely want to run convolutions / edge detections of various sorts on it.
    //  Want to both test that they work, and see how fast I can get them.
    //  Convolutions using window_to and other pb capabilities could make a lot of sense.

    // A Convolution class may be useful.

    // Want a fast / optimized fill rect.
    //  Will do it pixel by pixel?
    //  Or could make a single rect_row, and copy that into place.
    //   Maybe more function to do with writing sequential bytes of color? Writing in a way that's aligned with the write ta.



    // fill_solid_rect_by_bounds(bounds, color);
    //  seems like doing the write-and-skip system would work?
    //   maybe looping pixel by pixel would make most sense?

    // could use its own ta_bounds and ta_rgb / ta_color if they exist.
    //  saving on param usage?

    // Make a non-scratch ta_bounds.
    //  Used for input.

    const ta_bounds = pb.ta_bounds;
    

    ta_bounds[0] = 1;
    ta_bounds[1] = 1;
    ta_bounds[2] = pb.size[0] - 1;
    ta_bounds[3] = pb.size[1] - 1;

    
    //console.log('ta_bounds', ta_bounds);

    const ta_rgb = pb.ta_rgb;
    ta_rgb[0] = 255;
    ta_rgb[1] = 255;
    ta_rgb[2] = 255;

    //console.log('ta_rgb', ta_rgb);

    pb.fill_solid_rect_by_bounds();


    // Could have some pb drawing functions outside of pb.

    //  alternating_square_pattern.
    //   want to make some decent test material for running further image processing on.

    // also worth better organising this into tests / examples.
    //  examples that save their rsults when run.
    //  maintain a local table of example / test running / regression results.

    const rgb = new Uint8ClampedArray(3);
    const rgb2 = new Uint8ClampedArray(3);

    // a scratch rgb needed?
    //  ie one that's not needed / used for parameters?
    //   .ta_scratch_rgb

    // .ta_rgb_scratch
    
    // 

    

    const alternating_2col_rect_pattern = (start_pos, rect_size, v2d_pattern_repeat_size, color1, color2) => {
        

        const rgb = pb.ta_rgb;

        //rgb2[0] = color2[0];
        //rgb2[1] = color2[1];
        //rgb2[2] = color2[2];

        let x, y;

        const draw_row = () => {
            // repeating on, off...?

            //console.log('draw_row y', y);

            let toggler = (y % 2) === 1;
            //console.log('toggler', toggler);

            // then off and on, draw the rect in place at given size and color.

            // go through the x values....

            //  later, will do this in C++ too.
            //   see how much faster the compiled server examples are.

            for (x = 0; x < v2d_pattern_repeat_size[0]; x++) {
                if (toggler) {

                    rgb[0] = color1[0];
                    rgb[1] = color1[1];
                    rgb[2] = color1[2];
                    // draw the rect.
                    //  lower level draw solid rect function.
                    //   np - no params?
                    //   np or !p for parameterless functions? May be fastest to run.

                    // setup values before solid rect fill.

                    // do the solid rect fill fn.
                    


                } else {
                    rgb[0] = color2[0];
                    rgb[1] = color2[1];
                    rgb[2] = color2[2];
                }
                ta_bounds[0] = start_pos[0] + (x * rect_size[0]);
                ta_bounds[1] = start_pos[1] + (y * rect_size[1]);
                ta_bounds[2] = start_pos[0] + ((x + 1) * rect_size[0]);
                ta_bounds[3] = start_pos[1] + ((y + 1) * rect_size[1]);

                //console.log('ta_bounds', ta_bounds);
                pb.fill_solid_rect_by_bounds();

                toggler = !toggler;
            }
        }

        for (y = 0; y < v2d_pattern_repeat_size[1]; y++) {
            draw_row();
        }




    }

    const alternating_rect_pattern = (start_pos, rect_size, v2d_pattern_repeat_size, color) => {

        // so, will set a bounds value for every rect before its drawn.

        const rgb = pb.ta_rgb;

        
        rgb[0] = color[0];
        rgb[1] = color[1];
        rgb[2] = color[2];

        // do multiple rows of the pattern.
        //  on and off toggle depends on if its an odd or even row.

        // iterate through v2d_pattern_repeat_size

        // will have a byte write pointer too...?
        //  or better to make use of the fill_solid_rect_by_bounds() function that handles all of that?
        //   ^ do that for the moment.

        // will need to set up the rect bounds.
        //  may be able to do that using pos and size.



        // maybe a draw rect using size function?
        //  






        // use a scratch pos?
        //  pos iterator ta? pos iteration ta?



        let x, y;

        const draw_row = () => {
            // repeating on, off...?

            //console.log('draw_row y', y);

            let toggler = (y % 2) === 1;
            //console.log('toggler', toggler);

            // then off and on, draw the rect in place at given size and color.

            // go through the x values....

            //  later, will do this in C++ too.
            //   see how much faster the compiled server examples are.

            for (x = 0; x < v2d_pattern_repeat_size[0]; x++) {
                if (toggler) {
                    // draw the rect.
                    //  lower level draw solid rect function.
                    //   np - no params?
                    //   np or !p for parameterless functions? May be fastest to run.

                    // setup values before solid rect fill.

                    // do the solid rect fill fn.
                    ta_bounds[0] = start_pos[0] + (x * rect_size[0]);
                    ta_bounds[1] = start_pos[1] + (y * rect_size[1]);
                    ta_bounds[2] = start_pos[0] + ((x + 1) * rect_size[0]);
                    ta_bounds[3] = start_pos[1] + ((y + 1) * rect_size[1]);

                    //console.log('ta_bounds', ta_bounds);
                    pb.fill_solid_rect_by_bounds();


                }

                toggler = !toggler;
            }




            //if (toggler) {

            //}



        }

        for (y = 0; y < v2d_pattern_repeat_size[1]; y++) {

            // draw a row of the pattern.

            
            draw_row();

        }


    }

    // alternating_rect_pattern = (start_pos, rect_size, v2d_pattern_repeat_size, color)

    // use a scratch ta pos.

    const ta_pos = pb.ta_pos_scratch;

    ta_pos[0] = 12;
    ta_pos[1] = 12;
    //console.log('ta_pos', ta_pos);

    // rect size - a 2d vector. a ta_size_scratch or ta_size even.

    const ta_size = pb.ta_size_scratch;
    ta_size[0] = 16;
    ta_size[1] = 16;

    //console.log('ta_size', ta_size);

    // v2d_pattern_repeat_size - make it 4x4

    const v2d_pattern_repeat_size = pb.ta_size2_scratch;
    v2d_pattern_repeat_size[0] = 4;
    v2d_pattern_repeat_size[1] = 4;

    //console.log('v2d_pattern_repeat_size', v2d_pattern_repeat_size);

    // make it black / dark red.

    rgb[0] = 0;
    rgb[1] = 0;
    rgb[2] = 0;

    //console.log('rgb', rgb);


    // returns the full size / bounds of the pattern?
    //  returning the bounds covered may make sense.

    alternating_rect_pattern(ta_pos, ta_size, v2d_pattern_repeat_size, rgb);
    ta_pos[0] += 64;
    ta_size[0] = 8;
    ta_size[1] = 8;
    v2d_pattern_repeat_size[0] = 8;
    v2d_pattern_repeat_size[1] = 8;
    alternating_rect_pattern(ta_pos, ta_size, v2d_pattern_repeat_size, rgb);
    ta_pos[0] += 64;
    ta_size[0] = 4;
    ta_size[1] = 4;
    v2d_pattern_repeat_size[0] = 16;
    v2d_pattern_repeat_size[1] = 16;
    alternating_rect_pattern(ta_pos, ta_size, v2d_pattern_repeat_size, rgb);
    ta_pos[0] += 64;
    ta_size[0] = 2;
    ta_size[1] = 2;
    v2d_pattern_repeat_size[0] = 32;
    v2d_pattern_repeat_size[1] = 32;
    alternating_rect_pattern(ta_pos, ta_size, v2d_pattern_repeat_size, rgb);
    ta_pos[0] += 64;
    ta_size[0] = 1;
    ta_size[1] = 1;
    v2d_pattern_repeat_size[0] = 64;
    v2d_pattern_repeat_size[1] = 64;
    alternating_rect_pattern(ta_pos, ta_size, v2d_pattern_repeat_size, rgb);


    // And lets try a red and yellow pattern below.

    ta_pos[0] -= 256;
    ta_pos[1] += 64;

    rgb[0] = 255;
    rgb[1] = 0;
    rgb[2] = 0;

    rgb2[0] = 255;
    rgb2[1] = 255;
    rgb2[2] = 0;

    const draw_row_2col_pattern = () => {

        ta_size[0] = 16;
        ta_size[1] = 16;
        v2d_pattern_repeat_size[0] = 4;
        v2d_pattern_repeat_size[1] = 4;

        alternating_2col_rect_pattern(ta_pos, ta_size, v2d_pattern_repeat_size, rgb, rgb2);
        ta_pos[0] += 64;
        ta_size[0] = 8;
        ta_size[1] = 8;
        v2d_pattern_repeat_size[0] = 8;
        v2d_pattern_repeat_size[1] = 8;
        alternating_2col_rect_pattern(ta_pos, ta_size, v2d_pattern_repeat_size, rgb, rgb2);
        ta_pos[0] += 64;
        ta_size[0] = 4;
        ta_size[1] = 4;
        v2d_pattern_repeat_size[0] = 16;
        v2d_pattern_repeat_size[1] = 16;
        alternating_2col_rect_pattern(ta_pos, ta_size, v2d_pattern_repeat_size, rgb, rgb2);
        ta_pos[0] += 64;
        ta_size[0] = 2;
        ta_size[1] = 2;
        v2d_pattern_repeat_size[0] = 32;
        v2d_pattern_repeat_size[1] = 32;
        alternating_2col_rect_pattern(ta_pos, ta_size, v2d_pattern_repeat_size, rgb, rgb2);
        ta_pos[0] += 64;
        ta_size[0] = 1;
        ta_size[1] = 1;
        v2d_pattern_repeat_size[0] = 64;
        v2d_pattern_repeat_size[1] = 64;
        alternating_2col_rect_pattern(ta_pos, ta_size, v2d_pattern_repeat_size, rgb, rgb2);

        ta_pos[0] -= 256;
        ta_pos[1] += 64;

    }

    draw_row_2col_pattern();
    rgb2[0] = 0;
    draw_row_2col_pattern();


    // then complete this row of 2 color.

    // maybe make 2col pattern row (height 64) function?


    // Function to draw a triangle as well?
    //  There may be some good integer math that avoids some trig.
    //  Trig could be sped up with lookup tables too. Could work well with integers that way.
    //   Big ints storing small but precise decimal fractions? int32 doing this, eg down to the thousanth, or less?

    // This patch image is a good enough test preparation for the moment.
    //  Interestingly, it contains no blue. Can check that the results contain no blue, and also think of functions that look at color distribution.
    //   Clustering and quantizing.


    // Worth using this patch image to test convolutions and similar.

    // Generating multiple convolution results from a single source?

    // using the .source property to run a convolution from it.
    //  Maybe will have an array of PB_Process objects / functions.
    //   PB_Convolve would be a subclass.
    //   We make a new PB that's a window_to another pb (change to 'source' property?)
    //    Set the convolution. That convolution gets run upon copy.
    ///    Or the convolution chain...

    // Want to be able to control and do the convolutions on a lower level where possible.
    //  That would mean function that apply a conv to a ta. ta_source, ta_dest, bypp, ta_conv
    //   Number of channels... need to consider multi-channel convolutions.

    /*
        Beware of the difference in convolutions for CNN and image pre-processing (like Gaussian Blur)! The former apply a 'deep' Kernel (with different filters for each channel), then effectively sum up the output matrices (along with a bias terms) to yield a single-channel feature map. Whereas the 'blurring' of the RGB image yields the filtered RGB image back by applying the same filters to each channel and nothing more.
        TLDR: Convolve rgb channels separately.
    */

    // Worth trying the moving window system...
    //  Worth doing it on separate channels?


    // Maybe having 8 bipp pbs acting as windows to a single channel of 24 bipp?
    //  Possibly that will be faster for convolutions?


    // Let's try multi-channel convolve with it arranged as - is though.
    //  Could write the output to the scratch ta.
    //  Then when it's done, copy it over to the main one.

    // Later, want to make Pixel_Buffer bind with a browser canvas (and node-canvas).




    // Then do it below with red and green.


    //  and it would take an rgb2 typed array color parameter.

    // Seems like these functions are all quite fast so far.

    // Interested in doing image resizing through (virtual floating point) pixel remapping. Calculating the proportions of each of the 4 (I think) possible pixels in the source that would contribute to it.
    //  Can use detailed and fast integer & float math for this.
    //   Could work out approx uint8 proportions per pixel from 0 to 255.

    // Anyway, lets do more of the square / rectangle pattern, in different colors.





    // alternating_2col_rect_pattern




    //alternating_rect_pattern()



    // set these, then do the fill solid rect by bounds

    //  calc_iteration_info_from_bounds
    //   calc_bounds_iteration.

    // a function to help iterate through bounds within this coord space would be very useful.
    //  preparation of the iteration variables.

    // Want to use the fastest, most highly optimized way to access the typed array and perform the operation.
    //  Maybe writing a solid row does make sense. If each row is the same....

    // the fill_solid_rect_by_bounds function would do the preparation / heavy lifting itself.
    // .fill_solid_rect_by_bounds()



    //pb.color_whole
    return pb;
}

module.exports = {
    patch_1: generate_tp1,
    generate_color_square: generate_color_square,
    generate_32x32_24bipp_pastel: generate_32x32_24bipp_pastel
}

if (require.main === module) {
    (async() => {

        const fnlfs = require('fnlfs');
        const sharp = require('sharp');

        // Set file paths here...?

        // The inversion is really fast even just in JS at about 15ms.
        //  Likely to be able to perform a load more functions in high speed.
        //  Then look into doing them faster still.

        
        const obs = new PerformanceObserver((items) => {
            console.log(items.getEntries()[0].duration, 'ms');
            performance.clearMarks();
        });
        obs.observe({ entryTypes: ['measure'] });



        const tp1 = generate_tp1();


        const color_square = generate_color_square();

        const square_32_pastel = generate_32x32_24bipp_pastel();

        // Also lets generate the color square example.

        // then save it.

        //console.log('tp1', tp1);

        // looks OK so far....

        await fnlfs.ensure_directory_exists('./output/create_eg_pbs/');


        const save_pixel_buffer_png = (path, pb) => {

            // Would work with other formats depending on the path.

            return new Promise((solve, jettison) => {


                console.log('pb', pb);
                console.log('Object.keys(pb)',  Object.keys(pb));

                console.log('pb.ta.length', pb.ta.length);

                const {meta} = pb;
                console.log('meta', meta);

                let channels;

                if (meta.bytes_per_pixel === 3 || meta.bytes_per_pixel === 4) {
                    channels = meta.bytes_per_pixel;
                }

                if (!channels) {
                    console.trace();
                    throw 'stop';
                }


                sharp(pb.ta, {
                    raw: {
                        width: meta.size[0],
                        height: meta.size[1],
                        channels: channels
                    }
                })
                    //.resize(320, 240)
                    .toFile(path, (err, info) => { 
                        if (err) {
                            throw err;
                        } else {
                            console.log('sharp save info', info);
                            console.log('should have saved to path: ' + path);

                            solve(true);
                        }

                    });

                //console.trace();
                //throw 'stop';


            });
            
            



        }

        const save_pixel_buffer = async(path, pb, options = {}) => {
            const {format} = options;

            if (format === 'png') {
                return save_pixel_buffer_png(path, pb);
            } else {
                console.trace();

                throw 'NYI';
            }

        }



        await save_pixel_buffer('./output/create_eg_pbs/patch1.png', tp1, {
            format: 'png'
        });
        await save_pixel_buffer('./output/create_eg_pbs/color_square.png', color_square, {
            format: 'png'
        });

        // Conversion to greyscale not working right now...
        //  Setting the bypp value would be a good shorthand that changes it to greyscale.




        tp1.bypp = 1;
        await save_pixel_buffer('./output/create_eg_pbs/gs_patch1.png', tp1, {
            format: 'png'
        });
        await save_pixel_buffer('./output/create_eg_pbs/square_32_pastel.png', square_32_pastel, {
            format: 'png'
        });


        //let res = await eg_win_to();
        //console.log('res eg_each_px', res);
    })();
}
