import {
  jest,
  describe,
  it,
  expect,
  beforeEach,
  afterAll,
} from '@jest/globals';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import httpMocks from 'node-mocks-http';

import AuthController from '../../../api/controllers/auth.controller.ts';
import { AppError } from '../../../api/errors/app.error.ts';
import AuthService from '../../../api/services/auth.service.ts';

// Mock AuthService to isolate controller tests from service logic
jest.mock('../../../api/services/auth.service.ts', () => ({
  __esModule: true,
  default: {
    registerUser: jest.fn(),
    loginUser: jest.fn(),
  },
}));

// Cast AuthService to a typed mock so we get autocomplete on mockResolvedValue etc.
type MockedAuthService = {
  registerUser: jest.MockedFunction<typeof AuthService.registerUser>;
  loginUser: jest.MockedFunction<typeof AuthService.loginUser>;
};
const mockedAuthService = AuthService as unknown as MockedAuthService;

// Cast jwt.verify to a mocked function type for better type safety in tests
type JwtVerifySync = (token: string, secret: jwt.Secret) => jwt.JwtPayload;
let mockedJwtVerify: jest.MockedFunction<JwtVerifySync>;

// Helper to create a typed mock response for each test
const createMockResponse = (): httpMocks.MockResponse<Response> =>
  httpMocks.createResponse<Response>();

