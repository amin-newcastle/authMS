import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';

// Mock config and repository modules
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

import AuthService from '../../../api/services/auth.service.ts';
import AuthRepository from '../../../api/repositories/auth.repository.ts';

// Mock user data
const mockUserData = JSON.parse(
  fs.readFileSync(path.resolve('src/tests/mock-data/user/user.json'), 'utf-8'),
);

// Helper to generate a user with a hashed password
const generateMockUser = async (password = 'correctpassword') => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return { _id: '123', username: 'testuser', password: hashedPassword };
};

describe('AuthService', () => {
  let mockUser;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockUser = await generateMockUser();
  });

  describe('registration', () => {
    it('registerUser should create a new user when username does not exist', async () => {
      AuthRepository.findUserByUsername.mockResolvedValue(null);
      AuthRepository.createUser.mockResolvedValue(mockUserData);

      const user = await AuthService.registerUser(mockUserData);

      expect(user).toMatchObject({ username: 'testuser' });
      expect(AuthRepository.findUserByUsername).toHaveBeenCalledWith(
        mockUserData.username,
      );
      expect(AuthRepository.createUser).toHaveBeenCalled();
    });

    it('registerUser should throw an error if user already exists', async () => {
      AuthRepository.findUserByUsername.mockResolvedValue(mockUserData);

      await expect(AuthService.registerUser(mockUserData)).rejects.toThrow(
        'User already exists',
      );
      expect(AuthRepository.createUser).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('loginUser should throw an error if username is not found', async () => {
      AuthRepository.findUserByUsername.mockResolvedValue(null);

      await expect(
        AuthService.loginUser({ username: 'noone', password: 'x' }),
      ).rejects.toThrow('Invalid username or password');
    });

    it('loginUser should throw an error if password is incorrect', async () => {
      AuthRepository.findUserByUsername.mockResolvedValue(mockUser);

      await expect(
        AuthService.loginUser({
          username: 'testuser',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow('Invalid username or password');
    });

    it('loginUser should return a JWT token on successful login', async () => {
      AuthRepository.findUserByUsername.mockResolvedValue(mockUser);

      const token = await AuthService.loginUser({
        username: 'testuser',
        password: 'correctpassword',
      });

      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });
  });
});
