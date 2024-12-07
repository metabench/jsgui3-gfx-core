// Convert a Uint8Array to a continuous binary string (for debugging purposes)
const to_binary_string = (uint8Array) => {
    return Array.from(uint8Array)
        .map(byte => byte.toString(2).padStart(8, '0')) // Convert each byte to an 8-bit binary string
        .join(''); // Join all binary strings into one continuous string
};

/**
 * Right-shift a Uint8Array by 1 bit with carry propagation between 32-bit chunks.
 * @param {Uint8Array} image - The input image as a Uint8Array.
 * @returns {Uint8Array} - The resulting shifted image.
 */
const right_shift_32bit_with_carry = (image) => {
    const length = image.length;
    const shifted_result = new Uint8Array(length); // To hold the shifted image
    
    const dataView = new DataView(image.buffer);
    const resultView = new DataView(shifted_result.buffer);
    
    const chunks = length >> 2; // Number of 32-bit chunks (4 bytes per chunk)
    const remainder = length & 3; // Remainder bytes (length % 4)
    let carry = 0; // Carry bit from previous 32-bit chunk
    
    for (let i = 0; i < chunks; i++) {
        const original = dataView.getUint32(i * 4); // Read original 32-bit chunk in little-endian
        
        // Right-shift 32-bit chunk and add carry from previous chunk
        const shifted = (carry << 31) | (original >>> 1); // Carry into MSB
        
        // Store the shifted result in little-endian
        resultView.setUint32(i * 4, shifted);
        
        // Capture the least significant bit to carry into the next chunk
        carry = original & 1; // Get the LSB of the original chunk
    }

    // Handle the remaining bytes (if any)
    if (remainder > 0) {
        const lastIndex = chunks * 4; // Start index for the remaining bytes
        const lastChunk = new Uint8Array(4); // To hold the last 32-bit chunk
        
        // Copy the remaining bytes into the lastChunk
        lastChunk.set(image.slice(lastIndex));

        // Right-shift the last chunk and add carry
        const lastOriginal = new DataView(lastChunk.buffer).getUint32(0);
        const lastShifted = (carry << 31) | (lastOriginal >>> 1);
        
        // Store the last shifted result, considering the actual length
        for (let j = 0; j < remainder; j++) {
            resultView.setUint8(lastIndex + j, (lastShifted >>> (8 * (3 - j))) & 0xFF);
        }
    }
    
    return shifted_result;
};

/**
 * XOR two TypedArrays. Both arrays must be of the same length.
 * If a result array is not provided, a new array will be created.
 * @param {Uint8Array | TypedArray} original_image - The first TypedArray.
 * @param {Uint8Array | TypedArray} shifted_image - The second TypedArray.
 * @param {TypedArray} [res] - Optional TypedArray to store the result. If not provided, a new one will be created.
 * @returns {TypedArray} - The XOR result array.
 */
