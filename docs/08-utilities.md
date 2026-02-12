# Chapter 8: Shapes, Pixel_Pos_List & Utility Classes

This chapter covers the supporting classes that don't fit neatly into the pixel buffer hierarchy but are essential parts of the library.

## Rectangle

The `Rectangle` class (`core/shapes/Rectangle.js`) is the only shape exported from the main entry point. It provides geometric rectangle operations independent of any pixel buffer.

### Construction

```js
const { Rectangle } = require('jsgui3-gfx-core');

// From position + size
const r = new Rectangle({ pos: [10, 20], size: [100, 50] });

// From bounds
const r2 = new Rectangle({ bounds: [10, 20, 110, 70] });
```

### Key Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `extend(rect)` | `Rectangle` | Expands this rectangle to enclose another |
| `overlap(rect)` | `boolean` | Tests whether two rectangles overlap |
| `intersect(rect)` | `Rectangle` | Returns the intersection rectangle |
| `contains(point)` | `boolean` | Tests if a point is inside |

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `pos` | `Array` | Top-left position `[x, y]` |
| `size` | `Array` | Width and height `[w, h]` |
| `bounds` | `Array` | `[x1, y1, x2, y2]` |

`Rect` is an alias for `Rectangle` in the exports.

## Polygon (`core/shapes/Polygon.js`)

The `Polygon` class is **not exported** from the main entry point but is used internally for polygon drawing and can be required directly:

```js
const Polygon = require('jsgui3-gfx-core/core/shapes/Polygon');

const poly = new Polygon([
    [10, 10],
    [100, 20],
    [90, 80],
    [5, 70]
]);
```

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `points` | `Array` | Vertex coordinates `[[x,y], ...]` |
| `bounds` | `Array` | Bounding box `[xmin, ymin, xmax, ymax]` |
| `edges` | `Polygon_Edges` | Edge pair representation |

### Related Classes

These classes work together for scanline polygon rasterization:

| Class | File | Purpose |
|-------|------|---------|
| `Polygon_Edges` | `Polygon_Edges.js` | Stores edge pairs sorted by y_min |
| `Polygon_Scanline_Edges` | `Polygon_Scanline_Edges.js` | Tracks which edges are active at each scanline |
| `ScanlineProcessor` | `ScanlineProcessor.js` | Drives the scanline sweep from top to bottom |
| `TA_Table_8_Columns` | `TA_Table_8_Columns.js` | Typed array table with 8 columns for edge data |

## Pixel_Pos_List

`Pixel_Pos_List` (`core/pixel-pos-list.js`) is an efficient container for sparse pixel coordinate sets. It stores positions as packed `Uint16Array` data.

### Construction

```js
const { Pixel_Pos_List } = require('jsgui3-gfx-core');

const list = new Pixel_Pos_List();
```

### Adding Positions

```js
list.add([10, 20]);
list.add([15, 25]);
list.add(new Int16Array([30, 40]));
```

### Iteration

```js
list.forEach((pos) => {
    console.log(pos[0], pos[1]);  // x, y
});
```

### Properties

| Property | Description |
|----------|-------------|
| `length` | Number of positions stored |

### Use with Pixel Buffer

```js
// Paint all positions onto a buffer
pb.paint_pixel_list(list, [255, 255, 0]);

// Collect positions from a buffer
const bright_pixels = new Pixel_Pos_List();
pb.each_pixel_pos((pos) => {
    const val = pb.get_pixel(pos);
    if (val > 200) bright_pixels.add(pos);
});
```

## Virtual_Float_Pixel

`Virtual_Float_Pixel` (`core/virtual-float-pixel.js`) represents a pixel with floating-point precision. It is used internally by the **resize algorithm** (area-weighted sampling) where a single output pixel is computed from a fractional region of source pixels.

```js
const Virtual_Float_Pixel = require('jsgui3-gfx-core/core/virtual-float-pixel');
```

This class is not part of the public API but is fundamental to how `new_resized()` produces high-quality scaled images without integer rounding artifacts.

## Pixel_Buffer_Painter

`Pixel_Buffer_Painter` (`core/pixel-buffer-painter.js`) wraps a `Pixel_Buffer` and provides a fluent drawing API:

```js
const { Pixel_Buffer, Pixel_Buffer_Painter } = require('jsgui3-gfx-core');

const pb = new Pixel_Buffer({ bits_per_pixel: 24, size: [200, 200] });
const painter = new Pixel_Buffer_Painter({ pb });

// Fluent chaining
painter
    .rect([10, 10], [50, 30], [255, 0, 0])
    .rect([70, 10], [50, 30], [0, 255, 0]);
```

### Constructor

Accepts a spec with either `pb` or `pixel_buffer`:

```js
new Pixel_Buffer_Painter({ pb: my_pixel_buffer });
new Pixel_Buffer_Painter({ pixel_buffer: my_pixel_buffer });
```

### Methods

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `rect(pos, size, color)` | position, dimensions, color | `this` | Draws a filled rectangle |

The `rect` method:
1. Converts `pos` + `size` to bounds: `[x, y, x+w, y+h]`
2. Calls `fill_solid_rect_by_bounds()` from `ta_math` on the underlying typed array
3. Returns `this` for chaining

## Typed_Array_Binary_Read_Write

An internal utility (`core/typed-array-binary-read-write.js`) providing bit-level read/write access to typed arrays. Used by 1bipp operations to pack and unpack individual bits within bytes.

---

**← [Chapter 7: TypedArray Math](./07-ta-math.md)** | **[Chapter 9: Ecosystem & Integration →](./09-ecosystem.md)**
