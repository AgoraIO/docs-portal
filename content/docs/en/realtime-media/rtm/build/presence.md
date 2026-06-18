---
title: "Presence"
description: "Manage user presence and their status in a channel."
---

In Signaling solutions, it is often important to know a user's current online status. For example, in instant messaging, chat applications, and online collaboration tools, users need to see the availability of their contacts. This information is typically displayed as a status message or icon next to a user's name. Presence features in Signaling SDK enable you to monitor join, leave, and status change notifications for users in a channel. Using Presence, you can:

- Get a list of users currently in a channel and their temporary status data.
- Get a list of channels a specified user has joined or is subscribed to.
- Get, set, or remove user statuses.
- Receive real-time event notifications when users join or leave specified channels.
- Receive user status change event notifications in real time.

## Understand the tech

Presence provides real-time information about the availability, and the current status of users, for effective communication and collaboration. It enables you to retrieve a list of users in a channel, or to query the list of channels for a specific user. The following figure illustrates how you integrate presence features into your app.

**Presence workflow**

![](/images/signaling/presence-workflow.svg)

## Prerequisites

Ensure that you have integrated the Signaling SDK in your project, and implemented the framework functionality from the [SDK quickstart](../index.mdx) page.

:::info
Presence features require Signaling SDK version 2.2.0 or later.

:::

## Implement presence features

Using presence, you can implement the following features:

### Get channel users

To obtain a list of online users in a channel, call `getOnlineUsers`. Depending on your parameter settings, this method returns a list of online user IDs in a channel and their temporary status data, or just the number of online users in the channel. You do not need to join a channel to call this method. This method is applicable to both message channels and stream channels. Use the `channelType` parameter to specify the channel type.

After obtaining the initial online users list, update it in real time through `onPresenceEvent` event notifications.

Refer to the following sample code to query the list of online users in a channel and their current status:

<CodeBlockTabs defaultValue="java">
<CodeBlockTabsList>
 <CodeBlockTabsTrigger value="java">Java</CodeBlockTabsTrigger>
 <CodeBlockTabsTrigger value="kotlin">Kotlin</CodeBlockTabsTrigger>
</CodeBlockTabsList>

<CodeBlockTab value="java">

```java
// Set the channelType to MESSAGE or STREAM 
RtmChannelType channelType = RtmChannelType.MESSAGE;
PresenceOptions options = new PresenceOptions();
options.setIncludeUserId(true);
options.setIncludeState(true);

mRtmClient.getPresence().getOnlineUsers(channelName, channelType, options, new ResultCallback<GetOnlineUsersResult>() {
    @Override
    public void onSuccess(GetOnlineUsersResult result) {
        log(CALLBACK, "getOnlineUsers success");
        for (UserState state : result.getUserStateList()) {
            log(INFO, "user id: " + state.getUserId());
            state.getStates().forEach((key, value) -> {
                log(INFO, "key: " + key + ", value: " + value);
            });
        }
    }

    @Override
    public void onFailure(ErrorInfo errorInfo) {
        log(ERROR, errorInfo.toString());
    }
});
```
</CodeBlockTab>

<CodeBlockTab value="kotlin">

```kotlin
// Set the channelType to MESSAGE or STREAM 
val channelType = RtmChannelType.MESSAGE
val options = PresenceOptions().apply {
    setIncludeUserId(true)
    setIncludeState(true)
}

mRtmClient.getPresence().getOnlineUsers(channelName, channelType, options, object : ResultCallback<GetOnlineUsersResult> {
    override fun onSuccess(result: GetOnlineUsersResult) {
        log(CALLBACK, "getOnlineUsers success")
        for (state in result.userStateList) {
            log(INFO, "user id: " + state.userId)
            state.states.forEach { (key, value) ->
                log(INFO, "key: $key, value: $value")
            }
        }
    }

    override fun onFailure(errorInfo: ErrorInfo) {
        log(ERROR, errorInfo.toString())
    }
})
```
</CodeBlockTab>

</CodeBlockTabs>

The `getOnlineUsers` method retrieves one page of data at a time. Each page contains up to 100 online users. If the channel has more than 100 users, the `nextPage` field in the returned `result` contains a bookmark for the next page. After each query, check if `result.getNextPage` is empty to determine if there is more data. To retrieve the next page, set the `page` field in `PresenceOptions` to the value of `result.getNextPage`. Repeat this process until `result.getNextPage` is null. Refer to the following code:

