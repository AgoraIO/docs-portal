---
title: 临时用户状态
description: 临时用户状态，用于介绍 RTM 在对应平台上的具体能力配置、使用方法和行为约束。
---

你可以在每个频道中为自己设置自定义的临时状态信息，并以事件通知的方式通知频道中其他的在线用户。此功能在需要用户状态提示的场景中非常有用，例如可以实时同步用户的麦位状态、心情、个性签名、得分、消息输入状态等。

RTM 不会永久保存临时状态数据。当用户取消订阅频道、掉线超时或退出频道时，该数据会被删除。如果你想长久保存此数据，你可以使用 RTM 的 User Metadata 功能。

当用户临时状态发生变更时，RTM 会实时触发 `RTM_PRESENCE_EVENT_TYPE_REMOTE_STATE_CHANGED` 事件通知，加入频道时设置了 `withPresence = true` 的用户会收到事件通知。

## 设置临时用户状态

Presence 功能只能为当前用户设置临时用户状态。你可以在订阅或加入频道之前设置状态，但此时数据只是被缓存在客户端，并不会生效。当你订阅或加入指定频道后，数据会立即生效，并触发相应的事件通知。`setState` 方法对于 Message Channel 和 Stream Channel 都适用，你需要使用 `channelType` 参数进行区分。

```cpp
std::vector items;
StateItem item;
item.key = "Mode";
item.value = "Happy";
items.emplace_back(item);

uint64_t requestId;
rtm_client->getPresence()->setState("channelName", RTM_CHANNEL_TYPE_MESSAGE, items.data(), items.size(), requestId);
```

调用该方法后，SDK 会触发 `onPresenceSetStateResult` 回调并返回 API 调用结果。

```cpp
// 异步回调
class RtmEventHandler : public IRtmEventHandler {
    void onPresenceSetStateResult(const uint64_t requestId, RTM_ERROR_CODE errorCode) override {
        if (errorCode != RTM_ERROR_OK) {
            printf("SetState failed error is %d reason is %s\n", errorCode, getErrorReason(errorCode));
        } else {
            printf("SetState success\n");
        }
    }
};
```

使用 `setState` 方法设置临时用户状态时，如果指定的键已经存在，则该键的值会被新值覆盖。如果指定的键不存在，则会新增一个键/值对。

## 获取临时用户状态

你可能需要获取某个用户在指定频道中设置的临时用户状态。当你作为 App 管理员时，此功能就显得非常有用。此时，你可以使用 `getState` 方法来实现。

```cpp
uint64_t requestId;
rtm_client->getPresence()->getState("channelName", RTM_CHANNEL_TYPE_MESSAGE, "tony", requestId);
```

调用该方法后，SDK 会触发 `onPresenceGetStateResult` 回调并返回 API 调用结果。

```cpp
// 异步回调
class RtmEventHandler : public IRtmEventHandler {
    void onPresenceGetStateResult(const uint64_t requestId, const UserState &state, RTM_ERROR_CODE errorCode) override {
        if (errorCode != RTM_ERROR_OK) {
            printf("GetState failed error is %d reason is %s\n", errorCode, getErrorReason(errorCode));
        } else {
            printf("GetState user id: %s success\n", state.userId);
            for (int i = 0; i < state.statesCount; i++) {
                printf("key: %s, value: %s\n", state.states[i].key, state.states[i].value);
            }
        }
    }
};
```

使用 `getState` 方法可以获取频道中其他在线用户的临时状态数据，如果用户不在当前的频道（退出频道或掉线超时），则返错误提示 `RTM_ERROR_PRESENCE_USER_NOT_EXIST`。

## 删除临时用户状态

每个用户在一个频道中至多可以设置 32 个键/值对。对于不再需要的键/值对，调用 `removeState` 方法并提供键的列表即可删除。`removeState` 方法只能删除当前用户的临时用户状态数据。

```cpp
std::vector<const char*> keys;
keys.push_back("Mode");
keys.push_back("Mic");

uint64_t requestId;
rtmClient->getPresence()->removeState("channelName", RTM_CHANNEL_TYPE_MESSAGE, keys.data(), keys.size(), requestId);
```

调用该方法后，SDK 会触发 `onPresenceRemoveStateResult` 回调并返回 API 调用结果。

```cpp
// 异步回调
class RtmEventHandler : public IRtmEventHandler {
void onPresenceRemoveStateResult(const uint64_t requestId, RTM_ERROR_CODE errorCode) override {
    if (errorCode != RTM_ERROR_OK) {
        printf("RemoveState failed error is %d reason is %s\n", errorCode, getErrorReason(errorCode));
    } else {
        printf("RemoveState success\n");
    }
}
};
```

`setState` 方法和 `removeState` 方法都会触发 `RTM_PRESENCE_EVENT_TYPE_REMOTE_STATE_CHANGED` 事件通知，加入频道时设置了 `withPresence = true` 的用户会收到事件通知，其中包含了当前用户临时状态的全量数据。
