

// transforms for other bpp images too...

// 8 bipp image greyscales

// load convolve in here.


const copy_px_to_ta_dest_byi = (ta_source, source_colorspace, source_xy, ta_dest, byi_dest) => {
    const [width, height, bypp, bypr, bipp, bipr] = source_colorspace;

    if (bipp === 24) {
        let byi_read = source_xy[0] * bypp + source_xy[1] * bypr;
        ta_dest[byi_dest] = ta_source[byi_read++];
        ta_dest[byi_dest + 1] = ta_source[byi_read++];
        ta_dest[byi_dest + 2] = ta_source[byi_read++];

    } else {
        console.trace();
        throw 'NYI';
    }
}


const each_pixel_in_colorspace = (colorspace, callback) => {
    const [width, height, bypp, bypr, bipp, bipr] = colorspace;
    let byi = 0;
    const xy = new Int16Array(2);
    for (xy[1] = 0; xy[1] < height; xy[1]++) {
        for (xy[0] = 0; xy[0] < width; xy[0]++) {
            callback(xy, byi);
            byi += bypp;
        }
    }
}

// Make an inline version?
const __each_source_dest_pixels_resized = (source_colorspace, dest_size, callback) => {
    // Includes both partial and any (total and partial) pixel coverage areas in the source.

    const [width, height, bypp, bypr, bipp, bipr] = source_colorspace;
    const dest_colorspace = new Int32Array([dest_size[0], dest_size[1], bypp, bypp * dest_size[0], bipp, bipp * dest_size[0]]);
    const dest_to_source_ratio = new Float32Array([source_colorspace[0] / dest_size[0], source_colorspace[1] / dest_size[1]]);
    const source_fbounds = new Float32Array(4);
    const source_ibounds = new Int16Array(4);
    const source_i_any_coverage_size = new Int16Array(2);
    const source_total_coverage_ibounds = new Int16Array(4);
    let byi_read;

    // no calculation of edge distance and corner areas / weights in this one.

    each_pixel_in_colorspace(dest_colorspace, (dest_xy, dest_byi) => {

        source_fbounds[0] = dest_xy[0] * dest_to_source_ratio[0];
        source_fbounds[1] = dest_xy[1] * dest_to_source_ratio[1];
        source_fbounds[2] = source_fbounds[0] + dest_to_source_ratio[0];
        source_fbounds[3] = source_fbounds[1] + dest_to_source_ratio[1];

        // And the total coverage bounds.
        //  will be useful for some things...
        // Total coverage size as well

        //source_farea = (source_fbounds[2] - )


        // Scale down the pixel location...
        source_ibounds[0] = source_fbounds[0];
        source_ibounds[1] = source_fbounds[1];
        source_ibounds[2] = Math.ceil(source_fbounds[2]);
        source_ibounds[3] = Math.ceil(source_fbounds[3]);

        // then the any coverage area...

        // does it cover other pixels / proportions in those other pixels?

        // Still reasonably fast - yet slowing down from before....
        source_i_any_coverage_size[0] = source_ibounds[2] - source_ibounds[0];
        source_i_any_coverage_size[1] = source_ibounds[3] - source_ibounds[1];

        byi_read = source_ibounds[0] * bypp + source_ibounds[1] * bypr;

        source_total_coverage_ibounds[0] = Math.ceil(source_fbounds[0]);
        source_total_coverage_ibounds[1] = Math.ceil(source_fbounds[1]);
        source_total_coverage_ibounds[2] = source_fbounds[2];
        source_total_coverage_ibounds[3] = source_fbounds[3];

        callback(dest_xy, dest_byi, source_fbounds, source_ibounds, source_i_any_coverage_size, source_total_coverage_ibounds, byi_read);
    });
}


// Make this the precalc-x version?
const each_source_dest_pixels_resized$inline = (source_colorspace, dest_size, callback) => {
    let [width, height, bypp, bypr, bipp, bipr] = source_colorspace;
    const source_bypr = bypr;
    const dest_colorspace = new Int32Array([dest_size[0], dest_size[1], bypp, bypp * dest_size[0], bipp, bipp * dest_size[0]]);


    const dest_to_source_ratio = new Float32Array([source_colorspace[0] / dest_size[0], source_colorspace[1] / dest_size[1]]);
    const source_fbounds = new Float32Array(4);
    const source_ibounds = new Int16Array(4);
    const source_i_any_coverage_size = new Int16Array(2);
    const source_total_coverage_ibounds = new Int16Array(4);
    let byi_read = 0;

    let dest_byi = 0;
    const dest_xy = new Int16Array(2);
    [width, height, bypp, bypr, bipp, bipr] = dest_colorspace;


    // Could precalculate values for x.
    //  Adding together byr components could be another optimization.

    const _x_source_fbounds0 = new Float32Array(width);
    const _x_source_fbounds2 = new Float32Array(width);

    const _x_source_ibounds0 = new Int16Array(width);
    const _x_source_ibounds2 = new Int16Array(width);
    const _x_source_i_any_coverage_size = new Int16Array(width);
    const _x_source_i_total_coverage_l = new Int16Array(width);
    const _x_source_i_total_coverage_r = new Int16Array(width);

    // And cache the total coverage bounds for x as well...

    const _x_byi_read = new Int32Array(width);

    for (dest_xy[0] = 0; dest_xy[0] < width; dest_xy[0]++) {
        _x_source_fbounds0[dest_xy[0]] = dest_xy[0] * dest_to_source_ratio[0];
        _x_source_fbounds2[dest_xy[0]] = _x_source_fbounds0[dest_xy[0]] + dest_to_source_ratio[0];

        _x_source_ibounds0[dest_xy[0]] = _x_source_fbounds0[dest_xy[0]];
        _x_source_ibounds2[dest_xy[0]] = Math.ceil(_x_source_fbounds2[dest_xy[0]]);

        _x_source_i_any_coverage_size[dest_xy[0]] = _x_source_ibounds2[dest_xy[0]] - _x_source_ibounds0[dest_xy[0]];

        _x_byi_read[dest_xy[0]] = _x_source_ibounds0[dest_xy[0]] * bypp;

        _x_source_i_total_coverage_l[dest_xy[0]] = Math.ceil(_x_source_fbounds0[dest_xy[0]]);
        _x_source_i_total_coverage_r[dest_xy[0]] = Math.floor(_x_source_fbounds2[dest_xy[0]]);
    }


    let row_byi;

    // iterate using local variables instead?
    //  may make for fewer ta lookups? speed things up that way?

    for (dest_xy[1] = 0; dest_xy[1] < height; dest_xy[1]++) {
        source_fbounds[1] = dest_xy[1] * dest_to_source_ratio[1];
        source_ibounds[1] = source_fbounds[1];
        
        source_fbounds[3] = source_fbounds[1] + dest_to_source_ratio[1];
        source_ibounds[3] = Math.ceil(source_fbounds[3]);

        source_i_any_coverage_size[1] = source_ibounds[3] - source_ibounds[1];
        source_total_coverage_ibounds[1] = Math.ceil(source_fbounds[1]);
        source_total_coverage_ibounds[3] = source_fbounds[3];

        row_byi = source_ibounds[1] * source_bypr;
        
        for (dest_xy[0] = 0; dest_xy[0] < width; dest_xy[0]++) {

            //source_fbounds[0] = dest_xy[0] * dest_to_source_ratio[0];
            source_fbounds[0] = _x_source_fbounds0[dest_xy[0]];
            source_fbounds[2] = _x_source_fbounds2[dest_xy[0]];
        // source_fbounds[2] = source_fbounds[0] + dest_to_source_ratio[0];

            // And the total coverage bounds.
            //  will be useful for some things...
            // Total coverage size as well

            //source_farea = (source_fbounds[2] - )

            // Scale down the pixel location...
            //source_ibounds[0] = source_fbounds[0];
            //source_ibounds[2] = Math.ceil(source_fbounds[2]);

            source_ibounds[0] = _x_source_ibounds0[dest_xy[0]];
            source_ibounds[2] = _x_source_ibounds2[dest_xy[0]];
            

            // then the any coverage area...

            // does it cover other pixels / proportions in those other pixels?

            // Still reasonably fast - yet slowing down from before....
            //source_i_any_coverage_size[0] = source_ibounds[2] - source_ibounds[0];
            source_i_any_coverage_size[0] = _x_source_i_any_coverage_size[dest_xy[0]];
            byi_read = _x_byi_read[dest_xy[0]] + row_byi;

            //source_total_coverage_ibounds[0] = Math.ceil(source_fbounds[0]);
            //source_total_coverage_ibounds[2] = source_fbounds[2];

            source_total_coverage_ibounds[0] = _x_source_i_total_coverage_l[dest_xy[0]];
            source_total_coverage_ibounds[2] = _x_source_i_total_coverage_r[dest_xy[0]];

            callback(dest_xy, dest_byi, source_fbounds, source_ibounds, source_i_any_coverage_size, source_total_coverage_ibounds, byi_read);
            
            dest_byi += bypp;
        }
    }

}

// Non-inline version faster here too? Seeing that on some smaller image resizes.
//  Inline version faster for larger image resizes (or after more runs) so going for that

each_source_dest_pixels_resized = each_source_dest_pixels_resized$inline;

// each_source_dest_pixels_resized_limited_further_info in C++, with callbacks (using function pointers I suppose on the C++ level)


// Could make a further inlined / optimized / precalced version of this too.
const __each_source_dest_pixels_resized_limited_further_info = (source_colorspace, dest_size, callback) => {
    // This actually calculates the weights.

    // dest_byi, source_i_any_coverage_size, edge_distances_proportions_of_total, corner_areas_proportions_of_total, byi_read

    //const [width, height, bypp, bypr, bipp, bipr] = source_colorspace;
    //const dest_colorspace = new Int32Array([dest_size[0], dest_size[1], bypp, bypp * dest_size[0], bipp, bipp * dest_size[0]]);
    const dest_to_source_ratio = new Float32Array([source_colorspace[0] / dest_size[0], source_colorspace[1] / dest_size[1]]);
    const source_edge_distances = new Float32Array(4);
    //const source_corner_areas = new Float32Array(4);
    const edge_distances_proportions_of_total = new Float32Array(4);
    const edge_segment_areas_proportion_of_total_area = new Float32Array(4);
    const corner_areas_proportions_of_total = new Float32Array(4);
    const fpx_area = dest_to_source_ratio[0] * dest_to_source_ratio[1];

    each_source_dest_pixels_resized(source_colorspace, dest_size, (dest_xy, dest_byi, source_fbounds, source_ibounds, source_i_any_coverage_size, source_total_coverage_ibounds, byi_read) => {
        if (source_i_any_coverage_size[0] === 1 && source_i_any_coverage_size[1] === 1) {
            callback(dest_byi, source_i_any_coverage_size, undefined, undefined, byi_read);
        } else if (source_i_any_coverage_size[0] === 1 && source_i_any_coverage_size[1] === 2) {
            // 1x2 - won't need to provide as much info back.

            // only the top and bottom proportions matter here.
            source_edge_distances[1] = source_total_coverage_ibounds[1] - source_fbounds[1];
            source_edge_distances[3] = source_fbounds[3] - source_total_coverage_ibounds[3];

            if (source_edge_distances[1] === 0) source_edge_distances[1] = 1;
            if (source_edge_distances[3] === 0) source_edge_distances[3] = 1;

            edge_distances_proportions_of_total[1] = source_edge_distances[1] / dest_to_source_ratio[1];
            edge_distances_proportions_of_total[3] = source_edge_distances[3] / dest_to_source_ratio[1];

            // dest_byi, source_i_any_coverage_size, edge_distances_proportions_of_total, corner_areas_proportions_of_total, byi_read
            callback(dest_byi, source_i_any_coverage_size, edge_distances_proportions_of_total, undefined, byi_read);
            //callback(dest_xy, dest_byi, source_fbounds, source_ibounds, source_i_any_coverage_size, source_total_coverage_ibounds, source_edge_distances, undefined, edge_distances_proportions_of_total, undefined, byi_read);
        } else if (source_i_any_coverage_size[0] === 2 && source_i_any_coverage_size[1] === 1) {
            source_edge_distances[0] = source_total_coverage_ibounds[0] - source_fbounds[0];
            source_edge_distances[2] = source_fbounds[2] - source_total_coverage_ibounds[2];

            if (source_edge_distances[0] === 0) source_edge_distances[0] = 1;
            if (source_edge_distances[2] === 0) source_edge_distances[2] = 1;

            edge_distances_proportions_of_total[0] = source_edge_distances[0] / dest_to_source_ratio[0];
            edge_distances_proportions_of_total[2] = source_edge_distances[2] / dest_to_source_ratio[0];

            callback(dest_byi, source_i_any_coverage_size, edge_distances_proportions_of_total, undefined, byi_read);
        } else if (source_i_any_coverage_size[0] === 2 && source_i_any_coverage_size[1] === 2) {
            source_edge_distances[0] = source_total_coverage_ibounds[0] - source_fbounds[0];
            source_edge_distances[1] = source_total_coverage_ibounds[1] - source_fbounds[1];
            source_edge_distances[2] = source_fbounds[2] - source_total_coverage_ibounds[2];
            source_edge_distances[3] = source_fbounds[3] - source_total_coverage_ibounds[3];

            if (source_edge_distances[0] === 0) source_edge_distances[0] = 1;
            if (source_edge_distances[1] === 0) source_edge_distances[1] = 1;
            if (source_edge_distances[2] === 0) source_edge_distances[2] = 1;
            if (source_edge_distances[3] === 0) source_edge_distances[3] = 1;

            corner_areas_proportions_of_total[0] = source_edge_distances[0] * source_edge_distances[1] / fpx_area;
            corner_areas_proportions_of_total[1] = source_edge_distances[2] * source_edge_distances[1] / fpx_area;
            corner_areas_proportions_of_total[2] = source_edge_distances[0] * source_edge_distances[3] / fpx_area;
            corner_areas_proportions_of_total[3] = source_edge_distances[2] * source_edge_distances[3] / fpx_area;

            callback(dest_byi, source_i_any_coverage_size, undefined, corner_areas_proportions_of_total, byi_read);
            //callback(dest_xy, dest_byi, source_fbounds, source_ibounds, source_i_any_coverage_size, source_total_coverage_ibounds, source_edge_distances, undefined, undefined, corner_areas_proportions_of_total, byi_read);
        } else {

            source_edge_distances[0] = source_total_coverage_ibounds[0] - source_fbounds[0];
            source_edge_distances[1] = source_total_coverage_ibounds[1] - source_fbounds[1];
            source_edge_distances[2] = source_fbounds[2] - source_total_coverage_ibounds[2];
            source_edge_distances[3] = source_fbounds[3] - source_total_coverage_ibounds[3];

            if (source_edge_distances[0] === 0) source_edge_distances[0] = 1;
            if (source_edge_distances[1] === 0) source_edge_distances[1] = 1;
            if (source_edge_distances[2] === 0) source_edge_distances[2] = 1;
            if (source_edge_distances[3] === 0) source_edge_distances[3] = 1;

            edge_distances_proportions_of_total[0] = source_edge_distances[0] / fpx_area;
            edge_distances_proportions_of_total[1] = source_edge_distances[1] / fpx_area;
            edge_distances_proportions_of_total[2] = source_edge_distances[2] / fpx_area;
            edge_distances_proportions_of_total[3] = source_edge_distances[3] / fpx_area;

            edge_segment_areas_proportion_of_total_area[0] = source_edge_distances[0] * source_edge_distances[1] / fpx_area;
            edge_segment_areas_proportion_of_total_area[1] = source_edge_distances[2] * source_edge_distances[1] / fpx_area;
            edge_segment_areas_proportion_of_total_area[2] = source_edge_distances[0] * source_edge_distances[3] / fpx_area;
            edge_segment_areas_proportion_of_total_area[3] = source_edge_distances[2] * source_edge_distances[3] / fpx_area;

            callback(dest_byi, source_i_any_coverage_size, edge_distances_proportions_of_total, edge_segment_areas_proportion_of_total_area, byi_read);
        }
    });
}

// Then can make $inline version of above function.



