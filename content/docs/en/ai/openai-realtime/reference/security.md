---
title: Security
description: How Agora handles security.
---
Security in this integration path depends on both sides of the system:

- Agora-side project, token, and transport security
- model-side credential handling and request validation

## Minimum recommendations

- Keep project secrets and provider API keys on the server side.
- Separate local, staging, and production credentials.
- Limit exposure of tokens and short-lived credentials.
- Validate webhook or callback signatures where applicable.
- Review transport and firewall constraints before production rollout.

## Related resources

- [Firewall requirements](firewall.md)
- [Agora account management](../get-started/manage-agora-account.md)
