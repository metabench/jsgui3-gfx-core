/*
    Maybe want an Image class that internally uses both Pixel_Buffer as well as X_Spans.
    Being able to handle multiple modes could be useful.
    Some modes will be more optimal for some operations.
    Drawing X_Spans will be sometimes a lot faster than drawing pixels.
    Then could get the output as a pixel buffer.
    Could keep one specific data structure up-to-date, and then when another representation is needed it renders the image into that
    data structure.


    May want to move some higher level algorithms upwards - ones that could work on top of either image type so long as there are
    lower level functions that do things like set_pixel.

    Could have optimised implementations for some things what work on those data structures.

    Static_X_Spans - Would be a good format to represent a shape. Maybe good format for saving to disk.
    Dynamic_X_Spans - Would be a good format for drawing a shape. Probably good for flood fills and other operations that modify the image.
        Dynamic_X_Spans seems more useful for the moment.



    Pixel_Buffer_Core could possibly use Dynamic_X_Spans when it does a draw_pollygon filled operation.
        The X_Spans idea came about as a way to do faster flood fills.
        A highly optimised Dynamic_X_Spans should be particularly useful for this.
            Flood fills will remove / join together some X Spans.


    Maybe Pixel_Buffer_Enh will use these Dynamic_X_Spans in order to do some things quicker (too)
    Polygon shape drawing seems core in terms of API, but somewhat higher level compared to some other features and algorithms.
    Possibly a Polygon that could draw itself to image data structures would work well.

*/


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

// This has got huge so far....

/*
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
*/

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


// Want to be able to easily use pixel buffers as compositors for other pixel buffers.


