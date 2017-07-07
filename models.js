const pg = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/ripta';
const client = new pg.Client(connectionString);

client.connect();

const query = client.query(
  `CREATE TABLE stop_times(
    id SERIAL PRIMARY KEY,
    trip_id INTEGER,
    arrival_time VARCHAR(8),
    departure_time VARCHAR(8),
    stop_id INTEGER,
    stop_sequence INTEGER,
    pickup_type SMALLINT,
    drop_off_type SMALLINT
  )`
);

query.on('end', () => {
  client.end();
});

