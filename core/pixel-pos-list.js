// Simple enough... can add pixels, can iterate through the pixels.
//  Would be good to .to_pixel_buffer?

// Getting lists of pixel positions when extracting regions would be a nice optimization over bit masks that use 8 bpp.
//  Will support 1 bipp properly. 0.125bypp.
//  While this is 32bpp, it's only specific pixels.

const inspect = Symbol.for('nodejs.util.inspect.custom');

const Ui16toUi32 = (ui16) => {
    let res = new Uint32Array(ui16.length / 2);
    let dv = new DataView(ui16.buffer);
    let l = ui16.length;
    let hl = l / 2;
    let resw = 0;
    for (let c = 0; c < hl; c++) {
        res[resw++] = dv.getUint32(c * 4);
    }
    return res;
}

const Ui32toUi16 = (ui32) => {
    let res = new Uint16Array(ui32.length * 2);
    let dv = new DataView(ui32.buffer);
    let l = ui32.length;
    let resw = 0;
    for (let c = 0; c < l; c++) {
        res[resw++] = dv.getUint16(c * 4 + 2);
        res[resw++] = dv.getUint16(c * 4);
    }
    return res;
}

/**
 * A class for efficiently managing a list of pixel positions.
 * Provides methods for adding, removing, sorting, and iterating over pixel positions.
 */
class Pixel_Pos_List {
    [Symbol.iterator]() {
        let index = 0;
        const pixels = [];
        
        this.each_pixel(pos => {
            pixels.push([pos[0], pos[1]]);
        });
        
        return {
            next: () => {
                if (index < pixels.length) {
                    return { value: pixels[index++], done: false };
                } else {
                    return { done: true };
                }
            }
        };
    }

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

