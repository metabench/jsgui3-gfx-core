# Architecture Documentation

## Overview

`jsgui3-gfx-core` is designed as a high-performance, low-level graphics library that prioritizes:

1. **Performance**: Extensive use of TypedArrays, bitwise operations, and algorithm optimization
2. **Flexibility**: Support for multiple bit depths and color spaces
3. **Modularity**: Layered class hierarchy allowing incremental feature addition
4. **Portability**: Works in both browser and Node.js environments

## Directory Structure

```
jsgui3-gfx-core/
├── core/
│   ├── gfx-core.js                    # Main entry point
│   ├── pixel-buffer.js                # Re-exports pixel-buffer-8-enh
│   ├── pixel-buffer-0-core-inner-structures.js
│   ├── pixel-buffer-1-core-get-set-pixel.js
│   ├── pixel-buffer-1.1-core-draw-line.js
│   ├── pixel-buffer-1.2-core-draw-polygon.js
│   ├── pixel-buffer-2-core-reference-implementations.js
│   ├── pixel-buffer-3-core.js
│   ├── pixel-buffer-4-advanced-typedarray-properties.js
│   ├── pixel-buffer-5-idiomatic-enh.js
│   ├── pixel-buffer-6-perf-focus-enh.js
│   ├── pixel-buffer-7-specialised-enh.js
│   ├── pixel-buffer-8-enh.js          # Final exported class
│   ├── pixel-buffer-painter.js        # Painting utilities
│   ├── pixel-pos-list.js              # Pixel position list
│   ├── convolution.js                 # Convolution classes
│   ├── palette.js                     # Color palette support
│   ├── dynamic-xspans.js              # Dynamic X-span data structure
│   ├── virtual-float-pixel.js         # Float-based pixel operations
│   ├── Typed_Array_Binary_Read_Write.js
│   ├── convolution-kernels/
│   │   └── kernels.js                 # Pre-defined kernels
│   ├── shapes/
│   │   ├── Shape.js                   # Base shape class
│   │   ├── Rectangle.js               # Rectangle implementation
│   │   ├── Polygon.js                 # Polygon implementation
│   │   ├── Polygon_Edges.js           # Polygon edge handling
│   │   ├── Polygon_Scanline_Edges.js  # Scanline rendering
│   │   ├── ScanlineProcessor.js       # Scanline fill algorithm
│   │   └── TA_Table_8_Columns.js      # Typed array table
│   ├── ta-math/
│   │   ├── bitwise.js                 # Bitwise operations
│   │   ├── copy.js                    # Copy operations
│   │   ├── draw.js                    # Drawing operations
│   │   ├── info.js                    # Info/utility functions
│   │   ├── read.js                    # Read operations
│   │   ├── write.js                   # Write operations
│   │   ├── x_spans.js                 # X-span utilities
│   │   └── transform/
│   │       └── convolve/
│   │           └── convolve.js
│   └── other-representations/
│       ├── Other_Representation_Buffer.js
│       └── of_1bipp/
│           ├── Other_Representation_Of_1_Bit_Per_Pixel_Buffer.js
│           └── wrapping_scanlines/
│               └── toggle_color_span_lengths/
├── examples/
│   ├── 1bipp_small_shapes/
│   ├── 8bipp.js
│   ├── _24bipp.js
│   ├── convolve.js
│   └── ...
└── tests/
```

## Class Hierarchy

### Pixel Buffer Inheritance Chain

The Pixel_Buffer class is built through a series of inheritance layers, each adding specific functionality:

