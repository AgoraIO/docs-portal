# Task Plan

## Goal

Migrate the source-backed Cloud Recording RESTful API docs from `Doc-Source-Private` into the `docs-portal` OpenAPI rendering pipeline.

## Completion Criteria

- `$PORTAL` and `$SOURCE` are located by repository features, not hard-coded assumptions.
- Cloud Recording REST endpoint content exists only in one OpenAPI YAML file under `content/openapi/`.
- The Cloud Recording API reference lands under the same API Reference level as Signaling: `api-reference/api-ref/cloud-recording`.
- Authored parent pages contain only overview/authentication prose and links to virtual endpoint leaves.
- Catalog/reference entry links to the new authored parent page.
- `src/lib/openapi` tests pass.
- OpenAPI YAML validates with `@apidevtools/swagger-parser`.
- `scripts/sync-openapi-assets.mjs` copies the new YAML to `public/openapi`.
- Consistency check passes: YAML `operationId` values match lane operation keys, and lane `routeLeaf` values match endpoint leaves in `meta.json`.

## Phases

| Phase | Status | Notes |
| --- | --- | --- |
| 1. Environment self-check | complete | `$PORTAL`, `$SOURCE`, package manager, and pipeline files located. |
| 2. Source inspection | complete | Endpoint source is `cloud-recording/reference/restful-api.mdx`; overview/auth pages identified. |
| 3. OpenAPI YAML authoring | complete | Added `content/openapi/cloud-recording/cloud-recording.en.yaml` with 7 endpoints. |
| 4. Portal registration | complete | Registered `cloud-recording-rest` lane and bundled source text. |
| 5. Authored docs and catalog | complete | Added parent/auth/meta pages and updated catalog/product reference links. |
| 6. Tests and verification | complete | YAML validation, asset sync, targeted tests, and consistency check passed. |

## Constraints

- REST endpoint content must live only in OpenAPI YAML.
- Do not create `.md` or `.mdx` shadow pages for endpoint leaves.
- Use the existing Signaling REST route as the destination pattern.
- Preserve unrelated worktree changes if any appear.

## Errors Encountered

| Error | Attempt | Resolution |
| --- | --- | --- |
| Initial plan files described a previous Conversion AI task | 1 | Replaced them with the current Cloud Recording migration state. |
| YAML parser rejected unquoted descriptions with colons | 1 | Quoted the affected `description` values and reran validation. |
| Meta endpoint order differed from lane route order | 1 | Reordered Cloud Recording meta endpoint leaves to match lane route leaves. |
