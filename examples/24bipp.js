

const Pixel_Buffer = require('../pixel-buffer');

const sharp = require('sharp');

if (require.main === module) {
    const lg = console.log;

    // go through list of functions....

    (async() => {


        const save_pixel_buffer_png = (path, pb) => {

            // Would work with other formats depending on the path.

            return new Promise((solve, jettison) => {


                //console.log('pb', pb);
                //console.log('Object.keys(pb)',  Object.keys(pb));

                //console.log('pb.ta.length', pb.ta.length);

                const {meta} = pb;
                //console.log('meta', meta);

                let channels;

                if (meta.bytes_per_pixel === 3 || meta.bytes_per_pixel === 4) {
                    channels = meta.bytes_per_pixel;
                }
                if (meta.bytes_per_pixel === 1) {
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
                            //console.log('sharp save info', info);
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


        const run_examples = async() => {
            lg('Begin run examples');

            // A list of example functions. array.

            const examples = [
                async() => {
                    // just lg for log???
                    lg('Begin example 0');
                    // Change it to 1 bit per pixel.
                    // Maybe make a new 1 bit per pixel pixel buffer, and do some manipulations on it.
                    // Could make them small, such as 8 * 8, meaning 8 bytes. That would be a good starting point because each row is
                    //  1 byte.
                    // Can also try and test some set pixel and get pixel methods. See that it works with code on a small scale.
                    //  Then could work on expanding the scale once some maths has been better implemented and understood.

                    const pb = new Pixel_Buffer({
                        bits_per_pixel: 24,
                        size: [8, 8]
                    });

                    // set_pixel(3, 3, 1);  // This could actually be faster though?
                    // set_pixel([3, 3], 1);
                    // set_pixel(ta_pos, 1);

                    /*

                    const ta_pos = new Uint16Array(2);
                    //console.log('pb.ta', pb.ta);

                    ta_pos[0] = 0;
                    ta_pos[1] = 0;
                    pb.set_pixel(ta_pos, 127);

                    ta_pos[0] = 3;
                    ta_pos[1] = 3;

                    // Adding or subtracting the significance of the bit would be a good way to do it.
                    //  Reference an array of bit signigicances. Modify the number. Don't try to directly access the bits.
                    //  Will have simpler JS code this way. Could then maybe make bit manipulation system.

                    pb.set_pixel(ta_pos, 127);
                    ta_pos[0] = 4;
                    pb.set_pixel(ta_pos, 127);

                    // output as PNG?
                    //  as bmp?
                    //console.log('pb.ta', pb.ta);

                    //console.log('pb.num_px', pb.num_px);

                    */

                    pb.draw_polygon([[1, 1,], [5, 1], [5, 6], [1, 6]], [255, 80, 70], true);



                    // then try changing it to 24bpp...

                    //const pb24 = pb.to_24bipp();
                    //console.log('pb24.ta', pb24.ta);

                    // See about giving Sharp a 1 bit per pixel image.

                    // Want to use this as a result for thresholding an image.
                    //  new_pb_threshold(threshold value)

                    // or a more flexible functional mask.

                    await save_pixel_buffer('./pb24_eg0.png', pb, {format: 'png'});



                    // Will do individual set pixel and get pixel functions.
                    //  Treat input using truthy or falsy.

                    // if ... == true.
                    lg('End example 0');
                },
                async() => {
                    // just lg for log???
                    lg('Begin example 1');

                    // Filled shapes.
                    //  Drawing filled polygons of a given color

                    // Should use 1bipp shape compositing.
                    // Drawing a filled polygon of a given color will first create the filled polygon at 1bipp, then copy it into place in the correct color.
                    





                    


                    lg('End example 1');
                }
                // Thresholding image(s) to obtain 1bipp masks.
                //  Then later will test the accelerated server versions of it. Will try WASM acceleration too.

            ]

            const l = examples.length;
            for (var c = 0; c < l; c++) {
                const res_eg = await examples[c]();
                console.log('res_eg ' + c + ':', res_eg);
            }

            lg('End run examples');

        }

        await run_examples();
    })();



}