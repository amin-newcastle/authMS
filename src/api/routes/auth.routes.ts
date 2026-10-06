import express from 'express';

import AuthController from '../controllers/auth.controller.js';
import { validateBody } from '../middleware/validate-body.js';
import { loginSchema, registrationSchema } from '../validation/auth.schemas.js';

// app.ts adds /api/v1/auth before these paths, so /login becomes /api/v1/auth/login.
const router = express.Router();

// Express runs these steps from left to right: check the body, then run the controller.
// If the check fails, validateBody sends the error response and stops there.
router.post(
  '/register',
  validateBody(registrationSchema),
  AuthController.register,
);
router.post('/login', validateBody(loginSchema), AuthController.login);
// A bearer token is the login token sent as "Authorization: Bearer <token>".
// This route checks that token, so it does not need the username/password checklist.
router.post('/verify', AuthController.verify);

export default router;
