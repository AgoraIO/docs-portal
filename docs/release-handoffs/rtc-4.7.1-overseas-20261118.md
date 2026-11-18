# RTC SDK 4.7.1: overseas documentation handoff

Prepared for Saud on November 18, 2026. Scope: Android and iOS only.

This handoff contains proposed English release notes and the corresponding Metadata API copy. It follows the approved Chinese scope in [docs-portal PR #1457](https://github.com/AgoraIO/docs-portal/pull/1457). It does not establish overseas SDK availability or authorize publication.

## Release notes

The following copy is also included in `content/docs/en/realtime-media/rtc/reference/release-notes.mdx`. The date follows the supplied release date; confirm the overseas release date before publishing. RTM SDK is called Signaling SDK in the English copy, following the existing English documentation.

### Android v4.7.1

Released on November 18, 2026.

#### New features

* **Metadata support for locally transcoded video**

    This release adds support for sending metadata with locally transcoded video streams, allowing you to attach custom application data. For the transcoded output stream, the SDK requests the metadata through the [`onReadyToSendMetadata`](https://api-ref.agora.io/en/video-sdk/android/4.x/API/class_imetadataobserver.html#callback_imetadataobserver_onreadytosendmetadata) callback with `sourceType` set to `VIDEO_SOURCE_TRANSCODED`.

#### Issues fixed

This release fixes the following issues:

- The `onEncodedVideoFrameReceived` callback stopped firing after `stopRecording` was called to stop local recording.
- The app could occasionally crash in certain initialization scenarios when using both the RTC SDK and the Signaling SDK.

### iOS v4.7.1

Released on November 18, 2026.

#### New features

* **Metadata support for locally transcoded video**

    This release adds support for sending metadata with locally transcoded video streams, allowing you to attach custom application data. For the transcoded output stream, the SDK requests the metadata through the [`readyToSendMetadataAtTimestamp:sourceType:`](https://api-ref.agora.io/en/video-sdk/ios/4.x/documentation/agorartckit/agoramediametadatadatasource/readytosendmetadata(attimestamp:sourcetype:)) callback with `sourceType` set to `AgoraVideoSourceTypeTransCoded`.

#### Issues fixed

This release fixes the following issues:

- The `onEncodedVideoFrameReceived:length:info:channelId:uid:` callback stopped firing after `stopRecording` was called to stop local recording.
- On iPhone 16 series devices running iOS 27.x, system compatibility issues could cause the sending bitrate to exceed the configured bitrate when inputting video data in BGRA format.
- When debugging an app with Xcode, initializing the RTC engine could occasionally trigger a Main Thread Checker warning.

## Metadata API copy

These are updates to existing callbacks. No API signature or source-type enum is added in this release. The new behavior is Metadata support for the locally transcoded output source. Do not describe this change as support for every value of `VideoSourceType` or `AgoraVideoSourceType`; a complete source-support matrix has not been confirmed.

### Android: onReadyToSendMetadata

Keep the existing signature:

```java
public abstract byte[] onReadyToSendMetadata(long timeStampMs, int sourceType)
```

Add to the detailed description:

> As of v4.7.1, this callback can provide metadata for locally transcoded video. When `sourceType` is `VIDEO_SOURCE_TRANSCODED`, return the metadata to send with the transcoded video stream.
>
> The metadata is carried by the mixed output stream. Metadata from input camera or screen-sharing streams is not automatically merged into the output stream.

Append to the existing `sourceType` parameter description:

> As of v4.7.1, `VIDEO_SOURCE_TRANSCODED` identifies the locally transcoded output stream.

Use this return-value description:

> The metadata to send, as a byte array. Return `null` when there is no metadata to send.

Keep the existing `getMaxMetadataSize` guidance and its maximum of 1024 bytes. Preserve the warning that the SDK truncates data exceeding the configured limit.

### iOS: readyToSendMetadataAtTimestamp:sourceType:

Keep the existing Objective-C signature and Swift name:

```objectivec
- (NSData * _Nullable)readyToSendMetadataAtTimestamp:(NSTimeInterval)timestamp sourceType:(AgoraVideoSourceType)sourceType NS_SWIFT_NAME(readyToSendMetadata(atTimestamp:sourceType:));
```

Add to the detailed description:

> As of v4.7.1, this callback can provide metadata for locally transcoded video. When `sourceType` is `AgoraVideoSourceTypeTransCoded`, return the metadata to send with the transcoded video stream.
>
> The metadata is carried by the mixed output stream. Metadata from input camera or screen-sharing streams is not automatically merged into the output stream.

Append to the existing `sourceType` parameter description:

> As of v4.7.1, `AgoraVideoSourceTypeTransCoded` identifies the locally transcoded output stream.

Use this return-value description:

> The metadata to send, as `NSData`. Return `nil` when there is no metadata to send.

Preserve this size-limit note:

> Make sure the size of the metadata does not exceed the value returned by `metadataMaxSize`, up to 1024 bytes. If the metadata size exceeds this value, the SDK truncates the excess data.

The return value is an `NSData` payload. Do not describe it as a structure containing `uid`, `size`, or `buffer` fields.

## Authoritative source and publication paths

The English API changes are already prepared in [agora_doc_source PR #4031](https://github.com/AgoraIO/agora_doc_source/pull/4031), fixed source commit `22352cf15a72e3ad3418b8a6ba4ede308703058f`:

| Source at that commit | Purpose |
| --- | --- |
| [English Android callback DITA](https://github.com/AgoraIO/agora_doc_source/blob/22352cf15a72e3ad3418b8a6ba4ede308703058f/en-US/dita/RTC-AIDOC/API/callback_imetadataobserver_onreadytosendmetadata.dita) | Android description, parameter and return-value update. |
| [English iOS callback DITA](https://github.com/AgoraIO/agora_doc_source/blob/22352cf15a72e3ad3418b8a6ba4ede308703058f/en-US/dita/RTC-AIDOC/API/api_agoramediametadatadatasource_readytosendmetadataattimestamp.dita) | iOS description, signature, parameters, size limit and return value. |
| [English iOS map](https://github.com/AgoraIO/agora_doc_source/blob/22352cf15a72e3ad3418b8a6ba4ede308703058f/en-US/dita/RTC-AIDOC/RTC_NG_API_iOS.ditamap) and [key map](https://github.com/AgoraIO/agora_doc_source/blob/22352cf15a72e3ad3418b8a6ba4ede308703058f/en-US/dita/RTC-AIDOC/config/keys-rtc-ng-api-ios.ditamap) | Register the iOS topic and key. |
| [English RTC-NG callback source](https://github.com/AgoraIO/agora_doc_source/blob/22352cf15a72e3ad3418b8a6ba4ede308703058f/en-US/dita/RTC-NG/API/callback_imetadataobserver_onreadytosendmetadata.dita) | Current Apple comment-JSON workflow input; contains the iOS update. |

The earlier source validation recorded successful English parsing and DITA generation, and a full English iOS comment JSON with 978 objects / 1,140,015 bytes containing the updated callback. These are source-generation checks, not a published DocC check or an SDK device test. The English AIDOC iOS map is incomplete overall; do not use its partial JSON to replace the full RTC-NG Apple source.

Android API publication uses the English Native API HTML pipeline. iOS publication uses the English DITA → comment JSON → SDK header injection → DocC pipeline. Keep existing API anchors, other methods, and historical fixes. The portal's Chinese API MDX and Chinese archive links are not overseas API publication inputs.

## Items for Saud and the release owner

- Confirm November 18, 2026 as the overseas release date and obtain the required overseas product review/sign-off.
- Confirm whether the local-recording fix belongs in public English release notes. It is retained in this draft to preserve the supplied scope; the established overseas API scope excludes local-recording and copyright-music APIs. No recording API documentation is added by this PR.
- Publish the approved Android API and iOS DocC updates, then verify the Metadata callback links and the source-type descriptions on the actual hosted pages.
- After hosted publication is verified, update the portal's Android/iOS API-reference version labels from 4.7.0 to 4.7.1 for the released SDK variants. Keep desktop and framework labels unchanged.
- Verify overseas SDK packages, release dates, Maven/CocoaPods versions, download links and applicable Voice/Lite availability before updating catalog/install entries. Package sizes, MD5 values and AOSL dependency versions are not supplied by this handoff.
- Preserve overseas 4.7.0 API access using the actual overseas archive/version mechanism. Do not reuse the Chinese `0.0.543` archive as an English archive or invent historical URLs.
- Do not add the cancelled standalone Metadata product guide. No deprecation, API removal or broader source-support claim is introduced here.

## Message draft

Subject: RTC SDK 4.7.1 documentation review — Android and iOS

Hi Saud,

The English RTC SDK 4.7.1 release notes for Android and iOS are prepared in the accompanying docs-portal PR. This handoff includes the proposed release-note copy, the Metadata API changes, and fixed links to the English DITA source in PR #4031.

The feature adds Metadata support to locally transcoded output streams. The release notes explicitly name `VIDEO_SOURCE_TRANSCODED` on Android and `AgoraVideoSourceTypeTransCoded` on iOS. These are existing enum values; the new behavior is Metadata support for that output source.

Please review the wording and confirm the overseas release date, currently set to November 18, 2026. Please also confirm whether to retain the local-recording fix in the public English release notes. The Android API and iOS DocC publication steps and the version/download checks are listed above.

The PR is a draft for review. This handoff does not indicate that the SDK packages or hosted API updates have been published.

Thanks!
