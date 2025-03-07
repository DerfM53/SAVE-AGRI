/** @type {import('jest').Config} */
export default {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  setupFilesAfterEnv: ['./__tests__/setup.js'],
  verbose: true,
  detectOpenHandles: true,
  forceExit: true,
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  globalTeardown: './__tests__/setup.js'
};