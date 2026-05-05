import {
  jest,
  describe,
  it,
  expect,
  beforeEach,
  afterAll,
} from '@jest/globals';

const mockedDotenvConfig = jest.fn();

jest.mock('dotenv', () => ({
  __esModule: true,
  default: {
    config: mockedDotenvConfig,
  },
}));

const originalEnv = { ...process.env };

describe('env configuration', () => {
  beforeEach(() => {
    jest.resetModules();
    mockedDotenvConfig.mockClear();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = { ...originalEnv };
  });

  it('should load environment values when they are set', async () => {
    process.env.NODE_ENV = 'test';
    process.env.PORT = '5000';
    process.env.DB_URI = 'mongodb://test';
    process.env.JWT_SECRET = 'test-secret';

    const { default: config } = await import('../../../config/env.ts');

    expect(config.nodeEnv).toBe('test');
    expect(config.port).toBe('5000');
    expect(config.dbUri).toBe('mongodb://test');
    expect(config.jwtSecret).toBe('test-secret');
    expect(mockedDotenvConfig).toHaveBeenCalled();
  });

  it('should use fallback values when env vars are missing', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.PORT;
    delete process.env.DB_URI;
    delete process.env.JWT_SECRET;

    const { default: config } = await import('../../../config/env.ts');

    expect(config.nodeEnv).toBe('production');
    expect(config.port).toBe(3000);
    expect(config.dbUri).toBe('');
    expect(config.jwtSecret).toBe('');
  });

  it('should default NODE_ENV to development when NODE_ENV is missing', async () => {
    delete process.env.NODE_ENV;
    delete process.env.PORT;
    delete process.env.DB_URI;
    delete process.env.JWT_SECRET;

    const { default: config } = await import('../../../config/env.ts');

    expect(config.nodeEnv).toBe('development');
    expect(config.port).toBe(3000);
    expect(config.dbUri).toBe('');
    expect(config.jwtSecret).toBe('');
  });
});
