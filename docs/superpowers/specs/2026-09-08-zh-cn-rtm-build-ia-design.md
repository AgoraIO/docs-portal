# zh-CN RTM Build IA 调整设计

## 目标

重新组织 `/zh-CN/realtime-media/rtm/build` 的中文产品文档，使导航以开发者的开发生命周期和具体任务为主轴，而不是按现有目录中的产品名词简单分组。

本次调整只针对 zh-CN RTM Build 文档。英文 IA 不作为结构约束，但中文文档中的产品能力和现有内容语义必须保留。

## 已确认的 IA

Build 使用以下八个一级分类：

1. RTM 初始化
2. 鉴权与连接
3. 选择频道与 Topic
4. 收发消息
5. 消息设计与历史管理
6. 管理状态与属性
7. 配置网络与私有化
8. 问题排查

目标内容结构如下：

```text
build/
├── rtm-initialization/
│   ├── meta.json
│   ├── enable-service.mdx
│   └── application-setup.mdx
│
├── authentication-and-connection/
│   ├── meta.json
│   ├── token-generation.mdx
│   ├── user-authentication.mdx
│   ├── login.mdx
│   ├── link-basic.mdx
│   └── link-state.mdx
│
├── channels-and-topics/
│   ├── meta.json
│   ├── channel-basic.mdx
│   ├── channel-name.mdx
│   ├── message-channel.mdx
│   ├── stream-channel.mdx
│   └── topics/
│       ├── meta.json
│       ├── topic-basic.mdx
│       ├── usage.mdx
│       └── topic-events.mdx
│
├── messaging/
│   ├── meta.json
│   ├── add-event-listener.mdx
│   └── send-message.mdx
│
├── message-design-and-history/
│   ├── meta.json
│   ├── constructed.mdx
│   ├── serialized.mdx
│   └── history-message.mdx
│
├── state-and-attributes/
│   ├── meta.json
│   ├── presence-basic.mdx
│   ├── temporary-user-state.mdx
│   ├── presence-events.mdx
│   ├── user-metadata.mdx
│   ├── channel-metadata.mdx
│   ├── metadata-events.mdx
│   └── data-storage.mdx
│
├── network-and-private-deployment/
│   ├── meta.json
│   ├── network-configuration.mdx
│   └── private-setup.mdx
│
└── troubleshooting.mdx
```

`troubleshooting.mdx` 保留在 `build` 根目录，不强制改造成目录。它作为 Build 中的最后一个直接页面入口。

## 页面归属和内容边界

### RTM 初始化

`application-setup.mdx` 保持为一篇完整的初始化文档，不拆成多个页面。以下章节继续保留在该文档中：

- 用户 ID；
- 服务类型；
- 安装 SDK；
- 初始化 RTM 实例；
- 日志设置。

`enable-service.mdx` 继续负责控制台注册、创建项目、开通 RTM 和获取 App ID、临时 Token、App 证书。

### 鉴权与连接

保留以下页面文件名，只移动目录：

- `token-generation.mdx`：部署 Token 服务器；
- `user-authentication.mdx`：客户端鉴权；
- `login.mdx`：登录、退出登录和销毁实例；
- `link-basic.mdx`：连接建立、连接类型、心跳和关闭连接；
- `link-state.mdx`：连接状态迁移、恢复和错误处理。

该分类形成生成 Token、客户端鉴权、登录、建立连接和恢复连接的任务路径。

### 选择频道与 Topic

保留现有 Channel 和 Topic 页面，不新增 User Channel 页面：

- `channel-basic.mdx`：Channel 类型、创建机制和限制，并继续包含 User Channel 概念说明；
- `channel-name.mdx`：Channel 命名建议；
- `message-channel.mdx`：Message Channel 的订阅和取消订阅；
- `stream-channel.mdx`：Stream Channel 的创建、加入、离开、销毁和共频道传输；
- `topics/topic-basic.mdx`：Topic 创建、限制和命名；
- `topics/usage.mdx`：Topic 加入、离开、订阅、取消订阅和同步传输；
- `topics/topic-events.mdx`：Topic 事件类型和监听说明。

User Channel 的发送实现继续保留在 `messaging/send-message.mdx` 中，不从现有页面抽出独立页面。

### 收发消息

`add-event-listener.mdx` 整篇移动到本分类，不拆分消息、Presence、Topic、Storage、Lock、连接状态和 Token 事件代码。该页面作为接收消息和事件通知的通用入口。

`send-message.mdx` 继续负责 Message Channel、User Channel 和 Stream Channel 中的消息发送。

### 消息设计与历史管理

