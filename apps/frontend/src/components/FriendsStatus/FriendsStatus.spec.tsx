import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { render } from '~/utilities/testing';
import { FriendsStatus } from './FriendsStatus';

describe('FriendsStatus', () => {
  it('renders all friends cards', () => {
    render(<FriendsStatus />);

    // Friend names
    const friendNames = [
      'Sarah Chen',
      'Mike Johnson',
      'Emma Wilson',
      'Alex Rodriguez',
    ];
    friendNames.forEach((name) => {
      const nameElement = screen.getByText(name);
      expect(nameElement).toBeInTheDocument();
    });

    // Friend subjects and statuses
    expect(screen.getByText(/Physics - 2 hours ago/)).toBeInTheDocument();
    expect(
      screen.getByText(/Mathematics - Currently Studying/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Chemistry - 6 hours ago/)).toBeInTheDocument();
    expect(screen.getByText(/History - 1 hours ago/)).toBeInTheDocument();

    // Friend stats
    expect(screen.getByText(/15 day streak/)).toBeInTheDocument();
    expect(screen.getByText(/206h/)).toBeInTheDocument();
    expect(screen.getByText(/24 badges/)).toBeInTheDocument();

    expect(screen.getByText(/8 day streak/)).toBeInTheDocument();
    expect(screen.getByText(/148h/)).toBeInTheDocument();
    expect(screen.getByText(/16 badges/)).toBeInTheDocument();

    expect(screen.getByText(/22 day streak/)).toBeInTheDocument();
    expect(screen.getByText(/311h/)).toBeInTheDocument();
    expect(screen.getByText(/35 badges/)).toBeInTheDocument();

    expect(screen.getByText(/3 day streak/)).toBeInTheDocument();
    expect(screen.getByText(/93h/)).toBeInTheDocument();
    expect(screen.getByText(/12 badges/)).toBeInTheDocument();

    // Buttons
    expect(
      screen.getAllByRole('button', { name: /View Profile/i }),
    ).toHaveLength(4);
    expect(screen.getAllByRole('button')).toHaveLength(8); // 4 message + 4 view profile buttons

    // Avatars
    const avatars = screen.getAllByTestId('avatar');
    expect(avatars).toHaveLength(4);
  });
});
