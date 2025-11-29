import { screen } from '@testing-library/react';
import fetchPolyfill, { Request as RequestPolyfill } from 'node-fetch';
import { describe, expect, it, vi } from 'vitest';
import { NavbarProvider } from '~/context';
import { UserProfile } from '~/routes';
import { render } from '~/utilities/testing';

const mockLoaderData = {
  data: {
    badges: {
      allBadges: [{}, {}, {}],
      unlockedBadges: [{}, {}, {}],
    },
    friendCount: {
      data: { count: 3 },
      error: false,
    },
    profileBio: { data: { bio: 'This is my Bio' } },
    sessionSummary: {
      sessionsLogged: 0,
      subjectSummaries: [],
      totalMinutesStudied: 0,
    },
    sessions: [],
  },
  error: false,
};

// --- Mock navigation ---
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return {
    ...actual,
    useLoaderData: () => mockLoaderData,
    useNavigate: () => mockNavigate,
  };
});

// --- Polyfill fixes for Remix Request issues ---
Object.defineProperty(global, 'fetch', {
  value: fetchPolyfill,
  writable: true,
});
Object.defineProperty(global, 'Request', {
  value: RequestPolyfill,
  writable: false,
});

vi.mock('~/store', () => {
  const { create } = require('zustand');

  const mockSetName = vi.fn();
  const mockSetEmail = vi.fn();
  const mockSetId = vi.fn();
  const mockSetRefreshToken = vi.fn();
  const mockSetBio = vi.fn();
  const mockSetAllTimeHoursStudied = vi.fn();

  // create a mock Zustand hook
  const createMockStore = <T extends object>(initialState: T) => {
    const store = create(() => initialState);

    const hook = ((selector?: (s: T) => unknown) =>
      selector ? selector(store.getState()) : store.getState()) as unknown as {
      getState: typeof store.getState;
      setState: typeof store.setState;
    };

    hook.getState = store.getState;
    hook.setState = store.setState;

    return hook;
  };

  return {
    badgesStore: createMockStore({
      badgesProgress: 33,
      userBadges: [
        {
          description: 'Started a session',
          earnedAt: '2025-11-22',
          name: 'First Steps',
        },
        {
          description: 'Study for 3 days in a row',
          earnedAt: '2025-11-22',
          name: 'Consistent Learner',
        },
      ],
    }),
    profileInfo: createMockStore({
      allTimeHoursStudied: '5 hours 30 minutes',
      setAllTimeHoursStudied: mockSetAllTimeHoursStudied,
    }),
    userInfo: createMockStore({
      bio: 'This is my Bio',
      email: 'testUser@gmail.com',
      name: 'Test User',
      setBio: mockSetBio,
      setEmail: mockSetEmail,
      setId: mockSetId,
      setName: mockSetName,
      setRefreshToken: mockSetRefreshToken,
      userId: '1',
    }),
  };
});

describe('UserProfile Tests', () => {
  it('renders all nested components', async () => {
    render(
      <NavbarProvider>
        <UserProfile />
      </NavbarProvider>,
    );

    expect(await screen.findByTestId('name-text')).toHaveTextContent(
      'Test User',
    );
    expect(await screen.findByTestId('email-text')).toHaveTextContent(
      'testUser@gmail.com',
    );
    expect(await screen.findByTestId('bio-text')).toHaveTextContent(
      'This is my Bio',
    );

    expect(await screen.findByTestId('edit-btn')).toHaveTextContent('Edit');
    expect(await screen.findByTestId('share-btn')).toHaveTextContent('Share');

    expect(await screen.findByTestId('this-week-card')).toHaveTextContent(
      'This Week',
    );
    expect(
      await screen.findByTestId('subject-distribution-card'),
    ).toHaveTextContent('Subject Distribution');
    expect(await screen.findByTestId('recent-badges-card')).toHaveTextContent(
      'Recent Badges',
    );
  });
});
