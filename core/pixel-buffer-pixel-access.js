'use strict';

// These functions are deliberately not installed on Pixel_Buffer prototypes.
// Public methods validate first; internal loops may import the unsafe kernels
// only after proving their bounds once at operation setup.

const assertPixelPosition = (pixelBuffer, position) => {
    if (position === null || position === undefined || position.length < 2) {
        throw new TypeError('Pixel position must contain two safe integers');
    }
    const x = position[0], y = position[1];
    const commonInt32 = (x | 0) === x && (y | 0) === y;
    if (!commonInt32 && (!Number.isSafeInteger(x) || !Number.isSafeInteger(y))) {
        throw new TypeError('Pixel position must contain two safe integers');
    }
    if (x < 0 || y < 0 || x >= pixelBuffer.size[0] || y >= pixelBuffer.size[1]) {
        throw new RangeError(
            `Pixel position [${x}, ${y}] is outside ${pixelBuffer.size[0]}x${pixelBuffer.size[1]}`
        );
    }
};

const assertPixelXY = (pixelBuffer, x, y) => {
    const commonInt32 = (x | 0) === x && (y | 0) === y;
    if (!commonInt32 && (!Number.isSafeInteger(x) || !Number.isSafeInteger(y))) {
        throw new TypeError('Pixel coordinates must be safe integers');
    }
    if (x < 0 || y < 0 || x >= pixelBuffer.size[0] || y >= pixelBuffer.size[1]) {
        throw new RangeError(
            `Pixel position [${x}, ${y}] is outside ${pixelBuffer.size[0]}x${pixelBuffer.size[1]}`
        );
    }
};

const assertPixelIndex = (pixelBuffer, index) => {
    if ((index | 0) !== index && !Number.isSafeInteger(index)) {
        throw new TypeError('Pixel index must be a safe integer');
    }
    const pixelCount = pixelBuffer.size[0] * pixelBuffer.size[1];
    if (index < 0 || index >= pixelCount) {
        throw new RangeError(`Pixel index ${index} is outside 0..${pixelCount - 1}`);
    }
};

const packedByteOffset = (pixelBuffer, x, y) =>
    y * pixelBuffer.bytes_per_row + Math.floor(x / 8);

const packedMask = x => 128 >> (x % 8);

const unsafeGetPixelByteBit1bipp = (pixelBuffer, position) => ({
    byte: packedByteOffset(pixelBuffer, position[0], position[1]),
    bit: position[0] % 8
});

const unsafeSetPixelOn1bippByIndex = (pixelBuffer, pixelIndex) => {
    const width = pixelBuffer.size[0];
    if (width % 8 === 0 && pixelBuffer.bytes_per_row === width / 8) {
        pixelBuffer.ta[Math.floor(pixelIndex / 8)] |= packedMask(pixelIndex);
    } else {
        const y = Math.floor(pixelIndex / width);
        const x = pixelIndex - y * width;
        pixelBuffer.ta[packedByteOffset(pixelBuffer, x, y)] |= packedMask(x);
    }
};

const unsafeSetPixelOff1bippByIndex = (pixelBuffer, pixelIndex) => {
    const width = pixelBuffer.size[0];
    if (width % 8 === 0 && pixelBuffer.bytes_per_row === width / 8) {
        const byte = Math.floor(pixelIndex / 8);
        pixelBuffer.ta[byte] &= ~packedMask(pixelIndex) & 255;
    } else {
        const y = Math.floor(pixelIndex / width);
        const x = pixelIndex - y * width;
        const byte = packedByteOffset(pixelBuffer, x, y);
        pixelBuffer.ta[byte] &= ~packedMask(x) & 255;
    }
};

const unsafeSetPixelOn1bippXY = (pixelBuffer, x, y) => {
    pixelBuffer.ta[packedByteOffset(pixelBuffer, x, y)] |= packedMask(x);
};

const unsafeSetPixelOn1bipp = (pixelBuffer, position) =>
    unsafeSetPixelOn1bippXY(pixelBuffer, position[0], position[1]);

const unsafeSetPixelOff1bipp = (pixelBuffer, position) => {
    const x = position[0];
    const byte = packedByteOffset(pixelBuffer, x, position[1]);
    pixelBuffer.ta[byte] &= ~packedMask(x) & 255;
};

