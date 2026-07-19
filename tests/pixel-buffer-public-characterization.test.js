'use strict';

const assert = require('assert');
const {Pixel_Buffer} = require('../core/gfx-core');
const Pixel_Buffer_Specialised_Enh = require('../core/pixel-buffer-7-specialised-enh');
const Pixel_Buffer_Perf_Focus_Enh = require('../core/pixel-buffer-6-perf-focus-enh');
const Pixel_Buffer_Idiomatic_Enh = require('../core/pixel-buffer-5-idiomatic-enh');
const Pixel_Buffer_Advanced_TypedArray_Properties = require('../core/pixel-buffer-4-advanced-typedarray-properties');
const Pixel_Buffer_Core = require('../core/pixel-buffer-3-core');
const Pixel_Buffer_Core_Reference_Implementations = require('../core/pixel-buffer-2-core-reference-implementations');
const Pixel_Buffer_Core_Masks = require('../core/pixel-buffer-1.5-core-mask');
const Pixel_Buffer_Core_Draw_Polygons = require('../core/pixel-buffer-1.2-core-draw-polygon');
const Pixel_Buffer_Core_Draw_Lines = require('../core/pixel-buffer-1.1-core-draw-line');
const Pixel_Buffer_Core_Get_Set_Pixels = require('../core/pixel-buffer-1-core-get-set-pixel');
const Pixel_Buffer_Core_Inner_Structures = require('../core/pixel-buffer-0-core-inner-structures');

const ACCESS_METHOD_PATTERN = /^(?:get_pixel(?:_|$)|set_pixel(?:_|$))/;

const EXPECTED_CHAIN = [
    'Pixel_Buffer_Specialised_Enh',
    'Pixel_Buffer_Perf_Focus_Enh',
    'Pixel_Buffer_Idiomatic_Enh',
    'Pixel_Buffer_Advanced_TypedArray_Properties',
    'Pixel_Buffer_Core',
    'Pixel_Buffer_Core_Reference_Implementations',
    'Pixel_Buffer_Core_Masks',
    'Pixel_Buffer_Core_Draw_Polygons',
    'Pixel_Buffer_Core_Draw_Lines',
    'Pixel_Buffer_Core_Get_Set_Pixels',
    'Pixel_Buffer_Core_Inner_Structures'
];

const EXPECTED_OWN_KEYS = [
    '_source_overlap_bounds', 'bipp', 'bits_per_pixel', 'bits_per_row',
    'bounds_within_source', 'buffer', 'bypp', 'bypr', 'bytes_per_pixel',
    'bytes_per_row', 'dv', 'each_pos_within_bounds', 'edge_offsets_from_center',
    'layout', 'meta', 'minus_pos', 'move', 'move_next_px', 'paint', 'pos',
    'pos_bounds', 'pos_center', 'size', 'size_bounds', 'source', 'storage', 'ta',
    'ta_24bit_color', 'ta_32bit_color', 'ta_bounds', 'ta_bounds2_scratch',
    'ta_bounds3_scratch', 'ta_bounds4_scratch', 'ta_bounds_scratch',
    'ta_colorspace', 'ta_move_vector', 'ta_offsets_info_scratch',
    'ta_offsets_scratch', 'ta_pointerpair_scratch', 'ta_pointers2_scratch',
    'ta_pointers_scratch', 'ta_pos_iterator', 'ta_pos_scratch', 'ta_row_scratch',
    'ta_scratch', 'ta_size2_scratch', 'ta_size_scratch', 'tabrw'
].sort();

const effectiveOwner = (instance, name) => {
    let prototype = Object.getPrototypeOf(instance);
    while (prototype && prototype !== Object.prototype) {
        if (Object.prototype.hasOwnProperty.call(prototype, name)) {
            return prototype;
        }
        prototype = Object.getPrototypeOf(prototype);
    }
};

