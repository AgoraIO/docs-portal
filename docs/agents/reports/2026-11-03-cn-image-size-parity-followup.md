# 中文图片尺寸迁移补修

## 原因与基线

- 基于中文迁移分支 `94a4809655b3361e6da075c9f324546762256b34`。
- 旧源仓库版本：`847cc38783ea50223bc2e5007fc4f4a5597c7ad8`。
- 云端录制旧源 `docs/cloud-recording/get-started/enable-service.mdx` 的两张功能配置截图明确声明 `width="40%"`。旧 `src/mdxComponents/basic/Image.tsx` 将百分比宽度应用于图片容器，图片等比显示。
- 最新中文分支保留的云端录制页面已经使用 `DocsImage displayWidth="40%"`。本次保留其现有设置。
- 旧迁移器将带宽高的 `Image` / `img` 转为普通 Markdown，只留下 `needs-image-width-review` 提示；尺寸没有进入目标内容。修正转换逻辑，并继续使用已有的 `DocsImage`、`InlineImage`，保留图片放大预览。

## 本次范围

检查 7041 个中文文档文件；按当前发布规则排除停用目录后，复核 6099 个文件。依据源页面、共享依赖和平台映射，补修 10 个可发布页面的 21 处尺寸。

| 范围 | 处数 |
| --- | --- |
| RTC 快速开始及 Expo 快速开始 | 10 |
| 白板两种 SDK、PPT 转码的开通服务截图 | 3 |
| RTC Web 音效/混音截图 | 2 |
| 隐私清单、字符串 UID、Unreal 权限 FAQ | 6 |

其中 13 处是先前清单中待消歧的图片。RTC 流程图按各平台恢复 `70%` 或 `60%`；同一白板资源在 Fastboard / Whiteboard 源页为 `60%`，在 PPT 源页为 `70%`。这些差异来自各自源页面。

旧宽度为 `100%` 的图片继续使用 Markdown。已有显式尺寸、自定义设置、停用文档，以及之前确认源页未设尺寸的 18 处复用图片均保留原样。空 alt 的 PPT 配置截图使用相邻操作说明补齐描述，其余 alt 和图片地址保留。

## 实现与回归清单

- `scripts/lib/legacy-image-sizing.mjs` 统一读取静态百分比/像素宽高，输出批准的图片语法。
- MDX 迁移器和 API 中心 HTML 转换器保留尺寸；API 中心资源复制继续保留组件属性。
- `scripts/restore-legacy-image-sizes.mjs` 按来源映射进行审计与可选批量修复，识别平台、代码区和注释；尺寸冲突留在报告中。输出位于忽略目录 `.agent/artifacts/`。
- `src/lib/mdx/fixtures/cn-image-parity-followup.json` 记录本批实例、旧源文件/行号和尺寸。原批次清单继续保存历史依据，新批次覆盖已解决的 13 处待定实例；其余 35 处负控继续验证为 Markdown。

复扫命令：

```sh
node scripts/restore-legacy-image-sizes.mjs --old-root /path/to/shengwang-doc-source
```

需要应用有确定来源的修复时增加 `--write`。本批写入后再次扫描，新增修改和冲突均为 0。

## 验证

- 定向回归 565 项通过；21 个旧源行号核对通过。
- 全量 330 个测试文件通过，5279 项通过、2 项跳过。
- 类型检查、修改文件的 Biome 检查、10 页 MDX 编译通过。
- 桌面浏览器实测：云端录制 `40%` 图片在 800px 容器中显示 320px；白板恢复项 `60%` 在同宽容器中显示 480px。图片正常加载。
- 白板放大预览显示 886px，未继承缩略图的百分比宽度；手机 390px 视口未发生页面横向溢出。
- 截图和原始审计输出仅保存在忽略目录 `.agent/artifacts/`。
