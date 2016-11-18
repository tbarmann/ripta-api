"use strict";
const parse = require('csv-parse');

const fs = require('fs');

const csvFile = 'routes.csv';

const fileBase = csvFile.split('.')[0];
const readPath = __dirname+'/static/google_transit/';
const writePath = __dirname+'/static/';

const parser = parse({delimiter: ',', columns: true}, function(err, data){
  fs.writeFile(writePath + fileBase + '.json', JSON.stringify(data, null, 2), function (err) {
    if (err) {
      return console.log(err);
    }
    console.log('finished');

  });
});

fs.createReadStream(readPath + csvFile).pipe(parser);
