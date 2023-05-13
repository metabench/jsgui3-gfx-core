

const Pixel_Buffer = require('../pixel-buffer');

const sharp = require('sharp');

if (require.main === module) {
    const lg = console.log;

    // go through list of functions....

    (async() => {
        const run_examples = async() => {
            lg('Begin run examples');

            let size_limit = 'small';

            // May want cases that test 64 pixels being read / written at once....
            //  Have seen a great speedup for some masking operations (incl drawing filled shapes).
            //  Need to speed up draw_1bipp_pixel_buffer_mask
            //   Probably use the x on spans.
            //    Will also see about a more efficient iterator that does not generate the result array.
            //     Could just return results (in a ta) representing 1 span at a time [x1, x2, y].



            //let size_limit = 'huge';


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
                    lg('End example 0\n');
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
                    


                    lg('End example 1\n');
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
                    


                    lg('End example 2\n');
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

                    // Not so sure we need this function so much.
                    pb2.place_image_from_pixel_buffer(pb, [0, 0]);

                    pb8 = pb2.to_8bipp();
                    //console.log('pb8.ta.length', pb8.ta.length);

                    await save_pixel_buffer('./pb1_pb8_eg3b.png', pb8, {format: 'png'});


                    lg('End example 3\n');
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
                    //  Fails without a working draw_1bipp_pixel_buffer_mask

                    pb.draw_polygon([[1, 1,], [3, 1], [3, 3], [1, 3]], 1, true);


                    // check the x on spans....

                    let start = process.hrtime();
                    let pb_ar_rows_xonspans = pb.calculate_arr_rows_arr_x_on_spans_1bipp();

                    let end = process.hrtime(start);

                    let timeInNanos = end[0] * 1e9 + end[1];
                    

                    // Seems to get them wrong, missing out a central 'off' spot.
                    //  Need to fix that.
                    console.log('pb_ar_rows_xonspans', pb_ar_rows_xonspans);
                    console.log('timeInNanos', timeInNanos);

                    //throw 'stop';
                    


                    pb8 = pb.to_8bipp();
                    //console.log('pb8.ta.length', pb8.ta.length);

                    await save_pixel_buffer('./pb1_pb8_eg4b.png', pb8, {format: 'png'});

                    
                    


                    


                    lg('End example 4\n');
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
                    
                    


                    


                    lg('End example 5\n');
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

                    

                    


                    

                    
                    

                    // Would we have lines where there are 8 or more aligned x off spans?

                    // Think it should be most significant bits first....
                    //  BE does seem right here, seems incorrectly implemented elsewhere though.


                    const a_smaller_image = async () => {
                        const pb = new Pixel_Buffer({
                            bits_per_pixel: 1,
                            size: [8, 8]
                        });
                        pb.draw_horizontal_line_on_1bipp([0, 1], 0);
                        pb.draw_horizontal_line_on_1bipp([0, 1], 0);
                        pb.draw_horizontal_line_on_1bipp([3, 5], 1);
                        pb.draw_horizontal_line_on_1bipp([0, 4], 2);
                        pb.draw_horizontal_line_on_1bipp([0, 6], 3);
                        pb.draw_horizontal_line_on_1bipp([0, 7], 4);
                        pb.draw_horizontal_line_on_1bipp([4, 7], 5);
    
                        console.log('pb.ta', pb.ta);
    
                        const pb8 = pb.to_8bipp();
                        //console.log('pb8.ta.length', pb8.ta.length);
    
                        await save_pixel_buffer('./pb1_pb8_eg6a.png', pb8, {format: 'png'});
                    }


                    





                    const slightly_larger = async() => {
                        const pb = new Pixel_Buffer({
                            bits_per_pixel: 1,
                            size: [36, 36]
                        });
    
                        // Get it as arr_rows_arr_x_off_spans
                        //  (or even an iterable???)
    
                        // Then logic to do with flood fills could apply to those x off spans.
                        //  x off span rows could be a useful format for (lower level?) 1bipp shape operations.
                        //   Definitely seem most useful for rapid flood fills.
    
                        // 'array of row array x off spans' seems like a good format for shape / mask definitions.
                        //  They will be good for painting many pixels at once.
                        //  Lower level features specifically for rapid 1bipp operations will support operations at other bit depths.
                        //   Like drawing filled shapes.
                        //   Identifying color regions?
                        // But if we fill it...?
    
                        pb.draw_polygon([[1, 1,], [15, 4], [15, 15], [4, 15]], 1, true);
    
                        // draw_horizontal_line_on_1bipp(y, x_span)


                        // Let's use xspan, y syntax instead, when we use this function.

                        /*

    
                        pb.draw_horizontal_line_on_1bipp(20, [0, 1]);
                        // length of 2 there.

    
    
                        pb.draw_horizontal_line_on_1bipp(21, [2, 8]);
                        //pb.draw_horizontal_line_on_1bipp(21, [2, 16]);
    
                        
                        pb.draw_horizontal_line_on_1bipp(22, [2, 24]);
                        pb.draw_horizontal_line_on_1bipp(23, [2, 25]);
                        pb.draw_horizontal_line_on_1bipp(24, [2, 26]);
                        pb.draw_horizontal_line_on_1bipp(25, [2, 27]);
                        pb.draw_horizontal_line_on_1bipp(26, [2, 28]);
                        pb.draw_horizontal_line_on_1bipp(27, [2, 29]);
                        pb.draw_horizontal_line_on_1bipp(28, [2, 31]);
                        pb.draw_horizontal_line_on_1bipp(29, [2, 33]);
                        pb.draw_horizontal_line_on_1bipp(30, [2, 35]);

                        */
                        // 35 is the rightmost pixel (0 to 35, being 36 pixels)

                        // Being able to determine the outside areas and inside areas on line drawing polygons.
                        //  Finding the distinct connected areas.
                        //  Areas of a specific color (0 or 1 for 1bipp)

                        // Get the different areas as (very simple) x spans.
                        //  All in a large typed array?
                        //   Could make it faster to go through in some cases?
                        //   Specific class backed by a typed array to hold x spans / an image / part of an image as x spans.

                        // Identifying the separate and linked xspans and therefore the regions (pixel color off) in a 1bipp image.


                        // pb.x_spans
                        // pb.arr_rows_arr_x_spans

                        // Just getting these items may be the best first step towards doing flood fills on them.
                        //  Could identify the separate networks of these connected x spans, and then would be ready to do very fast
                        //  flood fills on any of the identified regions.

                        // Identifying the color regions (specific off color) using x spans and analysis of xspan adjacency (pixels joining)

                        // Being able to also identify which is the / an inner region.
                        //  Should be a quicker way of doing this, as we can see which regions are / are not connected 
                        //  with the boundary (any region on a boundary)

                        // Map / directory / object containing: the xspan connections.
                        //  A flat list of all of the x spans???
                        //   Or at least each x span would be available in an index.

                        // Include the y data inside each of the x span listings?
                        //  Could be more standard in some ways, but then a bit more data and less optimal for some things (when we know y already)
                        //   Maybe could make searching for the connecting ones in a flat array faster though.

                        // And once we have the arr_arr nested data structure, we could import it into a typed array for analysis.
                        //  So a pointer in the ta would be moving around to find / retrieve the linked x spans (with the y value there for each of them easily)



                        // Could try getting the whole image as these horizontal x spans?
                        //  Then copying it to another image.

                        // Want support for simple JS x spans format(s) as well as more optimised typed array data (maybe with class(es))











                        // Could do them as a list of connections for between each row.


















                        //pb.draw_horizontal_line_on_1bipp(31, [2, 29]);
                        
    
    
    
                        // Will do optimised drawing of a horizontal line (left to right)
                        //  Various possible optimisations.
                        //  Need to draw up to the byte boundary (though we could use a mask to compelete the rest of that byte)
                        //  Then draw full bytes (or more)
                        //  Then draw however many pixels in the last byte (could use mask, maybe)
    
                        // Seems like we need to calculate the various parameters for the various parts.
    
                        // Need to calculate the start and end byte and bit indexes for the range.
    
                        // There may be 8 separate masks which could be pre-specified for drawing up until the end of the byte.
                        //  Basically numbers.
    
                        // How many pixels long is the line to draw?
                        //  Need to be careful to draw it to the correct bit and byte alignment.
                        //   That is the tricky part.
    
    
                        
    
    
                        // num_bits_in_first_byte
                        // num_middle_bytes
                        // num_bits_in_last_byte
    
    
    
                        //  1, 3, 7, 15, 31, 63, 127, (255???)
    
    
                        // 254, 252, 248, 240, 224, ...
    
    
                        // set_ta_bits_range for example???
    
    
    
    
    
    
    
    
    
    
    
                        
    
    
    
                       
                        
    
    
                        const pb8 = pb.to_8bipp();
                        //console.log('pb8.ta.length', pb8.ta.length);
    
                        await save_pixel_buffer('./pb1_pb8_eg6b.png', pb8, {format: 'png'});
                    }

                    const quite_small = async() => {

                        const pb = new Pixel_Buffer({
                            bits_per_pixel: 1,
                            size: [21, 21]
                        });
    
                        // But if we fill it...?
    
                        pb.draw_polygon([[1, 1,], [15, 4], [15, 15], [4, 15]], 1, false);

                        // Then we get the rows' x spans.
                        //  Should then be able to use them for (much) more rapid flood fill.

                        // A somewhat complicated algorithm working with these rows_x0spans.
                        //  Will make a much faster flood fill when it's working.


                        // A really large algorithm right now with all the comments and space.




                        // color 1 fill color, color 0 empty region color
                        //  for use after drawing the outline of a polygon.

                        // inner_pixels_off_flood_fill_on_1bipp
                        //  either put in core or enhanced.
                        //   maybe this kind of flood fill will / should be a core piece of functionality.

                        // flood_fill_inner_pixels_off_to_on_1bipp
                        //  (presumes a 1bipp image, line drawing using 'on' pixels)




                        // A fairly slow, early implementation of that inner flood fill.
                        const do_1bipp_inner_flood_fill = () => {
                            const rows_x0spans = pb.calculate_arr_rows_arr_x_off_spans_1bipp();
                            //console.log('rows_x0spans', rows_x0spans);

                            // And should be able to identify contiguous groups of these.
                            //  Though, getting them into a different structure to quickly 
                            //   move between contiguous x0spans may work best.
                            //  Meaning that the flood fill algorithm needs to use one of these contiguous regions.
                            //   Be able to identify which regions are touching the outer boundary and which are not
                            //    (therefore find the inner region(s) of a polygon whos outline has been drawn)

                            // Have them all as one long list.
                            //  Use simpler objects and arrays.

                            const arr_all_x_spans = [];

                            // Could also index them by y as well....

                            const arr_y_indexed = new Array(pb.size[1]);

                            let i2;

                            let idx = 0;
                            for (let i = 0; i < rows_x0spans.length; i++) {
                                const single_row_x0spans = rows_x0spans[i];
                                arr_y_indexed[i] = [];

                                for (i2 = 0; i2 < single_row_x0spans.length; i2++) {
                                    const x0_span = single_row_x0spans[i2];

                                    const o_x0span = {
                                        idx: idx++,
                                        y: i,
                                        x0_span: x0_span,
                                        connected_above: [],
                                        connected_below: [],
                                    }

                                    arr_all_x_spans.push(o_x0span);
                                    arr_y_indexed[i].push(o_x0span);

                                    // arr_y_indexed
                                }
                            }

                            //console.log('arr_all_x_spans', arr_all_x_spans);
                            //console.log('arr_all_x_spans.length', arr_all_x_spans.length);

                            //console.log('arr_y_indexed', JSON.stringify(arr_y_indexed, null, 2));

                            // arr_y_indexed

                            // Then can go through that y indexed array, determining any links between rows.

                            // And will be doubly linked using indexes.

                            // Will later be able to use the indexes to remember which have been 'visited'.
                            // Though will put together groups / arrays of the different contiguous ones.

                            // Want an array where we are not thinking in terms of the 'current', but about the link between
                            //  above and below.

                            let higher_row_y, lower_row_y;

                            let span_above, span_below;



                            // Iterate row pairs?



                            for (higher_row_y = 0; higher_row_y < pb.size[1] - 1; higher_row_y++) {




                                // ????

                                // Maybe use separate algorithm for identifying the row overlaps.







                                lower_row_y = higher_row_y + 1;

                                // higher row has lower y value.
                                //  need to be careful and explicit.

                                //console.log('');

                                const higher_row_x_spans = arr_y_indexed[higher_row_y];
                                const lower_row_x_spans = arr_y_indexed[lower_row_y];

                                //console.log('higher_row_x_spans', higher_row_x_spans);
                                //console.log('lower_row_x_spans', lower_row_x_spans);


                                const _identify_overlaps = (higher_row_x_spans, lower_row_x_spans) => {


                                    let i_above = 0, i_below = 0;
                                    const l_above = higher_row_x_spans.length, l_below = lower_row_x_spans.length;

                                    let x = 0;

                                    // Both length 1?
                                    // Both the same span data? (not same object though)


                                    span_above = higher_row_x_spans[0];
                                    span_below = lower_row_x_spans[0];

                                    // advance x here???

                                    console.log('span_above', span_above);
                                    console.log('span_below', span_below);

                                    // Maybe making a sorted events array would work better.

                                    // 

                                    if (span_above.x0_span[0] < span_below.x0_span[0]) {
                                        x = span_above.x0_span[0];
                                    } else {
                                        x = span_below.x0_span[0];
                                    }

                                    let above_state = false, below_state = false;

                                    while (i_above < l_above && i_below < l_below) {

                                        console.log('');
                                        console.log('x', x);
                                        console.log('[i_above, i_below]', [i_above, i_below]);
                                        console.log('[l_above, l_above]', [l_above, l_above]);
                                        //console.log('i_above', i_above);
                                        //console.log('i_below', i_below);

                                        // Case where they both start at x?
                                        //  Then the next value will be the first end.
                                        //   Maybe logic for more special cases will work better...

                                        if (span_above.x0_span[0] === x && span_below.x0_span[0] === x) {
                                            above_state = true;
                                            below_state = true;

                                            // advance x

                                            if (span_above.x0_span[1] < span_below.x0_span[1]) {

                                                // Check if it's also 0? or the same as the start.
                                                //  Need to handle spans of 1 pixel wide.

                                                // If so, need to handle that logic, possibly determining if there is a match with below.


                                                
                                                // And being able to move to the next index above or below...
                                                x = span_above.x0_span[1];
                                                i_above++;


                                            } else {

                                                // if it's 0 then advance it...?
                                                //  But want to register that we have an overlap.

                                                // I mean if span_below.x0_span[0] === span_below.x0_span[1].
                                                //  need to register the overlap and advance it.

                                                if (span_below.x0_span[0] === span_below.x0_span[1]) {

                                                    x = span_above.x0_span[1];
                                                    i_above++;

                                                } else {
                                                    x = span_below.x0_span[1];
                                                    i_below++;
                                                }
                                                



                                                
                                            }


                                        } else {


                                            console.log('x', x);



                                            if (span_above.x0_span[0] === x) {
                                                above_state = true;

                                                // start event
                                            }

                                            if (span_below.x0_span[0] === x) {
                                                below_state = true;

                                                // start event
                                            }

                                            // see if both above and below states are true?
                                            //  that would be an overlap match between these spans.



                                            // then are either of the spans' starts after x?
                                            //  as in the next value of x?

                                            // Try to find the next value of x....
                                            //  Know whether to advance the top one or the bottom ...?

                                            if (span_above.x0_span[0] > x) {
                                                x = span_above.x0_span[0];
                                            } else {
                                                if (span_below.x0_span[0] > x) {
                                                    x = span_below.x0_span[0];
                                                }
                                            }
                                            












                                            // then move x to the next value...
                                            //  and adjust i_above or a_below (or even both?)







                                            // read item into events array....
                                            //  or we can go through this without needing the events array.

                                            // advance x???

                                            // Check which one starts?
                                            //  Check if they both start?

                                            // Be able to detect overlaps here?





                                            //if (x < )

                                            //throw 'stop';

                                        }



                                        



                                    }


                                }

                                const identify_overlaps = (higher_row_x_spans, lower_row_x_spans) => {
                                    const overlaps = [];
                                
                                    let i = 0, j = 0;
                                    const m = higher_row_x_spans.length, n = lower_row_x_spans.length;
                                
                                    while (i < m && j < n) {
                                    const a = higher_row_x_spans[i], b = lower_row_x_spans[j];
                                
                                    if (a.x0_span[1] < b.x0_span[0]) {
                                        i++;
                                    } else if (b.x0_span[1] < a.x0_span[0]) {
                                        j++;
                                    } else {
                                        overlaps.push([a, b]);
                                        // note the connections in the objects themselves....
                                        //  That will allow rapid movement between them / identification of connected groups.

                                        a.connected_below.push(b.idx);
                                        b.connected_above.push(a.idx);


                                        if (a.x0_span[1] <= b.x0_span[1]) {
                                        i++;
                                        }
                                        if (b.x0_span[1] <= a.x0_span[1]) {
                                        j++;
                                        }
                                    }
                                    }
                                
                                    return overlaps;
                                }
                                


                                //console.log('pre identify overlaps [higher_row_x_spans, lower_row_x_spans]', higher_row_x_spans, lower_row_x_spans);

                                const overlaps = identify_overlaps(higher_row_x_spans, lower_row_x_spans);



                                //console.log('overlaps', overlaps);

                                
                                //throw 'stop';

                                // Then determine if there is overlap...

                                // Try a really simple algorithm???
                                //  Then later try other versions.

                                // Maybe 'events' for both of the arrays would help - ie one starts, one finishes.
                                //  And when one starts below while one above has started and not finished, it's an overlap
                                //  likewise when one below has started but not finished, and one above starts, we have overlap.

                                // Do want a fast algorithm to find the overlaps between the rows.
                                //  Then it will enable a fast / very fast flood fill.

                                // above_state?
                                //  started 1 or stopped / not active 0

                                // May need to make a much more optimised system for identifying the spans - but this may be the right
                                //  algorithmic basis here.

                                //const events = [];

                                // efficiently build the events array...

                                






                                // Single pointer?
                                //  also?: above_start_x above_end_x?

                                // Probably going through an 'events' array would be the fastest.
                                //  ['above', 'start', idx] maybe

                                // Then with simple logic looking at these start and stop 'events' we can identify when during the sequence they
                                //  are overlapping (both in started state)















                            }

                            //console.log('arr_y_indexed', arr_y_indexed);
                            //console.log('arr_y_indexed', JSON.stringify(arr_y_indexed, null , 2));

                            // Counting the sepatate groups.

                            // Iterate through them (1 by 1)
                            // Then for any span:
                            //  If it's not already assigned to a group, assign it to a new group
                            //   Recursively / stack based go through all linked spans
                            //    assigning to that group (number)

                            // Maybe don't need to do this yet???
                            //  May be best to do it this way in order to identify inner and outer groups / regions.





                            // Then identify them as separate? connected groups.
                            //  Some kind of recursive / stack based algorithm to identify the different groups.


                            // Stack-based algorithm to identify the connected groups (of spans)?
                            // Array / stack of spans yet to visit (while connecting the specific group?)
                            // Dict / lookup object of which groups have already been visited. 
                            //  

                            const l = arr_all_x_spans.length;

                            let arr_stack_yet_to_visit = [];
                            let ui8a_visited_already = new Uint8Array(l);
                            let i_group = 0;
                            let i_current_group;

                            // current group is boundary adjacent?

                            let current_group_is_boundary_adjacent = false;

                            // and an array of groups...
                            //  Would be useful to have them.


                            // Array of the indexes of groups
                            const arr_groups = [];

                            // an array of group objects that also have the is_boundary_adjacent property would help a lot here

                            const arr_o_groups = [];

                            let arr_current_group = [];
                            let o_current_group;

                            // an array of obj groups?
                            //  would have is_boundary_adjacent property (maybe just when true)

                            // Then flood fill from edge could operate on such boundary adjacent groups.
                            // Internal flood fill could work on the non-boundary adjacent groups.

                            // Groups / regions of pixels is a very appropriate way to speed things up.
                            // Grouping by x spans of the same color - fast / much faster for writing 1bipp values 
                            //  (with correct algo that writes multiple px at once)
                            // Grouping these xspans into regions of contiguous color.
                            //  Or essentially grouped as being their own mask / image section.

                            // Seems like it will be a very efficient way for dealing with regions of contiguous color.
                            //  Worth having very fast low level procedures for the basic 1bipp structures.
                            //   Will use them for some more complex operations. Want underlying fast and low memory classes / structures.
                            //   Using indexs of these xspans may work out to be very efficient.
                            //  














                            // and current group in the visit?


                            //const visit = (idx_xspan, i_current_group) => {
                                // add neighbours to stack...?
                            //}

                            let i_xspan_visiting, xspan_visiting;
                            

                            // Could check for group boundary adjacency here...?
                            //  Though separate processes / iterations may make the code clearer.

                            // Do expect this to be fast because of algorithmic process efficiency but then will probably still
                            //  need fine tuning with specific data structures and operations.

                            const [width, height] = pb.size;

                            const is_xspan_image_boundary_adjacent = xspan => {
                                const {x0_span} = xspan;

                                if (xspan.y === 0) return true;
                                if (x0_span[0] === 0) return true;

                                if (xspan.y === height - 1) return true;
                                if (x0_span[1] === width - 1) return true;

                                return false;



                            }


                            for (let c = 0; c < l; c++) {

                                if (ui8a_visited_already[c] === 0) {
                                    ui8a_visited_already = new Uint8Array(l);

                                    const xspan = arr_all_x_spans[c];
                                    ui8a_visited_already[c] = 255;

                                    // Should (only?) be undefined if it's not been visited yet.
                                    if (xspan.group === undefined) {


                                        // could keep track if the previous group was boundary adjacent?


                                        // Should only do this a few times...




                                        i_current_group = i_group++;

                                        //if (i_current_group > 0) {
                                        arr_current_group = [];
                                        o_current_group = {
                                            index: i_current_group,
                                            xspan_indexes: arr_current_group

                                        }
                                        

                                        arr_o_groups.push(o_current_group);

                                        arr_groups.push(arr_current_group);

                                        if (is_xspan_image_boundary_adjacent(xspan)) {
                                            o_current_group.is_boundary_adjacent = true;
                                        }
                                            
                                        //}



                                        // current_group_is_boundary_adjacent = current_group_is_boundary_adjacent && is_xspan_bounary_adjacent(xspan)



                                        xspan.group = i_current_group;
                                        //ui8a_visited_already[c] = 255;
                                        arr_current_group.push(c);



                                        // add the neighbouring pixels to the stack....

                                        //console.log('xspan', xspan);

                                        //console.log('xspan.connected_above', xspan.connected_above);

                                        for (const idx_span_above of xspan.connected_above) {
                                            if (ui8a_visited_already[idx_span_above] === 0) arr_stack_yet_to_visit.push(idx_span_above);
                                        }
                                        for (const idx_span_below of xspan.connected_below) {
                                            if (ui8a_visited_already[idx_span_below] === 0) arr_stack_yet_to_visit.push(idx_span_below);
                                        }

                                        // need to move to a different 'visiting' span.
                                        while (arr_stack_yet_to_visit.length > 0) {
                                            // push each of the connected xspan indexes

                                            i_xspan_visiting = arr_stack_yet_to_visit.pop();

                                            // could check here if we still need to visit it???

                                            // slightly more complex but it works now with no duplicates.
                                            if (ui8a_visited_already[i_xspan_visiting] === 0) {
                                                xspan_visiting = arr_all_x_spans[i_xspan_visiting];

                                                if (is_xspan_image_boundary_adjacent(xspan_visiting)) {
                                                    o_current_group.is_boundary_adjacent = true;
                                                }


                                                xspan_visiting.group = i_current_group;
                                                arr_current_group.push(i_xspan_visiting);

                                                ui8a_visited_already[i_xspan_visiting] = 255;

                                                for (const idx_span_above of xspan_visiting.connected_above) {
                                                    if (ui8a_visited_already[idx_span_above] === 0) arr_stack_yet_to_visit.push(idx_span_above);
                                                }
                                                for (const idx_span_below of xspan_visiting.connected_below) {
                                                    if (ui8a_visited_already[idx_span_below] === 0) arr_stack_yet_to_visit.push(idx_span_below);
                                                }
                                            }




                                        }

                                    }
                                }

                            }




                            // Is group 1 always the inner group?
                            // group is boundary adjacent?

                            // Elsewhere identify which group has got any boundary pixels...?

                            // Could previously analyse which xspans are boundary-adjacent.
                            //  Then when we find one, note that that whole group is boundary adjacent.
                            //   Maybe avoid setting a value more times than needed.
                            //   Could track if it's boundary adjacent while putting the group together.
                            //    Could also note if any of the xspans themselves are boundary adjacent at an earlier stage.







                            //console.log('arr_all_x_spans', arr_all_x_spans);

                            //console.log('arr_groups', arr_groups);

                            //console.log('arr_o_groups', arr_o_groups);

                            // then non-boundary groups...

                            const non_boundary_group_indexes = [];

                            for (const g of arr_o_groups) {
                                //console.log('g', g);
                                if (!g.is_boundary_adjacent) {
                                    for (const idx of g.xspan_indexes) {
                                        //console.log('idx', idx);
                                        non_boundary_group_indexes.push(idx);
                                    }
                                    
                                }
                            }

                            //console.log('non_boundary_group_indexes', non_boundary_group_indexes);

                            // then get them as x spans (each including the y value)
                            //  y_val_x_span items???

                            // likely to want a lower level ta-backed system to deal with them faster.
                            // [y, [x1, x2]]???
                            // or better as [[x1, x2], y]???
                            //  seems more logical / standard that way round.
                            //  may need to consider optimisation requirements in some cases, maybe it wont matter with this, but need consistency.


                            const arr_all_inner_xspans = [];

                            for (const idx of non_boundary_group_indexes) {
                                //console.log('idx', idx);
                                arr_all_inner_xspans.push([arr_all_x_spans[idx].x0_span, arr_all_x_spans[idx].y]);
                            }

                            //console.log('arr_all_inner_xspans', arr_all_inner_xspans);

                            // Then could see about painting them...
                            //  (x1, x2, y) for further speed? or a ta with the 3 of them???

                            for (const [x_span, y] of arr_all_inner_xspans) {
                                //console.log('[x_span, y]', [x_span, y]);

                                pb.draw_horizontal_line_on_1bipp(x_span, y);
                            }


                        }

                        //do_1bipp_inner_flood_fill();



                        const start = process.hrtime();

                        // Make a faster implementation that's a lot faster for small images too?

                        pb.flood_fill_inner_pixels_off_to_on_1bipp();

                        const end = process.hrtime(start);

                        const timeInNanos = end[0] * 1e9 + end[1];
                        console.log('flood fill timeInNanos:', timeInNanos);





                        





                        //throw 'stop';














    
                        
    
    
                        const pb8 = pb.to_8bipp();
                        //console.log('pb8.ta.length', pb8.ta.length);
    
                        await save_pixel_buffer('./pb1_pb8_eg6c.png', pb8, {format: 'png'});


                    }


                    // These all will be improved by lower level algorithm improvements.



                    const square300 = async() => {
                        const pb = new Pixel_Buffer({
                            bits_per_pixel: 1,
                            size: [300, 300]
                        });

                        // Draw various shapes?
                        // Copy it?

                        // Draw a flood filled shape?

                        // Could work on accelerated flood fill here.
                        // And accelerated filled shape drawing.

                        pb.draw_polygon([[16, 16,], [122, 16], [280, 200], [16, 200]], 1, true);



                        // Looks right....
                        //  The reading of these lines could be sped up.
                        //  Possibly will use a more efficient lower level data structure (ta with wrapping) to keep track of these various x spans

                        // May be fastest to keep them all in a list.
                        //  

                        // How to count and detect where the pixel changes are?
                        // Finding 01 or 10 pattern in the bits....
                        //  May have possibility of doing nicely low level process to detect where it changes from 1 color to another on the horizontal
                        //  scanline.

                        // Do some kind of 'or' operation on 01010101 and 10101010?????

                        // There likely are some bitwise tricks that would speed things up very nicely.

                        // Could keep shifting the bits being read to the beginning, and then trying various masks to test how many consecutive 1s or 0s there are.
                        //  Could detect up to 8? And then when 8 in a row are found it processes all of them at once (1 byte)?

                        // Minimising reading and writing to the ArrayBuffer itself?









                        








                        let start = process.hrtime();
                        let pb_ar_rows_xoffspans = pb.calculate_arr_rows_arr_x_off_spans_1bipp();

                        let end = process.hrtime(start);

                        let timeInNanos = end[0] * 1e9 + end[1];
                        


                        //console.log('pb_ar_rows_xoffspans', pb_ar_rows_xoffspans);

                        // See about greatly speeding this up... (done, possibly could be done more....)
                        //console.log('calculate_arr_rows_arr_x_off_spans_1bipp timeInNanos:', timeInNanos);


                        start = process.hrtime();
                        let pb_ar_rows_xonspans = pb.calculate_arr_rows_arr_x_on_spans_1bipp();

                        end = process.hrtime(start);

                        timeInNanos = end[0] * 1e9 + end[1];
                        


                        //console.log('pb_ar_rows_xonspans', pb_ar_rows_xonspans);

                        // See about greatly speeding this up...
                        //  Could reimplement the algorithm.
                        //   Nice to see that it's working here though....
                        //   Could use it for the masking operations, see how they are sped up.



                        console.log('calculate_arr_rows_arr_x_on_spans_1bipp timeInNanos:', timeInNanos);


                        // Could use this shape to test out various functions and features.
                        //  Get the rows of pixel on or off spans...

                        // It's only the horizontal lines which are large amount of fully on bytes / 8byte sections.

                        // Could see about checking for long areas???
                        //  Like finding all sections where there are joined bytes....
                        //  Such as 255 bytes
                        //  Such as _1x64 

                        // Getting larger off x spans may be of great use....
                        // Treating each line as its own piece of data?
                        //  Settings to do with the row 8 byte alignment may help a lot.
                        //  As would 1 byte alignment possibility.
                        //   May be more important that way.

                        // Quickly extract all spans of it all being bits 0 or 1?
                        //  Or be able to read onwards xdiff many at once???

                        // Detect next change between 0 and 1...
                        // Detect (position of) next 0 or 1...

                        // Could zero-in on it with masks.
                        // May be worth reading 4 bits at a time in some cases
                        //  As in we have 16 possible values...

                        // Attempt to read 64 bits at once
                        //  (all 1, all 0) (other readings - such as finding which bytes have any mixtures of 1s and 0s?)

                        // Masks for each of the bytes, faster than array reading?
                        // Some pre-generated bitmasks / constants...

                        // eg 11111111000000000000000000000000000000000000000000000000
                        //    00000000111111110000000000000000000000000000000000000000

                        // Would be a mask and shift operation.
                        // Will be worth trying some different methods.





















                        //const 











                        const pb8 = pb.to_8bipp();
                        //console.log('pb8.ta.length', pb8.ta.length);
    
                        await save_pixel_buffer('./pb1_pb8_eg6d.png', pb8, {format: 'png'});

                    }





                    await a_smaller_image();
                    await slightly_larger();
                    await quite_small();
                    await square300();



                    // Could do examples at 64x64 or larger.
                    //  Would be nice to have some scope for 64 pixels at a time reading and writing.

                    // Is there some rapid bitwise logic we can use?
                    //  Very likely will need branching.
                    //   Want fast way / ways to determine the number of contiguous 1s after the character.
                    //   Could use bytes with lookup tables (saved as constants, some could be loaded into local variables).

                    // Could use different algorithms depending on the image size (or width?).














                    
                    
                    


                    


                    lg('End example 6\n');

                },
                async() => {
                    // just lg for log???

                    // New polygon drawing / faster flood fill seems a lot faster (for now).

                    if (size_limit !== 'small') {
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
                        
                        


                        


                        lg('End example 7\n');
                    }

                    

                },
                async() => {
                    // just lg for log???

                    console.log('size_limit', size_limit);

                    if (size_limit !== 'small') {
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

                        


                        lg('End example 8\n');
                    }

                    

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