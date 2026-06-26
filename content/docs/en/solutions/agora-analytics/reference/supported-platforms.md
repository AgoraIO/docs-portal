---
title: "Supported platforms"
description: "A list of platforms supported by Agora Analytics."
---

- *Android*:
    | Browser or application | Receiving streams | Sending streams |
    |:-----------------|:-------|:-----|
    | The latest version of Chrome         | Supported   | Supported |
    | The latest version of WeChat| Supported     | Supported |

- *iOS*:
    |Operating system |Features |VP8 |	H.264|
    |:-----|:-----|:-----|:-----|
    |Applications with  built-in WebView|Receiving streams|iOS 12.2 and later |iOS 12.1.4 and later|
    |Applications with  built-in WebView| Sending streams|iOS 14.3 and later |iOS 14.3 and later|
    |Safari |Sending and receiving streams |OS 12.2 and later |iOS 11 and later|

- *Desktop*:
    | Operating system | Browsers | Receiving streams | Sending streams |
    |:-----|:-----|:-----|:-----|
    | macOS | <Slot name="macos" /> | Supported | Supported |
    | Windows | <Slot name="windows" /> | Supported | Supported |
    | ChromeOS | Chrome | Supported | Supported |

    <Slot for="macos">

    - Chrome
    - Firefox
    - Safari
    - Edge

    </Slot>

    <Slot for="windows">

    - Chrome
    - Firefox
    - Edge

    </Slot>

To ensure the best user experience, best practice is to use the latest version each browser on the latest version of the operating system. Download the latest version of:

    - [Chrome](https://www.google.com/intl/en/chrome/)
    - [Firefox](https://www.mozilla.org/firefox/new/)
    - [Edge](https://microsoft.com/edge)
    - [Safari](https://support.apple.com/en-hk/HT201541)
