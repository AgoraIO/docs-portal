# Server Gateway Python and Go API reference migration

## Scope and source

- Target base: `origin/main` at `f9cfe8d9d`. The initial migration was prepared on local `main` at `33b522b18`; only this migration commit was rebased onto the remote base for the PR.
- Source checkout: `/Users/yejiayi/Documents/Doc-Source-Private`, HEAD `8e6e9c9ff`.
- Source entrypoints: `shared/cloud-gateway/reference/api-ref/{python,go}.mdx`, with 17 imported chapters per platform.
- Target pages: `content/docs/en/api-reference/api-ref/server-gateway/{python,go}.mdx`.
- Classification: authored SDK reference. This explicitly requested migration uses static content and requires no generated HTML, REST widgets, or product variables. All 34 imported fragments are covered.
- Catalog and sidebar: add Python and Go after Linux C++ and Linux Java. Both new cards link to the corresponding portal page.
- Version labels: `2.2.4 (Latest)`, confirmed by the user and the two source release-note files under `shared/cloud-gateway/reference/release-notes/`. The supplied screenshot's `2.1.0` labels are older than the supplied source.

## Content normalization

Preserve each platform's chapter order and single-page structure. Expand imports, remove the platform wrappers and commented-out unpublished sections, convert admonitions to directive callouts, and move HTML lists out of tables into native Markdown parameter descriptions. Escape literal table pipes and MDX-sensitive prose. Preserve named release anchors using heading IDs.

Repair the missing closing code fence in Go's `medianodefactory.mdx`. Correct the Python overview links for `renew_token`, `get_rtc_connection`, and `on_audio_meta_data_received`; distinguish the LocalVideoTrack `set_enabled` target from LocalAudioTrack's method. Correct Go's `SetPlaybackAudioFrameBeforeMixingParameters` link and distinguish its LocalVideoTrack `SetEnabled` target from LocalAudioTrack's method. Add blank lines around lists identified by the independent review. Rewrite account and RTC token-authentication links to existing English portal routes. Preserve source API signatures and version-specific notices.

## Acceptance results

- `bun run types:check`: passed.
- `git diff --check`: passed.
- Source parity: all 34 chapters retained; all 96 Python and 90 Go code blocks match the active source byte for byte after repairing the source's missing fence.
- Markdown AST inspection: 89 tables per platform; no rows with inconsistent column counts. No active legacy JSX or HTML list markup remains.
- Browser on local Vite server: catalog shows all four Server Gateway platforms and both `2.2.4 (Latest)` labels. Python card navigates to the Python reference; both reference pages render 17 chapters. All rendered page-fragment links resolve. Python LocalVideoTrack `set_enabled` and Go `agoraservice` Release links scroll to their intended headings.
- Browser visual inspection: catalog, Python and Go reference pages render with the existing docs shell. Screenshots are stored only in ignored `.agent/artifacts/`.
- The repository's static link-audit helper does not recognize `[#id]` heading IDs and strips underscores from inline-code heading text. Its reports for those anchors were checked against the rendered DOM rather than treated as actual broken links.
- After rebasing and installing the updated lockfile, `bun run types:check` passed again. Both reference pages render 17 chapters with no unresolved page-fragment links; the Go video-track `SetEnabled` jump was checked in the browser.
- `bun run test` on the PR base: 1,923 passed, 44 failed across 183 files. A separate unmodified `git archive origin/main` baseline produced the same 44 failing test names, with no added or removed failures. Logs are in ignored `.agent/artifacts/pr-rebased-tests.log` and `.agent/artifacts/pr-baseline-tests.log`. The full suite is therefore not green; these failures predate this change.
- Independent review: corrected one Go method-link target and list spacing; no other content omissions or unintended changes found.

No SDK method semantics or application runtime code was changed.
