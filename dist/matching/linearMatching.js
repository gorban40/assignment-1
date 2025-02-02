"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.linearMatching = linearMatching;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const sync_1 = require("csv-parse/sync");
const sync_2 = require("csv-stringify/sync");
// -----------------------------------------------------
// 2. SORTING HELPER
// -----------------------------------------------------
function sortByDatePin(records) {
    return records.sort((a, b) => {
        var _a, _b, _c, _d;
        const [aMonth, aYear] = (_b = (_a = a.expiryDate) === null || _a === void 0 ? void 0 : _a.split('/').map(Number)) !== null && _b !== void 0 ? _b : [];
        const [bMonth, bYear] = (_d = (_c = b.expiryDate) === null || _c === void 0 ? void 0 : _c.split('/').map(Number)) !== null && _d !== void 0 ? _d : [];
        // Compare by year
        if (aYear !== bYear)
            return aYear - bYear;
        // Then by month
        if (aMonth !== bMonth)
            return aMonth - bMonth;
        // Then by PIN as a number
        const aPin = Number(a.pin);
        const bPin = Number(b.pin);
        return aPin - bPin;
    });
}
// -----------------------------------------------------
// 3. READ CSV FILE ONE (SORT BEFORE INDEX)
// -----------------------------------------------------
/**
 * readCsvFileOne:
 *  1) Parse CSV into array of "raw" CardRecords (with last4).
 *  2) Sort by (expiryDate, pin).
 *  3) Assign indexKey after sorting.
 */
function readCsvFileOne(filePath) {
    const rawContent = fs.readFileSync(path.resolve(filePath), 'utf-8');
    const rows = (0, sync_1.parse)(rawContent, { columns: true, skip_empty_lines: true });
    // 1) Convert each row into a CardRecord (without indexKey yet)
    let intermediate = rows.map((row) => {
        var _a, _b, _c, _d, _e;
        const ccNumber = (_a = row['Credit Card Number']) !== null && _a !== void 0 ? _a : '';
        let last4 = '';
        const parts = ccNumber.split('-');
        if (parts.length === 4) {
            last4 = parts[3]; // e.g., "9527"
        }
        return {
            last4,
            expiryDate: (_b = row['Expiry Date']) === null || _b === void 0 ? void 0 : _b.trim(),
            verificationCode: (_c = row['Verification Code']) === null || _c === void 0 ? void 0 : _c.trim(),
            pin: (_d = row['PIN']) === null || _d === void 0 ? void 0 : _d.trim(),
            issuingNetwork: (_e = row['Issueing Network']) === null || _e === void 0 ? void 0 : _e.trim(),
        };
    });
    // 2) Sort by date & pin
    intermediate = sortByDatePin(intermediate);
    // 3) Assign indexKey AFTER sorting
    const finalRecords = intermediate.map((rec, i) => {
        return Object.assign(Object.assign({}, rec), { indexKey: i });
    });
    return finalRecords;
}
// -----------------------------------------------------
// 4. READ CSV FILE TWO
// -----------------------------------------------------
/**
 * readCsvFileTwo:
 *  1) Parse CSV into array of "raw" CardRecords (with first12).
 */
function readCsvFileTwo(filePath, doSort = false) {
    const rawContent = fs.readFileSync(path.resolve(filePath), 'utf-8');
    const rows = (0, sync_1.parse)(rawContent, { columns: true, skip_empty_lines: true });
    // 1) Convert each row to a CardRecord
    let intermediate = rows.map((row, idx) => {
        var _a, _b, _c, _d, _e;
        const ccNumber = (_a = row['Credit Card Number']) !== null && _a !== void 0 ? _a : '';
        let first12 = '';
        if (ccNumber.endsWith('****')) {
            first12 = ccNumber.replace('****', '').trim();
        }
        return {
            first12,
            expiryDate: ((_b = row['Expiry Date']) === null || _b === void 0 ? void 0 : _b.trim()) || '',
            verificationCode: ((_c = row['Verification Code']) === null || _c === void 0 ? void 0 : _c.trim()) || '',
            pin: ((_d = row['PIN']) === null || _d === void 0 ? void 0 : _d.trim()) || '',
            issuingNetwork: ((_e = row['Issueing Network']) === null || _e === void 0 ? void 0 : _e.trim()) || '',
            // If we want to do row-index matching, we store indexKey here too
            // This is only necessary if we do a row-based dictionary or bubble sort
            indexKey: idx,
        };
    });
    return intermediate;
}
// -----------------------------------------------------
// 5. MATCHING LOGIC (ROW-BY-ROW or DICTIONARY)
// -----------------------------------------------------
/**
 * combineRowByRow:
 * If we assume both files have the same number of rows
 * and we want to combine the i-th row in File One with the i-th row in File Two.
 */
