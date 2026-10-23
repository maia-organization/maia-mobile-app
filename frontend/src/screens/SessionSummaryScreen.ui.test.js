import { act, fireEvent, render } from '@testing-library/react-native';
import { Alert } from 'react-native';

import { SessionSummaryScreen } from './SessionSummaryScreen';
import { completeSession } from '../services/userApi';

jest.mock('../services/userApi', () => ({ completeSession: jest.fn() }));

describe('SessionSummaryScreen UI', () => {
  const session = { average_pace: 360, distance: 5.4, duration: 1860 };
  const navigation = { replace: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('affiche un encouragement basé sur la performance', () => {
    const view = render(
      <SessionSummaryScreen
        navigation={navigation}
        route={{ params: { session, sessionId: 'session-1' } }}
      />
    );

    expect(view.getByText(/belle distance/i)).toBeTruthy();
  });

  it('signale une erreur serveur lors de la validation', async () => {
    completeSession.mockRejectedValueOnce(new Error('La validation est indisponible.'));
    jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
    const view = render(
      <SessionSummaryScreen
        navigation={navigation}
        route={{ params: { session, sessionId: 'session-1' } }}
      />
    );

    await act(async () => {
      fireEvent.press(view.getByRole('button', { name: 'Valider ma séance' }));
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Impossible de valider la séance',
      'La validation est indisponible.'
    );
    expect(navigation.replace).not.toHaveBeenCalled();
  });
});