const each_source_dest_pixels_resized_limited_further_info$inline = (source_colorspace, dest_size, callback) => {
    // This actually calculates the weights.

    // dest_byi, source_i_any_coverage_size, edge_distances_proportions_of_total, corner_areas_proportions_of_total, byi_read

    //const [width, height, bypp, bypr, bipp, bipr] = source_colorspace;
    //const dest_colorspace = new Int32Array([dest_size[0], dest_size[1], bypp, bypp * dest_size[0], bipp, bipp * dest_size[0]]);
    const dest_to_source_ratio = new Float32Array([source_colorspace[0] / dest_size[0], source_colorspace[1] / dest_size[1]]);
    const source_edge_distances = new Float32Array(4);
    //const source_corner_areas = new Float32Array(4);
    const edge_distances_proportions_of_total = new Float32Array(4);
    //const edge_segment_areas_proportion_of_total_area = new Float32Array(4);
    const corner_areas_proportions_of_total = new Float32Array(4);
    const fpx_area = dest_to_source_ratio[0] * dest_to_source_ratio[1];


    //  ------------


    let [width, height, bypp, bypr, bipp, bipr] = source_colorspace;
    const source_bypr = bypr;
    const dest_colorspace = new Int32Array([dest_size[0], dest_size[1], bypp, bypp * dest_size[0], bipp, bipp * dest_size[0]]);


    //const dest_to_source_ratio = new Float32Array([source_colorspace[0] / dest_size[0], source_colorspace[1] / dest_size[1]]);
    const source_fbounds = new Float32Array(4);
    const source_ibounds = new Int16Array(4);
    const source_i_any_coverage_size = new Int16Array(2);
    const source_total_coverage_ibounds = new Int16Array(4);
    let byi_read;



    let dest_byi = 0;
    //const dest_xy = new Int16Array(2);
    [width, height, bypp, bypr, bipp, bipr] = dest_colorspace;


    // Storing calculated values from the previous x?
    //  Precalculating an array of different variables for all x values.
    //  Then all y values are iterated so no benefit from precalc.
    //   edges etc

    // A lot more could be precalculated and then referenced.

    // Read a set of values from a larger ta for each x?
    //  Or refer to it.
    //  

    // Could make a version of this that does precalculations.


    let x, y;

    // could have next source pixel pos
    //  use it for bounds of the current pixel


    //for (dest_xy[1] = 0; dest_xy[1] < height; dest_xy[1]++) {
    for (y = 0; y < height; y++) {

        // Can optimize with calculations done just using y.


        source_fbounds[1] = y * dest_to_source_ratio[1];
        source_fbounds[3] = source_fbounds[1] + dest_to_source_ratio[1];
        source_ibounds[1] = source_fbounds[1];
        source_ibounds[3] = Math.ceil(source_fbounds[3]);
        source_i_any_coverage_size[1] = source_ibounds[3] - source_ibounds[1];
        source_total_coverage_ibounds[1] = Math.ceil(source_fbounds[1]);
        source_total_coverage_ibounds[3] = source_fbounds[3];

        source_edge_distances[1] = source_total_coverage_ibounds[1] - source_fbounds[1];
        source_edge_distances[3] = source_fbounds[3] - source_total_coverage_ibounds[3];
        if (source_edge_distances[1] === 0) source_edge_distances[1] = 1;
        if (source_edge_distances[3] === 0) source_edge_distances[3] = 1;

        edge_distances_proportions_of_total[1] = source_edge_distances[1] / fpx_area;
        edge_distances_proportions_of_total[3] = source_edge_distances[3] / fpx_area;

        for (x = 0; x < width; x++) {
            source_fbounds[0] = x * dest_to_source_ratio[0];
            source_fbounds[2] = source_fbounds[0] + dest_to_source_ratio[0];

            // And the total coverage bounds.
            //  will be useful for some things...
            // Total coverage size as well

            //source_farea = (source_fbounds[2] - )


            // Scale down the pixel location...
            source_ibounds[0] = source_fbounds[0];
            source_ibounds[2] = Math.ceil(source_fbounds[2]);

            // then the any coverage area...

            // does it cover other pixels / proportions in those other pixels?

            // Still reasonably fast - yet slowing down from before....
            source_i_any_coverage_size[0] = source_ibounds[2] - source_ibounds[0];
            byi_read = source_ibounds[0] * bypp + source_ibounds[1] * source_bypr;

            

            //callback(dest_xy, dest_byi, source_fbounds, source_ibounds, source_i_any_coverage_size, source_total_coverage_ibounds, byi_read);

            if (source_i_any_coverage_size[0] === 1 && source_i_any_coverage_size[1] === 1) {
                callback(dest_byi, source_i_any_coverage_size, undefined, undefined, byi_read);


            } else {

                source_total_coverage_ibounds[0] = Math.ceil(source_fbounds[0]);
                source_total_coverage_ibounds[2] = source_fbounds[2];

                

                if (source_i_any_coverage_size[0] === 1 && source_i_any_coverage_size[1] === 2) {
                    // 1x2 - won't need to provide as much info back.
        
                    // only the top and bottom proportions matter here.
                    //source_edge_distances[1] = source_total_coverage_ibounds[1] - source_fbounds[1];
                    //source_edge_distances[3] = source_fbounds[3] - source_total_coverage_ibounds[3];
        
                    
        
                    //edge_distances_proportions_of_total[1] = source_edge_distances[1] / dest_to_source_ratio[1];
                    //edge_distances_proportions_of_total[3] = source_edge_distances[3] / dest_to_source_ratio[1];
        
                    // dest_byi, source_i_any_coverage_size, edge_distances_proportions_of_total, corner_areas_proportions_of_total, byi_read
                    callback(dest_byi, source_i_any_coverage_size, edge_distances_proportions_of_total, undefined, byi_read);
                    //callback(dest_xy, dest_byi, source_fbounds, source_ibounds, source_i_any_coverage_size, source_total_coverage_ibounds, source_edge_distances, undefined, edge_distances_proportions_of_total, undefined, byi_read);
                } else {
                    source_edge_distances[0] = source_total_coverage_ibounds[0] - source_fbounds[0];
                    source_edge_distances[2] = source_fbounds[2] - source_total_coverage_ibounds[2];
        
                    if (source_edge_distances[0] === 0) source_edge_distances[0] = 1;
                    if (source_edge_distances[2] === 0) source_edge_distances[2] = 1;

                    if (source_i_any_coverage_size[0] === 2 && source_i_any_coverage_size[1] === 1) {
                        //source_edge_distances[0] = source_total_coverage_ibounds[0] - source_fbounds[0];
                        //source_edge_distances[2] = source_fbounds[2] - source_total_coverage_ibounds[2];
            
                        //if (source_edge_distances[0] === 0) source_edge_distances[0] = 1;
                        //if (source_edge_distances[2] === 0) source_edge_distances[2] = 1;
            
                        edge_distances_proportions_of_total[0] = source_edge_distances[0] / dest_to_source_ratio[0];
                        edge_distances_proportions_of_total[2] = source_edge_distances[2] / dest_to_source_ratio[0];
            
                        callback(dest_byi, source_i_any_coverage_size, edge_distances_proportions_of_total, undefined, byi_read);
                    } else if (source_i_any_coverage_size[0] === 2 && source_i_any_coverage_size[1] === 2) {
                        //source_edge_distances[0] = source_total_coverage_ibounds[0] - source_fbounds[0];
                        //source_edge_distances[1] = source_total_coverage_ibounds[1] - source_fbounds[1];
                        //source_edge_distances[2] = source_fbounds[2] - source_total_coverage_ibounds[2];
                        //source_edge_distances[3] = source_fbounds[3] - source_total_coverage_ibounds[3];
            
                        //if (source_edge_distances[0] === 0) source_edge_distances[0] = 1;
                        //if (source_edge_distances[1] === 0) source_edge_distances[1] = 1;
                        //if (source_edge_distances[2] === 0) source_edge_distances[2] = 1;
                        //if (source_edge_distances[3] === 0) source_edge_distances[3] = 1;
            
                        corner_areas_proportions_of_total[0] = source_edge_distances[0] * source_edge_distances[1] / fpx_area;
                        corner_areas_proportions_of_total[1] = source_edge_distances[2] * source_edge_distances[1] / fpx_area;
                        corner_areas_proportions_of_total[2] = source_edge_distances[0] * source_edge_distances[3] / fpx_area;
                        corner_areas_proportions_of_total[3] = source_edge_distances[2] * source_edge_distances[3] / fpx_area;
            
                        callback(dest_byi, source_i_any_coverage_size, undefined, corner_areas_proportions_of_total, byi_read);
                        //callback(dest_xy, dest_byi, source_fbounds, source_ibounds, source_i_any_coverage_size, source_total_coverage_ibounds, source_edge_distances, undefined, undefined, corner_areas_proportions_of_total, byi_read);
                    } else {
            
                        //source_edge_distances[0] = source_total_coverage_ibounds[0] - source_fbounds[0];
                        //source_edge_distances[1] = source_total_coverage_ibounds[1] - source_fbounds[1];
                        //source_edge_distances[2] = source_fbounds[2] - source_total_coverage_ibounds[2];
                        //source_edge_distances[3] = source_fbounds[3] - source_total_coverage_ibounds[3];
            
                        //if (source_edge_distances[0] === 0) source_edge_distances[0] = 1;
                        //if (source_edge_distances[1] === 0) source_edge_distances[1] = 1;
                        //if (source_edge_distances[2] === 0) source_edge_distances[2] = 1;
                        //if (source_edge_distances[3] === 0) source_edge_distances[3] = 1;
            
                        edge_distances_proportions_of_total[0] = source_edge_distances[0] / fpx_area;
                        //edge_distances_proportions_of_total[1] = source_edge_distances[1] / fpx_area;
                        edge_distances_proportions_of_total[2] = source_edge_distances[2] / fpx_area;
                        //edge_distances_proportions_of_total[3] = source_edge_distances[3] / fpx_area;


            
                        corner_areas_proportions_of_total[0] = source_edge_distances[0] * source_edge_distances[1] / fpx_area;
                        corner_areas_proportions_of_total[1] = source_edge_distances[2] * source_edge_distances[1] / fpx_area;
                        corner_areas_proportions_of_total[2] = source_edge_distances[0] * source_edge_distances[3] / fpx_area;
                        corner_areas_proportions_of_total[3] = source_edge_distances[2] * source_edge_distances[3] / fpx_area;
            
                        callback(dest_byi, source_i_any_coverage_size, edge_distances_proportions_of_total, corner_areas_proportions_of_total, byi_read);
                    }
                }
            }
            dest_byi += bypp;
        }
    }
}

// May be better for the larger pixel buffers.
each_source_dest_pixels_resized_limited_further_info = each_source_dest_pixels_resized_limited_further_info$inline;


// A varsion using more local variables, passing up to 9 params, could work well here.


//  Seems like it varies performance depending on circumstances.

// Could try more inlining...?
//  Not keen on inlining that slows it down.
//   Seeing that in some cases now.



// A fully inline subpixels only version.

// A fully inline superpixels only version.
//  Enlarging would mean that at least 2x2 would always be covered.


// Definitely worth going for subpixel optimized version.
//  Up to 2x2. 

// When doing the loop for the row, know in advance what height the row is, and therefor the lower bounds of all pixels there.
//  Don't need to calculate this stuff for each pixel.










// Maybe its worth porting some of these low level functions to C++.
//  They could then be used in more complete C++ function implementations.
//  They could also speed up some resizing in JS, but consider JS<->C++ overhead.



// In JS, could make more optimized version for smaller pixels / subpixels.
//  An inline loops, max js efficiency version...?






// As an experiment could make a C++ version of this and expose it through NAPI.
//  Longer inline function probably won't have same performance hit in C++, as it's already compiled.


const copy_px_24bipp = (ta_source, byi_read, ta_dest, byi_write) => {
    ta_dest[byi_write] = ta_source[byi_read++];
    ta_dest[byi_write + 1] = ta_source[byi_read++];
    ta_dest[byi_write + 2] = ta_source[byi_read++];
}





// Could make one that takes a 4 part weights.

// Other versions could take 8 part weights.





// versions that take a 4 part weights.



// Also, can make it take the byis in a ta.
//  

// ta_byi_reads

// C++ overhead could make these functions too slow.

const read_1x2_weight_write_24bipp = (ta_source, bypr, byi_read, ta_dest, byi_write, weight_t, weight_b) => {
    let byi_read_below = byi_read + bypr;
    ta_dest[byi_write] = weight_t * ta_source[byi_read++] + weight_b * ta_source[byi_read_below++];
    ta_dest[byi_write + 1] = weight_t * ta_source[byi_read++] + weight_b * ta_source[byi_read_below++];
    ta_dest[byi_write + 2] = weight_t * ta_source[byi_read++] + weight_b * ta_source[byi_read_below++];
}

const read_1x2_weight_write_24bipp$ta4byis = (ta_source, ta4byis, ta_dest, byi_write, weight_t, weight_b) => {
    //let byi_read_below = byi_read + bypr;
    ta_dest[byi_write] = weight_t * ta_source[ta4byis[0]++] + weight_b * ta_source[ta4byis[2]++];
    ta_dest[byi_write + 1] = weight_t * ta_source[ta4byis[0]++] + weight_b * ta_source[ta4byis[2]++];
    ta_dest[byi_write + 2] = weight_t * ta_source[ta4byis[0]++] + weight_b * ta_source[ta4byis[2]++];
}


const read_2x1_weight_write_24bipp = (ta_source, byi_read, ta_dest, byi_write, weight_l, weight_r) => {
    let byi_read_right = byi_read + 3;
    ta_dest[byi_write] = weight_l * ta_source[byi_read++] + weight_r * ta_source[byi_read_right++];
    ta_dest[byi_write + 1] = weight_l * ta_source[byi_read++] + weight_r * ta_source[byi_read_right++];
    ta_dest[byi_write + 2] = weight_l * ta_source[byi_read++] + weight_r * ta_source[byi_read_right++];
}
const read_2x1_weight_write_24bipp$ta4byis = (ta_source, ta4byis, ta_dest, byi_write, weight_l, weight_r) => {
    //let byi_read_right = byi_read + 3;
    ta_dest[byi_write] = weight_l * ta_source[ta4byis[0]++] + weight_r * ta_source[ta4byis[1]++];
    ta_dest[byi_write + 1] = weight_l * ta_source[ta4byis[0]++] + weight_r * ta_source[ta4byis[1]++];
    ta_dest[byi_write + 2] = weight_l * ta_source[ta4byis[0]++] + weight_r * ta_source[ta4byis[1]++];
}

// Faster to give it a ta of the byi_write indexes?
//  Seems not. 

const read_2x2_weight_write_24bipp = (ta_source, bypr, byi_read, ta_dest, byi_write, corner_weights_ltrb) => {
    let byi_read_right = byi_read + 3;
    let byi_read_below = byi_read + bypr;
    let byi_read_below_right = byi_read_below + 3;
    ta_dest[byi_write] = corner_weights_ltrb[0] * ta_source[byi_read++] + corner_weights_ltrb[1] * ta_source[byi_read_right++] + corner_weights_ltrb[2] * ta_source[byi_read_below++] + corner_weights_ltrb[3] * ta_source[byi_read_below_right++];
    ta_dest[byi_write + 1] = corner_weights_ltrb[0] * ta_source[byi_read++] + corner_weights_ltrb[1] * ta_source[byi_read_right++] + corner_weights_ltrb[2] * ta_source[byi_read_below++] + corner_weights_ltrb[3] * ta_source[byi_read_below_right++];
    ta_dest[byi_write + 2] = corner_weights_ltrb[0] * ta_source[byi_read++] + corner_weights_ltrb[1] * ta_source[byi_read_right++] + corner_weights_ltrb[2] * ta_source[byi_read_below++] + corner_weights_ltrb[3] * ta_source[byi_read_below_right++];
}

const read_2x2_weight_write_24bipp$locals = (ta_source, source_bypr, byi_read, 
    corner_p_tl, corner_p_tr, corner_p_bl, corner_p_br,                    
    ta_dest, byi_write) => {
    let byi_read_right = byi_read + 3;
    let byi_read_below = byi_read + source_bypr;
    let byi_read_below_right = byi_read_below + 3;
    ta_dest[byi_write] = corner_p_tl * ta_source[byi_read++] + corner_p_tr * ta_source[byi_read_right++] + corner_p_bl * ta_source[byi_read_below++] + corner_p_br * ta_source[byi_read_below_right++];
    ta_dest[byi_write + 1] = corner_p_tl * ta_source[byi_read++] + corner_p_tr * ta_source[byi_read_right++] + corner_p_bl * ta_source[byi_read_below++] + corner_p_br * ta_source[byi_read_below_right++];
    ta_dest[byi_write + 2] = corner_p_tl * ta_source[byi_read++] + corner_p_tr * ta_source[byi_read_right++] + corner_p_bl * ta_source[byi_read_below++] + corner_p_br * ta_source[byi_read_below_right++];

}

// Does not actually work out to be faster.
//  Not sure why. Maybe the values here do optimize well as local variables.

const read_2x2_weight_write_24bipp$ta4byis = (ta_source, ta4byis, ta_dest, byi_write, corner_weights_ltrb) => {
    //let byi_read_right = byi_read + 3;
    //let byi_read_below = byi_read + bypr;
    //let byi_read_below_right = byi_read_below + 3;
    ta_dest[byi_write] = corner_weights_ltrb[0] * ta_source[ta4byis[0]++] + corner_weights_ltrb[1] * ta_source[ta4byis[1]++] + corner_weights_ltrb[2] * ta_source[ta4byis[2]++] + corner_weights_ltrb[3] * ta_source[ta4byis[3]++];
    ta_dest[byi_write + 1] = corner_weights_ltrb[0] * ta_source[ta4byis[0]++] + corner_weights_ltrb[1] * ta_source[ta4byis[1]++] + corner_weights_ltrb[2] * ta_source[ta4byis[2]++] + corner_weights_ltrb[3] * ta_source[ta4byis[3]++];
    ta_dest[byi_write + 2] = corner_weights_ltrb[0] * ta_source[ta4byis[0]++] + corner_weights_ltrb[1] * ta_source[ta4byis[1]++] + corner_weights_ltrb[2] * ta_source[ta4byis[2]++] + corner_weights_ltrb[3] * ta_source[ta4byis[3]++];
}


// Now it's got slower taking these 2 ints in the params.
const read_2x2_weight_write_24bipp$2_weight_ints = (ta_source, bypr, byi_read, ta_dest, byi_write, ta_lt_props) => {

    // Calculate them each time???

    
    //const [l_prop, t_prop] = ta_lt_props;

    const tl = l_prop * t_prop;
    const tr = (1 - l_prop) * t_prop;
    const bl = l_prop * (1 - t_prop);
    const br = (1 - l_prop) * (1 - t_prop);

    let byi_read_right = byi_read + 3;
    let byi_read_below = byi_read + bypr;
    let byi_read_below_right = byi_read_below + 3;

    /*
    ta_dest[byi_write] = tl * ta_source[byi_read++] + tr * ta_source[byi_read_right++] + bl * ta_source[byi_read_below++] + br * ta_source[byi_read_below_right++];
    ta_dest[byi_write + 1] = tl * ta_source[byi_read++] + tr * ta_source[byi_read_right++] + bl * ta_source[byi_read_below++] + br * ta_source[byi_read_below_right++];
    ta_dest[byi_write + 2] = tl * ta_source[byi_read++] + tr * ta_source[byi_read_right++] + bl * ta_source[byi_read_below++] + br * ta_source[byi_read_below_right++];
    */

    
    ta_dest[byi_write] = l_prop * t_prop * ta_source[byi_read++] + (1 - l_prop) * t_prop * ta_source[byi_read_right++] + l_prop * (1 - t_prop) * ta_source[byi_read_below++] + (1 - l_prop) * (1 - t_prop) * ta_source[byi_read_below_right++];
    ta_dest[byi_write + 1] = l_prop * t_prop * ta_source[byi_read++] + (1 - l_prop) * t_prop * ta_source[byi_read_right++] + l_prop * (1 - t_prop) * ta_source[byi_read_below++] + (1 - l_prop) * (1 - t_prop) * ta_source[byi_read_below_right++];
    ta_dest[byi_write + 2] = l_prop * t_prop * ta_source[byi_read++] + (1 - l_prop) * t_prop * ta_source[byi_read_right++] + l_prop * (1 - t_prop) * ta_source[byi_read_below++] + (1 - l_prop) * (1 - t_prop) * ta_source[byi_read_below_right++];
}



const read_3x2_weight_write_24bipp = (ta_source, bypr, byi_read, edge_distances_proportions_of_total, corner_weights_ltrb, ta_dest, dest_byi) => {
    const bypp = 3;

    let byi_tl = byi_read;

    // will get summed up by reading 6 separate pixels, merging them together.
    //  18 (6*3) value components.


    // 6 weights:
    // corner_weights_ltrb[0], edge_distances_proportions_of_total[1], corner_weights_ltrb[1]
    // corner_weights_ltrb[2], edge_distances_proportions_of_total[2], corner_weights_ltrb[3]

    // write a merged color component with 1 function?

    // get array of 6 different read byte indexes / inputs?

    // byi_tl, byi_tm, byi_tr
    // byi_bl, byi_bm, byi_br

    let byi_tm = byi_tl + bypp, byi_tr = byi_tm + bypp;
    let byi_bl = byi_tm + bypr, byi_bm = byi_bl + bypp, byi_br = byi_bm + bypp;

    // r component
    ta_dest[dest_byi] =     ta_source[byi_tl++] * corner_weights_ltrb[0] + ta_source[byi_tm++] * edge_distances_proportions_of_total[1] + ta_source[byi_tr++] * corner_weights_ltrb[1] +
                            ta_source[byi_bl++] * corner_weights_ltrb[2] + ta_source[byi_bm++] * edge_distances_proportions_of_total[3] + ta_source[byi_br++] * corner_weights_ltrb[3];

    ta_dest[dest_byi + 1] = ta_source[byi_tl++] * corner_weights_ltrb[0] + ta_source[byi_tm++] * edge_distances_proportions_of_total[1] + ta_source[byi_tr++] * corner_weights_ltrb[1] +
                            ta_source[byi_bl++] * corner_weights_ltrb[2] + ta_source[byi_bm++] * edge_distances_proportions_of_total[3] + ta_source[byi_br++] * corner_weights_ltrb[3];
                            
    ta_dest[dest_byi + 2] = ta_source[byi_tl++] * corner_weights_ltrb[0] + ta_source[byi_tm++] * edge_distances_proportions_of_total[1] + ta_source[byi_tr++] * corner_weights_ltrb[1] +
                            ta_source[byi_bl++] * corner_weights_ltrb[2] + ta_source[byi_bm++] * edge_distances_proportions_of_total[3] + ta_source[byi_br++] * corner_weights_ltrb[3];
                            

}


const read_3x2_weight_write_24bipp$locals = (ta_source, bypr, byi_read, 
    edge_p_l, edge_p_t, edge_p_r, edge_p_b, 
    corner_p_tl, corner_p_tr, corner_p_bl, corner_p_br,
    ta_dest, dest_byi) => {
    const bypp = 3;


    let byi_tl = byi_read;

    let byi_tm = byi_tl + bypp, byi_tr = byi_tm + bypp;
    let byi_bl = byi_tm + bypr, byi_bm = byi_bl + bypp, byi_br = byi_bm + bypp;

    // r component
    ta_dest[dest_byi] =     ta_source[byi_tl++] * corner_p_tl + ta_source[byi_tm++] * edge_p_t + ta_source[byi_tr++] * corner_p_tr +
                            ta_source[byi_bl++] * corner_p_bl + ta_source[byi_bm++] * edge_p_b + ta_source[byi_br++] * corner_p_br;

    ta_dest[dest_byi + 1] = ta_source[byi_tl++] * corner_p_tl + ta_source[byi_tm++] * edge_p_t + ta_source[byi_tr++] * corner_p_tr +
                            ta_source[byi_bl++] * corner_p_bl + ta_source[byi_bm++] * edge_p_b + ta_source[byi_br++] * corner_p_br;
                            
    ta_dest[dest_byi + 2] = ta_source[byi_tl++] * corner_p_tl + ta_source[byi_tm++] * edge_p_t + ta_source[byi_tr++] * corner_p_tr +
                            ta_source[byi_bl++] * corner_p_bl + ta_source[byi_bm++] * edge_p_b + ta_source[byi_br++] * corner_p_br;
    

}


const read_2x3_weight_write_24bipp = (ta_source, bypr, byi_read, edge_distances_proportions_of_total, corner_weights_ltrb, ta_dest, dest_byi) => {
    const bypp = 3;

    let byi_tl = byi_read, byi_tr = byi_tl + bypp;
    let byi_ml = byi_tl + bypr, byi_mr = byi_ml + bypp;
    let byi_bl = byi_ml + bypr, byi_br = byi_bl + bypp;

    ta_dest[dest_byi] =     ta_source[byi_tl++] * corner_weights_ltrb[0] + ta_source[byi_tr++] * corner_weights_ltrb[1] +
                            ta_source[byi_ml++] * edge_distances_proportions_of_total[0] + ta_source[byi_mr++] * edge_distances_proportions_of_total[2] +
                            ta_source[byi_bl++] * corner_weights_ltrb[2] + ta_source[byi_br++] * corner_weights_ltrb[3]


    ta_dest[dest_byi + 1] = ta_source[byi_tl++] * corner_weights_ltrb[0] + ta_source[byi_tr++] * corner_weights_ltrb[1] +
                            ta_source[byi_ml++] * edge_distances_proportions_of_total[0] + ta_source[byi_mr++] * edge_distances_proportions_of_total[2] +
                            ta_source[byi_bl++] * corner_weights_ltrb[2] + ta_source[byi_br++] * corner_weights_ltrb[3]


    ta_dest[dest_byi + 2] = ta_source[byi_tl++] * corner_weights_ltrb[0] + ta_source[byi_tr++] * corner_weights_ltrb[1] +
                            ta_source[byi_ml++] * edge_distances_proportions_of_total[0] + ta_source[byi_mr++] * edge_distances_proportions_of_total[2] +
                            ta_source[byi_bl++] * corner_weights_ltrb[2] + ta_source[byi_br++] * corner_weights_ltrb[3]


}

