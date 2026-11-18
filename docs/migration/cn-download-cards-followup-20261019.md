# 中文下载卡片与版本约束修复

目标 PR：AgoraIO/docs-portal#1207，base 为 `codex/cn-newdoc-html-api-migration`。

## 源到目标关系

源快照：`AgoraIO/shengwang-doc-source@5d03551cf64cd057ccfe8d5b256d9c4778e8fbb1`。在线 KTV 保留方案指定的 RTC 版本；Fastboard 下载页与发版说明冲突时，以各平台发版说明的最新版本为准，同时更新集成示例。

| 源路径（相对源仓库） | 目标（相对 content/docs/zh-CN） | 修复及版本 |
| --- | --- | --- |
| `docs/whiteboard/fastboard-sdk/resources-fb.javascript.ios.android.mdx`、`release-notes-fb.{android,ios,javascript}.mdx` | `realtime-media/whiteboard/fastboard-sdk/reference/downloads/{android,ios,web}.mdx` | 与发版说明一致：Android 1.7.2、iOS 1.4.2、Web 1.1.0；Android Maven 示例同步 1.7.2。新版本不沿用旧版 MD5。 |
| `docs/online-ktv/online-ktv-sdk/resources.android.mdx` | `solutions/online-ktv/online-ktv-sdk/reference/downloads/android.mdx` | 两种 SDK 均选取 4.4.1，与 Gradle 示例一致；恢复源 MD5、发布日期和四种 ABI 包体积。 |
| `docs/online-ktv/online-ktv-sdk/resources.ios.mdx` | `solutions/online-ktv/online-ktv-sdk/reference/downloads/ios.mdx` | 两种 SDK 均选取 4.4.0，与 CocoaPods 示例一致；恢复源 MD5、发布日期及包体积。 |
| `docs/rtsa/resources.c.mdx`（C PlatformFilter） | `realtime-media/rtsa/reference/downloads.mdx`、`src/components/docs-overview/rtsa-sdk-downloads-data.zh-cn.ts` | 恢复 18 个架构卡片，1.10.1、2026 年 9 月 4 日；逐项核对链接、标题、版本、日期，全部与源一致。 |
| `docs/rtsa/overview/sunset.java.mdx` | `realtime-media/rtsa/reference/downloads.mdx` 的 Java SDK 章节 | 根据明确的已下架说明移除两条 Java 1.9.2 下载链接，保留退休计划与 RTC Android/HarmonyOS 迁移入口。 |

## 实现

复用 `ProductSdkDownloads` / `SdkDownloadCard`。增加精确 `versionIds` 选择；匹配产品内指定 ID 不存在时抛错，避免错误回退至全局最新版本。既有 `versionIdPrefixes` 语言/架构分组行为保持兼容。RTSA 数据仅用于 RTSA C 页面，不加入全局 SDK 目录。

RTC Demo 封面和 iOS 二维码复用已验证可加载的 `web-cdn.agora.io/docs-portal/img/rtc/` 图片。Android 4.7.0 卡片移除错误的 Maven Central 辅助链接；集成入口保留在正文的声网 Maven 仓库指引，Full/Lite/Voice POM 均在该仓库验证为 200 且版本、坐标正确。

## 验证

- 定向测试 78 项通过，覆盖 KTV 四个包、Fastboard 最新发版与页面调用一致性、历史记录元数据合并、无效版本 ID、RTSA 18 个架构、RTC 图片本地路径存在性和 Maven 集成仓库，以及原 RTC/二维码卡片行为。
- `src/lib/cn-download-page-parity.test.ts` 约束 MDX 页面实际使用的版本 ID，防止只测试组件而遗漏正文调用。
- `bun run types:check` 与修改页面内部链接审计通过。
- 本地中文预览使用 `VITE_DOCS_REGION=cn bun run dev -- --host 127.0.0.1 --port 4176`；已核对 RTSA 18 张卡片、无 Java 旧包链接，以及 Fastboard/KTV 各平台卡片版本与下载地址。
- 首轮全量 Vitest：2797 通过、38 失败、2 跳过；37 项失败在不含下载页后续补丁的 `c7832eeb7` 基线复现，剩余 1 项是 Fastboard API 侧栏测试的 5 秒超时。使用 `--testTimeout=20000` 单独复测该组，23 项通过、40 项未选中。最终提交的 CI 和复测结果以 PR 描述为准，不把基线失败计为通过。
- 审计修复后全量复测：2807 通过、39 失败、2 跳过；37 项失败与上述基线相同，额外 2 项是发布/同步脚本的 5 秒超时，单独以 20 秒超时均复测通过。78 项相关测试、类型检查、修改 TS 文件 Biome 均通过；26 个 RTC/RTSA 下载 URL 全部返回 200。

## 本地页面截图

- [Fastboard Android：正文与卡片均为 1.7.2](screenshots/cn-downloads-20261019/fastboard.png)
- [RTC iOS：封面与二维码已实际加载](screenshots/cn-downloads-20261019/rtc-ios.png)
- [在线 KTV Android：正文与卡片均为 4.4.1](screenshots/cn-downloads-20261019/ktv-android.png)
- [RTSA：18 张 C SDK 卡片和 Java 已下架说明](screenshots/cn-downloads-20261019/rtsa.png)
