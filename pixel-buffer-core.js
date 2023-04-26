
// Size of the task

/*
    1 Small / trivial change
       2 mins going on 10 mins
    2  Small change
       5 mins going on 30 mins
    3  Medium-Small task
       15 mins going on 1.5h
       could be an easier version of a 4 - needs an optimized algorithm to be written and tested, it doesnt require further R&D.
    4
       45 mins going on 4.5(+)h
        as in could be an underestimated 5?
        may require thinking about maths & optimization

    5 Moderate - a few hours
        2 hours if it turns out to be relatively easy
        going on a day
    6
        0.5 days to 3 days
    7   (some level of overhaul or new API design involved)
        1.5 days to 1 week
    8  
        1 week to 3 weeks
    9 Programming / API overhaul
        3 weeks to 6 weeks
    10 Huge overhaul / major rewrite / a medium-large project of its own
        1 month to 3 months

    

*/

// !!! Consider Importance Scale !!!

// progress (0 to 9), task_size on above scale

const _roadmap = {
    '0.0.22': [
        ['pb.bypp = 1 convert to greyscale', 'done', 3, 'Medium small task requiring writing of optimized algorithm']
    ],


    // Looks like level 6 or 7 for doing a lot of the convolution stuff.
    //  May require new Convolution object / class / function / combination thereof.

    '0.0.23': [

        'Convolutions', 

        `
        Task Size and Complexity Measure: 5 changed to 6.5
            Going into a larger properties overhaul - new size 6 or 7



        Rethinking and implementing pos_bounds
            pos_within_source_bounds

        Rename pos
            pos_within_source

        
        // Positions only really make sense when they are relative to something.
            In this case, can't assume all positions are relative to the self pb, so need to be extra explicit in the variable names regarding what they relate to.


        // Float cursors as well?
        //  Prob not in this release.


        // xy_cursor, xy_within_source?
        //  

        Consider other pos type variables. Explicit names for what they do.
            pos_iteration_within_self
            pos_cursor_within_self







        Better to have more API-based centering, and adjust the central position?
            Possibly not best for convolution, for perf reasons.
            Don't want more calculations done during iteration...?
            Maybe don't need to deal with centering as directly right now?
                Seems useful for convolutions, centering the window of the px is a core part of the convolution logic. Worth having the platform support it as easily as possible.

        


        new_window
            implemented
        


        new_centered_window() ???
            NOT doing this for the moment. done new_window

            centered on 0,0.
            center of that window corresponds to a pixel in this window.
            bounds determined...
                does make sense for the moment.
                implement this fn, makes sense for convs right now.

            get_conv_window?
        new_convolved(convolution) - using this.
        `
        // Needing to reconsider / rethink a few things.
        //  Size 4 or 5 task. Thinking about bounds, and different types of them.
        //   Movement bounds - allowed positions of the window.
        //    Think about not being able to move any part of the window outside of those set bounds.
        //     Will be a lower level value set by some other things in some cases.

        // Operation bounds?
        //  px iteration bounds?

        // Will think in terms of operating over ranges, doing iterations.
        //  Some inner functions or simple loops using the values will handle the necessary iterations.

        // Will have window_to_bounds?
        //  window_to_pos_bounds?

        // or it would be its own pos_bounds?
        //  or just .bounds?
        //   .bounds is based on the size.

        // .pos_bounds makes sense.
        // .pos.bounds?

        // Write down important functions to implement
        //  Can update progress here.


        

        ['window view into specific channel?'],
        ['run convolution on 8bipp image?', 'maybe', 'not yet'],
        ['Convolution Class', ],
        ['Bug fix move_next_px, need to use boundary ranges for proper movement of the window within a source', 4, [

            // Proposed solutions / features required to get this working:

            // 

            // seems like it should be a new Int16Array.
            ['cancelled - doing pb.pos_bounds', 'pb.window_movement_bounds', `

                Need to make / finish function
                Considering different types of bounds
            
            
            
            `],


            ['pos_bounds', `
                consider iterate_pos_within_bounds
                just each_pos_px?

                As well as positions, need to properly calculate iteration values and indexes.
                Put these into a typed array, access them through use of a function
            `]

            // pb.window_connection object?
            //  .pb, .movement_bounds
        ]]


        //  Allowing for some out-of bounds movement, useful for convolution.
        //  Movement boundary being difficulty 3 or 4.
        //   Need to consider the overall API.
        //   Movement boundary range likely to be useful for iterations generally.
        //    Seems like a useful feature to have and optimize.

        // movement_bounds

        // .ta_movement_bounds

        // Setting movement bounds (or removing it / setting it to 0) would help to define iteration movement.
        ///  Of a / the pos value while iterating either within self or within source.

        // movement self offset bounds - ie [-1, -1, 1, 1] where it adds the self size to values 2 and 3.

        // movement offset bounds does seem like a fairly useful low level property
        //  more work on movement and iteration.

        // iteration through self space, source space or target space.
        //  not really used target space. may me useful for writing to...?

        // self_movement_bounds
        //  may be useful for some restricted pixel iterations
        //   could calculate the byte jump values from this as well...?


        // window_movement_bounds seems most appropriate for convolution iteration.
        // Task breakdown...
        //  Convolution class
        // 8bipp window to other 8bipp
        // 8bipp window to single channel of 24bipp
        // Same convolution applying to multiple channels?
        //  so have it work on a multi-channel window.
        // Float16Convolution would hold the convolution.
        //  could specify convo by size and formula?

        // A convolution Class / function system does seem like the best way.



    ],
    '0.0.24': [
        'Moving of mathematical code to ta_math where possible and suitable.',
        'Current size: >6000 lines. Can it be brought down to 1000? Still kept v performant?',
        ['new_resized', 'clearly creates a new pb']
    ],

    '0.0.25': [
        'Improvements / optimization to resize',
        'Facilitate usage of C++ acceleration.'
    ]
}

// Operating convolutions as / on windows to other pixel buffers makes the most sense to me.




// Having a window as a view into a specific channel would make a lot of sense.
//  Would need to work on the copying algorithm.
//   Could be a simple offset-read-advance system.

// Applying convolutions to images would make a lot of sense.


// Float16Convolution
//  Would make sense, with various needed properties for compatibility with Pixel_Buffer

// Have it so that the convolution can be automatically applied for one pb's window into another.
//  Meaning the full image convolution could use the moving convolution window.
//   Hopefully things will be optimized very well.


// not sure about having this hold indexed color.
//  by its name it seems as though it should be able to.
//  using indexed color mode.
//   rgba, rgb, indexed rgb, indexed rgba
//              irgb, irgba
//  and then there is bit_depth.
//              bits_per_pixel may make sense.

// Will just have this as a pixel value buffer.
//  Can have an image-buffer if its more advanced.
// Will be used to hold, and as the basis for basic processing on PNG images.
//  Also want to make some pixel buffer manipulation modules.
// jsgui-node-pixel-buffer-manipulate (maybe not manipulate - could imply it changes data when it does not always?)
//  filters
//  masks? feature detection?
// jsgui-node-pixel-buffer-filter
// jsgui-node-pixel-buffer-processing
// want to do convolutions on the pixel buffer

// Also want to use Vulkan before all that long.
//  But in the gfx-server version.



// Now work on the conversion to greyscale.






const lang = require('lang-mini');

const {
    each,
    fp,
    tof,
    get_a_sig,
    are_equal,
    tf
} = lang;

const Pixel_Pos_List = require('./pixel-pos-list');

const oext = require('obext');

const {ro, prop} = oext;



// Need to be able to replace ta_math and use upgraded functions.


// PBC.override('ta_math', new_ta_math)


// Be able to upgrade the reference to ta_math/





const Pixel_Buffer_Painter = require('./pixel-buffer-painter');


// All operations will be in place.
//  If it's at all possible.
//  Can do .clone and then do the operation on that if we want another object.


//const inspect = Symbol.for('nodejs.util.inspect.custom');

// Core
// Mixins
//  Could make them for functions of some categories, and larger functions.
//   Would help to make it replacable with more optimized functions.
// Advanced / Enh

// A color data type could be useful.
//  Contains a typed array of a particular length

// A few fast OO structures / classes?
// Will make use of some functions, but not that many.
// ta(1, 2, 3);
// ta function
//  returns a typed array that fits the numbers
//  will check to see if they are integers
// load it from a pixel-pos-list too.
// More clarity / specifying whether to do it in place, not producing a res option?
//  and use clone where appropriate.
//const oext = require('obext')();

//console.log('oext', oext);
//throw 'stop';
//console.log('ro', ro);
// Make this extend evented class?

// Convolution kernel reading?
//  Maintain the small pixel buffer or convolution buffer for enough time to do the convolution.

// Looks like the scratch typed array would be very useful for the convolution.
//  May be worth trying the more optimized convolution that only needs to store data in its buffer (or somewhere else???)

// Should try a few different convolution window functions...
//  With copy, without.
// Using a temporary convolution typed array or two would help.
// Also, a way to set the pixel color value outside of the bounds, as input to the convolution (window).
// Would be nice to see how quickly a convolution could run in js using different types of memory access / efficiency techniques.





let ta_math = require('./ta-math')

// ta_math has become more of a low level implementation, which then is to be integrated into the JS OOP.



// And convolution functions in ta_math.

// 

let {resize_ta_colorspace, copy_rect_to_same_size_8bipp, copy_rect_to_same_size_24bipp, dest_aligned_copy_rect_1to4bypp} = ta_math;

class Pixel_Buffer_Core {
    // Setting bits per pixel to 8
    //  greyscale 256

    // Bits per pixel and bytes per pixel.
    //  May be worth having the normal change events in operation.
    //   But a single defined change function would make sense.
    //    Raising change events may be unnecessary.
    //     Or some of them?
    //    Could be useful in some ways.

    // ta_scratch would make a lot of sense for some operations.
    //  possibly loading / copying too?
    // A way to avoid unnecessary memory allocation and deallocation.

    // Get the ta_scratch as a copy.
    //  It would be useful for viewing the convolution window while applying the convolution internally.

    // Convolutions need both an input and output typed array.
    //  (or some optimization could use a smaller temporary buffer)

