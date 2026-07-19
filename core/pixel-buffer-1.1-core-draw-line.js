/*
    Maybe want an Image class that internally uses both Pixel_Buffer as well as X_Spans.
    Being able to handle multiple modes could be useful.
    Some modes will be more optimal for some operations.
    Drawing X_Spans will be sometimes a lot faster than drawing pixels.
    Then could get the output as a pixel buffer.
    Could keep one specific data structure up-to-date, and then when another representation is needed it renders the image into that
    data structure.
    May want to move some higher level algorithms upwards - ones that could work on top of either image type so long as there are
    lower level functions that do things like set_pixel.
    Could have optimised implementations for some things what work on those data structures.
    Static_X_Spans - Would be a good format to represent a shape. Maybe good format for saving to disk.
    Dynamic_X_Spans - Would be a good format for drawing a shape. Probably good for flood fills and other operations that modify the image.
        Dynamic_X_Spans seems more useful for the moment.
    Pixel_Buffer_Core could possibly use Dynamic_X_Spans when it does a draw_pollygon filled operation.
        The X_Spans idea came about as a way to do faster flood fills.
        A highly optimised Dynamic_X_Spans should be particularly useful for this.
            Flood fills will remove / join together some X Spans.
    Maybe Pixel_Buffer_Enh will use these Dynamic_X_Spans in order to do some things quicker (too)
    Polygon shape drawing seems core in terms of API, but somewhat higher level compared to some other features and algorithms.
    Possibly a Polygon that could draw itself to image data structures would work well.
*/
/*
    1 Small / trivial change
       2 mins going on 10 mins
    2  Small change
       5 mins going on 30 mins
    3  Medium-Small task
       15 mins going on 1.5h
       could be an easier version of a 4 - needs an optimized algorithm to be written and tested, it doesnt require further R&D.
    4
       45 mins going on 4.5(+)h
        as in could be an underestimated 5?
        may require thinking about maths & optimization
    5 Moderate - a few hours
        2 hours if it turns out to be relatively easy
        going on a day
    6
        0.5 days to 3 days
    7   (some level of overhaul or new API design involved)
        1.5 days to 1 week
    8  
        1 week to 3 weeks
    9 Programming / API overhaul
        3 weeks to 6 weeks
    10 Huge overhaul / major rewrite / a medium-large project of its own
        1 month to 3 months
*/
/*
const _roadmap = {
    '0.0.22': [
        ['pb.bypp = 1 convert to greyscale', 'done', 3, 'Medium small task requiring writing of optimized algorithm']
    ],
    '0.0.23': [
        'Convolutions', 
        `
        Task Size and Complexity Measure: 5 changed to 6.5
            Going into a larger properties overhaul - new size 6 or 7
        Rethinking and implementing pos_bounds
            pos_within_source_bounds
        Rename pos
            pos_within_source
            In this case, can't assume all positions are relative to the self pb, so need to be extra explicit in the variable names regarding what they relate to.
        Consider other pos type variables. Explicit names for what they do.
            pos_iteration_within_self
            pos_cursor_within_self
        Better to have more API-based centering, and adjust the central position?
            Possibly not best for convolution, for perf reasons.
            Don't want more calculations done during iteration...?
            Maybe don't need to deal with centering as directly right now?
                Seems useful for convolutions, centering the window of the px is a core part of the convolution logic. Worth having the platform support it as easily as possible.
        new_window
            implemented
        new_centered_window() ???
            NOT doing this for the moment. done new_window
            centered on 0,0.
            center of that window corresponds to a pixel in this window.
            bounds determined...
                does make sense for the moment.
                implement this fn, makes sense for convs right now.
            get_conv_window?
        new_convolved(convolution) - using this.
        `
        ['window view into specific channel?'],
        ['run convolution on 8bipp image?', 'maybe', 'not yet'],
        ['Convolution Class', ],
        ['Bug fix move_next_px, need to use boundary ranges for proper movement of the window within a source', 4, [
            ['cancelled - doing pb.pos_bounds', 'pb.window_movement_bounds', `
                Need to make / finish function
                Considering different types of bounds
            `],
            ['pos_bounds', `
                consider iterate_pos_within_bounds
                just each_pos_px?
                As well as positions, need to properly calculate iteration values and indexes.
                Put these into a typed array, access them through use of a function
            `]
        ]]
    ],
    '0.0.24': [
        'Moving of mathematical code to ta_math where possible and suitable.',
        'Current size: >6000 lines. Can it be brought down to 1000? Still kept v performant?',
        ['new_resized', 'clearly creates a new pb']
    ],
    '0.0.25': [
        'Improvements / optimization to resize',
        'Facilitate usage of C++ acceleration.'
    ]
}
*/
const lang = require('lang-mini');
const {
    each,
    fp,
    tof,
    get_a_sig,
    are_equal,
    tf
} = lang;
const maxui64 = ~0n;
const Pixel_Pos_List = require('./pixel-pos-list');
const oext = require('obext');
const {ro, prop} = oext;
const Typed_Array_Binary_Read_Write = require('./Typed_Array_Binary_Read_Write');
const Pixel_Buffer_Painter = require('./pixel-buffer-painter');
let ta_math = require('./ta-math')
let {resize_ta_colorspace, copy_rect_to_same_size_8bipp, copy_rect_to_same_size_24bipp, dest_aligned_copy_rect_1to4bypp} = ta_math;

