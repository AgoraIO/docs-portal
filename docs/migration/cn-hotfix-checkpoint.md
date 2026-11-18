# CN Hotfix Migration Checkpoint

Last updated: 2026-11-17

## Current batch (2026-11-17; implemented, pending target merge)

- Target branch: `codex/cn-newdoc-html-api-migration@472e0250ff2c4a61bf7a0f10a472628192b33f31`, using the explicitly requested current local HEAD. Managed worktree branch: `codex/cn-master-hotfix-20261117`. Target draft PR: [#1443](https://github.com/AgoraIO/docs-portal/pull/1443); target merge and deployment remain pending.
- Previous [#1434](https://github.com/AgoraIO/docs-portal/pull/1434) is confirmed merged at `2026-11-16T07:45:02Z` as `9e6f1a68baf96b8517e43d4e9ab4aad7aaa69001`, contained in the selected target. Effective source baseline: `8fd46d74070a18dcb46ef943f6d6768590be9bca` (0.0.544).
- Fixed endpoint: `b9aa4166a265ad2693ced2ce36ea4a7d5e21e826` (0.0.546). Eight first-parent commits, six content PRs (#2147/#2157/#2152/#2153/#2148/#2159), 153 net changed files: 89 migrated, 1 already present, 63 explicitly excluded.
- Implementation, independent agent reviews, tests/types/source/table gates and Chinese production build completed. Full scoped results and remaining boundaries: [report](./cn-master-sync-20261117.md), [batch JSON](./cn-master-sync-20261117.json), [all-source ledger](./cn-master-sync-20261117-ledger.json). Lint remains identical to its existing baseline; static link flags are individually classified, not a clean full-repository strict pass.
- Do not advance the effective baseline to 0.0.546 until actual target merge. Retain the previous long OpenAPI-example toolbar deferral, asset uploads, source date/link/semantic follow-ups, the external archive-title finding and historical manual ownership metadata debt. Four new source-matching RTM diagrams retain local assets because CDN objects are absent. No production acceptance is implied.

## Previous handoff (2026-11-16; merged 2026-11-16)

The following bullets preserve the implementation-time snapshot. The actual merge is confirmed above; 0.0.544 is now effective. A merge does not establish deployment.

- Target branch: `codex/cn-newdoc-html-api-migration`, fixed at `a02a0f9ce230d4be857ecfc8384a69669b40bfc0` for this increment. Working branch: `codex/cn-master-hotfix-20261116`.
- Previous batch [#1407](https://github.com/AgoraIO/docs-portal/pull/1407) is confirmed merged on 2026-11-10 at `bc846d6069704872f168b95494b8534b7e9129bd` (GitHub `mergedAt`: `2026-11-10T08:48:11Z`). Its source head `b5f0771fd840b2e6c45b28357c206bbe94129767` (0.0.542) is the effective comparison baseline.
- Fixed source endpoint: `8fd46d74070a18dcb46ef943f6d6768590be9bca` (0.0.544). Reviewed 7 first-parent commits, 3 content PRs and 28 net changed files: #2146 already covered by target #1398/#1406; #2142 and #2155 supplemented in this batch.
- Target PR: [#1434](https://github.com/AgoraIO/docs-portal/pull/1434), draft pending review. This batch is implemented and independently reviewed, pending target merge; it is not deployed. Do not advance the effective source baseline until its actual target merge. Full PR list and exclusions: [`cn-master-sync-20261116.md`](./cn-master-sync-20261116.md); machine record: [`cn-master-sync-20261116.json`](./cn-master-sync-20261116.json); all source-file receipts: [`cn-master-sync-20261116-ledger.json`](./cn-master-sync-20261116-ledger.json).
- Independent development-preview reading found one unresolved P2: selecting the new long ConvoAI request-example summary clips the mobile code toolbar. The user explicitly deferred this shared-layout repair to a separate batch on 2026-11-16. Preserve the source text; track `P2-openapi-long-example-toolbar` in the batch JSON / #1434. No clean mobile or release acceptance is claimed.
- Carry forward the previous image-host uploads, HarmonyOS source-date discrepancy, historical FastLogger link and source semantic follow-ups. RTM's existing local assets remain under the prior user decision. No upload, content-owner acceptance or production release is implied.

## Previous handoff (2026-11-10; merged 2026-11-10)

The following bullets preserve the implementation-time snapshot. The actual merge is now confirmed above; 0.0.542 is effective, while no deployment is established by that merge.

- Target branch: `codex/cn-newdoc-html-api-migration`, fixed at `86876707fc1865cfee4e447e2b2c183c650f8b00` for this increment.
- Previous batch [#1338](https://github.com/AgoraIO/docs-portal/pull/1338) was confirmed merged on 2026-10-30 at `3110fcacf2ccb5ad5ce55743109f428506496637`. Its source head `72dd878e3703f154f26d9fb1bf5274b465a6c2cb` (0.0.537) is now the effective comparison baseline.
- This batch compares that source head with fixed source `b5f0771fd840b2e6c45b28357c206bbe94129767` (0.0.542): 18 first-parent commits, 13 content PRs, 569 net changed source files.
- Target PR: [#1407](https://github.com/AgoraIO/docs-portal/pull/1407), draft pending review. Implementation commit: `4b1691717d2818900d7feea0f2c71cb8daf01e40`. Working branch: `codex/cn-master-hotfix-20261110`. Machine record: [`cn-master-sync-20261110.json`](./cn-master-sync-20261110.json). Per-source decisions: [`cn-master-sync-20261110-ledger.json`](./cn-master-sync-20261110-ledger.json).
- The new source head is **pending target merge**, not an effective source baseline or evidence of deployment. Continue from 0.0.537 until the new target PR actually merges; after that merge the next comparison starts after the fixed 0.0.542 head.
- Preserve existing target-only work and hidden/retired navigation decisions. Carry forward the previous batch's dynamic configuration image upload, HarmonyOS 0.2.11 date discrepancy, and historical FastLogger link follow-ups; the new batch does not implicitly resolve them.

## Previous handoff (2026-10-28; merged 2026-10-30)

- Target branch: `codex/cn-newdoc-html-api-migration`.
- Last confirmed merged incremental batch: [#1291](https://github.com/AgoraIO/docs-portal/pull/1291), squash merge `6b9a602e83a9a1bcd112c0856fe77e32aa7ff369` on 2026-10-26.
- Effective source baseline: `427a27358efd3f2eeb1b9dc6e841e828b9a53366` (0.0.535).
- Completed batch: [`cn-master-sync-20261028.json`](./cn-master-sync-20261028.json), source `427a27358..72dd878e3` (Whiteboard/Fastboard #2121, historical API entries #2131, releases 0.0.536/0.0.537), initial fixed target `3bb8afbf2a2b5dff6ec52ba39f6fd7fb7b95ba9e`; subsequently integrated target #1313 at `d3baceb3717b8cf0491ae87e2fcaf04a7caf81b1`.
- Merged PR: [#1338](https://github.com/AgoraIO/docs-portal/pull/1338), working branch `codex/cn-whiteboard-hotfix-20261028`. Merged 2026-10-30 as `3110fcacf2ccb5ad5ce55743109f428506496637`; the old batch JSON retains its implementation-time verification snapshot.
- 2026-10-29 follow-up: user chose a compact HarmonyOS sidebar based on actual public exports after confirming the old site incorrectly reused Android links. All 92 API bodies are retained. Target #1326/#1334 through `837c5f58f` is integrated; current checks and earlier production-build evidence are separately scoped in the batch JSON.
- Additional 2026-10-29 cross-product sidebar review: [report](../agents/reports/2026-10-29-cn-api-sidebar-parity.md) covers 50 dedicated API entries plus the current catalog classification. It corrects 32 navigation configurations without changing MDX bodies or advancing the source baseline.
- All 1270 source files and four source commits are recorded in [`cn-master-sync-20261028-ledger.json`](./cn-master-sync-20261028-ledger.json). Image upload and source-issue follow-ups remain explicit.
- The two earlier AI deferrals were restored by target #1324 with hidden navigation entries. Their present-but-hidden state has been checked and preserved; they are not missing public guides in this batch.

The 2026-11-10 batch above starts at `72dd878e3703f154f26d9fb1bf5274b465a6c2cb`, carrying its image-host and source-consistency follow-ups.

## Previous handoff (2026-10-23; superseded)

- Target branch: `codex/cn-newdoc-html-api-migration`.
- Last confirmed merged incremental batch: [#1198](https://github.com/AgoraIO/docs-portal/pull/1198), merge `82d1138723ad805c7032a19880ada68b3c27e652`.
- Effective source baseline from that batch: `5ff6834d544e9c647252540da97c574b2aeeef56`.
- Pending batch: [`cn-master-sync-20261023.json`](./cn-master-sync-20261023.json), source range `5ff6834d5..427a27358`, target base `be9871602d5e5a6bd89b1b18944dae975e57259b`.
- PR: [#1291](https://github.com/AgoraIO/docs-portal/pull/1291), branch `codex/cn-master-hotfix-20261023`, subsequently merged on 2026-10-26 as `6b9a602e8`; its confirmed effective baseline is recorded above. A merge does not establish deployment completion.
- Full per-source decisions and target hashes are in [`cn-master-sync-20261023-ledger.json`](./cn-master-sync-20261023-ledger.json). Two unpublished AI guides remain explicitly deferred; carry them forward even after the pending batch merges.

Before the next increment, confirm that the pending branch has merged. Only then use its fixed source head `427a27358efd3f2eeb1b9dc6e841e828b9a53366` as the new comparison start, while retaining its deferred items. Do not use the older `5d03551cf` source baseline, historical `99e7f81b4` target base, or the August checkpoint below for this branch.

## Historical handoff (2026-08-04)

This file records the handoff checkpoint for incremental Chinese documentation
hotfixes from `AgoraIO/shengwang-doc-source` to the `CN-NEWDOC` branch in
`AgoraIO/docs-portal`.

## August Checkpoint

| Field | Value |
| --- | --- |
| Source repository | `AgoraIO/shengwang-doc-source` |
| Last migrated source PR | [#2061](https://github.com/AgoraIO/shengwang-doc-source/pull/2061) |
| Source PR cutoff merged at | `2026-08-03T08:55:38Z` |
| Last migrated source merge commit | `f180f4676c5d514a8abee21748fdf637ba67d4f7` |
| Source history reviewed through | `474985f901fffffd4ffed27ed35a060f986bdb98` (`Release 0.0.506`; only `data/version.ts`, excluded) |
| Target base used for this batch | `AgoraIO/docs-portal` `CN-NEWDOC` at `4d40e7989180ac4c6b523d34e5be211ade8149a8` |
| Target hotfix PR | [AgoraIO/docs-portal#940](https://github.com/AgoraIO/docs-portal/pull/940) |
| Target migration commits | `0980aa851273c84ed9d5e2f4b438ce391acb57b6` (initial hotfixes); `237a2dc6b78426f787fabd58cf91a0e11c2d2f54` (content-audit hotfixes) |
| Checkpoint status | Effective after target PR #940 merges into `CN-NEWDOC` |

The next hotfix PR audit starts after merged timestamp
`2026-08-03T08:55:38Z`. The source commit audit starts after
`474985f901fffffd4ffed27ed35a060f986bdb98`. PR number `#2062` is only a
discovery hint, not the checkpoint: an older-numbered PR can merge late, as
happened with #2006 in this batch.

## 2026-08-03 Batch

Migrated after confirming the content was absent from `CN-NEWDOC`:

- [#2006](https://github.com/AgoraIO/shengwang-doc-source/pull/2006)
- [#2028](https://github.com/AgoraIO/shengwang-doc-source/pull/2028) through
  [#2031](https://github.com/AgoraIO/shengwang-doc-source/pull/2031)
- [#2033](https://github.com/AgoraIO/shengwang-doc-source/pull/2033) through
  [#2049](https://github.com/AgoraIO/shengwang-doc-source/pull/2049)
- [#2052](https://github.com/AgoraIO/shengwang-doc-source/pull/2052) through
  [#2054](https://github.com/AgoraIO/shengwang-doc-source/pull/2054)
- [#2057](https://github.com/AgoraIO/shengwang-doc-source/pull/2057)
- [#2058](https://github.com/AgoraIO/shengwang-doc-source/pull/2058)
- [#2061](https://github.com/AgoraIO/shengwang-doc-source/pull/2061)

Checked and not migrated:

| Source PR | Decision |
| --- | --- |
| [#2032](https://github.com/AgoraIO/shengwang-doc-source/pull/2032) | Already present in `CN-NEWDOC`: the `getPlaybackDevices` API page already contains the Safari 18.4 and iOS Safari 26 support note. |

PRs #2052, #2053, #2054, and #2057 were initially excluded based on the
assumption that the content-audit work had already reached the target. A
second comparison against `CN-NEWDOC` plus target PR #940 confirmed the exact
changes were absent, so they were migrated in target commit `237a2dc6b`.

Source-only generated release artifacts and agent knowledge-base metadata were
also excluded. This includes direct commit
`474985f901fffffd4ffed27ed35a060f986bdb98` (`Release 0.0.506`), which only
updates `data/version.ts`. These are not pending migration items.

## Starting the Next Batch

1. Confirm [docs-portal#940](https://github.com/AgoraIO/docs-portal/pull/940)
   has merged into `CN-NEWDOC`. If it has not merged, use the PR branch as the
   target baseline or wait; do not treat this checkpoint as published.
2. Fetch `origin/master` in `shengwang-doc-source` and the latest
   `origin/CN-NEWDOC` in `docs-portal`.
3. Enumerate all source PRs with `mergedAt` strictly later than
   `2026-08-03T08:55:38Z`. Do not filter only on PR number.
4. Cross-check first-parent source commits after
   `474985f901fffffd4ffed27ed35a060f986bdb98`. This commit is the last source
   history entry already reviewed, including excluded direct commits.
5. For every candidate, verify the exact target content is absent before
   migrating it. Record already-present, out-of-scope, and migrated decisions.
6. After the next target PR merges, replace the current checkpoint with the
   latest included source merge commit and merged timestamp, then append the
   completed batch to this file.

List merged PR candidates:

```bash
gh pr list \
  --repo AgoraIO/shengwang-doc-source \
  --state merged \
  --limit 500 \
  --json number,title,mergedAt,mergeCommit,url \
  --jq 'map(select(.mergedAt > "2026-08-03T08:55:38Z")) | sort_by(.mergedAt)[] | [.number, .mergedAt, .mergeCommit.oid, .title] | @tsv'
```

Cross-check source ancestry:

```bash
git -C /Users/yangyixuan/Documents/GitHub/shengwang-doc-source fetch origin master
git -C /Users/yangyixuan/Documents/GitHub/shengwang-doc-source log \
  --first-parent \
  --reverse \
  --format='%H %cI %s' \
  474985f901fffffd4ffed27ed35a060f986bdb98..origin/master
```