const xor_typed_arrays = (original_image, shifted_image, res) => {
    const length = original_image.length;
    if (length !== shifted_image.length) {
        throw new Error('Typed arrays must be of the same length.');
    }

    const xor_result = res || new Uint8Array(length); // Create result array if not provided

    const originalView = new DataView(original_image.buffer);
    const shiftedView = new DataView(shifted_image.buffer);
    const resultView = new DataView(xor_result.buffer);
    
    const chunks = length >>> 2; // Number of 32-bit chunks (length / 4)
    const remaining_start_index = chunks << 2; // Calculate start index for remaining bytes

    // XOR each 32-bit chunk
    for (let i = 0; i < chunks; i++) {
        const byteOffset = i << 2; // Calculate byte offset (i * 4) using left shift
        const original = originalView.getUint32(byteOffset, false); // Read in big-endian
        const shifted = shiftedView.getUint32(byteOffset, false); // Read in big-endian
        const xor_result_chunk = original ^ shifted; // Perform XOR
        resultView.setUint32(byteOffset, xor_result_chunk, false); // Store result in big-endian
    }

    // Handle remaining bytes using DataView
    for (let i = remaining_start_index; i < length; i++) {
        const originalByte = originalView.getUint8(i); // Read remaining byte from original
        const shiftedByte = shiftedView.getUint8(i); // Read remaining byte from shifted
        resultView.setUint8(i, originalByte ^ shiftedByte); // Store XOR of remaining bytes
    }

    return xor_result;
};
const copy_row_beginning_bits = (ta_source, row_width, ta_dest) => {
    // source and dest must be the same lengths.
    if (ta_source.length !== ta_dest.length) {
        throw new Error("Source and destination arrays must be the same length.");
    }

    const total_bits = ta_source.length * 8; // Total number of bits in the source and destination arrays
    const dataViewSource = new DataView(ta_source.buffer, ta_source.byteOffset);
    const dataViewDest = new DataView(ta_dest.buffer, ta_dest.byteOffset);

    // Calculate the number of rows based on row width in bits
    const height = Math.floor(total_bits / row_width); // Number of rows

    let bit_index = 0; // Bit-level index

    for (let y = 0; y < height; y++) {
        const byte_index = Math.floor(bit_index / 8); // Determine which byte the bit is in
        const bit_in_byte = bit_index % 8;            // Determine the bit position within the byte

        // Read the byte from the source where the row starts
        const source_byte = dataViewSource.getUint8(byte_index);

        // Extract the first bit of the row (most significant bit at the beginning of each row)
        const first_bit = (source_byte >> (7 - bit_in_byte)) & 1; // Extract the specific bit

        // Read the destination byte and modify its first bit
        const dest_byte = dataViewDest.getUint8(byte_index);
        const updated_dest_byte = (dest_byte & ~(1 << (7 - bit_in_byte))) | (first_bit << (7 - bit_in_byte));

        // Write the updated byte back into the destination
        dataViewDest.setUint8(byte_index, updated_dest_byte);

        bit_index += row_width; // Move to the next row (row_width is in bits, so move by that many bits)
    }
};

/**
 * Sets the beginning bit of each row to 0 in a binary grid represented by a typed array.
 * @param {Uint8Array} ta - The typed array representing the binary grid.
 * @param {number} row_width - The width of each row in bits.
 */
const set_row_beginning_bits_to_0 = (ta, row_width) => {
    const total_bits = ta.length * 8; // Total number of bits in the array
    const dataView = new DataView(ta.buffer, ta.byteOffset);
    const height = Math.floor(total_bits / row_width); // Number of rows

    let bit_index = 0; // Bit-level index

    for (let y = 0; y < height; y++) {
        const byte_index = Math.floor(bit_index / 8); // Determine which byte the bit is in
        const bit_in_byte = bit_index % 8;            // Determine the bit position within the byte

        // Read the current byte from the DataView
        const byte = dataView.getUint8(byte_index);

        // Clear the bit at the specific position (set it to 0)
        const updated_byte = byte & ~(1 << (7 - bit_in_byte));

        // Write the updated byte back into the DataView
        dataView.setUint8(byte_index, updated_byte);

        // Move to the start of the next row (row_width is in bits, so move by that many bits)
        bit_index += row_width;
    }
};

const _copy_row_beginning_bits = (ta_source, row_width, ta_dest) => {
    // source and dest must be the same lengths.

    if (ta_source.length === ta_dest.length) {

        const l = ta_source.length;
        // calculate the number or rows.... (height)

        const height = l / row_width;

        let bit_index = 0;
        for (let y = 0; y < height; y++) {
            // Copy 


            bit_index += row_width;
        }

    }

}



/**
 * Fast method to find the index of the next set bit in a 32-bit integer.
 * @param {number} num - The number to search within.
 * @param {number} start_index - The starting index to search from.
 * @returns {number|boolean} - The index of the next set bit, or false if none found.
 */
const fast_find_next_set_bit = (num, start_index) => {
    // Check if start_index is out of range
    if (start_index < -1 || start_index > 31) return false; // Ensure start_index is within valid range

    // Handle case where start_index is 31 (no more bits after that)
    if (start_index === 31) return false;

    // Mask out all bits up to and including the start_index
    if (start_index >= 0) {
        // Shift bits to the left to clear bits up to start_index
        num = num & ((1 << (31 - start_index)) - 1);
    }

    // Use clz32 to find the number of leading zeros
    if (num === 0) return false; // No bits set after start_index
    
    const next_set_bit = Math.clz32(num); // Number of leading zeros in remaining bits
    return next_set_bit < 32 ? next_set_bit : false; // Return the index of the next set bit
};
/**
 * Finds the index of the next set bit in a typed array, processing in 32-bit chunks where possible.
 *
 * @param {Uint8Array | Uint16Array | Uint32Array} ta - The typed array to search within.
 * @param {number} start_index - The starting bit index to search from.
 * @param {number} limit - The maximum number of bits to search.
 * @returns {number|boolean} - The index of the next set bit or false if none found.
 *//**
 * Finds the index of the next set bit in a typed array, processing in 32-bit chunks where possible.
 *
 * @param {Uint8Array | Uint16Array | Uint32Array} ta - The typed array to search within.
 * @param {number} start_index - The starting bit index to search from.
 * @param {number} limit - The maximum number of bits to search.
 * @returns {number|boolean} - The index of the next set bit or false if none found.
 */
