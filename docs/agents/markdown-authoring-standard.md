# Markdown Authoring Standard

This is the minimum syntax contract for authoring and migrating docs under
`content/docs/{en,zh-CN}`. Keep it small and copyable. Prefer standard Markdown
first; use MDX only for the repo-approved primitives listed here.

## Core Rules

- Put a blank line before and after every block element: headings, lists,
  callouts, code fences, tabs, accordions, platform blocks, tables, and images.
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

Use only these callout types: `note`, `info`, `tip`, `warning`, and `error`.

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
- Do not nest tabs inside lists, callouts, or tables.
- Tabs inside a platform block are allowed only for subordinate variants, such
  as the Android and iOS host operating systems of one React Native SDK page.
  Give these tabs a distinct `groupId`; they must not reuse or replace the
  page-level SDK platform preference.
- Do not invent `PlatformTabs`, `CodeTabs`, or Docusaurus `TabItem` syntax.

## Accordions

Use `<Accordions>` and `<Accordion>` for collapsible content. For a version
history, use `type="multiple"` so readers can compare releases, and `openFirst`
to open the first version in the source when the page or platform changes.
Keep version heading anchors needed by historical links in `id`; set
`headingLevel` to the level of the heading it replaces and give each version a
unique `value`.

```mdx
### Versions [#versions]

<Accordions type="multiple" openFirst>

<Accordion title="v4.24.8" id="v4248" headingLevel={3} value="v4248">

Released on August 31, 2026.

</Accordion>

<Accordion title="v4.24.7" id="v4247" headingLevel={3} value="v4247">

Released on August 3, 2026.

</Accordion>

</Accordions>
```

Rules:

- Keep accordion tags at column 0, with blank lines around Markdown blocks
  inside each `<Accordion>`. Close each accordion before starting the next.
- Use `openFirst` for a version history instead of hard-coding a release in
  `defaultValue`. Preserve version IDs and any enclosing `<section id="...">`
  needed by historical links. Section heading anchors may change intentionally
  when renaming the section.
- For other collapsible content, omit `headingLevel` and `openFirst` unless it
  is a navigable version history. Use plain headings and prose when content
  does not need to collapse.
- When the Web release notes need spacing between known issues and the version
  histories, a top-level `<div className="mt-10 pt-8">` may wrap the Versions
  and Extensions sections. Close it before Notifications; use Markdown for
  the content inside. This is a layout exception, not a general-purpose raw
  HTML pattern.

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

When a note is intentionally a standalone callout between list items, close
the preceding item with a blank line and put both the callout fences and its
body at column 0. Do not indent only the fences: the body may render outside
the callout. This pattern is used by the Unreal release notes.

```mdx
1. **Wildcard token**

   Wildcard tokens work across channels.

:::info[Note]
All 4.x SDKs support using wildcard tokens.
:::

1. **Preloading channels**

   Preloading reduces join time.
```

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
  heading or list item.
- Keep table rows single-line whenever possible.

## Agent Checklist

Before finishing a docs content change, scan for these issues:

- Unclosed or misaligned `:::` fences.
- Consecutive code blocks that should be code tabs, or code tabs split by prose.
- Accordion tags that are unclosed, nested in lists, or missing version anchors.
- `PlatformStructured` or `PlatformInline` nested below top-level page flow.
- Images, callouts, or code blocks after a list marker that are not aligned to
  the list content column.
- Block syntax inside table cells.
- Legacy JSX or raw HTML that should be Markdown, directive, tabs, or platform
  blocks.

For substantial `content/docs` edits, run `bun run types:check` before handoff.
