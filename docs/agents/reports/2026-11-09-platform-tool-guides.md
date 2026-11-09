# Platform MCP / Skills 副本收敛

日期：2026-11-09。基线：`553dbe7f8b9172c4cc119a2937208d4f5ac62ea7`（本地 origin/main）。

两个 `content/docs/en/ai/platform/get-started/{mcp-integrate,skills-integrate}.mdx` 源稿明确标记为 DEFERRED，现原样移到 `docs/migration/unpublished/content/docs/en/**`。清单与 SHA-256 见 `docs/migration/unpublished/platform-guides.json`。

原网页地址和 `.md` 地址均通过应用路由及 Vercel 配置 301 到现行共享指南 `/en/introduction/agora-mcp`、`/en/introduction/agora-skills`。保留共享指南，不增加 Platform 专属适用范围声明。

验证：

- MCP/Skills 34 项回归通过，覆盖应用页面、Markdown、部署配置和单一共享正文。
- `bun run types:check`、`legacy-redirects:check`、涉及 TS 文件的 Biome 和 diff whitespace 均通过。
- 本地 HTTP 的 4 条旧地址均返回 301，Location 正确。
- 浏览器能从旧地址到达共享指南，页面标题正确；部分截图调用失败，截图不作为证据。
- 全套测试 1961 项通过、12 项失败。另建未修改基线复验这 9 个失败文件，重现相同 12 个失败断言，无新增失败；未放宽原有断言。
- 独立 reviewer 两轮只读审查未发现英文改动缺陷。

中文误收录的 8 页由独立分支 `codex/exclude-unpublished-cn` 处理；未将两个地区的内容分支互相合并。中文 API 公共文件比较仍存在英文基线缺少质量工具/合同等既有差异，本次未修改共享渲染器，不宣称完成双区域生产浏览器全量验收。

改动尚未部署、未刷新远端搜索索引，原飞书反馈文档未修改。日志及 HTTP 证据保留在忽略的 `.agent/artifacts/unpublished-pages/`。
