const AuthController = require('../../../api/controllers/auth.controller');
const AuthService = require('../../../api/services/auth.service');
jest.mock('../../../api/services/auth.service'); // Mock the service

describe('AuthController', () => {
  it('should register a new user and return 201 status', async () => {
    const mockUser = { username: 'testuser', password: 'password' };
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    AuthService.registerUser.mockResolvedValue(mockUser);

    await AuthController.register({ body: mockUser }, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      message: 'User registered successfully',
      user: mockUser,
    });
  });

  it('should return 400 if an error occurs during registration', async () => {
    const mockUser = { username: 'testuser', password: 'password' };
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    AuthService.registerUser.mockRejectedValue(
      new Error('User already exists')
    );

    await AuthController.register({ body: mockUser }, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: 'User already exists',
    });
  });

  it('should return a token if login is successful', async () => {
    const mockUser = { username: 'testuser', password: 'password' };
    const mockToken = 'jwt-token';
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    AuthService.loginUser.mockResolvedValue(mockToken);

    await AuthController.login({ body: mockUser }, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      token: mockToken,
    });
  });

  it('should return 400 if an error occurs during login', async () => {
    const mockUser = { username: 'testuser', password: 'password' };
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    AuthService.loginUser.mockRejectedValue(
      new Error('Invalid username or password')
    );

    await AuthController.login({ body: mockUser }, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid username or password',
    });
  });
});
