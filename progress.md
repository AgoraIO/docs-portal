# Progress

## 2026-05-18
- Reframed the task from UI grouping tweaks to a structural refactor of the `realtime-media` tab.
- Confirmed the current flat-file content model, single-segment docs routing, and sidebar flattening behavior.
- Recorded the main architectural constraint: the current route shape and path helpers cannot represent per-product nested docs yet.
- Upgraded docs routing from a single slug model to multi-segment slug support and replaced the slug route with the splat-based docs route.
- Changed docs page payloads and markdown-path derivation to use the resolved page path directly, so nested product indexes like `rtc/index.md` can render without ambiguous URL-to-file inference.
- Upgraded sidebar generation to preserve product folders as collapsible sections instead of flattening everything into a page list.
- Migrated `RTC`, `RTM`, and `IM` under `realtime-media` into per-product folders as the first working sample of the new structure.
- Migrated `speech-to-text` into a true two-level product folder and moved `audio-modality` underneath it.
- Added product-directory entry pages for `online-ktv` and isolated the legacy deep MDX tree from the active docs source to stop unresolved old-portal imports from crashing the dev server.
- Upgraded the docs shell sidebar to accept nested `DocsSidebarNode[]` trees so multi-level product directories can render in both desktop and mobile navigation.
- Reintroduced the first real legacy Online KTV page (`uikit/overview/introduction`) as Markdown inside the active docs tree, proving the MDX-to-Markdown recovery path works.
