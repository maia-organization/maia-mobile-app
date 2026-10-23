import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

import { ProfileScreen } from './ProfileScreen';
import { deleteAccount, getNotificationSettings, getProfile } from '../services/userApi';

jest.mock('../services/userApi', () => ({
  deleteAccount: jest.fn(),
  getNotificationSettings: jest.fn(),
  getPrivacySettings: jest.fn(),
  getProfile: jest.fn(),
  updateNotificationSettings: jest.fn(),
  updatePrivacySettings: jest.fn()
}));

jest.mock('@react-navigation/native', () => {
  const React = require('react');

  return {
    useFocusEffect: (callback) => React.useEffect(callback, [callback])
  };
});

const profile = {
  birthdate: '1995-04-12',
  cycleLength: 28,
  cycleStartDate: '2026-09-20',
  email: 'maia@example.com',
  goal: 'regularite',
  height: 165,
  level: 'debutante',
  name: 'Maïa',
  weight: 60
};

describe('ProfileScreen UI', () => {
  const navigation = { getParent: jest.fn(), navigate: jest.fn(), reset: jest.fn() };
  const onLogout = jest.fn().mockResolvedValue();

  beforeEach(() => {
    jest.clearAllMocks();
    getProfile.mockResolvedValue({ user: profile });
    getNotificationSettings.mockResolvedValue({ settings: { enabled: true } });
    require('../services/userApi').getPrivacySettings.mockResolvedValue({
      settings: { profile_visibility: 'public', show_cycle: false, show_stats: true }
    });
  });

  it('demande confirmation, supprime le compte puis déconnecte l’utilisatrice', async () => {
    deleteAccount.mockResolvedValue({ message: 'Compte supprimé.' });
    jest.spyOn(Alert, 'alert').mockImplementation((title, _, actions) => {
      actions?.[title === 'Supprimer ton compte ?' ? 1 : 0]?.onPress();
    });
    const view = render(<ProfileScreen navigation={navigation} onLogout={onLogout} />);

    expect(await view.findByText('Supprimer mon compte')).toBeTruthy();
    await act(async () => {
      fireEvent.press(view.getByText('Supprimer mon compte'));
    });

    await waitFor(() => expect(deleteAccount).toHaveBeenCalledTimes(1));
    expect(Alert.alert).toHaveBeenCalledWith(
      'Supprimer ton compte ?',
      expect.any(String),
      expect.any(Array)
    );
    expect(Alert.alert).toHaveBeenCalledWith(
      'Compte supprimé',
      expect.any(String),
      expect.any(Array)
    );
    await waitFor(() => expect(onLogout).toHaveBeenCalledTimes(1));
    expect(navigation.reset).toHaveBeenCalledWith({ index: 0, routes: [{ name: 'Welcome' }] });
  });

  it('affiche l’erreur renvoyée par la suppression', async () => {
    deleteAccount.mockRejectedValue(new Error('La suppression est indisponible.'));
    jest.spyOn(Alert, 'alert').mockImplementation((_, __, actions) => actions?.[1]?.onPress());
    const view = render(<ProfileScreen navigation={navigation} onLogout={onLogout} />);

    expect(await view.findByText('Supprimer mon compte')).toBeTruthy();
    await act(async () => {
      fireEvent.press(view.getByText('Supprimer mon compte'));
    });

    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith(
        'Impossible de supprimer le compte',
        'La suppression est indisponible.'
      )
    );
    expect(onLogout).not.toHaveBeenCalled();
  });
});
