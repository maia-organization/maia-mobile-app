import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import { requestPasswordReset } from '../services/authApi';
import { PasswordResetRequestScreen } from './PasswordResetRequestScreen';

jest.mock('../services/authApi', () => ({ requestPasswordReset: jest.fn() }));

describe('PasswordResetRequestScreen UI', () => {
  beforeEach(() => jest.clearAllMocks());

  it('envoie l’adresse normalisée puis confirme l’envoi', async () => {
    requestPasswordReset.mockResolvedValueOnce({});
    const view = render(<PasswordResetRequestScreen navigation={{ navigate: jest.fn() }} />);

    await fireEvent.changeText(view.getByPlaceholderText('toi@email.com'), ' TEST@EMAIL.COM ');
    await act(async () => {
      fireEvent.press(view.getByRole('button', { name: 'Envoyer le lien' }));
    });

    await waitFor(() =>
      expect(requestPasswordReset).toHaveBeenCalledWith({ email: 'test@email.com' })
    );
    expect(view.getByText(/Si un compte correspond/)).toBeTruthy();
  });

  it('affiche l’erreur serveur', async () => {
    requestPasswordReset.mockRejectedValueOnce(new Error("L'e-mail ne peut pas être envoyé."));
    const view = render(<PasswordResetRequestScreen navigation={{ navigate: jest.fn() }} />);

    await fireEvent.changeText(view.getByPlaceholderText('toi@email.com'), 'test@email.com');
    await act(async () => {
      fireEvent.press(view.getByRole('button', { name: 'Envoyer le lien' }));
    });

    expect(await view.findByText("L'e-mail ne peut pas être envoyé.")).toBeTruthy();
  });
});
