'use strict';

const fs = require('fs');
const path = require('path');
const {Pixel_Buffer} = require('../core/gfx-core');

const repositoryRoot = path.resolve(__dirname, '..');
const coreRoot = path.join(repositoryRoot, 'core');

const ACCESS_NAMES = [
    'get_pixel_byte_bit_1bipp',
    'get_pixel_byte_bit_BE_1bipp',
    'set_pixel_on_1bipp_by_pixel_index',
    'set_pixel_on_1bipp_xy',
    'set_pixel_on_1bipp',
    'set_pixel_off_1bipp_by_pixel_index',
    'set_pixel_off_1bipp',
    'set_pixel_1bipp',
    'set_pixel_by_idx_1bipp',
    'set_pixel_8bipp',
    'set_pixel_24bipp',
    'set_pixel_32bipp',
    'set_pixel_by_idx_8bipp',
    'set_pixel_by_idx_24bipp',
    'set_pixel_by_idx_32bipp',
    'set_pixel_by_idx',
    'set_pixel',
    'get_pixel_by_idx_1bipp',
    'get_pixel_by_idx_8bipp',
    'get_pixel_by_idx_24bipp',
    'get_pixel_by_idx_32bipp',
    'get_pixel_by_idx',
    'get_pixel_1bipp',
    'get_pixel_8bipp',
    'get_pixel_24bipp',
    'get_pixel_32bipp',
    'get_pixel'
];

const listJavaScriptFiles = directory => {
    const result = [];
    for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
        const absolute = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === 'old') continue;
            result.push(...listJavaScriptFiles(absolute));
        } else if (
            entry.isFile() && entry.name.endsWith('.js') &&
            !entry.name.startsWith('__')
        ) {
            result.push(absolute);
        }
    }
    return result.sort();
};

const descriptorSource = descriptor => {
    if (typeof descriptor.value === 'function') return Function.prototype.toString.call(descriptor.value);
    let source = '';
    if (typeof descriptor.get === 'function') source += Function.prototype.toString.call(descriptor.get);
    if (typeof descriptor.set === 'function') source += Function.prototype.toString.call(descriptor.set);
    return source;
};

const normalizeSource = source => source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\r\n]*/g, '')
    .replace(/\s+/g, '');

const stripBlockCommentsPreservingLines = source => source.replace(
    /\/\*[\s\S]*?\*\//g,
    comment => comment.replace(/[^\r\n]/g, ' ')
);

const maskNonCodePreservingLines = source => {
    let result = '';
    let state = 'code';
    let quote = '';
    for (let index = 0; index < source.length; index++) {
        const character = source[index];
        const next = source[index + 1];
        if (state === 'code') {
            if (character === '/' && next === '/') {
                result += '  ';
                index++;
                state = 'line-comment';
            } else if (character === '/' && next === '*') {
                result += '  ';
                index++;
                state = 'block-comment';
            } else if (character === "'" || character === '"' || character === '`') {
                result += ' ';
                quote = character;
                state = 'string';
            } else {
                result += character;
            }
        } else if (state === 'line-comment') {
            if (character === '\n' || character === '\r') {
                result += character;
                state = 'code';
            } else {
                result += ' ';
            }
        } else if (state === 'block-comment') {
            if (character === '*' && next === '/') {
                result += '  ';
                index++;
                state = 'code';
            } else {
                result += character === '\n' || character === '\r' ? character : ' ';
            }
        } else if (state === 'string') {
            if (character === '\\') {
                result += ' ';
                if (index + 1 < source.length) {
                    const escaped = source[++index];
                    result += escaped === '\n' || escaped === '\r' ? escaped : ' ';
                }
            } else if (character === quote) {
                result += ' ';
                state = 'code';
            } else {
                result += character === '\n' || character === '\r' ? character : ' ';
            }
        }
    }
    return result;
};

const methodNameFromLine = line => {
    const match = line.trim().match(
        /^(?:static\s+)?(?:async\s+)?(?:get\s+|set\s+)?(?:\*\s*)?(?:'([^']+)'|"([^"]+)"|([A-Za-z_$][\w$]*))\s*\(/
    );
    return match && (match[1] || match[2] || match[3]);
};

const braceDelta = line => {
    let result = 0;
    for (const character of line) {
        if (character === '{') result++;
        else if (character === '}') result--;
    }
    return result;
};

