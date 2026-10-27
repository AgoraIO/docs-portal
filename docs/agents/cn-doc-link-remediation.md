# 中文文档链接修复：内部 404 与平台深链

工作分支：`codex/cn-doc-links-validation`，基于 `codex/cn-newdoc-html-api-migration`。本轮接续[跳转编码修复](./cn-doc-redirect-hash-fix.md)，处理 staging 审计确认的 43 个内部 404，以及 87 条跳转或锚点可见性问题。

## 内容链接

修正 14 个内容文件中的 222 处链接，共 119 个不同的“来源文件＋链接”组合：

| 类型 | 修复方式 |
| --- | --- |
| RTM 枚举链接 | `rtm/ios/enumv.android#…` 等旧后缀改为 `rtm/android/enumv#…`，保留对应平台和锚点。 |
| RTM／RTC 平台说明 | `.ios`、`.flutter` 等后缀改为 `?platform=ios`、`?platform=flutter`；RTC Token 文档使用实际存在的 `setup-and-access` 路径。 |
| RTSA 发版说明 | 7 个旧 Build 目录链接更新到新目录，保留标题、版本锚点及发版事实。 |
| OpenAPI 概览 | 5 个中文 YAML 中的相对接口链接改为包含产品目录的绝对站内路径，避免落到错误的 `/api-reference/api-ref/create` 等地址。 |

另外修正一处既有语义错误：RTM HarmonyOS `join` 参数说明的 RTC Token 链接原先指向 Windows，现已指向 HarmonyOS。

全部新链接的目标页面、枚举锚点和查询平台已核对。28 个 OpenAPI 目标还逐一核对了 lane 中的 routeLeaf 与 YAML 中实际存在的 operationId。重新扫描中文源文件后，本轮涉及的旧绝对链接已无残留。

## 运行时行为

### 旧 API 聚合页

新增 `src/lib/docs-api-hash-redirects.ts`，在旧聚合页默认跳 Android 之前，按已验证的锚点选定实际 SDK 页面：

- Fastboard：6 个 iOS 锚点、20 个 Web 锚点。
- RTM 配置：1 个 HarmonyOS 锚点、6 个 iOS 锚点。
- RTM Storage：1 个 Flutter 锚点、1 个 iOS 锚点。

35 个兼容映射均有测试直接检查目标 MDX 中存在对应锚点。未知锚点和其他页面继续走原有路由。链接检查工具使用同一个解析函数，避免应用与检查器对目标页面的判断不一致。

### 隐藏平台面板

`PlatformTabsGroup` 根据当前 hash、hashchange 和目录定位事件展开锚点所属的平台面板，并处理异步插入的正文。自动展开保留查询参数和 hash；读者主动切换平台仍沿用原有的 URL 更新与旧 hash 清理行为。监听器和 DOM observer 在卸载时清理。

## 验证

最终固定代码后的完整测试：283 个文件通过、1 个文件失败；4,412 项通过、2 项失败、2 项跳过。失败仅为此前已有的 `src/lib/rtm-pr2069-sync.test.ts` 两项 Web／小程序 USER 发布示例检查（缺少预期平台内容分段）。本轮新增回归均通过。

- 119 个来源目标组合：目标页面／锚点／平台静态检查通过。
- 49 个去重目标 URL：访问 staging 已存在的目标地址，全部 HTTP 200；这验证目标可达，不表示 staging 已部署本轮修复。
- 87 条本地浏览器新文档导航：最终 URL、正文、可见目标锚点全部通过。其中 52 条 RTC 链接验证平台面板自动展开，35 条 API 链接验证平台映射。
- 浏览器初次回放中有 3 条受开发服务器自动重载干扰，单独重新导航后通过；保留初次记录和最终合并结果，未把上一页状态计为通过。
- 284 项相关测试通过；随后新增异步内容和目录事件用例，受影响的 125 项测试再次通过。
- 检查工具的 59 项测试通过；类型检查及修改文件的 Biome 检查通过。
- 内容与运行时代码均经过独立只读审查，审查发现的 HarmonyOS 链接问题已处理。

测试命令：

```sh
bun run test --maxWorkers=2
bun run types:check
bun run test scripts/cn-link-built.test.ts scripts/cn-link-audit.test.ts
```

本地回放使用当前静态部署模式的路由代码。通过生产 loader 重新生成了受影响的 28 个 OpenAPI endpoint payload，并运行了 `bun run openapi:sync`；没有重建整个生产站点，也未发布。非静态 SSR 首次 HTTP 跳转不携带 fragment，不属于本轮浏览器验收范围。

证据位于忽略目录 `.agent/artifacts/cn-links/second-batch/`：

- `source-changes.json`、`source-validation.json`：逐项来源修改与静态核对。
- `target-http.json`：49 个目标 URL 的网络结果。
- `browser-final-results.json`：87 条浏览器最终证据。
- `static/`：重新提取的完整源链接清单。静态模式没有网络和浏览器证据，报告仍为 INCOMPLETE，不能据此宣称全站链接通过。
- `full-test-final.log`、`types-final.log`：最终测试和类型检查输出。

后续仍需处理外部失效链接，以及本轮 87 条之外的待核查项。部署后应重新运行完整审计；本轮结果不能替代线上发布验证。

## 后续进展

外链及其余待核查项的处理见[第三批修复记录](./cn-doc-external-link-remediation.md)。其中明确列出仍缺正文的 27 页及外部访问限制。
