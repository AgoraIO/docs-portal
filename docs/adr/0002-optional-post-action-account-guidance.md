---
status: accepted
---

# Optional post-action account guidance for SDK and Demo resources

SDK downloads and external Demo experiences remain immediately available; after a qualifying **Resource action**, the portal may show one optional **Account guidance prompt** for the current browser-tab session. The prompt links to the official Agora login and registration flows, does not collect credentials or block the original action, and records only anonymous interaction context. After successful authentication, the user is redirected to the Console service page mapped to the triggering SDK or Demo; an unmapped context falls back to the Console home page.

## Considered Options

- Gate downloads and Demo experiences behind authentication — rejected because it adds a barrier to the developer's primary task.
- Collect contact details in the documentation portal — rejected because the portal has no approved lead destination or data-processing boundary.
- Embed or implement authentication in the portal — rejected for the first version because the repository has no authentication integration; the implementation should use the approved SSO callback contract instead.

## Consequences

- The first version can be implemented without handling passwords or other account credentials.
- Login and registration entry clicks can be measured anonymously; authentication completion and Console redirect behavior depend on the approved SSO callback contract.
- The prompt's current-session suppression must be shared by qualifying SDK and Demo actions in the same browser tab.
