# Task Plan

## Goal
Replace the current RTC platform switcher UX so `realtime-media/rtc` uses one shared left sidebar across platforms, and individual guide pages render platform tabs near the page header or markdown action area. A platform tab should only appear when that page exists for that platform.

## Phases
- [in_progress] Audit current RTC nav-scope, sidebar, route, and page-header behavior
- [pending] Implement shared RTC sidebar data and page-level platform tab resolution
- [pending] Remove RTC platform switching from the left sidebar header while preserving other nav-scope behavior
- [pending] Add or update focused tests for RTC shared sidebar and platform-tab visibility
- [pending] Run targeted verification for touched tests and type safety

## Risks
- RTC guide URLs are partially decoupled from the raw content folder layout, so sidebar links and page-level sibling lookup must follow public URLs rather than file paths alone.
- Existing nav-scope logic is shared with API Reference version switching, so RTC-specific behavior must not regress versioned API scope navigation.
- Breadcrumb and active-state matching may break if the shared sidebar uses canonical URLs that differ from a page's platform-specific public route.

## Follow-up
- Keep this pass scoped to RTC docs behavior under `realtime-media/rtc`; do not redesign other tabs or API Reference version switching in the same change.
