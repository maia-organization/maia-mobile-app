const EARTH_RADIUS_KM = 6371;
const MAX_COORDINATES = 20000;

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function distanceBetween(first, second) {
  const latitudeDelta = toRadians(second.lat - first.lat);
  const longitudeDelta = toRadians(second.lng - first.lng);
  const firstLatitude = toRadians(first.lat);
  const secondLatitude = toRadians(second.lat);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(firstLatitude) * Math.cos(secondLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(haversine));
}

function isValidCoordinates(coordinates) {
  if (!Array.isArray(coordinates) || coordinates.length > MAX_COORDINATES) {
    return false;
  }

  return coordinates.every((coordinate, index) => {
    const timestamp = Date.parse(coordinate?.timestamp);
    const previousTimestamp = index > 0 ? Date.parse(coordinates[index - 1]?.timestamp) : timestamp;

    return (
      Number.isFinite(coordinate?.lat) &&
      coordinate.lat >= -90 &&
      coordinate.lat <= 90 &&
      Number.isFinite(coordinate?.lng) &&
      coordinate.lng >= -180 &&
      coordinate.lng <= 180 &&
      (coordinate.paused === undefined || typeof coordinate.paused === 'boolean') &&
      Number.isFinite(timestamp) &&
      timestamp >= previousTimestamp
    );
  });
}

function calculateDistance(coordinates) {
  const distance = coordinates.slice(1).reduce((total, coordinate, index) => {
    const previousCoordinate = coordinates[index];

    return coordinate.paused ? total : total + distanceBetween(previousCoordinate, coordinate);
  }, 0);

  return Math.round(distance * 1000) / 1000;
}

function getSessionMetrics(startTime, endTime, coordinates = []) {
  const duration = Math.max(0, Math.round((endTime.getTime() - startTime.getTime()) / 1000));
  const distance = calculateDistance(coordinates);
  const averagePace = distance > 0 ? Math.round((duration / 60 / distance) * 100) / 100 : null;

  return { averagePace, distance, duration };
}

module.exports = { calculateDistance, getSessionMetrics, isValidCoordinates };
