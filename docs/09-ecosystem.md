# Chapter 9: Ecosystem & Integration

## The jsgui3 Ecosystem

`jsgui3-gfx-core` is the graphics foundation layer of a larger ecosystem:

```
┌───────────────────────────────────────────────────┐
│                  Applications                      │
├───────────────────────────────────────────────────┤
│                jsgui3-html                         │
│    DOM Controls, Server-Side Rendering, UI Layer   │
├───────────────────────────────────────────────────┤
│              jsgui3-gfx-core                       │  ← This library
│   Pixel Buffers, Drawing, Convolution, Shapes      │
├───────────────────────────────────────────────────┤
│       lang-mini          obext          fnl        │
│   Type checking,     Object props,   Functional    │
│   iteration, etc.    ro(), prop()    utilities      │
└───────────────────────────────────────────────────┘
```

### Relationship with jsgui3-html

`jsgui3-html` is the DOM/UI layer. It can use `jsgui3-gfx-core` for:

- **Canvas rendering** — Transfer pixel buffer data to a `<canvas>` element
- **Image analysis** — Process images loaded from DOM sources
- **Off-screen computation** — Generate visual data without DOM dependency

The two packages are **independent** — `jsgui3-gfx-core` has no dependency on `jsgui3-html`.

## Integration Patterns

### Node.js: File I/O with Sharp

The library's pixel data is raw `Uint8Array` — it integrates naturally with image I/O libraries like `sharp`:

```js
const sharp = require('sharp');
const { Pixel_Buffer } = require('jsgui3-gfx-core');

// Load an image into a Pixel_Buffer
async function load_image(filepath) {
    const { data, info } = await sharp(filepath)
        .raw()
        .toBuffer({ resolveWithObject: true });

    return new Pixel_Buffer({
        bits_per_pixel: info.channels * 8,  // 24 or 32
        size: [info.width, info.height],
        ta: new Uint8Array(data.buffer)
    });
}

// Save a Pixel_Buffer to file
async function save_image(pb, filepath) {
    await sharp(Buffer.from(pb.ta.buffer), {
        raw: {
            width: pb.size[0],
            height: pb.size[1],
            channels: pb.bypp
        }
    }).png().toFile(filepath);
}
```

### Browser: Canvas Integration

Transfer pixel buffer data to/from an HTML Canvas:

```js
const { Pixel_Buffer } = require('jsgui3-gfx-core');

// Canvas → Pixel_Buffer
function from_canvas(canvas) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return new Pixel_Buffer({
        bits_per_pixel: 32,
        size: [canvas.width, canvas.height],
        ta: new Uint8Array(imageData.data.buffer)
    });
}

// Pixel_Buffer → Canvas
function to_canvas(pb, canvas) {
    const ctx = canvas.getContext('2d');
    // Convert to 32bipp if needed
    const rgba = pb.bipp === 32 ? pb : pb.to_32bit_rgba();
    const imageData = new ImageData(
        new Uint8ClampedArray(rgba.ta.buffer),
        rgba.size[0],
        rgba.size[1]
    );
    ctx.putImageData(imageData, 0, 0);
}
```

### Image Processing Pipeline

Chain operations to build a processing pipeline:

```js
const { Pixel_Buffer, convolution_kernels } = require('jsgui3-gfx-core');

async function process_image(input_path, output_path) {
    // Load
    const original = await load_image(input_path);

    // Convert to greyscale
    const grey = original.to_8bipp();

    // Apply Gaussian blur to reduce noise
    const blurred = grey.blur(5, 2);

    // Detect edges
    const edges = blurred.apply_square_convolution(
        new Float32Array(convolution_kernels.edge)
    );

    // Threshold to binary mask
    const mask = edges.get_1bipp_threshold_8bipp(30);

    // Save result
    const result = mask.to_24bipp();  // Convert for PNG compatibility
    await save_image(result, output_path);
}
```

### WebWorker Usage

Since the pixel buffer is entirely typed-array-based, it's ideal for WebWorker processing:

```js
// Main thread
const worker = new Worker('processor.js');
worker.postMessage({
    ta: pb.ta.buffer,
    size: [pb.size[0], pb.size[1]],
    bipp: pb.bipp
}, [pb.ta.buffer]);  // Transfer ownership

// Worker thread (processor.js)
self.onmessage = function(e) {
    const { Pixel_Buffer, convolution_kernels } = require('jsgui3-gfx-core');
    const pb = new Pixel_Buffer({
        bits_per_pixel: e.data.bipp,
        size: e.data.size,
        ta: new Uint8Array(e.data.ta)
    });
    const result = pb.blur(5, 2);
    self.postMessage({ ta: result.ta.buffer }, [result.ta.buffer]);
};
```

## Dependencies Deep Dive

### lang-mini

Used throughout for type-safe operations:

```js
const { each, fp, tof, tf, get_a_sig, are_equal } = require('lang-mini');

// tof(val) — returns string type (like typeof but better)
tof([1,2,3])           // 'array'
tof(new Int16Array(2)) // 'int16array'

// tf(val) — returns type flag bitmask (faster than string compare)
// Used in hot code paths

// each(collection, fn) — iterate arrays, objects, typed arrays
each(my_array, (item, i) => { ... });

// get_a_sig(args) — analyze argument signatures
// Used for method overloading in constructors

// are_equal(a, b) — deep equality check
are_equal([1,2,3], [1,2,3])  // true
```

### obext

Defines managed properties on objects:

```js
const { ro, prop } = require('obext');

// ro(obj, name, getter) — read-only property
ro(this, 'bypr', () => this._bypr);  // Cannot be set externally

// prop(obj, name, getter, setter) — managed property
prop(this, 'bipp', () => this._bipp, (val) => {
    this._bipp = val;
    this._recalculate();
});
```

These are used extensively in `Pixel_Buffer_Core_Inner_Structures` to set up the property system that makes pixel buffers behave intuitively.

## Testing

```bash
npm test
```

Tests are in `tests/` and use a custom test runner (`tests/run-tests.js`). The runner discovers `.test.js` files and reports pass/fail results.

Current test coverage includes:
- `pixel-pos-list.test.js` — Pixel position list operations

## Examples

The `examples/` directory contains usage examples. These typically require `sharp` (a dev dependency) for loading/saving actual image files.

---

**← [Chapter 8: Utilities](./08-utilities.md)** | **[Chapter 10: Dense Agent Reference →](./10-agent-reference.md)**
