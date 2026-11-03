# 中文文档行内图标与 RTC 示例截图尺寸恢复

## 排查与范围

在 PR #1262 修复 AUIKaraoke 两篇文档后，继续对照本地旧文档源，检查中文站中相同图片地址的行内与尺寸设置。

- 基线：`codex/cn-newdoc-html-api-migration`，`586f63484c`。
- 扫描当前 6720 个中文 Markdown/MDX 文件及旧源 1753 个 Markdown/MDX 文件。
- 通过 Markdown AST 识别正文图片，排除代码示例；旧 `/img/…` 资源路径与当前 CDN 地址按同一资源匹配。
- 44 处图标在旧源中均明确声明为行内图片，且宽/高匹配唯一；本次逐项恢复，不设全局图片地址尺寸规则。
- 仅恢复 RTC `run-demo` 的 19 处显式截图尺寸。未批量修改其他页面的截图候选。

## 已恢复的行内图标

以下路径相对于 `content/docs/zh-CN/`，共 21 篇、44 处：

| 文档 | 图标处数 |
| --- | --- |
| realtime-media/rtc/get-started/run-demo.mdx | 12 |
| realtime-media/rtc/get-started/quick-start.mdx | 3 |
| realtime-media/rtc/build/audio/audio-quick-start.mdx | 3 |
| realtime-media/whiteboard/fastboard-sdk/get-started/join-room-fb.mdx | 4 |
| realtime-media/whiteboard/fastboard-sdk/reference/billing.mdx | 1 |
| realtime-media/whiteboard/whiteboard-sdk/reference/billing.mdx | 1 |
| realtime-media/fusion-cdn/get-started/quick-start.mdx | 3 |
| realtime-media/usage-analytics/build/analyze-call-data/plus.mdx | 2 |
| realtime-media/ppt-transcoding/reference/billing.mdx | 1 |
| realtime-media/status-page/build/implement-core-features/user-guide.mdx | 1 |
| solutions/meta-world/get-started/run-example.mdx | 3 |
| solutions/game-voice/get-started/run-example.mdx | 1 |
| solutions/one-to-one-live/rtm/get-started/run-example.mdx | 1 |
| solutions/one-to-one-live/custom-signaling/get-started/run-example.mdx | 1 |
| solutions/chatroom/uikit/build/run-github-project.mdx | 1 |
| solutions/showroom/get-started/run-example.mdx | 1 |
| solutions/showroom/build/video-loader/run-project.mdx | 1 |
| solutions/showroom/build/beauty/bytedance-run-project.mdx | 1 |
| solutions/showroom/build/beauty/sensetime-run-project.mdx | 1 |
| solutions/showroom/build/beauty/faceunity-run-project.mdx | 1 |
| solutions/multi-usecase/ui-solution/build/implement-core-features/kit-demo.mdx | 1 |

保留旧尺寸差异：宽 20px / 25px，或高 20px / 25px / 30px。图标使用 `InlineImage`，不再产生块级放大按钮；补齐空 alt，并继续使用 `no-referrer`。

## RTC run-demo 截图

| 平台 | 恢复的显示设置 |
| --- | --- |
| Android | 两张场景/通话截图宽 50% |
| iOS | 两张配置截图宽 80%，两张场景/通话截图宽 40% |
| macOS | 两张运行截图宽 80% |
| HarmonyOS | 配置截图宽 75% / 70%，两张运行截图宽 40% |
| Electron | 运行截图宽 80% |
| Unity | 配置图最大高度 300px，场景列表最大高度 320px |
| Flutter | 两张截图宽 80% |
| React Native | 两张截图宽 30% |

截图继续使用 `DocsImage` 并保留点击放大。新增 `displayHeight` 为缩略图最大高度，配合自动宽高保持比例；不把尺寸限制传给放大预览。

## 防回归与后续

- `src/lib/mdx/fixtures/cn-image-parity.json` 固定上述审核范围、尺寸和出现次数。
- `src/lib/mdx/cn-image-parity.test.ts` 解析实际 MDX，验证组件类型、宽/高、alt 和重复引用次数，防止再次退化为不带尺寸的 Markdown 图片。
- 组件测试覆盖高度约束的行内图标，以及缩略图最大高度不会限制放大预览。
- 相同规则复扫后，旧行内图标遗漏为 0，RTC `run-demo` 中的显式尺寸遗漏为 0。
- 其余普通截图仍有 690 处尺寸候选（原 709 处减去本次 RTC 的 19 处）。它们不等同于已确认视觉问题；相同资源在不同源页面可能使用不同尺寸，也包含旧宽 100% 的引用，需逐页判断，不做统一缩放。
- 本地 QA 图片与原始排查数据保存在忽略目录 `.agent/artifacts/`，不提交或托管到 PR。

## 验证结果

- `bun run test src/lib/mdx/cn-image-parity.test.ts src/components/mdx.test.tsx`：142 条通过；新增内容/组件断言先验证失败，再实现修复。
- `bun run test --testTimeout=30000`：269 个测试文件通过，3806 条测试通过、2 条跳过。
- `bun run types:check`、修改 TSX/测试/JSON 的 Biome 检查及 `git diff --check`：通过。
- 独立只读审查逐项核对 fixture、旧源引用与实际 diff，未发现阻断问题。
- 浏览器：Android 的同步/运行/App 图标宽 25px，两个运行截图宽度为列表内容的 50%；iOS 的编译/App 图标高 20px / 30px；截图点击放大正常且不继承缩略图尺寸。
- Unity 配置截图高度 300px、场景列表高度 320px；390px 视口下场景列表等比缩小为约 279×215px，不溢出页面。