const _____fast_find_next_set_ta_bit = (ta, start_index = 0, limit = ta.length * 8) => {
    const total_bits = ta.length * 8;
    if (start_index >= total_bits || limit <= 0) return false;

    const end_index = Math.min(start_index + limit, total_bits);
    const dv = new DataView(ta.buffer, ta.byteOffset, ta.byteLength);

    let bit_index = start_index;

    // Process each bit, leveraging 32-bit chunk processing where possible
    while (bit_index < end_index) {
        const byte_offset = bit_index >>> 3; // Convert bit index to byte index
        const bit_offset_in_byte = bit_index & 7; // Position of bit within byte

        // If aligned to 32-bit boundary and at least 32 bits left, read a full 32-bit word
        if (bit_offset_in_byte === 0 && bit_index + 32 <= end_index) {
            const chunk = dv.getUint32(byte_offset, false); // Read 32 bits in big-endian
            const chunk_start_index = bit_index & 31; // Offset within the chunk

            let relative_bit_index = fast_find_next_set_bit(chunk, chunk_start_index);

            if (relative_bit_index !== false) {
                return bit_index + relative_bit_index; // Return absolute bit index
            }

            // Move by 32 bits if no set bit found in this chunk
            bit_index += 32;
        } else {
            // Check single bits for any remaining positions
            const byte = dv.getUint8(byte_offset);
            const bit_pos_in_byte = 7 - (bit_index & 7);

            if ((byte & (1 << bit_pos_in_byte)) !== 0) {
                return bit_index;
            }

            bit_index++;
        }
    }

    return false; // No set bit found
};

/**
 * Finds the index of the next set bit in a typed array within a specified limit, ensuring it moves forward from the start_index.
 * @param {Uint8Array | Uint16Array | Uint32Array} ta - The typed array to search within.
 * @param {number} start_index - The starting bit index to search from.
 * @param {number} limit - The maximum number of bits to search.
 * @returns {number|boolean} - The index of the next set bit within the typed array, or false if none found.
 */
const fast_find_next_set_ta_bit = (ta, start_index = 0, limit = ta.length * 8) => {
    const total_bits = ta.length * 8;
    const end_index = Math.min(start_index + limit, total_bits);

    // Start searching from the bit after start_index
    for (let bit_index = start_index + 1; bit_index < end_index; bit_index++) {
        const byte_index = bit_index >>> 3;
        const bit_in_byte = bit_index & 7;
        
        // Check if the specific bit is set (1)
        if ((ta[byte_index] & (1 << (7 - bit_in_byte))) !== 0) {
            return bit_index; // Return the first found set bit index
        }
    }
    return false; // No set bit found within the range
};

/**
 * Iterate through a TypedArray and call a callback for each index where the bit is '1'.
 * @param {TypedArray} ta - The TypedArray to iterate over.
 * @param {function} cb - The callback to invoke for each index with a bit of '1'.
 */
