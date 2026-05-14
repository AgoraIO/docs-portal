# Docs Header Compression Design

## Goal

Refactor the docs shell header into a denser, calmer structure that feels closer to the ElevenLabs docs chrome while preserving the current docs IA, localized routing, and shadcn-based implementation approach.

## Scope

This design only covers the docs shell header and the top-level tabs strip.

In scope:
- desktop header structure
- desktop tabs strip structure
- mobile header structure
- search trigger behavior in the header
- language/theme control density
- visual tone for the header and tabs strip

Out of scope:
- sidebar IA changes
- docs content layout changes
- TOC redesign
- search backend changes
- content migrations
- typography system changes outside the shell

## Existing State

The current docs shell uses:
- a first-row header with brand, search, locale, and theme controls
- a second-row tabs bar that still reads like a full secondary header
- a desktop shell that is structurally correct but visually too tall for the desired direction

This makes the shell feel more like a generic shadcn docs scaffold than a compressed product/docs chrome.

## Design Decisions

### 1. Desktop Header Structure

Desktop header row becomes:

`[Agora Docs] [spacer] [search] [lang] [theme]`

Rules:
- keep only the text brand `Agora Docs`
- no subtitle
- no product badge
- no environment label
- no tabs inside the main header row

Rationale:
- this is the smallest stable desktop chrome
- it preserves search and controls without turning the header into a toolbar
- it matches the user’s requirement to compress the shell aggressively

### 2. Desktop Tabs Strip

Tabs remain visible on desktop, but move into a thin, left-aligned strip directly under the main header row.

Rules:
- tabs are not removed
- tabs are left aligned
- tabs are visually thin, closer to a navigation rail than a second header
- current tab uses a subtle active underline treatment
- the strip should feel attached to the shell, not like a standalone section

Rationale:
- docs IA still needs first-level domain switching
- removing tabs entirely would hide too much primary navigation
- keeping them thin preserves hierarchy without reintroducing a tall header

### 3. Search Behavior

Search stays in the main header row, but it is a trigger styled like a compact search field, not a true inline input.

Rules:
- preserve current search dialog behavior
- clicking the pill opens the existing dialog
- the control should look like a compact search field or search pill
- do not add inline typing behavior to the header itself

Rationale:
- this preserves discoverability
- it keeps the header visually balanced
- it avoids extra state and interaction complexity

### 4. Language and Theme Controls

Header controls use asymmetric density:
- language remains a compact text pill
- theme becomes icon-only

Rules:
- language should stay legible at a glance
- theme should remain a low-emphasis secondary action
- both controls should visually feel lighter than the search pill

Rationale:
- language choice is more important to identify than theme state
- icon-only theme control saves width without reducing clarity

### 5. Mobile Header Structure

Mobile header becomes:

`[menu] [Agora Docs] [search icon]`

Rules:
- keep the existing sheet-based navigation model
- tabs and sidebar content remain accessible through the mobile sheet
- do not attempt to render desktop-style tabs inline on mobile
- locale/theme can stay inside the menu/sheet layer or remain secondary actions outside the first-pass compression work

Rationale:
- this is the most stable compressed mobile shell
- it avoids horizontal crowding
- it preserves the existing interaction model

### 6. Visual Tone

The header should use a restrained docs/app-shell treatment.

Rules:
- use light border separation
- use ghost or low-contrast outline treatments
- avoid heavy filled pills or segmented blocks
- avoid strong card framing
- keep the active tab state visible but quiet

Rationale:
- the desired reference is calm, compressed, and product-like
- the shell should feel designed, but not decorative

## Recommended Implementation Approach

Use existing local shadcn components only:
- `Button`
- `Popover`
- `Sheet`
- `Tabs`
- existing search dialog composition

Do not add a new registry block just for the header.

Why:
- the current project already has the right primitives installed
- the work is mostly shell composition and spacing hierarchy
- introducing a large block would add noise and fight the repo’s existing docs shell boundaries

## Acceptance Criteria

Desktop:
- the main header is a single compact row
- tabs are no longer visually treated as a full second header
- the shell reads closer to ElevenLabs docs than to a default docs scaffold

Mobile:
- the first row stays minimal and uncluttered
- tabs are not forced inline on small screens

Behavior:
- search still opens the current dialog
- locale switching still works
- theme switching still works
- docs tabs still switch top-level sections

Non-goals:
- no IA rewrite
- no content rewrite
- no sidebar redesign in this change
