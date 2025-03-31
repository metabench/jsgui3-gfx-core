# Detailed Comments in jsgui3-gfx-core Codebase

This document provides comprehensive documentation of comments throughout the jsgui3-gfx-core codebase, organized by file and location, preserving the original text and context.

## pixel-buffer-0-core-inner-structures.js

This file defines the core data structures for pixel buffers, including typed arrays for pixel data and properties for managing dimensions and bit depth.

## pixel-buffer-1-core-get-set-pixel.js

### get_pixel_byte_bit_1bipp method
```javascript
'get_pixel_byte_bit_1bipp'(pos) {
    /*
    */
    const idx = pos[1] * this.size[0] + pos[0];
    const byte = idx >> 3;
    const bit = (idx & 0b111);
    return {byte, bit};
}
```

### set_pixel_on_1bipp
```javascript
'set_pixel_on_1bipp'(pos) {
    const pixel_index = pos[1] * this.size[0] + pos[0];
    this.ta[pixel_index >> 3] |= (128 >> (pixel_index & 0b111));
}
```

### set_pixel_off_1bipp
```javascript
'set_pixel_off_1bipp'(pos) {
    const pixel_idx = pos[1] * this.size[0] + pos[0];
    this.ta[pixel_idx >> 3] &= (~(128 >> (pixel_idx & 0b111))) & 255;
}
```

### set_pixel implementations for different bit depths
Implementations for setting pixels at various color depths (1, 8, 24, 32 bits per pixel), each optimized for its particular data structure.

### get_pixel implementations for different bit depths
Specialized methods for retrieving pixel data at different bit depths, handling the appropriate byte offsets and bit operations.

## pixel-buffer-1.1-core-draw-line.js

### Architectural Comments
```javascript
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
```

### Task Complexity Classification
```javascript
/*
    1 Small / trivial change
       2 mins going on 10 mins
    2 Small change
       5 mins going on 30 mins
    3 Medium-Small task
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
    7 (some level of overhaul or new API design involved)
        1.5 days to 1 week
    8  
        1 week to 3 weeks
    9 Programming / API overhaul
        3 weeks to 6 weeks
    10 Huge overhaul / major rewrite / a medium-large project of its own
        1 month to 3 months
*/
```

### Roadmap Planning
```javascript
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
```

### draw_line_1bipp method
```javascript
draw_line_1bipp(ta_pixel_pair, color) {
    const { ta } = this;  // Extract the typed array (ta) from the pixel buffer object

    let [x0, y0, x1, y1] = ta_pixel_pair,     // Extract x0, y0, x1, y1 from ta_pixel_pair
        bytes_per_row = this.bytes_per_row,   // Access bytes per row from the object
        dx = Math.abs(x1 - x0),               // Calculate dx
        dy = Math.abs(y1 - y0),               // Calculate dy
        sx = (x0 < x1) ? 1 : -1,              // Set step direction for x
        sy = (y0 < y1) ? 1 : -1,              // Set step direction for y
        err = dx - dy, e2;                    // Initialize error value and temporary variable e2

    // ... (implementation details)
}
```

### draw_horizontal_line methods
Various optimized implementations for drawing horizontal lines at different bit depths, with special handling for 1bpp formats where bits need to be manipulated individually.

## pixel-buffer-1.2-core-draw-polygon.js

### draw_polygon_1bipp method
```javascript
draw_polygon_1bipp(polygon, stroke_color, fill_color = false) {
    polygon = ensure_polygon_is_ta(polygon);
    if (fill_color === undefined || fill_color === false) {
        // Drawing just the outline
        // ...
    } else {
        if (stroke_color === 1) {
            if (fill_color === 1) {
                // A filled polygon
                // Get filled polygon x-spans
                // Draw those x-spans.
                return this.draw_color_1_filled_polygon_1bipp(polygon);
            } else if (fill_color === 0) {
                // Needs to be filled with the color 0.
                // So basically need to get the outline and the inner shapes, draw them separately.
                // Need to get the inner part x-spans.
                console.trace();
                throw 'NYI';
            }
        } else {
            // Various combinations of stroke and fill colors
            // ...
        }
    }
}
```

### Polygon drawing implementations 
Comments throughout the polygon drawing code discuss various strategies for efficiently filling polygons, including scanline-based approaches and optimization for different bit depths.

## pixel-buffer-1.5-core-mask.js

