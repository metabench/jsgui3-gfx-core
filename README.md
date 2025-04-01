# jsgui3-gfx-core

The core jsgui3 graphical data structures and algorithms

## Overview

This repository contains various files and modules related to graphical data structures and algorithms. It provides a set of classes and functions for pixel manipulation, convolution operations, resizing, thresholding, color conversion, cloning, alpha channel addition, cropping, iterating over pixels, drawing shapes, masking, splitting RGB channels, and equality checks.

## Installation

To install the repository and its dependencies, follow these steps:

1. Clone the repository:
   ```sh
   git clone https://github.com/metabench/jsgui3-gfx-core.git
   ```

2. Navigate to the repository directory:
   ```sh
   cd jsgui3-gfx-core
   ```

3. Install the dependencies:
   ```sh
   npm install
   ```

## Usage

Here are some usage examples demonstrating how to utilize key modules and functions within the repository:

### Example 1: Pixel Manipulation

```js
const Pixel_Buffer_Core = require('./core/pixel-buffer-3-core');

const pb = new Pixel_Buffer_Core({
    bits_per_pixel: 8,
    size: [8, 8]
});

const ta_pos = new Int16Array(2);
ta_pos[0] = 3;
ta_pos[1] = 3;
pb.set_pixel(ta_pos, 255);

console.log(pb.get_pixel(ta_pos)); // Output: 255
```

### Example 2: Convolution Operation

```js
const Float32Convolution = require('./core/convolution');

const convolution = new Float32Convolution({
    size: [3, 3],
    value: [0, -1, 0, -1, 5, -1, 0, -1, 0]
});

const pb = new Pixel_Buffer_Core({
    bits_per_pixel: 24,
    size: [8, 8]
});

const convolved_pb = pb.new_convolved(convolution);

console.log(convolved_pb);
```

## Key Modules and Functionalities

### `core/convolution.js`

This module defines the `Convolution` and `Float32Convolution` classes, which handle convolution operations. The `Float32Convolution` class extends `Convolution` and provides methods to apply convolution kernels to pixel buffers.

### `core/pixel-buffer-3-core.js`

This module defines the `Pixel_Buffer_Core` class, which provides methods for pixel manipulation, convolution operations, resizing, thresholding, color conversion, cloning, alpha channel addition, cropping, iterating over pixels, drawing shapes, masking, splitting RGB channels, and equality checks.

## Main Classes

### `Pixel_Buffer_Core`

The `Pixel_Buffer_Core` class in the `core/pixel-buffer-3-core.js` file has several main features:

* **Pixel manipulation**: The class provides methods to get and set pixel values for different bits per pixel (bipp) formats, including 1bipp, 8bipp, 24bipp, and 32bipp.
* **Convolution operations**: The class supports convolution operations, allowing the creation of new pixel buffers by applying convolution kernels.
* **Resizing**: The class includes a method to create a new resized pixel buffer.
* **Thresholding**: The class can generate a 1bipp thresholded version of an 8bipp pixel buffer.
* **Color conversion**: The class provides methods to convert pixel buffers between different color formats, such as 1bipp to 8bipp, 8bipp to 24bipp, and 24bipp to 32bipp.
* **Cloning and blank copy**: The class includes methods to create a clone or a blank copy of the pixel buffer.
* **Alpha channel addition**: The class can add an alpha channel to a pixel buffer.
* **Cropping and uncropping**: The class provides methods to crop and uncrop pixel buffers.
* **Iterating over pixels**: The class includes methods to iterate over pixels and perform operations on them.
* **Drawing shapes**: The class supports drawing shapes, such as rectangles and polygons, on the pixel buffer.
* **Masking**: The class can apply a 1bipp mask to the pixel buffer.
* **Splitting RGB channels**: The class can split the RGB channels of a pixel buffer into separate 8bipp pixel buffers.
* **Equality check**: The class includes a method to check if two pixel buffers are equal.

### `Pixel_Buffer_Core_Reference_Implementations`

The `Pixel_Buffer_Core_Reference_Implementations` class extends the `Pixel_Buffer_Core` class in several ways:

