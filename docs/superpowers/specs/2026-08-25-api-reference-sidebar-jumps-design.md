# API Reference Sidebar Jumps Design

## Goal

Make API Reference jumps in English Realtime Media product sidebars predictable and visually consistent:

- Products with REST and SDK APIs show `RESTful API` first and `SDK API reference` immediately below it.
- Products with SDK APIs but no REST API show `SDK API reference` as the first item in the `Reference` section.
- Products with REST APIs but no SDK API do not show an SDK entry.
- Both jump entries show the right-facing chevron used for cross-section navigation.
- REST and SDK jumps both open the API Reference destination in a new browser tab.

## Current Behavior

`src/lib/realtime-media-api-reference-links.ts` defines the 20-product SDK/REST capability registry. `src/lib/docs-page.server.ts` uses that registry to inject ordered API jumps into each Realtime Media `Reference` section.

The injected SDK node has `linked: true` and `external: true`, so it displays a right-facing chevron and opens in a new tab. The REST node currently has only `linked: true`, so it displays the chevron but uses the TanStack Router link in the current tab. This design changes REST jumps to the same safe new-tab anchor behavior used by SDK jumps.

Product `reference/meta.json` files own ordinary Reference pages; the centralized server registry owns cross-tab API jumps because it controls final position and browser behavior.

## Chosen Approach

Use one server-side product capability registry as the owner of API jump placement and behavior. Replace `REALTIME_MEDIA_API_REFERENCE_LINKS` with a registry that supports optional REST and SDK targets.

```ts
type RealtimeMediaApiReferenceLinks = {
  productSlug: string;
  restUrl?: string;
  sdkUrl?: string;
};
```

Example entries:

```ts
{
  productSlug: 'rtc',
  restUrl: '/en/api-reference/api-ref/rtc',
  sdkUrl: '/en/api-reference/api-ref',
},
{
  productSlug: 'cloud-recording',
  restUrl: '/en/api-reference/api-ref/cloud-recording',
},
{
  productSlug: 'on-premise-recording',
  sdkUrl: '/en/api-reference/api-ref/on-premise-recording',
},
```

The registry uses the same 20-product capability matrix already established by PR #1028:

- SDK and REST: RTC, Voice, Video, Broadcast Streaming, Interactive Live Streaming, Signaling, Chat, Whiteboard, Flexible Classroom, and IoT.
- REST only: Cloud Recording, Cloud Transcoding, Speech-to-Text, Media Pull, Media Push, RTMP Gateway, Agora Analytics, and Extensions Marketplace.
- SDK only: On-Premise Recording and Server Gateway.

Media Player Kit is not included because it has no Realtime Media guide product with a `reference/meta.json` section.

## Sidebar Node Contract

REST jump nodes use this target contract:

```ts
{
  external: true,
  href: restUrl,
  id: restUrl,
  linked: true,
  title: 'RESTful API',
  type: 'page',
  url: restUrl,
}
```

`linked: true` preserves the right-facing chevron. `external: true` makes the internal docs destination render as a native anchor with `target="_blank"` and `rel="noreferrer noopener"`.

SDK jump nodes use both linked and external behavior:

```ts
{
  external: true,
  href: sdkUrl,
  id: sdkUrl,
  linked: true,
  title: 'SDK API reference',
  type: 'page',
  url: sdkUrl,
}
```

REST and SDK nodes therefore share the same visual and browser contract: both show the chevron and both open their internal API Reference destination in a new tab.

## Ordering Rules

The injection function owns the beginning of each product's `Reference` children:

```text
SDK + REST
1. RESTful API
2. SDK API reference
3. Existing Reference pages

REST only
1. RESTful API
2. Existing Reference pages

SDK only
1. SDK API reference
2. Existing Reference pages
```

Before prepending these nodes, the function removes existing API jump nodes and legacy wrapper URLs for that product. This prevents duplicate REST or SDK items while leaving unrelated entries, including Agora Console REST pages, unchanged.

## Metadata Ownership

Remove the direct `[SDK API reference](...)` and `[REST API](...)` entries added to the 20 product `reference/meta.json` files in PR #1028. The metadata continues to own ordinary Reference pages. The centralized server registry owns cross-tab API jumps because it is the only layer that can consistently control final ordering and node behavior.

Existing REST wrapper pages may remain as content files for redirects, direct URLs, or historical compatibility, but they are not listed alongside the injected canonical jump.

The capability matrix test moves from checking raw `meta.json` link strings to checking the centralized registry and final sidebar payload.

## Error And Fallback Behavior

- A product without a registry entry receives no injected API jump.
- A REST-only product never receives an SDK node.
- An SDK-only product never receives a REST node.
- Every configured internal target must resolve to maintained English documentation content.
- Duplicate URLs from metadata or legacy wrappers are filtered before injection.
- New Realtime Media products with a `reference/meta.json` must be explicitly classified, preserving the closed capability matrix introduced in PR #1028.

## Testing

Focused unit and integration tests cover:

1. Registry classification for all 20 products.
2. REST and SDK target resolution.
3. Final ordering for an SDK+REST product: REST first, SDK second.
4. Final ordering for an SDK-only product: SDK first.
5. Absence of SDK nodes for REST-only products.
6. SDK node shape: `linked: true`, `external: true`, and `href` set.
7. REST node shape: `linked: true`, `external: true`, and `href` set.
8. Sidebar rendering: both entries display the chevron and render native anchors with `_blank` and safe `rel`.
9. Existing Console REST entries and ordinary Reference pages remain present.
10. Whiteboard and other existing navigation regression tests are updated to the final injected order.

## Preview Verification

After implementation, start the local documentation site and use browser automation to verify the rendered sidebar and click behavior. Provide the user with these screenshots:

1. RTC as an SDK+REST sample, showing `RESTful API` followed immediately by `SDK API reference`, both with chevrons.
2. On-Premise Recording as an SDK-only sample, showing `SDK API reference` as the first Reference item with a chevron.
3. Cloud Recording as a REST-only sample, showing `RESTful API` without an SDK entry.

Also verify interactively that clicking either the SDK or RESTful API entry creates one new browser tab while preserving the original product-guide tab. Capture screenshots at a stable desktop viewport with the `Reference` section visible and no overlapping UI.

## Scope

This change updates the English Realtime Media sidebar behavior and the tests required to maintain it. It does not:

- Add product-filter query parameters to the API Reference catalog.
- Change the API Reference catalog content.
- Change Chinese documentation navigation.
- Change ordinary external link icons across the rest of the documentation site.
- Add a Realtime Media guide section for Media Player Kit.