    constructor(spec) {

        if (spec instanceof Pixel_Buffer_Core) {
            //spec.bits_per_pixel = 
            //console.log('from exisiting pb.')
            spec = {
                bits_per_pixel: spec.bits_per_pixel,
                size: spec.size,
                ta: spec.ta
            }
            //console.log('spec', spec);
        }


        let silent_update_bits_per_pixel;
        let silent_update_bytes_per_pixel;

        if (spec.window_to) {
            spec.bits_per_pixel = spec.window_to.bits_per_pixel;
        }

        const pos = new Int16Array(2);
        const size = new Int16Array(2);
        let ta; // flexible, can be redefined? Can still make read-only in userland.


        // Will be able to reassign the ta....



        //  will have a ta prop.
        //   alias to buffer as well...

        // read-only for the moment?
        //  worth not allowing overwriting it I suppose?
        //   but then shared typed arrays could be used?
        //    would need to be careful about that as well.

        ro(this, 'ta', () => {
            return ta;
        });
        ro(this, 'buffer', () => {
            return ta;
        });

        // or bytes per pixel cant always be ui8.

        const ta_bpp = new Uint8ClampedArray(2);
        ta_bpp[1] = 8; // byte to bit multiplier. will stay as 8.
        

        const _24bipp_to_8bipp = () => {

            //console.log('_24bipp_to_8bipp');

            const old_ta = ta;
            //console.log('old_ta', old_ta);
            //console.log('old_ta.length', old_ta.length);



            //console.log('this.num_px', this.num_px);

            //const new_bypp = 1;

            const new_ta = ta = new Uint8ClampedArray(this.num_px);

            // read byte idx
            // write byte idx

            // read byte color (3 components)
            // write byte color ui8

            const l_read = old_ta.length;

            // could be in a ta scratch of some sort.
            //  Consider benchmarking for this in the near future.

            // Could make a whole version number exploring that difference.




            let iby_read = 0, iby_write = 0;

            //const inc_qty_read = 3, inc_qty_write = 1;

            //let ui8_write;

            // not so sure we need these inc qtys.

            // Maybe this will be very fast, faster than row copy.
            //  Could investigate direct copy as alternative to row copy.
            //   May be faster in many cases...?


            while (iby_read < l_read) {

                //ui8_write = Math.round((old_ta[iby_read++] + old_ta[iby_read++] + old_ta[iby_read++]) / 3);
                //new_ta[iby_write++] = ui8_write;

                new_ta[iby_write++] = Math.round((old_ta[iby_read++] + old_ta[iby_read++] + old_ta[iby_read++]) / 3);
                // Consider other formula with different weightings.

            }







            // num_pixels property...
            //  bring into constructor?


            //const new_ta = ta = new Uint8ClampedArray()



            // Clone / copy the old ta?
            //  Use the scratch ta.
            //   And update the scratch from the ta?


        }

        const _change_bipp_inner_update = (old_bipp, new_bipp) => {

            //console.log('_change_bipp_inner_update [old_bipp, new_bipp]', [old_bipp, new_bipp]);


            if (old_bipp === 24) {


                if (new_bipp === 8) {

                    _24bipp_to_8bipp();


                    // specific fn call...?
                    //  probably most optimized to do a specific fn call....



                } else {

                    console.trace();
                    throw 'NYI';
                }


            } else {

                console.trace();
                throw 'NYI';

            }

            // will do some low level stuff here.





        }





        // the get / set bytes per pixel and bits per pixel will both use this.

        // move away from prop for the moment...




        // default...?
        //  bits per pixel, bytes per pixel...?

        // only hold the number of bits per pixel internally.
        //  

        // shorthand method names???? interesting.

        const def_bipp = {
            // Using shorthand method names (ES2015 feature).
            // This is equivalent to:
            // get: function() { return bValue; },
            // set: function(newValue) { bValue = newValue; },
            get() { return ta_bpp[0]; },
            set(value) { 
                console.log('value', value);

                const old_bipp = ta_bpp[0];

                ta_bpp[0] = value;

                // And then need to run the change_bipp function.
                //  give it the old value too?

                // It would recreate the typed array.
                //  Maybe a different size.

                _change_bipp_inner_update(old_bipp, ta_bpp[0]);






            },
            enumerable: true,
            configurable: false
        }

        Object.defineProperty(this, 'bits_per_pixel', def_bipp);
        Object.defineProperty(this, 'bipp', def_bipp);

        const def_bypp = {
            // Using shorthand method names (ES2015 feature).
            // This is equivalent to:
            // get: function() { return bValue; },
            // set: function(newValue) { bValue = newValue; },
            get() { return ta_bpp[0] / 8; },
            set(value) { 

                const old_bipp = ta_bpp[0];

                ta_bpp[0] = value * 8;

                _change_bipp_inner_update(old_bipp, ta_bpp[0]);


                // changing from 24 bipp to 8 bipp...




            },
            enumerable: true,
            configurable: false
        }

        Object.defineProperty(this, 'bytes_per_pixel', def_bypp);
        Object.defineProperty(this, 'bypp', def_bypp);

        // bytes_per_row

        // bits_per_row could be useful as well.
        //  maybe the rows don't need to subdivide into bytes.
        //   that would be most efficient for 1 bipp images of course, eg sized 3x300.
        //    dont want to limit it to integer number of bytes per row in this case. that's a case for only using bits_per_row.

        const def_bypr = {
            get() {
                //console.log('size[0]', size[0]);
                //console.log('ta_bpp[0]', ta_bpp[0]);
                return size[0] * ta_bpp[0] / 8;
            }
        }
        Object.defineProperty(this, 'bytes_per_row', def_bypr);
        Object.defineProperty(this, 'bypr', def_bypr);
        Object.defineProperty(this, 'pos', {
            // Using shorthand method names (ES2015 feature).
            // This is equivalent to:
            // get: function() { return bValue; },
            // set: function(newValue) { bValue = newValue; },
            get() { return pos; },
            set(value) {
                // Were we given a Int16Array? Similar?
                //  set own pos ta values from the value.

                if (value instanceof Int16Array) {
                    if (value.length === 2) {
                        pos[0] = value[0];
                        pos[1] = value[1];
                    }
                }


                //pos = value; 
            },
            enumerable: true,
            configurable: false
        });
        const pos_bounds = new Int16Array(4);
        //  pos_within_source / pos_within_container / pos_within_parent / pos_within


        const pos_center = new Int16Array(2);
        const edge_offsets_from_center = new Int16Array(4);


        ro(this, 'pos_center', () => pos_center);
        ro(this, 'edge_offsets_from_center', () => edge_offsets_from_center);



        // have edge offsets from center in terms of bytes too?


        // Differentiate between pos_within_source and an internal pos_iterator or pos of operations to be done.
        // new_centered_window will make use of this.

        // Better to have it existing already.

        // pos_within_parent_bounds

        // or more full positioning property and system?


        Object.defineProperty(this, 'pos_bounds', {
            // Using shorthand method names (ES2015 feature).
            // This is equivalent to:
            // get: function() { return bValue; },
            // set: function(newValue) { bValue = newValue; },
            get() {
                //if (!pos_bounds) {
                //    pos_bounds = new Int16Array(4);
                //}
                return pos_bounds; 
            },
            set(value) {

                // look at type of value... maybe its an array.
                const tv = tf(value);
                //console.log('pos_bounds set tv', tv);

                // if tv is an array...

                if (tv === 'a') {

                    if (value.length === 4) {
                        pos_bounds.set(value);
                    } else {
                        throw 'Expected Array with .length 4, value.length: ' + value.length;
                    }
                    
                } else {
                    console.trace();
                    console.log('pos_bounds set tv', tv);
                    throw 'Expected Array';
                }
            },
            enumerable: true,
            configurable: false
        });


        const minus_pos = new Int16Array(2);

        Object.defineProperty(this, 'minus_pos', {
            // Using shorthand method names (ES2015 feature).
            // This is equivalent to:
            // get: function() { return bValue; },
            // set: function(newValue) { bValue = newValue; },
            get() {
                if (pos) {
                    minus_pos[0] = pos[0] * -1;
                    minus_pos[1] = pos[1] * -1;
                    return minus_pos;
                }
            },
            enumerable: true,
            configurable: false
        });


        Object.defineProperty(this, 'size', {
            // Using shorthand method names (ES2015 feature).
            // This is equivalent to:
            // get: function() { return bValue; },
            // set: function(newValue) { bValue = newValue; },
            get() { return size; },
            set(value) {
                // Were we given a Int16Array? Similar?
                //  set own pos ta values from the value.

                if (value instanceof Int16Array) {
                    if (value.length === 2) {
                        size[0] = value[0];
                        size[1] = value[1];
                    }
                } else {
                    console.trace();
                    throw 'NYI';
                }
                //pos = value; 
            },
            enumerable: true,
            configurable: false
        });


        // ta_colorspace

        const ta_colorspace = new Int16Array(6);

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

        const bounds_within_source = new Int16Array(4);
        // Using shorthand method names (ES2015 feature).
        Object.defineProperty(this, 'bounds_within_source', {
            // This is equivalent to:
            // get: function() { return bValue; },
            // set: function(newValue) { bValue = newValue; },

            // Refer to pos_center_within_this...
            //  

            get() {

                //console.trace();
                //throw 'rename this function to something more specific.'

                const size = this.size;
                const pos = this.pos;
                bounds_within_source[0] = pos[0];
                bounds_within_source[1] = pos[1];
                bounds_within_source[2] = pos[0] + size[0];
                bounds_within_source[3] = pos[1] + size[1];
                return bounds_within_source;
            },
            /*
            set(value) {

                
            },*/
            enumerable: true,
            configurable: false
        });

        //  Use the size and pos to calculate this.

        const size_bounds = new Int16Array(4);
        Object.defineProperty(this, 'size_bounds', {
            get() {
                const size = this.size;
                //console.log('size', size);
                size_bounds[0] = 0;
                size_bounds[1] = 0;
                size_bounds[2] = size[0];
                size_bounds[3] = size[1];
                return size_bounds;
            },
            enumerable: true,
            configurable: false
        });

        let pb_source;
        // use window_movement_bounds
        //  understand the positioning (restrictions?) of the movement of the window within the source.

        Object.defineProperty(this, 'source', {
            get() { return pb_source; },
            set(value) {
                // Were we given a Int16Array? Similar?
                //  set own pos ta values from the value.

                pb_source = value;
            },
            enumerable: true,
            configurable: false
        });

        
        if (spec instanceof Pixel_Pos_List) {
            // load it as a buffer.

            throw 'NYI - change to 1bipp';

            const ppl = spec;
            //console.log('ppl.length', ppl.length);
            // find out its bounds.

            // probably best loading this as a smaller pixel buffer with just the part of the image.
            //  will set a .pos attribute
            const bounds = ppl.bounds;
            //const [l, t, r, b] = bounds;
            //console.log('Pixel_Buffer_Core bounds', bounds);

            const ppl_size = new Uint16Array(2);
            ppl_size[0] = bounds[2] - bounds[0];
            ppl_size[1] = bounds[3] - bounds[1];

            //console.log('Pixel_Buffer_Core ppl_size', ppl_size);
            //  Can have bits or bytes per pixel set in spec, otherwise.
            //   Pixel pos list to produce 1 bit per pixel in the near future anyway.

            this.bits_per_pixel = 8;

            const bpp = this.bytes_per_pixel = 1;

            // Not clear why the extra space is needed, but it solves a subtle sizing error.
            //  Maybe the ppl size registers wrong.
            // not sure why the +1 size is needed - it prevents an overflow???
            this.size = new Uint16Array([ppl_size[0] + 4, ppl_size[1] + 4]);
            this.pos = new Int16Array([bounds[0], bounds[1]]);


            // .bypr and .bytes_per row as read-only facade properties.



            // property .length as the ta length?


            const bpr = this.bytes_per_row = bpp * this.size[0];
            //console.log('Pixel_Buffer_Core this.pos', this.pos);

            const buf = this.ta = this.buffer = new Uint8ClampedArray(this.size[0] * this.size[1]);
            const l = buf.length;
            for (var c = 0; c < l; c++) buf[c] = 255;

            ppl.each_pixel(pixel_pos => {
                // seems like some errant pixels got set - maybe in the flood fill.
                // not sure why we need -1 for some things...
                //buf[(bpr * (pixel_pos[1] - bounds[1]) - bpp) + (pixel_pos[0] - bounds[0] - bpp)] = 0;
                buf[(bpr * (pixel_pos[1] - bounds[1])) + (pixel_pos[0] - bounds[0])] = 0;
                //this.
            });
            //console.log(JSON.stringify(buf));
            //each(buf, console.log);
        } else {
            //spec.__type_name = spec.__type_name || 'pixel_buffer';
            //super(spec);
            if (spec.buffer) {
                if (spec.buffer instanceof Buffer) {
                    //this.ta = this.buffer = new Uint8ClampedArray(spec.buffer.buffer);
                    ta = new Uint8ClampedArray(spec.buffer.buffer);
                } else {
                    // check its uint8array either clamped or not.??
                    //this.ta = this.buffer = spec.buffer;
                    ta = spec.buffer;

                }
            }
            if (spec.ta) {
                ta = new Uint8ClampedArray(spec.ta);
            }
            // Size could more logically be its dimensions.

            if (spec.size) {
                //this.size = spec.size;
                //this.size = new Uint16Array(spec.size); // using the size it was given, which was given as an array.

                size[0] = spec.size[0];
                size[1] = spec.size[1];

            } else {
                throw 'Expected: size [x, y] property in the Pixel_Buffer_Core specification';
            }

            // bit-depth - could follow PNG.
            //  rgba color mode.

            if (spec.bytes_per_pixel && !spec.bits_per_pixel) spec.bits_per_pixel = spec.bytes_per_pixel * 8;
            spec.bits_per_pixel = spec.bits_per_pixel || 32;

            if (spec.bits_per_pixel) {
                if (spec.bits_per_pixel != 1 && spec.bits_per_pixel != 8 && spec.bits_per_pixel != 24 && spec.bits_per_pixel != 32) {
                    console.log('spec.bits_per_pixel', spec.bits_per_pixel);
                    console.trace();
                    throw 'Invalid bits_per_pixel value of ' + spec.bits_per_pixel + ', must be 8, 24 or 32, default is 32.';
                } else {
                    //this.bits_per_pixel = spec.bits_per_pixel;
                    ta_bpp[0] = spec.bits_per_pixel;
                }
            }
            // then initialize the buffer itself.

            /*
            const bytes_per_pixel = this.bytes_per_pixel = this.bits_per_pixel / 8;


            this.bytes_per_row = bytes_per_pixel * this.size[0];
            */

            // should have size property already?


            if (this.size && !this.buffer) {
                //console.log('this.size', this.size);
                //this.ta = this.buffer = new Uint8ClampedArray(bytes_per_pixel * this.size[0] * this.size[1]);
                //console.log('ta_bpp[0]', ta_bpp[0]);

                ta = new Uint8ClampedArray((ta_bpp[0] / 8) * this.size[0] * this.size[1]);



                //this.buffer = Buffer.alloc(bytes_per_pixel * this.size[0] * this.size[1]);
            }
            if (spec.color) {
                this.color_whole(spec.color);
            }
            //console.log('this.ta', this.ta);
        }

        ro(this, 'meta', () => {
            return {
                size: this.size,
                bits_per_pixel: this.bits_per_pixel,
                bytes_per_pixel: this.bytes_per_pixel,
                bytes_per_row: this.bytes_per_row
            }
        });

        //if ()

        if (spec.window_to || spec.source || spec.window_to_source) {

            // Need to understand the pos boundaries within the source.
            

            // set the .source property.

            pb_source = spec.window_to || spec.source || spec.window_to_source;


            

            // 

            // pos centre of this image within the source image.
            //  

            //if (spec.pos_center || spec.pos_my_center_within_source) {
            //    this.pos_my_center_within_source = spec.pos_center || spec.pos_my_center_within_source;
        // }

            const log_info = () => {
                console.log('Pixel_Buffer_Core (or subclass) needs to act as a window to another Pixel Buffer.')
                console.log('pb_source', pb_source);
                console.log('pb_source.size', pb_source.size);

                // Should be able to get various useful pieces of info on a pb quickly in ta format.
                // The pos should have been set when given the pos_center.

                console.log('spec.pos', spec.pos);
                console.log('spec.pos_center', spec.pos_center);
                // pos could have extra centering value / flag???



                console.log('this.pos', this.pos);
                console.log('this.pos_my_center_within_source', this.pos_my_center_within_source);

                console.log('spec', spec);
            }
            //log_info();

        

        }

        if (spec.pos_bounds) {
            this.pos_bounds = spec.pos_bounds;
        }
        let ta_scratch;
        let ta_pos_scratch;        // Int16Array(2)
        let ta_pos_iterator;        // Int16Array(2)
        let ta_move_vector;
        let ta_bounds;
        let ta_rgb;
        let ta_rgb2;
        let ta_rgba;
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
        this.move = ta_2d_vector => {
            pos[0] += ta_2d_vector[0];
            pos[1] += ta_2d_vector[1];
            if (this.source) {
                this.copy_from_source();
            }
        }

        this.each_pos_within_bounds = (callback) => {
            const has_source = !!this.source;

            //console.log('pos_bounds', pos_bounds);
            //console.log('this.pos_bounds', this.pos_bounds);
            //console.log('pos_bounds', pos_bounds);




            for (pos[1] = pos_bounds[1]; pos[1] < pos_bounds[3]; pos[1] ++) {
                for (pos[0] = pos_bounds[0]; pos[0] < pos_bounds[2]; pos[0] ++) {

                    if (has_source) this.copy_from_source();
                    callback();

                }
            }


        }
        this.move_next_px = () => {
            // only adjust the pos if the next pixel is within range.
            //  within the source size.

            const source_size = this.source.size;

            if (pos[0] + size[0] < source_size[0]) {
                pos[0]++;
            } else {
                // Going to the next row seems like a big problem.
                //  Needs to go back to x pos 0 - the pos in the window.???
                //   Or some kind of offset center pos???




                if (pos[1] + size[1] < source_size[1]) {
                    pos[0] = 0;
                    pos[1]++;
                } else {
                    return false;

                }
            }

            if (this.source) {
                this.copy_from_source();
            }

            return pos;
        }



        this.paint = new Pixel_Buffer_Painter({
            pb: this
        })


        // move_next_pixel

        /*
        // bytes_per_row
        ro(this, 'bytes_per_row', () => {
            
            return this.size[0] * this.bytes_per_pixel;
        });
        */
    }

