# API Reference Product Filter Deep Links Design

## Goal

When a user opens `SDK API reference` from an English Realtime Media product guide, open the API Reference catalog with that product already selected. The catalog then immediately shows the SDK API references for the product's supported platforms instead of requiring a second product-selection step.

## URL Contract

SDK API sidebar jumps use this canonical URL shape, where the value is one of the explicit keys in the product mapping table:

```text
/en/api-reference/api-ref?product=realtime-communication
```

The product key is a stable kebab-case identifier derived from the API Reference catalog product value. RESTful API jumps keep their existing product-specific paths and do not use the catalog filter.

## Product Mapping

The 12 Realtime Media products with SDK API jumps map to nine catalog filters:

| Product guide slug | Catalog product | Query value |
| --- | --- | --- |
| `rtc` | Realtime Communication | `realtime-communication` |
| `video` | Realtime Communication | `realtime-communication` |
| `broadcast-streaming` | Realtime Communication | `realtime-communication` |
| `interactive-live-streaming` | Realtime Communication | `realtime-communication` |
| `voice` (legacy product scope) | Realtime Communication (Voice only) | `realtime-communication-voice-only` |
| `rtm` | Signaling | `signaling` |
| `im` | Chat | `chat` |
| `whiteboard` | Interactive Whiteboard | `interactive-whiteboard` |
| `flexible-classroom` | Flexible Classroom | `flexible-classroom` |
| `iot` | IoT SDK | `iot-sdk` |
| `on-premise-recording` | On-Premise Recording | `on-premise-recording` |
| `rtc-server-sdk` | Server Gateway | `server-gateway` |

Voice Calling intentionally uses its own Voice-only catalog group. RTC, Video Calling, Broadcast Streaming, and Interactive Live Streaming share the full Realtime Communication catalog group.

The current navigable Voice-only guide is `/en/realtime-media/rtc/voice-quickstart` because the standalone Voice and Video product navigation was unified under RTC. That exact page receives the Voice-only SDK filter while other pages under `/en/realtime-media/rtc` continue to use the full Realtime Communication filter. The legacy `voice` registry entry remains classified for compatibility, but the implementation does not restore the removed Voice product root to the main navigation.

On-Premise Recording changes from the dedicated `/en/api-reference/api-ref/on-premise-recording` page to the filtered catalog URL. This makes all 12 SDK sidebar jumps behave consistently and exposes both Linux C++ and Linux Java entries in one view.

## Catalog Component Contract

`RecipesCatalog` gains an optional `productQueryParam` prop, parallel to the existing `stackQueryParam` prop:

```tsx
type RecipesCatalogProps = {
  productQueryParam?: string;
  stackQueryParam?: string;
  // Existing props remain unchanged.
};
```

The API Reference catalog enables the feature explicitly:

```mdx
<RecipesCatalog
  productQueryParam="product"
  ...
/>
```

Other RecipesCatalog consumers do not acquire implicit URL behavior.

## Query Matching

On initial render, the component:

1. Reads `window.location.search` only when `productQueryParam` is configured.
2. Reads the configured query value.
3. Normalizes both query values and available `items[].product` values by trimming, converting to lowercase, and treating spaces, parentheses, and repeated punctuation as separators.
4. Matches the canonical kebab-case query to one exact catalog product.
5. Initializes `activeProduct` to that catalog product.

Examples:

```text
realtime-communication
→ Realtime Communication

realtime-communication-voice-only
→ Realtime Communication (Voice only)

iot-sdk
→ IoT SDK
```

If the query is absent, empty, unknown, or does not match a product in the current `items` collection, the component uses `allProductsLabel`.

Matching uses the actual product values from `items`; the query parameter cannot create a filter value that the catalog does not expose.

## Initial-State-Only Behavior

The product query parameter initializes the filter once. It is not synchronized back to the URL when the user selects another product.

This matches the existing `stackQueryParam` behavior:

- A shared deep link reliably opens the intended initial view.
- Clicking filter buttons remains local React state.
- The browser history is not modified for every filter selection.
- The original query may no longer describe the current UI after manual changes; this is accepted by design.

## Product And Platform Composition

The product query initializes the product filter. The user can then select a platform using the existing platform controls:

```text
Open ?product=signaling
→ Product = Signaling
→ Select Platform = Android
→ Show Signaling Android API references
```

The visible cards are the intersection of the query-initialized product and the manually selected platform. Manual platform and product changes remain local React state and do not modify the URL.

The initial implementation adds only `productQueryParam="product"` to the API Reference catalog. This change does not enable platform deep links on the API Reference page or add platform parameters to product-guide links.

## Sidebar Registry Ownership

The centralized `realtimeMediaApiReferenceLinks` registry remains the owner of SDK jump targets. Its `sdkUrl` values become filtered catalog URLs according to the mapping table.

Examples:

```ts
{
  productSlug: 'voice',
  restUrl: '/en/api-reference/api-ref/rtc',
  sdkUrl:
    '/en/api-reference/api-ref?product=realtime-communication-voice-only',
}

{
  productSlug: 'on-premise-recording',
  sdkUrl: '/en/api-reference/api-ref?product=on-premise-recording',
}
```

The sidebar node remains `linked: true` and `external: true`, so it keeps the chevron and safe new-tab behavior. REST URLs and behavior are unchanged.

## Error And Fallback Behavior

- Missing `product`: show all products.
- Empty `product`: show all products.
- Unknown `product`: show all products.
- Correctly normalized but unavailable product: show all products.
- Duplicate product items: expose one filter value and show all matching cards.
- Product with zero results after a manual platform selection: show the existing empty-state message.
- Server rendering: use the all-products fallback because `window` is unavailable; hydrate to the query-selected product on the client without changing catalog structure.

## Testing

Automated tests cover:

1. All 12 SDK product guide slugs produce the exact expected filtered URL.
2. Voice uses `realtime-communication-voice-only`.
3. RTC, Video, Broadcast Streaming, and Interactive Live Streaming use `realtime-communication`.
4. On-Premise Recording now uses the filtered catalog URL rather than its dedicated page.
5. A valid `product` query initializes the correct product button and visible cards.
6. Product matching handles parentheses and multi-word names.
7. Missing, empty, and invalid values fall back to all products.
8. A query-initialized product and a manually selected platform filter to their intersection.
9. Manual product selection changes visible cards without changing `window.location.search`.
10. Existing RecipesCatalog consumers without `productQueryParam` ignore the URL.

## Browser Verification

Use a local documentation preview and browser automation to verify representative mappings:

1. RTC opens the catalog filtered to Realtime Communication and shows multiple SDK platforms.
2. The unified RTC Voice-only quickstart opens the Voice-only product group.
3. Signaling opens the Signaling group.
4. On-Premise Recording opens the catalog filtered to its Linux SDK entries.

For each sample, verify the `Product` filter button is selected, unrelated product groups are absent, the URL contains the expected `product` value, and the SDK sidebar jump still opens in a new tab.

Provide refreshed screenshots for at least RTC, Voice, and On-Premise Recording with the product filter and resulting cards visible.

## Scope

This change does not:

- Synchronize filter clicks back to the URL.
- Change RESTful API targets.
- Add platform parameters to product-guide links.
- Change the product names displayed by the API Reference catalog.
- Change Chinese documentation.
- Create product-specific API catalog routes.
