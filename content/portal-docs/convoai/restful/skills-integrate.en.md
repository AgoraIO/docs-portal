---
title: Integrate with Skills
description: "You can integrate Agora products more efficiently with an AI coding agent. By configuring Shengwang Skills, the coding agent can gain task routing, integration workflows, and generation rules for Agora products, and combine them with the latest official documentation to provide more accurate and efficient assistance in requirement analysis, product integration, code generation, and troubleshooting."
---

# Integrate with Skills

You can integrate Agora products more efficiently with an AI coding agent. By configuring Shengwang Skills, the coding agent can gain task routing, integration workflows, and generation rules for Agora products, and combine them with the latest official documentation to provide more accurate and efficient assistance in requirement analysis, product integration, code generation, and troubleshooting.

## Install Shengwang Skills

Choose one of the following methods to install Skills:

#### Skills CLI

Install with the `CLI`:

```bash
npx skills add Shengwang-Community/skills
```

This is the most direct installation method. After the installation is complete, restart the session or refresh the skill list according to the instructions for your coding agent.

#### Claude Code Plugin Marketplace

Run the following command in `Claude Code` to install:

```bash
plugin marketplace add Shengwang-Community/skills
```

#### OpenClaw

Install through `ClawHub`:

```bash
clawhub install voice-ai-integration
clawhub update voice-ai-integration
```

Use `install` for the first installation and `update` for subsequent updates.

## Repository

- [Shengwang Skills](https://github.com/Shengwang-Community/skills)

## Best Practices

After configuring Skills, you can describe tasks such as integration, code generation, or troubleshooting directly in your coding agent. Skills help the coding agent select appropriate integration workflows and generation rules, and supplement the latest Agora documentation so that generated code, configuration guidance, and issue diagnosis are more accurate.

- Clearly specify the Agora product name, target platform, development language, and target capability in your prompt.
- Provide as much context as possible, such as your current tech stack, existing code, expected interaction flow, and whether you need tokens or server-side examples. This makes it easier for the AI to produce a solution you can use directly.
- If you are troubleshooting, provide the observed issue, reproduction steps, error logs, error codes, and console screenshots or call stack information whenever possible, so the coding agent can narrow down the problem faster.
- For complex tasks, prefer AI IDEs that support stronger models and more complete capabilities, so you can get more stable code generation and issue analysis.

## Prompt Example

After configuring Skills, you can send content like the following prompt to the coding agent to generate an AI voice conversation demo with real-time subtitles:

```text
Build me an AI voice conversation demo. After the user opens the web page, they can click "Start Conversation" to talk with the AI by voice, and the page displays real-time conversation subtitles.

## Tech stack

- Frontend: Next.js + React + TypeScript + Tailwind CSS
- Backend: FastAPI (Python)

## Requirements

1. Start/end voice conversation with one click
2. Display real-time subtitles for both the user and the AI
3. Mute/unmute microphone
4. Show AI status (listening, thinking, speaking)
5. System log panel
```
