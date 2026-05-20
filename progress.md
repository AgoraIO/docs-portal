# Progress

## 2026-05-20
- Switched the active task in `docs-portal` from `realtime-media` architecture work to English `introduction` content migration.
- Audited `content/docs/en/introduction` and confirmed that the current pages are mostly hand-written summaries rather than source-backed migrations.
- Confirmed that the only migrated `.mdx` page in the English introduction tree is `about-agora.mdx`, which must be replaced with `.md`.
- Mapped each English introduction page to product or shared source files in `Doc-Source-Private`.
- Collected the main shared-account and security source files needed for `account`, `projects`, `members-roles`, `usage-analytics`, `support`, `security-compliance`, and `security-privacy`.
- Collected the product overview source files needed for `realtime-audio-video`, `messaging`, `speech-to-text`, `rtsa`, `rtc-server-sdk`, `fusion-cdn`, `whiteboard`, `recording`, `ppt-transcoding`, and `usage-analytics`.
- Verified that direct `npm run build` and `npm run types:check` fail under the shell's default Node 18 runtime because this repo requires Node 20.19+ or 22.12+.
- Re-ran the build with the bundled Node runtime and fixed the remaining build blockers by copying the missing local image assets for `video-calling`, `real-time-stt`, and `server-gateway`.
- Completed `vite build`, SSR/Nitro build, and prerender successfully with the bundled runtime; the prerender log included the full `en/introduction` route set.
- Started `vite preview` on `http://127.0.0.1:4173/` and confirmed `200 OK` responses for `/en/introduction`, `/en/introduction/about-agora`, `/en/introduction/realtime-audio-video`, and `/en/introduction/security-compliance`.
