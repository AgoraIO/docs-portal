---
title: Custom Tools
description: Create reusable HTTP tools, test them, and attach them to agents in Agent Studio.
---
Custom Tools let your agent call your own HTTP endpoints during a conversation. Create the tool once in **Integration**, then attach it to any agent in same project.

Use Custom Tools when you already have an HTTP API and want your agent to call it directly.

- Use a **Knowledge Base** for document retrieval.
- Use an **MCP server** when you already expose tools through MCP.
- Use a **Connector** when Agent Studio provides a built-in integration such as HubSpot.

## Before you begin

- Your API must be reachable over `http` or `https`.
- The URL host cannot be `localhost` or a private/internal network address.
- If your API requires secrets, pass them in headers instead of query parameters.

## Create a custom tool

1. In Agent Studio, select **Integration**.
2. Open the **Custom Tools** tab.
3. Click **Add Custom Tool**.
4. Fill in the tool settings.

## Configure the request

- **Name**: Display name shown in Agent Studio.
- **Description**: Optional notes for your team.
- **Request URL**: Target endpoint. Supports placeholders such as `https://api.example.com/orders/{{order_id}}`.
- **Method**: `GET`, `POST`, `PUT`, `PATCH`, or `DELETE`.
- **Timeout (ms)**: Maximum wait time. Agent Studio supports values up to `60000`.

### Headers

Use headers for authentication and request-specific config.

- Sensitive header names such as `Authorization`, `api-key`, `token`, `secret`, and `cookie` are treated as secrets.
- Saved sensitive values are masked in the UI as `***`.
- Put static secrets in headers, not in URL query parameters.

### Query parameters

Add query string fields as key-value pairs.

You can use placeholders here too, for example:

```text
status={{ticket_status}}
limit={{page_size}}
```

## Configure function calling

This section tells the LLM when and how to call your tool.

- **Function Name**: Runtime tool name. Use letters, numbers, and `_`. Must start with a letter or `_`.
- **Function Description**: Explain when agent should call tool.
- **Parameters JSON**: JSON Schema object that defines allowed input fields.
- **Body Template JSON**: Optional JSON payload sent in request body.

Example:

```json
{
  "type": "object",
  "properties": {
    "order_id": { "type": "string" },
    "include_history": { "type": "boolean" }
  },
  "required": ["order_id"]
}
```

Example body template:

```json
{
  "order_id": "{{order_id}}",
  "include_history": "{{include_history}}"
}
```

## Placeholder rules

Custom Tools support placeholders in:

- Request URL path
- Headers
- Query parameters
- Body template

Rules:

- Placeholder names must match parameter names from **Parameters JSON**.
- Hostnames cannot contain placeholders.
- Unknown placeholders are rejected when you save the tool.
- Malformed placeholders such as `{{ bad-name }}` are rejected.

## Test the tool

After saving, use the tool test action in **Integration** to run a request with sample inputs.

Check:

- Request reaches correct endpoint.
- Auth headers work.
- Response body contains only data you want agent to see.
- Timeout is long enough for normal responses.

## Attach the tool to an agent

Creating a Custom Tool does not make it available to an agent automatically.

1. Open your agent.
2. Go to **Actions**.
3. In **Custom Tools**, click **Add Custom Tools**.
4. Select one or more tools.
5. Save the agent.

After attachment, the LLM can call the tool during test sessions and production conversations.

## Prompting tips

Put usage guidance in your system prompt. Example:

```text
Use `lookup_order` when user asks about order status. Always confirm the order ID before calling the tool.
```

## Troubleshooting

- Tool save fails: Check JSON schema, function name format, and placeholder names.
- Tool test fails immediately: Check URL scheme and public reachability.
- Request rejected by your API: Check auth headers, body shape, and query params.
- Agent never calls tool: Improve function description and system prompt so tool intent is clear.

## Next steps

- [Manage integrations](integrations): Manage reusable resources for your workspace
- [Customize your agent](customize-agent): Attach Custom Tools from the Actions tab
- [Test your agent](test-agent): Verify tool calling behavior end to end
