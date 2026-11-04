# RTC Token 鉴权跨平台旧源对齐核查

核查日期：2026-11-04。

## 基线与范围

- 工作分支：`codex/rtc-token-auth-parity`，从 `codex/cn-newdoc-html-api-migration` 的 `6ccde7eadac8355f203570529c128f9014c1d9d7` 创建独立工作树。
- 旧源：`AgoraIO/shengwang-doc-source`，本地干净快照 `664ac1bf33476f7543bbb02f3bd1a20a77436d72`（Release 0.0.540）。
- 目标：`content/docs/zh-CN/realtime-media/rtc/build/setup-and-access/token-authentication.mdx` 中全部 13 个平台。
- 对照旧源 `docs/rtc/basic-features/token-authentication.*.mdx`，展开 `docs/shared/rtc/{basic-token,privilege-token,token-ref}.mdx`，按平台过滤后核对全文。此次范围是“使用 Token 鉴权”这一篇的所有平台版本。

## 截图差异原因

截图比较的是不同章节：左侧旧站目录高亮“使用连麦鉴权”，右侧新站高亮上方“生成 Token”。

| 章节 | 旧源共享片段 | 权限有效时间 |
| --- | --- | --- |
| 实现 Token 鉴权 → 生成 Token | `basic-token.mdx` | `privilege_expiration_in_seconds` 统一设置 |
| 使用连麦鉴权 → 生成 Token | `privilege-token.mdx` | `join_channel_privilege_expiration_in_seconds`、`pub_audio_privilege_expiration_in_seconds`、`pub_video_privilege_expiration_in_seconds`、`pub_data_stream_privilege_expiration_in_seconds` 分别设置 |

两套正文、方法表和示例在旧源及新页均存在，不应把基础章节替换为连麦鉴权章节。浏览器检查了旧站 Android 页面与 staging Android 页面，二者均显示上述两段说明。新页 `#advanced` 指向“使用连麦鉴权”，四项参数段落可见。

- [旧站 Android](https://doc.shengwang.cn/doc/rtc/android/basic-features/token-authentication#advanced)
- [新站 Android 对应章节](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/build/setup-and-access/token-authentication/android#advanced)

## 逐平台核查

使用仓库现有 `auditSingleDocContentFidelity` 对各平台投影执行全文审计，并单独按顺序对比代码块（忽略空白）、提示类型与外部链接。共 229 个代码块一致，未发现正文、表格、示例或 API 参数说明的实质缺漏。

| 平台（旧源标识） | 代码块一致数 | 恢复 caution 数 | 结果 |
| --- | ---: | ---: | --- |
| android（`android`） | 23 | 6 | 正文和代码对齐 |
| electron（`electron`） | 7 | 3 | 正文和代码对齐 |
| flutter（`flutter`） | 8 | 3 | 正文和代码对齐 |
| harmonyos（`harmonyos`） | 23 | 6 | 正文和代码对齐 |
| ios（`ios`） | 23 | 6 | 正文和代码对齐 |
| Web（`javascript`） | 24 | 6 | 正文和代码对齐 |
| macos（`macos`） | 23 | 6 | 正文和代码对齐 |
| 小程序（`mini-program`） | 15 | 5 | 正文和代码对齐 |
| React Native（`rn`） | 7 | 3 | 正文和代码对齐 |
| unity（`unity`） | 7 | 3 | 正文和代码对齐 |
| Unreal Blueprint（`unreal-blueprint`） | 23 | 6 | 正文和代码对齐 |
| Unreal C++（`unreal-cpp`） | 23 | 6 | 正文和代码对齐 |
| windows（`windows`） | 23 | 6 | 正文和代码对齐 |

保留各平台旧源本身的区别：Electron、Unity、Flutter、React Native 使用旧源的完整服务端/客户端部署流程；小程序使用加入频道鉴权流程；其余八个平台保留基础鉴权及连麦鉴权两套示例。没有把所有平台套成 Android 内容。

## 实际修正与正常迁移差异

1. **修正 65 处提示类型**：所有平台的旧源 `Admonition type="caution"` 被迁移成 `:::warning[注意]`。按 Markdown authoring standard 恢复为 `:::caution[注意]`，提示正文保持不变。逐平台校验修复后的类型序列与源一致。
2. “开通服务”链接文字改为“开通 RTC 服务”，属于现有明确产品名称调整，保留。
3. 流程图从旧站 `/img/rtc/token-authentication.svg` 迁移至 CDN；Android、iOS、macOS、HarmonyOS 使用 `DocsImage displayWidth="85%"` 保留旧源尺寸。现有全文审计脚本未识别 `DocsImage`，产生图片 missing / unsupported / legacyResidue 假阳性，已人工核对。
4. 四个旧版部署流程中的注册、App 证书、浏览器支持链接，从旧 `docs.agora.io` 地址转为本地现行页面；GitHub 示例等其他外部链接保留。未对全部外部链接执行网络可达性检查。
5. 旧站 HTML/JSX 转为 Markdown、表格 Slot、代码 tabs 等批准语法，正文与代码内容保持一致。

## 验证

- 定向 `auditDocsLinks`：698 处链接，0 invalid links、0 missing hash links；其中 176 个同页锚点有效。此项是静态路径/锚点检查，不等于全部外链网络探测。
- 全文比对：13 平台、229 代码块一致；提示类型修复后逐平台一致。
- `bun run types:check`：修复后通过。
- `bun run test`：335 个测试文件通过、1 个跳过；5514 项测试通过、6 项跳过。
- 浏览器：旧站和 staging Android 对应段落已核实；本地以 `VITE_DOCS_REGION=cn` 启动，确认两套参数段落可见，修复后的 caution 提示正常渲染。其余 12 平台执行源文件投影审计，未逐一做浏览器视觉验收。
- `git diff --check`：通过。

原始审计 JSON、展开后的平台正文、日志和截图保存在忽略目录 `.agent/artifacts/token-auth/`，不提交截图。
