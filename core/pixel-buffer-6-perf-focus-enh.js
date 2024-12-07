const Pixel_Buffer_Idiomatic_Enh = require('./pixel-buffer-5-idiomatic-enh');

const Typed_Array_Binary_Read_Write = require('./Typed_Array_Binary_Read_Write');




const ensure_is_polygon = p => {
    if (p instanceof Polygon) {
        return p;
    } else {
        return new Polygon(p);
    }
}

class MinHeap {
    constructor(size) {
        this.heap = new Float32Array(size * 5);
        this.count = 0; // Number of edges in the heap
    }

    insert(edge) {
        const index = this.count * 5;
        this.heap.set(edge, index);
        this.bubbleUp(this.count);
        this.count++;
    }

    extractMin() {
        if (this.count === 0) return null;
        
        // Get minimum edge at the root
        const minEdge = this.heap.slice(0, 5);

        // Move the last element to the root
        this.count--;
        this.heap.set(this.heap.slice(this.count * 5, (this.count + 1) * 5), 0);
        
        this.bubbleDown(0);
        
        return minEdge;
    }

    bubbleUp(index) {
        let current = index;
        while (current > 0) {
            const parent = Math.floor((current - 1) / 2);
            const parentIdx = parent * 5;
            const currentIdx = current * 5;

            if (this.heap[currentIdx] >= this.heap[parentIdx]) break;

            this.swapEdges(current, parent);
            current = parent;
        }
    }

    bubbleDown(index) {
        let current = index;
        while (true) {
            const left = 2 * current + 1;
            const right = 2 * current + 2;
            let smallest = current;

            const leftIdx = left * 5;
            const rightIdx = right * 5;
            const currentIdx = current * 5;

            if (left < this.count && this.heap[leftIdx] < this.heap[currentIdx]) smallest = left;
            if (right < this.count && this.heap[rightIdx] < this.heap[smallest * 5]) smallest = right;

            if (smallest === current) break;

            this.swapEdges(current, smallest);
            current = smallest;
        }
    }

    swapEdges(i, j) {
        for (let k = 0; k < 5; k++) {
            const temp = this.heap[i * 5 + k];
            this.heap[i * 5 + k] = this.heap[j * 5 + k];
            this.heap[j * 5 + k] = temp;
        }
    }

    isEmpty() {
        return this.count === 0;
    }
}

/*



class Pixel_Buffer_Perf_Focus_Enh extends Pixel_Buffer_Idiomatic_Enh {
    constructor(...a) {
        super(...a);
    }
}

module.exports = Pixel_Buffer_Perf_Focus_Enh;

*/

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


    2023 - JS performance characteristics and capabilities have improved.
        Want to compare some more idiomatic or concise types of algorithms with the algorithms where readability is not such a concern.
        The idiomatic algorithms could be written faster, and compared against some more optimised versions.
        As JS improves, the idiomatic ones could become the fastest. Hard to predict but worth testing.
        Some in-built kinds of iterations and loops could get sped up a lot with a better JS compiler, and making use
        of strategies optimised for a more modern JS compilar as it's almost 4 years on.

    





                    if (num_bits_remaining === 1) {
                        byte_mask = 128;
                    } else if (num_bits_remaining === 2) {
                        byte_mask = 192;
                    } else if (num_bits_remaining === 3) {
                        byte_mask = 224;
                    } else if (num_bits_remaining === 4) {
                        byte_mask = 240;
                    } else if (num_bits_remaining === 5) {
                        byte_mask = 248;
                    } else if (num_bits_remaining === 6) {
                        byte_mask = 252;
                    } else if (num_bits_remaining === 7) {
                        byte_mask = 254;
                    } else if (num_bits_remaining === 8) {
                        byte_mask = 255;
                    } else {
                        console.trace();
                        throw 'stop';
                    }

                    


                if (b1 === 0) {
                    // do the full pixel, 255
                    byte_mask = 255;
                } else if (b1 === 1) {
                    // 01111111
                    byte_mask = 127;
                } else if (b1 === 2) {
                    // 00111111
                    byte_mask = 63;
                } else if (b1 === 3) {
                    // 00111111
                    byte_mask = 31;
                } else if (b1 === 4) {
                    // 00111111
                    byte_mask = 15;
                } else if (b1 === 5) {
                    // 00111111
                    byte_mask = 7;
                } else if (b1 === 6) {
                    // 00111111
                    byte_mask = 3;
                } else if (b1 === 7) {
                    // 00111111
                    byte_mask = 1;
                } else {
                    throw 'stop - unexpected bit value (expected 0 to 7)';
                }

*/



// Then being able to pass the ta_math function override, or part of it backwards into the core?



const byte_masks_to_end_byte = new Uint8Array([0, 128, 192, 224, 240, 248, 252, 254, 255]);
const byte_masks_from_beginning_byte = new Uint8Array([255, 127, 63, 31, 15, 7, 3, 1]);


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


// Most of these seem perf focused.
// Likely only have the perf focused versions of functions.
// Want the idiomatic versions of them too, on the right subclass level.



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

//const get_instance = () => {

    //const Core = require('./pixel-buffer-core');

//const Pixel_Buffer_Advanced_TypedArray_Properties = require('./pixel-buffer-advanced-typedarray-properties');


// 1bipp - iterating through all 64 bit values in the typed array.
//   want on-the-fly calculation of what the values signify.







class Pixel_Buffer_Perf_Focus_Enh extends Pixel_Buffer_Idiomatic_Enh {

    // Setting bits per pixel to 8
    //  greyscale 256
    constructor(spec) {
        //spec.__type_name = spec.__type_name || 'pixel_buffer';
        super(spec);

        //this.tabrw = new Typed_Array_Binary_Read_Write(this.ta);
    }

    // Iterating through all 64bit values in the ta, as ubigint64 numbers.
    //   Could see instead about iterating through all the numbers loaded from the DataView.


    // is_64bit_divisible
    // ta_is_64bit_divisible

    get ta_is_64bit_divisible() {
        //return this.ta.length % 64 ===
        return (this.ta.length & 63) === 0;
    }
    get ta_is_32bit_divisible() {
        //return this.ta.length % 64 ===
        return (this.ta.length & 31) === 0;
    }

    get ta64() {

        if (this._ta64) {
            return this._ta64;
        } else {

        }

        if (this.ta_is_64bit_divisible) {
            if (this.ta.byteOffset % 8 === 0) {
                // Create BigUint64Array using the same ArrayBuffer
                this._ta64 = new BigUint64Array(this.ta.buffer, this.ta.byteOffset, this.ta.byteLength / 8);
                return this._ta64;
            } else {
                console.error("The byte offset is not aligned to 8 bytes.");
            }
        } else  {
            return false;
        }
    }
    get is_32bit_divisible_image() {
        // .num_pixels
        //   and that corresponding to the ta?

        
        return (this.ta.length & 31) === 0;


    }

    get is_32_divisible_bits_per_row() {
        // number of bits per row....

        return (this.bits_per_row & 31) === 0;
    }
    get number_of_32bit_segments_per_32bit_divisible_row() {

        // bits per row divided by 64
        return this.bits_per_row >> 5;

    }

    get is_64bit_divisible_image() {
        // .num_pixels
        //   and that corresponding to the ta?

        
        return (this.ta.length & 63) === 0;


    }

    get is_64_divisible_bits_per_row() {
        // number of bits per row....

        return (this.bits_per_row & 63) === 0;
    }
    get number_of_64bit_segments_per_64bit_divisible_row() {

        // bits per row divided by 64
        return this.bits_per_row >> 6;

    }

    // num_pixels

    // bits_per_image

    get bits_per_image_1bipp() {

        return this.size[0] * this.size[1];
    }

    get number_of_64bit_segments_per_64bit_divisible_image() {

        // bits per row divided by 64
        return this.bits_per_image_1bipp >> 6;

    }

    // and could just iterate through the segment numbers....
    //   then depending on other things, calculate what they segments represent.
    //     as in which rows get represented etc.

    



