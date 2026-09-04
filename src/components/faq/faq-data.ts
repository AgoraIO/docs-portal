export type FaqCategoryId =
  | "integration-issues"
  | "quality-issues"
  | "general-product-inquiry"
  | "account-and-billing"
  | "other-issues";

export type FaqItem = {
  category: FaqCategoryId;
  href: string;
  platforms: string[];
  products: string[];
  summary: string;
  title: string;
};

export const FAQ_ALL_PRODUCTS = 'All Products';
export const FAQ_ALL_PLATFORMS = 'All Platforms';

export const faqCategories: Array<{
  description: string;
  id: FaqCategoryId;
  label: string;
}> = [
  {
    description: "Build, package, permissions, and SDK setup questions.",
    id: "integration-issues",
    label: "Integration Issues"
  },
  {
    description: "Audio, video, rendering, and media experience questions.",
    id: "quality-issues",
    label: "Quality Issues"
  },
  {
    description: "Product fit, capabilities, limits, and service behavior.",
    id: "general-product-inquiry",
    label: "General Product Inquiry"
  },
  {
    description: "Billing, usage, invoices, and account administration.",
    id: "account-and-billing",
    label: "Account and Billing"
  },
  {
    description: "Operational questions that do not fit another category.",
    id: "other-issues",
    label: "Other Issues"
  }
];

export const faqPlatforms = [
  "All Platforms",
  "Android",
  "iOS",
  "Web",
  "macOS",
  "Windows",
  "Electron",
  "Flutter",
  "Linux",
  "React Native",
  "Unity",
  "Unreal Engine",
  "RESTful API",
  "Broadcast Streaming",
  "Interactive Live Streaming",
  "Linux Cpp",
  "Linux Java",
  "Video Calling",
  "Voice Calling",
  "Windows Cpp",
  "Windows Csharp"
];

export const faqProducts = [
  "All Products",
  "Video Calling",
  "Voice Calling",
  "Interactive Live Streaming",
  "Broadcast Streaming",
  "Cloud Recording",
  "On-premise Recording",
  "Flexible Classroom",
  "Signaling",
  "Agora Chat",
  "Interactive Whiteboard",
  "Media Push",
  "Media Pull",
  "Agora Analytics",
  "Extensions Marketplace",
  "Server Gateway",
  "Web"
];

