# zh-CN RTM Build IA 调整 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 zh-CN RTM Build 文档重组为八个开发任务导向的一级入口，保留现有页面文件名，迁移旧页面 URL 和历史 alias，并确保部署层返回真实 301。

**Architecture:** 内容目录和 `meta.json` 定义新的 canonical IA；现有 MDX 页面只移动目录，`application-setup.mdx` 抽取网络配置正文到一个新页面并保留兼容 anchor。页面级 redirect 同时进入 `vercel.base.json`（部署层 301）和 `src/lib/zh-cn-product-ia-redirects.ts`（应用层 fallback），两套规则通过测试保持最终目标一致。

**Tech Stack:** Fumadocs MDX、TanStack Start/Router、Vite、Vercel redirects、TypeScript、Vitest、Bun。

---

## 文件边界

### 内容源

- Create: `content/docs/zh-CN/realtime-media/rtm/build/network-and-private-deployment/network-configuration.mdx`
- Create: 七个新分类目录的 `meta.json`，包括 `channels-and-topics/topics/meta.json`
- Modify: `content/docs/zh-CN/realtime-media/rtm/build/meta.json`
- Modify: 新位置的 `application-setup.mdx`，保留初始化内容、旧章节标题和兼容 anchor
- Move: RTM Build 页面，basename 全部保持不变
- Delete: 移动后为空的旧分类目录及其 `meta.json`
- Keep: `content/docs/zh-CN/realtime-media/rtm/build/troubleshooting.mdx` 原位置和原文件名

### 路由与 redirect

- Modify: `src/lib/docs-page.server.ts`，让 RTM 产品 IA redirect payload 携带显式 301
- Modify: `src/routes/$locale/$tab/$.tsx` 和 `src/routes/$locale/$tab/index.tsx`，消费 payload 状态码
- Modify: `src/lib/zh-cn-product-ia-redirects.ts`，让当前页面和历史 alias 直达最终新路径
- Modify: `vercel.base.json`，加入页面级迁移和历史 alias 的部署层 301
- Regenerate: `vercel.json`，使用现有 `bun run legacy-redirects:generate`
- Regenerate: `src/generated/docs-last-updated-manifest.ts`，使用 `bun run docs:last-updated`

### 测试

- Modify: `src/lib/zh-cn-product-ia-standard.test.ts`，验证页面、meta、anchor 和 alias 目标
- Modify: `src/lib/docs-page.server.test.ts`，验证应用层 redirect payload 的 301
- Modify: `src/routes/-docs-routing-guards.test.ts`，验证 loader 抛出的 redirect 状态码
- Modify: `src/lib/legacy-sitemap/vercel-redirect-artifacts.test.ts`，验证生成的 Vercel 规则
- Modify: 需要时更新 `scripts/generate-legacy-redirect-artifacts.test.ts`
- 不修改历史迁移报告、审计报告和源仓库归档

## Task 1: 先建立路径、alias 和 IA 的失败测试

**Files:**

- Modify: `src/lib/zh-cn-product-ia-standard.test.ts`
- Modify: `src/lib/docs-page.server.test.ts`
- Modify: `src/lib/legacy-sitemap/vercel-redirect-artifacts.test.ts`

- [ ] **Step 1: 建立页面移动矩阵**

在 `src/lib/zh-cn-product-ia-standard.test.ts` 中加入页面移动矩阵，覆盖所有发生移动的页面：

