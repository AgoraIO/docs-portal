# RTC 下载资源与旧源对齐

## 范围与基准

- 核对 RTC 下载页的 14 个平台入口，包含 SDK 下载、Demo、示例项目以及同页 tabs。
- 旧源：`AgoraIO/shengwang-doc-source`，fetch 后的 `origin/master@664ac1bf33476f7543bbb02f3bd1a20a77436d72`。冻结的卡片文案、链接与 Demo 元数据保存在 `src/test/fixtures/rtc-download-resources.json`。
- 浏览器对照 staging React 页与旧站 Electron 页；最终验收使用本地中文站。
- 延续 2026-11-02 的正文修复，进一步修复当时保留的卡片标题和 Electron 并列展示差异。

## 修复内容

| 范围 | 恢复内容 |
| --- | --- |
| Electron | 恢复 Electron / Electron for 统信 OS 两组同页 tabs；下载与示例区同步选择，每次只显示对应版本与两个仓库入口；统信面板只显示旧源自己的说明 |
| SDK 卡片 | 恢复全部平台原始标题，包括 iOS Audio、HarmonyOS NEXT Full / Audio、微信/QQ 小程序、Unreal；保留下载链接、版本、日期、包名、MD5 |
| Android / iOS | 恢复包体积前的基础库限定说明；Android 按架构显示列表；iOS 区分 Full / Audio 基础库与 Lite |
| macOS / Unity | macOS 不再显示旧源没有的包名；Unity 显示旧源的 v4.6.2，下载地址仍保留原始 build.1 包 |
| Web / React Demo | 恢复封面、标题、完整描述与体验按钮文案；React 使用「CodeSandbox 体验」 |
| 示例项目 | 恢复原始仓库卡片标题与 Gitee / GitHub 图标；Windows 保留 C++ / C# 区别，React、React Native、Electron 恢复 API-Examples |

复用现有 Fumadocs Tabs、Cards、RepositoryCardTitle 与下载卡片组件。没有添加旧站 JSX 兼容层。公共 SDK 目录的标题与数据选择逻辑不变。

Android / iOS 的 Demo 卡片原本已包含封面、完整描述和展开的二维码，本次保留并纳入核对。小程序旧源注释中的 Demo 不发布。平台分组未列出的遗留 `unreal.mdx` 不属于这 14 个入口。

## 验证

- 新增 43 项旧源一致性检查，覆盖全部 SDK 卡片的完整文字与下载 URL、全部仓库标题/图标/链接、Demo 图片与描述、Electron 页签分组。修复前 30 项失败，修复后全部通过。
- 与 SDK 卡片、正文回归测试合计 96 项通过；提 PR 时在仅包含本次改动的隔离分支重新运行 7 个相关测试文件，133 项全部通过，类型检查与改动文件 Biome 检查再次通过。
- 全量测试：336 个测试文件通过、1 个跳过；5567 项通过、6 项跳过。直接使用 `bun run test` 会读取本机 `.env.local` 的中文站/搜索/分析服务配置，与测试默认环境冲突；最终使用原 Vite 配置加空 `envDir` 的临时配置，通过 `node node_modules/vitest/vitest.mjs run --config .agent/artifacts/rtc-resource-parity/vitest-clean.config.ts --maxWorkers=2 --testTimeout=30000` 完整运行相同测试集，退出码 0。未修改本机环境文件或测试断言来规避这些环境问题。
- `bun run types:check` 通过；改动 TypeScript / JSON 文件的 Biome 检查通过；`git diff --check` 通过。
- 浏览器核对 14 个平台、21 个页签状态：SDK 卡片完整文字与链接、示例项目标题/图标/链接均与冻结旧源一致；Demo 图片与描述保留，React 封面加载成功。Electron 的下载区与示例区切换联动正常，390px 窄屏无横向溢出。
- `bun run docs:links` 执行完成；全仓报告 210 条内部链接问题，本次 RTC 下载目录未出现在问题列表中。外链与冻结旧源逐项比对，没有逐一下载 SDK 包。
- 浏览器检查结果、截图、检查脚本与运行日志位于忽略目录 `.agent/artifacts/rtc-resource-parity/`。

此变更修改本地源码，尚未部署到 staging。
