---
title: "Browser autoplay"
description: "Handle autoplay failures in Agora Web SDK."
---

To give users more control over media playback, browsers limit autoplay. They often require user interaction, like clicking or tapping, before audio can play. This prevents disruptive or unexpected audio from automatically starting when users visit a webpage, leading to a smoother and less intrusive experience.

In most browsers, video without sound can autoplay without restriction. However, on iOS devices, video autoplay may be restricted in specific cases:

- iOS Safari when in low-power mode.
- iOS WKWebView, such as in the WeChat browser, if custom autoplay restrictions are enabled.

## Understand the tech

When using the Agora Web SDK, calling `play()` on audio or video tracks before any user interaction may cause the media to fail due to autoplay restrictions. As a result, users may neither hear the audio nor see the video.

To handle autoplay restrictions when using the Web SDK, consider one of the following approaches:

**Remove autoplay restriction via callback**: If autoplay fails, use the `onAutoplayFailed` callback to display a button, prompting users to interact with the page and remove the autoplay restriction.

**Ensure interaction before playback**: Ensure that the user interacts with the page before calling `play()`. This guarantees that media plays as intended.
:::note
Even with these solutions, autoplay restrictions require users to interact with the page before media can play. Over time, if users frequently visit the page, browsers may relax the autoplay policy for that specific page. However, this behavior cannot be detected or controlled through JavaScript.
:::
## Prerequisites

Ensure that you have implemented the [SDK quickstart](../../index) in your project. 

## Implementation

This section explains how to handle autoplay failures and ensure media plays properly when user interaction is required.

### Handle autoplay failure using `onAutoplayFailed`

When an audio or video track fails to play automatically, use the `onAutoplayFailed` callback to prompt users to resume playback with a button click.

Refer to the following sample code to display a button to handle autoplay failure:

```javascript
AgoraRTC.onAutoplayFailed = () => {
 const btn = document.createElement("button");
 btn.innerText = "Click me to resume the audio/video playback";
 btn.onclick = () => {
  btn.remove();
 };
 document.body.append(btn);
};
```
:::note
If multiple audio or video track objects attempt to play automatically within a short time and autoplay fails, the `onAutoplayFailed` callback is triggered only once. After the user clicks to resume playback, the callback does not fire again for subsequent tracks until user interaction resumes.
:::
### Handle autoplay failure in iOS Safari/WebView

For desktop browsers, ensuring interaction before playback resolves most autoplay restrictions. However, iOS Safari/WebView has more stringent autoplay policies:

- iOS Safari allows audio playback only when directly triggered by user interaction.
- Autoplay restrictions are not removed after the user interacts.

To support iOS Safari/WebView, adapt your user interaction flow to meet these stricter requirements.

For example, display an icon to indicate that the remote user is muted. This guides the user to click the icon to play the remote user's audio. Refer to the following sample code:

HTML:
```html
<div id="user1-audio">Muted</div>
```

```javascript
document.getElementById("user1-audio").onclick = (e) => {
 if (user1.audioTrack.isPlaying) {
  user1.audioTrack.stop();
  e.target.innerHTML = "Muted";
 } else {
  user1.audioTrack.play();
  e.target.innerHTML = "Playing";
 }
};
```

This approach ensures that the playback is user-triggered and compliant with iOS Safari's strict autoplay policy.

## Reference
This section contains content that completes the information on this page, or points you to documentation that explains other aspects to this product.

### API reference

- [`onAutoplayFailed`](https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/iagorartc.html#onautoplayfailed)
