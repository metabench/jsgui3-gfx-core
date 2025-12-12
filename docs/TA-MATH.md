````markdown
# ta-math Module Documentation

Low-level typed-array math utilities for pixel buffer operations. All functions operate directly on `Uint8ClampedArray`, `Int16Array`, `Float32Array`, and related typed arrays to maximize performance and minimize garbage collection.

## Table of Contents

1. [Overview](#overview)
2. [Colorspace Format](#colorspace-format)
3. [bitwise.js](#bitwisejs)
4. [copy.js](#copyjs)
5. [draw.js](#drawjs)
6. [info.js](#infojs)
7. [read.js](#readjs)
8. [write.js](#writejs)
9. [transform.js](#transformjs)
10. [Usage Patterns](#usage-patterns)
11. [Extending ta-math](#extending-ta-math)

---

## Overview

The `ta-math` module provides the mathematical foundation for pixel buffer operations. It is organized into sub-modules by operation type:

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

### Import

```javascript
const { ta_math } = require('jsgui3-gfx-core');
// or
const ta_math = require('jsgui3-gfx-core/core/ta-math');

// Access sub-modules
const { bitwise, copy, draw, info, read, write, transform } = ta_math;
```

---

## Colorspace Format

Many `ta-math` functions accept a **colorspace** parameter—a 6-element `Int32Array` describing the image layout:

```javascript
const colorspace = new Int32Array([
    width,           // [0] Image width in pixels
    height,          // [1] Image height in pixels
    bytes_per_pixel, // [2] Bytes per pixel (bypp)
    bytes_per_row,   // [3] Bytes per row (bypr)
    bits_per_pixel,  // [4] Bits per pixel (bipp)
    bits_per_row     // [5] Bits per row (bipr)
]);
```

### Example

```javascript
// 24bipp image, 800x600
const cs = new Int32Array([800, 600, 3, 2400, 24, 19200]);

// Access fields by index
const [width, height, bypp, bypr, bipp, bipr] = cs;
```

---

## bitwise.js

Bit-level operations on typed arrays.

### Location

```javascript
const bitwise = require('jsgui3-gfx-core/core/ta-math/bitwise');
// or
const { bitwise } = require('jsgui3-gfx-core').ta_math;
```

### Functions

#### right_shift_32bit_with_carry(image)

Right-shift an entire `Uint8Array` by 1 bit with carry propagation across 32-bit chunks.

```javascript
const image = new Uint8Array([0b11110000, 0b00001111]);
const shifted = bitwise.right_shift_32bit_with_carry(image);
// Result: [0b01111000, 0b00000111] (with carry across byte boundary)
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `image` | `Uint8Array` | The input image buffer |

**Returns:** `Uint8Array` - New shifted buffer

---

#### xor_typed_arrays(a, b, res?)

Element-wise XOR of two typed arrays.

```javascript
const a = new Uint8Array([0xFF, 0x00, 0xAA]);
const b = new Uint8Array([0x0F, 0xF0, 0x55]);
const result = bitwise.xor_typed_arrays(a, b);
// Result: [0xF0, 0xF0, 0xFF]

// Reuse existing buffer for result
const existing = new Uint8Array(3);
bitwise.xor_typed_arrays(a, b, existing);
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `a` | `TypedArray` | First array |
| `b` | `TypedArray` | Second array (same length) |
| `res` | `TypedArray` | Optional output array |

**Returns:** `TypedArray` - XOR result

---

#### each_1_index(ta, callback)

Iterate bit indexes where the value is 1.

```javascript
const ta = new Uint8Array([0b10100000, 0b00001010]);
bitwise.each_1_index(ta, (bit_index) => {
    console.log(`Bit ${bit_index} is set`);
});
// Output: Bit 0, 2, 12, 14 are set
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `ta` | `TypedArray` | Input array |
| `callback` | `Function` | Called with each set bit index |

---

#### count_1s(ta) / pop_cnt_typed_array(ta)

Count the number of set bits (1s) in a typed array.

```javascript
const ta = new Uint8Array([0b11110000, 0b00001111]);
const count = bitwise.count_1s(ta);
// Result: 8
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `ta` | `TypedArray` | Input array |

**Returns:** `Number` - Count of set bits

---

#### get_bit(ta, i)

Read a single bit at index `i`.

```javascript
const ta = new Uint8Array([0b10101010]);
console.log(bitwise.get_bit(ta, 0)); // 1 (MSB)
console.log(bitwise.get_bit(ta, 1)); // 0
console.log(bitwise.get_bit(ta, 2)); // 1
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `ta` | `TypedArray` | Input array |
| `i` | `Number` | Bit index |

**Returns:** `0` or `1`

---

#### fast_find_next_set_ta_bit(ta, start, limit?)

Find the index of the next set bit after `start`.

```javascript
const ta = new Uint8Array([0b00001000, 0b10000000]);
const next = bitwise.fast_find_next_set_ta_bit(ta, 0, 16);
// Result: 4 (first set bit after index 0)
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `ta` | `TypedArray` | Input array |
| `start` | `Number` | Starting bit index |
| `limit` | `Number` | Maximum bits to search |

**Returns:** `Number` or `false` if not found

---

#### get_ta_bits_that_differ_from_previous_as_1s(ta_source, bits_per_row, ta_dest?, copy_x0?)

Edge-detection helper: marks bit transitions as 1s.

```javascript
const source = new Uint8Array([0b11110000]);
const edges = bitwise.get_ta_bits_that_differ_from_previous_as_1s(source, 8);
// Result marks transitions between 0 and 1
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `ta_source` | `TypedArray` | Input array |
| `bits_per_row` | `Number` | Row width in bits |
| `ta_dest` | `TypedArray` | Optional output array |
| `copy_x0` | `Boolean` | Copy original row-start values |

**Returns:** `TypedArray` - Transition markers

---

## copy.js

Rectangle and byte-range copying between typed arrays.

### Location

```javascript
const copy = require('jsgui3-gfx-core/core/ta-math/copy');
// or
const { copy } = require('jsgui3-gfx-core').ta_math;
```

### Functions

#### copy_ta_byte_range(src, dest, srcStart, destStart, length)

Raw byte copy using `subarray().set()`.

```javascript
const src = new Uint8Array([1, 2, 3, 4, 5]);
const dest = new Uint8Array(5);
copy.copy_ta_byte_range(src, dest, 1, 0, 3);
// dest: [2, 3, 4, 0, 0]
```

---

#### copy_rect_to_same_size_8bipp(xy, bounds, ta, ta_res, ta_byte_indexes, row_jump)

Copy a rectangular region for 8bipp images.

```javascript
const xy = new Int16Array(2);
const bounds = new Int16Array([10, 10, 50, 50]); // [x1, y1, x2, y2]
const ta_byte_indexes = new Int32Array([start_read, start_write]);

copy.copy_rect_to_same_size_8bipp(xy, bounds, source_ta, dest_ta, ta_byte_indexes, row_jump);
```

---

#### copy_rect_to_same_size_24bipp(xy, bounds, ta, ta_res, ta_byte_indexes, row_jump)

Copy a rectangular region for 24bipp images.

---

#### dest_aligned_copy_rect_1to4bypp(ta_src, ta_dest, bypr_src, bypp, bounds)

Copy when destination size matches the bounds exactly.

```javascript
// Extract a region where dest buffer is sized to fit bounds exactly
copy.dest_aligned_copy_rect_1to4bypp(
    source_ta,
    dest_ta,
    source_bytes_per_row,
    bytes_per_pixel,
    new Int16Array([10, 10, 110, 60]) // 100x50 region
);
```

---

#### unaligned_copy_rect_1to4bypp(ta_src, ta_dest, bypr_src, bypr_dest, bypp, bounds, dest_pos)

Copy with arbitrary destination position.

```javascript
copy.unaligned_copy_rect_1to4bypp(
    source_ta, dest_ta,
    source_bypr, dest_bypr,
    bytes_per_pixel,
    source_bounds,
    dest_pos
);
```

---

#### copy_px_24bipp(ta_src, byi_read, ta_dest, byi_write)

Copy a single 24bipp pixel.

```javascript
copy.copy_px_24bipp(source, read_byte_index, dest, write_byte_index);
```

---

## draw.js

Polygon rasterization utilities.

### Location

```javascript
const draw = require('jsgui3-gfx-core/core/ta-math/draw');
// or
const { draw } = require('jsgui3-gfx-core').ta_math;
```

### Functions

#### ensure_polygon_is_ta(polygon)

Normalize a polygon to a flat `Uint32Array` of `[x, y, ...]` pairs.

```javascript
// From array of points
const ta = draw.ensure_polygon_is_ta([[10, 10], [50, 10], [30, 40]]);
// Result: Uint32Array([10, 10, 50, 10, 30, 40])

// Already a typed array - returns as-is
const existing = new Uint32Array([10, 10, 50, 10, 30, 40]);
const same = draw.ensure_polygon_is_ta(existing);
```

---

#### draw_polygon_outline_to_ta_1bipp(ta, img_width, polygon)

Draw polygon edges using Bresenham's line algorithm on a 1bipp buffer.

```javascript
// Create 1bipp buffer for 100x100 image
const ta = new Uint8Array(Math.ceil(100 * 100 / 8));

// Draw triangle outline
draw.draw_polygon_outline_to_ta_1bipp(ta, 100, [
    [10, 10],
    [90, 10],
    [50, 90]
]);
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `ta` | `Uint8Array` | 1bipp buffer |
| `img_width` | `Number` | Image width in pixels |
| `polygon` | `Array\|TypedArray` | Polygon vertices |

**Returns:** `ta` - The modified buffer

---

#### calc_polygon_stroke_points_x_y(polygon)

Calculate all stroke points of a polygon outline, sorted and deduplicated.

```javascript
const points = draw.calc_polygon_stroke_points_x_y([
    [10, 10], [50, 10], [30, 40]
]);
// Returns Uint16Array of [x1, y1, x2, y2, ...] sorted by y, then x
```

**Returns:** `Uint16Array` - Sorted unique points

---

## info.js

Bounds calculations and colorspace utilities.

### Location

```javascript
const info = require('jsgui3-gfx-core/core/ta-math/info');
// or
const { info } = require('jsgui3-gfx-core').ta_math;
```

### Functions

#### overlapping_bounds(bounds_1, bounds_2, res?)

Compute the intersection of two `[x1, y1, x2, y2]` bounds.

```javascript
const b1 = new Int16Array([0, 0, 100, 100]);
const b2 = new Int16Array([50, 50, 150, 150]);
const overlap = info.overlapping_bounds(b1, b2);
// Result: Int16Array([50, 50, 100, 100])

// Reuse result buffer
const result = new Int16Array(4);
info.overlapping_bounds(b1, b2, result);
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `bounds_1` | `Int16Array[4]` | First bounds |
| `bounds_2` | `Int16Array[4]` | Second bounds |
| `res` | `Int16Array[4]` | Optional result buffer |

**Returns:** `Int16Array[4]` - Intersection bounds

---

#### byi_from_cs_pos(colorspace, pos)

Calculate byte index from colorspace and `[x, y]` position.

```javascript
const cs = new Int32Array([800, 600, 3, 2400, 24, 19200]);
const pos = new Int16Array([100, 50]);
const byte_index = info.byi_from_cs_pos(cs, pos);
// Result: 100 * 3 + 50 * 2400 = 120300
```

---

## read.js

Read pixels or small blocks from a source typed array.

### Location

```javascript
const read = require('jsgui3-gfx-core/core/ta-math/read');
// or
const { read } = require('jsgui3-gfx-core').ta_math;
```

### Functions

#### read_px(ta, colorspace, pos)

Read a single pixel value.

```javascript
const cs = new Int32Array([100, 100, 3, 300, 24, 2400]);
const pos = new Int16Array([50, 25]);

// 24bipp returns subarray
const rgb = read.read_px(image_ta, cs, pos);
// Returns Uint8Array view into original buffer

// 8bipp returns number
const gray = read.read_px(gray_ta, gray_cs, pos);
```

**Returns:**
- **8bipp**: `Number` (0-255)
- **24bipp**: `Uint8Array[3]` subarray
- **32bipp**: `Uint8Array[4]` subarray

---

#### read_2x2_rect(ta, colorspace, pos)

Read a 2×2 pixel block.

```javascript
const block = read.read_2x2_rect(ta, colorspace, pos);
// 8bipp: Uint8ClampedArray(4)
// 24bipp: Uint8ClampedArray(12)
// 32bipp: Uint8ClampedArray(16)
```

---

#### read_2x1_rect(ta, colorspace, pos)

Read a 2×1 horizontal pixel pair.

```javascript
const pair = read.read_2x1_rect(ta, colorspace, pos);
// 24bipp: Uint8ClampedArray(6)
```

---

#### read_1x2_rect(ta, colorspace, pos)

Read a 1×2 vertical pixel pair.

```javascript
const pair = read.read_1x2_rect(ta, colorspace, pos);
// 24bipp: Uint8ClampedArray(6)
```

---

#### each_pixel_in_colorspace(colorspace, callback)

Iterate all pixel positions in a colorspace.

```javascript
const cs = new Int32Array([100, 100, 3, 300, 24, 2400]);

read.each_pixel_in_colorspace(cs, (xy, byi) => {
    // xy: Int16Array[2] - current position
    // byi: Number - byte index
    console.log(`Pixel at (${xy[0]}, ${xy[1]}) starts at byte ${byi}`);
});
```

---

## write.js

Fill rectangles with solid colors.

### Location

```javascript
const write = require('jsgui3-gfx-core/core/ta-math/write');
// or
const { write } = require('jsgui3-gfx-core').ta_math;
```

### Functions

#### fill_solid_rect_by_bounds(ta, bypr, bounds, bipp, color)

Fill a rectangular region with a solid color. Dispatches to bipp-specific implementation.

```javascript
const ta = new Uint8ClampedArray(800 * 600 * 3);
const bypr = 800 * 3;
const bounds = new Int16Array([100, 100, 200, 200]);
const color = new Uint8ClampedArray([255, 0, 0]); // Red

write.fill_solid_rect_by_bounds(ta, bypr, bounds, 24, color);
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `ta` | `TypedArray` | Target buffer |
| `bypr` | `Number` | Bytes per row |
| `bounds` | `Int16Array[4]` | `[x1, y1, x2, y2]` |
| `bipp` | `Number` | Bits per pixel |
| `color` | `Number\|TypedArray` | Fill color |

---

#### fill_solid_rect_by_bounds_8bipp(ta, bypr, bounds, ui8_color)

Fill with single byte value (8bipp).

```javascript
write.fill_solid_rect_by_bounds_8bipp(ta, 800, bounds, 128);
```

---

#### fill_solid_rect_by_bounds_24bipp(ta, bypr, bounds, ta_rgb)

Fill with 3-byte RGB color (24bipp).

```javascript
const red = new Uint8ClampedArray([255, 0, 0]);
write.fill_solid_rect_by_bounds_24bipp(ta, 2400, bounds, red);
```

---

## transform.js

Image resizing with proper pixel blending.

### Location

```javascript
const transform = require('jsgui3-gfx-core/core/ta-math/transform');
// or
const { transform } = require('jsgui3-gfx-core').ta_math;
```

### Functions

#### resize_ta_colorspace(ta_src, src_colorspace, dest_size, ta_dest)

Resize an image using area-weighted blending. Automatically selects the optimal algorithm.

```javascript
const src_cs = new Int32Array([1920, 1080, 3, 5760, 24, 46080]);
const dest_size = new Int16Array([640, 360]);
const dest_ta = new Uint8ClampedArray(640 * 360 * 3);

transform.resize_ta_colorspace(source_ta, src_cs, dest_size, dest_ta);
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `ta_src` | `TypedArray` | Source buffer |
| `src_colorspace` | `Int32Array[6]` | Source colorspace |
| `dest_size` | `Int16Array[2]` | `[width, height]` |
| `ta_dest` | `TypedArray` | Destination buffer |

### Algorithm Selection

The function automatically selects the optimal algorithm:

- **Subpixel** (`dest > source`): Bilinear interpolation blending 1–4 source pixels
- **Superpixel** (`dest < source`): Area-weighted average of covered source pixels
- **General**: Mixed ratios handled per-axis

### Internal Helpers (24bipp)

These are used internally but available for advanced use:

| Function | Purpose |
|----------|---------|
| `read_2x2_weight_write_24bipp` | Weighted blend of 2×2 block |
| `read_3x3_weight_write_24bipp` | Weighted blend of 3×3 block |
| `read_gt3x3_weight_write_24bipp` | Weighted blend of larger blocks |

---

## Usage Patterns

### Scratch Arrays

Allocate scratch arrays once and reuse them to minimize garbage collection:

```javascript
// Allocate once outside hot path
const ta_32_scratch = new Uint32Array(12);
const xy = new Int16Array(2);
const bounds = new Int16Array(4);

// Reuse in loops
for (let i = 0; i < 1000; i++) {
    xy[0] = i % width;
    xy[1] = Math.floor(i / width);
    // Use xy...
}
```

### Byte Index Calculations

Use colorspace for consistent byte index math:

```javascript
const [width, height, bypp, bypr, bipp, bipr] = colorspace;

// Calculate byte index from position
const byi = pos[0] * bypp + pos[1] * bypr;

// Read pixel at position
const r = ta[byi];
const g = ta[byi + 1];
const b = ta[byi + 2];
```

### Bounds Format

All bounds use `[x1, y1, x2, y2]` format where:
- `(x1, y1)` is the top-left corner (inclusive)
- `(x2, y2)` is the bottom-right corner (exclusive)

```javascript
const bounds = new Int16Array([10, 20, 110, 70]);
const width = bounds[2] - bounds[0];   // 100
const height = bounds[3] - bounds[1];  // 50
```

---

## Extending ta-math

When adding new functionality to `ta-math`:

1. **Choose the right sub-module**: Add functions to the module matching their category
2. **Use the factory pattern**: Modules using `get_instance()` should follow that pattern
3. **Export from ta-math.js**: Add top-level exports to `core/ta-math.js` if needed
4. **Keep functions pure**: Accept typed arrays as parameters, avoid side effects
5. **Avoid allocations in hot paths**: Pass scratch arrays as parameters
6. **Support multiple bipp**: Provide bipp-specific implementations when needed

### Example: Adding a new function

```javascript
// In ta-math/read.js
const read_3x3_rect = (ta_source, ta_colorspace, ta_pos) => {
    const [width, height, bypp, bypr, bipp, bipr] = ta_colorspace;
    const byi_start = ta_pos[0] * bypp + ta_pos[1] * bypr;
    
    if (bipp === 24) {
        const res = new Uint8ClampedArray(27); // 3x3x3 bytes
        let write_idx = 0;
        for (let row = 0; row < 3; row++) {
            const row_start = byi_start + row * bypr;
            res.set(ta_source.subarray(row_start, row_start + 9), write_idx);
            write_idx += 9;
        }
        return res;
    }
    // Handle other bipp values...
};

// Add to return object
return {
    // ... existing exports
    read_3x3_rect: read_3x3_rect
};
```

```javascript
// In ta-math.js, add to exports if needed at top level
const {read_3x3_rect} = read;

module.exports = {
    // ... existing exports
    read_3x3_rect: read_3x3_rect
};
```
````
