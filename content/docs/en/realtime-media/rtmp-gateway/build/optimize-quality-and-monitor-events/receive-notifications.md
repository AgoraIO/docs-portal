---
title: "Receive notifications about channel events"
description: "Subscribe to Media Gateway events and receive webhook notifications in real time."
---
A webhook is a user-defined callback over HTTPS that allows your app or back-end system to receive notifications when certain events occur. Agora calls your webhook endpoint from its servers to send notifications about Media Gateway events. With Notifications, you can subscribe to Media Gateway events and receive notifications in real time.

## Understand the tech

Using Agora Console you subscribe to specific events for your project and configure the URL of the webhooks to receive these events. Agora sends notifications of your events to your webhook every time they occur. Your server authenticates the notification and returns `200 OK` to confirm reception. You use the information in the JSON payload of each notification to give the best user experience to your users.

1. A user commits an action that creates an event.
2. Notifications sends an HTTPS POST request to your webhook.
3. Your server validates the request signature, then sends a response to Notifications within 10 seconds. The response body must be in JSON.

If Notifications receives `200 OK` within 10 seconds of sending the initial notification, the callback is considered successful. If these conditions are not met, Notifications immediately resends the notification. The interval between notification attempts gradually increases. Notifications stops sending notifications after three retries.

## Prerequisites

To set up and use Notifications, you must have:

- A [valid Agora account](/en/introduction/account)
- An [active Agora project](/en/introduction/account)
- A computer with Internet access

If your network access is restricted by a firewall, call the IP address query API to retrieve the Notifications IP addresses, then configure the firewall to allow those IP addresses. The REST API reference for that endpoint remains out of scope for this prose migration.

## Handle notifications for specific events

In order to handle notifications for the events you subscribe to, you need to:

- Create your webhook
- Enable Notifications
- Verify Notifications signatures

## Create your webhook

Once Notifications is enabled, Agora SDRTN(R) sends notification callbacks as `HTTPS POST` requests to your webhook when events that you are subscribed to occur. The data format of the requests is JSON, the character encoding is `UTF-8`, and the signature algorithm is `HMAC/SHA1` or `HMAC/SHA256`.

