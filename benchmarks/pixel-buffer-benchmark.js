'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const {performance} = require('perf_hooks');
const {Pixel_Buffer} = require('../core/gfx-core');
const Float32Convolution = require('../core/convolution');
const pixelAccess = require('../core/pixel-buffer-pixel-access');

const args = new Set(process.argv.slice(2));
const jsonOnly = args.has('--json');
const skipComparison = args.has('--no-compare');
const baselinePath = path.join(__dirname, 'pixel-buffer-baseline.json');
const sampleCount = Number.parseInt(process.env.JSGUI_GFX_BENCH_SAMPLES || '31', 10);
const minimumSampleMs = Number.parseFloat(process.env.JSGUI_GFX_BENCH_MIN_SAMPLE_MS || '8');
const warmupMs = Number.parseFloat(process.env.JSGUI_GFX_BENCH_WARMUP_MS || '80');

if (!Number.isSafeInteger(sampleCount) || sampleCount < 5) {
    throw new RangeError('JSGUI_GFX_BENCH_SAMPLES must be an integer of at least 5');
}
if (!Number.isFinite(minimumSampleMs) || minimumSampleMs <= 0 ||
    !Number.isFinite(warmupMs) || warmupMs <= 0) {
    throw new RangeError('Benchmark duration settings must be positive finite numbers');
}

let blackhole = 0;

const percentile = (sorted, fraction) =>
    sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * fraction) - 1)];

const environment = () => {
    const cpus = os.cpus();
    return {
        node: process.version,
        v8: process.versions.v8,
        platform: process.platform,
        arch: process.arch,
        release: os.release(),
        cpu: cpus.length === 0 ? 'unknown' : cpus[0].model,
        logicalCpuCount: cpus.length,
        sampleCount,
        minimumSampleMs,
        warmupMs
    };
};

