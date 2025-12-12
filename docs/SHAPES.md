# Shapes Module Documentation

The shapes module provides geometric shape classes for use with the graphics core library.

## Table of Contents

1. [Shape (Base Class)](#shape-base-class)
2. [Rectangle](#rectangle)
3. [Polygon](#polygon)
4. [Polygon_Scanline_Edges](#polygon_scanline_edges)
5. [ScanlineProcessor](#scanlineprocessor)

---

## Shape (Base Class)

The base class for all shapes. Currently serves as a marker class for inheritance.

### Location

```javascript
const Shape = require('jsgui3-gfx-core/core/shapes/Shape');
```

### Usage

Shapes inherit from this class to enable `instanceof` checks and future common functionality.

```javascript
const shape = new Shape();
console.log(shape instanceof Shape);  // true
```

---

## Rectangle

A rectangle shape with position and size, supporting various geometric operations.

### Location

```javascript
const { Rectangle, Rect } = require('jsgui3-gfx-core');
// or
const Rectangle = require('jsgui3-gfx-core/core/shapes/Rectangle');
```

### Constructor

```javascript
const rect = new Rectangle([width, height], [x, y]);
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `[width, height]` | `Array[2]` | Dimensions of the rectangle |
| `[x, y]` | `Array[2]` | Position (top-left corner) |

### Properties

#### Position and Size

| Property | Type | Access | Description |
|----------|------|--------|-------------|
| `x` | `Number` | get/set | X coordinate (left edge) |
| `y` | `Number` | get/set | Y coordinate (top edge) |
| `w` / `width` | `Number` | get/set | Width |
| `h` / `height` | `Number` | get/set | Height |
| `pos` | `Array[2]` | get/set | Position as `[x, y]` |
| `size` | `Array[2]` | get/set | Size as `[width, height]` |

#### Edge Positions

| Property | Type | Access | Description |
|----------|------|--------|-------------|
| `left` | `Number` | get | Left edge (same as `x`) |
| `top` | `Number` | get/set | Top edge |
| `right` | `Number` | get | Right edge (`x + width`) |
| `bottom` | `Number` | get | Bottom edge |

#### BCR Interface Properties

For compatibility with browser `getBoundingClientRect()`:

| Property | Type | Description |
|----------|------|-------------|
| `0` | `Array[2]` | Top-left corner `[x, y]` |
| `1` | `Array[2]` | Bottom-right corner `[right, bottom]` |
| `2` | `Array[2]` | Size `[width, height]` |

#### Coordinate System

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `up_is_negitive` | `Boolean` | `true` | Whether Y increases downward |

### Methods

#### extend(direction, pixels)

Extend the rectangle in a specified direction.

```javascript
const rect = new Rectangle([100, 50], [200, 200]);

// Extend left by 30 pixels
rect.extend('left', 30);   // or 'l'
// x becomes 170, width becomes 130

// Extend right by 30 pixels
rect.extend('right', 30);  // or 'r'
// width becomes 160

// Extend upward by 20 pixels
rect.extend('up', 20);     // or 'u'
// y becomes 180, height becomes 70

// Extend downward by 20 pixels
rect.extend('down', 20);   // or 'd'
// height becomes 90

// Method is chainable
rect.extend('l', 10).extend('r', 10);
```

**Direction values**: `'left'`, `'l'`, `'right'`, `'r'`, `'up'`, `'u'`, `'down'`, `'d'`

#### overlaps(target)

Check for overlap with another rectangle or control.

```javascript
const rect1 = new Rectangle([100, 100], [50, 50]);
const rect2 = new Rectangle([80, 80], [100, 100]);

const overlap = rect1.overlaps(rect2);

if (overlap) {
    console.log(`Overlap found!`);
    console.log(`Position: ${overlap.x}, ${overlap.y}`);
    console.log(`Size: ${overlap.width} x ${overlap.height}`);
} else {
    console.log('No overlap');
}
```

**Parameters:**
- `target`: `Rectangle`, `Control` (jsgui3-html), or `Array<Control>`

**Returns:**
- `Rectangle`: The overlapping region as a new Rectangle
- `false`: If no overlap exists
- `Array<Rectangle>`: When target is an array, returns array of overlapping rectangles

### Examples

```javascript
const Rectangle = require('jsgui3-gfx-core').Rectangle;

// Create a rectangle
const rect = new Rectangle([200, 100], [50, 75]);

// Access properties
console.log(`Position: (${rect.x}, ${rect.y})`);        // (50, 75)
console.log(`Size: ${rect.width} x ${rect.height}`);    // 200 x 100
console.log(`Left: ${rect.left}`);                      // 50
console.log(`Top: ${rect.top}`);                        // 75
console.log(`Right: ${rect.right}`);                    // 250
console.log(`Bottom: ${rect.bottom}`);                  // 175

// Modify position
rect.x = 100;
rect.y = 100;

// Modify size
rect.width = 150;
rect.height = 75;

// Use array properties
rect.pos = [200, 200];
rect.size = [300, 150];

// Collision detection
const rect2 = new Rectangle([100, 100], [250, 250]);
const collision = rect.overlaps(rect2);
```

---

## Polygon

A polygon shape defined by a series of vertices.

### Location

```javascript
const Polygon = require('jsgui3-gfx-core/core/shapes/Polygon');
```

### Constructor

```javascript
// From array of [x, y] pairs
const polygon = new Polygon([[x1, y1], [x2, y2], [x3, y3], ...]);

// From flat typed array
const polygon = new Polygon(new Uint32Array([x1, y1, x2, y2, x3, y3, ...]));
```

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `ta_points` | `Uint32Array` | Flat array of points `[x1, y1, x2, y2, ...]` |
| `ta_bounding_box` | `Uint32Array[4]` | Bounding box `[min_x, min_y, max_x, max_y]` |
| `offset` | `Uint32Array[2]` | Translation offset `[x, y]` |
| `scanline_edges` | `Polygon_Scanline_Edges` | Edges prepared for scanline rendering |

### Methods

#### downshifted()

Create a copy of the polygon translated so its bounding box starts at (0, 0).

```javascript
const polygon = new Polygon([[100, 100], [200, 100], [200, 200], [100, 200]]);

const shifted = polygon.downshifted();
// shifted.ta_bounding_box is [0, 0, 100, 100]
// shifted.offset is [100, 100] (the original offset)
```

**Returns:** A new `Polygon` instance with the translated coordinates.

### Computed Properties

#### ta_bounding_box

Calculates and caches the bounding box.

```javascript
const polygon = new Polygon([[50, 100], [200, 50], [150, 200]]);
const bb = polygon.ta_bounding_box;
console.log(`Min: (${bb[0]}, ${bb[1]})`);  // Min: (50, 50)
console.log(`Max: (${bb[2]}, ${bb[3]})`);  // Max: (200, 200)
```

#### ta_xylc_x_spans

Get x-spans representation of the polygon (for scanline operations).

```javascript
const x_spans = polygon.ta_xylc_x_spans;
// Returns Uint32Array with [x, y, length, color] tuples
```

#### ta_x_spans_filled

Get x-spans for the filled interior of the polygon.

```javascript
const filled_spans = polygon.ta_x_spans_filled;
// Returns Uint32Array with [x, y, length] tuples
```

#### scanline_edges

Get edges prepared for scanline rendering.

```javascript
const edges = polygon.scanline_edges;
// Returns Polygon_Scanline_Edges instance
```

### Static Methods

#### Polygon.ensure_is(obj)

Ensure that an object is a Polygon instance.

```javascript
const points = [[10, 10], [50, 10], [50, 50]];

// Converts if necessary, returns as-is if already Polygon
const polygon = Polygon.ensure_is(points);

// Already a Polygon - returns same instance
const polygon2 = Polygon.ensure_is(polygon);
console.log(polygon === polygon2);  // true
```

### Examples

```javascript
const Polygon = require('jsgui3-gfx-core/core/shapes/Polygon');

// Create a triangle
const triangle = new Polygon([
    [100, 50],   // Top vertex
    [50, 150],   // Bottom-left
    [150, 150]   // Bottom-right
]);

console.log(`Number of vertices: ${triangle.ta_points.length / 2}`);

// Get bounding box
const bb = triangle.ta_bounding_box;
console.log(`Bounds: (${bb[0]}, ${bb[1]}) to (${bb[2]}, ${bb[3]})`);

// Create polygon from typed array
const hexagon_points = new Uint32Array([
    150, 50,   // Top
    200, 87,   // Top-right
    200, 163,  // Bottom-right
    150, 200,  // Bottom
    100, 163,  // Bottom-left
    100, 87    // Top-left
]);
const hexagon = new Polygon(hexagon_points);

// Get scanline edges for rendering
const edges = hexagon.scanline_edges;
```

---

## Polygon_Scanline_Edges

A helper class that prepares polygon edges for scanline rendering.

### Location

```javascript
const Polygon_Scanline_Edges = require('jsgui3-gfx-core/core/shapes/Polygon_Scanline_Edges');
```

### Purpose

This class converts polygon vertices into edge data optimized for the scanline fill algorithm:

1. Creates edges from consecutive vertices
2. Filters out horizontal edges (they don't affect scanline crossings)
3. Calculates slopes for x-intercept updates
4. Sorts edges by starting Y coordinate

### Constructor

```javascript
const edges = new Polygon_Scanline_Edges(polygon);
```

### Internal Structure

Each edge contains:
- Start point (x1, y1) - always the lower Y value
- End point (x2, y2) - always the higher Y value
- Slope: `(x2 - x1) / (y2 - y1)` for x-intercept calculation

### Usage

Typically used internally by `ScanlineProcessor`, but can be accessed directly:

```javascript
const Polygon = require('jsgui3-gfx-core/core/shapes/Polygon');
const Polygon_Scanline_Edges = require('jsgui3-gfx-core/core/shapes/Polygon_Scanline_Edges');

const polygon = new Polygon([[50, 50], [150, 50], [150, 150], [50, 150]]);
const scanline_edges = new Polygon_Scanline_Edges(polygon);

// Or access via polygon property
const edges = polygon.scanline_edges;
```

---

## ScanlineProcessor

Processes scanline edges to render filled polygons.

### Location

```javascript
const ScanlineProcessor = require('jsgui3-gfx-core/core/shapes/ScanlineProcessor');
```

### Purpose

Implements the scanline fill algorithm:

1. For each horizontal scanline (y value):
   - Determine which polygon edges are active (crossing the scanline)
   - Sort active edges by their x-intercept
   - Fill pixels between pairs of edges

### Constructor

```javascript
const processor = new ScanlineProcessor(
    polygon_scanline_edges,  // Polygon_Scanline_Edges instance
    width,                   // Image width
    height,                  // Image height
    ta,                      // Target TypedArray buffer
    options                  // Optional configuration
);
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `draw_edges` | `Boolean` | `false` | Whether to draw edge pixels |

### Methods

#### process()

Execute the scanline fill algorithm (general purpose).

```javascript
processor.process();
```

#### process_1bipp()

Execute scanline fill optimized for 1bipp buffers.

```javascript
processor.process_1bipp();
```

#### *iterate_process()

Generator that yields scanline spans without directly drawing.

```javascript
for (const [y, x1, x2] of processor.iterate_process()) {
    // y: scanline y-coordinate
    // x1: span start x
    // x2: span end x (inclusive)
    console.log(`Draw span at y=${y} from x=${x1} to x=${x2}`);
}
```

### Algorithm Overview

```
Input: Polygon edges, image dimensions, target buffer

1. Sort edges by minimum Y coordinate
2. Initialize active edge list (AEL) as empty
3. For each scanline y from top to bottom:
   a. Add edges that start at y to AEL
   b. Remove edges that end before y from AEL
   c. Sort AEL by current x-intercept
   d. For each pair of edges in AEL:
      - Fill pixels between edge x-intercepts
   e. Update x-intercepts for next scanline:
      - x = x + slope
```

### Usage Example

```javascript
const Polygon = require('jsgui3-gfx-core/core/shapes/Polygon');
const Polygon_Scanline_Edges = require('jsgui3-gfx-core/core/shapes/Polygon_Scanline_Edges');
const ScanlineProcessor = require('jsgui3-gfx-core/core/shapes/ScanlineProcessor');
const { Pixel_Buffer } = require('jsgui3-gfx-core');

// Create pixel buffer
const pb = new Pixel_Buffer({
    size: [200, 200],
    bits_per_pixel: 1
});

// Create polygon
const polygon = new Polygon([
    [100, 20],   // Top
    [180, 100],  // Right
    [140, 180],  // Bottom right
    [60, 180],   // Bottom left
    [20, 100]    // Left
]);

// Create scanline edges
const scanline_edges = new Polygon_Scanline_Edges(polygon);

// Create and run processor
const processor = new ScanlineProcessor(
    scanline_edges,
    pb.size[0],
    pb.size[1],
    pb.ta,
    { draw_edges: true }
);

processor.process_1bipp();
```

---

## Shape Rendering Integration

### Drawing Shapes on Pixel Buffers

The shapes module integrates with `Pixel_Buffer` drawing methods:

```javascript
const { Pixel_Buffer, Rectangle } = require('jsgui3-gfx-core');
const Polygon = require('jsgui3-gfx-core/core/shapes/Polygon');

const pb = new Pixel_Buffer({
    size: [400, 400],
    bits_per_pixel: 24
});

// Draw polygon using Pixel_Buffer method
const star = new Polygon([
    [200, 50], [220, 130], [300, 150],
    [240, 190], [260, 280], [200, 230],
    [140, 280], [160, 190], [100, 150],
    [180, 130]
]);

// Pixel_Buffer.draw_polygon accepts array or Polygon
pb.draw_polygon(star.ta_points, [255, 215, 0], true);

// Check collision between shapes
const rect = new Rectangle([100, 100], [150, 150]);
const bounds = star.ta_bounding_box;

// Manual collision check using bounding box
const star_rect = new Rectangle(
    [bounds[2] - bounds[0], bounds[3] - bounds[1]],
    [bounds[0], bounds[1]]
);
const overlap = rect.overlaps(star_rect);
```

### Performance Considerations

1. **Use TypedArrays**: Pass `Uint32Array` instead of array of arrays when possible
2. **Reuse instances**: Avoid creating new Polygon instances in tight loops
3. **Bounding box caching**: `ta_bounding_box` is cached after first access
4. **Scanline edges**: Pre-compute with `scanline_edges` property when rendering multiple times
