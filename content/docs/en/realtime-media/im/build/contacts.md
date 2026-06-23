---
title: "Contacts"
description: "Shows how to use the Agora Chat SDK to implement contact management."
---

After logging in to Chat, users can start adding contacts and chatting with each other. They can also manage these contacts, for example, by adding, retrieving and removing contacts. They can also add the specified user to the blocklist to stop receiving messages from that user.

Agora Chat, by default, allows two users to send chat messages to each other as strangers. This means that users can chat without adding each other as a contact. If you only allow chat between contacts, you can contact [support@agora.io](mailto:support@agora.io) to enable the friend relationship check switch. After this function is enabled, the SDK will check whether the two users trying to chat are on the contact list of each other. If no, the SDK will report error code 221.

Agora Chat, by default, allows two users to send chat messages to each other as strangers. This means that users can chat without adding each other as a contact. If you only allow chat between contacts, you can contact [support@agora.io](mailto:support@agora.io) to enable the friend relationship check switch. After this function is enabled, the SDK will check whether the two users trying to chat are on the contact list of each other. If no, the SDK will report error code 221.

This page shows how to use the Chat SDK to implement contact management.

## Understand the tech

### Android

The Chat SDK uses `ContactManager` to add, remove and manage contacts. Followings are the core methods:

- `addContact`: Adds a contact.
- `acceptInvitation`: Accepts the contact invitation.
- `declineInvitation`: Declines the contact invitation.
- `deleteContact`: Deletes a contact.
- `getAllContactsFromServer`: Retrieves a list of contacts from the server.
- `addUserToBlackList`: Adds the specified user to the blocklist.
- `removeUserFromBlackList`: Removes the specified user from the blocklist.
- `getBlackListFromServer`: Retrieves a list of blocked users from the server.

### iOS

The Chat SDK uses `IAgoraChatContactManager` to add, remove and manage contacts. Followings are the core methods:

- `addContact`: Adds a contact.
- `deleteContact`: Deletes a contact.
- `getContactsFromServerWithCompletion`: Retrieves a list of contacts from the server.
- `addUserToBlackList`: Adds the specified user to the blocklist.
- `removeUserFromBlackList`: Removes the specified user from the blocklist.
- `getBlackListFromServerWithCompletion`: Retrieves a list of blocked users from the server.

### Flutter

The Chat SDK uses `ChatContactManager` to add, remove and manage contacts. Followings are the core methods:

- `addContact`: Adds a contact.
- `acceptInvitation`: Accepts the contact invitation.
- `declineInvitation`: Declines the contact invitation.
- `deleteContact`: Deletes a contact.
- `getAllContactsFromServer`: Retrieves a list of contacts from the server.
- `getAllContactsFromDB`: Retrieves all contacts from the local database.
- `addUserToBlockList`: Adds the specified user to the blocklist.
- `removeUserFromBlockList`: Removes the specified user from the blocklist.
- `getBlockListFromServer`: Retrieves a list of blocked users from the server.

### React Native

The Chat SDK uses `ChatContactManager` to add, remove and manage contacts. Followings are the core methods:

- `addContact`: Adds a contact.
- `acceptInvitation`: Accepts the contact invitation.
- `declineInvitation`: Declines the contact invitation.
- `deleteContact`: Deletes a contact.
- `getAllContactsFromServer`: Retrieves a list of contacts from the server.
- `getAllContactsFromDB`: Retrieves all contacts from the local database.
- `addUserToBlockList`: Adds the specified user to the blocklist.
- `removeUserFromBlockList`: Removes the specified user from the blocklist.
- `getBlockListFromServer`: Retrieves a list of blocked users from the server.

### Windows

The Chat SDK uses `IContactManager` to add, remove and manage contacts. Followings are the core methods:

- `AddContact`: Adds a contact.
- `AcceptInvitation`: Accepts the contact invitation.
- `DeclineInvitation`: Declines the contact invitation.
- `DeleteContact`: Deletes a contact.
- `GetAllContactsFromServer`: Retrieves a list of contacts from the server.
- `AddUserToBlockList`: Adds the specified user to the blocklist.
- `RemoveUserFromBlockList`: Removes the specified user from the blocklist.
- `GetBlockListFromServer`: Retrieves a list of blocked users from the server.

### Unity

The Chat SDK uses `IContactManager` to add, remove and manage contacts. Followings are the core methods:

- `AddContact`: Adds a contact.
- `AcceptInvitation`: Accepts the contact invitation.
- `DeclineInvitation`: Declines the contact invitation.
- `DeleteContact`: Deletes a contact.
- `GetAllContactsFromServer`: Retrieves a list of contacts from the server.
- `AddUserToBlockList`: Adds the specified user to the blocklist.
- `RemoveUserFromBlockList`: Removes the specified user from the blocklist.
- `GetBlockListFromServer`: Retrieves a list of blocked users from the server.

