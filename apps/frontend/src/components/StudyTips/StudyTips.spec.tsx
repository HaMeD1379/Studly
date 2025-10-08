import { expect } from 'vitest';
import { render } from '~/utilities/testing'
import { StudyTips } from './StudyTips';
import { screen } from '@testing-library/react';

describe('StudyTips', () => {
  it('renders', () => {
    render(<StudyTips/>);

    expect(screen.getByText('Take regular breaks to maintain focus')).not.toBeNull();
  });
});