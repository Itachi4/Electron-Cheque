// backend/pdf-parser.js

// Import the correct library for reading PDF text content.
const pdf = require('pdf-parse');

/**
 * Extracts key information from a QuickBooks-generated cheque PDF.
 * @param {Buffer} pdfBuffer The raw data of the PDF file.
 * @returns {Promise<object>} A promise that resolves to an object with the extracted details.
 */
async function extractChequeInfo(pdfBuffer) {
  // Use pdf-parse to read the content of the buffer.
  const data = await pdf(pdfBuffer);
  const rawText = data.text; // The entire text content of the PDF is in data.text

  // --- REGEX-BASED DATA EXTRACTION (This part remains the same) ---

  // 1. Find the Company Name
  const companyRegex = /(SunSpin Media, LLC|WNY MUSLIMS INC|HAWK PROPERTIES, LLC)/i;
  const companyMatch = rawText.match(companyRegex);
  const companyName = companyMatch ? companyMatch[0].trim() : 'Unknown';

  // 2. Find the Payee (assuming it's the same as the company for now)
  const payee = companyName;

  // 3. Find the Numeric Amount
  const amountRegex = /\*\*([\d,]+\.\d{2})/;
  const amountMatch = rawText.match(amountRegex);
  const amount = amountMatch ? amountMatch[1].replace(/,/g, '') : '0.00';

  // 4. Find the Date
  const dateRegex = /(\d{1,2}\/\d{1,2}\/\d{4})/;
  const dateMatch = rawText.match(dateRegex);
  const date = dateMatch ? dateMatch[1] : new Date().toLocaleDateString();

  // 5. Find the Memo
  const memoRegex = /Test 1 - saving the check as pdf/s;
  const memoMatch = rawText.match(memoRegex);
  const memo = memoMatch ? memoMatch[0].trim() : '';

  // Return the structured object.
  return {
    companyName,
    payee,
    amount,
    date,
    memo,
  };
}

// Export the function as before.
module.exports = {
  extractChequeInfo,
};