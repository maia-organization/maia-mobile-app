import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import { loginUser } from '../services/authApi';
import { LoginScreen } from './LoginScreen';

jest.mock('../services/authApi', () => ({
  loginUser: jest.fn()
}));

async function renderScreen() {
  const navigation = { navigate: jest.fn(), reset: jest.fn() };
  const onAuthenticated = jest.fn().mockResolvedValue(undefined);

  const view = await render(
    <LoginScreen navigation={navigation} onAuthenticated={onAuthenticated} />
  );

  return { navigation, onAuthenticated, view };
}

describe('LoginScreen UI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('n’envoie pas le formulaire invalide et affiche les erreurs associées', async () => {
    const { view } = await renderScreen();

    await act(async () => {
      fireEvent.press(view.getByRole('button', { name: 'Se connecter' }));
    });

    expect(loginUser).not.toHaveBeenCalled();
    expect(view.getByText('Vérifie les champs indiqués.')).toBeTruthy();
    expect(view.getByText('Entre une adresse email valide.')).toBeTruthy();
    expect(view.getByText('Entre ton mot de passe.')).toBeTruthy();
  });

  it('affiche une erreur serveur sans naviguer', async () => {
    loginUser.mockRejectedValueOnce(new Error("L'API Maïa est indisponible."));
    const { navigation, view } = await renderScreen();

    await fireEvent.changeText(view.getByPlaceholderText('toi@email.com'), '  TEST@EMAIL.COM ');
    await fireEvent.changeText(view.getByPlaceholderText('Ton mot de passe'), 'mot-de-passe');
    await act(async () => {
      fireEvent.press(view.getByRole('button', { name: 'Se connecter' }));
    });

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith({
        email: 'test@email.com',
        password: 'mot-de-passe'
      });
    });
    expect(await view.findByText("L'API Maïa est indisponible.")).toBeTruthy();
    expect(navigation.reset).not.toHaveBeenCalled();
  });

  it('authentifie puis ouvre l’application après une réponse valide', async () => {
    const authData = { token: 'test-token', user: { id: 'user-1' } };
    loginUser.mockResolvedValueOnce(authData);
    const { navigation, onAuthenticated, view } = await renderScreen();

    await fireEvent.changeText(view.getByPlaceholderText('toi@email.com'), 'test@email.com');
    await fireEvent.changeText(view.getByPlaceholderText('Ton mot de passe'), 'mot-de-passe');
    await act(async () => {
      fireEvent.press(view.getByRole('button', { name: 'Se connecter' }));
    });

    await waitFor(() => expect(onAuthenticated).toHaveBeenCalledWith(authData));
    expect(navigation.reset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: 'MainTabs' }]
    });
  });

  it('ouvre l’inscription avec le bouton secondaire', async () => {
    const { navigation, view } = await renderScreen();

    await fireEvent.press(view.getByRole('button', { name: /Pas encore de compte/ }));

    expect(navigation.navigate).toHaveBeenCalledWith('Register');
  });
});
