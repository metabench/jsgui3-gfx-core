// Simple enough... can add pixels, can iterate through the pixels.
//  Would be good to .to_pixel_buffer?

// Getting lists of pixel positions when extracting regions would be a nice optimization over bit masks that use 8 bpp.
//  Will support 1 bipp properly. 0.125bypp.
//  While this is 32bpp, it's only specific pixels.


// can keep cached tas?
//  if we use the pos list instantly.

// I think dynamic expansion looks best.

// only on the server?
const inspect = Symbol.for('nodejs.util.inspect.custom');


const Ui16toUi32 = (ui16) => {
    let res = new Uint32Array(ui16.length / 2);
    let dv = new DataView(ui16.buffer);
    let l = ui16.length;
    let hl = l / 2;
    //console.log('l', l);
    //console.log('hl', hl);
    let resw = 0;
    for (let c = 0; c < hl; c++) {
        //console.log('c', c);
        res[resw++] = dv.getUint32(c * 4);
    }
    //console.log('res', res);
    return res;
}

const Ui32toUi16 = (ui32) => {
    let res = new Uint16Array(ui32.length * 2);
    let dv = new DataView(ui32.buffer);
    let l = ui32.length;
    //let dl = l * 2;
    //console.log('l', l);
    //console.log('dl', dl);
    let resw = 0;
    for (let c = 0; c < l; c++) {
        //console.log('c', c);
        //console.log('dv.getUint16(c)', dv.getUint16(c * 4 + 2));
        //console.log('dv.getUint16(c)', dv.getUint16(c * 4));

        res[resw++] = dv.getUint16(c * 4 + 2);
        res[resw++] = dv.getUint16(c * 4);
        //res[resw++] = dv.getUint16(c * 2 + 1);
        //res[resw++] = dv.getUint16(c * 2);
    }
    //console.log('res', res);
    return res;
}
class Pixel_Pos_List {

    [inspect]() {
        return this.toString();
    }

    toString() {
        const res = 'PPL ' + JSON.stringify({
            length: this.length,
            pixels: this.str_pixels
        });
        return res;
    }

