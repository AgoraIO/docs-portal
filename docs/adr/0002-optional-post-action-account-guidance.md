---
status: accepted
---

# Optional post-action account guidance for SDK and Demo resources

SDK downloads and external Demo experiences remain immediately available; after a qualifying **Resource action**, the portal may show one optional **Account guidance prompt** for the current browser-tab session. The prompt links to the official Agora login and registration flows, does not collect credentials or block the original action, and records only anonymous interaction context. The first version records prompt and entry-point clicks only; it does not identify whether authentication succeeds.

## Considered Options

- Gate downloads and Demo experiences behind authentication — rejected because it adds a barrier to the developer's primary task.
- Collect contact details in the documentation portal — rejected because the portal has no approved lead destination or data-processing boundary.
- Embed or implement authentication in the portal — deferred because the repository has no authentication integration and the official SSO contract is not yet confirmed.

## Consequences

- The first version can be implemented without handling passwords or other account credentials.
- Login and registration conversion can be measured by anonymous prompt and click events, but authentication completion is intentionally outside the first-version measurement contract.
- The prompt's current-session suppression must be shared by qualifying SDK and Demo actions in the same browser tab.
