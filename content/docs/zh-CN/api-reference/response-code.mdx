---
title: 响应状态码
description: 在调用声网对话式 AI 引擎 RESTful API 过程中，你可能收到如下 HTTP 状态码：
---

# 响应状态码

在调用声网对话式 AI 引擎 RESTful API 过程中，你可能收到如下 HTTP 状态码：

- 如果状态码为 `200` 表示请求成功。

- 如果状态码不为 `200` 则请求失败。响应包体中包含 `detail` 或 `reason` 字段描述失败具体原因。

例如，请求失败时，你可能收到如下响应：

```json
/// 状态码为 400 请求参数异常
{
    "detail": "create agent failed, code: 400, msg: properties: channel not found",
    "reason": "InvalidRequest"
}
```

下面展示请求失败时所有可能的 HTTP 响应状态码、描述和建议措施：

| 响应状态码 | 描述                    | 建议措施                                                     |
| :----- | :---------------------- | :----------------------------------------------------------- |
| 400    | 请求参数异常            | 针对 `detail` 字段提示进行检查。                                |
| 403    | 未授权访问              | [联系技术支持](https://ticket.shengwang.cn/)开通服务。                                                     |
| 404    | Agent 未找到或者已经销毁 | 确认任务是否启动成功或者已经退出。                             |
| 409    | Agent 冲突               | 使用已启动的 `agent_id` ID 进行后续更新、查询、删除操作。 |
| 422    | 访问超限                | [联系技术支持](https://ticket.shengwang.cn/)提升配额。                                                 |
| 502    | 网关异常                | [联系技术支持](https://ticket.shengwang.cn/)。                                                 |
| 503    | Agent 启动错误           | 使用退避策略重试。                                             |
| 504    | 超时异常                | 使用退避策略重试。                                             |

下面展示请求失败时所有可能的 `reason` 值和描述，可结合状态码与 `detail` 字段排查问题：

| `reason`                 | 描述                                                         |
| :------------------------- | :----------------------------------------------------------- |
| `InternalError`              | 服务端内部错误。                                             |
| `InvalidPermission`          | 未开通服务。                                                 |
| `InvalidRequest`             | 请求参数异常。                                               |
| `ResourceQuotaLimitExceeded` | 并发请求过多，超出配额限制。                                 |
| `ServiceUnavailable`         | 服务端内部错误。                                             |
| `TaskConflict`               | 已存在相同名称的智能体。                                     |
| `TaskNotFound`               | 并未成功启动智能体、或者启动智能体后中途退出、或者已经销毁智能体。 |
| `TaskOperationTimeout`       | 服务端内部错误。                                             |
| `NotImplemented`             | 服务端内部错误。                                             |
