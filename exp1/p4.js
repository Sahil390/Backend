const fs = require('fs');

fs.readFile('tfile.txt','utf8', function(err,data){
    if(err) {    
        console.error("Error ",err.message);
        return;
    }

    console.log(data);
});