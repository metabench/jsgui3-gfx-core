'use strict';

const SUPPORTED_BITS_PER_PIXEL = Object.freeze([1, 8, 24, 32]);
const DEFAULT_STORAGE_ALIGNMENT_BYTES = 8;

const assertPositiveSafeInteger = (value, name) => {
    if (!Number.isSafeInteger(value) || value <= 0) {
        throw new RangeError(`${name} must be a positive safe integer; received ${value}`);
    }
};

const assertNonNegativeSafeInteger = (value, name) => {
    if (!Number.isSafeInteger(value) || value < 0) {
        throw new RangeError(`${name} must be a non-negative safe integer; received ${value}`);
    }
};

const checkedMultiply = (a, b, name) => {
    const result = a * b;
    if (!Number.isSafeInteger(result)) {
        throw new RangeError(`${name} exceeds JavaScript's safe integer range`);
    }
    return result;
};

const alignUp = (value, alignment, name = 'aligned value') => {
    assertNonNegativeSafeInteger(value, name);
    assertPositiveSafeInteger(alignment, 'alignment');

    const remainder = value % alignment;
    if (remainder === 0) return value;

    const result = value + alignment - remainder;
    if (!Number.isSafeInteger(result)) {
        throw new RangeError(`${name} exceeds JavaScript's safe integer range`);
    }
    return result;
};

const isByteStorage = value =>
    value instanceof Uint8Array || value instanceof Uint8ClampedArray;

const createPixelBufferLayout = (
    spec,
    capacityByteLengthOverride,
    capacityAlignmentBytesOverride
) => {
    if (!spec || typeof spec !== 'object') {
        throw new TypeError('A pixel-buffer layout specification is required');
    }

    const width = spec.width;
    const height = spec.height;
    const bitsPerPixel = spec.bitsPerPixel;
    const rowAlignmentBytes = spec.rowAlignmentBytes === undefined
        ? 1
        : spec.rowAlignmentBytes;

    assertPositiveSafeInteger(width, 'width');
    assertPositiveSafeInteger(height, 'height');

    if (!SUPPORTED_BITS_PER_PIXEL.includes(bitsPerPixel)) {
        throw new RangeError(
            `bitsPerPixel must be one of ${SUPPORTED_BITS_PER_PIXEL.join(', ')}; received ${bitsPerPixel}`
        );
    }

    assertPositiveSafeInteger(rowAlignmentBytes, 'rowAlignmentBytes');
    const alignmentExponent = Math.round(Math.log2(rowAlignmentBytes));
    if (2 ** alignmentExponent !== rowAlignmentBytes) {
        throw new RangeError('rowAlignmentBytes must be a power of two');
    }

    const rowDataBits = checkedMultiply(width, bitsPerPixel, 'rowDataBits');
    const rowDataBytes = Math.ceil(rowDataBits / 8);

    let rowStrideBytes;
    if (spec.rowStrideBytes === undefined) {
        rowStrideBytes = alignUp(rowDataBytes, rowAlignmentBytes, 'rowStrideBytes');
    } else {
        rowStrideBytes = spec.rowStrideBytes;
        assertPositiveSafeInteger(rowStrideBytes, 'rowStrideBytes');
        if (rowStrideBytes < rowDataBytes) {
            throw new RangeError(
                `rowStrideBytes (${rowStrideBytes}) cannot be smaller than rowDataBytes (${rowDataBytes})`
            );
        }
        if (rowStrideBytes % rowAlignmentBytes !== 0) {
            throw new RangeError(
                `rowStrideBytes (${rowStrideBytes}) must be aligned to rowAlignmentBytes (${rowAlignmentBytes})`
            );
        }
    }

    const logicalByteLength = checkedMultiply(
        rowStrideBytes,
        height,
        'logicalByteLength'
    );

    const capacityAlignmentBytes = capacityAlignmentBytesOverride === undefined
        ? (spec.capacityAlignmentBytes === undefined ? 1 : spec.capacityAlignmentBytes)
        : capacityAlignmentBytesOverride;
    assertPositiveSafeInteger(capacityAlignmentBytes, 'capacityAlignmentBytes');

    const requestedCapacityByteLength = capacityByteLengthOverride === undefined
        ? spec.capacityByteLength
        : capacityByteLengthOverride;
    const capacityByteLength = requestedCapacityByteLength === undefined
        ? alignUp(logicalByteLength, capacityAlignmentBytes, 'capacityByteLength')
        : requestedCapacityByteLength;

    assertNonNegativeSafeInteger(capacityByteLength, 'capacityByteLength');
    if (capacityByteLength < logicalByteLength) {
        throw new RangeError(
            `Storage capacity is ${capacityByteLength} bytes; ${logicalByteLength} bytes are required`
        );
    }

    const tailBitCount = bitsPerPixel === 1 ? width & 7 : 0;
    const tailMask = tailBitCount === 0
        ? 0xFF
        : (0xFF << (8 - tailBitCount)) & 0xFF;

    return Object.freeze({
        width,
        height,
        bitsPerPixel,
        bytesPerPixel: bitsPerPixel === 1 ? 0 : bitsPerPixel / 8,
        rowDataBits,
        rowDataBytes,
        rowStrideBytes,
        logicalByteLength,
        capacityByteLength,
        rowAlignmentBytes,
        bitOrder: 'msb-first',
        rowPacking: 'byte-aligned',
        rowPaddingPolicy: 'zero-filled',
        tailMask
    });
};

const createPixelBufferStorage = (layoutSpec, suppliedStorage) => {
    let storage;
    let layout;

    if (suppliedStorage === undefined) {
        layout = createPixelBufferLayout(
            layoutSpec,
            undefined,
            DEFAULT_STORAGE_ALIGNMENT_BYTES
        );
        storage = new Uint8Array(layout.capacityByteLength);
    } else {
        if (!isByteStorage(suppliedStorage)) {
            throw new TypeError(
                'Pixel-buffer storage must be a Uint8Array, Uint8ClampedArray, or Buffer view'
            );
        }
        storage = suppliedStorage;
        layout = createPixelBufferLayout(layoutSpec, storage.byteLength);
    }

    // subarray preserves the constructor, backing ArrayBuffer and byteOffset of
    // caller-supplied views while preventing image algorithms from seeing spare
    // capacity as logical pixels.
    const ta = storage.subarray(0, layout.logicalByteLength);

    return {layout, storage, ta};
};

const canonicalizePixelBufferStorage = (ta, layout) => {
    const hasTailBits = layout.bitsPerPixel === 1 && layout.tailMask !== 0xFF;
    const hasRowPadding = layout.rowStrideBytes !== layout.rowDataBytes;

    if (!hasTailBits && !hasRowPadding) return ta;

    const lastDataByteOffset = layout.rowDataBytes - 1;
    for (let y = 0, rowStart = 0; y < layout.height; y++, rowStart += layout.rowStrideBytes) {
        if (hasTailBits) {
            ta[rowStart + lastDataByteOffset] &= layout.tailMask;
        }
        if (hasRowPadding) {
            ta.fill(0, rowStart + layout.rowDataBytes, rowStart + layout.rowStrideBytes);
        }
    }

    return ta;
};

module.exports = {
    SUPPORTED_BITS_PER_PIXEL,
    DEFAULT_STORAGE_ALIGNMENT_BYTES,
    alignUp,
    createPixelBufferLayout,
    createPixelBufferStorage,
    canonicalizePixelBufferStorage,
    isByteStorage
};
