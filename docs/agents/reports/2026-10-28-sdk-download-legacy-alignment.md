# 中文 SDK 下载入口与旧站对齐

旧站核对基准：本地 `shengwang-doc-source`，提交 `150c49c26`。
目标工作树基线：`codex/cn-newdoc-html-api-migration` 的 `d43dd4572`。

## 入口名称与顺序

下载总页当前可见的 11 个产品均使用明确的产品入口配置，避免从历史平台数据自动推导可见选项。

| 产品 | 入口及顺序 | 旧站依据 |
| --- | --- | --- |
| 实时消息 | JavaScript、Java、Objective-C、Swift、C++、HarmonyOS、小程序（Beta）、Unity、Flutter | `docs/rtm2/_platforms_.meta.js` |
| RTC 视频 | Android、iOS、macOS、Web、Windows、HarmonyOS、小程序、Electron、Unity、Flutter、React Native、Unreal (C++)、Unreal (Blueprint)、React | `docs/rtc/_platforms_.meta.js`，排除非下载 SDK 的 RESTful |
| RTC 语音 | 按同一 RTC 顺序排列已有独立音频 SDK 下载包；不从视频包推造小程序、React Native 音频包 | `docs/rtc/resources.*.mdx` 及当前音频下载记录 |
| RTC 服务端 | C++、Java、Python、Go | `docs/rtc-server-sdk/_platforms_.meta.js` |
| 本地服务端录制 | 服务端 C++、服务端 Java | `docs/recording/_platforms_.meta.js` |
| RTSA | C | `docs/rtsa/_platforms_.meta.js`；Java 已注释 |
| 互动白板、Fastboard | Android、iOS、Web | `docs/whiteboard/_platforms_.meta.js`，排除 RESTful |
| 智能云会议引擎 | Android、iOS、Electron | `docs/meeting/_platforms_.meta.js`，排除 RESTful 和注释项 |
| Agora Agents | Go、Python、TypeScript | `docs/convoai/get-started/quick-start-agent.mdx` 的示例顺序 |
| 客户端组件 | Android、iOS、Web | `docs/convoai` 的客户端组件集成说明和现有下载记录 |

实现配置在 `src/components/docs-overview/cn-sdk-download-targets.ts`。
RTC、RTM、RTC 服务端及本地录制的下载详情页同步入口名称；原平台 URL 的文件保留，避免旧链接变成 404。

浏览器验收另发现平台详情链接会丢失所选语言：父页已经通过内容路径解析出来，但加载器又对其 `slugs` 执行 `slice(1)` 后查询。实际源对象的 slugs 不含 locale，因此误删了产品顶层目录，触发返回默认页。修复为直接使用已解析的父页，并加入不含 locale 前缀的回归用例；修复前该用例返回重定向，修复后保留指定平台。实际 `/rtc-server-sdk/reference/downloads/python` 已验证选中 Python。

## RTM 的 11 项为什么不等于 11 种 SDK

原聚合表混入 React Native、单独列出 macOS、把 C++ 拆成 Windows/Linux，同时遗漏 Swift。
这轮按旧站导航恢复 9 个可见入口：

- React Native 的安装说明仍存在于 `shared/rtm2/_sdkdownload.mdx`，但没有出现在当前 `_platforms_.meta.js`，所以不作为中文下载总页入口。这里不据此判断该 SDK 已退休。
- macOS 归属 Apple SDK 的平台支持范围，不再单列成另一个语言入口。依据 `docs/rtm2/overview/platform-support.ios.swift.mdx`。
- 旧总页查询 `product=signaling&platform=macos` 通过独立查询别名选中 Objective-C，不再回落到 JavaScript，也不重新引入旧 macOS 包。
- Swift 与 Objective-C 共用 `RTM_OC_SDK_v2.3.0.zip`，共享片段明确使用 `platformList={['ios','swift']}`。
- C++ 合为一个入口，内部保留现有 Windows、Linux 两个包。旧站平台支持页列出这两个系统；共享安装片段直接列出 Windows 包，Linux 包地址沿用迁移表中已有的 2.3.0 记录，不声称它来自该共享片段。
- 小程序保留旧站的 Beta 标记，使用现有 `shengwang-rtm-miniapp` 包入口。

## 下载信息与版本差异

- 补齐互动白板 Android/iOS 和 Fastboard iOS 默认卡片的 ZIP、包名、MD5、发布日期。这些信息原已存在于重复的同版本记录中，但总页选择第一条记录时只显示包管理器入口。值均与旧站资源页一致。
- Fastboard Android 保持 1.7.2，Web 保持 1.1.0。旧站资源页分别仍写 1.6.2、1.0.0，但同仓库 `release-notes-fb.android.mdx`、`release-notes-fb.javascript.mdx` 已有这些新版；不回退到过期版本，也不把旧包的 MD5 复制给新版。
- 本轮没有重新验证全部外部下载服务器的可用性；入口和资源依据来自本地源码及已维护的迁移数据。

## 验证

### 安装入口与 MD5 展示

- 中文下载卡片不展示独立的包管理器、安装说明或发布页链接。提供 ZIP 时保留下载入口；只有包管理器时保留右上角“获取”入口；命令型 SDK 保留安装命令和复制按钮。
- 详情文档中的 Maven、CocoaPods、SPM 等集成说明继续保留，RTM Java 和 Apple SDK 的说明已按旧站共享片段补齐。
- MD5 按旧站公布值显示。相同下载 URL 的已有校验值核对一致；未公布的值不补造，也不复用其他版本的值。
- 移除不再使用的安装入口数据、组件和辅助函数。相关 6 个测试文件、184 项测试及类型检查通过。

- 组件测试逐项锁定全部 11 个产品的入口名称和顺序。
- RTM 测试覆盖 Swift 共用包、C++ 两个 OS 包、语言图标和详情页链接。
- 文档测试覆盖四类下载详情页的完整入口顺序及对应文件存在性。
- 浏览器检查总页、RTM 详情页切换、桌面和窄屏布局；截图保存在忽略目录 `.agent/artifacts/`。
- 直接读取旧站平台配置比对 8 组产品：名称和顺序一致；50 个下载详情链接均有对应内容文件。
- 最终全量：`bun run test --maxWorkers=2 --testTimeout=30000`，300 个文件通过，4558 项通过、2 项跳过。默认并发运行曾触发全站文档扫描超时，降低并发后通过。
- `bun run types:check` 和 `git diff --check` 通过。
