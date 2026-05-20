# Docs Link Audit - 2026-05-20

Command:

```bash
bun run docs:links --max-samples=15
```

Summary:

| Bucket | Count |
| --- | ---: |
| Docs files | 669 |
| Total links | 3249 |
| Valid relative Markdown links | 908 |
| Missing relative Markdown targets | 294 |
| Legacy `/doc/*` links | 12 |
| Root links | 272 |
| External links | 1136 |
| Hash links | 305 |
| Image links | 138 |
| Relative asset links | 322 |

Important sample from `content/docs/en/ai/index.md`:

| Source href | Normalized route | Target file |
| --- | --- | --- |
| `get-started/quickstart.md` | `/en/ai/get-started/quickstart` | `en/ai/get-started/quickstart.md` |
| `build/build-server-client.md` | `/en/ai/build/build-server-client` | `en/ai/build/build-server-client.md` |
| `studio/index.md` | `/en/ai/studio` | `en/ai/studio/index.md` |
| `../api-reference/conversational-ai/rest-api/index.md` | `/en/api-reference/conversational-ai/rest-api` | `en/api-reference/conversational-ai/rest-api/index.md` |

Sample missing relative Markdown targets:

- `en/ai/best-practices/optimize-latency.md`: `../models/mllm/index.md` => `/en/ai/models/mllm` (`en/ai/models/mllm/index.md`)
- `en/ai/build/build-server-client.md`: `../models/asr/index.md` => `/en/ai/models/asr` (`en/ai/models/asr/index.md`)
- `en/ai/build/build-server-client.md`: `../models/llm/index.md` => `/en/ai/models/llm` (`en/ai/models/llm/index.md`)
- `en/ai/build/build-server-client.md`: `../models/tts/index.md` => `/en/ai/models/tts` (`en/ai/models/tts/index.md`)
- `en/ai/custom-data.md`: `../get-started/quick-start.md` => `/en/get-started/quick-start` (`en/get-started/quick-start.md`)
- `en/ai/custom-data.md`: `../operations/start-agent.md` => `/en/operations/start-agent` (`en/operations/start-agent.md`)

Legacy `/doc/*` links:

- `en/api-reference/enable-ncs.md`: `/doc/convoai/restful/webhook/ncs-events`
- `zh-CN/api-reference/enable-ncs.md`: `/doc/convoai/restful/webhook/ncs-events`
- `zh-CN/realtime-media/rtm2/android/get-started/enable-service.md`: `/doc/console/general/quickstart`
- `zh-CN/realtime-media/rtm2/cpp/get-started/enable-service.md`: `/doc/console/general/quickstart`
- `zh-CN/realtime-media/rtm2/flutter/get-started/enable-service.md`: `/doc/console/general/quickstart`
- `zh-CN/realtime-media/rtm2/harmonyos/get-started/enable-service.md`: `/doc/console/general/quickstart`
- `zh-CN/realtime-media/rtm2/ios/get-started/enable-service.md`: `/doc/console/general/quickstart`
- `zh-CN/realtime-media/rtm2/javascript/get-started/enable-service.md`: `/doc/console/general/quickstart`
- `zh-CN/realtime-media/rtm2/swift/get-started/enable-service.md`: `/doc/console/general/quickstart`
- `zh-CN/realtime-media/rtm2/unity/get-started/enable-service.md`: `/doc/console/general/quickstart`

Decision:

- Normalize valid relative Markdown links in rendering now.
- Keep the 294 missing targets as explicit migration debt.
- Add narrow `/doc/*` compatibility routing so current migrated pages do not send users to a local 404.
