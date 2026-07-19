
const lang = require('lang-mini');
const {
    each,
    fp,
    tof,
    get_a_sig,
    are_equal,
    tf
} = lang;
const maxui64 = ~0n;
const Pixel_Pos_List = require('./pixel-pos-list');
const oext = require('obext');
const {ro, prop} = oext;
const Typed_Array_Binary_Read_Write = require('./Typed_Array_Binary_Read_Write');
const Pixel_Buffer_Painter = require('./pixel-buffer-painter');
let ta_math = require('./ta-math')
let {resize_ta_colorspace, copy_rect_to_same_size_8bipp, copy_rect_to_same_size_24bipp, dest_aligned_copy_rect_1to4bypp} = ta_math;
const pixelAccess = require('./pixel-buffer-pixel-access');
const {
    assertPixelPosition,
    assertPixelIndex,
    unsafeSetPixel1bipp,
    unsafeSetPixel8bipp,
    unsafeSetPixel24bipp,
    unsafeSetPixel32bipp,
    unsafeSetPixelByIndex1bipp,
    unsafeSetPixelByIndex8bipp,
    unsafeSetPixelByIndex24bipp,
    unsafeSetPixelByIndex32bipp,
    unsafeGetPixelByIndex1bipp,
    unsafeGetPixelByIndex8bipp,
    unsafeGetPixelByIndex24bipp,
    unsafeGetPixelByIndex32bipp,
    unsafeGetPixel1bipp,
    unsafeGetPixel8bipp,
    unsafeGetPixel24bipp,
    unsafeGetPixel32bipp
} = pixelAccess;

// Core structures first?

// inner core
const Pixel_Buffer_Core_Inner_Structures = require('./pixel-buffer-0-core-inner-structures');


class Pixel_Buffer_Core_Get_Set_Pixels extends Pixel_Buffer_Core_Inner_Structures{
    constructor(spec) {
        if (spec instanceof Pixel_Buffer_Core_Get_Set_Pixels) {
            spec = {
                bits_per_pixel: spec.bits_per_pixel,
                size: spec.size,
                rowStrideBytes: spec.bytes_per_row,
                rowAlignmentBytes: spec.layout.rowAlignmentBytes,
                ta: spec.storage
            }
        }

        super(spec);
        
    }
    
    'get_pixel_byte_bit_1bipp'(pos) {
        pixelAccess.assertPixelPosition(this, pos);
        return pixelAccess.unsafeGetPixelByteBit1bipp(this, pos);
    }
    'get_pixel_byte_bit_BE_1bipp'(pos) {
        pixelAccess.assertPixelPosition(this, pos);
        return pixelAccess.unsafeGetPixelByteBit1bipp(this, pos);
    }
    set_pixel_on_1bipp_by_pixel_index(pixel_index) {
        pixelAccess.assertPixelIndex(this, pixel_index);
        return pixelAccess.unsafeSetPixelOn1bippByIndex(this, pixel_index);
    }

    'set_pixel_on_1bipp_xy'(x, y) {
        pixelAccess.assertPixelXY(this, x, y);
        return pixelAccess.unsafeSetPixelOn1bippXY(this, x, y);
    }