### Web

The Chat SDK uses the Contact module to add, remove and manage contacts. Core methods include the following:

- `addContact`: Adds a contact.
- `acceptContactInvite`: Accepts the contact invitation.
- `declineContactInvite`: Declines the contact invitation.
- `deleteContact`: Deletes a contact.
- `getContacts`: Retrieves a list of contacts.
- `addEventHandler`: Adds the event handler.
- `addUsersToBlocklist`: Adds the specified user to the block list.
- `removeUserFromBlocklist`: Removes the specified user from the block list.
- `getBlocklist`: Retrieves a list of blocked users from the server.

## Prerequisites

Before proceeding, ensure that you meet the following requirements:

- You have integrated the Chat SDK, initialized the SDK and implemented the functionality of registering accounts and login. For details, see [Chat SDK quickstart](../get-started-sdk).
- You understand the API call frequency limits as described in [Limitations](./limitations).

## Implementation

This section shows how to manage contacts with the methods provided by the Chat SDK.

### Android

### Manage the contact list

Use this section to understand how to send a contact invitation, listen for contact events, and accept or decline the contact invitation.

#### Send a contact invitation

Call `addContact` to add the specified user as a contact:

```java
//The parameters are the username of the contact to be added and the reason for adding
ChatClient.getInstance().contactManager().addContact(toAddUsername, reason);
```

#### Listen for contact events

Use `ContactListener` to add the following callback events. When a user receives a contact invitation, you can accept or decline the invitation. 

```java
 ChatClient.getInstance().contactManager().setContactListener(new ContactListener() {

            //Occurs when a contact request is approved.
            @Override
            public void onFriendRequestAccepted(String username) { }

            //Occurs when a contact request is rejected.
            @Override
            public void onFriendRequestDeclined(String username) { }

            //Occurs when a contact invitation is received.
            @Override
            public void onContactInvited(String username, String reason) { }

            //Occurs when a contact is deleted.
            @Override
            public void onContactDeleted(String username) { }

            //Occurs when a contact is added.
            @Override
            public void onContactAdded(String username) { }
        });
```

#### Accept or decline the contact invitation

After receiving `onContactInvited`, call `acceptInvitation` or `declineInvitation` to accept or decline the invitation.

```java
// Accept the contact invitation
ChatClient.getInstance().contactManager().acceptInvitation(username);

// Decline the contact invitation
ChatClient.getInstance().contactManager().declineInvitation(username);
```

#### Delete a contact

Call `deleteContact` to delete the specified contact. The deleted user receives the `onContactDeleted` callback.

```java
ChatClient.getInstance().contactManager().deleteContact(username);
```

#### Retrieve the contact list

To get the contact list, you can call `getAllContactsFromServer` to retrieve contacts from the server. After that, you can also call `getContactsFromLocal` to retrieve contacts from the local database.

```java
// Retrieves a list of contacts from the server
List usernames = ChatClient.getInstance().contactManager().getAllContactsFromServer();

// Retrieves a list of contacts from the local database
List usernames = ChatClient.getInstance().contactManager().getContactsFromLocal
```

### Manage the block list

You can add a specified user to your block list. Once you do that, you can still send chat messages to that user, but you cannot receive messages from them. 

Users can add any other chat user to their block list, regardless of whether this other user is a contact or not. A contact added to the block list remains in the contact list.

#### Add a user to the block list

Call `addUserToBlackList` to add the specified user to the block list.

You can add any other users to the block list, regardless of whether they are on the contact list or not. Contacts are still displayed on the contact list even if they are added to the block list. After adding users to the block list,  you can still send messages to them, but will not receive messages from them as they cannot send messages or friend requests to you.

```java
// The effect of true and false is the same.
ChatClient.getInstance().contactManager().addUserToBlackList(username,true);
```

#### Remove a user from the block list

To remove the specified user from the block list, call `removeUserFromBlackList`.

```java
ChatClient.getInstance().contactManager().removeUserFromBlackList(username);
```

#### Retrieve the block list from the server

To get the block list, call `getBlackListFromServer` to retrieve a list of blocked users from the server. 

```java
ChatClient.getInstance().contactManager().getBlackListFromServer();
```

After retrieving the block list from the server, you can also call `getBlackListUsernames` to retrieve the block list from the local database.

```java
ChatClient.getInstance().contactManager().getBlackListUsernames();
```

### iOS

### Manage the contact list

Use this section to understand how to send a contact invitation, listen for contact events, and accept or decline the contact invitation.

