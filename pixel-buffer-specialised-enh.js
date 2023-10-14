const Pixel_Buffer_Perf_Focus_Enh = require('./pixel-buffer-perf-focus-enh');


let {resize_ta_colorspace, copy_rect_to_same_size_8bipp, copy_rect_to_same_size_24bipp, dest_aligned_copy_rect_1to4bypp} = require('./ta-math');

class Pixel_Buffer_Specialised_Enh extends Pixel_Buffer_Perf_Focus_Enh {
    constructor(...a) {
        super(...a);






        const bounds_within_source = new Int16Array(4);
        // Using shorthand method names (ES2015 feature).
        Object.defineProperty(this, 'bounds_within_source', {
            // This is equivalent to:
            // get: function() { return bValue; },
            // set: function(newValue) { bValue = newValue; },

            // Refer to pos_center_within_this...
            //  

            get() {

                //console.trace();
                //throw 'rename this function to something more specific.'

                const size = this.size;
                const pos = this.pos;
                bounds_within_source[0] = pos[0];
                bounds_within_source[1] = pos[1];
                bounds_within_source[2] = pos[0] + size[0];
                bounds_within_source[3] = pos[1] + size[1];
                return bounds_within_source;
            },
            /*
            set(value) {

                
            },*/
            enumerable: true,
            configurable: false
        });

        //  Use the size and pos to calculate this.

        const size_bounds = new Int16Array(4);
        Object.defineProperty(this, 'size_bounds', {
            get() {
                const size = this.size;
                //console.log('size', size);
                size_bounds[0] = 0;
                size_bounds[1] = 0;
                size_bounds[2] = size[0];
                size_bounds[3] = size[1];
                return size_bounds;
            },
            enumerable: true,
            configurable: false
        });

        let pb_source;
        // use window_movement_bounds
        //  understand the positioning (restrictions?) of the movement of the window within the source.

        // Maybe make this in the specialised subclass?
        //  Or a subclass to do with sources / windows etc.
        //  Have not been focusing on these features recently, the don't feel like part of the core any longer.



        Object.defineProperty(this, 'source', {
            get() { return pb_source; },
            set(value) {
                // Were we given a Int16Array? Similar?
                //  set own pos ta values from the value.

                pb_source = value;
            },
            enumerable: true,
            configurable: false
        });
    }


    // More standardised / understandable / understood iteration and bounds data in local tas.



    // ** reconsider function / rethink api.
    //  won't need such complexity...
    //   will use simpler (and more performant?) function in ta_math.
    //    will be C++ accelerated before very long too.


    // Works quite quick... investigate optimizations further.

    // Will need to pay more attention to 'source'.
    //  Using other pbs as a parameter may work better in many cases.
    //  It's a more complex API when one pb links to another.

    copy_from_source() {

        // It's faster now that it uses the dest aligned copy from ta_math.

        const bipp = this.bipp;
        // Having this inline may well be best.
        //  This does a row_copy algorithm.

        // Worth trying and benchmarking a version that operates differently, using an external function that's based around the maths, takes tas as params.
        
        // Source does not exactly seem core...
        
        const pb_source = this.source;
        const ta_source = pb_source.ta;
        const ta = this.ta;

        // use a scratch ta for the bounds of the copy within the source.
        //  attempted source bounds!
        //const ta_source_bounds = this.ta_bounds_scratch;

        //console.log('ta_source_bounds', ta_source_bounds);

        //console.log('this.bounds_within_source', this.bounds_within_source);


        const my_bounds = this.bounds_within_source;
        const source_size_bounds = pb_source.size_bounds;
        if (bipp === 1) {
            console.trace();
            throw 'NYI';
        } else if (bipp === 8 || bipp === 24 || bipp === 32) {

            // This kind of code could go in a core optimised implementation rather than reference implementation.


            dest_aligned_copy_rect_1to4bypp(ta_source, ta, pb_source.bytes_per_row, this.bytes_per_pixel, ta_math.overlapping_bounds(my_bounds, source_size_bounds));
        } else {
            console.trace();
            throw 'stop';
        }
    }



    threshold_gs(value) {
        // iterate all pixels...
        // better to make a copy of it.
        let res = this.clone();
        //console.log('threshold_gs this.bytes_per_pixel', this.bytes_per_pixel);
        if (this.bytes_per_pixel === 1) {

            /*
            this.each_pixel((x, y, v, i) => {
                //console.log('x, y, v, i', x, y, v, i);
                if (v >= value) {
                    res.set_pixel(x, y, 255);
                } else {
                    res.set_pixel(x, y, 0);
                }
            });
            */

            this.each_pixel((pos, color) => {
                //console.log('x, y, v, i', x, y, v, i);
                if (color >= value) {
                    // should accept pos....
                    //  or set_px being shorter.


                    res.set_pixel(pos[0], pos[1], 255);
                } else {
                    res.set_pixel(pos[0], pos[1], 0);
                }
            });

        }
        return res;
    }

    padded_each_pixel_index(padding, cb) {
        const ta_32_scratch = new Uint32Array(9);
        ta_32_scratch[0] = this.bytes_per_pixel;
        ta_32_scratch[1] = 0; // i
        ta_32_scratch[2] = this.size[0] - padding;
        ta_32_scratch[3] = this.size[1] - padding;

        ta_32_scratch[7] = this.size[0];
        //ta_32_scratch[8] = 
        // 4 = x
        // 5 = y
        //let y, x, i;
        // a px typed array... could give actual access to that typed array / view.
        //const w = this.size[0],
        //    h = this.size[1];
        //const buf = this.buffer;
        const bpp = this.bits_per_pixel;

        if (bpp === 32) {
            ((cb) => {
                for (ta_32_scratch[5] = padding; ta_32_scratch[5] < ta_32_scratch[3]; ta_32_scratch[5]++) {
                    for (ta_32_scratch[4] = 0; ta_32_scratch[4] < ta_32_scratch[2]; ta_32_scratch[4]++) {
                        //ta_32_scratch[1] = (ta_32_scratch[5] * this.size[0] + ta_32_scratch[4]) * ta_32_scratch[0];
                        cb((ta_32_scratch[5] * ta_32_scratch[7] + ta_32_scratch[4]) * ta_32_scratch[0]);
                        //ta_32_scratch[1] += 4;
                    }
                }
            })(cb);
        } else if (bpp === 24) {
            ((cb) => {
                for (ta_32_scratch[5] = padding; ta_32_scratch[5] < ta_32_scratch[3]; ta_32_scratch[5]++) {
                    for (ta_32_scratch[4] = 0; ta_32_scratch[4] < ta_32_scratch[2]; ta_32_scratch[4]++) {
                        //ta_32_scratch[1] = (ta_32_scratch[5] * this.size[0] + ta_32_scratch[4]) * ta_32_scratch[0];
                        cb((ta_32_scratch[5] * ta_32_scratch[7] + ta_32_scratch[4]) * ta_32_scratch[0]);
                        //ta_32_scratch[1] += 3;
                    }
                }
            })(cb);
        } else if (bpp === 8) {
            ((cb) => {
                for (ta_32_scratch[5] = padding; ta_32_scratch[5] < ta_32_scratch[3]; ta_32_scratch[5]++) {
                    for (ta_32_scratch[4] = 0; ta_32_scratch[4] < ta_32_scratch[2]; ta_32_scratch[4]++) {
                        cb((ta_32_scratch[5] * ta_32_scratch[7] + ta_32_scratch[4]) * ta_32_scratch[0]);
                        //ta_32_scratch[1] += 1;
                    }
                }
            })(cb);
        } else {
            console.trace();
            throw 'NYI';
        }
    }


    new_window(options) {
        //const {size} = options;
        //console.log('pb .new_window options', options);
        options.window_to = this;
        const res = new this.constructor(options);
        // automatic copy_from when it's constructed?
        res.copy_from_source();
        return res;
    }

    new_centered_window(size_or_options) {

        console.trace();
        throw 'NYI';

        // size given as number...
        //  worth looking at args sig???

        const t1 = tf(size_or_options);
        console.log('t1', t1);
        let size;

        if (t1 === 'a') {

            if (size_or_options.length === 2) {
                size = new Int16Array([size_or_options, size_or_options]);
            } else {
                console.log('size_or_options', size_or_options);
                console.trace();
                throw 'Size array expected length: 2';
            }

        } else if (t1 === 'n') {
            size = new Int16Array([size_or_options, size_or_options]);
        } else {
            console.trace();
            throw 'NYI';
        }

        const res_pb = new this.constructor({
            size: size,
            bits_per_pixel: this.bits_per_pixel,
            window_to: this
        });

    }



    // Could use internally set iteration / movement bounds.

    // Consider internal bounds and external bounds.
    //  Possible 2 or 3 properties of each.



    // May be better with parameters?
    //  also, this would be useful within ta-math.
    //   Operations would be fastest with direct ta access.


    // Likely to be brought to ta paint?
    //  However, may want this one v optimized at low level here?


    // Likely to change to ta math function. Maybe within the painter object.

    // Likely would be better to use parameters?
    //  Unless we could have a faster parameterless system.
    //  Data would be set onto typed arrays and accessed from there.
    //  Not so sure when it would be significantly faster.




