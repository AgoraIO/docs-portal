# 中文全量索引覆盖审计

本审计读取生成产物，不运行构建，不查询或修改 Meilisearch，不修改英文代码。

## 快照及结果

审计对象：`dist/search/cn-records-version-verified.json`。
文件时间：2026-10-09 23:02:23.918（北京时间）；63,159,320 字节。
SHA-256：`5e11606ab1f792ec52b2e5958782cac43e6fc285306c1365f975d4bfed618725`。
完整 HTML 审计期间文件未改变。

| 项目 | 数量 |
| --- | ---: |
| 索引记录 / 唯一 ID | 64,065 / 64,065 |
| 索引 URL / 检查 HTML 页面 | 2,811 / 2,811 |
| docs / openapi 记录 | 63,953 / 112 |
| 对应 canonical 文档范围 | 2,188 |
| 索引平台变体 URL | 790 |
| 中文路由清单 / sitemap 路由 | 7,719 / 7,698 |
| 索引 fragment URL | 62,395 |
| 不存在的索引锚点 / 缺失 HTML 页面 | 0 / 0 |
| 渲染 TOC 锚点 | 53,522 |
| 当前平台实际遗漏的 TOC 章节 | 0 |
| 其他平台 panel 的 TOC 章节，合理不进入当前平台索引 | 10 |
| TOC 指向不存在的 HTML ID | 16 |
| 平台变体元数据不匹配 / 锚点只属于错误平台 | 0 / 0 |
| 索引锚点 ID 同时存在于当前及其他平台 panel | 232 |
| platform 为空 / version 为空的记录 | 11,140 / 55,393 |

逐页核对源码中的数字版本与索引版本：0 个不匹配。
FAQ：110/110 文档已收录；本次独立核对 catalog 的 products/platform 与记录：0 个不匹配。
空元数据不自动算缺陷：公共说明没有单一平台、导航的“当前版本”没有声明数字版本均允许为空。

## 排除范围

- 21 个路由不在 sitemap，不属于本次发布导出范围。
- 4,709 个已发布路由不在导航搜索 allowlist；确认存在 `!aigc`、`!quick-start-java` 等明确导航排除。不能将全部源 MDX 或全部可访问路由视为必收录。
- 167 个 canonical 页面由平台变体替代，避免混合隐藏平台内容及重复结果。
- 11 个符合 route/navigation 条件但没有有效正文记录的页面：3 个 C# 空锚点 stub、8 个 API/SDK/FAQ 组件目录页。目录页是否需要独立入口搜索记录属于产品策略，不应填充伪章节。

完整排除 URL 清单与残留 TOC 清单见 `dist/search/cn-coverage-audit.json`。

## 修复复核及残留边界

上一轮 63,970 条记录：24 个现存 TOC 锚点未入索引，其中 14 个是真实 Android RTM release note 章节，10 个只属于其他平台。
表格单元格 fence 修复后：增加 95 条记录，Android RTM release notes 从 65 条增加到 97 条；14 个真实遗漏全部消失。
更早的 53,335 条记录快照有 2,086 个现存 TOC 锚点未入索引；当前只剩 10 个其他平台项。

16 个 TOC 链接仍没有对应 HTML ID，是渲染/TOC 契约问题，不应为它们创建不可跳转的索引记录。
例如 RTM `#heartbeat-interval-与-presence-timeout` 实际 ID 为 `heartbeatinterval-and-presencetimeout`；KTV `#2-获取版权音乐` 实际 ID 为 `步骤2`。
232 个跨 panel 重复 ID 可能影响浏览器跳转定位；当前平台有同名锚点并不能证明浏览器最终定位正确。

“错误平台锚点为 0”只说明已索引锚点没有独占于另一平台，不能推广成所有正文没有平台泄漏。本次没有穷举比对正文语义，也没有运行浏览器跳转验证。

## 可复用命令

```bash
node scripts/search/audit-cn-coverage.mjs \
  --records=dist/search/cn-records-version-verified.json \
  --out=dist/search/cn-coverage-audit.json
```

支持位置参数 records 路径，以及 `--html` 指定已构建静态根目录。
脚本读取静态 HTML、route manifest、导航索引、sitemap；只写审计 JSON，不调用网络或构建。
记录文件审计期间变化会报错；调用者仍需保证其他构建产物来源一致。
TOC 使用当前 renderer 的 nav selector，未来 TOC markup 改动时需一起复核。
脚本版本检查仅比较 route.version；本报告额外的源码 meta/FAQ catalog 核对来自本次只读 inline 审计。
重复记录 ID、缺失页面/索引锚点、真实遗漏章节和平台/版本不匹配会使脚本非零退出。源页面 TOC 缺陷、跨 panel 重复 ID、导航排除及组件入口列在 JSON 中，仍需人工审查；不能把 exit 0 当作所有页面质量项通过。

外部执行者报告的本地 prepare/promote、45 项测试、类型检查及完整套件比较不在本审计的独立验证范围。
