# 源 #2067 RTM Web 2.3 完整补齐计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. 隔离TDD、spec后quality；重型门禁主控串行。

**Goal:** 补齐23源文件的中文有效遗漏和2.2.4 archive入口，不回退#2069小程序或终点后续增强。

**Architecture:** 沿现有Web MDX、平台块和版本href；保留两份可路由聚合API副本，不加运行时组件。Web Presence基础模式之上附加2.3.0大频道优化，小程序只保留基础模式。

**Tech Stack:** Markdown/MDX、meta JSON、Vitest、下载数据与本批迁移控制记录。

源`c8472ac50360d3ed02993fd87ae112ca45c00e2d`，终点`5d03551cf64cd057ccfe8d5b256d9c4778e8fbb1`；目标`7c6c60ead44406e69906c5c3808cd489784aa89e`。树`fix-hotfix-pr2067`，分支`codex/fix-hotfix-pr2067`。只读源Git，不读源工作区/env。

## 精确生产写集：19文件

`C=content/docs/zh-CN`，`R=C/realtime-media/rtm`，`A=C/api-reference/rtm`。

| 文件 | 有效补齐 |
| --- | --- |
| A/web/meta.json | navScope current2.3.0 path="."和历史2.2.4 href，九当前pages不变，不搬目录 |
| A/web/configuration.mdx | 下载2.3.0、cloudProxy说明、7事件、去status、Presence interval/totalOccupancy/完整五字段表、removeEventListener linkState |
| A/toc-configuration/configuration.mdx | 仅JS平台重复副本同样补齐，HarmonyOS及其它平台不改 |
| A/web/channel.mdx | subscribe三断线态缓存/Presence异步加入，unsubscribe取消-11040/完成取消/迟到消息屏蔽 |
| A/toc-channel/channel.mdx | JS重复副本同上，不改其它平台 |
| A/web/enumv.mdx | 删除旧connectionreason/connectionstate正文，保留新linkstate/linkstatereason与必要旧fragment兼容，不当成当前仍支持旧枚举 |
| C/reference/faq/integration/rtm2_integration_issue.mdx | 仅删源已删除的第三个旧Presence workaround及waitPresenceReady，保留前两问/文件/导航 |
| R/get-started/quick-start.mdx | Web下载、两套完整status→linkState例与总结，不碰mini块 |
| R/build/messaging/add-event-listener.mdx | Web删除status，完整linkState八字段及注释 |
| R/build/authentication-and-connection/user-authentication.mdx | Web两个Token示例status→linkState，八字段，不碰mini |
| R/build/channels-and-topics/message-channel.mdx | Web专属三段缓存订阅/Presence异步/取消-11040，不能套全平台 |
| R/build/state-and-attributes/presence-basic.mdx | Web登录后whoNow/whereNow/远端getState自动等待及正常失败条件，无固定延迟/临时频道workaround |
| R/build/state-and-attributes/presence-events.mdx | Web完整基础Announce/Interval+[8,128]，追加2.3.0默认512优化与totalOccupancy；mini绝不附加512 |
| R/build/state-and-attributes/temporary-user-state.mdx | Web登录后远端getState自动等待及异步失败，不复制原生512查询额外句 |
| R/build/rtm-initialization/application-setup.mdx | JS共享下载2.3.0；保留已有cloudProxy跳转 |
| R/build/network-and-private-deployment/network-configuration.mdx | 真正Cloud Proxy正文：不再自动回退、初始化true、建议用户可选开关 |
| R/build/troubleshooting.mdx | 仅Web加-10027/RTM_ERROR_DUPLICATE_USER_ID与-11040/RTM_ERROR_CHANNEL_SUBSCRIBE_CANCELED及完整原因/处理 |
| R/reference/sunset-policy.mdx | JavaScript表新增2.3.0、2026-08-10、2029-08-11或2.5.x发布起一年先到为准 |
| src/components/docs-overview/sdk-downloads-data.zh-cn.ts | Web RTM头插2.3.0 ZIP/MD5/date/包名，两个2.2.4均去最新但保留 |

准备报告曾称18，逐行复点实际19（含troubleshooting）；以上名单是写集约束。

## Task 1：控制映射及先RED

