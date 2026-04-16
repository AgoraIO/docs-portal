# Docs Portal Content Workspace Design

## Status

Approved for documentation. Implementation intentionally deferred until the content repository structure is finalized.

## Context

This repository is the next-generation docs portal shell. It currently uses a local `content/docs` directory as the content source for Fumadocs on TanStack Start.

That model does not match the desired ownership boundary:

- The portal should own site chrome, branded landing pages, deployment, and portal-specific UX.
- A separate repository should own the documentation corpus itself.
- The documentation repository should remain human-readable and directly consumable as Markdown/MDX.
- The documentation repository should also own its own navigation hierarchy and metadata.

## Decision

Adopt a single external content repository as a git submodule and integrate it into this portal through Fumadocs workspace support.

This portal will consume the content repository as a workspace-backed source instead of treating `content/docs` as the long-term source of truth.

## Goals

- Keep content ownership outside the portal repository.
- Let the content repository define document hierarchy, navigation, and metadata.
- Keep the portal focused on shell concerns: branding, landing pages, custom routes, search integration, and deployment.
- Preserve static build output suitable for S3 + CDN deployment.
- Avoid creating a second copy of the docs tree inside this repository.

## Non-Goals

- Finalizing the exact directory structure of the content repository before that repository exists.
- Migrating legacy docs in this phase.
- Implementing cross-repo release automation in this phase.
- Supporting multiple content repositories in the first iteration.

## Proposed Ownership Boundary

### Portal Repository

The portal repository owns:

- Homepage and branded landing pages
- Any portal-specific marketing or entry-point routes
- Global layout, navigation shell, theme, and styling
- Search UI integration
- Static build and deployment configuration
- Workspace consumption and route mounting

The portal repository does not own:

- The documentation corpus
- Page-level doc navigation structure
- Doc-side `meta.json` or equivalent content metadata
- The authoritative information architecture of the docs tree

### Content Repository

The content repository owns:

- Markdown/MDX source files
- Doc navigation and hierarchy
- Page metadata and section metadata
- Any content-side assets that travel with the docs
- Review and publishing workflow for knowledge content

## Architecture

### Repository Relationship

The content repository will be added to this repository as a git submodule under a dedicated directory such as:

```txt
external/knowledge
```

The exact submodule path is not important as long as it is:

- stable
- inside this repository
- clearly not mistaken for portal-owned content

### Fumadocs Integration Model

The portal should use Fumadocs workspace support rather than a simple direct `dir` mapping.

Reasoning:

- `dir` would work technically, but it models the content as a local directory owned by this app.
- `workspace` better reflects the intended boundary: one repository consumes another repository's content contract.
- `workspace` leaves room for future expansion without needing to redesign the integration model later.

### Route Model

The portal continues to own the site-level route map and mounts the content workspace at a docs route such as:

```txt
/docs/**
```

Within that route, navigation and hierarchy come from the content repository, not from portal-local docs structure.

### Search Model

Search should be generated from the workspace-backed source that represents the content repository.

This preserves the current static-search deployment model:

- build-time index generation
- static asset delivery through CDN
- no mandatory search API service for the default docs experience

If a future search implementation changes, that should still remain a portal concern, not a content-repository concern.

## Why This Design

### Why Not Keep `content/docs` in the Portal Repo

That would blur responsibilities and turn the portal into both a site shell and a content host. It would also make ownership and review flow less clear.

### Why Not Use Only a Direct `dir` Override

That is a valid fallback, but it is too low-level for the boundary we want. It couples the portal directly to a concrete folder layout and makes the relationship look like "portal owns docs but stores them elsewhere".

### Why Not Package the Content Repo as an NPM Dependency

That would harden the release boundary too early and add avoidable publishing overhead. At this stage, the docs need to stay directly readable and easy to update.

## Expected Repository Shape

The exact content repository shape is intentionally left open until that repository is finalized. The only architectural requirement is that it exposes a stable documentation source compatible with Fumadocs workspace consumption and contains its own navigation metadata.

The portal integration should therefore be written against a narrow contract:

- where the workspace root is
- where the docs source is inside that workspace
- where navigation metadata lives

Anything beyond that should remain adaptable.

## Migration Strategy

### Phase 1: Portal Design Freeze

- Keep the current local docs source temporarily so the portal remains runnable.
- Document the target boundary and integration model.
- Do not build migration logic before the content repository structure is known.

### Phase 2: Content Repository Finalization

- Finalize the content repository layout.
- Confirm the navigation metadata format and content root.
- Add the repository as a submodule.

### Phase 3: Workspace Wiring

- Replace portal-local docs source wiring with workspace-backed source wiring.
- Point search generation at the workspace source.
- Keep portal-only pages and routes in this repository.

### Phase 4: Legacy Migration

- Migrate old docs into the content repository.
- Validate URLs, hierarchy, redirects, and search behavior.
- Remove portal-local placeholder docs once migration is complete.

## Risks

### Submodule Operational Friction

Team members and CI must remember to initialize and update submodules.

### Content Contract Drift

If the portal assumes too much about the content repository layout too early, integration will become brittle. The portal should depend on the smallest possible content contract.

### Mixed Ownership Regression

If new docs are added directly into the portal repo during transition, the ownership boundary will erode. The migration should explicitly prevent this from becoming the default pattern.

## Open Questions

- What exact workspace layout will the content repository expose?
- What metadata files define navigation and section hierarchy?
- Will content-side assets live beside the docs files or in a dedicated asset directory?
- What URL preservation or redirect rules are required for old docs during migration?

## Implementation Guardrails

- Do not add new long-term documentation content under `content/docs`.
- Do not make the portal the source of truth for docs navigation.
- Keep the first version scoped to one content repository.
- Keep deployment static-first.

## Summary

The selected design is:

- one portal repository
- one external documentation repository
- the content repository added as a git submodule
- the portal consuming that repository through Fumadocs workspace support
- navigation and hierarchy owned by the content repository
- portal-specific pages and deployment owned by this repository

This keeps knowledge ownership clean while preserving the portal's role as the branded delivery surface.
