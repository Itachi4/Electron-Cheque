const fs = require('fs');
fs.appendFileSync('test-electron-log.txt', 'Test script started at ' + new Date() + '\n');
console.log('Test script ran!'); 