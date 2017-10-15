### outbound trips route 60
select * from trips where route_id = 60 and direction_id = 1

select * from stop_times where trip_id = 2580218

### saturday trips for Route 60, with start of route departure time and location
select trips.trip_id, trips.trip_headsign, departure_time, stop_name, direction_id from trips
left join stop_times on stop_times.trip_id = trips.trip_id
left join stops on stop_times.stop_id = stops.stop_id
 where route_id = 60 and direction_id = 1 and stop_sequence = 1
 and service_id LIKE '%Saturday%'
 order by departure_time

### with departure_time
select trips.trip_id, trips.trip_headsign, departure_time, stop_name from trips
left join stop_times on stop_times.trip_id = trips.trip_id
left join stops on stop_times.stop_id = stops.stop_id
 where route_id = 60 and direction_id = 1 and stop_sequence = 1
 and service_id LIKE '%Saturday%'
 and departure_time >= '18:00:00'
 order by departure_time

### all stops on a particular trip
select stops.stop_id, stop_name, departure_time, arrival_time, stop_sequence
from stop_times
left join stops on stops.stop_id = stop_times.stop_id
 where trip_id = 2580218
order by stop_sequence
