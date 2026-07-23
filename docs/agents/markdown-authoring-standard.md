# Markdown Authoring Standard

This is the minimum syntax contract for authoring and migrating docs under
`content/docs/{en,zh-CN}`. Keep it small and copyable. Prefer standard Markdown
first; use MDX only for the repo-approved primitives listed here.

## Core Rules

- Put a blank line before and after every block element: headings, lists,
  callouts, code fences, tabs, platform blocks, tables, and images.
- Keep block delimiters aligned with the block they belong to. If a block is
  nested in a list item, align every line of that block to the list content
  column.
- Prefer Markdown-native syntax. Do not keep legacy Docusaurus JSX, raw HTML
  lists, raw `<img>` tags, custom tab components, or platform filters.
- Escape literal `<`, `>`, `{`, and `}` outside code spans or code fences when
  they are text, not MDX syntax.
- Use a code language listed in `source.config.ts`. If no better language
  exists, use `text` for plain output.

## Callouts

Use directive callouts with exactly three colons. The opening and closing
fences must use the same indentation level.

```mdx
:::note[Token expiry]
Tokens expire after 24 hours. Generate a new token before the old one expires.
:::
```

Use only these callout types: `note`, `info`, `tip`, `caution`, `warning`, and
`error`.

Keep the source severity instead of choosing a type from body wording:

- Use `note` for neutral side information, `info` for emphasized context, and
  `tip` for recommendations.
- Use `caution` for precautions or constraints that require attention before
  proceeding. Legacy HTML `alert alert-warning`, `alert warning`,
  `note attention`, and `note caution` blocks map here.
- Use `warning` when the source explicitly uses a warning admonition or a
  standalone warning class. Use `error` for danger or error blocks.
- Do not infer callout severity from labels such as “注意” or “警告” when the
  source provides a semantic class.

Do not use four-colon fences or nested callouts. If you need two notices, write
two consecutive callouts instead.

```mdx
:::warning
Check both conditions before continuing.
:::

:::note
Generate a new token before retrying the request.
:::
```

Inside a list item, align the full callout to the list content column. For
`1. Text`, that means the `:::` fence starts in the same column as `Text`.

```mdx
1. Configure the project.

   :::note
   Keep the App ID and App Certificate available.
   :::

2. Generate a token.
```

Do not mix indentation, close the directive at a different level, or use `::::`.

## Code Blocks

Use fenced code blocks with a language.

````mdx
```bash
npm install agora-rtc-sdk-ng
```
````

For plain code fences, use only these optional metadata fields: `title` and
`lineNumbers`.

````mdx
```ts title="client.ts" lineNumbers
const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
```
````

For code tabs, use only `tab` and optional `tabGroup`. When code blocks are
alternatives for the same step, keep the fences consecutive and add `tab`. Use
the same `tabGroup` when multiple tab sets on the page should share one
selection.

````mdx
```bash tab="npm" tabGroup="package-manager"
npm install agora-rtc-sdk-ng
```

```bash tab="pnpm" tabGroup="package-manager"
pnpm add agora-rtc-sdk-ng
```

```bash tab="bun" tabGroup="package-manager"
bun add agora-rtc-sdk-ng
```
````

Rules:

- Keep all fences in one tab group adjacent. Only blank lines may appear between
  them.
- If two code blocks are sequential steps, not alternatives, separate them with
  prose or a heading instead of `tab` metadata.

## Tabs

For code-only alternatives, use code fence tabs. Use MDX tabs only when a pane
contains mixed prose, lists, images, or multiple code blocks.

````mdx
<Tabs defaultValue="macos" groupId="install-os" persist>
<TabsList>
  <TabsTrigger value="macos">macOS</TabsTrigger>
  <TabsTrigger value="windows">Windows</TabsTrigger>
</TabsList>

<TabsContent value="macos">

Run the installer from Terminal.

```bash
brew install agora-cli
```

</TabsContent>

<TabsContent value="windows">

Run the installer from PowerShell.

