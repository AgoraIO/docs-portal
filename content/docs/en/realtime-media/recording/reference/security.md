---
title: Security
description: Understand the shared security model around Cloud Recording, credentials, transport, and stored media.
---

Cloud Recording security depends on both Agora's service controls and your own handling of credentials, storage, and downstream access.

## Shared responsibility model

Agora is responsible for the managed recording infrastructure and transport layer protections that support the service. You remain responsible for:

- protecting App ID, App Certificate, Customer Secret, and storage credentials
- keeping token generation on the server side
- controlling access to recorded files in third-party storage
- validating webhook requests and securing callback endpoints

## Minimum recommendations

- Keep all signing secrets and storage secrets on the server side only.
- Use token authentication for channels that need controlled recorder access.
- Rotate REST and storage credentials according to your internal policy.
- Restrict read access to recorded files and callback logs.
- Review firewall and webhook exposure before production rollout.

## Data handling notes

- Recorded media is stored in the third-party cloud storage you configure for Cloud Recording.
- Callback payloads and monitoring logs can contain operational metadata. Treat them as production data.
- If you need stronger organizational review, include Cloud Recording in your broader platform threat model and compliance review.

## Related resources

- [Authenticate REST calls](restful-authentication)
- [Deploy a token server](../develop/authentication-workflow)
- [Firewall requirements](firewall)
