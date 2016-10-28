"use strict";

const express = require('express');
const request = require('request');
const moment = require('moment-timezone');
const _ = require('lodash');

const app = express();
app.get('/api/tripupdates', (req, res) => {
	console.log(req.query);
	res.send('tripupdates ' + req.query.format);
});

app.get('/api/tripupdates/:route_id', (req, res) => {
	console.log(req.query);
	res.send('tripupdates ' + req.query.format);
});

app.get('/api/vehiclepositions', (req, res) => {
	console.log(req.query);
	res.send('vehiclepositions ' + req.query.format);
});

app.get('/api/servicealerts', (req, res) => {
	console.log(req.query);
	res.send('servicealerts ' + req.query.format);
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});


// const options = {
//     url: `http://w1.weather.gov/data/obhistory/${stationId}.html`,
//     headers: {
//       'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36'
//     }
//   };

//     return request(options, (error, response, html) => {
//     if (!error) {
//       callback (scrapeHtml(html));
//     }
//   });