    // xy_center_px property? read only. different to .pos which is for pos within other space / object.
    //  may be worth making pb.xy_center_px
    //   xy being a better abbreviation for the data structure and what it is. 2 characters long as well.

    // Will do this in a more purely mathematical way.
    //  The conv and byte index references can be calculated and stored outside of the image itself.
    //   Then getting the pixels can be done in a nicely optimized way.

    // Iteration within the fully in bounds region would be useful.
    //  Then a more complex algo for the bounds areas, but will not be called as frequently.
    //   Could calc the bounds values pre iteration.


    // The math part needs to handle the details.

    // See if the conv math can be expressed simply, using functions...
    // 
    // Also worth trying a high-memory version that precalculates all referenced byte indexes in a large array.
    //  Maybe arrange them next to their weights.
    // Definitely looking into memory-expansive optimizations.
    //  Usefulness may depend on the architecture.














    new_convolved(convolution) {

        console.log('convolution', convolution);
        console.log('convolution.size', convolution.size);
        console.log('convolution.num_px', convolution.num_px);

        // Will use special case algos for 3x3 (and 5x5)
        //  Would be a good way to start boundary handling.







        
        // same size, same bpp.
        //  blank copy.

        const res = this.blank_copy();

        // find the center_pos within the convolution.
        //  pos_center? coords_center? xy_center?

        // pos_of_the_center vs pos_of_the_center_of_this_within_source

        const xy_conv_center = convolution.xy_center;

        //console.log('xy_conv_center', xy_conv_center);

        // conve odge offsets from center...

        // edge_distances_from_center_px_edge
        //  


        const edge_distances_from_center_px_edge = new Int16Array(4);
        edge_distances_from_center_px_edge[0] = xy_conv_center[0] * -1;
        edge_distances_from_center_px_edge[1] = xy_conv_center[1] * -1;
        edge_distances_from_center_px_edge[2] = edge_distances_from_center_px_edge[0] + convolution.size[0] - 1;
        edge_distances_from_center_px_edge[3] = edge_distances_from_center_px_edge[1] + convolution.size[1] - 1;

        //console.log('edge_distances_from_center_px_edge', edge_distances_from_center_px_edge);



        // work out the initial pos?

        // bounds offsets of various sorts?
        //  seems important with different convolution sizes.

        //console.log('convolution.size', convolution.size);

        //console.trace();
        //throw 'stop';

        // Make an optimized convolution function.
        //  Will also have multi-layer convolution system.

        // ta_math convolution. Not using another pb as the window. Doing it directly using optimized and inline algorithm.
        //  likely to use a conceptual window but moved around with maths / algebra.





            
        const pb_window = this.new_window({
            size: convolution.size,
            pos_bounds: [edge_distances_from_center_px_edge[0], edge_distances_from_center_px_edge[1], this.size[0] - edge_distances_from_center_px_edge[2], this.size[1] - edge_distances_from_center_px_edge[3]],
            pos: [edge_distances_from_center_px_edge[0], edge_distances_from_center_px_edge[1]]
        });

        // Write the iteration code here?
        //  already have copy_from_source
        //  will have copy made when the window is created.

        const pos_window = pb_window.pos;
        const ta_window = pb_window.ta;

        /*

        const pb_conv_res = new Pixel_Buffer({
            size: pb_8bipp_patch.size,
            bits_per_pixel: 24
        });
        */

        let i_write = 0;
        const ta_conv_res = res.ta;
        //performance.mark('I');

        // and a temp color? a const color we get within that function?

        //  could do ta_conv_res.set with the px value.
        //   may be faster than the assignment statements?

        // Maybe it doesnt work on already very bold images.
        //  Seems no different from the source.
        //   Unlike the greyscale, there is no further margin for color intensity.
        //    (image is at full sharpness, all differences are of 255!!!)
        //     could be a 3 bit image :)

        // May be better to blur this color example patch. It works :).


        // Could possibly speed up the pb copy.
        //  See about doing that in C++. It's low level and could be used in many places. Gets used very often by convolutions.

        pb_window.each_pos_within_bounds(() => {
            //ta_conv_res[i_write++] = conv_s3_sharpen.calc_from_24bipp_ta(ta_window);
            const rgb = convolution.calc_from_24bipp_ta(ta_window);
            ta_conv_res[i_write++] = rgb[0];
            ta_conv_res[i_write++] = rgb[1];
            ta_conv_res[i_write++] = rgb[2];
        });
        return res;
    }

    new_resized(size) {
        //const source_ta = this.ta;
        //const dest_size = new Int16Array(size);
        const dest = new this.constructor({
            size: size,
            bits_per_pixel: this.bipp
        });
        resize_ta_colorspace(this.ta, this.ta_colorspace, dest.size, dest.ta);
        return dest;
    }

    new_window(options) {
        //const {size} = options;
        //console.log('pb .new_window options', options);
        options.window_to = this;
        const res = new this.constructor(options);
        // automatic copy_from when it's constructed?
        res.copy_from_source();
        return res;
    }

    new_centered_window(size_or_options) {

        console.trace();
        throw 'NYI';

        // size given as number...
        //  worth looking at args sig???

        const t1 = tf(size_or_options);
        console.log('t1', t1);
        let size;

        if (t1 === 'a') {

            if (size_or_options.length === 2) {
                size = new Int16Array([size_or_options, size_or_options]);
            } else {
                console.log('size_or_options', size_or_options);
                console.trace();
                throw 'Size array expected length: 2';
            }

        } else if (t1 === 'n') {
            size = new Int16Array([size_or_options, size_or_options]);
        } else {
            console.trace();
            throw 'NYI';
        }

        const res_pb = new this.constructor({
            size: size,
            bits_per_pixel: this.bits_per_pixel,
            window_to: this
        });

    }



    // Could use internally set iteration / movement bounds.

    // Consider internal bounds and external bounds.
    //  Possible 2 or 3 properties of each.



    // May be better with parameters?
    //  also, this would be useful within ta-math.
    //   Operations would be fastest with direct ta access.


    // Likely to be brought to ta paint?
    //  However, may want this one v optimized at low level here?


