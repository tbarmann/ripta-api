const moment = require('moment-timezone');

const formatStrAsTime = (str) => {
  const parts = str.split(':');
  if (parts.length === 0) {
    return '00:00';
  }
  const hours = `0${parts[0]}`.slice(-2);
  const minutes = parts[1] ? `0${parts[1]}`.slice(-2) : '00';
  return `${hours}:${minutes}`;
};

// get service ids by date from calendar
// each date has one or more associated service ids
// date string must be exactly 8 numbers or it is ignored
// has to be in the format YYYYMMDD
// if date is invalid or missing, it defaults to today
var getServiceIdsByDateSql = (date) => {
  let dateStr;
  if (/^[\d]{8}$/.test(date)) {
    dateStr = moment(date).format("YYYYMMDD");
  } else {
    dateStr = moment().format("YYYYMMDD");
  }
  return `SELECT service_id from calendar_dates where date = ${dateStr}`;
};

// get all trips by route with optional params
// params: routeId, serviceDay, directionId, stopId, startTime, endTime
const getTripsByRouteSql = (params) => {
  const where = [];

  if (!params.routeId) {
    return null;
  }
  where.push(`route_id = ${params.routeId}`);
  where.push(`service_id IN (${getServiceIdsByDateSql(params.serviceDay)})`);

  if (params.stopId) {
    where.push(`stops.stop_id = ${params.stopId}`);
  } else {
    where.push('stop_times.stop_sequence = 1'); // default to 1, the first stop
  }

  if (params.directionId) {
    where.push(`direction_id = ${params.directionId}`);
  }
  if (params.startTime) {
    where.push(`departure_time >= '${formatStrAsTime(params.startTime)}'`);
  }
  if (params.endTime) {
    where.push(`departure_time <= '${formatStrAsTime(params.endTime)}'`);
  }

  return `SELECT trips.trip_id, trips.trip_headsign, departure_time, stops.stop_id, stop_name, direction_id from trips
  LEFT JOIN stop_times on stop_times.trip_id = trips.trip_id
  LEFT JOIN stops on stop_times.stop_id = stops.stop_id
  WHERE ${where.join(' AND ')}
  ORDER BY direction_id, departure_time;`;
};

// get all trips by route with optional params
// params: routeId, serviceDay, directionId, stopId, startTime, endTime
const getTripsByStopIdSql = (params) => {
  const where = [];

  if (!params.stopId) {
    return null;
  }
  where.push(`stops.stop_id = ${params.stopId}`);
  where.push(`service_id IN (${getServiceIdsByDateSql(params.serviceDay)})`);

  if (params.routeId) {
    where.push(`stops.route_id = ${params.routeId}`);
  }
  if (params.directionId) {
    where.push(`direction_id = ${params.directionId}`);
  }
  if (params.startTime) {
    where.push(`departure_time >= '${formatStrAsTime(params.startTime)}'`);
  }
  if (params.endTime) {
    where.push(`departure_time <= '${formatStrAsTime(params.endTime)}'`);
  }

  return `select trips.trip_id, service_id, arrival_time, departure_time,
    stop_name, stops.stop_id, route_id, trips.trip_headsign from stop_times
    left join stops on stop_times.stop_id = stops.stop_id
    left join trips on stop_times.trip_id = trips.trip_id
    WHERE ${where.join(' AND ')}
    ORDER BY departure_time;`;
};

// get all stops for a particular route with optional params
// params: routeId, serviceDay, directionId
const getStopsByRouteIdSql = (params) => {
  const where = [];

  if (!params.routeId) {
    return null;
  }
  where.push(`trips.route_id = ${params.routeId}`);
  where.push(`service_id IN (${getServiceIdsByDateSql(params.serviceDay)})`);

  if (params.directionId) {
    where.push(`trips.direction_id = ${params.directionId}`);
  }

  return `select distinct stop_times.stop_id, stop_name, stop_lat, stop_lon from stop_times
    left join stops on stops.stop_id = stop_times.stop_id
    where stop_times.trip_id in
      (select trips.trip_id from trips WHERE ${where.join(' AND ')})
    order by stop_name;`;
};

// all stops on a particular trip
const getStopsByTripSql = (tripId) => {
  return `SELECT stops.stop_id, stop_name, departure_time, arrival_time, stop_sequence, stop_lat, stop_lon
    FROM stop_times
    LEFT JOIN stops on stops.stop_id = stop_times.stop_id
    WHERE trip_id = ${tripId}
    ORDER by stop_sequence;`;
};

// get all routes associated with a particular stop
const getRoutesByStopSql = (stopId) => {
  return `SELECT stop_id, route_id, count(trips.trip_id)
    FROM stop_times
    LEFT JOIN trips on stop_times.trip_id = trips.trip_id
    WHERE stop_id = ${stopId}
    GROUP BY route_id;`;
};

const getTripScheduleSql = (tripId) => {
  return `SELECT stop_id,
    arrival_time as arrival,
    departure_time as departure FROM stop_times WHERE trip_id = ${tripId} ORDER BY stop_sequence;`;
};

module.exports = {
  getTripsByRouteSql,
  getStopsByTripSql,
  getRoutesByStopSql,
  getTripScheduleSql,
  getTripsByStopIdSql,
  getStopsByRouteIdSql
};

