# Findings

## 2026-06-23

- User asked to migrate Cloud Recording RESTful API docs from source MDX into the `docs-portal` OpenAPI rendering pipeline.
- Located candidate `$PORTAL`: `/Users/yangyixuan/Documents/GitHub/docs-portal`, confirmed by `content/openapi/` and `src/lib/openapi/lanes.ts`.
- Located candidate `$SOURCE`: `/Users/yangyixuan/Documents/GitHub/Doc-Source-Private`.
- `docs-portal` has `bun.lock`, so targeted commands should use `bun`/`bunx` unless a script explicitly runs `node`.
- The source Cloud Recording REST API is a single endpoint reference file at `cloud-recording/reference/restful-api.mdx`, not a `cloud-recording/rest-api/` directory.
- Cloud Recording source also has authored reference pages: `cloud-recording/reference/rest-api-overview.md` and `cloud-recording/reference/restful-authentication.mdx`.
- Identified 7 Cloud Recording REST endpoints: `acquire`, `start`, `update`, `updateLayout`, `query`, `stop`, and `get-ncs-ip`.
- Target landing level should match Signaling under `api-reference/api-ref`, so use `api-reference/api-ref/cloud-recording`.
- Existing `src/lib/docs-page.server.ts` already uses `isOpenApiTab(tab)` for OpenAPI endpoint handling.
- Cloud Recording lane uses one English YAML for both locales:
  - sourcePath: `content/openapi/cloud-recording/cloud-recording.en.yaml`
  - publicSourceUrl: `/openapi/cloud-recording/cloud-recording.en.yaml`
- Required verification passed:
  - `node -e "require('@apidevtools/swagger-parser').validate('content/openapi/cloud-recording/cloud-recording.en.yaml')..."`
  - `node scripts/sync-openapi-assets.mjs`
  - `bunx vitest run src/lib/openapi`
- Consistency check passed: YAML `operationId` values match lane operation keys; lane `routeLeaf` values match Cloud Recording meta endpoint leaves.
