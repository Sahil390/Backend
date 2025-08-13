const http = require('http');

const server = http.createServer(function(req,res) {
    res.write("Hello this is from server");
    res.end();
})

server.listen(5500);