import { jest, describe, it, expect, beforeEach } from '@jest/globals';

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

    it('registerUser should throw an error if user already exists', async () => {
      // Arrange: simulate existing user found in DB
      AuthRepository.findUserByUsername.mockResolvedValue(mockUserData);

      // Act + Assert
      await expect(AuthService.registerUser(mockUserData)).rejects.toThrow(
        'User already exists',
      );
      expect(AuthRepository.createUser).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('loginUser should throw an error if username is not found', async () => {
      // Arrange: simulate user not found in DB
      AuthRepository.findUserByUsername.mockResolvedValue(null);

      // Act + Assert
      await expect(
        AuthService.loginUser({ username: 'noone', password: 'x' }),
      ).rejects.toThrow('Invalid username or password');
    });

    it('loginUser should throw an error if password is incorrect', async () => {
      // Arrange: user exists but password won't match
      AuthRepository.findUserByUsername.mockResolvedValue(mockUser);

      // Act + Assert
      await expect(
        AuthService.loginUser({
          username: 'testuser',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow('Invalid username or password');
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
