# Reference Sidebar Reorg — Inventory & Matrix

_Date: 2026-06-27_

---

## 1. api-ref child inventory

Every child of `content/docs/en/api-reference/api-ref/`:

| Child | Type | Destination |
|---|---|---|
| `index.mdx` | REST overview | REST API reference (listed first) |
| `conversational-ai/` | REST | REST API reference |
| `rtc/` | REST | REST API reference |
| `broadcast-streaming/` | REST | REST API reference |
| `im/` | REST (Chat) | REST API reference |
| `signaling/` | REST | REST API reference |
| `cloud-recording/` | REST | REST API reference |
| `cloud-transcoding/` | REST | REST API reference |
| `speech-to-text/` | REST | REST API reference |
| `rtmp-gateway/` | REST | REST API reference |
| `whiteboard/` | REST | REST API reference |
| `media-pull/` | REST | REST API reference |
| `media-push/` | REST | REST API reference |
| `on-premise-recording/` | REST | REST API reference |
| `console/` | REST | REST API reference |
| `flexible-classroom/` | REST | REST API reference |
| `extensions-marketplace/` | REST | REST API reference |
| `agora-analytics/` | REST | REST API reference |
| `broadcast-streaming/` | REST | REST API reference |
| `iot-channel-management-rest-api.md` | REST | REST API reference |
| `uikit-sdk.mdx` | REST | REST API reference |
| `server-sdk/` | Agora Agents SDK (in-portal) | SDK API reference — Agora Agents group (elevated to top-level) |
| `video/` | Sub-dir (likely video SDK redirect content) | Not surfaced as a standalone REST lane |
| `voice/` | Sub-dir (likely voice SDK redirect content) | Not surfaced as a standalone REST lane |

> Note: `video/` and `voice/` are subdirectories under api-ref but do not appear in the existing `api-ref/meta.json` pages list and are not REST API reference lanes — they appear to be local redirect/stub content for the SDK external refs. They are omitted from both sections.

---

## 2. Product → Platform → API-ref URL matrix

URLs sourced exclusively from `grep -rhoE "https://api-ref\.agora\.io/..." content`. Major-version index (`N.x/index.html`) used throughout. Gaps flagged where no verified URL exists for a platform.

### Agora Agents (in-portal — not external links)

Pages served from within this portal under `api-ref/server-sdk/`:

| Page | Portal path |
|---|---|
| TypeScript | `/en/api-reference/api-ref/server-sdk/typescript` |
| Python | `/en/api-reference/api-ref/server-sdk/python` |
| Go | `/en/api-reference/api-ref/server-sdk/go` |

---

### Voice & Video (`video-sdk` + `voice-sdk`)

Note: Both `video-sdk` and `voice-sdk` families cover the same "Voice & Video" product (video SDK is the primary; voice SDK is audio-only variant). The sidebar uses the latest major version (4.x for native, 5.x/6.x for Flutter, 2.x for ReactJS/Web).

| Platform | SDK family | Verified major-version index URL |
|---|---|---|
| Android | video-sdk | `https://api-ref.agora.io/en/video-sdk/android/4.x/index.html` |
| iOS | video-sdk | `https://api-ref.agora.io/en/video-sdk/ios/4.x/index.html` |
| macOS | video-sdk | `https://api-ref.agora.io/en/video-sdk/macos/4.x/index.html` |
| Web | video-sdk | `https://api-ref.agora.io/en/video-sdk/web/4.x/index.html` |
| Flutter | video-sdk | `https://api-ref.agora.io/en/video-sdk/flutter/6.x/index.html` |
| React Native | video-sdk | `https://api-ref.agora.io/en/video-sdk/react-native/4.x/index.html` |
| Unity | video-sdk | `https://api-ref.agora.io/en/video-sdk/unity/4.x/index.html` |
| Electron | video-sdk | `https://api-ref.agora.io/en/video-sdk/electron/4.x/index.html` |
| Unreal Engine | video-sdk | `https://api-ref.agora.io/en/video-sdk/unreal-engine/4.x/index.html` |
| C++ | video-sdk | `https://api-ref.agora.io/en/video-sdk/cpp/4.x/index.html` |
| Blueprint | video-sdk | `https://api-ref.agora.io/en/video-sdk/blueprint/4.x/index.html` |
| React.js | video-sdk | `https://api-ref.agora.io/en/video-sdk/reactjs/2.x/index.html` |
| Windows C# | video-sdk | ⚠️ GAP — only `windows-csharp/3.x` seen (no 4.x URL in content); use `https://api-ref.agora.io/en/video-sdk/windows-csharp/3.x/index.html` |

> Note: `voice-sdk` platforms (android/4.x, ios/4.x, macos/4.x, web/4.x, flutter, electron, react-native, unity, cpp, blueprint, unreal-engine) overlap with video-sdk. They are not separately listed in the sidebar since they share the same product group.

---

### Signaling (`signaling-sdk`)

Signaling SDK 2.x is the current generation; 1.x also present in content.

