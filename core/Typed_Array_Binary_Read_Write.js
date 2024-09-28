
// tabrw


class Typed_Array_Binary_Read_Write {

    constructor(ta) {
        this.ta = ta;
        this.dv = new DataView(ta.buffer, ta.byteOffset, ta.byteLength);
        this.byl = ta.byteLength;
        this.bil = this.byl << 3;
    }

    // Reading and writing single bits.
    // Multiple bits.

    // Addressing them as bit indexes within the typed array.
    //   Addressing them as byte then bit indexes
    //   Or ta index, and then the bit index.
    //   Or byte index of 2, 4, or 8 byte value, then the bit index within that.
    // Reading and writing 64 bit ints will likely be best / fastest.
    //   Though not in all cases.


    /*
    get_bit(idx_bit) {
        //const {dv, byl} = this;
        const {dv} = this;
        // Check the byte length constraint?
        const idx_byte = idx_bit >>> 3;
        // & 7 is remainder from divide by 8
        const idx_byte_bit = idx_bit & 7;
        const res = (dv.getUint8(idx_byte) & (1 << idx_byte_bit)) >> idx_byte_bit;
        //console.log('idx_byte', idx_byte);
        //console.log('idx_byte_bit', idx_byte_bit);
        return res;
    }
    */


    // And then with multiple bits in a row.


    // set_consecutive_bits_on(idx_starting_bit, number_of_bits_to_set)

    //   So, will calculate the numbers of the various things that are needed.
    
    //   starting bit offset....
    //     the whole calculation.
    //     then writing them will (mostly) be very fast.

    






    // 



    get_bit(idx_bit) {
        //const {dv, byl} = this;
        //const {dv} = this;
        // Check the byte length constraint?
        //const idx_byte = idx_bit >>> 3;
        // & 7 is remainder from divide by 8
        const idx_byte_bit = idx_bit & 7;
        return (this.dv.getUint8(idx_bit >>> 3) & (1 << idx_byte_bit)) >> idx_byte_bit;
    }

    set_bit(idx_bit, value) {


        const { dv } = this;
        const idx_byte = idx_bit >>> 3;
        const idx_byte_bit = idx_bit & 7;
        const byte_mask = 1 << idx_byte_bit;
        const read_byte = dv.getUint8(idx_byte);
        const value_mask = -value;
        dv.setUint8(idx_byte, (read_byte & ~byte_mask) | (value_mask & byte_mask));
        

        /*
        const {dv} = this;
        // Check the byte length constraint?
        const idx_byte = idx_bit >>> 3;
        // & 7 is remainder from divide by 8
        const idx_byte_bit = idx_bit & 7;

        // 255 xor that shifted 1?
        const byte_mask = 1 << idx_byte_bit;


        // and if the value is 0....?
        //  or use the value as binary even???
        
        //dv.set
        const read_byte = dv.getUint8(idx_byte);

        // Switching off all the non-on values....
        //   1 << 


        if (value === 0) {
            //const inverse_byte_mask = ~byte_mask;
            dv.setUint8(idx_byte, read_byte & (~inverse_byte_mask));
        } else if (value === 1) {
            dv.setUint8(idx_byte, read_byte | byte_mask);
        }
        */

    }

    // set_bit_range
    //   on or off....
    // work out which bytes and up to 8 byte values to go through.
    //   may as well start doing 64 bit values at the earliest opportunity.
    // first, calculate the number of values of each size....

    // how many bits until we reach the beginning of a byte?
    //  bits_remaining from first_byte
    //    divide by 64, get the remainder.
    //      write that many 64 bit units - advance byte position by 8 each time
    //    number of units left after writing the 64 bit units
    //      bits_remaining_from_end_of_possible_64_bit_writing (63 or less) - possible because if it was only 63 or less bits then there are 0 of them
    //        write 0 or 1 32 bit units
    //      bits_remaining_from_end_of_possible_32_bit_writing (31 or less)
    //        write 0 or 1 16 bit units
    //      bits_remaining_from_end_of_possible_16_bit_writing (15 or less)
    //        write 0 or 1 8 bit units (full byte)
    //      bits remaining from end of possible 8 bit writing (7 or less)














    // 

    // 


}


if (require.main === module) {
    //const tabrw = new Typed_Array_Binary_Read_Write(new Uint32Array(16));

    const tabrw = new Typed_Array_Binary_Read_Write(new Uint8Array([1, 2, 3, 4, 252, 253, 254, 255]));

    tabrw.set_bit(4, 1);
    tabrw.set_bit(5, 1);

    console.log('tabrw.bil', tabrw.bil);


    for (let c = 0; c < tabrw.bil; c++) {
        //console.log(tabrw.get_bit(c))
    }

    // So, it seems to work.
    //   But setting ranges should help too.
    //     Getting that really fast should help with other graphical operations.




    //console.log(tabrw.get_bit())

    /*
    tabrw.forEach(element => {
        
    });
    */



}


module.exports = Typed_Array_Binary_Read_Write;