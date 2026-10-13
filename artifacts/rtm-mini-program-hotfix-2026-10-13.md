# RTM 微信小程序 hotfix 迁移记录

## 时间

- 审计与修复开始时间：2026-10-13 16:11:48 +0800
- 目标 PR：[#1185](https://github.com/AgoraIO/docs-portal/pull/1185)
- 本次修复提交：`0e843ee5269b521ec7aa18c9a3abe19208ddb28e`
- 冲突解决合并时间：2026-10-13 16:23:34 +0800
- 冲突解决提交：`47303632ddf02f07e36fbbd68340e190a1699585`

## 数据血缘

- 源仓库：`AgoraIO/shengwang-doc-source`
- 源 PR：[ #2069：docs: add RTM2 mini program docs](https://github.com/AgoraIO/shengwang-doc-source/pull/2069)
- 源合并提交：`def3eac1345f015792dd57b3944ec8cb01cc3c98`
- PR #1185 使用的源快照：`5d03551cf64cd057ccfe8d5b256d9c4778e8fbb1`
- 目标迁移范围：目标侧 `0c505d35b..0e843ee52`，包含小程序页面合并、平台示例整理及本次内容修复。

## 本次已修复并核验

- 小程序鉴权页的空方法名、空状态/操作值和重复登录实现。
- 小程序故障排查页的空错误名、空变量和小程序专属 Slot。
- 连接状态和历史消息页面的小程序示例平台错配。
- 平台支持页的设备测试信息 Slot。
- 合并冲突：`artifacts/docs-link-validation-2026-10-12.md`，保留当前 PR head 分支名称并保留报告正文。

## 验证

- `git diff --check`
- `bun run types:check`
- 小程序区块静态检查：无空占位符、无 `<Slot>`、无 `@shengwang/rtm-full`。

## 未完成项

`build/authentication-and-connection/link-basic.mdx` 的小程序区块仍保留旧的 `@shengwang/rtm-full` TypeScript 示例。该页面需要继续改为 `shengwang-rtm-miniapp` JavaScript 示例后，才能把本次 hotfix 判定为完整通过。

## 来源映射复核

| 源 PR #2069 内容 | 目标页面 | 状态 |
| --- | --- | --- |
| `landing-page.mini-program.mdx` | `rtm/index.mdx` | 通过 |
| `get-started/quick-start.mini-program.mdx` | `rtm/get-started/quick-start.mdx` | 通过 |
| `overview/feature-list.mini-program.mdx` | `reference/capabilities-and-compatibility/feature-list.mdx` | 通过 |
| `overview/platform-support.mini-program.mdx` | `reference/capabilities-and-compatibility/platform-support.mdx` | 通过 |
| `overview/release-notes.mini-program.mdx` | `reference/release-notes.mdx` | 通过 |
| `error-codes.mini-program.mdx` | `build/troubleshooting.mdx` | 通过 |
| `user-guide/token/user-authentication.javascript.mini-program.mdx` | `build/authentication-and-connection/user-authentication.mdx` | 通过 |
| `user-guide/link/link-basic...mini-program...mdx` | `build/authentication-and-connection/link-basic.mdx` | 需要修复 |
| `user-guide/link/link-state...mini-program...mdx` | `build/authentication-and-connection/link-state.mdx` | 通过 |
| `user-guide/message/history-message...mini-program...mdx` | `build/message-design-and-history/history-message.mdx` | 通过 |
