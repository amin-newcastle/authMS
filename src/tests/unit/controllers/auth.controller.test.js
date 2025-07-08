// Import the controller and service we're testing
const AuthController = require('../../../api/controllers/auth.controller');
const AuthService = require('../../../api/services/auth.service');

// Import mock user from user.json
const mockUser = require('../../mock-data/user/user.json');

// Mock the AuthService module so we can control its behavior in tests
jest.mock('../../../api/services/auth.service');

const createMockResponse = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('AuthController', () => {
  describe('register', () => {
    // Test case for successful user registration
    it('should register a new user and return 201 status', async () => {
      // Arrange
      const mockResponse = createMockResponse();

      // Act
      AuthService.registerUser.mockResolvedValue(mockUser); // Simulate successful registration by resolving mock service call
      await AuthController.register({ body: mockUser }, mockResponse); // Call the controller function

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'User registered successfully',
        user: mockUser,
      });
    });

    // Test case for registration failure (e.g. user already exists)
    it('should return 400 if an error occurs during registration', async () => {
      // Arrange
      const mockResponse = createMockResponse();

      // Act
      AuthService.registerUser.mockRejectedValue(
        new Error('User already exists')
      ); // Simulate a registration error
      await AuthController.register({ body: mockUser }, mockResponse); // Call the controller

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'User already exists',
      });
    });
  });

  describe('login', () => {
    // Test case for successful login
    it('should return a token if login is successful', async () => {
      // Arrange
      const mockToken = 'jwt-token';
      const mockResponse = createMockResponse();

      // Act
      AuthService.loginUser.mockResolvedValue(mockToken); // Simulate successful login
      await AuthController.login({ body: mockUser }, mockResponse); // Call the login controller

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        token: mockToken,
      });
    });

    // Test case for login failure (e.g. wrong credentials)
    it('should return 400 if an error occurs during login', async () => {
      // Arrange
      const mockResponse = createMockResponse();

      // Act
      AuthService.loginUser.mockRejectedValue(
        new Error('Invalid username or password')
      ); // Simulate login failure
      await AuthController.login({ body: mockUser }, mockResponse); // Call the login controller

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid username or password',
      });
    });
  });
});
