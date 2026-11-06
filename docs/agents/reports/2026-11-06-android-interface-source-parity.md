# Android 接口列表与源结构对齐

## 来源与最终范围

- 基线：`codex/cn-newdoc-html-api-migration@e89f8adede795197803f00d39892d8615c56b7d4`。
- 固定旧源：`shengwang-doc-source@80b1000446bacab3f4937f5f1a6d177c5be6bee1`（PR #2094），通过本地 Git 对象读取。
- 对照源：`html-docs/rtc/Android/API/rtc_interface_class.html` 与 `class_ivideoeffectobject.html`。
- #2094 将接口列表中的 IVideoEffectObject 移至独立类页。新站初次迁移保留原章节，后续同步又补上 String 方法和独立类页链接，形成重复内容。
- 用户进一步明确 staging 尚未上线，要求删除不必要的兼容入口。本次移除列表页的整节正文、跳转提示及该节五个专用锚点，不设置重定向。独立类页及全部方法正文不变。
- 将 API 概览和 RTC 版本说明中两条指向旧节锚点的链接改为直达独立类页；正文措辞不变。未更改其他平台、SDK 语义、共享渲染器或导入器。

## 页面与锚点

移除 `class_ivideoeffectobject`、`ariaid-title28`、`class_ivideoeffectobject__detailed_desc`、`ivideoeffectobject`、`相关参考-25`。其他 152 个标题/显式 ID 保持不变，后续八个“相关参考”标题仍显式指定 `相关参考-26` 至 `相关参考-33`，避免改变其他接口的链接目标。

忽略 Markdown/HTML 展示标记及空白后，34 个章节正文与固定旧源逐节一致，没有额外章节。此结论针对页面正文结构，不声称新旧框架生成的所有 DOM ID 或站点交互完全相同。

## 验证

- `bun run test src/lib/rtc-pr2094-sync.test.ts`：37/37 通过；现有测试更新为要求 Android 列表无视频特效章节及兼容入口、两处引用使用独立类页，其他接口 hash 保持对应关系。
- `bun run types:check`、`bun x biome check src/lib/rtc-pr2094-sync.test.ts`、`git diff --check`：通过。
- 两页 681 个内部链接的路由及目标锚点检查通过；只移除上述五个锚点，其他 ID 不变。全文搜索无指向这五个已移除 Android 锚点的文档链接。
- 链接检查复用仓库 `extractDocument`；标题 ID 对比使用实际 `remarkHeading` 插件，避免静态提取器当前不识别 `[#id]` 语法的限制。
- 之前提交 `eadf91084` 的“保留兼容入口”截图和 157 ID / 682 链接结果仅适用于旧方案，不作为本次最终验收证据。
- 本地脚本、报告和截图保存在忽略目录 `.agent/artifacts/android-interface-parity/`；不提交 QA 图片。
- 本次为内容修正，未执行全量测试、生产构建、双地区全量浏览器发布验收或部署。
- `bun run qa:api source --region cn`：0 新问题，53 个已知重复标题，0 过期豁免。
- 独立审查代理 `review_android_parity` 对删除入口后的最终改动只读复核通过：删除范围准确、两处引用有效、其他标题及正文不变，独立类页十个方法目标均有效。
- 实施者本地浏览器检查：HeadlessChrome 150，1280×577 浅色、390×844 深色。IRtcEngineReleaseCallback 后紧接 IVideoEncodedFrameObserver，正文与目录无 IVideoEffectObject 章节及跳转提示，五个专用锚点均不存在，无整页横向溢出。已查看对应的 `no-compat-desktop.png`、`no-compat-mobile-dark.png` 视口截图。
