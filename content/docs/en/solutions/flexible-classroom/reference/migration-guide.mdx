---
title: "Migration guide"
description: "Upgrade to the latest version of Flexible Classroom."
---
This page shows you how to upgrade to the latest version of Flexible Classroom.

## Android

### Migrate from v1.1.5 to v2.1.0

In v2.1.0, Agora fully optimizes the internal architecture of the Agora Classroom SDK and refactors the Agora Edu Context APIs.

This section lists the major changes of the Edu Context API between v2.1.0 and v1.1.5.

#### Chat context

Remove `ChatContext` and `IChatHandler`.

#### Whiteboard context

Remove `WhiteboardContext` and `IWhiteboardHandler`. In v2.1.0, the whiteboard feature is implemented in `AgoraUIKit`.

#### Device context

Remove `DeviceContext` and `IDeviceHandler`. Use methods and callbacks in `MediaContext` and `IMediaHandler` instead, as follows:

- Remove `getDeviceConfig`. Use `getLocalDeviceState` instead.
- Remove `setCameraDeviceEnable`, `switchCameraFacing`, `setMicDeviceEnable`, and `setSpeakerEnable`. Use `openSystemDevice` and `closeSystemDevice` instead.
- Remove `setDeviceLifecycle`. In v2.1.0, the SDK does not maintain the device state.
- Remove `onCameraDeviceEnableChanged`, `onCameraFacingChanged`, `onMicDeviceEnabledChanged`, and `onSpeakerEnabledChanged`. Use `onLocalDeviceStateUpdated` instead.
- Remove `onDeviceTips`.

#### Hands-up context

Remove `HandsUpContext` and `IHandsUpHandler`. Use methods and callbacks in `UserContext` and `IUserHandler` instead, as follows:

- Remove `performHandsUp`. Use `handsWave` and `handsDown` instead.
- Remove `onHandsUpEnabled`. Use `onHandsWaveEnabled` instead.
- Remove `onHandsUpStateUpdated` and `onHandsUpStateResultUpdated`. Use `onUserHandsWave` and `onUserHandsDown` instead.
- Remove `onHandsUpTips`.

#### Room context

- Remove `roomInfo`. Use `getRoomInfo` instead.
- Remove `leave`. Use `leaveRoom` instead.
- Move `uploadLog` to `MonitorContext`.
- Remove `updateFlexRoomProps`. Use `updateRoomProperties` and `deleteRoomProperties` instead.
- Rename `joinClassroom` as `joinRoom`.
- Remove `onClassroomName`. You can call `getRoomInfo` to get the room name.
- Rename `onClassState` as `onClassStateUpdated`.
- Remove `onClassTime`.
- Remove `onNetworkStateChanged`. Use `onLocalNetworkQualityUpdated` in `IMonitorHandler` instead.
- Remove `onLogUploaded`. You can get the log `serailNumber` with the callback function in the `uploadLog` method in `MonitorContext`.
- Remove `onConnectionStateChanged`. Use `onLocalConnectionUpdated` in `IMonitorHandler` instead.
- Remove `onClassTip`.
- Remove `onFlexRoomPropsInitialized`. To get room custom properties after joining the room, you can call `getRoomProperties`.
- Remove `onFlexRoomPropsChanged`. Use `onRoomPropertiesUpdated` and `onRoomPropertiesDeleted` instead.
- Remove `onError`.
- Remove `onClassroomJoinSuccess` and `onClassroomJoinFail`. Use `callback` in `joinRoom` instead.
- Remove `onClassroomLeft`. Use `onRoomClosed` instead.

#### Screen-sharing context

- Remove `ScreenShareContext`. Use `StreamContext` instead. When `videoSourceType` in `AgoraEduContextStreamInfo` is `Screen`, you can regard this stream as a screen-sharing video stream.
- Remove `IScreenShareHandler`. Use `IStreamHandler` instead. Remove `onUpdateScreenShareState`. Use `onStreamJoined`, `onStreamLeft`, and `onStreamUpdated` in `IStreamHandler` instead.

#### User context

