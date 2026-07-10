# CN legacy link breakage summary

Date: 2026-07-09

## Scope

This report records the legacy Chinese documentation links investigated during
the CN-NEWDOC link cleanup. The primary symptom was that migrated docs still
linked to legacy `/api-ref/*`, `/doc/*`, or `doc.shengwang.cn` URLs, causing
users to leave the new documentation portal or hit unmapped legacy routes.

## Fixed migrated-content mappings

The following content had already been migrated into `content/docs/zh-CN`, but
source pages still pointed at old API paths. These links were rewritten to the
current new-site routes.

| Legacy link family | New target | Reason |
| --- | --- | --- |
| `/api-ref/online-ktv/{android,ios}/ktvapi` | `/zh-CN/solutions/online-ktv/ktv-scenario/reference/ktv-api` | Online KTV KTV API was migrated into the solution reference page, not an `api-reference/online-ktv` page. |
| `/api-ref/one-to-one-live/android/call-api` | `/zh-CN/api-reference/private-room/android` | The old 1v1 Live CallAPI reference is now classified under Private Room API Reference. |
| `/api-ref/one-to-one-live/ios/call-api` | `/zh-CN/api-reference/private-room/ios` | The old 1v1 Live CallAPI reference is now classified under Private Room API Reference. |
| `/api-ref/iot-apaas/android/overview` | `/zh-CN/api-reference/iot-apaas/client-api/full` | IoT aPaaS client full API exists in the new API reference tree; the old Android overview route had no direct page. |
| `/api-ref/iot-apaas/{android,ios,wechat}/client-api/call` | `/zh-CN/api-reference/iot-apaas/client-api/call` | Platform variants were merged into one platform-structured client API page. |
| `/api-ref/iot-apaas/ios/client-api/full` | `/zh-CN/api-reference/iot-apaas/client-api/full` | Platform variants were merged into one platform-structured client API page. |
| `/api-ref/iot-apaas//device-sdk/call/config` | `/zh-CN/api-reference/iot-apaas/device-sdk/call/config` | The old link contained a double slash and now maps to the migrated Device SDK call config page. |
| `/api-ref/iot-apaas//device-sdk/full/config` | `/zh-CN/api-reference/iot-apaas/device-sdk/full/config` | The old link contained a double slash and now maps to the migrated Device SDK full config page. |
| `/api-ref/teleoperation/iot/api/device` | `/zh-CN/solutions/teleoperation/reference/device` | Teleoperation device API was migrated into the solution reference page, not an API Reference product folder. |

After the rewrite, this command returns no matches:

```bash
rg -n "/api-ref/online-ktv|/api-ref/teleoperation|/api-ref/one-to-one-live|/api-ref/iot-apaas" content/docs/zh-CN
```

## Not migrated in this pass

The following broken-link families are not ordinary MDX migration misses. They
come from generated HTML API references in the legacy source and need a separate
HTML API migration lane or owner decision.

| Link family | Legacy source | Current status | Reason |
| --- | --- | --- | --- |
| `/api-ref/rtc/javascript/*` | `shengwang-doc-source/html-docs/rtc/Web/**` | Not migrated in this pass | The old Web SDK API pages are TypeDoc-generated HTML. There is no `docs-api-reference/rtc/javascript/*.mdx` source to move with `scripts/migrate-legacy-docs.mjs`. |
| `/api-ref/rtsa/c/*` and `/api-ref/rtsa/java/*` | `shengwang-doc-source/html-docs/rtsa/{c,java}/**` | Not migrated in this pass | RTSA C/Java API references are generated HTML. Current new content contains product docs and only `api-reference/rtsa/test.mdx`. |
| `/api-ref/rtc-server-sdk/cpp/*` and `/api-ref/rtc-server-sdk/java/*` | `shengwang-doc-source/html-docs/rtc-server-sdk/{cpp,java}/**` | Not migrated in this pass | Server SDK C++/Java API references are generated HTML. Current new API reference contains Go/Python pages only. |
| `/api-ref/iot-apaas/android/*` generated class/interface pages | `shengwang-doc-source/html-docs/iot-apaas/android/**` | Not migrated in this pass | The MDX API pages were migrated, but generated Android SDK HTML pages remain deferred. |

These items are intentionally excluded from this PR because the user requested
that non-migrated content be moved only when it is not original HTML. The
remaining items require generated HTML to MDX conversion and `meta.json`
reconstruction rather than simple link mapping.

## Remaining global legacy-link causes

A broader scan still finds legacy links outside this focused set. Major causes:

| Category | Example source | Cause |
| --- | --- | --- |
| RTC Web API references | `/api-ref/rtc/javascript/interfaces/iagorartcclient.html#join` | Generated TypeDoc HTML API not yet migrated. |
| RTSA API references | `/api-ref/rtsa/c/agora__rtc__api_8h#agora_err_code_e` | Generated Doxygen HTML API not yet migrated. |
| Server SDK C++/Java references | `/api-ref/rtc-server-sdk/cpp/...`, `/api-ref/rtc-server-sdk/java/...` | Generated Doxygen/JavaDoc HTML API not yet migrated. |
| REST operation links | `/doc/*/restful/*/operations/*` | Some OpenAPI operation routes are not mapped one-to-one to new API Reference routes. |
| Product docs still on old IA | `/doc/whiteboard/*`, `/doc/analytics/*`, `/doc/online-ktv/*` | Existing pages need product-specific mapping or content-owner confirmation. |

## Verification

- Confirmed no residual `online-ktv`, `one-to-one-live`, `iot-apaas`, or
  `teleoperation` legacy API links remain in `content/docs/zh-CN`.
- Confirmed all rewritten target files exist.
- `git diff --check` passed.
- `bun run types:check` passed.
