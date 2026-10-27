# 中文文档后续事项清单

27 个源文件本身没有实质正文的页面，已按用户要求排除后续处理。它们不是验证通过项；本清单只列 IoT 工程缺失及外链事项。

本清单整理既有的 2026-10-26／27 核查证据，没有重新进行网络探测。已剔除被替换的旧址、改为代码展示的示例地址，以及已取得有效补证的条目。计数按包含锚点的完整 URL 去重，不按重复引用次数计数。

## 1. IoT Android 示例工程缺失

- 原仓库：[AgoraIO-Community/ag-iot-callkit-android-app](https://github.com/AgoraIO-Community/ag-iot-callkit-android-app)。既有仓库/API检查为 404，未找到可靠的 Android 替代工程。
- 影响页面：`content/docs/zh-CN/solutions/iot-apaas/build/implement-core-features/client-call-minimum.mdx` 的“跑通示例项目”。正文已说明需确认获取方式。
- 需要产品方提供：匹配该文档及 SDK 版本的 Android 工程仓库或下载包，以及访问权限说明。

## 2. 外链清单

共有 **325 个待访问／定位核查的完整 URL**，另有 **1 个已定位的链接格式异常**。全部 326 条的来源和原因同时提供在 [CSV 清单](./cn-doc-link-follow-up.csv) 中。待核查不等于确认断链。

| 分类 | 完整 URL 数 |
| --- | ---: |
| Gitee | 166 |
| npm | 28 |
| Google / Android / Flutter | 40 |
| WebKit / Chromium / Mozilla 问题单 | 26 |
| Apple 文档 | 11 |
| 平台入口及其他网站 | 54 |
| 链接格式异常 | 1 |

### 已定位的格式异常

`content/docs/zh-CN/api-reference/conversational-ai/restclient-java/struct.mdx:900` 的 OpenAI 链接在目标地址中混入了 ``[`create`](convoaiclient#create)``。需改回完整的 `https://platform.openai.com/docs/api-reference/realtime-client-events/conversation/item/create` 后复核；同地址的正常写法目前也有 HTTP 403 记录。此项与登录或反爬限制分开列出，本轮仅整理清单。

### 逐条列表

#### analytics-lab.agora.io（4）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 1 | [https://analytics-lab.agora.io/analytics/call/search](<https://analytics-lab.agora.io/analytics/call/search>) | 跳转至登录页，尚未确认登录后的目标 | `content/docs/zh-CN/solutions/art-class/get-started/quick-start.mdx:98（另 3 处，见 CSV）` |
| 2 | [https://analytics-lab.agora.io/analytics/call/search?token=xxxxxxxxxxxxxxxxxxxxxx&locale=zh&timezone=UTC&showProjectSelector=true&projectId=xxxxxxxxx](<https://analytics-lab.agora.io/analytics/call/search?token=xxxxxxxxxxxxxxxxxxxxxx&locale=zh&timezone=UTC&showProjectSelector=true&projectId=xxxxxxxxx>) | HTTP 401：需要认证 | `content/docs/zh-CN/realtime-media/usage-analytics/build/embed-and-maintain-data-service/embeded.mdx:205` |
| 3 | [https://analytics-lab.agora.io/api/analytics/research](<https://analytics-lab.agora.io/api/analytics/research>) | HTTP 401：需要认证 | `content/docs/zh-CN/realtime-media/usage-analytics/build/embed-and-maintain-data-service/embeded.mdx:109` |
| 4 | [https://analytics-lab.agora.io/api/analytics/research?token=xxxxxxxxxxxxxxxxxxxxxx&cname=xxxxxxxxxxxxxxxxxxxxxxxx&fromUid=xxxxxx&toUid=xxxxxx](<https://analytics-lab.agora.io/api/analytics/research?token=xxxxxxxxxxxxxxxxxxxxxx&cname=xxxxxxxxxxxxxxxxxxxxxxxx&fromUid=xxxxxx&toUid=xxxxxx>) | HTTP 401：需要认证 | `content/docs/zh-CN/realtime-media/usage-analytics/build/embed-and-maintain-data-service/embeded.mdx:137` |

#### analytics-lab.shengwang.cn（2）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 5 | [https://analytics-lab.shengwang.cn/](<https://analytics-lab.shengwang.cn/>) | 跳转至登录页，尚未确认登录后的目标 | `content/docs/zh-CN/api-reference/analytics/general/overview/product-overview.mdx:12` |
| 6 | [https://analytics-lab.shengwang.cn/analytics/call/search](<https://analytics-lab.shengwang.cn/analytics/call/search>) | 跳转至登录页，尚未确认登录后的目标 | `content/docs/zh-CN/api-reference/online-art-teaching/android/overview/product-overview.mdx:74（另 21 处，见 CSV）` |

#### app.mokahr.com（1）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 7 | [https://app.mokahr.com/apply/agora/6334#/](<https://app.mokahr.com/apply/agora/6334#/>) | 重定向循环，需核对目标 | `src/lib/footer-content.ts:250` |

#### blog.audiokinetic.com（1）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 8 | [https://blog.audiokinetic.com/zh/building-spatial-audio-effects-using-wwise/](<https://blog.audiokinetic.com/zh/building-spatial-audio-effects-using-wwise/>) | HTTP 403：访问被拒绝，可能涉及权限或反爬 | `content/docs/zh-CN/solutions/game-voice/build/spatial-audio-wwise.mdx:856` |

#### blog.golang.org（1）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 9 | [https://blog.golang.org/go116-module-changes](<https://blog.golang.org/go116-module-changes>) | 请求超时，尚未确认可达性 | `content/docs/zh-CN/realtime-media/meeting/build/generate-token.mdx:33（另 10 处，见 CSV）` |

#### bugs.chromium.org（8）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 10 | [https://bugs.chromium.org/p/chromium/issues/detail?id=1203206&can=2&q=webrtc%20drop%20component%3ABlink%3EWebRTC%3EVideo](<https://bugs.chromium.org/p/chromium/issues/detail?id=1203206&can=2&q=webrtc%20drop%20component%3ABlink%3EWebRTC%3EVideo>) | 仅取得 JavaScript 页面外壳，正文/功能待核查 | `content/docs/zh-CN/realtime-media/rtc/reference/browser-compatibility.mdx:85` |
| 11 | [https://bugs.chromium.org/p/chromium/issues/detail?id=1237677](<https://bugs.chromium.org/p/chromium/issues/detail?id=1237677>) | 仅取得 JavaScript 页面外壳，正文/功能待核查 | `content/docs/zh-CN/realtime-media/rtc/reference/browser-compatibility.mdx:273` |
| 12 | [https://bugs.chromium.org/p/chromium/issues/detail?id=1290390](<https://bugs.chromium.org/p/chromium/issues/detail?id=1290390>) | 仅取得 JavaScript 页面外壳，正文/功能待核查 | `content/docs/zh-CN/api-reference/rtc/react-sdk/web-sdk/interfaces/iagorartcclient.mdx:4295（另 1 处，见 CSV）` |
| 13 | [https://bugs.chromium.org/p/chromium/issues/detail?id=1317548&q=bluetooth&can=2](<https://bugs.chromium.org/p/chromium/issues/detail?id=1317548&q=bluetooth&can=2>) | 仅取得 JavaScript 页面外壳，正文/功能待核查 | `content/docs/zh-CN/realtime-media/rtc/reference/browser-compatibility.mdx:350` |
| 14 | [https://bugs.chromium.org/p/chromium/issues/detail?id=1501352](<https://bugs.chromium.org/p/chromium/issues/detail?id=1501352>) | 仅取得 JavaScript 页面外壳，正文/功能待核查 | `content/docs/zh-CN/realtime-media/rtc/reference/browser-compatibility.mdx:285` |
| 15 | [https://bugs.chromium.org/p/chromium/issues/detail?id=687574](<https://bugs.chromium.org/p/chromium/issues/detail?id=687574>) | 仅取得 JavaScript 页面外壳，正文/功能待核查 | `content/docs/zh-CN/realtime-media/rtc/reference/browser-compatibility.mdx:91` |
| 16 | [https://bugs.chromium.org/p/webrtc/issues/detail?id=12704#c3](<https://bugs.chromium.org/p/webrtc/issues/detail?id=12704#c3>) | 仅取得 JavaScript 页面外壳，正文/功能待核查 | `content/docs/zh-CN/realtime-media/rtc/reference/browser-compatibility.mdx:85` |
| 17 | [https://bugs.chromium.org/p/webrtc/issues/detail?id=4294](<https://bugs.chromium.org/p/webrtc/issues/detail?id=4294>) | 仅取得 JavaScript 页面外壳，正文/功能待核查 | `content/docs/zh-CN/realtime-media/rtc/reference/browser-compatibility.mdx:619` |

#### bugs.webkit.org（14）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 18 | [https://bugs.webkit.org/show_bug.cgi?id=181663](<https://bugs.webkit.org/show_bug.cgi?id=181663>) | 页面要求认证 | `content/docs/zh-CN/realtime-media/rtc/build/extensions/web/image-enhancement.mdx:176` |
| 19 | [https://bugs.webkit.org/show_bug.cgi?id=181663&from_wecom=1](<https://bugs.webkit.org/show_bug.cgi?id=181663&from_wecom=1>) | 页面要求认证 | `content/docs/zh-CN/realtime-media/rtc/build/extensions/web/video-compositing.mdx:385` |
| 20 | [https://bugs.webkit.org/show_bug.cgi?id=226698](<https://bugs.webkit.org/show_bug.cgi?id=226698>) | 页面要求认证 | `content/docs/zh-CN/realtime-media/rtc/reference/browser-compatibility.mdx:511` |
| 21 | [https://bugs.webkit.org/show_bug.cgi?id=230532](<https://bugs.webkit.org/show_bug.cgi?id=230532>) | HTTP 503：服务或网关暂不可用 | `content/docs/zh-CN/realtime-media/rtc/reference/browser-compatibility.mdx:471（另 1 处，见 CSV）` |
| 22 | [https://bugs.webkit.org/show_bug.cgi?id=230537](<https://bugs.webkit.org/show_bug.cgi?id=230537>) | HTTP 503：服务或网关暂不可用 | `content/docs/zh-CN/realtime-media/rtc/reference/release-notes.mdx:7356` |
| 23 | [https://bugs.webkit.org/show_bug.cgi?id=230902](<https://bugs.webkit.org/show_bug.cgi?id=230902>) | HTTP 503：服务或网关暂不可用 | `content/docs/zh-CN/realtime-media/rtc/reference/browser-compatibility.mdx:444` |
| 24 | [https://bugs.webkit.org/show_bug.cgi?id=231105](<https://bugs.webkit.org/show_bug.cgi?id=231105>) | HTTP 503：服务或网关暂不可用 | `content/docs/zh-CN/realtime-media/rtc/reference/browser-compatibility.mdx:493` |
| 25 | [https://bugs.webkit.org/show_bug.cgi?id=231422](<https://bugs.webkit.org/show_bug.cgi?id=231422>) | HTTP 503：服务或网关暂不可用 | `content/docs/zh-CN/realtime-media/rtc/reference/browser-compatibility.mdx:481` |
| 26 | [https://bugs.webkit.org/show_bug.cgi?id=231505](<https://bugs.webkit.org/show_bug.cgi?id=231505>) | HTTP 503：服务或网关暂不可用 | `content/docs/zh-CN/realtime-media/rtc/reference/browser-compatibility.mdx:410` |
| 27 | [https://bugs.webkit.org/show_bug.cgi?id=232599](<https://bugs.webkit.org/show_bug.cgi?id=232599>) | HTTP 503：服务或网关暂不可用 | `content/docs/zh-CN/realtime-media/rtc/reference/browser-compatibility.mdx:511` |
| 28 | [https://bugs.webkit.org/show_bug.cgi?id=238366](<https://bugs.webkit.org/show_bug.cgi?id=238366>) | 页面要求认证 | `content/docs/zh-CN/realtime-media/rtc/reference/browser-compatibility.mdx:424` |
| 29 | [https://bugs.webkit.org/show_bug.cgi?id=246019](<https://bugs.webkit.org/show_bug.cgi?id=246019>) | HTTP 503：服务或网关暂不可用 | `content/docs/zh-CN/realtime-media/rtc/reference/browser-compatibility.mdx:374` |
| 30 | [https://bugs.webkit.org/show_bug.cgi?id=247310](<https://bugs.webkit.org/show_bug.cgi?id=247310>) | 页面要求认证 | `content/docs/zh-CN/realtime-media/rtc/reference/browser-compatibility.mdx:115` |
| 31 | [https://bugs.webkit.org/show_bug.cgi?id=254652](<https://bugs.webkit.org/show_bug.cgi?id=254652>) | HTTP 503：服务或网关暂不可用 | `content/docs/zh-CN/realtime-media/rtc/reference/browser-compatibility.mdx:109` |

#### bugzilla.mozilla.org（3）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 32 | [https://bugzilla.mozilla.org/show_bug.cgi?id=1686470](<https://bugzilla.mozilla.org/show_bug.cgi?id=1686470>) | 页面要求认证 | `content/docs/zh-CN/realtime-media/rtc/reference/browser-compatibility.mdx:158` |
| 33 | [https://bugzilla.mozilla.org/show_bug.cgi?id=1849108](<https://bugzilla.mozilla.org/show_bug.cgi?id=1849108>) | 页面要求认证 | `content/docs/zh-CN/realtime-media/rtc/reference/release-notes.mdx:6428` |
| 34 | [https://bugzilla.mozilla.org/show_bug.cgi?id=1965831](<https://bugzilla.mozilla.org/show_bug.cgi?id=1965831>) | 页面要求认证 | `content/docs/zh-CN/realtime-media/rtc/reference/browser-compatibility.mdx:147` |

#### canvas-conversion-demo.netless.group（2）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 35 | [https://canvas-conversion-demo.netless.group/#/slide/58f35f4dca284a868c19a58663297358/1?prefix=https%3A%2F%2Fconversion-demo-cn.oss-cn-hangzhou.aliyuncs.com%2FdynamicConvert&resolution=4&maxResolutionLevel=4&minFPS=40&maxFPS=200](<https://canvas-conversion-demo.netless.group/#/slide/58f35f4dca284a868c19a58663297358/1?prefix=https%3A%2F%2Fconversion-demo-cn.oss-cn-hangzhou.aliyuncs.com%2FdynamicConvert&resolution=4&maxResolutionLevel=4&minFPS=40&maxFPS=200>) | 仅取得 JavaScript 页面外壳，正文/功能待核查 | `content/docs/zh-CN/realtime-media/ppt-transcoding/reference/convert-ppt.mdx:36（另 2 处，见 CSV）` |
| 36 | [https://canvas-conversion-demo.netless.group/index.html#/](<https://canvas-conversion-demo.netless.group/index.html#/>) | 仅取得 JavaScript 页面外壳，正文/功能待核查 | `content/docs/zh-CN/api-reference/ppt-conversion-service/restful/product-overview.mdx:39（另 1 处，见 CSV）` |

#### chat.deepseek.com（1）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 37 | [https://chat.deepseek.com/](<https://chat.deepseek.com/>) | 仅取得 JavaScript 页面外壳，正文/功能待核查 | `content/docs/zh-CN/introduction/mcp-integrate.mdx:12` |

#### chromestatus.com（1）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 38 | [https://chromestatus.com/feature/5823036655665152](<https://chromestatus.com/feature/5823036655665152>) | 仅取得 JavaScript 页面外壳，正文/功能待核查 | `content/docs/zh-CN/realtime-media/rtc/build/optimize-and-operate/tree-shaking.mdx:64` |

#### cloud.google.com（2）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 39 | [https://cloud.google.com/](<https://cloud.google.com/>) | 请求超时，尚未确认可达性 | `content/docs/zh-CN/api-reference/cloud-recording/restful/overview/product-overview.mdx:161（另 2 处，见 CSV）` |
| 40 | [https://cloud.google.com/storage](<https://cloud.google.com/storage>) | 请求超时，尚未确认可达性 | `content/docs/zh-CN/api-reference/cloud-recording/restful/get-started/quick-start-go.mdx:49（另 9 处，见 CSV）` |

#### codesandbox.io（3）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 41 | [https://codesandbox.io/p/sandbox/github/AgoraIO/quickstart-examples/tree/main/rtc/react-quickstart?file=%2Fpublic%2Findex.html](<https://codesandbox.io/p/sandbox/github/AgoraIO/quickstart-examples/tree/main/rtc/react-quickstart?file=%2Fpublic%2Findex.html>) | HTTP 403：访问被拒绝，可能涉及权限或反爬 | `content/docs/zh-CN/realtime-media/rtc/reference/downloads/react.mdx:26` |
| 42 | [https://codesandbox.io/s/github/AgoraIO/quickstart-examples/tree/main/rtc/react-quickstart](<https://codesandbox.io/s/github/AgoraIO/quickstart-examples/tree/main/rtc/react-quickstart>) | HTTP 403：访问被拒绝，可能涉及权限或反爬 | `content/docs/zh-CN/realtime-media/rtc/get-started/quick-start.mdx:8471` |
| 43 | [https://codesandbox.io/s/github/guoxianzhe/quickstart-examples/tree/react/rtc/react-quickstart?file=/src/styles.css](<https://codesandbox.io/s/github/guoxianzhe/quickstart-examples/tree/react/rtc/react-quickstart?file=/src/styles.css>) | HTTP 403：访问被拒绝，可能涉及权限或反爬 | `content/docs/zh-CN/realtime-media/rtc/get-started/quick-start.mdx:8607` |

#### console-v1.shengwang.cn（1）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 44 | [https://console-v1.shengwang.cn/credentials](<https://console-v1.shengwang.cn/credentials>) | 仅取得 JavaScript 页面外壳，正文/功能待核查 | `content/docs/zh-CN/realtime-media/usage-analytics/build/embed-and-maintain-data-service/embeded.mdx:44` |

#### console.agora.io（1）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 45 | [https://console.agora.io/](<https://console.agora.io/>) | 仅取得 JavaScript 页面外壳，正文/功能待核查 | `content/docs/zh-CN/ai/reference/enable-conversational-ai.md:19（另 1 处，见 CSV）` |

#### console.aws.amazon.com（1）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 46 | [https://console.aws.amazon.com/lambda/home?region=us-east-1#/create/function](<https://console.aws.amazon.com/lambda/home?region=us-east-1#/create/function>) | 仅取得 JavaScript 页面外壳，正文/功能待核查 | `content/docs/zh-CN/solutions/smart-camera/build/amazon-alexa.mdx:113（另 1 处，见 CSV）` |

#### console.easemob.com（4）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 47 | [https://console.easemob.com/](<https://console.easemob.com/>) | 仅取得 JavaScript 页面外壳，正文/功能待核查 | `content/docs/zh-CN/solutions/chatroom/uikit/build/run-github-project.mdx:179（另 1 处，见 CSV）` |
| 48 | [https://console.easemob.com/app/im-service/detail](<https://console.easemob.com/app/im-service/detail>) | 仅取得 JavaScript 页面外壳，正文/功能待核查 | `content/docs/zh-CN/solutions/one-to-one-live/custom-signaling/build/setup-and-access/enable-service.mdx:40` |
| 49 | [https://console.easemob.com/index](<https://console.easemob.com/index>) | 仅取得 JavaScript 页面外壳，正文/功能待核查 | `content/docs/zh-CN/solutions/one-to-one-live/custom-signaling/build/setup-and-access/enable-service.mdx:40` |
| 50 | [https://console.easemob.com/user/login](<https://console.easemob.com/user/login>) | 仅取得 JavaScript 页面外壳，正文/功能待核查 | `content/docs/zh-CN/solutions/chatroom/uikit/build/run-github-project-backend.mdx:63（另 5 处，见 CSV）` |

#### developer.amazon.com（1）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 51 | [https://developer.amazon.com/alexa/console/ask/create-new-skill](<https://developer.amazon.com/alexa/console/ask/create-new-skill>) | 跳转至登录页，尚未确认登录后的目标 | `content/docs/zh-CN/solutions/smart-camera/build/amazon-alexa.mdx:38（另 1 处，见 CSV）` |

#### developer.android.com（16）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 52 | [https://developer.android.com/about/versions/pie/android-9.0-changes-all](<https://developer.android.com/about/versions/pie/android-9.0-changes-all>) | 请求超时，尚未确认可达性 | `content/docs/zh-CN/reference/faq/quality/android_background.mdx:11` |
| 53 | [https://developer.android.com/build/releases/past-releases/agp-7-1-0-release-notes](<https://developer.android.com/build/releases/past-releases/agp-7-1-0-release-notes>) | 请求超时，尚未确认可达性 | `content/docs/zh-CN/realtime-media/rtc/build/audio/audio-quick-start.mdx:119（另 2 处，见 CSV）` |
| 54 | [https://developer.android.com/develop/background-work/services/foreground-services](<https://developer.android.com/develop/background-work/services/foreground-services>) | 请求超时，尚未确认可达性 | `content/docs/zh-CN/reference/faq/quality/android_background.mdx:92` |
| 55 | [https://developer.android.com/guide/components/fg-service-types](<https://developer.android.com/guide/components/fg-service-types>) | 请求超时，尚未确认可达性 | `content/docs/zh-CN/reference/faq/quality/android_background.mdx:93` |
| 56 | [https://developer.android.com/guide/practices/page-sizes?hl=zh-cn](<https://developer.android.com/guide/practices/page-sizes?hl=zh-cn>) | 请求超时，尚未确认可达性 | `content/docs/zh-CN/realtime-media/rtc/reference/release-notes.mdx:485（另 6 处，见 CSV）` |
| 57 | [https://developer.android.com/guide/topics/media/media-formats](<https://developer.android.com/guide/topics/media/media-formats>) | 请求超时，尚未确认可达性 | `content/docs/zh-CN/realtime-media/rtc/build/audio/audio-effect-mixing.mdx:88（另 1 处，见 CSV）` |
| 58 | [https://developer.android.com/reference/android/media/AudioManager.html](<https://developer.android.com/reference/android/media/AudioManager.html>) | 请求超时，尚未确认可达性 | `content/docs/zh-CN/reference/faq/quality/adjust_music_volume.mdx:28` |
| 59 | [https://developer.android.com/reference/android/media/projection/MediaProjection](<https://developer.android.com/reference/android/media/projection/MediaProjection>) | 请求超时，尚未确认可达性 | `content/docs/zh-CN/api-reference/rtc/android/(current)/video/screencapture.mdx:74（另 7 处，见 CSV）` |
| 60 | [https://developer.android.com/reference/android/util/AttributeSet](<https://developer.android.com/reference/android/util/AttributeSet>) | 请求超时，尚未确认可达性 | `content/docs/zh-CN/api-reference/whiteboard/whiteboard-sdk/android/(current)/classcom-1-1herewhite-1-1sdk-1-1-whiteboard-view.mdx:72` |
| 61 | [https://developer.android.com/reference/android/view/SurfaceView](<https://developer.android.com/reference/android/view/SurfaceView>) | 请求超时，尚未确认可达性 | `content/docs/zh-CN/api-reference/rtc/android/(current)/rtc-api-sunset.mdx:87（另 3 处，见 CSV）` |
| 62 | [https://developer.android.com/reference/android/view/TextureView](<https://developer.android.com/reference/android/view/TextureView>) | 请求超时，尚未确认可达性 | `content/docs/zh-CN/api-reference/rtc/android/(current)/rtc-api-sunset.mdx:88（另 2 处，见 CSV）` |
| 63 | [https://developer.android.com/reference/android/view/TextureView%E3%80%82%E5%A6%82%E6%9E%9C%E4%BD%A0%E6%83%B3%E8%A6%81%E4%BD%BF%E7%94%A8](<https://developer.android.com/reference/android/view/TextureView%E3%80%82%E5%A6%82%E6%9E%9C%E4%BD%A0%E6%83%B3%E8%A6%81%E4%BD%BF%E7%94%A8>) | 请求超时，尚未确认可达性 | `content/docs/zh-CN/api-reference/rtc/flutter/(current)/class-videoviewcontroller.mdx:63（另 1 处，见 CSV）` |
| 64 | [https://developer.android.com/reference/android/view/View#setBackgroundColor(int)](<https://developer.android.com/reference/android/view/View#setBackgroundColor(int)>) | 请求超时，尚未确认可达性 | `content/docs/zh-CN/api-reference/whiteboard/whiteboard-sdk/android/(current)/classcom-1-1herewhite-1-1sdk-1-1-displayer.mdx:404` |
| 65 | [https://developer.android.com/reference/java/util/concurrent/TimeUnit](<https://developer.android.com/reference/java/util/concurrent/TimeUnit>) | 浏览器验证未完成，工具结果不足 | `content/docs/zh-CN/api-reference/whiteboard/whiteboard-sdk/android/(current)/classcom-1-1herewhite-1-1sdk-1-1-room-params.mdx:321（另 2 处，见 CSV）` |
| 66 | [https://developer.android.com/studio/](<https://developer.android.com/studio/>) | 请求超时，尚未确认可达性 | `content/docs/zh-CN/realtime-media/rtc/get-started/run-demo.mdx:16（另 23 处，见 CSV）` |
| 67 | [https://developer.android.com/studio/projects/create-project](<https://developer.android.com/studio/projects/create-project>) | 请求超时，尚未确认可达性 | `content/docs/zh-CN/ai/aigc/get-started/quick-start.mdx:35（另 13 处，见 CSV）` |

#### developer.apple.com（1）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 68 | [https://developer.apple.com/account/resources/identifiers/list](<https://developer.apple.com/account/resources/identifiers/list>) | 跳转至登录页，尚未确认登录后的目标 | `content/docs/zh-CN/reference/faq/integration/multitasking.mdx:15` |

#### developer.chrome.com（7）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 69 | [https://developer.chrome.com/blog/getstats-migration](<https://developer.chrome.com/blog/getstats-migration>) | 请求超时，尚未确认可达性 | `content/docs/zh-CN/realtime-media/rtc/reference/browser-compatibility.mdx:77` |
| 70 | [https://developer.chrome.com/docs/web-platform/screen-sharing-controls/](<https://developer.chrome.com/docs/web-platform/screen-sharing-controls/>) | 请求超时，尚未确认可达性 | `content/docs/zh-CN/realtime-media/rtc/reference/release-notes.mdx:6760` |
| 71 | [https://developer.chrome.com/docs/web-platform/screen-sharing-controls/#displaySurface](<https://developer.chrome.com/docs/web-platform/screen-sharing-controls/#displaySurface>) | 请求超时，尚未确认可达性 | `content/docs/zh-CN/api-reference/rtc/react-sdk/web-sdk/interfaces/screenvideotrackinitconfig.mdx:30（另 1 处，见 CSV）` |
| 72 | [https://developer.chrome.com/docs/web-platform/screen-sharing-controls/#selfBrowserSurface](<https://developer.chrome.com/docs/web-platform/screen-sharing-controls/#selfBrowserSurface>) | 请求超时，尚未确认可达性 | `content/docs/zh-CN/api-reference/rtc/react-sdk/web-sdk/interfaces/screenvideotrackinitconfig.mdx:122（另 1 处，见 CSV）` |
| 73 | [https://developer.chrome.com/docs/web-platform/screen-sharing-controls/#surfaceSwitching](<https://developer.chrome.com/docs/web-platform/screen-sharing-controls/#surfaceSwitching>) | 请求超时，尚未确认可达性 | `content/docs/zh-CN/api-reference/rtc/react-sdk/web-sdk/interfaces/screenvideotrackinitconfig.mdx:144（另 1 处，见 CSV）` |
| 74 | [https://developer.chrome.com/docs/web-platform/screen-sharing-controls/#systemAudio](<https://developer.chrome.com/docs/web-platform/screen-sharing-controls/#systemAudio>) | 请求超时，尚未确认可达性 | `content/docs/zh-CN/api-reference/rtc/react-sdk/web-sdk/interfaces/screenvideotrackinitconfig.mdx:163（另 1 处，见 CSV）` |
| 75 | [https://developer.chrome.com/static/docs/web-platform/screen-sharing-controls/image/screenshot-the-media-pic-64dafc4173b.png](<https://developer.chrome.com/static/docs/web-platform/screen-sharing-controls/image/screenshot-the-media-pic-64dafc4173b.png>) | 请求超时，尚未确认可达性 | `content/docs/zh-CN/api-reference/rtc/react-sdk/web-sdk/interfaces/screenvideotrackinitconfig.mdx:32（另 1 处，见 CSV）` |

#### developer.huawei.com（1）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 76 | [https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/continuous-task-V5](<https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/continuous-task-V5>) | 仅取得 JavaScript 页面外壳，正文/功能待核查 | `content/docs/zh-CN/reference/faq/quality/harmonyos_background.mdx:116` |

#### developers.google.com（2）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 77 | [https://developers.google.com/assistant/smarthome/develop/create](<https://developers.google.com/assistant/smarthome/develop/create>) | 请求超时，尚未确认可达性 | `content/docs/zh-CN/solutions/smart-camera/build/google-assistant.mdx:29（另 1 处，见 CSV）` |
| 78 | [https://developers.google.com/protocol-buffers/docs/reference/google.protobuf#fieldmask](<https://developers.google.com/protocol-buffers/docs/reference/google.protobuf#fieldmask>) | 请求超时，尚未确认可达性 | `content/docs/zh-CN/realtime-media/media-push/reference/ncs-events.mdx:227（另 6 处，见 CSV）` |

#### docs-preprod.agora.io（2）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 79 | [https://docs-preprod.agora.io/cn/agora-chat/API%20Reference/im_java/v1.1.0/classio_1_1agora_1_1chat_1_1_chat_room_manager.html?transId=194274c0-bee4-11ed-b167-a39cc89dc96e#a0d50d2e34d9992fc3f8ea1c82e2db1a](<https://docs-preprod.agora.io/cn/agora-chat/API%20Reference/im_java/v1.1.0/classio_1_1agora_1_1chat_1_1_chat_room_manager.html?transId=194274c0-bee4-11ed-b167-a39cc89dc96e#a0d50d2e34d9992fc3f8ea1c82e2db1a>) | 请求超时，尚未确认可达性 | `content/docs/zh-CN/solutions/chatroom/sdk/build/quick-integration.mdx:342（另 2 处，见 CSV）` |
| 80 | [https://docs-preprod.agora.io/cn/agora-chat/API%20Reference/im_java/v1.1.0/classio_1_1agora_1_1chat_1_1_chat_room_manager.html#a4f2c430782206971480c73a49311b1437](<https://docs-preprod.agora.io/cn/agora-chat/API%20Reference/im_java/v1.1.0/classio_1_1agora_1_1chat_1_1_chat_room_manager.html#a4f2c430782206971480c73a49311b1437>) | 请求超时，尚未确认可达性 | `content/docs/zh-CN/solutions/chatroom/sdk/build/quick-integration.mdx:342（另 2 处，见 CSV）` |

#### docs.flutter.dev（2）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 81 | [https://docs.flutter.dev/get-started/test-drive?tab=vscode#create-app](<https://docs.flutter.dev/get-started/test-drive?tab=vscode#create-app>) | 初始 HTML 未找到指定片段，需浏览器确认 | `content/docs/zh-CN/realtime-media/rtc/build/audio/audio-quick-start.mdx:4180（另 1 处，见 CSV）` |
| 82 | [https://docs.flutter.dev/platform-integration/ios/c-interop#stripping-ios-symbols](<https://docs.flutter.dev/platform-integration/ios/c-interop#stripping-ios-symbols>) | 初始 HTML 未找到指定片段，需浏览器确认 | `content/docs/zh-CN/reference/faq/integration/flutter_ios_build.mdx:10` |

#### docs.unrealengine.com（2）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 83 | [https://docs.unrealengine.com/4.27/zh-CN/Basics/Projects/Browser/](<https://docs.unrealengine.com/4.27/zh-CN/Basics/Projects/Browser/>) | HTTP 403：访问被拒绝，可能涉及权限或反爬 | `content/docs/zh-CN/realtime-media/rtc/build/audio/audio-quick-start.mdx:5943` |
| 84 | [https://docs.unrealengine.com/5.1/en-US/onboarding-guide-for-unreal-engine-games-licensees/](<https://docs.unrealengine.com/5.1/en-US/onboarding-guide-for-unreal-engine-games-licensees/>) | HTTP 403：访问被拒绝，可能涉及权限或反爬 | `content/docs/zh-CN/realtime-media/rtc/build/audio/audio-quick-start.mdx:5288` |

#### docs.volcengine.com（1）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 85 | [https://docs.volcengine.com/docs/6561/196768?lang=zh#q1%EF%BC%9A%E5%93%AA%E9%87%8C%E5%8F%AF%E4%BB%A5%E8%8E%B7%E5%8F%96%E5%88%B0%E4%BB%A5%E4%B8%8B%E5%8F%82%E6%95%B0appid%EF%BC%8Ccluster%EF%BC%8Ctoken%EF%BC%8Cauthorization-type%EF%BC%8Csecret-key-%EF%BC%9F](<https://docs.volcengine.com/docs/6561/196768?lang=zh#q1%EF%BC%9A%E5%93%AA%E9%87%8C%E5%8F%AF%E4%BB%A5%E8%8E%B7%E5%8F%96%E5%88%B0%E4%BB%A5%E4%B8%8B%E5%8F%82%E6%95%B0appid%EF%BC%8Ccluster%EF%BC%8Ctoken%EF%BC%8Cauthorization-type%EF%BC%8Csecret-key-%EF%BC%9F>) | 初始 HTML 未找到指定片段，需浏览器确认 | `content/docs/zh-CN/ai/get-started/quick-start-agent.mdx:25（另 1 处，见 CSV）` |

#### eci.console.aliyun.com（1）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 86 | [https://eci.console.aliyun.com/](<https://eci.console.aliyun.com/>) | 跳转至登录页，尚未确认登录后的目标 | `content/docs/zh-CN/realtime-media/local-server-recording/build/legacy/docker.mdx:103` |

#### en.wikipedia.org（1）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 87 | [https://en.wikipedia.org/wiki/Salt_(cryptography)](<https://en.wikipedia.org/wiki/Salt_(cryptography)>) | 请求超时，尚未确认可达性 | `content/docs/zh-CN/realtime-media/content-moderation/build/audio-moderation-api.mdx:355（另 7 处，见 CSV）` |

#### firebase.google.com（3）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 88 | [https://firebase.google.com/docs/cloud-messaging](<https://firebase.google.com/docs/cloud-messaging>) | 请求超时，尚未确认可达性 | `content/docs/zh-CN/solutions/iot-apaas/build/setup-and-access/enable-service.mdx:153` |
| 89 | [https://firebase.google.com/docs/cloud-messaging/concept-options#credentials](<https://firebase.google.com/docs/cloud-messaging/concept-options#credentials>) | 请求超时，尚未确认可达性 | `content/docs/zh-CN/solutions/iot-apaas/build/setup-and-access/enable-service.mdx:156` |
| 90 | [https://firebase.google.com/docs/cloud-messaging/concept-options#senderid](<https://firebase.google.com/docs/cloud-messaging/concept-options#senderid>) | 请求超时，尚未确认可达性 | `content/docs/zh-CN/solutions/iot-apaas/build/setup-and-access/enable-service.mdx:155` |

#### gems.ruby-china.com（1）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 91 | [https://gems.ruby-china.com/](<https://gems.ruby-china.com/>) | 网络连接失败 | `content/docs/zh-CN/reference/faq/integration/cocoapods_problems.mdx:51` |

#### gitee.com（166）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 92 | [https://gitee.com/agoraio-community/Agora-C_Sharp-SDK/tree/main/Agora-C_Sharp-RTC-SDK-API_Example/src/Basic/JoinChannelAudio](<https://gitee.com/agoraio-community/Agora-C_Sharp-SDK/tree/main/Agora-C_Sharp-RTC-SDK-API_Example/src/Basic/JoinChannelAudio>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/audio-quick-start.mdx:2629` |
| 93 | [https://gitee.com/agoraio-community/Agora-C_Sharp-SDK/tree/main/Agora-C_Sharp-RTC-SDK-API_Example/src/Basic/JoinChannelVideo](<https://gitee.com/agoraio-community/Agora-C_Sharp-SDK/tree/main/Agora-C_Sharp-RTC-SDK-API_Example/src/Basic/JoinChannelVideo>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/advanced-channel/ls-quick-start.mdx:374（另 1 处，见 CSV）` |
| 94 | [https://gitee.com/agoraio-community/Agora-Flutter-SDK/blob/main/example/lib/examples/advanced/audio_effect_mixing/audio_effect_mixing.dart](<https://gitee.com/agoraio-community/Agora-Flutter-SDK/blob/main/example/lib/examples/advanced/audio_effect_mixing/audio_effect_mixing.dart>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/volume.mdx:1010` |
| 95 | [https://gitee.com/agoraio-community/Agora-Flutter-SDK/blob/main/example/lib/examples/basic/join_channel_audio/join_channel_audio.dart](<https://gitee.com/agoraio-community/Agora-Flutter-SDK/blob/main/example/lib/examples/basic/join_channel_audio/join_channel_audio.dart>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/volume.mdx:1003` |
| 96 | [https://gitee.com/agoraio-community/Agora-Flutter-SDK/tree/main/example](<https://gitee.com/agoraio-community/Agora-Flutter-SDK/tree/main/example>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/get-started/run-demo.mdx:739` |
| 97 | [https://gitee.com/agoraio-community/Agora-Flutter-SDK/tree/main/example/lib/examples/basic/join_channel_audio](<https://gitee.com/agoraio-community/Agora-Flutter-SDK/tree/main/example/lib/examples/basic/join_channel_audio>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/audio-quick-start.mdx:4559` |
| 98 | [https://gitee.com/agoraio-community/Agora-Flutter-SDK/tree/main/example/lib/examples/basic/join_channel_video](<https://gitee.com/agoraio-community/Agora-Flutter-SDK/tree/main/example/lib/examples/basic/join_channel_video>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/advanced-channel/ls-quick-start.mdx:647（另 1 处，见 CSV）` |
| 99 | [https://gitee.com/agoraio-community/agora-rest-client-go/tree/main/examples/cloudrecording](<https://gitee.com/agoraio-community/agora-rest-client-go/tree/main/examples/cloudrecording>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/api-reference/cloud-recording/restful/get-started/quick-start-go.mdx:458（另 1 处，见 CSV）` |
| 100 | [https://gitee.com/agoraio-community/agora-rest-client-go/tree/main/examples/convoai](<https://gitee.com/agoraio-community/agora-rest-client-go/tree/main/examples/convoai>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/ai/get-started/quick-start-go.mdx:491` |
| 101 | [https://gitee.com/agoraio-community/agora-rest-client-go/tree/main/services/cloudtranscoder](<https://gitee.com/agoraio-community/agora-rest-client-go/tree/main/services/cloudtranscoder>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/transcoding/get-started/quick-start-go.mdx:402` |
| 102 | [https://gitee.com/agoraio-community/agora-rest-client-java/tree/main/examples/cloudrecording](<https://gitee.com/agoraio-community/agora-rest-client-java/tree/main/examples/cloudrecording>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/cloud-recording/get-started/quick-start/java.mdx:469` |
| 103 | [https://gitee.com/agoraio-community/agora-rest-client-java/tree/main/examples/convoai](<https://gitee.com/agoraio-community/agora-rest-client-java/tree/main/examples/convoai>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/ai/get-started/quick-start-java.mdx:503` |
| 104 | [https://gitee.com/agoraio-community/agora-rest-client-nodejs/tree/main/examples/cloudrecording](<https://gitee.com/agoraio-community/agora-rest-client-nodejs/tree/main/examples/cloudrecording>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/cloud-recording/get-started/quick-start/nodejs.mdx:522` |
| 105 | [https://gitee.com/agoraio-community/Agora-RTC-QuickStart/tree/main/Android/Agora-RTC-QuickStart-Android](<https://gitee.com/agoraio-community/Agora-RTC-QuickStart/tree/main/Android/Agora-RTC-QuickStart-Android>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/get-started/quick-start.mdx:742` |
| 106 | [https://gitee.com/agoraio-community/Agora-RTC-QuickStart/tree/main/iOS/Agora-RTC-QuickStart-iOS/Agora-RTC-QuickStart-iOS](<https://gitee.com/agoraio-community/Agora-RTC-QuickStart/tree/main/iOS/Agora-RTC-QuickStart-iOS/Agora-RTC-QuickStart-iOS>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/get-started/quick-start.mdx:1247` |
| 107 | [https://gitee.com/agoraio-community/Agora-Unity-Quickstart/blob/main/API-Example-Unity/Assets/API-Example/Examples/Advanced/AudioCallRoute/AudioCallRoute.cs](<https://gitee.com/agoraio-community/Agora-Unity-Quickstart/blob/main/API-Example-Unity/Assets/API-Example/Examples/Advanced/AudioCallRoute/AudioCallRoute.cs>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/audio-route.mdx:402` |
| 108 | [https://gitee.com/agoraio-community/Agora-Unity-Quickstart/blob/main/API-Example-Unity/Assets/API-Example/Examples/Advanced/ChannelMediaRelay/ChannelMediaRelay.cs](<https://gitee.com/agoraio-community/Agora-Unity-Quickstart/blob/main/API-Example-Unity/Assets/API-Example/Examples/Advanced/ChannelMediaRelay/ChannelMediaRelay.cs>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/advanced-channel/media-relay.mdx:980` |
| 109 | [https://gitee.com/agoraio-community/Agora-Unity-Quickstart/blob/main/API-Example-Unity/Assets/API-Example/Examples/Advanced/CustomCaptureAudio/CustomCaptureAudio.cs](<https://gitee.com/agoraio-community/Agora-Unity-Quickstart/blob/main/API-Example-Unity/Assets/API-Example/Examples/Advanced/CustomCaptureAudio/CustomCaptureAudio.cs>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/custom-audio-source.mdx:1161` |
| 110 | [https://gitee.com/agoraio-community/Agora-Unity-Quickstart/blob/main/API-Example-Unity/Assets/API-Example/Examples/Advanced/CustomCaptureVideo/CustomCaptureVideo.cs](<https://gitee.com/agoraio-community/Agora-Unity-Quickstart/blob/main/API-Example-Unity/Assets/API-Example/Examples/Advanced/CustomCaptureVideo/CustomCaptureVideo.cs>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/video/custom-video-source.mdx:1187` |
| 111 | [https://gitee.com/agoraio-community/Agora-Unity-Quickstart/blob/main/API-Example-Unity/Assets/API-Example/Examples/Advanced/CustomRenderAudio/CustomRenderAudio.cs](<https://gitee.com/agoraio-community/Agora-Unity-Quickstart/blob/main/API-Example-Unity/Assets/API-Example/Examples/Advanced/CustomRenderAudio/CustomRenderAudio.cs>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/custom-audio-source.mdx:1164` |
| 112 | [https://gitee.com/agoraio-community/Agora-Unity-Quickstart/blob/main/API-Example-Unity/Assets/API-Example/Examples/Advanced/MediaPlayer/MediaPlayerExample.cs](<https://gitee.com/agoraio-community/Agora-Unity-Quickstart/blob/main/API-Example-Unity/Assets/API-Example/Examples/Advanced/MediaPlayer/MediaPlayerExample.cs>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/media-player.mdx:1259` |
| 113 | [https://gitee.com/agoraio-community/Agora-Unity-Quickstart/blob/main/API-Example-Unity/Assets/API-Example/Examples/Advanced/ProcessAudioRawData/ProcessAudioRawData.cs](<https://gitee.com/agoraio-community/Agora-Unity-Quickstart/blob/main/API-Example-Unity/Assets/API-Example/Examples/Advanced/ProcessAudioRawData/ProcessAudioRawData.cs>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/raw-audio-data.mdx:572` |
| 114 | [https://gitee.com/agoraio-community/Agora-Unity-Quickstart/blob/main/API-Example-Unity/Assets/API-Example/Examples/Advanced/ProcessVideoRawData/ProcessVideoRawData.cs](<https://gitee.com/agoraio-community/Agora-Unity-Quickstart/blob/main/API-Example-Unity/Assets/API-Example/Examples/Advanced/ProcessVideoRawData/ProcessVideoRawData.cs>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/video/raw-video-data.mdx:588` |
| 115 | [https://gitee.com/agoraio-community/Agora-Unity-Quickstart/blob/main/API-Example-Unity/Assets/API-Example/Examples/Advanced/SpatialAudioWithMediaPlayer/SpatialAudioWithMediaPlayer.cs](<https://gitee.com/agoraio-community/Agora-Unity-Quickstart/blob/main/API-Example-Unity/Assets/API-Example/Examples/Advanced/SpatialAudioWithMediaPlayer/SpatialAudioWithMediaPlayer.cs>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/spatial-audio.mdx:1972（另 1 处，见 CSV）` |
| 116 | [https://gitee.com/agoraio-community/Agora-Unity-Quickstart/blob/main/API-Example-Unity/Assets/API-Example/Examples/Advanced/VoiceChanger/VoiceChanger.cs](<https://gitee.com/agoraio-community/Agora-Unity-Quickstart/blob/main/API-Example-Unity/Assets/API-Example/Examples/Advanced/VoiceChanger/VoiceChanger.cs>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/voice-changer.mdx:1313` |
| 117 | [https://gitee.com/agoraio-community/Agora-Unity-Quickstart/tree/main/API-Example-Unity/Assets/API-Example/Examples](<https://gitee.com/agoraio-community/Agora-Unity-Quickstart/tree/main/API-Example-Unity/Assets/API-Example/Examples>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/get-started/run-demo.mdx:669（另 2 处，见 CSV）` |
| 118 | [https://gitee.com/agoraio-community/Agora-Unity-Quickstart/tree/main/API-Example-Unity/Assets/API-Example/Examples/Advanced/AudioMixing](<https://gitee.com/agoraio-community/Agora-Unity-Quickstart/tree/main/API-Example-Unity/Assets/API-Example/Examples/Advanced/AudioMixing>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/audio-effect-mixing.mdx:1628（另 1 处，见 CSV）` |
| 119 | [https://gitee.com/agoraio-community/Agora-Unity-Quickstart/tree/main/API-Example-Unity/Assets/API-Example/Examples/Advanced/ScreenShare](<https://gitee.com/agoraio-community/Agora-Unity-Quickstart/tree/main/API-Example-Unity/Assets/API-Example/Examples/Advanced/ScreenShare>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/video/screen-share.mdx:2331` |
| 120 | [https://gitee.com/agoraio-community/Agora-Unity-Quickstart/tree/main/API-Example-Unity/Assets/API-Example/Examples/Advanced/SetEncryption](<https://gitee.com/agoraio-community/Agora-Unity-Quickstart/tree/main/API-Example-Unity/Assets/API-Example/Examples/Advanced/SetEncryption>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/advanced-channel/channel-encryption.mdx:792` |
| 121 | [https://gitee.com/agoraio-community/Agora-Unity-Quickstart/tree/main/API-Example-Unity/Assets/API-Example/Examples/Basic/JoinChannelAudio](<https://gitee.com/agoraio-community/Agora-Unity-Quickstart/tree/main/API-Example-Unity/Assets/API-Example/Examples/Basic/JoinChannelAudio>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/audio-quick-start.mdx:4137` |
| 122 | [https://gitee.com/agoraio-community/Agora-Unity-Quickstart/tree/main/API-Example-Unity/Assets/API-Example/Examples/Basic/JoinChannelVideo](<https://gitee.com/agoraio-community/Agora-Unity-Quickstart/tree/main/API-Example-Unity/Assets/API-Example/Examples/Basic/JoinChannelVideo>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/advanced-channel/ls-quick-start.mdx:574（另 1 处，见 CSV）` |
| 123 | [https://gitee.com/agoraio-community/API-Examples-Web/blob/main/src/example/others/dualStream/index.js](<https://gitee.com/agoraio-community/API-Examples-Web/blob/main/src/example/others/dualStream/index.js>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/video/multi-user-video.mdx:71` |
| 124 | [https://gitee.com/agoraio-community/API-Examples-Web/tree/main/ExtensionDemo](<https://gitee.com/agoraio-community/API-Examples-Web/tree/main/ExtensionDemo>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/marketplace/build/create-extensions/audio-filter.mdx:1157（另 1 处，见 CSV）` |
| 125 | [https://gitee.com/agoraio-community/API-Examples-Web/tree/main/src/example](<https://gitee.com/agoraio-community/API-Examples-Web/tree/main/src/example>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/advanced-channel/ls-quick-start.mdx:252（另 2 处，见 CSV）` |
| 126 | [https://gitee.com/agoraio-community/API-Examples-Web/tree/main/src/example/advanced](<https://gitee.com/agoraio-community/API-Examples-Web/tree/main/src/example/advanced>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/reference/demo/rtc-sdk-api-example.mdx:447` |
| 127 | [https://gitee.com/agoraio-community/API-Examples-Web/tree/main/src/example/advanced/recordingDeviceControl](<https://gitee.com/agoraio-community/API-Examples-Web/tree/main/src/example/advanced/recordingDeviceControl>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/optimize-and-operate/lastmile-quality.mdx:713` |
| 128 | [https://gitee.com/agoraio-community/API-Examples-Web/tree/main/src/example/advanced/shareTheScreen](<https://gitee.com/agoraio-community/API-Examples-Web/tree/main/src/example/advanced/shareTheScreen>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/video/screen-share.mdx:1269` |
| 129 | [https://gitee.com/agoraio-community/API-Examples-Web/tree/main/src/example/basic](<https://gitee.com/agoraio-community/API-Examples-Web/tree/main/src/example/basic>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/reference/demo/rtc-sdk-api-example.mdx:446` |
| 130 | [https://gitee.com/agoraio-community/API-Examples-Web/tree/main/src/example/framework/react](<https://gitee.com/agoraio-community/API-Examples-Web/tree/main/src/example/framework/react>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/reference/demo/rtc-sdk-api-example.mdx:451` |
| 131 | [https://gitee.com/agoraio-community/API-Examples-Web/tree/main/src/example/framework/vue](<https://gitee.com/agoraio-community/API-Examples-Web/tree/main/src/example/framework/vue>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/reference/demo/rtc-sdk-api-example.mdx:450` |
| 132 | [https://gitee.com/agoraio-community/API-Examples-Web/tree/main/src/example/others](<https://gitee.com/agoraio-community/API-Examples-Web/tree/main/src/example/others>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/reference/demo/rtc-sdk-api-example.mdx:449` |
| 133 | [https://gitee.com/agoraio-community/API-Examples-Web/tree/main/src/example/plugin](<https://gitee.com/agoraio-community/API-Examples-Web/tree/main/src/example/plugin>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/reference/demo/rtc-sdk-api-example.mdx:448` |
| 134 | [https://gitee.com/agoraio-community/API-Examples/blob/main/Android/APIExample-Audio/app/src/main/java/io/agora/api/example/examples/advanced/SpatialSound.java](<https://gitee.com/agoraio-community/API-Examples/blob/main/Android/APIExample-Audio/app/src/main/java/io/agora/api/example/examples/advanced/SpatialSound.java>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/spatial-audio.mdx:309` |
| 135 | [https://gitee.com/agoraio-community/API-Examples/blob/main/Android/APIExample/app/src/main/java/io/agora/api/example/examples/advanced/ChannelEncryption.java](<https://gitee.com/agoraio-community/API-Examples/blob/main/Android/APIExample/app/src/main/java/io/agora/api/example/examples/advanced/ChannelEncryption.java>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/advanced-channel/channel-encryption.mdx:98` |
| 136 | [https://gitee.com/agoraio-community/API-Examples/blob/main/Android/APIExample/app/src/main/java/io/agora/api/example/examples/advanced/customaudio/CustomAudioRender.java](<https://gitee.com/agoraio-community/API-Examples/blob/main/Android/APIExample/app/src/main/java/io/agora/api/example/examples/advanced/customaudio/CustomAudioRender.java>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/custom-audio-source.mdx:185` |
| 137 | [https://gitee.com/agoraio-community/API-Examples/blob/main/Android/APIExample/app/src/main/java/io/agora/api/example/examples/advanced/customaudio/CustomAudioSource.java](<https://gitee.com/agoraio-community/API-Examples/blob/main/Android/APIExample/app/src/main/java/io/agora/api/example/examples/advanced/customaudio/CustomAudioSource.java>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/custom-audio-source.mdx:182` |
| 138 | [https://gitee.com/agoraio-community/API-Examples/blob/main/Android/APIExample/app/src/main/java/io/agora/api/example/examples/advanced/CustomRemoteVideoRender.java](<https://gitee.com/agoraio-community/API-Examples/blob/main/Android/APIExample/app/src/main/java/io/agora/api/example/examples/advanced/CustomRemoteVideoRender.java>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/video/video-processing.mdx:324` |
| 139 | [https://gitee.com/agoraio-community/API-Examples/blob/main/Android/APIExample/app/src/main/java/io/agora/api/example/examples/advanced/FaceCapture.java](<https://gitee.com/agoraio-community/API-Examples/blob/main/Android/APIExample/app/src/main/java/io/agora/api/example/examples/advanced/FaceCapture.java>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/extensions/face-capture.mdx:145` |
| 140 | [https://gitee.com/agoraio-community/API-Examples/blob/main/Android/APIExample/app/src/main/java/io/agora/api/example/examples/advanced/HostAcrossChannel.java](<https://gitee.com/agoraio-community/API-Examples/blob/main/Android/APIExample/app/src/main/java/io/agora/api/example/examples/advanced/HostAcrossChannel.java>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/advanced-channel/media-relay.mdx:139` |
| 141 | [https://gitee.com/agoraio-community/API-Examples/blob/main/Android/APIExample/app/src/main/java/io/agora/api/example/examples/advanced/LiveStreaming.java](<https://gitee.com/agoraio-community/API-Examples/blob/main/Android/APIExample/app/src/main/java/io/agora/api/example/examples/advanced/LiveStreaming.java>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/advanced-channel/ls-quick-start.mdx:60` |
| 142 | [https://gitee.com/agoraio-community/API-Examples/blob/main/Android/APIExample/app/src/main/java/io/agora/api/example/examples/advanced/Multipath.java](<https://gitee.com/agoraio-community/API-Examples/blob/main/Android/APIExample/app/src/main/java/io/agora/api/example/examples/advanced/Multipath.java>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/advanced-channel/multipath.mdx:105` |
| 143 | [https://gitee.com/agoraio-community/API-Examples/blob/main/Android/APIExample/app/src/main/java/io/agora/api/example/examples/advanced/MultiVideoSourceTracks.java](<https://gitee.com/agoraio-community/API-Examples/blob/main/Android/APIExample/app/src/main/java/io/agora/api/example/examples/advanced/MultiVideoSourceTracks.java>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/video/custom-video-source.mdx:254` |
| 144 | [https://gitee.com/agoraio-community/API-Examples/blob/main/Android/APIExample/app/src/main/java/io/agora/api/example/examples/advanced/ProcessAudioRawData.java](<https://gitee.com/agoraio-community/API-Examples/blob/main/Android/APIExample/app/src/main/java/io/agora/api/example/examples/advanced/ProcessAudioRawData.java>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/raw-audio-data.mdx:83` |
| 145 | [https://gitee.com/agoraio-community/API-Examples/blob/main/Android/APIExample/app/src/main/java/io/agora/api/example/examples/advanced/ProcessRawData.java](<https://gitee.com/agoraio-community/API-Examples/blob/main/Android/APIExample/app/src/main/java/io/agora/api/example/examples/advanced/ProcessRawData.java>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/video/video-processing.mdx:323` |
| 146 | [https://gitee.com/agoraio-community/API-Examples/blob/main/Android/APIExample/app/src/main/java/io/agora/api/example/examples/advanced/ScreenSharing.java](<https://gitee.com/agoraio-community/API-Examples/blob/main/Android/APIExample/app/src/main/java/io/agora/api/example/examples/advanced/ScreenSharing.java>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/video/screen-share.mdx:331` |
| 147 | [https://gitee.com/agoraio-community/API-Examples/blob/main/Android/APIExample/app/src/main/java/io/agora/api/example/examples/advanced/VideoProcessExtension.java](<https://gitee.com/agoraio-community/API-Examples/blob/main/Android/APIExample/app/src/main/java/io/agora/api/example/examples/advanced/VideoProcessExtension.java>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/video/advanced-beauty-legacy.mdx:192` |
| 148 | [https://gitee.com/agoraio-community/API-Examples/blob/main/Android/APIExample/app/src/main/java/io/agora/api/example/examples/advanced/VoiceEffects.java](<https://gitee.com/agoraio-community/API-Examples/blob/main/Android/APIExample/app/src/main/java/io/agora/api/example/examples/advanced/VoiceEffects.java>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/voice-changer.mdx:201` |
| 149 | [https://gitee.com/agoraio-community/API-Examples/blob/main/Android/APIExample/app/src/main/java/io/agora/api/example/examples/basic/JoinChannelAudio.java](<https://gitee.com/agoraio-community/API-Examples/blob/main/Android/APIExample/app/src/main/java/io/agora/api/example/examples/basic/JoinChannelAudio.java>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/audio-profile.mdx:131（另 2 处，见 CSV）` |
| 150 | [https://gitee.com/agoraio-community/API-Examples/blob/main/Android/APIExample/app/src/main/java/io/agora/api/example/examples/basic/JoinChannelVideo.java](<https://gitee.com/agoraio-community/API-Examples/blob/main/Android/APIExample/app/src/main/java/io/agora/api/example/examples/basic/JoinChannelVideo.java>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/video/video-profile.mdx:54` |
| 151 | [https://gitee.com/agoraio-community/API-Examples/blob/main/iOS/APIExample/APIExample/Examples/Advanced/CustomVideoRender/CustomVideoRender.swift](<https://gitee.com/agoraio-community/API-Examples/blob/main/iOS/APIExample/APIExample/Examples/Advanced/CustomVideoRender/CustomVideoRender.swift>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/video/video-processing.mdx:597（另 1 处，见 CSV）` |
| 152 | [https://gitee.com/agoraio-community/API-Examples/blob/main/iOS/APIExample/APIExample/Examples/Advanced/CustomVideoSourcePushMulti/CustomVideoSourcePushMulti.swift](<https://gitee.com/agoraio-community/API-Examples/blob/main/iOS/APIExample/APIExample/Examples/Advanced/CustomVideoSourcePushMulti/CustomVideoSourcePushMulti.swift>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/video/custom-video-source.mdx:449` |
| 153 | [https://gitee.com/agoraio-community/API-Examples/blob/main/iOS/APIExample/APIExample/Examples/Advanced/MediaChannelRelay/MediaChannelRelay.swift](<https://gitee.com/agoraio-community/API-Examples/blob/main/iOS/APIExample/APIExample/Examples/Advanced/MediaChannelRelay/MediaChannelRelay.swift>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/advanced-channel/media-relay.mdx:283` |
| 154 | [https://gitee.com/agoraio-community/API-Examples/blob/main/iOS/APIExample/APIExample/Examples/Advanced/Multipath](<https://gitee.com/agoraio-community/API-Examples/blob/main/iOS/APIExample/APIExample/Examples/Advanced/Multipath>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/advanced-channel/multipath.mdx:203` |
| 155 | [https://gitee.com/agoraio-community/API-Examples/blob/main/iOS/APIExample/APIExample/Examples/Advanced/RawAudioData/RawAudioData.swift](<https://gitee.com/agoraio-community/API-Examples/blob/main/iOS/APIExample/APIExample/Examples/Advanced/RawAudioData/RawAudioData.swift>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/raw-audio-data.mdx:203` |
| 156 | [https://gitee.com/agoraio-community/API-Examples/blob/main/iOS/APIExample/APIExample/Examples/Advanced/RawVideoData/RawVideoData.swift](<https://gitee.com/agoraio-community/API-Examples/blob/main/iOS/APIExample/APIExample/Examples/Advanced/RawVideoData/RawVideoData.swift>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/video/video-processing.mdx:596（另 1 处，见 CSV）` |
| 157 | [https://gitee.com/agoraio-community/API-Examples/blob/main/iOS/APIExample/APIExample/Examples/Advanced/SpatialAudio/SpatialAudio.swift](<https://gitee.com/agoraio-community/API-Examples/blob/main/iOS/APIExample/APIExample/Examples/Advanced/SpatialAudio/SpatialAudio.swift>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/spatial-audio.mdx:634` |
| 158 | [https://gitee.com/agoraio-community/API-Examples/blob/main/iOS/APIExample/APIExample/Examples/Basic/JoinChannelVideo/JoinChannelVideo.swift](<https://gitee.com/agoraio-community/API-Examples/blob/main/iOS/APIExample/APIExample/Examples/Basic/JoinChannelVideo/JoinChannelVideo.swift>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/video/video-profile.mdx:263` |
| 159 | [https://gitee.com/agoraio-community/API-Examples/blob/main/macOS/APIExample/Examples/Advanced/ChannelMediaRelay/ChannelMediaRelay.swift](<https://gitee.com/agoraio-community/API-Examples/blob/main/macOS/APIExample/Examples/Advanced/ChannelMediaRelay/ChannelMediaRelay.swift>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/advanced-channel/media-relay.mdx:426` |
| 160 | [https://gitee.com/agoraio-community/API-Examples/blob/main/macOS/APIExample/Examples/Advanced/CustomVideoSourcePushMulti/CustomVideoSourcePushMulti.swift](<https://gitee.com/agoraio-community/API-Examples/blob/main/macOS/APIExample/Examples/Advanced/CustomVideoSourcePushMulti/CustomVideoSourcePushMulti.swift>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/video/custom-video-source.mdx:644` |
| 161 | [https://gitee.com/agoraio-community/API-Examples/blob/main/macOS/APIExample/Examples/Advanced/SpatialAudio/SpatialAudio.swift](<https://gitee.com/agoraio-community/API-Examples/blob/main/macOS/APIExample/Examples/Advanced/SpatialAudio/SpatialAudio.swift>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/spatial-audio.mdx:959` |
| 162 | [https://gitee.com/agoraio-community/API-Examples/blob/main/macOS/APIExample/Examples/Basic/JoinChannelAudio/JoinChannelAudio.swift](<https://gitee.com/agoraio-community/API-Examples/blob/main/macOS/APIExample/Examples/Basic/JoinChannelAudio/JoinChannelAudio.swift>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/volume.mdx:397` |
| 163 | [https://gitee.com/agoraio-community/API-Examples/blob/main/macOS/APIExample/Examples/Basic/JoinChannelVideo](<https://gitee.com/agoraio-community/API-Examples/blob/main/macOS/APIExample/Examples/Basic/JoinChannelVideo>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/video/video-profile.mdx:472` |
| 164 | [https://gitee.com/agoraio-community/API-Examples/blob/main/windows/APIExample/APIExample/Advanced/OriginalVideo](<https://gitee.com/agoraio-community/API-Examples/blob/main/windows/APIExample/APIExample/Advanced/OriginalVideo>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/video/video-processing.mdx:1137` |
| 165 | [https://gitee.com/agoraio-community/API-Examples/blob/main/windows/APIExample/APIExample/Advanced/ScreenShare/AgoraScreenCapture.cpp](<https://gitee.com/agoraio-community/API-Examples/blob/main/windows/APIExample/APIExample/Advanced/ScreenShare/AgoraScreenCapture.cpp>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/video/screen-share.mdx:1562` |
| 166 | [https://gitee.com/agoraio-community/API-Examples/blob/main/windows/APIExample/APIExample/Advanced/SpatialAudio](<https://gitee.com/agoraio-community/API-Examples/blob/main/windows/APIExample/APIExample/Advanced/SpatialAudio>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/spatial-audio.mdx:1300` |
| 167 | [https://gitee.com/agoraio-community/API-Examples/tree/HarmonyOS_NEXT-main/HarmonyOS_NEXT/APIExample](<https://gitee.com/agoraio-community/API-Examples/tree/HarmonyOS_NEXT-main/HarmonyOS_NEXT/APIExample>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/get-started/run-demo.mdx:427（另 2 处，见 CSV）` |
| 168 | [https://gitee.com/agoraio-community/API-Examples/tree/HarmonyOS_NEXT-main/HarmonyOS_NEXT/APIExample/entry/src/main/cpp/origin_video_data.cpp](<https://gitee.com/agoraio-community/API-Examples/tree/HarmonyOS_NEXT-main/HarmonyOS_NEXT/APIExample/entry/src/main/cpp/origin_video_data.cpp>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/video/raw-video-data.mdx:497` |
| 169 | [https://gitee.com/agoraio-community/API-Examples/tree/HarmonyOS_NEXT-main/HarmonyOS_NEXT/APIExample/entry/src/main/ets/pages/advance/LiveStreaming.ets](<https://gitee.com/agoraio-community/API-Examples/tree/HarmonyOS_NEXT-main/HarmonyOS_NEXT/APIExample/entry/src/main/ets/pages/advance/LiveStreaming.ets>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/advanced-channel/ls-quick-start.mdx:436` |
| 170 | [https://gitee.com/agoraio-community/API-Examples/tree/HarmonyOS_NEXT-main/HarmonyOS_NEXT/APIExample/entry/src/main/ets/pages/advance/OriginVideoDataWrap.ets](<https://gitee.com/agoraio-community/API-Examples/tree/HarmonyOS_NEXT-main/HarmonyOS_NEXT/APIExample/entry/src/main/ets/pages/advance/OriginVideoDataWrap.ets>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/video/raw-video-data.mdx:496` |
| 171 | [https://gitee.com/agoraio-community/API-Examples/tree/HarmonyOS_NEXT-main/HarmonyOS_NEXT/APIExample/entry/src/main/ets/pages/advance/ScreenSharing.ets](<https://gitee.com/agoraio-community/API-Examples/tree/HarmonyOS_NEXT-main/HarmonyOS_NEXT/APIExample/entry/src/main/ets/pages/advance/ScreenSharing.ets>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/video/screen-share.mdx:1747` |
| 172 | [https://gitee.com/agoraio-community/API-Examples/tree/HarmonyOS_NEXT-main/HarmonyOS_NEXT/APIExample/entry/src/main/ets/pages/basic](<https://gitee.com/agoraio-community/API-Examples/tree/HarmonyOS_NEXT-main/HarmonyOS_NEXT/APIExample/entry/src/main/ets/pages/basic>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/get-started/quick-start.mdx:4218` |
| 173 | [https://gitee.com/agoraio-community/API-Examples/tree/HarmonyOS_NEXT-main/HarmonyOS_NEXT/APIExample/entry/src/main/ets/pages/basic/JoinAudioChannel.ets](<https://gitee.com/agoraio-community/API-Examples/tree/HarmonyOS_NEXT-main/HarmonyOS_NEXT/APIExample/entry/src/main/ets/pages/basic/JoinAudioChannel.ets>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/audio-profile.mdx:745（另 2 处，见 CSV）` |
| 174 | [https://gitee.com/agoraio-community/API-Examples/tree/HarmonyOS_NEXT-main/HarmonyOS_NEXT/APIExample/entry/src/main/ets/pages/basic/JoinVideoChannel.ets](<https://gitee.com/agoraio-community/API-Examples/tree/HarmonyOS_NEXT-main/HarmonyOS_NEXT/APIExample/entry/src/main/ets/pages/basic/JoinVideoChannel.ets>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/video/video-profile.mdx:971` |
| 175 | [https://gitee.com/agoraio-community/API-Examples/tree/main/Android](<https://gitee.com/agoraio-community/API-Examples/tree/main/Android>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/get-started/run-demo.mdx:8（另 1 处，见 CSV）` |
| 176 | [https://gitee.com/agoraio-community/API-Examples/tree/main/Android/APIExample](<https://gitee.com/agoraio-community/API-Examples/tree/main/Android/APIExample>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/reference/demo/rtc-sdk-api-example.mdx:95` |
| 177 | [https://gitee.com/agoraio-community/API-Examples/tree/main/Android/APIExample/app/src/main/java/io/agora/api/example/examples/advanced/beauty](<https://gitee.com/agoraio-community/API-Examples/tree/main/Android/APIExample/app/src/main/java/io/agora/api/example/examples/advanced/beauty>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/video/advanced-beauty-460.mdx:274` |
| 178 | [https://gitee.com/agoraio-community/API-Examples/tree/main/iOS](<https://gitee.com/agoraio-community/API-Examples/tree/main/iOS>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/reference/downloads/ios.mdx:83` |
| 179 | [https://gitee.com/agoraio-community/API-Examples/tree/main/iOS/APIExample](<https://gitee.com/agoraio-community/API-Examples/tree/main/iOS/APIExample>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/get-started/run-demo.mdx:96（另 1 处，见 CSV）` |
| 180 | [https://gitee.com/agoraio-community/API-Examples/tree/main/iOS/APIExample-OC/Agora-ScreenShare-Extension-OC](<https://gitee.com/agoraio-community/API-Examples/tree/main/iOS/APIExample-OC/Agora-ScreenShare-Extension-OC>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/video/screen-share.mdx:704` |
| 181 | [https://gitee.com/agoraio-community/API-Examples/tree/main/iOS/APIExample-OC/APIExample-OC/Examples/Advanced/ScreenShare](<https://gitee.com/agoraio-community/API-Examples/tree/main/iOS/APIExample-OC/APIExample-OC/Examples/Advanced/ScreenShare>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/video/screen-share.mdx:705` |
| 182 | [https://gitee.com/agoraio-community/API-Examples/tree/main/iOS/APIExample/APIExample/Examples/Advanced/AudioMixing](<https://gitee.com/agoraio-community/API-Examples/tree/main/iOS/APIExample/APIExample/Examples/Advanced/AudioMixing>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/audio-effect-mixing.mdx:516（另 1 处，见 CSV）` |
| 183 | [https://gitee.com/agoraio-community/API-Examples/tree/main/iOS/APIExample/APIExample/Examples/Advanced/CustomAudioRender](<https://gitee.com/agoraio-community/API-Examples/tree/main/iOS/APIExample/APIExample/Examples/Advanced/CustomAudioRender>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/custom-audio-source.mdx:340` |
| 184 | [https://gitee.com/agoraio-community/API-Examples/tree/main/iOS/APIExample/APIExample/Examples/Advanced/CustomPcmAudioSource](<https://gitee.com/agoraio-community/API-Examples/tree/main/iOS/APIExample/APIExample/Examples/Advanced/CustomPcmAudioSource>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/custom-audio-source.mdx:337` |
| 185 | [https://gitee.com/agoraio-community/API-Examples/tree/main/iOS/APIExample/APIExample/Examples/Advanced/FaceCapture](<https://gitee.com/agoraio-community/API-Examples/tree/main/iOS/APIExample/APIExample/Examples/Advanced/FaceCapture>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/extensions/face-capture.mdx:287` |
| 186 | [https://gitee.com/agoraio-community/API-Examples/tree/main/iOS/APIExample/APIExample/Examples/Advanced/LiveStreaming](<https://gitee.com/agoraio-community/API-Examples/tree/main/iOS/APIExample/APIExample/Examples/Advanced/LiveStreaming>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/advanced-channel/ls-quick-start.mdx:122` |
| 187 | [https://gitee.com/agoraio-community/API-Examples/tree/main/iOS/APIExample/APIExample/Examples/Advanced/StreamEncryption](<https://gitee.com/agoraio-community/API-Examples/tree/main/iOS/APIExample/APIExample/Examples/Advanced/StreamEncryption>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/advanced-channel/channel-encryption.mdx:211` |
| 188 | [https://gitee.com/agoraio-community/API-Examples/tree/main/iOS/APIExample/APIExample/Examples/Advanced/VideoProcess/VideoProcess.swift](<https://gitee.com/agoraio-community/API-Examples/tree/main/iOS/APIExample/APIExample/Examples/Advanced/VideoProcess/VideoProcess.swift>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/video/advanced-beauty-460.mdx:703（另 1 处，见 CSV）` |
| 189 | [https://gitee.com/agoraio-community/API-Examples/tree/main/iOS/APIExample/APIExample/Examples/Advanced/VoiceChanger](<https://gitee.com/agoraio-community/API-Examples/tree/main/iOS/APIExample/APIExample/Examples/Advanced/VoiceChanger>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/voice-changer.mdx:423` |
| 190 | [https://gitee.com/agoraio-community/API-Examples/tree/main/iOS/APIExample/APIExample/Examples/Basic/JoinChannelAudio](<https://gitee.com/agoraio-community/API-Examples/tree/main/iOS/APIExample/APIExample/Examples/Basic/JoinChannelAudio>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/audio-profile.mdx:293（另 2 处，见 CSV）` |
| 191 | [https://gitee.com/agoraio-community/API-Examples/tree/main/macOS](<https://gitee.com/agoraio-community/API-Examples/tree/main/macOS>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/reference/downloads/macos.mdx:30（另 1 处，见 CSV）` |
| 192 | [https://gitee.com/agoraio-community/API-Examples/tree/main/macOS/APIExample](<https://gitee.com/agoraio-community/API-Examples/tree/main/macOS/APIExample>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/get-started/run-demo.mdx:180` |
| 193 | [https://gitee.com/agoraio-community/API-Examples/tree/main/macOS/APIExample/Examples/Advanced/AudioMixing](<https://gitee.com/agoraio-community/API-Examples/tree/main/macOS/APIExample/Examples/Advanced/AudioMixing>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/audio-effect-mixing.mdx:811（另 1 处，见 CSV）` |
| 194 | [https://gitee.com/agoraio-community/API-Examples/tree/main/macOS/APIExample/Examples/Advanced/CustomAudioRender](<https://gitee.com/agoraio-community/API-Examples/tree/main/macOS/APIExample/Examples/Advanced/CustomAudioRender>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/custom-audio-source.mdx:495` |
| 195 | [https://gitee.com/agoraio-community/API-Examples/tree/main/macOS/APIExample/Examples/Advanced/CustomAudioSource](<https://gitee.com/agoraio-community/API-Examples/tree/main/macOS/APIExample/Examples/Advanced/CustomAudioSource>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/custom-audio-source.mdx:492` |
| 196 | [https://gitee.com/agoraio-community/API-Examples/tree/main/macOS/APIExample/Examples/Advanced/FaceCapture](<https://gitee.com/agoraio-community/API-Examples/tree/main/macOS/APIExample/Examples/Advanced/FaceCapture>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/extensions/face-capture.mdx:428` |
| 197 | [https://gitee.com/agoraio-community/API-Examples/tree/main/macOS/APIExample/Examples/Advanced/LiveStreaming](<https://gitee.com/agoraio-community/API-Examples/tree/main/macOS/APIExample/Examples/Advanced/LiveStreaming>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/advanced-channel/ls-quick-start.mdx:187` |
| 198 | [https://gitee.com/agoraio-community/API-Examples/tree/main/macOS/APIExample/Examples/Advanced/Multipath](<https://gitee.com/agoraio-community/API-Examples/tree/main/macOS/APIExample/Examples/Advanced/Multipath>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/advanced-channel/multipath.mdx:301` |
| 199 | [https://gitee.com/agoraio-community/API-Examples/tree/main/macOS/APIExample/Examples/Advanced/RawAudioData](<https://gitee.com/agoraio-community/API-Examples/tree/main/macOS/APIExample/Examples/Advanced/RawAudioData>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/raw-audio-data.mdx:323` |
| 200 | [https://gitee.com/agoraio-community/API-Examples/tree/main/macOS/APIExample/Examples/Advanced/ScreenShare](<https://gitee.com/agoraio-community/API-Examples/tree/main/macOS/APIExample/Examples/Advanced/ScreenShare>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/video/screen-share.mdx:1017` |
| 201 | [https://gitee.com/agoraio-community/API-Examples/tree/main/macOS/APIExample/Examples/Advanced/StreamEncryption](<https://gitee.com/agoraio-community/API-Examples/tree/main/macOS/APIExample/Examples/Advanced/StreamEncryption>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/advanced-channel/channel-encryption.mdx:345` |
| 202 | [https://gitee.com/agoraio-community/API-Examples/tree/main/macOS/APIExample/Examples/Advanced/VideoProcess/VideoProcess.swift](<https://gitee.com/agoraio-community/API-Examples/tree/main/macOS/APIExample/Examples/Advanced/VideoProcess/VideoProcess.swift>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/video/advanced-beauty-460.mdx:1132（另 1 处，见 CSV）` |
| 203 | [https://gitee.com/agoraio-community/API-Examples/tree/main/macOS/APIExample/Examples/Advanced/VoiceChanger](<https://gitee.com/agoraio-community/API-Examples/tree/main/macOS/APIExample/Examples/Advanced/VoiceChanger>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/voice-changer.mdx:645` |
| 204 | [https://gitee.com/agoraio-community/API-Examples/tree/main/macOS/APIExample/Examples/Basic/JoinChannelAudio](<https://gitee.com/agoraio-community/API-Examples/tree/main/macOS/APIExample/Examples/Basic/JoinChannelAudio>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/audio-profile.mdx:451（另 1 处，见 CSV）` |
| 205 | [https://gitee.com/agoraio-community/API-Examples/tree/main/macOS/APIExample/Examples/Basic/JoinChannelVideo](<https://gitee.com/agoraio-community/API-Examples/tree/main/macOS/APIExample/Examples/Basic/JoinChannelVideo>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/get-started/quick-start.mdx:1772` |
| 206 | [https://gitee.com/agoraio-community/API-Examples/tree/main/windows](<https://gitee.com/agoraio-community/API-Examples/tree/main/windows>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/reference/demo/rtc-sdk-api-example.mdx:276` |
| 207 | [https://gitee.com/agoraio-community/API-Examples/tree/main/windows/APIExample/APIExample](<https://gitee.com/agoraio-community/API-Examples/tree/main/windows/APIExample/APIExample>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/get-started/run-demo.mdx:357（另 1 处，见 CSV）` |
| 208 | [https://gitee.com/agoraio-community/API-Examples/tree/main/windows/APIExample/APIExample/Advanced/AudioEffect](<https://gitee.com/agoraio-community/API-Examples/tree/main/windows/APIExample/APIExample/Advanced/AudioEffect>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/volume.mdx:565` |
| 209 | [https://gitee.com/agoraio-community/API-Examples/tree/main/windows/APIExample/APIExample/Advanced/AudioMixing](<https://gitee.com/agoraio-community/API-Examples/tree/main/windows/APIExample/APIExample/Advanced/AudioMixing>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/volume.mdx:562` |
| 210 | [https://gitee.com/agoraio-community/API-Examples/tree/main/windows/APIExample/APIExample/Advanced/AudioProfile](<https://gitee.com/agoraio-community/API-Examples/tree/main/windows/APIExample/APIExample/Advanced/AudioProfile>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/audio-profile.mdx:608` |
| 211 | [https://gitee.com/agoraio-community/API-Examples/tree/main/windows/APIExample/APIExample/Advanced/AudioVolume](<https://gitee.com/agoraio-community/API-Examples/tree/main/windows/APIExample/APIExample/Advanced/AudioVolume>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/volume.mdx:555` |
| 212 | [https://gitee.com/agoraio-community/API-Examples/tree/main/windows/APIExample/APIExample/Advanced/Beauty](<https://gitee.com/agoraio-community/API-Examples/tree/main/windows/APIExample/APIExample/Advanced/Beauty>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/video/advanced-beauty-460.mdx:1546` |
| 213 | [https://gitee.com/agoraio-community/API-Examples/tree/main/windows/APIExample/APIExample/Advanced/Beauty/CDlgBeautyEx.h](<https://gitee.com/agoraio-community/API-Examples/tree/main/windows/APIExample/APIExample/Advanced/Beauty/CDlgBeautyEx.h>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/video/advanced-beauty-legacy.mdx:998` |
| 214 | [https://gitee.com/agoraio-community/API-Examples/tree/main/windows/APIExample/APIExample/Advanced/BeautyAudio](<https://gitee.com/agoraio-community/API-Examples/tree/main/windows/APIExample/APIExample/Advanced/BeautyAudio>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/voice-changer.mdx:865` |
| 215 | [https://gitee.com/agoraio-community/API-Examples/tree/main/windows/APIExample/APIExample/Advanced/CustomAudioCapture](<https://gitee.com/agoraio-community/API-Examples/tree/main/windows/APIExample/APIExample/Advanced/CustomAudioCapture>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/custom-audio-source.mdx:688` |
| 216 | [https://gitee.com/agoraio-community/API-Examples/tree/main/windows/APIExample/APIExample/Advanced/FaceCapture](<https://gitee.com/agoraio-community/API-Examples/tree/main/windows/APIExample/APIExample/Advanced/FaceCapture>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/extensions/face-capture.mdx:571` |
| 217 | [https://gitee.com/agoraio-community/API-Examples/tree/main/windows/APIExample/APIExample/Advanced/MediaEncrypt](<https://gitee.com/agoraio-community/API-Examples/tree/main/windows/APIExample/APIExample/Advanced/MediaEncrypt>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/advanced-channel/channel-encryption.mdx:604` |
| 218 | [https://gitee.com/agoraio-community/API-Examples/tree/main/windows/APIExample/APIExample/Advanced/Multipath](<https://gitee.com/agoraio-community/API-Examples/tree/main/windows/APIExample/APIExample/Advanced/Multipath>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/advanced-channel/multipath.mdx:415` |
| 219 | [https://gitee.com/agoraio-community/API-Examples/tree/main/windows/APIExample/APIExample/Advanced/MultiVideoSourceTracks](<https://gitee.com/agoraio-community/API-Examples/tree/main/windows/APIExample/APIExample/Advanced/MultiVideoSourceTracks>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/video/custom-video-source.mdx:895` |
| 220 | [https://gitee.com/agoraio-community/API-Examples/tree/main/windows/APIExample/APIExample/Advanced/OriginalAudio](<https://gitee.com/agoraio-community/API-Examples/tree/main/windows/APIExample/APIExample/Advanced/OriginalAudio>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/raw-audio-data.mdx:453` |
| 221 | [https://gitee.com/agoraio-community/API-Examples/tree/main/windows/APIExample/APIExample/Advanced/PreCallTest](<https://gitee.com/agoraio-community/API-Examples/tree/main/windows/APIExample/APIExample/Advanced/PreCallTest>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/optimize-and-operate/lastmile-quality.mdx:895` |
| 222 | [https://gitee.com/agoraio-community/API-Examples/tree/main/windows/APIExample/APIExample/Basic/LiveBroadcasting](<https://gitee.com/agoraio-community/API-Examples/tree/main/windows/APIExample/APIExample/Basic/LiveBroadcasting>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/advanced-channel/ls-quick-start.mdx:365（另 3 处，见 CSV）` |
| 223 | [https://gitee.com/agoraio-community/Electron-SDK/blob/main/example](<https://gitee.com/agoraio-community/Electron-SDK/blob/main/example>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/get-started/run-demo.mdx:600` |
| 224 | [https://gitee.com/agoraio-community/Electron-SDK/blob/main/example/src/renderer/examples/advanced/AudioMixing/AudioMixing.tsx](<https://gitee.com/agoraio-community/Electron-SDK/blob/main/example/src/renderer/examples/advanced/AudioMixing/AudioMixing.tsx>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/audio-effect-mixing.mdx:1466（另 1 处，见 CSV）` |
| 225 | [https://gitee.com/agoraio-community/Electron-SDK/blob/main/example/src/renderer/examples/advanced/ChannelMediaRelay/ChannelMediaRelay.tsx](<https://gitee.com/agoraio-community/Electron-SDK/blob/main/example/src/renderer/examples/advanced/ChannelMediaRelay/ChannelMediaRelay.tsx>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/advanced-channel/media-relay.mdx:817（另 1 处，见 CSV）` |
| 226 | [https://gitee.com/agoraio-community/Electron-SDK/blob/main/example/src/renderer/examples/advanced/JoinMultipleChannel/JoinMultipleChannel.tsx](<https://gitee.com/agoraio-community/Electron-SDK/blob/main/example/src/renderer/examples/advanced/JoinMultipleChannel/JoinMultipleChannel.tsx>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/advanced-channel/multiple-channel.mdx:486` |
| 227 | [https://gitee.com/agoraio-community/Electron-SDK/blob/main/example/src/renderer/examples/advanced/LocalSpatialAudioEngine/LocalSpatialAudioEngine.tsx](<https://gitee.com/agoraio-community/Electron-SDK/blob/main/example/src/renderer/examples/advanced/LocalSpatialAudioEngine/LocalSpatialAudioEngine.tsx>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/spatial-audio.mdx:1645` |
| 228 | [https://gitee.com/agoraio-community/Electron-SDK/blob/main/example/src/renderer/examples/advanced/PlayEffect/PlayEffect.tsx](<https://gitee.com/agoraio-community/Electron-SDK/blob/main/example/src/renderer/examples/advanced/PlayEffect/PlayEffect.tsx>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/audio-effect-mixing.mdx:1463` |
| 229 | [https://gitee.com/agoraio-community/Electron-SDK/blob/main/example/src/renderer/examples/advanced/SpatialAudio/SpatialAudio.tsx](<https://gitee.com/agoraio-community/Electron-SDK/blob/main/example/src/renderer/examples/advanced/SpatialAudio/SpatialAudio.tsx>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/spatial-audio.mdx:1642` |
| 230 | [https://gitee.com/agoraio-community/Electron-SDK/blob/main/example/src/renderer/examples/basic/JoinChannelAudio/JoinChannelAudio.tsx](<https://gitee.com/agoraio-community/Electron-SDK/blob/main/example/src/renderer/examples/basic/JoinChannelAudio/JoinChannelAudio.tsx>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/audio-quick-start.mdx:3596（另 1 处，见 CSV）` |
| 231 | [https://gitee.com/agoraio-community/Electron-SDK/blob/main/example/src/renderer/examples/basic/JoinChannelVideo/JoinChannelVideo.tsx](<https://gitee.com/agoraio-community/Electron-SDK/blob/main/example/src/renderer/examples/basic/JoinChannelVideo/JoinChannelVideo.tsx>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/advanced-channel/ls-quick-start.mdx:496（另 1 处，见 CSV）` |
| 232 | [https://gitee.com/agoraio-community/Electron-SDK/tree/main/example](<https://gitee.com/agoraio-community/Electron-SDK/tree/main/example>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/reference/demo/rtc-sdk-api-example.mdx:495` |
| 233 | [https://gitee.com/agoraio-community/Electron-SDK/tree/main/example/src/renderer/examples/advanced/Encryption/Encryption.tsx](<https://gitee.com/agoraio-community/Electron-SDK/tree/main/example/src/renderer/examples/advanced/Encryption/Encryption.tsx>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/advanced-channel/channel-encryption.mdx:702` |
| 234 | [https://gitee.com/agoraio-community/Electron-SDK/tree/main/example/src/renderer/examples/advanced/MediaPlayer/MediaPlayer.tsx](<https://gitee.com/agoraio-community/Electron-SDK/tree/main/example/src/renderer/examples/advanced/MediaPlayer/MediaPlayer.tsx>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/media-player.mdx:842` |
| 235 | [https://gitee.com/agoraio-community/Electron-SDK/tree/main/example/src/renderer/examples/advanced/VoiceChanger/VoiceChanger.tsx](<https://gitee.com/agoraio-community/Electron-SDK/tree/main/example/src/renderer/examples/advanced/VoiceChanger/VoiceChanger.tsx>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/voice-changer.mdx:1085` |
| 236 | [https://gitee.com/agoraio-community/Electron-SDK/tree/v4.5.40-rc.2/example](<https://gitee.com/agoraio-community/Electron-SDK/tree/v4.5.40-rc.2/example>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/reference/downloads/electron.mdx:16` |
| 237 | [https://gitee.com/agoraio-community/react-native-agora/blob/3.x/example/src/examples/basic/JoinChannelAudio/JoinChannelAudio.tsx](<https://gitee.com/agoraio-community/react-native-agora/blob/3.x/example/src/examples/basic/JoinChannelAudio/JoinChannelAudio.tsx>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/audio-quick-start.mdx:5233` |
| 238 | [https://gitee.com/agoraio-community/react-native-agora/blob/3.x/example/src/examples/basic/JoinChannelVideo/JoinChannelVideo.tsx](<https://gitee.com/agoraio-community/react-native-agora/blob/3.x/example/src/examples/basic/JoinChannelVideo/JoinChannelVideo.tsx>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/advanced-channel/ls-quick-start.mdx:710（另 1 处，见 CSV）` |
| 239 | [https://gitee.com/agoraio-community/react-native-agora/blob/main/example/src/examples/advanced/AudioMixing/AudioMixing.tsx](<https://gitee.com/agoraio-community/react-native-agora/blob/main/example/src/examples/advanced/AudioMixing/AudioMixing.tsx>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/volume.mdx:1116` |
| 240 | [https://gitee.com/agoraio-community/react-native-agora/blob/main/example/src/examples/basic/JoinChannelAudio/JoinChannelAudio.tsx](<https://gitee.com/agoraio-community/react-native-agora/blob/main/example/src/examples/basic/JoinChannelAudio/JoinChannelAudio.tsx>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/volume.mdx:1109` |
| 241 | [https://gitee.com/agoraio-community/react-native-agora/tree/main/example](<https://gitee.com/agoraio-community/react-native-agora/tree/main/example>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/get-started/run-demo.mdx:875` |
| 242 | [https://gitee.com/agoraio-community/react-native-agora/tree/main/example/src/examples/advanced/AudioCallRoute/AudioCallRoute.tsx](<https://gitee.com/agoraio-community/react-native-agora/tree/main/example/src/examples/advanced/AudioCallRoute/AudioCallRoute.tsx>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/audio-route.mdx:104（另 1 处，见 CSV）` |
| 243 | [https://gitee.com/agoraio-community/react-native-agora/tree/main/example/src/examples/advanced/AudioMixing/AudioMixing.tsx](<https://gitee.com/agoraio-community/react-native-agora/tree/main/example/src/examples/advanced/AudioMixing/AudioMixing.tsx>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/audio-effect-mixing.mdx:1807` |
| 244 | [https://gitee.com/agoraio-community/react-native-agora/tree/main/example/src/examples/advanced/ChannelMediaRelay/ChannelMediaRelay.tsx](<https://gitee.com/agoraio-community/react-native-agora/tree/main/example/src/examples/advanced/ChannelMediaRelay/ChannelMediaRelay.tsx>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/advanced-channel/media-relay.mdx:1115（另 1 处，见 CSV）` |
| 245 | [https://gitee.com/agoraio-community/react-native-agora/tree/main/example/src/examples/advanced/Encryption/Encryption.tsx](<https://gitee.com/agoraio-community/react-native-agora/tree/main/example/src/examples/advanced/Encryption/Encryption.tsx>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/advanced-channel/channel-encryption.mdx:890` |
| 246 | [https://gitee.com/agoraio-community/react-native-agora/tree/main/example/src/examples/advanced/JoinMultipleChannel/JoinMultipleChannel.tsx](<https://gitee.com/agoraio-community/react-native-agora/tree/main/example/src/examples/advanced/JoinMultipleChannel/JoinMultipleChannel.tsx>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/advanced-channel/multiple-channel.mdx:709` |
| 247 | [https://gitee.com/agoraio-community/react-native-agora/tree/main/example/src/examples/advanced/LocalSpatialAudioEngine/LocalSpatialAudioEngine.tsx](<https://gitee.com/agoraio-community/react-native-agora/tree/main/example/src/examples/advanced/LocalSpatialAudioEngine/LocalSpatialAudioEngine.tsx>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/spatial-audio.mdx:2321` |
| 248 | [https://gitee.com/agoraio-community/react-native-agora/tree/main/example/src/examples/advanced/MediaPlayer/MediaPlayer.tsx](<https://gitee.com/agoraio-community/react-native-agora/tree/main/example/src/examples/advanced/MediaPlayer/MediaPlayer.tsx>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/media-player.mdx:1407` |
| 249 | [https://gitee.com/agoraio-community/react-native-agora/tree/main/example/src/examples/advanced/PictureInPicture](<https://gitee.com/agoraio-community/react-native-agora/tree/main/example/src/examples/advanced/PictureInPicture>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/video/picture-in-picture.mdx:700` |
| 250 | [https://gitee.com/agoraio-community/react-native-agora/tree/main/example/src/examples/advanced/PlayEffect/PlayEffect.tsx](<https://gitee.com/agoraio-community/react-native-agora/tree/main/example/src/examples/advanced/PlayEffect/PlayEffect.tsx>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/audio-effect-mixing.mdx:1804` |
| 251 | [https://gitee.com/agoraio-community/react-native-agora/tree/main/example/src/examples/advanced/SpatialAudio/SpatialAudio.tsx](<https://gitee.com/agoraio-community/react-native-agora/tree/main/example/src/examples/advanced/SpatialAudio/SpatialAudio.tsx>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/spatial-audio.mdx:2318` |
| 252 | [https://gitee.com/agoraio-community/react-native-agora/tree/main/example/src/examples/advanced/VoiceChanger/VoiceChanger.tsx](<https://gitee.com/agoraio-community/react-native-agora/tree/main/example/src/examples/advanced/VoiceChanger/VoiceChanger.tsx>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/build/audio/voice-changer.mdx:1535` |
| 253 | [https://gitee.com/agoraio-community/react-native-agora/tree/main/examples/expo](<https://gitee.com/agoraio-community/react-native-agora/tree/main/examples/expo>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/rtc/get-started/quick-start-expo.mdx:795` |
| 254 | [https://gitee.com/hangzhou_xiangxin_1/FULiveDemo/blob/master/docs/iOS_Nama_SDK_%E9%9B%86%E6%88%90%E6%8C%87%E5%AF%BC%E6%96%87%E6%A1%A3.md#2-sdk%E6%96%87%E4%BB%B6%E7%BB%93%E6%9E%84%E4%BD%BF%E7%94%A8%E6%96%B0%E6%9E%B6%E6%9E%84furenderkit%E5%8A%A8%E6%80%81%E5%BA%93](<https://gitee.com/hangzhou_xiangxin_1/FULiveDemo/blob/master/docs/iOS_Nama_SDK_%E9%9B%86%E6%88%90%E6%8C%87%E5%AF%BC%E6%96%87%E6%A1%A3.md#2-sdk%E6%96%87%E4%BB%B6%E7%BB%93%E6%9E%84%E4%BD%BF%E7%94%A8%E6%96%B0%E6%9E%B6%E6%9E%84furenderkit%E5%8A%A8%E6%80%81%E5%BA%93>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/marketplace/build/integrate-extensions/faceunity-ar.mdx:199（另 2 处，见 CSV）` |
| 255 | [https://gitee.com/hangzhou_xiangxin_1/FULiveDemo/tree/master/docs](<https://gitee.com/hangzhou_xiangxin_1/FULiveDemo/tree/master/docs>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/marketplace/build/integrate-extensions/faceunity-ar.mdx:204（另 2 处，见 CSV）` |
| 256 | [https://gitee.com/hangzhou_xiangxin_1/FULiveDemoDroid/blob/master/doc](<https://gitee.com/hangzhou_xiangxin_1/FULiveDemoDroid/blob/master/doc>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/marketplace/build/integrate-extensions/faceunity-ar.mdx:203（另 2 处，见 CSV）` |
| 257 | [https://gitee.com/hangzhou_xiangxin_1/FULiveDemoDroid/blob/master/doc/Android_Nama_Demo_%E8%BF%90%E8%A1%8C%E6%96%87%E6%A1%A3.md#2-demo%E6%96%87%E4%BB%B6%E7%BB%93%E6%9E%84](<https://gitee.com/hangzhou_xiangxin_1/FULiveDemoDroid/blob/master/doc/Android_Nama_Demo_%E8%BF%90%E8%A1%8C%E6%96%87%E6%A1%A3.md#2-demo%E6%96%87%E4%BB%B6%E7%BB%93%E6%9E%84>) | HTTP 405：请求被站点拒绝，未确认页面是否失效 | `content/docs/zh-CN/realtime-media/marketplace/build/integrate-extensions/faceunity-ar.mdx:198（另 2 处，见 CSV）` |

#### golang.org（2）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 258 | [https://golang.org/](<https://golang.org/>) | 请求超时，尚未确认可达性 | `content/docs/zh-CN/realtime-media/meeting/build/generate-token.mdx:30（另 10 处，见 CSV）` |
| 259 | [https://golang.org/dl/](<https://golang.org/dl/>) | 请求超时，尚未确认可达性 | `content/docs/zh-CN/realtime-media/local-server-recording/build/recording-preparation/generate-token.mdx:413（另 9 处，见 CSV）` |

#### googleapis.dev（1）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 260 | [https://googleapis.dev/nodejs/pubsub/latest/google.protobuf.html#.FieldMask](<https://googleapis.dev/nodejs/pubsub/latest/google.protobuf.html#.FieldMask>) | 初始 HTML 未找到指定片段，需浏览器确认 | `content/docs/zh-CN/realtime-media/media-pull/reference/ncs-events.mdx:84（另 2 处，见 CSV）` |

#### groups.google.com（1）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 261 | [https://groups.google.com/g/discuss-webrtc/c/9c8ZjberEcI](<https://groups.google.com/g/discuss-webrtc/c/9c8ZjberEcI>) | 请求超时，尚未确认可达性 | `content/docs/zh-CN/realtime-media/rtc/reference/release-notes.mdx:6881` |

#### guides.cocoapods.org（1）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 262 | [https://guides.cocoapods.org/syntax/podspec.html#weak_frameworks](<https://guides.cocoapods.org/syntax/podspec.html#weak_frameworks>) | 浏览器验证未完成，工具结果不足 | `content/docs/zh-CN/realtime-media/rtc/build/optimize-and-operate/reduce-app-size.mdx:4695（另 1 处，见 CSV）` |

#### help.apple.com（10）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 263 | [https://help.apple.com/developer-account/?lang=zh-cn#/dev82a71386a?sub=dev3255f4fb6](<https://help.apple.com/developer-account/?lang=zh-cn#/dev82a71386a?sub=dev3255f4fb6>) | 仅取得 JavaScript 页面外壳，正文/功能待核查 | `content/docs/zh-CN/solutions/iot-apaas/build/setup-and-access/enable-service.mdx:162` |
| 264 | [https://help.apple.com/developer-account/?lang=zh-cn#/dev82a71386a?sub=deveece40199](<https://help.apple.com/developer-account/?lang=zh-cn#/dev82a71386a?sub=deveece40199>) | 仅取得 JavaScript 页面外壳，正文/功能待核查 | `content/docs/zh-CN/solutions/iot-apaas/build/setup-and-access/enable-service.mdx:163` |
| 265 | [https://help.apple.com/developer-account/?lang=zh-cn#/devcdfbb56a3](<https://help.apple.com/developer-account/?lang=zh-cn#/devcdfbb56a3>) | 仅取得 JavaScript 页面外壳，正文/功能待核查 | `content/docs/zh-CN/solutions/iot-apaas/build/setup-and-access/enable-service.mdx:163` |
| 266 | [https://help.apple.com/xcode/mac/current/#/dev07db0e578](<https://help.apple.com/xcode/mac/current/#/dev07db0e578>) | SPA hash 路由，需确认对应页面内容 | `content/docs/zh-CN/ai/aigc/get-started/quick-start.mdx:433（另 14 处，见 CSV）` |
| 267 | [https://help.apple.com/xcode/mac/current/#/dev23aab79b4](<https://help.apple.com/xcode/mac/current/#/dev23aab79b4>) | SPA hash 路由，需确认对应页面内容 | `content/docs/zh-CN/realtime-media/meeting/get-started/integrate-meeting.mdx:149（另 13 处，见 CSV）` |
| 268 | [https://help.apple.com/xcode/mac/current/#/dev3f399a2a6](<https://help.apple.com/xcode/mac/current/#/dev3f399a2a6>) | SPA hash 路由，需确认对应页面内容 | `content/docs/zh-CN/ai/aigc/get-started/quick-start.mdx:454（另 15 处，见 CSV）` |
| 269 | [https://help.apple.com/xcode/mac/current/#/dev51a648b07](<https://help.apple.com/xcode/mac/current/#/dev51a648b07>) | SPA hash 路由，需确认对应页面内容 | `content/docs/zh-CN/realtime-media/rtc/build/audio/audio-quick-start.mdx:737（另 5 处，见 CSV）` |
| 270 | [https://help.apple.com/xcode/mac/current/#/dev60b6fbbc7](<https://help.apple.com/xcode/mac/current/#/dev60b6fbbc7>) | SPA hash 路由，需确认对应页面内容 | `content/docs/zh-CN/reference/faq/integration/ios_sign.mdx:18` |
| 271 | [https://help.apple.com/xcode/mac/current/#/devb83d64851](<https://help.apple.com/xcode/mac/current/#/devb83d64851>) | SPA hash 路由，需确认对应页面内容 | `content/docs/zh-CN/realtime-media/rtc/build/audio/audio-quick-start.mdx:757（另 3 处，见 CSV）` |
| 272 | [https://help.apple.com/xcode/mac/current/#/deve69552ee5](<https://help.apple.com/xcode/mac/current/#/deve69552ee5>) | SPA hash 路由，需确认对应页面内容 | `content/docs/zh-CN/realtime-media/meeting/get-started/integrate-meeting.mdx:151（另 13 处，见 CSV）` |

#### issues.chromium.org（1）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 273 | [https://issues.chromium.org/issues/467468926](<https://issues.chromium.org/issues/467468926>) | 请求超时，尚未确认可达性 | `content/docs/zh-CN/realtime-media/rtc/reference/release-notes.mdx:6039` |

#### mp.weixin.qq.com（1）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 274 | [https://mp.weixin.qq.com/](<https://mp.weixin.qq.com/>) | 仅取得 JavaScript 页面外壳，正文/功能待核查 | `content/docs/zh-CN/realtime-media/rtc/get-started/quick-start.mdx:4263（另 2 处，见 CSV）` |

#### mvnrepository.com（1）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 275 | [https://mvnrepository.com/artifact/io.agora.rtc/linux-sdk](<https://mvnrepository.com/artifact/io.agora.rtc/linux-sdk>) | HTTP 403：访问被拒绝，可能涉及权限或反爬 | `content/docs/zh-CN/realtime-media/rtc-server-sdk/get-started/run-example.mdx:282` |

#### open.oppomobile.com（1）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 276 | [https://open.oppomobile.com/new/developmentDoc/info?id=10195](<https://open.oppomobile.com/new/developmentDoc/info?id=10195>) | 仅取得 JavaScript 页面外壳，正文/功能待核查 | `content/docs/zh-CN/solutions/iot-apaas/build/setup-and-access/enable-service.mdx:207` |

#### platform.openai.com（5）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 277 | [https://platform.openai.com/docs/api-reference/chat](<https://platform.openai.com/docs/api-reference/chat>) | HTTP 403：访问被拒绝，可能涉及权限或反爬 | `content/docs/zh-CN/ai/build/custom-model-integration/audio-output.mdx:28（另 4 处，见 CSV）` |
| 278 | [https://platform.openai.com/docs/api-reference/realtime-client-events/conversation/item/[%60create%60](convoaiclient#create)](<https://platform.openai.com/docs/api-reference/realtime-client-events/conversation/item/[%60create%60](convoaiclient#create)>) | HTTP 403：访问被拒绝，可能涉及权限或反爬 | `content/docs/zh-CN/api-reference/conversational-ai/restclient-java/struct.mdx:900` |
| 279 | [https://platform.openai.com/docs/api-reference/realtime-client-events/conversation/item/%5B%60create%60%5D(convoaiclient#create)](<https://platform.openai.com/docs/api-reference/realtime-client-events/conversation/item/%5B%60create%60%5D(convoaiclient#create)>) | URL 中混入 Markdown 的 create 链接语法；需修正地址后复核 | `content/docs/zh-CN/api-reference/conversational-ai/restclient-java/struct.mdx:900` |
| 280 | [https://platform.openai.com/docs/api-reference/realtime-client-events/conversation/item/create](<https://platform.openai.com/docs/api-reference/realtime-client-events/conversation/item/create>) | HTTP 403：访问被拒绝，可能涉及权限或反爬 | `content/docs/zh-CN/api-reference/conversational-ai/restclient-go/struct.mdx:660` |
| 281 | [https://platform.openai.com/docs/guides/function-calling](<https://platform.openai.com/docs/guides/function-calling>) | HTTP 403：访问被拒绝，可能涉及权限或反爬 | `content/docs/zh-CN/ai/build/shape-the-conversation/rest-tool.mdx:825（另 1 处，见 CSV）` |

#### play.google.com（1）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 282 | [https://play.google.com/console/u/0/signup](<https://play.google.com/console/u/0/signup>) | 请求超时，尚未确认可达性 | `content/docs/zh-CN/solutions/smart-camera/build/google-assistant.mdx:16（另 1 处，见 CSV）` |

#### sso.agora.io（1）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 283 | [https://sso.agora.io/forget](<https://sso.agora.io/forget>) | 仅取得 JavaScript 页面外壳，正文/功能待核查 | `content/docs/zh-CN/reference/faq/account/console_account_faq.mdx:39` |

#### sso.shengwang.cn（3）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 284 | [https://sso.shengwang.cn/cn/v4/signup/with-sms](<https://sso.shengwang.cn/cn/v4/signup/with-sms>) | 仅取得 JavaScript 页面外壳，正文/功能待核查 | `content/docs/zh-CN/ai/aigc/get-started/enable-service.mdx:9（另 47 处，见 CSV）` |
| 285 | [https://sso.shengwang.cn/login](<https://sso.shengwang.cn/login>) | 仅取得 JavaScript 页面外壳，正文/功能待核查 | `content/docs/zh-CN/introduction/quickstart.mdx:17` |
| 286 | [https://sso.shengwang.cn/profile](<https://sso.shengwang.cn/profile>) | 仅取得 JavaScript 页面外壳，正文/功能待核查 | `content/docs/zh-CN/introduction/quickstart.mdx:118` |

#### stt-demo.agora.io（1）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 287 | [https://stt-demo.agora.io/](<https://stt-demo.agora.io/>) | 网络连接失败 | `content/docs/zh-CN/realtime-media/speech-to-text/get-started/quick-start.mdx:192` |

#### taro-docs.jd.com（1）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 288 | [https://taro-docs.jd.com/docs](<https://taro-docs.jd.com/docs>) | 仅取得 JavaScript 页面外壳，正文/功能待核查 | `content/docs/zh-CN/realtime-media/rtc/reference/release-notes.mdx:10047` |

#### ticket.shengwang.cn（1）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 289 | [https://ticket.shengwang.cn/](<https://ticket.shengwang.cn/>) | 跳转至登录页，尚未确认登录后的目标 | `content/docs/zh-CN/ai/build/handle-runtime-events/webhooks.mdx:145（另 804 处，见 CSV）` |

#### unity.com（1）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 290 | [https://unity.com/cn/products#plans-individual](<https://unity.com/cn/products#plans-individual>) | 初始 HTML 未找到指定片段，需浏览器确认 | `content/docs/zh-CN/realtime-media/rtc/build/audio/audio-quick-start.mdx:3663（另 1 处，见 CSV）` |

#### www.audiokinetic.com（1）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 291 | [https://www.audiokinetic.com/zh/download](<https://www.audiokinetic.com/zh/download>) | HTTP 403：访问被拒绝，可能涉及权限或反爬 | `content/docs/zh-CN/solutions/game-voice/build/spatial-audio-wwise.mdx:35（另 1 处，见 CSV）` |

#### www.cavca.org（1）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 292 | [https://www.cavca.org/](<https://www.cavca.org/>) | 仅取得 JavaScript 页面外壳，正文/功能待核查 | `content/docs/zh-CN/solutions/chatroom/sdk/build/set-audio.mdx:61（另 1 处，见 CSV）` |

#### www.chromestatus.com（1）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 293 | [https://www.chromestatus.com/feature/5823036655665152](<https://www.chromestatus.com/feature/5823036655665152>) | 仅取得 JavaScript 页面外壳，正文/功能待核查 | `content/docs/zh-CN/realtime-media/rtc/reference/release-notes.mdx:5852` |

#### www.google.com（3）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 294 | [https://www.google.com/chrome/](<https://www.google.com/chrome/>) | 请求超时，尚未确认可达性 | `content/docs/zh-CN/realtime-media/marketplace/build/create-extensions/audio-filter.mdx:1067（另 4 处，见 CSV）` |
| 295 | [https://www.google.com/get/noto/help/cjk/](<https://www.google.com/get/noto/help/cjk/>) | 请求超时，尚未确认可达性 | `content/docs/zh-CN/api-reference/local-server-recording/cpp/legacy/(current)/structagora-1-1linuxsdk-1-1-litera-watermark-config.mdx:36（另 2 处，见 CSV）` |
| 296 | [https://www.google.com/intl/zh-CN/chrome/](<https://www.google.com/intl/zh-CN/chrome/>) | 请求超时，尚未确认可达性 | `content/docs/zh-CN/realtime-media/rtc/reference/browser-compatibility.mdx:14（另 1 处，见 CSV）` |

#### www.npmjs.com（28）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 297 | [https://www.npmjs.com/get-npm](<https://www.npmjs.com/get-npm>) | HTTP 403：访问被拒绝，可能涉及权限或反爬 | `content/docs/zh-CN/realtime-media/rtc/build/setup-and-access/token-authentication.mdx:6395（另 8 处，见 CSV）` |
| 298 | [https://www.npmjs.com/package/@netless/app-docs-viewer](<https://www.npmjs.com/package/@netless/app-docs-viewer>) | HTTP 403：访问被拒绝，可能涉及权限或反爬 | `content/docs/zh-CN/reference/faq/integration/whiteboard_export_pdf.mdx:11` |
| 299 | [https://www.npmjs.com/package/@netless/app-in-mainview-plugin](<https://www.npmjs.com/package/@netless/app-in-mainview-plugin>) | HTTP 403：访问被拒绝，可能涉及权限或反爬 | `content/docs/zh-CN/api-reference/whiteboard/fastboard/fastboard-api.mdx:2388（另 4 处，见 CSV）` |
| 300 | [https://www.npmjs.com/package/@netless/app-slide](<https://www.npmjs.com/package/@netless/app-slide>) | HTTP 403：访问被拒绝，可能涉及权限或反爬 | `content/docs/zh-CN/reference/faq/integration/whiteboard_export_pdf.mdx:10` |
| 301 | [https://www.npmjs.com/package/@netless/cursor-tool](<https://www.npmjs.com/package/@netless/cursor-tool>) | HTTP 403：访问被拒绝，可能涉及权限或反爬 | `content/docs/zh-CN/realtime-media/whiteboard/whiteboard-sdk/reference/release-notes-wb.mdx:627（另 3 处，见 CSV）` |
| 302 | [https://www.npmjs.com/package/@netless/fastboard/v/1.1.0](<https://www.npmjs.com/package/@netless/fastboard/v/1.1.0>) | HTTP 403：访问被拒绝，可能涉及权限或反爬 | `src/components/docs-overview/sdk-install-command.test.ts:81（另 2 处，见 CSV）` |
| 303 | [https://www.npmjs.com/package/@netless/slide](<https://www.npmjs.com/package/@netless/slide>) | HTTP 403：访问被拒绝，可能涉及权限或反爬 | `content/docs/zh-CN/api-reference/ppt-conversion-service/restful/product-overview.mdx:36（另 5 处，见 CSV）` |
| 304 | [https://www.npmjs.com/package/@netless/video-js-plugin](<https://www.npmjs.com/package/@netless/video-js-plugin>) | HTTP 403：访问被拒绝，可能涉及权限或反爬 | `content/docs/zh-CN/api-reference/whiteboard/whiteboard-sdk/android/(current)/interfacecom-1-1herewhite-1-1sdk-1-1-common-callback.mdx:218（另 6 处，见 CSV）` |
| 305 | [https://www.npmjs.com/package/@netless/window-manager](<https://www.npmjs.com/package/@netless/window-manager>) | HTTP 403：访问被拒绝，可能涉及权限或反爬 | `content/docs/zh-CN/realtime-media/whiteboard/fastboard-sdk/reference/release-notes-fb.mdx:402（另 1 处，见 CSV）` |
| 306 | [https://www.npmjs.com/package/agora-conversational-ai-denoiser](<https://www.npmjs.com/package/agora-conversational-ai-denoiser>) | HTTP 403：访问被拒绝，可能涉及权限或反爬 | `content/docs/zh-CN/realtime-media/rtc/build/extensions/web/release.mdx:95` |
| 307 | [https://www.npmjs.com/package/agora-electron-sdk](<https://www.npmjs.com/package/agora-electron-sdk>) | HTTP 403：访问被拒绝，可能涉及权限或反爬 | `content/docs/zh-CN/realtime-media/rtc/build/audio/audio-quick-start.mdx:3176（另 1 处，见 CSV）` |
| 308 | [https://www.npmjs.com/package/agora-electron-sdk/v/4.5.40-rc.2](<https://www.npmjs.com/package/agora-electron-sdk/v/4.5.40-rc.2>) | HTTP 403：访问被拒绝，可能涉及权限或反爬 | `src/components/docs-overview/SdksCatalog.test.tsx:1059（另 2 处，见 CSV）` |
| 309 | [https://www.npmjs.com/package/agora-extension-ai-denoiser](<https://www.npmjs.com/package/agora-extension-ai-denoiser>) | HTTP 403：访问被拒绝，可能涉及权限或反爬 | `content/docs/zh-CN/realtime-media/rtc/build/extensions/web/noise-reduction.mdx:76（另 2 处，见 CSV）` |
| 310 | [https://www.npmjs.com/package/agora-extension-beauty-effect](<https://www.npmjs.com/package/agora-extension-beauty-effect>) | HTTP 403：访问被拒绝，可能涉及权限或反爬 | `content/docs/zh-CN/realtime-media/rtc/build/extensions/web/image-enhancement.mdx:93（另 2 处，见 CSV）` |
| 311 | [https://www.npmjs.com/package/agora-extension-super-clarity](<https://www.npmjs.com/package/agora-extension-super-clarity>) | HTTP 403：访问被拒绝，可能涉及权限或反爬 | `content/docs/zh-CN/realtime-media/rtc/build/extensions/web/release.mdx:266（另 2 处，见 CSV）` |
| 312 | [https://www.npmjs.com/package/agora-extension-vad](<https://www.npmjs.com/package/agora-extension-vad>) | HTTP 403：访问被拒绝，可能涉及权限或反爬 | `content/docs/zh-CN/realtime-media/rtc/build/extensions/web/release.mdx:120（另 1 处，见 CSV）` |
| 313 | [https://www.npmjs.com/package/agora-extension-video-compositor](<https://www.npmjs.com/package/agora-extension-video-compositor>) | HTTP 403：访问被拒绝，可能涉及权限或反爬 | `content/docs/zh-CN/realtime-media/rtc/build/extensions/web/release.mdx:233（另 1 处，见 CSV）` |
| 314 | [https://www.npmjs.com/package/agora-extension-video-watermark](<https://www.npmjs.com/package/agora-extension-video-watermark>) | HTTP 403：访问被拒绝，可能涉及权限或反爬 | `content/docs/zh-CN/realtime-media/rtc/build/extensions/web/release.mdx:278（另 2 处，见 CSV）` |
| 315 | [https://www.npmjs.com/package/agora-extension-virtual-background](<https://www.npmjs.com/package/agora-extension-virtual-background>) | HTTP 403：访问被拒绝，可能涉及权限或反爬 | `content/docs/zh-CN/realtime-media/rtc/build/extensions/web/release.mdx:209（另 3 处，见 CSV）` |
| 316 | [https://www.npmjs.com/package/agora-extension-virtual-background/v/2.0.0](<https://www.npmjs.com/package/agora-extension-virtual-background/v/2.0.0>) | HTTP 403：访问被拒绝，可能涉及权限或反爬 | `content/docs/zh-CN/realtime-media/rtc/reference/release-notes.mdx:6216` |
| 317 | [https://www.npmjs.com/package/agora-rtc-sdk-ng/v/4.24.9](<https://www.npmjs.com/package/agora-rtc-sdk-ng/v/4.24.9>) | HTTP 403：访问被拒绝，可能涉及权限或反爬 | `src/components/docs-overview/sdk-downloads-data.zh-cn.ts:1639` |
| 318 | [https://www.npmjs.com/package/agora-rte-extension](<https://www.npmjs.com/package/agora-rte-extension>) | HTTP 403：访问被拒绝，可能涉及权限或反爬 | `content/docs/zh-CN/realtime-media/marketplace/build/create-extensions/audio-filter.mdx:1075（另 1 处，见 CSV）` |
| 319 | [https://www.npmjs.com/package/agora-rtm](<https://www.npmjs.com/package/agora-rtm>) | HTTP 403：访问被拒绝，可能涉及权限或反爬 | `src/components/docs-overview/sdk-downloads-data.zh-cn.ts:1929（另 1 处，见 CSV）` |
| 320 | [https://www.npmjs.com/package/react-native-shengwang/v/4.6.4](<https://www.npmjs.com/package/react-native-shengwang/v/4.6.4>) | HTTP 403：访问被拒绝，可能涉及权限或反爬 | `src/components/docs-overview/SdksCatalog.test.tsx:93（另 2 处，见 CSV）` |
| 321 | [https://www.npmjs.com/package/shengwang-electron-sdk/v/4.6.2](<https://www.npmjs.com/package/shengwang-electron-sdk/v/4.6.2>) | HTTP 403：访问被拒绝，可能涉及权限或反爬 | `src/components/docs-overview/sdk-downloads-data.zh-cn.ts:3811（另 1 处，见 CSV）` |
| 322 | [https://www.npmjs.com/package/shengwang-rtm-miniapp](<https://www.npmjs.com/package/shengwang-rtm-miniapp>) | HTTP 403：访问被拒绝，可能涉及权限或反爬 | `content/docs/zh-CN/realtime-media/rtm/index.mdx:61（另 2 处，见 CSV）` |
| 323 | [https://www.npmjs.com/package/white-web-sdk](<https://www.npmjs.com/package/white-web-sdk>) | HTTP 403：访问被拒绝，可能涉及权限或反爬 | `content/docs/zh-CN/reference/faq/integration/whiteboard_export_pdf.mdx:17` |
| 324 | [https://www.npmjs.com/package/white-web-sdk/v/2.16.53](<https://www.npmjs.com/package/white-web-sdk/v/2.16.53>) | HTTP 403：访问被拒绝，可能涉及权限或反爬 | `src/components/docs-overview/sdk-downloads-data.zh-cn.ts:2354（另 1 处，见 CSV）` |

#### www.unrealengine.com（1）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 325 | [https://www.unrealengine.com/zh-CN/download](<https://www.unrealengine.com/zh-CN/download>) | HTTP 403：访问被拒绝，可能涉及权限或反爬 | `content/docs/zh-CN/realtime-media/rtc/build/audio/audio-quick-start.mdx:5272（另 6 处，见 CSV）` |

#### www.volcengine.com（1）

| 编号 | URL | 核查原因 | 来源示例 |
| ---: | --- | --- | --- |
| 326 | [https://www.volcengine.com/docs/6561/1329505](<https://www.volcengine.com/docs/6561/1329505>) | 仅取得 JavaScript 页面外壳，正文/功能待核查 | `content/openapi/conversational-ai/rest-api.zh-CN.yaml:2260` |
