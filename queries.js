const formatStrAsTime = (str) => {
  const parts = str.split(':');
  if (parts.length === 0) {
    return '00:00';
  }
  const hours = `0${parts[0]}`.slice(-2);
  const minutes = parts[1] ? `0${parts[1]}`.slice(-2) : '00';
  return `${hours}:${minutes}`;
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
    where.push(`service_id LIKE '%${params.serviceDay}%'`);
  } else {
    where.push('service_id LIKE \'%Weekday%\''); // default to Weekday
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
    where.push(`service_id LIKE '%${params.serviceDay}%'`);
  } else {
    where.push('service_id LIKE \'%Weekday%\''); // default to Weekday
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
    where.push(`trips.service_id LIKE '%${params.serviceDay}%'`);
  }
  if (params.directionId) {
    where.push(`trips.direction_id = ${params.directionId}`);
  }

  return `select distinct stop_times.stop_id, stop_name from stop_times
    left join stops on stops.stop_id = stop_times.stop_id
    where stop_times.trip_id in
      (select trips.trip_id from trips WHERE ${where.join(' AND ')})
    order by stop_name;`;
};

// all stops on a particular trip
const getStopsByTripSql = (tripId) => {
  return `SELECT stops.stop_id, stop_name, departure_time, arrival_time, stop_sequence
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

