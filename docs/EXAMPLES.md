# Examples and Tutorials

This document provides practical examples for using `jsgui3-gfx-core`.

## Table of Contents

1. [Basic Pixel Buffer Operations](#basic-pixel-buffer-operations)
2. [Working with Different Bit Depths](#working-with-different-bit-depths)
3. [Drawing Shapes](#drawing-shapes)
4. [Image Processing](#image-processing)
5. [Windowing Operations](#windowing-operations)
6. [Advanced Techniques](#advanced-techniques)

---

## Basic Pixel Buffer Operations

### Creating a Pixel Buffer

```javascript
const gfx_core = require('jsgui3-gfx-core');
const { Pixel_Buffer } = gfx_core;

// Create a 24-bit RGB image (800x600)
const pb = new Pixel_Buffer({
    size: [800, 600],
    bits_per_pixel: 24
});

console.log(`Created ${pb.size[0]}x${pb.size[1]} image`);
console.log(`Bits per pixel: ${pb.bipp}`);
console.log(`Bytes per row: ${pb.bypr}`);
console.log(`Total bytes: ${pb.ta.length}`);
```

### Setting and Getting Pixels

```javascript
// Create position as typed array (for performance)
const pos = new Int16Array(2);

// Set pixels
pos[0] = 100;
pos[1] = 50;

// For 24bipp, color is [R, G, B]
const red = new Uint8ClampedArray([255, 0, 0]);
pb.set_pixel(pos, red);

// Get the pixel back
const color = pb.get_pixel(pos);
console.log(`Pixel color: R=${color[0]}, G=${color[1]}, B=${color[2]}`);
```

### Filling the Entire Buffer

```javascript
// Fill with white
pb.color_whole(new Uint8ClampedArray([255, 255, 255]));

// Fill with a solid color
const blue = new Uint8ClampedArray([0, 0, 255]);
pb.color_whole(blue);
```

### Cloning and Copying

```javascript
// Create an exact copy
const pb_copy = pb.clone();

// Create a blank copy (same size, filled with zeros)
const pb_blank = pb.blank_copy();
```

---

## Working with Different Bit Depths

### 1-Bit Per Pixel (Monochrome)

```javascript
// Create a 1-bit monochrome image
const pb_mono = new Pixel_Buffer({
    size: [640, 480],
    bits_per_pixel: 1
});

const pos = new Int16Array(2);

// Set pixel ON (white/1)
pos[0] = 100;
pos[1] = 100;
pb_mono.set_pixel_on_1bipp(pos);

// Set pixel OFF (black/0)
pos[0] = 101;
pos[1] = 100;
pb_mono.set_pixel_off_1bipp(pos);

// Set using value
pb_mono.set_pixel_1bipp(pos, 1);  // ON
pb_mono.set_pixel_1bipp(pos, 0);  // OFF

// Get pixel value (returns 0 or 1)
const value = pb_mono.get_pixel_1bipp(pos);
```

### 8-Bit Per Pixel (Grayscale)

```javascript
// Create an 8-bit grayscale image
const pb_gray = new Pixel_Buffer({
    size: [512, 512],
    bits_per_pixel: 8
});

// Set grayscale value (0-255)
pos[0] = 100;
pos[1] = 100;
pb_gray.set_pixel(pos, 128);  // Middle gray

// Create a gradient
for (let x = 0; x < 256; x++) {
    for (let y = 0; y < 256; y++) {
        pos[0] = x;
        pos[1] = y;
        pb_gray.set_pixel(pos, x);
    }
}
```

### 32-Bit Per Pixel (RGBA)

```javascript
// Create a 32-bit RGBA image
const pb_rgba = new Pixel_Buffer({
    size: [800, 600],
    bits_per_pixel: 32
});

// Set pixel with alpha
const semi_transparent_red = new Uint8ClampedArray([255, 0, 0, 128]);
pb_rgba.set_pixel(pos, semi_transparent_red);
```

### Converting Between Bit Depths

```javascript
// 24bipp to 8bipp (grayscale)
const pb_24 = new Pixel_Buffer({
    size: [100, 100],
    bits_per_pixel: 24
});
const grayscale = pb_24.to_8bipp();

// 8bipp to 24bipp
const rgb = grayscale.to_24bipp();

// Add alpha channel (24bipp -> 32bipp)
const with_alpha = pb_24.add_alpha_channel();

// 1bipp to 8bipp
const pb_1 = new Pixel_Buffer({
    size: [100, 100],
    bits_per_pixel: 1
});
const expanded = pb_1.to_8bipp();

// 8bipp to 1bipp (threshold)
const binary = grayscale.get_1bipp_threshold_8bipp(128);
```

---

## Drawing Shapes

### Drawing Lines

```javascript
const pb = new Pixel_Buffer({
    size: [400, 400],
    bits_per_pixel: 24
});

// Fill with white background
pb.color_whole(new Uint8ClampedArray([255, 255, 255]));

// Draw a red diagonal line
const red = new Uint8ClampedArray([255, 0, 0]);
pb.draw_line([10, 10], [390, 390], red);

// Draw a green horizontal line
const green = new Uint8ClampedArray([0, 255, 0]);
pb.draw_line([10, 200], [390, 200], green);

// Draw a blue vertical line
const blue = new Uint8ClampedArray([0, 0, 255]);
pb.draw_line([200, 10], [200, 390], blue);
```

### Drawing Horizontal Lines (Optimized)

```javascript
// draw_horizontal_line is optimized for performance
const xspan = [50, 350];  // [start_x, end_x] inclusive
const y = 100;
pb.draw_horizontal_line(xspan, y, red);
```

### Drawing Rectangles

```javascript
// Draw a filled rectangle
const corner1 = [50, 50];
const corner2 = [150, 150];
const color = new Uint8ClampedArray([255, 128, 0]);  // Orange
pb.draw_rect(corner1, corner2, color);
```

### Drawing Polygons

```javascript
// Define polygon vertices
const triangle = [
    [200, 50],   // Top
    [100, 200],  // Bottom-left
    [300, 200]   // Bottom-right
];

// Draw outline only
const outline_color = new Uint8ClampedArray([0, 0, 0]);  // Black
pb.draw_polygon(triangle, outline_color, false);

// Draw filled polygon
const fill_color = new Uint8ClampedArray([255, 0, 0]);
pb.draw_polygon(triangle, fill_color, true);

// Complex polygon (star)
const star = [
    [200, 50],   // Top point
    [220, 130],  // Inner right
    [300, 150],  // Right point
    [240, 190],  // Inner lower right
    [260, 280],  // Bottom right point
    [200, 230],  // Inner bottom
    [140, 280],  // Bottom left point
    [160, 190],  // Inner lower left
    [100, 150],  // Left point
    [180, 130]   // Inner left
];
pb.draw_polygon(star, new Uint8ClampedArray([255, 215, 0]), true);  // Gold
```

### Drawing on 1bipp Buffers

```javascript
const pb_mono = new Pixel_Buffer({
    size: [200, 200],
    bits_per_pixel: 1
});

// Draw a line (color is 0 or 1)
pb_mono.draw_line([10, 10], [190, 190], 1);

// Draw a filled polygon
const square = [[50, 50], [150, 50], [150, 150], [50, 150]];
pb_mono.draw_polygon(square, 1, true);

// Draw horizontal line (optimized)
pb_mono.draw_horizontal_line_on_1bipp_inclusive([20, 180], 100);
```

---

## Image Processing

### Channel Separation

```javascript
const pb = new Pixel_Buffer({
    size: [100, 100],
    bits_per_pixel: 24
});

// ... fill with image data ...

// Split into separate R, G, B channels (each is 8bipp)
const [r_channel, g_channel, b_channel] = pb.split_rgb_channels;

// Each channel is a separate 8bipp Pixel_Buffer
console.log(`Red channel size: ${r_channel.size}`);
```

### Applying Convolutions

```javascript
const gfx_core = require('jsgui3-gfx-core');
const Float32Convolution = require('jsgui3-gfx-core/core/convolution');
const { Pixel_Buffer, convolution_kernels } = gfx_core;

const pb = new Pixel_Buffer({
    size: [200, 200],
    bits_per_pixel: 24
});

// Apply edge detection
const edge_conv = new Float32Convolution({
    size: [3, 3],
    value: convolution_kernels.edge
});
const edges = pb.new_convolved(edge_conv);

// Apply Gaussian blur
const blur_conv = new Float32Convolution({
    size: [5, 5],
    value: convolution_kernels.get_gauss(5, 2)  // 5x5, sigma=2
});
const blurred = pb.new_convolved(blur_conv);

// Convenience method for blur
const blurred2 = pb.blur(5, 2);
```

### Using Different Kernels

```javascript
const kernels = gfx_core.convolution_kernels;

// Sobel edge detection (X direction)
const sobel_x = new Float32Convolution({
    size: [3, 3],
    value: kernels.sobel_x
});

// Sobel edge detection (Y direction)
const sobel_y = new Float32Convolution({
    size: [3, 3],
    value: kernels.sobel_y
});

// Laplacian of Gaussian
const log = new Float32Convolution({
    size: [5, 5],
    value: kernels.lap_gauss_5
});
```

### Resizing Images

```javascript
const pb = new Pixel_Buffer({
    size: [800, 600],
    bits_per_pixel: 24
});

// Resize to new dimensions
const resized = pb.new_resized([400, 300]);  // Half size
const enlarged = pb.new_resized([1600, 1200]);  // Double size
```

### Cropping and Padding

```javascript
const pb = new Pixel_Buffer({
    size: [200, 200],
    bits_per_pixel: 24
});

// Crop 10 pixels from all edges
const cropped = pb.crop(10);  // Now 180x180

// Add 20 pixels of black padding
const padded = pb.uncrop(20, new Uint8ClampedArray([0, 0, 0]));  // Now 240x240
```

---

## Windowing Operations

Windows allow efficient access to sub-regions of a buffer.

### Creating a Window

```javascript
const pb_source = new Pixel_Buffer({
    size: [800, 600],
    bits_per_pixel: 24
});

// Create a 3x3 window at position (100, 100)
const window = pb_source.new_window({
    size: [3, 3],
    pos: [100, 100]
});

// Window data is copied from source
console.log(`Window size: ${window.size}`);
console.log(`Window ta length: ${window.ta.length}`);  // 27 bytes (3x3x3)
```

### Moving the Window

```javascript
// Move to a new position
window.pos[0] = 150;
window.pos[1] = 150;
window.copy_from_source();  // Update window data

// Or use move() with a vector
window.move(new Int16Array([10, 0]));  // Move right 10 pixels

// Iterate through all positions
while (window.move_next_px()) {
    // Process window at each position
    const center_pixel = window.get_pixel(new Int16Array([1, 1]));
}
```

### Using Windows for Convolution

```javascript
const kernel_size = [3, 3];

// Set up iteration bounds
const margin = 1;  // Kernel extends 1 pixel in each direction
pb_source.pos_bounds = [
    margin,                    // left
    margin,                    // top
    pb_source.size[0] - margin,  // right
    pb_source.size[1] - margin   // bottom
];

const window = pb_source.new_window({
    size: kernel_size,
    pos_bounds: pb_source.pos_bounds,
    pos: [margin, margin]
});

// Iterate within bounds
pb_source.each_pos_within_bounds(() => {
    // window.ta contains the 3x3 neighborhood
    // Apply convolution or other processing
});
```

---

## Advanced Techniques

### Iterating Over All Pixels

```javascript
const pb = new Pixel_Buffer({
    size: [100, 100],
    bits_per_pixel: 24
});

// Method 1: each_pixel_pos
pb.each_pixel_pos((pos, stop) => {
    const color = pb.get_pixel(pos);
    // Modify color...
    pb.set_pixel(pos, color);

    // Optional: stop early
    if (some_condition) stop();
});

// Method 2: each_px with typed arrays (faster)
const ta_pos = new Int32Array(2);
const ta_color = new Uint8ClampedArray(3);
const ta_info = new Uint32Array(4);

pb.each_px(ta_pos, ta_color, ta_info, (update) => {
    // ta_pos: [x, y]
    // ta_color: [r, g, b]
    // ta_info: [width, height, pixel_index, bipp]

    // Modify ta_color and call update()
    ta_color[0] = 255 - ta_color[0];  // Invert red
    update();
});

// Method 3: Direct byte index iteration (fastest)
pb.each_pixel_byte_index((byte_idx, stop) => {
    // For 24bipp: byte_idx, byte_idx+1, byte_idx+2 are R, G, B
    pb.ta[byte_idx] = 255 - pb.ta[byte_idx];  // Invert
});
```

### Working with X-Spans (1bipp)

```javascript
const pb_mono = new Pixel_Buffer({
    size: [100, 100],
    bits_per_pixel: 1
});

// Draw some content...

// Get all "on" x-spans per row
const on_spans = pb_mono.calculate_arr_rows_arr_x_on_spans_1bipp();
// Returns: [[row0_spans], [row1_spans], ...]
// Each span: [x_start, x_end] inclusive

// Get all "off" x-spans per row
const off_spans = pb_mono.calculate_arr_rows_arr_x_off_spans_1bipp();

// Process spans
for (let y = 0; y < on_spans.length; y++) {
    for (const [x1, x2] of on_spans[y]) {
        console.log(`Row ${y}: span from ${x1} to ${x2}`);
    }
}
```

### Drawing Bitmap Masks

```javascript
const pb_target = new Pixel_Buffer({
    size: [400, 400],
    bits_per_pixel: 24
});

const pb_mask = new Pixel_Buffer({
    size: [50, 50],
    bits_per_pixel: 1
});

// Create a pattern in the mask
const triangle = [[25, 5], [5, 45], [45, 45]];
pb_mask.draw_polygon(triangle, 1, true);

// Draw the mask at a position with a color
const dest_pos = [100, 100];
const mask_color = new Uint8ClampedArray([255, 0, 0]);
pb_target.draw_1bipp_pixel_buffer_mask(pb_mask, dest_pos, mask_color);
```

### Using Rectangle and Polygon Classes

```javascript
const { Rectangle, Pixel_Buffer } = require('jsgui3-gfx-core');
const Polygon = require('jsgui3-gfx-core/core/shapes/Polygon');

// Create rectangles
const rect1 = new Rectangle([100, 50], [10, 20]);  // [width, height], [x, y]
console.log(`Position: ${rect1.x}, ${rect1.y}`);
console.log(`Size: ${rect1.width} x ${rect1.height}`);
console.log(`Right edge: ${rect1.right}`);
console.log(`Bottom edge: ${rect1.bottom}`);

// Extend rectangle
rect1.extend('left', 20);
rect1.extend('down', 30);

// Check overlap between rectangles
const rect2 = new Rectangle([50, 50], [50, 40]);
const overlap = rect1.overlaps(rect2);
if (overlap) {
    console.log(`Overlap at: ${overlap.x}, ${overlap.y}`);
    console.log(`Overlap size: ${overlap.width} x ${overlap.height}`);
}

// Create polygon
const polygon = new Polygon([[100, 100], [200, 100], [200, 200], [100, 200]]);
console.log(`Bounding box: ${polygon.ta_bounding_box}`);

// Get scanline edges for rendering
const scanline_edges = polygon.scanline_edges;
```

### Color Analysis

```javascript
const pb = new Pixel_Buffer({
    size: [100, 100],
    bits_per_pixel: 24
});

// ... fill with image data ...

// Count unique colors
const num_colors = pb.count_colors();
console.log(`Image contains ${num_colors} unique colors`);

// Count pixels of a specific color
const red_pixels = pb.count_pixels_with_color(new Uint8ClampedArray([255, 0, 0]));
console.log(`Red pixels: ${red_pixels}`);

// Check buffer equality
const pb2 = pb.clone();
console.log(`Buffers equal: ${pb.equals(pb2)}`);
```

### Using ta_math for Low-Level Operations

```javascript
const { ta_math } = require('jsgui3-gfx-core');

// Copy a rectangular region
const source_ta = pb_source.ta;
const dest_ta = pb_dest.ta;
ta_math.copy_rect_to_same_size_24bipp(
    source_ta, dest_ta,
    source_bypr, dest_bypr,
    bounds
);

// Fill a rectangle
const bounds = new Int16Array([10, 20, 100, 80]);  // [left, top, right, bottom]
const color = new Uint8ClampedArray([255, 0, 0]);
ta_math.fill_solid_rect_by_bounds(
    pb.ta,
    pb.bytes_per_row,
    bounds,
    24,  // bipp
    color
);

// Bitwise operations for 1bipp
const bit = ta_math.get_bit(pb.ta, bit_index);
const count = ta_math.count_1s(pb.ta);

// Find next set bit
const next_bit = ta_math.fast_find_next_set_ta_bit(pb.ta, start_index, limit);
```

---

## Integration with Sharp (Node.js)

For file I/O in Node.js, use the `sharp` library:

```javascript
const sharp = require('sharp');
const { Pixel_Buffer } = require('jsgui3-gfx-core');

async function loadImage(filepath) {
    const { data, info } = await sharp(filepath)
        .raw()
        .toBuffer({ resolveWithObject: true });

    return new Pixel_Buffer({
        size: [info.width, info.height],
        bits_per_pixel: info.channels * 8,
        buffer: data
    });
}

async function saveImage(pb, filepath) {
    await sharp(Buffer.from(pb.ta), {
        raw: {
            width: pb.size[0],
            height: pb.size[1],
            channels: pb.bytes_per_pixel
        }
    }).toFile(filepath);
}

// Usage
async function main() {
    const pb = await loadImage('input.png');

    // Process...
    pb.draw_polygon([[10, 10], [100, 10], [100, 100], [10, 100]],
                    new Uint8ClampedArray([255, 0, 0]), true);

    await saveImage(pb, 'output.png');
}
```
