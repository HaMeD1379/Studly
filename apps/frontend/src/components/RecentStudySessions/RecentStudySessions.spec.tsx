import { describe, it, expect } from 'vitest';
import { render } from '~/utilities/testing';
import { RecentStudySessions } from './RecentStudySessions';
import { screen } from '@testing-library/react';
import { mockRecentStudySessions } from '~/mocks';

describe('RecentStudySessions', () => {
  it('renders without data', () => {
    render(<RecentStudySessions recentStudySessions={[]} />);

    expect(screen.getByText('Recent Sessions')).not.toBeNull();
    expect(screen.getByText('No sessions completed yet.')).not.toBeNull();
    expect(screen.getByText('Start your first session!')).not.toBeNull();
  });

  it('renders with data', () => {
    render(
      <RecentStudySessions recentStudySessions={mockRecentStudySessions} />,
    );

    expect(screen.getByText('Session Ended')).not.toBeNull();
    expect(screen.getByText('Subject')).not.toBeNull();
    expect(screen.getByText('Length')).not.toBeNull();

    // Regex made by hand through regex101
    expect(
      screen.getAllByText(
        /^[0-9]{4}\/[0-9]{2}\/[0-9]{2} - [0-9]+:[0-9]{2} (PM|AM)$/,
      )?.length,
    ).toEqual(3);

    expect(screen.getByText('Mathematics')).not.toBeNull();
    expect(screen.getByText('1 hour and 1 minute')).not.toBeNull();

    expect(screen.getByText('Computer Science')).not.toBeNull();
    expect(screen.getByText('4 minutes')).not.toBeNull();

    expect(screen.getByText('Chemistry')).not.toBeNull();
    expect(screen.getByText('12 hours and 35 minutes')).not.toBeNull();
  });
});
