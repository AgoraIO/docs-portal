# CN Hotfix Migration Checkpoint

Last updated: 2026-08-04

This file records the handoff checkpoint for incremental Chinese documentation
hotfixes from `AgoraIO/shengwang-doc-source` to the `CN-NEWDOC` branch in
`AgoraIO/docs-portal`.

## Current Checkpoint

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
