# English Product API Reference Links Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update all English product-document authentication links that still target legacy product reference pages so they reach the current API Reference canonical routes.

**Architecture:** This is a content-only migration with an explicit product-to-route mapping. Markdown and MDX hrefs under `content/docs/en/realtime-media` will be edited in place; API Reference sources, OpenAPI inputs, generated files, and runtime code remain unchanged.

**Tech Stack:** Markdown, MDX, Fumadocs content routing, `rg`, `bun`, Vitest, TypeScript.

---

## File map

The implementation modifies exactly these 13 files:

- `content/docs/en/realtime-media/speech-to-text/build/start-transcribing-and-translating/enable-service.md` — two legacy Speech-to-Text authentication links.
- `content/docs/en/realtime-media/speech-to-text/get-started/quickstart.md` — one legacy Speech-to-Text authentication link.
- `content/docs/en/realtime-media/speech-to-text/reference/rest-api.md` — one legacy Speech-to-Text authentication link.
- `content/docs/en/realtime-media/cloud-recording/build/start-a-recording/composite-mode.mdx` — three legacy Cloud Recording authentication links.
- `content/docs/en/realtime-media/cloud-recording/build/start-a-recording/individual-mode.mdx` — three legacy Cloud Recording authentication links.
- `content/docs/en/realtime-media/cloud-recording/build/start-a-recording/individual-nontranscoding.mdx` — three legacy Cloud Recording authentication links.
- `content/docs/en/realtime-media/cloud-recording/build/start-a-recording/screen-capture.mdx` — two legacy Cloud Recording authentication links.
- `content/docs/en/realtime-media/cloud-recording/build/start-a-recording/webpage-mode.mdx` — six legacy Cloud Recording authentication links.
- `content/docs/en/realtime-media/cloud-recording/rest-quickstart.mdx` — two legacy Cloud Recording authentication links.
- `content/docs/en/realtime-media/media-pull/build/integration-best-practices.md` — one legacy Media Pull authentication link.
- `content/docs/en/realtime-media/media-push/build/integration-best-practices.md` — one legacy Media Push authentication link.
- `content/docs/en/realtime-media/rtmp-gateway/quickstart.md` — one legacy RTMP Gateway authentication link.
- `content/docs/en/realtime-media/rtmp-gateway/reference/media-gateway-features.md` — one API Reference link still targeting RTMP Gateway’s hidden legacy authentication route.

No new source or test file is needed because the change only updates existing href values and the repository already provides the link-audit command.

### Canonical route mapping

| Product | Canonical route |
| --- | --- |
| Speech-to-Text | `/en/api-reference/api-ref/speech-to-text/authentication` |
| Cloud Recording | `/en/api-reference/api-ref/cloud-recording/authentication` |
| Media Pull | `/en/api-reference/api-ref/media-pull/restful-authentication` |
| Media Push | `/en/api-reference/api-ref/media-push/restful-authentication` |
| RTMP Gateway | `/en/api-reference/api-ref/rtmp-gateway/authentication` |

## Task 1: Verify the clean worktree and canonical targets

**Files:**

- Read: `docs/superpowers/specs/2026-09-09-product-api-ref-links-design.md`
- Read: `content/docs/en/api-reference/api-ref/{speech-to-text,cloud-recording,media-pull,media-push,rtmp-gateway}/meta.json`

- [ ] **Step 1: Confirm the worktree and branch.**

Run:

```bash
git status --short --branch
```

Expected: the branch is `codex/fix-product-api-ref-links` and the worktree has no uncommitted changes before content edits.

- [ ] **Step 2: Confirm the pre-edit candidate counts.**

Run:

```bash
printf 'legacy references: '
rg -o --glob '*.{md,mdx}' 'reference/restful-authentication' content/docs/en | wc -l
printf 'standalone Speech-to-Text auth references: '
rg -o --glob '*.{md,mdx}' '\./restful-authentication' content/docs/en | wc -l
printf 'hidden RTMP route references: '
rg -o --glob '*.{md,mdx}' '/en/api-reference/api-ref/rtmp-gateway/restful-authentication' content/docs/en | wc -l
```

Expected: `legacy references: 25`, `standalone Speech-to-Text auth references: 1`, and `hidden RTMP route references: 1`.

- [ ] **Step 3: Confirm the route leaves in navigation metadata.**

Run:

```bash
rg -n 'authentication|restful-authentication|!restful-authentication' \
  content/docs/en/api-reference/api-ref/{speech-to-text,cloud-recording,media-pull,media-push,rtmp-gateway}/meta.json
```

Expected: Speech-to-Text, Cloud Recording, and RTMP Gateway expose `authentication`; Media Pull and Media Push expose `restful-authentication`; RTMP Gateway marks `restful-authentication` as hidden.

## Task 2: Update Speech-to-Text, Media Pull, Media Push, and RTMP Gateway links

**Files:**

