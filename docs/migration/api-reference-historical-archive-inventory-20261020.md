# API Reference 历史版本归档入口盘点（2026-10-20）

> 阶段说明：本文件保留源配置盘点与调查阶段记录。运行接入及 13 项覆盖的当前验证状态见 [实施验证报告](./api-reference-historical-archive-validation-20261020.md)；文中“尚未接入”等表述指资料整理阶段，不表示当前分支仍未接入。

> 实施前必读：源清单中有 13 个入口已确认跳入旧站 404。它们的可用替代入口已通过 GET、浏览器版本标签及历史源码核验，记录在 [URL 覆盖文件](./api-reference-archive-url-overrides-20261020.json) 和 [404 调查报告](./api-reference-archive-404-investigation-20261020.md)。接入时先读取本清单，再按覆盖文件修正这 13 项的目标地址。下面逐版本表仍保留 master 的原始映射，方便追溯。

## 范围与基线

- **原本地旧分支基线 `61935883a` 已作废**：它属于 `codex/release-docs-convoai-v2.14`，落后于旧站主线，不能代表当前发布配置；原 224 项 / 219 URL 的结果也随之撤销。
- 本报告已全面改用旧站远端最新基线 [`e91218031d7dd02ff84a66fc1b5f422a1cd28a64`](https://github.com/AgoraIO/shengwang-doc-source/commit/e91218031d7dd02ff84a66fc1b5f422a1cd28a64)（简写 `e91218031`）：本轮已 fetch 的 `origin/master` 与 `origin/release/prod` 指向同一提交。全部旧站证据通过 `git show <固定SHA>:<path>` 读取，来源链接固定到该 commit 及行号；没有切换旧站分支或改动工作区。
- 新站对照基线仍为 `/Users/yejiayi/Documents/docs-portal`，HEAD `7c6c60ead4`。
- 本次仅整理源码与已有导航配置，没有修改产品导航、版本配置或 API 正文。仅使用已同步的 Git 对象，**未联网检查归档可达性**；下表 URL 是按最新旧站源码与平台入口推导的候选外链，不代表已确认线上返回 200 或内容版本一致。
- 线上复核补充（2026-10-20）：已验证用户报告的 13 个源入口均重定向到 `https://doc.shengwang.cn/404`，最终 HTTP 为 200；另找到并验证了 13 个同版本替代入口。此前“未联网检查”描述的是最初盘点阶段，现阶段线上验证覆盖以调查报告及覆盖文件为准，其余入口不据此视作已验证。
- 完整读取最新 API 产品清单及全部 17 份平台配置（含未在产品清单启用的目录），按 JavaScript 生效配置计算；注释中的配置不计入。没有平台配置通过 `require`/`import` 导入其他版本表，RTC 文件内的 `commonExcludes` 已纳入判断。

## 汇总

旧站最新配置有 **9 个产品配置组、44 个平台、45 个版本系列、228 个历史版本选项，对应 223 个去重归档入口 URL**。Whiteboard 与 Fastboard 在旧站均展示为“互动白板”，因此按展示产品合并是 8 类产品。React 同平台分 React SDK 与底层 Web SDK 两个版本系列。

| 产品配置 | 平台数 | 版本系列 | 历史版本选项 | 去重入口 URL |
| --- | ---: | ---: | ---: | ---: |
| 对话式 AI 引擎（`convoai`） | 5 | 5 | 10 | 10 |
| 实时互动（`rtc`） | 14 | 15 | 111 | 111 |
| 实时消息（`rtm2`） | 8 | 8 | 63 | 58 |
| 媒体流加速（`rtsa`） | 1 | 1 | 5 | 5 |
| 互动白板（`whiteboard`） | 3 | 3 | 10 | 10 |
| 互动白板 Fastboard（`fastboard`） | 3 | 3 | 8 | 8 |
| 本地服务端录制（`recording`） | 2 | 2 | 2 | 2 |
| RTC 服务端 SDK（`rtc-server-sdk`） | 4 | 4 | 9 | 9 |
| 灵动课堂（`flexible-classroom`） | 4 | 4 | 10 | 10 |
| 合计 | 44 | 45 | 228 | 223 |

数量依据见后文逐平台版本表；RTM Android/iOS 各有 3 个版本标签共用同一归档 URL，C++ 有 2 个版本标签共用同一 URL，故 228 个选项去重为 223 条。标签不能因此直接删除。

### 各产品 / 平台历史范围与 current

同值平台合并；包含只有 current、没有历史归档的系列，合计覆盖 51 条 current 配置。范围只表示已列配置的最早与最新标签，**不表示中间每个版本均有归档**。RN 的 v6.x 异常单列，React beta 按预发布早于正式版排序。

| 产品配置 | 平台 / 系列 | 最新旧站 current | 已配置历史范围 | 历史项数（每平台） | 证据 |
| --- | --- | --- | --- | ---: | --- |
| convoai | Android（android）、iOS（ios）、Web（typescript） | v2.9.0 | v1.6.0–v1.7.0 | 2 | [android](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/convoai/_platforms_.meta.js#L29)、[ios](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/convoai/_platforms_.meta.js#L52)、[typescript](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/convoai/_platforms_.meta.js#L75) |
| convoai | restclient-go（go） | v0.12.0 | v0.7.0–v0.10.0 | 2 | [go](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/convoai/_platforms_.meta.js#L98) |
| convoai | restclient-java（java） | v0.7.0 | v0.3.0–v0.5.0 | 2 | [java](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/convoai/_platforms_.meta.js#L121) |
| rtc | Android（android）、iOS（ios） | v4.7.0 | v4.2.2–v4.6.4 | 12 | [android](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L9)、[ios](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L75) |
| rtc | macOS（macos）、C++ (全平台)（windows） | v4.7.0 | v4.2.2–v4.6.2 | 11 | [macos](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L141)、[windows](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L274) |
| rtc | Web（javascript） | v4.24.9 | v4.18.1–v4.24.1 | 14 | [javascript](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L203) |
| rtc | HarmonyOS（harmonyos） | v4.4.2 | v4.4.0–v4.4.1 | 2 | [harmonyos](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L336) |
| rtc | 小程序（mini-program） | v2.6.5 | v2.6.0 | 1 | [mini-program](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L384) |
| rtc | Electron（electron） | v4.6.2 | v4.2.2–v4.5.2 | 8 | [electron](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L403) |
| rtc | Unity（unity） | v4.6.2 | v4.2.2–v4.5.1 | 8 | [unity](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L453) |
| rtc | Flutter（flutter） | v6.6.4 | v6.2.2–v6.6.2 | 9 | [flutter](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L503) |
| rtc | React Native（rn） | v4.6.4 | v4.3.2–v4.6.2（正常 v4.x）；v6.2.2–v6.3.0（源码异常标签） | 8 | [rn](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L557) |
| rtc | Unreal (C++)（unreal-cpp）、Unreal (Blueprint)（unreal-blueprint） | v4.5.1 | v4.2.1–v4.5.0 | 3 | [unreal-cpp](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L607)、[unreal-blueprint](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L637) |
| rtc | React（react） / React SDK | v2.5.0 | v2.0.0-beta.0–v2.4.0 | 6 | [react](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L667) |
| rtc | React（react） / 底层 Web SDK | v4.22.0 | v4.19.3–v4.21.0 | 3 | [react](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L667) |
| rtm2 | JavaScript（javascript） | v2.3.0 | v2.1.3–v2.2.4 | 12 | [javascript](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L2) |
| rtm2 | Java（android）、Objective-C（ios） | v2.3.0 | v2.1.4–v2.2.8 | 15 | [android](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L66)、[ios](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L141) |
| rtm2 | Swift（swift） | v2.3.0 | v2.2.2–v2.2.8 | 5 | [swift](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L217) |
| rtm2 | C++（cpp） | v2.3.0 | v2.1.8–v2.2.8 | 11 | [cpp](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L252) |
| rtm2 | Unity（unity） | v2.1.9 | v2.1.4 | 1 | [unity](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L311) |
| rtm2 | Flutter（flutter） | v2.2.6 | v2.2.1–v2.2.5 | 3 | [flutter](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L330) |
| rtm2 | HarmonyOS（harmonyos） | v2.3.0 | v2.2.8 | 1 | [harmonyos](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L366) |
| rtsa | C（c） | v1.10.1 | v1.9.2–v1.9.7 | 5 | [c](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtsa/_platforms_.meta.js#L14) |
| whiteboard | Android（android） | v2.16.100 | v2.16.59–v2.16.86 | 3 | [android](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/whiteboard/_platforms_.meta.js#L2) |
| whiteboard | iOS（ios） | v2.16.112 | v2.16.62–v2.16.95 | 3 | [ios](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/whiteboard/_platforms_.meta.js#L32) |
| whiteboard | Web（javascript） | v2.16.53 | v2.16.43–v2.16.51 | 4 | [javascript](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/whiteboard/_platforms_.meta.js#L59) |
| fastboard | Android（android） | v1.7.2 | v1.3.4–v1.6.2 | 3 | [android](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/fastboard/_platforms_.meta.js#L2) |
| fastboard | iOS（ios） | v1.4.2 | v1.2.2–v1.4.0 | 2 | [ios](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/fastboard/_platforms_.meta.js#L29) |
| fastboard | Web（javascript） | v1.1.0 | v0.3.8–v1.0.0 | 3 | [javascript](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/fastboard/_platforms_.meta.js#L52) |
| recording | 服务端 C++（cpp）、服务端 Java（java） | v4.4.151 | v4.4.150 | 1 | [cpp](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/recording/_platforms_.meta.js#L27)、[java](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/recording/_platforms_.meta.js#L49) |
| rtc-server-sdk | C++（cpp） | v4.4.32 | v4.0.1–v4.4.30 | 5 | [cpp](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc-server-sdk/_platforms_.meta.js#L2) |
| rtc-server-sdk | Java（java） | v4.4.32 | v4.0.1–v4.4.30 | 2 | [java](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc-server-sdk/_platforms_.meta.js#L39) |
| rtc-server-sdk | Python（python）、Go（go） | v2.2.4 | v2.1.0 | 1 | [python](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc-server-sdk/_platforms_.meta.js#L64)、[go](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc-server-sdk/_platforms_.meta.js#L83) |
| flexible-classroom | Android（android）、iOS（ios） | v2.8.60 | v2.8.50 | 1 | [android](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/flexible-classroom/_platforms_.meta.js#L2)、[ios](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/flexible-classroom/_platforms_.meta.js#L24) |
| flexible-classroom | Web（javascript）、Electron（electron） | v2.9.40 | v2.8.50–v2.9.20 | 4 | [javascript](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/flexible-classroom/_platforms_.meta.js#L46)、[electron](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/flexible-classroom/_platforms_.meta.js#L77) |
| rtc | C# Windows（csharp） | v4.2.0 | 无 | 0 | [csharp](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L366) |
| cloud-recording | Go（go） | v0.8.0 | 无 | 0 | [go](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/cloud-recording/_platforms_.meta.js#L2) |
| cloud-recording | Java（java） | v0.4.0 | 无 | 0 | [java](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/cloud-recording/_platforms_.meta.js#L17) |
| meeting | Android（android）、iOS（ios）、Electron（electron） | v3.1.0 | 无 | 0 | [android](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/meeting/_platforms_.meta.js#L2)、[ios](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/meeting/_platforms_.meta.js#L17)、[electron](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/meeting/_platforms_.meta.js#L32) |

## 旧站 URL 生成规则

1. 正式归档根地址是 `https://doc-archive.shengwang.cn/archive`，不是注释中的 beta 域名。来源：[data/constant.ts:15](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/data/constant.ts#L15)。
2. API 路由前缀为 `/api-ref`。来源：[plugins/content-docs.js:68](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/plugins/content-docs.js#L68)、[data/constant.ts:30](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/data/constant.ts#L30)。
3. 选择历史版本时，旧站从当前 `location.pathname` 去除站点 baseUrl，若有 `prevPlatform` 则替换路径中的平台段，再打开 `<archive-root>/<siteVersion><旧站pathname>`；`current` 不触发外链。来源：[src/components/versionSelector/ApiVersionSelector.tsx:111](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/src/components/versionSelector/ApiVersionSelector.tsx#L111)。
4. 下表为每个版本的稳定入口候选：通常取 `/api-ref/` + 平台 `landingPage`，并按上述规则生成。它不是所有 API 详情页的 URL 枚举，也不能改用新站 pathname 拼接。无需自行添加 `.html`。
5. React 的底层 Web SDK 表使用 `rtc/react/overview`，React wrapper 使用 `rtc/react/react-sdk/overview`；两者版本表不可混合。来源：[docs-api-reference/rtc/_sidebar_.meta.react.js:10](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_sidebar_.meta.react.js#L10)、[docs-api-reference/rtc/_sidebar_.meta.react.js:36](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_sidebar_.meta.react.js#L36)。

## 迁移前需要保留的特殊规则与疑点

- **RTM Web 旧平台名**：`v2.1.3 / 0.0.3` 配有 `prevPlatform: web`，其 URL 必须是 `/api-ref/rtm2/web/…`，不能仍用 `javascript`。来源：[docs-api-reference/rtm2/_platforms_.meta.js:59](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L59)。
- **React 双系列**：带 `pathFilter: /react-sdk` 的 6 条历史选项只用于 React SDK wrapper；不带过滤的 3 条用于底层 Web SDK。旧组件先筛匹配 `pathFilter`，没有匹配时才回退到无过滤项。来源：[docs-api-reference/rtc/_platforms_.meta.js:676](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L676)、[src/components/versionSelector/ApiVersionSelector.tsx:77](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/src/components/versionSelector/ApiVersionSelector.tsx#L77)。
- **RTC sunset 页不展示选择器**：Android、iOS、macOS、Windows 复用 `commonExcludes`；匹配 `/rtc_api_sunset` 时隐藏版本选择器。其他普通页面仍列有历史版本选项。JavaScript 的 `excludes` 为空，不受此规则影响。来源：[docs-api-reference/rtc/_platforms_.meta.js:1](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L1)、[src/components/versionSelector/ApiVersionSelector.tsx:59](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/src/components/versionSelector/ApiVersionSelector.tsx#L59)。普通 `excludes: [globals.html/index.html/modules.html]` 是生成源文件排除，不应理解成隐藏整个平台。
- **Fastboard 别名**：产品配置 `fastboard` 设置 `alias: whiteboard`，用于产品归属；实际旧 API URL 仍为 `/api-ref/fastboard/…`，不能改成 whiteboard。版本选择器优先用 `ag_usecase` 找产品，生成器会保留该 usecase。来源：[docs-api-reference/_products_.meta.js:46](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/_products_.meta.js#L46)、[plugins/plugin-content-docs-ag/doc-factory/processor/api-doc-processor.js:195](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/plugins/plugin-content-docs-ag/doc-factory/processor/api-doc-processor.js#L195)、[src/components/versionSelector/ApiVersionSelector.tsx:39](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/src/components/versionSelector/ApiVersionSelector.tsx#L39)。
- **原样保留、上线前核验**：ConvoAI Android/iOS 的 `v1.7.0` 配为 `0.0454`，Web 同版本为 `0.0.454`；RTC 小程序 `v2.6.0` 配为 `v0.0.166`（多了前导 v）。本报告按源码生成 URL，不猜测修正。来源：[docs-api-reference/convoai/_platforms_.meta.js:44](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/convoai/_platforms_.meta.js#L44)、[docs-api-reference/convoai/_platforms_.meta.js:67](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/convoai/_platforms_.meta.js#L67)、[docs-api-reference/convoai/_platforms_.meta.js:90](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/convoai/_platforms_.meta.js#L90)、[docs-api-reference/rtc/_platforms_.meta.js:399](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L399)。
- **React Native 标签可疑**：RTC RN 的较早 3 条标签是 `v6.3.0/v6.2.3/v6.2.2`，与同平台较新的 v4.x 不一致；不擅自改为 v4.x。来源：[docs-api-reference/rtc/_platforms_.meta.js:594](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L594)。
- **RTC HarmonyOS 路径大小写**：配置的 `landingPage` 写成 `rtc/HarmonyOS/…`，但平台 value 为 `harmonyos`，生成器按 value 生成路由，已有旧站 URL 快照也记录小写。因此表内两条候选采用 `/rtc/harmonyos/…`；归档快照自身仍待上线前核验。来源：[平台配置:346](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L346)、[API 生成器:355](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/plugins/plugin-content-docs-ag/doc-factory/processor/api-doc-processor.js#L355)、[旧站 URL 快照:2751](/Users/yejiayi/Documents/docs-portal/docs/migration/redirect-inputs/legacy-url-inventory-2026-10-14.json:2751)。
- **重复 URL**：RTM Android/iOS 的 `v2.1.12/v2.1.11/v2.1.10` 均是 `0.0.107`；C++ 的 `v2.1.12/v2.1.11` 均是 `0.0.134`。来源：[docs-api-reference/rtm2/_platforms_.meta.js:107](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L107)、[docs-api-reference/rtm2/_platforms_.meta.js:182](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L182)、[docs-api-reference/rtm2/_platforms_.meta.js:289](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L289)。
- **已纠正最新版本基线**：最新旧站 Android/iOS/macOS/Windows current 均为 v4.7.0；Android/iOS 上一历史版 v4.6.4 对应 `0.0.519`，不是旧 current。Web current 为 v4.24.9。本报告不再使用旧工作分支 current 推断发布状态，所有归档编号以固定主线提交为准。来源：[docs-api-reference/rtc/_platforms_.meta.js:20](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L20)、[docs-api-reference/rtc/_platforms_.meta.js:212](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L212)。

### 相对作废本地基线的纠正

- Android/iOS：current v4.6.4 → v4.7.0；新增历史 v4.6.4 / 0.0.519。
- macOS/Windows：current v4.6.2 → v4.7.0；新增历史 v4.6.2 / 0.0.519。
- Android/iOS 的 v4.6.2、Flutter 的 v6.6.2、React Native 的 v4.6.2：归档编号均由作废基线的 0.0.511 改为最新主线的 0.0.492。
- Web current v4.24.8 → v4.24.9；最新配置没有新增 v4.24.8 归档项，不自行补造。
- RTC 历史项 107 → 111；总历史项 224 → 228，去重 URL 219 → 223；其余产品数量不变。以上均已反映在下表固定提交证据中。

## 完整逐平台清单

表中的 current 仅记录最新旧站主线配置，不纳入历史版本数量，也不生成 `/archive/current`。每行“源码”定位至该条 siteVersion 所在行，平台标题下给出平台定义所属文件。全部 228 个非 current 项均列出。

### 对话式 AI 引擎（convoai）

#### Android（android）：2 项

旧站 current：v2.9.0。平台配置：[docs-api-reference/convoai/_platforms_.meta.js:29](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/convoai/_platforms_.meta.js#L29)。

| 显示版本 | siteVersion | 归档入口 URL | 源码 |
| --- | --- | --- | --- |
| v1.7.0 | `0.0454` | [https://doc-archive.shengwang.cn/archive/0.0454/api-ref/convoai/android/android-component/overview](https://doc-archive.shengwang.cn/archive/0.0454/api-ref/convoai/android/android-component/overview) | [L44](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/convoai/_platforms_.meta.js#L44) |
| v1.6.0 | `0.0.341` | [https://doc-archive.shengwang.cn/archive/0.0.341/api-ref/convoai/android/android-component/overview](https://doc-archive.shengwang.cn/archive/0.0.341/api-ref/convoai/android/android-component/overview) | [L48](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/convoai/_platforms_.meta.js#L48) |

#### iOS（ios）：2 项

旧站 current：v2.9.0。平台配置：[docs-api-reference/convoai/_platforms_.meta.js:52](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/convoai/_platforms_.meta.js#L52)。

| 显示版本 | siteVersion | 归档入口 URL | 源码 |
| --- | --- | --- | --- |
| v1.7.0 | `0.0454` | [https://doc-archive.shengwang.cn/archive/0.0454/api-ref/convoai/ios/ios-component/overview](https://doc-archive.shengwang.cn/archive/0.0454/api-ref/convoai/ios/ios-component/overview) | [L67](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/convoai/_platforms_.meta.js#L67) |
| v1.6.0 | `0.0.341` | [https://doc-archive.shengwang.cn/archive/0.0.341/api-ref/convoai/ios/ios-component/overview](https://doc-archive.shengwang.cn/archive/0.0.341/api-ref/convoai/ios/ios-component/overview) | [L71](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/convoai/_platforms_.meta.js#L71) |

#### Web（typescript）：2 项

旧站 current：v2.9.0。平台配置：[docs-api-reference/convoai/_platforms_.meta.js:75](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/convoai/_platforms_.meta.js#L75)。

| 显示版本 | siteVersion | 归档入口 URL | 源码 |
| --- | --- | --- | --- |
| v1.7.0 | `0.0.454` | [https://doc-archive.shengwang.cn/archive/0.0.454/api-ref/convoai/typescript/web-component/overview](https://doc-archive.shengwang.cn/archive/0.0.454/api-ref/convoai/typescript/web-component/overview) | [L90](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/convoai/_platforms_.meta.js#L90) |
| v1.6.0 | `0.0.341` | [https://doc-archive.shengwang.cn/archive/0.0.341/api-ref/convoai/typescript/web-component/overview](https://doc-archive.shengwang.cn/archive/0.0.341/api-ref/convoai/typescript/web-component/overview) | [L94](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/convoai/_platforms_.meta.js#L94) |

#### restclient-go（go）：2 项

旧站 current：v0.12.0。平台配置：[docs-api-reference/convoai/_platforms_.meta.js:98](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/convoai/_platforms_.meta.js#L98)。

| 显示版本 | siteVersion | 归档入口 URL | 源码 |
| --- | --- | --- | --- |
| v0.10.0 | `0.0.341` | [https://doc-archive.shengwang.cn/archive/0.0.341/api-ref/convoai/go/go-api/overview](https://doc-archive.shengwang.cn/archive/0.0.341/api-ref/convoai/go/go-api/overview) | [L113](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/convoai/_platforms_.meta.js#L113) |
| v0.7.0 | `0.0.307` | [https://doc-archive.shengwang.cn/archive/0.0.307/api-ref/convoai/go/go-api/overview](https://doc-archive.shengwang.cn/archive/0.0.307/api-ref/convoai/go/go-api/overview) | [L117](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/convoai/_platforms_.meta.js#L117) |

#### restclient-java（java）：2 项

旧站 current：v0.7.0。平台配置：[docs-api-reference/convoai/_platforms_.meta.js:121](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/convoai/_platforms_.meta.js#L121)。

| 显示版本 | siteVersion | 归档入口 URL | 源码 |
| --- | --- | --- | --- |
| v0.5.0 | `0.0.341` | [https://doc-archive.shengwang.cn/archive/0.0.341/api-ref/convoai/java/java-api/overview](https://doc-archive.shengwang.cn/archive/0.0.341/api-ref/convoai/java/java-api/overview) | [L136](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/convoai/_platforms_.meta.js#L136) |
| v0.3.0 | `0.0.307` | [https://doc-archive.shengwang.cn/archive/0.0.307/api-ref/convoai/java/java-api/overview](https://doc-archive.shengwang.cn/archive/0.0.307/api-ref/convoai/java/java-api/overview) | [L140](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/convoai/_platforms_.meta.js#L140) |

### 实时互动（rtc）

#### Android（android）：12 项

旧站 current：v4.7.0。平台配置：[docs-api-reference/rtc/_platforms_.meta.js:9](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L9)。

| 显示版本 | siteVersion | 归档入口 URL | 源码 |
| --- | --- | --- | --- |
| v4.6.4 | `0.0.519` | [https://doc-archive.shengwang.cn/archive/0.0.519/api-ref/rtc/android/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.519/api-ref/rtc/android/API/rtc_api_overview) | [L27](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L27) |
| v4.6.2 | `0.0.492` | [https://doc-archive.shengwang.cn/archive/0.0.492/api-ref/rtc/android/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.492/api-ref/rtc/android/API/rtc_api_overview) | [L31](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L31) |
| v4.6.0 | `0.0.405` | [https://doc-archive.shengwang.cn/archive/0.0.405/api-ref/rtc/android/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.405/api-ref/rtc/android/API/rtc_api_overview) | [L35](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L35) |
| v4.5.2 | `0.0.341` | [https://doc-archive.shengwang.cn/archive/0.0.341/api-ref/rtc/android/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.341/api-ref/rtc/android/API/rtc_api_overview) | [L39](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L39) |
| v4.5.1 | `0.0.282` | [https://doc-archive.shengwang.cn/archive/0.0.282/api-ref/rtc/android/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.282/api-ref/rtc/android/API/rtc_api_overview) | [L43](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L43) |
| v4.5.0 | `0.0.253` | [https://doc-archive.shengwang.cn/archive/0.0.253/api-ref/rtc/android/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.253/api-ref/rtc/android/API/rtc_api_overview) | [L47](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L47) |
| v4.4.0 | `0.0.211` | [https://doc-archive.shengwang.cn/archive/0.0.211/api-ref/rtc/android/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.211/api-ref/rtc/android/API/rtc_api_overview) | [L51](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L51) |
| v4.3.2 | `0.0.163` | [https://doc-archive.shengwang.cn/archive/0.0.163/api-ref/rtc/android/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.163/api-ref/rtc/android/API/rtc_api_overview) | [L55](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L55) |
| v4.3.1 | `0.0.134` | [https://doc-archive.shengwang.cn/archive/0.0.134/api-ref/rtc/android/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.134/api-ref/rtc/android/API/rtc_api_overview) | [L59](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L59) |
| v4.3.0 | `0.0.113` | [https://doc-archive.shengwang.cn/archive/0.0.113/api-ref/rtc/android/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.113/api-ref/rtc/android/API/rtc_api_overview) | [L63](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L63) |
| v4.2.3 | `0.0.69` | [https://doc-archive.shengwang.cn/archive/0.0.69/api-ref/rtc/android/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.69/api-ref/rtc/android/API/rtc_api_overview) | [L67](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L67) |
| v4.2.2 | `0.0.14` | [https://doc-archive.shengwang.cn/archive/0.0.14/api-ref/rtc/android/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.14/api-ref/rtc/android/API/rtc_api_overview) | [L71](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L71) |

#### iOS（ios）：12 项

旧站 current：v4.7.0。平台配置：[docs-api-reference/rtc/_platforms_.meta.js:75](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L75)。

| 显示版本 | siteVersion | 归档入口 URL | 源码 |
| --- | --- | --- | --- |
| v4.6.4 | `0.0.519` | [https://doc-archive.shengwang.cn/archive/0.0.519/api-ref/rtc/ios/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.519/api-ref/rtc/ios/API/rtc_api_overview) | [L93](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L93) |
| v4.6.2 | `0.0.492` | [https://doc-archive.shengwang.cn/archive/0.0.492/api-ref/rtc/ios/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.492/api-ref/rtc/ios/API/rtc_api_overview) | [L97](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L97) |
| v4.6.0 | `0.0.405` | [https://doc-archive.shengwang.cn/archive/0.0.405/api-ref/rtc/ios/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.405/api-ref/rtc/ios/API/rtc_api_overview) | [L101](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L101) |
| v4.5.2 | `0.0.341` | [https://doc-archive.shengwang.cn/archive/0.0.341/api-ref/rtc/ios/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.341/api-ref/rtc/ios/API/rtc_api_overview) | [L105](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L105) |
| v4.5.1 | `0.0.282` | [https://doc-archive.shengwang.cn/archive/0.0.282/api-ref/rtc/ios/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.282/api-ref/rtc/ios/API/rtc_api_overview) | [L109](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L109) |
| v4.5.0 | `0.0.253` | [https://doc-archive.shengwang.cn/archive/0.0.253/api-ref/rtc/ios/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.253/api-ref/rtc/ios/API/rtc_api_overview) | [L113](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L113) |
| v4.4.0 | `0.0.211` | [https://doc-archive.shengwang.cn/archive/0.0.211/api-ref/rtc/ios/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.211/api-ref/rtc/ios/API/rtc_api_overview) | [L117](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L117) |
| v4.3.2 | `0.0.163` | [https://doc-archive.shengwang.cn/archive/0.0.163/api-ref/rtc/ios/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.163/api-ref/rtc/ios/API/rtc_api_overview) | [L121](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L121) |
| v4.3.1 | `0.0.134` | [https://doc-archive.shengwang.cn/archive/0.0.134/api-ref/rtc/ios/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.134/api-ref/rtc/ios/API/rtc_api_overview) | [L125](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L125) |
| v4.3.0 | `0.0.113` | [https://doc-archive.shengwang.cn/archive/0.0.113/api-ref/rtc/ios/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.113/api-ref/rtc/ios/API/rtc_api_overview) | [L129](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L129) |
| v4.2.3 | `0.0.69` | [https://doc-archive.shengwang.cn/archive/0.0.69/api-ref/rtc/ios/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.69/api-ref/rtc/ios/API/rtc_api_overview) | [L133](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L133) |
| v4.2.2 | `0.0.14` | [https://doc-archive.shengwang.cn/archive/0.0.14/api-ref/rtc/ios/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.14/api-ref/rtc/ios/API/rtc_api_overview) | [L137](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L137) |

#### macOS（macos）：11 项

旧站 current：v4.7.0。平台配置：[docs-api-reference/rtc/_platforms_.meta.js:141](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L141)。

| 显示版本 | siteVersion | 归档入口 URL | 源码 |
| --- | --- | --- | --- |
| v4.6.2 | `0.0.519` | [https://doc-archive.shengwang.cn/archive/0.0.519/api-ref/rtc/macos/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.519/api-ref/rtc/macos/API/rtc_api_overview) | [L159](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L159) |
| v4.6.0 | `0.0.405` | [https://doc-archive.shengwang.cn/archive/0.0.405/api-ref/rtc/macos/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.405/api-ref/rtc/macos/API/rtc_api_overview) | [L163](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L163) |
| v4.5.2 | `0.0.341` | [https://doc-archive.shengwang.cn/archive/0.0.341/api-ref/rtc/macos/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.341/api-ref/rtc/macos/API/rtc_api_overview) | [L167](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L167) |
| v4.5.1 | `0.0.282` | [https://doc-archive.shengwang.cn/archive/0.0.282/api-ref/rtc/macos/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.282/api-ref/rtc/macos/API/rtc_api_overview) | [L171](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L171) |
| v4.5.0 | `0.0.253` | [https://doc-archive.shengwang.cn/archive/0.0.253/api-ref/rtc/macos/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.253/api-ref/rtc/macos/API/rtc_api_overview) | [L175](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L175) |
| v4.4.0 | `0.0.211` | [https://doc-archive.shengwang.cn/archive/0.0.211/api-ref/rtc/macos/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.211/api-ref/rtc/macos/API/rtc_api_overview) | [L179](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L179) |
| v4.3.2 | `0.0.163` | [https://doc-archive.shengwang.cn/archive/0.0.163/api-ref/rtc/macos/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.163/api-ref/rtc/macos/API/rtc_api_overview) | [L183](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L183) |
| v4.3.1 | `0.0.134` | [https://doc-archive.shengwang.cn/archive/0.0.134/api-ref/rtc/macos/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.134/api-ref/rtc/macos/API/rtc_api_overview) | [L187](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L187) |
| v4.3.0 | `0.0.113` | [https://doc-archive.shengwang.cn/archive/0.0.113/api-ref/rtc/macos/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.113/api-ref/rtc/macos/API/rtc_api_overview) | [L191](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L191) |
| v4.2.3 | `0.0.69` | [https://doc-archive.shengwang.cn/archive/0.0.69/api-ref/rtc/macos/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.69/api-ref/rtc/macos/API/rtc_api_overview) | [L195](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L195) |
| v4.2.2 | `0.0.14` | [https://doc-archive.shengwang.cn/archive/0.0.14/api-ref/rtc/macos/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.14/api-ref/rtc/macos/API/rtc_api_overview) | [L199](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L199) |

#### Web（javascript）：14 项

旧站 current：v4.24.9。平台配置：[docs-api-reference/rtc/_platforms_.meta.js:203](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L203)。

| 显示版本 | siteVersion | 归档入口 URL | 源码 |
| --- | --- | --- | --- |
| v4.24.1 | `0.0.379` | [https://doc-archive.shengwang.cn/archive/0.0.379/api-ref/rtc/javascript/overview](https://doc-archive.shengwang.cn/archive/0.0.379/api-ref/rtc/javascript/overview) | [L218](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L218) |
| v4.24.0 | `0.0.378` | [https://doc-archive.shengwang.cn/archive/0.0.378/api-ref/rtc/javascript/overview](https://doc-archive.shengwang.cn/archive/0.0.378/api-ref/rtc/javascript/overview) | [L222](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L222) |
| v4.23.0 | `0.0.345` | [https://doc-archive.shengwang.cn/archive/0.0.345/api-ref/rtc/javascript/overview](https://doc-archive.shengwang.cn/archive/0.0.345/api-ref/rtc/javascript/overview) | [L226](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L226) |
| v4.22.2 | `0.0.221` | [https://doc-archive.shengwang.cn/archive/0.0.221/api-ref/rtc/javascript/overview](https://doc-archive.shengwang.cn/archive/0.0.221/api-ref/rtc/javascript/overview) | [L230](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L230) |
| v4.22.1 | `0.0.197` | [https://doc-archive.shengwang.cn/archive/0.0.197/api-ref/rtc/javascript/overview](https://doc-archive.shengwang.cn/archive/0.0.197/api-ref/rtc/javascript/overview) | [L234](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L234) |
| v4.22.0 | `0.0.179` | [https://doc-archive.shengwang.cn/archive/0.0.179/api-ref/rtc/javascript/overview](https://doc-archive.shengwang.cn/archive/0.0.179/api-ref/rtc/javascript/overview) | [L238](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L238) |
| v4.21.0 | `0.0.166` | [https://doc-archive.shengwang.cn/archive/0.0.166/api-ref/rtc/javascript/overview](https://doc-archive.shengwang.cn/archive/0.0.166/api-ref/rtc/javascript/overview) | [L242](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L242) |
| v4.20.2 | `0.0.120` | [https://doc-archive.shengwang.cn/archive/0.0.120/api-ref/rtc/javascript/overview](https://doc-archive.shengwang.cn/archive/0.0.120/api-ref/rtc/javascript/overview) | [L246](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L246) |
| v4.20.1 | `0.0.87` | [https://doc-archive.shengwang.cn/archive/0.0.87/api-ref/rtc/javascript/overview](https://doc-archive.shengwang.cn/archive/0.0.87/api-ref/rtc/javascript/overview) | [L250](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L250) |
| v4.20.0 | `0.0.66` | [https://doc-archive.shengwang.cn/archive/0.0.66/api-ref/rtc/javascript/overview](https://doc-archive.shengwang.cn/archive/0.0.66/api-ref/rtc/javascript/overview) | [L254](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L254) |
| v4.19.2 | `0.0.40` | [https://doc-archive.shengwang.cn/archive/0.0.40/api-ref/rtc/javascript/overview](https://doc-archive.shengwang.cn/archive/0.0.40/api-ref/rtc/javascript/overview) | [L258](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L258) |
| v4.19.1 | `0.0.18` | [https://doc-archive.shengwang.cn/archive/0.0.18/api-ref/rtc/javascript/overview](https://doc-archive.shengwang.cn/archive/0.0.18/api-ref/rtc/javascript/overview) | [L262](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L262) |
| v4.19.0 | `0.0.12` | [https://doc-archive.shengwang.cn/archive/0.0.12/api-ref/rtc/javascript/overview](https://doc-archive.shengwang.cn/archive/0.0.12/api-ref/rtc/javascript/overview) | [L266](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L266) |
| v4.18.1 | `0.0.9` | [https://doc-archive.shengwang.cn/archive/0.0.9/api-ref/rtc/javascript/overview](https://doc-archive.shengwang.cn/archive/0.0.9/api-ref/rtc/javascript/overview) | [L270](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L270) |

#### C++ (全平台)（windows）：11 项

旧站 current：v4.7.0。平台配置：[docs-api-reference/rtc/_platforms_.meta.js:274](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L274)。

| 显示版本 | siteVersion | 归档入口 URL | 源码 |
| --- | --- | --- | --- |
| v4.6.2 | `0.0.519` | [https://doc-archive.shengwang.cn/archive/0.0.519/api-ref/rtc/windows/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.519/api-ref/rtc/windows/API/rtc_api_overview) | [L292](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L292) |
| v4.6.0 | `0.0.405` | [https://doc-archive.shengwang.cn/archive/0.0.405/api-ref/rtc/windows/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.405/api-ref/rtc/windows/API/rtc_api_overview) | [L296](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L296) |
| v4.5.2 | `0.0.341` | [https://doc-archive.shengwang.cn/archive/0.0.341/api-ref/rtc/windows/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.341/api-ref/rtc/windows/API/rtc_api_overview) | [L300](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L300) |
| v4.5.1 | `0.0.282` | [https://doc-archive.shengwang.cn/archive/0.0.282/api-ref/rtc/windows/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.282/api-ref/rtc/windows/API/rtc_api_overview) | [L304](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L304) |
| v4.5.0 | `0.0.253` | [https://doc-archive.shengwang.cn/archive/0.0.253/api-ref/rtc/windows/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.253/api-ref/rtc/windows/API/rtc_api_overview) | [L308](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L308) |
| v4.4.0 | `0.0.211` | [https://doc-archive.shengwang.cn/archive/0.0.211/api-ref/rtc/windows/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.211/api-ref/rtc/windows/API/rtc_api_overview) | [L312](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L312) |
| v4.3.2 | `0.0.163` | [https://doc-archive.shengwang.cn/archive/0.0.163/api-ref/rtc/windows/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.163/api-ref/rtc/windows/API/rtc_api_overview) | [L316](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L316) |
| v4.3.1 | `0.0.134` | [https://doc-archive.shengwang.cn/archive/0.0.134/api-ref/rtc/windows/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.134/api-ref/rtc/windows/API/rtc_api_overview) | [L320](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L320) |
| v4.3.0 | `0.0.113` | [https://doc-archive.shengwang.cn/archive/0.0.113/api-ref/rtc/windows/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.113/api-ref/rtc/windows/API/rtc_api_overview) | [L324](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L324) |
| v4.2.3 | `0.0.69` | [https://doc-archive.shengwang.cn/archive/0.0.69/api-ref/rtc/windows/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.69/api-ref/rtc/windows/API/rtc_api_overview) | [L328](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L328) |
| v4.2.2 | `0.0.14` | [https://doc-archive.shengwang.cn/archive/0.0.14/api-ref/rtc/windows/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.14/api-ref/rtc/windows/API/rtc_api_overview) | [L332](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L332) |

#### HarmonyOS（harmonyos）：2 项

旧站 current：v4.4.2。平台配置：[docs-api-reference/rtc/_platforms_.meta.js:336](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L336)。

| 显示版本 | siteVersion | 归档入口 URL | 源码 |
| --- | --- | --- | --- |
| v4.4.1 | `0.0.216` | [https://doc-archive.shengwang.cn/archive/0.0.216/api-ref/rtc/harmonyos/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.216/api-ref/rtc/harmonyos/API/rtc_api_overview) | [L354](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L354) |
| v4.4.0 | `0.0.197` | [https://doc-archive.shengwang.cn/archive/0.0.197/api-ref/rtc/harmonyos/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.197/api-ref/rtc/harmonyos/API/rtc_api_overview) | [L358](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L358) |

#### 小程序（mini-program）：1 项

旧站 current：v2.6.5。平台配置：[docs-api-reference/rtc/_platforms_.meta.js:384](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L384)。

| 显示版本 | siteVersion | 归档入口 URL | 源码 |
| --- | --- | --- | --- |
| v2.6.0 | `v0.0.166` | [https://doc-archive.shengwang.cn/archive/v0.0.166/api-ref/rtc/mini-program/overview](https://doc-archive.shengwang.cn/archive/v0.0.166/api-ref/rtc/mini-program/overview) | [L399](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L399) |

#### Electron（electron）：8 项

旧站 current：v4.6.2。平台配置：[docs-api-reference/rtc/_platforms_.meta.js:403](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L403)。

| 显示版本 | siteVersion | 归档入口 URL | 源码 |
| --- | --- | --- | --- |
| v4.5.2 | `0.0.405` | [https://doc-archive.shengwang.cn/archive/0.0.405/api-ref/rtc/electron/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.405/api-ref/rtc/electron/API/rtc_api_overview) | [L421](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L421) |
| v4.5.0 | `0.0.257` | [https://doc-archive.shengwang.cn/archive/0.0.257/api-ref/rtc/electron/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.257/api-ref/rtc/electron/API/rtc_api_overview) | [L425](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L425) |
| v4.4.0 | `0.0.221` | [https://doc-archive.shengwang.cn/archive/0.0.221/api-ref/rtc/electron/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.221/api-ref/rtc/electron/API/rtc_api_overview) | [L429](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L429) |
| v4.3.2 | `0.0.171` | [https://doc-archive.shengwang.cn/archive/0.0.171/api-ref/rtc/electron/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.171/api-ref/rtc/electron/API/rtc_api_overview) | [L433](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L433) |
| v4.3.1 | `0.0.134` | [https://doc-archive.shengwang.cn/archive/0.0.134/api-ref/rtc/electron/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.134/api-ref/rtc/electron/API/rtc_api_overview) | [L437](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L437) |
| v4.3.0 | `0.0.113` | [https://doc-archive.shengwang.cn/archive/0.0.113/api-ref/rtc/electron/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.113/api-ref/rtc/electron/API/rtc_api_overview) | [L441](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L441) |
| v4.2.3 | `0.0.69` | [https://doc-archive.shengwang.cn/archive/0.0.69/api-ref/rtc/electron/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.69/api-ref/rtc/electron/API/rtc_api_overview) | [L445](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L445) |
| v4.2.2 | `0.0.15` | [https://doc-archive.shengwang.cn/archive/0.0.15/api-ref/rtc/electron/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.15/api-ref/rtc/electron/API/rtc_api_overview) | [L449](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L449) |

#### Unity（unity）：8 项

旧站 current：v4.6.2。平台配置：[docs-api-reference/rtc/_platforms_.meta.js:453](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L453)。

| 显示版本 | siteVersion | 归档入口 URL | 源码 |
| --- | --- | --- | --- |
| v4.5.1 | `0.0.405` | [https://doc-archive.shengwang.cn/archive/0.0.405/api-ref/rtc/unity/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.405/api-ref/rtc/unity/API/rtc_api_overview) | [L471](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L471) |
| v4.5.0 | `0.0.257` | [https://doc-archive.shengwang.cn/archive/0.0.257/api-ref/rtc/unity/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.257/api-ref/rtc/unity/API/rtc_api_overview) | [L475](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L475) |
| v4.4.0 | `0.0.221` | [https://doc-archive.shengwang.cn/archive/0.0.221/api-ref/rtc/unity/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.221/api-ref/rtc/unity/API/rtc_api_overview) | [L479](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L479) |
| v4.3.2 | `0.0.171` | [https://doc-archive.shengwang.cn/archive/0.0.171/api-ref/rtc/unity/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.171/api-ref/rtc/unity/API/rtc_api_overview) | [L483](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L483) |
| v4.3.1 | `0.0.134` | [https://doc-archive.shengwang.cn/archive/0.0.134/api-ref/rtc/unity/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.134/api-ref/rtc/unity/API/rtc_api_overview) | [L487](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L487) |
| v4.3.0 | `0.0.113` | [https://doc-archive.shengwang.cn/archive/0.0.113/api-ref/rtc/unity/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.113/api-ref/rtc/unity/API/rtc_api_overview) | [L491](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L491) |
| v4.2.3 | `0.0.69` | [https://doc-archive.shengwang.cn/archive/0.0.69/api-ref/rtc/unity/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.69/api-ref/rtc/unity/API/rtc_api_overview) | [L495](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L495) |
| v4.2.2 | `0.0.15` | [https://doc-archive.shengwang.cn/archive/0.0.15/api-ref/rtc/unity/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.15/api-ref/rtc/unity/API/rtc_api_overview) | [L499](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L499) |

#### Flutter（flutter）：9 项

旧站 current：v6.6.4。平台配置：[docs-api-reference/rtc/_platforms_.meta.js:503](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L503)。

| 显示版本 | siteVersion | 归档入口 URL | 源码 |
| --- | --- | --- | --- |
| v6.6.2 | `0.0.492` | [https://doc-archive.shengwang.cn/archive/0.0.492/api-ref/rtc/flutter/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.492/api-ref/rtc/flutter/API/rtc_api_overview) | [L521](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L521) |
| v6.5.2 | `0.0.405` | [https://doc-archive.shengwang.cn/archive/0.0.405/api-ref/rtc/flutter/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.405/api-ref/rtc/flutter/API/rtc_api_overview) | [L525](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L525) |
| v6.5.1 | `0.0.282` | [https://doc-archive.shengwang.cn/archive/0.0.282/api-ref/rtc/flutter/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.282/api-ref/rtc/flutter/API/rtc_api_overview) | [L529](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L529) |
| v6.5.0 | `0.0.257` | [https://doc-archive.shengwang.cn/archive/0.0.257/api-ref/rtc/flutter/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.257/api-ref/rtc/flutter/API/rtc_api_overview) | [L533](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L533) |
| v6.3.2 | `0.0.221` | [https://doc-archive.shengwang.cn/archive/0.0.221/api-ref/rtc/flutter/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.221/api-ref/rtc/flutter/API/rtc_api_overview) | [L537](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L537) |
| v6.3.1 | `0.0.134` | [https://doc-archive.shengwang.cn/archive/0.0.134/api-ref/rtc/flutter/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.134/api-ref/rtc/flutter/API/rtc_api_overview) | [L541](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L541) |
| v6.3.0 | `0.0.113` | [https://doc-archive.shengwang.cn/archive/0.0.113/api-ref/rtc/flutter/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.113/api-ref/rtc/flutter/API/rtc_api_overview) | [L545](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L545) |
| v6.2.3 | `0.0.76` | [https://doc-archive.shengwang.cn/archive/0.0.76/api-ref/rtc/flutter/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.76/api-ref/rtc/flutter/API/rtc_api_overview) | [L549](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L549) |
| v6.2.2 | `0.0.15` | [https://doc-archive.shengwang.cn/archive/0.0.15/api-ref/rtc/flutter/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.15/api-ref/rtc/flutter/API/rtc_api_overview) | [L553](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L553) |

#### React Native（rn）：8 项

旧站 current：v4.6.4。平台配置：[docs-api-reference/rtc/_platforms_.meta.js:557](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L557)。

| 显示版本 | siteVersion | 归档入口 URL | 源码 |
| --- | --- | --- | --- |
| v4.6.2 | `0.0.492` | [https://doc-archive.shengwang.cn/archive/0.0.492/api-ref/rtc/rn/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.492/api-ref/rtc/rn/API/rtc_api_overview) | [L575](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L575) |
| v4.5.2 | `0.0.405` | [https://doc-archive.shengwang.cn/archive/0.0.405/api-ref/rtc/rn/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.405/api-ref/rtc/rn/API/rtc_api_overview) | [L579](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L579) |
| v4.5.0 | `0.0.257` | [https://doc-archive.shengwang.cn/archive/0.0.257/api-ref/rtc/rn/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.257/api-ref/rtc/rn/API/rtc_api_overview) | [L583](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L583) |
| v4.4.0 | `0.0.221` | [https://doc-archive.shengwang.cn/archive/0.0.221/api-ref/rtc/rn/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.221/api-ref/rtc/rn/API/rtc_api_overview) | [L587](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L587) |
| v4.3.2 | `0.0.171` | [https://doc-archive.shengwang.cn/archive/0.0.171/api-ref/rtc/rn/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.171/api-ref/rtc/rn/API/rtc_api_overview) | [L591](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L591) |
| v6.3.0 | `0.0.113` | [https://doc-archive.shengwang.cn/archive/0.0.113/api-ref/rtc/rn/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.113/api-ref/rtc/rn/API/rtc_api_overview) | [L595](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L595) |
| v6.2.3 | `0.0.76` | [https://doc-archive.shengwang.cn/archive/0.0.76/api-ref/rtc/rn/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.76/api-ref/rtc/rn/API/rtc_api_overview) | [L599](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L599) |
| v6.2.2 | `0.0.15` | [https://doc-archive.shengwang.cn/archive/0.0.15/api-ref/rtc/rn/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.15/api-ref/rtc/rn/API/rtc_api_overview) | [L603](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L603) |

#### Unreal (C++)（unreal-cpp）：3 项

旧站 current：v4.5.1。平台配置：[docs-api-reference/rtc/_platforms_.meta.js:607](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L607)。

| 显示版本 | siteVersion | 归档入口 URL | 源码 |
| --- | --- | --- | --- |
| v4.5.0 | `0.0.257` | [https://doc-archive.shengwang.cn/archive/0.0.257/api-ref/rtc/unreal-cpp/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.257/api-ref/rtc/unreal-cpp/API/rtc_api_overview) | [L625](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L625) |
| v4.4.0 | `0.0.221` | [https://doc-archive.shengwang.cn/archive/0.0.221/api-ref/rtc/unreal-cpp/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.221/api-ref/rtc/unreal-cpp/API/rtc_api_overview) | [L629](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L629) |
| v4.2.1 | `0.0.171` | [https://doc-archive.shengwang.cn/archive/0.0.171/api-ref/rtc/unreal-cpp/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.171/api-ref/rtc/unreal-cpp/API/rtc_api_overview) | [L633](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L633) |

#### Unreal (Blueprint)（unreal-blueprint）：3 项

旧站 current：v4.5.1。平台配置：[docs-api-reference/rtc/_platforms_.meta.js:637](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L637)。

| 显示版本 | siteVersion | 归档入口 URL | 源码 |
| --- | --- | --- | --- |
| v4.5.0 | `0.0.257` | [https://doc-archive.shengwang.cn/archive/0.0.257/api-ref/rtc/unreal-blueprint/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.257/api-ref/rtc/unreal-blueprint/API/rtc_api_overview) | [L655](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L655) |
| v4.4.0 | `0.0.221` | [https://doc-archive.shengwang.cn/archive/0.0.221/api-ref/rtc/unreal-blueprint/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.221/api-ref/rtc/unreal-blueprint/API/rtc_api_overview) | [L659](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L659) |
| v4.2.1 | `0.0.171` | [https://doc-archive.shengwang.cn/archive/0.0.171/api-ref/rtc/unreal-blueprint/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.171/api-ref/rtc/unreal-blueprint/API/rtc_api_overview) | [L663](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L663) |

#### React（react）：9 项

旧站 current：v2.5.0（React SDK）；v4.22.0（底层 Web SDK）。平台配置：[docs-api-reference/rtc/_platforms_.meta.js:667](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L667)。

| 显示版本 | siteVersion | 归档入口 URL | 源码 |
| --- | --- | --- | --- |
| v2.4.0（React SDK） | `0.0.341` | [https://doc-archive.shengwang.cn/archive/0.0.341/api-ref/rtc/react/react-sdk/overview](https://doc-archive.shengwang.cn/archive/0.0.341/api-ref/rtc/react/react-sdk/overview) | [L684](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L684) |
| v2.3.0（React SDK） | `0.0.257` | [https://doc-archive.shengwang.cn/archive/0.0.257/api-ref/rtc/react/react-sdk/overview](https://doc-archive.shengwang.cn/archive/0.0.257/api-ref/rtc/react/react-sdk/overview) | [L689](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L689) |
| v2.2.0（React SDK） | `0.0.166` | [https://doc-archive.shengwang.cn/archive/0.0.166/api-ref/rtc/react/react-sdk/overview](https://doc-archive.shengwang.cn/archive/0.0.166/api-ref/rtc/react/react-sdk/overview) | [L694](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L694) |
| v2.1.0（React SDK） | `0.0.140` | [https://doc-archive.shengwang.cn/archive/0.0.140/api-ref/rtc/react/react-sdk/overview](https://doc-archive.shengwang.cn/archive/0.0.140/api-ref/rtc/react/react-sdk/overview) | [L699](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L699) |
| v2.0.0（React SDK） | `0.0.44` | [https://doc-archive.shengwang.cn/archive/0.0.44/api-ref/rtc/react/react-sdk/overview](https://doc-archive.shengwang.cn/archive/0.0.44/api-ref/rtc/react/react-sdk/overview) | [L704](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L704) |
| v2.0.0-beta.0（React SDK） | `0.0.34` | [https://doc-archive.shengwang.cn/archive/0.0.34/api-ref/rtc/react/react-sdk/overview](https://doc-archive.shengwang.cn/archive/0.0.34/api-ref/rtc/react/react-sdk/overview) | [L709](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L709) |
| v4.21.0（底层 Web SDK） | `0.0.166` | [https://doc-archive.shengwang.cn/archive/0.0.166/api-ref/rtc/react/overview](https://doc-archive.shengwang.cn/archive/0.0.166/api-ref/rtc/react/overview) | [L718](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L718) |
| v4.20.0（底层 Web SDK） | `0.0.140` | [https://doc-archive.shengwang.cn/archive/0.0.140/api-ref/rtc/react/overview](https://doc-archive.shengwang.cn/archive/0.0.140/api-ref/rtc/react/overview) | [L722](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L722) |
| v4.19.3（底层 Web SDK） | `0.0.44` | [https://doc-archive.shengwang.cn/archive/0.0.44/api-ref/rtc/react/overview](https://doc-archive.shengwang.cn/archive/0.0.44/api-ref/rtc/react/overview) | [L726](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L726) |

### 实时消息（rtm2）

#### JavaScript（javascript）：12 项

旧站 current：v2.3.0。平台配置：[docs-api-reference/rtm2/_platforms_.meta.js:2](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L2)。

| 显示版本 | siteVersion | 归档入口 URL | 源码 |
| --- | --- | --- | --- |
| v2.2.4 | `0.0.492` | [https://doc-archive.shengwang.cn/archive/0.0.492/api-ref/rtm2/javascript/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.492/api-ref/rtm2/javascript/toc-configuration/configuration) | [L17](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L17) |
| v2.2.2 | `0.0.455` | [https://doc-archive.shengwang.cn/archive/0.0.455/api-ref/rtm2/javascript/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.455/api-ref/rtm2/javascript/toc-configuration/configuration) | [L21](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L21) |
| v2.2.1 | `0.0.270` | [https://doc-archive.shengwang.cn/archive/0.0.270/api-ref/rtm2/javascript/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.270/api-ref/rtm2/javascript/toc-configuration/configuration) | [L25](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L25) |
| v2.2.0 | `0.0.211` | [https://doc-archive.shengwang.cn/archive/0.0.211/api-ref/rtm2/javascript/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.211/api-ref/rtm2/javascript/toc-configuration/configuration) | [L29](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L29) |
| v2.1.10 | `0.0.168` | [https://doc-archive.shengwang.cn/archive/0.0.168/api-ref/rtm2/javascript/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.168/api-ref/rtm2/javascript/toc-configuration/configuration) | [L33](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L33) |
| v2.1.9 | `0.0.134` | [https://doc-archive.shengwang.cn/archive/0.0.134/api-ref/rtm2/javascript/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.134/api-ref/rtm2/javascript/toc-configuration/configuration) | [L37](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L37) |
| v2.1.8 | `0.0.83` | [https://doc-archive.shengwang.cn/archive/0.0.83/api-ref/rtm2/javascript/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.83/api-ref/rtm2/javascript/toc-configuration/configuration) | [L41](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L41) |
| v2.1.7 | `0.0.69` | [https://doc-archive.shengwang.cn/archive/0.0.69/api-ref/rtm2/javascript/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.69/api-ref/rtm2/javascript/toc-configuration/configuration) | [L45](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L45) |
| v2.1.6 | `0.0.52` | [https://doc-archive.shengwang.cn/archive/0.0.52/api-ref/rtm2/javascript/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.52/api-ref/rtm2/javascript/toc-configuration/configuration) | [L49](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L49) |
| v2.1.5 | `0.0.35` | [https://doc-archive.shengwang.cn/archive/0.0.35/api-ref/rtm2/javascript/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.35/api-ref/rtm2/javascript/toc-configuration/configuration) | [L53](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L53) |
| v2.1.4 | `0.0.11` | [https://doc-archive.shengwang.cn/archive/0.0.11/api-ref/rtm2/javascript/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.11/api-ref/rtm2/javascript/toc-configuration/configuration) | [L57](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L57) |
| v2.1.3 | `0.0.3` | [https://doc-archive.shengwang.cn/archive/0.0.3/api-ref/rtm2/web/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.3/api-ref/rtm2/web/toc-configuration/configuration) | [L61](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L61) |

#### Java（android）：15 项

旧站 current：v2.3.0。平台配置：[docs-api-reference/rtm2/_platforms_.meta.js:66](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L66)。

| 显示版本 | siteVersion | 归档入口 URL | 源码 |
| --- | --- | --- | --- |
| v2.2.8 | `0.0.492` | [https://doc-archive.shengwang.cn/archive/0.0.492/api-ref/rtm2/android/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.492/api-ref/rtm2/android/toc-configuration/configuration) | [L81](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L81) |
| v2.2.6 | `0.0.423` | [https://doc-archive.shengwang.cn/archive/0.0.423/api-ref/rtm2/android/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.423/api-ref/rtm2/android/toc-configuration/configuration) | [L85](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L85) |
| v2.2.5 | `0.0.378` | [https://doc-archive.shengwang.cn/archive/0.0.378/api-ref/rtm2/android/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.378/api-ref/rtm2/android/toc-configuration/configuration) | [L89](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L89) |
| v2.2.3 | `0.0.323` | [https://doc-archive.shengwang.cn/archive/0.0.323/api-ref/rtm2/android/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.323/api-ref/rtm2/android/toc-configuration/configuration) | [L93](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L93) |
| v2.2.2 | `0.0.261` | [https://doc-archive.shengwang.cn/archive/0.0.261/api-ref/rtm2/android/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.261/api-ref/rtm2/android/toc-configuration/configuration) | [L97](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L97) |
| v2.2.1 | `0.0.207` | [https://doc-archive.shengwang.cn/archive/0.0.207/api-ref/rtm2/android/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.207/api-ref/rtm2/android/toc-configuration/configuration) | [L101](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L101) |
| v2.2.0 | `0.0.147` | [https://doc-archive.shengwang.cn/archive/0.0.147/api-ref/rtm2/android/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.147/api-ref/rtm2/android/toc-configuration/configuration) | [L105](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L105) |
| v2.1.12 | `0.0.107` | [https://doc-archive.shengwang.cn/archive/0.0.107/api-ref/rtm2/android/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.107/api-ref/rtm2/android/toc-configuration/configuration) | [L109](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L109) |
| v2.1.11 | `0.0.107` | [https://doc-archive.shengwang.cn/archive/0.0.107/api-ref/rtm2/android/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.107/api-ref/rtm2/android/toc-configuration/configuration) | [L113](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L113) |
| v2.1.10 | `0.0.107` | [https://doc-archive.shengwang.cn/archive/0.0.107/api-ref/rtm2/android/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.107/api-ref/rtm2/android/toc-configuration/configuration) | [L117](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L117) |
| v2.1.9 | `0.0.69` | [https://doc-archive.shengwang.cn/archive/0.0.69/api-ref/rtm2/android/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.69/api-ref/rtm2/android/toc-configuration/configuration) | [L121](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L121) |
| v2.1.8 | `0.0.52` | [https://doc-archive.shengwang.cn/archive/0.0.52/api-ref/rtm2/android/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.52/api-ref/rtm2/android/toc-configuration/configuration) | [L125](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L125) |
| v2.1.7 | `0.0.35` | [https://doc-archive.shengwang.cn/archive/0.0.35/api-ref/rtm2/android/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.35/api-ref/rtm2/android/toc-configuration/configuration) | [L129](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L129) |
| v2.1.6 | `0.0.17` | [https://doc-archive.shengwang.cn/archive/0.0.17/api-ref/rtm2/android/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.17/api-ref/rtm2/android/toc-configuration/configuration) | [L133](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L133) |
| v2.1.4 | `0.0.7` | [https://doc-archive.shengwang.cn/archive/0.0.7/api-ref/rtm2/android/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.7/api-ref/rtm2/android/toc-configuration/configuration) | [L137](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L137) |

#### Objective-C（ios）：15 项

旧站 current：v2.3.0。平台配置：[docs-api-reference/rtm2/_platforms_.meta.js:141](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L141)。

| 显示版本 | siteVersion | 归档入口 URL | 源码 |
| --- | --- | --- | --- |
| v2.2.8 | `0.0.492` | [https://doc-archive.shengwang.cn/archive/0.0.492/api-ref/rtm2/ios/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.492/api-ref/rtm2/ios/toc-configuration/configuration) | [L156](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L156) |
| v2.2.6 | `0.0.423` | [https://doc-archive.shengwang.cn/archive/0.0.423/api-ref/rtm2/ios/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.423/api-ref/rtm2/ios/toc-configuration/configuration) | [L160](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L160) |
| v2.2.5 | `0.0.378` | [https://doc-archive.shengwang.cn/archive/0.0.378/api-ref/rtm2/ios/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.378/api-ref/rtm2/ios/toc-configuration/configuration) | [L164](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L164) |
| v2.2.3 | `0.0.323` | [https://doc-archive.shengwang.cn/archive/0.0.323/api-ref/rtm2/ios/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.323/api-ref/rtm2/ios/toc-configuration/configuration) | [L168](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L168) |
| v2.2.2 | `0.0.261` | [https://doc-archive.shengwang.cn/archive/0.0.261/api-ref/rtm2/ios/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.261/api-ref/rtm2/ios/toc-configuration/configuration) | [L172](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L172) |
| v2.2.1 | `0.0.207` | [https://doc-archive.shengwang.cn/archive/0.0.207/api-ref/rtm2/ios/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.207/api-ref/rtm2/ios/toc-configuration/configuration) | [L176](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L176) |
| v2.2.0 | `0.0.147` | [https://doc-archive.shengwang.cn/archive/0.0.147/api-ref/rtm2/ios/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.147/api-ref/rtm2/ios/toc-configuration/configuration) | [L180](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L180) |
| v2.1.12 | `0.0.107` | [https://doc-archive.shengwang.cn/archive/0.0.107/api-ref/rtm2/ios/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.107/api-ref/rtm2/ios/toc-configuration/configuration) | [L184](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L184) |
| v2.1.11 | `0.0.107` | [https://doc-archive.shengwang.cn/archive/0.0.107/api-ref/rtm2/ios/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.107/api-ref/rtm2/ios/toc-configuration/configuration) | [L188](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L188) |
| v2.1.10 | `0.0.107` | [https://doc-archive.shengwang.cn/archive/0.0.107/api-ref/rtm2/ios/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.107/api-ref/rtm2/ios/toc-configuration/configuration) | [L192](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L192) |
| v2.1.9 | `0.0.69` | [https://doc-archive.shengwang.cn/archive/0.0.69/api-ref/rtm2/ios/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.69/api-ref/rtm2/ios/toc-configuration/configuration) | [L196](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L196) |
| v2.1.8 | `0.0.52` | [https://doc-archive.shengwang.cn/archive/0.0.52/api-ref/rtm2/ios/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.52/api-ref/rtm2/ios/toc-configuration/configuration) | [L200](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L200) |
| v2.1.7 | `0.0.35` | [https://doc-archive.shengwang.cn/archive/0.0.35/api-ref/rtm2/ios/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.35/api-ref/rtm2/ios/toc-configuration/configuration) | [L204](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L204) |
| v2.1.6 | `0.0.17` | [https://doc-archive.shengwang.cn/archive/0.0.17/api-ref/rtm2/ios/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.17/api-ref/rtm2/ios/toc-configuration/configuration) | [L208](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L208) |
| v2.1.4 | `0.0.7` | [https://doc-archive.shengwang.cn/archive/0.0.7/api-ref/rtm2/ios/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.7/api-ref/rtm2/ios/toc-configuration/configuration) | [L212](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L212) |

#### Swift（swift）：5 项

旧站 current：v2.3.0。平台配置：[docs-api-reference/rtm2/_platforms_.meta.js:217](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L217)。

| 显示版本 | siteVersion | 归档入口 URL | 源码 |
| --- | --- | --- | --- |
| v2.2.8 | `0.0.492` | [https://doc-archive.shengwang.cn/archive/0.0.492/api-ref/rtm2/swift/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.492/api-ref/rtm2/swift/toc-configuration/configuration) | [L232](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L232) |
| v2.2.6 | `0.0.423` | [https://doc-archive.shengwang.cn/archive/0.0.423/api-ref/rtm2/swift/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.423/api-ref/rtm2/swift/toc-configuration/configuration) | [L236](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L236) |
| v2.2.5 | `0.0.378` | [https://doc-archive.shengwang.cn/archive/0.0.378/api-ref/rtm2/swift/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.378/api-ref/rtm2/swift/toc-configuration/configuration) | [L240](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L240) |
| v2.2.3 | `0.0.323` | [https://doc-archive.shengwang.cn/archive/0.0.323/api-ref/rtm2/swift/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.323/api-ref/rtm2/swift/toc-configuration/configuration) | [L244](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L244) |
| v2.2.2 | `0.0.261` | [https://doc-archive.shengwang.cn/archive/0.0.261/api-ref/rtm2/swift/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.261/api-ref/rtm2/swift/toc-configuration/configuration) | [L248](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L248) |

#### C++（cpp）：11 项

旧站 current：v2.3.0。平台配置：[docs-api-reference/rtm2/_platforms_.meta.js:252](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L252)。

| 显示版本 | siteVersion | 归档入口 URL | 源码 |
| --- | --- | --- | --- |
| v2.2.8 | `0.0.492` | [https://doc-archive.shengwang.cn/archive/0.0.492/api-ref/rtm2/cpp/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.492/api-ref/rtm2/cpp/toc-configuration/configuration) | [L267](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L267) |
| v2.2.6 | `0.0.423` | [https://doc-archive.shengwang.cn/archive/0.0.423/api-ref/rtm2/cpp/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.423/api-ref/rtm2/cpp/toc-configuration/configuration) | [L271](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L271) |
| v2.2.5 | `0.0.378` | [https://doc-archive.shengwang.cn/archive/0.0.378/api-ref/rtm2/cpp/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.378/api-ref/rtm2/cpp/toc-configuration/configuration) | [L275](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L275) |
| v2.2.3 | `0.0.323` | [https://doc-archive.shengwang.cn/archive/0.0.323/api-ref/rtm2/cpp/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.323/api-ref/rtm2/cpp/toc-configuration/configuration) | [L279](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L279) |
| v2.2.2 | `0.0.261` | [https://doc-archive.shengwang.cn/archive/0.0.261/api-ref/rtm2/cpp/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.261/api-ref/rtm2/cpp/toc-configuration/configuration) | [L283](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L283) |
| v2.2.1 | `0.0.207` | [https://doc-archive.shengwang.cn/archive/0.0.207/api-ref/rtm2/cpp/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.207/api-ref/rtm2/cpp/toc-configuration/configuration) | [L287](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L287) |
| v2.1.12 | `0.0.134` | [https://doc-archive.shengwang.cn/archive/0.0.134/api-ref/rtm2/cpp/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.134/api-ref/rtm2/cpp/toc-configuration/configuration) | [L291](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L291) |
| v2.1.11 | `0.0.134` | [https://doc-archive.shengwang.cn/archive/0.0.134/api-ref/rtm2/cpp/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.134/api-ref/rtm2/cpp/toc-configuration/configuration) | [L295](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L295) |
| v2.1.10 | `0.0.112` | [https://doc-archive.shengwang.cn/archive/0.0.112/api-ref/rtm2/cpp/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.112/api-ref/rtm2/cpp/toc-configuration/configuration) | [L299](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L299) |
| v2.1.9 | `0.0.69` | [https://doc-archive.shengwang.cn/archive/0.0.69/api-ref/rtm2/cpp/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.69/api-ref/rtm2/cpp/toc-configuration/configuration) | [L303](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L303) |
| v2.1.8 | `0.0.52` | [https://doc-archive.shengwang.cn/archive/0.0.52/api-ref/rtm2/cpp/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.52/api-ref/rtm2/cpp/toc-configuration/configuration) | [L307](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L307) |

#### Unity（unity）：1 项

旧站 current：v2.1.9。平台配置：[docs-api-reference/rtm2/_platforms_.meta.js:311](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L311)。

| 显示版本 | siteVersion | 归档入口 URL | 源码 |
| --- | --- | --- | --- |
| v2.1.4 | `0.0.55` | [https://doc-archive.shengwang.cn/archive/0.0.55/api-ref/rtm2/unity/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.55/api-ref/rtm2/unity/toc-configuration/configuration) | [L326](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L326) |

#### Flutter（flutter）：3 项

旧站 current：v2.2.6。平台配置：[docs-api-reference/rtm2/_platforms_.meta.js:330](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L330)。

| 显示版本 | siteVersion | 归档入口 URL | 源码 |
| --- | --- | --- | --- |
| v2.2.5 | `0.0.378` | [https://doc-archive.shengwang.cn/archive/0.0.378/api-ref/rtm2/flutter/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.378/api-ref/rtm2/flutter/toc-configuration/configuration) | [L345](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L345) |
| v2.2.2 | `0.0.341` | [https://doc-archive.shengwang.cn/archive/0.0.341/api-ref/rtm2/flutter/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.341/api-ref/rtm2/flutter/toc-configuration/configuration) | [L349](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L349) |
| v2.2.1 | `0.0.202` | [https://doc-archive.shengwang.cn/archive/0.0.202/api-ref/rtm2/flutter/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.202/api-ref/rtm2/flutter/toc-configuration/configuration) | [L353](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L353) |

#### HarmonyOS（harmonyos）：1 项

旧站 current：v2.3.0。平台配置：[docs-api-reference/rtm2/_platforms_.meta.js:366](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L366)。

| 显示版本 | siteVersion | 归档入口 URL | 源码 |
| --- | --- | --- | --- |
| v2.2.8 | `0.0.492` | [https://doc-archive.shengwang.cn/archive/0.0.492/api-ref/rtm2/harmonyos/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.492/api-ref/rtm2/harmonyos/toc-configuration/configuration) | [L384](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L384) |

### 媒体流加速（rtsa）

#### C（c）：5 项

旧站 current：v1.10.1。平台配置：[docs-api-reference/rtsa/_platforms_.meta.js:14](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtsa/_platforms_.meta.js#L14)。

| 显示版本 | siteVersion | 归档入口 URL | 源码 |
| --- | --- | --- | --- |
| v1.9.7 | `0.0.492` | [https://doc-archive.shengwang.cn/archive/0.0.492/api-ref/rtsa/c/overview](https://doc-archive.shengwang.cn/archive/0.0.492/api-ref/rtsa/c/overview) | [L32](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtsa/_platforms_.meta.js#L32) |
| v1.9.6 | `0.0.378` | [https://doc-archive.shengwang.cn/archive/0.0.378/api-ref/rtsa/c/overview](https://doc-archive.shengwang.cn/archive/0.0.378/api-ref/rtsa/c/overview) | [L36](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtsa/_platforms_.meta.js#L36) |
| v1.9.5 | `0.0.341` | [https://doc-archive.shengwang.cn/archive/0.0.341/api-ref/rtsa/c/overview](https://doc-archive.shengwang.cn/archive/0.0.341/api-ref/rtsa/c/overview) | [L40](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtsa/_platforms_.meta.js#L40) |
| v1.9.4 | `0.0.253` | [https://doc-archive.shengwang.cn/archive/0.0.253/api-ref/rtsa/c/overview](https://doc-archive.shengwang.cn/archive/0.0.253/api-ref/rtsa/c/overview) | [L44](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtsa/_platforms_.meta.js#L44) |
| v1.9.2 | `0.0.231` | [https://doc-archive.shengwang.cn/archive/0.0.231/api-ref/rtsa/c/overview](https://doc-archive.shengwang.cn/archive/0.0.231/api-ref/rtsa/c/overview) | [L48](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtsa/_platforms_.meta.js#L48) |

### 互动白板（whiteboard）

#### Android（android）：3 项

旧站 current：v2.16.100。平台配置：[docs-api-reference/whiteboard/_platforms_.meta.js:2](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/whiteboard/_platforms_.meta.js#L2)。

| 显示版本 | siteVersion | 归档入口 URL | 源码 |
| --- | --- | --- | --- |
| v2.16.59 | `0.0.84` | [https://doc-archive.shengwang.cn/archive/0.0.84/api-ref/whiteboard/android/overview](https://doc-archive.shengwang.cn/archive/0.0.84/api-ref/whiteboard/android/overview) | [L16](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/whiteboard/_platforms_.meta.js#L16) |
| v2.16.81 | `0.0.136` | [https://doc-archive.shengwang.cn/archive/0.0.136/api-ref/whiteboard/android/overview](https://doc-archive.shengwang.cn/archive/0.0.136/api-ref/whiteboard/android/overview) | [L20](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/whiteboard/_platforms_.meta.js#L20) |
| v2.16.86 | `0.0.275` | [https://doc-archive.shengwang.cn/archive/0.0.275/api-ref/whiteboard/android/overview](https://doc-archive.shengwang.cn/archive/0.0.275/api-ref/whiteboard/android/overview) | [L24](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/whiteboard/_platforms_.meta.js#L24) |

#### iOS（ios）：3 项

旧站 current：v2.16.112。平台配置：[docs-api-reference/whiteboard/_platforms_.meta.js:32](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/whiteboard/_platforms_.meta.js#L32)。

| 显示版本 | siteVersion | 归档入口 URL | 源码 |
| --- | --- | --- | --- |
| v2.16.62 | `0.0.84` | [https://doc-archive.shengwang.cn/archive/0.0.84/api-ref/whiteboard/ios/docs/headers/Agora-Interactive-Whiteboard-Objective-C-Overview](https://doc-archive.shengwang.cn/archive/0.0.84/api-ref/whiteboard/ios/docs/headers/Agora-Interactive-Whiteboard-Objective-C-Overview) | [L43](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/whiteboard/_platforms_.meta.js#L43) |
| v2.16.88 | `0.0.136` | [https://doc-archive.shengwang.cn/archive/0.0.136/api-ref/whiteboard/ios/docs/headers/Agora-Interactive-Whiteboard-Objective-C-Overview](https://doc-archive.shengwang.cn/archive/0.0.136/api-ref/whiteboard/ios/docs/headers/Agora-Interactive-Whiteboard-Objective-C-Overview) | [L47](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/whiteboard/_platforms_.meta.js#L47) |
| v2.16.95 | `0.0.275` | [https://doc-archive.shengwang.cn/archive/0.0.275/api-ref/whiteboard/ios/docs/headers/Agora-Interactive-Whiteboard-Objective-C-Overview](https://doc-archive.shengwang.cn/archive/0.0.275/api-ref/whiteboard/ios/docs/headers/Agora-Interactive-Whiteboard-Objective-C-Overview) | [L51](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/whiteboard/_platforms_.meta.js#L51) |

#### Web（javascript）：4 项

旧站 current：v2.16.53。平台配置：[docs-api-reference/whiteboard/_platforms_.meta.js:59](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/whiteboard/_platforms_.meta.js#L59)。

| 显示版本 | siteVersion | 归档入口 URL | 源码 |
| --- | --- | --- | --- |
| v2.16.43 | `0.0.84` | [https://doc-archive.shengwang.cn/archive/0.0.84/api-ref/whiteboard/javascript/overview](https://doc-archive.shengwang.cn/archive/0.0.84/api-ref/whiteboard/javascript/overview) | [L70](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/whiteboard/_platforms_.meta.js#L70) |
| v2.16.48 | `0.0.96` | [https://doc-archive.shengwang.cn/archive/0.0.96/api-ref/whiteboard/javascript/overview](https://doc-archive.shengwang.cn/archive/0.0.96/api-ref/whiteboard/javascript/overview) | [L74](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/whiteboard/_platforms_.meta.js#L74) |
| v2.16.49 | `0.0.125` | [https://doc-archive.shengwang.cn/archive/0.0.125/api-ref/whiteboard/javascript/overview](https://doc-archive.shengwang.cn/archive/0.0.125/api-ref/whiteboard/javascript/overview) | [L78](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/whiteboard/_platforms_.meta.js#L78) |
| v2.16.51 | `0.0.275` | [https://doc-archive.shengwang.cn/archive/0.0.275/api-ref/whiteboard/javascript/overview](https://doc-archive.shengwang.cn/archive/0.0.275/api-ref/whiteboard/javascript/overview) | [L82](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/whiteboard/_platforms_.meta.js#L82) |

### 互动白板 Fastboard（fastboard）

#### Android（android）：3 项

旧站 current：v1.7.2。平台配置：[docs-api-reference/fastboard/_platforms_.meta.js:2](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/fastboard/_platforms_.meta.js#L2)。

| 显示版本 | siteVersion | 归档入口 URL | 源码 |
| --- | --- | --- | --- |
| v1.6.2 | `0.0.338` | [https://doc-archive.shengwang.cn/archive/0.0.338/api-ref/fastboard/android/fastboard-api](https://doc-archive.shengwang.cn/archive/0.0.338/api-ref/fastboard/android/fastboard-api) | [L17](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/fastboard/_platforms_.meta.js#L17) |
| v1.6.0 | `0.0.323` | [https://doc-archive.shengwang.cn/archive/0.0.323/api-ref/fastboard/android/fastboard-api](https://doc-archive.shengwang.cn/archive/0.0.323/api-ref/fastboard/android/fastboard-api) | [L21](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/fastboard/_platforms_.meta.js#L21) |
| v1.3.4 | `0.0.67` | [https://doc-archive.shengwang.cn/archive/0.0.67/api-ref/fastboard/android/fastboard-api](https://doc-archive.shengwang.cn/archive/0.0.67/api-ref/fastboard/android/fastboard-api) | [L25](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/fastboard/_platforms_.meta.js#L25) |

#### iOS（ios）：2 项

旧站 current：v1.4.2。平台配置：[docs-api-reference/fastboard/_platforms_.meta.js:29](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/fastboard/_platforms_.meta.js#L29)。

| 显示版本 | siteVersion | 归档入口 URL | 源码 |
| --- | --- | --- | --- |
| v1.4.0 | `0.0.323` | [https://doc-archive.shengwang.cn/archive/0.0.323/api-ref/fastboard/ios/fastboard-api](https://doc-archive.shengwang.cn/archive/0.0.323/api-ref/fastboard/ios/fastboard-api) | [L44](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/fastboard/_platforms_.meta.js#L44) |
| v1.2.2 | `0.0.67` | [https://doc-archive.shengwang.cn/archive/0.0.67/api-ref/fastboard/ios/fastboard-api](https://doc-archive.shengwang.cn/archive/0.0.67/api-ref/fastboard/ios/fastboard-api) | [L48](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/fastboard/_platforms_.meta.js#L48) |

#### Web（javascript）：3 项

旧站 current：v1.1.0。平台配置：[docs-api-reference/fastboard/_platforms_.meta.js:52](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/fastboard/_platforms_.meta.js#L52)。

| 显示版本 | siteVersion | 归档入口 URL | 源码 |
| --- | --- | --- | --- |
| v1.0.0 | `0.0.338` | [https://doc-archive.shengwang.cn/archive/0.0.338/api-ref/fastboard/javascript/fastboard-api](https://doc-archive.shengwang.cn/archive/0.0.338/api-ref/fastboard/javascript/fastboard-api) | [L67](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/fastboard/_platforms_.meta.js#L67) |
| v0.3.10 | `0.0.323` | [https://doc-archive.shengwang.cn/archive/0.0.323/api-ref/fastboard/javascript/fastboard-api](https://doc-archive.shengwang.cn/archive/0.0.323/api-ref/fastboard/javascript/fastboard-api) | [L71](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/fastboard/_platforms_.meta.js#L71) |
| v0.3.8 | `0.0.67` | [https://doc-archive.shengwang.cn/archive/0.0.67/api-ref/fastboard/javascript/fastboard-api](https://doc-archive.shengwang.cn/archive/0.0.67/api-ref/fastboard/javascript/fastboard-api) | [L75](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/fastboard/_platforms_.meta.js#L75) |

### 本地服务端录制（recording）

#### 服务端 C++（cpp）：1 项

旧站 current：v4.4.151。平台配置：[docs-api-reference/recording/_platforms_.meta.js:27](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/recording/_platforms_.meta.js#L27)。

| 显示版本 | siteVersion | 归档入口 URL | 源码 |
| --- | --- | --- | --- |
| v4.4.150 | `0.0.341` | [https://doc-archive.shengwang.cn/archive/0.0.341/api-ref/recording/cpp/api-overview](https://doc-archive.shengwang.cn/archive/0.0.341/api-ref/recording/cpp/api-overview) | [L45](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/recording/_platforms_.meta.js#L45) |

#### 服务端 Java（java）：1 项

旧站 current：v4.4.151。平台配置：[docs-api-reference/recording/_platforms_.meta.js:49](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/recording/_platforms_.meta.js#L49)。

| 显示版本 | siteVersion | 归档入口 URL | 源码 |
| --- | --- | --- | --- |
| v4.4.150 | `0.0.341` | [https://doc-archive.shengwang.cn/archive/0.0.341/api-ref/recording/java/api-overview](https://doc-archive.shengwang.cn/archive/0.0.341/api-ref/recording/java/api-overview) | [L67](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/recording/_platforms_.meta.js#L67) |

### RTC 服务端 SDK（rtc-server-sdk）

#### C++（cpp）：5 项

旧站 current：v4.4.32。平台配置：[docs-api-reference/rtc-server-sdk/_platforms_.meta.js:2](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc-server-sdk/_platforms_.meta.js#L2)。

| 显示版本 | siteVersion | 归档入口 URL | 源码 |
| --- | --- | --- | --- |
| v4.4.30 | `0.0.289` | [https://doc-archive.shengwang.cn/archive/0.0.289/api-ref/rtc-server-sdk/cpp/overview](https://doc-archive.shengwang.cn/archive/0.0.289/api-ref/rtc-server-sdk/cpp/overview) | [L19](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc-server-sdk/_platforms_.meta.js#L19) |
| v4.2.32 | `0.0.190` | [https://doc-archive.shengwang.cn/archive/0.0.190/api-ref/rtc-server-sdk/cpp/overview](https://doc-archive.shengwang.cn/archive/0.0.190/api-ref/rtc-server-sdk/cpp/overview) | [L23](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc-server-sdk/_platforms_.meta.js#L23) |
| v4.2.31 | `0.0.172` | [https://doc-archive.shengwang.cn/archive/0.0.172/api-ref/rtc-server-sdk/cpp/overview](https://doc-archive.shengwang.cn/archive/0.0.172/api-ref/rtc-server-sdk/cpp/overview) | [L27](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc-server-sdk/_platforms_.meta.js#L27) |
| v4.2.30 | `0.0.95` | [https://doc-archive.shengwang.cn/archive/0.0.95/api-ref/rtc-server-sdk/cpp/overview](https://doc-archive.shengwang.cn/archive/0.0.95/api-ref/rtc-server-sdk/cpp/overview) | [L31](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc-server-sdk/_platforms_.meta.js#L31) |
| v4.0.1 | `0.0.64` | [https://doc-archive.shengwang.cn/archive/0.0.64/api-ref/rtc-server-sdk/cpp/overview](https://doc-archive.shengwang.cn/archive/0.0.64/api-ref/rtc-server-sdk/cpp/overview) | [L35](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc-server-sdk/_platforms_.meta.js#L35) |

#### Java（java）：2 项

旧站 current：v4.4.32。平台配置：[docs-api-reference/rtc-server-sdk/_platforms_.meta.js:39](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc-server-sdk/_platforms_.meta.js#L39)。

| 显示版本 | siteVersion | 归档入口 URL | 源码 |
| --- | --- | --- | --- |
| v4.4.30 | `0.0.307` | [https://doc-archive.shengwang.cn/archive/0.0.307/api-ref/rtc-server-sdk/java/overview](https://doc-archive.shengwang.cn/archive/0.0.307/api-ref/rtc-server-sdk/java/overview) | [L56](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc-server-sdk/_platforms_.meta.js#L56) |
| v4.0.1 | `0.0.190` | [https://doc-archive.shengwang.cn/archive/0.0.190/api-ref/rtc-server-sdk/java/overview](https://doc-archive.shengwang.cn/archive/0.0.190/api-ref/rtc-server-sdk/java/overview) | [L60](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc-server-sdk/_platforms_.meta.js#L60) |

#### Python（python）：1 项

旧站 current：v2.2.4。平台配置：[docs-api-reference/rtc-server-sdk/_platforms_.meta.js:64](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc-server-sdk/_platforms_.meta.js#L64)。

| 显示版本 | siteVersion | 归档入口 URL | 源码 |
| --- | --- | --- | --- |
| v2.1.0 | `0.0.307` | [https://doc-archive.shengwang.cn/archive/0.0.307/api-ref/rtc-server-sdk/python/python-api/overview](https://doc-archive.shengwang.cn/archive/0.0.307/api-ref/rtc-server-sdk/python/python-api/overview) | [L79](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc-server-sdk/_platforms_.meta.js#L79) |

#### Go（go）：1 项

旧站 current：v2.2.4。平台配置：[docs-api-reference/rtc-server-sdk/_platforms_.meta.js:83](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc-server-sdk/_platforms_.meta.js#L83)。

| 显示版本 | siteVersion | 归档入口 URL | 源码 |
| --- | --- | --- | --- |
| v2.1.0 | `0.0.307` | [https://doc-archive.shengwang.cn/archive/0.0.307/api-ref/rtc-server-sdk/go/go-api/overview](https://doc-archive.shengwang.cn/archive/0.0.307/api-ref/rtc-server-sdk/go/go-api/overview) | [L98](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc-server-sdk/_platforms_.meta.js#L98) |

### 灵动课堂（flexible-classroom）

#### Android（android）：1 项

旧站 current：v2.8.60。平台配置：[docs-api-reference/flexible-classroom/_platforms_.meta.js:2](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/flexible-classroom/_platforms_.meta.js#L2)。

| 显示版本 | siteVersion | 归档入口 URL | 源码 |
| --- | --- | --- | --- |
| v2.8.50 | `0.0.1` | [https://doc-archive.shengwang.cn/archive/0.0.1/api-ref/flexible-classroom/android/API/edu_context_api_overview](https://doc-archive.shengwang.cn/archive/0.0.1/api-ref/flexible-classroom/android/API/edu_context_api_overview) | [L20](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/flexible-classroom/_platforms_.meta.js#L20) |

#### iOS（ios）：1 项

旧站 current：v2.8.60。平台配置：[docs-api-reference/flexible-classroom/_platforms_.meta.js:24](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/flexible-classroom/_platforms_.meta.js#L24)。

| 显示版本 | siteVersion | 归档入口 URL | 源码 |
| --- | --- | --- | --- |
| v2.8.50 | `0.0.1` | [https://doc-archive.shengwang.cn/archive/0.0.1/api-ref/flexible-classroom/ios/API/edu_context_api_overview](https://doc-archive.shengwang.cn/archive/0.0.1/api-ref/flexible-classroom/ios/API/edu_context_api_overview) | [L42](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/flexible-classroom/_platforms_.meta.js#L42) |

#### Web（javascript）：4 项

旧站 current：v2.9.40。平台配置：[docs-api-reference/flexible-classroom/_platforms_.meta.js:46](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/flexible-classroom/_platforms_.meta.js#L46)。

| 显示版本 | siteVersion | 归档入口 URL | 源码 |
| --- | --- | --- | --- |
| v2.9.20 | `0.0.69` | [https://doc-archive.shengwang.cn/archive/0.0.69/api-ref/flexible-classroom/javascript/overview](https://doc-archive.shengwang.cn/archive/0.0.69/api-ref/flexible-classroom/javascript/overview) | [L61](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/flexible-classroom/_platforms_.meta.js#L61) |
| v2.9.10 | `0.0.48` | [https://doc-archive.shengwang.cn/archive/0.0.48/api-ref/flexible-classroom/javascript/overview](https://doc-archive.shengwang.cn/archive/0.0.48/api-ref/flexible-classroom/javascript/overview) | [L65](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/flexible-classroom/_platforms_.meta.js#L65) |
| v2.9.0 | `0.0.40` | [https://doc-archive.shengwang.cn/archive/0.0.40/api-ref/flexible-classroom/javascript/overview](https://doc-archive.shengwang.cn/archive/0.0.40/api-ref/flexible-classroom/javascript/overview) | [L69](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/flexible-classroom/_platforms_.meta.js#L69) |
| v2.8.50 | `0.0.11` | [https://doc-archive.shengwang.cn/archive/0.0.11/api-ref/flexible-classroom/javascript/overview](https://doc-archive.shengwang.cn/archive/0.0.11/api-ref/flexible-classroom/javascript/overview) | [L73](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/flexible-classroom/_platforms_.meta.js#L73) |

#### Electron（electron）：4 项

旧站 current：v2.9.40。平台配置：[docs-api-reference/flexible-classroom/_platforms_.meta.js:77](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/flexible-classroom/_platforms_.meta.js#L77)。

| 显示版本 | siteVersion | 归档入口 URL | 源码 |
| --- | --- | --- | --- |
| v2.9.20 | `0.0.69` | [https://doc-archive.shengwang.cn/archive/0.0.69/api-ref/flexible-classroom/electron/overview](https://doc-archive.shengwang.cn/archive/0.0.69/api-ref/flexible-classroom/electron/overview) | [L92](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/flexible-classroom/_platforms_.meta.js#L92) |
| v2.9.10 | `0.0.48` | [https://doc-archive.shengwang.cn/archive/0.0.48/api-ref/flexible-classroom/electron/overview](https://doc-archive.shengwang.cn/archive/0.0.48/api-ref/flexible-classroom/electron/overview) | [L96](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/flexible-classroom/_platforms_.meta.js#L96) |
| v2.9.0 | `0.0.40` | [https://doc-archive.shengwang.cn/archive/0.0.40/api-ref/flexible-classroom/electron/overview](https://doc-archive.shengwang.cn/archive/0.0.40/api-ref/flexible-classroom/electron/overview) | [L100](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/flexible-classroom/_platforms_.meta.js#L100) |
| v2.8.50 | `0.0.11` | [https://doc-archive.shengwang.cn/archive/0.0.11/api-ref/flexible-classroom/electron/overview](https://doc-archive.shengwang.cn/archive/0.0.11/api-ref/flexible-classroom/electron/overview) | [L104](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/flexible-classroom/_platforms_.meta.js#L104) |

## current、其他历史入口和未启用配置的边界

- 激活产品清单是 12 个配置组、56 个平台，共有 51 个 `siteVersion: current` 项；其中上述有历史记录的平台含 45 个 current 系列，另外 RTC C# 1 项、云端录制 Go/Java 2 项、灵动会议 Android/iOS/Electron 3 项仅 current，均无 archive 历史项。来源：[docs-api-reference/_products_.meta.js:16](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/_products_.meta.js#L16) 及相应平台配置。
- 激活的 AIGC 两个平台没有 `versions`；ConvoAI 三个 agent-* 平台、RTM RESTful 也没有版本表。不能把普通版本说明或 npm 包版本自动当成 archive 入口。
- `agora-chat`、`one-to-one-live`、`iot-apaas`、`dummy-product`、`agora-product` 目录存在但不在生效 API 产品清单；读取它们的平台配置没有发现非 current 版本项。iot-apaas、dummy-product、agora-product 在产品清单中是注释配置。
- RTM RN 平台、RTSA Java 平台、云端录制 Python 平台、本地录制若干旧平台为注释项，不恢复成可见入口；RTC HarmonyOS beta 的 `v4.3.0-beta.1 / 0.0.184` 亦被注释，不计数。来源：[docs-api-reference/rtm2/_platforms_.meta.js:357](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtm2/_platforms_.meta.js#L357)、[docs-api-reference/rtsa/_platforms_.meta.js:2](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtsa/_platforms_.meta.js#L2)、[docs-api-reference/cloud-recording/_platforms_.meta.js:32](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/cloud-recording/_platforms_.meta.js#L32)、[docs-api-reference/recording/_platforms_.meta.js:2](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/recording/_platforms_.meta.js#L2)、[docs-api-reference/rtc/_platforms_.meta.js:360](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/rtc/_platforms_.meta.js#L360)。
- 未在平台对象中发现额外 hide/hidden 标记。构建时仍可能受 `PRODUCTS`/`PLATFORMS` 环境过滤影响；本盘点按源码完整生效清单而非某次限定构建产物统计。来源：[plugins/plugin-content-docs-ag/doc-factory/utils.js:58](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/plugins/plugin-content-docs-ag/doc-factory/utils.js#L58)、[plugins/plugin-content-docs-ag/doc-factory/utils.js:71](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/plugins/plugin-content-docs-ag/doc-factory/utils.js#L71)。

### 其他历史入口（不混入 228 个 archive 选项）

| 类型 | 产品 / 入口 | 结论与证据 |
| --- | --- | --- |
| 旧站站内 Legacy | 本地录制 C++、Java 的 Legacy API | 侧栏引用站内 `recording/{{platform}}/overview` 等文档，没有归档域名；与 v4.4.150 archive 两条是不同概念。来源：[docs-api-reference/recording/_sidebar_.meta.cpp.js:48](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/recording/_sidebar_.meta.cpp.js#L48)、[docs-api-reference/recording/_sidebar_.meta.java.js:43](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs-api-reference/recording/_sidebar_.meta.java.js#L43)。 |
| 其他历史外链，但已注释 | 白板旧文档转换 RESTful API | 候选 [旧版转换 API](https://docportal.shengwang.cn/cn/whiteboard/whiteboard_file_conversion_old?platform=RESTful) 位于 JSX 注释内，不是当前生效入口，不自动恢复。来源：[docs/shared/whiteboard/advanced-features/_convert-files.mdx:15](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs/shared/whiteboard/advanced-features/_convert-files.mdx#L15)、[docs/shared/whiteboard/advanced-features/_convert-files.mdx:32](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/docs/shared/whiteboard/advanced-features/_convert-files.mdx#L32)。 |

## 新站现状与后续接入边界

### 新站已保留什么

全量读取 `content/docs/zh-CN/api-reference/**/meta.json`：20 个文件配置了 `navScope.versions`，其中 17 个仅有 current；另外 3 个文件共有 3 条站内历史选项。未发现指向旧站归档域名的版本外链。最新旧站主线的 228 条 archive 版本选项尚未按这些归档 URL 配置到新站版本菜单；这不表示 228 个版本的内容全部缺失——新站已有 current 及下表 3 条站内历史入口。站内历史页面是否与归档快照内容相同，本轮没有比较。

| 新站历史入口 | 当前承接方式 | 源码 |
| --- | --- | --- |
| RTC Android v4.6.0 | 本站 `4.6.0` 目录，current 为 v4.7.0 | [Android meta.json:11](/Users/yejiayi/Documents/docs-portal/content/docs/zh-CN/api-reference/rtc/android/meta.json:11) |
| 本地录制 C++ Legacy | 本站 `legacy/overview`，标签未标明 SDK 数字版本 | [C++ meta.json:12](/Users/yejiayi/Documents/docs-portal/content/docs/zh-CN/api-reference/local-server-recording/cpp/meta.json:12) |
| 本地录制 Java Legacy | 本站 `legacy/overview`，标签未标明 SDK 数字版本 | [Java meta.json:12](/Users/yejiayi/Documents/docs-portal/content/docs/zh-CN/api-reference/local-server-recording/java/meta.json:12) |

此前同步记录也明确将旧 RTC 平台/版本下拉元数据排除在迁移之外：[cn-master-sync-20261015-mapping.md:30](/Users/yejiayi/Documents/docs-portal/docs/migration/cn-master-sync-20261015-mapping.md:30)。这说明现有 API 页面迁移与历史版本入口保留需要分别核对。

### 逐产品接入位置

下表路径均相对 `content/docs/zh-CN/api-reference/`；只是后续实施定位，不代表本次已修改配置。

| 旧站产品配置 | 新站对应位置 | 需要注意的平台映射 |
| --- | --- | --- |
| `convoai` | `conversational-ai/{android,ios,web,restclient-go,restclient-java}` | `typescript → web`、`go → restclient-go`、`java → restclient-java`；restclient 与 Agent SDK 分开。依据：[产品导航](/Users/yejiayi/Documents/docs-portal/content/docs/zh-CN/api-reference/conversational-ai/meta.json:1) |
| `rtc` | `rtc/` 下对应平台 | `javascript → web`、`windows → cpp-all-platforms`、`rn → react-native`、`react → react-sdk`；React 底层 Web 位于 `react-sdk/web-sdk/`，不混入 wrapper 版本表。C# 旧站仅 current，不在 111 项内。依据：[产品导航](/Users/yejiayi/Documents/docs-portal/content/docs/zh-CN/api-reference/rtc/meta.json:1)、[React 导航](/Users/yejiayi/Documents/docs-portal/content/docs/zh-CN/api-reference/rtc/react-sdk/meta.json:1) |
| `rtm2` | `rtm/{web,android,ios,swift,cpp,unity,flutter,harmonyos}` | `javascript → web`；新站 RN 有页面，但旧站该平台被注释，不能据此补造历史版本。依据：[RTM 导航](/Users/yejiayi/Documents/docs-portal/content/docs/zh-CN/api-reference/rtm/meta.json:1) |
| `rtsa` | `rtsa/c` | 已有 current v1.10.1，缺 5 条 archive 选项。依据：[C meta](/Users/yejiayi/Documents/docs-portal/content/docs/zh-CN/api-reference/rtsa/c/meta.json:1) |
| `whiteboard` | `whiteboard/whiteboard-sdk/{android,ios,web}` | `javascript → web`。依据：[白板 SDK 导航](/Users/yejiayi/Documents/docs-portal/content/docs/zh-CN/api-reference/whiteboard/whiteboard-sdk/meta.json:1) |
| `fastboard` | `whiteboard/fastboard/{android,ios,web}` | 新站产品层级合并到白板，archive 目标仍须使用旧 `/fastboard/` 路径。依据：[Fastboard 导航](/Users/yejiayi/Documents/docs-portal/content/docs/zh-CN/api-reference/whiteboard/fastboard/meta.json:1) |
| `recording` | `local-server-recording/{cpp,java}` | 两条 v4.4.150 archive 与已有两个 Legacy 站内入口分别处理。依据：上表两个录制 meta |
| `rtc-server-sdk` | `rtc-server-sdk/{cpp,java,python-api,go-api}` | `python → python-api`、`go → go-api`。依据：[服务端 SDK 导航](/Users/yejiayi/Documents/docs-portal/content/docs/zh-CN/api-reference/rtc-server-sdk/meta.json:1) |
| `flexible-classroom` | `flexible-classroom/{android,ios,web,electron}` | `javascript → web`。依据：[灵动课堂导航](/Users/yejiayi/Documents/docs-portal/content/docs/zh-CN/api-reference/flexible-classroom/meta.json:1) |

### 后续实施约束

- 保留 SDK 显示版本号与 master 原始 siteVersion 的追溯关系，外链使用旧站路径。已验证失效的 13 项采用 [覆盖文件](./api-reference-archive-url-overrides-20261020.json) 的 href 作为实施地址；不要将覆盖后的归档编号回写成 master 原值，也不能拿新站产品名、平台名或新站 URL 拼接 archive 地址。
- 维持现有本站 current 与三个历史入口；Android v4.6.0 同时存在本站页面与旧站 archive 配置，实施时应明确菜单表达，避免出现两个无区别的同名选项。
- 新站版本元数据已有 `href` 字段，链接解析器会直接返回配置的 href；可据此设计接入，但外域导航、新标签页行为、移动端菜单及 React 双系列尚未做端到端验证，不能仅凭字段存在就视作已支持全部行为。依据：[schema:75](/Users/yejiayi/Documents/docs-portal/src/lib/docs-meta-schema.ts:75)、[版本链接解析:860](/Users/yejiayi/Documents/docs-portal/src/lib/docs-nav-scope.ts:860)、[菜单组件:94](/Users/yejiayi/Documents/docs-portal/src/components/docs-shell/DocsSidebarHeaderBlock.tsx:94)。
- 上线前应用已核验的 13 项覆盖，并继续核验其余旧快照入口及页面内容版本。RN v6.x 等未包含在这 13 项中的疑点仍待处理。此次仅更新清单与调查资料，尚未接入导航。

## 本地完整性校验

- 最新复核：2026-10-20 15:10（Asia/Shanghai），执行 `git fetch --no-tags origin master` 后，`origin/master` 仍为 `e91218031d7dd02ff84a66fc1b5f422a1cd28a64`，无需调整历史版本映射。
- 与刷新后的 master 逐项比对：汇总表 51 条 current、历史平台正文中的 45 条 current、228 条「显示版本号 / siteVersion / 完整归档入口 URL」全部一致；228 个历史项对应 223 个不同归档 URL。361 个固定提交源码行引用均有效，每条历史项的引用行均包含其 siteVersion。
- 已补齐汇总表中只有 current 的 6 条配置：RTC C# Windows、云端录制 Go/Java、灵动会议 Android/iOS/Electron。它们没有新增 archive 选项。
- 逐份通过 `git show e91218031:<path>` 读取并求值最新主线 API 平台配置，与同提交源码位置对应；仅统计生效对象，排除注释。
- 历史项行数：228；涉及平台：44；React 额外划分一个版本系列，共 45；按生成的完整入口 URL 去重：223。
- 当前项与历史项分别处理，未生成 current 归档 URL；prevPlatform、React pathFilter 均已应用到表内 URL。
- 没有运行应用测试或构建：本次只新增盘点报告，不修改运行代码；未进行外网可达性验证。
- 源码一致性检查确认的是与 master 原值一致。后续线上复核已为 ConvoAI `0.0454`、RTC 小程序 `v0.0.166` 等 13 个失效入口找到可用目标，详见覆盖文件；RN 的 v6.x 标签仍未核验。源码比对通过不代表源地址在线可用。
