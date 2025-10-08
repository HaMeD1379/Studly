const mockOnStart = vi.fn();
const mockOnStop = vi.fn();

import { render } from '~/utilities/testing'
import { StudySession } from './StudySession'
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event'
import { expect, vi } from 'vitest';

describe('StudySession', () => {
  it('renders', () => {
    render(<StudySession onStartStudy={mockOnStart} onStopStudy={mockOnStop}/>);

    expect(screen.getByText('Current Session')).not.toBeNull();
    expect(screen.getByText('Configure your study session')).not.toBeNull();
    expect(screen.getByText('00:00')).not.toBeNull();
    expect(screen.getByText('0 seconds remaining')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Start' })).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Stop' })).not.toBeNull();
  });

  it('clicking start and stop study session calls functions and disables self', async () => {
    let mockStartTimestamp = 0;
    let mockEndTimestamp = 0;

    const { rerender } = render(
      <StudySession
        startStudyTimestamp={mockStartTimestamp}
        endStudyTimestamp={mockEndTimestamp}
        onStartStudy={mockOnStart}
        onStopStudy={mockOnStop}
      />
    );

    let startButton = screen.getByRole('button', { name: 'Start' });
    let stopButton = screen.getByRole('button', { name: 'Stop' });

    expect(startButton.getAttribute('disabled')).toBeNull();
    expect(stopButton.getAttribute('disabled')).not.toBeNull();

    await userEvent.click(startButton);

    expect(mockOnStart).toHaveBeenCalled();

    mockStartTimestamp = Date.now();
    mockEndTimestamp = Date.now() + 60000;

    rerender(
      <StudySession
        startStudyTimestamp={mockStartTimestamp}
        endStudyTimestamp={mockEndTimestamp}
        onStartStudy={mockOnStart}
        onStopStudy={mockOnStop}
      />
    );

    startButton = screen.getByRole('button', { name: 'Start' });
    stopButton = screen.getByRole('button', { name: 'Stop' });

    expect(startButton.getAttribute('disabled')).not.toBeNull();
    expect(stopButton.getAttribute('disabled')).toBeNull();

    await userEvent.click(stopButton);

    expect(mockOnStop).toHaveBeenCalled();

    mockStartTimestamp = 0;
    mockEndTimestamp = 0;

    rerender(
      <StudySession
        startStudyTimestamp={mockStartTimestamp}
        endStudyTimestamp={mockEndTimestamp}
        onStartStudy={mockOnStart}
        onStopStudy={mockOnStop}
      />
    );

    startButton = screen.getByRole('button', { name: 'Start' });
    stopButton = screen.getByRole('button', { name: 'Stop' });

    expect(startButton.getAttribute('disabled')).toBeNull();
    expect(stopButton.getAttribute('disabled')).not.toBeNull();
  });
})