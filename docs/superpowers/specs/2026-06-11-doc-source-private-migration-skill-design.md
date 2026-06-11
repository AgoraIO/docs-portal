# Doc-Source-Private To Docs-Portal Migration Skill Spec

## Goal

Define a reusable migration specification for moving English documentation from `Doc-Source-Private` into `docs-portal` using the portal's Fumadocs content model.

This spec is intended to become the source of truth for a future reusable skill, not just a one-off prompt. It should capture:

- the stable migration workflow
- the transformation contract
- the validation contract
- the `Doc-Source-Private`-specific source profile

The spec should be reusable across multiple product lanes in `Doc-Source-Private`, while still preserving the repo-specific rules that make this migration safe and verifiable.

## Non-goals

This spec does not try to:

- define a generic migration workflow for arbitrary third-party doc systems
- solve every generated API reference lane in V1
- replace the repo-owned `fumadocs-migration` core skill
- fully automate all content rewrites without human review
- treat online docs pages as the primary source of truth

This spec is specifically about migrating `Doc-Source-Private` content into this portal.

## Why A New Skill Layer Is Needed

The current migration rules in `.agents/skills/fumadocs-migration` are valuable as a shared Fumadocs target contract, but `Doc-Source-Private` has a materially different source shape:

- product-bucketed folders at the repo root
- `_category_.json` navigation metadata
- heavy use of shared wrappers under `shared/chat-sdk/**` and `shared/common/**`
- legacy runtime variables such as `<Vg />`, `<Vpd />`, and `<Vpl />`
- product and platform gating through `PlatformWrapper` and `ProductWrapper`
- wrapper pages whose real content lives in imported MDX fragments

Because of this, a reusable migration skill must be split conceptually into:

1. a shared Fumadocs target standard
2. a `Doc-Source-Private` source profile

The shared standard already largely exists. This spec defines the missing profile and workflow layer.

## Source And Target Model

### Source model

Primary source:

- `/Users/yangyixuan/Documents/GitHub/Doc-Source-Private`

Important source characteristics:

- Each product has a root folder such as `agora-chat`, `signaling`, `video-calling`, `real-time-stt`, and `conversational-ai`.
- Folder navigation is described by `_category_.json`.
- Many page files are wrappers with imports such as:

  - `@docs/shared/chat-sdk/...`
  - `@docs/shared/common/...`
  - `@site/data/variables`

- Many pages are MDX-first and depend on legacy JSX or Docusaurus components.
- Assets live under `assets/images/**`.

### Target model

Target repo:

- `/Users/yangyixuan/Documents/GitHub/docs-portal`

Target content root:

- `content/docs/en/**`

Target content rules:

- Fumadocs page tree
- `meta.json` navigation
- Markdown or MDX native first
- no legacy JSX survival
- repo-local static assets under `public/images/**`

## Source Priority

The migration pipeline must use sources in this priority order:

1. local source files in `Doc-Source-Private`
2. recursively expanded local shared imports
3. local image assets
4. online docs pages only for structure verification, gap filling, or sanity checks

Online pages are never the primary writing source if local MDX already exists.

## Required Output Contract

For each migrated page:

- The final output must be a portal-readable `.md` or `.mdx` file under `content/docs/en/**`.
- The page must include frontmatter:

```yaml
---
title: ...
description: ...
---
```

- If the source file lacks a useful description, the migration must synthesize one concise and accurate summary.
- The page must not retain legacy Docusaurus runtime fields such as:

  - `sidebar_position`
  - `displayed_sidebar`
  - `platform_selector`
  - `ag_product`
  - `ag_platform`
  - `ag_product_label`
  - `ag_usecase`
  - `ag_file_path`

- The migrated page must not remain as `.mdx` merely because the source was `.mdx`. Legacy MDX is an input format, not a target justification.

## Navigation Contract

### Meta generation

`_category_.json` must be treated as navigation input, not copied directly.

Target navigation must be expressed through `meta.json` at each directory scope.

