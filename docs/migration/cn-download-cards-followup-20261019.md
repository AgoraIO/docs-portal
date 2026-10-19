# 中文下载卡片与版本约束修复

目标 PR：AgoraIO/docs-portal#1207，base 为 `codex/cn-newdoc-html-api-migration`。

## 源到目标关系

源快照：`AgoraIO/shengwang-doc-source@5d03551cf64cd057ccfe8d5b256d9c4778e8fbb1`。本次修复保持迁移快照中的产品版本约束，不代表升级方案到 SDK 最新版。

| 源路径（相对源仓库） | 目标（相对 content/docs/zh-CN） | 修复及版本 |
| --- | --- | --- |
| `docs/whiteboard/fastboard-sdk/resources-fb.javascript.ios.android.mdx` | `realtime-media/whiteboard/fastboard-sdk/reference/downloads/{android,ios,web}.mdx` | 明确选取 Android 1.6.2、iOS 1.4.2、Web 1.0.0；合并同 ID 的目录记录以保留源卡片 MD5、包名、发布日期。 |
| `docs/online-ktv/online-ktv-sdk/resources.android.mdx` | `solutions/online-ktv/online-ktv-sdk/reference/downloads/android.mdx` | 两种 SDK 均选取 4.4.1，与 Gradle 示例一致；恢复源 MD5、发布日期和四种 ABI 包体积。 |
| `docs/online-ktv/online-ktv-sdk/resources.ios.mdx` | `solutions/online-ktv/online-ktv-sdk/reference/downloads/ios.mdx` | 两种 SDK 均选取 4.4.0，与 CocoaPods 示例一致；恢复源 MD5、发布日期及包体积。 |
| `docs/rtsa/resources.c.mdx`（C PlatformFilter） | `realtime-media/rtsa/reference/downloads.mdx`、`src/components/docs-overview/rtsa-sdk-downloads-data.zh-cn.ts` | 恢复 18 个架构卡片，1.10.1、2026 年 9 月 4 日；逐项核对链接、标题、版本、日期，全部与源一致。 |
| `docs/rtsa/overview/sunset.java.mdx` | `realtime-media/rtsa/reference/downloads.mdx` 的 Java SDK 章节 | 根据明确的已下架说明移除两条 Java 1.9.2 下载链接，保留退休计划与 RTC Android/HarmonyOS 迁移入口。 |

## 实现

复用 `ProductSdkDownloads` / `SdkDownloadCard`。增加精确 `versionIds` 选择；指定 ID 不存在时抛错，避免错误回退至全局最新版本。既有 `versionIdPrefixes` 语言/架构分组行为保持兼容。RTSA 数据仅用于 RTSA C 页面，不加入全局 SDK 目录。

## 验证

- 定向测试 68 项通过，覆盖 KTV 四个包、Fastboard 重复目录记录的元数据合并、无效版本 ID、RTSA 18 个架构、页面调用，以及原 RTC/二维码卡片行为。
- `src/lib/cn-download-page-parity.test.ts` 约束 MDX 页面实际使用的版本 ID，防止只测试组件而遗漏正文调用。
- `bun run types:check` 与修改页面内部链接审计通过。
- 本地中文预览使用 `VITE_DOCS_REGION=cn bun run dev -- --host 127.0.0.1 --port 4176`；已核对 RTSA 18 张卡片、无 Java 旧包链接，以及 Fastboard/KTV 各平台卡片版本与下载地址。
- 全量 Vitest：2797 通过、38 失败、2 跳过；37 项失败在不含本轮补丁的 `c7832eeb7` 基线复现，剩余 1 项是 Fastboard API 侧栏测试的 5 秒超时。使用 `--testTimeout=20000` 单独复测该组，23 项通过、40 项未选中。完整生产构建未在本轮运行。

## 本地页面截图

- [Fastboard Android：正文与卡片均为 1.6.2](screenshots/cn-downloads-20261019/fastboard.png)
- [在线 KTV Android：正文与卡片均为 4.4.1](screenshots/cn-downloads-20261019/ktv-android.png)
- [RTSA：18 张 C SDK 卡片和 Java 已下架说明](screenshots/cn-downloads-20261019/rtsa.png)
