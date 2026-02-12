# Chapter 4: Pixel Buffer API Reference

This chapter is a comprehensive reference for all methods available on a `Pixel_Buffer` instance. Methods are grouped by category and listed with their origin layer.

## Construction

### `new Pixel_Buffer(spec)`

Creates a new pixel buffer.

**Required spec properties:**
- `bits_per_pixel` — `1`, `8`, `24`, or `32`
- `size` — `[width, height]` as Array or Int16Array

**Optional:**
- `ta` — Provide an existing `Uint8Array` of the correct length

```js
// Standard construction
const pb = new Pixel_Buffer({ bits_per_pixel: 24, size: [640, 480] });

// Copy construction from another pixel buffer
const pb2 = new Pixel_Buffer(existing_pb);

// With pre-existing data
const pb3 = new Pixel_Buffer({
    bits_per_pixel: 8,
    size: [100, 100],
    ta: my_uint8_array
});
```

## Properties

| Property | Type | Description | Mutable |
|----------|------|-------------|---------|
| `ta` | `Uint8Array` | Raw pixel data | Read/Write |
| `size` | `Int16Array(2)` | `[width, height]` | Special* |
| `bipp` / `bits_per_pixel` | `Number` | Bits per pixel (1, 8, 24, 32) | Special* |
| `bypp` | `Number` | Bytes per pixel (0.125, 1, 3, 4) | Read-only |
| `bypr` | `Number` | Bytes per row | Read-only |
| `num_px` | `Number` | Total pixel count (width × height) | Read-only |
| `pos` | `Int16Array(2)` | Current position cursor | Read/Write |
| `pos_bounds` | `Int16Array(4)` | Position bounds `[x1, y1, x2, y2]` | Read/Write |

*Setting `bipp` triggers internal re-allocation. Setting `size` via the constructor only.

### Scratch Arrays (Level 4+)

These are lazily-initialized reusable typed arrays to avoid allocation in hot paths:

| Property | Type | Purpose |
|----------|------|---------|
| `ta_pos_scratch` | `Int16Array(2)` | Reusable position |
| `ta_pos_iterator` | `Int16Array(2)` | Iteration position |
| `ta_scratch` | `Uint8Array` | Scratch for pixel data |
| `ta_bounds_scratch` | `Int16Array(4)` | Reusable bounds |

## Pixel Get/Set (Level 1)

### `get_pixel(pos)` / `set_pixel(pos, color)`

Generic versions that dispatch based on `bipp`:

```js
const pos = new Int16Array([10, 20]);

// Get pixel — returns Number (1/8bipp) or Uint8Array (24/32bipp)
const color = pb.get_pixel(pos);

// Set pixel
pb.set_pixel(pos, [255, 128, 0]);  // 24bipp
pb.set_pixel(pos, 200);            // 8bipp
pb.set_pixel(pos, 1);              // 1bipp
```

### Typed Variants (Faster)

For performance-critical code, use the bipp-specific methods directly:

```js
// 1bipp
pb.set_pixel_on_1bipp(pos);     // Set bit to 1
pb.set_pixel_off_1bipp(pos);    // Set bit to 0
pb.set_pixel_1bipp(pos, 1);     // Set to 0 or 1
pb.get_pixel_1bipp(pos);        // Returns 0 or 1

// 8bipp
pb.set_pixel_8bipp(pos, 128);
pb.get_pixel_8bipp(pos);        // Returns Number 0-255

// 24bipp
pb.set_pixel_24bipp(pos, [r, g, b]);
pb.get_pixel_24bipp(pos);       // Returns Uint8Array(3)

// 32bipp
pb.set_pixel_32bipp(pos, [r, g, b, a]);
pb.get_pixel_32bipp(pos);       // Returns Uint8Array(4)
```

### Index-based Access

Instead of `[x, y]` position, use a flat pixel index:

```js
pb.set_pixel_by_idx(idx, color);
pb.get_pixel_by_idx(idx);

// bipp-specific
pb.set_pixel_by_idx_8bipp(idx, 200);
pb.get_pixel_by_idx_1bipp(idx);
```

### XY-based 1bipp Access

```js
pb.set_pixel_on_1bipp_xy(x, y);
pb.set_pixel_on_1bipp_by_pixel_index(pixel_index);
pb.set_pixel_off_1bipp_by_pixel_index(pixel_index);
```