    fill_solid_rect_by_bounds() {


        const bounds = this.ta_bounds;
        const bipp = this.bipp;
        if (bipp === 24) {

            const rgb = this.ta_rgb;

            //console.log('bounds', bounds);
            //console.log('rgb', rgb);


            // However, don't want the full row as scratch.
            //  Maybe better to create a new ta const here of the right size of the row of the data we are writing.

            // Could compare direct byte writing through iteration with row write iteration.
            //  Writing whole rows where possible definitely seems fastest in overview. In practise some less used functions in JS would be less optimized when compiled (JIT).

            // Does look like getting and using a bounds / byte iterator looks best here.
            //  byte index of the first pixel in the bounds
            //   byte width of the bounds

            const bytes_per_bounds_row = (bounds[2] - bounds[0]) * this.bypp;
            // bypbr - bytes per bounds row
            //console.log('bytes_per_bounds_row', bytes_per_bounds_row);

            // then can create a new temporary solid_row ta
            const solid_row = new Uint8ClampedArray(bytes_per_bounds_row);
            // fill it withthe pixels...
            // alternate rgb

            let cc = 0;

            for (let c = 0; c < bytes_per_bounds_row; c++) {
                solid_row[c] = rgb[cc];

                cc++;
                if (cc === 3) cc = 0;
            }
            //console.log('solid_row', solid_row);
            // then do the row-based iteration.
            //  will be simple usage of ta set(other_ta, offset)

            let write_byte_idx = bounds[0] * this.bypp + bounds[1] * this.bypr;
            //console.log('write_byte_idx', write_byte_idx);

            // then repeat through the rows in the bounds....
            //  advance the write_byte_idx by a row (this.bypr) each time.

            // Not so sure how fast row setting is.
            for (let i_row = bounds[1]; i_row < bounds[3]; i_row++) {
                this.ta.set(solid_row, write_byte_idx);

                write_byte_idx += this.bypr;
            }

        } else {
            console.trace();
            throw 'NYI';
        }
    }

    calc_source_target_valid_bounds_overlap() {

        const source = this.source;
        const my_bounds = this.bounds_within_source;


        const source_size_bounds = source.size_bounds;

        // first bounds scratch?
        //  valid_corresponding_bounds scratch?

        const res = this.ta_bounds_scratch;
        if (my_bounds[0] < source_size_bounds[0]) {
            res[0] = source_size_bounds[0];
        } else {
            res[0] = my_bounds[0];
        }
        if (my_bounds[1] < source_size_bounds[1]) {
            res[1] = source_size_bounds[1];
        } else {
            res[1] = my_bounds[1];
        }
        if (my_bounds[2] > source_size_bounds[2]) {
            res[2] = source_size_bounds[2];
        } else {
            res[2] = my_bounds[2];
        }
        if (my_bounds[3] > source_size_bounds[3]) {
            res[3] = source_size_bounds[3];
        } else {
            res[3] = my_bounds[3];
        }

        return res;

    }



