vi.mock('react-router', () => ({
  useLocation: () => vi.fn().mockImplementation(() => {}),
  useNavigate: () => vi.fn().mockImplementation(() => {}),
}));

import { screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { render } from '~/utilities/testing';
import { PageSpinner } from './PageSpinner';
import { LOGIN } from '~/constants';

const router = createMemoryRouter([{ element: <PageSpinner />, path: LOGIN }]);

describe('PageSpinner', () => {
  it('renders', () => {
    render(<RouterProvider router={router} />);

    expect(screen.getByText('Studly')).toBeInTheDocument();
  });
});
