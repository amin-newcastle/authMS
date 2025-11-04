import express from 'express';

import AuthController from '../controllers/auth.controller.ts';

const router = express.Router();

// POST routes mapped to the methods in the AuthController
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Export the router so it can be used in app.js (e.g., mounted under /api/v1/auth)
export default router;
