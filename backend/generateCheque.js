// const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
// const fs = require('fs');
// const path = require('path');
// const fontkit = require('@pdf-lib/fontkit');
// const { PrismaClient } = require('@prisma/client');

// const prisma = new PrismaClient();

// async function generateChequePDF(accountId, returnPathOnly = false) {
//     const templatePath = path.join(__dirname, 'templates', 'Sample Template - blank MYB 10021-10030.pdf');
//   const pdfDoc = await PDFDocument.load(fs.readFileSync(templatePath));
//   pdfDoc.registerFontkit(fontkit);

//   const page = pdfDoc.getPages()[0];

//   const micrFontBytes = fs.readFileSync(path.join(__dirname, 'fonts', 'micr.ttf'));
//   const micrFont = await pdfDoc.embedFont(micrFontBytes);
//   const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

//   // Fetch account
//   const account = await prisma.account.findUnique({ where: { id: accountId } });
//   if (!account) throw new Error(`Account ${accountId} not found.`);

//   const chequeNumber = account.lastCheck + 1;
//   const chequeStr = chequeNumber.toString().padStart(5, '0');
//   const micrLine = `C${chequeStr}C A022000046A 9891423205C`;

//   console.log(`🧾 Printing cheque #${chequeStr}`);
//   console.log(`🔢 MICR line: ${micrLine}`);

//   // Use white for erase fill
//   const eraseColor = rgb(1, 1, 1);

//   // === 1. ERASE: MICR, top-right, bottom-right
//   page.drawRectangle({ x: 130, y: 555, width: 300, height: 20, color: eraseColor });  // MICR
//   page.drawRectangle({ x: 550, y: 766, width: 50, height: 20, color: eraseColor });   // Top-right
//   page.drawRectangle({ x: 530, y: 510, width: 50, height: 20, color: eraseColor });   // Bottom-right
//   // 🧼 Erase bottom-most cheque number (last instance)
  
//   const debugColor = rgb(1, 0, 0); // RED for debug (replace with rgb(1,1,1) later)

// page.drawRectangle({
//     x: 525,
//     y: 10,        // adjust if needed
//     width: 50,
//     height: 20,
//     color: eraseColor  // use red until confirmed
//   });
  

//   // === 2. REDRAW: dynamic values at exact erase positions
//   page.drawText(micrLine, {
//     x: 150,
//     y: 555,
//     font: micrFont,
//     size: 17,
//     color: rgb(0, 0, 0),
//   });

//   page.drawText(chequeStr, {
//     x: 550,
//     y: 766,
//     font: helveticaFont,
//     size: 12,
//     color: rgb(0, 0, 0),
//   });

//   page.drawText(chequeStr, {
//     x: 530,
//     y: 510,
//     font: helveticaFont,
//     size: 12,
//     color: rgb(0, 0, 0),
//   });

//   page.drawText(chequeStr, {
//     x: 515,
//     y: 43,        // match erase zone
//     font: helveticaFont,
//     size: 12,
//     color: rgb(0, 0, 0)
//   });
  

//   // === 3. Save + update
//   const outputPath = path.join(__dirname, 'output', `cheque_${chequeStr}.pdf`);
//   fs.writeFileSync(outputPath, await pdfDoc.save());
//   console.log(`✅ Saved → ${outputPath}`);

//   await prisma.account.update({
//     where: { id: accountId },
//     data: { lastCheck: chequeNumber },
//   });
//   return outputPath;

// }
// module.exports = generateChequePDF;

// --------------------------------------------------------------//

// const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
// const fs = require('fs');
// const path = require('path');
// const fontkit = require('@pdf-lib/fontkit');

// async function generateChequePDF() {
//   const templatePath = path.join(__dirname, 'templates', 'blank_hawk_mtb.pdf');
//   const pdfDoc = await PDFDocument.load(fs.readFileSync(templatePath));
//   pdfDoc.registerFontkit(fontkit);

//   const page = pdfDoc.getPages()[0];

//   const micrFontBytes = fs.readFileSync(path.join(__dirname, 'fonts', 'micr.ttf'));
//   const micrFont = await pdfDoc.embedFont(micrFontBytes);
//   const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

//   // Simulated cheque number for Hawk Properties
//   const chequeNumber = 5267;
//   const chequeStr = chequeNumber.toString().padStart(5, '0');
//   const micrLine = `C${chequeStr}C A022000046A 9838634997C`;  // Replace account if needed

