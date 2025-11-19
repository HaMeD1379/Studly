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

vi.mock('~/store', () => {
  return {
    userInfo: {
      getState: () => ({
        bio: '',
        email: 'testUser@gmail.com',
        name: 'Test User',
        setBio: vi.fn(),
        setEmail: vi.fn(),
        setName: vi.fn(),
      }),
    },
  };
});

import { fireEvent, screen } from '@testing-library/react';
import fetchPolyfill, { Request as RequestPolyfill } from 'node-fetch';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it, type Mock, vi } from 'vitest';
import * as auth from '~/api';
import { PageSpinner } from '~/components';
import { LOGIN, SETTINGS } from '~/constants';
import { ProfileLoader } from '~/routes';
import { render } from '~/utilities/testing';
import { UserCard } from './UserCard';

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

describe('Profile Card tests', () => {
  const router = createMemoryRouter([
    {
      element: <UserCard />,
      loader: ProfileLoader,
      path: LOGIN,
    },
  ]);
  it('displays all elements', async () => {
    render(<RouterProvider router={router} />);

    const nameField = await screen.findByTestId('name-text');
    const emailField = await screen.findByTestId('email-text');
    const bioField = await screen.findByTestId('bio-text');
    const editBtn = await screen.findByTestId('edit-btn');
    const shareBtn = await screen.findByTestId('share-btn');

    expect(nameField).toHaveTextContent('Test User');
    expect(emailField).toHaveTextContent('testUser@gmail.com');
    expect(bioField).toHaveTextContent('Edit Profile to update your bio');
    expect(editBtn).toHaveTextContent('Edit');
    expect(shareBtn).toHaveTextContent('Share');
  });
  it('naviagtes to settings when edit button is clicked', () => {
    render(<RouterProvider router={router} />);
    fireEvent.click(screen.getByTestId('edit-btn'));
    expect(mockNavigate).toHaveBeenCalledWith(SETTINGS);
  });
  it('displays the result from the fetch bio api call in the bio field', () => {
    (auth.fetchBio as Mock).mockResolvedValue({
      data: {
        data: {
          bio: 'This is my Bio',
          userId: '1',
        },
      },
      error: null,
    });

    const router = createMemoryRouter([
      {
        element: <UserCard />,
        hydrateFallbackElement: <PageSpinner />,
        loader: ProfileLoader,
        path: LOGIN,
      },
    ]);

    render(<RouterProvider router={router} />);
  });
});
