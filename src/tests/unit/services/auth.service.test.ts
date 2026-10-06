import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import mongoose from 'mongoose';

// Mock config and repository before importing the service
jest.mock('../../../config/env.ts', () => ({
  __esModule: true,
  default: { jwtSecret: 'test-secret' },
}));
jest.mock('../../../api/repositories/auth.repository.ts', () => ({
  __esModule: true,
  default: {
    findUserByUsername: jest.fn(),
    createUser: jest.fn(),
  },
}));

import { AppError } from '../../../api/errors/app.error.ts';
import AuthRepository from '../../../api/repositories/auth.repository.ts';
import AuthService from '../../../api/services/auth.service.ts';
import { buildHashedUser, readUserFixture } from '../../utils/user.ts';

// Base fixture data used as the default input for registration tests
const mockUserData = readUserFixture();

describe('AuthService', () => {
  let mockUser;

  beforeEach(async () => {
    jest.clearAllMocks();
    // Build a user with a real bcrypt hash so bcrypt.compare works correctly in login tests
    mockUser = await buildHashedUser({
      includeId: true,
      password: 'correctpassword',
    });
  });

  describe('registration', () => {
    it('registerUser should create a new user when username does not exist', async () => {
      // Arrange
      AuthRepository.findUserByUsername.mockResolvedValue(null);
      AuthRepository.createUser.mockResolvedValue(mockUserData);

      // Act
      const user = await AuthService.registerUser(mockUserData);

      // Assert
      expect(user).toMatchObject({ username: 'testuser' });
      expect(AuthRepository.findUserByUsername).toHaveBeenCalledWith(
        mockUserData.username,
      );
      expect(AuthRepository.createUser).toHaveBeenCalled();
    });

    it('registerUser throws a conflict error if the user already exists', async () => {
      // Arrange: simulate existing user found in DB
      AuthRepository.findUserByUsername.mockResolvedValue(mockUserData);

      // Act + Assert
      const registration = AuthService.registerUser(mockUserData);
      await expect(registration).rejects.toBeInstanceOf(AppError);
      await expect(registration).rejects.toMatchObject({
        message: 'User already exists',
        statusCode: 409,
      });
      expect(AuthRepository.createUser).not.toHaveBeenCalled();
    });

    it('maps a username collision during insertion to the same conflict error', async () => {
      AuthRepository.findUserByUsername.mockResolvedValue(null);
      AuthRepository.createUser.mockRejectedValue(
        new mongoose.mongo.MongoServerError({
          message: 'E11000 duplicate username',
          code: 11000,
          keyPattern: { username: 1 },
        }),
      );

      const registration = AuthService.registerUser(mockUserData);

      await expect(registration).rejects.toBeInstanceOf(AppError);
      await expect(registration).rejects.toMatchObject({
        message: 'User already exists',
        statusCode: 409,
      });
    });

    it('preserves an unrelated database failure for the central error handler', async () => {
      const error = new Error('private database connection details');
      AuthRepository.findUserByUsername.mockResolvedValue(null);
      AuthRepository.createUser.mockRejectedValue(error);

      await expect(AuthService.registerUser(mockUserData)).rejects.toBe(error);
    });
  });

  describe('login', () => {
    it('loginUser should throw an error if username is not found', async () => {
      // Arrange: simulate user not found in DB
      AuthRepository.findUserByUsername.mockResolvedValue(null);

      // Act + Assert
      const login = AuthService.loginUser({ username: 'noone', password: 'x' });
      await expect(login).rejects.toBeInstanceOf(AppError);
      await expect(login).rejects.toMatchObject({
        message: 'Invalid username or password',
        statusCode: 401,
      });
    });

    it('loginUser should throw an error if password is incorrect', async () => {
      // Arrange: user exists but password won't match
      AuthRepository.findUserByUsername.mockResolvedValue(mockUser);

      // Act + Assert
      const login = AuthService.loginUser({
        username: 'testuser',
        password: 'wrongpassword',
      });
      await expect(login).rejects.toBeInstanceOf(AppError);
      await expect(login).rejects.toMatchObject({
        message: 'Invalid username or password',
        statusCode: 401,
      });
    });

    it('loginUser should return a JWT token on successful login', async () => {
      // Arrange: user exists with a hash of 'correctpassword'
      AuthRepository.findUserByUsername.mockResolvedValue(mockUser);

      // Act
      const token = await AuthService.loginUser({
        username: 'testuser',
        password: 'correctpassword',
      });

      // Assert
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });
  });
});
