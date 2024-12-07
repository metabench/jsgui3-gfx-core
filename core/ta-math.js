

const copy = require('./ta-math/copy');
const info = require('./ta-math/info');
const read = require('./ta-math/read');
const transform = require('./ta-math/transform');
const write = require('./ta-math/write');

const bitwise = require('./ta-math/bitwise');

const {
    right_shift_32bit_with_carry,
    xor_typed_arrays,
    each_1_index,
    count_1s,
    get_ta_bits_that_differ_from_previous_as_1s,
    get_bit,
    fast_find_next_set_ta_bit
} = bitwise;


const draw = require('./ta-math/draw');

const {draw_polygon_outline_to_ta_1bipp, ensure_polygon_is_ta, calc_polygon_stroke_points_x_y} = draw;
    
const {copy_rect_to_same_size_8bipp, copy_rect_to_same_size_24bipp, copy_ta_byte_range, unaligned_copy_rect_1to4bypp,
    dest_aligned_copy_rect_1to4bypp} = copy;

const {overlapping_bounds} = info;

const {fill_solid_rect_by_bounds} = write;

const {read_1x2_rect, read_2x1_rect, read_2x2_rect, read_px} = read;
const {resize_ta_colorspace} = transform;


module.exports = {

    draw_polygon_outline_to_ta_1bipp,
    ensure_polygon_is_ta,

    right_shift_32bit_with_carry,
    xor_typed_arrays,
    each_1_index,
    count_1s,
    get_ta_bits_that_differ_from_previous_as_1s,
    calc_polygon_stroke_points_x_y,
    get_bit,
    fast_find_next_set_ta_bit,



    draw,
    copy: copy,
    info: info,
    read: read,
    transform: transform,
    write: write,
    bitwise,


    overlapping_bounds: overlapping_bounds,
    copy_rect_to_same_size_8bipp: copy_rect_to_same_size_8bipp,
    copy_rect_to_same_size_24bipp: copy_rect_to_same_size_24bipp,
    copy_ta_byte_range: copy_ta_byte_range,
    unaligned_copy_rect_1to4bypp: unaligned_copy_rect_1to4bypp,
    dest_aligned_copy_rect_1to4bypp: dest_aligned_copy_rect_1to4bypp,
    fill_solid_rect_by_bounds: fill_solid_rect_by_bounds,
    read_1x2_rect: read_1x2_rect,
    read_2x1_rect: read_2x1_rect,
    read_2x2_rect: read_2x2_rect,
    read_px: read_px,
    read_pixel: read_px,

    resize_ta_colorspace: resize_ta_colorspace//,
    //override: override,

    //get_instance: get_instance
}