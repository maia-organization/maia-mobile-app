import { render } from '@testing-library/react-native';
import { FollowsScreen } from './FollowsScreen';
import { getFollows, getMessageMembers } from '../services/userApi';
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (effect) => require('react').useEffect(effect, [effect])
}));
jest.mock('../services/userApi', () => ({
  followUser: jest.fn(),
  getFollows: jest.fn(),
  getMessageMembers: jest.fn(),
  unfollowUser: jest.fn()
}));
test('affiche les abonnements possibles', async () => {
  getFollows.mockResolvedValue({ follows: [] });
  getMessageMembers.mockResolvedValue({ members: [{ id: '1', name: 'Lina' }] });
  expect(await render(<FollowsScreen />).findByText('Lina')).toBeTruthy();
});
