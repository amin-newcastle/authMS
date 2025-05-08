const AuthRepository = require('../repositories/auth.repository');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../../config/env');

class AuthService {
  static async registerUser(userData) {
    const existingUser = await AuthRepository.findUserByUsername(
      userData.username
    );
    if (existingUser) {
      throw new Error('User already exists');
    }
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = { ...userData, password: hashedPassword };
    return await AuthRepository.createUser(user);
  }

  static async loginUser(userData) {
    const user = await AuthRepository.findUserByUsername(userData.username);
    if (!user) {
      throw new Error('Invalid username or password');
    }

    const isMatch = await bcrypt.compare(userData.password, user.password);
    if (!isMatch) {
      throw new Error('Invalid username or password');
    }

    const token = jwt.sign({ id: user._id }, config.jwtSecret, {
      expiresIn: '1h',
    });
    return token;
  }
}

module.exports = AuthService;