~~~ts
const rtmBuildPageMoves = [
  ['build/setup-and-access/enable-service', 'build/rtm-initialization/enable-service'],
  ['build/setup-and-access/application-setup', 'build/rtm-initialization/application-setup'],
  ['build/setup-and-access/add-event-listener', 'build/messaging/add-event-listener'],
  ['build/setup-and-access/login', 'build/authentication-and-connection/login'],
  ['build/setup-and-access/link-basic', 'build/authentication-and-connection/link-basic'],
  ['build/setup-and-access/link-state', 'build/authentication-and-connection/link-state'],
  ['build/setup-and-access/data-storage', 'build/state-and-attributes/data-storage'],
  ['build/setup-and-access/private-setup', 'build/network-and-private-deployment/private-setup'],
  ['build/manage-channels/channel-basic', 'build/channels-and-topics/channel-basic'],
  ['build/manage-channels/channel-name', 'build/channels-and-topics/channel-name'],
  ['build/manage-channels/message-channel', 'build/channels-and-topics/message-channel'],
  ['build/manage-channels/stream-channel', 'build/channels-and-topics/stream-channel'],
  ['build/manage-messages/send-message', 'build/messaging/send-message'],
  ['build/manage-messages/constructed', 'build/message-design-and-history/constructed'],
  ['build/manage-messages/serialized', 'build/message-design-and-history/serialized'],
  ['build/manage-messages/history-message', 'build/message-design-and-history/history-message'],
  ['build/manage-topics/topic-basic', 'build/channels-and-topics/topics/topic-basic'],
  ['build/manage-topics/usage', 'build/channels-and-topics/topics/usage'],
  ['build/manage-topics/topic-events', 'build/channels-and-topics/topics/topic-events'],
  ['build/manage-presence/presence-basic', 'build/state-and-attributes/presence-basic'],
  ['build/manage-presence/temporary-user-state', 'build/state-and-attributes/temporary-user-state'],
  ['build/manage-presence/presence-events', 'build/state-and-attributes/presence-events'],
  ['build/manage-metadata/user-metadata', 'build/state-and-attributes/user-metadata'],
  ['build/manage-metadata/channel-metadata', 'build/state-and-attributes/channel-metadata'],
  ['build/manage-metadata/metadata-events', 'build/state-and-attributes/metadata-events'],
  ['build/security-and-auth/token-generation', 'build/authentication-and-connection/token-generation'],
  ['build/security-and-auth/user-authentication', 'build/authentication-and-connection/user-authentication'],
] as const;
~~~

使用现有路径解析 helper 检查目标文件存在、旧内容源路径不存在，并让页面矩阵成为后续 redirect 测试的共同预期。

- [ ] **Step 2: 覆盖历史 alias 家族**

覆盖 `src/lib/zh-cn-product-ia-redirects.ts` 中以下 RTM alias：

- `realtime-media/rtm/get-started/enable-service`
- `realtime-media/rtm/reference/link-state`
- `realtime-media/rtm/reference/metadata-events`
- `realtime-media/rtm/reference/presence-events`
- `realtime-media/rtm/reference/topic-events`
- `realtime-media/rtm/user-guide/channel/*`
- `realtime-media/rtm/user-guide/link/*`
- `realtime-media/rtm/user-guide/message/*`
- `realtime-media/rtm/user-guide/presence/*`
- `realtime-media/rtm/user-guide/setup/application-setup`
- `realtime-media/rtm/user-guide/setup/data-storage`
- `realtime-media/rtm/user-guide/setup/login`
- `realtime-media/rtm/user-guide/setup/private-setup`
- `realtime-media/rtm/user-guide/storage/*`
- `realtime-media/rtm/user-guide/token/*`
- `realtime-media/rtm/user-guide/topic/*`

同时覆盖已经作为旧目标出现的中间路径：

~~~text
/zh-CN/realtime-media/rtm/build/manage-connections/link-basic
/zh-CN/realtime-media/rtm/build/manage-connections/link-state
/zh-CN/realtime-media/rtm/build/manage-messages/add-event-listener
~~~

测试要求最终 target 不再包含 `setup-and-access`、`manage-channels`、`manage-messages`、`manage-topics`、`manage-presence`、`manage-metadata`、`manage-connections` 或 `security-and-auth`。

- [ ] **Step 3: 加入 meta 和 anchor 断言**

断言根 `build/meta.json` 的页面顺序：

~~~ts
expect(readMeta(buildMetaPath).pages).toEqual([
  'rtm-initialization',
  'authentication-and-connection',
  'channels-and-topics',
  'messaging',
  'message-design-and-history',
  'state-and-attributes',
  'network-and-private-deployment',
  'troubleshooting',
]);
~~~

