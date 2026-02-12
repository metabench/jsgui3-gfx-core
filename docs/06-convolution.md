# Chapter 6: Convolution & Image Processing

Convolution is one of the most powerful features in jsgui3-gfx-core. It allows you to apply mathematical filters to pixel buffers — for edge detection, blurring, sharpening, and custom effects — all operating on the raw typed array data.

![Convolution Kernels](./svg/06-convolution-kernels.svg)

## How Convolution Works

A **convolution kernel** is a small matrix of weights (typically 3×3 or 5×5). To produce an output pixel:

1. **Center** the kernel on a source pixel
2. **Multiply** each kernel weight by the corresponding source pixel value
3. **Sum** all the products
4. **Clamp** the result to [0, 255]
5. Write the clamped value to the **output** pixel buffer

This is a **non-destructive** operation — a new `Pixel_Buffer` is always created, leaving the original unchanged.

## The Convolution Classes

Two classes handle convolution internally (in `core/convolution.js`):

### `Float32Convolution`

The primary convolution class. Stores the kernel as a `Float32Array`:

```js
const Float32Convolution = require('jsgui3-gfx-core/core/convolution');

const sharpen = new Float32Convolution({
    size: [3, 3],
    value: [0, -1, 0, -1, 5, -1, 0, -1, 0]
});
```

**Constructor spec:**
- `size` — `[width, height]` of the kernel (must be odd numbers)
- `value` — Array or `Float32Array` of kernel weights, row-major

**Properties:**
| Property | Type | Description |
|----------|------|-------------|
| `size` | `Array` | Kernel dimensions `[w, h]` |
| `ta` | `Float32Array` | The kernel weights |

### `Convolution` (Legacy)

Older class that uses regular JavaScript arrays. `Float32Convolution` is preferred for performance.

## Using Convolution

### API Path 1: `new_convolved(convolution)` — Level 3

Full control over the convolution kernel:

```js
const Float32Convolution = require('jsgui3-gfx-core/core/convolution');

// Create a 3×3 edge detection kernel
const edge_conv = new Float32Convolution({
    size: [3, 3],
    value: [-1, -1, -1, -1, 8, -1, -1, -1, -1]
});

// Apply to an 8bipp pixel buffer (returns a new buffer)
const edge_result = pb.new_convolved(edge_conv);
```

### API Path 2: `apply_square_convolution(f32a_kernel)` — Level 6

Simpler API when you already have a `Float32Array` kernel:

```js
const { convolution_kernels } = require('jsgui3-gfx-core');

// Apply edge detection using predefined kernel
const edges = pb.apply_square_convolution(
    new Float32Array(convolution_kernels.edge)
);
```

The kernel size is inferred from the array length: `sqrt(length)` must be an integer.

### API Path 3: `blur(size, sigma)` — Level 5

Convenience method for Gaussian blur:

```js
const blurred = pb.blur(5, 2);  // 5×5 kernel, sigma=2
const subtle_blur = pb.blur(3, 1);  // 3×3, less blur
```

This internally generates a Gaussian kernel using `convolution_kernels.get_gaussian_kernel(size, sigma)` and applies it.

## Predefined Kernels

The `convolution_kernels` module (`core/convolution-kernels/kernels.js`) exports:

| Key | Size | Type | Purpose |
|-----|------|------|---------|
| `edge` | 3×3 | `Float32Array` | Edge detection (Laplacian-style) |
| `sobel_x` | 3×3 | `Int8Array` | Horizontal edge detection (Sobel) |
| `sobel_y` | 3×3 | `Int8Array` | Vertical edge detection (Sobel) |
| `lap_gauss_5` | 5×5 | `Int8Array` | Laplacian of Gaussian |
| `gauss_blur_5_2` | 5×5 | `Float32Array` | Gaussian blur (σ=2) |

### Dynamic Kernel Generation

```js
const { convolution_kernels } = require('jsgui3-gfx-core');

// Generate a custom Gaussian kernel
const kernel_7x7 = convolution_kernels.get_gaussian_kernel(7, 3);
// Returns Float32Array(49) normalized so weights sum to 1.0
```

The `get_gaussian_kernel(diameter, sigma)` function:
1. Computes the 2D Gaussian function for each position
2. Normalizes all weights to sum to 1.0 (preserves brightness)
3. Returns a `Float32Array` of length `diameter²`

## Edge Detection Example

```js
const { Pixel_Buffer, convolution_kernels } = require('jsgui3-gfx-core');

// Create a test image with a sharp boundary
const pb = new Pixel_Buffer({ bits_per_pixel: 8, size: [100, 100] });
// Left half white, right half black
for (let x = 0; x < 50; x++) {
    for (let y = 0; y < 100; y++) {
        pb.set_pixel_8bipp(new Int16Array([x, y]), 255);
    }
}

// Detect edges
const edges = pb.apply_square_convolution(
    new Float32Array(convolution_kernels.edge)
);
// The edge column at x=49/50 will have high values; rest near 0
```

## Sobel Gradient Magnitude

Combine horizontal and vertical Sobel filters to compute gradient magnitude:

```js
const gx = pb.apply_square_convolution(
    new Float32Array(convolution_kernels.sobel_x)
);
const gy = pb.apply_square_convolution(
    new Float32Array(convolution_kernels.sobel_y)
);

// Compute magnitude: sqrt(gx² + gy²)
const magnitude = gx.blank_copy();
gx.each_pixel((pos, val_x) => {
    const val_y = gy.get_pixel(pos);
    const mag = Math.min(255, Math.sqrt(val_x * val_x + val_y * val_y));
    magnitude.set_pixel(pos, mag);
});
```

## Channel Extraction + Convolution (Level 6)

For multi-channel buffers, extract and process channels independently:

```js
// Extract red channel from a 24bipp buffer
const red = pb_24.extract_channel(0);  // 0=R, 1=G, 2=B

// Apply edge detection to just the red channel
const red_edges = red.apply_square_convolution(
    new Float32Array(convolution_kernels.edge)
);
```

## Custom Kernels

Define your own kernels as flat arrays in row-major order:

```js
// Sharpen kernel
const sharpen = new Float32Array([
    0, -1,  0,
   -1,  5, -1,
    0, -1,  0
]);
const sharpened = pb.apply_square_convolution(sharpen);

// Emboss kernel
const emboss = new Float32Array([
   -2, -1,  0,
   -1,  1,  1,
    0,  1,  2
]);
const embossed = pb.apply_square_convolution(emboss);

// Box blur (averaging)
const box_blur = new Float32Array([
    1/9, 1/9, 1/9,
    1/9, 1/9, 1/9,
    1/9, 1/9, 1/9
]);
const averaged = pb.apply_square_convolution(box_blur);
```

## Performance Notes

- **`apply_square_convolution`** (Level 6) uses typed array operations and is faster than the Level 3 `new_convolved` for square kernels
- Convolution on 8bipp buffers is fastest — consider converting to greyscale first if color isn't needed
- Large kernels (7×7+) are significantly slower; use Gaussian blur (separable) when possible
- The library allocates a new output buffer per convolution — reuse or discard results promptly in memory-constrained environments

---

**← [Chapter 5: Drawing](./05-drawing.md)** | **[Chapter 7: TypedArray Math Subsystem →](./07-ta-math.md)**
