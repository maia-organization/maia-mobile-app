import { fireEvent, render } from '@testing-library/react-native';

import { CycleEducationScreen } from './CycleEducationScreen';

describe('CycleEducationScreen UI', () => {
  it('présente les contenus temporaires pour chaque phase et permet de les mettre en favori', () => {
    const view = render(<CycleEducationScreen navigation={{ goBack: jest.fn() }} />);

    expect(view.getByText('Phase menstruelle')).toBeTruthy();
    expect(view.getByText('Phase folliculaire')).toBeTruthy();
    expect(view.getByText('Phase ovulatoire')).toBeTruthy();
    expect(view.getByText('Phase lutéale')).toBeTruthy();
    expect(view.getByText(/Contenus indicatifs/)).toBeTruthy();

    const favorite = view.getByRole('button', { name: 'Ajouter Phase menstruelle des favoris' });
    fireEvent.press(favorite);

    expect(
      view.getByRole('button', { name: 'Retirer Phase menstruelle des favoris' })
    ).toBeTruthy();
  });

  it('revient à l’écran du cycle', () => {
    const navigation = { goBack: jest.fn() };
    const view = render(<CycleEducationScreen navigation={navigation} />);

    fireEvent.press(view.getByRole('button', { name: 'Retour à mon cycle' }));

    expect(navigation.goBack).toHaveBeenCalledTimes(1);
  });
});
