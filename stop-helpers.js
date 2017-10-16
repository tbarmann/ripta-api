'use strict';

const _ = require('lodash');

const stops = require('./static/stops.json');

const getStopsByRouteId = (routeId) => {
  const routeIdInt = parseInt(routeId, 10);
  return _.filter(stops, (stop) => {
    return (_.includes(stop.route_ids, routeIdInt));
  });
};

module.exports = { getStopsByRouteId };
