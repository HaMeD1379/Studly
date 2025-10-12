import { describe, it, expect } from 'vitest';
import { render } from '~/utilities/testing';
import { RecentStudySessions } from './RecentStudySessions';
import { screen } from '@testing-library/react';
import { mockRecentStudySessions} from '~/mocks'

describe('RecentStudySessions', () => {
  it('renders without data', () => {
    render(<RecentStudySessions recentStudySessions={[]} />);

    expect(screen.getByText('Recent Sessions')).not.toBeNull();
    expect(screen.getByText('No sessions completed yet.')).not.toBeNull();
    expect(screen.getByText('Start your first session!')).not.toBeNull();
  });

  it('renders with data', () => {
    render(<RecentStudySessions recentStudySessions={mockRecentStudySessions} />);

    expect(screen.getByText('Session Ended')).not.toBeNull();
    expect(screen.getByText('Subject')).not.toBeNull();
    expect(screen.getByText('Length')).not.toBeNull();

    expect(screen.getByText('2025/09/06 - 10:09 PM')).not.toBeNull();
    expect(screen.getByText('Mathematics')).not.toBeNull();
    expect(screen.getByText('1 hour and 1 minute')).not.toBeNull();

    expect(screen.getByText('2025/09/05 - 1:28 PM')).not.toBeNull();
    expect(screen.getByText('Computer Science')).not.toBeNull();
    expect(screen.getByText('4 minutes')).not.toBeNull();

    expect(screen.getByText('2025/08/02 - 7:22 AM')).not.toBeNull();
    expect(screen.getByText('Chemistry')).not.toBeNull();
    expect(screen.getByText('12 hours and 35 minutes')).not.toBeNull();
  });
});