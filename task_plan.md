# Task Plan

## Goal

Migrate existing source-backed docs into the placeholder pages under `content/docs/en/introduction` for:
- `security-privacy`
- `account`
- `console-setup`
- `glossary`
- `firewall`
- all pages under `billing/`

Do not invent new content. Reuse and adapt only documentation that already exists in this repository.

## Phases

| Phase | Status | Notes |
| --- | --- | --- |
| 1. Inspect target placeholders and locate source docs | in_progress | Identify exact target files and existing repo sources for each topic. |
| 2. Map source-to-target migration plan | pending | Decide which existing pages/sections feed each target page. |
| 3. Migrate content into target files | pending | Replace placeholders with adapted source-backed content. |
| 4. Verify navigation, links, and formatting | pending | Check frontmatter, headings, and local links. |
| 5. Run validation | pending | Run targeted checks such as `bun run types:check` if feasible. |

## Constraints

- Only use content already present in `docs-portal`.
- Treat current target page text as placeholder content.
- Avoid touching unrelated user changes in the worktree.

## Errors Encountered

| Error | Attempt | Resolution |
| --- | --- | --- |
| None yet | 0 | N/A |
