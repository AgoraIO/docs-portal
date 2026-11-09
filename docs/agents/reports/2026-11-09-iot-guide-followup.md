# IoT 指南入口修复与回归更新

- 基线：`553dbe7f8b9172c4cc119a2937208d4f5ac62ea7`（本地 origin/main）；独立分支 `codex/iot-compatibility-followup`。未修改主对话的中文或英文工作副本，尚未部署。
- 已根据 v1.9.7 更新 PR #1008，补充 `/en/realtime-media/iot/reference/communicate-with-rtc-sdk` 及 `.md` 的 301，目标为 `/en/realtime-media/iot/build/send-messages/interoperate-with-rtc-sdk` 及 `.md`。
- 旧站 Android/Linux C 的两条互通指南映射直接指向现行指南，保留查询参数；映射生成器和部署产物同步更新。旧站文档服务器本身不在本次修改范围。
- 保留迁移前章节锚点，包括 Video SDK 旧称及增加 Server SDK 之前的 Native 小节 ID；没有改动现行兼容性表或 SDK 参数。
- 认证页保持原文，与 PR 基线逐字一致；已按用户要求移除额外的 SDK scope 提示。不恢复已主动移除的 Java/Kotlin 示例，测试只检查现有 C 示例与现行路径。
- 既有 IoT 兼容性和认证渲染回归改为检查现行路径与 C 示例。新增 HTML/Markdown 301、旧站查询参数映射与旧锚点回归。
- 验证：本次相关 7 项通过；类型检查、重定向产物一致性、涉及的 TS/TSX Biome、diff whitespace 检查通过。
- 初始提交 959cf7c34 的全套测试：1964 通过、12 失败。对未修改的 HEAD 在临时目录中复验候选失败的 10 个文件，所有 12 个失败均复现，无新增失败；对照文件中原有的 IoT 兼容性失败已解决。初始基线另确认旧认证页渲染测试失败，当前也已解决。未放宽其他编号、表格、MCP/Skills 副本或历史链接断言。
- HTTP：旧新站路径及 `.md` 为 301，认证页和现行互通页为 200，旧章节锚点存在（初始提交验证；本次移除了额外范围说明）。旧站路径在应用服务沿用既有 307 策略，直接抵达现行页并保留 platform 参数；Vercel 部署规则为 301 且保留查询参数。
- 本次未运行生产构建或浏览器截图验收。日志、HTTP 回执及基线失败集合在忽略的 `.agent/artifacts/iot-followup/`；临时基线目录已清理。
