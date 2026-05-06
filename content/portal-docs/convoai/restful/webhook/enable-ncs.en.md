---
title: Receive Webhook Events
description: "Webhook is an HTTP-based callback mechanism that allows a server to push data proactively. Agora Message Notification Service uses webhooks to push notifications of specific events to you. When a subscribed event occurs, the Agora business server sends the event message to the Agora message notification server, which then delivers the event notification to your server through an HTTPS POST request."
---

# Receive Webhook Events

Webhook is an HTTP-based callback mechanism that allows a server to push data proactively. Agora Message Notification Service uses webhooks to push notifications of specific events to you. When a subscribed event occurs, the Agora business server sends the event message to the Agora message notification server, which then delivers the event notification to your server through an HTTPS POST request.

![Message Notification Service](https://web-cdn.agora.io/doc-cms/uploads/1727074548122-Webhook.png)

## Applicable Scenarios

Agora Message Notification Service features low latency, high concurrency, and stable reliability. For Conversational AI Engine, in high-concurrency agent scenarios, Message Notification Service helps you maintain a real-time synchronized agent state machine at the business layer so you can:

- Listen in real time for agent join and leave events.
- Listen in real time for agent error events.

## Prerequisites

Before you begin, make sure you meet the following requirements:

- A valid Agora developer account and an Agora Console project. For details, see [Enable the Service](../get-started/enable-service.md).
- A server that meets the following conditions:
  - Supports HTTPS. For better security, Agora Message Notification Service no longer supports HTTP server addresses.
  - Recommended: supports HTTPS connection reuse, that is, keep-alive mode, to reduce message delivery latency. Agora recommends the following settings:
    - `MaxKeepAliveRequests`: greater than or equal to 100
    - `KeepAliveTimeout`: greater than or equal to 10 seconds

## Enable Message Notification Service

Before using Message Notification Service, you need to enable it in the Agora Console and fill in the required configuration.

### 1. Enable and Configure the Service

Follow these steps to enable and configure Message Notification Service:

1. Sign in to the [Agora Console](https://console.shengwang.cn/), click **All Products** in the left navigation pane, and select **Conversational AI Engine**.
2. On the product page, click the **Webhook** tab.
3. In the configuration area, click **Add Event**. In the **Create Webhook** dialog, fill in the following information and click **Save**.
   - **Message Receiving Region**: The region where your message notification receiving server is located. Agora connects to the nearest Agora edge server based on the region you provide.
   - **Message Receiving URL**: The HTTPS server address that receives message notifications.
   - **Subscribed Events**: The events you want to subscribe to. For details, see [Conversational AI Engine Event Types](/doc/convoai/restful/webhook/ncs-events). If you configure events with high QPS, make sure your server has sufficient processing capacity. It is recommended that you select all required events at once to avoid repeated configuration and health checks.
   - **IP Allowlist**: If your message receiving server is protected by a firewall, enable this option and add all Agora Message Notification server IP addresses to the firewall allowlist by following the steps below.

#### Get IP Addresses and Add Them to the Firewall Allowlist

If your server is protected by a firewall, you need to call the RESTful API [Query Message Notification Server IPs](https://doc.shengwang.cn/doc/rtc/restful/channel-management/operations/get-v2-ncs-ip) and add all returned IP addresses to the firewall allowlist.

Agora may adjust the IP addresses of message notification servers. Therefore, Agora strongly recommends that you query them and automatically update your firewall configuration at least once every 24 hours, otherwise message delivery may be affected.

```java expandByDefault
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Base64;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class Base64Encoding {

    public static void main(String[] args) throws IOException {

        // Customer ID
        // Set environment variable AGORA_CUSTOMER_KEY
        final String customerKey = System.getenv("AGORA_CUSTOMER_KEY");
        // Customer secret
        // Set environment variable AGORA_CUSTOMER_SECRET
        final String customerSecret = System.getenv("AGORA_CUSTOMER_SECRET");

        ScheduledExecutorService executor = Executors.newSingleThreadScheduledExecutor();

        // Concatenate customer ID and customer secret and encode with Base64
        String plainCredentials = customerKey + ":" + customerSecret;
        String base64Credentials = new String(Base64.getEncoder().encode(plainCredentials.getBytes()));
        // Create authorization header
        String authorizationHeader = "Basic " + base64Credentials;

        // Create the HTTP request object
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://api.agora.io/v2/ncs/ip"))
            .GET()
            .header("Authorization", authorizationHeader)
            .header("Content-Type", "application/json")
            .build();

        // highlight-start
        // Use executor to schedule the task and run it every 24 hours
        executor.scheduleAtFixedRate(() -> {
            try {
                HttpClient client = HttpClient.newHttpClient();
                // Send the HTTP request
                HttpResponse response = client.send(request, HttpResponse.BodyHandlers.ofString());
                System.out.println(response.body());
        } catch (IOException | InterruptedException e) {
                e.printStackTrace();
        }
    }, 0, 24, TimeUnit.HOURS);
    // highlight-end
}
}
```

After you complete the configuration, Agora performs a health check on it.

### 2. Complete the Health Check

> Note
> The health check is required to enable Message Notification Service. The service is considered enabled only after the check passes.

The health check works as follows:

1. Agora generates corresponding test events based on the events you subscribed to and sends event callbacks to your server. In the test event callback, `channelName` is `test_webhook` and `uid` is `12121212`.
2. After receiving each test event callback, your server must respond to the Agora message server within 10 seconds. The response status code must be 200, the response body format must be JSON, and the body content is not restricted. Example code:

```js
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// Use the body-parser middleware to parse the request body
app.use(bodyParser.json());

// Handle incoming POST requests
app.post('/', express.json({ type: 'application/json' }), (req, res) => {
    const event = request.body;
    // Send the response after 5 seconds
    setTimeout(() => {
        res.status(200).json({message: 'Success'});
    }, 5000);
    // After sending the response, run longer tasks
});
```

3. If the health check fails, troubleshoot based on the prompts in the Agora Console. Common errors include:
   - Request timeout: your server did not return 200 within 10 seconds. Check whether your server responds correctly and in time to the event callback. If your response is correct, [contact technical support](https://ticket.shengwang.cn/) to confirm whether the network connection between Agora Message Notification servers and your server is normal.
   - Certificate error: HTTPS certificate error. Check whether the certificate is correct. If your server is protected by a firewall, check whether all Agora Message Notification server IPs have been added to the firewall allowlist.
   - Domain unreachable: invalid domain name that cannot be resolved to the target IP address. Check whether your server deployment is correct.
   - Response error: your server returned a response status code other than 200. Refer to the console prompt for the exact status code and description.
4. After the health check succeeds, click **Save Configuration**.

After the configuration passes review, the status of Message Notification Service is displayed as **Enabled**.

## Receive Message Notification Callbacks

After Agora Message Notification Service is enabled successfully, when a subscribed channel event occurs, the Agora message server sends a message notification callback to your server in the form of an HTTPS POST request. For details, see [Conversational AI Engine Event Types](/doc/convoai/restful/webhook/ncs-events).

### Response Requirements

After receiving a message notification callback, your server must respond to the Agora message server within 10 seconds. The response body must be in JSON format, but the body content is not restricted.

If the Agora message server does not receive a response from your server within 10 seconds after sending the notification, or the response status code is not 200, the notification is considered failed. After failure, the Agora message notification server immediately retries delivery. The retry interval increases gradually with the number of retries, and delivery stops after three retries.

### Verify the Signature

To improve communication security between the Agora message server and your server, you can verify the identity of incoming requests through the signature mechanism and ensure that the request comes from Agora.

When Agora sends a message notification callback to your server, it uses the secret to generate signature values with the HMAC/SHA1 and HMAC/SHA256 algorithms, and puts them into the `Agora-Signature` and `Agora-Signature-V2` fields of the HTTPS request header respectively.

Follow these steps to verify the signature:

1. Get the secret: When configuring Agora Message Notification Service, Agora generates a secret. In the left navigation pane of the console, select **Conversational AI Engine** under **All Products**, open the **Webhook** tab, and click the copy button to get the secret.

![image](https://doc.shengwang.cn/img/convoai/webhook-key.png)

2. After receiving the callback, use the secret and the parameters in the request body to calculate the signature value with either the HMAC/SHA1 or HMAC/SHA256 algorithm.

3. Compare the signature you calculated with the corresponding field in the request header:

   - If you use HMAC/SHA1, compare the result with the `Agora-Signature` field. If the two are exactly the same, the request was sent by Agora.
   - If you use HMAC/SHA256, compare the result with the `Agora-Signature-V2` field. If the two are exactly the same, the request was sent by Agora.

Agora provides sample code in multiple languages for signature verification.

#### Python Example

#### HMAC/SHA256

> Note
> In the following code, `request_body` is the raw binary byte array before deserialization, not the Dictionary after deserialization.

```python
#!/usr/bin/env python2
# !-*- coding: utf-8 -*-
import hashlib
import hmac
# Get the raw request body of the notification and compute its signature
request_body = '{"eventType":10,"noticeId":"4eb720f0-8da7-11e9-a43e-53f411c2761f","notifyMs":1560408533119,"payload":{"a":"1","b":2},"productId":1}'
secret = 'secret'
signature2 = hmac.new(secret, request_body, hashlib.sha256).hexdigest()
print(signature2) # de96da5acf03b0021ac3b4fa2225e7ae6f3533a30d50bb02c08ea4fa748bda24
```

#### HMAC/SHA1

> Note
> In the following code, `request_body` is the raw binary byte array before deserialization, not the Dictionary after deserialization.

```python
#!/usr/bin/env python2
# !-*- coding: utf-8 -*-
import hashlib
import hmac
# Get the raw request body of the notification and compute its signature
request_body = '{"eventType":10,"noticeId":"4eb720f0-8da7-11e9-a43e-53f411c2761f","notifyMs":1560408533119,"payload":{"a":"1","b":2},"productId":1}'
secret = 'secret'
signature = hmac.new(secret, request_body, hashlib.sha1).hexdigest()
print(signature) # 5a3bb6a6d9fad2ea9ae3fb707a14c9d7f3136df1
```

#### Node.js Example

#### HMAC/SHA256

> Note
> In the following code, `requestBody` is the raw binary byte array before deserialization, not the Object after deserialization.