#### Send a contact invitation

Call `addContact` to add the specified user as a contact:

```objc
/*
 *  Adds a contact.
 *
 *  @param aUsername        The username to be added as a contact
 *  @param aMessage         The invitation message
 *  @param aCompletionBlock The completion block of this method
 */        
[[AgoraChatClient sharedClient].contactManager addContact:@"aUsername" message:@"Message" completion:^(NSString *aUsername, AgoraChatError *aError) {
    if (!aError) {
        NSLog(@"Adding the contact succeeds %@",aUsername);
    } else {
        NSLog(@"Adding the contact fails %@", aError.errorDescription);
    }
}];
```

#### Listen for contact events

Use `AgoraChatContactManagerDelegate` to add the following callback events. When a user receives a contact invitation, you can accept or decline the invitation.

```objc
// Adds a contact manager delegate
[[AgoraChatClient sharedClient].contactManager addDelegate:self delegateQueue:nil];
//Removes the contact manager delegate
[[AgoraChatClient sharedClient].contactManager removeDelegate:self];

- (void)friendRequestDidReceiveFromUser:(NSString *)aUsername
                                message:(NSString *)aMessage
{ }
// The peer user accepts the contact invitation.
- (void)friendRequestDidApproveByUser:(NSString *)aUsername
{ }
// The peer user declines the contact invitation.
- (void)friendRequestDidDeclineByUser:(NSString *)aUsername
{ }
// The contact is deleted.
- (void)friendshipDidRemoveByUser:(NSString *)aUsername
{ }
```

#### Accept or decline the contact invitation

After receiving `friendRequestDidReceiveFromUser`, call `approveFriendRequestFromUser` or `declineFriendRequestFromUser` to accept or decline the invitation. The peer user receives the `friendRequestDidApprove` or `friendRequestDidDecline` callback.

```objc
/*
 *  Approves the contact invitation.
 *
 *  @param aUsername        The username that sends the contact invitation
 *  @param aCompletionBlock The completion block of this method
 */                          
[[AgoraChatClient sharedClient].contactManager approveFriendRequestFromUser:@"aUsername" completion:^(NSString *aUsername, AgoraChatError *aError) {
    if (!aError) {
        NSLog(@"Approving the contact invitation succeeds");
    } else {
        NSLog(@"Approving the contact invitation fails because of--- %@", aError.errorDescription);
    }
}];
```

```objc
/*
 *  Declines the contact invitation.
 *
 *  @param aUsername        The username that sends the contact invitation
 *  @param aCompletionBlock The completion block of this method
 */
[[AgoraChatClient sharedClient].contactManager declineFriendRequestFromUser:@"aUsername" completion:^(NSString *aUsername, AgoraChatError *aError) {
    if (!aError) {
        NSLog(@"Declining the contact invitation succeeds.");
    } else {
        NSLog(@"Declining the contact invitation fails because of %@", aError.errorDescription);
    }
}];
```

Once you accept or decline the contact invitation, the user that sends the invitation receives the `friendRequestDidApproveByUser` or `friendRequestDidDeclineByUser` callback.

```objc
/*
 * Occurs when the peer user accepts your contact invitation.
 */
- (void)friendRequestDidApproveByUser:(NSString *)aUsername
{ }
```

```objc
/*
 * Occurs when the peer user declines your contact invitation.
 */
- (void)friendRequestDidDeclineByUser:(NSString *)aUsername
{ }
```

#### Delete a contact

Call `deleteContact` to delete the specified contact. 

```objc
/*
 *  Deletes the contact.
 *
 *  @param aUsername                The username of the contact to be removed
 *  @param aIsDeleteConversation    Whether to delete the conversation with the contact
 *  @param aCompletionBlock         The completion block for this method
 */
[[AgoraChatClient sharedClient].contactManager deleteContact:@"aUsername" isDeleteConversation:aIsDeleteConversation completion:^(NSString *aUsername, AgoraChatError *aError) {
    if (!aError) {
        NSLog(@"Removing the contact succeeds");
    } else {
        NSLog(@"Removing the contact fails %@", aError.errorDescription);
    }
}];
```

Once the contact is deleted, both users receive the `friendshipDidRemoveByUser` callback.

```objc
/*
 * Occurs when the contact is removed.
 */
- (void)friendshipDidRemoveByUser:(NSString *)aUsername
{ }
```

#### Retrieve the contact list

To get the contact list, you can call `getContactsFromServerWithCompletion` to retrieve contacts from the server. After that, you can also call `getContacts` to retrieve contacts from the local database.

