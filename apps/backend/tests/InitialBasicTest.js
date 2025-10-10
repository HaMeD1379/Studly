import { describe, it, expect } from '@jest/globals';

describe('Smoke Test', () => {
  it('should verify Jest is working', () => {
    expect(true).toBe(true);
  });

  it('should verify math operations', () => {
    expect(2 + 2).toBe(4);
  });
});