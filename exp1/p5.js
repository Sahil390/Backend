const fs = require('fs');
const http = require('http');

const server = http.createServer(function(req,res) {
    fs.readFile('./tfile.txt','utf8', function(err,data){
        if(err) {    
            // console.error("Error ",err.message);
            res.write("File not found or error reading file.");
            return;
        }
        res.write(data);
        res.end();
    });
});
server.listen(3000);