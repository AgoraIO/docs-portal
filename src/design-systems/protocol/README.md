# Protocol Design System

This theme is the reusable visual baseline for the docs portal.

## Principles

- restrained hierarchy with narrow reading widths
- unified sans typography for Chinese and English
- zinc surfaces with emerald emphasis
- low-noise chrome around Fumadocs navigation and content

## Core Tokens

- `--font-sans`, `--font-heading`, `--font-mono`
- `--protocol-home-width`, `--protocol-page-width`
- `--protocol-canvas`, `--protocol-surface`, `--protocol-secondary`
- `--protocol-foreground`, `--protocol-muted-foreground`
- `--protocol-primary`, `--protocol-accent`, `--protocol-border`

## Usage

- import `src/design-systems/protocol/theme.css` from the global app stylesheet
- map all Fumadocs runtime colors through `--color-fd-*` variables
- build page-specific UI from tokens first, not one-off colors
