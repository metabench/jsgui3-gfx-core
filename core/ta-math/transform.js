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
const __each_source_dest_pixels_resized = (source_colorspace, dest_size, callback) => {
    const [width, height, bypp, bypr, bipp, bipr] = source_colorspace;
    const dest_colorspace = new Int32Array([dest_size[0], dest_size[1], bypp, bypp * dest_size[0], bipp, bipp * dest_size[0]]);
    const dest_to_source_ratio = new Float32Array([source_colorspace[0] / dest_size[0], source_colorspace[1] / dest_size[1]]);
    const source_fbounds = new Float32Array(4);
    const source_ibounds = new Int16Array(4);
    const source_i_any_coverage_size = new Int16Array(2);
    const source_total_coverage_ibounds = new Int16Array(4);
    let byi_read;
    each_pixel_in_colorspace(dest_colorspace, (dest_xy, dest_byi) => {
        source_fbounds[0] = dest_xy[0] * dest_to_source_ratio[0];
        source_fbounds[1] = dest_xy[1] * dest_to_source_ratio[1];
        source_fbounds[2] = source_fbounds[0] + dest_to_source_ratio[0];
        source_fbounds[3] = source_fbounds[1] + dest_to_source_ratio[1];
        source_ibounds[0] = source_fbounds[0];
        source_ibounds[1] = source_fbounds[1];
        source_ibounds[2] = Math.ceil(source_fbounds[2]);
        source_ibounds[3] = Math.ceil(source_fbounds[3]);
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
const each_source_dest_pixels_resized_inline = (source_colorspace, dest_size, callback) => {
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
    const _x_source_fbounds0 = new Float32Array(width);
    const _x_source_fbounds2 = new Float32Array(width);
    const _x_source_ibounds0 = new Int16Array(width);
    const _x_source_ibounds2 = new Int16Array(width);
    const _x_source_i_any_coverage_size = new Int16Array(width);
    const _x_source_i_total_coverage_l = new Int16Array(width);
    const _x_source_i_total_coverage_r = new Int16Array(width);
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
            source_fbounds[0] = _x_source_fbounds0[dest_xy[0]];
            source_fbounds[2] = _x_source_fbounds2[dest_xy[0]];
            source_ibounds[0] = _x_source_ibounds0[dest_xy[0]];
            source_ibounds[2] = _x_source_ibounds2[dest_xy[0]];
            source_i_any_coverage_size[0] = _x_source_i_any_coverage_size[dest_xy[0]];
            byi_read = _x_byi_read[dest_xy[0]] + row_byi;
            source_total_coverage_ibounds[0] = _x_source_i_total_coverage_l[dest_xy[0]];
            source_total_coverage_ibounds[2] = _x_source_i_total_coverage_r[dest_xy[0]];
            callback(dest_xy, dest_byi, source_fbounds, source_ibounds, source_i_any_coverage_size, source_total_coverage_ibounds, byi_read);
            dest_byi += bypp;
        }
    }
}
const each_source_dest_pixels_resized = each_source_dest_pixels_resized_inline;
const __each_source_dest_pixels_resized_limited_further_info = (source_colorspace, dest_size, callback) => {
    const dest_to_source_ratio = new Float32Array([source_colorspace[0] / dest_size[0], source_colorspace[1] / dest_size[1]]);
    const source_edge_distances = new Float32Array(4);
    const edge_distances_proportions_of_total = new Float32Array(4);
    const edge_segment_areas_proportion_of_total_area = new Float32Array(4);
    const corner_areas_proportions_of_total = new Float32Array(4);
    const fpx_area = dest_to_source_ratio[0] * dest_to_source_ratio[1];
    each_source_dest_pixels_resized(source_colorspace, dest_size, (dest_xy, dest_byi, source_fbounds, source_ibounds, source_i_any_coverage_size, source_total_coverage_ibounds, byi_read) => {
        if (source_i_any_coverage_size[0] === 1 && source_i_any_coverage_size[1] === 1) {
            callback(dest_byi, source_i_any_coverage_size, undefined, undefined, byi_read);
        } else if (source_i_any_coverage_size[0] === 1 && source_i_any_coverage_size[1] === 2) {
            source_edge_distances[1] = source_total_coverage_ibounds[1] - source_fbounds[1];
            source_edge_distances[3] = source_fbounds[3] - source_total_coverage_ibounds[3];
            if (source_edge_distances[1] === 0) source_edge_distances[1] = 1;
            if (source_edge_distances[3] === 0) source_edge_distances[3] = 1;
            edge_distances_proportions_of_total[1] = source_edge_distances[1] / dest_to_source_ratio[1];
            edge_distances_proportions_of_total[3] = source_edge_distances[3] / dest_to_source_ratio[1];
            callback(dest_byi, source_i_any_coverage_size, edge_distances_proportions_of_total, undefined, byi_read);
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
const each_source_dest_pixels_resized_limited_further_info$inline = (source_colorspace, dest_size, callback) => {
    const dest_to_source_ratio = new Float32Array([source_colorspace[0] / dest_size[0], source_colorspace[1] / dest_size[1]]);
    const source_edge_distances = new Float32Array(4);
    const edge_distances_proportions_of_total = new Float32Array(4);
    const corner_areas_proportions_of_total = new Float32Array(4);
    const fpx_area = dest_to_source_ratio[0] * dest_to_source_ratio[1];
    let [width, height, bypp, bypr, bipp, bipr] = source_colorspace;
    const source_bypr = bypr;
    const dest_colorspace = new Int32Array([dest_size[0], dest_size[1], bypp, bypp * dest_size[0], bipp, bipp * dest_size[0]]);
    const source_fbounds = new Float32Array(4);
    const source_ibounds = new Int16Array(4);
    const source_i_any_coverage_size = new Int16Array(2);
    const source_total_coverage_ibounds = new Int16Array(4);
    let byi_read;
    let dest_byi = 0;
    [width, height, bypp, bypr, bipp, bipr] = dest_colorspace;
    let x, y;
    for (y = 0; y < height; y++) {
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
            source_ibounds[0] = source_fbounds[0];
            source_ibounds[2] = Math.ceil(source_fbounds[2]);
            source_i_any_coverage_size[0] = source_ibounds[2] - source_ibounds[0];
            byi_read = source_ibounds[0] * bypp + source_ibounds[1] * source_bypr;
            if (source_i_any_coverage_size[0] === 1 && source_i_any_coverage_size[1] === 1) {
                callback(dest_byi, source_i_any_coverage_size, undefined, undefined, byi_read);
            } else {
                source_total_coverage_ibounds[0] = Math.ceil(source_fbounds[0]);
                source_total_coverage_ibounds[2] = source_fbounds[2];
                if (source_i_any_coverage_size[0] === 1 && source_i_any_coverage_size[1] === 2) {
                    callback(dest_byi, source_i_any_coverage_size, edge_distances_proportions_of_total, undefined, byi_read);
                } else {
                    source_edge_distances[0] = source_total_coverage_ibounds[0] - source_fbounds[0];
                    source_edge_distances[2] = source_fbounds[2] - source_total_coverage_ibounds[2];
                    if (source_edge_distances[0] === 0) source_edge_distances[0] = 1;
                    if (source_edge_distances[2] === 0) source_edge_distances[2] = 1;
                    if (source_i_any_coverage_size[0] === 2 && source_i_any_coverage_size[1] === 1) {
                        edge_distances_proportions_of_total[0] = source_edge_distances[0] / dest_to_source_ratio[0];
                        edge_distances_proportions_of_total[2] = source_edge_distances[2] / dest_to_source_ratio[0];
                        callback(dest_byi, source_i_any_coverage_size, edge_distances_proportions_of_total, undefined, byi_read);
                    } else if (source_i_any_coverage_size[0] === 2 && source_i_any_coverage_size[1] === 2) {
                        corner_areas_proportions_of_total[0] = source_edge_distances[0] * source_edge_distances[1] / fpx_area;
                        corner_areas_proportions_of_total[1] = source_edge_distances[2] * source_edge_distances[1] / fpx_area;
                        corner_areas_proportions_of_total[2] = source_edge_distances[0] * source_edge_distances[3] / fpx_area;
                        corner_areas_proportions_of_total[3] = source_edge_distances[2] * source_edge_distances[3] / fpx_area;
                        callback(dest_byi, source_i_any_coverage_size, undefined, corner_areas_proportions_of_total, byi_read);
                    } else {
                        edge_distances_proportions_of_total[0] = source_edge_distances[0] / fpx_area;
                        edge_distances_proportions_of_total[2] = source_edge_distances[2] / fpx_area;
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
const each_source_dest_pixels_resized_limited_further_info = each_source_dest_pixels_resized_limited_further_info$inline;
const copy_px_24bipp = (ta_source, byi_read, ta_dest, byi_write) => {
    ta_dest[byi_write] = ta_source[byi_read++];
    ta_dest[byi_write + 1] = ta_source[byi_read++];
    ta_dest[byi_write + 2] = ta_source[byi_read++];
}
const read_1x2_weight_write_24bipp = (ta_source, bypr, byi_read, ta_dest, byi_write, weight_t, weight_b) => {
    let byi_read_below = byi_read + bypr;
    ta_dest[byi_write] = weight_t * ta_source[byi_read++] + weight_b * ta_source[byi_read_below++];
    ta_dest[byi_write + 1] = weight_t * ta_source[byi_read++] + weight_b * ta_source[byi_read_below++];
    ta_dest[byi_write + 2] = weight_t * ta_source[byi_read++] + weight_b * ta_source[byi_read_below++];
}
const read_1x2_weight_write_24bipp$ta4byis = (ta_source, ta4byis, ta_dest, byi_write, weight_t, weight_b) => {
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
    ta_dest[byi_write] = weight_l * ta_source[ta4byis[0]++] + weight_r * ta_source[ta4byis[1]++];
    ta_dest[byi_write + 1] = weight_l * ta_source[ta4byis[0]++] + weight_r * ta_source[ta4byis[1]++];
    ta_dest[byi_write + 2] = weight_l * ta_source[ta4byis[0]++] + weight_r * ta_source[ta4byis[1]++];
}
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
const read_2x2_weight_write_24bipp$ta4byis = (ta_source, ta4byis, ta_dest, byi_write, corner_weights_ltrb) => {
    ta_dest[byi_write] = corner_weights_ltrb[0] * ta_source[ta4byis[0]++] + corner_weights_ltrb[1] * ta_source[ta4byis[1]++] + corner_weights_ltrb[2] * ta_source[ta4byis[2]++] + corner_weights_ltrb[3] * ta_source[ta4byis[3]++];
    ta_dest[byi_write + 1] = corner_weights_ltrb[0] * ta_source[ta4byis[0]++] + corner_weights_ltrb[1] * ta_source[ta4byis[1]++] + corner_weights_ltrb[2] * ta_source[ta4byis[2]++] + corner_weights_ltrb[3] * ta_source[ta4byis[3]++];
    ta_dest[byi_write + 2] = corner_weights_ltrb[0] * ta_source[ta4byis[0]++] + corner_weights_ltrb[1] * ta_source[ta4byis[1]++] + corner_weights_ltrb[2] * ta_source[ta4byis[2]++] + corner_weights_ltrb[3] * ta_source[ta4byis[3]++];
}
const read_2x2_weight_write_24bipp$2_weight_ints = (ta_source, bypr, byi_read, ta_dest, byi_write, ta_lt_props) => {
    const tl = l_prop * t_prop;
    const tr = (1 - l_prop) * t_prop;
    const bl = l_prop * (1 - t_prop);
    const br = (1 - l_prop) * (1 - t_prop);
    let byi_read_right = byi_read + 3;
    let byi_read_below = byi_read + bypr;
    let byi_read_below_right = byi_read_below + 3;
    ta_dest[byi_write] = l_prop * t_prop * ta_source[byi_read++] + (1 - l_prop) * t_prop * ta_source[byi_read_right++] + l_prop * (1 - t_prop) * ta_source[byi_read_below++] + (1 - l_prop) * (1 - t_prop) * ta_source[byi_read_below_right++];
    ta_dest[byi_write + 1] = l_prop * t_prop * ta_source[byi_read++] + (1 - l_prop) * t_prop * ta_source[byi_read_right++] + l_prop * (1 - t_prop) * ta_source[byi_read_below++] + (1 - l_prop) * (1 - t_prop) * ta_source[byi_read_below_right++];
    ta_dest[byi_write + 2] = l_prop * t_prop * ta_source[byi_read++] + (1 - l_prop) * t_prop * ta_source[byi_read_right++] + l_prop * (1 - t_prop) * ta_source[byi_read_below++] + (1 - l_prop) * (1 - t_prop) * ta_source[byi_read_below_right++];
}
const read_3x2_weight_write_24bipp = (ta_source, bypr, byi_read, edge_distances_proportions_of_total, corner_weights_ltrb, ta_dest, dest_byi) => {
    const bypp = 3;
    let byi_tl = byi_read;
    let byi_tm = byi_tl + bypp, byi_tr = byi_tm + bypp;
    let byi_bl = byi_tm + bypr, byi_bm = byi_bl + bypp, byi_br = byi_bm + bypp;
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
const read_3x3_weight_write_24bipp = (ta_source, bypr, byi_read, edge_weights, corner_weights_ltrb, fpx_area_recip, ta_dest, dest_byi) => {
    const bypp = 3;
    let byi_tl = byi_read, byi_tm = byi_tl + bypp, byi_tr = byi_tm + bypp;
    let byi_ml = byi_tl + bypr, byi_mm = byi_ml + bypp, byi_mr = byi_mm + bypp;
    let byi_bl = byi_ml + bypr, byi_bm = byi_bl + bypp, byi_br = byi_bm + bypp;
    ta_dest[dest_byi] =     ta_source[byi_tl++] * corner_weights_ltrb[0] + ta_source[byi_tm++] * edge_weights[1] + ta_source[byi_tr++] * corner_weights_ltrb[1] +
                            ta_source[byi_ml++] * edge_weights[0] + ta_source[byi_mm++] * fpx_area_recip + ta_source[byi_mr++] * edge_weights[2] +
                            ta_source[byi_bl++] * corner_weights_ltrb[2] + ta_source[byi_bm++] * edge_weights[3] + ta_source[byi_br++] * corner_weights_ltrb[3]
    ta_dest[dest_byi + 1] = ta_source[byi_tl++] * corner_weights_ltrb[0] + ta_source[byi_tm++] * edge_weights[1] + ta_source[byi_tr++] * corner_weights_ltrb[1] +
                            ta_source[byi_ml++] * edge_weights[0] + ta_source[byi_mm++] * fpx_area_recip + ta_source[byi_mr++] * edge_weights[2] +
                            ta_source[byi_bl++] * corner_weights_ltrb[2] + ta_source[byi_bm++] * edge_weights[3] + ta_source[byi_br++] * corner_weights_ltrb[3]
    ta_dest[dest_byi + 2] = ta_source[byi_tl++] * corner_weights_ltrb[0] + ta_source[byi_tm++] * edge_weights[1] + ta_source[byi_tr++] * corner_weights_ltrb[1] +
                            ta_source[byi_ml++] * edge_weights[0] + ta_source[byi_mm++] * fpx_area_recip + ta_source[byi_mr++] * edge_weights[2] +
                            ta_source[byi_bl++] * corner_weights_ltrb[2] + ta_source[byi_bm++] * edge_weights[3] + ta_source[byi_br++] * corner_weights_ltrb[3]
}
const read_3x3_weight_write_24bipp$locals = (ta_source, bypr, byi_read, 
    edge_p_l, edge_p_t, edge_p_r, edge_p_b, 
    corner_p_tl, corner_p_tr, corner_p_bl, corner_p_br,
    fpx_area_recip, 
    ta_dest, dest_byi) => {
    const bypp = 3;
    let byi_tl = byi_read, byi_tm = byi_tl + bypp, byi_tr = byi_tm + bypp;
    let byi_ml = byi_tl + bypr, byi_mm = byi_ml + bypp, byi_mr = byi_mm + bypp;
    let byi_bl = byi_ml + bypr, byi_bm = byi_bl + bypp, byi_br = byi_bm + bypp;
    ta_dest[dest_byi] =     ta_source[byi_tl++] * corner_p_tl + ta_source[byi_tm++] * edge_p_t + ta_source[byi_tr++] * corner_p_tr +
                            ta_source[byi_ml++] * edge_p_l + ta_source[byi_mm++] * fpx_area_recip + ta_source[byi_mr++] * edge_p_r +
                            ta_source[byi_bl++] * corner_p_bl + ta_source[byi_bm++] * edge_p_b + ta_source[byi_br++] * corner_p_br
    ta_dest[dest_byi + 1] = ta_source[byi_tl++] * corner_p_tl + ta_source[byi_tm++] * edge_p_t + ta_source[byi_tr++] * corner_p_tr +
                            ta_source[byi_ml++] * edge_p_l + ta_source[byi_mm++] * fpx_area_recip + ta_source[byi_mr++] * edge_p_r +
                            ta_source[byi_bl++] * corner_p_bl + ta_source[byi_bm++] * edge_p_b + ta_source[byi_br++] * corner_p_br
    ta_dest[dest_byi + 2] = ta_source[byi_tl++] * corner_p_tl + ta_source[byi_tm++] * edge_p_t + ta_source[byi_tr++] * corner_p_tr +
                            ta_source[byi_ml++] * edge_p_l + ta_source[byi_mm++] * fpx_area_recip + ta_source[byi_mr++] * edge_p_r +
                            ta_source[byi_bl++] * corner_p_bl + ta_source[byi_bm++] * edge_p_b + ta_source[byi_br++] * corner_p_br
}
const read_gt3x3_weight_write_24bipp = (ta_source, bypr, byi_read, source_i_any_coverage_size, edge_distances_proportions_of_total, corner_weights_ltrb, fpx_area_recip, ta_dest, dest_byi) => {
    const byi_tl = byi_read;
    let r = 0, g = 0, b = 0;
    let x, y;
    const end_hmiddle = source_i_any_coverage_size[0] - 1, end_vmiddle = source_i_any_coverage_size[1] - 1;
    r += ta_source[byi_read++] * corner_weights_ltrb[0];
    g += ta_source[byi_read++] * corner_weights_ltrb[0];
    b += ta_source[byi_read++] * corner_weights_ltrb[0];
    for (x = 1; x < end_hmiddle; x++) {
        r += ta_source[byi_read++] * edge_distances_proportions_of_total[1];
        g += ta_source[byi_read++] * edge_distances_proportions_of_total[1];
        b += ta_source[byi_read++] * edge_distances_proportions_of_total[1];
    }
    r += ta_source[byi_read++] * corner_weights_ltrb[1];
    g += ta_source[byi_read++] * corner_weights_ltrb[1];
    b += ta_source[byi_read++] * corner_weights_ltrb[1];
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
    r += ta_source[byi_read++] * corner_weights_ltrb[2];
    g += ta_source[byi_read++] * corner_weights_ltrb[2];
    b += ta_source[byi_read++] * corner_weights_ltrb[2];
    for (x = 1; x < end_hmiddle; x++) {
        r += ta_source[byi_read++] * edge_distances_proportions_of_total[3];
        g += ta_source[byi_read++] * edge_distances_proportions_of_total[3];
        b += ta_source[byi_read++] * edge_distances_proportions_of_total[3];
    }
    r += ta_source[byi_read++] * corner_weights_ltrb[3];
    g += ta_source[byi_read++] * corner_weights_ltrb[3];
    b += ta_source[byi_read++] * corner_weights_ltrb[3];
    ta_dest[dest_byi] = Math.round(r);
    ta_dest[dest_byi + 1] = Math.round(g);
    ta_dest[dest_byi + 2] = Math.round(b);
}
const read_gt3x3_weight_write_24bipp$locals = (ta_source, bypr, byi_read, 
    any_coverage_w, any_coverage_h,
    edge_p_l, edge_p_t, edge_p_r, edge_p_b,
    corner_p_tl, corner_p_tr, corner_p_bl, corner_p_br,
    fpx_area_recip, 
    ta_dest, dest_byi) => {
    const byi_tl = byi_read;
    let r = 0, g = 0, b = 0;
    let x, y;
    const end_hmiddle = any_coverage_w - 1, end_vmiddle = any_coverage_h - 1;
    r += ta_source[byi_read++] * corner_p_tl;
    g += ta_source[byi_read++] * corner_p_tl;
    b += ta_source[byi_read++] * corner_p_tl;
    for (x = 1; x < end_hmiddle; x++) {
        r += ta_source[byi_read++] * edge_p_t;
        g += ta_source[byi_read++] * edge_p_t;
        b += ta_source[byi_read++] * edge_p_t;
    }
    r += ta_source[byi_read++] * corner_p_tr;
    g += ta_source[byi_read++] * corner_p_tr;
    b += ta_source[byi_read++] * corner_p_tr;
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
    r += ta_source[byi_read++] * corner_p_bl;
    g += ta_source[byi_read++] * corner_p_bl;
    b += ta_source[byi_read++] * corner_p_bl;
    for (x = 1; x < end_hmiddle; x++) {
        r += ta_source[byi_read++] * edge_p_b;
        g += ta_source[byi_read++] * edge_p_b;
        b += ta_source[byi_read++] * edge_p_b;
    }
    r += ta_source[byi_read++] * corner_p_br;
    g += ta_source[byi_read++] * corner_p_br;
    b += ta_source[byi_read++] * corner_p_br;
    ta_dest[dest_byi] = Math.round(r);
    ta_dest[dest_byi + 1] = Math.round(g);
    ta_dest[dest_byi + 2] = Math.round(b);
}
const __resize_ta_colorspace_24bipp$subpixel = (ta_source, source_colorspace, dest_size, ta_dest) => {
    const source_bypp = source_colorspace[2];
    const source_bypr = source_colorspace[3];
    const [f_px_w, f_px_h] = [source_colorspace[0] / dest_size[0], source_colorspace[1] / dest_size[1]];
    let f_source_x, f_source_r;
    let i_source_l, i_source_lr_crossover;
    let f_source_y, f_source_b;
    let i_source_t, i_source_tb_crossover;
    let i_dest_x, i_dest_y;
    const ta_left_proportions = new Float32Array(dest_size[0]);
    const ta_top_proportions = new Float32Array(dest_size[1]);
    const ta_source_x = new Int16Array(dest_size[0]);
    const ta_source_y = new Int16Array(dest_size[1]);
    const ta_source_x_byi_component = new Int32Array(dest_size[0]);
    const ta_source_y_byi_component = new Int32Array(dest_size[1]);
    for (i_dest_x = 0; i_dest_x < dest_size[0]; i_dest_x++) {
        f_source_x = i_dest_x * f_px_w;
        f_source_r = f_source_x + f_px_w;
        i_source_l = Math.floor(f_source_x);
        i_source_lr_crossover = i_source_l + 1;
        ta_source_x[i_dest_x] = i_source_l;
        ta_source_x_byi_component[i_dest_x] = i_source_l * source_bypp;
        if (f_source_r < i_source_lr_crossover || i_source_l === f_source_x) {
            ta_left_proportions[i_dest_x] = 1;
        } else {
            ta_left_proportions[i_dest_x] = (i_source_lr_crossover - f_source_x) / f_px_w;
        }
    }
    for (i_dest_y = 0; i_dest_y < dest_size[1]; i_dest_y++) {
        f_source_y = i_dest_y * f_px_h;
        f_source_b = f_source_y + f_px_h;
        i_source_t = Math.floor(f_source_y);
        i_source_tb_crossover = i_source_t + 1;
        ta_source_y[i_dest_y] = i_source_t;
        ta_source_y_byi_component[i_dest_y] = i_source_t * source_bypr;
        if (f_source_b < i_source_tb_crossover || i_source_t === f_source_y) {
            ta_top_proportions[i_dest_y] = 1;
        } else {
            ta_top_proportions[i_dest_y] = (i_source_tb_crossover - f_source_y) / f_px_h;
        }
    }
    const ta_ltrb_edge_props = new Float32Array(4);
    let byi_source;
    let byi_write = 0;
    const ta_ltrb_corner_props = new Float32Array(4);
    for (i_dest_y = 0; i_dest_y < dest_size[1]; i_dest_y++) {
        ta_ltrb_edge_props[1] = ta_top_proportions[i_dest_y];
        ta_ltrb_edge_props[3] = 1 - ta_top_proportions[i_dest_y];
        for (i_dest_x = 0; i_dest_x < dest_size[0]; i_dest_x++) {
            ta_ltrb_edge_props[0] = ta_left_proportions[i_dest_x];
            ta_ltrb_edge_props[2] = 1 - ta_left_proportions[i_dest_x];
            byi_source = ta_source_x_byi_component[i_dest_x] + ta_source_y_byi_component[i_dest_y];
            if (ta_ltrb_edge_props[0] === 1) {
                if (ta_ltrb_edge_props[1] === 1) {
                    copy_px_24bipp(ta_source, byi_source, ta_dest, byi_write);
                } else {
                    read_1x2_weight_write_24bipp(ta_source, source_bypr, byi_source, ta_dest, byi_write, ta_ltrb_edge_props[1], ta_ltrb_edge_props[3]);
                }
            } else {
                if (ta_ltrb_edge_props[1] === 1) {
                    read_2x1_weight_write_24bipp(ta_source, byi_source, ta_dest, byi_write, ta_ltrb_edge_props[0], ta_ltrb_edge_props[2]);
                } else {
                    ta_ltrb_corner_props[0] = ta_ltrb_edge_props[0] * ta_ltrb_edge_props[1];
                    ta_ltrb_corner_props[1] = ta_ltrb_edge_props[2] * ta_ltrb_edge_props[1];
                    ta_ltrb_corner_props[2] = ta_ltrb_edge_props[0] * ta_ltrb_edge_props[3];
                    ta_ltrb_corner_props[3] = ta_ltrb_edge_props[2] * ta_ltrb_edge_props[3];
                    read_2x2_weight_write_24bipp(ta_source, source_bypr, byi_source, ta_dest, byi_write, ta_ltrb_corner_props);
                }
            }
            byi_write += 3;
        }
    }
}
const resize_ta_colorspace_24bipp$subpixel$inline = (ta_source, source_colorspace, dest_size, ta_dest) => {
    const source_bypp = source_colorspace[2];
    const source_bypr = source_colorspace[3];
    const [f_px_w, f_px_h] = [source_colorspace[0] / dest_size[0], source_colorspace[1] / dest_size[1]];
    let f_source_x, f_source_r;
    let i_source_l, i_source_lr_crossover;
    let f_source_y, f_source_b;
    let i_source_t, i_source_tb_crossover;
    let i_dest_x, i_dest_y;
    const ta_left_proportions = new Float32Array(dest_size[0]);
    const ta_top_proportions = new Float32Array(dest_size[1]);
    const ta_source_x_byi_component = new Int32Array(dest_size[0]);
    for (i_dest_x = 0; i_dest_x < dest_size[0]; i_dest_x++) {
        f_source_x = i_dest_x * f_px_w;
        f_source_r = f_source_x + f_px_w;
        i_source_l = Math.floor(f_source_x);
        i_source_lr_crossover = i_source_l + 1;
        ta_source_x_byi_component[i_dest_x] = i_source_l * source_bypp;
        if (f_source_r < i_source_lr_crossover || i_source_l === f_source_x) {
            ta_left_proportions[i_dest_x] = 1;
        } else {
            ta_left_proportions[i_dest_x] = (i_source_lr_crossover - f_source_x) / f_px_w;
        }
    }
    let byi_source;
    let byi_write = 0;
    let byi_read_below, byi_read_right, byi_read_below_right;
    let edge_l, edge_t, edge_r;
    let corner_tl, corner_tr, corner_bl, corner_br;
    let y_byi;
    for (i_dest_y = 0; i_dest_y < dest_size[1]; i_dest_y++) {
        f_source_y = i_dest_y * f_px_h;
        f_source_b = f_source_y + f_px_h;
        i_source_t = Math.floor(f_source_y);
        i_source_tb_crossover = i_source_t + 1;
        y_byi = i_source_t * source_bypr;
        if (f_source_b < i_source_tb_crossover || i_source_t === f_source_y) {
            ta_top_proportions[i_dest_y] = 1;
        } else {
            ta_top_proportions[i_dest_y] = (i_source_tb_crossover - f_source_y) / f_px_h;
        }
        edge_t = ta_top_proportions[i_dest_y];
        
        if (edge_t === 1) {

            for (i_dest_x = 0; i_dest_x < dest_size[0]; i_dest_x++) {
                edge_l = ta_left_proportions[i_dest_x];
                edge_r = 1 - ta_left_proportions[i_dest_x];
                byi_source = ta_source_x_byi_component[i_dest_x] + y_byi;
                if (edge_l === 1) {
                    ta_dest[byi_write++] = ta_source[byi_source++];
                    ta_dest[byi_write++] = ta_source[byi_source++];
                    ta_dest[byi_write++] = ta_source[byi_source++];
                } else {
                    byi_read_right = byi_source + 3;
                    ta_dest[byi_write++] = edge_l * ta_source[byi_source++] + edge_r * ta_source[byi_read_right++];
                    ta_dest[byi_write++] = edge_l * ta_source[byi_source++] + edge_r * ta_source[byi_read_right++];
                    ta_dest[byi_write++] = edge_l * ta_source[byi_source++] + edge_r * ta_source[byi_read_right++];
                }
            }



        } else {
            const edge_b = 1 - ta_top_proportions[i_dest_y];
            for (i_dest_x = 0; i_dest_x < dest_size[0]; i_dest_x++) {
                edge_l = ta_left_proportions[i_dest_x];
                edge_r = 1 - ta_left_proportions[i_dest_x];
                byi_source = ta_source_x_byi_component[i_dest_x] + y_byi;
                if (edge_l === 1) {
                    byi_read_below = byi_source + source_bypr;
                    ta_dest[byi_write++] = edge_t * ta_source[byi_source++] + edge_b * ta_source[byi_read_below++];
                    ta_dest[byi_write++] = edge_t * ta_source[byi_source++] + edge_b * ta_source[byi_read_below++];
                    ta_dest[byi_write++] = edge_t * ta_source[byi_source++] + edge_b * ta_source[byi_read_below++];
                } else {
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
                }
            }
        }
        /*
        for (i_dest_x = 0; i_dest_x < dest_size[0]; i_dest_x++) {
            edge_l = ta_left_proportions[i_dest_x];
            edge_r = 1 - ta_left_proportions[i_dest_x];
            byi_source = ta_source_x_byi_component[i_dest_x] + y_byi;
            if (edge_l === 1) {
                if (edge_t === 1) {
                    ta_dest[byi_write++] = ta_source[byi_source++];
                    ta_dest[byi_write++] = ta_source[byi_source++];
                    ta_dest[byi_write++] = ta_source[byi_source++];
                } else {
                    byi_read_below = byi_source + source_bypr;
                    ta_dest[byi_write++] = edge_t * ta_source[byi_source++] + edge_b * ta_source[byi_read_below++];
                    ta_dest[byi_write++] = edge_t * ta_source[byi_source++] + edge_b * ta_source[byi_read_below++];
                    ta_dest[byi_write++] = edge_t * ta_source[byi_source++] + edge_b * ta_source[byi_read_below++];
                }
            } else {
                if (edge_t === 1) {
                    byi_read_right = byi_source + 3;
                    ta_dest[byi_write++] = edge_l * ta_source[byi_source++] + edge_r * ta_source[byi_read_right++];
                    ta_dest[byi_write++] = edge_l * ta_source[byi_source++] + edge_r * ta_source[byi_read_right++];
                    ta_dest[byi_write++] = edge_l * ta_source[byi_source++] + edge_r * ta_source[byi_read_right++];
                } else {
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
                }
            }
        }
            */
    }
}
const resize_ta_colorspace_24bipp$subpixel = resize_ta_colorspace_24bipp$subpixel$inline;
let __attempt__resize_ta_colorspace_24bipp$superpixel = (ta_source, source_colorspace, dest_size, ta_dest) => {
    console.log('resize_ta_colorspace_24bipp$superpixel');
    const source_bypp = source_colorspace[2];
    const source_bypr = source_colorspace[3];
    const [f_px_w, f_px_h] = [source_colorspace[0] / dest_size[0], source_colorspace[1] / dest_size[1]];
    let f_source_x, f_source_r;
    let i_source_l, i_source_r;
    let f_source_y, f_source_b;
    let i_source_t, i_source_b;
    let i_dest_x, i_dest_y;
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
    for (i_dest_x = 0; i_dest_x < dest_size[0]; i_dest_x++) {
        f_source_x = i_dest_x * f_px_w;
        f_source_r = (i_dest_x + 1) * f_px_w;
        i_source_l = Math.floor(f_source_x);
        i_source_r = Math.ceil(f_source_r);
        ta_source_x[i_dest_x] = i_source_l;
        ta_source_x_byi_component[i_dest_x] = i_source_l * source_bypp;
        ta_source_x_any_coverage_w[i_dest_x] = i_source_r - i_source_l;
        left_edge_dist = f_source_x - i_source_l;
        if (left_edge_dist === 0) left_edge_dist = 1;
        right_edge_dist = i_source_r - f_source_r;
        if (right_edge_dist === 0) right_edge_dist = 1;
        ta_left_edge_segment_proportions[i_dest_x] = (left_edge_dist) * fpx_area_recip;
        ta_right_edge_segment_proportions[i_dest_x] = (right_edge_dist) * fpx_area_recip;
    }
    for (i_dest_y = 0; i_dest_y < dest_size[1]; i_dest_y++) {
        f_source_y = i_dest_y * f_px_h;
        f_source_b = (i_dest_y + 1) * f_px_h;
        i_source_t = Math.floor(f_source_y);
        i_source_b = Math.ceil(f_source_b);
        ta_source_y[i_dest_y] = i_source_t;
        ta_source_y_byi_component[i_dest_y] = i_source_t * source_bypr;
        ta_source_y_any_coverage_h[i_dest_y] = i_source_b - i_source_t;
        top_edge_dist = f_source_y - i_source_t;
        if (top_edge_dist === 0) top_edge_dist = 1;
        bottom_edge_dist = i_source_b - f_source_b;
        if (bottom_edge_dist === 0) bottom_edge_dist = 1;
        ta_top_edge_segment_proportions[i_dest_y] = (top_edge_dist) * fpx_area_recip;
        ta_bottom_edge_segment_proportions[i_dest_y] = (bottom_edge_dist) * fpx_area_recip;
    }
    const ta_ltrb_edge_props = new Float32Array(4);
    let byi_source;
    let byi_write = 0;
    const ta_ltrb_corner_props = new Float32Array(4);
    for (i_dest_y = 0; i_dest_y < dest_size[1]; i_dest_y++) {
        ta_ltrb_edge_props[1] = ta_top_edge_segment_proportions[i_dest_y];
        ta_ltrb_edge_props[3] = ta_bottom_edge_segment_proportions[i_dest_y];
        source_i_any_coverage_size[1] = ta_source_y_any_coverage_h[i_dest_y];
        for (i_dest_x = 0; i_dest_x < dest_size[0]; i_dest_x++) {
            source_i_any_coverage_size[0] = ta_source_x_any_coverage_w[i_dest_x];
            byi_source = ta_source_x_byi_component[i_dest_x] + ta_source_y_byi_component[i_dest_y];
            ta_ltrb_edge_props[0] = ta_left_edge_segment_proportions[i_dest_x];
            ta_ltrb_edge_props[2] = ta_right_edge_segment_proportions[i_dest_x];
            ta_ltrb_corner_props[0] = ta_ltrb_edge_props[0] * ta_ltrb_edge_props[1];
            ta_ltrb_corner_props[1] = ta_ltrb_edge_props[2] * ta_ltrb_edge_props[1];
            ta_ltrb_corner_props[2] = ta_ltrb_edge_props[0] * ta_ltrb_edge_props[3];
            ta_ltrb_corner_props[3] = ta_ltrb_edge_props[2] * ta_ltrb_edge_props[3];
            if (source_i_any_coverage_size[0] === 2) {
                if (source_i_any_coverage_size[1] === 2) {
                    read_2x2_weight_write_24bipp(ta_source, source_bypr, byi_source, ta_dest, byi_write, ta_ltrb_corner_props);
                } else if (source_i_any_coverage_size[1] === 3) {
                    read_2x3_weight_write_24bipp(ta_source, source_bypr, byi_source, ta_dest, byi_write, ta_ltrb_edge_props[1], ta_ltrb_edge_props[3]);
                } else {
                    read_gt3x3_weight_write_24bipp(ta_source, source_bypr, byi_source, source_i_any_coverage_size, ta_ltrb_edge_props, ta_ltrb_corner_props, fpx_area_recip, ta_dest, byi_write);
                }
            } else if (source_i_any_coverage_size[0] === 3) {
                if (source_i_any_coverage_size[1] === 2) {
                    read_3x2_weight_write_24bipp(ta_source, source_bypr, byi_source, ta_ltrb_edge_props, ta_ltrb_corner_props, ta_dest, byi_write);
                } else if (source_i_any_coverage_size[1] === 3) {
                    read_3x3_weight_write_24bipp(ta_source, source_bypr, byi_source, ta_ltrb_edge_props, ta_ltrb_corner_props, ta_dest, byi_write);
                } else {
                    read_gt3x3_weight_write_24bipp(ta_source, source_bypr, byi_source, source_i_any_coverage_size, ta_ltrb_edge_props, ta_ltrb_corner_props, fpx_area_recip, ta_dest, byi_write);
                }
            } else {
                read_gt3x3_weight_write_24bipp(ta_source, source_bypr, byi_source, source_i_any_coverage_size, ta_ltrb_edge_props, ta_ltrb_corner_props, fpx_area_recip, ta_dest, byi_write);
            }
            byi_write += 3;
        }
    }
}
const resize_ta_colorspace_24bipp$subpixel$ta4byis = (ta_source, source_colorspace, dest_size, ta_dest) => {
    const source_bypp = source_colorspace[2];
    const source_bypr = source_colorspace[3];
    const dest_to_source_ratio = new Float32Array([source_colorspace[0] / dest_size[0], source_colorspace[1] / dest_size[1]]);
    const [f_px_w, f_px_h] = [source_colorspace[0] / dest_size[0], source_colorspace[1] / dest_size[1]];
    let f_source_x, f_source_r;
    let i_source_l, i_source_lr_crossover;
    let f_source_y, f_source_b;
    let i_source_t, i_source_tb_crossover;
    let i_dest_x, i_dest_y;
    const ta_left_proportions = new Float32Array(dest_size[0]);
    const ta_top_proportions = new Float32Array(dest_size[1]);
    const ta_source_x = new Int16Array(dest_size[0]);
    const ta_source_y = new Int16Array(dest_size[1]);
    const ta_source_x_byi_component = new Int32Array(dest_size[0]);
    const ta_source_y_byi_component = new Int32Array(dest_size[1]);
    for (i_dest_x = 0; i_dest_x < dest_size[0]; i_dest_x++) {
        f_source_x = i_dest_x * f_px_w;
        f_source_r = f_source_x + f_px_w;
        i_source_l = Math.floor(f_source_x);
        i_source_lr_crossover = i_source_l + 1;
        ta_source_x[i_dest_x] = i_source_l;
        ta_source_x_byi_component[i_dest_x] = i_source_l * source_bypp;
        if (f_source_r < i_source_lr_crossover || i_source_l === f_source_x) {
            ta_left_proportions[i_dest_x] = 1;
        } else {
            ta_left_proportions[i_dest_x] = (i_source_lr_crossover - f_source_x) / f_px_w;
        }
    }
    for (i_dest_y = 0; i_dest_y < dest_size[0]; i_dest_y++) {
        f_source_y = i_dest_y * f_px_h;
        f_source_b = f_source_y + f_px_h;
        i_source_t = Math.floor(f_source_y);
        i_source_tb_crossover = i_source_t + 1;
        ta_source_y[i_dest_y] = i_source_t;
        ta_source_y_byi_component[i_dest_y] = i_source_t * source_bypr;
        if (f_source_b < i_source_tb_crossover || i_source_t === f_source_y) {
            ta_top_proportions[i_dest_y] = 1;
        } else {
            ta_top_proportions[i_dest_y] = (i_source_tb_crossover - f_source_y) / f_px_h;
        }
    }
    const ta_ltrb_edge_props = new Float32Array(4);
    let byi_source;
    let byi_write = 0;
    const ta_tl_weight_props = new Float32Array(2);
    const ta_byi_reads = new Int32Array(4);
    const ta_ltrb_corner_props = new Float32Array(4);
    for (i_dest_y = 0; i_dest_y < dest_size[1]; i_dest_y++) {
        ta_ltrb_edge_props[1] = ta_top_proportions[i_dest_y];
        ta_ltrb_edge_props[3] = 1 - ta_top_proportions[i_dest_y];
        for (i_dest_x = 0; i_dest_x < dest_size[0]; i_dest_x++) {
            ta_ltrb_edge_props[0] = ta_left_proportions[i_dest_x];
            ta_ltrb_edge_props[2] = 1 - ta_left_proportions[i_dest_x];
            ta_byi_reads[0] = ta_source_x_byi_component[i_dest_x] + ta_source_y_byi_component[i_dest_y];
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
                    ta_byi_reads[1] = ta_byi_reads[0] + source_bypp;
                    ta_byi_reads[2] = ta_byi_reads[0] + source_bypr;
                    ta_byi_reads[3] = ta_byi_reads[2] + source_bypp;
                    ta_ltrb_corner_props[0] = ta_ltrb_edge_props[0] * ta_ltrb_edge_props[1];
                    ta_ltrb_corner_props[1] = ta_ltrb_edge_props[2] * ta_ltrb_edge_props[1];
                    ta_ltrb_corner_props[2] = ta_ltrb_edge_props[0] * ta_ltrb_edge_props[3];
                    ta_ltrb_corner_props[3] = ta_ltrb_edge_props[2] * ta_ltrb_edge_props[3];
                    read_2x2_weight_write_24bipp$ta4byis(ta_source, ta_byi_reads, ta_dest, byi_write, ta_ltrb_corner_props);
                }
            }
            byi_write += 3;
        }
    }
}
const __resize_ta_colorspace_24bipp$superpixel = (ta_source, source_colorspace, dest_size, opt_ta_dest) => {
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
const __resize_ta_colorspace_24bipp$superpixel$inline = (ta_source, source_colorspace, dest_size, opt_ta_dest) => {
    const dest_to_source_ratio = new Float32Array([source_colorspace[0] / dest_size[0], source_colorspace[1] / dest_size[1]]);
    const fpx_area_recip = 1 / (dest_to_source_ratio[0] * dest_to_source_ratio[1]);
    const source_edge_distances = new Float32Array(4);
    const edge_distances_proportions_of_total = new Float32Array(4);
    const corner_areas_proportions_of_total = new Float32Array(4);
    const fpx_area = dest_to_source_ratio[0] * dest_to_source_ratio[1];
    const source_bypp = source_colorspace[2];
    const source_bypr = source_colorspace[3];
    const source_bipp = source_colorspace[4];
    const dest_colorspace = new Int32Array([dest_size[0], dest_size[1], source_bypp, source_bypp * dest_size[0], source_bipp, source_bipp * dest_size[0]]);
    const source_fbounds = new Float32Array(4);
    const source_ibounds = new Int16Array(4);
    const source_i_any_coverage_size = new Int16Array(2);
    const source_total_coverage_ibounds = new Int16Array(4);
    let byi_read;
    let dest_byi = 0;
    const width = dest_colorspace[0], height = dest_colorspace[1];
    let x, y;
    for (y = 0; y < height; y++) {
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
            source_ibounds[0] = source_fbounds[0];
            source_ibounds[2] = Math.ceil(source_fbounds[2]);
            source_i_any_coverage_size[0] = source_ibounds[2] - source_ibounds[0];
            byi_read = source_ibounds[0] * source_bypp + source_ibounds[1] * source_bypr;
            source_total_coverage_ibounds[0] = Math.ceil(source_fbounds[0]); 
            source_total_coverage_ibounds[2] = Math.floor(source_fbounds[2]);
            source_edge_distances[0] = source_total_coverage_ibounds[0] - source_fbounds[0];
            source_edge_distances[2] = source_fbounds[2] - source_total_coverage_ibounds[2];
            if (source_edge_distances[0] === 0) source_edge_distances[0] = 1;
            if (source_edge_distances[2] === 0) source_edge_distances[2] = 1;
            corner_areas_proportions_of_total[0] = source_edge_distances[0] * source_edge_distances[1] / fpx_area;
            corner_areas_proportions_of_total[1] = source_edge_distances[2] * source_edge_distances[1] / fpx_area;
            corner_areas_proportions_of_total[2] = source_edge_distances[0] * source_edge_distances[3] / fpx_area;
            corner_areas_proportions_of_total[3] = source_edge_distances[2] * source_edge_distances[3] / fpx_area;
            if (source_i_any_coverage_size[0] > 3 ||  source_i_any_coverage_size[1] > 3) {
                edge_distances_proportions_of_total[0] = source_edge_distances[0] / fpx_area;
                edge_distances_proportions_of_total[2] = source_edge_distances[2] / fpx_area;
                read_gt3x3_weight_write_24bipp(ta_source, source_bypr, byi_read, source_i_any_coverage_size, edge_distances_proportions_of_total, corner_areas_proportions_of_total, fpx_area_recip, opt_ta_dest, dest_byi);
            } else {
                if (source_i_any_coverage_size[0] === 2 && source_i_any_coverage_size[1] === 2) {
                    read_2x2_weight_write_24bipp(ta_source, source_bypr, byi_read, opt_ta_dest, dest_byi, corner_areas_proportions_of_total);
                } else {
                    edge_distances_proportions_of_total[0] = source_edge_distances[0] / fpx_area;
                    edge_distances_proportions_of_total[2] = source_edge_distances[2] / fpx_area;
                    if (source_i_any_coverage_size[0] === 2 && source_i_any_coverage_size[1] === 3) {
                        read_2x3_weight_write_24bipp(ta_source, source_bypr, byi_read, edge_distances_proportions_of_total, corner_areas_proportions_of_total, opt_ta_dest, dest_byi);
                    } else if (source_i_any_coverage_size[0] === 3 && source_i_any_coverage_size[1] === 2) {
                        read_3x2_weight_write_24bipp(ta_source, source_bypr, byi_read, edge_distances_proportions_of_total, corner_areas_proportions_of_total, opt_ta_dest, dest_byi);
                    } else if (source_i_any_coverage_size[0] === 3 && source_i_any_coverage_size[1] === 3) {
                        read_3x3_weight_write_24bipp(ta_source, source_bypr, byi_read, edge_distances_proportions_of_total, corner_areas_proportions_of_total, fpx_area_recip, opt_ta_dest, dest_byi);
                    } else {
                        console.trace();
                        throw 'stop';
                    }
                }
            }
            dest_byi += source_bypp;
        }
    }
}
const resize_ta_colorspace_24bipp$superpixel$inline$locals = (ta_source, source_colorspace, dest_size, opt_ta_dest) => {
    const dest_to_source_ratio = new Float32Array([source_colorspace[0] / dest_size[0], source_colorspace[1] / dest_size[1]]);
    const fpx_area_recip = 1 / (dest_to_source_ratio[0] * dest_to_source_ratio[1]);
    const [fpxw, fpxh] = [source_colorspace[0] / dest_size[0], source_colorspace[1] / dest_size[1]];
    let edge_l, edge_t, edge_r, edge_b;
    let edge_p_l, edge_p_t, edge_p_r, edge_p_b;
    let corner_p_tl, corner_p_tr, corner_p_bl, corner_p_br;
    const fpx_area = dest_to_source_ratio[0] * dest_to_source_ratio[1];
    const source_bypp = source_colorspace[2];
    const source_bypr = source_colorspace[3];
    const source_bipp = source_colorspace[4];
    const dest_colorspace = new Int32Array([dest_size[0], dest_size[1], source_bypp, source_bypp * dest_size[0], source_bipp, source_bipp * dest_size[0]]);
    let fbounds_l, fbounds_t, fbounds_r, fbounds_b;
    let ibounds_l, ibounds_t, ibounds_r, ibounds_b;
    let any_coverage_w, any_coverage_h;
    let total_coverage_l, total_coverage_t, total_coverage_r, total_coverage_b;
    let byi_read;
    let dest_byi = 0;
    const width = dest_colorspace[0], height = dest_colorspace[1];
    let x, y;
    for (y = 0; y < height; y++) {
        fbounds_t = y * fpxh;
        fbounds_b = fbounds_t + fpxh;
        ibounds_t = Math.floor(fbounds_t);
        ibounds_b = Math.ceil(fbounds_b);
        any_coverage_h = ibounds_b - ibounds_t;
        total_coverage_t = Math.ceil(fbounds_t);
        total_coverage_b = Math.floor(fbounds_b);
        edge_t = total_coverage_t - fbounds_t;
        edge_b = fbounds_b - total_coverage_b;
        if (edge_t === 0) edge_t = 1;
        if (edge_b === 0) edge_b = 1;
        edge_p_t = edge_t / fpx_area;
        edge_p_b = edge_b / fpx_area;
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
                edge_p_r = edge_r / fpx_area;
                read_gt3x3_weight_write_24bipp$locals(ta_source, source_bypr, byi_read,
                    any_coverage_w, any_coverage_h,
                    edge_p_l, edge_p_t, edge_p_r, edge_p_b,
                    corner_p_tl, corner_p_tr, corner_p_bl, corner_p_br,
                    fpx_area_recip,
                    opt_ta_dest, dest_byi
                    )
            } else {
                if (any_coverage_w === 2 && any_coverage_h === 2) {
                    read_2x2_weight_write_24bipp$locals(ta_source, source_bypr, byi_read, 
                        corner_p_tl, corner_p_tr, corner_p_bl, corner_p_br,
                        opt_ta_dest, dest_byi);
                } else {
                    edge_p_l = edge_l / fpx_area;
                    edge_p_r = edge_r / fpx_area;
                    if (any_coverage_w === 2 && any_coverage_h === 3) {
                        read_2x3_weight_write_24bipp$locals(ta_source, source_bypr, byi_read,
                            edge_p_l, edge_p_t, edge_p_r, edge_p_b,
                            corner_p_tl, corner_p_tr, corner_p_bl, corner_p_br,
                            opt_ta_dest, dest_byi);
                    } else if (any_coverage_w === 3 && any_coverage_h === 2) {
                        read_3x2_weight_write_24bipp$locals(ta_source, source_bypr, byi_read,
                            edge_p_l, edge_p_t, edge_p_r, edge_p_b,
                            corner_p_tl, corner_p_tr, corner_p_bl, corner_p_br,
                            opt_ta_dest, dest_byi);
                    } else if (any_coverage_w === 3 && any_coverage_h === 3) {
                        read_3x3_weight_write_24bipp$locals(ta_source, source_bypr, byi_read,
                            edge_p_l, edge_p_t, edge_p_r, edge_p_b,
                            corner_p_tl, corner_p_tr, corner_p_bl, corner_p_br,
                            fpx_area_recip,
                            opt_ta_dest, dest_byi);
                    } else {
                        console.trace();
                        throw 'stop';
                    }
                }
            }
            dest_byi += source_bypp;
        }
    }
}
const resize_ta_colorspace_24bipp$superpixel$inline$locals$inline = (ta_source, source_colorspace, dest_size, opt_ta_dest) => {
    const ta_dest = opt_ta_dest;
    const dest_to_source_ratio = new Float32Array([source_colorspace[0] / dest_size[0], source_colorspace[1] / dest_size[1]]);
    const fpx_area_recip = 1 / (dest_to_source_ratio[0] * dest_to_source_ratio[1]);
    const [fpxw, fpxh] = [source_colorspace[0] / dest_size[0], source_colorspace[1] / dest_size[1]];
    let edge_l, edge_t, edge_r, edge_b;
    let edge_p_l, edge_p_t, edge_p_r, edge_p_b;
    let corner_p_tl, corner_p_tr, corner_p_bl, corner_p_br;
    const fpx_area = dest_to_source_ratio[0] * dest_to_source_ratio[1];
    const source_bypp = source_colorspace[2];
    const source_bypr = source_colorspace[3];
    const source_bipp = source_colorspace[4];
    const dest_colorspace = new Int32Array([dest_size[0], dest_size[1], source_bypp, source_bypp * dest_size[0], source_bipp, source_bipp * dest_size[0]]);
    let fbounds_l, fbounds_t, fbounds_r, fbounds_b;
    let ibounds_l, ibounds_t, ibounds_r, ibounds_b;
    let any_coverage_w, any_coverage_h;
    let total_coverage_l, total_coverage_t, total_coverage_r, total_coverage_b;
    let byi_read;
    let dest_byi = 0;
    const width = dest_colorspace[0], height = dest_colorspace[1];
    let x, y;
    let r = 0, g = 0, b = 0;
    let x_inner, y_inner;
    let byi_read_right, byi_read_below, byi_read_below_right;
    let byi_tl, byi_tm, byi_tr;
    let byi_ml, byi_mm, byi_mr;
    let byi_bl, byi_bm, byi_br;
    let end_hmiddle, end_vmiddle;
    for (y = 0; y < height; y++) {
        fbounds_t = y * fpxh;
        fbounds_b = fbounds_t + fpxh;
        ibounds_t = Math.floor(fbounds_t);
        ibounds_b = Math.ceil(fbounds_b);
        any_coverage_h = ibounds_b - ibounds_t;
        total_coverage_t = Math.ceil(fbounds_t);
        total_coverage_b = Math.floor(fbounds_b);
        edge_t = total_coverage_t - fbounds_t;
        edge_b = fbounds_b - total_coverage_b;
        if (edge_t === 0) edge_t = 1;
        if (edge_b === 0) edge_b = 1;
        edge_p_t = edge_t / fpx_area;
        edge_p_b = edge_b / fpx_area;
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
                edge_p_r = edge_r / fpx_area;
                byi_tl = byi_read;
                end_hmiddle = any_coverage_w - 1; end_vmiddle = any_coverage_h - 1;
                r = g = b = 0;
                r += ta_source[byi_read++] * corner_p_tl;
                g += ta_source[byi_read++] * corner_p_tl;
                b += ta_source[byi_read++] * corner_p_tl;
                for (x_inner = 1; x_inner < end_hmiddle; x_inner++) {
                    r += ta_source[byi_read++] * edge_p_t;
                    g += ta_source[byi_read++] * edge_p_t;
                    b += ta_source[byi_read++] * edge_p_t;
                }
                r += ta_source[byi_read++] * corner_p_tr;
                g += ta_source[byi_read++] * corner_p_tr;
                b += ta_source[byi_read++] * corner_p_tr;
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
                r += ta_source[byi_read++] * corner_p_bl;
                g += ta_source[byi_read++] * corner_p_bl;
                b += ta_source[byi_read++] * corner_p_bl;
                for (x_inner = 1; x_inner < end_hmiddle; x_inner++) {
                    r += ta_source[byi_read++] * edge_p_b;
                    g += ta_source[byi_read++] * edge_p_b;
                    b += ta_source[byi_read++] * edge_p_b;
                }
                r += ta_source[byi_read++] * corner_p_br;
                g += ta_source[byi_read++] * corner_p_br;
                b += ta_source[byi_read++] * corner_p_br;
                ta_dest[dest_byi] = Math.round(r);
                ta_dest[dest_byi + 1] = Math.round(g);
                ta_dest[dest_byi + 2] = Math.round(b);
            } else {
                if (any_coverage_w === 2 && any_coverage_h === 2) {
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
                    } else if (any_coverage_w === 3 && any_coverage_h === 2) {
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
                        byi_tl = byi_read; byi_tm = byi_tl + source_bypp; byi_tr = byi_tm + source_bypp;
                        byi_ml = byi_tl + source_bypr; byi_mm = byi_ml + source_bypp; byi_mr = byi_mm + source_bypp;
                        byi_bl = byi_ml + source_bypr; byi_bm = byi_bl + source_bypp; byi_br = byi_bm + source_bypp;
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
                    }
                }
            }
            dest_byi += source_bypp;
        }
    }
}
const resize_ta_colorspace_24bipp$superpixel = resize_ta_colorspace_24bipp$superpixel$inline$locals$inline;
const resize_ta_colorspace_24bipp$general = (ta_source, source_colorspace, dest_size, opt_ta_dest) => {
    const dest_to_source_ratio = new Float32Array([source_colorspace[0] / dest_size[0], source_colorspace[1] / dest_size[1]]);
    const [width, height, bypp, bypr, bipp, bipr] = source_colorspace;
    const fpx_area_recip = 1 / (dest_to_source_ratio[0] * dest_to_source_ratio[1]);
    each_source_dest_pixels_resized_limited_further_info(source_colorspace, dest_size, (dest_byi, source_i_any_coverage_size, edge_distances_proportions_of_total, corner_areas_proportions_of_total, byi_read) => {
        if (source_i_any_coverage_size[0] === 1) {
            if (source_i_any_coverage_size[1] === 1) {
                copy_px_24bipp(ta_source, byi_read, opt_ta_dest, dest_byi);
            } else if (source_i_any_coverage_size[1] === 2) {
                read_1x2_weight_write_24bipp(ta_source, bypr, byi_read, opt_ta_dest, dest_byi, edge_distances_proportions_of_total[1], edge_distances_proportions_of_total[3]);
            } else {
                console.log('source_i_any_coverage_size', source_i_any_coverage_size);
                console.trace();
                throw 'NYI';
            }
        } else if (source_i_any_coverage_size[0] === 2) {
            if (source_i_any_coverage_size[1] === 1) {
                read_2x1_weight_write_24bipp(ta_source, byi_read, opt_ta_dest, dest_byi, edge_distances_proportions_of_total[0], edge_distances_proportions_of_total[2]);
            } else if (source_i_any_coverage_size[1] === 2) {
                read_2x2_weight_write_24bipp(ta_source, bypr, byi_read, opt_ta_dest, dest_byi, corner_areas_proportions_of_total);
            } else {
                read_2x3_weight_write_24bipp(ta_source, bypr, byi_read, edge_distances_proportions_of_total, corner_areas_proportions_of_total, opt_ta_dest, dest_byi);
            }
        } else if (source_i_any_coverage_size[0] === 3) {
            if (source_i_any_coverage_size[1] === 1) {
                console.log('source_i_any_coverage_size', source_i_any_coverage_size);
                console.trace();
                throw 'NYI';
            } else if (source_i_any_coverage_size[1] === 2) {
                read_3x2_weight_write_24bipp(ta_source, bypr, byi_read, edge_distances_proportions_of_total, corner_areas_proportions_of_total, opt_ta_dest, dest_byi);
            } else if (source_i_any_coverage_size[1] === 3) {
                read_3x3_weight_write_24bipp(ta_source, bypr, byi_read, edge_distances_proportions_of_total, corner_areas_proportions_of_total, fpx_area_recip, opt_ta_dest, dest_byi);
            } else {
                read_gt3x3_weight_write_24bipp(ta_source, bypr, byi_read, source_i_any_coverage_size, edge_distances_proportions_of_total, corner_areas_proportions_of_total, fpx_area_recip, opt_ta_dest, dest_byi);
            }
        } else {
            read_gt3x3_weight_write_24bipp(ta_source, bypr, byi_read, source_i_any_coverage_size, edge_distances_proportions_of_total, corner_areas_proportions_of_total, fpx_area_recip, opt_ta_dest, dest_byi);
        }
    });
}
const resize_ta_colorspace_24bipp = (ta_source, source_colorspace, dest_size, opt_ta_dest) => {
    const dest_to_source_ratio = new Float32Array([source_colorspace[0] / dest_size[0], source_colorspace[1] / dest_size[1]]);
    if (dest_to_source_ratio[0] < 1 && dest_to_source_ratio[1] < 1) {
        return resize_ta_colorspace_24bipp$subpixel(ta_source, source_colorspace, dest_size, opt_ta_dest);
    } else if (dest_to_source_ratio[0] > 1 && dest_to_source_ratio[1] > 1) {
        return resize_ta_colorspace_24bipp$superpixel(ta_source, source_colorspace, dest_size, opt_ta_dest);
    } else {
        return resize_ta_colorspace_24bipp$general(ta_source, source_colorspace, dest_size, opt_ta_dest);
    }
}
const read_fpx_weight_write_24bipp = (dest_byi, source_i_any_coverage_size, edge_distances_proportions_of_total, corner_areas_proportions_of_total, byi_read) => {
    if (source_i_any_coverage_size[0] === 1) {
        if (source_i_any_coverage_size[1] === 1) {
            opt_ta_dest[dest_byi] = ta_source[byi_read++];
            opt_ta_dest[dest_byi + 1] = ta_source[byi_read++];
            opt_ta_dest[dest_byi + 2] = ta_source[byi_read++];
        } else if (source_i_any_coverage_size[1] === 2) {
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
        } else if (source_i_any_coverage_size[1] === 2) {
            byi_read_right = byi_read + bypp;
            byi_read_below = byi_read + bypr;
            byi_read_below_right = byi_read_below + bypp;
            opt_ta_dest[dest_byi] = corner_areas_proportions_of_total[0] * ta_source[byi_read++] + corner_areas_proportions_of_total[1] * ta_source[byi_read_right++] + corner_areas_proportions_of_total[2] * ta_source[byi_read_below++] + corner_areas_proportions_of_total[3] * ta_source[byi_read_below_right++];
            opt_ta_dest[dest_byi + 1] = corner_areas_proportions_of_total[0] * ta_source[byi_read++] + corner_areas_proportions_of_total[1] * ta_source[byi_read_right++] + corner_areas_proportions_of_total[2] * ta_source[byi_read_below++] + corner_areas_proportions_of_total[3] * ta_source[byi_read_below_right++];
            opt_ta_dest[dest_byi + 2] = corner_areas_proportions_of_total[0] * ta_source[byi_read++] + corner_areas_proportions_of_total[1] * ta_source[byi_read_right++] + corner_areas_proportions_of_total[2] * ta_source[byi_read_below++] + corner_areas_proportions_of_total[3] * ta_source[byi_read_below_right++];
        } else {
            read_2x3_weight_write_24bipp(ta_source, bypr, byi_read, edge_distances_proportions_of_total, corner_areas_proportions_of_total, opt_ta_dest, dest_byi);
        }
    } else if (source_i_any_coverage_size[0] === 3) {
        if (source_i_any_coverage_size[1] === 1) {
            console.log('source_i_any_coverage_size', source_i_any_coverage_size);
            console.trace();
            throw 'NYI';
        } else if (source_i_any_coverage_size[1] === 2) {
            read_3x2_weight_write_24bipp(ta_source, bypr, byi_read, edge_distances_proportions_of_total, corner_areas_proportions_of_total, opt_ta_dest, dest_byi);
        } else if (source_i_any_coverage_size[1] === 3) {
            read_3x3_weight_write_24bipp(ta_source, bypr, byi_read, edge_distances_proportions_of_total, corner_areas_proportions_of_total, fpx_area_recip, opt_ta_dest, dest_byi);
        } else {
            read_gt3x3_weight_write_24bipp(ta_source, bypr, byi_read, source_i_any_coverage_size, edge_distances_proportions_of_total, corner_areas_proportions_of_total, fpx_area_recip, opt_ta_dest, dest_byi);
        }
    } else {
        read_gt3x3_weight_write_24bipp(ta_source, bypr, byi_read, source_i_any_coverage_size, edge_distances_proportions_of_total, corner_areas_proportions_of_total, fpx_area_recip, opt_ta_dest, dest_byi);
    }
}
const resize_ta_colorspace = (ta_source, source_colorspace, dest_size, opt_ta_dest) => {
    const bipp = source_colorspace[4];
    if (bipp === 1) {
        console.trace(); throw 'NYI';
    } else if (bipp === 8) {
        console.trace(); throw 'NYI';
    } else if (bipp === 24) {
        return resize_ta_colorspace_24bipp(ta_source, source_colorspace, dest_size, opt_ta_dest);
    } else if (bipp === 32) {
        console.trace(); throw 'NYI';
    } else {
        console.trace();
        throw 'unsupported bipp: ' + bipp;
    }
}
module.exports = {
    resize_ta_colorspace: resize_ta_colorspace,
    resize_ta_colorspace_24bipp: resize_ta_colorspace_24bipp,
    resize_ta_colorspace_24bipp$subpixel: resize_ta_colorspace_24bipp$subpixel
}