    copy_rect_by_bounds_to_24bipp(ta_bounds, pb_target) {

        console.trace();
        throw 'NYI';

        const pos = this.ta_pos_scratch;
        // ta_size_scratch?
        //  could also be efficient and clear for storage of data during the running of an algorithm.

        // and a bounds scratch too?

        // various scratch tas could be effective for quickly running various algorithms.
        //  want the fastest JS perf, then port to C++ for faster perf still.

        // loop within the bounds...

        // worth calculating the size from the bounds as well.

        const rect_size = this.ta_size_scratch;


        rect_size[0] = ta_bounds[2] - ta_bounds[0];
        rect_size[1] = ta_bounds[3] - ta_bounds[1];
        //rect_size[0] = 1 + ta_bounds[2] - ta_bounds[0];
        //rect_size[1] = 1 + ta_bounds[3] - ta_bounds[1];


        console.log('rect_size', rect_size);

        // check that the rect size matches the target size.
        //  if so, got an optimized algorithm for it.

        // for loop of pos within the ta_bounds
        //  easy enough to loop between both of them

        // Maybe have a read byte pointer on the target?
        //  target.ta_pointers_scratch
        //   get 4? sized Uint32 array? Use that for a variety of numbers / variables / pointers in the inner working of a function?

        // these scratch objects will enable very fast operations by avoiding having to allocate more memory at many points in time.

        // .ta_further?

        // a pointers scratch would be useful?
        //  allowing up to 4 Uint32s to be stored...  8 bytes of memory isnt so bad.

        // pointers scratch?
        //  the pixel read position...?
        //   could do some clever incrementing of this value as well, when chaning row.

        // maybe a local variable is just fine / more efficient anyway?

        const ta_pointers = this.ta_pointers_scratch;

        // 0: byte index of pixel within source

        // and use a scratch from the target as well...
        // write position target pointer

        // got to make this very fast indeed in JS.

        const ta_target_pointers = pb_target.ta_pointers_scratch;

        console.log('ta_pointers', ta_pointers);
        console.log('ta_target_pointers', ta_target_pointers);

        // then can easily use the pointers for the byte positions.
        //  set the byte position of both of them according to the top left position as given by the bounds.
        //   maybe pointers are more important than calculating x, y positions?
        //    if we can bypass x and y (storage / calc?) and use the pointer positions we may be at an advantage?

        console.log('pos', pos);

        console.log('ta_bounds', ta_bounds);

        // get a bounds scratch as well.
        //  4 int16 values (accepts negatives).

        // use these ta ... scratch properties for the moment.

        // need to go through the image space from the source pb.

        const ta = this.ta;
        const ta_target = pb_target.ta;

        console.log('pb_target.pos', pb_target.pos);
        // The target pos should have been set up separately / automatially before?




        // const ta_adjusted_safe_bounds = this.ta_bounds_scratch
        // const ta_bounds_adjustment = this.ta_offset_scratch  (size 4)

        // using data stored in specific typed arrays will help process it quickly.
        //  




        // Using a few / plenty of scratch tas could help to keep the code from declaring new variables.



        // 


        // beginning the target pointer at the position of the beginning of the bounds...

        //  will need to check for x/y out of bounds errors anyway.
        //   likely need to do that with every pixel anyway?
        //    when reading from the source image...?
        //   or pre-calculate which are out of bounds, pre-fill with the out of bounds color, then process the area that's in bounds.
        //    that does seem like the fastest method with the fewest tests that need to be done on a per-pixel basis.
        //     and adjust the write positions?

        // Seems like doing this in a rather longwinded way does make sense.
        //  Want the fewest operations poss, done in a simple way (in general).

        // Finding the boundaries of the area that is within the source image bounds.
        //  Know what the offset between the given boundaries and allowed boundaries is.
        //  Only copy pixels within safe boundaries, to their positions within the safe boundaries.


        // Adjusted bounds, but then put into a slightly different position?
        //  As in when it's out of bounds, it just does not copy.

        // Do a for loop using the adjusted bounds.
        // These adjusted bounds will only cover a safe area of the image.

        // Bounds adjustments, also using these scratch tas, make sense.
        //  sometimes will need very fast copying between Pixel_Buffers.

        // do a bound adjusted copy.

        // safe bounds limits...
        //  then the bounds themselves...
        //  a secondary bounds scratch?

        // calculations on typed arrays would be of use too.
        //  both optimized and functional.





        const ta_safe_bounds_limits = this.ta_bounds_scratch;
        ta_safe_bounds_limits[0] = 0;
        ta_safe_bounds_limits[1] = 0;
        ta_safe_bounds_limits[2] = this.size[0];
        ta_safe_bounds_limits[3] = this.size[1];




        const ta_safe_adjusted_bounds = this.ta_bounds2_scratch;

        const ta_bounds_adjustments = this.ta_bounds3_scratch;

        // and a third bounds scratch ta for the adjustment values?
        //  do we need these for dealing with indexes?

        const ta_bounds_byte_offsets = this.ta_bounds3_scratch;




        // bounds adjustments values (x) needed for setting the index at the beginning of each row.


        //ta_safe_adjusted_bounds = 

        if (ta_bounds[0] >= ta_safe_bounds_limits[0]) {
            ta_safe_adjusted_bounds[0] = ta_bounds[0];
            ta_bounds_adjustments[0] = 0;
        } else {
            ta_bounds_adjustments[0] = ta_safe_bounds_limits[0] - ta_bounds[0];
            ta_safe_adjusted_bounds[0] = ta_safe_bounds_limits[0];
        }
        if (ta_bounds[1] >= ta_safe_bounds_limits[1]) {
            ta_safe_adjusted_bounds[1] = ta_bounds[1];
            ta_bounds_adjustments[1] = 0;
        } else {
            ta_bounds_adjustments[1] = ta_safe_bounds_limits[1] - ta_bounds[1];
            ta_safe_adjusted_bounds[1] = ta_safe_bounds_limits[1];
        }
        if (ta_bounds[2] <= ta_safe_bounds_limits[2]) {
            ta_safe_adjusted_bounds[2] = ta_bounds[2];
            ta_bounds_adjustments[2] = 0;
        } else {
            ta_bounds_adjustments[2] = ta_safe_bounds_limits[2] - ta_bounds[2];
            ta_safe_adjusted_bounds[2] = ta_safe_bounds_limits[2];
        }
        if (ta_bounds[3] <= ta_safe_bounds_limits[3]) {
            ta_safe_adjusted_bounds[3] = ta_bounds[3];
            ta_bounds_adjustments[3] = 0;
        } else {
            ta_bounds_adjustments[3] = ta_safe_bounds_limits[3] - ta_bounds[3];
            ta_safe_adjusted_bounds[3] = ta_safe_bounds_limits[3];
        }

        console.log('ta_safe_adjusted_bounds', ta_safe_adjusted_bounds);


        // Need to be specific about which offsets are used where.
        //  Will need to try different cases too.

        // A more efficient bits_per_pixel storage / getter?
        //  ta_bpp with both bipp and bypp
        //   and facade functions to access it.

        // Want to get this optimized to the fullest.


        // module level scratch as well?
        //  careful about multithreading then....




        console.log('ta_bounds_adjustments', ta_bounds_adjustments);

        // lets use a pixel read index in one of the tas.
        //  keep that up to date with each pixel?
        //   probably can do set from the row.

        // and update the write pixel location pointer too.
        //  will be able to set whole rows.
        //   not quite sure how fast that will be.

        // will work out the indexes of the start and end of each row from the source image.
        //  will use ta.set


        // bytes_per_row


        // use pointers ta for number of bytes per row.

        // source image bytes_per_row
        console.log('this.bytes_per_row', this.bytes_per_row);

        const source_bytes_per_row = this.bytes_per_row;
        const bypp = this.bypp;

        // the offset from the end of one row read from the source (according to the bounds) to the beginning of the next row to read from the source

        // byte offsets of bounds...

        // read byte offsets?
        //  source read byte offsets?


        // but what are these for?


        // want to calculate the start position of the first source byte to read.
        //  use the ta_safe_adjusted_bounds
        //   safe_adjusted_bounds_pixel_indexes?
        //    and they are pixel indexes based on the source image.

        // but also row widths in number of bytes.
        //  target.bytes_per_row
        

        // But most likely we want the read coords to be right at the top left.
        //  We do want to start at 0,0 on the source image, with the bounds system limiting how far right and down it reads to start with.

        // For the moment, it seems we need to get into more detail about what specific areas will be mapped,
        //  what indexes apply, and importantly what index increments apply when moving from pixel to pixel and then to the next row.

        // For loops mapping the target pixel to read.
        //  For the moment, use of scratch tas for these internal things will be best.

        // Maybe better to loop through the in-bounds pixels of the source pb.
        //  copy them to the target pb.

        // keeping track of variables is one of the most important things to get this working efficiently on a low level.



        // Seems worth redoing this in a focused way after all this writing....
        //  Could sum it up in a few parts.

        // 1) Calculate the in-bounds region (px) of the source image
        //     calculate its corresponding region (px) on the target image

        // 2) Calculate the row byte length of the in-bounds region

        //  source image - how many bytes to jump to the beginning of the next in-bound row.
        //  dest image - no row skip needed ??? (for the moment)

        //  offset of the beginning of each row (from the bounds) when reading from the source.

        // the y-dest-row-loop may work best?
        //  could try some different loop functions.
        //   easiest first and compare results.

        // Try the syncronised pointer update loop.

        // looping over dest_y.

        // the whole of the dest is within bounds?
        //  no, some of it may be referring to some out-of-bounds part of the source.

        // so loop over the dest rows that are within bounds.

        // ta_dest_area_within_source_safe_bounds
        //  so the bounds on the dest that match up with safe areas of the source.














        const adjusted_safe_bounds_source_read_byte_offsets = this.ta_offsets_scratch;
        adjusted_safe_bounds_source_read_byte_offsets[0] = ta_bounds_adjustments[0] * bypp;
        adjusted_safe_bounds_source_read_byte_offsets[1] = ta_bounds_adjustments[1] * source_bytes_per_row;
        adjusted_safe_bounds_source_read_byte_offsets[2] = ta_bounds_adjustments[2] * bypp;
        adjusted_safe_bounds_source_read_byte_offsets[3] = ta_bounds_adjustments[3] * source_bytes_per_row;

        console.log('adjusted_safe_bounds_source_read_byte_offsets', adjusted_safe_bounds_source_read_byte_offsets);



        const adjusted_safe_bounds_target_write_byte_offsets = pb_target.ta_offsets_scratch;
        // and the write offset...







        // And the safe bounds write offsets too.

        // Seems worth having all of this put into tas.
        //  Many functions seem to use a few structures which hold various forms of numbers for similar kinds of things. Can standardise and provent memory alloc / realloc.




        // loop through the rows that appear in the safe bounds
        //  calculate the byte indexes of the beginning and ends of each row?


        // Addition only may be faster.
        //  Try the algo only with increments.

        // Set up the start and end points of the first row, both reading and writing.

        // would be a pointer pair for each of them.

        const ta_pp_source_read = this.ta_pointerpair_scratch;
        const ta_pp_target_write = pb_target.ta_pointerpair_scratch;

        // then set these up before each line copy.

        

        // so can make pb_target.bytes_per_row the read width...


        //const row_byte_length = 

        // But only doing the safe copy.

        // May be best to set up and do the safe copy, row by row.
        //  But going by what's getting copied into the target pb, meaning leaving out anything that would be out of bounds there, or come from an out of bounds place in the source.

        // A moving window of some sort, set up with tas?


        // Maybe need to precompute some more values.

        // The bytes per row of the safe boundary range.

        const bytes_per_row_of_safe_bounds = (ta_safe_adjusted_bounds[2] - ta_safe_adjusted_bounds[0]) * bypp;

        console.log('bytes_per_row_of_safe_bounds', bytes_per_row_of_safe_bounds);


        ta_pp_source_read[0] = adjusted_safe_bounds_source_read_byte_offsets[0] + adjusted_safe_bounds_source_read_byte_offsets[1];
        // need to set it to a number that's within bounds of the source image.
        ta_pp_source_read[1] = ta_pp_source_read[0] + bytes_per_row_of_safe_bounds;




        ta_pp_target_write[0] = 0; // no, it's the left indent of the safe bounds.
        ta_pp_target_write[1] = ta_pp_target_write[0] + bytes_per_row_of_safe_bounds;


        console.log('ta_pp_source_read', ta_pp_source_read);
        console.log('ta_pp_target_write', ta_pp_target_write);

        // need to update this by the write offset...
        //  and maybe need some offset precalculation in bytes, for the target, with the bounds (safe adjusted bounds in use).
        //   need that to have accurate write positions.



        // A getter for bytes_per_row would be useful.



        console.log('pb_target.bytes_per_row', pb_target.bytes_per_row);

        // and then the number of rows to copy...
        //  will be able to iterate the pointers and do ta.set quite neatly.

        const num_rows_to_copy = ta_safe_adjusted_bounds[3] - ta_safe_adjusted_bounds[1];
        console.log('num_rows_to_copy', num_rows_to_copy);

        // Have a simple local variable to count the row number?
        //  Use incrementation to update the byte index values.

        for (let c = 0; c < num_rows_to_copy; c++) {
            // copy the row...

            // could set using a slice of the source...
            // or subarray.

            // .set using an offset and a subarray should work OK.

            // maybe pixel for loop would be faster anyway.

            const sa_source_row = ta.subarray(ta_pp_source_read[0], ta_pp_source_read[1]);
            console.log('sa_source_row', sa_source_row);







            //ta_target.set()


            // increment the pointers to point to the next row...


        }











        


        // .ta_bounds_info...
        //  larger ta that includes space for bounds intersection and safety options and info?


        

        //ta_pp_source_read[1] = ta_pp_source_read[0] + 





        // the source read 

        








        // ta_bounds_adjustments...
        //  but really need to go within / loop within the calculated safe bounds.

        // should be easy enough to loop through the in-range rows in the target image.
        //  ta_safe_adjusted_bounds

        // actually have the pos of the target set accurately to reflect its center point?
        //  it would be -2, -2 at size 5.










        // setup both the pointers for write and the pointers for read.



        // use another ta to hold the read row byte index bounds
        //  and another for the write row byte index bounds.

        // ta_pointerpair_scratch?
        //  just 2 of them makes more sense.



        // then work out the standard start and end points of the row in the data from the source???
        //  or we have the offsets to the start point already? the 0,0 point?

        // using a smallish bunch of named const typed scratch typed arrays makes sense here.

        // do the copying row by row.
        //  only think we need the y position. to be iterated?
        //   and work out the byte index variables, do the copying.
        //    optimized copying designed around the data structures.

        // the 4 points of the bounds in terms of pixel indexes would be useful
        //  or v edge values really, or lt, rb
        // with these we can do the row copy algorithm quickly.

        // probably best to do this using source and dest / dest and source byte indexes
        //  could use translations between them.

        // need to have the maths to do it for rows, or even better, whole blocks of rows, ie the necessary 2d image.

        // using byte array pointers for pixels may well speed operations up.
        //  its a lower level than coords.



        // have ta values available for the read and write byte pointers.
        //  row read pointer pair
        //  row write pointer pair

        // both pointer ranges - 2 pointers, sequential.

        // pointers here basically being array indexes.

        // uint32










        //  safe adjusted bounds byte offsets...
        //   can get another bounds scratch...?

        // These small scratch objects will work well with SIMD in the future.
        //  Working out the byte offsets from the different edges will be useful.

        // will use this.get_byte_index_from_pos_24bipp
        //  and other convenience / fast function.
        // Then could inline them.

        // functions that set a value to an existing typed array
        //   could be faster? give it the ta and the idx.

        // update_ta_with_px_byte_idx(ta, ta_idx, pos)

        // could work quickly that way.

        // would be worth testing different versions with different micro-optimizations.

        // ? row length of extraction in bytes

        // [0]: row beginning (source) byte index
        // [1]: row ending (source) byte index
        //ta_pointers[0] = 

        // copy it from the source row by row.

        
        // then calc what the safe bounds are...

        // safe bounds come from size of this....
        // min is 0, 0, max is w, h
        //  possibly by using quite a lot of ta variables things can work really fast.
        //  or more specific function calling...?


        // use the adjusted bounds.
        //  and have the write index take into account necessary bounds adjustments.

        // Hopefully this function can still run very quickly indeed.
        //  Copy within the bounds
        //  Keep the read and write pointers both up-to-date, and use them



        // go within the safe adjusted bounds.

        for (pos[1] = ta_bounds[1]; pos[1] < ta_bounds[3]; pos[1]++) {
            // row start... worth setting the read byte pointer to the start of the row.
            //ta_pointers[0] = 



            // read the pixels in the row...


            //  worth setting 
            // row complete...
        }


        // Can easily and quickly use pos as the core of the iteration?
        //  Then calculate the edges with pos and ta_bounds


        if (rect_size[0] === pb_target.size[0] && rect_size[1] === pb_target.size[1]) {
            // optimized...
            //  call a separate function?
            //  _24bipp_target_same_size?

            //  probably not needed for the moment...?
            //   smaller code paths result in more optimizations.

            console.log('rect_size matches target size.')



        }
    }

