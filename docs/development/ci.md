# Continuous Integration

AuthMS uses GitHub Actions as a pull-request quality gate. The workflow lives at:

```text
.github/workflows/ci.yml
```

## When CI Runs

CI runs on:

- Pull requests targeting `main`
- Pushes to `main`
- Manual runs from the GitHub Actions tab

Runs for the same branch or pull request are grouped with concurrency, so an older run is cancelled when a newer commit is pushed.

## Quality Gate

The CI job runs on Ubuntu with Node.js 22 and installs dependencies with:

```bash
npm ci
```

Checks run in this order:

```bash
npm run lint
npm run build
npm run test:unit
npm run test:integration
docker compose build
npm audit --audit-level=critical
```

The audit step fails CI only for critical vulnerabilities. Lower-severity findings should still be reviewed, but they do not block the pull-request gate by default.

## Test Configuration

CI uses test-only placeholder environment values:

```text
NODE_ENV=test
DB_URI=mongodb://127.0.0.1:27017/authms_test
JWT_SECRET=test-only-ci-secret-that-is-never-used-in-production
```

The integration tests use `mongodb-memory-server`, so they do not require a real external MongoDB instance or GitHub Secrets.

## Docker Build

The Docker build validates that the production image can be built from the current source. The Compose stack receives the CI-only JWT placeholder through the workflow environment so no real runtime secret is required.
