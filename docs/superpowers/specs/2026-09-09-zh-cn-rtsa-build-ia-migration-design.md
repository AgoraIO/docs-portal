# zh-CN RTSA Build IA 迁移设计

## 目标

重新组织 `/zh-CN/realtime-media/rtsa/build` 的中文文档，使导航以开发者任务和开发生命周期为主轴，并将内容文件实际移动到与新 IA 对应的物理目录。

本次迁移覆盖导航、物理文件路径、canonical URL、站内链接和重定向。页面内容语义保持不变，页面拆分或合并不属于本次范围。

## 已确认的 IA

Build 根路径直接进入基础接入页面：

```text
/zh-CN/realtime-media/rtsa/build
  -> /zh-CN/realtime-media/rtsa/build/implement-transmission
```

RTSA 概览页中的“构建功能”入口也指向 `implement-transmission`。

侧边栏结构如下：

```text
项目准备
├─ enable-service
└─ license

implement-transmission
（直接显示，不放入下拉分类）

string-uid
（直接显示，不放入下拉分类）

媒体传输
├─ audio-codec
├─ stream-state
├─ bitrate-adaption
├─ key-frame
├─ multi-channel
└─ encryption

数据通信
├─ data-stream
└─ send-message-through-rdt-channel

interoperate-rtc
（直接显示，不放入下拉分类）

生产环境配置
├─ cloud-proxy
└─ region-limit
```

`implement-transmission` 是基础媒体和信令流程的主入口。`string-uid` 虽然是进阶能力，但用户意图明确且页面独立，因此作为直接入口保留。`multi-channel` 归入媒体传输，因为它解决的是多频道发流和单频道多路媒体流的传输拓扑。

## 物理目录和 canonical URL

文件使用 ASCII、kebab-case 的目录名。页面文件名保持不变，只有目录位置变化。

```text
content/docs/zh-CN/realtime-media/rtsa/build/
├── project-preparation/
│   ├── enable-service.mdx
│   ├── license.mdx
│   └── meta.json
├── implement-transmission.mdx
├── string-uid.mdx
├── interoperate-rtc.mdx
├── media-transmission/
│   ├── audio-codec.mdx
│   ├── stream-state.mdx
│   ├── bitrate-adaption.mdx
│   ├── key-frame.mdx
│   ├── multi-channel.mdx
│   ├── encryption.mdx
│   └── meta.json
├── data-communication/
│   ├── data-stream.mdx
│   ├── send-message-through-rdt-channel.mdx
│   └── meta.json
├── production-environment/
│   ├── cloud-proxy.mdx
│   ├── region-limit.mdx
│   └── meta.json
└── meta.json
```

新 canonical URL 为：

```text
/zh-CN/realtime-media/rtsa/build/project-preparation/enable-service
/zh-CN/realtime-media/rtsa/build/project-preparation/license
/zh-CN/realtime-media/rtsa/build/implement-transmission
/zh-CN/realtime-media/rtsa/build/string-uid
/zh-CN/realtime-media/rtsa/build/interoperate-rtc
/zh-CN/realtime-media/rtsa/build/media-transmission/audio-codec
/zh-CN/realtime-media/rtsa/build/media-transmission/stream-state
/zh-CN/realtime-media/rtsa/build/media-transmission/bitrate-adaption
/zh-CN/realtime-media/rtsa/build/media-transmission/key-frame
/zh-CN/realtime-media/rtsa/build/media-transmission/multi-channel
/zh-CN/realtime-media/rtsa/build/media-transmission/encryption
/zh-CN/realtime-media/rtsa/build/data-communication/data-stream
/zh-CN/realtime-media/rtsa/build/data-communication/send-message-through-rdt-channel
/zh-CN/realtime-media/rtsa/build/production-environment/cloud-proxy
/zh-CN/realtime-media/rtsa/build/production-environment/region-limit
```

物理移动必须使用 `git mv`。生成文件，例如 route tree、文档更新时间清单和其他构建产物，不手动编辑。

## 页面边界

本次不拆分或合并页面。

- `enable-service` 继续负责控制台注册、创建项目、App ID、RTC/RTM 临时 Token 和 REST 凭证。
- `license` 继续覆盖申请、预授权、激活、设备使用、到期查询、续期和续期订单查询。它属于项目准备，但后续可以独立评估 License 生命周期页面拆分。
- `implement-transmission` 保持媒体流和 RTM 信令的综合基础流程，不在本次拆分。
- `string-uid` 作为独立的 User Account/字符串 UID 接入任务保留。
- `audio-codec`、`stream-state`、`bitrate-adaption`、`key-frame`、`multi-channel` 和 `encryption` 作为媒体传输能力保留独立页面。
- `data-stream` 和 `send-message-through-rdt-channel` 不合并。前者是频道广播数据流，后者是用户间可靠数据传输。
- `interoperate-rtc` 保持为跨 SDK 集成页面。
- `cloud-proxy` 和 `region-limit` 保持为生产环境配置页面。

## 导航元数据

`build/meta.json` 应表达已确认的直接页面和分组。分类分组使用仓库支持的 structured group 语法；分组可以引用新物理目录下的页面。旧的 `setup-and-access/meta.json`、`implement-core-features/meta.json` 和 `optimize-and-operate/meta.json` 不再保留。

项目准备、媒体传输、数据通信和生产环境配置是分组；三个直接入口页面位于 Build 根导航中，不放入下拉分组。

项目准备是第一阶段，应保持可见或默认展开。当前页面所属分组必须能正常自动展开，直接入口页面不应被折叠分类隐藏。

