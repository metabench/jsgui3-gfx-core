
// Possibly too slow - but funcionally at least a good proof of concept.

class Virtual_Float_Pixel {
    // .bounds
    // .pos
    // .size

    constructor() {

        // take existing arrays if in the spec?

        const a = arguments, l = a.length;
        //
        const taf_bounds = new Float32Array(4);
        const taf_pos = new Float32Array(2);
        const taf_size = new Float32Array(2);
        // The bounds as rounded to integers...

        const tai_any_coverage_bounds = new Int16Array(4);
        // tai_any_coverage_bounds
        // tai_total_coverage_bounds

        let area;
        const tai_any_coverage_size = new Int16Array(2);

        // size of what?
        //  any coverage? total coverage?
        //  int total coverage size could be very useful too.
        //const tai_total_coverage_size = new Int16Array(2);
        // ??? ^ tai_any_coverage_size
        const tai_total_coverage_bounds = new Int16Array(4);
        let no_partial_edges = true; // no edges at all to start with....

        let num_any_coverage_px = 0;
        //let i_any_coverage_width = 0;


        //let f_combined_vertical_proportion = 0;
        //let f_combined_horizontal_proportion = 0;

        // f_edge_widths?

        // f_left_edge_width etc... could have these are read-only properties.
        //  and if any edge widths are 0, it would be useful info.



        // iteration_i_size
        // touched_pixels_size?


        // edge locations?
        //  we know this already? use tai_any_coverage_bounds.


        // proportions of the floating point pixel coveing the original pixel.

        // Edge proportions are also edge widths...
        //  or edge thickness

        // Thickness is less ambiguous
        //  If the edge thickness is 0, then can make for an easier algorithm.

        // need to evaluate and code for various different cases.
        //  may get more into expressing the pixel merging function as a clear formula / function that's written as a formula.



        




        const taf_ltrb_edge_proportions = new Float32Array(4);
        // then we have 8 different edge proportions.
        //  edge and corner proportions

        // tl, t, tr, 


        const taf_tl_tr_bl_br_corner_proportions = new Float32Array(4);
        // update_tier2_locals
        //  edges, corner, area...

        

        // tai_total_coverage_bounds



        // tai_total_coverage_size


        // touched_rows, touched_columns?

        // both bounds and size properties...
        //  precompute values upon setting them...
        //   or changing part of them...

        

        //  tier 2 local variables being determined by the initial parameters and properties .bounds, .pos, .size
        //  keep them updated based on 


        // and when its an int boundary?
        //  maybe could shortcut the building / weighting of the top row?

        // maybe simplest and best to have weightings set to 1 in this case.


        
        //let i_left, i_top, i_right, i_bottom;


        // middle_height, middle_width


        //const update_edge_and_corner_proportions = 

        // .touched_px_rows
        // .touched_px_columns

        // So if it only touches 1 row of pixels, there will be different edge values...?
        //  Or will the algo work ok because it's general enough?

        // Do need to calculate coverage for long and thin pixels, eg [3.6, 0.2]
        //  Likely will have different coverage finding algorithm
        //   ???
        //   Could be fine with current maths.
        const update_tier2_locals = () => {


            // Yes, will have different precalculations depending on shape of the pixel coverage of the virtual pixel.
            //  Also, virtual pixels that cover 2 columns or 2 rows... may need special case variables there too.


            // May be best to implement the each_pixel algorithm, at first doing the 3+ x 3+ algorithm.
            //  Then there will be different algorithm versions that operate on smaller coverage sizes.
            //   Already have the algorithm to get the subpixel within 2 and 4 pixel coverage.
            // 

            // cases:
            // all_with_px
            // extends_right_1
            // extends_down_1
            // extends_down_right_1
            // (extends_down_1_right_more)
            // ??
            // extends_more

            // Checking on the integer coverage size would help to determine which algorith to use
            // 

            // Algorithm will depend on tai_any_coverage_size
            //  Maybe only use the corner variables for larger coverage sizes.



            





            //console.log('vfpx update_tier2_locals');
            // This will have the info needed to rapidly iterate over the pixels while calculating their weightings.


            // a formula for the pixel weight?
            //  ie function that returns it...?
            //   would be useful for testing and some purposes too. may port well to C++.








            //console.log('taf_bounds', taf_bounds);

            area = taf_size[0] * taf_size[1];
            tai_any_coverage_bounds[0] = Math.floor(taf_bounds[0]);
            tai_any_coverage_bounds[1] = Math.floor(taf_bounds[1]);
            tai_any_coverage_bounds[2] = Math.ceil(taf_bounds[2]);
            tai_any_coverage_bounds[3] = Math.ceil(taf_bounds[3]);



            tai_total_coverage_bounds[0] = Math.ceil(taf_bounds[0]);
            tai_total_coverage_bounds[1] = Math.ceil(taf_bounds[1]);
            tai_total_coverage_bounds[2] = Math.floor(taf_bounds[2]);
            tai_total_coverage_bounds[3] = Math.floor(taf_bounds[3]);


            // tai_any_coverage_size
            // tai_total_coverage_size
            //  comparing these would find out if it can run al algorithm that does not need to account for these edges...


            //tai_any_coverage_size[0] = tai_any_coverage_bounds[2] - tai_any_coverage_bounds[0];
            //tai_any_coverage_size[1] = tai_any_coverage_bounds[3] - tai_any_coverage_bounds[1];


            // Edge proportions...
            //console.log('tai_any_coverage_bounds', tai_any_coverage_bounds);

            // Is it all within a single row or column?
            // Two rows or columns?

            tai_any_coverage_size[0] = tai_any_coverage_bounds[2] - tai_any_coverage_bounds[0];
            tai_any_coverage_size[1] = tai_any_coverage_bounds[3] - tai_any_coverage_bounds[1];

            num_any_coverage_px = tai_any_coverage_size[0] * tai_any_coverage_size[1];

            //i_any_coverage_width = tai_any_coverage_size[0];

            // tai_partial_coverage_size?
            //  separate bounds (up to 8?) for the partial coverage areas?
            //   each of their bounds would have their own weightings.




            // logically makes sense... would help for comparisons....

            //no_partial_edges = tai_any_coverage_bounds.equals(tai_total_coverage_bounds);

            no_partial_edges = tai_any_coverage_bounds[0] === tai_total_coverage_bounds[0] && tai_any_coverage_bounds[1] === tai_total_coverage_bounds[1] && tai_any_coverage_bounds[2] === tai_total_coverage_bounds[2] && tai_any_coverage_bounds[3] === tai_total_coverage_bounds[3];

            //console.log('no_partial_edges', no_partial_edges);

            if (no_partial_edges) {
                taf_ltrb_edge_proportions.fill(1);
                taf_tl_tr_bl_br_corner_proportions.fill(1);

                //f_combined_horizontal_proportion = 1;
                //f_combined_vertical_proportion = 1;
                
            } else {


                // These edge and corner proportions maybe are only accurately named for the larger coverage sizes.
                //  Maybe rename them as being more mathematically what they are?

                // Only assign corner and edge values when correctly applicable to the shape?

                // Different setup depending on the number of rows / columns?
                //  Amount / size of totally covered space?

                // More awareness at this stage of what the edges actually are?


                // Because in some cases, every pixel will be an edge.
                //  Special cases for 1px and 2px strips?

                //  1px coverage special case?




                // It's not a huge amount of maths going on here anyway.



                // combined_horizontal_proportion value will be used when doing a tall and thin ie 4x1 pixel read





                // 1x3 strip
                //  Apply the vertical proportion to all of them
                //   f_single_row_vertical_proportion value only in use when it's a single row
                //    combined_vertical_proportion is its name from the maths. then use this value when needed.

                //  Will use left edge proportion measurement
                //   and right edge proportion measurement
                

            


                // 1x>3 stip:
                //  Apply the vertical proportion to all of them
                //   f_single_row_vertical_proportion value only in use when it's a single row

                



                //  left edge (includes both )
                //  central bar 














                // Edge proportion does make sense here.



                taf_ltrb_edge_proportions[0] = 1 - (taf_bounds[0] - tai_any_coverage_bounds[0]);
                taf_ltrb_edge_proportions[1] = 1 - (taf_bounds[1] - tai_any_coverage_bounds[1]);
                taf_ltrb_edge_proportions[2] = 1 - (tai_any_coverage_bounds[2] - taf_bounds[2]);
                taf_ltrb_edge_proportions[3] = 1 - (tai_any_coverage_bounds[3] - taf_bounds[3]);

                //console.log('taf_ltrb_edge_proportions', taf_ltrb_edge_proportions);

                //f_combined_horizontal_proportion = taf_ltrb_edge_proportions[0] * taf_ltrb_edge_proportions[2];
                //f_combined_vertical_proportion = taf_ltrb_edge_proportions[1] * taf_ltrb_edge_proportions[3];

                // distance covered...


                // corner proportions may be / are irrelevant in some cases.



                // corner pixels won't be used for 1xn and nx1
                // not so sure about 2xn and nx2.
                //  investigate...



                // multiply them together for taf_tl_tr_bl_br_corner_proportions
                taf_tl_tr_bl_br_corner_proportions[0] = taf_ltrb_edge_proportions[0] * taf_ltrb_edge_proportions[1];
                taf_tl_tr_bl_br_corner_proportions[1] = taf_ltrb_edge_proportions[2] * taf_ltrb_edge_proportions[1];
                taf_tl_tr_bl_br_corner_proportions[2] = taf_ltrb_edge_proportions[0] * taf_ltrb_edge_proportions[3];
                taf_tl_tr_bl_br_corner_proportions[3] = taf_ltrb_edge_proportions[2] * taf_ltrb_edge_proportions[3];


                
            }

            //console.log('tai_any_coverage_size', tai_any_coverage_size);

            // i_top, i_left etc ???

            //[i_left, i_top, i_right, i_bottom] = tai_any_coverage_bounds;


            // Only calculate some corner and edge proportions if necessary / relevant?

            // 

            // And the proportions / distance overlaps on the edges...
            

            //console.log('taf_tl_tr_bl_br_corner_proportions', taf_tl_tr_bl_br_corner_proportions);


            // Determine total coverage bounds...
            //  tai_total_coverage_bounds

            // determine if there is total coverage of any pixels...

            // first_totally_covered_x, last_totally_covered_x etc....
            //  would 64 bit precision help here...?
            //   total coverage could / should count in such cases. Likely to actually be OK....

            // May need a few checks and calculations first...

        }
        

        Object.defineProperty(this, 'bounds', {
            get() { return taf_bounds; },
            set(value) {


                // Could check value to separately update different parts of the bounds.

                //  update_l_bound
                //   will cause the relevant local variables to be updated.
                //   would not need to change height properties or bounds.

                const update_l = value[0] !== taf_bounds[0];
                const update_t = value[1] !== taf_bounds[1];
                const update_r = value[2] !== taf_bounds[2];
                const update_b = value[3] !== taf_bounds[3];

                // or update_w and update_h

                // depending on those updates, we adjust the h ow w properties...
                //  may be quicker just to set / recalc the whole thing? maybe not.

                const update_w = update_l || update_r;
                const update_h = update_t || update_b;

                taf_bounds.set(value);

                if (update_l) taf_pos[0] = taf_bounds[0];
                if (update_t) taf_pos[1] = taf_bounds[1];

                if (update_w) taf_size[0] = taf_bounds[2] - taf_bounds[0];
                if (update_h) taf_size[1] = taf_bounds[3] - taf_bounds[1];

                if (update_w || update_h) update_tier2_locals();

                // Were we given a Int16Array? Similar?
                //  set own pos ta values from the value.
                //pb_source = value;
            },
            enumerable: true,
            configurable: false
        });

        Object.defineProperty(this, 'pos', {
            get() { return taf_pos; },
            set(value) {

                //console.log('set pos', value);

                // turning normal array into f32a?

                // Could check value to separately update different parts of the bounds.

                //  update_l_bound
                //   will cause the relevant local variables to be updated.
                //   would not need to change height properties or bounds.

                // and offset amounts, to add and subtract from bounds values...

                //const delta_x = taf_pos[0] - value[0];
                //const delta_y = taf_pos[1] - value[1];

                const update_hor = value[0] !== taf_pos[0];
                const update_ver = value[1] !== taf_pos[1];

                

                if (update_hor) {
                    taf_bounds[0] = value[0];
                    taf_bounds[2] = value[0] + taf_size[0];
                    //taf_bounds[0] = value;
                    //taf_size[0] += delta_x;

                    // need to recalculate proportions...
                }
                if (update_ver) {
                    taf_bounds[1] = value[1];
                    taf_bounds[3] = value[1] + taf_size[1];
                    //taf_size[1] += delta_y;
                }

                if (update_hor || update_ver) {
                    taf_pos.set(value);
                    update_tier2_locals();
                }

                /*

                const update_l = value[0] !== taf_bounds[0];
                const update_t = value[1] !== taf_bounds[1];
                const update_r = value[2] !== taf_bounds[2];
                const update_b = value[3] !== taf_bounds[3];

                // or update_w and update_h

                // depending on those updates, we adjust the h ow w properties...
                //  may be quicker just to set / recalc the whole thing? maybe not.

                const update_w = update_l || update_r;
                const update_h = update_t || update_b;

                taf_bounds.set(value);

                if (update_l) taf_pos[0] = taf_bounds[0];
                if (update_t) taf_pos[1] = taf_bounds[1];

                if (update_w) taf_size[0] = taf_bounds[2] - taf_bounds[0];
                if (update_h) taf_size[1] = taf_bounds[3] - taf_bounds[1];

                */

                // Were we given a Int16Array? Similar?
                //  set own pos ta values from the value.
                //pb_source = value;
            },
            enumerable: true,
            configurable: false
        });


        // this is the f_size really?
        //  but size makes sense for the name in this context.
        //   as it IS a float pixel.

        // could have f_size alias?

        // and f_pos?
        //  not right now.


        Object.defineProperty(this, 'size', {
            get() { return taf_size; },
            set(value) {

                //console.log('set size', value);

                // turning normal array into f32a?

                // Could check value to separately update different parts of the bounds.

                //  update_l_bound
                //   will cause the relevant local variables to be updated.
                //   would not need to change height properties or bounds.

                // and offset amounts, to add and subtract from bounds values...

                //const delta_w = value[0] - taf_size[0];
                //const delta_h = value[1] - taf_size[1];

                //console.log('delta_w', delta_w);
                //console.log('delta_h', delta_h);

                const update_hor = value[0] !== taf_size[0];
                const update_ver = value[1] !== taf_size[1];

                

                //console.log('update_hor', update_hor);
                //console.log('update_ver', update_ver);

                if (update_hor) {
                    //taf_bounds[0] += delta_w;
                    taf_bounds[2] += value[0] - taf_size[0];
                }
                if (update_ver) {
                    //taf_bounds[1] += delta_h;
                    taf_bounds[3] += value[1] - taf_size[1];
                }

                if (update_hor || update_ver) {
                    taf_size.set(value);
                    update_tier2_locals();
                }
            },
            enumerable: true,
            configurable: false
        });

        // tai_any_coverage_size
        //  size of the area of int pixels totally or partially covered
        Object.defineProperty(this, 'i_any_coverage_size', {
            get() { return tai_any_coverage_size; },
            enumerable: true,
            configurable: false
        });

        // May as well have i_total_coverage_size?


        //   have the bounds anyway right now, don't think these would be so useful.
        //  i_total_coverage_pos?
        //  i_any_coverage_pos?



        // f_area? more naming precision?
        Object.defineProperty(this, 'area', {
            get() { return area; },
            enumerable: true,
            configurable: false
        });

        //num_any_coverage_px

        Object.defineProperty(this, 'num_any_coverage_px', {
            get() { return num_any_coverage_px; },
            enumerable: true,
            configurable: false
        });

        // i_any_coverage_width
        //  will be useful for iterating through the weights taf matrix.


        // i_any_coverage_width

        Object.defineProperty(this, 'i_any_coverage_width', {
            get() { return tai_any_coverage_size[0]; },
            enumerable: true,
            configurable: false
        });

        // i_any_coverage_size? def makes sense.



        Object.defineProperty(this, 'i_any_coverage_bounds', {
            get() { return tai_any_coverage_bounds; },
            enumerable: true,
            configurable: false
        });

        Object.defineProperty(this, 'i_total_coverage_bounds', {
            get() { return tai_total_coverage_bounds; },
            enumerable: true,
            configurable: false
        });

        // no_partial_edges
        Object.defineProperty(this, 'no_partial_edges', {
            get() { return no_partial_edges; },
            enumerable: true,
            configurable: false
        });

        // edge proportions covered...
        //  though the interpretation of this would depend on some other values... maybe these won't be of use in some cases.

        // taf_ltrb_edge_proportions
        // f_ltrb_edge_proportions

        Object.defineProperty(this, 'f_ltrb_edge_proportions', {
            get() { return taf_ltrb_edge_proportions; },
            enumerable: true,
            configurable: false
        });

        Object.defineProperty(this, 'f_tl_tr_bl_br_corner_proportions', {
            get() { return taf_tl_tr_bl_br_corner_proportions; },
            enumerable: true,
            configurable: false
        });


        // get the weight grid as a read-only getter?
        //  makes sense...

        // also want to get it in a more human-readable form?
        //  we already know the position of the edge map anyway... or can easily get it by flooring the fpos
        //   seems like we'd need to give the width of the edge map too... though this would come from i_size_any_coverage or similar.


        // 
        // Will be used in the merging operation
        //  
        // each real pixel / each int specificied pixel.

        // a tai_pos?

        // get proportions covered
        //  get weights?

        let px_proportion_covered, px_weighting;

        // Yes, will be useful for reading subpixels for upscale resizing too.

        // each_ipx???

        //  May well use more efficient system than this...
        //   Could have inline loop iteration elsewhere.
        //   Maybe this will be nicely fast anyway though, can benchmark and compare methodologies.

        // const get_ipx_coverage 


        /*

        const get_ipx_coverage = this.get_ipx_coverage = (i_pos) => {

            console.log('VFPX get_ipx_coverage i_pos:', i_pos);


            // Quick detection of total coverage...

            // Could check i_total_coverage_bounds...
            //  That would be a useful tier2 variable for rapid determination of whether a pixel is totally covered or not...

            // i_total_coverage bounds seems like a very useful thing to initially check against.




            // see if it's within 1 set (vert or horiz) bounds.
            //  yes:
            //   within the other set of bounds
            //    yes:
            //    no:
            //  no:
            //   within the other set of bounds
            //    yes:
            //    no:

            // Or a longer decision tree?
            //  Seems best to determine / use horizontal and vertical integer cut-off points.









        }

        */


        // ipos_cursor?
        //  so could adjust / iterate a cursor, and then calculate / get the weight on each pixel in that cursor.

        // iterate_ipos_cursor()???



        // weight = coverage / f_area

        /*
        const get_ipx_weight = this.get_ipx_weight = (i_pos) => {


        }
        */

        // get weights property?
        //  will return a float ta with the weights of all the pixels within the coverage area.
        //  will cover a variety of corner / edge cases.
        //   different algorithm will run depending on circumstances.


        // Could have different tas of different sized at the ready for different matrix sizes / ta weights results.


        // Keep cache of ta weights for easier reassignments? Look up those tas in a map or array / array depth 2 tree?

        // cache the (res) weights ta by length?
        //  would make for a sensible optimization.
        //   is there a max number of different weights sizes for a single pixel size? Probably.
        //  Maybe there is a limit of 9? something like that.


        //const map_cached_res_taf_weights_by_length = new Array(10);
        const map_cached_res_taf_weights_by_length = {};

        // maybe an obj map makes more sense.
        //  as it would be a very sparse array.
        





        const taf_1_weight = map_cached_res_taf_weights_by_length[1] = new Float32Array([1]);

        // other special cases?


        const get_taf_cached_weights = length => {
            if (!map_cached_res_taf_weights_by_length[length]) {
                map_cached_res_taf_weights_by_length[length] = new Float32Array(length);
            }
            return map_cached_res_taf_weights_by_length[length];
        }


        // get_res_weight(length)
        

        // To what extent can this be moved to ta_math?

        // calc_vfpx_coverage_weights???
        //  Maybe it's best placed here for the moment.
        //   ???
        //  Then it could be used by algos that don't use the VFPX class.
        //   This code splitting could be a better route for long-term efficiency and optimization.




        // Weights calculation would be better within ta_math where the pure maths parts can be separated.

        
        Object.defineProperty(this, 'weights', {
            get() {


                // Could / should this be done without declaring any new variables at all?
                //  Should try optimizations and benchmark.



                // Create a weights object here?
                //  

                // taf_weights already exists?
                //  could cache tas of different sizes as when repeating pixel readings, there would only be a few different coverage lengths
                //   num_any_coverage_px
                //    like the i_area, more specific name.

                // size of weights matrix:

                //console.log('');
                //console.log('VFPX get weights');

                //console.log('num_any_coverage_px', num_any_coverage_px);


                // Algo is highly dependent on this value :)
                //console.log('tai_any_coverage_size', tai_any_coverage_size);

                // make use of some edge / boundary info?
                //  could directly make use of the pos?
                //   or something derived from it, eg its past . part?



                const [w, h] = tai_any_coverage_size;
                //console.log('[w, h]', [w, h]);


                // 

                if (num_any_coverage_px === 1) {
                    // special simple case. may happen a lot with subpixel sampling especially with large upscaling.
                    //  weight is 1.
                    return taf_1_weight;

                } else {
                    // All other cases.
                    //  May have other cases for total coverage...
                    //   If it's all total coverage then all the weights are the same (num pixels any coverage / area)


                    if (no_partial_edges) {
                        // Not sure how often it will come up, worth optimizing for though.

                        //const res = get_taf_cached_weights(num_any_coverage_px);
                        //res.fill(1 / area);
                        //return res;

                        return get_taf_cached_weights(num_any_coverage_px).fill(1 / area);




                        // Use cached weights

                    } else {


                        // This may be incorrect in some cases....
                        //  Or only useful for calculating the weight in some cases?

                        // Will need to go into (a lot?) more detail to calculate these pixel weights...
                        //  Maybe that's only relevant in the calculation when not doing sub-1px strips.




                        // 
                        //const f_totally_covered_weight = 1 / area;

                        // Is this correct...? f_totally_covered_weight ... seems correct.
                        //  Seems / could be incorrect for subpixel strips.

                        // Maybe would need to compare different coverage proportions in this 'strip' mode.






                        // not sure... when the area is < 1?
                        //  weights should always sum to 1?


                        //console.log('f_totally_covered_weight', f_totally_covered_weight);

                        // // taf_ltrb_edge_proportions taf_tl_tr_bl_br_corner_proportions

                        


                        // check for special case widths (1, 2, 3)?
                        //  check for special case heights within this?

                        // check for special case size handlers first?


                        // special case handlers for width 1, height 1?

                        // decision tree could work here...

                        // or a few of them?






                        //  1x2, 2x1, 2x2


                        //  1x3, 3x1
                        //  2x3, 3x2, 3x3

                        // 1x>3, >3x1
                        //  single row or single column ipx area.
                        //   def worth having a special case here.
                        //    would be very similar construction.


                        //  greater than 3 because we already have the 2x3 handling.
                        //  2x>3, >3x2

                        // single_row? single_column?
                        //  special cases in this instance too.
                        
                        //  3x>3, >3x3

                        // May be bette to rearrange later into something of a decision tree... for the moment write in if, else if style.

                        // Check for larger size first? Would speed up large downscales.
                        //  

                        // Let's get covering these cases, writing the algos now / soon / next.
                        //  lots of cases to cover here, and doing so should lead to a well-tuned overall algo that makes use of these weights.
                        //   also this would be a good candidate function, alongside some other functions that use it, to be ported to C++.

                        // Don't know if this will wind up as a top-tier image resizing algorithm. Nice if it did. Let's see if its the fastest / a very fast js image resize algo.

                        // Smaller sampling special cases.
                        //  These smaller simple sizes could be used frequently when in image is not rescaled much.


                        // then only in the larger cases do we need to run an xy iteration.
                        //  or maybe just an x or y iteration.
                        //  maybe call separate (internal?) function to get the results for larger weight readings
                        //   then later may / will move math stuff to ta_math and rearrange that somewhat into read, copy, transform, write (etc?)
                        //    (read_transform?)




                        // Worth writing and testing the special cases.
                        //  This is turning out to be a somewhat long algo but it makes sense for optimization.
                        //   Though maybe shorter functions / code paths will optimize more???

                        // This algo is likely to be very / nicely fast in js.


                        // Remember: f_combined_horizontal_proportion, f_combined_vertical_proportion

                        //console.log('taf_ltrb_edge_proportions', taf_ltrb_edge_proportions);
                        //console.log('taf_tl_tr_bl_br_corner_proportions', taf_tl_tr_bl_br_corner_proportions);
                        const res = get_taf_cached_weights(num_any_coverage_px);

                        // variable totally_covered_px_weight = 1 / area.
                        //  would make sense to use that....




                        // could fill be 1/area as optimization to start with...
                        //  only 


                        //res.fill(0); // just in case while testing. Should probably remove later on, they'll all certainly be overwritten.


                        // Some are easy...
                        //  Should make the algo fast in many cases.


                        // Algo advantage for height >3 - compose the middle rows separately.
                        //  


                        // Call smaller weight read function?




                        if (w === 1 && h === 2) {
                            // top edge and bottom edge measurements should be used.
                            //  only need to consider the weighting of the vertical measurement(s).

                            // taf_ltrb_edge_proportions

                            //const res = get_taf_cached_weights(2);
                            res[0] = taf_ltrb_edge_proportions[1] / taf_size[1];
                            res[1] = taf_ltrb_edge_proportions[3] / taf_size[1];
                            

                        } else if (w === 2 && h === 1) {
                            res[0] = taf_ltrb_edge_proportions[0] / taf_size[0];
                            res[1] = taf_ltrb_edge_proportions[2] / taf_size[0];

                        } else if (w === 2 && h === 2) {

                            // OK, need to do more of a calculation here.
                            //  are the corner values the weights?

                            // Worth specifically testing this here.


                            // likely to be the case...
                            //  should test and investigate...


                            // ????????????????????????????????????????????????????????????
                            //res.set(taf_tl_tr_bl_br_corner_proportions);

                            // will need to divide each corner proportion by the total area I presume.


                            res[0] = taf_tl_tr_bl_br_corner_proportions[0] / area;
                            res[1] = taf_tl_tr_bl_br_corner_proportions[1] / area;
                            res[2] = taf_tl_tr_bl_br_corner_proportions[2] / area;
                            res[3] = taf_tl_tr_bl_br_corner_proportions[3] / area;



                            // check all the weights add up to 1...
                            //  I think they should.

                            // would make sense...
                            // ????????????????????????????????????????????????????????????



                            // res.set(taf_tl_tr_bl_br_corner_proportions);

                            //console.log('res', res);
                            //console.trace();
                            //throw 'stop';

                            // seems OK in theory so far :)




                        } else if (w === 3 && h === 1) {

                            // // Remember: f_combined_horizontal_proportion, f_combined_vertical_proportion
                            
                            // apply the f_combined_vertical_proportion to the whole row?
                            //  or, it's irrelevant when calculating the weights :)

                            // All the weights should add up to 1?

                            // Or is it easier to get the proportion of the pixels covered?
                            //  Weights could be more direct in some cases.

                            // Maybe better to write potential shortcut calculatons to begin with but in comments, and use the most surefire way.

                            // or use divisions by f_width?

                            // weights should be calculated as a proportion of the total float width in this case.

                            // left proportion
                            // the rest
                            // right proportion

                            res[0] = taf_ltrb_edge_proportions[0] / taf_size[0];
                            res[1] = 1 / taf_size[0]; // ?
                            res[2] = taf_ltrb_edge_proportions[2] / taf_size[0];

                            // 

                        } else if (w === 1 && h === 3) {

                            res[0] = taf_ltrb_edge_proportions[1] / taf_size[1];
                            res[1] = 1 / taf_size[1]; // ?
                            res[2] = taf_ltrb_edge_proportions[3] / taf_size[1];


                        } else if (w === 2 && h === 3) {

                            // 6 pixel size weights matrix

                            //  will use the corner factors at the top and bottom.

                            // 6 assignments to make...
                            //  best to use the area calculation here I think

                            res[0] = taf_tl_tr_bl_br_corner_proportions[0] / area;
                            res[1] = taf_tl_tr_bl_br_corner_proportions[1] / area;

                            res[2] = taf_ltrb_edge_proportions[0] / area;
                            res[3] = taf_ltrb_edge_proportions[2] / area;
                            
                            res[4] = taf_tl_tr_bl_br_corner_proportions[2] / area;
                            res[5] = taf_tl_tr_bl_br_corner_proportions[3] / area;



                        } else if (w === 3 && h === 2) {

                            // Probably easiest and fastest to do this with 6 assignment operations.
                            res[0] = taf_tl_tr_bl_br_corner_proportions[0] / area;
                            res[1] = taf_ltrb_edge_proportions[1] / area;
                            res[2] = taf_tl_tr_bl_br_corner_proportions[1] / area;

                            res[3] = taf_tl_tr_bl_br_corner_proportions[2] / area;
                            res[4] = taf_ltrb_edge_proportions[3] / area;
                            res[5] = taf_tl_tr_bl_br_corner_proportions[3] / area;


                        } else if (w === 3 && h === 3) {

                            // Specific assignments.
                            //  using edge and corner values.

                            // 9 separate assignments will work. 1 px here (or more???) has got total coverage, ie weight = 1 / area.

                            res[0] = taf_tl_tr_bl_br_corner_proportions[0] / area;
                            res[1] = taf_ltrb_edge_proportions[1] / area;
                            res[2] = taf_tl_tr_bl_br_corner_proportions[1] / area;

                            res[3] = taf_ltrb_edge_proportions[0] / area;
                            res[4] = 1 / area;
                            res[5] = taf_ltrb_edge_proportions[2] / area;

                            res[6] = taf_tl_tr_bl_br_corner_proportions[2] / area;
                            res[7] = taf_ltrb_edge_proportions[3] / area;
                            res[8] = taf_tl_tr_bl_br_corner_proportions[3] / area;




                        } else {

                            //console.log('not one of the smallest special cases');

                            // Larger assignments... will need to loop.
                            

                            if (w > 3 && h > 3) {
                                // Larger algo run...

                                // The 'main' algo.
                                //  Others will run with some restructions / fewer steps.
                                //  Even the fixed assignments for 3x3 will be fast!
                                //   Sould be a fast way to produce the weights array quickly when it's requested.


                                //console.log('width >3, height >3');

                                // The full algo...

                                //  It makes a lot of sense to precalculate the v-middle rows.
                                //   (rows with full vertical coverage)

                                const row = new Float32Array(w);

                                //const v_top = new Float32Array(w);
                                row.fill(taf_ltrb_edge_proportions[1] / area);
                                row[0] = taf_tl_tr_bl_br_corner_proportions[0] / area;
                                row[w - 1] = taf_tl_tr_bl_br_corner_proportions[1] / area;

                                res.set(row, 0);

                                //const v_middle = row;
                                // left edge, the inner parts have coverage 1.
                                row.fill(1 / area);
                                row[0] = taf_ltrb_edge_proportions[0] / area;
                                row[w - 1] = taf_ltrb_edge_proportions[2] / area;

                                const hm1 = h - 1;
                                for (let y = 1; y < hm1; y++) {
                                    res.set(row, y * w);
                                }

                                //const v_bottom = row;
                                row.fill(taf_ltrb_edge_proportions[3] / area);
                                row[0] = taf_tl_tr_bl_br_corner_proportions[2] / area;
                                row[w - 1] = taf_tl_tr_bl_br_corner_proportions[3] / area;
                                
                                res.set(row, hm1 * w);

                                // Writing the middle row in multiple positions on the res makes sense.
                                //  Avoiding having to actually do this xy double for loop :)

                                // write the first and last rows directly to the res.

                                // whole row writing could work ok...
                                //  as we can fill it with the top or bottom edge values.

                                //res[0] = f_tl_tr_bl_br_corner_proportions[0] / area;
                                /// having these divided by area precalculated could be very useful.















                            } else {
                                if (w === 1) {
                                    // width 1, height >3
                                    // 

                                    const middle_weight = 1 / taf_size[1];
                                    res.fill(middle_weight);
                                    res[0] = taf_ltrb_edge_proportions[1] / taf_size[1];
                                    res[h - 1] = taf_ltrb_edge_proportions[3] / taf_size[1];

                                    //console.log('width 1, height >3');

                                    //console.log('taf_size', taf_size);
                                    //console.log('taf_ltrb_edge_proportions', taf_ltrb_edge_proportions);

                                } else if (w === 2) {
                                    // width 2, height >3

                                    // still could be worth making a length 2 ta for the rows / middle rows?
                                    //  probably not as it can be set very quickly through direct assignment.

                                    //  no single central value to fill with in this case - likely no totally covered pixels.

                                    res[0] = taf_tl_tr_bl_br_corner_proportions[0] / area;
                                    res[1] = taf_tl_tr_bl_br_corner_proportions[1] / area;

                                    const hm1 = h - 1;
                                    let byi = 2;
                                    for (let y = 1; y < hm1; y++) {
                                        //res.set(v_middle, y * 2);
                                        //res[y * 2] = 
                                        res[byi++] = taf_ltrb_edge_proportions[0] / area;
                                        res[byi++] = taf_ltrb_edge_proportions[2] / area;
                                    }
                                    res[byi++] = taf_tl_tr_bl_br_corner_proportions[2] / area;
                                    res[byi++] = taf_tl_tr_bl_br_corner_proportions[3] / area;



                                    // Tall, thin but covering 2 px strip
                                    //  Could use some kind of subset copy / fill system?
                                    //  Could 

                                    // corners on top and bottom
                                    //  


                                    

                                    // Use the left and right

                                    //console.log('width 2, height >3');
                                    
                                } else if (w === 3) {

                                    //console.log('width 3, height >3');

                                    // width 3, height >3

                                    // again, not so sure that row preprep and writing makes sense...?
                                    //  could try and compare speeds. ta.set is quite fast.
                                    //  this is why it's worth splitting these things up into different sections.

                                    // Just a few more cases to cover....

                                    // do this with rows.
                                    //  it's just that here the row construction makes use of the fact that the width is only 3.

                                    const top_row = new Float32Array(3);
                                    top_row[0] = taf_tl_tr_bl_br_corner_proportions[0] / area;
                                    top_row[1] = taf_ltrb_edge_proportions[1] / area;
                                    top_row[2] = taf_tl_tr_bl_br_corner_proportions[1] / area;

                                    const middle_row = new Float32Array(3);
                                    middle_row[0] = taf_ltrb_edge_proportions[0] / area;
                                    middle_row[1] = 1 / area;
                                    middle_row[2] = taf_ltrb_edge_proportions[2] / area;


                                    const bottom_row = new Float32Array(3);
                                    bottom_row[0] = taf_tl_tr_bl_br_corner_proportions[2] / area;
                                    bottom_row[1] = taf_ltrb_edge_proportions[3] / area;
                                    bottom_row[2] = taf_tl_tr_bl_br_corner_proportions[3] / area;


                                    res.set(top_row, 0);
                                    const hm1 = h - 1;
                                    for (let y = 1; y < hm1; y++) {
                                        res.set(middle_row, y * 3);
                                    }
                                    res.set(bottom_row, hm1 * 3);
                                    
                                } else if (h === 1) {
                                    // width >3, height 1
                                    //console.log('width >3, height 1');
                                    // weight calc will divide by width rather than area.

                                    const middle_weight = 1 / taf_size[0];
                                    res.fill(middle_weight);
                                    res[0] = taf_ltrb_edge_proportions[0] / taf_size[0];
                                    res[num_any_coverage_px - 1] = taf_ltrb_edge_proportions[2] / taf_size[0];


                                    // Tall thin strip
                                    //   top: weight by 

                                } else if (h === 2) {
                                    // width >3, height 2
                                    //console.log('width >3, height 2');

                                    // limited height - more optimizations possible / worthwhile to do with middle row preparation.
                                    //  maybe preparing all rows makes sense because .fill sets many at once.

                                    const top_row = new Float32Array(w);
                                    top_row.fill(taf_ltrb_edge_proportions[1] / area);
                                    top_row[0] = taf_tl_tr_bl_br_corner_proportions[0] / area;
                                    top_row[w - 1] = taf_tl_tr_bl_br_corner_proportions[1] / area;


                                    const bottom_row = new Float32Array(w);
                                    bottom_row.fill(taf_ltrb_edge_proportions[3] / area);
                                    bottom_row[0] = taf_tl_tr_bl_br_corner_proportions[2] / area;
                                    bottom_row[w - 1] = taf_tl_tr_bl_br_corner_proportions[3] / area;

                                    res.set(top_row, 0);
                                    res.set(bottom_row, w);
                                    

                                } else if (h === 3) {
                                    // width >3, height 3

                                    //console.log('width >3, height 3');


                                    const top_row = new Float32Array(w);
                                    top_row.fill(taf_ltrb_edge_proportions[1] / area);
                                    top_row[0] = taf_tl_tr_bl_br_corner_proportions[0] / area;
                                    top_row[w - 1] = taf_tl_tr_bl_br_corner_proportions[1] / area;

                                    const middle_row = new Float32Array(w);
                                    middle_row.fill(1 / area);
                                    middle_row[0] = taf_ltrb_edge_proportions[0] / area;
                                    middle_row[w - 1] = taf_ltrb_edge_proportions[2] / area;

                                    const bottom_row = new Float32Array(w);
                                    bottom_row.fill(taf_ltrb_edge_proportions[3] / area);
                                    bottom_row[0] = taf_tl_tr_bl_br_corner_proportions[2] / area;
                                    bottom_row[w - 1] = taf_tl_tr_bl_br_corner_proportions[3] / area;

                                    res.set(top_row, 0);
                                    res.set(middle_row, w);
                                    res.set(bottom_row, w * 2);

                                    // 3 long, thin rows.
                                    //  easy / fast to put together, as we can use .fill and .set.

                                } else {
                                    console.trace();
                                    throw 'should not happen';
                                }

                                // Covered all cases, I think.



                                // Smaller size special case... will individually cover them.

                            }


                            // Could check against some other special cases...

                            // single column or single row
                            // 2 column or 2 row
                            // 3 column or 3 row

                            // Then if it's none of the above one's it's the larger scale version.

                            // If both w and h are > 3 it's the full algo.
                            //  Otherwise get into the special cases.
                            

                        }

                        //console.log('VFPX get weights - pre return res', res);

                        // check that the combined weights = 1 to reasonable accuracy.

                        /*

                        const total_weight = res.reduce((pv, cv) => pv + cv, 0);

                        //console.log('total_weight', total_weight);

                        if (Math.abs(total_weight - 1) < 0.00001) {

                        } else {
                            console.trace();
                            throw 'stop';

                        }
                        */
                        return res;
                        /*

                        else if (w === 1 && h === 2) {

                        } else if (w === 1 && h === 2) {

                        } else if (w === 1 && h === 2) {

                        } else if (w === 1 && h === 2) {

                        } else {
                            // Larger size... none of the special case algoriths will be used.
                            //  At least 4x4.


                        }


                        */



                        // Then after that, it will do the standard 'large size' algorithm, which itself won't be all that complicated :)
                        //  It's best not to have to use the full algo when we don't need to, and can use a simpler algo with more of the steps predefined or not needed and therefore skipped.




                        

                        



                        // special case of covering just 2 pixels?
                        //  covering 4 pixels in a square too?

                        // specific check for 2x1, 1x2, 2x2
                        //  will have simpler weightings calculations.
                        //   also consider 2x3, 3x2 and 3x3 more optimized weighting calculation algorithm.
                        //    could be very simple, done by assigning existing values.

                        // special cases for 3x>3 and >3x3?
                        //  Could make sense as there is no loop for an inner part, at least when writing rows to the weights.

                        // getting an array of 8 corner and edge values could be of use too.
                        //  or 9 in total with 1 in the middle???

                        // or the edge and corner weight values, along with using the totally covered size.
                        //  quite a few steps to it but it's not all that complex when broken down / unpacked.

                        // the 4 pixel combination is likely to be used / called on a lot.

                        // Not the special case of having no partial edges.
                        // Lots of cases to cover... want to use the most optimal algorithm for each.
                        //  May call the more complex algorithms from outside this function???
                        //   Maybe not, for perf reasons.
                        //   Constructing the weights matrix array is fairly low level.
                        //    Keeping code simple here will help with its C++ porting.



                        // width 1, height 2
                        //  special case.
                        //   will use less complex weight calculation.


                        /*

                        if (w === 2) {
                            if (h === 1) {
    
                            } else {
                                // width = 2, height > 1
    
                                if (h === 2) {
    
                                } else {
                                    // width = 2, height ? 
                                }
    
                            }
    
    
    
                        } else {
                            // width is not 2.
    
    
                        }
                        */

                    }

                    // look into various cases...
                    //  like with each_ipx.

                    // 2x1, 1x2, etc...



                    console.trace();
                    throw 'NYI';

                }

                // i_any_coverage_size

                //num_any_coverage_px 


                // worth having some special cases for quick calculation / assignment.

                // 1x1
                // 1x2
                // 2x1
                // 2x2

                // Could write these handlers first, then the others
                //  




                //const i_any_coverage_width = tai_any_coverage_size[0];





            },
            enumerable: true,
            configurable: false
        });



        this.each_ipixel = (callback) => {

            // callback(pos, proportion_covered, weighting)
            //  weighting is the proportion covered / area (in float measurements) of the pixel rectangle.

            // assign a byte index here too?
            //  within a colorspace...?




            // Lets handle special cases...

            if (tai_any_coverage_size[0] === 1) {
                // single column

                if (tai_any_coverage_size[1] === 1) {
                    // single column, single row.
                    //  it's a one by one

                    //callback(new )
                    px_proportion_covered = f_area;
                    px_weighting = 1;

                    callback(taf_bounds.subarray(0, 2), px_proportion_covered, px_weighting);
    
                } else {
                    // check for 1x2 

                    if (tai_any_coverage_size[1] === 2) {

                        // 1x2
                        // find the proportion of the pixel within each...

                        

                        
                        console.trace();
                        console.log('1x2 taf_ltrb_edge_proportions', taf_ltrb_edge_proportions);
                        throw 'NYI';

                    } else {
                        // 1x>2

                        // 1 column, multiple rows.

                        // the middle rows - totally covered.

                        // look at the edge proportions.

                        console.log('1x>2 taf_ltrb_edge_proportions', taf_ltrb_edge_proportions);

                        console.trace();
                        throw 'NYI';

                    }
                }
            } else if (tai_any_coverage_size[0] === 2) {
                // 2 columns - logic for the number of rows.

                if (tai_any_coverage_size[1] === 1) {
                    // 2x1
                    console.trace();
                    console.log('2x1 taf_ltrb_edge_proportions', taf_ltrb_edge_proportions);
                    throw 'NYI';
                } else if (tai_any_coverage_size[1] === 2) {
                    // 2x2
                    console.trace();
                    console.log('2x2 taf_ltrb_edge_proportions', taf_ltrb_edge_proportions);
                    throw 'NYI';
                } else {
                    // 2x>2
                    console.trace();
                    console.log('2x>2 taf_ltrb_edge_proportions', taf_ltrb_edge_proportions);
                    throw 'NYI';

                }

            } else {
                // it's more than 2 columns

                if (tai_any_coverage_size[1] === 1) {
                    // >2x1
                    console.trace();
                    console.log('>2x1 taf_ltrb_edge_proportions', taf_ltrb_edge_proportions);
                    throw 'NYI';
                } else if (tai_any_coverage_size[1] === 2) {
                    // >2x2
                    console.trace();
                    console.log('>2x2 taf_ltrb_edge_proportions', taf_ltrb_edge_proportions);
                    throw 'NYI';
                } else {
                    // >2x>2
                    console.trace();
                    console.log('>2x>2 taf_ltrb_edge_proportions', taf_ltrb_edge_proportions);
                    throw 'NYI';
                    // The full 9 part algorithm - all corners, all edges.

                }

            }

            // want this to be efficient for reading smaller subpixels too.
            //  all this will do though is to provide the coordinate space and the proportion of that px within the virtual px area.




            // The tier 2 local variables will already have been set to useful values.
            //  iteration will be fairly simple...

            // [i_left, i_top, i_right, i_bottom] = tai_any_coverage_bounds; // use these local variables?

            // x y loop through the i bounds
            //  for each pixel, calculate its proportion covered.
            //   could have other function for that.

            // iterator typed array would be better here.

            const xy = new Int16Array(2);

            // Handle the top row separately...???
            //  as we know the proportion of those ones...

            // top row...

            // the first px...

            // See what kind of operation we need to do?
            //  Or is the loop thing enough?


            // Single row process - different alg.
            // Single column process - different alg.




            // has_second_row???
            //  num_middle_rows ???





            // Basic multi-row multi-column 4 corner 4 edge algo.
            //  Will adapt for subpixels and benchmark optimization.


            // top left pixel.
            let px_proportion = taf_tl_tr_bl_br_corner_proportions[0];


            // loop(s) will depend on tai_any_coverage_size

            // a long, thin pixel...
            //  would only extract from 1 row.
            //  a different calculation system is needed.
            //   precalculate before here?
            //    not right now. maybe dont precalculate all the edges and corners if it's totally within another pixel, in any dimension.


            // Loop cases where there are 3 or more pixels in both dimensions...
            //  Superpixel sampling, will be used for shrinking images.

            // Maybe this is the case for more precalculation.
            //  When basic properties are set, tier 2 properties should represent the essential info needed to quickly carry out the iteration.
            //   Could possibly return that info or a different small set of data that would be of use for rapid iteration.















            // callback with the coords and the proportion.




            callback(xy, px_proportion);

            // then go through the top row...








            /*

            for (xy[1] = tai_any_coverage_bounds[1]; xy[1] < tai_any_coverage_bounds[3]; xy[1]++) {
                // info about the fi

                for (xy[0] = tai_any_coverage_bounds[0]; xy[0] < tai_any_coverage_bounds[2]; xy[0]++) {

                    
                    // get the pixel proportion within the fp bounds (pixel)



                }
            }
            */



            // iterate through int space.
            //  work out the relative proportion of each px within the actual pixel space.

            // different settings per row of course.

            // makes sense to do the top, middle and bottom rows.











            // Check to see if it's covering just one pixel...
            //  Also, may have different case when it's covering 2 or 4 pixels.
            //   2x3 or 3x2? 

            // could have a loop that uses h_middle_length and v_middle_length and when it's only 2x2 they are both 0.

            // This will only have a callback with the pixel position and the weighting...
            //  or pixel pos, value, and weighting.
            //   that would make sense.

            // use the outer integer bounds for the xy loop.

            // Each standard integer pixel within the virtual space.

            // proportions for each edge.
            // 

            // where each edge is.
            //  check if a pixel covers an edge...
            //  or could know this in advance by following the proper sequence.

            // process top row          (tl, t, tr)
            // process v-middle rows    (l, 0, r)
            // process bottom row       (bl, l, br)

            // Would be worth calculating row proportions upon setting and changing .bounds, .pos, .size
        }

        if (l === 1) {
            // set the bounds from the args.
            this.bounds = a[0];
        } else if (l === 2) {
            //this.pos = a[0];
            this.pos = a[0];
            //taf_pos.set(a[0]);
            this.size = a[1];
        }
    }
    
}

module.exports = Virtual_Float_Pixel;