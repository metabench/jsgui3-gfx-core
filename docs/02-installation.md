# Chapter 2: Installation & Getting Started

## Installation

### From npm

```bash
npm install jsgui3-gfx-core
```

### From Source

```bash
git clone https://github.com/metabench/jsgui3-gfx-core.git
cd jsgui3-gfx-core
npm install
```

### Dependencies

The library requires three small runtime dependencies:

| Package | Purpose |
|---------|---------|
| `lang-mini` | Type checking (`tof`, `tf`), iteration (`each`), comparison (`are_equal`), signature analysis |
| `obext` | Object extension: `ro()` for read-only properties, `prop()` for managed properties |
| `fnl` | Functional utilities (used indirectly) |

Dev dependencies (`fnlfs`, `sharp`) are only needed for running examples that load/save actual image files.

## Importing the Library

```js
const gfx_core = require('jsgui3-gfx-core');
```

The library exports a single object with these members:

```js
const {
    Pixel_Buffer,          // The main pixel buffer class (full feature set)
    Pixel_Buffer_Painter,  // Fluent drawing API wrapper
    Pixel_Pos_List,        // Efficient pixel position storage
    convolution_kernels,   // Predefined convolution kernels
    ta_math,               // TypedArray math operations
    Rectangle,             // Rectangle shape class
    Rect                   // Alias for Rectangle
} = gfx_core;
```

## Creating Your First Pixel Buffer

### Minimal Construction

Every pixel buffer requires a `bits_per_pixel` and a `size`:

```js
const pb = new Pixel_Buffer({
    bits_per_pixel: 24,
    size: [100, 80]
});

console.log(pb.size);    // Int16Array [ 100, 80 ]
console.log(pb.bipp);    // 24
console.log(pb.bypp);    // 3
console.log(pb.bypr);    // 300  (100 pixels × 3 bytes)
console.log(pb.ta);      // Uint8Array(24000) — all zeros
```

### Supported Bit Depths

```js
// Binary mask (1 bit per pixel)
const mask = new Pixel_Buffer({ bits_per_pixel: 1, size: [64, 64] });

// Greyscale (8 bits per pixel)
const grey = new Pixel_Buffer({ bits_per_pixel: 8, size: [256, 256] });

// RGB color (24 bits per pixel)
const rgb = new Pixel_Buffer({ bits_per_pixel: 24, size: [640, 480] });

// RGBA with alpha channel (32 bits per pixel)
const rgba = new Pixel_Buffer({ bits_per_pixel: 32, size: [320, 240] });
```

### Clone and Copy Construction

```js
// Create from an existing pixel buffer (copies data)
const clone = new Pixel_Buffer(original_pb);

// Or use the clone method
const clone2 = pb.clone();

// Create a blank copy with same dimensions and bipp
const blank = pb.blank_copy();
```

## Basic Pixel Operations

### Set and Get Pixels

```js
const pb = new Pixel_Buffer({ bits_per_pixel: 24, size: [8, 8] });

// Positions are Int16Array or regular arrays: [x, y]
const pos = new Int16Array([3, 4]);

// Set a pixel to red
pb.set_pixel(pos, [255, 0, 0]);

// Read it back
const color = pb.get_pixel(pos);
console.log(color); // Uint8Array [ 255, 0, 0 ]
```

### Fill and Color

```js
// Fill entire buffer with a color
pb.color_whole([40, 60, 120]);

// Fill a rectangular region (bounds: [x1, y1, x2, y2])
pb.color_rect(new Int16Array([10, 10, 50, 50]), [255, 200, 0]);
```

### Using the Painter

The `Pixel_Buffer_Painter` provides a fluent interface for drawing:

```js
const painter = new Pixel_Buffer_Painter({ pb });

// Chain multiple rectangles
painter
    .rect([10, 10], [80, 40], [255, 0, 0])     // red rectangle
    .rect([20, 60], [60, 30], [0, 255, 0])     // green rectangle
    .rect([50, 20], [40, 50], [0, 0, 255]);    // blue rectangle
```

## Conversion Between Formats

```js
// 8bipp greyscale → 24bipp RGB
const rgb_version = grey_pb.to_24bipp();

// 24bipp RGB → 8bipp greyscale
const grey_version = rgb_pb.to_8bipp();

// Add alpha channel: 24bipp → 32bipp
const rgba_version = rgb_pb.to_32bit_rgba();

// Threshold: 8bipp → 1bipp binary mask
const binary = grey_pb.get_1bipp_threshold_8bipp(128);
```

## Convolution (Quick Start)

```js
const { Pixel_Buffer, convolution_kernels } = require('jsgui3-gfx-core');

// Apply built-in edge detection
const pb = new Pixel_Buffer({ bits_per_pixel: 8, size: [100, 100] });
// ... populate pb with image data ...

const edges = pb.apply_square_convolution(
    new Float32Array(convolution_kernels.edge)
);
```

## Running the Tests

```bash
npm test
```

The test runner in `tests/run-tests.js` automatically discovers and executes all test files.

## Next Steps

- **[Chapter 3: Architecture & Class Hierarchy →](./03-architecture.md)** — Understand the layered class design
- **[Chapter 4: Pixel Buffer API Reference →](./04-pixel-buffer-api.md)** — Complete method reference
- **[Chapter 6: Convolution & Image Processing →](./06-convolution.md)** — Deep dive into convolution

---

**← [Chapter 1: Introduction](./01-introduction.md)** | **[Chapter 3: Architecture →](./03-architecture.md)**
