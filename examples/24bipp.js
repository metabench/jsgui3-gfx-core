const Pixel_Buffer = require('../core/pixel-buffer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
if (require.main === module) {
    const lg = console.log;
    (async() => {
        const save_pixel_buffer_png = (path, pb) => {
            return new Promise((solve, jettison) => {
                const {meta} = pb;
                let channels;
                if (meta.bytes_per_pixel === 3 || meta.bytes_per_pixel === 4) {
                    channels = meta.bytes_per_pixel;
                } else if (meta.bytes_per_pixel === 1) {
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
                    .toFile(path, (err, info) => { 
                        if (err) {
                            throw err;
                        } else {
                            solve({
                                success: true,
                                message: 'should have saved to path: ' + path
                            });
                        }
                    });
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
        const save_path = path.join(__dirname, 'output') + path.sep;
        const filename_prefix = 'pb24_eg'
        const filename_suffix = '.png';
        const run_example = async(fn_example, num_preruns = 0, mean_of = 1) => {
            const hr2ms = ([second, nanosecond]) => {
                const ms_taken = (nanosecond / 1000000 + second * 1000);
                return ms_taken;
            }
            if (num_preruns > 0) {
                const console_log = console.log;
                console.log = () => {};
                for (let i_prerun = 0; i_prerun < num_preruns; i_prerun++) {
                    const res = fn_example();
                    if (res && typeof res.then === 'function') {
                        await res;
                    }
                }
                console.log = console_log;
            }
            const my_eg_index = eg_idx++;
            let eg_res;
            const start_time = process.hrtime();
            for (let i = 0; i < mean_of; i++) {
                eg_res = fn_example();
                if (eg_res && typeof eg_res.then === 'function') {
                    eg_res = await eg_res;
                }
            }
            const end_time = process.hrtime(start_time);
            const pb = eg_res instanceof Pixel_Buffer ? eg_res : eg_res && eg_res.pb;
            const misc = eg_res && eg_res.misc;
            // Support overriding the measured time (eg: only measure a specific operation like resize)
            let primary_measurement_label;
            let ms_taken_overridden;
            if (eg_res && eg_res.measurement && eg_res.measurement.primary && misc && misc.time && misc.time[eg_res.measurement.primary]) {
                primary_measurement_label = eg_res.measurement.primary;
                ms_taken_overridden = hr2ms(misc.time[primary_measurement_label]);
            }
            const eg_file_path = save_path + filename_prefix + (my_eg_index) + filename_suffix;
            if (pb) {
                const outputDir = path.dirname(eg_file_path);
                if (!fs.existsSync(outputDir)) {
                    fs.mkdirSync(outputDir, { recursive: true });
                }
                const o_save = await save_pixel_buffer_png(eg_file_path, pb);
                if (o_save && o_save.success) {
                    const ms_taken_total = (end_time[1] / 1000000 + end_time[0] * 1000) / mean_of;
                    const ms_taken = ms_taken_overridden !== undefined ? ms_taken_overridden : ms_taken_total;
                    const frame_rate = 60;
                    const ops_per_second = 1000 / ms_taken;
                    const ops_per_frame = ops_per_second / frame_rate;
                    const label_prefix = primary_measurement_label ? (primary_measurement_label + ':') : '';
                    const res_msg = my_eg_index.toString().padEnd(4, ' ') + (label_prefix + ms_taken.toFixed(2) + 'ms').padEnd(14, ' ') + (ops_per_frame.toFixed(2) + ' per frame').padEnd(19, ' ') + eg_file_path;
                    const run_res = {
                        idx: my_eg_index,
                        save_message: o_save.message,
                        ms_taken,
                        res_msg,
                        primary_measurement_label
                    }
                    console.log(res_msg);
                    if (misc) {
                        console.log('  misc', misc);
                        if (misc.time) {
                            if (misc.time.task) {
                                const ms_task = hr2ms(misc.time.task);
                                console.log('ms_task', ms_task);
                                const tasks_per_frame = (1000 / 60) / ms_task;
                                console.log('tasks_per_frame', tasks_per_frame);
                            }
                            if (primary_measurement_label && misc.time[primary_measurement_label]) {
                                const ms_primary = hr2ms(misc.time[primary_measurement_label]);
                                console.log(primary_measurement_label + '_ms', ms_primary);
                            }
                        }
                    }
                    return run_res;
                }
            }
        }
        const generate_star_points = (pos, size, inner_radius_ratio, num_spikes) => {
            const [x, y] = pos;
            const [width, height] = size;
            const center_x = x + width / 2;
            const center_y = y + height / 2;
            const outer_radius = Math.min(width, height) / 2;
            const inner_radius = Math.min(width, height) * inner_radius_ratio / 2;
            const step = Math.PI / num_spikes; 
            let rotation = -Math.PI / 2; 
            const points = [];
            for (let i = 0; i < num_spikes * 2; i++) {
                const radius = (i % 2 === 0) ? outer_radius : inner_radius;
                const x_point = Math.max(x, Math.min(x + width, center_x + radius * Math.cos(rotation)));
                const y_point = Math.max(y, Math.min(y + height, center_y + radius * Math.sin(rotation)));
                points.push([Math.round(x_point), Math.round(y_point)]);
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
                const pb = new Pixel_Buffer({
                    bits_per_pixel: 24,
                    size: [21, 21]
                });
                pb.draw_polygon([[1, 1,], [15, 4], [15, 15], [4, 15]], pastel_rose, true);
                return pb;
            },
            () => {
                const pb = new Pixel_Buffer({
                    bits_per_pixel: 24,
                    size: [64, 64]
                });
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
                    }
                };
            },
            () => {
                const start_time = process.hrtime();
                const pb = new Pixel_Buffer({
                    bits_per_pixel: 24,
                    size: [64, 64]
                });
                pb.draw_polygon([[28, 28], [6, 6], [31, 28], [50, 6], [31, 31], [31, 34], [31, 50], [28, 50]], pastel_rose, true);
                return pb;
                return {
                    pb,
                    misc: {
                        time: {
                            create: create_time,
                            compose: compose_time,
                        },
                    }
                };
            },
            () => {
                const pb = new Pixel_Buffer({
                    bits_per_pixel: 24,
                    size: [2048, 2048]
                });
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
                    }
                };
            },
            () => {
                const start_time = process.hrtime();
                const pb = new Pixel_Buffer({
                    bits_per_pixel: 24,
                    size: [2048, 2048]
                });
                pb.draw_polygon([[900, 900,], [200, 200], [1000, 900], [1600, 200], [1000, 1000], [1000, 1100], [1000, 1600], [900, 1600]], pastel_rose, true);
                return pb;
                return {
                    pb,
                    misc: {
                        time: {
                            create: create_time,
                            compose: compose_time,
                        },
                    }
                };
            },
            () => {
                const start_time = process.hrtime();
                const pb = new Pixel_Buffer({
                    bits_per_pixel: 24,
                    size: [2048, 2048]
                });
                const star_points = generate_star_points([100, 100], [1800, 1800], 0.67, 72);
                pb.draw_polygon(star_points, pastel_rose, false);
                return pb;
                return {
                    pb,
                    misc: {
                        time: {
                            create: create_time,
                            compose: compose_time,
                        },
                    }
                };
            },
            () => {
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
                    }
                };
            },
            () => {
                //return false;
                const pb = new Pixel_Buffer({
                    bits_per_pixel: 24,
                    size: [3200, 3200]
                });
                const tile_full_w = (128 * 2) + 16, tile_full_h = (64 * 2) + 16;
                const tile_margin_w = 16, tile_margin_h = 16;
                const tile_inner_w = tile_full_w - tile_margin_w, tile_inner_h = tile_full_h - tile_margin_h;
                const pb_rect_tile = new Pixel_Buffer({
                    bits_per_pixel: 1,
                    size: [tile_inner_w, tile_inner_h]
                });
                pb_rect_tile.ta.fill(0);
                pb_rect_tile.draw_rect([1, (tile_inner_h >>> 1) - 4], [tile_inner_w - 2, (tile_inner_h >>> 1) + 4], 1);
                pb_rect_tile.draw_rect([(tile_inner_w >>> 1) - 4, 1], [(tile_inner_w >>> 1) + 4, tile_inner_h - 2], 1);
                const num_tile_columns = 10;
                const num_tile_rows = 18;
                let px_x = tile_margin_w, px_y = tile_margin_h;
                for (let row = 0; row < num_tile_rows; row++) {
                    px_x = tile_margin_w + tile_full_w * (num_tile_columns - 1);
                    for (let column = 0; column < num_tile_columns; column++) {
                        pb.draw_1bipp_pixel_buffer_mask(pb_rect_tile, [px_x, px_y], pastel_blue);
                        px_x -= tile_full_w;
                    }
                    px_y += tile_full_h;
                }
                return pb;
            },
            async () => {
                // Ensure 'examples/input' directory exists and download image if missing
                const inputDir = path.join(__dirname, 'input');
                const inputFile = path.join(inputDir, 'Erta_Ale_491.jpg');
                const imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/0/0c/Erta_Ale_491.jpg';
                const sharp = require('sharp');
                // Synchronous directory creation if missing
                if (!fs.existsSync(inputDir)) {
                    fs.mkdirSync(inputDir, { recursive: true });
                }

                // Helper to download the file if it does not exist
                function downloadIfNeeded() {
                    return new Promise((resolve, reject) => {
                        if (fs.existsSync(inputFile)) {
                            resolve();
                        } else {
                            const https = require('https');
                            const file = fs.createWriteStream(inputFile);
                            https.get(imageUrl, (response) => {
                                if (response.statusCode !== 200) {
                                    reject(new Error('Failed to get image: ' + response.statusCode));
                                    return;
                                }
                                response.pipe(file);
                                file.on('finish', () => {
                                    file.close(resolve);
                                });
                            }).on('error', (err) => {
                                fs.unlink(inputFile, () => {});
                                reject(err);
                            });
                        }
                    });
                }

                // Download if needed, then load, resize, and save the result
                await downloadIfNeeded();
                // Load the image, get raw RGB buffer at original size
                const image = sharp(inputFile);
                const metadata = await image.metadata();
                const { data, info } = await image.removeAlpha().raw().toBuffer({ resolveWithObject: true });
                // Create Pixel_Buffer from raw data (original size)
                const pb = new Pixel_Buffer({
                    bits_per_pixel: 24,
                    size: [info.width, info.height]
                });
                console.log('Image loaded, size:', info.width, 'x', info.height);
                if (pb.ta.length === data.length) {
                    pb.ta.set(data);
                } else {
                    const l = Math.min(pb.ta.length, data.length);
                    for (let i = 0; i < l; i++) {
                        pb.ta[i] = data[i];
                    }
                }
                // Now resize using jsgui3-gfx-core's resizing functionality
                const target_width = 300;
                const target_height = Math.round(info.height * (target_width / info.width));
                if (typeof pb.new_resized === 'function') {
                    const resize_start = process.hrtime();
                    const pb_resized = pb.new_resized([target_width, target_height]);
                    const resize_time = process.hrtime(resize_start);
                    return {
                        pb: pb_resized,
                        misc: { time: { resize: resize_time } },
                        measurement: { primary: 'resize' }
                    };
                } else {
                    throw new Error('Pixel_Buffer does not have a new_resized method.');
                }
            }
        ]
        const run_examples = async(num_preruns = 0) => {
            for (const eg of egs) {
                await run_example(eg, num_preruns);
            }
        }
        //await run_examples(1024, 512);
        await run_examples(32, 32);
    })();
}