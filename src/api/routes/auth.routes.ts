import express from 'express';

import AuthController from '../controllers/auth.controller.js';

const router = express.Router();

// POST routes mapped to the methods in the AuthController
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/verify', AuthController.verify);

// Export the router so it can be used in app.js (e.g., mounted under /api/v1/auth)
export default router;
