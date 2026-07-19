# Remediation Results, Follow-up Research, and Next-turn Brief

## Result

The confirmed correctness failures from the deep review have been repaired
without flattening the public class hierarchy or inserting validation into
established per-pixel loops. The original review illustration remains a
historical map of the pre-remediation risks; it is available at
[`svg/11-deep-functional-performance-review.svg`](./svg/11-deep-functional-performance-review.svg).

There were two useful baselines during the work:

- the initial deep-review snapshot had 47 passing and 3 failing cases;
- after the immutable layout-contract pass, the broader remediation work began
  at 71 passing and 3 failing cases;
- the final suite has **148 passing, 0 failing cases across 12 test files**.

An independent final audit found no remaining confirmed P0/P1 correctness
blocker in the repaired scope. The remaining items later in this document are
newly researched architectural or deliberately unsupported work, not hidden
claims that the repaired paths are complete for every possible API.

## What was fixed

### One immutable memory-layout contract

Every Pixel Buffer now owns a frozen `layout` describing width, height, format,
payload bytes per row, row stride, logical byte length, storage capacity, row
alignment, MSB-first packed-bit order, zero-filled row padding, and the final
1bipp tail mask. Construction validates dimensions, format aliases, strides,
alignment, byte-storage type, supplied subviews, and available capacity before
an algorithm sees the object.

`pb.ta` exposes only logical image bytes while `pb.storage` retains the supplied
view's complete capacity and byte offset. Packed rows begin independently on a
byte boundary, unused tail bits are cleared, and row padding is canonicalized
without touching spare capacity. The full contract is in
[`11-pixel-buffer-layout-contract.md`](./11-pixel-buffer-layout-contract.md).

### Windows, coordinates, ownership, and cached geometry

- `window_to`, `source`, and `window_to_source` now behave as validated aliases,
  reject contradictions, and populate the window immediately.
- Source windows clip and zero-fill correctly for 1/8/24/32bipp, including
  padded rows, packed tails, negative positions, and positions beyond the old
  signed-16-bit range.
- Coordinate state and scratch geometry widen only when needed; colorspace
  metadata reports the canonical stride.
- Polygon point arrays, bounds, and offsets are owned snapshots. Signed and
  fractional coordinates use an appropriate `Int32Array` or `Float64Array`
  instead of wrapping through `Uint32Array`.
- Virtual-float-pixel geometry getters no longer expose mutable arrays that can
  desynchronise derived proportions and cached weights.

### Rasterization, painting, polygons, and flood fill

- Horizontal spans and arbitrary lines clip before writing, preserve padded
  rows, reject non-finite coordinates, and terminate for fractional endpoints.
- Polygon scanline activation is monotonic rather than rescanning every edge on
  every row. It admits edges entering above the image, uses Float64 intercepts,
  reuses active storage, and can be run repeatedly without mutating edge
  geometry.
- Filled and stroked polygons now share consistent edge rounding across all
  four formats. Public stroked fills include bottom, right, and sloped boundary
  pixels; all four 1bipp stroke/fill combinations work.
- Painter rectangles validate wide geometry and color once, clip at all four
  edges, preserve padding/tails, and support packed set and clear. Reusable
  bounds remove the former per-call `Int16Array` allocation and coordinate
  wrapping.
- Flood filling now uses one stride-aware, four-connected scanline engine for
  1/8/24/32bipp. Spans are marked when queued, the typed frontier grows in
  bounded chunks, and disconnected components can no longer be reached after
  queue exhaustion.

### Resizing, convolution, helpers, and secondary classes

- 24bipp resizing covers equal, mixed-axis, vertical-only, horizontal-only,
  enlargement, reduction, and formerly missing ratios. Existing exact fast
  paths remain; a separable area-overlap fallback handles the repaired cases.
- `Float32Convolution` loads correctly, validates positive odd geometry and
  finite coefficients, and protects its geometry snapshots. Pixel Buffer
  object convolution supports 8 and 24bipp, respects padded source/destination
  rows, and rounds fractional results consistently. RGBA square convolution
  preserves source alpha rather than replacing it with 255.