```
                    ┌──────────────────────────────────────┐
                    │ Pixel_Buffer_Core_Inner_Structures   │
                    │ (pixel-buffer-0)                     │
                    │ - TypedArray buffer management       │
                    │ - Size, position properties          │
                    │ - Bits/bytes per pixel               │
                    │ - DataView for binary operations     │
                    └──────────────────┬───────────────────┘
                                       │
                    ┌──────────────────▼───────────────────┐
                    │ Pixel_Buffer_Core_Get_Set_Pixels     │
                    │ (pixel-buffer-1)                     │
                    │ - get_pixel / set_pixel methods      │
                    │ - Bit-depth specific implementations │
                    │ - Index-based pixel access           │
                    └──────────────────┬───────────────────┘
                                       │
                    ┌──────────────────▼───────────────────┐
                    │ Pixel_Buffer_Core_Draw_Lines         │
                    │ (pixel-buffer-1.1)                   │
                    │ - Bresenham line algorithm           │
                    │ - Horizontal line optimization       │
                    │ - X-span drawing                     │
                    └──────────────────┬───────────────────┘
                                       │
                    ┌──────────────────▼───────────────────┐
                    │ Pixel_Buffer_Core_Draw_Polygons      │
                    │ (pixel-buffer-1.2)                   │
                    │ - Polygon outline drawing            │
                    │ - Filled polygon (scanline)          │
                    │ - Uses ScanlineProcessor             │
                    └──────────────────┬───────────────────┘
                                       │
                    ┌──────────────────▼───────────────────┐
                    │ Pixel_Buffer_Core_Reference_Impls    │
                    │ (pixel-buffer-2)                     │
                    │ - Reference implementations          │
                    └──────────────────┬───────────────────┘
                                       │
                    ┌──────────────────▼───────────────────┐
                    │ Pixel_Buffer_Core                    │
                    │ (pixel-buffer-3)                     │
                    │ - Convolution support                │
                    │ - Colorspace conversion              │
                    │ - Thresholding                       │
                    │ - Iteration methods                  │
                    │ - Clone, crop, uncrop                │
                    │ - Rectangle drawing                  │
                    │ - Bitmap mask operations             │
                    └──────────────────┬───────────────────┘
                                       │
                    ┌──────────────────▼───────────────────┐
                    │ Pixel_Buffer_Advanced_TA_Properties  │
                    │ (pixel-buffer-4)                     │
                    │ - Scratch TypedArray properties      │
                    │ - Performance-oriented accessors     │
                    └──────────────────┬───────────────────┘
                                       │
                    ┌──────────────────▼───────────────────┐
                    │ Pixel_Buffer_Idiomatic_Enh           │
                    │ (pixel-buffer-5)                     │
                    │ - User-friendly iteration            │
                    │ - Color counting                     │
                    │ - Blur convenience method            │
                    └──────────────────┬───────────────────┘
                                       │
                    ┌──────────────────▼───────────────────┐
                    │ Pixel_Buffer_Perf_Focus_Enh          │
                    │ (pixel-buffer-6)                     │
                    │ - Performance-optimized methods      │
                    └──────────────────┬───────────────────┘
                                       │
                    ┌──────────────────▼───────────────────┐
                    │ Pixel_Buffer_Specialised_Enh         │
                    │ (pixel-buffer-7)                     │
                    │ - Windowing operations               │
                    │ - X-span calculations                │
                    │ - Source/bounds management           │
                    │ - Threshold operations               │
                    └──────────────────┬───────────────────┘
                                       │
                    ┌──────────────────▼───────────────────┐
                    │ Pixel_Buffer_Enh (exported)          │
                    │ (pixel-buffer-8)                     │
                    │ - Final public API                   │
                    └──────────────────────────────────────┘
```

### Shape Class Hierarchy

```
        ┌─────────┐
        │  Shape  │ (Base class)
        └────┬────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼────┐      ┌─────▼─────┐
│Rectangle│      │  Polygon  │
└─────────┘      └─────┬─────┘
                       │
              ┌────────┴────────┐
              │                 │
    ┌─────────▼──────┐   ┌──────▼──────────────┐
    │ Polygon_Edges  │   │ Polygon_Scanline_   │
    │                │   │ Edges               │
    └────────────────┘   └─────────────────────┘
```

## Memory Layout

### Pixel Buffer Memory Organization

The pixel buffer uses a contiguous TypedArray for pixel storage:

#### 1bipp (1 bit per pixel)
```
Byte 0:    [px0|px1|px2|px3|px4|px5|px6|px7]  (MSB first)
Byte 1:    [px8|px9|...]
...

Pixel index to byte/bit:
  byte_index = pixel_index >> 3
  bit_index = pixel_index & 0b111
  mask = 128 >> bit_index
```

#### 8bipp (8 bits per pixel)
```
Byte 0: pixel[0,0]
Byte 1: pixel[1,0]
...
Byte W: pixel[0,1]  (new row)
```

#### 24bipp (24 bits per pixel)
```
Byte 0: pixel[0,0].R
Byte 1: pixel[0,0].G
Byte 2: pixel[0,0].B
Byte 3: pixel[1,0].R
Byte 4: pixel[1,0].G
Byte 5: pixel[1,0].B
...
```

#### 32bipp (32 bits per pixel)
```
Byte 0: pixel[0,0].R
Byte 1: pixel[0,0].G
Byte 2: pixel[0,0].B
Byte 3: pixel[0,0].A
Byte 4: pixel[1,0].R
...
```

### Pixel Index Calculation

```javascript
// Row-major pixel index
pixel_index = y * width + x;

// Byte index (depends on bipp)
byte_index_1bipp  = pixel_index >> 3;
byte_index_8bipp  = pixel_index;
byte_index_24bipp = pixel_index * 3;
byte_index_32bipp = pixel_index * 4;
```

## Key Algorithms

### Bresenham's Line Algorithm

Used in `draw_line()` for efficient line rasterization:

