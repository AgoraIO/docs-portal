# CN Hotfix Migration Checkpoint

Last updated: 2026-10-28

## Latest handoff (2026-10-28)

- Target branch: `codex/cn-newdoc-html-api-migration`.
- Last confirmed merged incremental batch: [#1291](https://github.com/AgoraIO/docs-portal/pull/1291), squash merge `6b9a602e83a9a1bcd112c0856fe77e32aa7ff369` on 2026-10-26.
- Effective source baseline: `427a27358efd3f2eeb1b9dc6e841e828b9a53366` (0.0.535).
- Current pending batch: [`cn-master-sync-20261028.json`](./cn-master-sync-20261028.json), source `427a27358..72dd878e3` (Whiteboard/Fastboard #2121, historical API entries #2131, releases 0.0.536/0.0.537), initial fixed target `3bb8afbf2a2b5dff6ec52ba39f6fd7fb7b95ba9e`; subsequently integrated target #1313 at `d3baceb3717b8cf0491ae87e2fcaf04a7caf81b1`.
- Pending PR: [#1338](https://github.com/AgoraIO/docs-portal/pull/1338), working branch `codex/cn-whiteboard-hotfix-20261028`. The JSON checkpoint records final verification state; do not treat the pending source head as effective until that PR merges.
- All 1270 source files and four source commits are recorded in [`cn-master-sync-20261028-ledger.json`](./cn-master-sync-20261028-ledger.json). Image upload and source-issue follow-ups remain explicit.
- The two earlier AI deferrals were restored by target #1324 with hidden navigation entries. Their present-but-hidden state has been checked and preserved; they are not missing public guides in this batch.

After the pending batch merges, the next source comparison may start at `72dd878e3703f154f26d9fb1bf5274b465a6c2cb`, carrying its image-host and source-consistency follow-ups.

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
