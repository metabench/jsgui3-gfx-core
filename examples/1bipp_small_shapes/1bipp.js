

const Pixel_Buffer = require('../../pixel-buffer');
const sharp = require('sharp');

if (require.main === module) {
    const lg = console.log;
    // go through list of functions....
    (async() => {
        const run_examples = async() => {
            lg('Begin run examples');
            //let size_limit = 'small';

            // May want cases that test 64 pixels being read / written at once....
            //  Have seen a great speedup for some masking operations (incl drawing filled shapes).
            //  Need to speed up draw_1bipp_pixel_buffer_mask
            //   Probably use the x on spans.
            //    Will also see about a more efficient iterator that does not generate the result array.
            //     Could just return results (in a ta) representing 1 span at a time [x1, x2, y].
            let size_limit = 'huge';


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
                    


                    const pb = new Pixel_Buffer({
                        bits_per_pixel: 1,
                        size: [9, 9]
                    });
                    // But if we fill it...?
                    // Just a rectangle

                    pb.draw_polygon([[1, 1,], [5, 1], [6, 6], [3, 6]], 1, true);
                    const pb8 = pb.to_8bipp();
                    await save_pixel_buffer('./0.png', pb8, {format: 'png'});



                    // Not so sure why the values are not being read correctly from this small image....
                    //   I don't think there are byte line alignments....
                    //    Not sure.
                    //    Probably should not be.



                    const pb2 = new Pixel_Buffer({
                        bits_per_pixel: 1,
                        size: [9, 9]
                    });
                    // But if we fill it...?
                    // Just a rectangle

                    pb2.draw_polygon([[1, 1,], [4, 1], [4, 4], [1, 4]], 1, true);
                    const pb2_8 = pb2.to_8bipp();
                    await save_pixel_buffer('./1.png', pb2_8, {format: 'png'});




                    // more specific naming for what it is here than x spans.

                    const ta_contig_x_spans_pb1 = pb.get_ta_contiguous_spans_1bipp_toggle();

                    console.log('ta_contig_x_spans_pb1', ta_contig_x_spans_pb1);

                    const ta_contig_x_spans_pb2 = pb2.get_ta_contiguous_spans_1bipp_toggle();

                    // Is it reading it correctly???

                    console.log('ta_contig_x_spans_pb2', ta_contig_x_spans_pb2);
                    console.log('pb2.ta', pb2.ta);


                    // .get_contig_x_spans_AND

                    const contig_spans_union = Pixel_Buffer.get_contig_x_spans_AND(ta_contig_x_spans_pb1, ta_contig_x_spans_pb2);
                    console.log('contig_spans_union', contig_spans_union);


                    

                    // pb.to_x_spans ????
                    //   bit 'to' implies it would hold the full info of the image.

                    // get x spans ta ????
                    //   and including the width value at the beginning?
                    //   x spans could also include an offset value at the beginning (x and y)

                    // width specified x spans
                    // offset and width specified x spans.

                    // bare x spans with no width.

                    // likely to be 16 bit values....
                    //   though 8 bit values may be suitable when they are all small.

                    // iterate through the x-spans from the pixel buffer....



                    





                    //console.log('pb8.ta.length', pb8.ta.length);

                    

                    return true;
                    lg('End example 0\n');
                }
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