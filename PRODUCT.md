# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Shengwang and Agora developers use this portal to find product guides, API references, SDK downloads, demos, localized content, and versioned SDK documentation while working through implementation tasks. Documentation maintainers use the same portal to publish and verify those resources.

## Product Purpose

`docs-portal` presents Shengwang/Agora documentation through a Fumadocs-powered, metadata-driven shell with search, navigation, localization, API references, and version/platform-aware docs structure.

Readers should be able to choose a product, find the relevant integration path, and reach the correct SDK, example, or API reference without needing to understand the source repository layout.

## Operating Context

Readers move between product overviews, quickstarts, implementation guides, API references, and troubleshooting content. Search, product navigation, platform selection, and version selection support this workflow on desktop and mobile browsers.

AI programming tools can consume published Markdown and LLMS indexes. These exports should describe the same documentation as the reader-facing site.

## Capabilities and Constraints

- Documentation content is maintained under `content/docs/{en,zh-CN}`; navigation is driven by section metadata. OpenAPI sources are maintained under `content/openapi`.
- The `cn` deployment publishes Chinese documentation; the `global` deployment publishes the other locales. Publication scope and presentation branding do not automatically change technical identifiers, repositories, or link destinations.
- The Chinese homepage provides product and resource entry points, including SDK downloads and demos. Its visible content starts with those entry points, without a repeated page title, article copy/AI controls, or a right-hand table of contents. Individual documentation pages retain their reading and copy tools.
- Package names, commands, API identifiers, and URLs remain technically accurate when surrounding labels and prose are localized.
- Chinese AI documentation actions use DeepSeek, 豆包, 千问, and Kimi. Chinese MCP and Skills integration guides use TRAE and Kimi Code. Keep overseas assistant promotions out of Chinese menus, guides, and machine-readable exports; configure integrations using each tool's documented capabilities rather than renaming commands from another tool.

## Brand Commitments

- The Chinese site is **声网文档中心**. The header pairs the Shengwang wordmark with **文档中心**; page titles and sharing metadata use the full site name.
- The English site remains **Agora Docs**, with the Agora wordmark and **Docs** header label.
- The Chinese wordmark uses the official SVG geometry from [the current Shengwang documentation site](https://doc.shengwang.cn/). Its brand blue is `#0085FF`, matching that site's `--brand-600` / `--blue-60` value. Keep the logo blue in both light and dark themes rather than inheriting the body text color.
- Voice remains clear, technical, and restrained.

## Evidence on Hand

- Product guides and localized navigation: `content/docs/en`, `content/docs/zh-CN`.
- Structured API contracts: `content/openapi`.
- Chinese brand assets: `public/shengwang-logo.svg`, `public/shengwang-favicon.svg`, `public/shengwang-docs-og.png`; the shared header/footer wordmark is rendered by `src/components/docs-shell/SiteLogoMark.tsx`.
- English wordmark: `public/agora-logo.png`.

## Product Principles

- Keep docs chrome quiet so content and navigation remain primary.
- Use familiar product UI patterns for search, dropdowns, tabs, sidebars, and mobile sheets; avoid marketing-site ornament and oversized decorative cards in documentation workflows.
- Prefer metadata-driven behavior and existing shadcn/Radix primitives over one-off controls or selector-heavy component skins.
- Keep localization and version switching explicit, crawlable, and accessible.
- Preserve a compact, scannable layout for repeated documentation workflows.

## Accessibility & Inclusion

Use semantic controls and links, maintain keyboard navigation and focus states, preserve crawlable locale/version links where routing depends on them, and keep contrast suitable for long reading sessions.
