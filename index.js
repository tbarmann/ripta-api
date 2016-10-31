"use strict";

const express = require('express');
const request = require('request');
const moment = require('moment-timezone');
const _ = require('lodash');

const port = 3000;
const riptaApiBaseUrl = 'http://realtime.ripta.com:81/api/';
const validApiTypes = ['tripupdates', 'vehiclepositions', 'servicealerts'];

const app = express();

const fetchBaseApi = (type, callback) => {
  const riptaApiUrl = `${riptaApiBaseUrl}${type}?format=json`;
  const options = { url: riptaApiUrl };
  request(options, (error, response, data) => {
    if (!error) {
      callback(JSON.parse(data));
    }
  });
}

const filterByRouteId = (data, type, routeId) => {
  const path = {
    tripupdates: 'trip_update',
    vehiclepositions: 'vehicle',
    servicealerts: 'alert'
  }[type];
  const filtered = _.filter(data.entity, (record) => {
    return (record[path].trip.route_id === routeId);
  });
  return {header: data.header, entity: filtered};
}

app.get('/api/:type', (req, res) => {
  const type = req.params.type.toLowerCase();
  if (_.includes(validApiTypes, type)) {
    fetchBaseApi(type, (data) => {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(data,null,2));
    });
  }
  else {
    res.send('Error: Not a valid api call');
  }
});

app.get('/api/:type/route/:routeId', (req, res) => {
  const type = req.params.type.toLowerCase();
  if (_.includes(validApiTypes, type)) {
    fetchBaseApi(type, (data) => {
      data = filterByRouteId(data, type, req.params.routeId);
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(data,null,2));
    });
  }
  else {
    res.send('Error: Not a valid api call');
  }
});


app.listen(port, function () {
  console.log(`App listening on port ${port}`);
});



