const mockOnUpdateSubject = vi.fn();
const mockonUpdateLength = vi.fn();

import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, vi } from 'vitest';
import { render } from '~/utilities/testing';
import { SetupStudySession } from './SetupStudySession';

describe('SetupStudySession', () => {
  it('renders', () => {
    render(
      <SetupStudySession
        onUpdateLength={mockonUpdateLength}
        onUpdateSubject={mockOnUpdateSubject}
      />,
    );

    expect(screen.getByText('Session Setup')).not.toBeNull();

    expect(screen.getByText('Subject')).not.toBeNull();

    expect(screen.getByText('Quick Session Length')).not.toBeNull();
    expect(screen.getByText('15 minutes')).not.toBeNull();
    expect(screen.getByText('30 minutes')).not.toBeNull();
    expect(screen.getByText('45 minutes')).not.toBeNull();
    expect(screen.getByText('1 hour')).not.toBeNull();

    expect(screen.getByText('Custom Session Length')).not.toBeNull();
    expect(screen.getByText('Custom time is in format hh:mm')).not.toBeNull();
  });

  it('can view and change the subject', async () => {
    render(
      <SetupStudySession
        onUpdateLength={mockonUpdateLength}
        onUpdateSubject={mockOnUpdateSubject}
      />,
    );

    const subjectDropdown = screen.getByRole('textbox');
    await userEvent.click(subjectDropdown);

    const mathematics = screen.getByText('Mathematics');
    expect(mathematics).not.toBeNull();

    await userEvent.click(mathematics);

    expect(mockOnUpdateSubject).toHaveBeenCalledWith('Mathematics');
    expect(screen.getByText('Mathematics')).not.toBeNull();
  });

  it('can click all quick buttons', async () => {
    render(
      <SetupStudySession
        onUpdateLength={mockonUpdateLength}
        onUpdateSubject={mockOnUpdateSubject}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: '15 minutes' }));
    await userEvent.click(screen.getByRole('button', { name: '30 minutes' }));
    await userEvent.click(screen.getByRole('button', { name: '45 minutes' }));
    await userEvent.click(screen.getByRole('button', { name: '1 hour' }));
  });

  it('can set time and custom time', async () => {
    render(
      <SetupStudySession
        onUpdateLength={mockonUpdateLength}
        onUpdateSubject={mockOnUpdateSubject}
      />,
    );

    const roles = screen.getByLabelText(/custom session length/i);
    await userEvent.click(roles);

    await act(async () => {
      screen.getByText('03').click();
    });

    await act(async () => {
      screen.getByText('30').click();
    });

    expect(mockonUpdateLength).toHaveBeenCalledWith(12600000);

    await userEvent.click(screen.getByText('Session Setup'));
    expect(roles.ariaValueNow).toEqual('3');

    await userEvent.click(screen.getByRole('button', { name: '15 minutes' }));
    expect(roles.ariaValueNow).toEqual('0');
  });
});
