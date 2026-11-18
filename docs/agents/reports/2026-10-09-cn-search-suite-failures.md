# 全量测试失败记录

最新在 codex/cn-metadata-fix 运行 bun run test：13 个文件失败、182 个文件通过；35 项失败、1721 项通过、2 项跳过。日志：/tmp/cn-search-final-suite.log。与先前 /tmp/cn-metadata-fix-vitest.log 提取的 35 个完整失败名称对照，新增 0、消失 0。

已补跑 mentor 提交 1c20dbc61 的干净源码：35 失败、1697 通过、2 跳过，日志 /tmp/cn-mentor-clean-baseline-tests.log。完整失败名称与当前完全一致，新增 0、消失 0。全部 35 项在本轮修改之前的源码可重现；详细原因与影响见 2026-10-09-cn-test-failure-audit.md。本次搜索专项测试另外运行，7 个文件共 45 项通过；类型检查通过。

失败名称：

- FAIL  src/routes/-docs-routing-guards.test.ts > docs route locale guards > redirects moved zh-CN Introduction routes before page fallback
- src/routes/-docs-routing-guards.test.ts > docs route locale guards > redirects moved zh-CN PPT transcoding routes before page fallback
- src/routes/-docs-routing-guards.test.ts > docs route locale guards > serves direct zh-CN .md docs page URLs as markdown
- src/routes/-docs-routing-guards.test.ts > docs route locale guards > keeps llms index feed English-only
- src/lib/docs-content-regressions.test.ts > docs content regressions > keeps realtime video get-started-sdk sections that were missing in the PDF review
- src/lib/docs-content-regressions.test.ts > docs content regressions > keeps CodeBlockTab panels code-only
- src/lib/docs-content-render-regressions.test.tsx > docs content render regressions > renders a Chinese page through the upgraded MDX component runtime
- src/lib/docs-journeys.test.ts > docs journeys > keeps zh-CN RTC API navigation versioned while English uses canonical Voice and Video reference docs
- src/lib/docs-page.server.test.ts > loadDocsPagePayload > returns OpenAPI content inside the existing docs shell payload from the merged source
- src/lib/docs-single-folder-sections.test.ts > single-folder docs sections > does not keep navigation sections whose only page is another folder
- src/lib/product-api-reference-sidebar.test.ts > product API reference sidebar links > embeds realtime-media/danmaku 服务端 API as a collapsed API sidebar section
- src/lib/product-api-reference-sidebar.test.ts > product API reference sidebar links > embeds solutions/meeting 服务端 API as a collapsed API sidebar section
- src/lib/product-api-reference-sidebar.test.ts > product API reference sidebar links > embeds solutions/online-ktv,online-ktv-sdk 服务端 API as a collapsed API sidebar section
- src/lib/product-api-reference-sidebar.test.ts > product API reference sidebar links > keeps ordinary API cross-links as page entries
- src/lib/product-api-reference-sidebar.test.ts > product API reference sidebar links > reads the service API leaf from the Chinese meeting product metadata
- src/lib/product-api-reference-sidebar.test.ts > product API reference sidebar links > reads the service API leaf from the Chinese online-ktv,online-ktv-sdk product metadata
- src/lib/rtc-mini-program-client-content.test.ts > RTC mini-program Client reference > starts with the constructor reference instead of TypeDoc indexes
- src/lib/rtc-mini-program-client-content.test.ts > RTC mini-program Client reference > keeps each on overload with its own documentation
- src/lib/rtc-mini-program-client-content.test.ts > RTC mini-program Client reference > uses the legacy-style table layout for every parameter and return block
- src/lib/zh-cn-product-ia-standard.test.ts > zh-CN product IA standard > uses standard root entries for speech-to-text
- src/lib/zh-cn-product-ia-standard.test.ts > zh-CN product IA standard > uses Chinese titles for the standard speech-to-text groups
- src/lib/zh-cn-product-ia-standard.test.ts > zh-CN product IA standard > redirects representative old realtime-media path ["recording","cloud-recording","user-guides","manage-file","playback"]
- src/lib/zh-cn-product-ia-standard.test.ts > zh-CN product IA standard > keeps every zh-CN product IA redirect source and target routable
- src/lib/zh-cn-product-ia-standard.test.ts > zh-CN product IA standard > uses only standard first-level entries or direct page leaves in migrated product roots
- src/lib/zh-cn-product-navscope-content.test.ts > zh-CN product nav scope content > keeps RTC overview as the Voice and Video product entry target
- src/components/docs-shell/DocsContent.test.tsx > DocsMainColumn > keeps desktop content in normal page flow instead of a nested scroll viewport
- src/components/docs-shell/DocsContent.test.tsx > DocsMainColumn > keeps footer controls stacked and non-overlapping in the mobile flow
- src/components/docs-shell/DocsContent.test.tsx > DocsMainColumn > keeps one canonical article and footer in the docs main column
- src/components/docs-shell/DocsContent.test.tsx > DocsPageFeedback placement > captures helpfulness feedback without changing the local pressed state
- src/components/docs-shell/DocsContent.test.tsx > DocsPageFeedback placement > opens a feedback dialog with a prefilled issue link
- src/components/docs-shell/DocsContent.test.tsx > DocsPageFeedback placement > shows helpfulness feedback in desktop and mobile page footers
- src/components/docs-shell/DocsShell.test.tsx > DocsShell > keeps the shell footer responsive on mobile
- src/components/docs-shell/DocsShell.test.tsx > DocsShell > keeps feedback in normal page flow while only navigation areas own scroll regions
- src/components/docs-shell/DocsShell.test.tsx > DocsShell > keeps mobile docs content in normal page flow instead of a nested scroll viewport
- src/components/faq/faq-content-sync.test.tsx > faq content integrity > does not leave Chinese FAQ image references pointing at local public assets
