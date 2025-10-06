# AuthMS

Authentication Microservice for Node.js, Express, MongoDB, and JWT

---

## Overview

**AuthMS** is a modular authentication microservice designed for modern Node.js applications. It follows the controller-service-repository design pattern for clean separation of concerns and testability.

- **Controller Layer:** Handles HTTP requests and responses.
- **Service Layer:** Contains business logic and orchestrates calls to the repository.
- **Repository Layer:** Handles all data access logic (e.g., queries to a database).

---

## Features

- User registration and login
- Password hashing with bcrypt
- JWT-based authentication
- Modular architecture (controller, service, repository)
- Unit and integration tests (Jest)
- Auto-generated changelog and version bump (via standard-version)
- GitHub Actions for automated release PRs

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB (local or cloud)

### Installation

```sh
npm install
```

### Environment Variables

Create a `.env` file or configure `config/env.js` with:

```
JWT_SECRET=your_jwt_secret
MONGO_URI=mongodb://localhost:27017/authms
```

### Running the Service

```sh
npm run dev
```

### Running Tests

- **Unit tests:**
  ```sh
  npm run test:unit
  ```
- **Integration tests:**
  ```sh
  npm run test:integration
  ```
- **All tests:**
  ```sh
  npm run test:all
  ```

---

## Release & Changelog

- To bump version and update `CHANGELOG.md`:
  ```sh
  npm run release
  ```
- On merge to `main`, a GitHub Action will create a PR with the updated changelog and version bump.

---

## Project Structure

```
src/
  api/
    controllers/
    services/
    repositories/
    models/
  config/
  tests/
    unit/
    integration/
```

---

## Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes
4. Push to the branch
5. Open a pull request

---

## License

MIT

---

## Maintainer

Muhammad Karim

---

## Acknowledgements

- [Express](https://expressjs.com/)
- [Mongoose](https://mongoosejs.com/)
