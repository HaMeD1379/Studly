import { expect } from 'vitest';
import { render } from '~/utilities/testing';
import { StudyTips } from './StudyTips';
import { screen } from '@testing-library/react';

describe('StudyTips', () => {
	it('renders', () => {
		render(<StudyTips />);

		expect(screen.getByText('Study Tips')).not.toBeNull();
		expect(
			screen.getByText('Take regular breaks to maintain focus'),
		).not.toBeNull();
		expect(
			screen.getByText('Set specific goals for each session'),
		).not.toBeNull();
		expect(
			screen.getByText('Remove distractions from your study area'),
		).not.toBeNull();
		expect(
			screen.getByText('Celebrate completing your sessions'),
		).not.toBeNull();
	});
});
