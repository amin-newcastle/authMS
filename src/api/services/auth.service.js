const AuthRepository = require('../repositories/auth.repository');
// Import bcrypt for hashing and comparing passwords securely
const bcrypt = require('bcrypt');
// Import jsonwebtoken for generating JWT tokens
const jwt = require('jsonwebtoken');
// Import app configuration values (e.g., JWT secret)
const config = require('../../config/env');

// AuthService class to contain the business logic for authentication
class AuthService {
  // This function handles user registration logic
  static async registerUser(userData) {
    // 1st it Check if the user already exists by username preventing duplicate registrations
    const existingUser = await AuthRepository.findUserByUsername(
      userData.username
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

  // Handles user login logic
  static async loginUser(userData) {
    // Find user by username
    const user = await AuthRepository.findUserByUsername(userData.username);
    if (!user) {
      throw new Error('Invalid username or password'); // Avoiding revealing which part failed
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
module.exports = AuthService;
