/* 
Write a program that demonstrates stream piping. 
Use a Readable stream to read data from a file (input.txt), 
and pipe it to a Writable stream that writes to another file 
(output.txt)
*/

const fs = require("fs");

const readStream = fs.createReadStream('input.txt');
const writeStream = fs.createWriteStream('output.txt');
readStream.pipe(writeStream);