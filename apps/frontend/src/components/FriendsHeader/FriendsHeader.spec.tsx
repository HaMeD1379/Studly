import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  FRIENDS_CARD_ONLINE,
  FRIENDS_CARD_STUDYING,
  FRIENDS_TAB_FRIENDS,
  FRIENDS_TAB_REQUESTS,
  FRIENDS_TAB_SUGGESTIONS,
} from '~/constants';
import { render } from '~/utilities/testing';
import { FriendsHeader } from './FriendsHeader';

vi.mock('~/constants/friends', () => ({
  friendsTabs: ['Friends', 'Requests', 'Suggestions'],
  stats: [
    { icon: null, label: 'Friends', value: 4 },
    { icon: null, label: 'Requests', value: 2 },
    { icon: null, label: 'Online', value: 2 },
    { icon: null, label: 'Studying', value: 1 },
  ],
}));

describe('FriendsHeader', () => {
  it('renders header, description, and search input', () => {
    render(<FriendsHeader />);

    // Header
    const header = screen.getByTestId('Friends header');
    expect(header).toHaveTextContent(FRIENDS_TAB_FRIENDS);

    // Description
    expect(
      screen.getByText('Connect with fellow students and study together'),
    ).toBeInTheDocument();

    // Search input
    const searchInput = screen.getByPlaceholderText(/search friends/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('renders all stats cards with correct labels and values', () => {
    render(<FriendsHeader />);

    // Stats cards
    const cards = [
      { label: FRIENDS_TAB_FRIENDS, value: '4' },
      { label: FRIENDS_TAB_REQUESTS, value: '2' },
      { label: FRIENDS_CARD_ONLINE, value: '2' },
      { label: FRIENDS_CARD_STUDYING, value: '1' },
    ];

    cards.forEach(({ label, value }) => {
      const card = screen.getByTestId(
        `${label.toLowerCase().replace(/\s+/g, '-')}-card`,
      );
      expect(card).toBeInTheDocument();
      expect(card).toHaveTextContent(value);
      expect(card).toHaveTextContent(label);
    });
  });

  it('renders segmented control with all tabs', () => {
    render(<FriendsHeader />);

    const tabs = [
      FRIENDS_TAB_FRIENDS,
      FRIENDS_TAB_REQUESTS,
      FRIENDS_TAB_SUGGESTIONS,
    ];

    tabs.forEach((tab) => {
      const tabButton = screen.getByRole('radio', { name: tab });
      expect(tabButton).toBeInTheDocument();
    });
  });
});