    // Likely to change to ta math function. Maybe within the painter object.
    fill_solid_rect_by_bounds() {
        const bounds = this.ta_bounds;
        const bipp = this.bipp;
        if (bipp === 24) {

            const rgb = this.ta_rgb;

            //console.log('bounds', bounds);
            //console.log('rgb', rgb);


            // However, don't want the full row as scratch.
            //  Maybe better to create a new ta const here of the right size of the row of the data we are writing.

            // Could compare direct byte writing through iteration with row write iteration.
            //  Writing whole rows where possible definitely seems fastest in overview. In practise some less used functions in JS would be less optimized when compiled (JIT).

            // Does look like getting and using a bounds / byte iterator looks best here.
            //  byte index of the first pixel in the bounds
            //   byte width of the bounds

            const bytes_per_bounds_row = (bounds[2] - bounds[0]) * this.bypp;
            // bypbr - bytes per bounds row
            //console.log('bytes_per_bounds_row', bytes_per_bounds_row);

            // then can create a new temporary solid_row ta
            const solid_row = new Uint8ClampedArray(bytes_per_bounds_row);
            // fill it withthe pixels...
            // alternate rgb

            let cc = 0;

            for (let c = 0; c < bytes_per_bounds_row; c++) {
                solid_row[c] = rgb[cc];

                cc++;
                if (cc === 3) cc = 0;
            }
            //console.log('solid_row', solid_row);
            // then do the row-based iteration.
            //  will be simple usage of ta set(other_ta, offset)

            let write_byte_idx = bounds[0] * this.bypp + bounds[1] * this.bypr;
            //console.log('write_byte_idx', write_byte_idx);

            // then repeat through the rows in the bounds....
            //  advance the write_byte_idx by a row (this.bypr) each time.

            for (let i_row = bounds[1]; i_row < bounds[3]; i_row++) {
                this.ta.set(solid_row, write_byte_idx);

                write_byte_idx += this.bypr;
            }

        } else {
            console.trace();
            throw 'NYI';
        }

    }

    calc_source_target_valid_bounds_overlap() {

        const source = this.source;
        const my_bounds = this.bounds_within_source;


        const source_size_bounds = source.size_bounds;

        // first bounds scratch?
        //  valid_corresponding_bounds scratch?

        const res = this.ta_bounds_scratch;
        if (my_bounds[0] < source_size_bounds[0]) {
            res[0] = source_size_bounds[0];
        } else {
            res[0] = my_bounds[0];
        }
        if (my_bounds[1] < source_size_bounds[1]) {
            res[1] = source_size_bounds[1];
        } else {
            res[1] = my_bounds[1];
        }
        if (my_bounds[2] > source_size_bounds[2]) {
            res[2] = source_size_bounds[2];
        } else {
            res[2] = my_bounds[2];
        }
        if (my_bounds[3] > source_size_bounds[3]) {
            res[3] = source_size_bounds[3];
        } else {
            res[3] = my_bounds[3];
        }

        return res;

    }


    // More standardised / understandable / understood iteration and bounds data in local tas.



    // ** reconsider function / rethink api.
    //  won't need such complexity...
    //   will use simpler (and more performant?) function in ta_math.
    //    will be C++ accelerated before very long too.


    // Works quite quick... investigate optimizations further.
    copy_from_source() {

        // It's faster now that it uses the dest aligned copy from ta_math.

        const bipp = this.bipp;
        // Having this inline may well be best.
        //  This does a row_copy algorithm.

        // Worth trying and benchmarking a version that operates differently, using an external function that's based around the maths, takes tas as params.
        const pb_source = this.source;
        const ta_source = pb_source.ta;
        const ta = this.ta;

        // use a scratch ta for the bounds of the copy within the source.
        //  attempted source bounds!
        //const ta_source_bounds = this.ta_bounds_scratch;

        //console.log('ta_source_bounds', ta_source_bounds);

        //console.log('this.bounds_within_source', this.bounds_within_source);


        const my_bounds = this.bounds_within_source;
        const source_size_bounds = pb_source.size_bounds;
        if (bipp === 1) {
            console.trace();
            throw 'NYI';
        } else if (bipp === 8 || bipp === 24 || bipp === 32) {
            dest_aligned_copy_rect_1to4bypp(ta_source, ta, pb_source.bytes_per_row, this.bytes_per_pixel, ta_math.overlapping_bounds(my_bounds, source_size_bounds));
        } else {
            console.trace();
            throw 'stop';
        }
    }

