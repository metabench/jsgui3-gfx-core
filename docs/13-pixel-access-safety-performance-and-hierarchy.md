# Public Pixel Access Safety, Performance, and Hierarchy Inventory

The subsequent method-range, deep-import, and divergent-shadow phase is
recorded in
[`14-method-ranges-deep-imports-and-shadows.md`](./14-method-ranges-deep-imports-and-shadows.md).

## Outcome

Public random-pixel access is now bounds-safe for every existing coordinate,
by-index, packed-address, and 1bipp on/off entry point. Invalid public input is
rejected before any byte is read or written. Already-bounded internal loops use
explicit stride-aware `unsafe*` kernels, so validation is kept at the public
boundary rather than repeated inside hot raster loops.

The immutable layout contract remains unchanged. Valid pixel results, callback
identities and stopping, descriptors, aliases, own keys, factory subclass
preservation, scratch laziness, painter identity, the 11-level prototype chain,
supported deep imports, and byte-level padding/tail behavior are characterized
by tests.

The implementation diagram is
[`svg/13-checked-access-and-kernels.svg`](./svg/13-checked-access-and-kernels.svg).

## Public policy

- A malformed, fractional, non-finite, or unsafe coordinate/index throws
  `TypeError`.
- A safe-integer coordinate/index outside the logical image throws
  `RangeError`.
- A failed setter is atomic: pixels, other rows, row padding, 1bipp tail bits,
  spare storage capacity, and supplied-subview sentinels are unchanged.
- Valid wide coordinates are not narrowed through `Int16` or signed bitwise
  address arithmetic.
- Public methods validate. Functions exported by
  `core/pixel-buffer-pixel-access.js` whose names begin with `unsafe` do not.
  They are internal kernels and are not installed on Pixel Buffer prototypes.

## Random-access inventory

The 27 preserved method names are:

| Group | Methods |
|---|---|
| Packed 1bipp address | `get_pixel_byte_bit_1bipp`, `get_pixel_byte_bit_BE_1bipp` |
| Packed 1bipp mutation | `set_pixel_on_1bipp_by_pixel_index`, `set_pixel_on_1bipp_xy`, `set_pixel_on_1bipp`, `set_pixel_off_1bipp_by_pixel_index`, `set_pixel_off_1bipp`, `set_pixel_1bipp` |
| Specialized coordinate setters | `set_pixel_8bipp`, `set_pixel_24bipp`, `set_pixel_32bipp` |
| Specialized index setters | `set_pixel_by_idx_1bipp`, `set_pixel_by_idx_8bipp`, `set_pixel_by_idx_24bipp`, `set_pixel_by_idx_32bipp` |
| Generic setters | `set_pixel_by_idx`, `set_pixel` |
| Specialized index getters | `get_pixel_by_idx_1bipp`, `get_pixel_by_idx_8bipp`, `get_pixel_by_idx_24bipp`, `get_pixel_by_idx_32bipp` |
| Specialized coordinate getters | `get_pixel_1bipp`, `get_pixel_8bipp`, `get_pixel_24bipp`, `get_pixel_32bipp` |
| Generic getters | `get_pixel_by_idx`, `get_pixel` |

All 27 effective descriptors are still owned at runtime by
`Pixel_Buffer_Core`. Their descriptor flags remain writable and configurable,
but non-enumerable. The exact checked functions from
`Pixel_Buffer_Core_Get_Set_Pixels` are installed at that same lookup level,
so both the supported core deep import and the final exported class share one
implementation without removing the historical class position.

The reproducible inventory command is:

```sh
node scripts/pixel-buffer-inventory.js > pixel-buffer-inventory.json
```

It scans every core JavaScript source location and emits full call-site file,
line, classification, and classification-basis records. After the phase-two
cleanup the inventory contains 27 access methods and 9 source-level call sites:
3 runtime-effective calls, 3 calls in shadow-only implementations, and 3
`require.main` module examples. No site is unclassified. The 251-line duplicate
access block in `Pixel_Buffer_Core`, including its 16 superseded internal
dispatch calls, has been removed. Active bounded loops in line drawing, packed
copying, crop/uncrop, masks, thresholding, span scanning, and boundary iteration
use explicit unsafe kernels. Calls consuming externally supplied
pixel-position lists remain on checked public access.

### Format and storage characterization