const unsafeSetPixel1bipp = (pixelBuffer, position, color) => {
    if (color === 1) unsafeSetPixelOn1bipp(pixelBuffer, position);
    else unsafeSetPixelOff1bipp(pixelBuffer, position);
};

const unsafeSetPixel8bipp = (pixelBuffer, position, color) => {
    pixelBuffer.ta[position[1] * pixelBuffer.bytes_per_row + position[0]] = color;
};

const unsafeSetPixel24bipp = (pixelBuffer, position, color) => {
    let byte = position[1] * pixelBuffer.bytes_per_row + position[0] * 3;
    pixelBuffer.ta[byte++] = color[0];
    pixelBuffer.ta[byte++] = color[1];
    pixelBuffer.ta[byte] = color[2];
};

const unsafeSetPixel32bipp = (pixelBuffer, position, color) => {
    let byte = position[1] * pixelBuffer.bytes_per_row + position[0] * 4;
    pixelBuffer.ta[byte++] = color[0];
    pixelBuffer.ta[byte++] = color[1];
    pixelBuffer.ta[byte++] = color[2];
    pixelBuffer.ta[byte] = color[3];
};

const unsafeSetPixelByIndex1bipp = (pixelBuffer, index, color) => {
    if (color === 1) unsafeSetPixelOn1bippByIndex(pixelBuffer, index);
    else unsafeSetPixelOff1bippByIndex(pixelBuffer, index);
};

const byteOffsetByIndex = (pixelBuffer, index, bytesPerPixel) => {
    const width = pixelBuffer.size[0];
    const tightStride = width * bytesPerPixel;
    if (pixelBuffer.bytes_per_row === tightStride) return index * bytesPerPixel;
    const y = Math.floor(index / width);
    return y * pixelBuffer.bytes_per_row + (index - y * width) * bytesPerPixel;
};

const unsafeSetPixelByIndex8bipp = (pixelBuffer, index, color) => {
    pixelBuffer.ta[byteOffsetByIndex(pixelBuffer, index, 1)] = color;
};

const unsafeSetPixelByIndex24bipp = (pixelBuffer, index, color) => {
    const byte = byteOffsetByIndex(pixelBuffer, index, 3);
    pixelBuffer.ta[byte] = color[0];
    pixelBuffer.ta[byte + 1] = color[1];
    pixelBuffer.ta[byte + 2] = color[2];
};

const unsafeSetPixelByIndex32bipp = (pixelBuffer, index, color) => {
    const byte = byteOffsetByIndex(pixelBuffer, index, 4);
    pixelBuffer.ta[byte] = color[0];
    pixelBuffer.ta[byte + 1] = color[1];
    pixelBuffer.ta[byte + 2] = color[2];
    pixelBuffer.ta[byte + 3] = color[3];
};

const unsafeSetPixelByIndex = (pixelBuffer, index, color) => {
    switch (pixelBuffer.bipp) {
        case 1: return unsafeSetPixelByIndex1bipp(pixelBuffer, index, color);
        case 8: return unsafeSetPixelByIndex8bipp(pixelBuffer, index, color);
        case 24: return unsafeSetPixelByIndex24bipp(pixelBuffer, index, color);
        case 32: return unsafeSetPixelByIndex32bipp(pixelBuffer, index, color);
        default: throw new Error(`Unsupported bits per pixel: ${pixelBuffer.bipp}`);
    }
};

const unsafeSetPixel = (pixelBuffer, position, color) => {
    switch (pixelBuffer.bipp) {
        case 1: return unsafeSetPixel1bipp(pixelBuffer, position, color);
        case 8: return unsafeSetPixel8bipp(pixelBuffer, position, color);
        case 24: return unsafeSetPixel24bipp(pixelBuffer, position, color);
        case 32: return unsafeSetPixel32bipp(pixelBuffer, position, color);
        default: throw new Error(`Unsupported bits per pixel: ${pixelBuffer.bipp}`);
    }
};

