---
title: "Store user metadata"
description: "Use metadata to enhance user features in Signaling clients."
---

The Signaling storage service enables you to store and share contextual user data in your app, such as name, date-of-birth, avatar, and connections. When user metadata is set, updated, or deleted, the SDK triggers a storage event notification. Other users in the channel receive this notification within 100ms and use the information according to your business logic. 

## Understand the tech

Use metadata enables you to store and share user level information. A set of user metadata facilitates business-level data storage and real-time notifications. Each user has only one set of user metadata, but each set may contain multiple metadata items. For relevant restrictions, refer to the [API usage restrictions](../../../reference/limitations.md). Each metadata item has `key`, `value`, and `revision` properties.

User metadata is stored permanently in the Signaling database. The data persists even after a user logs out. You must explicitly delete it to remove it from the database. This feature impacts your storage billing. Refer to [Pricing](../../../reference/pricing.md) for details.

## Prerequisites

Ensure that you have:

- Integrated the Signaling SDK in your project .
- Implemented the framework functionality from the [SDK quickstart](../../../index.mdx) page.
- Enabled storage in [Storage configuration](../../../manage-agora-account.md).

## Implement user metadata storage

The section shows you to implement user metadata storage in your Signaling app.

### Set user metadata

To create a new metadata item for the user, or to update the `value` of am existing item, call `setUserMetadata`. This method creates a new item in the user metadata if the specified `key` does not exist, or overwrites the associated `value` if a metadata item with the specified `key` already exists. 

The following example saves a set of metadata items for a specified user. It configures the `options` parameter to add timestamp and modifier information to each metadata item.

<CodeBlockTabs defaultValue="java">
<CodeBlockTabsList>
 <CodeBlockTabsTrigger value="java">Java</CodeBlockTabsTrigger>
 <CodeBlockTabsTrigger value="kotlin">Kotlin</CodeBlockTabsTrigger>
</CodeBlockTabsList>

<CodeBlockTab value="java">

```java
Metadata metadata = new Metadata();
metadata.getItems().add(new MetadataItem("Name", "Tony"));
metadata.getItems().add(new MetadataItem("Age", "40"));
metadata.getItems().add(new MetadataItem("Avatar", "https://your-domain/avatar/tony.png"));

MetadataOptions options = new MetadataOptions();
options.setRecordTs(true);
options.setRecordUserId(true);

mRtmClient.getStorage().setUserMetadata("Tony", metadata, options, new ResultCallback<Void>() {
    @Override
    public void onSuccess(Void responseInfo) {
        log(CALLBACK, "Set user metadata success");
    }

    @Override
    public void onFailure(ErrorInfo errorInfo) {
        log(ERROR, "Failed to set user metadata: " + errorInfo.toString());
    }
});
```
</CodeBlockTab>

<CodeBlockTab value="kotlin">

```kotlin
val metadata = Metadata().apply {
    items.add(MetadataItem("Name", "Tony"))
    items.add(MetadataItem("Age", "40"))
    items.add(MetadataItem("Avatar", "https://your-domain/avatar/tony.png"))
}

val options = MetadataOptions().apply {
    setRecordTs(true)
    setRecordUserId(true)
}

mRtmClient.getStorage().setUserMetadata("Tony", metadata, options, object : ResultCallback<Void> {
    override fun onSuccess(responseInfo: Void) {
        log(CALLBACK, "Set user metadata success")
    }

    override fun onFailure(errorInfo: ErrorInfo) {
        log(ERROR, "Failed to set user metadata: " + errorInfo.toString())
    }
})
```
</CodeBlockTab>

</CodeBlockTabs>

The `onSuccess` callback notifies you of the successful completion of the storage operation. Additionally, Signaling triggers an `onStorageEvent` notification of event type `UPDATE` within 100 ms to inform all users who have subscribed to the this user's metadata. 

### Get user metadata

To retrieve all metadata items associated with a specific user, call `getUserMetadata`. Refer to the following example:

<CodeBlockTabs defaultValue="java">
<CodeBlockTabsList>
 <CodeBlockTabsTrigger value="java">Java</CodeBlockTabsTrigger>
 <CodeBlockTabsTrigger value="kotlin">Kotlin</CodeBlockTabsTrigger>
</CodeBlockTabsList>

<CodeBlockTab value="java">

```java
mRtmClient.getStorage().getUserMetadata("Tony", new ResultCallback<Metadata>() {
    @Override
    public void onSuccess(Metadata data) {
        log(CALLBACK, "Get user metadata success");
        log(INFO, "Major revision: " + data.getMajorRevision());
        for (MetadataItem item : data.getItems()) {
            log(INFO, item.toString());
        }
    }

    @Override
    public void onFailure(ErrorInfo errorInfo) {
        log(ERROR, "Failed to get user metadata: " + errorInfo.toString());
    }
});
```
</CodeBlockTab>