const read_2x3_weight_write_24bipp$locals = (ta_source, bypr, byi_read, 
    edge_p_l, edge_p_t, edge_p_r, edge_p_b, 
    corner_p_tl, corner_p_tr, corner_p_bl, corner_p_br,
    ta_dest, dest_byi) => {
    
    let byi_tl = byi_read, byi_tr = byi_tl + 3;
    let byi_ml = byi_tl + bypr, byi_mr = byi_ml + 3;
    let byi_bl = byi_ml + bypr, byi_br = byi_bl + 3;

    ta_dest[dest_byi] =     ta_source[byi_tl++] * corner_p_tl + ta_source[byi_tr++] * corner_p_tr +
                            ta_source[byi_ml++] * edge_p_l + ta_source[byi_mr++] * edge_p_r +
                            ta_source[byi_bl++] * corner_p_bl + ta_source[byi_br++] * corner_p_br


    ta_dest[dest_byi + 1] = ta_source[byi_tl++] * corner_p_tl + ta_source[byi_tr++] * corner_p_tr +
                            ta_source[byi_ml++] * edge_p_l + ta_source[byi_mr++] * edge_p_r +
                            ta_source[byi_bl++] * corner_p_bl + ta_source[byi_br++] * corner_p_br


    ta_dest[dest_byi + 2] = ta_source[byi_tl++] * corner_p_tl + ta_source[byi_tr++] * corner_p_tr +
                            ta_source[byi_ml++] * edge_p_l + ta_source[byi_mr++] * edge_p_r +
                            ta_source[byi_bl++] * corner_p_bl + ta_source[byi_br++] * corner_p_br
    

}


// read_3x3_weight_write_24bipp
const read_3x3_weight_write_24bipp = (ta_source, bypr, byi_read, edge_weights, corner_weights_ltrb, fpx_area_recip, ta_dest, dest_byi) => {
    const bypp = 3;

    // middle weight - need to know the area, or 1/area.

    //console.log('read_3x3_weight_write_24bipp');
    //console.log('edge_distances_proportions_of_total, corner_weights_ltrb, fpx_area_recip', [edge_distances_proportions_of_total, corner_weights_ltrb, fpx_area_recip]);


    // fpx_area_recip


    let byi_tl = byi_read, byi_tm = byi_tl + bypp, byi_tr = byi_tm + bypp;
    let byi_ml = byi_tl + bypr, byi_mm = byi_ml + bypp, byi_mr = byi_mm + bypp;
    let byi_bl = byi_ml + bypr, byi_bm = byi_bl + bypp, byi_br = byi_bm + bypp;

    // Doing it component by component.

    ta_dest[dest_byi] =     ta_source[byi_tl++] * corner_weights_ltrb[0] + ta_source[byi_tm++] * edge_weights[1] + ta_source[byi_tr++] * corner_weights_ltrb[1] +
                            ta_source[byi_ml++] * edge_weights[0] + ta_source[byi_mm++] * fpx_area_recip + ta_source[byi_mr++] * edge_weights[2] +
                            ta_source[byi_bl++] * corner_weights_ltrb[2] + ta_source[byi_bm++] * edge_weights[3] + ta_source[byi_br++] * corner_weights_ltrb[3]


    ta_dest[dest_byi + 1] = ta_source[byi_tl++] * corner_weights_ltrb[0] + ta_source[byi_tm++] * edge_weights[1] + ta_source[byi_tr++] * corner_weights_ltrb[1] +
                            ta_source[byi_ml++] * edge_weights[0] + ta_source[byi_mm++] * fpx_area_recip + ta_source[byi_mr++] * edge_weights[2] +
                            ta_source[byi_bl++] * corner_weights_ltrb[2] + ta_source[byi_bm++] * edge_weights[3] + ta_source[byi_br++] * corner_weights_ltrb[3]


    ta_dest[dest_byi + 2] = ta_source[byi_tl++] * corner_weights_ltrb[0] + ta_source[byi_tm++] * edge_weights[1] + ta_source[byi_tr++] * corner_weights_ltrb[1] +
                            ta_source[byi_ml++] * edge_weights[0] + ta_source[byi_mm++] * fpx_area_recip + ta_source[byi_mr++] * edge_weights[2] +
                            ta_source[byi_bl++] * corner_weights_ltrb[2] + ta_source[byi_bm++] * edge_weights[3] + ta_source[byi_br++] * corner_weights_ltrb[3]


    //console.trace();
    //throw 'stop';
}

const read_3x3_weight_write_24bipp$locals = (ta_source, bypr, byi_read, 
    edge_p_l, edge_p_t, edge_p_r, edge_p_b, 
    corner_p_tl, corner_p_tr, corner_p_bl, corner_p_br,
    fpx_area_recip, 
    ta_dest, dest_byi) => {
    const bypp = 3;

    // middle weight - need to know the area, or 1/area.

    //console.log('read_3x3_weight_write_24bipp');
    //console.log('edge_distances_proportions_of_total, corner_weights_ltrb, fpx_area_recip', [edge_distances_proportions_of_total, corner_weights_ltrb, fpx_area_recip]);


    // fpx_area_recip


    let byi_tl = byi_read, byi_tm = byi_tl + bypp, byi_tr = byi_tm + bypp;
    let byi_ml = byi_tl + bypr, byi_mm = byi_ml + bypp, byi_mr = byi_mm + bypp;
    let byi_bl = byi_ml + bypr, byi_bm = byi_bl + bypp, byi_br = byi_bm + bypp;

    // Doing it component by component.

    ta_dest[dest_byi] =     ta_source[byi_tl++] * corner_p_tl + ta_source[byi_tm++] * edge_p_t + ta_source[byi_tr++] * corner_p_tr +
                            ta_source[byi_ml++] * edge_p_l + ta_source[byi_mm++] * fpx_area_recip + ta_source[byi_mr++] * edge_p_r +
                            ta_source[byi_bl++] * corner_p_bl + ta_source[byi_bm++] * edge_p_b + ta_source[byi_br++] * corner_p_br


    ta_dest[dest_byi + 1] = ta_source[byi_tl++] * corner_p_tl + ta_source[byi_tm++] * edge_p_t + ta_source[byi_tr++] * corner_p_tr +
                            ta_source[byi_ml++] * edge_p_l + ta_source[byi_mm++] * fpx_area_recip + ta_source[byi_mr++] * edge_p_r +
                            ta_source[byi_bl++] * corner_p_bl + ta_source[byi_bm++] * edge_p_b + ta_source[byi_br++] * corner_p_br


    ta_dest[dest_byi + 2] = ta_source[byi_tl++] * corner_p_tl + ta_source[byi_tm++] * edge_p_t + ta_source[byi_tr++] * corner_p_tr +
                            ta_source[byi_ml++] * edge_p_l + ta_source[byi_mm++] * fpx_area_recip + ta_source[byi_mr++] * edge_p_r +
                            ta_source[byi_bl++] * corner_p_bl + ta_source[byi_bm++] * edge_p_b + ta_source[byi_br++] * corner_p_br


    //console.trace();
    //throw 'stop';
}


// 3x4 and 4x3 special cases?


// This may be a very good candidate for porting to C++.
//  C++ to wasm could work in both node and browser.

/*


    // edge_segment_areas_proportion_of_total_area

    // Looks like we need to fix handling for when a pixel is directly touching an edge.
    //  The edge distance in that case is 0.
    //   However, we need the full weight of that edge - or this merging algo to be bypassed.

    // May need to trace and stop the cases earlier when the fpos =equals= matches the ipos.
    //  And ensure total and partial coverage numbers are correct.

    // edge_distances_proportions_of_total
    // edge_distances_proportions_of_total_distance
    // edge_segment_areas_proportion_of_total_area

    // Need to fix this elsewhere in the resize stack.
    //  Should not try to make use of these values here - they are basically computed weights for smaller (1 or 2 px in a dimension?) pixels.
    //  Should have area-divided values provided here.


    //  this is not giving the proper weightings for usage in this grid.
    //   these distances are a proportion of total distance.
    //    we need coverage of that pixel proportional to the area of the fpx.

    // These are useful when it's a thin item and we don't use the corners measurements.



    // will do an xy loop.

    // could use local x and y variables.

    // Use an accumularor / 3 variables.

    //console.log('read_gt3x3_weight_write_24bipp source_i_any_coverage_size', source_i_any_coverage_size);
    //console.log('edge_distances_proportions_of_total, corner_weights_ltrb, fpx_area_recip', [edge_distances_proportions_of_total, corner_weights_ltrb, fpx_area_recip]);

    // Need to deal with row reading properly.

*/

// give it a scratch rgb accumulator?

//let r = 0, g = 0, b = 0;
//let x, y;


const read_gt3x3_weight_write_24bipp = (ta_source, bypr, byi_read, source_i_any_coverage_size, edge_distances_proportions_of_total, corner_weights_ltrb, fpx_area_recip, ta_dest, dest_byi) => {
    const byi_tl = byi_read;
    //byi_read = byi_tl;
    let r = 0, g = 0, b = 0;
    // Separate loops...
    //  Worth having an inner row loop too.
    let x, y;
    const end_hmiddle = source_i_any_coverage_size[0] - 1, end_vmiddle = source_i_any_coverage_size[1] - 1;

    //const [w, h] = source_i_any_coverage_size;

    //console.log('bypr, byi_read, source_i_any_coverage_size', bypr, byi_read, source_i_any_coverage_size);
    //console.log('[edge_distances_proportions_of_total, corner_weights_ltrb, fpx_area_recip]', [edge_distances_proportions_of_total, corner_weights_ltrb, fpx_area_recip]);

    r += ta_source[byi_read++] * corner_weights_ltrb[0];
    g += ta_source[byi_read++] * corner_weights_ltrb[0];
    b += ta_source[byi_read++] * corner_weights_ltrb[0];

    // loop through the middle section of the top row.

    //x = 1;
    

    for (x = 1; x < end_hmiddle; x++) {
        r += ta_source[byi_read++] * edge_distances_proportions_of_total[1];
        g += ta_source[byi_read++] * edge_distances_proportions_of_total[1];
        b += ta_source[byi_read++] * edge_distances_proportions_of_total[1];
    }

    r += ta_source[byi_read++] * corner_weights_ltrb[1];
    g += ta_source[byi_read++] * corner_weights_ltrb[1];
    b += ta_source[byi_read++] * corner_weights_ltrb[1];

    // then loop through the v middle rows.

    for (y = 1; y < end_vmiddle; y++) {
        byi_read = byi_tl + y * bypr;

        r += ta_source[byi_read++] * edge_distances_proportions_of_total[0];
        g += ta_source[byi_read++] * edge_distances_proportions_of_total[0];
        b += ta_source[byi_read++] * edge_distances_proportions_of_total[0];

        for (x = 1; x < end_hmiddle; x++) {
            r += ta_source[byi_read++] * fpx_area_recip;
            g += ta_source[byi_read++] * fpx_area_recip;
            b += ta_source[byi_read++] * fpx_area_recip;
        }

        r += ta_source[byi_read++] * edge_distances_proportions_of_total[2];
        g += ta_source[byi_read++] * edge_distances_proportions_of_total[2];
        b += ta_source[byi_read++] * edge_distances_proportions_of_total[2];
    }
    byi_read = byi_tl + end_vmiddle * bypr;
    // then the bottom vrow
    r += ta_source[byi_read++] * corner_weights_ltrb[2];
    g += ta_source[byi_read++] * corner_weights_ltrb[2];
    b += ta_source[byi_read++] * corner_weights_ltrb[2];
    // loop through the middle section of the top row.
    //x = 1;

    //const end_hmiddle = w - 1, end_vmiddle = h - 1;

    for (x = 1; x < end_hmiddle; x++) {
        r += ta_source[byi_read++] * edge_distances_proportions_of_total[3];
        g += ta_source[byi_read++] * edge_distances_proportions_of_total[3];
        b += ta_source[byi_read++] * edge_distances_proportions_of_total[3];
    }

    r += ta_source[byi_read++] * corner_weights_ltrb[3];
    g += ta_source[byi_read++] * corner_weights_ltrb[3];
    b += ta_source[byi_read++] * corner_weights_ltrb[3];

    //console.log('[r, g, b]', [r, g, b]);

    /*

    if (false && (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255)) {

        //console.log('byi_read', byi_read);

        console.log('[r, g, b]', [r, g, b]);
        console.log('[bypr, byi_read, source_i_any_coverage_size]', [bypr, byi_read, source_i_any_coverage_size]);
        console.log('[edge_distances_proportions_of_total, corner_weights_ltrb, fpx_area_recip]', [edge_distances_proportions_of_total, corner_weights_ltrb, fpx_area_recip]);

        console.trace();
        throw 'stop';

    }
    */

    ta_dest[dest_byi] = Math.round(r);
    ta_dest[dest_byi + 1] = Math.round(g);
    ta_dest[dest_byi + 2] = Math.round(b);
}



const read_gt3x3_weight_write_24bipp$locals = (ta_source, bypr, byi_read, 
    //source_i_any_coverage_size,
    any_coverage_w, any_coverage_h,
    //edge_distances_proportions_of_total,
    edge_p_l, edge_p_t, edge_p_r, edge_p_b,
    //corner_weights_ltrb,
    corner_p_tl, corner_p_tr, corner_p_bl, corner_p_br,
    fpx_area_recip, 
    ta_dest, dest_byi) => {
    const byi_tl = byi_read;
    //byi_read = byi_tl;
    let r = 0, g = 0, b = 0;
    // Separate loops...
    //  Worth having an inner row loop too.
    let x, y;
    const end_hmiddle = any_coverage_w - 1, end_vmiddle = any_coverage_h - 1;

    //const [w, h] = source_i_any_coverage_size;

    //console.log('bypr, byi_read, source_i_any_coverage_size', bypr, byi_read, source_i_any_coverage_size);
    //console.log('[edge_distances_proportions_of_total, corner_weights_ltrb, fpx_area_recip]', [edge_distances_proportions_of_total, corner_weights_ltrb, fpx_area_recip]);

    r += ta_source[byi_read++] * corner_p_tl;
    g += ta_source[byi_read++] * corner_p_tl;
    b += ta_source[byi_read++] * corner_p_tl;

    // loop through the middle section of the top row.

    //x = 1;
    

    for (x = 1; x < end_hmiddle; x++) {
        r += ta_source[byi_read++] * edge_p_t;
        g += ta_source[byi_read++] * edge_p_t;
        b += ta_source[byi_read++] * edge_p_t;
    }

    r += ta_source[byi_read++] * corner_p_tr;
    g += ta_source[byi_read++] * corner_p_tr;
    b += ta_source[byi_read++] * corner_p_tr;

    // then loop through the v middle rows.

    for (y = 1; y < end_vmiddle; y++) {
        byi_read = byi_tl + y * bypr;

        r += ta_source[byi_read++] * edge_p_l;
        g += ta_source[byi_read++] * edge_p_l;
        b += ta_source[byi_read++] * edge_p_l;

        for (x = 1; x < end_hmiddle; x++) {
            r += ta_source[byi_read++] * fpx_area_recip;
            g += ta_source[byi_read++] * fpx_area_recip;
            b += ta_source[byi_read++] * fpx_area_recip;
        }

        r += ta_source[byi_read++] * edge_p_r;
        g += ta_source[byi_read++] * edge_p_r;
        b += ta_source[byi_read++] * edge_p_r;
    }
    byi_read = byi_tl + end_vmiddle * bypr;
    // then the bottom vrow
    r += ta_source[byi_read++] * corner_p_bl;
    g += ta_source[byi_read++] * corner_p_bl;
    b += ta_source[byi_read++] * corner_p_bl;
    // loop through the middle section of the top row.
    //x = 1;

    //const end_hmiddle = w - 1, end_vmiddle = h - 1;

    for (x = 1; x < end_hmiddle; x++) {
        r += ta_source[byi_read++] * edge_p_b;
        g += ta_source[byi_read++] * edge_p_b;
        b += ta_source[byi_read++] * edge_p_b;
    }

    r += ta_source[byi_read++] * corner_p_br;
    g += ta_source[byi_read++] * corner_p_br;
    b += ta_source[byi_read++] * corner_p_br;

    //console.log('[r, g, b]', [r, g, b]);

    /*

    if (false && (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255)) {

        //console.log('byi_read', byi_read);

        console.log('[r, g, b]', [r, g, b]);
        console.log('[bypr, byi_read, source_i_any_coverage_size]', [bypr, byi_read, source_i_any_coverage_size]);
        console.log('[edge_distances_proportions_of_total, corner_weights_ltrb, fpx_area_recip]', [edge_distances_proportions_of_total, corner_weights_ltrb, fpx_area_recip]);

        console.trace();
        throw 'stop';

    }
    */

    ta_dest[dest_byi] = Math.round(r);
    ta_dest[dest_byi + 1] = Math.round(g);
    ta_dest[dest_byi + 2] = Math.round(b);
}




// And the 2x3 function.
//  Made out of different pixels from the source.

// Will need 3x3 as well for various transformations.
//  Also, need to write general algorithm that reads and applies weights from a space.
//  Smaller read / merge (probably) work faster without a loop. Can investigate though...


// A version not just for subpixels...
//  Though I wrote this to be optimized for subpixels, with more work it can handle superpixel size.
//   Now I'm considering making a subpixel specific optimized version.
// 
// Also a version that will handle smaller upscales...
//  with the covered pixel size no larger than 3x3.

// A version with faster iteration would help - not using these layered callbacks.
//  That version would be easier to port to C++ too.



// the optimized loop for 1x1, 1x2, 2x1?
//  This would be for image shrinking.

// Then 2x2, 2x3, 3x2 for upscaling by not so large amounts.

// Working out the potential full coverage areas for any pixel.
//  [ceil(fw) + 1]. 1.1 width could have partial coverage over 3 pixels width.

// Want a boilerplate / bare bones inline loop of the positions.
//  Optimized versions depending on the size of the fpixel makes a lot of sense.
//   And using a loop system without callbacks that prob will be faster, and then will be easier to port to C++.

// Want to incorporate building wasm into the npm install / gyp? build.
//  gyp for wasm?


// The read and merge functions seem fairly optimal at the moment.
//  If they didn't declare their own variables, but took a scratch / working typed array?








// resize_ta_colorspace_24bipp$shrink
// resize_ta_colorspace_24bipp$enlarge
//  enlargement will only use subpixels size [<1, <1] so the coverage area will vary from 1x1 to 2x2.
//   a few cases can be handled efficiently.

//  Also, precalculate various values (perhaps arranged in a single ta) for variables that apply to any dest x value.
//   boolean values - extends right and extends down
//    or integer values of how many millipixels it extends...

// A mostly int arithmatic version would be of use when dealing with subpixels. Maybe in other cases too.

//  Int32 millipixels? impx - integer millipixels
//   Suitable for fine scales.

// 2x1 Precalculate l-r weights for x values for rows that don't extend below the pixel boundary.
// Precalculate l-r proportions for all x values.
//  (subpixels only so far)
//  It would work with any values that depend just on x.
//   Proportions of various parts / named measurements of horizontal edges can be procomputed for x values.

// Precompute some valued for how for down the int pixel they start?




// Later, could have 












