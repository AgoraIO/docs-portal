---
title: Concierge
description: Use Concierge to build, debug, analyze, and test Agent Studio workflows in a project-scoped workspace.
---
Concierge is project-scoped workspace for working with Agent Studio using natural language. Use it to explore resources in current project, troubleshoot configuration, and prepare changes faster than clicking through each page manually.

## What Concierge is for

Use Concierge when you want to:

- Build or refine agent workflows
- Debug why something is not working
- Analyze project setup or resource state
- Test changes before deployment

Concierge keeps its work inside current project context.

## Open Concierge

1. In Agent Studio, open your project.
2. Select **Concierge** from sidebar.
3. Start new thread or continue existing thread.

Each thread keeps its own conversation history.

## Working modes

Concierge supports different working modes for different tasks:

- **Build**: Create or refine agent setup.
- **Debug**: Investigate errors, misconfigurations, or failed behavior.
- **Analyze**: Inspect project state, resources, or workflow design.
- **Test**: Validate expected behavior before you deploy changes.

Pick mode that matches task, then describe goal clearly.

## Good requests

Examples:

- `Help me configure agent for appointment reminders.`
- `Why is my agent not using HubSpot during test calls?`
- `Review this project and tell me which integrations are attached to agent.`
- `Help me prepare outbound campaign with CSV variables.`

## Files and upload-assisted flows

Concierge can help with workflows that involve uploaded files, such as:

- Knowledge base documents
- Campaign CSV files

When file upload is needed, Concierge guides you through upload step, then continues workflow after file is available.

## Best practices

- Be specific about goal, agent name, and expected outcome.
- Mention exact resource when possible, such as campaign name or integration name.
- Use short iterative requests instead of one giant prompt when debugging.
- Re-run request in **Test** mode after making changes.

## Troubleshooting

- Concierge cannot complete task: Check that required project resources exist first.
- Results are too broad: Include exact agent, campaign, or integration name.
- File-based workflow stalls: Confirm upload finished, then retry instruction.

## Next steps

- [Manage integrations](integrations): Prepare resources Concierge can work with
- [Customize your agent](customize-agent): Apply agent-level configuration changes
- [Set up a campaign](../deploy/campaign): Prepare outbound calling workflows
