
const mockUseLoaderData = vi.fn();
const mockUseFetcherSubmit = vi.fn();

vi.mock('react-router', () => ({
  ...vi.importActual('react-router'),
  useLoaderData: () => mockUseLoaderData(),
  useFetcher: vi.fn(() => ({
    submit: mockUseFetcherSubmit,
  })),
  useNavigate: () => vi.fn(),
  useLocation: () => vi.fn(),
}));

import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render } from '~/utilities/testing';
import { Study } from './Study';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mockStartStudySessionFetcherRequest, mockStartStudySessionFetcherRequestTime, mockStopStudySessionFetcherSubmit } from '~/mocks';
import { ERROR_BOUNDARY_PAGE_TEXT } from '~/constants';


describe('Study', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockUseLoaderData.mockReturnValue({
      data: {},
      error: false,
    });
  });

  it('can start and stop session', async () => {
    vi.spyOn(Date, 'now').mockImplementation(() => mockStartStudySessionFetcherRequestTime );
    render(<Study/>);

    await userEvent.click(screen.getByRole('textbox'));
    await userEvent.click(screen.getByText('Mathematics'));

    await userEvent.click(screen.getByRole('button', { name: '15 minutes' }));

    await userEvent.click(screen.getByRole('button', { name: 'Start' }));

    expect(mockUseFetcherSubmit).toHaveBeenCalledWith(mockStartStudySessionFetcherRequest);

    await userEvent.click(screen.getByRole('button', { name: 'Stop' }));
    expect(mockUseFetcherSubmit).toHaveBeenCalledWith(mockStopStudySessionFetcherSubmit);
  });

  it('error on loader data causes error boundary to render', () => {
    mockUseLoaderData.mockReturnValueOnce({
      data: {},
      error: true,
    });
    render(<Study />);

    expect(screen.getByText(ERROR_BOUNDARY_PAGE_TEXT)).toBeInTheDocument();
  });
});