# Recording pricing and file-name links

## Goal

Repair the three legacy recording-pricing URLs reported as 404s and the broken
“Naming conventions” link in Cloud Recording integration best practices.

## Design

- Add legacy redirect rules for `/en/cloud-recording/overview/pricing`,
  `/en/on-premise-recording/overview/billing`, and
  `/en/cloud-recording/overview/pricing-webpage-recording` to their current
  canonical pricing pages under `/en/realtime-media/`.
- Keep Web Page Recording pointed at its own
  `/en/realtime-media/cloud-recording/reference/pricing-webpage-recording`
  page, not the general Cloud Recording pricing page. The On-Premise URL may
  include `?platform=linux-cpp`; the redirect should still reach its pricing
  page.
- Correct the relative “Naming conventions” link in
  `integration-best-practices.mdx` to the current Manage Recorded Files route.
- Add focused redirect tests and verify the destinations correspond to
  existing documentation pages. Do not add duplicate pricing pages or change
  pricing content.

## Acceptance criteria

1. Each reported legacy URL resolves to the appropriate existing pricing page.
2. The Web Page Recording URL resolves to the Web Page Recording pricing page.
3. The best-practices link resolves to the Manage Recorded Files page and its
   `#naming-conventions` heading.
