---
title: "Agora skills"
description: "Use Agora skills with AI coding assistants to build with Agora faster."
---

Agora skills is a set of structured reference files that give AI coding assistants deep knowledge of Agora's platform. When you ask your assistant to build something with Agora, it loads the relevant skill files covering products, APIs, and platform-specific code examples, so it can generate working code without guessing.

Skills includes integration with the [Agora MCP server](./mcp), which gives your assistant access to live Agora documentation. For installation instructions and supported tools, see the [Agora Skills repository](https://github.com/AgoraIO/skills).

### Installation

Install Agora Skills using one of the following methods:

#### Skills CLI (recommended)

Run the following command:

```bash
npx skills add github:AgoraIO/skills
```

Skills activate automatically when your agent detects relevant tasks, for example, "build a voice agent", "integrate Agora RTC", or "generate a token".

#### Manual installation

Clone the repository once and point your AI coding assistant to the skill files directly.

1. Clone the [Agora Skills repo](https://github.com/AgoraIO/skills.git):

    ```bash
    git clone https://github.com/AgoraIO/skills.git ~/agora-skills
    ```

1. Point your AI assistant to `skills/agora/`.
