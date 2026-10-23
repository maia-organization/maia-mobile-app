import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import { HomeScreen } from './HomeScreen';
import { adaptTodayWorkout, getTodayWorkout, startSession } from '../services/userApi';

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (effect) => require('react').useEffect(effect, [effect])
}));

jest.mock('../services/userApi', () => ({
  adaptTodayWorkout: jest.fn(),
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

  it('permet de passer à la marche et reflète la recommandation modifiée', async () => {
    adaptTodayWorkout.mockResolvedValue({
      ...workout,
      intensity: 'low',
      title: 'Marche adaptée',
      type: 'walk'
    });
    const view = render(<HomeScreen navigation={navigation} onLogout={jest.fn()} />);

    await view.findByText(workout.encouragement);
    await act(async () => {
      fireEvent.press(view.getByRole('button', { name: 'Passer à la marche' }));
    });

    expect(adaptTodayWorkout).toHaveBeenCalledWith({ intensity: 'low', type: 'walk' });
    expect(view.getByText('Marche adaptée')).toBeTruthy();
  });

  it('affiche l’erreur de l’adaptation impossible', async () => {
    adaptTodayWorkout.mockRejectedValue(new Error('La modification est indisponible.'));
    const view = render(<HomeScreen navigation={navigation} onLogout={jest.fn()} />);

    await view.findByText(workout.encouragement);
    await act(async () => {
      fireEvent.press(view.getByRole('button', { name: 'Alléger' }));
    });

    expect(await view.findByText('La modification est indisponible.')).toBeTruthy();
  });
});
