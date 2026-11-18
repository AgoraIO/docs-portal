# Chinese Solutions Legacy Name Audit

Date: 2026-07-23

Scope: user-facing product, solution, and solution-variant names under `content/docs/zh-CN/solutions`. This audit compares the migrated Fumadocs labels with the legacy Chinese docs site's source of truth. Route segments such as `sdk`, `uikit`, and `rtm` are identifiers and are not treated as display names.

## Sources

- Current site: `content/docs/zh-CN/solutions/**/meta.json`, solution landing-page frontmatter, and `content/docs/zh-CN/solutions/overview.mdx`.
- Legacy product and solution selectors:
  - `/Users/yangyixuan/Documents/GitHub/shengwang-doc-source/data/product.ts`
  - `/Users/yangyixuan/Documents/GitHub/shengwang-doc-source/data/homepage.ts`
  - `/Users/yangyixuan/Documents/GitHub/shengwang-doc-source/docs/_products_.meta.js`
- Legacy solution variants: `/Users/yangyixuan/Documents/GitHub/shengwang-doc-source/docs/**/_usecase_.meta.js`.
- Legacy landing pages and product overviews were used to resolve selector/homepage conflicts.

## Summary

- One active product name was confirmed changed and has been restored in this branch: `VoIP 通话` to `微呼叫`.
- Five active solution-variant names were confirmed changed and have been restored in this branch: two under 1v1 and three under online KTV.
- Two hidden product names and three hidden multi-usecase variant names are also confirmed changed. These pages are excluded from the sidebar with `!`, but remain available by direct URL.
- `智能云会议引擎` versus `灵动会议` is ambiguous because both names existed on different legacy surfaces.
- `会议协作` and `服务状态与运维` reflect IA reorganization, not simple product renaming.

## Confirmed Active Differences Fixed

| Migrated display name | Restored legacy name | Affected current-site files | Legacy evidence | Assessment |
| --- | --- | --- | --- | --- |
| `VoIP 通话` | `微呼叫` | `solutions/voip-call/meta.json:2`; `solutions/overview.mdx:136`; `solutions/voip-call/index.mdx:2` | `data/product.ts:81`; `docs/_products_.meta.js:139`; `docs/voip-callkit/landing-page.mdx:20` | Restored across the solution navigation, overview card, landing page, related page metadata, and API-reference backlink. |
| `信令` | `场景化 API（默认 RTM）` | `solutions/one-to-one-live/rtm/meta.json:2`; `solutions/one-to-one-live/rtm/index.mdx:2` | `docs/one-to-one-live/_usecase_.meta.js:3` | Restored in navigation and landing-page metadata. |
| `自定义信令` | `场景化 API（自定义信令）` | `solutions/one-to-one-live/custom-signaling/meta.json:2`; `solutions/one-to-one-live/custom-signaling/index.mdx:2` | `docs/one-to-one-live/_usecase_.meta.js:7` | Restored in navigation and landing-page metadata. |
| `K 歌场景化方案` | `场景化 API 方案` | `solutions/online-ktv/ktv-scenario/meta.json:2`; `solutions/online-ktv/ktv-scenario/index.mdx:2` | `docs/online-ktv/_usecase_.meta.js:3` | Restored across the online KTV landing page and variant documentation metadata. |
| `在线 K 歌 SDK` | `PaaS 方案` | `solutions/online-ktv/online-ktv-sdk/meta.json:2`; `solutions/online-ktv/online-ktv-sdk/index.mdx:2` | `docs/online-ktv/_usecase_.meta.js:7` | Restored across the online KTV landing page and variant documentation metadata. |
| `AUIKit K 歌` | `UIKit 开源方案` | `solutions/online-ktv/auikaraoke/meta.json:2`; `solutions/online-ktv/auikaraoke/index.mdx:2` | `docs/online-ktv/_usecase_.meta.js:11` | Restored across the online KTV landing page and variant documentation metadata. |

The already corrected chatroom variants now match the legacy selector: `PaaS 方案` and `UIKit 开源方案`.

## Hidden But Directly Accessible Differences

