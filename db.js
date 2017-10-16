'use strict';

const pg = require('pg');
const url = require('url');
const format = require('pg-format');
const getTripsByRouteSql = require('./queries').getTripsByRouteSql;
const getStopsByTripSql = require('./queries').getStopsByTripSql;

const LOCAL_DB = 'localhost';

let dbConfig = {};

if (process.env.DATABASE_URL) {
  const params = url.parse(process.env.DATABASE_URL);
  const auth = params.auth.split(':');

  dbConfig = {
    user: auth[0],
    password: auth[1],
    host: params.hostname,
    port: params.port,
    database: params.pathname.split('/')[1],
    ssl: true
  };
} else {
  dbConfig = {
    database: 'ripta',
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
    return [];
  });
};

module.exports = {
  query,
  getTripsByRoute,
  getStopsByTrip
};
