import { vi, expect, afterAll } from 'vitest';
import { request } from './requests';
import { RequestMethods } from '~/types';
import {
	failureMessageMock,
	failureRequestMock,
	failureStatusMock,
	successDataMock,
	successRequestMock,
} from '~/mocks';

describe('requests', () => {
	it('returns with data', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(() => successRequestMock),
		);

		const fetchRequest = await request(RequestMethods.GET, '/');

		expect(fetchRequest.data).not.toBeUndefined();
		expect(fetchRequest.error).toBeUndefined();
		expect(await fetchRequest.data).toEqual(successDataMock);
	});

	it('returns with error', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(() => failureRequestMock),
		);

		const fetchRequest = await request(RequestMethods.GET, '/');

		expect(fetchRequest.data).toBeUndefined();
		expect(fetchRequest.error).not.toBeUndefined();
		expect(fetchRequest.error).toEqual({
			status: failureStatusMock,
			message: failureMessageMock,
		});
	});

	afterAll(() => {
		vi.unstubAllGlobals();
	});
});
