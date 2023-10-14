



const Pixel_Buffer = require('../pixel-buffer');

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

            // Seems like inner const no longer deopts.

            // Do want to allow for drawing a zoomed fractal image.


            function gs8bipp_draw_fractal(width, height, seed) {
                const imageData = new Uint8Array(width * height);

                // Many more iterations a lot better???
                //  Not always.


                // Maybe we want / need 255 iterations to have all the colors?
                //  Or this is the basics here - will map the colors differently.

                // May look into formula or function defined images.




                const maxIterations = 128;

                let x, y, index, a, b, zx, zy, i, xtemp, grayscale;

                // Large num of iterations on larger number of pixels - no wonder it's slow.
                //  Could have it set just the greyscale ta of course.

              
                for (y = 0; y < height; y++) {
                  for (x = 0; x < width; x++) {
                    index = (y * width + x);
              
                    // Normalize pixel coordinates to the range [-2, 2]
                    a = (x / width) * 4 - 2;
                    b = (y / height) * 4 - 2;
              
                    zx = a;
                    zy = b;
                    //i;
              
                    // Perform fractal iteration
                    for (i = 0; i < maxIterations; i++) {
                      xtemp = zx * zx - zy * zy + a;
                      zy = 2 * zx * zy + b;
                      zx = xtemp;
              
                      // Check if the point is escaping the fractal boundary
                      if (zx * zx + zy * zy >= 4) {
                        break;
                      }
                    }
              
                    // Calculate grayscale value based on the number of iterations
                    grayscale = Math.floor((i / maxIterations) * 255);
              
                    // Set the pixel values as [r, g, b]
                    imageData[index] = grayscale;
                    ///imageData[index + 1] = grayscale;
                    //imageData[index + 2] = grayscale;
                  }
                }
              
                return imageData;
              }


            function draw_fractal(width, height, seed) {
                const imageData = new Uint8Array(width * height * 3);

                // Many more iterations a lot better???
                //  Not always.


                // Maybe we want / need 255 iterations to have all the colors?
                //  Or this is the basics here - will map the colors differently.

                // May look into formula or function defined images.




                const maxIterations = 128;

                let x, y, index, a, b, zx, zy, i, xtemp, grayscale;

                // Large num of iterations on larger number of pixels - no wonder it's slow.
                //  Could have it set just the greyscale ta of course.

              
                for (y = 0; y < height; y++) {
                  for (x = 0; x < width; x++) {
                    index = (y * width + x) * 3;
              
                    // Normalize pixel coordinates to the range [-2, 2]
                    a = (x / width) * 4 - 2;
                    b = (y / height) * 4 - 2;
              
                    zx = a;
                    zy = b;
                    //i;
              
                    // Perform fractal iteration
                    for (i = 0; i < maxIterations; i++) {
                      xtemp = zx * zx - zy * zy + a;
                      zy = 2 * zx * zy + b;
                      zx = xtemp;
              
                      // Check if the point is escaping the fractal boundary
                      if (zx * zx + zy * zy >= 4) {
                        break;
                      }
                    }
              
                    // Calculate grayscale value based on the number of iterations
                    grayscale = Math.floor((i / maxIterations) * 255);
              
                    // Set the pixel values as [r, g, b]
                    imageData[index] = grayscale;
                    imageData[index + 1] = grayscale;
                    imageData[index + 2] = grayscale;
                  }
                }
              
                return imageData;
              }

            // A list of example functions. array.

            // Does bring out some details quite nicely.

            // Maybe just make it 8bit all the way through?
            //  Maybe make a color version....

            // Fractal-derived shapes could be good for graphics / flood filling etc.
            //  May want to then do some thresholding on them....

            // Can see about making multi-core.
            //  Not sure how important fast fractal drawing is / will be, but it does seem like it's
            //   going to be a decent demo of faster multi-core processing.
            
            // The zoomed fractal does seem a lot slower....
            //  Maybe could work on faster zoomed fractal drawing.
            //   Less than 17ms would def be nice.

            // Full screen fractals should be very nice if can be generated at 60fps.
            //  Some fractal images would be very useful for some tests.


            


            const _opt_attempt_draw_zoomed_fractal = (width, height, zoomLevel, zoomCenterX, zoomCenterY, zoomWindowWidth, zoomWindowHeight) => {
                const imageData = new Uint8Array(width * height * 3);
                const maxIterations = 128;
              
                const zoomWindowHalfWidth = zoomWindowWidth / 2;
                const zoomWindowHalfHeight = zoomWindowHeight / 2;
              
                for (let y = 0; y < height; y++) {
                  for (let x = 0; x < width; x++) {
                    const index = (y * width + x) * 3;
              
                    // Normalize pixel coordinates to the range [-2, 2] based on zoom
                    const a = ((x / width) * zoomWindowWidth - zoomWindowHalfWidth) / width + zoomCenterX;
                    const b = ((y / height) * zoomWindowHeight - zoomWindowHalfHeight) / height + zoomCenterY;
              
                    let zx = a;
                    let zy = b;
                    let squaredMagnitude = zx * zx + zy * zy;
              
                    let i = 0;
                    while (i < maxIterations && squaredMagnitude < 4) {
                      const xtemp = zx * zx - zy * zy + a;
                      zy = 2 * zx * zy + b;
                      zx = xtemp;
                      squaredMagnitude = zx * zx + zy * zy;
                      i++;
                    }
              
                    // Calculate grayscale value based on the number of iterations
                    const grayscale = Math.floor((i / maxIterations) * 255);
              
                    // Set the pixel values as [r, g, b]
                    imageData[index] = grayscale;
                    imageData[index + 1] = grayscale;
                    imageData[index + 2] = grayscale;
                  }
                }
              
                return imageData;
              };
              


            // Runs a little faster with some precalculation.

            /*

            const draw_zoomed_fractal = (width, height, zoomLevel, zoomCenterX, zoomCenterY) => {
                const imageData = new Uint8Array(width * height * 3);
                const maxIterations = 128;
              
                const zoomWindowWidth = width / zoomLevel;
                const zoomWindowHeight = height / zoomLevel;
                const zoomWindowHalfWidth = zoomWindowWidth / 2;
                const zoomWindowHalfHeight = zoomWindowHeight / 2;
              
                const zwwhw = zoomWindowWidth - zoomWindowHalfWidth;
                const zwhhh = zoomWindowHeight - zoomWindowHalfHeight;
              
                const scaledWidth = zwwhw / width;
                const scaledHeight = zwhhh / height;
              
                let x, y, index, a, b, zx, zy, i, xtemp, grayscale;
              
                for (y = 0; y < height; y++) {
                  for (x = 0; x < width; x++) {
                    index = (y * width + x) * 3;
              
                    a = (x * scaledWidth) + zoomCenterX;
                    b = (y * scaledHeight) + zoomCenterY;
              
                    zx = a;
                    zy = b;
              
                    // Perform fractal iteration
                    for (i = 0; i < maxIterations; i++) {
                      xtemp = zx * zx - zy * zy + a;
                      zy = 2 * zx * zy + b;
                      zx = xtemp;
              
                      // Check if the point is escaping the fractal boundary
                      if (zx * zx + zy * zy >= 4) {
                        break;
                      }
                    }
              
                    // Calculate grayscale value based on the number of iterations
                    grayscale = Math.floor((i / maxIterations) * 255);
              
                    // Set the pixel values as [r, g, b]
                    imageData[index] = grayscale;
                    imageData[index + 1] = grayscale;
                    imageData[index + 2] = grayscale;
                  }
                }
              
                return imageData;
              };

              */



            // May want this actually in the library itself.
            //  Or not in the core at least...



            const draw_zoomed_fractal = (width, height, zoomLevel, zoomCenterX, zoomCenterY, zoomWindowWidth, zoomWindowHeight) => {
                const imageData = new Uint8Array(width * height * 3);
                const maxIterations = 128;
              
                let x, y, index, a, b, zx, zy, i, xtemp, grayscale;
              
                const zoomWindowHalfWidth = zoomWindowWidth / 2;
                const zoomWindowHalfHeight = zoomWindowHeight / 2;

                //const zwwhw = zoomWindowWidth - zoomWindowHalfWidth;
                //const zwhhh = zoomWindowHeight - zoomWindowHalfHeight;


                // (x * zwwhw) / width
                // ??? x * (zwwhw / width) ????

                //const wzwwhw = zwwhw * width;
                //const hzwhhh = zwhhh * height;

                //const scaledWidth = zwwhw / width;
                //const scaledHeight = zwhhh / height;





                //const w_zcy = ;

                // Proportion through space....
                //  Could make a more efficient iterator of these.
                
                // Maybe could make better use of consts.
              
                for (y = 0; y < height; y++) {
                  for (x = 0; x < width; x++) {
                    index = (y * width + x) * 3;
              
                    // Normalize pixel coordinates to the range [-2, 2] based on zoom
                    a = ((x / width) * zoomWindowHalfWidth) / width + zoomCenterX;
                    b = ((y / height) * zoomWindowHalfHeight) / height + zoomCenterY;

                    //a = (x * scaledWidth) + zoomCenterX;
                    //b = (y * scaledHeight) + zoomCenterY;
              
                    zx = a;
                    zy = b;
              
                    // Perform fractal iteration
                    for (i = 0; i < maxIterations; i++) {
                      xtemp = zx * zx - zy * zy + a;
                      zy = 2 * zx * zy + b;
                      zx = xtemp;
              
                      // Check if the point is escaping the fractal boundary
                      if (zx * zx + zy * zy >= 4) {
                        break;
                      }
                    }
              
                    // Calculate grayscale value based on the number of iterations
                    grayscale = Math.floor((i / maxIterations) * 255);
              
                    // Set the pixel values as [r, g, b]
                    imageData[index] = grayscale;
                    imageData[index + 1] = grayscale;
                    imageData[index + 2] = grayscale;
                  }
                }
              
                return imageData;
              };

              const gs8bipp_draw_zoomed_fractal = (width, height, zoomLevel, zoomCenterX, zoomCenterY, zoomWindowWidth, zoomWindowHeight) => {
                const imageData = new Uint8Array(width * height);
                const maxIterations = 128;
              
                let x, y, a, b, zx, zy, i, xtemp, grayscale;
              
                const zoomWindowHalfWidth = zoomWindowWidth / 2;
                const zoomWindowHalfHeight = zoomWindowHeight / 2;

                //const zwwhw = zoomWindowWidth - zoomWindowHalfWidth;
                //const zwhhh = zoomWindowHeight - zoomWindowHalfHeight;


                // (x * zwwhw) / width
                // ??? x * (zwwhw / width) ????

                //const wzwwhw = zwwhw * width;
                //const hzwhhh = zwhhh * height;

                //const scaledWidth = zwwhw / width;
                //const scaledHeight = zwhhh / height;

                //const w_zcy = ;

                // Proportion through space....
                //  Could make a more efficient iterator of these.
                
                // Maybe could make better use of consts.

                let index = 0;
              
                for (y = 0; y < height; y++) {
                  for (x = 0; x < width; x++) {
                    //index = (y * width + x);
              
                    // Normalize pixel coordinates to the range [-2, 2] based on zoom
                    a = ((x / width) * zoomWindowHalfWidth) / width + zoomCenterX;
                    b = ((y / height) * zoomWindowHalfHeight) / height + zoomCenterY;

                    //a = (x * scaledWidth) + zoomCenterX;
                    //b = (y * scaledHeight) + zoomCenterY;
              
                    zx = a;
                    zy = b;
              
                    // Perform fractal iteration
                    for (i = 0; i < maxIterations; i++) {
                      xtemp = zx * zx - zy * zy + a;
                      zy = 2 * zx * zy + b;
                      zx = xtemp;
              
                      // Check if the point is escaping the fractal boundary
                      if (zx * zx + zy * zy >= 4) {
                        break;
                      }
                    }
              
                    // Calculate grayscale value based on the number of iterations
                    grayscale = Math.floor((i / maxIterations) * 255);
              
                    // Set the pixel values as [r, g, b]
                    imageData[index++] = grayscale;
                  }
                }
              
                return imageData;
              };
              
              
              
              
              

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

                    //const size = [4000, 4000];

                    //const size = [16000, 16000];
                    //const size = [1000, 1000];

                    // Quite big, does not take ages at least.
                    //  Some shapes there could be useful to test drawing of.
                    //   Tree shapes are very available from fractals.

                    //const size = [6000, 6000];
                    const size = [2000, 2000];
                    const mid_large_size = [4000, 4000];
                    const large_size = [8000, 8000];

                    let pb, ta_fractal, start, end, timeInNanos, zoomCenterX, zoomCenterY, zoomWindowWidth, canvasWidth, canvasHeight, zoomLevel;
                    let example_size;
                    let count_color_white, count_color_black;

                    example_size = mid_large_size;

                    pb = new Pixel_Buffer({
                        bits_per_pixel: 24,
                        size: example_size
                    });

                    zoomCenterX = 0.379;
                    zoomCenterY = 0.291;
                    zoomWindowWidth = example_size[0] / 128;
                    zoomWindowHeight = example_size[1] / 128;
                    start = process.hrtime();
                    imageData = draw_zoomed_fractal(example_size[0], example_size[1], zoomLevel, zoomCenterX, zoomCenterY, zoomWindowWidth, zoomWindowHeight);
                    pb.ta.set(imageData);
                    end = process.hrtime(start);
                    timeInNanos = end[0] * 1e9 + end[1];
                    console.log('zoomed fractal ms:', timeInNanos / 1000000);

                    const color_white = new Uint8ClampedArray([255, 255, 255]);
                    count_color_white = pb.count_pixels_with_color(color_white);
                    console.log('count_color_white', count_color_white);

                    const color_black = new Uint8ClampedArray([0, 0, 0]);
                    count_color_black = pb.count_pixels_with_color(color_black);
                    console.log('count_color_black', count_color_black);

                    // See about finding the first pixel of color...?
                    //  Or getting the color frequencies.
                    
                    // Will consider luminosity of some color images.






                    // count_color_black
                  

                  //timeInNanos = end[0] * 1e9 + end[1];

                  //console.log('pb.draw_polygon timeInNanos:', timeInNanos);
                  //console.log('fractal ms:', timeInNanos / 1000000);

                    await save_pixel_buffer('./enh_algorithm_fractal_0.png', pb, {format: 'png'});




                    lg('End example 0\n');
                },
                async() => {
                    // just lg for log???
                    lg('Begin example 1');


                    /*

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
                    
                    */

                    lg('End example 1\n');
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