* **Additional methods**: The `Pixel_Buffer_Core_Reference_Implementations` class includes additional methods for pixel manipulation, color conversion, and other operations. These methods provide more functionality and flexibility for working with pixel buffers.
* **Enhanced pixel manipulation**: The class provides more advanced methods for manipulating pixels, such as `each_pixel`, `each_pixel_byte_index`, and `each_pixel_pos`. These methods allow for more efficient and flexible pixel manipulation.
* **Convolution operations**: The class includes a `new_convolved` method that creates a new pixel buffer by applying a convolution kernel to the original pixel buffer. This method uses a window-based approach to iterate over the pixels and apply the convolution kernel.
* **Resizing**: The class includes a `new_resized` method that creates a new resized pixel buffer. This method uses the `resize_ta_colorspace` function from `core/ta-math.js` to resize the pixel buffer.
* **Thresholding**: The class provides a `get_1bipp_threshold_8bipp` method that generates a 1bipp thresholded version of an 8bipp pixel buffer.
* **Color conversion**: The class includes methods to convert pixel buffers between different color formats, such as `to_8bipp`, `to_24bipp`, and `to_32bit_rgba`.
* **Cloning and blank copy**: The class includes methods to create a clone or a blank copy of the pixel buffer, such as `clone` and `blank_copy`.
* **Alpha channel addition**: The class provides an `add_alpha_channel` method to add an alpha channel to a pixel buffer.
* **Cropping and uncropping**: The class includes methods to crop and uncrop pixel buffers, such as `crop` and `uncrop`.
* **Iterating over pixels**: The class provides methods to iterate over pixels and perform operations on them, such as `each_pixel`, `each_pixel_byte_index`, and `each_pixel_pos`.
* **Drawing shapes**: The class includes methods for drawing shapes, such as `draw_rect` and `paint_solid_border`.
* **Masking**: The class provides a `draw_1bipp_pixel_buffer_mask` method to apply a 1bipp mask to the pixel buffer.
* **Splitting RGB channels**: The class includes a `split_rgb_channels` method to split the RGB channels of a pixel buffer into separate 8bipp pixel buffers.
* **Equality check**: The class provides an `equals` method to check if two pixel buffers are equal.

### `Pixel_Buffer_Advanced_TypedArray_Properties`

This class, found in `core/pixel-buffer-4-advanced-typedarray-properties.js`, extends `Pixel_Buffer_Core` and adds advanced typed array properties for efficient pixel manipulation.

### `Pixel_Buffer_Idiomatic_Enh`

Located in `core/pixel-buffer-5-idiomatic-enh.js`, this class extends `Pixel_Buffer_Advanced_TypedArray_Properties` and provides idiomatic enhancements for pixel manipulation.

### `Pixel_Buffer_Painter`

The `Pixel_Buffer_Painter` class in the `core/pixel-buffer-painter.js` file provides methods for drawing shapes on a pixel buffer. Here are the main features and functionalities of the `Pixel_Buffer_Painter` class:

* **Initialization**: The class is initialized with a `Pixel_Buffer` object, which is used as the target for drawing operations.
* **Drawing rectangles**: The `rect` method allows drawing rectangles on the pixel buffer. It takes the position, size, and color of the rectangle as parameters and uses the `fill_solid_rect_by_bounds` function from `ta_math` to fill the specified area with the given color.
* **Chaining**: The `rect` method returns the `Pixel_Buffer_Painter` instance, allowing for method chaining. This enables multiple drawing operations to be performed in a single statement, such as `paint.rect(...).rect(...)`.

The `Pixel_Buffer_Painter` class simplifies the process of drawing shapes on a pixel buffer by providing a convenient interface and leveraging lower-level functions for efficient pixel manipulation. The class can be extended to support additional shapes and drawing operations as needed.

### `Pixel_Pos_List`

Located in `core/pixel-pos-list.js`, this class manages a list of pixel positions and provides methods for adding, iterating, and sorting pixels.

### `Rectangle`

This class, found in `core/shapes/Rectangle.js`, represents a rectangle shape and provides methods for manipulating its dimensions and position.

### `Polygon`

Located in `core/shapes/Polygon.js`, this class represents a polygon shape and provides methods for manipulating its points and calculating derived data.

### `Polygon_Edges`

This class, found in `core/shapes/Polygon_Edges.js`, represents the edges of a polygon and provides methods for populating and sorting edges.

### `Polygon_Scanline_Edges`

Located in `core/shapes/Polygon_Scanline_Edges.js`, this class extends `Polygon_Edges` and provides methods for managing active edges during scanline processing.

### `TA_Table_8_Columns`

This class, found in `core/shapes/TA_Table_8_Columns.js`, represents a table with 8 columns and provides methods for getting and setting values in the table.

## Contributing

We welcome contributions to the project! If you would like to contribute, please follow these guidelines:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Make your changes and commit them with clear and concise messages.
4. Push your changes to your forked repository.
5. Create a pull request with a detailed description of your changes.

## Documentation and Resources

For more information on the repository and its usage, please refer to the following resources:

