import { describe, it, expect } from 'vitest';
import { validateEmail } from './emailValidation';

describe('validateEmail', () => {
  it('returns true for a valid email', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });

  it('returns false for an invalid email', () => {
    expect(validateEmail('invalid-email')).toBe(false);
  });
});