- [ ] frozen install，不改lock；先既有轻量导航/下载回归。15中文内容源的相关filemap/path-map/ledger记录按真实canonical目标修正；聚合副本/拆出network作为二次消费者记入本批source→target证据，不制造重复source key或新页面。English四源、metadata no-redirect、homepage ignore、shared snippet非页面的处置不改。只改本批源key，不全表重排；先in_progress/pending，内容后completed/audit ready，独立审查前不写pass。
- [ ] 新建`src/lib/rtm-pr2067-sync.test.ts`，逐Web块、API小节、Slot、错误表检查上表，先实际缺失RED；章节起止存在/顺序/唯一必须fail-loud。API两个聚合副本各自断言，不能从别的平台或canonical命中即过。
- [ ] 按需补`ProductSdkDownloads.test.tsx`和`SdksCatalog.test.tsx`真实中文Web signaling消费者，先RED最新2.3.0/ZIP/MD5/date，不弱化旧平台/英文断言。

## Task 2：最小内容补齐

- [ ] 用冻结源逐有效hunk静态展开，不抄legacy JSX/import/全页覆盖。四JS下载展开为quick-start、application-setup、web/configuration、toc-configuration JS，不能漏任一或升级Native/RN。
- [ ] `linkState`八字段：currentState、previousState、serviceType、operation、reason、affectedChannels、timestamp、isResumed。事件总数7，保留其余六类及新linkState；`PresenceEvent.interval`类型IntervalDetail|null，仅INTERVAL有值，五字段join/leave/timeout/userStateList/totalOccupancy及总人数不受512明细上限/可能短暂延迟都需保留。
- [ ] 归档项如下，主控已HTTP200并浏览器确认2.2.4身份：

```json
{"id":"current","label":"v2.3.0","path":"."}
```

```json
{"id":"2.2.4","label":"v2.2.4","path":"2.2.4","href":"https://doc-archive.shengwang.cn/archive/0.0.492/api-ref/rtm2/javascript/toc-configuration/configuration"}
```

- [ ] latest数据只头插Web signaling对象：下载`https://download.agora.io/rtm2/release/Agora_RTM_JavaScript_SDK_for_Web_v2.3.0.zip`，MD5`13f63c0322c49b1edd3f7a0e2c8c89fc`，包名agora-rtm，日期2026年8月10日；保留原两个2.2.4及全部历史。实际URL以冻结源字符串再核，禁止猜其它包。此处按固定源勘误原计划中的下载host，实施已使用正确URL。
- [ ] 发版Web日期8月18日与下载/退休表8月10日是源不同字段，不统一。release-notes已含全部终点增强，不写；sourceToken例中旧addEventlistener拼写和更早共享占位债不夹改。
- [ ] FAQ第三问确实源删除，移除该小节/临时随机频道方案，前两问及frontmatter逐字保持。旧enum正文删后检查入站fragment：保留必要connectionstate/connectionreason别名到新的相应linkState/linkStateReason语义位置，或明确历史入口说明；不能让旧hash指向错误成员、不能把旧枚举继续列为当前契约。

## Presence交叠的已核实解释与组合要求

源#2067先让Web进入完整512说明；#2069又将Web加回基础分支但未移出前者，造成基础段落重复。实际完整分支明确“在现有事件通知模式基础上增加大频道优化”：不是用512替代[8,128]。因此目标只保留一份Web块，基础段落去重后完整承接所有新增行为；mini只基础模式。无需猜测服务行为或要求用户再做SDK事实选择。

独立#1229的Web块目前仅基础模式；组合应合并成一份完整Web块，并保留mini基础块。其旧测试若断言Web不含512，由主控单独把负向范围收窄到mini，不改mini保护。实现者不在本分支夹带不存在的#1229测试文件或mini新卡/数据。

## Task 3：验证和交付

- [ ] 定向GREEN、types、所有改动MDX完整body编译及语法与基线对比、scoped links/旧新fragment、TS/tests Biome、源外/其它平台/旧下载保护。纯转换器固定Git输入，不跑脏源全局生成器。
- [ ] 本批完整23源分类/共享闭包、状态及已覆盖证据写`docs/agents/reports/2026-10-20-hotfix-pr2067-fix.md`和小型机器证据；三控制CSV仅本批相关key、审查前audit ready/pending。
- [ ] 本地提交READY_WITHOUT_FULL，不push/PR，不自行full/build/preview。root后续独占full、spec→quality、版本下拉/下载/Presence/跨#1229组合UI与全量；未合入不称线上生效。
