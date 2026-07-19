# Pixel Buffer Layout Contract

Every `Pixel_Buffer` now has one immutable `layout` object. It is the
canonical description of how the mutable pixel bytes are arranged. Algorithms
must use this geometry instead of independently recomputing buffer lengths or
assuming that rows are tightly packed.

## Contract fields

| Field | Meaning |
|---|---|
| `width`, `height` | Positive, validated pixel dimensions. |
| `bitsPerPixel` | One of `1`, `8`, `24`, or `32`. |
| `bytesPerPixel` | `0` for packed 1bipp data; otherwise `1`, `3`, or `4`. |
| `rowDataBits` | Pixel payload bits in one row: `width * bitsPerPixel`. |
| `rowDataBytes` | Bytes occupied by one row's payload, rounded up for 1bipp. |
| `rowStrideBytes` | Byte distance from the start of one row to the next. |
| `logicalByteLength` | Bytes belonging to the image layout: `rowStrideBytes * height`. |
| `capacityByteLength` | Bytes available in the supplied or allocated storage view. |
| `rowAlignmentBytes` | Requested power-of-two row alignment. The default is `1`. |
| `bitOrder` | `msb-first`: x=0 uses mask `0x80`, x=7 uses `0x01`. |
| `rowPacking` | `byte-aligned`: every row begins at a byte boundary. |
| `rowPaddingPolicy` | `zero-filled`: library operations keep padding bytes at zero. |
| `tailMask` | Mask retaining valid bits in the final 1bipp payload byte of each row. |

The layout, dimensions, and format aliases are read-only. Changing bipp or
dimensions in place would reinterpret existing bytes, so conversions and
resizes create a new Pixel Buffer instead.

## Logical bytes and capacity

`pb.ta` and the legacy `pb.buffer` alias expose exactly
`layout.logicalByteLength` bytes. `pb.storage` exposes the complete capacity.
This prevents spare allocation bytes from being mistaken for pixels while
retaining aligned headroom used by low-level implementations.

Internally allocated storage is rounded to an 8-byte capacity boundary.
Caller-supplied `Uint8Array`, `Uint8ClampedArray`, and Node `Buffer` views
retain their constructor, backing buffer, byte offset, and full view length.
Storage shorter than the logical image is rejected.

```js
const pb = new Pixel_Buffer({
    size: [3, 2],
    bits_per_pixel: 24,
    rowAlignmentBytes: 4
});

pb.layout.rowDataBytes;       // 9
pb.layout.rowStrideBytes;     // 12
pb.layout.logicalByteLength;  // 24
pb.ta.length;                 // 24
```

An explicit stride can be supplied with `rowStrideBytes` (or the legacy
`bytes_per_row` / `bypr` aliases). It must be at least `rowDataBytes` and a
multiple of `rowAlignmentBytes`.

## Addressing rules

Byte-aligned formats use:

```text
rowStart   = y * rowStrideBytes
byteOffset = rowStart + x * bytesPerPixel
```

Packed 1bipp uses:

```text
rowStart   = y * rowStrideBytes
byteOffset = rowStart + floor(x / 8)
mask       = 0x80 >> (x % 8)
```

Logical pixel-index APIs remain row-major. When rows are padded they translate
the logical index to x/y before finding the byte; tightly packed layouts retain
the direct index fast path.

## Public access and internal kernels

Every public `get_pixel*` and `set_pixel*` coordinate entry point requires two
safe-integer coordinates inside `0 <= x < width` and `0 <= y < height`.
Every public by-index entry point requires a safe integer inside
`0 <= index < width * height`. Malformed coordinates/indexes throw
`TypeError`; well-formed but out-of-range values throw `RangeError`. Setters
validate before writing, so a failed call cannot alter a pixel, another row,
packed tail bits, padding, spare storage capacity, or bytes outside a supplied
subview.

Proved-bounded internal loops use the explicitly named functions in
`core/pixel-buffer-pixel-access.js`. Those functions start with `unsafe` and
perform no validation. They are deliberately not installed on a public
prototype: callers must establish bounds once at operation setup and may then
use the straight-line, stride-aware kernel inside the loop. This separates the
public safety boundary from hot-loop cost.

For a 1bipp width that is not divisible by eight, unused low bits in the final
payload byte are always zero. For example, width 5 has `tailMask === 0xF8`.
Any bytes between `rowDataBytes` and `rowStrideBytes` are row padding and are
also kept at zero.

## Construction validation

Construction rejects:

- missing, zero, negative, fractional, non-finite, or unsafe dimensions;
- unsupported or contradictory pixel formats;
- non-power-of-two row alignment;
- a stride smaller than the row payload or inconsistent with its alignment;
- non-byte storage views and storage shorter than the logical image;
- conflicting storage aliases.

Supplied storage remains shared and mutable. At construction, invalid 1bipp
tail bits and row-padding bytes inside the logical image are cleared once to
establish the canonical invariant. Spare capacity beyond
`logicalByteLength` is not modified.

## Performance policy

Layout validation and view creation occur only during construction. Random
public pixel access performs one coordinate/index validation per call. Hot
aliases such as `bipp`, `bypp`, and `bypr` are direct read-only data properties.
Working tight-row loops retain straight-line indexing or native typed-array
fill/set operations. Already-bounded loops use explicit unchecked accessors;
row-aware fallbacks are selected once per operation, or used only for
explicitly padded layouts.

Tests covering this contract live in
`tests/pixel-buffer-layout.test.js` and
`tests/pixel-buffer-stride-operations.test.js`. Public access safety and
checked/unchecked equivalence are covered by
`tests/pixel-buffer-access-contract.test.js` and
`tests/pixel-buffer-seeded-oracles.test.js`.