// Could even have an external scratch ta.
//  For things like index, byte and bit.




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

        // bipp or bypp?
        const ta_bpp = new Uint8ClampedArray(2);
        ta_bpp[1] = 8; // byte to bit multiplier. will stay as 8.
        

        const _24bipp_to_8bipp = () => {
            const old_ta = ta;
            const new_ta = ta = new Uint8ClampedArray(this.num_px);
            const l_read = old_ta.length;
            let iby_read = 0, iby_write = 0;
            while (iby_read < l_read) {
                new_ta[iby_write++] = Math.round((old_ta[iby_read++] + old_ta[iby_read++] + old_ta[iby_read++]) / 3);
            }
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


        // This does have a 'bounds' option.
        //  Is that like an offset?

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



        // This.pos....

        //  this.pos seems to complicate things.
        //   Not sure it's fully implements in some inner functions, not sure it should be.

        

        
        // Pos_Array perhaps?
        //  Typed arrays and classes around them will provide the mega-fast data structures that can get some things like this to work.
        //  Would be worth making and testing them separately.






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

                // Need to round up the number of bytes to nearest byte...



                ta = new Uint8ClampedArray(Math.ceil((ta_bpp[0] / 8) * this.size[0] * this.size[1]));



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

        //console.log('convolution', convolution);
        //console.log('convolution.size', convolution.size);
        //console.log('convolution.num_px', convolution.num_px);

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






    // Not so sure why this function attempt is so long.
    //  Should possibly remove it and later try different implementations.

    //  For the moment, not so sure about everything being inlined and using typed arrays.
    //   Some local variables (and maybe even function calls?) could speed things up.

    // Want reference implementations as well as optimised implementations.
    //  Maybe make versions of classes that are purely reference implementations.


    // Pixel_Buffer_Reference_Implementation
    //  Still could use a typed array.
    //  Still would have bit logic with set_pixel.
    //  Could use a few fancy tricks for some decent speed optimisation
    //  Aiming for concise and clear algorithms. Clear about what they do and how they do it.

    // Pixel_Buffer_Core_Reference_Implementation
    // Pixel_Buffer_Core_Optimised_Implementation
    //  with some overriden methods that are faster.

    // Some kind of bit-aligned readings of x spans could work very well.
    // Maybe try with some 64x64 images and work upwards from there.
    //  Get that working, and work out what further calibration is needed.

    // Anyway, the xspans format does seem essential.
    
    // xspans row perhaps.
    //  and itself making reference to a larger ta within an xspans_image perhaps?


    // yrows_xspans_buffer?

    // and consider that they are wide pixels as well.
    //  perhaps wide pixels could be a useful concept for pixel buffers.
    //   but really this is about encoding the total image data in a smaller amount, so that less data needs to be shifted around
    //   with some operations such as flood fill. The data is already compressed in a way that fits the logic of the operation.

    // An arrays implementation could be most convenient to make and for testing / comparison.
    // Each y value being an array.
    //  Then points inside.

    // Could even see about making a typed array and proxy implementation that actually matches that API - and comparing the speed.
    // May need to try a few implementations to get to the fastest.

    // May need to use slightly different APIs in some cases as different calling and data transfer methods could be more optimal
    //  Such as putting params into a typed array that's already part of the object.
    //  And maybe having an API that helps do that too....

    








    


    // yrows_xspans_image makes sense.
    //  and just having set and get pixel will be enough for many things.

    // May be worth making specific versions for 1bipp.
    //  Because it can work in 'toggle' mode.

    // Or just make the general one, have it hold maybe more data than strictly needed, but get algorithms working quick in
    //  a more standard way at first.


    // Probably want to start with something idiomatic for this...
    
    // want to copy whole other pb to a pos.
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


    // to_1bipp
    // threshold to 1bipp???

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


    // greyscaling...
    to_8bipp() {
        const bipp = this.bits_per_pixel;


        if (bipp === 1) {
            const res = new this.constructor({
                size: this.size,
                bits_per_pixel: 8
            })
            // 0 or 255 for all values...

            // set_pixel_by_index should work...?

            let i_px = 0;

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
                    const color = this.get_pixel_by_idx_1bipp(i_px) === 1 ? 255 : 0;
                    res.set_pixel_by_idx_8bipp(i_px++, color);
                }
                i_byte++;
                // pixel by pixel... not as efficient this way.
            }

            return res;




        } else if (bipp === 8) {
            return this.clone();
        } else if (bipp === 24) {
            console.trace();
            throw 'NYI';
        } else if (bipp === 32) {
            console.trace();
            throw 'NYI';
        }


        // Could make greyscale of higher bipp images.

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

            // Greyscale.
            //  Simple algotithm being going through the ta and writing 3 pixels of the value for each of the 1 pixels.

            const ta_res = res.ta;

            const ta = this.ta, l = ta.length;

            // check that the res ta is 3 times longer.... ? (or assumue it is)

            let pos_w = 0, c = 0;

            for (c = 0; c < l; c++) {
                ta_res[pos_w++] = ta[c];
                ta_res[pos_w++] = ta[c];
                ta_res[pos_w++] = ta[c];
            }

            // r, g, b all the same.
            //console.trace();
            //throw 'NYI';



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

            console.trace();
            throw 'NYI';

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

    // Likely want idiomatic version sooner...
    //  This seem perf enhanced, not core.
    //  Want idiomatic functions at the next level.
    //   Though maybe this is fine / best here.
    //   Or maybe it's perf-core even?

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


    // to_cropped?
    //  just self cropping would make more sense.
    //   again, could have reference implementation as well as optimised ones.

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
        console.trace();
        throw 'NYI';
    }
    // couldn't we do a simpler for loop throughout the length.

    // Could use a for loop looping through pixel indexes elsewhere.

    // A generator function may be better syntax.

    each_pixel_byte_index(cb) {
        // Only for byte indexes.
        //   Will need other code for 1 bipp.

        const {bipp} = this;
        let ctu = true;

        const stop = () => ctu = false;

        if (bipp === 8) {
            const buf = this.buffer, l = buf.length, bpp = this.bytes_per_pixel;
            for (let c = 0; ctu && c < l; c += bpp) {
                cb(c, stop);
            }
        } else if (bipp === 24) {
            const buf = this.buffer, l = buf.length, bpp = this.bytes_per_pixel;
            for (let c = 0; ctu && c < l; c += bpp) {
                cb(c, stop);
            }
        } else if (bipp === 32) {
            const buf = this.buffer, l = buf.length, bpp = this.bytes_per_pixel;
            for (let c = 0; ctu && c < l; c += bpp) {
                cb(c, stop);
            }
        } else {
            console.trace();
            throw 'NYI';
        }


        
    }

    // then will want to do translations on pixel indexes.
    //  can have a translation list.
    //  pixel pos list used as offsets
    //  index array rather than pixel pos list too.

    // Could make shorter and more general version.
    //  Should put that in the idiomatic class.
    


    // Efficient Tensor processing could be used for this, in another version.

    // pos and subpos with 1bipp? or have intervals on 0.125.???

    // Shuld return the color too?

    // Accept the pos ta as an option?
    //  So it does not need to call the cb function with it, saving allocation???

    // Will go for more flexibility as well as optimization.

    /*
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
    */

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

    // specialised each_pixel.
    //  maybe its a perf focused enh even?
    //  or perf focused core?

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


    // no need for the ta px value.
    //  could ignore it, or use the first item in the array.

    // Being able to read / process 64 pixels at once will be very helpful for some 1bipp instructions.
    //  Would be able to process contiguous blocks of the same color quicker.
    // Only worth doing that when there are 64 or more pixels left in the line.
    //  Could do bitwise ops to read from a 64 pixel block?
    //  



    // A local variable rather than ta_px_value could work better.

    // Better if it uses scratch tas from the advanced typed array properties.
    each_ta_1bipp(ta_pos, ta_px_value, ta_info, callback) {
        // worth doing an x and y loop?
        //  and then also do integer incrementing

        // Can we set details of the array view for the ta px value?
        //  Lets copy the pixel values for the moment.

        // ~ (NOT) BigInt(0) to get it as all 1s.

        const bipp = this.bipp;
        if (bipp === 1) {

            // do get_pixel etc.

            const [w, h] = this.size;
            //let pos = new Array(2);
            // maybe allow pos overwriting???

            //BigInt.

            //let px = 0 | 0;

            for (ta_pos[1] = 0; ta_pos[1] < h; ta_pos[1]++) {
                for (ta_pos[0] = 0; ta_pos[0] < w; ta_pos[0]++) {
                    const px = this.get_pixel_1bipp(ta_pos);
                    //console.log('px', px);
                    ta_px_value[0] = px;
                    //console.log('ta_pos', ta_pos);
                    callback(px, ta_pos);
                }
            }

        } else {
            throw 'each_ta_1bipp error: bipp must be 1, bipp: ' + bipp;
        }
    }

    // each x_on_span 1bipp would be useful.

    // Byte by byte processing would be quite effective.
    // Not sure if making 8 byte processing at this stage would be better though.
    // 8 bytes at once may be best to use in some circumstances.
    // Easily check if they are the minimum (0) or maximum// _64_1s constant maybe.


    // Only want to use the algorithm that looks at bigints when it's at least 8 pixels wide?
    //  Or possibly wider. We want to pick up on longer contiguous blocks of the same value.
    //  Could break them down into half-bytes.

    




    each_px_on_1bipp(ta_pos, ta_px_value, ta_info, callback) {


        // And could we have a faster version that can move through multiple (ie 64) pixels at once.
        //  Want to quickly process blocks of pixels on or off. Blocks of pixels off could be skipped many at once.

        // worth doing an x and y loop?
        //  and then also do integer incrementing

        // Can we set details of the array view for the ta px value?
        //  Lets copy the pixel values for the moment.

        // Faster when moving through the typed array.

        // Can get faster when skipping many pixels at once.


        // iterate through the ta bytes...
        //  be able to identify blocks of 8 pixels 



        const bipp = this.bipp;
        if (bipp === 1) {

            // do get_pixel etc.

            const [w, h] = this.size;
            //let pos = new Array(2);
            // maybe allow pos overwriting???

            for (ta_pos[1] = 0; ta_pos[1] < h; ta_pos[1]++) {
                for (ta_pos[0] = 0; ta_pos[0] < w; ta_pos[0]++) {
                    //const px = this.get_pixel_1bipp(ta_pos);
                    //console.log('px', px);

                    // Faster still with 1 | 0 ... ???
                    //if (px === 1 | 0) {
                    if (this.get_pixel_1bipp(ta_pos) === 1 | 0) {
                        //ta_px_value[0] = px;
                        //console.log('ta_pos', ta_pos);
                        callback(1 | 0, ta_pos);
                    }
                }
            }

        } else {
            throw 'each_ta_1bipp error: bipp must be 1, bipp: ' + bipp;
        }
    }
    //  


    // each_px_ta_...


    // Or some code in some place for possible retirement?

    // Maybe could do with simpler default version of this.
    //  This maybe even seems like a specialised-enh piece of code rather than core.
    //  Probably better to have things in the idiomatic layer, making use of the advanced typed array properties rather than
    //   requiring them as parameters.
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


    // May be a good way to write 'objects'?
    //  Though a faster, more optimised way to copy bitmap data over may work better.


    

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

    // 


    // Or it's reading them wrong elsewhere????




    // The bit should simply be the remainder, not subtracting 7 from it?
    //  May really want to deal with bits incrementing from 0 to 7, I think that is big endian?
    //  The bitmap logic is big endian.




    

    // or better to calculate it into an existing typed array?
    'get_pixel_byte_bit_1bipp'(pos) {
        const idx = pos[1] * this.size[0] + pos[0];

        const byte = idx >> 3;

        // definitely subtract from 7?
        //  or that's the memory bit, not the logical bit.

        const bit = (idx & 0b111);
        //  not so sure we need the '7 -'

        return {byte, bit};
    }



    // Maybe this is specialised rather than core???


    'get_pixel_byte_bit_BE_1bipp'(pos) {
        const idx = pos[1] * this.size[0] + pos[0];

        const byte = idx >> 3;

        // definitely subtract from 7?
        //  or that's the memory bit, not the logical bit.

        const bit = (idx & 0b111);
        //  not so sure we need the '7 -'

        return {byte, bit};
    }

    'set_pixel_on_1bipp'(pos) {
        const idx = pos[1] * this.size[0] + pos[0];

        const byte = idx >> 3;
        const bit = (idx & 0b111);


        this.ta[byte] = this.ta[byte] | (128 >> bit);
    }


    'set_pixel_1bipp'(pos, color) {
        // Simpler / faster to directly set the color?
        //  May indeed need different logic depending on if the pixel is on or off.
        //  Using the (same?) mask differently to 


        /*


        const val = !!color;
        const idx = pos[1] * this.size[0] + pos[0];

        const byte = idx >> 3;
        const bit = 7 - (idx & 0b111);

        //const byte = Math.floor(idx / 8);
        //const bit = 7 - (idx % 8);
        if (val === true) {
            this.ta[byte] = this.ta[byte] | (1 << bit);
        } else {
            this.ta[byte] = this.ta[byte] & (~(1 << (bit))) & 255;
        }

        */
        const idx = pos[1] * this.size[0] + pos[0];

        const byte = idx >> 3;
        const bit = (idx & 0b111);

        // not working quite right trying big endian


        if (color === 1) {
            this.ta[byte] = this.ta[byte] | (128 >> bit);
        } else {
            this.ta[byte] = this.ta[byte] & (~(128 >> bit)) & 255;
        }




        //console.log('b) this.ta[byte]', this.ta[byte]);
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

        this.ta[byte] = color[0];
        this.ta[byte + 1] = color[1];
        this.ta[byte + 2] = color[2];
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

        this.ta[byte] = color[0];
        this.ta[byte + 1] = color[1];
        this.ta[byte + 2] = color[2];
        this.ta[byte + 2] = color[3];
    }
    'set_pixel_by_idx_1bipp'(idx, color) {

        throw 'stop';
        const byte = Math.floor(idx / 8);
        const bit = 7 - (idx % 8);
        const val = !!color;


        // or do it from the left? BE?

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

        //let ta_pos, ta_color, grey_color;

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
        } else {
            console.trace();

            throw 'unsupported bipp: ' + bipp;
        }
    }


    // Maybe should be higher level.

    // core, ?, enhanced?


    // May be worth having the lowest level functions.
    //  Then some more functions in the core.


    'get_pixel_by_idx_1bipp'(idx) {

        /*

        const idx = pos[1] * this.size[0] + pos[0];

        const byte = idx >> 3;
        const bit = (idx & 0b111);

        */

        //throw 'stop';
        //const byte = Math.floor(idx / 8);

        const byte = idx >> 3;
        const bit = (idx & 0b111);

        //const bit = (idx % 8);

        //console.log('bit', bit);

        // Change this so it's BE???

        //const pow = Math.pow(2, bit);
        //console.log('pow', pow);

        // This seems to fix the endianness at least.
        //  Maybe could optimise more.

        const pow = 128 >> bit;

        // 

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


    // Could see about overwriting the functions when bipp changes.

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
        
        // this.bytes_per_row * y perhaps?
        //  then add the x * 4?

        const idx = pos[1] * this.size[0] + pos[0];
        const byte = idx * 4;

        return this.ta.slice(byte, byte + 4);
    }

    'get_pixel'(pos) {
        //console.log('get_pixel pos', pos);
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


    // get_channel
    //  to_single_channel_pb perhaps.

    // Choose which channel...
    //  then could rapidly iterate through the pb extracting that channel.



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
        let buf1 = this.ta;
        let buf2 = other_pixel_buffer.ta;
        // Compare the colorspace too...?

        const other_colorspace = other_pixel_buffer.ta_colorspace;
        const my_colorspace = other_pixel_buffer.ta_colorspace;

        if (my_colorspace.length === other_colorspace.length) {
            if(my_colorspace.every((val, i) => val === other_colorspace[i])) {

                if (buf1.length === buf2.length) {
                    return buf1.every((val, i) => val === buf2[i]);
                } else {
                    
                }

            } else {

            }
        }
        return false;

        
    }

    // Maybe look into pixel_pos_list in more detail.
    // But an xspans or xonspans list may work (much) better.
    //  Perhaps we only need them (in some cases) for sequential access.
    //  Reading and writing them sequentially could help a lot for copying.

    //  Or could get them in that format, then put them into a more flexible format for modification.




    // May be better to do a rapid iteration using those pixel positions?
    //  Though no doubt this has a specific purpose

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


    // Seems like a good function for placing 1bipp pbs....




    // Do an 'or' placement???
    //  Seems the way when placing some 1bipp pbs in some cases.

    // 

    'draw_1bipp_pixel_buffer_mask'(pb_1bipp_mask, dest_pos, color) {

        // Universial bipp non-optimised version may be best / easiest here.
        //  Want fastest versions of this and other functions.

        //console.log('draw_1bipp_pixel_buffer_mask');
        // The xspans implementation should be a lot faster.
        //  Using xpans on.

        // Copy lines....

        // More rapid reading of the buffer mask - contiguous xspan lines.
        // Will then be able to write lines like that more rapidly.

        // iterating through x_on_spans would help a lot to write these quickly.

        // Can the 1bipp buffer mask be made so that its bytes line up with this (for all rows), for faster operations?





        // Could have an inline set_pixel implementation.
        // Could iterate the source bit by bit...

        // Or lines, reading 64 bit blocks at some point...?





        // Inline getpixel / setpixel system...?

        // Could do a while loop with updating of indexes...

        // Reading 64 (or 8) pixels at once would provide a very decent speed improvement in many places.





        const iterate_set_pixel_implementation = () => {

            console.log('  iterate_set_pixel_implementation');

            const pb_source = pb_1bipp_mask;

            //console.log('pb_source.meta', pb_source.meta);

            const ta_pos = new Int16Array(2);
            const ta_px_value = new Uint8ClampedArray(3);

            // make general int info array support +-? Better able to hold (memory) offsets that way.
            const ta_info = new Uint32Array(4);
            const px_dest_pos = new Uint16Array(2);

            // each_px_on_offsetted_1bipp perhaps?
            //  

            // A version with an offset as well?

            // Different loops for different bit per pixel values?

            const {bipp} = this;

            if (bipp === 1) {

                // Maybe no need for ta_px_value, ta_info (or ta_pos?)
                
                pb_source.each_px_on_1bipp(ta_pos, ta_px_value, ta_info, (mask_px_color, pos) => {
                
                    //const px_dest_pos = [pos[0] + dest_pos[0], pos[1] + dest_pos[1]];
                    px_dest_pos[0] = pos[0] + dest_pos[0];
                    px_dest_pos[1] = pos[1] + dest_pos[1];

                    //px_dest_pos[0] = ta_info[0] + dest_pos[0];
                    //px_dest_pos[1] = ta_info[1] + dest_pos[1];
    
                    //console.log('px_dest_pos', px_dest_pos);
                    this.set_pixel_on_1bipp(px_dest_pos);
                });
            } else {
                pb_source.each_px_on_1bipp(ta_pos, ta_px_value, ta_info, (mask_px_color, pos) => {
                
                    //const px_dest_pos = [pos[0] + dest_pos[0], pos[1] + dest_pos[1]];
                    px_dest_pos[0] = pos[0] + dest_pos[0];
                    px_dest_pos[1] = pos[1] + dest_pos[1];
    
                    //console.log('px_dest_pos', px_dest_pos);
                    this.set_pixel(px_dest_pos, color);
    
                });
            }

            
        }

        // The xspans need further work / optimisation.

        // iterate xspans and write them immediately...?

        // Could work on more rapid reading of these xspans into an array...

        // The implementation using x spans (on) would rely on some faster underlying xspans processing / reading code.
        // This could be able to use bitwise OR on many (64) pixels at once, when aligned properly.
        // Could make each row have 64*n pixels width, for easiest and fastest alignments.
        //  Will then need to cover that case.
        //  For the moment, let's do large reads (and writes?) where we see that it is possible.




        // Should be a considerably / much faster implementation.

        // Is this failing on very small image sizes???
        //  Rows starting and ending in the same byte?
        //   Should be ok....
        //   But may need to double-check.


        // This implementation is quite a lot faster on images I have tried (such as 4000x4000 Italy map)
        const arr_on_xspans_implementation = () => {

            // Seems not to be working right....
            const arr_rows_arr_on_xspans = pb_1bipp_mask.calculate_arr_rows_arr_x_on_spans_1bipp();

            // then can write them all as horizontal lines...
            // Also want to look into optimised byte aligned and 8 byte at once implementations.

            //console.log('arr_on_xspans', arr_on_xspans);
            const [width, height] = pb_1bipp_mask.size;

            const {bipp} = this;

            // then go through them....

            //console.log('arr_rows_arr_on_xspans', arr_rows_arr_on_xspans);
            // All empty, in some situation(s).
            //  Not quite sure why doing this mask on an empty shape happens.

            // Going through the height of the x spans on....

            // A special case where this is 1bipp?
            // Otherwise, need to use different (and likely less optimised) horizontal line drawing.


            if (bipp === 1) {
                if (color === 1) {
                    let y = 0;
                    let [dest_x, dest_y] = dest_pos;
                    for (y = 0; y < height; y++) {
                        const arr_row_xspans_on = arr_rows_arr_on_xspans[y];
                        if (arr_row_xspans_on.length > 0) {
                            //console.log('** arr_row_xspans_on', arr_row_xspans_on);
                            //console.trace();
                            //throw 'stop';

                            // go through each of them, 

                            for (const xonspan of arr_row_xspans_on) {
                                // write the horizontal line...

                                //console.log('[xonspan[0], xonspan[1], y]:', [xonspan[0], xonspan[1], y]);

                                // then should be able to draw them quickly.

                                // needs to add the appropriate offset
                                xonspan[0] += dest_x;
                                xonspan[1] += dest_x;

                                // This only works if this is 1bipp.
                                //  Need to do draw_horizontal_line of the right color.

                                this.draw_horizontal_line_on_1bipp(xonspan, y + dest_y);
                            }
                        }
                    }
                } else {

                    console.log('color', color);
                    console.trace();

                    throw 'NYI';
                }

                
            } else {

                // use draw_horizontal_line function instead....

                let y = 0;
                let [dest_x, dest_y] = dest_pos;
                for (y = 0; y < height; y++) {
                    const arr_row_xspans_on = arr_rows_arr_on_xspans[y];
                    if (arr_row_xspans_on.length > 0) {
                        //console.log('** arr_row_xspans_on', arr_row_xspans_on);
                        //console.trace();
                        //throw 'stop';

                        // go through each of them, 

                        for (const xonspan of arr_row_xspans_on) {
                            // write the horizontal line...

                            //console.log('[xonspan[0], xonspan[1], y]:', [xonspan[0], xonspan[1], y]);

                            // then should be able to draw them quickly.

                            // needs to add the appropriate offset
                            xonspan[0] += dest_x;
                            xonspan[1] += dest_x;

                            // This only works if this is 1bipp.
                            //  Need to do draw_horizontal_line of the right color.

                            this.draw_horizontal_line(xonspan, y + dest_y, color);
                        }
                    }
                }



            }


            

            //throw 'stop';

        }

        



        return arr_on_xspans_implementation();


        //return on_xspans_implementation();

        // Could make an inline or multiple inlint iterate set pixel implementations.

        //return iterate_set_pixel_implementation();
        //return arr_on_xspans_implementation();


        

    }

    // Maybe more like 'draw' or 'paint' image if it's 1bipp pb being drawn on a higher bipp pb?

    // Has a few more optimisations now - but may want to consider different overall ways of doing this.
    //  Drawing horizontal lines could be a lot faster.

    // 'on_xspans' may be the better way to do this.



    
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
            'buffer': new this.buffer.constructor(this.buffer)
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
        } else if (this.bytes_per_pixel === 3) {
            const res = new this.constructor({
                'size': this.size,
                'bits_per_pixel': 8
            });
            if (this.pos) res.pos = this.pos;
            const bres = res.buffer;
            // Then go over each of this pixel
            //  take average rgb values
            let i = 0;
            this.each_pixel((pos, color) => {
                bres[i++] = Math.round((color[0] + color[1] + color[2]) / 3);
                //i++;
            });
            return res;
        } else if (this.bytes_per_pixel === 4) {
            const res = new this.constructor({
                'size': this.size,
                'bits_per_pixel': 8
            });
            if (this.pos) res.pos = this.pos;
            const bres = res.buffer;
            // Then go over each of this pixel
            //  take average rgb values
            let i = 0;
            this.each_pixel((pos, color) => {
                bres[i++] = Math.round((color[0] + color[1] + color[2]) / 3);
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
            let i = 0, new_v;
            this.each_pixel((pos, v) => {

                //new_v = v === 1 ? 255 : 0;

                bres[i++] = v;
                bres[i++] = v;
                bres[i++] = v;
                bres[i++] = 255;
                //i++;
            });
        } else {
            console.trace();
            throw 'NYI';
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


    // Make use of this in more than 1 flood fill operation - flood filling from the boundaries.
    //  Flood fill from boundaries can work on this image representation.
    //  Can determine which of them are on the outer boundary.
    //  And could fill them all in in this representation.



    // Should have parameters different way around....

    // This core seems like the place for some more optimised horizontal line drawing algorithms.

    // Horizontal line drawing - may be able to accelerate it in some ways...
    //  Inlining everything could work reasonably well, it can be quite simple.




    //'draw_horizontal_line_on_1bipp'(y, [x1, x2]) {

    // This is a reasonably good speed.
    // Could write pixels in a faster way probably, but this is reasonably good for now.


    'draw_horizontal_line_24bipp'(xspan, y, color) {
        // Aware the xspan is inclusive! ????? (or not???)
        //  As in, 0,0 is 1 pixel wide. 0,2 would actually span 3 pixels (0, 1, 2). 
        //console.log('[xspan, y, color]', [xspan, y, color]);
        const [x1, x2] = xspan;
        
        // Use a pixel writing position local variable.
        // Write [r, g, b] sequentially, incrementing that writing position variable.

        // idx_start_byte
        const {ta} = this;

        const [width, height] = this.size;

        // idx_byte_of_last_color (start byte of last color)

        const start_pixel_idx = width * y + x1;
        //const end_pixel_idx = width * y + x2;

        // fo a loop through those pixel indexes - but will need to make use of bit indexes too.

        const [r, g, b] = color;

        let w = start_pixel_idx * 3;

        //console.log('1) w', w);

        for (let x = x1; x <= x2; x++) {
            ta[w++] = r;
            ta[w++] = g;
            ta[w++] = b;
        }
        //console.log('2) w', w);
        
    }

    // draw_xspan possibly?
    'draw_horizontal_line_32bipp'(xspan, y, color) {
        // Aware the xspan is inclusive! ????? (or not???)
        //  As in, 0,0 is 1 pixel wide. 0,2 would actually span 3 pixels (0, 1, 2). 
        //console.log('[xspan, y, color]', [xspan, y, color]);
        const [x1, x2] = xspan;
        
        // Use a pixel writing position local variable.
        // Write [r, g, b] sequentially, incrementing that writing position variable.

        // idx_start_byte
        const {ta} = this;

        const [width, height] = this.size;

        // idx_byte_of_last_color (start byte of last color)

        const start_pixel_idx = width * y + x1;
        //const end_pixel_idx = width * y + x2;

        // fo a loop through those pixel indexes - but will need to make use of bit indexes too.

        const [r, g, b, a] = color;

        let w = start_pixel_idx * 4;

        //console.log('1) w', w);

        for (let x = x1; x <= x2; x++) {
            ta[w++] = r;
            ta[w++] = g;
            ta[w++] = b;
            ta[w++] = a;
        }
        //console.log('2) w', w);
        
    }

    // it's really drawing an xspan
    'draw_horizontal_line'(xspan, y, color) {
        const {bipp} = this;
        if (bipp === 1) {
            console.trace();
            throw 'NYI';
        } else if (bipp === 24) {
            return this.draw_horizontal_line_24bipp(xspan, y, color);
        } else if (bipp === 32) {
            return this.draw_horizontal_line_32bipp(xspan, y, color);
        } else {
            console.trace();
            throw 'NYI';
        }

    }
    
    // Possibly specialised code.
    //  Specialised core???

    // Or perf focused?
    //  It's a very specific case too though... possibly specialised.
    //  It's perf focused really.

    // Likely could make a (much) more optimised fn to calculate these.


    // Option to include the y values?

    // ???


    // calculate_arr_row_x_on_x2yspans_1bipp
    //  Could just be 3 values together.

    // Maybe lower level implementation could return values from a typed array.



    // calculate_arr_row_x_off_x2yspans_1bipp


    // x2y format could be more effective.


    // This function has got to take a little while.
    //  Could there be a way using bitwise operations to go through the bytes working out how many more pixels to add to the span as it is being built?

    // Algorithms using really fast scanning of the array.
    //  Maybe even using bigint?
    //  Returning data that's all in a typed array (and maybe class to access that data with good syntax?)
    // Or just have 4 items in the array - x1, x2, y, other?





    // Can see about a faster binary row reading system.
    //  For each row (y), find the start and end bit indexes (pixel indexes)
    //   work out which byte and bit within each byte for the start and end of the row.
    //   then use some kind of const 'magic' logic.
    //    Once we have the bit, could check to see if it's the only one in the byte.
    //     Or could check if there is a contiguous block of on until the end of the byte.
    //     likely to be like 00100000
    //                    or 00111111    (and then could assume its likely to continue with 1 bytes, can check for them)

    // Array buffer reading of multiple (such as 8) bytes at once could help a lot here too.




    //      Could check them both as accelerated paths when we have a bit on in the 3rd position (indexed from left from 1), 2nd position indexed from 0 as we will.
    //  Could have quite a lot of constants / magic numbers within the if statements.

    // Could / should x spans be specified in a more normal way?
    //  eg 0,1 being 1 pixel wide?
    //  It may make the find overlaps logic a little trickier?
    //   Or need to have the logic for it interpreting it as really going to x2-1.

    // A class that particularly deals with x spans (even x spans on) could be really useful.


    * 'iterate_arr_row_x_on_spans_1bipp'(y) {

    }



    // Iterate through all xspans (off and on)

    // [x1, x2, y, color] or cb(x1, x2, y, color)
    //  or when on or off is specified just cb(x1, x2, y);
    // When iterating through them, may want to put them into a larger ta that contains many of them.




    // iterate_arr_row_x_off_spans_1bipp


    // iterate_row_xspans_1bipp




    // Iterating through such arr_row_x_off_spans may be useful.
    //  Could always return the y value because the y value will be needed when dealing with more than 1 row, which we often will be.
    //  Though, it could perhaps read more condensed row-specific xspans data into a data structure that also stores all the y values.
    //   Leaving out y values could be a decent part of compression when the y values are known / indicated elsewhere.


    // and x2yc format too?

    // arr_row_x_off_spans_x2y

    // iterate_row_x_off_spans_x2
    //  just the x values.

    // And a yet more optimised way to count them???
    //  There may well be some binary operations that will do this for many pixels at once (ie 64) and counting the number of shifts within it.
    //  Byte or even 8 byte alignment would be essential for some SIMD-like operations.
    //  Just counting the number of such spans within a line (very quickly) would help to work out how large some typed arrays would need to be.
    //   May work better investing in some more dynamic data structures.


    // Do need to pay some more attention to the optimised filled drawing algorithm.
    //  An inlined draw polygon algorithm?
    //   Be careful about inlining too much before the byte/bit alignment system is set up.
    //   Could introduce padding bits / bytes at the (beginning of and) end of rows.
    //    Would enable much faster copying over of data???
    //     Using bitwise OR.

    // May be worth advancing existing copy (read and draw) algorithms further.
    //  Could see about re-aligning lines (as they are read).
    //  May have some fast lower level bitwise ops algorithm that does it.

    // Definitely want to get into how things can be copied / drawn as fast as possible.

    // Some further low level optimised classes could help a lot.
    // Representation of a 1bipp image as xon or xoff spans.
    //  Operations on such an image (like pb) that draw pixels / lines.
    //   However, would deal in terms of x spans.
    //    May create new ones, extend / shrink old ones / join them together / separate them apart.
    //    Could be very efficient indeed in terms of requiring few operations to draw a filled polygon.
    //     Then see about more efficient copying it to a pixel_buffer.















    //  Possibly use different underlying algorithms.
    //  Possibly optimise / inline them.


    // Want some gradual improvements to start with...
    // Though the xonspan image format could be very effective.
    //  Each line could itself be a linked list of spans.
    //  May need a rather elaborate data structure that internally uses a small number of tas.
    //   Can see how quickly it can do some specific operations.


    // Maybe a more general low level xspans implementation.
    //  Consider one which can only be sequentially built.
    //  Then consider a more dynamic one that allows for spans to be inserted and removed.
    //  Each row being its own linked list of xspans.
    //   Would allow for faster modification of data held in any row.
    //    Seems like this or better would be essential for drawing polygons.
    //     Linked list should be efficient enough for most polygons. B+ tree would be more efficient for more complex polygons.

    // Being able to read any row as xspans quickly.
    // Accessing all of the rows together in this format
    //  Held within one large typed array for efficiency.
    //  A B+ tree / ordered list holding all of the spans seems like the best option.
    //   B+ tree would help providing them with random access.
    //  xstart, length seems like it may be the easiest format.
    //   Just need to consider possible format differences when considering overlaps.
    // 

    // Having each row start on a byte could help a lot.
    //  Some other tricks to change alignments could help.
    //  Then could do some more rapid 64 bit OR operations.
    //  Could see about rapidly realigning a line...
    //  Or things like calculations of bit indexes from xspans.
    //   Could get more precise or meta about which items to set and where.

    // Shifting lines to the left or right by pixels...
    //  May take 2 (mask + shift) operations per 64 bit value.

    // Could see about some simpler algorithms.
    //  Though the system of offsets and possibly row realignment could maybe be necessary for that.

    // A B+ tree kind of is an arrangement of many linked lists.

    // X_Span_Image

    // x-span-image-core?
    // x-span-image-reference-implementation ???
    // x-span-image-array-reference-implementation
    //  could set the API and have a not as algorithmically fast internal implementation.
    //   though really want to use typed arrays from the start.
    //    may have some slightly tricky sorting algorithms?
    //    or a somewhat more complex linked-list or B+ tree structure to keep them sorted from the start.
    //    A linked list implementation will be fast enough for most 
    //  Could make an interface with a lot of proxy access to typed arrays.










    // x-span-image-base could be a decent base class that has the methods (maybe don't do anything, could raise an error)
    //   throw 'Subclass needs to implement the method: [method_name]'

    // methods such as draw_polygon, draw_line
    //  could use generic code that makes use of only set_pixel.
    //   it would greatly rely on the speed of set_pixel.
    //    Should be reasonably fast - but bear in mind flood fills will specifically interact with spans and contiguous groups of them.

    // The x spans will be the raw data type.
    //  As if each of them is a pixel.
    //   Effectively it's wide pixels.
    //   Maybe should implement this in Pixel_Buffer after all?
    //    Could add another channel - number of pixels wide.

    // Worth considering adding more flexibility to Pixel_Buffer.
    //  Making a website that explains and maybe demos it could help a lot in the process too.

    // jsgui3-pixel-buffer-doc?
    //  Also focus on generating documentation files from source, editing the documentation with ammendments?













    // x-span-image
    //  would have a compatible API with pixel_buffer (in many ways) but would hold the image in terms of multiple x spans.
    //  May want to use a customised typed array.
    //   Possibly a few convenience classes for very fast access to typed arrays.

    // Want to benchmark some really simple operations.
    //  Will try some things with iterators as well as callback functions.
    //  See which are quicker. Could benchmark them.









    


















    












    

    // Possibly even specialised?
    //  Or core specialised even?
    // Possibly just 1bipp?
    //  Does seem more perf focused than core or idiomatic.
    


    // And also be able to get them for all rows, in one long array.
    //  Even in one long typed array?
    
    // Even see about using a different drawing mode that modifies the xspans?
    //  Could try that optimisation later on?
    //   Have it switchable as to whether the (difinitive) image is represented in the xspans or in the ta...
    //    And when the ta is requested, if there are updates that need to be drawn to it, then draw them
    //     (or may be better just to recreate the whole ta from the xspans data)
    //  Or do track modifications / operations since the last sync (either way?)

    // Pixel_Buffer not actually being represented as a buffer of pixel values may be moving out of this control's focus.
    //  Though if it could appear as a pixel buffer, and provide one when needed, while working in a more optimal underlying format, it could
    //   be very efficient indeed and within a convenient API.

    // Counting the xspans from the pb (as fast as possible) could help a lot.
    //  Then could more easily make the ta to hold them.
    //  Or make appropriately sized / estimated tas to hold the xpans x2y or x2yg (incl group) format.
    //  x2ygb x1 x2 y group boundary

    // These all in a fairly large ta could enable very fast access for them.
    //  Will want to discover groups.
    //  Would then need to modify algorithm that iterates 2 rows at once....
    //   Iterate between rows, with the important values being used to find which are intersecting
    //    (use them to make the links between 'above' and 'below')

    // Maybe could have fast algorithmic reading using binary search of which are above and below.
    //  Could be faster than creating and using the dynamic lists?
    //   The data is already there in a way that can be accessed very fast with ints, prob worth doing it that way, def worth trying.

    // Or storing the lists of links in another typed array?
    //  Would be harder to build it dynamically though.
    //  Maybe could put together a ta on 1 pass saying how many links above and below there are in various cases.....

    // Fast getting of any above or below through fast binary search algorithm in the ta could be very effective.


    // draw_1bipp_pixel_buffer_mask can be sped up with better use of xspans.

    // Could even iterate over xspans?
    //  Though may want the groups already calculated.




















    // Defaulting to xspan ons?

    // For some operations we want only the 'on' or 'off' pixels.


    // 


    get xspans() {
        // Maybe this should include info on the xspans' groups.
        //  

        // This will be a more advanced API for dealing with it.
        //  Possibly return an XSpans object?

        // XSpans object (general type) should include both on and off pixels.




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