读取新的 `application-setup.mdx`，断言存在 `servicetype`、`protocol`、`install`、`cloud-proxy-设置`、`proxy-设置`、`防火墙白名单设置` 六个 ID；读取新的 `network-configuration.mdx`，断言四个网络章节标题存在且顺序正确。

- [ ] **Step 4: 运行 focused tests，确认失败原因是缺少目标结构**

Run:

~~~bash
PATH="/Users/yejiayi/.bun/bin:$PATH" /Users/yejiayi/.bun/bin/bun run test -- src/lib/zh-cn-product-ia-standard.test.ts src/lib/docs-page.server.test.ts src/lib/legacy-sitemap/vercel-redirect-artifacts.test.ts
~~~

Expected: 失败集中在目标内容、meta、anchor、redirect target 或状态码尚未建立；不得出现测试语法错误或依赖安装错误。

## Task 2: 移动内容并创建网络配置页面

**Files:**

- Move: `content/docs/zh-CN/realtime-media/rtm/build/**` 中的页面，按 Task 1 矩阵执行
- Create: `content/docs/zh-CN/realtime-media/rtm/build/network-and-private-deployment/network-configuration.mdx`
- Modify: 新位置的 `application-setup.mdx`

- [ ] **Step 1: 创建目标目录并使用 git mv 移动页面**

保留 basename，只改变父目录。至少执行：

~~~bash
mkdir -p content/docs/zh-CN/realtime-media/rtm/build/{rtm-initialization,authentication-and-connection,channels-and-topics/topics,messaging,message-design-and-history,state-and-attributes,network-and-private-deployment}

git mv content/docs/zh-CN/realtime-media/rtm/build/setup-and-access/enable-service.mdx content/docs/zh-CN/realtime-media/rtm/build/rtm-initialization/enable-service.mdx
git mv content/docs/zh-CN/realtime-media/rtm/build/setup-and-access/application-setup.mdx content/docs/zh-CN/realtime-media/rtm/build/rtm-initialization/application-setup.mdx
git mv content/docs/zh-CN/realtime-media/rtm/build/setup-and-access/add-event-listener.mdx content/docs/zh-CN/realtime-media/rtm/build/messaging/add-event-listener.mdx
git mv content/docs/zh-CN/realtime-media/rtm/build/setup-and-access/login.mdx content/docs/zh-CN/realtime-media/rtm/build/authentication-and-connection/login.mdx
git mv content/docs/zh-CN/realtime-media/rtm/build/setup-and-access/link-basic.mdx content/docs/zh-CN/realtime-media/rtm/build/authentication-and-connection/link-basic.mdx
git mv content/docs/zh-CN/realtime-media/rtm/build/setup-and-access/link-state.mdx content/docs/zh-CN/realtime-media/rtm/build/authentication-and-connection/link-state.mdx
~~~