| Current display name | Legacy display name | Current evidence | Legacy evidence | Assessment |
| --- | --- | --- | --- | --- |
| `元语聊` | `MetaWorld` | `solutions/meta-world/meta.json:2`; `solutions/meta-world/index.mdx:2` | `data/product.ts:202`; `docs/meta-world/landing-page.mdx:20` | Confirmed rename. In the legacy docs, `元语聊` is one scenario within the `MetaWorld` solution, not the solution name. |
| `物联网 aPaaS` | `灵隼物联网云平台` | `solutions/iot-apaas/meta.json:2`; `solutions/iot-apaas/index.mdx:2` | `data/product.ts:179`; `docs/iot-apaas/_homepage_.mdx:2` | Confirmed rename. The migrated landing body still uses `灵隼物联网云平台`. |
| `UI 方案` | `含 UI 集成方案` | `solutions/multi-usecase/ui-solution/meta.json:2`; `solutions/multi-usecase/ui-solution/index.mdx:2` | `docs/multi-usecase/_usecase_.meta.js:3` | Confirmed solution-variant rename. |
| `场景化方案` | `场景化 API 方案` | `solutions/multi-usecase/scenario-based/meta.json:2`; `solutions/multi-usecase/scenario-based/index.mdx:2` | `docs/multi-usecase/_usecase_.meta.js:7` | Confirmed solution-variant rename. |
| `非场景化方案` | `非场景化 API 方案` | `solutions/multi-usecase/non-scenario-based/meta.json:2`; `solutions/multi-usecase/non-scenario-based/index.mdx:2` | `docs/multi-usecase/_usecase_.meta.js:11` | Confirmed solution-variant rename. |

`meta-world`, `multi-usecase`, and `iot-apaas` are excluded from the current solution sidebar by `!` entries in `solutions/meta.json`, so these differences do not affect the default navigation today.

## Ambiguous Names

| Current display name | Legacy evidence | Assessment |
| --- | --- | --- |
| `智能云会议引擎` | The legacy homepage uses `智能云会议引擎` (`data/homepage.ts:225`), while the product selector and landing content use `灵动会议` (`data/product.ts:172`; `docs/meeting/landing-page.mdx:17`). | Not a confirmed migration error. Keep the current homepage-style name unless the intended contract is specifically to mirror the legacy product selector and product body. |
| `多场景` | The legacy `_products_.meta.js` only has a commented `多场景/方案` entry; the live legacy surface exposes variant labels rather than a stable root product name. | Root name requires a product decision. The three child variant differences above are independently confirmed. |
| `Status Page` / `健康看板` | Legacy homepage and product selector use `Status Page`; legacy search and body content use `健康看板`. | Current root `Status Page` and landing title `健康看板概览` preserve the same two-surface distinction and are not treated as a rename bug. |
| `灵动课堂` / `灵动课堂（Legacy）` | Legacy product selector and docs use `灵动课堂`; only the homepage Legacy section adds `（Legacy）`. | Product name is consistent. Adding the lifecycle suffix is a visibility/status decision, not a name restoration. |

## IA Differences

- Current `会议协作` corresponds most closely to the legacy `低代码应用平台`, where the meeting product was listed.
- Current `服务状态与运维` has no direct legacy solution group equivalent; the legacy site placed `Status Page` under `实时互动扩展能力`.
- These are confirmed classification changes. Renaming either heading without also reviewing membership would misrepresent an IA change as a terminology-only fix.

## Confirmed Consistent Product Names

The following active solution roots match the legacy product/solution selector after the fixes already made in this branch:

| Name | Name | Name |
| --- | --- | --- |
| 秀场直播 | 游戏语音 | 在线 K 歌房 |
| 声动语聊 | 1v1 私密房 | 灵动课堂 |
| 教育信息化 | 一对一互动教学 | 一对 N 小班课 |
| 超级小班课 | 在线美术教学 | 在线音乐教学 |
| PPT 转码服务 | 平行操控 | 智能摄像头 |
| 智能门铃 | 智能手表 | Status Page |

## Recommended Change Boundary

The confirmed active differences were restored in user-facing navigation, landing pages, related page metadata, and solution comparison copy. All route segments, page order, IA membership, and technical identifiers were preserved. Hidden products and ambiguous names still require an explicit visibility/product decision.
