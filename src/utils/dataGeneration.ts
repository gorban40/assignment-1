export function generateRandomArray(size: number, maxValue = 10000): number[] {
    const arr: number[] = [];
    for (let i = 0; i < size; i++) {
        arr.push(Math.floor(Math.random() * maxValue));
    }
    return arr;
}

interface CardRecord {
    cardNumber: string;
    expirationDate: string;
    pin: string;
}

function randomCardNumber(): string {
    // 16-digit random card number
    let num = '';
    for (let i = 0; i < 16; i++) {
        num += Math.floor(Math.random() * 10).toString();
    }
    return num;
}

function randomExpirationDate(): string {
    // Format: MM/YY
    const month = Math.floor(Math.random() * 12) + 1;
    const year = Math.floor(Math.random() * 10) + 23; // e.g., 23 -> 2030
    return `${month.toString().padStart(2, '0')}/${year.toString().padStart(2, '0')}`;
}

function randomPin(): string {
    // 4-digit pin
    let pin = '';
    for (let i = 0; i < 4; i++) {
        pin += Math.floor(Math.random() * 10).toString();
    }
    return pin;
}

export function generateCardData(size: number): CardRecord[] {
    const data: CardRecord[] = [];
    for (let i = 0; i < size; i++) {
        data.push({
            cardNumber: randomCardNumber(),
            expirationDate: randomExpirationDate(),
            pin: randomPin(),
        });
    }
    return data;
}
