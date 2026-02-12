# Chapter 10: Dense Agent Reference

> **This chapter is for AI coding agents.** It provides a maximally compressed reference of the entire library in a format optimized for context-window efficiency.

## Exports (gfx-core.js)

```
Pixel_Buffer           — main class, 10-layer hierarchy, all pixel ops
Pixel_Buffer_Painter   — fluent rect drawing wrapper
Pixel_Pos_List         — sparse pixel coordinate storage (Uint16Array backed)
convolution_kernels    — predefined Float32Array/Int8Array kernels
ta_math                — low-level typed array operations
Rectangle / Rect       — rectangle geometry (extend, overlap, intersect)
```

## Pixel_Buffer Construction

```js
new Pixel_Buffer({ bits_per_pixel: 1|8|24|32, size: [w, h] })
new Pixel_Buffer({ bits_per_pixel, size, ta: existing_uint8array })
new Pixel_Buffer(other_pixel_buffer)  // copy constructor
```

## Properties

```
.ta       Uint8Array     raw pixel data
.size     Int16Array(2)  [width, height]
.bipp     Number         bits per pixel (1, 8, 24, 32)
.bypp     Number         bytes per pixel (0.125, 1, 3, 4)
.bypr     Number         bytes per row (width * bypp)
.num_px   Number         total pixel count
.pos      Int16Array(2)  cursor position
```

## Class Hierarchy (files → classes)

```
pixel-buffer-0 → Pixel_Buffer_Core_Inner_Structures     constructor, size, ta, bipp
pixel-buffer-1 → Pixel_Buffer_Core_Get_Set_Pixels       get/set_pixel, *_1bipp, *_8bipp, *_24bipp, *_32bipp
pixel-buffer-1.1 → Pixel_Buffer_Core_Draw_Lines         draw_line_1bipp, draw_x_span_on_1bipp
pixel-buffer-1.2 → Pixel_Buffer_Core_Draw_Polygons      draw_polygon_1bipp, scanline fill
pixel-buffer-1.5 → Pixel_Buffer_Core_Masks              apply_mask, mask_each_pixel, 64-bit aligned ops
pixel-buffer-2 → Pixel_Buffer_Core_Reference_Impls      each_pixel, clone, crop, uncrop, to_8bipp/24bipp
pixel-buffer-3 → Pixel_Buffer_Core                      new_convolved, new_resized, color_whole, color_rect
pixel-buffer-4 → Pixel_Buffer_Advanced_TypedArray_Props  ta_scratch, ta_pos_scratch, ta_bounds_scratch
pixel-buffer-5 → Pixel_Buffer_Idiomatic_Enh             blur, count_colors, each_pixel_pos
pixel-buffer-6 → Pixel_Buffer_Perf_Focus_Enh            apply_square_convolution, flood_fill, extract_channel
pixel-buffer-7 → Pixel_Buffer_Specialised_Enh           copy_from_source, threshold_gs, new_window
pixel-buffer-8 → re-exports 7                           (alias)
pixel-buffer.js → re-exports 8                          (alias)
```

## Method Quick Reference

### Pixel access
```
get_pixel(pos) → color            set_pixel(pos, color)
get_pixel_1bipp(pos) → 0|1       set_pixel_on_1bipp(pos), set_pixel_off_1bipp(pos)
get_pixel_8bipp(pos) → Number    set_pixel_8bipp(pos, val)
get_pixel_24bipp(pos) → Uint8(3) set_pixel_24bipp(pos, [r,g,b])
get_pixel_32bipp(pos) → Uint8(4) set_pixel_32bipp(pos, [r,g,b,a])
set_pixel_by_idx(idx, color)     get_pixel_by_idx(idx)
```

### Iteration
```
each_pixel((pos, color) => {})          all pixels with color
each_pixel_pos((pos, stop) => {})       positions only (fast)
each_pixel_byte_index((bi, stop) => {}) byte index only (fastest)
each_px((x, y, idx) => {})             x, y, pixel index
padded_each_pixel_index(pad, (idx)=>{}) interior pixels only
```

### Fill / Color
```
color_whole(color)                fill entire buffer
color_rect(bounds4, color)        fill rectangular region
```

### Drawing
```
draw_line_1bipp(Int16Array([x1,y1,x2,y2]), color)
draw_x_span_on_1bipp(x, y, length)
draw_polygon_1bipp(polygon, stroke, fill)
draw_rect([x1,y1], [x2,y2], color)
paint_pixel_list(ppl, color)
paint_solid_border(width, color)
```

