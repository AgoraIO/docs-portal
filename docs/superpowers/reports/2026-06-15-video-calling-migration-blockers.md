# Video Calling migration blockers

## Deferred content

### get-started/mcp.mdx
- Source path: `get-started/mcp.mdx`
- Current flow: `complex`
- Blocker type: `deferred content`
- Exact failing pattern: AI tooling lane (MCP)
- Attempted adaptation: Classified lane and page scope before final-tree writing; no promotion attempted because the page is explicitly out of scope.
- Completed mandatory resolution attempts: audit, classify
- Why promotion was blocked: AI tooling or ecosystem page is outside the current migration scope.
- Next missing rule, tool, or compatibility contract: keep deferred until the excluded lane or missing normalization rule is in scope.

### get-started/skills.mdx
- Source path: `get-started/skills.mdx`
- Current flow: `complex`
- Blocker type: `deferred content`
- Exact failing pattern: AI tooling lane (skills)
- Attempted adaptation: Classified lane and page scope before final-tree writing; no promotion attempted because the page is explicitly out of scope.
- Completed mandatory resolution attempts: audit, classify
- Why promotion was blocked: AI tooling or ecosystem page is outside the current migration scope.
- Next missing rule, tool, or compatibility contract: keep deferred until the excluded lane or missing normalization rule is in scope.

### channel-management-api/overview.mdx
- Source path: `channel-management-api/overview.mdx`
- Current flow: `complex`
- Blocker type: `deferred content`
- Exact failing pattern: REST/API overview lane
- Attempted adaptation: Classified lane and page scope before final-tree writing; no promotion attempted because the page is explicitly out of scope.
- Completed mandatory resolution attempts: audit, classify
- Why promotion was blocked: REST/API lane is explicitly excluded from this migration batch.
- Next missing rule, tool, or compatibility contract: keep deferred until the excluded lane or missing normalization rule is in scope.

