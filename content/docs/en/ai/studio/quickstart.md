---
title: Quickstart
description: Create and test your first AI voice agent in minutes using a pre-built template.
---
This page guides you through creating and testing your first AI voice agent using Agent Studio. In less than 10 minutes, you will have a working agent that you can speak to in the browser. No telephony setup is required.

## Prerequisites

Make sure you have the following:

- An active Agora account and project
- [Enabled Conversational AI](../reference/enable-conversational-ai) for your Agora project

## Create an agent

To create your first agent:

1. Log into [Agora Console](https://console.agora.io) and open [Agent Studio](https://console.agora.io/studio).
    ![](https://assets-docs.agora.io/images/conversational-ai/studio/create-agent.png)
2. Select **Agents** from the sidebar, then click **Create Agent**.
3. Select an Agora project from the dropdown. The agent uses this project's credentials to connect to Agora, and usage is billed to this project.
    ![](https://assets-docs.agora.io/images/conversational-ai/studio/create-agent-template.png)
4. Under **Choose a template**, select the **Blank Template**.
5. Enter a name for your agent.
6. Click **Create Agent**.

    Studio opens the agent editor with a system prompt and pre-configured model settings.

![](https://assets-docs.agora.io/images/conversational-ai/studio/agent-editor-prompt.png)

## Configure your agent

The agent editor is organized into tabs. For the quickstart, you only need to review the **Prompt** tab and the **Models** tab.

### Review the prompt

The agent editor opens with the following prompts:

1. **System prompt**: It defines how your agent behaves.
2. **Greeting message**: It is the first thing your agent says when a session starts. Type in a greeting such as `Hello, how can I help you today?`
3. **Failure message**: It is used when the LLM encounters an error or fails to respond.

### Review selected models

Models determine which ASR, LLM, and TTS services your agent uses to process speech, generate responses, and synthesize voice output.

1. Click the **Models** tab.
    ![](https://assets-docs.agora.io/images/conversational-ai/studio/agent-editor-models.png)
2. Review the pre-selected models for **Automatic Speech Recognition (ASR)**, **Large Language Model (LLM)**, and **Text-to-Speech (TTS)**. You can use the defaults or select a different vendor-model from the dropdowns.

The dropdowns list vendor-model combinations that support Agora Managed Key. When you use a managed key, Agora provides the API credentials for your selected vendor. You do not need to obtain an API key directly from the vendor. See [Pricing](../pricing) for details. To use your own API key or use a vendor that does not support a managed key, see [Customize your agent](build/customize-agent).

## Test the agent

1. In the right panel, click **Start Call** to start a test call.
2. Allow microphone access when prompted.
3. Speak to the agent to verify it responds correctly.

For guidance on what to test and how to troubleshoot issues, see [Test your agent](build/test-agent).

## Next steps

You now have a working voice agent. From here you can:

- [Customize your agent](build/customize-agent): Fully configure models, prompts, and advanced settings for your use case
- [Manage integrations](build/integrations): Manage API credentials, knowledge bases, and MCP servers for reuse across agents
