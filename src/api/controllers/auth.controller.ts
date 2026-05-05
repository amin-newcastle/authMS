import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import config from '../../config/env.js';
import AuthService from '../services/auth.service.js';

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'An unknown error occurred';

const extractToken = (req: Request): string | undefined => {
  const authHeader = req.headers.authorization ?? '';
  return authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : req.body.token;
};

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
      res.status(400).json({ success: false, message: getErrorMessage(error) });
    }
  }

  /**
   * @desc    Handles user login requests
   * @route   POST /api/v1/auth/login
   * @access  Public
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const token = await AuthService.loginUser(req.body);
      res.status(200).json({ success: true, token });
    } catch (error: unknown) {
      res.status(400).json({ success: false, message: getErrorMessage(error) });
    }
  }

  /**
   * @desc    Verifies a JWT token
   * @route   POST /api/v1/auth/verify
   * @access  Public
   */
  static async verify(req: Request, res: Response): Promise<void> {
    try {
      const token = extractToken(req);

      if (!token) {
        res.status(400).json({ success: false, message: 'Token is required' });
        return;
      }

      const decoded = jwt.verify(token, config.jwtSecret);
      res.status(200).json({ success: true, decoded });
    } catch (error: unknown) {
      res.status(401).json({ success: false, message: getErrorMessage(error) });
    }
  }
}

// Export the AuthController to be used in route definitions (e.g., auth.routes.ts)
export default AuthController;
