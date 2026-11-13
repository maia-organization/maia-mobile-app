import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import { getSessionHistory, getStats, getWeeklyGoal, saveWeeklyGoal } from '../services/userApi';
import { StatsScreen } from './StatsScreen';

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (effect) => require('react').useEffect(effect, [effect])
}));

jest.mock('../services/userApi', () => ({
  getSessionHistory: jest.fn(),
  getStats: jest.fn(),
  getWeeklyGoal: jest.fn(),
  saveWeeklyGoal: jest.fn()
}));

describe('StatsScreen UI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getSessionHistory.mockResolvedValue({ sessions: [] });
    getWeeklyGoal.mockResolvedValue({ goal: null });
  });

  it('enregistre un objectif hebdomadaire et son rappel', async () => {
    getStats.mockResolvedValue({ average_distance: 0, total_distance: 0, total_sessions: 0 });
    saveWeeklyGoal.mockResolvedValue({
      goal: { current_value: 0, reminder_enabled: true, target_type: 'sessions', target_value: 3 }
    });
    const view = render(<StatsScreen />);

    await view.findByText('Ton objectif de la semaine');
    fireEvent.press(view.getByRole('switch', { name: /recevoir un rappel/i }));
    await act(async () =>
      fireEvent.press(view.getByRole('button', { name: 'Enregistrer mon objectif' }))
    );

    expect(saveWeeklyGoal).toHaveBeenCalledWith({
      reminder_enabled: true,
      target_type: 'sessions',
      target_value: 3
    });
    expect(await view.findByText('0% de ton objectif atteint')).toBeTruthy();
  });

  it('affiche les statistiques chargées', async () => {
    getStats.mockResolvedValueOnce({
      average_distance: 4.25,
      total_distance: 12.5,
      total_sessions: 3
    });

    const view = render(<StatsScreen />);

    expect(await view.findByText('3')).toBeTruthy();
    expect(view.getByText('12,5 km')).toBeTruthy();
    expect(view.getByText('4,3 km')).toBeTruthy();
  });

  it('affiche une erreur réseau et permet de relancer le chargement', async () => {
    getStats
      .mockRejectedValueOnce(new Error("Impossible de joindre l'API Maïa."))
      .mockResolvedValueOnce({
        average_distance: 5,
        total_distance: 5,
        total_sessions: 1
      });

    const view = render(<StatsScreen />);

    expect(await view.findByText("Impossible de joindre l'API Maïa.")).toBeTruthy();
    await act(async () => {
      fireEvent.press(view.getByRole('button', { name: 'Réessayer' }));
    });

    await waitFor(() => expect(view.getByText('1')).toBeTruthy());
    expect(getStats).toHaveBeenCalledTimes(2);
  });
});
