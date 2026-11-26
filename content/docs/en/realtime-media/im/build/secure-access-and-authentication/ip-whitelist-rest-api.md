---
title: "RESTful API IP allowlist"
description: "Describes the RESTful API IP allowlist function"
---

For added security, Agora Chat provides an IP allowlist for the RESTful APIs. If you add IP addresses to the allowlist in [Agora Console](https://console.agora.io/), only those addresses can call the Chat RESTful APIs.

### Add an IP address to the IP allowlist

To add an IP address:

1. In [Agora Console](https://console.agora.io/), select your project from the **Project** list at the top of the page.

1. In the sidebar, click **RTC Services**, then click **Open Chat Console** on the **Chat** card.

1. In the Chat Console sidebar, click **Security Setting**, then click **Create**.

1. Enter an IPv4 address and click **Save**.

   :::info
   You can add up to eight IP addresses, one at a time. A new IP address takes effect up to 10 minutes after you add it. When the allowlist is empty, any IP address can call the RESTful APIs.
   :::

### Remove an IP address from the IP allowlist

If an IP address no longer needs to call the RESTful APIs, remove it from the allowlist.

:::info[Note]
If you remove every IP address from the allowlist, the allowlist is no longer enforced, and any IP address can call the RESTful APIs.
:::

To remove an IP address:

1. Open the **Security Setting** page, as described in [Add an IP address to the IP allowlist](#add-an-ip-address-to-the-ip-allowlist).

1. Delete the IP address from the allowlist.

<!-- TODO(chat-console): The test project had no allowlist entries. Confirm the delete control on the Security Setting page and name it in the step. -->
