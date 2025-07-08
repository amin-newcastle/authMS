jest.mock('../../../api/models/user.model', () => ({
  create: jest.fn(),
  findOne: jest.fn(),
}));
const AuthService = require('../../../api/services/auth.service');
const AuthRepository = require('../../../api/repositories/auth.repository');
const bcrypt = require('bcrypt');

// Mock the JWT secret
jest.mock('../../../config/env', () => ({
  jwtSecret: 'test-secret',
}));

// Mock the repository
jest.mock('../../../api/repositories/auth.repository');

// Mock user data
const mockUserData = require('../../mock-data/user/user.json');

// Helper to generate a user with a hashed password
const generateMockUser = async (password = 'correctpassword') => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return { _id: '123', username: 'testuser', password: hashedPassword };
};

describe('AuthService', () => {
  let mockUser;

  // Runs before each test to clear mocks and prepare fresh hashed password user
  beforeEach(async () => {
    jest.clearAllMocks();
    mockUser = await generateMockUser();
  });

  describe('registration', () => {
    it('registerUser should create a new user when username does not exist', async () => {
      // Arrange
      AuthRepository.findUserByUsername.mockResolvedValue(null); // Mock no existing user
      AuthRepository.createUser.mockResolvedValue(mockUserData); // Mock creating a user

      // Act
      const user = await AuthService.registerUser(mockUserData);

      // Assert
      expect(user).toMatchObject({ username: 'testuser' });
    });

    it('registerUser should throw an error if user already exists', async () => {
      // Arrange
      AuthRepository.findUserByUsername.mockResolvedValue(mockUserData); // Mock existing user

      // Assert
      await expect(AuthService.registerUser(mockUserData)).rejects.toThrow(
        'User already exists'
      );
    });
  });

  describe('login', () => {
    it('loginUser should throw an error if username is not found', async () => {
      // Arrange
      AuthRepository.findUserByUsername.mockResolvedValue(null); // User not found

      // Assert
      await expect(AuthService.loginUser(mockUserData)).rejects.toThrow(
        'Invalid username or password'
      );
    });

    it('loginUser should throw an error if password is incorrect', async () => {
      // Arrange
      AuthRepository.findUserByUsername.mockResolvedValue(mockUser); // Return mock user with hashed password

      // Assert
      await expect(
        AuthService.loginUser({
          username: 'testuser',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid username or password');
    });

    // Test JWT
    it('loginUser should return a JWT token on successful login', async () => {
      // Arrange
      AuthRepository.findUserByUsername.mockResolvedValue(mockUser); // Return mock user with hashed password

      // Act
      const token = await AuthService.loginUser({
        username: 'testuser',
        password: 'correctpassword',
      });

      // Assert
      expect(typeof token).toBe('string');
    });
  });
});
