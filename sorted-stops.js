'use strict';

const haversine = require('./lib/haversine');
const stops = require('./static/stops.json');

const stopsSortedByDistance = (lat, lon) => {
  return stops.map((stop) => ({
    stop,
    distance: haversine.haversineDistance(
      { lat: parseFloat(lat), lon: parseFloat(lon) },
      { lat: parseFloat(stop.stop_lat), lon: parseFloat(stop.stop_lon) }
    )
  })).sort((a, b) => (a.distance - b.distance));
}

module.exports = { stopsSortedByDistance };