<CodeBlockTabs defaultValue="java">
<CodeBlockTabsList>
 <CodeBlockTabsTrigger value="java">Java</CodeBlockTabsTrigger>
 <CodeBlockTabsTrigger value="kotlin">Kotlin</CodeBlockTabsTrigger>
</CodeBlockTabsList>

<CodeBlockTab value="java">

```java
PresenceOptions options =  new PresenceOptions();
options.setIncludeUserId(true);
options.setIncludeState(true);
options.setPage("your_Next_Page_Bookmark");

// Set the channelType to MESSAGE or STREAM 
RtmChannelType channelType = RtmChannelType.MESSAGE;
mRtmClient.getPresence().getOnlineUsers(channelName, channelType, options, new ResultCallback<GetOnlineUsersResult>() {
    @Override
    public void onSuccess(GetOnlineUsersResult result) {
        // If nextPage exists, fill the value of nextPage into the page field of getOnlineUsersOptions for the next getOnlineUsers call
        log(CALLBACK, "getOnlineUsers success");
        log(INFO, "next page: " + result.getNextPage());
        for (UserState state : result.getUserStateList()) {
            log(INFO, "user id: " + state.getUserId());
            state.getStates().forEach((key, value) -> {
                log(INFO, "key: " + key + ", value: " + value);
            });
        }
    }

    @Override
    public void onFailure(ErrorInfo errorInfo) {
        log(ERROR, errorInfo.toString());
    }
});
```
</CodeBlockTab>

<CodeBlockTab value="kotlin">

```kotlin
val options = PresenceOptions().apply {
    setIncludeUserId(true)
    setIncludeState(true)
    setPage("your_Next_Page_Bookmark")
}

// Set the channelType to MESSAGE or STREAM 
val channelType = RtmChannelType.MESSAGE
mRtmClient.getPresence().getOnlineUsers(channelName, channelType, options, object : ResultCallback<GetOnlineUsersResult> {
    override fun onSuccess(result: GetOnlineUsersResult) {
        // If nextPage exists, fill the value of nextPage into the page field of getOnlineUsersOptions for the next getOnlineUsers call
        log(CALLBACK, "getOnlineUsers success")
        log(INFO, "next page: \${result.nextPage\}")
        for (state in result.userStateList) {
            log(INFO, "user id: \${state.userId\}")
            state.states.forEach { (key, value) ->
                log(INFO, "key: $key, value: $value")
            }
        }
    }

    override fun onFailure(errorInfo: ErrorInfo) {
        log(ERROR, errorInfo.toString())
    }
})
```
</CodeBlockTab>

</CodeBlockTabs>

When there is a large number of users in a channel, you may only care about the total number of online users, and not their identities or temporary status. To get the total channel occupancy, set `includeState` and `includeUserId` in `PresenceOptions` to `false`. 

<CodeBlockTabs defaultValue="java">
<CodeBlockTabsList>
 <CodeBlockTabsTrigger value="java">Java</CodeBlockTabsTrigger>
 <CodeBlockTabsTrigger value="kotlin">Kotlin</CodeBlockTabsTrigger>
</CodeBlockTabsList>

<CodeBlockTab value="java">

```java
PresenceOptions options = new PresenceOptions();
options.setIncludeUserId(false);
options.setIncludeState(false);

// Set the channelType to MESSAGE or STREAM 
RtmChannelType channelType = RtmChannelType.MESSAGE;
mRtmClient.getPresence().getOnlineUsers(channelName, channelType, options, new ResultCallback<GetOnlineUsersResult>() {
    @Override
    public void onSuccess(GetOnlineUsersResult result) {
        log(CALLBACK, "Total occupancy: " + result.getTotalOccupancy());
    }

    @Override
    public void onFailure(ErrorInfo errorInfo) {
        log(ERROR, errorInfo.toString());
    }
});
```
</CodeBlockTab>

<CodeBlockTab value="kotlin">

```kotlin
val options = PresenceOptions().apply {
    setIncludeUserId(false)
    setIncludeState(false)
}

// Set the channelType to MESSAGE or STREAM 
val channelType = RtmChannelType.MESSAGE
mRtmClient.getPresence().getOnlineUsers(channelName, channelType, options, object : ResultCallback<GetOnlineUsersResult> {
    override fun onSuccess(result: GetOnlineUsersResult) {
        log(CALLBACK, "Total occupancy: \${result.totalOccupancy\}")
    }

    override fun onFailure(errorInfo: ErrorInfo) {
        log(ERROR, errorInfo.toString())
    }
})
```
</CodeBlockTab>

