const AuthService = require('../../../api/services/auth.service');
const AuthRepository = require('../../../api/repositories/auth.repository');
jest.mock('../../../api/repositories/auth.repository');

describe('AuthService', () => {
  it('should register a new user', async () => {
    const mockUser = { username: 'testuser', password: 'password' };
    AuthRepository.findUserByUsername.mockResolvedValue(null); // No existing user
    AuthRepository.createUser.mockResolvedValue(mockUser);

    const user = await AuthService.registerUser(mockUser);
    expect(user.username).toBe('testuser');
  });

  it('should throw an error if user already exists', async () => {
    const mockUser = { username: 'testuser', password: 'password' };
    AuthRepository.findUserByUsername.mockResolvedValue(mockUser);

    await expect(AuthService.registerUser(mockUser)).rejects.toThrow(
      'User already exists'
    );
  });
});