以下文件名不变，仅移动到新分类：

- `constructed.mdx`：消息负载结构和消息类型设计；
- `serialized.mdx`：Json.NET、JSON Object 和 Protocol Buffers 序列化；
- `history-message.mdx`：历史消息开通、存储和获取。

### 管理状态与属性

以下页面集中管理 Presence、Metadata、Storage 和 Lock 相关内容：

- `presence-basic.mdx`：查询在线用户及其所在频道；
- `temporary-user-state.mdx`：设置、获取和删除临时用户状态；
- `presence-events.mdx`：Presence 事件通知；
- `user-metadata.mdx`：用户属性增删改查、订阅和 CAS；
- `channel-metadata.mdx`：频道属性增删改查、CAS 和 Lock；
- `metadata-events.mdx`：Metadata 事件通知；
- `data-storage.mdx`：Presence、Metadata、Lock 和历史消息相关的数据存储及删除方式。

不新增独立 Lock 页面。

### 配置网络与私有化

新增文件：

```text
content/docs/zh-CN/realtime-media/rtm/build/network-and-private-deployment/network-configuration.mdx
```

该文件承接从 `application-setup.mdx` 抽取的以下完整章节：

- 连接协议配置；
- Cloud Proxy 设置；
- Proxy 设置；
- 防火墙白名单设置。

抽取时必须保留原有平台结构、代码 tab、四个章节的原始顺序和正文语义；本次只移动内容，不重写网络配置说明，不把不同平台的代码示例合并成单一示例。

`private-setup.mdx` 移动到同一分类，文件名不变。

`application-setup.mdx` 保留上述网络章节的兼容锚点和简短跳转说明，不重复完整正文，确保旧的带锚点链接仍然可以到达相关入口。

### 问题排查

`troubleshooting.mdx` 保留在原位置和原文件名，不创建新的目录层级。该页面继续负责日志、错误码和联系支持，并链接到 Reference 中的错误码、API 使用限制、平台支持和发版说明。

## 文件移动映射

所有现有页面文件名保持不变。以下是目录移动规则：

| 旧路径 | 新路径 |
| --- | --- |
| `build/setup-and-access/enable-service.mdx` | `build/rtm-initialization/enable-service.mdx` |
| `build/setup-and-access/application-setup.mdx` | `build/rtm-initialization/application-setup.mdx` |
| `build/setup-and-access/add-event-listener.mdx` | `build/messaging/add-event-listener.mdx` |
| `build/setup-and-access/login.mdx` | `build/authentication-and-connection/login.mdx` |
| `build/setup-and-access/link-basic.mdx` | `build/authentication-and-connection/link-basic.mdx` |
| `build/setup-and-access/link-state.mdx` | `build/authentication-and-connection/link-state.mdx` |
| `build/manage-channels/channel-basic.mdx` | `build/channels-and-topics/channel-basic.mdx` |
| `build/manage-channels/channel-name.mdx` | `build/channels-and-topics/channel-name.mdx` |
| `build/manage-channels/message-channel.mdx` | `build/channels-and-topics/message-channel.mdx` |
| `build/manage-channels/stream-channel.mdx` | `build/channels-and-topics/stream-channel.mdx` |
| `build/manage-messages/send-message.mdx` | `build/messaging/send-message.mdx` |
| `build/manage-messages/constructed.mdx` | `build/message-design-and-history/constructed.mdx` |
| `build/manage-messages/serialized.mdx` | `build/message-design-and-history/serialized.mdx` |
| `build/manage-messages/history-message.mdx` | `build/message-design-and-history/history-message.mdx` |
| `build/manage-topics/topic-basic.mdx` | `build/channels-and-topics/topics/topic-basic.mdx` |
| `build/manage-topics/usage.mdx` | `build/channels-and-topics/topics/usage.mdx` |
| `build/manage-topics/topic-events.mdx` | `build/channels-and-topics/topics/topic-events.mdx` |
| `build/manage-presence/presence-basic.mdx` | `build/state-and-attributes/presence-basic.mdx` |
| `build/manage-presence/temporary-user-state.mdx` | `build/state-and-attributes/temporary-user-state.mdx` |
| `build/manage-presence/presence-events.mdx` | `build/state-and-attributes/presence-events.mdx` |
| `build/manage-metadata/user-metadata.mdx` | `build/state-and-attributes/user-metadata.mdx` |
| `build/manage-metadata/channel-metadata.mdx` | `build/state-and-attributes/channel-metadata.mdx` |
| `build/manage-metadata/metadata-events.mdx` | `build/state-and-attributes/metadata-events.mdx` |
| `build/setup-and-access/data-storage.mdx` | `build/state-and-attributes/data-storage.mdx` |
| `build/security-and-auth/token-generation.mdx` | `build/authentication-and-connection/token-generation.mdx` |
| `build/security-and-auth/user-authentication.mdx` | `build/authentication-and-connection/user-authentication.mdx` |
| `build/setup-and-access/private-setup.mdx` | `build/network-and-private-deployment/private-setup.mdx` |

