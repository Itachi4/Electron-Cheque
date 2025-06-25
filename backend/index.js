// Load environment variables (like DB connection)
require('dotenv').config();

// Import required libraries
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const generateChequePDF = require('./generateCheque');
const { exec } = require('child_process'); // Import child_process

// Create app and Prisma instance
const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json()); // Allow JSON in requests

// Serve static template files
app.use('/templates', express.static('templates'));
// Serve static generated PDF files
app.use('/output', express.static('output'));

// Dummy login
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

app.listen(port, host, () => { // Pass both port and host
  console.log(`✅ API server running at http://${host}:${port}`);
  if (host === '0.0.0.0') {
    console.log(`   Accessible from other PCs via http://90.0.0.6:${port}`);
  }
});