<CodeBlockTab value="kotlin">

```kotlin
mRtmClient.getStorage().getUserMetadata("Tony", object : ResultCallback<Metadata> {
    override fun onSuccess(data: Metadata) {
        log(CALLBACK, "Get user metadata success")
        log(INFO, "Major revision: " + data.majorRevision)
        data.items.forEach { item ->
            log(INFO, item.toString())
        }
    }

    override fun onFailure(errorInfo: ErrorInfo) {
        log(ERROR, "Failed to get user metadata: " + errorInfo.toString())
    }
})
```
</CodeBlockTab>

</CodeBlockTabs>

You can also leave the `userId` parameter blank to get the local user's metadata:

<CodeBlockTabs defaultValue="java">
<CodeBlockTabsList>
 <CodeBlockTabsTrigger value="java">Java</CodeBlockTabsTrigger>
 <CodeBlockTabsTrigger value="kotlin">Kotlin</CodeBlockTabsTrigger>
</CodeBlockTabsList>

<CodeBlockTab value="java">

```java
mRtmClient.getStorage().getUserMetadata("", new ResultCallback<Metadata>() {
    @Override
    public void onSuccess(Metadata data) {
        log(CALLBACK, "Get user metadata success");
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
mRtmClient.getStorage().getUserMetadata("", object : ResultCallback<Metadata> {
    override fun onSuccess(data: Metadata) {
        log(CALLBACK, "Get user metadata success")
    }

    override fun onFailure(errorInfo: ErrorInfo) {
        log(ERROR, errorInfo.toString())
    }
})
```
</CodeBlockTab>

</CodeBlockTabs>

Signaling SDK returns the following data structure:

```json
{
    majorRevision: 734874892,
    metadata:{
        {
            key:"Name",
            value:"Tony",
            revision:734874872,
            updateTs:1688978391900,
            authorUid:"Tony"
        },
        {
            key:"Age",
            value:"40",
            revision:734874862,
            updated:1688978390900,
            authorUid:"Tony"
        },
        {
            key:"Avatar",
            value:"https://your-domain/avatar/tony.png",
            revision:734874812,
            updated:1688978382900,
            authorUid:"Tony"
        }
    }
}
```

### Update user metadata

To modify existing metadata items, call `updateUserMetadata`. If the metadata item does not exist, the SDK returns an error. This method is useful for business use-cases that require permission control on creating new metadata items. For example, the admin defines the user metadata fields and users may only update the values.

The following example updates the value of an existing metadata item:

<CodeBlockTabs defaultValue="java">
<CodeBlockTabsList>
 <CodeBlockTabsTrigger value="java">Java</CodeBlockTabsTrigger>
 <CodeBlockTabsTrigger value="kotlin">Kotlin</CodeBlockTabsTrigger>
</CodeBlockTabsList>

<CodeBlockTab value="java">

```java
Metadata metadata = new Metadata();
metadata.getItems().add(new MetadataItem("Age", "45"));

mRtmClient.getStorage().updateUserMetadata("Tony", metadata, new MetadataOptions(true, true), new ResultCallback<Void>() {
    @Override
    public void onSuccess(Void responseInfo) {
        log(CALLBACK, "update user metadata success");
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
val metadata = Metadata().apply {
    items.add(MetadataItem("Age", "45"))
}

mRtmClient.getStorage().updateUserMetadata("Tony", metadata, MetadataOptions(true, true), object : ResultCallback<Void> {
    override fun onSuccess(responseInfo: Void?) {
        log(CALLBACK, "update user metadata success")
    }

    override fun onFailure(errorInfo: ErrorInfo) {
        log(ERROR, errorInfo.toString())
    }
})
```
</CodeBlockTab>

</CodeBlockTabs>

The `onSuccess` callback notifies you of the successful completion of the storage operation. Additionally, Signaling triggers an `onStorageEvent` notification of event type `UPDATE` within 100 ms to inform all users who have subscribed to the this user's metadata. 

### Delete user metadata

To delete metadata items that are no longer required, call `removeUserMetadata`. Refer to the following sample code:

<CodeBlockTabs defaultValue="java">
<CodeBlockTabsList>
 <CodeBlockTabsTrigger value="java">Java</CodeBlockTabsTrigger>
 <CodeBlockTabsTrigger value="kotlin">Kotlin</CodeBlockTabsTrigger>
</CodeBlockTabsList>

<CodeBlockTab value="java">

