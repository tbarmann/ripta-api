CREATE TABLE IF NOT EXISTS delay_log (
  id BIGSERIAL PRIMARY KEY,
  trip_id SERIAL,
  route_id SERIAL,
  stop_id SERIAL,
  delay SMALLINT,
  ts serial
);
