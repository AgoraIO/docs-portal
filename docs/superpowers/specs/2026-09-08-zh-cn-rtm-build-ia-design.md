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

`application-setup.mdx` 移动后保留原有网络配置章节的锚点入口。完整网络配置正文位于 `network-configuration.mdx`，兼容章节只保留标题、说明和跳转链接。

仓库内所有内部链接直接更新为新 canonical URL；旧 URL 的兼容由 301 负责。包含锚点的内部链接必须同时检查路径和 fragment，不能只替换目录字符串。

### 新页面

`network-configuration.mdx` 是新增页面，没有对应的旧页面 URL，因此不需要为它创建旧页面重定向。

## 导航元数据

更新 `build/meta.json`，按开发生命周期排列八个入口：

1. `rtm-initialization`
2. `authentication-and-connection`
3. `channels-and-topics`
4. `messaging`
5. `message-design-and-history`
6. `state-and-attributes`
7. `network-and-private-deployment`
8. `troubleshooting`

其中前七个入口通过目录 `meta.json` 展开；`troubleshooting` 继续作为根目录直接页面入口。

各分类的 `meta.json` 必须按照实际开发任务排序，不能仅按旧文件名排序。`channels-and-topics/topics/meta.json` 继续作为 Topic 子分类的导航元数据。

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
7. 所有移动页面的旧 URL 返回 301 并指向新页面 URL。
8. 旧分类根路径没有新增重定向规则。
9. 仓库内指向旧页面路径的内部链接全部更新，包含锚点的链接可正常解析。
10. 生成的导航、重定向产物和文档链接审计通过。

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
- 移动页面的旧 URL 产生 301；
- `application-setup` 的兼容锚点仍存在；
- 新 `network-configuration` 页面进入正确的 sidebar 分类；
- 旧分类根路径不被误加入重定向；
- `add-event-listener` 仍作为单一完整页面存在。
