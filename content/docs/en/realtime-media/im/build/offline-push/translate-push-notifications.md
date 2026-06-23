---
title: "Translate push notifications"
description: "Translate push translations"
---

### All except Windows

### All except Unity

Push notifications work in conjunction with the translation feature. If a user enables the auto-translate feature and sends a message, the SDK will send both the original message and the translated message.

A recipient can set the preferred language for push notifications. If the language of the translated message matches their setting, the translated message is displayed in the push notification bar; otherwise, the original message is displayed.

The following sample code shows how to set and get the preferred language for push notifications:

### Android

```java
// Set the preferred language for offline push.
ChatClient.getInstance().pushManager().setPreferredNotificationLanguage("en", new CallBack(){});

// Get the preferred language for offline push.
ChatClient.getInstance().pushManager().getPreferredNotificationLanguage(new ValueCallBack(){});
```

### iOS

```objective-c
// Set the preferred language for offline push.
[[AgoraChatClient sharedClient].pushManager setPreferredNotificationLanguage:@"EU" completion:^(AgoraChatError *aError) {
    if (aError) {
        NSLog(@"setPushPerformLanguageCompletion error---%@",aError.errorDescription);
    }
}];
// Get the preferred language for offline push settings.
[[AgoraChatClient sharedClient].pushManager getPreferredNotificationLanguageCompletion:^(NSString *aLanguageCode, AgoraChatError *aError) {
    if (!aError) {
        NSLog(@"getPushPerformLanguage---%@",aLanguageCode);
    }
}];
```

### Web

### Set push translation

Push notifications work with the translation feature. If a user enables the automatic translation feature and sends a message, the SDK will send both the original message and the translated message.

As a recipient, the user can set the preferred language for push notifications they want to receive when offline. If the language of the translated message matches their preferred language, the translated message is displayed in the push notification; otherwise, the original message is displayed.

Call `setPushPerformLanguage` to set the preferred language for push notifications. The sample code is as follows:

```javascript
// Set the preferred language for push notifications.
const params = {
  language: "EU",
};
chatClient.setPushPerformLanguage(params);

// Get the preferred language for push notifications.
chatClient.getPushPerformLanguage();
```

### Flutter

```dart
// Set the preferred language for offline push.
try {
  await ChatClient.getInstance.pushManager.setPreferredNotificationLanguage('en');
} on ChatError catch (e) {}
// Get the preferred language for offline push settings.
try {
  String? language = await ChatClient.getInstance.pushManager.fetchPreferredNotificationLanguage();
} on ChatError catch (e) {}
```

### React Native

```typescript
ChatClient.getInstance()
  .pushManager.setPreferredNotificationLanguage(languageCode)
  .then(() => {
    console.log("Succeeded in setting the preferred notification language.");
  })
  .catch((reason) => {
    console.log("Failed to set the preferred notification language.", reason);
  });
```

### Windows, Unity

**This feature is not supported for this platform.**