- Mask generation/application, solid borders, crop/uncrop, resize wrappers,
  rectangle copies, placement, channels, color counting/replacement,
  inversion, region measurement, small-block filling, and boundary iteration
  now use logical rows rather than treating padding as pixels.
- `Pixel_Pos_List` validates outer input, compacts only unread data, keeps its
  public typed-array view synchronized, and sorts numerically independent of
  host endianness.
- Palette, Dynamic_XSpans, representation inheritance, and YRows_XSpans now
  construct and perform their documented basic operations. Toggle-length
  wrapping is validated and retained, but full materialization remains future
  work.
- The custom test runner sorts files deterministically, rejects malformed test
  results, reports case counts separately from file counts, and no longer
  prints a false per-file success after returned failures.

## Verification and performance evidence

Final correctness checks:

- `npm test`: **148 passed, 0 failed, 12 files**;
- `node --check`: **61 JavaScript source/test files parsed**;
- module smoke test: the package facade, convolution, palette, dynamic spans,
  polygon/scanline, and representation modules all loaded successfully;
- randomized flood tests compared roughly 160,000 changed pixels with a simple
  four-connected oracle and found no mismatch;
- 160,000 small resize combinations were compared with an area-overlap oracle:
  96,636 were byte-exact, all remaining channel differences were at most one
  quantization level, and none exceeded one.

Warmed, repeated measurements were made against the former implementation or a
correct compact reference. Ratios below are current time divided by baseline
time; lower is faster.

| Operation | Baseline | Current | Outcome |
|---|---:|---:|---|
| `Pixel_Pos_List`, construct + 250k add + iterate | 21.795 ms | 21.227 ms | 2.6% faster |
| 128×128 RGBA placement into 512×512 | 0.00952 ms | 0.00959 ms | +0.7%, timing noise |
| 256×256 RGB mask generation | 8.54 ms | 4.72 ms | 44.7% faster |
| 240-edge polygon across 1,024 rows | 4.143 ms | 1.521 ms | 2.72× faster |
| 1bipp adversarial comb flood | 27.86 ms | 3.71 ms | 7.5× faster |
| 24bipp resize, 2× enlargement | 1.000× | 1.000× | unchanged |
| 24bipp resize, exact 2× reduction | 1.000× | 1.003× | +0.3% |
| 24bipp resize, exact 3× reduction | 1.000× | 0.997× | 0.3% faster |
| Repaired asymmetric 3×2 resize | 1.000× | 0.875× | 12.5% faster |
| Repaired vertical-half resize | 1.000× | 0.310× | 3.2× faster |
| Painter 384×256, 8/24/32bipp | 1.000× | 0.920/1.007/1.014× | no material regression |

Multi-pixel line cases measured +4.1% for a three-pixel line and +2.2% for a
50-pixel line, both inside the preselected 5% noise gate; a forced-read
one-pixel difference was about 1.1 ns per call. The scanline fill phase for a
1,024² polygon remains 0.2037 ms; adding the formerly missing public boundary
costs about 0.0189 ms. That cost corrects a broken result and does not slow the
internal fill-only operation.

The changes preserve tight-row direct loops and native typed-array bulk
operations. New validation is done at construction or operation setup. A
committed, reproducible performance suite is still needed; these local numbers
are evidence, not an automated regression gate.

## Research: the next improvements

### 1. Separate checked public access from explicit unchecked kernels

The most important remaining correctness risk is the random-access API.
Several public `get_pixel`/`set_pixel` variants intentionally perform no bounds
check because the same methods are called from hot internal loops. A negative
or oversized coordinate can therefore alias a different row; in 1bipp it can
also address tail or padding bits.

Adding branches to every current call would conflict with the performance
requirement. First characterize public behavior and benchmark call sites. Then
provide checked public entry points and explicitly named internal unsafe
kernels, migrate already-bounded loops to the latter, and measure both tight
and padded layouts. This makes safety visible without taxing proven inner
loops.

### 2. Install standardized correctness and performance gates