继续按矩阵移动其他 Channel、Message、Topic、Presence、Metadata 和 Private Setup 页面。不要移动 `build/troubleshooting.mdx)，不要创建 `user-channel.mdx)，不要拆分 `add-event-listener.mdx)。

- [ ] **Step 2: 抽取网络配置正文**

从新的 `application-setup.mdx` 中移出以下四个完整章节：

~~~text
连接协议配置
Cloud Proxy 设置
Proxy 设置
防火墙白名单设置
~~~

创建 `network-configuration.mdx`，保留四个章节的原始顺序、平台结构、代码 tab、代码示例和正文语义。只移动内容，不重写或合并不同平台示例。

新文件 frontmatter：

~~~mdx
---
title: "网络配置"
description: "了解实时消息 RTM 的连接协议、代理和防火墙配置。"
---
~~~

- [ ] **Step 3: 保留 application-setup 的兼容章节和精确 ID**

在新的 `application-setup.mdx` 中保留初始化正文，并在原网络章节位置保留兼容标题、显式 anchor 和跳转说明：

~~~mdx
<a id="servicetype"></a>
<a id="protocol"></a>
<a id="install"></a>
<a id="cloud-proxy-设置"></a>
<a id="proxy-设置"></a>
<a id="防火墙白名单设置"></a>
~~~

兼容章节只保留原标题和指向 `network-configuration` 对应章节的链接，不重复完整网络正文。Fragment 不会进入服务器 redirect，因此这些 ID 必须存在于新的页面中。

- [ ] **Step 4: 清理旧目录**

确认页面全部移动后，删除以下旧目录及其 `meta.json`：

~~~text
build/setup-and-access/
build/manage-channels/
build/manage-messages/
build/manage-topics/
build/manage-presence/
build/manage-metadata/
build/security-and-auth/
~~~

保留 `build/troubleshooting.mdx`。

- [ ] **Step 5: 运行 MDX 语法检查**

Run:

~~~bash
PATH="/Users/yejiayi/.bun/bin:$PATH" /Users/yejiayi/.bun/bin/bun x fumadocs-mdx
~~~

Expected: 输出 `[MDX] generated files`，没有 MDX 解析错误。

## Task 3: 更新导航 meta.json

**Files:**

- Modify: `content/docs/zh-CN/realtime-media/rtm/build/meta.json`
- Create: 七个分类目录和 Topic 子目录的 `meta.json`

- [ ] **Step 1: 写入根 meta.json**

~~~json
{
  "title": "开发与集成",
  "pages": [
    "rtm-initialization",
    "authentication-and-connection",
    "channels-and-topics",
    "messaging",
    "message-design-and-history",
    "state-and-attributes",
    "network-and-private-deployment",
    "troubleshooting"
  ]
}
~~~

根目录包含八个一级入口：前七个是分类目录，`troubleshooting` 是根目录直接页面，不创建 `troubleshooting/meta.json)。

- [ ] **Step 2: 写入所有分类 meta.json**

使用以下固定标题和页面顺序：

`rtm-initialization/meta.json`：

~~~json
{
  "title": "RTM 初始化",
  "pages": ["enable-service", "application-setup"]
}
~~~

`authentication-and-connection/meta.json`：

~~~json
{
  "title": "鉴权与连接",
  "pages": ["token-generation", "user-authentication", "login", "link-basic", "link-state"]
}
~~~

`channels-and-topics/meta.json`：

~~~json
{
  "title": "选择频道与 Topic",
  "pages": ["channel-basic", "channel-name", "message-channel", "stream-channel", "topics"]
}
~~~

`channels-and-topics/topics/meta.json`：

~~~json
{
  "title": "Topic",
  "pages": ["topic-basic", "usage", "topic-events"]
}
~~~

`messaging/meta.json`：

~~~json
{
  "title": "收发消息",
  "pages": ["add-event-listener", "send-message"]
}
~~~

`message-design-and-history/meta.json`：

~~~json
{
  "title": "消息设计与历史管理",
  "pages": ["constructed", "serialized", "history-message"]
}
~~~

`state-and-attributes/meta.json`：

~~~json
{
  "title": "管理状态与属性",
  "pages": [
    "presence-basic",
    "temporary-user-state",
    "presence-events",
    "user-metadata",
    "channel-metadata",
    "metadata-events",
    "data-storage"
  ]
}
~~~

`network-and-private-deployment/meta.json`：

~~~json
{
  "title": "配置网络与私有化",
  "pages": ["network-configuration", "private-setup"]
}
~~~

Topic 使用嵌套目录作为可折叠子分类；不新增事件类型分组。

- [ ] **Step 3: 运行 IA focused test**

Run:

~~~bash
PATH="/Users/yejiayi/.bun/bin:$PATH" /Users/yejiayi/.bun/bin/bun run test -- src/lib/zh-cn-product-ia-standard.test.ts
~~~

Expected: 页面存在性、meta 顺序、Topic 嵌套和 anchor 断言通过。

## Task 4: 更新应用层 canonical map 和 301 fallback

**Files:**

- Modify: `src/lib/zh-cn-product-ia-redirects.ts`
- Modify: `src/lib/docs-page.server.ts`
- Modify: `src/routes/$locale/$tab/$.tsx`
- Modify: `src/routes/$locale/$tab/index.tsx`
- Modify: `src/lib/docs-page.server.test.ts`
- Modify: `src/routes/-docs-routing-guards.test.ts`

- [ ] **Step 1: 更新当前页面移动 map**