// Faster using some local variables and not only using tas and their positions.
const __resize_ta_colorspace_24bipp$subpixel = (ta_source, source_colorspace, dest_size, ta_dest) => {
    //console.log('resize_ta_colorspace_24bipp$subpixel');
    // Simplified this function.
    //  Seems like a small perf cost with the extra function calls used.
    //   Could optimize - not setting any weights when its 1x1, not doing the measurements.

    // C++ versions of the functions that run in here would be of use.
    //  May also be better to use functions for single pixel , 2x1 etc read-merge-write operations.
    //   Would make this function significantly shorter overall, and act more as a function dispatcher.

    //const [width, height, bypp, bypr, bipp, bipr] = source_colorspace;

    const source_bypp = source_colorspace[2];
    const source_bypr = source_colorspace[3];


    //const dest_colorspace = new Int32Array([dest_size[0], dest_size[1], bypp, bypp * dest_size[0], bipp, bipp * dest_size[0]]);
    //const dest_to_source_ratio = new Float32Array([source_colorspace[0] / dest_size[0], source_colorspace[1] / dest_size[1]]);


    // Could work well precalculating y values, then looking them up.
    //  Meaning values that depend on y.

    // Then only when it's corners do we need to do a calculation with them.

    //  The proportions could even be in integer thousanths...?

    // So the total area of 1 px would be 1000000
    //  Floating point fractions seem easiest here.
    //  and always just calculate the other proportion as 1-a?

    


    // Calculations suh as 1-x may be faster than looking up from memory / array.

    const [f_px_w, f_px_h] = [source_colorspace[0] / dest_size[0], source_colorspace[1] / dest_size[1]];


    let f_source_x, f_source_r;
    let i_source_l, i_source_lr_crossover;

    let f_source_y, f_source_b;
    let i_source_t, i_source_tb_crossover;

    let i_dest_x, i_dest_y;


    // Typed arrays of the corresponding source(tl) positions / byte offsets?
    //  Storing / caching calculated byte offsets for x and y source reads could speed things up...?
    const ta_left_proportions = new Float32Array(dest_size[0]);
    const ta_top_proportions = new Float32Array(dest_size[1]);

    const ta_source_x = new Int16Array(dest_size[0]);
    const ta_source_y = new Int16Array(dest_size[1]);

    const ta_source_x_byi_component = new Int32Array(dest_size[0]);
    const ta_source_y_byi_component = new Int32Array(dest_size[1]);

    


    for (i_dest_x = 0; i_dest_x < dest_size[0]; i_dest_x++) {

        // Calc proportion l and proportion r.
        //  Maybe that's all we need.

        f_source_x = i_dest_x * f_px_w;
        f_source_r = f_source_x + f_px_w;
        i_source_l = Math.floor(f_source_x);
        i_source_lr_crossover = i_source_l + 1;

        ta_source_x[i_dest_x] = i_source_l;
        ta_source_x_byi_component[i_dest_x] = i_source_l * source_bypp;


        if (f_source_r < i_source_lr_crossover || i_source_l === f_source_x) {
            ta_left_proportions[i_dest_x] = 1;
        } else {
            //1 - (f_source_r - i_source_lr_crossover) / f_px_w;

            ta_left_proportions[i_dest_x] = (i_source_lr_crossover - f_source_x) / f_px_w;
        }
        //ta_left_proportions[x] = 
    }


    // we only really need to values to calculate all corner weightings as well.
    //  left edge proportion, top edge proportion. multiply the proportions, it should work...

    for (i_dest_y = 0; i_dest_y < dest_size[1]; i_dest_y++) {

        // Calc proportion l and proportion r.
        //  Maybe that's all we need.

        f_source_y = i_dest_y * f_px_h;
        f_source_b = f_source_y + f_px_h;
        i_source_t = Math.floor(f_source_y);
        i_source_tb_crossover = i_source_t + 1;

        ta_source_y[i_dest_y] = i_source_t;
        ta_source_y_byi_component[i_dest_y] = i_source_t * source_bypr;


        if (f_source_b < i_source_tb_crossover || i_source_t === f_source_y) {
            ta_top_proportions[i_dest_y] = 1;
        } else {
            //1 - (f_source_r - i_source_lr_crossover) / f_px_w;

            ta_top_proportions[i_dest_y] = (i_source_tb_crossover - f_source_y) / f_px_h;
        }
        //ta_left_proportions[x] = 
    }
    // then do the normal nested loop yx iteration
    //  will look up values to calculate...

    //  then will write inline directly?
    //   may be best to use copy-weight-write functions first.
    //    ones that take number params for weights, done simply?

    // edge proportion typed array is probably better / faster.


    //let l_prop, t_prop, r_prop, b_prop;

    const ta_ltrb_edge_props = new Float32Array(4);

    // //const [width, height, bypp, bypr, bipp, bipr] = source_colorspace;

    // keep recalculating the source byte index?

    let byi_source;
    let byi_write = 0;

    //const ta_tl_weight_props = new Float32Array(2);
    //const ta_byi_reads = new Int32Array(4);

    // All 4 corner weight proportions may be best...
    const ta_ltrb_corner_props = new Float32Array(4);


    // Had bug, fixed...
    for (i_dest_y = 0; i_dest_y < dest_size[1]; i_dest_y++) {
        ta_ltrb_edge_props[1] = ta_top_proportions[i_dest_y];
        ta_ltrb_edge_props[3] = 1 - ta_top_proportions[i_dest_y];
        //ta_tl_weight_props[1] = t_prop;
        for (i_dest_x = 0; i_dest_x < dest_size[0]; i_dest_x++) {
            ta_ltrb_edge_props[0] = ta_left_proportions[i_dest_x];
            ta_ltrb_edge_props[2] = 1 - ta_left_proportions[i_dest_x];

            byi_source = ta_source_x_byi_component[i_dest_x] + ta_source_y_byi_component[i_dest_y];

            //ta_byi_reads[0] = ta_source_x_byi_component[i_dest_x] + ta_source_y_byi_component[i_dest_y];
            //  a typed array of the source byte indexes?

            if (ta_ltrb_edge_props[0] === 1) {
                if (ta_ltrb_edge_props[1] === 1) {
                    copy_px_24bipp(ta_source, byi_source, ta_dest, byi_write);
                } else {
                    //ta_byi_reads[2] = ta_byi_reads[0] + source_bypr;
                    read_1x2_weight_write_24bipp(ta_source, source_bypr, byi_source, ta_dest, byi_write, ta_ltrb_edge_props[1], ta_ltrb_edge_props[3]);
                }
            } else {
                if (ta_ltrb_edge_props[1] === 1) {
                    //ta_byi_reads[1] = ta_byi_reads[0] + source_bypp;
                    read_2x1_weight_write_24bipp(ta_source, byi_source, ta_dest, byi_write, ta_ltrb_edge_props[0], ta_ltrb_edge_props[2]);
                } else {
                    //ta_tl_weight_props[0] = l_prop;
                    //ta_ltrb_corner_props[0] = l_prop * ;
                    //ta_byi_reads[1] = ta_byi_reads[0] + source_bypp;
                    //ta_byi_reads[2] = ta_byi_reads[0] + source_bypr;
                    //ta_byi_reads[3] = ta_byi_reads[2] + source_bypp;

                    ta_ltrb_corner_props[0] = ta_ltrb_edge_props[0] * ta_ltrb_edge_props[1];
                    ta_ltrb_corner_props[1] = ta_ltrb_edge_props[2] * ta_ltrb_edge_props[1];
                    ta_ltrb_corner_props[2] = ta_ltrb_edge_props[0] * ta_ltrb_edge_props[3];
                    ta_ltrb_corner_props[3] = ta_ltrb_edge_props[2] * ta_ltrb_edge_props[3];
                    

                    // need the typed array of corner weights?
                    //  function was going much slower with the $2_weight_ints version.


                    //read_2x2_weight_write_24bipp$2_weight_ints(ta_source, byi_source, source_bypr, ta_dest, byi_write, ta_tl_weight_props);

                    // Surprising that below function works faster in a different loop!
                    read_2x2_weight_write_24bipp(ta_source, source_bypr, byi_source, ta_dest, byi_write, ta_ltrb_corner_props);


                    // Then inlining the read_2x2_weight_write_24bipp function could speed it up?
                }
            }

            byi_write += 3;
        }
    }
}



// Faster using some local variables and not only using tas and their positions.
const resize_ta_colorspace_24bipp$subpixel$inline = (ta_source, source_colorspace, dest_size, ta_dest) => {
    const source_bypp = source_colorspace[2];
    const source_bypr = source_colorspace[3];
    const [f_px_w, f_px_h] = [source_colorspace[0] / dest_size[0], source_colorspace[1] / dest_size[1]];

    let f_source_x, f_source_r;
    let i_source_l, i_source_lr_crossover;

    let f_source_y, f_source_b;
    let i_source_t, i_source_tb_crossover;

    let i_dest_x, i_dest_y;


    // Typed arrays of the corresponding source(tl) positions / byte offsets?
    //  Storing / caching calculated byte offsets for x and y source reads could speed things up...?
    const ta_left_proportions = new Float32Array(dest_size[0]);
    const ta_top_proportions = new Float32Array(dest_size[1]);

    //const ta_source_x = new Int16Array(dest_size[0]);
    //const ta_source_y = new Int16Array(dest_size[1]);

    const ta_source_x_byi_component = new Int32Array(dest_size[0]);
    //const ta_source_y_byi_component = new Int32Array(dest_size[1]);

    // all the edges and corners / proportions as local variables.

    

    
    for (i_dest_x = 0; i_dest_x < dest_size[0]; i_dest_x++) {

        // Calc proportion l and proportion r.
        //  Maybe that's all we need.

        f_source_x = i_dest_x * f_px_w;
        f_source_r = f_source_x + f_px_w;
        i_source_l = Math.floor(f_source_x);
        i_source_lr_crossover = i_source_l + 1;

        //ta_source_x[i_dest_x] = i_source_l;
        ta_source_x_byi_component[i_dest_x] = i_source_l * source_bypp;


        if (f_source_r < i_source_lr_crossover || i_source_l === f_source_x) {
            ta_left_proportions[i_dest_x] = 1;
        } else {
            ta_left_proportions[i_dest_x] = (i_source_lr_crossover - f_source_x) / f_px_w;
        }
        //ta_left_proportions[x] = 
    }

    let byi_source;
    let byi_write = 0;

    //const ta_tl_weight_props = new Float32Array(2);
    //const ta_byi_reads = new Int32Array(4);

    // All 4 corner weight proportions may be best...
    //const ta_ltrb_corner_props = new Float32Array(4);

    let byi_read_below, byi_read_right, byi_read_below_right;

    let edge_l, edge_t, edge_r, edge_b;
    let corner_tl, corner_tr, corner_bl, corner_br;

    let y_byi;

    // Had bug, fixed...
    for (i_dest_y = 0; i_dest_y < dest_size[1]; i_dest_y++) {

        f_source_y = i_dest_y * f_px_h;
        f_source_b = f_source_y + f_px_h;
        i_source_t = Math.floor(f_source_y);
        i_source_tb_crossover = i_source_t + 1;

        //ta_source_y[i_dest_y] = i_source_t;
        y_byi = i_source_t * source_bypr;


        if (f_source_b < i_source_tb_crossover || i_source_t === f_source_y) {
            ta_top_proportions[i_dest_y] = 1;
        } else {
            //1 - (f_source_r - i_source_lr_crossover) / f_px_w;
            ta_top_proportions[i_dest_y] = (i_source_tb_crossover - f_source_y) / f_px_h;
        }
        //ta_ltrb_edge_props[1] = ta_top_proportions[i_dest_y];
        //ta_ltrb_edge_props[3] = 1 - ta_top_proportions[i_dest_y];

        edge_t = ta_top_proportions[i_dest_y];
        edge_b = 1 - ta_top_proportions[i_dest_y];
        //ta_tl_weight_props[1] = t_prop;
        for (i_dest_x = 0; i_dest_x < dest_size[0]; i_dest_x++) {
            //ta_ltrb_edge_props[0] = ta_left_proportions[i_dest_x];
            //ta_ltrb_edge_props[2] = 1 - ta_left_proportions[i_dest_x];
            edge_l = ta_left_proportions[i_dest_x];
            edge_r = 1 - ta_left_proportions[i_dest_x];

            byi_source = ta_source_x_byi_component[i_dest_x] + y_byi;

            //ta_byi_reads[0] = ta_source_x_byi_component[i_dest_x] + ta_source_y_byi_component[i_dest_y];
            //  a typed array of the source byte indexes?

            if (edge_l === 1) {
                if (edge_t === 1) {
                    //copy_px_24bipp(ta_source, byi_source, ta_dest, byi_write);

                    ta_dest[byi_write++] = ta_source[byi_source++];
                    ta_dest[byi_write++] = ta_source[byi_source++];
                    ta_dest[byi_write++] = ta_source[byi_source++];

                    


                } else {
                    //ta_byi_reads[2] = ta_byi_reads[0] + source_bypr;
                    //read_1x2_weight_write_24bipp(ta_source, source_bypr, byi_source, ta_dest, byi_write, ta_ltrb_edge_props[1], ta_ltrb_edge_props[3]);

                    byi_read_below = byi_source + source_bypr;
                    ta_dest[byi_write++] = edge_t * ta_source[byi_source++] + edge_b * ta_source[byi_read_below++];
                    ta_dest[byi_write++] = edge_t * ta_source[byi_source++] + edge_b * ta_source[byi_read_below++];
                    ta_dest[byi_write++] = edge_t * ta_source[byi_source++] + edge_b * ta_source[byi_read_below++];

                }
            } else {
                if (edge_t === 1) {
                    //ta_byi_reads[1] = ta_byi_reads[0] + source_bypp;
                    //read_2x1_weight_write_24bipp(ta_source, byi_source, ta_dest, byi_write, ta_ltrb_edge_props[0], ta_ltrb_edge_props[2]);

                    byi_read_right = byi_source + 3;
                    ta_dest[byi_write++] = edge_l * ta_source[byi_source++] + edge_r * ta_source[byi_read_right++];
                    ta_dest[byi_write++] = edge_l * ta_source[byi_source++] + edge_r * ta_source[byi_read_right++];
                    ta_dest[byi_write++] = edge_l * ta_source[byi_source++] + edge_r * ta_source[byi_read_right++];

                } else {
                    //ta_tl_weight_props[0] = l_prop;
                    //ta_ltrb_corner_props[0] = l_prop * ;
                    //ta_byi_reads[1] = ta_byi_reads[0] + source_bypp;
                    //ta_byi_reads[2] = ta_byi_reads[0] + source_bypr;
                    //ta_byi_reads[3] = ta_byi_reads[2] + source_bypp;

                    corner_tl = edge_l * edge_t;
                    corner_tr = edge_r * edge_t;
                    corner_bl = edge_l * edge_b;
                    corner_br = edge_r * edge_b;

                    byi_read_right = byi_source + 3;
                    byi_read_below = byi_source + source_bypr;
                    byi_read_below_right = byi_read_below + 3;
                    ta_dest[byi_write++] = corner_tl * ta_source[byi_source++] + corner_tr * ta_source[byi_read_right++] + corner_bl * ta_source[byi_read_below++] + corner_br * ta_source[byi_read_below_right++];
                    ta_dest[byi_write++] = corner_tl * ta_source[byi_source++] + corner_tr * ta_source[byi_read_right++] + corner_bl * ta_source[byi_read_below++] + corner_br * ta_source[byi_read_below_right++];
                    ta_dest[byi_write++] = corner_tl * ta_source[byi_source++] + corner_tr * ta_source[byi_read_right++] + corner_bl * ta_source[byi_read_below++] + corner_br * ta_source[byi_read_below_right++];

                    // need the typed array of corner weights?
                    //  function was going much slower with the $2_weight_ints version.


                    //read_2x2_weight_write_24bipp$2_weight_ints(ta_source, byi_source, source_bypr, ta_dest, byi_write, ta_tl_weight_props);

                    // Surprising that below function works faster in a different loop!
                    //read_2x2_weight_write_24bipp(ta_source, source_bypr, byi_source, ta_dest, byi_write, ta_ltrb_corner_props);


                    // Then inlining the read_2x2_weight_write_24bipp function could speed it up?
                }
            }
            //byi_write += 3;
        }
    }
}


const resize_ta_colorspace_24bipp$subpixel = resize_ta_colorspace_24bipp$subpixel$inline;

// Still has bug - may need to change back to 'general' algorithm.
//  Can go back to separating out iteration
//   (may even help optimization???)
//   Create a more optimized iterator too that does precalculation.
//    Only will call the larger pixel merge operations too.



// So will go back to the iteration with the weights provided.
//  






// Hard to work out why this attempt has gone wrong.
//  Could be to do with some precision maths / rounding errors? Some misconception somewhere.

// Can see about precalculating x and y values for the iteration?
//  Then adapting / inlining that function.



