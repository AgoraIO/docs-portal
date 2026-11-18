# Commented Sidebar Docs Audit

Date: 2026-07-17

Scope: Chinese docs migrated into `content/docs/zh-CN`. This audit checks legacy `shengwang-doc-source` sidebar metadata for doc IDs that are only present in commented-out sidebar entries, then verifies whether their migrated counterparts are still visible in the new docs portal.

## Method

- Scanned legacy sidebar files under `/Users/yangyixuan/Documents/GitHub/shengwang-doc-source/docs/**/_sidebar*.meta*.js`.
- Extracted `id: "..."` entries from commented and active lines, replacing `{{platform}}` with the sidebar platform.
- Matched legacy `/doc/{id}.html` URLs against `docs/migration/path-map.csv`.
- Treated an item as an issue only when the ID had commented legacy sidebar entries and no active legacy sidebar entry.
- For multi-platform migrated pages, removed only the platform block that came from a commented legacy entry.

## Confirmed Issues Fixed

| Legacy ID | Legacy evidence | New docs state before fix | Fix |
| --- | --- | --- | --- |
| `rtc/react/overview/browser-compatibility` | `docs/rtc/_sidebar_.meta.react.js:39` | React platform tab existed in `realtime-media/rtc/reference/browser-compatibility.mdx` | Removed the React platform block earlier in this branch. |
| `rtc/electron/best-practice/after-migrate` | `docs/rtc/_sidebar_.meta.electron.js:286` | Electron platform block existed in `realtime-media/rtc/reference/after-migrate.mdx` | Removed only the Electron platform block. |
| `rtc/electron/best-practice/reduce-app-size` | `docs/rtc/_sidebar_.meta.electron.js:291` | Electron platform block existed in `realtime-media/rtc/build/optimize-and-operate/reduce-app-size.mdx` | Removed only the Electron platform block. |

## Already Compliant

| Legacy ID | Reason |
| --- | --- |
| `rtc/rn/get-started/quick-start-expo` | New docs already hide the page as `!quick-start-expo` in `realtime-media/rtc/get-started/meta.json`. |
| `rtc/rn/best-practice/after-migrate` | New migrated `after-migrate.mdx` does not contain an RN platform block. |

## Not Treated As Hidden

Some IDs appear in both active and commented legacy sidebar areas. These are duplicate/sidebar-reorganization cases, not confirmed hidden-doc cases, so this audit did not hide them:

- `marketplace/{android,ios,flutter}/integrate-extensions/faceunity-ar`
- `marketplace/{android,ios}/integrate-extensions/sensetime-ar`
- `marketplace/{android,ios,javascript,windows}/integrate-extensions/iflytek-asr`
- `marketplace/javascript/integrate-extensions/netease-yidun-video-moderation`
- `meeting/restful/webhook/webhook-events`

If product wants any of these removed from the new IA, they should be handled as explicit IA decisions rather than inferred from commented duplicate sidebar blocks.