    iterate_all_ui32_locations_1bipp(cb) {
        // y, first x, last x ???
        //   not so sure about having y first here out of convention. stick with x first unless somehow less optimised.
        
        // y could be a range even.
        //   first y, last y
        //     maybe make that standard too, but keep it unchanged here.
        //      maybe 4 values would be best after all.

        // Could return / use a 4 value uint32array

        // Some kind of range data type.

        const ui32a_px_range = new Uint32Array(4);





        // and don't log during preruns somehow???


        // is_64bit_divisible_image

        if (this.ta_is_32bit_divisible) {

            // and should be the correct number of bits per row too?
            //   row padding....
            //     if so, should change some lower level operations.


            if (this.is_32_divisible_bits_per_row) {

                // and the number of bits per row....

                // this.number_of_64bit_segments_per_64bit_divisible_row 

                // number_of_64bit_segments

                // or just the coords of the two points in the range.




                const number_of_32bit_segments_per_32bit_divisible_row = this.number_of_32bit_segments_per_32bit_divisible_row;

                // 1, 2, 4 etc????

                if (number_of_32bit_segments_per_32bit_divisible_row === 1) {
                    // just iterate the row y values....
                    //

                    //console.log('must be 64 bits per row');

                    // so each increase of the 64 bit index is an increase in y.
                    const height = this.size[1];
                    const first_x = 0, last_x = 31;

                    ui32a_px_range[0] = first_x;
                    ui32a_px_range[2] = last_x;
                    let y = 0;
                    for (let i = 0; i < height; i++) {

                        ui32a_px_range[1] = y;
                        ui32a_px_range[3] = y;

                        cb(ui32a_px_range);

                        // at this stage we have the whole row, start x and end x (or last x) I think - as last is 63, it's not the next pixel over as used in a lot of image functions.

                        /*
                        (() => {
                            console.log({
                                index: i,
                                //range: [[first_x, last_x], [y, y]]
                                range: [[first_x, y], [last_x, y]],
                                ui32a_px_range
                            })
                        })()
                            */
                        


                        y++;
                    }


                } else if (number_of_32bit_segments_per_32bit_divisible_row === 2) {

                    const height = this.size[1];

                    const number_of_32bit_segments = height * number_of_32bit_segments_per_32bit_divisible_row;


                    // even or odd....

                    let even = true;

                    let y = 0;

                    let first_x = 0, last_x = 63;
                    
                    for (let i = 0; i < number_of_32bit_segments; i++) {






                        ui32a_px_range[0] = first_x;
                        ui32a_px_range[1] = y;
                        ui32a_px_range[2] = last_x;
                        ui32a_px_range[3] = y;

                        cb(ui32a_px_range);

                        // at this stage we have the whole row, start x and end x (or last x) I think - as last is 63, it's not the next pixel over as used in a lot of image functions.

                        /*
                        (() => {
                            console.log({
                                index: i,
                                //range: [[first_x, last_x], [y, y]]
                                range: [[first_x, y], [last_x, y]],
                                ui32a_px_range
                            })
                        })()
                            */
                        


                        //y++;

                        if (!even) {
                            y++;
                            first_x = 0; last_x = 31;
                        } else {
                            first_x = 32; last_x = 63;
                        }
                        even = !even;

                        
                    }
                    


                } else {

                    // need different / better logic for 3 or more of them.
                    const height = this.size[1];

                    const number_of_32bit_segments = height * number_of_32bit_segments_per_32bit_divisible_row;


                    // even or odd....


                    let y = 0;

                    let first_x = 0, last_x = 31;

                    let i_row_segment = 0;
                    
                    for (let i = 0; i < number_of_32bit_segments; i++) {

                        ui32a_px_range[0] = first_x;
                        ui32a_px_range[1] = y;
                        ui32a_px_range[2] = last_x;
                        ui32a_px_range[3] = y;

                        cb(ui32a_px_range);

                        // at this stage we have the whole row, start x and end x (or last x) I think - as last is 63, it's not the next pixel over as used in a lot of image functions.

                        i_row_segment++;

                        if (i_row_segment < number_of_32bit_segments_per_32bit_divisible_row) {
                            first_x += 32;
                            last_x += 32;

                        } else {
                            i_row_segment = 0;
                            y++;
                            first_x = 0; last_x = 31;

                        }
                    }
                }



            } else {

            }






            // Special case(s)
            //   Number of bits per row....


            // A special case of exactly 64 bits per row could be of use....
            //   Could do some check(s), maybe popcount....

            // Though iterating though, 2 bytes at a time, 







            // Simpler version when the rows are divisible by 64.


            // and then the number of bits per row....





            // Then if there are special cases of exact number of 64 bit widths....
            //   Could have some very optimised special case algorithms.






        } else {

            // can't iterate????
            //   or could make a pretend last one, and provide a mask of what part is relevant, or number of relevant bits.





        }

        // Only tracking the locations of them.

        // Start px idx, end px idx.

        // Would need to be divisible by 64....
        //   Does not need to be 64 bits per row - though could maybe have a more optimised way to do it when that's the case.


        // Could skip the last part....?


    }


    // iterate the x span toggle colors (rows start with 0 by default)





    // Likely can speed this very much using bitshifting code to recognise these.

    iterate_all_ui32_locations_values_prev_values_prev_shifted_values_toggle_locations_1bipp(cb) {
        // y, first x, last x ???
        //   not so sure about having y first here out of convention. stick with x first unless somehow less optimised.
        
        // y could be a range even.
        //   first y, last y
        //     maybe make that standard too, but keep it unchanged here.
        //      maybe 4 values would be best after all.

        // Could return / use a 4 value uint32array

        // Some kind of range data type.

        // And iterating the values and toggle locations too????
        //   Have it take the previous single value from the last one?
        //     Could maybe do it without needing another lookup from the ta?
        //       Or keep the previous one in the typed array? The previous full value?

        // prev_value_in_row
        //   and then that prev value shifted << 31 ?








        const ui32a_res = new Uint32Array(12);

        // So this iteration function will return more than exactly needed.


        // So 7 of these values in total.
        //  

        // So will do value lookups with these.
        //   Accessing the ta.


        // ui32a_res[4] = ui32_prev_value
        // ui32a_res[5] = ui32_value
        // ui32a_res[6] = ui32_prev_l31_shifted_value
        // ui32a_res[7] = ui32_r1_shifted_value
        // ui32a_res[8] = ui32_combined_r1_shifted_value (if x0 > 0, otherwise it's just the r1 shifted value)
        // ui32a_res[9] = xor color toggle locations


        // prev value
        // prev masked value ???
        // prev shifted value << 31
        // current value
        // current value >>> 1 right
        // current value >>> 1 right | prev shifted value << 31
        // (current value >>> 1 right | prev shifted value << 31) xor current value (when prev differs from current)





        // and don't log during preruns somehow???


        // is_64bit_divisible_image

        if (this.ta_is_32bit_divisible) {

            const {ta} = this;



            const dv = new DataView(ta.buffer, ta.byteOffset, ta.byteLength);

            // and should be the correct number of bits per row too?
            //   row padding....
            //     if so, should change some lower level operations.


            if (this.is_32_divisible_bits_per_row) {

                // and the number of bits per row....

                // this.number_of_64bit_segments_per_64bit_divisible_row 

                // number_of_64bit_segments

                // or just the coords of the two points in the range.




                const number_of_32bit_segments_per_32bit_divisible_row = this.number_of_32bit_segments_per_32bit_divisible_row;

                // 1, 2, 4 etc????

                if (number_of_32bit_segments_per_32bit_divisible_row === 1) {
                    // just iterate the row y values....
                    //

                    //console.log('must be 64 bits per row');

                    // so each increase of the 64 bit index is an increase in y.
                    const height = this.size[1];
                    const first_x = 0, last_x = 31;

                    ui32a_res[0] = first_x;
                    ui32a_res[2] = last_x;
                    let y = 0;
                    let b = 0;
                    for (let i = 0; i < height; i++) {

                        ui32a_res[1] = y;
                        ui32a_res[3] = y;
                        const ui32_value = dv.getUint32(b);


                        ui32a_res[5] = ui32_value;

                        cb(ui32a_res);

                        // at this stage we have the whole row, start x and end x (or last x) I think - as last is 63, it's not the next pixel over as used in a lot of image functions.

                        /*
                        (() => {
                            console.log({
                                index: i,
                                //range: [[first_x, last_x], [y, y]]
                                range: [[first_x, y], [last_x, y]],
                                ui32a_px_range
                            })
                        })()
                            */
                        


                        y++;
                        b+=4;
                    }


                } else if (number_of_32bit_segments_per_32bit_divisible_row === 2) {

                    const height = this.size[1];

                    const number_of_32bit_segments = height * number_of_32bit_segments_per_32bit_divisible_row;


                    // even or odd....

                    let even = true;

                    let y = 0;
                    let b = 0;

                    let first_x = 0, last_x = 63;

                    let ui32_prev_value = 0;
                    
                    for (let i = 0; i < number_of_32bit_segments; i++) {






                        ui32a_res[0] = first_x;
                        ui32a_res[1] = y;
                        ui32a_res[2] = last_x;
                        ui32a_res[3] = y;


                        const ui32_value = dv.getUint32(b);

                        ui32a_res[4] = ui32_prev_value;
                        ui32a_res[5] = ui32_value;

                        cb(ui32a_res);

                        // at this stage we have the whole row, start x and end x (or last x) I think - as last is 63, it's not the next pixel over as used in a lot of image functions.

                        /*
                        (() => {
                            console.log({
                                index: i,
                                //range: [[first_x, last_x], [y, y]]
                                range: [[first_x, y], [last_x, y]],
                                ui32a_px_range
                            })
                        })()
                            */
                        


                        //y++;

                        if (!even) {
                            y++;
                            first_x = 0; last_x = 31;
                        } else {
                            first_x = 32; last_x = 63;
                        }
                        even = !even;
                        b+=4;

                        ui32_prev_value = ui32_value;
                        
                    }
                    


                } else {

                    // need different / better logic for 3 or more of them.
                    const height = this.size[1];

                    const number_of_32bit_segments = height * number_of_32bit_segments_per_32bit_divisible_row;


                    // even or odd....


                    let y = 0;

                    let first_x = 0, last_x = 31;

                    let i_row_segment = 0;
                    let b = 0;
                    let ui32_prev_value = 0;
                    
                    for (let i = 0; i < number_of_32bit_segments; i++) {

                        ui32a_res[0] = first_x;
                        ui32a_res[1] = y;
                        ui32a_res[2] = last_x;
                        ui32a_res[3] = y;

                        const ui32_value = dv.getUint32(b);
                        ui32a_res[4] = ui32_prev_value;
                        ui32a_res[5] = ui32_value;

                        if (first_x === 0) {
                            ui32a_res[6] = 0;
                        } else {
                            ui32a_res[6] = ui32_prev_value << 31;
                        }

                        


                        
                        ui32a_res[7] = ui32_value >>> 1;

                        ui32a_res[8] = ui32a_res[6] | ui32a_res[7];
                        ui32a_res[9] = ui32_value ^ ui32a_res[8];

                        // Then could see about printing that one in binary?

                        // but set it to 0 if x0 is 0.


                        //ui32a_res[5] = ui32_value;

                        // ui32a_res[4] = ui32_prev_value
                        // ui32a_res[5] = ui32_value
                        // ui32a_res[6] = ui32_prev_l31_shifted_value
                        // ui32a_res[7] = ui32_r1_shifted_value
                        // ui32a_res[8] = ui32_combined_r1_shifted_value (if x0 > 0, otherwise it's just the r1 shifted value)
                        // ui32a_res[9] = xor color toggle locations


                        // prev value
                        // prev masked value ???
                        // prev shifted value << 31
                        // current value
                        // current value >>> 1 right
                        // current value >>> 1 right | prev shifted value << 31
                        // (current value >>> 1 right | prev shifted value << 31) xor current value (when prev differs from current)

                        cb(ui32a_res);

                        // at this stage we have the whole row, start x and end x (or last x) I think - as last is 63, it's not the next pixel over as used in a lot of image functions.

                        i_row_segment++;

                        if (i_row_segment < number_of_32bit_segments_per_32bit_divisible_row) {
                            first_x += 32;
                            last_x += 32;

                        } else {
                            i_row_segment = 0;
                            y++;
                            first_x = 0; last_x = 31;

                        }
                        b+=4;
                        ui32_prev_value = ui32_value;
                    }
                }



            } else {

            }






            // Special case(s)
            //   Number of bits per row....


            // A special case of exactly 64 bits per row could be of use....
            //   Could do some check(s), maybe popcount....

            // Though iterating though, 2 bytes at a time, 







            // Simpler version when the rows are divisible by 64.


            // and then the number of bits per row....





            // Then if there are special cases of exact number of 64 bit widths....
            //   Could have some very optimised special case algorithms.






        } else {

            // can't iterate????
            //   or could make a pretend last one, and provide a mask of what part is relevant, or number of relevant bits.





        }

        // Only tracking the locations of them.

        // Start px idx, end px idx.

        // Would need to be divisible by 64....
        //   Does not need to be 64 bits per row - though could maybe have a more optimised way to do it when that's the case.


        // Could skip the last part....?


    }





