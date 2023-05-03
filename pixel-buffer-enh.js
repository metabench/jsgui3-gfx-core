// not sure about having this hold indexed color.
//  by its name it seems as though it should be able to.
//  using indexed color mode.
//   rgba, rgb, indexed rgb, indexed rgba
//              irgb, irgba
//  and then there is bit_depth.
//              bits_per_pixel may make sense.

// Will just have this as a pixel value buffer.
//  Can have an image-buffer if its more advanced.
// Will be used to hold, and as the basis for basic processing on PNG images.
//  Also want to make some pixel buffer manipulation modules.
// jsgui-node-pixel-buffer-manipulate (maybe not manipulate - could imply it changes data when it does not always?)
//  filters
//  masks? feature detection?
// jsgui-node-pixel-buffer-filter
// jsgui-node-pixel-buffer-processing
// want to do convolutions on the pixel buffer


/*
    31/08/2019 - Does not seem as relevant right now. High perf functionality being built into the core, will act as a better platform than currently used here.

*/



// Then being able to pass the ta_math function override, or part of it backwards into the core?





const lang = require('lang-mini');

const {
    each,
    fp,
    tof,
    get_a_sig
} = lang;



// Core
const Pixel_Pos_List = require('./pixel-pos-list');
// Mixins
//  Could make them for functions of some categories, and larger functions.
//   Would help to make it replacable with more optimized functions.
// Advanced / Enh
const kernels = require('./convolution-kernels/kernels');
const get_idx_movement_vectors = (f32a_convolution, bpp, bpr) => {
    const c_length = f32a_convolution.length;
    const dimension_size = Math.sqrt(c_length);
    // Can't convolve the very edges of the image.
    //console.log('dimension_size', dimension_size);
    const padding = (dimension_size - 1) / 2;
    //console.log('padding', padding);
    //const res = this.blank_copy();
    /*
    const res = new Pixel_Buffer_Enh({
        'size': [this.size[0] - (padding * 2), this.size[1] - (padding * 2)],
        'bits_per_pixel': this.bits_per_pixel
    })
    */
    // need the vector for each pixel in the convolution.
    // the central pixel right in the middle...
    // arrange the movement vectors according to the dimension_size;
    // Faster convoluions could use a convolution-specific loop.
    // find the midpoint.
    //const midpoint = padding;
    const movement_vectors = new Int8Array(c_length * 2);
    let x, y, pos = 0;
    //const bpp = this.bytes_per_pixel;
    //const bpr = this.bytes_per_row;
    //console.log('bpp', bpp);
    //console.log('bpr', bpr);
    const idx_movement_vectors = new Int16Array(c_length);
    //const convolved_pixels = new Int16Array(c_length);
    for (y = -1 * padding; y <= padding; y++) {
        for (x = -1 * padding; x <= padding; x++) {
            // central 0, 0
            //let offsetX = midpoint - x;
            //let offsetY = midpoint - y;
            //let offsetX = x;
            //let offsetY = y;
            movement_vectors[pos++] = x;
            movement_vectors[pos++] = y;
        }
    }
    //console.log('movement_vectors', movement_vectors);
    pos = 0;
    let ii, i;
    for (i = 0; i < c_length; i++) {
        x = movement_vectors[pos++];
        y = movement_vectors[pos++];
        idx_movement_vectors[i] = x * bpp + y * bpr;
    }
    return idx_movement_vectors;
}

// use an instance of core?

const get_points_bounding_box = (points) => {

    let min_x = Number.POSITIVE_INFINITY;
    let min_y = Number.POSITIVE_INFINITY;
    let max_x = Number.NEGATIVE_INFINITY;
    let max_y = Number.NEGATIVE_INFINITY;

    for (const [x, y] of points) {
        if (x < min_x) min_x = x;
        if (x > max_x) max_x = x;
        if (y < min_y) min_y = y;
        if (y > max_y) max_y = y;
    }

    return [
        [min_x, min_y],
        [max_x, max_y]
    ];

}

