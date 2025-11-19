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
});
