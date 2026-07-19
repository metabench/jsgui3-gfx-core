'use strict';

const fs = require('fs');
const path = require('path');

const repositoryRoot = path.resolve(__dirname, '..');
const packageJson = JSON.parse(
    fs.readFileSync(path.join(repositoryRoot, 'package.json'), 'utf8')
);
const packageMain = packageJson.main.replace(/^\.\//, '');
const packageName = packageJson.name;
const includedExtensions = new Set(['.js', '.cjs', '.mjs', '.md', '.json']);
const excludedDirectories = new Set(['.git', 'node_modules']);
const excludedFiles = new Set(['package-lock.json']);

const listFiles = directory => {
    const result = [];
    for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
        if (entry.isDirectory() && excludedDirectories.has(entry.name)) continue;
        const absolute = path.join(directory, entry.name);
        if (entry.isDirectory()) result.push(...listFiles(absolute));
        else if (
            entry.isFile() &&
            includedExtensions.has(path.extname(entry.name)) &&
            !excludedFiles.has(entry.name)
        ) {
            result.push(absolute);
        }
    }
    return result.sort();
};

const sourceCategory = relative => {
    if (relative === 'README.md' || relative.startsWith('docs/')) return 'documentation';
    if (relative.startsWith('tests/')) return 'test';
    if (relative.startsWith('examples/')) return 'example';
    if (relative.startsWith('core/')) return 'internal-core';
    if (relative.startsWith('benchmarks/')) return 'benchmark';
    if (relative.startsWith('scripts/')) return 'tooling';
    return 'repository-root';
};

const collectSpecifiers = (source, extension) => {
    const results = [];
    const patterns = [
        /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
        /\bfrom\s+['"]([^'"]+)['"]/g,
        /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g
    ];
    for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(source))) {
            results.push({specifier: match[1], offset: match.index});
        }
    }
    if (extension === '.md') {
        const documentationPath = /(?:^|[\s`(])((?:\.\.\/|\.\/)*core\/[A-Za-z0-9_./-]+(?:\.js)?)/gm;
        let match;
        while ((match = documentationPath.exec(source))) {
            results.push({specifier: match[1], offset: match.index});
        }
    }
    return results;
};

const lineAtOffset = (source, offset) => {
    let line = 1;
    for (let index = 0; index < offset; index++) {
        if (source.charCodeAt(index) === 10) line++;
    }
    return line;
};

const resolveCoreTarget = (filename, specifier) => {
    let candidate;
    if (specifier === packageName) return packageMain;
    if (specifier.startsWith(`${packageName}/`)) {
        candidate = specifier.slice(packageName.length + 1);
    } else if (specifier.startsWith('core/')) {
        candidate = specifier;
    } else if (specifier.startsWith('.')) {
        const absolute = path.resolve(path.dirname(filename), specifier);
        const corePrefix = path.join(repositoryRoot, 'core') + path.sep;
        if (absolute !== path.join(repositoryRoot, 'core') && !absolute.startsWith(corePrefix)) {
            return;
        }
        candidate = path.relative(repositoryRoot, absolute).replaceAll(path.sep, '/');
    } else {
        return;
    }

    const possibilities = [
        candidate,
        candidate.endsWith('.js') ? undefined : `${candidate}.js`,
        candidate.endsWith('.js') ? undefined : `${candidate}/index.js`
    ].filter(Boolean);
    return possibilities.find(relative =>
        fs.existsSync(path.join(repositoryRoot, relative)) &&
        fs.statSync(path.join(repositoryRoot, relative)).isFile()
    );
};

const references = [];
for (const filename of listFiles(repositoryRoot)) {
    const relative = path.relative(repositoryRoot, filename).replaceAll(path.sep, '/');
    const source = fs.readFileSync(filename, 'utf8');
    for (const found of collectSpecifiers(source, path.extname(filename))) {
        const target = resolveCoreTarget(filename, found.specifier);
        if (!target) continue;
        references.push({
            target,
            sourceFile: relative,
            line: lineAtOffset(source, found.offset),
            specifier: found.specifier,
            category: sourceCategory(relative)
        });
    }
}

const grouped = new Map();
for (const reference of references) {
    if (!grouped.has(reference.target)) grouped.set(reference.target, []);
    const entries = grouped.get(reference.target);
    if (!entries.some(entry =>
        entry.sourceFile === reference.sourceFile &&
        entry.line === reference.line &&
        entry.specifier === reference.specifier
    )) {
        entries.push(reference);
    }
}

const targets = [...grouped.entries()].sort(([left], [right]) =>
    left.localeCompare(right)
).map(([modulePath, entries]) => {
    const counts = {};
    for (const entry of entries) counts[entry.category] = (counts[entry.category] || 0) + 1;
    const repositoryConsumerEvidence =
        (counts.test || 0) + (counts.example || 0) + (counts.documentation || 0);
    return {
        module: modulePath,
        isPackageMain: modulePath === packageMain,
        referenceCount: entries.length,
        evidenceCounts: counts,
        repositoryConsumerEvidence,
        externalConsumerEvidence: 'unknown',
        requiresExternalConsumerEvidence:
            modulePath !== packageMain && repositoryConsumerEvidence > 0,
        references: entries.sort((left, right) =>
            left.sourceFile.localeCompare(right.sourceFile) || left.line - right.line
        )
    };
});

const inventory = {
    schemaVersion: 1,
    generatedBy: 'node scripts/deep-import-inventory.js',
    packageName,
    packageMain,
    summary: {
        targetCount: targets.length,
        referenceCount: targets.reduce((sum, target) => sum + target.referenceCount, 0),
        repositoryConsumerTargetCount: targets.filter(
            target => target.repositoryConsumerEvidence > 0
        ).length,
        externalEvidenceRequiredCount: targets.filter(
            target => target.requiresExternalConsumerEvidence
        ).length
    },
    externalEvidenceRequired: targets
        .filter(target => target.requiresExternalConsumerEvidence)
        .map(target => target.module),
    targets
};

process.stdout.write(`${JSON.stringify(inventory, null, 2)}\n`);
