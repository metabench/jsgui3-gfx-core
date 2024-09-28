// So far it appears to be faster to have the local variables and the iteration of them all inline.


// This could also be a place for maths concerning floating-point-based sub-pixel mapping.
//  Maybe will have algorithms that process many of these in sequence.




// Could give all params as single ta? But that's trickier to code.


// make bytes_read_row_end_jump typed?
//  put more into a single typed array, be specific about indexing?

// ta_rect_copy_info?


// ta_rect_copy_info would be of use, or ta_2_rects_op_info?
//  ta_op_info?
//   could contain the read and write byte pointers.
//    also bytes_read_row_end_jump
//    also bypp, bipp
//    source bypr
//    target bypr
//    num_channels


// different ta_op_info for:
//  2 bounds of same size
//  Whether or not there are different bipps in the different ta spaces.


// Yes, need to work a bit more on bounds overlap maths.


const Virtual_Float_Pixel = require('./virtual-float-pixel');


const roadmap = {
    '0.0.23': ['Calculation of bounds overlaps for better / more optimized convolutions',
        'Further integrate this into the ta_math system? More and more will go into ta_math when the logic gets abstracted away from the pbs more towards maths.',
        'Could even have ta_math apply convolutions with params given from the existing OO classes.'
    ]
}





// could have a ta of [bytes_per_pixel, bytes_per_row]

// bytes per pixel may be better as a float, allowing for 1/8. Could try 3 bits per pixel - on or off, 3 color channels.
// width, bytes per pixel (allow 0.125?), bits per pixel, 

// pixels_per_row... source_width?
// source size?

// may indeed be worth passing on a ta_colorspace_description or similar... maybe a ta_colorspace or a Colorspace object.

const _colorspace_fields = ['width', 'height', 'bits_per_pixel', 'bytes_per_pixel', 'bits_per_row', 'bytes_per_row']
const __color_space_fields = ['size', 'ta_bpp', 'ta_bpr']
const ___colorspace_fields = ['width', 'height', 'bytes_per_pixel', 'bytes_per_row', 'bits_per_pixel', 'bits_per_row']

// could set the bytes_per to 0 (or -1) if it's in 1bipp mode.
//  only use the bipp and bipr values in these cases.
//  would allow the colorspace_fields to be Int16 or UInt16? 0 bypp and 0 bypr combined with bipp and bipr will indicate sub-bit pixel sizes.

// Could even try 12 bit pixels! 16 possible values each for r, g, b.






// ta_math.unaligned_copy_rect_8to32bipp(source, dest, bounds_source, pos_dest, ... arguments that are needed for the iteration)
//  row end jump values for both read and write. that's the difference here. it's not that complex at all when programmed in great detail.

// could use own iterator local numbers?
//  probably not too strenuous for a JS fn call, also likely to already be well optimized.
//   maybe faster than using a ta?
//   worth investigating.
//    put specific benchmark questions in the roadmap.




// Move away from source and dest terminology?


// copy_rect_8bipp_compacted_args(ta_source, ta_dest, ta_vars)




//const copy_rect_8bipp = (xy, bounds, ta, ta_res, ta_byte_indexes, ta_op_further_info) => {




// Only copies / sync iterates when the write ta is the same size as the read bounds.
//  Mark this as specialised in some way...

// Probably worth doing more work on optimizing convolution?
//  Image resizing?
//  View / window coords remapping.


// A lot of the remapping is theoretical and could be best expressed in a functional way.

// Reading between 4 pixels in specified ratios, and merging them.
//  Could use a moving 4 pixel window that's remapped to the larger pixel window.

// Pixel_Buffer and its operations already involves some form of pixel remapping.
//  Could make a pixel remapping function.

// Virtual Super Resolution / Float resolution?
//  Using float resolution for reading could be cool.
//  Read a region defined by floats. Special cases for thwn it covers 4 pixels (or less)
//   All fits within one pixel, it's relatively easy.

// Probably best to make separate pixel_remapping file. Don't make Pixel_Buffer_Core that much more complex iright now.



// More flexible copy rect?
//  Only dealing with byte indexes in the iteration?
//  Not dealing with x and y
//  Would have the read and write byte positions.
//   have last_read_byte_in_row value?
//        last_write_byte_in row?
//   is worth counting y? easy enough.
//  let's stick with y x looping for the moment.


// js numbers have to be fast anyway. probably best not to go overboard with typed arrays (overuse in params)
//  copy_ta_byte_range(ta_source, ta_dest, byte_idx_source_start, byte_idx_dest_start, length);


// a function for the set subarray method?





// unaligned_copy_rect_1bypp_to_3bypp

//  Possibly even use a row conversion function?


/*
    New for 0.0.24 - Resizing and pixel scaling
*/


// Will be faster with direct writing during the read merged calculation.

// specific subpixel shrink algorithm, with direct writing used.
//  avoid having to allocate the pixel result.

// inlining some functions that use local vars could help too.
//  specific inlined optimized expand resize using subpixels will work best here.







//const unaligned_copy_rect_1to4bypp


// Definitely looks like it's worth splitting this module up.
//  Want it better organised into separate files.
//  


// May be worth keeping in one file for current dev work.




/*
    copy
    paint
    read



    ??? resize

    ???transform
*/

//const copy = require('./ta-math/copy');
//const info = require('./ta-math/info');
//const read = require('./ta-math/read');
//const transform = require('./ta-math/transform');
//const write = require('./ta-math/write');

// Want to improve overriding behaviour.
//  Be able to get a new instance of ta_math, then apply overrides to that...
const copy = require('./ta-math/copy');
const info = require('./ta-math/info');
const read = require('./ta-math/read');
const transform = require('./ta-math/transform');
const write = require('./ta-math/write');



    
const {copy_rect_to_same_size_8bipp, copy_rect_to_same_size_24bipp, copy_ta_byte_range, unaligned_copy_rect_1to4bypp, unaligned_copy_rect_1bypp_to_3bypp,
    dest_aligned_copy_rect_1to4bypp} = copy;

const {overlapping_bounds} = info;

const {fill_solid_rect_by_bounds} = write;

const {read_1x2_rect, read_2x1_rect, read_2x2_rect, read_px} = read;
const {resize_ta_colorspace} = transform;


module.exports = {
    copy: copy,
    info: info,
    read: read,
    transform: transform,
    write: write,


    overlapping_bounds: overlapping_bounds,
    copy_rect_to_same_size_8bipp: copy_rect_to_same_size_8bipp,
    copy_rect_to_same_size_24bipp: copy_rect_to_same_size_24bipp,
    copy_ta_byte_range: copy_ta_byte_range,
    unaligned_copy_rect_1to4bypp: unaligned_copy_rect_1to4bypp,
    unaligned_copy_rect_1bypp_to_3bypp: unaligned_copy_rect_1bypp_to_3bypp,
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