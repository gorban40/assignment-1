/***************************************************************************
 * binaryTreeExperiment.ts
 *
 * Purpose:
 *   1) Generate a large set of random integer keys.
 *   2) Insert keys into a binary tree in original random order.
 *   3) Build a perfectly balanced binary tree by sorting the keys and constructing
 *      the tree level-by-level.
 *   4) Insert keys into a standard Set.
 *   5) Benchmark and compare the running times of these operations.
 *
 * Key Components:
 *   - BinaryTree class with a recursive insert method.
 *   - buildBalancedTree function to create a balanced binary tree.
 *   - A shuffle function to randomize the keys.
 *   - Performance measurements using performance.now() from the perf_hooks module.
 ***************************************************************************/

import { performance } from 'perf_hooks'

/**
 * TreeNode:
 * Represents a node in a binary tree.
 */
class TreeNode {
    key: number
    left: TreeNode | null = null
    right: TreeNode | null = null

    constructor(key: number) {
        this.key = key
    }
}

/**
 * BinaryTree:
 * A simple binary tree that supports inserting keys.
 */
class BinaryTree {
    root: TreeNode | null = null

    /**
     * insert:
     * Inserts a new key into the binary tree.
     *
     * @param key - The integer key to insert.
     */
    insert(key: number): void {
        this.root = this.insertRec(this.root, key)
    }

    /**
     * insertRec:
     * Recursively finds the correct location for the new key.
     *
     * @param node - The current TreeNode in the recursion.
     * @param key - The key to insert.
     * @returns The updated TreeNode.
     */
    private insertRec(node: TreeNode | null, key: number): TreeNode {
        if (node === null) {
            return new TreeNode(key)
        }
        if (key < node.key) {
            node.left = this.insertRec(node.left, key)
        } else {
            node.right = this.insertRec(node.right, key)
        }
        return node
    }
}

/**
 * buildBalancedTree:
 * Constructs a perfectly balanced binary tree from a sorted array of keys.
 * The middle element is chosen as the root, and the function is called recursively
 * on the left and right halves.
 *
 * @param keys - Sorted array of integer keys.
 * @param start - Starting index of the current subarray.
 * @param end - Ending index of the current subarray.
 * @returns The root of the balanced binary tree.
 */
function buildBalancedTree(
    keys: number[],
    start: number,
    end: number
): TreeNode | null {
    if (start > end) return null
    const mid = Math.floor((start + end) / 2)
    const node = new TreeNode(keys[mid])
    node.left = buildBalancedTree(keys, start, mid - 1)
    node.right = buildBalancedTree(keys, mid + 1, end)
    return node
}

/**
 * generateKeys:
 * Generates an array of integer keys from 0 to n - 1.
 *
 * @param n - The total number of keys to generate.
 * @returns An array of keys.
 */
function generateKeys(n: number): number[] {
    const keys: number[] = []
    for (let i = 0; i < n; i++) {
        keys.push(i)
    }
    return keys
}

/**
 * shuffle:
 * Randomly shuffles an array in place using the Fisher-Yates algorithm.
 *
 * @param array - The array to shuffle.
 */
function shuffle<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[array[i], array[j]] = [array[j], array[i]]
    }
}

/**
 * benchmarkBinaryTreeInsertion:
 * Measures the time taken to insert keys into a binary tree in random order.
 *
 * @param keys - Array of keys in random order.
 * @returns The elapsed time in milliseconds.
 */
function benchmarkBinaryTreeInsertion(keys: number[]): number {
    const tree = new BinaryTree()
    const startTime = performance.now()
    for (const key of keys) {
        tree.insert(key)
    }
    const endTime = performance.now()
    return endTime - startTime
}

/**
 * benchmarkBalancedTreeConstruction:
 * Measures the time taken to build a balanced binary tree from sorted keys.
 *
 * @param keys - Array of keys sorted in ascending order.
 * @returns The elapsed time in milliseconds.
 */
function benchmarkBalancedTreeConstruction(keys: number[]): number {
    const startTime = performance.now()
    buildBalancedTree(keys, 0, keys.length - 1)
    const endTime = performance.now()
    return endTime - startTime
}

/**
 * benchmarkSetInsertion:
 * Measures the time taken to insert keys into a standard Set.
 *
 * @param keys - Array of keys.
 * @returns The elapsed time in milliseconds.
 */
function benchmarkSetInsertion(keys: number[]): number {
    const treeSet = new Set<number>()
    const startTime = performance.now()
    for (const key of keys) {
        treeSet.add(key)
    }
    const endTime = performance.now()
    return endTime - startTime
}

/**
 * binaryTreeTest:
 *   1) Generates a set of random keys.
 *   2) Benchmarks binary tree insertion in random order.
 *   3) Benchmarks balanced tree construction from sorted keys.
 *   4) Benchmarks insertion into a standard Set.
 *   5) Logs the results.
 */
function binaryTreeTest(): void {
    const m = 18

    const n = (1 << m) - 1 // n = 2^m - 1

    // Generate keys for the experiment.
    const randomKeys = generateKeys(n)
    // Shuffle keys for random order insertion.
    shuffle(randomKeys)

    console.log(`Total keys: ${n}`)

    // Benchmark a) Binary tree insertion in random order.
    const binaryTreeTime = benchmarkBinaryTreeInsertion(randomKeys)
    console.log(`Binary tree insertion time: ${Math.round(binaryTreeTime)} ms`)

    // For balanced tree construction, use sorted keys (best-case order).
    const sortedKeys = generateKeys(n) // generateKeys returns sorted keys (0 to n-1)
    const balancedTreeTime = benchmarkBalancedTreeConstruction(sortedKeys)
    console.log(
        `Balanced tree construction time: ${Math.round(balancedTreeTime)} ms`
    )

    // Benchmark c) Set insertion.
    const setInsertionTime = benchmarkSetInsertion(sortedKeys)
    console.log(`Set insertion time: ${Math.round(setInsertionTime)} ms`)
}

binaryTreeTest()
