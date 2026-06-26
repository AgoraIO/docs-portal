# Task Plan

## Goal

Audit RESTful API Reference migration completeness from the legacy English Agora docs site and `Doc-Source-Private` into the new `docs-portal` API Reference tree using Golden Master / Characterization Testing.

## Completion Criteria

- Legacy RESTful API Reference HTML pages are discovered from the old English site and mapped to source files in `Doc-Source-Private`.
- New corresponding pages under `content/docs/en/api-reference/api-ref` and OpenAPI sources under `content/openapi` are identified.
- Voice/video split legacy pages are mapped to merged new pages where applicable.
- Legacy rendered HTML is compared against new rendered HTML/MDX/OpenAPI-rendered content for endpoints, methods, parameters, responses, errors, examples, prose, navigation, and anchors.
- A migration completeness matrix is produced with old page/source, new page/source, module, status, evidence, and suggested fix location.
- RESTful API gaps and manual-confirmation items are prioritized with reproducible paths, URLs, or snippets.

## Phases

| Phase | Status | Notes |
| --- | --- | --- |
| 1. Environment and source discovery | in_progress | Locate old source root, target IA, render/test tools, and existing OpenAPI lanes. |
| 2. Legacy REST page inventory | pending | Discover old English RESTful API reference pages, URLs, nav hierarchy, and source files. |
| 3. Target page inventory | pending | Discover new `api-reference/api-ref` pages, MDX pages, OpenAPI YAML, lane route leaves, and nav metadata. |
| 4. Mapping construction | pending | Build old-to-new mapping including voice/video-to-merged targets. |
| 5. Golden Master extraction | pending | Extract comparable signatures from old HTML/source and new rendered content/source. |
| 6. Gap classification | pending | Classify complete, suspicious, missing, or manual-confirmation cases with evidence. |
| 7. Report delivery | pending | Produce matrix and prioritized RESTful API action list. |

## Constraints

- Do not edit product documentation unless the user later asks for fixes.
- Prefer primary sources: old Agora docs pages, `Doc-Source-Private`, and local `docs-portal` content/OpenAPI sources.
- Preserve unrelated worktree changes.
- Use structured parsers for HTML, MDX, YAML, and OpenAPI where practical.

## Errors Encountered

| Error | Attempt | Resolution |
| --- | --- | --- |
| Skill path `/Users/czhen/Documents/GitHub/AgoraIO/Doc-Source-Private` did not exist locally | 1 | Use existing local source root recorded by prior work: `/Users/yangyixuan/Documents/GitHub/Doc-Source-Private`; verify by repository contents. |