| Layout | Valid addressing | Invalid-access protection |
|---|---|---|
| 1bipp tight/padded | MSB-first, byte-aligned rows, stride-aware logical index conversion | Cannot reach prior/next rows, low tail bits, or padding |
| 8bipp tight/padded | `rowStart + x` | Cannot alias padding or a neighbouring row |
| 24bipp tight/padded | `rowStart + 3*x` | No partial RGB write outside logical pixels |
| 32bipp tight/padded | `rowStart + 4*x` | No partial RGBA write outside logical pixels |
| Supplied subview | Original constructor, backing buffer, offset, and capacity retained | Cannot touch prefix/suffix sentinels or spare capacity |
| Wide layout | Safe-integer coordinates use arithmetic without signed-16 wrapping | Well-formed outside values still fail before access |

Seeded tests compare checked and unsafe access for proved-valid inputs, and
compare spans, painter rectangles, windows, placement, and generated masks with
simple pixel oracles across all four formats and padded rows.

## Hierarchy inventory

Runtime introspection reports:

| Measure | Final value |
|---|---:|
| Substantive prototype levels | 11 |
| Prototype definitions | 229 |
| Unique effective names | 160 |
| Shadowed names | 57 |
| Identical shadows | 36 |
| Divergent shadows | 21 |
| Effective upward-dispatch dependencies | 56 |
| Characterized instance own keys | 48 |

| Effective order | Class | Own definitions |
|---:|---|---:|
| 0 | `Pixel_Buffer_Specialised_Enh` | 21 |
| 1 | `Pixel_Buffer_Perf_Focus_Enh` | 46 |
| 2 | `Pixel_Buffer_Idiomatic_Enh` | 4 |
| 3 | `Pixel_Buffer_Advanced_TypedArray_Properties` | 0 |
| 4 | `Pixel_Buffer_Core` | 62 |
| 5 | `Pixel_Buffer_Core_Reference_Implementations` | 29 |
| 6 | `Pixel_Buffer_Core_Masks` | 5 |
| 7 | `Pixel_Buffer_Core_Draw_Polygons` | 7 |
| 8 | `Pixel_Buffer_Core_Draw_Lines` | 16 |
| 9 | `Pixel_Buffer_Core_Get_Set_Pixels` | 27 |
| 10 | `Pixel_Buffer_Core_Inner_Structures` | 12 |

The 27 pixel-access shadows are now intentionally identical. The remaining 21
divergent shadows include factory/copy methods, inversion, rectangles, masks,
iteration, resize/convolution, and `toString`. They were not moved or
flattened. The dependency report also confirms why class flattening remains
unsafe: lower levels dynamically use later constructors, scratch helpers,
window factories, and effective overrides.

Hierarchy cleanup is limited to sharing the exact checked pixel-access
descriptors and removing their unreachable duplicate source bodies. Before and
after descriptor snapshots are identical for all 27 methods, including exact
function identity, source hashes, and flags. No public class, alias, module,
prototype position, or supported deep import was removed.

## Committed performance gate

`npm run benchmark` uses `node:perf_hooks`, calibrates each case to a minimum
sample duration, warms it, reports median/p95 milliseconds per operation and
environment metadata, and compares against
`benchmarks/pixel-buffer-baseline.json`.

The gate fails only when both conditions hold:

1. median time is more than 5% above baseline; and
2. the absolute increase exceeds the case's stated noise floor.

The baseline was captured with Node v20.19.5 / V8 11.3 on Linux x64 under WSL2,
an Intel Core i9-13900HX, 31 samples, an 8 ms minimum sample, and an 80 ms
warmup. Those 31-sample/80 ms values are now the harness defaults. Absolute
floors range from 0.005 ms for very small raster/placement cases to 0.30 ms for
convolution. The access floors are 0.15 ms for checked 8bipp, 0.20 ms for
checked padded 24bipp, and 0.04 ms for unchecked 8bipp. The padded-RGB floor was
calibrated from its 0.188847 ms baseline p95-minus-median dispersion after one
outlier crossed the former 0.12 ms floor; an independent repeat returned to
100.8% of baseline. These floors capture observed cross-process V8/WSL noise
rather than percentage alone.

Final committed baseline medians/p95 values:

| Case | Median ms | p95 ms |
|---|---:|---:|
| Construct 8bipp 256x256 | 0.030351 | 0.048150 |
| Checked 8bipp access, 4096 set/get pairs | 0.465449 | 1.209498 |
| Direct typed-array access, batch 4096 | 0.003433 | 0.004426 |
| Checked padded 24bipp access, batch 4096 | 0.764486 | 0.953333 |
| Explicit unsafe 8bipp access, batch 4096 | 0.131720 | 0.169842 |
| `each_pixel`, 8bipp 128x128 | 0.163668 | 0.305629 |
| 24bipp 512px line | 0.001369 | 0.001630 |
| Painter RGB rectangle | 0.011817 | 0.020867 |
| RGB mask creation | 0.896190 | 1.045088 |
| RGB resize | 0.152318 | 0.217913 |
| 8bipp 3x3 convolution | 2.080364 | 2.286676 |
| 8bipp flood fill | 0.148952 | 0.165067 |
| RGB placement | 0.002195 | 0.002457 |
| RGB source window copy | 0.004210 | 0.005594 |

