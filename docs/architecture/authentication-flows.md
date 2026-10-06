# Authentication Flows

AuthMS implements registration, login, and bearer-token verification. This page traces the current code through those requests. See the [architecture overview](overview.md) for service boundaries, the [API guide](../api/reference.md) for usage, and the [interactive API reference](../api/swagger.md) for the contract maintained in [OpenAPI](../api/openapi.yaml).

## Layer Responsibilities

| Layer                       | Source                                                                                                                                                                                                               | Current responsibility                                                                                                                                 |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Bootstrap and configuration | [server.ts](https://github.com/amin-newcastle/authMS/blob/main/src/server.ts), [config](https://github.com/amin-newcastle/authMS/tree/main/src/config)                                                               | Load environment configuration, initiate the MongoDB connection, and start the HTTP listener outside tests.                                            |
| Express app and routes      | [app.ts](https://github.com/amin-newcastle/authMS/blob/main/src/app.ts), [auth.routes.ts](https://github.com/amin-newcastle/authMS/blob/main/src/api/routes/auth.routes.ts)                                          | Parse JSON, mount `/api/v1/auth`, dispatch the three POST routes, and handle errors passed to Express.                                                 |
| Request validation          | [validate-body.ts](https://github.com/amin-newcastle/authMS/blob/main/src/api/middleware/validate-body.ts), [auth.schemas.ts](https://github.com/amin-newcastle/authMS/blob/main/src/api/validation/auth.schemas.ts) | Parse registration/login bodies with Zod, normalize registration usernames, remove unknown fields, and reject invalid input before controllers run.    |
| Controller                  | [auth.controller.ts](https://github.com/amin-newcastle/authMS/blob/main/src/api/controllers/auth.controller.ts)                                                                                                      | Read requests, call registration/login services, project public user fields, and write HTTP responses. Extract and verify JWTs directly for `/verify`. |
| Service                     | [auth.service.ts](https://github.com/amin-newcastle/authMS/blob/main/src/api/services/auth.service.ts)                                                                                                               | Check duplicate usernames, hash and compare passwords with bcrypt, and sign login JWTs.                                                                |
| Repository                  | [auth.repository.ts](https://github.com/amin-newcastle/authMS/blob/main/src/api/repositories/auth.repository.ts)                                                                                                     | Find users by username and create users through the Mongoose `User` model. It does not hash passwords.                                                 |
| Models / Mongoose           | [user.model.ts](https://github.com/amin-newcastle/authMS/blob/main/src/api/models/user.model.ts)                                                                                                                     | Validate required string fields `username` and `password`, map `User` queries and documents to MongoDB, and declare the unique username index.         |
| MongoDB                     | [Database collections](../database/collections.md)                                                                                                                                                                   | Persist user records and enforce the unique username index. Password hashing remains in `AuthService`.                                                 |

Registration and login pass through request validation before traversing the controller, service, and repository layers. Verification calls `jsonwebtoken` in `AuthController` and makes no database query. Route handlers use `asyncHandler` to forward failures to the central `errorHandler`. In the diagrams, database arrows represent repository operations through the Mongoose `User` model. A `break` block ends the request when its error condition applies; otherwise processing continues below it.

## Registration

`POST /api/v1/auth/register` accepts JSON credentials. `validateBody(registrationSchema)` checks required string fields, trims the username, enforces its 3–32 character length, and requires a password of 8–72 characters and at most 72 UTF-8 bytes. Passwords are preserved exactly. Invalid input returns `400` with field errors before the controller or service runs.

The middleware replaces `req.body` with the parsed credentials, discarding unknown fields. `AuthController.register` passes those credentials to `AuthService.registerUser`, which looks up the normalized username before hashing anything. An existing user causes an `AppError` with `User already exists`; the central handler returns `409`. If concurrent registrations both pass that check, the service maps MongoDB's duplicate username index error to the same safe `409` response.

For a new username, the service calls `bcrypt.hash(password, 10)`: the configured bcrypt cost is **10**. It passes credentials containing that hash to `AuthRepository.createUser` without changing the parsed input. The repository constructs and saves a `User`; the model's required fields and MongoDB unique index also apply at persistence time.

The controller returns `201` with `success: true`, the registration message, and `user`. Its `toPublicUser` projection includes only `_id` converted to a string and `username`. The stored password hash is excluded, and registration does not issue a token.

```mermaid
---
config:
  sequence:
    wrap: true
    actorMargin: 20
    width: 140
---
sequenceDiagram
    actor Client
    participant Routes as Express / authRoutes
    participant Errors as Central error handler
    participant Validation as Zod body validation
    participant Controller as AuthController
    participant Service as AuthService
    participant Repository as AuthRepository
    participant DB as MongoDB
    Client->>Routes: POST /api/v1/auth/register (JSON credentials)
    Routes->>Validation: validateBody(registrationSchema)
    break Invalid request body
        Validation-->>Client: 400 (success false, message, errors)
    end
    Validation->>Controller: register(req with parsed body, res)
    Controller->>Service: registerUser(req.body)
    Service->>Repository: findUserByUsername(username)
    Repository->>DB: User.findOne({username})
    DB-->>Repository: User or null
    Repository-->>Service: User or null
    break Username already exists
        Service-->>Controller: Throw AppError (409, User already exists)
        Controller-->>Routes: Rejected handler
        Routes->>Errors: asyncHandler forwards error
        Errors-->>Client: 409 (success false, message)
    end
    Service->>Service: bcrypt.hash(password, 10)
    Service->>Repository: createUser(data with password hash)
    Repository->>DB: new User(data).save()
    DB-->>Repository: Saved user
    Repository-->>Service: Saved user
    Service-->>Controller: Saved user
    Controller->>Controller: toPublicUser(user)
    Controller-->>Client: 201 (success, message, public user)
```

Unexpected hashing, model validation, and database failures reach the central handler and return `500` with `Internal Server Error`. Internal dependency messages are not sent to the client.

## Login

`POST /api/v1/auth/login` first runs `validateBody(loginSchema)`. Username and password must be strings; the username must contain a non-whitespace character, and the password must be non-empty. Both strings are preserved exactly. Login does not apply registration length limits, preserving access for existing credentials.

The middleware forwards parsed credentials to `AuthController.login`, which calls `AuthService.loginUser`. The service loads the user by username and compares the supplied password against the stored hash with `bcrypt.compare`. A missing user and a failed comparison both throw an `AppError` with `Invalid username or password`; the central handler returns `401`.

When the comparison succeeds, the service calls `jwt.sign({ id: user._id }, config.jwtSecret, { expiresIn: '1h' })`. The resulting JWT contains the user ID and the library-generated `iat` and `exp` claims, with a one-hour lifetime. `AuthController.login` returns `200` with `success: true` and `token`. It does not return the stored user document or create a database session record.

```mermaid
---
config:
  sequence:
    wrap: true
    actorMargin: 20
    width: 140
---
sequenceDiagram
    actor Client
    participant Routes as Express / authRoutes
    participant Errors as Central error handler
    participant Validation as Zod body validation
    participant Controller as AuthController
    participant Service as AuthService
    participant Repository as AuthRepository
    participant DB as MongoDB
    Client->>Routes: POST /api/v1/auth/login (JSON credentials)
    Routes->>Validation: validateBody(loginSchema)
    break Invalid request body
        Validation-->>Client: 400 (success false, message, errors)
    end
    Validation->>Controller: login(req with parsed body, res)
    Controller->>Service: loginUser(req.body)
    Service->>Repository: findUserByUsername(username)
    Repository->>DB: User.findOne({username})
    DB-->>Repository: User or null
    Repository-->>Service: User or null
    break User not found
        Service-->>Controller: Throw AppError (401, Invalid username or password)
        Controller-->>Routes: Rejected handler
        Routes->>Errors: asyncHandler forwards error
        Errors-->>Client: 401 (success false, message)
    end
    Service->>Service: bcrypt.compare(password, user.password)
    break Password does not match
        Service-->>Controller: Throw AppError (401, Invalid username or password)
        Controller-->>Routes: Rejected handler
        Routes->>Errors: asyncHandler forwards error
        Errors-->>Client: 401 (success false, message)
    end
    Service->>Service: jwt.sign(id, JWT_SECRET, expiresIn 1h)
    Service-->>Controller: Signed JWT
    Controller-->>Client: 200 (success true, token)
```

Unexpected failures in the login path, including database, bcrypt, or signing errors, return `500` with `Internal Server Error`. The missing-user and password-mismatch cases deliberately share the generic credential message.

## Token Verification

`POST /api/v1/auth/verify` reads `Authorization: Bearer <token>` and requires no request body. The controller uses the case-sensitive check `authHeader.startsWith('Bearer ')`, then `authHeader.slice(7)`. It does not trim the remaining token. An absent header, a different prefix, or an empty token produces `401` with `Token is required`. A token supplied only in the request body is ignored.

`AuthController.verify` calls `jwt.verify(token, config.jwtSecret)` directly. The library checks the signature and applicable time claims. Known JWT verification errors reach the central handler and return `401` with `Invalid or expired token`; unexpected failures return a safe `500` response. There are no service or repository calls in this path.

On success, the controller returns `200` with `success: true` and the raw verification result in `decoded`, which can be an object or a string. Although AuthMS login tokens contain `id`, `iat`, and `exp`, this endpoint does not require those fields or validate a separate payload schema. It supplies no issuer or audience restrictions and does not look up whether the user still exists, check roles, or consult a revocation list.

```mermaid
---
config:
  sequence:
    wrap: true
    actorMargin: 20
    width: 140
---
sequenceDiagram
    actor Client
    participant Routes as Express / authRoutes
    participant Errors as Central error handler
    participant Controller as AuthController
    participant JWT as jsonwebtoken
    Client->>Routes: POST /api/v1/auth/verify (Authorization header)
    Routes->>Controller: verify(req, res)
    Controller->>Controller: extractToken(req)
    break Token missing or Bearer prefix not accepted
        Controller-->>Routes: Throw AppError (401, Token is required)
        Routes->>Errors: asyncHandler forwards error
        Errors-->>Client: 401 (Token is required)
    end
    Controller->>JWT: verify(token, config.jwtSecret)
    break Invalid or expired token
        JWT-->>Controller: Throw verification error
        Controller-->>Routes: Rejected handler
        Routes->>Errors: asyncHandler forwards error
        Errors-->>Client: 401 (success false, Invalid or expired token)
    end
    JWT-->>Controller: Decoded object or string
    Controller-->>Client: 200 (success true, decoded)
```

## Validation and Error Boundaries

The Zod registration and login schemas enforce the [credential rules](../api/reference.md#credential-rules) at runtime. Their inferred `RegistrationInput` and `LoginInput` types describe the parsed credentials used by the controller and service. Mongoose still validates persisted documents and MongoDB enforces the unique username index.

See [Why Zod for Request Validation](overview.md#why-zod-for-request-validation) for the library choice and how it relates to enterprise validation practices.

Malformed JSON with `Content-Type: application/json` fails earlier in `express.json()`. The central handler in `src/api/middleware/error-handler.ts`, registered last in `app.ts`, responds with `400` and the same validation envelope: `success: false`, `message: "Invalid request body"`, and an `errors` entry whose field is `body` and message is `Request body must be a valid JSON object`. This applies to all three POST routes, including verification if a malformed JSON body is sent.

Schema failures return `errors` entries with `field: "username"`, `"password"`, or `"body"` and a rule message. Neither field validation nor JSON parsing errors expose submitted values. Controllers and services are not called for invalid registration or login bodies.

| Error boundary                                              | HTTP status | Response fields                       |
| ----------------------------------------------------------- | ----------- | ------------------------------------- |
| Registration/login validation or JSON parsing rejects input | `400`       | `success: false`, `message`, `errors` |
| Registration finds an existing username                     | `409`       | `success: false`, `message`           |
| Login rejects credentials                                   | `401`       | `success: false`, `message`           |
| Verification rejects a missing, invalid, or expired token   | `401`       | `success: false`, `message`           |
| Unexpected failures reach the central error handler         | `500`       | `success: false`, `message`           |

`AppError` carries an expected failure's HTTP status and safe client message. `asyncHandler` passes rejected route handlers to Express, and `errorHandler` writes the error response in one place. Unexpected errors, including thrown values that are not `Error` objects, return `Internal Server Error` without exposing dependency messages or stack traces. Zod field validation continues to return its existing detailed `400` envelope directly from `validateBody`.

## Trust Boundaries

External clients cross the HTTP boundary to reach AuthMS. Registration and login then cross a separate database connection boundary to access MongoDB; token verification stays within AuthMS.

```text
External client -> HTTP boundary -> AuthMS -> Database boundary -> MongoDB
```

| Boundary                                  | Current handling and implications                                                                                                                                                                                                                              |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Client password to AuthMS                 | Registration and login receive the raw password. Hashing occurs in `AuthService` before registration persistence; login compares against the hash. Passwords and hashes must stay out of logs and public responses.                                            |
| Runtime configuration to token operations | `JWT_SECRET` is loaded by configuration and used for both signing and verification. It must stay private: possession permits token creation. Configuration falls back to an empty string and does not enforce a valid secret at startup.                       |
| JWT to the caller and back                | Login returns the JWT to the caller, which later supplies it as a bearer token. Verification returns the decoded payload without extra claims validation or an account lookup. Applications consuming that result must make their own authorization decisions. |
| AuthMS to MongoDB                         | The repository persists credentials through the `User` model and retrieves password hashes for login. The controller limits registration responses to public fields. Database access and connection protection remain deployment responsibilities.             |

See the [security design](../security/overview.md) for secret handling and production hardening. The [testing strategy](../development/testing.md) describes controller and service unit tests and repository integration tests; those suites cover public user responses, duplicate users, credential failures, and bearer-header extraction, among other behaviors.
