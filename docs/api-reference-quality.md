# API reference quality and acceptance

This is the release contract for API reference content and its shared renderers in both locales. A machine pass establishes the checks and coverage recorded in its report. Release acceptance additionally requires an independent reader and resolution, or explicit deferral, of the source feedback ledger.

## Scope and ownership

Include every published API reference route, platform variant and version entry, regardless of origin: authored Markdown/MDX, imported HTML (TypeDoc, Oxygen, Doxygen, Appledoc, DITA), OpenAPI YAML and future generators. The automated inventory reads the built route manifest and canonical payloads. It includes `/api-reference`, `/reference` and `/api` path segments, OpenAPI bodies and API component sources. Publishing a reference elsewhere requires extending this selector and its tests in the same PR. Review the inventory delta when routes or generators change; an inventory is not proof of semantic completeness.

External SDK sites are checked at their current-version destinations and historical version entries. Their page templates and historical subpages are outside this repository's repair scope. Record external findings separately. A working external destination does not validate its content.

| Responsibility | Accountable reviewer |
| --- | --- |
| Accurate signature, overload, parameter, return value, deprecation and version | SDK/API content owner |
| Markdown/importer/schema structure and preserved anchors | Content author or migration owner |
| Layout, controls, accessibility and shared locale behavior | Portal maintainer |
| Independent reading and interaction acceptance | Reviewer other than the implementer |
| Release decision and explicitly accepted remaining debt | Release owner |

Fix malformed source or importer output at that layer. Ask the content owner to correct semantic source defects. Shared presentation fixes belong in the common component/style layer with the same behavior in Chinese and English. Prefer documented Fumadocs/native semantics and existing primitives. Add dependencies or runtime transformations only with an explicit explanation of why the existing platform cannot solve the problem.

## Content contract

Follow the [Markdown standard](agents/markdown-authoring-standard.md), [link audit](agents/doc-link-audit.md) and [asset hosting policy](agents/static-asset-upload.md).

- Each member has an identifiable signature and its associated description, parameters and return value. Preserve each overload as a separate group. Consecutive duplicate member headings without intervening content are defects, including duplicates at different heading levels.
- Tables have descriptive headers. Source file paths belong in metadata, not parameter headers. Use ordinary Markdown tables for inline content and the approved rich-table primitives for block content.
- Parameter and return descriptions preserve bullets, numbering, nesting, callouts and examples. Possible-value badges are a separate component, not an excuse to remove prose list markers.
- Code-only alternatives use the approved code tab syntax; alternatives containing prose use ordinary Tabs. Match group identifiers only when synchronization is intended. A repeated installation example uses the same rendering contract in every scenario.
- Objective-C `-`/`+` method markers are valid API notation. `Declared In` and a plain `.h` filename are valid metadata and need not be links. Every actual type/member link must resolve to its intended destination and anchor. Preserve historical anchors when headings change.
- Images use the existing region's approved CDN. Resolve the real object URL through the asset policy; derive neither bucket addresses nor invented CDN URLs. Production images under the retired docs site's `/img`, `/images` or `/assets` paths are regressions.
- Preserve source provenance and version. A clean layout does not prove that imported signatures or descriptions are complete.

## Presentation and interaction contract

- At 100% browser zoom, the page remains readable at the matrix in the checker: desktop, tablet portrait/landscape, phone portrait/landscape and compact phone, in light and dark themes. Record actual CSS viewport dimensions, not the physical screen size.
- The document itself does not gain horizontal overflow. Wide tables and code scroll locally; the final column/end of code remains reachable. Long descriptions occupy readable columns; short tokens such as `DELETE` and `100/second` retain complete words. Use intrinsic sizing and common CSS rules rather than per-page/language widths.
- Long signatures and TOC labels fit or wrap without clipping. TOC destinations exist, show the intended member and remain visible below sticky navigation. Contrast and hierarchy support continuous reading.
- Expandable OpenAPI field names and their arrows share one button. Field and bulk controls have at least 44×44 CSS px targets, visible keyboard focus and meaningful accessible names. Mouse, touch and keyboard operate the same state. Bulk controls and their translations exist in both locales and fit quietly in the section header.
- Code and mixed-content tabs remain visually coherent inside their frames, support keyboard navigation and retain local code scrolling. Clicking or following a hash must work after client hydration, not only in static HTML.