A final default 31-sample gate run passed all 14 cases. In that run, checked
8bipp was 104.4% of baseline, checked padded 24bipp was 92.4%, explicit unsafe
8bipp was 59.6%, masks were 64.7%, and every remaining operation stayed inside
the dual gate.

A paired same-tree legacy/checked run was also used while the old duplicate
implementation was still selectable locally. Checked 8bipp measured 0.385518
ms versus 0.387943 ms for legacy access. Checked padded 24bipp measured
0.713761 ms versus 0.657951 ms: the 0.055810 ms increase is below the 0.20 ms
absolute noise floor. The temporary legacy switch was removed; production has
no environment-variable bypass for public safety.

## Verification

Final gates for this phase:

- `npm test`: **170 passed, 0 failed across 16 files** (required baseline was
  148/0 across 12 files);
- access safety: **9/9** cases;
- public characterization: **8/8** cases;
- seeded optimized/oracle comparisons: **4/4** groups;
- syntax: **68 JavaScript files** under core/tests/scripts/benchmarks parsed by
  `node --check`;
- module smoke loads: **23/23** package, hierarchy, layout/access, raster,
  convolution, palette, dynamic-span, and representation modules;
- `npm run benchmark`: **14/14 cases inside the dual regression gate**;
- `npm pack --dry-run --json`: **128 files, 1,481,782 bytes packed,
  3,048,453 bytes unpacked**.

## Remaining risks and smallest safe next phase

The smallest safe follow-up is still not class flattening. It is a bounded
deep-import and divergent-shadow characterization phase:

1. Add explicit checked/unsafe by-index benchmark cases for 1, 24, and 32bipp,
   plus tight/padded conversion and polygon cases. Capture baselines on native
   Windows and CI Linux to replace WSL-specific noise floors with per-platform
   data.
2. Replace the inventory's conservative file-level shadow rules with
   method-range parsing before using it for broader automated cleanup.
3. Differential-test the 21 divergent shadows one method family at a time.
   Start with copy/factory methods because subclass preservation is already
   characterized. Do not move resize, convolution, masks, or iteration in the
   same patch.
4. Research supported consumer deep imports before adding `exports` or a
   package `files` allow-list. The pack audit still includes historical,
   example, test, and review assets, but reducing it without consumer evidence
   could break existing users.

## Copyable prompt for the next turn

```text
Continue work in /mnt/c/Users/james/Documents/repos/jsgui3-gfx-core.

Read docs/11-pixel-buffer-layout-contract.md,
docs/12-remediation-research-and-next-turn.md, and
docs/13-pixel-access-safety-performance-and-hierarchy.md first. Preserve all
unrelated worktree changes. The required baseline is 170 passing and 0 failing
cases across 16 files, with all 14 benchmark cases inside the dual gate.

Primary goal: improve the hierarchy inventory to identify enclosing method
ranges and then characterize the first divergent shadow family without
flattening classes or changing public dispatch.

1. Replace conservative file-level call-site classification with a lexical or
   AST-backed method-range inventory. Classify runtime-effective, shadow-only,
   require.main, externally sourced, and unresolved calls. Preserve line
   numbers and classification evidence; fail tests if any access call site is
   unresolved.

2. Add checked and unchecked by-index benchmarks for 1/8/24/32bipp, including
   tight and padded rows and 1bipp byte-boundary widths. Keep 31 samples, an
   80 ms warmup, environment metadata, and the dual >5% plus absolute-floor
   rule. Calibrate new floors from repeated measurements, not a single run.

3. Inventory consumer-visible deep imports from repository code, package
   examples, tests, and README/docs references. Do not add an exports map or
   files allow-list yet. Report which paths need external-consumer evidence.

4. Differential-test the copy/factory divergent shadows first: blank_copy,
   clone, crop, uncrop, copy_pixel_pos_list_region, add_alpha_channel, and
   split_rgb_channels. Cover each relevant deep-import class, descriptors,
   constructors, subclass preservation, storage ownership, layout aliases,
   padded rows, packed tails, and invalid inputs. Do not move implementations
   in the same turn unless every implementation is proven identical over its
   supported domain and the change is descriptor- and benchmark-neutral.

5. Finish with npm test, full node --check, npm run benchmark, descriptor
   snapshots, generated inventory, randomized pixel oracles, module smoke
   loads, SVG validation, and npm pack --dry-run --json. Report exact results
   and write the smallest safe follow-up prompt.
```
