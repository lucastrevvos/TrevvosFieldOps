const base = require('./jest.config.cjs');

/** @type {import('jest').Config} */
module.exports = {
  ...base,
  displayName: 'api-integration',
  testMatch: ['<rootDir>/test/**/*.e2e-spec.ts', '<rootDir>/test/**/*.integration-spec.ts'],
  testTimeout: 60_000,
};
