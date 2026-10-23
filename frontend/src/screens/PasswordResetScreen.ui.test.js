import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import { confirmPasswordReset } from '../services/authApi';
import { PasswordResetScreen } from './PasswordResetScreen';

jest.mock('../services/authApi', () => ({ confirmPasswordReset: jest.fn() }));

describe('PasswordResetScreen UI', () => {
  beforeEach(() => jest.clearAllMocks());

  it('réinitialise le mot de passe avec le jeton du lien', async () => {
    confirmPasswordReset.mockResolvedValueOnce({});
    const view = render(
      <PasswordResetScreen
        navigation={{ navigate: jest.fn() }}
        route={{ params: { token: 'token-123' } }}
      />
    );

    await fireEvent.changeText(
      view.getByPlaceholderText('Ton nouveau mot de passe'),
      'NouvelleCourse2026!'
    );
    await fireEvent.changeText(
      view.getByPlaceholderText('Confirme ton nouveau mot de passe'),
      'NouvelleCourse2026!'
    );
    await act(async () => {
      fireEvent.press(view.getByRole('button', { name: 'Réinitialiser le mot de passe' }));
    });

    await waitFor(() =>
      expect(confirmPasswordReset).toHaveBeenCalledWith({
        password: 'NouvelleCourse2026!',
        token: 'token-123'
      })
    );
    expect(view.getByText('Ton mot de passe a été réinitialisé.')).toBeTruthy();
  });

  it('affiche l’erreur du serveur sans effacer le formulaire', async () => {
    confirmPasswordReset.mockRejectedValueOnce(new Error('Ce lien est expiré.'));
    const view = render(
      <PasswordResetScreen
        navigation={{ navigate: jest.fn() }}
        route={{ params: { token: 'token-123' } }}
      />
    );

    await fireEvent.changeText(
      view.getByPlaceholderText('Ton nouveau mot de passe'),
      'NouvelleCourse2026!'
    );
    await fireEvent.changeText(
      view.getByPlaceholderText('Confirme ton nouveau mot de passe'),
      'NouvelleCourse2026!'
    );
    await act(async () => {
      fireEvent.press(view.getByRole('button', { name: 'Réinitialiser le mot de passe' }));
    });

    expect(await view.findByText('Ce lien est expiré.')).toBeTruthy();
  });
});
