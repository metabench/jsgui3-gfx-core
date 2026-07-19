# Method-range Inventory, Deep Imports, and Factory-shadow Research

## Outcome

This phase strengthened the evidence needed before any hierarchy consolidation.
It did not move a method, change effective dispatch, flatten a class, or add a
package export restriction.

The access inventory now lexically resolves enclosing class-method ranges
instead of inferring dispatch from filenames. Six differential test groups
then exercised the first divergent copy/factory family across the relevant
deep-import classes. The result is conclusive: the shadows are not equivalent,
and consolidation would currently replace working effective behavior with
broken or layout-unsafe lower-level behavior.

The accompanying review diagram is
[`svg/14-method-ranges-deep-imports-and-shadows.svg`](./svg/14-method-ranges-deep-imports-and-shadows.svg).

## Method-range access inventory

The inventory masks comments and string literals while preserving line
positions, tracks class and method brace ranges, and attaches the following to
each access call:

- enclosing class and method;
- method start/end line;
- effective runtime owner;
- classification and human-readable evidence.

It parsed **291 class-method ranges**. The 9 remaining access sites are now:

| Classification | Count | Meaning |
|---|---:|---|
| Shadow-only | 3 | The enclosing method is overridden in final dispatch |
| Module example | 3 | The call is below a `require.main` guard |
| Externally sourced | 2 | Effective code consumes positions from a supplied pixel list |
| Runtime-effective | 1 | Effective code uses a derived target coordinate |
| Unclassified | 0 | Test failure if this becomes non-zero |

The externally sourced calls deliberately remain checked. The one
runtime-effective derived call also remains checked because it is outside the
proved-bounded raster-kernel set and is not a measured bottleneck.

## By-index performance matrix

The benchmark suite now adds checked and explicit unsafe logical-index access
for 1/8/24/32bipp in both tight and padded layouts. Packed tests include a
64-pixel byte-boundary width and a 13-pixel padded/tail width. Each operation
performs 1,024 set/get pairs.

Baselines were calibrated from three independent 31-sample runs. The stored
median is the median of those three medians; p95/min values are likewise the
middle observations. Absolute floors use the observed cross-run spread and
baseline p95 dispersion.

| Format | Tight checked / unsafe ms | Padded checked / unsafe ms |
|---|---:|---:|
| 1bipp | 0.184208 / 0.066973 | 0.161375 / 0.070546 |
| 8bipp | 0.188611 / 0.068784 | 0.194366 / 0.075259 |
| 24bipp | 0.247875 / 0.140601 | 0.286681 / 0.158987 |
| 32bipp | 0.259631 / 0.146965 | 0.295665 / 0.174395 |

The unsafe kernels take roughly 36–59% of checked time in these batches. This
confirms that internal loops should retain proved-bounded kernels while public
random access retains validation.

The suite now contains **30 cases**. A dual-gate candidate is rerun as an
independent warm confirmation; failure requires both trials to exceed 5% and
the case's absolute floor. This handles observed process-level WSL/V8
dispersion without silently widening every threshold. The final run had no
candidate and all 30 cases passed.

## Deep-import evidence

A new reproducible inventory scans JavaScript, Markdown, and JSON repository
sources for CommonJS, ESM, dynamic-import, and documented module paths. It
resolves those references to existing repository modules and separates tests,
examples, documentation, benchmarks, tooling, internal-core use, and root
files.

Final local evidence:

| Measure | Count |
|---|---:|
| Referenced core targets | 44 |
| Deduplicated references | 227 |
| Targets with repository consumer evidence | 37 |
| Non-main paths needing external evidence | 36 |

The package main has extensive repository evidence. Thirty-six deeper paths
are referenced by tests/examples/docs but have no evidence about external npm
consumers. Therefore this phase does not add an `exports` map, remove a deep
module, or introduce a restrictive package `files` list. Repository evidence
can prove that a path matters locally; it cannot prove that unobserved external
consumers do or do not use it.

## Differential factory-shadow results

The characterized family was:

- `blank_copy`, `clone`, `add_alpha_channel`;
- `split_rgb_channels`;
- `copy_pixel_pos_list_region`;
- `crop` and `uncrop`.

Tests cover descriptors, constructors, direct deep-import classes, subclass
and constructor preservation, independent storage, layout aliases, tight and
padded rows, 1bipp tails/padding, all four pixel formats for effective
crop/uncrop, pixel-list regions, and invalid crop geometry.

