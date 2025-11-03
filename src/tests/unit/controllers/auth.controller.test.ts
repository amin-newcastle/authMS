import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import httpMocks from 'node-mocks-http';
import type { Request, Response } from 'express';

// Mock AuthService before importing controller
jest.mock('../../../api/services/auth.service.ts', () => ({
  __esModule: true,
  default: {
    registerUser: jest.fn(),
    loginUser: jest.fn(),
  },
}));

import AuthService from '../../../api/services/auth.service.ts';
import AuthController from '../../../api/controllers/auth.controller.ts';

// Helper to create a mock response
const createMockResponse = () => httpMocks.createResponse<Response>();

describe('AuthController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should return 201 with created user on success', async () => {
      const req = httpMocks.createRequest<Request>({
        method: 'POST',
        url: '/register',
        body: { username: 'testuser', password: 'pwd' },
      });
      const res = createMockResponse();

      (AuthService.registerUser as jest.Mock).mockResolvedValue({
        username: 'testuser',
        _id: '123',
      });

      await AuthController.register(req, res);

      expect(res.statusCode).toBe(201);
      const data = res._getJSONData();
      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('message', 'User registered successfully');
      expect(data).toHaveProperty('user');
      expect(data.user).toMatchObject({ username: 'testuser', _id: '123' });
    });

    it('should return 400 when user already exists', async () => {
      const req = httpMocks.createRequest<Request>({
        method: 'POST',
        url: '/register',
        body: { username: 'testuser', password: 'pwd' },
      });
      const res = createMockResponse();

      (AuthService.registerUser as jest.Mock).mockRejectedValue(
        new Error('User already exists'),
      );

      await AuthController.register(req, res);

      expect(res.statusCode).toBe(400);
      const data = res._getJSONData();
      expect(data).toHaveProperty('message', 'User already exists');
      expect(data).toHaveProperty('success', false);
    });
  });

  describe('login', () => {
    it('should return 200 and token on successful login', async () => {
      const req = httpMocks.createRequest<Request>({
        method: 'POST',
        url: '/login',
        body: { username: 'testuser', password: 'pwd' },
      });
      const res = createMockResponse();

      (AuthService.loginUser as jest.Mock).mockResolvedValue('fake.jwt.token');

      await AuthController.login(req, res);

      expect(res.statusCode).toBe(200);
      const data = res._getJSONData();
      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('token', 'fake.jwt.token');
    });

    it('should return 400 on invalid credentials', async () => {
      const req = httpMocks.createRequest<Request>({
        method: 'POST',
        url: '/login',
        body: { username: 'testuser', password: 'wrong' },
      });
      const res = createMockResponse();

      (AuthService.loginUser as jest.Mock).mockRejectedValue(
        new Error('Invalid username or password'),
      );

      await AuthController.login(req, res);

      expect(res.statusCode).toBe(400);
      const data = res._getJSONData();
      expect(data).toHaveProperty('message', 'Invalid username or password');
      expect(data).toHaveProperty('success', false);
    });
  });
});
