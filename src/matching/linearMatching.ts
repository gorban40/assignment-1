/***************************************************************************
 * matchCreditCards.ts
 *
 * Purpose:
 *  1) Read File One, parse & sort by (expiryDate, pin) BEFORE assigning indexKey.
 *  2) Read File Two, parse.
 *  3) Match them row-by-row or with a dictionary approach keyed by the row index.
 *
 * Key Fix:
 *  - We sort the array of parsed rows for File One before .map() adds indexKey.
 ***************************************************************************/

import * as fs from 'fs'
import * as path from 'path'
import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'

interface CardRecord {
    indexKey?: number // The row index in sorted order (File One)
    first12?: string // For partial digits from File Two
    last4?: string // For partial digits from File One
    fullCardNumber?: string // The combined 16-digit number
    expiryDate?: string // e.g. "01/2024"
    verificationCode?: string
    pin?: string
    issuingNetwork?: string
}

function sortByDatePin(records: CardRecord[]): CardRecord[] {
    return records.sort((a, b) => {
        const [aMonth, aYear] = a.expiryDate?.split('/').map(Number) ?? []
        const [bMonth, bYear] = b.expiryDate?.split('/').map(Number) ?? []

        // Compare by year
        if (aYear !== bYear) return aYear - bYear
        // Then by month
        if (aMonth !== bMonth) return aMonth - bMonth
        // Then by PIN as a number
        const aPin = Number(a.pin)
        const bPin = Number(b.pin)
        return aPin - bPin
    })
}

/**
 * readCsvFileOne:
 *  1) Parse CSV into array of "raw" CardRecords (with last4).
 *  2) Sort by (expiryDate, pin).
 *  3) Assign indexKey after sorting.
 */
function readCsvFileOne(filePath: string): CardRecord[] {
    const rawContent = fs.readFileSync(path.resolve(filePath), 'utf-8')
    const rows = parse(rawContent, { columns: true, skip_empty_lines: true })

    // 1) Convert each row into a CardRecord (without indexKey yet)
    let intermediate: CardRecord[] = rows.map((row: any) => {
        const ccNumber: string = row['Credit Card Number'] ?? ''
        let last4 = ''
        const parts = ccNumber.split('-')
        if (parts.length === 4) {
            last4 = parts[3] // e.g., "9527"
        }
        return {
            last4,
            expiryDate: row['Expiry Date']?.trim(),
            verificationCode: row['Verification Code']?.trim(),
            pin: row['PIN']?.trim(),
            issuingNetwork: row['Issueing Network']?.trim(),
        }
    })

    // 2) Sort by date & pin
    intermediate = sortByDatePin(intermediate)

    // 3) Assign indexKey AFTER sorting
    const finalRecords = intermediate.map((rec, i) => {
        return {
            ...rec,
            indexKey: i,
        }
    })

    return finalRecords
}

/**
 * readCsvFileTwo:
 *  1) Parse CSV into array of "raw" CardRecords (with first12).
 */
function readCsvFileTwo(
    filePath: string,
    doSort: boolean = false
): CardRecord[] {
    const rawContent = fs.readFileSync(path.resolve(filePath), 'utf-8')
    const rows = parse(rawContent, { columns: true, skip_empty_lines: true })

    // 1) Convert each row to a CardRecord
    let intermediate: CardRecord[] = rows.map((row: any, idx: number) => {
        const ccNumber: string = row['Credit Card Number'] ?? ''
        let first12 = ''
        if (ccNumber.endsWith('****')) {
            first12 = ccNumber.replace('****', '').trim()
        }
        return {
            first12,
            expiryDate: row['Expiry Date']?.trim() || '',
            verificationCode: row['Verification Code']?.trim() || '',
            pin: row['PIN']?.trim() || '',
            issuingNetwork: row['Issueing Network']?.trim() || '',

            // If we want to do row-index matching, we store indexKey here too
            // This is only necessary if we do a row-based dictionary or bubble sort
            indexKey: idx,
        }
    })

    return intermediate
}

/**
 * combineRowByRow:
 * If we assume both files have the same number of rows
 * and we want to combine the i-th row in File One with the i-th row in File Two.
 */
