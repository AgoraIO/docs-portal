# Migration Parity Audit Workflow

Use this workflow to check that migrated pages preserve visible content from
`AgoraIO/Doc-Source-Private`.

## Run Locally

Clone or update the private source repository outside this repo:

```bash
git clone git@github.com:AgoraIO/Doc-Source-Private.git \
  /Users/gaolinjie/.codex/cache/docs-portal/Doc-Source-Private
```

If the repository already exists:

```bash
git -C /Users/gaolinjie/.codex/cache/docs-portal/Doc-Source-Private \
  fetch --prune origin
git -C /Users/gaolinjie/.codex/cache/docs-portal/Doc-Source-Private \
  pull --ff-only
```

Run the audit:

```bash
bun run docs:migration-parity -- \
  --source-root=/Users/gaolinjie/.codex/cache/docs-portal/Doc-Source-Private \
  --all-targets
```

The command writes:

- `docs/agents/reports/migration-parity-audit.json`
- `docs/agents/reports/migration-parity-audit.md`

JSON is the source of truth. Markdown is the review attachment.

`--all-targets` enumerates every Markdown/MDX page under `content/docs/en`.
For each target page, it records one of these coverage states:

- `compared-clean`: a manifest or inferred source page was compared with no
  unresolved content differences.
- `compared-differences`: a source page was compared and the normalized record
  streams still differ.
- `unmapped-target`: no deterministic source path rule matched the target page.
- `ambiguous-source`: more than one deterministic source candidate matched.
- `compare-error`: source expansion or target comparison failed.

The full coverage report also lists `sourceOnly` files from the private source
clone that were not reached as an entry page or expanded shared dependency.
Shared fragments are counted as covered when they are imported by a compared
source page.

Full-audit source mapping is deterministic. The script first applies generic
product path rules, then applies named specialized aliases for known IA moves,
including:

- API reference lanes that moved from product REST or shared REST sources.
- Video SDK product pages that moved from legacy `advanced-features`,
  `best-practices`, `enhance-call-quality`, `token-authentication`, and
  `get-started` lanes into the new Build groups.
- Product rename, split, or regrouped lanes such as Signaling, Server Gateway,
  Device Kit, Marketplace, Cloud Recording, Cloud Transcoding, Speech-to-Text,
  Whiteboard, Flexible Classroom, Chat, and Conversational AI toolkit
  references.
- Shared introduction pages where the source is an existing
  `shared/common/**` fragment.

The script intentionally leaves a target as `unmapped-target` when no stable
source file exists or when the target appears to be a new portal aggregate,
fixture, or unmigrated placeholder. Do not add source aliases only to improve
the coverage number.

## PR Checklist

Before opening or merging a migration parity PR:

1. Update the local private source clone.
2. Run the full coverage audit:

   ```bash
   bun run docs:migration-parity -- \
     --source-root=/Users/gaolinjie/.codex/cache/docs-portal/Doc-Source-Private \
     --all-targets
   ```

3. If the PR claims a page is parity-clean, add that page to
   `docs/agents/migration-parity-manifest.json` and run the focused gate:

   ```bash
   bun run docs:migration-parity -- \
     --source-root=/Users/gaolinjie/.codex/cache/docs-portal/Doc-Source-Private \
     --fail-on-differences
   ```

4. Include the report timestamp, source ref, full coverage summary, and focused
   manifest summary in the PR body. Use `docs/agents/reports/migration-parity-audit.md`
   for human review and `docs/agents/reports/migration-parity-audit.json` as the
   source of truth.

5. If any human or LLM judgment is used to accept a noisy diff, say so in the PR
   body and keep the programmatic finding in the report.

For this PR, the full audit report generated at `2026-06-26T11:39:14.126Z`
mapped `893 / 1074` target pages. Excluding the 132 FAQ targets that do not
have deterministic private-source matches in the current clone, non-FAQ mapping
coverage is `893 / 942` target pages. The remaining non-FAQ unmapped targets
are primarily new aggregate/index pages, AI integration helper pages, fixtures,
and pages whose old source has not been found.

After rebasing onto the latest `main`, deterministic group rules for the newer
Build IA mapped the pages that moved under Video, Interactive Live Streaming,
Chat, Signaling, Server Gateway, RTMP Gateway, Whiteboard, and Flexible
Classroom groups. This returned full-audit unmapped targets from 377 to 181
without adding ambiguous mappings or compare errors.

## Manifest Contract

Add one entry per migrated page in
`docs/agents/migration-parity-manifest.json`.

Each page records:

- `targetPath`: migrated docs page in this repo.
- `sourceFiles`: legacy entry files under `Doc-Source-Private`.
- `product` and `platform`: projection used for wrappers and variables.
- `migrationMode`: short explanation of the migration shape.
- `ignoreRules`: intentional differences with a concrete reason.

The audit expands legacy `@docs/shared/**` and relative imports from the local
clone, filters `ProductWrapper` and `PlatformWrapper`, expands known
`Vg`/`Vpd`/`Vpl` variables, projects target `PlatformStructured` and
`PlatformInline`, normalizes records, then compares the two record streams.

## Report Semantics

The report classifies differences as:

- `missing`: source record has no target equivalent.
- `extra`: target record has no source equivalent.
- `changed`: same kind and similar content, but not equal.
- `moved`: same record exists but changed order.
- `unsupported`: source or target syntax was not normalized yet.
- `ignored`: an intentional difference matched by `ignoreRules`.

Use `--fail-on-differences` when the manifest page is expected to be fully
clean and the command should fail CI on unresolved differences.

Use `--fail-on-differences` for the focused manifest gate. Do not combine it
with `--all-targets` until every target page has a trusted source mapping and
accepted parity baseline.

## LLM Review

The default audit path is deterministic. If a PR uses LLM assistance to judge
whether a noisy `changed` or `moved` finding is acceptable, say that explicitly
in the PR body and keep the JSON report attached so reviewers can inspect the
programmatic evidence.
