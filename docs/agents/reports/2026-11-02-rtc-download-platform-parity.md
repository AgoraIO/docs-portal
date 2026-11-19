# RTC 下载页逐平台核对

核对日期：2026-11-02。首次调查按请求记录内容差异，没有修改下载页正文或运行时代码；后续代码 tabs 样式与正文修复记录见文末。前面的逐平台差异表保留首次调查时的状态。

## 基准和范围

- 工作分支：`codex/rtc-downloads-parity`。
- 工作树：`/Users/yejiayi/.codex/worktrees/rtc-downloads-parity/docs-portal`。
- 从当前分支 `codex/cn-newdoc-html-api-migration` 的已提交版本 `f54f5298a299ab6363c1b148db7f603b57c44ea6` 创建。原工作目录的未提交改动没有带入。
- 旧源：执行 `git fetch origin master` 后，读取 `AgoraIO/shengwang-doc-source` 的 `origin/master@8c4c9a4e5afcf260dae47314686c4e8941136c3a`（`Release 0.0.539`）。没有使用落后的本地 `master`，也没有切换、修改旧仓库正文。
- 线上：[staging Android 下载页](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/reference/downloads/android)及同目录下其余 13 个平台路由；[旧站 Android 下载页](https://doc.shengwang.cn/doc/rtc/android/resources)用浏览器复核。
- 对照旧源 13 个 `docs/rtc/resources.*.mdx`，对应新站 14 个可见平台入口。两个 Unreal 入口共用一份旧源。旧源 MDX 注释中的小程序 Demo 没有作为应发布内容计入。

## Android 多出内容的原因

Android 旧源 `docs/rtc/resources.android.mdx` 的开头顺序是：简介 → 通过 Gradle 自动集成 SDK。没有 Windows 提示。

新站则先显示公共 `downloads/index.mdx` 的正文，再显示 `downloads/android.mdx` 的完整正文：

```text
公共 index：简介
公共 index：信息提示（第一条是 Windows C++ / MSVC）
Android 面板：简介
Android 面板：通过 Gradle 自动集成 SDK
```

因此截图中多出的不是 Android 源文件的新章节，而是公共正文叠加出来的简介和提示框。Android 自身的四个二级章节与旧源一致。

证据位置：

- `content/docs/zh-CN/realtime-media/rtc/reference/downloads/index.mdx:23`：公共简介。
- 同文件 `:25`：公共信息框；`:26`：Windows C++ / MSVC 提示。
- `content/docs/zh-CN/realtime-media/rtc/reference/downloads/android.mdx:4`：重复简介，后面保留 Android 自身完整内容。
- `src/components/docs-shell/DocsContent.tsx:419`：`platform-group` 分支先渲染 `resolvedBody.contentPath`，再渲染平台面板。组件按既有平台分组约定工作；错误在这组下载内容的公共/平台归属。
- [旧源 Android 文件](https://github.com/AgoraIO/shengwang-doc-source/blob/8c4c9a4e5afcf260dae47314686c4e8941136c3a/docs/rtc/resources.android.mdx)。

Git 追溯：

1. `e7eea416f3`（`feat: migrate zh-CN SDK downloads into docs portal (#679)`）已经创建了带简介和信息框的公共 index，最初第一条为 `libc++ / libstdc++`。
2. `7a3ff2585dc4cc9ec91c53e3ccc932ae6534e183`（`docs: sync CN migration hotfixes (#940)`）把公共信息框第一条替换成 Windows 专属的 MSVC 提示。这条提示在旧源只属于 `resources.windows.mdx` 的“下载 SDK (C++)”章节。
3. `d911034639596d68ec8d05f18e6909f2e580b399`（`fix: 对齐中文 SDK 下载入口、卡片与资源详情 (#1326)`）调整了平台入口及顺序，没有移除这段公共正文。

## 影响范围

浏览器逐一打开 14 个路由，当前显示的平台均与 URL 一致，但 14 个页面顶部都出现同一个 MSVC 信息框。其中 13 个非 Windows 平台收到无关提示；Windows 的提示也被移到了页面顶部，而不是旧源的“下载 SDK (C++)”章节。

另外，公共简介一律提到 Demo。旧源的 macOS、Windows、HarmonyOS、Unity、Flutter、Unreal 简介只提 SDK 和示例项目，Electron、React Native 源文件没有这段简介，因此这些页面也存在简介内容或范围差异。

## 逐平台结果

下表的“缺原信息框”指面板未保留旧源的 `libc++ / libstdc++`、FAT Image 说明；发版说明和快速开始链接虽仍在公共框中，但位置改变。Android 以外的 11 个非 Windows、非 HarmonyOS 入口存在这一遗漏。该措辞是否适用于每个平台属于旧源自身的问题，本轮仅记录迁移差异。

| 平台入口 | 旧源文件后缀 | SDK 版本 | 章节与资源核对 | 除公共 MSVC 提示外的主要差异 |
| --- | --- | --- | --- | --- |
| Android | `android` | 4.7.0 Full / Lite / Voice | 4 个章节、3 个 SDK 包、Demo、示例链接匹配 | 简介重复；平台原有信息框保留，导致发版说明/快速开始提示也重复 |
| iOS | `ios` | 4.7.0 Full / Lite / Audio | 5 个章节、3 个 SDK 包、Demo、示例链接匹配 | 缺原信息框及“集成动态库不同，实际包体积可能不同”的说明；CocoaPods/SPM 示例中选择 Full、Lite、子库的注释被删 |
| macOS | `macos` | 4.7.0 | 4 个章节、SDK 包、示例链接匹配 | 缺原信息框；CocoaPods 示例的选择性集成注释被删；简介新增 Demo |
| Web | `javascript` | 4.24.9 | 4 个章节、SDK 包、Web Demo、示例链接匹配；Tree shaking 指引保留 | 缺原信息框；省略推荐 npm 集成的说明句 |
| Windows | `windows` | C++ 4.7.0 | 3 个章节、SDK 包、NuGet、4 个示例链接匹配 | 原下载章节的信息框被移到公共顶部；简介新增 Demo；C# 示例标题由 `API-Examples (C#)` 改为仓库名 |
| HarmonyOS | `harmonyos` | Full / Voice 4.6.3 | 2 个章节、2 个 SDK 包、示例链接匹配 | 原有两条信息链接移至公共框并混入 MSVC；简介新增 Demo。旧源本来没有 libc++/FAT Image 段落 |
| 小程序 | `mini-program` | 2.6.5 | 3 个章节、SDK 包、示例链接匹配；未误恢复注释中的 Demo | 缺原信息框；遗漏 npm 方式“仅适用于 v2.6.0 及以上版本”的限制 |
| Electron | `electron` | 标准版 4.6.2；统信版 4.5.40-rc.2 | 2 个章节、2 个 SDK 获取入口、4 个示例链接匹配 | 缺原信息框；旧站标准/统信两个 Tab 合并为并列 SDK 卡片、示例列表；新增公共简介 |
| Unity | `unity` | Video / Voice 4.6.2 | 2 个章节、2 个 SDK 包、示例链接匹配 | 缺原信息框；简介新增 Demo |
| Flutter | `flutter` | 6.6.4，对应 Native 4.6.4 | 2 个章节、获取入口、示例链接匹配；Native 版本对应关系保留 | 缺原信息框；简介新增 Demo |
| React Native | `rn` | 4.6.4 | 2 个章节、获取入口、示例链接匹配 | 缺原信息框；新增公共简介 |
| Unreal (C++) | `unreal-cpp.unreal-blueprint` | Video / Voice 4.5.1 | 2 个章节、2 个 SDK 包、示例链接匹配 | 缺原信息框；“推荐 C++”注意框保留但提前到下载章节前；简介新增 Demo |
| Unreal (Blueprint) | 同上 | Video / Voice 4.5.1 | 与旧源共用包和示例一致 | 同 C++ 入口；没有发现 Blueprint 下载资源被错误替换的证据，旧源本来就共用资源文件 |
| React | `react` | 2.5.1 | 5 个章节、CDN、CodeSandbox Demo、示例链接匹配；React 18 / ReactDOM 18 依赖和加载顺序保留 | 缺原信息框；省略 npm 推荐和 CDN 引导句 |

其他文字简化包括多数面板删去“本节提供最新版本的 SDK”“本节提供 API 示例项目”等说明，以及下载卡片标题改用共享组件的平台/产品名称。这些与资源缺失分开记录。iOS/macOS 的 `Cocoapods` 改为标准拼写 `CocoaPods`，不视为章节遗漏。

## 下载数据和链接验证

- 使用与 `RtcSdkDownloads` 相同的数据优先级及 `getRtcDownloadCardEntries` 选卡逻辑，按每个平台面板实际调用的产品核对旧源 SDK 卡片，并再次与 staging DOM 中的对应卡片交叉验证。
- 共核对 23 个 SDK 卡片展示（两个 Unreal 入口各计 2 张，即 21 个不同的旧源 SDK 卡片）。下载/获取 URL、版本、发布日期，以及旧源提供的包名、MD5、包体积均匹配；Flutter 的 Native 版本对应关系匹配。
- 各面板 Demo 和示例仓库的外链保留，包括 Electron 统信分支、Windows C# 仓库、React CodeSandbox。Android Maven、React/ReactDOM CDN 地址在代码块中，按代码内容核对，没有把它们当成必须出现的可点击链接。
- 不把父级共享数据中存在、但平台 MDX 未调用的其他产品记录计入页面，也不把 Demo 的 `article` 元素计为 SDK 下载卡。
- 14 个路由逐一打开后均选中对应平台。主要二级章节的数量和顺序匹配旧源（仅 CocoaPods 拼写规范化）。
- 未逐一下载 SDK 压缩包或验证所有外链服务器的可用性。本文的“匹配”指与指定旧源及线上渲染的内容匹配，不代表每句话逐字一致。

## 建议修复边界

1. 将这组下载页的公共 index 收敛为平台配置，把简介和信息框放回各自平台面板，避免继续把某个平台的说明提升为全平台正文。不能只删除公共框而不补回其他面板依赖的说明。
2. 将 Windows 提示恢复到 Windows 下载章节；按旧源补回各平台信息框、iOS 包体积说明和小程序版本限制。Android 已保留的正文不需要重新拼接。
3. 补回影响集成选择的 CocoaPods/SPM 注释。Electron 并列展示和卡片标题属于展示差异，可沿用现有组件，不必为复刻旧布局修改公共渲染器。
4. 增加内容测试，明确公共 index 不得包含平台专属提示，各平台应保留对应说明。现有测试偏重 SDK 数据和入口顺序，未覆盖这次的公共正文归属问题。

## 首次调查验证记录

- `bun run test src/lib/cn-download-page-parity.test.ts src/lib/cn-download-detail-parity.test.ts src/components/docs-overview/RtcSdkDownloads.test.tsx --maxWorkers=2`：3 个文件、62 项通过。这也说明现有测试通过不能证明正文完全一致。
- `git diff --check` 通过。
- 仅新增本核对报告，未修正文或修改测试，因此没有将上述结果表述为修复验收，也没有执行全量构建和类型检查。
- 原始对照文件、卡片比较结果、14 路由核对 JSON、旧站和 staging Android 截图保存在忽略目录 `.agent/artifacts/rtc-download-audit/`，不纳入提交。

## 后续：代码 tabs 边框修复

用户随后指出 iOS 下载页的代码 tabs 左上、右上边框没有闭合。浏览器确认外框有 18px 圆角，但 `overflow` 为 `visible`，内部标签栏的方形背景覆盖了外框圆角。

在 `src/components/mdx.tsx` 的 `CodeBlockTabs` 外框补上 `overflow-hidden`，让标签栏和代码面板在外框圆角内绘制。未修改代码内容、tabs 状态逻辑或下载页正文。

- 修复前，在两个顶部圆角外侧位置进行浏览器命中检查，均命中内部元素；修复后均不再命中内部元素，与截图中恢复闭合的边框一致。
- iOS 音视频代码切换、SPM 同步切换和复制成功反馈正常。
- 390px 窄屏下页面没有横向溢出，代码内部仍能横向滚动；浅色和深色模式的边框均闭合。
- `bun run test --maxWorkers=2 --testTimeout=30000`：315 个文件通过，4985 项通过、2 项跳过。
- `bun run types:check`、`bunx biome check src/components/mdx.tsx`、`git diff --check` 通过。
- 修复前后、窄屏和深色截图保存在同一忽略目录下的 `code-tabs-*.png`。首次内容调查发现的问题仍未在此样式修复中改动。

## 后续：14 个平台正文修复

用户确认修复首次调查发现的内容差异后，再次 fetch 旧仓库 `master`，基准仍为 `8c4c9a4e5afcf260dae47314686c4e8941136c3a`。

已落实的修复：

1. 公共 `downloads/index.mdx` 只保留元数据，各平台自行承载原有简介。Android 不再出现两次简介，非 Windows 页不再显示 MSVC 提示；Electron、React Native 按旧源不加简介。
2. 将全部平台的信息框恢复到各自“下载 SDK”章节。Windows 使用 MSVC 提示，HarmonyOS 只有发版说明和快速开始链接，其余平台恢复旧源 libc++/FAT Image 原文。
3. 恢复 iOS 包体积免责声明、小程序 npm 集成的 v2.6.0 及以上限制，以及 CocoaPods/SPM 中 Full、Lite 和选择性集成动态库的注释。
4. 恢复各章节引导语、Web/React 的 npm 推荐说明和 React CDN 引导句。Unreal 的推荐 C++ 注意框恢复到下载章节内；Android 和 Unreal 按源 `caution` 类型使用对应 directive。
5. 保留共享下载卡片、Electron 并列展示及现有仓库卡片标题。14 个平台的章节顺序、SDK 组件调用、原有外部地址均未变化；此前代码 tabs 边框修复继续保留。

验证记录：

- 新增 `src/lib/rtc-download-body-parity.test.ts`，覆盖 14 个平台正文归属、MSVC 不串入其他平台、信息框位置、iOS 包体积说明、小程序限制、Unreal 注意框及 Apple 集成选择。修复前 20 项中 19 项失败；修复后与既有下载相关测试合计 82 项通过。
- 按实际 MDX 渲染检查全部 14 个面板：公共正文为空，各平台简介数量和旧源一致，MSVC 只出现在 Windows，信息说明均只出现一次；23 张 SDK 卡片正常渲染。
- 浏览器查看 Android、Windows、小程序及 iOS 页面；iOS 恢复集成注释后，代码 tabs 圆角裁切仍然有效。截图和渲染结果位于 `.agent/artifacts/rtc-download-audit/repaired-*`。
- `bun run types:check`、改动 TypeScript 文件的 Biome 检查通过。
- 独立只读审查对照全部平台与指定旧源，未发现需要修复的问题。
- 最终全量 `bun run test --maxWorkers=2 --testTimeout=30000`：316 个文件通过，5005 项通过、2 项跳过。`git diff --check` 通过。

## 逐处修复前后截图

按用户要求，对本分支每个可见改动区域补充前后截图。修复前由 `f54f5298a299ab6363c1b148db7f603b57c44ea6` 的独立本地快照渲染，修复后由当前工作树渲染；使用相同依赖、浏览器、1440×1100 视口和对应页签。代码 tabs 边框另补充深色及 390×844 窄屏对比。

- 共 57 组左右对比图、114 张局部裁切图、34 张整页原图，覆盖 14 个平台和全部 16 个发生可见变化的源文件。
- 根据 Git 差异建立 60 个平台正文改动区域的对应关系，加上公共 index 与代码 tabs 组件，共 62 条覆盖记录。相邻代码注释修改合并到对应章节；iOS CocoaPods 音频、视频页签分别截图。
- 已检查 57 张对比图的浏览器加载、平台筛选、裁切边界和图像非空；逐张查看联系表，并放大检查简介、iOS 下载说明、代码注释及边框细节。
- 截图画廊：`.agent/artifacts/rtc-downloads-before-after/index.html`；目录清单：同目录 `README.md`；源码区域到截图的对应关系：`manifest.json`；离线包：`rtc-downloads-before-after.zip`。
- 全部截图保存在忽略目录，不加入 Git。新增的测试、调查报告及纯空行调整不具有独立页面效果。
