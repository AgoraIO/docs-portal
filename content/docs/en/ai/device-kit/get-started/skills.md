---
title: Agora skills
description: Use Agora skills with AI coding assistants to build with Agora faster.
---
Agora skills is a structured reference bundle that gives AI coding assistants product-aware guidance for building with Agora. In the device-kit workflow, it helps assistants discover the right setup steps, docs, and integration patterns without guessing.

Skills includes integration with the Agora MCP server, which gives your assistant live access to Agora documentation.

## Installation

### Skills CLI (recommended)

```bash
npx skills add github:AgoraIO/skills
```

### Manual installation

Clone the repository once and point your coding assistant to the Agora skill files:

```bash
git clone https://github.com/AgoraIO/skills.git ~/agora-skills
```

Then point your tool to `skills/agora/` or load `SKILL.md` as the entry point.

## Recommended use

Use Agora skills when you want an assistant to help with:

- Device Kit setup
- Conversational AI quickstarts
- Agora CLI workflows
- platform-specific guidance across Android, Web, iOS, and device-oriented paths

## Related resources

- [Agora MCP](mcp.md)
- [Agora Skills repository](https://github.com/AgoraIO/skills)