    // Good for mapping smaller/medium regons within larger images. Different to a mask.
    constructor(spec) {
        // needs to be able to have more pixels added.
        //  For the moment, will be able to hold 10 million pixels
        //const capacity = 2 * 1024 * 1024;
        //const capacity = 0.1 * 1024 * 1024;

        // current capacity * 10 when expanding.
        const capacities = new Uint32Array([16, 1024, 1024 * 1024 / 8, 1024 * 1024 / 2, 1024 * 1024 * 2, 1024 * 1024 * 8]);
        //console.log('capacities', capacities);
        let i_capacity = 0;
        let capacity = capacities[i_capacity];
        let max_index = capacity * 2 - 1;
        // Could start with much lower capacity and increase it if necessary.
        let i = 0;
        //let num_pixels = 0;
        let ta_pixels = new Uint16Array(capacity * 2);

        let read_pos = 0;

        // Want to be able to do shift
        //  Read pixel from the front.
        //  reduce the length
        //  move the read index forward
        //   not change the array itself.

        // Non-recursive merge sort would be the best type of sort that can apply.
        //  It works out how many stages there are.
        //  Keeps a full typed array or two to store the array as its being merged.
        //   Knows which positions things go into.

        // Will split up the array into different segments.
        //  Want to go through the array, making the necessary comparisons, and putting them into the right place.

        // Each time, split the array in half.
        //  However, really want to work out the numbers to process it, and then have the typed arrays themselves getting processed according to that logic.

        // Work out how many steps it will take...

        // Create the variables for the steps / the control structure.
        //  Could do this by swapping between different arrays and copying into them.

        this.sort = () => {
            let ui32 = Ui16toUi32(ta_pixels);
            ui32.sort();
            ta_pixels = this.ta = Ui32toUi16(ui32);
            return this;
        }

        this.shift = () => {
            if (read_pos < i) {
                const res = ta_pixels.slice(read_pos, read_pos + 2);
                read_pos += 2;
                return res;
            }
            // but that should shorted the each_pixel even.
            //  should be removed when the array / list is restructured.

            // Need to read it from its read pixel when doing each_pixel.
        }



        // Could start out with a smaller ta_pixels.
        //const ab = 
        // want to be able to iterate through the pixels.
        // want to be able to add pixels.
        this.ta = ta_pixels;
        this.add = (pos) => {
            //console.log('pos', pos);
            if (i > max_index) {

                // Could check to see if the array can be shortened.
                // same capacity, but move it forward.

                if (read_pos >= 1024) {
                    const new_ta = new Uint16Array(capacity);
                    const l = ta_pixels.length - read_pos;
                    for (let c = 0; c < l; c++) {
                        new_ta[c] = ta_pixels[c + read_pos];
                    }
                    ta_pixels = new_ta;
                } else {
                    capacity = capacities[++i_capacity];
                    max_index = capacity * 2 - 1;
                    // need to increase the capacity.
                    // need to copy over the new TA.

                    const new_ta = new Uint16Array(capacity * 2);
                    const l = ta_pixels.length;
                    for (let c = 0; c < l; c++) {
                        new_ta[c] = ta_pixels[c];
                    }
                    ta_pixels = new_ta;
                }
                //throw 'stop';
            } else {

            }
            ta_pixels[i++] = pos[0];
            ta_pixels[i++] = pos[1];
            // can check if it's within the bounds of the typed array.
        }
        this.each_pixel = (cb) => {
            //; Start from the read pos
            for (let i2 = read_pos; i2 < i; i2 += 2) {
                cb(ta_pixels.slice(i2, i2 + 2));
            }
        }
        this.fix = () => {
            this.ta = ta_pixels = ta_pixels.slice(0, i);
        }
        this.equals = (pixel_pos_list) => {
            const other_ta = pixel_pos_list.ta,
                otal = other_ta.length,
                l = ta_pixels.length;
            if (otal === l) {
                for (c = 0; c < l; c++) {
                    if (other_ta[c] !== ta_pixels[c]) {
                        return false;
                    }
                }
                return true;
            } else {
                return false;
            }
        }

        const str_pixels = () => {
            let res = '';
            let first = true;
            this.each_pixel(pos => {
                if (first) {
                    first = false;
                } else {
                    res = res + ', ';
                }
                res = res + '[' + pos[0] + ', ' + pos[1] + ']';
            })
            return res;
        }

        Object.defineProperty(this, 'str_pixels', {
            // Using shorthand method names (ES2015 feature).
            // This is equivalent to:
            // get: function() { return bValue; },
            // set: function(newValue) { bValue = newValue; },
            get: () => str_pixels(),
            enumerable: true,
            configurable: false
        });

        Object.defineProperty(this, 'length', {
            // Using shorthand method names (ES2015 feature).
            // This is equivalent to:
            // get: function() { return bValue; },
            // set: function(newValue) { bValue = newValue; },
            get: () => ((i) / 2),
            enumerable: true,
            configurable: false
        });
        let _bounds;
        Object.defineProperty(this, 'bounds', {
            // Using shorthand method names (ES2015 feature).
            // This is equivalent to:
            // get: function() { return bValue; },
            // set: function(newValue) { bValue = newValue; },
            get: () => {
                if (!_bounds) {
                    _bounds = new Uint16Array(4);
                    _bounds[0] = 1000000;
                    _bounds[1] = 1000000;
                    _bounds[2] = 0;
                    _bounds[3] = 0;
                    this.each_pixel(pos => {
                        //console.log('pos', pos);
                        if (pos[0] < _bounds[0]) _bounds[0] = pos[0];
                        if (pos[0] > _bounds[2]) _bounds[2] = pos[0];
                        if (pos[1] < _bounds[1]) _bounds[1] = pos[1];
                        if (pos[1] > _bounds[3]) _bounds[3] = pos[1];
                    })
                }
                return _bounds;
            },
            enumerable: true,
            configurable: false
        });
        let _pos;
        Object.defineProperty(this, 'pos', {
            // Using shorthand method names (ES2015 feature).
            // This is equivalent to:
            // get: function() { return bValue; },
            // set: function(newValue) { bValue = newValue; },
            get: () => {

                if (!_pos) {
                    _pos = new Uint16Array(2);
                    _pos[0] = 1000000;
                    _pos[1] = 1000000;
                    //res[2] = 0;
                    //res[3] = 0;
                    this.each_pixel(pos => {
                        //console.log('pos', pos);
                        if (pos[0] < _pos[0]) _pos[0] = pos[0];
                        //if (pos[0] > res[2]) res[2] = pos[0];
                        if (pos[1] < _pos[1]) _pos[1] = pos[1];
                        //if (pos[1] > res[3]) res[3] = pos[1];
                    })
                }
                return _pos;
            },
            enumerable: true,
            configurable: false
        });
    }
}



if (require.main === module) {
    const test1 = () => {
        let ppl = new Pixel_Pos_List();
        ppl.add([2, 2]);
        ppl.add([2, 3]);
        ppl.add([8, 4]);
        ppl.add([8, 3]);
        ppl.add([3, 3]);
        ppl.add([1, 2]);
        ppl.add([1, 3]);
        ppl.add([3, 2]);
        ppl.fix();
        console.log('ppl', ppl);
        ppl = ppl.sort();
        let item;
        item = ppl.shift();
        while (item) {
            console.log('item', item);
            item = ppl.shift();
        }
    }
    test1();

} else {
    //console.log('required as a module');
}


module.exports = Pixel_Pos_List;