## Automated gate

Use the repository toolchain from `package.json`. The QA runner adds no application dependency. Browser checks reuse the isolated `agent-browser` launcher and native Chrome CDP. Install the QA tool once with `npm install -g agent-browser@0.41.1` and `agent-browser install` (`--with-deps` on Linux). It creates and closes its own browser session. Layout runs download the exact WOFF2 URLs declared by the app (using curl), record their SHA-256 hashes, and fulfill only those font requests through CDP. This keeps layout reproducible when a loopback origin is outside the CDN CORS policy; CSS and application content are unchanged. Verify font/CDN delivery separately on the real preview origin. `--fonts remote` uses direct browser delivery and fails if fonts cannot load; fixture results must not be cited as proof of production CORS or network availability.

```sh
# Fast source check, including both locales and explicit existing content debt.
bun run qa:api source --region cn

# Build the selected region from current sources and run representative cases.
bun run qa:api --region cn --scope smoke
bun run qa:api --region global --scope smoke

# Release/shared-renderer coverage: every inventoried page in that region.
bun run qa:api --region cn --scope all
bun run qa:api --region global --scope all

# Create a clickable human checklist for an already-running local/PR preview.
bun run qa:api checklist --region cn --origin http://127.0.0.1:3110
```

The default command performs source checks, a fresh production build, a build seal, then browser checks. CI can use `prepare`, its existing build, `seal`, and `browser` to avoid building twice. Use the same region and output directory throughout. Build seals bind the checkout commit, source fingerprint and built API HTML/payloads/assets. A changed checkout, stale seal, missing case, empty/wrong-region inventory, unreadied body or failed browser produces failure or `INCOMPLETE`, never a successful skip. Run one build per worktree at a time.

The `all` scope reads every selected page at desktop/light and phone/dark. Every rendered table/OpenAPI page and acceptance case additionally uses all six viewports in both themes. `smoke` uses only the versioned [representative cases](../scripts/api-reference-quality-cases.json). Every report lists exact selected URLs, expected/completed states, browser version, fonts, commit and build identity. A smoke pass must never be described as a full audit.

Hard browser checks cover body readiness, whole-page and TOC overflow, description list markers, schema target size, squeezed table prose, split short table words, tab frame leaks, broken loaded images and legacy image origins. Each run first injects intentionally broken examples into a separate blank page; the detector must identify them before measuring production pages. It also clicks a visible field name and presses Enter where a schema control exists. The runner does not submit API requests.

Navigation/link correctness uses the existing link audits; it is not inferred from a geometry pass. Run the relevant checks described in the linked link-audit guide and retain their unresolved findings. Browser emulation uses CSS viewports, not physical-device certification; touch, full control behavior, visual quality and API semantics remain manual acceptance.

The independent **API source regression** workflow runs checker tests and checks both locales for every relevant PR, including forks, without deployment secrets. The Vercel preview workflow runs source/checker tests before the build and the full regional browser gate before publishing the preview. Failure stops that preview job. Reports and failure screenshots are workflow artifacts, not repository assets. Shared changes require passing evidence for both locales; one regional job does not certify the other locale. Forks that cannot publish previews require a maintainer-run browser report before acceptance. Repository administrators must make both the source regression and preview/quality statuses required in branch protection if they want GitHub to prohibit merging a failed check; this document does not configure branch protection or production promotion.

## Human acceptance without reading every page