    'count_row_on_xspans_1bipp'(y) {
        let res = 0;
        const width = this.size[0];
        // assume starting with 0;
        let last_color = 1;
        let current_color;
        let ta_pos = new Uint16Array(2);
        ta_pos[1] = y;
        for (let x = 0; x < width; x++) {
            ta_pos[0] = x;
            //console.log('ta_pos', ta_pos);
            current_color = this.get_pixel_1bipp(ta_pos);
            //console.log('current_color', current_color);
            if (current_color === 1) {
                if (current_color === last_color) {
                    if (res === 0) {
                        res++;
                    } else {
                    }
                } else {
                    //res.push([x, x]);
                    res++;
                }
            }
            last_color = current_color;
        }
        return res;
    }

    'calculate_ta_row_x_off_x2ygbspans_1bipp'(y) {

        // Typed array for all of them in the row.

        // Need to count them first?
        //  Is that quicker???

        const count_xoffspans = this.count_row_off_xspans_1bipp(y);

        const res = new Uint16Array(count_xoffspans * 5);

        console.log('count_xoffspans', count_xoffspans);

        let i_w = 0;

        const width = this.size[0];
            // assume starting with 0;
        let last_color = 0;
        let current_color;
        let ta_pos = new Uint16Array(2);
        ta_pos[1] = y;

        // need to work out the start and end position of the x spans off.

        //console.log('width', width);

        for (let x = 0; x < width; x++) {
            ta_pos[0] = x;
            current_color = this.get_pixel_1bipp(ta_pos);

            // Not all that efficient at representing single pixel gaps.
            //  But there won't be very many of them overall in some large drawings with thin polygon edges.

            if (current_color === 0) {
                if (current_color === last_color) {
                    if (res.length === 0) {
                        //res.push([x, x]);

                        // x1, x2, y, g, b
                        res[i_w++] = x;
                        res[i_w++] = x;
                        res[i_w++] = y;
                        res[i_w++] = 0; // 0 for undefined group here....
                        res[i_w++] = 0; // 0 for undefined border status here

                    } else {
                        //res[res.length - 1][1]++;

                        res[i_w - 4]++;
                    }
                } else {
                    //res.push([x, x]);
                    res[i_w++] = x;
                    res[i_w++] = x;
                    res[i_w++] = y;
                    res[i_w++] = 0; // 0 for undefined group here....
                    res[i_w++] = 0; // 0 for undefined border status here
                    
                }
            }
            last_color = current_color;
        }

        return res;


        // Could see about accelerated algorithms that will read 8 (or more) pixels at once.
        //  May be worth doing first check on 64 pixels if they are all lined up so that can be done.

        // With an Array_Reader or something similar like that, whatever it's called.
        // Array_Buffer_Reader? Data_Reader???

        // beware that the rows don't necessarily start on a new byte.
        // need to be careful about that unless they are in byte aligned mode.
        // may be worth considering 8byte aligned mode for rows. Would make algorithms using bigint considerably easier / more efficient.

        // For the moment, deal with the rows as they are within the system (dense 1bipp data)


        const old = () => {
            const res = [];
            const width = this.size[0];
            // assume starting with 0;
            let last_color = 0;
            let current_color;
            let ta_pos = new Uint16Array(2);
            ta_pos[1] = y;

            // need to work out the start and end position of the x spans off.

            //console.log('width', width);

            for (let x = 0; x < width; x++) {
                ta_pos[0] = x;
                current_color = this.get_pixel_1bipp(ta_pos);

                // Not all that efficient at representing single pixel gaps.
                //  But there won't be very many of them overall in some large drawings with thin polygon edges.

                if (current_color === 0) {
                    if (current_color === last_color) {
                        if (res.length === 0) {
                            res.push([x, x]);
                        } else {
                            res[res.length - 1][1]++;
                        }
                    } else {
                        res.push([x, x]);
                        if (res.length === 0) {
                            //throw 'stop';
                            //res.push([0, 0]); // a span of length 0
                            //res.push([0, 1]);
                        } else {

                            // No item in result for non-0 pixels

                            //res.push([x, x + 1]);
                        }
                    }
                }
                last_color = current_color;
            }
        }

        
        return res;
    }

