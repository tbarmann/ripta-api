"use strict";

const express = require('express');
const request = require('request');
const moment = require('moment-timezone');
const _ = require('lodash');

const riptaApiBaseUrl = 'http://realtime.ripta.com:81/api/';
const validApiTypes = ['tripupdates', 'vehiclepositions', 'servicealerts'];

const app = express();

const fetchBaseApi = (type, callback) => {
  const riptaApiUrl = `${riptaApiBaseUrl}${type}?format=json`;
  const options = { url: riptaApiUrl };
  request(options, (error, response, data) => {
    if (!error) {
      callback (callback(data));
    }
  });
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
  const type = req.params.type.toLowerCase();
  if (_.includes(validApiTypes, type)) {
    fetchBaseApi(type, (data) => {
      if (req.params.route_id !== undefined) {
        data = filterByRouteId(data, req.params.route_id);
      }
      res.send(data);      
    });
  }
  else {
    res.send('Error: Not a valid api call');
  }
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});



