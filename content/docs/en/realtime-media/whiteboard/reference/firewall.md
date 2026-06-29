---
title: "Firewall requirements"
description: "Use Interactive Whiteboard in environments with restricted network access."
---

Large organizations, such as enterprises, hospitals, universities, and banks, typically deploy firewalls to isolate internal networks from external ones, ensuring robust information security. For enterprise users needing to access the Agora Interactive Whiteboard service in such restricted environments, this guide provides the necessary steps to configure a firewall whitelist.

## Prerequisites
Before proceeding with firewall configuration, ensure that the latest version of the Whiteboard SDK is integrated into your app.

## Firewall Whitelist Configuration

To enable seamless access to the Interactive Whiteboard service, add the following domains to your firewall whitelist. Additionally, ensure that port 443 is open for all listed domains to guarantee proper communication with the service.

```text
*.whiteboard.sd-rtn.com
*.whiteboard.rtelink.com
*.netless.link
*.whiteboard.agora.io
rest-argus-ad.agoralab.co
```

## List of domain names

Following is a detailed list of domain names utilized by the Agora interactive whiteboard service.

| Domain     | Port         | Functional purpose         |
|:-----------|:-------------|:----------------------------|
| **API domains**          | |   |
| `api.netless.link`         | https/443    | - Get whiteboard configuration<br /> - Server-side RESTful requests, such as transcoding.<br />   |
| `api.whiteboard.agora.io`  | https/443    | - Get whiteboard configuration<br /> - Server-side RESTful requests, such as transcoding.<br />   |
| `api.whiteboard.sd-rtn.com` | https/443    | - Get whiteboard configuration<br /> - Server-side RESTful requests, such as transcoding.<br />   |
| `api.whiteboard.rtelink.com`            | https/443    | - Get whiteboard configuration<br /> - Server-side RESTful requests, such as transcoding.<br />   |
| **US region gateways**   | |   |
| `gateway-us-fpa.netless.link`           | https/443, wss/443 | United States Whiteboard Server Gateway            |
| `gateway-us-sv.netless.link`            | https/443, wss/443 | United States Whiteboard Server Gateway            |
| `gateway-us-sv.whiteboard.rtelink.com`  | https/443, wss/443 | United States Whiteboard Server Gateway            |
| `gateway-us-sv.whiteboard.agora.io`     | https/443, wss/443 | United States Whiteboard Server Gateway            |
| **India region gateways**| |   |
| `gateway-in2-mum.netless.link`          | https/443, wss/443 | India Whiteboard Server Gateway      |
| `gateway-in2-mum.whiteboard.agora.io`   | https/443, wss/443 | India Whiteboard Server Gateway      |
| `gateway-in2-mum.whiteboard.rtelink.com`| https/443, wss/443 | India Whiteboard Server Gateway      |
| **Singapore region gateways**         | |   |
| `gateway-sg-fpa.netless.link`           | https/443, wss/443 | Singapore Whiteboard Server Gateway      |
| `gateway-sg.netless.link`  | https/443, wss/443 | Singapore Whiteboard Server Gateway      |
| `gateway-sg.whiteboard.agora.io`        | https/443, wss/443 | Singapore Whiteboard Server Gateway      |
| `gateway-sg.whiteboard.rtelink.com`     | https/443, wss/443 | Singapore Whiteboard Server Gateway      |
| **European region gateways**          | |   |
| `gateway-eu-fpa.netless.link`           | https/443, wss/443 | Europe Whiteboard Server Gateway         |
| `gateway-eu.netless.link`  | https/443, wss/443 | Europe Whiteboard Server Gateway         |
| `gateway-eu.whiteboard.rtelink.com`     | https/443, wss/443 | Europe Whiteboard Server Gateway         |
| `gateway-eu.whiteboard.agora.io`        | https/443, wss/443 | Europe Whiteboard Server Gateway         |
| **SDK and logging domains**           | |   |
| `sdk.netless.link`         | https/443    | Get the whiteboard hot reload module     |
| `sdk.whiteboard.rtelink.com`            | https/443    | Get the whiteboard hot reload module     |
| `sdk.whiteboard.sd-rtn.com` | https/443    | Get the whiteboard hot reload module     |
| `rest-argus-ad.agoralab.co` | https/443    | Client whiteboard-related log reporting  |
| **Event tracking domains**            | |   |
| `event.netless.link`       | https/443    | Client event tracking report|
| `event.whiteboard.sd-rtn.com`           | https/443    | Client event tracking report|
| **Recording domains**    | |   |
| `cdnroom-us-sv-aws.netless.link`        | https/443    | United States whiteboard recording data request domain name     |
| `cdnroom-sg.netless.link`  | https/443    | Singapore whiteboard recording data request domain name            |
| `cdnroom-in-mum.netless.link`           | https/443    | India whiteboard recording data request domain name            |
| `cdnroom-eu.netless.link`  | https/443    | Europe whiteboard recording data request domain name  |
