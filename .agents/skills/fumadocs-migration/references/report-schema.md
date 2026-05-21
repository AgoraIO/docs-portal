# Audit Report Schema

The audit script writes JSON and Markdown. JSON is the source of truth; Markdown is for review.

## JSON Shape

```json
{
  "sourceRoot": "/absolute/path",
  "generatedAt": "2026-05-21T00:00:00.000Z",
  "summary": {
    "markdownFiles": 0,
    "metadataFiles": 0,
    "htmlDocFiles": 0,
    "openapiSources": 0,
    "filesWithLegacyJsx": 0,
    "filesWithSharedImports": 0,
    "filesWithLegacyAnchors": 0,
    "deferredItems": 0
  },
  "files": [
    {
      "path": "docs/product/page.mdx",
      "kind": "mdx",
      "statuses": ["needs-directive-rewrite"],
      "matches": {
        "components": { "Admonition": 2 },
        "sharedImports": 1,
        "legacyAnchors": 0
      }
    }
  ],
  "deferred": [
    {
      "path": "html-docs/rtc/Android/API/index.html",
      "kind": "generated-api",
      "product": "rtc",
      "platform": "Android",
      "status": "deferred-generated-api",
      "generatorHint": "doxygen-or-dita"
    }
  ]
}
```

## Statuses

- `ready-native`: no obvious legacy syntax detected.
- `needs-directive-rewrite`: old callouts, tabs, cards, or other JSX should become directives/native syntax.
- `needs-include-standardization`: legacy `@shared` import or shared runtime variable found.
- `needs-platform-expansion`: runtime platform filtering or filename/platform matrix needs static expansion.
- `needs-table-normalization`: legacy table components found.
- `needs-image-standard`: image width, inline images, or old image component found.
- `needs-api-reference-source`: hand-authored or generated-looking API reference MDX needs structured source decision.
- `has-openapi-source`: OpenAPI YAML/JSON source found.
- `deferred-generated-api`: generated HTML/API artifact intentionally deferred.
- `needs-source-discovery`: generated API artifact exists but source/generator is unknown.
- `manual-html-review`: HTML appears hand-authored or cannot be classified.
- `needs-landing-page-normalization`: landing/card-heavy MDX needs IA/content rewrite.
- `needs-metadata-migration`: legacy executable sidebar/product/platform metadata found.
- `needs-anchor-normalization`: legacy anchor or JSX heading IDs found.
- `needs-frontmatter-cleanup`: legacy build-injected frontmatter or variables found.

## Review Rule

A migration batch is not complete just because the app builds. The report must have no unclassified files, and every deferred item must be accepted, assigned to an API reference lane, or tracked as follow-up work.
