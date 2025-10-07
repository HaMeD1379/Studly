import { render } from '~/utilities/testing'
import { StudySession } from './StudySession'
import { screen } from '@testing-library/react';
import { expect } from 'vitest';

describe('StudySession', () => {
  it('renders', () => {
    render(<StudySession/>);

    expect(screen.getByText('Current Session')).not.toBeNull();
    expect(screen.getByText('Configure your study session')).not.toBeNull();
  })
})