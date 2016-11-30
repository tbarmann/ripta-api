'use strict';
const _ = require('lodash');

const stops = require('./static/stops.json');

const getDirectionId = (direction) => {

  switch (direction.toString().toLowerCase()) {
    case '0':
    case 'north':
    case 'northbound':
    case 'east':
    case 'eastbound':
    case 'inbound':
      return '0';
    case '1':
    case 'south':
    case 'southbound':
    case 'west':
    case 'westbound':
    case 'outbound':
      return '1';
    default:
      return null;
  }
}


const getStopsByRouteId = (routeId, directionId) => {
  routeId = parseInt(routeId, 10)
  const filtered =  _.filter(stops, (stop) => {
    if (directionId === null) {
      return _.includes(stop.route_ids, routeId)
    }
    else {
      return _.includes(stop.route_ids, routeId) && _.includes(stop.direction_id, directionId)
    }
  });
  return _.sortBy(filtered, [function(o) { return parseInt(o.stop_sequence)}]);
}

module.exports = { getStopsByRouteId, getDirectionId };
