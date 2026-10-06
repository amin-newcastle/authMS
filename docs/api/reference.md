# API Reference

Base URL for local Docker development:

```text
http://localhost:5000
```

## Credential Rules

Registration and login accept a JSON object containing string `username` and `password` fields. Zod validates the body before the controller or service runs. Unknown fields are removed from the parsed body.

| Field      | Registration                                                     | Login                                                                       |
| ---------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `username` | Required string, trimmed, 3–32 characters after trimming, unique | Required string, must contain a non-whitespace character, preserved exactly |
| `password` | Required string, 8–72 characters and at most 72 UTF-8 bytes      | Required string, non-empty                                                  |

Registration returns the trimmed username. Usernames remain case-sensitive; use the stored username exactly when logging in. Passwords are never trimmed. Login does not enforce the new registration length limits or alter usernames. Passwords are hashed with bcrypt before persistence, and hashes are never returned in API responses.

## Validation Errors

For example, registration with `username: "ab"` and a valid password returns HTTP `400`:

```json
{
  "success": false,
  "message": "Invalid request body",
  "errors": [
    {
      "field": "username",
      "message": "Username must be at least 3 characters long"
    }
  ]
}
```

Malformed JSON also returns HTTP `400`:

```json
{
  "success": false,
  "message": "Invalid request body",
  "errors": [
    {
      "field": "body",
      "message": "Request body must be a valid JSON object"
    }
  ]
}
```

Field validation uses `username` or `password` in `errors[].field`; an invalid top-level body uses `body`. Error messages describe failed rules and never include submitted values. No service or database operation runs when registration or login validation fails.

## Status Codes

| Status | Meaning                                                     |
| ------ | ----------------------------------------------------------- |
| `200`  | Health check, login, or token verification succeeded        |
| `201`  | User registered successfully                                |
| `400`  | Invalid request, duplicate username, or invalid credentials |
| `401`  | Missing, invalid, or expired token                          |
| `500`  | Unexpected server error                                     |

## Health Check

```http
GET /health
```

Response:

```json
{
  "status": "ok",
  "service": "authms"
}
```

## Local Smoke Test

```http
GET /
```

Response:

```text
Hello world!
```

## Register User

```http
POST /api/v1/auth/register
Content-Type: application/json
```

Request body:

```json
{
  "username": "demo-user",
  "password": "StrongPassword123"
}
```

Success response:

```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "_id": "66b0f0000000000000000000",
    "username": "demo-user"
  }
}
```

Duplicate user response:

```json
{
  "success": false,
  "message": "User already exists"
}
```

## Login

```http
POST /api/v1/auth/login
Content-Type: application/json
```

Request body:

```json
{
  "username": "demo-user",
  "password": "StrongPassword123"
}
```

Success response:

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Invalid credentials response:

```json
{
  "success": false,
  "message": "Invalid username or password"
}
```

## Verify Token

```http
POST /api/v1/auth/verify
Authorization: Bearer <token>
```

Header:

```text
Authorization
```

Value:

```text
Bearer <token>
```

Success response:

```json
{
  "success": true,
  "decoded": {
    "id": "66b0f0000000000000000000",
    "iat": 1780000000,
    "exp": 1780003600
  }
}
```

Missing token response:

```json
{
  "success": false,
  "message": "Token is required"
}
```

Invalid or expired token response:

```json
{
  "success": false,
  "message": "jwt expired"
}
```

## Insomnia Workflow

1. Send `GET http://localhost:5000/health`.
2. Register a user with `POST http://localhost:5000/api/v1/auth/register`.
3. Login with `POST http://localhost:5000/api/v1/auth/login`.
4. Copy the returned token.
5. Verify with `POST http://localhost:5000/api/v1/auth/verify` and header `Authorization: Bearer <token>`.
