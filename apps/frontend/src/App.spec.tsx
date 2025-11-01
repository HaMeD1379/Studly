import { describe, expect, it } from 'vitest';
import { render } from '~/utilities/testing';
import { App } from './App';

describe('App.tsx', () => {
  it('renders', () => {
    render(<App />);

    expect(true).toBe(true);
  });
});
