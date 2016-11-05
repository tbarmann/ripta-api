"use strict";

const express = require('express');
const request = require('request');
const jsonfile = require('jsonfile');
const moment = require('moment-timezone');
const path = require('path');
const _ = require('lodash');
const filterByRoute = require('./filters').filterByRoute;
const filterByDirection = require('./filters').filterByDirection;

const port = 3000;

//const riptaApiBaseUrl = 'http://realtime.ripta.com:81/api/';
const riptaApiBaseUrl = 'http://localhost:3000/static/';

const app = express();
const staticOptions = { index: 'index.htm' };

const validApiTypes = ['tripupdates', 'vehiclepositions', 'servicealerts'];

const fetchBaseApi = (type, callback) => {
  const riptaApiUrl = `${riptaApiBaseUrl}${type}?format=json`;
  const options = { url: riptaApiUrl };
  request(options, (error, response, data) => {
    if (!error) {
      callback(JSON.parse(data));
    }
  });
}

app.use(express.static('public', staticOptions));

app.get('/api/:type', (req, res) => {
  const type = req.params.type.toLowerCase();

  if (_.includes(validApiTypes, type)) {
    fetchBaseApi(type, (data) => {
      res.json(data);
    });
  }
  else {
    res.send('Error: Not a valid api call');
  }
});

app.get('/api/:type/route/:route/:dir?', (req, res) => {
  const type = req.params.type.toLowerCase();
  if (_.includes(validApiTypes, type)) {
    fetchBaseApi(type, (data) => {
      data = filterByRoute(data, type, req.params.route);
      if (req.params.dir) {
          data = filterByDirection(data, type, req.params.dir);
      }
      res.json(data);
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

const startServer = () => {
  app.listen(port, () => {
    console.log(`App listening on port ${port}`);
  });
}

startServer();