- Remove `localUserInfo`. Use `getLocalUserInfo` instead.
- Remove `muteVideo` and `muteAudio`. Use `muteStreams` in `StreamContext` instead.
- Remove `renderVideo`. Use `startRenderLocalVideo` and `startRenderRemoteVideo` in `MediaContext` instead.
- Remove `updateFlexUserProps`. Use `updateUserProperties` and `deleteUserProperties` instead.
- Remove `setVideoEncoderConfig`. Use `setLocalVideoConfig` in `StreamContext` instead.
- Remove `onUserListUpdated`. Use `getAllUserList` and `getUserList` in `UserContext` and `onRemoteUserJoined`, `onRemoteUserLeft`, and `onUserUpdated` in `UserHandler` instead.
- Remove `onCoHostListUpdated`. Use `onCoHostUserListAdded` and `onCoHostUserListRemoved` instead. You can also get the information of all on-stage users through `getCoHostList` in `UserContext`.
- Rename `onUserReward` to `onUserRewarded`.
- Rename `onKickOut` as `onLocalUserKickedOut`.
- Remove `onUserTip` and `onRoster`.
- Remove `onFlexUserPropsChanged`. Use `onUserPropertiesUpdated` and `onUserPropertiesDeleted` in `IUserHandler` instead. You can also get custom user properties through `getUserProperties` in `UserContext`.

## iOS

### Migrate from v1.1.5 to v2.1.0

In v2.1.0, Agora fully optimizes the internal architecture of the Agora Classroom SDK and refactors the Agora Edu Context APIs.

This section lists the major changes of the Edu Context API between v2.1.0 and v1.1.5.

#### Chat context

Remove `AgoraEduMessageContext` and `AgoraEduMessageHandler`. Use `AgoraRtmIMWidget` in the `AgoraWidgets` library instead.

#### Whiteboard context

Remove `AgoraEduWhiteBoardContext`, `AgoraEduWhiteBoardHandler`, `AgoraEduWhiteBoardToolContext`, `AgoraEduWhiteBoardPageControlContext`, and `AgoraEduWhiteBoardPageControlHandler`. Use `AgoraWhiteBoardWidget` in the `AgoraWidgets` library instead.

#### Device context

- Remove `AgoraEduDeviceContext` and `AgoraEduDeviceHandler`. Use methods and callbacks in `AgoraEduMediaContext` and `AgoraEduMediaHandler` instead, as follows:
- Remove `setCameraDeviceEnable`, `setMicDeviceEnable`, and `setSpeakerDeviceEnable`. Use `openLocalDevice` and `closeLocalDevice` in `AgoraEduMediaContext` instead.
- Remove `switchCameraFacing`. Use `openLocalDevice` in `AgoraEduMediaContext` instead.
- Remove `onCameraDeviceEnableChanged`, `onCameraDeviceFacingChanged`, `onMicDeviceEnableChanged`, and `onSpeakerDeviceEnableChanged`. Use `onLocalDeviceStateUpdated` in `AgoraEduMediaHandler` instead.

#### Hands-up context

- Remove `AgoraEduHandsUpContext` and `AgoraEduHandsUpHandler`. Use methods and callbacks in `AgoraEduUserContext` and `AgoraEduUserHandler` instead, as follows:
- Remove `updateHandsUpState`. Use `handsWave` and `handsDown` in `AgoraEduUserContext` instead.
- Remove `onHandsUpState`. Use `onUserHandsWave` and `onUserHandsDown` in `AgoraEduUserHandler` instead.

#### Media context

- Rename `openCamera` as `openLocalDevice`.
- Rename `closeCamera` as `closeLocalDevice`.
- Rename `startPreview` as `startRenderVideo`.
- Rename `stopPreview` as `stopRenderVideo`.
- Rename `openMicrophone` as `openLocalDevice`.
- Rename `closeMicrophone` as `closeLocalDevice`.
- Rename `renderRemoteView` as `startRenderVideo`.
- Remove `publishStream`.
- Remove `unpublishStream`.

#### Room context

- Rename `joinClassroom` as `joinRoom`.
- Rename `updateFlexRoomProperties` as `updateRoomProperties`.
- Remove `uploadLog` and `onUploadLogSuccess`. Use `uploadLog` in `AgoraEduMonitorContext` instead.
- Rename `registerEventHandler` as `registerRoomEventHandler`.
- Remove `onShowErrorInfo`.
- Rename `onClassroomJoined` as `onRoomJoinedSuccess`.
- Rename `onFlexRoomPropertiesInitialize` as `RoomContext.getRoomProperties`.
- Remove `onFlexRoomPropertiesChanged`. Use `onRoomPropertiesUpdated` and `onRoomPropertiesDeleted` instead.
- Remove `onClassroomName`. Use `getRoomInfo` in `AgoraEduRoomContext` instead.
- Remove `onClassroomState`. Use `onClassStateUpdated` and `onRoomClosed` instead.
- Remove `onClassTimeInfo`. Use `getRoomInfo` in `AgoraEduRoomContext` instead.
- Remove `onNetworkQuality`. Use `onLocalNetworkQualityUpdated` in `AgoraEduMonitorHandler` instead.
- Remove `onConnectionState`. Use `onLocalConnectionUpdated` in `AgoraEduMonitorHandler` instead.

