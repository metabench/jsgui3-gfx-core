

const Pixel_Buffer = require('../core/pixel-buffer');

const sharp = require('sharp');



if (require.main === module) {
    const lg = console.log;

    // A more concise example runner function....
    //   And would call pb generating functions, and save the results.



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
                            //console.log('should have saved to path: ' + path);

                            solve({
                                success: true,
                                message: 'should have saved to path: ' + path
                            });
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


        let eg_idx = 0;

        const save_path = './output/';

        const filename_prefix = 'pb24_eg'

        const filename_suffix = '.png';

        // Then create the filenames, save them in the run_example function.




        // Could take an example index????
        const run_example = async(fn_example, num_preruns = 0, mean_of = 1) => {

            // if prerunning.....


            // And could run the function multiple times.....

            // Maybe see about getting the speed running once, the 101th time.


            // And time it...?
            //   Could return an object that includes the ms taken.

            // get the pb (time it), save the pb.

            const hr2ms = ([second, nanosecond]) => {
                const ms_taken = (nanosecond / 1000000 + second * 1000);
                return ms_taken;
            }

            if (num_preruns > 0) {

                const console_log = console.log;

                console.log = () => {};

                for (let i_prerun = 0; i_prerun < num_preruns; i_prerun++) {
                    const pb = fn_example();
    
                }
                console.log = console_log;
            }

            


            const my_eg_index = eg_idx++;

            let eg_res;

            const start_time = process.hrtime();

            for (let i = 0; i < mean_of; i++) {
                eg_res = fn_example();

            }
            


            

            


            const end_time = process.hrtime(start_time);

            const pb = eg_res instanceof Pixel_Buffer ? eg_res : eg_res.pb;

            //if (eg_res in)

            // and an example misc results too....
            const misc = eg_res.misc;

            // Then save it....
            const eg_file_path = save_path + filename_prefix + (my_eg_index) + filename_suffix;

            if (pb) {
                //const pb8 = pb.to_8bipp();
                const o_save = await save_pixel_buffer_png(eg_file_path, pb);

                if (o_save && o_save.success) {

                    // ms_taken as total....
                    //const time_taken = end_time - start_time;

                    //console.log('end_time', end_time);

                    //const ms_taken = Math.round(end_time[1] / 1000000 + end_time[0] * 1000);
                    const ms_taken = (end_time[1] / 1000000 + end_time[0] * 1000) / mean_of;

                    // number per 60hz frame....
                    //  which is approx 17ms 16.6666666667ms

                    const frame_rate = 60;
                    //const ms_frame = 1000 / frame_rate;

                    //const ops_per_frame = 

                    // ops_per_second is 1000 / num ms taken

                    const ops_per_second = 1000 / ms_taken;
                    const ops_per_frame = ops_per_second / frame_rate;


                    const res_msg = my_eg_index.toString().padEnd(4, ' ') + (ms_taken.toFixed(2) + 'ms').padEnd(9, ' ') + (ops_per_frame.toFixed(2) + ' per frame').padEnd(19, ' ') + eg_file_path;

                    const run_res = {
                        idx: my_eg_index,
                        save_message: o_save.message,
                        ms_taken,
                        res_msg
                    }

                    

                    console.log(res_msg);
                    if (misc) {

                        // is the .time??

                        console.log('  misc', misc);

                        if (misc.time) {

                            if (misc.time.task) {
                                const ms_task = hr2ms(misc.time.task);
                                console.log('ms_task', ms_task);

                                const tasks_per_frame = (1000 / 60) / ms_task;

                                console.log('tasks_per_frame', tasks_per_frame);
                            }

                            
                        }
                    }

                    return run_res;

                }

            }

            

            

        }

        // And without having to create new pixel buffers????
        //   Could be very much faster in some / many cases, with creation of, maybe sharing of, scratch pixel buffers.


        const generate_star_points = (pos, size, inner_radius_ratio, num_spikes) => {
            const [x, y] = pos;
            const [width, height] = size;
            const center_x = x + width / 2;
            const center_y = y + height / 2;
            const outer_radius = Math.min(width, height) / 2;
            const inner_radius = Math.min(width, height) * inner_radius_ratio / 2;
            const step = Math.PI / num_spikes; // each spike has two points (outer and inner), meaning half the rotation per step
            let rotation = -Math.PI / 2; // start pointing upwards
        
            const points = [];
            for (let i = 0; i < num_spikes * 2; i++) {
                // Choose the correct radius (outer or inner) for the current point
                const radius = (i % 2 === 0) ? outer_radius : inner_radius;
                
                // Calculate x and y of the current point, ensuring it fits within bounds
                const x_point = Math.max(x, Math.min(x + width, center_x + radius * Math.cos(rotation)));
                const y_point = Math.max(y, Math.min(y + height, center_y + radius * Math.sin(rotation)));
        
                // Add the point to the list of points
                points.push([Math.round(x_point), Math.round(y_point)]);
        
                // Rotate the angle by half step
                rotation += step;
            }
            return points;
        };

        const pastel_peach = [255, 223, 186];
        const pastel_yellow = [255, 255, 186];
        const pastel_green = [186, 255, 201];
        const pastel_blue = [186, 225, 255];
        const pastel_purple = [204, 204, 255];
        const pastel_rose = [255, 204, 229];
        const pastel_apricot = [255, 229, 204];
        const pastel_mint = [229, 255, 204];
        const pastel_aqua = [204, 255, 255];
        const pastel_lavender = [255, 204, 255];


        const egs = [
            () => {
                const pb = new Pixel_Buffer({
                    bits_per_pixel: 24,
                    size: [8, 8]
                });
                const ta_pos = new Uint16Array(2);
                ta_pos[0] = 0;
                ta_pos[1] = 0;
                pb.set_pixel(ta_pos, pastel_lavender);
                ta_pos[0] = 3;
                ta_pos[1] = 3;
                pb.set_pixel(ta_pos, pastel_lavender);
                ta_pos[0] = 4;
                pb.set_pixel(ta_pos, pastel_lavender);
                return pb;
            },
            () => {

                return false;

                // 8x8 blocks becoming (more) standard?
                //   using them to write the 8x8 blocks?

                // Locally addressable 8x8 squares???



                const pb = new Pixel_Buffer({
                    bits_per_pixel: 24,
                    size: [21, 21]
                });
                pb.draw_polygon([[1, 1,], [15, 4], [15, 15], [4, 15]], pastel_purple);
                const pb_polygon_edge = pb.clone();
                pb.flood_fill(0, 0, ...[pastel_rose]);
                pb.invert();
                pb.or(pb_polygon_edge);
                return pb;
            },
            () => {

                // 8x8 blocks becoming (more) standard?
                //   using them to write the 8x8 blocks?

                // Locally addressable 8x8 squares???



                const pb = new Pixel_Buffer({
                    bits_per_pixel: 24,
                    size: [21, 21]
                });
                pb.draw_polygon([[1, 1,], [15, 4], [15, 15], [4, 15]], pastel_rose, true);
                return pb;
            },
            () => {

                //return false;

                // 8x8 blocks becoming (more) standard?
                //   using them to write the 8x8 blocks?

                // Locally addressable 8x8 squares???

                //const start_time = process.hrtime();

                // 2048 instead for now....

                const pb = new Pixel_Buffer({
                    bits_per_pixel: 24,
                    size: [64, 64]
                });
                //let start = process.hrtime();

                //const create_time = process.hrtime(start_time);

                //const pre_compose_time = process.hrtime();

                //pb.draw_polygon([[900, 900,], [200, 200], [1000, 900], [1600, 200], [1000, 1000], [1100, 800], [1000, 1100], [1000, 1600], [900, 1600]], 1, true);

                // Drawing filled polygons should be sped up greatly....
                // Se about getting the x off spans....

                //pb.draw_polygon([[900, 900,], [200, 200], [1000, 900], [1600, 200], [1000, 1000], [1100, 800], [1000, 1100], [1000, 1600], [900, 1600]], 1, true);
                pb.draw_polygon([[28, 28], [6, 6], [31, 28], [50, 6], [31, 31], [31, 34], [31, 50], [28, 50]], pastel_rose, false);

                
                return pb;
                return {
                    pb,
                    misc: {
                        time: {
                            create: create_time,
                            compose: compose_time,
                            task: task_time
                        },
                        c_all: c_all,
                        //c_all_0,
                        //c_all_1,
                        //c_not_all_0_or_1
                    }
                };


                //return pb;
            },
            () => {

                //return false;

                // 8x8 blocks becoming (more) standard?
                //   using them to write the 8x8 blocks?

                // Locally addressable 8x8 squares???

                const start_time = process.hrtime();

                // 2048 instead for now....

                const pb = new Pixel_Buffer({
                    bits_per_pixel: 24,
                    size: [64, 64]
                });
                //let start = process.hrtime();

                //const create_time = process.hrtime(start_time);

                //const pre_compose_time = process.hrtime();

                //pb.draw_polygon([[900, 900,], [200, 200], [1000, 900], [1600, 200], [1000, 1000], [1100, 800], [1000, 1100], [1000, 1600], [900, 1600]], 1, true);


                // Drawing filled polygons should be sped up greatly....

                // Se about getting the x off spans....



                //pb.draw_polygon([[900, 900,], [200, 200], [1000, 900], [1600, 200], [1000, 1000], [1100, 800], [1000, 1100], [1000, 1600], [900, 1600]], 1, true);
                pb.draw_polygon([[28, 28], [6, 6], [31, 28], [50, 6], [31, 31], [31, 34], [31, 50], [28, 50]], pastel_rose, true);
                return pb;
                

                return {
                    pb,
                    misc: {
                        time: {
                            create: create_time,
                            compose: compose_time,
                        },
                        //c_all: c_all,
                        //c_all_0,
                        //c_all_1,
                        //c_not_all_0_or_1
                    }
                };


                //return pb;
            },
            () => {

                //return false;

                // 8x8 blocks becoming (more) standard?
                //   using them to write the 8x8 blocks?

                // Locally addressable 8x8 squares???

                //const start_time = process.hrtime();

                // 2048 instead for now....

                const pb = new Pixel_Buffer({
                    bits_per_pixel: 24,
                    size: [2048, 2048]
                });
                //let start = process.hrtime();

                //const create_time = process.hrtime(start_time);

                //const pre_compose_time = process.hrtime();

                //pb.draw_polygon([[900, 900,], [200, 200], [1000, 900], [1600, 200], [1000, 1000], [1100, 800], [1000, 1100], [1000, 1600], [900, 1600]], 1, true);

                // Drawing filled polygons should be sped up greatly....
                // Se about getting the x off spans....

                //pb.draw_polygon([[900, 900,], [200, 200], [1000, 900], [1600, 200], [1000, 1000], [1100, 800], [1000, 1100], [1000, 1600], [900, 1600]], 1, true);
                pb.draw_polygon([[900, 900,], [200, 200], [1000, 900], [1600, 200], [1000, 1000], [1000, 1100], [1000, 1600], [900, 1600]], pastel_rose, false);


                
                return pb;
                return {
                    pb,
                    misc: {
                        time: {
                            create: create_time,
                            compose: compose_time,
                            task: task_time
                        },
                        c_all: c_all,
                        //c_all_0,
                        //c_all_1,
                        //c_not_all_0_or_1
                    }
                };


                //return pb;
            },
            () => {

                //return false;

                // 8x8 blocks becoming (more) standard?
                //   using them to write the 8x8 blocks?

                // Locally addressable 8x8 squares???

                const start_time = process.hrtime();

                // 2048 instead for now....

                const pb = new Pixel_Buffer({
                    bits_per_pixel: 24,
                    size: [2048, 2048]
                });
                pb.draw_polygon([[900, 900,], [200, 200], [1000, 900], [1600, 200], [1000, 1000], [1000, 1100], [1000, 1600], [900, 1600]], pastel_rose, true);
                return pb;
                

                //const compose_time = process.hrtime(pre_compose_time);

                // Then see about getting these as the x spans....

                //const pre_task_time = process.hrtime();

                


                

                return {
                    pb,
                    misc: {
                        time: {
                            create: create_time,
                            compose: compose_time,
                        },
                        //c_all: c_all,
                        //c_all_0,
                        //c_all_1,
                        //c_not_all_0_or_1
                    }
                };


                //return pb;
            },
            () => {

                //return false;

                // 8x8 blocks becoming (more) standard?
                //   using them to write the 8x8 blocks?

                // Locally addressable 8x8 squares???

                const start_time = process.hrtime();

                // 2048 instead for now....

                const pb = new Pixel_Buffer({
                    bits_per_pixel: 24,
                    size: [2048, 2048]
                });
                const star_points = generate_star_points([100, 100], [1800, 1800], 0.67, 72);
                pb.draw_polygon(star_points, pastel_rose, false);
                return pb;
                

                //const compose_time = process.hrtime(pre_compose_time);

                // Then see about getting these as the x spans....

                //const pre_task_time = process.hrtime();

                


                

                return {
                    pb,
                    misc: {
                        time: {
                            create: create_time,
                            compose: compose_time,
                        },
                        //c_all: c_all,
                        //c_all_0,
                        //c_all_1,
                        //c_not_all_0_or_1
                    }
                };


                //return pb;
            },
            () => {

                //return false;
                const start_time = process.hrtime();
                const pb = new Pixel_Buffer({
                    bits_per_pixel: 24,
                    size: [2048, 2048]
                });
                const star_points = generate_star_points([100, 100], [1800, 1800], 0.67, 72);
                pb.draw_polygon(star_points, pastel_mint, true);
                return pb;
                

                return {
                    pb,
                    misc: {
                        time: {
                            create: create_time,
                            compose: compose_time,
                        },
                        //c_all: c_all,
                        //c_all_0,
                        //c_all_1,
                        //c_not_all_0_or_1
                    }
                };


                //return pb;
            },
            () => {
                return false;

                const w_scale_factor = 2;
                const pb = new Pixel_Buffer({
                    bits_per_pixel: 1,
                    size: [64 * w_scale_factor, 64]
                });
                pb.draw_polygon([[4 * w_scale_factor, 4], [46 * w_scale_factor, 4], [56 * w_scale_factor, 58], [6 * w_scale_factor, 58]], 1);
                let c_cb = 0;
                pb.iterate_all_ui64_locations_1bipp((ui32a_px_range => {
                    //console.log('ui32a_px_range', ui32a_px_range);
                    c_cb++;
                }));
                return {
                    pb,
                    misc: {
                        c_cb
                    }
                };
            },
            () => {
                return false;

                const w_scale_factor = 3;
                const pb = new Pixel_Buffer({
                    bits_per_pixel: 1,
                    size: [64 * w_scale_factor, 64]
                });
                pb.draw_polygon([[4 * w_scale_factor, 4], [46 * w_scale_factor, 4], [56 * w_scale_factor, 58], [6 * w_scale_factor, 58]], 1);
                let c_cb = 0;
                pb.iterate_all_ui64_locations_1bipp((ui32a_px_range => {
                    //console.log('ui32a_px_range', ui32a_px_range);
                    c_cb++;
                }));
                return {
                    pb,
                    misc: {
                        c_cb
                    }
                };
            },
            () => {
                return false;

                const w_scale_factor = 4;
                const pb = new Pixel_Buffer({
                    bits_per_pixel: 1,
                    size: [64 * w_scale_factor, 64]
                });
                pb.draw_polygon([[4 * w_scale_factor, 4], [46 * w_scale_factor, 4], [56 * w_scale_factor, 58], [6 * w_scale_factor, 58]], 1);
                let c_cb = 0;
                pb.iterate_all_ui64_locations_1bipp((ui32a_px_range => {
                    //console.log('ui32a_px_range', ui32a_px_range);
                    c_cb++;
                }));
                return {
                    pb,
                    misc: {
                        c_cb
                    }
                };
            },
            () => {
                return false;

                const w_scale_factor = 5;
                const pb = new Pixel_Buffer({
                    bits_per_pixel: 1,
                    size: [64 * w_scale_factor, 64]
                });
                pb.draw_polygon([[4 * w_scale_factor, 4], [46 * w_scale_factor, 4], [56 * w_scale_factor, 58], [6 * w_scale_factor, 58]], 1);
                let c_cb = 0;
                pb.iterate_all_ui64_locations_1bipp((ui32a_px_range => {
                    //console.log('ui32a_px_range', ui32a_px_range);
                    c_cb++;
                }));
                return {
                    pb,
                    misc: {
                        c_cb
                    }
                };
            },
            () => {
                return false;
                const w_scale_factor = 1;
                const h_scale_factor = 2;
                const pb = new Pixel_Buffer({
                    bits_per_pixel: 1,
                    size: [64 * w_scale_factor, 64 * h_scale_factor]
                });
                pb.draw_polygon([[4 * w_scale_factor, 4 * h_scale_factor], [46 * w_scale_factor, 4 * h_scale_factor], [56 * w_scale_factor, 58 * h_scale_factor], [6 * w_scale_factor, 58 * h_scale_factor]], 1);
                let c_cb = 0;
                pb.iterate_all_ui64_locations_1bipp((ui32a_px_range => {
                    //console.log('ui32a_px_range', ui32a_px_range);
                    c_cb++;
                }));
                return {
                    pb,
                    misc: {
                        c_cb
                    }
                };
            },
            () => {
                return false;

                const pb = new Pixel_Buffer({
                    bits_per_pixel: 1,
                    size: [3200, 3200]
                });
                // // Draw rectangles all over it....???
                // Such as drawing 40 rectangles
                // and a 'color' property to begin with....
                // a 'color' property in the spec could help.
    
    
                // Will want some kind of realignment of it.
    
                // When they are not fully aligned, make sure the original parts of what was there get left / put back.
    
                // Basically will be a lot better to write 64 pixels at once with few operations.
    
                // Determine how to realign it while copying....
                //   How much it would be out by, and where.
    
                // Should be possible to build it back up properly.
                //   Knowing the details of what operations to do first.
    
                // The shifted-read copy seems like one of the best ways???
                //   Or shifted-write, as going through the source is a simpler process.
    
                const tile_full_w = (128 * 2) + 16, tile_full_h = (64 * 2) + 16;
                const tile_margin_w = 16, tile_margin_h = 16;
    
                // See about doing realigning writes....
    
                const tile_inner_w = tile_full_w - tile_margin_w, tile_inner_h = tile_full_h - tile_margin_h;
                const pb_rect_tile = new Pixel_Buffer({
                    bits_per_pixel: 1,
                    size: [tile_inner_w, tile_inner_h]
                });
                pb_rect_tile.ta.fill(255);
                // 
                //pb_rect_tile.draw_rect([1, (tile_inner_h >> 1) - 4], [tile_inner_w - 1, (tile_inner_h >> 1) + 4], 0);
                //pb_rect_tile.draw_rect([(tile_inner_w >> 1) - 4, 1], [(tile_inner_w >> 1) + 4, tile_inner_h - 1], 0);
    
                pb_rect_tile.draw_rect([1, (tile_inner_h >>> 1) - 4], [tile_inner_w - 2, (tile_inner_h >>> 1) + 4], 0);
                pb_rect_tile.draw_rect([(tile_inner_w >>> 1) - 4, 1], [(tile_inner_w >>> 1) + 4, tile_inner_h - 2], 0);
    
                // Then past that rectangular tile in a variety of positions....
                const num_tile_columns = 10;
                const num_tile_rows = 18;
                // tile x spacing
                //const tile_x_spacing = 124;
                //const tile_y_spacing = 94;
                let px_x = tile_margin_w, px_y = tile_margin_h;
                // Optimising the draw_1bipp_pixel_buffer_mask will speed this up the most.

                
                for (let row = 0; row < num_tile_rows; row++) {
    
                    // moving from right to left....
    
                    px_x = tile_margin_w + tile_full_w * (num_tile_columns - 1);
    
    
                    for (let column = 0; column < num_tile_columns; column++) {
                        // then some kind of paint pixel buffer to pixel buffer.
                        // 'draw_1bipp_pixel_buffer_mask'(pb_1bipp_mask, dest_pos, color)
                        pb.draw_1bipp_pixel_buffer_mask(pb_rect_tile, [px_x, px_y], 1);
                        px_x -= tile_full_w;
                    }
                    px_y += tile_full_h;
                }
                return pb;
            }
        ]

        const run_examples = async(num_preruns = 0) => {
            for (const eg of egs) {
                await run_example(eg, num_preruns);
            }
        }



        // And could take an average too.

        //await run_examples(256, 256);
        //await run_examples(128, 128);

        //await run_examples(512, 512);

        await run_examples(1024, 512);
        //await run_examples(0);

        //await run_examples(9, 9);

        //await run_examples(32, 4);

        //await run_examples(66, 25);

        //await run_examples(4000);
    })();



}