'use strict';

/*
 * Source-over for straight (non-premultiplied) 32bpp RGBA, with the same
 * integer rule as fill_polygons:
 *   src alpha 255 -> copy; src alpha 0 -> keep the destination;
 *   destination opaque -> c = round((s * sa + d * (255 - sa)) / 255);
 *   otherwise alpha = round(aw / 255) with aw = 255 sa + da (255 - sa) and
 *   c = round((255 s sa + d da (255 - sa)) / aw).
 */

// round(t / 255) for 0 <= t <= 65025.
const div255 = t => {
    const x = t + 128;
    return (x + (x >> 8)) >> 8;
};

// Composite `count` pixels of src (from byte s) over dst (from byte d).
const blend_over_row_32 = (src, s, dst, d, count) => {
    for (let i = 0; i < count; i++, s += 4, d += 4) {
        const sa = src[s + 3];
        if (sa === 0) continue;
        if (sa === 255) {
            dst[d] = src[s]; dst[d + 1] = src[s + 1]; dst[d + 2] = src[s + 2]; dst[d + 3] = 255;
            continue;
        }
        const da = dst[d + 3], isa = 255 - sa;
        if (da === 255) {
            dst[d] = div255(src[s] * sa + dst[d] * isa);
            dst[d + 1] = div255(src[s + 1] * sa + dst[d + 1] * isa);
            dst[d + 2] = div255(src[s + 2] * sa + dst[d + 2] * isa);
            continue;
        }
        const sw = sa * 255, dw = da * isa, aw = sw + dw;
        dst[d] = Math.floor((2 * (src[s] * sw + dst[d] * dw) + aw) / (2 * aw));
        dst[d + 1] = Math.floor((2 * (src[s + 1] * sw + dst[d + 1] * dw) + aw) / (2 * aw));
        dst[d + 2] = Math.floor((2 * (src[s + 2] * sw + dst[d + 2] * dw) + aw) / (2 * aw));
        dst[d + 3] = div255(aw);
    }
};

module.exports = {blend_over_row_32, div255};