| Family | Lower shadow result | Effective Core/public result |
|---|---|---|
| Blank/clone, tight RGB | Matches pixel oracle | Matches |
| Blank/clone, padded RGB | Drops source stride/alignment; clone reinterprets padding as pixels | Preserves layout, bytes and ownership |
| Add-alpha/split, tight RGB | Matches pixel oracle | Matches |
| Add-alpha/split, padded RGB | Linear scan consumes padding and shifts row-two pixels | Row-stride aware and byte-correct |
| Pixel-list region copy | Calls missing legacy `get_pixel_ta`/`set_pixel_ta` helpers | Checked, padded-row safe and oracle-correct |
| Crop/uncrop | Absent at the lowest class; reference implementation calls missing `each_pixel_ta` | Validated and oracle-correct for 1/8/24/32bipp |
| Packed clone/blank | Not selected for consolidation | Effective paths preserve tail mask, padding and ownership |

These failures are in shadow-only deep-import paths, so they do not affect
normal final dispatch. They do mean the implementations cannot be shared or
moved yet. No source implementation was consolidated in this phase.

## Verification

- `npm test`: **177 passed, 0 failed across 18 files**;
- factory-shadow differential tests: **6/6**;
- access inventory: **291 method ranges, 9/9 classified, 0 unresolved**;
- deep-import inventory: **44 targets, 227 references**;
- `node --check`: **71 JavaScript files**;
- `npm run benchmark`: **30/30 cases inside the confirmed dual gate**;
- hierarchy: **11 levels and 21 divergent shadows retained**;
- module smoke loads: **23/23**;
- `npm pack --dry-run --json`: **133 files, 1,495,818 bytes packed,
  3,110,341 bytes unpacked**.

## Smallest safe next phase

The next safe phase is to repair, not consolidate, the broken shadow-only
factory paths in place:

1. Add padded-row and packed-tail oracles directly against the lowest and
   reference deep-import classes.
2. Replace missing legacy-helper calls in region copy, crop, and uncrop with
   their own layout-aware implementations while retaining each class and
   descriptor owner.
3. Make lower blank/clone/add-alpha/channel-split preserve the immutable layout
   and supplied storage-view rules. Broken-path performance is not a blocker,
   but effective final dispatch must remain descriptor- and benchmark-identical.
4. Search public package/code indexes for actual external deep-import usage
   before proposing `exports` or `files`.
5. Add conversion and polygon benchmark cases; keep the confirmed dual gate.
6. Only after lower paths pass the same oracle should a later turn re-run
   equivalence research. Do not consolidate in the repair turn.

## Copyable prompt for the next turn

```text
Continue work in /mnt/c/Users/james/Documents/repos/jsgui3-gfx-core.

Read docs/11-pixel-buffer-layout-contract.md through
docs/14-method-ranges-deep-imports-and-shadows.md first. Preserve unrelated
worktree changes. The required baseline is 177 passing and 0 failing cases
across 18 files, with 30 benchmark cases inside the confirmed dual gate.

Primary goal: repair the broken shadow-only copy/factory paths in place without
moving descriptor ownership, changing effective Pixel_Buffer dispatch, or
flattening the hierarchy.

1. Add direct deep-import oracle tests first for padded and packed blank_copy,
   clone, add_alpha_channel, split_rgb_channels, copy_pixel_pos_list_region,
   crop, and uncrop. Preserve constructors, pos, immutable layout aliases,
   storage ownership/subview bounds, row padding, and tail masks.

2. Implement layout-aware repairs independently at the lowest and reference
   classes. Remove reliance on missing get_pixel_ta, set_pixel_ta, and
   each_pixel_ta helpers. Do not redirect lower descriptors to the effective
   Core implementation in this turn.

3. Snapshot all effective Core/public descriptors and rerun public byte oracles
   before and after. Effective functions and dispatch must remain identical.
   Performance constraints do not apply to previously broken lower paths, but
   no existing effective benchmark may cross the confirmed dual gate.

4. Search public npm/GitHub code evidence for external deep imports. Report
   exact queries and distinguish absence of evidence from evidence of absence.
   Do not add exports/files restrictions without positive consumer mapping.

5. Add conversion and polygon cases to the benchmark harness, calibrating new
   floors from at least three independent runs. Retain 31 samples, 80 ms warmup,
   environment metadata, and independent confirmation of dual-gate candidates.

6. Finish with npm test, full node --check, npm run benchmark, descriptor
   snapshots, both inventories, randomized pixel oracles, module smoke loads,
   SVG validation, and npm pack --dry-run --json. Report exact results and the
   smallest safe following phase.
```