let __attempt__resize_ta_colorspace_24bipp$superpixel = (ta_source, source_colorspace, dest_size, ta_dest) => {
    // Non-callback iteration.
    console.log('resize_ta_colorspace_24bipp$superpixel');

    // All pixel sizes will be at least [2, 2].

    const source_bypp = source_colorspace[2];
    const source_bypr = source_colorspace[3];


    //const dest_colorspace = new Int32Array([dest_size[0], dest_size[1], bypp, bypp * dest_size[0], bipp, bipp * dest_size[0]]);
    //const dest_to_source_ratio = new Float32Array([source_colorspace[0] / dest_size[0], source_colorspace[1] / dest_size[1]]);


    // Could work well precalculating y values, then looking them up.
    //  Meaning values that depend on y.

    // Then only when it's corners do we need to do a calculation with them.

    //  The proportions could even be in integer thousanths...?

    // So the total area of 1 px would be 1000000
    //  Floating point fractions seem easiest here.
    //  and always just calculate the other proportion as 1-a?

    // Calculations suh as 1-x may be faster than looking up from memory / array.

    const [f_px_w, f_px_h] = [source_colorspace[0] / dest_size[0], source_colorspace[1] / dest_size[1]];


    let f_source_x, f_source_r;
    let i_source_l, i_source_r;

    let f_source_y, f_source_b;
    let i_source_t, i_source_b;

    let i_dest_x, i_dest_y;


    // Typed arrays of the corresponding source(tl) positions / byte offsets?
    //  Storing / caching calculated byte offsets for x and y source reads could speed things up...?

    // segment weights... - as in proportions of the total area.
    // proportions of the pixel width.

    // Segment size
    //  Segment proportions of the whole area.


    // edge segment distances...

    let left_edge_dist, top_edge_dist, right_edge_dist, bottom_edge_dist;


    const ta_left_edge_segment_proportions = new Float32Array(dest_size[0]);
    const ta_top_edge_segment_proportions = new Float32Array(dest_size[1]);
    const ta_right_edge_segment_proportions = new Float32Array(dest_size[0]);
    const ta_bottom_edge_segment_proportions = new Float32Array(dest_size[1]);

    const ta_source_x = new Int16Array(dest_size[0]);
    const ta_source_y = new Int16Array(dest_size[1]);

    const ta_source_x_byi_component = new Int32Array(dest_size[0]);
    const ta_source_y_byi_component = new Int32Array(dest_size[1]);

    const ta_source_x_any_coverage_w = new Int16Array(dest_size[0]);
    const ta_source_y_any_coverage_h = new Int16Array(dest_size[1]);
    
    const source_i_any_coverage_size = new Int16Array(2);
    let fpx_area_recip = 1 / (f_px_w * f_px_h);



    
    // Need different / more precalculations for coverage.
    //  Also use the full coverage bounds too...?
    //  Any coverage bounds...?

    // It's the any coverage size which is most relevant!


    for (i_dest_x = 0; i_dest_x < dest_size[0]; i_dest_x++) {

        // Calc proportion l and proportion r.
        //  Maybe that's all we need.

        f_source_x = i_dest_x * f_px_w;
        f_source_r = (i_dest_x + 1) * f_px_w;
        i_source_l = Math.floor(f_source_x);
        i_source_r = Math.ceil(f_source_r);
        //i_source_lr_crossover = i_source_l + 1;

        ta_source_x[i_dest_x] = i_source_l;
        ta_source_x_byi_component[i_dest_x] = i_source_l * source_bypp;
        ta_source_x_any_coverage_w[i_dest_x] = i_source_r - i_source_l;

        left_edge_dist = f_source_x - i_source_l;
        if (left_edge_dist === 0) left_edge_dist = 1;
        right_edge_dist = i_source_r - f_source_r;
        if (right_edge_dist === 0) right_edge_dist = 1;

        ta_left_edge_segment_proportions[i_dest_x] = (left_edge_dist) * fpx_area_recip;
        ta_right_edge_segment_proportions[i_dest_x] = (right_edge_dist) * fpx_area_recip;


        /*
        if (f_source_r < i_source_lr_crossover || i_source_l === f_source_x) {
            ta_left_proportions[i_dest_x] = 1;
        } else {
            //1 - (f_source_r - i_source_lr_crossover) / f_px_w;

            ta_left_proportions[i_dest_x] = (i_source_lr_crossover - f_source_x) / f_px_w;
        }
        */
        //ta_left_proportions[x] = 
    }

    //console.trace();
    //throw 'stop';


    // we only really need to values to calculate all corner weightings as well.
    //  left edge proportion, top edge proportion. multiply the proportions, it should work...

    for (i_dest_y = 0; i_dest_y < dest_size[1]; i_dest_y++) {

        // Calc proportion l and proportion r.
        //  Maybe that's all we need.

        f_source_y = i_dest_y * f_px_h;
        f_source_b = (i_dest_y + 1) * f_px_h;
        i_source_t = Math.floor(f_source_y);
        i_source_b = Math.ceil(f_source_b);
        //i_source_tb_crossover = i_source_t + 1;

        ta_source_y[i_dest_y] = i_source_t;
        ta_source_y_byi_component[i_dest_y] = i_source_t * source_bypr;
        ta_source_y_any_coverage_h[i_dest_y] = i_source_b - i_source_t;

        top_edge_dist = f_source_y - i_source_t;
        if (top_edge_dist === 0) top_edge_dist = 1;
        bottom_edge_dist = i_source_b - f_source_b;
        if (bottom_edge_dist === 0) bottom_edge_dist = 1;

        ta_top_edge_segment_proportions[i_dest_y] = (top_edge_dist) * fpx_area_recip;
        ta_bottom_edge_segment_proportions[i_dest_y] = (bottom_edge_dist) * fpx_area_recip;
        /*
        if (f_source_b < i_source_tb_crossover || i_source_t === f_source_y) {
            ta_top_proportions[i_dest_y] = 1;
        } else {
            //1 - (f_source_r - i_source_lr_crossover) / f_px_w;

            ta_top_proportions[i_dest_y] = (i_source_tb_crossover - f_source_y) / f_px_h;
        }
        */


        //ta_left_proportions[x] = 
    }
    // then do the normal nested loop yx iteration
    //  will look up values to calculate...

    //  then will write inline directly?
    //   may be best to use copy-weight-write functions first.
    //    ones that take number params for weights, done simply?

    // edge proportion typed array is probably better / faster.


    //let l_prop, t_prop, r_prop, b_prop;

    const ta_ltrb_edge_props = new Float32Array(4);

    // //const [width, height, bypp, bypr, bipp, bipr] = source_colorspace;

    // keep recalculating the source byte index?

    let byi_source;
    let byi_write = 0;

    //const ta_tl_weight_props = new Float32Array(2);
    //const ta_byi_reads = new Int32Array(4);

    // All 4 corner weight proportions may be best...
    const ta_ltrb_corner_props = new Float32Array(4);

    // Want them as a proportion of the area of the pixel...


    // Had bug, fixed...
    for (i_dest_y = 0; i_dest_y < dest_size[1]; i_dest_y++) {
        ta_ltrb_edge_props[1] = ta_top_edge_segment_proportions[i_dest_y];
        ta_ltrb_edge_props[3] = ta_bottom_edge_segment_proportions[i_dest_y];
        source_i_any_coverage_size[1] = ta_source_y_any_coverage_h[i_dest_y];


        //ta_tl_weight_props[1] = t_prop;
        for (i_dest_x = 0; i_dest_x < dest_size[0]; i_dest_x++) {
            source_i_any_coverage_size[0] = ta_source_x_any_coverage_w[i_dest_x];

            byi_source = ta_source_x_byi_component[i_dest_x] + ta_source_y_byi_component[i_dest_y];

            ta_ltrb_edge_props[0] = ta_left_edge_segment_proportions[i_dest_x];
            ta_ltrb_edge_props[2] = ta_right_edge_segment_proportions[i_dest_x];

            

            ta_ltrb_corner_props[0] = ta_ltrb_edge_props[0] * ta_ltrb_edge_props[1];
            ta_ltrb_corner_props[1] = ta_ltrb_edge_props[2] * ta_ltrb_edge_props[1];
            ta_ltrb_corner_props[2] = ta_ltrb_edge_props[0] * ta_ltrb_edge_props[3];
            ta_ltrb_corner_props[3] = ta_ltrb_edge_props[2] * ta_ltrb_edge_props[3];

            // Want the proportions of the toal width, height or area.
            //  

            //ta_byi_reads[0] = ta_source_x_byi_component[i_dest_x] + ta_source_y_byi_component[i_dest_y];
            //  a typed array of the source byte indexes?

            // 2x2, 2x3, 3x2, 3x3, (>3x3, 3x>3???), general purpose.

            //console.log('source_i_any_coverage_size', source_i_any_coverage_size);

            if (source_i_any_coverage_size[0] === 2) {
                if (source_i_any_coverage_size[1] === 2) {
                    read_2x2_weight_write_24bipp(ta_source, source_bypr, byi_source, ta_dest, byi_write, ta_ltrb_corner_props);


                    //copy_px_24bipp(ta_source, byi_source, ta_dest, byi_write);
                } else if (source_i_any_coverage_size[1] === 3) {
                    //ta_byi_reads[2] = ta_byi_reads[0] + source_bypr;

                    // better to give it the full array?

                    // (ta_source, bypr, byi_read, edge_distances_proportions_of_total, corner_weights_ltrb, ta_dest, dest_byi)

                    read_2x3_weight_write_24bipp(ta_source, source_bypr, byi_source, ta_dest, byi_write, ta_ltrb_edge_props[1], ta_ltrb_edge_props[3]);
                } else {
                    // px i w covered > 3
                    read_gt3x3_weight_write_24bipp(ta_source, source_bypr, byi_source, source_i_any_coverage_size, ta_ltrb_edge_props, ta_ltrb_corner_props, fpx_area_recip, ta_dest, byi_write);
                }
            } else if (source_i_any_coverage_size[0] === 3) {
                if (source_i_any_coverage_size[1] === 2) {
                    //ta_byi_reads[1] = ta_byi_reads[0] + source_bypp;

                    // (ta_source, byi_read, bypr, edge_distances_proportions_of_total, corner_weights_ltrb, ta_dest, dest_byi)

                    // ta_source, bypr, byi_read, edge_weights, corner_weights_ltrb, fpx_area_recip, ta_dest, dest_byi

                    read_3x2_weight_write_24bipp(ta_source, source_bypr, byi_source, ta_ltrb_edge_props, ta_ltrb_corner_props, ta_dest, byi_write);
                } else if (source_i_any_coverage_size[1] === 3) {


                    // (ta_source, bypr, byi_read, edge_weights, corner_weights_ltrb, fpx_area_recip, ta_dest, dest_byi)
                    read_3x3_weight_write_24bipp(ta_source, source_bypr, byi_source, ta_ltrb_edge_props, ta_ltrb_corner_props, ta_dest, byi_write);

                    //ta_tl_weight_props[0] = l_prop;
                    //ta_ltrb_corner_props[0] = l_prop * ;
                    //ta_byi_reads[1] = ta_byi_reads[0] + source_bypp;
                    //ta_byi_reads[2] = ta_byi_reads[0] + source_bypr;
                    //ta_byi_reads[3] = ta_byi_reads[2] + source_bypp;

                    
                    

                    // need the typed array of corner weights?
                    //  function was going much slower with the $2_weight_ints version.


                    //read_2x2_weight_write_24bipp$2_weight_ints(ta_source, byi_source, source_bypr, ta_dest, byi_write, ta_tl_weight_props);

                    // Surprising that below function works faster in a different loop!
                    


                    // Then inlining the read_2x2_weight_write_24bipp function could speed it up?
                } else {

                    // general gt algo here.
                    //  

                    // (ta_source, bypr, byi_read, source_i_any_coverage_size, edge_distances_proportions_of_total, corner_weights_ltrb, fpx_area_recip, ta_dest, dest_byi)

                    //console.log('source_i_any_coverage_size', source_i_any_coverage_size);

                    read_gt3x3_weight_write_24bipp(ta_source, source_bypr, byi_source, source_i_any_coverage_size, ta_ltrb_edge_props, ta_ltrb_corner_props, fpx_area_recip, ta_dest, byi_write);

                }
            } else {

                //console.log('[i_dest_x, i_dest_y]', [i_dest_x, i_dest_y]);
                read_gt3x3_weight_write_24bipp(ta_source, source_bypr, byi_source, source_i_any_coverage_size, ta_ltrb_edge_props, ta_ltrb_corner_props, fpx_area_recip, ta_dest, byi_write);
            }

            byi_write += 3;
        }
    }
}



// Inlining the copy / read-merge-write functions could speed it up...

const resize_ta_colorspace_24bipp$subpixel$ta4byis = (ta_source, source_colorspace, dest_size, ta_dest) => {

    // Simplified this function.
    //  Seems like a small perf cost with the extra function calls used.
    //   Could optimize - not setting any weights when its 1x1, not doing the measurements.

    // C++ versions of the functions that run in here would be of use.
    //  May also be better to use functions for single pixel , 2x1 etc read-merge-write operations.
    //   Would make this function significantly shorter overall, and act more as a function dispatcher.




    //const [width, height, bypp, bypr, bipp, bipr] = source_colorspace;

    const source_bypp = source_colorspace[2];
    const source_bypr = source_colorspace[3];


    //const dest_colorspace = new Int32Array([dest_size[0], dest_size[1], bypp, bypp * dest_size[0], bipp, bipp * dest_size[0]]);
    const dest_to_source_ratio = new Float32Array([source_colorspace[0] / dest_size[0], source_colorspace[1] / dest_size[1]]);


    // Could work well precalculating y values, then looking them up.
    //  Meaning values that depend on y.

    // Then only when it's corners do we need to do a calculation with them.

    //  The proportions could even be in integer thousanths...?

    // So the total area of 1 px would be 1000000
    //  Floating point fractions seem easiest here.
    //  and always just calculate the other proportion as 1-a?

    


    // Calculations suh as 1-x may be faster than looking up from memory / array.

    const [f_px_w, f_px_h] = [source_colorspace[0] / dest_size[0], source_colorspace[1] / dest_size[1]];


    let f_source_x, f_source_r;
    let i_source_l, i_source_lr_crossover;

    let f_source_y, f_source_b;
    let i_source_t, i_source_tb_crossover;

    let i_dest_x, i_dest_y;


    // Typed arrays of the corresponding source(tl) positions / byte offsets?
    //  Storing / caching calculated byte offsets for x and y source reads could speed things up...?
    const ta_left_proportions = new Float32Array(dest_size[0]);
    const ta_top_proportions = new Float32Array(dest_size[1]);

    const ta_source_x = new Int16Array(dest_size[0]);
    const ta_source_y = new Int16Array(dest_size[1]);

    const ta_source_x_byi_component = new Int32Array(dest_size[0]);
    const ta_source_y_byi_component = new Int32Array(dest_size[1]);

    


    for (i_dest_x = 0; i_dest_x < dest_size[0]; i_dest_x++) {

        // Calc proportion l and proportion r.
        //  Maybe that's all we need.

        f_source_x = i_dest_x * f_px_w;
        f_source_r = f_source_x + f_px_w;
        i_source_l = Math.floor(f_source_x);
        i_source_lr_crossover = i_source_l + 1;

        ta_source_x[i_dest_x] = i_source_l;
        ta_source_x_byi_component[i_dest_x] = i_source_l * source_bypp;


        if (f_source_r < i_source_lr_crossover || i_source_l === f_source_x) {
            ta_left_proportions[i_dest_x] = 1;
        } else {
            //1 - (f_source_r - i_source_lr_crossover) / f_px_w;

            ta_left_proportions[i_dest_x] = (i_source_lr_crossover - f_source_x) / f_px_w;
        }
        //ta_left_proportions[x] = 
    }


    // we only really need to values to calculate all corner weightings as well.
    //  left edge proportion, top edge proportion. multiply the proportions, it should work...

    for (i_dest_y = 0; i_dest_y < dest_size[0]; i_dest_y++) {

        // Calc proportion l and proportion r.
        //  Maybe that's all we need.

        f_source_y = i_dest_y * f_px_h;
        f_source_b = f_source_y + f_px_h;
        i_source_t = Math.floor(f_source_y);
        i_source_tb_crossover = i_source_t + 1;

        ta_source_y[i_dest_y] = i_source_t;
        ta_source_y_byi_component[i_dest_y] = i_source_t * source_bypr;


        if (f_source_b < i_source_tb_crossover || i_source_t === f_source_y) {
            ta_top_proportions[i_dest_y] = 1;
        } else {
            //1 - (f_source_r - i_source_lr_crossover) / f_px_w;

            ta_top_proportions[i_dest_y] = (i_source_tb_crossover - f_source_y) / f_px_h;
        }
        //ta_left_proportions[x] = 
    }
    // then do the normal nested loop yx iteration
    //  will look up values to calculate...

    //  then will write inline directly?
    //   may be best to use copy-weight-write functions first.
    //    ones that take number params for weights, done simply?


    // edge proportion typed array is probably better / faster.


    //let l_prop, t_prop, r_prop, b_prop;

    const ta_ltrb_edge_props = new Float32Array(4);

    // //const [width, height, bypp, bypr, bipp, bipr] = source_colorspace;

    // keep recalculating the source byte index?

    let byi_source;
    let byi_write = 0;

    const ta_tl_weight_props = new Float32Array(2);
    const ta_byi_reads = new Int32Array(4);

    // All 4 corner weight proportions may be best...
    const ta_ltrb_corner_props = new Float32Array(4);


    // Had bug, fixed...
    for (i_dest_y = 0; i_dest_y < dest_size[1]; i_dest_y++) {
        ta_ltrb_edge_props[1] = ta_top_proportions[i_dest_y];
        ta_ltrb_edge_props[3] = 1 - ta_top_proportions[i_dest_y];
        //ta_tl_weight_props[1] = t_prop;
        for (i_dest_x = 0; i_dest_x < dest_size[0]; i_dest_x++) {
            ta_ltrb_edge_props[0] = ta_left_proportions[i_dest_x];
            ta_ltrb_edge_props[2] = 1 - ta_left_proportions[i_dest_x];

            //byi_source = ta_source_x_byi_component[i_dest_x] + ta_source_y_byi_component[i_dest_y];

            ta_byi_reads[0] = ta_source_x_byi_component[i_dest_x] + ta_source_y_byi_component[i_dest_y];
            //  a typed array of the source byte indexes?

            if (ta_ltrb_edge_props[0] === 1) {
                if (ta_ltrb_edge_props[1] === 1) {
                    copy_px_24bipp(ta_source, ta_byi_reads[0], ta_dest, byi_write);
                } else {
                    ta_byi_reads[2] = ta_byi_reads[0] + source_bypr;
                    read_1x2_weight_write_24bipp$ta4byis(ta_source, ta_byi_reads, ta_dest, byi_write, ta_ltrb_edge_props[1], ta_ltrb_edge_props[3]);
                }
            } else {
                if (ta_ltrb_edge_props[1] === 1) {
                    ta_byi_reads[1] = ta_byi_reads[0] + source_bypp;
                    read_2x1_weight_write_24bipp$ta4byis(ta_source, ta_byi_reads, ta_dest, byi_write, ta_ltrb_edge_props[0], ta_ltrb_edge_props[2]);
                } else {
                    //ta_tl_weight_props[0] = l_prop;
                    //ta_ltrb_corner_props[0] = l_prop * ;
                    ta_byi_reads[1] = ta_byi_reads[0] + source_bypp;
                    ta_byi_reads[2] = ta_byi_reads[0] + source_bypr;
                    ta_byi_reads[3] = ta_byi_reads[2] + source_bypp;

                    ta_ltrb_corner_props[0] = ta_ltrb_edge_props[0] * ta_ltrb_edge_props[1];
                    ta_ltrb_corner_props[1] = ta_ltrb_edge_props[2] * ta_ltrb_edge_props[1];
                    ta_ltrb_corner_props[2] = ta_ltrb_edge_props[0] * ta_ltrb_edge_props[3];
                    ta_ltrb_corner_props[3] = ta_ltrb_edge_props[2] * ta_ltrb_edge_props[3];
                    

                    // need the typed array of corner weights?
                    //  function was going much slower with the $2_weight_ints version.


                    //read_2x2_weight_write_24bipp$2_weight_ints(ta_source, byi_source, source_bypr, ta_dest, byi_write, ta_tl_weight_props);

                    // Surprising that below function works faster in a different loop!
                    read_2x2_weight_write_24bipp$ta4byis(ta_source, ta_byi_reads, ta_dest, byi_write, ta_ltrb_corner_props);


                    // Then inlining the read_2x2_weight_write_24bipp function could speed it up?
                }
            }

            byi_write += 3;
        }
    }






    // having the top proportions precomputed won't be quite so useful.
    //  Will be able to do other weights precomputation on other iterations for larger source pixel sizes.


    // A few typed arrays for different stored values at each x?


    //  Or a single one, spaced...

    // Left and right weights at each x.

    // so just iterate the dest x values...


    //console.log('resize_ta_colorspace_24bipp$subpixel', resize_ta_colorspace_24bipp$subpixel);

    //console.trace();
    //throw 'stop';
}



// resize_ta_colorspace_24bipp$general
const __resize_ta_colorspace_24bipp$superpixel = (ta_source, source_colorspace, dest_size, opt_ta_dest) => {
    //const [width, height, bypp, bypr, bipp, bipr] = source_colorspace;
    const bypr = source_colorspace[3];
    const dest_to_source_ratio = new Float32Array([source_colorspace[0] / dest_size[0], source_colorspace[1] / dest_size[1]]);
    const fpx_area_recip = 1 / (dest_to_source_ratio[0] * dest_to_source_ratio[1]);


    each_source_dest_pixels_resized_limited_further_info(source_colorspace, dest_size, (dest_byi, source_i_any_coverage_size, edge_distances_proportions_of_total, corner_areas_proportions_of_total, byi_read) => {
        if (source_i_any_coverage_size[0] === 2 && source_i_any_coverage_size[1] === 2) {
            read_2x2_weight_write_24bipp(ta_source, bypr, byi_read, opt_ta_dest, dest_byi, corner_areas_proportions_of_total);
        } else if (source_i_any_coverage_size[0] === 2 && source_i_any_coverage_size[1] === 3) {
            read_2x3_weight_write_24bipp(ta_source, bypr, byi_read, edge_distances_proportions_of_total, corner_areas_proportions_of_total, opt_ta_dest, dest_byi);
        } else if (source_i_any_coverage_size[0] === 3 && source_i_any_coverage_size[1] === 2) {
            read_3x2_weight_write_24bipp(ta_source, bypr, byi_read, edge_distances_proportions_of_total, corner_areas_proportions_of_total, opt_ta_dest, dest_byi);
        } else if (source_i_any_coverage_size[0] === 3 && source_i_any_coverage_size[1] === 3) {
            read_3x3_weight_write_24bipp(ta_source, bypr, byi_read, edge_distances_proportions_of_total, corner_areas_proportions_of_total, fpx_area_recip, opt_ta_dest, dest_byi);
        } else {
            read_gt3x3_weight_write_24bipp(ta_source, bypr, byi_read, source_i_any_coverage_size, edge_distances_proportions_of_total, corner_areas_proportions_of_total, fpx_area_recip, opt_ta_dest, dest_byi);
        }
        
    });
}


// Could make more totalling inline version with inlining of the copy-merge-write operations.