    // Have optimised this a lot, but making a version that iterates through the spans in a row could work better.
    'calculate_arr_row_x_off_spans_1bipp'(y) {

        // Def worth looking into further low level optimisations.

        // Sped up reading of many 1s or 0s at once.
        // 64 bit at once
        // Then if not 64 bits at once, run other checks.
        //  A binary search to find the number of consecutive 1s or 0s...
        //  Could do a few at once from the beginning???
        //   Though being able to detect something like 64 or 32 consecutive same bits will be helpful.




        // Could see about accelerated algorithms that will read 8 (or more) pixels at once.
        //  May be worth doing first check on 64 pixels if they are all lined up so that can be done.

        // With an Array_Reader or something similar like that, whatever it's called.
        // Array_Buffer_Reader? Data_Reader???

        // beware that the rows don't necessarily start on a new byte.
        // need to be careful about that unless they are in byte aligned mode.
        // may be worth considering 8byte aligned mode for rows. Would make algorithms using bigint considerably easier / more efficient.

        // For the moment, deal with the rows as they are within the system (dense 1bipp data)

        // It may be possible to speed this up a lot....

        // Could inline the pixel getting. (1st simple optimisation) - It's a good speedup!
        //  That would mean keeping track of the byte and bit....
        //   Could use a simpler incrementer for idx rather than recalculating it.

        const inlined_get_pixel_implementation = () => {
            const res = [];
            const width = this.size[0];
            const {ta} = this;
            let last_color = 0;
            let current_color;
            const x_start = 0;
            let idx_bit_overall = ((y * this.size[0]) + x_start) | 0, idx_byte = 0 | 0;
            let arr_last;
            for (let x = 0; x < width; x++) {
                idx_byte = idx_bit_overall >> 3;
                current_color = ((ta[idx_byte] & 128 >> (idx_bit_overall & 0b111)) !== 0) ? 1 : 0;
                //current_color = ((ta[idx_byte] & 128 >> (idx_bit_overall & 0b111)) !== 0) ? 1 | 0 : 0 | 0;

                if (current_color === 0) {
                    if (current_color === last_color) {
                        if (res.length === 0) {
                            arr_last = [x, x];
                            res.push(arr_last);
                        } else {
                            arr_last[1]++;
                        }
                    } else {
                        arr_last = [x, x];
                        res.push(arr_last);
                    }
                }
                last_color = current_color;
                idx_bit_overall++;
            }
            return res;
        }

        // And a version that iterates through the bit indexes but not x???
        // Version that does not have a code block for each x value would help support logic where there may be multiple pixel values
        //  obtained at once for sequential x values. For that reason, an inlined version similar to inlined_get_pixel_implementation that
        //  does not loop x would help. It could / would increment x when appropriate.
        //   x is effectively incrementing bits anyway...


        // This turns out to be a decent speedup on larger images.
        //  Still, the reading of multiple pixels (up to 64) at once will prove very useful.

        // Should be able to make a much faster implementation this way.

        const inlined_get_pixel_no_x_loop_implementation = () => {
            const res = [];
            const width = this.size[0];
            const {ta} = this;
            let last_color = 0;
            let current_color;
            const x_start = 0;


            // idx_byte_start
            // idx_bit_start
            // idx_bit_within_byte_start



            let idx_bit_overall = ((y * this.size[0]) + x_start) | 0;
            let arr_last;

            // idx_bit_within_byte could prove a useful variable.
            //  when it is 0, we can check the full byte, and could detect 8 (or maybe more) consecutive values.




            


            let num_bits_remaining = width;


            // Loop and increment bits...

            let x = 0; // an x local value is fine - will update it as necessary

            // Could keep the ta byte value local....
            //  Could maybe speed it up a little.
            //  Could make some code clearer too.
            //  Processing 8 bits at once may be relatively easy....
            //  Maybe even 64.
            //  May be worth just dealing with the 8 bit and 64 bit cases. Could be the essence of the fast algorithm.

            // If there are more than 8 bits remaining...?




            while (num_bits_remaining > 0) {

                // Can attempt to read multiple bits at once....
                //  Act differently if the bit position is divible by 8?
                //   Could check for whole byte, and process appropriately.
                //    Need to react to the color shifts over the byte boundary.
                //  Act differently if the bit position is divisible by 64?
                //   Could read the whole 64 bit bigint.
                //    Then local processing of that would likely be faster, regardless of whether it's all 1s or all 0s.

                //idx_byte = idx_bit_overall >> 3;
                current_color = ((ta[idx_bit_overall >> 3] & 128 >> (idx_bit_overall & 0b111)) !== 0) ? 1 : 0;
                //current_color = ((ta[idx_byte] & 128 >> (idx_bit_overall & 0b111)) !== 0) ? 1 | 0 : 0 | 0;

                if (current_color === 0) {
                    if (current_color === last_color) {
                        if (res.length === 0) {
                            arr_last = [x, x];
                            res.push(arr_last);
                        } else {
                            arr_last[1]++;
                        }
                    } else {
                        arr_last = [x, x];
                        res.push(arr_last);
                    }
                }
                last_color = current_color;
                idx_bit_overall++;
                x++;
                num_bits_remaining--;
            }



            



            return res;
        }


        // Very nice speedup with this implementation.
        //  Could see about faster horizontal line drawing.
        //  Not (yet) got into typed arrays for holding the xspans.

        const inlined_consecutive_value_checking_no_x_loop_implementation = () => {
            const res = [];
            const width = this.size[0];
            const {ta} = this;
            let last_color = 0;
            let current_color;
            const x_start = 0;


            // idx_byte_start
            // idx_bit_start
            // idx_bit_within_byte_start

            let idx_bit_overall = ((y * this.size[0]) + x_start) | 0, idx_bit_within_byte = 0 | 0;


            let arr_last;

            // idx_bit_within_byte could prove a useful variable.
            //  when it is 0, we can check the full byte, and could detect 8 (or maybe more) consecutive values.


            let num_bits_remaining = width;


            // Loop and increment bits...

            let x = 0; // an x local value is fine - will update it as necessary

            // Could keep the ta byte value local....
            //  Could maybe speed it up a little.
            //  Could make some code clearer too.
            //  Processing 8 bits at once may be relatively easy....
            //  Maybe even 64.
            //  May be worth just dealing with the 8 bit and 64 bit cases. Could be the essence of the fast algorithm.

            // If there are more than 8 bits remaining...?


            let has_just_done_multi_read = false;

            let byte_val = 0 | 0;

            // change it to arr_current....
            //  and only add it once shifting to a new color or ending the line.

            let arr_current;


            while (num_bits_remaining > 0) {

                // Can attempt to read multiple bits at once....
                //  Act differently if the bit position is divible by 8?
                //   Could check for whole byte, and process appropriately.
                //    Need to react to the color shifts over the byte boundary.
                //  Act differently if the bit position is divisible by 64?
                //   Could read the whole 64 bit bigint.
                //    Then local processing of that would likely be faster, regardless of whether it's all 1s or all 0s.



                idx_bit_within_byte = idx_bit_overall & 0b111;


                // then check if we can do just a few of the consecutive reading ops....

                has_just_done_multi_read = false;


                if (idx_bit_within_byte === 0 && num_bits_remaining >= 8) {
                    // Attempt a multi-read here.
                    //  And probably use 'else' for other cases....
                    //   or set it so it's doing a multi-read and not the next part?
                    //    because it may need to stop / not do the multi-read and get on with the next part...

                    byte_val = ta[idx_bit_overall >> 3];
                    if (byte_val === 255) {
                        // read 8x1 values...
                        last_color = 1;
                        has_just_done_multi_read = true;
                        idx_bit_overall += 8;
                        x += 8;
                        num_bits_remaining -= 8;

                    } else if (byte_val === 0) {
                        if (last_color === 0) {
                            //last_color = 1;
                            if (res.length === 0) {

                                // And don't push it until complete...
                                //  Will work better for porting

                                arr_last = [x, x + 7];
                                res.push(arr_last);
                            } else {
                                arr_last[1] += 8;
                            }
                        } else {
                            // A shift, so make a new array item.

                            arr_last = [x, x + 7];
                            res.push(arr_last);
                            
                            
                        }
                        x += 8;
                        last_color = 0;
                        num_bits_remaining -= 8;
                        idx_bit_overall += 8;
                        has_just_done_multi_read = true;

                    } else {
                        // No multi read this time.
                    }

                    // set has_just_done_multi_read to true if necessary.

                }

                if (!has_just_done_multi_read) {
                    //idx_byte = idx_bit_overall >> 3;
                    current_color = ((ta[idx_bit_overall >> 3] & 128 >> (idx_bit_within_byte)) !== 0) ? 1 : 0;
                    //current_color = ((ta[idx_byte] & 128 >> (idx_bit_overall & 0b111)) !== 0) ? 1 | 0 : 0 | 0;

                    if (current_color === 0) {
                        if (current_color === last_color) {
                            if (res.length === 0) {
                                arr_last = [x, x];
                                res.push(arr_last);
                            } else {
                                arr_last[1]++;
                            }
                        } else {
                            arr_last = [x, x];
                            res.push(arr_last);
                        }
                    }
                    last_color = current_color;
                    idx_bit_overall++;
                    x++;
                    num_bits_remaining--;
                }
            }

            return res;
        }

        // Want a version ready to be made into an iterator...
        //  Don't want to push into the array as soon as the item is available.
        //  Only push into the array when a new one is created?
        //   And then the last one too (if there is one)

        // Really fast algorithms that iterate through typed arrays for processing x spans would help a lot.
        //  


        // The later push implementation would be a decent overall framework for a generator function.
        
        // byte aligned or 8 byte aligned rows would help a lot to make some operations as fast as possible.




        const inlined_consecutive_value_checking_no_x_loop_later_push_implementation = () => {
            const res = [];
            const width = this.size[0];
            const {ta} = this;
            let last_color = 0;
            let current_color;
            const x_start = 0;


            // idx_byte_start
            // idx_bit_start
            // idx_bit_within_byte_start

            let idx_bit_overall = ((y * this.size[0]) + x_start) | 0, idx_bit_within_byte = 0 | 0;


            let arr_last;

            // idx_bit_within_byte could prove a useful variable.
            //  when it is 0, we can check the full byte, and could detect 8 (or maybe more) consecutive values.


            let num_bits_remaining = width;


            // Loop and increment bits...

            let x = 0; // an x local value is fine - will update it as necessary

            // Could keep the ta byte value local....
            //  Could maybe speed it up a little.
            //  Could make some code clearer too.
            //  Processing 8 bits at once may be relatively easy....
            //  Maybe even 64.
            //  May be worth just dealing with the 8 bit and 64 bit cases. Could be the essence of the fast algorithm.

            // If there are more than 8 bits remaining...?


            let has_just_done_multi_read = false;

            let byte_val = 0 | 0;

            // change it to arr_current....
            //  and only add it once shifting to a new color or ending the line.

            //let arr_current;


            while (num_bits_remaining > 0) {

                // Can attempt to read multiple bits at once....
                //  Act differently if the bit position is divible by 8?
                //   Could check for whole byte, and process appropriately.
                //    Need to react to the color shifts over the byte boundary.
                //  Act differently if the bit position is divisible by 64?
                //   Could read the whole 64 bit bigint.
                //    Then local processing of that would likely be faster, regardless of whether it's all 1s or all 0s.



                idx_bit_within_byte = idx_bit_overall & 0b111;


                // then check if we can do just a few of the consecutive reading ops....

                has_just_done_multi_read = false;


                if (idx_bit_within_byte === 0 && num_bits_remaining >= 8) {
                    // Attempt a multi-read here.
                    //  And probably use 'else' for other cases....
                    //   or set it so it's doing a multi-read and not the next part?
                    //    because it may need to stop / not do the multi-read and get on with the next part...

                    byte_val = ta[idx_bit_overall >> 3];
                    if (byte_val === 255) {
                        // read 8x1 values...
                        last_color = 1;
                        has_just_done_multi_read = true;
                        idx_bit_overall += 8;
                        x += 8;
                        num_bits_remaining -= 8;

                    } else if (byte_val === 0) {
                        if (last_color === 0) {
                            //last_color = 1;
                            if (res.length === 0) {

                                // And don't push it until complete...
                                //  Will work better for porting

                                if (arr_last) res.push(arr_last);

                                arr_last = [x, x + 7];
                                //res.push(arr_last);
                            } else {
                                arr_last[1] += 8;
                            }
                        } else {
                            // A shift, so make a new array item.

                            if (arr_last) res.push(arr_last);
                            arr_last = [x, x + 7];
                            //res.push(arr_last);
                            
                            
                        }
                        x += 8;
                        last_color = 0;
                        num_bits_remaining -= 8;
                        idx_bit_overall += 8;
                        has_just_done_multi_read = true;

                    } else {
                        // No multi read this time.
                    }

                    // set has_just_done_multi_read to true if necessary.

                }

                if (!has_just_done_multi_read) {
                    //idx_byte = idx_bit_overall >> 3;
                    current_color = ((ta[idx_bit_overall >> 3] & 128 >> (idx_bit_within_byte)) !== 0) ? 1 : 0;
                    //current_color = ((ta[idx_byte] & 128 >> (idx_bit_overall & 0b111)) !== 0) ? 1 | 0 : 0 | 0;

                    if (current_color === 0) {
                        if (current_color === last_color) {
                            if (res.length === 0) {
                                if (arr_last) res.push(arr_last);
                                arr_last = [x, x];
                                //res.push(arr_last);
                            } else {
                                arr_last[1]++;
                            }
                        } else {
                            if (arr_last) res.push(arr_last);
                            arr_last = [x, x];
                            //res.push(arr_last);
                        }
                    }
                    last_color = current_color;
                    idx_bit_overall++;
                    x++;
                    num_bits_remaining--;
                }
            }

            if (arr_last) res.push(arr_last);

            return res;
        }


        // Make a 'later push' version.
        // Should be relatively simple.
        


        

        



        

        // A reference implementation that builds arr_current rather than arr_last?
        //  Would only push arr_current once it's complete (ie shifted over to color 1)

        // And what about using a typed array?

        // With a generator function, reusing a typed array could be quicker....

        
        const reference_implementation_later_push = () => {
            const res = [];
            const width = this.size[0];
            // assume starting with 0; ???
            let last_color = 0;
            let current_color;
            let ta_pos = new Uint16Array(2);
            ta_pos[1] = y;

            // need to work out the start and end position of the x spans off.

            //console.log('width', width);

            // Maybe this slows it down....
            let arr_last; // Seems like it should probably help.
            //  Maybe last_x1, last_x2 perhaps???

            for (let x = 0; x < width; x++) {
                ta_pos[0] = x;


                current_color = this.get_pixel_1bipp(ta_pos);


                if (current_color === 0) {
                    if (current_color === last_color) {
                        if (res.length === 0) {

                            if (arr_last) {
                                res.push(arr_last);
                                //arr_last = undefined;
                            }
                            arr_last = [x, x];
                            //res.push(arr_last);


                            //res.push([x, x]);
                        } else {
                            //console.log('arr_last', arr_last);


                            //res[res.length - 1][1]++;
                            arr_last[1]++;
                        }
                    } else {

                        if (arr_last) {
                            res.push(arr_last);
                            //arr_last = undefined;
                        }
                        

                        arr_last = [x, x];
                        //res.push(arr_last);
                        //res.push([x, x]);
                    }
                }
                last_color = current_color;
            }

            if (arr_last) {
                res.push(arr_last);
                //arr_last = undefined;
            }

            return res;
        }


        const reference_implementation = () => {
            const res = [];
            const width = this.size[0];
            // assume starting with 0;
            let last_color = 0;
            let current_color;
            let ta_pos = new Uint16Array(2);
            ta_pos[1] = y;

            // need to work out the start and end position of the x spans off.

            //console.log('width', width);

            // Maybe this slows it down....
            let arr_last; // Seems like it should probably help.
            //  Maybe last_x1, last_x2 perhaps???

            for (let x = 0; x < width; x++) {
                ta_pos[0] = x;


                current_color = this.get_pixel_1bipp(ta_pos);

                // Not all that efficient at representing single pixel gaps.
                //  But there won't be very many of them overall in some large drawings with thin polygon edges.
                if (current_color === 0) {
                    if (current_color === last_color) {
                        if (res.length === 0) {
                            arr_last = [x, x];
                            res.push(arr_last);
                            //res.push([x, x]);
                        } else {
                            //res[res.length - 1][1]++;
                            arr_last[1]++;
                        }
                    } else {
                        arr_last = [x, x];
                        res.push(arr_last);
                        //res.push([x, x]);
                    }
                }
                last_color = current_color;
            }
            return res;
        }

        //return reference_implementation();

        // inlined_consecutive_value_checking_no_x_loop_implementation

        // The later push implementation is just a little bit slower.
        //  Maybe making a generator function would be much quicker?
        //  Should be a decent amount quicker when all we want is iteration.





        return inlined_consecutive_value_checking_no_x_loop_later_push_implementation();

        //return reference_implementation_later_push();
        //return inlined_consecutive_value_checking_no_x_loop_implementation();


        // inlined_get_pixel_no_x_loop_implementation
        //return inlined_get_pixel_no_x_loop_implementation();
        //return inlined_get_pixel_implementation();

        // inlined_get_pixel_implementation






        
    }