### draw_1bipp_pixel_buffer_mask_1bipp method
```javascript
'draw_1bipp_pixel_buffer_mask_1bipp'(pb_1bipp_mask, dest_pos, color) {
    // Implementation strategies:
    
    const arr_on_xspans_implementation = () => {
        // Getting it as an arr_rows_arr_x_on_spans representation using a class could help.
        // Or the 'other representaion' type class.
        // May be able to have a faster internal algorithm for that.
        // Maybe a typed array backed class? Maybe a typed array.
        
        const arr_rows_arr_on_xspans = pb_1bipp_mask.calculate_arr_rows_arr_x_on_spans_1bipp();
        // ... implementation ...
    }
    
    function draw_bitmap(target, target_width, source, source_width, source_height, target_x, target_y) {
        // Compute bytes per row using bitwise math
        const target_bytes_per_row = (target_width + 7) >> 3;
        const source_bytes_per_row = (source_width + 7) >> 3;
        
        // ... implementation ...
        
        // Handle unaligned case
        // Shifting and bit manipulation logic
        // ...
    }
    
    const chatgpto1_draw_bitmap_implementation = () => {
        draw_bitmap(this.ta, this.size[0], pb_1bipp_mask.ta, pb_1bipp_mask.size[0], pb_1bipp_mask.size[1], dest_pos[0], dest_pos[1]);
    }
    
    const bit_realigned_64_bit_implementation = () => {
        // A realigned 64-bit optimized implementation
        // May need to increase row lengths to make it possible
        // Both for the source and the dest
        // ...
    }
    
    // approach_selecting - determines the best implementation based on conditions
    const approach_selecting = () => {
        const can_do_bit_realigned_64_bit = test_can_do_bit_realigned_64_bit();
        if (can_do_bit_realigned_64_bit) {
            return arr_on_xspans_implementation();
            //return bit_realigned_64_bit_implementation();
        } else {
            return arr_on_xspans_implementation();
        }
    }
    
    //return approach_selecting();
    //return arr_on_xspans_implementation();
    return chatgpto1_draw_bitmap_implementation();
}
```

### mask_each_pixel method
```javascript
mask_each_pixel(cb_pixel) {
    const bipp = this.bits_per_pixel;
    let i_byte = 0;
    let i_px = 0;
    const bypp = this.bytes_per_pixel;
    const ta = this.ta;
    const l = ta.length;

    const res_mask = new this.constructor({
        size: this.size,
        bits_per_pixel: 1
    });

    if (bipp === 1) {
        console.trace();
        throw 'NYI';
    } else if (bipp === 8) {
        console.trace();
        throw 'NYI';
    } else if (bipp === 24 || bipp === 32) {
        while (i_byte < l) {
            // get the subarray of each pixel
            const ta_sub = ta.slice(i_byte, i_byte + bypp);
            const px_on = cb_pixel(ta_sub) ? 1 : 0;
            res_mask.set_pixel_by_idx(i_px, px_on);
            i_byte += bypp;
            i_px++;
        }
    }
    
    return res_mask;
}
```

## pixel-buffer-2-core-reference-implementations.js

### each_pixel method
```javascript
each_pixel(callback) {
    // Want optimised but still idiomatic
    const {ta_pos_scratch, bipp, bypp, size, ta} = this;

    // And a ta_color_scratch perhaps?
    // ta_24bipp_color_scratch maybe...
    // ta_rgb or ta_rgba?
    // number of bits makes more sense. more flexible.

    // Could call each_pixel_pos, and increment a byte index.
    // read_bit_from_byte
    //const bfb = (byte, bit_index) => (byte >> bit_index) & 1;

    if (bipp === 1) {
        // Should not be too hard to implement....
        //let i_pixel = 0;
        // and the number of pixels....
        const [w, h] = size;
        // ... implementation ...
    } else if (bipp === 8) {
        // Function to iterate through positions could work.
        // Nested for loops seems a bit simpler...
        // ... implementation ...
    } else if (bipp === 24) {
        // Provide direct access with a subarray?
        // Could be better for idiomatic writing.
        // Though setting values would maybe / likely be quicker and mean less allocations.
        // ... implementation ...
    } else if (bipp === 32) {
        // ... implementation ...
    }
    // Could advance through the positions?
    // Advancing through bit indexes.
}
```

### paint_solid_border method
```javascript
'paint_solid_border'(thickness, color) {
    // separate methods for different bipps, this fn chooses one?

    return this.process((me, res) => {
        // Implementation that handles different bit depths
        // ...
    })
}
```

