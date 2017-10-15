"use strict";
const _ = require('lodash');
const pg = require('pg');
const format = require('pg-format');
const moment = require('moment');
const getTripsByRouteSql = require('./queries').getTripsByRouteSql;
const getStopsByTripSql = require('./queries').getStopsByTripSql;

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

const getTripsByRoute = (params) => {
  const sql = getTripsByRouteSql(params);
  return query(sql).then((result) => {
    if (result.length > 0) {
      return result;
    }
    return {params, sql, trips: result};
  });
};

const getStopsByTrip = (tripId) => {
  const sql = getStopsByTripSql(tripId);
  return query(sql).then((result) => {
    if (result.length > 0) {
      return {tripId, stops: result};
    }
    return [];
  });
};


module.exports = {
  query,
  getTripsByRoute,
  getStopsByTrip
}
