# zh-CN Product IA Standard

## Goal

Use one predictable product-level IA for zh-CN product docs. Product sidebars should answer four user intents:

- Understand the product.
- Run the fastest viable first flow.
- Build real product capabilities.
- Look up stable reference information.

## Product Root Structure

Each product root should expose only these first-level entries in `meta.json`:

| Slug | Chinese title | Purpose |
| --- | --- | --- |
| `index` | `XX 概览` | Explain what the product is, who it is for, core capabilities, and key next steps. |
| `get-started` | `快速开始` | Keep only 1-3 highest-priority first-run entries, such as running a demo, integrating the smallest usable feature, or enabling the service when it is part of the first-run path. |
| `build` | `构建功能` | Task-oriented implementation docs. This is where most legacy `basic-features`, `advanced-features`, `user-guides`, and `best-practices` content should move. |
| `reference` | `参考` | Lookup material: release notes, APIs, errors, response codes, quotas, pricing, service limits, security, downloads, compatibility, and Webhook event lists. |

Root `meta.json` should use stable English slugs and Chinese labels:

```json
{
  "title": "产品名",
  "navScope": {},
  "sidebarIndexTitle": "产品名概览",
  "pages": ["index", "get-started", "build", "reference"]
}
```

## Slug Rules

- Use English lowercase kebab-case slugs.
- Use `get-started` for the folder and `quick-start` for a quickstart page when the Chinese product already follows zh-CN legacy naming. Do not introduce a new `quickstart` folder in zh-CN.
- Use `build` and `reference` as fixed product-level folder slugs.
- Do not use `overview`, `basic-features`, `advanced-features`, `user-guides`, `best-practices`, `api`, or `webhook` as product-level folders in the normalized IA.
- Nested build folders should be action or workflow based, for example `start-transcribing-and-translating`, `process-transcription-data`, or `extend-and-optimize`.
- Reference pages should use direct lookup nouns, for example `release-notes`, `billing`, `response-code`, `supported-languages`, and `ncs-events`.

## Content Ownership

### `index`

Use for product overview only. It should cover the product definition, target users, core capabilities, high-value use cases, and links into the next steps. It should not become a second copy of quickstart, reference, or card-heavy landing content.

### `get-started`

Use for the fastest successful first run. Keep it small. A product can include:

- Run a demo.
- Complete the minimal integration.
- Enable the service only when the user cannot complete the first run without it.

Do not put every prerequisite, account setup page, reference table, or best-practice article here.

### `build`

Use for task-oriented implementation. Typical content:

- Implement audio, video, recording, messaging, transcription, translation, authentication, Webhook receiving, or plugin integration.
- Configure quality, reliability, security behavior, and runtime optimization.
- Best practices that tell the user how to build or operate a feature.

Legacy zh-CN folders usually map as follows:

| Legacy folder | Normalized destination |
| --- | --- |
| `basic-features` | `build` |
| `advanced-features` | `build` |
| `user-guides` | `build` |
| `best-practices` | `build` |
| `webhook/receive-*` | `build` |

### `reference`

Use for lookup and stable facts. Typical content:

- `release-notes`
- API entry pages, response codes, error codes, and event lists.
- Billing, quotas, service limits, supported regions, supported languages, compatibility, downloads, and security.
- Webhook event list pages such as `ncs-events`.

## Migration Rule

When moving an existing product to this IA, add route redirects from the old product paths to the new paths. Do not leave old folders visible as hidden sidebar entries unless a route must remain temporarily for platform routing or migration tooling.

## Pilot Product

Use `content/docs/zh-CN/realtime-media/speech-to-text` as the pilot because it contains all relevant content types but is small enough to review:

- `overview/product-overview` becomes the product `index`.
- `get-started/quick-start` remains under `get-started`.
- `user-guides`, `best-practices`, and Webhook receiving docs move under `build`.
- Release notes, billing, supported languages, response codes, and Webhook event lists move under `reference`.
