---
title: Projects
description: Set up the project boundary for your app, enable the right services, and manage the credentials your integration depends on.
---

## Why this page matters

In Agora, a project is the operational boundary for a product environment. It holds the App ID, certificate configuration, enabled services, and billing context that the rest of your integration depends on.

If your project setup is wrong, the rest of the docs may still be correct but your implementation will fail later through missing credentials, disabled services, or the wrong security mode.

## What you do here

Use the project selector and **Project credentials** in Agora Console to:

- create a new project for a product or environment
- choose the authentication mode for that project
- copy the App ID used by clients and services
- manage App Certificates for token-based access
- check whether the project is configured the way your integration expects

## Recommended setup

For most teams:

- create separate projects for development, testing, and production
- use **App ID + Token** instead of App ID only
- keep certificate management on the server side
- confirm the correct project is being used before debugging client or backend code

## Create a project

1. In [Agora Console](https://console.agora.io), open the project selector at the top of the page.
2. Select **Create project**.
3. Enter a project name. The default authentication mode is **App ID + Token**: clients need a valid token to connect.
4. Click **Create Project**.

Eligible existing accounts can select **Testing mode: App ID only** under **Need App ID-only access?**. In this mode, anyone with your App ID can join without a token. Use it only for testing, and switch to App ID + Token before production.

## Require App ID + Token for an existing project

Enabling an App Certificate allows your server to generate tokens. It does not, by itself, confirm that App ID-only access is disabled. Check the **Authentication mode** in **Project credentials**.

Before switching a project that allows App ID-only access, update all clients to use valid tokens. Requests that use only the App ID will fail after App ID-only access is disabled.

1. Open **Project credentials** for the intended project.
2. Under **Authentication mode**, click **Require App ID + Token**.
3. Review the affected App ID and the warning, then confirm **Require App ID + Token**. Cancel to keep the current setting.
4. Check that the displayed mode is **App ID + Token required**.

The confirmation changes the authentication requirement. It does not disable the project or delete its certificates. See [Credentials](/en/realtime-media/rtc/core-concepts?platform=web#credentials) for App ID, App Certificate, and Token usage.

## What to check in project details

On the project details page, confirm that you can:

- copy the App ID used by your application
- view whether token-based security is enabled
- access the App Certificate when your backend needs token generation
- verify that the project is the one your current environment should use

## Service access

To access most Agora products you need:

- An App ID.
- An App Certificate if your backend generates tokens.
- A project with the required service enabled.

For production, use token-based authentication instead of App ID only.

## What to verify before launch

Before moving beyond a prototype, confirm:

- the required service is enabled for the correct project
- the authentication mode matches your intended production design
- the billing unit makes sense for your usage pattern
- the right people on your team can access billing and financial records

## Manage App Certificates

Agora provides two certificate roles:

- **Primary Certificate** for normal token generation
- **Secondary Certificate** for production rotation and controlled cutovers

If you suspect a certificate is compromised:

1. Enable the Secondary Certificate.
2. Swap the certificates.
3. Disable the old secondary certificate.
4. Delete the original primary certificate after clients and services have moved over.

Deleting a certificate invalidates all tokens generated with that certificate.

## Restrictions

- If your account has multiple members, only those assigned to the **Admin**, **Engineer**, or an authorized custom team can access the **Projects** page.
- Each Agora account can create up to 20 projects. If you need to create more projects, submit a support ticket.

## Where to go next

- Open [Console setup](/en/introduction/console-setup) to understand the first-time console workflow around credentials and service activation.
- Read [Billing](/en/introduction/billing) to understand free allowances, settlement, and package options before launch.
- Read [Security and privacy](/en/introduction/security-privacy) before production rollout.
