# 新旧搜索对比文本证据

2026-11-04 对 staging 新站和旧站的黑盒实测快照。数据来自真实浏览器的渲染文本与可见链接，未读取搜索引擎内部状态。

- `new-queries.json`、`old-queries.json`：每站 40 个输入，保留实际 URL、输入值、分组、默认结果顺序、完整结果卡片文本与链接；去掉页眉页脚等重复页面文本。
- `query-details.md`：按查询和分组展开的阅读版明细，可直接访问对应搜索及结果页面。
- `new-latency.json`、`old-latency.json`：每站 15 次端到端界面响应测量。
- `new-landings.json`、`old-landings.json`：新站 12 个、旧站 10 个落地页及锚点检查。
- `virtual-background-view-switch.json`：虚拟背景查询在全部文档与产品文档视图切换前后的结果。
- `new-reload-errors-1.json`、`new-reload-errors-2.json`：连续加载/刷新后的累计浏览器异常列表，数量分别为 5 与 6，新增一条 [React 错误码 418：服务端与客户端 HTML 不一致](https://react.dev/errors/418)。原始日志中的错误字符串保持不变。

纯空白样本（第 38 组）在新站未提交，URL 保留前一个无结果查询，不能视作空白查询的零召回。虚拟背景最初的加载中样本已被稳定结果替换，未作为无结果计数。

截图及可访问性快照保留在本地被忽略的 `.agent/artifacts/search-comparison-2026-11-04/`，不纳入版本控制。报告中的站点链接用于研发复查当前部署，JSON 固定保留当时观察，两者可能随后续部署出现差异。
