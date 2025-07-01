// backend/export-data.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

async function exportData() {
  console.log('🚀 Reading all data from PostgreSQL...');
  try {
    const companies = await prisma.company.findMany();
    const banks = await prisma.bank.findMany();
    const accounts = await prisma.account.findMany();
    const chequeTemplates = await prisma.chequeTemplate.findMany();

    const dataDump = {
      companies,
      banks,
      accounts,
      chequeTemplates,
    };

    const outputPath = path.join(__dirname, 'data-dump.json');
    await fs.writeFile(outputPath, JSON.stringify(dataDump, null, 2));

    console.log(`✅ Successfully saved all data to data-dump.json`);
    console.log(`Found ${companies.length} companies, ${banks.length} banks, ${accounts.length} accounts, and ${chequeTemplates.length} templates.`);

  } catch (error) {
    console.error('❌ Error exporting data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();