'use strict';

const assert = require('assert');
const path = require('path');
const {execFileSync} = require('child_process');

const runPixelBufferInventoryTests = () => {
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

    console.log('Running Pixel_Buffer generated-inventory tests...');

    test('access call sites are completely classified after duplicate cleanup', () => {
        const repositoryRoot = path.resolve(__dirname, '..');
        const output = execFileSync(
            process.execPath,
            [path.join(repositoryRoot, 'scripts/pixel-buffer-inventory.js')],
            {cwd: repositoryRoot, encoding: 'utf8'}
        );
        const inventory = JSON.parse(output);
        assert.strictEqual(inventory.schemaVersion, 3);
        assert.strictEqual(inventory.access.methodCount, 27);
        assert.strictEqual(inventory.access.callSiteCount, 9);
        assert.deepStrictEqual(
            inventory.access.classificationCounts,
            {
                'shadow-only': 3,
                'module-example': 3,
                'externally-sourced': 2,
                'runtime-effective': 1
            }
        );
        const sites = inventory.access.methods.flatMap(method => method.callSites);
        assert.strictEqual(sites.length, 9);
        assert(sites.every(site => site.classification !== 'unclassified'));
        assert(sites.every(site => site.classificationBasis.length > 0));
        const methodSites = sites.filter(site => site.classification !== 'module-example');
        assert(methodSites.every(site => site.enclosingClass));
        assert(methodSites.every(site => site.enclosingMethod));
        assert(methodSites.every(site => site.methodStartLine <= site.line));
        assert(methodSites.every(site => site.methodEndLine >= site.line));
        assert(inventory.access.parsedMethodRangeCount >= 290);
        assert.strictEqual(inventory.hierarchy.substantiveLevelCount, 11);
        assert.strictEqual(inventory.hierarchy.identicalShadowCount, 36);
        assert.strictEqual(inventory.hierarchy.divergentShadowCount, 21);
    });

    return {passed, failed};
};

if (require.main === module) {
    const {passed, failed} = runPixelBufferInventoryTests();
    console.log(`\nTest summary: ${passed} passed, ${failed} failed.`);
    process.exit(failed > 0 ? 1 : 0);
}

module.exports = runPixelBufferInventoryTests;
