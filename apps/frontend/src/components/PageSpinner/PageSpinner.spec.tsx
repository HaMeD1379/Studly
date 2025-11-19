import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { render } from '~/utilities/testing';
import { PageSpinner } from './PageSpinner';


describe('PageSpinner', () => {
  it('renders', () => {
    render(<PageSpinner/>);

    expect(screen.getByLabelText('loading-spinner')).toBeInTheDocument();
  });
});
