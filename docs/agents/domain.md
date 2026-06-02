# Domain Docs

This is a single-context repo. Engineering skills should read the root `CONTEXT.md` before substantial diagnosis, TDD, architecture, or issue-shaping work.

## Before exploring, read these

- `CONTEXT.md` at the repo root
- `docs/adr/` for architectural decisions, if it exists

If any optional files do not exist, proceed silently. Do not suggest creating them upfront; `/grill-with-docs` can create or update domain docs when terms or decisions are explicitly resolved.

## File structure

```text
/
├── CONTEXT.md
├── docs/adr/
└── src/
```

## Use the glossary's vocabulary

When output names a domain concept in an issue title, refactor proposal, hypothesis, or test name, use the term as defined in `CONTEXT.md`.

If the concept is missing, either reconsider whether the term belongs in this project or note the gap for `/grill-with-docs`.

## Flag ADR conflicts

If output contradicts an existing ADR, surface it explicitly instead of silently overriding the decision.
