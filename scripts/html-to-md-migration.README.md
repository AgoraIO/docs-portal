# HTML-to-Markdown Migration Tool

A unified script for converting DITA-OT (Oxygen XML) generated HTML API reference docs to pure markdown files suitable for the docs-portal project.

## Overview

The old Chinese documentation site (`shengwang-doc-source`) used DITA-OT/Oxygen XML to generate HTML API references. This tool converts those HTML files to clean markdown that can be used in the new docs-portal.

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
| `--source, -s` | Source directory containing HTML docs | `/path/to/html-docs/rtc/Android` |
| `--output, -o` | Output directory for markdown files | `content/docs/zh-CN/api-reference/rtc/android` |
| `--product, -p` | Product name | `rtc`, `signaling`, `cloud-recording` |
| `--platform, -P` | Platform name | `android`, `ios`, `web`, `RESTful` |

### Optional Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `--locale, -l` | Locale for output | `zh-CN` |
| `--route-base-path, -r` | Base path for links | `/api-reference` |
| `--version-dir, -V` | Version directory name | - |
| `--dry-run, -d` | Preview without writing files | `false` |
| `--verbose, -v` | Show detailed output | `false` |

## Examples

### RTC Android

```bash
node scripts/html-to-md-migration.mjs \
  --source /Users/czhen/Documents/GitHub/AgoraIO/shengwang-doc-source/html-docs/rtc/Android \
  --output content/docs/zh-CN/api-reference/rtc/android \
  --product rtc \
  --platform android
```

### Signaling iOS

```bash
node scripts/html-to-md-migration.mjs \
  --source /Users/czhen/Documents/GitHub/AgoraIO/shengwang-doc-source/html-docs/signaling/iOS \
  --output content/docs/zh-CN/api-reference/signaling/ios \
  --product signaling \
  --platform ios
```

### Dry Run (Preview)

```bash
node scripts/html-to-md-migration.mjs \
  --source /path/to/html-docs/rtc/Android \
  --output /tmp/test-output \
  --product rtc \
  --platform android \
  --dry-run
```

## Supported HTML File Types

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

## Available Products and Platforms

Run the following to see all available products and platforms:

```bash
find /Users/czhen/Documents/GitHub/AgoraIO/shengwang-doc-source/html-docs/ -mindepth 1 -maxdepth 1 -type d | while read dir; do
  product=$(basename "$dir")
  platforms=$(find "$dir" -mindepth 1 -maxdepth 1 -type d | while read p; do basename "$p"; done | tr '\n' ', ')
  echo "$product: $platforms"
done
```

## Comparison with Existing Migration Scripts

| Script | Scope | Status |
|--------|-------|--------|
| `migrate-rtc-android-api-reference.mjs` | RTC Android only | ✅ Already migrated (507 files) |
| `migrate-video-calling.mjs` | Video calling docs | ✅ Already migrated |
| `migrate-cloud-recording.mjs` | Cloud recording | ✅ Already migrated |
| `migrate-on-premise-recording.mjs` | On-premise recording | ✅ Already migrated |
| **`html-to-md-migration.mjs`** | **Unified, all products** | **🆕 New** |

The new unified script can replace the product-specific scripts for future migrations.

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

### Links not resolving

If links point to external URLs, they're preserved as-is. Internal links are resolved based on the TOC structure.

### Missing content

Some HTML files may have complex structures that don't render perfectly. Use `--verbose` to see which files are being processed.
