"use strict";
const parse = require('csv-parse');

const fs = require('fs');

const parser = parse({delimiter: ',', columns: true}, function(err, data){
  fs.writeFile('trips.json', JSON.stringify(data, null, 2), function (err) {
    if (err) {
      return console.log(err);
    }
    console.log('finished');

  });
});

fs.createReadStream(__dirname+'/static/google_transit/trips.txt').pipe(parser);
