import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { GroupsScreen } from './GroupsScreen';
import { createRunningGroup, getRunningGroups, joinRunningGroup } from '../services/userApi';
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (effect) => require('react').useEffect(effect, [effect])
}));
jest.mock('../services/userApi', () => ({
  createRunningGroup: jest.fn(),
  getRunningGroups: jest.fn(),
  joinRunningGroup: jest.fn()
}));
describe('GroupsScreen UI', () => {
  const navigation = { navigate: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    getRunningGroups.mockResolvedValue({
      groups: [
        {
          id: 'g1',
          level: 'Débutante',
          members_count: 3,
          name: 'Les abeilles',
          objective: 'Courir ensemble',
          visibility: 'public'
        }
      ]
    });
  });
  it('affiche et permet de rejoindre un groupe', async () => {
    const view = render(<GroupsScreen navigation={navigation} />);
    expect(await view.findByText('Les abeilles')).toBeTruthy();
    await act(async () => fireEvent.press(view.getByRole('button', { name: 'Rejoindre' })));
    expect(joinRunningGroup).toHaveBeenCalledWith('g1');
    expect(navigation.navigate).toHaveBeenCalledWith('GroupDetail', {
      group: expect.objectContaining({ id: 'g1', is_member: true })
    });
  });

  it('permet de créer un groupe privé et ouvre son espace dédié', async () => {
    createRunningGroup.mockResolvedValue({
      group: { id: 'g2', level: 'Débutante', name: 'Les lucioles', objective: 'Se motiver' }
    });
    const view = render(<GroupsScreen navigation={navigation} />);

    await act(async () =>
      fireEvent.press(await view.findByRole('button', { name: 'Créer un groupe' }))
    );
    fireEvent.changeText(view.getByLabelText('Nom du groupe'), 'Les lucioles');
    fireEvent.changeText(view.getByLabelText('Niveau du groupe'), 'Débutante');
    fireEvent.changeText(view.getByLabelText('Objectif du groupe'), 'Se motiver');
    fireEvent.press(view.getByRole('button', { name: 'Visibilité privée' }));
    await act(async () => fireEvent.press(view.getByRole('button', { name: 'Créer' })));

    expect(createRunningGroup).toHaveBeenCalledWith({
      level: 'Débutante',
      name: 'Les lucioles',
      objective: 'Se motiver',
      visibility: 'private'
    });
    expect(navigation.navigate).toHaveBeenCalledWith('GroupDetail', {
      group: expect.objectContaining({ id: 'g2', is_member: true })
    });
  });

  it('affiche une erreur réseau', async () => {
    getRunningGroups.mockRejectedValueOnce(new Error('Réseau indisponible.'));
    const view = render(<GroupsScreen navigation={navigation} />);
    await waitFor(() => expect(view.getByText('Réseau indisponible.')).toBeTruthy());
  });
});
