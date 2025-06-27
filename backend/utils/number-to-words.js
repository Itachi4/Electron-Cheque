// backend/utils/number-to-words.js

// A simplified function to convert a number to words for the cheque.
function numberToWords(num) {
    const a = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    const g = ['', 'thousand', 'million', 'billion', 'trillion'];

    const toWords = (n) => {
        if (n < 20) return a[n];
        let rem = n % 10;
        return b[Math.floor(n / 10)] + (rem ? '-' + a[rem] : '');
    };

    const numStr = num.toString();
    const [integerPart, decimalPart] = numStr.split('.');
    const integer = parseInt(integerPart, 10);

    if (integer === 0) return 'zero';

    let words = '';
    let i = 0;

    let n = integer;
    while (n > 0) {
        let chunk = n % 1000;
        if (chunk) {
            let chunkWords = '';
            if (chunk >= 100) {
                chunkWords += a[Math.floor(chunk / 100)] + ' hundred';
                chunk %= 100;
                if (chunk) chunkWords += ' ';
            }
            if (chunk) {
                chunkWords += toWords(chunk);
            }
            words = chunkWords + ' ' + g[i] + ' ' + words;
        }
        n = Math.floor(n / 1000);
        i++;
    }

    words = words.trim().replace(/\s+/g, ' ');
    const decimalText = decimalPart ? ` and ${decimalPart.padEnd(2, '0')}/100` : ' and 00/100';
    return words.charAt(0).toUpperCase() + words.slice(1) + decimalText;
}

module.exports = { numberToWords };