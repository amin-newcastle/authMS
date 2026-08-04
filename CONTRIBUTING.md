# Contributing to AuthMS

Thank you for contributing to AuthMS. This guide explains the expected workflow for making focused, reviewable changes to the authentication microservice.

## Code of Conduct Expectations

AuthMS does not currently have a separate `CODE_OF_CONDUCT.md`, but contributors are expected to keep discussions professional, respectful, and useful.

- Be clear and constructive in issues, pull requests, and code review.
- Assume good intent, but ask for clarification when something is unclear.
- Keep review comments about the code, tests, documentation, and security impact.
- Do not post real credentials, JWTs, database URIs, tokens, or exploit details in public issues or pull requests.
- Report security vulnerabilities privately through the process in `SECURITY.md`.

## Prerequisites

Install the following before working locally:

- Git
- Node.js 18 or newer
- npm
- Docker Desktop with Docker Compose
- Python 3.13 and pip, for local documentation validation

The Docker image currently uses `node:18-alpine`. CI validates the service with Node.js 22 and Python 3.13.

## Local Project Setup

From the repository root:

```bash
npm ci
```

If Husky hooks are not installed after dependency installation, run:

```bash
npm run prepare
```

Start the TypeScript development server with:

```bash
npm run dev
```

Build and run compiled output with:

```bash
npm run build
npm start
```

To run the Docker Compose stack:

```bash
docker compose up --build -d
```

Stop the stack with:

```bash
docker compose down
```

## Environment Configuration

Create local environment files from the documented examples, not from real shared credentials. Real `.env` files must not be committed.

Required runtime values:

```text
NODE_ENV=development
PORT=5000
DB_URI=<local MongoDB connection string>
JWT_SECRET=<local development secret>
```

Use safe local-only values. Do not copy production, staging, personal account, or external service secrets into the repository.

Check masked environment loading with:

```bash
npm run load-env
```

The integration tests use `mongodb-memory-server`, so they do not require a local Docker MongoDB container.

## Branch Workflow

Developers must not commit or push directly to `main`. The expected workflow is:

```text
Update local main
Create a feature branch
Make focused changes
Run local checks
Commit using Commitizen
Push the feature branch
Open a pull request into main
Wait for CI
Resolve review comments
Merge through GitHub
```

Start every change from an up-to-date `main`:

```bash
git switch main
git pull --ff-only
git switch -c feature/add-refresh-tokens
```

## Branch Naming

Use short, descriptive branch names with a type prefix:

```text
feature/add-refresh-tokens
fix/token-expiry-validation
docs/update-api-reference
test/add-login-edge-cases
ci/update-quality-gate
refactor/extract-token-service
```

Prefer one focused purpose per branch. Avoid mixing unrelated refactors, documentation rewrites, dependency updates, and feature work in the same pull request.

## Conventional Commits and Commitizen

AuthMS uses Conventional Commits through Commitizen and commitlint.

Use Commitizen for normal commits by running:

```bash
git commit
```

The Husky `prepare-commit-msg` hook attempts to open Commitizen when no commit message is supplied.

If you provide a message manually, commitlint still checks it:

```bash
git commit -m "fix: handle expired jwt verification"
```

Common commit types:

- `feat:` for user-visible or API features
- `fix:` for bug fixes
- `docs:` for documentation-only changes
- `test:` for test-only changes
- `ci:` for workflow changes
- `refactor:` for behavior-preserving code changes
- `chore:` for maintenance tasks

Release commits are created with:

```bash
npm run release
```

## Coding and Formatting Standards

Use the existing TypeScript, ESM, Express, controller-service-repository, and Jest patterns already present in the repository.

Before opening a pull request:

```bash
npm run lint
npm run build
```

To apply automatic formatting and safe lint fixes:

```bash
npm run lint:fix
npm run format
```

Keep code focused and readable:

- Add validation and tests for behavior changes.
- Avoid unrelated refactoring.
- Keep comments useful and specific.
- Do not log secrets, passwords, full database URIs, tokens, or private configuration.
- Never return password hashes in API responses.

## Required Local Checks

Run the checks that match your change. For most code changes, run the full local quality gate:

```bash
npm run lint
npm run build
npm run test:unit
npm run test:integration
npm audit --audit-level=critical
docker compose build
```

For documentation changes, also validate the MkDocs site:

```bash
python -m pip install -r requirements-docs.txt
mkdocs build --strict
```

If a command cannot be run locally, explain why in the pull request.

## Documentation Expectations

Update documentation when behavior, setup, environment variables, endpoints, commands, CI, Docker behavior, security guidance, or release workflow changes.

Useful places to update:

- `README.md` for repository-level setup and quick-start information
- `docs/api/reference.md` and `docs/api/openapi.yaml` for API behavior
- `docs/development/*.md` for developer workflows
- `docs/security/overview.md` and `SECURITY.md` for security expectations

Documentation should use placeholders for secrets and credentials.

## Pull Requests

Push your branch and open a pull request into `main`:

```bash
git push -u origin feature/add-refresh-tokens
```

Complete the pull request template with:

- A concise summary
- Related issue or context
- Type of change
- Implementation notes
- Testing completed
- Security considerations
- Documentation changes
- Reviewer notes

Keep pull requests small enough to review carefully.

## CI Quality Gate

The main CI workflow runs for:

- Pull requests targeting `main`
- Pushes or merges into `main`
- Manual runs through `workflow_dispatch`

CI installs dependencies, validates linting, builds TypeScript, validates documentation, runs unit tests, runs integration tests, audits critical vulnerabilities, and builds the Docker image.

The workflow reports the `CI / CI quality gate` status check. A GitHub branch ruleset or branch protection rule must separately require that status check before merging.

## Review and Merge Rules

Do not merge through local pushes to `main`. Merge through GitHub after:

- CI has completed successfully
- Review comments have been addressed
- The pull request remains focused on the described change
- The diff contains no real secrets or accidental `.env` files

Do not claim that approval is mandatory unless the current GitHub repository rules require it. If GitHub requires approval or specific status checks, follow the repository settings shown on the pull request.

## Security Vulnerability Reporting

Do not open a public issue for exploitable security bugs, leaked credentials, tokens, database URIs, or private configuration.

Follow `SECURITY.md` and report privately to the maintainer with safe reproduction details.

If a secret is exposed, rotate it first. Removing it from code is not enough.

## Release Responsibilities

AuthMS uses `standard-version` for release metadata and changelog updates.

Release work should happen from an up-to-date `main` after the relevant pull requests have merged. Create release changes on a branch, open a pull request, and merge through GitHub.

Before release:

```bash
npm run lint
npm run build
npm run test:unit
npm run test:integration
npm audit --audit-level=critical
docker compose build
```

Create release metadata with:

```bash
npm run release
```

Use semantic versioning:

- Patch for bug fixes and documentation-only release updates
- Minor for backward-compatible feature additions
- Major for breaking API, persistence, or operational changes

Review `CHANGELOG.md`, `package.json`, and `package-lock.json` before merging the release pull request. Tags should point at the final release commit on `main`.