    copy_rect_by_bounds_to_24bipp(ta_bounds, pb_target) {

        console.trace();
        throw 'NYI';

        const pos = this.ta_pos_scratch;
        // ta_size_scratch?
        //  could also be efficient and clear for storage of data during the running of an algorithm.

        // and a bounds scratch too?

        // various scratch tas could be effective for quickly running various algorithms.
        //  want the fastest JS perf, then port to C++ for faster perf still.

        // loop within the bounds...

        // worth calculating the size from the bounds as well.

        const rect_size = this.ta_size_scratch;


        rect_size[0] = ta_bounds[2] - ta_bounds[0];
        rect_size[1] = ta_bounds[3] - ta_bounds[1];
        //rect_size[0] = 1 + ta_bounds[2] - ta_bounds[0];
        //rect_size[1] = 1 + ta_bounds[3] - ta_bounds[1];


        console.log('rect_size', rect_size);

        // check that the rect size matches the target size.
        //  if so, got an optimized algorithm for it.

        // for loop of pos within the ta_bounds
        //  easy enough to loop between both of them

        // Maybe have a read byte pointer on the target?
        //  target.ta_pointers_scratch
        //   get 4? sized Uint32 array? Use that for a variety of numbers / variables / pointers in the inner working of a function?

        // these scratch objects will enable very fast operations by avoiding having to allocate more memory at many points in time.

        // .ta_further?

        // a pointers scratch would be useful?
        //  allowing up to 4 Uint32s to be stored...  8 bytes of memory isnt so bad.

        // pointers scratch?
        //  the pixel read position...?
        //   could do some clever incrementing of this value as well, when chaning row.

        // maybe a local variable is just fine / more efficient anyway?

        const ta_pointers = this.ta_pointers_scratch;

        // 0: byte index of pixel within source

        // and use a scratch from the target as well...
        // write position target pointer

        // got to make this very fast indeed in JS.

        const ta_target_pointers = pb_target.ta_pointers_scratch;

        console.log('ta_pointers', ta_pointers);
        console.log('ta_target_pointers', ta_target_pointers);

        // then can easily use the pointers for the byte positions.
        //  set the byte position of both of them according to the top left position as given by the bounds.
        //   maybe pointers are more important than calculating x, y positions?
        //    if we can bypass x and y (storage / calc?) and use the pointer positions we may be at an advantage?

        console.log('pos', pos);

        console.log('ta_bounds', ta_bounds);

        // get a bounds scratch as well.
        //  4 int16 values (accepts negatives).

        // use these ta ... scratch properties for the moment.

        // need to go through the image space from the source pb.

        const ta = this.ta;
        const ta_target = pb_target.ta;

        console.log('pb_target.pos', pb_target.pos);
        // The target pos should have been set up separately / automatially before?




        // const ta_adjusted_safe_bounds = this.ta_bounds_scratch
        // const ta_bounds_adjustment = this.ta_offset_scratch  (size 4)

        // using data stored in specific typed arrays will help process it quickly.
        //  




        // Using a few / plenty of scratch tas could help to keep the code from declaring new variables.



        // 


        // beginning the target pointer at the position of the beginning of the bounds...

        //  will need to check for x/y out of bounds errors anyway.
        //   likely need to do that with every pixel anyway?
        //    when reading from the source image...?
        //   or pre-calculate which are out of bounds, pre-fill with the out of bounds color, then process the area that's in bounds.
        //    that does seem like the fastest method with the fewest tests that need to be done on a per-pixel basis.
        //     and adjust the write positions?

        // Seems like doing this in a rather longwinded way does make sense.
        //  Want the fewest operations poss, done in a simple way (in general).

        // Finding the boundaries of the area that is within the source image bounds.
        //  Know what the offset between the given boundaries and allowed boundaries is.
        //  Only copy pixels within safe boundaries, to their positions within the safe boundaries.


        // Adjusted bounds, but then put into a slightly different position?
        //  As in when it's out of bounds, it just does not copy.

        // Do a for loop using the adjusted bounds.
        // These adjusted bounds will only cover a safe area of the image.

        // Bounds adjustments, also using these scratch tas, make sense.
        //  sometimes will need very fast copying between Pixel_Buffers.

        // do a bound adjusted copy.

        // safe bounds limits...
        //  then the bounds themselves...
        //  a secondary bounds scratch?

        // calculations on typed arrays would be of use too.
        //  both optimized and functional.





        const ta_safe_bounds_limits = this.ta_bounds_scratch;
        ta_safe_bounds_limits[0] = 0;
        ta_safe_bounds_limits[1] = 0;
        ta_safe_bounds_limits[2] = this.size[0];
        ta_safe_bounds_limits[3] = this.size[1];




        const ta_safe_adjusted_bounds = this.ta_bounds2_scratch;

        const ta_bounds_adjustments = this.ta_bounds3_scratch;

        // and a third bounds scratch ta for the adjustment values?
        //  do we need these for dealing with indexes?

        const ta_bounds_byte_offsets = this.ta_bounds3_scratch;




        // bounds adjustments values (x) needed for setting the index at the beginning of each row.


        //ta_safe_adjusted_bounds = 

        if (ta_bounds[0] >= ta_safe_bounds_limits[0]) {
            ta_safe_adjusted_bounds[0] = ta_bounds[0];
            ta_bounds_adjustments[0] = 0;
        } else {
            ta_bounds_adjustments[0] = ta_safe_bounds_limits[0] - ta_bounds[0];
            ta_safe_adjusted_bounds[0] = ta_safe_bounds_limits[0];
        }
        if (ta_bounds[1] >= ta_safe_bounds_limits[1]) {
            ta_safe_adjusted_bounds[1] = ta_bounds[1];
            ta_bounds_adjustments[1] = 0;
        } else {
            ta_bounds_adjustments[1] = ta_safe_bounds_limits[1] - ta_bounds[1];
            ta_safe_adjusted_bounds[1] = ta_safe_bounds_limits[1];
        }
        if (ta_bounds[2] <= ta_safe_bounds_limits[2]) {
            ta_safe_adjusted_bounds[2] = ta_bounds[2];
            ta_bounds_adjustments[2] = 0;
        } else {
            ta_bounds_adjustments[2] = ta_safe_bounds_limits[2] - ta_bounds[2];
            ta_safe_adjusted_bounds[2] = ta_safe_bounds_limits[2];
        }
        if (ta_bounds[3] <= ta_safe_bounds_limits[3]) {
            ta_safe_adjusted_bounds[3] = ta_bounds[3];
            ta_bounds_adjustments[3] = 0;
        } else {
            ta_bounds_adjustments[3] = ta_safe_bounds_limits[3] - ta_bounds[3];
            ta_safe_adjusted_bounds[3] = ta_safe_bounds_limits[3];
        }

        console.log('ta_safe_adjusted_bounds', ta_safe_adjusted_bounds);


        // Need to be specific about which offsets are used where.
        //  Will need to try different cases too.

        // A more efficient bits_per_pixel storage / getter?
        //  ta_bpp with both bipp and bypp
        //   and facade functions to access it.

        // Want to get this optimized to the fullest.


        // module level scratch as well?
        //  careful about multithreading then....




        console.log('ta_bounds_adjustments', ta_bounds_adjustments);

        // lets use a pixel read index in one of the tas.
        //  keep that up to date with each pixel?
        //   probably can do set from the row.

        // and update the write pixel location pointer too.
        //  will be able to set whole rows.
        //   not quite sure how fast that will be.

        // will work out the indexes of the start and end of each row from the source image.
        //  will use ta.set


        // bytes_per_row


        // use pointers ta for number of bytes per row.

        // source image bytes_per_row
        console.log('this.bytes_per_row', this.bytes_per_row);

        const source_bytes_per_row = this.bytes_per_row;
        const bypp = this.bypp;

        // the offset from the end of one row read from the source (according to the bounds) to the beginning of the next row to read from the source

        // byte offsets of bounds...

        // read byte offsets?
        //  source read byte offsets?


        // but what are these for?


        // want to calculate the start position of the first source byte to read.
        //  use the ta_safe_adjusted_bounds
        //   safe_adjusted_bounds_pixel_indexes?
        //    and they are pixel indexes based on the source image.

        // but also row widths in number of bytes.
        //  target.bytes_per_row
        

        // But most likely we want the read coords to be right at the top left.
        //  We do want to start at 0,0 on the source image, with the bounds system limiting how far right and down it reads to start with.

        // For the moment, it seems we need to get into more detail about what specific areas will be mapped,
        //  what indexes apply, and importantly what index increments apply when moving from pixel to pixel and then to the next row.

        // For loops mapping the target pixel to read.
        //  For the moment, use of scratch tas for these internal things will be best.

        // Maybe better to loop through the in-bounds pixels of the source pb.
        //  copy them to the target pb.

        // keeping track of variables is one of the most important things to get this working efficiently on a low level.



        // Seems worth redoing this in a focused way after all this writing....
        //  Could sum it up in a few parts.

        // 1) Calculate the in-bounds region (px) of the source image
        //     calculate its corresponding region (px) on the target image

        // 2) Calculate the row byte length of the in-bounds region

        //  source image - how many bytes to jump to the beginning of the next in-bound row.
        //  dest image - no row skip needed ??? (for the moment)

        //  offset of the beginning of each row (from the bounds) when reading from the source.

        // the y-dest-row-loop may work best?
        //  could try some different loop functions.
        //   easiest first and compare results.

        // Try the syncronised pointer update loop.

        // looping over dest_y.

        // the whole of the dest is within bounds?
        //  no, some of it may be referring to some out-of-bounds part of the source.

        // so loop over the dest rows that are within bounds.

        // ta_dest_area_within_source_safe_bounds
        //  so the bounds on the dest that match up with safe areas of the source.














        const adjusted_safe_bounds_source_read_byte_offsets = this.ta_offsets_scratch;
        adjusted_safe_bounds_source_read_byte_offsets[0] = ta_bounds_adjustments[0] * bypp;
        adjusted_safe_bounds_source_read_byte_offsets[1] = ta_bounds_adjustments[1] * source_bytes_per_row;
        adjusted_safe_bounds_source_read_byte_offsets[2] = ta_bounds_adjustments[2] * bypp;
        adjusted_safe_bounds_source_read_byte_offsets[3] = ta_bounds_adjustments[3] * source_bytes_per_row;

        console.log('adjusted_safe_bounds_source_read_byte_offsets', adjusted_safe_bounds_source_read_byte_offsets);



        const adjusted_safe_bounds_target_write_byte_offsets = pb_target.ta_offsets_scratch;
        // and the write offset...







        // And the safe bounds write offsets too.

        // Seems worth having all of this put into tas.
        //  Many functions seem to use a few structures which hold various forms of numbers for similar kinds of things. Can standardise and provent memory alloc / realloc.




        // loop through the rows that appear in the safe bounds
        //  calculate the byte indexes of the beginning and ends of each row?


        // Addition only may be faster.
        //  Try the algo only with increments.

        // Set up the start and end points of the first row, both reading and writing.

        // would be a pointer pair for each of them.

        const ta_pp_source_read = this.ta_pointerpair_scratch;
        const ta_pp_target_write = pb_target.ta_pointerpair_scratch;

        // then set these up before each line copy.

        

        // so can make pb_target.bytes_per_row the read width...


        //const row_byte_length = 

        // But only doing the safe copy.

        // May be best to set up and do the safe copy, row by row.
        //  But going by what's getting copied into the target pb, meaning leaving out anything that would be out of bounds there, or come from an out of bounds place in the source.

        // A moving window of some sort, set up with tas?


        // Maybe need to precompute some more values.

        // The bytes per row of the safe boundary range.

        const bytes_per_row_of_safe_bounds = (ta_safe_adjusted_bounds[2] - ta_safe_adjusted_bounds[0]) * bypp;

        console.log('bytes_per_row_of_safe_bounds', bytes_per_row_of_safe_bounds);


        ta_pp_source_read[0] = adjusted_safe_bounds_source_read_byte_offsets[0] + adjusted_safe_bounds_source_read_byte_offsets[1];
        // need to set it to a number that's within bounds of the source image.
        ta_pp_source_read[1] = ta_pp_source_read[0] + bytes_per_row_of_safe_bounds;




        ta_pp_target_write[0] = 0; // no, it's the left indent of the safe bounds.
        ta_pp_target_write[1] = ta_pp_target_write[0] + bytes_per_row_of_safe_bounds;


        console.log('ta_pp_source_read', ta_pp_source_read);
        console.log('ta_pp_target_write', ta_pp_target_write);

        // need to update this by the write offset...
        //  and maybe need some offset precalculation in bytes, for the target, with the bounds (safe adjusted bounds in use).
        //   need that to have accurate write positions.



        // A getter for bytes_per_row would be useful.



        console.log('pb_target.bytes_per_row', pb_target.bytes_per_row);

        // and then the number of rows to copy...
        //  will be able to iterate the pointers and do ta.set quite neatly.

        const num_rows_to_copy = ta_safe_adjusted_bounds[3] - ta_safe_adjusted_bounds[1];
        console.log('num_rows_to_copy', num_rows_to_copy);

        // Have a simple local variable to count the row number?
        //  Use incrementation to update the byte index values.

        for (let c = 0; c < num_rows_to_copy; c++) {
            // copy the row...

            // could set using a slice of the source...
            // or subarray.

            // .set using an offset and a subarray should work OK.

            // maybe pixel for loop would be faster anyway.

            const sa_source_row = ta.subarray(ta_pp_source_read[0], ta_pp_source_read[1]);
            console.log('sa_source_row', sa_source_row);







            //ta_target.set()


            // increment the pointers to point to the next row...


        }











        


        // .ta_bounds_info...
        //  larger ta that includes space for bounds intersection and safety options and info?


        

        //ta_pp_source_read[1] = ta_pp_source_read[0] + 





        // the source read 

        








        // ta_bounds_adjustments...
        //  but really need to go within / loop within the calculated safe bounds.

        // should be easy enough to loop through the in-range rows in the target image.
        //  ta_safe_adjusted_bounds

        // actually have the pos of the target set accurately to reflect its center point?
        //  it would be -2, -2 at size 5.










        // setup both the pointers for write and the pointers for read.



        // use another ta to hold the read row byte index bounds
        //  and another for the write row byte index bounds.

        // ta_pointerpair_scratch?
        //  just 2 of them makes more sense.



        // then work out the standard start and end points of the row in the data from the source???
        //  or we have the offsets to the start point already? the 0,0 point?

        // using a smallish bunch of named const typed scratch typed arrays makes sense here.

        // do the copying row by row.
        //  only think we need the y position. to be iterated?
        //   and work out the byte index variables, do the copying.
        //    optimized copying designed around the data structures.

        // the 4 points of the bounds in terms of pixel indexes would be useful
        //  or v edge values really, or lt, rb
        // with these we can do the row copy algorithm quickly.

        // probably best to do this using source and dest / dest and source byte indexes
        //  could use translations between them.

        // need to have the maths to do it for rows, or even better, whole blocks of rows, ie the necessary 2d image.

        // using byte array pointers for pixels may well speed operations up.
        //  its a lower level than coords.



        // have ta values available for the read and write byte pointers.
        //  row read pointer pair
        //  row write pointer pair

        // both pointer ranges - 2 pointers, sequential.

        // pointers here basically being array indexes.

        // uint32










        //  safe adjusted bounds byte offsets...
        //   can get another bounds scratch...?

        // These small scratch objects will work well with SIMD in the future.
        //  Working out the byte offsets from the different edges will be useful.

        // will use this.get_byte_index_from_pos_24bipp
        //  and other convenience / fast function.
        // Then could inline them.

        // functions that set a value to an existing typed array
        //   could be faster? give it the ta and the idx.

        // update_ta_with_px_byte_idx(ta, ta_idx, pos)

        // could work quickly that way.

        // would be worth testing different versions with different micro-optimizations.













        // ? row length of extraction in bytes

        // [0]: row beginning (source) byte index
        // [1]: row ending (source) byte index
        //ta_pointers[0] = 

        // copy it from the source row by row.








        
        // then calc what the safe bounds are...

        // safe bounds come from size of this....
        // min is 0, 0, max is w, h
        //  possibly by using quite a lot of ta variables things can work really fast.
        //  or more specific function calling...?



























        // use the adjusted bounds.
        //  and have the write index take into account necessary bounds adjustments.

        // Hopefully this function can still run very quickly indeed.
        //  Copy within the bounds
        //  Keep the read and write pointers both up-to-date, and use them



        // go within the safe adjusted bounds.

        for (pos[1] = ta_bounds[1]; pos[1] < ta_bounds[3]; pos[1]++) {
            // row start... worth setting the read byte pointer to the start of the row.
            //ta_pointers[0] = 



            // read the pixels in the row...


            //  worth setting 
            // row complete...
        }







        // Can easily and quickly use pos as the core of the iteration?
        //  Then calculate the edges with pos and ta_bounds

        // 
















        if (rect_size[0] === pb_target.size[0] && rect_size[1] === pb_target.size[1]) {
            // optimized...
            //  call a separate function?
            //  _24bipp_target_same_size?

            //  probably not needed for the moment...?
            //   smaller code paths result in more optimizations.

            console.log('rect_size matches target size.')



        }
    }

    copy_rect_by_bounds_to(ta_bounds, pb_target) {

        console.log('pb.copy_rect_by_bounds_to');

        const bipp = this.bipp;

        if (bipp === 24) {
            return this.copy_rect_by_bounds_to_24bipp(ta_bounds, pb_target)
        } else {
            console.trace();
            throw 'NYI';
        }



    }
    each_px_convolution(ta_size, pb_conv_window, ta_pos, callback) {

        console.trace();
        throw 'NYI';
        // const ta_size = new Uint16Array(2);
        ta_pos[0] = 0;
        ta_pos[1] = 0;

        //console.log('ta_size', ta_size);


        // Would 4 levels of loop for a moving convolution window be too much?
        

        // Looping x and y should be OK.
        //  dealing with out of bounds.


        // Will find out how long loops take vs how long memory allocation takes
        //  also will check algorithms for amount of memory copying used.
        //   and size of area it copies memory to.


        // Could have a get_conv_window(pos, size) function.
        //  and would return a conv window object cached for that size?

        // Or write conv window to a ta?
        //  Updating a Pixel_Buffer with the conv_window makes a lot of sense.




        //  maybe that would work OK.
        //  and do it in a very fp way?








        // rectangular sizes?
        //  may as well support them at the moment.

        // should be able to work with different bipp.
        //  may be just worth implementing it for 8bipp to start with.

        // 1 bit per pixel image manipulation is now working nicely.
        //  pixel reducer functions?

        // Possibly different functions for different bipp would work best.

        // Have been given pb_conv_window already.

        if (are_equal(pb_conv_window.size, ta_size)) {

        } else {
            // Sizes need to be equal.

        }






    }



    

