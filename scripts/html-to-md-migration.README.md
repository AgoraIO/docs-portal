# DITA-OT HTML-to-Markdown Migration Tool

A focused script for converting DITA-OT (Oxygen XML) generated HTML API reference docs to pure markdown files suitable for the docs-portal project.

This is not a generic HTML-to-Markdown converter. It only supports source directories that contain a DITA-OT `API/` subdirectory with HTML files. Other generated API reference structures are detected early and rejected with an actionable error.

## Overview

The old Chinese documentation site (`shengwang-doc-source`) used DITA-OT/Oxygen XML to generate some HTML API references. This tool converts that DITA-OT `API/` output to clean markdown that can be used in the new docs-portal.

Do not use this script for TypeDoc, Doxygen/Javadoc, iOS-doc-generator, Dartdoc, RESTful/OpenAPI, or arbitrary HTML exports. Those structures need their own migration lanes because their navigation, symbols, and generated anchors differ from the DITA-OT `API/` layout.

## Usage

```bash
node scripts/html-to-md-migration.mjs \
  --source <html-dir> \
  --output <md-dir> \
  --product <name> \
  --platform <name> \
  [options]
```

### Required Arguments

| Argument | Description | Example |
|----------|-------------|---------|
| `--source, -s` | Source directory containing DITA-OT `API/*.html` docs | `/path/to/html-docs/rtc/Android` |
| `--output, -o` | Output directory for markdown files | `content/docs/zh-CN/api-reference/rtc/android` |
| `--product, -p` | Product name | `rtc`, `signaling`, `cloud-recording` |
| `--platform, -P` | Platform name | `android`, `ios`, `web`, `RESTful` |

### Optional Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `--locale, -l` | Locale for output | `zh-CN` |
| `--route-base-path, -r` | Base path for links | `/api-reference` |
| `--target-base-path` | Exact route for generated links when the output directory adds route segments | Derived from `content/docs/<locale>/...` output paths, otherwise from route base, product, and platform |
| `--navigation` | TypeDoc sidebar source: `generated` or `public-index` | `generated` |
| `--navigation-manifest` | JSON array of public `{ label, source }` entries used to preserve legacy TypeDoc IA | - |
| `--version-dir, -V` | Version directory name | - |
| `--dry-run, -d` | Preview detected source type, file count, and planned output paths without writing files | `false` |
| `--verbose, -v` | Show detailed output | `false` |

## Supported and Unsupported Source Structures

### Supported

| Lane | Expected source shape | Behavior |
|------|-----------------------|----------|
| DITA-OT/Oxygen API reference | `<source>/API/*.html`, with optional `<source>/index.html` TOC | Converts HTML pages to `.mdx`, preserves DITA-OT TOC order when present, and writes `meta.json` files. |
| TypeDoc | `index.html`, `modules.html`, `classes/`, `interfaces/`, `enums/`, `assets/` | Converts overview and symbol pages, localizes generated structure labels for `zh-CN`, rewrites links, and can preserve a curated public sidebar while retaining hidden symbol routes. |
| Doxygen/Javadoc | `annotated.html`, `classes.html`, `doxygen.css`, generated `class*.html` / `interface*.html`, `search/`, or Javadoc indexes | Converts index and symbol pages; preserves common index-link order and rewrites internal `.html` links. |
| iOS doc-generator/Jazzy/appledoc | `Classes/`, `Protocols/`, `Constants/`, `Blocks/`, `Categories/`, `hierarchy.html` | Converts Objective-C/Swift index and symbol pages while preserving stable anchors and folder navigation. |
| Dartdoc | `index.html`, `index.json`, `categories.json`, `library-index.html`, `static-assets/` | Converts library and API pages while preserving folder navigation and internal `.html` links. |

### Unsupported

The script detects these layouts and fails before reading `API/`:

| Detected lane | Common markers | Required action |
|---------------|----------------|-----------------|
| RESTful/OpenAPI or other layouts | `openapi.yaml`, `openapi.json`, `swagger.yaml`, endpoint folders, root HTML without `API/` | Use the OpenAPI/Fumadocs REST API lane or add a source-specific converter. |

## Examples

### RTC Android

```bash
node scripts/html-to-md-migration.mjs \
  --source /path/to/shengwang-doc-source/html-docs/rtc/Android \
  --output content/docs/zh-CN/api-reference/rtc/android \
  --product rtc \
  --platform android
```

### Signaling iOS

```bash
node scripts/html-to-md-migration.mjs \
  --source /path/to/shengwang-doc-source/html-docs/signaling/iOS \
  --output content/docs/zh-CN/api-reference/signaling/ios \
  --product signaling \
  --platform ios
```

