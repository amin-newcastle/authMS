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

They cover request validation, controller behavior, service behavior, config loading, app-level health checks, and utility helpers.

## Integration Tests

Integration tests live under:

```text
src/tests/integration
```

The integration setup uses `mongodb-memory-server`, so repository and HTTP route tests run against an in-memory MongoDB instance instead of the Docker Compose database. The route tests cover registration, persisted password hashes, login, token verification, normalized duplicate usernames, and existing credentials.

## Testing Priorities

High-value behavior to keep covered:

- Registration returns public user data only.
- Invalid registration or login input returns `400` without calling the service.
- Username trimming and registration length boundaries are enforced; passwords retain whitespace.
- Registration rejects passwords over 72 UTF-8 bytes, including multi-byte characters.
- Malformed JSON returns the validation error envelope without exposing submitted values.
- Duplicate usernames are rejected.
- Passwords are hashed before persistence.
- Login returns a token for valid credentials.
- Login uses a generic error for invalid credentials.
- JWT verification accepts the `Authorization: Bearer <token>` header.
- Missing, invalid, or expired tokens return `401`.
- `/health` returns a stable monitoring response.