```javascript
// Simplified algorithm
let dx = Math.abs(x1 - x0);
let dy = Math.abs(y1 - y0);
let sx = (x0 < x1) ? 1 : -1;
let sy = (y0 < y1) ? 1 : -1;
let err = dx - dy;

while (true) {
    set_pixel(x0, y0, color);
    if (x0 === x1 && y0 === y1) break;

    let e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x0 += sx; }
    if (e2 < dx)  { err += dx; y0 += sy; }
}
```

### Scanline Polygon Fill Algorithm

The `ScanlineProcessor` class implements the scanline fill algorithm:

1. Create edge table sorted by Y-coordinate
2. For each scanline from top to bottom:
   - Update active edge list
   - Sort active edges by X-coordinate
   - Fill pixels between edge pairs
   - Update edge X-intercepts

```
Polygon:       Active Edge Table:     Scanline Fill:
    /\              y=0: []
   /  \             y=1: [e1, e2]       [====]
  /    \            y=2: [e1, e2]       [======]
 /______\           y=3: [e1, e2]       [========]
```

### Convolution

Convolutions apply a kernel matrix to each pixel:

```javascript
// For each pixel in output:
for each (x, y) in output {
    sum = 0;
    for each (kx, ky) in kernel {
        ix = x + kx - kernel_center_x;
        iy = y + ky - kernel_center_y;
        sum += input[ix, iy] * kernel[kx, ky];
    }
    output[x, y] = clamp(sum, 0, 255);
}
```

### X-Span Representation

For 1bipp images, x-spans efficiently represent horizontal runs:

```
Image:    [0001111100011110000]
X-spans:  [[3, 8], [11, 14]]  // [start, end] inclusive

Benefits:
- Efficient fill operations
- Compact representation for sparse images
- Fast collision detection
```

## Performance Considerations

### TypedArray Usage

The library uses TypedArrays extensively for performance:

```javascript
// Position as typed array (avoids object allocation)
const pos = new Int16Array([x, y]);

// Reusable scratch arrays
const ta_pos_scratch = new Int16Array(2);
const ta_bounds_scratch = new Int16Array(4);

// Direct buffer access
const ta = pb.ta;
ta[byte_index] = value;  // Direct write
```

### Bit Manipulation for 1bipp

```javascript
// Set pixel ON (fast)
ta[pixel_index >> 3] |= (128 >> (pixel_index & 0b111));

// Set pixel OFF (fast)
ta[pixel_index >> 3] &= (~(128 >> (pixel_index & 0b111))) & 255;

// Get pixel value
const value = (ta[byte] & (128 >> bit)) !== 0 ? 1 : 0;
```

### Horizontal Line Optimization

For horizontal lines, especially in 1bipp:

1. **Byte-aligned spans**: Fill complete bytes with 0xFF or 0x00
2. **Partial bytes**: Handle first and last bytes with masking
3. **Large spans**: Use `ta.set()` for bulk operations

```javascript
// For a span of 1s:
// First partial byte
ta[start_byte] |= (0xFF >> start_bit);
// Full bytes
for (let i = start_byte + 1; i < end_byte; i++) ta[i] = 0xFF;
// Last partial byte
ta[end_byte] |= (0xFF << (7 - end_bit));
```

### Window Operations

Windows provide efficient sub-region access without copying:

```javascript
// Create window (copies initial data)
const window = pb.new_window({ size: [3, 3], pos: [100, 100] });

// Move window (efficient update)
window.pos[0] = 101;
window.copy_from_source();  // Only copies 3x3 region
```

## Design Patterns

### Object Property Definition

Uses `obext` library for property definition:

```javascript
const { ro, prop, get_set } = require('obext');

// Read-only property
ro(this, 'ta', () => ta);

// Get/set property
get_set(this, 'x', () => x, (value) => x = value);
```

### Lazy Calculation with Caching

```javascript
get ta_bounding_box() {
    if (!this._ta_bounding_box) {
        // Calculate once and cache
        this._ta_bounding_box = calculate_bounding_box();
    }
    return this._ta_bounding_box;
}
```

### Method Overloading by Bit Depth

```javascript
set_pixel(pos, color) {
    const bipp = this.bipp;
    if (bipp === 1) return this.set_pixel_1bipp(pos, color);
    if (bipp === 8) return this.set_pixel_8bipp(pos, color);
    if (bipp === 24) return this.set_pixel_24bipp(pos, color);
    if (bipp === 32) return this.set_pixel_32bipp(pos, color);
}
```

## Future Architecture Considerations

### C++ Acceleration

The codebase is designed with C++ acceleration in mind:

- Simple function signatures
- TypedArray inputs/outputs
- Minimal object allocation in hot paths

### WebGL/Vulkan Integration

Future versions may support GPU acceleration:

- Convolutions are parallelizable
- Large image operations benefit from GPU
- WebGL shaders for browser, Vulkan for native

### WASM Support

TypedArray-based design facilitates WASM:

- Direct memory sharing possible
- Performance-critical loops can be WASM
- JavaScript fallback for compatibility