const __resize_ta_colorspace_24bipp$superpixel$inline = (ta_source, source_colorspace, dest_size, opt_ta_dest) => {
    //const [width, height, bypp, bypr, bipp, bipr] = source_colorspace;
    //const bypr = source_colorspace[3];
    const dest_to_source_ratio = new Float32Array([source_colorspace[0] / dest_size[0], source_colorspace[1] / dest_size[1]]);
    const fpx_area_recip = 1 / (dest_to_source_ratio[0] * dest_to_source_ratio[1]);





    //const dest_to_source_ratio = new Float32Array([source_colorspace[0] / dest_size[0], source_colorspace[1] / dest_size[1]]);
    const source_edge_distances = new Float32Array(4);
    //const source_corner_areas = new Float32Array(4);
    const edge_distances_proportions_of_total = new Float32Array(4);
    //const edge_segment_areas_proportion_of_total_area = new Float32Array(4);
    const corner_areas_proportions_of_total = new Float32Array(4);
    const fpx_area = dest_to_source_ratio[0] * dest_to_source_ratio[1];


    //  ------------


    //let [width, height, bypp, bypr, bipp, bipr] = source_colorspace;
    const source_bypp = source_colorspace[2];
    const source_bypr = source_colorspace[3];
    
    const source_bipp = source_colorspace[4];
    const dest_colorspace = new Int32Array([dest_size[0], dest_size[1], source_bypp, source_bypp * dest_size[0], source_bipp, source_bipp * dest_size[0]]);


    //const dest_to_source_ratio = new Float32Array([source_colorspace[0] / dest_size[0], source_colorspace[1] / dest_size[1]]);
    const source_fbounds = new Float32Array(4);
    const source_ibounds = new Int16Array(4);
    const source_i_any_coverage_size = new Int16Array(2);
    const source_total_coverage_ibounds = new Int16Array(4);
    let byi_read;



    let dest_byi = 0;
    //const dest_xy = new Int16Array(2);
    //[width, height, bypp, bypr, bipp, bipr] = dest_colorspace;

    const width = dest_colorspace[0], height = dest_colorspace[1];


    // Storing calculated values from the previous x?
    //  Precalculating an array of different variables for all x values.
    //  Then all y values are iterated so no benefit from precalc.
    //   edges etc

    // A lot more could be precalculated and then referenced.

    // Read a set of values from a larger ta for each x?
    //  Or refer to it.
    //  

    // Could make a version of this that does precalculations.


    let x, y;

    // could have next source pixel pos
    //  use it for bounds of the current pixel


    //for (dest_xy[1] = 0; dest_xy[1] < height; dest_xy[1]++) {
    for (y = 0; y < height; y++) {

        // Can optimize with calculations done just using y.


        source_fbounds[1] = y * dest_to_source_ratio[1];
        source_fbounds[3] = source_fbounds[1] + dest_to_source_ratio[1];
        source_ibounds[1] = source_fbounds[1];
        source_ibounds[3] = Math.ceil(source_fbounds[3]);
        source_i_any_coverage_size[1] = source_ibounds[3] - source_ibounds[1];
        source_total_coverage_ibounds[1] = Math.ceil(source_fbounds[1]);
        source_total_coverage_ibounds[3] = source_fbounds[3];

        source_edge_distances[1] = source_total_coverage_ibounds[1] - source_fbounds[1];
        source_edge_distances[3] = source_fbounds[3] - source_total_coverage_ibounds[3];
        if (source_edge_distances[1] === 0) source_edge_distances[1] = 1;
        if (source_edge_distances[3] === 0) source_edge_distances[3] = 1;

        edge_distances_proportions_of_total[1] = source_edge_distances[1] / fpx_area;
        edge_distances_proportions_of_total[3] = source_edge_distances[3] / fpx_area;

        for (x = 0; x < width; x++) {
            source_fbounds[0] = x * dest_to_source_ratio[0];
            source_fbounds[2] = source_fbounds[0] + dest_to_source_ratio[0];

            // And the total coverage bounds.
            //  will be useful for some things...
            // Total coverage size as well

            //source_farea = (source_fbounds[2] - )


            // Scale down the pixel location...
            source_ibounds[0] = source_fbounds[0];
            source_ibounds[2] = Math.ceil(source_fbounds[2]);

            // then the any coverage area...

            // does it cover other pixels / proportions in those other pixels?

            // Still reasonably fast - yet slowing down from before....
            source_i_any_coverage_size[0] = source_ibounds[2] - source_ibounds[0];
            byi_read = source_ibounds[0] * source_bypp + source_ibounds[1] * source_bypr;

            

            //callback(dest_xy, dest_byi, source_fbounds, source_ibounds, source_i_any_coverage_size, source_total_coverage_ibounds, byi_read);

            source_total_coverage_ibounds[0] = Math.ceil(source_fbounds[0]); //??? As it should be.
            source_total_coverage_ibounds[2] = Math.floor(source_fbounds[2]);

            source_edge_distances[0] = source_total_coverage_ibounds[0] - source_fbounds[0];
            source_edge_distances[2] = source_fbounds[2] - source_total_coverage_ibounds[2];
            if (source_edge_distances[0] === 0) source_edge_distances[0] = 1;
            if (source_edge_distances[2] === 0) source_edge_distances[2] = 1;

            //console.log('source_i_any_coverage_size', source_i_any_coverage_size);

            corner_areas_proportions_of_total[0] = source_edge_distances[0] * source_edge_distances[1] / fpx_area;
            corner_areas_proportions_of_total[1] = source_edge_distances[2] * source_edge_distances[1] / fpx_area;
            corner_areas_proportions_of_total[2] = source_edge_distances[0] * source_edge_distances[3] / fpx_area;
            corner_areas_proportions_of_total[3] = source_edge_distances[2] * source_edge_distances[3] / fpx_area;


            if (source_i_any_coverage_size[0] > 3 ||  source_i_any_coverage_size[1] > 3) {
                edge_distances_proportions_of_total[0] = source_edge_distances[0] / fpx_area;
                    //edge_distances_proportions_of_total[1] = source_edge_distances[1] / fpx_area;
                edge_distances_proportions_of_total[2] = source_edge_distances[2] / fpx_area;
                read_gt3x3_weight_write_24bipp(ta_source, source_bypr, byi_read, source_i_any_coverage_size, edge_distances_proportions_of_total, corner_areas_proportions_of_total, fpx_area_recip, opt_ta_dest, dest_byi);

                

            } else {

                if (source_i_any_coverage_size[0] === 2 && source_i_any_coverage_size[1] === 2) {
                    //source_edge_distances[0] = source_total_coverage_ibounds[0] - source_fbounds[0];
                    //source_edge_distances[1] = source_total_coverage_ibounds[1] - source_fbounds[1];
                    //source_edge_distances[2] = source_fbounds[2] - source_total_coverage_ibounds[2];
                    //source_edge_distances[3] = source_fbounds[3] - source_total_coverage_ibounds[3];
        
                    //if (source_edge_distances[0] === 0) source_edge_distances[0] = 1;
                    //if (source_edge_distances[1] === 0) source_edge_distances[1] = 1;
                    //if (source_edge_distances[2] === 0) source_edge_distances[2] = 1;
                    //if (source_edge_distances[3] === 0) source_edge_distances[3] = 1;
        
                    
        
                    //callback(dest_byi, source_i_any_coverage_size, undefined, corner_areas_proportions_of_total, byi_read);
                    //callback(dest_xy, dest_byi, source_fbounds, source_ibounds, source_i_any_coverage_size, source_total_coverage_ibounds, source_edge_distances, undefined, undefined, corner_areas_proportions_of_total, byi_read);
    
    
                    read_2x2_weight_write_24bipp(ta_source, source_bypr, byi_read, opt_ta_dest, dest_byi, corner_areas_proportions_of_total);
                } else {
        
                    
                    //source_edge_distances[1] = source_total_coverage_ibounds[1] - source_fbounds[1];
                    
                    //source_edge_distances[3] = source_fbounds[3] - source_total_coverage_ibounds[3];
        
                    //if (source_edge_distances[0] === 0) source_edge_distances[0] = 1;
                    //if (source_edge_distances[1] === 0) source_edge_distances[1] = 1;
                    //if (source_edge_distances[2] === 0) source_edge_distances[2] = 1;
                    //if (source_edge_distances[3] === 0) source_edge_distances[3] = 1;
        
                    edge_distances_proportions_of_total[0] = source_edge_distances[0] / fpx_area;
                    //edge_distances_proportions_of_total[1] = source_edge_distances[1] / fpx_area;
                    edge_distances_proportions_of_total[2] = source_edge_distances[2] / fpx_area;
                    //edge_distances_proportions_of_total[3] = source_edge_distances[3] / fpx_area;
    
    
        
                    //corner_areas_proportions_of_total[0] = source_edge_distances[0] * source_edge_distances[1] / fpx_area;
                    //corner_areas_proportions_of_total[1] = source_edge_distances[2] * source_edge_distances[1] / fpx_area;
                    //corner_areas_proportions_of_total[2] = source_edge_distances[0] * source_edge_distances[3] / fpx_area;
                    //corner_areas_proportions_of_total[3] = source_edge_distances[2] * source_edge_distances[3] / fpx_area;
        
                    //callback(dest_byi, source_i_any_coverage_size, edge_distances_proportions_of_total, corner_areas_proportions_of_total, byi_read);
    
                    if (source_i_any_coverage_size[0] === 2 && source_i_any_coverage_size[1] === 3) {
                        read_2x3_weight_write_24bipp(ta_source, source_bypr, byi_read, edge_distances_proportions_of_total, corner_areas_proportions_of_total, opt_ta_dest, dest_byi);
                    } else if (source_i_any_coverage_size[0] === 3 && source_i_any_coverage_size[1] === 2) {
                        read_3x2_weight_write_24bipp(ta_source, source_bypr, byi_read, edge_distances_proportions_of_total, corner_areas_proportions_of_total, opt_ta_dest, dest_byi);
                    } else if (source_i_any_coverage_size[0] === 3 && source_i_any_coverage_size[1] === 3) {
                        read_3x3_weight_write_24bipp(ta_source, source_bypr, byi_read, edge_distances_proportions_of_total, corner_areas_proportions_of_total, fpx_area_recip, opt_ta_dest, dest_byi);
                    } else {

                        console.trace();
                        throw 'stop';

                        //read_gt3x3_weight_write_24bipp(ta_source, source_bypr, byi_read, source_i_any_coverage_size, edge_distances_proportions_of_total, corner_areas_proportions_of_total, fpx_area_recip, opt_ta_dest, dest_byi);
                    }
                }
            }
            dest_byi += source_bypp;
        }
    }
}

// Now this inline, non-callback function can be made in C++ without needing functions pointers.

const resize_ta_colorspace_24bipp$superpixel$inline$locals = (ta_source, source_colorspace, dest_size, opt_ta_dest) => {
    //const [width, height, bypp, bypr, bipp, bipr] = source_colorspace;
    //const bypr = source_colorspace[3];
    const dest_to_source_ratio = new Float32Array([source_colorspace[0] / dest_size[0], source_colorspace[1] / dest_size[1]]);
    const fpx_area_recip = 1 / (dest_to_source_ratio[0] * dest_to_source_ratio[1]);

    const [fpxw, fpxh] = [source_colorspace[0] / dest_size[0], source_colorspace[1] / dest_size[1]];





    //const dest_to_source_ratio = new Float32Array([source_colorspace[0] / dest_size[0], source_colorspace[1] / dest_size[1]]);
    //const source_edge_distances = new Float32Array(4);

    let edge_l, edge_t, edge_r, edge_b;

    //const source_corner_areas = new Float32Array(4);
    //const edge_distances_proportions_of_total = new Float32Array(4);

    let edge_p_l, edge_p_t, edge_p_r, edge_p_b;


    //const edge_segment_areas_proportion_of_total_area = new Float32Array(4);
    //const corner_areas_proportions_of_total = new Float32Array(4);

    let corner_p_tl, corner_p_tr, corner_p_bl, corner_p_br;

    const fpx_area = dest_to_source_ratio[0] * dest_to_source_ratio[1];


    //  ------------


    //let [width, height, bypp, bypr, bipp, bipr] = source_colorspace;
    const source_bypp = source_colorspace[2];
    const source_bypr = source_colorspace[3];
    
    const source_bipp = source_colorspace[4];
    const dest_colorspace = new Int32Array([dest_size[0], dest_size[1], source_bypp, source_bypp * dest_size[0], source_bipp, source_bipp * dest_size[0]]);


    //const dest_to_source_ratio = new Float32Array([source_colorspace[0] / dest_size[0], source_colorspace[1] / dest_size[1]]);
    //const source_fbounds = new Float32Array(4);

    let fbounds_l, fbounds_t, fbounds_r, fbounds_b;

    //const source_ibounds = new Int16Array(4);

    let ibounds_l, ibounds_t, ibounds_r, ibounds_b;

    //const source_i_any_coverage_size = new Int16Array(2);

    let any_coverage_w, any_coverage_h;

    //const source_total_coverage_ibounds = new Int16Array(4);

    let total_coverage_l, total_coverage_t, total_coverage_r, total_coverage_b;

    let byi_read;

    let dest_byi = 0;
    //const dest_xy = new Int16Array(2);
    //[width, height, bypp, bypr, bipp, bipr] = dest_colorspace;

    const width = dest_colorspace[0], height = dest_colorspace[1];


    // Storing calculated values from the previous x?
    //  Precalculating an array of different variables for all x values.
    //  Then all y values are iterated so no benefit from precalc.
    //   edges etc

    // A lot more could be precalculated and then referenced.

    // Read a set of values from a larger ta for each x?
    //  Or refer to it.
    //  

    // Could make a version of this that does precalculations.


    let x, y;

    // could have next source pixel pos
    //  use it for bounds of the current pixel


    //for (dest_xy[1] = 0; dest_xy[1] < height; dest_xy[1]++) {
    for (y = 0; y < height; y++) {

        // Can optimize with calculations done just using y.


        fbounds_t = y * fpxh;
        fbounds_b = fbounds_t + fpxh;
        //fbounds_b = (fbounds_t = y * fpxh) + fpxh;


        ibounds_t = Math.floor(fbounds_t);
        ibounds_b = Math.ceil(fbounds_b);



        //source_i_any_coverage_size[1] = source_ibounds[3] - source_ibounds[1];

        any_coverage_h = ibounds_b - ibounds_t;

        //source_total_coverage_ibounds[1] = Math.ceil(source_fbounds[1]);

        total_coverage_t = Math.ceil(fbounds_t);

        //source_total_coverage_ibounds[3] = source_fbounds[3];

        total_coverage_b = Math.floor(fbounds_b);

        //source_edge_distances[1] = source_total_coverage_ibounds[1] - source_fbounds[1];
        //source_edge_distances[3] = source_fbounds[3] - source_total_coverage_ibounds[3];


        //edge_t = total_coverage_t - fbounds_t || 1;
        //edge_b = fbounds_b - total_coverage_b || 1;

        edge_t = total_coverage_t - fbounds_t;
        edge_b = fbounds_b - total_coverage_b;

        if (edge_t === 0) edge_t = 1;
        if (edge_b === 0) edge_b = 1;

        //if (source_edge_distances[1] === 0) source_edge_distances[1] = 1;
        //if (source_edge_distances[3] === 0) source_edge_distances[3] = 1;

        //edge_distances_proportions_of_total[1] = source_edge_distances[1] / fpx_area;
        //edge_distances_proportions_of_total[3] = source_edge_distances[3] / fpx_area;

        //edge_p_t = 

        edge_p_t = edge_t / fpx_area;
        edge_p_b = edge_b / fpx_area;

        // Could try incrementing the fbounds...

        fbounds_l = 0;
        fbounds_r = fpxw;


        for (x = 0; x < width; x++) {
            //source_fbounds[0] = x * dest_to_source_ratio[0];
            //source_fbounds[2] = source_fbounds[0] + dest_to_source_ratio[0];


            fbounds_l = x * fpxw;
            fbounds_r = (x + 1) * fpxw;

            // And the total coverage bounds.
            //  will be useful for some things...
            // Total coverage size as well

            //source_farea = (source_fbounds[2] - )


            // Scale down the pixel location...
            //source_ibounds[0] = source_fbounds[0];
            //source_ibounds[2] = Math.ceil(source_fbounds[2]);
            ibounds_l = Math.floor(fbounds_l);
            ibounds_r = Math.ceil(fbounds_r);

            // then the any coverage area...

            // does it cover other pixels / proportions in those other pixels?

            // Still reasonably fast - yet slowing down from before....
            //source_i_any_coverage_size[0] = source_ibounds[2] - source_ibounds[0];
            //byi_read = source_ibounds[0] * source_bypp + source_ibounds[1] * source_bypr;
            any_coverage_w = ibounds_r - ibounds_l;
            byi_read = ibounds_l * source_bypp + ibounds_t * source_bypr;



            

            //callback(dest_xy, dest_byi, source_fbounds, source_ibounds, source_i_any_coverage_size, source_total_coverage_ibounds, byi_read);


            // Change to floor?
            //total_coverage_l = Math.ceil(source_fbounds[0]);
            //total_coverage_r = fbounds_r;

            total_coverage_l = Math.ceil(fbounds_l);
            total_coverage_r = Math.floor(fbounds_r);

            //edge_l = total_coverage_l - fbounds_l || 1; // to much of a hack, compares as strings.
            //edge_r = fbounds_r - total_coverage_r || 1;
            edge_l = total_coverage_l - fbounds_l;
            edge_r = fbounds_r - total_coverage_r;
            if (edge_l === 0) edge_l = 1;
            if (edge_r === 0) edge_r = 1;
            //edge_l === 0 ? edge_l = 1;


            //console.log('source_i_any_coverage_size', source_i_any_coverage_size);

            corner_p_tl = edge_l * edge_p_t;
            corner_p_tr = edge_r * edge_p_t;
            corner_p_bl = edge_l * edge_p_b;
            corner_p_br = edge_r * edge_p_b;


            if (any_coverage_w > 3 ||  any_coverage_h > 3) {
                edge_p_l = edge_l / fpx_area;
                    //edge_distances_proportions_of_total[1] = edge_t / fpx_area;
                edge_p_r = edge_r / fpx_area;

                
                //read_gt3x3_weight_write_24bipp(ta_source, source_bypr, byi_read, source_i_any_coverage_size, edge_distances_proportions_of_total, corner_areas_proportions_of_total, fpx_area_recip, opt_ta_dest, dest_byi);


                read_gt3x3_weight_write_24bipp$locals(ta_source, source_bypr, byi_read,
                    any_coverage_w, any_coverage_h,
                    edge_p_l, edge_p_t, edge_p_r, edge_p_b,
                    corner_p_tl, corner_p_tr, corner_p_bl, corner_p_br,
                    fpx_area_recip,
                    opt_ta_dest, dest_byi
                    )

                //read_gt3x3_weight_write_24bipp$locals(ta_source, source_bypr, byi_read, source_i_any_coverage_size, edge_distances_proportions_of_total, corner_areas_proportions_of_total, fpx_area_recip, opt_ta_dest, dest_byi);
                

            } else {

                if (any_coverage_w === 2 && any_coverage_h === 2) {
                    //edge_l = total_coverage_l - source_fbounds[0];
                    //edge_t = source_total_coverage_ibounds[1] - source_fbounds[1];
                    //edge_r = fbounds_r - total_coverage_r;
                    //edge_b = source_fbounds[3] - source_total_coverage_ibounds[3];
        
                    //if (edge_l === 0) edge_l = 1;
                    //if (edge_t === 0) edge_t = 1;
                    //if (edge_r === 0) edge_r = 1;
                    //if (edge_b === 0) edge_b = 1;
        
                    
        
                    //callback(dest_byi, source_i_any_coverage_size, undefined, corner_areas_proportions_of_total, byi_read);
                    //callback(dest_xy, dest_byi, source_fbounds, source_ibounds, source_i_any_coverage_size, source_total_coverage_ibounds, source_edge_distances, undefined, undefined, corner_areas_proportions_of_total, byi_read);
    
    
                    //read_2x2_weight_write_24bipp(ta_source, source_bypr, byi_read, opt_ta_dest, dest_byi, corner_areas_proportions_of_total);
                    //read_2x2_weight_write_24bipp$locals(ta_source, source_bypr, byi_read, opt_ta_dest, dest_byi, corner_areas_proportions_of_total);

                    read_2x2_weight_write_24bipp$locals(ta_source, source_bypr, byi_read, 
                        corner_p_tl, corner_p_tr, corner_p_bl, corner_p_br,
                        
                        opt_ta_dest, dest_byi);
                } else {
        
                    
                    //edge_t = source_total_coverage_ibounds[1] - source_fbounds[1];
                    
                    //edge_b = source_fbounds[3] - source_total_coverage_ibounds[3];
        
                    //if (edge_l === 0) edge_l = 1;
                    //if (edge_t === 0) edge_t = 1;
                    //if (edge_r === 0) edge_r = 1;
                    //if (edge_b === 0) edge_b = 1;
        
                    edge_p_l = edge_l / fpx_area;
                    //edge_distances_proportions_of_total[1] = edge_t / fpx_area;
                    edge_p_r = edge_r / fpx_area;
                    //edge_distances_proportions_of_total[3] = edge_b / fpx_area;
    
    
        
                    //corner_p_tl = edge_l * edge_t / fpx_area;
                    //corner_p_tr = edge_r * edge_t / fpx_area;
                    //corner_p_bl = edge_l * edge_b / fpx_area;
                    //corner_p_br = edge_r * edge_b / fpx_area;
        
                    //callback(dest_byi, source_i_any_coverage_size, edge_distances_proportions_of_total, corner_areas_proportions_of_total, byi_read);
    
                    if (any_coverage_w === 2 && any_coverage_h === 3) {

                        read_2x3_weight_write_24bipp$locals(ta_source, source_bypr, byi_read,
                            edge_p_l, edge_p_t, edge_p_r, edge_p_b,
                            corner_p_tl, corner_p_tr, corner_p_bl, corner_p_br,
                            
                            opt_ta_dest, dest_byi);




                        //read_2x3_weight_write_24bipp(ta_source, source_bypr, byi_read, edge_distances_proportions_of_total, corner_areas_proportions_of_total, opt_ta_dest, dest_byi);
                        ///read_2x3_weight_write_24bipp$locals(ta_source, source_bypr, byi_read, edge_distances_proportions_of_total, corner_areas_proportions_of_total, opt_ta_dest, dest_byi);
                    } else if (any_coverage_w === 3 && any_coverage_h === 2) {
                        //read_3x2_weight_write_24bipp(ta_source, source_bypr, byi_read, edge_distances_proportions_of_total, corner_areas_proportions_of_total, opt_ta_dest, dest_byi);
                        //read_3x2_weight_write_24bipp$locals(ta_source, source_bypr, byi_read, edge_distances_proportions_of_total, corner_areas_proportions_of_total, opt_ta_dest, dest_byi);


                        read_3x2_weight_write_24bipp$locals(ta_source, source_bypr, byi_read,
                            edge_p_l, edge_p_t, edge_p_r, edge_p_b,
                            corner_p_tl, corner_p_tr, corner_p_bl, corner_p_br,
                            opt_ta_dest, dest_byi);

                    } else if (any_coverage_w === 3 && any_coverage_h === 3) {
                        //read_3x3_weight_write_24bipp(ta_source, source_bypr, byi_read, edge_distances_proportions_of_total, corner_areas_proportions_of_total, fpx_area_recip, opt_ta_dest, dest_byi);

                        //read_3x3_weight_write_24bipp$locals(ta_source, source_bypr, byi_read, edge_distances_proportions_of_total, corner_areas_proportions_of_total, fpx_area_recip, opt_ta_dest, dest_byi);

                        read_3x3_weight_write_24bipp$locals(ta_source, source_bypr, byi_read,
                            edge_p_l, edge_p_t, edge_p_r, edge_p_b,
                            corner_p_tl, corner_p_tr, corner_p_bl, corner_p_br,
                            fpx_area_recip,
                            opt_ta_dest, dest_byi);
                    } else {

                        console.trace();
                        throw 'stop';

                        //read_gt3x3_weight_write_24bipp(ta_source, source_bypr, byi_read, source_i_any_coverage_size, edge_distances_proportions_of_total, corner_areas_proportions_of_total, fpx_area_recip, opt_ta_dest, dest_byi);
                    }
                }
            }
            dest_byi += source_bypp;

            //fbounds_l += fpxw; fbounds_r += fpxw;
        }
    }
}