将 Task 1 页面矩阵中的旧页面路径写入应用层 map，目标全部使用新目录。例如：

~~~ts
'realtime-media/rtm/build/setup-and-access/login':
  '/zh-CN/realtime-media/rtm/build/authentication-and-connection/login',
'realtime-media/rtm/build/manage-messages/send-message':
  '/zh-CN/realtime-media/rtm/build/messaging/send-message',
~~~

不为旧分类根路径添加 map entry，不为新 `network-configuration` 添加旧页面 redirect。

- [ ] **Step 2: 更新历史 alias 的直接目标**

例如：

~~~ts
'realtime-media/rtm/user-guide/link/link-state':
  '/zh-CN/realtime-media/rtm/build/authentication-and-connection/link-state',
'realtime-media/rtm/reference/metadata-events':
  '/zh-CN/realtime-media/rtm/build/state-and-attributes/metadata-events',
'realtime-media/rtm/user-guide/message/add-event-listener':
  '/zh-CN/realtime-media/rtm/build/messaging/add-event-listener',
~~~

将 `manage-connections/*` 和 `manage-messages/add-event-listener` 作为历史入口直接收敛到最终路径。若该 map 由 `scripts/zh-cn-product-ia-migrate.mjs` 生成，先确认其输入和输出范围，再使用现有脚本或最小的受控生成修改；不得重生成无关产品的 IA redirect。

- [ ] **Step 3: 扩展 redirect payload 状态字段**

在 `src/lib/docs-page.server.ts` 中将类型扩展为：

~~~ts
export type DocsRedirectPayload = {
  preserveSearch?: boolean;
  redirectUrl: string;
  statusCode?: 301 | 307 | 308;
};
~~~

只有 `resolveZhCnProductIaRedirect` 命中时返回 `statusCode: 301)；其他既有 redirect 分支不改变现有状态语义。

- [ ] **Step 4: 让两个 page loader 消费 payload 状态码**

在 `src/routes/$locale/$tab/$.tsx` 和 `src/routes/$locale/$tab/index.tsx` 处理 `redirectUrl` 时使用：

~~~ts
throw redirect({
  href: preserveRedirectSearch(redirectUrl, location, preserveSearch),
  statusCode: payload.statusCode ?? 307,
});
~~~

保留既有 `preserveSearch` 行为；不带状态字段的既有 payload 仍使用应用层 307 fallback。

- [ ] **Step 5: 更新应用层测试**

在 `src/lib/docs-page.server.test.ts` 中调用：

~~~ts
const result = await loadDocsPagePayload(
  'zh-CN',
  'realtime-media',
  ['rtm', 'build', 'setup-and-access', 'login'],
);

expect(result).toEqual({
  redirectUrl:
    '/zh-CN/realtime-media/rtm/build/authentication-and-connection/login',
  statusCode: 301,
});
~~~

路由 loader 测试同时断言抛出的 redirect 的 `options.statusCode` 和 `status` 为 301。应用层测试只验证应用 redirect 状态，不宣称验证部署层 HTTP 状态。

## Task 5: 建立部署层 301 和无链条规则

**Files:**

- Modify: `vercel.base.json`
- Regenerate: `vercel.json`
- Modify: `src/lib/legacy-sitemap/vercel-redirect-artifacts.test.ts`

- [ ] **Step 1: 将页面和历史 alias 加入 vercel.base.json**

每条规则使用：

~~~json
{
  "source": "/zh-CN/realtime-media/rtm/build/setup-and-access/login",
  "destination": "/zh-CN/realtime-media/rtm/build/authentication-and-connection/login",
  "statusCode": 301
}
~~~

为页面移动矩阵和历史 alias 添加部署规则。不要添加旧分类根路径；不要让 destination 包含任何旧目录。

- [ ] **Step 2: 验证 Vercel 规则和应用 map 一致**

在 `src/lib/legacy-sitemap/vercel-redirect-artifacts.test.ts` 中读取 `vercel.json)，筛选 `/zh-CN/realtime-media/rtm/` 规则并断言：