`build/troubleshooting.mdx` 不移动。

## 重定向策略

### HTTP 状态码和实现层

本次页面迁移的真正 HTTP 301 由部署层静态重定向实现，不依赖 TanStack Router 的默认应用层 redirect。当前路由中的 `redirect({ href })` 默认产生 307，因此不能把应用层 redirect 测试当作 301 验收依据。

实现要求如下：

1. 将本次 RTM Build 页面迁移规则和历史 alias 规则加入 `vercel.base.json` 的部署层重定向源，并通过现有 Vercel 重定向生成流程生成 `vercel.json`。如果规则同时进入现有 legacy redirect 源，则同步生成相关静态重定向产物；本次规则不能只存在于运行时 TypeScript map。
2. 每条部署层规则必须使用 `statusCode: 301`，目标必须是最终新 canonical URL，不得指向另一个旧 alias 或中间路径。
3. `src/lib/zh-cn-product-ia-redirects.ts` 继续保留应用层 fallback 和路由 canonicalization；其中所有 RTM 历史 alias 的目标也必须直接指向最终新路径。`vercel.base.json` 与该 map 的 RTM 规则必须通过测试保持一致。
4. 应用层处理到同一批 redirect 时显式传递 `statusCode: 301`，用于非部署层环境和本地 server fallback，但该测试只验证应用层 redirect 的状态字段，不替代部署产物验证。
5. 测试必须同时验证：应用层 payload/redirect 的 `statusCode` 为 301，以及生成的 Vercel 配置中对应 HTTP 规则的 `statusCode` 为 301。

本次不把页面迁移规则只写入 `src/lib/zh-cn-product-ia-redirects.ts`，因为该文件本身不能保证静态部署边缘层返回 301。

### 页面级旧 URL

每一个发生目录移动的旧页面 URL 都必须产生 301 重定向到对应的新页面 URL。重定向范围只包括具体页面，不包括旧分类根路径。

例如：

```text
/zh-CN/realtime-media/rtm/build/setup-and-access/login
→ /zh-CN/realtime-media/rtm/build/authentication-and-connection/login
```

不新增以下类型的重定向：

- `/build/setup-and-access`；
- `/build/manage-channels`；
- `/build/manage-messages`；
- `/build/manage-topics`；
- `/build/manage-presence`；
- `/build/manage-metadata`；
- `/build/security-and-auth`。

这些旧分类根路径不属于本次最小必要范围。

### 旧章节锚点

`application-setup.mdx` 移动后必须保留以下已公开的精确 anchor：

```text
#servicetype
#protocol
#install
#cloud-proxy-设置
#proxy-设置
#防火墙白名单设置
```

其中 `#protocol` 当前由显式 `<a id="protocol"></a>` 提供；迁移后对上述关键 anchor 统一使用显式 `<a id="..."></a>`，避免依赖标题 slug 生成规则。兼容章节必须保留原章节标题、对应 anchor 和指向新网络配置页面的跳转说明，不得只保留模糊的兼容入口。

完整网络配置正文位于 `network-configuration.mdx`。fragment 不会发送给服务器，也不会参与 301 匹配，因此旧 URL 的 redirect 不能替代新 `application-setup.mdx` 中的兼容 anchor。

以下范围内的内部链接直接更新为新 canonical URL，且包含锚点的链接必须同时检查路径和 fragment，不能只替换目录字符串：

- `content/docs/**` 中的 MDX/Markdown 内容；
- `src/**` 中的 canonical 路径映射和路由相关代码；
- 测试文件中的路径和预期值；
- 重定向配置源及其生成结果。

历史迁移报告、审计报告和源仓库归档中的旧路径属于历史证据，不在本次批量链接更新范围内。

### 新页面

`network-configuration.mdx` 是新增页面，没有对应的旧页面 URL，因此不需要为它创建旧页面重定向。

### 历史公开 alias

旧 URL 清单必须同时覆盖当前页面路径和 `src/lib/zh-cn-product-ia-redirects.ts` 中已有的 RTM 历史 alias。实现时不得让历史 alias 先跳到旧 canonical URL，再跳到新 canonical URL；每个 alias 必须直接指向最终新路径。

