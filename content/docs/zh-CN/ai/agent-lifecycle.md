---
title: Agent lifecycle
description: 从创建、启动、更新、打断、查询到停止，梳理智能体会话生命周期中最重要的控制动作。
---

## 生命周期为什么重要

在 AI 智能体产品里，是否能稳定控制智能体的启动、更新、停止和恢复，通常比“模型回答得是否更聪明”更早成为真实问题。

## 生命周期的关键动作

- 创建并启动智能体
- 查询当前状态
- 更新配置
- 主动打断
- 停止并退出频道

## 当前仓库里的对应文档

- [Create and start an agent](/zh-CN/api-reference/start-agent)
- [Monitor status](/zh-CN/api-reference/query-agent-status)
- [Handle interruption](/zh-CN/ai/interrupt-agent)
- [Stop an agent](/zh-CN/api-reference/stop-agent)
- [Get agent list](/zh-CN/api-reference/get-agent-list)

## 推荐设计原则

### 把生命周期控制放在后端

创建、更新、停止和权限控制最好由后端统一处理，而不是散在各个客户端里。

### 用事件确认状态，而不是只看请求返回

请求成功并不等于运行状态已经稳定，生产环境里应结合回调和事件一起判断。
