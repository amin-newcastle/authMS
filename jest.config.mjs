export default {
  transform: {
    '^.+\\.(ts|tsx|js|jsx|mjs)$': 'babel-jest',
  },
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'mjs', 'json'],
  transformIgnorePatterns: ['/node_modules/'],
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/src/tests/unit/**/*.test.*'],
      extensionsToTreatAsEsm: ['.ts'],
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/src/tests/integration/**/*.test.*'],
      extensionsToTreatAsEsm: ['.ts'],
      setupFilesAfterEnv: ['<rootDir>/src/tests/integration/setup.mjs'],
    },
  ],
};
