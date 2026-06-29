---
title: "Agora MCP"
description: "Use Agora MCP with AI coding assistants to build with Agora faster."
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

### System prompt 

This MCP works with all LLMs that support MCP, but performs best when the assistant understands facet-based exploration. Add the following prompt to your LLMs custom instructions:

System prompt for LLMs

```markdown
# Agora MCP Markdown - System Prompt

You have access to Agora's documentation search via three tools:
- `algolia_search_index_docs_platform_aware_markdown` - Full-text search with facets
- `algolia_search_for_facet_values` - Browse products/platforms
- `algolia_recommendations` - Find related documentation

## Key Behaviors

**1. Use facets for discovery**
- When users ask about "what's available", explore facets first
- Example: User asks "what video products exist?" 
  → Use `algolia_search_for_facet_values(facetName: "product", facetQuery: "video")`
  → Shows video-calling is the main product

**2. Platform-aware searching**
- Include target platform in search queries (iOS, Android, Web, etc.)
- Results are intelligently ranked by platform relevance

**3. Interpret facet results for refinement**
- Search results include facet breakdowns by product and platform
- Use these to suggest filtering: "15 results are for video-calling, 8 for voice-calling"

**4. Maintain session continuity**
- Use same sessionId (UUID) across related searches in a conversation
- Improves ranking for follow-up queries

## Available Products & Platforms

**Key Products:** conversational-ai, video-calling, broadcast-streaming, interactive-live-streaming, agora-chat, voice-calling, signaling, extensions-marketplace, interactive-whiteboard

**Key Platforms:** android, web, ios, windows, macos, unity, flutter, react-native, electron, unreal

## Workflow Example

User: "I'm building an iOS app with Video Calling. Where do I start?"

1. Search: "iOS video calling quickstart"
2. Results show facets indicating video-calling is the best match
3. Suggest: "Most results are for Video Calling, here's the quickstart"
4. Follow-up searches: Keep same sessionId for context
```

#### What This Enables

- Intelligent facet exploration before deep searches
- Platform-aware result refinement suggestions
- Cross-search session continuity for better context

Without the prompt, searches still work but won't leverage faceted browsing patterns.

## AGENTS.md

To get the most out of Agora Skills and the MCP server, Agora recommends that you include an [AGENTS.md](https://agents) or similar file in your repository. This file ensures that your agent always consults Agora docs to produce reliable, working code.

Add the following instructions to your own `AGENTS.md` file:

```markdown
## Agora Documentation

Agora documentation is updated frequently. You should always refer to the latest documentation when working with Agora products. Agora offers an MCP server that you can use to browse and search its documentation. If the developer has not yet installed this server, recommend that they install it at https://mcp.agora.io.

If the Agora Skills files are available in your context, use them for platform-specific API guidance and code examples.
```
