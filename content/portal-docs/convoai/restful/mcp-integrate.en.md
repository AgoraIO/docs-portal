---
title: Integrate with MCP
description: "You can integrate Agora products more efficiently with an AI coding agent. By configuring the Shengwang Doc MCP Server, the coding agent can search and read Agora official documentation directly, retrieve the latest official content before answering questions or generating code, and provide more accurate and efficient assistance."
---

# Integrate with MCP

You can integrate Agora products more efficiently with an AI coding agent. By configuring the Shengwang Doc MCP Server, the coding agent can search and read Agora official documentation directly, retrieve the latest official content before answering questions or generating code, and provide more accurate and efficient assistance.

## Connect to the Shengwang Documentation MCP Server

Choose one of the following methods to connect to the MCP Server:

#### Trae

**Manual configuration:**

Manually add the following configuration in Trae at Settings > MCP:

```json title=
{
  "mcpServers": {
    "shengwang-docs": {
      "type": "http",
      "url": "https://doc-mcp.shengwang.cn/mcp"
    }
  }
}
```

#### Claude Code

**Add with the `CLI`:**

```bash
claude mcp add --transport http shengwang-docs https://doc-mcp.shengwang.cn/mcp
```

**Or configure manually:**

Create or edit `.mcp.json` in the project root and add the following block:

```json
{
  "mcpServers": {
    "shengwang-docs": {
      "type": "http",
      "url": "https://doc-mcp.shengwang.cn/mcp"
    }
  }
}
```

#### Codex

**Add with the `CLI`:**

```bash
codex mcp add shengwang-docs --url https://doc-mcp.shengwang.cn/mcp
```

**Or configure manually:**

Create or edit `.codex/config.toml` in the project root and add the following block:

```toml
[mcp_servers.shengwang-docs]
url = "https://doc-mcp.shengwang.cn/mcp"
```

#### Cursor

**Manual configuration:**

Create or edit `.cursor/mcp.json` in the project root and add the following block:

```json
{
  "mcpServers": {
    "shengwang-docs": {
      "url": "https://doc-mcp.shengwang.cn/mcp"
    }
  }
}
```

#### Kiro

**Manual configuration:**

Create or edit `.kiro/settings/mcp.json` in the project root and add the following block:

```json
{
  "mcpServers": {
    "shengwang-docs": {
      "url": "https://doc-mcp.shengwang.cn/mcp"
    }
  }
}
```

#### VS Code & Copilot

**Add with the `CLI`:**

```bash
code --add-mcp '{"name":"shengwang-docs","type":"http","url":"https://doc-mcp.shengwang.cn/mcp"}'
```

**Or configure manually:**

Create or edit `.vscode/mcp.json` in the project root and add the following block:

```json
{
  "servers": {
    "shengwang-docs": {
      "type": "http",
      "url": "https://doc-mcp.shengwang.cn/mcp"
    }
  }
}
```

## MCP Tools

- `search-docs`: Search for relevant documentation.
- `list-docs`: Browse documentation categories and document lists.
- `get-doc-content`: Read the full content of a specified document.

## Call MCP Tools

**Automatic invocation by the coding agent**

In Agent Mode, you can describe your requirements directly and let the coding agent decide when to call MCP tools.

For example:

> Search for relevant Agora documentation and retrieve the document content. Tell me how to implement the simplest possible 1v1 real-time audio and video call.

**Specify the invocation in the prompt**

You can also specify which MCP tools to use in the prompt by using the tool-calling syntax supported by your AI IDE.

For example:

> #search-docs #get-doc-content Use search-docs to search for relevant Agora documentation, use get-doc-content to retrieve the full content of the matching documents, and tell me how to build interactive conversations with an AI agent.
