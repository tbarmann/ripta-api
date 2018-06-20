begin;
DROP TABLE IF EXISTS stop_times;
CREATE TABLE stop_times (
    trip_id integer,
    arrival_time character varying(8),
    departure_time character varying(8),
    stop_id integer,
    stop_sequence integer,
    pickup_type smallint,
    drop_off_type smallint,
    id SERIAL PRIMARY KEY
);
\copy stop_times(trip_id,arrival_time,departure_time,stop_id,stop_sequence,pickup_type,drop_off_type) from 'stop_times.txt' CSV HEADER;
commit;

begin;
DROP TABLE IF EXISTS routes;
CREATE TABLE routes (
    route_id integer,
    route_short_name character varying,
    route_long_name character varying,
    route_desc character varying,
    route_type character varying,
    route_url character varying,
    id SERIAL PRIMARY KEY
);
\copy routes(route_id,route_short_name,route_long_name,route_desc,route_type,route_url) from 'routes.txt' CSV HEADER;
commit;

begin;
DROP TABLE IF EXISTS trips;
CREATE TABLE trips (
    route_id integer,
    service_id character varying,
    trip_id integer,
    trip_headsign character varying,
    direction_id integer,
    block_id integer,
    shape_id integer,
    trip_type integer,
    trip_footnote character varying,
    id SERIAL PRIMARY KEY
);
\copy trips(route_id,service_id,trip_id,trip_headsign,direction_id,block_id,shape_id,trip_type,trip_footnote) from 'trips.txt' CSV HEADER;
commit;

begin;
DROP TABLE IF EXISTS stops;
CREATE TABLE stops (
    stop_id integer,
    stop_code character varying,
    stop_name character varying,
    trip_headsign character varying,
    stop_desc character varying,
    stop_lat numeric(9, 6),
    stop_lon numeric(9, 6),
    zone_id integer,
    stop_url character varying,
    location_type integer,
    parent_station character varying,
    stop_associated_place character varying,
    id SERIAL PRIMARY KEY
);
\copy stops(stop_id,stop_code,stop_name,stop_desc,stop_lat,stop_lon,zone_id,stop_url,location_type,parent_station,stop_associated_place) from 'stops.txt' CSV HEADER;
commit;




