---
title: RESTful 鉴权
description: 对云端转码 REST API 请求进行鉴权。
---

云端转码 REST API 使用 HTTP Basic 认证。每个请求都必须携带 `Authorization` 请求头，该请求头由声网客户 ID 和客户密钥生成。

## 推荐做法

- 在服务端保存客户凭证。
- 将 `customer_id:customer_secret` 字符串进行 Base64 编码，生成 Basic Auth 凭证。
- 通过 `Authorization: Basic <credential>` 请求头发送编码后的凭证。
- 在服务端发起所有 REST 请求，避免在客户端暴露密钥。

## 相关页面

- [概览](index)
- [获取云端转码资源](acquire)
- [创建云端转码](create)
