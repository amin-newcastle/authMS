import { Request, Response } from 'express';

import AuthService from '../services/auth.service.ts';

/**
 * AuthController class to handle HTTP requests related to authentication.
 * It communicates with the AuthService to perform the main authentication logic.
 */
class AuthController {
  /**
   * @desc    Handles user registration requests
   * @route   POST /api/v1/auth/register
   * @access  Public
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      // Call the service layer to register a new user with the request body data
      const user = await AuthService.registerUser(req.body);

      // Respond with a success message and the newly created user data
      res
        .status(201)
        .json({ success: true, message: 'User registered successfully', user });
    } catch (error: unknown) {
      // Safely handle errors by narrowing the type of `error`
      if (error instanceof Error) {
        res.status(400).json({ success: false, message: error.message });
      } else {
        res
          .status(400)
          .json({ success: false, message: 'An unknown error occurred' });
      }
    }
  }

  /**
   * @desc    Handles user login requests
   * @route   POST /api/v1/auth/login
   * @access  Public
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      // Call the service layer to authenticate the user and generate a token
      const token = await AuthService.loginUser(req.body);

      // Respond with the generated token
      res.status(200).json({ success: true, token });
    } catch (error: unknown) {
      // Safely handle errors by narrowing the type of `error`
      if (error instanceof Error) {
        res.status(400).json({ success: false, message: error.message });
      } else {
        res
          .status(400)
          .json({ success: false, message: 'An unknown error occurred' });
      }
    }
  }
}

// Export the AuthController to be used in route definitions (e.g., auth.routes.ts)
export default AuthController;