    // Threshold above, below, equal?
    //  Could be in the options?
    //   Threshold passes whats above.
    get_1bipp_threshold_8bipp(ui8_threshold) {
        const bipp = this.bits_per_pixel;

        if (bipp === 8) {
            const res = new this.constructor({
                bits_per_pixel: 1,
                size: this.size
            });
            const rta = res.ta;
            const ta = this.ta;

            const cpx = this.num_px;

            let i_px = 0;

            // Probably best to do the bit modification inline.
            //  Won't take all that much code.
            //  Worth having it optimized.

            // Go through it pixel by pixel.
            //  calculate if its on or off
            //  calculate the byte and the necessary bit modification to set it.
            
            // Or as blocks of 8, building up an integer?
            //  Is that the same really?

            // Could take 8 pixel strides in the source image, building up a 1 byte in size value to use.
            //  Building them up byte by byte and then assigning them to the array?
            //  Could be faster as there would be more frequent writes to the same variable / pointer location.

            // Or with each byte, need to deal with it in descending order (getting this wrong???)

            // keeping track of the dest byte and dest bit

            let i_dest_byte = 0, i_dest_bit = 7;
            // start in reverse...
            //  That seems to be right because the first pixel is the most significant in terms of bits.


            // but the bit significance needs to be reversed within the byte.
            //  will need changes elsewhere.

            // ta[i_px];

            let meets_threshold = false;

            let out_byte = 0;

            while (i_px < cpx) {
                meets_threshold = ta[i_px] >= ui8_threshold;
                // 
                if (meets_threshold) {
                    // it's 2 to the power of i_dest_bit
                    // Could optimize with a powers array. (maybe).
                    out_byte = out_byte | Math.pow(2, i_dest_bit)

                } else {

                }
                i_px++;
                i_dest_bit--;
                if (i_dest_bit === -1) {
                    //console.log('out_byte', out_byte);
                    rta[i_dest_byte] = out_byte;

                    // put the number in place?

                    i_dest_bit = 7;
                    i_dest_byte++;
                    out_byte = 0;
                }
            }
            // then the rest once complete?
            return res;

        } else {
            console.trace();
            throw 'get_1bipp_threshold_8bipp: Unsupported bits_per_pixel ' + bipp;
        }


    }

    to_24bipp() {

        // Creates another one
        //  Consider how the other one could act as a window, but with a different number of channels.
        //   Would need specific optimized copy function.


        const bipp = this.bits_per_pixel;
        const bypp = this.bytes_per_pixel;
        let i_px = 0;
        const num_px = this.size[0] * this.size[1];
        //console.log('to_24bipp bipp', bipp);
        if (bipp === 1) {
            const res = new this.constructor({
                size: this.size,
                bits_per_pixel: 24
            })
            let i_byte = 0;
            const num_bytes = this.ta.length;
            // iterate through the bits?
            // could have a fast processing algorithm that's written out a bit longer, using &.
            // go through it byte by byte makes sense in a way.

            while (i_byte < num_bytes) {
                // iterate through pixel numbers too...
                // need to set the result points.
                // do this 8 times...
                for (var b = 0; b < 8; b++) {
                    const color = this.get_pixel_by_idx_1bipp(i_px) === 1 ? new Uint8ClampedArray([255, 255, 255]) : new Uint8ClampedArray([0, 0, 0]);
                    res.set_pixel_by_idx_24bipp(i_px++, color);
                }
                i_byte++;
                // pixel by pixel... not as efficient this way.
            }
            return res;
        } else if (bipp === 8) {
            const res = new this.constructor({
                size: this.size,
                bits_per_pixel: 24
            });

            // r, g, b all the same.
            console.trace();
            throw 'NYI';



            return res;

        } else if (bipp === 24) {
            return this.clone();
        } else if (bipp === 32) {
            const res = new this.constructor({
                size: this.size,
                bits_per_pixel: 24
            })
            // will remove the channel.
            // iterate through each pixel?

            while (i_px < num_px) {
                const col_32 = this.get_pixel_by_idx_32bipp(i_px)
                i_px += bypp;
            }

            return res;

        }

    }

    toString() {
        /*
        size: Uint32Array [ 1024, 576 ],
        bits_per_pixel: 32,
        bytes_per_pixel: 4,
        bytes_per_row: 4096 }
        */
        return JSON.stringify({
            buffer: 'Uint8ClampedArray length ' + this.buffer.length,
            size: this.size,
            bits_per_pixel: this.bits_per_pixel,
            bytes_per_pixel: this.bytes_per_pixel,
            bytes_per_row: this.bytes_per_row
        });
    }
    /*
    [inspect]() {
        return 'Pixel_Buffer_Core ' + this.toString();
    }
    */

    color_whole(color) {
        // if color a number or typed array?
        //throw 'stop';
        //console.log('this.bytes_per_pixel', this.bytes_per_pixel);

        // 0.125 - 1/8 bytes per pixel

        if (this.bytes_per_pixel === 1) {
            // expect a value

            const ta_32_scratch = new Uint32Array(12);
            //console.log('this.size', this.size);
            ta_32_scratch[0] = this.size[0] * this.size[1];
            const buf = this.buffer;
            let i;
            for (i = 0; i < ta_32_scratch[0]; i++) {
                buf[i] = color;
            }
            //console.log('ta_32_scratch[0]', ta_32_scratch[0]);
        } else if (this.bytes_per_pixel === 3) {
            const ta_32_scratch = new Uint32Array(12);
            ta_32_scratch[0] = this.size[0] * this.size[1] * 3;
            const buf = this.buffer;
            let i, c = 0;
            for (i = 0; i < ta_32_scratch[0]; i++) {
                buf[c++] = color[0];
                buf[c++] = color[1];
                buf[c++] = color[2];
            }

        } else if (this.bytes_per_pixel === 4) {
            const ta_32_scratch = new Uint32Array(12);
            ta_32_scratch[0] = this.size[0] * this.size[1] * 4;
            const buf = this.buffer;
            let i, c = 0;
            for (i = 0; i < ta_32_scratch[0]; i++) {
                buf[c++] = color[0];
                buf[c++] = color[1];
                buf[c++] = color[2];
                buf[c++] = color[3];
            }
        } else {
            throw 'Unsupported this.bytes_per_pixel: ' + this.bytes_per_pixel;
        }
        return this;
    }

    crop(size) {

        // new_cropped for getting a new cropped version?
        // Want to crop self.

        let new_size = new Uint16Array([this.size[0] - size * 2, this.size[1] - size * 2]);
        let res = new this.constructor({
            bytes_per_pixel: this.bytes_per_pixel,
            size: new_size
        });
        if (this.pos) {
            res.pos = new Int16Array([this.pos[0] - size, this.pos[1] - size])
        }
        //if (this.pos) res.pos = this.pos;
        this.each_pixel_ta((pos, color) => {
            const new_pos = new Int16Array([pos[0] - size, pos[1] - size]);
            if (new_pos[0] >= 0 && new_pos[0] < new_size[0] && new_pos[1] >= 0 && new_pos[1] < new_size[1]) {
                //res.set_pixel_ta(new_pos, color);
                res.set_pixel_ta(new_pos, color);
            }
        });
        return res;
    }

    uncrop(size, color) {
        let res = new this.constructor({
            bytes_per_pixel: this.bytes_per_pixel,
            size: new Uint16Array([this.size[0] + size * 2, this.size[1] + size * 2])
        })
        if (this.pos) res.pos = this.pos;
        if (this.pos) {
            //res.pos = new Int16Array([this.pos[0] + size, this.pos[1] + size])
        }
        res.color_whole(color);
        console.log('size', size);
        this.each_pixel_ta((pos, color) => {
            //console.log('pos', pos);
            res.set_pixel_ta(new Uint16Array([pos[0] + size, pos[1] + size]), color);
            //res.set_pixel_ta(new Uint16Array([pos[0], pos[1]]), color);
        })
        return res;
    }

    // define the bounds, expect UInt16 array

    // bounds ltrb
    // pos and size?

    // draw_rect? paint_rect?

    color_rect(bounds, color) {
        // ltrb
    }
    // couldn't we do a simpler for loop throughout the length.

    // Could use a for loop looping through pixel indexes elsewhere.

    each_pixel_index(cb) {
        const buf = this.buffer, l = buf.length, bpp = this.bytes_per_pixel;
        for (let c = 0; c < l; c += bpp) {
            cb(c);
        }
    }

    // then will want to do translations on pixel indexes.
    //  can have a translation list.
    //  pixel pos list used as offsets
    //  index array rather than pixel pos list too.

    // Could make shorter and more general version.
    padded_each_pixel_index(padding, cb) {
        const ta_32_scratch = new Uint32Array(9);
        ta_32_scratch[0] = this.bytes_per_pixel;
        ta_32_scratch[1] = 0; // i
        ta_32_scratch[2] = this.size[0] - padding;
        ta_32_scratch[3] = this.size[1] - padding;

        ta_32_scratch[7] = this.size[0];
        //ta_32_scratch[8] = 
        // 4 = x
        // 5 = y
        //let y, x, i;
        // a px typed array... could give actual access to that typed array / view.
        //const w = this.size[0],
        //    h = this.size[1];
        //const buf = this.buffer;
        const bpp = this.bits_per_pixel;

        if (bpp === 32) {
            ((cb) => {
                for (ta_32_scratch[5] = padding; ta_32_scratch[5] < ta_32_scratch[3]; ta_32_scratch[5]++) {
                    for (ta_32_scratch[4] = 0; ta_32_scratch[4] < ta_32_scratch[2]; ta_32_scratch[4]++) {
                        //ta_32_scratch[1] = (ta_32_scratch[5] * this.size[0] + ta_32_scratch[4]) * ta_32_scratch[0];
                        cb((ta_32_scratch[5] * ta_32_scratch[7] + ta_32_scratch[4]) * ta_32_scratch[0]);
                        //ta_32_scratch[1] += 4;
                    }
                }
            })(cb);
        }
        if (bpp === 24) {
            ((cb) => {
                for (ta_32_scratch[5] = padding; ta_32_scratch[5] < ta_32_scratch[3]; ta_32_scratch[5]++) {
                    for (ta_32_scratch[4] = 0; ta_32_scratch[4] < ta_32_scratch[2]; ta_32_scratch[4]++) {
                        //ta_32_scratch[1] = (ta_32_scratch[5] * this.size[0] + ta_32_scratch[4]) * ta_32_scratch[0];
                        cb((ta_32_scratch[5] * ta_32_scratch[7] + ta_32_scratch[4]) * ta_32_scratch[0]);
                        //ta_32_scratch[1] += 3;
                    }
                }
            })(cb);
        } else if (bpp === 8) {
            ((cb) => {
                for (ta_32_scratch[5] = padding; ta_32_scratch[5] < ta_32_scratch[3]; ta_32_scratch[5]++) {
                    for (ta_32_scratch[4] = 0; ta_32_scratch[4] < ta_32_scratch[2]; ta_32_scratch[4]++) {
                        cb((ta_32_scratch[5] * ta_32_scratch[7] + ta_32_scratch[4]) * ta_32_scratch[0]);
                        //ta_32_scratch[1] += 1;
                    }
                }
            })(cb);
        }
    }


    // Efficient Tensor processing could be used for this, in another version.

    // pos and subpos with 1bipp? or have intervals on 0.125.???

    // Shuld return the color too?

    // Accept the pos ta as an option?
    //  So it does not need to call the cb function with it, saving allocation???

    // Will go for more flexibility as well as optimization.

    each_pixel_pos(cb) {
        //const bpp = this.bytes_per_pixel;
        const b = this.size;
        const pos = new Int16Array(2);
        for (pos[1] = 0; pos[1] < b[1]; pos[1]++) {
            for (pos[0] = 0; pos[0] < b[0]; pos[0]++) {
                // and the color value
                cb(pos);
            }
        }
    }

    // Some kinds of pixel iteration functions that only work by reference?
    //  Or that do work by reference as well?

    // pixel indexes as well as the positions?
    //  do want a function that reads / provides the pixel values.

