# Contributing Workflow

AuthMS uses a pull-request workflow so changes can be checked by automation and reviewed before they become part of `main`.

## Why Main Is Protected

`main` represents the latest accepted state of AuthMS. It should stay buildable, testable, and releasable.

Direct commits to `main` are blocked locally by the Husky pre-commit hook. GitHub repository rules or branch protection should also be configured to prevent direct pushes and require the `CI / CI quality gate` status check before merge.

Protection matters because AuthMS owns authentication behavior. Small mistakes can affect login, token verification, password safety, or downstream services that depend on bearer-token checks.

## Why Feature Branches Are Used

Feature branches keep work isolated until it is ready. They make it easier to:

- Review one focused change at a time
- Run CI before merge
- Discuss implementation details without blocking `main`
- Abandon or rewrite a change without disturbing released code
- Keep release notes and history understandable

Use branch names that describe the change, such as:

```text
feature/add-refresh-tokens
fix/token-expiry-validation
docs/update-api-reference
test/add-login-edge-cases
ci/update-quality-gate
refactor/extract-token-service
```

## Pull Requests And CI

Open pull requests into `main`. The CI workflow runs automatically for pull requests targeting `main`.

The quality gate validates:

```bash
npm run lint
npm run build
mkdocs build --strict
npm run test:unit
npm run test:integration
npm audit --audit-level=critical
docker compose build
```

CI uses test-only environment values and `mongodb-memory-server` for integration tests. It does not need real production or development credentials.

The workflow reports the `CI / CI quality gate` status check. GitHub branch rules decide whether that check blocks the merge button.

## How Concurrency Helps

The CI workflow has a concurrency group based on the workflow name and either the pull request number or branch ref. When you push a newer commit to the same pull request, GitHub cancels older in-progress runs for that pull request.

That keeps feedback relevant. Reviewers and developers should focus on the newest CI run, not older runs from commits that are no longer current.

The documentation publishing workflow uses a separate Pages concurrency group. It avoids overlapping Pages deployments when documentation changes are merged into `main`.

## When CI Fails

Start with the first failed step in the workflow log. Later failures may be side effects.

Common responses:

- Lint failure: run `npm run lint` locally, then `npm run lint:fix` if the issue is auto-fixable.
- TypeScript failure: run `npm run build` and fix the reported type or compile error.
- Unit test failure: run `npm run test:unit` and check the failing assertion.
- Integration test failure: run `npm run test:integration`; remember that tests use in-memory MongoDB.
- Documentation failure: run `mkdocs build --strict` and fix broken navigation, links, or MkDocs configuration.
- Audit failure: review the critical vulnerability and update or replace the affected dependency.
- Docker failure: run `docker compose build` and inspect the failed Dockerfile or Compose step.

Push another commit after fixing the problem. The older CI run should be cancelled and replaced by a newer run.

## Updating A Branch From Main

Update your local `main`:

```bash
git switch main
git pull --ff-only
```

Then update your feature branch:

```bash
git switch feature/add-refresh-tokens
git merge main
```

Resolve conflicts carefully, then rerun the checks that match the changed files. If the team prefers rebasing for a specific pull request, rebase only when it is safe for everyone using the branch.

## After A Pull Request Merges

After GitHub merges the pull request:

```bash
git switch main
git pull --ff-only
git branch -d feature/add-refresh-tokens
```

If GitHub did not delete the remote branch automatically, remove it manually:

```bash
git push origin --delete feature/add-refresh-tokens
```

Do not delete a branch that another developer is still using.

## Documentation Validation And Publishing

Documentation changes are validated in two places:

- The CI quality gate runs `mkdocs build --strict` before pull requests merge.
- The documentation workflow runs after relevant documentation changes are pushed or merged into `main`.

Local validation uses:

```bash
python -m pip install -r requirements-docs.txt
mkdocs build --strict
```

The documentation publishing workflow builds the MkDocs site, uploads the Pages artifact, and deploys it through GitHub Pages. This publishes documentation only; it does not deploy AuthMS application code.

Keep `mkdocs.yml` navigation, `docs/index.md`, and any affected topic pages in sync so the published documentation remains easy to browse.
