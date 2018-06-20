# RIPTA API
Provides a proxy to the official Rhode Island Public Transit Authority (RIPTA) API (`http://realtime.ripta.com:81/api/`) that supplies near real-time information about bus locations and expected arrival times. This API adds the ability to filter the results by route and direction. In addition, this API adds endpoints not available in the official RIPTA API:

* Get stops closest to a particular point
* Get schedule of a particular route
* Get all stops associated with a particular route
* Get all stops associated with a particular trip

See the RIPTA API documentation for more information on the RIPTA provided endpoints: [http://realtime.ripta.com:81/](http://realtime.ripta.com:81/)

The schedule and trip data come from static files provided by RIPTA at [https://www.ripta.com/stuff/contentmgr/files/0/3cda81dfa140edbe9aae214b26245b4a/files/google_transit.zip](https://www.ripta.com/stuff/contentmgr/files/0/3cda81dfa140edbe9aae214b26245b4a/files/google_transit.zip). Note: this URL has changed in the past and may change again. The most current file may be linked from [https://www.ripta.com/mobile-applications](https://www.ripta.com/mobile-applications). These files are updated each time RIPTA changes its schedules, which recently has been once or twice year.

This app includes a `bash` script to automatically download the static files and import them into a Postgres database.

### Local Installation
To install on a local machine, you need to have Postgres installed and running on your system or server.  From the Postgres command line, create a new database called `ripta`. The tables can be created and seeded automatically when running the `seed.sh` bash script. Tables are created with the sql commands found in the `static/google_transit/seed.sql` file.

Set environmental variable: `DATABASE_URL`, which is the connection string to connect to the `ripta` database you created. Replace `DBuser`, `password` and `DBHost` as appropriate to your setup. Also set  `RIPTA_DATA_URL`, the url to the static zip file provided by RIPTA.  The current URL is shown in the example:

```
$ export DATABASE_URL=progres://DBuser:password@DBHost/ripta
$ export RIPTA_DATA_URL=https://www.ripta.com/stuff/contentmgr/files/0/3cda81dfa140edbe9aae214b26245b4a/files/google_transit.zip
$ npm install (or $ yarn)
$ ./seed.sh
$ node index.js
```

### Heroku installation
You will need to [provision Postgres as an add-on](https://devcenter.heroku.com/articles/heroku-postgres-plans) with at least the `hobby-basic` tier. (Unfortunately, the free `hobby-dev` tier is limited to 10,000 rows, which is too small to hold the static data files.)

See https://devcenter.heroku.com/articles/git#prerequisites-installing-git-and-the-heroku-cli
 1. Use `heroku create` to create a new empty application on Heroku
 2. Run `git push heroku master` or `git push heroku a-different-branch:master` if deploying another branch
 3. Set `RIPTA_DATA_URL` in dashboard. `DATABASE_URL` should have been added automatically when provisioning postgres in Heroku.
 4. Set `TZ` environmental variable in the dashboard to `America/New_York`. This sets the timezone in Node to match the timezone the data is intended for.
 5. Open a `bash` connection: `$ heroku run bash` and seed the database:
```
$ ./seed.sh
```

----------
### API Endpoints

```
GET /api/stops
```
Find closest stops to a particular location, given latitude and longitude

Params

* lat (required) - latitude
* lon (required) - longitude
* limit - number of results

Example:
```
api/stops?lat=41.827360&lon=-71.400569&limit=2`
```
Response:
```
[
  {
  stop: {
    stop_id: 16905,
    stop_code: "",
    stop_name: "TUNNEL BEFORE THAYER",
    stop_desc: "",
    stop_lat: 41.827608,
    stop_lon: -71.400864,
    zone_id: "",
    stop_url: "",
    location_type: 0,
    parent_station: "",
    stop_associated_place: "tuth"
  },
  distance: 0.02291043943578053
  },
  {
  stop: {
    stop_id: 17045,
    stop_code: "",
    stop_name: "TUNNEL AFTER THAYER",
    stop_desc: "",
    stop_lat: 41.827682,
    stop_lon: -71.400886,
    zone_id: "",
    stop_url: "",
    location_type: 0,
    parent_station: "",
    stop_associated_place: "tuth"
  },
  distance: 0.027608130521622528
  }
]
```


----------

```
GET /api/trips/:routeId
```
Returns all bus trips on a particular route. Can be filtered by direction (inbound or outbound), time of day, and stop.

Params

* routeID (required)
* stopId - defaults to first stop
* serviceDay: Weekday | Saturday | Sunday - default is 'Weekday'
* directionId: 0 | 1 - default is both - 0 is inbound, 1 is outbound
* startTime: HH:MM - default is all day
* endTime: HH:MM - default is all day

Example:
```
api/trips/60/?serviceDay=Weekday&startTime=17:00&endTime=18:00?directionId=0
```

Response:
```
[
  {
  trip_id: 2580332,
  trip_headsign: "PROVIDENCE via EAST MAIN",
  departure_time: "17:00:00",
  stop_name: "GATEWAY CENTER AT 60 BUS BERTH",
  direction_id: 0
  },
  {
  trip_id: 2591409,
  trip_headsign: "PROVIDENCE via WEST MAIN",
  departure_time: "17:15:00",
  stop_name: "GATEWAY CENTER AT 60 BUS BERTH",
  direction_id: 0
  },
...
]
```
----------
```
GET /api/trip/:tripId
```
Get all stops, along with arrival and departure times on a particular trip.

Params

* :tripId (required)

Example:
```
/api/trip/2591429
```

Response:
```
{
  tripId: "2591429",
  stops: [{
    stop_id: 72165,
    stop_name: "KENNEDY PLAZA (STOP Y)",
    departure_time: "16:45:00",
    arrival_time: "16:45:00",
    stop_sequence: 1
  },
  {
    stop_id: 16530,
    stop_name: "MEMORIAL FS WESTMINSTER",
    departure_time: "16:45:00",
    arrival_time: "16:45:00",
    stop_sequence: 2
  },
  {
    stop_id: 16310,
    stop_name: "S WATER FS CRAWFORD",
    departure_time: "16:45:00",
    arrival_time: "16:45:00",
    stop_sequence: 3
  }
  ...
  ]
}
```

----------
```
GET /api/:type/route/:route/:dir?
```
Get live updates on buses filtered by route and direction.

Params:

* :type (required) - 'tripupdates' | 'vehiclepositions' | 'servicealerts'
* :route (required) RIPTA bus route number
* :dir - 'inbound' | 'outbound'


Example:
```
/api/tripupdates/route/60/inbound
```

Response:
```
{
header: {
  gtfs_realtime_version: "1",
  incrementality: 0,
  timestamp: 1508265064
},
entity: [
  {
    id: "2",
    is_deleted: false,
    trip_update: {
      trip: {
        trip_id: "2580389",
        start_time: "13:00:00",
        start_date: "20171017",
        schedule_relationship: 0,
        route_id: "60"
      },
      stop_time_update: [ ],
      vehicle: {
        id: "924",
        label: "924",
        license_plate: " "
      },
      timestamp: 1508265053
    },
    vehicle: null,
    alert: null
  },
  ...
  ]
}
```


----------
Copyright &copy; 2016-2017 by Timothy C. Barmann
