
const get_instance = () => {

    // Write, not paint?



    const fill_solid_rect_by_bounds_8bipp = (ta_dest, bypr_dest, ta_bounds, ui8_color) => {
        // create a row filled with that color.

        // need the bypr of dest.

        const row_width = ta_bounds[2] - ta_bounds[0];
        const bytes_per_row = row_width;
        const ta_write_row = (new Uint8ClampedArray(bytes_per_row)).fill(ui8_color);
        // iterate through you values...

        const byi_dest_start = (ta_bounds[0]) + (ta_bounds[1] * bypr_dest);
        let byi_write = byi_dest_start;

        for (let y = ta_bounds[1]; y < ta_bounds[3]; y++) {
            //console.log('byi_read, byi_write', [byi_read, byi_write]);
            ta_dest.set(ta_write_row, byi_write);
            //byi_read += bytes_source_row_jump;
            byi_write += bypr_dest;
        }
    }

    // And make the 24 bipp version.
    //  Setting up the initial row would take longer.
    //   Worth having the function written in a ta-access more purely mathematical way.
    //    May make more functions for the pb classes that wrap these in a cool / efficient way.


    const fill_solid_rect_by_bounds_24bipp = (ta_dest, bypr_dest, ta_bounds, ta_rgb) => {
        // create a row filled with that color.

        // need the bypr of dest.

        const row_width = ta_bounds[2] - ta_bounds[0];
        const bytes_per_row = row_width * 3;
        const ta_write_row = (new Uint8ClampedArray(bytes_per_row));

        //const l = 

        let cc = 0, c = 0;
        while (c < bytes_per_row) {
            ta_write_row[c++] = ta_rgb[cc++];
            //cc++;
            if (cc === 3) cc = 0;
            //c++;
        }
        // iterate through you values...

        const byi_dest_start = (ta_bounds[0] * 3) + (ta_bounds[1] * bypr_dest);
        let byi_write = byi_dest_start;

        for (let y = ta_bounds[1]; y < ta_bounds[3]; y++) {
            //console.log('byi_read, byi_write', [byi_read, byi_write]);
            ta_dest.set(ta_write_row, byi_write);
            //byi_read += bytes_source_row_jump;
            byi_write += bypr_dest;
        }
    }


    // A ta-math directory may be better.
    //  directories:
    //  read
    //  copy
    //  write / paint




    // paint_rect
    //  maybe have paint functions separate
    //  copy functions separate




    const fill_solid_rect_by_bounds = (ta_dest, bypr_dest, ta_bounds, bipp, color) => {
        // Polymorphism with color being a number or a typed array?
        

        // Call a different specific function depending on curcumstances?

        if (bipp === 8) {
            return fill_solid_rect_by_bounds_8bipp(ta_dest, bypr_dest, ta_bounds, color);
        } else if (bipp === 24) {
            return fill_solid_rect_by_bounds_24bipp(ta_dest, bypr_dest, ta_bounds, color);
        } else if (bipp === 32) {
            console.trace();
            throw 'NYI';
        } else {
            console.trace();
            
            throw 'Unsupported bipp: ' + bipp;
        }
    }




    return {
        fill_solid_rect_by_bounds: fill_solid_rect_by_bounds,
        fill_solid_rect_by_bounds_24bipp: fill_solid_rect_by_bounds_24bipp,
        fill_solid_rect_by_bounds_8bipp: fill_solid_rect_by_bounds_8bipp,

        get_instance: get_instance
    }
}

module.exports = get_instance();
