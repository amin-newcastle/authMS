# Release Process

AuthMS uses `standard-version` for version and changelog management.

## Create a Release Update

```powershell
npm run release
```

This updates version metadata and `CHANGELOG.md` according to conventional commit history.

## Recommended Checklist

Before cutting a release:

- Run `npm run tests`.
- Run `npm run lint`.
- Run `npm run build`.
- Build the Docker image with `docker compose build`.
- Review `CHANGELOG.md`.
- Confirm no real secrets are present in the diff.

## Versioning Notes

Use semantic versioning:

- Patch for bug fixes and documentation-only release updates.
- Minor for backward-compatible feature additions.
- Major for breaking API or persistence changes.
