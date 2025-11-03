import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ERROR_BOUNDARY_PAGE_TEXT } from '~/constants';
import { render } from '~/utilities/testing';
import { ErrorBoundary } from './ErrorBoundary';

describe('ErrorBoundary', () => {
  it('renders', () => {
    render(<ErrorBoundary />);

    expect(screen.getByText(ERROR_BOUNDARY_PAGE_TEXT)).toBeInTheDocument();
  });
});
