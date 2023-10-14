
// Later may separate into jsgui3-geometry and have gfx require that???
//.  jsgui3-shapes ???

// 



//const gm = require('gm');
// That would mean server side only
// gfx is both for client and server.

// 2023 - Considering making jsgui3-html depend on this.
//.  It could be of use for some collision-detection like features, and with canvas.

// Want some more graphics primitives as classes. Would help with expressing some geometric operations.
//.  Such as check a box that extends to the left of a control (80 pixels) to detect whether and where it intersects any of a control's siblings.

// A geometry core looks like it would be useful.
//.  Maybe call it 'shapes' for the moment???

// Shape_Group ????

// Object_Group???
// Class_Group???
// Instance_Group???

// Collective ???
//.  Address it collectively, ie it acts as a proxy for calling all of them.
//.  Seems like a lang-mini or lang-tools feature.

// Typed_Collective ??? Where each item in there must be an instanceOf the type_class

// Would be useful for addressing a bunch of shapes at once.








//.  Shape
//     Rectangle
//.      .extend('left', 80) for example.

// shape.render_to_pixel_buffer(pixel_buffer, pos) ???
//.  generate pixel buffers (such as a 1/0 mask, or an opacity mask) to represent a shape.

// Being able to express how to detect intersections between shapes.
//.  Being able to get the shapes including sizes and positions of rectangular divs, and then use geometry operations to do things like
//.    detect distances between them.
//.  Get the geometry processing lower level functions working well and efficiently, with convenient syntax, and 




// pixel_buffer.paint_shape ???



// jsgui3-html control.bcr could be changed to return a graphics shape class.




const Rectangle = require('./shapes/Rectangle');



const gfx_core = {
    Pixel_Pos_List: require('./pixel-pos-list'),
    Pixel_Buffer: require('./pixel-buffer'),
    Pixel_Buffer_Painter: require('./pixel-buffer-painter'),
    convolution_kernels: require('./convolution-kernels/kernels'),
    ta_math: require('./ta-math'),
    Rectangle,
    Rect: Rectangle
}

module.exports = gfx_core;