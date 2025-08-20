/* Write a program that uses a Readable stream to read 
data from a file (data.txt). Output the file content to the 
console. Ensure the file exists before reading, and handle 
any errors if the file is missing. */


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

