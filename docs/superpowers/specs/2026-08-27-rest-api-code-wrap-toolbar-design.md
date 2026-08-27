# REST API code wrap toolbar design

## Context

The REST API reference renderer currently renders the `Wrap lines` control as a
text button above the request-example configuration selector. This adds a
separate row and makes the control look unrelated to the code it changes. The
request example and response example are rendered by separate regions, but
only the request region currently has the wrapping control.

## Goal

Make line wrapping a compact, discoverable code-toolbar action for both request
and response examples, without changing the existing OpenAPI schema rendering,
response folding, or request sticky-height behavior.

## Chosen approach

Use the existing `OpenApiCodePreview` wrapper for both code regions. Keep the
toggle as a real button in the DOM, but render it as an icon-only control and
position it with the code-region toolbar. This keeps the change local to the
renderer while preserving the existing Fumadocs code tabs and copy behavior.

Alternatives rejected:

- Rebuilding the Fumadocs code toolbar would provide a cleaner shared DOM, but
  would couple the renderer to generated Fumadocs markup and increase regression
  risk.
- Keeping the icon beside the configuration selector would save space, but
  would not establish a clear relationship with the code block.

## Layout and interaction

- Request and response examples each render their own `OpenApiCodePreview`.
- Each region has an independent wrapping state.
- Language or response-status tab changes preserve the wrapping state within
  that region; changing to another operation resets both regions to unwrapped.
- The toolbar keeps language/status tabs on the left and places the wrap icon
  immediately to the left of the copy control on the right.
- The configuration selector remains above the request code tabs and does not
  share a row with the wrap control.
- On narrow screens, toolbar controls remain associated with the code region;
  they may compress or wrap within the toolbar, but the wrap control must not
  become a standalone title row.

## Height and overflow behavior

- Request code keeps the existing sticky-rail behavior. When the rail is
  constrained, the request viewport uses the available viewport height.
- Response code keeps natural height. Wrapping changes horizontal layout only
  and does not participate in request rail height calculations.
- Unwrapped code remains horizontally scrollable.
- Wrapped code hides horizontal overflow and uses pre-wrap/word breaking so
  long lines remain readable.

## Accessibility

- The icon button exposes `aria-label="Wrap lines"` (localized where the
  renderer already localizes labels) and `aria-pressed`.
- A tooltip exposes the same action name on hover and focus.
- The active state has a visible visual treatment independent of color alone.
- The button remains keyboard reachable in the toolbar order.

## Testing and validation

Unit/component tests will verify:

- Request and response controls are both rendered.
- Their states are independent.
- Toggling preserves source text and changes the `data-wrap-lines` state.
- Tab changes do not unexpectedly reset the local state; operation changes do.
- Wrapped view removes horizontal overflow while unwrapped view preserves it.
- Request sticky height calculations remain unchanged by response rendering.
- Accessible name, pressed state, and tooltip hook are present.

Browser validation will cover the existing REST API sample pages at desktop,
1024px, mobile, and dark-mode breakpoints, including sticky rail and both code
regions.

## Non-goals

- No changes to OpenAPI schemas or generated API content.
- No changes to Request Body/Response schema folding rules.
- No changes to response status accordion behavior.
- No changes to the copy button or language/status tab semantics.
