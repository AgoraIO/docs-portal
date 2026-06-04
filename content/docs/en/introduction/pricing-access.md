---
title: Pricing & Access
description: Check service access requirements, product pricing models, and billing operations in Agora Console.
---

Before you integrate a product deeply or ship it to real users, confirm that the service is enabled for your project, collect the credentials you need, and understand how usage is billed.

## Why this page matters

Users usually look for pricing only after a demo works. In practice, you should also check it earlier to avoid building against a service that is not enabled, choosing the wrong environment assumptions, or underestimating how production traffic will be measured.

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

## Product pricing examples

### Conversational AI Engine

Conversational AI Engine bills by usage. Creating an agent instance and joining a channel incurs an audio task fee:

- **Conversational AI Engine Audio Task**: `USD 0.10 / minute`
- **Free quota**: first `300 minutes`

When you use Agora-managed ASR, LLM, and TTS providers, that usage is included in the unit price. When you use your own provider keys, those third-party services are billed directly by the provider.

### Signaling

Signaling is priced by:

- Message volume
- Storage utilization
- Peak concurrent users (PCU)

Available package tiers include **Free**, **Starter**, **Pro**, **Business**, and **Enterprise**, each with different limits and overage rules.

## Billing center

In Agora Console you can:

- Check your account balance
- Add money with a credit card or bank transfer
- View invoices and transactions
- Export transactions and invoices as CSV files

If your account has multiple members, only those assigned to **Admin**, **Finance**, or an authorized custom team can access the **Billing** page.

## Where to go next

- Read [Projects](/en/introduction/projects) if you need to confirm the project and credential boundary first.
- Read [Console setup](/en/introduction/console-setup) if you are still enabling services or collecting credentials.
- Read [Security and privacy](/en/introduction/security-privacy) before production rollout.
