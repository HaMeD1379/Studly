const mockUseLoaderData = vi.fn();

vi.mock('react-router', async () => {
  const actual =
    await vi.importActual<typeof import('react-router')>('react-router');
  return {
    ...actual,
    useLoaderData: () => mockUseLoaderData(),
  };
});

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  ERROR_BOUNDARY_PAGE_TEXT,
  HOME_NOTHING_FOUND_1,
  HOME_NOTHING_FOUND_2,
} from '~/constants';
import { mockHomePageLoaderData } from '~/mocks';
import { render } from '~/utilities/testing';
import { HomeActivityFeed } from './HomeActivityFeed';

describe('HomeActivityFeed', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockUseLoaderData.mockReturnValue(mockHomePageLoaderData);
  });

  it('renders', () => {
    render(<HomeActivityFeed />);

    expect(screen.getByText('MOCK_FULL_NAME_1')).toBeInTheDocument();
    expect(screen.getByText('MOCK_SUBJECT_1')).toBeInTheDocument();
    expect(screen.getByText('1 hour 1 minute')).toBeInTheDocument();
    expect(screen.getByText('Completed at 2025-11-10')).toBeInTheDocument();

    expect(screen.getByText('MOCK_FULL_NAME_2')).toBeInTheDocument();
    expect(screen.getByText('MOCK_BADGE_1')).toBeInTheDocument();
    expect(screen.getByText('MOCK_BADGE_DESCRIPTION_1')).toBeInTheDocument();
    expect(screen.getByText('Awarded at 2025-11-09')).toBeInTheDocument();

    expect(screen.getByText('MOCK_FULL_NAME_3')).toBeInTheDocument();
    expect(screen.getByText('MOCK_BADGE_2')).toBeInTheDocument();
    expect(screen.getByText('MOCK_BADGE_DESCRIPTION_2')).toBeInTheDocument();
    expect(screen.getByText('Awarded at 2025-11-08')).toBeInTheDocument();

    expect(screen.getByText('MOCK_FULL_NAME_4')).toBeInTheDocument();
    expect(screen.getByText('MOCK_BADGE_3')).toBeInTheDocument();
    expect(screen.getByText('MOCK_BADGE_DESCRIPTION_3')).toBeInTheDocument();
    expect(screen.getByText('Awarded at 2025-11-07')).toBeInTheDocument();

    expect(screen.getByText('MOCK_FULL_NAME_5')).toBeInTheDocument();
    expect(screen.getByText('MOCK_BADGE_4')).toBeInTheDocument();
    expect(screen.getByText('MOCK_BADGE_DESCRIPTION_4')).toBeInTheDocument();
    expect(screen.getByText('Awarded at 2025-11-06')).toBeInTheDocument();

    expect(screen.getByText('MOCK_FULL_NAME_6')).toBeInTheDocument();
    expect(screen.getByText('MOCK_BADGE_5')).toBeInTheDocument();
    expect(screen.getByText('MOCK_BADGE_DESCRIPTION_5')).toBeInTheDocument();
    expect(screen.getByText('Awarded at 2025-11-05')).toBeInTheDocument();
  });

  it('can go to the next page and render that feed', async () => {
    render(<HomeActivityFeed />);

    await userEvent.click(screen.getByRole('button', { name: '2' }));

    expect(screen.queryByText('MOCK_FULL_NAME_6')).not.toBeInTheDocument();
    expect(screen.queryByText('MOCK_BADGE_5')).not.toBeInTheDocument();
    expect(
      screen.queryByText('MOCK_BADGE_DESCRIPTION_5'),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Awarded at 2025-11-05')).not.toBeInTheDocument();

    expect(screen.getByText('MOCK_FULL_NAME_7')).toBeInTheDocument();
    expect(screen.getByText('MOCK_BADGE_6')).toBeInTheDocument();
    expect(screen.getByText('MOCK_BADGE_DESCRIPTION_6')).toBeInTheDocument();
    expect(screen.getByText('Awarded at 2025-11-04')).toBeInTheDocument();
  });

  it('shows error if loader data has an error', () => {
    mockUseLoaderData.mockReturnValue({
      data: {},
      error: true,
    });

    render(<HomeActivityFeed />);

    expect(screen.getByText(ERROR_BOUNDARY_PAGE_TEXT)).toBeInTheDocument();
  });

  it('shows nothing found display if no data is returned', () => {
    mockUseLoaderData.mockReturnValue({
      data: {},
      error: false,
    });

    render(<HomeActivityFeed />);

    expect(screen.getByText(HOME_NOTHING_FOUND_1)).toBeInTheDocument();
    expect(screen.getByText(HOME_NOTHING_FOUND_2)).toBeInTheDocument();
  });
});
