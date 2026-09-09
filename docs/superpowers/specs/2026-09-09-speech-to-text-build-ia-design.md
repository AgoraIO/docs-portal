# Speech-to-Text Build IA Design

## Scope

This design reorganizes only the Build information architecture under
`content/docs/zh-CN/realtime-media/speech-to-text/build/`.

The product root navigation, `get-started` IA, and `reference` IA remain
unchanged. In particular:

- `get-started/quick-start.mdx` remains under Get started.
- `reference/ncs-events.mdx` remains under Reference.
- No page is split.
- No document title or source filename is changed.
- The API reference lane remains outside this product directory.

## Design Principles

The Build navigation follows developer goals and lifecycle dependencies rather
than the current source directories or API operation names.

1. Categories are ordered from access preparation to task operation, result
   processing, persistence, monitoring, and optional extensions.
2. Each category represents one clear user goal.
3. Pages with one complete task remain direct Build pages rather than gaining
   an artificial dropdown.
4. Each page has one primary navigation location.
5. Existing page content remains intact unless a later implementation task
   identifies a separate content defect.

## Final Build IA

```text
Build: 构建实时转录翻译

├── 准备接入
│   ├── 开通声网服务
│   └── 实现 HTTP 基本认证
│
├── 启动和管理任务
│   ├── 从客户端开启实时转录翻译
│   ├── 转写指定主播
│   ├── 实时翻译
│   └── 更新服务配置
│
├── 处理转录翻译数据
│   ├── 解析转写数据
│   ├── 渲染字幕
│   └── 加密字幕
│
├── 录制字幕
│
├── 接收 Webhook 事件
│
└── 扩展与优化
    ├── 提升转录质量并优化成本
    └── 使用音频模态输出
```

`录制字幕` and `接收 Webhook 事件` are direct pages. They are not wrapper
categories and therefore do not have a nested dropdown.

## Page Mapping

| Build IA location | Current source page |
| --- | --- |
| 准备接入 / 开通声网服务 | `build/start-transcribing-and-translating/enable-service.mdx` |
| 准备接入 / 实现 HTTP 基本认证 | `build/start-transcribing-and-translating/http-basic-auth.mdx` |
| 启动和管理任务 / 从客户端开启实时转录翻译 | `build/extend-and-optimize/enable-from-client.mdx` |
| 启动和管理任务 / 转写指定主播 | `build/start-transcribing-and-translating/transcribe-specified-hosts.mdx` |
| 启动和管理任务 / 实时翻译 | `build/start-transcribing-and-translating/translation.mdx` |
| 启动和管理任务 / 更新服务配置 | `build/start-transcribing-and-translating/update-service.mdx` |
| 处理转录翻译数据 / 解析转写数据 | `build/process-transcription-data/how-to-use-protobuf.mdx` |
| 处理转录翻译数据 / 渲染字幕 | `build/process-transcription-data/render-captions.mdx` |
| 处理转录翻译数据 / 加密字幕 | `build/process-transcription-data/encrypt-captions.mdx` |
| 录制字幕 | `build/process-transcription-data/record-captions.mdx` |
| 接收 Webhook 事件 | `build/monitor-events/receive-webhook.mdx` |
| 扩展与优化 / 提升转录质量并优化成本 | `build/extend-and-optimize/optimize-quality.mdx` |
| 扩展与优化 / 使用音频模态输出 | `build/extend-and-optimize/audio-modality.mdx` |

## Lifecycle Rationale

The recommended reading flow is:

```text
准备接入
  -> 启动和管理任务
  -> 处理转录翻译数据
  -> 录制字幕
  -> 接收 Webhook 事件
  -> 扩展与优化
```

The flow reflects the minimum dependency chain:

- A project and HTTP authentication are needed before REST API calls.
- A running task is needed before the application can consume results.
- Result parsing precedes rendering because the client must understand the
  payload before passing it to a subtitle view.
- Recording is an optional persistence path after the task is working.
- Webhook configuration is a production operation path for task and upload
  events, and its event catalog remains in Reference as an unchanged page.
- Quality, cost, and audio-modality work are optional extensions and should not
  obstruct the first successful integration.

`加密字幕` remains with result processing because it protects the real-time
data stream consumed by the client. It is not the same user goal as persisting
subtitle files in `录制字幕`.

## Canonical Path Strategy

The new IA uses canonical paths that reflect the new Build categories. Pages
whose existing directory already matches the new semantic boundary stay at
their current path to limit churn.

### Paths that move

```text
build/start-transcribing-and-translating/enable-service
  -> build/setup-and-access/enable-service

build/start-transcribing-and-translating/http-basic-auth
  -> build/setup-and-access/http-basic-auth

build/start-transcribing-and-translating/transcribe-specified-hosts
  -> build/start-and-manage/transcribe-specified-hosts

build/start-transcribing-and-translating/translation
  -> build/start-and-manage/translation

build/start-transcribing-and-translating/update-service
  -> build/start-and-manage/update-service

build/process-transcription-data/record-captions
  -> build/record-captions

build/monitor-events/receive-webhook
  -> build/receive-webhook

build/extend-and-optimize/enable-from-client
  -> build/start-and-manage/enable-from-client
```

### Paths that stay

```text
build/process-transcription-data/how-to-use-protobuf
build/process-transcription-data/render-captions
build/process-transcription-data/encrypt-captions
build/extend-and-optimize/optimize-quality
build/extend-and-optimize/audio-modality
```

The page titles and source filenames remain unchanged even when the directory
path moves.

## Redirects and Internal References

Every moved old path receives a permanent 301 redirect to its canonical path.
The old path is retained only as an external compatibility entry point.

In addition, all tracked internal references must be updated to the canonical
paths, including references in:

- Chinese MDX and Markdown content;
- `meta.json` navigation metadata;
- cross-links from `get-started` and `reference` pages;
- source code or route configuration that contains these paths;
- tests and redirect fixtures where applicable.

No internal link should continue to point to a moved old path after the
migration. This link update does not change the IA of `get-started` or
`reference`; it only updates their targets when they link to a moved Build
page.

## Acceptance Criteria

The implementation is complete when:

1. The Build sidebar renders the six approved top-level entries, consisting of
   four grouped categories and two direct pages, in the approved lifecycle
   order.
2. `get-started` and `reference` navigation remain unchanged.
3. All 13 Build source pages are present exactly once in the new Build IA.
4. Page titles and source filenames remain unchanged.
5. Every moved old URL returns a permanent 301 redirect to its canonical URL.
6. Repository-wide internal references use canonical paths.
7. No broken internal links, duplicate canonical pages, or stale old-path
   links remain.
8. Build, type, navigation, and redirect checks pass.
