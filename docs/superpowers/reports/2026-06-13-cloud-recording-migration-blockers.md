# Cloud Recording migration blockers

## Deferred content

### get-started/mcp.mdx
- Source path: `get-started/mcp.mdx`
- Current flow: `complex`
- Blocker type: `deferred content`
- Exact failing pattern: AI tooling lane (MCP)
- Attempted adaptation: Classified lane and page scope before final-tree writing; no promotion attempted because the page is explicitly out of scope.
- Completed mandatory resolution attempts: audit, classify
- Why promotion was blocked: AI tooling or ecosystem page is outside the current migration scope.
- Next missing rule, tool, or compatibility contract: None in this batch; keep item deferred until the excluded lane or missing compatibility rule is in scope.

### get-started/skills.mdx
- Source path: `get-started/skills.mdx`
- Current flow: `complex`
- Blocker type: `deferred content`
- Exact failing pattern: AI tooling lane (skills)
- Attempted adaptation: Classified lane and page scope before final-tree writing; no promotion attempted because the page is explicitly out of scope.
- Completed mandatory resolution attempts: audit, classify
- Why promotion was blocked: AI tooling or ecosystem page is outside the current migration scope.
- Next missing rule, tool, or compatibility contract: None in this batch; keep item deferred until the excluded lane or missing compatibility rule is in scope.

### reference/rest-api-overview.md
- Source path: `reference/rest-api-overview.md`
- Current flow: `complex`
- Blocker type: `deferred content`
- Exact failing pattern: REST callback reference page
- Attempted adaptation: Classified lane and page scope before final-tree writing; no promotion attempted because the page is explicitly out of scope.
- Completed mandatory resolution attempts: audit, classify
- Why promotion was blocked: REST/API lane is explicitly excluded from this migration batch.
- Next missing rule, tool, or compatibility contract: None in this batch; keep item deferred until the excluded lane or missing compatibility rule is in scope.

### reference/restful-api.mdx
- Source path: `reference/restful-api.mdx`
- Current flow: `complex`
- Blocker type: `deferred content`
- Exact failing pattern: RESTful API reference page
- Attempted adaptation: Classified lane and page scope before final-tree writing; no promotion attempted because the page is explicitly out of scope.
- Completed mandatory resolution attempts: audit, classify
- Why promotion was blocked: REST/API lane is explicitly excluded from this migration batch.
- Next missing rule, tool, or compatibility contract: None in this batch; keep item deferred until the excluded lane or missing compatibility rule is in scope.

### reference/restful-authentication.mdx
- Source path: `reference/restful-authentication.mdx`
- Current flow: `complex`
- Blocker type: `deferred content`
- Exact failing pattern: REST authentication reference page
- Attempted adaptation: Classified lane and page scope before final-tree writing; no promotion attempted because the page is explicitly out of scope.
- Completed mandatory resolution attempts: audit, classify
- Why promotion was blocked: REST/API lane is explicitly excluded from this migration batch.
- Next missing rule, tool, or compatibility contract: None in this batch; keep item deferred until the excluded lane or missing compatibility rule is in scope.

### develop/authentication-workflow.mdx
- Source path: `develop/authentication-workflow.mdx`
- Intended target path: `build/authentication-workflow.mdx`
- Current flow: `complex`
- Blocker type: `deferred content`
- Exact failing pattern: /<Admonition\b/
- Attempted adaptation: Expanded shared imports, variables, admonitions, tabs, details, links, anchors, and image references, then staged output for verification.
- Completed mandatory resolution attempts: audit, classify, expand, extract, normalize, stage, page-verify
- Why promotion was blocked: Normalized staging output still contains legacy runtime syntax or unresolved compatibility residue.
- Next missing rule, tool, or compatibility contract: None in this batch; keep item deferred until the excluded lane or missing compatibility rule is in scope.

## Repository anomaly

None.
