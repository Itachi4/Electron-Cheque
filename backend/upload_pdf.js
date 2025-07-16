const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

const filePath = process.argv[2];
if (!filePath) {
  console.error('No file path provided!');
  process.exit(1);
}

const form = new FormData();
form.append('chequePdf', fs.createReadStream(filePath), path.basename(filePath));

axios.post('http://localhost:3000/api/upload-cheque', form, {
  headers: form.getHeaders()
}).then(res => {
  console.log('✅ Uploaded:', res.data);
}).catch(err => {
  console.error('❌ Upload failed:', err.response ? err.response.data : err.message);
}); 