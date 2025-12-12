# API Reference

## Table of Contents

- [Pixel_Buffer Class](#pixel_buffer-class)
- [Rectangle Class](#rectangle-class)
- [Polygon Class](#polygon-class)
- [Convolution Classes](#convolution-classes)
- [ta_math Module](#ta_math-module)

---

## Pixel_Buffer Class

The main class for pixel manipulation and image processing.

### Constructor

```javascript
const pb = new Pixel_Buffer(spec);
```

#### Parameters

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `size` | `Array[2]` | Required | Width and height `[w, h]` |
| `bits_per_pixel` | `Number` | `32` | Color depth: `1`, `8`, `24`, or `32` |
| `bytes_per_pixel` | `Number` | - | Alternative to bits_per_pixel |
| `buffer` | `TypedArray` | - | Pre-existing buffer data |
| `ta` | `TypedArray` | - | Alias for buffer |
| `color` | `Array` | - | Initial fill color |
| `window_to` | `Pixel_Buffer` | - | Source buffer for windowing |
| `pos` | `Int16Array[2]` | `[0,0]` | Position within source |
| `pos_bounds` | `Int16Array[4]` | - | Iteration bounds |

#### Examples

```javascript
// 24-bit RGB buffer
const pb_rgb = new Pixel_Buffer({
    size: [800, 600],
    bits_per_pixel: 24
});

// 1-bit monochrome buffer
const pb_mono = new Pixel_Buffer({
    size: [1024, 768],
    bits_per_pixel: 1
});

// 8-bit grayscale with initial color
const pb_gray = new Pixel_Buffer({
    size: [256, 256],
    bits_per_pixel: 8,
    color: 128
});

// 32-bit RGBA
const pb_rgba = new Pixel_Buffer({
    size: [640, 480],
    bits_per_pixel: 32,
    color: [255, 255, 255, 255]
});
```

---

### Properties

#### Read-Only Properties

| Property | Type | Description |
|----------|------|-------------|
| `ta` | `Uint8Array` | The underlying typed array buffer |
| `buffer` | `Uint8Array` | Alias for `ta` |
| `size` | `Int16Array[2]` | Dimensions `[width, height]` |
| `bits_per_pixel` / `bipp` | `Number` | Bits per pixel |
| `bytes_per_pixel` / `bypp` | `Number` | Bytes per pixel |
| `bytes_per_row` / `bypr` | `Number` | Bytes per row |
| `num_px` | `Number` | Total number of pixels |
| `meta` | `Object` | Metadata object with size, bipp, bypp, bypr |
| `pos_bounds` | `Int16Array[4]` | Position bounds for iteration |
| `size_bounds` | `Int16Array[4]` | `[0, 0, width, height]` |
| `bounds_within_source` | `Int16Array[4]` | Bounds when used as window |

#### Readable/Writable Properties

| Property | Type | Description |
|----------|------|-------------|
| `pos` | `Int16Array[2]` | Position `[x, y]` |
| `source` | `Pixel_Buffer` | Source buffer for windowing |

---

### Pixel Operations

#### get_pixel(pos)

Get the color value at a position.

```javascript
const pos = new Int16Array([100, 50]);
const color = pb.get_pixel(pos);
// 1bipp: returns 0 or 1
// 8bipp: returns 0-255
// 24bipp: returns Uint8Array[3] [r, g, b]
// 32bipp: returns Uint8Array[4] [r, g, b, a]
```

#### set_pixel(pos, color)

Set the color value at a position.

```javascript
// 1bipp
pb.set_pixel(new Int16Array([10, 20]), 1);

// 8bipp
pb.set_pixel(new Int16Array([10, 20]), 128);

// 24bipp
pb.set_pixel(new Int16Array([10, 20]), new Uint8ClampedArray([255, 0, 0]));

// 32bipp
pb.set_pixel(new Int16Array([10, 20]), new Uint8ClampedArray([255, 0, 0, 255]));
```

#### Bit-Depth Specific Methods

```javascript
// 1bipp specific
pb.set_pixel_on_1bipp(pos);           // Set pixel to 1
pb.set_pixel_off_1bipp(pos);          // Set pixel to 0
pb.set_pixel_1bipp(pos, color);       // Set to 0 or 1
pb.get_pixel_1bipp(pos);              // Get 0 or 1

// 8bipp specific
pb.set_pixel_8bipp(pos, value);       // value: 0-255
pb.get_pixel_8bipp(pos);              // Returns 0-255

// 24bipp specific
pb.set_pixel_24bipp(pos, rgb);        // rgb: Uint8Array[3]
pb.get_pixel_24bipp(pos);             // Returns Uint8Array[3]

// 32bipp specific
pb.set_pixel_32bipp(pos, rgba);       // rgba: Uint8Array[4]
pb.get_pixel_32bipp(pos);             // Returns Uint8Array[4]
```

#### Index-Based Pixel Access

```javascript
// By pixel index (row-major order)
const idx = y * width + x;
pb.set_pixel_by_idx(idx, color);
const color = pb.get_pixel_by_idx(idx);

// Bit-depth specific
pb.set_pixel_by_idx_1bipp(idx, value);
pb.set_pixel_by_idx_8bipp(idx, value);
pb.set_pixel_by_idx_24bipp(idx, rgb);
pb.set_pixel_by_idx_32bipp(idx, rgba);
```

---

### Drawing Operations

#### draw_line(pos1, pos2, color)

Draw a line using Bresenham's algorithm.

```javascript
const start = [10, 10];
const end = [200, 150];
const color = new Uint8ClampedArray([255, 0, 0]);
pb.draw_line(start, end, color);
```

#### draw_horizontal_line(xspan, y, color)

Draw an optimized horizontal line.

```javascript
const xspan = [10, 200]; // [x_start, x_end] inclusive
const y = 100;
pb.draw_horizontal_line(xspan, y, color);
```

#### draw_polygon(points, color, fill?, stroke_color?)

Draw a polygon outline or filled.

```javascript
const polygon = [[100, 100], [200, 100], [200, 200], [100, 200]];
const color = new Uint8ClampedArray([0, 255, 0]);

// Outline only
pb.draw_polygon(polygon, color, false);

// Filled polygon
pb.draw_polygon(polygon, color, true);

// Filled with different stroke
pb.draw_polygon(polygon, fill_color, true, stroke_color);
```

#### draw_rect(pos_corner, pos_other_corner, color)

Draw a filled rectangle.

```javascript
pb.draw_rect([10, 10], [100, 100], color);
```

---

### Iteration Methods

#### each_px(ta_pos, ta_px_value, ta_info, callback)

Iterate over all pixels with typed array parameters.

```javascript
const ta_pos = new Int32Array(2);
const ta_px_value = new Uint8ClampedArray(3);
const ta_info = new Uint32Array(4);

pb.each_px(ta_pos, ta_px_value, ta_info, (update) => {
    // ta_pos: current position [x, y]
    // ta_px_value: current pixel color
    // ta_info: [width, height, pixel_index, bipp]

    // Modify ta_px_value, then call update() to write changes
    ta_px_value[0] = 255; // Set red channel
    update();
});
```

#### each_pixel_pos(callback)

Iterate over all pixel positions.

```javascript
pb.each_pixel_pos((pos, stop) => {
    // pos: Int16Array[2] - current position
    // stop: function to stop iteration early
    console.log(`Pixel at ${pos[0]}, ${pos[1]}`);
});
```

#### each_pixel_byte_index(callback)

Iterate by byte index.

```javascript
pb.each_pixel_byte_index((byte_idx, stop) => {
    // byte_idx: byte offset in buffer
    const value = pb.ta[byte_idx];
});
```

#### each_pos_within_bounds(callback)

Iterate within defined position bounds.

```javascript
pb.pos_bounds = [10, 10, 100, 100];
pb.each_pos_within_bounds(() => {
    // Uses pb.pos, automatically copies from source if windowed
});
```

---

### Transformation Methods

#### clone()

Create a deep copy.

```javascript
const copy = pb.clone();
```

#### blank_copy()

Create a same-size copy filled with zeros.

```javascript
const blank = pb.blank_copy();
```

#### color_whole(color)

Fill entire buffer with a single color.

```javascript
// 8bipp
pb.color_whole(128);

// 24bipp
pb.color_whole([255, 0, 0]);

// 32bipp
pb.color_whole([255, 0, 0, 255]);
```

#### crop(size)

Create a cropped copy.

```javascript
const cropped = pb.crop(10); // Remove 10 pixels from all edges
```

#### uncrop(size, color)

Add padding around the image.

```javascript
const padded = pb.uncrop(10, [0, 0, 0]); // Add 10px black border
```

---

### Colorspace Conversion

#### to_8bipp()

Convert to 8-bit grayscale.

```javascript
const grayscale = pb.to_8bipp();
```

#### to_24bipp()

Convert to 24-bit RGB.

```javascript
const rgb = pb.to_24bipp();
```

#### to_8bit_greyscale()

Convert to 8-bit grayscale (alias).

```javascript
const gray = pb.to_8bit_greyscale();
```

#### to_32bit_rgba()

Convert to 32-bit RGBA.

```javascript
const rgba = pb.to_32bit_rgba();
```

#### add_alpha_channel()

Add alpha channel (24bipp -> 32bipp).

```javascript
const with_alpha = pb.add_alpha_channel();
```

#### get_1bipp_threshold_8bipp(threshold)

Convert 8bipp to 1bipp using threshold.

```javascript
const binary = pb_8bipp.get_1bipp_threshold_8bipp(128);
// Pixels >= 128 become 1, others become 0
```

---

### Channel Operations

#### split_rgb_channels

Split into separate R, G, B buffers.

```javascript
const [r_channel, g_channel, b_channel] = pb.split_rgb_channels;
// Each is an 8bipp Pixel_Buffer
```

---

### Windowing Operations

Windows allow viewing/operating on a portion of another buffer.

#### new_window(options)

Create a window into this buffer.

```javascript
const window = pb.new_window({
    size: [3, 3],
    pos: [100, 100]
});
// window.ta contains a copy of the 3x3 region
```

#### copy_from_source()

Copy pixel data from the source buffer.

```javascript
window.pos[0] = 150;
window.pos[1] = 150;
window.copy_from_source(); // Updates window.ta with new region
```

#### move(vector)

Move window position by a vector.

```javascript
window.move(new Int16Array([1, 0])); // Move right 1 pixel
// Automatically copies from source
```

#### move_next_px()

Move to next pixel position (row-major).

```javascript
while (window.move_next_px()) {
    // Process each position
}
```

---

### Convolution Operations

#### new_convolved(convolution)

Create a new convolved buffer.

```javascript
const Float32Convolution = require('jsgui3-gfx-core/core/convolution');
const kernels = require('jsgui3-gfx-core').convolution_kernels;

const conv = new Float32Convolution({
    size: [3, 3],
    value: kernels.edge
});

const edge_detected = pb.new_convolved(conv);
```

#### blur(size?, sigma?)

Apply Gaussian blur.

```javascript
const blurred = pb.blur(5, 2); // 5x5 kernel, sigma=2
```

---

### Resize Operations

#### new_resized(size)

Create a resized copy.

```javascript
const resized = pb.new_resized([1920, 1080]);
```

---

### Comparison & Analysis

#### equals(other)

Compare two buffers for equality.

```javascript
const are_equal = pb1.equals(pb2);
```

#### count_colors()

Count unique colors in the buffer.

```javascript
const num_colors = pb.count_colors();
```

#### count_pixels_with_color(color)

Count pixels matching a specific color.

```javascript
const red_count = pb.count_pixels_with_color([255, 0, 0]);
```

---

### X-Span Operations (1bipp)

X-spans represent horizontal runs of same-color pixels, useful for efficient fill operations.

#### calculate_arr_rows_arr_x_on_spans_1bipp()

Get array of on-pixel spans per row.

```javascript
const spans = pb.calculate_arr_rows_arr_x_on_spans_1bipp();
// Returns: [[row0_spans], [row1_spans], ...]
// Each span: [x_start, x_end] inclusive
```

#### calculate_arr_rows_arr_x_off_spans_1bipp()

Get array of off-pixel spans per row.

```javascript
const off_spans = pb.calculate_arr_rows_arr_x_off_spans_1bipp();
```

---

### Bitmap Masking

#### draw_1bipp_pixel_buffer_mask(mask, dest_pos, color)

Draw a 1bipp buffer as a mask at a position.

```javascript
const mask = new Pixel_Buffer({ size: [50, 50], bits_per_pixel: 1 });
// ... fill mask with pattern ...
pb.draw_1bipp_pixel_buffer_mask(mask, [100, 100], [255, 0, 0]);
```

---

## Rectangle Class

Geometric rectangle representation.

### Constructor

```javascript
const rect = new Rectangle([width, height], [x, y]);
```

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `x` | `Number` | Left edge X coordinate |
| `y` | `Number` | Top edge Y coordinate |
| `w` / `width` | `Number` | Width |
| `h` / `height` | `Number` | Height |
| `left` | `Number` | Left edge (same as x) |
| `top` | `Number` | Top edge |
| `right` | `Number` | Right edge (x + width) |
| `bottom` | `Number` | Bottom edge |
| `size` | `Array[2]` | `[width, height]` |
| `pos` | `Array[2]` | `[x, y]` |

### Methods

#### extend(direction, pixels)

Extend the rectangle in a direction.

```javascript
rect.extend('left', 50);   // Extend left by 50px
rect.extend('right', 50);  // Extend right
rect.extend('up', 50);     // Extend upward
rect.extend('down', 50);   // Extend downward
```

#### overlaps(target)

Check for overlap with another rectangle or control.

```javascript
const overlap = rect1.overlaps(rect2);
// Returns: Rectangle of overlap area, or false
```

---

## Polygon Class

Polygon shape representation and operations.

### Constructor

```javascript
// From array of points
const polygon = new Polygon([[x1, y1], [x2, y2], [x3, y3], ...]);

// From typed array (x, y pairs)
const polygon = new Polygon(new Uint32Array([x1, y1, x2, y2, ...]));
```

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `ta_points` | `Uint32Array` | Points as `[x1, y1, x2, y2, ...]` |
| `ta_bounding_box` | `Uint32Array[4]` | `[min_x, min_y, max_x, max_y]` |
| `offset` | `Uint32Array[2]` | Position offset |
| `scanline_edges` | `Polygon_Scanline_Edges` | For scanline rendering |

### Methods

#### downshifted()

Create a copy translated to origin (0,0).

```javascript
const ds_polygon = polygon.downshifted();
// ds_polygon.offset contains original position
```

#### Static: Polygon.ensure_is(obj)

Ensure object is a Polygon instance.

```javascript
const polygon = Polygon.ensure_is(points_array);
```

---

## Convolution Classes

### Float32Convolution

```javascript
const conv = new Float32Convolution({
    size: [3, 3],
    value: new Float32Array([...9 values...])
});
```

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `size` | `Uint16Array[2]` | Kernel dimensions |
| `num_px` | `Number` | Total kernel elements |
| `xy_center` | `Int16Array[2]` | Center position |
| `ta` | `Float32Array` | Kernel values |

### Methods

#### calc_from_8bipp_ta(ta)

Calculate convolution result from 8bipp data.

```javascript
const result = conv.calc_from_8bipp_ta(pixel_window_ta);
// Returns: Number (0-255)
```

#### calc_from_24bipp_ta(ta, ta_res?)

Calculate convolution for 24bipp (RGB).

```javascript
const rgb_result = conv.calc_from_24bipp_ta(pixel_window_ta);
// Returns: Uint8ClampedArray[3]
```

### Pre-defined Kernels

```javascript
const kernels = require('jsgui3-gfx-core').convolution_kernels;

kernels.edge;           // Edge detection
kernels.sobel_x;        // Sobel X gradient
kernels.sobel_y;        // Sobel Y gradient
kernels.sobel_diag_1;   // Diagonal Sobel
kernels.sobel_diag_2;   // Other diagonal
kernels.lap_gauss_5;    // Laplacian of Gaussian
kernels.gauss_blur_5_2; // 5x5 Gaussian, sigma=2
kernels.gauss_blur_5_5; // 5x5 Gaussian, sigma=5
kernels.get_gauss(d, sigma); // Generate custom Gaussian
```

---

## ta_math Module

TypedArray mathematical operations.

### Import

```javascript
const { ta_math } = require('jsgui3-gfx-core');
// or
const ta_math = require('jsgui3-gfx-core/core/ta-math');
```

### Sub-modules

- `ta_math.copy` - Copy operations
- `ta_math.read` - Read operations
- `ta_math.write` - Write operations
- `ta_math.draw` - Drawing operations
- `ta_math.bitwise` - Bitwise operations
- `ta_math.transform` - Transformation operations
- `ta_math.info` - Information/utility functions

### Key Functions

#### Copy Operations

```javascript
ta_math.copy_rect_to_same_size_8bipp(src, dest, ...);
ta_math.copy_rect_to_same_size_24bipp(src, dest, ...);
ta_math.copy_ta_byte_range(src, dest, start, length);
ta_math.dest_aligned_copy_rect_1to4bypp(src, dest, ...);
```

#### Read Operations

```javascript
ta_math.read_px(ta, idx, bipp);
ta_math.read_1x2_rect(ta, ...);
ta_math.read_2x1_rect(ta, ...);
ta_math.read_2x2_rect(ta, ...);
```

#### Write Operations

```javascript
ta_math.fill_solid_rect_by_bounds(ta, bypr, bounds, bipp, color);
```

#### Transform Operations

```javascript
ta_math.resize_ta_colorspace(src_ta, src_colorspace, dest_size, dest_ta);
```

#### Bitwise Operations

```javascript
ta_math.get_bit(ta, bit_idx);
ta_math.right_shift_32bit_with_carry(ta, ...);
ta_math.xor_typed_arrays(ta1, ta2);
ta_math.each_1_index(ta, callback);
ta_math.count_1s(ta);
ta_math.get_ta_bits_that_differ_from_previous_as_1s(ta);
ta_math.fast_find_next_set_ta_bit(ta, start, limit);
```

#### Draw Operations

```javascript
ta_math.draw_polygon_outline_to_ta_1bipp(ta, width, polygon);
ta_math.ensure_polygon_is_ta(polygon);
ta_math.calc_polygon_stroke_points_x_y(polygon);
```

#### Info Operations

```javascript
ta_math.overlapping_bounds(bounds1, bounds2);
```
