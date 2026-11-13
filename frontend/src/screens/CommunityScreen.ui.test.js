import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import { CommunityScreen } from './CommunityScreen';
import { blockCommunityUser, getCommunityFeed, reportCommunityPost } from '../services/userApi';

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (effect) => require('react').useEffect(effect, [effect])
}));

jest.mock('../services/userApi', () => ({
  blockCommunityUser: jest.fn(),
  commentCommunityPost: jest.fn(),
  getCommunityFeed: jest.fn(),
  likeCommunityPost: jest.fn(),
  reportCommunityPost: jest.fn()
}));

describe('CommunityScreen UI', () => {
  const post = {
    author_id: 'user-1',
    author_name: 'Lina',
    average_pace: 5.7,
    comments_count: 2,
    distance: 5.4,
    duration: 1860,
    id: 'post-1',
    likes_count: 4,
    message: 'Une sortie douce qui fait du bien.'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    getCommunityFeed.mockResolvedValue({ posts: [post] });
  });

  it('affiche le fil d’actualité avec ses interactions', async () => {
    const view = render(<CommunityScreen />);

    expect(await view.findByText('Une sortie douce qui fait du bien.')).toBeTruthy();
    expect(view.getByText('4 j’aime · 2 commentaires')).toBeTruthy();
    expect(view.getByText('5.40 km · 31 min · 5.7 min/km')).toBeTruthy();
  });

  it('permet de choisir un motif puis confirme le signalement', async () => {
    reportCommunityPost.mockResolvedValue({ reported: true });
    const view = render(<CommunityScreen />);

    await view.findByText(post.message);
    fireEvent.press(view.getByRole('button', { name: 'Signaler' }));
    fireEvent.press(view.getByRole('button', { name: 'Motif : Harcèlement' }));
    await act(async () =>
      fireEvent.press(view.getByRole('button', { name: 'Envoyer le signalement' }))
    );

    expect(reportCommunityPost).toHaveBeenCalledWith('post-1', 'Harcèlement');
    expect(
      await view.findByText('Signalement envoyé. Merci de contribuer à une communauté sûre.')
    ).toBeTruthy();
  });

  it('affiche une erreur lorsque le signalement échoue', async () => {
    reportCommunityPost.mockRejectedValueOnce(new Error('Le signalement est indisponible.'));
    const view = render(<CommunityScreen />);

    await view.findByText(post.message);
    fireEvent.press(view.getByRole('button', { name: 'Signaler' }));
    fireEvent.press(view.getByRole('button', { name: 'Motif : Autre' }));
    await act(async () =>
      fireEvent.press(view.getByRole('button', { name: 'Envoyer le signalement' }))
    );

    expect(await view.findByText('Le signalement est indisponible.')).toBeTruthy();
  });

  it('masque immédiatement les publications de la runneuse bloquée', async () => {
    blockCommunityUser.mockResolvedValue({ blocked: true });
    const view = render(<CommunityScreen />);

    await view.findByText(post.message);
    await act(async () => fireEvent.press(view.getByRole('button', { name: 'Bloquer' })));

    expect(blockCommunityUser).toHaveBeenCalledWith('user-1');
    await waitFor(() => expect(view.queryByText(post.message)).toBeNull());
  });

  it('affiche une erreur réseau et recharge le fil', async () => {
    getCommunityFeed
      .mockRejectedValueOnce(new Error("Impossible de joindre l'API Maïa."))
      .mockResolvedValueOnce({ posts: [] });
    const view = render(<CommunityScreen />);

    expect(await view.findByText("Impossible de joindre l'API Maïa.")).toBeTruthy();
    await act(async () => {
      fireEvent.press(view.getByRole('button', { name: 'Réessayer' }));
    });

    await waitFor(() => expect(view.getByText('Le fil prend son élan.')).toBeTruthy());
    expect(getCommunityFeed).toHaveBeenCalledTimes(2);
  });
});
