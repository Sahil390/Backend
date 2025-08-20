/*
Write a program that demonstrates error handling in 
streams. Create a Readable stream that tries to read from 
a non-existent file and handles the error by emitting an 
error event. 
*/

const fs = require('fs');

const readStream = fs.createReadStream('data2.txt',{encoding: 'utf-8'});
readStream.on('error', (err) => {
  console.error('An error occurred:', err);
});