import { API_URL } from '../config/env';
import { getAuthToken } from './authStorage';

async function requestUser(path, options = {}) {
  const token = await getAuthToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  const result = await response.json();

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
