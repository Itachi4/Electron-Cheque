// Load environment variables (like DB connection)
require('dotenv').config();

// Import required libraries
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const generateChequePDF = require('./generateCheque');
const { exec } = require('child_process'); // Import child_process
const multer = require('multer');
const { extractChequeInfo } = require('./pdf-parser');
const { generateFinalCheque } = require('./generateCheque');

// Create app and Prisma instance
const app = express();
const prisma = new PrismaClient();
const fs = require('fs').promises;
const path = require('path');

app.use(cors());
app.use(express.json()); // Allow JSON in requests

// Serve static template files
app.use('/templates', express.static('templates'));
// Serve static generated PDF files
app.use('/output', express.static('output'));

const upload = multer({ storage: multer.memoryStorage() });
//  login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(`Login attempt: Email=${email}, Password=${password}`); // Log received credentials
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log('Login failed: User not found.');
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  if (user.password !== password) {
    console.log('Login failed: Incorrect password.');
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  console.log(`Login successful for user: ${user.email}`); // Log successful login
  res.json({ message: 'Logged in', role: user.role });
});

// Get list of companies
app.get('/api/companies', async (req, res) => {
  const companies = await prisma.company.findMany();
  res.json(companies);
});

// Get banks for a company
app.get('/api/banks/:companyId', async (req, res) => {
  const { companyId } = req.params;
  const banks = await prisma.bank.findMany({
    where: { companyId: parseInt(companyId) },
  });
  res.json(banks);
});

// Get accounts for a bank
app.get('/api/accounts/:bankId', async (req, res) => {
  const { bankId } = req.params;
  const accounts = await prisma.account.findMany({
    where: { bankId: parseInt(bankId) },
    include: {
      bank: {
        include: { company: true }
      }
    }
  });
  // Map to include company name at the top level for each account
  const accountsWithCompany = accounts.map(acc => ({
    id: acc.id,
    number: acc.number,
    lastCheck: acc.lastCheck,
    bankId: acc.bankId,
    company: acc.bank.company ? { id: acc.bank.company.id, name: acc.bank.company.name } : null
  }));
  res.json(accountsWithCompany);
});

// Get last printed cheque number
app.get('/api/last-cheque/:accountId', async (req, res) => {
  const { accountId } = req.params;
  const account = await prisma.account.findUnique({
    where: { id: parseInt(accountId) },
  });
  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }
  res.json({ lastCheque: account.lastCheck });
});

app.post('/api/templates', async (req, res) => {
    const { name, companyId, bankId, background, fieldMap } = req.body;
    const existing = await prisma.chequeTemplate.findFirst({
      where: { companyId, bankId }
    });
  
    if (existing) {
      const updated = await prisma.chequeTemplate.update({
        where: { id: existing.id },
        data: { name, background, fieldMap },
      });
      return res.json(updated);
    } else {
      const created = await prisma.chequeTemplate.create({
        data: { name, companyId, bankId, background, fieldMap },
      });
      return res.json(created);
    }
  });
  
  app.get('/api/templates/:companyId/:bankId', async (req, res) => {
    const { companyId, bankId } = req.params;
    const template = await prisma.chequeTemplate.findFirst({
      where: {
        companyId: parseInt(companyId),
        bankId: parseInt(bankId),
      },
    });
    if (!template) return res.status(404).json({ error: 'Template not found' });
    res.json(template);
  });