const makeCases = () => {
    const cases = [];
    const add = (name, setup, operation, absoluteNoiseMs) => {
        cases.push({name, setup, operation, absoluteNoiseMs});
    };

    add(
        'construct.8bipp.256x256',
        () => ({}),
        (_, iteration) => {
            const image = new Pixel_Buffer({size: [256, 256], bits_per_pixel: 8});
            blackhole ^= image.ta.length + iteration;
        },
        0.01
    );

    add(
        'access.public.8bipp.tight.batch4096',
        () => ({
            image: new Pixel_Buffer({size: [4096, 1], bits_per_pixel: 8}),
            position: [0, 0]
        }),
        state => {
            const {image, position} = state;
            let sum = 0;
            for (let x = 0; x < 4096; x++) {
                position[0] = x;
                image.set_pixel(position, x);
                sum += image.get_pixel(position);
            }
            blackhole ^= sum;
        },
        0.15
    );

    add(
        'access.direct.8bipp.tight.batch4096',
        () => ({image: new Pixel_Buffer({size: [4096, 1], bits_per_pixel: 8})}),
        state => {
            const ta = state.image.ta;
            let sum = 0;
            for (let x = 0; x < 4096; x++) {
                ta[x] = x;
                sum += ta[x];
            }
            blackhole ^= sum;
        },
        0.005
    );

    add(
        'access.public.24bipp.padded.batch4096',
        () => ({
            image: new Pixel_Buffer({
                size: [257, 16], bits_per_pixel: 24, rowAlignmentBytes: 16
            }),
            position: [0, 0],
            color: [17, 29, 43]
        }),
        state => {
            const {image, position, color} = state;
            let sum = 0;
            for (let index = 0; index < 4096; index++) {
                position[0] = index % 257;
                position[1] = Math.floor(index / 257);
                image.set_pixel(position, color);
                sum += image.get_pixel(position)[0];
            }
            blackhole ^= sum;
        },
        // Baseline p95 - median is 0.188847 ms on this WSL host.
        0.2
    );

    try {
        const unsafe = pixelAccess;
        if (typeof unsafe.unsafeSetPixel8bipp === 'function' &&
            typeof unsafe.unsafeGetPixel8bipp === 'function') {
            add(
                'access.unsafe.8bipp.tight.batch4096',
                () => ({
                    image: new Pixel_Buffer({size: [4096, 1], bits_per_pixel: 8}),
                    position: [0, 0]
                }),
                state => {
                    const {image, position} = state;
                    let sum = 0;
                    for (let x = 0; x < 4096; x++) {
                        position[0] = x;
                        unsafe.unsafeSetPixel8bipp(image, position, x);
                        sum += unsafe.unsafeGetPixel8bipp(image, position);
                    }
                    blackhole ^= sum;
                },
                0.04
            );
        }
    } catch (error) {
        if (error.code !== 'MODULE_NOT_FOUND') throw error;
    }

    const byIndexFormats = [
        {
            bipp: 1,
            color: 1,
            unsafeGet: pixelAccess.unsafeGetPixelByIndex1bipp,
            unsafeSet: pixelAccess.unsafeSetPixelByIndex1bipp
        },
        {
            bipp: 8,
            color: 173,
            unsafeGet: pixelAccess.unsafeGetPixelByIndex8bipp,
            unsafeSet: pixelAccess.unsafeSetPixelByIndex8bipp
        },
        {
            bipp: 24,
            color: [17, 29, 43],
            unsafeGet: pixelAccess.unsafeGetPixelByIndex24bipp,
            unsafeSet: pixelAccess.unsafeSetPixelByIndex24bipp
        },
        {
            bipp: 32,
            color: [17, 29, 43, 211],
            unsafeGet: pixelAccess.unsafeGetPixelByIndex32bipp,
            unsafeSet: pixelAccess.unsafeSetPixelByIndex32bipp
        }
    ];
    const byIndexLayouts = [
        {name: 'tight', size: [64, 16], rowAlignmentBytes: 1},
        {name: 'padded', size: [13, 79], rowAlignmentBytes: 16}
    ];
    for (const format of byIndexFormats) {
        for (const layout of byIndexLayouts) {
            for (const checked of [true, false]) {
                const mode = checked ? 'checked' : 'unsafe';
                const noiseFloor = checked
                    ? (format.bipp >= 24 ? 0.1 : format.bipp === 8 ? 0.07 : 0.08)
                    : (format.bipp >= 24 ? 0.05 : format.bipp === 8 ? 0.04 : 0.03);
                add(
                    `access.by-index.${mode}.${format.bipp}bipp.${layout.name}.batch1024`,
                    () => {
                        const image = new Pixel_Buffer({
                            size: layout.size,
                            bits_per_pixel: format.bipp,
                            rowAlignmentBytes: layout.rowAlignmentBytes
                        });
                        return {
                            image,
                            color: format.color,
                            pixelCount: image.size[0] * image.size[1],
                            unsafeGet: format.unsafeGet,
                            unsafeSet: format.unsafeSet
                        };
                    },
                    state => {
                        const {image, pixelCount, unsafeGet, unsafeSet} = state;
                        let sum = 0;
                        if (checked) {
                            for (let offset = 0; offset < 1024; offset++) {
                                const index = offset % pixelCount;
                                const color = format.bipp === 1 ? offset & 1 : state.color;
                                image.set_pixel_by_idx(index, color);
                                const value = image.get_pixel_by_idx(index);
                                sum += typeof value === 'number' ? value : value[0];
                            }
                        } else {
                            for (let offset = 0; offset < 1024; offset++) {
                                const index = offset % pixelCount;
                                const color = format.bipp === 1 ? offset & 1 : state.color;
                                unsafeSet(image, index, color);
                                const value = unsafeGet(image, index);
                                sum += typeof value === 'number' ? value : value[0];
                            }
                        }
                        blackhole ^= sum;
                    },
                    noiseFloor
                );
            }
        }
    }

    add(
        'iterate.each_pixel.8bipp.128x128',
        () => {
            const image = new Pixel_Buffer({size: [128, 128], bits_per_pixel: 8});
            for (let index = 0; index < image.ta.length; index++) image.ta[index] = index;
            return {image};
        },
        state => {
            let sum = 0;
            state.image.each_pixel((position, color) => {
                sum += color + position[0];
            });
            blackhole ^= sum;
        },
        0.05
    );

    add(
        'raster.line.24bipp.512px',
        () => ({
            image: new Pixel_Buffer({size: [512, 64], bits_per_pixel: 24}),
            colorA: [1, 2, 3],
            colorB: [4, 5, 6]
        }),
        (state, iteration) => {
            state.image.draw_line([0, iteration & 63], [511, iteration & 63],
                iteration & 1 ? state.colorA : state.colorB);
            blackhole ^= state.image.ta[(iteration & 63) * state.image.bytes_per_row];
        },
        0.005
    );

    add(
        'painter.rect.24bipp.384x256',
        () => ({
            image: new Pixel_Buffer({size: [384, 256], bits_per_pixel: 24}),
            colorA: [7, 8, 9],
            colorB: [10, 11, 12]
        }),
        (state, iteration) => {
            state.image.paint.rect([16, 16], [352, 224],
                iteration & 1 ? state.colorA : state.colorB);
            blackhole ^= state.image.ta[16 * state.image.bytes_per_row + 48];
        },
        0.01
    );

    add(
        'mask.create.24bipp.128x128',
        () => {
            const image = new Pixel_Buffer({size: [128, 128], bits_per_pixel: 24});
            for (let index = 0; index < image.ta.length; index++) image.ta[index] = index;
            return {image};
        },
        state => {
            const mask = state.image.get_mask_each_px(color => color[0] > 127);
            blackhole ^= mask.ta[0] + mask.ta[mask.ta.length - 1];
        },
        0.15
    );

    add(
        'resize.24bipp.64x48.to37x61',
        () => {
            const image = new Pixel_Buffer({size: [64, 48], bits_per_pixel: 24});
            for (let index = 0; index < image.ta.length; index++) image.ta[index] = index * 13;
            return {image};
        },
        state => {
            const resized = state.image.new_resized([37, 61]);
            blackhole ^= resized.ta[0] + resized.ta[resized.ta.length - 1];
        },
        0.04
    );

    add(
        'convolution.8bipp.64x64.3x3',
        () => {
            const image = new Pixel_Buffer({size: [64, 64], bits_per_pixel: 8});
            for (let index = 0; index < image.ta.length; index++) image.ta[index] = index;
            const convolution = new Float32Convolution({
                size: [3, 3],
                value: [0, 0.125, 0, 0.125, 0.5, 0.125, 0, 0.125, 0]
            });
            return {image, convolution};
        },
        state => {
            const result = state.image.new_convolved(state.convolution);
            blackhole ^= result.ta[0] + result.ta[result.ta.length - 1];
        },
        0.3
    );

    add(
        'flood.8bipp.128x128',
        () => ({image: new Pixel_Buffer({size: [128, 128], bits_per_pixel: 8})}),
        (state, iteration) => {
            const color = iteration & 1;
            state.image.flood_fill(0, 0, color);
            blackhole ^= state.image.ta[0];
        },
        0.05
    );

    add(
        'placement.24bipp.32x32.into128x128',
        () => {
            const source = new Pixel_Buffer({size: [32, 32], bits_per_pixel: 24});
            const target = new Pixel_Buffer({size: [128, 128], bits_per_pixel: 24});
            source.ta.fill(97);
            return {source, target};
        },
        (state, iteration) => {
            state.target.place_image_from_pixel_buffer(state.source,
                [iteration & 63, iteration & 63]);
            blackhole ^= state.target.ta[0];
        },
        0.01
    );

    add(
        'window.copy.24bipp.64x64.from256x256',
        () => {
            const source = new Pixel_Buffer({size: [256, 256], bits_per_pixel: 24});
            for (let index = 0; index < source.ta.length; index++) source.ta[index] = index;
            const window = source.new_window({size: [64, 64], pos: [32, 32]});
            return {source, window};
        },
        state => {
            state.window.copy_from_source();
            blackhole ^= state.window.ta[0] + state.window.ta[state.window.ta.length - 1];
        },
        0.01
    );

    return cases;
};

