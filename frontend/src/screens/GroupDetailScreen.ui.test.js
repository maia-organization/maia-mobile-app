import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import { GroupDetailScreen } from './GroupDetailScreen';
import {
  createRunningGroupPost,
  getRunningGroupFeed,
  getRunningGroupMembers,
  leaveRunningGroup
} from '../services/userApi';

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (effect) => require('react').useEffect(effect, [effect])
}));
jest.mock('../services/userApi', () => ({
  createRunningGroupPost: jest.fn(),
  getRunningGroupFeed: jest.fn(),
  getRunningGroupMembers: jest.fn(),
  leaveRunningGroup: jest.fn()
}));

describe('GroupDetailScreen UI', () => {
  const group = {
    id: 'group-1',
    level: 'Intermédiaire',
    name: 'Les abeilles',
    objective: 'Courir ensemble'
  };
  const navigation = { goBack: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    getRunningGroupMembers.mockResolvedValue({
      members: [
        { id: 'member-1', name: 'Lina' },
        { id: 'member-2', name: 'Maya' }
      ]
    });
    getRunningGroupFeed.mockResolvedValue({
      posts: [{ author_name: 'Lina', id: 'post-1', message: 'Sortie douce samedi matin ?' }]
    });
  });

  it('affiche les membres et permet de publier dans le fil du groupe', async () => {
    createRunningGroupPost.mockResolvedValue({ post: { id: 'post-2' } });
    const view = render(
      <GroupDetailScreen navigation={navigation} route={{ params: { group } }} />
    );

    expect(await view.findByText('Lina · Maya')).toBeTruthy();
    expect(view.getByText('Sortie douce samedi matin ?')).toBeTruthy();
    fireEvent.changeText(view.getByLabelText('Publication du groupe'), 'Je serai là !');
    await act(async () => fireEvent.press(view.getByRole('button', { name: 'Publier' })));

    expect(createRunningGroupPost).toHaveBeenCalledWith('group-1', 'Je serai là !');
  });

  it('affiche une erreur si le fil est indisponible', async () => {
    getRunningGroupFeed.mockRejectedValueOnce(new Error('Le fil est indisponible.'));
    const view = render(
      <GroupDetailScreen navigation={navigation} route={{ params: { group } }} />
    );

    await waitFor(() => expect(view.getByText('Le fil est indisponible.')).toBeTruthy());
  });

  it('affiche une erreur si la publication échoue', async () => {
    createRunningGroupPost.mockRejectedValueOnce(new Error('La publication est indisponible.'));
    const view = render(
      <GroupDetailScreen navigation={navigation} route={{ params: { group } }} />
    );

    await view.findByText('Lina · Maya');
    fireEvent.changeText(view.getByLabelText('Publication du groupe'), 'Je serai là !');
    await act(async () => fireEvent.press(view.getByRole('button', { name: 'Publier' })));

    expect(await view.findByText('La publication est indisponible.')).toBeTruthy();
  });

  it('permet de quitter le groupe', async () => {
    leaveRunningGroup.mockResolvedValue({ left: true });
    const view = render(
      <GroupDetailScreen navigation={navigation} route={{ params: { group } }} />
    );

    await act(async () =>
      fireEvent.press(await view.findByRole('button', { name: 'Quitter le groupe' }))
    );

    expect(leaveRunningGroup).toHaveBeenCalledWith('group-1');
    expect(navigation.goBack).toHaveBeenCalled();
  });
});