```java
Metadata metadata = new Metadata();
MetadataItem age = new MetadataItem();
age.setKey("Age");
metadata.getItems().add(age);

mRtmClient.getStorage().removeUserMetadata("Tony", metadata, new MetadataOptions(true, true), new ResultCallback<Void>() {
    @Override
    public void onSuccess(Void responseInfo) {
        log(CALLBACK, "remove user metadata success");
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
val metadata = Metadata().apply {
    val age = MetadataItem().apply { key = "Age" }
    items.add(age)
}

mRtmClient.getStorage().removeUserMetadata("Tony", metadata, MetadataOptions(true, true), object : ResultCallback<Void> {
    override fun onSuccess(responseInfo: Void?) {
        log(CALLBACK, "remove user metadata success")
    }

    override fun onFailure(errorInfo: ErrorInfo) {
        log(ERROR, errorInfo.toString())
    }
})
```
</CodeBlockTab>

</CodeBlockTabs>

Setting the `value` for a metadata item that is being deleted has no effect.

The `onSuccess` callback notifies you of the successful completion of the storage operation. Additionally, Signaling triggers an `onStorageEvent` notification of event type `UPDATE` within 100 ms to inform all users who have subscribed to the this user's metadata. 

To delete the entire set of metadata for a user, do not add any metadata items when calling `removeUserMetadata`. Refer to the following sample code:

<CodeBlockTabs defaultValue="java">
<CodeBlockTabsList>
 <CodeBlockTabsTrigger value="java">Java</CodeBlockTabsTrigger>
 <CodeBlockTabsTrigger value="kotlin">Kotlin</CodeBlockTabsTrigger>
</CodeBlockTabsList>

<CodeBlockTab value="java">

```java
Metadata metadata = new Metadata();

mRtmClient.getStorage().removeUserMetadata("Tony", metadata, null, new ResultCallback<Void>() {
    @Override
    public void onSuccess(Void responseInfo) {
        log(CALLBACK, "remove user metadata success");
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
val metadata = Metadata()

mRtmClient.getStorage().removeUserMetadata("Tony", metadata, null, object : ResultCallback<Void> {
    override fun onSuccess(responseInfo: Void?) {
        log(CALLBACK, "remove user metadata success")
    }

    override fun onFailure(errorInfo: ErrorInfo) {
        log(ERROR, errorInfo.toString())
    }
})
```
</CodeBlockTab>

</CodeBlockTabs>

:::info
When terminating a user account, it is common to delete the entire set of user's metadata. Once user metadata is deleted, it cannot be recovered. If you need data restoration, back up the metadata before deleting it.

:::

## Receive storage event notifications