const timeIterations = (benchmarkCase, state, iterations) => {
    const start = performance.now();
    for (let iteration = 0; iteration < iterations; iteration++) {
        benchmarkCase.operation(state, iteration);
    }
    return performance.now() - start;
};

const runCase = benchmarkCase => {
    const state = benchmarkCase.setup();
    let iterations = 1;
    let elapsed = timeIterations(benchmarkCase, state, iterations);
    while (elapsed < minimumSampleMs && iterations < 1_048_576) {
        iterations *= 2;
        elapsed = timeIterations(benchmarkCase, state, iterations);
    }

    const warmupDeadline = performance.now() + warmupMs;
    while (performance.now() < warmupDeadline) {
        timeIterations(benchmarkCase, state, iterations);
    }

    const samples = [];
    for (let sample = 0; sample < sampleCount; sample++) {
        samples.push(timeIterations(benchmarkCase, state, iterations) / iterations);
    }
    samples.sort((a, b) => a - b);
    return {
        medianMs: percentile(samples, 0.5),
        p95Ms: percentile(samples, 0.95),
        minMs: samples[0],
        iterationsPerSample: iterations,
        absoluteNoiseMs: benchmarkCase.absoluteNoiseMs
    };
};

const output = {
    schemaVersion: 2,
    generatedAt: new Date().toISOString(),
    environment: environment(),
    results: {}
};

