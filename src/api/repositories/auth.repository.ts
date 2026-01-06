// Import the User model which represents the users collection in the database
import User, { IUser } from '../models/user.model.ts';

// AuthRepository class has all database operations related to authentication
class AuthRepository {
  /**
   * Find a user (document) by username.
   * @param username - The username to search for
   * @returns The user document or null if not found
   */
  static async findUserByUsername(username: string): Promise<IUser | null> {
    // Returns the user
    return await User.findOne({ username });
  }

  /**
   * Create and save a new user in the database.
   * @param userData - The data for the new user
   * @returns The saved user document
   */
  static async createUser(userData: Partial<IUser>): Promise<IUser> {
    // Create a new instance of the User model with the provided data
    const newUser = new User(userData);

    // Save the new user to the database and return the saved document
    return await newUser.save();
  }
}

// Export the AuthRepository class to be used by the service layer
export default AuthRepository;
