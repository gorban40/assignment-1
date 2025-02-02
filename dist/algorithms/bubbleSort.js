"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bubbleSort = bubbleSort;
/**
 * Bubble Sort:
 * This function iterates through the array multiple times.
 * In each pass, it compares adjacent elements and swaps them
 * if they are out of order. After each pass, the largest
 * element "bubbles up" to the end.
 *
 * @param arr - The original array of numbers
 * @returns A new array that is sorted in ascending order
 */
function bubbleSort(arr) {
    // Create a copy so we don't modify the original input
    const result = [...arr];
    // Outer loop: we need to do (length - 1) passes in the worst case
    for (let i = 0; i < result.length; i++) {
        // Inner loop: each pass compares adjacent pairs up to (length - i - 1)
        // Because after each pass, the last i elements are already in correct position
        for (let j = 0; j < result.length - i - 1; j++) {
            // If the current element is bigger than the next one, swap
            if (result[j] > result[j + 1]) {
                ;
                [result[j], result[j + 1]] = [result[j + 1], result[j]];
            }
        }
    }
    return result;
}
