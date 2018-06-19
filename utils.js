const get = require('lodash/get');
const filter = require('lodash/filter');
const find = require('lodash/find');
const includes = require('lodash/includes');
const moment = require('moment');
const allStops = require('./static/stops.json');

const getArrivalDepartureTime = (schedules, tripId, stopId) => {
  const trip = find(schedules, {tripId});
  return find(trip.schedule, {stopId: parseInt(stopId, 10)});
};

const toTimeStamp = (thisTime) => {
  return parseInt(moment(thisTime, 'HH:mm:ss').format('X'), 10);
};

const mergeScheduleData = (trips, schedules) => {
  return trips.map((trip) => {
    const tripId = get(trip, ['trip_update', 'trip', 'trip_id']);
    const stops = trip.trip_update.stop_time_update.map((stop) => {
      const times = getArrivalDepartureTime(schedules, tripId, stop.stop_id);
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
    const tripUpdate = {...trip.trip_update, stop_time_update: stops};
    return {...trip, tripUpdate};
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