- Modify: `content/docs/en/realtime-media/speech-to-text/build/start-transcribing-and-translating/enable-service.md`
- Modify: `content/docs/en/realtime-media/speech-to-text/get-started/quickstart.md`
- Modify: `content/docs/en/realtime-media/speech-to-text/reference/rest-api.md`
- Modify: `content/docs/en/realtime-media/media-pull/build/integration-best-practices.md`
- Modify: `content/docs/en/realtime-media/media-push/build/integration-best-practices.md`
- Modify: `content/docs/en/realtime-media/rtmp-gateway/quickstart.md`
- Modify: `content/docs/en/realtime-media/rtmp-gateway/reference/media-gateway-features.md`

- [ ] **Step 1: Replace Speech-to-Text legacy hrefs.**

Apply these exact href replacements and leave all link text unchanged:

```text
../reference/restful-authentication
../../reference/restful-authentication
  -> /en/api-reference/api-ref/speech-to-text/authentication
```

The first replacement applies to `speech-to-text/get-started/quickstart.md`; the second applies twice to `speech-to-text/build/start-transcribing-and-translating/enable-service.md`.

In `speech-to-text/reference/rest-api.md`, replace:

```text
./restful-authentication
  -> /en/api-reference/api-ref/speech-to-text/authentication
```

- [ ] **Step 2: Replace Media Pull and Media Push legacy hrefs.**

Apply these exact replacements:

```text
content/docs/en/realtime-media/media-pull/build/integration-best-practices.md
../reference/restful-authentication
  -> /en/api-reference/api-ref/media-pull/restful-authentication

content/docs/en/realtime-media/media-push/build/integration-best-practices.md
../reference/restful-authentication
  -> /en/api-reference/api-ref/media-push/restful-authentication
```

- [ ] **Step 3: Replace both RTMP Gateway authentication href forms.**

Apply these exact replacements:

```text
content/docs/en/realtime-media/rtmp-gateway/quickstart.md
./reference/restful-authentication.mdx
  -> /en/api-reference/api-ref/rtmp-gateway/authentication

content/docs/en/realtime-media/rtmp-gateway/reference/media-gateway-features.md
/en/api-reference/api-ref/rtmp-gateway/restful-authentication
  -> /en/api-reference/api-ref/rtmp-gateway/authentication
```

- [ ] **Step 4: Verify this task changed only the intended eight href occurrences.**

Run:

```bash
rg -n --glob '*.{md,mdx}' \
  'reference/restful-authentication|\./restful-authentication|/en/api-reference/api-ref/rtmp-gateway/(restful-)?authentication' \
  content/docs/en/realtime-media/speech-to-text/build/start-transcribing-and-translating/enable-service.md \
  content/docs/en/realtime-media/speech-to-text/get-started/quickstart.md \
  content/docs/en/realtime-media/speech-to-text/reference/rest-api.md \
  content/docs/en/realtime-media/media-pull/build/integration-best-practices.md \
  content/docs/en/realtime-media/media-push/build/integration-best-practices.md \
  content/docs/en/realtime-media/rtmp-gateway/quickstart.md \
  content/docs/en/realtime-media/rtmp-gateway/reference/media-gateway-features.md
```

Expected: the eight updated links point to the mapped canonical routes; no `reference/restful-authentication` href, standalone `./restful-authentication` href, or RTMP `/restful-authentication` href remains in the seven modified files.

- [ ] **Step 5: Commit the focused product-link updates.**

Run:

```bash
git add content/docs/en/realtime-media/speech-to-text/build/start-transcribing-and-translating/enable-service.md \
  content/docs/en/realtime-media/speech-to-text/get-started/quickstart.md \
  content/docs/en/realtime-media/media-pull/build/integration-best-practices.md \
  content/docs/en/realtime-media/media-push/build/integration-best-practices.md \
  content/docs/en/realtime-media/rtmp-gateway/quickstart.md \
  content/docs/en/realtime-media/rtmp-gateway/reference/media-gateway-features.md
git commit -m "docs: fix product API authentication links"
```

Expected for a clean execution from the plan baseline: one commit containing the six initial files and seven href updates. In this worktree, that commit is already present as `70554f924`.

- [ ] **Step 6: Commit the additional Speech-to-Text REST API index link found during canonical route review.**

Run:

```bash
git add content/docs/en/realtime-media/speech-to-text/reference/rest-api.md
git commit -m "docs: fix speech-to-text API reference link"
```

Expected: one follow-up commit containing only `speech-to-text/reference/rest-api.md` and one href update, bringing Task 2 to eight total href updates.

## Task 3: Update all Cloud Recording authentication links

**Files:**

