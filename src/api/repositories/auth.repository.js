const User = require('../models/user.model');

class AuthRepository {
  static async findUserByUsername(username) {
    return await User.findOne({ username });
  }

  static async createUser(userData) {
    const newUser = new User(userData);
    return await newUser.save();
  }
}

module.exports = AuthRepository;