本次 Build 迁移需要审查并更新以下 alias 家族：

- `/realtime-media/rtm/get-started/enable-service`；
- `/realtime-media/rtm/reference/link-state`；
- `/realtime-media/rtm/reference/metadata-events`；
- `/realtime-media/rtm/reference/presence-events`；
- `/realtime-media/rtm/reference/topic-events`；
- `/realtime-media/rtm/user-guide/channel/channel-basic`；
- `/realtime-media/rtm/user-guide/channel/channel-name`；
- `/realtime-media/rtm/user-guide/channel/message-channel`；
- `/realtime-media/rtm/user-guide/channel/stream-channel`；
- `/realtime-media/rtm/user-guide/link/link-basic`；
- `/realtime-media/rtm/user-guide/link/link-state`；
- `/realtime-media/rtm/user-guide/message/add-event-listener`；
- `/realtime-media/rtm/user-guide/message/constructed`；
- `/realtime-media/rtm/user-guide/message/history-message`；
- `/realtime-media/rtm/user-guide/message/send-message`；
- `/realtime-media/rtm/user-guide/message/serialized`；
- `/realtime-media/rtm/user-guide/presence/event`；
- `/realtime-media/rtm/user-guide/presence/presence-basic`；
- `/realtime-media/rtm/user-guide/presence/temporary-user-state`；
- `/realtime-media/rtm/user-guide/setup/application-setup`；
- `/realtime-media/rtm/user-guide/setup/data-storage`；
- `/realtime-media/rtm/user-guide/setup/login`；
- `/realtime-media/rtm/user-guide/setup/private-setup`；
- `/realtime-media/rtm/user-guide/storage/channel-metadata`；
- `/realtime-media/rtm/user-guide/storage/event`；
- `/realtime-media/rtm/user-guide/storage/user-metadata`；
- `/realtime-media/rtm/user-guide/token/token-generation`；
- `/realtime-media/rtm/user-guide/token/user-authentication`；
- `/realtime-media/rtm/user-guide/topic/event`；
- `/realtime-media/rtm/user-guide/topic/topic-basic`；
- `/realtime-media/rtm/user-guide/topic/usage`。

当前 alias map 中已经作为历史目标出现、但也可能被公开访问的中间路径必须直接收敛到最终新路径：

- `/realtime-media/rtm/build/manage-connections/link-basic`；
- `/realtime-media/rtm/build/manage-connections/link-state`；
- `/realtime-media/rtm/build/manage-messages/add-event-listener`。

Reference 中不随本次 Build 移动的 `account-and-billing`、`api-limits`、`data-security`、`feature-list`、`migration-guide`、`platform-support`、`release-notes`、`downloads` 和 `sunset-policy` alias 继续保留原目标，不纳入本次页面迁移规则。

## 导航元数据

更新 `build/meta.json`，准确表述为八个一级入口，其中七个为分类目录，`troubleshooting.mdx` 为根目录直接页面入口。按开发生命周期排列如下：

1. `rtm-initialization`
2. `authentication-and-connection`
3. `channels-and-topics`
4. `messaging`
5. `message-design-and-history`
6. `state-and-attributes`
7. `network-and-private-deployment`
8. `troubleshooting`

其中前七个入口通过目录 `meta.json` 展开；`troubleshooting` 继续作为根目录直接页面入口，不创建 `troubleshooting/meta.json`。

各级 `meta.json` 固定为以下标题、顺序和展示方式：

| 路径 | `title` | `pages` | 展示方式 |
| --- | --- | --- | --- |
| `build/meta.json` | `开发与集成` | `rtm-initialization`, `authentication-and-connection`, `channels-and-topics`, `messaging`, `message-design-and-history`, `state-and-attributes`, `network-and-private-deployment`, `troubleshooting` | 八个一级入口，按顺序展示 |
| `build/rtm-initialization/meta.json` | `RTM 初始化` | `enable-service`, `application-setup` | 直接展开 |
| `build/authentication-and-connection/meta.json` | `鉴权与连接` | `token-generation`, `user-authentication`, `login`, `link-basic`, `link-state` | 直接展开 |
| `build/channels-and-topics/meta.json` | `选择频道与 Topic` | `channel-basic`, `channel-name`, `message-channel`, `stream-channel`, `topics` | Channel 页面直接展示，Topic 作为可折叠子分类 |
| `build/channels-and-topics/topics/meta.json` | `Topic` | `topic-basic`, `usage`, `topic-events` | 子分类默认折叠 |
| `build/messaging/meta.json` | `收发消息` | `add-event-listener`, `send-message` | 直接展开 |
| `build/message-design-and-history/meta.json` | `消息设计与历史管理` | `constructed`, `serialized`, `history-message` | 直接展开 |
| `build/state-and-attributes/meta.json` | `管理状态与属性` | `presence-basic`, `temporary-user-state`, `presence-events`, `user-metadata`, `channel-metadata`, `metadata-events`, `data-storage` | 直接展开 |
| `build/network-and-private-deployment/meta.json` | `配置网络与私有化` | `network-configuration`, `private-setup` | 直接展开 |