    'set_pixel_on_1bipp'(pos) {
        pixelAccess.assertPixelPosition(this, pos);
        return pixelAccess.unsafeSetPixelOn1bipp(this, pos);
    }
    set_pixel_off_1bipp_by_pixel_index(pixel_index) {
        pixelAccess.assertPixelIndex(this, pixel_index);
        return pixelAccess.unsafeSetPixelOff1bippByIndex(this, pixel_index);
    }
    'set_pixel_off_1bipp'(pos) {
        pixelAccess.assertPixelPosition(this, pos);
        return pixelAccess.unsafeSetPixelOff1bipp(this, pos);
    }
    'set_pixel_1bipp'(pos, color) {
        pixelAccess.assertPixelPosition(this, pos);
        return pixelAccess.unsafeSetPixel1bipp(this, pos, color);
    }
    'set_pixel_by_idx_1bipp'(idx, color) {
        pixelAccess.assertPixelIndex(this, idx);
        return pixelAccess.unsafeSetPixelByIndex1bipp(this, idx, color);
    }
    'set_pixel_8bipp'(pos, color) {
        pixelAccess.assertPixelPosition(this, pos);
        return pixelAccess.unsafeSetPixel8bipp(this, pos, color);
    }
    'set_pixel_24bipp'(pos, color) {
        pixelAccess.assertPixelPosition(this, pos);
        return pixelAccess.unsafeSetPixel24bipp(this, pos, color);
    }
    'set_pixel_32bipp'(pos, color) {
        pixelAccess.assertPixelPosition(this, pos);
        return pixelAccess.unsafeSetPixel32bipp(this, pos, color);
    }
    'set_pixel_by_idx_8bipp'(idx, color) {
        pixelAccess.assertPixelIndex(this, idx);
        return pixelAccess.unsafeSetPixelByIndex8bipp(this, idx, color);
    }
    'set_pixel_by_idx_24bipp'(idx, color) {
        pixelAccess.assertPixelIndex(this, idx);
        return pixelAccess.unsafeSetPixelByIndex24bipp(this, idx, color);
    }
    'set_pixel_by_idx_32bipp'(idx, color) {
        pixelAccess.assertPixelIndex(this, idx);
        return pixelAccess.unsafeSetPixelByIndex32bipp(this, idx, color);
    }
    'set_pixel_by_idx'(idx, color) {
        const a = arguments;
        const l = a.length;
        const bipp = this.bipp;
        if (bipp === 1) {
            assertPixelIndex(this, a[0]);
            return unsafeSetPixelByIndex1bipp(this, a[0], a[1]);
        } else if (bipp === 8) {
            if (l === 2) {
                assertPixelIndex(this, a[0]);
                return unsafeSetPixelByIndex8bipp(this, a[0], a[1]);
            }
        } else if (bipp === 24) {
            if (l === 2) {
                assertPixelIndex(this, a[0]);
                return unsafeSetPixelByIndex24bipp(this, a[0], a[1]);
            }
        } else if (bipp === 32) {
            if (l === 2) {
                assertPixelIndex(this, a[0]);
                return unsafeSetPixelByIndex32bipp(this, a[0], a[1]);
            }
        }
    }
    'set_pixel'(pos, color) {
        const a = arguments;
        const l = a.length;
        const bipp = this.bipp;
        if (bipp === 1) {
            assertPixelPosition(this, pos);
            return unsafeSetPixel1bipp(this, pos, color);
        } else if (bipp === 8) {
            if (l === 2) {
                assertPixelPosition(this, pos);
                return unsafeSetPixel8bipp(this, pos, color);
            }
        } else if (bipp === 24) {
            if (l === 2) {
                assertPixelPosition(this, pos);
                return unsafeSetPixel24bipp(this, pos, color);
            }
        } else if (bipp === 32) {
            if (l === 2) {
                assertPixelPosition(this, pos);
                return unsafeSetPixel32bipp(this, pos, color);
            }
        } else {
            console.trace();
            throw 'unsupported bipp: ' + bipp;
        }
    }
    'get_pixel_by_idx_1bipp'(idx) {
        pixelAccess.assertPixelIndex(this, idx);
        return pixelAccess.unsafeGetPixelByIndex1bipp(this, idx);
    }
    'get_pixel_by_idx_8bipp'(idx) {
        pixelAccess.assertPixelIndex(this, idx);
        return pixelAccess.unsafeGetPixelByIndex8bipp(this, idx);
    }
    'get_pixel_by_idx_24bipp'(idx) {
        pixelAccess.assertPixelIndex(this, idx);
        return pixelAccess.unsafeGetPixelByIndex24bipp(this, idx);
    }
    'get_pixel_by_idx_32bipp'(idx) {
        pixelAccess.assertPixelIndex(this, idx);
        return pixelAccess.unsafeGetPixelByIndex32bipp(this, idx);
    }
    'get_pixel_by_idx'(idx) {
        const bipp = this.bits_per_pixel;
        assertPixelIndex(this, idx);
        if (bipp === 1) {
            return unsafeGetPixelByIndex1bipp(this, idx);
        } else if (bipp === 8) {
            return unsafeGetPixelByIndex8bipp(this, idx);
        } else if (bipp === 24) {
            return unsafeGetPixelByIndex24bipp(this, idx);
        } else if (bipp === 32) {
            return unsafeGetPixelByIndex32bipp(this, idx);
        } else {
            throw 'Unsupported bipp'
        }
    }
    'get_pixel_1bipp'(pos) {
        pixelAccess.assertPixelPosition(this, pos);
        return pixelAccess.unsafeGetPixel1bipp(this, pos);
    }
    'get_pixel_8bipp'(pos) {
        pixelAccess.assertPixelPosition(this, pos);
        return pixelAccess.unsafeGetPixel8bipp(this, pos);
    }
    'get_pixel_24bipp'(pos) {
        pixelAccess.assertPixelPosition(this, pos);
        return pixelAccess.unsafeGetPixel24bipp(this, pos);
    }
    'get_pixel_32bipp'(pos) {
        pixelAccess.assertPixelPosition(this, pos);
        return pixelAccess.unsafeGetPixel32bipp(this, pos);
    }
    'get_pixel'(pos) {
        const bipp = this.bits_per_pixel;
        assertPixelPosition(this, pos);
        if (bipp === 1) {
            return unsafeGetPixel1bipp(this, pos);
        } else if (bipp === 8) {
            return unsafeGetPixel8bipp(this, pos);
        } else if (bipp === 24) {
            return unsafeGetPixel24bipp(this, pos);
        } else if (bipp === 32) {
            return unsafeGetPixel32bipp(this, pos);
        } else {
            console.trace();
            throw 'bits per pixels error';
        }
    }

    // Maybe a class level that has get and set pixel logic for the different bipps at this level.

    
    
}
module.exports = Pixel_Buffer_Core_Get_Set_Pixels;
