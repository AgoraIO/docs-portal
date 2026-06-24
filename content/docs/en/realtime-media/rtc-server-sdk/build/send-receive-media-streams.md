---
title: "Send and receive media streams"
description: "How to use Server Gateway to send media streams to Video SDK clients and receive media streams from clients."
---

This page introduces how to use Server Gateway to send media streams to the client and receive media streams from the client.

## Understand the tech

The following figure shows the basic workflow you implement to send and receive audio and video streams using Server Gateway:

![Basic workflow](/images/server-gateway/send-and-receive-media-streams.svg)

## Prerequisites

Before you begin, ensure your development environment meets the necessary hardware and software requirements and that you have downloaded the latest Server Gateway SDK. See [Integrate the SDK](../index.md).

## Initialize and connect

Before sending and receiving media streams, complete the following steps.

### Initialize the SDK

Call `createAgoraService` and `initialize` to create and initialize an `IAgoraService` object. The `IAgoraService` object persists as long as the server app is running.

The SDK supports user IDs in both integer and string formats. This page demonstrates integer-format user IDs. To learn more about string user IDs, see [Use a string user ID](stringuid.md).

```cpp
auto service = createAgoraService();

agora::base::AgoraServiceConfiguration scfg;
scfg.appId = appid;
scfg.enableAudioProcessor = enableAudioProcessor;
scfg.enableAudioDevice = enableAudioDevice;
scfg.enableVideo = enableVideo;
scfg.useStringUid = enableuseStringUid;

if (service->initialize(scfg) != agora::ERR_OK) {
    return nullptr;
}
```

### Connect to a Video SDK channel

After initializing the SDK, connect to a Video SDK channel:

1. Create an `IRtcConnection` object:

```cpp
agora::rtc::RtcConnectionConfiguration ccfg;
ccfg.autoSubscribeAudio = false;
ccfg.autoSubscribeVideo = false;
ccfg.clientRoleType = agora::rtc::CLIENT_ROLE_BROADCASTER;
agora::agora_refptr<agora::rtc::IRtcConnection> connection =
    service->createRtcConnection(ccfg);
```

2. Register a connection observer:

```cpp
auto connObserver = std::make_shared<SampleConnectionObserver>();
connection->registerObserver(connObserver.get());
```

3. Connect to the channel:

```cpp
if (connection->connect(options.appId.c_str(), options.channelId.c_str(),
                        options.userId.c_str())) {
    AG_LOG(ERROR, "Failed to connect to Agora channel!");
    return -1;
}
```

## Send media streams to the client

After establishing a connection, follow these steps to send media streams to the client.

### Create a media stream sender

Use the `IMediaNodeFactory` object to create media stream senders:

- `IAudioPcmDataSender`
- `IVideoFrameSender`
- `IAudioEncodedFrameSender`
- `IVideoEncodedImageSender`

1. Create an `IMediaNodeFactory` object:

```cpp
agora::agora_refptr<agora::rtc::IMediaNodeFactory> factory =
    service->createMediaNodeFactory();
if (!factory) {
    AG_LOG(ERROR, "Failed to create media node factory!");
}
```

2. Create the sender objects you need:

```cpp
auto audioPcmDataSender = factory->createAudioPcmDataSender();
auto videoFrameSender = factory->createVideoFrameSender();
auto audioFrameSender = factory->createAudioEncodedFrameSender();
auto videoEncodedFrameSender = factory->createVideoEncodedImageSender();
```

3. Create local tracks for publishing:

```cpp
auto customAudioTrack = service->createCustomAudioTrack(audioPcmDataSender);
auto customVideoTrack = service->createCustomVideoTrack(videoFrameSender);
```

### Publish and send media streams

1. Publish the local tracks:

```cpp
customAudioTrack->setEnabled(true);
connection->getLocalUser()->publishAudio(customAudioTrack);

customVideoTrack->setEnabled(true);
connection->getLocalUser()->publishVideo(customVideoTrack);
```

2. Start the sending threads:

```cpp
std::thread sendAudioThread(
    SampleSendAudioTask, options, audioFrameSender, std::ref(exitFlag));
std::thread sendVideoThread(
    SampleSendVideoH264Task, options, videoFrameSender, std::ref(exitFlag));

sendAudioThread.join();
sendVideoThread.join();
```

3. Send PCM audio data:

```cpp
static void SampleSendAudioTask(
    const SampleOptions& options,
    agora::agora_refptr<agora::rtc::IAudioPcmDataSender> audioFrameSender,
    bool& exitFlag) {
  PacerInfo pacer = {0, 10, std::chrono::steady_clock::now()};

  while (!exitFlag) {
    sendOnePcmFrame(options, audioFrameSender);
    waitBeforeNextSend(pacer);
  }
}
```

4. Send H.264 video data:

```cpp
static void SampleSendVideoH264Task(
    const SampleOptions& options,
    agora::agora_refptr<agora::rtc::IVideoEncodedImageSender> videoH264FrameSender,
    bool& exitFlag) {
  std::unique_ptr<HelperH264FileParser> h264FileParser(
      new HelperH264FileParser(options.videoFile.c_str()));
  h264FileParser->initialize();
}
```

## Receive media streams from the client

After establishing the connection, register audio and video data observers based on your requirements:

- `IAudioFrameObserver`
- `IVideoFrameObserver`
- `IVideoEncodedImageReceiver`

Example:

```cpp
// Register audio and video observers according to your use-case.
```

## Reference

### Next steps

- [Use a string user ID](stringuid.md)
- [Secure channel encryption](media-stream-encryption.md)
- [Restrict media zones](network-geofencing.md)
