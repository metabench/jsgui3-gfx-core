


const Pixel_Buffer_Core_Draw_Polygons = require('./pixel-buffer-1.2-core-draw-polygon');

const Polygon_Scanline_Edges = require('./shapes/Polygon_Scanline_Edges');
const ScanlineProcessor = require('./shapes/ScanlineProcessor');

class Pixel_Buffer_Core_Masks extends Pixel_Buffer_Core_Draw_Polygons {
    constructor(spec) {
        
        super(spec);

        
        
        
    }

    'draw_1bipp_pixel_buffer_mask_1bipp'(pb_1bipp_mask, dest_pos, color) {

        const arr_on_xspans_implementation = () => {

            // Getting it as an arr_rows_arr_x_on_spans representation using a class could help.
            //   Or the 'other representaion' type class.

            // May be able to have a faster internal algorithm for that.
            //   Maybe a typed array backed class? Maybe a typed array.

            const arr_rows_arr_on_xspans = pb_1bipp_mask.calculate_arr_rows_arr_x_on_spans_1bipp();
            const [width, height] = pb_1bipp_mask.size;

            const [dest_x, dest_y] = dest_pos;

            /*
            for (const row of arr_rows_arr_on_xspans) {

                for (const xonspan of row) {
                    xonspan[0] += dest_x;
                    xonspan[1] += dest_x;
                }
                
                //this.draw_horizontal_line_on_1bipp_inclusive(xonspan, y + dest_y);
            }
                */
            
            // Not sure the spans are inclusive...

            if (color === 1) {
                //let y = 0;
                //let [dest_x, dest_y] = dest_pos;
                for (let y = 0; y < height; y++) {
                    //const arr_row_xspans_on = arr_rows_arr_on_xspans[y];
                    const target_y = y + dest_y;
                    //if (arr_row_xspans_on.length > 0) {
                    for (const xonspan of arr_rows_arr_on_xspans[y]) {
                        xonspan[0] += dest_x;
                        xonspan[1] += dest_x;
                        this.draw_horizontal_line_on_1bipp_inclusive(xonspan, target_y);
                    }
                    //}
                }
            } else {
                //let y = 0;
                
                for (let y = 0; y < height; y++) {
                    //const arr_row_xspans_on = arr_rows_arr_on_xspans[y];
                    const target_y = y + dest_y;
                    //if (arr_row_xspans_on.length > 0) {
                    for (const xonspan of arr_rows_arr_on_xspans[y]) {
                        xonspan[0] += dest_x;
                        xonspan[1] += dest_x;
                        this.draw_horizontal_line_off_1bipp_inclusive(xonspan, target_y);
                    }
                    //}
                }
            }

            // Get it as an other representation of a 1 bipp image
            
        }

        // Possibly a faster way to do it?



        // realigned 64 bit???

        //  does the mask not fit in 64 bit alignment?
        //  does the dest?
        //  does the position within the dest?
        //    if so, can realign / move the pixels in the source.
        //    seems best to do things simply with the typed arrays where possible.

        // or copy the aligned part fast then cover the other part.

        // The limited case fast aligned copy right now is fairly good.





        /*

        const aligned_64_bit_implementation = () => {

            const pb_source = pb_1bipp_mask;
            const pb_dest = this;

            const dest_start_pxi = dest_pos[1] * pb_dest.size[0] + dest_pos[0];
            //   So, need to work out how many pixels it is off from being divisible by 8.
            //     No, that is 0 in this case.
            //   Work out how many pixels it's off from being divisible by 64.
            //     And that typed array wouln't be able to cover the very end either ????




            //  And the end pxi too???? Will there be enough space in the typed array to make that typed array???







            // get both the source and dest taui64

            const sta64 = new BigUint64Array(pb_source.ta.buffer, pb_source.ta.byteOffset);
            const dta64 = new BigUint64Array(pb_dest.ta.buffer, pb_dest.ta.byteOffset);

            // Then the start position of where it will be written...

            const write_start_pos = dest_start_pxi >>> 6;
            //const bpr_diff = 




            const write_pos_line_jump = ((pb_dest.size[0] - pb_source.size[0]) >>> 6) - 2;

            //   number of 64 bit values per row - number of 64 bit values in source pb row


            // Just a slightly tricky calculation????

            //const dest_l




            //const write_pos_line_jump = pb_dest.size[0] - 

            // So, write it line by line....
            //   reading each line too....

            let w_pos = write_start_pos, r_pos = 0;

            const [w, h] = pb_source.size;

            // 

            // And then the remaining number of 64 byte pieces from the end of the dest draw line to its beginning on the next line.


            // and an x loop that loops through the 8 byte pieces...

            const num_64bit_values_per_row = w >>> 6;

            //console.log('num_64bit_values_per_row', num_64bit_values_per_row);
            //console.log('w', w);

            //console.trace();
            //throw 'stop';


            if (color === 1) {
                for (let y = 0; y < h; y++) {
                    for (let x64 = 0; x64 < num_64bit_values_per_row; x64++) {

                        // drawing it as a mask, so if it's in color 1, then it will be doing 'or'.

                        //console.log('dta64[w_pos]', dta64[w_pos]);
                        //console.log('sta64[r_pos]', sta64[r_pos]);

                        //console.log('r_pos', r_pos);
                        //console.log('w_pos', w_pos);
                        //console.log('y', y);
                        //console.log('x64', x64);
                        //console.log('pb_source.size', pb_source.size);

                        //console.log('sta64.length', sta64.length);

                        //dta64[w_pos] = dta64[w_pos] | (sta64[r_pos++]);

                        dta64[w_pos] |= (sta64[r_pos++]);
                        
                        w_pos++;
                    }
                    //w_pos--;
                    //w_pos += write_pos_line_jump;
                }
            } else {
                for (let y = 0; y < h; y++) {
                    for (let x64 = 0; x64 < num_64bit_values_per_row; x64++) {

                        // drawing it as a mask, so if it's in color 1, then it will be doing 'or'.

                        //console.log('dta64[w_pos]', dta64[w_pos]);
                        //console.log('sta64[r_pos]', sta64[r_pos]);

                        //console.log('r_pos', r_pos);
                        //console.log('w_pos', w_pos);
                        //console.log('y', y);
                        //console.log('x64', x64);
                        //console.log('pb_source.size', pb_source.size);

                        //console.log('sta64.length', sta64.length);

                        dta64[w_pos] = dta64[w_pos] & (~(sta64[r_pos++]));
                        
                        w_pos++;


                    }
                    //w_pos--;
                    w_pos += write_pos_line_jump;
                }
            }
        }

        */

        // realigned reads system will work and be more versitile.

        //   still would requite dest 64 bit alignment????
        //     or do a more logical way and go row by row through it, doing whatever 8 byte operations are suitable.

        // but can't draw outside of the bounds of the thing itself.


        // but with realigned reads, want it to be similar.
        //   but maybe we actually do need to copy the aligned parts where possible, so do the fastest 64 bit operations in the places that they cover.

        //   could do the OR operation on the parts of it that are outside the bounds, keeping / putting back in place the things that are already there.


        // Getting a really good optimisation for pixel drawing should help quite a lot.







        



        




        const bit_realigned_64_bit_implementation = () => {

            const pb_source = pb_1bipp_mask;
            const pb_dest = this;


            const size_source = pb_source.size;
            //  And each row width should be / is divisible by 64.
            const w_source = size_source[0];
            const h_source = size_source[1];


            const size_dest = pb_dest.size;
            //  And each row width should be / is divisible by 64.
            const w_dest = size_dest[0];
            //const h_dest = size_dest[1];

            //const ta_source = pb_source.ta;
            //const ta_dest = pb_dest.ta;

            const iterate_dest_shift_reads = () => {

                //console.log('');

                // Maybe best to find the full range.
                //   Or the range for the rows?
                //   No, get it fully precise.

                
                // Dest start pxi
                // Dest end pxi

                // Pxi of the start of the first row (won't be selected if ourside of draw range)
                // Pxi of the end of the last row    (won't be selected if ourside of draw range)

                // Better to get a smaller writing range....
                //   Though 


                const dest_start_pxi = (dest_pos[1] * pb_dest.size[0]) + dest_pos[0];


                const dest_start_row_end_pxi = dest_start_pxi + pb_source.size[0];

                //const dest_end_pxi = dest_start_row_end_pxi + (pb_source.size[1] * pb_dest.size[0]);

                //const dest_end_pxi = (dest_pos[1] + pb_source.size[1]) * pb_dest.size[0] + dest_pos[0] + pb_source.size[0];


                // How long is that range?

                //const num_px_in_dest_draw_range = dest_end_pxi - dest_start_pxi;


                //console.log('num_px_in_dest_draw_range', num_px_in_dest_draw_range);
                // Needs to be divisible by 64???

                //console.log('num_px_in_dest_draw_range % 64', num_px_in_dest_draw_range % 64);
                //   Probably does need be be divisible by 64, at least for now.


                // And how many px (bits) is the draw range from the start of each row?


                const num_px_from_dest_row_start_to_draw_box_start = dest_pos[0];
                // num px to row end from shape end...

                const num_px_from_draw_box_end_to_dest_row_end = pb_dest.size[0] - pb_source.size[0] - num_px_from_dest_row_start_to_draw_box_start;
                

                //console.log('num_px_from_dest_row_start_to_draw_box_start', num_px_from_dest_row_start_to_draw_box_start);
                //console.log('num_px_from_draw_box_end_to_dest_row_end', num_px_from_draw_box_end_to_dest_row_end);


                const num_px_line_jump = num_px_from_draw_box_end_to_dest_row_end + dest_pos[0];

                const num_ui64_line_jump = (num_px_line_jump >>> 6) - 1; // This part looks right at least.



                // Then how many full bytes?
                // How many full 64 bit chunks?


                // Anyway, iterate these 64 bit values, within, or not fully within, the draw range.
                //   Will have some overlaps, need to be careful about handling that correctly.

                // so, need the 64 bit index.

                // i64 could make sense - index within 64 bit space.

                const dest_start_i64 = dest_start_pxi >>> 6;
                const dest_start_i64_rb = dest_start_pxi % 64;

                //console.log('dest_start_i64', dest_start_i64);
                //console.log('dest_start_i64_rb', dest_start_i64_rb);


                const dest_start_row_end_i64 = dest_start_row_end_pxi >>> 6;
                //const dest_start_row_end_i64_rb = dest_start_row_end_pxi % 64;

                //console.log('dest_start_row_end_i64', dest_start_row_end_i64);
                //console.log('dest_start_row_end_i64_rb', dest_start_row_end_i64_rb);


                // dest_start_row_end_i64_rb px into the last one.
                //  so it will be an inclusive number of them.

                const num_64_bit_at_least_partial_parts_per_row = (dest_start_row_end_i64 - dest_start_i64) + 1;
                //console.log('num_64_bit_at_least_partial_parts_per_row', num_64_bit_at_least_partial_parts_per_row);
                // number of pixels to offset to the left????
                //   or really, it's 32 pixels in.....
                // do the 0th one...
                // Maybe best to read the dest to a local variable, keep it rather than read it twice from the ta.
                // dest_start_row_end_pxi
                // dest start row end....
                
                // And the end of the first line....

                // 

                // And the number of 64 bit chunks to write...
                //   How much of each one will be written to?


                // And the remainder at the end too....


                // So best to go through each row????
                // Maybe iterating the 'y' coordinates of the dest space that will be drawn to.
                //    Does make most sense really....

                let i64_dest = dest_start_i64;

                let i64_source = 0;

                const y_top = dest_pos[1], y_bottom = y_top + h_source;
                const sta64 = new BigUint64Array(pb_source.ta.buffer, pb_source.ta.byteOffset, pb_source.ta.byteLength / 8);
                //const dta64 = new BigUint64Array(pb_dest.ta.buffer, pb_dest.ta.byteOffset + byte_start); // To the end I think???

                const dta64 = new BigUint64Array(pb_dest.ta.buffer, pb_dest.ta.byteOffset, pb_dest.ta.byteLength / 8); // To the end I think???
                const bi_dest_start_i64_rb = BigInt(dest_start_i64_rb);
                //  and then 64 minus that
                // so how many bits to shift the right part to the right????
                const bi_right_right_shift_bits = 64n - bi_dest_start_i64_rb;
                const dest_row_middle_ui64_count = num_64_bit_at_least_partial_parts_per_row - 2;

                for (let y = y_top; y < y_bottom; y++) {
                    const process_0th_64bit_part = () => {
                        // Maybe could even do it using bytes????
                        //   Though doing it in one operation really will be best.
                        // So, need to read from the beginning of the dest row....
                        //console.log('dest_row_starting_ui64', dest_row_starting_ui64);
                        //console.log('dest_row_starting_ui64_but_only_with_the_original_left_part_there', dest_row_starting_ui64_but_only_with_the_original_left_part_there);

                        // Then add in the part from the destination....
                        //   But the left part needs to be moved to the right.
                        //const source_row_starting_ui64_but_left_part_is_shifted_right = (sta64[i64_source] >> bi_dest_start_i64_rb) >> 32n;

                        // Hmmmm not so sure on endianness here - is that messing things up.

                        // left shift here???
                        //   not sure why that works! endianness problem.
                        //     as these numbers are LE, not BE, so I think.


                        //const dest_row_starting_ui64 = dta64[i64_dest];
                        //const dest_row_starting_ui64_but_only_with_the_original_left_part_there = (dest_row_starting_ui64 << bi_right_right_shift_bits) >> bi_right_right_shift_bits;
                        //const source_row_starting_ui64_but_left_part_is_shifted_right = (sta64[i64_source] << bi_dest_start_i64_rb);
                        //const new_value_to_write = dest_row_starting_ui64_but_only_with_the_original_left_part_there | source_row_starting_ui64_but_left_part_is_shifted_right;
                        //dta64[i64_dest] = new_value_to_write;


                        dta64[i64_dest] = ((dta64[i64_dest] << bi_right_right_shift_bits) >> bi_right_right_shift_bits) | (sta64[i64_source] << bi_dest_start_i64_rb);

                        // Could use an XOR mask I think.
                        //   With all 1s on the right.

                        // 2 to the power of 
                        // so would be an 'or' operation upon something which has had that part removed already.
                        i64_dest++;


                        //  Would not have completed copying the 1st 64bit value from the source.
                        //i64_source++;
    
                    }
                    // and a local variable for the previous / left item from the source.

                    const process_middle_64bit_parts = () => {
                        // And a loop on the inner part....

                        //console.log('dest_row_middle_ui64_count', dest_row_middle_ui64_count);


                        for (let i_mid = 0; i_mid < dest_row_middle_ui64_count; i_mid++) {
                            // Will need to read 2 parts from the source....
                            // left_source_ui64 
                            // the index of the left source one.
                            //const left_source_ui64_as_read = sta64[i64_source];
                            //const right_source_ui64_as_read = sta64[i64_source + 1];
                            // How many bits from the left, how many bits from the right?
                            // But it's the right part from the source left.
                            //const left_source_ui64_right_part_used = left_source_ui64_as_read >> bi_right_right_shift_bits;
                            // and the left part will be used on the right
                            //const right_source_left_part_used = right_source_ui64_as_read << bi_dest_start_i64_rb;
                            //const combined_lr = left_source_ui64_right_part_used | right_source_left_part_used;
                            //dta64[i64_dest] = combined_lr;
                            dta64[i64_dest++] = (sta64[i64_source] >> bi_right_right_shift_bits) | (sta64[i64_source + 1] << bi_dest_start_i64_rb);
                            //const left_source_left_only = 
                            // then the value to write - 
                            //i64_dest++;
                            i64_source++;
                        }
                        // num_inner_64bit_parts
                    }

                    
    
                    const process_last_64bit_part = () => {
    
                        // just write to max ui64???????
                        // get the right part of the dest row....
                        //const right_source_ui64_as_read = sta64[i64_source];
                        //const right_part_of_source_shifted_left = (right_source_ui64_as_read >> bi_right_right_shift_bits);
                        //const dest_row_ending_ui64 = dta64[i64_dest];
                        //const masked_dest_row_ending_ui64 = (dest_row_ending_ui64);
                        //const new_value_to_write = masked_dest_row_ending_ui64 | right_part_of_source_shifted_left;
                        //dta64[i64_dest] = new_value_to_write;


                        dta64[i64_dest] = (dta64[i64_dest]) | (sta64[i64_source] >> bi_right_right_shift_bits);

                        i64_dest++;
                        i64_source++;
                    }

                    process_0th_64bit_part();
                    process_middle_64bit_parts();
                    process_last_64bit_part();

                    // Then do the line jump.

                    i64_dest += num_ui64_line_jump;
                    //console.log('process_0th_64bit_part', process_0th_64bit_part);

                }


                //for (let y = dest_pos[0], )


            }

            iterate_dest_shift_reads();



            // May be easier to do shifted reads....

            //   So would iterare through every 64bit value being written.


            /*

            const first_attempt_shifting_writes = () => {

                if (w_source > 0) {
                    // and then the number of (complete) 64 bit parts....
                    const num_complete_64_bit_parts_per_row = w_source >>> 6;
                    const num_bits_per_row_remaining_after_complete_64_bit_parts = w_source % 64;

                    console.log('num_complete_64_bit_parts_per_row', num_complete_64_bit_parts_per_row);
                    console.log('num_bits_per_row_remaining_after_complete_64_bit_parts', num_bits_per_row_remaining_after_complete_64_bit_parts);

                    // so iterate through the values in the rows....

                    const sta64 = new BigUint64Array(pb_source.ta.buffer, pb_source.ta.byteOffset);
                    const dta64 = new BigUint64Array(pb_dest.ta.buffer, pb_dest.ta.byteOffset);

                    let rpos_64 = 0;

                    // byte index perhaps....

                    let bit_index = 0;


                    // The writing bit index....?

                    //   The coordinates etc only get complex with writing it. Reading it this way is simple.

                    // Also have some dest_x, dest_y???
                    //   Have code in the loop advance the dest pb to the next line.
                    // OK, so what is the dest line skip in bytes????

                    const dest_line_wrap_num_skip_bits = (w_dest - w_source);
                    const dest_line_wrap_num_skip_bytes = dest_line_wrap_num_skip_bits >>> 3;

                    // and then is the number of bytes divisible by 8????

                    // What is the 'shift to right when writing' bits offset?
                    //   Or shift to left?
                    //    It could depend on where the space is available, if it comes to it.

                    // Do want to identify the contiguous 64 bit chunks in the dest?
                    //   Though it is tricky because of misalignment.

                    // For every read value, need to know where and what type of shift to do.
                    //   Shift in from right, keeping the existing bits on the left.

                    //   Shift in from the left, keeping the existing bits on the right.

                    // And need to know how the values that get read are to be split in the destination.
                    //   Each of the reads in the realigned write will be split to be written in 2 separate values.
                    //     So probably need to use 'or' logic quite a lot, at least when writing the second one.
                    //       But at start and end, its as though the first or second parts of that chunk are already in place.


                    // So calculate which 2 64 bit values are to be written to.
                    //   maybe have pos1 and pos2, increment them together, pos2 always up by 1.





                    // And we will have a write_bit_index too????

                    //  Or just keep track what the offsets are from....
                    //    And handle jumps at the ends of the rows.

                    // This does look like it could wind up being a very fast algorithm.





                    

                    // then do the line jumps of both at the ends of the lines....






                    // Should not need to be byte aligned??? 64 bit aligned?


                    if (dest_line_wrap_num_skip_bytes % 8 === 0) {

                        // We can use this.
                        const dest_line_wrap_num_skip_64s = dest_line_wrap_num_skip_bytes >>> 3;
                        //   seems easy enough then, that's the number that get skipped at the end of each line....


                        let wpos_64_1 = (dest_pos[1] * pb_dest.size[0] + dest_pos[0]) >>> 6;
                        let wpos_64_2 = wpos_64_1 + 1;


                        const px_offset_to_right_within_pos1 = BigInt((dest_pos[1] * pb_dest.size[0] + dest_pos[0]) % 64);

                        const px_offset_to_right_within_pos2 = BigInt(64n - px_offset_to_right_within_pos1);
                        // Though here there is a kind of 'remapping' going on.
                        //   Iterating a cursor through may be easiest...
                        //     Though some multiplications can be really fast.


                        // So having a dest start pointer would make sense....

                        for (let source_y = 0; source_y < h_source; source_y++) {
                            // Then iterate through the items in that row....


                            for (let source_x = 0; source_x < w_source; source_x++) {
                                // Then iterate through the items in that row....

                                if (bit_index === 0) {
                                    const read_64_bit_value = sta64[rpos_64++];
                                    //console.log('read_64_bit_value', read_64_bit_value);


                                    // And make 2 values out of it...???
                                    //   But need to apply mask differently....
                                    //     Get left side of it as 1 64 bit int, the right side as the other.

                                    // so shift the left of it to the right?????
                                    //    get rid of the part on the right to start with???


                                    //const offset_from_right????


                                    // But we want the left side from the source in the right side of the dest???
                                    //   No, in left side of dest, but on the right of it.


                                    // Need to keep the first part of what has been read.
                                    const left_side_64 = read_64_bit_value >> px_offset_to_right_within_pos1;



                                    const right_side_64 = read_64_bit_value << px_offset_to_right_within_pos2;


                                    //const left_side_64 = ((read_64_bit_value >> px_offset_to_right_within_pos1) << px_offset_to_right_within_pos1) >> px_offset_to_right_within_pos2 ;
                                    ///const right_side_64 = ((read_64_bit_value << px_offset_to_right_within_pos1) >> px_offset_to_right_within_pos1) << px_offset_to_right_within_pos1;

                                    //const right_side_64 = ((read_64_bit_value << px_offset_to_right_within_pos1) >> px_offset_to_right_within_pos1) << px_offset_to_right_within_pos2 ;

                                    // or write it as an 'and'???

                                    // do need to apply it as an 'and' I think.
                                    ///   or really 'replace'?
                                    // write it as an 'or'?


                                    // So need to write the left side of it in place....
                                    //   But it's on the right.
                                    //    OR it with what's already there - except we need to remove the parts of 'already there'.


                                    const already_there_on_left = (dta64[wpos_64_1] >> px_offset_to_right_within_pos1) << px_offset_to_right_within_pos1;

                                    const already_there_on_right = (dta64[wpos_64_2] << px_offset_to_right_within_pos2) >> px_offset_to_right_within_pos2;


                                    // Then an 'and' operation I think.

                                    //   Shouldn't be too tricky to write it!!!!



                                    //  then apply an 'or' to what's on the left.



                                    const l_64 = already_there_on_left | left_side_64;
                                    const r_64 = already_there_on_right | right_side_64;


                                    dta64[wpos_64_1] = l_64;
                                    dta64[wpos_64_2] = r_64;

                                    
                                    

                                    // px_offset_to_right_within_pos2


                                    // write it....

                                    // What is the byte offset (to the right) within the first write pos?


                                    wpos_64_1++;
                                    wpos_64_2++;





                                    // Then, at this point, we write it appropriately.

                                }
                                

                                //const read_64_bit_value = sta64[rpos_64++];
                                //  then see about how to put that value into the dest, and how much of it, how to shift it.

                                //   likely seems that it will need to go into 2 different destination 64 bit blocks as well.
                                //      Needs to leave pixels outside its draw area unchanged.


                                bit_index++;
                                if (bit_index === 64) bit_index = 0;
                                //  But then when it gets set back to 0???


                                



                                
            
            
                            }

                            wpos_64_1 += dest_line_wrap_num_skip_64s;
                            wpos_64_2 += dest_line_wrap_num_skip_64s;



                        }







                    } else {
                        console.trace();
                        throw 'Alignment issue'
                    }







                    


                }

            }

            */


            //first_attempt_shifting_writes();


            // Read 2 at once, split....
            //   But definitely looks better to set the source.





            // Work out the bit alignments and realignments???


            // For now, go through the source.

            // source width / 64
            //   and the remainder too....

            

            // May be easiest here to use the full sized typed array that covers the whole of the dest image.
            //   Prob will make calculations easier / more standard.

            

            








        }


        // a byte-realigned copy...
        //   So where it can be done if a typed array is made that starts on a different byte.





        // Do want to make and test the 64 bit aligned writing.

        // fully aligned 64 bit????
        //   same size, same shape, a very direct set of operations.

        // To a dest_pos that is divisible by 8

        // Maybe make a pixel_index number.

        const test_can_do_aligned_64_bit = () => (this.bits_per_row % 64 === 0 && this.bits_per_row >= 64) && 
            (dest_pos[1] * pb_1bipp_mask.size[0] + dest_pos[0]) % 64 === 0 &&
            pb_1bipp_mask.bits_per_row % 64 === 0 && pb_1bipp_mask.bits_per_row >= 64;


        const test_can_do_bit_realigned_64_bit = () => (this.bits_per_row % 64 === 0 && this.bits_per_row >= 64) && 
        
        pb_1bipp_mask.bits_per_row % 64 === 0 && pb_1bipp_mask.bits_per_row >= 64;


        // But a realigned 64 bit copy...
        //   Depending on how much realignment would need to be done....

        // Finding how things are out of line when it comes to doing the 64 bit operations.





        




        // approach_selecting

        const approach_selecting = () => {

            //let can_do_aligned_64_bit = test_can_do_aligned_64_bit();

            //let can_do_aligned_64_bit = false;

            // And the realigned version...
            //   row width does have to be divisible by 64 on both source and dest
            //   can realign left?right? however many pixels.

            // Maybe create some kind of shifted / realigned pattern first?





            /*

            const res_64_bit_alignment_test = test_aligned_64bit();
            //console.log('res_64_bit_alignment_test', res_64_bit_alignment_test);
            if (res_64_bit_alignment_test.pass === true) {
                can_do_aligned_64_bit = true;
            }
                */

            // A test to see what is possible....


            //if (can_do_aligned_64_bit) {

                //console.log('doing aligned 64 bit assignement');
            //    return aligned_64_bit_implementation();

            //} else 
            {

                // But it will only work in some cases.
                //   May need to increase row lengths to make it possible.
                //     Both for the source and the dest.





                const can_do_bit_realigned_64_bit = test_can_do_bit_realigned_64_bit();
                if (can_do_bit_realigned_64_bit) {

                    // So do that realigned 64 bit operation...
                    //   Need to work out how many bytes and in which direction things will need to shift.
                    //     What is the pixel index?
                    //     What is the byte index?
                    //       What is the remainder?

                    return arr_on_xspans_implementation();

                    //return bit_realigned_64_bit_implementation();
                    //console.log('should do byte realigned 64 bit assignment');
                } else {
                    return arr_on_xspans_implementation();
                }
                
            }

            // 


        }
        return approach_selecting();

        //return arr_on_xspans_implementation();
    }