const resize_ta_colorspace_24bipp$superpixel$inline$locals$inline = (ta_source, source_colorspace, dest_size, opt_ta_dest) => {

    const ta_dest = opt_ta_dest;
    //const [width, height, bypp, bypr, bipp, bipr] = source_colorspace;
    //const bypr = source_colorspace[3];
    const dest_to_source_ratio = new Float32Array([source_colorspace[0] / dest_size[0], source_colorspace[1] / dest_size[1]]);
    const fpx_area_recip = 1 / (dest_to_source_ratio[0] * dest_to_source_ratio[1]);

    const [fpxw, fpxh] = [source_colorspace[0] / dest_size[0], source_colorspace[1] / dest_size[1]];





    //const dest_to_source_ratio = new Float32Array([source_colorspace[0] / dest_size[0], source_colorspace[1] / dest_size[1]]);
    //const source_edge_distances = new Float32Array(4);

    let edge_l, edge_t, edge_r, edge_b;

    //const source_corner_areas = new Float32Array(4);
    //const edge_distances_proportions_of_total = new Float32Array(4);

    let edge_p_l, edge_p_t, edge_p_r, edge_p_b;


    //const edge_segment_areas_proportion_of_total_area = new Float32Array(4);
    //const corner_areas_proportions_of_total = new Float32Array(4);

    let corner_p_tl, corner_p_tr, corner_p_bl, corner_p_br;

    const fpx_area = dest_to_source_ratio[0] * dest_to_source_ratio[1];


    //  ------------


    //let [width, height, bypp, bypr, bipp, bipr] = source_colorspace;
    const source_bypp = source_colorspace[2];
    const source_bypr = source_colorspace[3];
    
    const source_bipp = source_colorspace[4];
    const dest_colorspace = new Int32Array([dest_size[0], dest_size[1], source_bypp, source_bypp * dest_size[0], source_bipp, source_bipp * dest_size[0]]);


    //const dest_to_source_ratio = new Float32Array([source_colorspace[0] / dest_size[0], source_colorspace[1] / dest_size[1]]);
    //const source_fbounds = new Float32Array(4);

    let fbounds_l, fbounds_t, fbounds_r, fbounds_b;

    //const source_ibounds = new Int16Array(4);

    let ibounds_l, ibounds_t, ibounds_r, ibounds_b;

    //const source_i_any_coverage_size = new Int16Array(2);

    let any_coverage_w, any_coverage_h;

    //const source_total_coverage_ibounds = new Int16Array(4);

    let total_coverage_l, total_coverage_t, total_coverage_r, total_coverage_b;

    let byi_read;

    let dest_byi = 0;
    //const dest_xy = new Int16Array(2);
    //[width, height, bypp, bypr, bipp, bipr] = dest_colorspace;

    const width = dest_colorspace[0], height = dest_colorspace[1];


    // Storing calculated values from the previous x?
    //  Precalculating an array of different variables for all x values.
    //  Then all y values are iterated so no benefit from precalc.
    //   edges etc

    // A lot more could be precalculated and then referenced.

    // Read a set of values from a larger ta for each x?
    //  Or refer to it.
    //  

    // Could make a version of this that does precalculations.


    let x, y;

    let r = 0, g = 0, b = 0;
    let x_inner, y_inner;

    let byi_read_right, byi_read_below, byi_read_below_right;

    let byi_tl, byi_tm, byi_tr;
    let byi_ml, byi_mm, byi_mr;
    let byi_bl, byi_bm, byi_br;

    let end_hmiddle, end_vmiddle;



    // could have next source pixel pos
    //  use it for bounds of the current pixel


    //for (dest_xy[1] = 0; dest_xy[1] < height; dest_xy[1]++) {
    for (y = 0; y < height; y++) {

        // Can optimize with calculations done just using y.


        fbounds_t = y * fpxh;
        fbounds_b = fbounds_t + fpxh;
        //fbounds_b = (fbounds_t = y * fpxh) + fpxh;


        ibounds_t = Math.floor(fbounds_t);
        ibounds_b = Math.ceil(fbounds_b);



        //source_i_any_coverage_size[1] = source_ibounds[3] - source_ibounds[1];

        any_coverage_h = ibounds_b - ibounds_t;

        //source_total_coverage_ibounds[1] = Math.ceil(source_fbounds[1]);

        total_coverage_t = Math.ceil(fbounds_t);

        //source_total_coverage_ibounds[3] = source_fbounds[3];

        total_coverage_b = Math.floor(fbounds_b);

        //source_edge_distances[1] = source_total_coverage_ibounds[1] - source_fbounds[1];
        //source_edge_distances[3] = source_fbounds[3] - source_total_coverage_ibounds[3];


        //edge_t = total_coverage_t - fbounds_t || 1;
        //edge_b = fbounds_b - total_coverage_b || 1;

        edge_t = total_coverage_t - fbounds_t;
        edge_b = fbounds_b - total_coverage_b;

        if (edge_t === 0) edge_t = 1;
        if (edge_b === 0) edge_b = 1;

        //if (source_edge_distances[1] === 0) source_edge_distances[1] = 1;
        //if (source_edge_distances[3] === 0) source_edge_distances[3] = 1;

        //edge_distances_proportions_of_total[1] = source_edge_distances[1] / fpx_area;
        //edge_distances_proportions_of_total[3] = source_edge_distances[3] / fpx_area;

        //edge_p_t = 

        edge_p_t = edge_t / fpx_area;
        edge_p_b = edge_b / fpx_area;

        // Could try incrementing the fbounds...

        fbounds_l = 0;
        fbounds_r = fpxw;


        for (x = 0; x < width; x++) {
            fbounds_l = x * fpxw;
            fbounds_r = (x + 1) * fpxw;
            ibounds_l = Math.floor(fbounds_l);
            ibounds_r = Math.ceil(fbounds_r);
            any_coverage_w = ibounds_r - ibounds_l;
            byi_read = ibounds_l * source_bypp + ibounds_t * source_bypr;
            total_coverage_l = Math.ceil(fbounds_l);
            total_coverage_r = Math.floor(fbounds_r);
            edge_l = total_coverage_l - fbounds_l;
            edge_r = fbounds_r - total_coverage_r;
            if (edge_l === 0) edge_l = 1;
            if (edge_r === 0) edge_r = 1;
            corner_p_tl = edge_l * edge_p_t;
            corner_p_tr = edge_r * edge_p_t;
            corner_p_bl = edge_l * edge_p_b;
            corner_p_br = edge_r * edge_p_b;

            if (any_coverage_w > 3 ||  any_coverage_h > 3) {
                edge_p_l = edge_l / fpx_area;
                    //edge_distances_proportions_of_total[1] = edge_t / fpx_area;
                edge_p_r = edge_r / fpx_area;


                /*

                read_gt3x3_weight_write_24bipp$locals(ta_source, source_bypr, byi_read,
                    any_coverage_w, any_coverage_h,
                    edge_p_l, edge_p_t, edge_p_r, edge_p_b,
                    corner_p_tl, corner_p_tr, corner_p_bl, corner_p_br,
                    fpx_area_recip,
                    opt_ta_dest, dest_byi
                    )
                    */

                byi_tl = byi_read;
                //byi_read = byi_tl;
                
                // Separate loops...
                //  Worth having an inner row loop too.
                
                end_hmiddle = any_coverage_w - 1; end_vmiddle = any_coverage_h - 1;
            
                //const [w, h] = source_i_any_coverage_size;
            
                //console.log('bypr, byi_read, source_i_any_coverage_size', bypr, byi_read, source_i_any_coverage_size);
                //console.log('[edge_distances_proportions_of_total, corner_weights_ltrb, fpx_area_recip]', [edge_distances_proportions_of_total, corner_weights_ltrb, fpx_area_recip]);
                r = g = b = 0;
            
                r += ta_source[byi_read++] * corner_p_tl;
                g += ta_source[byi_read++] * corner_p_tl;
                b += ta_source[byi_read++] * corner_p_tl;
            
                // loop through the middle section of the top row.
            
                //x = 1;
                
            
                for (x_inner = 1; x_inner < end_hmiddle; x_inner++) {
                    r += ta_source[byi_read++] * edge_p_t;
                    g += ta_source[byi_read++] * edge_p_t;
                    b += ta_source[byi_read++] * edge_p_t;
                }
            
                r += ta_source[byi_read++] * corner_p_tr;
                g += ta_source[byi_read++] * corner_p_tr;
                b += ta_source[byi_read++] * corner_p_tr;
            
                // then loop through the v middle rows.
            
                for (y_inner = 1; y_inner < end_vmiddle; y_inner++) {
                    byi_read = byi_tl + y_inner * source_bypr;
            
                    r += ta_source[byi_read++] * edge_p_l;
                    g += ta_source[byi_read++] * edge_p_l;
                    b += ta_source[byi_read++] * edge_p_l;
            
                    for (x_inner = 1; x_inner < end_hmiddle; x_inner++) {
                        r += ta_source[byi_read++] * fpx_area_recip;
                        g += ta_source[byi_read++] * fpx_area_recip;
                        b += ta_source[byi_read++] * fpx_area_recip;
                    }
            
                    r += ta_source[byi_read++] * edge_p_r;
                    g += ta_source[byi_read++] * edge_p_r;
                    b += ta_source[byi_read++] * edge_p_r;
                }
                byi_read = byi_tl + end_vmiddle * source_bypr;
                // then the bottom vrow
                r += ta_source[byi_read++] * corner_p_bl;
                g += ta_source[byi_read++] * corner_p_bl;
                b += ta_source[byi_read++] * corner_p_bl;
                // loop through the middle section of the top row.
                //x = 1;
            
                //const end_hmiddle = w - 1, end_vmiddle = h - 1;
            
                for (x_inner = 1; x_inner < end_hmiddle; x_inner++) {
                    r += ta_source[byi_read++] * edge_p_b;
                    g += ta_source[byi_read++] * edge_p_b;
                    b += ta_source[byi_read++] * edge_p_b;
                }
            
                r += ta_source[byi_read++] * corner_p_br;
                g += ta_source[byi_read++] * corner_p_br;
                b += ta_source[byi_read++] * corner_p_br;
            
                //console.log('[r, g, b]', [r, g, b]);
            
                /*
            
                if (false && (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255)) {
            
                    //console.log('byi_read', byi_read);
            
                    console.log('[r, g, b]', [r, g, b]);
                    console.log('[bypr, byi_read, source_i_any_coverage_size]', [bypr, byi_read, source_i_any_coverage_size]);
                    console.log('[edge_distances_proportions_of_total, corner_weights_ltrb, fpx_area_recip]', [edge_distances_proportions_of_total, corner_weights_ltrb, fpx_area_recip]);
            
                    console.trace();
                    throw 'stop';
            
                }
                */
            
                ta_dest[dest_byi] = Math.round(r);
                ta_dest[dest_byi + 1] = Math.round(g);
                ta_dest[dest_byi + 2] = Math.round(b);
            } else {

                if (any_coverage_w === 2 && any_coverage_h === 2) {

                    
                    //read_2x2_weight_write_24bipp$locals(ta_source, source_bypr, byi_read, 
                    //    corner_p_tl, corner_p_tr, corner_p_bl, corner_p_br,
                    //    opt_ta_dest, dest_byi); 

                        
                        
                    byi_read_right = byi_read + 3;
                    byi_read_below = byi_read + source_bypr;
                    byi_read_below_right = byi_read_below + 3;
                    ta_dest[dest_byi] = corner_p_tl * ta_source[byi_read++] + corner_p_tr * ta_source[byi_read_right++] + corner_p_bl * ta_source[byi_read_below++] + corner_p_br * ta_source[byi_read_below_right++];
                    ta_dest[dest_byi + 1] = corner_p_tl * ta_source[byi_read++] + corner_p_tr * ta_source[byi_read_right++] + corner_p_bl * ta_source[byi_read_below++] + corner_p_br * ta_source[byi_read_below_right++];
                    ta_dest[dest_byi + 2] = corner_p_tl * ta_source[byi_read++] + corner_p_tr * ta_source[byi_read_right++] + corner_p_bl * ta_source[byi_read_below++] + corner_p_br * ta_source[byi_read_below_right++];
                    


                } else {
                    edge_p_l = edge_l / fpx_area;
                    edge_p_r = edge_r / fpx_area;
                    if (any_coverage_w === 2 && any_coverage_h === 3) {


                        /*

                        read_2x3_weight_write_24bipp$locals(ta_source, source_bypr, byi_read,
                            edge_p_l, edge_p_t, edge_p_r, edge_p_b,
                            corner_p_tl, corner_p_tr, corner_p_bl, corner_p_br,
                            opt_ta_dest, dest_byi);

                        */


                        byi_tl = byi_read; byi_tr = byi_tl + 3;
                        byi_ml = byi_tl + source_bypr; byi_mr = byi_ml + 3;
                        byi_bl = byi_ml + source_bypr; byi_br = byi_bl + 3;
                    
                        ta_dest[dest_byi] =     ta_source[byi_tl++] * corner_p_tl + ta_source[byi_tr++] * corner_p_tr +
                                                ta_source[byi_ml++] * edge_p_l + ta_source[byi_mr++] * edge_p_r +
                                                ta_source[byi_bl++] * corner_p_bl + ta_source[byi_br++] * corner_p_br
                    
                    
                        ta_dest[dest_byi + 1] = ta_source[byi_tl++] * corner_p_tl + ta_source[byi_tr++] * corner_p_tr +
                                                ta_source[byi_ml++] * edge_p_l + ta_source[byi_mr++] * edge_p_r +
                                                ta_source[byi_bl++] * corner_p_bl + ta_source[byi_br++] * corner_p_br
                    
                    
                        ta_dest[dest_byi + 2] = ta_source[byi_tl++] * corner_p_tl + ta_source[byi_tr++] * corner_p_tr +
                                                ta_source[byi_ml++] * edge_p_l + ta_source[byi_mr++] * edge_p_r +
                                                ta_source[byi_bl++] * corner_p_bl + ta_source[byi_br++] * corner_p_br





                        //read_2x3_weight_write_24bipp(ta_source, source_bypr, byi_read, edge_distances_proportions_of_total, corner_areas_proportions_of_total, opt_ta_dest, dest_byi);
                        ///read_2x3_weight_write_24bipp$locals(ta_source, source_bypr, byi_read, edge_distances_proportions_of_total, corner_areas_proportions_of_total, opt_ta_dest, dest_byi);
                    } else if (any_coverage_w === 3 && any_coverage_h === 2) {
                        //read_3x2_weight_write_24bipp(ta_source, source_bypr, byi_read, edge_distances_proportions_of_total, corner_areas_proportions_of_total, opt_ta_dest, dest_byi);
                        //read_3x2_weight_write_24bipp$locals(ta_source, source_bypr, byi_read, edge_distances_proportions_of_total, corner_areas_proportions_of_total, opt_ta_dest, dest_byi);


                        /*

                        read_3x2_weight_write_24bipp$locals(ta_source, source_bypr, byi_read,
                            edge_p_l, edge_p_t, edge_p_r, edge_p_b,
                            corner_p_tl, corner_p_tr, corner_p_bl, corner_p_br,
                            opt_ta_dest, dest_byi);

                        */

                        byi_tl = byi_read;
                        byi_tm = byi_tl + 3; byi_tr = byi_tm + 3;
                        byi_bl = byi_tm + source_bypr; byi_bm = byi_bl + 3; byi_br = byi_bm + 3;

                        


                        ta_dest[dest_byi] =     ta_source[byi_tl++] * corner_p_tl + ta_source[byi_tm++] * edge_p_t + ta_source[byi_tr++] * corner_p_tr +
                                            ta_source[byi_bl++] * corner_p_bl + ta_source[byi_bm++] * edge_p_b + ta_source[byi_br++] * corner_p_br;

                        ta_dest[dest_byi + 1] = ta_source[byi_tl++] * corner_p_tl + ta_source[byi_tm++] * edge_p_t + ta_source[byi_tr++] * corner_p_tr +
                                            ta_source[byi_bl++] * corner_p_bl + ta_source[byi_bm++] * edge_p_b + ta_source[byi_br++] * corner_p_br;
                                            
                        ta_dest[dest_byi + 2] = ta_source[byi_tl++] * corner_p_tl + ta_source[byi_tm++] * edge_p_t + ta_source[byi_tr++] * corner_p_tr +
                                            ta_source[byi_bl++] * corner_p_bl + ta_source[byi_bm++] * edge_p_b + ta_source[byi_br++] * corner_p_br;
                                            

                    } else if (any_coverage_w === 3 && any_coverage_h === 3) {
                        //read_3x3_weight_write_24bipp(ta_source, source_bypr, byi_read, edge_distances_proportions_of_total, corner_areas_proportions_of_total, fpx_area_recip, opt_ta_dest, dest_byi);

                        //read_3x3_weight_write_24bipp$locals(ta_source, source_bypr, byi_read, edge_distances_proportions_of_total, corner_areas_proportions_of_total, fpx_area_recip, opt_ta_dest, dest_byi);
                        /*
                        read_3x3_weight_write_24bipp$locals(ta_source, source_bypr, byi_read,
                            edge_p_l, edge_p_t, edge_p_r, edge_p_b,
                            corner_p_tl, corner_p_tr, corner_p_bl, corner_p_br,
                            fpx_area_recip,
                            opt_ta_dest, dest_byi);

                            */

                        byi_tl = byi_read; byi_tm = byi_tl + source_bypp; byi_tr = byi_tm + source_bypp;
                        byi_ml = byi_tl + source_bypr; byi_mm = byi_ml + source_bypp; byi_mr = byi_mm + source_bypp;
                        byi_bl = byi_ml + source_bypr; byi_bm = byi_bl + source_bypp; byi_br = byi_bm + source_bypp;
                    
                        // Doing it component by component.
                    
                        ta_dest[dest_byi] =     ta_source[byi_tl++] * corner_p_tl + ta_source[byi_tm++] * edge_p_t + ta_source[byi_tr++] * corner_p_tr +
                                                ta_source[byi_ml++] * edge_p_l + ta_source[byi_mm++] * fpx_area_recip + ta_source[byi_mr++] * edge_p_r +
                                                ta_source[byi_bl++] * corner_p_bl + ta_source[byi_bm++] * edge_p_b + ta_source[byi_br++] * corner_p_br
                    
                    
                        ta_dest[dest_byi + 1] = ta_source[byi_tl++] * corner_p_tl + ta_source[byi_tm++] * edge_p_t + ta_source[byi_tr++] * corner_p_tr +
                                                ta_source[byi_ml++] * edge_p_l + ta_source[byi_mm++] * fpx_area_recip + ta_source[byi_mr++] * edge_p_r +
                                                ta_source[byi_bl++] * corner_p_bl + ta_source[byi_bm++] * edge_p_b + ta_source[byi_br++] * corner_p_br
                    
                    
                        ta_dest[dest_byi + 2] = ta_source[byi_tl++] * corner_p_tl + ta_source[byi_tm++] * edge_p_t + ta_source[byi_tr++] * corner_p_tr +
                                                ta_source[byi_ml++] * edge_p_l + ta_source[byi_mm++] * fpx_area_recip + ta_source[byi_mr++] * edge_p_r +
                                                ta_source[byi_bl++] * corner_p_bl + ta_source[byi_bm++] * edge_p_b + ta_source[byi_br++] * corner_p_br
                    } else {

                        console.trace();
                        throw 'stop';

                        //read_gt3x3_weight_write_24bipp(ta_source, source_bypr, byi_read, source_i_any_coverage_size, edge_distances_proportions_of_total, corner_areas_proportions_of_total, fpx_area_recip, opt_ta_dest, dest_byi);
                    }
                }
            }
            dest_byi += source_bypp;

            //fbounds_l += fpxw; fbounds_r += fpxw;
        }
    }
}

// Inlining provides uncertain benefits...

