# Restore SDK menus for unlisted API details

This candidate follows the documentation-group agreement: display the existing SDK menu, without introducing a parent or selecting an unrelated entry.

When the existing menu-based resolver cannot identify an API page's SDK, use the page's content directory and existing scope/version metadata. Existing successful resolution takes precedence. Ordinary documents do not use this fallback.

No content, menu metadata, parent declarations, sidebar highlighting, breadcrumb implementation or source-return implementation changes are included. The independent API-signature wrapping fix remains.

The source inventory scans both locales and verifies representative real payloads for every recovered scope/version. Integration tests cover C++, Unity and Web details with no own menu item or added parent breadcrumb. Historical reports describe the withdrawn proposal, not this candidate. Historical-version identity and missing-link findings remain separate, unresolved issues.

Browser evidence: C++ enum reached from audio-device management retains its return link and original breadcrumb; its SDK menu is visible without a selected entry. Web EventEmitter shows the Web SDK menu and original breadcrumb without selecting another class. Screenshots are local ignored artifacts (`minimal-cpp.png`, `minimal-web.png`). No deployment is included.

Validation: full suite 6,078 passed, 23 skipped; typecheck passed. Source inventory: 5,848 API sources, 3,747 recovered source scopes (one redirect, 3,746 rendered sources), 27 representative scope/version payloads checked. Direct comparison with pre-PR code confirms unchanged breadcrumbs for four API examples and unchanged sidebar/header for the ordinary RTC quick-start page.
