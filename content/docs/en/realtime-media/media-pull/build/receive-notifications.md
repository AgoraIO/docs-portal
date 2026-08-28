---
title: "Receive webhook notifications"
description: "Receive notification of channel events in real time."
---

A webhook is a user-defined callback over HTTPS that allows your app or back-end system to receive notifications when certain events occur. Agora calls your webhook endpoint from its servers to send notifications about Media Pull events. With Notifications, you can subscribe to Media Pull events and receive notifications in real time.

## Understand the tech

Using Agora Console you subscribe to specific events for your project and configure the URL of the webhooks to receive these events. Agora sends notifications of your events to your webhook every time they occur. Your server authenticates the notification and returns `200 Ok` to confirm reception. You use the information in the JSON payload of each notification to give the best user experience to your users.

The following figure illustrates the workflow when Notifications is enabled for the specific Media Pull events you subscribe to:

![media-pull](https://assets-docs.agora.io/images/notification-center-service/ncs-media-pull.svg)

1. A user commits an action that creates an event.
2. Notifications sends an HTTPS POST request to your webhook.
3. Your server validates the request signature, then sends a response to Notifications within 10 seconds. The response body must be in JSON.

If Notifications receives `200 OK` within 10 seconds of sending the initial notification, the callback is considered successful. If these conditions are not met, Notifications immediately resends the notification. The interval between notification attempts gradually increases. Notifications stops sending notifications after three retries.

## Prerequisites

To set up and use Notifications, you must have:

- A [valid Agora account](/en/introduction/account#sign-up-for-an-agora-account).
- An [active Agora project](/en/introduction/account#your-first-agora-project).
- A computer with Internet access.

    If your network access is restricted by a firewall, call the [IP address query API](#ip-address-query-api) to retrieve the Notifications IP addresses , then configure the firewall to allow these IP addresses.

## Handle notifications for specific events

In order to handle notifications for the events you subscribe to, you need to:
- [Create your webhook](#create-your-webhook)
- [Set up Webhook notifications](#set-up-webhook-notifications)
- [Verify Notifications signatures](#add-signature-verification)

### Create your webhook

Once Notifications is enabled, Agora SDRTN<sup>®</sup> sends notification callbacks as `HTTPS POST` requests to your webhook when events that you are subscribed to occur. The data format of the requests is JSON, the character encoding is `UTF-8`, and the signature algorithm is `HMAC/SHA1` or `HMAC/SHA256`.

For Notifications, a webhook is an endpoint on an `HTTPS` server that handles these requests. In a production environment you write this in your web infrastructure, for development purposes best practice is to create a simple local server and use a service such as [ngrok](https://ngrok.com/download) to supply a public URL that you register with Agora SDRTN<sup>®</sup> when you enable Notifications.

To do this, take the following steps:

1. **Set up Go**

    Ensure you have Go installed on your system. If not, download and install it from the [official Go website](https://go.dev/dl/).

2. **Create a Go project for your server**

    Create a new directory for your project and navigate into it:

    ```sh
    mkdir agora-webhook-server
    cd agora-webhook-server
    ```

    In the project directory, create a new file `main.go`. Open the file in your preferred text editor and add the following code:


    ```go
    package main

    import (
      "encoding/json"
      "fmt"
      "io"
      "log"
      "net/http"
    )

    type WebhookRequest struct {
        NoticeID   string `json:"noticeId"`
        ProductID  int64  `json:"productId"`
        EventType  int    `json:"eventType"`
        Payload    Payload `json:"payload"`
    }

    type Payload struct {
        ClientSeq   int64  `json:"clientSeq"`
        UID         int    `json:"uid"`
        ChannelName string `json:"channelName"`
    }

    func rootHandler(w http.ResponseWriter, r *http.Request) {
        response := `<h1>Agora Notifications demo</h1>`
        w.WriteHeader(http.StatusOK)
        w.Write([]byte(response))
    }

    func ncsHandler(w http.ResponseWriter, r *http.Request) {
        agoraSignature := r.Header.Get("Agora-Signature")
        fmt.Println("Agora-Signature:", agoraSignature)

        body, err := io.ReadAll(r.Body)
        if err != nil {
            http.Error(w, "Unable to read request body", http.StatusBadRequest)
            return
        }

        var req WebhookRequest
        if err := json.Unmarshal(body, &req); err != nil {
            http.Error(w, "Invalid JSON", http.StatusBadRequest)
            return
        }

        fmt.Printf("Event code: %d Uid: %d Channel: %s ClientSeq: %d\n",
            req.EventType, req.Payload.UID, req.Payload.ChannelName, req.Payload.ClientSeq)

        w.WriteHeader(http.StatusOK)
        w.Write([]byte("Ok"))
    }

    func main() {
        http.HandleFunc("/", rootHandler)
        http.HandleFunc("/ncsNotify", ncsHandler)

        port := ":8080"
        fmt.Printf("Notifications webhook server started on port %s\n", port)
        if err := http.ListenAndServe(port, nil); err != nil {
            log.Fatalf("Failed to start server: %v", err)
        }
    }
    ```

3. **Run your Go server**

    Run the server using the following command:

    ```sh
    go run main.go
    ```

4. **Create a public URL for your server**

    In this example you use `ngrok` to create a public URL for your server.

    1. Download and install [ngrok](https://ngrok.com/download). If you have `Chocolatey`, use the following command:

        ```bash
        choco install ngrok
        ```

    2. Add an `authtoken` to ngrok:

        ```bash
        ngrok config add-authtoken <authToken>
        ```

        To obtain an `authToken`, [sign up](https://dashboard.ngrok.com/signup) with ngrok.

    3. Start a tunnel to your local server using the following command:

        ```bash
        ngrok http 127.0.0.1:8080
        ```
        You see a **Forwarding** URL and a **Web Interface** URL in the console. Open the web interface URL in your browser.

5. **Test the server**

    Open a web browser and navigate to the public URL provided by `ngrok` to see the root handler response.

    Use curl, [Postman](https://www.postman.com/), or another tool to send a `POST` request to `https://<ngrok_url>/ncsNotify` with the required `JSON` payload.

    Example using `curl`:

    ```sh
    curl -X POST <ngrok_url>/ncsNotify \
    -H "Content-Type: application/json" \
    -H "Agora-Signature: your_signature" \
    -d '{
      "noticeId": "some_notice_id",
      "productId": 12345,
      "eventType": 1,
      "payload": {
        "clientSeq": 67890,
        "uid": 123,
        "channelName": "test_channel"
      }
    }'
    ```

    Make sure you replace `ngrok_url` with the forwarding url.

    Once the HTTP request is successful, you see the following `JSON` payload in your browser:

    ```json
    {
      "noticeId": "some_notice_id",
      "productId": 12345,
      "eventType": 1,
      "payload": {
        "clientSeq": 67890,
        "uid": 123,
        "channelName": "test_channel"
      }
    }
    ```


### Set up Webhook notifications

1. In [Agora Console](https://console.agora.io), select **Webhooks** from the sidebar.

1. Select **New Webhook**.

1. In the **Product** dropdown, select **Media Pull**.

1. Copy the **Signing Secret**. You use this secret to [Add signature verification](#add-signature-verification).

1. Fill in the following:

   * **Receiving region**: Select the region where your server that receives the notifications is located. Agora connects to the nearest Agora node server based on your selection.

   * **Receiving URL**: The `HTTPS` public address of your server that receives the notifications, for example `https://1111-123-456-789-99.ap.ngrok.io/ncsNotify`. Only `HTTPS` endpoints are supported.

   * **Subscribed events**: Select all the events that you want to subscribe to.

     If the selected events generate a high number of queries per second (QPS), ensure that your server has sufficient processing capacity.

   * **IP whitelist**: If your server is behind a firewall, enable this option, then call the [IP address query API](#ip-address-query-api) to get the IP addresses of the Agora Notifications server and add them to the firewall's allowed IP list.

   :::note
   To reduce the delay in notification delivery, best practice is to activate `HTTP` persistent connection (also called `HTTP` keep-alive) on your server with the following settings:

   * `MaxKeepAliveRequests`: 100 or more
   * `KeepAliveTimeout`: 10 seconds or more
   :::

1. Select **Run health check**. Agora performs a health test for your configuration as follows:

   1. The health test generates test events that correspond to your subscribed events, and then sends test event callbacks to your server.

   1. After receiving each test event callback, your server must respond within 10 seconds with a status code of `200`. The response body must be in JSON format.

1. When the health check succeeds, select **Save**.

   If the health check fails, follow the prompt in Agora Console to troubleshoot the error. Common errors include the following:

   * Request timeout (590): Your server does not return the status code `200` within 10 seconds. Check whether your server responds to the request properly. If your server responds to the request properly, contact Agora Technical Support to check if the network connection between the Agora Notifications server and your server is working.
   * Domain name unreachable (591): The domain name is invalid and cannot be resolved to the target IP address. Check whether your server is properly deployed.
   * Certificate error (592): The Agora Notifications server fails to verify the SSL certificates returned by your server. Check if the SSL certificates of your server are valid. If your server is behind a firewall, check whether you have added all IP addresses of the Agora Notifications server to the firewall's allowed IP list.
   * Other response errors: Your server returns a response with a status code other than `200`. See the prompt in Agora Console for the specific status code and error messages.

### Add signature verification

To communicate securely between Notifications and your webhook, Agora SDRTN<sup>®</sup>  uses signatures for identity verification as follows:

1. When you configure Notifications in Agora Console, Agora SDRTN<sup>®</sup>  generates a secret you use for verification.
2. When sending a notification, Notifications generates two signature values from the secret using `HMAC/SHA1` and `HMAC/SHA256` algorithms. These signatures are added as `Agora-Signature` and `Agora-Signature-V2` to the `HTTPS` request header.
3. When your server receives a callback, you can verify `Agora-Signature` or `Agora-Signature-V2`:

    * To verify `Agora-Signature`, use the secret, the raw request body, and the `crypto/sha1` algorithm.
    * To verify `Agora-Signature-V2`, use the secret, the raw request body, and the `crypto/sha256` algorithm.

The following sample code uses `crypto/sha1`.

To add signature verification to your server, take the following steps:

1. In the `main.go` file, replace your imports with the following:

    ```go
    import (
        "crypto/hmac"
        "crypto/sha1"
        "encoding/hex"
        "encoding/json"
        "fmt"
        "io"
        "log"
        "net/http"
    )
    ```

2. Add the following code after the list of imports:

    ```go
    // Replace with your NCS secret
    const secret = "<Replace with your secret code>"

    // calcSignatureV1 computes the HMAC/SHA256 signature for a given payload and secret
    func calcSignatureV1(secret, payload string) string {
        mac := hmac.New(sha1.New, []byte(secret))
        mac.Write([]byte(payload))
        return hex.EncodeToString(mac.Sum(nil))
    }

    // verify checks if the provided signature matches the HMAC/SHA256 signature of the request body
    func verify(requestBody, signature string) bool {
        calculatedSignature := calcSignatureV1(secret, requestBody)
        fmt.Println("Calculated Signature:", calculatedSignature)
        fmt.Println("Received Signature:", signature)
        return calculatedSignature == signature
    }
    ```

3. In `main.go`, add the following code after you read the request body:

    ```go
    // Verify the signature
    if !verify(string(body), agoraSignature) {
        http.Error(w, "Invalid signature", http.StatusUnauthorized)
        return
    }
    ```

4. To test the server, follow the steps given in the [Set up Webhook notifications](#set-up-webhook-notifications) section.

5. When you receive an event from the console, and if the signature matches, the event details are displayed in your browser.

## Reference

This section contains in depth information about Notifications.

### Request Header
The header of notification callbacks contains the following fields:

| Field name | Value |
|:--------|:------------|
| `Content-Type` | `application/json` |
| `Agora-Signature` | The signature generated by Agora using the **Secret** and the HMAC/SHA1 algorithm. You need to use the Secret and HMAC/SHA1 algorithm to verify the signature value. For details, see [Signature verification](#add-signature-verification). |
| `Agora-Signature-V2` | The signature generated by Agora using the **Secret** and the HMAC/SHA256 algorithm. You need to use the Secret and the HMAC/SHA256 algorithm to verify the signature value. For details, see [Signature verification](#add-signature-verification). |

### Request Body
The request body of notification callbacks contains the following fields:

| Field name | Type | Description |
|:--------|:-----|:------------|
| `noticeId` | String | The notification ID, identifying the notification callback when the event occurs. |
| `productId` | Number | <Slot name="productid" /> |
| `eventType` | Number | The type of event being notified. For details, see [event types](#event-types). |
| `notifyMs` | Number | The Unix timestamp (ms) when Notifications sends a callback to your server. This value is updated when Notifications resends the notification callback. |
| `payload` | JSON Object | The content of the event being notified. The payload varies with event type. |

<Slot for="productid">

The product ID:

- `1`: Realtime Communication (RTC) service
- `3`: Cloud Recording
- `4`: Media Pull
- `5`: Media Push

</Slot>

#### Example

```json
{
   "noticeId":"2000001428:4330:107",
   "productId":1,
   "eventType":101,
   "notifyMs":1611566412672,
   "payload":{
      ...
   }
}
```

### Event types

You can subscribe to the following Media Pull events from Agora Console:

| eventType | Event name|  Description |
|:--------|:-----|:------------|
| `1` | [Player Created](#player-created) | Cloud player successfully created. |
| `3` | [Player Destroyed](#player-destroyed) | Cloud player destroyed. |
| `4` | [Player Status Changed](#player-status-changed) | State of the cloud player changed at runtime. |

#### **Player Created**

When you successfully create a cloud player by calling the `Create` API, Notifications sends a notification for this event to your server.

The `eventType` is `1(Player Created)`. The `payload` contains data with the following structure:

```json
{
   "lts":1575508644149,
   "player":{
      "channelName":"class32",
      "createTs":1575508644,
      "id":"2a784467d647bb87b60b719f6fa56317",
      "idleTimeout":300,
      "name":"teacher101",
      "status":"connecting",
      "streamUrl":"rtmp://example.agora.io/live/class32/teacher101",
      "token":"2a784467d6",
      "uid":101
   },
   "xRequestId":"7bbcc8a4acce48c78b53c5a261a8a564"
}
```

- `player`: JSON Object. Contains the following fields:
  - `channelName`: String. The name of the Agora channel.
  - `createTs`: Number. The Unix timestamp (in seconds) when creating the cloud player.
  - `id`: String. UUID (Universally Unique Identifier) to identify the cloud player created. It is the ID of the cloud player.
  - `idleTimeout`: Number. The maximum length of time (in seconds) that the cloud player is idle. The "idle" state means that the media stream is not playing. When the idle state exceeds `idleTimeout`, the cloud player is automatically destroyed.
  - `name`: String. The name of the cloud player.
  - `streamUrl`: String. The RTMP URL of the online media stream.
  - `token`: String. The authentication token used by the cloud player in the channel.
  - `uid`: Number. The User ID of the cloud player in the channel.
  - `account`: String. The User Account of the cloud player in the Agora channel.
  - `status`: String. The state of the cloud player at runtime:
    - `"connecting"`: Agora's server is connecting to the address of the media stream or detecting the audio and video data.
- `lts`: Number. The Unix timestamp (ms) when the event occurs in Agora's server for the cloud player function.
- `xRequestId`: String. UUID (Universally Unique Identifier) to identify this request. It is the same as the `X-Request-ID` field in the request header.

#### **Player Destroyed**

When the cloud player is destroyed, Notifications sends a notification for this event to your server. The reason for destruction is mentioned in the `destroyReason` field.

The `eventType` is `3(Player Destroyed)`. The `payload` contains data with the following structure:

```json
{
   "destroyReason":"Delete Request",
   "fields":"player.name,player.channelName,player.id",
   "lts":1575508644149,
   "player":{
      "channelName":"class32",
      "id":"2a784467d647bb87b60b719f6fa56317",
      "name":"teacher101"
   }
}
```

- `player`: JSON Object. Contains the following fields:
  - `channelName`: String. The name of the Agora channel.
  - `id`: String. UUID (Universally Unique Identifier) to identify the cloud player created. It is the ID of the cloud player.
  - `name`: String. The name of the cloud player.
- `lts`: Number. The Unix timestamp (ms) when the event occurs in Agora's server for the cloud player function.
- `destroyReason`: String. The reason why the cloud player is destroyed:
  - `Delete Request`: You call the `Delete` API to successfully destroy the cloud player.
  - `Internal Error`: The error occurs when setting the parameters and fields related to the Agora channel, such as the `token` is invalid or expires.
  - `Idle Timeout`: Within the specified `idleTimeout`, Agora's server for the cloud player function cannot connect the address of the media stream or the media stream cannot be played.
  - `Stream Stopped`: Media stream playback ends.
- `fields`: String. The field mask to represent a set of symbolic field paths. The field mask is encoded as a single string where paths are separated by a comma. It specifies a subset of fields that should be returned. In the sample code, `fields` specifies to return the `name`, `channelName`, and `id` fields. For details, see [Google protobuf FieldMask](https://googleapis.dev/nodejs/pubsub/latest/google.protobuf.html#.FieldMask).

#### **Player Status Changed**

When the state of the cloud player at runtime changes, Notifications sends a notification for this event to your server.

The `eventType` is `4(Player Status Changed)`. The `payload` contains data with the following structure:

```json
{
  "player": {
    "channelName": "class32",
    "id": "2a784467d647bb87b60b719f6fa56317",
    "name": "teacher101",
    "status": "running"
  },
  "lts": 1575508645000,
  "fields": "player.name,player.channelName,player.id,player.status"
}
```

- `player`: JSON Object. Contains the following fields:
  - `channelName`: String. The name of the Agora channel.
  - `id`: String. UUID (Universally Unique Identifier) to identify the cloud player created. It is the ID of the cloud player.
  - `name`: String. The name of the cloud player.
  - `status`: String. The state of the cloud player at runtime:
    - `"connecting"`: Agora server for the cloud player function is connecting to the address of the media stream or detecting the audio and video data.
    - `"success"`: Agora server is successfully connected to the address of the media stream.
    - `"running"`: Playing.
    - `"failed"`: Agora's server cannot connect to the address of the media stream, or the media stream cannot be played.
    - `stopped`: Media stream playback ends.
- `lts`: Number. The Unix timestamp (ms) when the event occurs in Agora's server for the cloud player function.
- `fields`：String. The field mask to represent a set of symbolic field paths. The field mask is encoded as a single string where paths are separated by a comma. It specifies a subset of fields that should be returned. In the sample code,`fields` specifies to return the `name`, `channelName`, `id` and `status` fields. For details, see [Google protobuf FieldMask](https://googleapis.dev/nodejs/pubsub/latest/google.protobuf.html#.FieldMask).

### IP address query API

If your server that receives notification callbacks is behind a firewall, call the IP address query API to retrieve the IP addresses of Notifications and configure your firewall to trust all these IP addresses.

Agora occasionally adjusts the Notifications IP addresses. Best practice is to call this endpoint at least every 24 hours and automatically update the firewall configuration.

#### Prototype

* Method: `GET`
* Endpoint: `https://api.agora.io/v2/ncs/ip`

#### Request header

Authorization: You must generate a Base64-encoded credential with the Customer ID and Customer Secret provided by Agora, and then pass the credential to the Authorization field in the HTTP request header.

#### Request body

This API has no body parameters.

#### Response body

When the request succeeds, the response body looks like the following:

```json
{
    "data": {
        "service": {
            "hosts": [
                {
                    "primaryIP": "xxx.xxx.xxx.xxx"
                },
                {
                    "primaryIP": "xxx.xxx.xxx.xxx"
                }
            ]
        }
    }
}
```

Each primary IP field shows an IP address of Notifications server. When you receive a response, you need to note the primary IP fields and add all these IP addresses to your firewall's allowed IP list.

### Considerations

* Notifications does not guarantee that notification callbacks arrive at your server in the same order as events occur. Implement a strategy to handle messages arriving out of order.
* For improved reliability of Notifications, your server may receive more than one notification callback for a single event. Your server must be able to handle repeated messages.



:::info[Tip]
To implement a strategy to ensure that you log only one callback event and ignore duplicate events, use a combination of the `noticeId` and `notifyMs` fields in the response body.
:::
