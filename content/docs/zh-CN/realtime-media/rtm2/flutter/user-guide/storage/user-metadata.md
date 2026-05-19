---
title: User Metadata
description: User Metadata，用于介绍 RTM 在对应平台上的具体能力配置、使用方法和行为约束。
---

`Storage` 服务为你提供了 User Metadata 的能力，可以用来存储和分发你的应用中关于用户的上下文数据，例如：姓名、年龄、头像链接等自定义数据。User Metadata 在被设置、更新和删除的时候会触发 `storage` 事件通知，订阅此 User Metadata 的用户会在 100ms 内收到此信息。

需要注意的是，User Metadata 属于永久存储，一旦被设置将会长期保存在 RTM 数据库，不会因为你的用户注销而丢失，直到你手动删除它们为止。知道这一点非常重要，因为它将影响你的存储计费项，详见[计费规则](../../overview/billing/billing-strategy)。

## 设置 User Metadata

你可以为指定的用户设置一组 User Metadata 用以实现业务上用户级别的数据存储和实时通知，例如用户的姓名、年级、头像链接、自我介绍等任何自定义数据。每个用户只能有一组 User Metadata，但每组 User Metadata 可以包含一个或多个 Metadata Item，相关限制详见 [API 使用限制](../setup/api-limits)。每个 Metadata Item 包含有 `key`、`value`、`revision` 预定义字段。

如果当前 User Metadata 或者 Metadata Item 不存在，该方法将为指定用户新增属性；如果 User Metadata 或者 Metadata Item 存在，则会使用新值覆盖原有值。

以下示例代码展示了如何设置 User Metadata：

```dart
var Name = MetadataItem.fromJson({
    'key' : 'Name',
    'value' : 'Tony'
});

var Age = MetadataItem.fromJson({
    'key' : 'Age',
    'value' : '40'
});

var Avatar = MetadataItem.fromJson({
    'key' : 'Avatar',
    'value' : 'https://your-domain/avatar/tong.png'
});

var metadata = [Name,Age,Avatar];

try{
    var (status,response) = await rtmClient.getStorage.setUserMetadata(
        'Tony',
        metadata,
        recordTs: true,
        recordUserId: true);

    if (status.error == true) {
        print(status);
    } else {
        print(response);
    }
} catch (e) {
    print('something went wrong: $e');
}
```

上述示例代码中，我们为用户 `Tony` 设置了一组 User Metadata，其中包含三个 Metadata Item，分别为 `Name`、`Age` 和 `Avatar`。同时我们设置了 `options` 参数要求 RTM 服务在存储上述三个 Metadata Item 时额外添加上时间戳和修改者信息。

关于 `setUserMetadata` 接口详见 <a href=>Storage API 参考</a>。

当上述操作成功后，RTM SDK 会返回如下数据结构：

```dart
{
    userId : "Tony",           // 用户名
}
```

同时，RTM 还会触发一个 `update` 类型的 `storage` 事件通知，并在 100 ms 内通知到订阅了此 User Metadata 的其他人，详见[事件通知](./event.md)。

## 获取 User Metadata

你可以通过调用 `getUserMetadata` 方法获得指定用户的全部属性数据。以下示例代码展示如何获取 User Metadata：

```dart
try{
    var (status,response) = await rtmClient.getStorage.getUserMetadata('Tony');

    if (status.error == true) {
        print(status);
    } else {
        print(response);
    }
} catch (e) {
    print('something went wrong: $e');
}
```

当上述操作成功后，RTM SDK 会返回如下数据结构：

```dart
{
    userId: 'Tony',
    data: {
        majorRevision: 734874862,
        itemCount: 3,
        items: [
            {
                key: 'Name',
                value: 'Tony',
                revision: 734874888,
                updateTs: 1688978391900,
                authorUserId: 'Tony'
            },
            {
                key: 'Age',
                value: '40',
                revision: 734874862,
                updated: 1688978390900,
                authorUid: 'Tomas'
            },
            {
                key: 'Avatar',
                value: 'https://your-domain/avatar/tong.png',
                revision: 734874812,
                updated: 1688978382900,
                authorUid: 'Adam'
            }
        ]
    }
}
```

## 更新 User Metadata

你可以使用 `updateUserMetadata` 来更新已存在的 User Metadata。如果该 User Metadata 不存在，则会返回错误。该接口可用于需要权限控制的业务场景，例如：应用的设置者预定义了 User Metadata 的数据字段和格式，用户只具备更新的权限。

以下示例代码展示了如何更新用户 Metadata Item：