## 链接迁移

链接迁移范围是全仓库，而不是预先列出的少数文件。迁移前后都要搜索以下旧路径模式：

```text
/build/setup-and-access/
/build/implement-core-features/
/build/optimize-and-operate/
```

必须检查带 fragment 的链接，例如：

```text
/build/implement-core-features/implement-transmission#eventlistener
```

迁移后应为：

```text
/build/implement-transmission#eventlistener
```

需要更新的源文件范围包括：

- `content/docs/**` 下的 MDX/Markdown；
- `src/**` 下的 canonical 路径、路由和测试；
- 重定向配置源；
- 其他仓库内维护的文档索引或路径清单。

至少需要检查当前已知入口：

- `content/docs/zh-CN/realtime-media/rtsa/index.mdx`；
- `get-started/run-example.mdx`；
- `reference/downloads.mdx`；
- `reference/release-notes.mdx`；
- `implement-transmission.mdx` 到 License 的链接。

站内 MDX 不得残留旧路径。重定向配置的匹配来源可以保留旧路径，但重定向目标必须直接指向新的最终 canonical URL，不得指向旧路径或中间路径。

## 重定向策略

所有旧页面 URL 都必须 301 到对应的新 URL。重定向目标不应形成链式跳转。

主要映射包括：

```text
/build/setup-and-access/enable-service
  -> /build/project-preparation/enable-service
/build/setup-and-access/license
  -> /build/project-preparation/license
/build/implement-core-features/implement-transmission
  -> /build/implement-transmission
/build/implement-core-features/string-uid
  -> /build/string-uid
/build/optimize-and-operate/interoperate-rtc
  -> /build/interoperate-rtc
/build/implement-core-features/audio-codec
  -> /build/media-transmission/audio-codec
/build/implement-core-features/stream-state
  -> /build/media-transmission/stream-state
/build/implement-core-features/bitrate-adaption
  -> /build/media-transmission/bitrate-adaption
/build/implement-core-features/key-frame
  -> /build/media-transmission/key-frame
/build/implement-core-features/multi-channel
  -> /build/media-transmission/multi-channel
/build/implement-core-features/encryption
  -> /build/media-transmission/encryption
/build/implement-core-features/data-stream
  -> /build/data-communication/data-stream
/build/implement-core-features/send-message-through-rdt-channel
  -> /build/data-communication/send-message-through-rdt-channel
/build/setup-and-access/cloud-proxy
  -> /build/production-environment/cloud-proxy
/build/setup-and-access/region-limit
  -> /build/production-environment/region-limit
```

实际配置要同时审查现有 `src/lib/zh-cn-product-ia-redirects.ts` 中的 RTSA 历史 alias。历史 alias 必须直接指向新 URL。不要让 alias 先跳到旧 canonical URL，再跳到新 URL。

带 fragment 的旧链接应由新 URL 继续承载相同 fragment。重定向规则本身不依赖 fragment 匹配，页面内容必须保留相关 heading 或显式 anchor，避免迁移后锚点失效。

## 删除范围

物理移动完成后，以下旧内容和导航元数据必须不存在：

```text
setup-and-access/*.mdx
setup-and-access/meta.json
implement-core-features/*.mdx
implement-core-features/meta.json
optimize-and-operate/*.mdx
optimize-and-operate/meta.json
```

删除前必须完成全仓库依赖扫描。旧路径可以作为重定向匹配来源存在，但旧目录不能继续持有内容文件或 `meta.json`。生成文件不手动删除或编辑，由项目生成流程更新。

## 根路径行为

Build 根路径的最终行为固定为：

```text
/zh-CN/realtime-media/rtsa/build
  -> /zh-CN/realtime-media/rtsa/build/implement-transmission
```

RTSA 概览页的“构建功能”入口指向同一 canonical URL。项目准备页面仍通过侧边栏访问。

## 验收和测试

迁移完成后，至少验证以下内容：

### 文件和导航

- 新目录包含预期 MDX 和 `meta.json`；
- 旧目录不包含 MDX 或 `meta.json`；
- `implement-transmission`、`string-uid` 和 `interoperate-rtc` 是直接导航页面；
- 新分类页面只出现一次；
- 页面顺序符合项目准备、基础接入、能力扩展、生产配置的任务路径；
- Build 根路径指向 `implement-transmission`。

### 链接和重定向

- 全仓库 MDX 不再引用三个旧路径模式；
- 重定向目标不再指向旧路径；
- 旧 canonical URL 返回 301；
- 历史 alias 直接指向最终新 URL；
- 带 fragment 的链接保留 fragment；
- 站内链接、产品概览入口、下载页、运行示例和 Release Notes 全部使用新 canonical URL。

### 生成和运行结果

- 页面树没有重复页面；
- 面包屑和 previous/next 导航使用新页面关系；
- 搜索结果仍可找到所有页面；
- Sitemap、LLM 输出和静态路由包含新 URL；
- `bun run types:check` 通过；
- `bun run test` 通过；
- `bun run build` 通过。

旧路径残留测试必须分层实现：

- MDX 和重定向目标中的旧路径：失败；
- 重定向匹配来源中的旧路径：允许；
- 历史迁移报告中的旧路径：不作为已发布内容检查，但需避免被误改。

## 非目标

- 不重写页面正文；
- 不拆分 `license`；
- 不拆分 `implement-transmission` 中的 RTC 媒体和 RTM 信令内容；
- 不修改 API 文档；
- 不手动编辑生成文件；
- 不删除仍被重定向配置使用的旧路径映射；
- 不在本次迁移中改变英文 RTSA IA。
