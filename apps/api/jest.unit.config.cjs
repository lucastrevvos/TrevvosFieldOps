const base = require('./jest.config.cjs');

/** @type {import('jest').Config} */
module.exports = {
  ...base,
  displayName: 'api-unit',
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
};
