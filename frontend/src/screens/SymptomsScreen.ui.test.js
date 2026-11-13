import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { SymptomsScreen } from './SymptomsScreen';
import { getSymptoms, saveTodaySymptoms } from '../services/userApi';

jest.mock('../services/userApi', () => ({ getSymptoms: jest.fn(), saveTodaySymptoms: jest.fn() }));
jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return { useFocusEffect: (callback) => React.useEffect(callback, [callback]) };
});

describe('SymptomsScreen UI', () => {
  const navigation = { navigate: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    getSymptoms.mockResolvedValue({ entries: [] });
  });

  it('enregistre rapidement un symptôme sélectionné', async () => {
    saveTodaySymptoms.mockResolvedValue({
      recorded_on: new Date().toISOString().slice(0, 10),
      symptoms: ['fatigue']
    });
    const view = render(<SymptomsScreen navigation={navigation} />);
    await waitFor(() => expect(getSymptoms).toHaveBeenCalledTimes(1));
    fireEvent.press(view.getByText('Fatigue'));
    fireEvent.press(view.getByText('Enregistrer mon ressenti'));
    await waitFor(() => expect(saveTodaySymptoms).toHaveBeenCalledWith(['fatigue']));
  });

  it('affiche une erreur serveur et permet de réessayer', async () => {
    getSymptoms
      .mockRejectedValueOnce(new Error('Service indisponible.'))
      .mockResolvedValueOnce({ entries: [] });
    const view = render(<SymptomsScreen navigation={navigation} />);
    await view.findByText('Service indisponible.');
    fireEvent.press(view.getByText('Réessayer'));
    await waitFor(() => expect(getSymptoms).toHaveBeenCalledTimes(2));
  });
});
