# ConvoAI OpenAPI 鉴权链接设计

## 目标

在 Conversational AI OpenAPI 参考页右侧的 Authorization 区域，为 `tokenAuth` 和 `basicAuth` 两个安全方案名称添加跳转链接，分别定位到认证文档中的 Token authentication 和 Basic HTTP authentication 章节。

## 方案

在 `content/openapi/conversational-ai/rest-api.en.yaml` 的文档根部增加 `x-docs-auth-links` 扩展：

```yaml
x-docs-auth-links:
  tokenAuth: /en/api-reference/api-ref/conversational-ai/authentication#token-authentication
  basicAuth: /en/api-reference/api-ref/conversational-ai/authentication#basic-http-authentication
```

`OpenApiAuthorizationSection` 从当前 operation 的 `__document` 读取该扩展。配置了有效非空字符串的安全方案渲染为站内链接；没有对应配置的安全方案继续渲染为现有的普通代码标签。这样链接配置与 OpenAPI 源文件保持在一起，同时不会把 ConvoAI 路由硬编码进通用组件。

## 测试与边界

- 组件测试验证 `tokenAuth` 和 `basicAuth` 分别生成精确的 `href`。
- 组件测试覆盖未配置链接时的回退行为，确保其他 OpenAPI 文档的现有展示不变。
- 非字符串或空链接配置视为无效并回退为普通标签。
- 运行鉴权相关组件测试和类型检查；全量测试结果与当前 `main` 的既有失败分开记录。

## 不在范围内

- 不改变 OpenAPI 安全方案定义、鉴权逻辑、请求示例或鉴权说明文本。
- 不修改中文旧版 Conversational AI REST API 页面。
- 不为其他 API 自动推断鉴权链接。