const get_instance = () => {

    const Core = require('./pixel-buffer-core');

    class Pixel_Buffer_Enh extends Core {

        // Has some decent functions, but want some more useful / intelligent flood fills.
        //  Flood fill the inside parts of a 1 bipp image.
        //   So it fills in the line drawing (allowing for holes)

        // For each pixel, checking how many contiguous pixel it crosses to reach the edge of the image.

        //  Be able to get / iterate through the pixels in each direction from that pixel...?

        // .each_pixel_moving_up_down_left_right_from_pixel().

        // .each_pixel_horiz_left_of_pixel
        // 









        // Setting bits per pixel to 8
        //  greyscale 256
        constructor(spec) {
            //spec.__type_name = spec.__type_name || 'pixel_buffer';
            super(spec);
        }

        // ll, core, ?, enhanced?



        // Maybe a 'shapes' class that will render shapes ready for composition.

        // Palette itself would be a typed array or pixel buffer?
        //  Palette as a pixel buffer could be simple in some ways.
        //   In terms of the features being made use of... but pb should probably have its own palette object.
        //   For avoidance of circular refs, making it its own class with own implementation would prob work best.

        // Or palette is in enhanced pixel buffer, but itself uses / is only a core pixel buffer.
        //  Though integrating it on the core level would have advantages with being able to reference palette colors more easily.













        // drawing a filled polygon...
        //  could create a separate / new pixelbuffer just to represent the data within that polygon.
        //   And a pixel_pos_list could be a useful data structure.
        //    Maybe could have more efficient internal representation.











        'draw_line'(pos1, pos2, color) {



            // options would help....
            //  or it could just be color here.

            // And maybe use different bipp options.



            let x0 = pos1[0];
            let y0 = pos1[1];
            let x1 = pos2[0];
            let y1 = pos2[1];

            let dx = Math.abs(x1 - x0);
            let dy = Math.abs(y1 - y0);
            let sx = (x0 < x1) ? 1 : -1;
            let sy = (y0 < y1) ? 1 : -1;
            let err = dx - dy;

            while (true) {
                this.set_pixel([x0, y0], color);

                if (x0 === x1 && y0 === y1) {
                    break;
                }

                let e2 = 2 * err;
                if (e2 > -dy) {
                    err -= dy;
                    x0 += sx;
                }

                if (e2 < dx) {
                    err += dx;
                    y0 += sy;
                }
            }
        }

        'draw_polygon'(arr_points, color, fill = false) {

            // filled option...

            // need filled shape compositing.
            //  slightly more tricky.

            // Need to find the bounding box for those points.


            if (fill === true) {

                

                const bb_points = get_points_bounding_box(arr_points);
                // And want to get the size / range.

                // Or, make a pixel_buffer that represents that space.
                //  Having that pb handle offsets could be very useful.
                //   Though maybe it would need some lower level changes?
                //    Don't want to have to complicate code with offset handling all over the place.
                //     Do offsets in the easiest way, then add further convenience features.

                //console.log('bb_points', bb_points);

                const offset = bb_points[0];

                // + 1 to the polygon size, each dimension???
                const polygon_size = [
                    [bb_points[1][0] - bb_points[0][0] + 1],
                    [bb_points[1][1] - bb_points[0][1] + 1]
                ];

                //console.log('polygon_size', polygon_size);

                const pb_polygon = new this.constructor({
                    'bits_per_pixel': 1,
                    'size': polygon_size
                })

                //console.log('pb_polygon.ta.length', pb_polygon.ta.length);

                //throw 'stop';

                // Then draw the polygon to there...

                const down_offsetted_points = arr_points.map(point => [point[0] - offset[0], point[1] - offset[1]]);

                //console.log('down_offsetted_points', down_offsetted_points);

                // or draw the polygon here in color 1?
                //  as it's going to be used as a mask-type object.

                let t1 = Date.now();


                console.log('pre draw 1bipp polygon');
                pb_polygon.draw_polygon(down_offsetted_points, 1, false);
                let t2 = Date.now();
                let td = t2 - t1;
                console.log('post draw 1bipp polygon ms: ' + td);

                const pb_polygon_unfilled = pb_polygon.clone();



                t1 = Date.now();

                // This flood fill from outside part of the drawing is the slowest part.
                //  Likely we need a quicker way of checking if any pixels have already been visited.
                //   Possibly could even use a 1bipp pixel buffer.




                console.log('pre 1bipp flood fill from outside');
                pb_polygon.flood_fill_given_color_pixels_from_outer_boundary(0, 1);
                t2 = Date.now();
                td = t2 - t1;

                console.log('post 1bipp flood fill from outside ms:', td);

                // copy this pb polygon here?
                

                // Better to do it from the edges???

                // flood_fill_from_image_outer_boundary ???


                // pb_polygon.flood_fill(0, 0, 1);

                // then invert it.
                //  can simply apply not to all bytes when 1bipp

                pb_polygon.invert();
                pb_polygon.or(pb_polygon_unfilled);


                // then copy this pb_polygon's data to this...
                //   oring

                //this.place_image_from_pixel_buffer(pb_polygon, offset, {or: true});

                // This part seems broken...
                //console.log('offset', offset);

                //console.log('pb_polygon.size', pb_polygon.size);

                // Need to specify the color it's to be drawn at if it's a 1bipp image being drawn.

                // this.draw_1bipp_pixel_buffer(pb_1bipp, offset, color)

                // this.draw_1bipp_pixel_buffer_mask(pb_1bipp_mask, offset, color) ???
                //   using a different, more specifically named function for this makes sense.


                t1 = Date.now();
                console.log('pre draw mask');
                this.draw_1bipp_pixel_buffer_mask(pb_polygon, offset, color);
                t2 = Date.now();
                td = t2 - t1;
                console.log('post draw mask ms:', td);

                //this.place_image_from_pixel_buffer(pb_polygon, offset, {or: true});



                // Then do 'or' onto this.
                //  Maybe copying px by px with the offset makes most sense.

                //  Copy from pb, to pos....









                // then flood fill the outside too?









                // make a pb that represents them.
                //  see if there is an easy way for that.
















            } else {


                let x, y;

                let prev_x, prev_y;

                let is_first = true;

                for ([x, y] of arr_points) {

                    //console.log('[x, y]', [x, y]);

                    if (!is_first) {
                        this.draw_line([prev_x, prev_y], [x, y], color);
                    }


                    [prev_x, prev_y] = [x, y];


                    is_first = false;
                }
                this.draw_line([prev_x, prev_y], arr_points[0], color);

            }












            // But a filled polygon is more complex to draw.


            // go through the points doing draw_line.


            // then back to the start.
        }


        /*
        'each_pixel_horiz_left_of_pixel'(pos, callback) {
            for (let x = pos[0] - 1; x >= 0; x--) {
              const pixel = this.get_pixel([x, pos[1]]);
              callback(pixel, [x, pos[1]]);
            }
          }

          'each_pixel_vert_above_pixel'(pos, callback) {
            for (let y = pos[1] - 1; y >= 0; y--) {
              const pixel = this.get_pixel([pos[0], y]);
              callback(pixel, [pos[0], y]);
            }
          }

          'each_pixel_horiz_right_of_pixel'(pos, callback) {
            const w = this.size[0];
            for (let x = pos[0] + 1; x < w; x++) {
              const pixel = this.get_pixel([x, pos[1]]);
              callback(pixel, [x, pos[1]]);
            }
          }

          'each_pixel_vert_below_pixel'(pos, callback) {
            const h = this.size[1];
            for (let y = pos[1] + 1; y < h; y++) {
              const pixel = this.get_pixel([pos[0], y]);
              callback(pixel, [pos[0], y]);
            }
          }

          */

        // each_pixel_in_4_directions_from_pos()

        /*
        'each_pixel_in_4_directions_from_pos'(pos, callback) {
            this.each_pixel_horiz_left_of_pixel(pos, callback);
            this.each_pixel_vert_above_pixel(pos, callback);
            this.each_pixel_horiz_right_of_pixel(pos, callback);
            this.each_pixel_vert_below_pixel(pos, callback);
        }
        */

        // Or collect those pixels?


        // count the color boundaries (in each of those directions).


        // Can we reach the outside border of the image from that pixel with a flood-fill-like movement?
        //  


        // A flood fill separate areas strategy?

        // Flood fill from outside?
        //  Flood fill that can flood past the image borders too (as in flood out then back in, assumed contiguity of pixels)

        // Yes, so may as well have it rendered smaller, leaving a border around.




        'count_directional_color_edges'(pixel_pos, edge_color) {
            // Groups of contig pxls of the edge color.

            // Need to flood fill edges separate colors to identify them?
            //  Have a bit of a problem with the edge odd / even count logic.

            // Possibly do flood fill in places definitely inside (even if we don't find all inside places)
            //  Identify contiguous / flood fillable areas.












            // Not sure about this.
            //  Perhaps the color boundaries is needed instead....




        }

        '__maybe_broken_count_directional_color_boundaries'(pixel_pos, default_color = 0) {

            // No, count the directional edges



            // But better to count edges / contiguous color pixels.



            let [l, u, r, b] = [0, 0, 0, 0];

            const central_pixel = this.get_pixel(pixel_pos);

            //console.log('central_pixel', central_pixel);
            //throw 'stop';

            let prev_pixel_color = central_pixel;


            this.each_pixel_horiz_left_of_pixel(pixel_pos, (pixel, pos) => {

                //console.log('pixel', pixel);

                if (pixel !== prev_pixel_color) {

                    l++;
                    prev_pixel_color = pixel;
                }



                // Is it different color from the pixel?

                //console.log('(pixel, pos)', [pixel, pos]);
            });
            if (prev_pixel_color !== default_color) l++;

            prev_pixel_color = central_pixel;
            this.each_pixel_vert_above_pixel(pixel_pos, (pixel, pos) => {

                //console.log('pixel', pixel);

                if (pixel !== prev_pixel_color) {
                    u++;
                    prev_pixel_color = pixel;
                }

                // Is it different color from the pixel?

                //console.log('(pixel, pos)', [pixel, pos]);
            });
            if (prev_pixel_color !== default_color) u++;


            prev_pixel_color = central_pixel;
            this.each_pixel_horiz_right_of_pixel(pixel_pos, (pixel, pos) => {

                //console.log('pixel', pixel);

                if (pixel !== prev_pixel_color) {

                    r++;
                    prev_pixel_color = pixel;
                }
                // Is it different color from the pixel?
                //console.log('(pixel, pos)', [pixel, pos]);
            });
            if (prev_pixel_color !== default_color) r++;


            prev_pixel_color = central_pixel;
            this.each_pixel_vert_below_pixel(pixel_pos, (pixel, pos) => {
                if (pixel !== prev_pixel_color) {
                    b++;
                    prev_pixel_color = pixel;
                }
            });
            if (prev_pixel_color !== default_color) b++;


            return [Math.ceil(l / 2), Math.ceil(u / 2), Math.ceil(r / 2), Math.ceil(b / 2)];

            //return [l, u, r, b];
        }


        // Basically not working....

        // Want better identification of inner pixels.
        //  



        // A flood-fill way would work.
        //  When looking out from a pixel, think we need to flood fill the edges so that a specific edge gets identified.
        //  And the very tops of the objects?

        // Not so easy right now...

        //  Need to try some other means....

        // Identifying flood fill regions....
        //  

        // A flood fill on the outer area?
        //  Or just could scan from the left and detect how many edges have been crossed....
        //  odd then paint the pixel.
        //   however, need to properly handle the kinds of (non-edge?) but it's hard to tell like this.

        // A map of flood fill sections could help a lot.
        //  The detection of contiguous pixels of color does not find the shape edges / boundaries properly.

        // Flood fill tech seems much better here.





















        'color_inner_pixels'(color = 1) {
            console.trace();
            throw 'NYI'

            if (this.bipp === 1) {

                const pb2 = this.clone();


                // but add border space around it....
                //  clone_with_extra_borders?



                // then flood fill in a place that's definitely outside it.
                //  but add borders too?





            } else {
                console.trace();
                throw 'NYI';
            }

        }







        // No, this older way has not worked properly

        '__attempt_color_inner_pixels'(color = 1) {

            if (this.bipp === 1) {
                const ta_pos = new Uint16Array(2);
                const ta_px_value = new Uint8ClampedArray(3);
                const ta_info = new Uint32Array(4);
                this.each_px(ta_pos, ta_px_value, ta_info, px => {
                    //console.log('ta_pos', ta_pos);

                    // check if it is an inner pixel.


                    const dcbs = this.count_directional_color_boundaries(ta_pos, 0);
                    // Treating the edge as a boundary if the last pixel is not the specified color?


                    const [l, u, r, b] = dcbs;

                    // Divide them by 2?





                    console.log('[l, u, r, b]', ta_pos, [l, u, r, b]);


                    /*
                    const isAllEven = dcbs.every(num => num % 2 === 0);

                    if (isAllEven) {
                        this.set_pixel_1bipp(ta_pos, color);
                    }
                    */

                    /*

                    if (l === 2 && u === 2 && r === 2 && b === 2) {
                        this.set_pixel_1bipp(ta_pos, color);
                    }
                    if (l === 4 && u === 4 && r === 4 && b === 4) {
                        this.set_pixel_1bipp(ta_pos, color);
                    }
                    */

                    // all even and > 0

                    //const isAllEvenAbove0 = dcbs.every(num => num > 0 && num % 2 === 0);
                    const isAllOddAbove0 = dcbs.every(num => num > 0 && num % 2 === 1);

                    if (isAllOddAbove0) {
                        this.set_pixel_1bipp(ta_pos, color);
                    }






                });
            } else {
                console.trace();
                throw 'NYI';
            }



        }



        // Number of contiguous pixels in each of those directions...?
        //  Count contiguous pixel zones.

        // Could use these to find the filled in areas.
        //  is_pixel_inner(pixel_pos)








        // Then could go over every pixel, 

        /*
        process(fn) {
            let res = this.clone();
            return fn(this, res);
        }
        */

        // Could have a 'paint' file / module.
        'paint_solid_border'(thickness, color) {


            // separate methods for different bipps, this fn chooses one?


            return this.process((me, res) => {
                let x, y;
                const [w, h] = this.size;
                if (this.bytes_per_pixel === 4) {
                    // top two rows
                    for (y = 0; y < thickness; y++) {
                        for (x = 0; x < w; x++) {
                            res.set_pixel(x, y, color[0], color[1], color[2], color[3]);
                        }
                    }
                    for (y = h - thickness; y < h; y++) {
                        for (x = 0; x < w; x++) {
                            res.set_pixel(x, y, color[0], color[1], color[2], color[3]);
                        }
                    }
                    for (y = 0; y < h; y++) {
                        for (x = 0; x < thickness; x++) {
                            res.set_pixel(x, y, color[0], color[1], color[2], color[3]);
                        }
                    }
                    for (y = 0; y < h; y++) {
                        for (x = w - thickness; x < w; x++) {
                            res.set_pixel(x, y, color[0], color[1], color[2], color[3]);
                        }
                    }
                } else if (this.bytes_per_pixel === 3) {
                    // top two rows
                    for (y = 0; y < thickness; y++) {
                        for (x = 0; x < w; x++) {
                            res.set_pixel(x, y, color[0], color[1], color[2]);
                        }
                    }
                    for (y = h - thickness; y < h; y++) {
                        for (x = 0; x < w; x++) {
                            res.set_pixel(x, y, color[0], color[1], color[2]);
                        }
                    }
                    for (y = 0; y < h; y++) {
                        for (x = 0; x < thickness; x++) {
                            res.set_pixel(x, y, color[0], color[1], color[2]);
                        }
                    }
                    for (y = 0; y < h; y++) {
                        for (x = w - thickness; x < w; x++) {
                            res.set_pixel(x, y, color[0], color[1], color[2]);
                        }
                    }
                } else {
                    console.trace();
                    throw 'NYI';
                }
                return res;
            })
        }

        // gaussian_blur
        //  or gaussian is the default blur.
        blur(size = 3, sigma = 2) {
            let kernel = kernels.get_gauss(size, sigma);
            return this.apply_square_convolution(kernel);
        }

        count_colors() {
            const map_colors = {};
            let res = 0;
            this.each_pixel_ta((pos, color) => {
                const colstr = color.toString();
                if (!map_colors[colstr]) {
                    map_colors[colstr] = true;
                    res++;
                }
            });
            return res;
        }
        // each_pixel((x, y, r, g, b, a, set, get_pixel_by_offset)
        // new convolution version...
        // not apply?

        // square convolution.

        // Could probably make a much faster version of this.
        //  Maybe different sub-functions for different bpp values.

        apply_square_convolution(f32a_convolution) {
            return this.process((orig, res) => {
                // could replace this with orig.
                const c_length = f32a_convolution.length;
                const dimension_size = Math.sqrt(c_length);
                // Can't convolve the very edges of the image.
                //console.log('dimension_size', dimension_size);
                const padding = (dimension_size - 1) / 2;
                //console.log('padding', padding);
                //const res = this.clone();
                //const midpoint = padding;
                //const movement_vectors = new Int8Array(c_length * 2);
                let x, y, pos = 0,
                    ii, i;
                const bpp = this.bytes_per_pixel;
                const bpr = this.bytes_per_row;
                //console.log('bpp', bpp);
                //console.log('bpr', bpr);
                const idx_movement_vectors = get_idx_movement_vectors(f32a_convolution, bpp, bpr);
                //const convolved_pixels = new Int16Array(c_length);
                //let pr, pg, pb, pa;
                //let cpr, cpg, cpb, cpa;
                let cr, cg, cb, ca;
                const buf = this.buffer;
                const buf_res = res.buffer;
                // Try a for loop...
                //  
                // pixel index
                //console.log('bpp', bpp);
                // apply it to 1bpp image...
                if (bpp === 3) {
                    //this.padded_each_pixel(padding, (x, y, r, g, b, px_idx) => {
                    this.padded_each_pixel_index(padding, (px_idx) => {
                        // get the pixels from each of these locations.
                        //  multiply the values by the pixel convolution number.
                        // need to keep tract of a convolution total
                        //console.log('px_idx', px_idx);
                        cr = 0;
                        cg = 0;
                        cb = 0;

                        for (ii = 0; ii < c_length; ii++) {
                            i = px_idx + idx_movement_vectors[ii];
                            cr += f32a_convolution[ii] * buf[i++];
                            cg += f32a_convolution[ii] * buf[i++];
                            cb += f32a_convolution[ii] * buf[i++];
                        }

                        if (cr < 0) cr = 0;
                        if (cg < 0) cg = 0;
                        if (cb < 0) cb = 0;

                        if (cr > 255) cr = 255;
                        if (cg > 255) cg = 255;
                        if (cb > 255) cb = 255;

                        buf_res[px_idx++] = Math.round(cr);
                        buf_res[px_idx++] = Math.round(cg);
                        buf_res[px_idx++] = Math.round(cb);
                    });
                } else if (bpp === 4) {
                    //this.padded_each_pixel(padding, (x, y, r, g, b, a, px_idx) => {
                    this.padded_each_pixel_index(padding, (px_idx) => {
                        cr = 0;
                        cg = 0;
                        cb = 0;
                        for (ii = 0; ii < c_length; ii++) {
                            i = px_idx + idx_movement_vectors[ii];
                            //console.log('i', i);
                            //console.log('buf[i]', buf[i]);
                            cr += f32a_convolution[ii] * buf[i++];
                            //console.log('buf[i]', buf[i]);
                            cg += f32a_convolution[ii] * buf[i++];
                            //console.log('buf[i]', buf[i]);
                            cb += f32a_convolution[ii] * buf[i++];

                            //ca = buf[i++];

                            //ca += cpa;
                        }
                        ca = 255;
                        //ca = a;

                        if (cr < 0) cr = 0;
                        if (cg < 0) cg = 0;
                        if (cb < 0) cb = 0;
                        //if (ca < 0) ca = 0;

                        if (cr > 255) cr = 255;
                        if (cg > 255) cg = 255;
                        if (cb > 255) cb = 255;
                        //if (ca > 255) ca = 255;
                        //cr = Math.round(cr);
                        //cg = Math.round(cg);
                        //cb = Math.round(cb);
                        //ca = Math.round(ca);


                        //console.log('cr', cr);
                        //console.log('cg', cg);
                        //console.log('cb', cb);
                        //console.log('ca', ca);


                        buf_res[px_idx++] = Math.round(cr);
                        buf_res[px_idx++] = Math.round(cg);
                        buf_res[px_idx++] = Math.round(cb);
                        buf_res[px_idx++] = Math.round(ca);
                    });
                } else {
                    throw 'NYI';
                }
                return res;
            })
        }

        extract_channel(i_channel) {
            const bypp = this.bytes_per_pixel;
            const ta = this.ta;
            let i_byte = i_channel;
            let i_px = 0;
            const l = ta.length;

            console.log('bypp', bypp);



            if (bypp === 3 || bypp === 4) {
                const res_channel_ta = new this.constructor({
                    size: this.size,
                    bits_per_pixel: 8
                })
                while (i_byte < l) {
                    res_channel_ta.set_pixel_by_idx(i_px, ta[i_byte]);

                    i_byte += bypp;
                    i_px++;
                }
                return res_channel_ta;
            } else {
                console.trace();
                throw 'NYI';
            }


        }


        mask_each_pixel(cb_pixel) {

            const bipp = this.bits_per_pixel;
            let i_byte = 0;
            let i_px = 0;
            const bypp = this.bytes_per_pixel;
            const ta = this.ta;
            const l = ta.length;

            const res_mask = new this.constructor({
                size: this.size,
                bits_per_pixel: 1
            });

            //console.log('res_mask', res_mask);
            //console.log('mask_each_pixel bipp', bipp);

            if (bipp === 1) {
                console.trace();
                throw 'NYI';

            } else if (bipp === 8) {
                console.trace();
                throw 'NYI';

            } else if (bipp === 24 || bipp === 32) {
                //throw 'NYI';
                while (i_byte < l) {

                    // get the subarray of each pixel

                    const ta_sub = ta.slice(i_byte, i_byte + bypp);
                    const px_on = cb_pixel(ta_sub) ? 1 : 0;
                    //console.log('px_on', px_on);

                    // is 1 bipp setting working ok?
                    res_mask.set_pixel_by_idx(i_px, px_on);

                    i_byte += bypp;
                    i_px++;
                }
            }
            /* else if (bipp === 32) {
                           console.trace();
                           throw 'NYI';

                       } */

            //console.log('res_mask.ta.length', res_mask.ta.length);
            //console.log('res_mask.ta', res_mask.ta);
            //console.log('res_mask.size', res_mask.size);

            //const px_count = res_mask.size[0] * res_mask.size[1];
            //console.log('px_count', px_count);

            //const resl = res_mask.ta.length;

            // iterating through pixels using an index is easy enough.
            //  simpler loop structure than x and y.



            // see about going through each pixel...
            //  seeing its value.

            // Iterating pixels with a 1 bit per pixel image...
            //  Could separately test that.

            // res_mask.get_color_by_idx()






            return res_mask;

        }

        // Self-threshold. Want to get a threshold 1bpp (mask)
        threshold_gs(value) {
            // iterate all pixels...
            // better to make a copy of it.
            let res = this.clone();
            //console.log('threshold_gs this.bytes_per_pixel', this.bytes_per_pixel);
            if (this.bytes_per_pixel === 1) {
                this.each_pixel((x, y, v, i) => {
                    //console.log('x, y, v, i', x, y, v, i);
                    if (v >= value) {
                        res.set_pixel(x, y, 255);
                    } else {
                        res.set_pixel(x, y, 0);
                    }
                });

            }
            return res;
        }

        // Custom convolution not working here.
        // Iterating pixels for the line joining convolution sounds best.
        // Custom convolution seems like the way to go, but it's hard to implement.

        _custom_convolve(dimension_size, cb) {
            if (dimension_size % 2 !== 1) {
                throw 'dimension_size must be an odd integer';
            }
            const px = new Uint16Array(2);
            const ta16 = new Int16Array(12);

            // pixel x
            // pixel y

            // w
            // h
            [ta16[2], ta16[3]] = this.size;

            // bytes per pixel
            ta16[4] = this.bytes_per_pixel;
            ta16[5] = ta16[2] * ta16[4] // bytes per row

            // 6 - x convolution point
            // 7 - y convolution point
            ta16[8] = dimension_size;
            ta16[9] = (ta16[8] - 1) / 2 // distance in direction.;

            ta16[10] = 0; // the write position of the convolution.
            // conve bytes per row
            ta16[11] = ta16[8] * ta16[4];

            // 32 bit
            // pixel_component_index i

            let ta32 = new Uint32Array(4);
            ta32[0] = 0; // central pixel component index
            ta32[1] = 0; // convolution pixel component index

            ta32[2] = ta16[2] * ta16[3] * ta16[4] // image length in bytes

            // a result object that is just declared once...

            // conv pixel component write position

            let conv_pixels = new Uint8Array(ta16[8] * ta16[8] * ta16[8]);
            const buffer = this.buffer;
            // an x, y iteration would be better still...

            for (px[1] = 0; px[1] < ta16[3]; px[1]++) {
                for (px[0] = 0; px[0] < ta16[2]; px[0]++) {

                    // check if its within bounds...
                    ta16[6] = px[0] - ta16[8];

                    //console.log('ta16[6]', ta16[6]);

                    if (ta16[6] > 0 && ta16[6] < ta16[2] - ta16[8]) {
                        ta16[7] = px[1] - ta16[8];
                        //console.log('ta16[7]', ta16[7]);
                        if (ta16[7] > 0 && ta16[7] < ta16[3] - ta16[8]) {

                            // doing ok, convolution matrix is within bounds.
                            //  copy by providing a reference to the underlying data?

                            // move to the start of the convolution.
                            //  loop by convolution row length would be best.

                            //console.log('');
                            //console.log('ta16[9]', ta16[9]);
                            //console.log('ta16[4]', ta16[4]);
                            //console.log('ta16[5]', ta16[5]);

                            ta32[1] = ta32[0] - /* w */ ta16[9] * ta16[4] - /* h */ ta16[9] * ta16[5];
                            //console.log('ta32[0]', ta32[0]);
                            //console.log('ta32[1]', ta32[1]);
                            ta16[10] = 0;

                            // Need to loop on the right variable - the convolution y point


                            for (ta16[7] = ta16[1]; ta16[7] < ta16[1] + ta16[8]; ta16[7]++) {
                                // then copy the row to the typed array
                                //console.log('ta32[1]', ta32[1]);
                                //console.log('ta16[7]', ta16[7]);
                                //console.log('ta16[8]', ta16[8]);
                                //console.log('ta16[10]', ta16[10]);
                                //console.log('ta16[11]', ta16[11]);

                                // 
                                //buffer.copy(conv_pixels, ta32[1], ta16[10], ta16[10] + ta16[11]);

                                let sl = buffer.slice(ta32[1], ta32[1] + ta16[11]);

                                // then copy the slice...

                                // convolution write index

                                //console.log('px', px);

                                for (let c = 0; c < ta16[11]; c++) {
                                    conv_pixels[ta16[10] + c] = sl.readUInt8(c);
                                }

                                ta16[10] += ta16[11];
                                ta32[1] += ta16[5];

                                // ta32[1] = 

                            }
                            cb(px, conv_pixels);
                        }
                    }
                    ta32[0] += ta16[4];
                }
            }
            // iterate through the pixels...
            // get pixel index
            // start a loop 
        }

        get_first_pixel_matching_color(r, g, b, a) {
            let px = 0,
                py = 0;
            let [w, h] = this.size;
            let found = false;
            let buf = this.buffer;
            let pos_buf = 0;

            for (py = 0; !found && py < h; py++) {
                for (px = 0; !found && px < w; px++) {
                    //console.log('buf[pos_buf]', buf[pos_buf]);
                    //console.log('buf[pos_buf + 1]', buf[pos_buf + 1]);
                    //console.log('buf[pos_buf + 2]', buf[pos_buf + 2]);
                    //console.log('buf[pos_buf + 3]', buf[pos_buf + 3]);
                    if (buf[pos_buf] === r && buf[pos_buf + 1] === g && buf[pos_buf + 2] === b && buf[pos_buf + 3] === a) {
                        found = true;
                    }
                    pos_buf += 4;
                }
            }
            //console.log('found', found);
            if (found) {
                return [px, py];
            }
        }

        // ??? Improve...?
        apply_mask(pb_mask, mr, mg, mb, ma) {
            let res = this.blank_copy();
            res.flood_fill(0, 0, 255, 255, 255, 255);
            let px;
            pb_mask.each_pixel((x, y, r, g, b, a) => {
                if (r === mr && g === mg && b === mb && a === ma) {
                    px = this.get_pixel(x, y);
                    res.set_pixel(x, y, px[0], px[1], px[2], px[3])
                }
            })
            return res;
        }

        // Seems like extracting regions would be faster.

        'flood_fill_small_color_blocks'(max_size, r, g, b, a) {
            // scans the whole document
            //  like despeckle.
            // Could do much faster iteration here,
            //  will test the size of a color block before flood filling
            // Could make a map of color block sizes
            // This is quite useful for despeckling.

            this.each_pixel((x, y, pr, pg, pb, pa) => {
                if ((r !== pr || g !== pg || b !== pb || a !== pa)) {
                    let s = this.measure_color_region_size(x, y, max_size);
                    if (s < max_size) {
                        this.flood_fill(x, y, r, g, b, a);
                    }
                }
                //if ((r === 255 && g === 255 && b === 255 && a === 255)) {

                // find out the color region size

                // is colour region size at least ...
                // measure_colour_region_size...


                //  can't do that for each pixel!

                //console.log('s', s);


                //}
            })

            // iterate the x, y
            // find the color block 

        }


        // need to be able to handle greyscale as well.

        // could do this using color pixels



        // Should change this function.

        // self_replace_color?
        // target_color, replacement_color

        // Will be applied to self by default.
        //  .cl alias!!! change obext

        // will apply to self by default.

        self_replace_color(target_color, replacement_color) {
            const bpp = this.bytes_per_pixel;
            const buf = this.buffer;
            const l = buf.length;
            if (bpp === 1) {
                for (let c = 0; c < l; c++) {
                    if (buf[c] === target_color) buf[c] = replacement_color;
                }
            } else {
                throw 'NYI';
            }
            return this;
        }




        '_replace_color'(r, g, b, a, tr, tg, tb, ta) {

            // Does to self.
            //  Maybe we dont want that.

            // Iterate over all pixels

            // any pixels matching the given color, replace it with the target colors.

            // iterate through all pixels

            const buf_read = this.buffer;

            let ta_u8 = new Uint8Array(8);
            ta_u8[0] = r;
            ta_u8[1] = g;
            ta_u8[2] = b;
            ta_u8[3] = a;
            ta_u8[4] = tr;
            ta_u8[5] = tg;
            ta_u8[6] = tb;
            ta_u8[7] = ta;

            //console.log('ta_u8', ta_u8);
            //throw 'stop';

            const ta_16_scratch = new Uint32Array(8);
            ta_16_scratch[0] = 0; // read pos
            ta_16_scratch[2] = buf_read.length;

            while (ta_16_scratch[0] < ta_16_scratch[2]) {
                //console.log('ta_u8', ta_u8);

                if (buf_read[ta_16_scratch[0]] === ta_u8[0] && buf_read[ta_16_scratch[0] + 1] === ta_u8[1] && buf_read[ta_16_scratch[0] + 2] === ta_u8[2] && buf_read[ta_16_scratch[0] + 3] === ta_u8[3]) {
                    buf_read[ta_16_scratch[0]] = ta_u8[4];
                    buf_read[ta_16_scratch[0] + 1] = ta_u8[5];
                    buf_read[ta_16_scratch[0] + 2] = ta_u8[6];
                    buf_read[ta_16_scratch[0] + 3] = ta_u8[7];
                    //console.log('written');

                    //console.log('buf_read[ta_16_scratch[0]]', buf_read[ta_16_scratch[0]]);
                    //console.log('buf_read[ta_16_scratch[0] + 1]', buf_read[ta_16_scratch[0] + 1]);
                    ///console.log('buf_read[ta_16_scratch[0] + 2]', buf_read[ta_16_scratch[0] + 2]);
                    //console.log('buf_read[ta_16_scratch[0] + 3]', buf_read[ta_16_scratch[0] + 3]);
                    //buf_write[ta_16_scratch[1]++] = 0;
                    //buf_write[ta_16_scratch[1]++] = 0;
                    //buf_write[ta_16_scratch[1]++] = 0;
                    //buf_write[ta_16_scratch[1]++] = 255;
                } else {
                    //buf_write[ta_16_scratch[1]++] = 255;
                    //buf_write[ta_16_scratch[1]++] = 255;
                    //buf_write[ta_16_scratch[1]++] = 255;
                    //buf_write[ta_16_scratch[1]++] = 255;
                    //ta_16_scratch[1] += 4;
                }
                ta_16_scratch[0] += 4;
            }
        }


        // now got 1bpp masks.
        '__get_single_color_mask_32'(r, g, b, a) {
            // Less effiient still - want 1 bit image, not using 8 bit, using 32 bit.

            // read pixel index
            // write pixel index
            //console.log('get_single_color_mask_32');
            //console.log('this.buffer.length', this.buffer.length);

            // Create 8 bit result image. 1 bit would be preferable but unsure about it.


            var res = new this.constructor({
                'size': this.size,
                'bits_per_pixel': 32
            });
            res.buffer.fill(0);

            const buf_read = this.buffer;
            const buf_write = res.buffer;

            const ta_16_scratch = new Uint32Array(8);
            ta_16_scratch[0] = 0; // read pos
            ta_16_scratch[1] = 0; // write pos
            ta_16_scratch[2] = buf_read.length;
            ta_16_scratch[3] = buf_write.length;

            let ta_u8 = new Uint8Array(4);
            ta_u8[0] = r;
            ta_u8[1] = g;
            ta_u8[2] = b;
            ta_u8[3] = a;

            //console.log('ta_16_scratch[0]', ta_16_scratch[0]);
            //console.log('ta_16_scratch[2]', ta_16_scratch[2]);

            while (ta_16_scratch[0] < ta_16_scratch[2]) {
                //console.log('ta_u8', ta_u8);
                if (buf_read[ta_16_scratch[0]] === ta_u8[0] && buf_read[ta_16_scratch[0] + 1] === ta_u8[1] && buf_read[ta_16_scratch[0] + 2] === ta_u8[2] && buf_read[ta_16_scratch[0] + 3] === ta_u8[3]) {
                    buf_write[ta_16_scratch[1]++] = 0;
                    buf_write[ta_16_scratch[1]++] = 0;
                    buf_write[ta_16_scratch[1]++] = 0;
                    buf_write[ta_16_scratch[1]++] = 255;
                } else {

                    buf_write[ta_16_scratch[1]++] = 255;
                    buf_write[ta_16_scratch[1]++] = 255;
                    buf_write[ta_16_scratch[1]++] = 255;
                    buf_write[ta_16_scratch[1]++] = 255;
                    //ta_16_scratch[1] += 4;
                }
                ta_16_scratch[0] += 4;

            }
            // Traverse the image quickly
            return res;
        }

        // color better as 1 variable.
        //  then could run other function depending on bipp.

        count_pixels_with_color(r, g, b, a) {
            // This will be a somewhat optimized function.

            // Try a few function calls within this.

            // just iterate through the pixels.
            const buf_read = this.buffer;
            const scratch_32 = new Uint32Array(5);
            //scratch_32[0] = 0;
            scratch_32[0] = 0; // read pos
            //scratch_32[1] = 0; // write pos
            scratch_32[2] = buf_read.length;
            //scratch_32[3] = buf_write.length;
            scratch_32[4] = 0;
            //scratch_32[0] = 0; // read pos
            //scratch_32[1] = 0; // write pos


            //const buf_write = res.buffer;

            const ta_16_scratch = new Uint16Array(8);
            //ta_16_scratch[0] = 0; // read pos
            //ta_16_scratch[1] = 0; // write pos
            //ta_16_scratch[2] = buf_read.length;
            //ta_16_scratch[3] = buf_write.length;

            let ta_u8 = new Uint8Array(4);
            ta_u8[0] = r;
            ta_u8[1] = g;
            ta_u8[2] = b;
            ta_u8[3] = a;

            while (scratch_32[0] < scratch_32[2]) {
                if (buf_read[scratch_32[0]++] === ta_u8[0] && buf_read[scratch_32[0]++] === ta_u8[1] && buf_read[scratch_32[0]++] === ta_u8[2] && buf_read[scratch_32[0]++] === ta_u8[3]) {
                    //buf_write[ta_16_scratch[1]] = 255;
                    scratch_32[4]++;
                }
                //scratch_32[1]++;
            }
            // Traverse the image quickly

            return scratch_32[4];

        }


        // Old mask style...
        // Get as 32 bit bitmap... inefficient.
        '__get_single_color_mask'(r, g, b, a) {
            // read pixel index
            // write pixel index

            // Create 8 bit result image. 1 bit would be preferable but unsure about it.
            var res = new this.constructor({
                'size': this.size,
                'bits_per_pixel': 8
            });
            res.buffer.fill(0);

            const buf_read = this.buffer;
            const buf_write = res.buffer;

            const ta_16_scratch = new Uint16Array(8);
            ta_16_scratch[0] = 0; // read pos
            ta_16_scratch[1] = 0; // write pos
            ta_16_scratch[2] = buf_read.length;
            ta_16_scratch[3] = buf_write.length;

            let ta_u8 = new Uint8Array(4);
            ta_u8[0] = r;
            ta_u8[1] = g;
            ta_u8[2] = b;
            ta_u8[3] = a;

            while (ta_16_scratch[0] < ta_16_scratch[2]) {
                if (buf_read[ta_16_scratch[0]++] === ta_u8[0] && buf_read[ta_16_scratch[0]++] === ta_u8[1] && buf_read[ta_16_scratch[0]++] === ta_u8[2] && buf_read[ta_16_scratch[0]++] === ta_u8[3]) {
                    buf_write[ta_16_scratch[1]] = 255;
                }
                ta_16_scratch[1]++;
            }
            // Traverse the image quickly
            return res;
        }

        // get mask by color

        // greyscale pixel buffer would help a lot
        //  discard alpha

        // Would definitely be faster on a greyscale image
        //  Try despeckle on a greyscale image...

        'get_mask_each_px'(fn_mask) {
            const bipp = this.bipp;
            console.log('get_mask_each_px bipp', bipp);

            // Would be worth returning a view from the typed array?
            //  each_px_ta_subsection

            // May be worth having a variety of functions named by implementation.
            //  Then functions on a higher level named by what they do.

            // set_pixel_by_idx


            const res_mask = new this.constructor({
                size: this.size,
                bits_per_pixel: 1
            })


            if (bipp === 1) {
                // could process it byte by byte
                //  raising the pixel events one by one....

                let byte = 0,
                    bit = 0; //px index too?

                console.trace();
                throw 'NYI'

                const ta = this.ta,
                    l = ta.length;
                while (byte < l) {

                }


            } else if (bipp === 8) {

                // 8 bipp - return a single number each time?
                //  seems to make the most sense.

                // byte by byte...
                console.trace();
                throw 'NYI';



            } else if (bipp === 24) {

                // 24 bipp - will return a view from the typed array.

                // use slice

                //const ta_px = this.ta.slice()

                // go through the pixel indexes
                //  also increment the pixel numbers and positions?

                // basically, need to callback with the correct slices.

                let byte_pos = 0,
                    i_px = 0;
                const l = this.ta.length;

                while (byte_pos < l) {
                    const ta_px = this.ta.slice(byte_pos, byte_pos + 3);
                    const mask_res = fn_mask(ta_px);

                    byte_pos += 3;
                }







            } else if (bipp === 32) {

                // 8 bipp - return a single number each time?
                //  seems to make the most sense.

                console.trace();
                throw 'NYI';




            }

            return res_mask;


        }




        // Pos better as a ta.
        //  That should be the default.

        // An outer flood fill may be all that's needed....

        'measure_color_region_size'(x, y, max) {
            const buffer = this.buffer;

            // Would be good to make a greyscale version.

            //let pixel_buffer_pos = this.bytes_per_pixel * (x + y * this.size[0]);

            // Could make a large typed array buffer of pixels to visit

            // An already visited typed array.

            if (this.bytes_per_pixel === 4) {
                const scratch_32 = new Uint32Array(16);
                // w, h
                scratch_32[0] = this.size[0]; // w
                scratch_32[1] = this.size[1]; // h
                scratch_32[2] = scratch_32[0] * scratch_32[1];
                scratch_32[3] = this.bytes_per_pixel;
                // 4 x, 5 y

                scratch_32[6] = 0 // position within visiting pixels
                scratch_32[7] = 0 // Maximum pixel pos starting index
                scratch_32[8] = 0 // pixel_buffer_pos
                scratch_32[9] = max;
                const ta8_pixels = new Uint8Array(12);
                scratch_32[10] = 0 // count pix3els visited

                // 0, 1, 2, 3    start color
                // 4, 5, 6, 7    px color
                // 8, 9, 10, 11  fill color

                //ta8_pixels[8] = r;
                //ta8_pixels[9] = g;
                //ta8_pixels[10] = b;
                //ta8_pixels[11] = a;

                const ta16_pixels = new Uint8Array(4);
                const ta_pixels_visited = new Uint8Array(scratch_32[2]);
                // Initialise a sequence position buffer that's as long as the whole image

                const ta_visiting_pixels = new Uint16Array(scratch_32[2] * 2);
                // x y coords

                scratch_32[8] = scratch_32[3] * (x + (y * scratch_32[0]));

                //const c_start = new Uint8Array([buffer.readUInt8(pixel_buffer_pos++), buffer.readUInt8(pixel_buffer_pos++), buffer.readUInt8(pixel_buffer_pos++), buffer.readUInt8(pixel_buffer_pos++)]);
                ta8_pixels[0] = buffer[scratch_32[8]++];
                ta8_pixels[1] = buffer[scratch_32[8]++];
                ta8_pixels[2] = buffer[scratch_32[8]++];
                ta8_pixels[3] = buffer[scratch_32[8]++];

                //console.log('c_start', c_start);

                // add the first pixel
                ta_visiting_pixels[0] = x;
                ta_visiting_pixels[1] = y;
                scratch_32[7] = 2;

                //console.log('scratch_32[6]', scratch_32[6]);
                //console.log('scratch_32[7]', scratch_32[7]);

                while (scratch_32[6] < scratch_32[7] && scratch_32[10] < scratch_32[9]) {
                    //console.log('scratch_32[6]', scratch_32[6]);
                    //[x, y] = arr_pixels_to_visit[c_visited];
                    scratch_32[4] = ta_visiting_pixels[scratch_32[6]++]; // x
                    scratch_32[5] = ta_visiting_pixels[scratch_32[6]++]; // y

                    // x + (w * y)
                    //ta_pixels_visited[scratch_32[4] + (scratch_32[0] * scratch_32[5])] = 255;

                    //console.log('c_visited', c_visited);
                    //map_pixels_visited[[x, y]] = true;
                    //console.log('[x, y]', [x, y]);

                    // Check this pixel...
                    //let pixel_buffer_pos = this.bytes_per_pixel * (x + y * this.size[0]);
                    scratch_32[8] = scratch_32[3] * (scratch_32[4] + (scratch_32[5] * scratch_32[0]));

                    //const [pr, pg, pb, pa] = 
                    //const c_px = new Uint8Array([buffer.readUInt8(pixel_buffer_pos++), buffer.readUInt8(pixel_buffer_pos++), buffer.readUInt8(pixel_buffer_pos++), buffer.readUInt8(pixel_buffer_pos++)]);
                    ta8_pixels[4] = buffer[scratch_32[8]++];
                    ta8_pixels[5] = buffer[scratch_32[8]++];
                    ta8_pixels[6] = buffer[scratch_32[8]++];
                    ta8_pixels[7] = buffer[scratch_32[8]++];

                    //console.log('c_px', c_px);
                    // then the difference from the start colors

                    //const c_diff = new Uint8Array([c_start[0] - c_px[0], c_start[1] - c_px[1], c_start[2] - c_px[2], c_start[3] - c_px[3]]);
                    ta16_pixels[0] = ta8_pixels[4] - ta8_pixels[0];
                    ta16_pixels[1] = ta8_pixels[5] - ta8_pixels[1];
                    ta16_pixels[2] = ta8_pixels[6] - ta8_pixels[2];
                    ta16_pixels[3] = ta8_pixels[7] - ta8_pixels[3];

                    // The differences between this and the starting pixel.

                    //console.log('c_diff', c_diff);
                    if (ta16_pixels[0] === 0 && ta16_pixels[1] === 0 && ta16_pixels[2] === 0 && ta16_pixels[3] === 0) {
                        // No color change
                        //  So change the color
                        //scratch_32[8] -= 4;
                        //buffer.writeUInt8(ta8_pixels[8], scratch_32[8]++);
                        //buffer.writeUInt8(ta8_pixels[9], scratch_32[8]++);
                        //buffer.writeUInt8(ta8_pixels[10], scratch_32[8]++);
                        //buffer.writeUInt8(ta8_pixels[11], scratch_32[8]++);

                        // Add adjacent pixels to the queue
                        //  if they've not been visited before.

                        // ta_pixels_visited[scratch_32[4] + (scratch_32[0] * scratch_32[5])]

                        if (scratch_32[4] - 1 >= 0 && scratch_32[4] - 1 < scratch_32[0] && ta_pixels_visited[scratch_32[4] - 1 + (scratch_32[0] * scratch_32[5])] === 0) {
                            ta_visiting_pixels[scratch_32[7]++] = scratch_32[4] - 1;
                            ta_visiting_pixels[scratch_32[7]++] = scratch_32[5];

                            ta_pixels_visited[scratch_32[4] - 1 + (scratch_32[0] * scratch_32[5])] = 255;

                            //scratch_32[10]++;
                            //arr_pixels_to_visit.push([scratch_32[4] - 1, scratch_32[5]]);
                        }

                        if (scratch_32[5] - 1 >= 0 && scratch_32[5] - 1 < scratch_32[1] && ta_pixels_visited[scratch_32[4] + (scratch_32[0] * (scratch_32[5] - 1))] === 0) {
                            ta_visiting_pixels[scratch_32[7]++] = scratch_32[4];
                            ta_visiting_pixels[scratch_32[7]++] = scratch_32[5] - 1;
                            //scratch_32[10]++;
                            //arr_pixels_to_visit.push([scratch_32[4], scratch_32[5] - 1]);

                            ta_pixels_visited[scratch_32[4] + (scratch_32[0] * (scratch_32[5] - 1))] = 255;
                        }
                        if (scratch_32[4] + 1 >= 0 && scratch_32[4] + 1 < scratch_32[0] && ta_pixels_visited[scratch_32[4] + 1 + (scratch_32[0] * scratch_32[5])] === 0) {
                            ta_visiting_pixels[scratch_32[7]++] = scratch_32[4] + 1;
                            ta_visiting_pixels[scratch_32[7]++] = scratch_32[5];
                            //scratch_32[10]++;
                            //arr_pixels_to_visit.push([scratch_32[4] + 1, scratch_32[5]]);
                            ta_pixels_visited[scratch_32[4] + 1 + (scratch_32[0] * scratch_32[5])] = 255
                        }
                        if (scratch_32[5] + 1 >= 0 && scratch_32[5] + 1 < scratch_32[1] && ta_pixels_visited[scratch_32[4] + (scratch_32[0] * (scratch_32[5] + 1))] === 0) {
                            ta_visiting_pixels[scratch_32[7]++] = scratch_32[4];
                            ta_visiting_pixels[scratch_32[7]++] = scratch_32[5] + 1;
                            //scratch_32[10]++;
                            //arr_pixels_to_visit.push([scratch_32[4], scratch_32[5] + 1]);
                            ta_pixels_visited[scratch_32[4] + (scratch_32[0] * (scratch_32[5] + 1))] = 255
                        }
                    }
                    scratch_32[10]++;
                    // compare these arrays
                    // Add adjacent pixels to the stack?
                    //c_visited++;
                    //scratch_32[7] += 2;
                }
                return scratch_32[10];
            } else if (this.bytes_per_pixel === 1) {
                return (() => {
                    const scratch_32 = new Uint32Array(16);

                    // Is this incorrectly measuring small regions.

                    // w, h
                    scratch_32[0] = this.size[0]; // w
                    scratch_32[1] = this.size[1]; // h
                    scratch_32[2] = scratch_32[0] * scratch_32[1];
                    scratch_32[3] = this.bytes_per_pixel;
                    // 4 x, 5 y

                    scratch_32[6] = 0 // position within visiting pixels
                    scratch_32[7] = 0 // Maximum pixel pos starting index
                    scratch_32[8] = 0 // pixel_buffer_pos
                    scratch_32[9] = max;
                    const ta8_pixels = new Uint8Array(12);
                    scratch_32[10] = 0 // count pix3els visited

                    // 0, 1, 2, 3    start color
                    // 4, 5, 6, 7    px color
                    // 8, 9, 10, 11  fill color

                    //ta8_pixels[8] = r;
                    //ta8_pixels[9] = g;
                    //ta8_pixels[10] = b;
                    //ta8_pixels[11] = a;

                    const ta16_pixels = new Uint8Array(4);
                    const ta_pixels_visited = new Uint8Array(scratch_32[2]);
                    // Initialise a sequence position buffer that's as long as the whole image

                    const ta_visiting_pixels = new Uint16Array(scratch_32[2] * 2);
                    // x y coords

                    scratch_32[8] = scratch_32[3] * (x + (y * scratch_32[0]));

                    //const c_start = new Uint8Array([buffer.readUInt8(pixel_buffer_pos++), buffer.readUInt8(pixel_buffer_pos++), buffer.readUInt8(pixel_buffer_pos++), buffer.readUInt8(pixel_buffer_pos++)]);
                    ta8_pixels[0] = buffer[scratch_32[8]++];
                    //ta8_pixels[1] = buffer.readUInt8(scratch_32[8]++);
                    //ta8_pixels[2] = buffer.readUInt8(scratch_32[8]++);
                    //ta8_pixels[3] = buffer.readUInt8(scratch_32[8]++);

                    //console.log('c_start', c_start);

                    // add the first pixel
                    ta_visiting_pixels[0] = x;
                    ta_visiting_pixels[1] = y;
                    scratch_32[7] = 2;

                    //console.log('scratch_32[6]', scratch_32[6]);
                    //console.log('scratch_32[7]', scratch_32[7]);

                    while (scratch_32[6] < scratch_32[7] && scratch_32[10] < scratch_32[9]) {
                        //console.log('scratch_32[6]', scratch_32[6]);
                        //[x, y] = arr_pixels_to_visit[c_visited];
                        scratch_32[4] = ta_visiting_pixels[scratch_32[6]++]; // x
                        scratch_32[5] = ta_visiting_pixels[scratch_32[6]++]; // y
                        scratch_32[8] = scratch_32[3] * (scratch_32[4] + (scratch_32[5] * scratch_32[0]));

                        //const [pr, pg, pb, pa] = 
                        //const c_px = new Uint8Array([buffer.readUInt8(pixel_buffer_pos++), buffer.readUInt8(pixel_buffer_pos++), buffer.readUInt8(pixel_buffer_pos++), buffer.readUInt8(pixel_buffer_pos++)]);
                        ta8_pixels[4] = buffer[scratch_32[8]++];
                        //ta8_pixels[5] = buffer.readUInt8(scratch_32[8]++);
                        //ta8_pixels[6] = buffer.readUInt8(scratch_32[8]++);
                        //ta8_pixels[7] = buffer.readUInt8(scratch_32[8]++);

                        //console.log('c_px', c_px);
                        // then the difference from the start colors

                        //const c_diff = new Uint8Array([c_start[0] - c_px[0], c_start[1] - c_px[1], c_start[2] - c_px[2], c_start[3] - c_px[3]]);
                        ta16_pixels[0] = ta8_pixels[4] - ta8_pixels[0];
                        //ta16_pixels[1] = ta8_pixels[5] - ta8_pixels[1];
                        //ta16_pixels[2] = ta8_pixels[6] - ta8_pixels[2];
                        //ta16_pixels[3] = ta8_pixels[7] - ta8_pixels[3];
                        // The differences between this and the starting pixel.

                        //console.log('c_diff', c_diff);
                        if (ta16_pixels[0] === 0) {
                            if (scratch_32[4] - 1 >= 0 && scratch_32[4] - 1 < scratch_32[0] && ta_pixels_visited[scratch_32[4] - 1 + (scratch_32[0] * scratch_32[5])] === 0) {
                                ta_visiting_pixels[scratch_32[7]++] = scratch_32[4] - 1;
                                ta_visiting_pixels[scratch_32[7]++] = scratch_32[5];
                                ta_pixels_visited[scratch_32[4] - 1 + (scratch_32[0] * scratch_32[5])] = 255;
                            }

                            if (scratch_32[5] - 1 >= 0 && scratch_32[5] - 1 < scratch_32[1] && ta_pixels_visited[scratch_32[4] + (scratch_32[0] * (scratch_32[5] - 1))] === 0) {
                                ta_visiting_pixels[scratch_32[7]++] = scratch_32[4];
                                ta_visiting_pixels[scratch_32[7]++] = scratch_32[5] - 1;
                                ta_pixels_visited[scratch_32[4] + (scratch_32[0] * (scratch_32[5] - 1))] = 255;
                            }
                            if (scratch_32[4] + 1 >= 0 && scratch_32[4] + 1 < scratch_32[0] && ta_pixels_visited[scratch_32[4] + 1 + (scratch_32[0] * scratch_32[5])] === 0) {
                                ta_visiting_pixels[scratch_32[7]++] = scratch_32[4] + 1;
                                ta_visiting_pixels[scratch_32[7]++] = scratch_32[5];
                                ta_pixels_visited[scratch_32[4] + 1 + (scratch_32[0] * scratch_32[5])] = 255
                            }
                            if (scratch_32[5] + 1 >= 0 && scratch_32[5] + 1 < scratch_32[1] && ta_pixels_visited[scratch_32[4] + (scratch_32[0] * (scratch_32[5] + 1))] === 0) {
                                ta_visiting_pixels[scratch_32[7]++] = scratch_32[4];
                                ta_visiting_pixels[scratch_32[7]++] = scratch_32[5] + 1;
                                ta_pixels_visited[scratch_32[4] + (scratch_32[0] * (scratch_32[5] + 1))] = 255
                            }
                        }
                        scratch_32[10]++;
                        // compare these arrays
                        // Add adjacent pixels to the stack?
                        //c_visited++;
                        //scratch_32[7] += 2;
                    }
                    return scratch_32[10];
                })();
            } else {
                throw 'unsuppored bytes_per_pixel ' + this.bytes_per_pixel
            }
            //scratch_32[10];
            //console.log('scratch_32[6]', scratch_32[6]);
            //console.log('c_visited', c_visited);
        }
        // flood fill
        // No toloerance for the moment

        // benchmark and test versions using 'px'

        // flood fill self?

        //  uses position array, uses color array if there are multiple components of the color.
        // flood_fill2?

        // extract/get color block regions pixel_pos_lists

        // iterate each pixel
        //  

        // max size of the region...?
        //  probably best not here.

        'get_pixel_pos_list_of_pixels_with_color'(color) {
            // would be the pixel positions of all the boundaries / outlines.

            let res = new Pixel_Pos_List();
            if (this.pos) {
                console.log('this.pos', this.pos);
                this.each_pixel_ta((pos, px_color) => {
                    if (px_color === color) {
                        //res.add(pos);
                        res.add(new Uint16Array([pos[0] + this.pos[0], pos[1] + this.pos[1]]));
                    }
                });
                res.pos = this.pos;
            } else {
                this.each_pixel_ta((pos, px_color) => {
                    if (px_color === color) {
                        res.add(pos);
                    }
                });
            }
            res.fix();
            return res;
        }

        // get color region

        'get_ppl_color_region'(pos) {
            // Store the pixels visited.

            // Numeric hashing could work out to be really fast. Would need to account for the collisions.

            // Already visited
            // Yet to visit.

            // Also interested in sorting and automatic insertion of pixels into a tree.
            //  Seems worth doing more work on the b+ tree and ordered list.

            // An ordered list of pixels, using single number indexes, would be useful.

            // PPL shift would help too, when reading pixels yet to visit.

            console.trace();
            throw 'NYI';


        }

        // Maybe try a (much) simpler flood fill algorithm to start with.




        // 
        'flood_fill_self_get_pixel_pos_list'(pos, color) {
            //console.log('flood_fill_self_get_pixel_pos_list this.bytes_per_pixel', this.bytes_per_pixel);
            const size = this.size;

            if (!(pos instanceof Uint16Array || pos instanceof Uint32Array)) {
                throw 'Wrong pos data type, pos ' + pos;
            }

            if (this.bytes_per_pixel === 4) {
                throw 'NYI'
            } else if (this.bytes_per_pixel === 1) {



                const using_ta_pixels_visited = () => {
                    const res = new Pixel_Pos_List();
                    //console.log('flood_fill_self_get_pixel_pos_list this.bytes_per_pixel', this.bytes_per_pixel);
                    //throw 'NYI'
                    // flood fill at that pos.
                    const buffer = this.buffer;
                    //let pixel_buffer_pos = this.bytes_per_pixel * (x + y * this.size[0]);
                    // Could make a large typed array buffer of pixels to visit
                    // An already visited typed array.
                    const scratch_32 = new Uint32Array(10);
                    // w, h

                    //const size = this.size;
                    //console.log('size', this.size);

                    scratch_32[0] = this.size[0]; // w
                    scratch_32[1] = this.size[1]; // h

                    const size = scratch_32;



                    scratch_32[2] = size[0] * size[1];
                    scratch_32[3] = this.bytes_per_pixel;

                    // can keep the pixel pos in a UInt16Array

                    let cpos = pos.slice();

                    // 4 x, 5 y

                    scratch_32[6] = 0 // position within visiting pixels
                    scratch_32[7] = 0 // Maximum pixel pos starting index
                    scratch_32[8] = 0 // pixel_buffer_pos
                    scratch_32[9] = 0 // c_visited



                    //const ta8_pixels = new Uint8Array(12);
                    // 0, 1, 2, 3    start color
                    // 4, 5, 6, 7    px color
                    // 8, 9, 10, 11  fill color
                    //ta8_pixels[8] = v;
                    //ta8_pixels[9] = g;
                    //ta8_pixels[10] = b;
                    //ta8_pixels[11] = a;
                    //const ta16_pixels = new Uint8Array(4);
                    //console.log('scratch_32[2]', scratch_32[2]);
                    // Pixels already visited could be a large static matrix.
                    //  So no need to 
                    //const ta_pixels_visited = new Uint8Array(scratch_32[2]);
                    // can use an obj_pixels_visited.

                    const obj_pixels_visited = {};
                    //  Is it possible to store the pixels already visited, and the pixels to visit as a Pixel_Pos_List?
                    //  Right now, the Pixel_Pos_List is not sorted, so it's not possible to test if a specific pixel is within that Pixel_Pos_List.
                    // This one especially may not be sequential.
                    //  
                    // Initialise a sequence position buffer that's as long as the whole image
                    //const ppl_visiting_pixels = new Pixel_Pos_List();


                    // This could be made much smaller by using a Pixel_Pos_List
                    const ppl_visiting_pixels = new Pixel_Pos_List();
                    const ta_visiting_pixels = ppl_visiting_pixels.ta;

                    //const ta_visiting_pixels = new Uint16Array(scratch_32[2] * 2);


                    //  As well as adding them, we can read them.

                    let ccolor;
                    // With this, a Pixel_Pos_List could work well.
                    //  Maybe be adapted a little.
                    // Too much memory being allocated for small numbers of pixels visited.
                    //  could replace that pixel array 

                    // x y coords

                    scratch_32[8] = scratch_32[3] * (cpos[0] + (cpos[1] * size[0]));
                    //const c_start = new Uint8Array([buffer.readUInt8(pixel_buffer_pos++), buffer.readUInt8(pixel_buffer_pos++), buffer.readUInt8(pixel_buffer_pos++), buffer.readUInt8(pixel_buffer_pos++)]);
                    //ta8_pixels[0] = buffer[scratch_32[8]++];
                    ccolor = buffer[scratch_32[8]++];


                    //ta8_pixels[1] = buffer[scratch_32[8]++];
                    //ta8_pixels[2] = buffer[scratch_32[8]++];
                    //ta8_pixels[3] = buffer[scratch_32[8]++];
                    //console.log('c_start', c_start);
                    // add the first pixel
                    //ta_visiting_pixels[0] = cpos[0];
                    //ta_visiting_pixels[1] = cpos[1];
                    ppl_visiting_pixels.add(cpos);

                    //pos_list.add(new Uint16Array([pos[0], pos[1]]));
                    // A map of pixels visited may be best.

                    scratch_32[7] = 2;

                    // does not need to search so many.
                    //  just search until we reach the end of the found pixels

                    // while read successful...

                    // Wrong stop condition.

                    while (scratch_32[9] <= scratch_32[2]) {

                        console.log('scratch_32[9]', scratch_32[9]);
                        console.log('scratch_32[2]', scratch_32[2]);
                        // 
                        //console.log('scratch_32[6]', scratch_32[6]);
                        //[x, y] = arr_pixels_to_visit[c_visited];

                        //  reading through a pixel pos list.
                        //   could even use an iterator.

                        // cpos = ppl_visiting_pixels.next();


                        cpos[0] = ta_visiting_pixels[scratch_32[6]++];
                        cpos[1] = ta_visiting_pixels[scratch_32[6]++];

                        //scratch_32[4] = ta_visiting_pixels[scratch_32[6]++]; // x
                        //scratch_32[5] = ta_visiting_pixels[scratch_32[6]++]; // y

                        //scratch_32[4] = ppl_visiting_pixels.ta[scratch_32[6]++]; // x
                        //scratch_32[5] = ppl_visiting_pixels.ta[scratch_32[6]++]; // y

                        scratch_32[8] = scratch_32[3] * (cpos[0] + (cpos[1] * size[0]));
                        //console.log('buffer[scratch_32[8]]', buffer[scratch_32[8]]);
                        //console.log('ta8_pixels[0]', ta8_pixels[0]);
                        //console.log('scratch_32[8]', scratch_32[8]);

                        if (buffer[scratch_32[8]++] - ccolor === 0) {
                            // No color change
                            //  So change the color
                            //scratch_32[8]--;
                            buffer[scratch_32[8] - 1] = color;
                            //console.log('color', color);
                            //console.log('typeof color', typeof color);
                            // do that later...
                            // pos_list.add(new Uint16Array([scratch_32[4], scratch_32[5]]));
                            // instead we can use a view of those pixels / or maybe better a shallow copy?

                            //res.add(cpos.slice());
                            res.add(cpos);

                            // Should the pos_list be sorted in order?
                            //buffer[scratch_32[8]++] = ta8_pixels[9];
                            //buffer[scratch_32[8]++] = ta8_pixels[10];
                            //buffer[scratch_32[8]++] = ta8_pixels[11];

                            // could individually check / increase the ta_visiting_pixels

                            if (cpos[0] - 1 >= 0 && !obj_pixels_visited[cpos[0] - 1 + (size[0] * cpos[1])]) {
                                // can have a pixel pos list.
                                //  need to read it from the front.
                                //  read_pixel

                                ppl_visiting_pixels.add(new Uint16Array([cpos[0] - 1, cpos[1]]));
                                scratch_32[7] += 2;
                                //ta_visiting_pixels[scratch_32[7]++] = cpos[0] - 1;
                                //ta_visiting_pixels[scratch_32[7]++] = cpos[1];

                                //ta_pixels_visited[scratch_32[4] - 1 + (scratch_32[0] * scratch_32[5])] = 255;

                                obj_pixels_visited[cpos[0] - 1 + (size[0] * cpos[1])] = true;
                                //pos_list.add(new Uint16Array([scratch_32[4] - 1, scratch_32[5]]));
                                //arr_pixels_to_visit.push([scratch_32[4] - 1, scratch_32[5]]);
                            }
                            if (cpos[1] - 1 >= 0 && !obj_pixels_visited[cpos[0] + (size[0] * (cpos[1] - 1))]) {
                                //ta_visiting_pixels[scratch_32[7]++] = cpos[0];
                                //ta_visiting_pixels[scratch_32[7]++] = cpos[1] - 1;
                                ppl_visiting_pixels.add(new Uint16Array([cpos[0], cpos[1] - 1]));
                                scratch_32[7] += 2;
                                //arr_pixels_to_visit.push([scratch_32[4], scratch_32[5] - 1]);
                                //ta_pixels_visited[scratch_32[4] + (scratch_32[0] * (scratch_32[5] - 1))] = 255;

                                obj_pixels_visited[cpos[0] + (size[0] * (cpos[1] - 1))] = true;
                                //pos_list.add(new Uint16Array([scratch_32[4], scratch_32[5] - 1]));
                            }
                            if (cpos[0] + 1 < size[0] && !obj_pixels_visited[cpos[0] + 1 + (size[0] * cpos[1])]) {
                                //ta_visiting_pixels[scratch_32[7]++] = cpos[0] + 1;
                                //ta_visiting_pixels[scratch_32[7]++] = cpos[1];

                                ppl_visiting_pixels.add(new Uint16Array([cpos[0] + 1, cpos[1]]));
                                scratch_32[7] += 2;

                                //arr_pixels_to_visit.push([scratch_32[4] + 1, scratch_32[5]]);
                                //ta_pixels_visited[scratch_32[4] + 1 + (scratch_32[0] * scratch_32[5])] = 255;
                                obj_pixels_visited[cpos[0] + 1 + (size[0] * cpos[1])] = true;
                                //pos_list.add(new Uint16Array([scratch_32[4] + 1, scratch_32[5]]));
                            }
                            if (cpos[1] + 1 < size[1] && !obj_pixels_visited[cpos[0] + (size[0] * (cpos[1] + 1))]) {
                                //ta_visiting_pixels[scratch_32[7]++] = cpos[0];
                                //ta_visiting_pixels[scratch_32[7]++] = cpos[1] + 1;
                                ppl_visiting_pixels.add(new Uint16Array([cpos[0], cpos[1] + 1]));
                                scratch_32[7] += 2;
                                //arr_pixels_to_visit.push([scratch_32[4], scratch_32[5] + 1]);
                                //ta_pixels_visited[scratch_32[4] + (scratch_32[0] * (scratch_32[5] + 1))] = 255;

                                obj_pixels_visited[cpos[0] + (size[0] * (cpos[1] + 1))] = true;
                                //pos_list.add(new Uint16Array([scratch_32[4], scratch_32[5] + 1]));
                            }
                        }
                        scratch_32[9]++;
                    }
                    // this pos list is the result.
                    res.fix();
                    return res;
                }
                return using_ta_pixels_visited();
            } else {
                console.trace();
                throw 'NYI';

            }
        }

        // May be worth making a new flood fill using better lower level components.

        // Definitely worth remaking flood fill.
        //  Worth testing it with a smaller image.

        // Could just get the color region, then color in those pixels.


        // This is a good flood fill.
        //  May be better to update with different version for different bipp.

        // And a general high level flood fill algorithm for other bipp values.


        // Greatly optimised implementation of this will help.
        //  As will greatly optimised implementation of flood filling from the edges.


        // This implementation is optimised a little at least...
        //  A more optimised version that uses a 1 byte per pixel matrix would be faster, no doubt.
        //  Faster for tracking which pixels have been visited.
        //   Would use about 8* as much RAM, which should be OK.

        // Then want to make optimised / highly optimised version(s).

        // Including optimisations for flood filling color 1 from outer boundary in 1bipp images.
        //  Is particularly useful for drawing filled polygons / shapes.










        'flood_fill_1bipp'(x, y, color) {




            const new_color = color;
            const target_color = this.get_pixel([x, y]);

            const [width, height] = this.size;

            //console.log('target_color', target_color);
            //console.log('new_color', new_color);

            if (target_color === new_color) {
                // No need to fill if the new color is the same as the target color
                return 0;
            } else {


                /*
                const arr_stack_implementation = () => {

                    const stack = [];
                    stack.push([x, y]);

                    //ppl_to_visit.add(ta_pos);

                    // Is a lot faster using a Core Pixel_Buffer to keep track of which pixels have already been visited.
                    //  An array that is 8 times the size would probably be faster.
                    //   Maybe by a lot.




                    const pb_already_visited = new Core({
                        size: this.size,
                        bits_per_pixel: 1
                    })
                    //const dict_already = {};

                    let curr_x, curr_y, px;

                    let shifted;

                    // No, need to pop pixels to see about visiting them.

                    //shifted = ppl_to_visit.shift();


                    //while (shifted !== undefined && shifted.length > 0) {


                    // May be faster using 8 bipp temporarily.





                    while (stack.length > 0) {
                        [curr_x, curr_y] = stack.pop();
                        //console.log('shifted', shifted);

                        //shifted = ppl_to_visit.shift();
                        //console.log('shifted', shifted);

                        //curr_x = shifted[0];
                        //curr_y = shifted[1];


                        //[curr_x, curr_y] = ppl_to_visit.shift();


                        //console.log('[curr_x, curr_y]', [curr_x, curr_y]);

                        // Could inline the pixel access.


                        px = this.get_pixel([curr_x, curr_y]);
                        //console.log('px', px);
                        //console.log('target_color', target_color);

                        if (px === target_color) {
                            //console.log('px match');

                            this.set_pixel_1bipp([curr_x, curr_y], new_color);
                            // Check neighbors
                            if (curr_x > 0) {
                                // if that px is not on the stack already though...


                                if (pb_already_visited.get_pixel_1bipp([curr_x - 1, curr_y]) === 0) {
                                    //ta_pos[0] = curr_x - 1;
                                    //ta_pos[1] = curr_y;
                                    //ppl_to_visit.add(ta_pos);

                                    stack.push([curr_x - 1, curr_y]);
                                };

                                //if (!dict_already[[curr_x - 1, curr_y]]) {
                                //    stack.push([curr_x - 1, curr_y]);
                                //}
                            }
                            if (curr_x < width - 1) {
                                //stack.push([curr_x + 1, curr_y]);

                                if (pb_already_visited.get_pixel_1bipp([curr_x + 1, curr_y]) === 0) {
                                    stack.push([curr_x + 1, curr_y]);

                                    //ta_pos[0] = curr_x + 1;
                                    //ta_pos[1] = curr_y;
                                    //ppl_to_visit.add(ta_pos);


                                };

                            }
                            if (curr_y > 0) {
                                if (pb_already_visited.get_pixel_1bipp([curr_x, curr_y - 1]) === 0) {
                                    stack.push([curr_x, curr_y - 1]);

                                    //ta_pos[0] = curr_x;
                                    //ta_pos[1] = curr_y - 1;
                                    //ppl_to_visit.add(ta_pos);
                                };
                            }
                            if (curr_y < height - 1) {

                                if (pb_already_visited.get_pixel_1bipp([curr_x, curr_y + 1]) === 0) {
                                    stack.push([curr_x, curr_y + 1]);

                                    //ta_pos[0] = curr_x;
                                    //ta_pos[1] = curr_y + 1;
                                    //ppl_to_visit.add(ta_pos);
                                };
                            }

                            pb_already_visited.set_pixel_1bipp([curr_x, curr_y], 1);

                            //dict_already[[curr_x, curr_y]] = true;
                        }

                        //shifted = ppl_to_visit.shift();
                        //console.log('stack.length', stack.length);
                        //console.log('dict_already', dict_already);
                    }


                }

                //return arr_stack_implementation();
                */




                // Not so sure why the ta implementation below does not work.
                //  Seems to be putting too many on the stack.
                //  Maybe get and set pixel is not working for these ta position objects.

                // Must find the right optimisations.
                //  Probably best to check some lower level functions using ta positions.
                //  Esp for 1 bipp functions.



                /*

                const ta_stack_fn_calls_implementation = () => {

                    // Capcity number of pixels....

                    // Takes a few ms to allocate....

                    let stack_capacity = 1024 * 1024 * 8; // 8 MB for now. 64???
                    //  Seems not to get it done with a huge stack....



                    let ta_stack = new Uint16Array(stack_capacity);
                    let i_stack_pos = 0;
                    let stack_length = 0;
                    let px_color;
                    
                    // and the number in the stack...?

                    let ta_pos = new Uint16Array(2);
                    let ta_pos2 = new Uint16Array(2);

                    // stack push...
                    //  want it inline rather than function call (probably??? will test)
                    //  will make a version that calls internal functions for now.
                    //   possibly will be very fast.


                    // Maybe don't need capacity check???


                    // Could keep track of max stack length as it runs.


                    const fn_stack_push_pos = pos => {

                        
                        //ta_stack[i_stack_pos++] = pos[0];
                        //ta_stack[i_stack_pos++] = pos[1];
                        //stack_length++;
                        

                        // Maybe slows it down a tiny amount?

                        if (i_stack_pos < stack_capacity) {
                            ta_stack[i_stack_pos++] = pos[0];
                            ta_stack[i_stack_pos++] = pos[1];
                            stack_length++;
                        } else {

                            console.log('stack_length', stack_length);
                            console.log('i_stack_pos', i_stack_pos);

                            console.trace();
                            throw 'NYI - stack exceeded capacity';
                        }
                    }


                    // Could inline these without too much difficulty.

                    const fn_stack_pop_pos = () => {
                        if (i_stack_pos > 1) {
                            ta_pos[0] = ta_stack[i_stack_pos - 2];
                            ta_pos[1] = ta_stack[i_stack_pos - 1];
                            i_stack_pos -= 2;
                            stack_length--;
                            //console.log('ta_pos', ta_pos);
                            //console.log('stack_length', stack_length);
                            //return ta_pos;
                        } else {
                            //return undefined;
                        }
                    }

                    ta_pos[0] = x;
                    ta_pos[1] = y;
                    fn_stack_push_pos(ta_pos);


                    // Could inline this...
                    //  Or speed it up using 1bypp (simpler algorithms)
                    const pb_already_visited = new Core({
                        size: this.size,
                        bits_per_pixel: 1
                    })

                    // Think this part is working, problem seems to be with stack?
                    //  Or the use of these data types?

                    // Seems broken....

                    //console.log('stack_length', stack_length);
                    //throw 'stop';

                    while (stack_length > 0) {
                        fn_stack_pop_pos();
                        //console.log('pop_res', pop_res);
                        // loads into ta_pos
                        // More specific get pixel function speeds it up a little.
                        px_color = this.get_pixel_1bipp(ta_pos); // inline this?

                        if (px_color === target_color) {
                            this.set_pixel_1bipp(ta_pos, new_color);
                            // 

                            if (ta_pos[0] > 0) {
                                // if that px is not on the stack already though...
                                ta_pos2[0] = ta_pos[0] - 1;
                                ta_pos2[1] = ta_pos[1];

                                // And getting the pixel does not quite work here....

                                //console.log('pb_already_visited.get_pixel_1bipp(ta_pos2)', pb_already_visited.get_pixel_1bipp(ta_pos2));

                                if (pb_already_visited.get_pixel_1bipp(ta_pos2) === 0) {
                                    //ta_pos[0] = curr_x - 1;
                                    //ta_pos[1] = curr_y;
                                    //ppl_to_visit.add(ta_pos);
                                    fn_stack_push_pos(ta_pos2);
                                };

                                //if (!dict_already[[curr_x - 1, curr_y]]) {
                                //    stack.push([curr_x - 1, curr_y]);
                                //}
                            }
                            if (ta_pos[0] < width - 1) {
                                //stack.push([curr_x + 1, curr_y]);
                                ta_pos2[0] = ta_pos[0] + 1;
                                ta_pos2[1] = ta_pos[1];

                                //console.log('pb_already_visited.get_pixel_1bipp(ta_pos2)', pb_already_visited.get_pixel_1bipp(ta_pos2));

                                if (pb_already_visited.get_pixel_1bipp(ta_pos2) === 0) {
                                    //ta_pos[0] = curr_x - 1;
                                    //ta_pos[1] = curr_y;
                                    //ppl_to_visit.add(ta_pos);
                                    fn_stack_push_pos(ta_pos2);
                                };

                            }
                            if (ta_pos[1] > 0) {

                                ta_pos2[0] = ta_pos[0];
                                ta_pos2[1] = ta_pos[1] - 1;

                                //console.log('pb_already_visited.get_pixel_1bipp(ta_pos2)', pb_already_visited.get_pixel_1bipp(ta_pos2));

                                if (pb_already_visited.get_pixel_1bipp(ta_pos2) === 0) {
                                    //stack.push([curr_x, curr_y - 1]);

                                    fn_stack_push_pos(ta_pos2);

                                    //ta_pos[0] = curr_x;
                                    //ta_pos[1] = curr_y - 1;
                                    //ppl_to_visit.add(ta_pos);
                                };
                            }
                            if (ta_pos[1] < height - 1) {
                                ta_pos2[0] = ta_pos[0];
                                ta_pos2[1] = ta_pos[1] + 1;
                                //console.log('pb_already_visited.get_pixel_1bipp(ta_pos2)', pb_already_visited.get_pixel_1bipp(ta_pos2));

                                if (pb_already_visited.get_pixel_1bipp(ta_pos2) === 0) {
                                    //stack.push([curr_x, curr_y - 1]);

                                    fn_stack_push_pos(ta_pos2);
                                    //ta_pos[0] = curr_x;
                                    //ta_pos[1] = curr_y - 1;
                                    //ppl_to_visit.add(ta_pos);
                                };
                            }
                            pb_already_visited.set_pixel_1bipp(ta_pos, 1);
                        }
                        //console.log('stack_length', stack_length);
                    }
                }
                //return ta_stack_fn_calls_implementation();

                */



                // Still maybe not fast enough....
                //  A variety of possible optimisations exist.

                // Especially when getting into the lower level bits.
                //  Things such as flood-fill right and left rapidly.
                //   Identifying which bits, to left and right of pixel, can have thier values set to 255.
                //    Being able to (accurately) set multiple pixels at once.

                // Possibly measuring how many borders enclose a pixel?
                //  Could be optimal in some cases.






                


                // Then an inlined implementation of get and set pixel?
                //  A matrix of the full size for if a pixel has been visited or not would be quicker.





                const ta_stack_fn_calls_inlined_implementation = () => {

                    // Capcity number of pixels....

                    // Takes a few ms to allocate....

                    let stack_capacity = 1024 * 1024 * 8; // 8 MB for now. 64???
                    //  Seems not to get it done with a huge stack....



                    let ta_stack = new Uint16Array(stack_capacity);
                    let i_stack_pos = 0;
                    let stack_length = 0;
                    let px_color;
                    
                    // and the number in the stack...?

                    let ta_pos = new Uint16Array(2);
                    let ta_pos2 = new Uint16Array(2);

                    // stack push...
                    //  want it inline rather than function call (probably??? will test)
                    //  will make a version that calls internal functions for now.
                    //   possibly will be very fast.


                    // Maybe don't need capacity check???


                    // Could keep track of max stack length as it runs.

                    /*

                    const fn_stack_push_pos = pos => {

                        
                        //ta_stack[i_stack_pos++] = pos[0];
                        //ta_stack[i_stack_pos++] = pos[1];
                        //stack_length++;
                        

                        // Maybe slows it down a tiny amount?

                        if (i_stack_pos < stack_capacity) {
                            ta_stack[i_stack_pos++] = pos[0];
                            ta_stack[i_stack_pos++] = pos[1];
                            stack_length++;
                        } else {

                            console.log('stack_length', stack_length);
                            console.log('i_stack_pos', i_stack_pos);

                            console.trace();
                            throw 'NYI - stack exceeded capacity';
                        }
                    }
                    */


                    // Could inline these without too much difficulty.


                    /*

                    const fn_stack_pop_pos = () => {
                        if (i_stack_pos > 1) {
                            ta_pos[0] = ta_stack[i_stack_pos - 2];
                            ta_pos[1] = ta_stack[i_stack_pos - 1];
                            i_stack_pos -= 2;
                            stack_length--;
                            //console.log('ta_pos', ta_pos);
                            //console.log('stack_length', stack_length);
                            //return ta_pos;
                        } else {
                            //return undefined;
                        }
                    }
                    */

                    ta_pos[0] = x;
                    ta_pos[1] = y;
                    //fn_stack_push_pos(ta_pos);

                    if (i_stack_pos < stack_capacity) {
                        ta_stack[i_stack_pos++] = ta_pos[0];
                        ta_stack[i_stack_pos++] = ta_pos[1];
                        stack_length++;
                    } else {

                        console.log('stack_length', stack_length);
                        console.log('i_stack_pos', i_stack_pos);

                        console.trace();
                        throw 'NYI - stack exceeded capacity';
                    }


                    // Could inline this...
                    //  Or speed it up using 1bypp (simpler algorithms)
                    const pb_already_visited = new Core({
                        size: this.size,
                        bits_per_pixel: 1
                    })

                    // Think this part is working, problem seems to be with stack?
                    //  Or the use of these data types?

                    // Seems broken....

                    //console.log('stack_length', stack_length);
                    //throw 'stop';

                    while (stack_length > 0) {
                        //fn_stack_pop_pos();

                        //if (i_stack_pos > 1) {
                            ta_pos[0] = ta_stack[i_stack_pos - 2];
                            ta_pos[1] = ta_stack[i_stack_pos - 1];
                            i_stack_pos -= 2;
                            stack_length--;
                            //console.log('ta_pos', ta_pos);
                            //console.log('stack_length', stack_length);
                            //return ta_pos;
                        //}

                        //console.log('pop_res', pop_res);
                        // loads into ta_pos
                        // More specific get pixel function speeds it up a little.
                        px_color = this.get_pixel_1bipp(ta_pos); // inline this?

                        if (px_color === target_color) {
                            this.set_pixel_1bipp(ta_pos, new_color);
                            // 

                            if (ta_pos[0] > 0) {
                                // if that px is not on the stack already though...
                                ta_pos2[0] = ta_pos[0] - 1;
                                ta_pos2[1] = ta_pos[1];

                                // And getting the pixel does not quite work here....

                                //console.log('pb_already_visited.get_pixel_1bipp(ta_pos2)', pb_already_visited.get_pixel_1bipp(ta_pos2));

                                if (pb_already_visited.get_pixel_1bipp(ta_pos2) === 0) {
                                    //ta_pos[0] = curr_x - 1;
                                    //ta_pos[1] = curr_y;
                                    //ppl_to_visit.add(ta_pos);
                                    //fn_stack_push_pos(ta_pos2);


                                    if (i_stack_pos < stack_capacity) {
                                        ta_stack[i_stack_pos++] = ta_pos2[0];
                                        ta_stack[i_stack_pos++] = ta_pos2[1];
                                        stack_length++;
                                    } else {
            
                                        console.log('stack_length', stack_length);
                                        console.log('i_stack_pos', i_stack_pos);
            
                                        console.trace();
                                        throw 'NYI - stack exceeded capacity';
                                    }


                                };

                                //if (!dict_already[[curr_x - 1, curr_y]]) {
                                //    stack.push([curr_x - 1, curr_y]);
                                //}
                            }
                            if (ta_pos[0] < width - 1) {
                                //stack.push([curr_x + 1, curr_y]);
                                ta_pos2[0] = ta_pos[0] + 1;
                                ta_pos2[1] = ta_pos[1];

                                //console.log('pb_already_visited.get_pixel_1bipp(ta_pos2)', pb_already_visited.get_pixel_1bipp(ta_pos2));

                                if (pb_already_visited.get_pixel_1bipp(ta_pos2) === 0) {
                                    //ta_pos[0] = curr_x - 1;
                                    //ta_pos[1] = curr_y;
                                    //ppl_to_visit.add(ta_pos);
                                    //fn_stack_push_pos(ta_pos2);

                                    if (i_stack_pos < stack_capacity) {
                                        ta_stack[i_stack_pos++] = ta_pos2[0];
                                        ta_stack[i_stack_pos++] = ta_pos2[1];
                                        stack_length++;
                                    } else {
            
                                        console.log('stack_length', stack_length);
                                        console.log('i_stack_pos', i_stack_pos);
            
                                        console.trace();
                                        throw 'NYI - stack exceeded capacity';
                                    }

                                };

                            }
                            if (ta_pos[1] > 0) {

                                ta_pos2[0] = ta_pos[0];
                                ta_pos2[1] = ta_pos[1] - 1;

                                //console.log('pb_already_visited.get_pixel_1bipp(ta_pos2)', pb_already_visited.get_pixel_1bipp(ta_pos2));

                                if (pb_already_visited.get_pixel_1bipp(ta_pos2) === 0) {
                                    //stack.push([curr_x, curr_y - 1]);

                                    //fn_stack_push_pos(ta_pos2);

                                    if (i_stack_pos < stack_capacity) {
                                        ta_stack[i_stack_pos++] = ta_pos2[0];
                                        ta_stack[i_stack_pos++] = ta_pos2[1];
                                        stack_length++;
                                    } else {
            
                                        console.log('stack_length', stack_length);
                                        console.log('i_stack_pos', i_stack_pos);
            
                                        console.trace();
                                        throw 'NYI - stack exceeded capacity';
                                    }

                                    //ta_pos[0] = curr_x;
                                    //ta_pos[1] = curr_y - 1;
                                    //ppl_to_visit.add(ta_pos);
                                };
                            }
                            if (ta_pos[1] < height - 1) {
                                ta_pos2[0] = ta_pos[0];
                                ta_pos2[1] = ta_pos[1] + 1;
                                //console.log('pb_already_visited.get_pixel_1bipp(ta_pos2)', pb_already_visited.get_pixel_1bipp(ta_pos2));

                                if (pb_already_visited.get_pixel_1bipp(ta_pos2) === 0) {
                                    //stack.push([curr_x, curr_y - 1]);

                                    //fn_stack_push_pos(ta_pos2);

                                    if (i_stack_pos < stack_capacity) {
                                        ta_stack[i_stack_pos++] = ta_pos2[0];
                                        ta_stack[i_stack_pos++] = ta_pos2[1];
                                        stack_length++;
                                    } else {
            
                                        console.log('stack_length', stack_length);
                                        console.log('i_stack_pos', i_stack_pos);
            
                                        console.trace();
                                        throw 'NYI - stack exceeded capacity';
                                    }
                                    //ta_pos[0] = curr_x;
                                    //ta_pos[1] = curr_y - 1;
                                    //ppl_to_visit.add(ta_pos);
                                };
                            }
                            pb_already_visited.set_pixel_1bipp(ta_pos, 1);
                        }
                        //console.log('stack_length', stack_length);
                    }
                }

                // And this is just a tiny bit faster too....
                

                return ta_stack_fn_calls_inlined_implementation();
                

                
            }

            // A typed array stack could be more effective.
            //  Or a pixel_pos_list.


            // Maybe have a Position_Stack class.
            //  be able to push onto the stack
            //  pop from the stack




            // Or use a Pixel_Pos_List instead of a stack.

            


            // ppl_visiting_pixels instead?


            //const ppl_to_visit = new Pixel_Pos_List();

            //const ta_pos = new Uint16Array([x, y]);

            // Maybe Pixel_Position_Stack.



            

            
        }


        'flood_fill'(x, y, r, g, b, a) {

            const {
                bipp
            } = this;

            // Want to use bipp.

            // And have it work with 1 bipp images too.

            // TODO: Local let variables are quite performant, when they are numbers. Consider using them more. Would clarify code, may even improve perf.


            // Worth trying 1 bipp flood fills.


            // stack of pixels to visit
            // map of pixels visited
            // Could optimize this with typed arrays
            //const [w, h] = this.size;

            // 3 bytes per pixel....

            // Can we try a simpler algorithm, at least to start with???


            if (bipp === 24) {

                const [w, h] = this.size;
                let fast_stacked_mapped_flood_fill = () => {
                    //const map_pixels_visited = {};
                    //const arr_pixels_to_visit = [[x, y]];
                    //let c_visited = 0;
                    const buffer = this.buffer;
                    // or .ta?



                    //let pixel_buffer_pos = this.bytes_per_pixel * (x + y * this.size[0]);
                    // Could make a large typed array buffer of pixels to visit
                    // An already visited typed array.
                    const scratch_32 = new Uint32Array(16);
                    // w, h
                    scratch_32[0] = this.size[0]; // w
                    scratch_32[1] = this.size[1]; // h
                    scratch_32[2] = scratch_32[0] * scratch_32[1];
                    scratch_32[3] = this.bytes_per_pixel;
                    // 4 x, 5 y

                    scratch_32[6] = 0 // position within visiting pixels
                    scratch_32[7] = 0 // Maximum pixel pos starting index
                    scratch_32[8] = 0 // pixel_buffer_pos
                    scratch_32[9] = 0 // c_visited

                    const ta8_pixels = new Uint8Array(12);

                    // 0, 1, 2, 3    start color
                    // 4, 5, 6, 7    px color
                    // 8, 9, 10, 11  fill color

                    ta8_pixels[8] = r;
                    ta8_pixels[9] = g;
                    ta8_pixels[10] = b;
                    //ta8_pixels[11] = a;

                    //console.log('r, g, b', r, g, b);

                    //console.log('ta8_pixels[8]', ta8_pixels[8]);
                    //        console.log('ta8_pixels[9]', ta8_pixels[9]);
                    //        console.log('ta8_pixels[10]', ta8_pixels[10]);

                    //throw 'stop1';

                    //const ta16_pixels = new Uint8Array(4);
                    //console.log('scratch_32[2]', scratch_32[2]);
                    const ta_pixels_visited = new Uint8Array(scratch_32[2]);
                    // Initialise a sequence position buffer that's as long as the whole image
                    const ta_visiting_pixels = new Uint16Array(scratch_32[2] * 2);
                    // x y coords

                    scratch_32[8] = scratch_32[3] * (x + (y * scratch_32[0]));

                    //const c_start = new Uint8Array([buffer.readUInt8(pixel_buffer_pos++), buffer.readUInt8(pixel_buffer_pos++), buffer.readUInt8(pixel_buffer_pos++), buffer.readUInt8(pixel_buffer_pos++)]);
                    ta8_pixels[0] = buffer[scratch_32[8]++];
                    ta8_pixels[1] = buffer[scratch_32[8]++];
                    ta8_pixels[2] = buffer[scratch_32[8]++];
                    //ta8_pixels[3] = buffer[scratch_32[8]++];

                    //console.log('c_start', c_start);


                    // add the first pixel
                    ta_visiting_pixels[0] = x;
                    ta_visiting_pixels[1] = y;
                    scratch_32[7] = 2;

                    //console.log('scratch_32[6]', scratch_32[6]);
                    //console.log('scratch_32[7]', scratch_32[7]);

                    //c_visited < 

                    // Looks like the wrong stop condition here.
                    while (scratch_32[9] <= scratch_32[2]) {
                        // 
                        //console.log('scratch_32[6]', scratch_32[6]);
                        //[x, y] = arr_pixels_to_visit[c_visited];
                        scratch_32[4] = ta_visiting_pixels[scratch_32[6]++]; // x
                        scratch_32[5] = ta_visiting_pixels[scratch_32[6]++]; // y

                        // x + (w * y)
                        //ta_pixels_visited[scratch_32[4] + (scratch_32[0] * scratch_32[5])] = 255;

                        //console.log('c_visited', c_visited);
                        //map_pixels_visited[[x, y]] = true;
                        //console.log('[x, y]', [x, y]);

                        // Check this pixel...
                        //let pixel_buffer_pos = this.bytes_per_pixel * (x + y * this.size[0]);
                        scratch_32[8] = scratch_32[3] * (scratch_32[4] + (scratch_32[5] * scratch_32[0]));


                        //const [pr, pg, pb, pa] = 
                        //const c_px = new Uint8Array([buffer.readUInt8(pixel_buffer_pos++), buffer.readUInt8(pixel_buffer_pos++), buffer.readUInt8(pixel_buffer_pos++), buffer.readUInt8(pixel_buffer_pos++)]);
                        //ta8_pixels[4] = buffer.readUInt8(scratch_32[8]++);
                        //ta8_pixels[5] = buffer.readUInt8(scratch_32[8]++);
                        //ta8_pixels[6] = buffer.readUInt8(scratch_32[8]++);
                        //ta8_pixels[7] = buffer.readUInt8(scratch_32[8]++);

                        //ta8_pixels[4] = buffer[scratch_32[8]++];
                        //ta8_pixels[5] = buffer[scratch_32[8]++];
                        //ta8_pixels[6] = buffer[scratch_32[8]++];
                        //ta8_pixels[7] = buffer[scratch_32[8]++];

                        //console.log('c_px', c_px);
                        // then the difference from the start colors

                        //const c_diff = new Uint8Array([c_start[0] - c_px[0], c_start[1] - c_px[1], c_start[2] - c_px[2], c_start[3] - c_px[3]]);
                        //ta16_pixels[0] = buffer[scratch_32[8]++] - ta8_pixels[0];
                        //ta16_pixels[1] = buffer[scratch_32[8]++] - ta8_pixels[1];
                        //ta16_pixels[2] = buffer[scratch_32[8]++] - ta8_pixels[2];
                        //ta16_pixels[3] = buffer[scratch_32[8]++] - ta8_pixels[3];



                        //console.log('c_diff', c_diff);
                        //if (ta16_pixels[0] === 0 && ta16_pixels[1] === 0 && ta16_pixels[2] === 0 && ta16_pixels[3] === 0) {
                        if (buffer[scratch_32[8]++] - ta8_pixels[0] === 0 && buffer[scratch_32[8]++] - ta8_pixels[1] === 0 && buffer[scratch_32[8]++] - ta8_pixels[2] === 0) {
                            // No color change
                            //  So change the color
                            scratch_32[8] -= 3;
                            //buffer.writeUInt8(ta8_pixels[8], scratch_32[8]++);
                            //buffer.writeUInt8(ta8_pixels[9], scratch_32[8]++);
                            //buffer.writeUInt8(ta8_pixels[10], scratch_32[8]++);
                            //buffer.writeUInt8(ta8_pixels[11], scratch_32[8]++);
                            //console.log('ta8_pixels[8]', ta8_pixels[8]);
                            //console.log('ta8_pixels[9]', ta8_pixels[9]);
                            //console.log('ta8_pixels[10]', ta8_pixels[10]);
                            buffer[scratch_32[8]++] = ta8_pixels[8];
                            buffer[scratch_32[8]++] = ta8_pixels[9];
                            buffer[scratch_32[8]++] = ta8_pixels[10];
                            //buffer[scratch_32[8]++] = ta8_pixels[11];

                            // Add adjacent pixels to the queue
                            //  if they've not been visited before.

                            // ta_pixels_visited[scratch_32[4] + (scratch_32[0] * scratch_32[5])]

                            if (scratch_32[4] - 1 >= 0 && ta_pixels_visited[scratch_32[4] - 1 + (scratch_32[0] * scratch_32[5])] === 0) {
                                ta_visiting_pixels[scratch_32[7]++] = scratch_32[4] - 1;
                                ta_visiting_pixels[scratch_32[7]++] = scratch_32[5];

                                ta_pixels_visited[scratch_32[4] - 1 + (scratch_32[0] * scratch_32[5])] = 255;

                                //arr_pixels_to_visit.push([scratch_32[4] - 1, scratch_32[5]]);
                            }
                            if (scratch_32[5] - 1 >= 0 && ta_pixels_visited[scratch_32[4] + (scratch_32[0] * (scratch_32[5] - 1))] === 0) {
                                ta_visiting_pixels[scratch_32[7]++] = scratch_32[4];
                                ta_visiting_pixels[scratch_32[7]++] = scratch_32[5] - 1;
                                //arr_pixels_to_visit.push([scratch_32[4], scratch_32[5] - 1]);
                                ta_pixels_visited[scratch_32[4] + (scratch_32[0] * (scratch_32[5] - 1))] = 255;
                            }
                            if (scratch_32[4] + 1 < scratch_32[0] && ta_pixels_visited[scratch_32[4] + 1 + (scratch_32[0] * scratch_32[5])] === 0) {
                                ta_visiting_pixels[scratch_32[7]++] = scratch_32[4] + 1;
                                ta_visiting_pixels[scratch_32[7]++] = scratch_32[5];
                                //arr_pixels_to_visit.push([scratch_32[4] + 1, scratch_32[5]]);
                                ta_pixels_visited[scratch_32[4] + 1 + (scratch_32[0] * scratch_32[5])] = 255;
                            }
                            if (scratch_32[5] + 1 < scratch_32[1] && ta_pixels_visited[scratch_32[4] + (scratch_32[0] * (scratch_32[5] + 1))] === 0) {
                                ta_visiting_pixels[scratch_32[7]++] = scratch_32[4];
                                ta_visiting_pixels[scratch_32[7]++] = scratch_32[5] + 1;
                                //arr_pixels_to_visit.push([scratch_32[4], scratch_32[5] + 1]);
                                ta_pixels_visited[scratch_32[4] + (scratch_32[0] * (scratch_32[5] + 1))] = 255;
                            }
                        }
                        scratch_32[9]++;
                        // compare these arrays
                        // Add adjacent pixels to the stack?
                        //c_visited++;
                        //scratch_32[7] += 2;
                    }
                    return this;
                    //console.log('scratch_32[6]', scratch_32[6]);
                    //console.log('scratch_32[6] / 2', scratch_32[6] / 2);
                    // 787812
                    //console.log('c_visited', c_visited);
                }
                return fast_stacked_mapped_flood_fill();

            } else if (bipp === 32) {

                const [w, h] = this.size;
                let fast_stacked_mapped_flood_fill = () => {
                    //const map_pixels_visited = {};
                    //const arr_pixels_to_visit = [[x, y]];
                    //let c_visited = 0;
                    const buffer = this.buffer;
                    //let pixel_buffer_pos = this.bytes_per_pixel * (x + y * this.size[0]);
                    // Could make a large typed array buffer of pixels to visit
                    // An already visited typed array.
                    const scratch_32 = new Uint32Array(16);
                    // w, h
                    scratch_32[0] = this.size[0]; // w
                    scratch_32[1] = this.size[1]; // h
                    scratch_32[2] = scratch_32[0] * scratch_32[1];
                    scratch_32[3] = this.bytes_per_pixel;
                    // 4 x, 5 y

                    scratch_32[6] = 0 // position within visiting pixels
                    scratch_32[7] = 0 // Maximum pixel pos starting index
                    scratch_32[8] = 0 // pixel_buffer_pos
                    scratch_32[9] = 0 // c_visited

                    const ta8_pixels = new Uint8Array(12);

                    // 0, 1, 2, 3    start color
                    // 4, 5, 6, 7    px color
                    // 8, 9, 10, 11  fill color

                    ta8_pixels[8] = r;
                    ta8_pixels[9] = g;
                    ta8_pixels[10] = b;
                    ta8_pixels[11] = a;

                    //const ta16_pixels = new Uint8Array(4);
                    //console.log('scratch_32[2]', scratch_32[2]);
                    const ta_pixels_visited = new Uint8Array(scratch_32[2]);
                    // Initialise a sequence position buffer that's as long as the whole image
                    const ta_visiting_pixels = new Uint16Array(scratch_32[2] * 2);
                    // x y coords

                    scratch_32[8] = scratch_32[3] * (x + (y * scratch_32[0]));

                    //const c_start = new Uint8Array([buffer.readUInt8(pixel_buffer_pos++), buffer.readUInt8(pixel_buffer_pos++), buffer.readUInt8(pixel_buffer_pos++), buffer.readUInt8(pixel_buffer_pos++)]);
                    ta8_pixels[0] = buffer[scratch_32[8]++];
                    ta8_pixels[1] = buffer[scratch_32[8]++];
                    ta8_pixels[2] = buffer[scratch_32[8]++];
                    ta8_pixels[3] = buffer[scratch_32[8]++];

                    //console.log('c_start', c_start);


                    // add the first pixel
                    ta_visiting_pixels[0] = x;
                    ta_visiting_pixels[1] = y;
                    scratch_32[7] = 2;

                    //console.log('scratch_32[6]', scratch_32[6]);
                    //console.log('scratch_32[7]', scratch_32[7]);

                    //c_visited < 

                    // Looks like the wrong stop condition here.
                    while (scratch_32[9] <= scratch_32[2]) {
                        // 
                        //console.log('scratch_32[6]', scratch_32[6]);
                        //[x, y] = arr_pixels_to_visit[c_visited];
                        scratch_32[4] = ta_visiting_pixels[scratch_32[6]++]; // x
                        scratch_32[5] = ta_visiting_pixels[scratch_32[6]++]; // y

                        // x + (w * y)
                        //ta_pixels_visited[scratch_32[4] + (scratch_32[0] * scratch_32[5])] = 255;

                        //console.log('c_visited', c_visited);
                        //map_pixels_visited[[x, y]] = true;
                        //console.log('[x, y]', [x, y]);

                        // Check this pixel...
                        //let pixel_buffer_pos = this.bytes_per_pixel * (x + y * this.size[0]);
                        scratch_32[8] = scratch_32[3] * (scratch_32[4] + (scratch_32[5] * scratch_32[0]));


                        //const [pr, pg, pb, pa] = 
                        //const c_px = new Uint8Array([buffer.readUInt8(pixel_buffer_pos++), buffer.readUInt8(pixel_buffer_pos++), buffer.readUInt8(pixel_buffer_pos++), buffer.readUInt8(pixel_buffer_pos++)]);
                        //ta8_pixels[4] = buffer.readUInt8(scratch_32[8]++);
                        //ta8_pixels[5] = buffer.readUInt8(scratch_32[8]++);
                        //ta8_pixels[6] = buffer.readUInt8(scratch_32[8]++);
                        //ta8_pixels[7] = buffer.readUInt8(scratch_32[8]++);

                        //ta8_pixels[4] = buffer[scratch_32[8]++];
                        //ta8_pixels[5] = buffer[scratch_32[8]++];
                        //ta8_pixels[6] = buffer[scratch_32[8]++];
                        //ta8_pixels[7] = buffer[scratch_32[8]++];

                        //console.log('c_px', c_px);
                        // then the difference from the start colors

                        //const c_diff = new Uint8Array([c_start[0] - c_px[0], c_start[1] - c_px[1], c_start[2] - c_px[2], c_start[3] - c_px[3]]);
                        //ta16_pixels[0] = buffer[scratch_32[8]++] - ta8_pixels[0];
                        //ta16_pixels[1] = buffer[scratch_32[8]++] - ta8_pixels[1];
                        //ta16_pixels[2] = buffer[scratch_32[8]++] - ta8_pixels[2];
                        //ta16_pixels[3] = buffer[scratch_32[8]++] - ta8_pixels[3];



                        //console.log('c_diff', c_diff);
                        //if (ta16_pixels[0] === 0 && ta16_pixels[1] === 0 && ta16_pixels[2] === 0 && ta16_pixels[3] === 0) {
                        if (buffer[scratch_32[8]++] - ta8_pixels[0] === 0 && buffer[scratch_32[8]++] - ta8_pixels[1] === 0 && buffer[scratch_32[8]++] - ta8_pixels[2] === 0 && buffer[scratch_32[8]++] - ta8_pixels[3] === 0) {
                            // No color change
                            //  So change the color
                            scratch_32[8] -= 4;
                            //buffer.writeUInt8(ta8_pixels[8], scratch_32[8]++);
                            //buffer.writeUInt8(ta8_pixels[9], scratch_32[8]++);
                            //buffer.writeUInt8(ta8_pixels[10], scratch_32[8]++);
                            //buffer.writeUInt8(ta8_pixels[11], scratch_32[8]++);
                            buffer[scratch_32[8]++] = ta8_pixels[8];
                            buffer[scratch_32[8]++] = ta8_pixels[9];
                            buffer[scratch_32[8]++] = ta8_pixels[10];
                            buffer[scratch_32[8]++] = ta8_pixels[11];

                            // Add adjacent pixels to the queue
                            //  if they've not been visited before.

                            // ta_pixels_visited[scratch_32[4] + (scratch_32[0] * scratch_32[5])]

                            if (scratch_32[4] - 1 >= 0 && ta_pixels_visited[scratch_32[4] - 1 + (scratch_32[0] * scratch_32[5])] === 0) {
                                ta_visiting_pixels[scratch_32[7]++] = scratch_32[4] - 1;
                                ta_visiting_pixels[scratch_32[7]++] = scratch_32[5];

                                ta_pixels_visited[scratch_32[4] - 1 + (scratch_32[0] * scratch_32[5])] = 255;

                                //arr_pixels_to_visit.push([scratch_32[4] - 1, scratch_32[5]]);
                            }
                            if (scratch_32[5] - 1 >= 0 && ta_pixels_visited[scratch_32[4] + (scratch_32[0] * (scratch_32[5] - 1))] === 0) {
                                ta_visiting_pixels[scratch_32[7]++] = scratch_32[4];
                                ta_visiting_pixels[scratch_32[7]++] = scratch_32[5] - 1;
                                //arr_pixels_to_visit.push([scratch_32[4], scratch_32[5] - 1]);
                                ta_pixels_visited[scratch_32[4] + (scratch_32[0] * (scratch_32[5] - 1))] = 255;
                            }
                            if (scratch_32[4] + 1 < scratch_32[0] && ta_pixels_visited[scratch_32[4] + 1 + (scratch_32[0] * scratch_32[5])] === 0) {
                                ta_visiting_pixels[scratch_32[7]++] = scratch_32[4] + 1;
                                ta_visiting_pixels[scratch_32[7]++] = scratch_32[5];
                                //arr_pixels_to_visit.push([scratch_32[4] + 1, scratch_32[5]]);
                                ta_pixels_visited[scratch_32[4] + 1 + (scratch_32[0] * scratch_32[5])] = 255;
                            }
                            if (scratch_32[5] + 1 < scratch_32[1] && ta_pixels_visited[scratch_32[4] + (scratch_32[0] * (scratch_32[5] + 1))] === 0) {
                                ta_visiting_pixels[scratch_32[7]++] = scratch_32[4];
                                ta_visiting_pixels[scratch_32[7]++] = scratch_32[5] + 1;
                                //arr_pixels_to_visit.push([scratch_32[4], scratch_32[5] + 1]);
                                ta_pixels_visited[scratch_32[4] + (scratch_32[0] * (scratch_32[5] + 1))] = 255;
                            }
                        }
                        scratch_32[9]++;
                        // compare these arrays

                        // Add adjacent pixels to the stack?
                        //c_visited++;
                        //scratch_32[7] += 2;
                    }
                    return this;
                    //console.log('scratch_32[6]', scratch_32[6]);
                    //console.log('scratch_32[6] / 2', scratch_32[6] / 2);
                    // 787812
                    //console.log('c_visited', c_visited);
                }
                return fast_stacked_mapped_flood_fill();

            } else if (bipp === 8) {
                // r
                const [w, h] = this.size;
                let fast_stacked_mapped_flood_fill = () => {
                    const v = r;
                    //const map_pixels_visited = {};
                    //const arr_pixels_to_visit = [[x, y]];
                    //let c_visited = 0;
                    const buffer = this.buffer;
                    //let pixel_buffer_pos = this.bytes_per_pixel * (x + y * this.size[0]);
                    // Could make a large typed array buffer of pixels to visit
                    // An already visited typed array.
                    const scratch_32 = new Uint32Array(16);
                    // w, h
                    scratch_32[0] = this.size[0]; // w
                    scratch_32[1] = this.size[1]; // h
                    scratch_32[2] = scratch_32[0] * scratch_32[1];
                    scratch_32[3] = this.bytes_per_pixel;
                    // 4 x, 5 y

                    scratch_32[6] = 0 // position within visiting pixels
                    scratch_32[7] = 0 // Maximum pixel pos starting index
                    scratch_32[8] = 0 // pixel_buffer_pos
                    scratch_32[9] = 0 // c_visited

                    const ta8_pixels = new Uint8Array(12);

                    // 0, 1, 2, 3    start color
                    // 4, 5, 6, 7    px color
                    // 8, 9, 10, 11  fill color

                    ta8_pixels[8] = v;
                    //ta8_pixels[9] = g;
                    //ta8_pixels[10] = b;
                    //ta8_pixels[11] = a;

                    //const ta16_pixels = new Uint8Array(4);
                    //console.log('scratch_32[2]', scratch_32[2]);
                    const ta_pixels_visited = new Uint8Array(scratch_32[2]);
                    // Initialise a sequence position buffer that's as long as the whole image
                    const ta_visiting_pixels = new Uint16Array(scratch_32[2] * 2);
                    // x y coords

                    scratch_32[8] = scratch_32[3] * (x + (y * scratch_32[0]));

                    //const c_start = new Uint8Array([buffer.readUInt8(pixel_buffer_pos++), buffer.readUInt8(pixel_buffer_pos++), buffer.readUInt8(pixel_buffer_pos++), buffer.readUInt8(pixel_buffer_pos++)]);
                    ta8_pixels[0] = buffer[scratch_32[8]++];
                    //ta8_pixels[1] = buffer[scratch_32[8]++];
                    //ta8_pixels[2] = buffer[scratch_32[8]++];
                    //ta8_pixels[3] = buffer[scratch_32[8]++];

                    //console.log('c_start', c_start);


                    // add the first pixel
                    ta_visiting_pixels[0] = x;
                    ta_visiting_pixels[1] = y;
                    scratch_32[7] = 2;

                    while (scratch_32[9] <= scratch_32[2]) {
                        // 
                        //console.log('scratch_32[6]', scratch_32[6]);
                        //[x, y] = arr_pixels_to_visit[c_visited];
                        scratch_32[4] = ta_visiting_pixels[scratch_32[6]++]; // x
                        scratch_32[5] = ta_visiting_pixels[scratch_32[6]++]; // y
                        scratch_32[8] = scratch_32[3] * (scratch_32[4] + (scratch_32[5] * scratch_32[0]));

                        if (buffer[scratch_32[8]++] - ta8_pixels[0] === 0) {
                            // No color change
                            //  So change the color
                            scratch_32[8] -= 1;
                            buffer[scratch_32[8]++] = ta8_pixels[8];
                            //buffer[scratch_32[8]++] = ta8_pixels[9];
                            //buffer[scratch_32[8]++] = ta8_pixels[10];
                            //buffer[scratch_32[8]++] = ta8_pixels[11];
                            if (scratch_32[4] - 1 >= 0 && ta_pixels_visited[scratch_32[4] - 1 + (scratch_32[0] * scratch_32[5])] === 0) {
                                ta_visiting_pixels[scratch_32[7]++] = scratch_32[4] - 1;
                                ta_visiting_pixels[scratch_32[7]++] = scratch_32[5];

                                ta_pixels_visited[scratch_32[4] - 1 + (scratch_32[0] * scratch_32[5])] = 255;

                                //arr_pixels_to_visit.push([scratch_32[4] - 1, scratch_32[5]]);
                            }
                            if (scratch_32[5] - 1 >= 0 && ta_pixels_visited[scratch_32[4] + (scratch_32[0] * (scratch_32[5] - 1))] === 0) {
                                ta_visiting_pixels[scratch_32[7]++] = scratch_32[4];
                                ta_visiting_pixels[scratch_32[7]++] = scratch_32[5] - 1;
                                //arr_pixels_to_visit.push([scratch_32[4], scratch_32[5] - 1]);
                                ta_pixels_visited[scratch_32[4] + (scratch_32[0] * (scratch_32[5] - 1))] = 255;
                            }
                            if (scratch_32[4] + 1 < scratch_32[0] && ta_pixels_visited[scratch_32[4] + 1 + (scratch_32[0] * scratch_32[5])] === 0) {
                                ta_visiting_pixels[scratch_32[7]++] = scratch_32[4] + 1;
                                ta_visiting_pixels[scratch_32[7]++] = scratch_32[5];
                                //arr_pixels_to_visit.push([scratch_32[4] + 1, scratch_32[5]]);
                                ta_pixels_visited[scratch_32[4] + 1 + (scratch_32[0] * scratch_32[5])] = 255;
                            }
                            if (scratch_32[5] + 1 < scratch_32[1] && ta_pixels_visited[scratch_32[4] + (scratch_32[0] * (scratch_32[5] + 1))] === 0) {
                                ta_visiting_pixels[scratch_32[7]++] = scratch_32[4];
                                ta_visiting_pixels[scratch_32[7]++] = scratch_32[5] + 1;
                                //arr_pixels_to_visit.push([scratch_32[4], scratch_32[5] + 1]);
                                ta_pixels_visited[scratch_32[4] + (scratch_32[0] * (scratch_32[5] + 1))] = 255;
                            }
                        }
                        scratch_32[9]++;
                    }
                    return this;
                }
                return fast_stacked_mapped_flood_fill();


            } else if (bipp === 1) {
                // Could see about an optimised 1bipp flood fill.
                //  Using a pos array would make it more consistent with other functions.

                return this.flood_fill_1bipp(x, y, r);
                // could try a much simpler algorithm.

                // could try a 1bipp pixel buffer to keep track of which pixels have already been visited.






                

            } else {

                console.trace();
                throw 'Unsupported bipp: ' + bipp;


            }
        }

        'invert'() {
            const {
                bipp
            } = this;

            if (bipp === 1) {
                // No, not cloned.
                // invert self here.
                const {
                    ta
                } = this;
                const l = ta.length;

                for (let i = 0; i < l; i++) {
                    //console.log('ta[i]', ta[i]);
                    ta[i] = ~ta[i] & 255;
                }
                // 
                // Make a clone, then do not on every byte.
                //  Could go faster and do it on 4 bytes at once.

            } else {
                console.trace();
                throw 'NYI (unsupported bipp) ' + bipp;
            }
        }

        // boolean logic
        'or'(other_pb) {
            const {
                bipp
            } = this;
            if (bipp === 1) {
                // No, not cloned.
                const other_bipp = other_pb.bipp;
                if (other_bipp === 1) {

                    const {
                        ta
                    } = this;
                    const l_my_ta = ta.length;

                    const other_ta = other_pb.ta;
                    const l_other_ta = other_ta.length;

                    if (l_other_ta === l_my_ta) {

                        for (let i = 0; i < l_my_ta; i++) {
                            //console.log('ta[i]', ta[i]);
                            ta[i] = ta[i] | other_ta[i];
                        }


                    } else {
                        console.trace();
                        throw 'lengths of pixel buffer typed arrays must match';
                    }




                } else {
                    console.trace();
                    throw 'bipp values must match (other_pb expected to have bipp: 1)'
                }



                // invert self here.


                // 
                // Make a clone, then do not on every byte.
                //  Could go faster and do it on 4 bytes at once.

            } else {
                console.trace();
                throw 'NYI (unsupported bipp) ' + bipp;
            }

        }

        // regional flood fill


        // flood_fill_given_color_pixels_from_outer_boundary



        each_outer_boundary_pixel(callback) {
            let ta_pos = new Uint16Array(2);
            const {size} = this;
            //console.log('size', size);
    
            //throw 'stop';
            const [w, h] = size;
    
            //console.log('[w, h]', [w, h]);
    
            //throw 'stop';
    
            // top row...
    
            ta_pos[0] = 0;
            ta_pos[1] = 0;
    
            for (ta_pos[0] = 0; ta_pos[0] < w; ta_pos[0]++) {
    
                const px = this.get_pixel(ta_pos);
                callback(px, ta_pos);
    
            }
            ta_pos[0]--;
    
            
    
            for (ta_pos[1] = 0; ta_pos[1] < h; ta_pos[1]++) {
    
                const px = this.get_pixel(ta_pos);
                callback(px, ta_pos);
    
            }
            ta_pos[1]--;
            //throw 'stop';
    
            // Seems to wrap around....
    
            for (ta_pos[0] = w - 1; ta_pos[0] > 0; ta_pos[0]--) {
    
                //console.log('ta_pos[0]', ta_pos[0]);
    
                
    
                const px = this.get_pixel(ta_pos);
                callback(px, ta_pos);
                //throw 'stop1';
    
            }
            //throw 'stop';
    
            let px = this.get_pixel(ta_pos);
            callback(px, ta_pos);
    
            for (ta_pos[1] = h - 1; ta_pos[1] > 0; ta_pos[1]--) {
    
                const px = this.get_pixel(ta_pos);
                callback(px, ta_pos);
    
            }
    
            px = this.get_pixel(ta_pos);
            callback(px, ta_pos);
    
    
    
            //throw 'stop';
    
    
    
    
        }


        // I think this is slow.


        flood_fill_given_color_pixels_from_outer_boundary(given_color, fill_color) {

            const {
                bits_per_pixel
            } = this;

            if (bits_per_pixel === 24) {
                this.each_outer_boundary_pixel((b_color, pos) => {
                    //console.log('[color, pos]', [color, pos]);

                    // if color is 0, 0, 0

                    const [r, g, b] = b_color;

                    if (r === given_color[0] && g === given_color[1] && b === given_color[2]) {
                        // flood fill this pos with the given color.


                        // And will need a new flood fill function.

                        this.flood_fill(pos[0], pos[1], fill_color[0], fill_color[1], fill_color[2]);

                    }


                });
            } else if (bits_per_pixel === 1) {

                

                this.each_outer_boundary_pixel((b_color, pos) => {
                    //console.log('[color, pos]', [color, pos]);

                    // if color is 0, 0, 0

                    //const [r, g, b] = b_color;

                    //console.log('b_color', b_color);
                    //console.log('pos', pos);

                    if (b_color === given_color) {
                        // flood fill this pos with the given color.


                        // And will need a new flood fill function.
                        //console.log('fill_color', fill_color);

                        this.flood_fill(pos[0], pos[1], fill_color);

                    }


                });
            } else {

                console.log('not flood filling');
                console.log('bits_per_pixel', bits_per_pixel);

                throw 'NYI';
                console.trace();
            }




        }

    }

    Pixel_Buffer_Enh.get_instance = get_instance;
    return Pixel_Buffer_Enh;
}

module.exports = get_instance();