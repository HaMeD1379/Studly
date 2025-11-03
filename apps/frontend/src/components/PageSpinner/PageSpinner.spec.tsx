vi.mock('react-router', () => ({
  useLocation: () => vi.fn().mockImplementation(() => {}),
  useNavigate: () => vi.fn().mockImplementation(() => {}),
}));

import { screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { render } from '~/utilities/testing';
import { PageSpinner } from './PageSpinner';

const router = createMemoryRouter([{ element: <PageSpinner />, path: '/' }]);

describe('PageSpinner', () => {
  it('renders', () => {
    render(<RouterProvider router={router} />);

    expect(screen.getByText('Studly')).toBeInTheDocument();
  });
});
