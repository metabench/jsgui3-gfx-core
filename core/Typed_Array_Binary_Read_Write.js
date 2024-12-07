
class Typed_Array_Binary_Read_Write {

    constructor(ta) {
        this.ta = ta;
        this.dv = new DataView(ta.buffer, ta.byteOffset, ta.byteLength);
        this.byl = ta.byteLength;
        this.bil = this.byl << 3;
    }

    get_bit(idx_bit) {
        const idx_byte_bit = idx_bit & 7;
        return (this.dv.getUint8(idx_bit >>> 3) & (1 << idx_byte_bit)) >> idx_byte_bit;
    }

    set_bit(idx_bit, value) {
        // Ensure value is constrained to either 0 or 1
        value = value ? 1 : 0;

        const { dv } = this;
        const idx_byte = idx_bit >>> 3;
        const idx_byte_bit = idx_bit & 7;
        const byte_mask = 1 << idx_byte_bit;
        const read_byte = dv.getUint8(idx_byte);
        const updated_byte = (read_byte & ~byte_mask) | (value << idx_byte_bit);
        
        dv.setUint8(idx_byte, updated_byte);
    }
}

module.exports = Typed_Array_Binary_Read_Write;