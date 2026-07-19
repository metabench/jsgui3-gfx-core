
class Typed_Array_Binary_Read_Write {

    constructor(ta, bitOrder = 'lsb-first') {
        if (bitOrder !== 'lsb-first' && bitOrder !== 'msb-first') {
            throw new RangeError(`Unsupported bit order: ${bitOrder}`);
        }
        this.ta = ta;
        this.dv = new DataView(ta.buffer, ta.byteOffset, ta.byteLength);
        this.byl = ta.byteLength;
        this.bil = this.byl * 8;
        this.bitOrder = bitOrder;
    }

    get_bit(idx_bit) {
        const idx_byte_bit = idx_bit & 7;
        const byteMask = this.bitOrder === 'msb-first'
            ? 128 >> idx_byte_bit
            : 1 << idx_byte_bit;
        return (this.dv.getUint8(Math.floor(idx_bit / 8)) & byteMask) === 0 ? 0 : 1;
    }

    set_bit(idx_bit, value) {
        // Ensure value is constrained to either 0 or 1
        value = value ? 1 : 0;

        const { dv } = this;
        const idx_byte = Math.floor(idx_bit / 8);
        const idx_byte_bit = idx_bit & 7;
        const byte_mask = this.bitOrder === 'msb-first'
            ? 128 >> idx_byte_bit
            : 1 << idx_byte_bit;
        const read_byte = dv.getUint8(idx_byte);
        const updated_byte = value
            ? read_byte | byte_mask
            : read_byte & ~byte_mask;
        
        dv.setUint8(idx_byte, updated_byte);
    }
}

module.exports = Typed_Array_Binary_Read_Write;
