# Move zh-CN billing navigation above product task sections

**Date:** 2026-07-16
**Status:** Approved, pending implementation plan

## Problem

Many zh-CN product sidebars currently bury billing-related pages under the
`参考` section. Billing pages are decision-support content that users often need
before integration work, so keeping them inside `reference` makes them harder to
find and inconsistent with the desired information architecture.

The request is limited to the Chinese documentation tree. English navigation,
page bodies, URLs, and file locations should not change.

## Decision

Move billing-related navigation entries out of each affected zh-CN product's
`reference/meta.json` and into that product's root `meta.json`, while keeping the
underlying page files in the `reference` directory.

For example, a billing page that remains at
`content/docs/zh-CN/realtime-media/danmaku/reference/billing.mdx` should become a
root-level navigation entry as `reference/billing`. This changes only sidebar
placement, not URL ownership or file layout.

## Placement Rules

1. If the product root nav has release notes, place the billing entry directly
   below the release notes entry.
2. If the product has no release notes but has a quick-start/get-started entry,
   place the billing entry directly above the quick-start/get-started entry.
3. Product-specific fallbacks:
   - `content/docs/zh-CN/realtime-media/content-moderation`: place billing
     directly above `enable-service`.
   - `content/docs/zh-CN/realtime-media/media-push`: place billing directly
     below `index`.
   - `content/docs/zh-CN/realtime-media/usage-analytics`: place billing directly
     below `reference/release-notes`.
4. Do not change `content/docs/zh-CN/solutions/multi-usecase/*` in this pass.

## Affected Navigation

The implementation should cover zh-CN products with billing-related entries in
`reference/meta.json`, excluding `solutions/multi-usecase/*`.

Realtime Media:

- `cloud-recording`: move the existing `计费说明` group after
  `reference/release-notes`.
- `content-moderation`: move `billing` above `enable-service`.
- `danmaku`: move `billing` after `reference/release-notes`.
- `fusion-cdn`: move `billing` above `get-started/quick-start`.
- `local-server-recording`: move the existing `计费说明` group after
  `reference/release-notes`.
- `marketplace`: move `usage-billing` above `get-started/enable-service`.
- `media-pull`: move the existing `计费说明` group after
  `reference/release-notes`.
- `media-push`: move the existing `计费说明` group after `index`.
- `rtc`: move the existing `计费与限制` group after `reference/release-notes`.
- `rtm`: move the existing `计费说明` group after `reference/release-notes`.
- `rtmp-gateway`: move the existing `计费说明` group above
  `get-started/use-gateway`.
- `rtsa`: move `billing` after `reference/release-notes`.
- `speech-to-text`: move `billing` after `reference/release-notes`.
- `transcoding`: move `billing` above `get-started/quick-start-go`.
- `usage-analytics`: move `billing` after `reference/release-notes`.
- `whiteboard/fastboard-sdk`: move the existing `计费说明` group after
  `reference/release-notes-fb`.
- `whiteboard/whiteboard-sdk`: move the existing `计费说明` group after
  `reference/release-notes-wb`.

Solutions:

- `flexible-classroom`: move `billing` after `reference/release-notes`.
- `game-voice`: move `billing` above `get-started`.
- `one-to-one-live/custom-signaling`: move `app-billing-policy` above
  `get-started`.
- `one-to-one-live/rtm`: move `app-billing-policy` above `get-started`.
- `online-ktv/auikaraoke`: move `billing` above `get-started`.
- `online-ktv/ktv-scenario`: move `billing` above
  `get-started/integrate-ktvapi`.
- `online-ktv/online-ktv-sdk`: move `billing` above `get-started/karaoke`.
- `ppt-transcoding`: move `billing` above `get-started`.

## Mechanism

This is a pure `meta.json` edit:

- In each affected product root `meta.json`, add the moved entry using a
  `reference/...` path so the existing content file remains in place.
- In the corresponding `reference/meta.json`, remove only the moved
  billing-related entry from `pages`.
- Preserve existing group objects exactly where possible: `type`, `title`,
  `collapsible`, and child `pages` order should stay the same, with only child
  paths prefixed by `reference/` after moving to the root nav.
- Preserve non-billing reference entries and their order.
- Do not edit generated files or unrelated user changes already present in the
  worktree.

## Error Handling

If a product has an unexpected root nav shape during implementation, do not guess
silently. Treat it as a local exception and either apply the nearest approved
placement rule only when unambiguous, or stop and ask for clarification.

If moving a group would leave `reference/meta.json` empty, keep a valid empty
`pages` array only if the surrounding product still needs the `reference` section.
Otherwise, do not remove the root `reference` entry unless the implementation
plan explicitly verifies that no reference pages remain.

## Testing

Automated checks:

- Parse every edited `meta.json` as JSON.
- Assert each moved billing entry appears exactly once in the product root nav.
- Assert each moved billing entry no longer appears in the corresponding
  `reference/meta.json`.
- Assert skipped `content/docs/zh-CN/solutions/multi-usecase/*` files remain
  unchanged.

Project checks:

- Run `bun run types:check` after the nav edits if Bun is available in the
  execution environment.
- If Bun is unavailable, report that project-level validation could not run and
  include the JSON/navigation assertions as the minimum verification.

Manual review:

- Spot-check representative sidebars:
  - one release-note product such as `rtc`;
  - one quick-start fallback product such as `fusion-cdn`;
  - each special case: `content-moderation`, `media-push`, and
    `usage-analytics`;
  - one grouped billing product such as `cloud-recording`.

## Out of Scope

- English docs.
- Moving or renaming content files.
- Redirects or URL changes.
- Page body edits.
- `content/docs/zh-CN/solutions/multi-usecase/*`.
- Broad reference IA cleanup unrelated to billing placement.
