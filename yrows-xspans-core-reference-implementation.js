
// Want to make more optimised implementation that's dynamic and uses typed arrays.
//  Maybe each y row will be a linked list or binary tree, or even b+ tree.
//   Binary tree would likely be easier.
//   The B+ tree would itself most likely use linked lists.



// Could make a lower level Pos_Array where positions can be pushed or referenced by index, same API as an array (using proxies)
// but has an underlying typed array implementation that is faster.

const oext = require('obext');

const {ro, prop} = oext;


class YRows_XSpans_Core_Reference_Implementation {
    constructor(spec) {

        let size = new Uint16Array(2);

        // A default_color property?
        // background_color perhaps.
        //  default makes more logical / programming sense.

        let default_color;

        ro(this, 'default_color', () => {
            return default_color;
        });

        if (spec.size) {
            size[0] = spec.size[0];
            size[1] = spec.size[1];
        }

        if (spec.default_color) {
            default_color = spec.default_color;
            
        }

        let rows;

        if (size[1] > 0) {

            //rows = new Array(size[1]);

            rows = Array.from({ length: size[1] }, () => []);
            // Seems best to init arrays in all of them to start with....


            ro(this, 'rows', () => {
                return rows;
            });


        }



    }


    //  seems best for typed arrays.
    // const areEqual = (first, second) =>
    //  first.length === second.length && first.every((value, index) => value === second[index]);

    // Color can be different types of value.
    //  Could be represented in an array or a typed array.
    //  Need to work on representing colors using JS numbers / ints within JS.
    //   consider 24 bit colors using 32 bit numbers.


    set_pixel(pos, color) {
        // Is it already that color?

        const {default_color} = this;

        // Easy to find the row.
        const [x, y] = pos;

        const row = this.rows[y];

        const colors_are_equal = (color1, color2) => {
            return color1 == color2;
        }


        if (row) {
            if (row.length === 0) {
                // or an equals function?

                if (colors_are_equal(color, default_color)) {
                    // nothing to do
                } else {
                    // Representing the pixel spans as inclusive of both x1 and x2 does make some sense when compairing overlaps.
                    //  Maybe have different options for this even?
                    //  How to represent the xspans.

                    row.push([pos[0], pos[0], color]);
                }

                // maybe just == evaluation for the colors.
                //if (color === de)

            } else {


                // May be best putting the logic within plenty of local functions that are clearly named here.

                // scan row?
                //  iterate through the row, looking for overlaps.
                //   maybe identify that the position is n pixels before the start.
                //    or n pixels after.
                //    or within the xspan.

                let pixels_left_of_xspan = -1, pixels_right_of_xspan = -1, is_within_xspan = false, is_before_xspan, is_after_xspan, 
                    how_many_pixels_right_of_xspan_start = -1, how_many_pixels_left_of_xspan_end = -1, idx_xspan = 0;


                let pixel_matches_xspan_color = false;
                //  irrelevant in most cases anyway.
                //   only relevent within / adjacent to xspans matching the pos.

                let pixel_matches_default_color = colors_are_equal(color, default_color);

                for (const xspan of row) {
                    console.log('xspan', xspan);

                    const [x1, x2, color] = xspan;


                    if (x < x1) {
                        is_before_xspan = true;
                        pixels_left_of_xspan = x1 - x;
                        pixels_right_of_xspan = -1;
                        is_within_xspan = false;
                        is_after_xspan = false;
                        how_many_pixels_right_of_xspan_start = -1;
                        how_many_pixels_left_of_xspan_end = x2 - x;
                    } else if (x === x1) {
                        // Pixel is at the start of the xspan.

                    } else if (x < x2) {

                    } else if (x === x2) {

                    } else if (x > x2) {

                    } else {
                        throw 'stop';
                    }


                    idx_xspan++;
                }




                

                // Check where it is, relative to other xspans in the row.

                // 

                // Is it within any?
                //  Is that pixel already the set color?

                // Is it adjacent to 1? on the left, or the right?
                //  then is it the same color as the one it's adjacent to?
                //  is it the same color as the background?
                //   if so, nothing to do.

                // Is it adjacent to 2?
                //  should only be a single pixel then.
                //  check if it's the same color as both of them. (if so, will join them together)




                // Check if it's in empty space?
                
                // Check to see if there is an existing one to extend?
                // Check to see if one needs to be split


            }
        } else {
            throw 'Row not found';
        }





    }
}

module.exports = YRows_XSpans_Core_Reference_Implementation;
