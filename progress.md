# Progress

## 2026-05-11
- Confirmed `docs-portal` repository location and startup command.
- Located the Overview route and the likely left-sidebar source in `src/components/home/PlatformHomePage.tsx`.
- Noted pre-existing user changes in the worktree and recorded the main risk before editing.
- Started the dev server successfully with the bundled Node 22 runtime because the system default Node 18 was too old for Vite 8.
- Confirmed a listener on `127.0.0.1:3000`; browser automation could not attach because no IAB backend was available in this session.
- Updated the Overview sidebar so `通用 / General` is now a top-level group, parallel to `快速入门 / Quick Start` and `开始构建 / Start building`, with its three child pages listed underneath.
- Ran a local `tsc --noEmit` check with the bundled Node runtime; it reported pre-existing type issues elsewhere in the repo unrelated to this sidebar adjustment.
- Moved the Overview sidebar disclosure arrow to the right side of expandable items such as `开始开发 / Start development`.
- Replaced the Overview `平台入口 / Platform entry points` card grid with a new `更多资源 / More resources` list-style section and added a dedicated `resource-list` rendering path in `PlatformHomePage.tsx`.
- Resolved a temporary runtime regression during the section-type migration by making the section renderer tolerant to non-card section variants before Vite HMR settled.
- Fixed the `UNRESOLVED_IMPORT` and follow-up `ENOENT` on `src/lib/convoai-portal.server.ts` by removing `meta.json` file loading entirely and deriving the ConvoAI RESTful page list from `source.getPages()`, which is already backed by the loaded docs collection.
- Updated the Overview sidebar grouping to mirror the left navigation from `/Users/yangyixuan/Downloads/agora_docs_overview_preview_page.jsx`: `Get Started`, `Capabilities`, and `Administration`.
- Added lightweight overview markdown pages for sidebar-only destinations that did not previously exist, such as `About Agora`, `Start with AI`, `Community resources`, `Projects`, `Members and roles`, and `Usage analytics`.
- Registered the new overview markdown pages on both the client and server home-markdown loaders so the new sidebar links resolve without runtime errors.
- Removed the `Start building / 开始构建` section from the `platform-overview` page.
- Simplified the `platform-overview` hero so it now keeps only `Agora Docs` and the one-line description, removing the eyebrow, buttons, image/signal graphic, and related TOC entry.
- Renamed the Overview top navigation label from `概览 / Overview` to `介绍 / Introduction`.
- Added a new first `Get started` showcase section above `选择你的路径`, using a three-card quickstart treatment inspired by the provided reference image.
- Refined the new `Get started` showcase layout to feel closer to the reference: cleaner preview area, tighter content spacing, and a more stable top/bottom split inside each card.
- Localized the three showcase card titles into Chinese: `智能体搭建器`, `语音 AI 快速开始`, and `Coding Agent 支持`, and changed the section heading to `快速开始` in Chinese.
- Tightened card alignment in the `Get started` showcase so the three preview panes share the same top height and the three titles begin on the same horizontal line.
- Locked the `Get started` preview area to a fixed height with overflow clipping so the third card (`Coding Agent 支持`) can no longer push its title/content block lower than the first two cards.
- Rebuilt the Overview `更多资源 / More resources` section into a grouped SDKs-and-tools style layout, replacing the old four-item resource list with grouped document entry points derived from current Shengwang docs: quickstarts, product/platform, server APIs, and tools/extensions.
