---
title: "Agora account management"
description: "Create and manage the Agora account and project setup required for Interactive Whiteboard."
---

Before you build with Interactive Whiteboard, you need an Agora account, a project, and the project credentials used by the Whiteboard SDK and REST APIs.

## Create an Agora account

Sign up for an Agora account with your email address, phone number, or a supported third-party account, then sign in to [Agora Console](https://console.agora.io/v2).

## Create a project

In [Agora Console](https://console.agora.io/v2/project-management):

1. Open **Projects**.
2. Click **Create New**.
3. Enter a project name and choose the appropriate use case.
4. Select **Secured mode: APP ID + Token (Recommended)**.
5. Submit the project.

## Get project credentials

After the project is created, collect the credentials required for Interactive Whiteboard:

- **App ID / App Identifier**
- **App Certificate**
- Whiteboard-specific credentials shown after the whiteboard service is enabled

You use these credentials when:

- enabling Interactive Whiteboard
- generating SDK tokens, room tokens, and task tokens
- configuring your app server integrations

## Next steps

- [Enable whiteboard](enable-whiteboard.md)
- [Secure authentication with tokens](authentication-workflow.md)
- [Generate tokens using REST API](generate-token-rest.md)
