
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

// Core structures first?

// inner core
const Pixel_Buffer_Core_Inner_Structures = require('./pixel-buffer-0-core-inner-structures');


class Pixel_Buffer_Core_Get_Set_Pixels extends Pixel_Buffer_Core_Inner_Structures{
    constructor(spec) {
        if (spec instanceof Pixel_Buffer_Core_Get_Set_Pixels) {
            spec = {
                bits_per_pixel: spec.bits_per_pixel,
                size: spec.size,
                ta: spec.ta
            }
        }

        super(spec);
        
    }
    
    'get_pixel_byte_bit_1bipp'(pos) {
        /*
        */
        const idx = pos[1] * this.size[0] + pos[0];
        const byte = idx >> 3;
        const bit = (idx & 0b111);
        return {byte, bit};
    }
    'get_pixel_byte_bit_BE_1bipp'(pos) {
        const idx = pos[1] * this.size[0] + pos[0];
        const byte = idx >> 3;
        const bit = (idx & 0b111);
        return {byte, bit};
    }
    set_pixel_on_1bipp_by_pixel_index(pixel_index) {
        this.ta[pixel_index >> 3] |= (128 >> (pixel_index & 0b111));
    }

    'set_pixel_on_1bipp_xy'(x, y) {
        const pixel_index = y * this.size[0] + x;
        this.ta[pixel_index >> 3] |= (128 >> (pixel_index & 0b111));
    }

