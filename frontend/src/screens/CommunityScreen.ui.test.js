import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import { CommunityScreen } from './CommunityScreen';
import { getCommunityFeed } from '../services/userApi';

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (effect) => require('react').useEffect(effect, [effect])
}));

jest.mock('../services/userApi', () => ({ getCommunityFeed: jest.fn() }));

describe('CommunityScreen UI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('affiche le fil d’actualité avec ses interactions', async () => {
    getCommunityFeed.mockResolvedValue({
      posts: [
        {
          author_name: 'Lina',
          comments_count: 2,
          distance: 5.4,
          duration: 1860,
          id: 'post-1',
          likes_count: 4,
          average_pace: 5.7,
          message: 'Une sortie douce qui fait du bien.'
        }
      ]
    });
    const view = render(<CommunityScreen />);

    expect(await view.findByText('Une sortie douce qui fait du bien.')).toBeTruthy();
    expect(view.getByText('4 j’aime · 2 commentaires')).toBeTruthy();
    expect(view.getByText('5.40 km · 31 min · 5.7 min/km')).toBeTruthy();
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