~~~ts
expect(rule.statusCode).toBe(301);
expect(rule.destination).not.toMatch(
  /\/build\/(setup-and-access|manage-channels|manage-messages|manage-topics|manage-presence|manage-metadata|manage-connections|security-and-auth)(\/|$)/,
);
~~~

同时比较部署规则和应用 map 的 source/destination 集合，确保两层目标一致且没有 alias chain。

- [ ] **Step 3: 生成 Vercel 产物**

Run:

~~~bash
PATH="/Users/yejiayi/.bun/bin:$PATH" /Users/yejiayi/.bun/bin/bun run legacy-redirects:generate
~~~

Expected: `vercel.json` 包含所有新增 301 规则；不直接编辑生成的 `vercel.json)。

- [ ] **Step 4: 运行部署 artifact 测试**

Run:

~~~bash
PATH="/Users/yejiayi/.bun/bin:$PATH" /Users/yejiayi/.bun/bin/bun run test -- src/lib/legacy-sitemap/vercel-redirect-artifacts.test.ts
~~~

Expected: RTM 页面和历史 alias 的 Vercel 规则均为 301，并直接指向新 canonical 页面。

## Task 6: 更新内部链接和兼容 anchor 引用

**Files:**

- Modify: `content/docs/**) 中指向 RTM Build 旧页面的 MDX/Markdown
- Modify: `src/**) 中的 canonical 路径映射和测试预期
- Modify: 受本次移动影响的 redirect 配置源和生成结果
- Keep unchanged: 历史迁移报告、审计报告和源仓库归档

- [ ] **Step 1: 收集目标范围内的旧路径引用**

Run:

~~~bash
rg -n 'realtime-media/rtm/(build/(setup-and-access|manage-channels|manage-messages|manage-topics|manage-presence|manage-metadata|security-and-auth|manage-connections)|user-guide|reference/(link-state|metadata-events|presence-events|topic-events))' content/docs src scripts -g '*.md' -g '*.mdx' -g '*.ts' -g '*.tsx' -g '*.mjs' -g '*.json'
~~~

排除 `docs/agents/reports/`、迁移报告和源仓库归档；不要修改历史证据。

- [ ] **Step 2: 更新内部链接到最终 canonical URL**

更新内容、源码映射和测试中的页面路径。包含 fragment 的链接同时更新路径和 fragment：

- `application-setup#防火墙白名单设置` 保持指向新的 application setup 兼容 anchor；
- 完整网络配置链接改为 `network-and-private-deployment/network-configuration)；
- Topic、Presence、Metadata 事件链接分别指向移动后的页面。

- [ ] **Step 3: 检查旧 canonical 链接已清除**

Run:

~~~bash
rg -n 'realtime-media/rtm/build/(setup-and-access|manage-channels|manage-messages|manage-topics|manage-presence|manage-metadata|security-and-auth|manage-connections)' content/docs src -g '*.md' -g '*.mdx' -g '*.ts' -g '*.tsx'
~~~

Expected: 不返回本次迁移范围内的 canonical 内部链接。历史 redirect map 的 source key 不属于此检查；其 destination 必须已经是新路径。

## Task 7: 重新生成内容和导航产物

**Files:**

- Regenerate: `.source/`，不提交 ignored 文件
- Regenerate: `src/generated/docs-last-updated-manifest.ts`
- Regenerate: `vercel.json) 及必要 redirect artifacts

- [ ] **Step 1: 生成 Fumadocs 内容产物**

Run:

~~~bash
PATH="/Users/yejiayi/.bun/bin:$PATH" /Users/yejiayi/.bun/bin/bun x fumadocs-mdx
~~~

Expected: 新目录页面可被 source 发现，没有 MDX 编译错误。

- [ ] **Step 2: 生成 last-updated manifest**

Run:

~~~bash
PATH="/Users/yejiayi/.bun/bin:$PATH" /Users/yejiayi/.bun/bin/bun run docs:last-updated
~~~

Expected: `src/generated/docs-last-updated-manifest.ts` 不再包含旧内容源路径，并包含新 canonical 内容路径。

- [ ] **Step 3: 检查生成 diff**

Run:

~~~bash
git status --short
git diff --check
git diff -- src/generated/docs-last-updated-manifest.ts vercel.json vercel-legacy-redirects.json
~~~

Expected: 只出现由本次内容移动、redirect 和生成时间清单导致的 diff；`.source/` 和 `node_modules/` 不作为提交内容。

## Task 8: 完整验证和提交

**Files:**

- Verify: 所有内容、meta、redirect、源码、测试和生成文件

- [ ] **Step 1: 运行 focused tests**

Run:

~~~bash
PATH="/Users/yejiayi/.bun/bin:$PATH" /Users/yejiayi/.bun/bin/bun run test -- src/lib/zh-cn-product-ia-standard.test.ts src/lib/docs-page.server.test.ts src/routes/-docs-routing-guards.test.ts src/lib/legacy-sitemap/vercel-redirect-artifacts.test.ts
~~~

Expected: IA、anchor、应用层 301 和 Vercel 301 断言通过。

- [ ] **Step 2: 运行文档链接审计**

Run:

~~~bash
PATH="/Users/yejiayi/.bun/bin:$PATH" /Users/yejiayi/.bun/bin/bun run docs:links
~~~

Expected: 本次迁移引入的内部链接没有 missing path 或 missing hash anchor。若出现基线既有问题，按来源记录，不修改无关历史报告。

- [ ] **Step 3: 运行类型检查**

Run:

~~~bash
PATH="/Users/yejiayi/.bun/bin:$PATH" /Users/yejiayi/.bun/bin/bun run types:check
~~~

Expected: Fumadocs 生成完成，TypeScript 无新增错误。

- [ ] **Step 4: 运行完整测试**

Run:

~~~bash
PATH="/Users/yejiayi/.bun/bin:$PATH" /Users/yejiayi/.bun/bin/bun run test
~~~

Expected: 不出现本次 IA 调整新增的失败；基线既有失败与本次 diff 分开记录。

- [ ] **Step 5: 验证 redirect artifacts 和工作树**

Run:

~~~bash
PATH="/Users/yejiayi/.bun/bin:$PATH" /Users/yejiayi/.bun/bin/bun run legacy-redirects:check
git diff --check
git status --short --branch
~~~

Expected: redirect artifacts check 通过，没有旧分类目录残留、未预期 alias chain 或未跟踪生成物。

- [ ] **Step 6: 分阶段提交**

内容和生成清单先提交：

~~~bash
git add content/docs/zh-CN/realtime-media/rtm/build src/generated/docs-last-updated-manifest.ts
git commit -m "docs: reorganize zh-CN RTM build IA"
~~~

redirect、路由 fallback、测试和 Vercel 配置再提交：

~~~bash
git add src/lib/docs-page.server.ts 'src/routes/$locale/$tab/$.tsx' 'src/routes/$locale/$tab/index.tsx' src/lib/zh-cn-product-ia-redirects.ts vercel.base.json vercel.json vercel-legacy-redirects.json src/lib/zh-cn-product-ia-standard.test.ts src/lib/docs-page.server.test.ts src/routes/-docs-routing-guards.test.ts src/lib/legacy-sitemap/vercel-redirect-artifacts.test.ts
git commit -m "fix: preserve RTM build redirects after IA move"
~~~

如果生成文件使两个提交无法保持独立，使用一个 scoped commit，但提交信息仍只描述本次 RTM Build IA 调整。

## 计划自检

- Spec 的八个一级入口、页面归属、文件移动、新网络配置页、旧 anchor、历史 alias、页面级 301、旧目录清理、生成文件和非目标均有对应任务。
- `troubleshooting.mdx` 不目录化，User Channel 不新增页面，`add-event-listener.mdx` 不拆分，现有文件 basename 不重命名。
- 部署层以 `vercel.base.json` 和生成的 `vercel.json` 为 301 权威来源，应用层只提供显式 301 fallback。
- 历史 alias 直接指向最终新路径，禁止旧 canonical → 新 canonical 的二次跳转。
- 内部链接更新范围排除了历史迁移和审计证据。
- 计划没有使用未完成标记或未定义的实现名称。
