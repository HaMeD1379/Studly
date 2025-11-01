import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { mockTimesStudied, mockTotalTimeStudied } from '~/mocks';
import { render } from '~/utilities/testing';
import { TodaysStudyStatistics } from './TodaysStudyStatistics';

describe('TodaysStudyStatistics', () => {
  it('renders', () => {
    render(
      <TodaysStudyStatistics
        timesStudied={mockTimesStudied}
        totalTimeStudied={mockTotalTimeStudied}
      />,
    );

    expect(screen.getByText("Today's Progress")).not.toBeNull();

    expect(screen.getByText('2h 46m')).not.toBeNull();
    expect(screen.getByText('Study Time')).not.toBeNull();

    expect(screen.getByText('3')).not.toBeNull();
    expect(screen.getByText('Sessions')).not.toBeNull();
  });

  it('renders with only minutes', () => {
    const mockTotalTimeMinutes = 100000;

    render(
      <TodaysStudyStatistics
        timesStudied={mockTimesStudied}
        totalTimeStudied={mockTotalTimeMinutes}
      />,
    );

    expect(screen.getByText('1m')).not.toBeNull();
  });

  it('renders with 0 gives 0m', () => {
    render(
      <TodaysStudyStatistics
        timesStudied={mockTimesStudied}
        totalTimeStudied={0}
      />,
    );

    expect(screen.getByText('0m')).not.toBeNull();
  });
});
