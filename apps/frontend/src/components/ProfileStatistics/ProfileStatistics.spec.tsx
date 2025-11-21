import { screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { profileInfo } from '~/store/profileInfo';
import { render } from '~/utilities/testing';
import { ProfileStatistics } from './ProfileStatistics';

const mockLoaderData = {
  data: {
    profileBio: { data: { bio: 'This is my Bio' } },
    sessionSummary: { sessionsLogged: 0, totalMinutesStudied: 0 },
    sessions: [
      { endTime: '2024-05-01T12:00:00', subject: 'Biology', totalMinutes: 60 },
      {
        endTime: '2024-05-01T13:00:00',
        subject: 'Chemistry',
        totalMinutes: 45,
      },
      {
        endTime: '2024-05-01T14:00:00',
        subject: 'Mathematics',
        totalMinutes: 30,
      },
    ],
  },
  error: false,
};

// Mock useLoaderData
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

describe('ProfileStatistics Component', () => {
  beforeEach(() => {
    // Reset Zustand store before each test
    profileInfo.setState({ allTimeHoursStudied: '' });
  });

  it('renders main cards', () => {
    render(<ProfileStatistics />);
    const thisWeekCard = screen.getByTestId('this-week-card');
    const recentBadgesCard = screen.getByTestId('recent-badges-card');
    const subjectDistCard = screen.getByTestId('subject-distribution-card');

    expect(thisWeekCard).toBeInTheDocument();
    expect(thisWeekCard).toHaveTextContent('This Week');

    expect(recentBadgesCard).toBeInTheDocument();
    expect(recentBadgesCard).toHaveTextContent('Recent Badges');

    expect(subjectDistCard).toBeInTheDocument();
    expect(subjectDistCard).toHaveTextContent('Subject Distribution');
  });

  it('displays correct session summary', () => {
    render(<ProfileStatistics />);
    const minutesStudied = screen.getByTestId('totalMinStudied');
    const sessionsCompleted = screen.getByTestId('SessionCompleted');

    expect(minutesStudied).toHaveTextContent('Study Time: 0');
    expect(sessionsCompleted).toHaveTextContent('Sessions Completed: 0');
  });

  it("renders badges in 'This Week'", () => {
    render(<ProfileStatistics />);
    const thisWeekCard = screen.getByTestId('this-week-card');
    const badges = within(thisWeekCard).getAllByRole('generic'); // Badge renders as div/span

    const badgeTexts = badges.map((b) => b.textContent);
    expect(badgeTexts).toEqual(
      expect.arrayContaining(['Biology', 'Chemistry', 'Mathematics']),
    );
  });

  it("renders badges in 'Recent Badges'", () => {
    render(<ProfileStatistics />);
    const recentCard = screen.getByTestId('recent-badges-card');
    const badges = within(recentCard).getAllByRole('generic');

    const badgeTexts = badges.map((b) => b.textContent);
    expect(badgeTexts).toEqual(
      expect.arrayContaining([
        'Study Streak Master',
        'Night Owl',
        'Social Butterfly',
      ]),
    );
  });

  it('renders subject distribution correctly', () => {
    render(<ProfileStatistics />);
    const subjectCard = screen.getByTestId('subject-distribution-card');

    expect(subjectCard).toHaveTextContent('Biology');
    expect(subjectCard).toHaveTextContent('Chemistry');
    expect(subjectCard).toHaveTextContent('Mathematics');
  });

  it('updates Zustand store with total study hours', () => {
    render(<ProfileStatistics />);
    const storeValue = profileInfo.getState().allTimeHoursStudied;

    expect(storeValue).toBe('2 hours 15 minutes');
  });
});