#### Screen-sharing context

- Remove `AgoraEduScreenShareContext` and `AgoraEduScreenShareHandler`. Use `AgoraEduStreamContext` instead. When `videoSourceType` in `AgoraEduContextStreamInfo` is `screen`, you can regard this stream as a screen-sharing video stream.
- Remove `AgoraEduScreenShareHandler`. Use `AgoraEduStreamContext` instead. Remove `onUpdateScreenShareState`. Use `onStreamJoined`, `onStreamLeft`, and `onStreamUpdate` in `AgoraEduStreamHandler` instead.

#### User context

- Rename `updateFlexUserProperties` as `updateUserProperties`
- Rename `registerEventHandler` as `registerUserEventHandler`
- Remove `onUpdateUserList`. Use `onRemoteUserJoined`, `onRemoteUserLeft`, and `onUserUpdated` instead.
- Remove `onUpdateCoHostList`. Use `onCoHostUserListAdded` and `onCoHostUserListRemoved` instead.
- Rename `onKickOut` as `onLocalUserKickOut`.
- Remove `onUpdateAudioVolumeIndication`. Use `onVolumeUpdated` in `AgoraEduMediaHandler` instead.
- Rename `onShowUserReward` as `onUserRewarded`.
- Remove `onFlexUserPropertiesChanged`. Use `onUserPropertiesUpdated` and `onUserPropertiesDeleted` instead.
- Remove `onStreamUpdated`. Use `onStreamUpdated` in `AgoraEduStreamHandler` instead.

### Migrate to 1.1.5

If you changed the UI of Flexible Classroom in versions earlier than v1.1.5, follow these steps to migrate to v1.1.5:

#### Step 1: Re-integrate Flexible Classroom

Follow the steps in Integrate Flexible Classroom into Your App to re-integrate Flexible Classroom v1.1.5.

#### Step 2: Replace the files in the `SDKs/AgoraEduUI` directory

Replace the files in the `SDKs/AgoraEduUI` directory with the files in your project's `AgoraEduSDK/Modules/AgoraUIEduAppViews/AgoraUIEduAppView` directory, as follows:

- Replace `SDKs/AgoraEduUI/AgoraEduUI/AgoraResources` with `AgoraEduSDK/Modules/AgoraUIEduAppViews/AgoraUIEduAppViews/AgoraResources`.
- Replace `SDKs/AgoraEduUI/AgoraEduUI/Render` with `AgoraEduSDK/Modules/AgoraUIEduAppViews/AgoraUIEduAppViews/Render`.
- Replace `SDKs/AgoraEduUI/AgoraEduUI/UIController` with `AgoraEduSDK/Modules/AgoraUIEduAppViews/AgoraUIEduAppViews/UIController`.
- Replace `SDKs/AgoraEduUI/AgoraEduUI/WhiteBoard` with `AgoraEduSDK/Modules/AgoraUIEduAppViews/AgoraUIEduAppViews/WhiteBoard`.
- Replace `SDKs/AgoraEduUI/AgoraEduUI/AgoraEduUI.xcassets` with `AgoraEduSDK/Modules/AgoraUIEduAppViews/AgoraUIEduAppViews/AgoraUIEduAppViews.xcassets`.
- Replace `SDKs/AgoraEduUI/AgoraEduUI/UIManager` with `AgoraEduSDK/Modules/AgoraUIEduAppViews/AgoraUIEduAppViews/UIManager`, rename `AgoraUIManager.swift` to `AgoraEduUI.swift`, and rename `AgoraUIManager` class to `AgoraEduUI`.
- Replace `Widgets/AgoraWidgets/Chat` with `AgoraEduSDK/Modules/AgoraUIEduAppViews/AgoraUIEduAppViews/Widget`.

#### Step 3: Edit the `AgoraEduUI.swift` file

In `AgoraEduUI.swift`, make the following changes:

1. Rename `AgoraEduContextAppType` to `AgoraEduContextRoomType`.
2. Change `var chat: AgoraEduWidget` to `var chat: AgoraBaseWidget`.
3. Add the following code to add the `initWidgets` method:

   ```swift
   func initWidgets() {
           guard let widgetInfos = contextPool.widget.getWidgetInfos() else {
               return
           }

           for info in widgetInfos {
               switch info.widgetId {
               case "AgoraChatWidget":
                   info.properties = ["contextPool": contextPool]
                   let chat = contextPool.widget.create(with: info)
                   chat.addMessageObserver(self)

                   let hasConversation = (viewType == .oneToOne ? 0 : 1)
                   if let message = ["hasConversation": hasConversation].jsonString() {
                       chat.widgetDidReceiveMessage(message)
                   }

                   self.chat = chat
               default:
                   break
               }
           }
   }
   ```

#### Step 4: Replace the files in the `SDKs/Modules/AgraUIEduBaseViews` directory

Replace the files in the `SDKs/Modules/AgraUIEduBaseViews` directory with the files in your project's `AgoraEduSDK/Modules/AgraUIEduBaseViews` directory, as follows:

- Replace `SDKs/Modules/AgraUIEduBaseViews/AgoraResources` with `AgoraEduSDK/Modules/AgraUIEduBaseViews/AgoraResources`.
- Replace `SDKs/Modules/AgraUIEduBaseViews/AgoraAlertView` with `AgoraEduSDK/Modules/AgraUIEduBaseViews/AgoraAlertView`.
- Replace `SDKs/Modules/AgraUIEduBaseViews/AgoraAnimatedImage` with `AgoraEduSDK/Modules/AgraUIEduBaseViews/AgoraAnimatedImage`.
- Replace `SDKs/Modules/AgraUIEduBaseViews/AgoraHandsUpView` with `AgoraEduSDK/Modules/AgraUIEduBaseViews/AgoraHandsUpView`.
- Replace `SDKs/Modules/AgraUIEduBaseViews/AgoraRefresh` with `AgoraEduSDK/Modules/AgraUIEduBaseViews/AgoraRefresh`.
- Replace `SDKs/Modules/AgraUIEduBaseViews/AgoraToastView` with `AgoraEduSDK/Modules/AgraUIEduBaseViews/AgoraToastView`.
- Replace `SDKs/Modules/AgraUIEduBaseViews/AgoraUIEduBaseViews.xcassets` with `AgoraEduSDK/Modules/AgraUIEduBaseViews/AgoraUIEduBaseViews.xcassets`.
- Replace `SDKs/Modules/AgraUIEduBaseViews/AgoraUINavigationBar` with `AgoraEduSDK/Modules/AgraUIEduBaseViews/AgoraUINavigationBar`.
- Replace `SDKs/Modules/AgraUIEduBaseViews/AgoraUIUserView` with `AgoraEduSDK/Modules/AgraUIEduBaseViews/AgoraUIUserView`.
- Replace `SDKs/Modules/AgraUIEduBaseViews/AgoraUserListView` with `AgoraEduSDK/Modules/AgraUIEduBaseViews/AgoraUserListView`.
- Replace `SDKs/Modules/AgraUIEduBaseViews/AgoraUserRenderListView` with `AgoraEduSDK/Modules/AgraUIEduBaseViews/AgoraUserRenderListView`.
- Replace `SDKs/Modules/AgraUIEduBaseViews/Utils` with `AgoraEduSDK/Modules/AgraUIEduBaseViews/Utils`.
- Replace `Widgets/AgoraWidgets/Chat` with `AgoraEduSDK/Modules/AgraUIEduBaseViews/AgoraUIChatView`.

#### Step 5: Edit the `AgoraChatWidget.swift` file

In `AgoraChatWidget.swift`, make the following changes:

1. Replace the initialization method with the following code:

   ```swift
   public required init(widgetId: String,
                        contextPool: AgoraEduContextPool,
                        properties: [AnyHashable : Any]?) {
       super.init(widgetId: widgetId,
                  contextPool: contextPool,
                  properties: properties)
       initViews()
       initLayout()
       initData()
   }
   ```

2. To add the `AgoraEduMessageContext` property, add the following code:

   ```swift
   private weak var context: AgoraEduMessageContext?

   public required override init(widgetId: String,
                                 properties: [AnyHashable: Any]?) {
       super.init(widgetId: widgetId,
                  properties: properties)

       initViews()
       initLayout()

       if let contextPool = properties?["contextPool"] as? AgoraEduContextPool {
           context = contextPool.chat
           initData()
       }
   }
   ```

## Web

You do not need to migrate your code for this platform.

## Electron

You do not need to migrate your code for this platform.