export const faqItems: FaqItem[] = [
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/empty_deviceId",
    platforms: [
      "All Platforms",
      "Web"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "On Chrome 81, the deviceId field that the getDevices method returns is empty.",
    title: "Why can't I get the device ID on Chrome 81?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/mobile_video_profile",
    platforms: [
      "All Platforms",
      "RESTful API"
    ],
    products: [
      "All Products",
      "Cloud Recording"
    ],
    summary: "When you enable the mobile web page mode and perform page recording (mobile is set to true), Agora recommends that you set the width and height of the output video according to the following video resolution table:",
    title: "How can I set the page recording output resolution in mobile web page mode?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/video_profile",
    platforms: [
      "All Platforms",
      "Web",
      "Android",
      "iOS",
      "macOS",
      "Flutter",
      "React Native",
      "Electron",
      "Windows",
      "Unity"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "Video parameters vary on a case-by-case basis. For example:",
    title: "How can I choose the video resolution, frame rate and bitrate?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/web_camera_light",
    platforms: [
      "All Platforms",
      "Web"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "When you use the Agora Video SDK Web SDK to disable local video through muteVideo, the camera light stays on.",
    title: "Why is the camera light still on after I disable my video on the Web?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/android_startaudiomixing_permission",
    platforms: [
      "All Platforms",
      "Android"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "Cannot play an mp3, mp4, or any other music format using startAudioMixing or playEffect on Android 9.",
    title: "Why can't I play the audio file using startAudioMixing or playEffect on Android 9?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/android_audio_routing_change",
    platforms: [
      "All Platforms",
      "Android"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "When using an app integrated with an Agora SDK (an \"SDK app\") for real-time communication on an Android device, if you switch to another app that has audio input and/or output and return to the SDK app, the audio routing of the SDK changes.",
    title: "Why does the audio routing change after I switch to another app on an Android device?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/ncs_vs_query",
    platforms: [
      "All Platforms",
      "RESTful API"
    ],
    products: [
      "All Products",
      "Cloud Recording"
    ],
    summary: "You can monitor the status of the cloud recording service either through the query method or by the Message Notification Service, to take action when required. Both options have pros and cons.",
    title: "What are the differences between the Message Notification Service and the query Method?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/rtc_rtm_token",
    platforms: [
      "All Platforms",
      "Android",
      "iOS",
      "macOS",
      "Flutter",
      "React Native",
      "Electron",
      "Windows",
      "Unity"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming",
      "Signaling"
    ],
    summary: "Agora provides source code in several languages to generate tokens with both RTC and Signaling privileges. Refer to the following samples to generate tokens on your own server:",
    title: "How can I generate a token with both RTC and Signaling privileges?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/multitasking",
    platforms: [
      "All Platforms",
      "iOS"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "Starting with iOS 16, the system allows apps to continue accessing the camera in multitasking mode. This means that camera capture can continue in layouts such as split view, slide over, and picture-in-picture.",
    title: "How can I enable multitasking camera capture on iOS?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/unreal_permissions",
    platforms: [
      "All Platforms",
      "Unreal Engine"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "In order to implement real-time interactive features on different target platforms, you need to add camera, microphone, and other permissions to your Unreal Engine project. Depending on the target platform, you can refer to this article for",
    title: "How do I add the permissions needed for real-time interaction to my Unreal Engine project?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/unity_crash",
    platforms: [
      "All Platforms",
      "Unity"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "When using the Unity SDK v3.0.1 or earlier, blank screen or even crashes occur if access to the microphone or camera is not granted. This issue occur on various platfroms including macOS and Android.",
    title: "Why do crashes occur on Unity SDK v3.0.1 or earlier?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/music_pause",
    platforms: [
      "All Platforms",
      "Android"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "The startAudioMixing method is called to play a music file on an Android device. During the playback process, the system's built-in phone software is used to answer or make a call. After hanging up the phone, the music file does not automat",
    title: "Why don't music files automatically resume playing after hanging up a system call on an Android device?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/set_enabled_set_muted",
    platforms: [
      "All Platforms",
      "Web"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "Both Web SDK 4.x and 3.x provide APIs for controlling the collection and sending of local audio and video. The differences between these APIs are detailed in the table below. You cannot call setEnabled and setMuted at the same time.",
    title: "What are the differences between setEnabled and setMuted?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/local_network_privacy_rtm",
    platforms: [
      "All Platforms",
      "iOS"
    ],
    products: [
      "All Products",
      "Signaling"
    ],
    summary: "After users upgrade their iOS devices to iOS 14.0 and use an app that integrates the Agora Signaling SDK for iOS, users see a prompt for finding local network devices. The following picture shows the pop-up prompt:",
    title: "Why do I see a prompt to find local network devices when launching an iOS app integrated with the Agora Signaling SDK?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/class_packaging",
    platforms: [
      "All Platforms",
      "Windows"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "To create a Smart Classroom Windows installation package using a Mac, take the following steps:",
    title: "How to package a Windows installation on macOS?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/web_recording",
    platforms: [
      "All Platforms",
      "RESTful API"
    ],
    products: [
      "All Products",
      "On-premise Recording"
    ],
    summary: "When you enable the mobile web mode (mobile is true), and start web page recording. Agora recommends that you set the width and height of the output video according to the following video resolution:",
    title: "How to set the output video resolution of the web page recording mode on the on mobile devices?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/qps_client",
    platforms: [
      "All Platforms",
      "Web",
      "Android",
      "iOS",
      "macOS",
      "Windows",
      "RESTful API",
      "Linux"
    ],
    products: [
      "All Products",
      "Signaling"
    ],
    summary: "In Signaling SDK, the call frequency limit refers to the limit of one client instance.",
    title: "In Signaling SDK, does the call frequency limit refer to the limit of one client instance?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/agora_class_custom_properties",
    platforms: [
      "All Platforms",
      "Web",
      "Android",
      "iOS",
      "macOS",
      "Flutter",
      "React Native",
      "Electron",
      "Windows",
      "Unity"
    ],
    products: [
      "All Products",
      "Flexible Classroom"
    ],
    summary: "Flexible Classroom supports custom user properties and classroom properties. The property consists of a property name and a property value. Each property name has only one property value.",
    title: "How can I set user properties and classroom properties?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/local_network_privacy",
    platforms: [
      "All Platforms",
      "iOS"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "After users upgrade their iOS devices to iOS 14.0, and use an app that integrates the Agora Video SDK for iOS for the first time, users see a prompt for finding local network devices. The following picture shows the pop-up prompt:",
    title: "Why do I see a prompt to find local network devices when launching an iOS app integrated with the Agora Video SDK?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/channel",
    platforms: [
      "All Platforms",
      "Android",
      "iOS",
      "macOS",
      "Windows"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "No, users will not automatically leave a channel unless they do so by themselves, for example, when the application calls leaveChannel.",
    title: "How can I solve channel-related issues?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/recording_fails",
    platforms: [
      "All Platforms",
      "Android",
      "iOS",
      "Electron",
      "Web"
    ],
    products: [
      "All Products",
      "Flexible Classroom"
    ],
    summary: "If recording fails, take the following steps to troubleshoot the problem:",
    title: "What should I do if the class recording fails?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/cant_upload_courseware",
    platforms: [
      "All Platforms",
      "Android",
      "iOS",
      "macOS",
      "Flutter",
      "React Native",
      "Electron",
      "Windows",
      "Unity"
    ],
    products: [
      "All Products",
      "Flexible Classroom"
    ],
    summary: "If you receive the 403 Forbidden error when uploading courseware, please check whether the whiteboard function has been configured correctly and make sure that Agora can access your cloud storage space.",
    title: "Why can't I upload courseware?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/recording_video_profile",
    platforms: [
      "All Platforms",
      "Linux"
    ],
    products: [
      "All Products",
      "Cloud Recording",
      "On-premise Recording"
    ],
    summary: "This article has been moved to Set the Video Profile.",
    title: "How do I set the video profile of the recorded video?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/token_cohost",
    platforms: [
      "All Platforms",
      "Web",
      "Android",
      "iOS",
      "macOS",
      "Flutter",
      "React Native",
      "Electron",
      "Windows",
      "Unity"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "Co-host authentication enables you to authenticate whether a user has the privilege to publish streams in a live streaming channel. This feature helps ensure that only authorized users publish streams and prevents illegal users from exploit",
    title: "How do I use co-host token authentication?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/token_related_issues",
    platforms: [
      "All Platforms",
      "Android",
      "iOS",
      "macOS",
      "Windows",
      "Flutter",
      "Electron",
      "React Native",
      "Web",
      "Unity",
      "Unreal Engine"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "When a primary/secondary certificate is enabled for your project, you use dynamic tokens to authenticate users. This page lists token-related error codes and event callbacks you may receive, provides triggering causes and solutions, and hel",
    title: "How to deal with token-related error codes?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/system_volume",
    platforms: [
      "All Platforms",
      "Android",
      "iOS",
      "Flutter",
      "React Native",
      "Electron",
      "Unity"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "The in-call volume refers to the volume of voice and video calls, while the media volume refers to the volume at which background music, videos, and audio effects are played. The in-call volume and the media volume are independent from each",
    title: "What is the difference between the in-call volume and the media volume?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/switch_screen_camera_web",
    platforms: [
      "All Platforms",
      "Web"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "This page introduces three solutions for switching between the screen-sharing stream and the stream captured by the camera in a screen-sharing scenario using the Agora Video SDK for Web.",
    title: "How can I switch between the screen-sharing stream and the camera stream?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/string_uid",
    platforms: [
      "All Platforms",
      "Web",
      "Android",
      "iOS",
      "macOS",
      "Windows"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "Many apps use string usernames. To reduce development costs, Agora has added support for string user IDs. Users can now directly use their string usernames as user accounts to join the Agora channel.",
    title: "How can I use string user IDs?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/recording_player",
    platforms: [
      "All Platforms",
      "Linux"
    ],
    products: [
      "All Products",
      "On-premise Recording"
    ],
    summary: "You get different recorded files in different recording modes.",
    title: "Which media players can play the recorded files?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/recording_mode",
    platforms: [
      "All Platforms",
      "Linux",
      "RESTful API"
    ],
    products: [
      "All Products",
      "On-premise Recording",
      "Cloud Recording"
    ],
    summary: "If you want more flexibility in processing the recorded files, choose individual recording mode. For example, in an online classroom, if parents want to see the video of the teacher and their child only, you can use individual recording mod",
    title: "What's the difference between individual recording mode and composite recording mode?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/reconnection",
    platforms: [
      "All Platforms",
      "Android",
      "iOS",
      "macOS",
      "Flutter",
      "React Native",
      "Electron",
      "Windows",
      "Unity"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming",
      "On-premise Recording"
    ],
    summary: "The Agora SDK has reconnection mechanisms when a user drops offline or a process gets killed. This page shows the connection state mechanism of the Agora SDK under these circumstances.",
    title: "Does Agora have reconnection mechanisms?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/camera_exposure_focus",
    platforms: [
      "All Platforms",
      "Android",
      "iOS",
      "macOS",
      "Windows"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "In video applications, adjusting camera exposure and focus is essential for capturing subjects with accurate brightness and sharpness. The Agora RTC SDK offers camera management methods for mobile platforms, enabling users to switch between",
    title: "How can I adjust camera exposure and focus?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/set_log_file",
    platforms: [
      "All Platforms",
      "Web"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming"
    ],
    summary: "The Agora SDK allows you to configure the output log file. All logs generated by the SDK are written to this file.",
    title: "How can I set the log file?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/mirror_mode",
    platforms: [
      "All Platforms",
      "Android",
      "iOS",
      "macOS",
      "Windows"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "Video SDK provides various interfaces to customize video display effects on local and remote devices during a real-time audio and video call, including the option to enable or disable mirror mode.",
    title: "How can I set the mirror mode?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/bucket_region",
    platforms: [
      "All Platforms",
      "RESTful API"
    ],
    products: [
      "All Products",
      "Cloud Recording"
    ],
    summary: "Currently, cloud recording supports the following cloud storage vendors:",
    title: "How to choose the appropriate cloud storage bucket region and address cross-region upload challenges?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/class_stop",
    platforms: [
      "All Platforms",
      "Web",
      "Electron"
    ],
    products: [
      "All Products",
      "Flexible Classroom"
    ],
    summary: "In Flexible Classroom, the teacher can click Leave Classroom to temporarily exit the session without changing the room status. To officially end the class, follow these steps:",
    title: "How to leave a flexible classroom?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/return_404",
    platforms: [
      "All Platforms",
      "RESTful API"
    ],
    products: [
      "All Products",
      "Cloud Recording"
    ],
    summary: "The following issues may cause the query method to return a 404 status code after successfully starting cloud recording with the start method:",
    title: "Why does the query method return a 404 after successfully starting cloud recording?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/live_streaming_disconnection_web",
    platforms: [
      "All Platforms",
      "Web"
    ],
    products: [
      "All Products",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "Pushing streams to the CDN refers to the process where a host publishes multiple media streams to the CDN (Content Delivery Network).",
    title: "When pushing streams to the CDN, what should I do when a disconnection happens?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/host_set_role",
    platforms: [
      "All Platforms",
      "Web",
      "Android",
      "iOS",
      "macOS",
      "Flutter",
      "React Native",
      "Electron",
      "Windows",
      "Unity",
      "Linux"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming",
      "Signaling"
    ],
    summary: "In a live interactive streaming channel, the host can invite an audience to take on the role of co-host, or change role back to audience.",
    title: "How can a host change the role of a remote user?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/get_channel_info",
    platforms: [
      "All Platforms",
      "Android"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "Agora provides server-side RESTful APIs to obtain channel-related information.",
    title: "How can I retrieve channel information, such as the channel name and user list?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/kick_user",
    platforms: [
      "All Platforms",
      "Web",
      "Android",
      "iOS",
      "macOS",
      "Flutter",
      "React Native",
      "Electron",
      "Windows",
      "Unity"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "In real-time audio and video interactions, there are often cases where you need to remove a specific user from the channel. Agora offers several solutions tailored to different scenarios:",
    title: "How to remove a specific user from a channel?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/custom_switch_default",
    platforms: [
      "All Platforms",
      "Android",
      "iOS",
      "macOS",
      "Windows"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "The Agora Video SDK Native SDK provides both Push and Media IO methods to implement custom video capture. This page describes how to switch from custom video capture to SDK capture.",
    title: "How can I switch from custom video capture to SDK capture?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/console_error_web",
    platforms: [
      "All Platforms",
      "Web"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "After integrating the Agora Web SDK into your web app, you can debug your code using the console log. This document lists the common errors in the console log.",
    title: "What are the common error messages to expect in Web browsers' console logs?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/cdnstreaming_callback_relationship",
    platforms: [
      "All Platforms",
      "Android",
      "iOS",
      "macOS",
      "Windows"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "Agora provides two sets of callbacks for you to monitor Media Push:",
    title: "What is the relationship between the old and new callbacks of Media Push?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/call_duration",
    platforms: [
      "All Platforms",
      "Web",
      "Android",
      "iOS",
      "macOS",
      "Flutter",
      "React Native",
      "Electron",
      "Windows",
      "Unity",
      "RESTful API",
      "Windows Cpp",
      "Windows Csharp",
      "Linux",
      "Linux Cpp",
      "Linux Java"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming",
      "Agora Analytics"
    ],
    summary: "During a call, a user may join and leave a Video SDK channel for multiple times, and the user's call duration is the actual time when the user is in the channel. You can use the Agora Video SDK or Agora Analytics to get a user's call durati",
    title: "How do I get the user's call duration?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/audience_event",
    platforms: [
      "All Platforms",
      "Web",
      "Android",
      "iOS",
      "macOS",
      "Flutter",
      "React Native",
      "Electron",
      "Windows",
      "Unity",
      "RESTful API",
      "Linux"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming",
      "Signaling"
    ],
    summary: "The Agora Video SDK does not provide any callback events that listen for an audience joining or leaving an interactive live streaming channel. However, you can listen for these events using either of the following two approaches:",
    title: "How can I listen for an audience joining or leaving an interactive live streaming channel?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/rtm2_rtc_integration_issue",
    platforms: [
      "All Platforms",
      "iOS",
      "Android"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming",
      "Signaling"
    ],
    summary: "When integrating Signaling SDK version 2.2.0 and above with Video/Voice SDK version 4.5.0 or higher, the following errors may appear in the IDE:",
    title: "How do I handle issues when integrating the Signaling SDK and Video/Voice SDK simultaneously?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/abnormal_exit",
    platforms: [
      "All Platforms",
      "RESTful API"
    ],
    products: [
      "All Products",
      "Cloud Recording"
    ],
    summary: "If an app integrated with cloud recording crashes, the recording session is not affected. You can continue to use the original resource ID and recording ID to control the recording instance, such as to query recording status or stop recordi",
    title: "How does an app crash affect cloud recording?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/rtm_token_expiration",
    platforms: [
      "All Platforms",
      "Web"
    ],
    products: [
      "All Products",
      "Signaling"
    ],
    summary: "After the token expires, you need to call the logout method to log out of the Signaling system. Then use the new token to create a new instance and call the login method to log in to the system again.",
    title: "How to handle token expiration?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/multi_language_support",
    platforms: [
      "All Platforms",
      "Android",
      "iOS",
      "macOS",
      "Flutter",
      "React Native",
      "Electron",
      "Windows",
      "Unity"
    ],
    products: [
      "All Products",
      "Flexible Classroom"
    ],
    summary: "Flexible Classroom currently supports Chinese, English, and Spanish. If you need to add more languages, find the language-related key value in the specified directory and modify it.",
    title: "How does Flexible Classroom support multiple languages?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/chat_issues",
    platforms: [
      "All Platforms",
      "Android",
      "iOS",
      "macOS",
      "Flutter",
      "React Native",
      "Electron",
      "Windows",
      "Unity"
    ],
    products: [
      "All Products",
      "Flexible Classroom"
    ],
    summary: "Check if your Chat permission has been activated. If not, activate it in the Console.",
    title: "How to deal with Chat-related issues in Flexible Classroom?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/set_custom_user_attributes",
    platforms: [
      "All Platforms",
      "Android",
      "iOS",
      "macOS",
      "Flutter",
      "React Native",
      "Electron",
      "Windows",
      "Unity"
    ],
    products: [
      "All Products",
      "Flexible Classroom"
    ],
    summary: "Flexible Classroom supports custom user attributes, classroom attributes, and widget attributes. You can set any classroom attribute according to your business needs, and Flexible Classroom will synchronize it to all terminals.",
    title: "How to set custom user and class attributes?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/dynamic_storage_path",
    platforms: [
      "All Platforms",
      "Android",
      "iOS",
      "macOS",
      "Flutter",
      "React Native",
      "Electron",
      "Windows",
      "Unity"
    ],
    products: [
      "All Products",
      "Flexible Classroom"
    ],
    summary: "When configuring the recording file storage path in the Console through the fileNamePrefix field, you can use built-in variables to specify a dynamic path for storing recording files. When the recording starts, variables are replaced with r",
    title: "How to specify a dynamic storage path?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/turn_off_3a_config",
    platforms: [
      "All Platforms",
      "Android",
      "iOS",
      "macOS",
      "Flutter",
      "React Native",
      "Electron",
      "Windows",
      "Unity"
    ],
    products: [
      "All Products",
      "Flexible Classroom"
    ],
    summary: "If your classroom integrates or uses audio mixing or other tools, and you want to turn off noise reduction, echo cancellation, and gain control functions, add the following code to packages/agora-classroom-sdk/src/infra/api/index.tsx:",
    title: "How to turn off noise reduction, echo cancellation, and automatic gain control?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/common_mistakes_flexible_classroom",
    platforms: [
      "All Platforms",
      "Android",
      "iOS",
      "macOS",
      "Flutter",
      "React Native",
      "Electron",
      "Windows",
      "Unity"
    ],
    products: [
      "All Products",
      "Flexible Classroom"
    ],
    summary: "If you encounter the following errors when running the Flexible Classroom Web project:",
    title: "What are some common mistakes in integrating and using Flexible Classroom?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/class_recording_fails",
    platforms: [
      "All Platforms",
      "Android",
      "iOS",
      "macOS",
      "Flutter",
      "React Native",
      "Electron",
      "Windows",
      "Unity"
    ],
    products: [
      "All Products",
      "Flexible Classroom"
    ],
    summary: "\"vendor\": 2, \"region\": 1, //CN_Shanghai endpoint:https://agora-recording.oss-cn-shanghai.aliyuncs.com",
    title: "What should I do if a class recording fails?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/electron_faq",
    platforms: [
      "All Platforms",
      "Android",
      "iOS",
      "macOS",
      "Flutter",
      "React Native",
      "Electron",
      "Windows",
      "Unity"
    ],
    products: [
      "All Products",
      "Flexible Classroom"
    ],
    summary: "This page outlines common challenges encountered throughout the integration, compilation, execution, and packaging phases of Electron SDK app development. It offers potential solutions to address these issues effectively.",
    title: "How can I resolve common development issues on Electron?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/obtain_restful_api_id",
    platforms: [
      "All Platforms",
      "Android",
      "iOS",
      "macOS",
      "Flutter",
      "React Native",
      "Electron",
      "Windows",
      "Unity"
    ],
    products: [
      "All Products",
      "Flexible Classroom"
    ],
    summary: "If you encounter the \"Please obtain the RESTful API ID and key first\" error message when configuring aPaaS in the Console, please take the following steps:",
    title: "What should I do if I encounter \"Please obtain the RESTful API ID and key first\" when configuring aPaaS in Agora Console?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/restful_api_call_frequency",
    platforms: [
      "All Platforms",
      "RESTful API"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "When the request of an Agora Server RESTful API exceeds its call frequency limit, the API returns the HTTP status code 429, indicating that you have made too many requests in a specified amount of time. The following suggestions can help yo",
    title: "How can I avoid being frequency limited when calling Agora Server RESTful APIs?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/streaminit_error",
    platforms: [
      "All Platforms",
      "Web"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "The following are common errors when initializing the stream:",
    title: "Why do errors occur when calling the Stream.init method?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/rtm_compilation_error",
    platforms: [
      "All Platforms",
      "Linux"
    ],
    products: [
      "All Products",
      "Signaling"
    ],
    summary: "The following error occurs when compiling the Agora Signaling Linux Java SDK in Linux:",
    title: "Why do errors occur when compiling the Agora Signaling Linux Java SDK?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/classroom_statuses",
    platforms: [
      "All Platforms",
      "Android",
      "iOS",
      "macOS",
      "Flutter",
      "React Native",
      "Electron",
      "Windows",
      "Unity"
    ],
    products: [
      "All Products",
      "Flexible Classroom"
    ],
    summary: "Flexible Classroom has the following classroom states:",
    title: "What are the classroom states of Flexible Classroom?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/judge_voice_video_call",
    platforms: [
      "All Platforms",
      "Web",
      "Android",
      "iOS",
      "macOS",
      "Linux",
      "Windows"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming",
      "Signaling"
    ],
    summary: "In real-time audio or video communication, you can use the Agora Signaling SDK or the Agora Video SDK to determine whether an incoming or ongoing call is an audio call or a video call.",
    title: "How can I determine whether a call is an audio call or a video call?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/no_stereo_audio",
    platforms: [
      "All Platforms",
      "Android",
      "iOS",
      "macOS",
      "Flutter",
      "React Native",
      "Electron",
      "Windows",
      "Unity"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "When calling startAudioMixing or playEffect to play a stereo file, the user might encounter the issue of not being able to hear audio in stereo.",
    title: "Why can't I hear audio in stereo when playing a stereo file?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/recording_faq",
    platforms: [
      "All Platforms",
      "Linux"
    ],
    products: [
      "All Products",
      "On-premise Recording"
    ],
    summary: "Reason: The system environment cannot find the librecording.so file. Solution: Check if the java demo is compiled and the library file is generated, and then, check and configure the path of the library file. For example, on Linux, if the p",
    title: "How can I solve Recording integration issues?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/framework_cannot_be_opened",
    platforms: [
      "All Platforms",
      "macOS"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "On macOS 11.6 or later, when using Xcode to integrate the Agora Voice or Video SDKs with version 3.6.2 or later, you can encounter a pop-up warning when your project is compiled or running that says \"'library_name.framework' cannot be opene",
    title: "What can I do if I get a pop-up warning saying 'the framework cannot be opened' when compiling an Xcode project?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/video_enhancement",
    platforms: [
      "All Platforms",
      "Android",
      "iOS",
      "macOS",
      "Windows"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "Video SDK v4.x provides video enhancement extensions for beautification, underexposed video enhancement, color enhancement, and video denoising.",
    title: "How to enable the video enhancement extensions?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/image_enhancement",
    platforms: [
      "All Platforms",
      "Web",
      "Android",
      "iOS",
      "macOS",
      "Flutter",
      "React Native",
      "Electron",
      "Windows",
      "Unity"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "During a video call or live streaming, users often want to improve their on-screen appearance, which can help improve their confidence. The Agora Video SDK provides APIs to help you easily implement basic image enhancement. Users can enable",
    title: "How can I enable image enhancement?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/ios_sign",
    platforms: [
      "All Platforms",
      "iOS"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "When deploying the Xcode project to an iOS device for debugging, the following error occurs:",
    title: "How to resolve Xcode project compilation failure due to missing development team configuration information?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/ios_app_unity_reports_error",
    platforms: [
      "All Platforms",
      "Unity",
      "iOS"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "When you package and upload an app developed using Unity 4.x SDK directly to the App Store, you may receive the following error message:",
    title: "Why does an iOS app developed using Unity 4.x SDK report an error when uploaded to the App Store?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/profile_difference",
    platforms: [
      "All Platforms",
      "Android",
      "iOS",
      "macOS",
      "Flutter",
      "React Native",
      "Electron",
      "Windows",
      "Unity"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "To apply optimization algorithms for different real-time engagement scenarios, Agora provides a setChannelProfile method for the Video SDK channel. You can use this method to set the channel profile as either CHANNELPROFILECOMMUNICATION or",
    title: "What are the differences between the COMMUNICATION and LIVE_BROADCASTING profiles?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/cmd_control_record",
    platforms: [
      "All Platforms",
      "Linux"
    ],
    products: [
      "All Products",
      "On-premise Recording"
    ],
    summary: "If you use the automatic mode (default), the recording starts automatically when a user joins the channel. In this mode, you cannot pause the recording.",
    title: "How do I control recording sessions in the command-line interface?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/flutter_pod",
    platforms: [
      "All Platforms",
      "Flutter"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "When running pod install, the following error occurs:",
    title: "How to handle errors when running the pod install command?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/fail_to_upload",
    platforms: [
      "All Platforms",
      "RESTful API"
    ],
    products: [
      "All Products",
      "Cloud Recording"
    ],
    summary: "If you cannot find any recorded files in the cloud storage after a cloud recording session, check if any of the following situations occurred:",
    title: "Why are there no recorded files in the cloud storage?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/acquire_file_directory",
    platforms: [
      "All Platforms",
      "RESTful API"
    ],
    products: [
      "All Products",
      "Cloud Recording"
    ],
    summary: "The URL of the M3U8 file consists of the domain of your cloud storage and the filename. You can copy the URL in your cloud storage.",
    title: "How can I get the URL of the M3U8 file?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/reduce_app_size_rtc",
    platforms: [
      "All Platforms",
      "Windows",
      "Android",
      "iOS",
      "macOS"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "This article describes how to reduce the app size after integrating the Video SDK Native SDK.",
    title: "How can I reduce the app size after integrating the Video SDK Native SDK?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/stop_cloud_recording",
    platforms: [
      "All Platforms",
      "RESTful API"
    ],
    products: [
      "All Products",
      "Cloud Recording"
    ],
    summary: "You can call the stop method to leave the channel and stop recording.",
    title: "How can I stop cloud recording?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/stop_class",
    platforms: [
      "All Platforms",
      "Android",
      "iOS",
      "Electron",
      "Web"
    ],
    products: [
      "All Products",
      "Flexible Classroom"
    ],
    summary: "In Flexible Classroom, the teacher clicks Leave Classroom to leave temporarily, which will not change the classroomroom state. To end the class, refer to the following steps:",
    title: "How to end a class?"
  },
  {
    category: "integration-issues",
    href: "/en/api-reference/faq/integration/dynamic_or_static_library",
    platforms: [
      "All Platforms",
      "Android",
      "Windows",
      "iOS",
      "macOS"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming"
    ],
    summary: "Static libraries and Dynamic Link Libraries (DLL) are both used for organizing and sharing code in programming. In earlier versions, the Video SDK utilized static libraries on certain platforms. However, there are several drawbacks associat",
    title: "Why are dynamic libraries preferred over static libraries in the Video SDK?"
  },
  {
    category: "quality-issues",
    href: "/en/api-reference/faq/quality/sei",
    platforms: [
      "All Platforms",
      "Android",
      "iOS",
      "macOS",
      "Flutter",
      "React Native",
      "Electron",
      "Windows",
      "Unity"
    ],
    products: [
      "All Products",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "By default, Agora adds the encoding information of the current video to the transcoded H264/H265 SEI (Supplemental Enhancement Information) during Media Push. The encoding information is a JSON string. The following is the sample code:",
    title: "How to solve SEI-related issues?"
  },
  {
    category: "quality-issues",
    href: "/en/api-reference/faq/quality/web_screen_share_issues",
    platforms: [
      "All Platforms",
      "Web"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "When a Web client shares the screen, the screen freezes or blurs.",
    title: "How can I solve the quality issues of screen sharing on Web clients?"
  },
  {
    category: "quality-issues",
    href: "/en/api-reference/faq/quality/video_bighead",
    platforms: [
      "All Platforms",
      "Android",
      "iOS",
      "macOS",
      "Flutter",
      "React Native",
      "Electron",
      "Windows",
      "Unity"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "Big headshot and letterbox issues occur when the video size does not match the display window size and under the following scenarios:",
    title: "Why do I see a big headshot or letterboxing?"
  },
  {
    category: "quality-issues",
    href: "/en/api-reference/faq/quality/optimize_video_rendering",
    platforms: [
      "All Platforms",
      "Android",
      "iOS",
      "macOS",
      "Windows"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "When using the Agora Video SDK for real-time Video Calling, Interactive Live Streaming, or Broadcast Streaming, some developers observe that the remote video takes too long to display after joining a channel. This delay can negatively impac",
    title: "How do I troubleshoot slow first-frame rendering of remote video when using the Agora Video SDK?"
  },
  {
    category: "quality-issues",
    href: "/en/api-reference/faq/quality/video_freeze",
    platforms: [
      "All Platforms",
      "Web",
      "Android",
      "iOS",
      "macOS",
      "Flutter",
      "React Native",
      "Electron",
      "Windows",
      "Unity"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "Choppy video may be caused by a slow network connection or sub-optimal device performance. Complete the following steps to troubleshoot choppy video.",
    title: "Why is my video choppy?"
  },
  {
    category: "quality-issues",
    href: "/en/api-reference/faq/quality/audio_noise",
    platforms: [
      "All Platforms",
      "Web",
      "Android",
      "iOS",
      "macOS",
      "Flutter",
      "React Native",
      "Electron",
      "Windows",
      "Unity"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "Noise may be caused by the physical environment or recording and playback devices rather than the SDK.",
    title: "Why can I hear the noise in a call?"
  },
  {
    category: "quality-issues",
    href: "/en/api-reference/faq/quality/unsynchronized_video",
    platforms: [
      "All Platforms",
      "Web",
      "Android",
      "iOS",
      "macOS",
      "Flutter",
      "React Native",
      "Electron",
      "Windows",
      "Unity"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "Unsynchronized audio and video may be caused by the following:",
    title: "How can I fix unsynchronized audio and video?"
  },
  {
    category: "quality-issues",
    href: "/en/api-reference/faq/quality/video_blank",
    platforms: [
      "All Platforms",
      "Web",
      "Android",
      "iOS",
      "macOS",
      "Flutter",
      "React Native",
      "Electron",
      "Windows",
      "Unity"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "A user may encounter black screen issues in the following scenarios:",
    title: "How can I fix black screen issues?"
  },
  {
    category: "quality-issues",
    href: "/en/api-reference/faq/quality/adjust_music_volume",
    platforms: [
      "All Platforms",
      "Android",
      "iOS"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "In mobile devices, users play background music in the background, and after joining the RTC channel, users can't change the volume of the background music by adjusting the system volume.",
    title: "Why can't I adjust the background music through the system volume?"
  },
  {
    category: "quality-issues",
    href: "/en/api-reference/faq/quality/ios_bluetooth",
    platforms: [
      "All Platforms",
      "Android",
      "iOS"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "After connecting a Bluetooth device to an iOS or Android device, you may encounter the following issues:",
    title: "Why can't I answer calls through a Bluetooth device after connecting it to an iOS or Android device?"
  },
  {
    category: "quality-issues",
    href: "/en/api-reference/faq/quality/android_background",
    platforms: [
      "All Platforms",
      "Android"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "After screen locking or switching to the background on some Android versions, you may encounter the following issues:",
    title: "Why do apps on some Android versions fail to capture audio and video after screen locking or switching to the background?"
  },
  {
    category: "quality-issues",
    href: "/en/api-reference/faq/quality/echo",
    platforms: [
      "All Platforms",
      "Android",
      "iOS",
      "macOS",
      "Windows"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "The Agora SDK supports echo cancellation. In most cases, this problem can be fixed by using a headset, and ensure that the headset does not cause an echo.",
    title: "How can I solve echo problems?"
  },
  {
    category: "quality-issues",
    href: "/en/api-reference/faq/quality/audio_video_issues_in_classroom",
    platforms: [
      "All Platforms",
      "Android",
      "iOS",
      "macOS",
      "Flutter",
      "React Native",
      "Electron",
      "Windows",
      "Unity"
    ],
    products: [
      "All Products",
      "Flexible Classroom"
    ],
    summary: "Check your browser's permission to use your camera and microphone.",
    title: "How to deal with audio and video related issues in Flexible Classroom?"
  },
  {
    category: "quality-issues",
    href: "/en/api-reference/faq/quality/audio_freeze",
    platforms: [
      "All Platforms",
      "Web",
      "Android",
      "iOS",
      "macOS",
      "Flutter",
      "React Native",
      "Electron",
      "Windows",
      "Unity"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "Jitter may be caused by slow Internet connections, bad device performances, or the physical environment.",
    title: "Why does audio freezing occur in a call?"
  },
  {
    category: "quality-issues",
    href: "/en/api-reference/faq/quality/web-native_video_issues",
    platforms: [
      "All Platforms",
      "Web"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "When a Web client and a Native client communicate with each other the receiving end sees a black, green, or pixelated screen.",
    title: "How can I fix black, green, or pixelated video when a Web client and a Native client communicate with each other?"
  },
  {
    category: "quality-issues",
    href: "/en/api-reference/faq/quality/flutter_debug",
    platforms: [
      "All Platforms",
      "Flutter"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "On devices running iOS 14 and above, Flutter apps installed in debug mode cannot be reopened using the home screen icon, deep linking, or other methods. Additionally, if an iOS app integrates a Flutter module in debug mode, reopening the ap",
    title: "Why can't a Flutter App installed on iOS 14 and above devices be reopened in debug mode?"
  },
  {
    category: "quality-issues",
    href: "/en/api-reference/faq/quality/device_occupied",
    platforms: [
      "All Platforms",
      "Android",
      "Web"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "We recommed referring to the following logic when implementing your code:",
    title: "Why does the SDK stop sending audio or video after the user uses a third-party app?"
  },
  {
    category: "quality-issues",
    href: "/en/api-reference/faq/quality/video_camera",
    platforms: [
      "All Platforms",
      "Web",
      "Android",
      "iOS",
      "macOS",
      "Flutter",
      "React Native",
      "Electron",
      "Windows",
      "Unity"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "There are many reasons for a camera start failure. Check the following:",
    title: "Why can't I turn on the camera?"
  },
  {
    category: "quality-issues",
    href: "/en/api-reference/faq/quality/record_status_error",
    platforms: [
      "All Platforms",
      "Linux"
    ],
    products: [
      "All Products",
      "On-premise Recording"
    ],
    summary: "If Error: 3, with statcode:16 is reported, the recording quits normally. You can determine why the recording quit by the leavepath code.",
    title: "How can I solve issues relating to recording status?"
  },
  {
    category: "quality-issues",
    href: "/en/api-reference/faq/quality/record_split",
    platforms: [
      "All Platforms",
      "Linux"
    ],
    products: [
      "All Products",
      "On-premise Recording"
    ],
    summary: "During the recording process, if the recorded audio and video format is not the recording original audio and video data format, the following situations result in file splitting:",
    title: "Why is the recording file split?"
  },
  {
    category: "quality-issues",
    href: "/en/api-reference/faq/quality/pixelated_green_video",
    platforms: [
      "All Platforms",
      "Android",
      "iOS",
      "macOS",
      "Windows"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "Pixelated video contains irregular pixels with incorrect colors, preventing the video from displaying an image.",
    title: "Why is my video pixelated or jagged and green?"
  },
  {
    category: "quality-issues",
    href: "/en/api-reference/faq/quality/ios_background",
    platforms: [
      "All Platforms",
      "iOS"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "After locking the iOS device or switching the app to the background, the audio cannot be heard, and the video screen is stuck at the last frame before switching to the background.",
    title: "Why is the audio and video capture invalid after some iOS versions of apps are locked or switched to the background?"
  },
  {
    category: "quality-issues",
    href: "/en/api-reference/faq/quality/record_file_issue",
    platforms: [
      "All Platforms",
      "Linux"
    ],
    products: [
      "All Products",
      "On-premise Recording"
    ],
    summary: "If the Native/Web SDK and Recording SDK are in the same channel during the same time, contact Agora customer support.",
    title: "How can I solve issues relating to recording files?"
  },
  {
    category: "quality-issues",
    href: "/en/api-reference/faq/quality/audio_noaudio",
    platforms: [
      "All Platforms",
      "Android",
      "iOS",
      "macOS",
      "Flutter",
      "React Native",
      "Electron",
      "Windows",
      "Unity"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "During real-time engagement, users may experience a total loss of sound in the following scenarios:",
    title: "How can I troubleshoot the issue of no sound?"
  },
  {
    category: "quality-issues",
    href: "/en/api-reference/faq/quality/audio_role",
    platforms: [
      "All Platforms",
      "Android",
      "iOS"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "To ensure a better audio experience in different scenarios, by default, the SDK adjusts the underlying audio settings when the user switches user roles, as follows:",
    title: "How can I prevent volume changes when the users switch their roles in an interactive live streaming channel?"
  },
  {
    category: "quality-issues",
    href: "/en/api-reference/faq/quality/video_blur",
    platforms: [
      "All Platforms",
      "Web",
      "Android",
      "iOS",
      "macOS",
      "Flutter",
      "React Native",
      "Electron",
      "Windows",
      "Unity"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "Blurry videos may be caused by low bitrates and resolution ratios.",
    title: "Why is my video blurry?"
  },
  {
    category: "quality-issues",
    href: "/en/api-reference/faq/quality/track_ended",
    platforms: [
      "All Platforms",
      "Web"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "During a call or live broadcast, the audio that a web client is sending suddenly becomes silent, or the video goes black. After checking the log, you find that this occurred because the audio or video track stopped.",
    title: "How to deal with the sudden silent audio or black video due to tracks being stopped?"
  },
  {
    category: "quality-issues",
    href: "/en/api-reference/faq/quality/audio_low",
    platforms: [
      "All Platforms",
      "Android",
      "iOS",
      "macOS",
      "Flutter",
      "React Native",
      "Electron",
      "Windows",
      "Unity"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "Check the following:",
    title: "How can I solve the problem of low volume?"
  },
  {
    category: "general-product-inquiry",
    href: "/en/api-reference/faq/product/onpremise_cloud",
    platforms: [
      "All Platforms",
      "RESTful API",
      "Linux"
    ],
    products: [
      "All Products",
      "Cloud Recording",
      "On-premise Recording"
    ],
    summary: "Agora On-Premise Recording and Agora Cloud Recording are add-ons to record and save voice calls, video calls, and interactive streaming on your Linux server and your cloud storage.",
    title: "What's the difference between on-premise recording and cloud recording?"
  },
  {
    category: "general-product-inquiry",
    href: "/en/api-reference/faq/product/platform_version",
    platforms: [
      "All Platforms",
      "Web",
      "Android",
      "iOS",
      "macOS",
      "Flutter",
      "React Native",
      "Electron",
      "Windows",
      "Unity",
      "RESTful API",
      "Linux"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming",
      "Agora Chat",
      "Signaling",
      "Interactive Whiteboard",
      "Agora Analytics",
      "Cloud Recording",
      "On-premise Recording",
      "Server Gateway",
      "Flexible Classroom",
      "Media Push",
      "Media Pull",
      "Extensions Marketplace"
    ],
    summary: "This page lists the supported platforms of Agora products.",
    title: "What platforms does Agora support?"
  },
  {
    category: "general-product-inquiry",
    href: "/en/api-reference/faq/product/recording_concurrence",
    platforms: [
      "All Platforms",
      "Linux"
    ],
    products: [
      "All Products",
      "On-premise Recording"
    ],
    summary: "For the Agora On-Premise Recording SDK, we conduct tests on the recording concurrency based on the following cloud hosting configuration:",
    title: "What is recording concurrency?"
  },
  {
    category: "general-product-inquiry",
    href: "/en/api-reference/faq/product/rtm_emoji",
    platforms: [
      "All Platforms",
      "Web",
      "Android",
      "iOS",
      "macOS",
      "Linux",
      "RESTful API",
      "Windows"
    ],
    products: [
      "All Products",
      "Signaling"
    ],
    summary: "Agora Signaling SDK supports the Unicode Character Table, so it supports all emoji defined in the Unicode Character Table. You may as well define your own emoji character set, decode based on your specifications, and render the desired emoj",
    title: "Does Agora Signaling SDK support emoji?"
  },
  {
    category: "general-product-inquiry",
    href: "/en/api-reference/faq/product/agora_product",
    platforms: [
      "All Platforms",
      "Web",
      "Android",
      "iOS",
      "macOS",
      "Flutter",
      "React Native",
      "Electron",
      "Windows",
      "Unity",
      "RESTful API",
      "Linux"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming",
      "Signaling",
      "Cloud Recording",
      "On-premise Recording"
    ],
    summary: "Agora is a Platform as a Service (PaaS) provider that enables real-time communicatons with easy-to-embed SDKs and RESTful APIs. Through calling the APIs, you can add the following functions in your applications:",
    title: "What products does Agora provide?"
  },
  {
    category: "general-product-inquiry",
    href: "/en/api-reference/faq/product/rtm_concurrency",
    platforms: [
      "All Platforms",
      "Web",
      "Android",
      "iOS",
      "macOS",
      "Linux",
      "RESTful API",
      "Windows"
    ],
    products: [
      "All Products",
      "Signaling"
    ],
    summary: "The Agora Signaling SDK does not impose a hard limit on the number of concurrent online users. However, your pricing plan may impose a Peak Concurrent User (PCU) limit. Exceeding this limit could result in additional charges or service rest",
    title: "Does the Agora Signaling SDK limit concurrent users or channel message frequency?"
  },
  {
    category: "general-product-inquiry",
    href: "/en/api-reference/faq/product/capacity",
    platforms: [
      "All Platforms",
      "Web",
      "Android",
      "iOS",
      "macOS",
      "Flutter",
      "React Native",
      "Electron",
      "Windows",
      "Unity",
      "RESTful API",
      "Linux"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "The Agora Video SDK provides real-time audio and video services for many users. The number of concurrent channels is unlimited, and each channel supports up to 1 million concurrent online users.",
    title: "How many users can Agora Video SDK support at the same time?"
  },
  {
    category: "general-product-inquiry",
    href: "/en/api-reference/faq/product/audio_format",
    platforms: [
      "All Platforms",
      "Android",
      "iOS",
      "macOS",
      "Windows"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "The Agora Video SDK provides a series of methods to manage audio files. The support of each method for single-track or multi-track audio files is as follows:",
    title: "Which audio file formats does the Agora Video SDK support?"
  },
  {
    category: "general-product-inquiry",
    href: "/en/api-reference/faq/product/conversion_limitation",
    platforms: [
      "All Platforms",
      "Web",
      "Android",
      "iOS",
      "RESTful API"
    ],
    products: [
      "All Products",
      "Interactive Whiteboard"
    ],
    summary: "Agora Interactive Whiteboard provides the dynamic file conversion function for converting PPTX files edited with Microsoft PowerPoint to HTML web pages. The generated files preserve animations present in the source files.",
    title: "What PowerPoint features are not supported by the dynamic file conversion function?"
  },
  {
    category: "general-product-inquiry",
    href: "/en/api-reference/faq/product/call_api_in_browser",
    platforms: [
      "All Platforms",
      "RESTful API"
    ],
    products: [
      "All Products",
      "Cloud Recording"
    ],
    summary: "A Web API needs to make a cross-origin request in accordance with Cross-Origin Resource Sharing (CORS) to call the Cloud Recording RESTful API. The browser must first send an OPTIONS request to the server to query if the server accepts cros",
    title: "Why can't I call the Cloud Recording RESTful API through a web browser?"
  },
  {
    category: "general-product-inquiry",
    href: "/en/api-reference/faq/product/vr_headset",
    platforms: [
      "All Platforms",
      "Android",
      "iOS",
      "Windows",
      "Unity"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "The Agora Video SDK is compatible with VR (Virtual Reality) headsets on the following operating systems:",
    title: "Which VR headsets are compatible with the Agora Video SDK?"
  },
  {
    category: "general-product-inquiry",
    href: "/en/api-reference/faq/product/differ_agora_cdn",
    platforms: [
      "All Platforms",
      "Web",
      "Android",
      "iOS",
      "macOS",
      "Flutter",
      "React Native",
      "Electron",
      "Windows",
      "Unity"
    ],
    products: [
      "All Products",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "Most CDN + RTMP technologies for live streaming allow users to watch the live steaming in a web browser, which lowers the audience's threshold. Agora provides a solution for SD-RTN™, host, and audience to have the same real-time communicati",
    title: "What is the difference between Agora Live Interactive Streaming and common CDN + RTMP technologies?"
  },
  {
    category: "general-product-inquiry",
    href: "/en/api-reference/faq/product/browser_support",
    platforms: [
      "All Platforms",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    products: [
      "All Products",
      "Web"
    ],
    summary: "The section lists the browsers that the Agora Video SDK Web SDK supports on different platforms.",
    title: "Which browsers does the Agora Web SDK support?"
  },
  {
    category: "general-product-inquiry",
    href: "/en/api-reference/faq/product/streaming_difference",
    platforms: [
      "All Platforms"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "The following table compares the different live broadcasting solutions.",
    title: "What are the differences between various live broadcasting solutions?"
  },
  {
    category: "account-and-billing",
    href: "/en/api-reference/faq/account/billing_free",
    platforms: [
      "All Platforms",
      "Web",
      "Android",
      "iOS",
      "macOS",
      "Flutter",
      "React Native",
      "Electron",
      "Windows",
      "Unity",
      "RESTful API",
      "Linux"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming",
      "Cloud Recording",
      "On-premise Recording"
    ],
    summary: "Agora gives each Agora Account 10,000 free-of-charge minutes each month, and deducts the minutes in the following sequence:",
    title: "Agora's free-of-charge policy for the first 10,000 minutes?"
  },
  {
    category: "account-and-billing",
    href: "/en/api-reference/faq/account/email_verification",
    platforms: [
      "All Platforms",
      "Web",
      "Android",
      "iOS",
      "macOS",
      "Flutter",
      "React Native",
      "Electron",
      "Windows",
      "Unity",
      "RESTful API",
      "Linux"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming",
      "Agora Chat",
      "Signaling",
      "Interactive Whiteboard",
      "Agora Analytics",
      "Cloud Recording",
      "On-premise Recording",
      "Server Gateway",
      "Flexible Classroom",
      "Media Push",
      "Media Pull",
      "Extensions Marketplace"
    ],
    summary: "When you perform the following operations on Agora Console, Agora sends a verification email to you or your member:",
    title: "What should I do if I cannot receive the verification email from Agora?"
  },
  {
    category: "account-and-billing",
    href: "/en/api-reference/faq/account/billing_basis",
    platforms: [
      "All Platforms",
      "Web",
      "Android",
      "iOS",
      "macOS",
      "Flutter",
      "React Native",
      "Electron",
      "Windows",
      "Unity",
      "RESTful API",
      "Linux"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming",
      "Cloud Recording",
      "On-premise Recording"
    ],
    summary: "In Real-time Communication(Video SDK), service minutes are calculated either by the number of users or by the number of streams. Agora calculates service minutes by the number of users.",
    title: "How does Agora calculate service minutes?"
  },
  {
    category: "account-and-billing",
    href: "/en/api-reference/faq/account/rtm_project_suspended",
    platforms: [
      "All Platforms",
      "Web",
      "Android",
      "iOS",
      "macOS",
      "Flutter",
      "React Native",
      "Electron",
      "Windows",
      "Unity",
      "RESTful API",
      "Linux"
    ],
    products: [
      "All Products",
      "Signaling"
    ],
    summary: "If the number of daily active users (DAU) in your Signaling project exceeds 1,000, check whether you have registered with Agora and done any of the following:",
    title: "What Should I do If the DAU in My Signaling Project Exceeds 1000?"
  },
  {
    category: "account-and-billing",
    href: "/en/api-reference/faq/account/console_account_faq",
    platforms: [
      "All Platforms",
      "Web",
      "Android",
      "iOS",
      "macOS",
      "Flutter",
      "React Native",
      "Electron",
      "Windows",
      "Unity",
      "RESTful API",
      "Linux"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming",
      "Agora Chat",
      "Signaling",
      "Interactive Whiteboard",
      "Agora Analytics",
      "Cloud Recording",
      "On-premise Recording",
      "Server Gateway",
      "Flexible Classroom",
      "Media Push",
      "Media Pull",
      "Extensions Marketplace"
    ],
    summary: "This page provides solutions to issues that users may encounter when using Agora Console.",
    title: "How can I solve account issues in Agora Console?"
  },
  {
    category: "account-and-billing",
    href: "/en/api-reference/faq/account/billing_account",
    platforms: [
      "All Platforms",
      "Web",
      "Android",
      "iOS",
      "macOS",
      "Flutter",
      "React Native",
      "Electron",
      "Windows",
      "Unity",
      "RESTful API",
      "Linux"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming",
      "Agora Chat",
      "Signaling",
      "Interactive Whiteboard",
      "Agora Analytics",
      "Cloud Recording",
      "On-premise Recording",
      "Server Gateway",
      "Flexible Classroom",
      "Media Push",
      "Media Pull",
      "Extensions Marketplace"
    ],
    summary: "Agora Console provides you with information on billing, fee deductions, and any suspension to your account based on the account type.",
    title: "What are Agora's policies on billing, fee deductions, and account suspension?"
  },
  {
    category: "other-issues",
    href: "/en/api-reference/faq/other/ios_privacy_manifest",
    platforms: [
      "All Platforms",
      "iOS",
      "Unity",
      "Flutter",
      "React Native",
      "Unreal Engine"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming",
      "Agora Chat",
      "Signaling"
    ],
    summary: "To ensure the privacy and security of end users, Apple requires that all apps listed on its App Store provide a privacy manifest file in accordance with its requirements. The privacy manifest is a property list that records the types of dat",
    title: "How can I add a privacy manifest to my iOS app?"
  },
  {
    category: "other-issues",
    href: "/en/api-reference/faq/other/android_noaudio",
    platforms: [
      "All Platforms",
      "Android"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming"
    ],
    summary: "Some Android sample apps provided by Agora maintain a global RtcEngine instance in WorkerThread that keeps alive while the app is running and is destroyed when the app process is destroyed.",
    title: "Why is the audio routing abnormal after the Android device joins the channel?"
  },
  {
    category: "other-issues",
    href: "/en/api-reference/faq/other/api_download",
    platforms: [
      "All Platforms",
      "Web",
      "Android",
      "iOS",
      "macOS",
      "Linux",
      "Windows"
    ],
    products: [
      "All Products",
      "Video Calling",
      "Voice Calling",
      "Interactive Live Streaming",
      "Broadcast Streaming",
      "On-premise Recording"
    ],
    summary: "Agora updates Agora API references on Dash platform, you can download and view the offline reference in Dash.",
    title: "How can I view Agora API references offline?"
  }
];
