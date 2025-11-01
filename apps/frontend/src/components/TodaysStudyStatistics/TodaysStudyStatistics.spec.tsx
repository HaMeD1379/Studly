import { expect, describe, it } from 'vitest';
import { render } from '~/utilities/testing';
import { TodaysStudyStatistics } from './TodaysStudyStatistics';
import { mockTimesStudied, mockTotalTimeStudied } from '~/mocks';
import { screen } from '@testing-library/react';

describe('TodaysStudyStatistics', () => {
  it('renders', () => {
    render(
      <TodaysStudyStatistics
        totalTimeStudied={mockTotalTimeStudied}
        timesStudied={mockTimesStudied}
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
        totalTimeStudied={mockTotalTimeMinutes}
        timesStudied={mockTimesStudied}
      />,
    );

    expect(screen.getByText('1m')).not.toBeNull();
  });

  it('renders with 0 gives 0m', () => {
    render(
      <TodaysStudyStatistics
        totalTimeStudied={0}
        timesStudied={mockTimesStudied}
      />,
    );

    expect(screen.getByText('0m')).not.toBeNull();
  });
});
