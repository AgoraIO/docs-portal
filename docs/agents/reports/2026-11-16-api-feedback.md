# API navigation and signature feedback

## Findings and changes

- API breadcrumbs showed product and platform, but omitted the actual source document. The existing return link kept that context separately. The breadcrumb now includes the source document before the current page, preserving its section anchor.
- The navigation trail recognized only `/zh-CN/api-reference/`. Chinese public routes use `/api-reference/`, so their links did not carry the source context into a new tab or shared URL. Both route forms now retain the trail.
- API signatures used the ordinary code block's unwrapped default. Long event declarations therefore required horizontal scrolling. Signatures now wrap initially; readers can still toggle wrapping. Ordinary examples retain their existing default.

## Browser verification

Checked against the November 16 staging revision (`9e6f1a68b`) plus this patch, using public Chinese paths:

1. Open `/api-reference/rtc/cpp-all-platforms/device-management/audio-device`, then click `MEDIA_DEVICE_STATE_TYPE`. The destination breadcrumb includes the clickable `音频设备管理` source, returning to `#devicestate`.
2. Open `/api-reference/rtc/web/interfaces/iagorartcclient`. The `user-info-updated` signature retains every argument and its `UID` link. At the tested desktop size, the `pre` client and scroll widths both measure 690 px; computed white-space is `pre-wrap`.
3. Click `UID` in that signature. The destination retains `#uid` and the URL carries a source trail back to `iagorartcclient#user-info-updated`. The source also appears in the breadcrumb.
4. The Web interface page renders the method/event table of contents, including `user-info-updated`. The feedback's separate phrase about a missing jump preview did not specify a hover interaction; no hover-preview feature is claimed by this patch.

![Source document in the breadcrumb](assets/2026-11-16-api-feedback/breadcrumb.png)

![Wrapped event signature](assets/2026-11-16-api-feedback/signature.png)

## Automated verification

- Focused component, navigation, breadcrumb, and API rendering tests: 117 passed.
- `bun run types:check`: passed.
- Biome checks on the seven changed source/test files: passed.
- `bun run test --maxWorkers=2`: 367 files passed, 1 skipped; 6,073 tests passed, 23 skipped. The run logged socket reset messages but exited successfully.

This is a local candidate. Staging and production have not been updated by this change.
