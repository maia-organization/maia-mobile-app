import { API_URL } from '../config/env';
import { getAuthToken } from './authStorage';

async function requestUser(path, options = {}) {
  const token = await getAuthToken();
  // Bodiless requests must not declare JSON: Fastify rejects empty JSON bodies with a 400.
  const contentType = options.body === undefined ? {} : { 'Content-Type': 'application/json' };
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...contentType,
        ...options.headers
      }
    });
  } catch {
    throw new Error("Impossible de joindre l'API Maïa. Vérifie que la preview est bien lancée.");
  }

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error("L'API Maïa a renvoyé une réponse inattendue. Réessaie dans un instant.");
  }

  if (!response.ok || !result.success) {
    throw new Error(result.error?.message || 'Une erreur est survenue.');
  }

  return result.data;
}

export function getProfile() {
  return requestUser('/users/me');
}

export function updateProfile(payload) {
  return requestUser('/users/me', {
    body: JSON.stringify(payload),
    method: 'PUT'
  });
}

export function getCycleView() {
  return requestUser('/cycle/view');
}

export function getTodayWorkout() {
  return requestUser('/workouts/today');
}

export function startSession() {
  return requestUser('/sessions/start', { method: 'POST' });
}

export function stopSession(sessionId, coordinates) {
  return requestUser('/sessions/stop', {
    body: JSON.stringify({ coordinates, session_id: sessionId }),
    method: 'POST'
  });
}

export function completeSession(sessionId) {
  return requestUser(`/sessions/${sessionId}/complete`, { method: 'PUT' });
}

export function saveSessionFeedback(sessionId, feedback) {
  return requestUser(`/sessions/${sessionId}/feedback`, {
    body: JSON.stringify(feedback),
    method: 'PUT'
  });
}

export function updateCycle(payload) {
  return requestUser('/cycle', {
    body: JSON.stringify(payload),
    method: 'PUT'
  });
}

export function getNotificationSettings() {
  return requestUser('/notifications/settings');
}

export function updateNotificationSettings(payload) {
  return requestUser('/notifications/settings', {
    body: JSON.stringify(payload),
    method: 'PUT'
  });
}
