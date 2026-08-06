# Help URL Redirect Audit

Generated: 2026-08-04

Scope:

- Read-only scan of `content/docs/**`.
- HTTP checks against official `https://docs.agora.io` URLs only.
- No content or business-code changes.

## Method

- Local old-link scan:
  - `rg -n -F "docs.agora.io/en/help/" content/docs`
- HTTP header checks:
  - `curl -sS -D - -o /dev/null --max-redirs 0 <url>`

`--max-redirs 0` was used so the response status and `Location` header, if any, reflect the URL being checked directly.

## URL Results

| Checked URL | HTTP status | Location | Local migrated/equivalent page | Equivalent page status | Redirect judgment |
| --- | ---: | --- | --- | ---: | --- |
| `https://docs.agora.io/en/help/integration-issues/system_volume` | 404 | none | `https://docs.agora.io/en/api-reference/faq/integration/system_volume` (`content/docs/en/api-reference/faq/integration/system_volume.mdx`) | 200 | Missing 301 redirect. The old help URL is broken while the equivalent migrated FAQ page exists and serves successfully. |
| `https://docs.agora.io/en/api-reference/faq/quality/ios_bluetooth` | 200 | none | `content/docs/en/api-reference/faq/quality/ios_bluetooth.mdx` | 200 | No missing 301 redirect for this checked URL. It is already a current serving page, not a broken legacy help URL. |
| `https://docs.agora.io/en/help/integration-issues/recording_mode` | 404 | none | `https://docs.agora.io/en/api-reference/faq/integration/recording_mode` (`content/docs/en/api-reference/faq/integration/recording_mode.mdx`) | 200 | Missing 301 redirect. This old help URL is still present in local docs content and currently breaks. |

## Header Evidence

### `system_volume` legacy help URL

Source: `https://docs.agora.io/en/help/integration-issues/system_volume`

- Request observed: 2026-08-04, HTTP `Date: Tue, 04 Aug 2026 08:34:30 GMT`
- Status: `HTTP/2 404`
- `Location`: none
- 404 evidence headers:
  - `content-disposition: inline; filename="404.html"`
  - `x-vercel-cache: HIT`

### `system_volume` migrated FAQ URL

Source: `https://docs.agora.io/en/api-reference/faq/integration/system_volume`

- Request observed: 2026-08-04, HTTP `Date: Tue, 04 Aug 2026 08:35:35 GMT`
- Status: `HTTP/2 200`
- `Location`: none
- Serving evidence headers:
  - `content-disposition: inline; filename="system_volume"`
  - `last-modified: Mon, 03 Aug 2026 06:13:32 GMT`

Local source: `content/docs/en/api-reference/faq/integration/system_volume.mdx`

- Frontmatter title: `What is the difference between the in-call volume and the media volume?`
- This title matches the legacy `system_volume` topic.

### `ios_bluetooth` checked URL

Source: `https://docs.agora.io/en/api-reference/faq/quality/ios_bluetooth`

- Request observed: 2026-08-04, HTTP `Date: Tue, 04 Aug 2026 08:34:30 GMT`
- Status: `HTTP/2 200`
- `Location`: none
- Serving evidence headers:
  - `content-disposition: inline; filename="ios_bluetooth"`
  - `last-modified: Mon, 03 Aug 2026 07:10:17 GMT`

Local source: `content/docs/en/api-reference/faq/quality/ios_bluetooth.mdx`

- Frontmatter title: `Why can't I answer calls through a Bluetooth device after connecting it to an iOS or Android device?`
- This confirms the checked URL corresponds to an existing current FAQ page.

### `recording_mode` legacy help URL

Source: `https://docs.agora.io/en/help/integration-issues/recording_mode`

- Request observed: 2026-08-04, HTTP `Date: Tue, 04 Aug 2026 08:35:15 GMT`
- Status: `HTTP/2 404`
- `Location`: none
- 404 evidence headers:
  - `content-disposition: inline; filename="404.html"`
  - `x-vercel-cache: HIT`

### `recording_mode` migrated FAQ URL

Source: `https://docs.agora.io/en/api-reference/faq/integration/recording_mode`

- Request observed: 2026-08-04, HTTP `Date: Tue, 04 Aug 2026 08:35:53 GMT`
- Status: `HTTP/2 200`
- `Location`: none
- Serving evidence headers:
  - `content-disposition: inline; filename="recording_mode"`
  - `last-modified: Mon, 03 Aug 2026 10:58:45 GMT`

Local source: `content/docs/en/api-reference/faq/integration/recording_mode.mdx`

- Frontmatter title: `What's the difference between individual recording mode and composite recording mode?`
- This title matches the anchor text of the remaining local old help links.

## Local Old Help Links

The local scan found 4 occurrences of `docs.agora.io/en/help/...` under `content/docs/**`; all point to `recording_mode`:

| File | Line | URL |
| --- | ---: | --- |
| `content/docs/en/realtime-media/on-premise-recording/build/record-audio-and-video/composite-mode.mdx` | 13 | `https://docs.agora.io/en/help/integration-issues/recording_mode` |
| `content/docs/en/realtime-media/on-premise-recording/build/record-audio-and-video/composite-mode.mdx` | 99 | `https://docs.agora.io/en/help/integration-issues/recording_mode` |
| `content/docs/en/realtime-media/on-premise-recording/build/record-audio-and-video/individual-mode.mdx` | 13 | `https://docs.agora.io/en/help/integration-issues/recording_mode` |
| `content/docs/en/realtime-media/on-premise-recording/build/record-audio-and-video/individual-mode.mdx` | 110 | `https://docs.agora.io/en/help/integration-issues/recording_mode` |

No `content/docs/**` occurrence of `https://docs.agora.io/en/help/integration-issues/system_volume` was found in this scan.

## Recommended Redirect Entries

High-confidence 301 candidates:

| Legacy URL | Target URL | Reason |
| --- | --- | --- |
| `/en/help/integration-issues/system_volume` | `/en/api-reference/faq/integration/system_volume` | Legacy URL returns 404; migrated FAQ page exists, returns 200, and has matching title/topic. |
| `/en/help/integration-issues/recording_mode` | `/en/api-reference/faq/integration/recording_mode` | Legacy URL returns 404; migrated FAQ page exists, returns 200, and active local docs still link to the legacy URL. |

No 301 redirect is needed for `/en/api-reference/faq/quality/ios_bluetooth` based on this check because it already returns 200 directly.
