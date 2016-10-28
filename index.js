"use strict";

const express = require('express');
const request = require('request');
const moment = require('moment-timezone');
const _ = require('lodash');

const riptaApiBaseUrl = 'http://realtime.ripta.com:80/api/';
const validApiTypes = ['tripupdates', 'vehiclepositions', 'servicealerts'];

const app = express();

const fetchBaseApi = (type) => {
  // parse local path to get the first part of the path
  const riptaApiUrl = `${riptaApiBaseUrl}${type}`;
  return makeRiptaApiRequest(riptaApiUrl);
}

const makeRiptaApiRequest = (url) => {
  return `Request made to ${url}`;
}

const filterByRouteId = (data, route_id) => {
  return `${data} filtered by route_id: ${route_id}`;
  // filter on records that contain given route_id
  // return filtered results
}

app.get('/api/:type/:route_id?', (req, res) => {
  console.log(req.params.type, Date.now());
  if (_.includes(validApiTypes, req.params.type.toLowerCase())) {
    let data = fetchBaseApi(req.params.type.toLowerCase());
    if (req.params.route_id !== undefined) {
      data = filterByRouteId(data, req.params.route_id);
    }
    res.send(data);
  }
  else {
    res.send('Error: Not a valid api call');
  }

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

