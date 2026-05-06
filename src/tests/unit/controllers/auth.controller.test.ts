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
        _id: '123',
      } as any);

      // Act
      await AuthController.register(req, res);

      // Assert
      expect(res.statusCode).toBe(201);
      const data = res._getJSONData();
      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('message', 'User registered successfully');
      expect(data).toHaveProperty('user');
      expect(data.user).toMatchObject({ username: 'testuser', _id: '123' });
    });

    it('should return 400 when user already exists', async () => {
      // Arrange
      const req = httpMocks.createRequest<Request>({
        method: 'POST',
        url: '/register',
        body: { username: 'testuser', password: 'pwd' },
      });
      const res = createMockResponse();
      mockedAuthService.registerUser.mockRejectedValue(
        new Error('User already exists'),
      );

      // Act
      await AuthController.register(req, res);

      // Assert
      expect(res.statusCode).toBe(400);
      const data = res._getJSONData();
      expect(data).toHaveProperty('message', 'User already exists');
      expect(data).toHaveProperty('success', false);
    });

    it('should handle non-Error rejection on register', async () => {
      // Arrange
      const req = httpMocks.createRequest<Request>({
        method: 'POST',
        url: '/register',
        body: { username: 'testuser', password: 'pwd' },
      });
      const res = createMockResponse();
      mockedAuthService.registerUser.mockRejectedValue('oops');

      // Act
      await AuthController.register(req, res);

      // Assert
      expect(res.statusCode).toBe(400);
      const data = res._getJSONData();
      expect(data).toEqual({
        success: false,
        message: 'An unknown error occurred',
      });
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

    it('should return 400 on invalid credentials', async () => {
      // Arrange
      const req = httpMocks.createRequest<Request>({
        method: 'POST',
        url: '/login',
        body: { username: 'testuser', password: 'wrong' },
      });
      const res = createMockResponse();
      mockedAuthService.loginUser.mockRejectedValue(
        new Error('Invalid username or password'),
      );

      // Act
      await AuthController.login(req, res);

      // Assert
      expect(res.statusCode).toBe(400);
      const data = res._getJSONData();
      expect(data).toHaveProperty('message', 'Invalid username or password');
      expect(data).toHaveProperty('success', false);
    });

    it('should handle non-Error rejection on login', async () => {
      // Arrange
      const req = httpMocks.createRequest<Request>({
        method: 'POST',
        url: '/login',
        body: { username: 'testuser', password: 'pwd' },
      });
      const res = createMockResponse();
      mockedAuthService.loginUser.mockRejectedValue(42);

      // Act
      await AuthController.login(req, res);

      // Assert
      expect(res.statusCode).toBe(400);
      const data = res._getJSONData();
      expect(data).toEqual({
        success: false,
        message: 'An unknown error occurred',
      });
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

    it('should return 200 and decoded payload from request body token', async () => {
      // Arrange
      const req = httpMocks.createRequest<Request>({
        method: 'POST',
        url: '/verify',
        body: { token: 'body.token' },
      });
      const res = createMockResponse();
      mockedJwtVerify.mockReturnValue({ id: '456' });

      // Act
      await AuthController.verify(req, res);

      // Assert
      expect(mockedJwtVerify).toHaveBeenCalledWith(
        'body.token',
        expect.any(String),
      );
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        success: true,
        decoded: { id: '456' },
      });
    });

    it('should return 400 when token is missing', async () => {
      // Arrange
      const req = httpMocks.createRequest<Request>({
        method: 'POST',
        url: '/verify',
        body: {},
      });
      const res = createMockResponse();

      // Act
      await AuthController.verify(req, res);

      // Assert
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({
        success: false,
        message: 'Token is required',
      });
    });

    it('should return 401 when token verification throws an Error', async () => {
      // Arrange
      const req = httpMocks.createRequest<Request>({
        method: 'POST',
        url: '/verify',
        headers: { authorization: 'Bearer invalid.token' },
        body: {},
      });
      const res = createMockResponse();
      mockedJwtVerify.mockImplementation(() => {
        throw new Error('jwt malformed');
      });

      // Act
      await AuthController.verify(req, res);

      // Assert
      expect(res.statusCode).toBe(401);
      expect(res._getJSONData()).toEqual({
        success: false,
        message: 'jwt malformed',
      });
    });

    it('should return 401 when token verification throws a non-Error value', async () => {
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
      await AuthController.verify(req, res);

      // Assert
      expect(res.statusCode).toBe(401);
      expect(res._getJSONData()).toEqual({
        success: false,
        message: 'An unknown error occurred',
      });
    });
  });
});
