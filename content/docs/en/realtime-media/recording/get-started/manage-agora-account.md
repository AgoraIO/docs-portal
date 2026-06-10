---
title: Agora account management
description: Create a project, collect credentials, and prepare the Console state required for Cloud Recording.
---

Before you start Cloud Recording, prepare an Agora account, create a project, and collect the credentials your backend will use for both RTC and REST flows.

## What you need

- An Agora account
- A project in [Agora Console](https://console.agora.io/v2)
- App ID and App Certificate for the project that will be recorded
- Customer ID and Customer Secret for REST API authentication
- Temporary or server-generated token strategy if the target channel uses tokens

## Basic setup flow

1. Sign in to [Agora Console](https://console.agora.io/v2).
2. Create a project and select **Secured mode: App ID + Token (Recommended)**.
3. Copy the **App ID** from the project list.
4. Open the project and copy the **Primary Certificate** if your recording flow uses tokens.
5. Generate the REST API **Customer ID** and **Customer Secret** from the Console RESTful API toolkit.
6. Enable **Cloud Recording** for the project before testing the REST workflow.

## Related resources

- [REST quickstart](getstarted)
- [Authenticate REST calls](../reference/restful-authentication)
- [Implement token authentication](../develop/authentication-workflow)
- [Agora account](/en/introduction/account)
