# English high-traffic 404 review

This review records the top 50 English URLs identified from the PostHog
page-view ranking for the 28-day window ending September 28, 2026. The original
production URLs were checked with GET requests on September 28, 2026. Internal
redirect targets were checked against the current local docs build; external
destinations were checked directly.

All 50 URLs receive exact Vercel 301 rules. The two IoT paths at ranks 23 and
35 no longer have source pages or section metadata in the current `main`
branch, so they use low-confidence product-level fallbacks rather than
self-redirects.

| # | Pageviews | Sessions | Source URL path | Action / destination | Confidence |
|---:|---:|---:|---|---|---|
| 1 | 94 | 93 | `/en/solutions/agora-analytics/reference/pricing` | 301 → `/en/realtime-media/agora-analytics/reference/pricing` | High — same article |
| 2 | 76 | 76 | `/en/video-calling/get-started/get-started-sdk/` | 301 → `/en/realtime-media/video/quickstart` (rule matches slashless canonical path) | High — current Video quickstart |
| 3 | 73 | 71 | `/en/solutions/flexible-classroom/product-overview` | 301 → `/en/realtime-media/flexible-classroom/product-overview` | High — same article |
| 4 | 65 | 65 | `/en/signaling/develop/get-started-sdk` | 301 → `/en/realtime-media/rtm/quickstart` | High — current Signaling quickstart |
| 5 | 64 | 63 | `/en/solutions/agora-analytics/build/explore-and-analyze-data/call-search` | 301 → `/en/realtime-media/agora-analytics/build/explore-and-analyze-data/call-search` | High — same article |
| 6 | 62 | 62 | `/en/help` | 301 → `/en/introduction/support` | High — support and status entry |
| 7 | 59 | 58 | `/en/ai/models` | 301 → `/en/ai` | Low — no current models index page |
| 8 | 59 | 59 | `/en/api-reference/api-ref/signaling/configuration` | 301 → `/en/realtime-media/rtm/build/connect-and-authenticate/client-configuration` | High — same configuration topic |
| 9 | 59 | 59 | `/en/build-with-ai` | 301 → `/en/ai` | Low — no current page with this exact scope |
| 10 | 55 | 55 | `/en/api-reference/api-ref/media-push/integration-best-practices` | 301 → `/en/realtime-media/media-push/build/integration-best-practices` | High — same article |
| 11 | 55 | 55 | `/en/api-reference/api-ref/storage` | 301 → `/en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-channel-metadata` | Medium — closest current RTM storage guide |
| 12 | 51 | 51 | `/en/api-reference/api-reference/enable-ncs` | 301 → `/en/realtime-media/transcoding/build/receive-ncs-events` | Low — product context absent from old path |
| 13 | 50 | 50 | `/en/api-reference/api-ref/signaling/enumv` | 301 → `/en/api-reference/api-ref/signaling` | Medium — API reference landing |
| 14 | 49 | 49 | `/en/api-reference/api-ref/signaling/enum` | 301 → `/en/api-reference/api-ref/signaling` | Medium — API reference landing |
| 15 | 47 | 47 | `/en/api-reference/api-reference/ncs-events` | 301 → `/en/realtime-media/transcoding/reference/ncs-events` | Medium — current NCS events reference |
| 16 | 46 | 46 | `/en/api-reference/api-ref/signaling/reference/limitations` | 301 → `/en/realtime-media/rtm/reference/limitations` | High — same topic |
| 17 | 46 | 46 | `/en/api-reference/api-ref/signaling/toc-configuration/configuration` | 301 → `/en/realtime-media/rtm/build/connect-and-authenticate/client-configuration` | High — same configuration topic |
| 18 | 44 | 43 | `/en/status-page` | 301 → `https://status.agora.io/` | High — official status page |
| 19 | 43 | 30 | `/en/video-calling/reference/agora-console-rest-api` | 301 → `/en/api-reference/api-ref/console/solutions-agora-console-rest-api` | High — same REST API reference |
| 20 | 43 | 42 | `/en/solutions/agora-analytics/build/integrate-and-embed/datadog-integration` | 301 → `/en/realtime-media/agora-analytics/build/integrate-and-embed/datadog-integration` | High — same article |
| 21 | 42 | 41 | `/en/solutions/agora-analytics/product-overview` | 301 → `/en/realtime-media/agora-analytics/product-overview` | High — same article |
| 22 | 34 | 33 | `/en/solutions/iot/product-overview` | 301 → `/en/realtime-media/iot/product-overview` | High — same article |
| 23 | 33 | 29 | `/en/realtime-media/iot/reference/licensing` | 301 → `/en/realtime-media/iot/product-overview` | Low — current branch no longer contains this article |
| 24 | 33 | 32 | `/en/realtime-media/fusion-cdn` | 301 → `/en/realtime-media/media-push/get-started/enable-media-push` | Low — retired product; closest current setup guide |
| 25 | 32 | 32 | `/en/solutions/iot/quickstart` | 301 → `/en/realtime-media/iot/quickstart` | High — same quickstart |
| 26 | 30 | 30 | `/en/api-reference/faq/integration/log` | 301 → `/en/api-reference/faq/integration/set_log_file` | High — matching logging FAQ |
| 27 | 27 | 19 | `/en/cloud-recording/reference/pricing` | 301 → `/en/realtime-media/cloud-recording/reference/pricing` | High — same article |
| 28 | 27 | 27 | `/en/rtc-1.0/rtc-1.0-landing-page` | 301 → `/en/realtime-media/overview` | Low — no dedicated current RTC landing route |
| 29 | 23 | 19 | `/en/assets/files/Agora_ISO_27018-0f20342310eefc1424b81ff98caf707d.pdf` | 301 → `https://docs.agora.io/files/Agora_ISO_27018.pdf` | High — verified official certificate PDF |
| 30 | 23 | 19 | `/en/cloud-recording/reference/restful-api` | 301 → `/en/api-reference/api-ref/cloud-recording` | High — current Cloud Recording API reference |
| 31 | 23 | 22 | `/en/Interactive%20Broadcast/product_live` | 301 → `/en/realtime-media/interactive-live-streaming/product-overview` | High — current product overview |
| 32 | 22 | 11 | `/en/Agora%20Platform/ticket` | 301 → `https://agora-ticket.agora.io/` | High — official support ticket portal |
| 33 | 22 | 20 | `/en/video-calling/get-started/authentication-workflow` | 301 → `/en/realtime-media/video/build/authenticate-users/authentication-workflow` | High — same topic |
| 34 | 18 | 13 | `/en/Agora%20Platform/community` | 301 → `/en/introduction/community-resources` | Medium — current community resources entry |
| 35 | 18 | 14 | `/en/realtime-media/iot/build/stream-and-optimize-media/multi-channel-streaming` | 301 → `/en/realtime-media/iot/quickstart` | Low — current branch no longer contains this article or section |
| 36 | 18 | 16 | `/en/Agora%20Platform/token` | 301 → `/en/introduction/account` | High — account setup and token instructions |
| 37 | 17 | 15 | `/en/Agora%20Platform/terms` | 301 → `https://www.agora.io/en/terms-of-service/` | High — official terms page |
| 38 | 16 | 15 | `/en/Agora%20Platform/firewall` | 301 → `/en/introduction/firewall` | High — current firewall guidance |
| 39 | 16 | 16 | `/en/Video/downloads` | 301 → `/en/api-reference/sdks` | Medium — current SDK catalogue |
| 40 | 15 | 14 | `/en/ai/models/asr/overview` | 301 → `/en/ai/models/asr/deepgram` | High — existing model-overview migration target |
| 41 | 13 | 11 | `/en/video-calling/reference/restful-authentication` | 301 → `/en/api-reference/api-ref/rtc/authentication` | High — current RTC API authentication |
| 42 | 13 | 13 | `/en/Video/start_call_ios` | 301 → `/en/realtime-media/video/quickstart` | High — platform-tabbed Video quickstart |
| 43 | 12 | 11 | `/en/video-calling/reference/release-notes` | 301 → `/en/realtime-media/video/reference/release-notes` | High — same release notes |
| 44 | 12 | 12 | `/en/solutions/flexible-classroom/quickstart/ios` | 301 → `/en/realtime-media/flexible-classroom/quickstart` | High — current platform-tabbed quickstart |
| 45 | 12 | 8 | `/en/video-calling/reference/downloads` | 301 → `/en/api-reference/sdks` | Medium — current SDK catalogue |
| 46 | 11 | 11 | `/en/Interactive%20Broadcast/game_streaming_video_profile` | 301 → `/en/realtime-media/interactive-live-streaming/product-overview` | Low — legacy feature page has no direct current equivalent |
| 47 | 11 | 11 | `/en/solutions/flexible-classroom/quickstart/web` | 301 → `/en/realtime-media/flexible-classroom/quickstart` | High — current platform-tabbed quickstart |
| 48 | 11 | 9 | `/en/Voice/downloads` | 301 → `/en/api-reference/sdks` | Medium — current SDK catalogue |
| 49 | 10 | 10 | `/en/Video/start_call_android` | 301 → `/en/realtime-media/video/quickstart` | High — platform-tabbed Video quickstart |
| 50 | 10 | 10 | `/en/realtime-media/reference/restful-authentication` | 301 → `/en/api-reference/api-ref/rtc/authentication` | Medium — closest current RTC API authentication page |

The low-confidence fallbacks are intentional and localized to paths whose
original product/page context is missing or whose old product no longer has a
dedicated current page. Recheck these mappings if the retired documentation is
restored.

Vercel's development routing normalizes the trailing-slash form of row 2 to
the slashless path before applying redirects. That legacy form therefore has
one platform normalization hop followed by the 301; the canonical slashless
source goes directly to the destination.
