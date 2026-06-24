---
title: "Update service"
description: "Update the Real-Time STT service"
---

Real-Time STT supports the `update` command, which allows modification of parameters without stopping and restarting the service. For example, when transcription is enabled for a specified host only, and this host disconnects and rejoins the channel with a different UID, the Real-Time STT service needs to subscribe to the new UID and transcribe their audio. The `update` command can help resolve this problem.

The `update` command scope includes the following:

- Update transcription languages.
- Update UIDs of specified hosts whose audio needs to be transcribed.
- Switch between transcribing all hosts and a specified host.

## Prerequisites

To follow this procedure, you must:

- Have a valid [Agora Account](https://console.agora.io/v2).

- Have a valid Agora project with an app ID and a temporary token or a token
server. For details, see [Agora account management](https://docs.agora.io/en/voice-calling/get-started/manage-agora-account).

- Have a computer with access to the internet. If your network has a firewall, follow the steps in [Firewall requirements](../reference/firewall).

- Join a Video SDK channel as a host and start streaming. Refer to the [Voice SDK quickstart](https://docs.agora.io/en/voice-calling/get-started/get-started-sdk) guide.
- Make sure Real-Time STT is enabled for your app.

## Implementation

Follow the API call sequence from the [REST Quickstart](/en/ai/apps/get-started/quickstart).

### Request examples

- Update the transcription language:

    ```shell
    curl --location --request POST 'https://api.agora.io/api/speech-to-text/v1/projects/{appId}/agents/{agentId}/update?sequenceId=1&updateMask=languages' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: Basic <credentials>' \
    --data '{
        "languages": [
            "en-US",
            "ru-RU"
        ]
    }'
    ```

- Update the UID

    ```shell
    curl --location --request POST 'https://api.agora.io/api/speech-to-text/v1/projects/{appId}/agents/{agentId}/update?sequenceId=1&updateMask=rtcConfig.subscribeAudioUids' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: Basic <credentials>' \
    --data '{
        "rtcConfig": {
            "subscribeAudioUids": ["12", "23", "45"],
        }
    }'
    ```

### Response examples

- Success

    ```json
    {
      "agent_id": "Agent ID.",
      "create_ts": 12345678,
      "status": "RUNNING"
    }
    ```

- Failure

    ```json
    {
     "message": "string" // error reason
    }
    ```

### Considerations

- Calling `update` requires at least 5-second intervals, specifically:
    - After calling `start`, the app needs to wait at least 5 seconds to call the `update` command.
    - After calling `update`, the app needs to wait at least 5 seconds before calling `update` again.
    - There is no interval limitation for calling `update` with `query` and `stop` commands.
- When updated, the new parameter fully replaces the old parameter, unless the old parameter is masked with `updateMask`. For example, say the audio of hosts with UID 100 and 200 is being transcribed. The host with the UID 200 disconnects and rejoins with the new UID 300. The `update` command needs to use `"subscribeAudioUids": "[ "100", "300" ]`. If it uses only `"subscribeAudioUids": "[ "300" ]`, then only the UID 300 host's audio will be transcribed. The languages configuration will not be updated.
- If languages and host UIDs are updated together, pass in `"updateMask=languages,rtcConfig.subscribeAudioUids"`.
- `sequenceId` should increase by 1 for each request.