//   console.log(`🧾 Rendering cheque #${chequeStr}`);
//   console.log(`🔢 MICR line: ${micrLine}`);

//   // === ERASE ZONES for testing ===
//   const debugColor = rgb(1, 0, 0); // RED BOXES for alignment

//   page.drawRectangle({ x: 130, y: 554, width: 300, height: 20, color: debugColor });  // MICR line area
//   page.drawRectangle({ x: 550, y: 765, width: 50, height: 20, color: debugColor });   // Top-right
//   page.drawRectangle({ x: 529, y: 509, width: 50, height: 20, color: debugColor });   // Bottom-right
//   page.drawRectangle({ x: 515, y: 14,  width: 50, height: 20, color: debugColor });   // Far bottom-right

//   // === Draw Fields (overlay text) ===
//   page.drawText(micrLine, {
//     x: 130,
//     y: 554,
//     font: micrFont,
//     size: 17,
//     color: rgb(0, 0, 0),
//   });

//   page.drawText(chequeStr, {
//     x: 550,
//     y: 766,
//     font: helveticaFont,
//     size: 12,
//     color: rgb(0, 0, 0),
//   });

//   page.drawText(chequeStr, {
//     x: 530,
//     y: 510,
//     font: helveticaFont,
//     size: 12,
//     color: rgb(0, 0, 0),
//   });

//   page.drawText(chequeStr, {
//     x: 515,
//     y: 14,
//     font: helveticaFont,
//     size: 12,
//     color: rgb(0, 0, 0),
//   });

//   // === Save as debug file ===
//   const outputPath = path.join(__dirname, 'output', `hawk_debug_cheque_${chequeStr}.pdf`);
//   fs.writeFileSync(outputPath, await pdfDoc.save());
//   console.log(`✅ Saved debug PDF → ${outputPath}`);
// }

// generateChequePDF();

// const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
// const fs = require('fs');
// const path = require('path');
// const fontkit = require('@pdf-lib/fontkit');
// const { PrismaClient } = require('@prisma/client');

// const prisma = new PrismaClient();

// async function generateChequePDF(accountId) {
//   // === 1. Fetch account, bank, template ===
//   const account = await prisma.account.findUnique({
//     where: { id: accountId },
//     include: {
//       bank: {
//         include: {
//           template: true,
//         },
//       },
//     },
//   });

//   if (!account) throw new Error(`❌ Account ${accountId} not found`);
//   if (!account.bank || !account.bank.template) throw new Error(`❌ No template found for bank ${account.bankId}`);

//   const template = account.bank.template;
//   const chequeNumber = account.lastCheck + 1;
//   const chequeStr = chequeNumber.toString().padStart(5, '0');
//   const micrLine = `C${chequeStr}C A022000046A ${account.number}C`;

//   console.log(`🧾 Printing cheque #${chequeStr}`);
//   console.log(`🔢 MICR line: ${micrLine}`);

//   // === 2. Load PDF + Fonts ===
//   const templatePath = path.join(__dirname, 'templates', path.basename(template.background));
//   const pdfDoc = await PDFDocument.load(fs.readFileSync(templatePath));
//   pdfDoc.registerFontkit(fontkit);

//   const micrFontBytes = fs.readFileSync(path.join(__dirname, 'fonts', 'micr.ttf'));
//   const micrFont = await pdfDoc.embedFont(micrFontBytes);
//   const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

//   const page = pdfDoc.getPages()[0];
//   const fieldMap = template.fieldMap;

//   const eraseColor = rgb(1, 1, 1); // white

//   // === 3. Erase and Draw ===
//   const drawField = (fieldName, value, font, size) => {
//     const pos = fieldMap[fieldName];
//     if (!pos) return;
//     page.drawRectangle({ x: pos.x, y: pos.y, width: 50, height: 20, color: eraseColor });
//     page.drawText(value, {
//       x: pos.x,
//       y: pos.y + 2,
//       font,
//       size: size || pos.fontSize || 12,
//       color: rgb(0, 0, 0),
//     });
//   };

//   drawField('chequeNumberTopRight', chequeStr, helveticaFont, 12);
//   drawField('chequeNumberBottomRight', chequeStr, helveticaFont, 12);
//   drawField('chequeNumberBottomMost', chequeStr, helveticaFont, 12);
//   drawField('micr', micrLine, micrFont, 17);

