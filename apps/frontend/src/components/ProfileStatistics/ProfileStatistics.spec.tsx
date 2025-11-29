import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockProfileStatisticsLoaderData } from '~/mocks';
import { render } from '~/utilities/testing';
import { ProfileStatistics } from './ProfileStatistics';

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return {
    ...actual,
    useLoaderData: () => mockProfileStatisticsLoaderData,
  };
});

describe('ProfileStatistics Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders 'This Week' statistics", () => {
    render(<ProfileStatistics />);

    expect(screen.getByTestId('totalMinStudied')).toHaveTextContent(
      '3 hours 0 minutes',
    );

    expect(screen.getByTestId('SessionCompleted')).toHaveTextContent('5');

    expect(screen.getAllByText('Math').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Physics').length).toBeGreaterThan(0);
  });

  it('renders recent badges correctly', () => {
    render(<ProfileStatistics />);

    const card = screen.getByTestId('recent-badges-card');
    expect(card).toBeInTheDocument();

    expect(screen.getByText('5 Sessions')).toBeInTheDocument();
    expect(screen.getByText('3 Hours')).toBeInTheDocument();
  });

  it('renders subject distribution section', () => {
    render(<ProfileStatistics />);

    const card = screen.getByTestId('subject-distribution-card');
    expect(card).toBeInTheDocument();

    expect(screen.getAllByText('Math').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Physics').length).toBeGreaterThan(0);
  });
});