A storage event notification returns the [StorageEvent](https://docs.agora.io/en/signaling/reference/api) data structure, which includes the [RtmStorageEventType](https://docs.agora.io/en/signaling/reference/api) parameter.

To receive storage event notifications, implement an event listener. See [event listeners](https://docs.agora.io/en/signaling/reference/api) for details. You only receive user metadata update notifications for users that you have subscribed to. 

#### Event notification mode

Currently, Signaling only supports the full data update mode. This means that when a user's metadata is updated, the `data` field in the event notification contains all the metadata of the user.

### Subscribe to a user's metadata

To monitor updates to a user's metadata, you subscribe to their metadata. Refer to the following sample code:

<CodeBlockTabs defaultValue="java">
<CodeBlockTabsList>
 <CodeBlockTabsTrigger value="java">Java</CodeBlockTabsTrigger>
 <CodeBlockTabsTrigger value="kotlin">Kotlin</CodeBlockTabsTrigger>
</CodeBlockTabsList>

<CodeBlockTab value="java">

```java
mRtmClient.getStorage().subscribeUserMetadata("Tony", new ResultCallback<Void>() {
    @Override
    public void onSuccess(Void responseInfo) {
        log(CALLBACK, "subscribe user metadata success");
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
mRtmClient.getStorage().subscribeUserMetadata("Tony", object : ResultCallback<Void> {
    override fun onSuccess(responseInfo: Void?) {
        log(CALLBACK, "subscribe user metadata success")
    }

    override fun onFailure(errorInfo: ErrorInfo) {
        log(ERROR, errorInfo.toString())
    }
})
```
</CodeBlockTab>

</CodeBlockTabs>

When there are changes in the user metadata, Signaling triggers an `onStorageEvent` notification of event type `UPDATE` within 100 ms to inform all users who have subscribed to this user's metadata. 

### Unsubscribe from a user's metadata

When you no longer need to receive notifications about a user's metadata updates, unsubscribe from the users's metadata. Refer to the following sample code:

<CodeBlockTabs defaultValue="java">
<CodeBlockTabsList>
 <CodeBlockTabsTrigger value="java">Java</CodeBlockTabsTrigger>
 <CodeBlockTabsTrigger value="kotlin">Kotlin</CodeBlockTabsTrigger>
</CodeBlockTabsList>

<CodeBlockTab value="java">

```java
mRtmClient.getStorage().unsubscribeUserMetadata("Tony", new ResultCallback<Void>() {
    @Override
    public void onSuccess(Void responseInfo) {
        log(CALLBACK, "unsubscribe user metadata success");
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
mRtmClient.getStorage().unsubscribeUserMetadata("Tony", object : ResultCallback<Void> {
    override fun onSuccess(responseInfo: Void?) {
        log(CALLBACK, "unsubscribe user metadata success")
    }

    override fun onFailure(errorInfo: ErrorInfo) {
        log(ERROR, errorInfo.toString())
    }
})
```
</CodeBlockTab>

</CodeBlockTabs>

## Version control

Signaling integrates compare-and-set (CAS) version control to manage metadata updates. CAS is a concurrency control mechanism to ensure that updates to a shared resource occur only if the resource is in an expected state. The mechanism works as follows:

1. The client reads the current version of a data item.
2. Before making an update, the client compares the current version with the last read version number.
3. If the versions match, the client proceeds with the update and increments the version number. If they do not match, the update is aborted.

CAS version control is useful in use-cases that require concurrency management. For instance, consider a dating application where only one user may engage in a chat session with a host. When multiple users attempt to join, only the first request is successful.

The CAS version control feature provides two independent version control parameters. Set one or more of these values according to the needs of your business use-case:

- `majorRevision` parameter in the `setMajorRevision` method: Enable version number verification of the entire set of user metadata.

- `revision` parameter of a `MetadataItem`: Enable version number verification of a single metadata item.

When setting user metadata, or a single user metadata item, use the revision attribute to enable or disable version control as follows:

- To disable CAS verification, use the default value of `-1` for the `revision` parameter. 

- To enable CAS verification, set the `majorRevision` or the `revision` parameter to a positive integer. The SDK updates the corresponding value after successfully verifying the revision number. If the specified revision number does not match the latest revision number in the database, the SDK returns an error.

The following code snippet demonstrates how to employ `majorRevision` and `revision` for updating user metadata and metadata items:

<CodeBlockTabs defaultValue="java">
<CodeBlockTabsList>
 <CodeBlockTabsTrigger value="java">Java</CodeBlockTabsTrigger>
 <CodeBlockTabsTrigger value="kotlin">Kotlin</CodeBlockTabsTrigger>
</CodeBlockTabsList>

<CodeBlockTab value="java">

```java
Metadata metadata = new Metadata();
metadata.setMajorRevision(734874892);
metadata.getItems().add(new MetadataItem("Avatar", "https://your-domain/avatar/tony.png", 734874812));

MetadataOptions options = new MetadataOptions();
options.setRecordTs(true);
options.setRecordUserId(true);
mRtmClient.getStorage().updateUserMetadata("Tony", metadata, options, new ResultCallback<Void>() {
    @Override
    public void onSuccess(Void responseInfo) {
        log(CALLBACK, "update user metadata success");
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
val metadata = Metadata()
metadata.majorRevision = 734874892
metadata.items.add(MetadataItem("Avatar", "https://your-domain/avatar/tony.png", 734874812))

val options = MetadataOptions()
options.recordTs = true
options.recordUserId = true
mRtmClient.getStorage().updateUserMetadata("Tony", metadata, options, object : ResultCallback<Void> {
    override fun onSuccess(responseInfo: Void?) {
        log(CALLBACK, "update user metadata success")
    }

    override fun onFailure(errorInfo: ErrorInfo) {
        log(ERROR, errorInfo.toString())
    }
})
```
</CodeBlockTab>

</CodeBlockTabs>

In this example, CAS verification for user metadata and metadata items is enabled by setting `majorRevision` and `revision` parameters to positive integers. Upon receiving the update call request, Signaling first verifies the provided major revision number against the latest value in the database. If there's a mismatch, it returns an error; if the values match, Signaling verifies the `revision` number for each metadata item using a similar logic.

:::info
When using version control, monitor `onStorageEvent` notifications to retrieve updated values for `majorRevision` and `revision` to ensure that the latest revision values are used for subsequent operations.

:::

## Reference

This section contains content that completes the information on this page, or points you to documentation that explains other aspects to this product.

### API reference

- [`setUserMetaData`](https://docs.agora.io/en/signaling/reference/api)
- [`getUserMetadata​`](https://docs.agora.io/en/signaling/reference/api)
- [`removeUserMetadata​`](https://docs.agora.io/en/signaling/reference/api)
- [`updateUserMetadata​`](https://docs.agora.io/en/signaling/reference/api)
- [`subscribeUserMetadata`](https://docs.agora.io/en/signaling/reference/api)
- [`unsubscribeUserMetadata`](https://docs.agora.io/en/signaling/reference/api)

- [Metadata](https://docs.agora.io/en/signaling/reference/api)

- [Event listeners](https://docs.agora.io/en/signaling/reference/api)