const findClassMethodRanges = source => {
    const originalLines = stripBlockCommentsPreservingLines(source).split(/\r?\n/);
    const maskedLines = maskNonCodePreservingLines(source).split(/\r?\n/);
    const ranges = [];
    let depth = 0;
    let activeClass;
    let activeMethod;

    for (let index = 0; index < maskedLines.length; index++) {
        const maskedLine = maskedLines[index];
        const depthBefore = depth;
        if (!activeClass) {
            const classMatch = maskedLine.match(/\bclass\s+([A-Za-z_$][\w$]*)[^\{]*\{/);
            if (classMatch) {
                activeClass = {className: classMatch[1], bodyDepth: depthBefore + 1};
            }
        }
        if (activeClass && !activeMethod && depthBefore === activeClass.bodyDepth) {
            const methodName = methodNameFromLine(originalLines[index]);
            if (methodName && maskedLine.includes('{')) {
                activeMethod = {
                    className: activeClass.className,
                    methodName,
                    startLine: index + 1,
                    bodyDepth: activeClass.bodyDepth
                };
            }
        }

        depth += braceDelta(maskedLine);

        if (activeMethod && depth === activeMethod.bodyDepth) {
            ranges.push({...activeMethod, endLine: index + 1});
            activeMethod = undefined;
        }
        if (activeClass && depth < activeClass.bodyDepth) activeClass = undefined;
    }
    return ranges;
};

const isExternallySourcedAccess = (range, accessName) =>
    range.className === 'Pixel_Buffer_Core' && (
        (range.methodName === 'paint_pixel_list' && accessName === 'set_pixel') ||
        (range.methodName === 'copy_pixel_pos_list_region' && accessName === 'get_pixel')
    );

const buildHierarchy = image => {
    const levels = [];
    let prototype = Object.getPrototypeOf(image);
    while (prototype && prototype !== Object.prototype) {
        const descriptors = Object.getOwnPropertyDescriptors(prototype);
        const definitions = {};
        for (const [name, descriptor] of Object.entries(descriptors)) {
            if (name === 'constructor') continue;
            const source = descriptorSource(descriptor);
            definitions[name] = {
                kind: typeof descriptor.value === 'function'
                    ? 'method'
                    : `${descriptor.get ? 'get' : ''}${descriptor.set ? '/set' : ''}`,
                enumerable: descriptor.enumerable,
                configurable: descriptor.configurable,
                writable: descriptor.writable,
                source,
                normalizedSource: normalizeSource(source)
            };
        }
        levels.push({
            index: levels.length,
            className: prototype.constructor.name,
            module: prototype.constructor === Pixel_Buffer
                ? 'core/pixel-buffer.js'
                : undefined,
            ownDefinitionCount: Object.keys(definitions).length,
            definitions
        });
        prototype = Object.getPrototypeOf(prototype);
    }

    const names = new Set();
    for (const level of levels) {
        for (const name of Object.keys(level.definitions)) names.add(name);
    }

    const effectiveOwners = {};
    const shadows = [];
    for (const name of [...names].sort()) {
        const owners = levels
            .filter(level => level.definitions[name])
            .map(level => ({
                index: level.index,
                className: level.className,
                normalizedSource: level.definitions[name].normalizedSource
            }));
        effectiveOwners[name] = owners[0].className;
        if (owners.length > 1) {
            const variants = new Set(owners.map(owner => owner.normalizedSource));
            shadows.push({
                name,
                effectiveOwner: owners[0].className,
                identical: variants.size === 1,
                owners: owners.map(({index, className}) => ({index, className}))
            });
        }
    }

    const effectiveDispatchDependencies = [];
    for (const level of levels) {
        for (const [methodName, definition] of Object.entries(level.definitions)) {
            const references = new Set();
            const expression = /this\.([A-Za-z_$][\w$]*)/g;
            let match;
            while ((match = expression.exec(definition.source))) references.add(match[1]);
            for (const referencedName of references) {
                const effectiveIndex = levels.findIndex(candidate => candidate.definitions[referencedName]);
                if (effectiveIndex !== -1 && effectiveIndex < level.index) {
                    effectiveDispatchDependencies.push({
                        definingClass: level.className,
                        methodName,
                        referencedName,
                        effectiveOwner: levels[effectiveIndex].className
                    });
                }
            }
        }
    }

    return {
        substantiveLevelCount: levels.length,
        prototypeDefinitionCount: levels.reduce(
            (sum, level) => sum + level.ownDefinitionCount,
            0
        ),
        uniqueNameCount: names.size,
        levels: levels.map(level => ({
            index: level.index,
            className: level.className,
            ownDefinitionCount: level.ownDefinitionCount,
            names: Object.keys(level.definitions).sort()
        })),
        effectiveOwners,
        shadows,
        identicalShadowCount: shadows.filter(shadow => shadow.identical).length,
        divergentShadowCount: shadows.filter(shadow => !shadow.identical).length,
        effectiveDispatchDependencies
    };
};

const buildAccessInventory = hierarchy => {
    const callSites = [];
    let methodRangeCount = 0;
    for (const filename of listJavaScriptFiles(coreRoot)) {
        const relative = path.relative(repositoryRoot, filename).replaceAll(path.sep, '/');
        const originalSource = fs.readFileSync(filename, 'utf8');
        const methodRanges = findClassMethodRanges(originalSource);
        methodRangeCount += methodRanges.length;
        const source = stripBlockCommentsPreservingLines(originalSource);
        const lines = source.split(/\r?\n/);
        const moduleExampleStart = lines.findIndex(line =>
            line.includes('if (require.main === module)')
        );
        lines.forEach((line, index) => {
            const trimmed = line.trim();
            if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;
            for (const name of ACCESS_NAMES) {
                const expression = new RegExp(`(?:this|[A-Za-z_$][\\w$]*)\\.${name}\\s*\\(`);
                if (expression.test(line)) {
                    const lineNumber = index + 1;
                    const range = methodRanges.find(candidate =>
                        lineNumber >= candidate.startLine && lineNumber <= candidate.endLine
                    );
                    let classification = 'unclassified';
                    let classificationBasis = 'No enclosing class method was resolved';
                    if (moduleExampleStart !== -1 && index > moduleExampleStart) {
                        classification = 'module-example';
                        classificationBasis = 'Located below the module require.main guard';
                    } else if (range) {
                        const effectiveCallerOwner =
                            hierarchy.effectiveOwners[range.methodName];
                        if (!effectiveCallerOwner) {
                            classificationBasis =
                                `No runtime owner found for ${range.className}.${range.methodName}`;
                        } else if (effectiveCallerOwner !== range.className) {
                            classification = 'shadow-only';
                            classificationBasis =
                                `${range.className}.${range.methodName} is shadowed by ` +
                                `${effectiveCallerOwner}.${range.methodName}`;
                        } else if (isExternallySourcedAccess(range, name)) {
                            classification = 'externally-sourced';
                            classificationBasis =
                                `${range.className}.${range.methodName} consumes a supplied pixel list`;
                        } else {
                            classification = 'runtime-effective';
                            classificationBasis =
                                `${range.className}.${range.methodName} owns final dispatch`;
                        }
                    }
                    callSites.push({
                        name,
                        file: relative,
                        line: lineNumber,
                        source: trimmed,
                        enclosingClass: range && range.className,
                        enclosingMethod: range && range.methodName,
                        methodStartLine: range && range.startLine,
                        methodEndLine: range && range.endLine,
                        effectiveCallerOwner: range &&
                            hierarchy.effectiveOwners[range.methodName],
                        classification,
                        classificationBasis
                    });
                }
            }
        });
    }

    const methods = ACCESS_NAMES.map(name => {
        const owners = hierarchy.levels
            .filter(level => level.names.includes(name))
            .map(level => level.className);
        return {
            name,
            effectiveOwner: hierarchy.effectiveOwners[name],
            definitions: owners,
            shadowed: owners.length > 1,
            callSites: callSites.filter(site => site.name === name)
        };
    });

    const classificationCounts = {};
    for (const site of callSites) {
        classificationCounts[site.classification] =
            (classificationCounts[site.classification] || 0) + 1;
    }

    return {
        publicPolicy: 'checked safe-integer coordinates and logical indexes',
        internalPolicy: 'explicit unsafe kernels only after callers prove bounds',
        methodCount: methods.length,
        callSiteCount: callSites.length,
        parsedMethodRangeCount: methodRangeCount,
        classificationCounts,
        methods
    };
};

const image = new Pixel_Buffer({size: [3, 2], bits_per_pixel: 8, rowAlignmentBytes: 4});
const hierarchy = buildHierarchy(image);
const inventory = {
    schemaVersion: 3,
    generatedBy: 'node scripts/pixel-buffer-inventory.js',
    instanceOwnKeys: Reflect.ownKeys(image).map(String).sort(),
    hierarchy,
    access: buildAccessInventory(hierarchy)
};

process.stdout.write(`${JSON.stringify(inventory, null, 2)}\n`);
