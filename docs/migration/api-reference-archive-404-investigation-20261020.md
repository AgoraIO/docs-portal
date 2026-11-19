# 13 条 API 归档失效入口调查与可用替代（2026-10-20）

> 阶段说明：下文“未修改运行配置”等表述描述本报告的调查交接阶段。当前工作分支已应用全部 13 项覆盖，实施结果与后续全量 URL 请求结果见 [实施验证报告](./api-reference-historical-archive-validation-20261020.md)。原 Git 和 16:06 浏览器核验记录保持不变。

## 结论与边界

- 本报告只调查用户指出的 13 条链接，不扩展到其余归档 URL。主线配置基线为 `e91218031d7dd02ff84a66fc1b5f422a1cd28a64`；历史证据使用各 tag 解析后的固定 commit。旧站工作区未切分支、未改源码；完整清单保留 master 源映射，并增加本报告及覆盖文件的实施提示。
- 已找到三类问题：归档编号格式错误；配置指向没有对应 archive tag 的普通版本；存在 tag 但版本标签、实际 HTML 或线上发布状况不一致。**Git tag 存在不等于 OSS 归档已成功发布；没有 archive-* tag 也不等于 URL 必然不存在。**
- Git 调查阶段执行了本地只读检查及定向 `git ls-remote --tags origin`；随后主代理完成原地址及替代地址 GET、浏览器渲染和版本标签核验，结果见「线上 HTTP 与浏览器验证」。
- 13 个原地址均复现软 404，13 个最终替代入口均已确认可访问且显示目标版本。实施可直接读取 [机器可读覆盖文件](./api-reference-archive-url-overrides-20261020.json)。下文逐条保留调查时的“候选”称呼及其源码证据；本轮仅修改调查与交接资料，尚未修改新站运行配置。

## 为什么不能把版本元数据直接当作发布索引

