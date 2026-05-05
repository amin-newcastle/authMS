import { beforeEach, describe, expect, it } from '@jest/globals';
import bcrypt from 'bcrypt';

import User from '../../../api/models/user.model.ts';
import AuthRepository from '../../../api/repositories/auth.repository.ts';
import { buildHashedUser } from '../../utils/user.ts';

describe('AuthRepository Integration Test', () => {
  // Clear the users collection before each test to ensure isolation
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('createUser', () => {
    it('should create a new user in the DB', async () => {
      // Arrange: Prepare user data with a hashed password
      const userData = await buildHashedUser({
        username: `testuser_${Date.now()}`,
      });

      // Act: Create the user using the repository
      const createdUser = await AuthRepository.createUser(userData);

      // Assert: Check that the user was created with the correct username and a hashed password
      expect(createdUser.username).toBe(userData.username);
      expect(createdUser.password).not.toBe('password'); // Ensure it's hashed
      // Extra: Check that the hash matches the original password
      const isMatch = await bcrypt.compare('password', createdUser.password);
      expect(isMatch).toBe(true);
    });
    it('should throw an error if required fields are missing', async () => {
      await expect(AuthRepository.createUser({})).rejects.toThrow();
    });
    it('should not allow duplicate usernames', async () => {
      const userData = await buildHashedUser({
        username: 'duplicateUser',
      });

      await AuthRepository.createUser(userData);
      await expect(AuthRepository.createUser(userData)).rejects.toThrow();
    });
  });

  describe('findUserByUsername', () => {
    it('should find a user by username in the DB', async () => {
      // Arrange: Create a user in the database
      const username = `testuser_${Date.now()}`;
      const userData = await buildHashedUser({
        username,
      });

      const createdUser = await AuthRepository.createUser(userData);

      // Act: Find the user by username using the repository
      const foundUser = await AuthRepository.findUserByUsername(username);

      // Assert: Check that the found user matches the created user
      expect(foundUser).not.toBeNull();
      expect(foundUser!.username).toBe(username);
      expect(foundUser!.password).toBe(createdUser.password);
    });
    it('should return null if user does not exist', async () => {
      const foundUser =
        await AuthRepository.findUserByUsername('nonexistentuser');
      expect(foundUser).toBeNull();
    });
  });

  describe('buildHashedUser helper', () => {
    it('should preserve provided username and password values when options are supplied', async () => {
      const result = await buildHashedUser({
        username: 'customUser',
        password: 'customPass',
        includeId: true,
        id: 'custom-id',
      });

      expect(result.username).toBe('customUser');
      expect(result.password).not.toBe('customPass');
      expect(result).toHaveProperty('_id', 'custom-id');
    });

    it('should return default _id when includeId is true and id is not provided', async () => {
      const result = await buildHashedUser({ includeId: true });

      expect(result).toHaveProperty('_id', '123');
      expect(result.username).toBeDefined();
      expect(result.password).toBeDefined();
    });

    it('should use fixture defaults when called without options', async () => {
      const result = await buildHashedUser();
      expect(result).not.toHaveProperty('_id');
      expect(result.username).toBeDefined();
      expect(result.password).toBeDefined();
    });
  });
});
