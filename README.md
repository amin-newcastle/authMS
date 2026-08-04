# AuthMS

AuthMS is the authentication microservice for Maktab Pro. It owns credential-based authentication, password hashing, JWT creation, and JWT verification for other services in the platform.

The service is written in TypeScript, runs on Node.js, exposes an Express API, and persists users in MongoDB through Mongoose.

## Contents

- [Features](#features)
- [Project Status](#project-status)
- [Service Boundaries](#service-boundaries)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Quick Start With Docker](#quick-start-with-docker)
- [Local Development](#local-development)
- [API Summary](#api-summary)
- [Scripts](#scripts)
- [Testing](#testing)
- [Security](#security)
- [Further Documentation](#further-documentation)

## Features

- User registration with bcrypt password hashing
- User login with JWT generation
- JWT verification endpoint for service-to-service auth checks
- MongoDB persistence with Mongoose
- Docker Compose stack for local runtime verification
- TypeScript build pipeline
- Unit and integration tests with Jest
- ESLint, Prettier, Husky, and release tooling

## Project Status

AuthMS is under active development as part of the Maktab Pro platform.

Implemented:

- Registration
- Login
- JWT generation
- JWT verification
- Unit and integration testing
- Docker containerisation

Not currently implemented:

- Refresh tokens
- Password reset
- Role-based access control
- Rate limiting
- Account lockout

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

## Architecture

AuthMS follows a controller-service-repository structure:

```text
Client -> Express Route -> Controller -> Service -> Repository -> MongoDB
```

Primary source layout:

```text
src/
  app.ts
  server.ts
  api/
    controllers/
    services/
    repositories/
    models/
    routes/
  config/
  tests/
```

See [Architecture Overview](docs/architecture/overview.md) for more detail.

## Prerequisites

- Node.js 18 or newer
- npm
- Docker Desktop and Docker Compose
- MongoDB, if running locally without Docker

The Docker image currently uses `node:18-alpine`, so Node.js 18 is the container runtime baseline.

## Environment Variables

| Variable     | Required           | Default       | Description                         |
| ------------ | ------------------ | ------------- | ----------------------------------- |
| `NODE_ENV`   | No                 | `development` | Runtime mode                        |
| `PORT`       | No                 | `3000`        | Express server port                 |
| `DB_URI`     | Yes for runtime DB | Empty string  | MongoDB connection string           |
| `JWT_SECRET` | Yes                | Empty string  | Secret used to sign and verify JWTs |

Example `.env.development`:

```env
NODE_ENV=development
PORT=5000
DB_URI=mongodb://localhost:27017/authms
JWT_SECRET=replace-with-a-long-random-secret
```

For Docker Compose in PowerShell:

```powershell
$env:JWT_SECRET="replace-with-a-long-random-secret"
```

## Quick Start With Docker

Start Docker Desktop, then run:

```powershell
$env:JWT_SECRET="replace-with-a-long-random-secret"
docker compose up --build -d
```

Check the stack:

```powershell
docker compose ps
```

Test the service:

```text
GET http://localhost:5000/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "authms"
}
```

The default Compose stack builds the production image and runs it locally against a development MongoDB container. This verifies the production build without deploying it to a production environment.

Stop the stack:

```powershell
docker compose down
```

## Local Development

Install dependencies:

```powershell
npm install
```

Create `.env.development`, start MongoDB, then run:

```powershell
npm run dev
```

Build and run compiled output:

```powershell
npm run build
npm start
```

## API Summary

Base URL:

```text
http://localhost:5000
```

| Method | Path                    | Purpose                                      |
| ------ | ----------------------- | -------------------------------------------- |
| `GET`  | `/health`               | Service health check                         |
| `GET`  | `/`                     | Simple local smoke test                      |
| `POST` | `/api/v1/auth/register` | Register a user                              |
| `POST` | `/api/v1/auth/login`    | Authenticate a user                          |
| `POST` | `/api/v1/auth/verify`   | Verify a JWT from the `Authorization` header |

Status codes:

| Status | Meaning                                                     |
| ------ | ----------------------------------------------------------- |
| `200`  | Health check, login, or token verification succeeded        |
| `201`  | User registered successfully                                |
| `400`  | Invalid request, duplicate username, or invalid credentials |
| `401`  | Missing, invalid, or expired token                          |
| `500`  | Unexpected server error                                     |

See [API Reference](docs/api/reference.md) and [OpenAPI Specification](docs/api/openapi.yaml) for full request and response examples.

## Scripts

| Command                    | Description                                          |
| -------------------------- | ---------------------------------------------------- |
| `npm run dev`              | Start the TypeScript development server with Nodemon |
| `npm run build`            | Compile TypeScript to `dist/`                        |
| `npm start`                | Start the compiled production server                 |
| `npm run test:unit`        | Run unit tests                                       |
| `npm run test:integration` | Run integration tests                                |
| `npm run tests`            | Run unit and integration tests                       |
| `npm run lint`             | Run ESLint                                           |
| `npm run lint:fix`         | Run ESLint with automatic fixes                      |
| `npm run format`           | Format project files with Prettier                   |
| `npm run load-env`         | Print masked environment configuration               |
| `npm run release`          | Generate a standard-version release                  |

## Testing

Run all tests:

```powershell
npm run tests
```

Run only unit or integration tests:

```powershell
npm run test:unit
npm run test:integration
```

The integration setup uses `mongodb-memory-server`, so tests do not require the Docker MongoDB container.

See [Testing Strategy](docs/development/testing.md).

## Security

- Real `.env` files are excluded from version control.
- Previously exposed credentials must be rotated rather than merely removed.
- JWT secrets must be unique per environment.
- Passwords are hashed with bcrypt before persistence.
- Credential errors deliberately use a generic message.
- User responses must never expose password hashes.
- Production MongoDB must require authentication and encrypted connections.
- Rate limiting, account lockout, refresh-token rotation, and security headers are recommended before production use.

See [SECURITY.md](SECURITY.md) for vulnerability reporting and secret-handling guidance.

## Further Documentation

- [Contributing Guide](CONTRIBUTING.md)
- [Architecture Overview](docs/architecture/overview.md)
- [API Reference](docs/api/reference.md)
- [OpenAPI Specification](docs/api/openapi.yaml)
- [Database Collections](docs/database/collections.md)
- [Docker Guide](docs/development/docker.md)
- [Continuous Integration](docs/development/ci.md)
- [Testing Strategy](docs/development/testing.md)
- [Release Process](docs/development/release-process.md)
- [Security Design](docs/security/overview.md)

## License

MIT

## Maintainer

Muhammad Karim
