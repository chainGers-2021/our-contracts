var fs = require('fs-extra');

fs.readFile('secret.txt', 'utf8', function(err, data) {
    if (err) throw err;
    console.log(data);
});