    'set_pixel_on_1bipp'(pos) {
        const pixel_index = pos[1] * this.size[0] + pos[0];
        this.ta[pixel_index >> 3] |= (128 >> (pixel_index & 0b111));
    }
    set_pixel_off_1bipp_by_pixel_index(pixel_index) {
        this.ta[pixel_index >> 3] &= (~(128 >> (pixel_index & 0b111))) & 255;
    }
    'set_pixel_off_1bipp'(pos) {
        const pixel_idx = pos[1] * this.size[0] + pos[0];
        this.ta[pixel_idx >> 3] &= (~(128 >> (pixel_idx & 0b111))) & 255;
    }
    'set_pixel_1bipp'(pos, color) {
        const idx_bit = (pos[1] * this.size[0]) + pos[0];
        const byte = idx_bit >> 3;
        const bit = (idx_bit & 0b111);
        if (color === 1) {
            this.ta[byte] |= (128 >> bit);
        } else {
            this.ta[byte] &= (~(128 >> bit)) & 255;
        }
    }
    'set_pixel_8bipp'(pos, color) {
        const idx = pos[1] * this.size[0] + pos[0];
        this.ta[idx] = color;
    }
    'set_pixel_24bipp'(pos, color) {
        const idx = pos[1] * this.size[0] + pos[0];
        let byte = idx * 3;
        this.ta[byte++] = color[0];
        this.ta[byte++] = color[1];
        this.ta[byte] = color[2];
    }
    'set_pixel_32bipp'(pos, color) {
        const idx = pos[1] * this.size[0] + pos[0];
        let byte = idx * 4;
        this.ta[byte++] = color[0];
        this.ta[byte++] = color[1];
        this.ta[byte++] = color[2];
        this.ta[byte] = color[3];
    }
    'set_pixel_by_idx_8bipp'(idx, color) {
        const byte = idx;
        this.ta[byte] = color;
    }
    'set_pixel_by_idx_24bipp'(idx, color) {
        const byte = idx * 3;
        this.ta[byte] = color[0];
        this.ta[byte + 1] = color[1];
        this.ta[byte + 2] = color[2];
    }
    'set_pixel_by_idx_32bipp'(idx, color) {
        const byte = idx * 4;
        this.ta[byte] = color[0];
        this.ta[byte + 1] = color[1];
        this.ta[byte + 2] = color[2];
        this.ta[byte + 3] = color[3];
    }
    'set_pixel_by_idx'(idx, color) {
        const a = arguments;
        const l = a.length;
        const bipp = this.bipp;
        if (bipp === 1) {
            return this.set_pixel_by_idx_1bipp(a[0], a[1]);
        } else if (bipp === 8) {
            if (l === 2) {
                return(this.set_pixel_by_idx_8bipp(a[0], a[1]));
            }
        } else if (bipp === 24) {
            if (l === 2) {
                return(this.set_pixel_by_idx_24bipp(a[0], a[1]));
            }
        } else if (bipp === 32) {
            if (l === 2) {
                return(this.set_pixel_by_idx_32bipp(a[0], a[1]));
            }
        }
    }
    'set_pixel'(pos, color) {
        const a = arguments;
        const l = a.length;
        const bipp = this.bipp;
        if (bipp === 1) {
            return(this.set_pixel_1bipp(a[0], a[1]));
        } else if (bipp === 8) {
            if (l === 2) {
                return(this.set_pixel_8bipp(a[0], a[1]));
            }
        } else if (bipp === 24) {
            if (l === 2) {
                return(this.set_pixel_24bipp(a[0], a[1]));
            }
        } else if (bipp === 32) {
            if (l === 2) {
                return(this.set_pixel_32bipp(a[0], a[1]));
            }
        } else {
            console.trace();
            throw 'unsupported bipp: ' + bipp;
        }
    }
    'get_pixel_by_idx_1bipp'(idx) {
        /*
        const idx = pos[1] * this.size[0] + pos[0];
        const byte = idx >> 3;
        const bit = (idx & 0b111);
        */
        const byte = idx >> 3;
        const bit = (idx & 0b111);
        const pow = 128 >> bit;
        return ((this.ta[byte] & pow) === pow) ? 1 : 0;
    }
    'get_pixel_by_idx_8bipp'(idx) {
        const byte = idx;
        return this.ta[byte];
    }
    'get_pixel_by_idx_24bipp'(idx) {
        const byte = idx * 3;
        return this.ta.slice(byte, byte + 3);
    }
    'get_pixel_by_idx_32bipp'(idx) {
        const byte = idx * 4;
        return this.ta.slice(byte, byte + 4);
    }
    'get_pixel_by_idx'(idx) {
        const bipp = this.bits_per_pixel;
        if (bipp === 1) {
            return this.get_pixel_by_idx_1bipp(idx);
        } else if (bipp === 8) {
            return this.get_pixel_by_idx_8bipp(idx);
        } else if (bipp === 24) {
            return this.get_pixel_by_idx_24bipp(idx);
        } else if (bipp === 32) {
            return this.get_pixel_by_idx_32bipp(idx);
        } else {
            throw 'Unsupported bipp'
        }
    }
    'get_pixel_1bipp'(pos) {
        const idx = (pos[1] * this.size[0]) + pos[0];
        const byte = idx >> 3;
        return ((this.ta[byte] & 128 >> (idx & 0b111)) !== 0) ? 1 : 0;
    }
    'get_pixel_8bipp'(pos) {
        const idx = pos[1] * this.size[0] + pos[0];
        const byte = idx;
        return this.ta[byte];
    }
    'get_pixel_24bipp'(pos) {
        const idx = pos[1] * this.size[0] + pos[0];
        const byte = idx * 3;
        return this.ta.slice(byte, byte + 3);
    }
    'get_pixel_32bipp'(pos) {
        const idx = pos[1] * this.size[0] + pos[0];
        const byte = idx * 4;
        return this.ta.slice(byte, byte + 4);
    }
    'get_pixel'(pos) {
        const bipp = this.bits_per_pixel;
        if (bipp === 1) {
            return this.get_pixel_1bipp(pos);
        } else if (bipp === 8) {
            return this.get_pixel_8bipp(pos);
        } else if (bipp === 24) {
            return this.get_pixel_24bipp(pos);
        } else if (bipp === 32) {
            return this.get_pixel_32bipp(pos);
        } else {
            console.trace();
            throw 'bits per pixels error';
        }
    }

    // Maybe a class level that has get and set pixel logic for the different bipps at this level.

    
    
}
module.exports = Pixel_Buffer_Core_Get_Set_Pixels;