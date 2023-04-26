
//const gm = require('gm');
// That would mean server side only
// gfx is both for client and server.

const gfx_core = {
    Pixel_Pos_List: require('./pixel-pos-list'),
    Pixel_Buffer: require('./pixel-buffer'),
    Pixel_Buffer_Painter: require('./pixel-buffer-painter'),
    convolution_kernels: require('./convolution-kernels/kernels'),
    ta_math: require('./ta-math')
}

module.exports = gfx_core;