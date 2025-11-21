import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { mockBadgesLeaderboard, mockStudyTimeLeaderboard } from '~/mocks';
import { LeaderboardPageType } from '~/types';
import { render } from '~/utilities/testing';
import { formatMinutesToHoursAndMinutes } from '~/utilities/time';
import { LeaderboardPage } from './LeaderboardPage';

describe('LeaderboardPage', () => {
  it('renders without data', () => {
    render(<LeaderboardPage rows={[]} type={LeaderboardPageType.StudyTime} />);

    expect(screen.getByText('Study Time Leaders')).toBeInTheDocument();
    expect(screen.getByText('Weekly study time rankings')).toBeInTheDocument();
    expect(
      screen.getByText('There is no data for this leaderboard'),
    ).toBeInTheDocument();
  });

  it('renders with data on study and You', () => {
    render(
      <LeaderboardPage
        rows={mockStudyTimeLeaderboard}
        type={LeaderboardPageType.StudyTime}
      />,
    );

    expect(
      screen.queryByText('There is no data for this leaderboard'),
    ).not.toBeInTheDocument();
    for (const row of mockStudyTimeLeaderboard) {
      expect(screen.getByText(row.displayName)).toBeInTheDocument();
      expect(screen.getByText(`#${row.rank}`)).toBeInTheDocument();
      expect(
        screen.getByText(formatMinutesToHoursAndMinutes(row.totalMinutes)),
      ).toBeInTheDocument();
    }
  });

  it('renders with data on badges and You', () => {
    render(
      <LeaderboardPage
        rows={mockBadgesLeaderboard}
        type={LeaderboardPageType.Badges}
      />,
    );

    expect(
      screen.queryByText('There is no data for this leaderboard'),
    ).not.toBeInTheDocument();
    for (const row of mockBadgesLeaderboard) {
      expect(screen.getByText(row.displayName)).toBeInTheDocument();
      expect(screen.getByText(`#${row.rank}`)).toBeInTheDocument();
    }
    expect(screen.getByText(`4 badges`)).toBeInTheDocument();
    expect(screen.getByText(`2 badges`)).toBeInTheDocument();
    expect(screen.getByText(`1 badge`)).toBeInTheDocument();
  });

  it('renders unknown for displayName being null', () => {
    const mockUnknown = [
      {
        ...mockStudyTimeLeaderboard[0],
        displayName: null,
      },
    ];

    render(
      <LeaderboardPage
        rows={mockUnknown}
        type={LeaderboardPageType.StudyTime}
      />,
    );
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });
});
