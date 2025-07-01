// backend/import-data.js
const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

async function importData() {
  console.log('🚀 Reading from data-dump.json and writing to SQLite...');
  try {
    const dataPath = path.join(__dirname, 'data-dump.json');
    const dataDump = JSON.parse(await fs.readFile(dataPath, 'utf-8'));

    console.log('Importing data...');
    await prisma.company.createMany({ data: dataDump.companies });
    console.log('✅ Companies imported.');
    await prisma.bank.createMany({ data: dataDump.banks });
    console.log('✅ Banks imported.');
    await prisma.account.createMany({ data: dataDump.accounts });
    console.log('✅ Accounts imported.');
    for (const template of dataDump.chequeTemplates) {
      await prisma.chequeTemplate.create({ data: { ...template, fieldMap: template.fieldMap } });
    }
    console.log('✅ Cheque Templates imported.');

    console.log('🎉 Data import completed successfully! Your prod.db file is ready.');

  } catch (error) {
    console.error('❌ Error importing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importData();