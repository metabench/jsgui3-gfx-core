// Convert a Uint8Array to a continuous binary string (for debugging purposes)
const to_binary_string = (uint8Array) => {
    return Array.from(uint8Array)
        .map(byte => byte.toString(2).padStart(8, '0')) // Convert each byte to an 8-bit binary string
        .join(''); // Join all binary strings into one continuous string
};

// 1) Right-shift by 1 with carry propagation between 32-bit chunks
const right_shift_32bit_with_carry = (image) => {
    const length = image.length;
    const shifted_result = new Uint8Array(length); // To hold the shifted image
    
    const dataView = new DataView(image.buffer);
    const resultView = new DataView(shifted_result.buffer);
    const chunks = Math.ceil(length / 4); // Number of 32-bit chunks (4 bytes per chunk)
    let carry = 0; // Carry bit from previous 32-bit chunk
    
    for (let i = 0; i < chunks; i++) {
        const original = dataView.getUint32(i * 4); // Read original 32-bit chunk in little-endian
        
        // Right-shift 32-bit chunk and add carry from previous chunk
        const shifted = (carry << 31) | (original >>> 1); // Carry into MSB
        
        // Store the shifted result in little-endian
        resultView.setUint32(i * 4, shifted);
        
        // Capture the least significant bit to carry into the next chunk
        carry = original & 1; // Get the LSB of the original chunk
        
        // Output the current original and shifted chunk in binary (for debugging)
        //console.log(`Original chunk [${i}]:`.padEnd(28, ' '), original.toString(2).padStart(32, '0'));
        //console.log(`Shifted chunk [${i}]:`.padEnd(28, ' '), shifted.toString(2).padStart(32, '0'));
    }
    
    return shifted_result;
};

// 2) XOR the original image with the right-shifted version
const xor_with_shifted = (original_image, shifted_image) => {
    const length = original_image.length;
    const xor_result = new Uint8Array(length); // To hold the XOR result
    
    const originalView = new DataView(original_image.buffer);
    const shiftedView = new DataView(shifted_image.buffer);
    const resultView = new DataView(xor_result.buffer);
    const chunks = Math.ceil(length / 4); // Number of 32-bit chunks
    
    for (let i = 0; i < chunks; i++) {
        // Read the 32-bit original and shifted chunks
        const original = originalView.getUint32(i * 4);
        const shifted = shiftedView.getUint32(i * 4);
        
        // XOR the original with the shifted value
        const xor_result_chunk = (original ^ shifted) >>> 0;
        
        // Store the XOR result
        resultView.setUint32(i * 4, xor_result_chunk);
        
        // Output the XOR result in binary (for debugging)
        //console.log(`Original chunk [${i}]:`.padEnd(28, ' '), original.toString(2).padStart(32, '0'));
        //console.log(`Shifted chunk [${i}]:`.padEnd(28, ' '), shifted.toString(2).padStart(32, '0'));
        //console.log(`XOR result chunk [${i}]:`.padEnd(28, ' '), xor_result_chunk.toString(2).padStart(32, '0'));
    }
    
    return xor_result;
};

// 
// 

// Example usage:
const original_image_32 = new Uint8Array([
    0b11001001, // Sample image data (32 pixels, 4 bytes)
    0b00101111,
    0b11110000,
    0b00001111,
    0b11111001, // Sample image data (32 pixels, 4 bytes)
    0b00101111,
    0b11110000,
    0b00001111
]);

// 1) Perform right-shift with carry propagation
const shifted_image = right_shift_32bit_with_carry(original_image_32);

// Convert shifted image to binary string for debugging
console.log('Shifted Image in Binary:'.padEnd(28, ' '), to_binary_string(shifted_image));

// 2) Perform XOR with original image
const xor_image = xor_with_shifted(original_image_32, shifted_image);

const test_shift_result = (ta1, ta2) => {
    const binary_ta1 = to_binary_string(ta1);
    const binary_ta2 = to_binary_string(ta2);

    // Remove the first bit from ta1 and add a 0 to the end to simulate the right shift by 1
    const expected_shift = '0' + binary_ta1.slice(0, -1);

    //console.log("Original (ta1):    ".padEnd(28, ' '), binary_ta1);
    //console.log("Expected Shifted:  ".padEnd(28, ' '), expected_shift);
    //console.log("Actual Shifted:    ".padEnd(28, ' '), binary_ta2);

    if (expected_shift === binary_ta2) {

        return [true, "Test Passed: The shift operation works correctly."];

        //console.log("Test Passed: The shift operation works correctly.");
    } else {
        return [false, "Test Failed: The shifted result does not match the expected output."];
        //console.error("Test Failed: The shifted result does not match the expected output.");
    }
};

let tr = test_shift_result(original_image_32, shifted_image);

console.log('tr', tr);

// Convert XOR result to binary string for debugging
//const s_orig = to_binary_string(original_image_32);
console.log('Original:'.padEnd(28, ' '), to_binary_string(original_image_32));

console.log('XOR Image in Binary:'.padEnd(28, ' '), to_binary_string(xor_image));

// Then could see about making a library that will operate on typed arrays like this.


