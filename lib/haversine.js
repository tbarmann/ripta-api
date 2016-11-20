const radiusEarthMiles = 3961

const degreeToRadians = Math.PI/180;

exports.haversineDistance = function haversineDistance(point1, point2) {
  const lat1 = degreeToRadians * point1.lat;
  const lat2 = degreeToRadians * point2.lat;
  const lon1 = degreeToRadians * point1.lon;
  const lon2 = degreeToRadians * point2.lon;
  const dlat = lat2 - lat1;
  const dlon = lon2 - lon1;
  const a = Math.pow(Math.sin(dlat / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon / 2), 2);

  return radiusEarthMiles * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