    'calculate_arr_rows_arr_x_off_spans_1bipp'() {
        const [width, height] = this.size;
        const res = new Array(height);

        //const {calculate_arr_row_x_off_spans_1bipp} = this;
        // And each of them should be an array....

        // Call the function to calculate arr_row_x_off_spans for each row (y position)

        for (let y = 0; y < height; y++) {
            res[y] = this.calculate_arr_row_x_off_spans_1bipp(y);

            // Calling it like below removes the 'this' context.
            //res[y] = calculate_arr_row_x_off_spans_1bipp(y);
        }

        return res;

    }

    'calculate_arr_rows_arr_x_on_spans_1bipp'() {
        const [width, height] = this.size;
        const res = new Array(height);

        //const {calculate_arr_row_x_off_spans_1bipp} = this;
        // And each of them should be an array....

        // Call the function to calculate arr_row_x_off_spans for each row (y position)

        for (let y = 0; y < height; y++) {
            res[y] = this.calculate_arr_row_x_on_spans_1bipp(y);

            // Calling it like below removes the 'this' context.
            //res[y] = calculate_arr_row_x_off_spans_1bipp(y);
        }

        return res;

    }

    'count_row_off_xspans_1bipp'(y) {
        let res = 0;

        const width = this.size[0];
        // assume starting with 0;
        let last_color = 0;
        let current_color;
        let ta_pos = new Uint16Array(2);
        ta_pos[1] = y;

        // need to work out the start and end position of the x spans off.

        //console.log('width', width);

        // iterate row pixels?
        //  Could there be a system that reads them faster?



        for (let x = 0; x < width; x++) {
            ta_pos[0] = x;
            current_color = this.get_pixel_1bipp(ta_pos);

            // Not all that efficient at representing single pixel gaps.
            //  But there won't be very many of them overall in some large drawings with thin polygon edges.

            if (current_color === 0) {
                if (current_color === last_color) {
                    if (res.length === 0) {
                        //res.push([x, x]);

                        res++;
                    } else {
                        //res[res.length - 1][1]++;
                    }
                } else {
                    //res.push([x, x]);
                    res++;
                    if (res.length === 0) {
                        //throw 'stop';
                        //res.push([0, 0]); // a span of length 0
                        //res.push([0, 1]);
                    } else {

                        // No item in result for non-0 pixels

                        //res.push([x, x + 1]);
                    }
                }
            }
            last_color = current_color;
        }
        return res;

    }


    'calculate_ta_row_x_on_x2ygbspans_1bipp'(y) {
        const count_xonspans = this.count_row_on_xspans_1bipp(y);
        // Will make better examination of lines.
        //  An iterator / generator function that yields the horizontal spans.

        // Can make a faster / more optimised line reader.
        //  Can also work on arranging 8-byte alignments of rows.
        //   So each row would start on a byte that's divisible by 8.

        // Already have a decent speed improvement from using the xspans for the flood fills.
        //  Creating the x spans with an improved byte / multibyte reading alforithm will help a lot.

        // Not quite there for the vfff very fast flood fill algorithm.






        const res = new Uint16Array(count_xonspans * 5);

        console.log('y, count_xonspans', y, count_xonspans);

        let i_w = 0;

        const width = this.size[0];
            // assume starting with 1;
        let last_color = 1;
        let current_color;
        let ta_pos = new Uint16Array(2);
        ta_pos[1] = y;

        // need to work out the start and end position of the x spans off.

        //console.log('width', width);

        for (let x = 0; x < width; x++) {
            ta_pos[0] = x;
            current_color = this.get_pixel_1bipp(ta_pos);

            // Not all that efficient at representing single pixel gaps.
            //  But there won't be very many of them overall in some large drawings with thin polygon edges.

            if (current_color === 1) {
                if (current_color === last_color) {
                    if (res.length === 0) {
                        //res.push([x, x]);

                        // x1, x2, y, g, b
                        res[i_w++] = x;
                        res[i_w++] = x;
                        res[i_w++] = y;
                        res[i_w++] = 0; // 0 for undefined group here....
                        res[i_w++] = 0; // 0 for undefined border status here

                    } else {
                        //res[res.length - 1][1]++;

                        res[i_w - 4]++;
                    }
                } else {
                    //res.push([x, x]);
                    res[i_w++] = x;
                    res[i_w++] = x;
                    res[i_w++] = y;
                    res[i_w++] = 0; // 0 for undefined group here....
                    res[i_w++] = 0; // 0 for undefined border status here
                    
                }
            }
            last_color = current_color;
        }

        return res;
    }

