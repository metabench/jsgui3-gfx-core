

const lang = require('lang-mini');

const {
    each,
    fp,
    tof,
    get_a_sig,
    are_equal,
    tf
} = lang;

//const Pixel_Pos_List = require('./pixel-pos-list');

const oext = require('obext');

const {ro, prop} = oext;

const Pixel_Buffer_Core = require('./pixel-buffer-core');

class Pixel_Buffer_Advanced_TypedArray_Properties extends Pixel_Buffer_Core {

    constructor(...a) {
        super(...a);


        let ta_scratch;
        let ta_pos_scratch;        // Int16Array(2)
        let ta_pos_iterator;        // Int16Array(2)
        let ta_move_vector;
        let ta_bounds;
        let ta_24bit_color;
        let ta_32bit_color;
        //let ta_rgba;
        let ta_row_scratch;

        let ta_bounds_scratch;     // Int16Array(4);
        let ta_bounds2_scratch;    // Int16Array(4);
        let ta_bounds3_scratch;    // Int16Array(4);
        let ta_bounds4_scratch;    // Int16Array(4);
        let ta_size_scratch;       // Uint16Array(2);
        let ta_size2_scratch;       // Uint16Array(2);
        let ta_pointers_scratch;
        let ta_pointers2_scratch;
        let ta_pointerpair_scratch;
        let ta_offsets_scratch;
        let ta_offsets_info_scratch; 


        const setup_ta_ro_props = () => {


            // See about using 'scratch' and other temporary tas.



            ro(this, 'ta_scratch', () => {
                if (!ta_scratch) {
                    ta_scratch = new this.ta.constructor(this.ta);
                } else {
    
                    // If it's not already an instance of the constructor of this.ta?
    
    
    
                    // check the size...? the types as well?
                    if (ta_scratch.length !== this.ta.length) {
                        ta_scratch = new this.ta.constructor(this.ta);
                    } else {
                        const l = this.ta.length;
                        // Could use faster copy?
                        //  Is typed array copy that fast compared to assignment operators?
                        for (c = 0; c < l; c++) {
                            ta_scratch[c] = this.ta[c];
                        }
                    }
                }
            });
    
    
            // ta_row_scratch
            //  a typed array sized to hold pixel data for a single row.
    
            // (this.bypr)
    
            ro(this, 'ta_row_scratch', () => {
                if (!ta_row_scratch) {
                    ta_row_scratch = new Uint8ClampedArray(this.bypr);
                } else {
                    if (ta_row_scratch.length !== this.bypr) {
                        ta_row_scratch = new Uint8ClampedArray(this.bypr);
                    }
                    return ta_row_scratch;
                }
            });
            
            ro(this, 'ta_pos_scratch', () => {
                if (!ta_pos_scratch) {
                    ta_pos_scratch = new Int16Array(2);
                }
                return ta_pos_scratch;
            });
    
            ro(this, 'ta_pos_iterator', () => {
                if (!ta_pos_iterator) {
                    ta_pos_iterator = new Int16Array(2);
                }
                return ta_pos_iterator;
            });
    
    
            // ta_source_to_self_translate_vector ???
            //  more properties could be stored and accessed in this form. tas particularly good for simple vectors.
    
            // maybe make some kind of optimized string indexed ta.
            //  look up values to consts, use them...?
            //  or have const declarations of the numbers, use them? May compile best. Macros for consts???
    
    
    
            // ta_move_vector

            // Maybe all this is advanced/enhanced rather than core.
            // Pixel_Buffer_Advanced_Typed_Array_Properties
            //  So the code does not need to be in the core.


            ro(this, 'ta_move_vector', () => {
                if (!ta_move_vector) {
                    ta_move_vector = new Int16Array(2);
                }
                return ta_move_vector;
            });
            ro(this, 'ta_bounds', () => {
                if (!ta_bounds) {
                    ta_bounds = new Int16Array(4);
                }
                return ta_bounds;
            });

            ro(this, 'ta_24bit_color', () => {
                if (!ta_24bit_color) {
                    ta_24bit_color = new Uint8ClampedArray(3);
                }
                return ta_24bit_color;
            });


            ro(this, 'ta_32bit_color', () => {
                if (!ta_32bit_color) {
                    ta_32bit_color = new Uint8ClampedArray(4);
                }
                return ta_32bit_color;
            });
    



            /*

            ro(this, 'ta_rgb', () => {
                if (!ta_rgb) {
                    ta_rgb = new Uint8ClampedArray(3);
                }
                return ta_rgb;
            });
            ro(this, 'ta_rgb2', () => {
                if (!ta_rgb2) {
                    ta_rgb2 = new Uint8ClampedArray(3);
                }
                return ta_rgb2;
            });
            */


            ro(this, 'ta_bounds_scratch', () => {
                if (!ta_bounds_scratch) {
                    ta_bounds_scratch = new Int16Array(4);
                }
                return ta_bounds_scratch;
            });
            ro(this, 'ta_bounds2_scratch', () => {
                if (!ta_bounds2_scratch) {
                    ta_bounds2_scratch = new Int16Array(4);
                }
                return ta_bounds2_scratch;
            });
            ro(this, 'ta_bounds3_scratch', () => {
                if (!ta_bounds3_scratch) {
                    ta_bounds3_scratch = new Int16Array(4);
                }
                return ta_bounds3_scratch;
            });
            ro(this, 'ta_bounds4_scratch', () => {
                if (!ta_bounds4_scratch) {
                    ta_bounds4_scratch = new Int16Array(4);
                }
                return ta_bounds4_scratch;
            });
            ro(this, 'ta_size_scratch', () => {
                if (!ta_size_scratch) {
                    ta_size_scratch = new Uint16Array(2);
                }
                return ta_size_scratch;
            });
            ro(this, 'ta_size2_scratch', () => {
                if (!ta_size2_scratch) {
                    ta_size2_scratch = new Uint16Array(2);
                }
                return ta_size2_scratch;
            });
            ro(this, 'ta_pointers_scratch', () => {
                if (!ta_pointers_scratch) {
                    // Only allow 2 pointers? by default?
                    ta_pointers_scratch = new Uint32Array(4);
                }
                return ta_pointers_scratch;
            });
            ro(this, 'ta_pointers2_scratch', () => {
                if (!ta_pointers2_scratch) {
                    // Only allow 2 pointers? by default?
                    ta_pointers2_scratch = new Uint32Array(4);
                }
                return ta_pointers2_scratch;
            });
            ro(this, 'ta_pointerpair_scratch', () => {
                if (!ta_pointerpair_scratch) {
                    // Only allow 2 pointers? by default?
                    ta_pointerpair_scratch = new Uint32Array(2);
                }
                return ta_pointerpair_scratch;
            });
            ro(this, 'ta_offsets_scratch', () => {
                if (!ta_offsets_scratch) {
                    // Only allow 2 pointers? by default?
                    ta_offsets_scratch = new Int32Array(4);
                }
                return ta_offsets_scratch;
            });
            ro(this, 'ta_offsets_info_scratch', () => {
                if (!ta_offsets_info_scratch) {
                    // Only allow 2 pointers? by default?
                    ta_offsets_info_scratch = new Int32Array(8);
                }
                return ta_offsets_info_scratch;
            });


        }
        setup_ta_ro_props();


        const ta_colorspace = new Int16Array(6);

        // Seems more like an advanced typed array property.
        

        Object.defineProperty(this, 'ta_colorspace', {
            // Using shorthand method names (ES2015 feature).
            // This is equivalent to:
            // get: function() { return bValue; },
            // set: function(newValue) { bValue = newValue; },
            get() { 

                // const [width, height, bypp, bypr, bipp, bipr] = ta_colorspace;

                ta_colorspace[0] = size[0];
                ta_colorspace[1] = size[1];


                // 
                ta_colorspace[2] = ta_bpp[0] % 8 === 0 ? ta_bpp[0] / 8 : 0;
                ta_colorspace[3] = ta_colorspace[2] * ta_colorspace[0];
                ta_colorspace[4] = ta_bpp[0];
                ta_colorspace[5] = ta_colorspace[4] * ta_colorspace[0];


                return ta_colorspace; 
            },
            enumerable: true,
            configurable: false
        });

    }

}


module.exports = Pixel_Buffer_Advanced_TypedArray_Properties;