    /**
     * Creates a new Pixel_Pos_List instance.
     * @param {Object} [spec] - Optional specification object.
     */
    constructor(spec) {
        // current capacity * 10 when expanding.
        const capacities = new Uint32Array([16, 1024, 1024 * 1024 / 8, 1024 * 1024 / 2, 1024 * 1024 * 2, 1024 * 1024 * 8]);
        let i_capacity = 0;
        let capacity = capacities[i_capacity];
        let max_index = capacity * 2 - 1;
        // Could start with much lower capacity and increase it if necessary.
        let i = 0;
        let ta_pixels = new Uint16Array(capacity * 2);
        let read_pos = 0;

        // Array methods
        /**
         * Sorts the pixel positions.
         * Compacts the array first if needed.
         * @returns {Pixel_Pos_List} this instance for chaining
         */
        this.sort = () => {
            // If there are elements that have been shifted out, compact the array first
            if (read_pos > 0) {
                // Copy remaining elements to the beginning of the array
                const length = i - read_pos;
                for (let idx = 0; idx < length; idx++) {
                    ta_pixels[idx] = ta_pixels[idx + read_pos];
                }
                i = length;
                read_pos = 0;
            }
            
            // Only sort the actually used part of the array
            const activeSlice = ta_pixels.slice(0, i);
            let ui32 = Ui16toUi32(activeSlice);
            ui32.sort();
            
            // Copy the sorted values back
            const sortedUi16 = Ui32toUi16(ui32);
            for (let idx = 0; idx < i; idx++) {
                ta_pixels[idx] = sortedUi16[idx];
            }
            
            return this;
        }

        /**
         * Removes and returns the first pixel position in the list.
         * @returns {Uint16Array|undefined} The pixel position or undefined if empty
         */
        this.shift = () => {
            if (read_pos < i) {
                const res = new Uint16Array(2);
                res[0] = ta_pixels[read_pos];
                res[1] = ta_pixels[read_pos + 1];
                read_pos += 2;
                
                // If we've removed a significant number of elements, compact the array
                if (read_pos >= 1024 && read_pos > i / 2) {
                    // Create a new array with just the remaining elements
                    const newArray = new Uint16Array(i - read_pos);
                    for (let idx = 0; idx < i - read_pos; idx++) {
                        newArray[idx] = ta_pixels[idx + read_pos];
                    }
                    
                    // Update internal arrays and indices
                    ta_pixels = this.ta = newArray;
                    i = i - read_pos;
                    read_pos = 0;
                    max_index = ta_pixels.length - 1;
                }
                
                return res;
            }
            
            // Return undefined if there are no more pixels to shift
            return undefined;
        }

        /**
         * Removes and returns the last pixel position in the list.
         * @returns {Uint16Array|undefined} The pixel position or undefined if empty
         */
        this.pop = () => {
            // If index pointer is at least 2 (meaning there's at least one pixel)
            if (i > read_pos) {
                // Create a new array for the result
                const res = new Uint16Array(2);
                // Decrease the index by 2 (one full pixel)
                i -= 2;
                // Copy the values
                res[0] = ta_pixels[i];
                res[1] = ta_pixels[i+1];
                return res;
            }
            // Return undefined if there are no pixels to pop
            return undefined;
        }

        // Could start out with a smaller ta_pixels.
        this.ta = ta_pixels;

        /**
         * Adds a pixel position to the list.
         * @param {Array|Uint16Array} pos - The [x, y] position to add
         * @returns {Pixel_Pos_List} this instance for chaining
         * @throws {Error} If the position is invalid
         */
        this.add = (pos) => {
            // Validate input
            if (!pos || pos.length < 2) {
                throw new Error('Invalid pixel position. Expected [x, y] array with at least 2 elements.');
            }
            
            // Ensure position values are integers
            const x = Math.floor(pos[0]);
            const y = Math.floor(pos[1]);
            
            // Check if we need to resize the array
            if (i > max_index) {
                // Could check to see if the array can be shortened.
                // Same capacity, but move it forward.
                if (read_pos >= 1024) {
                    const new_ta = new Uint16Array(capacity * 2);
                    const l = ta_pixels.length - read_pos;
                    for (let c = 0; c < l; c++) {
                        new_ta[c] = ta_pixels[c + read_pos];
                    }
                    ta_pixels = new_ta;
                    i -= read_pos;
                    read_pos = 0;
                } else {
                    // Need to increase the capacity
                    if (i_capacity < capacities.length - 1) {
                        capacity = capacities[++i_capacity];
                    } else {
                        // If we've reached the maximum predefined capacity, double the current capacity
                        capacity *= 2;
                    }
                    
                    max_index = capacity * 2 - 1;
                    const new_ta = new Uint16Array(capacity * 2);
                    const l = ta_pixels.length;
                    for (let c = 0; c < l; c++) {
                        new_ta[c] = ta_pixels[c];
                    }
                    ta_pixels = this.ta = new_ta;
                }
            }
            
            ta_pixels[i++] = x;
            ta_pixels[i++] = y;
            
            return this;
        }

        /**
         * Iterates over each pixel in the list.
         * @param {Function} cb - Callback function receiving (pixel, index)
         */
        this.each_pixel = (cb) => {
            // Start from the read pos
            let count = 0;
            for (let i2 = read_pos; i2 < i; i2 += 2) {
                // Create a fresh copy of the pixel data for the callback
                const pixelPos = new Uint16Array(2);
                pixelPos[0] = ta_pixels[i2];
                pixelPos[1] = ta_pixels[i2 + 1];
                cb(pixelPos, count++);
            }
        }

        /**
         * Trims the internal array to the actual size of the data.
         * @returns {Pixel_Pos_List} this instance for chaining
         */
        this.fix = () => {
            // Slice the array to only include the actual pixels
            const adjusted = ta_pixels.slice(0, i);
            // Update both the instance property and the local variable
            this.ta = ta_pixels = adjusted;
            // Reset the max_index since we've resized
            max_index = this.ta.length - 1;
            return this;
        }

        /**
         * Compares this list with another pixel position list.
         * @param {Pixel_Pos_List} pixel_pos_list - The list to compare with
         * @returns {boolean} True if the lists contain the same pixels
         */
        this.equals = (pixel_pos_list) => {
            // Check if both instances have the same number of pixels
            if (this.length !== pixel_pos_list.length) {
                return false;
            }
            
            // Extract all pixels from both lists for comparison
            const thisList = [];
            const otherList = [];
            
            this.each_pixel(pos => {
                thisList.push([pos[0], pos[1]]);
            });
            
            pixel_pos_list.each_pixel(pos => {
                otherList.push([pos[0], pos[1]]);
            });
            
            // Sort both lists for consistent comparison
            thisList.sort((a, b) => {
                if (a[0] === b[0]) return a[1] - b[1];
                return a[0] - b[0];
            });
            
            otherList.sort((a, b) => {
                if (a[0] === b[0]) return a[1] - b[1];
                return a[0] - b[0];
            });
            
            // Compare each pixel
            for (let i = 0; i < thisList.length; i++) {
                if (thisList[i][0] !== otherList[i][0] || thisList[i][1] !== otherList[i][1]) {
                    return false;
                }
            }
            
            return true;
        }

        /**
         * Maps each pixel position to a new value using the callback function.
         * @param {Function} mapFn - Function that receives (pixel, index) and returns a new value
         * @returns {Array} Array of mapped values
         */
        this.map = (mapFn) => {
            const result = [];
            this.each_pixel((pos, idx) => {
                result.push(mapFn(pos, idx));
            });
            return result;
        }

        /**
         * Filters pixel positions based on the predicate function.
         * @param {Function} predicate - Function that receives (pixel, index) and returns boolean
         * @returns {Pixel_Pos_List} A new Pixel_Pos_List with the filtered pixels
         */
        this.filter = (predicate) => {
            const result = new Pixel_Pos_List();
            this.each_pixel((pos, idx) => {
                if (predicate(pos, idx)) {
                    result.add([pos[0], pos[1]]);
                }
            });
            return result;
        }

        /**
         * Executes a function for each pixel position.
         * @param {Function} callback - Function that receives (pixel, index)
         */
        this.forEach = (callback) => {
            this.each_pixel(callback);
        }

        /**
         * Creates a string representation of all pixels.
         * @private
         */
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
            });
            return res;
        }

        /**
         * Property to get a string representation of all pixels.
         */
        Object.defineProperty(this, 'str_pixels', {
            get: () => str_pixels(),
            enumerable: true,
            configurable: false
        });

        /**
         * Property to get the number of pixels in the list.
         */
        Object.defineProperty(this, 'length', {
            get: () => ((i - read_pos) / 2),
            enumerable: true,
            configurable: false
        });

        /**
         * Property to get the bounding box of all pixels.
         * @returns {Uint16Array} [minX, minY, maxX, maxY]
         */
        let _bounds;
        Object.defineProperty(this, 'bounds', {
            get: () => {
                // Always recalculate bounds when accessed
                _bounds = new Uint16Array(4);
                
                // Initialize bounds with values that will be replaced
                if (this.length > 0) {
                    // Default to extreme values
                    _bounds[0] = Number.MAX_SAFE_INTEGER; // Minimum x
                    _bounds[1] = Number.MAX_SAFE_INTEGER; // Minimum y
                    _bounds[2] = 0; // Maximum x
                    _bounds[3] = 0; // Maximum y
                    
                    // Iterate through all pixels to find min/max values
                    this.each_pixel(pos => {
                        if (pos[0] < _bounds[0]) _bounds[0] = pos[0];
                        if (pos[0] > _bounds[2]) _bounds[2] = pos[0];
                        if (pos[1] < _bounds[1]) _bounds[1] = pos[1];
                        if (pos[1] > _bounds[3]) _bounds[3] = pos[1];
                    });
                } else {
                    // If no pixels, use default bounds of 0,0,0,0
                    _bounds[0] = 0;
                    _bounds[1] = 0;
                    _bounds[2] = 0;
                    _bounds[3] = 0;
                }
                
                return _bounds;
            },
            enumerable: true,
            configurable: false
        });

        /**
         * Property to get the top-left position of all pixels.
         * @returns {Uint16Array} [minX, minY]
         */
        let _pos;
        Object.defineProperty(this, 'pos', {
            get: () => {
                // Always recalculate position when accessed
                _pos = new Uint16Array(2);
                
                if (this.length > 0) {
                    _pos[0] = Number.MAX_SAFE_INTEGER;
                    _pos[1] = Number.MAX_SAFE_INTEGER;
                    
                    this.each_pixel(pos => {
                        if (pos[0] < _pos[0]) _pos[0] = pos[0];
                        if (pos[1] < _pos[1]) _pos[1] = pos[1];
                    });
                } else {
                    _pos[0] = 0;
                    _pos[1] = 0;
                }
                
                return _pos;
            },
            enumerable: true,
            configurable: false
        });

        /**
         * Clears all pixels from the list.
         * @returns {Pixel_Pos_List} this instance for chaining
         */
        this.clear = () => {
            i = 0;
            read_pos = 0;
            return this;
        }

        /**
         * Checks if the list contains the given pixel position.
         * @param {Array|Uint16Array} pos - The [x, y] position to check
         * @returns {boolean} True if the position is in the list
         */
        this.contains = (pos) => {
            if (!pos || pos.length < 2) return false;
            
            // For non-integer values, check if they need to be floored
            // We only match exact integer values or floored non-integers
            const isXInteger = Number.isInteger(pos[0]);
            const isYInteger = Number.isInteger(pos[1]);
            
            // If both values are non-integers, we won't find a match
            if (!isXInteger && !isYInteger) {
                return false;
            }
            
            const x = Math.floor(pos[0]);
            const y = Math.floor(pos[1]);
            
            let found = false;
            this.each_pixel(pixel => {
                if (pixel[0] === x && pixel[1] === y) {
                    // For non-integer inputs, only match if the input values floor to the same values
                    if ((!isXInteger && Math.floor(pos[0]) !== pos[0]) || 
                        (!isYInteger && Math.floor(pos[1]) !== pos[1])) {
                        return; // Skip this match for non-integers
                    }
                    found = true;
                }
            });
            
            return found;
        }

        /**
         * Converts the list to a plain array of [x,y] positions.
         * @returns {Array} Array of [x,y] positions
         */
        this.toArray = () => {
            const result = [];
            this.each_pixel(pos => {
                result.push([pos[0], pos[1]]);
            });
            return result;
        }
    }

    /**
     * Creates a Pixel_Pos_List from an array of positions.
     * @param {Array} positions - Array of [x,y] positions
     * @returns {Pixel_Pos_List} A new Pixel_Pos_List
     * @static
     */
    static fromArray(positions) {
        const ppl = new Pixel_Pos_List();
        if (Array.isArray(positions)) {
            positions.forEach(pos => {
                if (Array.isArray(pos) && pos.length >= 2) {
                    ppl.add(pos);
                }
            });
        }
        return ppl;
    }
}

// Example usage when run as a script
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
        
        // Using iterator protocol
        console.log('Pixels using for...of:');
        for (const pos of ppl) {
            console.log(`  [${pos[0]}, ${pos[1]}]`);
        }
        
        // Using new methods
        console.log('\nFiltered pixels (x > 2):');
        const filtered = ppl.filter(pos => pos[0] > 2);
        filtered.forEach(pos => {
            console.log(`  [${pos[0]}, ${pos[1]}]`);
        });
        
        // Map
        console.log('\nMapped pixels (x+y):');
        const sums = ppl.map(pos => pos[0] + pos[1]);
        console.log(sums);
        
        console.log('\nSorted pixels:');
        ppl = ppl.sort();
        let item;
        while ((item = ppl.shift())) {
            console.log(`  [${item[0]}, ${item[1]}]`);
        }
    }
    test1();
} else {
    // Required as a module
}

module.exports = Pixel_Pos_List;