const runPixelBufferPublicCharacterizationTests = () => {
    let passed = 0;
    let failed = 0;
    const test = (description, fn) => {
        try {
            fn();
            console.log(`  ${description}: \x1b[32m✔ Passed\x1b[0m`);
            passed++;
        } catch (error) {
            console.log(`  ${description}: \x1b[31m✘ Failed\x1b[0m`);
            console.error(error && error.stack ? error.stack : error);
            failed++;
        }
    };

    console.log('Running Pixel_Buffer public characterization tests...');

    test('the exported inheritance and instanceof chain remains intact', () => {
        const image = new Pixel_Buffer({size: [2, 2], bits_per_pixel: 8});
        const chain = [];
        let prototype = Object.getPrototypeOf(image);
        while (prototype && prototype !== Object.prototype) {
            chain.push(prototype.constructor.name);
            prototype = Object.getPrototypeOf(prototype);
        }
        assert.deepStrictEqual(chain, EXPECTED_CHAIN);
        for (const Constructor of [
            Pixel_Buffer, Pixel_Buffer_Specialised_Enh, Pixel_Buffer_Perf_Focus_Enh,
            Pixel_Buffer_Idiomatic_Enh, Pixel_Buffer_Advanced_TypedArray_Properties,
            Pixel_Buffer_Core, Pixel_Buffer_Core_Reference_Implementations,
            Pixel_Buffer_Core_Masks, Pixel_Buffer_Core_Draw_Polygons,
            Pixel_Buffer_Core_Draw_Lines, Pixel_Buffer_Core_Get_Set_Pixels,
            Pixel_Buffer_Core_Inner_Structures
        ]) {
            assert(image instanceof Constructor, Constructor.name);
        }
    });

    test('instance own keys and layout aliases retain the baseline contract', () => {
        const image = new Pixel_Buffer({
            size: [3, 2], bits_per_pixel: 24, rowAlignmentBytes: 4
        });
        assert.deepStrictEqual(Reflect.ownKeys(image).map(String).sort(), EXPECTED_OWN_KEYS);
        assert.strictEqual(image.buffer, image.ta);
        assert.strictEqual(image.bipp, image.bits_per_pixel);
        assert.strictEqual(image.bypp, image.bytes_per_pixel);
        assert.strictEqual(image.bypr, image.bytes_per_row);
        assert.strictEqual(image.bytes_per_row, image.layout.rowStrideBytes);
        assert.strictEqual(image.paint.pb, image);
    });

    test('effective access owners and descriptors remain compatible', () => {
        const image = new Pixel_Buffer({size: [2, 2], bits_per_pixel: 8});
        for (const name of [
            'get_pixel', 'set_pixel', 'get_pixel_by_idx', 'set_pixel_by_idx',
            'get_pixel_1bipp', 'set_pixel_1bipp'
        ]) {
            const owner = effectiveOwner(image, name);
            assert.strictEqual(owner.constructor, Pixel_Buffer_Core);
            const descriptor = Object.getOwnPropertyDescriptor(owner, name);
            assert.deepStrictEqual(
                {
                    enumerable: descriptor.enumerable,
                    configurable: descriptor.configurable,
                    writable: descriptor.writable,
                    type: typeof descriptor.value
                },
                {enumerable: false, configurable: true, writable: true, type: 'function'}
            );
        }
    });

    test('all Core access descriptors share the checked base implementation', () => {
        const accessNames = Object.getOwnPropertyNames(
            Pixel_Buffer_Core_Get_Set_Pixels.prototype
        ).filter(name => ACCESS_METHOD_PATTERN.test(name));
        assert.strictEqual(accessNames.length, 27);
        for (const name of accessNames) {
            const effective = Object.getOwnPropertyDescriptor(
                Pixel_Buffer_Core.prototype, name
            );
            const canonical = Object.getOwnPropertyDescriptor(
                Pixel_Buffer_Core_Get_Set_Pixels.prototype, name
            );
            assert.strictEqual(effective.value, canonical.value, name);
            assert.deepStrictEqual(
                {
                    enumerable: effective.enumerable,
                    configurable: effective.configurable,
                    writable: effective.writable
                },
                {
                    enumerable: canonical.enumerable,
                    configurable: canonical.configurable,
                    writable: canonical.writable
                },
                name
            );
        }
    });

    test('each_pixel reuses callback arrays and honors the stop callback', () => {
        const image = new Pixel_Buffer({size: [3, 2], bits_per_pixel: 24, rowAlignmentBytes: 4});
        image.color_whole([1, 2, 3]);
        const positions = [];
        const colors = [];
        const values = [];
        image.each_pixel((position, color, stop) => {
            positions.push(position);
            colors.push(color);
            values.push([[position[0], position[1]], [...color]]);
            if (values.length === 3) stop();
        });
        assert.strictEqual(values.length, 3);
        assert(positions.every(position => position === positions[0]));
        assert(colors.every(color => color === colors[0]));
        assert.deepStrictEqual(values, [
            [[0, 0], [1, 2, 3]],
            [[1, 0], [1, 2, 3]],
            [[2, 0], [1, 2, 3]]
        ]);
    });

    test('each_ta_24bipp retains its in-place update callback contract', () => {
        const image = new Pixel_Buffer({size: [2, 1], bits_per_pixel: 24});
        image.ta.set([1, 2, 3, 4, 5, 6]);
        const position = new Int16Array(2);
        const color = new Uint8ClampedArray(3);
        const info = new Uint32Array(4);
        const updates = [];
        image.each_ta_24bipp(position, color, info, update => {
            updates.push(update);
            color[0] += 10;
            update();
        });
        assert.strictEqual(updates.length, 2);
        assert(updates.every(update => update === updates[0]));
        assert.deepStrictEqual([...image.ta], [11, 2, 3, 14, 5, 6]);
        assert.deepStrictEqual([...info], [2, 1, 2, 24]);
    });

    test('factory methods preserve subclasses and independent storage', () => {
        class Derived_Pixel_Buffer extends Pixel_Buffer {}
        const source = new Derived_Pixel_Buffer({size: [4, 4], bits_per_pixel: 8});
        source.color_whole(7);
        const products = [
            source.clone(),
            source.blank_copy(),
            source.new_resized([2, 2]),
            source.crop(1),
            source.uncrop(1, 0),
            source.to_24bipp(),
            source.get_mask_each_px(value => value === 7),
            source.new_window({size: [2, 2], pos: [1, 1]})
        ];
        for (const product of products) {
            assert(product instanceof Derived_Pixel_Buffer);
            assert.notStrictEqual(product.storage, source.storage);
        }
        assert.strictEqual(source.clone().constructor, Derived_Pixel_Buffer);
    });

    test('scratch and painter identities stay stable after first materialization', () => {
        const image = new Pixel_Buffer({size: [4, 3], bits_per_pixel: 8});
        const scratch = image.ta_scratch;
        const row = image.ta_row_scratch;
        const position = image.ta_pos_scratch;
        const bounds = image.ta_bounds;
        const painter = image.paint;
        assert.strictEqual(image.ta_scratch, scratch);
        assert.strictEqual(image.ta_row_scratch, row);
        assert.strictEqual(image.ta_pos_scratch, position);
        assert.strictEqual(image.ta_bounds, bounds);
        assert.strictEqual(image.paint, painter);
        assert.strictEqual(painter.pb, image);
    });

    return {passed, failed};
};

if (require.main === module) {
    const {passed, failed} = runPixelBufferPublicCharacterizationTests();
    console.log(`\nTest summary: ${passed} passed, ${failed} failed.`);
    process.exit(failed > 0 ? 1 : 0);
}

module.exports = runPixelBufferPublicCharacterizationTests;
