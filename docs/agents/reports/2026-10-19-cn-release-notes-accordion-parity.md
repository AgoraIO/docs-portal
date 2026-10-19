# 中文发版说明折叠：内容与历史链接保真

日期：2026-10-19

基线：`e463c842be1ed4a19ff68df26285d388451f6b8a`，分支 `codex/cn-newdoc-html-api-migration`。

英文实现依据：[PR #1111](https://github.com/AgoraIO/docs-portal/pull/1111)，最终 head `3f20e5b422e40e2d22075c77d38eeee8d435ebf1`。沿用共享 Accordion、目录、锚点及内容语法，中文通过现有 i18n 提供标签。

## 覆盖与结果

检查 19 个页面；18 个有版本正文，合计 757 条版本记录、4,740 个标题。Danmaku 只有 frontmatter，未改动。

版本历史采用 `type="multiple" openFirst`，首项由源码顺序决定。每个平台、语言标签或插件的历史分别成组；Windows C++/C#、Electron/统信 OS 等内层标签均纳入转换。普通示例代码折叠保留原有行为。

下表路径相对于 `content/docs/zh-CN/`。正文 SHA-256 在剥离新增折叠包装、还原标题、将历史 section 别名还原为原 a 标签并忽略空白后比较；标题 SHA-256 对有序的 ID 和层级列表计算。所有页面前后对应相等。

| 页面 | 版本 | 标题 | 正文 SHA-256 | 标题 SHA-256 |
| --- | ---: | ---: | --- | --- |
| ai/release-notes.mdx | 23 | 192 | `738f70661c8de357b92d1f36315c1dad9135e293634558d73ea8eb3bc4b317d8` | `b01a1819b7953a26d1caedd4c404a9c83a8eff15f19d3240f13256c4d2922b14` |
| realtime-media/cloud-recording/reference/release-notes.mdx | 36 | 116 | `3eb000caa6f097fd34df6b79f03290d396a82282ce2b9cfa81a2e28a33f2e018` | `97e02fc2a2ec039544781ef6ab811ebe6b69bb0cc0c283020a334af1ff56b7ec` |
| realtime-media/local-server-recording/reference/release-notes.mdx | 4 | 11 | `a1d5ad58d03b4bf31cba7e21e3a3ee110c53e3b9c28843e8d291da8b9dfb10b1` | `ff52165ef858ca547bb0c5e2f966b8e9f14ed6f8a2fb66e26c8b50f5632531e1` |
| realtime-media/media-pull/reference/release-notes.mdx | 3 | 3 | `55e0ce62f014dc5c9d0395ecc787faf8498719792c78e79915a6d70cb77981d3` | `0101880a92f8ecec8711f1a57c7d6fd4d4fd7b64b5e8ead776e4cd1dc58f35a2` |
| realtime-media/rtc-server-sdk/reference/release-notes.mdx | 22 | 108 | `4b1844f6f1dd240a5f9e86550b3fa2f02a91bf5cb331c73f0047e025dfb88d69` | `9deabc2e8d62c89b478945c32c7cc286bdcb02f6ca4de6cc68d87442c56a647e` |
| realtime-media/rtc/build/extensions/web/release.mdx | 19 | 45 | `473a21cf0a8d896af62b91323716856ee77f24153fc3fbbab613a2bfacfa787b` | `baa3051e05f3607854fb5db6cb060f2b650eee8f066f7a1fc59062a8b25b110d` |
| realtime-media/rtc/reference/release-notes.mdx | 262 | 2624 | `cb1ea2662b64f80bf99d23e6576cbcc026acdf784c8b32e91be6df42aa6c9232` | `d71bff706473e30c60b1714a574f9da4f8fbfce75040831dcfd7f35a86599677` |
| realtime-media/rtm/reference/release-notes.mdx | 84 | 503 | `68ae39f774f28188f3220fd478dce64d72ae2f5b9e6ece43305571cdfed2c4bc` | `555f6d3d30dc390bc74c1394c7cc018cd974981c43ada1e4ee1c39b82da211c7` |
| realtime-media/rtsa/reference/release-notes.mdx | 20 | 164 | `e098a29834b1fd81a8f02630167bb30218ca9f52f48693a3f9c9d8e75769bece` | `712b468d2a4d6366567568e40fb72042862adc10f2c9bd881eb48c797b825fbe` |
| realtime-media/sdk-extensions/metakit/reference/release-notes.mdx | 6 | 23 | `1004acdc796feb88669ea1a62f93ae42284c0736f04df3ed18e9d7362d5f82e5` | `21b8529c267e77a58d1743a8c21ee03127b6224074b5c5a90b1857e08c7126a6` |
| realtime-media/sdk-extensions/portrait-rhythm/reference/release-notes.mdx | 3 | 6 | `6558dc730db583f3b14534b1c521a02eb694e29a10ed27ac557bba4832c38109` | `4eddd24392e9776ab235f36a32a953ccca641e1a3a76eed4376a1a8b200e3c37` |
| realtime-media/speech-to-text/reference/release-notes.mdx | 4 | 19 | `a980726f7d715fc4ec59b2095bb104284f17ac751b1095201af20d4ab018fcc3` | `df3501f359c118eaca5a070f0da7f320c1b5f395123b589ad47bb724e71edab3` |
| realtime-media/status-page/reference/release-notes.mdx | 1 | 1 | `eb6dd30c2a56d797cacf68a73fffcf19b11d174fd202f5cb8a144630a10d8ee4` | `3469718cc80dd8cd3b0787d86507ca214350cd46c94a6e663f8ebaef5048e084` |
| realtime-media/usage-analytics/reference/release-notes.mdx | 18 | 29 | `1a950f83a2845b896afecdca8a308cc1f63831a5495fef1f09500853e7fd2b09` | `3d90ef665bbe4ec04fc1fbb13704ad1c6174f6a2e8b28cfcc283c3dc5ef7c0d1` |
| realtime-media/whiteboard/fastboard-sdk/reference/release-notes-fb.mdx | 22 | 128 | `fcaaf7e48deb65616fcbfb1c702401a6eb8a38ac5398636c1b7dc310a98e31fa` | `86c51aaebe4932a76f287283a754685c22eed88c4e3de9feb0337d4200172c22` |
| realtime-media/whiteboard/whiteboard-sdk/reference/release-notes-wb.mdx | 131 | 386 | `800bace5e23bdda674636960e515a05b9b91a606ea89cf196363dbd8f303bda2` | `5c48671997144d0f5d9ffd73f4265026ab306b6d580c74985282afe0eb4f3384` |
| solutions/flexible-classroom/reference/release-notes.mdx | 94 | 361 | `0b0ec2fa759498d1138a78fbce1c0d5846a3310b82ed6e19e1306a1a8ab2e6c5` | `375a071c6d56076dad07fbfeedd04f9ed3fe2da7816895afc9677b7a75d58d04` |
| solutions/iot-apaas/reference/release-notes.mdx | 5 | 21 | `6321642f843165cf95f8e3870150c7e65b5c1157daf8446e1babd50f46e24b84` | `83a167fb1c2b2154044399788d9c32279b3f7f0801c1cc06c96e48d18175718f` |

## 历史版本别名

基线中紧邻版本标题之前的七个锚点，转换后各保留一个同 ID 的 section，包住对应版本 Accordion；不会落入前一个版本的正文。既有版本标题自身的 canonical ID 保留。

| 平台 | 历史 fragment | 版本 | canonical ID |
| --- | --- | --- | --- |
| iOS | v4.3.1 | v4.3.1 | v431-1 |
| Web | v4.24.2 | v4.24.2 | v4242 |
| Web | v4.24.0 | v4.24.0 | v4240 |
| Web | v4.22.0 | v4.22.0 | v4220 |
| Web | v4.20.0 | v4.20.0 | v4200 |
| Web | 415 | v4.15.0 | v4150 |
| Web | 410 | v4.10.0 | v4100 |

独立审查从基线重新识别全部七组“锚点 → 版本”关联，并确认当前每个 section 恰好包含对应版本。完整性测试对 19 个页面递归检查版本标题，包括内层语言标签；链接回归测试覆盖上述七组关联。

## 共享行为的补充适配

- 中文 Markdown 出口补全折叠版本标题，保留原中文格式和链接；服务端目录与搜索使用同一个标题提取模块。
- 解析编码后的中文 fragment，并展开所属版本及父语言标签。直接链接优先于已保存的语言标签，目录只列出当前语言标签的版本。
- 版本标题与历史 section 沿用现有标题滚动留白，避免 TanStack Router 的自动 hash 定位把目标藏在固定页头后面。
- 平台切换删除旧 fragment 和过时的 platform 参数，保留其他查询参数及中文分支已有的平台偏好机制。

## 后续合入 main

保留 main 现有的共享折叠实现与英文内容，合入中文 MDX、中文 Markdown 出口及本次补充的父标签/滚动处理。主要重叠点为 `mdx.tsx`、`DocsContent.tsx`、`docs-hash.ts`、`source.server.ts`、`PlatformTabsGroup.tsx` 及标题提取模块；合并时逐项去重。

## 最终验证

- `bun run test --maxWorkers=2`：222 个文件全部通过，2,921 项测试通过、2 项跳过。默认并发运行曾在既有 Speech-to-Text 侧栏测试触发 5 秒超时；该文件默认参数单独复测 6 项通过，完整的受限并发运行通过。
- `bun run types:check`、`bun run lint`、`git diff --check` 通过；Lint 无错误，20 条 warning、5 条 info。
- `VITE_DOCS_REGION=cn bun run build` 在源码一致的隔离工作区完整执行，退出码 0：生成 6,842 份页面数据、8,045 份机器可读文件、7,739 份路由 HTML。存在非阻塞的大 chunk 提示。
- 浏览器覆盖桌面/390px 手机显示、多版本展开、目录定位、中文编码锚点、平台重置并保留其他查询参数、已保存的内层语言标签、日期型历史、Fastboard 内层示例以及英文 Video 发版页。
- 生成的机器可读 Markdown 中，AI 版本标题和七个历史版本别名均检查通过。截图保存在 `.github/pr-assets/cn-release-notes-20261019/`。
- 规范与需求两轴独立审查完成；内层标签覆盖和历史锚点关联问题修复后复审无剩余可执行问题。

## 后续标题订正

根据用户确认，将云端录制该页的 frontmatter title 从“更新历史”改为“发版说明”。上表签名记录折叠适配时的快照；本次仅订正标题元数据，正文、版本和链接保持原样。页面标题和侧栏在浏览器中核对；4182 地址切换为源码实时预览，以显示该标题修订。
