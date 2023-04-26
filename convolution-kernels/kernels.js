//generateGaussianKernel = require('gaussian-convolution-kernel');


/*
 * Generates a kernel used for the gaussian blur effect.
 *
 * @param dimension is an odd integer
 * @param sigma is the standard deviation used for our gaussian function.
 *
 * @returns an array with dimension^2 number of numbers, all less than or equal
 *   to 1. Represents our gaussian blur kernel.
 */
function generateGaussianKernel(dimension, sigma) {

    /*

    Copyright (c) 2016, Andrey Sidorov

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted, provided that the above
    copyright notice and this permission notice appear in all copies.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
    WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
    MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
    ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
    WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
    ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
    OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

    */

    function hypotenuse(x1, y1, x2, y2) {
      var xSquare = Math.pow(x1 - x2, 2);
      var ySquare = Math.pow(y1 - y2, 2);
      return Math.sqrt(xSquare + ySquare);
    }

    if (!(dimension % 2) || Math.floor(dimension) !== dimension || dimension<3) {
      throw new Error(
        'The dimension must be an odd integer greater than or equal to 3'
      );
    }
    var kernel = [];
  
    var twoSigmaSquare = 2 * sigma * sigma;
    var centre = (dimension - 1) / 2;
  
    for (var i = 0; i < dimension; i++) {
      for (var j = 0; j < dimension; j++) {
        var distance = hypotenuse(i, j, centre, centre);
  
        // The following is an algorithm that came from the gaussian blur
        // wikipedia page [1].
        //
        // http://en.wikipedia.org/w/index.php?title=Gaussian_blur&oldid=608793634#Mechanics
        var gaussian = (1 / Math.sqrt(
          Math.PI * twoSigmaSquare
        )) * Math.exp((-1) * (Math.pow(distance, 2) / twoSigmaSquare));
  
        kernel.push(gaussian);
      }
    }
  
    // Returns the unit vector of the kernel array.
    var sum = kernel.reduce(function (c, p) { return c + p; });
    return kernel.map(function (e) { return e / sum; });
  }

module.exports = {
    'edge': new Float32Array(
        [
            -1, -1, -1,
            -1, 8, -1,
            -1, -1, -1
        ]
    ),
    'gauss_blur_5_2': generateGaussianKernel(5, 2),
    'gauss_blur_5_5': generateGaussianKernel(5, 5),
    'get_gauss': (d, sigma) => new Float32Array(generateGaussianKernel(d, sigma)),
    'lap_gauss_5': new Int8Array([
        0, 0, -1, 0, 0,
        0, -1, -2, -1, 0,
        -1, -2, 16, -2, -1,
        0, -1, -2, -1, 0,
        0, 0, -1, 0, 0
    ]),
    'sobel_x': new Int8Array([
        -1, 0, 1,
        -2, 0, 2,
        -1, 0, 1
    ]),
    'sobel_y': new Int8Array([
        1, 2, 1,
        0, 0, 0,
        -1, -2, -1
    ]),
    'sobel_diag_1': new Int8Array([
        0, 1, 2,
        -1, 0, 1,
        -2, -1, 0
    ]),
    'sobel_diag_2': new Int8Array([
        -2, -1, 0,
        -1, 0, 1,
        0, 1, 2
    ])
}