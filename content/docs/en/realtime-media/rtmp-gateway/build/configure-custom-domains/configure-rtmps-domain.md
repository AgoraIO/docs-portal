---
title: "Configure a custom RTMPS domain"
description: "Manage your own RTMPS streaming domain and TLS certificate through the Media Gateway REST API."
---
To push streams over RTMPS using your own domain name, you need a TLS certificate bound to that domain. You can manage both through the Media Gateway REST API.

This guide explains how to get a certificate, bind it to a domain, and push RTMPS to that domain.

## Understand the tech

Media Gateway selects a TLS certificate for an incoming RTMPS connection based on the domain name the client requests during the TLS handshake (SNI). To use your own domain:

1. Get a TLS certificate for the domain, either by requesting one issued by Agora or importing your own.
2. Bind the certificate to your domain using the alias domain API.
3. Configure your streaming software to connect to your domain using RTMPS.

You can get a certificate in one of following ways:

| Method | `action` value | Description |
| --- | --- | --- |
| Request an Agora-issued certificate | `request` | Submit a domain name. Agora issues and manages the certificate. |
| Import your own certificate | `import` | Upload your PEM-encoded certificate, private key, and certificate chain. |

## Implementation

Follow these steps.

### Get a certificate

To request an Agora-issued certificate:

```bash
curl --request POST \
  --url https://api.agora.io/${region}/v1/projects/${appId}/rtls/ingress/certificates \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Basic XXXXXX' \
  --data '{
    "settings": {
      "action": "request",
      "domainName": "live.example.com",
      "subjectAlternativeNames": ["live.example.com"]
    }
  }'
```

To import your own certificate:

```bash
curl --request POST \
  --url https://api.agora.io/${region}/v1/projects/${appId}/rtls/ingress/certificates \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Basic XXXXXX' \
  --data '{
    "settings": {
      "action": "import",
      "certificate": "<Base64-encoded PEM leaf certificate>",
      "privateKey": "<Base64-encoded PEM private key>",
      "certificateChain": "<Base64-encoded PEM certificate chain>"
    }
  }'
```

Check the certificate status before you bind it to a domain:

```bash
curl --request GET \
  --url https://api.agora.io/${region}/v1/projects/${appId}/rtls/ingress/certificates/${certificateId} \
  --header 'Authorization: Basic XXXXXX'
```

A requested certificate starts in `PENDING` status and moves to `ISSUED` once Agora finishes issuing it. An imported certificate moves to `ISSUED` once Media Gateway validates that the certificate, private key, and chain match. Only a certificate in `ISSUED` status can be bound to a domain.

### Bind the certificate to your domain

Once the certificate status is `ISSUED`, bind it to your domain using the alias domain API.

```bash
curl --request POST \
  --url https://api.agora.io/${region}/v1/projects/${appId}/rtls/ingress/alias-domains \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Basic XXXXXX' \
  --data '{
    "settings": {
      "domain": "live.example.com",
      "certificateID": "<certificate ID>",
      "domainType": 0
    }
  }'
```

`domainType` marks whether the domain is a primary (`0`) or backup (`1`) streaming domain. If you're not using [dual-stream high availability](../../reference/integration.md), use `0`.

### Push RTMPS to your domain

Configure your streaming software to push to your domain over RTMPS:

```
rtmps://live.example.com/{app}/{streamKey}
```

## Notes

- Your certificate's subject alternative names (SANs) must cover the domain you bind it to. A wildcard certificate for `*.example.com` matches `live.example.com` but not `stream.live.example.com`.
- Domain and certificate changes aren't instant. Allow a few minutes for the configuration to propagate before you test the new domain.
- Your streaming client must send the correct domain name as the SNI value during the TLS handshake. If it doesn't, Media Gateway serves the default certificate instead of yours.
