vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: vi.fn(),
  },
}));

import { notifications } from '@mantine/notifications';
import { fireEvent, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { profileChangeAction } from '~/routes';
import { render } from '~/utilities/testing';
import { profileInformationCard as ProfileInformationCard } from './ProfileInformationCard';

let mockStorage: Record<string, string> = {};

beforeEach(() => {
  mockStorage = {}; // reset before each test

  vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => {
    if (key === 'fullName') {
      return mockStorage[key] ?? 'Full Name';
    }
    if (key === 'email') {
      return mockStorage[key] ?? 'user@gmail.com';
    }
    return mockStorage[key] ?? null;
  });

  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(
    (key: string, value: string) => {
      mockStorage[key] = value;
    },
  );

  vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(
    (key: string) => {
      delete mockStorage[key];
    },
  );

  vi.spyOn(Storage.prototype, 'clear').mockImplementation(() => {
    mockStorage = {};
  });
});

const MAX_BIO_LENGTH = 200;

const router = createMemoryRouter([
  {
    action: profileChangeAction,
    element: <ProfileInformationCard />,
    path: '/',
  },
]);

describe('profileInformationCard', () => {
  it('renders all profile information elements', () => {
    render(<RouterProvider router={router} />);

    // Headings and texts
    expect(screen.getByTestId('profile-info-text')).toBeInTheDocument();
    expect(screen.getByTestId('profile-info-subtext')).toBeInTheDocument();
    expect(screen.getByTestId('accepted-images')).toBeInTheDocument();
    expect(screen.getByTestId('name-text')).toBeInTheDocument();
    expect(screen.getByTestId('email-text')).toBeInTheDocument();
    expect(screen.getByTestId('bio-text')).toBeInTheDocument();

    // Buttons and avatar

    expect(screen.getByText('FN')).toBeInTheDocument();
    expect(screen.getByTestId('avatar-change-btn')).toBeInTheDocument();

    // Inputs
    expect(screen.getByTestId('name-text-update')).toBeInTheDocument();
    expect(screen.getByTestId('email-text-update')).toBeInTheDocument();
    expect(screen.getByTestId('bio-text-update')).toBeInTheDocument();

    // Word counter
    expect(screen.getByTestId('word-counter')).toHaveTextContent(
      '0/200 characters',
    );
  });
  it('has the default values for the name and email fields', () => {
    localStorage.setItem('fullName', 'testUser');
    localStorage.setItem('email', 'realuser@gmail.com');
    render(<RouterProvider router={router} />);

    expect(screen.getByTestId('name-text-update')).toHaveValue('testUser');
    expect(screen.getByTestId('email-text-update')).toHaveValue(
      'realuser@gmail.com',
    );
  });
  it('has the default values for the name and email fields', () => {
    localStorage.setItem('fullName', 'testUser');
    localStorage.setItem('email', 'realuser@gmail.com');
    render(<RouterProvider router={router} />);

    expect(screen.getByTestId('name-text-update')).toHaveValue('testUser');
    expect(screen.getByTestId('email-text-update')).toHaveValue(
      'realuser@gmail.com',
    );
  });
  it('shows the default values if no name and profile is given', () => {
    render(<RouterProvider router={router} />);

    expect(screen.getByTestId('name-text-update')).toHaveValue('Full Name');
    expect(screen.getByTestId('email-text-update')).toHaveValue(
      'user@gmail.com',
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
    const counter = screen.getByTestId('word-counter');

    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
    fireEvent.change(emailInput, { target: { value: 'jane@example.com' } });
    fireEvent.change(bioInput, { target: { value: 'Hello world' } });

    // Check that inputs update
    expect(nameInput.value).toBe('Jane Doe');
    expect(emailInput.value).toBe('jane@example.com');

    // Check word counter updates
    expect(counter).toHaveTextContent('11/200 characters');
  });

  it('calls localStorage.setItem when name or email changes', () => {
    render(<RouterProvider router={router} />);

    const nameInput = screen.getByTestId('name-text-update');
    const emailInput = screen.getByTestId('email-text-update');

    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
    fireEvent.change(emailInput, { target: { value: 'jane@example.com' } });

    expect(localStorage.setItem).toHaveBeenCalledWith('fullName', 'Jane Doe');
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'email',
      'jane@example.com',
    );
  });
  it('updates word counter correctly', () => {
    render(<RouterProvider router={router} />);
    const text = 'words';
    const bioInput = screen.getByTestId('bio-text-update');
    const bioCount = screen.getByTestId('word-counter');
    expect(bioCount).toHaveTextContent('0/200 characters');
    fireEvent.change(bioInput, { target: { value: text } });
    expect(screen.getByTestId('word-counter')).toHaveTextContent(
      `${text.length}/200 characters`,
    );
  });
  it('displays a notification when change password button is clicked', () => {
    render(<RouterProvider router={router} />);
    const change_btn = screen.getByTestId(/avatar-change-btn/i);
    fireEvent.click(change_btn);
    expect(notifications.show).toHaveBeenCalledWith({
      color: 'red',
      message: 'The action you have requested is not available at this time',
      title: 'Not Supported',
    });
  });
  it('enforces the word couont limit (length of 200 characters)', () => {
    const overLimitText = 'a'.repeat(MAX_BIO_LENGTH + 10); // 210 characters

    render(<RouterProvider router={router} />);
    const bioInput = screen.getByTestId('bio-text-update');

    // simulate typing more than the allowed characters
    fireEvent.change(bioInput, { target: { value: overLimitText } });

    // Check that displayed count doesn't exceed 200
    const counter = screen.getByTestId('word-counter');
    expect(counter).toHaveTextContent(`${MAX_BIO_LENGTH}/200 characters`);
  });
});
