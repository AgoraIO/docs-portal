# 旧源表格合并遗漏修复（2026-11-05）

## 范围与结论

基于 `codex/cn-newdoc-html-api-migration` 的 `83e6aefe4`，在独立工作树的 `codex/restore-legacy-table-spans` 分支修复 12 页、12 张表、22 个跨行单元格。仅修改中文内容，使用现有 `DocsTable`；未改公共渲染器、迁移器或样式。

扫描本地 `shengwang-doc-source` 的 `docs`、`docs-faq`、`docs-basics`、`docs-api-reference`、`shared` 中 MD/MDX 显式合并语法，清点 71 张源表（`docs` 67 张，其他目录 4 张），与目标的 6,577 张 GFM 表核对。独立复核进一步解除表格维度限制、展开 Slot，补出 3 篇 FAQ。该数字不包含旧报告单独统计的生成 API HTML 表；本次没有重做全部生成 API HTML 的审计。

源表中已有合并的 5 处目标副本位于已下线产品：融合 CDN 域名表、灵动课堂域名表/计费表/产品功能表、人像律动功能表。按 `src/lib/retired-cn-docs.mjs` 排除，未修改。其余已正确合并的表格保留现状。

## 修复清单

旧源路径相对于 `shengwang-doc-source/`；目标链接指向本仓库内容。

| 目标页面 | 旧源依据 | 恢复关系 |
| --- | --- | --- |
| [申请和使用许可证](../../../content/docs/zh-CN/solutions/iot-apaas/build/setup-and-access/license.mdx) | `docs/shared/rtsc/switch-domain.mdx` | `api.sd-rtn.com` × 8 行；`api.agora.io` × 8 行 |
| [申请和使用 License](../../../content/docs/zh-CN/realtime-media/rtsa/build/project-preparation/license.mdx) | `docs/shared/rtsc/switch-domain.mdx` | `api.sd-rtn.com` × 8 行；`api.agora.io` × 8 行 |
| [保障 REST 服务高可用](../../../content/docs/zh-CN/realtime-media/meeting/build/high-availability.mdx) | `docs/shared/rtsc/switch-domain.mdx` | `api.sd-rtn.com` × 8 行；`api.agora.io` × 8 行 |
| [保障 REST 服务高可用](../../../content/docs/zh-CN/api-reference/api-ref/console/guarantee-rest.mdx) | `docs/console/api/guarantee-rest.mdx` | api.sd-rtn.com × 8 行；api.agora.io × 8 行 |
| [实现字节火山美颜](../../../content/docs/zh-CN/solutions/showroom/build/beauty/bytedance-integrate.mdx) | `docs/showroom/advanced-features/beauty/bytedance/run-project.android.mdx` | `app/src/main/assets/beauty_bytedance` × 4 行 |
| [RTC SDK API 示例](../../../content/docs/zh-CN/reference/demo/rtc-sdk-api-example.mdx) | `docs/showroom/advanced-features/beauty/bytedance/run-project.android.mdx` | `app/src/main/assets/beauty_bytedance` × 4 行 |
| [限定访问区域](../../../content/docs/zh-CN/realtime-media/rtsa/build/network-and-region-access/region-limit.mdx) | `docs/shared/rtc/region-tech.mdx` | 北美 × 2 行；北美 × 2 行 |
| [区域访问限制](../../../content/docs/zh-CN/realtime-media/rtc-server-sdk/build/set-region.mdx) | `docs/shared/rtc/region-tech.mdx` | 北美 × 2 行；北美 × 2 行 |
| [安全最佳实践](../../../content/docs/zh-CN/introduction/security/best-practice.mdx) | `docs-basics/security/best-practice.mdx` | 北美 × 2 行；北美 × 2 行 |
| [本地服务端录制的并发性能如何？](../../../content/docs/zh-CN/reference/faq/product/recording_concurrence.mdx) | `docs-faq/recording-concurrence.mdx` | 直播场景 × 3 行；通信场景 × 2 行 |
| [如何处理音频卡顿问题？](../../../content/docs/zh-CN/reference/faq/quality/audio_freeze.mdx) | `docs-faq/audio-freeze.mdx` | 必要信息 × 4 行；可选信息 × 2 行 |
| [如何处理音频噪声问题？](../../../content/docs/zh-CN/reference/faq/quality/audio_noise.mdx) | `docs-faq/audio-noise.mdx` | 必要信息 × 3 行；更多信息 × 4 行 |

## 内容保留

- 域名表保留现有域名、地理区域和行内代码格式，每组主域名跨 8 行。
- 字节资源表保留现有表头与路径。旧源写了 `row={5}`，实际仅有 4 条资源行，按照既有布局规则使用 `rowSpan={4}`，防止越界。
- 访问区域表只合并旧源明确标记的两列；RTSA 和服务端 SDK 的 Slot 说明原样移入对应单元格，安全实践中的脚注保留。
- 音频卡顿、噪声 FAQ 将误放在首列的详情归回第二列，按旧源恢复必要/可选信息分组。
- 独立文本对比：仅删除被合并覆盖的重复“北美”和字节资源路径；正文、链接、代码、脚注没有其他增删。

## 验证

- `bun run types:check`：通过。
- `bun run test`：350 个测试文件通过，1 个跳过；5,713 项通过，6 项跳过。基线结果相同。
- `bun run docs:tables`：7,040 份中文文档，0 个表格结构错误。
- `bun run qa:api source --region cn`：0 个新增问题；53 个已登记重复标题，0 个过期豁免。本次未修改既有债务。
- `git diff --check`：通过。
- 浏览器：基于当前工作树的中文 Vite 预览（`http://127.0.0.1:3116`），12 页共 56 个页面/视口/主题组合通过。一般页面为 1440×1000、390×844，两种明暗主题；Console API 页额外覆盖 768×1024、1024×768、844×390、320×568。Demo 页选中 Android。实际断言：目标 span 数值与文字正确、跨行下边界对齐误差小于 2px、垂直居中、结构中没有非法段落包装、所有宽表最后一列可滚动到达、整页无横向溢出。使用 Chrome 150.0.0.0 的 CSS 视口模拟，未验证真实触摸或 Safari；未运行完整生产构建或全站区域发布门禁。

独立复核代理已完成旧源、最终 diff 与文字保留复核，未发现其他明确遗漏或修复缺陷。这是机器检查及独立源码复核，不等同 API 内容负责人或发布负责人的人工验收；未执行生产发布。

详细扫描数据、修改映射、命令日志与截图保存在忽略目录 `.agent/artifacts/`。
