import { benchmark } from './utils/benchmark'
import { constantArrayForTesting } from './constantArrayForTesting'
// Algorithms
import { bubbleSort } from './algorithms/bubbleSort'
import { insertionSort } from './algorithms/insertionSort'
import { mergeSort } from './algorithms/mergeSort'
import { quickSort } from './algorithms/quickSort'
//Matching
import { linearMatching } from './matching/linearMatching'

console.log('Benchmarking algorithms...')
console.log('--------------------------------')
console.log('Quick Sort')
benchmark(constantArrayForTesting, quickSort)
console.log('--------------------------------')
console.log('Merge Sort')
benchmark(constantArrayForTesting, mergeSort)
console.log('--------------------------------')
console.log('Bubble Sort')
benchmark(constantArrayForTesting, bubbleSort)
console.log('--------------------------------')
console.log('Insertion Sort')
benchmark(constantArrayForTesting, insertionSort)
console.log('--------------------------------')
console.log('Matching...')
linearMatching()
console.log('--------------------------------')
