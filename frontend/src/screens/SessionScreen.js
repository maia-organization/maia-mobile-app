import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';

import { BrandButton } from '../components/BrandButton';
import { SessionMetric } from '../components/SessionMetric';
import { stopSession } from '../services/userApi';
import { colors, fonts, radius, spacing, type } from '../theme';
import { formatDistance, formatDuration } from '../utils/sessionFormat';

const EARTH_RADIUS_KM = 6371;

function distanceBetween(first, second) {
  const latitudeDelta = ((second.lat - first.lat) * Math.PI) / 180;
  const longitudeDelta = ((second.lng - first.lng) * Math.PI) / 180;
  const firstLatitude = (first.lat * Math.PI) / 180;
  const secondLatitude = (second.lat * Math.PI) / 180;
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(firstLatitude) * Math.cos(secondLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(haversine));
}

// expo-location 19 cannot remove its listeners on web, so the location callback also
// ignores updates once tracking is paused or stopped.
function removeLocationSubscription(subscription) {
  try {
    subscription?.remove();
  } catch {
    // Web only: the listener stays registered and its updates are ignored.
  }
}

export function SessionScreen({ navigation, route }) {
  const coordinates = useRef([]);
  const isMounted = useRef(true);
  const lastCoordinate = useRef(null);
  const locationSubscription = useRef(null);
  const isPausedRef = useRef(false);
  const nextCoordinateStartsAfterPause = useRef(false);
  const [duration, setDuration] = useState(0);
  const [distance, setDistance] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [locationStatus, setLocationStatus] = useState('Connexion au GPS…');

  const stopLocationTracking = useCallback(() => {
    removeLocationSubscription(locationSubscription.current);
    locationSubscription.current = null;
  }, []);

  const startLocationTracking = useCallback(async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== 'granted') {
        if (isMounted.current) {
          setLocationStatus('GPS indisponible. Ta durée reste suivie.');
        }
        return;
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 5,
          timeInterval: 3000
        },
        (location) => {
          if (isPausedRef.current) return;

          const coordinate = {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
            paused: nextCoordinateStartsAfterPause.current,
            timestamp: new Date(location.timestamp).toISOString()
          };
          const previousCoordinate = lastCoordinate.current;
          coordinates.current.push(coordinate);
          lastCoordinate.current = coordinate;
          nextCoordinateStartsAfterPause.current = false;

          if (previousCoordinate && !coordinate.paused) {
            setDistance((current) => current + distanceBetween(previousCoordinate, coordinate));
          }
          if (isMounted.current) setLocationStatus('GPS connecté');
        }
      );

      if (!isMounted.current || isPausedRef.current) {
        removeLocationSubscription(subscription);
        return;
      }

      stopLocationTracking();
      locationSubscription.current = subscription;
    } catch {
      if (isMounted.current) {
        setLocationStatus('GPS indisponible. Ta durée reste suivie.');
      }
    }
  }, [stopLocationTracking]);

  useEffect(() => {
    isMounted.current = true;
    const startTrackingTimer = setTimeout(() => {
      void startLocationTracking();
    }, 0);

    return () => {
      clearTimeout(startTrackingTimer);
      isMounted.current = false;
      stopLocationTracking();
    };
  }, [startLocationTracking, stopLocationTracking]);

  useEffect(() => {
    if (isPaused) return undefined;

    const timer = setInterval(() => setDuration((current) => current + 1), 1000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const handlePause = () => {
    const nextPaused = !isPaused;
    isPausedRef.current = nextPaused;
    setIsPaused(nextPaused);

    if (nextPaused) {
      stopLocationTracking();
      setLocationStatus('Séance en pause');
    } else {
      nextCoordinateStartsAfterPause.current = true;
      setLocationStatus('Reconnexion au GPS…');
      void startLocationTracking();
    }
  };

  const handleStop = async () => {
    setIsStopping(true);
    isPausedRef.current = true;
    stopLocationTracking();

    try {
      const { session } = await stopSession(route.params.sessionId, coordinates.current);
      navigation.replace('SessionSummary', { session, sessionId: route.params.sessionId });
    } catch (error) {
      Alert.alert('Impossible d’enregistrer la séance', error.message);
      isPausedRef.current = isPaused;
      if (!isPaused) void startLocationTracking();
    } finally {
      setIsStopping(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <Text style={styles.eyebrow}>SÉANCE EN COURS</Text>
        <View style={styles.content}>
          <Text style={styles.title}>Cours à ton rythme.</Text>
          <Text style={styles.subtitle}>
            Écoute ton corps. Tes données sont enregistrées quand tu termines.
          </Text>
          <SessionMetric label="Durée" value={formatDuration(duration)} />
          <SessionMetric label="Distance" value={formatDistance(distance)} />
          <Text accessibilityLiveRegion="polite" style={styles.locationStatus}>
            {locationStatus}
          </Text>
        </View>
        <View style={styles.actions}>
          <BrandButton disabled={isStopping} onPress={handlePause} variant="secondary">
            {isPaused ? 'Reprendre' : 'Mettre en pause'}
          </BrandButton>
          <BrandButton disabled={isStopping} onPress={() => void handleStop()}>
            {isStopping ? 'Enregistrement…' : 'Arrêter la séance'}
          </BrandButton>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.ink, flex: 1 },
  screen: { flex: 1, justifyContent: 'space-between', padding: spacing.xl },
  eyebrow: { ...type.eyebrow, color: colors.rose },
  content: {
    backgroundColor: colors.honey,
    borderRadius: radius.sm,
    gap: spacing.md,
    padding: spacing.xl
  },
  actions: { gap: spacing.md },
  locationStatus: { color: colors.ink, fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  title: { color: colors.ink, fontFamily: fonts.heading, fontSize: 30, lineHeight: 36 },
  subtitle: { color: colors.ink, fontFamily: fonts.body, fontSize: 17, lineHeight: 25 }
});
