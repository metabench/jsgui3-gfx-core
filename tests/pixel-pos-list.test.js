const assert = require('assert');
const Pixel_Pos_List = require('../core/pixel-pos-list');

const testPixelPosList = () => {
    let passed = 0;
    let failed = 0;

    const runTest = (description, testFn) => {
        try {
            testFn();
            console.log(`  ${description}: ${'\x1b[32m✔ Passed\x1b[0m'}`);
            passed++;
        } catch (err) {
            console.log(`  ${description}: ${'\x1b[31m✘ Failed\x1b[0m'}`);
            console.error(`    ${err.message}`);
            failed++;
        }
    };

    console.log('Running Pixel_Pos_List tests...');

    // Test 1: Adding and sorting pixels
    runTest('Adding and sorting pixels', () => {
        const ppl = new Pixel_Pos_List();
        ppl.add([2, 2]);
        ppl.add([2, 3]);
        ppl.add([8, 4]);
        ppl.add([8, 3]);
        ppl.add([3, 3]);
        ppl.add([1, 2]);
        ppl.add([1, 3]);
        ppl.add([3, 2]);
        ppl.fix();

        assert.strictEqual(ppl.length, 8, 'Pixel_Pos_List should contain 8 pixels.');

        ppl.sort();
        const sortedPixels = [];
        let item = ppl.shift();
        while (item) {
            sortedPixels.push(item);
            item = ppl.shift();
        }

        assert.deepStrictEqual(
            sortedPixels,
            [
                new Uint16Array([1, 2]),
                new Uint16Array([1, 3]),
                new Uint16Array([2, 2]),
                new Uint16Array([2, 3]),
                new Uint16Array([3, 2]),
                new Uint16Array([3, 3]),
                new Uint16Array([8, 3]),
                new Uint16Array([8, 4]),
            ],
            'Pixels should be sorted correctly.'
        );
    });

    // Test 2: Bounds calculation
    runTest('Bounds calculation', () => {
        const ppl2 = new Pixel_Pos_List();
        ppl2.add([5, 5]);
        ppl2.add([10, 10]);
        ppl2.add([1, 1]);
        const bounds = ppl2.bounds;

        assert.deepStrictEqual(
            bounds,
            new Uint16Array([1, 1, 10, 10]),
            'Bounds should be calculated correctly.'
        );
    });

    // Test 3: Equality check
    runTest('Equality check', () => {
        const ppl2 = new Pixel_Pos_List();
        ppl2.add([5, 5]);
        ppl2.add([10, 10]);
        ppl2.add([1, 1]);
        ppl2.fix();

        const ppl3 = new Pixel_Pos_List();
        ppl3.add([5, 5]);
        ppl3.add([10, 10]);
        ppl3.add([1, 1]);
        ppl3.fix();

        assert.strictEqual(
            ppl2.equals(ppl3),
            true,
            'Pixel_Pos_List instances with the same pixels should be equal.'
        );

        const ppl4 = new Pixel_Pos_List();
        ppl4.add([5, 5]);
        ppl4.add([10, 10]);
        ppl4.add([2, 2]);
        ppl4.fix();

        assert.strictEqual(
            ppl2.equals(ppl4),
            false,
            'Pixel_Pos_List instances with different pixels should not be equal.'
        );
    });

    // Test 4: Pop method
    runTest('Pop method', () => {
        const ppl = new Pixel_Pos_List();
        ppl.add([1, 1]);
        ppl.add([2, 2]);
        ppl.add([3, 3]);
        ppl.fix();
        
        // After fixing, the array should be [1,1,2,2,3,3]
        // Current index pointer (i) is at the end (6)
        // Pop should return the last item (3,3)
        const lastItem = ppl.pop();
        assert.deepStrictEqual(
            lastItem,
            new Uint16Array([3, 3]),
            'Pop should return the last item.'
        );
        
        assert.strictEqual(ppl.length, 2, 'Length should be reduced after pop.');
        
        const secondLastItem = ppl.pop();
        assert.deepStrictEqual(
            secondLastItem,
            new Uint16Array([2, 2]),
            'Second pop should return the second-to-last item.'
        );
    });

    // Test 5: Dynamic array resizing
    runTest('Dynamic array resizing', () => {
        const ppl = new Pixel_Pos_List();
        // Add more pixels than the initial capacity (16)
        for (let i = 0; i < 20; i++) {
            ppl.add([i, i]);
        }
        
        assert.strictEqual(ppl.length, 20, 'Should handle more pixels than initial capacity.');
        
        // Check all pixels were stored correctly
        ppl.fix();
        const pixels = [];
        ppl.each_pixel(pos => {
            pixels.push([pos[0], pos[1]]);
        });
        
        // Verify all pixels were stored correctly
        for (let i = 0; i < 20; i++) {
            assert.strictEqual(pixels[i][0], i, `X coordinate at index ${i} should be ${i}`);
            assert.strictEqual(pixels[i][1], i, `Y coordinate at index ${i} should be ${i}`);
        }
    });

    // Test 6: Pos property
    runTest('Pos property', () => {
        const ppl = new Pixel_Pos_List();
        ppl.add([5, 10]);
        ppl.add([3, 7]);
        ppl.add([8, 12]);
        
        const pos = ppl.pos;
        assert.deepStrictEqual(
            pos,
            new Uint16Array([3, 7]),
            'Pos should return the top-left position.'
        );
    });

    // Test 7: Empty list behavior
    runTest('Empty list behavior', () => {
        const ppl = new Pixel_Pos_List();
        
        assert.strictEqual(ppl.length, 0, 'Empty list should have length 0.');
        
        const bounds = ppl.bounds;
        assert.deepStrictEqual(
            bounds,
            new Uint16Array([0, 0, 0, 0]),
            'Empty list bounds should be [0,0,0,0].'
        );
        
        // Shift on empty list should return undefined
        assert.strictEqual(ppl.shift(), undefined, 'Shift on empty list should return undefined.');
    });

    // Test 8: Each pixel method
    runTest('Each pixel method', () => {
        const ppl = new Pixel_Pos_List();
        ppl.add([1, 2]);
        ppl.add([3, 4]);
        ppl.add([5, 6]);
        
        const pixels = [];
        ppl.each_pixel(pos => {
            pixels.push([pos[0], pos[1]]);
        });
        
        assert.deepStrictEqual(
            pixels,
            [[1, 2], [3, 4], [5, 6]],
            'Each pixel should iterate over all pixels in order.'
        );
    });

    // Test 9: String representation
    runTest('String representation', () => {
        const ppl = new Pixel_Pos_List();
        ppl.add([1, 2]);
        ppl.add([3, 4]);
        
        const str = ppl.toString();
        assert.ok(
            str.includes('"length":2') && str.includes('[1, 2]') && str.includes('[3, 4]'),
            'String representation should include length and pixels.'
        );
    });

    // Test 10: Memory optimization by compacting the array
    runTest('Memory optimization by compacting the array', () => {
        const ppl = new Pixel_Pos_List();
        // Add some pixels
        for (let i = 0; i < 20; i++) {
            ppl.add([i, i]);
        }
        
        // Remove half the pixels using shift
        for (let i = 0; i < 10; i++) {
            ppl.shift();
        }
        
        // Check length after shifts
        const lengthAfterShift = ppl.length;
        assert.strictEqual(lengthAfterShift, 10, 'Length should be reduced after shifts.');
        
        // Force array compaction
        ppl.sort();
        
        // Now test that adding more pixels works correctly
        ppl.add([100, 100]);
        ppl.add([101, 101]);
        
        assert.strictEqual(ppl.length, 12, 'Should be able to add more pixels after shifts and compaction.');
        
        // Test that the first pixel now starts at index 10
        const pixels = [];
        ppl.each_pixel(pos => {
            pixels.push([pos[0], pos[1]]);
        });
        
        assert.strictEqual(pixels[0][0], 10, 'First pixel should be [10,10] after shifts and compaction.');
    });

    // Test 11: Sort after removing elements
    runTest('Sort after removing elements', () => {
        const ppl = new Pixel_Pos_List();
        ppl.add([5, 5]);
        ppl.add([1, 1]);
        ppl.add([3, 3]);
        ppl.add([2, 2]);
        ppl.add([4, 4]);
        
        // Remove the first element
        const removed = ppl.shift();
        
        // Sort the remaining elements
        ppl.sort();
        
        // Now get the pixels using shift
        const shiftedPixels = [];
        let item;
        while ((item = ppl.shift())) {
            shiftedPixels.push(item);
        }
        
        // Expected order is [1,1], [2,2], [3,3], [4,4]
        assert.strictEqual(shiftedPixels.length, 4, 'Should have 4 pixels after sort and shift');
        assert.strictEqual(shiftedPixels[0][0], 1, 'First sorted pixel should have x=1');
        assert.strictEqual(shiftedPixels[1][0], 2, 'Second sorted pixel should have x=2');
        assert.strictEqual(shiftedPixels[2][0], 3, 'Third sorted pixel should have x=3');
        assert.strictEqual(shiftedPixels[3][0], 4, 'Fourth sorted pixel should have x=4');
    });

    // Test 12: Bounds reset after changes
    runTest('Bounds reset after changes', () => {
        const ppl = new Pixel_Pos_List();
        
        // Add pixels in a specific order for testing
        ppl.add([1, 1]);  // Start with the minimum point
        ppl.add([5, 5]);
        ppl.add([10, 10]);
        
        // Check initial bounds
        const initialBounds = ppl.bounds;
        assert.deepStrictEqual(
            initialBounds,
            new Uint16Array([1, 1, 10, 10]),
            'Initial bounds should be [1,1,10,10]'
        );
        
        // Add a new point that expands the bounds
        ppl.add([15, 15]);
        
        // Bounds should be recalculated
        const newBounds = ppl.bounds;
        assert.deepStrictEqual(
            newBounds,
            new Uint16Array([1, 1, 15, 15]),
            'Bounds should be updated after adding a point'
        );
        
        // Remove the first pixel which is [1, 1]
        const removed = ppl.shift();
        
        // Bounds should be recalculated again
        const afterShiftBounds = ppl.bounds;
        
        // After removing [1, 1], the minimum should now be [5, 5]
        assert.deepStrictEqual(
            afterShiftBounds,
            new Uint16Array([5, 5, 15, 15]),
            'Bounds should be updated after removing a point'
        );
    });

    // Test 13: Performance with large number of pixels
    runTest('Performance with large number of pixels', () => {
        const ppl = new Pixel_Pos_List();
        const startTime = Date.now();
        
        // Add a large number of pixels (5000)
        for (let i = 0; i < 5000; i++) {
            ppl.add([i % 1000, Math.floor(i / 1000)]);
        }
        
        const addTime = Date.now() - startTime;
        console.log(`    Added 5000 pixels in ${addTime}ms`);
        
        // Time to iterate through all pixels
        const iterateStartTime = Date.now();
        let count = 0;
        ppl.each_pixel(() => {
            count++;
        });
        const iterateTime = Date.now() - iterateStartTime;
        
        console.log(`    Iterated through 5000 pixels in ${iterateTime}ms`);
        assert.strictEqual(count, 5000, 'Should iterate through all 5000 pixels');
        
        // Time to sort
        const sortStartTime = Date.now();
        ppl.sort();
        const sortTime = Date.now() - sortStartTime;
        
        console.log(`    Sorted 5000 pixels in ${sortTime}ms`);
        
        // Verify reasonable performance
        assert.ok(addTime < 1000, 'Adding 5000 pixels should take less than 1 second');
        assert.ok(iterateTime < 1000, 'Iterating 5000 pixels should take less than 1 second');
        assert.ok(sortTime < 2000, 'Sorting 5000 pixels should take less than 2 seconds');
    });

    // Test 14: Array compaction on high read position
    runTest('Array compaction on high read position', () => {
        const ppl = new Pixel_Pos_List();
        
        // Add 2000 pixels
        for (let i = 0; i < 2000; i++) {
            ppl.add([i, i]);
        }
        
        // Check initial length
        assert.strictEqual(ppl.length, 2000, 'Should initially have 2000 pixels');
        
        // Remove 1500 pixels to create a high read_pos
        for (let i = 0; i < 1500; i++) {
            ppl.shift();
        }
        
        // Verify length after shift
        assert.strictEqual(ppl.length, 500, 'Should have 500 pixels after shifting');
        
        // Now add one more pixel to potentially trigger array compaction
        ppl.add([5000, 5000]);
        
        // Verify length after adding
        assert.strictEqual(ppl.length, 501, 'Should have 501 pixels after adding');
        
        // Check that all pixels are correct
        const pixels = [];
        ppl.each_pixel(pos => {
            pixels.push([pos[0], pos[1]]);
        });
        
        // Check the first pixel (should be 1500)
        assert.strictEqual(pixels[0][0], 1500, 'First pixel should be [1500,1500] after shifting');
        
        // Check the last pixel (should be 5000)
        assert.strictEqual(pixels[pixels.length-1][0], 5000, 'Last pixel should be [5000,5000]');
    });
    
    // Test 15: Iterator protocol
    runTest('Iterator protocol', () => {
        const ppl = new Pixel_Pos_List();
        ppl.add([1, 1]);
        ppl.add([2, 2]);
        ppl.add([3, 3]);
        
        // Test iteration using for...of
        const pixels = [];
        for (const pixel of ppl) {
            pixels.push(pixel);
        }
        
        assert.strictEqual(pixels.length, 3, 'Should iterate over all pixels');
        assert.deepStrictEqual(pixels[0], [1, 1], 'First pixel should be [1,1]');
        assert.deepStrictEqual(pixels[1], [2, 2], 'Second pixel should be [2,2]');
        assert.deepStrictEqual(pixels[2], [3, 3], 'Third pixel should be [3,3]');
    });
    
    // Test 16: Input validation
    runTest('Input validation', () => {
        const ppl = new Pixel_Pos_List();
        
        // Test invalid inputs
        assert.throws(() => ppl.add(), Error, 'Should throw error when no position is provided');
        assert.throws(() => ppl.add([]), Error, 'Should throw error when position array is empty');
        assert.throws(() => ppl.add([1]), Error, 'Should throw error when position has only one coordinate');
        
        // Test adding floating point values (should be floored)
        ppl.add([1.7, 2.8]);
        const pixels = [];
        for (const pixel of ppl) {
            pixels.push(pixel);
        }
        
        assert.deepStrictEqual(pixels[0], [1, 2], 'Float coordinates should be floored');
    });
    
    // Test 17: Map method
    runTest('Map method', () => {
        const ppl = new Pixel_Pos_List();
        ppl.add([1, 2]);
        ppl.add([3, 4]);
        ppl.add([5, 6]);
        
        // Map to sum of coordinates
        const sums = ppl.map(pos => pos[0] + pos[1]);
        
        assert.deepStrictEqual(sums, [3, 7, 11], 'Map should apply function to each pixel');
        
        // Map to new format
        const formatted = ppl.map(pos => ({ x: pos[0], y: pos[1] }));
        
        assert.deepStrictEqual(
            formatted, 
            [{ x: 1, y: 2 }, { x: 3, y: 4 }, { x: 5, y: 6 }],
            'Map should support mapping to new format'
        );
    });
    
    // Test 18: Filter method
    runTest('Filter method', () => {
        const ppl = new Pixel_Pos_List();
        ppl.add([1, 5]);
        ppl.add([2, 3]);
        ppl.add([3, 4]);
        ppl.add([4, 2]);
        ppl.add([5, 1]);
        
        // Filter pixels where x > y
        const filtered = ppl.filter(pos => pos[0] > pos[1]);
        
        assert.strictEqual(filtered.length, 2, 'Filter should return correct number of items');
        
        const pixels = [];
        filtered.forEach(pos => {
            pixels.push([pos[0], pos[1]]);
        });
        
        assert.deepStrictEqual(
            pixels,
            [[4, 2], [5, 1]],
            'Filter should keep only pixels matching predicate'
        );
    });
    
    // Test 19: ForEach method
    runTest('ForEach method', () => {
        const ppl = new Pixel_Pos_List();
        ppl.add([1, 2]);
        ppl.add([3, 4]);
        ppl.add([5, 6]);
        
        let sum = 0;
        ppl.forEach(pos => {
            sum += pos[0] + pos[1];
        });
        
        assert.strictEqual(sum, 21, 'ForEach should iterate over all pixels');
    });
    
    // Test 20: Contains method
    runTest('Contains method', () => {
        const ppl = new Pixel_Pos_List();
        ppl.add([1, 2]);
        ppl.add([3, 4]);
        
        assert.strictEqual(ppl.contains([1, 2]), true, 'Should find existing pixel');
        assert.strictEqual(ppl.contains([3, 4]), true, 'Should find existing pixel');
        assert.strictEqual(ppl.contains([5, 6]), false, 'Should not find non-existent pixel');
        assert.strictEqual(ppl.contains([1.5, 2.5]), false, 'Should not find non-integer pixel');
        assert.strictEqual(ppl.contains([]), false, 'Should handle empty array');
        assert.strictEqual(ppl.contains(null), false, 'Should handle null');
    });
    
    // Test 21: Clear method
    runTest('Clear method', () => {
        const ppl = new Pixel_Pos_List();
        ppl.add([1, 2]);
        ppl.add([3, 4]);
        ppl.add([5, 6]);
        
        assert.strictEqual(ppl.length, 3, 'Initial length should be 3');
        
        ppl.clear();
        
        assert.strictEqual(ppl.length, 0, 'After clear, length should be 0');
        assert.strictEqual(ppl.shift(), undefined, 'Shift should return undefined after clear');
        
        // Should be able to add elements after clearing
        ppl.add([7, 8]);
        assert.strictEqual(ppl.length, 1, 'Should be able to add new elements after clearing');
    });
    
    // Test 22: ToArray method
    runTest('ToArray method', () => {
        const ppl = new Pixel_Pos_List();
        ppl.add([1, 2]);
        ppl.add([3, 4]);
        
        const arr = ppl.toArray();
        
        assert.deepStrictEqual(
            arr,
            [[1, 2], [3, 4]],
            'ToArray should convert to standard JavaScript array'
        );
    });
    
    // Test 23: Static fromArray method
    runTest('Static fromArray method', () => {
        const arr = [[1, 2], [3, 4], [5, 6]];
        
        const ppl = Pixel_Pos_List.fromArray(arr);
        
        assert.strictEqual(ppl.length, 3, 'Should create PPL with correct length');
        
        const pixels = ppl.toArray();
        assert.deepStrictEqual(
            pixels,
            arr,
            'Should create PPL with same pixels as input array'
        );
        
        // Test with invalid entries
        const mixedArr = [[1, 2], [3], null, 5, [4, 5]];
        const ppl2 = Pixel_Pos_List.fromArray(mixedArr);
        
        assert.strictEqual(ppl2.length, 2, 'Should only add valid pixel positions');
        assert.deepStrictEqual(
            ppl2.toArray(),
            [[1, 2], [4, 5]],
            'Should skip invalid entries in array'
        );
    });
    
    // Test 24: Method chaining
    runTest('Method chaining', () => {
        const ppl = new Pixel_Pos_List();
        
        // Test chaining multiple methods
        ppl.add([1, 2])
           .add([3, 4])
           .add([5, 6])
           .sort();
        
        assert.strictEqual(ppl.length, 3, 'Chain operations should work correctly');
        
        // Clear and add in a chain
        ppl.clear()
           .add([7, 8])
           .add([9, 10]);
        
        assert.strictEqual(ppl.length, 2, 'Chained clear and add should work');
        assert.deepStrictEqual(
            ppl.toArray(),
            [[7, 8], [9, 10]],
            'Pixels should be added after clear in chain'
        );
    });

    // Test 25: Large coordinate values
    runTest('Large coordinate values', () => {
        const ppl = new Pixel_Pos_List();
        // Values close to uint16 max (65535)
        ppl.add([65530, 65531]);
        ppl.add([65532, 65533]);
        ppl.add([65534, 65535]);
        
        const pixels = ppl.toArray();
        
        assert.deepStrictEqual(
            pixels,
            [[65530, 65531], [65532, 65533], [65534, 65535]],
            'Should correctly handle coordinates near uint16 max'
        );
        
        // Test bounds with large values
        const bounds = ppl.bounds;
        assert.deepStrictEqual(
            bounds,
            new Uint16Array([65530, 65531, 65534, 65535]),
            'Bounds should be calculated correctly for large values'
        );
    });
    
    // Test 26: Zero coordinates
    runTest('Zero coordinates', () => {
        const ppl = new Pixel_Pos_List();
        ppl.add([0, 0]);
        ppl.add([0, 5]);
        ppl.add([5, 0]);
        
        // Test that zero values are stored correctly
        const pixels = ppl.toArray();
        assert.deepStrictEqual(
            pixels,
            [[0, 0], [0, 5], [5, 0]],
            'Should store zero coordinates correctly'
        );
        
        // Test bounds with zero values
        const bounds = ppl.bounds;
        assert.deepStrictEqual(
            bounds,
            new Uint16Array([0, 0, 5, 5]),
            'Bounds should include zero values correctly'
        );
    });
    
    // Test 27: Handling duplicate pixels
    runTest('Handling duplicate pixels', () => {
        const ppl = new Pixel_Pos_List();
        ppl.add([1, 1]);
        ppl.add([1, 1]); // Duplicate
        ppl.add([2, 2]);
        ppl.add([2, 2]); // Duplicate
        
        assert.strictEqual(ppl.length, 4, 'Should store duplicate pixels');
        
        // Check that we can find duplicates
        assert.strictEqual(ppl.contains([1, 1]), true, 'Should find duplicated pixel');
        
        // Check how many instances of each pixel we have
        let count1 = 0, count2 = 0;
        ppl.forEach(pos => {
            if (pos[0] === 1 && pos[1] === 1) count1++;
            if (pos[0] === 2 && pos[1] === 2) count2++;
        });
        
        assert.strictEqual(count1, 2, 'Should have 2 instances of [1,1]');
        assert.strictEqual(count2, 2, 'Should have 2 instances of [2,2]');
    });
    
    // Test 28: Negative numbers handling (floor to 0 due to Uint16Array)
    runTest('Negative numbers handling', () => {
        const ppl = new Pixel_Pos_List();
        ppl.add([-1, -2]);
        
        const pixels = ppl.toArray();
        
        // Negative numbers should be floored to 0 for Uint16Array
        assert.deepStrictEqual(
            pixels,
            [[0, 0]],
            'Negative values should be converted to 0 in Uint16Array'
        );
    });
    
    // Test 29: Boundary cases for add method
    runTest('Boundary cases for add method', () => {
        const ppl = new Pixel_Pos_List();
        
        // Add a very large number (beyond uint16 range)
        ppl.add([100000, 100000]);
        
        const pixels = ppl.toArray();
        
        // Values should be truncated to uint16 range (65535 max)
        assert.deepStrictEqual(
            pixels[0],
            [100000 & 0xFFFF, 100000 & 0xFFFF],
            'Very large values should be truncated to uint16 range'
        );
    });
    
    // Test 30: Fix method retains data but resizes array
    runTest('Fix method behavior', () => {
        const ppl = new Pixel_Pos_List();
        
        // Add some pixels
        for (let i = 0; i < 10; i++) {
            ppl.add([i, i]);
        }
        
        // Get the current internal array length
        const originalArrayLength = ppl.ta.length;
        
        // Remove some pixels
        ppl.shift();
        ppl.shift();
        
        // Verify the internal array still has the same length
        assert.strictEqual(ppl.ta.length, originalArrayLength, 'Internal array length should be unchanged before fix()');
        
        // Call fix()
        ppl.fix();
        
        // Verify the internal array was resized
        assert.strictEqual(ppl.ta.length, (ppl.length * 2), 'Internal array should be resized to exactly fit the pixels');
        
        // Verify all data is retained
        const pixels = ppl.toArray();
        assert.strictEqual(pixels.length, 8, 'Should have 8 pixels after removing 2 from 10');
        assert.deepStrictEqual(pixels[0], [2, 2], 'First pixel should be [2,2] after removing two pixels');
    });
    
    // Test 31: Combined operations test
    runTest('Combined operations test', () => {
        const ppl = new Pixel_Pos_List();
        
        // Add some pixels
        ppl.add([1, 1]).add([2, 2]).add([3, 3]);
        
        // Remove one
        ppl.shift();
        
        // Add more
        ppl.add([4, 4]).add([5, 5]);
        
        // Filter to even coordinates
        const filtered = ppl.filter(pos => pos[0] % 2 === 0 && pos[1] % 2 === 0);
        
        // Map to sum
        const sums = filtered.map(pos => pos[0] + pos[1]);
        
        // Should have [2,2], [4,4] after filtering
        assert.deepStrictEqual(filtered.toArray(), [[2, 2], [4, 4]], 'Should filter to pixels with even coordinates');
        
        // Sums should be [4, 8]
        assert.deepStrictEqual(sums, [4, 8], 'Should map filtered pixels correctly');
    });
    
    // Test 32: Performance on repeated shift/add operations
    runTest('Performance on repeated shift/add operations', () => {
        const ppl = new Pixel_Pos_List();
        
        // Add initial pixels
        for (let i = 0; i < 1000; i++) {
            ppl.add([i, i]);
        }
        
        // Perform repeated shift/add operations
        const startTime = Date.now();
        
        for (let i = 0; i < 500; i++) {
            ppl.shift(); // Remove from front
            ppl.add([1000 + i, 1000 + i]); // Add to back
        }
        
        const operationTime = Date.now() - startTime;
        console.log(`    Performed 500 shift/add operations in ${operationTime}ms`);
        
        // Verify final state
        assert.strictEqual(ppl.length, 1000, 'Should maintain 1000 pixels after shift/add operations');
        
        // First pixel should be [500, 500] after shifting 500 pixels
        const pixels = ppl.toArray();
        assert.deepStrictEqual(
            pixels[0], 
            [500, 500], 
            'First pixel should be [500,500] after shifting 500 pixels'
        );
        
        // Check reasonable performance
        assert.ok(operationTime < 1000, 'Shift/add operations should be reasonably fast');
    });
    
    // Test 33: Serialize/deserialize with JSON
    runTest('Serialize/deserialize with JSON', () => {
        const ppl = new Pixel_Pos_List();
        ppl.add([1, 2]);
        ppl.add([3, 4]);
        ppl.add([5, 6]);
        
        // Convert to array for serialization
        const arr = ppl.toArray();
        
        // Serialize to JSON
        const json = JSON.stringify(arr);
        
        // Deserialize from JSON
        const parsed = JSON.parse(json);
        
        // Create new Pixel_Pos_List from parsed array
        const ppl2 = Pixel_Pos_List.fromArray(parsed);
        
        // Compare original and recreated lists
        assert.strictEqual(ppl.equals(ppl2), true, 'Should deserialize correctly from JSON');
    });
    
    // Test 34: Error handling when adding invalid values
    runTest('Error handling when adding invalid values', () => {
        const ppl = new Pixel_Pos_List();
        
        // Test various invalid inputs
        assert.throws(() => ppl.add(null), Error, 'Should throw error for null');
        assert.throws(() => ppl.add(undefined), Error, 'Should throw error for undefined');
        assert.throws(() => ppl.add("invalid"), Error, 'Should throw error for string');
        assert.throws(() => ppl.add({}), Error, 'Should throw error for object');
        assert.throws(() => ppl.add(123), Error, 'Should throw error for number');
    });

    return { passed, failed };
};

if (require.main === module) {
    const { passed, failed } = testPixelPosList();
    console.log(`\nTest summary: ${passed} passed, ${failed} failed.`);
    process.exit(failed > 0 ? 1 : 0);
}

module.exports = testPixelPosList;
