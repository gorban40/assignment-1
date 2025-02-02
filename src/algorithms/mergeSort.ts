/**
 * merge:
 * A helper function that takes two already sorted arrays
 * and merges them into a single sorted array.
 *
 * @param left - A sorted array
 * @param right - Another sorted array
 * @returns A merged, sorted array containing all elements of left and right
 */
function merge(left: number[], right: number[]): number[] {
    const result: number[] = []
    let i = 0
    let j = 0

    // Compare elements from 'left' and 'right' one by one
    // and push the smaller element into 'result'.
    while (i < left.length && j < right.length) {
        if (left[i] < right[j]) {
            result.push(left[i])
            i++
        } else {
            result.push(right[j])
            j++
        }
    }

    // Append the remaining elements from either 'left' or 'right'
    // (only one of these will have leftover elements)
    return [...result, ...left.slice(i), ...right.slice(j)]
}

/**
 * Merge Sort:
 * Recursively splits the array in half, sorts each half,
 * and merges them back together using the `merge` function.
 *
 * @param arr - The original array of numbers
 * @returns A new array sorted in ascending order
 */
export function mergeSort(arr: number[]): number[] {
    // Base case: an array of 1 or 0 elements is already sorted
    if (arr.length <= 1) return arr

    // Find the middle index to split the array
    const mid = Math.floor(arr.length / 2)

    // Recursively sort the left and right halves
    const left = mergeSort(arr.slice(0, mid))
    const right = mergeSort(arr.slice(mid))

    // Merge the two sorted halves
    return merge(left, right)
}
