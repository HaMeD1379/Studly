vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return {
    ...actual,
    useActionData: vi.fn(),
  };
});

import { fireEvent, screen } from '@testing-library/react';
import fetchPolyfill, { Request as RequestPolyfill } from 'node-fetch';
import {
  createMemoryRouter,
  RouterProvider,
  useActionData,
} from 'react-router-dom';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { LOGIN } from '~/constants';
import { profileChangeAction } from '~/routes';
import { userInfo } from '~/store/userInfo';
import { render } from '~/utilities/testing';
import { ProfileInformationCard } from './ProfileInformationCard';

vi.mock('~/utilities/notifications', () => ({
  displayNotifications: vi.fn(),
}));

import { displayNotifications } from '~/utilities/notifications';

const { mockSetName, mockSetEmail, mockSetBio } = vi.hoisted(() => ({
  mockSetBio: vi.fn(),
  mockSetEmail: vi.fn(),
  mockSetName: vi.fn(),
}));

vi.mock('~/store/userInfo', () => {
  const state = {
    avatarState: 'active',
    bio: 'Mocked bio',
    email: 'john@example.com',
    name: 'John Doe',
    setBio: mockSetBio,
    setEmail: mockSetEmail,
    setName: mockSetName,
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

Object.defineProperty(global, 'fetch', {
  value: fetchPolyfill,
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

  it('calls store setters when form is submitted', () => {
    render(<RouterProvider router={router} />);

    fireEvent.change(screen.getByTestId('name-text-update'), {
      target: { value: 'Jane Doe' },
    });
    fireEvent.change(screen.getByTestId('email-text-update'), {
      target: { value: 'jane@example.com' },
    });

    const form = screen.getByTestId('profile-info-text').closest('form');
    if (!form) throw new Error('Form not found');
    fireEvent.submit(form);

    expect(mockSetName).toHaveBeenCalledWith('Jane Doe');
    expect(mockSetEmail).toHaveBeenCalledWith('jane@example.com');
  });

  it('shows a notification when avatar change button is clicked', () => {
    render(<RouterProvider router={router} />);
    fireEvent.click(screen.getByTestId('avatar-change-btn'));

    expect(displayNotifications).toHaveBeenCalledWith(
      'Not Supported',
      'The action you have requested is not available at this time',
      'red',
    );
  });

  it('enforces bio character limit', () => {
    render(<RouterProvider router={router} />);

    const bioInput = screen.getByTestId('bio-text-update');
    fireEvent.change(bioInput, { target: { value: 'a'.repeat(210) } });

    expect(screen.getByTestId('word-counter')).toHaveTextContent(
      '200/200 characters',
    );
  });

  it('shows failure notification when actionData.success = false', () => {
    (useActionData as Mock).mockReturnValue({
      message: 'Random error',
      success: false,
    });

    render(<RouterProvider router={router} />);

    expect(displayNotifications).toHaveBeenCalledWith(
      'Update Failed',
      'Please try again later',
      'red',
    );
  });
  it('shows default values when store is empty', () => {
    (
      userInfo as unknown as { mockImplementation: (fn: () => unknown) => void }
    ).mockImplementation(() => ({
      avatarState: 'inactive',
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
