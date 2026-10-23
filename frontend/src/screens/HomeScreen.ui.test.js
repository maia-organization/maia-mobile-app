import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import { HomeScreen } from './HomeScreen';
import { getTodayWorkout, startSession } from '../services/userApi';

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (effect) => require('react').useEffect(effect, [effect])
}));

jest.mock('../services/userApi', () => ({
  getTodayWorkout: jest.fn(),
  startSession: jest.fn()
}));

const workout = {
  duration: 35,
  encouragement: 'Ton énergie remonte : c’est un beau moment pour explorer à ton rythme.',
  intensity: 'progressive',
  phase: 'follicular',
  title: 'Course progressive'
};

describe('HomeScreen UI', () => {
  const navigation = { navigate: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    getTodayWorkout.mockResolvedValue(workout);
  });

  it('affiche l’encouragement adapté puis démarre la séance', async () => {
    startSession.mockResolvedValue({ session_id: 'session-1' });
    const view = render(<HomeScreen navigation={navigation} onLogout={jest.fn()} />);

    expect(await view.findByText(workout.encouragement)).toBeTruthy();
    await act(async () => {
      fireEvent.press(view.getByRole('button', { name: 'Lancer ma séance' }));
    });

    expect(startSession).toHaveBeenCalledTimes(1);
    expect(navigation.navigate).toHaveBeenCalledWith('Session', { sessionId: 'session-1' });
  });

  it('affiche une erreur de chargement et permet de réessayer', async () => {
    getTodayWorkout
      .mockRejectedValueOnce(new Error("Impossible de joindre l'API Maïa."))
      .mockResolvedValueOnce(workout);
    const view = render(<HomeScreen navigation={navigation} onLogout={jest.fn()} />);

    expect(await view.findByText("Impossible de joindre l'API Maïa.")).toBeTruthy();
    await act(async () => {
      fireEvent.press(view.getByRole('button', { name: 'Réessayer' }));
    });

    await waitFor(() => expect(view.getByText(workout.encouragement)).toBeTruthy());
    expect(getTodayWorkout).toHaveBeenCalledTimes(2);
  });
});
