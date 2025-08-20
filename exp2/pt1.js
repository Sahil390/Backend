const fs = require('fs');
const writer = fs.createWriteStream('output.txt');

process.stdin.on('data',(data) => {
    writer.write(data);
});
process.stdin.on('end', () => {
    writer.end();
});
    
writer.on('finish', () =>
{
    console.log("success!");
});
    