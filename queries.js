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

// Converts a day of the week into a binary 7 digit pattern
// which is used to create a WHERE clause for a query to compare
// the last 7 digits of the service_id with this pattern
// Uses the & bitwise operator to perform an "AND"
// and returns the WHERE clause
// dow param is a day of week number as a string where monday === 0, tuesday === 1, etc.
const createServiceIdWhere = (dow) => {
  const patterns = ['1000000', '0100000', '0010000', '0001000', '0000100', '0000010', '0000001'];
  const dowInt = parseInt(dow, 10);
  if (dow === undefined ||  dowInt < 0 || dowInt > 6) {
    console.log('Warning: Invalid day of week');
    return 'true'; // true is returned so it does not break the where statement
  }
  const pattern = patterns[dowInt];
  return `CAST(RIGHT(trips.service_id, 7) as bit(7)) & b'${pattern}' = b'${pattern}'`;
}

const getTodaysDayOfWeek = () => {
  const today = moment(new Date());
  const eastCoastDate = new Date(today.tz('America/New_York'));
  const dow = eastCoastDate.getDay();
  const dowConverted = dow === 0 ? 6 : dow - 1; //convert to monday = 0, tuesday = 1, etc.
  console.log('day of week:', dowConverted);
  return dowConverted;
}

// get all trips by route with optional params
// params: routeId, serviceDay, directionId, stopId, startTime, endTime
const getTripsByRouteSql = (params) => {
  const where = [];

  if (!params.routeId) {
    return null;
  }
  where.push(`route_id = ${params.routeId}`);

  if (params.stopId) {
    where.push(`stops.stop_id = ${params.stopId}`);
  } else {
    where.push('stop_times.stop_sequence = 1'); // default to 1, the first stop
  }
  if (params.serviceDay) {
    where.push(createServiceIdWhere(params.serviceDay));
  } else {
    where.push(createServiceIdWhere(getTodaysDayOfWeek())); // default to today
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

  return `SELECT trips.trip_id, trips.trip_headsign, departure_time, stop_name, direction_id from trips
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

  if (params.routeId) {
    where.push(`stops.route_id = ${params.routeId}`);
  }
  if (params.serviceDay) {
    where.push(createServiceIdWhere(params.serviceDay));
  } else {
    where.push(createServiceIdWhere(getTodaysDayOfWeek())); // default to today
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
    stop_name, route_id, trips.trip_headsign from stop_times
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

  if (params.serviceDay) {
    where.push(createServiceIdWhere(params.serviceDay));
  } else {
    where.push(createServiceIdWhere(getTodaysDayOfWeek())); // default to today
  }
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

