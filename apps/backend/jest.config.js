export default {
  testEnvironment: 'node',
  transform: {},
  extensionsToTreatAsEsm: ['.js'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^node:test$': '<rootDir>/tests/support/jestNodeTestShim.js',
  },

  testMatch: [
    '**/tests/**/*.test.js',
  ],
  
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',           // Exclude server startup
    '!src/index.js',             // Exclude entry point
    '!src/config/**',            // Exclude config files
  ],
  
  // Coverage thresholds (Sprint 1 targets)
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  testTimeout: 10000,
  
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  coverageReporters: ['text', 'lcov', 'html'],
  
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
  ],
};