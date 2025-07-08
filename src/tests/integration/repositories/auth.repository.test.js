const AuthRepository = require('../../../api/repositories/auth.repository');
const bcrypt = require('bcrypt');
const getUserModel = require('../../../api/models/user.model');

describe('AuthRepository Integration Test', () => {
  // Clear the users collection before each test to ensure isolation
  beforeEach(async () => {
    const User = getUserModel();
    await User.deleteMany({});
  });

  describe('createUser', () => {
    it('should create a new user in the DB', async () => {
      // Arrange: Prepare user data with a hashed password
      const password = 'password';
      const hashedPassword = await bcrypt.hash(password, 10);
      const userData = {
        username: `testuser_${Date.now()}`,
        password: hashedPassword,
      };

      // Act: Create the user using the repository
      const createdUser = await AuthRepository.createUser(userData);

      // Assert: Check that the user was created with the correct username and a hashed password
      expect(createdUser.username).toBe(userData.username);
      expect(createdUser.password).not.toBe(password); // Ensure it's hashed
      // Extra: Check that the hash matches the original password
      const isMatch = await bcrypt.compare(password, createdUser.password);
      expect(isMatch).toBe(true);
    });
    it('should throw an error if required fields are missing', async () => {
      await expect(AuthRepository.createUser({})).rejects.toThrow();
    });
    it('should not allow duplicate usernames', async () => {
      const userData = {
        username: 'duplicateUser',
        password: await bcrypt.hash('password', 10),
      };

      await AuthRepository.createUser(userData);
      await expect(AuthRepository.createUser(userData)).rejects.toThrow();
    });
  });

  describe('findUserByUsername', () => {
    it('should find a user by username in the DB', async () => {
      // Arrange: Create a user in the database
      const password = 'password';
      const hashedPassword = await bcrypt.hash(password, 10);
      const username = `testuser_${Date.now()}`;
      const userData = { username, password: hashedPassword };

      const createdUser = await AuthRepository.createUser(userData);

      // Act: Find the user by username using the repository
      const foundUser = await AuthRepository.findUserByUsername(username);

      // Assert: Check that the found user matches the created user
      expect(foundUser.username).toBe(username);
      expect(foundUser.password).toBe(createdUser.password);
    });

    it('should return null if user does not exist', async () => {
      const foundUser =
        await AuthRepository.findUserByUsername('nonexistentuser');
      expect(foundUser).toBeNull();
    });
  });
});
