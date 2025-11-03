import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { mockSessionsLogged, mockTotalTimeStudied } from '~/mocks';
import { render } from '~/utilities/testing';
import { TodaysStudyStatistics } from './TodaysStudyStatistics';

describe('TodaysStudyStatistics', () => {
  it('renders', () => {
    render(
      <TodaysStudyStatistics
        sessionsLogged={mockSessionsLogged}
        totalMinutesStudied={mockTotalTimeStudied}
      />,
    );

    expect(screen.getByText("Today's Progress")).not.toBeNull();

    expect(screen.getByText('2h 46m')).not.toBeNull();
    expect(screen.getByText('Study Time')).not.toBeNull();

    expect(screen.getByText('3')).not.toBeNull();
    expect(screen.getByText('Sessions')).not.toBeNull();
  });

  it('renders with only minutes', () => {
    const mockTotalTimeMinutes = 1;

    render(
      <TodaysStudyStatistics
        sessionsLogged={mockSessionsLogged}
        totalMinutesStudied={mockTotalTimeMinutes}
      />,
    );

    expect(screen.getByText('1m')).not.toBeNull();
  });

  it('renders with 0 gives 0m', () => {
    render(
      <TodaysStudyStatistics
        sessionsLogged={mockSessionsLogged}
        totalMinutesStudied={0}
      />,
    );

    expect(screen.getByText('0m')).not.toBeNull();
  });
});
