# JSGUI3 Graphics Core Documentation

## Overview

`jsgui3-gfx-core` is a high-performance graphics library for JavaScript/Node.js that provides low-level pixel manipulation capabilities using TypedArrays. The library is designed for both client-side (browser) and server-side (Node.js) graphics processing.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Core Concepts](#core-concepts)
3. [Architecture Overview](#architecture-overview)
4. [API Reference](#api-reference)
5. [Examples](#examples)

## Getting Started

### Installation

```bash
npm install jsgui3-gfx-core
```

### Basic Usage

```javascript
const gfx_core = require('jsgui3-gfx-core');
const { Pixel_Buffer, Rectangle, ta_math } = gfx_core;

// Create a 24-bit RGB pixel buffer
const pb = new Pixel_Buffer({
    size: [640, 480],
    bits_per_pixel: 24
});

// Set a pixel color
const pos = new Int16Array([100, 100]);
const color = new Uint8ClampedArray([255, 0, 0]); // Red
pb.set_pixel(pos, color);

// Draw a line
pb.draw_line([10, 10], [200, 150], color);

// Draw a filled polygon
const polygon = [[100, 100], [200, 100], [200, 200], [100, 200]];
pb.draw_polygon(polygon, color, true);
```

## Core Concepts

### Pixel Buffer

The `Pixel_Buffer` class is the central abstraction for image data. It supports multiple color depths:

- **1 bit per pixel (1bipp)**: Binary/monochrome images
- **8 bits per pixel (8bipp)**: Grayscale images (0-255)
- **24 bits per pixel (24bipp)**: RGB images (3 bytes per pixel)
- **32 bits per pixel (32bipp)**: RGBA images (4 bytes per pixel)

### TypedArrays

The library heavily uses JavaScript TypedArrays for performance:

- `Uint8Array` / `Uint8ClampedArray`: Pixel data storage
- `Int16Array` / `Int32Array`: Position coordinates
- `Float32Array`: Convolution kernels
- `BigInt64Array`: 64-bit operations for performance

### Coordinate System

- Origin (0, 0) is at the top-left corner
- X increases to the right
- Y increases downward
- Positions are typically expressed as `[x, y]` typed arrays

## Architecture Overview

The library is organized in a layered class hierarchy:

```
Pixel_Buffer_Core_Inner_Structures (Level 0)
    └── Pixel_Buffer_Core_Get_Set_Pixels (Level 1)
        └── Pixel_Buffer_Core_Draw_Lines (Level 1.1)
            └── Pixel_Buffer_Core_Draw_Polygons (Level 1.2)
                └── Pixel_Buffer_Core_Reference_Implementations (Level 2)
                    └── Pixel_Buffer_Core (Level 3)
                        └── Pixel_Buffer_Advanced_TypedArray_Properties (Level 4)
                            └── Pixel_Buffer_Idiomatic_Enh (Level 5)
                                └── Pixel_Buffer_Perf_Focus_Enh (Level 6)
                                    └── Pixel_Buffer_Specialised_Enh (Level 7)
                                        └── Pixel_Buffer_Enh (Level 8 - exported)
```

Each level adds specific functionality:

| Level | Class | Responsibility |
|-------|-------|----------------|
| 0 | Inner_Structures | Core data structures, size, position, TypedArray buffer |
| 1 | Get_Set_Pixels | Pixel-level read/write for all bit depths |
| 1.1 | Draw_Lines | Line drawing (Bresenham algorithm), horizontal lines |
| 1.2 | Draw_Polygons | Filled and outlined polygon rendering |
| 2 | Reference_Implementations | Reference implementations |
| 3 | Core | Core operations, convolutions, colorspace conversion |
| 4 | Advanced_TA_Properties | Advanced TypedArray property access |
| 5 | Idiomatic_Enh | User-friendly idiomatic methods |
| 6 | Perf_Focus_Enh | Performance-optimized operations |
| 7 | Specialised_Enh | Specialized algorithms (x-spans, windows) |
| 8 | Enh | Final exported class |

## Main Module Exports

```javascript
const gfx_core = require('jsgui3-gfx-core');

// Available exports:
gfx_core.Pixel_Buffer          // Main pixel buffer class
gfx_core.Pixel_Buffer_Painter  // Painting utilities
gfx_core.Pixel_Pos_List        // List of pixel positions
gfx_core.convolution_kernels   // Pre-defined convolution kernels
gfx_core.ta_math               // TypedArray math utilities
gfx_core.Rectangle             // Rectangle shape class
gfx_core.Rect                  // Alias for Rectangle
```

## Documentation Files

- [API Reference](./API.md) - Detailed API documentation
- [Architecture](./ARCHITECTURE.md) - Deep dive into the architecture
- [Pixel Buffer Guide](./PIXEL_BUFFER.md) - Complete Pixel_Buffer documentation
- [Shapes](./SHAPES.md) - Shape classes (Rectangle, Polygon)
- [TypedArray Math](./TA_MATH.md) - TypedArray mathematical operations
- [Convolutions](./CONVOLUTIONS.md) - Image convolution and kernels
- [Examples](./EXAMPLES.md) - Code examples and tutorials

## Dependencies

- **lang-mini**: Language utilities (type checking, iteration helpers)
- **obext**: Object extension utilities (read-only properties)
- **fnl**: Functional utilities

## Development Dependencies

- **fnlfs**: File system utilities
- **sharp**: Image processing (for examples/tests)

## License

MIT License

## Version

Current version: 0.0.24

## Roadmap

- **0.0.25**: Resize improvements and optimization
- **Future**: C++ acceleration support, WebGL/Vulkan integration
