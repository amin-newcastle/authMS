import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import config from '../../config/env.js';
import { IUser } from '../models/user.model.js';
import AuthService from '../services/auth.service.js';
import type {
  LoginInput,
  RegistrationInput,
} from '../validation/auth.schemas.js';

// JavaScript can throw values such as strings as well as Error objects.
// Check that we have an Error before reading its message.
const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'An unknown error occurred';

// Read the login token from "Authorization: Bearer <token>".
// slice(7) removes "Bearer " and leaves only the token itself.
const extractToken = (req: Request): string | undefined => {
  const authHeader = req.headers.authorization ?? '';
  return authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
};

// Choose exactly which user fields to send back to the client.
// The database user also has a password hash, which must stay out of responses.
const toPublicUser = (
  user: Pick<IUser, '_id' | 'username'>,
): { _id: string; username: string } => ({
  _id: String(user._id),
  username: user.username,
});

// Registration and login bodies have already passed the route's validation step.
// The Request types describe that checked data; the types alone do not check it.
// Controllers ask the service to do the work, then send an HTTP response to the client.
class AuthController {
  /**
   * @desc    Handles user registration requests
   * @route   POST /api/v1/auth/register
   * @access  Public
   */
  static async register(
    req: Request<unknown, unknown, RegistrationInput>,
    res: Response,
  ): Promise<void> {
    try {
      const user = await AuthService.registerUser(req.body);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: toPublicUser(user),
      });
    } catch (error: unknown) {
      res.status(400).json({ success: false, message: getErrorMessage(error) });
    }
  }

  /**
   * @desc    Handles user login requests
   * @route   POST /api/v1/auth/login
   * @access  Public
   */
  static async login(
    req: Request<unknown, unknown, LoginInput>,
    res: Response,
  ): Promise<void> {
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
        res.status(401).json({ success: false, message: 'Token is required' });
        return;
      }

      // Check that the token was signed with our secret and has not expired.
      // jwt.verify throws an error if the check fails; otherwise it returns the token's data.
      const decoded = jwt.verify(token, config.jwtSecret);
      res.status(200).json({ success: true, decoded });
    } catch (error: unknown) {
      res.status(401).json({ success: false, message: getErrorMessage(error) });
    }
  }
}

export default AuthController;
