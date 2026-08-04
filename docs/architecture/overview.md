# Architecture Overview

AuthMS is a focused authentication service for Maktab Pro. Its job is to validate credentials, protect password storage, issue JWTs, and verify JWTs for other services.

## Runtime Flow

```text
Client
  -> Express route
  -> AuthController
  -> AuthService
  -> AuthRepository
  -> MongoDB users collection
```

## Layers

| Layer         | Location                      | Responsibility                                               |
| ------------- | ----------------------------- | ------------------------------------------------------------ |
| App bootstrap | `src/app.ts`, `src/server.ts` | Express setup, route mounting, server startup, DB connection |
| Routes        | `src/api/routes`              | Maps HTTP paths to controller methods                        |
| Controllers   | `src/api/controllers`         | Reads requests and writes HTTP responses                     |
| Services      | `src/api/services`            | Authentication business rules                                |
| Repositories  | `src/api/repositories`        | Data persistence operations                                  |
| Models        | `src/api/models`              | Mongoose schemas and models                                  |
| Config        | `src/config`                  | Environment variables and database connection                |

## Service Boundaries

AuthMS owns:

- Credentials
- Password hashing
- Authentication
- JWT creation and verification

AuthMS does not own:

- User profile information
- Student records
- Maktab membership
- Billing or payment information
- Notifications

## Docker Runtime

The Dockerfile uses a multi-stage build:

1. Builder stage installs all dependencies and compiles TypeScript into `dist/`.
2. Runtime stage installs production dependencies only and runs `node dist/server.js`.

The default Docker Compose stack runs the production image locally against a MongoDB container. This is useful for validating the production build path while still using local development infrastructure.

## Health Checks

Operational checks should use:

```http
GET /health
```

Expected response:

```json
{
  "status": "ok",
  "service": "authms"
}
```

The root endpoint, `GET /`, is retained only as a simple local smoke test.