```text
winget install Agora.CLI
```

</TabsContent>
</Tabs>
````

Rules:

- Every `TabsTrigger value` must have exactly one matching `TabsContent value`.
- Keep blank lines inside `TabsContent` before nested Markdown blocks.
- Keep the `Tabs`, `TabsList`, `TabsTrigger`, and `TabsContent` tags at column
  0.
- Do not nest tabs inside lists, callouts, tables, or platform blocks.
- Do not invent `PlatformTabs`, `CodeTabs`, or Docusaurus `TabItem` syntax.

## Platform Variants

Prefer separate files or folders when the whole page differs by platform. When
one page intentionally mixes shared prose with platform-specific blocks, use
the repo's platform blocks as consecutive top-level siblings.

```mdx
Shared setup note.

<PlatformStructured platform="android">

### Install on Android

Use Gradle to add the SDK.

</PlatformStructured>

<PlatformStructured platform="ios">

### Install on iOS

Use CocoaPods to add the SDK.

</PlatformStructured>

Shared follow-up note.
```

Use `PlatformInline` only for short platform-specific paragraphs.

```mdx
<PlatformInline platform="android">
Use Android Studio to open the sample project.
</PlatformInline>

<PlatformInline platform="ios">
Use Xcode to open the sample project.
</PlatformInline>
```

Rules:

- Platform blocks must be top-level page flow. Do not nest them inside lists,
  blockquotes, callouts, tables, tabs, or other platform blocks.
- Start every `<PlatformStructured>` and `<PlatformInline>` tag at column 0.
- Use platform blocks only for two or more consecutive platform alternatives.
  If there is only one platform, write normal Markdown.
- Do not duplicate the same platform key in one consecutive group.
- Use platform keys from `src/lib/platforms/registry.ts`.

## Lists With Nested Content

If a list item contains an image, paragraph, callout, code block, table, or
another list, align every line of that nested block to the list content column
and keep a blank line before it. Do not use a fixed four-space rule:

- `- Text` continues with two spaces.
- `1. Text` continues with three spaces.
- `10. Text` continues with four spaces.

````mdx
1. Open the project settings.

   ![Project settings](./assets/project-settings.png)

   :::note
   The App ID is visible only to project members.
   :::

   ```bash
   agora project list
   ```

2. Copy the App ID.
````

Do not outdent nested media or code unless the list item is finished. Do not
indent it past the list content column.

## Images

Use Markdown image syntax.

```mdx
![Console project settings](./assets/project-settings.png)
```

Rules:

- Put images on their own line with a blank line before and after.
- Use meaningful alt text that describes the UI or state shown.
- If the image belongs to a list item, indent the image line and its surrounding
  blank lines to the list content column.
- Do not use raw `<img>` tags in docs content.

## Tables

Use GFM tables only for simple, inline cell content.

```mdx
| Parameter | Type | Description |
| --- | --- | --- |
| `uid` | string | User ID. |
| `token` | string | Token used to authenticate the request. |
```

Rules:

- Do not put lists, callouts, code fences, images, or raw HTML lists inside a
  table cell.
- If a cell needs block content, move that content below the table under a
  heading or list item, or use the approved table `Slot` pattern when preserving
  the tabular shape matters.
- For table slots, put `<Slot name="..." />` alone in the table cell, then put
  the matching `<Slot for="...">...</Slot>` block immediately after the table.
- Keep table rows single-line whenever possible.

## Agent Checklist

Before finishing a docs content change, scan for these issues:

- Unclosed or misaligned `:::` fences.
- Consecutive code blocks that should be code tabs, or code tabs split by prose.
- `PlatformStructured` or `PlatformInline` nested below top-level page flow.
- Images, callouts, or code blocks after a list marker that are not aligned to
  the list content column.
- Block syntax inside table cells.
- Legacy JSX or raw HTML that should be Markdown, directive, tabs, or platform
  blocks.

For substantial `content/docs` edits, run `bun run types:check` before handoff.
