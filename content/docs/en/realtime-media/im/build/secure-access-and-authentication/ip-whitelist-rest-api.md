---
title: "RESTful API IP allowlist"
description: "Describes the RESTful API IP allowlist function"
---

For added security, Agora Chat provides the IP whitelist function. If only certain IP addresses are allowed to call the RESTful APIs to send messages, you can add these IP addresses to the IP whitelist on the [Agora Console](https://console.agora.io/). IP addresses outside the IP whitelist cannot call the RESTful API to send messages.

### Add an IP address to the IP whitelist

1. In [Agora Console](https://console.agora.io/), select **RTC Services** from the sidebar.

1. Locate the **Chat** card and select **Open Chat Console**.

1. Select **Connect Chat Console**. The page loads automatically once the Chat Console session is ready.

1. In the sidebar, under **SETTING**, select **Security Setting**.

1. On the **Security Setting** page, click **Create** and enter the IP address.

    :::info
    You can add at most eight IP addresses, with only one each time.The new IP addresses take effect 10 minutes after addition. When the IP whitelist is empty, all IP addresses can send messages via the RESTful APIs.
    :::

1. Click **Save** to complete the configuration.

### Remove an IP address from the IP whitelist

If you no longer allow an IP address to send messages via the RESTful APIs, you can remove it from the IP whitelist. 

:::info[Note]
If you remove every IP address from the whitelist and leave it empty, the whitelist is no longer enforced, and any IP address can call the RESTful APIs.
:::

1. Follow the same steps as [Add an IP address](#add-an-ip-address-to-the-ip-whitelist) to open the **Security Setting** page.

1. In the IP Whitelist, select and delete the IP address.
