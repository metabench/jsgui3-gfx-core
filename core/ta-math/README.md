# ta-math Module

Low-level typed-array math utilities for pixel buffer operations. All functions operate directly on `Uint8ClampedArray`, `Int16Array`, `Float32Array`, and related typed arrays to maximize performance and minimize garbage collection.

## Module Structure

| File | Purpose |
|------|---------|
| `bitwise.js` | Bit manipulation, shifting, XOR, population count |
| `copy.js` | Rectangle and byte-range copying between typed arrays |
| `draw.js` | Polygon outline rasterization to 1bipp buffers |
| `info.js` | Bounds calculations and colorspace utilities |
| `read.js` | Pixel/block reading with colorspace support |
| `write.js` | Solid rectangle fills |
| `transform.js` | Image resize (subpixel/superpixel blending) |
| `x_spans.js` | (Stub) X-span list utilities |

---

## bitwise.js

Bit-level operations on typed arrays.

### Key Exports

| Function | Signature | Description |
|----------|-----------|-------------|
| `right_shift_32bit_with_carry` | `(image: Uint8Array) → Uint8Array` | Right-shift entire array by 1 bit with carry propagation across 32-bit chunks |
| `xor_typed_arrays` | `(a, b, res?) → TypedArray` | Element-wise XOR; reuses `res` if provided |
| `each_1_index` | `(ta, cb)` | Iterate bit indexes where value is 1 |
| `count_1s` / `pop_cnt_typed_array` | `(ta) → number` | Count set bits in entire array |
| `get_bit` | `(ta, i) → 0\|1` | Read single bit at index `i` |
| `fast_find_next_set_ta_bit` | `(ta, start, limit?) → number\|false` | Find next set bit after `start` |
| `get_ta_bits_that_differ_from_previous_as_1s` | `(ta_source, bits_per_row, ta_dest?, copy_x0?) → ta_dest` | Edge-detection helper: marks bit transitions |

### Example

```js
const { count_1s, get_bit } = require('./ta-math/bitwise');
const mask = new Uint8Array([0b10101010, 0b11110000]);
console.log(count_1s(mask)); // 8
console.log(get_bit(mask, 0)); // 1
```

---

## copy.js

Rectangle and range copying between typed arrays.

### Key Exports

| Function | Signature | Description |
|----------|-----------|-------------|
| `copy_ta_byte_range` | `(src, dest, srcStart, destStart, len)` | Raw byte copy via `subarray().set()` |
| `copy_rect_to_same_size_8bipp` | `(xy, bounds, ta, ta_res, ta_byte_indexes, row_jump)` | Copy rectangular region (8 bits/pixel) |
| `copy_rect_to_same_size_24bipp` | `(xy, bounds, ta, ta_res, ta_byte_indexes, row_jump)` | Copy rectangular region (24 bits/pixel) |
| `dest_aligned_copy_rect_1to4bypp` | `(ta_src, ta_dest, bypr_src, bypp, bounds)` | Copy when dest size matches bounds |
| `unaligned_copy_rect_1to4bypp` | `(ta_src, ta_dest, bypr_src, bypr_dest, bypp, bounds, dest_pos)` | Copy with arbitrary dest position |
| `copy_px_24bipp` | `(ta_src, byi_read, ta_dest, byi_write)` | Copy single 24bipp pixel |

---

## draw.js

Polygon rasterization utilities.

### Key Exports

| Function | Signature | Description |
|----------|-----------|-------------|
| `ensure_polygon_is_ta` | `(polygon) → TypedArray` | Normalize polygon to flat `Uint32Array` of `[x,y,...]` |
| `draw_polygon_outline_to_ta_1bipp` | `(ta, img_width, polygon) → ta` | Bresenham line drawing for polygon edges |
| `calc_polygon_stroke_points_x_y` | `(polygon) → Uint16Array` | Return sorted unique stroke points |

### Example

```js
const { draw_polygon_outline_to_ta_1bipp } = require('./ta-math/draw');
const ta = new Uint8Array(Math.ceil(100 * 100 / 8)); // 100x100 1bipp
draw_polygon_outline_to_ta_1bipp(ta, 100, [[10,10], [50,10], [30,40]]);
```

