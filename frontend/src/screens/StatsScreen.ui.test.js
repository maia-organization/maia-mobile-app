import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import { getSessionHistory, getStats } from '../services/userApi';
import { StatsScreen } from './StatsScreen';

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (effect) => require('react').useEffect(effect, [effect])
}));

jest.mock('../services/userApi', () => ({
  getSessionHistory: jest.fn(),
  getStats: jest.fn()
}));

describe('StatsScreen UI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getSessionHistory.mockResolvedValue({ sessions: [] });
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
