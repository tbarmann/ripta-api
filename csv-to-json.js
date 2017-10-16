'use strict';

const csvParse = require('csv-parse');
const fs = require('fs');

const parse = (csvFile) => {
  const fileBase = csvFile.split('.')[0];
  const readPath = `${__dirname}/static/google_transit/`;
  const writePath = `${__dirname}/static/`;
  const options = {
    delimiter: ',',
    columns: true,
    auto_parse: true,
    trim: true
  };

  const parser = csvParse(options, (err, data) => {
    fs.writeFile(writePath + fileBase + '.json', JSON.stringify(data, null, 2), (error) => {
      if (error) {
        return console.log(err);
      }
      console.log('finished writing: ' + writePath + fileBase);
      return true;
    });
  });
  fs.createReadStream(readPath + csvFile).pipe(parser);
};

const files = ['routes.txt', 'stops.txt', 'trips.txt'];

files.map((file) => parse(file));