Generate the checklist against the exact preview being reviewed. It contains 12 renderer/risk scenarios with direct links and observable outcomes, including the four original API findings in [the Chinese review document](https://rcnxnwjad4la.feishu.cn/wiki/ELVwwedREifzEnkYskYcubXonpb). Keep each feedback row linked to its original section and a reproducer; close it only after reproducing that outcome on the candidate commit. A later content update reopens affected feedback when its assumptions change.

The independent reviewer checks all applicable scenarios on desktop and phone, in light and dark themes, then repeats the table, tabs and schema scenarios on tablet and phone landscape. Use Chrome Device Toolbar at 100% zoom. Include real touch on a device when available; otherwise label touch as unverified. For shell/layout changes, additionally check Safari or another supported browser and record its version. Emulated Chrome evidence alone is not Safari evidence.

For content changes, add each changed reference page to the reading set and have the API owner verify semantics against the authoritative SDK/schema. For shared CSS, components, generator, Fumadocs, React, router or build dependency changes, run `all` in both locales, retain the automated inventory delta, and review all applicable renderer families. A renderer absent from one locale is N/A with a reason, not an invented counterpart. New renderers and regressions add an enduring representative case.

Complete this record in the PR (or link the team's durable acceptance record). The author supplies evidence; the independent reviewer records their own decision.

```text
Candidate commit / target base:
Regions and exact preview URLs:
Automated report: scope, inventory count, completed/expected states, status:
Tests / types / lint / link audits: commands, result, baseline differences:
Independent reviewer / date / Chrome version:
Manual case IDs and extra changed pages checked:
Actual viewports / themes / touch / other browsers:
Original feedback rows: reproducer -> candidate outcome -> evidence:
Content owner / semantic decision:
Remaining findings: source, severity, owner, tracking link, release impact:
Release decision: ACCEPT / REQUEST CHANGES / ACCEPT WITH EXPLICIT DEFERRALS
Release owner / date / rationale for each deferral:
```

Store local machine reports and screenshots under ignored `.agent/artifacts/api-reference-quality/`. CI artifacts are downloadable from the run. A screenshot collection alone is not acceptance; record the checked behavior and result. Keep QA images out of tracked content and hosted screenshot links out of PR descriptions.

## Existing debt and failure handling

The source gate reports `PASS_WITH_DEBT` for exact pre-existing heading identities/counts in [the reviewed debt file](../scripts/api-reference-quality-debt.json). Any new or increased duplicate fails. Debt data belongs to the checked-out content branch; copy shared rules across branches, not allowances for defects absent from the destination. Remove an entry when the content owner resolves it; baseline additions require a linked owner task and explicit review in the PR. There is no automatic baseline-refresh command. Browser failures cannot be waived through this source baseline.

Current CN integration checkout source follow-up: the Python copy has 51 duplicate heading pairs and a stray `26`; MetaWorld has one duplicate `getLocalUserAvatar` pair; its English server SDK Go content has one duplicate `Getters` pair. Owners must decide whether the Python copy remains published and preserve redirects/anchors if retiring it. The stray text and semantic completeness require human verification; the duplicate checker does not claim to detect them. Tracking context is in PR #1360; assign individual owners/tasks before release acceptance.

A browser `PASS` plus source `PASS_WITH_DEBT` is **not** a clean release acceptance. Keep those source items open until the content owner fixes them or the release owner explicitly accepts their impact. Likewise, record unrelated existing unit/lint failures by exact baseline comparison and owner; do not label the suite green or suppress new failures. The English PR currently retains an existing content/migration test baseline and remains a draft until its release decision is made.

On failure, use the reported source URL, viewport, rule and local screenshot to reproduce. Correct the responsible layer, add a representative regression case or detector test, rebuild, and rerun the affected scope. For a common renderer fix, rerun both locales at `all` scope. A missing report, interrupted run or unreviewed debt means acceptance is incomplete.
