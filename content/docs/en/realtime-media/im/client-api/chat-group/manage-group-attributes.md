---
title: "Manage chat group attributes"
description: "Introduces how to use the Agora Chat SDK to manage the attributes of a chat group in your app."
---

s enable real-time messaging among multiple users.

This page shows how to use the Chat SDK to manage the attributes of a chat group in your app.

## Understand the tech

### Android

The Chat SDK provides the `Group`, `GroupManager`, and `GroupChangeListener` classes for chat group management, which allows you to implement the following features:

- Modify the chat group name and description
- Manage chat group announcements
- Manage chat group shared files

### iOS

The Chat SDK provides the `IAgoraChatGroupManager`, `AgoraChatGroupManagerDelegate`, and `AgoraChatGroup` classes for chat group management, which allows you to implement the following features:

- Modify the chat group name and description
- Manage chat group announcements
- Manage chat group shared files

### Flutter

The Chat SDK provides the `ChatGroup`, `ChatGroupManager`, and `ChatGroupEventHandler` classes for chat group management, which allows you to implement the following features:

- Update the name and description of a chat group
- Retrieve and update the announcements of a chat group
- Manage the shared files in a chat group
- Update the extension fields of a chat group

### React Native

The Chat SDK provides the `ChatGroup`, `ChatGroupManager`, and `ChatGroupEventListener` classes for chat group management, which allows you to implement the following features:

- Update the name and description of a chat group
- Retrieve and update the announcements of a chat group
- Manage the shared files in a chat group
- Update the extension fields of a chat group

### Windows

The Chat SDK provides the `Group`, `IGroupManager`, and `IGroupManagerDelegate` classes for chat group management, which allows you to implement the following features:

- Update the name and description of a chat group
- Retrieve and update the announcements of a chat group
- Manage the shared files in a chat group
- Update the extension fields of a chat group

### Unity

The Chat SDK provides the `Group`, `IGroupManager`, and `IGroupManagerDelegate` classes for chat group management, which allows you to implement the following features:

- Update the name and description of a chat group
- Retrieve and update the announcements of a chat group
- Manage the shared files in a chat group
- Update the extension fields of a chat group

### Web

The Chat SDK provides the `GroupManager` and `Group` classes for chat group management, which allows you to implement the following features:

- Modify the chat group name and description
- Manage chat group announcements
- Manage chat group shared files

## Prerequisites

Before proceeding, ensure that you meet the following requirements:

- You have initialized the Chat SDK. For details, [SDK quickstart](../../get-started/get-started-sdk).
- You understand the call frequency limits of the Chat APIs supported by different pricing plans as described in [Limitations](../../reference/limitations).
- You understand the number of chat groups and chat group members supported by different pricing plans as described in [Pricing Plan Details](../../reference/pricing-plan-details).

## Implementation

This section describes how to call the APIs provided by the Chat SDK to implement chat group features.

### Android

### Modify the chat group name and description

The chat group owner and chat group admins can modify the name and description of the chat group.

Refer to the following sample code to modify the chat group name and description: 

```java
// The chat group owner and chat group admins can call changeGroupName to modify the name of the chat group. The name length can be up to 128 characters.
ChatClient.getInstance().groupManager().changeGroupName(groupId,changedGroupName);

// The chat group owner and chat group admins can call changeGroupDescription to modify the description of the chat group. The description length can be up to 512 characters. 
ChatClient.getInstance().groupManager().changeGroupDescription(groupId,description);
```

### Manage chat group announcements

The chat group owner and chat group admins can set and update chat group announcements. Once the announcements are updated, all chat group members receive the onAnnouncementChanged callback. All chat group members can retrieve chat group announcements.

Refer to the following sample code to manage chat group announcements:

```java
// The chat group owner and chat group admins can call updateGroupAnnouncement to set or update the chat group announcements. The announcement length can be up to 512 characters.
ChatClient.getInstance().groupManager().updateGroupAnnouncement(groupId, announcement);

// All chat group members can call fetchGroupAnnouncement to retrieve the chat group announcements.
ChatClient.getInstance().groupManager().fetchGroupAnnouncement(groupId);
```

### Manage chat group shared files

All chat group members can upload or download group shared files. The chat group owner and chat group admins can delete all of the group shared files, whereas group members can only delete the shared files that they have personally uploaded.

