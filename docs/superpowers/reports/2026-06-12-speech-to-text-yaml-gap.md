# Speech-to-Text YAML Gap

## Scope

- Baseline YAML:
  - `/Users/yangyixuan/Documents/GitHub/shengwang-doc-source/html-docs/speech-to-text/RESTful/v7.yaml`
- English resource:
  - `/Users/yangyixuan/Documents/GitHub/Doc-Source-Private/real-time-stt/**`
- Generated OpenAPI files:
  - [v7.yaml](/Users/yangyixuan/Documents/GitHub/docs-portal/content/openapi/speech-to-text/v7.yaml)
  - [v7.zh-CN.yaml](/Users/yangyixuan/Documents/GitHub/docs-portal/content/openapi/speech-to-text/v7.zh-CN.yaml)
  - [v7.en.yaml](/Users/yangyixuan/Documents/GitHub/docs-portal/content/openapi/speech-to-text/v7.en.yaml)

## Summary

- The repo now has a working OpenAPI lane for Speech-to-Text v7.
- The Chinese baseline has been normalized into repo-compatible YAML.
- The English YAML has been partially aligned to the English MDX docs, but it is not fully English yet.
- The biggest remaining gap is field-level description localization inside `v7.en.yaml`.

## Current Status

- Total lines in `v7.en.yaml`: `808`
- Lines still containing Chinese characters: `32`
- Remaining Chinese is concentrated in:
  - tag labels
  - some response descriptions
  - several query parameter descriptions
  - deprecated parameter descriptions
  - examples with Chinese keywords

## Gap Categories

### 1. Language Gap Inside `v7.en.yaml`

The following content is still Chinese in the English YAML and should be translated if English is the source of truth:

- Top-level tag name `实时转录翻译`
- Example keywords such as `声网`, `实时互动`
- Response descriptions like:
  - `如果返回的状态码为 200，表示请求成功`
  - `如果返回的状态码不为 200，请求失败`
- Query parameter descriptions under `GET /agents`
- Deprecated `sequenceId` and `updateMask` descriptions

This means the English YAML is currently usable for rendering, but not yet editorially complete.

### 2. Semantic Gap Between Baseline YAML and English MDX

The English MDX docs use the following English-facing operation naming:

- `join`: Start a Real-Time STT agent
- `query`: Query the task status
- `leave`: Stop a Real-Time STT agent
- `update`: Update task configuration
- `list`: List Real-Time STT agents

The Chinese baseline YAML originally mixed:

- Chinese summaries
- `operationId: get`
- `operationId: get-task-list`

To align with English docs, the repo version now normalizes these to:

- `query`
- `list`

### 3. Server / Path Gap

The Chinese baseline YAML used:

- server: `https://api.sd-rtn.com/cn`

The repo OpenAPI lane now uses repo-compatible public paths and routes:

- public YAML:
  - `/openapi/speech-to-text/v7.en.yaml`
  - `/openapi/speech-to-text/v7.zh-CN.yaml`
- route prefix:
  - `/en/api-reference/speech-to-text/restful/*`
  - `/zh-CN/api-reference/speech-to-text/restful/*`

This is an intentional normalization for portal rendering.

### 4. Coverage Gap: English Product Docs vs YAML Surface

The English product docs cover more than the REST operation surface. These topics exist in English MDX but are not modeled in the v7 YAML:

- Product overview
- Core concepts
- Pricing
- Release notes
- REST quickstart
- Parse transcription data
- Encrypt captions
- Record captions
- Supported languages
- Transcribe specified hosts
- Real-time translation
- Update service
- API callback service
- Best practices
- Firewall
- Common errors
- Migration guides
- Security

This is expected, because YAML only describes the API surface, not the whole product IA.

### 5. Documentation-Link Gap

Some links in `v7.en.yaml` still point to legacy or non-portal sources conceptually, even after normalization work:

- `Supported languages`
- `third-party storage regions`
- `Token authentication`
- related cloud-recording references

These links are technically usable, but they are not yet fully aligned with the final portal-local English doc URLs everywhere.

## High-Priority Fixes

If we continue improving the YAML, the highest-signal next steps are:

1. Translate the remaining `32` Chinese lines in `v7.en.yaml`.
2. Replace Chinese example keywords in the English YAML with English examples.
3. Align all cross-doc links in `v7.en.yaml` to final portal English routes where available.
4. Decide whether `v7.yaml` should remain Chinese-canonical or become locale-neutral.

## Recommended Direction

- Keep `v7.zh-CN.yaml` as the Chinese baseline-derived source.
- Keep `v7.en.yaml` as the English portal-facing localized source.
- Treat English MDX as the editorial authority for:
  - operation names
  - summaries
  - user-facing descriptions
  - cross-links
- Do not try to force non-API product docs into YAML; keep them as docs pages.
