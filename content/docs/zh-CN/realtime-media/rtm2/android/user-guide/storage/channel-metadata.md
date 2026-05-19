---
title: Channel Metadata
description: Channel Metadata，用于介绍 RTM 在对应平台上的具体能力配置、使用方法和行为约束。
---

Storage 服务为你提供了 Channel Metadata 的能力，可以用来存储和分发你应用中的上下文数据，例如：道具、公告、成员列表和关系链等。Channel Metadata 在被设置、更新和删除的时候会触发 `onStorageEvent` 事件通知，频道中的其他人会在 100 ms 内收到此信息。Storage 服务对于 Message Channel 和 Stream Channel 都有效，在使用的时候可以通过 `channelType` 参数区分。

Channel Metadata 属于永久存储数据，一旦被设置将会长期保存在 RTM 数据库，不会因为你的频道被销毁而丢失，除非你手动删除。这将影响你的存储计费项，详见[计费规则](../../overview/billing/billing-strategy)。

## 设置 Channel Metadata

你可以为指定频道设置一组 Channel Metadata，用以实现业务上房间级别的数据存储和实时通知，例如房间内的道具信息、拍卖品价格更新、群公告等。每个频道只能有一组 Channel Metadata，但每组 Channel Metadata 可以包含一个或多个 Metadata Item，相关限制详见 [API 使用限制](../setup/api-limits)。每个 Metadata Item 包含 `key`、`value`、`revision` 等预定义字段。

如果当前 Channel Metadata 或者 Metadata Item 不存在，该方法将为指定频道新增属性；如果 Channel Metadata 或者 Metadata Item 已存在，则会使用新值覆盖原有值。关于 `setChannelMetadata` 接口的更多信息详见 <a href=>Storage API 参考</a>。

以下示例展示了如何设置 Channel Metadata：

```java
Metadata metadata = new Metadata();
metadata.getItems().add(new MetadataItem("Quantity", "20"));
metadata.getItems().add(new MetadataItem("Announcement", "Welcome to our shop!"));
metadata.getItems().add(new MetadataItem("T-shirt", "100"));

mRtmClient.getStorage().setChannelMetadata("channel1", RtmChannelType.MESSAGE, metadata, new MetadataOptions(true, true), nullptr, new ResultCallback() {
    @Override
    public void onSuccess(Void responseInfo) {
        log(CALLBACK, "set channel metadata success");
    }

    @Override
    public void onFailure(ErrorInfo errorInfo) {
        log(ERROR, errorInfo.toString());
    }
});
```

上述示例代码中，我们为 Message Channel 类型的频道 `channel1` 设置了一组 Channel Metadata，其中包含三个 Metadata Item，分别为 `properties`、`announcement` 和 `price`。要求 RTM 服务在存储上述三个 Metadata Item 的同时，在每个 Metadata Item 上都额外添加上时间戳和修改者信息。

当上述操作成功后，RTM SDK 会返回如下数据结构：

```java
@Override
public void onSuccess(Void responseInfo) {
}
```

同时，RTM 还会触发一个 `UPDATE` 类型的 `onStorageEvent` 事件通知，并在 100 ms 内通知到频道中的其他人，详见[事件通知](./event.md)。

## 获取 Channel Metadata

你可以调用 `getChannelMetadata` 方法获得指定频道的全部 Channel Metadata。关于 `getChannelMetadata` 接口的更多信息见 <a href=>Storage API 参考</a>。

以下示例代码展示了如何获得 Channel Metadata：

```java
mRtmClient.getStorage().getChannelMetadata("channel1", RtmChannelType.MESSAGE, new ResultCallback() {
    @Override
    public void onSuccess(Metadata data) {
        log(CALLBACK, "get channel metadata success");
        log(INFO, "metadata major revision: " + data.getMajorRevision());
        for (MetadataItem item : data.getItems()) {
            log(INFO, item.toString());
        }
    }

    @Override
    public void onFailure(ErrorInfo errorInfo) {
        log(ERROR, errorInfo.toString());
    }
});
```

当上述操作成功后，RTM SDK 会返回如下数据结构：

