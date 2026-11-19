# Documentation update times in Git-free builds

Page update times come from the latest content commit, through
`src/generated/docs-last-updated-manifest.ts`. They must not come from the
checkout, image build, deployment, or request time.

The Docker context excludes `.git`. Its tracked snapshot is usable only when
the snapshot's content hash matches all current docs and OpenAPI inputs. A
content change anywhere invalidates that snapshot. Without Git, the generator
cannot recover the dates and would otherwise produce an empty index, making
every page display “更新时间不可用”. Docker now checks the snapshot before
building and fails with preparation instructions if it is missing or stale.

## Prepare in the CN deployment pipeline

In the job that prepares the Docker context, check out the exact release
revision with full history. With GitHub Actions, use `actions/checkout` with
`fetch-depth: 0`. Then generate the snapshot **before** `docker build`:

```sh
node scripts/generate-docs-last-updated-manifest.mjs
node scripts/generate-docs-last-updated-manifest.mjs --check
docker build --build-arg VITE_DOCS_REGION=cn -t docs-portal:cn .
```

Use a clean checkout with the final content tree. Do not modify or prune content
between snapshot generation and the image build. The Docker check catches such
changes. Keep `.git` excluded; no Git credentials or history need to enter the
image context. The normal Git-free build then preserves the verified snapshot.

If the external CN builder only receives a GitHub source archive, use the
**Docs update-time snapshot** workflow instead. It checks out the exact commit
with full history and publishes `docs-last-updated-<full commit SHA>` on each
`main` push, PR head, and manual run. Download that successful run's artifact
and place `docs-last-updated-manifest.ts` at
`src/generated/docs-last-updated-manifest.ts` in the source archive **for the
same SHA**, then run the check and image build above. Pin the run and commit;
do not select an artifact by “latest”. The check verifies the content hash.

This repository supplies the artifact and Docker guard. The external CN
deployment job must either generate the snapshot before building or consume
that artifact. No repository change alone can configure an external pipeline.
The existing Vercel and CN search-bundle jobs already fetch full history and
generate timestamps during their builds; they do not need the artifact.

## Verify a release

Check the RTC overview, another product guide, and an OpenAPI endpoint in the
built CN site. The header must contain a `time[datetime]` matching the source
file's Git commit time (OpenAPI endpoints use their maintained YAML source).
For content with no trusted history, retain the existing unavailable state;
never fill it with the current time. Confirm the original production URL only
after the image has actually been deployed.
