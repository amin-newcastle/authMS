// Import bcrypt for hashing and comparing passwords securely
import bcrypt from 'bcrypt';
// Import jsonwebtoken for generating JWT tokens
import jwt from 'jsonwebtoken';

// Import app configuration values (e.g., JWT secret)
import config from '../../config/env.ts';
// Import AuthRepository for data access
import { IUser } from '../models/user.model.ts';
import AuthRepository from '../repositories/auth.repository.ts';
// Import the IUser interface for type safety

// AuthService class to contain the business logic for authentication
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
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create a new user object with the hashed password
    const user = { ...userData, password: hashedPassword };

    // Save the new user via the repository and return the result
    return await AuthRepository.createUser(user);
  }

  /**
   * Handles user login logic.
   * @param userData - Object containing username and password
   * @returns JWT token if login is successful
   */
  static async loginUser(userData: {
    username: string;
    password: string;
  }): Promise<string> {
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
