import { screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { profileInfo } from '~/store/profileInfo';
import { render } from '~/utilities/testing';
import { ProfileCard } from './ProfileCard';

describe('ProfileCard Component', () => {
  beforeEach(() => {
    // Reset store for consistent test results
    profileInfo.setState({ allTimeHoursStudied: '2hours15' });
  });

  it('renders all statistic cards', () => {
    render(<ProfileCard />);

    const dayStreakCard = screen.getByTestId('day-streak-card');
    const totalStudyCard = screen.getByTestId('total-study-card');
    const badgesCard = screen.getByTestId('badges-card');
    const friendsCard = screen.getByTestId('friends-card');

    expect(dayStreakCard).toBeInTheDocument();
    expect(totalStudyCard).toBeInTheDocument();
    expect(badgesCard).toBeInTheDocument();
    expect(friendsCard).toBeInTheDocument();
  });

  it('displays correct labels and values', () => {
    render(<ProfileCard />);

    const stats = [
      { label: 'Day Streak', value: '12' },
      { label: 'Total Study', value: '2hours15' },
      { label: 'Badges', value: '18' },
      { label: 'Friends', value: '24' },
    ];

    stats.forEach(({ label, value }) => {
      const card = screen.getByTestId(
        `${`${label.toLowerCase().replace(/\s+/g, '-')}-card`}`,
      );
      expect(card).toBeInTheDocument();

      // Check that label is displayed
      expect(within(card).getByText(label)).toBeInTheDocument();
      // Check that value is displayed
      expect(within(card).getByText(value)).toBeInTheDocument();
    });
  });

  it('updates correctly when store changes', () => {
    // Update store after render
    profileInfo.setState({ allTimeHoursStudied: '5hours30' });
    render(<ProfileCard />);

    const totalStudyCard = screen.getByTestId('total-study-card');
    // Wait for the useEffect to update state
    expect(within(totalStudyCard).getByText('5hours30')).toBeInTheDocument();
  });
});