```objc
// Retrieves a list of contacts from the server
[[AgoraChatClient sharedClient].contactManager getContactsFromServerWithCompletion:^(NSArray *aList, AgoraChatError *aError) {
    if (!aError) {
        NSLog(@"Retrieving the contact list succeeds %@",aList);
    } else {
        NSLog(@"Retrieving the contact list fails because of %@", aError.errorDescription);
    }
}];
```

```objc
// Retrieves a list of contacts from the local database
NSArray *userlist = [[AgoraChatClient sharedClient].contactManager getContacts];
```

### Manage the blocklist

You can add any other users to the blocklist, regardless of whether they are on the contact list or not. Contacts are still displayed on the contact list even if they are added to the blocklist. After adding users to the blocklist,  you can still send messages to them, but will not receive messages from them as they cannot send messages or friend requests to you.

#### Add a user to the blocklist

Call `addUserToBlackList` to add the specified user to the blocklist.

```objc
/*
 *  Adds the user to the blocklist.
 *
 *  @param aUsername        The usernames to be added to the blocklist
 *  @param aCompletionBlock The completion block of this method
 */              
[[AgoraChatClient sharedClient].contactManager addUserToBlackList:@"aUsername" completion:^(NSString *aUsername, AgoraChatError *aError) {
    if (!aError) {
        NSLog(@"Adding the contact to the blocklist succeeds");
    } else {
        NSLog(@"Adding the contact to the blocklist fails because of %@", aError.errorDescription);
    }
}];
```

#### Remove a user from the blocklist

To remove the specified user from the blocklist, call `removeUserFromBlackList`.

```objc
/*
 *  Removes the user from the blocklist.
 *
 *  @param aUsername        The usernames to be removed from the blocklist
 *  @param aCompletionBlock The completion block for this method call
 */
[[AgoraChatClient sharedClient].contactManager removeUserFromBlackList:@"aUsername" completion:^(NSString *aUsername, AgoraChatError *aError) {
    if (!aError) {
        NSLog(@"Removing the user from the blocklist succeeds");
    } else {
        NSLog(@"Removing the user from the blocklist fails because of %@", aError.errorDescription);
    }
}]; 
```

#### Retrieve the blocklist from the server

To get the blocklist, call `getBlackListFromServerWithCompletion` to retrieve a list of blocked users from the server.

```objc
/*
 *  Retrieve the blocklist fromn server
 */
[[AgoraChatClient sharedClient].contactManager getBlackListFromServerWithCompletion:^(NSArray *aList, AgoraChatError *aError) {
    if (!aError) {
        NSLog(@"Retrieving the blocklist from server succeeds %@",aList);
    } else {
        NSLog(@"Retrieving the blocklist from server fails %@", aError.errorDescription);
    }
}];
```

After retrieving the blocklist from the server, you can also call `getBlackList` to retrieve the blocklist from the local database.

```objc
NSArray *blockList = [[AgoraChatClient sharedClient].contactManager getBlackList];
```

### Flutter

### Add a contact

This section uses user A and user B as an example to describe the process of adding a peer user as a contact.

User A call `addContact` to add user B as a contact:

```dart
// The user ID that you want to add as a contact
String userId = "foo";
// Reasons for adding the user as a contact
String reason = "Request to add a friend.";
try{
  await ChatClient.getInstance.contactManager.addContact(userId, reason);
} on ChatError catch (e) {
}
```

When user B receives the contact invitation, accept or decline the invitation.

- To accept the invitation

  ```dart
  // The user ID that sends the contact invitation
  String userId = "bar";
  try{
    await ChatClient.getInstance.contactManager.acceptInvitation(userId);
  } on ChatError catch (e) {
  }
  ```

- To decline the invitation

  ```dart
  // The user ID that sends the contact invitation
  String userId = "bar";
  try{
    await ChatClient.getInstance.contactManager.declineInvitation(userId);
  } on ChatError catch (e) {
  }
  ```

User A uses `ContactEventHandler` to listen for contact events.

- If user B accepts the invitation, `onContactInvited` is triggered.

  ```dart
  class _ContactPageState extends State {
    @override
    void initState() {
      super.initState();
      // Adds the contact event handler.
      ChatClient.getInstance.contactManager.addEventHandler(
        "UNIQUE_HANDLER_ID",
        ContactEventHandler(
          onContactInvited: (userId, reason) {},
        ),
      );
    }
    @override
    void dispose() {
      // Removes the contact event handler.
      ChatClient.getInstance.contactManager.removeEventHandler("UNIQUE_HANDLER_ID");
      super.dispose();
    }
  }
  ```

