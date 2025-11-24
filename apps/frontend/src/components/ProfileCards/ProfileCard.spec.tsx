import { screen, within } from '@testing-library/react';
import fetchPolyfill, { Request as RequestPolyfill } from 'node-fetch';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { profileInfo } from '~/store/profileInfo';
import { render } from '~/utilities/testing';
import { ProfileCard } from './ProfileCard';

//Lines 43 - 52 were provided through an online github repo (https://github.com/reduxjs/redux-toolkit/issues/4966#issuecomment-3115230061) as solution to the error:
//RequestInit: Expected signal ("AbortSignal {}") to be an instance of AbortSignal.
Object.defineProperty(global, 'fetch', {
  value: fetchPolyfill,
  // MSW will overwrite this to intercept requests
  writable: true,
});

Object.defineProperty(global, 'Request', {
  value: RequestPolyfill,
  writable: false,
});

const mockLoaderData = {
  data: {
    badges: {
      unlockedBadges: [
        {
          description: 'Completed 5 sessions',
          earnedAt: '2025-01-01',
          name: '5 Sessions',
        },
        {
          description: 'Total 3 hours',
          earnedAt: '2025-01-02',
          name: '3 Hours',
        },
      ],
    },
  },
};

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return {
    ...actual,
    useLoaderData: () => mockLoaderData,
  };
});

describe('ProfileCard Component', () => {
  const router = createMemoryRouter([{ element: <ProfileCard />, path: '/' }]);
  beforeEach(() => {
    // Reset Zustand stores
    profileInfo.setState({ allTimeHoursStudied: '2hours15' });
  });

  it('renders all statistic cards', () => {
    render(<RouterProvider router={router} />);

    expect(screen.getByTestId('day-streak-card')).toBeInTheDocument();
    expect(screen.getByTestId('total-study-card')).toBeInTheDocument();
    expect(screen.getByTestId('badges-card')).toBeInTheDocument();
    expect(screen.getByTestId('friends-card')).toBeInTheDocument();
  });

  it('displays correct labels and values', () => {
    render(<RouterProvider router={router} />);

    const expectedStats = [
      { label: 'Day Streak', value: '12' },
      { label: 'Total Study', value: '2hours15' },
      { label: 'Badges', value: '2' }, // updated to match mocked badge count
      { label: 'Friends', value: '24' },
    ];

    expectedStats.forEach(({ label, value }) => {
      const testId = `${label.toLowerCase().replace(/\s+/g, '-')}-card`;
      const card = screen.getByTestId(testId);

      expect(card).toBeInTheDocument();
      expect(within(card).getByText(label)).toBeInTheDocument();
      expect(within(card).getByText(value)).toBeInTheDocument();
    });
  });

  it('updates correctly when store changes', async () => {
    profileInfo.setState({ allTimeHoursStudied: '5 hours 30 minutes' });
    render(<RouterProvider router={router} />);

    const totalStudyCard = screen.getByTestId('total-study-card');
    const badgesCard = screen.getByTestId('badges-card');

    expect(
      within(totalStudyCard).getByText('5 hours 30 minutes'),
    ).toBeInTheDocument();
    expect(within(badgesCard).getByText('2')).toBeInTheDocument();
  });
});
