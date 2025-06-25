// const generateChequePDF = require('./generateCheque');

// (async () => {
//   try {
//     await generateChequePDF(1, {}); // const generateChequePDF = require('./generateCheque');

//     (async () => {
//       try {
//         await generateChequePDF(2); // Replace with your actual account ID
//       } catch (err) {
//         console.error('❌ Error:', err);
//       }
//     })();
//     accountId = 2
//     console.log('✅ Done');
//   } catch (err) {
//     console.error('❌ Error:', err);
//   }
// })();

//---------------------------------------------------------------------------------------------------//

// const { PDFDocument } = require('pdf-lib');
// const fs = require('fs');
// const path = require('path');
// const generateChequePDF = require('./generateCheque');
// const prisma = require('@prisma/client').PrismaClient;

// const db = new prisma();

// const args = process.argv.slice(2);
// const numToPrint = parseInt(args[0], 10) || 1;
// const accountId = 3;

// (async () => {
//   const outputPaths = [];

//   // Print cheques and collect file paths
//   for (let i = 0; i < numToPrint; i++) {
//     console.log(`🖨️ Printing cheque ${i + 1} of ${numToPrint}`);
//     const outputPath = await generateChequePDF(accountId, true); // Pass flag for "returnPath"
//     outputPaths.push(outputPath);
//   }

//   // Combine PDFs into one
//   const combinedPdf = await PDFDocument.create();
//   for (const file of outputPaths) {
//     const bytes = fs.readFileSync(file);
//     const src = await PDFDocument.load(bytes);
//     const copiedPages = await combinedPdf.copyPages(src, [0]);
//     copiedPages.forEach(p => combinedPdf.addPage(p));
//   }

//   // Name file using start/end cheque numbers
//   const startNum = path.basename(outputPaths[0]).match(/\d+/)[0];
//   const endNum = path.basename(outputPaths[outputPaths.length - 1]).match(/\d+/)[0];
//   const finalPath = path.join(__dirname, 'output', `cheques_batch_${startNum}_to_${endNum}.pdf`);
//   fs.writeFileSync(finalPath, await combinedPdf.save());

//   console.log(`✅ Combined batch saved → ${finalPath}`);
// })();

const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const generateChequePDF = require('./generateCheque');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const args = process.argv.slice(2);
const numToPrint = parseInt(args[0], 10) || 1;
const accountId = parseInt(args[1], 10); // Use the second command-line argument

(async () => {
  const outputPaths = [];

  // Step 1: Get the company name for the account
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    include: {
      bank: {
        include: { company: true }
      }
    }
  });

  if (!account || !account.bank || !account.bank.company) {
    console.error("❌ Could not find company for this account");
    process.exit(1);
  }

  const companyName = account.bank.company.name.replace(/\s+/g, '_');

  // Step 2: Generate all cheques and collect file paths
  for (let i = 0; i < numToPrint; i++) {
    console.log(`🖨️ Printing cheque ${i + 1} of ${numToPrint}`);
    const outputPath = await generateChequePDF(accountId, true); // true → return output path
    outputPaths.push(outputPath);
  }

  // Step 3: Merge PDFs into one
  const combinedPdf = await PDFDocument.create();

  for (const file of outputPaths) {
    const bytes = fs.readFileSync(file);
    const src = await PDFDocument.load(bytes);
    const pages = await combinedPdf.copyPages(src, [0]);
    pages.forEach(p => combinedPdf.addPage(p));
    fs.unlinkSync(file); // Delete the temporary individual cheque PDF file

  }

  // Step 4: Extract cheque numbers from filenames
  const getChequeNum = filename => filename.match(/\d+/)[0];
  const startNum = getChequeNum(path.basename(outputPaths[0]));
  const endNum = getChequeNum(path.basename(outputPaths[outputPaths.length - 1]));

  // Step 5: Save final merged file
  const finalFilename = `${companyName}_${startNum}_to_${endNum}.pdf`;
  const finalPath = path.join(__dirname, 'output', finalFilename);
  fs.writeFileSync(finalPath, await combinedPdf.save());

  const downloadUrl = `http://localhost:3000/output/${finalFilename}`;
  console.log(`✅ Combined batch saved → ${downloadUrl}`);
  // IMPORTANT: Print the values needed by the calling process (index.js) on separate lines
  console.log(downloadUrl);
  console.log(startNum);
  console.log(endNum);
})();