const Pixel_Buffer_Core_Get_Set_Pixels = require('./pixel-buffer-1-core-get-set-pixel');
const {
    unsafeSetPixel,
    unsafeSetPixel1bipp
} = require('./pixel-buffer-pixel-access');

// Clip only when an endpoint is outside. The overwhelmingly common in-bounds
// path in draw_line keeps its existing Bresenham loop unchanged.
const clip_line_to_bitmap = (x0, y0, x1, y1, width, height) => {
    if (!Number.isFinite(x0) || !Number.isFinite(y0) ||
        !Number.isFinite(x1) || !Number.isFinite(y1) ||
        width <= 0 || height <= 0) {
        return null;
    }

    const max_x = width - 1;
    const max_y = height - 1;
    const LEFT = 1, RIGHT = 2, TOP = 4, BOTTOM = 8;
    const outcode = (x, y) =>
        (x < 0 ? LEFT : (x > max_x ? RIGHT : 0)) |
        (y < 0 ? TOP : (y > max_y ? BOTTOM : 0));

    let code0 = outcode(x0, y0);
    let code1 = outcode(x1, y1);

    while (true) {
        if ((code0 | code1) === 0) {
            return [
                Math.max(0, Math.min(max_x, Math.round(x0))),
                Math.max(0, Math.min(max_y, Math.round(y0))),
                Math.max(0, Math.min(max_x, Math.round(x1))),
                Math.max(0, Math.min(max_y, Math.round(y1)))
            ];
        }
        if ((code0 & code1) !== 0) return null;

        const code = code0 || code1;
        let x, y;
        if (code & TOP) {
            x = x0 + (x1 - x0) * (-y0) / (y1 - y0);
            y = 0;
        } else if (code & BOTTOM) {
            x = x0 + (x1 - x0) * (max_y - y0) / (y1 - y0);
            y = max_y;
        } else if (code & RIGHT) {
            y = y0 + (y1 - y0) * (max_x - x0) / (x1 - x0);
            x = max_x;
        } else {
            y = y0 + (y1 - y0) * (-x0) / (x1 - x0);
            x = 0;
        }

        if (code === code0) {
            x0 = x;
            y0 = y;
            code0 = outcode(x0, y0);
        } else {
            x1 = x;
            y1 = y;
            code1 = outcode(x1, y1);
        }
    }
};

const normalize_line_coordinates = (x0, y0, x1, y1) => {
    if (!Number.isFinite(x0) || !Number.isFinite(y0) ||
        !Number.isFinite(x1) || !Number.isFinite(y1)) {
        throw new TypeError('Line coordinates must be finite numbers');
    }
    if ((Number.isInteger(x0) && !Number.isSafeInteger(x0)) ||
        (Number.isInteger(y0) && !Number.isSafeInteger(y0)) ||
        (Number.isInteger(x1) && !Number.isSafeInteger(x1)) ||
        (Number.isInteger(y1) && !Number.isSafeInteger(y1))) {
        throw new RangeError('Line integer coordinates must be safe integers');
    }
    return [Math.trunc(x0), Math.trunc(y0), Math.trunc(x1), Math.trunc(y1)];
};

