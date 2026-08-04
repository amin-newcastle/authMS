# Testing Strategy

AuthMS uses Jest for unit and integration tests.

## Commands

Run unit tests:

```powershell
npm run test:unit
```

Run integration tests:

```powershell
npm run test:integration
```

Run all tests:

```powershell
npm run tests
```

## Unit Tests

Unit tests live under:

```text
src/tests/unit
```

They cover controller behavior, service behavior, config loading, app-level health checks, and utility helpers.

## Integration Tests

Integration tests live under:

```text
src/tests/integration
```

The integration setup uses `mongodb-memory-server`, so repository tests run against an in-memory MongoDB instance instead of the Docker Compose database.

## Testing Priorities

High-value behavior to keep covered:

- Registration returns public user data only.
- Duplicate usernames are rejected.
- Passwords are hashed before persistence.
- Login returns a token for valid credentials.
- Login uses a generic error for invalid credentials.
- JWT verification accepts the `Authorization: Bearer <token>` header.
- Missing, invalid, or expired tokens return `401`.
- `/health` returns a stable monitoring response.
