import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import { PublishRunScreen } from './PublishRunScreen';
import { createCommunityPost } from '../services/userApi';

jest.mock('../services/userApi', () => ({ createCommunityPost: jest.fn() }));

describe('PublishRunScreen UI', () => {
  const navigation = { replace: jest.fn() };
  const session = { distance: 5.4, duration: 1860 };

  beforeEach(() => jest.clearAllMocks());

  it('publie une séance avec son ressenti et sa visibilité', async () => {
    createCommunityPost.mockResolvedValue({ post: { id: 'post-1' } });
    const view = render(
      <PublishRunScreen
        navigation={navigation}
        route={{ params: { session, sessionId: 'session-1' } }}
      />
    );

    fireEvent.changeText(view.getByLabelText('Mon ressenti'), 'Très belle énergie aujourd’hui.');
    await act(async () => {
      fireEvent.press(view.getByRole('button', { name: 'Publier ma course' }));
    });

    await waitFor(() =>
      expect(createCommunityPost).toHaveBeenCalledWith({
        message: 'Très belle énergie aujourd’hui.',
        session_id: 'session-1',
        visibility: 'public'
      })
    );
    expect(navigation.replace).toHaveBeenCalledWith('MainTabs', { screen: 'Community' });
  });

  it('affiche une erreur lorsque la publication échoue', async () => {
    createCommunityPost.mockRejectedValue(new Error('La publication est indisponible.'));
    const view = render(
      <PublishRunScreen
        navigation={navigation}
        route={{ params: { session, sessionId: 'session-1' } }}
      />
    );
    await act(async () => {
      fireEvent.press(view.getByRole('button', { name: 'Publier ma course' }));
    });
    expect(await view.findByText('La publication est indisponible.')).toBeTruthy();
  });
});
