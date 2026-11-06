# Android 接口列表与源结构对齐

## 来源与范围

- 基线：`codex/cn-newdoc-html-api-migration@e89f8adede795197803f00d39892d8615c56b7d4`。
- 固定旧源：`shengwang-doc-source@80b1000446bacab3f4937f5f1a6d177c5be6bee1`（PR #2094），通过本地 Git 对象读取。
- 对照源：`html-docs/rtc/Android/API/rtc_interface_class.html` 与 `class_ivideoeffectobject.html`。
- #2094 之前，接口列表内包含 IVideoEffectObject；#2094 将其移至独立类页。新站初次迁移保留了原章节，10 月 20 日同步又补充 String 方法和独立类页链接，形成当前重复内容。
- 用户在本次会话确认：正文跟随最新旧源移至独立页，保留历史锚点入口。本次只调整中文 Android，不扩展到其他平台或英语内容，不更改 SDK 语义、共享渲染器或导入器。

## 修正与兼容

列表页移除 IVideoEffectObject 二级标题、说明、版本提示及十个方法列表，保留一条独立类页入口。独立类页及全部方法正文不变。

兼容入口保留 `class_ivideoeffectobject`、`ariaid-title28`、`class_ivideoeffectobject__detailed_desc`，并显式保留原自动生成的 `ivideoeffectobject`、`相关参考-25`。独立复核发现删除重复标题会改变后续标题编号，因此为后续八个“相关参考”标题显式指定原 ID（`相关参考-26` 至 `相关参考-33`），避免旧链接错指其他接口。

除该兼容入口及八个显式 ID 外，页面内容与基线逐字一致。这里保留入口是明确的历史链接兼容差异，不宣称与旧站页面逐字一致。

## 验证与验收边界

- 基线 PR2094 测试：36/36 通过。增加实际 `remarkHeading` 编译回归后先复现 hash 前移失败，修正后 37/37 通过。
- `bun run types:check`：通过。
- `bun x biome check src/lib/rtc-pr2094-sync.test.ts`：通过。
- `bun run qa:api source --region cn`：0 新问题，53 项已知重复标题，0 过期豁免。
- 两页 682 个内部链接的路由及目标锚点检查通过；实际 `remarkHeading` 生成 ID 与旧显式 ID 的合并集合对比，无丢失历史锚点。链接提取复用仓库 `extractDocument`；标题兼容检查使用实际渲染插件，因为静态提取器当前不识别 `[#id]` 标题语法。
- 本地检查脚本和输出位于忽略目录 `.agent/artifacts/android-interface-parity/`。
- 本次为内容修正；未执行双地区全量浏览器发布验收或生产构建，不据此宣称已发布。

## 最终复核

- 独立审查代理 `review_android_parity` 在 2026-11-06 对最终改动复审通过：157 个标题/显式 ID 均保留且无重复，八个后续标题仍对应原接口，无未解决发现。此项为源码复核，不冒称独立浏览器或 SDK 语义签核。
- 实施者浏览器检查：HeadlessChrome 150，局部 Android 开发预览 `http://127.0.0.1:4317`，桌面 1280×577 浅色、移动端 390×844 深色。`#ivideoeffectobject` 与 `#class_ivideoeffectobject` 均定位到可见兼容入口，列表及 TOC 无重复类标题，后续八个相关参考 ID 正确，无整页横向溢出；点击入口可进入独立类页，十个方法均存在。两张视口截图已人工查看，保存在忽略目录；不提交截图。
- 截图工具首次对长页面 body 截图无响应，改用视口截图完成上述检查；未将失败截图作为通过证据。
- 本次用户批准的是源结构对齐与历史链接兼容；不涉及 API 签名或方法语义变更。全站发布验收仍由仓库后续 PR/CI 流程承担。
