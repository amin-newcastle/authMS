# AuthMS Documentation

AuthMS is the authentication microservice for Maktab Pro. It provides user registration, login and JSON Web Token verification through an Express API backed by MongoDB.

## Start here

- [Architecture overview](architecture/overview.md)
- [API reference](api/reference.md)
- [Database collections](database/collections.md)
- [Docker development](development/docker.md)
- [Testing strategy](development/testing.md)
- [Continuous integration](development/ci.md)
- [Release process](development/release-process.md)
- [Security overview](security/overview.md)

## Responsibilities

AuthMS is responsible for:

- Registering users
- Hashing passwords before persistence
- Authenticating credentials
- Issuing signed JSON Web Tokens
- Verifying bearer tokens
- Storing authentication records in MongoDB
- Exposing a health-check endpoint

## Service boundaries

AuthMS does not own:

- User profile information
- Student or teacher records
- Maktab membership
- Billing
- Notifications
- Application-specific permissions outside authentication

These responsibilities belong to other services within the Maktab Pro platform.

## Architecture

AuthMS follows a controller-service-repository structure:

```text
Client
  → Express route
  → Controller
  → Service
  → Repository
  → MongoDB
```

This separation keeps HTTP handling, authentication logic and persistence concerns independently testable.

## API

The HTTP API includes:

- User registration
- User login
- Bearer-token verification
- Service health checks

See the [API reference](api/reference.md) for request and response examples.

The machine-readable API contract is maintained in `api/openapi.yaml`.

## Development

Developers should use feature branches and submit changes through pull requests into `main`. The CI quality gate validates linting, compilation, tests, dependency security and the Docker build before changes can be merged.

See the [continuous integration guide](development/ci.md) for details.

## Security

Passwords are hashed before storage, authentication errors avoid revealing which credential was incorrect, and secrets must be supplied through environment configuration rather than committed to the repository.

See the [security overview](security/overview.md) and the repository `SECURITY.md` policy for further guidance.
