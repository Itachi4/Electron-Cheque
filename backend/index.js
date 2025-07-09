const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');

// Log backend startup
fs.appendFileSync('backend-log.txt', 'Backend started at ' + new Date() + '\n');
console.log('=== BACKEND STARTED ===', new Date());

// Load environment variable for DB path (set by Electron)
if (!process.env.DATABASE_URL) {
  // Fallback for dev environment only
  process.env.DATABASE_URL = `file:${path.join(__dirname, 'prisma/prod.db')}`;
}
console.log("✅ Using DATABASE_URL:", process.env.DATABASE_URL);

// Load libraries (after setting env)
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const generateChequePDF = require('./generateCheque');
const { exec } = require('child_process');
const multer = require('multer');
const { extractChequeInfo } = require('./pdf-parser');

// Init Express and Prisma
const app = express();
const prisma = new PrismaClient();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// Serve static folders
app.use('/templates', express.static('templates'));
app.use('/output', express.static(path.join(__dirname, 'output')));
console.log('📂 Serving static files from:', path.join(__dirname, 'output'));

// ----------- API ROUTES ----------- //

// Login route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  res.json({ message: 'Logged in', role: user.role });
});

// Company list
app.get('/api/companies', async (req, res) => {
  const companies = await prisma.company.findMany();
  res.json(companies);
});

// Bank list
app.get('/api/banks/:companyId', async (req, res) => {
  const banks = await prisma.bank.findMany({
    where: { companyId: parseInt(req.params.companyId) },
  });
  res.json(banks);
});

// Accounts for bank (with company info)
app.get('/api/accounts/:bankId', async (req, res) => {
  const accounts = await prisma.account.findMany({
    where: { bankId: parseInt(req.params.bankId) },
    include: { bank: { include: { company: true } } },
  });
  const output = accounts.map(acc => ({
    id: acc.id,
    number: acc.number,
    lastCheck: acc.lastCheck,
    bankId: acc.bankId,
    company: acc.bank.company ? { id: acc.bank.company.id, name: acc.bank.company.name } : null
  }));
  res.json(output);
});

// Last cheque number for account
app.get('/api/last-cheque/:accountId', async (req, res) => {
  const account = await prisma.account.findUnique({
    where: { id: parseInt(req.params.accountId) }
  });
  if (!account) return res.status(404).json({ error: 'Account not found' });
  res.json({ lastCheque: account.lastCheck });
});

// Create/update cheque template
app.post('/api/templates', async (req, res) => {
  const { name, companyId, bankId, background, fieldMap } = req.body;
  const existing = await prisma.chequeTemplate.findFirst({ where: { companyId, bankId } });
  const result = existing
    ? await prisma.chequeTemplate.update({
        where: { id: existing.id },
        data: { name, background, fieldMap }
      })
    : await prisma.chequeTemplate.create({
        data: { name, companyId, bankId, background, fieldMap }
      });
  res.json(result);
});

// Get template for company+bank
app.get('/api/templates/:companyId/:bankId', async (req, res) => {
  const template = await prisma.chequeTemplate.findFirst({
    where: {
      companyId: parseInt(req.params.companyId),
      bankId: parseInt(req.params.bankId),
    }
  });
  if (!template) return res.status(404).json({ error: 'Template not found' });
  res.json(template);
});

// Generate cheque PDF (child process)
app.post('/api/generate', (req, res) => {
  const { accountId, count } = req.body;
  const command = `node printCheque.js ${count} ${accountId}`;
  exec(command, (error, stdout, stderr) => {
    if (error) return res.status(500).json({ error: 'Failed to generate cheques' });
    const lines = stdout.split('\n').filter(line => line.trim());
    const [downloadUrl, startNumber, endNumber] = lines.slice(-3);
    res.json({
      message: 'Cheques generated successfully',
      pdfPath: downloadUrl,
      startNumber: parseInt(startNumber),
      endNumber: parseInt(endNumber),
    });
  });
});

// Update last cheque number
app.patch('/api/accounts/:accountId/last-cheque', async (req, res) => {
  const { lastCheck } = req.body;
  const accountId = parseInt(req.params.accountId);
  if (typeof lastCheck !== 'number' || lastCheck < 0) {
    return res.status(400).json({ error: 'Invalid lastCheck value' });
  }
  try {
    const updatedAccount = await prisma.account.update({
      where: { id: accountId },
      data: { lastCheck },
      include: { bank: { include: { company: true } } }
    });
    res.json({
      id: updatedAccount.id,
      lastCheck: updatedAccount.lastCheck,
      company: updatedAccount.bank.company
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update' });
  }
});

// Upload cheque PDF to process later
app.post('/api/upload-cheque', upload.single('chequePdf'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const pdfBuffer = req.file.buffer;
  const chequeDetails = await extractChequeInfo(pdfBuffer);
  const pendingDir = path.join(__dirname, 'pending_cheques');
  await fsp.mkdir(pendingDir, { recursive: true });

  const filePath = path.join(pendingDir, `${Date.now()}-${req.file.originalname}`);
  await fsp.writeFile(filePath, pdfBuffer);

  const pendingCheque = await prisma.pendingCheque.create({
    data: {
      fileName: req.file.originalname,
      filePath,
      detectedCompanyName: chequeDetails.companyName
    }
  });

  res.status(201).json(pendingCheque);
});

// Get all pending cheques
app.get('/api/pending-cheques', async (req, res) => {
  const pending = await prisma.pendingCheque.findMany({
    where: { status: 'awaiting_review' },
    orderBy: { createdAt: 'desc' }
  });
  res.status(200).json(pending);
});

// Finalize and merge pending cheque
app.post('/api/process-pending-cheque', async (req, res) => {
  const { pendingChequeId, accountId } = req.body;
  try {
    const { PDFDocument } = require('pdf-lib');

    const pendingCheque = await prisma.pendingCheque.findUnique({ where: { id: pendingChequeId } });
    const accountInfo = await prisma.account.findUnique({ where: { id: accountId } });
    if (!pendingCheque || !accountInfo) throw new Error('Data not found');

    const overlayPdfPath = await generateChequePDF(accountId);
    const newChequeNumber = accountInfo.lastCheck + 1;

    const mainPdf = await PDFDocument.load(await fsp.readFile(pendingCheque.filePath));
    const overlayPdf = await PDFDocument.load(await fsp.readFile(overlayPdfPath));
    const [overlayPage] = await mainPdf.embedPdf(overlayPdf);
    mainPdf.getPages()[0].drawPage(overlayPage);

    const finalPdfPath = path.join(__dirname, 'output', `FINAL_MERGED_CHEQUE_${newChequeNumber}.pdf`);
    await fsp.writeFile(finalPdfPath, await mainPdf.save());

    await fsp.unlink(overlayPdfPath);
    await fsp.unlink(pendingCheque.filePath);

    await prisma.pendingCheque.update({
      where: { id: pendingChequeId },
      data: { status: 'processed' }
    });

    res.status(200).json({ message: 'Cheque processed', path: finalPdfPath });
  } catch (error) {
    console.error("❌ Final processing error:", error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

fs.appendFileSync('backendDB-log.txt', `Started with DB: ${process.env.DATABASE_URL} at ${new Date()}\n`);


// Start server
const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';
app.listen(port, host, () => {
  console.log(`✅ API running at http://${host}:${port}`);
});
