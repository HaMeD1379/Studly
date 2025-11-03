const mockUseLoaderData = vi.fn();
const mockUseFetcherSubmit = vi.fn();

vi.mock('react-router', () => ({
  ...vi.importActual('react-router'),
  useFetcher: vi.fn(() => ({
    submit: mockUseFetcherSubmit,
  })),
  useLoaderData: () => mockUseLoaderData(),
  useLocation: () => vi.fn(),
  useNavigate: () => vi.fn(),
}));

import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ERROR_BOUNDARY_PAGE_TEXT } from '~/constants';
import {
  mockStartStudySessionFetcherRequest,
  mockStartStudySessionFetcherRequestTime,
  mockStopStudySessionFetcherSubmit,
} from '~/mocks';
import { render } from '~/utilities/testing';
import { Study } from './Study';

const router = createMemoryRouter([{ element: <Study />, path: '/' }]);
describe('Study', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockUseLoaderData.mockReturnValue({
      data: {},
      error: false,
    });
  });

  it('can start and stop session', async () => {
    vi.spyOn(Date, 'now').mockImplementation(
      () => mockStartStudySessionFetcherRequestTime,
    );
    render(<RouterProvider router={router} />);

    await userEvent.click(screen.getByRole('textbox'));
    await userEvent.click(screen.getByText('Mathematics'));

    await userEvent.click(screen.getByRole('button', { name: '15 minutes' }));

    await userEvent.click(screen.getByRole('button', { name: 'Start' }));

    expect(mockUseFetcherSubmit).toHaveBeenCalledWith(
      mockStartStudySessionFetcherRequest,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Stop' }));
    expect(mockUseFetcherSubmit).toHaveBeenCalledWith(
      mockStopStudySessionFetcherSubmit,
    );
  });

  it('error on loader data causes error boundary to render', () => {
    mockUseLoaderData.mockReturnValueOnce({
      data: {},
      error: true,
    });
    render(<RouterProvider router={router} />);

    expect(screen.getByText(ERROR_BOUNDARY_PAGE_TEXT)).toBeInTheDocument();
  });
});