    // cb all??

    iterate_all_ui64_locations_1bipp(cb) {
        // y, first x, last x ???
        //   not so sure about having y first here out of convention. stick with x first unless somehow less optimised.
        
        // y could be a range even.
        //   first y, last y
        //     maybe make that standard too, but keep it unchanged here.
        //      maybe 4 values would be best after all.

        // Could return / use a 4 value uint32array

        // Some kind of range data type.

        const ui32a_px_range = new Uint32Array(4);





        // and don't log during preruns somehow???


        // is_64bit_divisible_image

        if (this.ta_is_64bit_divisible) {

            // and should be the correct number of bits per row too?
            //   row padding....
            //     if so, should change some lower level operations.


            if (this.is_64_divisible_bits_per_row) {

                // and the number of bits per row....

                // this.number_of_64bit_segments_per_64bit_divisible_row 

                // number_of_64bit_segments

                // or just the coords of the two points in the range.




                const number_of_64bit_segments_per_64bit_divisible_row = this.number_of_64bit_segments_per_64bit_divisible_row;

                // 1, 2, 4 etc????

                if (number_of_64bit_segments_per_64bit_divisible_row === 1) {
                    // just iterate the row y values....
                    //

                    //console.log('must be 64 bits per row');

                    // so each increase of the 64 bit index is an increase in y.
                    const height = this.size[1];
                    const first_x = 0, last_x = 63;

                    ui32a_px_range[0] = first_x;
                    ui32a_px_range[2] = last_x;
                    let y = 0;
                    for (let i = 0; i < height; i++) {

                        ui32a_px_range[1] = y;
                        ui32a_px_range[3] = y;

                        cb(ui32a_px_range);

                        // at this stage we have the whole row, start x and end x (or last x) I think - as last is 63, it's not the next pixel over as used in a lot of image functions.

                        /*
                        (() => {
                            console.log({
                                index: i,
                                //range: [[first_x, last_x], [y, y]]
                                range: [[first_x, y], [last_x, y]],
                                ui32a_px_range
                            })
                        })()
                            */
                        


                        y++;
                    }


                } else if (number_of_64bit_segments_per_64bit_divisible_row === 2) {

                    const height = this.size[1];

                    const number_of_64bit_segments = height * number_of_64bit_segments_per_64bit_divisible_row;


                    // even or odd....

                    let even = true;

                    let y = 0;

                    let first_x = 0, last_x = 63;
                    
                    for (let i = 0; i < number_of_64bit_segments; i++) {






                        ui32a_px_range[0] = first_x;
                        ui32a_px_range[1] = y;
                        ui32a_px_range[2] = last_x;
                        ui32a_px_range[3] = y;

                        cb(ui32a_px_range);

                        // at this stage we have the whole row, start x and end x (or last x) I think - as last is 63, it's not the next pixel over as used in a lot of image functions.

                        /*
                        (() => {
                            console.log({
                                index: i,
                                //range: [[first_x, last_x], [y, y]]
                                range: [[first_x, y], [last_x, y]],
                                ui32a_px_range
                            })
                        })()
                            */
                        


                        //y++;

                        if (!even) {
                            y++;
                            first_x = 0; last_x = 63;
                        } else {
                            first_x = 64; last_x = 127;
                        }
                        even = !even;

                        
                    }
                    


                } else {

                    // need different / better logic for 3 or more of them.
                    const height = this.size[1];

                    const number_of_64bit_segments = height * number_of_64bit_segments_per_64bit_divisible_row;


                    // even or odd....


                    let y = 0;

                    let first_x = 0, last_x = 63;

                    let i_row_segment = 0;
                    
                    for (let i = 0; i < number_of_64bit_segments; i++) {

                        ui32a_px_range[0] = first_x;
                        ui32a_px_range[1] = y;
                        ui32a_px_range[2] = last_x;
                        ui32a_px_range[3] = y;

                        cb(ui32a_px_range);

                        // at this stage we have the whole row, start x and end x (or last x) I think - as last is 63, it's not the next pixel over as used in a lot of image functions.

                        i_row_segment++;

                        if (i_row_segment < number_of_64bit_segments_per_64bit_divisible_row) {
                            first_x += 64;
                            last_x += 64;

                        } else {

                            i_row_segment = 0;
                            y++;
                            first_x = 0; last_x = 63;

                        }

                        
                    }



                }








            } else {

            }






            // Special case(s)
            //   Number of bits per row....


            // A special case of exactly 64 bits per row could be of use....
            //   Could do some check(s), maybe popcount....

            // Though iterating though, 2 bytes at a time, 







            // Simpler version when the rows are divisible by 64.


            // and then the number of bits per row....





            // Then if there are special cases of exact number of 64 bit widths....
            //   Could have some very optimised special case algorithms.






        } else {

            // can't iterate????
            //   or could make a pretend last one, and provide a mask of what part is relevant, or number of relevant bits.





        }

        // Only tracking the locations of them.

        // Start px idx, end px idx.

        // Would need to be divisible by 64....
        //   Does not need to be 64 bits per row - though could maybe have a more optimised way to do it when that's the case.


        // Could skip the last part....?








    }


    iterate_all_ui64_values_1bipp() {

        // No callback here for the moment - just make this calculate the values.


        // Need various counters.
        //   Which rows (y) are being represented.

    }

    // iterate the x span off positions using the bitwise ta maths ops.
    
    // iterate the x (wrapping?) span toggle positions.


    // This could simply iterate the color toggle distances.
    iterate_1bipp_wrapping_x_span_color_toggles(cb) {
        const {ta} = this;
        const r1shifted_ta = right_shift_32bit_with_carry(ta);
        // then xor against the original...
        const xored_against_orig = xor_typed_arrays(ta, r1shifted_ta);

        // Then iterate that ta to find the gaps????
        //   Or really the '1' values. Or some / many of them.
        //     Provide the indexes in the callbacks? The number of pixels in each gap?
        each_1_index(xored_against_orig, cb);
    }


    // Using a pre-made 2ndary buffer could work well with this.
    count_1bipp_wrapping_x_span_color_toggles() {
        const {ta} = this;
        const r1shifted_ta = right_shift_32bit_with_carry(ta);
        // then xor against the original...
        const xored_against_orig = xor_typed_arrays(ta, r1shifted_ta);

        // Then iterate that ta to find the gaps????
        //   Or really the '1' values. Or some / many of them.
        //     Provide the indexes in the callbacks? The number of pixels in each gap?
        //each_1_index(xored_against_orig, cb);
        //return count_1s(xor_typed_arrays(ta, right_shift_32bit_with_carry(ta)));
        return count_1s(xored_against_orig);
        //return count_1s(xor_typed_arrays(ta, right_shift_32bit_with_carry(ta)));
    }


    

    // Likely will be possible to speed up a lot.

