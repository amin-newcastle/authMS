import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { mongo } from 'mongoose';

import config from '../../config/env.js';
import { AppError } from '../errors/app.error.js';
import { IUser } from '../models/user.model.js';
import AuthRepository from '../repositories/auth.repository.js';
import type {
  LoginInput,
  RegistrationInput,
} from '../validation/auth.schemas.js';

// This number controls how much work bcrypt does to hash a password.
// A higher number makes hashing slower for both our server and someone guessing passwords.
const SALT_ROUNDS = 10;

// The route has already checked the username and password fields.
// This service handles account rules: checking users, protecting passwords,
// and creating a login token (JWT) after a successful password check.
class AuthService {
  /**
   * Handles user registration logic.
   * @param userData - Object containing username and password
   */
  static async registerUser(userData: RegistrationInput): Promise<IUser> {
    // Check whether the username is taken so we can give a useful error.
    // Two requests could pass this check at the same time. MongoDB also has a
    // uniqueness rule on usernames, which prevents both from being saved.
    const existingUser = await AuthRepository.findUserByUsername(
      userData.username,
    );
    if (existingUser) {
      throw new AppError('User already exists', 409);
    }

    // Store a hash (a one-way result of processing the password), not the password itself.
    const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);

    try {
      return await AuthRepository.createUser({
        ...userData,
        password: hashedPassword,
      });
    } catch (error: unknown) {
      // The database can reject a duplicate if another request saved this
      // username after our lookup. Give that case the same conflict response.
      if (
        error instanceof mongo.MongoServerError &&
        error.code === 11000 &&
        error.keyPattern?.username === 1
      ) {
        throw new AppError('User already exists', 409);
      }
      throw error;
    }
  }

  /**
   * Handles user login logic.
   * @param userData - Object containing username and password
   * @returns JWT token if login is successful
   */
  static async loginUser(userData: LoginInput): Promise<string> {
    // Use the same message for a missing account and a wrong password.
    // That way, this response does not tell someone which usernames are registered.
    const user = await AuthRepository.findUserByUsername(userData.username);
    if (!user) {
      throw new AppError('Invalid username or password', 401);
    }

    // bcrypt checks the submitted password against the saved hash.
    // It does not need to recover the original password from the hash.
    const isMatch = await bcrypt.compare(userData.password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid username or password', 401);
    }

    // A JWT is a signed login token. Anyone holding it can read its contents,
    // so include the user ID and keep passwords and hashes out of it.
    const token = jwt.sign({ id: user._id }, config.jwtSecret, {
      expiresIn: '1h', // Token is valid for 1 hour
    });

    return token;
  }
}

export default AuthService;