Node's built-in test runner supports process isolation, concurrency, reporters,
mocking, and coverage and is stable in supported Node releases; it can replace
the custom orchestration without a runtime dependency. See the
[Node test-runner documentation](https://nodejs.org/api/test.html).

Add seeded property tests across 1/8/24/32bipp, byte-boundary widths, tight and
padded strides, every clipping edge, subviews with non-zero offsets, and format
round trips. Compare optimized code with deliberately simple pixel oracles.
[`fast-check`](https://fast-check.dev/docs/introduction/what-is-property-based-testing/)
provides reproducible seeds and counterexample shrinking if a dev dependency is
acceptable.

Create `npm run benchmark` with
[`node:perf_hooks`](https://nodejs.org/api/perf_hooks.html): warm up, collect
multiple samples, report median/p95 and environment metadata, and save a
machine-readable baseline. Gate only a regression greater than both 5% and an
absolute noise floor. Include allocation-sensitive construction, get/set,
iteration, spans/lines, painter fills, masks, conversions, resize, convolution,
flood fill, placement, and windows.

### 3. Consolidate the class hierarchy only after those gates exist

Runtime inventory found 11 substantive prototype levels plus the final alias,
48 instance properties, and 225 prototype definitions representing 156 names:

- 69 definitions are shadowed across 57 names;
- 40 shadowed definitions are effectively identical;
- all 27 methods at the first pixel-access level are duplicated later;
- only two of 29 methods at the reference level survive final dispatch;
- seven constructors are pass-through, redundant, or contain unreachable work.

There are also upward dependencies: lower constructors call methods or rely on
scratch state supplied by later subclasses. Intermediate classes can therefore
instantiate successfully and then fail on nominal methods.

Characterize exported descriptors, aliases, own keys, callbacks, factories,
subclass preservation, painter creation, scratch laziness, and the
`instanceof` chain before cleanup. Remove unreachable locals and pass-through
work first. Share exact duplicate descriptors next. Differential-test divergent
shadows by domain before moving them. Do not flatten public classes or deep
import paths in a patch release.

### 4. Finish the large-coordinate policy

Layout dimensions accept safe integers and geometry state no longer truncates
at 32,767, but `Pixel_Pos_List` still stores `Uint16` coordinates and therefore
wraps above 65,535. Several low-level index formulas also use Number bitwise
operators. ECMAScript converts Number operands through 32-bit integer forms for
those operations, so large indices can truncate even when construction accepts
the layout. See the normative
[ECMAScript numeric bitwise algorithms](https://tc39.es/ecma262/2024/multipage/ecmascript-data-types-and-values.html).

Choose and document either a smaller validated maximum or a wide fallback.
Adaptive Uint16/Uint32/Float64 position storage preserves the common compact
case. Fast bitwise address calculation can also remain behind a once-per-
operation range proof, with division/modulo used only for wide layouts.

### 5. Make unsupported surface area explicit

The remaining experimental or unsupported areas include:

- callback semantics for `each_px_convolution` and packed 1bipp convolution;
- non-1bipp OR composition and 24bipp small-block filling;
- standalone low-level 1/8/32bipp resize helpers, despite Pixel Buffer-level
  resize now supporting those formats;
- full wrapping toggle-length materialization and integration of alternative
  representations into the public pipeline;
- historical transform helpers that remain dead or experimental.

For each, implement and test it, expose a typed unsupported-operation error, or
make it private. The current source search finds 161 direct string throws, 585
combined direct string-throw/`console.log`/`console.trace` hits (including
comments), and 79 NYI/TODO-style markers. Convert reachable cases in small
domain-specific passes so mechanical cleanup does not hide behavior changes.

### 6. Reduce the published artifact deliberately

The final `npm pack --dry-run --json` audit reports 1,459,396 bytes packed and
2,957,490 bytes unpacked across 117 entries. It includes tests, old
implementations, all examples, and a 1,134,284-byte example JPEG.

Use a package `files` allow-list after mapping supported deep imports. npm
documents that omitting `files` broadly includes repository content; see the
[npm package manifest documentation](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/#files).
An `exports` map should follow consumer-subpath research because Node documents
that adding one can break previously permitted deep imports; see
[Node package entry points](https://nodejs.org/api/packages.html#package-entry-points).
Also declare a supported Node engine range and test that range in CI.

### 7. Consider workers or SIMD only above measured thresholds

Large convolution, transforms, and independent tiles may eventually benefit
from a worker pool. Node recommends workers for CPU-intensive JavaScript and
warns that spawning a worker per task can cost more than it saves; see
[`worker_threads`](https://nodejs.org/api/worker_threads.html). WebAssembly SIMD
is plausible for convolution and channel math; V8 identifies image processing
as a target and recommends feature detection plus fallback in its
[WebAssembly SIMD guide](https://v8.dev/features/simd).

Do not introduce either backend until scalar reference behavior, transfer/copy
cost, minimum profitable image size, and fallback behavior are measured.

## Copyable prompt for the next turn

```text
Continue work in /mnt/c/Users/james/Documents/repos/jsgui3-gfx-core.

Read docs/11-pixel-buffer-layout-contract.md and
docs/12-remediation-research-and-next-turn.md first. Preserve every unrelated
worktree change. The required baseline is `npm test` with 148 passing and 0
failing cases across 12 files. Do not flatten the public inheritance chain or
add checks inside established hot loops without comparative measurements.

Primary goal: make public random pixel access bounds-safe while retaining
explicit, benchmarked unchecked kernels for already-bounded internal loops;
install the characterization and performance gates needed for later hierarchy
work.

1. Inventory every exported `get_pixel`, `set_pixel`, by-index variant, alias,
   and their internal call sites. Record effective prototype owners and current
   behavior for 1/8/24/32bipp, tight/padded rows, negative coordinates,
   coordinates at width/height, wide coordinates, 1bipp tails, and storage
   subviews. Do not infer safety from method names.

2. Add characterization and property tests before changing dispatch. Include
   exported descriptors/aliases/own keys, callback argument identity and early
   stop behavior, factory subclass preservation, scratch laziness, painter
   creation, and the full `instanceof` chain. Compare random access, spans,
   windows, placement, rasterization, flood, resize, and convolution with small
   pixel-by-pixel oracles across all formats and stride variants. Keep seeds
   reproducible.

3. Add a committed `npm run benchmark` harness using `node:perf_hooks`.
   Warm each case, report median and p95 plus Node/platform metadata, and write
   a machine-readable baseline. Cover construction, checked and unchecked
   get/set/by-index, each_pixel, spans/lines/fills, painter, masks, conversions,
   resize, convolution, flood, placement, and windows for tight and padded
   layouts. Fail only when a case regresses by more than both 5% and a stated
   absolute noise floor.

4. Separate API safety from kernel speed. Public coordinate access must reject
   or explicitly no-op out-of-range input according to one documented policy;
   it must never alias another row, padding byte, or 1bipp tail bit. Introduce
   clearly named internal unchecked accessors for loops whose bounds are proved
   once, and migrate those hot callers before adding public validation. Avoid
   allocation and wrapper layering in per-pixel paths. Preserve valid-input
   byte results, callback contracts, aliases, subclasses, and module paths.

5. Generate a checked-in hierarchy inventory showing effective owners,
   identical shadows, divergent shadows, and upward dependencies. If all new
   safety/performance gates pass, perform only zero-risk phase-1 cleanup:
   unreachable constructor blocks, unused locals/imports, redundant copy
   normalization, and genuinely pass-through constructor work. Retain every
   public class/module and its `instanceof` position. Propose the next
   consolidation phase; do not move divergent implementations yet.

6. Finish with `node --check`, the complete tests, the benchmark suite, module
   smoke loads, randomized oracle comparisons, and
   `npm pack --dry-run --json`. Report exact results, before/after medians and
   p95 values, allocation effects, remaining risks, and the smallest safe next
   phase.

Acceptance criteria:
   - all existing and new tests pass;
   - invalid public coordinates cannot touch logical pixels, padding, or tails;
   - valid-input output and public API/descriptor/callback/subclass behavior are
     unchanged;
   - no established benchmark crosses the dual regression gate;
   - no unrelated file is reformatted or overwritten;
   - no public class, module, alias, or supported deep import is removed.
```