// Generate cheques in batches
app.post('/api/generate', (req, res) => {
  try {
    const { accountId, count } = req.body;

    // Execute printCheque.js as a child process
    const command = `node printCheque.js ${count} ${accountId}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return res.status(500).json({ error: 'Failed to generate cheques' });
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }

      const lines = stdout.split('\n').filter(line => line.trim() !== ''); // Filter out empty lines
      const downloadUrl = lines[lines.length - 3]; // Get the third to last line (the URL)
      const startNumber = parseInt(lines[lines.length - 2]); // Get the second to last line (start number)
      const endNumber = parseInt(lines[lines.length - 1]); // Get the last line (end number)

      console.log(`Received from printCheque.js: URL=${downloadUrl}, Start=${startNumber}, End=${endNumber}`);

      res.json({
        message: 'Cheques generated successfully',
        pdfPath: downloadUrl,
        startNumber: startNumber,
        endNumber: endNumber
      });
    });

  } catch (error) {
    console.error('Error generating cheques:', error);
    res.status(500).json({ error: 'Failed to generate cheques' });
  }
});

// Update last cheque number for an account
app.patch('/api/accounts/:accountId/last-cheque', async (req, res) => {
  const { accountId } = req.params;
  const { lastCheck } = req.body;
  if (typeof lastCheck !== 'number' || lastCheck < 0) {
    return res.status(400).json({ error: 'Invalid lastCheck value' });
  }
  try {
    const updatedAccount = await prisma.account.update({
      where: { id: parseInt(accountId) },
      data: { lastCheck },
      include: {
        bank: {
          include: { company: true }
        }
      }
    });
    res.json({
      id: updatedAccount.id,
      lastCheck: updatedAccount.lastCheck,
      company: updatedAccount.bank.company
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update last cheque number' });
  }
});

// Start the server
// Start the server
const port = process.env.PORT || 3000; // Use environment variable or default to 3000
const host = process.env.HOST || '0.0.0.0'; // Use environment variable or default to 0.0.0.0

//new code start
// =================================================================
// THE NEW CHEQUE PROCESSING ENDPOINT
// =================================================================
// This route listens for a POST request at /api/upload-cheque.
// 'upload.single('chequePdf')' is the middleware that catches the file.
// 'chequePdf' MUST match the name we used in the C# code.
app.post('/api/upload-cheque', upload.single('chequePdf'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: 'Error: No PDF file was uploaded.' });
  }

  console.log(`📄 Received file: ${req.file.originalname}. Parsing and placing in queue.`);

  try {
    const pdfBuffer = req.file.buffer;

    // --- PARSE IMMEDIATELY ---
    const chequeDetails = await extractChequeInfo(pdfBuffer);
    console.log(`✅ Parsed Details: Company is "${chequeDetails.companyName}"`);

    const pendingDir = path.join(__dirname, 'pending_cheques');
    await fs.mkdir(pendingDir, { recursive: true });

    const uniqueFileName = `${Date.now()}-${req.file.originalname}`;
    const filePath = path.join(pendingDir, uniqueFileName);

    await fs.writeFile(filePath, req.file.buffer);

    // --- SAVE THE DETECTED NAME TO THE DATABASE ---
    const pendingCheque = await prisma.pendingCheque.create({
      data: {
        fileName: req.file.originalname,
        filePath: filePath,
        detectedCompanyName: chequeDetails.companyName // Save the result of the parse
      },
    });

    console.log(`✅ File saved to pending queue. DB record ID: ${pendingCheque.id}`);
    res.status(201).json(pendingCheque);

  } catch (error) {
    console.error("❌ Error saving pending cheque:", error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// NEW Endpoint to get all cheques awaiting review
app.get('/api/pending-cheques', async (req, res) => {
  try {
    const pending = await prisma.pendingCheque.findMany({
      where: { status: 'awaiting_review' },
      orderBy: { createdAt: 'desc' }, // Show the newest first
    });
    res.status(200).json(pending);
  } catch (error) {
    console.error("❌ Error fetching pending cheques:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// NEW Endpoint to process a specific pending cheque
app.post('/api/process-pending-cheque', async (req, res) => {
 // backend/index.js

// ... inside the app.post('/api/process-pending-cheque', ... ) endpoint

try {
  const { PDFDocument } = require('pdf-lib');
  const { pendingChequeId, accountId } = req.body;
    // 1. Fetch the pending cheque record and account info from DB (no change here)
    const pendingCheque = await prisma.pendingCheque.findUnique({ where: { id: pendingChequeId } });
    const accountInfo = await prisma.account.findUnique({ where: { id: accountId } });
    
    if (!pendingCheque || !accountInfo) {
      throw new Error('Pending cheque or account not found.');
    }
    
    // --- THIS IS THE NEW WORKFLOW USING YOUR EXACT FILES ---

    // Step A: Call your generateChequePDF function to create the temporary overlay PDF.
    // This function will create a file like 'output/cheque_1116.pdf' and return its path.
    // It will also correctly increment the 'lastCheck' number in the database.
    console.log(`STEP A: Calling generateChequePDF for account ${accountId} to create overlay...`);
    const overlayPdfPath = await generateChequePDF(accountId);
    const newChequeNumber = accountInfo.lastCheck + 1; // Get the number that was just used

    // Step B: Load the original QuickBooks PDF from the pending folder
    console.log(`STEP B: Loading original QB PDF from ${pendingCheque.filePath}`);
    const originalPdfBuffer = await fs.readFile(pendingCheque.filePath);
    const mainPdf = await PDFDocument.load(originalPdfBuffer);

    // Step C: Load the newly created overlay PDF
    console.log(`STEP C: Loading the overlay PDF from ${overlayPdfPath}`);
    const overlayPdfBuffer = await fs.readFile(overlayPdfPath);
    const overlayPdf = await PDFDocument.load(overlayPdfBuffer);

    // Step D: Embed the overlay page onto the main PDF
    console.log('STEP D: Stamping the overlay onto the QB PDF...');
    const [overlayPage] = await mainPdf.embedPdf(overlayPdf);
    mainPdf.getPages()[0].drawPage(overlayPage); // Stamp it on the first page

    // Step E: Save the final, merged document
    const outputDir = path.join(__dirname, 'output');
    const finalPdfPath = path.join(outputDir, `FINAL_MERGED_CHEQUE_${newChequeNumber}.pdf`);
    const finalPdfBytes = await mainPdf.save();
    await fs.writeFile(finalPdfPath, finalPdfBytes);
    
    // Step F: Clean up temporary and pending files
    console.log('STEP F: Cleaning up temporary files...');
    await fs.unlink(overlayPdfPath); // Delete the temporary overlay file
    await fs.unlink(pendingCheque.filePath); // Delete the original pending file

    // Step G: Mark the pending cheque as processed in the database
    await prisma.pendingCheque.update({
        where: { id: pendingChequeId },
        data: { status: 'processed' },
    });

    console.log(`✅ Workflow complete! Final cheque saved to: ${finalPdfPath}`);
    res.status(200).json({ message: 'Cheque processed and merged successfully!', path: finalPdfPath });

} catch (error) {
    console.error("❌ Error during final processing:", error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
}
});
//new code end 

app.listen(port, host, () => { // Pass both port and host
  console.log(`✅ API server running at http://${host}:${port}`);
  if (host === '0.0.0.0') {
    console.log(`   Accessible from other PCs via http://90.0.0.6:${port}`);
  }
});