    'draw_1bipp_pixel_buffer_mask'(pb_1bipp_mask, dest_pos, color) {

        const {bipp} = this;

        if (bipp === 1) {
            return this.draw_1bipp_pixel_buffer_mask_1bipp(pb_1bipp_mask, dest_pos, color);
        } else {
            const arr_on_xspans_implementation = () => {

                // Getting it as an arr_rows_arr_x_on_spans representation using a class could help.
                //   Or the 'other representaion' type class.
    
    
                const arr_rows_arr_on_xspans = pb_1bipp_mask.calculate_arr_rows_arr_x_on_spans_1bipp();
                const [width, height] = pb_1bipp_mask.size;
    
                let y = 0;
                let [dest_x, dest_y] = dest_pos;
                for (y = 0; y < height; y++) {
                    const arr_row_xspans_on = arr_rows_arr_on_xspans[y];
                    if (arr_row_xspans_on.length > 0) {
                        for (const xonspan of arr_row_xspans_on) {
                            xonspan[0] += dest_x;
                            xonspan[1] += dest_x;
                            this.draw_horizontal_line(xonspan, y + dest_y, color);
                        }
                    }
                }
    
                
                
            }
            return arr_on_xspans_implementation();
        }



        // This could wind up being used on a low level by many different functions.



        /*
        const iterate_set_pixel_implementation = () => {
            console.log('  iterate_set_pixel_implementation');
            const pb_source = pb_1bipp_mask;
            const ta_pos = new Int16Array(2);
            const ta_px_value = new Uint8ClampedArray(3);
            const ta_info = new Uint32Array(4);
            const px_dest_pos = new Uint16Array(2);
            const {bipp} = this;
            if (bipp === 1) {
                pb_source.each_px_on_1bipp(ta_pos, ta_px_value, ta_info, (mask_px_color, pos) => {
                    px_dest_pos[0] = pos[0] + dest_pos[0];
                    px_dest_pos[1] = pos[1] + dest_pos[1];
                    this.set_pixel_on_1bipp(px_dest_pos);
                });
            } else {
                pb_source.each_px_on_1bipp(ta_pos, ta_px_value, ta_info, (mask_px_color, pos) => {
                    px_dest_pos[0] = pos[0] + dest_pos[0];
                    px_dest_pos[1] = pos[1] + dest_pos[1];
                    this.set_pixel(px_dest_pos, color);
                });
            }
        }
        */

        // Looks like a different alternative representation could work well.

        //   May also want to explore customised loading of methods.
        //     As in, different classes that will be called on to do specific algorithms, or do something that can be done with a variety of algorithms.


        // Getting a representation of it that will be as fast as possible to draw.
        //   Some kind of color toggle spans over wrapping scans could be very fast indeed in many cases.
        //     Maybe creating it within a scratch ta as well.

        // And then some color toggle span lengths or similar with some kind of extra row alignment?
        //   The wrapping could / would be different in some cases, so could draw them back to a pb by drawing horizontal lines
        //     over the destination lines, and ceasing the line at the end in cases where the color span wraps to the next line,
        //     and beginning it (again) on the next line in the destination image at the appropriate space.



        // simple implementation....
        //   iterate the pixels in the pixel buffer, setting them in the destination.

        // or read line by line, maintain both read and dest coords....

    /*

        const basic_implementation = () => {
            let mask_x = 0, mask_y = 0, [x, y] = dest_pos;
            const [mask_w, mask_h] = pb_1bipp_mask.size;
            const x_line_start_value = x;
            // But could have a 1 bipp version too...

            const {bits_per_pixel} = this;

            if (bits_per_pixel === 1) {
                for (mask_y = 0; mask_y < mask_h; mask_y++) {
                    x = x_line_start_value;
                    for (mask_x = 0; mask_x < mask_w; mask_x++) {
                        if (pb_1bipp_mask.get_pixel_1bipp([mask_x, mask_y]) === 1) {
                            this.set_pixel_1bipp([x, y], color);
                        }
                        x++;
                        //this.set_pixel
                    }
                    y++;
                }
            } else {
                for (mask_y = 0; mask_y < mask_h; mask_y++) {
                    x = x_line_start_value;
                    for (mask_x = 0; mask_x < mask_w; mask_x++) {
                        if (pb_1bipp_mask.get_pixel_1bipp([mask_x, mask_y]) === 1) {
                            this.set_pixel([x, y], color);
                        }
                        x++;
                        //this.set_pixel
                    }
                    y++;
                }
            }

            
        }

        return basic_implementation();
        
    */





        // Could also make another parallel implementation that gets these spans, by rows, into a typed array.
        //   Even using a scratch typed array.
        //     If we have a decent amount of scratch space we can use that.

        // Also worth looking into using a 64 bit typed array.
        //   Could have that alongside the normal one.
        //     An invarient could be that a typed array length is a multiple of 64.

        // Definitely want to get into these high efficiency modes.
        //   Being able to do aligned 64 bit operations would probably help a lot with speed.

        // Creating some data structures / representations with the correct alignments to work quickly.

        //   And each row length being a multiple of 64 bits.
        //     Bit-shifting whole rows.
        //       Or copying / applying rows with a bitshift done while applying.

        // Doing a direct, aligned or realigned write using binary operation in some cases, rather than representing as the line spans.


        // A pixel_buffer option for auto-padding the rows to be a multiple of 64 bits long?
        //   Though that would change some row calculations.
        

        // auto_ta_8_byte_aligned_length

        // start using .bits_per_row



        // Try direct aligned write???



        // But 64 bit long rows...
        //   And when it aligns regarding 64 bit placing...
        // Direct correspondance between the 64 bit typed arrays when it comes to pixel positions (as in offsets are multiples of 64)

        // Planning type calculations to determine if it can be done in the most rapid way, then what steps could be taken to get it to that
        //   state and then do it.


        // The 'write as 




        
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




    // number of 64 bit segments per 64 bit divisible image




    // and then if it's exactly 64 bits per row....

    // would be worth having optimisations for some fairly small shapes like 64x64. Maybe 64x16 and 64x32???
    //   Could use some very specific optimisations to check some things in some specific smaller arrangements, like 8x64.
    //     Lower level ways to determine x-spans.

    // X-span toggle positions, reading them very quickly....
    //   A table that looks at 2 bytes at a time may well be the best.
    // Though checking 64 bytes at a time for all 0s or 1s could help.
    




    // 256x256 sized images could be processed really fast.
    //   want to make this work well when painting and filling lots of small polygons.
    //     high detail things.


    // iterate the ui32 locations, values, and the xored (right?) shifted 32 bit values....


    
    // Need to iterate the shifted values.

    // Or be able to save these shifted values to a (buffer) ta.

    // iterate the locations, values, shifted values (horizontal edges).



    // iterate the rows' x spans....
    //   can we iterate this per row?



    // iterate the shifted rows?

    //   Iterating per row would make sense....






    

    
    
}
module.exports = Pixel_Buffer_Core_Masks;