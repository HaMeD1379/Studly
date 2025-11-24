import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '~/utilities/testing';
import { ProfileStatistics } from './ProfileStatistics';

// --- MOCKS ---

// --- FIXTURES ---

const mockLoaderData = {
  data: {
    badges: {
      allBadges: [
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
        {
          description: 'Study for a total of 30 minutes',
          earnedAt: '2025-11-21',
          name: 'Half Hour Hero',
        },
        {
          description: 'Study for a total of 1 hour',
          earnedAt: '2025-11-21',
          name: 'Hour Hero',
        },
      ],
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
        {},
      ],
    },
    sessionSummary: {
      sessionsLogged: 5,
      subjectSummaries: [{ subject: 'Math' }, { subject: 'Physics' }],
      totalMinutesStudied: 180,
    },
    sessions: [
      { subject: 'Math', totalMinutes: 120 },
      { subject: 'Physics', totalMinutes: 60 },
    ],
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

// Zustand store references (used in beforeEach)
//const mockedProfileStore = profileInfo();

// --- TESTS ---

describe('ProfileStatistics Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    //(useLoaderData as Mock).mockReturnValue(mockLoaderData);
  });

  it("renders 'This Week' statistics", () => {
    render(<ProfileStatistics />);

    expect(screen.getByTestId('totalMinStudied')).toHaveTextContent(
      '3 hours 0 minutes',
    );

    expect(screen.getByTestId('SessionCompleted')).toHaveTextContent('5');

    // Avoid getByText duplicates → use getAllByText
    expect(screen.getAllByText('Math').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Physics').length).toBeGreaterThan(0);
  });

  it('renders recent badges correctly', () => {
    render(<ProfileStatistics />);

    const card = screen.getByTestId('recent-badges-card');
    expect(card).toBeInTheDocument();

    // Badge names
    expect(screen.getByText('5 Sessions')).toBeInTheDocument();
    expect(screen.getByText('3 Hours')).toBeInTheDocument();
  });

  it('renders subject distribution section', () => {
    render(<ProfileStatistics />);

    const card = screen.getByTestId('subject-distribution-card');
    expect(card).toBeInTheDocument();

    // Duplicates allowed → use getAllByText
    expect(screen.getAllByText('Math').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Physics').length).toBeGreaterThan(0);
  });
});
