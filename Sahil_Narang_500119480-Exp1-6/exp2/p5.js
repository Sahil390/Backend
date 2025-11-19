const fs = require('fs');

const readStream = fs.createReadStream('data2.txt',{encoding: 'utf-8'});
readStream.on('error', (err) => {
  console.error('An error occurred:', err);
});