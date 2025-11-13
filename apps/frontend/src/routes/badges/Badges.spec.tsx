const mockUseLoaderData = vi.fn();

vi.mock('react-router', () => ({
  ...vi.importActual('react-router'),
  useLoaderData: () => mockUseLoaderData(),
}));

import { screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ERROR_BOUNDARY_PAGE_TEXT } from '~/constants';
import { mockAllBadges, mockAllUnlockedBadges } from '~/mocks';
import { render } from '~/utilities/testing';
import { Badges } from './Badges';

const router = createMemoryRouter([{ element: <Badges />, path: '/' }]);

describe('Badges', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders', async () => {
    mockUseLoaderData.mockReturnValueOnce({
      data: {
        unlockedBadges: mockAllUnlockedBadges,
        allBadges: mockAllBadges,
      },
      error: false,
    });
    render(<RouterProvider router={router} />);

    expect(screen.queryByText('No badges unlocked yet! Start Studying to earn badges!')).not.toBeInTheDocument();
    expect(screen.getByText('Badge Collection')).toBeInTheDocument();
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
