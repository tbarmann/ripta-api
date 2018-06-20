const get = require('lodash/get');
const filter = require('lodash/filter');
const find = require('lodash/find');
const includes = require('lodash/includes');
const moment = require('moment');
const allStops = require('./static/stops.json');


const getArrivalDepartureTime = (schedules, trip_id, stop_id) => {
  const trip = find(schedules, {trip_id});
  return find(trip.schedule, {stop_id: parseInt(stop_id, 10)});
};

const toTimeStamp = (thisTime) => {
  return parseInt(moment(thisTime, 'HH:mm:ss').format('X'), 10);
};

const mergeScheduleData = (trips, schedules) => {
  return trips.map((trip) => {
    const trip_id = get(trip, ['trip_update', 'trip', 'trip_id']);
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
      return {...stop, arrival, departure};
    });
    const trip_update = {...trip.trip_update, stop_time_update: stops};
    return {...trip, trip_update};
  });
};

const getStopsByRouteId = (routeId) => {
  const routeIdInt = parseInt(routeId, 10);
  return filter(allStops, (stop) => {
    return (includes(stop.route_ids, routeIdInt));
  });
};

module.exports = {
  mergeScheduleData,
  getStopsByRouteId
};

