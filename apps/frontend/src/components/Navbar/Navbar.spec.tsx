const mockUseNavigation = vi.fn();

vi.mock('react-router', () => ({
  useLocation: () => vi.fn().mockImplementation(() => {}),
  useNavigate: () => mockUseNavigation.mockImplementation(() => {}),
}));

import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { render } from '~/utilities/testing';
import { Navbar } from './Navbar';

describe('Navbar', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders all navigations', () => {
    render(<Navbar>MOCK_CHILDREN</Navbar>);
    expect(screen.getByText('Studly')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Home' })).not.toBeNull();
    expect(
      screen.getByRole('button', { name: 'Study Session' }),
    ).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Badges' })).not.toBeNull();
    expect(screen.getByText('MOCK_CHILDREN')).not.toBeNull();
  });

  it('navigations are called to the proper route', () => {
    render(<Navbar>MOCK_CHILDREN</Navbar>);

    const homeButton = screen.getByRole('button', { name: 'Home' });
    const studySessionButton = screen.getByRole('button', {
      name: 'Study Session',
    });
    const badgesButton = screen.getByRole('button', { name: 'Badges' });

    homeButton.click();
    expect(mockUseNavigation).toHaveBeenCalledWith('/home');

    studySessionButton.click();
    expect(mockUseNavigation).toHaveBeenCalledWith('/study');

    badgesButton.click();
    expect(mockUseNavigation).toHaveBeenCalledWith('/badges');
  });
});
