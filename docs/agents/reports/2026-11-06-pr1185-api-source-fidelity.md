# PR #1185 API 文案回退核对

本次按用户要求恢复截图中的 `maxVideoDuration` 文案，并检查同一 PR 的其他 API 内容改动。只修正迁移时没有保持对应源文件的内容，不整批撤销正常的上游更新。

## 固定来源与范围

- 被审查提交：`16d9d150512ec34a5779ab5fbbdc11f1d85b0c61`（[docs-portal #1185](https://github.com/AgoraIO/docs-portal/pull/1185)）。
- 修改前目标：`12fbdb428c4c6064c491bada447540e81aee4e86`。
- 原同步记录中的源版本：`shengwang-doc-source@5d03551cf`。
- 本次复核源版本：本地源仓库 `664ac1bf33476f7543bbb02f3bd1a20a77436d72`（Release 0.0.540）。读取 Git 对象，不依赖其工作区改动；未验证远端是否另有更新。
- 检查范围：#1185 修改的 61 个 API MDX 文件和 3 个中文 OpenAPI 文件。逐类查看变更，并将新增中文行与对应源文件去除格式后比较；对差异再检查当前目标是否已被后续 PR 修复。该筛查不等同于全站 SDK 签名及运行行为认证，也未涵盖该 PR 的所有产品指南。

## 已恢复的 8 个文件

| 目标 | 恢复内容 | 对应源文件 |
| --- | --- | --- |
| `content/openapi/cloud-recording/cloud-recording.zh-CN.yaml` | `maxVideoDuration.description` 恢复“超过约 … 左右时”。去掉从其他文档补入的默认时长和 2 GB 条件；保留 schema 默认值 180、范围 30～240。 | `html-docs/cloud-recording/cloud-recording.yaml` |
| `content/docs/zh-CN/api-reference/cloud-recording/go-api/struct.go.mdx` | `CaptureInterval` 恢复 `[5, 3600]`，移除跨文档加入的关键帧说明。 | `docs-api-reference/cloud-recording/go-api/struct.go.mdx` |
| `content/docs/zh-CN/api-reference/cloud-recording/java-api/struct.java.mdx` | `captureInterval` 恢复 `[5, 3600]`，移除跨文档加入的关键帧说明。 | `docs-api-reference/cloud-recording/java-api/struct.java.mdx` |
| `content/docs/zh-CN/api-reference/rtc/csharp-windows/(current)/class-logconfig.mdx` | 移除对应平台源文件没有的自定义文件名、目录分隔符和自动生成文件名说明。 | `html-docs/rtc/Csharp/API/class_logconfig.html` |
| `content/docs/zh-CN/api-reference/rtc/unreal-blueprint/(current)/class-logconfig.mdx` | 同上，保留此平台原有默认路径。 | `html-docs/rtc/Unreal-blueprint/API/class_logconfig.html` |
| `content/docs/zh-CN/api-reference/rtc/unreal-cpp/(current)/class-logconfig.mdx` | 同上，保留此平台原有默认路径。 | `html-docs/rtc/Unreal-cpp/API/class_logconfig.html` |
| `content/docs/zh-CN/api-reference/rtc/ios/(current)/channel.mdx` | `rtcEngineRequestToken:` 恢复 `renewToken:` / `updateChannelWithMediaOptions:` 两种单频道更新方式，删除套入的离开重进和结果回调说明。 | `html-docs/rtc/iOS/API/toc_channel.html` |
| `content/docs/zh-CN/api-reference/rtc/macos/(current)/channel.mdx` | 同上。只恢复 Token 已过期小节，不改 Token 即将过期小节。 | `html-docs/rtc/macOS/API/toc_channel.html` |

源仓库自身仍有 Go/Java 截图周期最小值 5、REST 最小值 1 的差异。本次按照各自原文恢复，不据此推断哪一个值是实际服务的统一限制。类似地，2 GB 切片条件在录制文件指南中有依据，但原 API 字段描述没有，指南中的规则仍保留。

## 保留或已被后续修复的改动

- 云端录制 REST 的截图周期 `[1, 3600]` 和关键帧说明、raw 模式、默认 180 分钟：有对应源依据，保留。
- RTC 黑名单实时生效、元数据截断、数据流限制，以及源文件明确包含的日志路径说明：保留。不能把 C#/Unreal 缺少说明推及其他平台。
- ASR 热词的供应商限制、128 个上限，以及微呼叫 AES/SM4 枚举名称修正：对应 YAML 已有，保留。
- 对话式 AI 工具、承接词、Think append，以及小程序完整事件对象：对应源有内容。原 PR 中 Python 热词表归属、iOS 参数类型等问题当前版本已有后续修正，不撤销这些修正。
- Token 更新引导句的轻微措辞差异未按字面一律撤销；本次恢复影响调用步骤和跨平台约定的改动。

## 验证

- 7 个修改 MDX 的相关字段/小节与固定源文件去除展示格式后匹配。
- `maxVideoDuration` 完整 schema 属性对象与固定源 YAML 相等。
- 7 页 MDX 语法检查：0 问题。
- 7 页内部链接及锚点检查：无 invalid/missing 项；未进行外网链接可达性检查。
- `bun run qa:api source --region cn`：退出码 0，0 新问题、53 个已有重复标题、0 过期豁免。属于带既有债务的通过。
- `bun run types:check`：退出码 0。
- 云端录制既有专项测试（`cloud-recording-pr2091-sync.test.ts`、`cloud-recording-pr2091-api-copies-sync.test.ts`）：2 文件、18 项通过。
- `bun run test --maxWorkers=4`：退出码 1；346 文件通过、15 文件失败、1 文件跳过；5738 项通过、70 项失败、6 项跳过，耗时 323.98 秒。失败包括英文路由/语言/搜索预期，以及对话式 AI OpenAPI 示例和鉴权预期，不是本次恢复字段的断言。
- 本机 `.env.local` 设置了 `VITE_DOCS_REGION=cn`；部分断言明确期望英文，实际收到中文。用显式 `VITE_DOCS_REGION=global` 单独复跑 root favicon 与 OpenAPI source 两个文件，仍为 3 失败、32 通过，因此不能声称已通过环境切换解决失败，也未对全部失败做改动前基线认证。保留失败日志，不将全套测试称为通过。
- `git diff --check`：通过。

本次是本地内容修正，未发布；没有执行浏览器视觉验收或独立发布验收。机器日志和逐文件筛查结果保存在忽略目录 `.agent/artifacts/pr1185-fidelity/`。
