import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { render } from '~/utilities/testing';
import { ProfileStatistics } from './ProfileStatistics';

describe('Profile Statistics Tests', () => {
  it('renders all elements', () => {
    render(<ProfileStatistics />);
    const this_week = screen.getByTestId('this-week-card');
    const subject_distribution = screen.getByTestId(
      'subject-distribution-card',
    );
    const recent_badges = screen.getByTestId('recent-badges-card');
    expect(this_week).toHaveTextContent('This Week');
    expect(subject_distribution).toHaveTextContent('Subject Distribution');
    expect(recent_badges).toHaveTextContent('Recent Badges');
  });
});
