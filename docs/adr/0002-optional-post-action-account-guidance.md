---
status: accepted
---

# Optional post-action account guidance for SDK and Demo resources

SDK downloads and external Demo experiences remain immediately available; after a qualifying **Resource action**, the portal may show one optional **Account guidance prompt** for an unauthenticated visitor during the current browser-tab session. The prompt links to the official Agora login and registration flows and does not collect credentials or block the original action. Entry clicks and dismissals are anonymous; successful authentication is recorded as a separate identified event linked to the original click. After successful authentication, the user is redirected to the Console service page mapped to the triggering SDK or Demo; an unmapped context falls back to the Console home page.

## Considered Options

- Gate downloads and Demo experiences behind authentication — rejected because it adds a barrier to the developer's primary task.
- Collect contact details in the documentation portal — rejected because the portal has no approved lead destination or data-processing boundary.
- Embed or implement authentication in the portal — rejected for the first version because the repository has no authentication integration; the implementation should use the approved SSO callback contract instead.

## Consequences

- The first version can be implemented without handling passwords or other account credentials.
- Stable account identifiers and the destination for identified authentication events require confirmation by Console engineering; event properties exclude names, email addresses, and phone numbers.
- Closing the prompt and choosing to skip are one anonymous dismissal behavior; the original click and successful authentication remain separate events rather than duplicate clicks.
- Authentication completion and Console redirect behavior depend on the approved SSO contract.
- The prompt's current-session suppression must be shared by qualifying SDK and Demo actions in the same browser tab.