const each_1_index = (ta, cb) => {
    const length = ta.length;

    // Check if the TypedArray is empty
    if (length === 0) return;

    const view = new DataView(ta.buffer, ta.byteOffset); // Ensure DataView respects byteOffset
    const chunks = length >>> 2; // Number of 32-bit chunks
    const remaining_start_index = chunks << 2; // Start index for remaining bytes
    const remaining_length = length % 4; // Length of remaining bytes

    // Iterate through each 32-bit chunk
    for (let i = 0; i < chunks; i++) {
        const value = view.getUint32(i << 2, false); // Read 32-bit chunk in big-endian
        let bit_index = fast_find_next_set_bit(value, -1); // Start searching from the beginning

        // While there are set bits in this chunk
        while (bit_index !== false) {
            cb((i << 5) + bit_index); // `i << 5` accounts for 32 bits (not bytes) in the chunk
            bit_index = fast_find_next_set_bit(value, bit_index); // Find the next set bit
        }
    }

    // Handle remaining bytes if any
    for (let i = 0; i < remaining_length; i++) {
        const byte = view.getUint8(remaining_start_index + i); // Read the remaining byte
        // Check each bit in the byte
        for (let bit = 0; bit < 8; bit++) {
            if (byte & (1 << (7 - bit))) { // Check if the bit is '1' (start from MSB)
                // Calculate the absolute index in the original TypedArray
                const absolute_index = (remaining_start_index * 8) + (i * 8) + bit;
                cb(absolute_index); // Call the callback with the bit index
            }
        }
    }
};


/*
const pop_cnt = (n) => {
    n = n - ((n >> 1) & 0x55555555);             // Put count of each 2 bits into those 2 bits
    n = (n & 0x33333333) + ((n >> 2) & 0x33333333); // Put count of each 4 bits into those 4 bits
    n = (n + (n >> 4)) & 0x0F0F0F0F;             // Put count of each 8 bits into those 8 bits
    n = n + (n >> 8);                            // Put count of each 16 bits into those 16 bits
    n = n + (n >> 16);                           // Put count of each 32 bits into those 32 bits
    return n & 0x3F;                             // Mask to get the last 6 bits (which is enough to store the result)
  };

const count_1s = ta => {
    const length = ta.length;
    let res = 0;

    // Check if the TypedArray is empty
    if (length === 0) return;

    const view = new DataView(ta.buffer);
    const chunks = length >>> 2; // Number of 32-bit chunks
    const remaining_start_index = chunks << 2; // Start index for remaining bytes
    const remaining_length = length % 4; // Length of remaining bytes

    // Iterate through each 32-bit chunk
    for (let i = 0; i < chunks; i++) {


        
       res += pop_cnt(value);
    }

    // Handle remaining bytes if any
    for (let i = 0; i < remaining_length; i++) {
        const byte = view.getUint8(remaining_start_index + i); // Read the remaining byte
        // Check each bit in the byte
        for (let bit = 0; bit < 8; bit++) {
            if (byte & (1 << bit)) { // If the bit is '1'
                // Calculate the absolute index in the original TypedArray
                //const absolute_index = remaining_start_index + (i * 8) + bit; // Index within the TypedArray
                //cb(absolute_index); // Call the callback with the bit index
                res++;
            }
        }
    }

    return res;

}
    */


const pop_cnt = (n) => {
    n = n - ((n >> 1) & 0x55555555);             // Put count of each 2 bits into those 2 bits
    n = (n & 0x33333333) + ((n >> 2) & 0x33333333); // Put count of each 4 bits into those 4 bits
    n = (n + (n >> 4)) & 0x0F0F0F0F;             // Put count of each 8 bits into those 8 bits
    n = n + (n >> 8);                            // Put count of each 16 bits into those 16 bits
    n = n + (n >> 16);                           // Put count of each 32 bits into those 32 bits
    return n & 0x3F;                             // Mask to get the last 6 bits (which is enough to store the result)
};

// Count the number of 1 bits in a whole TypedArray
const pop_cnt_typed_array = (typedArray, is_little_endian = true) => {
    let total_count = 0;
    const length = typedArray.length;
    if (length === 0) return total_count; // Edge case: Empty array
    const view = new DataView(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength);
    // Process full 32-bit (4-byte) chunks
    const chunks = length >>> 2; // Integer division by 4
    for (let i = 0; i < chunks; i++) {
        const value = view.getUint32(i << 2, is_little_endian); // Read each 32-bit chunk
        total_count += pop_cnt(value); // Count the '1' bits in this chunk
    }
    // Handle any remaining bytes (less than 32 bits)
    const remaining_start_index = chunks << 2; // Start index for remaining bytes
    const remaining_length = length - remaining_start_index; // Remaining bytes count
    for (let i = 0; i < remaining_length; i++) {
        const byte = view.getUint8(remaining_start_index + i); // Read each remaining byte
        // Count '1' bits manually for each byte
        total_count += (byte & 1) + ((byte >> 1) & 1) + ((byte >> 2) & 1) + ((byte >> 3) & 1) +
                        ((byte >> 4) & 1) + ((byte >> 5) & 1) + ((byte >> 6) & 1) + ((byte >> 7) & 1);
    }
    return total_count;
};

