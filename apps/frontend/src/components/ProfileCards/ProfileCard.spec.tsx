import { screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { UserProfile } from '~/routes';
import { render } from '~/utilities/testing';

describe('Profile Card tests', () => {
  const router = createMemoryRouter([
    {
      element: <UserProfile />,
      path: '/',
    },
  ]);
  it('displays all elements', () => {
    render(<RouterProvider router={router} />);
    const day_streak = screen.getByTestId('day-streak-card');
    const total_study = screen.getByTestId('total-study-card');
    const badges = screen.getByTestId('badges-card');
    const friends = screen.getByTestId('friends-card');
    expect(day_streak).toHaveTextContent('Day Streak');
    expect(total_study).toHaveTextContent('Total Study');
    expect(badges).toHaveTextContent('Badges');
    expect(friends).toHaveTextContent('Friends');
  });
});
