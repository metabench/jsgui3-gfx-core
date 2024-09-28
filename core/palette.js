

// 1 bit images would make use of the palette in a different way.

const {tof} = require('lang-mini');

class Palette {

    // Itself will hold colors.





    constructor(spec) {

        const t_spec = tof(spec);

        if (t_spec === 'array') {

            // Then is each of those items an array?
            


        } else {
            console.trace();

            throw 'NYI';
        }



        // Set up the proxy access here.



    }

}

module.exports = Palette;