import { performance } from 'perf_hooks'
import { generateRandomArray } from './dataGeneration'

export function benchmark(
    sizes: number[],
    algorithm: (arr: number[]) => number[]
): void {
    for (const size of sizes) {
        const arr = generateRandomArray(size)
        const start = performance.now()
        algorithm(arr)
        const end = performance.now()
        const elapsed = end - start
        console.log(`${size} - elements ~ ${elapsed.toFixed(3)} ms`)
    }
}
