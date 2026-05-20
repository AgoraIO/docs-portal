---
title: Pricing & Access
description: Check service access requirements, product pricing models, and billing operations in Agora Console.
---

Before you integrate a product, confirm that the service is enabled for your project, collect the credentials you need, and check how usage is billed.

## Service access

To access most Agora products you need:

- An App ID.
- An App Certificate if your backend generates tokens.
- A project with the required service enabled.

For production, use token-based authentication instead of App ID only.

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
