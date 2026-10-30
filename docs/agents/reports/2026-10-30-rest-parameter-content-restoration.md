# 中文 RESTful 参数内容恢复

用户发现“查询项目的频道列表”的“路径参数”只有标题，缺少 `appid` 及其说明。目标 YAML 保留了参数；实际渲染链在 `param.schema == null` 时跳过整项，导致名称、必填标记、说明和链接一起消失。

## 核对范围

- 目标修复前基线：docs-portal `8d226ac10`。
- 旧站来源：shengwang-doc-source `19cb036913` 的 `html-docs/**` YAML；通过迁移 manifest 的源映射匹配接口，弹幕互动使用对应 `html-docs/danmaku/RESTful/danmaku.yaml`。
- 覆盖当前已发布中文 OpenAPI 的 14 个 lane、126 个接口和 421 个参数。已退役产品不重新纳入发布。
- 对照参数定义和请求/响应属性路径；将旧的“非 200/非 2XX”与目标 `default` 响应归为同一分支。23 个初始属性差异由状态分支改名产生，规范化后没有请求/响应字段定义删除。
- 全量参数渲染测试从维护中的 YAML 渲染真实 `FumadocsOpenApiContent`，核对参数名称、必填标记和说明；同时核对鉴权说明及教程引用。具有明确 `Authorization` 参数的接口使用参数中的等价说明，不重复要求 scheme 文案逐字出现。

## 确认并修复的问题

### 8 个接口的 13 个参数未显示

| 产品 | 接口路由末段 | 恢复的参数 |
| --- | --- | --- |
| 数据洞察 | `agora-analytics/realtime-usage` | `dimension`、`dimensionValues` |
| 数据洞察 | `agora-analytics/realtime-quality` | `dimensionValues` |
| 数据洞察 | `agora-analytics/realtime-usage-top20` | `metric` |
| 输入在线媒体流 | `media-pull/update` | `playerid` |
| RTC | `rtc/query-user-status` | `appid`、`uid`、`channelName` |
| RTC | `rtc/query-user-list` | `appid`、`channelName` |
| RTC | `rtc/query-host-list` | `appid`、`channelName` |
| RTC | `rtc/query-channel-list` | `appid` |

共用参数适配器为没有 schema 的旧参数提供无约束 schema，恢复原有内容，不猜测或补写参数类型。覆盖 operation 参数、path 继承参数和 components 引用，保持原输入不变。

### 6 组来源中的 7 处鉴权教程引用被删

| 来源 | 恢复的教程 |
| --- | --- |
| 数据洞察 | RTC HTTP 基本认证 |
| 控制台 | RTC HTTP 基本认证 |
| 输入在线媒体流 | 对应产品的 HTTP 基本认证 |
| RTC 频道管理 | RTC HTTP 基本认证 |
| 云端转码 | HTTP 基本认证、HTTP HMAC 鉴权 |
| 微呼叫 | 对应产品的 HTTP 基本认证 |

在维护源 YAML 中恢复教程引导，并映射到实际存在的新站页面。HMAC 引用使用目标页现存的 `实现-http-hmac-鉴权` 标题锚点；公共 YAML 通过 `openapi:sync` 同步。

## 验证与边界

- 先以真实 RTC 查询频道列表 YAML 复现说明缺失，再验证修复后的名称、完整说明和“获取所有项目信息 API”链接。
- 全量参数与鉴权渲染覆盖，以及继承参数、组件引用和不修改输入的回归检查。
- 旧站与目标的短摘要、标点、教程命名和内容拆分存在既有编辑差异；字符串差分候选不等于内容缺失。本报告证明上述结构核对与渲染覆盖，不宣称 126 篇文档全文逐字一致。
- 本地审计脚本、完整矩阵、红绿测试日志和浏览器截图保存在 ignored `.agent/artifacts/cn-content-parity/`。
