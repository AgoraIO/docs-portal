# RTC 四平台接口列表与旧源结构对齐

## 来源与范围

- 基线：`codex/cn-newdoc-html-api-migration@e89f8adede795197803f00d39892d8615c56b7d4`。
- 固定旧源：`shengwang-doc-source@80b1000446bacab3f4937f5f1a6d177c5be6bee1`（PR #2094），通过本地 Git 对象读取。
- 源文件：`html-docs/rtc/{Android,Cpp,iOS,macOS}/API/{rtc_interface_class,class_ivideoeffectobject}.html`。
- #2094 已将视频特效类移出接口列表，改由独立类页承载；新站保留了旧章节。本次统一移除 Android/C++ 的 IVideoEffectObject、iOS/macOS 的 AgoraVideoEffectObject 重复章节。
- 用户明确 staging 尚未上线，不需要该章节的兼容入口，因此不保留跳转提示、专用锚点或重定向。四个独立类页及每页十个方法正文保持不变。
- 更新六处引用：Android/C++ API 概览各一处，以及四个平台的 RTC 版本说明各一处，直接指向独立类页。除链接目标外，其余文字不变。
- 不修改共享渲染器、导入器、依赖、SDK 签名或语义，不扩展到其他平台和英语内容。

## 源对照及链接检查

忽略 Markdown/HTML 展示标记及空白后，133 个章节正文与固定旧源逐节一致，无额外章节。此结论针对正文结构，不声称新旧框架生成的所有 DOM ID 或站点交互完全相同。

| 平台 | 一致章节 | 两页内部链接 | 保留标题/显式 ID | 后续相关参考固定 ID |
| --- | ---: | ---: | ---: | --- |
| Android | 34 | 681 | 152 | 26–33 |
| C++ | 38 | 720 | 162 | 29–36 |
| iOS | 32 | 650 | 149 | 24–29 |
| macOS | 29 | 613 | 136 | 21–26 |

八页共 2,664 个内部链接的路由/锚点检查通过，599 个剩余标题/显式 ID 无重复且目标不变。每个平台仅移除视频特效类章节的五个 ID：三个显式源 ID、类标题自动 ID，以及该节“相关参考”自动 ID。后续同名标题显式固定原 ID，避免错指其他接口。

全内容扫描未发现指向四个平台已删除锚点的文档链接残留。标题 ID 对比使用实际 `compile + remarkHeading`，链接提取复用仓库 `extractDocument`。静态提取器尚不识别 `[#id]`，因此标题兼容性以实际插件输出为准。

## 验证与边界

- `bun run test src/lib/rtc-pr2094-sync.test.ts`：40/40 通过；统一约束四平台无重复章节/兼容入口、相关引用与独立类页保持有效、其他接口的标题与 hash 对应关系不变。
- `bun run types:check`、`bun x biome check src/lib/rtc-pr2094-sync.test.ts`、`git diff --check`：通过。
- `bun run qa:api source --region cn`：0 新问题、53 个已知重复标题、0 过期豁免。
- 独立审查代理 `review_android_parity` 对扩展到四平台后的最终差异只读复核通过：删除范围准确、其余正文及 hash 不变、引用有效，四个独立类页各十个方法与固定源一致且目标存在。未冒称独立浏览器或 SDK 语义签核。
- 本地机器报告/脚本/截图位于忽略目录 `.agent/artifacts/rtc-interface-parity/`；Android 前一轮最终截图位于 `.agent/artifacts/android-interface-parity/no-compat-*.png`。QA 图片不提交。
- 提交 `eadf91084` 的兼容入口方案已撤销；其 157 ID / 682 链接及截图不是当前方案的验收证据。
- 本次为局部文档修正，未运行全量测试、生产构建、双地区全量浏览器发布验收或部署。

## 浏览器检查

实施者使用 HeadlessChrome 150，在局部 RTC 开发预览上完成 C++、iOS、macOS 三页的桌面 1280×720 浅色与移动端 390×844 深色检查（6/6）：正文/目录无视频特效类重复章节、无兼容提示，源专用锚点已移除，相邻章节连续显示，无整页横向溢出。逐一打开三个独立类页，均显示十个方法链接。六张视口截图已查看，见忽略目录中的 `*-desktop.png`、`*-mobile.png`；DOM 结果见 `browser.json`。

Android 内容本轮未再修改，沿用上轮删除兼容入口后的 1280×577 浅色、390×844 深色检查记录；本轮重新执行四平台源/链接/标题回归检查。以上是局部内容验证，不替代全站生产发布验收。
