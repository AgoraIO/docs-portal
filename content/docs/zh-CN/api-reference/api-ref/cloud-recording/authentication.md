---
title: RESTful API 认证
description: 对云端录制 REST API 请求进行认证。
---

云端录制 REST API 使用 HTTP Basic 认证。每个请求都必须包含 `Authorization` 请求头，该请求头由你的声网 Customer ID 和 Customer Secret 生成。

## 推荐做法

- 在服务端保存客户凭证。
- 对 `customer_id:customer_secret` 字符串进行 Base64 编码，生成 Basic Auth 凭证。
- 通过 `Authorization: Basic <credential>` 请求头发送编码后的值。
- 所有 REST API 调用都应在服务端完成，避免在客户端暴露密钥。

## 相关页面

- [云端录制概览](/zh-CN/api-reference/api-ref/cloud-recording)
- [获取云端录制资源](/zh-CN/api-reference/api-ref/cloud-recording/acquire)
- [开始云端录制](/zh-CN/api-reference/api-ref/cloud-recording/start)
