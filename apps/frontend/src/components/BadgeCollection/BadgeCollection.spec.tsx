import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { mockAllBadges, mockAllUnlockedBadges } from '~/mocks';
import { render } from '~/utilities/testing';
import { BadgeCollection } from './BadgeCollection';

describe('BadgeCollection', () => {
  it('renders without any badges', async () => {
    render(<BadgeCollection allBadges={[]} unlockedBadges={[]} />);

    expect(screen.getByText('No badges unlocked yet!')).not.toBeNull();
    expect(screen.getByText('Start studying to earn badges!')).not.toBeNull();

    const allBadgesButton = screen.getByRole('radio', { name: 'All Badges' });

    expect(allBadgesButton).not.toBeNull();
    await userEvent.click(allBadgesButton);

    expect(
      screen.getByText('There are no badges to display here'),
    ).not.toBeNull();
    expect(screen.getByText('Please try again later')).not.toBeNull();
  });

  it('renders unlocked with pages', async () => {
    render(
      <BadgeCollection
        allBadges={mockAllBadges}
        unlockedBadges={mockAllUnlockedBadges}
      />,
    );

    expect(screen.queryByText('No badges unlocked yet!')).toBeNull();
    expect(screen.queryByText('Start studying to earn badges!')).toBeNull();

    validateUnlockedRenderedPage(1);

    await userEvent.click(screen.getByRole('button', { name: '2' }));

    validateUnlockedRenderedPage(2);
  });

  it('renders all with pages and unlocked with timestamps', async () => {
    render(
      <BadgeCollection
        allBadges={mockAllBadges}
        unlockedBadges={mockAllUnlockedBadges}
      />,
    );

    await userEvent.click(screen.getByRole('radio', { name: 'All Badges' }));

    expect(
      screen.queryByText('There are no badges to display here'),
    ).toBeNull();
    expect(screen.queryByText('Please try again later')).toBeNull();

    validateUnlockedRenderedPage(1);

    await userEvent.click(screen.getByRole('button', { name: '2' }));

    expect(screen.getByText('TEST_9_NAME')).not.toBeNull();
    expect(screen.getByText('TEST_9_DESCRIPTION')).not.toBeNull();

    expect(screen.getByText('TEST_10_NAME')).not.toBeNull();
    expect(screen.getByText('TEST_10_DESCRIPTION')).not.toBeNull();

    expect(screen.getByText('TEST_11_NAME')).not.toBeNull();
    expect(screen.getByText('TEST_11_DESCRIPTION')).not.toBeNull();

    expect(screen.getByText('TEST_12_NAME')).not.toBeNull();
    expect(screen.getByText('TEST_12_DESCRIPTION')).not.toBeNull();

    await userEvent.click(screen.getByRole('button', { name: '3' }));

    expect(screen.getByText('TEST_13_NAME')).not.toBeNull();
    expect(screen.getByText('TEST_13_DESCRIPTION')).not.toBeNull();

    expect(screen.getByText('Locked')).not.toBeNull();
  });
});

const validateUnlockedRenderedPage = (pageNumber: number) => {
  const badgesPage = mockAllUnlockedBadges.slice(
    (pageNumber - 1) * 6,
    pageNumber * 6,
  );

  for (const unlockedBadge of badgesPage) {
    expect(screen.getByText(unlockedBadge.name)).not.toBeNull();
    expect(screen.getByText(unlockedBadge.description)).not.toBeNull();
    expect(
      screen.getByText(
        `Unlocked ${unlockedBadge.earnedAt}`,
      ),
    ).not.toBeNull();
  }
};
