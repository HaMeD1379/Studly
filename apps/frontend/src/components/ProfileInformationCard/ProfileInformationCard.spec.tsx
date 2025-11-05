vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: vi.fn(),
  },
}));

import { notifications } from '@mantine/notifications';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { render } from '~/utilities/testing';
import { profileInformationCard as ProfileInformationCard } from './ProfileInformationCard';

beforeEach(() => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
    if (key === 'fullName') return 'John Doe';
    if (key === 'email') return 'john@example.com';
    return null;
  });
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
});

describe('profileInformationCard', () => {
  it('renders all profile information elements', () => {
    render(<ProfileInformationCard />);

    // Headings and texts
    expect(screen.getByTestId('profile-info-text')).toBeInTheDocument();
    expect(screen.getByTestId('profile-info-subtext')).toBeInTheDocument();
    expect(screen.getByTestId('accepted-images')).toBeInTheDocument();
    expect(screen.getByTestId('name-text')).toBeInTheDocument();
    expect(screen.getByTestId('email-text')).toBeInTheDocument();
    expect(screen.getByTestId('bio-text')).toBeInTheDocument();

    // Buttons and avatar

    expect(screen.getByText('JD')).toBeInTheDocument();
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

  it('updates name, email, and bio inputs correctly', () => {
    render(<ProfileInformationCard />);

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
    render(<ProfileInformationCard />);

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
    render(<ProfileInformationCard />);
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
    render(<ProfileInformationCard />);
    const change_btn = screen.getByTestId(/avatar-change-btn/i);
    fireEvent.click(change_btn);
    expect(notifications.show).toHaveBeenCalledWith({
      color: 'red',
      message: 'The action you have requested is not available at this time',
      title: 'Not Supported',
    });
  });
});