* [API Documentation](./docs/api.md)
* [Examples](./examples)
* [Issues](https://github.com/metabench/jsgui3-gfx-core/issues)

If you have any questions or need further assistance, feel free to open an issue or contact the maintainers.

## Convolution Operations in `Pixel_Buffer_Core`

Convolution operations in the `Pixel_Buffer_Core` class work as follows:

* **Convolution class**: The `core/convolution.js` file defines a `Convolution` class and a `Float32Convolution` class that handle convolution operations. The `Float32Convolution` class extends `Convolution` and provides methods to apply convolution kernels to pixel buffers.
* **Convolution kernels**: The `core/convolution-kernels/kernels.js` file contains predefined convolution kernels, such as edge detection, Gaussian blur, Laplacian of Gaussian, and Sobel filters. These kernels are used to perform various convolution operations on pixel buffers.
* **Applying convolution**: The `Pixel_Buffer_Core` class in `core/pixel-buffer-3-core.js` provides a `new_convolved` method that creates a new pixel buffer by applying a convolution kernel to the original pixel buffer. This method uses a window-based approach to iterate over the pixels and apply the convolution kernel.
* **Window-based approach**: The `new_convolved` method creates a window of the same size as the convolution kernel and iterates over the pixel buffer within the bounds of this window. For each position within the window, the method calculates the convolution result by applying the kernel to the corresponding pixels in the original pixel buffer.
* **Convolution result**: The convolution result is stored in a new pixel buffer, which is returned by the `new_convolved` method. This new pixel buffer contains the convolved image, which can be used for further processing or display.

## `Pixel_Buffer_Painter` Class

The `Pixel_Buffer_Painter` class in the `core/pixel-buffer-painter.js` file provides methods for drawing shapes on a pixel buffer. Here are the main features and functionalities of the `Pixel_Buffer_Painter` class:

* **Initialization**: The class is initialized with a `Pixel_Buffer` object, which is used as the target for drawing operations.
* **Drawing rectangles**: The `rect` method allows drawing rectangles on the pixel buffer. It takes the position, size, and color of the rectangle as parameters and uses the `fill_solid_rect_by_bounds` function from `ta_math` to fill the specified area with the given color.
* **Chaining**: The `rect` method returns the `Pixel_Buffer_Painter` instance, allowing for method chaining. This enables multiple drawing operations to be performed in a single statement, such as `paint.rect(...).rect(...)`.

The `Pixel_Buffer_Painter` class simplifies the process of drawing shapes on a pixel buffer by providing a convenient interface and leveraging lower-level functions for efficient pixel manipulation. The class can be extended to support additional shapes and drawing operations as needed.

## Extending `Pixel_Buffer_Core` with `Pixel_Buffer_Core_Reference_Implementations`

The `Pixel_Buffer_Core_Reference_Implementations` class extends the `Pixel_Buffer_Core` class in several ways:

* **Additional methods**: The `Pixel_Buffer_Core_Reference_Implementations` class includes additional methods for pixel manipulation, color conversion, and other operations. These methods provide more functionality and flexibility for working with pixel buffers.
* **Enhanced pixel manipulation**: The class provides more advanced methods for manipulating pixels, such as `each_pixel`, `each_pixel_byte_index`, and `each_pixel_pos`. These methods allow for more efficient and flexible pixel manipulation.
* **Convolution operations**: The class includes a `new_convolved` method that creates a new pixel buffer by applying a convolution kernel to the original pixel buffer. This method uses a window-based approach to iterate over the pixels and apply the convolution kernel.
* **Resizing**: The class includes a `new_resized` method that creates a new resized pixel buffer. This method uses the `resize_ta_colorspace` function from `core/ta-math.js` to resize the pixel buffer.
* **Thresholding**: The class provides a `get_1bipp_threshold_8bipp` method that generates a 1bipp thresholded version of an 8bipp pixel buffer.
* **Color conversion**: The class includes methods to convert pixel buffers between different color formats, such as `to_8bipp`, `to_24bipp`, and `to_32bit_rgba`.
* **Cloning and blank copy**: The class includes methods to create a clone or a blank copy of the pixel buffer, such as `clone` and `blank_copy`.
* **Alpha channel addition**: The class provides an `add_alpha_channel` method to add an alpha channel to a pixel buffer.
* **Cropping and uncropping**: The class includes methods to crop and uncrop pixel buffers, such as `crop` and `uncrop`.
* **Iterating over pixels**: The class provides methods to iterate over pixels and perform operations on them, such as `each_pixel`, `each_pixel_byte_index`, and `each_pixel_pos`.
* **Drawing shapes**: The class includes methods for drawing shapes, such as `draw_rect` and `paint_solid_border`.
* **Masking**: The class provides a `draw_1bipp_pixel_buffer_mask` method to apply a 1bipp mask to the pixel buffer.
* **Splitting RGB channels**: The class includes a `split_rgb_channels` method to split the RGB channels of a pixel buffer into separate 8bipp pixel buffers.
* **Equality check**: The class provides an `equals` method to check if two pixel buffers are equal.
