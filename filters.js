'use strict';

const routes = require('./static/routes.json');
const trips = require('./static/trips.json');
const _ = require('lodash');

const routesIndexed = _.keyBy(routes, 'route_id');
const tripsIndexed = _.keyBy(trips, 'trip_id');
const validDirectionTypes = ['inbound', 'outbound'];

const typeToKey = (type) => {
  return {
    tripupdates: 'trip_update',
    vehiclepositions: 'vehicle',
    servicealerts: 'alert'
  }[type];
};

const isValidRouteId = (routeId) => {
  const routeIdInt = parseInt(routeId, 10);
  return {}.hasOwnProperty.call(routesIndexed, routeIdInt);
};

const routeToRouteId = (route) => {
  return route.toLowerCase().replace('x', '');
};

const filterByRoute = (data, type, route) => {
  const routeId = routeToRouteId(route);
  if (!isValidRouteId(routeId)) {
    return data;
  }
  const filtered = _.filter(data.entity, (record) => {
    return (record[typeToKey(type)].trip.route_id === routeId);
  });
  return { header: data.header, entity: filtered };
};

// direction information is stored in trips.json
// that file is read, indexed by trip_id
// and stored in tripsIndex object
// we have to look up the direction_id for each trip
const filterByDirection = (data, type, direction) => {
  const directionLC = direction.toLowerCase();
  if (!_.includes(validDirectionTypes, directionLC)) {
    return data;
  }
  const directionId = (directionLC === 'outbound') ? 1 : 0;
  const filtered = _.filter(data.entity, (record) => {
    const tripId = record[typeToKey(type)].trip.trip_id;
    return (directionId === tripsIndexed[tripId].direction_id);
  });
  return { header: data.header, entity: filtered };
};

module.exports = {
  filterByRoute,
  filterByDirection,
  isValidRouteId
};
