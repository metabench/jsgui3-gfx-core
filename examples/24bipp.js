

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
                //let start = process.hrtime();

                //const create_time = process.hrtime(start_time);

                //const pre_compose_time = process.hrtime();

                //pb.draw_polygon([[900, 900,], [200, 200], [1000, 900], [1600, 200], [1000, 1000], [1100, 800], [1000, 1100], [1000, 1600], [900, 1600]], 1, true);


                // Drawing filled polygons should be sped up greatly....

                // Se about getting the x off spans....



                //pb.draw_polygon([[900, 900,], [200, 200], [1000, 900], [1600, 200], [1000, 1000], [1100, 800], [1000, 1100], [1000, 1600], [900, 1600]], 1, true);
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
                //let start = process.hrtime();

                //const create_time = process.hrtime(start_time);

                //const pre_compose_time = process.hrtime();

                //pb.draw_polygon([[900, 900,], [200, 200], [1000, 900], [1600, 200], [1000, 1000], [1100, 800], [1000, 1100], [1000, 1600], [900, 1600]], 1, true);


                // Drawing filled polygons should be sped up greatly....

                // Se about getting the x off spans....



                //pb.draw_polygon([[900, 900,], [200, 200], [1000, 900], [1600, 200], [1000, 1000], [1100, 800], [1000, 1100], [1000, 1600], [900, 1600]], 1, true);

                const star_points = generate_star_points([100, 100], [1800, 1800], 0.67, 72);
                //console.log('star_points', star_points);

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
            },
            () => {
                return false;

                // For the y rows, what is the x value of the toggles?

                // Should be helpful for a much faster flood fill.

                // An option to suppress logging, for when it's a prerun.

                // But only testing the speed of a particular op, not setting up the pb...
                //  Or 2 ops maybe.
                //   pb could have a default 'paint' or 'compose' routine.
                //     compose would make sense as a reference to compose in jsgui.


                // Could get a bunch of different timings.

                const w_scale_factor = 4;
                const h_scale_factor = 3;

                //const w_scale_factor = 2;
                //const h_scale_factor = 1;


                // create instance timing


                const start_time = process.hrtime();

                const pb = new Pixel_Buffer({
                    bits_per_pixel: 1,
                    size: [64 * w_scale_factor, 64 * h_scale_factor]
                });

                const create_time = process.hrtime(start_time);

                const pre_compose_time = process.hrtime();

                pb.draw_polygon([[4 * w_scale_factor, 4 * h_scale_factor], [46 * w_scale_factor, 4 * h_scale_factor], [56 * w_scale_factor, 58 * h_scale_factor], [6 * w_scale_factor, 58 * h_scale_factor]], 1);

                const compose_time = process.hrtime(pre_compose_time);
                

                //let c_cb = 0;

                // And then it would be easy to iterate them all as values.

                // Then some other task time.

                // have the ui64 ta????

                // and iterate through the values in those locations????
                //   though really in the future will use this structure to do some operations such as finding spans and then groups of contiguous color.


                // 18446744073709551615

                let i = 0;
                //const ta64 = pb.ta64;

                const dv = pb.dv;

                let c_all_0 = 0, c_all_1 = 0, c_not_all_0_or_1 = 0; // 18446744073709551615



                let prev_x0, prev_y0, prev_x1, prev_y1;
                let x0, y0, x1, y1;

                // number of 64bit sections per row - 1 ...

                //const n64prm1 = (pb.size[0] >> 6) - 1;
                //console.log('n64prm1', n64prm1);

                
                let str_row_binary = '';
                let str_lsxor_row_binary = '';
                let str_rsxor_row_binary = '';
                let str_row_rs = '';

                const wm1 = pb.size[0] - 1;
                let b = 0;

                

                // iterating the 32 bit locations will likely be faster in JS (unfortunately).



                // pb.fast_each_row_x_0_span(cb)
                //   could be fast enough for now, simple enough too.



                

                const it64 = () => {
                    pb.iterate_all_ui64_locations_1bipp((ui32a_px_range => {

                        [x0, y0, x1, y1] = ui32a_px_range;

                        if (x0 === 0) {
                            str_row_binary = '';
                            str_lsxor_row_binary = '';
                            str_rsxor_row_binary = '';
                        }

                        // detecting when it's a new row, tracking the index within the row

                        // Could then load up the 64 bit data for each of them.

                        //const v64 = ta64[i];
                        const v64 = dv.getBigUint64(b);

                        // But shifting the correct value from the previous one into place....
                        //   shift left by 63?
                        //     or use a mask with 1????


                        const l_shifted_xor_v64 = v64^(v64 << 1n);


                        const r_shifted_xor_v64 = v64^(v64 >> 1n);
                        // And get the one before...

                        

                        if (v64 === 0n) {
                            c_all_0++;
                        } else if (v64 === 18446744073709551615n) {
                            c_all_1++;
                        } else {
                            c_not_all_0_or_1++;
                        }
                        //console.log('i', i, 'ui32a_px_range', ui32a_px_range, 'v64', v64);
                        //c_cb++;

                        // Detect if it's the last in the row.

                        if (x0 > 0) {
                            str_row_binary += ' ' + v64.toString(2).padStart(64, '0');
                            str_lsxor_row_binary += ' ' + l_shifted_xor_v64.toString(2).padStart(64, '0');
                            str_rsxor_row_binary += ' ' + r_shifted_xor_v64.toString(2).padStart(64, '0');
                        } else {
                            str_row_binary += v64.toString(2).padStart(64, '0');
                            str_lsxor_row_binary += l_shifted_xor_v64.toString(2).padStart(64, '0');
                            str_rsxor_row_binary += r_shifted_xor_v64.toString(2).padStart(64, '0');
                        }

                        
                        //console.log('x1', x1);
                        if (x1 === wm1) {
                            
                            // the full row string binary

                            const str_full_row_binary = str_row_binary;
                            const str_lsxor_full_row_binary = str_lsxor_row_binary;
                            const str_rsxor_full_row_binary = str_rsxor_row_binary;
                            //console.log('str_full_row_binary', str_full_row_binary);
                            //console.log('str_lsxor_full_row_binary', str_lsxor_full_row_binary);
                            console.log('str_rsxor_full_row_binary', str_rsxor_full_row_binary);
                        }


                        i++;
                        b+=8;
                        [prev_x0, prev_y0, prev_x1, prev_y1] = [x0, y0, x1, y1];
                    }));
                }

                // What about shift xoring a whole line / row?





                const logging_it32 = () => {

                    // 2 ^ 31 = 2147483648

                    // 4294967295
                    const MAX_UINT32 = (Math.pow( 2, 32 ) - 1) | 0;


                    let l_shifted_xor_v32, r_shifted_xor_v32, rshifted_v32, lastv32;

                    pb.iterate_all_ui32_locations_1bipp((ui32a_px_range => {

                        [x0, y0, x1, y1] = ui32a_px_range;

                        //console.log('ui32a_px_range', ui32a_px_range);


                        if (x0 === 0) {
                            str_row_binary = '';
                            str_row_rs = '';
                            str_lsxor_row_binary = '';
                            str_rsxor_row_binary = '';
                        }

                        // detecting when it's a new row, tracking the index within the row

                        // Could then load up the 64 bit data for each of them.

                        //const v64 = ta64[i];
                        const v32 = dv.getUint32(b);

                        // But shifting the correct value from the previous one into place....
                        //   shift left by 63?
                        //     or use a mask with 1????


                        l_shifted_xor_v32 = v32^(v32 << 1);

                        // But want to copy over the last value from the previous one....

                        rshifted_v32 = (v32 >>> 1);

                        //console.log('1) rshifted_v32', rshifted_v32);


                        if (x0 > 0) {


                            if ((lastv32 & 1) === 1) {
                                rshifted_v32 = (rshifted_v32 | 2147483648) >>> 0;
                            }


                            //rshifted_v32 = (rshifted_v32 | ((lastv32 << 31) >>> 0));
                        }
                        //console.log('2) rshifted_v32', rshifted_v32);

                        // and want to include the first value from the next one where possible too.

                        r_shifted_xor_v32 = (v32^rshifted_v32) >>> 0;
                        // And get the one before...
                        

                        if (v32 === 0) {
                            c_all_0++;
                        } else if (v32 === MAX_UINT32) {
                            c_all_1++;
                        } else {
                            c_not_all_0_or_1++;
                        }
                        //console.log('i', i, 'ui32a_px_range', ui32a_px_range, 'v64', v64);
                        //c_cb++;

                        // Detect if it's the last in the row.

                        if (x0 > 0) {
                            str_row_binary += ' ' + v32.toString(2).padStart(32, '0');
                            str_lsxor_row_binary += ' ' + l_shifted_xor_v32.toString(2).padStart(32, '0');
                            str_rsxor_row_binary += ' ' + r_shifted_xor_v32.toString(2).padStart(32, '0');
                            str_row_rs += ' ' + rshifted_v32.toString(2).padStart(32, '0');
                        } else {
                            str_row_binary += v32.toString(2).padStart(32, '0');
                            str_lsxor_row_binary += l_shifted_xor_v32.toString(2).padStart(32, '0');
                            str_rsxor_row_binary += r_shifted_xor_v32.toString(2).padStart(32, '0');
                            str_row_rs += rshifted_v32.toString(2).padStart(32, '0');
                        }

                        
                        //console.log('x1', x1);
                        if (x1 === wm1) {
                            
                            // the full row string binary

                            const str_full_row_binary = str_row_binary;
                            const str_lsxor_full_row_binary = str_lsxor_row_binary;
                            const str_rsxor_full_row_binary = str_rsxor_row_binary;


                            //console.log('');
                            //console.log('str_full_row_binary      ', str_full_row_binary);
                            //console.log('str_row_rs               ', str_row_rs);
                            //console.log('str_lsxor_full_row_binary', str_lsxor_full_row_binary);
                            console.log('str_rsxor_full_row_binary', str_rsxor_full_row_binary);

                        }

                        i++;
                        b+=4;
                        lastv32 = v32;
                        [prev_x0, prev_y0, prev_x1, prev_y1] = [x0, y0, x1, y1];
                    }));
                }

                // And really this shows where there are toggle positions.



                // iterating the x values where the x span value toggles on the rows could be a good way of doing it.


                // The distance between the toggle points, meaning the spans.

                // The toggle points


                // Could it produce/ populate a ta of where the toggle points are?
                //   number of toggle points per row, then the toggle points in that row?


                // Maybe have a system for going through a defined row of them????



                // and a callback for when they are found....
                //   x and y only I think.

                // Could iterate row iterators even.

                // Writing them in sequence into a ta could work well of course.


                // Callbacks for all the toggle points could be fairly convenient.
                //   Though running through it (inline) without any callbacks would likely be most efficient. Not sure exactly though.




                const it32 = (cb) => {
                    // 2 ^ 31 = 2147483648
                    // 4294967295
                    //const MAX_UINT32 = (Math.pow( 2, 32 ) - 1) | 0;

                    let r_shifted_xor_v32, rshifted_v32, lastv32;

                    pb.iterate_all_ui32_locations_1bipp((ui32a_px_range => {
                        [x0, y0, x1, y1] = ui32a_px_range;
                        

                        if (x0 === 0) {


                        }

                        // detecting when it's a new row, tracking the index within the row

                        // Could then load up the 64 bit data for each of them.

                        //const v64 = ta64[i];
                        const v32 = dv.getUint32(b);
                        rshifted_v32 = (v32 >>> 1);
                        if (x0 > 0) {
                            if ((lastv32 & 1) === 1) {
                                rshifted_v32 = (rshifted_v32 | 2147483648) >>> 0;
                            }
                            //rshifted_v32 = (rshifted_v32 | ((lastv32 << 31) >>> 0));
                        }
                        //console.log('2) rshifted_v32', rshifted_v32);
                        // and want to include the first value from the next one where possible too.
                        r_shifted_xor_v32 = (v32^rshifted_v32) >>> 0;

                        // But this is where there are changes in the x color from the pixel before.



                        // Want to determine which bits are set.

                        



                        // Which of the bits are different to the previous one?
                        // And get the one before...

                        let ibit = -1;

                        // is the 0 bit set?
                        //   or start at -1 even.
                        //   would make sense for returning -1 too.


                        ibit = find_next_set_bit(r_shifted_xor_v32, ibit);

                        // And the bit within the row.
                        //   These places are where the x span color toggles take place.


                        if (ibit !== false) {


                            //const x = x0 + ibit;

                            //console.log('');
                            //console.log('ui32a_px_range', ui32a_px_range);
                            //console.log(r_shifted_xor_v32.toString(2).padStart(32, '0'));

                            //console.log('y', y0, 'ibit', ibit);
                            //throw 'stop';

                            cb(x0 + ibit, y0);

                            //console.log('x', x, 'y', y0, 'ibit', ibit, 'byte_within_img', b);
                            while (ibit !== false && ibit < 31) {
                                ibit = find_next_set_bit(r_shifted_xor_v32, ibit);

                                if (ibit !== false) {
                                    //const x = x0 + ibit;
                                    //console.log('x', x, 'y', y0, 'ibit', ibit, 'byte_within_img', b);

                                    cb(x0 + ibit, y0);
                                }
                                
                            }
                        }

                        
                        


                        /*
                        
                        if (v32 === 0) {


                            //c_all_0++;
                        } else if (v32 === 4294967295) {
                            //c_all_1++;


                        } else {

                            // Iterate through it until no more set bits.

                            //c_not_all_0_or_1++;


                        }
                        */
                            
                            

                        i++;
                        b+=4;
                        lastv32 = v32;
                        [prev_x0, prev_y0, prev_x1, prev_y1] = [x0, y0, x1, y1];
                    }));
                }
            
                let c = 0;

                const arr_toggle_positons = [];

                const pre_task_time = process.hrtime();

                // Want to put them into an object that represents the x spans or toggle positions better.
                //   Single color x spans holder...?


                // Representing the x-spans together efficiently....
                //   May want to represent them as groups, efficient / auto grouping will help.
                //     


                // Maybe could first get the popcount on the whole thing.
                //   That would determine the length of the whole thing, how many toggle positions there are.

                // Counting toggle positions using shifts and popcount....
                //   Creating or populating the ta (use a buffer?) of the shifted xor values - the toggle positions.

                // pb.row[y].iterate_1bipp_color_span_toggle_positions???





                // putting them into a ta could be (much) faster.

                

                it32((x, y) => {

                    //console.log('x, y', x, y);
                    //arr_toggle_positons.push([x, y]);

                    c++;
                });

                

                //const c_not_all_0_or_1 = (i - c_all_0) - c_all_1;

                // const pre_task_time = process.hrtime();
                const task_time = process.hrtime(pre_task_time);

                console.log('c', c);
                console.log('arr_toggle_positons', arr_toggle_positons);

                //console.log('[c_all_0, c_all_1]', [c_all_0, c_all_1]);

                // But iterating 

                // And the number of color toggles per segment...?
                //  Could get this with bitshift of 1 and xor

                // then could do a relatively fast population count I expect.
                //  would be 0 if all 0s or 1s.

                // Then should be able to identify spans of the same color better / best.

                // Identify positions of the relevent spans....

                // Could narrow it down with a sequence of AND masks to find on values quickly.
                //   So divide and conquer - first into 32 bit pieces, see if any are on on each side. Then for any that are on, divide further.
                //     
                
                return {
                    pb,
                    misc: {
                        time: {
                            create: create_time,
                            compose: compose_time,
                            task: task_time
                        },
                        c_all: i,
                        //c_all_0,
                        //c_all_1,
                        //c_not_all_0_or_1
                    }
                };
            }
        ]

        const run_examples = async(num_preruns = 0) => {
            for (const eg of egs) {
                await run_example(eg, num_preruns);
            }
        }



        // And could take an average too.

        //await run_examples(256, 256);

        //await run_examples(512, 512);

        //await run_examples(1024, 512);
        //await run_examples(0);

        //await run_examples(9, 9);

        //await run_examples(32, 4);

        await run_examples(66, 25);

        //await run_examples(4000);
    })();



}