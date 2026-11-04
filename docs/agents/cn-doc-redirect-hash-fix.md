# 中文文档旧链接跳转修复

工作分支：`codex/cn-doc-links-validation`，基于 `codex/cn-newdoc-html-api-migration`。

## 问题与修复

TanStack Router 的 `location.hash` 不包含开头的 `#`，且已经解码。文档详情、栏目首页和栏目布局的三个跳转函数原先直接拼接该值，导致英文锚点进入路径或查询参数，中文锚点触发 `Headers.set` 字符编码异常。

三个入口现在共用 `src/lib/docs-redirect-url.ts`，通过 URL API 组合查询参数和锚点：

- 自动补上锚点分隔符并编码中文，已有百分号编码不重复编码。
- 目标地址自己的查询参数、锚点分别优先；显式空 `?`、`#` 也保留。
- `preserveSearch=false` 只禁止继承来源查询参数，仍保留来源锚点。
- 保留原来的重定向状态码和目标路径映射。

例如，`/api-reference/whiteboard/fastboard/fastboard-api#appintoolbar` 应跳到 `/api-reference/whiteboard/fastboard/android#appintoolbar`，而不是 `/api-reference/whiteboard/fastboard/androidappintoolbar`。

## 验证方式

```sh
bun run test src/lib/docs-redirect-url.test.ts src/routes/-docs-routing-guards.test.ts
bun run types:check
bun run test --maxWorkers=2
```

新增 15 个 URL 组合用例和三个真实路由 loader 的回归用例，检查实际 `Location` 响应头。三个路由回归用例已在修复前复现失败、修复后通过。

使用 staging 审计记录的 87 条失败链接（52 条中文渲染异常、35 条客户端跳转后 404），读取实际静态跳转映射，验证修复后路径和锚点保持正确，且能构造合法响应头。87 条全部通过。

本地浏览器使用新的路由代码和已生成的中文静态 payload 回放旧链接，验证最终地址、正文和锚点。证据保存在忽略目录 `.agent/artifacts/cn-links/redirect-fix/`。锚点存在但处于隐藏平台面板时，仍须单列为待处理，不能视为可见深链通过。

本次不修改文档内容，不修复其他内部 404、外链失效或平台面板可见性问题。尚未部署；staging 上的实际修复效果需要部署后再验证。

## 检查结果

- 定向回归：18 项通过。
- 完整测试：282 个文件通过，1 个文件失败；4,366 项通过、2 项失败、2 项跳过。
- 两项失败均来自此前已有的 `src/lib/rtm-pr2069-sync.test.ts`：Web 和小程序 USER 发布示例的检查，实际失败在未找到预期的平台内容分段。本次未修改这些内容。
- `bun run types:check`、修改文件的 Biome 检查和 `git diff --check` 通过。
- 独立只读代码审查未发现需修复的问题。

### 本地浏览器回放结果

87 条全部跳到映射指定的地址并渲染出文档正文，未出现 `Something went wrong!`。该结果只证明跳转故障消除，不代表这 87 条深链全部通过：

- 52 条 RTC 链接：目标锚点存在，但采样时位于不可见内容中，需继续验证平台面板展开行为。
- 35 条 Fastboard/RTM 链接：目标正文存在，旧锚点在采样时未找到，需进一步核对平台和新 API 锚点映射。

回放使用新的本地 Vite 路由代码和先前生成的静态 payload，未重新构建整个生产产物，也未验证部署后的 staging。每条记录包含来源、预期地址、实际地址、页面时间戳、正文及锚点检查结果。

## 后续修复

上文列出的 52 条隐藏面板锚点和 35 条平台映射问题，已在[第二批链接修复](./cn-doc-link-remediation.md)中处理，并完成 87 条本地浏览器回放。线上状态仍以部署后复测为准。
