import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { GroupsScreen } from './GroupsScreen';
import { getRunningGroups, joinRunningGroup } from '../services/userApi';
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (effect) => require('react').useEffect(effect, [effect])
}));
jest.mock('../services/userApi', () => ({
  createRunningGroup: jest.fn(),
  getRunningGroups: jest.fn(),
  joinRunningGroup: jest.fn()
}));
describe('GroupsScreen UI', () => {
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
    const view = render(<GroupsScreen />);
    expect(await view.findByText('Les abeilles')).toBeTruthy();
    await act(async () => fireEvent.press(view.getByRole('button', { name: 'Rejoindre' })));
    expect(joinRunningGroup).toHaveBeenCalledWith('g1');
  });
  it('affiche une erreur réseau', async () => {
    getRunningGroups.mockRejectedValueOnce(new Error('Réseau indisponible.'));
    const view = render(<GroupsScreen />);
    await waitFor(() => expect(view.getByText('Réseau indisponible.')).toBeTruthy());
  });
});
