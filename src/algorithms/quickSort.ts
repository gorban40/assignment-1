/**
 * Quick Sort:
 * Selects a pivot (here, using the middle element).
 * Partitions the array into elements less than, equal to, or greater than the pivot,
 * then recursively sorts those partitions.
 *
 * @param arr - The original array of numbers
 * @returns A new array that is sorted in ascending order
 */
export function quickSort(arr: number[]): number[] {
    // Base case: an array of length < 2 is already sorted
    if (arr.length < 2) return arr

    // Choose a pivot (e.g., the middle element)
    const pivot = arr[Math.floor(arr.length / 2)]

    // Arrays for elements less than, equal to, or greater than pivot
    const left: number[] = []
    const right: number[] = []
    const equal: number[] = []

    // Partition the array by comparing each element to the pivot
    for (const num of arr) {
        if (num < pivot) {
            left.push(num)
        } else if (num > pivot) {
            right.push(num)
        } else {
            // If it's equal, store it in 'equal'
            equal.push(num)
        }
    }

    // Recursively sort left and right, then concatenate
    return [...quickSort(left), ...equal, ...quickSort(right)]
}
