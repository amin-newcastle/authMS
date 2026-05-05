import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import config from '../../config/env.js';
import { IUser } from '../models/user.model.js';
import AuthRepository from '../repositories/auth.repository.js';

// Number of salt rounds for bcrypt hashing.
// Higher = more secure but slower. 10 is the industry standard for a good security/performance balance.
const SALT_ROUNDS = 10;

// Type for login input — only the fields needed to authenticate, not the full IUser document
type LoginCredentials = { username: string; password: string };

class AuthService {
  /**
   * Handles user registration logic.
   * @param userData - Object containing username and password
   */
  static async registerUser(userData: IUser): Promise<IUser> {
    // 1st it checks if the user already exists by username preventing duplicate registrations
    const existingUser = await AuthRepository.findUserByUsername(
      userData.username,
    );
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash the user's password before storing it
    const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);

    return AuthRepository.createUser({ ...userData, password: hashedPassword });
  }

  /**
   * Handles user login logic.
   * @param userData - Object containing username and password
   * @returns JWT token if login is successful
   */
  static async loginUser(userData: LoginCredentials): Promise<string> {
    // Find user by username
    const user = await AuthRepository.findUserByUsername(userData.username);
    if (!user) {
      throw new Error('Invalid username or password'); // Avoid revealing which part failed
    }

    // Compare the provided password with the stored password
    const isMatch = await bcrypt.compare(userData.password, user.password);
    if (!isMatch) {
      throw new Error('Invalid username or password'); // Keep error generic for security
    }

    // Generate a signed JWT token for the authenticated user
    const token = jwt.sign({ id: user._id }, config.jwtSecret, {
      expiresIn: '1h', // Token is valid for 1 hour
    });

    // Return the token to the controller
    return token;
  }
}

// Export the AuthService class for use in the controller
export default AuthService;