//resize_ta_colorspace_24bipp$superpixel$inline$locals = resize_ta_colorspace_24bipp$superpixel$inline$locals$inline;
//resize_ta_colorspace_24bipp$superpixel$inline = resize_ta_colorspace_24bipp$superpixel$inline$locals;
const resize_ta_colorspace_24bipp$superpixel = resize_ta_colorspace_24bipp$superpixel$inline$locals$inline;

// Can try a super-inlined version of superpixel.
//  It would use 9 local variables for the edges, inner weight, and corners.
//   Its faster for the largest images, slower on smaller ones.





const resize_ta_colorspace_24bipp$general = (ta_source, source_colorspace, dest_size, opt_ta_dest) => {

    const dest_to_source_ratio = new Float32Array([source_colorspace[0] / dest_size[0], source_colorspace[1] / dest_size[1]]);

    // >1, >1 - can use a superpixels version.

    // Could use a non-callback iteration?
    //  Would be easier to port to C++.




    const [width, height, bypp, bypr, bipp, bipr] = source_colorspace;
    const fpx_area_recip = 1 / (dest_to_source_ratio[0] * dest_to_source_ratio[1]);
    each_source_dest_pixels_resized_limited_further_info(source_colorspace, dest_size, (dest_byi, source_i_any_coverage_size, edge_distances_proportions_of_total, corner_areas_proportions_of_total, byi_read) => {

        if (source_i_any_coverage_size[0] === 1) {
            if (source_i_any_coverage_size[1] === 1) {
                // copy_px_24bipp
                /*
                opt_ta_dest[dest_byi] = ta_source[byi_read++];
                opt_ta_dest[dest_byi + 1] = ta_source[byi_read++];
                opt_ta_dest[dest_byi + 2] = ta_source[byi_read++];
                */
    
                copy_px_24bipp(ta_source, byi_read, opt_ta_dest, dest_byi);
            } else if (source_i_any_coverage_size[1] === 2) {
    
                // read_1x2_weight_write_24bipp
                //  weight_l, weight_r params?
                //   Could make sense here rather than giving the array.
                //    Maybe splitting code will lead to better function optimization.
    
                read_1x2_weight_write_24bipp(ta_source, bypr, byi_read, opt_ta_dest, dest_byi, edge_distances_proportions_of_total[1], edge_distances_proportions_of_total[3]);
                /*
                byi_read_below = byi_read + bypr;
                opt_ta_dest[dest_byi] = edge_distances_proportions_of_total[1] * ta_source[byi_read++] + edge_distances_proportions_of_total[3] * ta_source[byi_read_below++];
                opt_ta_dest[dest_byi + 1] = edge_distances_proportions_of_total[1] * ta_source[byi_read++] + edge_distances_proportions_of_total[3] * ta_source[byi_read_below++];
                opt_ta_dest[dest_byi + 2] = edge_distances_proportions_of_total[1] * ta_source[byi_read++] + edge_distances_proportions_of_total[3] * ta_source[byi_read_below++];
                */
            } else {
                console.log('source_i_any_coverage_size', source_i_any_coverage_size);
                console.trace();
                throw 'NYI';
            }
        } else if (source_i_any_coverage_size[0] === 2) {
            if (source_i_any_coverage_size[1] === 1) {
    
                
    
    
                //byi_read_right = byi_read + bypp;
                //opt_ta_dest[dest_byi] = edge_distances_proportions_of_total[0] * ta_source[byi_read++] + edge_distances_proportions_of_total[2] * ta_source[byi_read_right++];
                //opt_ta_dest[dest_byi + 1] = edge_distances_proportions_of_total[0] * ta_source[byi_read++] + edge_distances_proportions_of_total[2] * ta_source[byi_read_right++];
                //opt_ta_dest[dest_byi + 2] = edge_distances_proportions_of_total[0] * ta_source[byi_read++] + edge_distances_proportions_of_total[2] * ta_source[byi_read_right++];
    
                
                read_2x1_weight_write_24bipp(ta_source, byi_read, opt_ta_dest, dest_byi, edge_distances_proportions_of_total[0], edge_distances_proportions_of_total[2]);
    
            } else if (source_i_any_coverage_size[1] === 2) {
    
                /*
    
                byi_read_right = byi_read + bypp;
                byi_read_below = byi_read + bypr;
                byi_read_below_right = byi_read_below + bypp;
                opt_ta_dest[dest_byi] = corner_areas_proportions_of_total[0] * ta_source[byi_read++] + corner_areas_proportions_of_total[1] * ta_source[byi_read_right++] + corner_areas_proportions_of_total[2] * ta_source[byi_read_below++] + corner_areas_proportions_of_total[3] * ta_source[byi_read_below_right++];
                opt_ta_dest[dest_byi + 1] = corner_areas_proportions_of_total[0] * ta_source[byi_read++] + corner_areas_proportions_of_total[1] * ta_source[byi_read_right++] + corner_areas_proportions_of_total[2] * ta_source[byi_read_below++] + corner_areas_proportions_of_total[3] * ta_source[byi_read_below_right++];
                opt_ta_dest[dest_byi + 2] = corner_areas_proportions_of_total[0] * ta_source[byi_read++] + corner_areas_proportions_of_total[1] * ta_source[byi_read_right++] + corner_areas_proportions_of_total[2] * ta_source[byi_read_below++] + corner_areas_proportions_of_total[3] * ta_source[byi_read_below_right++];
                */
    
                read_2x2_weight_write_24bipp(ta_source, bypr, byi_read, opt_ta_dest, dest_byi, corner_areas_proportions_of_total);
            
            } else {
    
                // 2x3 case too...
    
                read_2x3_weight_write_24bipp(ta_source, bypr, byi_read, edge_distances_proportions_of_total, corner_areas_proportions_of_total, opt_ta_dest, dest_byi);
    
                //console.log('source_i_any_coverage_size', source_i_any_coverage_size);
                //console.trace();
                //throw 'NYI';
            }
        } else if (source_i_any_coverage_size[0] === 3) {
    
            if (source_i_any_coverage_size[1] === 1) {
    
                console.log('source_i_any_coverage_size', source_i_any_coverage_size);
                console.trace();
                throw 'NYI';
                
    
            } else if (source_i_any_coverage_size[1] === 2) {
                //console.log('3x2 case');
    
                // Seems like making a separate optimized function makes sense...
                //  Maybe separate functions like this will even run faster? Could make / try some others too.
    
                // read_weight_write_3x2_24bipp(ta_source, source_bypr, byi_read, edge_distances_proportions_of_total, corner_areas_proportions_of_total, dest_byi);
    
                // Specific read-merge-write merge function of specific size.
                read_3x2_weight_write_24bipp(ta_source, bypr, byi_read, edge_distances_proportions_of_total, corner_areas_proportions_of_total, opt_ta_dest, dest_byi);
    
            } else if (source_i_any_coverage_size[1] === 3) {
                //console.log('3x3 case');
    
                // Seems like making a separate optimized function makes sense...
                //  Maybe separate functions like this will even run faster? Could make / try some others too.
    
    
                //console.log('source_i_any_coverage_size', source_i_any_coverage_size);
                //console.trace();
                //throw 'NYI';
                // read_weight_write_3x2_24bipp(ta_source, source_bypr, byi_read, edge_distances_proportions_of_total, corner_areas_proportions_of_total, dest_byi);
    
                // Specific read-merge-write merge function of specific size.
                read_3x3_weight_write_24bipp(ta_source, bypr, byi_read, edge_distances_proportions_of_total, corner_areas_proportions_of_total, fpx_area_recip, opt_ta_dest, dest_byi);
    
            } else {
                // general case, not covered by the smaller and specific read-merge-write functions.
                // source_i_any_coverage_size
                // Could make more of a special case here.
                //  This function now has a C++ accelerated version.
    
                read_gt3x3_weight_write_24bipp(ta_source, bypr, byi_read, source_i_any_coverage_size, edge_distances_proportions_of_total, corner_areas_proportions_of_total, fpx_area_recip, opt_ta_dest, dest_byi);
    
                //console.log('source_i_any_coverage_size', source_i_any_coverage_size);
                //console.trace();
    
                //console.log('source_i_any_coverage_size', source_i_any_coverage_size);
                //console.trace();
                //throw 'NYI';
    
            }
        } else {
            //console.log('source_i_any_coverage_size', source_i_any_coverage_size);
    
            // Would be good to be able to swap these functions for accelerated versions?
            //  Have the functions stored as local (let) variables instead...
    
            //  ta_math.override_fn('read_gt3x3_weight_write_24bipp', accelerated_read_gt3x3_weight_write_24bipp);
    
            read_gt3x3_weight_write_24bipp(ta_source, bypr, byi_read, source_i_any_coverage_size, edge_distances_proportions_of_total, corner_areas_proportions_of_total, fpx_area_recip, opt_ta_dest, dest_byi);
        }
    });
}

const resize_ta_colorspace_24bipp = (ta_source, source_colorspace, dest_size, opt_ta_dest) => {

    // Simplified this function.
    //  Seems like a small perf cost with the extra function calls used.
    //   Could optimize - not setting any weights when its 1x1, not doing the measurements.

    // C++ versions of the functions that run in here would be of use.
    //  May also be better to use functions for single pixel , 2x1 etc read-merge-write operations.
    //   Would make this function significantly shorter overall, and act more as a function dispatcher.

    //const dest_colorspace = new Int32Array([dest_size[0], dest_size[1], bypp, bypp * dest_size[0], bipp, bipp * dest_size[0]]);
    
    // floating point location in source
    const dest_to_source_ratio = new Float32Array([source_colorspace[0] / dest_size[0], source_colorspace[1] / dest_size[1]]);

    if (dest_to_source_ratio[0] < 1 && dest_to_source_ratio[1] < 1) {
        return resize_ta_colorspace_24bipp$subpixel(ta_source, source_colorspace, dest_size, opt_ta_dest);

    } else if (dest_to_source_ratio[0] > 1 && dest_to_source_ratio[1] > 1) {
        //return resize_ta_colorspace_24bipp$superpixel(ta_source, source_colorspace, dest_size, opt_ta_dest);

        // Optimized superpixel version could then be ported to C++.
        //  The superpixel version would need to do more weight and merging calculations.

        



        // Superpixel version will have specific code for superpixels, ie larger weighted areas.
        //  Specific handlers for 2x2, 2x3, 3x2 - they are important, and used in many resized (ones not to a very large scale change)


        return resize_ta_colorspace_24bipp$superpixel(ta_source, source_colorspace, dest_size, opt_ta_dest);

    } else {
        return resize_ta_colorspace_24bipp$general(ta_source, source_colorspace, dest_size, opt_ta_dest);
    }

    // Bounds calc could be more appropriate?
    //  or keep using + dest_to_source_ratio

    // the bounds are most important for the various calculations...

    //const source_fxy = new Float32Array(2);
    // Maybe source bounds will be more useful?
    //const source_ixy = new Int16Array(2);

    

    //let byi_read;
    //let byi_read_below, byi_read_right, byi_read_below_right;


    //let extension_above, extension_below, extension_left, extension_right;


    // reply consts with lets in this scope?
    //  or use typed arrays to hold the info?

    // also a crossover_x?

    //const source_px_area = dest_to_source_ratio[0] * dest_to_source_ratio[1];
    // potential crossover point - keep it updated?
    //const source_xy_crossover = new Int16Array(2);

    // dest_xy, dest_byi, source_fbounds, source_ibounds, source_i_any_coverage_size, source_total_coverage_ibounds, source_edge_distances, source_corner_areas, edge_distances_proportions_of_total, corner_areas_proportions_of_total, byi_read

    // limited_further_info - won't return as much in the callback.

    // each_source_dest_pixels_resized_further_info(source_colorspace, dest_size, (dest_xy, dest_byi, source_fbounds, source_ibounds, source_i_any_coverage_size, source_total_coverage_ibounds, source_edge_distances, source_corner_areas, edge_distances_proportions_of_total, corner_areas_proportions_of_total, byi_read)


    // (dest_byi, source_i_any_coverage_size, edge_distances_proportions_of_total, corner_areas_proportions_of_total, byi_read)

    // Could call some other internal function to do the weighted read over area (give weight values, not indicidual weights, it reads, weights, and writes)


    // May need to fix each_source_dest_pixels_resized_limited_further_info if it doesnt properly process superpixels whose pos matches their fpos.
    //each_source_dest_pixels_resized_limited_further_info(source_colorspace, dest_size, read_fpx_weight_write_24bipp);

    // Only need to get as in-depth with weightings on larger fpx sizes.



    
}


const read_fpx_weight_write_24bipp = (dest_byi, source_i_any_coverage_size, edge_distances_proportions_of_total, corner_areas_proportions_of_total, byi_read) => {



    
    if (source_i_any_coverage_size[0] === 1) {
        if (source_i_any_coverage_size[1] === 1) {

            // copy_px_24bipp
            
            opt_ta_dest[dest_byi] = ta_source[byi_read++];
            opt_ta_dest[dest_byi + 1] = ta_source[byi_read++];
            opt_ta_dest[dest_byi + 2] = ta_source[byi_read++];

            //copy_px_24bipp(ta_source, byi_read, opt_ta_dest, dest_byi);

        } else if (source_i_any_coverage_size[1] === 2) {

            // read_1x2_weight_write_24bipp
            //  weight_l, weight_r params?
            //   Could make sense here rather than giving the array.
            //    Maybe splitting code will lead to better function optimization.

            //read_1x2_weight_write_24bipp(ta_source, byi_read, bypr, opt_ta_dest, dest_byi, edge_distances_proportions_of_total[1], edge_distances_proportions_of_total[3]);


            
            byi_read_below = byi_read + bypr;
            opt_ta_dest[dest_byi] = edge_distances_proportions_of_total[1] * ta_source[byi_read++] + edge_distances_proportions_of_total[3] * ta_source[byi_read_below++];
            opt_ta_dest[dest_byi + 1] = edge_distances_proportions_of_total[1] * ta_source[byi_read++] + edge_distances_proportions_of_total[3] * ta_source[byi_read_below++];
            opt_ta_dest[dest_byi + 2] = edge_distances_proportions_of_total[1] * ta_source[byi_read++] + edge_distances_proportions_of_total[3] * ta_source[byi_read_below++];
            
        } else {
            console.log('source_i_any_coverage_size', source_i_any_coverage_size);
            console.trace();
            throw 'NYI';
        }
    } else if (source_i_any_coverage_size[0] === 2) {
        if (source_i_any_coverage_size[1] === 1) {

            


            byi_read_right = byi_read + bypp;
            opt_ta_dest[dest_byi] = edge_distances_proportions_of_total[0] * ta_source[byi_read++] + edge_distances_proportions_of_total[2] * ta_source[byi_read_right++];
            opt_ta_dest[dest_byi + 1] = edge_distances_proportions_of_total[0] * ta_source[byi_read++] + edge_distances_proportions_of_total[2] * ta_source[byi_read_right++];
            opt_ta_dest[dest_byi + 2] = edge_distances_proportions_of_total[0] * ta_source[byi_read++] + edge_distances_proportions_of_total[2] * ta_source[byi_read_right++];

            
            //read_2x1_weight_write_24bipp(ta_source, byi_read, opt_ta_dest, dest_byi, edge_distances_proportions_of_total[0], edge_distances_proportions_of_total[2]);

        } else if (source_i_any_coverage_size[1] === 2) {

            

            byi_read_right = byi_read + bypp;
            byi_read_below = byi_read + bypr;
            byi_read_below_right = byi_read_below + bypp;
            opt_ta_dest[dest_byi] = corner_areas_proportions_of_total[0] * ta_source[byi_read++] + corner_areas_proportions_of_total[1] * ta_source[byi_read_right++] + corner_areas_proportions_of_total[2] * ta_source[byi_read_below++] + corner_areas_proportions_of_total[3] * ta_source[byi_read_below_right++];
            opt_ta_dest[dest_byi + 1] = corner_areas_proportions_of_total[0] * ta_source[byi_read++] + corner_areas_proportions_of_total[1] * ta_source[byi_read_right++] + corner_areas_proportions_of_total[2] * ta_source[byi_read_below++] + corner_areas_proportions_of_total[3] * ta_source[byi_read_below_right++];
            opt_ta_dest[dest_byi + 2] = corner_areas_proportions_of_total[0] * ta_source[byi_read++] + corner_areas_proportions_of_total[1] * ta_source[byi_read_right++] + corner_areas_proportions_of_total[2] * ta_source[byi_read_below++] + corner_areas_proportions_of_total[3] * ta_source[byi_read_below_right++];
            

            //console.log('corner_areas_proportions_of_total', corner_areas_proportions_of_total);

            //read_2x2_weight_write_24bipp(ta_source, byi_read, bypr, opt_ta_dest, dest_byi, corner_areas_proportions_of_total);
        
        } else {

            // 2x3 case too...

            read_2x3_weight_write_24bipp(ta_source, bypr, byi_read, edge_distances_proportions_of_total, corner_areas_proportions_of_total, opt_ta_dest, dest_byi);

            //console.log('source_i_any_coverage_size', source_i_any_coverage_size);
            //console.trace();
            //throw 'NYI';
        }
    } else if (source_i_any_coverage_size[0] === 3) {

        if (source_i_any_coverage_size[1] === 1) {

            console.log('source_i_any_coverage_size', source_i_any_coverage_size);
            console.trace();
            throw 'NYI';
            

        } else if (source_i_any_coverage_size[1] === 2) {
            //console.log('3x2 case');

            // Seems like making a separate optimized function makes sense...
            //  Maybe separate functions like this will even run faster? Could make / try some others too.

            // read_weight_write_3x2_24bipp(ta_source, source_bypr, byi_read, edge_distances_proportions_of_total, corner_areas_proportions_of_total, dest_byi);

            // Specific read-merge-write merge function of specific size.
            read_3x2_weight_write_24bipp(ta_source, bypr, byi_read, edge_distances_proportions_of_total, corner_areas_proportions_of_total, opt_ta_dest, dest_byi);

        } else if (source_i_any_coverage_size[1] === 3) {
            //console.log('3x3 case');

            // Seems like making a separate optimized function makes sense...
            //  Maybe separate functions like this will even run faster? Could make / try some others too.


            //console.log('source_i_any_coverage_size', source_i_any_coverage_size);
            //console.trace();
            //throw 'NYI';
            // read_weight_write_3x2_24bipp(ta_source, source_bypr, byi_read, edge_distances_proportions_of_total, corner_areas_proportions_of_total, dest_byi);

            // Specific read-merge-write merge function of specific size.
            read_3x3_weight_write_24bipp(ta_source, bypr, byi_read, edge_distances_proportions_of_total, corner_areas_proportions_of_total, fpx_area_recip, opt_ta_dest, dest_byi);

        } else {

            // general case, not covered by the smaller and specific read-merge-write functions.

            // source_i_any_coverage_size


            // Could make more of a special case here.
            //  This function now has a C++ accelerated version.


            read_gt3x3_weight_write_24bipp(ta_source, bypr, byi_read, source_i_any_coverage_size, edge_distances_proportions_of_total, corner_areas_proportions_of_total, fpx_area_recip, opt_ta_dest, dest_byi);

            //console.log('source_i_any_coverage_size', source_i_any_coverage_size);
            //console.trace();

            //console.log('source_i_any_coverage_size', source_i_any_coverage_size);
            //console.trace();
            //throw 'NYI';

        }
    } else {
        //console.log('source_i_any_coverage_size', source_i_any_coverage_size);

        // Would be good to be able to swap these functions for accelerated versions?
        //  Have the functions stored as local (let) variables instead...

        //  ta_math.override_fn('read_gt3x3_weight_write_24bipp', accelerated_read_gt3x3_weight_write_24bipp);

        read_gt3x3_weight_write_24bipp(ta_source, bypr, byi_read, source_i_any_coverage_size, edge_distances_proportions_of_total, corner_areas_proportions_of_total, fpx_area_recip, opt_ta_dest, dest_byi);
    }

}



const resize_ta_colorspace = (ta_source, source_colorspace, dest_size, opt_ta_dest) => {

    //const [width, height, bypp, bypr, bipp, bipr] = source_colorspace;
    //const bypp = source_colorspace[2];
    const bipp = source_colorspace[4];

    if (bipp === 1) {
        console.trace(); throw 'NYI';
    } else if (bipp === 8) {
        console.trace(); throw 'NYI';
    } else if (bipp === 24) {
        return resize_ta_colorspace_24bipp(ta_source, source_colorspace, dest_size, opt_ta_dest);
        //return read_merged_vfpx_24bipp(ta_source, colorspace, vfpx)
    } else if (bipp === 32) {
        console.trace(); throw 'NYI';
    } else {
        console.trace();
        throw 'unsupported bipp: ' + bipp;
    }
}




// convolve maths here too?

// in separate file for the moment...







module.exports = {
    resize_ta_colorspace: resize_ta_colorspace,
    resize_ta_colorspace_24bipp: resize_ta_colorspace_24bipp,
    resize_ta_colorspace_24bipp$subpixel: resize_ta_colorspace_24bipp$subpixel
    //,
    //override: override,
    //get_instance: get_instance
}

