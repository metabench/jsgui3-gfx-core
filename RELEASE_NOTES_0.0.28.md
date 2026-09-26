# jsgui3-gfx-core 0.0.28: anti-aliased vector rasterising

0.0.28 adds an anti-aliased polygon fill, a polyline stroker, a paint-op
renderer for scene files, a hard-edged fill for pick buffers, 32bpp
source-over placement, and PNG encoders. All of it is pure typed-array
JavaScript: the same bytes in Node, a browser page and a Web Worker.

Nothing changes for existing callers. `draw_polygon` keeps its behaviour,
including its 1 px outline, and `place_image_from_pixel_buffer` keeps its
opaque copy unless the new `blend: 'over'` option is passed.

## New API

```js
const gfx = require('jsgui3-gfx-core');

pb.fill_polygons(polygons, color, {clip, offset, blend});           // method
gfx.raster.fill_polygons(pb, polygons, color, {clip, offset, blend}); // function
pb.fill_paint_op({color, polygons, strokes}, {clip, offset, blend});
gfx.stroke_polyline(points, {width, join, miter_limit, cap, closed}); // -> polygons
pb.fill_polygon_aliased(polygon, color, {offset, clip});
pb.place_image_from_pixel_buffer(src, [x, y], {blend: 'over'});

gfx.encode_png(pb, {dpi, srgb: true, filter: 'none', level: 6});     // Node, sync
await gfx.encode_png_async(pb, {dpi, srgb, filter});                // CompressionStream
const enc = new gfx.Png_Row_Encoder({width, height, bits_per_pixel, dpi, srgb, filter, write});
```

### `fill_polygons`

- `polygons` is an array of flat `[x0, y0, x1, y1, ...]` arrays (plain or
  typed; `[x, y]` pairs also work), in pixel units, y down.
- All polygons of one call are **one union**: signed areas are accumulated
  per cell and each row's prefix sum is clamped to [0, 1]. Pieces that touch
  and share a colour belong in one call: two abutting triangles give 255 on
  the shared edge in one call and 192 in two calls. An oppositely wound ring
  inside another cuts a hole (the non-zero rule).
- `color` is `[r, g, b]` or `[r, g, b, a]`; at 8bpp a grey value (or `[v, a]`).
- `clip: [x0, y0, x1, y1]` (integer pixels, `x1`/`y1` exclusive) limits
  writing; `offset: [ox, oy]` (integer pixels) translates first;
  `blend: 'over'` (default, source-over in sRGB) or `'replace'` (the colour,
  alpha included, replaces the destination in proportion to coverage).
- 8, 24 and 32bpp.
- Arithmetic: coordinates are quantised once to **1/4096 px** and every
  crossing is an integer floor division, accumulated as exact integers
  (BigInt beyond 2^52). The output does not depend on the JavaScript engine,
  and an integer `offset` moves pixels exactly, so a band or window rendered
  on its own is byte-identical to the same pixels of a whole render.
- The accumulator covers the polygons' bounding box intersected with the clip
  and the buffer, in strips of at most 2^21 cells (16 MiB). Only touched
  columns of each row are composited.

### `stroke_polyline` and `fill_paint_op`

- Joins `'miter'` (the default; bevel beyond `miter_limit`, default 4, by the
  SVG test), `'bevel'` and `'round'`; caps `'butt'` (default), `'square'` and
  `'round'`; open and `closed` polylines. Round joins and caps were allowed
  to wait for 0.0.29 but are included.
- Output: flat polygons to fill together as one non-zero union (one outline
  for an open polyline, an outer and an inner ring for a closed one). The
  inner side of each join is the intersection of the inner offset lines
  whenever the overlap lies inside both neighbouring segments, so the fill
  does not over-cover the inside of joins, as the prototype's per-segment
  quads did. When a segment is too short for that, the inner side pivots
  through the vertex.
- `fill_paint_op(op)` expands `op.strokes` and fills them with `op.polygons`
  in **one** union pass. Other fields, such as `kind`, are ignored.

### `fill_polygon_aliased`

Hard-edged, for pick buffers and masks, at 1, 8, 24 and 32bpp. A pixel is
filled when its centre is inside (non-zero rule); centres on an edge count
when the edge is to their left or above. Only the polygon's rows are visited,
there is no outline, and integer translation moves the filled set exactly: a
4 x 3 square fills the same 12 pixels at x0 = 1.3, 9.3 and 11.3, where
`draw_polygon` fills 16 or 20.

### PNG

- 8, 24 and 32bpp map to PNG colour types 0, 2 and 6 (8 bits per sample).
- `sRGB` chunk by default (intent 0; `srgb: false` omits it, 0-3 sets the
  intent); `pHYs` when `dpi` is given.