</CodeBlockTabs>

In this case, only the `totalOccupancy` property in the result is valid while all other fields are empty. 

:::info
You cannot set `includeState` to `true` and `includeUserId` to `false` at the same time. To get the temporary status of users, you must also retrieve their user IDs.

:::

### Get user channels

The `getUserChannels` method enables you to query which channels a user is currently in. This includes the message channels a user has subscribed to and the stream channels they have joined. This method is particularly useful for tracking user paths. Refer to the following sample code:

<CodeBlockTabs defaultValue="java">
<CodeBlockTabsList>
 <CodeBlockTabsTrigger value="java">Java</CodeBlockTabsTrigger>
 <CodeBlockTabsTrigger value="kotlin">Kotlin</CodeBlockTabsTrigger>
</CodeBlockTabsList>

<CodeBlockTab value="java">

```java
mRtmClient.getPresence().getUserChannels("userid", new ResultCallback<ArrayList<ChannelInfo>>() {
    @Override
    public void onSuccess(ArrayList<ChannelInfo> channels) {
        log(CALLBACK, "get getUserChannels success");
        for (ChannelInfo channel : channels) {
            log(INFO, channel.toString());
        }
    }

    @Override
    public void onFailure(ErrorInfo errorInfo) {
        log(ERROR, errorInfo.toString());
    }
});
```
</CodeBlockTab>

<CodeBlockTab value="kotlin">

```kotlin
mRtmClient.getPresence().getUserChannels("userid", object : ResultCallback<ArrayList<ChannelInfo>> {
    override fun onSuccess(channels: ArrayList<ChannelInfo>) {
        log(CALLBACK, "get getUserChannels success")
        for (channel in channels) {
            log(INFO, channel.toString())
        }
    }

    override fun onFailure(errorInfo: ErrorInfo) {
        log(ERROR, errorInfo.toString())
    }
})
```
</CodeBlockTab>

</CodeBlockTabs>

The `getUserChannels` method returns complete query results about the channels and their types that the queried user is in, without pagination.

## User status management

Signaling enables you to set and delete user status messages for the local user in each channel. The SDK notifies other online users in the channel of these changes through event notifications. This feature is useful in use-cases where user status sharing is required, such as real-time synchronization of the user's microphone status, mood, personal signature, score, and message input status.

Signaling does not permanently save the status data. When a user unsubscribes from a channel, times out, or exits a channel, the data is deleted. To save user data permanently, use the [Store user metadata](storage/store-user-metadata.md) feature.

When a user's temporary status changes, Signaling triggers a `REMOTE_STATE_CHANGED` event notification in real time. Users who set `withPresence = true` when joining the channel, receive the event notification.

### Set status

Using presence, you can set the temporary user status for the local user. When you set the status before subscribing to or joining a channel, the data is cached on the client and does not take effect immediately. The status is updated and corresponding event notifications are triggered when you subscribe to or join a channel. The `setState` method applies to both message and stream channels; use the `channelType` parameter to specify the channel type.

<CodeBlockTabs defaultValue="java">
<CodeBlockTabsList>
 <CodeBlockTabsTrigger value="java">Java</CodeBlockTabsTrigger>
 <CodeBlockTabsTrigger value="kotlin">Kotlin</CodeBlockTabsTrigger>
</CodeBlockTabsList>

<CodeBlockTab value="java">

```java
HashMap<String, String> items = new HashMap<String, String>();
items.put("Mode", "Happy");
items.put("Mic", "False");

mRtmClient.getPresence().setState("channel_name", RtmChannelType.MESSAGE, items, new ResultCallback<Void>() {
    @Override
    public void onSuccess(Void responseInfo) {
        log(CALLBACK, "setState success");
    }

    @Override
    public void onFailure(ErrorInfo errorInfo) {
        log(ERROR, errorInfo.toString());
    }
});
```
</CodeBlockTab>

<CodeBlockTab value="kotlin">

```kotlin
val items = HashMap<String, String>()
items["Mode"] = "Happy"
items["Mic"] = "False"

mRtmClient.getPresence().setState("channel_name", RtmChannelType.MESSAGE, items, object : ResultCallback<Void> {
    override fun onSuccess(responseInfo: Void?) {
        log(CALLBACK, "setState success")
    }

    override fun onFailure(errorInfo: ErrorInfo) {
        log(ERROR, errorInfo.toString())
    }
})
```
</CodeBlockTab>

</CodeBlockTabs>

When using `setState` to set temporary user status, if the specified key already exists, its value is overwritten by the new value. If the specified key does not exist, a new key-value pair is added.

