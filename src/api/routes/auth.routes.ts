import express from 'express';

import AuthController from '../controllers/auth.controller.js';

// Express Router groups related routes together.
// This router handles all auth routes and is mounted under /api/v1/auth in app.ts,
// so the full paths become: /api/v1/auth/register, /api/v1/auth/login, /api/v1/auth/verify
const router = express.Router();

// POST routes mapped to the methods in the AuthController
router.post('/register', AuthController.register); // Create a new user account
router.post('/login', AuthController.login); // Authenticate and receive a JWT
router.post('/verify', AuthController.verify); // Validate a JWT (used by other microservices)

// Export the router so it can be used in app.js (e.g., mounted under /api/v1/auth)
export default router;