- Filters: `'none'` (the default, as sharp writes it), `'adaptive'` (per row,
  the smallest sum of absolute signed residuals, libpng's heuristic), or a
  fixed `'sub'`, `'up'`, `'average'` or `'paeth'`.
- `encode_png` uses Node's zlib, looked up at call time, so browser bundles do
  not include it; in a browser it throws and points to `encode_png_async`.
- `Png_Row_Encoder` takes rows one at a time (`write_row`, or `write_rows(pb)`
  for a band buffer) and hands bytes to `write`, which may return a Promise
  for back-pressure; `end()` checks the row count and writes IEND.

## Measured

Node 25.2.1, sharp 0.34.5 with librsvg 2.61.2, Chromium 145.0.7632.6.

| Check | Result |
|---|---|
| Oracle, 45 templates at 418 px (gate: MAE <= 0.25, <= 0.10 % of pixels > 16 levels) | MAE median 0.1144, max 0.2161 (acute-rosettes); > 16 levels median 0.0050 %, max 0.0720 % (plotter-lines) |
| Tile junctions, 9 templates, 2 x 1 and 1 x 2 blocks (gate: <= 2 levels) | max 1 across, 2 down; librsvg's own residue on the same fixtures: 0 and 9 |
| 160 px, 9 templates (ratchet baseline) | MAE median 0.3135, max 0.4128; > 16 levels median 0.0859 %, max 0.4294 % |
| 1000 px, 9 templates (ratchet baseline) | MAE median 0.0785, max 0.1126; > 16 levels median 0.0076 %, max 0.0155 % |
| Bands and windows | 315 bands and 270 random windows at 418 px, 81 at 1000 px, and quadrant clips: byte-identical to the whole render |
| Determinism | 81 scenes rendered twice in opposite orders: identical SHA-256 |
| Cross-runtime (`scripts/cross-runtime-check.js`) | Node, Chromium main thread and Chromium Worker: identical SHA-256 of the RGBA bytes on 7 fixtures; `encode_png_async` in the browser decodes to identical pixels |
| Speed, `fill_paint_op` per tile (`benchmarks/raster-benchmark.js`) | 418 px: median 2.35-2.41 ms, max 6.17-6.45 ms over three runs, none above the 10 ms target; 0.62-0.67 of librsvg's time (median per tile). 1000 px: median 22.6-25.4 ms, 0.82-0.97 of librsvg's |
| PNG, 45 tiles at 418 px, total size against sharp's default PNG | `'none'` 0.990, `'adaptive'` 1.256 |

## Differences from the approved proposal

1. **1/4096 px coordinates, not 1/256.** With 1/256 (and 1/1024) px the
   junction gate failed on acute-rosettes (3 levels down the join). The
   fixtures' 2-decimal coordinates leave about 2 levels there; the float
   prototype also reaches 2. 1/4096 passes (max 2) and lowers the error
   against librsvg at every size. Determinism, exact translation and window
   identity hold at any power-of-two step. Accepted by the owner, 2026-09-26.
2. **The PNG filter default is `'none'`, not `'adaptive'`.** The proposal
   chose `'adaptive'` "as sharp does", but sharp's default writes filter 0
   (none) on every row; its adaptive mode is opt-in. For flat-colour art,
   `'none'` is smaller (0.990 of sharp's size against 1.256) and about three
   times faster (median 14.5-15.6 ms against 42.7-44.9 ms per tile).
   Switched by the owner's decision, 2026-09-26; `'adaptive'` stays available.
3. **Round joins and caps** are included, not deferred.
4. **`fill_polygon_aliased`** also accepts `{offset, clip}` and is in the
   `raster` namespace as a function.

## Known limits

- Sum-then-clamp coverage over-covers pixels where edges of two overlapping
  pieces of one op cross, such as crossing strands of one colour. It is the
  main error at small sizes (plotter-lines at 160 px: 0.43 % of pixels more
  than 16 levels off, all at strand crossings).
- A join whose neighbouring segment is shorter than the join's inner overlap
  pivots through the vertex: correct coverage inside, slight over-coverage
  on edge pixels there.
- `fill_polygons` does not support 1bpp; use `fill_polygon_aliased`.
- A sparse fill for print sizes, path affine transforms and area resize for
  8 and 32bpp remain for 0.0.29.

## Tests

`npm test`: 229 cases in 27 files (0.0.27: 177 in 18). The runner now awaits
test files that return a Promise. The pattern oracle (`tests/raster-pattern-oracle.test.js`)
compares against sharp/librsvg, which is a devDependency, and skips with a
message when sharp is missing. Fixtures live in `tests/fixtures/patterns/`
(162 files and a manifest from jsgui3-islamic-art's
`tools/export-raster-fixtures.js`, 2.8 MB). The `files` field in
`package.json` keeps them out of the published package, so
`benchmarks/raster-benchmark.js`, `scripts/cross-runtime-check.js` and the
pattern tests need a git checkout.