    // Want the x on version(s) too.
    //  Maybe even all in one large typed array.

    // May want x ons / x offs / x spans represented in a fast ta as part of the core.
    //  Or the core to use a class that does that well.

    



    'calculate_arr_rows_ta_x_off_x2ygbspans_1bipp'() {

        // x2ygb items in a typed array....

        const [width, height] = this.size;
        const res = new Array(height);

        //const {calculate_arr_row_x_off_spans_1bipp} = this;
        // And each of them should be an array....

        // Call the function to calculate arr_row_x_off_spans for each row (y position)

        for (let y = 0; y < height; y++) {
            res[y] = this.calculate_ta_row_x_off_x2ygbspans_1bipp(y);

            // Calling it like below removes the 'this' context.
            //res[y] = calculate_arr_row_x_off_spans_1bipp(y);
        }
        return res;
    }


    // Could make a 'core-new-features' class perhaps?



    // Probably should not be in the core.

    'calculate_arr_rows_ta_x_on_x2ygbspans_1bipp'() {

        // x2ygb items in a typed array....

        const [width, height] = this.size;
        const res = new Array(height);

        //const {calculate_arr_row_x_off_spans_1bipp} = this;
        // And each of them should be an array....

        // Call the function to calculate arr_row_x_off_spans for each row (y position)

        for (let y = 0; y < height; y++) {
            res[y] = this.calculate_ta_row_x_on_x2ygbspans_1bipp(y);

            // Calling it like below removes the 'this' context.
            //res[y] = calculate_arr_row_x_off_spans_1bipp(y);
        }

        console.log('* this.ta', this.ta);
        console.log('this.size', this.size);
        return res;
    }



