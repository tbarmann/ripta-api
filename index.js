"use strict";

const express = require('express');
const request = require('request');
const jsonfile = require('jsonfile');
const moment = require('moment-timezone');
const path = require('path');
const _ = require('lodash');

const port = 3000;
//const riptaApiBaseUrl = 'http://realtime.ripta.com:81/api/';
const riptaApiBaseUrl = 'http://localhost:3000/static/';
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

app.use(express.static('static'));

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

app.get('/static/:fileName', (req, res) => {
  const fileName = req.params.fileName + '.json';
  const file = path.normalize(__dirname + '/static/' + fileName);

  jsonfile.readFile(file, function(err, obj) {
    if(err) {
      res.json({status: 'error', reason: err.toString()});
      return;
    }
    res.json(obj);
  });
});

app.listen(port, function () {
  console.log(`App listening on port ${port}`);
});



