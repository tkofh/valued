# Releasing

Releases are automated with [Changesets](https://github.com/changesets/changesets) and published to npm via [trusted publishing](https://docs.npmjs.com/trusted-publishers) (GitHub Actions OIDC). No npm token exists anywhere — not in repo secrets, not on a maintainer's machine.

## One-time setup

Both halves must exist before the first automated publish; nothing else is required.

### npm: register the workflow as a trusted publisher

1. On [npmjs.com](https://www.npmjs.com/package/valued/access), open the `valued` package → Settings → Trusted Publisher.
2. Choose **GitHub Actions** and enter:
   - Organization or user: `tkofh`
   - Repository: `valued`
   - Workflow filename: `release.yml`
   - Environment: `release`

### GitHub: create the gated `release` environment

1. Repo Settings → Environments → **New environment** named `release` (must match both the workflow's `environment:` and the npm trusted-publisher config).
2. Enable **Required reviewers** and add yourself. This is what makes publishing a deliberate click instead of a side effect of merging.

## Day-to-day flow

1. Land PRs with changeset files as usual (`pnpm changeset`).
2. On every push to `main`, the release workflow updates the **Version Packages** PR, which accumulates pending changesets into a version bump and changelog.
3. Merging that PR puts an unpublished version on `main`. The workflow detects this and queues the `publish` job against the `release` environment, which waits for reviewer approval.
4. Approve the deployment. The job re-runs typecheck, lint, format check, build, and tests on the exact tree being published, then `changeset publish` publishes with provenance, pushes the `valued@x.y.z` git tag, and creates the GitHub Release.

Pushes to `main` that leave nothing to publish (the current version is already on npm, or changesets are still pending) never request approval.
