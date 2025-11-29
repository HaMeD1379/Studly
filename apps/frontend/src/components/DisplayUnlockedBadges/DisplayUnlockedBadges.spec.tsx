import { fireEvent, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HOME, HOME_DISPLAYING_UPCOMING_BADGES } from '~/constants';
import { mockLoaderData as loaderdataMock } from '~/mocks/home';
import { render } from '~/utilities/testing';
import { DisplayUnlockedBadges } from './DisplayUnlockedBadges';

const mockNavigate = vi.fn();

vi.mock('react-router', async () => {
  const actual =
    await vi.importActual<typeof import('react-router')>('react-router');
  return {
    ...actual,
    useLoaderData: () => loaderdataMock,
    useNavigate: () => mockNavigate,
  };
});

describe('DisplayUnlockedBadges Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the header and all badges sorted by progress (desc)', () => {
    render(<DisplayUnlockedBadges />);

    expect(
      screen.getByText(HOME_DISPLAYING_UPCOMING_BADGES),
    ).toBeInTheDocument();

    const cards = screen.getAllByTestId('badge-card');
    expect(cards).toHaveLength(2);

    const cardTitles = cards.map((card) => {
      const texts = within(card).getAllByText(/.+/);
      return texts[0].textContent;
    });

    expect(cardTitles[0]).toBe('Marathon');
    expect(cardTitles[1]).toBe('Sprinter');
  });

  it('navigates back to HOME when back button clicked', () => {
    render(<DisplayUnlockedBadges />);

    const backButton = screen.getByRole('button');
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith(HOME);
  });
});