Rules:

- top-level product landing folder gets a root `meta.json`
- child group folders get their own `meta.json`
- `pages` order must respect source order as closely as possible
- nested group folders should be represented as directory entries in parent `meta.json`
- the result must match Fumadocs expectations already used elsewhere in the repo

### Ordering rules

Ordering should be determined in this order:

1. explicit `_category_.json.position`
2. page `sidebar_position`
3. stable filename order only as a fallback

The skill should not silently flatten meaningful nested groups.

## Link Contract

### Internal documentation links

Links pointing to docs content should be rewritten into actual repo-valid relative Markdown links whenever possible.

That includes:

- old `/agora-chat/...` absolute links
- relative legacy links without `.md`
- old links carrying `?platform=` query parameters that no longer match the new static target
- old links to wrapper aliases that now resolve to a different file name or group page

Preferred target form:

- relative Markdown path to the migrated file
- keep hash fragments when the matching heading still exists

If there is no safe local target:

- keep the external docs URL temporarily
- mark it in the migration report as unresolved internal-link debt

### External links

True external links remain unchanged.

### Mail links

Plain email references should be normalized to `mailto:` links when appropriate.

## Image Contract

### Local images

If a page references a source-controlled image and that image exists under `Doc-Source-Private/assets/images/**`, the migration must copy it into the portal's `public/images/**` tree and rewrite the page to use the local asset path.

Default behavior:

- preserve folder semantics when useful
- do not rename files unless collision or invalid-path handling requires it

### Remote images

If the source page references a remote image such as `https://web-cdn.agora.io/...`:

- prefer downloading it to `public/images/**`
- if download fails or is blocked, keep the remote URL temporarily
- record the failure in the migration report

### YAML safety

No `.yaml` or `.yml` file content should be rewritten or reformatted by this migration skill.

## Legacy Syntax Transformation Contract

The skill must aggressively normalize legacy syntax into portal-supported content forms.

### Required transforms

- `ProductOverview` -> static Markdown landing structure
- `Admonition` -> directive callout
- `CodeBlock` -> fenced code block
- `Link` -> Markdown link
- `Image` -> Markdown image
- `Tabs` / `TabItem` -> portal-supported tabs or statically expanded content
- `PlatformWrapper` / `ProductWrapper` -> static content expansion
- `Vg` / `Vpd` / `Vpl` -> explicit text expansion

### Wrapper expansion

Many source pages are only wrappers around imported MDX. The migration skill must recursively resolve imports before content cleanup.

That includes:

- page-level wrapper files
- shared fragments
- nested shared fragments

The skill must distinguish:

- content imports that should be expanded
- UI-only imports that should be dropped
- variable imports that should be resolved
- unresolved imports that should be recorded

### Platform variants

Platform-specific blocks must not survive as runtime wrappers.

For `Doc-Source-Private`, when the source design expresses platform switching, the migration must preserve that information architecture as real per-platform pages rather than flattening all platform content into one long page.

Required behavior:

- each platform variant becomes its own real target page
- page-level platform switching is expressed through navigation and URL changes, not same-page content toggling by flattening
- the user should move between platform pages by changing route, while the page header can expose the platform switcher UI
- links between platform siblings should be real page links

This means the migration skill must prefer static page splitting by platform for source pages whose original IA is platform-switched.

Same-page expansion is only acceptable when the source page was not designed as a platform-switched page and the content differences are incidental rather than structural.

## Validation Contract

Minimum validation for a migration batch:

- `fumadocs-mdx`
- local link existence checks for relative repo paths
- confirmation that `meta.json` files exist at each migrated group level
- confirmation that migrated target pages do not remain as legacy `.mdx` leftovers when they should now be `.md`
- confirmation that no `.yaml` or `.yml` file was modified

Preferred validation when environment permits:

- `bun run types:check`
- targeted local preview verification
- route-level smoke checks on representative migrated pages

## Reporting Contract

Each migration run should produce a structured report with:

- migrated source file count
- generated target file count
- created or updated `meta.json` files
- copied local asset count
- unresolved internal links
- unresolved remote images
- skipped or deferred pages
- known manual follow-up items

The user-facing summary should explicitly list:

- added files
- modified files
- updated navigation files
- link handling summary
- image handling summary
- items still needing manual confirmation

## Recommended Skill Architecture

Use a layered skill design:

### Layer 1: shared migration core

Keep:

- `.agents/skills/fumadocs-migration`

This owns:

- Fumadocs target content rules
- validation gates
- legacy syntax standards
- repo-wide migration philosophy

### Layer 2: `Doc-Source-Private` profile

Add a source-profile skill or reference set that owns:

- source tree assumptions
- `_category_.json` mapping
- import expansion rules
- image source locations
- known path aliases
- lane-specific target mappings

### Layer 3: product execution profile

Optional per-product overlays may define:

- target landing path
- group-to-folder mapping
- platform route mapping and page-header platform switch behavior
- lane-specific exclusions

This keeps the general migration skill reusable without baking every product's quirks into one file.

## Recommended Future Skill File Layout

Suggested shape:

```text
skill-name/
├── SKILL.md
├── references/
│   ├── migration-spec.md
│   ├── doc-source-private-profile.md
│   ├── legacy-component-map.md
│   ├── navigation-rules.md
│   ├── link-and-asset-rules.md
│   └── validation-and-reporting.md
├── scripts/
│   ├── expand_imports.py
│   ├── rewrite_legacy_content.py
│   ├── sync_images.py
│   └── audit_migration_batch.py
└── agents/
    └── openai.yaml
```

`SKILL.md` should stay concise and point to the right reference file depending on the task.

## Recommended Trigger Description

The eventual skill should trigger for requests like:

- migrate docs from `Doc-Source-Private`
- convert legacy Agora docs into portal docs
- move English product docs into `content/docs/en`
- rewrite legacy MDX and Docusaurus content into Fumadocs structure
- update `meta.json` while migrating product docs

## Doc-Source-Private Profile

### Confirmed source characteristics

- product folders are at repo root
- `agora-chat` and similar products use wrapper pages heavily
- shared content often lives under:
  - `shared/chat-sdk/**`
  - `shared/common/**`
- assets often live under:
  - `assets/images/chat/**`
  - `assets/images/common/**`
  - `assets/images/signaling/**`
  - `assets/images/console/**`
  - `assets/images/status-page/**`

### Known migration pain points

- wrapper pages can be nearly empty without recursive expansion
- code snippets may contain `import` statements that must not be mistaken for top-level MDX imports
- many links omit `.md`
- many links still encode old `?platform=` route assumptions
- some images are local, some are remote CDN-hosted
- remote images may be valid but still need local publication for stable preview and build

### Example lane mapping

For `agora-chat`, a good target structure is:

```text
content/docs/en/realtime-media/im/
  index.md
  meta.json
  overview/
  get-started/
  develop/
  client-api/
  agora-console/
  reference/
  restful-api/
```

This pattern should be treated as a product profile, not a global assumption for every lane.

## Open Questions To Fill In Later

These are the most important details to add before freezing the final skill:

- Which product lanes in `Doc-Source-Private` are officially in-scope for V1?
- Which source patterns count as true platform-switched IA and therefore must produce sibling platform pages?
- Which legacy routes should remain as external fallback rather than be force-mapped locally?
- Which remote CDN image domains are allowed for temporary fallback?
- Should migration reports live under `docs/superpowers/reports/**`, or under the skill folder itself?
- Should the future skill own executable rewrite scripts, or should it mainly orchestrate repo-local scripts?

## Recommendation

Build the reusable migration skill around this spec in two passes:

1. lock the spec and `Doc-Source-Private` profile
2. implement the skill and references from the spec

Do not invert that order. If the spec is still implicit, the skill will overfit to whichever product lane happened to be migrated first.
