# Findings

## 2026-06-26

- User requested a Golden Master / Characterization Testing audit of RESTful API Reference migration completeness from the legacy English Agora docs site to `docs-portal`.
- Legacy public site root: `https://docs.agora.io/en/`.
- Skill-documented private source root `/Users/czhen/Documents/GitHub/AgoraIO/Doc-Source-Private` is not present in this environment.
- Prior local migration notes and current filesystem indicate the private source root is `/Users/yangyixuan/Documents/GitHub/Doc-Source-Private`; this still needs directory verification.
- Target tree for migrated API Reference pages: `content/docs/en/api-reference/api-ref`.
- Audit must explicitly handle legacy voice/video split RESTful pages that may be merged in the new portal.

