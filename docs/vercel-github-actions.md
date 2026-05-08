# Vercel GitHub Actions Deploy

This repository uses GitHub Actions to deploy Vercel in two paths:

- Pull requests targeting `main` deploy a preview build.
- Pushes to `main` deploy a production build.

The workflow file is [`.github/workflows/vercel-deploy.yml`](/Users/czhen/Documents/GitHub/Shengwang-Community/docs-portal/.github/workflows/vercel-deploy.yml).

## Triggers

- `pull_request`
  - target branch: `main`
  - events: `opened`, `synchronize`, `reopened`, `ready_for_review`
  - scope: only pull requests opened from branches in this repository
- `push`
  - branch: `main`
- `workflow_dispatch`
  - supports manual `preview` or `production` deploys
  - optional `pr_number` input for preview comment backfill

Forked pull requests are skipped so Vercel credentials are not exposed to untrusted code.

## Required GitHub Actions Secrets

Configure these repository secrets in GitHub:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## Current Project Mapping

- Vercel project: `docs-portal`
- `VERCEL_ORG_ID`: use the org/team ID from your linked Vercel project
- `VERCEL_PROJECT_ID`: use the project ID from the `docs-portal` Vercel project

Only `VERCEL_TOKEN` needs to be created manually. The org/project IDs should be copied from Vercel into GitHub repository secrets without committing them into the repository.

## Workflow Behavior

For preview deploys, the workflow:

1. Installs dependencies with `bun install --frozen-lockfile`
2. Pulls the Vercel `preview` environment
3. Builds with `vercel build`
4. Verifies `.vercel/output/config.json` and `.vercel/output/nitro.json`
5. Deploys with `vercel deploy --prebuilt`
6. Writes the preview URL into the GitHub Actions run summary
7. Posts or updates a PR comment with the preview URL

For production deploys, the workflow:

1. Installs dependencies with `bun install --frozen-lockfile`
2. Pulls the Vercel `production` environment
3. Builds with `vercel build --prod`
4. Verifies `.vercel/output/config.json` and `.vercel/output/nitro.json`
5. Deploys with `vercel deploy --prebuilt --prod`
6. Writes the production URL into the GitHub Actions run summary
