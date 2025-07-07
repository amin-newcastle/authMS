const AuthService = require('../services/auth.service');

// AuthController class to handle HTTP requests related to authentication
class AuthController {
  // @desc    Handles user registration requests
  // @route   POST /api/vi/auth
  // @access  public
  static async register(req, res) {
    try {
      // Call the service layer to register a new user with the request body data
      const user = await AuthService.registerUser(req.body);

      // Respond with a success message and the newly created user data
      res
        .status(201)
        .json({ success: true, message: 'User registered successfully', user });
    } catch (error) {
      // Or an error (e.g. "database error" response with a 400 Bad Request error code
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // @desc    Handles user login requests
  // @route   POST /api/vi/auth
  // @access  private
  static async login(req, res) {
    try {
      // Call the service layer to authenticate the user and generate a token
      const token = await AuthService.loginUser(req.body);

      // Respond with the generated token
      res.status(200).json({ success: true, token });
    } catch (error) {
      // If authentication fails, respond with a 400 Bad Request and error message
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

// Export the AuthController to be used in route definitions (e.g., auth.routes.js)
module.exports = AuthController;
