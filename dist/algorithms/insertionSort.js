"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertionSort = insertionSort;
/**
 * Insertion Sort:
 * We treat the first element as "sorted," then for each subsequent
 * element, we move it backward through the sorted part of the array
 * until it's in the correct position.
 *
 * @param arr - The original array of numbers
 * @returns A new array that is sorted in ascending order
 */
function insertionSort(arr) {
    const result = [...arr];
    // Start from the second element (index 1) since the first element
    // (index 0) is considered "sorted" by default
    for (let i = 1; i < result.length; i++) {
        const current = result[i];
        let j = i - 1;
        // Move elements that are greater than `current` one position ahead
        // to make room for `current`.
        while (j >= 0 && result[j] > current) {
            result[j + 1] = result[j];
            j--;
        }
        // Place the current element at the correct index
        result[j + 1] = current;
    }
    return result;
}
