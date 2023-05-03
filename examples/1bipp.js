

const Pixel_Buffer = require('../pixel-buffer');

const sharp = require('sharp');

if (require.main === module) {
    const lg = console.log;

    // go through list of functions....

    (async() => {
        const run_examples = async() => {
            lg('Begin run examples');


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
                        bits_per_pixel: 1,
                        size: [8, 8]
                    });

                    // set_pixel(3, 3, 1);  // This could actually be faster though?
                    // set_pixel([3, 3], 1);
                    // set_pixel(ta_pos, 1);

                    const ta_pos = new Uint16Array(2);
                    //console.log('pb.ta', pb.ta);

                    ta_pos[0] = 0;
                    ta_pos[1] = 0;
                    pb.set_pixel(ta_pos, 1);

                    ta_pos[0] = 3;
                    ta_pos[1] = 3;

                    // Adding or subtracting the significance of the bit would be a good way to do it.
                    //  Reference an array of bit signigicances. Modify the number. Don't try to directly access the bits.
                    //  Will have simpler JS code this way. Could then maybe make bit manipulation system.

                    pb.set_pixel(ta_pos, 1);
                    ta_pos[0] = 4;
                    pb.set_pixel(ta_pos, 1);

                    // output as PNG?
                    //  as bmp?
                    //console.log('pb.ta', pb.ta);

                    //console.log('pb.num_px', pb.num_px);

                    // then try changing it to 24bpp...

                    //const pb24 = pb.to_24bipp();
                    //console.log('pb24.ta', pb24.ta);

                    //const pb24 = pb.to_24bipp();
                    //console.log('pb24.ta.length', pb24.ta.length);

                    const pb8 = pb.to_8bipp();
                    //console.log('pb8.ta.length', pb8.ta.length);

                    await save_pixel_buffer('./pb1_pb8_eg0.png', pb8, {format: 'png'});

                    // Nice, this works. Could soon use this for come image composition.

                    // Could save it here with sharp.
                    // See about giving Sharp a 1 bit per pixel image.

                    // Want to use this as a result for thresholding an image.
                    //  new_pb_threshold(threshold value)

                    // or a more flexible functional mask.

                    // Will do individual set pixel and get pixel functions.
                    //  Treat input using truthy or falsy.

                    // if ... == true.
                    lg('End example 0');
                },
                async() => {
                    // just lg for log???
                    lg('Begin example 1');

                    const pb = new Pixel_Buffer({
                        bits_per_pixel: 1,
                        size: [21, 21]
                    });

                    // But if we fill it...?

                    pb.draw_polygon([[1, 1,], [15, 4], [15, 15], [4, 15]], 1);

                    const pb_polygon_edge = pb.clone();


                    pb.flood_fill(0, 0, 1);

                    // then invert it.
                    //  can simply apply not to all bytes when 1bipp

                    pb.invert();
                    pb.or(pb_polygon_edge);


                    const pb8 = pb.to_8bipp();
                    //console.log('pb8.ta.length', pb8.ta.length);

                    await save_pixel_buffer('./pb1_pb8_eg1.png', pb8, {format: 'png'});
                    


                    lg('End example 1');
                },
                async() => {
                    // just lg for log???
                    lg('Begin example 2');

                    const pb = new Pixel_Buffer({
                        bits_per_pixel: 1,
                        size: [21, 21]
                    });

                    // But if we fill it...?

                    pb.draw_polygon([[1, 1,], [15, 4], [15, 15], [4, 15]], 1, false);

                    


                    const pb8 = pb.to_8bipp();
                    //console.log('pb8.ta.length', pb8.ta.length);

                    await save_pixel_buffer('./pb1_pb8_eg2.png', pb8, {format: 'png'});
                    


                    lg('End example 2');
                },
                async() => {
                    // just lg for log???
                    lg('Begin example 3');

                    // Need to round the size of ta up to the nearest byte.


                    // Seems like there may be a problem somewhere within get_pixel for 1bipp.




                    /*

                    

                    const pb = new Pixel_Buffer({
                        bits_per_pixel: 1,
                        size: [9, 9]
                    });

                    let p1;

                    let pos = [1, 0];
                    pb.set_pixel(pos, 1);
                    console.log('pb.ta', pb.ta);
                    p1 = pb.get_pixel(pos);
                    console.log('p1', p1);


                    pos = [2, 0];
                    pb.set_pixel(pos, 1);
                    console.log('pb.ta', pb.ta);
                    p1 = pb.get_pixel(pos);
                    console.log('p1', p1);

                    pos = [3, 0];
                    pb.set_pixel(pos, 1);
                    console.log('pb.ta', pb.ta);
                    p1 = pb.get_pixel(pos);
                    console.log('p1', p1);

                    pos = [1, 1];
                    pb.set_pixel(pos, 1);
                    console.log('pb.ta', pb.ta);
                    p1 = pb.get_pixel(pos);
                    console.log('p1', p1);

                    pos = [2, 1];
                    pb.set_pixel(pos, 1);
                    console.log('pb.ta', pb.ta);
                    p1 = pb.get_pixel(pos);
                    console.log('p1', p1);

                    pos = [3, 1];
                    pb.set_pixel(pos, 1);
                    console.log('pb.ta', pb.ta);
                    p1 = pb.get_pixel(pos);
                    console.log('p1', p1);

                    pos = [8, 1];
                    console.log('pos', pos);
                    pb.set_pixel(pos, 1);
                    console.log('pb.ta', pb.ta);
                    p1 = pb.get_pixel(pos);
                    console.log('p1', p1);

                    pos = [8, 8];
                    console.log('pos', pos);
                    pb.set_pixel(pos, 1);
                    console.log('pb.ta', pb.ta);
                    p1 = pb.get_pixel(pos);
                    console.log('p1', p1);

                    */

                    

                    


                    

                    /*

                    const pb = new Pixel_Buffer({
                        bits_per_pixel: 1,
                        size: [21, 21]
                    });

                    // But if we fill it...?

                    pb.draw_polygon([[1, 1,], [15, 4], [15, 15], [4, 15]], 1, true);

                    


                    const pb8 = pb.to_8bipp();
                    //console.log('pb8.ta.length', pb8.ta.length);

                    await save_pixel_buffer('./pb1_pb8_eg3.png', pb8, {format: 'png'});
                    
                    */


                    const pb = new Pixel_Buffer({
                        bits_per_pixel: 1,
                        size: [5, 5]
                    });

                    // But if we fill it...?

                    pb.draw_polygon([[1, 1,], [3, 1], [3, 3], [1, 3]], 1, false);

                    


                    let pb8 = pb.to_8bipp();
                    //console.log('pb8.ta.length', pb8.ta.length);

                    await save_pixel_buffer('./pb1_pb8_eg3a.png', pb8, {format: 'png'});



                    const pb2 = new Pixel_Buffer({
                        bits_per_pixel: 1,
                        size: [5, 5]
                    });

                    pb2.place_image_from_pixel_buffer(pb, [0, 0]);

                    pb8 = pb2.to_8bipp();
                    //console.log('pb8.ta.length', pb8.ta.length);

                    await save_pixel_buffer('./pb1_pb8_eg3b.png', pb8, {format: 'png'});


                    lg('End example 3');
                },
                async() => {
                    // just lg for log???
                    lg('Begin example 4');

                    // Need to round the size of ta up to the nearest byte.


                    // Seems like there may be a problem somewhere within get_pixel for 1bipp.




                    /*

                    

                    const pb = new Pixel_Buffer({
                        bits_per_pixel: 1,
                        size: [9, 9]
                    });

                    let p1;

                    let pos = [1, 0];
                    pb.set_pixel(pos, 1);
                    console.log('pb.ta', pb.ta);
                    p1 = pb.get_pixel(pos);
                    console.log('p1', p1);


                    pos = [2, 0];
                    pb.set_pixel(pos, 1);
                    console.log('pb.ta', pb.ta);
                    p1 = pb.get_pixel(pos);
                    console.log('p1', p1);

                    pos = [3, 0];
                    pb.set_pixel(pos, 1);
                    console.log('pb.ta', pb.ta);
                    p1 = pb.get_pixel(pos);
                    console.log('p1', p1);

                    pos = [1, 1];
                    pb.set_pixel(pos, 1);
                    console.log('pb.ta', pb.ta);
                    p1 = pb.get_pixel(pos);
                    console.log('p1', p1);

                    pos = [2, 1];
                    pb.set_pixel(pos, 1);
                    console.log('pb.ta', pb.ta);
                    p1 = pb.get_pixel(pos);
                    console.log('p1', p1);

                    pos = [3, 1];
                    pb.set_pixel(pos, 1);
                    console.log('pb.ta', pb.ta);
                    p1 = pb.get_pixel(pos);
                    console.log('p1', p1);

                    pos = [8, 1];
                    console.log('pos', pos);
                    pb.set_pixel(pos, 1);
                    console.log('pb.ta', pb.ta);
                    p1 = pb.get_pixel(pos);
                    console.log('p1', p1);

                    pos = [8, 8];
                    console.log('pos', pos);
                    pb.set_pixel(pos, 1);
                    console.log('pb.ta', pb.ta);
                    p1 = pb.get_pixel(pos);
                    console.log('p1', p1);

                    */

                    

                    


                    

                    
                    /*

                    const pb = new Pixel_Buffer({
                        bits_per_pixel: 1,
                        size: [21, 21]
                    });

                    // But if we fill it...?

                    pb.draw_polygon([[1, 1,], [15, 4], [15, 15], [4, 15]], 1, true);

                    */



                    let pb = new Pixel_Buffer({
                        bits_per_pixel: 1,
                        size: [5, 5]
                    });

                    // But if we fill it...?

                    pb.draw_polygon([[1, 1,], [3, 1], [3, 3], [1, 3]], 1, false);
                    


                    let pb8 = pb.to_8bipp();
                    //console.log('pb8.ta.length', pb8.ta.length);

                    await save_pixel_buffer('./pb1_pb8_eg4a.png', pb8, {format: 'png'});

                    




                    pb = new Pixel_Buffer({
                        bits_per_pixel: 1,
                        size: [5, 5]
                    });

                    // But if we fill it...?

                    pb.draw_polygon([[1, 1,], [3, 1], [3, 3], [1, 3]], 1, true);
                    


                    pb8 = pb.to_8bipp();
                    //console.log('pb8.ta.length', pb8.ta.length);

                    await save_pixel_buffer('./pb1_pb8_eg4b.png', pb8, {format: 'png'});

                    
                    


                    


                    lg('End example 4');
                },
                async() => {
                    // just lg for log???
                    lg('Begin example 5');

                    // Need to round the size of ta up to the nearest byte.


                    // Seems like there may be a problem somewhere within get_pixel for 1bipp.




                    /*

                    

                    const pb = new Pixel_Buffer({
                        bits_per_pixel: 1,
                        size: [9, 9]
                    });

                    let p1;

                    let pos = [1, 0];
                    pb.set_pixel(pos, 1);
                    console.log('pb.ta', pb.ta);
                    p1 = pb.get_pixel(pos);
                    console.log('p1', p1);


                    pos = [2, 0];
                    pb.set_pixel(pos, 1);
                    console.log('pb.ta', pb.ta);
                    p1 = pb.get_pixel(pos);
                    console.log('p1', p1);

                    pos = [3, 0];
                    pb.set_pixel(pos, 1);
                    console.log('pb.ta', pb.ta);
                    p1 = pb.get_pixel(pos);
                    console.log('p1', p1);

                    pos = [1, 1];
                    pb.set_pixel(pos, 1);
                    console.log('pb.ta', pb.ta);
                    p1 = pb.get_pixel(pos);
                    console.log('p1', p1);

                    pos = [2, 1];
                    pb.set_pixel(pos, 1);
                    console.log('pb.ta', pb.ta);
                    p1 = pb.get_pixel(pos);
                    console.log('p1', p1);

                    pos = [3, 1];
                    pb.set_pixel(pos, 1);
                    console.log('pb.ta', pb.ta);
                    p1 = pb.get_pixel(pos);
                    console.log('p1', p1);

                    pos = [8, 1];
                    console.log('pos', pos);
                    pb.set_pixel(pos, 1);
                    console.log('pb.ta', pb.ta);
                    p1 = pb.get_pixel(pos);
                    console.log('p1', p1);

                    pos = [8, 8];
                    console.log('pos', pos);
                    pb.set_pixel(pos, 1);
                    console.log('pb.ta', pb.ta);
                    p1 = pb.get_pixel(pos);
                    console.log('p1', p1);

                    */

                    

                    


                    

                    
                    /*

                    const pb = new Pixel_Buffer({
                        bits_per_pixel: 1,
                        size: [21, 21]
                    });

                    // But if we fill it...?

                    pb.draw_polygon([[1, 1,], [15, 4], [15, 15], [4, 15]], 1, true);

                    */



                    const pb = new Pixel_Buffer({
                        bits_per_pixel: 1,
                        size: [9, 9]
                    });

                    // But if we fill it...?

                    pb.draw_polygon([[1, 1,], [5, 1], [5, 6], [1, 6]], 1, true);
                    


                    const pb8 = pb.to_8bipp();
                    //console.log('pb8.ta.length', pb8.ta.length);

                    await save_pixel_buffer('./pb1_pb8_eg5.png', pb8, {format: 'png'});
                    
                    


                    


                    lg('End example 5');
                },
                async() => {
                    // just lg for log???
                    lg('Begin example 6');

                    // Need to round the size of ta up to the nearest byte.


                    // Seems like there may be a problem somewhere within get_pixel for 1bipp.




                    /*

                    

                    const pb = new Pixel_Buffer({
                        bits_per_pixel: 1,
                        size: [9, 9]
                    });

                    let p1;

                    let pos = [1, 0];
                    pb.set_pixel(pos, 1);
                    console.log('pb.ta', pb.ta);
                    p1 = pb.get_pixel(pos);
                    console.log('p1', p1);


                    pos = [2, 0];
                    pb.set_pixel(pos, 1);
                    console.log('pb.ta', pb.ta);
                    p1 = pb.get_pixel(pos);
                    console.log('p1', p1);

                    pos = [3, 0];
                    pb.set_pixel(pos, 1);
                    console.log('pb.ta', pb.ta);
                    p1 = pb.get_pixel(pos);
                    console.log('p1', p1);

                    pos = [1, 1];
                    pb.set_pixel(pos, 1);
                    console.log('pb.ta', pb.ta);
                    p1 = pb.get_pixel(pos);
                    console.log('p1', p1);

                    pos = [2, 1];
                    pb.set_pixel(pos, 1);
                    console.log('pb.ta', pb.ta);
                    p1 = pb.get_pixel(pos);
                    console.log('p1', p1);

                    pos = [3, 1];
                    pb.set_pixel(pos, 1);
                    console.log('pb.ta', pb.ta);
                    p1 = pb.get_pixel(pos);
                    console.log('p1', p1);

                    pos = [8, 1];
                    console.log('pos', pos);
                    pb.set_pixel(pos, 1);
                    console.log('pb.ta', pb.ta);
                    p1 = pb.get_pixel(pos);
                    console.log('p1', p1);

                    pos = [8, 8];
                    console.log('pos', pos);
                    pb.set_pixel(pos, 1);
                    console.log('pb.ta', pb.ta);
                    p1 = pb.get_pixel(pos);
                    console.log('p1', p1);

                    */

                    

                    


                    

                    
                    

                    const pb = new Pixel_Buffer({
                        bits_per_pixel: 1,
                        size: [21, 21]
                    });

                    // But if we fill it...?

                    pb.draw_polygon([[1, 1,], [15, 4], [15, 15], [4, 15]], 1, true);

                    



                   
                    


                    const pb8 = pb.to_8bipp();
                    //console.log('pb8.ta.length', pb8.ta.length);

                    await save_pixel_buffer('./pb1_pb8_eg6.png', pb8, {format: 'png'});
                    
                    


                    


                    lg('End example 6');

                },
                async() => {
                    // just lg for log???
                    lg('Begin example 7');

                    const pb = new Pixel_Buffer({
                        bits_per_pixel: 1,
                        size: [2000, 2000]
                    });

                    // But if we fill it...?

                    // Drawing the mask of the polygon takes a little while.
                    //  Flood fill from outside is nicely fast while drawing this polygon.
                    //   That is because it is square.

                    // A more radial-star shape would be slower.
                    //  Or a more complex shape.

                    pb.draw_polygon([[50, 50,], [1500, 50], [1500, 1500], [50, 1500]], 1, true);

                    const pb8 = pb.to_8bipp();
                    //console.log('pb8.ta.length', pb8.ta.length);

                    await save_pixel_buffer('./pb1_pb8_eg7.png', pb8, {format: 'png'});
                    
                    


                    


                    lg('End example 7');

                },
                async() => {
                    // just lg for log???
                    lg('Begin example 8');

                    const pb = new Pixel_Buffer({
                        bits_per_pixel: 1,
                        size: [2000, 2000]
                    });

                    // But if we fill it...?

                    // Drawing the mask of the polygon takes a little while.
                    //  Flood fill from outside is nicely fast while drawing this polygon.
                    //   That is because it is square.

                    // A more radial-star shape would be slower.
                    //  Or a more complex shape.

                    // So yes, this flood fill from outside operation is considerably slower.
                    //  A highly optimised way to do this would be useful.
                    //  Be careful not to delete working code until it is obselete.
                    //   Worth retaining less optimised but clearer and more concise code.
                    //    May be effective as default cases, may be a better representation of algorithm for human understanding.
                    //     May be a 'reference implementation'.


                    pb.draw_polygon([[900, 900,], [200, 200], [1000, 900], [1600, 200], [1000, 1000], [1100, 800], [1000, 1100], [1000, 1600], [900, 1600]], 1, true);

                    const pb8 = pb.to_8bipp();
                    //console.log('pb8.ta.length', pb8.ta.length);

                    await save_pixel_buffer('./pb1_pb8_eg8.png', pb8, {format: 'png'});

                    


                    lg('End example 8');

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