- If user B declines the invitation, `onFriendRequestDeclined` is triggered.

  ```dart
  class _ContactPageState extends State {
    @override
    void initState() {
      super.initState();
      // Adds the contact event handler.
      ChatClient.getInstance.contactManager.addEventHandler(
        "UNIQUE_HANDLER_ID",
        ContactEventHandler(
          onFriendRequestDeclined: (userId) {},
        ),
      );
    }
    @override
    void dispose() {
      // Removes the contact event handler.
      ChatClient.getInstance.contactManager.removeEventHandler("UNIQUE_HANDLER_ID");
      super.dispose();
    }
  }
  ```

### Retrieve the contact list

You can retrieve the contact list from the server and from the local database. Refer to the following sample code:

```dart
// Call getAllContactsFromServer to retrieve the contact list from the server.
List contacts = await ChatClient.getInstance.contactManager.getAllContactsFromServer();

// Call getAllContactsFromDB to retrieve the contact list from the local database.
List contacts = await ChatClient.getInstance.contactManager.getAllContactsFromDB();
```

### Delete a contact

Call `deleteContact` to delete the specified contact. To prevent mis-operation, we recommend adding a double check process before deleting the contact.

```dart
// The user ID
String userId = "tom";
// Whether to keep the conversation when deleting the contact
bool keepConversation = true;
try {
  await ChatClient.getInstance.contactManager.deleteContact(
    userId,
    keepConversation,
  );
} on ChatError catch (e) {
}
```

### Add a user to the blocklist

Call `addUserToBlockList` to add the specified user to the blocklist.

You can add any other users to the blocklist, regardless of whether they are on the contact list or not. Contacts are still displayed on the contact list even if they are added to the blocklist. After adding users to the blocklist,  you can still send messages to them, but will not receive messages from them as they cannot send messages or friend requests to you.

```dart
// The user ID
String userId = "tom";
try {
  await ChatClient.getInstance.contactManager.addUserToBlockList(userId);
} on ChatError catch (e) {
}
```

### Retrieve the blocklist

To get the blocklist from the local device, call `getBlockListFromDB`.

```dart
try {
  List list =
      await ChatClient.getInstance.contactManager.getBlockListFromDB();
} on ChatError catch (e) {
}
```

You can also retrieve the blocklist from the server by calling `getBlockListFromServer`.

```dart
try {
  List list =
      await ChatClient.getInstance.contactManager.getBlockListFromServer();
} on ChatError catch (e) {
}
```

### Remove a user from the blocklist

To remove the specified user from the blocklist, call `removeUserFromBlockList`.

```dart
String userId = "tom";
try {
  await ChatClient.getInstance.contactManager.removeUserFromBlockList(userId);
} on ChatError catch (e) {
}
```

### React Native

### Add a contact

This section uses user A and user B as an example to describe the process of adding a peer user as a contact.

User A call `addContact` to add user B as a contact:

```typescript
// Specify the user ID.
const userId = "foo";
// Set the reason for adding a contact.
const reason = "Request to add a friend.";
ChatClient.getInstance()
  .contactManager.addContact(userId, reason)
  .then(() => {
    console.log("request send success.");
  })
  .catch((reason) => {
    console.log("request send fail.", reason);
  });
```

When user B receives the contact invitation, accept or decline the invitation.

- To accept the invitation

  ```typescript
  const userId = "bar";
  ChatClient.getInstance()
    .contactManager.acceptInvitation(userId)
    .then(() => {
      console.log("accept request success.");
    })
    .catch((reason) => {
      console.log("accept request fail.", reason);
    });
  ```

- To decline the invitation

  ```typescript
  const userId = "bar";
  ChatClient.getInstance()
    .contactManager.declineInvitation(userId)
    .then(() => {
      console.log("decline request success.");
    })
    .catch((reason) => {
      console.log("decline request fail.", reason);
    });
  ```

User A uses `ContactEventListener` to listen for contact events. 

- If user B accepts the invitation, `onContactInvited` is triggered.

  ```typescript
  const contactEventListener = new (class implements ChatContactEventListener {
    that: any;
    constructor(parent: any) {
      this.that = parent;
    }
    onContactInvited(userId: string, reason?: string): void {
      console.log(`onContactInvited: ${userId}, ${reason}: `);
    }
  })(this);
  ChatClient.getInstance().contactManager.addContactListener(
    contactEventListener
  );
  ```

- If user B declines the invitation, `onFriendRequestDeclined` is triggered.

  ```typescript
  const contactEventListener = new (class implements ChatContactEventListener {
    that: any;
    constructor(parent: any) {
      this.that = parent;
    }
    onFriendRequestDeclined(userId: string): void {
      console.log(`onFriendRequestDeclined: ${userId}: `);
    }
  })(this);
  ChatClient.getInstance().contactManager.addContactListener(
    contactEventListener
  );
  ```

#### Delete a contact

