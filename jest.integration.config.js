module.exports = {
  displayName: 'integration',
  testMatch: ['<rootDir>/src/tests/integration/**/*.test.js'],
  testEnvironment: 'node',
  clearMocks: true,
  setupFilesAfterEnv: ['<rootDir>/src/tests/integration/setup.js'],
};
