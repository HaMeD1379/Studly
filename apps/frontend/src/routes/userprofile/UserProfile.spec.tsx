vi.mock('~/api', () => ({
  fetchBio: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return { ...actual, useNavigate: () => mockNavigate };
});

import { screen } from '@testing-library/react';
import fetchPolyfill, { Request as RequestPolyfill } from 'node-fetch';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it, type Mock, vi } from 'vitest';
import * as auth from '~/api';
import { PageSpinner } from '~/components';
import { ProfileLoader, UserProfile } from '~/routes';
import { render } from '~/utilities/testing';

//Lines 21 - 30 were provided through an online github repo as solution to the error:
//RequestInit: Expected signal ("AbortSignal {}") to be an instance of AbortSignal.
Object.defineProperty(global, 'fetch', {
  value: fetchPolyfill,
  // MSW will overwrite this to intercept requests
  writable: true,
});

Object.defineProperty(global, 'Request', {
  value: RequestPolyfill,
  writable: false,
});
/*
 */

describe('User Profile Tests', () => {
  it('renders all nested components', async () => {
    localStorage.setItem('userId', '1');
    localStorage.setItem('fullName', 'Test User');
    localStorage.setItem('email', 'testUser@gmail.com');

    (auth.fetchBio as Mock).mockResolvedValue({
      data: {
        data: {
          bio: 'This is my Bio',
          user_id: '1',
        },
      },
      error: null,
    });

    const router = createMemoryRouter([
      {
        element: <UserProfile />,
        hydrateFallbackElement: <PageSpinner />,
        loader: ProfileLoader,
        path: '/',
      },
    ]);

    render(<RouterProvider router={router} />);

    // Await each async element individually
    const name_field = await screen.findByTestId('name-text');
    const email_field = await screen.findByTestId('email-text');
    const bio_field = await screen.findByTestId('bio-text');
    const edit_btn = await screen.findByTestId('edit-btn');
    const share_btn = await screen.findByTestId('share-btn');
    const this_week = await screen.findByTestId('this-week-card');
    const subject_distribution = await screen.findByTestId(
      'subject-distribution-card',
    );
    const recent_badges = await screen.findByTestId('recent-badges-card');
    const day_streak = await screen.findByTestId('day-streak-card');
    const total_study = await screen.findByTestId('total-study-card');
    const badges = await screen.findByTestId('badges-card');
    const friends = await screen.findByTestId('friends-card');

    // Assertions
    expect(name_field).toHaveTextContent('Test User');
    expect(email_field).toHaveTextContent('testUser@gmail.com');
    expect(bio_field).toHaveTextContent('This is my Bio');
    expect(edit_btn).toHaveTextContent('Edit');
    expect(share_btn).toHaveTextContent('Share');
    expect(this_week).toHaveTextContent('This Week');
    expect(subject_distribution).toHaveTextContent('Subject Distribution');
    expect(recent_badges).toHaveTextContent('Recent Badges');
    expect(day_streak).toHaveTextContent('Day Streak');
    expect(total_study).toHaveTextContent('Total Study');
    expect(badges).toHaveTextContent('Badges');
    expect(friends).toHaveTextContent('Friends');
    expect(auth.fetchBio).toHaveBeenCalled();

    // Cleanup
    localStorage.removeItem('userId');
    localStorage.removeItem('fullName');
    localStorage.removeItem('email');
  });
});
