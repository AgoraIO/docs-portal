---
title: HubSpot Connector
description: Connect HubSpot to Agent Studio and let your agents work with HubSpot contacts and tickets.
---
HubSpot Connector lets your agent use your HubSpot account during conversations. After you connect HubSpot and attach connector to agent, agent can work with HubSpot contacts and tickets.

## What the connector enables

When HubSpot is attached to an agent, Agent Studio can expose HubSpot tools for:

- Listing contacts
- Searching contacts
- Getting contact details
- Creating contacts
- Updating contacts
- Deleting contacts
- Listing tickets
- Searching tickets
- Getting ticket details
- Creating tickets
- Updating tickets
- Deleting tickets

## Before you begin

- You need a HubSpot account.
- You need permission to authorize HubSpot app for your workspace.
- You need an agent in same project where you want to use connector.

## Connect HubSpot

1. In Agent Studio, select **Integration**.
2. Open the **Connector** tab.
3. Find **HubSpot**.
4. Click **Connect**.
5. Complete HubSpot OAuth flow in new browser tab.
6. Return to Agent Studio and wait for connection status to update.

After connection succeeds, HubSpot appears in **Connected**.

## Attach HubSpot to an agent

1. Open your agent.
2. Go to **Actions**.
3. In **Connector**, add HubSpot.
4. Save the agent.

After attachment, your agent can call HubSpot tools during testing and live conversations.

## Prompting tips

Tell the agent exactly when to use HubSpot. Example:

```text
When user asks about ticket status, search HubSpot tickets first. When user wants to update their contact email, update HubSpot contact after confirming new email address.
```

Good prompt patterns:

- Confirm identity before reading or changing CRM data.
- Ask for missing fields before create or update operations.
- Summarize changes after tool call succeeds.
- Avoid destructive actions unless user clearly confirms.

## Test the connector

Use Agent Studio test panel to verify:

1. Agent can find known contact.
2. Agent can find or create ticket.
3. Agent handles HubSpot errors gracefully.

If test fails, check both agent prompt and HubSpot connection status.

## Disconnect HubSpot

1. Go to **Integration**.
2. Open **Connector**.
3. In **Connected**, find HubSpot.
4. Click **Disconnect**.

Disconnecting HubSpot removes connector access for agents that depend on it.

## Troubleshooting

- Connect button opens OAuth page but status never changes: Wait a few seconds, then refresh connection list.
- Agent cannot use HubSpot after connection: Make sure connector is attached to that agent.
- Agent gives poor results: Tighten system prompt with clearer rules for search, create, and update behavior.
- Permission issues in HubSpot: Reconnect with account that has required HubSpot scopes.

## Next steps

- [Manage integrations](integrations): Manage connectors and other reusable resources
- [Customize your agent](customize-agent): Attach connectors in agent Actions
- [Test your agent](test-agent): Validate HubSpot-backed workflows before deployment
