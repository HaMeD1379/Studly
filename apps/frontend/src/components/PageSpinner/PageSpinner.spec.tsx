vi.mock('react-router', () => ({
  useLocation: () => vi.fn().mockImplementation(() => {}),
  useNavigate: () => vi.fn().mockImplementation(() => {}),
}));

import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { render } from '~/utilities/testing';
import { PageSpinner } from './PageSpinner';

describe('PageSpinner', () => {
  it('renders', () => {
    render(<PageSpinner />);

    expect(screen.getByText('Studly')).toBeInTheDocument();
  });
});
