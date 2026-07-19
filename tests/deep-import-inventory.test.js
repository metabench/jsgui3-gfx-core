'use strict';

const assert = require('assert');
const path = require('path');
const {execFileSync} = require('child_process');

const runDeepImportInventoryTests = () => {
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

    console.log('Running deep-import inventory tests...');

    test('repository evidence is resolved without claiming external consumers', () => {
        const repositoryRoot = path.resolve(__dirname, '..');
        const output = execFileSync(
            process.execPath,
            [path.join(repositoryRoot, 'scripts/deep-import-inventory.js')],
            {cwd: repositoryRoot, encoding: 'utf8'}
        );
        const inventory = JSON.parse(output);
        assert.strictEqual(inventory.schemaVersion, 1);
        assert.strictEqual(inventory.packageMain, 'core/gfx-core.js');
        assert(inventory.summary.targetCount >= 40);
        assert(inventory.summary.repositoryConsumerTargetCount >= 30);
        assert(inventory.summary.externalEvidenceRequiredCount >= 30);
        assert(inventory.targets.every(target =>
            target.externalConsumerEvidence === 'unknown'
        ));
        assert(inventory.targets.every(target => target.module.startsWith('core/')));

        const byModule = new Map(inventory.targets.map(target => [target.module, target]));
        assert.strictEqual(byModule.get('core/gfx-core.js').isPackageMain, true);
        assert(byModule.get('core/gfx-core.js').repositoryConsumerEvidence > 0);
        assert.strictEqual(
            byModule.get('core/gfx-core.js').requiresExternalConsumerEvidence,
            false
        );
        for (const deepImport of [
            'core/pixel-buffer-0-core-inner-structures.js',
            'core/pixel-buffer-1-core-get-set-pixel.js',
            'core/pixel-buffer-2-core-reference-implementations.js',
            'core/pixel-buffer-3-core.js',
            'core/pixel-buffer-7-specialised-enh.js',
            'core/ta-math.js'
        ]) {
            const target = byModule.get(deepImport);
            assert(target, deepImport);
            assert(target.repositoryConsumerEvidence > 0, deepImport);
            assert.strictEqual(target.requiresExternalConsumerEvidence, true);
            assert(inventory.externalEvidenceRequired.includes(deepImport));
        }
    });

    return {passed, failed};
};

if (require.main === module) {
    const {passed, failed} = runDeepImportInventoryTests();
    console.log(`\nTest summary: ${passed} passed, ${failed} failed.`);
    process.exit(failed > 0 ? 1 : 0);
}

module.exports = runDeepImportInventoryTests;