const benchmarkCases = makeCases();
for (const benchmarkCase of benchmarkCases) {
    output.results[benchmarkCase.name] = runCase(benchmarkCase);
}

const regressionFor = (name, result, previous) => {
    if (!previous) return;
    const deltaMs = result.medianMs - previous.medianMs;
    const ratio = result.medianMs / previous.medianMs;
    const absoluteNoiseMs = previous.absoluteNoiseMs === undefined
        ? result.absoluteNoiseMs
        : previous.absoluteNoiseMs;
    if (ratio > 1.05 && deltaMs > absoluteNoiseMs) {
        return {name, ratio, deltaMs, absoluteNoiseMs};
    }
};

const candidates = [];
const regressions = [];
let baseline;
if (!skipComparison && fs.existsSync(baselinePath)) {
    baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
    for (const [name, result] of Object.entries(output.results)) {
        const previous = baseline.results && baseline.results[name];
        const candidate = regressionFor(name, result, previous);
        if (candidate) candidates.push(candidate);
    }
    if (candidates.length > 0) {
        output.confirmations = {};
        for (const candidate of candidates) {
            const benchmarkCase = benchmarkCases.find(entry =>
                entry.name === candidate.name
            );
            const confirmation = runCase(benchmarkCase);
            output.confirmations[candidate.name] = confirmation;
            const previous = baseline.results[candidate.name];
            const confirmed = regressionFor(
                candidate.name, confirmation, previous
            );
            if (confirmed) {
                regressions.push({
                    ...confirmed,
                    initialRatio: candidate.ratio,
                    initialDeltaMs: candidate.deltaMs
                });
            }
        }
    }
}
output.candidates = candidates;
output.regressions = regressions;
output.blackhole = blackhole;

if (jsonOnly) {
    process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
} else {
    console.log(`Node ${output.environment.node} · ${output.environment.platform}/${output.environment.arch}`);
    console.log(`${output.environment.cpu} · ${sampleCount} samples · median/p95 ms per operation`);
    for (const [name, result] of Object.entries(output.results)) {
        let comparison = '';
        const previous = baseline && baseline.results && baseline.results[name];
        if (previous) {
            const ratio = result.medianMs / previous.medianMs;
            comparison = ` · ${(ratio * 100).toFixed(1)}% baseline`;
        }
        console.log(
            `${name.padEnd(48)} ${result.medianMs.toFixed(6)} / ${result.p95Ms.toFixed(6)}${comparison}`
        );
    }
    if (output.confirmations) {
        console.log(`Benchmark confirmations: ${candidates.length} candidate(s)`);
        for (const candidate of candidates) {
            const confirmation = output.confirmations[candidate.name];
            const previous = baseline.results[candidate.name];
            const ratio = confirmation.medianMs / previous.medianMs;
            console.log(
                `  ${candidate.name}: ${confirmation.medianMs.toFixed(6)} / ` +
                `${confirmation.p95Ms.toFixed(6)} · ${(ratio * 100).toFixed(1)}% baseline`
            );
        }
    }
    if (regressions.length === 0) {
        console.log(baseline ? 'Benchmark gate: passed' : 'Benchmark gate: no baseline file');
    } else {
        console.error('Benchmark gate: failed');
        for (const regression of regressions) {
            console.error(
                `  ${regression.name}: ${(regression.ratio * 100).toFixed(1)}% baseline, ` +
                `+${regression.deltaMs.toFixed(6)} ms confirmed ` +
                `(initial ${(regression.initialRatio * 100).toFixed(1)}%, ` +
                `noise floor ${regression.absoluteNoiseMs} ms)`
            );
        }
    }
}

if (regressions.length > 0) process.exitCode = 1;
