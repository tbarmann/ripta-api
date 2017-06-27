"use strict";

const routes = require('./static/routes.json');
const trips = require('./static/trips.json');
const _ = require('lodash');

const routesIndexed = _.keyBy(routes, 'route_id');
const tripsIndexed = _.keyBy(trips, 'trip_id');
const validApiTypes = ['tripupdates', 'vehiclepositions', 'servicealerts'];
const validDirectionTypes = ['inbound', 'outbound'];

const typeToKey = (type) => {
  return {
    tripupdates: 'trip_update',
    vehiclepositions: 'vehicle',
    servicealerts: 'alert'
  }[type];
}

const isValidRouteId = (routeId) => {
  return routesIndexed.hasOwnProperty(routeId);
}

const routeToRouteId = (route) => {
  return route.toLowerCase().replace('x','');
}

const filterByRoute = (data, type, route) => {
  const routeId = routeToRouteId(route);
  if (!isValidRouteId(routeId)) {
    return data;
  }
  const filtered = _.filter(data.entity, (record) => {
    return (record[typeToKey(type)].trip.route_id === routeId);
  });
  return { header: data.header, entity: filtered };
}

const filterByRoutes = (data, type, routesStr) => {
  let allRoutes = [];
  const routes = routesStr.split(',');
  _.each(routes, (route) => {
    const routeId = routeToRouteId(route);
    if (!isValidRouteId(routeId)) {
      return data;
    }
    const filtered = _.filter(data.entity, (record) => {
      return (record[typeToKey(type)].trip.route_id === routeId);
    });
    allRoutes = _.uniq(_.concat(allRoutes, filtered));
  })
  return { header: data.header, entity: allRoutes };
}

const filterByDirection = (data, type, direction) => {
  direction = direction.toLowerCase();
  if (!_.includes(validDirectionTypes, direction)) {
    return data;
  }
  const direction_id = (direction === 'outbound') ? 1 : 0;
  const filtered = _.filter(data.entity, (record) => {
    const trip_id = record[typeToKey(type)].trip.trip_id;
    return (direction_id === tripsIndexed[trip_id].direction_id);
  });
  return { header: data.header, entity: filtered };
}

module.exports = { filterByRoutes, filterByDirection, isValidRouteId }
