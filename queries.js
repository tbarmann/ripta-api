
// get all trips by route with optional params
// params: routeId, serviceDay, directionId, stopId, startTime, endTime
const getTripsByRouteSql = (params) => {
  const where = [];

  if (!params.routeId) {
    return 'Invalid query: routeId is required';
  }
  where.push(`route_id = ${params.routeId}`);

  if (params.stopId) {
    where.push(`stops.stop_id = ${params.stopId}`);
  } else {
    where.push('stop_times.stop_sequence = 1'); // default to 1, the first stop
  }
  if (params.serviceDay) {
    where.push(`service_id LIKE '%${params.serviceDay}%'`)
  } else {
    where.push('service_id LIKE \'%Weekday%\''); // default to Weekday
  }
  if (params.directionId) {
    where.push(`direction_id = ${params.directionId}`)
  }
  if (params.startTime) {
    where.push(`departure_time >= '${params.startTime}'`);
  }
  if (params.endTime) {
    where.push(`departure_time <= '${params.endTime}'`);
  }

  return `SELECT trips.trip_id, trips.trip_headsign, departure_time, stop_name, direction_id from trips
  LEFT JOIN stop_times on stop_times.trip_id = trips.trip_id
  LEFT JOIN stops on stop_times.stop_id = stops.stop_id
  WHERE ${where.join(' AND ')}
  ORDER BY direction_id, departure_time;`;
}

// all stops on a particular trip
const getStopsByTripSql = (tripId) => {
  return `SELECT stops.stop_id, stop_name, departure_time, arrival_time, stop_sequence
    FROM stop_times
    LEFT JOIN stops on stops.stop_id = stop_times.stop_id
    WHERE trip_id = ${tripId}
    ORDER by stop_sequence;`
}

module.exports = {getTripsByRouteSql, getStopsByTripSql}

