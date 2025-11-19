import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { mockRecentStudySessions } from '~/mocks';
import { render } from '~/utilities/testing';
import { RecentStudySessions } from './RecentStudySessions';

describe('RecentStudySessions', () => {
  it('renders without data', () => {
    render(<RecentStudySessions recentStudySessions={[]} />);

    expect(screen.getByText('Recent Sessions')).not.toBeNull();
    expect(screen.getByText('No sessions completed yet')).not.toBeNull();
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
    expect(screen.getByText('25 minutes')).not.toBeNull();

    expect(screen.getByText('Chemistry')).not.toBeNull();
    expect(screen.getByText('7 hours and 33 minutes')).not.toBeNull();
  });
});