const unsafeGetPixelByIndex1bipp = (pixelBuffer, index) => {
    const width = pixelBuffer.size[0];
    let byte, bit;
    if (width % 8 === 0 && pixelBuffer.bytes_per_row === width / 8) {
        byte = Math.floor(index / 8);
        bit = index % 8;
    } else {
        const y = Math.floor(index / width);
        const x = index - y * width;
        byte = packedByteOffset(pixelBuffer, x, y);
        bit = x % 8;
    }
    const mask = 128 >> bit;
    return (pixelBuffer.ta[byte] & mask) === mask ? 1 : 0;
};

const unsafeGetPixelByIndex8bipp = (pixelBuffer, index) =>
    pixelBuffer.ta[byteOffsetByIndex(pixelBuffer, index, 1)];

const unsafeGetPixelByIndex24bipp = (pixelBuffer, index) => {
    const byte = byteOffsetByIndex(pixelBuffer, index, 3);
    return pixelBuffer.ta.slice(byte, byte + 3);
};

const unsafeGetPixelByIndex32bipp = (pixelBuffer, index) => {
    const byte = byteOffsetByIndex(pixelBuffer, index, 4);
    return pixelBuffer.ta.slice(byte, byte + 4);
};

const unsafeGetPixelByIndex = (pixelBuffer, index) => {
    switch (pixelBuffer.bipp) {
        case 1: return unsafeGetPixelByIndex1bipp(pixelBuffer, index);
        case 8: return unsafeGetPixelByIndex8bipp(pixelBuffer, index);
        case 24: return unsafeGetPixelByIndex24bipp(pixelBuffer, index);
        case 32: return unsafeGetPixelByIndex32bipp(pixelBuffer, index);
        default: throw new Error(`Unsupported bits per pixel: ${pixelBuffer.bipp}`);
    }
};

const unsafeGetPixel1bipp = (pixelBuffer, position) => {
    const x = position[0];
    return (pixelBuffer.ta[packedByteOffset(pixelBuffer, x, position[1])] & packedMask(x)) !== 0
        ? 1
        : 0;
};

const unsafeGetPixel8bipp = (pixelBuffer, position) =>
    pixelBuffer.ta[position[1] * pixelBuffer.bytes_per_row + position[0]];

const unsafeGetPixel24bipp = (pixelBuffer, position) => {
    const byte = position[1] * pixelBuffer.bytes_per_row + position[0] * 3;
    return pixelBuffer.ta.slice(byte, byte + 3);
};

const unsafeGetPixel32bipp = (pixelBuffer, position) => {
    const byte = position[1] * pixelBuffer.bytes_per_row + position[0] * 4;
    return pixelBuffer.ta.slice(byte, byte + 4);
};

const unsafeGetPixel = (pixelBuffer, position) => {
    switch (pixelBuffer.bipp) {
        case 1: return unsafeGetPixel1bipp(pixelBuffer, position);
        case 8: return unsafeGetPixel8bipp(pixelBuffer, position);
        case 24: return unsafeGetPixel24bipp(pixelBuffer, position);
        case 32: return unsafeGetPixel32bipp(pixelBuffer, position);
        default: throw new Error(`Unsupported bits per pixel: ${pixelBuffer.bipp}`);
    }
};

module.exports = {
    assertPixelPosition,
    assertPixelXY,
    assertPixelIndex,
    unsafeGetPixelByteBit1bipp,
    unsafeSetPixelOn1bippByIndex,
    unsafeSetPixelOff1bippByIndex,
    unsafeSetPixelOn1bippXY,
    unsafeSetPixelOn1bipp,
    unsafeSetPixelOff1bipp,
    unsafeSetPixel1bipp,
    unsafeSetPixel8bipp,
    unsafeSetPixel24bipp,
    unsafeSetPixel32bipp,
    unsafeSetPixelByIndex1bipp,
    unsafeSetPixelByIndex8bipp,
    unsafeSetPixelByIndex24bipp,
    unsafeSetPixelByIndex32bipp,
    unsafeSetPixelByIndex,
    unsafeSetPixel,
    unsafeGetPixelByIndex1bipp,
    unsafeGetPixelByIndex8bipp,
    unsafeGetPixelByIndex24bipp,
    unsafeGetPixelByIndex32bipp,
    unsafeGetPixelByIndex,
    unsafeGetPixel1bipp,
    unsafeGetPixel8bipp,
    unsafeGetPixel24bipp,
    unsafeGetPixel32bipp,
    unsafeGetPixel
};
