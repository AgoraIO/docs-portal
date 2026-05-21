---
title: 临时用户状态
description: 临时用户状态，用于介绍 RTM 在对应平台上的具体能力配置、使用方法和行为约束。
---

你可以在每个频道中为自己设置自定义的临时状态信息，并以事件通知的方式通知频道中其他的在线用户。此功能在需要用户状态提示的场景中非常有用，例如可以实时同步用户的麦位状态、心情、个性签名、得分、消息输入状态等。

RTM 不会永久保存临时状态数据。当用户取消订阅频道、掉线超时或退出频道时，该数据会被删除。如果你想长久保存此数据，你可以使用 RTM 的 User Metadata 功能。

当用户临时状态发生变更时，RTM 会实时触发 `REMOTE_STATE_CHANGED` 事件通知，加入频道时设置了 `withPresence = true` 的用户会收到事件通知。

## 设置临时用户状态

Presence 功能只能为当前用户设置临时用户状态。你可以在订阅或加入频道之前设置状态，但此时数据只是被缓存在客户端，并不会生效。当你订阅或加入指定频道后，数据会立即生效，并触发相应的事件通知。`SetStateAsync` 方法对于 Message Channel 和 Stream Channel 都适用，你需要使用 `channelType` 参数进行区分。

```csharp showLineNumbers
StateItem[] myStates = new StateItem[]
{
    new StateItem("Mode","Happy"),
    new StateItem("Mic","False"),
    new StateItem("Score","100"),
};
var (status,response) = await rtmClient.GetPresence().SetStateAsync("Chat_room", RTM_CHANNEL_TYPE.MESSAGE, myStates);
if (status.Error)
{
    Debug.Log(string.Format(" is failed!", status.Operation));
    Debug.Log(string.Format("Error code : ", status.ErrorCode));
    Debug.Log(string.Format("Due to: ", status.Reason));
}
else
{
    Debug.Log("Set State Success!");
}
```

使用 `SetStateAsync` 方法设置临时用户状态时，如果指定的键已经存在，则该键的值会被新值覆盖。如果指定的键不存在，则会新增一个键/值对。

## 获取临时用户状态

你可能需要获取某个用户在指定频道中设置的临时用户状态。当你作为 App 管理员时，此功能就显得非常有用。此时，你可以使用 `GetStateAsync` 方法来实现。

```csharp showLineNumbers
var (status,response) = await rtmClient.GetPresence().GetStateAsync("Chat_room", RTM_CHANNEL_TYPE.MESSAGE, "Tony");
if (status.Error)
{
    Debug.Log(string.Format(" is failed!}", status.Operation));
    Debug.Log(string.Format("Error code : ", status.ErrorCode));
    Debug.Log(string.Format("Due to: ", status.Reason));
}
else
{
    var userState = response.State;
    Debug.Log(string.Format("User:, have stateCount: states",userState.userId, userState.statesCount));
    foreach(StateItem stateItem in userstate.states)
    {
        Debug.Log(string.Format("State Key: , State Value:", stateItem.key,stateItem.value));
    }
}
```

使用 `GetStateAsync` 方法可以获取频道中其他在线用户的临时状态数据，如果用户不在当前的频道（退出频道或掉线超时），则返错误提示 `PRESENCE_USER_NOT_EXIST`。

## 删除临时用户状态

每个用户在一个频道中至多可以设置 32 个键/值对。对于不再需要的键/值对，调用 `RemoveStateAsync` 方法并提供键的列表即可删除。`RemoveStateAsync` 方法只能删除当前用户的临时用户状态数据。

```csharp
string[] keys = new string[] ;
var (status,response) = await rtmClient.GetPresence().RemoveStateAsync("Chat_room", RTM_CHANNEL_TYPE.MESSAGE, keys);
if (status.Error)
{
    Debug.Log(string.Format(" is failed!}", status.Operation));
    Debug.Log(string.Format("Error code : ", status.ErrorCode));
    Debug.Log(string.Format("Due to: ", status.Reason));
}
else
{
    Debug.Log("Remove State Success!");
}
```

`SetStateAsync` 方法和 `RemoveStateAsync` 方法都会触发 `REMOTE_STATE_CHANGED` 事件通知，加入频道时设置了 `withPresence = true` 的用户会收到事件通知，其中包含了当前用户临时状态的全量数据。