## Iteration (Levels 0, 2, 4, 5)

### `each_pixel(callback)` — Level 2

Iterates over every pixel with position and color:

```js
// callback: (pos, color) => void
pb.each_pixel((pos, color) => {
    // pos: Int16Array [x, y]
    // color: depends on bipp
});
```

### `each_pixel_pos(callback)` — Level 5

Iterates positions only (faster when you don't need color):

```js
pb.each_pixel_pos((pos, stop) => {
    // pos: Int16Array [x, y] (shared scratch)
    // stop: function — call to stop iteration
    if (pos[0] > 50) stop();
});
```

### `each_pixel_byte_index(callback)` — Level 0

Low-level iteration by byte index:

```js
pb.each_pixel_byte_index((byte_index, stop) => {
    pb.ta[byte_index] = 128;
});
```

### `each_px(callback)` — Level 0

Another pixel iteration variant:

```js
pb.each_px((x, y, idx) => {
    // x, y: pixel coordinates
    // idx: pixel index
});
```

### `padded_each_pixel_index(padding, callback)` — Level 7

Iterates pixels within a padded interior region:

```js
pb.padded_each_pixel_index(2, (idx) => {
    // Only called for pixels at least 2 pixels from edges
});
```

## Fill & Color (Levels 2, 3)

### `color_whole(color)` — Level 3

Fills entire buffer with a single color:

```js
pb.color_whole([40, 80, 160]);      // 24bipp
pb.color_whole(128);                 // 8bipp
pb.color_whole(1);                   // 1bipp (all on)
```

### `color_rect(bounds, color)` — Level 3

Fills a rectangular region:

```js
const bounds = new Int16Array([10, 10, 100, 80]); // [x1, y1, x2, y2]
pb.color_rect(bounds, [255, 0, 0]);
```

### `fill_solid_rect_by_bounds()` — Level 7

Lower-level rect fill (typically called through painter or internally).

## Drawing (Levels 1.1, 1.2, 5)

### `draw_line_1bipp(ta_pixel_pair, color)` — Level 1.1

Draws a line on a 1bipp buffer:

```js
const endpoints = new Int16Array([x1, y1, x2, y2]);
pb.draw_line_1bipp(endpoints, 1);
```

### `draw_x_span_on_1bipp(x, y, length)` — Level 1.1

Draws a horizontal span:

```js
pb.draw_x_span_on_1bipp(10, 50, 200);
```

### `draw_polygon_1bipp(polygon, stroke_color, fill_color)` — Level 1.2

Draws and optionally fills a polygon:

```js
const Polygon = require('jsgui3-gfx-core/core/shapes/Polygon');
const polygon = new Polygon([[10,10], [100,20], [80,90], [5,70]]);
pb.draw_polygon_1bipp(polygon, 1, 1);
```

### `draw_rect(pos_corner, pos_other_corner, color)` — Level 2

Draws a rectangle outline:

```js
pb.draw_rect([10, 10], [100, 80], [255, 0, 0]);
```

### `paint_pixel_list(pixel_pos_list, color)` — Level 0

Paints all pixels in a `Pixel_Pos_List`:

```js
pb.paint_pixel_list(my_pixel_list, [255, 255, 0]);
```

## Convolution & Image Processing (Levels 3, 5, 6)

### `new_convolved(convolution)` — Level 3

Creates a new pixel buffer by applying a convolution:

```js
const Float32Convolution = require('jsgui3-gfx-core/core/convolution');
const conv = new Float32Convolution({
    size: [3, 3],
    value: [0, -1, 0, -1, 5, -1, 0, -1, 0]
});
const result = pb.new_convolved(conv);
```

### `apply_square_convolution(f32a_kernel)` — Level 6

Applies a square convolution kernel (works directly with Float32Array):

```js
const { convolution_kernels } = require('jsgui3-gfx-core');
const edges = pb.apply_square_convolution(
    new Float32Array(convolution_kernels.edge)
);
```

### `blur(size, sigma)` — Level 5

Gaussian blur shorthand:

```js
const blurred = pb.blur(5, 2);  // 5×5 kernel, σ=2
```

### `extract_channel(i_channel)` — Level 6

Extracts a single color channel as an 8bipp buffer:

```js
const red_channel = pb.extract_channel(0);   // 0=R, 1=G, 2=B
```

## Color Format Conversion (Levels 2, 3, 7)

### `to_8bipp()` — Convert to greyscale
### `to_24bipp()` — Convert to RGB
### `to_32bit_rgba()` — Convert to RGBA (add alpha)
### `get_1bipp_threshold_8bipp(threshold)` — Threshold to binary

```js
const grey = rgb_pb.to_8bipp();
const rgb = grey_pb.to_24bipp();
const rgba = rgb_pb.to_32bit_rgba();
const mask = grey_pb.get_1bipp_threshold_8bipp(128);
```

### `threshold_gs(value)` — Level 7

In-place greyscale threshold:

```js
pb.threshold_gs(128);  // Pixels ≥ 128 → 255, else → 0
```

## Clone, Copy, Crop (Levels 2, 7)

### `clone()` — Deep copy
### `blank_copy()` — Same dimensions, zeroed data

```js
const copy = pb.clone();
const blank = pb.blank_copy();
```

### `crop(size)` — Crop from top-left
### `uncrop(size, color)` — Expand with fill color

```js
const cropped = pb.crop([50, 50]);
const uncropped = pb.uncrop([200, 200], [0, 0, 0]);
```

### `copy_rect_by_bounds_to(bounds, target_pb)` — Level 3

Copies a rectangular region to another pixel buffer:

```js
const bounds = new Int16Array([0, 0, 50, 50]);
pb.copy_rect_by_bounds_to(bounds, target_pb);
```

### `copy_from_source()` — Level 7

For windowed pixel buffers, copies data from the source buffer.

## Analysis & Queries (Levels 0, 5, 6)

### `count_colors()` — Level 5

Returns the number of unique colors:

```js
const n = pb.count_colors();
```

### `count_pixels_with_color(color)` — Levels 5 & 6

Counts pixels matching a specific color:

```js
const red_count = pb.count_pixels_with_color([255, 0, 0]);
```

### `equals(other_pb)` — Level 0

Checks byte-level equality:

```js
if (pb1.equals(pb2)) { ... }
```

### `get_first_pixel_matching_color(r, g, b, a)` — Level 6

Returns the position of the first pixel matching the given color:

```js
const pos = pb.get_first_pixel_matching_color(255, 0, 0);
```

### `self_replace_color(target, replacement)` — Level 6

Replaces all occurrences of one color with another in-place:

```js
pb.self_replace_color([255, 0, 0], [0, 255, 0]);  // Red → Green
```

## RGB Channel Operations (Level 0)

### `split_rgb_channels()`

Splits a 24bipp buffer into three 8bipp buffers:

```js
const [r, g, b] = pb.split_rgb_channels();
// Each is an 8bipp Pixel_Buffer
```

## Mask Operations (Level 1.5)

### `apply_mask(pb_mask, r, g, b, a)`

Applies a 1bipp mask buffer, coloring masked pixels:

```js
pb.apply_mask(mask_pb, 255, 0, 0, 255);
```

### `mask_each_pixel(callback)`

Iterates pixels of a 1bipp mask:

```js
mask.mask_each_pixel((x, y, is_on) => {
    if (is_on) { ... }
});
```

### `draw_1bipp_pixel_buffer_mask(pb_mask, color)` — Level 2

Draws a colored mask onto this buffer.

## Windowing (Level 7)

### `new_window(options)` / `new_centered_window(size)`

Creates a pixel buffer that references a region of this buffer:

```js
const window = pb.new_window({ size: [32, 32], pos: [10, 10], source: pb });
const centered = pb.new_centered_window([5, 5]);
```

## Flood Fill (Level 6)

Multiple flood fill implementations, selected by approach:

```js
// Using typed array stack with visited matrix
pb.using_ta_pixels_visited();

// Horizontal line filling (fastest for typical cases)
pb.horizontal_line_filling_stack_to_visit_store_already_visited_implementation();
```

## Serialization (Level 0)

### `toString()`

Returns a text representation of the pixel data.

### `process(fn)`

Applies a function to every byte in the buffer:

```js
pb.process(byte => Math.min(byte + 50, 255)); // Brighten
```

---

**← [Chapter 3: Architecture](./03-architecture.md)** | **[Chapter 5: Drawing →](./05-drawing.md)**
