import {
  jest,
  describe,
  it,
  expect,
  beforeEach,
  afterAll,
} from '@jest/globals';

// Mock dotenv before env.ts is imported so we can control what gets loaded
const mockedDotenvConfig = jest.fn();

jest.mock('dotenv', () => ({
  __esModule: true,
  default: {
    config: mockedDotenvConfig,
  },
}));

// Snapshot the real process.env so we can restore it after each test
const originalEnv = { ...process.env };

describe('env configuration', () => {
  beforeEach(() => {
    jest.resetModules(); // Force env.ts to re-execute on each dynamic import
    mockedDotenvConfig.mockClear();
    process.env = { ...originalEnv }; // Reset env vars to avoid test bleed
  });

  afterAll(() => {
    process.env = { ...originalEnv }; // Restore env after all tests in this file
  });

  it('should load environment values when they are set', async () => {
    // Arrange
    process.env.NODE_ENV = 'test';
    process.env.PORT = '5000';
    process.env.DB_URI = 'mongodb://test';
    process.env.JWT_SECRET = 'test-secret';

    // Act: dynamic import picks up the resetModules + env vars set above
    const { default: config } = await import('../../../config/env.ts');

    // Assert
    expect(config.nodeEnv).toBe('test');
    expect(config.port).toBe('5000');
    expect(config.dbUri).toBe('mongodb://test');
    expect(config.jwtSecret).toBe('test-secret');
    expect(mockedDotenvConfig).toHaveBeenCalled(); // dotenv.config should have been called
  });

  it('should use fallback values when env vars are missing', async () => {
    // Arrange
    process.env.NODE_ENV = 'production';
    delete process.env.PORT;
    delete process.env.DB_URI;
    delete process.env.JWT_SECRET;

    // Act
    const { default: config } = await import('../../../config/env.ts');

    // Assert
    expect(config.nodeEnv).toBe('production');
    expect(config.port).toBe(3000); // Falls back to hardcoded default
    expect(config.dbUri).toBe(''); // Falls back to empty string
    expect(config.jwtSecret).toBe('');
  });

  it('should default NODE_ENV to development when NODE_ENV is missing', async () => {
    // Arrange
    delete process.env.NODE_ENV;
    delete process.env.PORT;
    delete process.env.DB_URI;
    delete process.env.JWT_SECRET;

    // Act
    const { default: config } = await import('../../../config/env.ts');

    // Assert
    expect(config.nodeEnv).toBe('development'); // Falls back to 'development'
    expect(config.port).toBe(3000);
    expect(config.dbUri).toBe('');
    expect(config.jwtSecret).toBe('');
  });
});
