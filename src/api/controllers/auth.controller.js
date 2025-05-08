const AuthService = require('../services/auth.service');

class AuthController {
  static async register(req, res) {
    try {
      const user = await AuthService.registerUser(req.body);
      res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async login(req, res) {
    try {
      const token = await AuthService.loginUser(req.body);
      res.status(200).json({ token });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = AuthController;
