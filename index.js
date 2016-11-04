"use strict";

const express = require('express');
const request = require('request');
const jsonfile = require('jsonfile');
const moment = require('moment-timezone');
const path = require('path');
const _ = require('lodash');

const port = 3000;
const validApiTypes = ['tripupdates', 'vehiclepositions', 'servicealerts'];
const validDirectionTypes = ['inbound', 'outbound'];

const app = express();
const staticOptions = {
  maxAge: 1,
  redirect: true,
  index: 'index.htm'
};

let tripsIndexed = {};

const loadStaticFile = (fileName, callback) => {
  const file = path.normalize(__dirname + '/static/' + fileName);
  jsonfile.readFile(file, function(err, obj) {
    if(err) {
      return ({status: 'error', reason: err.toString()});
    }
    callback(obj);
  });
}

const fetchBaseApi = (type, callback) => {
  const riptaApiUrl = `${riptaApiBaseUrl}${type}?format=json`;
  const options = { url: riptaApiUrl };
  request(options, (error, response, data) => {
    if (!error) {
      callback(JSON.parse(data));
    }
  });
}

const filterByDirectionId = (data, type, direction_id) => {
  const key = {
    tripupdates: 'trip_update',
    vehiclepositions: 'vehicle',
    servicealerts: 'alert'
  }[type];

  const filtered = _.filter(data.entity, (record) => {
    const trip_id = record[key].trip.trip_id;
    return (direction_id === tripsIndexed[trip_id].direction_id);
  });
  return { header: data.header, entity: filtered };
}

const filterByRouteId = (data, type, routeId) => {
  const key = {
    tripupdates: 'trip_update',
    vehiclepositions: 'vehicle',
    servicealerts: 'alert'
  }[type];

  const filtered = _.filter(data.entity, (record) => {
    return (record[key].trip.route_id === routeId);
  });
  return { header: data.header, entity: filtered };
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

app.get('/api/:type/route/:routeId/:dir?', (req, res) => {
  const type = req.params.type.toLowerCase();

  if (_.includes(validApiTypes, type)) {
    fetchBaseApi(type, (data) => {
      data = filterByRouteId(data, type, req.params.routeId);
      if (req.params.dir) {
        if (_.includes(validDirectionTypes, req.params.dir.toLowerCase())) {
          const direction_id = (req.params.dir.toLowerCase() === 'outbound') ? '1' : '0';
          data = filterByDirectionId(data, type, direction_id);
        }
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

const initialize = () => {
  loadStaticFile('trips.json', (trips) => {
    tripsIndexed = _.keyBy(trips, 'trip_id');
    startServer();
  });
}

initialize();