function combineRowByRow(
    fileOneData: CardRecord[],
    fileTwoData: CardRecord[]
): CardRecord[] {
    const length = Math.min(fileOneData.length, fileTwoData.length)
    const merged: CardRecord[] = []
    for (let i = 0; i < length; i++) {
        const one = fileOneData[i]
        const two = fileTwoData[i]
        const fullNumber = (two.first12 || '') + (one.last4 || '')
        merged.push({
            fullCardNumber: fullNumber,
            expiryDate: one.expiryDate || two.expiryDate,
            verificationCode: one.verificationCode || two.verificationCode,
            pin: one.pin || two.pin,
            issuingNetwork: one.issuingNetwork || two.issuingNetwork,
        })
    }
    return merged
}

/**
 * matchByIndexDictionary:
 *  1) Build a dictionary from fileTwo keyed by .indexKey
 *  2) For each record in fileOne, look up dictionary in O(1)
 */
function matchByIndexDictionary(
    fileOne: CardRecord[],
    fileTwo: CardRecord[]
): CardRecord[] {
    const dict = new Map<number, CardRecord>()
    for (const row of fileTwo) {
        if (row.indexKey !== undefined) {
            dict.set(row.indexKey, row)
        }
    }

    const merged: CardRecord[] = []
    for (const one of fileOne) {
        if (one.indexKey !== undefined) {
            const two = dict.get(one.indexKey)
            if (two) {
                const fullNumber = (two.first12 || '') + (one.last4 || '')
                merged.push({
                    fullCardNumber: fullNumber,
                    expiryDate: one.expiryDate || two.expiryDate,
                    verificationCode:
                        one.verificationCode || two.verificationCode,
                    pin: one.pin || two.pin,
                    issuingNetwork: one.issuingNetwork || two.issuingNetwork,
                })
            }
        }
    }
    return merged
}

function writeCsvFile(filePath: string, records: CardRecord[]): void {
    const outputRows = records.map((r) => ({
        'Credit Card Number': r.fullCardNumber ?? '',
        'Expiry Date': r.expiryDate ?? '',
        'Verification Code': r.verificationCode ?? '',
        PIN: r.pin ?? '',
        'Issueing Network': r.issuingNetwork ?? '',
    }))
    const csvOut = stringify(outputRows, { header: true })
    fs.writeFileSync(path.resolve(filePath), csvOut, 'utf-8')
    console.log(`Wrote ${records.length} rows to ${filePath}`)
}

function benchmarkBoth(fileOne: CardRecord[], fileTwo: CardRecord[]) {
    console.log(
        `\n[Benchmark] Dataset size: FileOne=${fileOne.length}, FileTwo=${fileTwo.length}`
    )

    const startLinear = performance.now()
    const linearMatches = combineRowByRow(fileOne, fileTwo)
    const endLinear = performance.now()
    console.log(
        `Linear dictionary found ${linearMatches.length} matches in ${(
            endLinear - startLinear
        ).toFixed(2)} ms`
    )

    const startLogLin = performance.now()
    const logLinMatches = matchByIndexDictionary(fileOne, fileTwo)
    const endLogLin = performance.now()
    console.log(
        `Log-Linear (BubbleSort+BinarySearch) found ${
            logLinMatches.length
        } matches in ${(endLogLin - startLogLin).toFixed(2)} ms`
    )
}

function matchCreditCards() {
    try {
        const fileOnePath = './carddump2.csv'
        const fileTwoPath = './carddump1.csv'

        console.log('Reading File One (sort before index assignment)...')
        const fileOneData = readCsvFileOne(fileOnePath)

        console.log('Reading File Two (no auto-sorting unless desired)...')
        const fileTwoData = readCsvFileTwo(fileTwoPath, /* doSort= */ false)

        // Option A: Combine row-by-row
        // If fileOneData and fileTwoData have the same # of rows and we want to pair i->i
        console.log('Combining row by row...')
        const mergedRowByRow = combineRowByRow(fileOneData, fileTwoData)
        writeCsvFile('mergedRowByRow.csv', mergedRowByRow)

        // Option B: Match by dictionary keyed by index (if both are assigned indexKey)
        console.log('Combining via dictionary keyed by indexKey...')
        const mergedIndexDict = matchByIndexDictionary(fileOneData, fileTwoData)
        writeCsvFile('mergedIndexDict.csv', mergedIndexDict)

        // Benchmark
        benchmarkBoth(fileOneData, fileTwoData)

        console.log('Done! Check merged CSV files.')
    } catch (err) {
        console.error('Error:', err)
    }
}

export function linearMatching() {
    matchCreditCards()
}