Call `deleteContact` to delete the specified contact. To prevent mis-operation, we recommend adding a double check process before deleting the contact.

```typescript
// Specify the user to be deleted.
const userId = "tom";
// Whether to delete the conversation.
const keepConversation = true;
ChatClient.getInstance()
  .contactManager.deleteContact(userId, keepConversation)
  .then(() => {
    console.log("remove success.");
  })
  .catch((reason) => {
    console.log("remove fail.", reason);
  });
```

### Add a user to the blocklist

Call `addUserToBlockList` to add the specified user to the blocklist.

You can add any other users to the blocklist, regardless of whether they are on the contact list or not. Contacts are still displayed on the contact list even if they are added to the blocklist. After adding users to the blocklist,  you can still send messages to them, but will not receive messages from them as they cannot send messages or friend requests to you.

```typescript
// Specify the user ID to be added to the blocklist.
const userId = "tom";
// Call addUserToBlockList.
ChatClient.getInstance()
  .contactManager.addUserToBlockList(userId)
  .then(() => {
    console.log("add blocklist success.");
  })
  .catch((reason) => {
    console.log("add blocklist fail.", reason);
  });
```

### Retrieve the blocklist

To get the blocklist from the local device, call `getBlockListFromDB`.

```typescript
ChatClient.getInstance()
  .contactManager.getBlockListFromDB()
  .then((list) => {
    console.log("get blocklist success: ", list);
  })
  .catch((reason) => {
    console.log("get blocklist fail.", reason);
  });
```

You can also retrieve the blocklist from the server by calling `getBlockListFromServer`.

```typescript
ChatClient.getInstance()
  .contactManager.getBlockListFromServer()
  .then((list) => {
    console.log("get blocklist success: ", list);
  })
  .catch((reason) => {
    console.log("get blocklist fail.", reason);
  });
```

### Remove a user from the blocklist

To remove the specified user from the blocklist, call `removeUserFromBlockList`.

```typescript
const userId = "tom";
// Call removeUserFromBlockList
ChatClient.getInstance()
  .contactManager.removeUserFromBlockList(userId)
  .then((list) => {
    console.log("remove user to blocklist success: ", list);
  })
  .catch((reason) => {
    console.log("remove user to blocklist fail.", reason);
  });
```

### Windows

### Manage the contact list

Use this section to understand how to send a contact invitation, listen for contact events, and accept or decline the contact invitation.

#### Send a contact invitation

Call `AddContact` to add the specified user as a contact:

```csharp
SDKClient.Instance.ContactManager.AddContact(username, reason, callback: new CallBack(
  onSuccess: () =>
  {
  },
  onError: (code, desc) =>
  {
  }
));
```

#### Listen for contact events

Use `IContactManagerDelegate` to add the following delegates. When a user receives a contact invitation, you can accept or decline the invitation. 

```csharp
// Inherit and instantiate IContactManagerDelegate。
public class ContactManagerDelegate : IContactManagerDelegate {
    // Occurs when a contact is added.
    public void OnContactAdded(string username)
    {
    }
    // Occurs when the contact is removed.
    public void OnContactDeleted(string username)
    {
    }
    // Occurs when a contact invitation is received.
    public void OnContactInvited(string username, string reason)
    {
    }
    // Occurs when the contact invitation is accepted.
    public void OnFriendRequestAccepted(string username)
    {
    }
    // Occurs when the contact invitation is declined.
    public void OnFriendRequestDeclined(string username)
    {
    }
}
// Call AddContactManagerDelegate to listen for contact events.
ContactManagerDelegate adelegate = new ContactManagerDelegate();
SDKClient.Instance.ContactManager.AddContactManagerDelegate(adelegate);
// Call RemoveContactManagerDelegate to remove the delegate.
SDKClient.Instance.ContactManager.RemoveContactManagerDelegate(adelegate);
```

#### Accept or decline the contact invitation

After receiving `OnContactInvited`, call `AcceptInvitation` or `DeclineInvitation` to accept or decline the invitation.

```csharp
// Accept the contact invitation. Once you accept the invitation, the sender receives the OnFriendRequestAccepted callback.
SDKClient.Instance.ContactManager.AcceptInvitation(username, callback: new CallBack(
   onSuccess: () =>
   {        
   },
   onError: (code, desc) =>
   {
   }
));
// Decline the contact invitation. Once you decline the invitation, the sender receives the OnFriendRequestDeclined callback.
SDKClient.Instance.ContactManager.DeclineInvitation(username, callback: new CallBack(
  onSuccess: () =>
  {
  },
  onError: (code, desc) =>
  {
  }
));
```

#### Delete a contact

