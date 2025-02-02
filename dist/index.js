"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const benchmark_1 = require("./utils/benchmark");
const constantArrayForTesting_1 = require("./constantArrayForTesting");
// Algorithms
const bubbleSort_1 = require("./algorithms/bubbleSort");
const insertionSort_1 = require("./algorithms/insertionSort");
const mergeSort_1 = require("./algorithms/mergeSort");
const quickSort_1 = require("./algorithms/quickSort");
//Matching
const linearMatching_1 = require("./matching/linearMatching");
console.log('Benchmarking algorithms...');
console.log('--------------------------------');
console.log('Quick Sort');
(0, benchmark_1.benchmark)(constantArrayForTesting_1.constantArrayForTesting, quickSort_1.quickSort);
console.log('--------------------------------');
console.log('Merge Sort');
(0, benchmark_1.benchmark)(constantArrayForTesting_1.constantArrayForTesting, mergeSort_1.mergeSort);
console.log('--------------------------------');
console.log('Bubble Sort');
(0, benchmark_1.benchmark)(constantArrayForTesting_1.constantArrayForTesting, bubbleSort_1.bubbleSort);
console.log('--------------------------------');
console.log('Insertion Sort');
(0, benchmark_1.benchmark)(constantArrayForTesting_1.constantArrayForTesting, insertionSort_1.insertionSort);
console.log('--------------------------------');
console.log('Matching...');
(0, linearMatching_1.linearMatching)();
console.log('--------------------------------');