    // Putting the pixel value into a typed array does make sense.
    //  As well as using slice(a, b) on the typed array that initially holds the pixel.


    // each_px(ta_pos, ta_px_value, ta_info, cb)
    //  could wind up being very efficient.
    // each_px(ta_pos, ta_px_value, cb)
    //  and the callback can be called with no parameters
    //  also hold the byte index? bit index within byte?
    //   bit overall? The bit number of any value could be an effective means of indexing.

    // And would also have a different each_px (inner) function specific to the number of bipp.

    // if fast enough, each_px could work as the basis for a convolution.
    //  would also read the window around each px.
    //  a moving convolution window implemented in a fast and oo way would be very useful.


    // Functions that operate only on the typed arrays they are given. Callback has no params of its own.
    //  Lets give it a go.

    each_ta_24bipp(ta_pos, ta_px_value, ta_info, callback) {
        // worth doing an x and y loop?
        //  and then also do integer incrementing

        // Can we set details of the array view for the ta px value?
        //  Lets copy the pixel values for the moment.

        const bipp = this.bipp;
        if (bipp === 24) {

            if (ta_pos instanceof Int16Array || ta_pos instanceof Int32Array && ta_pos.length >= 2) {

                // only accept clamped ui8 array for the moment?

                if (ta_px_value instanceof Uint8ClampedArray && ta_px_value.length >= 3) {

                    // r, g, b

                    // these values stored as 32 bit.
                    //  can still have quite large bit addresses. 512mb limit???

                    // or use larger float ta type?
                    //  32 bit int for the moment?
                    //  bigint?

                    if (ta_info instanceof Uint32Array && ta_info.length >= 4) {
                        // img w, img h, pixel index (num), bipp

                        // for loop over all...
                        //  set these two to the size.



                        const ta = this.ta;

                        ta_info[0] = this.size[0];
                        ta_info[1] = this.size[1];
                        ta_info[2] = 0;
                        ta_info[3] = 24; // bipp;

                        const update = () => {
                            ta[ta_info[2] * 3] = ta_px_value[0];
                            ta[ta_info[2] * 3 + 1] = ta_px_value[1];
                            ta[ta_info[2] * 3 + 2] = ta_px_value[2];

                        }

                        for (ta_pos[1] = 0; ta_pos[1] < ta_info[1]; ta_pos[1]++) {
                            for (ta_pos[0] = 0; ta_pos[0] < ta_info[0]; ta_pos[0]++) {
                                ta_px_value[0] = ta[ta_info[2] * 3];
                                ta_px_value[1] = ta[ta_info[2] * 3 + 1];
                                ta_px_value[2] = ta[ta_info[2] * 3 + 2];
                                
                                callback(update);
                                ta_info[2]++;
                            }
                        }

                        //  pixel num = bit index / bipp
                        //   have a pixel num variable too?
                        //    could be convenient.
                        //     maybe more convenient than bit index.
                        //  pixel num would be simpler / easier than bit_index in many cases.

                    }



                    // ta_info
                    //  width
                    //  height
                    //  bit index of current pixel
                    //  bipp (but we know that's 24???)
                    //   nice to set a value for it.

                }
            }



        } else {
            throw 'each_ta_24bipp error: bipp must be 24, bipp: ' + bipp;
        }


    }
    //  



    each_px(ta_pos, ta_px_value, ta_info, callback) {


        const bipp = this.bipp;

        //console.log('bipp', bipp);

        if (bipp === 1) {
            return this.each_ta_1bipp(ta_pos, ta_px_value, ta_info, callback);
        } else if (bipp === 8) {
            return this.each_ta_8bipp(ta_pos, ta_px_value, ta_info, callback);
        } else if (bipp === 24) {
            return this.each_ta_24bipp(ta_pos, ta_px_value, ta_info, callback);
        } else if (bipp === 32) {
            return this.each_ta_32bipp(ta_pos, ta_px_value, ta_info, callback);
        } else {
            console.trace();
            throw 'Unsupported bipp: ' + bipp;
        }


    }



    paint_pixel_list(pixel_pos_list, color) {
        pixel_pos_list.each_pixel(pos => {
            //console.log('typeof pos', typeof pos);
            //console.log('pos', pos);
            //console.log('color', color);
            //console.log('pos, color', pos, color);
            this.set_pixel_ta(pos, color);
        });
    }

    // Will have more advances get_pixel too.
    //  get_pixel_by_idx


    // set_pixel_1bipp, set_pixel_8bipp, set_pixel_24bipp, set_pixel_32bipp

