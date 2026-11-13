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

export function deleteAccount() {
  return requestUser('/users/me', { method: 'DELETE' });
}

export function getCycleView() {
  return requestUser('/cycle/view');
}

export function getTodayWorkout() {
  return requestUser('/workouts/today');
}

export function getCommunityFeed() {
  return requestUser('/community/feed');
}

export function createCommunityPost(payload) {
  return requestUser('/community/posts', { body: JSON.stringify(payload), method: 'POST' });
}

export function likeCommunityPost(postId) {
  return requestUser(`/community/posts/${postId}/likes`, { method: 'POST' });
}

export function commentCommunityPost(postId, message) {
  return requestUser(`/community/posts/${postId}/comments`, {
    body: JSON.stringify({ message }),
    method: 'POST'
  });
}

export function getMessageMembers() {
  return requestUser('/messages/members');
}

export function getConversations() {
  return requestUser('/messages/conversations');
}

export function createConversation(recipientId) {
  return requestUser('/messages/conversations', {
    body: JSON.stringify({ recipient_id: recipientId }),
    method: 'POST'
  });
}

export function getConversationMessages(conversationId) {
  return requestUser(`/messages/conversations/${conversationId}/messages`);
}

export function sendConversationMessage(conversationId, message) {
  return requestUser(`/messages/conversations/${conversationId}/messages`, {
    body: JSON.stringify({ message }),
    method: 'POST'
  });
}

export function getRunningGroups() {
  return requestUser('/groups');
}

export function createRunningGroup(payload) {
  return requestUser('/groups', { body: JSON.stringify(payload), method: 'POST' });
}

export function joinRunningGroup(groupId) {
  return requestUser(`/groups/${groupId}/join`, { method: 'POST' });
}
export function getFollows() {
  return requestUser('/follows');
}
export function followUser(id) {
  return requestUser(`/follows/${id}`, { method: 'POST' });
}
export function unfollowUser(id) {
  return requestUser(`/follows/${id}`, { method: 'DELETE' });
}
export function reportCommunityPost(postId, reason) {
  return requestUser('/moderation/reports', {
    body: JSON.stringify({ post_id: postId, reason }),
    method: 'POST'
  });
}
export function blockCommunityUser(id) {
  return requestUser(`/moderation/blocks/${id}`, { method: 'POST' });
}

export function adaptTodayWorkout(payload) {
  return requestUser('/workouts/today', { body: JSON.stringify(payload), method: 'PUT' });
}

export function getStats() {
  return requestUser('/stats/me');
}

export function getSessionHistory() {
  return requestUser('/sessions?limit=50&offset=0');
}

export function getPlanning(weekStart) {
  return requestUser(`/planning?week_start=${weekStart}`);
}

export function createPlannedWorkout(payload) {
  return requestUser('/planning', { body: JSON.stringify(payload), method: 'POST' });
}

export function movePlannedWorkout(id, plannedDate) {
  return requestUser(`/planning/${id}`, {
    body: JSON.stringify({ planned_date: plannedDate }),
    method: 'PUT'
  });
}

export function deletePlannedWorkout(id) {
  return requestUser(`/planning/${id}`, { method: 'DELETE' });
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

export function getPrivacySettings() {
  return requestUser('/privacy/settings');
}
export function updatePrivacySettings(payload) {
  return requestUser('/privacy/settings', { body: JSON.stringify(payload), method: 'PUT' });
}
