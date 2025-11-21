const mockUseLoaderData = vi.fn();

vi.mock('react-router', () => ({
  ...vi.importActual('react-router'),
  useLoaderData: () => mockUseLoaderData(),
}));

import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { Leaderboard } from "./Leaderboard";
import { LOGIN } from "~/constants";
import { expect, it, describe, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "~/utilities/testing";
import { mockLeaderboardLoaderResponse } from "~/mocks";
import userEvent from "@testing-library/user-event";

const router = createMemoryRouter([{ element: <Leaderboard />, path: LOGIN}]);

describe('Leaderboard', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockUseLoaderData.mockReturnValue(mockLeaderboardLoaderResponse);
  });

  it('renders', () => {
    render(<RouterProvider router={router} />);

    expect(screen.getByText('Leaderboard')).toBeInTheDocument();
    expect(screen.getByText('See how you rank among your fellow students')).toBeInTheDocument();

    expect(screen.getByRole('radio', { name: 'Study Time' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Badges' })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Friends Only' })).toBeInTheDocument();

    expect(screen.getByText('Study Time Leaders')).toBeInTheDocument();
    expect(screen.getByText('Weekly study time rankings')).toBeInTheDocument();

    expect(screen.queryByText('There is no data for this leaderboard')).not.toBeInTheDocument();
  });

  it('can render badges leaderboard', async () => {
    render(<RouterProvider router={router} />);

    const badgesButton = screen.getByRole('radio', { name: 'Badges' });
    await userEvent.click(badgesButton);

    expect(screen.queryByText('There is no data for this leaderboard')).not.toBeInTheDocument();
  });

  it('can render study and badges leaderboard with friends only', async () => {
    render(<RouterProvider router={router} />);

    const friendsOnlyButton = screen.getByRole('button', { name: 'Friends Only' });
    await userEvent.click(friendsOnlyButton);

    expect(screen.queryByText('There is no data for this leaderboard')).not.toBeInTheDocument();

    const badgesButton = screen.getByRole('radio', { name: 'Badges' });
    await userEvent.click(badgesButton);

    expect(screen.queryByText('There is no data for this leaderboard')).not.toBeInTheDocument();
  });

  it('renders error', () => {
    mockUseLoaderData.mockReturnValue({
      data: {
        global: {
          studyTime: [],
          badges: [],
        },
        friends: {
          studyTime: [],
          badges: [],
        },
      },
      error: true,
    });
    render(<RouterProvider router={router} />);

    expect(screen.getByText('Uh oh! Something went wrong! Please try again later or refresh the page.')).toBeInTheDocument();
  })
});