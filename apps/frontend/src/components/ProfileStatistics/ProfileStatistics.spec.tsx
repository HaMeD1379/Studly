const mockLoaderData = {
  data: {
    profileBio: { data: { bio: 'This is my Bio' } },
    sessionSummary: { sessionsLogged: 0, totalMinutesStudied: 0 },
  },
  error: false,
};
//Lines 43 - 52 were provided through an online github repo (https://github.com/reduxjs/redux-toolkit/issues/4966#issuecomment-3115230061) as solution to the error:
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

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return {
    ...actual,
    useLoaderData: () => mockLoaderData,
  };
});

import { screen } from '@testing-library/react';
import fetchPolyfill, { Request as RequestPolyfill } from 'node-fetch';
import { describe, expect, it, vi } from 'vitest';
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
  it('uses loader data', () => {
    render(<ProfileStatistics />);
    const minutes_studied = screen.getByTestId('totalMinStudied');
    const completed_sessions = screen.getByTestId('SessionCompleted');

    expect(minutes_studied).toHaveTextContent('Study Time: 0');
    expect(completed_sessions).toHaveTextContent('Sessions Completed: 0');
  });
});
