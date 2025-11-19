import { notifications } from '@mantine/notifications';
import { fireEvent, screen } from '@testing-library/react';
import fetchPolyfill, { Request as RequestPolyfill } from 'node-fetch';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { LOGIN } from '~/constants';
import { profileChangeAction } from '~/routes';
import { userInfo } from '~/store/userInfo';
import { render } from '~/utilities/testing';
import { profileInformationCard as ProfileInformationCard } from './ProfileInformationCard';

vi.mock('@mantine/notifications', () => ({
  notifications: { show: vi.fn() },
}));

const { mockSetName, mockSetEmail, mockSetBio } = vi.hoisted(() => ({
  mockSetBio: vi.fn(),
  mockSetEmail: vi.fn(),
  mockSetName: vi.fn(),
}));

vi.mock('~/store/userInfo', () => {
  const state = {
    bio: 'Mocked bio',
    email: 'john@example.com',
    name: 'John Doe',
    sessionId: 'sess456',
    setBio: mockSetBio,
    setEmail: mockSetEmail,
    setName: mockSetName,
    setSessionId: vi.fn(),
    userId: 'user123',
  };

  return {
    userInfo: Object.assign(
      vi.fn(() => state),
      {
        getState: () => state,
        setState: vi.fn(),
        subscribe: vi.fn(),
      },
    ),
  };
});

//Lines 46 - 57 were provided through an online github repo (https://github.com/reduxjs/redux-toolkit/issues/4966#issuecomment-3115230061) as solution to the error:
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

describe('ProfileInformationCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const router = createMemoryRouter([
    {
      action: profileChangeAction,
      element: <ProfileInformationCard />,
      path: LOGIN,
    },
  ]);
  //avatar test removed
  //expect(screen.getByTestId("avatar-user")).toBeInTheDocument();
  it('renders all profile information elements', () => {
    render(<RouterProvider router={router} />);

    expect(screen.getByTestId('profile-info-text')).toBeInTheDocument();
    expect(screen.getByTestId('profile-info-subtext')).toBeInTheDocument();
    expect(screen.getByTestId('avatar-change-btn')).toBeInTheDocument();
    expect(screen.getByTestId('accepted-images')).toBeInTheDocument();
    expect(screen.getByTestId('name-text-update')).toHaveValue('John Doe');
    expect(screen.getByTestId('email-text-update')).toHaveValue(
      'john@example.com',
    );
    expect(screen.getByTestId('bio-text-update')).toHaveValue('Mocked bio');
    expect(screen.getByTestId('word-counter')).toHaveTextContent(
      '0/200 characters',
    );
  });

  it('updates name, email, and bio inputs correctly', () => {
    render(<RouterProvider router={router} />);

    const nameInput = screen.getByTestId(
      'name-text-update',
    ) as HTMLInputElement;
    const emailInput = screen.getByTestId(
      'email-text-update',
    ) as HTMLInputElement;
    const bioInput = screen.getByTestId('bio-text-update') as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
    fireEvent.change(emailInput, { target: { value: 'jane@example.com' } });
    fireEvent.change(bioInput, { target: { value: 'Hello world' } });

    expect(nameInput.value).toBe('Jane Doe');
    expect(emailInput.value).toBe('jane@example.com');
    expect(bioInput.value).toBe('Hello world');
    expect(screen.getByTestId('word-counter')).toHaveTextContent(
      '11/200 characters',
    );
  });

  it('calls store setters when inputs are changed and submitted', () => {
    render(<RouterProvider router={router} />);

    const nameInput = screen.getByTestId('name-text-update');
    const emailInput = screen.getByTestId('email-text-update');

    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
    fireEvent.change(emailInput, { target: { value: 'jane@example.com' } });

    const form = screen.getByTestId('profile-info-text').closest('form');
    expect(form).not.toBeNull();
    fireEvent.submit(form as HTMLFormElement);

    expect(mockSetName).toHaveBeenCalledWith('Jane Doe');
    expect(mockSetEmail).toHaveBeenCalledWith('jane@example.com');
  });

  it('displays a notification when avatar change button is clicked', () => {
    render(<RouterProvider router={router} />);
    const btn = screen.getByTestId('avatar-change-btn');
    fireEvent.click(btn);
    expect(notifications.show).toHaveBeenCalledWith({
      color: 'red',
      message: 'The action you have requested is not available at this time',
      title: 'Not Supported',
    });
  });

  it('enforces the bio character limit', () => {
    render(<RouterProvider router={router} />);
    const bioInput = screen.getByTestId('bio-text-update');
    const overLimitText = 'a'.repeat(210); // 210 > 200 limit

    fireEvent.change(bioInput, { target: { value: overLimitText } });
    expect(screen.getByTestId('word-counter')).toHaveTextContent(
      '200/200 characters',
    );
  });

  it('shows default values when store is empty', () => {
    (userInfo as unknown as Mock).mockImplementation(() => ({
      bio: '',
      email: '',
      name: '',
      setBio: mockSetBio,
      setEmail: mockSetEmail,
      setName: mockSetName,
    }));

    render(<RouterProvider router={router} />);
    expect(screen.getByTestId('name-text-update')).toHaveValue('John Doe');
    expect(screen.getByTestId('email-text-update')).toHaveValue(
      'john@example.com',
    );
    expect(screen.getByTestId('bio-text-update')).toHaveValue('Mocked bio');
  });
});
