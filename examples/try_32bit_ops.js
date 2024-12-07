
/*
const uint32 = 0xFFFFFFFF;  // Maximum 32-bit unsigned integer (4294967295)

// Ensure the number is treated as an unsigned 32-bit integer using >>> 0
const binary_string = (uint32 >>> 0).toString(2).padStart(32, '0');

console.log(binary_string);  // Outputs: '11111111111111111111111111111111'

*/

/*
const shift_and_xor_32bit_with_carry = (image) => {
    const length = image.length;
    const result = new Uint8Array(length); // Result image after XOR

    const dataView = new DataView(image.buffer);
    const resultView = new DataView(result.buffer);
    const chunks = Math.ceil(length / 4); // Number of 32-bit chunks
    let carry = 0; // Carry from the previous chunk

    for (let i = 0; i < chunks; i++) {
        const original = dataView.getUint32(i * 4, true); // true for little-endian

        // Shift the original and include carry
        const shifted = (carry << 31) | (original >>> 1); // Right shift and include carry

        // Perform XOR with the original image
        const xorResult = original ^ shifted;

        // Store the result back to the result view
        resultView.setUint32(i * 4, xorResult, true);

        // Update carry for the next chunk
        carry = (original & 1); // Get the LSB of the current chunk for the next iteration
    }

    return result;
};

*/

const shift_and_xor_32bit_with_carry = (image) => {
    const length = image.length;
    const result = new Uint8Array(length); // Result image after XOR

    const dataView = new DataView(image.buffer);
    const resultView = new DataView(result.buffer);
    const chunks = Math.ceil(length / 4); // Number of 32-bit chunks
    let carry = 0; // Carry from the previous chunk (starts with 0)

    for (let i = 0; i < chunks; i++) {
        const original = dataView.getUint32(i * 4, true); // true for little-endian (process 4 bytes as 32 bits)

        // Shift the original and include carry from the previous chunk
        const shifted = (carry << 31) | (original >>> 1); // Right shift and include carry from the previous chunk

        // Perform XOR between the original and the shifted value
        const xorResult = original ^ shifted;

        // Store the XOR result back into the result view
        resultView.setUint32(i * 4, xorResult, true); // Write result as little-endian

        // Update carry for the next chunk based on the LSB of the current chunk
        carry = original & 1; // Extract the LSB (0 or 1) to carry into the next chunk
    }

    return result;
};



// Example usage:
const original_image_32 = new Uint8Array([
    0b11001001, // Sample image data (8 bits)
    0b00101111,
    0b11110000,
    0b00001111,
]); // 32 pixels (4 bytes)

// Perform the shift and XOR operation
const xor_result_32 = shift_and_xor_32bit_with_carry(original_image_32);


const display_as_binary = (uint8Array) => {
    return Array.from(uint8Array)
        .map(byte => byte.toString(2).padStart(8, '0')) // Convert each byte to a binary string
        .join(' '); // Join binary strings with a space
};


// Output the result
//console.log(xor_result_32); // Uint8Array with the XORed result

console.log(display_as_binary(original_image_32));

console.log(display_as_binary(xor_result_32));