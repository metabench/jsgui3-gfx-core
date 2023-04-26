// Should probably write some smaller example to do with 1bpp masks and various operations with much smaller pixel buffers.





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

const obs = new PerformanceObserver((items) => {
  console.log(items.getEntries()[0].duration, 'ms');
  performance.clearMarks();
});
obs.observe({ entryTypes: ['measure'] });

// options
// max size
// reorient

// Should not require gfx-formats here.
//  This module needs to exist independently of it.


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




// Would be nice to have an example / test result IO framework.
//  Saved the output based on test_name, test_subname, test_number, test_subnumber, node_version, module_version, architecture
//   Checksum / private key signature. Public key?
//   Would be nice to hold a structure that could potentially hold a library of test and benchmark data.
//    Even the time of the test.
//    Could always save the test / example data.
//     Building it up in the repo would be useful too.
//     Tool to recieve / submit / sync test data.







const thresh = async() => {
    console.log('Erte Ale thresh example');
    const spb = await Server_Pixel_Buffer.load('../source_images/Erte Ale Volcano.jpg');
    const pb = copy_from_server_pb(spb);
    //console.log('pb', pb);
    //console.log('pb.bipp', pb.bipp);

    // Worth extracting the alpha channel.

    // pb.extract_channel(3)
    //  will help to inspect the alpha channel in this case.

    //const pb_alpha_channel = pb.extract_channel(3);
    //console.log('pb_alpha_channel.bipp', pb_alpha_channel.bipp);

    // Not really working right now....

    // then get the thresholded msk pb.
    // get_threshold_mask

    // get_fn_mask
    // function that operates on each pixel to make a mask. 

    // mask_each_px

    // allow the mask function to be provided.

    // So the mask getting and setting is not working correctly right now.
    //  Seems like it's worth trying with some smaller 1bipp images.

    // Could measure the threshold speed.
    //  Want to do more operations too.
    //  Set them up so that they are fast.
    //  It seems that some functions get optimized very well now.

    // How about splitting the rgb channels into 3 8 bit Pixel Buffers?
    //  Then could run separate thresholding on each of them.
    //   maybe even 0 to 255 on each of them.



    // const [pb_red, pb_green, pb_blue] = pb.get_split_rgb_channels();
    //  as 8 bits per pixel each.
    // could even see about class creation in c++?

    // Applying a convolution in C++ would be much faster too.
    //  It's worth building up to that type of functionality.




    // And could try functions in C++ that accelerate these.
    //  Also subset of js to C++ (kernel) compilation.
    performance.mark('A');
    const [r, g, b] = pb.split_rgb_channels;
    performance.mark('B');
    performance.measure('A to B', 'A', 'B');
    //console.log('post split_rgb_channels');

    // Save the split channels in a simple way together?
    // maybe would need to await their saving.

    // Nice if convolutions were to share cached ta objects between them too?
    //  Want to get this working really fast and effectively.



    // A convolution that will use a pixel buffer to act as a window where possible.
    //  direct reference typed array for the position
    //   how about the full bounds? pos of the window pixel buffer.

    // Make a pixel buffer a floating window of another.
    //  Could be a virtual pixel buffer even.

    // Then self_convolve_same_size???
    ///  ie if we hold the data to convolve in a small Pixel_Buffer, could we use it there.
    //   apply a convolution that's the same size as the Pixel_Buffer itself...?

    // A moving window with copy-over makes a lot of sense.
    //  Especially when wishing to pay attention to out-of-bounds pixels and their default colors.

    // Maybe worth putting some of these operations into new files?
    //  Though much of it should go in core really?
    //   Or do it more as mixins and then see if it should go in core, make it easier to swap versions / apis.



    // With the r component...
    //  Lets run a convolution on it
    //  Lets pass a convolution window over it.

    // Using a convolution window makes a lot of sense.
    //  Having an algorithm that moves it around and copies makes a lot of sense.
    //   Need to be careful about pixels out of bounds.

    // oob_px_color

    // have get_pixel return an oob color if out of bounds and oob_color is set?

    // Floating window, then move it.
    //  It would copy its data accross.
    //   It it gets / sets by refernce?

    // Floating_Window_Reference?
    //  So it would be a Pixel_Buffer by reference.












    

    // Then would be nice to get some thresholded 1bipp images from these channels.

    const rthresh = r.get_1bipp_threshold_8bipp(210);

    const thresh_24bipp = rthresh.to_24bipp();

    console.log('rthresh', rthresh);
    //throw 'stop';

    // Boolean Convolutions?
    //  Get a view of the pixels in the vacinity (maybe larger vacinity), mark each pixel as true or false.
    //   A form of information reduction, could take a fairly large amount of information into account.
    //    Some uses for feature detection.



    // A fast enough function for viewing a convolution window would be of use.
    //  Maybe best to have an array of the different slices of all the rows?
    //   Would not involve copying typed array data.

    // Also, the convolution_window function should present data that has not been modified from the convolution itself.

    // ta_self_scratch worth having a getter.

    // a moving convolution buffer would be useful.
    //  // will also update its position values.

    // Will try functions to get convolution windows as well.

    // It have 'next', being an iterator?

    // A callback for each pixel could work...

    // The overall for loop structure could be useful for inlining.
    //  

    // While loop through each pixel...?

    // Moving the whole window at once.
    //  Including the central pixel.

    // function to get / copy a convolution window makes a lot of sense.
    //  interested in small vector math here too.
    //  will be very much worth making and using small and efficient data structures.




    // Splitting the channels is nicely fast.
    //  Simple operation done in JS with simple and efficient code.

    await fnlfs.ensure_directory_exists('./output/threshold_to_1bpp/');


    // PNG definitely looks like the safer format for comparison of results.
    //  Be able to compare the decoded images to see if they are the same.
    //   Maybe better than checking the saved files are identical.



    await gfx.save_pixel_buffer('./output/threshold_to_1bpp/r_channel-erte_ale.png', r, {
        format: 'png'
    });
    await gfx.save_pixel_buffer('./output/threshold_to_1bpp/g_channel-erte_ale.png', g, {
        format: 'png'
    });
    await gfx.save_pixel_buffer('./output/threshold_to_1bpp/b_channel-erte_ale.png', b, {
        format: 'png'
    });
    await gfx.save_pixel_buffer('./output/threshold_to_1bpp/r_channel_thresh_24bipp_210-erte_ale.png', thresh_24bipp, {
        format: 'png'
    });

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

        /*

        for (let i_px = 0; i_px < px_count; i_px++) {
            // read the result pixel...?

            const px_res = res_pb_24bipp.get_pixel_by_idx(i_px);
            //console.log('px_res', px_res);

            //i_px += 1;

        }
        */



        //throw 'stop';






        // Try saving the mask?
        //  Iterating through it....

        // read the pixels by index...?
        //  as in by pixel index.





        //console.log('pb_1bipp_mask', pb_1bipp_mask);




        // Change the bits_per_pixel
        //  would automatically add the alpha channel with each of them as 255.

        // to greyscle could be done by setting the bits_per_pixel to 8

        // and could also have bits_per_pixel as 1.
        //  1 bit per pixel, should be done with operations that set a single bit.
        //  underlying clamped uint8 array.


        //(path, size_or_opts)
        //const pb = await Server_Pixel_Buffer.load('./source_images/Swiss Alps.jpg');
        //await pb.save('./source_images/saved-Swiss Alps.jpg');

        await gfx.save_pixel_buffer('./output/test_thresh-erte_ale.png', res_pb_24bipp, {
            format: 'png'
        });
        //pb.color_whole(124);
        //await gfx.save_pixel_buffer('./source_images/Swiss Alps.jpg', pb, {
        //    format: 'jpg'
        //});
    }

    
}

if (require.main === module) {
    (async() => {
        // Set file paths here...?
        let res = await thresh();
        console.log('res thresh', res);
    })();
}
