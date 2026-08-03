# Safe Automated Dependency Updates

This project uses GitHub Dependabot to propose dependency updates without
changing the live site directly. Validation uses the Vercel preview and local
production smoke tests, so paid GitHub Actions runners are not required.

## What happens automatically

1. Dependabot checks npm dependencies every Monday at 03:00 Asia/Tokyo.
2. Patch and minor updates are grouped into focused pull requests.
3. Vercel creates a preview deployment for every pull request.
4. Before merging, run `npm ci`, `npm run build`, and `npm run test:smoke`
   locally and verify the Vercel preview on desktop and mobile.

The same public safety test can be run locally after a production build with
`npm run test:smoke`.

Dependabot cannot push an update directly to production. This repository does
not include an auto-merge workflow, GitHub Actions runner, write permissions,
production secrets, or production deployment commands.

## Owner approval checklist

Only merge an update pull request when all of the following are true:

- The local production build and public smoke tests pass.
- The Vercel preview deployment is green.
- Home, services, projects, blog, contact, and admin login look correct in the
  preview deployment on desktop and mobile.
- The pull request does not contain an unexpected major-version update.
- Release notes do not mention a migration relevant to this application.

Merging to the production branch may trigger the existing Vercel deployment,
so the final merge remains a manual owner decision.

## Update policy

- Patch updates: normally low risk, but still require green checks and manual
  approval.
- Minor updates: review release notes and the preview before manual approval.
- Major Next.js, React, and React DOM updates: intentionally ignored by the
  automatic updater. Create a dedicated upgrade branch and migration plan.

## If validation fails

Do not merge the pull request. Inspect the local build or Playwright output and
the Vercel preview logs. Dependabot keeps the live site unchanged while the
pull request remains open.

## Rollback

If an approved update causes a production-only problem:

1. Use Vercel's previous production deployment to restore service immediately.
2. Revert the update pull request on GitHub.
3. Diagnose the issue in a separate branch and preview deployment.

Never run a forced dependency upgrade or `npm audit fix --force` against the
production branch. Security advisories should use the same pull-request,
build, preview, and manual-approval process.
