// Each Jest project needs these settings explicitly; root settings are not inherited.
const projectConfig = {
  transform: {
    '^.+\\.(ts|tsx|js|jsx|mjs)$': 'babel-jest',
  },
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'mjs', 'json'],
  transformIgnorePatterns: ['/node_modules/'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};

export default {
  projects: [
    {
      ...projectConfig,
      displayName: 'unit',
      testMatch: ['<rootDir>/src/tests/unit/**/*.test.*'],
    },
    {
      ...projectConfig,
      displayName: 'integration',
      testMatch: ['<rootDir>/src/tests/integration/**/*.test.*'],
      setupFilesAfterEnv: ['<rootDir>/src/tests/integration/setup.mjs'],
    },
  ],
};
