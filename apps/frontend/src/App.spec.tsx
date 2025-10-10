import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react';
import { App } from './App';
import { render } from '~/utilities/testing'

describe('App.tsx', () => {
  it('renders', () => {
    render(<App/>)

    expect(true).toBe(true);
  })
});