For Notifications, a webhook is an endpoint on an `HTTPS` server that handles these requests. In a production environment you write this in your web infrastructure. For development purposes, best practice is to create a simple local server and use a service such as [ngrok](https://ngrok.com/download) to supply a public URL that you register with Agora when you enable Notifications.

To do this, take the following steps:

1. Ensure you have Go installed on your system. If not, download and install it from the [official Go website](https://go.dev/dl/).
2. Create a new project directory:

   ```sh
   mkdir agora-webhook-server
   cd agora-webhook-server
   ```

3. In the project directory, create a new file `main.go` and add the following code:

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
       NoticeID  string                 `json:"noticeId"`
       ProductID int64                  `json:"productId"`
       EventType int                    `json:"eventType"`
       NotifyMs  int64                  `json:"notifyMs"`
       SID       string                 `json:"sid"`
       Payload   map[string]interface{} `json:"payload"`
   }

   func rootHandler(w http.ResponseWriter, r *http.Request) {
       response := "Agora Notifications demo"
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

       fmt.Printf("\\n--- Webhook Notification Received ---\\n")
       fmt.Printf("Notice ID: %s\\n", req.NoticeID)
       fmt.Printf("Event Type: %d\\n", req.EventType)
       fmt.Printf("Session ID: %s\\n", req.SID)
       fmt.Printf("Timestamp: %d\\n", req.NotifyMs)

       prettyJSON, _ := json.MarshalIndent(req.Payload, "", "  ")
       fmt.Printf("\\nFull Payload:\\n%s\\n", string(prettyJSON))

       w.WriteHeader(http.StatusOK)
       w.Write([]byte("Notification received successfully"))
   }

   func main() {
       http.HandleFunc("/", rootHandler)
       http.HandleFunc("/ncsNotify", ncsHandler)

       port := ":8080"
       fmt.Printf("Notifications webhook server started on port %s\\n", port)
       fmt.Println("Ready to receive Agora webhook notifications...")

       if err := http.ListenAndServe(port, nil); err != nil {
           log.Fatalf("Failed to start server: %v", err)
       }
   }
   ```

4. Run the server:

   ```sh
   go run main.go
   ```

5. Create a public URL for your server. In this example you use `ngrok`:

   ```bash
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ngrok http 127.0.0.1:8080
   ```

To obtain an auth token, [sign up](https://dashboard.ngrok.com/signup) with ngrok.

6. Test the server by opening the public URL provided by ngrok and sending a `POST` request to `https://<ngrok_url>/ncsNotify` with the required JSON payload.

## Enable Notifications

In Agora Console, open your project, configure the webhook URL, and subscribe to the Media Gateway events you need.

Relevant UI screenshots:

![Project tab](https://assets-docs.agora.io/images/video-sdk/enable-ncs-project-tabs.png)
![Notification tab](https://assets-docs.agora.io/images/video-sdk/enable-ncs-notification-tab.png)
![Notification configuration tab](https://assets-docs.agora.io/images/video-sdk/enable-ncs-configuration-tab.png)
![Apply settings](https://assets-docs.agora.io/images/video-sdk/enable-ncs-apply-settings.png)

## Verify Notifications signatures

Best practice is to validate the request signature in your webhook server before you process the callback payload.

### Add signature verification

To communicate securely between Notifications and your webhook, Agora uses signatures for identity verification:

1. When you configure Notifications in Agora Console, Agora generates a secret for verification.
2. When sending a notification, Notifications generates signature values from the secret using `HMAC/SHA1` and `HMAC/SHA256`. These signatures are added as `Agora-Signature` and `Agora-Signature-V2` in the HTTPS request header.
3. When your server receives a callback, you can verify either signature using the secret, the raw request body, and the matching algorithm.

The following sample uses `crypto/sha1`.

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

const secret = "REPLACE_WITH_YOUR_SECRET"

func calcSignatureV1(secret, payload string) string {
    mac := hmac.New(sha1.New, []byte(secret))
    mac.Write([]byte(payload))
    return hex.EncodeToString(mac.Sum(nil))
}

func verify(requestBody, signature string) bool {
    calculatedSignature := calcSignatureV1(secret, requestBody)
    return calculatedSignature == signature
}
```

After reading the request body, add:

```go
if !verify(string(body), agoraSignature) {
    http.Error(w, "Invalid signature", http.StatusUnauthorized)
    return
}
```

## Event payload notes

The callback payload contains common fields such as `noticeId`, `productId`, `eventType`, `notifyMs`, `sid`, and `payload`.

### Common callback fields

| Field | Type | Description |
| --- | --- | --- |
| `noticeId` | String | Unique ID of the notification callback. |
| `productId` | Number | Product identifier. When this value is `10`, the callback belongs to Media Gateway. |
| `eventType` | Number | Event type code for the current callback. |
| `notifyMs` | Number | Callback timestamp in milliseconds. |
| `sid` | String | Streaming session ID. Each initiated streaming task generates a unique SID. |
| `payload` | Object | Event-specific data. The fields in this object depend on `eventType`. |

### Media Gateway event types

| Event type | Description | Payload highlights |
| --- | --- | --- |
| `live_stream_connected` | The gateway has received the RTMP or SRT stream and successfully entered the channel. | `rtcInfo`, `transcoding`, `beginAt` |
| `live_stream_disconnected` | The gateway has actively or passively disconnected and left the channel. | `rtcInfo`, `streamStats`, `beginAt`, `endAt` |
| `live_stream_aborted` | The gateway received a stream but terminated it because of an error. | `rtcInfo`, `beginAt`, `errorCode`, `reason` |
| `live_profile_updated` | Stream properties have been updated, for example after the first audio or video frame is received. | `rtcInfo`, `videoProfile`, `audioProfile`, `beginAt` |

For Media Gateway events, payload objects commonly include:

- `rtcInfo`: RTC information such as `channel` and `uid`
- `transcoding`: The transcoding configuration used for the stream
- `streamStats`: Statistics such as total input and output bytes
- `videoProfile`: Video properties such as codec, width, height, and GOP
- `audioProfile`: Audio properties such as sample rate and channel count

### Media Gateway payload objects

| Field | Type | Description |
| --- | --- | --- |
| `rtcInfo` | Object | RTC information for the stream, including `channel` and `uid`. When `channel` or `uid` is empty or `0` in the streaming key, Media Gateway uses generated values and reports them here. |
| `transcoding` | Object | Transcoding configuration used for the stream, including `audio` and `video` settings. |
| `streamStats` | Object | Stream statistics including `inputAudioBytes`, `inputVideoBytes`, `outputAudioBytes`, and `outputVideoBytes`. |
| `videoProfile` | Object | Video properties such as `codec`, `width`, `height`, and `gop`. Not applicable for audio-only streams. |
| `audioProfile` | Object | Audio properties such as `sampleRate` and `channels`. |
| `beginAt` | String | Streaming start time in RFC 3339 format. |
| `endAt` | String | Streaming end time in RFC 3339 format. Returned in disconnect callbacks. |
| `errorCode` | Number | Error code returned when the stream is aborted. |
| `reason` | String | Error message corresponding to `errorCode`. |

### `live_stream_aborted` error codes

| `errorCode` | Description | Recommended action |
| --- | --- | --- |
| `1` | Illegal `streamKey`, for example an empty `channelName` or unsupported characters. | Check the `streamKey` format, especially for locally generated keys. |
| `2` | Invalid `streamKey`, such as an expired or deleted key. | Create a new `streamKey` and try again. |
| `3` | No permission to use this `streamKey`, for example when the custom domain and app ID do not match. | Check whether the `streamKey` matches the domain name used for the push. |
| `4` | Number of concurrent streams exceeds the limit. | Wait and retry. |
| `5` | Conflict detected, for example pushing to the same channel at the same time. | If the streams are not being pushed at the same time, try again after 5 to 10 seconds. |
| `6` | Stream attribute exceeds the limit. Currently, this applies to bitrate only. | Check the streaming software configuration and lower the target bitrate. |
| `7` | Streaming without audio or video data for more than 10 seconds. | Check whether the last push exited abnormally, and then try again. |
| `8` | Failed to join the channel. | Check the `reason` field for the specific RTC failure reason. |
| `9` | Disconnected from the main network. | Retry several times. If the problem persists, contact technical support to confirm whether the app certificate provided during activation is valid. |
| `10` | Unknown internal service error. | Retry several times. If the problem persists, contact technical support. |

The detailed REST and webhook field reference remains outside this prose migration scope.

### Media Gateway event types

Notifications can notify your server of the following Media Gateway events:

| `eventType` | Event name | Description |
| --- | --- | --- |
| `1` | `live_stream_connected` | The gateway has received the RTMP or SRT stream and successfully entered the channel. |
| `2` | `live_stream_disconnected` | The gateway has actively or passively disconnected and left the channel. |
| `3` | `live_stream_aborted` | The gateway has received an RTMP or SRT stream but terminated it for some reason. |
| `4` | `live_profile_updated` | Stream properties have been updated, such as the first audio or video frame, or an audio or video profile change. |

## IP address query API

If your server that receives notification callbacks is behind a firewall, call the IP address query API to retrieve the IP addresses of Notifications and configure your firewall to trust those IP addresses.

Relevant details:

- Method: `GET`
- Endpoint: `https://api.agora.io/v2/ncs/ip`
- Body: none

The REST API reference for this endpoint remains out of scope for this prose migration.

## Considerations

- Notifications does not guarantee that callbacks arrive in the same order as events occur.
- Your server may receive more than one callback for a single event.

:::tip
To deduplicate callbacks, use a combination of the `noticeId` and `notifyMs` fields.
:::
