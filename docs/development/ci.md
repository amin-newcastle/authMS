# Continuous Integration

AuthMS uses GitHub Actions as a pull-request quality gate. The workflow lives at:

```text
.github/workflows/ci.yml
```

## When CI Runs

CI runs on:

- Pull requests targeting `main`
- Changes pushed or merged into `main`
- Manual runs from the GitHub Actions tab

Runs for the same branch or pull request are grouped with concurrency, so an older run is cancelled when a newer commit is pushed.

Branch protection or a GitHub repository ruleset must separately require the `CI / CI quality gate` status check before merging. The workflow reports the check result, but repository settings decide whether a failing check blocks the merge button.

## Quality Gate

The CI job runs on Ubuntu with Node.js 22 and Python 3.13. Application dependencies are installed with:

```bash
npm ci
```

Documentation dependencies are installed with:

```bash
python -m pip install -r requirements-docs.txt
```

Checks run in this order:

```bash
npm run lint
npm run build
mkdocs build --strict
npm run test:unit
npm run test:integration
npm audit --audit-level=critical
docker compose build
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

## Documentation Build

The documentation check validates the MkDocs site with strict mode. Broken links, missing navigation entries, or invalid MkDocs configuration should fail CI before merge.
