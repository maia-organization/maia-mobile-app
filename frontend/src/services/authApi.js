import { API_URL } from '../config/env';

async function requestAuth(path, payload) {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
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

export function registerUser(payload) {
  return requestAuth('/auth/register', payload);
}

export function loginUser(payload) {
  return requestAuth('/auth/login', payload);
}
