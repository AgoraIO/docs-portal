---
title: Create your first agent
description: Create and test your first AI voice agent in minutes using a pre-built template.
---
This page guides you through creating and testing your first AI voice agent. In less than 10 minutes, you will have a working agent that you can speak to in the browser. No telephony setup is required.

:::tip[Prefer natural language?]
Use [Concierge](build/concierge) to build and test an agent by describing what you want instead of following the steps below.
:::

## Create an agent

To create your first agent:

1. Log in to [Agora Console](https://console.agora.io).
2. Select your project from the project dropdown at the top of the page. The agent uses this project's credentials to connect to Agora, and usage is billed to this project.
3. In the navigation sidebar, select **Agents**.

    ![](/console-tmp/agent-list.png)

4. Select **Create Agent**.

    ![](/console-tmp/create-agent.png)

5. Under **Choose a template**, select the **Blank Template**.
6. Enter a name for your agent.
7. Select **Create Agent**.

    The agent editor opens with a system prompt and pre-configured model settings.

    ![](/console-tmp/agent-editor-prompt.png)

## Configure your agent

The agent editor is organized into tabs. For the quickstart, you only need to review the **Prompt** tab and the **Models** tab.

### Review the prompt

The agent editor opens with the following prompts:

- **System Prompt**: Defines how your agent behaves.
- **Greeting Message**: The first thing your agent says when a session starts. Type in a greeting such as `Hello, how can I help you today?`
- **Failure Message**: Used when the LLM encounters an error or fails to respond.

### Review selected models

Models determine which ASR, LLM, and TTS services your agent uses to process speech, generate responses, and synthesize voice output.

1. Select the **Models** tab.

    ![](/console-tmp/agent-editor-models.png)

2. Review the pre-selected models for **Automatic Speech Recognition (ASR)**, **Large Language Model (LLM)**, and **Text-to-Speech (TTS)**. You can use the defaults or select a different vendor-model from the dropdowns.

The dropdowns list vendor-model combinations that support Agora Managed Key. When you use a managed key, Agora provides the API credentials for your selected vendor. You do not need to obtain an API key directly from the vendor. See [Pricing](../reference/pricing) for details. To use your own API key or use a vendor that does not support a managed key, see [Customize your agent](build/customize-agent).

## Test the agent

1. Select the **Test** tab in the right panel.
2. Select **Start Call** to start a test call.
3. Allow microphone access when prompted.
4. Speak to the agent to verify it responds correctly.

For guidance on what to test and how to troubleshoot issues, see [Test your agent](build/test-agent).

## Next steps

You now have a working voice agent. From here you can:

- [Customize your agent](build/customize-agent): Fully configure models, prompts, and advanced settings for your use case
- [Manage integrations](build/integrations): Manage API credentials, knowledge bases, and MCP servers for reuse across agents