//   // === 4. Save PDF + Update DB ===
//   const outputPath = path.join(__dirname, 'output', `cheque_${chequeStr}.pdf`);
//   fs.writeFileSync(outputPath, await pdfDoc.save());
//   console.log(`✅ Saved to ${outputPath}`);

//   await prisma.account.update({
//     where: { id: accountId },
//     data: { lastCheck: chequeNumber },
//   });

//   return outputPath;
// }

// module.exports = generateChequePDF;

//-------------------------------------------------------------------NEW CODE//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const fontkit = require('@pdf-lib/fontkit');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function generateChequePDF(accountId) {
  // === 1. Fetch account, bank, template ===
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    include: {
      bank: {
        include: {
          template: true,
        },
      },
    },
  });

  console.log('DEBUG: Account used for cheque generation:', JSON.stringify(account, null, 2));
  if (account && account.bank) {
    console.log('DEBUG: Bank:', JSON.stringify(account.bank, null, 2));
    if (account.bank.template) {
      console.log('DEBUG: Template:', JSON.stringify(account.bank.template, null, 2));
    } else {
      console.log('DEBUG: No template found for this bank.');
    }
  } else {
    console.log('DEBUG: No bank found for this account.');
  }

  if (!account) throw new Error(`❌ Account ${accountId} not found`);
  if (!account.bank || !account.bank.template) throw new Error(`❌ No template found for bank ${account.bankId}`);

  const template = account.bank.template;
  const chequeNumber = account.lastCheck + 1;
  // const chequeStr = chequeNumber.toString().padStart(5, '00');
  const chequeStr = chequeNumber.toString().padStart(0);
  const routingNumber = account.bank.routingNumber; // new line for routing number
  // const micrLine = `C00${chequeStr}C A022000046A    ${account.number}C`;
  let micrLine;
  if (account.bank.name === 'Alden') { 
    const acctNum = account.number;
    const group1 = acctNum.slice(0, 3);
    const group2 = acctNum.slice(3, 6);
    const group3 = acctNum.slice(6);
    micrLine = `C00${chequeStr}C A0${routingNumber}A    ${group1}D${group2}D${group3}C`;

   }else{
   micrLine = `C00${chequeStr}C A${routingNumber}A ${account.number}C`;
  }


  console.log(`🧾 Printing cheque #${chequeStr}`);
  console.log(`🔢 MICR line: ${micrLine}`);

  const templatePath = path.join(__dirname, 'templates', path.basename(template.background));
  const pdfDoc = await PDFDocument.load(fs.readFileSync(templatePath));
  pdfDoc.registerFontkit(fontkit);

  const micrFontBytes = fs.readFileSync(path.join(__dirname, 'fonts', 'micr.ttf'));
  const micrFont = await pdfDoc.embedFont(micrFontBytes);
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const page = pdfDoc.getPages()[0];
  const fieldMap = template.fieldMap;

  const eraseColor = rgb(1, 1, 1); // white
  // const eraseColor = rgb(1,0,0); // red


  const drawField = (fieldName, value, font, sizeOverride = null) => {
    const pos = fieldMap[fieldName];
    if (!pos) return;
    page.drawRectangle({
      x: pos.x,
      y: pos.y,
      width: pos.width || 50,
      height: pos.height || 20,
      color: eraseColor,
    });
    page.drawText(value, {
      x: pos.x,
      y: pos.y + 2,
      font,
      size: sizeOverride || pos.fontSize || 20,
      color: rgb(0, 0, 0),
    });
  };

  // Draw only once using DB-coordinates
  drawField('chequeNumberTopRight', chequeStr, helveticaFont);
  drawField('chequeNumberBottomRight', chequeStr, helveticaFont);
  drawField('chequeNumberBottomMost', chequeStr, helveticaFont);
  drawField('micr', micrLine, micrFont);
  console.log("MICR line:", JSON.stringify(micrLine));


  const outputPath = path.join(__dirname, 'output', `cheque_${chequeStr}.pdf`);
  fs.writeFileSync(outputPath, await pdfDoc.save());
  console.log(`✅ Saved to ${outputPath}`);

  await prisma.account.update({
    where: { id: accountId },
    data: { lastCheck: chequeNumber },
  });

  // Return the local path for the generated PDF
  return outputPath;
}

module.exports = generateChequePDF;