    'calculate_arr_row_x_on_spans_1bipp'(y) {

        // Will try other implementations.
        //  The inline no x loop consecutive reader would be nice.
        //   May also be worth seeing about reading 64 bytes at once in some cases.
        //    (maybe keeping track of a 64 bit piece and moving through it)

        // Need to compare and test implementations.




        const initial_implementation = () => {

                const res = [];
            const width = this.size[0];
            // assume starting with 0;
            let last_color = 1;
            let current_color;
            let ta_pos = new Uint16Array(2);
            ta_pos[1] = y;

            // need to work out the start and end position of the x spans off.

            //console.log('width', width);

            for (let x = 0; x < width; x++) {
                ta_pos[0] = x;
                current_color = this.get_pixel_1bipp(ta_pos);
                //console.log('current_color', current_color);
                // Not all that efficient at representing single pixel gaps.
                //  But there won't be very many of them overall in some large drawings with thin polygon edges.
                if (current_color === 1) {
                    if (current_color === last_color) {
                        if (res.length === 0) {
                            res.push([x, x]);
                        } else {
                            res[res.length - 1][1]++;
                        }
                    } else {
                        res.push([x, x]);
                    }
                }
                last_color = current_color;
            }

            //console.log('**res', res);
            return res;
        }


        // Try a 64 bit at once read too.
        //  Not sure about trying it every byte?
        //   May be worth it though.

        const _64x0 = BigInt(0);
        const _64x1 = ~_64x0;


        const broken_64bit_optimisation_attempt_inlined_consecutive_value_checking_no_x_loop_implementation = () => {

            const COLOR_LOOKING_FOR = 1;
            const COLOR_NOT_LOOKING_FOR = 0;


            const res = [];
            const width = this.size[0];
            const {ta} = this;

            const ab = ta.buffer;
            const dv = new DataView(ab);

            // Starting at the color not looking for...?
            //  Would be a change. Maybe it's better logic.
            //  Maybe try a modified 'off' version using consts for looking for and not looking for.

            let last_color = 1; // Try keeping it for the moment.
            let current_color;
            const x_start = 0;


            // idx_byte_start
            // idx_bit_start
            // idx_bit_within_byte_start

            let idx_bit_overall = ((y * this.size[0]) + x_start) | 0, idx_bit_within_byte = 0 | 0;
            let arr_last;

            // idx_bit_within_byte could prove a useful variable.
            //  when it is 0, we can check the full byte, and could detect 8 (or maybe more) consecutive values.


            let num_bits_remaining = width;


            // Loop and increment bits...

            let x = 0; // an x local value is fine - will update it as necessary

            // Could keep the ta byte value local....
            //  Could maybe speed it up a little.
            //  Could make some code clearer too.
            //  Processing 8 bits at once may be relatively easy....
            //  Maybe even 64.
            //  May be worth just dealing with the 8 bit and 64 bit cases. Could be the essence of the fast algorithm.

            // If there are more than 8 bits remaining...?


            let has_just_done_multi_read = false;
            let byte_val = 0 | 0;

            let _8_byte_val = BigInt(0);



            while (num_bits_remaining > 0) {

                // Can attempt to read multiple bits at once....
                //  Act differently if the bit position is divible by 8?
                //   Could check for whole byte, and process appropriately.
                //    Need to react to the color shifts over the byte boundary.
                //  Act differently if the bit position is divisible by 64?
                //   Could read the whole 64 bit bigint.
                //    Then local processing of that would likely be faster, regardless of whether it's all 1s or all 0s.



                idx_bit_within_byte = idx_bit_overall & 0b111;


                // then check if we can do just a few of the consecutive reading ops....

                has_just_done_multi_read = false;


                // Not sure how much faster 64 bits at once (in a bigint) would be.

                // 



                if (idx_bit_within_byte === 0 && num_bits_remaining >= 8) {


                    if (num_bits_remaining >= 64) {

                        _8_byte_val = dv.getBigInt64(idx_bit_overall >> 3);

                        if (_8_byte_val === _64x0) {

                            last_color = 0;
                            has_just_done_multi_read = true;
                            idx_bit_overall += 64;
                            x += 64;
                            num_bits_remaining -= 64;

                        } else if (_8_byte_val === _64x1) {

                            if (last_color === 1) {
                            
                                //last_color = 1;
                                if (res.length === 0) {
                                    arr_last = [x, x + 63];
                                    res.push(arr_last);
                                } else {
                                    arr_last[1] += 64;
                                }
    
    
    
                            } else {
                                // A shift, so make a new array item.
    
                                arr_last = [x, x + 63];
                                res.push(arr_last);
                                
                                
                            }
                            x += 8;
                            last_color = 1;
                            num_bits_remaining -= 64;
                            idx_bit_overall += 64;
                            has_just_done_multi_read = true;

                        }





                    } else {

                    }


                    if (!has_just_done_multi_read) {


                        // Attempt a multi-read here.
                        //  And probably use 'else' for other cases....
                        //   or set it so it's doing a multi-read and not the next part?
                        //    because it may need to stop / not do the multi-read and get on with the next part...

                        byte_val = ta[idx_bit_overall >> 3];
                        if (byte_val === 255) {

                            // read 8x1 values...

                            // COLOR_NOT_LOOKING_FOR

                            // But we are looking for this...

                            if (last_color === 1) {
                                
                                //last_color = 1;
                                if (res.length === 0) {
                                    arr_last = [x, x + 7];
                                    res.push(arr_last);
                                } else {
                                    arr_last[1] += 8;
                                }



                            } else {
                                // A shift, so make a new array item.

                                arr_last = [x, x + 7];
                                res.push(arr_last);
                                
                                
                            }
                            x += 8;
                            last_color = 1;
                            num_bits_remaining -= 8;
                            idx_bit_overall += 8;
                            has_just_done_multi_read = true;
                            

                        } else if (byte_val === 0) {

                            last_color = 0;
                            has_just_done_multi_read = true;
                            idx_bit_overall += 8;
                            x += 8;
                            num_bits_remaining -= 8;

                            

                        } else {
                            // No multi read this time.
                        }


                    }



                    

                    // set has_just_done_multi_read to true if necessary.

                }

                if (!has_just_done_multi_read) {
                    //idx_byte = idx_bit_overall >> 3;
                    current_color = ((ta[idx_bit_overall >> 3] & 128 >> (idx_bit_within_byte)) !== 0) ? 1 : 0;
                    //current_color = ((ta[idx_byte] & 128 >> (idx_bit_overall & 0b111)) !== 0) ? 1 | 0 : 0 | 0;

                    if (current_color === 1) {
                        if (current_color === last_color) {
                            if (res.length === 0) {
                                arr_last = [x, x];
                                res.push(arr_last);
                            } else {
                                arr_last[1]++;
                            }
                        } else {
                            arr_last = [x, x];
                            res.push(arr_last);
                        }
                    }
                    last_color = current_color;
                    idx_bit_overall++;
                    x++;
                    num_bits_remaining--;
                }
            }
            return res;
        }


        // An iterator could be really useful.
        //  In some cases, only want to iterate through these rather than needing the whole array.

        // Need a version more suitable to be an iterator. A version that delays the pushing of the xspan to the array.


        const inlined_consecutive_value_checking_no_x_loop_implementation = () => {

            const COLOR_LOOKING_FOR = 1;
            const COLOR_NOT_LOOKING_FOR = 0;


            const res = [];
            const width = this.size[0];
            const {ta} = this;

            const ab = ta.buffer;
            const dv = new DataView(ab);

            // Starting at the color not looking for...?
            //  Would be a change. Maybe it's better logic.
            //  Maybe try a modified 'off' version using consts for looking for and not looking for.

            let last_color = 1; // Try keeping it for the moment.
            let current_color;
            const x_start = 0;


            // idx_byte_start
            // idx_bit_start
            // idx_bit_within_byte_start

            let idx_bit_overall = ((y * this.size[0]) + x_start) | 0, idx_bit_within_byte = 0 | 0;
            let arr_last;

            // idx_bit_within_byte could prove a useful variable.
            //  when it is 0, we can check the full byte, and could detect 8 (or maybe more) consecutive values.


            let num_bits_remaining = width;
            // Loop and increment bits...

            let x = 0; // an x local value is fine - will update it as necessary

            // Could keep the ta byte value local....
            //  Could maybe speed it up a little.
            //  Could make some code clearer too.
            //  Processing 8 bits at once may be relatively easy....
            //  Maybe even 64.
            //  May be worth just dealing with the 8 bit and 64 bit cases. Could be the essence of the fast algorithm.

            // If there are more than 8 bits remaining...?


            let has_just_done_multi_read = false;
            let byte_val = 0 | 0;



            while (num_bits_remaining > 0) {

                // Can attempt to read multiple bits at once....
                //  Act differently if the bit position is divible by 8?
                //   Could check for whole byte, and process appropriately.
                //    Need to react to the color shifts over the byte boundary.
                //  Act differently if the bit position is divisible by 64?
                //   Could read the whole 64 bit bigint.
                //    Then local processing of that would likely be faster, regardless of whether it's all 1s or all 0s.



                idx_bit_within_byte = idx_bit_overall & 0b111;


                // then check if we can do just a few of the consecutive reading ops....

                has_just_done_multi_read = false;


                // Not sure how much faster 64 bits at once (in a bigint) would be.

                // 



                if (idx_bit_within_byte === 0 && num_bits_remaining >= 8) {

                    /*

                    if (num_bits_remaining >= 64) {



                    } else {

                    }
                    */



                    // Attempt a multi-read here.
                    //  And probably use 'else' for other cases....
                    //   or set it so it's doing a multi-read and not the next part?
                    //    because it may need to stop / not do the multi-read and get on with the next part...

                    byte_val = ta[idx_bit_overall >> 3];
                    if (byte_val === 255) {

                        // read 8x1 values...

                        // COLOR_NOT_LOOKING_FOR

                        // But we are looking for this...

                        if (last_color === 1) {
                            
                            //last_color = 1;
                            if (res.length === 0) {
                                arr_last = [x, x + 7];
                                res.push(arr_last);
                            } else {
                                arr_last[1] += 8;
                            }



                        } else {
                            // A shift, so make a new array item.

                            arr_last = [x, x + 7];
                            res.push(arr_last);
                            
                            
                        }
                        x += 8;
                        last_color = 1;
                        num_bits_remaining -= 8;
                        idx_bit_overall += 8;
                        has_just_done_multi_read = true;
                        

                    } else if (byte_val === 0) {

                        last_color = 0;
                        has_just_done_multi_read = true;
                        idx_bit_overall += 8;
                        x += 8;
                        num_bits_remaining -= 8;

                        

                    } else {
                        // No multi read this time.
                    }

                    // set has_just_done_multi_read to true if necessary.

                }

                if (!has_just_done_multi_read) {
                    //idx_byte = idx_bit_overall >> 3;
                    current_color = ((ta[idx_bit_overall >> 3] & 128 >> (idx_bit_within_byte)) !== 0) ? 1 : 0;
                    //current_color = ((ta[idx_byte] & 128 >> (idx_bit_overall & 0b111)) !== 0) ? 1 | 0 : 0 | 0;

                    if (current_color === 1) {
                        if (current_color === last_color) {
                            if (res.length === 0) {
                                arr_last = [x, x];
                                res.push(arr_last);
                            } else {
                                arr_last[1]++;
                            }
                        } else {
                            arr_last = [x, x];
                            res.push(arr_last);
                        }
                    }
                    last_color = current_color;
                    idx_bit_overall++;
                    x++;
                    num_bits_remaining--;
                }
            }
            return res;
        }

        const inlined_consecutive_value_checking_no_x_loop_delayed_push_implementation = () => {

            const COLOR_LOOKING_FOR = 1;
            const COLOR_NOT_LOOKING_FOR = 0;


            const res = [];
            const width = this.size[0];
            const {ta} = this;

            const ab = ta.buffer;
            const dv = new DataView(ab);

            // Starting at the color not looking for...?
            //  Would be a change. Maybe it's better logic.
            //  Maybe try a modified 'off' version using consts for looking for and not looking for.

            let last_color = 1; // Try keeping it for the moment.
            let current_color;
            const x_start = 0;


            // idx_byte_start
            // idx_bit_start
            // idx_bit_within_byte_start

            let idx_bit_overall = ((y * this.size[0]) + x_start) | 0, idx_bit_within_byte = 0 | 0;
            let arr_last;

            // idx_bit_within_byte could prove a useful variable.
            //  when it is 0, we can check the full byte, and could detect 8 (or maybe more) consecutive values.


            let num_bits_remaining = width;
            // Loop and increment bits...

            let x = 0; // an x local value is fine - will update it as necessary

            // Could keep the ta byte value local....
            //  Could maybe speed it up a little.
            //  Could make some code clearer too.
            //  Processing 8 bits at once may be relatively easy....
            //  Maybe even 64.
            //  May be worth just dealing with the 8 bit and 64 bit cases. Could be the essence of the fast algorithm.

            // If there are more than 8 bits remaining...?


            let has_just_done_multi_read = false;
            let byte_val = 0 | 0;



            while (num_bits_remaining > 0) {

                // Can attempt to read multiple bits at once....
                //  Act differently if the bit position is divible by 8?
                //   Could check for whole byte, and process appropriately.
                //    Need to react to the color shifts over the byte boundary.
                //  Act differently if the bit position is divisible by 64?
                //   Could read the whole 64 bit bigint.
                //    Then local processing of that would likely be faster, regardless of whether it's all 1s or all 0s.



                idx_bit_within_byte = idx_bit_overall & 0b111;


                // then check if we can do just a few of the consecutive reading ops....

                has_just_done_multi_read = false;


                // Not sure how much faster 64 bits at once (in a bigint) would be.

                // 



                if (idx_bit_within_byte === 0 && num_bits_remaining >= 8) {

                    /*

                    if (num_bits_remaining >= 64) {



                    } else {

                    }
                    */



                    // Attempt a multi-read here.
                    //  And probably use 'else' for other cases....
                    //   or set it so it's doing a multi-read and not the next part?
                    //    because it may need to stop / not do the multi-read and get on with the next part...

                    byte_val = ta[idx_bit_overall >> 3];
                    if (byte_val === 255) {

                        // read 8x1 values...

                        // COLOR_NOT_LOOKING_FOR

                        // But we are looking for this...

                        if (last_color === 1) {
                            
                            //last_color = 1;
                            if (res.length === 0) {

                                if (arr_last) {
                                    res.push(arr_last);
                                }

                                arr_last = [x, x + 7];
                                //res.push(arr_last);
                            } else {
                                arr_last[1] += 8;
                            }



                        } else {
                            // A shift, so make a new array item.

                            if (arr_last) {
                                res.push(arr_last);
                            }

                            arr_last = [x, x + 7];
                            //res.push(arr_last);
                            
                            
                        }
                        x += 8;
                        last_color = 1;
                        num_bits_remaining -= 8;
                        idx_bit_overall += 8;
                        has_just_done_multi_read = true;
                        

                    } else if (byte_val === 0) {

                        last_color = 0;
                        has_just_done_multi_read = true;
                        idx_bit_overall += 8;
                        x += 8;
                        num_bits_remaining -= 8;

                        

                    } else {
                        // No multi read this time.
                    }

                    // set has_just_done_multi_read to true if necessary.

                }

                if (!has_just_done_multi_read) {
                    //idx_byte = idx_bit_overall >> 3;
                    current_color = ((ta[idx_bit_overall >> 3] & 128 >> (idx_bit_within_byte)) !== 0) ? 1 : 0;
                    //current_color = ((ta[idx_byte] & 128 >> (idx_bit_overall & 0b111)) !== 0) ? 1 | 0 : 0 | 0;

                    if (current_color === 1) {
                        if (current_color === last_color) {
                            if (res.length === 0) {

                                if (arr_last) {
                                    res.push(arr_last);
                                }

                                arr_last = [x, x];
                                //res.push(arr_last);
                            } else {
                                arr_last[1]++;
                            }
                        } else {

                            if (arr_last) {
                                res.push(arr_last);
                            }

                            arr_last = [x, x];
                            //res.push(arr_last);
                        }
                    }
                    last_color = current_color;
                    idx_bit_overall++;
                    x++;
                    num_bits_remaining--;
                }
            }

            if (arr_last) {
                res.push(arr_last);
            }

            return res;
        }

        // Seems much faster now.
        //return inlined_consecutive_value_checking_no_x_loop_implementation();

        // The delayed push implementation is more viable to use in a generator function.

        return inlined_consecutive_value_checking_no_x_loop_delayed_push_implementation();
        //return initial_implementation();
        
    }


}

module.exports = Pixel_Buffer_Specialised_Enh;