Call `DeleteContact` to delete the specified contact. The deleted user receives the `OnContactDeleted` callback.

```csharp
SDKClient.Instance.ContactManager.DeleteContact(username, callback: new CallBack(
  onSuccess: () =>
  {
  },
  onError: (code, desc) =>
  {
  }
));
```

#### Retrieve the contact list

To get the contact list, you can call `GetAllContactsFromServer` to retrieve contacts from the server. After that, you can also call `GetAllContactsFromDB` to retrieve contacts from the local database.

```csharp
// Retrieve a list of contacts from the server.
SDKClient.Instance.ContactManager.GetAllContactsFromServer(new ValueCallBack>(
  onSuccess: (list) =>
  {
  },
  onError: (code, desc) =>
  {
  }
));
// After retrieving the contact list from the server, you can call `GetAllContactsFromDB` to get the list of contacts from the local database.
Listlist = SDKClient.Instance.ContactManager.GetAllContactsFromDB();
```

### Manage the blocklist

You can add any other users to the blocklist, regardless of whether they are on the contact list or not. Contacts are still displayed on the contact list even if they are added to the blocklist. After adding users to the blocklist,  you can still send messages to them, but will not receive messages from them as they cannot send messages or friend requests to you.

#### Add a user to the blocklist

Call `AddUserToBlockList` to add the specified user to the blocklist.

```csharp
SDKClient.Instance.ContactManager.AddUserToBlockList(username, callback: new CallBack(
  onSuccess: () =>
  {
  },
  onError: (code, desc) =>
  {
  }
));
```

#### Remove a user from the blocklist

To remove the specified user from the blocklist, call `RemoveUserFromBlockList`.

```csharp
SDKClient.Instance.ContactManager.RemoveUserFromBlockList(username, callback: new CallBack(
  onSuccess: () =>
  {
  },
  onError: (code, desc) =>
  {
  }
));
```

#### Retrieve the blocklist from the server

To get the blocklist, call `GetBlockListFromServer` to retrieve a list of blocked users from the server.

```csharp
// Call `GetBlockListFromServer` to get the blocklist from the server.
SDKClient.Instance.ContactManager.GetBlockListFromServer(new ValueCallBack>(
  onSuccess: (list) =>
  {
  },
  onError: (code, desc) =>
  {
  }
));
```

### Unity

### Manage the contact list

Use this section to understand how to send a contact invitation, listen for contact events, and accept or decline the contact invitation.

#### Send a contact invitation

Call `AddContact` to add the specified user as a contact:

```csharp
SDKClient.Instance.ContactManager.AddContact(username, reason, callback: new CallBack(
  onSuccess: () =>
  {
  },
  onError: (code, desc) =>
  {
  }
));
```

#### Listen for contact events

Use `IContactManagerDelegate` to add the following delegates. When a user receives a contact invitation, you can accept or decline the invitation. 

```csharp
// Inherit and instantiate IContactManagerDelegate。
public class ContactManagerDelegate : IContactManagerDelegate {
    // Occurs when a contact is added.
    public void OnContactAdded(string username)
    {
    }
    // Occurs when the contact is removed.
    public void OnContactDeleted(string username)
    {
    }
    // Occurs when a contact invitation is received.
    public void OnContactInvited(string username, string reason)
    {
    }
    // Occurs when the contact invitation is accepted.
    public void OnFriendRequestAccepted(string username)
    {
    }
    // Occurs when the contact invitation is declined.
    public void OnFriendRequestDeclined(string username)
    {
    }
}
// Call AddContactManagerDelegate to listen for contact events.
ContactManagerDelegate adelegate = new ContactManagerDelegate();
SDKClient.Instance.ContactManager.AddContactManagerDelegate(adelegate);
// Call RemoveContactManagerDelegate to remove the delegate.
SDKClient.Instance.ContactManager.RemoveContactManagerDelegate(adelegate);
```

#### Accept or decline the contact invitation

After receiving `OnContactInvited`, call `AcceptInvitation` or `DeclineInvitation` to accept or decline the invitation.

```csharp
// Accept the contact invitation. Once you accept the invitation, the sender receives the OnFriendRequestAccepted callback.
SDKClient.Instance.ContactManager.AcceptInvitation(username, callback: new CallBack(
   onSuccess: () =>
   {        
   },
   onError: (code, desc) =>
   {
   }
));
// Decline the contact invitation. Once you decline the invitation, the sender receives the OnFriendRequestDeclined callback.
SDKClient.Instance.ContactManager.DeclineInvitation(username, callback: new CallBack(
  onSuccess: () =>
  {
  },
  onError: (code, desc) =>
  {
  }
));
```

#### Delete a contact

