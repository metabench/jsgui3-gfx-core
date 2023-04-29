
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

























class Pixel_Buffer_Painter {
    constructor(spec) {
        const pb = this.pb = spec.pb || spec.pixel_buffer



        /*
        // Draw line
        // pos1, pos2, color

        // And weight???
        this.line = (pos1, pos2, color) => {

        }
        */

        this.rect = (pos, size, color) => {
            // call the lower level ta_math function.

            // bounds_from_pos_and_size?
            //  calc_bounds(pos, size);

            //console.log('paint rect [pos, size, color]', [pos, size, color]);
            

            const ta_bounds = new Int16Array(4);
            ta_bounds[0] = pos[0];
            ta_bounds[1] = pos[1];
            ta_bounds[2] = pos[0] + size[0];
            ta_bounds[3] = pos[1] + size[1];

            // const fill_solid_rect_by_bounds = (ta_dest, bypr_dest, ta_bounds, bipp, color)

            fill_solid_rect_by_bounds(pb.ta, pb.bypr, ta_bounds, pb.bipp, color);



            return this;  // return the painter.   paint.rect(...).rect(...) etc.



        }
    }
    //rect()
}


module.exports = Pixel_Buffer_Painter;