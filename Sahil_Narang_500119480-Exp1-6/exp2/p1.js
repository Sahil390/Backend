const fs = require('fs');

let co = '';
const readStream = fs.createReadStream('data.txt',{encoding: 'utf-8'});
readStream.on('data',(chunk) => {
    co += chunk;
});

readStream.on('error', (err) => {
  console.error('An error occurred:', err);
});
readStream.on('end', () => {
    console.log(co);
});

