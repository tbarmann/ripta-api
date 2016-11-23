'use strict';
const _ = require('lodash');

const stops = require('./static/stops.json');

const getStopsByRouteId = (routeId) => {
  routeId = parseInt(routeId, 10)
  return _.filter(stops, (stop) => {
    return (_.includes(stop.route_ids, routeId));
  });
}

module.exports = { getStopsByRouteId };