```java
{
    majorRevision: 734874892,
    metadata:{
        {
            key:"Quantity",
            value:"20",
            revision:734874888,
            updateTs:1688978391900,
            authorUserId:"Tony"
        },
        {
            key:"Announcement",
            value:"Welcome to our Shop!",
            revision:734874333,
            updated:1688978391800,
            authorUid:"Tomas"
        },
        {
            key:"T-shirt",
            value:"100",
            revision:734874222,
            updated:168897839100,
            authorUid:"Adam"
        }
    }
}
```

## 更新 Channel Metadata

你可以使用 `updateChannelMetadata` 来更新更新频道中已存在的 Metadata Item。如果该 Metadata Item 不存在，则会返回错误。该接口可用于如下需要权限控制的业务场景：
- 在电商拍卖的场景中，只有管理员或者商品的拥有者才具备上架新商品和设置新属性的权限，而竞拍者只有修改价格属性（竞价）的权限。
- 在游戏场景中，只有管理员才能设置房间内道具的权限。

以下示例代码展示了如何更新 Metadata Item 值：

```java
Metadata metadata = new Metadata();
metadata.getItems().add(new MetadataItem("T-shirt", "299"));
MetadataOptions options = new MetadataOptions()
options.setRecordTs(true);
options.setRecordUserId(true);

mRtmClient.getStorage().updateChannelMetadata("channel1", RtmChannelType.MESSAGE, metadata, options, "", new ResultCallback() {
    @Override
    public void onSuccess(Void responseInfo) {
        log(CALLBACK, "update channel metadata success");
    }

    @Override
    public void onFailure(ErrorInfo errorInfo) {
        log(ERROR, errorInfo.toString());
    }
});
```

上述示例代码将 Metadata Item `price` 中 `T-shirt` 对应的值更新为 `299`，即把 T 恤的价格更改为 299。

当调用成功后，RTM SDK 会返回如下数据结构：

```java
@Override
public void onSuccess(Void responseInfo) {
    log(CALLBACK, "update channel metadata success");
}
```

同时，RTM 还会触发一个 `UPDATE` 类型的 `onStorageEvent` 事件通知，并在 100ms 内通知到频道中的其他人。`onStorageEvent` 详见[事件通知](event)。

## 删除 Channel Metadata

如果你不再需要 Channel Metadata 或者某几个 Metadata Item，你可以参考以下示例代码使用 `removeChannelMetadata` 进行删除操作：

```java
Metadata metadata = new Metadata();
MetadataItem announcement = new MetadataItem();
announcement.setKey("Announcement");
metadata.getItems().add(announcement);

mRtmClient.getStorage().removeChannelMetadata("channel1", RtmChannelType.MESSAGE, metadata, new MetadataOptions(false, false), "", new ResultCallback() {
    @Override
    public void onSuccess(Void responseInfo) {
        log(CALLBACK, "remove channel metadata success");
    }

    @Override
    public void onFailure(ErrorInfo errorInfo) {
        log(ERROR, errorInfo.toString());
    }
});
```

上述示例代码中，通过 Metadata Item `announcement` 中的 `key` 删除对应的元数据，其 `value` 设为任何数值都不影响输出操作。

如果你不填充任何 `MetadataItem`，则会删除该频道中整组 Channel Metadata，示例代码如下：

```java
Metadata metadata = new Metadata();
mRtmClient.getStorage().removeChannelMetadata("channel1", RtmChannelType.MESSAGE, metadata, new MetadataOptions(true, true), "", new ResultCallback() {
    @Override
    public void onSuccess(Void responseInfo) {
        log(CALLBACK, "remove channel metadata success");
    }

    @Override
    public void onFailure(ErrorInfo errorInfo) {
        log(ERROR, errorInfo.toString());
    }
});
```

通常在销毁频道的过程中你会需要删除整组 Channel Metadata。Channel Metadata 数据一旦被删除将无法恢复，如果你对数据具有恢复的需求，那么你需要在删除 Channel Metadata 之前做好数据备份。

同时，RTM 还会触发一个 `UPDATE` 类型的 `onStorageEvent` 事件通知，并在 100ms 内通知到频道中的其他人，详见[事件通知](./event.md)。

## CAS 控制

Channel Metadata 同时也引进了版本控制逻辑 CAS（Compare And Set），该方法提供两种独立的版本控制字段，你可以根据实际业务场景设置任意一种或多种：

- 通过 `Metadata` 中的 `majorRevision` 属性开启整组 Channel Metadata 的版本号校验。
- 通过 `MetadataItem` 中的 `revision` 属性开启某个 Metadata Item 的版本号校验。

