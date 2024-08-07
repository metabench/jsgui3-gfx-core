class BitManipulator {
    constructor(buffer) {
        this.dv = new DataView(buffer);
    }

    // Get the bit at the specified index
    get_bit(idx_bit) {
        const idx_byte = idx_bit >>> 3;
        const idx_byte_bit = idx_bit & 7;
        return (this.dv.getUint8(idx_byte) & (1 << idx_byte_bit)) >> idx_byte_bit;
    }

    // Set the bit using if statements
    set_bit_if(idx_bit, value) {
        const idx_byte = idx_bit >>> 3;
        const idx_byte_bit = idx_bit & 7;
        const byte_mask = 1 << idx_byte_bit;
        const read_byte = this.dv.getUint8(idx_byte);

        if (value === 0) {
            this.dv.setUint8(idx_byte, read_byte & ~byte_mask);
        } else if (value === 1) {
            this.dv.setUint8(idx_byte, read_byte | byte_mask);
        }
    }

    // Set the bit using binary operations
    set_bit_binary(idx_bit, value) {
        const idx_byte = idx_bit >>> 3;
        const idx_byte_bit = idx_bit & 7;
        const byte_mask = 1 << idx_byte_bit;
        const read_byte = this.dv.getUint8(idx_byte);
        const value_mask = -value;
        this.dv.setUint8(idx_byte, (read_byte & ~byte_mask) | (value_mask & byte_mask));
    }
}

// Function to test the correctness of set_bit methods
function test_correctness(bitManipulator) {
    const test_cases = [
        { idx_bit: 3, value: 1 },
        { idx_bit: 3, value: 0 },
        { idx_bit: 10, value: 1 },
        { idx_bit: 10, value: 0 }
    ];

    for (const test of test_cases) {
        bitManipulator.set_bit_if(test.idx_bit, test.value);
        const if_result = bitManipulator.get_bit(test.idx_bit);

        bitManipulator.set_bit_binary(test.idx_bit, test.value);
        const binary_result = bitManipulator.get_bit(test.idx_bit);

        if (if_result !== test.value || binary_result !== test.value) {
            console.error(`Test failed for idx_bit=${test.idx_bit}, value=${test.value}`);
            console.error(`if_result=${if_result}, binary_result=${binary_result}`);
            return false;
        }
    }
    console.log("All correctness tests passed!");
    return true;
}

// Function to benchmark a set_bit method
function benchmark(bitManipulator, method, iterations = 1e6) {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
        method.call(bitManipulator, i % (bitManipulator.dv.byteLength * 8), i % 2); // Toggle bit and value
    }
    return performance.now() - start;
}

const buffer = new ArrayBuffer(1024);
const bitManipulator = new BitManipulator(buffer);

// Test for correctness before benchmarking
if (test_correctness(bitManipulator)) {
    const iterations = 1e6;

    const time_if = benchmark(bitManipulator, bitManipulator.set_bit_if, iterations);
    console.log(`Time with if statement: ${time_if}ms`);

    const time_binary = benchmark(bitManipulator, bitManipulator.set_bit_binary, iterations);
    console.log(`Time with binary operations: ${time_binary}ms`);
}
