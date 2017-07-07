"use strict";
const _ = require('lodash');
const pg = require('pg');
const format = require('pg-format');
const moment = require('moment');

const dbConfig = {
  database: 'ripta'
};

const pool = new pg.Pool(dbConfig);

const query = (sql) => {
  const cleanedQuery = format(sql);

  return new Promise((resolve, reject) => {
    pool.query(cleanedQuery, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.rows);
      }
    });
  });
};

const getScheduledArrivalTS = (trip_id, stop_id) => {
  const sql = `SELECT arrival_time, departure_time FROM stop_times WHERE stop_id = ${stop_id} AND trip_id = ${trip_id}`;
  return query(sql).then((result) => {
    if (result.length > 0) {
      return parseInt(moment(result[0].arrival_time, 'HH:mm:ss').format('X'), 10);
    }
    return null;
  });
};

const getPredictedArrivalTimes = (trips) => {
  return trips.map((trip) => {
    const trip_id = _.get(trip, ['trip_update', 'trip', 'trip_id']);
    const stops = _.get(trip, ['trip_update', 'stop_time_update']);
    const firstStop = _.head(stops);
    if (firstStop && firstStop.stop_id) {
      const stop_id = _.head(stops).stop_id;
      const predictedArrivalTS = _.get(firstStop, ['arrival', 'time'], null) || _.get(firstStop, ['departure', 'time'], null);
      return {
        trip_id,
        stop_id,
        predictedArrivalTS
      };
    }
    else {
     return {};
    }
  }).filter((trip) => !_.isEmpty(trip));
};

const getTripDelays = (trips) => {
  const predictedArrivalTimes = getPredictedArrivalTimes(trips);
  const predictedArrivalTimeQueries = predictedArrivalTimes.map(({trip_id, stop_id, predictedArrivalTS}) => {
    return getScheduledArrivalTS(trip_id, stop_id).then((scheduledArrivalTS) => {
      const delay = predictedArrivalTS - scheduledArrivalTS;
      return {
        trip_id,
        delay
      };
    });
  });

  return Promise.all(predictedArrivalTimeQueries);
};

const mergeDelayData = (trips, delays) => {
  return trips.map(trip => {
    const trip_id = _.get(trip, ['trip_update', 'trip', 'trip_id']);
    const thisTrip = _.find(delays, {trip_id});
    const delay = _.has(thisTrip, 'delay') ? thisTrip.delay : 0;
    return Object.assign(trip, {delay});
  });
};

module.exports = {query, getTripDelays, mergeDelayData}
