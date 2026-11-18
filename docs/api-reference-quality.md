# API reference quality and acceptance

This is the release contract for API reference content and its shared renderers in both locales. A machine pass establishes the checks and coverage recorded in its report. Release acceptance additionally requires an independent reader and resolution, or explicit deferral, of the source feedback ledger.

## Scope and ownership

Include every published API reference route, platform variant and version entry, regardless of origin: authored Markdown/MDX, imported HTML (TypeDoc, Oxygen, Doxygen, Appledoc, DITA), OpenAPI YAML and future generators. The automated inventory reads the built route manifest and canonical payloads. It includes `/api-reference` and `/api` path segments, API/RESTful-named pages under `/reference`, OpenAPI bodies, API component sources and explicitly registered acceptance URLs. Ordinary reference pages such as pricing or release notes are not API references merely because their URL contains `/reference`. Declared redirects and neutral version entries are inventoried as entrances and validated against their published targets. The route manifest records the default destination of a version entry for a fresh browser profile. Missing targets and redirect cycles fail. Publishing a reference elsewhere requires extending this selector and its tests in the same PR. Review the inventory delta when routes or generators change; an inventory is not proof of semantic completeness.

External SDK sites are checked at their current-version destinations and historical version entries. Their page templates and historical subpages are outside this repository's repair scope. Record external findings separately. A working external destination does not validate its content.

| Responsibility | Accountable reviewer |
| --- | --- |
| Accurate signature, overload, parameter, return value, deprecation and version | SDK/API content owner |
| Markdown/importer/schema structure and preserved anchors | Content author or migration owner |
| Layout, controls, accessibility and shared locale behavior | Portal maintainer |
| Independent reading and interaction acceptance | Reviewer other than the implementer |
| Release decision and explicitly accepted remaining debt | Release owner |

Choose the owning layer before implementing a correction:

| Cause | Required correction |
| --- | --- |
| Incorrect signature, parameter meaning, return contract or version | Ask the SDK/API owner to correct the authoritative source, then regenerate. Preserve the disputed text until that decision is recorded. |
| Lost structure, language metadata, links or anchors during migration | Correct the importer and existing generated output. Retain provenance and a source-fidelity receipt. |
| Layout, typography, code frame, table surface or interaction | Extend the common primitive and its contract fixtures in both locales. Use documented Fumadocs/native semantics and existing primitives. |

A new generator maps its source structure to the approved primitives. It does not introduce another table skin, signature card or highlighting pipeline. Presentation fixes belong in the common primitive, rather than URL/SDK-specific CSS or runtime guesses about content. A missing primitive capability requires shared fixtures and both regional results. Add a dependency or runtime transformation only after documenting why the existing platform cannot solve the problem.

## Shared implementation and change requirements

The [shared-file manifest](../scripts/api-reference-shared-files.json) identifies the renderer modules, code configuration, QA implementation, fixtures and package commands that must match across locale branches. Update this manifest when adding or moving a shared module. Manifest changes are part of the review; regional content debt is not a shared implementation allowance.

```sh
# Run from either checkout. Compare the actual working copies, including local edits.
bun run qa:api:shared --against /path/to/companion-checkout

# Run the same rendering/source/detector regression entry point in each checkout.
bun run test:api-quality
```

The comparison is read-only and requires two different checkouts. A missing or divergent shared file/command fails with hashes; it never copies, normalizes or silently excludes a difference. The manifest and comparison tool are themselves compared. Keep translated content, routes, asset origins and genuine regional capabilities at the content/integration boundary. Their intentional differences need a reason and the affected locale's checks; they do not justify a fork of a common primitive.

| Change | Required evidence |
| --- | --- |
| API content only | Source gate, relevant link checks, affected-page reading and API-owner semantic decision in the affected locales. |
| Shared components/styles, language configuration, generators, rendering dependencies or build behavior | Shared-file comparison, regression entry point and types in both checkouts, plus fresh `all` browser reports for both regions and the independent manual reading set. |
| Browser probes, inventory, viewport matrix, canaries or pass/fail policy | Detector fixtures and calibration, plus fresh `all` reports for both regions. A changed definition of PASS requires new evidence. |
| Rules, PR template, CI test selection or the read-only parity tool only | Shared-file comparison, regression entry point in both checkouts and source gates. Retain the last rendering report as a labeled checkpoint; this follow-up does not certify a changed checkout against an earlier fingerprint. |

For a shared change, the author records both checkout commits/source identities and the parity result. CI runs the regional checkout's tests and browser gate; it does not check out or certify the companion branch automatically. The reviewer checks both regional reports. A missing counterpart renderer is N/A with a reason and shared bilingual fixture coverage. A missing checkout or missing evidence is incomplete, not N/A.

For release acceptance, the browser report must still match the exact release candidate's head and source fingerprint. Older reports remain evidence for their recorded snapshots. Check the [PR acceptance record](../.github/PULL_REQUEST_TEMPLATE.md) rather than treating a past pass as approval for later edits.

## Content contract

