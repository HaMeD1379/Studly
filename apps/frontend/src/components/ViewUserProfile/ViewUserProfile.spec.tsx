import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FRIENDS_FRIENDS_SINCE } from '~/constants';
import { render } from '~/utilities/testing';
import { formatISOToYYYYMMDD } from '~/utilities/time';
import { ViewUserProfile } from './ViewUserProfile';

vi.mock('@mantine/core', async () => {
  const actual =
    await vi.importActual<typeof import('@mantine/core')>('@mantine/core');
  return {
    ...actual,
    Card: ({ children }: { children: React.ReactNode }) => (
      <div data-testid='card'>{children}</div>
    ),
    Flex: ({ children }: { children: React.ReactNode }) => (
      <div data-testid='flex'>{children}</div>
    ),
    Text: ({ children }: { children: React.ReactNode }) => (
      <span>{children}</span>
    ),
  };
});

vi.mock('../Avatar/Avatar', () => ({
  Avatar: ({ name }: { name: string }) => (
    <div data-testid='avatar'>{name}</div>
  ),
}));

vi.mock('~/utilities/time', () => ({
  formatISOToYYYYMMDD: vi.fn((date: string) => `formatted(${date})`),
}));

describe('ViewUserProfile Component', () => {
  const mockFriend = {
    bio: 'Loves TypeScript',
    email: 'validUser@gmail.com',
    full_name: 'Alice Johnson',
    user_id: '123',
  };

  const mockDate = '2025-02-01';

  it('renders friend name, bio, and formatted friendship date', () => {
    render(
      <ViewUserProfile friend={mockFriend} friendshipStartDate={mockDate} />,
    );

    expect(screen.getAllByText('Alice Johnson')).toHaveLength(2);
    expect(screen.getByText('Loves TypeScript')).toBeInTheDocument();

    expect(screen.getByTestId('avatar')).toHaveTextContent('Alice Johnson');

    expect(screen.getByText(FRIENDS_FRIENDS_SINCE)).toBeInTheDocument();
    expect(formatISOToYYYYMMDD).toHaveBeenCalledWith(mockDate);
    expect(screen.getByText(`formatted(${mockDate})`)).toBeInTheDocument();
  });

  it('renders fallback name when full_name is missing', () => {
    const friendWithoutName = { ...mockFriend, full_name: '' };
    render(
      <ViewUserProfile
        friend={friendWithoutName}
        friendshipStartDate={mockDate}
      />,
    );

    expect(screen.getByTestId('avatar')).toHaveTextContent('User');
  });
});
