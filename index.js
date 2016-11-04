"use strict";

const express = require('express');
const request = require('request');
const jsonfile = require('jsonfile');
const moment = require('moment-timezone');
const path = require('path');
const _ = require('lodash');
const routes = require('./static/routes.json');
const trips = require('./static/trips.json');

const port = 3000;

//const riptaApiBaseUrl = 'http://realtime.ripta.com:81/api/';
const riptaApiBaseUrl = 'http://localhost:3000/static/';
const validApiTypes = ['tripupdates', 'vehiclepositions', 'servicealerts'];
const validDirectionTypes = ['inbound', 'outbound'];

const app = express();
const staticOptions = { index: 'index.htm' };

let tripsIndexed = {};
let routesIndexed = {};

const fetchBaseApi = (type, callback) => {
  const riptaApiUrl = `${riptaApiBaseUrl}${type}?format=json`;
  const options = { url: riptaApiUrl };
  request(options, (error, response, data) => {
    if (!error) {
      callback(JSON.parse(data));
    }
  });
}

const typeToKey = (type) => {
  return {
    tripupdates: 'trip_update',
    vehiclepositions: 'vehicle',
    servicealerts: 'alert'
  }[type];
}

const filterByDirection = (data, type, direction) => {
  direction = direction.toLowerCase();
  if (!_.includes(validDirectionTypes, direction)) {
    return data;
  }
  const direction_id = (direction === 'outbound') ? '1' : '0';
  const filtered = _.filter(data.entity, (record) => {
    const trip_id = record[typeToKey(type)].trip.trip_id;
    return (direction_id === tripsIndexed[trip_id].direction_id);
  });
  return { header: data.header, entity: filtered };
}

const isValidRouteId = (routeId) => {
  return routesIndexed.hasOwnProperty(routeId);
}

const routeToRouteId = (route) => {
  return route.toLowerCase().replace('x','');
}

const filterByRoute = (data, type, route) => {
  const routeId = routeToRouteId(route);
  if (!isValidRouteId(routeId)) {
    return data;
  }
  const filtered = _.filter(data.entity, (record) => {
    return (record[typeToKey(type)].trip.route_id === routeId);
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

const initialize = () => {
  routesIndexed = _.keyBy(routes, 'route_id');
  tripsIndexed = _.keyBy(trips, 'trip_id');
  startServer();
}

initialize();





