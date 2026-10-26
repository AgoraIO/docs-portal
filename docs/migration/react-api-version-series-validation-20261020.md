# React API 双版本系列验收（2026-10-20）

## 范围与结果

工作分支 `codex/react-api-version-series`，基线 `7ed48130f4`（已包含 React API 目录调整）。按已确认设计，React 概览、组件、Hooks、类型定义显示 v2.5.0 与 6 个 React 历史版本；`web-sdk` 及后代显示 v4.22.0 与 3 个底层 Web 历史版本。

仅 React 根 `meta.json` 增加版本配置。原侧栏 pages、sidebarLabels、子目录和 API 正文语义不变；没有给 Web 新建 navScope。通用解析器按最长完整路径片段选择覆盖数组，同时用于 current 与菜单；query/hash 不影响系列，没有客户端持久系列状态。生成器保留整个手工维护的 navScope，无需修改生成器生产逻辑。

## 归档入口核验

2026-10-20 本次实施期间对下列 9 项直接 GET：均 HTTP 200，最终 URL 与请求 URL 相同，无跳转到首页或 404。React 页面的 HTML 标题仅为“概览”，因此另外逐项打开归档页读取当前选中版本标签；Web 的 HTML 标题含明确 SDK 版本。

| 系列 | SDK 版本 | 站点归档 | 地址 | 可达性 | 同版本证据 |
| --- | --- | --- | --- | --- | --- |
| React SDK | v2.4.0 | 0.0.341 | [归档入口](https://doc-archive.shengwang.cn/archive/0.0.341/api-ref/rtc/react/react-sdk/overview) | 200，无跳转 | 当前版本标签 v2.4.0 |
| React SDK | v2.3.0 | 0.0.257 | [归档入口](https://doc-archive.shengwang.cn/archive/0.0.257/api-ref/rtc/react/react-sdk/overview) | 200，无跳转 | 当前版本标签 v2.3.0 |
| React SDK | v2.2.0 | 0.0.166 | [归档入口](https://doc-archive.shengwang.cn/archive/0.0.166/api-ref/rtc/react/react-sdk/overview) | 200，无跳转 | 当前版本标签 v2.2.0 |
| React SDK | v2.1.0 | 0.0.140 | [归档入口](https://doc-archive.shengwang.cn/archive/0.0.140/api-ref/rtc/react/react-sdk/overview) | 200，无跳转 | 当前版本标签 v2.1.0 |
| React SDK | v2.0.0 | 0.0.44 | [归档入口](https://doc-archive.shengwang.cn/archive/0.0.44/api-ref/rtc/react/react-sdk/overview) | 200，无跳转 | 当前版本标签 v2.0.0 |
| React SDK | v2.0.0-beta.0 | 0.0.34 | [归档入口](https://doc-archive.shengwang.cn/archive/0.0.34/api-ref/rtc/react/react-sdk/overview) | 200，无跳转 | 当前版本标签 v2.0.0-beta.0 |
| 底层 Web SDK | v4.21.0 | 0.0.166 | [归档入口](https://doc-archive.shengwang.cn/archive/0.0.166/api-ref/rtc/react/overview) | 200，无跳转 | HTML 标题包含 v4.21.0 |
| 底层 Web SDK | v4.20.0 | 0.0.140 | [归档入口](https://doc-archive.shengwang.cn/archive/0.0.140/api-ref/rtc/react/overview) | 200，无跳转 | HTML 标题包含 v4.20.0 |
| 底层 Web SDK | v4.19.3 | 0.0.44 | [归档入口](https://doc-archive.shengwang.cn/archive/0.0.44/api-ref/rtc/react/overview) | 200，无跳转 | HTML 标题包含 v4.19.3 |

以上核验覆盖入口和页面版本信号，不代表逐个核对全部历史 API 正文。没有替换或推测清单外的归档版本。

## zh-CN 浏览器验收

预览运行于 `http://127.0.0.1:3108`，使用 CN 区域配置（`VITE_DOCS_REGION=cn`），显式访问 `/zh-CN/...`。桌面与 390×844 窄屏均已检查：

- React 概览：菜单 7 项，为 v2.5.0、v2.4.0、v2.3.0、v2.2.0、v2.1.0、v2.0.0、v2.0.0-beta.0。
- 从侧栏进入 Web 概览：同一菜单变为 v4.22.0、v4.21.0、v4.20.0、v4.19.3，React 四个入口与 Web 分组仍保留。
- 进入 IAgoraRTCClient 接口：菜单保持 v4.22.0；点击 Hooks 返回 v2.5.0。
- 浏览器后退到 Web 接口恢复 v4.22.0，前进到 Hooks 恢复 v2.5.0。
- 直接访问隐藏类型 `web-sdk/interfaces/networkquality?qa=1#intro` 并刷新，菜单仍为 Web v4.22.0。
- 两套菜单的 current href 分别为各自本站概览；9 个历史菜单项均为原生链接，带 `target="_blank"` 与 `rel="noopener noreferrer"`。
- 窄屏导航内 Web 菜单 4 项；从导航点击 Hooks 后重新打开，React 菜单恢复 7 项。临时视口覆盖已重置。

截图仅保存于忽略目录 `.agent/artifacts/react-api-series/`，不随 Git 提交或上传：
`react-menu.png`、`web-menu.png`、`mobile-web-menu.png`、`mobile-react-menu.png`。

开发预览控制台观察到主题按钮深色／浅色的 SSR hydration mismatch；堆栈指向现有主题按钮，当前改动未涉及主题组件。本轮未处理这一独立问题。页面最终可正常交互；开发模式的首次加载和后退数据加载需等待完成后再核对版本。

## 自动化与独立审查

- 测试先红后绿：元数据/真实 payload 原先缺少菜单产生 9 项预期失败；schema/resolver 缺少覆盖能力产生预期失败，实施后转绿。
- 覆盖默认回退、Web 深层/隐藏页面、完整片段边界、最长路径优先、query/hash、旧 scope 行为、ID 唯一性、非法路径、真实侧栏和生成器配置保留。
- 质量审查发现省略可选 href 的 index-only scope 边界问题；补充 Web 隐藏深链和兄弟路径不归属的失败测试后修复，包含跨 scope 本地链接变体。
- 独立规格审查通过（4 个轻量测试文件、133 项）；质量审查在边界修复后复审通过（3 个轻量测试文件、115 项），无未解决的具体缺陷。
- 最终代码 `bun run test --maxWorkers=4 --silent`：258 个文件通过，3441 项通过、2 项跳过，退出码 0。
- `bun run types:check`：通过。
- `bun run lint`：退出码 0；保留仓库既有 20 条 warning、5 条 info。
- 针对 8 个改动代码／元数据文件的 Biome 检查及 `git diff --check`：通过。
- 单独比较修改前后的 React 元数据：移除 navScope 后内容相同，确认 pages/sidebarLabels 未改变。

## 交付边界

本轮只保留本地实现与工作分支；未推送、创建 PR 或合并。不变更其他产品版本，不迁移历史正文，不改变页面 URL。
