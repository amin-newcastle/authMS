# API Reference

Base URL for local Docker development:

```text
http://localhost:5000
```

## Credential Rules

- `username` is required.
- `username` must be unique.
- `password` is required.
- Passwords are hashed with bcrypt before persistence.
- Password hashes must never be returned in API responses.

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
