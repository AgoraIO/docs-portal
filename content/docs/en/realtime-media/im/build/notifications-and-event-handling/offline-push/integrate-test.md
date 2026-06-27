---
title: "Integrate offline push"
description: "Integrate push notifications."
---

### Windows, Unity

**This feature is not supported for this platform.**

### Web

**This feature guide is not available yet.**

### All except Web

### All except Windows

### All except Unity

Follow this guide to integrate and test push notifications in your environment.

## Prerequisites

Before proceeding, ensure that you meet the following requirements:
- You have initialized the Chat SDK. For details, see [SDK quickstart](../../../get-started-sdk).
- You understand the call frequency limit of the Chat APIs supported by different pricing plans as described in [Limitations](../../limitations).

### Android

## Integrate FCM push

This section guides you through integrating FCM with Chat.
W
:::info
For Android devices, if FCM and push services from other manufacturers are enabled at the same time, FCM push services will be used first.
:::

### 1. Create a project in Firebase

1. Log in to the [Firebase console](https://console.firebase.google.com/) and [add a project](https://firebase.google.com/docs/android/setup/#create-firebase-project).

1. [Register the application](https://firebase.google.com/docs/android/setup/#register-app) in the project.

    In the **Download and then add config file** step of the **Add Firebase to your Android app** page, click **Download google-services.json** and put the file into your Android app module root directory.

    ![push_fcm_download_googleservice](/images/im/push_fcm_download_googleservice.png)

1. Query the sender ID. On the **Project settings** page, select the **Cloud Messaging** tab and view **Sender ID**. When uploading the FCM certificate to Agora Console, set the certificate name to the FCM sender ID.

    ![push_fcm_senderid.png](/images/im/push_fcm_senderid.png)

1. On the **Project settings** page, select the **Service accounts** tab and click **Generate new private key** to generate a JSON file. Save this file and upload it to Agora Console when using the V1 certificate.

    ![push_fcm_private_key](/images/im/push_fcm_private_key.png)

### 2. Upload FCM certificate to Agora Console

After successfully logging into Chat, you can upload the FCM push certificate to Agora Console:

1. Log in to [Agora Console](https://console.agora.io/v2), and click **Project Management** in the left navigation bar.

1. On the **Project Management** page, locate the project that has Chat enabled and click **Config**.

1. On the project editing page, click **Config** next to **Chat**.

1. On the project config page, select **Features** > **Push Certificate** and click **Add Push Certificate**.

1. In the pop-up window, select the **Google** tab, and configure the following fields:

    ![push_fcm_add_certificate](/images/im/push_fcm_add_certificate.png)

    | Parameter  | Type   | Required | Description              |
    | :--------- | :----- | :------- | :----------------------- |
    | **Certificate Type** | | No | Select whether to use a V1 certificate or a legacy certificate. **V1**: Recommended. You need to configure a **Private Key**. **Legacy**: Will soon be deprecated. You need to configure a **Push Key**.|
    | **Private Key** | file | Yes | Click **Generate new private key** on the **Project settings** > **Service accounts** page of the [Firebase Console](https://console.firebase.google.com) to generate the `.json` file, then upload it to Agora Console. |
    | **Push Key** | String | Yes | FCM Server Key. Obtain the server key in the **Cloud Messaging API (Legacy)** area of the **Project settings** > **Cloud Messaging** page of the [Firebase Console](https://console.firebase.google.com).   **This parameter is only valid for legacy certificates.**|
    | **Certificate Name** | String | Yes | The sender ID configured for the FCM. For the new version of the certificate, you can find the sender ID on the **Project settings** > **Cloud Messaging** page of the [Firebase Console](https://console.firebase.google.com). For legacy certificates, go to the ***Project settings > Cloud Messaging** page of the [Firebase Console](https://console.firebase.google.com), and get the sender ID in the **Cloud  Messaging API (Legacy)** area.  The certificate name is the only condition used by the Agora server to determine which push channel the target device uses, so ensure that the sender set when integrating FCM in Chat is consistent with what is set here. |
    | **Sound** | String | No | The ringtone flag for when the receiver gets the push notification. |
    | **Push Priority** | | No| Message delivery priority. See [Setting the priority of a message](https://firebase.google.cn/docs/cloud-messaging/concept-options#setting-the-priority-of-a-message). |
    | **Push Msg Type** | | No| The type of the message sent to the client through FCM. See [Message types](https://firebase.google.com/docs/cloud-messaging/concept-options#notifications_and_data_messages): **Data**: Data message, processed by the client application. **Notification**: Notification message, automatically processed by FCM SDK. **Both**: Notification messages and data messages can be sent through the FCM client. |

#### Switch from legacy to the V1 certificate

The legacy HTTP or XMPP API is being retired on June 20, 2024. In view of this, switch to the latest FCM API (HTTP v1) version of the certificate as soon as possible. See [Firebase Console](https://console.firebase.google.com) for details.

Make sure that the uploaded V1 certificate is available, as the legacy one will be deleted upon upload. If the new certificate is not available, the push will fail.

Take the following steps to switch from the old to the new certificate:

1. Click **Edit** in the **Action** column of the old certificate on the **Push Certificate** page.

    ![push_fcm_oldcertificate_edit](/images/im/push_fcm_oldcertificate_edit.png)

1. In the **Google** tab of the **Edit Push Certificate** window, switch the **Certificate Type** to **V1**.

    ![push_fcm_oldcertificate_switch](/images/im/push_fcm_oldcertificate_switch.png)

1. Click **Upload** to upload the locally saved V1 certificate file (`.json`).

    ![push_fcm_newcertificate_upload](/images/im/push_fcm_newcertificate_upload.png)

1. Click **OK** to complete the switch.

### 3. Integrate FCM on the client

Take the following steps to integrate FCM on the client.

1. In the `build.gradle` file of your app project, configure the FCM library dependency:

    ```java
    plugins {
        id 'com.android.application'
        // Add the Google services Gradle plugin
        id 'com.google.gms.google-services'
    }
    dependencies {
        // ...
        // Import the Firebase BoM
        implementation platform('com.google.firebase:firebase-bom:28.4.1')
        // Declare FCM dependency
        // When using BoM, do not specify versions in Firebase library dependencies
        implementation 'com.google.firebase:firebase-messaging'
    }
    ```

    In your `/build.gradle` file, configure the following:

    ```java
    plugins {
      // ...
      // Add the dependency for the Google services Gradle plugin
      id 'com.google.gms.google-services' version '4.3.15' apply false
    }
    ```

    For Gradle 5.0 and above, BoM is automatically enabled; for versions prior to Gradle 5.0, you need to enable it. For details, see [Firebase Android BoM](https://firebase.google.en/docs/android/learn-more#bom) and [Firebase Android SDK Release Notes](https://firebase.google.en/support/release-notes/android).

1. Sync your project with gradle files, extend `FirebaseMessagingService`, and register it in the `AndroidManifest.xml` file of your project:

    ```java
    public class FCMMSGService extends FirebaseMessagingService {
    private static final String TAG = "FCMMSGService";

        @Override
        public void onMessageReceived(RemoteMessage remoteMessage) {
            super.onMessageReceived(remoteMessage);
            if (remoteMessage.getData().size() > 0) {
                String message = remoteMessage.getData().get("alert");
                Log.d(TAG, "onMessageReceived: " + message);
     }
        }

        @Override
        public void onNewToken(@NonNull String token) {
            great . onNewToken(token);
            Log.d(TAG, "onNewToken: " + token);
            ChatClient.getInstance().sendFCMTokenToServer(token);
        }
    }
    ```

    ```xml





    ```

1. Initialize the Chat SDK and enable FCM:

    ```java
    ChatOptions options = new ChatOptions();
    ...
    PushConfig.Builder builder = new PushConfig.Builder(this);
    // Replace with your FCM Sender ID.
    builder.enableFCM("Your FCM sender id");
    // Configure push settings in the ChatOptions class.
    options.setPushConfig(builder.build());
    // Initialize the IM SDK.
    ChatClient.getInstance().init(this, options);
    // Set up push monitoring.
    PushHelper.getInstance().setPushListener(new PushListener() {
        @Override
        public void onError(PushType pushType, long errorCode) {
            EMLog.e("PushClient", "Push client occur a error: " + pushType + " - " + errorCode);
        }
        @Override
        public boolean isSupportPush(PushType pushType, PushConfig pushConfig) {
            // Set whether to enable FCM.
            if(pushType == PushType.FCM) {
                return GoogleApiAvailabilityLight.getInstance().isGooglePlayServicesAvailable(MainActivity.this)
                            == ConnectionResult.SUCCESS;
            }
            return super.isSupportPush(pushType, pushConfig);
        }
    });
    ```

1. Pass the FCM device token to the server.

    When the app is initialized, the FCM SDK generates a unique registration token for the client app on the user's device. Since FCM uses this token to determine which device to send the push message to, the Agora server needs to obtain the client app's registration token before sending the notification request to FCM. FCM then verifies the registration token and sends the notification message to the Android device. It is recommended to place this code on the main page after successfully logging into Chat.

    ```java
    // Check if FCM is enabled.
    if(GoogleApiAvailabilityLight.getInstance().isGooglePlayServicesAvailable(MainActivity.this) != ConnectionResult.SUCCESS) {
        return;
    }
    FirebaseMessaging.getInstance().getToken().addOnCompleteListener(new OnCompleteListener() {
        @Override
        public void onComplete(@NonNull Task task) {
            if (!task.isSuccessful()) {
                EMLog.d("PushClient", "Fetching FCM registration token failed:"+task.getException());
                return;
            }
            // Get the FCM registration token, i.e., the device token.
            String token = task.getResult();
            EMLog.d("FCM", token);
            ChatClient.getInstance().sendFCMTokenToServer(token);
        }
    });
    ```

1. Monitor device token generation.

    After the FCM SDK successfully generates a registration token (device token), it will be passed to the `onNewToken` callback.

    Rewrite the `onNewToken` callback in `FirebaseMessagingService`. After the device token is generated, this callback will promptly update the new token to the Chat SDK.

    ```java
    @Override
    public  void onNewToken( @NonNull  String token) {
        Log.i("MessagingService", "onNewToken: " + token);
        // To send messages to the app or manage app subscriptions on the server, you need to send the FCM registration token to your App Server.
        if(ChatClient.getInstance().isSdkInited()) {
            ChatClient.getInstance().sendFCMTokenToServer(token);
        }
    }
    ```

## Test FCM push

After integrating and enabling FCM, you can test whether the push feature is successfully integrated.

Make sure your test device meets the following conditions:

- Uses foreign IP addresses to establish connections.
- Supports Google GMS services (Google Mobile Services).
- Can access Google network services; otherwise, the device won't be able to receive push notifications from the FCM service.

For more reliable testing, use a physical device.

### Test push notifications

1. Log in to the app on your device and confirm that the device token is successfully bound.

    You can check the log or call [RESTful API for getting user details](..//en/api-reference/api-ref/im/user-system-registration#querying-a-user) to confirm whether the device token is successfully bound. If successful, there will be a `pushInfo` field under the `entities` field, and `pushInfo` will have relevant information such as `device_Id`, `device_token`, `notifier_name`, and others.

1. Enable app notification bar permissions.

1. Kill the application process.

1. Send a test message in the [Agora Console](https://console.agora.io/v2).

    Select **Operation Management** > **User** in the left navigation bar. On the **Users** page, select **Send Admin Message** in the **Action** column for the corresponding user ID. In the dialog box that pops up, select the message type, enter the message content, and then click **Send** .

   :::info
In the **Push Certificate** page, in the **Action** column of each certificate, click **More** and **Test** will appear. This is to directly call the third-party interface to push. The message sending test in the **Users** page first calls the Chat message sending interface and then the third-party interface when the conditions are met (that is, the user is offline, the push certificate is valid and bound to the device token).
:::

1. Check your device to see if it has received the push notification.

### Troubleshooting

In case of issues, take the following steps:

1. Check whether FCM push is correctly integrated or enabled:

    Select **Operation Management** > **User** in the left navigation bar. On the **User Management** page, select **Push Certificate** in the **Action** column for the corresponding user ID. In the pop-up box, check whether the certificate name and device token are displayed correctly.
1. Check whether the correct FCM certificate is uploaded in the [Agora Console](https://console.agora.io/v2).
1. Check whether the message is pushed in the chat room. The chat room does not support offline message push.
1. Check if the device supports GMS.
1. Check whether online-only delivery is enabled (`deliverOnlineOnly` = `true`). Messages set to be delivered only when the receiver is online will not be pushed.

### iOS

## Integrate APNs push

This section guides you through how to integrate APNs with Chat. To integrate APNs into Chat, follow these steps:

### 1. Create a push certificate on the Apple Developer Platform

APNs supports p8 and p12 certificates. The Agora server needs your APNs certificate to communicate with APNs and send push notifications to the client.

The following steps describe how to create a p12 certificate on [Apple's developer platform](https://developer.apple.com/):

1. Apply for the Certificate Signing Request (CSR) file.
1. Open the Keychain Access app on your device and select **Keychain Access** > **Certificate Assistant** > **Request a Certificate from a Certificate Authority**.
1. In the **Certificate Assistant** dialog box, fill in the **User Email Address** and **Common Name**, select **Saved to disk** for **Request is**, click **Continue**, and add a storage path to save the file.

    ![push_apns_ca](/images/im/push_apns_ca.png)

1. The CSR file `CertificateSigningRequest.certSigningRequest` is generated under the storage path.

### 2. Create an App ID

1. Log in to [iOS Developer Center](https://developer.apple.com/cn/)，choose **Account** > **Certificates, Identifiers & Profiles** > **Identifiers**.
1. On the **Identifiers** tab, click the **+** icon to the right of **Identifiers**.
1. On the **Register a new identifier** page, select **App IDs** and click **Continue**.
1. For **Select a type**, select **App** and click **Continue**.
1. On the **Register an App ID** page, configure the following fields:
   - **Description**: Description of the App ID.
   - **Bundle ID**: Can be set to **com.YourCompany.YourProjectName**.
   - **Capabilities**: Choose **Push Notification**.
1. Make sure the information is correct and click **Register**.

### 3. Create push notification certificates

Create certificates for development and production environments, respectively:

1. On the **Identifiers** tab, select the App ID created in the previous step.
1. On the **Edit your App ID Configuration** page, find **Push Notifications** and click **Configure**.
1. In the **Apple Push Notification service SSL Certificates** dialog box, click **Create Certificate** to create a push certificate for development or production environments.
1. On the **Create a New Certificate** page, select **iOS** as the **Platform**, upload the CSR file created in step 1, and click **Continue**.
1. On the **Download Your Certificate** page, click **Download** to generate the [APNs](https://help.apple.com/xcode/mac/current/?spm=a2c4g.11186623.0.0.14864088B1zf4p#/dev80c6204ec) certificate.

### 4. Generate the push certificate

 1. Double-click to import the push certificate created in Keychain in previous steps.
 1. Open **Keychain Access** , select **login** > **Certificates**, find the imported certificate, right-click and select the certificate to export as a `.p12` file, and set the certificate key.

### 5. Generate the Provisioning Profile file

1. Open [iOS Developer Center](https://developer.apple.com/cn/)，select **Account** > **Certificates, Identifiers & Profiles** > **Profiles*.
1. On the **Provisioning** tab, click the **+** icon to the right of **Profiles**.
1. On the **Register a New Provisioning Profile** page, select **iOS App Development** for **Development**, select **Ad Hoc** for **Distribution**, and click **Continue**.
    For the official version on the App Store, select **App Store** for **Distribution**.
1. On the **Generate a Provisioning Profile** page, configure the following fields:
   -  **App ID**: Enter the App ID created in step 2.
   -  **Select Certificates**: Select the `.p12` file generated in step 4.
   -  **Select Devices**: Select the device to be developed.
   -  **Provisioning Profile Name**: Enter the Provisioning Profile file name.
1. Confirm the information and click **Download** to generate the Provisioning Profile file.

### 6. Upload the APNs certificate in the [Agora Console](https://console.agora.io/v2)

After successfully logging in to the Chat SDK, you can configure the push policy for multi-device login use-cases and upload the APNs push certificate in [Agora Console](https://console.agora.io/v2).

1. Log in to [Agora Console](https://console.agora.io/v2) and click **Project Management** in the left navigation bar.
1. On the **Project Management** page, click **Config** in the **Action** column for the project that has Chat enabled.
1. On the **Edit Project** page, in the **Features** area, click **Enable/Config** for **Chat**.
1. On the project configuration page, select **Features** > **Push Certificate**.
1. On the Push Certificate page, click **Add Push Certificate**. In the dialog box that pops up, select the **Apple** tab and configure the fields.

    :::info
    If you use FCM push, select the **Google** tab and configure the FCM push parameters.
    :::

    ![push_apns_add_certificate](/images/im/push_apns_add_certificate.png)

| Parameter        | Type    | Required (Yes/No) | Description         |
| :--------- | :----- | :------- | :----------------------- |
|  **Certificate Type**  |   | Yes | Message push certificate type, currently supports **p8** and **p12**.  |
|  **Certificate Name**       | String   | Yes | The name of the message push certificate. Enter the name of the message push certificate. |
|  **Push Key**       | String   | Yes | Message push certificate key. Fill in the certificate key set when exporting the message push certificate file. Configure this parameter only when using a p12 certificate.   |
|  **Upload Certificate**       | File   | Yes | Click **Upload** to upload the message push certificate file. |
|  **Key ID**       | String   | Yes | Enter the Key ID of the push certificate. Configure this parameter only when using a p8 certificate.   |
|  **TeamID **       | String   | Yes | Enter the Team ID of the push certificate. Configure this parameter only when using a p8 certificate.   |
|  **Integration Environment**       |  | Yes | Integration environment:  - **Development**: Development environment;  - **Production**: Production environment. |
|  **Bundle ID**       | String   | Yes | The bundle ID. The bundle ID set when creating the App ID. |
|  **sound**       | String   | No | The ringtone alert when the receiver receives the push notification. |

### 7. Integrate APNs on the client

1. Open Xcode and select **Targets** > **Capability** > **Push Notifications** to enable push notification permission.

1. Pass the certificate name to the SDK:

```objective-c
#import

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    // Apply for notification permission
    UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
        [center requestAuthorizationWithOptions:(UNAuthorizationOptionBadge | UNAuthorizationOptionSound | UNAuthorizationOptionAlert) completionHandler:^(BOOL granted, NSError * _Nullable error) {
            if (granted) {
                NSLog(@"request authorization succeed");
            }
        }];

    // Register push
    [application registerForRemoteNotifications];

    // Initialize options and set App Key
    AgoraChatOptions *options = [AgoraChatOptions optionsWithAppkey:@"XXXX#XXXX"];

    // Fill in the name you set when uploading the certificate. Make sure the certificate name you set here is consistent with the certificate name you filled in on Agora Console.
    options.apnsCertName = @"PushCertName";

    [AgoraChatClient.sharedClient initializeSDKWithOptions:options];

    return YES;
}
```

1. Get the device token and pass it to the server.

After the device token is registered, the iOS system will call back the device token to you in the following way. Pass the device token to the SDK.

```objective-c
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
    [AgoraChatClient.sharedClient registerForRemoteNotificationsWithDeviceToken:deviceToken completion:^(AgoraChatError *aError) {
        if (aError) {
            NSLog(@"bind deviceToken error: %@", aError.errorDescription);
        }
    }];
}
- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error {
    NSLog(@"Register Remote Notifications Failed");
}
```

## Test APNs push

After integrating and enabling FCM, you can test whether the push feature is successfully integrated.

Make sure your test device is a non-jail-broken iOS device. For more reliable testing, use a physical device.

### Test push notifications

1. Log in to the app on your device and confirm that the device token is successfully bound.

    You can check the log or call [RESTful API for getting user details](..//en/api-reference/api-ref/im/user-system-registration#querying-a-user) to confirm whether the device token is successfully bound. If successful, there will be a `pushInfo` field under the `entities` field, and `pushInfo` will have relevant information such as `device_Id`, `device_token`, `notifier_name`, and others.

1. Enable app notification bar permissions.

1. Kill the application process.

1. Send a test message in the [Agora Console](https://console.agora.io/v2).

    Select **Operation Management** > **User** in the left navigation bar. On the **Users** page, select **Send Admin Message** in the **Action** column for the corresponding user ID. In the dialog box that pops up, select the message type, enter the message content, and then click **Send** .

   :::info
In the **Push Certificate** page, in the **Action** column of each certificate, click **More** and **Test** will appear. This is to directly call the third-party interface to push. The message sending test in the **Users** page first calls the Chat message sending interface and then the third-party interface when the conditions are met (that is, the user is offline, the push certificate is valid and bound to the device token).
:::

1. Check your device to see if it has received the push notification.

### Troubleshooting

In case of issues, take the following steps:

1. Check whether APNs push is correctly integrated or enabled:

    Select **Operation Management** > **User** in the left navigation bar. On the **User Management** page, select **Push Certificate** in the **Action** column for the corresponding user ID. In the pop-up box, check whether the certificate name and device token are displayed correctly.

1. Check whether the correct APNs certificate has been uploaded in [Agora Console](https://console.agora.io/v2) and the correct certificate environment has been set.
1. Check whether the message was pushed in the chat room. Chat rooms do not support offline message push.
1. Check whether online-only delivery is enabled (`AgoraChatMessage#deliverOnlineOnly = YES`). Messages set to be delivered only when the receiver is online will not be pushed.

### Flutter

## Integrate FCM push

This section guides you through how to integrate FCM with Chat.

### 1. Create a project in Firebase

1. Log in to the [Firebase console](https://console.firebase.google.com/) and click **Add project**.

1. In the **Create a project** page, enter a project name, and click **Create project**.

    Note: You can toggle off Enable Google Analytics for this project if this option is not needed.

1. After the project is ready, click **Continue** to redirect to the project page. Then click the **Flutter** icon and follow the **Firebase CLI** to set your project.

1. In the **Project settings** page, perform the following operations:

    - For Android apps, find the **Android apps** in **Your apps**, and set your Android app according to the [SDK instructions](#1-create-a-project-in-firebase).

    - For iOS apps, find the **Apple apps** in **Your apps**, and set your Apple app according to the [SDK instructions](#1-create-push-certificates).

1. In the project page, click the project you have created.

1. Query the sender ID. On the **Project settings** page, select the **Cloud Messaging** tab and view **Sender ID**. When uploading the FCM certificate to Agora Console, set the certificate name to the FCM sender ID.

    ![push_fcm_senderid.png](/images/im/push_fcm_senderid.png)

1. On the **Project settings** page, select the **Service accounts** tab and click **Generate new private key** to generate a JSON file. Save this file and upload it to Agora Console when using the V1 certificate.

    ![push_fcm_private_key](/images/im/push_fcm_private_key.png)

### 2. Upload FCM certificate to Agora Console

After successfully logging into Chat, you can upload the FCM push certificate to Agora Console:

1. Log in to [Agora Console](https://console.agora.io/v2), and click **Project Management** in the left navigation bar.

1. On the **Project Management** page, locate the project that has Chat enabled and click **Config**.

1. On the project edit page, click **Config** next to **Chat**.

1. On the project config page, select **Features** > **Push Certificate** and click **Add Push Certificate**.

1. In the pop-up window, select the **Google** tab, and configure the following fields:

    ![push_fcm_add_certificate](/images/im/push_fcm_add_certificate.png)

    | Parameter  | Type   | Required | Description              |
    | :--------- | :----- | :------- | :----------------------- |
    | **Certificate Type** | | No | Select whether to use a V1 certificate or a legacy certificate. **V1**: Recommended. You need to configure a **Private Key**. **Legacy**: Will soon be deprecated. You need to configure a **Push Key**.|
    | **Private Key** | file | Yes | Click **Generate new private key** on the **Project settings** > **Service accounts** page of the [Firebase Console](https://console.firebase.google.com) to generate the `.json` file, then upload it to Agora Console. |
    | **Push Key** | String | Yes | FCM Server Key. Obtain the server key in the **Cloud Messaging API (Legacy)** area of the **Project settings** > **Cloud Messaging** page of the [Firebase Console](https://console.firebase.google.com).   **This parameter is only valid for legacy certificates.**|
    | **Certificate Name** | String | Yes | The sender ID configured for the FCM. For the new version of the certificate, you can find the sender ID on the **Project settings** > **Cloud Messaging** page of the [Firebase Console](https://console.firebase.google.com). For legacy certificates, go to the ***Project settings > Cloud Messaging** page of the [Firebase Console](https://console.firebase.google.com), and get the sender ID in the **Cloud  Messaging API (Legacy)** area.  The certificate name is the only condition used by the Agora server to determine which push channel the target device uses, so ensure that the sender set when integrating FCM in Chat is consistent with what is set here. |
    | **Sound** | String | No | The ringtone flag for when the receiver gets the push notification. |
    | **Push Priority** | | No| Message delivery priority. See [Setting the priority of a message](https://firebase.google.cn/docs/cloud-messaging/concept-options#setting-the-priority-of-a-message). |
    | **Push Msg Type** | | No| The type of the message sent to the client through FCM. See [Message types](https://firebase.google.com/docs/cloud-messaging/concept-options#notifications_and_data_messages): **Data**: Data message, processed by the client application. **Notification**: Notification message, automatically processed by FCM SDK. **Both**: Notification messages and data messages can be sent through the FCM client. |

#### Switch from legacy to the V1 certificate

The legacy HTTP or XMPP API is being retired on June 20, 2024. In view of this, switch to the latest FCM API (HTTP v1) version of the certificate as soon as possible. See [Firebase Console](https://console.firebase.google.com) for details.

Make sure that the uploaded V1 certificate is available, as the legacy one will be deleted upon upload. If the new certificate is not available, the push will fail.

Take the following steps to switch from the old to the new certificate:

1. Click **Edit** in the **Action** column of the old certificate on the **Push Certificate** page.

    ![push_fcm_oldcertificate_edit](/images/im/push_fcm_oldcertificate_edit.png)

1. In the **Google** tab of the **Edit Push Certificate** window, switch the **Certificate Type** to **V1**.

    ![push_fcm_oldcertificate_switch](/images/im/push_fcm_oldcertificate_switch.png)

1. Click **Upload** to upload the locally saved V1 certificate file (.json).

    ![push_fcm_newcertificate_upload](/images/im/push_fcm_newcertificate_upload.png)

1. Click **OK** to complete the switch.

### 3. Integrate FCM on the client

Take the following steps to integrate FCM on the client.

1. Install `firebase_core`: Execute `flutter pub add firebase_core` in the project root directory.
1. Install `firebase_messaging`: Execute `flutter pub add firebase_messaging` in the project root directory.

**For Android**

In your flutter project's `Android/build.gradle` file, check the `google-services` version and make sure it is 4.3.14 or above.

```dart
dependencies {
    // START: FlutterFire Configuration
    classpath 'com.google.gms:google-services:4.3.15'
    // END: FlutterFire Configuration
}
```

**For iOS**

Before your app can start receiving messages, enable push notifications and background modes in your Xcode project.

1. Open the Xcode project workspace (`ios/Runner.xcworkspace`).
1. [Enable push notifications](https://help.apple.com/xcode/mac/current/#/devdfd3d04a1).
1. Enable background fetching and remote notifications [background execution modes](https://developer.apple.com/documentation/xcode/configuring-background-execution-modes).

#### SDK integration

1. Initialize the Chat SDK and enable FCM:

    ```dart
    void main() async {
      WidgetsFlutterBinding.ensureInitialized();
      // Replace with your Appkey.
      var options = ChatOptions(appKey: "Your Appkey", autoLogin: false);
      // Replace with your FCM Sender ID.
      options.enableFCM("Your FCM sender id");
      // Initialize the IM SDK.
      await ChatClient.getInstance.init(options);
      // Initialize FCM SDK.
      await Firebase.initializeApp(
        options: DefaultFirebaseOptions.currentPlatform,
      );
      runApp(const MyApp());
    }
    ```

1. Pass the FCM device token to the server.

    When the app is initialized, the FCM SDK generates a unique registration token for the client app on the user's device. Since FCM uses this token to determine which device to send the push message to, the Agora server needs to obtain the client app's registration token before sending the notification request to FCM. FCM then verifies the registration token and sends the notification message to the device.

    ```dart
    // Request push permission
    await FirebaseMessaging.instance.requestPermission();
    FirebaseMessaging.instance.onTokenRefresh.listen((event) async {
        debugPrint('onTokenRefresh: $event');
        await ChatClient.getInstance.pushManager.updateFCMPushToken(event);
    });
    // Get the token and upload it to instant communication.
    final fcmToken = await FirebaseMessaging.instance.getToken();
    if (fcmToken != null) {
      debugPrint('fcmToken: $fcmToken');
      await ChatClient.getInstance.pushManager.updateFCMPushToken(fcmToken);
    } else {
      debugPrint('fcmToken is null');
    }
    ```

## Test FCM push

After integrating and enabling FCM, you can test whether the push feature is successfully integrated.

Make sure your test device meets the following conditions:

- Uses foreign IP addresses to establish connections.
- Supports Google GMS services (Google Mobile Services).
- Can access Google network services; otherwise, the device won't be able to receive push notifications from the FCM service.

For more reliable testing, use a physical device.

### Test push notifications

1. Log in to the app on your device and confirm that the device token is successfully bound.

    You can check the log or call [RESTful API for getting user details](..//en/api-reference/api-ref/im/user-system-registration#querying-a-user) to confirm whether the device token is successfully bound. If successful, there will be a `pushInfo` field under the `entities` field, and `pushInfo` will have relevant information such as `device_Id`, `device_token`, `notifier_name`, and others.

1. Enable app notification bar permissions.

1. Kill the application process.

1. Send a test message in the [Agora Console](https://console.agora.io/v2).

    Select **Operation Management** > **User** in the left navigation bar. On the **Users** page, select **Send Admin Message** in the **Action** column for the corresponding user ID. In the dialog box that pops up, select the message type, enter the message content, and then click **Send** .

   :::info
In the **Push Certificate** page, in the **Action** column of each certificate, click **More** and **Test** will appear. This is to directly call the third-party interface to push. The message sending test in the **Users** page first calls the Chat message sending interface and then the third-party interface when the conditions are met (that is, the user is offline, the push certificate is valid and bound to the device token).
:::

1. Check your device to see if it has received the push notification.

### Troubleshooting

In case of issues, take the following steps:

1. Check whether FCM push is correctly integrated or enabled:

    Select **Operation Management** > **User** in the left navigation bar. On the **User Management** page, select **Push Certificate** in the **Action** column for the corresponding user ID. In the pop-up box, check whether the certificate name and device token are displayed correctly.
1. Check whether the correct FCM certificate is uploaded in the [Agora Console](https://console.agora.io/v2).
1. Check whether the message is pushed in the chat room. The chat room does not support offline message push.
1. Check if the device supports GMS.
1. Check whether online-only delivery is enabled (`deliverOnlineOnly` = `true`). Messages set to be delivered only when the receiver is online will not be pushed.

### React Native

## Integrate FCM push

This section guides you through how to integrate FCM with Chat.

### 1. Create a project in Firebase

1. Log in to [Firebase console](https://console.firebase.google.com/), and click **Add project**.

1. On the **Create a project** page, enter a project name, and proceed with prompts.

1. Query the sender ID. On the **Project settings** page, select the **Cloud Messaging** tab and view **Sender ID**. When uploading the FCM certificate to Agora Console, set the certificate name to the FCM sender ID.

    ![push_fcm_senderid.png](/images/im/push_fcm_senderid.png)

1. On the **Project settings** page, select the **Service accounts** tab and click **Generate new private key** to generate a JSON file. Save this file and upload it to Agora Console when using the V1 certificate.

    ![push_fcm_private_key](/images/im/push_fcm_private_key.png)

1. After the project is created, add an `iOS` application or an `Android` application according to the following steps:

- Add an `iOS` app:
   1. The package name is the same as that of the `iOS` app;
   2. Once created, move the downloaded `GoogleService-Info.plist` file to the root directory of the `Xcode` project, and add it to all targets;
   3. Upload the `APNs` certificate on the Cloud Messaging page.

- Add an `Android` app:
   1. The package name is the same as that of the `Android` app;
   2. Once created, move the downloaded `google-services.json` file to your module (application level) root directory.

For detailed FCM configurations, you can see the [React Native Firebase document](https://rnfirebase.io/).

### 2. Upload FCM certificate to Agora Console

After successfully logging into Chat, you can upload the FCM push certificate to Agora Console:

1. Log in to [Agora Console](https://console.agora.io/v2), and click **Project Management** in the left navigation bar.

1. On the **Project Management** page, locate the project that has Chat enabled and click **Config**.

1. On the project edit page, click **Config** next to **Chat**.

1. On the project config page, select **Features** > **Push Certificate** and click **Add Push Certificate**.

1. In the pop-up window, select the **Google** tab, and configure the following fields:

    ![push_fcm_add_certificate](/images/im/push_fcm_add_certificate.png)

    | Parameter  | Type   | Required | Description              |
    | :--------- | :----- | :------- | :----------------------- |
    | **Certificate Type** | | No | Select whether to use a V1 certificate or a legacy certificate. **V1**: Recommended. You need to configure a **Private Key**. **Legacy**: Will soon be deprecated. You need to configure a **Push Key**.|
    | **Private Key** | file | Yes | Click **Generate new private key** on the **Project settings** > **Service accounts** page of the [Firebase Console](https://console.firebase.google.com) to generate the `.json` file, then upload it to Agora Console. |
    | **Push Key** | String | Yes | FCM Server Key. Obtain the server key in the **Cloud Messaging API (Legacy)** area of the **Project settings** > **Cloud Messaging** page of the [Firebase Console](https://console.firebase.google.com).   **This parameter is only valid for legacy certificates.**|
    | **Certificate Name** | String | Yes | The sender ID configured for the FCM. For the new version of the certificate, you can find the sender ID on the **Project settings** > **Cloud Messaging** page of the [Firebase Console](https://console.firebase.google.com). For legacy certificates, go to the ***Project settings > Cloud Messaging** page of the [Firebase Console](https://console.firebase.google.com), and get the sender ID in the **Cloud  Messaging API (Legacy)** area.  The certificate name is the only condition used by the Agora server to determine which push channel the target device uses, so ensure that the sender set when integrating FCM in Chat is consistent with what is set here. |
    | **Sound** | String | No | The ringtone flag for when the receiver gets the push notification. |
    | **Push Priority** | | No| Message delivery priority. See [Setting the priority of a message](https://firebase.google.cn/docs/cloud-messaging/concept-options#setting-the-priority-of-a-message). |
    | **Push Msg Type** | | No| The type of the message sent to the client through FCM. See [Message types](https://firebase.google.com/docs/cloud-messaging/concept-options#notifications_and_data_messages): **Data**: Data message, processed by the client application. **Notification**: Notification message, automatically processed by FCM SDK. **Both**: Notification messages and data messages can be sent through the FCM client. |

#### Switch from legacy to the V1 certificate

The legacy HTTP or XMPP API is being retired on June 20, 2024. In view of this, switch to the latest FCM API (HTTP v1) version of the certificate as soon as possible. See [Firebase Console](https://console.firebase.google.com) for details.

Make sure that the uploaded V1 certificate is available, as the legacy one will be deleted upon upload. If the new certificate is not available, the push will fail.

Take the following steps to switch from the old to the new certificate:

1. Click **Edit** in the **Action** column of the old certificate on the **Push Certificate** page.

    ![push_fcm_oldcertificate_edit](/images/im/push_fcm_oldcertificate_edit.png)

1. In the **Google** tab of the **Edit Push Certificate** window, switch the **Certificate Type** to **V1**.

    ![push_fcm_oldcertificate_switch](/images/im/push_fcm_oldcertificate_switch.png)

1. Click **Upload** to upload the locally saved V1 certificate file (.json).

    ![push_fcm_newcertificate_upload](/images/im/push_fcm_newcertificate_upload.png)

1. Click **OK** to complete the switch.

### 3. Integrate FCM on the client

Take the following steps to integrate FCM on the client:

1. Add dependencies:

    ```sh
    yarn add @react-native-firebase/app @react-native-firebase/messaging react-native-agora-chat
    ```

1. Add native platform configuration:

    **Android**

    1. Download the `google-services.json` file and put it in the following path in your project: `/android/app/google - services.json`.
    1. In your `/android/build.gradle` file, add the google-services plugin as a dependency:

        ```groovy
        buildscript {
          dependencies {
            classpath 'com.google.gms:google-services:4.3.15'
          }
        }
        ```

    1. Add the google-services plugin to the `/android/app/build.gradle` file and execute the plugin:

        ```groovy
        apply plugin: 'com.google.gms.google-services' //  true
          pod 'FirebaseCore', :modular_headers => true
        end
        ```

    1. Run the `pod install` command in the `ios` directory to install dependencies.

    1. Open the `/ios/{projectName}.xcworkspace` file in Xcode.

    1. Right-click the project name, select **Add files** , then select the downloaded `GoogleService-Info.plist` file from your local computer, and make sure to select **Copy items if needed**.

    1. To do this, open the `/ios/{projectName}/AppDelegate.mm` file (`AppDelegate.m` in earlier versions of React Native).

    1. At the top of the file, import the Firebase SDK after **#import "AppDelegate.h"**.

        ```objective-c
        #import
        ```

    1. In the `didFinishLaunchingWithOptions` method, add the following code at the top:

        ```objective-c
        - (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
          [FIRApp configure];
        }
        ```

#### FCM push code implementation

1. Set up message notifications:

    ```typescript
    React.useEffect(() => {
      const sub1 = messaging().onMessage(async (remoteMessage) => {
        // Process offline message notifications, such as printing logs and displaying messages.
        console.log("A new FCM message arrived!", JSON.stringify(remoteMessage));
      });
      return sub1;
    }, []);
    ```

1. Initialize the Chat SDK:

    ```typescript
    // Get the device token.
    fcmToken.current = await messaging().getToken();
    // Push settings.
    const pushConfig = new ChatPushConfig({
      deviceId: senderId,
      deviceToken: fcmToken.current,
    });
    // Configure push settings in the ChatOptions class.
    let o = new ChatOptions({
      autoLogin: false ,
      appKey: appKey,
      pushConfig: pushConfig,
    });
    // Execute settings and initialize the IM SDK.
    ChatClient.getInstance()
      . heat ( o )
      .then(() => {
        // Initialization successful.
      })
      .catch((error) => {
        // Initialization failed and error message is returned.
      });
    ```

1. Log in to the server:

    ```typescript
    // Log in to the server using user ID and token.
    ChatClient.getInstance()
      .loginWithAgoraToken(username, token)
      .then(() => {
        // Login successful.
      })
      .catch((reason) => {
        // Login failed, return error message.
      });
    ```

1. Send the device token to the server:

    ```typescript
    // Send device token to the server.
    ChatClient.getInstance()
      .updatePushConfig(
        new ChatPushConfig({ deviceId: senderId, deviceToken: fcmToken.current })
      )
      .then(() => {
        // Sent successfully.
      })
      .catch((reason) => {
        // Sending failed, returning error information.
      });
    ```

## Test FCM push

After integrating and enabling FCM, you can test whether the push feature is successfully integrated.

Make sure your test device meets the following conditions:

- Uses foreign IP addresses to establish connections.
- Supports Google GMS services (Google Mobile Services).
- Can access Google network services; otherwise, the device won't be able to receive push notifications from the FCM service.

For more reliable testing, use a physical device.

### Test push notifications

1. Log in to the app on your device and confirm that the device token is successfully bound.

    You can check the log or call [RESTful API for getting user details](..//en/api-reference/api-ref/im/user-system-registration#querying-a-user) to confirm whether the device token is successfully bound. If successful, there will be a `pushInfo` field under the `entities` field, and `pushInfo` will have relevant information such as `device_Id`, `device_token`, `notifier_name`, and others.

1. Enable app notification bar permissions.

1. Kill the application process.

1. Send a test message in the [Agora Console](https://console.agora.io/v2).

    Select **Operation Management** > **User** in the left navigation bar. On the **Users** page, select **Send Admin Message** in the **Action** column for the corresponding user ID. In the dialog box that pops up, select the message type, enter the message content, and then click **Send** .

   :::info
In the **Push Certificate** page, in the **Action** column of each certificate, click **More** and **Test** will appear. This is to directly call the third-party interface to push. The message sending test in the **Users** page first calls the Chat message sending interface and then the third-party interface when the conditions are met (that is, the user is offline, the push certificate is valid and bound to the device token).
:::

1. Check your device to see if it has received the push notification.

### Troubleshooting

In case of issues, take the following steps:

1. Check whether FCM push is correctly integrated or enabled:

    Select **Operation Management** > **User** in the left navigation bar. On the **User Management** page, select **Push Certificate** in the **Action** column for the corresponding user ID. In the pop-up box, check whether the certificate name and device token are displayed correctly.
1. Check whether the correct FCM certificate is uploaded in the [Agora Console](https://console.agora.io/v2).
1. Check whether the message is pushed in the chat room. The chat room does not support offline message push.
1. Check if the device supports GMS.
