---
title: Projects
description: Set up the project boundary for your app, enable the right services, and manage the credentials your integration depends on.
---

## Why this page matters

In Agora, a project is the operational boundary for a product environment. It holds the App ID, certificate configuration, enabled services, and billing context that the rest of your integration depends on.

If your project setup is wrong, the rest of the docs may still be correct but your implementation will fail later through missing credentials, disabled services, or the wrong security mode.

## What you do here

Use the **Projects** page in Agora Console to:

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

1. Open the **Projects** page in Agora Console.
2. Click **Create New**.
3. Enter a project name and use case.
4. Select **App ID + Token (Recommended)** as the authentication mechanism.
5. Click **Submit**.

## What to check in project details

On the project details page, confirm that you can:

- copy the App ID used by your application
- view whether token-based security is enabled
- access the App Certificate when your backend needs token generation
- verify that the project is the one your current environment should use

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
- Read [Pricing & Access](/en/introduction/pricing-access) to check service enablement and billing implications before launch.
- Read [Security and privacy](/en/introduction/security-privacy) before production rollout.