describe('AuthController', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Reset call counts and return values between tests
    mockedJwtVerify = jest.spyOn(
      jwt,
      'verify',
    ) as unknown as jest.MockedFunction<JwtVerifySync>;
  });

  afterAll(() => {
    mockedJwtVerify.mockRestore(); // Restore real jwt.verify after all tests
  });

  describe('register', () => {
    it('should return 201 with created user on success', async () => {
      // Arrange
      const req = httpMocks.createRequest<Request>({
        method: 'POST',
        url: '/register',
        body: { username: 'testuser', password: 'pwd' },
      });
      const res = createMockResponse();
      mockedAuthService.registerUser.mockResolvedValue({
        username: 'testuser',
        password: '$2b$10$hashed',
        _id: '123',
      } as unknown as Awaited<ReturnType<typeof AuthService.registerUser>>);

      // Act
      await AuthController.register(req, res);

      // Assert
      expect(res.statusCode).toBe(201);
      const data = res._getJSONData();
      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('message', 'User registered successfully');
      expect(data).toHaveProperty('user');
      expect(data.user).toMatchObject({ username: 'testuser', _id: '123' });
      expect(data.user).not.toHaveProperty('password');
    });

    it('passes an existing-user error to the route wrapper', async () => {
      // Arrange
      const req = httpMocks.createRequest<Request>({
        method: 'POST',
        url: '/register',
        body: { username: 'testuser', password: 'pwd' },
      });
      const res = createMockResponse();
      const error = new AppError('User already exists', 409);
      mockedAuthService.registerUser.mockRejectedValue(error);

      // Act
      await expect(AuthController.register(req, res)).rejects.toBe(error);

      // Assert
      expect(res._isEndCalled()).toBe(false);
    });

    it('passes a non-Error registration rejection to the route wrapper', async () => {
      // Arrange
      const req = httpMocks.createRequest<Request>({
        method: 'POST',
        url: '/register',
        body: { username: 'testuser', password: 'pwd' },
      });
      const res = createMockResponse();
      mockedAuthService.registerUser.mockRejectedValue('oops');

      // Act
      await expect(AuthController.register(req, res)).rejects.toBe('oops');

      // Assert
      expect(res._isEndCalled()).toBe(false);
    });
  });

  describe('login', () => {
    it('should return 200 and token on successful login', async () => {
      // Arrange
      const req = httpMocks.createRequest<Request>({
        method: 'POST',
        url: '/login',
        body: { username: 'testuser', password: 'pwd' },
      });
      const res = createMockResponse();
      mockedAuthService.loginUser.mockResolvedValue('fake.jwt.token');

      // Act
      await AuthController.login(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      const data = res._getJSONData();
      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('token', 'fake.jwt.token');
    });

    it('passes invalid credentials to the route wrapper', async () => {
      // Arrange
      const req = httpMocks.createRequest<Request>({
        method: 'POST',
        url: '/login',
        body: { username: 'testuser', password: 'wrong' },
      });
      const res = createMockResponse();
      const error = new AppError('Invalid username or password', 401);
      mockedAuthService.loginUser.mockRejectedValue(error);

      // Act
      await expect(AuthController.login(req, res)).rejects.toBe(error);

      // Assert
      expect(res._isEndCalled()).toBe(false);
    });

    it('passes a non-Error login rejection to the route wrapper', async () => {
      // Arrange
      const req = httpMocks.createRequest<Request>({
        method: 'POST',
        url: '/login',
        body: { username: 'testuser', password: 'pwd' },
      });
      const res = createMockResponse();
      mockedAuthService.loginUser.mockRejectedValue(42);

      // Act
      await expect(AuthController.login(req, res)).rejects.toBe(42);

      // Assert
      expect(res._isEndCalled()).toBe(false);
    });
  });

  describe('verify', () => {
    it('should return 200 and decoded payload from Authorization header', async () => {
      // Arrange
      const req = httpMocks.createRequest<Request>({
        method: 'POST',
        url: '/verify',
        headers: { authorization: 'Bearer valid.token' },
        body: {},
      });
      const res = createMockResponse();
      mockedJwtVerify.mockReturnValue({ id: '123' });

      // Act
      await AuthController.verify(req, res);

      // Assert
      expect(mockedJwtVerify).toHaveBeenCalledWith(
        'valid.token',
        expect.any(String),
      );
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        success: true,
        decoded: { id: '123' },
      });
    });

    it('should not accept a token from the request body', async () => {
      // Arrange
      const req = httpMocks.createRequest<Request>({
        method: 'POST',
        url: '/verify',
        body: { token: 'body.token' },
      });
      const res = createMockResponse();

      // Act
      await expect(AuthController.verify(req, res)).rejects.toMatchObject({
        statusCode: 401,
        message: 'Token is required',
      });

      // Assert
      expect(mockedJwtVerify).not.toHaveBeenCalled();
      expect(res._isEndCalled()).toBe(false);
    });

    it('throws an application error when the token is missing', async () => {
      // Arrange
      const req = httpMocks.createRequest<Request>({
        method: 'POST',
        url: '/verify',
        body: {},
      });
      const res = createMockResponse();

      // Act
      const verification = AuthController.verify(req, res);
      await expect(verification).rejects.toBeInstanceOf(AppError);
      await expect(verification).rejects.toMatchObject({
        statusCode: 401,
        message: 'Token is required',
      });

      // Assert
      expect(res._isEndCalled()).toBe(false);
    });

    it('passes a token verification error to the route wrapper', async () => {
      // Arrange
      const req = httpMocks.createRequest<Request>({
        method: 'POST',
        url: '/verify',
        headers: { authorization: 'Bearer invalid.token' },
        body: {},
      });
      const res = createMockResponse();
      const error = new jwt.JsonWebTokenError('jwt malformed');
      mockedJwtVerify.mockImplementation(() => {
        throw error;
      });

      // Act
      await expect(AuthController.verify(req, res)).rejects.toBe(error);

      // Assert
      expect(res._isEndCalled()).toBe(false);
    });

    it('passes a non-Error token verification failure to the route wrapper', async () => {
      // Arrange
      const req = httpMocks.createRequest<Request>({
        method: 'POST',
        url: '/verify',
        headers: { authorization: 'Bearer invalid.token' },
        body: {},
      });
      const res = createMockResponse();
      mockedJwtVerify.mockImplementation(() => {
        throw 'invalid';
      });

      // Act
      await expect(AuthController.verify(req, res)).rejects.toBe('invalid');

      // Assert
      expect(res._isEndCalled()).toBe(false);
    });
  });
});