Refer to the following sample code to manage chat group shared files:

```java
// All chat group members can call uploadGroupSharedFile to upload group shared files. The file size can be up to 10 MB.
// Once shared files are uploaded, group members receive the onSharedFileAdded callback.
ChatClient.getInstance().groupManager().uploadGroupSharedFile(groupId, filePath, callBack);
// All chat group members can call asyncDownloadGroupSharedFile to download group shared files.
ChatClient.getInstance().groupManager().asyncDownloadGroupSharedFile(groupId, fileId, savePath, callBack);

// All chat group members can call deleteGroupSharedFile to delete group shared files.
// Once shared files are deleted, chat group members receive the onSharedFileDeleted callback.
ChatClient.getInstance().groupManager().deleteGroupSharedFile(groupId, fileId);

// All chat group members can call fetchGroupSharedFileList to retrieve the list of shared files in the chat group.
ChatClient.getInstance().groupManager().fetchGroupSharedFileList(groupId, pageNum, pageSize);
```

### Listen for chat group events

For details, see [Chat Group Events](./manage-chat-groups#listen-for-chat-group-events).

### iOS

### Modify the chat group name and description

The chat group owner and chat group admins can modify the name and description of the chat group.

Refer to the following sample code to modify the chat group name and description:

```objc
// The chat group owner and chat group admins can call changeGroupSubject to modify the name of the chat group. The name length can be up to 128 characters.
[[AgoraChatClient sharedClient].groupManager changeGroupSubject:@"subject"
 																											 forGroup:@"groupID" 
 																												  error:nil];

// The chat group owner and chat group admins can call changeDescription to modify the description of the chat group. The description length can be up to 512 characters.
[[AgoraChatClient sharedClient].groupManager changeDescription:@"desc"
 																											forGroup:@"groupID" 
 																										 	   error:nil];
```

### Manage chat group announcements

The chat group owner and chat group admins can set and update chat group announcements. Once the announcements are updated, all chat group members receive the `groupAnnouncementDidUpdate` callback. All chat group members can retrieve chat group announcements.

Refer to the following sample code to manage chat group announcements:

```objc
// The chat group owner and chat group admins can call updateGroupAnnouncementWithId to set or update the chat group announcements. The announcement length can be up to 512 characters.
[[AgoraChatClient sharedClient].groupManager updateGroupAnnouncementWithId:@"groupID"
 																														 announcement:@"announcement" 
 																										 	   					  error:nil];

// All chat group members can call getGroupAnnouncementWithId to retrieve the chat group announcements.
[[AgoraChatClient sharedClient].groupManager getGroupAnnouncementWithId:@"groupID" 
 																																  error:nil];
```

### Manage chat group shared files

All chat group members can upload or download group shared files. The chat group owner and chat group admins can delete all of the group shared files, whereas group members can only delete the shared files that they have personally uploaded.

Refer to the following sample code to manage chat group shared files:

```objc
// All chat group members can call uploadGroupSharedFileWithId to upload group shared files. The file size can be up to 10 MB.
// Once shared files are uploaded, group members receive the groupFileListDidUpdate callback.
[[AgoraChatClient sharedClient].groupManager uploadGroupSharedFileWithId:@"groupID"
 																																filePath:@"filePath" 
 																															  progress:nil 
 																															completion:nil];

// All chat group members can call downloadGroupSharedFileWithId to download group shared files.
[AgoraChatClient.sharedClient.groupManager downloadGroupSharedFileWithId:@"groupId" filePath:@"filePath" sharedFileId:@"fileId" progress:nil completion:^(AgoraChatGroup * _Nullable aGroup, AgoraChatError * _Nullable aError) {
            
    }];	

// All chat group members can call removeGroupSharedFileWithId to delete group shared files.
// Once shared files are deleted, chat group members receive the groupFileListDidUpdate callback.
[[AgoraChatClient sharedClient].groupManager removeGroupSharedFileWithId:@"groupID"
 																													  sharedFileId:@"fileID" 
 																															     error:nil];

// All chat group members can call getGroupFileListWithId to retrieve the list of shared files in the chat group.
[[AgoraChatClient sharedClient].groupManager getGroupFileListWithId:@"groupID"
 																												 pageNumber:pageNumber 
 																												   pageSize:pageSize 
 																														  error:nil];
```

### Listen for chat group events

For details, see [Chat Group Events](./manage-chat-groups#listen-for-chat-group-events)

### Flutter

### Update the chat group name

The chat group owner and admins can call `changeGroupName` to set and update the chat group name. The maximum length of a chat group name is 128 characters.

The following code sample shows how to update the chat group name:

```dart
try {
  await ChatClient.getInstance.groupManager.changeGroupName(
    groupId,
    newName,
  );
} on ChatError catch (e) {
}
```

### Update the chat group description

The chat group owner and admins can call `changeGroupDescription` to set and update the chat group description. The maximum length of a chat group description is 512 characters.

The following code sample shows how to update the chat group description:

```dart
try {
  await ChatClient.getInstance.groupManager.changeGroupDescription(
    groupId,
    newDesc,
  );
} on ChatError catch (e) {
}
```

### Update the chat group announcements

Only the chat group owner and admins can call `updateGroupAnnouncement` to set and update the announcements. Once the chat group announcements are updated, all the other chat group members receive the `ChatGroupEventHandler#OnAnnouncementChangedFromGroup` callback. The maximum total length of chat group announcements is 512 characters.

The following code sample shows how to update the chat group announcements:

```dart
try {
  await ChatClient.getInstance.groupManager.updateGroupAnnouncement(
    groupId,
    newAnnouncement,
  );
} on ChatError catch (e) {
}
```

### Retrieve the chat group announcements

All chat group members can call `fetchAnnouncementFromServer` to retrieve the chat group announcements from the server.

The following code sample shows how to retrieve the chat group announcements:

```dart
try {
  String? announcement =
      await ChatClient.getInstance.groupManager.fetchAnnouncementFromServer(
    groupId,
  );
} on ChatError catch (e) {
}
```

### Manage the chat group shared files

#### Upload chat group shared files

All chat group members can call `uploadGroupSharedFile` to upload shared files to a chat group. The maximum file size is 10 MB. Once a shared file is uploaded, all the other chat group members receive the `ChatGroupEventHandler#onSharedFileAddedFromGroup` callback.

The following code sample shows how to upload chat group shared files:

```dart
try {
  await ChatClient.getInstance.groupManager.uploadGroupSharedFile(
    groupId,
    filePath,
  );
} on ChatError catch (e) {
}
```

#### Download chat group shared files

All chat group members can call `downloadGroupSharedFile` to download shared files in a chat group.

```dart
try {
  List list =
      await ChatClient.getInstance.groupManager.fetchGroupFileListFromServer(
    groupId,
    pageNum: 1,
    pageSize: 10,
  );

  if (list.isNotEmpty) {
    await ChatClient.getInstance.groupManager.downloadGroupSharedFile(
      groupId: groupId,
      fileId: list.first.fileId!,
      savePath: savePath,
    );
  }
} on ChatError catch (e) {
  debugPrint('$e');
}
```

#### Delete chat group shared files

All chat group members can call `removeGroupSharedFile` to delete shared files in a chat group. Once a shared file is deleted, all the other chat group members receive the `ChatGroupEventHandler#onSharedFileDeletedFromGroup` callback. The chat group owner and chat group admins can delete all of the shared files, whereas chat group members can only delete the shared files that they have personally uploaded.

The following code sample shows how to delete chat group shared files:

```dart
try {
  await ChatClient.getInstance.groupManager.removeGroupSharedFile(
    groupId,
    fileId,
  );
} on ChatError catch (e) {
}
```

#### Retrieve the shared file list

All chat group members can call `fetchGroupFileListFromServer` to retrieve the list of shared files in a chat group from the server.

The following code sample shows how to retrieve the list of shared files in a chat group:

```dart
try {
  List list =
      await ChatClient.getInstance.groupManager.fetchGroupFileListFromServer(
    groupId,
    pageNum: pageNum,
    pageSize: pageSize,
  );
} on ChatError catch (e) {
}
```

### Update the chat group extension fields

Only the chat group owner and admins can call `updateGroupExtension` to update the extension fields of a chat group. The extension fields enable users to perform customized operations on a chat group. The maximum length of each extension field is 8 KB, and it must be in the JSON format.

The following code sample shows how to update the chat group extension fields:

```dart
try {
  await ChatClient.getInstance.groupManager.updateGroupExtension(
    groupId,
    extension,
  );
} on ChatError catch (e) {
}
```

### Listen for chat group events

For details, see [Chat Group Events](./manage-chat-groups#listen-for-chat-group-events).

### React Native

### Update the chat group name

The chat group owner and admins can call `changeGroupName` to set and update the chat group name. The maximum length of a chat group name is 128 characters.

The following code sample shows how to update the chat group name:

```typescript
ChatClient.getInstance()
  .groupManager.changeGroupName(groupId, local_name)
  .then(() => {
    console.log("update group name success.");
  })
  .catch((reason) => {
    console.log("update group name fail.", reason);
  });
```

### Update the chat group description

The chat group owner and admins can call `changeGroupDescription` to set and update the chat group description. The maximum length of a chat group description is 512 characters.

The following code sample shows how to update the chat group description:

```typescript
ChatClient.getInstance()
  .groupManager.changeGroupDescription(groupId, desc)
  .then(() => {
    console.log("update group description success.");
  })
  .catch((reason) => {
    console.log("update group description fail.", reason);
  });
```

### Update the chat group announcements

Only the chat group owner and admins can call `updateGroupAnnouncement` to set and update the announcements. Once the chat group announcements are updated, all the other chat group members receive the `IGroupManagerDelegate#onAnnouncementChanged` callback. The maximum total length of chat group announcements is 512 characters.

The following code sample shows how to update the chat group announcements:

```typescript
ChatClient.getInstance()
  .groupManager.updateGroupAnnouncement(groupId, announcement)
  .then(() => {
    console.log("update ann success.");
  })
  .catch((reason) => {
    console.log("update ann fail.", reason);
  });
```

### Retrieve the chat group announcements

All chat group members can call `fetchAnnouncementFromServer` to retrieve the chat group announcements from the server.

The following code sample shows how to retrieve the chat group announcements:

```typescript
ChatClient.getInstance()
  .groupManager.fetchAnnouncementFromServer(groupId)
  .then((ann) => {
    console.log("get ann success.", ann);
  })
  .catch((reason) => {
    console.log("get ann fail.", reason);
  });
```

### Manage the chat group shared files

#### Upload chat group shared files

All chat group members can call `uploadGroupSharedFile` to upload shared files to a chat group. The maximum file size is 10 MB. Once a shared file is uploaded, all the other chat group members receive the `ChatGroupEventListener#onSharedFileAdded` callback.

The following code sample shows how to upload chat group shared files:

```typescript
// Set the file status callback. This callback is triggered to notify the upload and download progress, and the success and failure state of operations on shared files.
const callback = new (class implements ChatGroupFileStatusCallback {
  that: any;
  constructor(t: any) {
    this.that = t;
  }
  onProgress(groupId: string, filePath: string, progress: number): void {
    console.log(`onProgress: `, groupId, filePath, progress);
  }
  onError(groupId: string, filePath: string, error: ChatError): void {
    console.log(`onError: `, groupId, filePath, error);
  }
  onSuccess(groupId: string, filePath: string): void {
    console.log(`onSuccess: `, groupId, filePath);
  }
})(this);
ChatClient.getInstance()
  .groupManager.uploadGroupSharedFile(groupId, filePath, callback)
  .then(() => {
    console.log("upload file success.");
  })
  .catch((reason) => {
    console.log("upload file fail.", reason);
  });
```

#### Delete chat group shared files

All chat group members can call `removeGroupSharedFile` to delete shared files in a chat group. Once a shared file is deleted, all the other chat group members receive the `ChatGroupEventListener#onSharedFileDeleted` callback. The chat group owner and chat group admins can delete all of the shared files, whereas chat group members can only delete the shared files that they have personally uploaded.

The following code sample shows how to delete chat group shared files:

```typescript
ChatClient.getInstance()
  .groupManager.removeGroupSharedFile(groupId, fileId)
  .then(() => {
    console.log("remove file success.");
  })
  .catch((reason) => {
    console.log("remove file fail.", reason);
  });
```

#### Retrieve the shared file list

All chat group members can call `fetchGroupFileListFromServer` to retrieve the list of shared files in a chat group from the server.

The following code sample shows how to retrieve the list of shared files in a chat group:

```typescript
// Retrieve the shared files with pagination.
ChatClient.getInstance()
  .groupManager.fetchGroupFileListFromServer(groupId, pageSize, pageNum)
  .then(() => {
    console.log("get file success.");
  })
  .catch((reason) => {
    console.log("get file fail.", reason);
  });
```

### Update the chat group extension fields

Only the chat group owner and admins can call `updateGroupExtension` to update the extension fields of a chat group. The extension fields enable users to perform customized operations on a chat group. The maximum length of each extension field is 8 KB, and it must be in the JSON format.

The following code sample shows how to update the chat group extension fields:

```typescript
// Set the extension fields.
const extension = { key: "value" };
ChatClient.getInstance()
  .groupManager.updateGroupExtension(groupId, JSON.stringify(extension))
  .then(() => {
    console.log("update success.");
  })
  .catch((reason) => {
    console.log("update fail.", reason);
  });
```

### Listen for chat group events

For details, see [Chat Group Events](./manage-chat-groups#listen-for-chat-group-events).

### Windows

### Update the chat group name

The chat group owner and admins can call `ChangeGroupName` to set and update the chat group name. The maximum length of a chat group name is 128 characters.

The following code sample shows how to update the chat group name:

```csharp
SDKClient.Instance.GroupManager.ChangeGroupName(groupId, groupName, new CallBack(
  onSuccess: () =>
  {
  },
  onError: (code, desc) =>
  {
  }
));
```

### Update the chat group description

The chat group owner and admins can call `ChangeGroupDescription` to set and update the chat group description. The maximum length of a chat group description is 512 characters.

The following code sample shows how to update the chat group description:

```csharp
SDKClient.Instance.GroupManager.ChangeGroupDescription(groupId, description, new CallBack(
  onSuccess: () =>
  {
  },
  onError: (code, desc) =>
  {
  }
));
```

### Update the chat group announcements

Only the chat group owner and admins can call `UpdateGroupAnnouncement` to set and update the announcements. Once the chat group announcements are updated, all the other chat group members receive the `IGroupManagerDelegate#OnAnnouncementChangedFromGroup` callback. The maximum total length of chat group announcements is 512 characters.

The following code sample shows how to update the chat group announcements:

```csharp
SDKClient.Instance.GroupManager.UpdateGroupAnnouncement(groupId, announcement, new CallBack(
  onSuccess: () =>
  {
  },
  onError: (code, desc) =>
  {
  }
));
       
```

### Retrieve the chat group announcements

All chat group members can call `GetGroupAnnouncementFromServer` to retrieve the chat group announcements from the server.

The following code sample shows how to retrieve the chat group announcements:

```csharp
SDKClient.Instance.GroupManager.GetGroupAnnouncementFromServer(currentGroupId, new ValueCallBack(
  onSuccess: (str) =>
  {
  },
  onError: (code, desc) =>
  {
  }
));    
```

### Manage the chat group shared files

#### Upload chat group shared files

All chat group members can call `UploadGroupSharedFile` to upload shared files to a chat group. The maximum file size is 10 MB. Once a shared file is uploaded, all the other chat group members receive the `IGroupManagerDelegate#OnSharedFileAddedFromGroup` callback.

The following code sample shows how to upload chat group shared files:

```csharp
SDKClient.Instance.GroupManager.UploadGroupSharedFile(groupId, filePath, new CallBack(
  onSuccess: () =>
  {
  },
  onError: (code, desc) =>
  {
  }
));
```

#### Delete chat group shared files

All chat group members can call `DeleteGroupSharedFile` to delete shared files in a chat group. Once a shared file is deleted, all the other chat group members receive the `IGroupManagerDelegate#OnSharedFileAddedFromGroup#OnSharedFileDeletedFromGroup` callback. The chat group owner and chat group admins can delete all of the shared files, whereas chat group members can only delete the shared files that they have personally uploaded.

The following code sample shows how to delete chat group shared files:

```csharp
SDKClient.Instance.GroupManager.DeleteGroupSharedFile(groupId, id, new CallBack(
  onSuccess: () =>
  {
  },
  onError: (code, desc) =>
  {
  }
));
```

#### Retrieve the shared file list

All chat group members can call `GetGroupFileListFromServer` to retrieve the list of shared files in a chat group from the server.

The following code sample shows how to retrieve the list of shared files in a chat group:

```csharp
SDKClient.Instance.GroupManager.GetGroupFileListFromServer(groupId, pageNum, pageSize, callback: new ValueCallBack> (
  onSuccess: (fileList) =>
  {
  },
  onError: (code, desc) =>
  {
  }
));
```

### Update the chat group extension fields

Only the chat group owner and admins can call `UpdateGroupExt` to update the extension fields of a chat group. The extension fields enable users to perform customized operations on a chat group. The maximum length of each extension field is 8 KB, and it must be in the JSON format.

The following code sample shows how to update the chat group extension fields:

```csharp
SDKClient.Instance.GroupManager.UpdateGroupExt(currentGroupId, extension, new CallBack(
  onSuccess: () =>
  {
  },
  onError: (code, desc) =>
  {
  }
));
```

### Listen for chat group events

For details, see [Chat Group Events](./manage-chat-groups#listen-for-chat-group-events).

### Unity

### Update the chat group name

The chat group owner and admins can call `ChangeGroupName` to set and update the chat group name. The maximum length of a chat group name is 128 characters.

The following code sample shows how to update the chat group name:

```csharp
SDKClient.Instance.GroupManager.ChangeGroupName(groupId, groupName, new CallBack(
  onSuccess: () =>
  {
  },
  onError: (code, desc) =>
  {
  }
));
```

### Update the chat group description

The chat group owner and admins can call `ChangeGroupDescription` to set and update the chat group description. The maximum length of a chat group description is 512 characters.

The following code sample shows how to update the chat group description:

```csharp
SDKClient.Instance.GroupManager.ChangeGroupDescription(groupId, description, new CallBack(
  onSuccess: () =>
  {
  },
  onError: (code, desc) =>
  {
  }
));
```

### Update the chat group announcements

Only the chat group owner and admins can call `UpdateGroupAnnouncement` to set and update the announcements. Once the chat group announcements are updated, all the other chat group members receive the `IGroupManagerDelegate#OnAnnouncementChangedFromGroup` callback. The maximum total length of chat group announcements is 512 characters.

The following code sample shows how to update the chat group announcements:

```csharp
SDKClient.Instance.GroupManager.UpdateGroupAnnouncement(groupId, announcement, new CallBack(
  onSuccess: () =>
  {
  },
  onError: (code, desc) =>
  {
  }
));
       
```

### Retrieve the chat group announcements

All chat group members can call `GetGroupAnnouncementFromServer` to retrieve the chat group announcements from the server.

The following code sample shows how to retrieve the chat group announcements:

```csharp
SDKClient.Instance.GroupManager.GetGroupAnnouncementFromServer(currentGroupId, new ValueCallBack(
  onSuccess: (str) =>
  {
  },
  onError: (code, desc) =>
  {
  }
));    
```

### Manage the chat group shared files

#### Upload chat group shared files

All chat group members can call `UploadGroupSharedFile` to upload shared files to a chat group. The maximum file size is 10 MB. Once a shared file is uploaded, all the other chat group members receive the `IGroupManagerDelegate#OnSharedFileAddedFromGroup` callback.

The following code sample shows how to upload chat group shared files:

```csharp
SDKClient.Instance.GroupManager.UploadGroupSharedFile(groupId, filePath, new CallBack(
  onSuccess: () =>
  {
  },
  onError: (code, desc) =>
  {
  }
));
```

#### Delete chat group shared files

All chat group members can call `DeleteGroupSharedFile` to delete shared files in a chat group. Once a shared file is deleted, all the other chat group members receive the `IGroupManagerDelegate#OnSharedFileAddedFromGroup#OnSharedFileDeletedFromGroup` callback. The chat group owner and chat group admins can delete all of the shared files, whereas chat group members can only delete the shared files that they have personally uploaded.

The following code sample shows how to delete chat group shared files:

```csharp
SDKClient.Instance.GroupManager.DeleteGroupSharedFile(groupId, id, new CallBack(
  onSuccess: () =>
  {
  },
  onError: (code, desc) =>
  {
  }
));
```

#### Retrieve the shared file list

All chat group members can call `GetGroupFileListFromServer` to retrieve the list of shared files in a chat group from the server.

The following code sample shows how to retrieve the list of shared files in a chat group:

```csharp
SDKClient.Instance.GroupManager.GetGroupFileListFromServer(groupId, pageNum, pageSize, callback: new ValueCallBack> (
  onSuccess: (fileList) =>
  {
  },
  onError: (code, desc) =>
  {
  }
));
```

### Update the chat group extension fields

Only the chat group owner and admins can call `UpdateGroupExt` to update the extension fields of a chat group. The extension fields enable users to perform customized operations on a chat group. The maximum length of each extension field is 8 KB, and it must be in the JSON format.

The following code sample shows how to update the chat group extension fields:

```csharp
SDKClient.Instance.GroupManager.UpdateGroupExt(currentGroupId, extension, new CallBack(
  onSuccess: () =>
  {
  },
  onError: (code, desc) =>
  {
  }
));
```

### Listen for chat group events

For details, see [Chat Group Events](./manage-chat-groups#listen-for-chat-group-events).

### Web

### Modify the chat group name and description

The chat group owner and chat group admins can modify the name and description of the chat group.

Refer to the following sample code to modify the chat group name and description:

```javascript
// The chat group owner and chat group admins can call modifyGroup to modify the name and description of a chat group.
// The name length can be up to 128 characters. The description length can be up to 512 characters.
const options = {
  groupId: "groupId",
  groupName: "groupName",
  description: "A description of group",
};
chatClient.modifyGroup(options).then((res) => console.log(res));
```

### Manage chat group announcements

The chat group owner and chat group admins can set and update chat group announcements. Once the announcements are updated, all chat group members receive the `updateAnnouncement` callback. All chat group members can retrieve chat group announcements.

Refer to the following sample code to manage chat group announcements:

```javascript
// The chat group owner and chat group admins can call updateGroupAnnouncement to set or update the chat group announcements.
// The announcement length can be up to 512 characters.
const options = {
  groupId: "groupId",
  announcement: "A announcement of group",
};
chatClient.updateGroupAnnouncement(options).then((res) => console.log(res));

// All chat group members can call fetchGroupAnnouncement to retrieve the chat group announcements.
const options = {
  groupId: "groupId",
};
chatClient.fetchGroupAnnouncement(options).then((res) => console.log(res));
```

### Manage chat group shared files

All chat group members can upload or download group shared files. The chat group owner and chat group admins can delete all of the group shared files, whereas group members can only delete the shared files that they have personally uploaded.

Refer to the following sample code to manage chat group shared files:

```javascript
// All chat group members can call uploadGroupSharedFile to upload group shared files. The file size can be up to 10 MB.
// Once shared files are uploaded, group members receive the uploadFile callback.
const options = {
  groupId: "groupId",
  file: file, // Choose the file to upload and share.
  onFileUploadProgress: function (resp) {}, // The callback of the upload progress
  onFileUploadComplete: function (resp) {}, // The callback of the upload success
  onFileUploadError: function (e) {}, // The callback of the upload failure
  onFileUploadCanceled: function (e) {}, // The callback of the upload cancelation
};
chatClient.uploadGroupSharedFile(options);

// All chat group members can call downloadGroupSharedFile to delete group shared files.
const options = {
  groupId: "groupId",
  fileId: "fileId", // The ID of the file
  onFileDownloadComplete: function (resp) {}, // The callback of the upload success
  onFileDownloadError: function (e) {}, // The callback of the upload failure
};
chatClient.downloadGroupSharedFile(options);

// All chat group members can call deleteGroupSharedFile to delete group shared files.
const options = {
  groupId: "groupId",
  fileId: "fileId", // The ID of the file
};
chatClient.deleteGroupSharedFile(options).then((res) => console.log(res));

// All chat group members can call getGroupSharedFilelist to retrieve the list of shared files in the chat group.
const options = {
  groupId: "groupId",
};
chatClient.getGroupSharedFilelist(options).then((res) => console.log(res));
```

### Listen for chat group events

For details, see [Chat Group Events](./manage-chat-groups#listen-for-chat-group-events).
