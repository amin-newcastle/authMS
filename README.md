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
- [Returning After a Break](#returning-after-a-break)
- [API Summary](#api-summary)
- [Scripts](#scripts)
- [Testing](#testing)
- [Dependency Updates With Renovate](#dependency-updates-with-renovate)
- [Security](#security)
- [Further Documentation](#further-documentation)

## Features

- User registration with bcrypt password hashing
- User login with JWT generation
- Zod request validation before registration and login controllers
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
- Request validation
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
Client -> Express Route -> Validation -> Controller -> Service -> Repository -> MongoDB
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
    middleware/
    validation/
  config/
  tests/
```

See [Architecture Overview](docs/architecture/overview.md) for more detail.

## Prerequisites

- Node.js 22.x
- npm
- Docker Desktop and Docker Compose
- MongoDB, if running locally without Docker

Node.js 22 is the baseline for local development, CI, and Docker. The `.nvmrc` and `.node-version` files specify major version `22`, `package.json` declares `engines.node: "22.x"`, and both Docker build stages use `node:22-alpine`.

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

Install or switch to Node.js 22.x before installing dependencies. If you use a Node version manager, select the version specified in `.nvmrc` or `.node-version` using that manager's commands. Verify the active version:

```powershell
node --version
```

The output should start with `v22.`.

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

## Returning After a Break

When using MongoDB Atlas, run through this checklist before starting development:

1. **Check the cluster.** Sign in to [MongoDB Atlas](https://cloud.mongodb.com/), select the project, and resume the development cluster if it is paused. Wait until it is running.
2. **Check network access.** In the project's Network Access IP access list, add your current public IP if it has changed. Wait until the entry is active. If using a VPN, use the IP for that connection.
3. **Check saved credentials.** Keep the database username and password in a password manager under a recognisable name such as `Maktab Pro - AuthMS - Atlas development`, along with the Atlas project and cluster names. The database user is separate from your Atlas login. If the password is lost, reset it in Atlas Database Access and update your local connection string.
4. **Check `.env.development`.** `npm run dev` loads this file, not `.env`. Ensure `DB_URI` contains the cluster's connection string and database credentials. Percent-encode special characters in the username and password (for example, `@` becomes `%40`). Keep real credentials and connection strings out of this README and Git.
5. **Start the service.** Run `npm run dev` and look for `MongoDB connected`. The `Server running` message alone does not confirm a database connection. After editing `.env.development`, stop the process with Ctrl+C and run it again; Nodemon only watches `src`.

Quick troubleshooting:

| Error                              | First checks                                                                                                                                             |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `querySrv ENOTFOUND`               | Check cluster status and compare the URI hostname with Atlas's current connection string; check DNS if it still fails.                                   |
| `TLSV1_ALERT_INTERNAL_ERROR`       | Check the project's IP access list and VPN connection first. This error alone does not prove an access-list issue.                                       |
| `bad auth : authentication failed` | Check the database username, password, URI encoding, and authentication database. Reset the database password if needed, then update `.env.development`. |

For development using a local MongoDB container, follow [Quick Start With Docker](#quick-start-with-docker).

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

| Status | Meaning                                                      |
| ------ | ------------------------------------------------------------ |
| `200`  | Health check, login, or token verification succeeded         |
| `201`  | User registered successfully                                 |
| `400`  | Invalid request fields or malformed JSON                     |
| `401`  | Invalid login credentials or missing, invalid, expired token |
| `409`  | Username already exists                                      |
| `500`  | Unexpected server error                                      |

See [API Reference](docs/api/reference.md) and [OpenAPI Specification](docs/api/openapi.yaml) for full request and response examples.

Registration requires a trimmed username of 3–32 characters and a password of 8–72 characters, with a maximum of 72 UTF-8 bytes for bcrypt. Login requires a non-blank username and a non-empty password, preserving both strings exactly for existing credentials. Passwords are never trimmed. Invalid input returns `400` with `success: false`, `message: "Invalid request body"`, and field-level `errors` before the controller or service runs.

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

## Dependency Updates With Renovate

Renovate checks dependency manifests and opens pull requests for available updates, including npm packages, Docker images, and GitHub Actions. The hosted GitHub app runs the bot; no local Renovate container or extra GitHub Actions workflow is required.

Repository settings are in [renovate.json](renovate.json):

- `config:recommended` enables the recommended presets and a Dependency Dashboard issue.
- `automerge: false` leaves update pull requests for manual review and merge.
- `packageRules` keeps Node.js and `@types/node` updates within major version 22. Change this rule when deliberately upgrading the baseline.

### Reviewing Updates

Open the repository's [pull requests](https://github.com/amin-newcastle/authMS/pulls) to review updates, or find the **Dependency Dashboard** in [Issues](https://github.com/amin-newcastle/authMS/issues) for pending updates and warnings.

Read the release notes, check for breaking changes, and wait for the CI quality gate to pass before merging through GitHub. For major dependency or runtime updates, verify the affected behavior locally and check that the Node.js versions used in development, CI, and the Dockerfile remain compatible.

If no updates appear, check that the app has access to `authMS`, the configuration is on the default branch, and any onboarding pull request has been merged. Review dashboard warnings when present.

See the official [installation and onboarding guide](https://docs.renovatebot.com/getting-started/installing-onboarding/) and [recommended preset](https://docs.renovatebot.com/presets-config/#configrecommended) for more detail.

## Security

- Real `.env` files are excluded from version control.
- Previously exposed credentials must be rotated rather than merely removed.
- JWT secrets must be unique per environment.
- Passwords are hashed with bcrypt before persistence.
- Registration and login bodies are validated with Zod; validation errors never include submitted values.
- Credential errors deliberately use a generic message.
- User responses must never expose password hashes.
- Production MongoDB must require authentication and encrypted connections.
- Rate limiting, account lockout, refresh-token rotation, and security headers are recommended before production use.

See [SECURITY.md](SECURITY.md) for vulnerability reporting and secret-handling guidance.

## Further Documentation

- [Contributing Guide](CONTRIBUTING.md)
- [Architecture Overview](docs/architecture/overview.md)
- [API Reference](docs/api/reference.md)
- [Interactive API Reference](https://amin-newcastle.github.io/authMS/api/swagger/)
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
