const _ = require('lodash');
const tripupdates = require('./trip-updates.js');

entity = tripupdates.entity;

const filtered = _.filter(entity, (record) => {
	return (record.trip_update.trip.route_id === '66');
})

console.log(filtered);