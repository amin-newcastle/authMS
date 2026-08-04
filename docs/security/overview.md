# Security Design

AuthMS handles sensitive authentication data, so security decisions should be explicit and conservative.

## Current Controls

- Passwords are hashed with bcrypt before persistence.
- Login errors use a generic `Invalid username or password` message.
- JWTs are signed with `JWT_SECRET`.
- JWT verification rejects missing, invalid, and expired tokens.
- Registration responses return public user fields only.
- Real `.env` files are excluded from version control.

## Secret Handling

- Never commit real `.env` files.
- Store production secrets in the deployment platform's secret manager.
- Use a unique `JWT_SECRET` per environment.
- Rotate any secret that was committed, logged, shared, or exposed.
- Removing a secret from Git history does not make the old value safe.

## Password Handling

- Store only bcrypt hashes.
- Never log plain text passwords.
- Never return password hashes to clients.
- Treat password reset and account recovery flows as separate security-sensitive features.

## JWT Handling

- Use the `Authorization: Bearer <token>` header for verification.
- Keep token lifetime intentionally short.
- Do not use the same JWT secret across local, staging, and production environments.
- Consider refresh-token rotation before production use.

## Production Hardening

Before production use, add or verify:

- MongoDB authentication and encrypted connections
- HTTPS termination
- Rate limiting for login and registration
- Account lockout or throttling
- Security headers
- Centralized audit logging
- Request validation
- Sanitized error handling
- Dependency vulnerability review
