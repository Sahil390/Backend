
const fs = require('fs');
const { Transform } = require('stream');

const bufferStream = new Transform({
    transform(chunk, encoding, callback) {
        const modified = 'Changed: ' + chunk.toString();
        callback(null, modified);
    }
});
const output = fs.createWriteStream('output.txt');
const input = fs.createReadStream('input.txt')

input.pipe(bufferStream).pipe(output);

output.on('finish', () => {
    console.log('Pipeline finished. Check output.txt for results.');
});
