// Should probably write some smaller example to do with 1bpp masks and various operations with much smaller pixel buffers.

// Will have improved iteration methods - see byte_iteration_info.
//  Functions to provide the values for some really simple loop structures that are synced for the data being written / read.







const {
    prom_or_cb
} = require('fnl');

// could stream it.



const {
    PerformanceObserver,
    performance
} = require('perf_hooks');

const obs = new PerformanceObserver((items) => {
    console.log(items.getEntries()[0].duration, 'ms');
    performance.clearMarks();
});
obs.observe({
    entryTypes: ['measure']
});

// options
// max size
// reorient



// Copy the data over to and from a standard pixel buffer (non-server version)?

const Pixel_Buffer = require('../Pixel_Buffer');

//const {Pixel_Buffer} = gfx;

//const Server_Pixel_Buffer = gfx_server.Pixel_Buffer;




const eg_each_px = async () => {
    console.log('Erte Ale thresh example');
    const spb = await Server_Pixel_Buffer.load('../source_images/Erte Ale Volcano.jpg');
    //console.log('spb.ta', spb.ta);
    // Load JPEG as 24 bipp by default?


    const pb = copy_from_server_pb(spb);


    //console.log('pb.ta', pb.ta);
    //throw 'stop';


    //pb.bipp = 24;
    //  cool inner coding should make that work.
    //   change_bits_per_pixel
    //    and likely a variety of change_from_1bipp_to_32bipp type functions.
    //     could be a bunch of them with fast and specific internal implementations.
    //     I think this style will make good use of the JS compiler's own polymorphism and monomorphism.







    // then run each_px
    //console.log('pb.bits_per_pixel', pb.bits_per_pixel);
    //pb.bits_per_pixel = 24;
    //console.log('pb.bits_per_pixel', pb.bits_per_pixel);

    const ta_pos = new Uint16Array(2);
    const ta_px_value = new Uint8ClampedArray(3);
    const ta_info = new Uint32Array(4);

    // And that should be enough to do a fast iteration over the whole image in terms of data allocation.
    //  Could do multiple iterations without needing to reallocate, by reusing these structures.

    // Let's see about using this to get really high perf in both JavaScript and C++.


    // should probably have each_px_8bipp for example.
    //  would make sense to do that to work most efficiently.

    // Could do some things that will rely on each px.
    //  Beginning of code that goes into core, enh, or some kind og plugin / mixin / addon system.

    // Worth looking into node worker threads too.
    //  Relatively simple algorithm / kernel / function processing.
    // will call specific function depending on the bipp.

    // A function that involves updates would be nice as well.
    //  Not so sure about direct access to the pixel...?
    //   An update function could be OK. Seems to be fast in the right cases / style.
    //    Maybe not the best style but it's logical when necessary.








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

        // Image not loaded properly at the start?
        //  May need to replace the ta.

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


        (async () => {
            // Save the inverted volcano file.

            // Soon worth doing some experiments with C++.
            //  Probably worth getting optimized convolutions working in JS first though.

            await gfx.save_pixel_buffer('./output/each_px_inverted-erte_ale.png', pb, {
                format: 'png'
            });



        })();


    }
    invert();




    // 14 ms - its still fast even with adding up an average.




    const eg_split_thresh = () => {
        performance.mark('A');

        const [r, g, b] = pb.split_rgb_channels;
        performance.mark('B');
        performance.measure('A to B', 'A', 'B');
        const rthresh = r.get_1bipp_threshold_8bipp(210);
        const thresh_24bipp = rthresh.to_24bipp();
    }


    const save_egs = async () => {
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

    const general_px_mask_eg = async () => {
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


        const save = async () => {
            await gfx.save_pixel_buffer('./output/test_thresh-erte_ale.png', res_pb_24bipp, {
                format: 'png'
            });
        }




    }

    
}


if (require.main === module) {
    (async () => {
        // Set file paths here...?

        // The inversion is really fast even just in JS at about 15ms.
        //  Likely to be able to perform a load more functions in high speed.
        //  Then look into doing them faster still.


        // Should not need server-side capability.





        let res = await eg_each_px();
        console.log('res eg_each_px', res);
    })();
}