`troubleshooting.mdx` 的文件名、位置和页面标题保持不变，由根 `build/meta.json` 直接引用。实现者不得为了统一目录形式创建 `troubleshooting/meta.json`。

`channels-and-topics/topics` 使用已有的嵌套目录机制，导航中默认折叠；不额外创建事件类型分组，也不拆分 `add-event-listener.mdx`。

## 生成文件和旧目录清理

移动完成后，旧分类目录及其中的 `meta.json` 不再作为内容源保留；如果目录为空则删除。具体包括原有的：

- `build/setup-and-access/`；
- `build/manage-channels/`；
- `build/manage-messages/`；
- `build/manage-topics/`；
- `build/manage-presence/`；
- `build/manage-metadata/`；
- `build/security-and-auth/`。

`build/troubleshooting.mdx` 不属于清理范围。

所有生成文件通过项目脚本重新生成，不手工编辑：

- `fumadocs-mdx` 生成或更新 Fumadocs 内容产物；
- `bun run docs:last-updated` 更新 `src/generated/docs-last-updated-manifest.ts`；
- `bun run legacy-redirects:generate` 更新 `vercel.json` 和 `vercel-legacy-redirects.json`；
- 如 `src/lib/zh-cn-product-ia-redirects.ts` 由 IA 迁移脚本维护，则运行对应现有脚本生成，不直接手工维护生成结果。

实现后必须检查生成文件 diff，只提交项目当前约定的 tracked 生成文件；`.source/` 等 ignored 产物不作为内容源或手工提交文件。

## 非目标

本次不做以下工作：

- 不强制把 `troubleshooting.mdx` 变成目录；
- 不为不存在的旧分类根路径创建重定向；
- 不为 User Channel 新建页面；
- 不拆分 `add-event-listener.mdx` 或其他事件类型页面；
- 不重命名现有页面文件；
- 不复制或重写已有功能正文；
- 不调整英文 RTM Build IA；
- 不新增 Lock 独立页面。

## 验收标准

实现完成后必须满足：

1. 八个一级分类按确认顺序出现在 zh-CN RTM Build sidebar 中。
2. 所有发生移动的页面都位于目标目录，原文件名不变。
3. `network-configuration.mdx` 存在于 `build/network-and-private-deployment/`，并包含从 `application-setup.mdx` 抽取的四组网络配置内容。
4. `application-setup.mdx` 仍包含安装 SDK、客户端配置、初始化 RTM 和日志设置，并保留旧网络章节锚点入口。
5. `add-event-listener.mdx` 是一个完整页面，未按事件类型拆分。
6. User Channel 没有新增页面，现有概念和发送内容仍可访问。
7. 所有移动页面的旧 URL 和已纳入清单的历史 alias 都有部署层 301 规则，并直接指向最终新页面 URL。
8. 应用层 fallback redirect 显式使用 301；应用层测试和生成的 `vercel.json` 测试分别验证各自层级的状态码。
9. 旧分类根路径没有新增重定向规则。
10. 仓库内指向旧页面路径的内部链接全部更新，包含锚点的链接可正常解析。
11. 旧 `application-setup` 网络章节的六个精确 anchor 仍存在。
12. 旧分类目录和 `meta.json` 不再作为内容源，生成的 last-updated、Fumadocs 和重定向产物与内容树一致。
13. 生成的导航、重定向产物和文档链接审计通过。

## 验证计划

实现阶段至少运行：

```text
bun run legacy-redirects:check
bun run docs:links
bun run types:check
bun run test
```

另外增加或更新针对以下行为的测试：

- zh-CN RTM Build 页面在新路径下可解析；
- 移动页面和历史 alias 的部署层规则均为 301 且不发生重定向链；
- 应用层 fallback redirect 的状态字段为 301；
- `application-setup` 的六个精确兼容 anchor 仍存在；
- 新 `network-configuration` 页面进入正确的 sidebar 分类；
- 旧分类根路径不被误加入重定向；
- `add-event-listener` 仍作为单一完整页面存在；
- 旧分类目录和 `meta.json` 已清理，`src/generated/docs-last-updated-manifest.ts` 已重新生成。
