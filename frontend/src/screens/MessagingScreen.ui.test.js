import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import { MessagingScreen } from './MessagingScreen';
import {
  createConversation,
  getConversationMessages,
  getConversations,
  getMessageMembers,
  markConversationNotificationsRead,
  sendConversationMessage
} from '../services/userApi';

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (effect) => require('react').useEffect(effect, [effect])
}));
jest.mock('../services/userApi', () => ({
  createConversation: jest.fn(),
  getConversationMessages: jest.fn(),
  getConversations: jest.fn(),
  getMessageMembers: jest.fn(),
  markConversationNotificationsRead: jest.fn(),
  sendConversationMessage: jest.fn()
}));

describe('MessagingScreen UI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getConversations.mockResolvedValue({ conversations: [] });
    getConversationMessages.mockResolvedValue({ messages: [] });
  });

  it('permet de choisir une runneuse puis d’envoyer un message', async () => {
    getMessageMembers.mockResolvedValue({ members: [{ id: 'member-1', name: 'Lina' }] });
    createConversation.mockResolvedValue({ conversation: { id: 'conversation-1' } });
    sendConversationMessage.mockResolvedValue({ message: { id: 'message-1' } });
    const view = render(<MessagingScreen />);

    await act(async () =>
      fireEvent.press(await view.findByRole('button', { name: 'Nouveau message' }))
    );
    expect(await view.findByText('Lina')).toBeTruthy();
    await act(async () => fireEvent.press(view.getByRole('button', { name: 'Lina' })));
    expect(await view.findByText('Lina')).toBeTruthy();

    fireEvent.changeText(view.getByLabelText('Écrire un message'), 'Bravo pour ta sortie !');
    await act(async () => fireEvent.press(view.getByRole('button', { name: 'Envoyer' })));
    expect(sendConversationMessage).toHaveBeenCalledWith(
      'conversation-1',
      'Bravo pour ta sortie !'
    );
  });

  it('affiche une erreur réseau lors de la récupération des conversations', async () => {
    getConversations.mockRejectedValueOnce(new Error("Impossible de joindre l'API Maïa."));
    const view = render(<MessagingScreen />);

    await waitFor(() => expect(view.getByText("Impossible de joindre l'API Maïa.")).toBeTruthy());
  });

  it('affiche les nouveaux messages et les marque comme lus à l’ouverture', async () => {
    getConversations.mockResolvedValue({
      conversations: [{ id: 'conversation-1', recipient_name: 'Lina', unread_count: 2 }]
    });
    markConversationNotificationsRead.mockResolvedValue({ read: true });
    const view = render(<MessagingScreen />);

    expect(await view.findByText('2 nouveaux messages')).toBeTruthy();
    await act(async () => fireEvent.press(view.getByRole('button', { name: 'Lina' })));

    expect(markConversationNotificationsRead).toHaveBeenCalledWith('conversation-1');
  });

  it('affiche une erreur si le marquage des notifications échoue', async () => {
    getConversations.mockResolvedValue({
      conversations: [{ id: 'conversation-1', recipient_name: 'Lina', unread_count: 1 }]
    });
    markConversationNotificationsRead.mockRejectedValueOnce(
      new Error('Les notifications ne peuvent pas être mises à jour.')
    );
    const view = render(<MessagingScreen />);

    await view.findByText('1 nouveau message');
    await act(async () => fireEvent.press(view.getByRole('button', { name: 'Lina' })));

    expect(
      await view.findByText('Les notifications ne peuvent pas être mises à jour.')
    ).toBeTruthy();
  });
});
