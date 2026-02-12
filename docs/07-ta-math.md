# Chapter 7: TypedArray Math (ta_math) Subsystem

The `ta_math` module is a collection of low-level functions that operate directly on typed arrays. These functions form the computational backbone of the pixel buffer — used internally by the class hierarchy, and also available directly for performance-critical code that wants to bypass the object layer.

## Module Structure

```
core/ta-math.js          ← Aggregator: imports and re-exports everything
core/ta-math/
├── bitwise.js           ← Bit manipulation on Uint8Array / BigUint64Array
├── copy.js              ← Rectangular region copying between typed arrays
├── draw.js              ← Polygon outline rasterization to typed arrays
├── info.js              ← Bounds overlap detection
├── read.js              ← Read pixel neighborhoods (1×2, 2×1, 2×2 blocks)
├── transform.js         ← Resize (area-weighted), color format transform
├── write.js             ← Fill solid rectangles
└── x_spans.js           ← X-span data structure utilities
```

## Importing

```js
const { ta_math } = require('jsgui3-gfx-core');

// Or access sub-modules:
const bitwise = ta_math.bitwise;
const copy = ta_math.copy;
```

## Bitwise Operations (`ta-math/bitwise.js`)

Functions for manipulating pixel buffers at the bit level, primarily for 1bipp buffers.

### `xor_typed_arrays(a, b, result)`
XOR two typed arrays element-by-element. Used for comparing masks.

### `xor_value_typed_arrays(ta, value)`
XOR every element with a constant value.

### `shift_left_1(ta)`
Left-shift all bytes by 1 bit position. Used for scrolling or bit realignment.

### `count_1s_in_typed_array(ta)`
Count the total number of set bits. Useful for measuring mask coverage.

```js
const mask_coverage = ta_math.bitwise.count_1s_in_typed_array(mask_pb.ta);
console.log(`${mask_coverage} pixels set in mask`);
```

### `find_first_set_bit_index(ta)` / `find_last_set_bit_index(ta)`
Binary search for the first/last set bit. Returns the bit index.

### `first_byte_with_value(ta, value)`
Find the index of the first byte matching a specific value. Useful for scanning.

## Copy Operations (`ta-math/copy.js`)

Functions for copying rectangular regions between typed arrays.

### `copy_rect_to_same_size_8bipp(source_ta, dest_ta, bypr, bounds)`
Copy an 8bipp rectangular region. `bounds` is `Int16Array [x1, y1, x2, y2]`.

### `copy_rect_to_same_size_24bipp(source_ta, dest_ta, bypr, bounds)`
Same for 24bipp buffers (3 bytes per pixel).

### `copy_rect_to_same_size_32bipp(source_ta, dest_ta, bypr, bounds)`
Same for 32bipp buffers (4 bytes per pixel).

### `copy_rect_to_different_size(source_ta, dest_ta, ...)`
Copy with scaling — used internally by resize operations.

```js
const bounds = new Int16Array([10, 10, 50, 50]);
ta_math.copy.copy_rect_to_same_size_24bipp(
    source.ta, dest.ta, source.bypr, bounds
);
```

## Draw Operations (`ta-math/draw.js`)

### `draw_polygon_outline_to_ta_1bipp(ta, bypr, width, polygon)`
Rasterizes polygon edges onto a typed array as 1bipp line segments.

### `draw_polygon_outline_color_to_ta(ta, bypr, bipp, polygon, color)`
Rasterizes polygon edges with a specific color at any bit depth.

These are the internal functions invoked by `Pixel_Buffer_Core_Draw_Polygons`.

## Info / Analysis (`ta-math/info.js`)

### `ta_bounds_overlap(bounds_a, bounds_b)`
Tests whether two `Int16Array [x1, y1, x2, y2]` rectangles overlap. Returns a boolean.

```js
const a = new Int16Array([0, 0, 50, 50]);
const b = new Int16Array([30, 30, 80, 80]);
console.log(ta_math.info.ta_bounds_overlap(a, b)); // true
```

## Read Operations (`ta-math/read.js`)

Functions for reading pixel neighborhoods — essential for convolution and analysis.

### `read_1x2_block_8bipp(ta, bypr, x, y)`
Returns 2 vertically adjacent pixels as a `Uint8Array(2)`.

### `read_2x1_block_8bipp(ta, bypr, x, y)`
Returns 2 horizontally adjacent pixels.

### `read_2x2_block_8bipp(ta, bypr, x, y)`
Returns a 2×2 pixel neighborhood as a `Uint8Array(4)`.

These are used by resize algorithms (area-weighted sampling) to compute weighted averages of source pixels.

## Transform Operations (`ta-math/transform.js`)

This is the largest sub-module (~92KB) and contains the resize and color transformation algorithms.

### Area-Weighted Resize

The resize algorithm computes each output pixel as a weighted average of the corresponding source region:

1. Map each output pixel back to source coordinates
2. Determine which source pixels contribute (usually a fractional region)
3. Weight each contributing source pixel by its coverage area
4. Sum the weighted values to produce the output pixel

This is available at the buffer level through `pb.new_resized(new_size)`.

### Color Transforms

- RGB ↔ Greyscale conversion
- 24bipp ↔ 32bipp (add/remove alpha channel)
- 8bipp ↔ 24bipp (greyscale to RGB via channel triplication)
- Threshold: greyscale → binary (8bipp → 1bipp)

## Write Operations (`ta-math/write.js`)

### `fill_solid_rect_by_bounds(ta, bypr, bounds, bipp, color)`

The core rectangle fill function. Given the raw typed array, bytes-per-row, bounds, bit depth, and color, fills the rectangle directly in memory.

```js
const bounds = new Int16Array([20, 20, 80, 60]);
ta_math.write.fill_solid_rect_by_bounds(
    pb.ta, pb.bypr, bounds, pb.bipp, [255, 0, 0]
);
```

This is the function used by `Pixel_Buffer_Painter` internally.

## X-Spans (`ta-math/x_spans.js`)

Data structure utilities for managing horizontal spans. Used internally by the scanline polygon fill algorithm to track which x-ranges need to be drawn at each y-scanline.

## When to Use ta_math Directly

Use the `Pixel_Buffer` API for most work. Use `ta_math` directly when:

1. **Performance matters** — Avoid object method dispatch overhead in tight loops
2. **Operating on raw buffers** — When you have a typed array from an external source
3. **Batch operations** — When the same operation applies to multiple buffers
4. **Custom algorithms** — Building on the primitive operations

---

**← [Chapter 6: Convolution](./06-convolution.md)** | **[Chapter 8: Shapes, Pixel_Pos_List & Utilities →](./08-utilities.md)**
