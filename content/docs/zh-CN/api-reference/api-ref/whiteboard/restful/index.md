---
title: 互动白板 RESTful API 概览
description: 使用 RESTful API 管理互动白板 Token、房间、场景、截图和文档转换。
---

互动白板 RESTful API 可用于从业务服务器管理白板服务端能力，包括生成 Token、创建和管理房间、管理场景、生成截图以及发起和查询文档转换任务。

## API 基础

- **鉴权**：调用接口时需要在请求头中传入对应权限的 Token。
- **请求**：请求包体使用 JSON，具体格式见各 API 的请求示例。
- **响应**：响应包体使用 JSON。
- **Base URL**：`https://api.netless.link`

:::info
互动白板 RESTful API 仅支持 HTTPS。所有请求 URL 和请求包体内容均区分大小写。
:::

## REST API

- [生成 SDK Token](/zh-CN/api-reference/api-ref/whiteboard/restful/generate-sdk-token)：生成用于调用互动白板服务端 API 的 SDK Token。
- [生成 Room Token](/zh-CN/api-reference/api-ref/whiteboard/restful/generate-room-token)：生成用于加入指定白板房间的 Room Token。
- [生成 Task Token](/zh-CN/api-reference/api-ref/whiteboard/restful/generate-task-token)：生成用于查询文档转换任务的 Task Token。
- [创建房间](/zh-CN/api-reference/api-ref/whiteboard/restful/create-room)：创建一个实时互动白板房间。
- [获取房间列表](/zh-CN/api-reference/api-ref/whiteboard/restful/list-rooms)：查询项目下的白板房间列表。
- [获取房间信息](/zh-CN/api-reference/api-ref/whiteboard/restful/get-room)：查询指定白板房间的信息。
- [封禁房间](/zh-CN/api-reference/api-ref/whiteboard/restful/ban-room)：封禁或解封指定白板房间。
- [获取场景地址列表](/zh-CN/api-reference/api-ref/whiteboard/restful/list-scene-paths)：查询指定房间中的场景地址列表。
- [插入新场景](/zh-CN/api-reference/api-ref/whiteboard/restful/insert-scenes)：向指定白板房间插入新场景。
- [场景跳转](/zh-CN/api-reference/api-ref/whiteboard/restful/switch-scene)：切换指定白板房间中的当前场景。
- [生成场景截图](/zh-CN/api-reference/api-ref/whiteboard/restful/screenshot-scene)：为指定白板场景生成截图。
- [生成场景截图列表](/zh-CN/api-reference/api-ref/whiteboard/restful/screenshot-scene-list)：批量生成白板场景截图。
- [发起文档转换](/zh-CN/api-reference/api-ref/whiteboard/restful/start-file-conversion)：发起文档转换任务。
- [查询待转换任务](/zh-CN/api-reference/api-ref/whiteboard/restful/list-file-conversion-tasks)：查询当前排队中的文档转换任务。
- [查询转换任务进度](/zh-CN/api-reference/api-ref/whiteboard/restful/get-file-conversion-task)：查询指定文档转换任务的进度和结果。
- [取消指定的文档转换任务](/zh-CN/api-reference/api-ref/whiteboard/restful/cancel-file-conversion-task)：取消指定文档转换任务。
- [设置任务优先级](/zh-CN/api-reference/api-ref/whiteboard/restful/set-file-conversion-task-priority)：设置指定文档转换任务的处理优先级。
- [发起文档转换（旧版）](/zh-CN/api-reference/api-ref/whiteboard/restful/start-legacy-file-conversion)：使用旧版文档转换接口发起转换任务。
- [查询转换任务的进度（旧版）](/zh-CN/api-reference/api-ref/whiteboard/restful/get-legacy-file-conversion-task)：查询旧版文档转换任务的进度和结果。