```dart
var Age = MetadataItem.fromJson({
    'key' : 'Age',
    'value' : '45'
});
var metadata = [Age];
try{
    var (status,response) = await rtmClient.getStorage.updateUserMetadata(
        'Tony',
        metadata,
        recordTs: true,
        recordUserId: true);

    if (status.error == true) {
        print(status);
    } else {
        print(response);
    }
} catch (e) {
    print('something went wrong: $e');
}
```

上述示例代码将 `key` 为 `Age` 的年龄数据更新为 `45`。

同时，RTM 还会触发一个 `update` 类型的 `storage` 事件通知，并在 100ms 内通知到订阅此 User Metadata 的其他人。`storage` 详见[事件通知](event)。

## 删除 User Metadata

当你不再需要指定用户的 User Metadata 或者某几个 Metadata Item，你可以进行删除操作。以下示例代码展示了如何使用 `removeUserMetadata` 进行删除操作：

```dart
var Age = MetadataItem.fromJson();
var metadata = [Age];
try{
    var (status,response) = await rtmClient.getStorage.removeUserMetadata(
        'Tony',
        metadata:metadata);

    if (status.error == true) {
        print(status);
    } else {
        print(response);
    }
} catch (e) {
    print('something went wrong: $e');
}
```

以上示例代码中 `value` 不论为何值都没有影响。

```dart
try{
    var (status,response) = await rtmClient.getStorage.removeUserMetadata('Tony');
    if (status.error == true) {
        print(status);
    } else {
        print(response);
    }
} catch (e) {
    print('something went wrong: $e');
}
```

销毁用户账户的过程中，经常见到删除整组 User Metadata 的操作。User Metadata 数据一旦被删除将无法恢复，如果你对数据具有恢复的需求，那么你需要谨慎使用该方法并做好数据备份。

同时，RTM 还会触发一个 `update` 类型的 `storage` 事件通知，并在 100ms 内通知到订阅此 User Metadata 的其他人。`storage` 详见[事件通知](event)。

## 订阅 User Metadata

与订阅 Channel Metadata 类似，如果你需要关注某个用户的属性更新，那么你可以订阅该用户的 User Metadata，参照以下示例代码：

```dart
try{
    var (status,response) = await rtmClient.getStorage.subscribeUserMetadata('Tony');

    if (status.error == true) {
        print(status);
    } else {
        print(response);
    }
} catch (e) {
    print('something went wrong: $e');
}
```

以上示例中我们订阅了用户名为 `Tony` 的 User Metadata，当 `Tony` 的 User Metadata 变化时 RTM 会触发一个 `update` 类型的 `storage` 事件通知，并在 100 ms 内通知到你。

## 取消订阅 User Metadata

如果你对不再关注某个用户的 User Metadata 变更，可以取消订阅，参照以下示例代码：

```dart
try{
    var (status,response) = await rtmClient.getStorage.unsubscribeUserMetadata('Tony');

    if (status.error == true) {
        print(status);
    } else {
        print(response);
    }
} catch (e) {
    print('something went wrong: $e');
}
```

操作成功后，你将不再会收到此 User Metadata 变更通知。

## CAS 控制

User Metadata 与 Channel Metadata 类似，也存在 CAS 控制机制。该方法提供两种独立的版本控制字段，你可以根据实际业务场景设置任意一种或多种：

- 通过 `majorRevision` 属性开启整组 User Metadata 的版本号校验。
- 通过 `MetadataItem` 中的 `revision` 属性开启某个 Metadata Item 的版本号校验。

你可以在需要权限控制的场景中应用 CAS 控制，例如：在交友 App 中同时只允许一位观众与主播连麦，在多人同时发起请求时，只有最先操作的人会成功。

以下示例代码展示了如何使用 `majorRevision` 和 `revision` 更新 User Metadata 和 Metadata Item：

```dart
var Name = MetadataItem.fromJson({
    'key' : 'Name',
    'value' : 'Tony',
    'revision' : 734874812
});

var metadata = [Name];

try{
    var (status,response) = await rtmClient.getStorage.setUserMetadata(
        'Tony',
        metadata,
        majorRevision: 734874892,
        recordTs: true,
        recordUserId: true);

    if (status.error == true) {
        print(status);
    } else {
        print(response);
    }
} catch (e) {
    print('something went wrong: $e');
}
```

上述例子中，我们对 User Metadata 和 Metadata Item `Avatar` 开启 CAS 验证并设置 `majorRevision` 为 `734874892`。服务器在接收到接口调用请求后，会首先验证接口调用提供的 `majorRevision` 与数据库最新值是否匹配，如果不匹配，则返回错误；如果匹配，则继续验证 Metadata Item 的 `revision`，逻辑与验证 User Metadata 相同。

如果你开启了版本控制能力，那么你需要关注 `storage` 事件通知以获取 `majorRevision` 和 `revision` 更新后的值，以便于在接口调用时提供最新值。