    'place_image_from_pixel_buffer'(pixel_buffer, dest_pos, options = {}) {

        const {bipp} = this;

        // Check they are the same bipp?

        // can do a fast copy.
        //  or can do pixel iteration.
        // function to get a line from a buffer?
        // will want to copy directly between them.
        // so for each line in the source, need to copy the line directly into the buffer.
        //  that's if they are the same bits_per_pixel.
        // copying rgba to rgba or rgb to rgb should be fast.
        //  direct copying is fastest.
        const dest_buffer = this.buffer;
        const source_buffer = pixel_buffer.buffer;
        //console.log('dest_pos ' + stringify(dest_pos));
        // It's also worth making RGB->RGBA and RGBA->RGB
        if (bipp === 32 && pixel_buffer.bits_per_pixel === 32) {
            // Placing a 1bipp image at a chosen color within a 24 or 32 bipp image?
            const dest_w = this.size[0];
            const dest_h = this.size[1];
            const dest_buffer_line_length = dest_w * 4;
            const source_w = pixel_buffer.size[0];
            const source_h = pixel_buffer.size[1];
            const source_buffer_line_length = source_w * 4;
            //console.log('source_w ' + source_w);
            //console.log('source_h ' + source_h);
            let source_buffer_line_start_pos, source_buffer_line_end_pos, dest_buffer_subline_start_pos, dest_buffer_start_offset;
            dest_buffer_start_offset = dest_pos[0] * 4;
            // This algorithm could be sped up with C.
            //cpp_mod.copy_rgba_pixel_buffer_to_rgba_pixel_buffer_region(source_buffer, source_buffer_line_length, dest_buffer, dest_buffer_line_length, dest_pos[0], dest_pos[1]);
            //throw 'stop';
            for (var y = 0; y < source_h; y++) {
                source_buffer_line_start_pos = y * source_buffer_line_length;
                source_buffer_line_end_pos = source_buffer_line_start_pos + source_buffer_line_length;
                dest_buffer_subline_start_pos = (y + dest_pos[1]) * dest_buffer_line_length;
                //var dest_buffer_subline_end_pos = dest_buffer_subline_start_pos + source_buffer_line_length;
                // buf.copy(targetBuffer, [targetStart], [sourceStart], [sourceEnd])
                source_buffer.copy(dest_buffer, dest_buffer_subline_start_pos + dest_buffer_start_offset, source_buffer_line_start_pos, source_buffer_line_end_pos);
            }
        } else if (bipp === 1) {
            // Let's just do this simply for the moment ... not using 'or' though that would be a lot quicker if done right.
            //  ???

            // Doing it line by line makes most sense.
            //  Can then make use of 'or' I think...
            //   However, bitmaps may be out of line at 1 bpp.

            // Do it the simple, reliable way to start with.
            // 

            if (pixel_buffer.bipp === 1) {

                // Will do it a more efficient way....
                //    Possibly using 64bit alignments.

                // But how many pixels should either the reading or the writing be offset by, and in what direction.

                // Should be able to get this done really quickly....
                //   But only on 64 bit matching aligned images?

                // Both must have 64 bit aligned row lengths.
                // and an x-span rows algorithm could be moderately fast too.
                //   rows, x-spans

                // So, iterating through reading 64 bit ranges from the source...

                // 

                //console.log('options.or', options.or);

                // 'or' is using it as a mask.

                if (options.or === true) {


                    // And likely this can be sped up a lot too....
                    return this.draw_1bipp_pixel_buffer_mask_1bipp(pixel_buffer, dest_pos);
                } else {


                    // An aligned / realigned copy?
                    //   Logic that will read 64 bits at a time?
                    //   And write them?


                    const pb_source = pixel_buffer;

                    // First check if it can do a fully aligned copy procedure...
                    //   Maybe use the 'set' statement for various lines too?


                    // But a row-unaligned 64 bit operation???
                    //   Would be more complex to do with different shifts and recombinations to do.

                    // Could see about having the numeric structures which then inform which 64 bit values to take, and what to take from them.
                    //   So there would be a range of the 64 bit values in the dest to write to.
                    //     And to read from? As in begin reading from a set amount of pixels in? And in from which direction?

                    // Check the source for the 64 bit row alignments....
                    // And check the dest for 64 bit row alignments.
                    //   Then a realigning type of set / copy operation would work well.

                    const ta_pos = new Int16Array(2);
                    const ta_px_value = new Uint8ClampedArray(3);
                    // make general int info array support +-? Better able to hold (memory) offsets that way.
                    const ta_info = new Uint32Array(4);

                    // Not so sure the individual px reading of the 1bipp is working so well....
                    // May be worth using some simplified algorithms here???

                    //console.log('pb_source.size', pb_source.size);

                    const px_dest_pos = new Uint16Array(2);
                    pb_source.each_ta_1bipp(ta_pos, ta_px_value, ta_info, (color, pos) => {
                        //console.log('');
                        //console.log('2) pos', pos);
                        //console.log('2) color', color);

                        //console.log('[color, pos]', [color, pos]);

                        //const px_dest_pos = [pos[0] + dest_pos[0], pos[1] + dest_pos[1]];
                        px_dest_pos[0] = pos[0] + dest_pos[0];
                        px_dest_pos[1] = pos[1] + dest_pos[1];


                        //console.log('2) px_dest_pos', px_dest_pos);
                        //console.log('color', color);


                        this.set_pixel(px_dest_pos, color);
                    })
                }

            } else {
                console.trace();

                throw 'must have matching bipp values (expected: 1)';
            }
        } else {
            console.trace();

            console.log('[pixel_buffer, dest_pos, options]', [pixel_buffer, dest_pos, options]);

            throw 'not currently supported';
        }
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

        
        // Not sure if array params slow it down too much.


    
    

    // Seems like some polygon drawing is not working right in some cases.
    // Probably need to test and fix and optimise from some earlier drawing principles.
    //  Such as drawing 1bipp shapes onto 24bipp pixel buffers?

    // Would be an array of pairs....
    //   Maybe as a ta or sta?

    // ta_point_list

    // And want them to be filled in many cases.

    // Drawing a shape to a 1 bipp pixel buffer that will then be used to draw to this....

    // And the option of not having a stroke color or having that to be 0?


    // **************************
    // 64 bit aligned rows could be really useful for optimised binary options in a few places.
    //   Easily being able to divide by 64 * (row width 64 multiple) to get the row number.
    //     Then combining that with more direct style reads too, x position will involve the division by 64 to get the 'velue cell' of 64 bits in
    //     that row, then the remainder of that is the index within that cell (0 to 63)
    // **************************

    
    // Could see which aligned parts it could copy successfully within the ranges.






    // And may well have faster versions of this too soon.

    draw_filled_polygon_to_1bipp_pixel_buffer_mask(arr_points) {

        // Could get the points all as 



        // Creates the new pixel buffer mask.

        if (arr_points.length >= 2) {
                // filled polygon!!!
            const bb_points = get_points_bounding_box(arr_points);
            // is that / could it be a typed array?
            const offset = bb_points[0];
            // + 1 to the polygon size, each dimension???
            const polygon_size = [
                [bb_points[1][0] - bb_points[0][0] + 1],
                [bb_points[1][1] - bb_points[0][1] + 1]
            ];

            // Then revise the polygon size....
            //console.log('polygon_size', polygon_size);

            // if it's a tiny polygon.....

            if (polygon_size[0] === 1 && polygon_size[1] === 1 ) {
                const pb_polygon = new this.constructor({
                    'bits_per_pixel': 1,
                    'size': polygon_size
                });
                pb_polygon.ta[0] = 128;
                pb_polygon.__offset = offset;
                // and the offset too???
                return pb_polygon;
            } else if (polygon_size[0] === 2 && polygon_size[1] === 1 || polygon_size[0] === 1 && polygon_size[1] === 2) {
                // only 2 pixels, both on.
                const pb_polygon = new this.constructor({
                    'bits_per_pixel': 1,
                    'size': polygon_size
                });
                pb_polygon.ta[0] = 192;
                pb_polygon.__offset = offset;
                // and the offset too???
                return pb_polygon;
                //pb_polygon.set_pixel_on_1bipp()
            } else {
                const pb_polygon = new this.constructor({
                    'bits_per_pixel': 1,
                    'size': polygon_size
                });
                // Maybe a faster way to calculate these offsets?
                const down_offsetted_points = arr_points.map(point => [point[0] - offset[0], point[1] - offset[1]]);
                //console.log('pre draw 1bipp polygon');
                //let t1 = Date.now();
                // Draw polygon with offset?
                pb_polygon.draw_polygon(down_offsetted_points, 1, false);

                // And this could be sped up a lot too using better x spans finding.
                pb_polygon.flood_fill_inner_pixels_off_to_on_1bipp();


                // return that???
                pb_polygon.__offset = offset;
                // and the offset too???
                return pb_polygon;
            }





            // So, the smallest polygons....
            //   In that case it would only be drawing 2 pixels.
            //   May want to see about some kind of byte-copying for polygons?
            //     But rows at 64bits long or multiples of 64 bits will help some lower level things.
            // And also, 8x8 would be 64 bits in total, may be efficient in some ways when drawing them.
            //   Could program special cases for drawing 8x8 polygons.








            
        } else if (arr_points.length === 1) {
            const pb_polygon = new this.constructor({
                'bits_per_pixel': 1,
                'size': polygon_size
            });
            pb_polygon.ta[0] = 128;
            pb_polygon.__offset = offset;
            // and the offset too???
            return pb_polygon;
        }

        // set pixel with polygon size of 1?????
    }


    // fill_color perhaps....

    get ta2() {
        if (!this._ta2) {
            this._ta2 = new Uint8Array(this.ta.length);
        }
        return this._ta2;

    }



    // Points and positions as typed arrays....



    //draw_polygon_1bipp(polygon, stroke_color, fill_color = false) {


    // Do we fill it? A true or false setting could work best.
    //   Undefined fill color meaning not being filled?


    __bitwise_attempt_draw_color_1_filled_polygon_1bipp(polygon) {
        // Count the number of distinct pixels in the polygon outline.


        // For the moment, will be better to make a downshifted offset polygon.

        // Downshift the polygon points (in place???)
        //   Best to copy it for downshifting.

        // Or really to get the bounding box, downshift, and then render it to a new ta.


        const img_width = this.size[0], img_height = this.size[1];
        const ta2 = this.ta2.fill(0);


        // Could downshift it here?
        draw_polygon_outline_to_ta_1bipp(ta2, img_width, polygon);



        const ta3 = get_ta_bits_that_differ_from_previous_as_1s(ta2, img_width);
        const num1s_ta2 = count_1s(ta2);
        //console.log('num1s_ta2', num1s_ta2);
        //console.log('ta3.length', ta3.length);
        const num1s_ta3 = count_1s(ta3);

        // Number of 1s that start the row?

        // That's the number of toggle positions. (though toggle at the beginning of a row is a little different.)
        const est_max_num_x_spans = img_height + num1s_ta3;

        console.log('num1s_ta3', num1s_ta3);
        console.log('est_max_num_x_spans', est_max_num_x_spans);



    }

    _polygon_class_xspans_attempt_draw_color_1_filled_polygon_1bipp(polygon) {


        polygon = ensure_is_polygon(polygon);
        console.log('polygon', polygon);

        const xsf = polygon.ta_x_spans_filled;
        console.log('xsf', xsf + '');

        // Then write those x spans filled in color 1 to this.
        //   Convert the x and y to indexes, 2 fields per x span value????

        const l = xsf.length;
        const num_x_spans = l / 3;

        //console.log('num_x_spans', num_x_spans);

        let i = 0;
        
        while (i < l) {

            const x = xsf[i++];
            const y = xsf[i++];
            const l = xsf[i++];

            // Then draw the line.....

            //console.log('x, y, l', x, y, l);

            this.draw_x_span_on_1bipp(x, y, l);
        }
    }


    // See about using some kind of lower level table format?


    __taattempt_gpt_draw_polygon_filling(polygon) {
        const num_points = polygon.length / 2;
        const edges = new Float32Array(num_points * 5); // Allocate space for each edge
        const [w, h] = this.size;
        let edge_count = 0;
    
        // Create edges for the polygon
        for (let i = 0; i < num_points; i++) {
            const x1 = polygon[i * 2];
            const y1 = polygon[i * 2 + 1];
            const x2 = polygon[((i + 1) % num_points) * 2];
            const y2 = polygon[((i + 1) % num_points) * 2 + 1];
    
            if (x1 === x2 && y1 === y2) continue; // Skip degenerate edges
            if (y1 !== y2) {
                const is_y1_lower = y1 < y2;
                const idx = edge_count * 5;
                edges[idx] = is_y1_lower ? x1 : x2;
                edges[idx + 1] = Math.min(y1, y2);
                edges[idx + 2] = is_y1_lower ? x2 : x1;
                edges[idx + 3] = Math.max(y1, y2);
                edges[idx + 4] = (x2 - x1) / (y2 - y1);
                edge_count++;
            }
        }
    
        // Sort edges by y1 and then x1 using blocks of 5 in the typed array
        edges.sort((a, b) => a[1] - b[1] || a[0] - b[0]);
    
        const active_edges = new MinHeap(edge_count); // MinHeap for active edges, as previously defined
        let edge_index = 0;
    
        for (let y = 0; y < h; y++) {
            // Add edges that start at this y to the MinHeap
            while (edge_index < edge_count && edges[edge_index * 5 + 1] === y) {
                const edge = edges.slice(edge_index * 5, edge_index * 5 + 5);
                active_edges.insert(edge);
                edge_index++;
            }
    
            // Remove edges that end before this y
            while (!active_edges.isEmpty() && active_edges.heap[1] <= y) {
                active_edges.extractMin();
            }
    
            const active_edge_count = active_edges.count;
    
            // Sort active edges by x1 using the MinHeap order
            const x_intersections = [];
            for (let i = 0; i < active_edge_count; i++) {
                x_intersections.push(active_edges.heap[i * 5]);
            }
            x_intersections.sort((a, b) => a - b);
    
            // Fill pixels between pairs of intersections
            for (let i = 0; i < x_intersections.length - 1; i += 2) {
                const x_start = Math.ceil(x_intersections[i]);
                const x_end = Math.floor(x_intersections[i + 1]);
    
                for (let x = x_start; x <= x_end; x++) {
                    const pixel_index = y * w + x;
                    this.ta[pixel_index >> 3] |= (128 >> (pixel_index & 0b111));
                }
            }
    
            // Update x1 for each active edge for the next scanline
            for (let i = 0; i < active_edge_count; i++) {
                const idx = i * 5;
                active_edges.heap[idx] += active_edges.heap[idx + 4];
            }
        }
    }

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

    

    // gaussian_blur
    //  or gaussian is the default blur.
    

    
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
        //console.log('bypp', bypp);
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


    

    // Self-threshold. Want to get a threshold 1bpp (mask)

    // get_thresholded_pixel_buffer perhaps?
    //  or even iterating thresholded pixels better...


    // Maybe 'specialised' algorithms, being yet another subclass?
    //  threshold_to_1bipp_pixel_buffer
    //  threshold_to_1bipp_xspans ???
    
    // Greyscale threshold to 1 bipp.

    // to_1_bipp even - and it takes a threshold?
    //  or even a function that does the thresholding?




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


    // An idiomatic version that iterates pixels (until found) and returns the position which it already has from the iteration.
    //  Some of these functions could be 1 liners.


    get_first_pixel_matching_color(r, g, b, a) {

        // Maybe worth removing ans making a more idiomatic version?
        //  Iterate pixels (idiomatic) but with a stop


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

    // May be better to load in algorithms?
    //  Would like a clearer list of algorithms as a useful part of the code.

    // Can make use of the scratch tas that are in-built.
    //  Maybe simpler algorithms would be better?
    //   Could have another class level which has got more simply expressed algorithms.
    //    Eg simple code for pixel iteration, maybe some polymorphism.
    //     Then could have more optimised and specifically named functions.
    //     Could have a subclass that has the algorithmic optimisations.
    //     Could test the more concise and idiomatic algorithms next to ones that are less readable.

    // Maybe an Idiomatic_Algorithms class level.
    // And Optimised_Algorithms class level too.

    count_pixels_with_color(...args) {

        const {bipp} = this;

        if (bipp === 32) {
            const [r, g, b, a] = args;
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
            return scratch_32[4];
        } else {
            return super.count_pixels_with_color(...args);
        }
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

    // Giving the pos as a ta may be more optimal in some ways.
    //  Seems like the standard syntax in many places.
    //   May also want to give it the stack / some of the stack to start with.
    //    As in it calls it with the requirement of checking all outer pixels.


    // and a version that flood fills color 1...



    // A version that uses the arr rows arr x off spans to flood fill from the boundaries would be effective too.

    // Is a little difficult using these arr rows x off spans - but should be efficient.
    // Get all the links between them ahead of time?
    //  Identifying if any of them are touching an edge?
    //  Maybe put them all in an array?
    //   So that references to the ones above or below can be encoded in that array too?

    // Making more of an actual graph of objects could work too... maybe less efficient.
    //  A really optimised typed array format would be better (still).

    // Simple format could be most useful to get started with at least.
    //  May want to keep the network of them because of the stack? not changing the order of them?

    // Could identify the joined ones, and make an array of (or mark?) the ones which will then be painted?

    // Let's try this in a relatively simple and clear way to start with...?

    // get_connected_x_off_spans(y, idx_x_off_span)
    //  above and below
    //   (and apart from particular one we have just come from?)

    // May be (much?) better to have more of a representation of the network.

    // Will want to be able to create an x_spans ta on demand.




    'flood_fill_c1_1bipp'(pos) {
        //const new_color = 1;

        const target_color = this.get_pixel_1bipp(pos);
        let [x, y] = pos;


        if (target_color === 1) {
            // No need to fill if the new color is the same as the target color
            return 0;
        } else {

            const ta_stack_fn_calls_inlined_8bipp_visited_matrix_implementation = () => {
                // This will be less memory efficient but likely (much) faster.


                
                // Capcity number of pixels....

                // Takes a few ms to allocate....


                // 

                let stack_capacity = 1024 * 1024 * 16; // 8 MB for now. 64???
                //  Seems not to get it done with a huge stack....



                let ta_stack = new Uint16Array(stack_capacity);
                let i_stack_pos = 0;
                let stack_length = 0;
                let px_color;
                
                // and the number in the stack...?

                let ta_pos = new Uint16Array(2);
                let ta_pos2 = new Uint16Array(2);

                ta_pos[0] = pos[0];
                ta_pos[1] = pos[1];
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

                // Just an x,y grid would do the job better probably.

                const [width, height] = this.size;


                const ta_already_visited = new Uint8Array(width * height);

                /*
                const pb_already_visited = new Core({
                    size: this.size,
                    bits_per_pixel: 1
                })
                */

                // Think this part is working, problem seems to be with stack?
                //  Or the use of these data types?

                // Seems broken....

                //console.log('stack_length', stack_length);
                //throw 'stop';

                // What about getting a pixel pos list of the colors to paint?



                // Possible faster 1bipp linear flood fill?
                //  Have access to the row above and below at the same time?
                //   And only put it on the stack if that pixel is of the target color?

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

                    if (i_stack_pos >= stack_capacity - 8) {
                        throw 'Not enough stack for positions yet to visit';
                    }

                    //console.log('pop_res', pop_res);
                    // loads into ta_pos
                    // More specific get pixel function speeds it up a little.
                    px_color = this.get_pixel_1bipp(ta_pos); // inline this?

                    if (px_color === target_color) {


                        this.set_pixel_on_1bipp(ta_pos);

                        // Throw an error if there are not 8 or more stack positions?
                        //  And no error later on?
                        //   Could be more efficient.



                        // 

                        if (ta_pos[0] > 0) {
                            // if that px is not on the stack already though...
                            ta_pos2[0] = ta_pos[0] - 1;
                            ta_pos2[1] = ta_pos[1];

                            // And getting the pixel does not quite work here....

                            //console.log('pb_already_visited.get_pixel_1bipp(ta_pos2)', pb_already_visited.get_pixel_1bipp(ta_pos2));

                            if (ta_already_visited[width * ta_pos2[1] + ta_pos2[0]] === 0) {

                            //if (pb_already_visited.get_pixel_1bipp(ta_pos2) === 0) {
                                //ta_pos[0] = curr_x - 1;
                                //ta_pos[1] = curr_y;
                                //ppl_to_visit.add(ta_pos);
                                //fn_stack_push_pos(ta_pos2);


                                ta_stack[i_stack_pos++] = ta_pos2[0];
                                ta_stack[i_stack_pos++] = ta_pos2[1];
                                stack_length++;


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

                            if (ta_already_visited[width * ta_pos2[1] + ta_pos2[0]] === 0) {
                            //if (pb_already_visited.get_pixel_1bipp(ta_pos2) === 0) {
                                //ta_pos[0] = curr_x - 1;
                                //ta_pos[1] = curr_y;
                                //ppl_to_visit.add(ta_pos);
                                //fn_stack_push_pos(ta_pos2);

                                ta_stack[i_stack_pos++] = ta_pos2[0];
                                ta_stack[i_stack_pos++] = ta_pos2[1];
                                stack_length++;

                            };

                        }
                        if (ta_pos[1] > 0) {
                            ta_pos2[0] = ta_pos[0];
                            ta_pos2[1] = ta_pos[1] - 1;
                            //console.log('pb_already_visited.get_pixel_1bipp(ta_pos2)', pb_already_visited.get_pixel_1bipp(ta_pos2));

                            if (ta_already_visited[width * ta_pos2[1] + ta_pos2[0]] === 0) {
                            //if (pb_already_visited.get_pixel_1bipp(ta_pos2) === 0) {
                                //stack.push([curr_x, curr_y - 1]);

                                ta_stack[i_stack_pos++] = ta_pos2[0];
                                ta_stack[i_stack_pos++] = ta_pos2[1];
                                stack_length++;

                                //ta_pos[0] = curr_x;
                                //ta_pos[1] = curr_y - 1;
                                //ppl_to_visit.add(ta_pos);
                            };
                        }
                        if (ta_pos[1] < height - 1) {
                            ta_pos2[0] = ta_pos[0];
                            ta_pos2[1] = ta_pos[1] + 1;
                            //console.log('pb_already_visited.get_pixel_1bipp(ta_pos2)', pb_already_visited.get_pixel_1bipp(ta_pos2));

                            if (ta_already_visited[width * ta_pos2[1] + ta_pos2[0]] === 0) {
                            //if (pb_already_visited.get_pixel_1bipp(ta_pos2) === 0) {
                                //stack.push([curr_x, curr_y - 1]);

                                //fn_stack_push_pos(ta_pos2);

                                ta_stack[i_stack_pos++] = ta_pos2[0];
                                ta_stack[i_stack_pos++] = ta_pos2[1];
                                stack_length++;
                                //ta_pos[0] = curr_x;
                                //ta_pos[1] = curr_y - 1;
                                //ppl_to_visit.add(ta_pos);
                            };
                        }
                        ta_already_visited[width * ta_pos[1] + ta_pos[0]] = 255
                        //pb_already_visited.set_pixel_1bipp(ta_pos, 1);
                    }
                    //console.log('stack_length', stack_length);
                }
            }
            
            // Seems very much slower with that matrix this way!
            // And then a more fully inlined implementation...?

            //  Surprised that 8bipp matrix was slower. It was an algorithmic error, it seems to be considerably faster this way.
            //   About 2.5x the speed for something like 8x the memory usage.
            // ta_stack_fn_calls_inlined_implementation
            // ta_stack_fn_calls_inlined_8bipp_visited_matrix_implementation


            // Maybe want some smaller and more tightly controlled examples to get started with this different type of image representation.
            //  Could look at making it more integral to the core of the system.
            //   Things like using that as an underlying representation...?
            //    Or see about writing it to the pixel buffer(s), making it a shape representation which is available at a lower level of the system.
            //     Rapid writing and processing of horizontal lines will be useful.

            // Could use these for quick shape drawing.
            //  Will be arranged more for writing many pixels at once, doing so quickly in horizontal lines.
            //   Will have code to track to the bit alignment of the image target.

            // draw_x_gap_rows_shape???

            // inverting the row x off spans to row x on spans (more ready for drawing)

            // The row color span system seems more versitile but also less optimised for some purposes.
















            const horizontal_line_filling_stack_to_visit_store_already_visited_implementation = () => {

                // All horizontal pixel span sections from the image would be useful data.
                //  Seems like it would be easier to determine adjacency of horizontal line sections.
                //   Want to do it in a neat but more mathematical way.

                //    Binary search to find relevant boundaries.

                // An array of each horizontal color spans on each line.
                //  Maybe use normal array js type?
                //   Would be able to find 'continuity paths'

                // Getting all of these color continuity spans for the image (by row) could be useful.
                // Want to be able to build them quickly.

                // Will build them in an array way specific to 1bipp - so that each item in the array represents a new color span
                //  ie a change from before (to the other color)

                const {ta, size} = this;

                // Do it row by row perhaps?


                // calculate_arr_rows_arr_x_off_spans_1bipp

                const aa_x_off_spans = this.calculate_arr_rows_arr_x_off_spans_1bipp();
                console.log('aa_x_off_spans', aa_x_off_spans);


                // array or object representing the links (ajoinments) of the x off spans on different y lines.
                //  (or it would be really fast to find them???)
                //  storing the links would probably be most efficient when it's a large / complex image.

                //  or an object with the paths of them that list which are linked to
                //   separate above and below links?

                //  When this is done, it should enable a very fast flood fill for a wide variety of shapes (1bipp).
                //   Should enable much faster drawing of filled polygons.

                // Could see about doing more directly with just the array and functions that rapidly find things.

                // Some kind of matrix of these links perhaps?
                //  Setting up direct links between JS objects could definitely work well.
                //  As could having a numeric index for all of them.


                
                const find_connected_x_off_spans_below = (y, idx_x_off_span) => {

                    const res = [];

                    if (y < aa_x_off_spans.length - 1) {

                        const span1 = aa_x_off_spans[y][idx_x_off_span];
                        console.log('');
                        console.log('span1', span1);

                        const y_below = aa_x_off_spans[y + 1];
                        console.log('y_below', y_below);


                        // Is there any overlap of ranges???

                        const l_y_below = y_below.length;

                        for (let i_below = 0; i_below < l_y_below; i_below++) {
                            const range_below = y_below[i_below];

                            // check for any overlap...


                            const has_overlap = range_below[0] >= span1[0] && range_below[0] <= span1[1] || range_below[1] >= span1[0] && range_below[1] <= span1[1];
                            console.log('range_below', range_below);
                            console.log('has_overlap', has_overlap);

                            if (has_overlap) {
                                res.push(range_below);
                            }
                        }


                        //throw 'stop';

                    }

                    return res;
                }

                // Probably is getting them right....
                //  Maybe it's best to use an algorithm to determine the graph network between them?

                for (let y = 0; y < aa_x_off_spans.length; y++) {
                    const arr_row_x_off_spans = aa_x_off_spans[y];

                    for (let idx_x_off_span = 0; idx_x_off_span < arr_row_x_off_spans.length; idx_x_off_span++) {
                        const x_off_span = arr_row_x_off_spans[idx_x_off_span];
                        const path_xos = [y, idx_x_off_span];

                        console.log('path_xos', path_xos);

                        const spans_connected_below = find_connected_x_off_spans_below(y, idx_x_off_span);

                        console.log('spans_connected_below', spans_connected_below);

                        // Look for the x offset spans that are below it.
                        //  May be worth keeping track of the links between them.
                        //   (as in they only need to be stored in one place)


                    }

                }




                


                


                const old = () => {

                    const calculate_1bipp_row_arr_x_spans_off = y => {

                        // could try it the less efficient way for now, make a reference implementation.

                        const res = [];
                        const width = this.size[0];
                        // assume starting with 0;
                        let last_color = 0;
                        let current_color;
                        let ta_pos = new Uint16Array(2);
                        ta_pos[1] = y;

                        // need to work out the start and end position of the x spans off.




                        for (let x = 0; x < width; x++) {
                            ta_pos[0] = x;
                            current_color = this.get_pixel_1bipp(ta_pos);

                            if (current_color === last_color) {
                                if (res.length === 0) {
                                    res.push([0, 1]);
                                } else {
                                    res[res.length - 1][1]++;
                                }
                            } else {
                                if (res.length === 0) {
                                    res.push([0, 0]); // a span of length 0
                                    res.push([0, 1]);
                                } else {
                                    res.push([x, x + 1]);
                                }
                            }
                            last_color = current_color;
                        }
                        return res;
                    }
                    const row_x_off_spans = calculate_1bipp_row_arr_x_spans_off(y);
                    console.log('----------------');
                    console.log('row_x_off_spans', row_x_off_spans);

                    // Maybe we want to do it for the whole image?
                    //  Maybe the row above and below if there is such a row.

                    // May be a much more efficient logic for doing this when getting the whole image in terms of these x off spans.
                    //  Then doing the flood fill logic so that it works effectively this way.

                    // Not having to calculate the row above and below x off spans too many times.
                    //  Though could keep them in an object or array easily enough though.

                    if (y > 0) {
                        const row_above_x_off_spans = calculate_1bipp_row_arr_x_spans_off(y - 1);
                        // And can detect overlapping x off spans above.
                        console.log('row_above_x_off_spans', row_above_x_off_spans);
                        // Go through all this row's x off spans.
                        // Sequential traversal through both would work best.
                        //  Identifying overlaps with one pass through.

                        //  ?????Then do a binary search to find the first x off span in the row above that begins within 
                    }
                    if (y < this.size[1] - 1) {
                        const row_below_x_off_spans = calculate_1bipp_row_arr_x_spans_off(y + 1);
                        // And can detect overlapping x off spans below.

                        console.log('row_below_x_off_spans', row_below_x_off_spans);

                        // Can go through, using (1 or 2?) x pointer(s) variable(s)
                        //  or more even?
                        // Def want to point to the x values for the current span.

                        // Identify spans below which have any points intersecting with the spans in this row.

                        //  Possibly identify graphs of linked horizontal spans?
                        //   Then flood filling them would cause that horizontal span to collapse.
                        //    Possibly there would be a very fast way to write the horizontal span notation to a typed array.
                        //     Looking up 1 of 256 values quickly???
                        //      Fast write to various alignments of 1bipp uint8 array.
                        //       (all 8 alignments)

                        // Worth doing some more work on the smaller images and the core algorithms and data structures that will enable this
                        //  fast 1bipp flood fill.
                        //   (and likely more efficient storage format for 1bipp images)
                        //   (may have higher performance underlying 1bipp image format data structure)
                        //   (may be better for some cases than others)

                        // Put the row_x_off_spans functionality into the core.
                        //  Seems like core functionality that will be worth integrating very centrally into the system because of its
                        //  possible efficiency gains for a variety of purposes.
                    }

                    console.log('----------------');

                    /*

                    const calculate_1bipp_row_color_spans_starting_with_0 = (y) => {

                        // byte and bit index of the start and end pixels of the row.

                        const start_byte_bit = this.get_pixel_byte_bit_1bipp([0, y]);
                        const end_byte_bit = this.get_pixel_byte_bit_1bipp([size[0], y]);

                        console.log('[start_byte_bit, end_byte_bit]', [start_byte_bit, end_byte_bit]);

                        // Could have a 'slow' method to start with and to test results against.
                        // Want to be detecting runs of 1s or 0s with more optimised methods.
                        //  Could use BigInt reading to check if they are all the same for 8 bytes (64 bits).

                        // Could even have / use a lookup table of 256 items to see
                        //  number of pixels to add to the current span
                        //  an array of pixel spans ?? or whatever format is best
                        //   there can not be that many of them.
                        //    (what color the last span ends on, though this can be calculated / read easily)
                        //     (may be useful to calculate for reference / debugging at some points)





                        // Optimised reading of these 1bipp lines into this format.
                        // Optimised / efficient logic for using them in flood fills.

                        // Then efficient writing them (possibly with OR) into the 1bipp bitmaps.
                        //  Logic that checks bytes for 0 or 255 would help.
                        //   And then if it finds other values, it moves specifically through that byte, bit by bit, applying logic to each of those bits.
                        //    Could be efficient inline 8 stage process rather than for loop.
                        // Operations of adding to the last span (how ever many pixels / bits).
                        //  Starting a new span(1 pixel only so far)
                        //  Starting a new span(n pixels)

                        // Then fast rendering them to the pixel buffer 1bipp typed array...
                        //  Setting 8 or even 64 pixels at a time when they are all the same color.

                        // Being able to construct per-byte masks?
                        //   More complex than just setting 1 byte at a time?
                        //   Many / most cases will be setting 8 (or even 64) pixels at once, covering a lot of space quickly.


                        // Then can go through that row identifying the number of color changes.
                        //  Maybe getting this info should be in the core.
                        //   It's the kind of thing which low level could be very useful for the implementation.
                        //    Maybe even having it as a possible storage mode rather than fully 1bipp.
                        //     Being able to define linear pixel spans and working with them for a variety of operations.
                        //     May be a more efficient format in a variety of cases.
                        //      Drawing pixels could add to an existing liner pixel span or create a new one.

                        // Determining which linear pixel spans are directly above which other linear pixel spans.
                        //  Or below
                        // Use of binary search algorithm would be of use for this.
                        //  Will mean the fill logic will get applied to thousands of pixels at once in large images.
                        //  It's a data structure that is part way in terms of logic to acheiving flood fills.


                    }


                    console.log('pos[1]', pos[1]);
                    let bb = calculate_1bipp_row_color_spans_starting_with_0(pos[1]);
                    console.log('bb', bb);

                    */

                }



                






            }

            //return horizontal_line_filling_stack_to_visit_store_already_visited_implementation();


            // Worth building a decent flood fill implementation using the horizontal line filling outside of here for the moment.
            //  Build the lower level functions needed for it to work, then it will be much easier and faster to make the flood fill itself.



            return ta_stack_fn_calls_inlined_8bipp_visited_matrix_implementation();


            // Worth getting more into the core to get the whole image as an array of rows' x off spans.
            // Maybe (then?) index all the x off spans?
            //  But then removing them could become more tricky?
            //  May also want to just keep track of all of the x off spans that wound up getting changed / removed.
            //   Could then use these to make / iterate through a pixel position list of every pixel to paint.
            //   That would, however, not be the fastest pixel painting algorithm.
            //    Want to do horizontal scans based on the information in the x off spans.
            // Indexing all the x off spans in an image could be useful.
            //  Or could add a 'visited' or 'painted' property to them.
            //   Then just writing all the painted x off spans to the image may be good / fast enough.
            //    Especially with a nicely optimised horizontal line drawing algorithm.
            //     Maybe have a 'draw_horizontal_line_color_on_1bipp'(y, x1, x2) ???
            //      A (highly?) optimised and specific horizontal line drawing function?
            //      Could apply a | 255 mask to a whole load of pixels (8) at a time.

            // things like
            //  if (num_remaining_px >= 8) {
            //    are all the pixels in the image at byte of the target color (ie is byte 0)? if they are, then set that pixel to 1.
            //     otherwise, go through them pixel by pixel?
            //    

            //  }

            // Very rapid horizontal line drawing to 1bipp image tas would be very helpful.
            //  As well as using these horizontal lines as their own encoding of the image.

            // Getting the whole image as an array of these row x off spans would be useful.
            //  Want to try with slightly larger images as well, such as 25x25 where there will be aligned areas, and alignment will need to be carried out
            //   Make sure it works efficiently on the aligned areas, as in large images (line drawings especially) there will be large spans of the same
            //    pixel off x spans.




            //  Then can write a flood fill algorithm which acts directly on them.
















            

        }
    }



    // And better to use a 'pos' array.
    //  Probably.

    // Could try '_xy' versions too.

    'flood_fill_1bipp'(x, y, color) {

        const new_color = color;
        const target_color = this.get_pixel_1bipp([x, y]);

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

                // Just an x,y grid would do the job better probably.

                const pb_already_visited = new Core({
                    size: this.size,
                    bits_per_pixel: 1
                })

                // Think this part is working, problem seems to be with stack?
                //  Or the use of these data types?

                // Seems broken....

                //console.log('stack_length', stack_length);
                //throw 'stop';

                // What about getting a pixel pos list of the colors to paint?



                // Possible faster 1bipp linear flood fill?
                //  Have access to the row above and below at the same time?
                //   And only put it on the stack if that pixel is of the target color?

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

            const ta_stack_fn_calls_inlined_8bipp_visited_matrix_implementation = () => {
                // This will be less memory efficient but likely (much) faster.


                
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

                // Just an x,y grid would do the job better probably.

                const [width, height] = this.size;


                const ta_already_visited = new Uint8Array(width * height);

                /*
                const pb_already_visited = new Core({
                    size: this.size,
                    bits_per_pixel: 1
                })
                */

                // Think this part is working, problem seems to be with stack?
                //  Or the use of these data types?

                // Seems broken....

                //console.log('stack_length', stack_length);
                //throw 'stop';

                // What about getting a pixel pos list of the colors to paint?



                // Possible faster 1bipp linear flood fill?
                //  Have access to the row above and below at the same time?
                //   And only put it on the stack if that pixel is of the target color?

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

                            if (ta_already_visited[width * ta_pos2[1] + ta_pos2[0]] === 0) {

                            //if (pb_already_visited.get_pixel_1bipp(ta_pos2) === 0) {
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

                            if (ta_already_visited[width * ta_pos2[1] + ta_pos2[0]] === 0) {
                            //if (pb_already_visited.get_pixel_1bipp(ta_pos2) === 0) {
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

                            if (ta_already_visited[width * ta_pos2[1] + ta_pos2[0]] === 0) {
                            //if (pb_already_visited.get_pixel_1bipp(ta_pos2) === 0) {
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

                            if (ta_already_visited[width * ta_pos2[1] + ta_pos2[0]] === 0) {
                            //if (pb_already_visited.get_pixel_1bipp(ta_pos2) === 0) {
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
                        ta_already_visited[width * ta_pos[1] + ta_pos[0]] = 255
                        //pb_already_visited.set_pixel_1bipp(ta_pos, 1);
                    }
                    //console.log('stack_length', stack_length);
                }
            }
            
            // Seems very much slower with that matrix this way!
            // And then a more fully inlined implementation...?

            //  Surprised that 8bipp matrix was slower. It was an algorithmic error, it seems to be considerably faster this way.
            //   About 2.5x the speed for something like 8x the memory usage.
            // ta_stack_fn_calls_inlined_implementation
            // ta_stack_fn_calls_inlined_8bipp_visited_matrix_implementation

            return ta_stack_fn_calls_inlined_8bipp_visited_matrix_implementation();
            
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



    // Flood fill from the outer boundaries, filling in color 0 as 1, 1bipp

    flood_fill_off_pixels_from_outer_boundary_on_1bipp() {

        this.each_outer_boundary_pixel((b_color, pos) => {
            //console.log('[color, pos]', [color, pos]);

            // if color is 0, 0, 0

            //const [r, g, b] = b_color;

            //console.log('b_color', b_color);
            //console.log('pos', pos);

            if (b_color === 0) {
                // flood fill this pos with the given color.


                // And will need a new flood fill function.
                //console.log('fill_color', fill_color);

                this.flood_fill_c1_1bipp(pos);

            }


        });
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


    // Worth making a much more optimised version of this.

    // It's currently a really long function.

    // Could likely work on bits and pieces of this to speed them up individually.
    // Definitely worth looking into aligned copies.
    //  Be able to create pixel buffers that have each line start on an n*8 byte.
    //  Padding at end and / or beginning of lines.
    //   End is probably best. Beginning could be appropriate in some cases ??? (yes, to get alignment with other image)

    // 1 byte at once copy would def be useful too.
    //  But the 64 bytes at once will greatly speed up copying some larger images.





    // A highly optimised 1bipp function.
    //  May be able to make more optimised versions, but it's worth working on some optimised data structures and lower level functions for it to
    //  use.

    // Identifying inner pixels of a set color?
    // Identifying all off inner pixels, 1bipp.
    //  Being able to collapse x spans.
    //   Deleting the xspan offs that are inner.
    //   That would be a faster way to do the flood fill itself.
    //    But then would need to then draw the xspan ons to this pb.
    
    // Obtaining a ta that contains all of the x spans (on or off or both...)

    // Iterating through the values.
    //  Don't make really obscure syntax...
    //   If needed make classes to represent the data held in tas.
    //    though a comment such as [a, b, c] = ta_cb would make sense, (callback providing a typed array value)

    // Iterating through all x on spans, or all x off spans.
    //  Generator function seems like the best way here (syntactically)

    // Iterating x on spans, x of spans, or all x spans could be a useful and efficient way to access them in some cases
    //  (no necessarily building an array of them)



    

    // Iterating x spans....

    // Does look like having x_spans as a lower level feature will help a lot.
    //   Mask to x_spans....

    




    // A Row_X_Spans class?






    // Quite advanced here....


    // Seems like lower level implementation of x_spans would help here.

    // Scope to optimise this much more. Could probably draw filled shapes very much faster with it.


    // May be best making more typed array implementations of things, and calling them here.



    //   Identify (linked) groups?
    //   Identify solid areas?

    // Identify distinctive spaces of 1bipp image?
    //   Rapid identification of if a pixel is enclosed by the polygon.
    //     Whether diagonals count or not?
    
    // The linked x-lines / x-spans.
    //   Groups of x-spans does seem like the way to do this.
    //     Scanning them, and identifying if they match any in the line above.
    //       Or really, where they overlap with the x-lines in the y-row above.

    // Algorithm (clear, functional, still optimised) that makes sense of the toggle positions.

    // contiguous spaces....
    //   could they also be identified on the y-lines and the information corresponded that way?
    //     doing it for every x-column?

    // But going through the x-lines, identifying which in the row above they link to.
    //   Also, could have 2 sets of link modes:
    //     Connecting directly above, or allowing diagonal connections.
    //       Rules about lines that have the diagonally connecting points separating spaces which don't have them.











    each_x_span(cb) {


        const [w, h] = this.size;
        const ta_x_span_toggle_bits = get_ta_bits_that_differ_from_previous_as_1s(this.ta);

        // Even looking at the number of contiguous 0s?

        // but then need to (somehow) approach it row by row.

        // An iteration which works out how many there are per row?
        //  x-spans have a color. x-spans 

        // A process-since-last system may be best (for now). Somewhat hard to implement so far.

        let prev_x, prev_y;
        // count of them in that row....
        // handle row change would make sense.
        // detect row_change???
        let x_delta, y_delta;


        let color_leading_on_from_current_x_toggle_position;


        const found_empty_rows = (y0, y1_inclusive) => {

        }


        const found_x_span = (x0, x1, y, color) => {

            //console.log('x0, x1, y, color', x0, x1, y, color);

            cb(x0, x1, y, color);

        }

        const complete_previous_row_x_span = () => {


        }

        const complete_any_empty_in_between_rows = () => {

        }

        const complete_current_x_span = (x, y) => {

            found_x_span(prev_x, x - 1, y, color_leading_on_from_current_x_toggle_position);

            color_leading_on_from_current_x_toggle_position^=1;

            // toggle the color

            // 


        }

        const found_row_beginning_color_0_x_span = (x_span_end, y) => {
            found_x_span(0, x_span_end, y, 0);

            color_leading_on_from_current_x_toggle_position = 1;
        }
        const found_row_beginning_color_1_x_span_beginning = (y) => {
            color_leading_on_from_current_x_toggle_position = 1;

        }


        const handle_xy_toggle_position = (x, y) => {


            if (prev_x === undefined) {
                // it's the very first.
                //   is x 0?

                if (y > 0) {
                    // will have lines of x 0 spans.
                    //   catch_up_y?
                    found_empty_rows(0, y - 1);

                }

                if (x > 0) {
                    found_row_beginning_color_0_x_span(x, y);
                    
                } else {
                    found_row_beginning_color_1_x_span_beginning(y);
                    
                }

                // then found row beginning x_0_span




            } else {

                if (y > prev_y) {

                    complete_previous_row_x_span();
                    complete_any_empty_in_between_rows();

                    // is it the first position???
                    //   mean there is no completed x_span in this case.

                    if (x === 0) {
                        found_row_beginning_color_1_x_span_beginning(y);
                    } else {
                        found_row_beginning_color_0_x_span(x - 1, y);
                    }

                    // complete any in between empty rows.



                    // and any empty rows in between?




                    // complete the previous x-span in the previous row?

                    // complete_row_ending_x_span


                    // handle_y_change

                    // how many rows to advance?

                    // complete the current row's last x_span

                } else {
                    // complete_current_x_span
                    complete_current_x_span(x, y);

                }

            }

            // catch up from last.

            // is it the first in the row?

            // catching up from the previous one?
            //   is it in the same row?

            //console.log('x, y', x, y);

            

            prev_x = x; prev_y = y;

        }



        each_1_index(ta_x_span_toggle_bits, i => {
        
            // Should probably iterate them (better) by rows.

            // And when it's the first in a row?

            //console.log('i', i);



            const y = Math.floor(i / w);
            const x = i % w;

            handle_xy_toggle_position(x, y);

        });





    }









    attempting_faster_flood_fill_inner_pixels_off_to_on_1bipp() {

        // Need some fast iteration, probably to a class, that represents the image in terms of groups of x spans.
        //   


        this.each_x_span((x0, x1, y, color) => {
            //console.log('x0, x1, y, color', x0, x1, y, color);


        })

    }




    not_very_fast_flood_fill_inner_pixels_off_to_on_1bipp() {

        // Identify inner pixels off x-spans.
        // Identify the groups of inner pixels.
        //   But grouped by x-spans???
        //     Probably don't want something more complicated, x-spans are things that can be drawn quickly.
        //       Horizontal lines. X-Lines instead?
        // [[x1, x2], y];

        










        // And iterating inner x off spans?
        //   May have a way that's faster still to read which of them are inner.


        const identify_overlaps = (higher_row_x_spans, lower_row_x_spans) => {
            //const overlaps = [];
            let i = 0, j = 0;
            const m = higher_row_x_spans.length, n = lower_row_x_spans.length;

            while (i < m && j < n) {
                const a = higher_row_x_spans[i], b = lower_row_x_spans[j];
                if (a.x0_span[1] < b.x0_span[0]) {
                    i++;
                } else if (b.x0_span[1] < a.x0_span[0]) {
                    j++;
                } else {
                    //overlaps.push([a, b]);
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
            //return overlaps;
        }

        // Getting them in a custom data structure could be better.

        // Getting a custom class that represents these x off spans for an image / pb would be helpful.

        // Iterating through x off spans would be useful.

        // Maybe work on optimising this function using more advanced current knowledge.


        // And this could be sped up using the faster ta functions.
        //   Get the x off spans simply enough...

        const rows_x0spans = this.calculate_arr_rows_arr_x_off_spans_1bipp();



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

        // The array of objects that includes info on overlaps...
        const arr_y_indexed = new Array(this.size[1]);
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

        let higher_row_y, lower_row_y;

        let span_above, span_below;



        // Iterate row pairs?

        // Could see about making them join groups without identifying all the overlaps first?
        //  Then correct / merge groups when found later that items in different groups intersect.


        for (higher_row_y = 0; higher_row_y < this.size[1] - 1; higher_row_y++) {
            //const higher_row_x_spans = arr_y_indexed[higher_row_y];
            //const lower_row_x_spans = arr_y_indexed[lower_row_y];
            //identify_overlaps(higher_row_x_spans, lower_row_x_spans);

            //console.log('higher_row_y', higher_row_y);

            identify_overlaps(arr_y_indexed[higher_row_y], arr_y_indexed[higher_row_y + 1]);
        }

        // Getting all of this info on contiguous xspans in a single function could help.
        //  Can then further optimise that function.




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

        
        //let current_group_is_boundary_adjacent = false;

        // and an array of groups...
        //  Would be useful to have them.


        // Array of the indexes of groups
        const arr_groups = [];
        const arr_o_groups = [];
        let arr_current_group = [];
        let o_current_group;
        let i_xspan_visiting, xspan_visiting;
        

        // Could check for group boundary adjacency here...?
        //  Though separate processes / iterations may make the code clearer.

        // Do expect this to be fast because of algorithmic process efficiency but then will probably still
        //  need fine tuning with specific data structures and operations.

        const [width, height] = this.size;
        const hm1 = height - 1, wm1 = width - 1;
        const is_xspan_image_boundary_adjacent = xspan => {
            const {x0_span} = xspan;
            if (xspan.y === 0) return true;
            if (x0_span[0] === 0) return true;
            if (xspan.y === hm1) return true;
            if (x0_span[1] === wm1) return true;
            return false;
        }

        let xspan;
        let idx_span_above, idx_span_below;

        for (let c = 0; c < l; c++) {

            if (ui8a_visited_already[c] === 0) {
                ui8a_visited_already = new Uint8Array(l);
                //const xspan = arr_all_x_spans[c];
                xspan = arr_all_x_spans[c];
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

                    

                    for (idx_span_above of xspan.connected_above) {
                        if (ui8a_visited_already[idx_span_above] === 0) arr_stack_yet_to_visit.push(idx_span_above);
                    }
                    for (idx_span_below of xspan.connected_below) {
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

                            for (idx_span_above of xspan_visiting.connected_above) {
                                if (ui8a_visited_already[idx_span_above] === 0) arr_stack_yet_to_visit.push(idx_span_above);
                            }
                            for (idx_span_below of xspan_visiting.connected_below) {
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

        // non-boundary xspans...



        //console.log('non_boundary_group_indexes', non_boundary_group_indexes);

        // then get them as x spans (each including the y value)
        //  y_val_x_span items???

        // likely to want a lower level ta-backed system to deal with them faster.
        // [y, [x1, x2]]???
        // or better as [[x1, x2], y]???
        //  seems more logical / standard that way round.
        //  may need to consider optimisation requirements in some cases, maybe it wont matter with this, but need consistency.


        // Could write them directly...

        /*
        const create_then_write = () => {
            const arr_all_inner_xspans = [];

            for (const idx of non_boundary_group_indexes) {
                //console.log('idx', idx);
                arr_all_inner_xspans.push([arr_all_x_spans[idx].x0_span, arr_all_x_spans[idx].y]);
            }

            // Could use a different / separate function to identify inner x span offs.
            //  They are the ones that would need to be filled.

            // An object that uses an underlying typed array could allow faster iteration on them.
            //  Could even be very much faster.
            //  This version with arrays is of a fairly good speed, but no doubt could be increased a lot.

            //console.log('arr_all_inner_xspans', arr_all_inner_xspans);
            // Then could see about painting them...
            //  (x1, x2, y) for further speed? or a ta with the 3 of them???
            // Will change the format???

            for (const [x_span, y] of arr_all_inner_xspans) {
                //console.log('[x_span, y]', [x_span, y]);
                // xspan then y.
                this.draw_horizontal_line_on_1bipp_inclusive(x_span, y);
            }
        }
            */

        const write_direct = () => {
            let xspan;
            for (const idx of non_boundary_group_indexes) {
                //console.log('idx', idx);
                //arr_all_inner_xspans.push([arr_all_x_spans[idx].x0_span, arr_all_x_spans[idx].y]);
                xspan = arr_all_x_spans[idx];
                this.draw_horizontal_line_on_1bipp_inclusive(xspan.x0_span, xspan.y);
            }
        }
        
        write_direct();
        //create_then_write();

    }
    


    flood_fill_inner_pixels_off_to_on_1bipp() {



        //return this.attempting_faster_flood_fill_inner_pixels_off_to_on_1bipp();
        return this.not_very_fast_flood_fill_inner_pixels_off_to_on_1bipp();



        
    }
}

//Pixel_Buffer_Enh.get_instance = get_instance;
//return Pixel_Buffer_Enh;
module.exports = Pixel_Buffer_Perf_Focus_Enh;
//}

//module.exports = get_instance();