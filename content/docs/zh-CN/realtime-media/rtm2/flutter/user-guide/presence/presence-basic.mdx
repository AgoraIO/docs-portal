---
title: Presence 基础
description: Presence 基础，用于介绍 RTM 在对应平台上的具体能力配置、使用方法和行为约束。
---

**Presence** 服务让你具备洞察指定频道中用户状态的能力：

- 获取频道内在线用户列表
- 获取在线用户所在频道列表
- 动态监控在线用户临时状态变更

## 获取频道内在线用户

在一些应用场景中，你可能想要知道某个频道有多少在线用户，并获取在线用户列表等。你可以通过 `whoNow` 方法实现此功能。根据你的参数设置，该方法可以返回当前频道在线用户的用户 ID 列表及其临时状态数据或者仅返回当前频道在线用户的数量等。调用此方法无需你加入该频道，只需要将频道名作为参数传入该方法即可。

> **信息 - 使用参数区分频道类型**
> 该方法对 Message Channel 和 Stream  Channel 都适用，你可以使用 `channelType` 参数加以区分。

获取到这些初始信息后，你可以通过 `presence` 事件通知实时更新频道中在线用户信息。

下面是查询频道内在线用户列表及其临时状态的示例代码：

```dart
final channelName = 'chat_room';
try {
    var (status,response) = await rtmClient.getPresence.whoNow(
        channelName,
        RtmChannelType.message,
        includeUserId:true,
        includeState:true );
    if (status == true){
        print('$ failed, errorCode: $, due to $');
    } esle {
        // 如果 nextPage 存在，下一次调用 whoNow 时，需将 nextPage 的值填入 page 字段
        var nextPage = response.nextPage;
        var count = response.count;
        var userStateList = response.userStateList;
        userStateList.forEach((userState) {
            print(`$ has states: $`);
        });
    }
} catch (e) {
    print('something went wrong: $e');
}
```

`whoNow` 方法一次返回一页数据，一页数据最多包含 100 个在线用户信息，如果频道在线用户超过 100 人，则会在返回结果中的 `nextPage` 字段包含下一页数据的书签。你需要在每次查询后判断 `nextPage` 是否为空，从而判断是否还有下一页数据。查询下一页数据时，将 `nextPage` 的值填入 `whoNow` 方法的 `page` 字段即可实现分页查询，以此往复，直到 `nextPage` 的值为空便是最后一页。例如：

```dart
final channelName = 'chat_room';
try {
    var (status,response) = await rtmClient.getPresence.whoNow(
        channelName,
        RtmChannelType.message,
        includeUserId: true,
        includeState: true
        page: 'your_Next_Page_Bookmark');
    if (status == true){
        print('$ failed, errorCode: $, due to $');
    } else {
        // 如果 nextPage 存在，下一次调用 whoNow 时，需将 nextPage 的值填入 page 字段
        var nextPage = response.nextPage;
        var count = response.count;
        var userStateList = response.userStateList;
        userStateList.forEach((userState) {
            print(`$ has states: $`);
        });
    }
} catch (e) {
    print('something went wrong: $e');
}
```

当频道中人数众多时，你可能只关心频道中在线用户数量，而不关心他们是谁及其临时状态如何。此时可以设置 `whoNow` 方法中的 `includeState` 和 `includeUserId` 字段为 `false`。例如：

```dart
final channelName = 'chat_room';
try {
    var (status,response) = await rtmClient.getPresence.whoNow(
        channelName,
        RtmChannelType.message,
        includeUserId: false,
        includeState: false);

    if (status == true){
        print('$ failed, errorCode: $, due to $');
    } esle {
        // 如果 nextPage 存在，下一次调用 whoNow 时，需将 nextPage 的值填入 page 字段
        var nextPage = response.nextPage;
        var count = response.count;
        print('There are $count occupants in $channelName channel');
    }
} catch (e) {
    print('something went wrong: $e');
}
```

此时返回的 `WhoNowResult` 中只有 `count` 字段有效，表示当前频道总人数，而其他字段全部为空。

> **信息**
> 不可以同时设置 `includeState = true` 且 `includeUserId = false`，即获取用户的临时状态就必须要返回用户 ID，否则会设置失败并收到错误码。

## 获取在线用户所在频道

你可能需要查询某个用户当前在哪些频道中，例如订阅了哪些 Message Channel 或加入了哪些 Stream Channel。特别是作为 App 管理员想要追踪用户路径时，这个功能就显得特别重要，此时你可以调用 `whereNow` 方法来实现。

```dart
try {
    var (status,response) = await rtmClient.getPresence.whereNow("Tony");
    if (status == true){
        print('$ failed, errorCode: $, due to $');
    } esle {
        var channels = response.channels;
        var count = response.count;
        channels.forEach((channelInfo) {
            print('$:$')
        });
    }
} catch (e) {
    print('something went wrong: $e');
}
```

`whereNow` 方法会返回查询用户所在频道及其类型的信息。该方法会一次性返回所有查询结果，不会进行分页。