const count_1s = pop_cnt_typed_array;


// const iterate 1 positions.

// each_1_index


class BitwiseTester {
    constructor(ta = null) {
        // Create a default TypedArray if none is provided.
        if (ta) {
            this.ta = ta;
        } else {
            // Create a default TypedArray with Fibonacci-influenced pattern
            this.ta = new Uint8Array([0, 1, 1, 2, 3, 5, 8, 13]);
        }
    }

    // Testing shift_typed_array_right using string representation
    test_shift_typed_array_right() {
        const result = right_shift_32bit_with_carry(this.ta);
    
        // Convert the original TypedArray to a binary string representation
        const binary_ta1 = to_binary_string(this.ta);
        // Convert the result TypedArray to a binary string representation
        const binary_ta2 = to_binary_string(result);
    
        // Remove the first bit from ta1 and add a 0 to the end to simulate the right shift by 1
        const expected_shift = '0' + binary_ta1.slice(0, -1);
    
        // Check if the expected shifted binary string matches the actual result
        if (expected_shift === binary_ta2) {
            return {
                passed: true,
                messages: ["Test Passed: The shift operation works correctly."]
            };
        } else {
            return {
                passed: false,
                messages: [`Test Failed: The shifted result does not match the expected output. Expected: ${expected_shift}, Got: ${binary_ta2}`]
            };
        }
    }

    // Testing xor_typed_arrays (unchanged for context)
    test_xor_typed_arrays() {
        const ta2 = new Uint8Array(this.ta.length).fill(1); // Example second array for XOR
        const result = xor_typed_arrays(this.ta, ta2);
        
        // Create string representations
        let resultBinary = '';
        for (const byte of result) {
            resultBinary += byte.toString(2).padStart(8, '0');
        }
        
        let expectedBinary = '';
        for (let i = 0; i < this.ta.length; i++) {
            expectedBinary += (this.ta[i] ^ ta2[i]).toString(2).padStart(8, '0');
        }

        const passed = resultBinary === expectedBinary;
        const messages = [];
        
        if (!passed) {
            messages.push('XOR test failed. Expected: ' + expectedBinary + ', Got: ' + resultBinary);
        } else {

        }

        return {
            passed,
            messages,
        };
    }

    // Method to run all tests (unchanged for context)
    test() {
        const results = [];
        let count_passed = 0;
        let count_failed = 0;

        const shift_test_result = this.test_shift_typed_array_right();
        results.push(shift_test_result);
        if (shift_test_result.passed) count_passed++;
        else count_failed++;

        const xor_test_result = this.test_xor_typed_arrays();
        results.push(xor_test_result);
        if (xor_test_result.passed) count_passed++;
        else count_failed++;

        return {
            passed: count_failed === 0,
            count_passed,
            count_failed,
            results,
        };
    }
}


if (require.main === module) {
    const tester = new BitwiseTester();
    const test_res = tester.test();
    console.log('test_res', JSON.stringify(test_res, null, 2));


}

const get_ta_bits_that_differ_from_previous_as_1s = (ta_source, bits_per_row, ta_dest = new ta_source.constructor(ta_source.length), copy_original_x0_values = false) => {
    // no wrapping

    const rshifted = right_shift_32bit_with_carry(ta_source);
    xor_typed_arrays(ta_source, rshifted, ta_dest);


    if (copy_original_x0_values) {
        copy_row_beginning_bits(ta_source, bits_per_row, ta_dest);
    } else {
        // Set row beginning bits to 0 as they do not differ from the (theoretical) pixel before them that is not a pixel with a different color because it is a virtual pixel without a different color.

        set_row_beginning_bits_to_0(ta_dest);

    }
    
    return ta_dest;

}

const get_bit = (ta, i) => (ta[i >> 3] >> (7 - (i & 0b111))) & 1;

// Exports
module.exports = {
    right_shift_32bit_with_carry,
    xor_typed_arrays,
    each_1_index,
    count_1s,
    pop_cnt,
    pop_cnt_typed_array,
    copy_row_beginning_bits,
    get_ta_bits_that_differ_from_previous_as_1s,
    get_bit,
    fast_find_next_set_ta_bit
};
