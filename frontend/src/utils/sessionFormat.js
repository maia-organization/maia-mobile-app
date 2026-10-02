export function formatDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');

  return `${minutes}:${seconds}`;
}

export function formatDistance(distance) {
  return `${distance.toFixed(2)} km`;
}

// The API returns the average pace in minutes per kilometre.
function splitPace(averagePace) {
  const totalSeconds = Math.round(averagePace * 60);

  return { minutes: Math.floor(totalSeconds / 60), seconds: totalSeconds % 60 };
}

export function formatPace(averagePace) {
  if (!averagePace) return '—';

  const { minutes, seconds } = splitPace(averagePace);
  return `${minutes}'${seconds.toString().padStart(2, '0')}" /km`;
}

export function describePace(averagePace) {
  if (!averagePace) return 'non disponible';

  const { minutes, seconds } = splitPace(averagePace);
  return `${minutes} min ${seconds} s par kilomètre`;
}
