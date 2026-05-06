---
title: Pass Custom Information
description: "During conversations with an agent, you may need to obtain custom contextual information from the client side, such as the user's speaking status, selected text, personal signature, or score, and pass that information to the agent so it can generate responses that better match the user's needs."
---

# Pass Custom Information

During conversations with an agent, you may need to obtain custom contextual information from the client side, such as the user's speaking status, selected text, personal signature, or score, and pass that information to the agent so it can generate responses that better match the user's needs.

This article describes how to carry custom information during conversations with an agent by using capabilities provided by the RTM SDK.

## Technical Principles

The [Agora RTM SDK](https://doc.shengwang.cn/doc/rtm2/homepage) supports setting custom temporary status information for users in a channel and notifying other online users in the channel through events. If your app integrates both Agora RTC and RTM services, you can enable RTM when creating an agent so that, before the large model is called, the agent retrieves temporary status information from the RTM channel and passes it to the large model as contextual information. This helps the agent produce responses that are better aligned with user needs.

## Prerequisites

Before you start, make sure that you have already:

- Implemented the basic logic for interactive conversations with an AI agent by following [Build Voice Interaction with an Agent](../get-started/quick-start.md).
- Integrated the RTM SDK into your app and implemented basic message sending and receiving by following [Send and Receive Messages](https://doc.shengwang.cn/doc/rtm2/android/get-started/quick-start).
- Adapted your large model according to [Custom LLM](./custom-llm.md) so that it can process temporary status information in the `context.presence` field.

## Implementation

### Enable RTM

When calling [POST Create a Conversational AI Agent](../operations/start-agent.md), set `advanced_features.enable_rtm` to `true` to enable RTM, and set `llm.vendor` to `"custom"` to enable a custom large model. The following example shows the request:

> Info
> - Agora recommends enabling String UID (`enable_string_uid` set to `true`) when enabling RTM, and generating a token that has both RTC and RTM permissions by following the [FAQ](https://doc.shengwang.cn/faq/integration-issues/generate-token). You can then pass it in the `agent_rtc_uid` field.
> - Integer UIDs and String UIDs cannot be mixed in the same channel. For more information about String UID usage, see [How to use String user IDs](https://doc.shengwang.cn/faq/integration-issues/string-uid).

```shell
curl --request POST \
  --url https://api.agora.io/cn/api/conversational-ai-agent/v2/projects/<your_app_id>/join \
  --header 'Authorization: agora token="007abcxxxxxxx123"' \
  --data '
{
  "name": "unique_name",
  "properties": {
    "channel": "channel_name",
    "token": "token",
    "agent_rtc_uid": "friday",
    // highlight-start
    "advanced_features": {
      "enable_rtm": true
    },
    // highlight-end
    "remote_rtc_uids": [
      "*"
    ],
    "enable_string_uid": true,
    "llm": {
      "url": "https://api.xxxx/v1/xxxx",
      "api_key": "xxx",
      "vendor": "custom",
      "params": {
        "model": "xxxx",
      }
    },
    "tts": {
      "vendor": "vendor_name",
      "params": {
        "key": "xxxx",
        "voice_id": "xxxx",
      }
    }
  }
}
'

```

### Set Custom Information

Follow the [Temporary User State](https://doc.shengwang.cn/doc/rtm2/android/user-guide/presence/temporary-user-state) documentation to set temporary status information for users in the channel.

### Pass Custom Information

Before the agent calls the large model, it automatically retrieves the temporary status information of the speaking user and passes it to the large model as contextual information. This temporary status information is put into the `context.presence` field.

In the following example, user `UserA` selects the text "Pythagorean theorem" in the app and asks the agent, "What does this mean?" The example JSON shows that, when the agent calls the large model, it retrieves a temporary state value named `selection` for `UserA` from RTM. The request structure is as follows:

```json
{
  "messages": [
    {
      "role": "user",
      "content": "What does this mean?"
    }
  ],
  "context": {
    "presence": {
      "userA": {
        "selection": "Pythagorean theorem"
      }
    }
  },
  "model": "deepseek-r1"
}
```
