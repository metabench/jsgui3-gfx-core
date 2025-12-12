# Copilot Instructions

## Repo Snapshot
- CommonJS Node library supplying typed-array pixel buffers and shape primitives for jsgui3 and related projects.
- Primary exports live in `core/gfx-core.js`, which re-exports pixel buffers, painters, convolution kernels, ta-math helpers, and shape classes.
- Pixel buffer implementations evolve through `core/pixel-buffer-{0..8}-*.js`; `core/pixel-buffer.js` always points at the latest enhancement layer.

## Working With Pixel Buffers
- Constructors expect `{size:[w,h], bits_per_pixel, buffer?}` and immediately derive typed arrays (`Uint8ClampedArray`, `Int16Array` helpers). Preserve this spec shape when adding new variants.
- All per-pixel logic must respect multi-format support (1/8/24/32 bipp). Use provided helpers such as `set_pixel_by_idx_*`, `blank_copy`, `clone`, and `new_window` instead of direct array math when possible.
- Long-running operations (resize, convolution, rect copies) should delegate to `core/ta-math` modules (`transform.resize_ta_colorspace`, `copy.copy_rect_to_same_size_*`, etc.) to keep math code centralized and SIMD-friendly.
- Convolutions flow through `core/convolution.js` + `core/convolution-kernels/kernels.js`. When adding a convolution, ensure `xy_center`, `size`, and kernel bounds align with `Pixel_Buffer_Core.new_convolved` expectations.
- `Pixel_Buffer_Painter` and `ta-math/draw` routines share the same bounds contracts (colorspace-specific `fill_solid_rect_by_bounds`). Reuse them for any shape drawing to keep rectangle/span handling consistent.

## Supporting Structures
- `core/pixel-pos-list.js` stores coordinate pairs inside a typed ring buffer; call `fix()` before sorting/iterating to lock length, and use `each_pixel`, `shift`, or `pop` instead of slicing arrays.
- Geometry helpers (`core/shapes/*.js`) are lightweight data classes; they should not bring in heavy deps—add math in `ta-math` and keep shapes focused on describing bounds.
- Binary helpers (`core/Typed_Array_Binary_Read_Write.js`, `ta-math/bitwise.js`) already implement read/write + bit counting; extend them if you need new bit fiddling instead of introducing custom loops inside feature code.

## External Dependencies
- `lang-mini` supplies utility functions (`each`, `tof`, `are_equal`); `obext` exposes immutable property helpers; `fnl`/`fnlfs` provide functional list helpers and filesystem glue. Prefer these packages where they are already used to match author style.
- Image import/export and high-level operations (e.g., Sharp integration) live outside this repo; keep this package dependency-light and avoid DOM-specific APIs.

## Development Workflow
- Install deps with `npm install`; run the full suite via `npm test` (executes `tests/run-tests.js`, which loads every `*.test.js` and expects each file to export a function returning `{passed, failed}`).
- Add new tests in `tests/` alongside existing `pixel-pos-list.test.js`; follow the same self-reporting pattern and ANSI-colored console logs if needed.
- Use the scripts inside `examples/` for manual experiments (they require direct `node examples/<file>.js` runs and rely on CommonJS `require` paths relative to repo root).
- Publishing uses the version in `package.json`; bump `version` before running `npm publish` to avoid registry rejections.

## Coding Conventions
- Keep files ASCII and CommonJS; avoid ESM syntax and browser globals unless the target file already uses them.
- Typed arrays are preferred for any buffer math; allocate scratch arrays once per method (see the various `ta_32_scratch` usages) and reuse them instead of per-pixel allocations.
- Many methods rely on mutable shared `Int16Array`/`Uint16Array` instances (e.g., window positions). When extending behavior, respect these in-place updates to avoid unnecessary garbage collection.
- Logging uses `console.log` sparingly; prefer `console.trace()` when flagging NYI branches as seen in existing files.
- Follow the incremental file layering pattern: add new capabilities in the next `pixel-buffer-X` stage and export it through `pixel-buffer-(X+1)-*.js` so older behaviors remain available for debugging.
