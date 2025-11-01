import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { render } from '~/utilities/testing';
import { BadgeStatistics } from './BadgeStatistics';

describe('BadgeStatistics', () => {
  it('renders', () => {
    render(<BadgeStatistics badgesUnlocked={2} totalBadges={3} />);

    expect(screen.getByText('2')).not.toBeNull();
    expect(screen.getByText('Unlocked')).not.toBeNull();

    expect(screen.getByText('3')).not.toBeNull();
    expect(screen.getByText('Total')).not.toBeNull();

    expect(screen.getByText('67%')).not.toBeNull();
    expect(screen.getByText('Complete')).not.toBeNull();

    expect(screen.getByText('Collection Progress')).not.toBeNull();
    expect(screen.getByText('2 of 3 badges unlocked')).not.toBeNull();
  });
});
