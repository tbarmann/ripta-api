'use strict';

const pg = require('pg');
const url = require('url');
const format = require('pg-format');
const get = require('lodash/get');
const getTripsByRouteSql = require('./queries').getTripsByRouteSql;
const getStopsByTripSql = require('./queries').getStopsByTripSql;
const getTripScheduleSql = require('./queries').getTripScheduleSql;
const getTripsByStopIdSql = require('./queries').getTripsByStopIdSql;


const LOCAL_DB = 'localhost';
const DATABASE = 'ripta';

let dbConfig = {};

if (process.env.DATABASE_URL && url.parse(process.env.DATABASE_URL).auth) {
  const params = url.parse(process.env.DATABASE_URL);
  const auth = params.auth.split(':');

  dbConfig = {
    user: auth[0],
    password: auth[1] ? auth[1] : undefined,
    host: params.hostname,
    port: params.port,
    database: params.pathname.split('/')[1],
    ssl: false
  };
} else {
  dbConfig = {
    database: DATABASE,
    host: LOCAL_DB
  };
}

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

const getTripsByRoute = (params) => {
  const sql = getTripsByRouteSql(params);
  if (!sql) {
    return Promise.resolve({ error: 'Invalid query', sql });
  }
  return query(sql).then((result) => {
    if (result.length > 0) {
      return result;
    }
    return { params, sql, trips: result };
  });
};

const getStopsByTrip = (tripId) => {
  const sql = getStopsByTripSql(tripId);
  return query(sql).then((result) => {
    if (result.length > 0) {
      return { tripId, stops: result };
    }
    console.warn('Trip not found: ', tripId);
    return { tripId, stops: [] };
  });
};

const getTripsByStopId = (params) => {
  const sql = getTripsByStopIdSql(params);
  return query(sql).then((result) => {
    if (result.length > 0) {
      return { stopId: params.stopId, trips: result };
    }
    console.warn('No trips found for stop: ', params.stopId);
    return { stopId: params.stopId, trips: [] };
  });
};

const getTripSchedules = (trips) => {
  const scheduleQueries = trips.map(trip => {
    const tripId = get(trip, ['trip_update', 'trip', 'trip_id']);
    return getTripSchedule(tripId);
  });
  return Promise.all(scheduleQueries);
};

const getTripSchedule = (tripId) => {
  const sql = getTripScheduleSql(tripId);
  return query(sql).then((result) => {
    if (result.length > 0) {
      return ({trip_id: tripId, schedule: result});
    }
    return null;
  });
};

module.exports = {
  query,
  getTripsByRoute,
  getStopsByTrip,
  getTripSchedules,
  getTripsByStopId
};
