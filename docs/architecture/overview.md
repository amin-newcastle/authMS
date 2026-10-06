# Architecture Overview

AuthMS is a focused authentication service for Maktab Pro. Its job is to validate credentials, protect password storage, issue JWTs, and verify JWTs for other services.

## Runtime Flow

```text
Client
  -> Express route
  -> Zod body validation (registration and login)
  -> AuthController
  -> AuthService
  -> AuthRepository
  -> MongoDB users collection
```

## Layers

| Layer         | Location                                   | Responsibility                                                                                     |
| ------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| App bootstrap | `src/app.ts`, `src/server.ts`              | Express setup, route mounting, server startup, DB connection                                       |
| Routes        | `src/api/routes`                           | Maps HTTP paths to controller methods                                                              |
| Validation    | `src/api/middleware`, `src/api/validation` | Validates registration/login bodies, trims registration usernames, and forwards parsed credentials |
| Controllers   | `src/api/controllers`                      | Reads requests and writes HTTP responses                                                           |
| Services      | `src/api/services`                         | Authentication business rules                                                                      |
| Repositories  | `src/api/repositories`                     | Data persistence operations                                                                        |
| Models        | `src/api/models`                           | Mongoose schemas and models                                                                        |
| Config        | `src/config`                               | Environment variables and database connection                                                      |

## Why Zod for Request Validation

AuthMS uses Zod to validate registration and login bodies before they reach the controller and service. This follows an established production and enterprise practice: validate untrusted input on the server before processing it. The [OWASP input validation guidance](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html) recommends checking input types, formats, and limits early in the request flow.

Zod fits this TypeScript service for three reasons:

- **Runtime checks:** TypeScript checks code during development, but incoming JSON still needs validation while the application runs. Zod checks required fields, string types, and credential limits at the HTTP boundary.
- **Schema-derived types:** `RegistrationInput` and `LoginInput` are inferred from their schemas using `z.infer`. The parsed credentials and their TypeScript types therefore share one definition, reducing the risk of validation rules and types drifting apart.
- **Consistent handling:** Reusable Express middleware parses each body, forwards validated credentials, and returns a consistent `400` response for invalid input. Controllers and services can focus on their own responsibilities.

The [Zod documentation](https://zod.dev/basics) describes runtime parsing and type inference. Established backend frameworks also support this approach: the [NestJS validation documentation](https://docs.nestjs.com/techniques/validation) includes Zod among its supported schema libraries. Enterprise teams choose a validation library according to their framework, contracts, and maintenance needs; Zod is a suitable choice for this service's TypeScript and Express stack.

Validation responsibilities remain separate. Zod checks request shape, credential limits, and registration username normalization. `AuthService` handles account checks, password hashing and comparison, and JWT creation. Mongoose validates persisted documents, while MongoDB's unique username index enforces uniqueness when data is stored.

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
