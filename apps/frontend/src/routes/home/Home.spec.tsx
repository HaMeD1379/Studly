import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { mockHomePageLoaderData } from '~/mocks';
import { render } from '~/utilities/testing';
import { Home } from './Home';

const mockNavigate = vi.fn();
const mockSetGlobalPath = vi.fn();

vi.mock('react-router', async () => {
  const actual =
    await vi.importActual<typeof import('react-router')>('react-router');
  return {
    ...actual,
    useLoaderData: () => mockHomePageLoaderData,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('~/context', () => ({
  useNavbar: () => ({
    setGlobalPath: mockSetGlobalPath,
  }),
}));

describe('Home test file', () => {
  it('renders home page when view more is false', () => {
    render(<Home />);
    expect(screen.getByText('In Progress Badges')).toBeInTheDocument();
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText('Total Time Studied Today')).toBeInTheDocument();
  });

  it('shows InProgressBadges after calling action', () => {
    render(<Home />);

    const viewMoreButton = screen.getByRole('button', { name: /view more/i });
    fireEvent.click(viewMoreButton);
    expect(
      screen.getByText('Start a new session to get even closer to a new badge'),
    ).toBeInTheDocument();
  });
});
