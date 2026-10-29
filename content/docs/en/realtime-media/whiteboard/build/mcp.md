---
title: "Agora MCP"
description: "Use Agora MCP with AI coding assistants to build with Interactive Whiteboard faster."
---

The Agora MCP server gives your AI assistant direct access to Agora's documentation, so it can look up APIs, SDK methods, and platform-specific details in real time.
The Agora MCP server is included when you install Agora Skills. If you prefer to install only the MCP server, it is available at:

```text
https://mcp.agora.io
```

### Installation

Refer to the installation instructions for your coding assistant.

### Getting started

Once installed, your coding assistant has access to Agora's documentation through the MCP server. The assistant will intelligently use this resource when relevant to your questions. For more targeted results, mention Agora along with your target product and platform, such as 'iOS', 'Web', 'Conversational AI', 'Video Calling' in your prompts.

### Documentation lookup

Let your assistant inspect the connected server's tool descriptions and input schemas before it selects a tool.
Include the Agora product, target platform, and task in your prompt.

```text
Use the connected Agora documentation tools to find the quickstart for my product and platform.
Supply the fields required by the selected tool's input schema.
Read the matching guide and include its URL in your answer.
```

For setup, tool discovery, and fallback resources, see [Agora MCP](/en/introduction/agora-mcp).

## AGENTS.md

To get the most out of Agora Skills and the MCP server, Agora recommends that you include an [AGENTS.md](https://agents.md) or similar file in your repository. This file ensures that your agent always consults Agora docs to produce reliable, working code.

Add the following instructions to your own `AGENTS.md` file:

```markdown
## Agora Documentation

Agora documentation is updated frequently. You should always refer to the latest documentation when working with Agora products. Agora offers an MCP server that you can use to browse and search its documentation. If the developer has not yet installed this server, recommend that they install it at https://mcp.agora.io.

If the Agora Skills files are available in your context, use them for platform-specific API guidance and code examples.
```