## pixel-buffer-3-core.js

### new_convolved method
```javascript
new_convolved(convolution) {
    const res = this.blank_copy();
    const xy_conv_center = convolution.xy_center;
    const edge_distances_from_center_px_edge = new Int16Array(4);
    edge_distances_from_center_px_edge[0] = xy_conv_center[0] * -1;
    edge_distances_from_center_px_edge[1] = xy_conv_center[1] * -1;
    edge_distances_from_center_px_edge[2] = edge_distances_from_center_px_edge[0] + convolution.size[0] - 1;
    edge_distances_from_center_px_edge[3] = edge_distances_from_center_px_edge[1] + convolution.size[1] - 1;
    
    const pb_window = this.new_window({
        size: convolution.size,
        pos_bounds: [edge_distances_from_center_px_edge[0], edge_distances_from_center_px_edge[1], this.size[0] - edge_distances_from_center_px_edge[2], this.size[1] - edge_distances_from_center_px_edge[3]],
        pos: [edge_distances_from_center_px_edge[0], edge_distances_from_center_px_edge[1]]
    });
    
    // Process the convolution window
    // ...
    
    return res;
}
```

### new_resized method
```javascript
new_resized(size) {
    const dest = new this.constructor({
        size: size,
        bits_per_pixel: this.bipp
    });
    resize_ta_colorspace(this.ta, this.ta_colorspace, dest.size, dest.ta);
    return dest;
}
```

### get_1bipp_threshold_8bipp method
```javascript
get_1bipp_threshold_8bipp(ui8_threshold) {
    const bipp = this.bits_per_pixel;
    if (bipp === 8) {
        const res = new this.constructor({
            bits_per_pixel: 1,
            size: this.size
        });
        const rta = res.ta;
        const ta = this.ta;
        const cpx = this.num_px;
        let i_px = 0;
        let i_dest_byte = 0, i_dest_bit = 7;
        let meets_threshold = false;
        let out_byte = 0;
        
        while (i_px < cpx) {
            meets_threshold = ta[i_px] >= ui8_threshold;
            if (meets_threshold) {
                out_byte = out_byte | Math.pow(2, i_dest_bit)
            } else {
            }
            i_px++;
            i_dest_bit--;
            if (i_dest_bit === -1) {
                rta[i_dest_byte] = out_byte;
                i_dest_bit = 7;
                i_dest_byte++;
                out_byte = 0;
            }
        }
        return res;
    } else {
        console.trace();
        throw 'get_1bipp_threshold_8bipp: Unsupported bits_per_pixel ' + bipp;
    }
}
```

### to_8bipp and to_24bipp methods
Methods for converting between different bit depths with appropriate comments about implementation strategies.

## pixel-buffer-4-advanced-typedarray-properties.js

Only imports lang-mini in the provided excerpt.

## pixel-buffer-5-idiomatic-enh.js

This file appears to contain enhanced implementations focused on idiomatic, readable code.

## pixel-buffer-6-perf-focus-enh.js

This file contains performance-focused implementations with detailed comments about optimization strategies.

### MinHeap class
An auxiliary class used for efficient polygon operations.

### byte masks
Contains commented code showing byte masks for different bit operations.

### UI64 methods
Comments about handling 64-bit operations for better performance.

## pixel-buffer-7-specialised-enh.js

Only brief import statements are visible in the provided excerpt.

## pixel-buffer-8-enh.js

Empty file.

## pixel-buffer.js

Empty file.

## pixel-buffer-painter.js

Empty file.

## Common Themes Across All Files

1. **Bit-level manipulation strategies**
   - Extensive comments about bit operations for 1bipp formats
   - Multiple approaches for handling different alignment scenarios
   - Bitwise operators extensively used with explanatory comments

2. **Performance optimization**
   - Comments frequently discuss trade-offs between readability and performance
   - Multiple implementation strategies with notes about when each is most appropriate
   - Specialized handling for different bit depths to maximize efficiency

3. **Data structure design considerations**
   - Notes about typed arrays and optimized memory usage
   - Discussion of alternative representations (X-Spans vs. pixel buffers)
   - Comments about API design and interface considerations

4. **Development planning**
   - Detailed roadmap with complexity estimates for different features
   - Task categorization system for estimating development effort
   - "NYI" (Not Yet Implemented) markers with notes about planned functionality