### Get status

To obtain the temporary user status set by a user in a specified channel, use the `getState` method:

<CodeBlockTabs defaultValue="java">
<CodeBlockTabsList>
 <CodeBlockTabsTrigger value="java">Java</CodeBlockTabsTrigger>
 <CodeBlockTabsTrigger value="kotlin">Kotlin</CodeBlockTabsTrigger>
</CodeBlockTabsList>

<CodeBlockTab value="java">

```java
String userId = "Tony";
mRtmClient.getPresence().getState("Chat_room", RtmChannelType.MESSAGE, userId, new ResultCallback<UserState>() {
    @Override
    public void onSuccess(UserState state) {
        log(CALLBACK, "get users(" + state.getUserId() + ") state success, " + state.toString());
    }

    @Override
    public void onFailure(ErrorInfo errorInfo) {
        log(ERROR, errorInfo.toString());
    }
});
```
</CodeBlockTab>

<CodeBlockTab value="kotlin">

```kotlin
val userId = "Tony"
mRtmClient.getPresence().getState("Chat_room", RtmChannelType.MESSAGE, userId, object : ResultCallback<UserState> {
    override fun onSuccess(state: UserState) {
        log(CALLBACK, "get users(\${state.userId\}) state success, \${state.toString()\}")
    }

    override fun onFailure(errorInfo: ErrorInfo) {
        log(ERROR, errorInfo.toString())
    }
})
```
</CodeBlockTab>

</CodeBlockTabs>

Use the `getState` method to obtain the temporary status of other online users in the channel. If the queried user is not present in the specified channel, a `PRESENCE_USER_NOT_EXIST` error message is returned by the SDK.

### Delete status

Each user can set up to 32 key-value pairs in a channel. To remove items that are no longer needed, call `removeState` with a list of keys. The `removeState` method only deletes temporary user status data for the local user.

<CodeBlockTabs defaultValue="java">
<CodeBlockTabsList>
 <CodeBlockTabsTrigger value="java">Java</CodeBlockTabsTrigger>
 <CodeBlockTabsTrigger value="kotlin">Kotlin</CodeBlockTabsTrigger>
</CodeBlockTabsList>

<CodeBlockTab value="java">

```java
ArrayList<String> keys = new ArrayList<>(Arrays.asList("Mode", "Mic"));
mRtmClient.getPresence().removeState("Chat_room", RtmChannelType.MESSAGE, keys, new ResultCallback<Void>() {
    @Override
    public void onSuccess(Void responseInfo) {
        log(CALLBACK, "removeState success");
    }

    @Override
    public void onFailure(ErrorInfo errorInfo) {
        log(ERROR, errorInfo.toString());
    }
});
```
</CodeBlockTab>

<CodeBlockTab value="kotlin">

```kotlin
val keys = ArrayList(listOf("Mode", "Mic"))
mRtmClient.getPresence().removeState("Chat_room", RtmChannelType.MESSAGE, keys, object : ResultCallback<Void> {
    override fun onSuccess(responseInfo: Void?) {
        log(CALLBACK, "removeState success")
    }

    override fun onFailure(errorInfo: ErrorInfo) {
        log(ERROR, errorInfo.toString())
    }
})
```
</CodeBlockTab>

</CodeBlockTabs>

Both the `setState` and `removeState` methods trigger `REMOTE_STATE_CHANGED` event notifications. Users who join the channel with `withPresence` set to `true` receive event notifications containing full data of the user's temporary status.

## Receive presence event notifications

