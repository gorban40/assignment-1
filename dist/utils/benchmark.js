"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.benchmark = benchmark;
const perf_hooks_1 = require("perf_hooks");
const dataGeneration_1 = require("./dataGeneration");
function benchmark(sizes, algorithm) {
    for (const size of sizes) {
        const arr = (0, dataGeneration_1.generateRandomArray)(size);
        const start = perf_hooks_1.performance.now();
        algorithm(arr);
        const end = perf_hooks_1.performance.now();
        const elapsed = end - start;
        console.log(`${size} - elements ~ ${elapsed.toFixed(3)} ms`);
    }
}
