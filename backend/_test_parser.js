// backend/_test_parser.js

const fs = require('fs');
const path = require('path');
const { extractChequeInfo } = require('./pdf-parser');

// This is the main function for our test.
async function runTest() {
  console.log('🧪 Starting parser test...');

  try {
    // Define the path to your sample PDF.
    // IMPORTANT: Make sure the "SunSpin Test 1.pdf" file is inside your 'backend' folder for this test.
    const pdfPath = path.join(__dirname, 'SunSpin Test 1.pdf');

    // Check if the file exists before trying to read it.
    if (!fs.existsSync(pdfPath)) {
      console.error(`❌ Test Error: The file was not found at ${pdfPath}`);
      console.error('Please copy "SunSpin Test 1.pdf" into the "backend" directory to run this test.');
      return;
    }

    // Read the PDF file into a buffer, simulating the upload.
    const pdfBuffer = fs.readFileSync(pdfPath);
    const fileName = path.basename(pdfPath);

    // Call our new function with the test data.
    const extractedData = await extractChequeInfo(pdfBuffer, fileName);

    // Print the results to see if they are correct.
    console.log('✅ Parser test complete. Extracted Data:');
    console.log(extractedData);

    // --- Validation ---
    console.log('\n🔍 Validating results...');
    if (extractedData.companyName === 'SunSpin Media, LLC') {
      console.log('  -> Company Name: OK');
    } else {
      console.error(`  -> Company Name: FAIL (Expected "SunSpin Media, LLC", got "${extractedData.companyName}")`);
    }
    if (extractedData.amount === '10.00') {
      console.log('  -> Amount: OK');
    } else {
      console.error(`  -> Amount: FAIL (Expected "10.00", got "${extractedData.amount}")`);
    }

  } catch (error) {
    console.error('🔥 An error occurred during the test:', error);
  }
}

// Run the test function.
runTest();