| Platform | Verified major-version index URL |
|---|---|
| Android | `https://api-ref.agora.io/en/signaling-sdk/android/2.x/index.html` |
| iOS | ⚠️ GAP — only `signaling-sdk/ios/1.x` found (no 2.x URL in content); use `https://api-ref.agora.io/en/signaling-sdk/ios/1.x/index.html` |
| macOS | ⚠️ GAP — only `signaling-sdk/macos/1.x` found; use `https://api-ref.agora.io/en/signaling-sdk/macos/1.x/index.html` |
| Web | `https://api-ref.agora.io/en/signaling-sdk/web/2.x/index.html` |
| Unity | `https://api-ref.agora.io/en/signaling-sdk/unity/2.x/index.html` |
| Linux C++ | `https://api-ref.agora.io/en/signaling-sdk/linux-cpp/2.x/index.html` |
| Linux Java | ⚠️ GAP — only `signaling-sdk/linux-java/1.x` found; use `https://api-ref.agora.io/en/signaling-sdk/linux-java/1.x/index.html` |
| Windows C++ | ⚠️ GAP — only `signaling-sdk/windows-cpp/1.x` found; use `https://api-ref.agora.io/en/signaling-sdk/windows-cpp/1.x/index.html` |

---

### Chat (`chat-sdk`)

All platforms on 1.x.

| Platform | Verified major-version index URL |
|---|---|
| Android | `https://api-ref.agora.io/en/chat-sdk/android/1.x/index.html` |
| iOS | `https://api-ref.agora.io/en/chat-sdk/ios/1.x/index.html` |
| Web | `https://api-ref.agora.io/en/chat-sdk/web/1.x/index.html` |
| Flutter | `https://api-ref.agora.io/en/chat-sdk/flutter/1.x/agora_chat_sdk/index.html` |
| React Native | `https://api-ref.agora.io/en/chat-sdk/react-native/1.x/index.html` |
| Unity | `https://api-ref.agora.io/en/chat-sdk/unity/1.x/index.html` |
| Windows | `https://api-ref.agora.io/en/chat-sdk/windows/1.x/index.html` |

---

### Interactive Whiteboard (`interactive-whiteboard-sdk`)

| Platform | Verified major-version index URL |
|---|---|
| Android | `https://api-ref.agora.io/en/interactive-whiteboard-sdk/android/2.x/index.html` |
| iOS | `https://api-ref.agora.io/en/interactive-whiteboard-sdk/ios/2.x/index.html` |
| Web | `https://api-ref.agora.io/en/interactive-whiteboard-sdk/web/2.x/index.html` |

> Note: iOS deep-link points to `docs/headers/...` but `index.html` at 2.x is the standard entry; using index form.

---

### Media Player Kit (`mediaplayer-kit`)

| Platform | Verified major-version index URL |
|---|---|
| Android | `https://api-ref.agora.io/en/mediaplayer-kit/android/1.x/index.html` |
| iOS | `https://api-ref.agora.io/en/mediaplayer-kit/ios/1.x/index.html` |
| macOS | `https://api-ref.agora.io/en/mediaplayer-kit/macos/1.x/index.html` |
| Windows | `https://api-ref.agora.io/en/mediaplayer-kit/windows/1.x/index.html` |

---

### IoT (`iot-sdk`)

| Platform | Verified major-version index URL |
|---|---|
| Android | `https://api-ref.agora.io/en/iot-sdk/android/1.x/index.html` |
| Linux | `https://api-ref.agora.io/en/iot-sdk/linux/1.x/index.html` |

---

### Flexible Classroom (`flexible-classroom-sdk`)

| Platform | Verified major-version index URL |
|---|---|
| Android | `https://api-ref.agora.io/en/flexible-classroom-sdk/android/2.x/index.html` |
| iOS | `https://api-ref.agora.io/en/flexible-classroom-sdk/ios/2.x/index.html` |
| Web | `https://api-ref.agora.io/en/flexible-classroom-sdk/web/2.x/index.html` |
| Electron | `https://api-ref.agora.io/en/flexible-classroom-sdk/electron/2.x/index.html` |

---

### Server Gateway (`server-gateway-sdk`)

| Platform | Verified major-version index URL |
|---|---|
| Linux C++ | `https://api-ref.agora.io/en/server-gateway-sdk/linux-cpp/4.x/index.html` |
| Linux Java | `https://api-ref.agora.io/en/server-gateway-sdk/linux-java/4.x/index.html` |

---

### On-Premise Recording (`on-premise-recording-sdk`)

| Platform | Verified major-version index URL |
|---|---|
| Linux C++ | `https://api-ref.agora.io/en/on-premise-recording-sdk/linux-cpp/3.x/index.html` |
| Linux Java | `https://api-ref.agora.io/en/on-premise-recording-sdk/linux-java/3.x/index.html` |

---

## 3. Gaps summary

| Product | Gap |
|---|---|
| Voice & Video | `windows-csharp` only has 3.x in content; using 3.x index |
| Signaling | iOS, macOS, Linux Java, Windows C++ only have 1.x in content; using 1.x index |
| Signaling | No Flutter, React Native, or Electron ref URLs found in content — omitted |
| Chat | Unity uses `annotated.html` (no `index.html` in content) — using index form as standard |
| Interactive Whiteboard | iOS deep-links to `docs/headers/...` — normalised to `index.html` |
| IoT | Only Android and Linux platforms found — no iOS, web, etc. |
| Server Gateway | No Windows or macOS platforms found — only Linux C++/Java |
| On-Premise Recording | Only Linux C++ and Linux Java found |
