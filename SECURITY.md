# Security Policy

## Reporting a Vulnerability

If you find a security issue in AuthMS, do not open a public issue containing exploit details, credentials, tokens, database URIs, or private configuration.

Report the issue privately to the maintainer:

```text
Muhammad Karim
```

Include:

- A short description of the issue
- Steps to reproduce
- Impact
- Affected files, endpoints, or versions
- Any safe proof-of-concept details that do not expose real secrets

## Secret Handling

Real credentials must not be committed to the repository.

If a secret is exposed:

1. Rotate the secret immediately.
2. Revoke the exposed value where possible.
3. Remove it from active configuration.
4. Review logs and deployment history for usage.
5. Treat Git history cleanup as secondary to rotation.

Previously exposed credentials must be rotated rather than merely removed.

## Supported Versions

AuthMS is under active development. Security fixes should target the current main development line unless a maintained release branch is introduced.

## Security Expectations

- Passwords must be hashed before storage.
- Password hashes must not be returned in API responses.
- JWT secrets must be unique per environment.
- Production MongoDB deployments must require authentication and encrypted connections.
- Authentication endpoints should be protected with rate limiting before production use.
