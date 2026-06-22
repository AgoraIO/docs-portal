---
title: Firewall requirements
description: use Agora products in environments with restricted network access
---
To use Agora products in environments with restricted network access, configure your firewall rules to allow the domains and ports required by the relevant SDKs and services.

## Key idea

Firewall configuration depends on:

- whether you are using Web or native SDKs
- whether Signaling is part of the integration
- whether the environment uses RTC transport only or broader messaging flows

## What to do next

- Review the transport and messaging products your integration depends on.
- Add the required domains and ports to your firewall allowlist.
- Re-test the full join and media path after configuration.

## Related resources

- [Security](security)
- [Agora account management](../get-started/manage-agora-account)
