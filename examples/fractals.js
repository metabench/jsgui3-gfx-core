



const Pixel_Buffer = require('../core/pixel-buffer');

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
                    const large_size = [8000, 8000];

                    let pb = new Pixel_Buffer({
                        bits_per_pixel: 24,
                        size: size
                    });

                    let start = process.hrtime();
                    let end, timeInNanos;

                    // Is reasonably fast....

                    let ta_fractal = draw_fractal(size[0], size[1]);
                    pb.ta.set(ta_fractal);
                    end = process.hrtime(start);

                    timeInNanos = end[0] * 1e9 + end[1];

                    //console.log('pb.draw_polygon timeInNanos:', timeInNanos);
                    console.log('fractal ms:', timeInNanos / 1000000);

                    // set_pixel(3, 3, 1);  // This could actually be faster though?
                    // set_pixel([3, 3], 1);
                    // set_pixel(ta_pos, 1);

                    

                    // output as PNG?
                    //  as bmp?
                    //console.log('pb.ta', pb.ta);

                    //console.log('pb.num_px', pb.num_px);

                    // then try changing it to 24bpp...

                    //const pb24 = pb.to_24bipp();
                    //console.log('pb24.ta', pb24.ta);

                    //const pb24 = pb.to_24bipp();
                    //console.log('pb24.ta.length', pb24.ta.length);

                    //const pb8 = pb.to_8bipp();
                    //console.log('pb8.ta.length', pb8.ta.length);

                    await save_pixel_buffer('./output/fractal_pb24greyscale_eg0.png', pb, {format: 'png'});


                    // const draw_zoomed_fractal = (width, height, zoomLevel, zoomCenterX, zoomCenterY, zoomWindowWidth, zoomWindowHeight) => {


                    //ta_fractal = draw_zoomed_fractal(size[0], size[1], 2, 1100, 800, 400, 400);

                    // Basically not working????
                    //  Does produce some interesting results.

                    const [canvasWidth, canvasHeight] = size;

                    let zoomLevel = 0;
                    let zoomCenterX = 0.4;
                    let zoomCenterY = 0.3;
                    
                    //const zoomWindowWidth = canvasWidth / 2;
                    //const zoomWindowHeight = canvasHeight / 2;

                    let zoomWindowWidth = canvasWidth / 20;
                    let zoomWindowHeight = canvasHeight / 20;


                    // Does definitely produce nice fractal images, but it's a little tricky getting the params right.

                    // Generate the non-zoomed fractal image data

                    let imageData;

                    start = process.hrtime();
                    //let end, timeInNanos;
                    imageData = draw_zoomed_fractal(canvasWidth, canvasHeight, zoomLevel, zoomCenterX, zoomCenterY, zoomWindowWidth, zoomWindowHeight);


                    //ta_fractal = draw_zoomed_fractal(size[0], size[1], 2, 0.5, 0.5, 10, 10);
                    pb.ta.set(imageData);
                    end = process.hrtime(start);

                    timeInNanos = end[0] * 1e9 + end[1];

                    //console.log('pb.draw_polygon timeInNanos:', timeInNanos);
                    console.log('zoomed fractal ms:', timeInNanos / 1000000);

                    await save_pixel_buffer('./output/fractal_pb24greyscale_eg1.png', pb, {format: 'png'});


                    zoomCenterX = 0.4;
                    zoomCenterY = 0.29;
                    zoomWindowWidth = canvasWidth / 20;
                    zoomWindowHeight = canvasHeight / 20;



                    start = process.hrtime();
                    //let end, timeInNanos;
                    imageData = draw_zoomed_fractal(canvasWidth, canvasHeight, zoomLevel, zoomCenterX, zoomCenterY, zoomWindowWidth, zoomWindowHeight);


                    //ta_fractal = draw_zoomed_fractal(size[0], size[1], 2, 0.5, 0.5, 10, 10);
                    pb.ta.set(imageData);
                    end = process.hrtime(start);

                    timeInNanos = end[0] * 1e9 + end[1];

                    //console.log('pb.draw_polygon timeInNanos:', timeInNanos);
                    console.log('zoomed fractal ms:', timeInNanos / 1000000);

                    await save_pixel_buffer('./output/fractal_pb24greyscale_eg2.png', pb, {format: 'png'});




                    zoomCenterX = 0.39;
                    zoomCenterY = 0.29;
                    zoomWindowWidth = canvasWidth / 20;
                    zoomWindowHeight = canvasHeight / 20;



                    start = process.hrtime();
                    //let end, timeInNanos;
                    imageData = draw_zoomed_fractal(canvasWidth, canvasHeight, zoomLevel, zoomCenterX, zoomCenterY, zoomWindowWidth, zoomWindowHeight);


                    //ta_fractal = draw_zoomed_fractal(size[0], size[1], 2, 0.5, 0.5, 10, 10);
                    pb.ta.set(imageData);
                    end = process.hrtime(start);

                    timeInNanos = end[0] * 1e9 + end[1];

                    //console.log('pb.draw_polygon timeInNanos:', timeInNanos);
                    console.log('zoomed fractal ms:', timeInNanos / 1000000);

                    await save_pixel_buffer('./output/fractal_pb24greyscale_eg3.png', pb, {format: 'png'});



                    zoomCenterX = 0.39;
                    zoomCenterY = 0.29;
                    zoomWindowWidth = canvasWidth / 24;
                    zoomWindowHeight = canvasHeight / 24;
                    start = process.hrtime();
                    //let end, timeInNanos;
                    imageData = draw_zoomed_fractal(canvasWidth, canvasHeight, zoomLevel, zoomCenterX, zoomCenterY, zoomWindowWidth, zoomWindowHeight);
                    pb.ta.set(imageData);
                    end = process.hrtime(start);
                    timeInNanos = end[0] * 1e9 + end[1];
                    console.log('zoomed fractal ms:', timeInNanos / 1000000);

                    await save_pixel_buffer('./output/fractal_pb24greyscale_eg4.png', pb, {format: 'png'});



                    zoomCenterX = 0.385;
                    zoomCenterY = 0.29;
                    zoomWindowWidth = canvasWidth / 24;
                    zoomWindowHeight = canvasHeight / 24;
                    start = process.hrtime();
                    imageData = draw_zoomed_fractal(canvasWidth, canvasHeight, zoomLevel, zoomCenterX, zoomCenterY, zoomWindowWidth, zoomWindowHeight);
                    pb.ta.set(imageData);
                    end = process.hrtime(start);
                    timeInNanos = end[0] * 1e9 + end[1];
                    console.log('zoomed fractal ms:', timeInNanos / 1000000);
                    await save_pixel_buffer('./output/fractal_pb24greyscale_eg5.png', pb, {format: 'png'});


                    // May be nice to put this into a function...
                    //  Or something where each pixel gets assigned by a function.

                    // Doing effects like erosion would be of use...
                    //  Could make another library for generative images.
                    //   Or multiple... maybe a fractal library / package.
                    //   jsgui3-gfx-fractal










                    zoomCenterX = 0.38;
                    zoomCenterY = 0.29;
                    zoomWindowWidth = canvasWidth / 24;
                    zoomWindowHeight = canvasHeight / 24;
                    start = process.hrtime();
                    imageData = draw_zoomed_fractal(canvasWidth, canvasHeight, zoomLevel, zoomCenterX, zoomCenterY, zoomWindowWidth, zoomWindowHeight);
                    pb.ta.set(imageData);
                    end = process.hrtime(start);
                    timeInNanos = end[0] * 1e9 + end[1];
                    console.log('zoomed fractal ms:', timeInNanos / 1000000);
                    await save_pixel_buffer('./output/fractal_pb24greyscale_eg6.png', pb, {format: 'png'});


                    // Under 1s perf - not great in terms of aiming for full screen 60fps animation - still OK for image generation purposes.
                    //  Multiple cores could help a lot...


                    





                    zoomCenterX = 0.379;
                    zoomCenterY = 0.291;
                    zoomWindowWidth = canvasWidth / 128;
                    zoomWindowHeight = canvasHeight / 128;
                    start = process.hrtime();
                    imageData = draw_zoomed_fractal(canvasWidth, canvasHeight, zoomLevel, zoomCenterX, zoomCenterY, zoomWindowWidth, zoomWindowHeight);
                    pb.ta.set(imageData);
                    end = process.hrtime(start);
                    timeInNanos = end[0] * 1e9 + end[1];
                    console.log('zoomed fractal ms:', timeInNanos / 1000000);
                    await save_pixel_buffer('./output/fractal_pb24greyscale_eg7.png', pb, {format: 'png'});

                    // Turn it to 8bipp?





                  pb = new Pixel_Buffer({
                      bits_per_pixel: 24,
                      size: large_size
                  });

                  zoomCenterX = 0.379;
                  zoomCenterY = 0.291;
                  zoomWindowWidth = large_size[0] / 128;
                  zoomWindowHeight = large_size[1] / 128;
                  start = process.hrtime();
                  imageData = draw_zoomed_fractal(large_size[0], large_size[1], zoomLevel, zoomCenterX, zoomCenterY, zoomWindowWidth, zoomWindowHeight);
                  pb.ta.set(imageData);
                  end = process.hrtime(start);
                  timeInNanos = end[0] * 1e9 + end[1];
                  console.log('zoomed fractal ms:', timeInNanos / 1000000);
                  

                  //timeInNanos = end[0] * 1e9 + end[1];

                  //console.log('pb.draw_polygon timeInNanos:', timeInNanos);
                  //console.log('fractal ms:', timeInNanos / 1000000);

                  await save_pixel_buffer('./output/fractal_pb24greyscale_eg8.png', pb, {format: 'png'});




                    // Just marginally faster.
                    let pb_gs8bipp = new Pixel_Buffer({
                        bits_per_pixel: 8,
                        size: size
                    });

                    // gs8bipp_draw_fractal

                    start = process.hrtime();
                    ta_fractal = gs8bipp_draw_fractal(size[0], size[1]);

                    pb_gs8bipp.ta.set(ta_fractal);
                    end = process.hrtime(start);

                    timeInNanos = end[0] * 1e9 + end[1];

                    //console.log('pb.draw_polygon timeInNanos:', timeInNanos);
                    console.log('gs8bipp fractal ms:', timeInNanos / 1000000);


                    await save_pixel_buffer('./output/fractal_pb8greyscale_eg0.png', pb_gs8bipp.to_24bipp(), {format: 'png'});


                    pb_gs8bipp = new Pixel_Buffer({
                      bits_per_pixel: 8,
                      size: large_size
                    });

                    // gs8bipp_draw_fractal

                    zoomCenterX = 0.379;
                    zoomCenterY = 0.291;
                    zoomWindowWidth = large_size[0] / 128;
                    zoomWindowHeight = large_size[1] / 128;
                    start = process.hrtime();
                    imageData = gs8bipp_draw_zoomed_fractal(large_size[0], large_size[1], zoomLevel, zoomCenterX, zoomCenterY, zoomWindowWidth, zoomWindowHeight);
                    pb_gs8bipp.ta.set(imageData);
                    end = process.hrtime(start);
                    timeInNanos = end[0] * 1e9 + end[1];
                    console.log('8bipp large zoomed fractal ms:', timeInNanos / 1000000);


                    await save_pixel_buffer('./output/fractal_pb8greyscale_eg1.png', pb_gs8bipp.to_24bipp(), {format: 'png'});


                    // Then can we threshold it to 1bipp?

                    let pb_1bipp = pb.extract_channel(0).get_1bipp_threshold_8bipp(128);

                    await save_pixel_buffer('./output/fractal_thresh_eg0.png', pb_1bipp.to_24bipp(), {format: 'png'});

                    pb_1bipp = pb.extract_channel(0).get_1bipp_threshold_8bipp(180);

                    await save_pixel_buffer('./output/fractal_thresh_eg1.png', pb_1bipp.to_24bipp(), {format: 'png'});


                    // Color fractals could be of use too....

                    







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