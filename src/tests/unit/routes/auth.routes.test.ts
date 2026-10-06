import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import request from 'supertest';

import AuthService from '../../../api/services/auth.service.ts';
import app from '../../../app.ts';

jest.mock('../../../api/services/auth.service.ts', () => ({
  __esModule: true,
  default: {
    registerUser: jest.fn(),
    loginUser: jest.fn(),
  },
}));

type MockedAuthService = {
  registerUser: jest.MockedFunction<typeof AuthService.registerUser>;
  loginUser: jest.MockedFunction<typeof AuthService.loginUser>;
};

type ValidationErrorResponse = {
  success: false;
  message: string;
  errors: { field: string; message: string }[];
};

const mockedAuthService = AuthService as unknown as MockedAuthService;
const validCredentials = { username: 'testuser', password: 'password123' };

const expectValidationError = (
  body: unknown,
  expectedFields: string[],
): void => {
  expect(body).toEqual({
    success: false,
    message: 'Invalid request body',
    errors: expect.any(Array),
  });

  const { errors } = body as ValidationErrorResponse;
  expect(errors.length).toBeGreaterThan(0);
  expect(errors.map(({ field }) => field)).toEqual(
    expect.arrayContaining(expectedFields),
  );
  for (const error of errors) {
    expect(error).toEqual({
      field: expect.stringMatching(/^(username|password|body)$/),
      message: expect.any(String),
    });
    expect(error.message.length).toBeGreaterThan(0);
  }

  expect(mockedAuthService.registerUser).not.toHaveBeenCalled();
  expect(mockedAuthService.loginUser).not.toHaveBeenCalled();
};

