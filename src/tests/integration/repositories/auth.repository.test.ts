import { beforeEach, describe, expect, it } from '@jest/globals';
import bcrypt from 'bcrypt';

import User from '../../../api/models/user.model.ts';
import AuthRepository from '../../../api/repositories/auth.repository.ts';
import { buildHashedUser } from '../../utils/user.ts';

// Integration tests hit a real (in-memory) MongoDB instance via the setup in setup.mjs
describe('AuthRepository Integration Test', () => {
  // Wipe the collection before each test to prevent data leaking between tests
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('createUser', () => {
    it('should create a new user in the DB', async () => {
      // Arrange
      const userData = await buildHashedUser({
        username: `testuser_${Date.now()}`, // Unique username to avoid conflicts
      });

      // Act
      const createdUser = await AuthRepository.createUser(userData);

      // Assert
      expect(createdUser.username).toBe(userData.username);
      expect(createdUser.password).not.toBe('password'); // Ensure it's hashed
      const isMatch = await bcrypt.compare('password', createdUser.password);
      expect(isMatch).toBe(true);
    });

    it('should throw an error if required fields are missing', async () => {
      // Arrange + Act + Assert: empty object should fail Mongoose schema validation
      await expect(AuthRepository.createUser({})).rejects.toThrow();
    });

    it('should not allow duplicate usernames', async () => {
      // Arrange
      const userData = await buildHashedUser({ username: 'duplicateUser' });

      // Act: first insert succeeds, second should throw due to unique index
      await AuthRepository.createUser(userData);

      // Assert
      await expect(AuthRepository.createUser(userData)).rejects.toThrow();
    });
  });

  describe('findUserByUsername', () => {
    it('should find a user by username in the DB', async () => {
      // Arrange
      const username = `testuser_${Date.now()}`;
      const userData = await buildHashedUser({ username });
      const createdUser = await AuthRepository.createUser(userData);

      // Act
      const foundUser = await AuthRepository.findUserByUsername(username);

      // Assert
      expect(foundUser).not.toBeNull();
      expect(foundUser!.username).toBe(username);
      expect(foundUser!.password).toBe(createdUser.password);
    });

    it('should return null if user does not exist', async () => {
      // Act + Assert: no arrange needed as collection is wiped in beforeEach
      const foundUser =
        await AuthRepository.findUserByUsername('nonexistentuser');
      expect(foundUser).toBeNull();
    });
  });

  describe('buildHashedUser helper', () => {
    it('should preserve provided username and password values when options are supplied', async () => {
      // Arrange + Act
      const result = await buildHashedUser({
        username: 'customUser',
        password: 'customPass',
        includeId: true,
        id: 'custom-id',
      });

      // Assert
      expect(result.username).toBe('customUser');
      expect(result.password).not.toBe('customPass'); // Password should be hashed
      expect(result).toHaveProperty('_id', 'custom-id');
    });

    it('should return default _id when includeId is true and id is not provided', async () => {
      // Arrange + Act
      const result = await buildHashedUser({ includeId: true });

      // Assert
      expect(result).toHaveProperty('_id', '123'); // Default fallback id
      expect(result.username).toBeDefined();
      expect(result.password).toBeDefined();
    });

    it('should use fixture defaults when called without options', async () => {
      // Arrange + Act
      const result = await buildHashedUser();

      // Assert
      expect(result).not.toHaveProperty('_id'); // No _id when includeId is not set
      expect(result.username).toBeDefined();
      expect(result.password).toBeDefined();
    });
  });
});