### Convolution
```
new_convolved(Float32Convolution_instance) → new PB
apply_square_convolution(Float32Array) → new PB
blur(size=3, sigma=2) → new PB
extract_channel(0|1|2) → 8bipp PB
```

### Conversion
```
to_8bipp() → greyscale PB         to_24bipp() → RGB PB
to_32bit_rgba() → RGBA PB         get_1bipp_threshold_8bipp(threshold) → binary PB
threshold_gs(value)                in-place greyscale threshold
```

### Clone / Copy
```
clone() → deep copy               blank_copy() → zeroed same-dim
crop(size) → cropped PB           uncrop(size, color) → expanded PB
copy_rect_by_bounds_to(bounds, target_pb)
```

### Analysis
```
count_colors() → Number
count_pixels_with_color(color) → Number
equals(other_pb) → boolean
get_first_pixel_matching_color(r,g,b,a) → pos
self_replace_color(target, replacement)
split_rgb_channels() → [r_pb, g_pb, b_pb]
```

### Masks (1bipp)
```
apply_mask(mask_pb, r, g, b, a)
draw_1bipp_pixel_buffer_mask(mask_pb, color)
mask_each_pixel((x, y, is_on) => {})
```

### Window / Resize
```
new_resized(new_size) → new PB (area-weighted)
new_window({ size, pos, source }) → windowed PB
new_centered_window(size) → windowed PB
```

## ta_math Sub-modules

```
ta_math.bitwise   xor_typed_arrays, count_1s_in_typed_array, find_first/last_set_bit_index
ta_math.copy      copy_rect_to_same_size_8/24/32bipp
ta_math.draw      draw_polygon_outline_to_ta_1bipp
ta_math.info      ta_bounds_overlap
ta_math.read      read_1x2/2x1/2x2_block_8bipp
ta_math.transform resize (area-weighted), color transforms
ta_math.write     fill_solid_rect_by_bounds
```

## convolution_kernels

```
.edge           Float32Array(9)    3×3 edge detection [-1,-1,-1,-1,8,-1,-1,-1,-1]
.sobel_x        Int8Array(9)       3×3 horizontal Sobel
.sobel_y        Int8Array(9)       3×3 vertical Sobel
.lap_gauss_5    Int8Array(25)      5×5 Laplacian of Gaussian
.gauss_blur_5_2 Float32Array(25)   5×5 Gaussian blur σ=2
.get_gaussian_kernel(diameter, sigma) → Float32Array  generate NxN Gaussian
```

## Pixel_Buffer_Painter

```js
const p = new Pixel_Buffer_Painter({ pb });
p.rect(pos, size, color);  // returns this (chainable)
// Internally: fill_solid_rect_by_bounds(pb.ta, pb.bypr, bounds, pb.bipp, color)
```

## Shapes (internal, require directly)

```
shapes/Rectangle.js              exported as Rectangle/Rect
shapes/Polygon.js                polygon vertices + bounds + edges
shapes/Polygon_Edges.js          sorted edge pairs
shapes/Polygon_Scanline_Edges.js active edges per scanline
shapes/ScanlineProcessor.js      scanline fill driver
shapes/TA_Table_8_Columns.js     typed array table for edge tracking
```

## Byte Index Formulas

```
1bipp:  byte = pixel_index >> 3;  bit = pixel_index & 7
8bipp:  byte = y * width + x
24bipp: byte = (y * width + x) * 3
32bipp: byte = (y * width + x) * 4
bypr:   width * bypp  (bytes per row)
```

## Dependencies

```
lang-mini  — tof(), tf(), each(), get_a_sig(), are_equal(), fp()
obext      — ro(obj, name, getter), prop(obj, name, getter, setter)
fnl        — functional utils (indirect)
```

## Common Patterns

```js
// Load via sharp → process → save
const pb = new Pixel_Buffer({ bits_per_pixel: 24, size: [w, h], ta: new Uint8Array(sharp_buffer) });
const grey = pb.to_8bipp();
const edges = grey.apply_square_convolution(new Float32Array(convolution_kernels.edge));
const binary = edges.get_1bipp_threshold_8bipp(30);
const result = binary.to_24bipp();

// Canvas → PB → process → Canvas
const pb = new Pixel_Buffer({ bits_per_pixel: 32, size: [w, h], ta: new Uint8Array(imageData.data.buffer) });
const blurred = pb.blur(5, 2);
ctx.putImageData(new ImageData(new Uint8ClampedArray(blurred.ta.buffer), w, h), 0, 0);
```
