import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { render } from '~/utilities/testing';
import { Avatar } from './Avatar';

const mockName = 'John Doe';

describe('Avatar component Test', () => {
  it('should render an Avatar component using name from store', () => {
    render(<Avatar name={mockName} />);

    const initials = screen.getByText('JD');
    expect(initials).toBeInTheDocument();
  });
  it('renders the online status dot', () => {
    render(<Avatar name='John Doe' status='online' />);
    const statusDot = screen.getByTestId('status-dot');
    expect(statusDot).toHaveStyle('background-color: #40c057');
  });

  it('renders the studying status dot', () => {
    render(<Avatar name='Jane Doe' status='studying' />);
    const statusDot = screen.getByTestId('status-dot');
    expect(statusDot).toHaveStyle('background-color: #228be6');
  });

  it('renders the offline status dot by default', () => {
    render(<Avatar name='Alice' />);
    const statusDot = screen.getByTestId('status-dot');
    expect(statusDot).toHaveStyle('background-color: #adb5bd');
  });
});