Follow the [Markdown standard](agents/markdown-authoring-standard.md), [link audit](agents/doc-link-audit.md) and [asset hosting policy](agents/static-asset-upload.md).

- Each member has an identifiable signature and its associated description, parameters and return value. Preserve each overload as a separate group. Consecutive duplicate member headings without intervening content are defects, including duplicates at different heading levels.
- Tables have descriptive headers. Source file paths belong in metadata, not parameter headers. Use ordinary Markdown tables for inline content and the approved rich-table primitives for block content.
- Generated summary tables omit generator decoration such as empty Doxygen `memSeparator` rows. Preserve real empty cells, spans, links and destination anchors. An empty destination anchor stays an anchor; its URL must never become visible prose or a type name. Repair existing output against source evidence and retain the unaffected API text.
- Generated TypeDoc properties use the shared signature frame; modifiers such as Optional and Readonly remain signature metadata, with historical heading destinations preserved. A generator's explicitly labeled note becomes a standard callout, retaining its text and lists. The legacy Shengwang TypeDoc lane additionally maps its source blockquotes to caution notices, following the [authoritative legacy parser](https://github.com/AgoraIO/shengwang-doc-source/blob/87944935efab419af338b006ba45807364a4b544/plugins/plugin-content-docs-ag/doc-factory/html-doc-parsers/typedoc/index.js#L34). Apply that rule only to the selected legacy generator and provenance-marked generated output. Preserve quotations in ordinary Markdown and other importers. Deprecated comment tags remain notice metadata and retain historical heading destinations. Reuse an enclosing callout rather than nesting another. Actual quotations remain blockquotes. Do not infer severity from the notice body or add a runtime text classifier.
- Nested object parameters use ordinary lists within their parent description, retaining names, types, optionality, links and deeper nesting. They do not introduce another card, grid or table frame around each field.
- Parameter and return descriptions preserve bullets, numbering, nesting, callouts and examples. Possible-value badges are a separate component, not an excuse to remove prose list markers.
- Code-only alternatives use the approved code tab syntax; alternatives containing prose use ordinary Tabs. Match group identifiers only when synchronization is intended. A repeated installation example uses the same rendering contract in every scenario.
- Generated prototypes use the SDK language recorded by migration provenance; `text` is reserved for actual plain output or unknown-language content. The source gate rejects known prototypes mislabeled as plaintext. Repair existing output with `bun scripts/normalize-api-reference-code-languages.mjs --write`; `--check` is read-only. Explicit languages, code values and anchors remain unchanged.
- Keep authored language captions when using a compatible bundled grammar. ArkTS API declarations use the TypeScript grammar with an explicit ArkTS label; see [the official language overview](https://developer.huawei.com/consumer/cn/arkts/devstart/). Do not add a custom lexer or relabel the SDK language to obtain color.
- Machine-readable exports preserve code values, language and metadata when lifting MDX code into standalone CommonMark fences. Search destinations use published renderer heading IDs; historical aliases remain valid page links.
- Objective-C `-`/`+` method markers are valid API notation. `Declared In` and a plain `.h` filename are valid metadata and need not be links. Every actual type/member link must resolve to its intended destination and anchor. Preserve historical anchors when headings change.
- Images use the existing region's approved CDN. Resolve the real object URL through the asset policy; derive neither bucket addresses nor invented CDN URLs. Production images under the retired docs site's `/img`, `/images` or `/assets` paths are regressions.
- Preserve source provenance and version. A clean layout does not prove that imported signatures or descriptions are complete.

## Presentation and interaction contract

- At 100% browser zoom, the page remains readable at the matrix in the checker: desktop, tablet portrait/landscape, phone portrait/landscape and compact phone, in light and dark themes. Record actual CSS viewport dimensions, not the physical screen size.
- The document itself does not gain horizontal overflow. Wide tables and code scroll locally; the final column/end of code remains reachable. Long descriptions occupy readable columns; short tokens such as `DELETE` and `100/second` retain complete words. Use intrinsic sizing and common CSS rules rather than per-page/language widths.
- Long signatures and TOC labels fit or wrap without clipping. TOC destinations exist, show the intended member and remain visible below sticky navigation. Contrast and hierarchy support continuous reading.
- Return-type cells wrap long unions, tuples and generics as linked text inside the ordinary table. The shared type primitive must not impose a no-wrap width on the description column. Code examples retain their normal local scroll behavior.
- Product and platform breadcrumb ancestors link to their existing catalog or overview when available. Preserve catalog filter state and real destination IDs; do not invent overview routes for labels.
- Expandable OpenAPI field names and their arrows share one button. Field and bulk controls have at least 44×44 CSS px targets, visible keyboard focus and meaningful accessible names. Mouse, touch and keyboard operate the same state. Multi-line JSON examples and defaults use the shared block metadata layout and scroll inside the code frame. Bulk controls and their translations exist in both locales and fit quietly in the section header.
- Parameter and descriptive return tables share the native `DocsTable` primitive used by ordinary MDX tables. A return type without prose is displayed directly, including void and Promise<void>. Omit empty description columns while preserving the type and destination anchors. Destination anchors in parameter rows belong outside the prose spacing container. Body row headings share the description cell surface. Modifier badges, signature type links and the start of each member remain visibly identifiable. Linked signatures share the Fumadocs code frame; preserve links and metadata instead of reparsing rich signature text for color. Rich signature tokens occupy a native code-line wrapper and retain the code font, including type links and emphasis. MDX paragraph soft breaks remain prose whitespace; explicit code text stays exact. The common renderers are `src/components/DocsCodeBlock.tsx` and `src/components/mdx/{ApiReference,DocsTable,HighlightedCode}.tsx`. Keep them identical across locale branches.
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

The audit driver owns an isolated browser session and disables its CLI daemon idle timer: native CDP collection does not refresh that timer, and a full CI scan can exceed one hour. Normal and failed runs close their session explicitly. A disconnected or partial scan remains `INCOMPLETE` and must be rerun in full.

The `all` scope reads every selected page at desktop/light and phone/dark. Every rendered table/OpenAPI page and acceptance case additionally uses all six viewports in both themes. `smoke` uses only the versioned [representative cases](../scripts/api-reference-quality-cases.json). Every report lists exact selected URLs, expected/completed states, browser version, fonts, commit and build identity. A smoke pass must never be described as a full audit.

Hard browser checks cover body readiness, whole-page and TOC overflow, description list markers, schema target size, squeezed table prose, split short table words, tab frame leaks, broken loaded images, legacy image origins, missing or CSS-flattened highlighted tokens for declared languages, native parameter-table structure, native signature lines, shared frames and consistent inline code typography. Signature styles are also compared with ordinary code frames across pages for each viewport/theme, so a signature-only page cannot bypass consistency checks. The code-language marker records authored metadata before grammar fallback. Plain output is excluded from highlighting requirements. The browser gate also rejects empty return descriptions, invalid compact returns, indistinguishable signature links, anchor-induced description gaps, and mismatched parameter row surfaces. Each run first injects intentionally broken examples into a separate blank page; the detector must identify them before measuring production pages. It also clicks a visible field name and presses Enter where a schema control exists. The runner does not submit API requests.

Navigation/link correctness uses the existing link audits; it is not inferred from a geometry pass. Run the relevant checks described in the linked link-audit guide and retain their unresolved findings. Browser emulation uses CSS viewports, not physical-device certification; touch, full control behavior, visual quality and API semantics remain manual acceptance.

The independent **API source regression** workflow runs `test:api-quality` and checks both locales for every relevant PR, including forks, without deployment secrets. The Vercel preview workflow uses that same regression entry point before the build and the full regional browser gate before publishing the preview. Maintain the test selection in `package.json`, rather than separate workflow lists. Failure stops that preview job. Reports and failure screenshots are workflow artifacts, not repository assets. Shared changes require passing evidence for both locales; one regional job does not certify the other locale. Forks that cannot publish previews require a maintainer-run browser report before acceptance. Repository administrators must make both the source regression and preview/quality statuses required in branch protection if they want GitHub to prohibit merging a failed check; this document does not configure branch protection or production promotion.

## Human acceptance without reading every page

Generate the checklist against the exact preview being reviewed. It contains 14 renderer/risk scenarios with direct links and observable outcomes, including the four original API findings in [the Chinese review document](https://rcnxnwjad4la.feishu.cn/wiki/ELVwwedREifzEnkYskYcubXonpb). Keep each feedback row linked to its original section and a reproducer; close it only after reproducing that outcome on the candidate commit. A later content update reopens affected feedback when its assumptions change.

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

The source gate reports `PASS_WITH_DEBT` for exact pre-existing heading identities/counts in [the reviewed debt file](../scripts/api-reference-quality-debt.json). Any new or increased duplicate fails. Debt data belongs to the checked-out content branch; copy shared rules across branches, not allowances for defects absent from the destination. Unused debt allowances also fail, so a resolved defect cannot retain a silent exemption for its future reintroduction. Remove an entry when the content owner resolves it; baseline additions require a linked owner task and explicit review in the PR. There is no automatic baseline-refresh command. Browser failures cannot be waived through this source baseline.

Consult the current checkout's debt file and source report for unresolved content identities. Do not copy counts from an earlier report: upstream content retirement or owner corrections can change the inventory. Tracking context is in PR #1360; assign individual owners/tasks before release acceptance. Historical findings remain in their dated triage records, without granting allowances for reintroduction.

A browser `PASS` plus source `PASS_WITH_DEBT` is **not** a clean release acceptance. Keep those source items open until the content owner fixes them or the release owner explicitly accepts their impact. Likewise, record unrelated existing unit/lint failures by exact baseline comparison and owner; do not label the suite green or suppress new failures. The English PR currently retains an existing content/migration test baseline and remains a draft until its release decision is made.

On failure, use the reported source URL, viewport, rule and local screenshot to reproduce. Correct the responsible layer, add a representative regression case or detector test, rebuild, and rerun the affected scope. For a common renderer fix, rerun both locales at `all` scope. A missing report, interrupted run or unreviewed debt means acceptance is incomplete.