设置 Channel Metadata 或频道 Metadata Item 时，配合版本属性可以控制本次调用是否开启版本号校验，逻辑如下：
- 版本属性默认为 `-1` ，本次调用不开启 CAS 验证。如果 Channel Metadata 或频道 Metadata Item 已存在，则该值会被最新值覆盖；如果 Channel Metadata 或频道 Metadata Item 不存在，则 SDK 会创建该值。
- 版本属性为正整数时，本次调用开启 CAS 验证。如果 Channel Metadata 或频道 Metadata Item 已存在，则 SDK 会在版本号验证成功后更新对应的值；否则 SDK 会返回错误码。

你可以在以下场景中应用 CAS 控制：
- 在竞拍场景中，多人同时对一件商品竞拍时，最先出价者操作成功，而其余人返回错误，同时也能获得最新价格信息。
- 在抢红包场景中，红包被第一个人抢到且只会被占有一次，而其余人返回错误。

以下示例代码展示了如何使用 `majorRevision` 和 `revision` 更新 Channel Metadata 和 Metadata Item：

```java
Metadata metadata = new Metadata();
metadata.setMajorRevision(734874892);
metadata.getItems().add(new MetadataItem("Quantity", "30", 734874888));
metadata.getItems().add(new MetadataItem("Announcement", "Welcome to our shop!"));
metadata.getItems().add(new MetadataItem("T-shirt", "101", 734874222));
MetadataOptions options = new MetadataOptions()
options.setRecordTs(true);
options.setRecordUserId(true);

mRtmClient.getStorage().updateChannelMetadata("channel1", RtmChannelType.MESSAGE, metadata, options, "", new ResultCallback() {
    @Override
    public void onSuccess(Void responseInfo) {
        log(CALLBACK, "update channel metadata success");
    }

    @Override
    public void onFailure(ErrorInfo errorInfo) {
        log(ERROR, errorInfo.toString());
    }
});
```

上述例子中，我们对 Channel Metadata 和 Metadata Item `properties` 和 `price` 开启 CAS 验证并设置 `majorRevision` 为 `734874892`。服务器在接收到接口调用请求后，会首先验证接口调用提供的 `majorRevision` 与数据库最新值是否匹配，如果不匹配，则返回错误；如果匹配，则继续验证 Metadata Item 的 `revision`，逻辑与验证 Channel Metadata 相同。

如果你开启了版本控制能力，那么你需要关注 `onStorageEvent` 事件通知以获取 `majorRevision` 和 `revision` 更新后的值，以便于在接口调用时提供最新值。

## Lock 的使用

Lock 为用户提供了对临界资源互斥访问的能力，你可以解决用户在访问共享资源时的竞争问题。例如，在频道中特定时间只能允许一位管理员存在，且只有管理员才能对 Channel Metadata 进行设置、删除和修改等操作。

相比于 CAS 对于 Channel Metadata 数据版本的控制能力，Lock 为你提供了更为上层的控制能力，它直接决定了你是否具备调用 `setChannelMetadata`、`updateChannelMetadata`、`removeChannelMetadata` 三个接口的权限。如果你不是 Lock 的拥有者，则无法通过调用上述三个接口对 Channel Metadata 进行设置和修改。

以下代码展示了如何使用 Lock 来更新 Channel Metadata：

```java
Metadata metadata = new Metadata();
metadata.getItems().add(new MetadataItem("Quantity", "40"));
metadata.getItems().add(new MetadataItem("Announcement", "Welcome to our Shop!"));
metadata.getItems().add(new MetadataItem("T-shirt", "300"));
MetadataOptions options = new MetadataOptions()
options.setRecordTs(true);
options.setRecordUserId(true);

String lockName = "manage";
mRtmClient.getStorage().updateChannelMetadata("channel1", RtmChannelType.MESSAGE, metadata, options, lockName, new ResultCallback() {
    @Override
    public void onSuccess(Void responseInfo) {
        log(CALLBACK, "update channel metadata success");
    }

    @Override
    public void onFailure(ErrorInfo errorInfo) {
        log(ERROR, errorInfo.toString());
    }
});
```

上述示例代码的前提条件之一是调用 `updateChannelMetadata` 的用户必须是锁 `manage` 的拥有者，否则会返回错误。