class Pixel_Buffer_Core_Draw_Lines extends Pixel_Buffer_Core_Get_Set_Pixels {
    constructor(spec) {
        
        super(spec);

        
        
        
    }

    'draw_line'(pos1, pos2, color) {

        // Keep the common one-pixel operation at least as cheap as entering
        // Bresenham. Non-finite/fractional values deliberately miss this guard
        // and go through the validating slow path below.
        const single_x = pos1[0], single_y = pos1[1];
        if (single_x === pos2[0] && single_y === pos2[1] &&
            (single_x | 0) === single_x && (single_y | 0) === single_y) {
            const single_size = this.size;
            if ((single_x >>> 0) >= single_size[0] ||
                (single_y >>> 0) >= single_size[1]) {
                return;
            }
            const bipp = this.bits_per_pixel;
            const row = single_y * this.bytes_per_row;
            if (bipp === 1) {
                const byte = row + (single_x >> 3);
                const mask = 128 >> (single_x & 7);
                if (color) this.ta[byte] |= mask;
                else this.ta[byte] &= ~mask;
            } else if (bipp === 8) {
                this.ta[row + single_x] = color;
            } else if (bipp === 24) {
                const byte = row + single_x * 3;
                this.ta[byte] = color[0];
                this.ta[byte + 1] = color[1];
                this.ta[byte + 2] = color[2];
            } else if (bipp === 32) {
                const byte = row + single_x * 4;
                this.ta[byte] = color[0];
                this.ta[byte + 1] = color[1];
                this.ta[byte + 2] = color[2];
                this.ta[byte + 3] = color[3];
            }
            return;
        }

        // options would help....
        //  or it could just be color here.

        // And maybe use different bipp options.


        // yes, want to make an optimised 1bipp version. Will use a table of 8 movement offsets.

        // Maybe a 2 pixel coords ta?
        //   or a Pixel_Pair class????
        //    that extends a typed array


        if (this.bits_per_pixel === 1) {

            // This thing with the array probably slows it down?
            //   Though having such an array available could be better still?
            //     Or array itself will be better with improved optimisation???


            let x0 = pos1[0];
            let y0 = pos1[1];
            let x1 = pos2[0];
            let y1 = pos2[1];

            if ((x0 | 0) !== x0 || (y0 | 0) !== y0 ||
                (x1 | 0) !== x1 || (y1 | 0) !== y1) {
                [x0, y0, x1, y1] = normalize_line_coordinates(x0, y0, x1, y1);
            }

            const [width, height] = this.size;
            if (x0 < 0 || x0 >= width || y0 < 0 || y0 >= height ||
                x1 < 0 || x1 >= width || y1 < 0 || y1 >= height) {
                const clipped = clip_line_to_bitmap(x0, y0, x1, y1, width, height);
                if (clipped === null) return;
                [x0, y0, x1, y1] = clipped;
            }

            if (x0 === x1 && y0 === y1) {
                unsafeSetPixel1bipp(this, [x0, y0], color);
                return;
            }
            if (y0 === y1) {
                return this.draw_horizontal_line_y_x1_x2(
                    y0,
                    x0 < x1 ? x0 : x1,
                    x0 < x1 ? x1 : x0,
                    color
                );
            }

            let dx = Math.abs(x1 - x0);
            let dy = Math.abs(y1 - y0);
            let sx = (x0 < x1) ? 1 : -1;
            let sy = (y0 < y1) ? 1 : -1;
            let err = dx - dy;

            while (true) {
                //console.log('[x0, y0]', [x0, y0]);
                unsafeSetPixel1bipp(this, [x0, y0], color);

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


            //return this.draw_line_1bipp(new Uint32Array([pos1[0], pos1[1], pos2[0], pos2[1]]));
        } else {
            let x0 = pos1[0];
            let y0 = pos1[1];
            let x1 = pos2[0];
            let y1 = pos2[1];

            if ((x0 | 0) !== x0 || (y0 | 0) !== y0 ||
                (x1 | 0) !== x1 || (y1 | 0) !== y1) {
                [x0, y0, x1, y1] = normalize_line_coordinates(x0, y0, x1, y1);
            }

            const [width, height] = this.size;
            if (x0 < 0 || x0 >= width || y0 < 0 || y0 >= height ||
                x1 < 0 || x1 >= width || y1 < 0 || y1 >= height) {
                const clipped = clip_line_to_bitmap(x0, y0, x1, y1, width, height);
                if (clipped === null) return;
                [x0, y0, x1, y1] = clipped;
            }

            if (x0 === x1 && y0 === y1) {
                unsafeSetPixel(this, [x0, y0], color);
                return;
            }
            if (y0 === y1) {
                return this.draw_horizontal_line_y_x1_x2(
                    y0,
                    x0 < x1 ? x0 : x1,
                    x0 < x1 ? x1 : x0,
                    color
                );
            }

            let dx = Math.abs(x1 - x0);
            let dy = Math.abs(y1 - y0);
            let sx = (x0 < x1) ? 1 : -1;
            let sy = (y0 < y1) ? 1 : -1;
            let err = dx - dy;

            while (true) {
                unsafeSetPixel(this, [x0, y0], color);

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


        
    }

    
    draw_line_1bipp(ta_pixel_pair, color) {
        const { ta } = this;  // Extract the typed array (ta) from the pixel buffer object

        let [x0, y0, x1, y1] = ta_pixel_pair;     // Extract x0, y0, x1, y1 from ta_pixel_pair
        if ((x0 | 0) !== x0 || (y0 | 0) !== y0 ||
            (x1 | 0) !== x1 || (y1 | 0) !== y1) {
            [x0, y0, x1, y1] = normalize_line_coordinates(x0, y0, x1, y1);
        }
        const [width, height] = this.size;
        if (x0 < 0 || x0 >= width || y0 < 0 || y0 >= height ||
            x1 < 0 || x1 >= width || y1 < 0 || y1 >= height) {
            const clipped = clip_line_to_bitmap(x0, y0, x1, y1, width, height);
            if (clipped === null) return;
            [x0, y0, x1, y1] = clipped;
        }

        if (x0 === x1 && y0 === y1) {
            const byte_index = (x0 >> 3) + (y0 * this.bytes_per_row);
            const mask = 128 >> (x0 & 7);
            if (color) ta[byte_index] |= mask;
            else ta[byte_index] &= ~mask;
            return;
        }
        if (y0 === y1) {
            return this.draw_horizontal_line_y_x1_x2(
                y0,
                x0 < x1 ? x0 : x1,
                x0 < x1 ? x1 : x0,
                color
            );
        }

        let bytes_per_row = this.bytes_per_row,   // Access bytes per row from the object
            dx = Math.abs(x1 - x0),               // Calculate dx
            dy = Math.abs(y1 - y0),               // Calculate dy
            sx = (x0 < x1) ? 1 : -1,              // Set step direction for x
            sy = (y0 < y1) ? 1 : -1,              // Set step direction for y
            err = dx - dy, e2;                    // Initialize error value and temporary variable e2

        while (true) {
            // Calculate the byte index and bit position for (x0, y0)
            const byte_index = (x0 >> 3) + (y0 * bytes_per_row), bit_position = x0 & 7;

            if (color) {
                ta[byte_index] |= (1 << (7 - bit_position)); // Set the pixel in the typed array
            } else {
                ta[byte_index] &= ~(1 << (7 - bit_position)); // Clear the pixel in the typed array
            }

            if (x0 === x1 && y0 === y1) break;  // Stop when we reach the end

            e2 = err << 1;
            if (e2 > -dy) err -= dy, x0 += sx;  // Adjust error and move x
            if (e2 < dx) err += dx, y0 += sy;   // Adjust error and move y
        }
    }

    'draw_horizontal_line_off_1bipp_inclusive'([x1, x2], y) {
        const {ta} = this;
        const width = this.size[0], height = this.size[1];
        if (x1 < 0 || x2 >= width || y < 0 || y >= height || x1 > x2) {
            if (y < 0 || y >= height || x1 > x2 || x2 < 0 || x1 >= width) return;
            if (x1 < 0) x1 = 0;
            if (x2 >= width) x2 = width - 1;
        }
        const number_of_pixels_to_draw = (x2 - x1) + 1;
        const row_start = y * this.bytes_per_row;
        if (number_of_pixels_to_draw === 1) {
            const byte = row_start + (x1 >> 3);
            ta[byte] &= ~(128 >> (x1 & 7)) & 255;
        } else if (number_of_pixels_to_draw === 2) {
            let byte = row_start + (x1 >> 3);
            ta[byte] &= ~(128 >> (x1 & 7)) & 255;
            x1++;
            byte = row_start + (x1 >> 3);
            ta[byte] &= ~(128 >> (x1 & 7)) & 255;
        } else {
            const starting_byte_index = row_start + (x1 >> 3);
            const starting_bit_within_byte_index = x1 & 7;
            const ending_byte_index = row_start + (x2 >> 3);
            const ending_bit_within_byte_index = x2 & 7;
            const bits_from_end_of_byte = 7 - ending_bit_within_byte_index;
            if (starting_byte_index === ending_byte_index) {
                ta[starting_byte_index] &= (~((((((255 << starting_bit_within_byte_index) & 255) >> starting_bit_within_byte_index)) >> bits_from_end_of_byte) << bits_from_end_of_byte))&255;
            } else {
                ta[starting_byte_index] &= (~((((255 << starting_bit_within_byte_index) & 255) >> starting_bit_within_byte_index)))&255;
                ta.fill(0, starting_byte_index + 1, ending_byte_index);
                ta[ending_byte_index] &= (~((255 >> bits_from_end_of_byte) << bits_from_end_of_byte))&255;
            }
        }
    }


    draw_x_span_on_1bipp(x, y, l) {
        if (l <= 0) return;
        return this.draw_horizontal_line_on_1bipp_inclusive([x, x + l - 1], y);
    }

    // May do more lower level / general purpose work on line drawing....

    'draw_horizontal_line_on_1bipp_inclusive'([x1, x2], y) {
        const {ta} = this;
        const width = this.size[0], height = this.size[1];
        if (x1 < 0 || x2 >= width || y < 0 || y >= height || x1 > x2) {
            if (y < 0 || y >= height || x1 > x2 || x2 < 0 || x1 >= width) return;
            if (x1 < 0) x1 = 0;
            if (x2 >= width) x2 = width - 1;
        }
        const number_of_pixels_to_draw = (x2 - x1) + 1;
        const row_start = y * this.bytes_per_row;
        if (number_of_pixels_to_draw === 1) {
            ta[row_start + (x1 >> 3)] |= 128 >> (x1 & 7);
        } else if (number_of_pixels_to_draw === 2) {
            ta[row_start + (x1 >> 3)] |= 128 >> (x1 & 7);
            x1++;
            ta[row_start + (x1 >> 3)] |= 128 >> (x1 & 7);
        } else {
            const starting_byte_index = row_start + (x1 >> 3);
            const starting_bit_within_byte_index = x1 & 7;
            const ending_byte_index = row_start + (x2 >> 3);
            const ending_bit_within_byte_index = x2 & 7;
            const bits_from_end_of_byte = 7 - ending_bit_within_byte_index;
            if (starting_byte_index === ending_byte_index) {
                ta[starting_byte_index] |= (((((255 << starting_bit_within_byte_index) & 255) >> starting_bit_within_byte_index)) >> bits_from_end_of_byte) << bits_from_end_of_byte;
            } else {
                ta[starting_byte_index] |= ((255 << starting_bit_within_byte_index) & 255) >> starting_bit_within_byte_index;
                ta.fill(255, starting_byte_index + 1, ending_byte_index);
                ta[ending_byte_index] |= (255 >> bits_from_end_of_byte) << bits_from_end_of_byte;
            }
        }
    }
    
    'draw_horizontal_line_8bipp'(xspan, y, color) {
        let [x1, x2] = xspan;
        const width = this.size[0], height = this.size[1];
        if (x1 < 0 || x2 >= width || y < 0 || y >= height || x1 > x2) {
            if (y < 0 || y >= height || x1 > x2 || x2 < 0 || x1 >= width) return;
            if (x1 < 0) x1 = 0;
            if (x2 >= width) x2 = width - 1;
        }
        const {ta} = this;
        //const [r, g, b] = color;
        let w = this.bytes_per_row * y + x1;
        for (let x = x1; x <= x2; x++) {
            ta[w++] = color;
        }
    }
    'draw_horizontal_line_24bipp'(xspan, y, color) {
        let [x1, x2] = xspan;
        const width = this.size[0], height = this.size[1];
        if (x1 < 0 || x2 >= width || y < 0 || y >= height || x1 > x2) {
            if (y < 0 || y >= height || x1 > x2 || x2 < 0 || x1 >= width) return;
            if (x1 < 0) x1 = 0;
            if (x2 >= width) x2 = width - 1;
        }
        const {ta} = this;
        const [r, g, b] = color;
        let w = this.bytes_per_row * y + x1 * 3;
        for (let x = x1; x <= x2; x++) {
            ta[w++] = r;
            ta[w++] = g;
            ta[w++] = b;
        }
    }
    'draw_horizontal_line_32bipp'(xspan, y, color) {
        let [x1, x2] = xspan;
        const width = this.size[0], height = this.size[1];
        if (x1 < 0 || x2 >= width || y < 0 || y >= height || x1 > x2) {
            if (y < 0 || y >= height || x1 > x2 || x2 < 0 || x1 >= width) return;
            if (x1 < 0) x1 = 0;
            if (x2 >= width) x2 = width - 1;
        }
        const {ta} = this;
        const [r, g, b, a] = color;
        let w = this.bytes_per_row * y + x1 * 4;
        for (let x = x1; x <= x2; x++) {
            ta[w++] = r;
            ta[w++] = g;
            ta[w++] = b;
            ta[w++] = a;
        }
    }
    'draw_horizontal_line'(xspan, y, color) {
        const {bipp} = this;
        if (bipp === 1) {
            if (color === 1) {
                return this.draw_horizontal_line_on_1bipp_inclusive(xspan, y);
            } else {
                return this.draw_horizontal_line_off_1bipp_inclusive(xspan, y);
            }
        } else if (bipp === 8) {
            return this.draw_horizontal_line_8bipp(xspan, y, color);
        } else if (bipp === 24) {
            return this.draw_horizontal_line_24bipp(xspan, y, color);
        } else if (bipp === 32) {
            return this.draw_horizontal_line_32bipp(xspan, y, color);
        } else {
            console.trace();
            throw 'NYI';
        }
    }

    'draw_horizontal_line_y_x1_x2'(y, x1, x2, color, pre_populated_array, populate_array) {
        const {bipp} = this;
        if (bipp === 1) {
            if (color === 1) {
                return this.draw_horizontal_line_on_1bipp_inclusive_y_x1_x2(y, x1, x2);
            } else {
                return this.draw_horizontal_line_off_1bipp_inclusive_y_x1_x2(y, x1, x2);
            }
        } else if (bipp === 8) {
            return this.draw_horizontal_line_8bipp_y_x1_x2(y, x1, x2, color);
        } else if (bipp === 24) {
            return this.draw_horizontal_line_24bipp_y_x1_x2(y, x1, x2, color, pre_populated_array, populate_array);
        } else if (bipp === 32) {
            return this.draw_horizontal_line_32bipp_y_x1_x2(y, x1, x2, color);
        } else {
            console.trace();
            throw 'NYI';
        }
    }

    'draw_horizontal_line_on_1bipp_inclusive_y_x1_x2'(y, x1, x2) {
        return this.draw_horizontal_line_on_1bipp_inclusive([x1, x2], y);
    }

    'draw_horizontal_line_off_1bipp_inclusive_y_x1_x2'(y, x1, x2) {
        return this.draw_horizontal_line_off_1bipp_inclusive([x1, x2], y);
    }

    'draw_horizontal_line_8bipp_y_x1_x2'(y, x1, x2, color) {
        //const [x1, x2] = xspan;
        const width = this.size[0], height = this.size[1];
        if (x1 < 0 || x2 >= width || y < 0 || y >= height || x1 > x2) {
            if (y < 0 || y >= height || x1 > x2 || x2 < 0 || x1 >= width) return;
            if (x1 < 0) x1 = 0;
            if (x2 >= width) x2 = width - 1;
        }
        const {ta} = this;
        //const [r, g, b] = color;
        let w = this.bytes_per_row * y + x1;
        for (let x = x1; x <= x2; x++) {
            ta[w++] = color;
        }
    }

    '_draw_horizontal_line_24bipp_y_x1_x2'(y, x1, x2, color) {
        //const [x1, x2] = xspan;
        const width = this.size[0], height = this.size[1];
        if (x1 < 0 || x2 >= width || y < 0 || y >= height || x1 > x2) {
            if (y < 0 || y >= height || x1 > x2 || x2 < 0 || x1 >= width) return;
            if (x1 < 0) x1 = 0;
            if (x2 >= width) x2 = width - 1;
        }
        const {ta} = this;
        const [r, g, b] = color;
        let w = this.bytes_per_row * y + x1 * 3;
        for (let x = x1; x <= x2; x++) {
            ta[w++] = r;
            ta[w++] = g;
            ta[w++] = b;
        }
    }

    'draw_horizontal_line_24bipp_y_x1_x2'(y, x1, x2, color, pre_populated_array = null, populate_array = true) {
        const { ta } = this;
        const [width, height] = this.size;

        if (x1 < 0 || x2 >= width || y < 0 || y >= height || x1 > x2) {
            if (y < 0 || y >= height || x1 > x2 || x2 < 0 || x1 >= width) return;
            if (x1 < 0) x1 = 0;
            if (x2 >= width) x2 = width - 1;
        }

        const start_byte_idx = this.bytes_per_row * y + x1 * 3;
        const [r, g, b] = color;
        const pixel_count = x2 - x1 + 1;

        if (pixel_count < 8) {
            // For small spans, use the original per-pixel method
            let w = start_byte_idx;
            for (let x = x1; x <= x2; x++) {
                ta[w++] = r;
                ta[w++] = g;
                ta[w++] = b;
            }
            return;
        }

        // Create and optionally populate the pre-populated array if needed
        if (!pre_populated_array) {
            pre_populated_array = new Uint8Array(96 * 3); // Default size of 96 pixels, 288 bytes
        }

        if (populate_array) {
            for (let i = 0; i < pre_populated_array.length; i += 3) {
                pre_populated_array[i] = r;
                pre_populated_array[i + 1] = g;
                pre_populated_array[i + 2] = b;
            }
        }

        let w = start_byte_idx;
        const ppal = pre_populated_array.length;
        const chunk_size = ppal / 3; // Use the provided pre-populated array's actual size
        let remaining_pixels = pixel_count;

        while (remaining_pixels >= chunk_size) {
            //const byte_count = chunk_size * 3;
            ta.set(pre_populated_array, w);
            w += ppal;
            remaining_pixels -= chunk_size;
        }


        /*
        // Use .set for remaining pixels if 16 or more remain
        if (remaining_pixels >= 32) {
            const byte_count = remaining_pixels * 3;
            ta.set(pre_populated_array.subarray(0, byte_count), w);
        } else if (remaining_pixels > 0) {
            // Handle remaining pixels directly for fewer than 16
            for (let i = 0; i < remaining_pixels * 3; i += 3) {
                ta[w++] = r;
                ta[w++] = g;
                ta[w++] = b;
            }
        }

        */

        for (let i = 0; i < remaining_pixels; i ++) {
            ta[w++] = r;
            ta[w++] = g;
            ta[w++] = b;
        }
    }

    'draw_horizontal_line_32bipp_y_x1_x2'(y, x1, x2, color) {
        //const [x1, x2] = xspan;
        const width = this.size[0], height = this.size[1];
        if (x1 < 0 || x2 >= width || y < 0 || y >= height || x1 > x2) {
            if (y < 0 || y >= height || x1 > x2 || x2 < 0 || x1 >= width) return;
            if (x1 < 0) x1 = 0;
            if (x2 >= width) x2 = width - 1;
        }
        const {ta} = this;
        const [r, g, b, a] = color;
        let w = this.bytes_per_row * y + x1 * 4;
        for (let x = x1; x <= x2; x++) {
            ta[w++] = r;
            ta[w++] = g;
            ta[w++] = b;
            ta[w++] = a;
        }
    }
    
}
module.exports = Pixel_Buffer_Core_Draw_Lines;