- Modify: `content/docs/en/realtime-media/cloud-recording/build/start-a-recording/composite-mode.mdx`
- Modify: `content/docs/en/realtime-media/cloud-recording/build/start-a-recording/individual-mode.mdx`
- Modify: `content/docs/en/realtime-media/cloud-recording/build/start-a-recording/individual-nontranscoding.mdx`
- Modify: `content/docs/en/realtime-media/cloud-recording/build/start-a-recording/screen-capture.mdx`
- Modify: `content/docs/en/realtime-media/cloud-recording/build/start-a-recording/webpage-mode.mdx`
- Modify: `content/docs/en/realtime-media/cloud-recording/rest-quickstart.mdx`

- [ ] **Step 1: Replace nested build-page hrefs.**

In the five files under `cloud-recording/build/start-a-recording`, replace every occurrence of:

```text
../../reference/restful-authentication
```

with:

```text
/en/api-reference/api-ref/cloud-recording/authentication
```

Expected count: 17 occurrences across the five files.

- [ ] **Step 2: Replace REST quickstart hrefs.**

In `content/docs/en/realtime-media/cloud-recording/rest-quickstart.mdx`, replace both occurrences of:

```text
../reference/restful-authentication
```

with:

```text
/en/api-reference/api-ref/cloud-recording/authentication
```

- [ ] **Step 3: Verify all 19 Cloud Recording hrefs use the canonical route.**

Run:

```bash
rg -n --glob '*.{md,mdx}' \
  'reference/restful-authentication|/en/api-reference/api-ref/cloud-recording/authentication' \
  content/docs/en/realtime-media/cloud-recording/build/start-a-recording/composite-mode.mdx \
  content/docs/en/realtime-media/cloud-recording/build/start-a-recording/individual-mode.mdx \
  content/docs/en/realtime-media/cloud-recording/build/start-a-recording/individual-nontranscoding.mdx \
  content/docs/en/realtime-media/cloud-recording/build/start-a-recording/screen-capture.mdx \
  content/docs/en/realtime-media/cloud-recording/build/start-a-recording/webpage-mode.mdx \
  content/docs/en/realtime-media/cloud-recording/rest-quickstart.mdx
```

Expected: 19 lines use `/en/api-reference/api-ref/cloud-recording/authentication`, and no old `reference/restful-authentication` href remains in the Cloud Recording product docs.

- [ ] **Step 4: Commit the Cloud Recording updates.**

Run:

```bash
git add content/docs/en/realtime-media/cloud-recording/build/start-a-recording/composite-mode.mdx \
  content/docs/en/realtime-media/cloud-recording/build/start-a-recording/individual-mode.mdx \
  content/docs/en/realtime-media/cloud-recording/build/start-a-recording/individual-nontranscoding.mdx \
  content/docs/en/realtime-media/cloud-recording/build/start-a-recording/screen-capture.mdx \
  content/docs/en/realtime-media/cloud-recording/build/start-a-recording/webpage-mode.mdx \
  content/docs/en/realtime-media/cloud-recording/rest-quickstart.mdx
git commit -m "docs: fix cloud recording authentication links"
```

Expected: one commit containing only the six Cloud Recording files and their 19 href updates.

## Task 4: Run repository-level verification

**Files:**

- Verify: all files changed by Tasks 2–3

- [ ] **Step 1: Confirm the complete modified-file set.**

Run:

```bash
git diff main...HEAD --name-only | sort
```

Expected: the two committed spec/plan files plus exactly the 13 product-document files listed in the file map; no API Reference, OpenAPI, generated, Chinese, or runtime files appear.

- [ ] **Step 2: Confirm no legacy authentication href remains in English product docs.**

Run:

```bash
if rg -n --glob '*.{md,mdx}' 'reference/restful-authentication|\./restful-authentication|/en/api-reference/api-ref/rtmp-gateway/restful-authentication' content/docs/en/realtime-media; then
  exit 1
else
  echo 'No legacy authentication hrefs remain in English product docs.'
fi
```

Expected: the success message is printed and the command exits 0.

- [ ] **Step 3: Check patch formatting.**

Run:

```bash
git diff main...HEAD --check
```

Expected: no output and exit 0.

- [ ] **Step 4: Run the docs link audit.**

Run:

```bash
bun run docs:links
```

Expected: the command completes successfully; its output contains no invalid-link row for any of the 13 modified product-document files. Existing unrelated API Reference anchor warnings, if reported, remain outside this plan.

- [ ] **Step 5: Run the content build/type check.**

Run:

```bash
bun run types:check
```

Expected: Fumadocs output generation and `tsc --noEmit` complete successfully.

- [ ] **Step 6: Run the existing test suite.**

Run:

```bash
bun run test
```

Expected: Vitest completes successfully; no runtime source or test changes are expected from this content-only fix.

## Commit sequence

The implementation commits should be:

1. `70554f924 docs: fix product API authentication links`
2. `docs: fix speech-to-text API reference link`
3. `docs: fix cloud recording authentication links`

The design and implementation-plan commits already exist on `codex/fix-product-api-ref-links`.