### Flexible Classroom TypeDoc with the legacy public navigation

```bash
node scripts/html-to-md-migration.mjs \
  --source /path/to/shengwang-doc-source/html-docs/flexible-classroom/Web \
  --output content/docs/zh-CN/api-reference/flexible-classroom/web/api-reference \
  --product flexible-classroom \
  --platform web \
  --target-base-path /zh-CN/api-reference/flexible-classroom/web/api-reference \
  --navigation public-index \
  --navigation-manifest scripts/html-migration/navigation/flexible-classroom-store.json
```

RTC React SDK is not sourced from `html-docs/rtc/React`, because that export contains Web SDK TypeDoc. Migrate the React-specific legacy MDX with `scripts/migrate-rtc-react-api-reference.mjs`; the script resolves its Web SDK cross-links against the actual Web TypeDoc source.

Dry-run output includes:

- Detected source type
- Source HTML file count
- Target route
- Every planned output path
- The first input files and resolved page titles

### Dry Run (Preview)

```bash
node scripts/html-to-md-migration.mjs \
  --source /path/to/html-docs/rtc/Android \
  --output /tmp/test-output \
  --product rtc \
  --platform android \
  --dry-run
```

## Supported DITA-OT HTML File Patterns

The tool handles these DITA-OT HTML file patterns:

| Prefix | Type | Example |
|--------|------|---------|
| `class_` | Class/struct definitions | `class_videocanvas.html` |
| `enum_` | Enum type definitions | `enum_videosourcetype.html` |
| `api_` | Method/API definitions | `api_irtcengine_create.html` |
| `callback_` | Callback definitions | `callback_irtcengineeventhandler_onerror.html` |
| `toc_` | Table of contents pages | `toc_channel.html` |
| `rtc_` | Overview pages | `rtc_api_overview.html` |

## Output Format

The tool generates pure markdown files with:

- **Frontmatter**: Title and description
- **Code blocks**: With language hints (java, cpp, etc.)
- **Definition lists**: Rendered as headings with descriptions
- **Tables**: For parameters and enum values
- **Notes/Admonitions**: Using `:::` syntax
- **Links**: Properly resolved to internal routes

### Example Output

```markdown
---
title: "VideoCanvas"
description: "用于设置视频画布的显示、渲染和布局属性。"
---

```java
public class VideoCanvas {
  public int uid;
  public View view;
  public int renderMode;
}
```

## 属性

### `uid`

发布视频源的用户 ID。

### `view`

用于显示视频的视图窗口。

:::info[注]
在一个 VideoCanvas 中只能设置 view 或 surfaceTexture。
:::
```

## Comparison with Existing Migration Scripts

| Script | Scope | Status |
|--------|-------|--------|
| `migrate-rtc-android-api-reference.mjs` | RTC Android only | ✅ Already migrated (507 files) |
| `migrate-video-calling.mjs` | Video calling docs | ✅ Already migrated |
| `migrate-cloud-recording.mjs` | Cloud recording | ✅ Already migrated |
| `migrate-on-premise-recording.mjs` | On-premise recording | ✅ Already migrated |
| **`html-to-md-migration.mjs`** | **Reusable only for DITA-OT `API/` exports** | **New** |

This script can help with future DITA-OT `API/` exports. It does not replace product-specific scripts for non-DITA source structures.

## Technical Details

### Architecture

The tool uses:
- **cheerio**: HTML parsing
- **Recursive rendering**: Handles nested articles and sections
- **Route resolution**: Converts HTML links to internal markdown links

### Key Functions

- `parseTocTree()`: Parses the sidebar/TOC from `index.html`
- `renderPage()`: Renders a single HTML page to markdown
- `renderNestedArticle()`: Handles nested article structures
- `renderDefinitionList()`: Converts `<dl>` to markdown headings
- `renderTable()`: Converts `<table>` to markdown tables

## Troubleshooting

### No index.html found

If the source directory has no `index.html`, the tool will process all HTML files in the `API/` subdirectory as a flat structure.

### Unsupported source structure

If the source directory does not contain `API/*.html`, the tool exits before conversion and prints the detected lane, markers, supported source shape, and suggested migration lane. Point `--source` at the directory that contains `API/`, or use a converter for the detected generator.

### Links not resolving

If links point to external URLs, they're preserved as-is. Internal links are resolved based on the TOC structure.

### Missing content

Some HTML files may have complex structures that don't render perfectly. Use `--verbose` to see which files are being processed.