    'set_pixel_1bipp'(pos, color) {
        // color should be 1 or 0
        // on or off.
        
        //console.log('set_pixel_1bipp');
        //console.log('pos', pos);

        const val = !!color;
        // get the pixel index....

        const idx = pos[1] * this.size[0] + pos[0];
        const byte = Math.floor(idx / 8);

        // 7 - idx % 8 ???
        const bit = 7 - (idx % 8);

        //console.log('byte, bit', [byte, bit]);

        // use roots of some sort?

        const pow = Math.pow(2, bit);
        //console.log('pow', pow);

        const byte_val = this.ta[byte];
        //console.log('byte_val', byte_val);


        /*
        if (byte_val < pow) {
            //this.ta[byte] += pow;
        } else {
            //this.ta[byte] -= pow;
        }
        */

        if (val) {
            this.ta[byte] = this.ta[byte] | pow;
        } else {
            this.ta[byte] = this.ta[byte] & pow;
        }
        //console.log('this.ta[byte]', this.ta[byte]);
        // 0: 
        // Think this works now :)
    }
    // this.buffer[this.bytes_per_pixel * (pos[0] + pos[1] * this.size[0])] = color;
    'set_pixel_8bipp'(pos, color) {
        // color should be 1 or 0
        // on or off.
        //const val = !!color;
        // get the pixel index....
        const idx = pos[1] * this.size[0] + pos[0];
        //const byte = Math.floor(idx / 8);
        //const bit = idx % 8;

        //console.log('byte, bit', [byte, bit]);

        this.ta[idx] = color;
    }
    'set_pixel_24bipp'(pos, color) {
        // color should be 1 or 0
        // on or off.

        //const val = !!color;
        // get the pixel index....

        const idx = pos[1] * this.size[0] + pos[0];
        const byte = idx * 3;
        //const bit = idx % 8;

        //console.log('byte, bit', [byte, bit]);

        this.ta[idx] = color[0];
        this.ta[idx + 1] = color[1];
        this.ta[idx + 2] = color[2];
    }
    'set_pixel_32bipp'(pos, color) {
        // color should be 1 or 0
        // on or off.

        //const val = !!color;
        // get the pixel index....

        const idx = pos[1] * this.size[0] + pos[0];
        const byte = idx * 4;
        //const bit = idx % 8;

        //console.log('byte, bit', [byte, bit]);

        this.ta[idx] = color[0];
        this.ta[idx + 1] = color[1];
        this.ta[idx + 2] = color[2];
        this.ta[idx + 2] = color[3];
    }
    'set_pixel_by_idx_1bipp'(idx, color) {
        const byte = Math.floor(idx / 8);
        const bit = 7 - (idx % 8);
        const val = !!color;
        const pow = Math.pow(2, bit);

        //console.log('color', color);
        //console.log('val', val);

        //console.log('bit', bit);

        //console.log('1) this.ta[byte]', this.ta[byte]);
        //console.log('val', val);
        if (val) {
            this.ta[byte] = this.ta[byte] | pow;
        } else {
            //this.ta[byte] = this.ta[byte]~pow;
            // need to remove the component of that pow.
            //  xor?

            // 

            // Unset it...?
            //  how to do that?



            this.ta[byte] = this.ta[byte] & pow;
        }
        //console.log('2) this.ta[byte]', this.ta[byte]);

    }
    'set_pixel_by_idx_8bipp'(idx, color) {
        const byte = idx;
        this.ta[byte] = color;

        //console.log('color', color);

        //console.trace();
        //throw 'NYI';
    }
    'set_pixel_by_idx_24bipp'(idx, color) {
        const byte = idx * 3;
        this.ta[byte] = color[0];
        this.ta[byte + 1] = color[1];
        this.ta[byte + 2] = color[2];

        //console.log('color', color);

        //console.trace();
        //throw 'NYI';
    }
    'set_pixel_by_idx_32bipp'(idx, color) {
        const byte = idx * 4;
        //this.ta[byte] = color;

        this.ta[byte] = color[0];
        this.ta[byte + 1] = color[1];
        this.ta[byte + 2] = color[2];
        this.ta[byte + 3] = color[3];

        //console.trace();
        //throw 'NYI';
    }
    'set_pixel_by_idx'(idx, color) {
        const a = arguments;
        const l = a.length;

        //let t0, t1, t2, t3;

        const bipp = this.bipp;
        //console.log('bipp', bipp);

        if (bipp === 1) {
            return this.set_pixel_by_idx_1bipp(a[0], a[1]);
        } else if (bipp === 8) {
            // check args length

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

        // May be quite a long function.
        //  Better to use inner functions for better optimization? Could be worth checking that.

        // Lets get setting pixels working in all cases.

        // Not sure if this function should be polymorphic / have checking.
        //  Would it be slowed down too much?

        // A quick typed test at the beginning could help.
        //  Not sure how much perf would be lost through doing any kind of polymorphism here.
        //  However, want to make this flexible and work in all possible cases.
        //  Could look into typescript too.

        let ta_pos, ta_color, grey_color;

        const a = arguments;
        const l = a.length;

        //let t0, t1, t2, t3;

        const bipp = this.bipp;
        //console.log('bipp', bipp);

        if (bipp === 1) {
            return(this.set_pixel_1bipp(a[0], a[1]));
        } else if (bipp === 8) {

            // check args length

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
        }
    }


    'get_pixel_by_idx_1bipp'(idx) {
        const byte = Math.floor(idx / 8);
        const bit = 7 - (idx % 8);
        const pow = Math.pow(2, bit);

        return ((this.ta[byte] & pow) === pow) ? 1 : 0;

        //return 1 ? 0 : (this.ta[byte] & pow) === pow;
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

    // Will redo get_pixel.
    //  likely to use tas by default, and built in type checking within minimal calling of any other functions.

    'get_pixel_1bipp'(pos) {
        // work out the pixel index...

        const idx = pos[1] * this.size[0] + pos[0];
        const byte = Math.floor(idx / 8);
        const bit = 7 - (idx % 8);

        //console.log('byte, bit', [byte, bit]);

        // use roots of some sort?
        const pow = Math.pow(2, bit);
        // use AND with POW
        //console.log('get_pixel_1bipp 1 ? 0 : (this.ta[byte] & pow) === pow', 1 ? 0 : (this.ta[byte] & pow) === pow);
        return ((this.ta[byte] & pow) === pow) ? 1 : 0;
        //return 1 ? 0 : (this.ta[byte] & pow) === pow;
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

    get num_px() {
        return this.size[0] * this.size[1];
    }

    // or a getter function for split_rgb_channels?

    get split_rgb_channels() {

        //console.log('core split_rgb_channels');

        // Seems like it had been loaded wrong in the first place.
        //  Need to improve loading of JPEG as 24 bipp.
        //   (though the data input from Sharp may be 32 bipp)

        const [bipp, bypp] = [this.bits_per_pixel, this.bytes_per_pixel];

        // only for images with bipp 24 or 32
        //console.log('bipp', bipp);
        //console.log('bypp', bypp);

        if (bipp === 24 || bipp === 32) {
            // 3 result objects.

            const res = [new this.constructor({
                bits_per_pixel: 8,
                size: this.size
            }), new this.constructor({
                bits_per_pixel: 8,
                size: this.size
            }), new this.constructor({
                bits_per_pixel: 8,
                size: this.size
            })]

            const [r, g, b] = res;

            // then go through the pixel indexes.
            //  direct copy between the tas.
            //   do this in an optimised but still simple way.
            // its fastest not to call other functions, ie iterate and to set.

            let i_px = 0;
            const num_px = this.num_px;
            let i_byte = 0;

            const [ta_r, ta_g, ta_b] = [r.ta, g.ta, b.ta];

            const ta = this.ta;
            while (i_px < num_px) {
                ta_r[i_px] = ta[i_byte];
                ta_g[i_px] = ta[i_byte + 1];
                ta_b[i_px] = ta[i_byte + 2];

                i_px++;
                i_byte += bypp;
            }

            //console.log('pre return res', res);

            return res;

        } else {
            console.trace();
            throw 'NYI';

        }

    }


    process(fn) {
        let res = this.clone();
        return fn(this, res);
    }

    /*
    function typedArraysAreEqual(a, b) {
if (a.byteLength !== b.byteLength) return false;
return a.every((val, i) => val === b[i]);
}

    */
    equals(other_pixel_buffer) {
        let buf1 = this.buffer;
        let buf2 = other_pixel_buffer.buffer;
        if (buf1.length === buf2.length) {
            return buf1.every((val, i) => val === buf2[i]);
        } else {
            return false;
        }
    }



    copy_pixel_pos_list_region(pixel_pos_list, bg_color) {
        // find the bounds of that pixel pos list.
        //  would help if the returned bounds included size.

        let bounds = pixel_pos_list.bounds;
        // not sure why the +1 is needed / helps
        let size = new Uint16Array([bounds[2] - bounds[0] + 1, bounds[3] - bounds[1] + 1]);
        //console.log('size', size);
        //console.log('bounds', bounds);

        // make a new pb

        const res = new this.constructor({
            size: size,
            bytes_per_pixel: this.bytes_per_pixel
        });
        if (this.pos) res.pos = this.pos;
        if (bg_color) {
            res.color_whole(bg_color);
        }
        res.pos = new Int16Array([bounds[0], bounds[1]]);

        // each_pixel_rebounded?
        pixel_pos_list.each_pixel((pos) => {
            // then we copy pixels from the current image to the result.
            // set the result...
            let color = this.get_pixel_ta(pos);
            //console.log('color', color);
            //if (typeof color !== 'number') {
            //    console.log('color', color);
            //}
            const target_pos = new Int16Array([(pos[0] - bounds[0]), (pos[1] - bounds[1])]);
            //const target_pos = new Int16Array([(pos[0]), (pos[1])]);
            //const target_pos = pos;
            //console.log('target_pos, color', target_pos, color);
            res.set_pixel_ta(target_pos, color);
            //res.set_pixel()
        });
        return res;
    }
    // copy_rect_to
    //  copies it to another Pixel_Buffer

    // positions as UInt16Array?

    // x, y, w, h

    // Likely to change this to use typed arrays in the params.
    //  Also to call different inner versions depending on bits per pixel.

    // Will be able to get a window from this.
    //  Pixel buffer window.

    // Maybe Virtual_Pixel_Buffer would be useful for having a windowed view into another Pixel_Buffer.
    //  Could be very fast for convolutions. Not sure.



    'place_image_from_pixel_buffer'(pixel_buffer, dest_pos) {
        // can do a fast copy.
        //  or can do pixel iteration.
        // function to get a line from a buffer?
        // will want to copy directly between them.
        // so for each line in the source, need to copy the line directly into the buffer.
        //  that's if they are the same bits_per_pixel.
        // copying rgba to rgba or rgb to rgb should be fast.
        //  direct copying is fastest.
        const dest_buffer = this.buffer;
        const source_buffer = pixel_buffer.buffer;
        //console.log('dest_pos ' + stringify(dest_pos));
        // It's also worth making RGB->RGBA and RGBA->RGB
        if (this.bits_per_pixel === 32 && pixel_buffer.bits_per_pixel === 32) {
            const dest_w = this.size[0];
            const dest_h = this.size[1];
            const dest_buffer_line_length = dest_w * 4;
            const source_w = pixel_buffer.size[0];
            const source_h = pixel_buffer.size[1];
            const source_buffer_line_length = source_w * 4;
            //console.log('source_w ' + source_w);
            //console.log('source_h ' + source_h);
            let source_buffer_line_start_pos, source_buffer_line_end_pos, dest_buffer_subline_start_pos, dest_buffer_start_offset;
            dest_buffer_start_offset = dest_pos[0] * 4;
            // This algorithm could be sped up with C.
            //cpp_mod.copy_rgba_pixel_buffer_to_rgba_pixel_buffer_region(source_buffer, source_buffer_line_length, dest_buffer, dest_buffer_line_length, dest_pos[0], dest_pos[1]);
            //throw 'stop';
            for (var y = 0; y < source_h; y++) {
                source_buffer_line_start_pos = y * source_buffer_line_length;
                source_buffer_line_end_pos = source_buffer_line_start_pos + source_buffer_line_length;
                dest_buffer_subline_start_pos = (y + dest_pos[1]) * dest_buffer_line_length;
                //var dest_buffer_subline_end_pos = dest_buffer_subline_start_pos + source_buffer_line_length;
                // buf.copy(targetBuffer, [targetStart], [sourceStart], [sourceEnd])
                source_buffer.copy(dest_buffer, dest_buffer_subline_start_pos + dest_buffer_start_offset, source_buffer_line_start_pos, source_buffer_line_end_pos);
            }
        } else {
            console.trace();
            throw 'not currently supported';
        }
    }
    'blank_copy'() {
        var res = new this.constructor({
            'size': this.size,
            'bits_per_pixel': this.bits_per_pixel
        });
        res.buffer.fill(0);
        if (this.pos) res.pos = this.pos;
        return res;
    }
    'clone'() {
        //console.log('1) this.bits_per_pixel', this.bits_per_pixel);
        var res = new this.constructor({
            'size': this.size,
            'bits_per_pixel': this.bits_per_pixel,
            'buffer': this.buffer.constructor(this.buffer)
        });
        if (this.pos) res.pos = this.pos;
        //this.buffer.copy(res.buffer);
        //res.buffer.fill(0);
        return res;
    }


    'add_alpha_channel'() {
        console.log('add_alpha_channel this.bytes_per_pixel', this.bytes_per_pixel);
        if (this.bytes_per_pixel === 3) {
            var res = new this.constructor({
                'size': this.size,
                'bytes_per_pixel': 4
            });
            if (this.pos) res.pos = this.pos;
            /*
            this.each_pixel((x, y, r, g, b) => {
                //console.log('x, y, r, g, b', x, y, r, g, b);
                res.set_pixel(x, y, r, g, b, 255);
            });
            */
            const buf = this.buffer,
                res_buf = res.buffer;
            const px_count = this.size[0] * this.size[1];
            let i = 0,
                ir = 0;
            for (let p = 0; p < px_count; p++) {
                res_buf[ir++] = buf[i++];
                res_buf[ir++] = buf[i++];
                res_buf[ir++] = buf[i++];
                res_buf[ir++] = 255;
            }
            return res;
        }
        if (this.bytes_per_pixel === 4) {
            return this;
        }
    }

    // Will have inner conversion too.

    // 

    //  again, change .bipp or .bypp. make aliases with those names? .bi .by even more abbreviated. Allow more abbreviated code, support aliases for that.
    // then need to be able to save as 8 bit bitmaps too.
    'to_8bit_greyscale'() {
        if (this.bytes_per_pixel === 1) {
            return this;
        }
        if (this.bytes_per_pixel === 3) {
            const res = new this.constructor({
                'size': this.size,
                'bits_per_pixel': 8
            });
            if (this.pos) res.pos = this.pos;
            const bres = res.buffer;
            // Then go over each of this pixel
            //  take average rgb values
            let i = 0;
            this.each_pixel((x, y, r, g, b, a) => {
                bres[i++] = Math.round((r + g + b) / 3);
                //i++;
            });
            return res;
        }
        if (this.bytes_per_pixel === 4) {
            const res = new this.constructor({
                'size': this.size,
                'bits_per_pixel': 8
            });
            if (this.pos) res.pos = this.pos;
            const bres = res.buffer;
            // Then go over each of this pixel
            //  take average rgb values
            let i = 0;
            this.each_pixel((x, y, r, g, b, a) => {
                bres[i++] = Math.round((r + g + b) / 3);
                //i++;
            });
            return res;
        }
    }

    'to_32bit_rgba'() {
        var res = new this.constructor({
            'size': this.size,
            'bits_per_pixel': 32
        });
        if (this.pos) res.pos = this.pos;
        const bres = res.buffer;
        if (this.bytes_per_pixel === 1) {
            // Then go over each of this pixel
            //  take average rgb values
            let i = 0;
            this.each_pixel((x, y, v) => {
                bres[i++] = v;
                bres[i++] = v;
                bres[i++] = v;
                bres[i++] = 255;
                //i++;
            });
        }
        return res;
    }
    // Assume self
    '__invert_greyscale_self'() {
        const bres = this.buffer;
        // Then go over each of this pixel
        //  take average rgb values
        let i = 0;
        this.each_pixel((x, y, v) => {
            bres[i++] = 255 - v;
        });
        return this;
    }
    // .invert
    //   and when it's on a greyscale image
    //   and do it in place.

    // get inverted greyscale
    '__invert_greyscale'() {
        let res = new this.constructor({
            'size': this.size,
            'bits_per_pixel': 8
        });
        if (this.pos) res.pos = this.pos;
        const bres = res.buffer;
        // Then go over each of this pixel
        //  take average rgb values
        let i = 0;
        this.each_pixel((x, y, v) => {
            bres[i++] = 255 - v;
        });
        return res;
    }
}




// Some more functionality and testing

// Moving pixel windows look important.

// Return a ppl of pixels within the bounds, for each pixel.
// 

module.exports = Pixel_Buffer_Core;

if (require.main === module) {
    const lg = console.log;
    //const Pixel_Buffer_Core = get_instance();

    (async() => {

        // Examples are now located elsewhere.

        const run_examples = async() => {
            lg('Begin run examples');

            // A list of example functions. array.

            const examples = [
                async() => {
                    // just lg for log???
                    lg('Begin example 0');

                    // Change it to 1 bit per pixel.

                    // Maybe make a new 1 bit per pixel pixel buffer, and do some manipulations on it.

                    // Could make them small, such as 8 * 8, meaning 8 bytes. That would be a good starting point because each row is
                    //  1 byte.

                    // Can also try and test some set pixel and get pixel methods. See that it works with code on a small scale.
                    //  Then could work on expanding the scale once some maths has been better implemented and understood.

                    const pb = new Pixel_Buffer_Core({
                        bits_per_pixel: 1,
                        size: [8, 8]
                    });

                    // set_pixel(3, 3, 1);  // This could actually be faster though?
                    // set_pixel([3, 3], 1);
                    // set_pixel(ta_pos, 1);

                    const ta_pos = new Int16Array(2);

                    ta_pos[0] = 3;
                    ta_pos[1] = 3;

                    // Adding or subtracting the significance of the bit would be a good way to do it.
                    //  Reference an array of bit signigicances. Modify the number. Don't try to directly access the bits.
                    //  Will have simpler JS code this way. Could then maybe make bit manipulation system.

                    pb.set_pixel(ta_pos, 1);

                    // Will do individual set pixel and get pixel functions.
                    //  Treat input using truthy or falsy.

                    // if ... == true.

                    lg('End example 0');
                    return pb;

                }
            ]

            const l = examples.length;
            for (var c = 0; c < l; c++) {
                const res_eg = await examples[c]();
                console.log('res_eg ' + c + ':', res_eg);
            };
            lg('End run examples');

        }

        await run_examples();
    })();



}
