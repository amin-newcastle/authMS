// Import the User model which represents the users collection in the database
const User = require('../models/user.model');

// AuthRepository class has all database operations related to authentication
class AuthRepository {
  // Find a user(document) by username
  static async findUserByUsername(username) {
    // Returns the user
    return await User.findOne({ username });
  }

  // Create and save a new user in the database
  static async createUser(userData) {
    // Create a new instance of the User model with the provided data
    const newUser = new User(userData);

    // Save the new user to the database and return the saved document
    return await newUser.save();
  }
}

// Export the AuthRepository class to be used by the service layer
module.exports = AuthRepository;
