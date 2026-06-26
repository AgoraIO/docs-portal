---
title: "SDK error codes"
description: "List of commonly encountered API errors and their causes."
---

When interacting with the Agora API, the Video SDK may return an error code. Receiving an error code indicates that the SDK has encountered an unrecoverable error that necessitates intervention from your app.

This page provides descriptions for common error codes along with the associated reasons and their corresponding solutions. For error codes without predefined solutions, [contact technical support](https://agora-ticket.agora.io/) for assistance.

The error codes listed in this section apply to Agora RTC v4.x SDK on the following platforms:

- Native platforms: Android, iOS, macOS, Windows.
- Third-party frameworks (that is, third-party platforms based on native platform encapsulation): Electron, Unity, React Native, Flutter.

During the operation of Agora SDK, error codes may be returned in the following ways:

- In the return value of a failed method call.
- Through the `onError` callback.
:::note
- When the SDK returns an error code, it may return a negative number. This negative number corresponds to the positive integer in the error code. For example, if it returns `-2`, it corresponds to `2` in the error code.
- The API names in this article are based on the C++ API. The API names for other platforms may be different. Please refer to the API documentation for the corresponding platform.
:::
## Common error codes

| Error code | Description |
| :--: | :------------------------------ |
| `1` | General error (no clearly categorized cause of error). Please call the method again. |
| `2` | An invalid parameter was set in the method. For example, the specified channel name contains illegal characters. Please reset the parameters. |
| `3` | <Slot name="3" /> |
| `4` | <Slot name="4" /> |
| `5` | <Slot name="5" /> |
| `6` | The buffer size is not large enough to hold the returned data. |
| `7` | The method is called before `RtcEngine` is initialized. Please make sure that the `RtcEngine` object has been created and initialized before calling the method. |
| `8` | The current state is invalid. Please check the SDK callback logs to find the exact reason. |
| `9` | There is no permission to operate. Please check whether the user has granted the app permission to use audio/video devices. |
| `10` | Method call timed out. Some method calls require the SDK to return results, and this error occurs if the SDK takes too long to process the event and does not return for more than 10 seconds. |
| `17` | <Slot name="17" /> |
| `18` | <Slot name="18" /> |
| `19` | The resource is occupied and cannot be reused. |
| `20` | The SDK abandons the request, possibly due to too many requests. |
| `21` | Specific firewall settings on Windows cause the `RtcEngine` initialization to fail and then crash. |
| `22` | The SDK failed to allocate resources, possibly because the app takes up too many resources or the system resources are exhausted. |
| `101` | Not a valid App ID, please rejoin the channel with a valid App ID. |
| `102` | Not a valid channel name. The possible reason is that the parameter data type set is incorrect. Please rejoin the channel with a valid channel name. |
| `103` | Cannot get server resources for the current region. Please try to specify a different region when initializing `RtcEngine`. |
| `109` | <Slot name="109" /> |
| `110` | <Slot name="110" /> |
| `111` | The network connection is interrupted. After the SDK established a connection with the server, the network connection was lost for more than 4 seconds. |
| `112` | Network connection lost. The network connection was interrupted and the SDK could not connect to the server within 10 seconds. |

<Slot for="3">

The SDK is not ready yet. There are usually the following reasons:

- `RtcEngine` initialization failed. Please reinitialize `RtcEngine`.
- The user has not joined the channel when the method is called, please check the method calling logic.
- Please check the calling logic of the method.
- The user has not left the channel when the `rate` or `complain` method is called, please check the method calling logic.
- Audio module is not enabled.
- Incomplete assembly.

</Slot>

<Slot for="4">

The current state of `RtcEngine` does not support this operation. There are generally the following reasons:

- Incorrect encryption mode set when using built-in encryption.
- Failed to load external encryption library. Please check if the enumeration value for encryption is correct, or reload the external encryption library.

</Slot>

<Slot for="5">

The method call is rejected. There are generally the following reasons:

- `RtcEngine` initialization failed. Please reinitialize `RtcEngine`.
- The channel name was set to the empty character "" when joining a channel. Please reset the channel name.
- In a multi-channel use-case, the channel name set when the `joinChannel` method was called to join a channel already exists. Please reset the channel name.
- In a multi-channel use-case, the channel name set when the `joinChannelEx` method is called to join a channel already exists. Please reset the channel name.

</Slot>

<Slot for="17">

Joining a channel is rejected. There are usually the following reasons:

- The user is already in the channel. Agora recommends using the `onConnectionStateChanged` callback to determine if the user is in the channel. Do not call this method again to join the channel unless you receive a `CONNECTION_STATE_DISCONNECTED(1)` status.
- A user who calls `startEchoTest` for a call test tries to join the channel without calling `stopEchoTest` to end the current test. After starting a call test, you need to call `stopEchoTest` to end the current test before joining the channel.

</Slot>

<Slot for="18">

Failed to leave the channel. There are generally the following reasons:

- The user has already left the channel, and this error is returned when the method to exit the channel, such as `leaveChannel`, is called again. Stop calling this method.
- The exit channel method such as `leaveChannel` is called when the user has not joined the channel yet. No additional action is needed in this case.

</Slot>

<Slot for="109">

The currently used Token has expired and is no longer valid. Please generate a new Token on the server side and call `renewToken` to update the Token.

:::info
This error code is deprecated. The SDK returns `CONNECTION_CHANGED_TOKEN_EXPIRED(9)` in the `onConnectionStateChanged` callback instead.
:::

</Slot>

<Slot for="110">

Token is invalid. There are generally the following reasons:

- App certificate is enabled in the Agora Console, but App ID + Token authentication is not used. When App certificate is enabled in the project, you must use Token authentication.
- The `uid` field entered when generating the Token does not match the `uid` entered when the user joined the channel.

:::info
This error code is deprecated. The SDK returns `CONNECTION_CHANGED_INVALID_TOKEN(8)` in the `onConnectionStateChanged` callback instead.
:::

</Slot>
| `119` | User failed to switch roles, please try to join the channel again. |
| `120` | Decryption failed. It is possible that the user used the wrong password when joining the channel. Please check the password the user entered when joining the channel, or direct the user to try to rejoin the channel. |
| `121` | The user ID is invalid. |
| `123` | This user has been banned by the server. This error is reported when the user is kicked out by the server. |
| `134` | Invalid user account, possibly because invalid parameters are set. |

## Audio-related error codes

| Error code | Description |
|:--:|:------------------------------|
| `1005` | An unspecified error occurred in the audio device. Check if the audio device is occupied by another application or try to re-enter the channel. |
| `1008` | An error occurred while initializing the playback device. Check if the playback device is occupied by another application or try to re-enter the channel. |
| `1009` | Error starting the playback device. Please check if the playback device is working properly. |
| `1010` | Error stopping the playback device. |
| `1011` | Error initializing the recording device. Please check if the recording device is working properly, or try to re-enter the channel. |
| `1012` | Error starting the recording device. Please check if the recording device is working properly. |
| `1013` | Error stopping the recording device. |

## Data stream-related error codes

| Error code | Description |
|:--:|:------------------------------|
| `113` | The user was not in the channel when the `sendStreamMessage` method was called. |
| `114` | When `sendStreamMessage` was called, the length of the data sent was greater than 1024 bytes. |
| `115` | The frequency of sending data exceeded the limit (6 KB/s) when calling `sendStreamMessage`. |
| `116` | Number of data streams exceeding the limit (5) were created when `createDataStream` was called. |
| `117` | Data stream send timeout. When the sender calls `createDataStream`[1/2] to set `reliable` to `true`, or calls `createDataStream`[2/2] to set `DataStreamConfig.ordered` to `true`, if the receiver does not receive the data within 5 seconds, or detects that the data is missing, the `onStreamMessageError` callback is triggered on the receiving end and returns this error code. |

## Other error codes

| Error code | Description |
|:--:|:------------------------------|
| `130` | The SDK does not support pushing encrypted streams to a CDN. |
| `1001` | Failed to load the media engine. |
| `1501` | There is no permission to use the camera. Please check if camera permission has been turned on. |
