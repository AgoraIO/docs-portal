# 云端录制开发生命周期信息架构设计

## 背景

`content/docs/zh-CN/realtime-media/cloud-recording/build/` 当前使用“开通与接入”“实现核心功能”“配置录制模式”“管理录制文件”“优化与运维”“接收事件通知”等分类。其中文件内容与分类存在明显错位：

- `implement-core-features` 下的页面全部是 Webhook 事件参考，不是录制功能实现指南。
- `monitor-events/enable-ncs.mdx` 介绍如何开通和配置消息通知服务，与事件参考页属于同一用户任务。
- `recording-modes` 才包含单流、合流、页面录制和云端截图的启动实现。

本设计将导航改为首次集成用户能够理解的开发生命周期：

```text
开通与鉴权 → 启动录制 → 处理录制事件 → 管理录制文件 → 优化与运维
```

## 目标

- 让分类名称准确反映页面实际内容。
- 按用户接入云端录制的开发生命周期组织一级导航。
- 将 Webhook 配置和事件参考放入同一个“处理录制事件”阶段。
- 调整同一分类内的页面顺序，使其符合常见任务顺序。
- 更新受影响的内部链接，并为已发布的旧路径保留兼容性。

## 非目标

- 不重写页面正文内容。
- 不调整 `get-started`、`reference` 或 API 参考的独立信息架构。
- 不改变云端录制 API、Webhook payload 或示例代码的行为。
- 不修改英文站点的信息架构。

## 设计方案

### 一级导航

根分类仍为“开发与集成”，下方按生命周期排列：

1. 开通与鉴权
2. 启动录制
3. 处理录制事件
4. 管理录制文件
5. 优化与运维

### 1. 开通与鉴权

该阶段解决使用服务前的控制台配置、项目凭据和 RESTful API 鉴权。

| 页面 | 当前路径 | 内容职责 |
| --- | --- | --- |
| 开通云端录制服务 | `setup-and-access/enable-service` | 创建项目，获取 App ID、App 证书、Token、客户 ID 和客户密钥，并开通云端录制服务 |
| 实现 HTTP 基本认证 | `setup-and-access/http-basic-auth` | 使用客户 ID 和客户密钥生成 RESTful API 的 `Authorization` 值 |

### 2. 启动录制

将当前“配置录制模式”改为面向生命周期的“启动录制”。录制模式作为下一级任务分类。

| 子分类 | 页面 | 内容职责 |
| --- | --- | --- |
| 单流录制 | 实现单流转码录制 | 配置单流转码录制，以及开始、停止和查看录制文件 |
| 单流录制 | 设置单流不转码录制 | 配置音频不转码录制和延时混音 |
| 合流录制 | 实现合流录制 | 配置合流模式、订阅流、输出文件和存储 |
| 合流录制 | 设置合流布局 | 配置预设布局、自定义布局、背景色和背景图 |
| 页面录制 | 实现页面录制 | 录制 Web 页面，并可将页面内容推流到 CDN |
| 云端截图 | 云端截图 | 申请截图资源、配置截图周期并上传截图文件 |

推荐顺序为：单流录制、合流录制、页面录制、云端截图。每个模式内部先放主流程，再放该模式的高级配置。

### 3. 处理录制事件

将原 `implement-core-features` 分类改名为“处理录制事件”，并吸收原 `monitor-events/enable-ncs` 页面。该分类包含接收通知的入口和按服务模块划分的事件参考。

| 顺序 | 页面 | 当前路径 | 内容职责 |
| --- | --- | --- | --- |
| 1 | 接收 Webhook 事件 | `monitor-events/enable-ncs` | 开通消息通知服务、配置 Webhook、健康检查、回调格式和验签 |
| 2 | 录制服务事件 | `implement-core-features/service` | 服务错误、警告、状态变化、索引文件生成和高可用事件 |
| 3 | 录制模块事件 | `implement-core-features/status` | 录制启动、退出、切片及音视频流状态事件 |
| 4 | 上传模块事件 | `implement-core-features/uploading` | 上传启动、上传完成、备份云、上传进度和截图成功事件 |
| 5 | 页面录制事件 | `implement-core-features/webpage` | 页面录制启动、停止、能力限制、页面重载和 CDN 推流状态事件 |

使用“处理录制事件”而不是“监控录制过程”，因为这些页面不仅描述状态监控，还包括文件生成、上传完成、页面能力限制和服务错误等回调。

### 4. 管理录制文件

保留“管理录制文件”分类，调整页面为“先了解产物，再消费和加工”的顺序：

1. 录制文件介绍：文件组成、命名规则、切片、大小估算和 M3U8 文件。
2. 在线播放：使用录制文件进行在线播放。
3. 同步回放：根据时间戳同步回放录制文件。
4. 转换录制文件格式：使用脚本合并或转换录制文件格式。

### 5. 优化与运维

保留“优化与运维”分类，按照上线检查、运行监控、通用高可用、页面可靠性的顺序排列：

1. 集成检查清单
2. 监控录制状态
3. 保障 REST 服务高可用
4. 保障页面录制可靠性

## 导航和路径策略

导航展示名称应采用上述生命周期分类。实现时将 `implement-core-features` 的分类 slug 迁移为 `handle-events`，并将 `monitor-events/enable-ncs` 移动为 `handle-events/enable-ncs`。其余分类保留现有 slug，以减少无必要的 URL 变化。

如果物理移动页面导致 URL 变化，必须为下列旧路径提供重定向：

- `/zh-CN/realtime-media/cloud-recording/build/implement-core-features/service`
- `/zh-CN/realtime-media/cloud-recording/build/implement-core-features/status`
- `/zh-CN/realtime-media/cloud-recording/build/implement-core-features/uploading`
- `/zh-CN/realtime-media/cloud-recording/build/implement-core-features/webpage`
- `/zh-CN/realtime-media/cloud-recording/build/monitor-events/enable-ncs`

所有站内引用应更新到新路径。至少需要检查产品首页、`reference/ncs-events.mdx`、快速开始、截图页、同步回放页、优化与运维页面以及发布说明。

## 验收标准

- “开发与集成”下的一级分类严格按五个生命周期阶段排列。
- 页面不再显示“实现核心功能”这一不准确的分类名。
- “处理录制事件”下首先显示“接收 Webhook 事件”，随后按服务、录制、上传、页面录制顺序显示事件参考页。
- “启动录制”下包含全部录制模式和云端截图页面，且每个录制模式的主流程页面位于高级配置页面之前。
- “管理录制文件”和“优化与运维”符合本设计中的页面顺序。
- 站内链接全部指向有效页面，旧公开路径访问时不会产生 404。
- Fumadocs 生成、类型检查和相关导航测试通过。
