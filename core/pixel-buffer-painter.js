
const ta_math = require('./ta-math');


const {fill_solid_rect_by_bounds} = ta_math;


// May want a simpler / more general method of composing polygons / shapes on a 1bipp pixelbuffer - and then writing that 1bipp image to the
// destination in the correct color.

// 3bipp and 4bipp would definitely be useful for a variety of uses.
// 8 color, 16 color.

// Painting polygons and the logic for polygons could help.
//  As in, which pixels are inside or outside a polygon.
//   Rendering the edges and doing flood fill could work well.

//   Flood fill within 1 bipp should be powerful in many situations.


// Polygon drawing:
//  Filled polygon composition:
//  Need to render the edges, and flood fill the inside.

// Maybe 2bipp would be more convenient in some ways?

// Render the edges.
//  Copy that image
//  Flood fill from the outside
//   Invert that image
//  Copy the edges image onto that inverted image (showing the inner area?)

// Or better to geometrically get points inside the image?
//  Flood fill is fast though.

// Fast 1bipp polygon ops should be useful overall.
//  Like equation masks.

// Maybe better to do ops more focused on countries to start with?
//  Though generalised polygon algorithms will help too.

//  And could specify them with pixel deltas too.



// core.draw_polygon(points, options)
//  Drawing a filled polygon could mean compositing it in its own new pixelbuffer

























const validate_color = (color, bipp) => {
    if (bipp === 1) {
        if (color !== 0 && color !== 1) {
            throw new RangeError('1bipp rectangle color must be 0 or 1');
        }
        return;
    }

    if (bipp === 8) {
        if ((color & 255) !== color) {
            throw new RangeError('8bipp rectangle color must be an integer from 0 to 255');
        }
        return;
    }

    const channel_count = bipp >> 3;
    if (color === null || color === undefined || color.length < channel_count) {
        throw new TypeError(`${bipp}bipp rectangle color must contain ${channel_count} channels`);
    }
    for (let channel = 0; channel < channel_count; channel++) {
        const value = color[channel];
        if ((value & 255) !== value) {
            throw new RangeError('Rectangle color channels must be integers from 0 to 255');
        }
    }
};

const fill_solid_rect_1bipp = (ta, row_stride, bounds, color) => {
    const left = bounds[0], top = bounds[1];
    const right = bounds[2], bottom = bounds[3];
    const first_byte_offset = Math.floor(left / 8);
    const last_byte_offset = Math.floor((right - 1) / 8);
    const first_mask = 255 >>> (left & 7);
    const right_remainder = right & 7;
    const last_mask = right_remainder === 0
        ? 255
        : (255 << (8 - right_remainder)) & 255;

    for (let y = top; y < bottom; y++) {
        const first_byte = y * row_stride + first_byte_offset;
        const last_byte = y * row_stride + last_byte_offset;
        if (first_byte === last_byte) {
            const mask = first_mask & last_mask;
            if (color === 1) ta[first_byte] |= mask;
            else ta[first_byte] &= ~mask & 255;
        } else if (color === 1) {
            ta[first_byte] |= first_mask;
            ta.fill(255, first_byte + 1, last_byte);
            ta[last_byte] |= last_mask;
        } else {
            ta[first_byte] &= ~first_mask & 255;
            ta.fill(0, first_byte + 1, last_byte);
            ta[last_byte] &= ~last_mask & 255;
        }
    }
};

class Pixel_Buffer_Painter {
    constructor(spec) {
        if (spec === null || typeof spec !== 'object') {
            throw new TypeError('Pixel_Buffer_Painter requires a specification object');
        }
        const pb = this.pb = spec.pb || spec.pixel_buffer;
        if (!pb || !pb.ta || !pb.size) {
            throw new TypeError('Pixel_Buffer_Painter requires a pixel buffer');
        }

        const bipp = pb.bipp;
        if (bipp !== 1 && bipp !== 8 && bipp !== 24 && bipp !== 32) {
            throw new RangeError('Rectangle painting supports 1, 8, 24, or 32 bits per pixel');
        }
        const width = pb.size[0], height = pb.size[1];
        const row_stride = pb.bytes_per_row;
        const ta = pb.ta;
        const bounds = [0, 0, 0, 0];

        this.rect = (pos, size, color) => {
            if (pos === null || pos === undefined) {
                throw new TypeError('Rectangle position must contain two safe integers');
            }
            const x = pos[0], y = pos[1];
            if (size === null || size === undefined) {
                throw new TypeError('Rectangle size must contain two safe integers');
            }
            const rect_width = size[0], rect_height = size[1];
            const geometry_is_int32 = (x | 0) === x && (y | 0) === y &&
                (rect_width | 0) === rect_width && (rect_height | 0) === rect_height;
            if (!geometry_is_int32) {
                if (!Number.isSafeInteger(x) || !Number.isSafeInteger(y)) {
                    throw new TypeError('Rectangle position must contain two safe integers');
                }
                if (!Number.isSafeInteger(rect_width) || !Number.isSafeInteger(rect_height)) {
                    throw new TypeError('Rectangle size must contain two safe integers');
                }
            }

            if (rect_width < 0 || rect_height < 0) {
                throw new RangeError('Rectangle size must not be negative');
            }
            const right_unclipped = x + rect_width;
            const bottom_unclipped = y + rect_height;
            if (!geometry_is_int32 &&
                (!Number.isSafeInteger(right_unclipped) ||
                !Number.isSafeInteger(bottom_unclipped))) {
                throw new RangeError('Rectangle bounds must be safe integers');
            }
            validate_color(color, bipp);

            if (rect_width === 0 || rect_height === 0) {
                return this;
            }

            if (x >= 0 && y >= 0 &&
                right_unclipped <= width && bottom_unclipped <= height) {
                // The common path has no clipping arithmetic or allocation.
                bounds[0] = x;
                bounds[1] = y;
                bounds[2] = right_unclipped;
                bounds[3] = bottom_unclipped;
            } else {
                if (right_unclipped <= 0 || bottom_unclipped <= 0 ||
                    x >= width || y >= height) {
                    return this;
                }
                bounds[0] = x < 0 ? 0 : x;
                bounds[1] = y < 0 ? 0 : y;
                bounds[2] = right_unclipped > width ? width : right_unclipped;
                bounds[3] = bottom_unclipped > height ? height : bottom_unclipped;
            }

            if (bipp === 1) {
                fill_solid_rect_1bipp(ta, row_stride, bounds, color);
            } else {
                fill_solid_rect_by_bounds(ta, row_stride, bounds, bipp, color);
            }

            return this;
        };
    }
}


module.exports = Pixel_Buffer_Painter;
