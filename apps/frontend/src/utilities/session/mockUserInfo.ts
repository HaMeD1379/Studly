import { vi } from 'vitest';
import type { BioStore } from '~/store/userInfoStore';

export const createMockBioStore = (
  overrides: Partial<BioStore> = {},
): BioStore =>
  ({
    bio: '',
    email: '',
    isAccessStored: false,
    name: '',
    refreshToken: '',
    sessionId: '',
    setAccessStored: vi.fn(),
    setBio: vi.fn(),
    setCheckAccess: vi.fn(),
    setEmail: vi.fn(),

    setId: vi.fn(),
    setName: vi.fn(),
    setRefreshToken: vi.fn(),
    setSessId: vi.fn(),
    userId: '',

    ...overrides,
  }) as BioStore;