### channel-management-api
- Source path: `channel-management-api`
- Current flow: `complex`
- Blocker type: `deferred content`
- Exact failing pattern: channel-management-api/**
- Attempted adaptation: Classified lane and page scope before final-tree writing; no promotion attempted because the page is explicitly out of scope.
- Completed mandatory resolution attempts: audit, classify
- Why promotion was blocked: REST/API lane is explicitly excluded from this migration batch.
- Next missing rule, tool, or compatibility contract: keep deferred until the excluded lane or missing normalization rule is in scope.

### get-started/manage-agora-account.mdx
- Source path: `get-started/manage-agora-account.mdx`
- Intended target path: `manage-agora-account.mdx`
- Current flow: `complex`
- Blocker type: `deferred content`
- Exact failing pattern: unknown-platform:_sign-in-and-sign-up, unknown-platform:_signaling-features
- Attempted adaptation: Expanded shared imports, product wrappers, variables, tabs, admonitions, details, links, and image references, then staged output for verification.
- Completed mandatory resolution attempts: audit, classify, expand, extract, normalize, stage, page-verify
- Why promotion was blocked: Normalized staging output still contains legacy runtime syntax or unresolved compatibility residue.
- Next missing rule, tool, or compatibility contract: keep deferred until the excluded lane or missing normalization rule is in scope.

### overview/account-settlement.mdx
- Source path: `overview/account-settlement.mdx`
- Intended target path: `account-settlement.mdx`
- Current flow: `complex`
- Blocker type: `deferred content`
- Exact failing pattern: unknown-platform:_account-settlement, single-platform-structured-run
- Attempted adaptation: Expanded shared imports, product wrappers, variables, tabs, admonitions, details, links, and image references, then staged output for verification.
- Completed mandatory resolution attempts: audit, classify, expand, extract, normalize, stage, page-verify
- Why promotion was blocked: Normalized staging output still contains legacy runtime syntax or unresolved compatibility residue.
- Next missing rule, tool, or compatibility contract: keep deferred until the excluded lane or missing normalization rule is in scope.

### overview/subscription-packages.mdx
- Source path: `overview/subscription-packages.mdx`
- Intended target path: `subscription-packages.mdx`
- Current flow: `complex`
- Blocker type: `deferred content`
- Exact failing pattern: unknown-platform:_subscription-packages, single-platform-structured-run
- Attempted adaptation: Expanded shared imports, product wrappers, variables, tabs, admonitions, details, links, and image references, then staged output for verification.
- Completed mandatory resolution attempts: audit, classify, expand, extract, normalize, stage, page-verify
- Why promotion was blocked: Normalized staging output still contains legacy runtime syntax or unresolved compatibility residue.
- Next missing rule, tool, or compatibility contract: keep deferred until the excluded lane or missing normalization rule is in scope.

### token-authentication/deploy-token-server.mdx
- Source path: `token-authentication/deploy-token-server.mdx`
- Intended target path: `build/deploy-token-server.mdx`
- Current flow: `complex`
- Blocker type: `deferred content`
- Exact failing pattern: unknown-platform:index, single-platform-structured-run
- Attempted adaptation: Expanded shared imports, product wrappers, variables, tabs, admonitions, details, links, and image references, then staged output for verification.
- Completed mandatory resolution attempts: audit, classify, expand, extract, normalize, stage, page-verify
- Why promotion was blocked: Normalized staging output still contains legacy runtime syntax or unresolved compatibility residue.
- Next missing rule, tool, or compatibility contract: keep deferred until the excluded lane or missing normalization rule is in scope.

### token-authentication/integrate-token-generation.mdx
- Source path: `token-authentication/integrate-token-generation.mdx`
- Intended target path: `build/integrate-token-generation.mdx`
- Current flow: `complex`
- Blocker type: `deferred content`
- Exact failing pattern: unknown-platform:index, single-platform-structured-run
- Attempted adaptation: Expanded shared imports, product wrappers, variables, tabs, admonitions, details, links, and image references, then staged output for verification.
- Completed mandatory resolution attempts: audit, classify, expand, extract, normalize, stage, page-verify
- Why promotion was blocked: Normalized staging output still contains legacy runtime syntax or unresolved compatibility residue.
- Next missing rule, tool, or compatibility contract: keep deferred until the excluded lane or missing normalization rule is in scope.

### overview/core-concepts.mdx
- Source path: `overview/core-concepts.mdx`
- Intended target path: `core-concepts.mdx`
- Current flow: `complex`
- Blocker type: `deferred content`
- Exact failing pattern: unknown-platform:agora-console, unknown-platform:app-certificate, unknown-platform:app-id, unknown-platform:audio-video-concepts, unknown-platform:channel, unknown-platform:channel-profile, unknown-platform:connection, unknown-platform:publish, unknown-platform:sd-rtn, unknown-platform:stream, unknown-platform:subscribe, unknown-platform:token, unknown-platform:user-id, unknown-platform:user-role
- Attempted adaptation: Expanded shared imports, product wrappers, variables, tabs, admonitions, details, links, and image references, then staged output for verification.
- Completed mandatory resolution attempts: audit, classify, expand, extract, normalize, stage, page-verify
- Why promotion was blocked: Normalized staging output still contains legacy runtime syntax or unresolved compatibility residue.
- Next missing rule, tool, or compatibility contract: keep deferred until the excluded lane or missing normalization rule is in scope.

### overview/pricing.mdx
- Source path: `overview/pricing.mdx`
- Intended target path: `reference/pricing.mdx`
- Current flow: `complex`
- Blocker type: `deferred content`
- Exact failing pattern: unknown-platform:_pricing, single-platform-structured-run
- Attempted adaptation: Expanded shared imports, product wrappers, variables, tabs, admonitions, details, links, and image references, then staged output for verification.
- Completed mandatory resolution attempts: audit, classify, expand, extract, normalize, stage, page-verify
- Why promotion was blocked: Normalized staging output still contains legacy runtime syntax or unresolved compatibility residue.
- Next missing rule, tool, or compatibility contract: keep deferred until the excluded lane or missing normalization rule is in scope.

### reference/billing-policies.mdx
- Source path: `reference/billing-policies.mdx`
- Intended target path: `reference/billing-policies.mdx`
- Current flow: `complex`
- Blocker type: `deferred content`
- Exact failing pattern: unknown-platform:_account-settlement, unknown-platform:_end-of-life
- Attempted adaptation: Expanded shared imports, product wrappers, variables, tabs, admonitions, details, links, and image references, then staged output for verification.
- Completed mandatory resolution attempts: audit, classify, expand, extract, normalize, stage, page-verify
- Why promotion was blocked: Normalized staging output still contains legacy runtime syntax or unresolved compatibility residue.
- Next missing rule, tool, or compatibility contract: keep deferred until the excluded lane or missing normalization rule is in scope.

### reference/cloud-proxy-allowed-ips.mdx
- Source path: `reference/cloud-proxy-allowed-ips.mdx`
- Intended target path: `reference/cloud-proxy-allowed-ips.mdx`
- Current flow: `complex`
- Blocker type: `deferred content`
- Exact failing pattern: unknown-platform:_cloud-proxy-allowed-iplist, single-platform-structured-run
- Attempted adaptation: Expanded shared imports, product wrappers, variables, tabs, admonitions, details, links, and image references, then staged output for verification.
- Completed mandatory resolution attempts: audit, classify, expand, extract, normalize, stage, page-verify
- Why promotion was blocked: Normalized staging output still contains legacy runtime syntax or unresolved compatibility residue.
- Next missing rule, tool, or compatibility contract: keep deferred until the excluded lane or missing normalization rule is in scope.

### reference/cloud-proxy-migration-guide.mdx
- Source path: `reference/cloud-proxy-migration-guide.mdx`
- Intended target path: `reference/cloud-proxy-migration-guide.mdx`
- Current flow: `complex`
- Blocker type: `deferred content`
- Exact failing pattern: unknown-platform:_cloud-proxy-migration-guide, single-platform-structured-run
- Attempted adaptation: Expanded shared imports, product wrappers, variables, tabs, admonitions, details, links, and image references, then staged output for verification.
- Completed mandatory resolution attempts: audit, classify, expand, extract, normalize, stage, page-verify
- Why promotion was blocked: Normalized staging output still contains legacy runtime syntax or unresolved compatibility residue.
- Next missing rule, tool, or compatibility contract: keep deferred until the excluded lane or missing normalization rule is in scope.

### reference/console-overview.mdx
- Source path: `reference/console-overview.mdx`
- Intended target path: `reference/console-overview.mdx`
- Current flow: `complex`
- Blocker type: `deferred content`
- Exact failing pattern: unknown-platform:_check-usage, unknown-platform:_dashboard-overview, unknown-platform:_delete-account, unknown-platform:_manage-member, unknown-platform:_manage-profile, unknown-platform:_manage-projects, unknown-platform:_okta_integration, unknown-platform:_online-payment, unknown-platform:_ticket
- Attempted adaptation: Expanded shared imports, product wrappers, variables, tabs, admonitions, details, links, and image references, then staged output for verification.
- Completed mandatory resolution attempts: audit, classify, expand, extract, normalize, stage, page-verify
- Why promotion was blocked: Normalized staging output still contains legacy runtime syntax or unresolved compatibility residue.
- Next missing rule, tool, or compatibility contract: keep deferred until the excluded lane or missing normalization rule is in scope.

### reference/firewall.mdx
- Source path: `reference/firewall.mdx`
- Intended target path: `reference/firewall.mdx`
- Current flow: `complex`
- Blocker type: `deferred content`
- Exact failing pattern: unknown-platform:_firewall, single-platform-structured-run
- Attempted adaptation: Expanded shared imports, product wrappers, variables, tabs, admonitions, details, links, and image references, then staged output for verification.
- Completed mandatory resolution attempts: audit, classify, expand, extract, normalize, stage, page-verify
- Why promotion was blocked: Normalized staging output still contains legacy runtime syntax or unresolved compatibility residue.
- Next missing rule, tool, or compatibility contract: keep deferred until the excluded lane or missing normalization rule is in scope.

### reference/glossary.mdx
- Source path: `reference/glossary.mdx`
- Intended target path: `reference/glossary.mdx`
- Current flow: `complex`
- Blocker type: `deferred content`
- Exact failing pattern: unknown-platform:_glossary, single-platform-structured-run
- Attempted adaptation: Expanded shared imports, product wrappers, variables, tabs, admonitions, details, links, and image references, then staged output for verification.
- Completed mandatory resolution attempts: audit, classify, expand, extract, normalize, stage, page-verify
- Why promotion was blocked: Normalized staging output still contains legacy runtime syntax or unresolved compatibility residue.
- Next missing rule, tool, or compatibility contract: keep deferred until the excluded lane or missing normalization rule is in scope.

### reference/security.mdx
- Source path: `reference/security.mdx`
- Intended target path: `reference/security.mdx`
- Current flow: `complex`
- Blocker type: `deferred content`
- Exact failing pattern: unknown-platform:_bug-bounty, unknown-platform:_iso-cert, unknown-platform:_security, unknown-platform:_security-practice, unknown-platform:_security-whitepaper
- Attempted adaptation: Expanded shared imports, product wrappers, variables, tabs, admonitions, details, links, and image references, then staged output for verification.
- Completed mandatory resolution attempts: audit, classify, expand, extract, normalize, stage, page-verify
- Why promotion was blocked: Normalized staging output still contains legacy runtime syntax or unresolved compatibility residue.
- Next missing rule, tool, or compatibility contract: keep deferred until the excluded lane or missing normalization rule is in scope.

### reference/service-limits.mdx
- Source path: `reference/service-limits.mdx`
- Intended target path: `reference/service-limits.mdx`
- Current flow: `complex`
- Blocker type: `deferred content`
- Exact failing pattern: unknown-platform:_service_limits, single-platform-structured-run
- Attempted adaptation: Expanded shared imports, product wrappers, variables, tabs, admonitions, details, links, and image references, then staged output for verification.
- Completed mandatory resolution attempts: audit, classify, expand, extract, normalize, stage, page-verify
- Why promotion was blocked: Normalized staging output still contains legacy runtime syntax or unresolved compatibility residue.
- Next missing rule, tool, or compatibility contract: keep deferred until the excluded lane or missing normalization rule is in scope.

### reference/status-page.mdx
- Source path: `reference/status-page.mdx`
- Intended target path: `reference/status-page.mdx`
- Current flow: `complex`
- Blocker type: `deferred content`
- Exact failing pattern: unknown-platform:index, single-platform-structured-run
- Attempted adaptation: Expanded shared imports, product wrappers, variables, tabs, admonitions, details, links, and image references, then staged output for verification.
- Completed mandatory resolution attempts: audit, classify, expand, extract, normalize, stage, page-verify
- Why promotion was blocked: Normalized staging output still contains legacy runtime syntax or unresolved compatibility residue.
- Next missing rule, tool, or compatibility contract: keep deferred until the excluded lane or missing normalization rule is in scope.

## Repository anomaly

### overview/product-overview.mdx
- Source path: `overview/product-overview.mdx`
- Intended target path: `product-overview.mdx`
- Current flow: `complex`
- Blocker type: `repository anomaly`
- Exact failing pattern: existing target classified as unknown existing content
- Attempted adaptation: Inspected existing target content before promotion and staged migrated output.
- Completed mandatory resolution attempts: audit, classify, expand, extract, normalize, stage, page-verify
- Why promotion was blocked: Unknown or authoritative existing target content must not be overwritten in this batch.
- Next missing rule, tool, or compatibility contract: manual merge review or an explicit overwrite decision.

### troubleshooting/common-problems.mdx
- Source path: `troubleshooting/common-problems.mdx`
- Intended target path: `reference/common-problems.mdx`
- Current flow: `complex`
- Blocker type: `repository anomaly`
- Exact failing pattern: existing target classified as unknown existing content
- Attempted adaptation: Inspected existing target content before promotion and staged migrated output.
- Completed mandatory resolution attempts: audit, classify, expand, extract, normalize, stage, page-verify
- Why promotion was blocked: Unknown or authoritative existing target content must not be overwritten in this batch.
- Next missing rule, tool, or compatibility contract: manual merge review or an explicit overwrite decision.