---

## info.js

Bounds and colorspace helpers.

### Colorspace Format

A **colorspace** is a 6-element `Int32Array`:
```
[width, height, bytes_per_pixel, bytes_per_row, bits_per_pixel, bits_per_row]
```

### Key Exports

| Function | Signature | Description |
|----------|-----------|-------------|
| `overlapping_bounds` | `(bounds_1, bounds_2, res?) → Int16Array(4)` | Compute intersection of two `[x1,y1,x2,y2]` bounds |
| `byi_from_cs_pos` | `(colorspace, pos) → number` | Byte index from colorspace and `[x,y]` position |

---

## read.js

Read pixels or small blocks from a source typed array.

### Key Exports

| Function | Signature | Description |
|----------|-----------|-------------|
| `read_px` | `(ta, colorspace, pos) → value\|subarray` | Read single pixel (returns number for 8bipp, subarray for 24/32bipp) |
| `read_2x2_rect` | `(ta, colorspace, pos) → Uint8ClampedArray` | Read 2×2 block (4/12/16 bytes depending on bipp) |
| `read_2x1_rect` | `(ta, colorspace, pos) → Uint8ClampedArray` | Read 2×1 horizontal pair |
| `read_1x2_rect` | `(ta, colorspace, pos) → Uint8ClampedArray` | Read 1×2 vertical pair |
| `read_merged_vfpx` | `(ta, colorspace, vfpx) → Uint8ClampedArray` | Weighted read for virtual float pixel |
| `each_pixel_in_colorspace` | `(colorspace, callback)` | Iterate all `(xy, byi)` in colorspace |

---

## write.js

Fill rectangles with solid colors.

### Key Exports

| Function | Signature | Description |
|----------|-----------|-------------|
| `fill_solid_rect_by_bounds` | `(ta, bypr, bounds, bipp, color)` | Dispatch to bipp-specific filler |
| `fill_solid_rect_by_bounds_8bipp` | `(ta, bypr, bounds, ui8)` | Fill with single byte value |
| `fill_solid_rect_by_bounds_24bipp` | `(ta, bypr, bounds, ta_rgb)` | Fill with 3-byte RGB color |

### Example

```js
const { fill_solid_rect_by_bounds } = require('./ta-math/write');
fill_solid_rect_by_bounds(pb.ta, pb.bytes_per_row, [10, 10, 50, 50], 24, new Uint8ClampedArray([255, 0, 0]));
```

---

## transform.js

Image resizing with proper pixel blending.

### Key Export

| Function | Signature | Description |
|----------|-----------|-------------|
| `resize_ta_colorspace` | `(ta_src, src_colorspace, dest_size, ta_dest)` | Resize image; auto-selects subpixel or superpixel algorithm |

### Algorithm Selection

- **Subpixel** (`dest > source`): Bilinear interpolation blending 1–4 source pixels
- **Superpixel** (`dest < source`): Area-weighted average of covered source pixels
- **General**: Mixed ratios handled per-axis

### Internal Helpers (24bipp)

| Function | Purpose |
|----------|---------|
| `read_2x2_weight_write_24bipp` | Weighted blend of 2×2 block |
| `read_3x3_weight_write_24bipp` | Weighted blend of 3×3 block |
| `read_gt3x3_weight_write_24bipp` | Weighted blend of larger blocks |

---

## Usage Patterns

### Scratch Arrays

Allocate scratch arrays once and reuse:
```js
const ta_32_scratch = new Uint32Array(12);
// reuse in loops instead of allocating per-pixel
```

### Byte Index Calculations

Use colorspace for consistent byte index math:
```js
const byi = pos[0] * bypp + pos[1] * bypr;
```

### Bounds Format

All bounds are `[x1, y1, x2, y2]` (top-left inclusive, bottom-right exclusive).

---

## Extending ta-math

1. Add new functions to the appropriate submodule
2. Export via the submodule's `get_instance()` pattern or direct export
3. Re-export from `ta-math.js` if needed at top level
4. Keep functions pure where possible; accept typed arrays as parameters
5. Avoid allocations inside hot loops—pass scratch arrays as parameters
