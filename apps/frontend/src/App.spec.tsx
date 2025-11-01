import { describe, it, expect } from 'vitest';
import { App } from './App';
import { render } from '~/utilities/testing';

describe('App.tsx', () => {
	it('renders', () => {
		render(<App />);

		expect(true).toBe(true);
	});
});