Call `DeleteContact` to delete the specified contact. The deleted user receives the `OnContactDeleted` callback.

```csharp
SDKClient.Instance.ContactManager.DeleteContact(username, callback: new CallBack(
  onSuccess: () =>
  {
  },
  onError: (code, desc) =>
  {
  }
));
```

#### Retrieve the contact list

To get the contact list, you can call `GetAllContactsFromServer` to retrieve contacts from the server. After that, you can also call `GetAllContactsFromDB` to retrieve contacts from the local database.

```csharp
// Retrieve a list of contacts from the server.
SDKClient.Instance.ContactManager.GetAllContactsFromServer(new ValueCallBack>(
  onSuccess: (list) =>
  {
  },
  onError: (code, desc) =>
  {
  }
));
// After retrieving the contact list from the server, you can call `GetAllContactsFromDB` to get the list of contacts from the local database.
Listlist = SDKClient.Instance.ContactManager.GetAllContactsFromDB();
```

### Manage the block list

You can add any other users to the block list, regardless of whether they are on the contact list or not. Contacts are still displayed on the contact list even if they are added to the block list. After adding users to the block list,  you can still send messages to them, but will not receive messages from them as they cannot send messages or friend requests to you.

#### Add a user to the block list

Call `AddUserToBlockList` to add the specified user to the block list.

```csharp
SDKClient.Instance.ContactManager.AddUserToBlockList(username, callback: new CallBack(
  onSuccess: () =>
  {
  },
  onError: (code, desc) =>
  {
  }
));
```

#### Remove a user from the block list

To remove the specified user from the block list, call `RemoveUserFromBlockList`.

```csharp
SDKClient.Instance.ContactManager.RemoveUserFromBlockList(username, callback: new CallBack(
  onSuccess: () =>
  {
  },
  onError: (code, desc) =>
  {
  }
));
```

#### Retrieve the block list from the server

To get the block list, call `GetBlockListFromServer` to retrieve a list of blocked users from the server. 

```csharp
// Call `GetBlockListFromServer` to get the block list from the server.
SDKClient.Instance.ContactManager.GetBlockListFromServer(new ValueCallBack>(
  onSuccess: (list) =>
  {
  },
  onError: (code, desc) =>
  {
  }
));
```

### Web

### Manage the contact list

Use this section to understand how to send a contact invitation, listen for contact events, and accept or decline the contact invitation.

#### Send a contact invitation

Call `addContact` to add the specified user as a contact:

```javascript
const message = "Hello!";
chatClient.addContact("username", message);
```

#### Listen for contact events

Use `chatClient.addEventHandler` to add the following callback events. When a user receives a contact invitation, you can accept or decline the invitation.

```javascript
/**
 * msg indicates the result of triggering the callback
 */
chatClient.addEventHandler("handlerId", {
  // Occurs when the contact invitation is received
  onContactInvited: function (msg) {},
  // Occurs when the contact is deleted
  onContactDeleted: function (msg) {},
  // Occurs when a contact is added
  onContactAdded: function (msg) {},
  // Occurs when the contact invitation is declined
  onContactRefuse: function (msg) {},
  // Occurs when the contact invitation is approved
  onContactAgreed: function (msg) {},
});
```

#### Accept or decline the contact invitation

After receiving `onContactInvited`, call `acceptContactInvite` or `declineContactInvite` to accept or decline the invitation.

```javascript
/**
 * Accepts the contact invitation
 */
chatClient.acceptContactInvite("username");

/**
 * Declines the contact invitation
 */
chatClient.declineContactInvite("username");
```

#### Delete a contact

Call `deleteContact` to delete the specified contact. The deleted user receives the `onContactDeleted` callback.

```javascript
chatClient.deleteContact("username");
```

#### Retrieve the contact list

To get the contact list, you can call `getContacts`.

```javascript
chatClient.getContacts().then((res) => {
  console.log(res); // res.data > ['user1', 'user2']
});
```

### Manage the block list

You can add any other users to the block list, regardless of whether they are on the contact list or not. Contacts are still displayed on the contact list even if they are added to the block list. After adding users to the block list, you can still send messages to them, but will not receive messages from them as they cannot send messages or friend requests to you.

#### Add a user to the block list

Call `addUsersToBlocklist` to add the specified user to the block list.

```javascript
chatClient.addUsersToBlocklist({
  name: ["user1", "user2"],
});
```

#### Remove a user from the block list

To remove the specified user from the block list, call `removeUserFromBlocklist`.

```javascript
chatClient.removeUserFromBlocklist({
  name: ["user1", "user2"],
});
```

#### Retrieve the block list from the server

To get the block list, call `getBlocklist`.

```javascript
chatClient.getBlocklist();
```