describe('authentication request validation', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockedAuthService.registerUser.mockResolvedValue({
      _id: '123',
      username: 'testuser',
      password: 'private-password-hash',
    } as unknown as Awaited<ReturnType<typeof AuthService.registerUser>>);
    mockedAuthService.loginUser.mockResolvedValue('fake.jwt.token');
  });

  describe.each(['register', 'login'])('POST /api/v1/auth/%s', (route) => {
    it.each([
      ['both fields missing', {}, ['username', 'password']],
      ['username missing', { password: 'password123' }, ['username']],
      ['password missing', { username: 'testuser' }, ['password']],
      ['empty username', { ...validCredentials, username: '' }, ['username']],
      [
        'whitespace-only username',
        { ...validCredentials, username: ' \t\n ' },
        ['username'],
      ],
      ['empty password', { ...validCredentials, password: '' }, ['password']],
      ['null username', { ...validCredentials, username: null }, ['username']],
      [
        'numeric username',
        { ...validCredentials, username: 123 },
        ['username'],
      ],
      [
        'boolean username',
        { ...validCredentials, username: true },
        ['username'],
      ],
      [
        'array username',
        { ...validCredentials, username: ['testuser'] },
        ['username'],
      ],
      [
        'query operator username',
        { ...validCredentials, username: { $ne: null } },
        ['username'],
      ],
      ['null password', { ...validCredentials, password: null }, ['password']],
      [
        'numeric password',
        { ...validCredentials, password: 123 },
        ['password'],
      ],
      [
        'boolean password',
        { ...validCredentials, password: false },
        ['password'],
      ],
      [
        'array password',
        { ...validCredentials, password: ['password123'] },
        ['password'],
      ],
      [
        'query operator password',
        { ...validCredentials, password: { $ne: null } },
        ['password'],
      ],
    ])(
      'rejects %s before calling the service',
      async (_label, body, fields) => {
        const response = await request(app)
          .post(`/api/v1/auth/${route}`)
          .send(body)
          .expect(400);

        expectValidationError(response.body, fields as string[]);
      },
    );

    it.each([
      ['null', 'null'],
      ['array', '[]'],
      ['string', '"testuser"'],
      ['number', '123'],
      ['boolean', 'true'],
    ])('rejects a %s request body', async (_label, body) => {
      const response = await request(app)
        .post(`/api/v1/auth/${route}`)
        .set('Content-Type', 'application/json')
        .send(body)
        .expect(400);

      expectValidationError(response.body, ['body']);
    });

    it('rejects a missing request body', async () => {
      const response = await request(app)
        .post(`/api/v1/auth/${route}`)
        .expect(400);

      expectValidationError(response.body, ['username', 'password']);
    });

    it('returns a safe validation response for malformed JSON', async () => {
      const response = await request(app)
        .post(`/api/v1/auth/${route}`)
        .set('Content-Type', 'application/json')
        .send('{"username":"private-submitted-username","password":')
        .expect(400);

      expectValidationError(response.body, ['body']);
      expect(response.body.errors).toEqual([
        {
          field: 'body',
          message: 'Request body must be a valid JSON object',
        },
      ]);
      expect(JSON.stringify(response.body)).not.toContain(
        'private-submitted-username',
      );
    });

    it('does not include submitted values in validation errors', async () => {
      const response = await request(app)
        .post(`/api/v1/auth/${route}`)
        .send({
          username: { $ne: 'private-submitted-username' },
          password: { $ne: 'private-submitted-password' },
        })
        .expect(400);

      expectValidationError(response.body, ['username', 'password']);
      expect(JSON.stringify(response.body)).not.toContain(
        'private-submitted-username',
      );
      expect(JSON.stringify(response.body)).not.toContain(
        'private-submitted-password',
      );
    });
  });

  describe('registration', () => {
    it.each([
      [
        'username below minimum',
        { ...validCredentials, username: 'ab' },
        'username',
      ],
      [
        'username above maximum',
        { ...validCredentials, username: 'a'.repeat(33) },
        'username',
      ],
      [
        'password below minimum',
        { ...validCredentials, password: 'a'.repeat(7) },
        'password',
      ],
      [
        'Unicode password below minimum character count',
        { ...validCredentials, password: '\u{1f600}'.repeat(7) },
        'password',
      ],
      [
        'password above maximum',
        { ...validCredentials, password: 'a'.repeat(73) },
        'password',
      ],
      [
        'multibyte password above bcrypt byte limit',
        { ...validCredentials, password: '\u00e9'.repeat(37) },
        'password',
      ],
      [
        'trimmed username below minimum',
        { ...validCredentials, username: '  ab  ' },
        'username',
      ],
    ])('rejects %s', async (_label, body, field) => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(body)
        .expect(400);

      expectValidationError(response.body, [field as string]);
    });

    it.each([
      ['minimum username length', { ...validCredentials, username: 'abc' }],
      [
        'maximum username length',
        { ...validCredentials, username: 'a'.repeat(32) },
      ],
      [
        'maximum Unicode username character count',
        { ...validCredentials, username: '\u{1f600}'.repeat(32) },
      ],
      [
        'minimum password length',
        { ...validCredentials, password: 'a'.repeat(8) },
      ],
      [
        'minimum Unicode password character count',
        { ...validCredentials, password: '\u{1f600}'.repeat(8) },
      ],
      [
        'maximum password length',
        { ...validCredentials, password: 'a'.repeat(72) },
      ],
      [
        'multibyte password at bcrypt byte limit',
        { ...validCredentials, password: '\u00e9'.repeat(36) },
      ],
    ])('accepts %s', async (_label, body) => {
      await request(app).post('/api/v1/auth/register').send(body).expect(201);

      expect(mockedAuthService.registerUser).toHaveBeenCalledTimes(1);
      expect(mockedAuthService.registerUser).toHaveBeenCalledWith(body);
      expect(mockedAuthService.loginUser).not.toHaveBeenCalled();
    });

    it('trims username, preserves password whitespace, and strips unknown fields', async () => {
      const password = '  password123  ';
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({ username: '  testuser \t', password, admin: true })
        .expect(201);

      expect(mockedAuthService.registerUser).toHaveBeenCalledWith({
        username: 'testuser',
        password,
      });
      expect(response.body).toEqual({
        success: true,
        message: 'User registered successfully',
        user: { _id: '123', username: 'testuser' },
      });
    });

    it('measures username length after trimming', async () => {
      const username = 'a'.repeat(32);
      await request(app)
        .post('/api/v1/auth/register')
        .send({ username: `  ${username}  `, password: 'password123' })
        .expect(201);

      expect(mockedAuthService.registerUser).toHaveBeenCalledWith({
        username,
        password: 'password123',
      });
    });
  });

  describe('login', () => {
    it('preserves credential whitespace and strips unknown fields', async () => {
      const username = '  testuser \t';
      const password = '  password123  ';
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ username, password, admin: true })
        .expect(200);

      expect(mockedAuthService.loginUser).toHaveBeenCalledWith({
        username,
        password,
      });
      expect(response.body).toEqual({ success: true, token: 'fake.jwt.token' });
      expect(mockedAuthService.registerUser).not.toHaveBeenCalled();
    });

    it.each([
      ['short existing credentials', { username: 'a', password: 'pwd' }],
      [
        'existing credentials above registration limits',
        { username: 'a'.repeat(33), password: 'a'.repeat(73) },
      ],
      [
        'existing whitespace-only password',
        { username: 'testuser', password: ' ' },
      ],
    ])('allows %s to reach authentication', async (_label, body) => {
      await request(app).post('/api/v1/auth/login').send(body).expect(200);

      expect(mockedAuthService.loginUser).toHaveBeenCalledTimes(1);
      expect(mockedAuthService.loginUser).toHaveBeenCalledWith(body);
    });
  });

  it('preserves the token verification endpoint without credential validation', async () => {
    const response = await request(app)
      .post('/api/v1/auth/verify')
      .send({ token: 'body.token' })
      .expect(401);

    expect(response.body).toEqual({
      success: false,
      message: 'Token is required',
    });
    expect(mockedAuthService.registerUser).not.toHaveBeenCalled();
    expect(mockedAuthService.loginUser).not.toHaveBeenCalled();
  });
});