A presence event notification returns the [PresenceEvent](https://docs.agora.io/en/signaling/reference/api) data structure, which includes the [RtmPresenceEventType](https://docs.agora.io/en/signaling/reference/api) parameter.

To receive presence event notifications, implement an event listener. See [event listeners](https://docs.agora.io/en/signaling/reference/api) for details. In addition, set the `withPresence` parameter to `true` when subscribing to or joining a channel. 

### Event notification modes

The presence event notification mode determines how subscribed users receive event notifications. There are two notification modes: 

- `Announce`: Real-time notification mode  
- `Interval`: Scheduled notification mode 

You set the **Max number of instant event** value in Agora Console to specify the condition for switching between the two modes. The scheduled notification mode helps prevent event noise that results from a large number of online users in the channel. See [Presence configuration](../manage-agora-account.md) for details.

#### Real-time notification mode

If the number of instant notifications in the channel is less than the **Max number of instant event** value, presence event notifications operate in real-time notification mode. In this mode, `REMOTE_JOIN`, `REMOTE_LEAVE`, `REMOTE_TIMEOUT`, and `REMOTE_STATE_CHANGED` notifications are sent to the client in real-time. 

**Join**
```js
{
      eventType: RtmPresenceEventType.REMOTE_JOIN;
      channelType: RtmChannelType.MESSAGE;
      channelName: "test_channel";
      publisher: "publisher_name";
      stateItems: {};
      interval: {
          joinUserList:[],
          leaveUserList:[],
          timeoutUserList:[],
          userStateList:[],
      };
      snapshot: {
          userStateList:[]
      };
      timestamp: 1710487149497;
}
```

**Leave**
```js
{
      eventType: RtmPresenceEventType.REMOTE_LEAVE;
      channelType: RtmChannelType.MESSAGE;
      channelName: "test_channel";
      publisher: "publisher_name";
      stateItems: {};
      interval: {
          joinUserList:[],
          leaveUserList:[],
          timeoutUserList:[],
          userStateList:[],
      };
      snapshot: {
          userStateList:[]
      };
      timestamp: 1710487149497;
}
```

**Timeout**
```js
{
      eventType: RtmPresenceEventType.REMOTE_TIMEOUT;
      channelType: RtmChannelType.MESSAGE;
      channelName: "test_channel";
      publisher: "publisher_name";
      stateItems: {};
      interval: {
          joinUserList:[],
          leaveUserList:[],
          timeoutUserList:[],
          userStateList:[],
      };
      snapshot: {
          userStateList:[]
      };
      timestamp: 1710487149497;
}
```

**Snapshot**
```js
{
      eventType: RtmPresenceEventType.SNAPSHOT;
      channelType: RtmChannelType.MESSAGE;
      channelName: "test_channel";
      publisher: "";
      stateItems: {};
      interval: {
          joinUserList:[],
          leaveUserList:[],
          timeoutUserList:[],
          userStateList:[],
      };
      snapshot: {
          userStateList:[
              {
                  userId: "user_a",
                  states: {}
              },
              {
                  userId: "user_b",
                  states: {
                      key: "key_1";
                      value: "value_1";
                  }
              },
              {
                  userId: "yourSelf",
                  states: {}
              },
          ]
      };
      timestamp: 1710487149497;
}
```

**State change**
```js
{
      eventType: RtmPresenceEventType.REMOTE_STATE_CHANGED;
      channelType: RtmChannelType.MESSAGE;
      channelName: "test_channel";
      publisher: "publisher_name";
      stateItems: {
          "key_1":"value_1";
      };
      interval: {
          joinUserList:[],
          leaveUserList:[],
          timeoutUserList:[],
          userStateList:[],
      };
      snapshot: {
          userStateList:[]
      };
     timestamp: 1710487149497;
}
```

#### Scheduled notification mode

When the number of online users in the channel exceeds the **Max number of instant event** value, the channel switches to the scheduled notification mode. In this mode, `REMOTE_JOIN`, `REMOTE_LEAVE`, `REMOTE_TIMEOUT`, and `REMOTE_STATE_CHANGED` events are replaced by `INTERVAL` events and sent to all users in the channel at specific time intervals. Users receive the following notification:

```js
{
      eventType: RtmPresenceEventType.INTERVAL,
      channelTye: RtmChannelType.MESSAGE,
      channelName: "Chat_room",
      publisher: "",
      stateItems: {},
      interval: {
          joinUserList: ["Tony", "Lily"],
          leaveUserList: ["Jason"],
          timeoutUserList: ["Wang"],
          userStateList: [
              {
                  userId: "Harvard",
                  states: [
                      {
                          key: "Mic",
                          value: "False"
                      },
                     {
                          key: "Position",
                          value: "Beijing"
                      }
                 ]
              }
          ]
      },
      snapshot: {
          userStateList: []
      },
      timestamp: 1710487149497
}
```

## Reference

This section contains content that completes the information on this page, or points you to documentation that explains other aspects to this product.

### API reference

- [`getOnlineUsers​`](https://docs.agora.io/en/signaling/reference/api)
- [`getUserChannels`](https://docs.agora.io/en/signaling/reference/api)
- [`setState`](https://docs.agora.io/en/signaling/reference/api)
- [`getState`](https://docs.agora.io/en/signaling/reference/api)
- [`removeState`](https://docs.agora.io/en/signaling/reference/api)
- [Event listeners](https://docs.agora.io/en/signaling/reference/api)