function combineRowByRow(fileOneData, fileTwoData) {
    const length = Math.min(fileOneData.length, fileTwoData.length);
    const merged = [];
    for (let i = 0; i < length; i++) {
        const one = fileOneData[i];
        const two = fileTwoData[i];
        const fullNumber = (two.first12 || '') + (one.last4 || '');
        merged.push({
            fullCardNumber: fullNumber,
            expiryDate: one.expiryDate || two.expiryDate,
            verificationCode: one.verificationCode || two.verificationCode,
            pin: one.pin || two.pin,
            issuingNetwork: one.issuingNetwork || two.issuingNetwork,
        });
    }
    return merged;
}
/**
 * matchByIndexDictionary:
 *  1) Build a dictionary from fileTwo keyed by .indexKey
 *  2) For each record in fileOne, look up dictionary in O(1)
 */
function matchByIndexDictionary(fileOne, fileTwo) {
    const dict = new Map();
    for (const row of fileTwo) {
        if (row.indexKey !== undefined) {
            dict.set(row.indexKey, row);
        }
    }
    const merged = [];
    for (const one of fileOne) {
        if (one.indexKey !== undefined) {
            const two = dict.get(one.indexKey);
            if (two) {
                const fullNumber = (two.first12 || '') + (one.last4 || '');
                merged.push({
                    fullCardNumber: fullNumber,
                    expiryDate: one.expiryDate || two.expiryDate,
                    verificationCode: one.verificationCode || two.verificationCode,
                    pin: one.pin || two.pin,
                    issuingNetwork: one.issuingNetwork || two.issuingNetwork,
                });
            }
        }
    }
    return merged;
}
// -----------------------------------------------------
// 6. WRITE CSV
// -----------------------------------------------------
function writeCsvFile(filePath, records) {
    const outputRows = records.map((r) => {
        var _a, _b, _c, _d, _e;
        return ({
            'Credit Card Number': (_a = r.fullCardNumber) !== null && _a !== void 0 ? _a : '',
            'Expiry Date': (_b = r.expiryDate) !== null && _b !== void 0 ? _b : '',
            'Verification Code': (_c = r.verificationCode) !== null && _c !== void 0 ? _c : '',
            PIN: (_d = r.pin) !== null && _d !== void 0 ? _d : '',
            'Issueing Network': (_e = r.issuingNetwork) !== null && _e !== void 0 ? _e : '',
        });
    });
    const csvOut = (0, sync_2.stringify)(outputRows, { header: true });
    fs.writeFileSync(path.resolve(filePath), csvOut, 'utf-8');
    console.log(`Wrote ${records.length} rows to ${filePath}`);
}
// -----------------------------------------------------
// 7. BENCHMARKING
// -----------------------------------------------------
function benchmarkBoth(fileOne, fileTwo) {
    console.log(`\n[Benchmark] Dataset size: FileOne=${fileOne.length}, FileTwo=${fileTwo.length}`);
    const startLinear = performance.now();
    const linearMatches = combineRowByRow(fileOne, fileTwo);
    const endLinear = performance.now();
    console.log(`Linear dictionary found ${linearMatches.length} matches in ${(endLinear - startLinear).toFixed(2)} ms`);
    const startLogLin = performance.now();
    const logLinMatches = matchByIndexDictionary(fileOne, fileTwo);
    const endLogLin = performance.now();
    console.log(`Log-Linear (BubbleSort+BinarySearch) found ${logLinMatches.length} matches in ${(endLogLin - startLogLin).toFixed(2)} ms`);
}
// -----------------------------------------------------
// 8. matchCreditCards
// -----------------------------------------------------
function matchCreditCards() {
    try {
        const fileOnePath = './carddump2.csv';
        const fileTwoPath = './carddump1.csv';
        console.log('Reading File One (sort before index assignment)...');
        const fileOneData = readCsvFileOne(fileOnePath);
        console.log('Reading File Two (no auto-sorting unless desired)...');
        const fileTwoData = readCsvFileTwo(fileTwoPath, /* doSort= */ false);
        // Option A: Combine row-by-row
        // If fileOneData and fileTwoData have the same # of rows and we want to pair i->i
        console.log('Combining row by row...');
        const mergedRowByRow = combineRowByRow(fileOneData, fileTwoData);
        writeCsvFile('mergedRowByRow.csv', mergedRowByRow);
        // Option B: Match by dictionary keyed by index (if both are assigned indexKey)
        console.log('Combining via dictionary keyed by indexKey...');
        const mergedIndexDict = matchByIndexDictionary(fileOneData, fileTwoData);
        writeCsvFile('mergedIndexDict.csv', mergedIndexDict);
        // Benchmark
        benchmarkBoth(fileOneData, fileTwoData);
        console.log('Done! Check merged CSV files.');
    }
    catch (err) {
        console.error('Error:', err);
    }
}
function linearMatching() {
    matchCreditCards();
}
