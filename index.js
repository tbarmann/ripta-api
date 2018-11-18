'use strict';

const express = require('express');
const request = require('request');
const jsonfile = require('jsonfile');
const cors = require('cors');
const path = require('path');
const _ = require('lodash');
const db = require('./db');
const filterByDirection = require('./filters').filterByDirection;
const filterByRoute = require('./filters').filterByRoute;
const getStopsByRouteId = require('./utils').getStopsByRouteId;
const isValidRouteId = require('./filters').isValidRouteId;
const mergeScheduleData = require('./utils').mergeScheduleData;
const port = process.env.PORT || 3000;
const riptaApiBaseUrl = 'http://realtime.ripta.com:81/api/';
const staticOptions = { index: 'index.htm' };
const stopsSortedByDistance = require('./sorted-stops').stopsSortedByDistance;
const validApiTypes = ['tripupdates', 'vehiclepositions', 'servicealerts'];

const fetchBaseApi = (type) => {
  const riptaApiUrl = `${riptaApiBaseUrl}${type}?format=json`;
  const options = { url: riptaApiUrl };
  return new Promise((resolve, reject) => {
    request(options, (error, response, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(JSON.parse(data));
      }
    });
  });
};

const app = express();
app.use(cors());
app.use(express.static('public', staticOptions));

const MAX_RESULTS = 10;

app.get('/api/stops?', (req, res) => {
  if (!!req.query.lat
    && !Number.isNaN(req.query.lat)
    && !!req.query.lon
    && !Number.isNaN(req.query.lon)
  ) {
    let stopsWithDistances = stopsSortedByDistance(req.query.lat, req.query.lon);

    const limit = req.query.limit || MAX_RESULTS;

    if (!!limit && !Number.isNaN(limit)) {
      stopsWithDistances = stopsWithDistances.slice(0, parseInt(limit, 10));
    }
    res.json(stopsWithDistances);
  } else {
    res.sendStatus(422);
  }
});

app.get('/api/trip/:tripId', (req, res) => {
  const tripId = req.params.tripId;
  db.getStopsByTrip(tripId)
    .then((stops) => res.json(stops))
    .catch((error) => console.log(error));
});

app.get('/api/stops/:routeId', (req, res) => {
  const params = {
    routeId: req.params.routeId,
    serviceDay: req.query.serviceDay,
    directionId: req.query.directionId,
  };
  if (true) {
    db.getStopsByRouteId(params)
      .then((stops) => res.json(stops))
      .catch((error) => console.log(error));
  } else {
    res.sendStatus(422);
  }
});

app.get('/api/trips/stop/:stopId', (req, res) => {
  const params = {
    stopId: req.params.stopId,
    serviceDay: req.query.serviceDay,
    directionId: req.query.directionId,
    startTime: req.query.startTime,
    endTime: req.query.endTime
  };
  console.log(params);
  if (true) {
    db.getTripsByStopId(params)
      .then((trips) => res.json(trips))
      .catch((error) => console.log(error));
  } else {
    res.sendStatus(422);
  }
});

app.get('/api/trips/route/:routeId', (req, res) => {
  const params = {
    routeId: req.params.routeId,
    stopId: req.query.stopId,
    serviceDay: req.query.serviceDay,
    directionId: req.query.directionId,
    startTime: req.query.startTime,
    endTime: req.query.endTime
  };
  if (isValidRouteId(params.routeId)) {
    db.getTripsByRoute(params)
      .then((trips) => res.json(trips))
      .catch((error) => console.log(error));
  } else {
    res.sendStatus(422);
  }
});

app.get('/api/route/:route_id/stops', (req, res) => {
  const routeId = req.params.route_id;
  if (isValidRouteId(routeId)) {
    const stops = getStopsByRouteId(routeId);
    res.json(stops);
  } else {
    res.sendStatus(422);
  }
});

// pass through from ripta api without any filtering
app.get('/api/:type', (req, res) => {
  const type = req.params.type.toLowerCase();

  if (_.includes(validApiTypes, type)) {
    fetchBaseApi(type)
      .then((data) => {
        res.json(data);
      })
      .catch((error) => {
        console.log('error:', error);
      });
  } else {
    res.send('Error: Not a valid api call');
  }
});

app.get('/api/:type/route/:route/:dir?', (req, res) => {
  const type = req.params.type.toLowerCase();
  if (_.includes(validApiTypes, type)) {
    fetchBaseApi(type)
      .then((data) => {
        let filteredData = filterByRoute(data, type, req.params.route);
        if (req.params.dir) {
          filteredData = filterByDirection(filteredData, type, req.params.dir);
        }
        db.getTripSchedules(filteredData.entity)
          .then((schedules) => {
            const entity = mergeScheduleData(filteredData.entity, schedules);
            res.json({...filteredData, entity});
          });
      });
  } else {
    res.send('Error: Not a valid api call');
  }
});

app.get('/static/:fileName', (req, res) => {
  const fileName = req.params.fileName + '.json';
  const file = path.normalize(`${__dirname}/static/${fileName}`);
  jsonfile.readFile(file, (err, obj) => {
    if (err) {
      res.json({ status: 'error', reason: err.toString() });
      return;
    }
    res.json(obj);
  });
});

const startServer = () => {
  app.listen(port, () => {
    console.log(`App listening on port ${port}`);
  });
};

startServer();

