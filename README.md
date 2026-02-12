# jsgui3-gfx-core

**Pure-JavaScript pixel buffer library.** Data structures and algorithms for creating, manipulating, and processing raster images as typed arrays. No Canvas, no DOM — runs identically in Node.js and browsers.

## Install

```bash
npm install jsgui3-gfx-core
```

## Quick Start

```js
const { Pixel_Buffer, Pixel_Buffer_Painter, convolution_kernels } = require('jsgui3-gfx-core');

// Create a 256×256 RGB pixel buffer
const pb = new Pixel_Buffer({ bits_per_pixel: 24, size: [256, 256] });

// Fill with a base color
pb.color_whole([20, 30, 80]);

// Draw rectangles with the Painter (fluent API)
const painter = new Pixel_Buffer_Painter({ pb });
painter
    .rect([30, 30], [80, 40], [255, 60, 60])
    .rect([60, 50], [80, 40], [60, 200, 60])
    .rect([90, 70], [80, 40], [60, 60, 255]);

// Apply edge detection
const grey = pb.to_8bipp();
const edges = grey.apply_square_convolution(
    new Float32Array(convolution_kernels.edge)
);
```

## Features

| Feature | Description |
|---------|-------------|
| **Pixel Buffers** | 1bipp, 8bipp, 24bipp, 32bipp — all backed by `Uint8Array` |
| **Drawing** | Lines (Bresenham), filled polygons (scanline), rectangles |
| **Convolution** | Edge detection, Gaussian blur, Sobel, custom kernels |
| **Format Conversion** | Greyscale ↔ RGB ↔ RGBA, threshold to binary |
| **Resize** | Area-weighted sampling for quality downscaling |
| **Masking** | 1bipp masks for compositing and region operations |
| **Typed Array Math** | Low-level bitwise, copy, fill, and transform operations |
| **Shapes** | Rectangle and Polygon geometry classes |

## Exports

```js
const {
    Pixel_Buffer,          // Full-featured pixel buffer (10-layer class hierarchy)
    Pixel_Buffer_Painter,  // Fluent rectangle drawing API
    Pixel_Pos_List,        // Sparse pixel coordinate storage
    convolution_kernels,   // Predefined convolution kernels
    ta_math,               // TypedArray math operations
    Rectangle, Rect        // Rectangle geometry
} = require('jsgui3-gfx-core');
```

## Supported Bit Depths

| Format | `bits_per_pixel` | Use Case |
|--------|-----------------|----------|
| 1bipp  | 1  | Binary masks, thresholds |
| 8bipp  | 8  | Greyscale images |
| 24bipp | 24 | RGB color images |
| 32bipp | 32 | RGBA with transparency |

## Convolution Kernels

```js
convolution_kernels.edge            // 3×3 edge detection
convolution_kernels.sobel_x         // 3×3 horizontal Sobel
convolution_kernels.sobel_y         // 3×3 vertical Sobel
convolution_kernels.lap_gauss_5     // 5×5 Laplacian of Gaussian
convolution_kernels.gauss_blur_5_2  // 5×5 Gaussian blur (σ=2)

// Generate custom Gaussian kernel
convolution_kernels.get_gaussian_kernel(7, 3)  // 7×7, σ=3
```

## Integration

Works with **Sharp** (Node.js) and **Canvas** (browser):

```js
// Sharp → Pixel_Buffer
const { data, info } = await sharp('input.png').raw().toBuffer({ resolveWithObject: true });
const pb = new Pixel_Buffer({ bits_per_pixel: info.channels * 8, size: [info.width, info.height], ta: new Uint8Array(data.buffer) });

// Canvas → Pixel_Buffer
const imageData = ctx.getImageData(0, 0, w, h);
const pb = new Pixel_Buffer({ bits_per_pixel: 32, size: [w, h], ta: new Uint8Array(imageData.data.buffer) });
```

## Documentation

Full documentation with SVG illustrations available in [`docs/`](./docs/):

1. [Introduction & Overview](./docs/01-introduction.md)
2. [Installation & Getting Started](./docs/02-installation.md)
3. [Architecture & Class Hierarchy](./docs/03-architecture.md)
4. [Pixel Buffer API Reference](./docs/04-pixel-buffer-api.md)
5. [Drawing — Lines, Polygons, Rectangles](./docs/05-drawing.md)
6. [Convolution & Image Processing](./docs/06-convolution.md)
7. [TypedArray Math Subsystem](./docs/07-ta-math.md)
8. [Shapes, Pixel_Pos_List & Utilities](./docs/08-utilities.md)
9. [Ecosystem & Integration](./docs/09-ecosystem.md)
10. [Dense Agent Reference](./docs/10-agent-reference.md)

## Dependencies

| Package | Purpose |
|---------|---------|
| [`lang-mini`](https://www.npmjs.com/package/lang-mini) | Type checking, iteration, comparison |
| [`obext`](https://www.npmjs.com/package/obext) | Read-only and managed property definitions |
| [`fnl`](https://www.npmjs.com/package/fnl) | Functional utilities |

## Testing

```bash
npm test
```

## License

MIT
