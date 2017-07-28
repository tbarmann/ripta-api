"use strict";

const express = require('express');
const request = require('request');
const jsonfile = require('jsonfile');
const cors = require('cors');
const moment = require('moment-timezone');
const path = require('path');
const _ = require('lodash');
const db = require('./db.js');
const filterByRoutes = require('./filters').filterByRoutes;
const filterByDirection = require('./filters').filterByDirection;
const isValidRouteId = require('./filters').isValidRouteId;
const stopsSortedByDistance = require('./sorted-stops').stopsSortedByDistance;
const getStopsByRouteId = require('./stop-helpers.js').getStopsByRouteId;
const port = process.env.PORT || 3000;
const riptaApiBaseUrl = 'http://realtime.ripta.com:81/api/';
//const riptaApiBaseUrl = 'http://localhost:3000/static/';
const staticOptions = { index: 'index.htm' };
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

app.get('/api/stops?', (req, res) => {
  if (!!req.query.lat && !isNaN(req.query.lat) && !!req.query.lon && !isNaN(req.query.lon)) {
    let stopsWithDistances = stopsSortedByDistance(req.query.lat, req.query.lon);

    const limit = req.query.limit;

    if (!!limit && !isNaN(limit)) {
      stopsWithDistances = stopsWithDistances.slice(0, parseInt(limit));
    }

    res.json(stopsWithDistances);
  } else {
    res.sendStatus(422);
  }
});

app.get('/api/route/:route_id/stops', (req, res) => {
  const routeId = req.params.route_id;
  if (isValidRouteId(routeId)) {
    const stops = getStopsByRouteId(routeId);
    res.json(stops);
  }
  else {
    res.sendStatus(422);
  }
});

app.get('/api/:type', (req, res) => {
  const type = req.params.type.toLowerCase();

  if (_.includes(validApiTypes, type)) {
    fetchBaseApi(type)
      .then((data) => {
        res.json(data);
      })
      .catch((res) => {
        console.log(res);
      });
  }
  else {
    res.send('Error: Not a valid api call');
  }
});

const getArrivalDepartureTime = (schedules, trip_id, stop_id) => {
  const trip = _.find(schedules, {trip_id});
  return _.find(trip.schedule, {stop_id: parseInt(stop_id, 10)});
}


const toTimeStamp = (thisTime) => {
  return parseInt(moment(thisTime, 'HH:mm:ss').format('X'), 10);
}

const mergeScheduleData = (trips, schedules) => {
  return trips.map((trip) => {
    const trip_id = _.get(trip, ['trip_update', 'trip', 'trip_id']);
    const firstStop = _.first(trip.trip_update.stop_time_update);
    const thisTripDelay = _.get(firstStop, ['departure', 'delay'] , 0);
    const stops = trip.trip_update.stop_time_update.map((stop) => {
      const times = getArrivalDepartureTime(schedules, trip_id, stop.stop_id);
      const arrival = stop.arrival ? {
        delay: stop.arrival.delay,
        time: toTimeStamp(times.arrival)
      } : null;
      const departure = stop.departure ? {
        delay: stop.departure.delay,
        time: toTimeStamp(times.departure)
      } : null;
      return {
        stop_sequence: stop.stop_sequence,
        arrival,
        departure,
        stop_id: stop.stop_id,
        schedule_relationship: stop.schedule_relationship
      }
    });
    return {
      delay: thisTripDelay,
      id: trip.id,
      is_deleted: trip.is_deleted,
      trip_update: {
        trip: trip.trip_update.trip,
        stop_time_update: stops,
        vehicle: trip.trip_update.vehicle,
        timestamp: trip.trip_update.timestamp
      },
      vehicle: trip.vehicle,
      alert: trip.alert
    }
  });
}

app.get('/api/:type/route/:route/:dir?', (req, res) => {
  const type = req.params.type.toLowerCase();
  if (_.includes(validApiTypes, type)) {
    fetchBaseApi(type)
      .then ((data) => {
        data = filterByRoutes(data, type, req.params.route);
        if (req.params.dir) {
            data = filterByDirection(data, type, req.params.dir);
        }
        db.getTripDelays(data.entity)
          .then((delays) => {
            const entity = db.mergeDelayData(data.entity, delays);
            res.json(Object.assign(data, {entity}));
          });
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