归档 workflow 从 master 切出 `release/archive-prod`，从 `data/version.ts` 取编号并打 `archive-<编号>` tag；tag 在 GitHub workflow 中创建，OSS 上传则由另一个 Docker/Jenkins 构建步骤完成，两者不是一个成功状态。归档 Dockerfile 修改 baseUrl 后上传 `archive/<RELEASE_VERSION>`，而普通生产 Dockerfile 上传 `release/<RELEASE_VERSION>`。因此普通 `0.0.N`/`v0.0.N` tag 只能证明源码快照，不能证明对应 archive 路径已发布。证据：[归档分支/tag 创建](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/.github/workflows/push-to-archive.yaml#L27)、[归档构建与上传](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/deploy/archive/Dockerfile#L21)、[生产版本上传](https://github.com/AgoraIO/shengwang-doc-source/blob/e91218031d7dd02ff84a66fc1b5f422a1cd28a64/deploy/prod/Dockerfile#L21)。

### 定向远端 tag 核对

定向查询模式包括 `*0.0454`、`*0.0.454`、`*0.0.379`、`*0.0.216`、`*0.0.136`、`*0.0.125`、`*0.0.172`、`*0.0.166`：远端返回普通 tag `0.0.166/172/216/379/454`，没有返回这些编号的 archive-* tag；`0.0454`、`0.0.136`、`0.0.125` 也没有对应普通 tag。该观察是 2026-10-20 的 Git 引用清单，不是对历史发布流水线成功/失败的断言。

| 原编号 | 本地普通 tag | 本地 archive tag | 解释边界 |
| --- | --- | --- | --- |
| `0.0454` | 未发现 | 未发现 | 不能仅据 tag 缺失判定 OSS 快照缺失。 |
| `0.0.454` | `0.0.454` | 未发现 | 不能仅据 tag 缺失判定 OSS 快照缺失。 |
| `0.0.379` | `0.0.379` | 未发现 | 不能仅据 tag 缺失判定 OSS 快照缺失。 |
| `0.0.345` | `0.0.345` | `archive-0.0.345` | archive tag 存在；仍需检查路由和发布产物。 |
| `v0.0.166` | `0.0.166` | 未发现 | 不能仅据 tag 缺失判定 OSS 快照缺失。 |
| `0.0.216` | `0.0.216` | 未发现 | 不能仅据 tag 缺失判定 OSS 快照缺失。 |
| `0.0.202` | `0.0.202` | `archive-0.0.202` | archive tag 存在；仍需检查路由和发布产物。 |
| `0.0.136` | 未发现 | 未发现 | 不能仅据 tag 缺失判定 OSS 快照缺失。 |
| `0.0.125` | 未发现 | 未发现 | 不能仅据 tag 缺失判定 OSS 快照缺失。 |
| `0.0.289` | `0.0.289` | `archive-0.0.289` | archive tag 存在；仍需检查路由和发布产物。 |
| `0.0.172` | `0.0.172` | 未发现 | 不能仅据 tag 缺失判定 OSS 快照缺失。 |

## 逐条原链接、Git 身份与候选

每个候选均检查了平台 current 标签和入口源文件；Web 另检查原始 HTML `<title>` 中的 SDK 版号。其他产品入口未明示 SDK 数字版本时，表中如实标注，不将 Doxygen/AppleDoc 工具版号误当成 SDK 版号。

### 1. convoai / android / v1.7.0

原链接：[https://doc-archive.shengwang.cn/archive/0.0454/api-ref/convoai/android/android-component/overview](https://doc-archive.shengwang.cn/archive/0.0454/api-ref/convoai/android/android-component/overview)。

候选：[https://doc-archive.shengwang.cn/archive/0.0.455/api-ref/convoai/android/android-component/overview](https://doc-archive.shengwang.cn/archive/0.0.455/api-ref/convoai/android/android-component/overview)。源码 tag：`archive-0.0.455` → `4ac75715f79b9de08f1dcd06841d8b899f374d14`。[配置 current：v1.7.0](https://github.com/AgoraIO/shengwang-doc-source/blob/4ac75715f79b9de08f1dcd06841d8b899f374d14/docs-api-reference/convoai/_platforms_.meta.js#L57)；[入口源文件](https://github.com/AgoraIO/shengwang-doc-source/blob/4ac75715f79b9de08f1dcd06841d8b899f374d14/docs-api-reference/convoai/android-component/overview.android.mdx#L1)。入口文件存在；此入口正文未明示目标 SDK 数字版本，身份主要来自 current 配置及下节源码同一性证据。

### 2. convoai / ios / v1.7.0

原链接：[https://doc-archive.shengwang.cn/archive/0.0454/api-ref/convoai/ios/ios-component/overview](https://doc-archive.shengwang.cn/archive/0.0454/api-ref/convoai/ios/ios-component/overview)。

候选：[https://doc-archive.shengwang.cn/archive/0.0.455/api-ref/convoai/ios/ios-component/overview](https://doc-archive.shengwang.cn/archive/0.0.455/api-ref/convoai/ios/ios-component/overview)。源码 tag：`archive-0.0.455` → `4ac75715f79b9de08f1dcd06841d8b899f374d14`。[配置 current：v1.7.0](https://github.com/AgoraIO/shengwang-doc-source/blob/4ac75715f79b9de08f1dcd06841d8b899f374d14/docs-api-reference/convoai/_platforms_.meta.js#L76)；[入口源文件](https://github.com/AgoraIO/shengwang-doc-source/blob/4ac75715f79b9de08f1dcd06841d8b899f374d14/docs-api-reference/convoai/ios-component/overview.ios.mdx#L1)。入口文件存在；此入口正文未明示目标 SDK 数字版本，身份主要来自 current 配置及下节源码同一性证据。

### 3. convoai / typescript / v1.7.0

原链接：[https://doc-archive.shengwang.cn/archive/0.0.454/api-ref/convoai/typescript/web-component/overview](https://doc-archive.shengwang.cn/archive/0.0.454/api-ref/convoai/typescript/web-component/overview)。

候选：[https://doc-archive.shengwang.cn/archive/0.0.455/api-ref/convoai/typescript/web-component/overview](https://doc-archive.shengwang.cn/archive/0.0.455/api-ref/convoai/typescript/web-component/overview)。源码 tag：`archive-0.0.455` → `4ac75715f79b9de08f1dcd06841d8b899f374d14`。[配置 current：v1.7.0](https://github.com/AgoraIO/shengwang-doc-source/blob/4ac75715f79b9de08f1dcd06841d8b899f374d14/docs-api-reference/convoai/_platforms_.meta.js#L95)；[入口源文件](https://github.com/AgoraIO/shengwang-doc-source/blob/4ac75715f79b9de08f1dcd06841d8b899f374d14/docs-api-reference/convoai/web-component/overview.typescript.mdx#L1)。入口文件存在；此入口正文未明示目标 SDK 数字版本，身份主要来自 current 配置及下节源码同一性证据。

### 4. rtc / javascript / v4.24.1

原链接：[https://doc-archive.shengwang.cn/archive/0.0.379/api-ref/rtc/javascript/overview](https://doc-archive.shengwang.cn/archive/0.0.379/api-ref/rtc/javascript/overview)。

候选：[https://doc-archive.shengwang.cn/archive/0.0.405/api-ref/rtc/javascript/overview](https://doc-archive.shengwang.cn/archive/0.0.405/api-ref/rtc/javascript/overview)。源码 tag：`archive-0.0.405` → `97735ce8365b236c33f0c1b37cdee5f8e807b0d7`。[配置 current：v4.24.1](https://github.com/AgoraIO/shengwang-doc-source/blob/97735ce8365b236c33f0c1b37cdee5f8e807b0d7/docs-api-reference/rtc/_platforms_.meta.js#L180)；[入口源文件](https://github.com/AgoraIO/shengwang-doc-source/blob/97735ce8365b236c33f0c1b37cdee5f8e807b0d7/html-docs/rtc/Web/index.html#L6)。HTML 明示 `Agora Web SDK API Reference v4.24.1`；SDK 数字版号可直接核对。

### 5. rtc / javascript / v4.23.0

原链接：[https://doc-archive.shengwang.cn/archive/0.0.345/api-ref/rtc/javascript/overview](https://doc-archive.shengwang.cn/archive/0.0.345/api-ref/rtc/javascript/overview)。

候选：[https://doc-archive.shengwang.cn/archive/0.0.234/api-ref/rtc/javascript/overview](https://doc-archive.shengwang.cn/archive/0.0.234/api-ref/rtc/javascript/overview)。源码 tag：`archive-0.0.234` → `29b2d9e3ced95c2f0f189e3f725e8c4bcd49cc23`。[配置 current：v4.23.0](https://github.com/AgoraIO/shengwang-doc-source/blob/29b2d9e3ced95c2f0f189e3f725e8c4bcd49cc23/docs-api-reference/rtc/_platforms_.meta.js#L144)；[入口源文件](https://github.com/AgoraIO/shengwang-doc-source/blob/29b2d9e3ced95c2f0f189e3f725e8c4bcd49cc23/html-docs/rtc/Web/index.html#L6)。HTML 明示 `Agora Web SDK API Reference v4.23.0`；SDK 数字版号可直接核对。

### 6. rtc / mini-program / v2.6.0

原链接：[https://doc-archive.shengwang.cn/archive/v0.0.166/api-ref/rtc/mini-program/overview](https://doc-archive.shengwang.cn/archive/v0.0.166/api-ref/rtc/mini-program/overview)。

候选：[https://doc-archive.shengwang.cn/archive/0.0.166/api-ref/rtc/mini-program/overview](https://doc-archive.shengwang.cn/archive/0.0.166/api-ref/rtc/mini-program/overview)。源码 tag：`0.0.166` → `f2603be4c70f0231622662a5795c4c7dcd864f2b`。[配置 current：v2.6.0](https://github.com/AgoraIO/shengwang-doc-source/blob/f2603be4c70f0231622662a5795c4c7dcd864f2b/docs-api-reference/rtc/_platforms_.meta.js#L242)；[入口源文件](https://github.com/AgoraIO/shengwang-doc-source/blob/f2603be4c70f0231622662a5795c4c7dcd864f2b/html-docs/rtc/mini-program/index.html#L6)。入口文件存在；此入口正文未明示目标 SDK 数字版本，身份主要来自 current 配置及下节源码同一性证据。

### 7. rtc / harmonyos / v4.4.1

原链接：[https://doc-archive.shengwang.cn/archive/0.0.216/api-ref/rtc/harmonyos/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.216/api-ref/rtc/harmonyos/API/rtc_api_overview)。

候选：[https://doc-archive.shengwang.cn/archive/0.0.211/api-ref/rtc/harmonyos/API/rtc_api_overview](https://doc-archive.shengwang.cn/archive/0.0.211/api-ref/rtc/harmonyos/API/rtc_api_overview)。源码 tag：`archive-0.0.211` → `fc1c82462d26d95546cd1d891b93d5ceb446a3a7`。[配置 current：v4.4.1](https://github.com/AgoraIO/shengwang-doc-source/blob/fc1c82462d26d95546cd1d891b93d5ceb446a3a7/docs-api-reference/rtc/_platforms_.meta.js#L228)；[入口源文件](https://github.com/AgoraIO/shengwang-doc-source/blob/fc1c82462d26d95546cd1d891b93d5ceb446a3a7/html-docs/rtc/HarmonyOS/API/rtc_api_overview.html#L3)。入口文件存在；此入口正文未明示目标 SDK 数字版本，身份主要来自 current 配置及下节源码同一性证据。

### 8. rtm2 / flutter / v2.2.1

原链接：[https://doc-archive.shengwang.cn/archive/0.0.202/api-ref/rtm2/flutter/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.202/api-ref/rtm2/flutter/toc-configuration/configuration)。

候选：[https://doc-archive.shengwang.cn/archive/0.0.197/api-ref/rtm2/flutter/toc-configuration/configuration](https://doc-archive.shengwang.cn/archive/0.0.197/api-ref/rtm2/flutter/toc-configuration/configuration)。源码 tag：`archive-0.0.197` → `8a8eb499a87c1833b63027e4e57449f40386eb83`。[配置 current：v2.2.1](https://github.com/AgoraIO/shengwang-doc-source/blob/8a8eb499a87c1833b63027e4e57449f40386eb83/docs-api-reference/rtm2/_platforms_.meta.js#L207)；[入口源文件](https://github.com/AgoraIO/shengwang-doc-source/blob/8a8eb499a87c1833b63027e4e57449f40386eb83/docs-api-reference/rtm2/toc-configuration/configuration.flutter.mdx#L1)。入口文件存在；此入口正文未明示目标 SDK 数字版本，身份主要来自 current 配置及下节源码同一性证据。

### 9. whiteboard / android / v2.16.81

原链接：[https://doc-archive.shengwang.cn/archive/0.0.136/api-ref/whiteboard/android/overview](https://doc-archive.shengwang.cn/archive/0.0.136/api-ref/whiteboard/android/overview)。

候选：[https://doc-archive.shengwang.cn/archive/0.0.134/api-ref/whiteboard/android/overview](https://doc-archive.shengwang.cn/archive/0.0.134/api-ref/whiteboard/android/overview)。源码 tag：`v0.0.134` → `7f86ee166840c74a6691710598d49fda0f83e934`。[配置 current：v2.16.81](https://github.com/AgoraIO/shengwang-doc-source/blob/7f86ee166840c74a6691710598d49fda0f83e934/docs-api-reference/whiteboard/_platforms_.meta.js#L18)；[入口源文件](https://github.com/AgoraIO/shengwang-doc-source/blob/7f86ee166840c74a6691710598d49fda0f83e934/html-docs/whiteboard/Android/index.html#L8)。入口文件存在；此入口正文未明示目标 SDK 数字版本，身份主要来自 current 配置及下节源码同一性证据。

### 10. whiteboard / ios / v2.16.88

原链接：[https://doc-archive.shengwang.cn/archive/0.0.136/api-ref/whiteboard/ios/docs/headers/Agora-Interactive-Whiteboard-Objective-C-Overview](https://doc-archive.shengwang.cn/archive/0.0.136/api-ref/whiteboard/ios/docs/headers/Agora-Interactive-Whiteboard-Objective-C-Overview)。

候选：[https://doc-archive.shengwang.cn/archive/0.0.134/api-ref/whiteboard/ios/docs/headers/Agora-Interactive-Whiteboard-Objective-C-Overview](https://doc-archive.shengwang.cn/archive/0.0.134/api-ref/whiteboard/ios/docs/headers/Agora-Interactive-Whiteboard-Objective-C-Overview)。源码 tag：`v0.0.134` → `7f86ee166840c74a6691710598d49fda0f83e934`。[配置 current：v2.16.88](https://github.com/AgoraIO/shengwang-doc-source/blob/7f86ee166840c74a6691710598d49fda0f83e934/docs-api-reference/whiteboard/_platforms_.meta.js#L47)；[入口源文件](https://github.com/AgoraIO/shengwang-doc-source/blob/7f86ee166840c74a6691710598d49fda0f83e934/html-docs/whiteboard/iOS/docs/headers/Agora-Interactive-Whiteboard-Objective-C-Overview.html#L6)。入口文件存在；此入口正文未明示目标 SDK 数字版本，身份主要来自 current 配置及下节源码同一性证据。

### 11. whiteboard / javascript / v2.16.49

原链接：[https://doc-archive.shengwang.cn/archive/0.0.125/api-ref/whiteboard/javascript/overview](https://doc-archive.shengwang.cn/archive/0.0.125/api-ref/whiteboard/javascript/overview)。

候选：[https://doc-archive.shengwang.cn/archive/0.0.124/api-ref/whiteboard/javascript/overview](https://doc-archive.shengwang.cn/archive/0.0.124/api-ref/whiteboard/javascript/overview)。源码 tag：`v0.0.124` → `e3b533335ab92cd5ecfa37f0fdadf3c2798331eb`。[配置 current：v2.16.49](https://github.com/AgoraIO/shengwang-doc-source/blob/e3b533335ab92cd5ecfa37f0fdadf3c2798331eb/docs-api-reference/whiteboard/_platforms_.meta.js#L80)；[入口源文件](https://github.com/AgoraIO/shengwang-doc-source/blob/e3b533335ab92cd5ecfa37f0fdadf3c2798331eb/html-docs/whiteboard/Web/index.html#L6)。入口文件存在；此入口正文未明示目标 SDK 数字版本，身份主要来自 current 配置及下节源码同一性证据。

### 12. rtc-server-sdk / cpp / v4.4.30

原链接：[https://doc-archive.shengwang.cn/archive/0.0.289/api-ref/rtc-server-sdk/cpp/overview](https://doc-archive.shengwang.cn/archive/0.0.289/api-ref/rtc-server-sdk/cpp/overview)。

候选：[https://doc-archive.shengwang.cn/archive/0.0.282/api-ref/rtc-server-sdk/cpp/overview](https://doc-archive.shengwang.cn/archive/0.0.282/api-ref/rtc-server-sdk/cpp/overview)。源码 tag：`archive-0.0.282` → `7ae1c1b3e576d47c4f6b1154a95d59c69fdd1b53`。[配置 current：v4.4.30](https://github.com/AgoraIO/shengwang-doc-source/blob/7ae1c1b3e576d47c4f6b1154a95d59c69fdd1b53/docs-api-reference/rtc-server-sdk/_platforms_.meta.js#L13)；[入口源文件](https://github.com/AgoraIO/shengwang-doc-source/blob/7ae1c1b3e576d47c4f6b1154a95d59c69fdd1b53/html-docs/rtc-server-sdk/cpp/index.html#L8)。入口文件存在；此入口正文未明示目标 SDK 数字版本，身份主要来自 current 配置及下节源码同一性证据。

### 13. rtc-server-sdk / cpp / v4.2.31

原链接：[https://doc-archive.shengwang.cn/archive/0.0.172/api-ref/rtc-server-sdk/cpp/overview](https://doc-archive.shengwang.cn/archive/0.0.172/api-ref/rtc-server-sdk/cpp/overview)。

候选：[https://doc-archive.shengwang.cn/archive/0.0.171/api-ref/rtc-server-sdk/cpp/overview](https://doc-archive.shengwang.cn/archive/0.0.171/api-ref/rtc-server-sdk/cpp/overview)。源码 tag：`0.0.171` → `ff8f209f512771fa0c99a2f23ba294c54d0669a8`。[配置 current：v4.2.31](https://github.com/AgoraIO/shengwang-doc-source/blob/ff8f209f512771fa0c99a2f23ba294c54d0669a8/docs-api-reference/rtc-server-sdk/_platforms_.meta.js#L13)；[入口源文件](https://github.com/AgoraIO/shengwang-doc-source/blob/ff8f209f512771fa0c99a2f23ba294c54d0669a8/html-docs/rtc-server-sdk/cpp/index.html#L8)。入口文件存在；此入口正文未明示目标 SDK 数字版本，身份主要来自 current 配置及下节源码同一性证据。

## 候选身份的补强证据

### 有完整源码同一性证据的替代快照

以下通过 `git rev-parse <ref>:<path>` 比较对象 ID；目录 tree 相同表示该目录全部文件与子目录逐字相同，blob 相同表示该文件逐字相同。这比只看 current 标签更强，但不代表两个完整站点构建产物完全相同。

| 原普通/归档快照 → 候选 | 比较范围 | 相同对象 ID | 固定源码证据 |
| --- | --- | --- | --- |
| 0.0.454 → archive-0.0.455 | `docs-api-reference/convoai/android-component` | `8851ae5137d21ff6015925245e69faa72514411f` | [0.0.454](https://github.com/AgoraIO/shengwang-doc-source/tree/96e98c57d8223190c29355973b8c244394fad843/docs-api-reference/convoai/android-component)、[archive-0.0.455](https://github.com/AgoraIO/shengwang-doc-source/tree/4ac75715f79b9de08f1dcd06841d8b899f374d14/docs-api-reference/convoai/android-component) |
| 0.0.454 → archive-0.0.455 | `docs-api-reference/convoai/ios-component` | `f24edb537a4069cf23796ef82d6ef7c8bbbcdb8e` | [0.0.454](https://github.com/AgoraIO/shengwang-doc-source/tree/96e98c57d8223190c29355973b8c244394fad843/docs-api-reference/convoai/ios-component)、[archive-0.0.455](https://github.com/AgoraIO/shengwang-doc-source/tree/4ac75715f79b9de08f1dcd06841d8b899f374d14/docs-api-reference/convoai/ios-component) |
| 0.0.454 → archive-0.0.455 | `docs-api-reference/convoai/web-component` | `6c7736eadf67528c754904052427521e9a57c335` | [0.0.454](https://github.com/AgoraIO/shengwang-doc-source/tree/96e98c57d8223190c29355973b8c244394fad843/docs-api-reference/convoai/web-component)、[archive-0.0.455](https://github.com/AgoraIO/shengwang-doc-source/tree/4ac75715f79b9de08f1dcd06841d8b899f374d14/docs-api-reference/convoai/web-component) |
| 0.0.216 → archive-0.0.211 | `html-docs/rtc/HarmonyOS` | `b610cc7c33e5eb382dc894177384baca92bfef9a` | [0.0.216](https://github.com/AgoraIO/shengwang-doc-source/tree/981da290fb94512dbccbf31ef98dd3560b553efd/html-docs/rtc/HarmonyOS)、[archive-0.0.211](https://github.com/AgoraIO/shengwang-doc-source/tree/fc1c82462d26d95546cd1d891b93d5ceb446a3a7/html-docs/rtc/HarmonyOS) |
| archive-0.0.202 → archive-0.0.197 | `docs-api-reference/rtm2/toc-configuration/configuration.flutter.mdx` | `e3474dabfe42e557f33b0f8cc2201aac215b6b3a` | [archive-0.0.202](https://github.com/AgoraIO/shengwang-doc-source/tree/7a442a744c440ad5d6d511a3da27f493f293c4fb/docs-api-reference/rtm2/toc-configuration/configuration.flutter.mdx)、[archive-0.0.197](https://github.com/AgoraIO/shengwang-doc-source/tree/8a8eb499a87c1833b63027e4e57449f40386eb83/docs-api-reference/rtm2/toc-configuration/configuration.flutter.mdx) |
| archive-0.0.202 → archive-0.0.197 | `shared/rtm2` | `b80a426c4e817e6eb4648e49a60f83c9d30644d9` | [archive-0.0.202](https://github.com/AgoraIO/shengwang-doc-source/tree/7a442a744c440ad5d6d511a3da27f493f293c4fb/shared/rtm2)、[archive-0.0.197](https://github.com/AgoraIO/shengwang-doc-source/tree/8a8eb499a87c1833b63027e4e57449f40386eb83/shared/rtm2) |
| archive-0.0.289 → archive-0.0.282 | `html-docs/rtc-server-sdk/cpp` | `28768686b651d82b529560bfd33e73dde9d3c8e1` | [archive-0.0.289](https://github.com/AgoraIO/shengwang-doc-source/tree/ff8e714a9889fcbd87892d75d8b2ff71b4a9612c/html-docs/rtc-server-sdk/cpp)、[archive-0.0.282](https://github.com/AgoraIO/shengwang-doc-source/tree/7ae1c1b3e576d47c4f6b1154a95d59c69fdd1b53/html-docs/rtc-server-sdk/cpp) |
| 0.0.172 → 0.0.171 | `html-docs/rtc-server-sdk/cpp` | `5e814814bbd9fa022162f82a5b7447ed0060cf58` | [0.0.172](https://github.com/AgoraIO/shengwang-doc-source/tree/3d6f3d1ccdabb819bca2bafbd00e4756b792dd91/html-docs/rtc-server-sdk/cpp)、[0.0.171](https://github.com/AgoraIO/shengwang-doc-source/tree/ff8f209f512771fa0c99a2f23ba294c54d0669a8/html-docs/rtc-server-sdk/cpp) |
| 0.0.136 升版提交 → v0.0.134 | `html-docs/whiteboard/Android` | `6284106ce31e4eb65a84ddca486372e8e906a0a3` | [升版提交](https://github.com/AgoraIO/shengwang-doc-source/tree/620d237d6941653c4e60493a9a739c9b049fe09d/html-docs/whiteboard/Android)、[候选](https://github.com/AgoraIO/shengwang-doc-source/tree/7f86ee166840c74a6691710598d49fda0f83e934/html-docs/whiteboard/Android) |
| 0.0.136 升版提交 → v0.0.134 | `html-docs/whiteboard/iOS` | `57968c435b493bbef0e73eff59dc1a6dee076bb5` | [升版提交](https://github.com/AgoraIO/shengwang-doc-source/tree/620d237d6941653c4e60493a9a739c9b049fe09d/html-docs/whiteboard/iOS)、[候选](https://github.com/AgoraIO/shengwang-doc-source/tree/7f86ee166840c74a6691710598d49fda0f83e934/html-docs/whiteboard/iOS) |
| 0.0.125 升版提交 → v0.0.124 | `html-docs/whiteboard/Web` | `2dbcd1203e022ecdd3f9683599b5357c5f4ad498` | [升版提交](https://github.com/AgoraIO/shengwang-doc-source/tree/86dc73486c8b432eb38f56ede2f5eb259cd1140d/html-docs/whiteboard/Web)、[候选](https://github.com/AgoraIO/shengwang-doc-source/tree/e3b533335ab92cd5ecfa37f0fdadf3c2798331eb/html-docs/whiteboard/Web) |

### 白板补强的时间边界

[0.0.136 升版记录](https://github.com/AgoraIO/shengwang-doc-source/blob/620d237d6941653c4e60493a9a739c9b049fe09d/data/version.ts#L2)与[0.0.125 升版记录](https://github.com/AgoraIO/shengwang-doc-source/blob/86dc73486c8b432eb38f56ede2f5eb259cd1140d/data/version.ts#L2)可定位无 tag 编号对应的历史源码。上表证明的是“升版本号这一提交”的白板 API 源码与候选相同；升版后、下次升版前又有 API 文件更新，不能把该证明扩展成不存在 tag 的“最终 0.0.136/125 发布快照完全一致”。候选自身 current 标签与目标 SDK 一致，但入口正文未写数字版号，仍须以主代理浏览器的版本标签核验共同确认。

### 不应误用的 Web 快照

- 原 v4.24.1 配置编号 `0.0.379`：该普通 tag 的 current 和 HTML 实际均为 **v4.24.0**，不存在 `archive-0.0.379`，故不仅是 URL 可达性问题。[配置 current：v4.24.0](https://github.com/AgoraIO/shengwang-doc-source/blob/3d6579ac7181c53c904e7fc58f92e48d797eabca/docs-api-reference/rtc/_platforms_.meta.js#L180)；[0.0.379 HTML title](https://github.com/AgoraIO/shengwang-doc-source/blob/3d6579ac7181c53c904e7fc58f92e48d797eabca/html-docs/rtc/Web/index.html#L6)：`Agora Web SDK API Reference v4.24.0`。
- 原 v4.23.0 配置编号 `0.0.345`：archive tag 存在，current 元数据仍写 v4.23.0，但 HTML 实际为 **v4.23.2**。`archive-0.0.341/344` 也同样是 v4.23.2，不能因网页可达而给它们挂 v4.23.0 标签。[archive-0.0.345 HTML title](https://github.com/AgoraIO/shengwang-doc-source/blob/130191ab83a1c7b3f5ab4dc72765df446c181b59/html-docs/rtc/Web/index.html#L6)：`Agora Web SDK API Reference v4.23.2`；[archive-0.0.341 HTML title](https://github.com/AgoraIO/shengwang-doc-source/blob/68fcaa7c3762b42188bc8ea2939d77b3da024aec/html-docs/rtc/Web/index.html#L6)：`Agora Web SDK API Reference v4.23.2`。
- `archive-0.0.234` HTML 明示 v4.23.0，是更合适的同版候选；`archive-0.0.405` HTML 明示 v4.24.1。[archive-0.0.234 HTML title](https://github.com/AgoraIO/shengwang-doc-source/blob/29b2d9e3ced95c2f0f189e3f725e8c4bcd49cc23/html-docs/rtc/Web/index.html#L6)：`Agora Web SDK API Reference v4.23.0`；[archive-0.0.405 HTML title](https://github.com/AgoraIO/shengwang-doc-source/blob/97735ce8365b236c33f0c1b37cdee5f8e807b0d7/html-docs/rtc/Web/index.html#L6)：`Agora Web SDK API Reference v4.24.1`。

### 其他关键反例

- Server C++ 的 `0.0.175` / `archive-0.0.176` current 已是 v4.2.32，不作为 v4.2.31 替代；本报告只保留源码与 172 一致、current 明确为 v4.2.31 的 171 候选。
- Whiteboard Web 的 `v0.0.130` current 已是 v2.16.51，不作为 v2.16.49 替代；本报告保留 `v0.0.124`。

## 路由证据与尚未确定事项

- MDX 路由：ConvoAI 候选包含各组件 `overview.<platform>.mdx`；RTM Flutter 候选包含 `toc-configuration/configuration.flutter.mdx`。这些源文件支持相应产品/平台路径，但源码存在本身仍不证明特定快照已经成功构建并上传。
- 生成 HTML 路由：Web 候选的侧栏明确引用 `rtc/{{platform}}/overview`；Server C++ 侧栏明确引用 `rtc-server-sdk/cpp/overview`。证据：[Web overview 路由](https://github.com/AgoraIO/shengwang-doc-source/blob/97735ce8365b236c33f0c1b37cdee5f8e807b0d7/docs-api-reference/rtc/_sidebar_.meta.javascript.js#L10)、[Server C++ overview 路由](https://github.com/AgoraIO/shengwang-doc-source/blob/7ae1c1b3e576d47c4f6b1154a95d59c69fdd1b53/docs-api-reference/rtc-server-sdk/_sidebar_.meta.cpp.js#L9)。
- HarmonyOS：配置 landingPage 有大写 `HarmonyOS`，平台 value 为小写 `harmonyos`；采用实际生成路由的小写。浏览器已确认 `0.0.211` 小写路径可用且版本选择器显示 v4.4.1。
- 白板旧 metadata 的 landingPage 指向 Fastboard 混合入口，不适合直接拿来替换白板 SDK 入口。本报告根据实际白板 API HTML 源文件及现有原路径保持 SDK 的 overview 入口；浏览器已确认三项替代入口均可用且显示目标版本。
- 现有 Git 证据不能判定缺失快照是“从未上传、上传失败、后续清理、路由未构建”中的哪一种；需发布日志或 OSS 对象清单才能进一步归因。没有对云存储、流水线或导航做任何写操作。

## 线上 HTTP 与浏览器验证

验证日期：2026-10-20（Asia/Shanghai）。所有地址均为公开页面。

再次确认：2026-10-20 16:06，独立重跑全部 13 个替代入口的 GET 和浏览器核验。13/13 返回 HTTP 200、无重定向、最终地址与覆盖文件相同；13/13 渲染出的当前版本标签匹配目标 SDK，Web 两项的页面标题也精确匹配。复核时间已写入 JSON 的 lastRecheckedAt。

### 原地址的共同失效表现

13 个原地址 GET 跟随重定向后，最终地址均为 `https://doc.shengwang.cn/404`，响应为 HTTP 200，标题为「文档中心 | 声网」。404 页面内容是「Oops!!! 暂无内容 将在 3 秒后自动跳回首页」；浏览器随后会跳到 `https://doc.shengwang.cn/`。因此仅检查状态码，或等自动跳转后只检查最终首页是否 200，都会误判。

这些原编号的归档根首页也未打开正常归档首页。由此能确认源地址在线失效，但不能区分从未发布、上传失败、后续清理或部署规则问题。

`0.0454` 改成 `0.0.454` 的两个 ConvoAI 入口仍然失效；HarmonyOS 原 `0.0.216` 路径改成大写也仍然失效。替代目标不是仅凭编号格式或大小写猜测得到。

### 可直接用于实施的 13 项覆盖

所有下列替代地址均返回 HTTP 200，最终地址仍是表内归档 URL。浏览器实际渲染正常 API 页面并显示目标版本；Web 两项还核对了正文标题。这里的“采用编号”是实施覆盖值，master 原始 siteVersion 保留在完整清单和 JSON 的 sourceSiteVersion 中。

| 新站平台 | SDK 版本 | master 原编号 | 采用编号 | 已验证入口 |
| --- | --- | --- | --- | --- |
| conversational-ai/ios | v1.7.0 | 0.0454 | 0.0.455 | [API 概览](https://doc-archive.shengwang.cn/archive/0.0.455/api-ref/convoai/ios/ios-component/overview) |
| conversational-ai/android | v1.7.0 | 0.0454 | 0.0.455 | [API 概览](https://doc-archive.shengwang.cn/archive/0.0.455/api-ref/convoai/android/android-component/overview) |
| conversational-ai/web | v1.7.0 | 0.0.454 | 0.0.455 | [API 概览](https://doc-archive.shengwang.cn/archive/0.0.455/api-ref/convoai/typescript/web-component/overview) |
| rtc/web | v4.24.1 | 0.0.379 | 0.0.405 | [Web API v4.24.1](https://doc-archive.shengwang.cn/archive/0.0.405/api-ref/rtc/javascript/overview) |
| rtc/web | v4.23.0 | 0.0.345 | 0.0.234 | [Web API v4.23.0](https://doc-archive.shengwang.cn/archive/0.0.234/api-ref/rtc/javascript/overview) |
| rtc/mini-program | v2.6.0 | v0.0.166 | 0.0.166 | [小程序 API](https://doc-archive.shengwang.cn/archive/0.0.166/api-ref/rtc/mini-program/overview) |
| rtc/harmonyos | v4.4.1 | 0.0.216 | 0.0.211 | [API 概览](https://doc-archive.shengwang.cn/archive/0.0.211/api-ref/rtc/harmonyos/API/rtc_api_overview) |
| rtm/flutter | v2.2.1 | 0.0.202 | 0.0.197 | [初始配置](https://doc-archive.shengwang.cn/archive/0.0.197/api-ref/rtm2/flutter/toc-configuration/configuration) |
| whiteboard/whiteboard-sdk/android | v2.16.81 | 0.0.136 | 0.0.134 | [白板 Java API](https://doc-archive.shengwang.cn/archive/0.0.134/api-ref/whiteboard/android/overview) |
| whiteboard/whiteboard-sdk/ios | v2.16.88 | 0.0.136 | 0.0.134 | [白板 Objective-C API](https://doc-archive.shengwang.cn/archive/0.0.134/api-ref/whiteboard/ios/docs/headers/Agora-Interactive-Whiteboard-Objective-C-Overview) |
| whiteboard/whiteboard-sdk/web | v2.16.49 | 0.0.125 | 0.0.124 | [白板 Web API](https://doc-archive.shengwang.cn/archive/0.0.124/api-ref/whiteboard/javascript/overview) |
| rtc-server-sdk/cpp | v4.4.30 | 0.0.289 | 0.0.282 | [服务端 C++ API](https://doc-archive.shengwang.cn/archive/0.0.282/api-ref/rtc-server-sdk/cpp/overview) |
| rtc-server-sdk/cpp | v4.2.31 | 0.0.172 | 0.0.171 | [服务端 C++ API](https://doc-archive.shengwang.cn/archive/0.0.171/api-ref/rtc-server-sdk/cpp/overview) |

浏览器版本证据：ConvoAI 三个平台选择器的当前标签均为 v1.7.0；小程序 v2.6.0；HarmonyOS v4.4.1；RTM Flutter v2.2.1；白板三个页面当前标签分别为 v2.16.81、v2.16.88、v2.16.49；服务端 C++ 两项分别为 v4.4.30、v4.2.31。Web 两项的页面标题、正文标题和版本选择器均与目标标签一致。

未采用的可访问反例：`0.0.341` 的 Web 概览虽然可访问且菜单存在 v4.23.0 标签，正文实际是 v4.23.2，因此没有拿它替代 v4.23.0。`0.0.395` 的 Web v4.24.1 和 `0.0.174` 的服务端 C++ v4.2.31 有 Git 内容依据，但线上入口仍失效，也没有采用。

### 接手 AI 的操作规则

先读取完整版本清单，再按 JSON 的 `newPlatform + sdkVersion` 应用 href 覆盖；sourceSiteVersion 继续用于追溯主线原值。不要为了与 master 原值相同而把已验证的替代地址改回失效地址。

本轮验证只覆盖用户报告的 13 项及其相关候选，其余 210 个原去重归档地址的在线状态没有在本轮重新验证。当前 13 项覆盖与原始 228 条源版本选项一起使用，版本选项数量不因替换 URL 减少。

## 本地核验

- 13 条原链接逐一与原完整盘点清单对应。
- 所选候选均有 Git ref、同平台 current 和入口源文件；Web 的数字 SDK 版号另由 HTML title 核对。
- 所有固定源码引用的文件/行号在对应 commit 中存在；11 组目录/blob 相等比较全部通过。
- 主代理独立复核：39 个固定提交源码行引用有效，11 组 Git tree/blob 相等比较通过；13 条 JSON 覆盖均能精确匹配原清单的 SDK 标签、源编号与源地址。
- 已更新完整清单中的实施提示，并新增机器可读 URL 覆盖；完整清单的 master 原始版本映射保留。未修改产品源码或运行导航，未创建测试、未运行构建、未切换旧站工作区。
