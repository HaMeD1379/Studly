import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { userInfoStore } from '~/store/userInfoStore';
import { render } from '~/utilities/testing';
import { Avatar } from './Avatar';

const mockName = 'John Doe';
vi.mock('~/store/userInfoStore', () => ({
  userInfoStore: vi.fn(() => ({
    name: mockName,
  })),
}));

describe('Avatar component Test', () => {
  it('should render an Avatar component using name from store', () => {
    const { name } = userInfoStore();
    render(<Avatar name={name} />);

    const initials = screen.getByText('JD');
    expect(initials).toBeInTheDocument();
  });
});
