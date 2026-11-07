# 查询结果明细

各分组保留默认首批实际展示顺序。这里的 new/old 链接用于复查当前站点，原始采样由 JSON 固定保存。

## 01 · Token

两站均命中鉴权主题；新站首位偏 RTM 部署。

[new](https://docs-portal-staging.sh3.agoralab.co/search?q=Token&type=all&page=1) · [old](https://doc.shengwang.cn/search?q=Token)

### new

**产品文档**

1. [部署 Token 服务器](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtm/build/authentication-and-connection/token-generation)
2. [Token 校验](https://docs-portal-staging.sh3.agoralab.co/introduction/user-guides/token-info)
3. [使用 Token 鉴权](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/build/setup-and-access/token-authentication)
4. [使用 Token 鉴权](https://docs-portal-staging.sh3.agoralab.co/realtime-media/local-server-recording/build/recording-preparation/generate-token)
5. [生成 Token](https://docs-portal-staging.sh3.agoralab.co/realtime-media/whiteboard/whiteboard-sdk/build/setup-and-access/generate-token)

**API 文档**

1. [生成 Room Token](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/whiteboard/restful/generate-room-token)
2. [生成 SDK Token](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/whiteboard/restful/generate-sdk-token)
3. [生成 Task Token](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/whiteboard/restful/generate-task-token)
4. [生成 SDK Token](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/ppt-conversion-service/generate-sdk-token)
5. [Enumeration ConnectionDisconnectedReason → TOKEN_EXPIRE](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/react-sdk/web-sdk/enums/connectiondisconnectedreason#token_expire)

**FAQ**

1. [如何升级到 Token 鉴权方案？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/appid_to_token)
2. [如何处理 Token 相关错误码？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/token_related_issues)
3. [如何生成同时具备 RTC 和 RTM 权限的 Token？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/rtc_rtm_token)

### old

**产品文档**

1. [功能指南 > Token 校验](https://doc.shengwang.cn/doc/console/general/user-guides/token_authentication)
2. [基础功能 > 使用 Token 鉴权](https://doc.shengwang.cn/doc/rtc/android/basic-features/token-authentication)
3. [快速开始 > 使用 Token 鉴权](https://doc.shengwang.cn/doc/rtc/mini-program/basic-features/token-authentication)
4. [基础功能 > 使用 Token 鉴权](https://doc.shengwang.cn/doc/flexible-classroom/android/basic-features/generate-token)
5. [功能指南 > 使用 Token 鉴权](https://doc.shengwang.cn/doc/recording/cpp/user-guides/generate-token)

**API 文档**

1. [生成 Token > 生成 SDK Token > post > /v5/tokens/teams](https://doc.shengwang.cn/doc/whiteboard/restful/fastboard-sdk/restful-wb/operations/post-v5-tokens-teams)
2. [生成 Token > 生成 Room Token > post > /v5/tokens/rooms/{uuid}](https://doc.shengwang.cn/doc/whiteboard/restful/fastboard-sdk/restful-wb/operations/post-v5-tokens-rooms-uuid)
3. [生成 Token > 生成 Task Token > post > /v5/tokens/tasks/{uuid}](https://doc.shengwang.cn/doc/whiteboard/restful/fastboard-sdk/restful-wb/operations/post-v5-tokens-tasks-uuid)
4. [生成 Token > 生成 SDK Token > post > /v5/tokens/teams](https://doc.shengwang.cn/doc/whiteboard/restful/whiteboard-sdk/restful-wb/operations/post-v5-tokens-teams)
5. [生成 Token > 生成 Room Token > post > /v5/tokens/rooms/{uuid}](https://doc.shengwang.cn/doc/whiteboard/restful/whiteboard-sdk/restful-wb/operations/post-v5-tokens-rooms-uuid)

**FAQ**

1. [集成类 > 如何升级到 Token 鉴权方案？](https://doc.shengwang.cn/faq/integration-issues/appid-to-token)
2. [集成类 > 如何处理 Token 相关错误码？](https://doc.shengwang.cn/faq/integration-issues/token-error)
3. [集成类 > 如何生成同时具备 RTC 和 RTM 权限的 Token？](https://doc.shengwang.cn/faq/integration-issues/generate-token)
4. [集成类 > 如何处理 JavaScript SDK 常见集成问题？ > 如何处理 Token 过期？](https://doc.shengwang.cn/faq/integration-issues/rtm2-integration-issue#%E5%A6%82%E4%BD%95%E5%A4%84%E7%90%86-token-%E8%BF%87%E6%9C%9F)
5. [集成类 > 如何处理 Token 相关错误码？ > Token 过期相关事件回调](https://doc.shengwang.cn/faq/integration-issues/token-error#token-%E8%BF%87%E6%9C%9F%E7%9B%B8%E5%85%B3%E4%BA%8B%E4%BB%B6%E5%9B%9E%E8%B0%83)

## 02 · APP ID

旧站首位获取 App ID；新站先解释术语，获取步骤在产品第 3 篇。

[new](https://docs-portal-staging.sh3.agoralab.co/search?q=APP%20ID&type=all&page=1) · [old](https://doc.shengwang.cn/search?q=APP%20ID)

### new

**产品文档**

1. [术语库 → App ID](https://docs-portal-staging.sh3.agoralab.co/introduction/glossary#app-id)
2. [实现纯语音互动 → 定义 App ID 和 Token](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/build/audio/audio-quick-start#%E5%AE%9A%E4%B9%89-app-id-%E5%92%8C-token)
3. [AccessToken 升级指南 → 获取 App ID 及 App 证书](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/build/setup-and-access/token-server-upgrade#%E8%8E%B7%E5%8F%96-app-id-%E5%8F%8A-app-%E8%AF%81%E4%B9%A6)
4. [实现音视频互动 → 定义 App ID 和 Token](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/get-started/quick-start#%E5%AE%9A%E4%B9%89-app-id-%E5%92%8C-token)

**API 文档**

1. [列出指定 App ID 下所有推流码](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/rtmp-gateway/list-streaming-keys)
2. [URL 拉流播放 → appId:](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/ios/play/rte-player#appid)
3. [URL 拉流播放 → appId:](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/macos/play/rte-player#appid)
4. [UnifiedPageState interface 参考 → appId](https://docs-portal-staging.sh3.agoralab.co/api-reference/whiteboard/whiteboard-sdk/harmonyos/interface-unified-page-state#appid)
5. [SdkOptions interface 参考 → appIdentifier](https://docs-portal-staging.sh3.agoralab.co/api-reference/whiteboard/whiteboard-sdk/harmonyos/interface-sdk-options#appidentifier)

**FAQ**

1. [如何处理 Token 相关错误码？ → 101：App ID 无效](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/token_related_issues#101app-id-%E6%97%A0%E6%95%88)
2. [如何升级到 Token 鉴权方案？ → 5. 不允许仅 App ID 加入](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/appid_to_token#5-%E4%B8%8D%E5%85%81%E8%AE%B8%E4%BB%85-app-id-%E5%8A%A0%E5%85%A5)
3. [如何使用 String 型用户 ID？ → 示例代码](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/string_uid#%E7%A4%BA%E4%BE%8B%E4%BB%A3%E7%A0%81)

### old

**产品文档**

1. [快速开始 > 开通服务 > 获取 App ID](https://doc.shengwang.cn/doc/rtc/android/get-started/enable-service#%E8%8E%B7%E5%8F%96-app-id)
2. [快速开始 > 开通服务 > 获取 App ID](https://doc.shengwang.cn/doc/flexible-classroom/android/get-started/enable#%E8%8E%B7%E5%8F%96-app-id)
3. [快速开始 > 开通服务 > 获取 App ID](https://doc.shengwang.cn/doc/media-push/restful/get-started/enable-service#%E8%8E%B7%E5%8F%96-app-id)
4. [快速开始 > 开通服务 > 获取 App ID](https://doc.shengwang.cn/doc/media-pull/restful/get-started/enable-service#%E8%8E%B7%E5%8F%96-app-id)
5. [快速开始 > 开通服务 > 获取 App ID](https://doc.shengwang.cn/doc/cloud-recording/restful/get-started/enable-service#%E8%8E%B7%E5%8F%96-app-id)

**API 文档**

1. [com.herewhite.sdk.domain.AppState class > appIds](https://doc.shengwang.cn/api-ref/whiteboard/android/classcom_1_1herewhite_1_1sdk_1_1domain_1_1_app_state#a3529ee7e8216c3eb6f9ae2299196d4e7)
2. [WhiteAppState > appIds](https://doc.shengwang.cn/api-ref/whiteboard/ios/Classes/WhiteAppState#appIds)
3. [WhiteAppState > focusedId](https://doc.shengwang.cn/api-ref/whiteboard/ios/Classes/WhiteAppState#focusedId)
4. [com.herewhite.sdk.domain.AppState class > getAppIds()](https://doc.shengwang.cn/api-ref/whiteboard/android/classcom_1_1herewhite_1_1sdk_1_1domain_1_1_app_state#a9e26d72d2c3dd746301acfb452d50589)
5. [销毁云端播放器 > delete > /{region}/v1/projects/{appId}/cloud-player/players/{id}](https://doc.shengwang.cn/doc/media-pull/restful/media-pull/operations/delete-region-v1-projects-appId-cloud-player-players-id)

**FAQ**

1. [集成类 > 如何处理 Token 相关错误码？ > 101：App ID 无效](https://doc.shengwang.cn/faq/integration-issues/token-error#101app-id-%E6%97%A0%E6%95%88)
2. [集成类 > 如何升级到 Token 鉴权方案？ > 5. 不允许仅 App ID 加入](https://doc.shengwang.cn/faq/integration-issues/appid-to-token#5-%E4%B8%8D%E5%85%81%E8%AE%B8%E4%BB%85-app-id-%E5%8A%A0%E5%85%A5)
3. [集成类 > 如何升级到 Token 鉴权方案？ > 1. 开启 App 证书](https://doc.shengwang.cn/faq/integration-issues/appid-to-token#1-%E5%BC%80%E5%90%AF-app-%E8%AF%81%E4%B9%A6)
4. [集成类 > 如何为录制文件指定动态存储路径？ > 固定变量](https://doc.shengwang.cn/faq/integration-issues/class-dynamic#%E5%9B%BA%E5%AE%9A%E5%8F%98%E9%87%8F)
5. [集成类 > 如何处理常见的 Web 浏览器控制台报错？ > INVALID_VENDOR_KEY > 错误原因](https://doc.shengwang.cn/faq/integration-issues/console-error#%E9%94%99%E8%AF%AF%E5%8E%9F%E5%9B%A0-6)

## 03 · 云端录制

两站首位均为产品概览，均有快速开始。

[new](https://docs-portal-staging.sh3.agoralab.co/search?q=%E4%BA%91%E7%AB%AF%E5%BD%95%E5%88%B6&type=all&page=1) · [old](https://doc.shengwang.cn/search?q=%E4%BA%91%E7%AB%AF%E5%BD%95%E5%88%B6)

### new

**产品文档**

1. [云端录制概览](https://docs-portal-staging.sh3.agoralab.co/realtime-media/cloud-recording)
2. [快速开始云端录制](https://docs-portal-staging.sh3.agoralab.co/realtime-media/cloud-recording/get-started/quick-start)
3. [平行操控概览 → 云端录制](https://docs-portal-staging.sh3.agoralab.co/solutions/teleoperation#%E4%BA%91%E7%AB%AF%E5%BD%95%E5%88%B6)
4. [功能指南 → 云端录制运行状态](https://docs-portal-staging.sh3.agoralab.co/realtime-media/status-page/build/implement-core-features/user-guide#%E4%BA%91%E7%AB%AF%E5%BD%95%E5%88%B6%E8%BF%90%E8%A1%8C%E7%8A%B6%E6%80%81)
5. [开通云端录制服务](https://docs-portal-staging.sh3.agoralab.co/realtime-media/cloud-recording/build/setup-and-access/enable-service#%E5%BC%80%E9%80%9A%E4%BA%91%E7%AB%AF%E5%BD%95%E5%88%B6%E6%9C%8D%E5%8A%A1)

**API 文档**

1. [获取云端录制资源](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/cloud-recording/acquire)
2. [查询云端录制状态](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/cloud-recording/query)
3. [开始云端录制](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/cloud-recording/start)
4. [停止云端录制](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/cloud-recording/stop)
5. [更新云端录制设置](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/cloud-recording/update)

**FAQ**

1. [云端录制如何处理服务器断网、进程被杀问题？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/high_availability)
2. [应用崩溃后对云端录制有什么影响？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/abnormal_exit)
3. [使用云端录制功能录制 AI 对话时，如何优化音频体验？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/convoai_cloud_recording)
4. [为什么成功开启云端录制后调用 query 方法返回 404？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/return_404)
5. [为什么无法通过浏览器调用云端录制 RESTful API？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/product/call_api_in_browser)

### old

**产品文档**

1. [产品 > 云端录制](https://doc.shengwang.cn/doc/cloud-recording/restful/landing-page)
2. [快速开始 > 使用 RESTful API 开始云端录制](https://doc.shengwang.cn/doc/cloud-recording/restful/get-started/quick-start)
3. [快速开始 > 使用 Go SDK 开始云端录制](https://doc.shengwang.cn/doc/cloud-recording/restful/get-started/quick-start-go)
4. [快速开始 > 使用 Java SDK 开始云端录制](https://doc.shengwang.cn/doc/cloud-recording/restful/get-started/quick-start-java)
5. [快速开始 > 使用 Node.js SDK 开始云端录制](https://doc.shengwang.cn/doc/cloud-recording/restful/get-started/quick-start-nodejs)

**API 文档**

1. [获取云端录制资源 > post > /v1/apps/{appid}/cloud_recording/acquire](https://doc.shengwang.cn/doc/cloud-recording/restful/cloud-recording/operations/post-v1-apps-appid-cloud_recording-acquire)
2. [开始云端录制 > post > /v1/apps/{appid}/cloud_recording/resourceid/{resourceid}/mode/{mode}/start](https://doc.shengwang.cn/doc/cloud-recording/restful/cloud-recording/operations/post-v1-apps-appid-cloud_recording-resourceid-resourceid-mode-mode-start)
3. [更新云端录制设置 > post > /v1/apps/{appid}/cloud_recording/resourceid/{resourceid}/sid/{sid}/mode/{mode}/update](https://doc.shengwang.cn/doc/cloud-recording/restful/cloud-recording/operations/post-v1-apps-appid-cloud_recording-resourceid-resourceid-sid-sid-mode-mode-update)
4. [更新云端录制合流布局 > post > /v1/apps/{appid}/cloud_recording/resourceid/{resourceid}/sid/{sid}/mode/{mode}/updateLayout](https://doc.shengwang.cn/doc/cloud-recording/restful/cloud-recording/operations/post-v1-apps-appid-cloud_recording-resourceid-resourceid-sid-sid-mode-mode-updateLayout)
5. [查询云端录制状态 > get > /v1/apps/{appid}/cloud_recording/resourceid/{resourceid}/sid/{sid}/mode/{mode}/query](https://doc.shengwang.cn/doc/cloud-recording/restful/cloud-recording/operations/get-v1-apps-appid-cloud_recording-resourceid-resourceid-sid-sid-mode-mode-query)

**FAQ**

1. [集成类 > 云端录制如何处理服务器断网、进程被杀问题？](https://doc.shengwang.cn/faq/integration-issues/high-availability)
2. [集成类 > 使用云端录制功能录制 AI 对话时，如何优化音频体验？](https://doc.shengwang.cn/faq/integration-issues/convoai-cloud-recording)
3. [集成类 > 应用崩溃后对云端录制有什么影响？](https://doc.shengwang.cn/faq/integration-issues/app-exit)
4. [集成类 > 如何解决云端录制 NCS 事件返回的 MP4 地址无法播放？](https://doc.shengwang.cn/faq/integration-issues/mp4-cannot-play)
5. [集成类 > 为什么成功开启云端录制后调用 query 方法返回 404？](https://doc.shengwang.cn/faq/integration-issues/return-404)

## 04 · 云录制

新站产品第 1 篇直达云端录制；旧站首批偏教学 FAQ。

[new](https://docs-portal-staging.sh3.agoralab.co/search?q=%E4%BA%91%E5%BD%95%E5%88%B6&type=all&page=1) · [old](https://doc.shengwang.cn/search?q=%E4%BA%91%E5%BD%95%E5%88%B6)

### new

**产品文档**

1. [云端录制概览](https://docs-portal-staging.sh3.agoralab.co/realtime-media/cloud-recording)
2. [使用云容器部署录制 SDK](https://docs-portal-staging.sh3.agoralab.co/realtime-media/local-server-recording/build/legacy/docker)
3. [集成注意事项 → 云录制常见问题](https://docs-portal-staging.sh3.agoralab.co/solutions/one-to-one-classroom/build/paas/best-practices#%E4%BA%91%E5%BD%95%E5%88%B6%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98)
4. [集成注意事项 → 云录制常见问题](https://docs-portal-staging.sh3.agoralab.co/solutions/small-classroom/build/paas/best-practices#%E4%BA%91%E5%BD%95%E5%88%B6%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98)
5. [集成注意事项 → 云录制常见问题](https://docs-portal-staging.sh3.agoralab.co/solutions/breakout-classroom/build/paas/best-practices#%E4%BA%91%E5%BD%95%E5%88%B6%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98)

**API 文档**

1. [停止云端录制](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/cloud-recording/stop)
2. [获取云端录制资源](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/cloud-recording/acquire)
3. [查询云端录制状态](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/cloud-recording/query)
4. [开始云端录制](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/cloud-recording/start)
5. [更新云端录制设置](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/cloud-recording/update)

**FAQ**

1. [为什么第三方云存储中没有录制文件？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/fail_to_upload)
2. [如何选择云存储 bucket 区域及处理跨区上传问题？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/bucket_region)
3. [本地服务端录制的并发性能如何？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/product/recording_concurrence)
4. [为什么成功开启云端录制后调用 query 方法返回 404？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/return_404)
5. [如何解决云端录制 NCS 事件返回的 MP4 地址无法播放？ → 问题原因](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/mp4_cannot_play#%E9%97%AE%E9%A2%98%E5%8E%9F%E5%9B%A0)

### old

**产品文档**

1. [PaaS 方案 > 集成注意事项 > 问题排查 > 云录制常见问题](https://doc.shengwang.cn/doc/one-to-one-classroom/android/paas/best-practices#%E4%BA%91%E5%BD%95%E5%88%B6%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98)
2. [PaaS 方案 > 集成注意事项 > 问题排查 > 云录制常见问题](https://doc.shengwang.cn/doc/small-classroom/android/paas/best-practices#%E4%BA%91%E5%BD%95%E5%88%B6%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98)
3. [PaaS 方案 > 集成注意事项 > 问题排查 > 云录制常见问题](https://doc.shengwang.cn/doc/breakout-classroom/android/paas/best-practices#%E4%BA%91%E5%BD%95%E5%88%B6%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98)
4. [快速开始 > 配置灵动课堂 > 配置录制功能](https://doc.shengwang.cn/doc/flexible-classroom/android/get-started/configure#%E9%85%8D%E7%BD%AE%E5%BD%95%E5%88%B6%E5%8A%9F%E8%83%BD)
5. [最佳实践 > 保障 REST 服务高可用 > 跨区请求加速](https://doc.shengwang.cn/doc/cloud-recording/restful/best-practices/rest-availability#%E8%B7%A8%E5%8C%BA%E8%AF%B7%E6%B1%82%E5%8A%A0%E9%80%9F)

**API 文档**

1. [自定义录制 > 设置自定义录制配置 > patch > /v1/projects/{appid}/fls/entry_points/{entry_point}/settings/record/custom/regions/{region}](https://doc.shengwang.cn/doc/fusion-cdn/restful/streaming/operations/patch-v1-projects-appid-fls-entry_points-entry_point-settings-record-custom-regions-region)
2. [标准录制 > 设置标准录制配置 > patch > /v1/projects/{appid}/fls/entry_points/{entry_point}/settings/record/standard/regions/{region}](https://doc.shengwang.cn/doc/fusion-cdn/restful/streaming/operations/patch-v1-projects-appid-fls-entry_points-entry_point-settings-record-standard-regions-region)
3. [停止云端录制 > post > /v1/apps/{appid}/cloud_recording/resourceid/{resourceid}/sid/{sid}/mode/{mode}/stop](https://doc.shengwang.cn/doc/cloud-recording/restful/cloud-recording/operations/post-v1-apps-appid-cloud_recording-resourceid-resourceid-sid-sid-mode-mode-stop)
4. [agora::recording::RecordingConfig > enableCloudProxy](https://doc.shengwang.cn/api-ref/recording/cpp/structagora_1_1recording_1_1_recording_config#a507ace41dec60a46d04233e03fb6c2e6)
5. [io.agora.recording.common.RecordingConfig > enableCloudProxy](https://doc.shengwang.cn/api-ref/recording/java/classio_1_1agora_1_1recording_1_1common_1_1_recording_config#adf2e4c69beeca9682ac6ff5dd29f1d07)

**FAQ**

1. [集成类 > 为什么成功开启云端录制后调用 query 方法返回 404？](https://doc.shengwang.cn/faq/integration-issues/return-404)
2. [集成类 > 如何解决云端录制 NCS 事件返回的 MP4 地址无法播放？ > 问题原因](https://doc.shengwang.cn/faq/integration-issues/mp4-cannot-play#%E9%97%AE%E9%A2%98%E5%8E%9F%E5%9B%A0)
3. [集成类 > 如何选择云存储 bucket 区域及处理跨区上传问题？](https://doc.shengwang.cn/faq/integration-issues/bucket-region)
4. [集成类 > 为什么第三方云存储中没有录制文件？](https://doc.shengwang.cn/faq/integration-issues/fail-to-upload)
5. [产品咨询类 > 本地服务端录制的并发性能如何？](https://doc.shengwang.cn/faq/general-product-inquiry/recording-concurrence)

## 05 · 屏幕共享

两站产品第 1 条均命中；新站减少同页章节重复。

[new](https://docs-portal-staging.sh3.agoralab.co/search?q=%E5%B1%8F%E5%B9%95%E5%85%B1%E4%BA%AB&type=all&page=1) · [old](https://doc.shengwang.cn/search?q=%E5%B1%8F%E5%B9%95%E5%85%B1%E4%BA%AB)

### new

**产品文档**

1. [屏幕共享](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/build/video/screen-share)

**API 文档**

1. [API 概览 → 屏幕共享](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/harmonyos/rtc-api-overview#%E5%B1%8F%E5%B9%95%E5%85%B1%E4%BA%AB)
2. [API 概览 → 屏幕共享](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/csharp-windows/rtc-api-overview#%E5%B1%8F%E5%B9%95%E5%85%B1%E4%BA%AB)
3. [API 概览 → 屏幕共享](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/unreal-cpp/rtc-api-overview#%E5%B1%8F%E5%B9%95%E5%85%B1%E4%BA%AB)
4. [API 概览 → 屏幕共享](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/unreal-blueprint/rtc-api-overview#%E5%B1%8F%E5%B9%95%E5%85%B1%E4%BA%AB)
5. [API 概览 → 屏幕采集](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/unity/rtc-api-overview#%E5%B1%8F%E5%B9%95%E9%87%87%E9%9B%86)

**FAQ**

1. [Electron 平台常见开发问题 → 无法获取应用程序窗口，导致无法共享屏幕](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/electron_faq#%E6%97%A0%E6%B3%95%E8%8E%B7%E5%8F%96%E5%BA%94%E7%94%A8%E7%A8%8B%E5%BA%8F%E7%AA%97%E5%8F%A3%E5%AF%BC%E8%87%B4%E6%97%A0%E6%B3%95%E5%85%B1%E4%BA%AB%E5%B1%8F%E5%B9%95)
2. [为什么调试模式下在 iOS 14 及以上设备上安装的 Flutter App 无法再次打开？ → 问题描述](https://docs-portal-staging.sh3.agoralab.co/reference/faq/quality/flutter_debug#%E9%97%AE%E9%A2%98%E6%8F%8F%E8%BF%B0)
3. [如何实现摄像头曝光和对焦？ → 示例代码](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/camera_exposure_focus#%E7%A4%BA%E4%BE%8B%E4%BB%A3%E7%A0%81)
4. [为什么部分 Android 版本 App 锁屏或切后台音视频采集或播放（渲染）无效？ → 问题现象](https://docs-portal-staging.sh3.agoralab.co/reference/faq/quality/android_background#%E9%97%AE%E9%A2%98%E7%8E%B0%E8%B1%A1)

### old

**产品文档**

1. [基础功能 > 屏幕共享](https://doc.shengwang.cn/doc/rtc/android/basic-features/screen-share)
2. [基础功能 > 屏幕共享 > 集成屏幕共享插件](https://doc.shengwang.cn/doc/rtc/android/basic-features/screen-share#%E9%9B%86%E6%88%90%E5%B1%8F%E5%B9%95%E5%85%B1%E4%BA%AB%E6%8F%92%E4%BB%B6)
3. [基础功能 > 屏幕共享 > 实现屏幕共享](https://doc.shengwang.cn/doc/rtc/android/basic-features/screen-share#%E5%AE%9E%E7%8E%B0%E5%B1%8F%E5%B9%95%E5%85%B1%E4%BA%AB)
4. [最佳实践 > SDK 升级后的 API 设置 > 升级前版本为 2.x 或 3.x > 屏幕共享](https://doc.shengwang.cn/doc/rtc/android/best-practice/after-migrate#%E5%B1%8F%E5%B9%95%E5%85%B1%E4%BA%AB)
5. [PaaS 方案 > 快速开始 > 集成指引 > 更多功能 > 屏幕共享](https://doc.shengwang.cn/doc/art-class/android/get-started/quick-start#%E5%B1%8F%E5%B9%95%E5%85%B1%E4%BA%AB)

**API 文档**

1. [VideoCaptureParameters > width](https://doc.shengwang.cn/api-ref/rtc/android/API/class_screenvideoparameters#width)
2. [VideoCaptureParameters > height](https://doc.shengwang.cn/api-ref/rtc/android/API/class_screenvideoparameters#height)
3. [AgoraScreenCaptureParameters2 > captureAudio](https://doc.shengwang.cn/api-ref/rtc/ios/API/class_screencaptureparameters2#captureAudio)
4. [AgoraScreenCaptureParameters2 > audioParams](https://doc.shengwang.cn/api-ref/rtc/ios/API/class_screencaptureparameters2#audioParams)
5. [AgoraScreenCaptureParameters2 > captureVideo](https://doc.shengwang.cn/api-ref/rtc/ios/API/class_screencaptureparameters2#captureVideo)

**FAQ**

1. [质量类 > 如何处理音视频相关问题？ > 屏幕共享带声音如何开启?](https://doc.shengwang.cn/faq/quality-issues/class-audio-video#%E5%B1%8F%E5%B9%95%E5%85%B1%E4%BA%AB%E5%B8%A6%E5%A3%B0%E9%9F%B3%E5%A6%82%E4%BD%95%E5%BC%80%E5%90%AF)
2. [质量类 > 如何处理音视频相关问题？ > 屏幕共享带声音如何开启? > Web 端](https://doc.shengwang.cn/faq/quality-issues/class-audio-video#web-%E7%AB%AF)
3. [质量类 > 如何处理音视频相关问题？ > 屏幕共享带声音如何开启? > Electron 端](https://doc.shengwang.cn/faq/quality-issues/class-audio-video#electron-%E7%AB%AF)
4. [质量类 > 如何处理音视频相关问题？ > 使用屏幕共享时报错“请先打开屏幕录制权限”?](https://doc.shengwang.cn/faq/quality-issues/class-audio-video#%E4%BD%BF%E7%94%A8%E5%B1%8F%E5%B9%95%E5%85%B1%E4%BA%AB%E6%97%B6%E6%8A%A5%E9%94%99%E8%AF%B7%E5%85%88%E6%89%93%E5%BC%80%E5%B1%8F%E5%B9%95%E5%BD%95%E5%88%B6%E6%9D%83%E9%99%90)
5. [集成类 > 如何自定义课堂 UI？ > Web 端如何更改屏幕共享背景颜色？](https://doc.shengwang.cn/faq/integration-issues/class-custom-ui#web-%E7%AB%AF%E5%A6%82%E4%BD%95%E6%9B%B4%E6%94%B9%E5%B1%8F%E5%B9%95%E5%85%B1%E4%BA%AB%E8%83%8C%E6%99%AF%E9%A2%9C%E8%89%B2)

## 06 · 降噪

两站命中降噪；新站首位是使用插件，旧站是插件发版说明。

[new](https://docs-portal-staging.sh3.agoralab.co/search?q=%E9%99%8D%E5%99%AA&type=all&page=1) · [old](https://doc.shengwang.cn/search?q=%E9%99%8D%E5%99%AA)

### new

**产品文档**

1. [使用 AI 降噪插件 → 降噪策略](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/build/extensions/web/noise-reduction#%E9%99%8D%E5%99%AA%E7%AD%96%E7%95%A5)
2. [集成指引 → 降噪模式](https://docs-portal-staging.sh3.agoralab.co/solutions/online-music-class/get-started/quick-start#%E9%99%8D%E5%99%AA%E6%A8%A1%E5%BC%8F)
3. [发版说明 → AI 降噪](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/reference/release-notes#ai-%E9%99%8D%E5%99%AA)
4. [插件发版说明 → AI 降噪插件](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/build/extensions/web/release#ai-%E9%99%8D%E5%99%AA%E6%8F%92%E4%BB%B6)

**API 文档**

1. [人声音效 → 参数](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/android/audio/audio-prenpost/audio-effect#%E5%8F%82%E6%95%B0-2)
2. [视频增强 → 参数](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/android/video/video-prenpro/video-enhance-option#%E5%8F%82%E6%95%B0-23)
3. [人声音效 → 参数](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/ios/audio/audio-prenpost/audio-effect#%E5%8F%82%E6%95%B0-2)
4. [视频增强 → setVideoDenoiserOptions:options:](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/ios/video/video-prenpro/video-enhance-option#setvideodenoiseroptionsoptions)

**FAQ**

1. [如何使用视频增强插件？ → 视频降噪](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/video_enhancement#%E8%A7%86%E9%A2%91%E9%99%8D%E5%99%AA)

### old

**产品文档**

1. [进阶功能 > 媒体处理插件 > 插件发版说明 > AI 降噪插件](https://doc.shengwang.cn/doc/rtc/javascript/advanced-features/extensions/release#ai-%E9%99%8D%E5%99%AA%E6%8F%92%E4%BB%B6)
2. [进阶功能 > 媒体处理插件 > 集成插件 > 功能介绍 > 降噪策略](https://doc.shengwang.cn/doc/rtc/javascript/advanced-features/extensions/noise-reduction#%E9%99%8D%E5%99%AA%E7%AD%96%E7%95%A5)
3. [PaaS 方案 > 快速开始 > 集成指引 > 音频优化 > 降噪模式](https://doc.shengwang.cn/doc/online-music-class/android/get-started/quick-start#%E9%99%8D%E5%99%AA%E6%A8%A1%E5%BC%8F)
4. [进阶功能 > 媒体处理插件 > 集成插件 > 实现步骤 > 5. 调整降噪模式或降噪等级](https://doc.shengwang.cn/doc/rtc/javascript/advanced-features/extensions/noise-reduction#5-%E8%B0%83%E6%95%B4%E9%99%8D%E5%99%AA%E6%A8%A1%E5%BC%8F%E6%88%96%E9%99%8D%E5%99%AA%E7%AD%89%E7%BA%A7)
5. [进阶功能 > 媒体处理插件 > 集成插件 > 功能介绍 > 噪声类型 ](https://doc.shengwang.cn/doc/rtc/javascript/advanced-features/extensions/noise-reduction#%E5%99%AA%E5%A3%B0%E7%B1%BB%E5%9E%8B-)

**API 文档**

1. [VideoDenoiserOptions > denoiserMode](https://doc.shengwang.cn/api-ref/rtc/android/API/class_videodenoiseroptions#denoiserMode)
2. [VideoDenoiserOptions > denoiserLevel](https://doc.shengwang.cn/api-ref/rtc/android/API/class_videodenoiseroptions#denoiserLevel)
3. [AgoraVideoDenoiserOptions > mode](https://doc.shengwang.cn/api-ref/rtc/ios/API/class_videodenoiseroptions#mode)
4. [AgoraVideoDenoiserOptions > level](https://doc.shengwang.cn/api-ref/rtc/ios/API/class_videodenoiseroptions#level)
5. [AgoraVideoDenoiserOptions > mode](https://doc.shengwang.cn/api-ref/rtc/macos/API/class_videodenoiseroptions#mode)

**FAQ**

1. [集成类 > 如何关闭 3A（降噪、回声消除、增益）的配置?](https://doc.shengwang.cn/faq/integration-issues/class-threea)
2. [集成类 > 如何使用视频增强插件？ > 参数设置 > 视频降噪](https://doc.shengwang.cn/faq/integration-issues/video-enhancement#%E8%A7%86%E9%A2%91%E9%99%8D%E5%99%AA)
3. [集成类 > 如何使用视频增强插件？](https://doc.shengwang.cn/faq/integration-issues/video-enhancement)
4. [集成类 > 如何使用视频增强插件？ > 功能介绍](https://doc.shengwang.cn/faq/integration-issues/video-enhancement#%E5%8A%9F%E8%83%BD%E4%BB%8B%E7%BB%8D)

## 07 · 虚拟背景

新站全部视图只有两篇发版说明；切到产品文档可见使用教程。

[new](https://docs-portal-staging.sh3.agoralab.co/search?q=%E8%99%9A%E6%8B%9F%E8%83%8C%E6%99%AF&type=all&page=1) · [old](https://doc.shengwang.cn/search?q=%E8%99%9A%E6%8B%9F%E8%83%8C%E6%99%AF)

### new

**产品文档**

1. [发版说明 → 虚拟背景](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/reference/release-notes#%E8%99%9A%E6%8B%9F%E8%83%8C%E6%99%AF)
2. [插件发版说明 → 虚拟背景插件](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/build/extensions/web/release#%E8%99%9A%E6%8B%9F%E8%83%8C%E6%99%AF%E6%8F%92%E4%BB%B6)

**API 文档**

1. [API 概览 → 虚拟背景](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/android/rtc-api-overview#%E8%99%9A%E6%8B%9F%E8%83%8C%E6%99%AF)
2. [API 概览 → 虚拟背景](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/ios/rtc-api-overview#%E8%99%9A%E6%8B%9F%E8%83%8C%E6%99%AF)
3. [API 概览 → 虚拟背景](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/macos/rtc-api-overview#%E8%99%9A%E6%8B%9F%E8%83%8C%E6%99%AF)
4. [API 概览 → 虚拟背景](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/unity/rtc-api-overview#%E8%99%9A%E6%8B%9F%E8%83%8C%E6%99%AF)
5. [API 概览 → 虚拟背景](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/flutter/rtc-api-overview#%E8%99%9A%E6%8B%9F%E8%83%8C%E6%99%AF)

**FAQ**

1. [本地服务端录制的并发性能如何？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/product/recording_concurrence)

### old

**产品文档**

1. [使用插件 > 皮卡智能 AI 虚拟背景](https://doc.shengwang.cn/doc/marketplace/javascript/integrate-extensions/picup)
2. [进阶功能 > 媒体处理插件 > 插件发版说明 > 虚拟背景插件](https://doc.shengwang.cn/doc/rtc/javascript/advanced-features/extensions/release#%E8%99%9A%E6%8B%9F%E8%83%8C%E6%99%AF%E6%8F%92%E4%BB%B6)
3. [最佳实践 > 实现 Alpha 特效 > 实现方案 > 开启虚拟背景](https://doc.shengwang.cn/doc/rtc/rn/best-practice/alpha-effect#%E5%BC%80%E5%90%AF%E8%99%9A%E6%8B%9F%E8%83%8C%E6%99%AF)
4. [进阶功能 > 媒体处理插件 > 集成插件 > 实现步骤 > 4. 设置虚拟背景](https://doc.shengwang.cn/doc/rtc/javascript/advanced-features/extensions/virtual-background#4-%E8%AE%BE%E7%BD%AE%E8%99%9A%E6%8B%9F%E8%83%8C%E6%99%AF)
5. [使用插件 > 皮卡智能 AI 虚拟背景 > 集成和调用流程 > 3. 开启虚拟背景](https://doc.shengwang.cn/doc/marketplace/javascript/integrate-extensions/picup#3-%E5%BC%80%E5%90%AF%E8%99%9A%E6%8B%9F%E8%83%8C%E6%99%AF)

**API 文档**

1. [VirtualBackgroundSource > background_source_type](https://doc.shengwang.cn/api-ref/rtc/windows/API/class_virtualbackgroundsource#background_source_type)
2. [VirtualBackgroundSource > color](https://doc.shengwang.cn/api-ref/rtc/windows/API/class_virtualbackgroundsource#color)
3. [VirtualBackgroundSource > source](https://doc.shengwang.cn/api-ref/rtc/windows/API/class_virtualbackgroundsource#source)
4. [VirtualBackgroundSource > blur_degree](https://doc.shengwang.cn/api-ref/rtc/windows/API/class_virtualbackgroundsource#blur_degree)
5. [RtcEngine > enableVirtualBackground [2/2]](https://doc.shengwang.cn/api-ref/rtc/android/API/toc_virtualbackground#api_irtcengine_enablevirtualbackground2)

**FAQ**

1. [质量类 > 如何处理音视频相关问题？ > 屏幕共享带声音如何开启? > Electron 端](https://doc.shengwang.cn/faq/quality-issues/class-audio-video#electron-%E7%AB%AF)
2. [产品咨询类 > 本地服务端录制的并发性能如何？](https://doc.shengwang.cn/faq/general-product-inquiry/recording-concurrence)

## 08 · 旁路推流

两站均有产品入口。

[new](https://docs-portal-staging.sh3.agoralab.co/search?q=%E6%97%81%E8%B7%AF%E6%8E%A8%E6%B5%81&type=all&page=1) · [old](https://doc.shengwang.cn/search?q=%E6%97%81%E8%B7%AF%E6%8E%A8%E6%B5%81)

### new

**产品文档**

1. [旁路推流概览](https://docs-portal-staging.sh3.agoralab.co/realtime-media/media-push)
2. [集成指引 → 旁路推流](https://docs-portal-staging.sh3.agoralab.co/solutions/digital-learning/course-resource/build/implement-core-features/integration#%E6%97%81%E8%B7%AF%E6%8E%A8%E6%B5%81)
3. [集成指引 → 旁路推流](https://docs-portal-staging.sh3.agoralab.co/solutions/digital-learning/school-resource/build/implement-core-features/integration#%E6%97%81%E8%B7%AF%E6%8E%A8%E6%B5%81)
4. [视频审核 → 旁路推流到 CDN](https://docs-portal-staging.sh3.agoralab.co/solutions/showroom/build/video-moderation#%E6%97%81%E8%B7%AF%E6%8E%A8%E6%B5%81%E5%88%B0-cdn)
5. [开通声网服务 → 开通旁路推流服务](https://docs-portal-staging.sh3.agoralab.co/realtime-media/media-push/build/enable-media-push/enable-service#%E5%BC%80%E9%80%9A%E6%97%81%E8%B7%AF%E6%8E%A8%E6%B5%81%E6%9C%8D%E5%8A%A1)

**API 文档**

1. [API 概览 → 旁路推流](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/android/rtc-api-overview#%E6%97%81%E8%B7%AF%E6%8E%A8%E6%B5%81)
2. [API 概览 → 旁路推流](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/ios/rtc-api-overview#%E6%97%81%E8%B7%AF%E6%8E%A8%E6%B5%81)
3. [API 概览 → 旁路推流](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/macos/rtc-api-overview#%E6%97%81%E8%B7%AF%E6%8E%A8%E6%B5%81)
4. [API 概览 → 旁路推流](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/unity/rtc-api-overview#%E6%97%81%E8%B7%AF%E6%8E%A8%E6%B5%81)
5. [API 概览 → 旁路推流](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/flutter/rtc-api-overview#%E6%97%81%E8%B7%AF%E6%8E%A8%E6%B5%81)

**FAQ**

1. [如何处理直播 SEI 相关问题？ → 声网 SEI 规范](https://docs-portal-staging.sh3.agoralab.co/reference/faq/quality/sei#%E5%A3%B0%E7%BD%91-sei-%E8%A7%84%E8%8C%83)
2. [声网与一般的 CDN + RTMP 直播技术有何不同？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/product/differ_agora_cdn)

### old

**产品文档**

1. [产品 > 旁路推流](https://doc.shengwang.cn/doc/media-push/restful/landing-page)
2. [功能指南 > 视频审核 > 旁路推流到 CDN](https://doc.shengwang.cn/doc/showroom/android/advanced-features/video-moderation#%E6%97%81%E8%B7%AF%E6%8E%A8%E6%B5%81%E5%88%B0-cdn)
3. [快速开始 > 开通服务 > 开通旁路推流服务](https://doc.shengwang.cn/doc/media-push/restful/get-started/enable-service#%E5%BC%80%E9%80%9A%E6%97%81%E8%B7%AF%E6%8E%A8%E6%B5%81%E6%9C%8D%E5%8A%A1)
4. [配额限制 > 推流分辨率和路数限制](https://doc.shengwang.cn/doc/media-push/restful/quota#%E6%8E%A8%E6%B5%81%E5%88%86%E8%BE%A8%E7%8E%87%E5%92%8C%E8%B7%AF%E6%95%B0%E9%99%90%E5%88%B6)
5. [快速开始 > 开始融合 CDN 直播 > 开始推流](https://doc.shengwang.cn/doc/fusion-cdn/restful/get-started/quick-start#%E5%BC%80%E5%A7%8B%E6%8E%A8%E6%B5%81)

**API 文档**

1. [LiveTranscoding > width](https://doc.shengwang.cn/api-ref/rtc/unity/API/class_livetranscoding#width)
2. [LiveTranscoding > height](https://doc.shengwang.cn/api-ref/rtc/unity/API/class_livetranscoding#height)
3. [LiveTranscoding > videoBitrate](https://doc.shengwang.cn/api-ref/rtc/unity/API/class_livetranscoding#videoBitrate)
4. [LiveTranscoding > videoFramerate](https://doc.shengwang.cn/api-ref/rtc/unity/API/class_livetranscoding#videoFramerate)
5. [LiveTranscoding > lowLatency](https://doc.shengwang.cn/api-ref/rtc/unity/API/class_livetranscoding#lowLatency)

**FAQ**

1. [质量类 > 如何处理直播 SEI 相关问题？ > 声网 SEI 规范](https://doc.shengwang.cn/faq/quality-issues/sei#%E5%A3%B0%E7%BD%91-sei-%E8%A7%84%E8%8C%83)
2. [产品咨询类 > 声网与一般的 CDN + RTMP 直播技术有何不同？](https://doc.shengwang.cn/faq/general-product-inquiry/differ-agora-cdn)

## 09 · 对话式 AI

旧站产品第 2 条为引擎入口；新站首批偏示例与接入。

[new](https://docs-portal-staging.sh3.agoralab.co/search?q=%E5%AF%B9%E8%AF%9D%E5%BC%8F%20AI&type=all&page=1) · [old](https://doc.shengwang.cn/search?q=%E5%AF%B9%E8%AF%9D%E5%BC%8F%20AI)

### new

**产品文档**

1. [对话式 AI 引擎 API 示例](https://docs-portal-staging.sh3.agoralab.co/reference/demo/conversational-ai-api-example)
2. [使用 RESTful API 实现对话式 AI 引擎](https://docs-portal-staging.sh3.agoralab.co/ai/get-started/quick-start)
3. [使用 Agents SDK 实现对话式 AI 引擎](https://docs-portal-staging.sh3.agoralab.co/ai/get-started/quick-start-agent)
4. [跑通 R1 示例 Demo → 启动对话式 AI 引擎服务](https://docs-portal-staging.sh3.agoralab.co/ai/device-kit/build/run-r1-demo#%E5%90%AF%E5%8A%A8%E5%AF%B9%E8%AF%9D%E5%BC%8F-ai-%E5%BC%95%E6%93%8E%E6%9C%8D%E5%8A%A1)

**API 文档**

1. [对话式 AI 引擎 API](https://docs-portal-staging.sh3.agoralab.co/api-reference/conversational-ai)
2. [创建对话式智能体](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/conversational-ai/join)
3. [停止对话式智能体](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/conversational-ai/leave)
4. [查询对话轮次信息](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/conversational-ai/turns)

**FAQ**

1. [使用云端录制功能录制 AI 对话时，如何优化音频体验？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/convoai_cloud_recording)

### old

**产品文档**

1. [场景 > 对话式 AI 开发套件](https://doc.shengwang.cn/doc/toybox/iot/landing-page)
2. [产品 > 对话式 AI 引擎](https://doc.shengwang.cn/doc/convoai/restful/landing-page)
3. [快速开始 > 使用 RESTful API 实现对话式 AI 引擎](https://doc.shengwang.cn/doc/convoai/restful/get-started/quick-start)
4. [快速开始 > 使用 Agents SDK 实现对话式 AI 引擎](https://doc.shengwang.cn/doc/convoai/restful/get-started/quick-start-agent)
5. [快速开始 > 开通服务 > 开通对话式 AI 引擎](https://doc.shengwang.cn/doc/toybox/iot/get-started/enable-service#%E5%BC%80%E9%80%9A%E5%AF%B9%E8%AF%9D%E5%BC%8F-ai-%E5%BC%95%E6%93%8E)

**API 文档**

1. [InterruptConvoAIRes](https://doc.shengwang.cn/api-ref/convoai/java/java-api/struct#interruptconvoaires)
2. [JoinConvoAIReq](https://doc.shengwang.cn/api-ref/convoai/java/java-api/struct#joinconvoaireq)
3. [HistoryConvoAIRes](https://doc.shengwang.cn/api-ref/convoai/java/java-api/struct#historyconvoaires)
4. [发送自定义指令 > post > /v2/projects/{appid}/agents/{agentId}/think](https://doc.shengwang.cn/doc/convoai/restful/convoai/operations/agent-think)
5. [创建对话式智能体 > post > /v2/projects/{appid}/join](https://doc.shengwang.cn/doc/convoai/restful/convoai/operations/start-agent)

**FAQ**

1. [集成类 > 使用云端录制功能录制 AI 对话时，如何优化音频体验？](https://doc.shengwang.cn/faq/integration-issues/convoai-cloud-recording)
2. [质量类 > 如何处理无声问题？ > 解决方案 > 定位问题类型](https://doc.shengwang.cn/faq/quality-issues/no-audio#%E5%AE%9A%E4%BD%8D%E9%97%AE%E9%A2%98%E7%B1%BB%E5%9E%8B)

## 10 · 秀场

两站首位均命中秀场入口。

[new](https://docs-portal-staging.sh3.agoralab.co/search?q=%E7%A7%80%E5%9C%BA&type=all&page=1) · [old](https://doc.shengwang.cn/search?q=%E7%A7%80%E5%9C%BA)

### new

**产品文档**

1. [秀场直播概览](https://docs-portal-staging.sh3.agoralab.co/solutions/showroom)
2. [秀场直播自适应高清视频](https://docs-portal-staging.sh3.agoralab.co/solutions/showroom/build/hq-video)
3. [实现秀场转 1v1](https://docs-portal-staging.sh3.agoralab.co/solutions/one-to-one-live/custom-signaling/build/implement-core-features/showroom-to-one-to-one)
4. [实现秀场转 1v1](https://docs-portal-staging.sh3.agoralab.co/solutions/one-to-one-live/rtm/build/implement-core-features/showroom-to-one-to-one)
5. [发版说明 → 秀场直播场景](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/reference/release-notes#%E7%A7%80%E5%9C%BA%E7%9B%B4%E6%92%AD%E5%9C%BA%E6%99%AF)

**API 文档**

1. [场景介绍](https://docs-portal-staging.sh3.agoralab.co/api-reference/private-room/android/custom-signaling/overview/product-overview)
2. [场景介绍](https://docs-portal-staging.sh3.agoralab.co/api-reference/private-room/android/rtm/overview/product-overview)
3. [场景介绍](https://docs-portal-staging.sh3.agoralab.co/api-reference/private-room/ios/custom-signaling/overview/product-overview)
4. [场景介绍](https://docs-portal-staging.sh3.agoralab.co/api-reference/private-room/ios/rtm/overview/product-overview)
5. [版权音乐 → 适用场景](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/unity/play/drm#%E9%80%82%E7%94%A8%E5%9C%BA%E6%99%AF-1)

**FAQ**

无展示结果。

### old

**产品文档**

1. [场景 > 秀场直播](https://doc.shengwang.cn/doc/showroom/android/landing-page)
2. [快速开始 > 实现秀场直播](https://doc.shengwang.cn/doc/showroom/android/basic-features/integrate-showroom)
3. [基础功能 > 实现秀场转 1v1](https://doc.shengwang.cn/doc/one-to-one-live/android/custom-signaling/basic-features/showroom-to-one-to-one)
4. [场景介绍](https://doc.shengwang.cn/doc/showroom/android/overview/product-overview)
5. [场景介绍](https://doc.shengwang.cn/doc/one-to-one-live/android/custom-signaling/overview/product-overview)

**API 文档**

1. [RtcEngine > setVideoScenario](https://doc.shengwang.cn/api-ref/rtc/android/API/toc_video_basic#api_irtcengine_setvideoscenario)
2. [AgoraRtcEngineKit > setVideoScenario:](https://doc.shengwang.cn/api-ref/rtc/ios/API/toc_video_basic#api_irtcengine_setvideoscenario)
3. [AgoraRtcEngineKit > setVideoScenario:](https://doc.shengwang.cn/api-ref/rtc/macos/API/toc_video_basic#api_irtcengine_setvideoscenario)
4. [IRtcEngine > setVideoScenario](https://doc.shengwang.cn/api-ref/rtc/windows/API/toc_video_basic#api_irtcengine_setvideoscenario)
5. [IRtcEngine > SetVideoScenario](https://doc.shengwang.cn/api-ref/rtc/unity/API/toc_video_basic#api_irtcengine_setvideoscenario)

**FAQ**

无展示结果。

## 11 · 实时消息

旧站首位为产品入口；新站首批偏合规/Demo/其他产品。

[new](https://docs-portal-staging.sh3.agoralab.co/search?q=%E5%AE%9E%E6%97%B6%E6%B6%88%E6%81%AF&type=all&page=1) · [old](https://doc.shengwang.cn/search?q=%E5%AE%9E%E6%97%B6%E6%B6%88%E6%81%AF)

### new

**产品文档**

1. [实时消息 SDK 合规使用说明](https://docs-portal-staging.sh3.agoralab.co/introduction/security/sdk-compliance/rtm-sdk)
2. [实时消息 RTM Web Demo](https://docs-portal-staging.sh3.agoralab.co/reference/demo/rtm-web-demo)
3. [发版说明 → 实时消息](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtsa/reference/release-notes#%E5%AE%9E%E6%97%B6%E6%B6%88%E6%81%AF)
4. [集成指引 → 实时消息互动](https://docs-portal-staging.sh3.agoralab.co/solutions/art-class/get-started/quick-start#%E5%AE%9E%E6%97%B6%E6%B6%88%E6%81%AF%E4%BA%92%E5%8A%A8)
5. [集成指引 → 实时消息互动](https://docs-portal-staging.sh3.agoralab.co/solutions/one-to-one-classroom/build/paas/integration-guide#%E5%AE%9E%E6%97%B6%E6%B6%88%E6%81%AF%E4%BA%92%E5%8A%A8)

**API 文档**

1. [查询消息通知服务器 IP](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/rtc/query-ip-address)
2. [消息](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtm/ios/message)
3. [消息](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtm/web/message)
4. [消息](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtm/unity/message)
5. [消息](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtm/flutter/message)

**FAQ**

1. [直播场景下，如何监听远端观众角色用户加入/离开频道的事件？ → 参考链接](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/audience_event#%E5%8F%82%E8%80%83%E9%93%BE%E6%8E%A5)
2. [如何将指定用户移出频道？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/kick_user)
3. [如何处理服务端 RESTful API 调用超出频率限制？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/restful_api_call_frequency)
4. [每月一万分钟免费说明](https://docs-portal-staging.sh3.agoralab.co/reference/faq/account/billing_free)

### old

**产品文档**

1. [产品 > 实时消息](https://doc.shengwang.cn/doc/rtm2/homepage)
2. [快速开始 > 开通服务 > 开通实时消息服务](https://doc.shengwang.cn/doc/chatroom/android/uikit/get-started/enable-service#%E5%BC%80%E9%80%9A%E5%AE%9E%E6%97%B6%E6%B6%88%E6%81%AF%E6%9C%8D%E5%8A%A1)
3. [快速开始 > 开通服务 > 开通实时消息服务](https://doc.shengwang.cn/doc/online-ktv/android/auikaraoke/get-started/enable-service#%E5%BC%80%E9%80%9A%E5%AE%9E%E6%97%B6%E6%B6%88%E6%81%AF%E6%9C%8D%E5%8A%A1)
4. [合规指南 > 二、App 使用实时消息 SDK 时的合规指引](https://doc.shengwang.cn/doc/rtm2/android/security#%E4%BA%8Capp-%E4%BD%BF%E7%94%A8%E5%AE%9E%E6%97%B6%E6%B6%88%E6%81%AF-sdk-%E6%97%B6%E7%9A%84%E5%90%88%E8%A7%84%E6%8C%87%E5%BC%95)
5. [快速开始 > 实现收发消息](https://doc.shengwang.cn/doc/rtm2/flutter/get-started/quick-start)

**API 文档**

1. [RtcEngine > sendStreamMessage](https://doc.shengwang.cn/api-ref/rtc/android/API/toc_datastream#api_irtcengine_sendstreammessage)
2. [RtcEngineEx > sendStreamMessageEx](https://doc.shengwang.cn/api-ref/rtc/android/API/toc_datastream#api_irtcengineex_sendstreammessageex)
3. [AgoraRtcEngineKit > sendStreamMessage:data:](https://doc.shengwang.cn/api-ref/rtc/ios/API/toc_datastream#api_irtcengine_sendstreammessage)
4. [AgoraRtcEngineKit > sendStreamMessage:data:](https://doc.shengwang.cn/api-ref/rtc/macos/API/toc_datastream#api_irtcengine_sendstreammessage)
5. [IRtcEngine > sendStreamMessage](https://doc.shengwang.cn/api-ref/rtc/windows/API/toc_datastream#api_irtcengine_sendstreammessage)

**FAQ**

1. [集成类 > 灵动课堂有哪些课堂状态？](https://doc.shengwang.cn/faq/integration-issues/class-states)
2. [账号与计费 > 每月一万分钟免费说明](https://doc.shengwang.cn/faq/account-and-billing/billing-free)
3. [集成类 > 直播场景下，如何监听远端观众角色用户加入/离开频道的事件？ > 使用消息通知服务 > 参考链接](https://doc.shengwang.cn/faq/integration-issues/audience-event#%E5%8F%82%E8%80%83%E9%93%BE%E6%8E%A5)
4. [集成类 > 直播场景下，如何监听远端观众角色用户加入/离开频道的事件？ > 使用消息通知服务 > 实现方法](https://doc.shengwang.cn/faq/integration-issues/audience-event#%E5%AE%9E%E7%8E%B0%E6%96%B9%E6%B3%95)
5. [集成类 > 如何将指定用户移出频道？](https://doc.shengwang.cn/faq/integration-issues/kick-user)

## 12 · 灵动课堂

旧站产品前 3 条为入口/配置/集成；新站未见，迁移范围待确认。

[new](https://docs-portal-staging.sh3.agoralab.co/search?q=%E7%81%B5%E5%8A%A8%E8%AF%BE%E5%A0%82&type=all&page=1) · [old](https://doc.shengwang.cn/search?q=%E7%81%B5%E5%8A%A8%E8%AF%BE%E5%A0%82)

### new

**产品文档**

1. [专递课堂场景介绍 → 方案优势](https://docs-portal-staging.sh3.agoralab.co/solutions/digital-learning/course-delivery#%E6%96%B9%E6%A1%88%E4%BC%98%E5%8A%BF)
2. [名师课堂场景介绍 → 方案优势](https://docs-portal-staging.sh3.agoralab.co/solutions/digital-learning/course-resource#%E6%96%B9%E6%A1%88%E4%BC%98%E5%8A%BF)
3. [实时互动 RTC 概览 → 功能和场景](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc#%E5%8A%9F%E8%83%BD%E5%92%8C%E5%9C%BA%E6%99%AF)
4. [多主播场景下的视频体验优化](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/build/video/custom-layout)
5. [发版说明 → 多路分辨率视频流](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/reference/release-notes#%E5%A4%9A%E8%B7%AF%E5%88%86%E8%BE%A8%E7%8E%87%E8%A7%86%E9%A2%91%E6%B5%81)

**API 文档**

1. [Agora Interactive Whiteboard Java API Reference → 2.16.134 当前 API](https://docs-portal-staging.sh3.agoralab.co/api-reference/whiteboard/whiteboard-sdk/android/overview#216134-%E5%BD%93%E5%89%8D-api)
2. [优化音频设置 → 方案一：使用客户端组件 API](https://docs-portal-staging.sh3.agoralab.co/api-reference/conversational-ai/rest-api/best-practice/audio-settings#%E6%96%B9%E6%A1%88%E4%B8%80%E4%BD%BF%E7%94%A8%E5%AE%A2%E6%88%B7%E7%AB%AF%E7%BB%84%E4%BB%B6-api)
3. [在线 K 歌房](https://docs-portal-staging.sh3.agoralab.co/api-reference/online-ktv)
4. [Interface IAgoraRTC → autoplay-failed](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/react-sdk/web-sdk/interfaces/iagorartc#autoplay-failed)

**FAQ**

1. [单流录制模式和合流录制模式有什么区别？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/recording_mode)

### old

**产品文档**

1. [产品 > 灵动课堂](https://doc.shengwang.cn/doc/flexible-classroom/android/landing-page)
2. [快速开始 > 配置灵动课堂](https://doc.shengwang.cn/doc/flexible-classroom/android/get-started/configure)
3. [快速开始 > 集成灵动课堂](https://doc.shengwang.cn/doc/flexible-classroom/android/get-started/integrate)
4. [快速开始 > 集成灵动课堂 > Classroom SDK & Proctor SDK](https://doc.shengwang.cn/doc/flexible-classroom/javascript/get-started/integrate)
5. [快速开始 > 集成灵动课堂 > FcrUIScene](https://doc.shengwang.cn/doc/flexible-classroom/javascript/get-started/integrate-new)

**API 文档**

1. [AgoraClassSDK > launch](https://doc.shengwang.cn/api-ref/flexible-classroom/android/classroom-sdk#launch)
2. [AgoraClassroomSDK > launch](https://doc.shengwang.cn/api-ref/flexible-classroom/ios/classroom-sdk#launch)
3. [AgoraEduSDK > launch](https://doc.shengwang.cn/api-ref/flexible-classroom/javascript/classroom-sdk#launch)
4. [AgoraEduSDK > launch](https://doc.shengwang.cn/api-ref/flexible-classroom/electron/classroom-sdk#launch)
5. [AgoraClassSDK > replaceClassActivity](https://doc.shengwang.cn/api-ref/flexible-classroom/android/classroom-sdk#replaceclassactivity)

**FAQ**

1. [集成类 > 灵动课堂如何支持多语言？](https://doc.shengwang.cn/faq/integration-issues/class-language)
2. [集成类 > 灵动课堂有哪些课堂状态？](https://doc.shengwang.cn/faq/integration-issues/class-states)
3. [集成类 > 集成和使用灵动课堂过程中的常见错误](https://doc.shengwang.cn/faq/integration-issues/class-errors)
4. [集成类 > 如何结束灵动课堂？](https://doc.shengwang.cn/faq/integration-issues/class-stop)
5. [集成类 > 集成和使用灵动课堂过程中的常见错误 > 运行灵动课堂 Web 项目报错](https://doc.shengwang.cn/faq/integration-issues/class-errors#%E8%BF%90%E8%A1%8C%E7%81%B5%E5%8A%A8%E8%AF%BE%E5%A0%82-web-%E9%A1%B9%E7%9B%AE%E6%8A%A5%E9%94%99)

## 13 · manualSOS

API 前 5 条中新站有 Android/iOS/Web 三个精确方法；旧站只有前两者。

[new](https://docs-portal-staging.sh3.agoralab.co/search?q=manualSOS&type=all&page=1) · [old](https://doc.shengwang.cn/search?q=manualSOS)

### new

**产品文档**

1. [手动控制说话开始和结束 → 在用户开始说话时发送手动 SoS](https://docs-portal-staging.sh3.agoralab.co/ai/build/shape-the-conversation/manual-turn-control#%E5%9C%A8%E7%94%A8%E6%88%B7%E5%BC%80%E5%A7%8B%E8%AF%B4%E8%AF%9D%E6%97%B6%E5%8F%91%E9%80%81%E6%89%8B%E5%8A%A8-sos)
2. [发版说明 → 新增](https://docs-portal-staging.sh3.agoralab.co/ai/release-notes#%E6%96%B0%E5%A2%9E-4)

**API 文档**

1. [IConversationalAIAPI 类 → manualSOS](https://docs-portal-staging.sh3.agoralab.co/api-reference/conversational-ai/android/iconversationalaiapi#manualsos)
2. [ConversationalAIAPI 类 → manualSOS](https://docs-portal-staging.sh3.agoralab.co/api-reference/conversational-ai/ios/conversationalaiapi#manualsos)
3. [ConversationalAIAPI 类 → manualSOS](https://docs-portal-staging.sh3.agoralab.co/api-reference/conversational-ai/web/conversationalaiapi#manualsos)
4. [结构体 → 成员参数](https://docs-portal-staging.sh3.agoralab.co/api-reference/conversational-ai/android/struct#%E6%88%90%E5%91%98%E5%8F%82%E6%95%B0-3)
5. [结构体 → 成员参数](https://docs-portal-staging.sh3.agoralab.co/api-reference/conversational-ai/ios/struct#%E6%88%90%E5%91%98%E5%8F%82%E6%95%B0-4)

**FAQ**

无展示结果。

### old

**产品文档**

1. [功能指南 > 手动控制说话开始和结束 > API 参考 > 客户端组件 API](https://doc.shengwang.cn/doc/convoai/restful/user-guides/manual-turn-control#%E5%AE%A2%E6%88%B7%E7%AB%AF%E7%BB%84%E4%BB%B6-api)
2. [功能指南 > 手动控制说话开始和结束 > 实现手动控制用户说话开始和结束 > 在用户开始说话时发送手动 SoS](https://doc.shengwang.cn/doc/convoai/restful/user-guides/manual-turn-control#%E5%9C%A8%E7%94%A8%E6%88%B7%E5%BC%80%E5%A7%8B%E8%AF%B4%E8%AF%9D%E6%97%B6%E5%8F%91%E9%80%81%E6%89%8B%E5%8A%A8-sos)
3. [功能指南 > 手动控制说话开始和结束 > 集成流程](https://doc.shengwang.cn/doc/convoai/restful/user-guides/manual-turn-control#%E9%9B%86%E6%88%90%E6%B5%81%E7%A8%8B)
4. [功能指南 > 手动控制说话开始和结束 > 选择控制模式](https://doc.shengwang.cn/doc/convoai/restful/user-guides/manual-turn-control#%E9%80%89%E6%8B%A9%E6%8E%A7%E5%88%B6%E6%A8%A1%E5%BC%8F)
5. [产品介绍 > 发版说明 > v2.10](https://doc.shengwang.cn/doc/convoai/restful/overview/release-notes#v2.10)

**API 文档**

1. [manualSOS](https://doc.shengwang.cn/api-ref/convoai/android/android-component/iconversationalaiapi#manualsos)
2. [manualSOS](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/conversationalaiapi#manualsos)
3. [UserManualSosEvent](https://doc.shengwang.cn/api-ref/convoai/android/android-component/struct#usermanualsosevent)
4. [UserManualSosEvent](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/struct#usermanualsosevent)
5. [onUserManualSosEvent](https://doc.shengwang.cn/api-ref/convoai/android/android-component/iconversationalaiapieventhandler#onusermanualsosevent)

**FAQ**

无展示结果。

## 14 · removeHandler

两站 API 首位均精确命中 RTC removeHandler。

[new](https://docs-portal-staging.sh3.agoralab.co/search?q=removeHandler&type=all&page=1) · [old](https://doc.shengwang.cn/search?q=removeHandler)

### new

**产品文档**

无展示结果。

**API 文档**

1. [初始化相关 → removeHandler](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/android/initialize#removehandler)
2. [IConversationalAIAPI 类 → removeHandler](https://docs-portal-staging.sh3.agoralab.co/api-reference/conversational-ai/android/iconversationalaiapi#removehandler)
3. [ConversationalAIAPI 类 → removeHandler](https://docs-portal-staging.sh3.agoralab.co/api-reference/conversational-ai/ios/conversationalaiapi#removehandler)
4. [API 概览 → 初始化相关](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/android/rtc-api-overview#%E5%88%9D%E5%A7%8B%E5%8C%96%E7%9B%B8%E5%85%B3)
5. [Full SDK API 列表 → 相关参考](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/android/rtc-interface-class#%E7%9B%B8%E5%85%B3%E5%8F%82%E8%80%83-21)

**FAQ**

无展示结果。

### old

**产品文档**

无展示结果。

**API 文档**

1. [RtcEngine > removeHandler](https://doc.shengwang.cn/api-ref/rtc/android/API/toc_initialize#api_irtcengine_removehandler)
2. [removeHandler](https://doc.shengwang.cn/api-ref/convoai/android/android-component/iconversationalaiapi#removehandler)
3. [removeHandler](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/conversationalaiapi#removehandler)
4. [WhiteRoom > removePage:completionHandler:](https://doc.shengwang.cn/api-ref/whiteboard/ios/Classes/WhiteRoom#removePage:completionHandler:)

**FAQ**

无展示结果。

## 15 · joinChannel

两站 API 首位均命中；旧站前 5 条集中 Android，新站跨平台。

[new](https://docs-portal-staging.sh3.agoralab.co/search?q=joinChannel&type=all&page=1) · [old](https://doc.shengwang.cn/search?q=joinChannel)

### new

**产品文档**

1. [音强选流 → API 参考](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/build/audio/audio-stream-filter#api-%E5%8F%82%E8%80%83)
2. [加快首帧出图 → 加入频道](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/build/video/first-frame-rendering#%E5%8A%A0%E5%85%A5%E9%A2%91%E9%81%93)
3. [加入多频道 → API 参考](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/build/advanced-channel/multiple-channel#api-%E5%8F%82%E8%80%83)
4. [实现纯语音互动 → 加入频道并发布音频流](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/build/audio/audio-quick-start#%E5%8A%A0%E5%85%A5%E9%A2%91%E9%81%93%E5%B9%B6%E5%8F%91%E5%B8%83%E9%9F%B3%E9%A2%91%E6%B5%81)
5. [实现音视频互动 → 加入频道并发布音视频流](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/get-started/quick-start#%E5%8A%A0%E5%85%A5%E9%A2%91%E9%81%93%E5%B9%B6%E5%8F%91%E5%B8%83%E9%9F%B3%E8%A7%86%E9%A2%91%E6%B5%81)

**API 文档**

1. [频道相关 → joinChannel](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/flutter/channel#joinchannel)
2. [频道相关 → joinChannel](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/electron/channel#joinchannel)
3. [频道相关 → joinChannel](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/react-native/channel#joinchannel)
4. [频道相关 → joinChannel](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/harmonyos/channel#joinchannel)
5. [频道相关 → JoinChannel](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/unreal-blueprint/channel#joinchannel)

**FAQ**

1. [如何调查首帧出图时间较长的问题？ → API 参考](https://docs-portal-staging.sh3.agoralab.co/reference/faq/quality/optimize_video_rendering#api-%E5%8F%82%E8%80%83)
2. [如何处理 Token 相关错误码？ → 109：Token 已过期](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/token_related_issues#109token-%E5%B7%B2%E8%BF%87%E6%9C%9F)
3. [如何升级到 Token 鉴权方案？ → 3. 修改客户端逻辑](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/appid_to_token#3-%E4%BF%AE%E6%94%B9%E5%AE%A2%E6%88%B7%E7%AB%AF%E9%80%BB%E8%BE%91)

### old

**产品文档**

1. [进阶功能 > 音强选流 > 参考信息 > API 参考](https://doc.shengwang.cn/doc/rtc/android/advanced-features/audio-stream-filter#api-%E5%8F%82%E8%80%83)
2. [进阶功能 > 加入多频道 > 参考信息 > API 参考](https://doc.shengwang.cn/doc/rtc/android/advanced-features/multiple-channel#api-%E5%8F%82%E8%80%83)
3. [进阶功能 > 自定义音频采集和渲染 > 参考信息 > API 参考](https://doc.shengwang.cn/doc/rtc/unity/advanced-features/custom-audio-source#api-%E5%8F%82%E8%80%83)
4. [快速开始 > 实现音视频互动 > 实现步骤 > 加入频道并发布音视频流](https://doc.shengwang.cn/doc/rtc/android/get-started/quick-start#%E5%8A%A0%E5%85%A5%E9%A2%91%E9%81%93%E5%B9%B6%E5%8F%91%E5%B8%83%E9%9F%B3%E8%A7%86%E9%A2%91%E6%B5%81)
5. [基础功能 > 实现纯语音互动 > 实现步骤 > 加入频道并发布音频流](https://doc.shengwang.cn/doc/rtc/android/basic-features/audio-quick-start#%E5%8A%A0%E5%85%A5%E9%A2%91%E9%81%93%E5%B9%B6%E5%8F%91%E5%B8%83%E9%9F%B3%E9%A2%91%E6%B5%81)

**API 文档**

1. [RtcEngine > joinChannel [1/2]](https://doc.shengwang.cn/api-ref/rtc/android/API/toc_channel#api_irtcengine_joinchannel1)
2. [RtcEngine > joinChannel [2/2]](https://doc.shengwang.cn/api-ref/rtc/android/API/toc_channel#api_irtcengine_joinchannel2)
3. [RtcEngineEx > joinChannelEx](https://doc.shengwang.cn/api-ref/rtc/android/API/toc_channel#api_irtcengineex_joinchannelex)
4. [RtcEngine > joinChannelWithUserAccount [1/2]](https://doc.shengwang.cn/api-ref/rtc/android/API/toc_channel#api_irtcengine_joinchannelwithuseraccount1)
5. [RtcEngine > joinChannelWithUserAccount [2/2]](https://doc.shengwang.cn/api-ref/rtc/android/API/toc_channel#api_irtcengine_joinchannelwithuseraccount2)

**FAQ**

1. [集成类 > 如何调查首帧出图时间较长的问题？ > 参考信息 > API 参考](https://doc.shengwang.cn/faq/integration-issues/video-frame-rendering#api-%E5%8F%82%E8%80%83)
2. [集成类 > 如何处理 Token 相关错误码？ > 109：Token 已过期](https://doc.shengwang.cn/faq/integration-issues/token-error#109token-%E5%B7%B2%E8%BF%87%E6%9C%9F)
3. [集成类 > 如何处理 Token 相关错误码？ > 110：Token 无效](https://doc.shengwang.cn/faq/integration-issues/token-error#110token-%E6%97%A0%E6%95%88)
4. [集成类 > 如何升级到 Token 鉴权方案？ > 3. 修改客户端逻辑](https://doc.shengwang.cn/faq/integration-issues/appid-to-token#3-%E4%BF%AE%E6%94%B9%E5%AE%A2%E6%88%B7%E7%AB%AF%E9%80%BB%E8%BE%91)
5. [集成类 > 如何使用 String 型用户 ID？ > 实现方法 > Native 端](https://doc.shengwang.cn/faq/integration-issues/string-uid#native-%E7%AB%AF)

## 16 · setClientRole

两站 API 首位命中；默认平台优先级不同。

[new](https://docs-portal-staging.sh3.agoralab.co/search?q=setClientRole&type=all&page=1) · [old](https://doc.shengwang.cn/search?q=setClientRole)

### new

**产品文档**

1. [快速集成 PaaS 方案 → 上麦/下麦](https://docs-portal-staging.sh3.agoralab.co/solutions/online-ktv/online-ktv-sdk/get-started/karaoke#%E4%B8%8A%E9%BA%A6%E4%B8%8B%E9%BA%A6)
2. [实现极速直播 → 实现步骤](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/build/advanced-channel/ls-quick-start#%E5%AE%9E%E7%8E%B0%E6%AD%A5%E9%AA%A4)
3. [管理语聊房麦位 → 切换用户角色](https://docs-portal-staging.sh3.agoralab.co/solutions/chatroom/sdk/build/mic-seat-management#%E5%88%87%E6%8D%A2%E7%94%A8%E6%88%B7%E8%A7%92%E8%89%B2)

**API 文档**

1. [频道相关 → setClientRole:](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/ios/channel#setclientrole)
2. [频道相关 → setClientRole:](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/macos/channel#setclientrole)
3. [Interface IAgoraRTCClient → setClientRole](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/react-sdk/web-sdk/interfaces/iagorartcclient#setclientrole)
4. [Interface IAgoraRTCClient → setClientRole](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/web/interfaces/iagorartcclient#setclientrole)
5. [频道相关 → setClientRole](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/flutter/channel#setclientrole)

**FAQ**

1. [如何使用连麦鉴权功能？ → 2. 修改 app 层实现逻辑](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/token_cohost#2-%E4%BF%AE%E6%94%B9-app-%E5%B1%82%E5%AE%9E%E7%8E%B0%E9%80%BB%E8%BE%91)

### old

**产品文档**

1. [基础功能 > 实现极速直播 > 实现低延时观众端](https://doc.shengwang.cn/doc/rtc/javascript/basic-features/ls-quick-start#%E5%AE%9E%E7%8E%B0%E4%BD%8E%E5%BB%B6%E6%97%B6%E8%A7%82%E4%BC%97%E7%AB%AF)
2. [基础功能 > 屏幕共享 > 参考信息 > API 参考](https://doc.shengwang.cn/doc/rtc/unity/basic-features/screen-share#api-%E5%8F%82%E8%80%83-2)
3. [Webhook 回调事件 > 事件类型 > 频道事件类型 > 111 client role change to broadcaster](https://doc.shengwang.cn/doc/rtc/restful/webhook/events#111-client-role-change-to-broadcaster)
4. [Webhook 回调事件 > 事件类型 > 频道事件类型 > 112 client role change to audience](https://doc.shengwang.cn/doc/rtc/restful/webhook/events#112-client-role-change-to-audience)
5. [快速开始 > 快速实现 > 实现在线 K 歌 > 上麦/下麦](https://doc.shengwang.cn/doc/online-ktv/android/online-ktv-sdk/get-started/karaoke#%E4%B8%8A%E9%BA%A6%E4%B8%8B%E9%BA%A6)

**API 文档**

1. [RtcEngine > setClientRole [1/2]](https://doc.shengwang.cn/api-ref/rtc/android/API/toc_channel#api_irtcengine_setclientrole1)
2. [RtcEngine > setClientRole [2/2]](https://doc.shengwang.cn/api-ref/rtc/android/API/toc_channel#api_irtcengine_setclientrole2)
3. [AgoraRtcEngineKit > setClientRole:](https://doc.shengwang.cn/api-ref/rtc/ios/API/toc_channel#api_irtcengine_setclientrole1)
4. [AgoraRtcEngineKit > setClientRole:options:](https://doc.shengwang.cn/api-ref/rtc/ios/API/toc_channel#api_irtcengine_setclientrole2)
5. [AgoraRtcEngineKit > setClientRole:](https://doc.shengwang.cn/api-ref/rtc/macos/API/toc_channel#api_irtcengine_setclientrole1)

**FAQ**

1. [集成类 > 如何使用连麦鉴权功能？ > 实现方法 > 2. 修改 app 层实现逻辑](https://doc.shengwang.cn/faq/integration-issues/token-cohost#2-%E4%BF%AE%E6%94%B9-app-%E5%B1%82%E5%AE%9E%E7%8E%B0%E9%80%BB%E8%BE%91)
2. [集成类 > 如何使用连麦鉴权功能？ > 实现方法 > 3. 开启连麦鉴权](https://doc.shengwang.cn/faq/integration-issues/token-cohost#3-%E5%BC%80%E5%90%AF%E8%BF%9E%E9%BA%A6%E9%89%B4%E6%9D%83)
3. [集成类 > 如何使用连麦鉴权功能？ > 升级注意事项](https://doc.shengwang.cn/faq/integration-issues/token-cohost#%E5%8D%87%E7%BA%A7%E6%B3%A8%E6%84%8F%E4%BA%8B%E9%A1%B9)

## 17 · remove Handler

两站 API 首位均命中 removeHandler，正文分组噪声仍多。

[new](https://docs-portal-staging.sh3.agoralab.co/search?q=remove%20Handler&type=all&page=1) · [old](https://doc.shengwang.cn/search?q=remove%20Handler)

### new

**产品文档**

1. [实现媒体流和信令传输 → 2.1 监听事件](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtsa/build/media-and-signaling-transmission/implement-transmission#21-%E7%9B%91%E5%90%AC%E4%BA%8B%E4%BB%B6)
2. [发版说明 → 问题修复](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtsa/reference/release-notes#%E9%97%AE%E9%A2%98%E4%BF%AE%E5%A4%8D-4)
3. [数据存储](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtm/build/state-and-attributes/data-storage)
4. [处理浏览器的自动播放策略 → 自动播放失败时解除 Autoplay 限制](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/build/optimize-and-operate/autoplay#%E8%87%AA%E5%8A%A8%E6%92%AD%E6%94%BE%E5%A4%B1%E8%B4%A5%E6%97%B6%E8%A7%A3%E9%99%A4-autoplay-%E9%99%90%E5%88%B6)
5. [Channel Metadata → 删除 Channel Metadata](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtm/build/state-and-attributes/channel-metadata#%E5%88%A0%E9%99%A4-channel-metadata)

**API 文档**

1. [初始化相关 → removeHandler](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/android/initialize#removehandler)
2. [IConversationalAIAPI 类 → removeHandler](https://docs-portal-staging.sh3.agoralab.co/api-reference/conversational-ai/android/iconversationalaiapi#removehandler)
3. [ConversationalAIAPI 类 → removeHandler](https://docs-portal-staging.sh3.agoralab.co/api-reference/conversational-ai/ios/conversationalaiapi#removehandler)
4. [K 歌房场景化 Kotlin API → removeEventHandler](https://docs-portal-staging.sh3.agoralab.co/api-reference/online-ktv/android/ktv-scenario/api/ktv-api#removeeventhandler)
5. [K 歌房场景化 Swift API → removeEventHandler](https://docs-portal-staging.sh3.agoralab.co/api-reference/online-ktv/ios/ktv-scenario/api/ktv-api#removeeventhandler)

**FAQ**

1. [如何处理 JavaScript SDK 常见集成问题？ → 如何获取断线重连期间加入和离开 Stream Channel 的用户列表？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/rtm2_integration_issue#%E5%A6%82%E4%BD%95%E8%8E%B7%E5%8F%96%E6%96%AD%E7%BA%BF%E9%87%8D%E8%BF%9E%E6%9C%9F%E9%97%B4%E5%8A%A0%E5%85%A5%E5%92%8C%E7%A6%BB%E5%BC%80-stream-channel-%E7%9A%84%E7%94%A8%E6%88%B7%E5%88%97%E8%A1%A8)
2. [为什么使用 Unity 4.x SDK 开发的 iOS App 上传到 App Store 会报错？ → 解决方案](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/ios_app_unity_reports_error#%E8%A7%A3%E5%86%B3%E6%96%B9%E6%A1%88)
3. [如何处理常见的 Web 浏览器控制台报错？ → Failed to set remote answer sdp: Called in wrong state: kStable](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/console_error_web#failed-to-set-remote-answer-sdp-called-in-wrong-state-kstable)
4. [使用云端录制功能录制 AI 对话时，如何优化音频体验？ → 完整配置示例](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/convoai_cloud_recording#%E5%AE%8C%E6%95%B4%E9%85%8D%E7%BD%AE%E7%A4%BA%E4%BE%8B)

### old

**产品文档**

1. [用户指南 > 消息 > 添加事件监听 > 删除事件监听](https://doc.shengwang.cn/doc/rtm2/harmonyos/user-guide/message/add-event-listener#%E5%88%A0%E9%99%A4%E4%BA%8B%E4%BB%B6%E7%9B%91%E5%90%AC)
2. [进阶功能 > 自定义插件 > 基本步骤](https://doc.shengwang.cn/doc/flexible-classroom/android/advanced-features/widget#%E5%9F%BA%E6%9C%AC%E6%AD%A5%E9%AA%A4)
3. [快速开始 > 实现媒体流和信令传输 > 实现流程 > 2. 传输媒体流](https://doc.shengwang.cn/doc/rtsa/c/get-started/implement-transmission#2-%E4%BC%A0%E8%BE%93%E5%AA%92%E4%BD%93%E6%B5%81)
4. [基础功能 > 实现纯语音互动 > 实现步骤 > 实现常用回调](https://doc.shengwang.cn/doc/rtc/unity/basic-features/audio-quick-start#%E5%AE%9E%E7%8E%B0%E5%B8%B8%E7%94%A8%E5%9B%9E%E8%B0%83)
5. [用户指南 > 消息 > 添加事件监听 > 添加事件监听](https://doc.shengwang.cn/doc/rtm2/ios/user-guide/message/add-event-listener#%E6%B7%BB%E5%8A%A0%E4%BA%8B%E4%BB%B6%E7%9B%91%E5%90%AC)

**API 文档**

1. [RtcEngine > removeHandler](https://doc.shengwang.cn/api-ref/rtc/android/API/toc_initialize#api_irtcengine_removehandler)
2. [removeHandler](https://doc.shengwang.cn/api-ref/convoai/android/android-component/iconversationalaiapi#removehandler)
3. [removeHandler](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/conversationalaiapi#removehandler)
4. [WhiteRoom > removePage:completionHandler:](https://doc.shengwang.cn/api-ref/whiteboard/ios/Classes/WhiteRoom#removePage:completionHandler:)
5. [ApplePencilDrawHandler > recoverApplianceFromTempRemove](https://doc.shengwang.cn/api-ref/whiteboard/ios/Classes/ApplePencilDrawHandler#recoverApplianceFromTempRemove)

**FAQ**

1. [集成类 > 如何处理 JavaScript SDK 常见集成问题？ > 如何获取断线重连期间加入和离开 Stream Channel 的用户列表？](https://doc.shengwang.cn/faq/integration-issues/rtm2-integration-issue#%E5%A6%82%E4%BD%95%E8%8E%B7%E5%8F%96%E6%96%AD%E7%BA%BF%E9%87%8D%E8%BF%9E%E6%9C%9F%E9%97%B4%E5%8A%A0%E5%85%A5%E5%92%8C%E7%A6%BB%E5%BC%80-stream-channel-%E7%9A%84%E7%94%A8%E6%88%B7%E5%88%97%E8%A1%A8)
2. [集成类 > 为什么使用 Unity 4.x SDK 开发的 iOS App 上传到 App Store 会报错？ > 解决方案](https://doc.shengwang.cn/faq/integration-issues/arch-error#%E8%A7%A3%E5%86%B3%E6%96%B9%E6%A1%88)
3. [集成类 > 如何处理常见的 Web 浏览器控制台报错？ > Failed to set remote answer sdp: Called in wrong state: kStable](https://doc.shengwang.cn/faq/integration-issues/console-error#failed-to-set-remote-answer-sdp-called-in-wrong-state-kstable)
4. [集成类 > 如何处理常见的 Web 浏览器控制台报错？ > Failed to set remote answer sdp: Called in wrong state: kStable > 错误原因](https://doc.shengwang.cn/faq/integration-issues/console-error#%E9%94%99%E8%AF%AF%E5%8E%9F%E5%9B%A0-4)
5. [集成类 > 如何处理常见的 Web 浏览器控制台报错？ > Failed to set remote answer sdp: Called in wrong state: kStable > 解决办法](https://doc.shengwang.cn/faq/integration-issues/console-error#%E8%A7%A3%E5%86%B3%E5%8A%9E%E6%B3%95-4)

## 18 · manualsos

两站大小写兼容，与 manualSOS 对应结果一致。

[new](https://docs-portal-staging.sh3.agoralab.co/search?q=manualsos&type=all&page=1) · [old](https://doc.shengwang.cn/search?q=manualsos)

### new

**产品文档**

1. [手动控制说话开始和结束 → 在用户开始说话时发送手动 SoS](https://docs-portal-staging.sh3.agoralab.co/ai/build/shape-the-conversation/manual-turn-control#%E5%9C%A8%E7%94%A8%E6%88%B7%E5%BC%80%E5%A7%8B%E8%AF%B4%E8%AF%9D%E6%97%B6%E5%8F%91%E9%80%81%E6%89%8B%E5%8A%A8-sos)
2. [发版说明 → 新增](https://docs-portal-staging.sh3.agoralab.co/ai/release-notes#%E6%96%B0%E5%A2%9E-4)

**API 文档**

1. [IConversationalAIAPI 类 → manualSOS](https://docs-portal-staging.sh3.agoralab.co/api-reference/conversational-ai/android/iconversationalaiapi#manualsos)
2. [ConversationalAIAPI 类 → manualSOS](https://docs-portal-staging.sh3.agoralab.co/api-reference/conversational-ai/ios/conversationalaiapi#manualsos)
3. [ConversationalAIAPI 类 → manualSOS](https://docs-portal-staging.sh3.agoralab.co/api-reference/conversational-ai/web/conversationalaiapi#manualsos)
4. [结构体 → 成员参数](https://docs-portal-staging.sh3.agoralab.co/api-reference/conversational-ai/android/struct#%E6%88%90%E5%91%98%E5%8F%82%E6%95%B0-3)
5. [结构体 → 成员参数](https://docs-portal-staging.sh3.agoralab.co/api-reference/conversational-ai/ios/struct#%E6%88%90%E5%91%98%E5%8F%82%E6%95%B0-4)

**FAQ**

无展示结果。

### old

**产品文档**

1. [功能指南 > 手动控制说话开始和结束 > API 参考 > 客户端组件 API](https://doc.shengwang.cn/doc/convoai/restful/user-guides/manual-turn-control#%E5%AE%A2%E6%88%B7%E7%AB%AF%E7%BB%84%E4%BB%B6-api)
2. [功能指南 > 手动控制说话开始和结束 > 实现手动控制用户说话开始和结束 > 在用户开始说话时发送手动 SoS](https://doc.shengwang.cn/doc/convoai/restful/user-guides/manual-turn-control#%E5%9C%A8%E7%94%A8%E6%88%B7%E5%BC%80%E5%A7%8B%E8%AF%B4%E8%AF%9D%E6%97%B6%E5%8F%91%E9%80%81%E6%89%8B%E5%8A%A8-sos)
3. [功能指南 > 手动控制说话开始和结束 > 集成流程](https://doc.shengwang.cn/doc/convoai/restful/user-guides/manual-turn-control#%E9%9B%86%E6%88%90%E6%B5%81%E7%A8%8B)
4. [功能指南 > 手动控制说话开始和结束 > 选择控制模式](https://doc.shengwang.cn/doc/convoai/restful/user-guides/manual-turn-control#%E9%80%89%E6%8B%A9%E6%8E%A7%E5%88%B6%E6%A8%A1%E5%BC%8F)
5. [产品介绍 > 发版说明 > v2.10](https://doc.shengwang.cn/doc/convoai/restful/overview/release-notes#v2.10)

**API 文档**

1. [manualSOS](https://doc.shengwang.cn/api-ref/convoai/android/android-component/iconversationalaiapi#manualsos)
2. [manualSOS](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/conversationalaiapi#manualsos)
3. [UserManualSosEvent](https://doc.shengwang.cn/api-ref/convoai/android/android-component/struct#usermanualsosevent)
4. [UserManualSosEvent](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/struct#usermanualsosevent)
5. [onUserManualSosEvent](https://doc.shengwang.cn/api-ref/convoai/android/android-component/iconversationalaiapieventhandler#onusermanualsosevent)

**FAQ**

无展示结果。

## 19 · JOINCHANNEL

两站大小写兼容，与 joinChannel 对应结果一致。

[new](https://docs-portal-staging.sh3.agoralab.co/search?q=JOINCHANNEL&type=all&page=1) · [old](https://doc.shengwang.cn/search?q=JOINCHANNEL)

### new

**产品文档**

1. [音强选流 → API 参考](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/build/audio/audio-stream-filter#api-%E5%8F%82%E8%80%83)
2. [加快首帧出图 → 加入频道](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/build/video/first-frame-rendering#%E5%8A%A0%E5%85%A5%E9%A2%91%E9%81%93)
3. [加入多频道 → API 参考](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/build/advanced-channel/multiple-channel#api-%E5%8F%82%E8%80%83)
4. [实现纯语音互动 → 加入频道并发布音频流](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/build/audio/audio-quick-start#%E5%8A%A0%E5%85%A5%E9%A2%91%E9%81%93%E5%B9%B6%E5%8F%91%E5%B8%83%E9%9F%B3%E9%A2%91%E6%B5%81)
5. [实现音视频互动 → 加入频道并发布音视频流](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/get-started/quick-start#%E5%8A%A0%E5%85%A5%E9%A2%91%E9%81%93%E5%B9%B6%E5%8F%91%E5%B8%83%E9%9F%B3%E8%A7%86%E9%A2%91%E6%B5%81)

**API 文档**

1. [频道相关 → joinChannel](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/flutter/channel#joinchannel)
2. [频道相关 → joinChannel](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/electron/channel#joinchannel)
3. [频道相关 → joinChannel](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/react-native/channel#joinchannel)
4. [频道相关 → joinChannel](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/harmonyos/channel#joinchannel)
5. [频道相关 → JoinChannel](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/unreal-blueprint/channel#joinchannel)

**FAQ**

1. [如何调查首帧出图时间较长的问题？ → API 参考](https://docs-portal-staging.sh3.agoralab.co/reference/faq/quality/optimize_video_rendering#api-%E5%8F%82%E8%80%83)
2. [如何处理 Token 相关错误码？ → 109：Token 已过期](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/token_related_issues#109token-%E5%B7%B2%E8%BF%87%E6%9C%9F)
3. [如何升级到 Token 鉴权方案？ → 3. 修改客户端逻辑](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/appid_to_token#3-%E4%BF%AE%E6%94%B9%E5%AE%A2%E6%88%B7%E7%AB%AF%E9%80%BB%E8%BE%91)

### old

**产品文档**

1. [进阶功能 > 音强选流 > 参考信息 > API 参考](https://doc.shengwang.cn/doc/rtc/android/advanced-features/audio-stream-filter#api-%E5%8F%82%E8%80%83)
2. [进阶功能 > 加入多频道 > 参考信息 > API 参考](https://doc.shengwang.cn/doc/rtc/android/advanced-features/multiple-channel#api-%E5%8F%82%E8%80%83)
3. [进阶功能 > 自定义音频采集和渲染 > 参考信息 > API 参考](https://doc.shengwang.cn/doc/rtc/unity/advanced-features/custom-audio-source#api-%E5%8F%82%E8%80%83)
4. [快速开始 > 实现音视频互动 > 实现步骤 > 加入频道并发布音视频流](https://doc.shengwang.cn/doc/rtc/android/get-started/quick-start#%E5%8A%A0%E5%85%A5%E9%A2%91%E9%81%93%E5%B9%B6%E5%8F%91%E5%B8%83%E9%9F%B3%E8%A7%86%E9%A2%91%E6%B5%81)
5. [基础功能 > 实现纯语音互动 > 实现步骤 > 加入频道并发布音频流](https://doc.shengwang.cn/doc/rtc/android/basic-features/audio-quick-start#%E5%8A%A0%E5%85%A5%E9%A2%91%E9%81%93%E5%B9%B6%E5%8F%91%E5%B8%83%E9%9F%B3%E9%A2%91%E6%B5%81)

**API 文档**

1. [RtcEngine > joinChannel [1/2]](https://doc.shengwang.cn/api-ref/rtc/android/API/toc_channel#api_irtcengine_joinchannel1)
2. [RtcEngine > joinChannel [2/2]](https://doc.shengwang.cn/api-ref/rtc/android/API/toc_channel#api_irtcengine_joinchannel2)
3. [RtcEngineEx > joinChannelEx](https://doc.shengwang.cn/api-ref/rtc/android/API/toc_channel#api_irtcengineex_joinchannelex)
4. [RtcEngine > joinChannelWithUserAccount [1/2]](https://doc.shengwang.cn/api-ref/rtc/android/API/toc_channel#api_irtcengine_joinchannelwithuseraccount1)
5. [RtcEngine > joinChannelWithUserAccount [2/2]](https://doc.shengwang.cn/api-ref/rtc/android/API/toc_channel#api_irtcengine_joinchannelwithuseraccount2)

**FAQ**

1. [集成类 > 如何调查首帧出图时间较长的问题？ > 参考信息 > API 参考](https://doc.shengwang.cn/faq/integration-issues/video-frame-rendering#api-%E5%8F%82%E8%80%83)
2. [集成类 > 如何处理 Token 相关错误码？ > 109：Token 已过期](https://doc.shengwang.cn/faq/integration-issues/token-error#109token-%E5%B7%B2%E8%BF%87%E6%9C%9F)
3. [集成类 > 如何处理 Token 相关错误码？ > 110：Token 无效](https://doc.shengwang.cn/faq/integration-issues/token-error#110token-%E6%97%A0%E6%95%88)
4. [集成类 > 如何升级到 Token 鉴权方案？ > 3. 修改客户端逻辑](https://doc.shengwang.cn/faq/integration-issues/appid-to-token#3-%E4%BF%AE%E6%94%B9%E5%AE%A2%E6%88%B7%E7%AB%AF%E9%80%BB%E8%BE%91)
5. [集成类 > 如何使用 String 型用户 ID？ > 实现方法 > Native 端](https://doc.shengwang.cn/faq/integration-issues/string-uid#native-%E7%AB%AF)

## 20 · removeHander

两站 API 首位均容错命中 removeHandler。

[new](https://docs-portal-staging.sh3.agoralab.co/search?q=removeHander&type=all&page=1) · [old](https://doc.shengwang.cn/search?q=removeHander)

### new

**产品文档**

无展示结果。

**API 文档**

1. [初始化相关 → removeHandler](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/android/initialize#removehandler)
2. [IConversationalAIAPI 类 → removeHandler](https://docs-portal-staging.sh3.agoralab.co/api-reference/conversational-ai/android/iconversationalaiapi#removehandler)
3. [ConversationalAIAPI 类 → removeHandler](https://docs-portal-staging.sh3.agoralab.co/api-reference/conversational-ai/ios/conversationalaiapi#removehandler)
4. [API 概览 → 初始化相关](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/android/rtc-api-overview#%E5%88%9D%E5%A7%8B%E5%8C%96%E7%9B%B8%E5%85%B3)
5. [Full SDK API 列表 → 相关参考](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/android/rtc-interface-class#%E7%9B%B8%E5%85%B3%E5%8F%82%E8%80%83-21)

**FAQ**

无展示结果。

### old

**产品文档**

无展示结果。

**API 文档**

1. [RtcEngine > removeHandler](https://doc.shengwang.cn/api-ref/rtc/android/API/toc_initialize#api_irtcengine_removehandler)
2. [removeHandler](https://doc.shengwang.cn/api-ref/convoai/android/android-component/iconversationalaiapi#removehandler)
3. [removeHandler](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/conversationalaiapi#removehandler)
4. [WhiteRoom > removePage:completionHandler:](https://doc.shengwang.cn/api-ref/whiteboard/ios/Classes/WhiteRoom#removePage:completionHandler:)
5. [agora::rtc::IVideoTrack > removeRenderer()](https://doc.shengwang.cn/api-ref/rtc-server-sdk/cpp/classagora_1_1rtc_1_1_i_video_track#a3a9f95dd2b82c66244ae3547506e7143)

**FAQ**

无展示结果。

## 21 · joinChanel

两站 API 前列均容错命中 joinChannel。

[new](https://docs-portal-staging.sh3.agoralab.co/search?q=joinChanel&type=all&page=1) · [old](https://doc.shengwang.cn/search?q=joinChanel)

### new

**产品文档**

1. [加入多频道 → API 参考](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/build/advanced-channel/multiple-channel#api-%E5%8F%82%E8%80%83)
2. [音强选流 → API 参考](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/build/audio/audio-stream-filter#api-%E5%8F%82%E8%80%83)
3. [加快首帧出图 → 加入频道](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/build/video/first-frame-rendering#%E5%8A%A0%E5%85%A5%E9%A2%91%E9%81%93)
4. [实现纯语音互动 → 加入频道并发布音频流](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/build/audio/audio-quick-start#%E5%8A%A0%E5%85%A5%E9%A2%91%E9%81%93%E5%B9%B6%E5%8F%91%E5%B8%83%E9%9F%B3%E9%A2%91%E6%B5%81)
5. [自定义视频采集 → API 参考](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/build/video/custom-video-source#api-%E5%8F%82%E8%80%83)

**API 文档**

1. [频道相关 → joinChannel [1/2]](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/android/channel#joinchannel-12)

**FAQ**

1. [如何调查首帧出图时间较长的问题？ → API 参考](https://docs-portal-staging.sh3.agoralab.co/reference/faq/quality/optimize_video_rendering#api-%E5%8F%82%E8%80%83)
2. [如何处理 Token 相关错误码？ → 109：Token 已过期](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/token_related_issues#109token-%E5%B7%B2%E8%BF%87%E6%9C%9F)
3. [如何使用 String 型用户 ID？ → Native 端](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/string_uid#native-%E7%AB%AF)
4. [如何升级到 Token 鉴权方案？ → 3. 修改客户端逻辑](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/appid_to_token#3-%E4%BF%AE%E6%94%B9%E5%AE%A2%E6%88%B7%E7%AB%AF%E9%80%BB%E8%BE%91)

### old

**产品文档**

1. [进阶功能 > 音强选流 > 参考信息 > API 参考](https://doc.shengwang.cn/doc/rtc/android/advanced-features/audio-stream-filter#api-%E5%8F%82%E8%80%83)
2. [进阶功能 > 加入多频道 > 参考信息 > API 参考](https://doc.shengwang.cn/doc/rtc/android/advanced-features/multiple-channel#api-%E5%8F%82%E8%80%83)
3. [进阶功能 > 自定义音频采集和渲染 > 参考信息 > API 参考](https://doc.shengwang.cn/doc/rtc/unity/advanced-features/custom-audio-source#api-%E5%8F%82%E8%80%83)
4. [快速开始 > 实现音视频互动 > 实现步骤 > 加入频道并发布音视频流](https://doc.shengwang.cn/doc/rtc/android/get-started/quick-start#%E5%8A%A0%E5%85%A5%E9%A2%91%E9%81%93%E5%B9%B6%E5%8F%91%E5%B8%83%E9%9F%B3%E8%A7%86%E9%A2%91%E6%B5%81)
5. [基础功能 > 实现纯语音互动 > 实现步骤 > 加入频道并发布音频流](https://doc.shengwang.cn/doc/rtc/android/basic-features/audio-quick-start#%E5%8A%A0%E5%85%A5%E9%A2%91%E9%81%93%E5%B9%B6%E5%8F%91%E5%B8%83%E9%9F%B3%E9%A2%91%E6%B5%81)

**API 文档**

1. [RtcEngine > joinChannel [1/2]](https://doc.shengwang.cn/api-ref/rtc/android/API/toc_channel#api_irtcengine_joinchannel1)
2. [RtcEngine > joinChannel [2/2]](https://doc.shengwang.cn/api-ref/rtc/android/API/toc_channel#api_irtcengine_joinchannel2)
3. [RtcEngineEx > joinChannelEx](https://doc.shengwang.cn/api-ref/rtc/android/API/toc_channel#api_irtcengineex_joinchannelex)
4. [RtcEngine > joinChannelWithUserAccount [1/2]](https://doc.shengwang.cn/api-ref/rtc/android/API/toc_channel#api_irtcengine_joinchannelwithuseraccount1)
5. [RtcEngine > joinChannelWithUserAccount [2/2]](https://doc.shengwang.cn/api-ref/rtc/android/API/toc_channel#api_irtcengine_joinchannelwithuseraccount2)

**FAQ**

1. [集成类 > 如何调查首帧出图时间较长的问题？ > 参考信息 > API 参考](https://doc.shengwang.cn/faq/integration-issues/video-frame-rendering#api-%E5%8F%82%E8%80%83)
2. [集成类 > 如何处理 Token 相关错误码？ > 109：Token 已过期](https://doc.shengwang.cn/faq/integration-issues/token-error#109token-%E5%B7%B2%E8%BF%87%E6%9C%9F)
3. [集成类 > 如何处理 Token 相关错误码？ > 110：Token 无效](https://doc.shengwang.cn/faq/integration-issues/token-error#110token-%E6%97%A0%E6%95%88)
4. [集成类 > 如何升级到 Token 鉴权方案？ > 3. 修改客户端逻辑](https://doc.shengwang.cn/faq/integration-issues/appid-to-token#3-%E4%BF%AE%E6%94%B9%E5%AE%A2%E6%88%B7%E7%AB%AF%E9%80%BB%E8%BE%91)
5. [集成类 > 如何使用 String 型用户 ID？ > 实现方法 > Native 端](https://doc.shengwang.cn/faq/integration-issues/string-uid#native-%E7%AB%AF)

## 22 · 屏幕共亨

新站产品首位为屏幕共享；旧站目标第 2 条，首条为 AI 开发套件。

[new](https://docs-portal-staging.sh3.agoralab.co/search?q=%E5%B1%8F%E5%B9%95%E5%85%B1%E4%BA%A8&type=all&page=1) · [old](https://doc.shengwang.cn/search?q=%E5%B1%8F%E5%B9%95%E5%85%B1%E4%BA%A8)

### new

**产品文档**

1. [屏幕共享](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/build/video/screen-share)

**API 文档**

1. [API 概览 → 屏幕共享](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/harmonyos/rtc-api-overview#%E5%B1%8F%E5%B9%95%E5%85%B1%E4%BA%AB)
2. [API 概览 → 屏幕共享](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/csharp-windows/rtc-api-overview#%E5%B1%8F%E5%B9%95%E5%85%B1%E4%BA%AB)
3. [API 概览 → 屏幕共享](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/unreal-cpp/rtc-api-overview#%E5%B1%8F%E5%B9%95%E5%85%B1%E4%BA%AB)
4. [API 概览 → 屏幕共享](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/unreal-blueprint/rtc-api-overview#%E5%B1%8F%E5%B9%95%E5%85%B1%E4%BA%AB)
5. [API 概览 → 屏幕采集](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/unity/rtc-api-overview#%E5%B1%8F%E5%B9%95%E9%87%87%E9%9B%86)

**FAQ**

1. [Electron 平台常见开发问题 → 无法获取应用程序窗口，导致无法共享屏幕](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/electron_faq#%E6%97%A0%E6%B3%95%E8%8E%B7%E5%8F%96%E5%BA%94%E7%94%A8%E7%A8%8B%E5%BA%8F%E7%AA%97%E5%8F%A3%E5%AF%BC%E8%87%B4%E6%97%A0%E6%B3%95%E5%85%B1%E4%BA%AB%E5%B1%8F%E5%B9%95)
2. [为什么调试模式下在 iOS 14 及以上设备上安装的 Flutter App 无法再次打开？ → 问题描述](https://docs-portal-staging.sh3.agoralab.co/reference/faq/quality/flutter_debug#%E9%97%AE%E9%A2%98%E6%8F%8F%E8%BF%B0)
3. [如何实现摄像头曝光和对焦？ → 示例代码](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/camera_exposure_focus#%E7%A4%BA%E4%BE%8B%E4%BB%A3%E7%A0%81)
4. [为什么部分 Android 版本 App 锁屏或切后台音视频采集或播放（渲染）无效？ → 问题现象](https://docs-portal-staging.sh3.agoralab.co/reference/faq/quality/android_background#%E9%97%AE%E9%A2%98%E7%8E%B0%E8%B1%A1)

### old

**产品文档**

1. [场景介绍 > 开发套件介绍](https://doc.shengwang.cn/doc/toybox/iot/overview/product-overview#%E5%BC%80%E5%8F%91%E5%A5%97%E4%BB%B6%E4%BB%8B%E7%BB%8D)
2. [基础功能 > 屏幕共享](https://doc.shengwang.cn/doc/rtc/android/basic-features/screen-share)
3. [基础功能 > 屏幕共享 > 集成屏幕共享插件](https://doc.shengwang.cn/doc/rtc/android/basic-features/screen-share#%E9%9B%86%E6%88%90%E5%B1%8F%E5%B9%95%E5%85%B1%E4%BA%AB%E6%8F%92%E4%BB%B6)
4. [基础功能 > 屏幕共享 > 实现屏幕共享](https://doc.shengwang.cn/doc/rtc/android/basic-features/screen-share#%E5%AE%9E%E7%8E%B0%E5%B1%8F%E5%B9%95%E5%85%B1%E4%BA%AB)
5. [最佳实践 > SDK 升级后的 API 设置 > 升级前版本为 2.x 或 3.x > 屏幕共享](https://doc.shengwang.cn/doc/rtc/android/best-practice/after-migrate#%E5%B1%8F%E5%B9%95%E5%85%B1%E4%BA%AB)

**API 文档**

1. [WatermarkRatio](https://doc.shengwang.cn/api-ref/rtc/electron/API/class_watermarkratio#WatermarkRatio)
2. [WatermarkRatio](https://doc.shengwang.cn/api-ref/rtc/rn/API/class_watermarkratio#WatermarkRatio)
3. [WatermarkRatio](https://doc.shengwang.cn/api-ref/rtc/unreal-cpp/API/class_watermarkratio#WatermarkRatio)
4. [VideoCaptureParameters > width](https://doc.shengwang.cn/api-ref/rtc/android/API/class_screenvideoparameters#width)
5. [VideoCaptureParameters > height](https://doc.shengwang.cn/api-ref/rtc/android/API/class_screenvideoparameters#height)

**FAQ**

1. [质量类 > 如何处理音视频相关问题？ > 屏幕共享带声音如何开启?](https://doc.shengwang.cn/faq/quality-issues/class-audio-video#%E5%B1%8F%E5%B9%95%E5%85%B1%E4%BA%AB%E5%B8%A6%E5%A3%B0%E9%9F%B3%E5%A6%82%E4%BD%95%E5%BC%80%E5%90%AF)
2. [质量类 > 如何处理音视频相关问题？ > 屏幕共享带声音如何开启? > Web 端](https://doc.shengwang.cn/faq/quality-issues/class-audio-video#web-%E7%AB%AF)
3. [质量类 > 如何处理音视频相关问题？ > 屏幕共享带声音如何开启? > Electron 端](https://doc.shengwang.cn/faq/quality-issues/class-audio-video#electron-%E7%AB%AF)
4. [质量类 > 如何处理音视频相关问题？ > 使用屏幕共享时报错“请先打开屏幕录制权限”?](https://doc.shengwang.cn/faq/quality-issues/class-audio-video#%E4%BD%BF%E7%94%A8%E5%B1%8F%E5%B9%95%E5%85%B1%E4%BA%AB%E6%97%B6%E6%8A%A5%E9%94%99%E8%AF%B7%E5%85%88%E6%89%93%E5%BC%80%E5%B1%8F%E5%B9%95%E5%BD%95%E5%88%B6%E6%9D%83%E9%99%90)
5. [集成类 > 如何自定义课堂 UI？ > Web 端如何更改屏幕共享背景颜色？](https://doc.shengwang.cn/faq/integration-issues/class-custom-ui#web-%E7%AB%AF%E5%A6%82%E4%BD%95%E6%9B%B4%E6%94%B9%E5%B1%8F%E5%B9%95%E5%85%B1%E4%BA%AB%E8%83%8C%E6%99%AF%E9%A2%9C%E8%89%B2)

## 23 · 发送消息

两站产品首位均为发送消息；新站合并章节。

[new](https://docs-portal-staging.sh3.agoralab.co/search?q=%E5%8F%91%E9%80%81%E6%B6%88%E6%81%AF&type=all&page=1) · [old](https://doc.shengwang.cn/search?q=%E5%8F%91%E9%80%81%E6%B6%88%E6%81%AF)

### new

**产品文档**

1. [发送消息](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtm/build/messaging/send-message)
2. [发送图片消息](https://docs-portal-staging.sh3.agoralab.co/ai/build/send-multimodal-messages)

**API 文档**

1. [发送消息 → 接口描述](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/signaling/publish#%E6%8E%A5%E5%8F%A3%E6%8F%8F%E8%BF%B0)
2. [消息](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtm/ios/message)

**FAQ**

1. [如何处理服务端 RESTful API 调用超出频率限制？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/restful_api_call_frequency)
2. [如何将指定用户移出频道？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/kick_user)
3. [直播场景下，如何监听远端观众角色用户加入/离开频道的事件？ → 实现方法](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/audience_event#%E5%AE%9E%E7%8E%B0%E6%96%B9%E6%B3%95)
4. [为什么第三方云存储中没有录制文件？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/fail_to_upload)
5. [为什么成功开启云端录制后调用 query 方法返回 404？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/return_404)

### old

**产品文档**

1. [用户指南 > 消息 > 发送消息](https://doc.shengwang.cn/doc/rtm2/android/user-guide/message/send-message)
2. [用户指南 > 消息 > 发送消息 > Message Channel 中发送消息](https://doc.shengwang.cn/doc/rtm2/android/user-guide/message/send-message#message-channel-%E4%B8%AD%E5%8F%91%E9%80%81%E6%B6%88%E6%81%AF)
3. [用户指南 > 消息 > 发送消息 > User Channel 中发送消息](https://doc.shengwang.cn/doc/rtm2/android/user-guide/message/send-message#user-channel-%E4%B8%AD%E5%8F%91%E9%80%81%E6%B6%88%E6%81%AF)
4. [用户指南 > 消息 > 发送消息 > Stream Channel 中发送消息](https://doc.shengwang.cn/doc/rtm2/android/user-guide/message/send-message#stream-channel-%E4%B8%AD%E5%8F%91%E9%80%81%E6%B6%88%E6%81%AF)
5. [快速开始 > 实现收发消息](https://doc.shengwang.cn/doc/rtm2/android/get-started/quick-start)

**API 文档**

1. [MessagesStore > sendMessage](https://doc.shengwang.cn/api-ref/flexible-classroom/javascript/classes/agora_edu_core_src_stores_domain_common_message_index_essagesStore#sendMessage)
2. [MessagesStore > sendMessage](https://doc.shengwang.cn/api-ref/flexible-classroom/electron/classes/agora_edu_core_src_stores_domain_common_message_index_essagesStore#sendMessage)
3. [AgoraWidgetController > sendMessage](https://doc.shengwang.cn/api-ref/flexible-classroom/javascript/classes/agora_edu_core_src_stores_domain_common_widget_controller_goraWidgetController#sendMessage)
4. [AgoraWidgetController > sendMessage](https://doc.shengwang.cn/api-ref/flexible-classroom/electron/classes/agora_edu_core_src_stores_domain_common_widget_controller_goraWidgetController#sendMessage)
5. [agora_rtc_api.h > agora_rtm_send_data()](https://doc.shengwang.cn/api-ref/rtsa/c/agora__rtc__api_8h#ab001eda008555d96e4e64dc9e66687bf)

**FAQ**

1. [集成类 > 如何处理 IM 相关问题？ > 课堂内发送消息失败](https://doc.shengwang.cn/faq/integration-issues/class-im#%E8%AF%BE%E5%A0%82%E5%86%85%E5%8F%91%E9%80%81%E6%B6%88%E6%81%AF%E5%A4%B1%E8%B4%A5)
2. [集成类 > 如何处理服务端 RESTful API 调用超出频率限制？](https://doc.shengwang.cn/faq/integration-issues/restful-api-call-frequency)
3. [集成类 > 如何将指定用户移出频道？](https://doc.shengwang.cn/faq/integration-issues/kick-user)
4. [质量类 > 为什么使用其他 App 后无法发送音视频？](https://doc.shengwang.cn/faq/quality-issues/device-occupied)
5. [集成类 > 如何设置镜像模式？ > 阶段 3. 本地发送视频流](https://doc.shengwang.cn/faq/integration-issues/mirror-mode#%E9%98%B6%E6%AE%B5-3-%E6%9C%AC%E5%9C%B0%E5%8F%91%E9%80%81%E8%A7%86%E9%A2%91%E6%B5%81)

## 24 · 发布消息

新站产品首位为发送消息；旧站先历史消息，第 2 条才发布步骤。

[new](https://docs-portal-staging.sh3.agoralab.co/search?q=%E5%8F%91%E5%B8%83%E6%B6%88%E6%81%AF&type=all&page=1) · [old](https://doc.shengwang.cn/search?q=%E5%8F%91%E5%B8%83%E6%B6%88%E6%81%AF)

### new

**产品文档**

1. [发送消息](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtm/build/messaging/send-message)
2. [历史消息 (Beta)](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtm/build/message-design-and-history/history-message)
3. [计量规则 → 收发消息](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtm/reference/billing/billing-rules#%E6%94%B6%E5%8F%91%E6%B6%88%E6%81%AF-1)
4. [实现秀场转 1v1 → 14. 收到挂断消息](https://docs-portal-staging.sh3.agoralab.co/solutions/one-to-one-live/custom-signaling/build/implement-core-features/showroom-to-one-to-one#14-%E6%94%B6%E5%88%B0%E6%8C%82%E6%96%AD%E6%B6%88%E6%81%AF)
5. [实现秀场转 1v1 → 15. 收到挂断消息](https://docs-portal-staging.sh3.agoralab.co/solutions/one-to-one-live/rtm/build/implement-core-features/showroom-to-one-to-one#15-%E6%94%B6%E5%88%B0%E6%8C%82%E6%96%AD%E6%B6%88%E6%81%AF)

**API 文档**

1. [消息 → 接口方法](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtm/unity/message#%E6%8E%A5%E5%8F%A3%E6%96%B9%E6%B3%95)
2. [消息 → 接口方法](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtm/ios/message#%E6%8E%A5%E5%8F%A3%E6%96%B9%E6%B3%95)
3. [消息 → 接口方法](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtm/swift/message#%E6%8E%A5%E5%8F%A3%E6%96%B9%E6%B3%95)
4. [接收历史消息 → 返回值](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/signaling/receive#%E8%BF%94%E5%9B%9E%E5%80%BC)
5. [Topic → 接口描述](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtm/ios/topic#%E6%8E%A5%E5%8F%A3%E6%8F%8F%E8%BF%B0-2)

**FAQ**

1. [如何将指定用户移出频道？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/kick_user)
2. [为什么第三方云存储中没有录制文件？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/fail_to_upload)
3. [如何处理服务端 RESTful API 调用超出频率限制？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/restful_api_call_frequency)
4. [为什么成功开启云端录制后调用 query 方法返回 404？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/return_404)
5. [为什么部分鸿蒙版本 App 锁屏或切后台音视频采集无效？ → 问题原因](https://docs-portal-staging.sh3.agoralab.co/reference/faq/quality/harmonyos_background#%E9%97%AE%E9%A2%98%E5%8E%9F%E5%9B%A0)

### old

**产品文档**

1. [用户指南 > 历史消息](https://doc.shengwang.cn/doc/rtm2/android/user-guide/message/history-message)
2. [快速开始 > 实现收发消息 > 8. 发布消息](https://doc.shengwang.cn/doc/rtm2/mini-program/get-started/quick-start#8-%E5%8F%91%E5%B8%83%E6%B6%88%E6%81%AF)
3. [快速开始 > 实现收发消息 > Stream Channel 中收发消息 > 在 Topic 中发布消息](https://doc.shengwang.cn/doc/rtm2/unity/get-started/quick-start#%E5%9C%A8-topic-%E4%B8%AD%E5%8F%91%E5%B8%83%E6%B6%88%E6%81%AF)
4. [产品介绍 > 计费说明 > 计量规则 > 消息数计量 > 收发消息](https://doc.shengwang.cn/doc/rtm2/android/overview/billing/billing-rules#%E6%94%B6%E5%8F%91%E6%B6%88%E6%81%AF)
5. [快速开始 > 实现收发消息 > Stream Channel 中收发消息 > 离开 Topic](https://doc.shengwang.cn/doc/rtm2/unity/get-started/quick-start#%E7%A6%BB%E5%BC%80-topic)

**API 文档**

1. [agora_rtc_api.h > agora_rtm_publish()](https://doc.shengwang.cn/api-ref/rtsa/c/agora__rtc__api_8h#ab3dfb2693ca2cc21a56862065a16d718)
2. [agora_rtm_handler_t > on_rtm_publish_result](https://doc.shengwang.cn/api-ref/rtsa/c/structagora__rtm__handler__t#ab4a465f3612760c6b7b74f6b79a5e6f6)
3. [IAgoraRTCClient > stream-message](https://doc.shengwang.cn/api-ref/rtc/javascript/interfaces/iagorartcclient#event_stream_message)
4. [IAgoraRTCClient > stream-message](https://doc.shengwang.cn/api-ref/rtc/react/interfaces/iagorartcclient#event_stream_message)
5. [IAgoraRTCClient > token-privilege-did-expire](https://doc.shengwang.cn/api-ref/rtc/javascript/interfaces/iagorartcclient#event_token_privilege_did_expire)

**FAQ**

1. [集成类 > 如何将指定用户移出频道？](https://doc.shengwang.cn/faq/integration-issues/kick-user)
2. [集成类 > 如何处理 IM 相关问题？ > 课堂内发送消息失败](https://doc.shengwang.cn/faq/integration-issues/class-im#%E8%AF%BE%E5%A0%82%E5%86%85%E5%8F%91%E9%80%81%E6%B6%88%E6%81%AF%E5%A4%B1%E8%B4%A5)
3. [账号与计费 > 什么是账单、结算与账户冻结？ > 账单 > 账单发布](https://doc.shengwang.cn/faq/account-and-billing/billing-account#%E8%B4%A6%E5%8D%95%E5%8F%91%E5%B8%83)
4. [账号与计费 > 什么是账单、结算与账户冻结？ > 账单 > 账单结算](https://doc.shengwang.cn/faq/account-and-billing/billing-account#%E8%B4%A6%E5%8D%95%E7%BB%93%E7%AE%97)
5. [集成类 > 如何使用连麦鉴权功能？ > 功能介绍](https://doc.shengwang.cn/faq/integration-issues/token-cohost#%E5%8A%9F%E8%83%BD%E4%BB%8B%E7%BB%8D)

## 25 · 如何开启云端录制

新站产品首位偏录制字幕，第 2 篇为快速开始且锚点为排错；API 则优于旧站。

[new](https://docs-portal-staging.sh3.agoralab.co/search?q=%E5%A6%82%E4%BD%95%E5%BC%80%E5%90%AF%E4%BA%91%E7%AB%AF%E5%BD%95%E5%88%B6&type=all&page=1) · [old](https://doc.shengwang.cn/search?q=%E5%A6%82%E4%BD%95%E5%BC%80%E5%90%AF%E4%BA%91%E7%AB%AF%E5%BD%95%E5%88%B6)

### new

**产品文档**

1. [录制字幕](https://docs-portal-staging.sh3.agoralab.co/realtime-media/speech-to-text/build/process-transcription-data/record-captions)
2. [快速开始云端录制 → 排查错误](https://docs-portal-staging.sh3.agoralab.co/realtime-media/cloud-recording/get-started/quick-start#%E6%8E%92%E6%9F%A5%E9%94%99%E8%AF%AF)
3. [实现页面录制 → 常见问题](https://docs-portal-staging.sh3.agoralab.co/realtime-media/cloud-recording/build/recording-modes/web-mode/set-webpage-recording#%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98)
4. [使用网易易盾音频审核 → 技术原理](https://docs-portal-staging.sh3.agoralab.co/realtime-media/content-moderation/build/audio-moderation-api#%E6%8A%80%E6%9C%AF%E5%8E%9F%E7%90%86)

**API 文档**

1. [获取云端录制资源](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/cloud-recording/acquire)
2. [开始云端录制](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/cloud-recording/start)
3. [查询录制列表 → data.list](https://docs-portal-staging.sh3.agoralab.co/api-reference/meeting/restful/api/query-recording#datalist)
4. [参考信息 → 媒体流输出模式设置](https://docs-portal-staging.sh3.agoralab.co/api-reference/cloud-recording/restful/api/reference#%E5%AA%92%E4%BD%93%E6%B5%81%E8%BE%93%E5%87%BA%E6%A8%A1%E5%BC%8F%E8%AE%BE%E7%BD%AE)
5. [停止云端录制](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/cloud-recording/stop)

**FAQ**

1. [为什么成功开启云端录制后调用 query 方法返回 404？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/return_404)
2. [使用云端录制功能录制 AI 对话时，如何优化音频体验？ → 启动云端录制](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/convoai_cloud_recording#%E5%90%AF%E5%8A%A8%E4%BA%91%E7%AB%AF%E5%BD%95%E5%88%B6)
3. [如何选择云存储 bucket 区域及处理跨区上传问题？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/bucket_region)
4. [为什么第三方云存储中没有录制文件？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/fail_to_upload)

### old

**产品文档**

1. [快速开始 > 使用 Go SDK 开始云端录制](https://doc.shengwang.cn/doc/cloud-recording/restful/get-started/quick-start-go)
2. [快速开始 > 使用 Java SDK 开始云端录制](https://doc.shengwang.cn/doc/cloud-recording/restful/get-started/quick-start-java)
3. [快速开始 > 使用 Node.js SDK 开始云端录制](https://doc.shengwang.cn/doc/cloud-recording/restful/get-started/quick-start-nodejs)
4. [快速开始 > 使用 Go SDK 开始云端录制 > 参考信息 > 排查错误](https://doc.shengwang.cn/doc/cloud-recording/restful/get-started/quick-start-go#%E6%8E%92%E6%9F%A5%E9%94%99%E8%AF%AF)
5. [快速开始 > 使用 Java SDK 开始云端录制 > 参考信息 > 排查错误](https://doc.shengwang.cn/doc/cloud-recording/restful/get-started/quick-start-java#%E6%8E%92%E6%9F%A5%E9%94%99%E8%AF%AF)

**API 文档**

1. [WhiteWebSdkConfiguration > dynamicConfig](https://doc.shengwang.cn/api-ref/whiteboard/javascript/interfaces/whitewebsdkconfiguration#dynamicConfig)
2. [WhiteWebSdk > deviceType](https://doc.shengwang.cn/api-ref/whiteboard/javascript/classes/whitewebsdk#devicetype)
3. [Displayer > deviceType](https://doc.shengwang.cn/api-ref/whiteboard/javascript/interfaces/displayer#devicetype)
4. [RoomContext > updateRoomProperties](https://doc.shengwang.cn/api-ref/flexible-classroom/android/API/class_roomcontext#api_updateroomproperties)
5. [UserContext > updateUserProperties](https://doc.shengwang.cn/api-ref/flexible-classroom/android/API/class_usercontext#api_updateuserproperties)

**FAQ**

1. [集成类 > 为什么成功开启云端录制后调用 query 方法返回 404？](https://doc.shengwang.cn/faq/integration-issues/return-404)
2. [集成类 > 如何开启 iOS 多任务采集？](https://doc.shengwang.cn/faq/integration-issues/multitasking)
3. [质量类 > 如何处理音视频相关问题？ > 屏幕共享带声音如何开启?](https://doc.shengwang.cn/faq/quality-issues/class-audio-video#%E5%B1%8F%E5%B9%95%E5%85%B1%E4%BA%AB%E5%B8%A6%E5%A3%B0%E9%9F%B3%E5%A6%82%E4%BD%95%E5%BC%80%E5%90%AF)
4. [质量类 > 如何处理音视频相关问题？ > 屏幕共享带声音如何开启? > Web 端](https://doc.shengwang.cn/faq/quality-issues/class-audio-video#web-%E7%AB%AF)
5. [质量类 > 如何处理音视频相关问题？ > 屏幕共享带声音如何开启? > Electron 端](https://doc.shengwang.cn/faq/quality-issues/class-audio-video#electron-%E7%AB%AF)

## 26 · Token 过期怎么办

两站产品首位均直达 Token 过期处理。

[new](https://docs-portal-staging.sh3.agoralab.co/search?q=Token%20%E8%BF%87%E6%9C%9F%E6%80%8E%E4%B9%88%E5%8A%9E&type=all&page=1) · [old](https://doc.shengwang.cn/search?q=Token%20%E8%BF%87%E6%9C%9F%E6%80%8E%E4%B9%88%E5%8A%9E)

### new

**产品文档**

1. [使用 Token 鉴权 → Token 过期处理](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/build/setup-and-access/token-authentication#token-%E8%BF%87%E6%9C%9F%E5%A4%84%E7%90%86)
2. [使用 Token 鉴权 → Token 过期处理](https://docs-portal-staging.sh3.agoralab.co/realtime-media/local-server-recording/build/recording-preparation/generate-token#token-%E8%BF%87%E6%9C%9F%E5%A4%84%E7%90%86)
3. [发版说明 → Token 过期回调](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtsa/reference/release-notes#token-%E8%BF%87%E6%9C%9F%E5%9B%9E%E8%B0%83)
4. [客户端鉴权 → RTM Token 过期](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtm/build/authentication-and-connection/user-authentication#rtm-token-%E8%BF%87%E6%9C%9F)
5. [进阶集成指引 → 更新过期 Token](https://docs-portal-staging.sh3.agoralab.co/solutions/one-to-one-live/custom-signaling/build/customize-and-extend/integration-guideline#%E6%9B%B4%E6%96%B0%E8%BF%87%E6%9C%9F-token)

**API 文档**

1. [Interface IAgoraRTCClient → token-privilege-will-expire](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/react-sdk/web-sdk/interfaces/iagorartcclient#token-privilege-will-expire)
2. [Interface IAgoraRTCClient → token-privilege-will-expire](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/web/interfaces/iagorartcclient#token-privilege-will-expire)
3. [Enumeration ChannelMediaRelayError → DEST_TOKEN_EXPIRED](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/react-sdk/web-sdk/enums/channelmediarelayerror#dest_token_expired)

**FAQ**

1. [如何处理 Token 相关错误码？ → Token 过期相关事件回调](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/token_related_issues#token-%E8%BF%87%E6%9C%9F%E7%9B%B8%E5%85%B3%E4%BA%8B%E4%BB%B6%E5%9B%9E%E8%B0%83)
2. [如何处理 JavaScript SDK 常见集成问题？ → 如何处理 Token 过期？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/rtm2_integration_issue#%E5%A6%82%E4%BD%95%E5%A4%84%E7%90%86-token-%E8%BF%87%E6%9C%9F)
3. [为什么第三方云存储中没有录制文件？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/fail_to_upload)
4. [如何使用连麦鉴权功能？ → 升级注意事项](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/token_cohost#%E5%8D%87%E7%BA%A7%E6%B3%A8%E6%84%8F%E4%BA%8B%E9%A1%B9)

### old

**产品文档**

1. [基础功能 > 使用 Token 鉴权 > 实现 Token 鉴权 > Token 过期处理](https://doc.shengwang.cn/doc/rtc/android/basic-features/token-authentication#token-%E8%BF%87%E6%9C%9F%E5%A4%84%E7%90%86)
2. [基础功能 > 使用 Token 鉴权 > 进阶功能 > Token 过期处理](https://doc.shengwang.cn/doc/rtc/javascript/basic-features/token-authentication#token-%E8%BF%87%E6%9C%9F%E5%A4%84%E7%90%86)
3. [快速开始 > 使用 Token 鉴权 > 实现加入频道鉴权 > Token 过期处理](https://doc.shengwang.cn/doc/rtc/mini-program/basic-features/token-authentication#token-%E8%BF%87%E6%9C%9F%E5%A4%84%E7%90%86)
4. [功能指南 > 使用 Token 鉴权 > 实现 Token 鉴权 > Token 过期处理](https://doc.shengwang.cn/doc/recording/cpp/user-guides/generate-token#token-%E8%BF%87%E6%9C%9F%E5%A4%84%E7%90%86)
5. [用户指南 > 用户鉴权 > 客户端鉴权 > 开发注意事项 > RTM Token 过期](https://doc.shengwang.cn/doc/rtm2/android/user-guide/token/user-authentication#rtm-token-%E8%BF%87%E6%9C%9F)

**API 文档**

1. [IAgoraRTCClient > token-privilege-will-expire](https://doc.shengwang.cn/api-ref/rtc/javascript/interfaces/iagorartcclient#event_token_privilege_will_expire)
2. [IAgoraRTCClient > token-privilege-will-expire](https://doc.shengwang.cn/api-ref/rtc/react/interfaces/iagorartcclient#event_token_privilege_will_expire)
3. [IAgoraRTCClient > token-privilege-did-expire](https://doc.shengwang.cn/api-ref/rtc/javascript/interfaces/iagorartcclient#event_token_privilege_did_expire)
4. [IAgoraRTCClient > token-privilege-did-expire](https://doc.shengwang.cn/api-ref/rtc/react/interfaces/iagorartcclient#event_token_privilege_did_expire)
5. [IRtcEngineEventHandler > onRequestToken](https://doc.shengwang.cn/api-ref/rtc/android/API/toc_channel#callback_irtcengineeventhandler_onrequesttoken)

**FAQ**

1. [集成类 > 如何处理 JavaScript SDK 常见集成问题？ > 如何处理 Token 过期？](https://doc.shengwang.cn/faq/integration-issues/rtm2-integration-issue#%E5%A6%82%E4%BD%95%E5%A4%84%E7%90%86-token-%E8%BF%87%E6%9C%9F)
2. [集成类 > 如何处理 Token 相关错误码？ > Token 过期相关事件回调](https://doc.shengwang.cn/faq/integration-issues/token-error#token-%E8%BF%87%E6%9C%9F%E7%9B%B8%E5%85%B3%E4%BA%8B%E4%BB%B6%E5%9B%9E%E8%B0%83)
3. [集成类 > 如何处理 Token 相关错误码？ > 109：Token 已过期](https://doc.shengwang.cn/faq/integration-issues/token-error#109token-%E5%B7%B2%E8%BF%87%E6%9C%9F)
4. [集成类 > 为什么第三方云存储中没有录制文件？](https://doc.shengwang.cn/faq/integration-issues/fail-to-upload)
5. [集成类 > 如何使用连麦鉴权功能？ > 升级注意事项](https://doc.shengwang.cn/faq/integration-issues/token-cohost#%E5%8D%87%E7%BA%A7%E6%B3%A8%E6%84%8F%E4%BA%8B%E9%A1%B9)

## 27 · 听不到声音

两站均召回排障；新站 FAQ 首位为无声问题，旧站首批先课堂场景。

[new](https://docs-portal-staging.sh3.agoralab.co/search?q=%E5%90%AC%E4%B8%8D%E5%88%B0%E5%A3%B0%E9%9F%B3&type=all&page=1) · [old](https://doc.shengwang.cn/search?q=%E5%90%AC%E4%B8%8D%E5%88%B0%E5%A3%B0%E9%9F%B3)

### new

**产品文档**

1. [处理浏览器的自动播放策略](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/build/optimize-and-operate/autoplay)
2. [通话前检测 → 检测异常处理建议](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/build/optimize-and-operate/lastmile-quality#%E6%A3%80%E6%B5%8B%E5%BC%82%E5%B8%B8%E5%A4%84%E7%90%86%E5%BB%BA%E8%AE%AE)
3. [发版说明 → 问题修复](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/reference/release-notes#%E9%97%AE%E9%A2%98%E4%BF%AE%E5%A4%8D-18)
4. [空间音频 → 社交语聊](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/build/audio/spatial-audio#%E7%A4%BE%E4%BA%A4%E8%AF%AD%E8%81%8A)
5. [使用 SDK 实现空间音频 → 社交语聊](https://docs-portal-staging.sh3.agoralab.co/solutions/game-voice/build/spatial-audio-sdk#%E7%A4%BE%E4%BA%A4%E8%AF%AD%E8%81%8A)

**API 文档**

1. [人声音效 → 参数](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/unity/audio/audio-prenpost/audio-effect#%E5%8F%82%E6%95%B0-6)
2. [人声音效 → 参数](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/flutter/audio/audio-prenpost/audio-effect#%E5%8F%82%E6%95%B0-6)
3. [人声音效 → 参数](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/electron/audio/audio-prenpost/audio-effect#%E5%8F%82%E6%95%B0-6)
4. [人声音效 → 参数](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/react-native/audio/audio-prenpost/audio-effect#%E5%8F%82%E6%95%B0-6)
5. [人声音效 → 参数](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/csharp-windows/audio/audio-prenpost/audio-effect#%E5%8F%82%E6%95%B0-5)

**FAQ**

1. [如何处理无声问题？ → 定位问题类型](https://docs-portal-staging.sh3.agoralab.co/reference/faq/quality/audio_noaudio#%E5%AE%9A%E4%BD%8D%E9%97%AE%E9%A2%98%E7%B1%BB%E5%9E%8B)
2. [声动语聊常见问题合集 → 不听说话者声音](https://docs-portal-staging.sh3.agoralab.co/reference/faq/other/chatroom#%E4%B8%8D%E5%90%AC%E8%AF%B4%E8%AF%9D%E8%80%85%E5%A3%B0%E9%9F%B3)

### old

**产品文档**

1. [基础功能 > 通话前检测 > 参考信息 > 检测异常处理建议](https://doc.shengwang.cn/doc/rtc/android/basic-features/lastmile-quality#%E6%A3%80%E6%B5%8B%E5%BC%82%E5%B8%B8%E5%A4%84%E7%90%86%E5%BB%BA%E8%AE%AE)
2. [最佳实践 > 处理浏览器的自动播放策略](https://doc.shengwang.cn/doc/rtc/javascript/best-practice/autoplay)
3. [产品介绍 > 发版说明 > v4.3.2](https://doc.shengwang.cn/doc/rtc/android/overview/release-notes#v4.3.2)
4. [实时音视频（RTC） > 通话调查 > 名词解释 > 诊断项 > 通话体验诊断](https://doc.shengwang.cn/doc/analytics/general/rtc/call-search/concept#%E9%80%9A%E8%AF%9D%E4%BD%93%E9%AA%8C%E8%AF%8A%E6%96%AD)
5. [产品介绍 > 浏览器兼容性和已知问题 > 桌面端 > 已知问题和限制](https://doc.shengwang.cn/doc/rtc/javascript/overview/browser-compatibility#%E5%B7%B2%E7%9F%A5%E9%97%AE%E9%A2%98%E5%92%8C%E9%99%90%E5%88%B6)

**API 文档**

1. [ILocalSpatialAudioEngine > ClearRemotePositions](https://doc.shengwang.cn/api-ref/rtc/unity/API/toc_spatial_audio#api_ilocalspatialaudioengine_clearremotepositions)
2. [ILocalSpatialAudioEngine > RemoveRemotePosition](https://doc.shengwang.cn/api-ref/rtc/unity/API/toc_spatial_audio#api_ilocalspatialaudioengine_removeremoteposition)
3. [LocalSpatialAudioEngine > clearRemotePositions](https://doc.shengwang.cn/api-ref/rtc/flutter/API/toc_spatial_audio#api_ilocalspatialaudioengine_clearremotepositions)
4. [LocalSpatialAudioEngine > removeRemotePosition](https://doc.shengwang.cn/api-ref/rtc/flutter/API/toc_spatial_audio#api_ilocalspatialaudioengine_removeremoteposition)
5. [ILocalSpatialAudioEngine > clearRemotePositions](https://doc.shengwang.cn/api-ref/rtc/electron/API/toc_spatial_audio#api_ilocalspatialaudioengine_clearremotepositions)

**FAQ**

1. [质量类 > 如何处理音视频相关问题？ > 学生听不到老师声音怎么办？](https://doc.shengwang.cn/faq/quality-issues/class-audio-video#%E5%AD%A6%E7%94%9F%E5%90%AC%E4%B8%8D%E5%88%B0%E8%80%81%E5%B8%88%E5%A3%B0%E9%9F%B3%E6%80%8E%E4%B9%88%E5%8A%9E)
2. [质量类 > 如何处理音视频相关问题？ > 老师听不到学生声音怎么办？](https://doc.shengwang.cn/faq/quality-issues/class-audio-video#%E8%80%81%E5%B8%88%E5%90%AC%E4%B8%8D%E5%88%B0%E5%AD%A6%E7%94%9F%E5%A3%B0%E9%9F%B3%E6%80%8E%E4%B9%88%E5%8A%9E)
3. [质量类 > 如何处理无声问题？ > 解决方案 > 定位问题类型](https://doc.shengwang.cn/faq/quality-issues/no-audio#%E5%AE%9A%E4%BD%8D%E9%97%AE%E9%A2%98%E7%B1%BB%E5%9E%8B)
4. [集成类 > 如何处理常见的 Web 浏览器控制台报错？ > Connect choose server timeout](https://doc.shengwang.cn/faq/integration-issues/console-error#connect-choose-server-timeout)
5. [集成类 > 如何处理常见的 Web 浏览器控制台报错？ > NO_CANDIDATES_IN_OFFER](https://doc.shengwang.cn/faq/integration-issues/console-error#no_candidates_in_offer)

## 28 · 110

数字含义多，不能据首位判错；两站 FAQ 首位均为 110 Token 无效。

[new](https://docs-portal-staging.sh3.agoralab.co/search?q=110&type=all&page=1) · [old](https://doc.shengwang.cn/search?q=110)

### new

**产品文档**

1. [事件类型 → 110 agent error](https://docs-portal-staging.sh3.agoralab.co/ai/reference/event-types#110-agent-error)
2. [发版说明 → 问题修复](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/reference/release-notes#%E9%97%AE%E9%A2%98%E4%BF%AE%E5%A4%8D-10)
3. [发版说明 → 新增错误码](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtm/reference/release-notes#%E6%96%B0%E5%A2%9E%E9%94%99%E8%AF%AF%E7%A0%81)
4. [API 使用限制 → 4.3 消息规格](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtm/reference/usage-limits-and-errors/api-limits#43-%E6%B6%88%E6%81%AF%E8%A7%84%E6%A0%BC)
5. [录制模块事件 → 41 recorder_leave](https://docs-portal-staging.sh3.agoralab.co/realtime-media/cloud-recording/build/implement-core-features/status#41-recorder_leave)

**API 文档**

1. [事件类型 → 110 cloud_transcoder_started](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/cloud-transcoding/ncs-events#110-cloud_transcoder_started)
2. [频道相关 → 返回值](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/android/channel#%E8%BF%94%E5%9B%9E%E5%80%BC-17)
3. [频道相关 → 返回值](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/ios/channel#%E8%BF%94%E5%9B%9E%E5%80%BC-17)
4. [频道相关 → 返回值](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/macos/channel#%E8%BF%94%E5%9B%9E%E5%80%BC-17)
5. [频道相关 → 返回值](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/unity/channel#%E8%BF%94%E5%9B%9E%E5%80%BC-14)

**FAQ**

1. [如何处理 Token 相关错误码？ → 110：Token 无效](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/token_related_issues#110token-%E6%97%A0%E6%95%88)
2. [如何处理同时集成多个声网 SDK 时遇到的库冲突问题？ → 集成 Lite SDK（适用于 RTM）](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/rtm2_rtc_integration_issue#%E9%9B%86%E6%88%90-lite-sdk%E9%80%82%E7%94%A8%E4%BA%8E-rtm)
3. [录制生成的文件支持哪些播放器？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/recording_player)

### old

**产品文档**

1. [Webhook 回调事件 > 事件类型 > 110 cloud_transcoder_started](https://doc.shengwang.cn/doc/cloud-transcoder/restful/webhook/ncs-events#110-cloud_transcoder_started)
2. [Webhook 回调事件 > 事件类型 > 事件类型 > 110 agent error](https://doc.shengwang.cn/doc/convoai/restful/webhook/ncs-events#110-agent-error)
3. [服务端 API > 事件同步 > 事件枚举 > 奖励数量变更](https://doc.shengwang.cn/doc/flexible-classroom/restful/api/api-sync#%E5%A5%96%E5%8A%B1%E6%95%B0%E9%87%8F%E5%8F%98%E6%9B%B4)
4. [用户指南 > 初始配置 > API 使用限制 > 4. 客户端级限制 > 4.3 消息规格](https://doc.shengwang.cn/doc/rtm2/android/user-guide/setup/api-limits#43-%E6%B6%88%E6%81%AF%E8%A7%84%E6%A0%BC)
5. [Webhook 回调事件 > 事件回调概览 > 回调事件概览](https://doc.shengwang.cn/doc/cloud-recording/restful/webhook/ncs-events#%E5%9B%9E%E8%B0%83%E4%BA%8B%E4%BB%B6%E6%A6%82%E8%A7%88)

**API 文档**

1. [LEAVE_PATH_CODE](https://doc.shengwang.cn/api-ref/recording/cpp/namespaceagora_1_1linuxsdk#a9bed76add2c986c154d0ab761a7a07ac)
2. [本地服务端录制](https://doc.shengwang.cn/api-ref/recording/java/enumio_1_1agora_1_1recording_1_1common_1_1_common_1_1_l_e_a_v_e___p_a_t_h___c_o_d_e#af81831ccda53ea94beb9be2ab5118c0e)
3. [IRtcEngineEventHandler > OnError](https://doc.shengwang.cn/api-ref/rtc/unreal-blueprint/API/toc_channel#callback_irtcengineeventhandler_onerror)
4. [com.herewhite.sdk.Displayer class > disableCameraTransform()](https://doc.shengwang.cn/api-ref/whiteboard/android/classcom_1_1herewhite_1_1sdk_1_1_displayer#a4b4ee486693efafc4683e312244d1129)
5. [com.herewhite.sdk.WhiteSdk class > isPlayable()](https://doc.shengwang.cn/api-ref/whiteboard/android/classcom_1_1herewhite_1_1sdk_1_1_white_sdk#a76a9f524257626f12bc0f6f0ddd4f3a6)

**FAQ**

1. [集成类 > 如何处理 Token 相关错误码？ > 110：Token 无效](https://doc.shengwang.cn/faq/integration-issues/token-error#110token-%E6%97%A0%E6%95%88)
2. [集成类 > 录制生成的文件支持哪些播放器？](https://doc.shengwang.cn/faq/integration-issues/recording-player)
3. [集成类 > 如何处理同时集成多个声网 SDK 时遇到的库冲突问题？ > 解决方案 > 使用包管理工具集成 SDK](https://doc.shengwang.cn/faq/integration-issues/rtm2-rtc-integration-issue#%E4%BD%BF%E7%94%A8%E5%8C%85%E7%AE%A1%E7%90%86%E5%B7%A5%E5%85%B7%E9%9B%86%E6%88%90-sdk)

## 29 · ERR_INVALID_TOKEN

两站错误码文档/FAQ 命中；新站 API 结果更少无关转码字段。

[new](https://docs-portal-staging.sh3.agoralab.co/search?q=ERR_INVALID_TOKEN&type=all&page=1) · [old](https://doc.shengwang.cn/search?q=ERR_INVALID_TOKEN)

### new

**产品文档**

1. [错误码 → 传输相关](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtsa/reference/error-codes#%E4%BC%A0%E8%BE%93%E7%9B%B8%E5%85%B3)
2. [发版说明 → 修改](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/reference/release-notes#%E4%BF%AE%E6%94%B9)
3. [实现媒体流和信令传输 → 2.1 监听事件](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtsa/build/media-and-signaling-transmission/implement-transmission#21-%E7%9B%91%E5%90%AC%E4%BA%8B%E4%BB%B6)

**API 文档**

1. [agora_rtc_api.h 文件参考 → rtm_err_code_e](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtsa/c/agora-rtc-api-8h#rtm_err_code_e)
2. [API 概览 → ExpiresInHours() / ExpiresInMinutes()](https://docs-portal-staging.sh3.agoralab.co/api-reference/conversational-ai/agent-go#expiresinhours--expiresinminutes)
3. [枚举类 → 枚举值](https://docs-portal-staging.sh3.agoralab.co/api-reference/local-server-recording/cpp/enum#%E6%9E%9A%E4%B8%BE%E5%80%BC-1)
4. [枚举类 → 枚举值](https://docs-portal-staging.sh3.agoralab.co/api-reference/local-server-recording/java/enum#%E6%9E%9A%E4%B8%BE%E5%80%BC-4)

**FAQ**

1. [如何处理 Token 相关错误码？ → 110：Token 无效](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/token_related_issues#110token-%E6%97%A0%E6%95%88)
2. [为什么使用其他 App 后无法发送音视频？ → Android 设备使用第三方录音 App 时出现异常](https://docs-portal-staging.sh3.agoralab.co/reference/faq/quality/device_occupied#android-%E8%AE%BE%E5%A4%87%E4%BD%BF%E7%94%A8%E7%AC%AC%E4%B8%89%E6%96%B9%E5%BD%95%E9%9F%B3-app-%E6%97%B6%E5%87%BA%E7%8E%B0%E5%BC%82%E5%B8%B8)

### old

**产品文档**

1. [错误码 > 传输相关](https://doc.shengwang.cn/doc/rtsa/c/error-codes#%E4%BC%A0%E8%BE%93%E7%9B%B8%E5%85%B3)
2. [快速开始 > 实现媒体流和信令传输 > 实现流程 > 2. 传输媒体流](https://doc.shengwang.cn/doc/rtsa/c/get-started/implement-transmission#2-%E4%BC%A0%E8%BE%93%E5%AA%92%E4%BD%93%E6%B5%81)
3. [产品介绍 > 发版说明 > 1.9.4 版](https://doc.shengwang.cn/doc/rtsa/c/overview/release-notes#1.9.4%20%E7%89%88)
4. [产品介绍 > 发版说明 > v4.3.0](https://doc.shengwang.cn/doc/rtc/android/overview/release-notes#v4.3.0)
5. [产品介绍 > 发版说明](https://doc.shengwang.cn/doc/rtc/windows/overview/release-notes)

**API 文档**

1. [IRtcEngineEventHandler > OnError](https://doc.shengwang.cn/api-ref/rtc/unreal-blueprint/API/toc_channel#callback_irtcengineeventhandler_onerror)
2. [IRtcEngineEventHandler > onConnectionStateChanged](https://doc.shengwang.cn/api-ref/rtc/android/API/toc_network#callback_irtcengineeventhandler_onconnectionstatechanged)
3. [TranscodingUser > zOrder](https://doc.shengwang.cn/api-ref/rtc/android/API/class_transcodinguser#zOrder)
4. [TranscodingUser > zOrder](https://doc.shengwang.cn/api-ref/rtc/windows/API/class_transcodinguser#zOrder)
5. [TranscodingUser > zOrder](https://doc.shengwang.cn/api-ref/rtc/unity/API/class_transcodinguser#zOrder)

**FAQ**

1. [集成类 > 如何处理 Token 相关错误码？ > 110：Token 无效](https://doc.shengwang.cn/faq/integration-issues/token-error#110token-%E6%97%A0%E6%95%88)
2. [集成类 > 如何处理 Token 相关错误码？ > 101：App ID 无效](https://doc.shengwang.cn/faq/integration-issues/token-error#101app-id-%E6%97%A0%E6%95%88)
3. [集成类 > 如何处理 Token 相关错误码？ > 109：Token 已过期](https://doc.shengwang.cn/faq/integration-issues/token-error#109token-%E5%B7%B2%E8%BF%87%E6%9C%9F)
4. [质量类 > 为什么使用其他 App 后无法发送音视频？ > Android 设备使用第三方录音 App 时出现异常](https://doc.shengwang.cn/faq/quality-issues/device-occupied#android-%E8%AE%BE%E5%A4%87%E4%BD%BF%E7%94%A8%E7%AC%AC%E4%B8%89%E6%96%B9%E5%BD%95%E9%9F%B3-app-%E6%97%B6%E5%87%BA%E7%8E%B0%E5%BC%82%E5%B8%B8)
5. [集成类 > 如何生成同时具备 RTC 和 RTM 权限的 Token？](https://doc.shengwang.cn/faq/integration-issues/generate-token)

## 30 · RTC

两站产品首位均为 RTC 服务端 SDK；缩写意图不唯一。

[new](https://docs-portal-staging.sh3.agoralab.co/search?q=RTC&type=all&page=1) · [old](https://doc.shengwang.cn/search?q=RTC)

### new

**产品文档**

1. [RTC 服务端 SDK 概览](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc-server-sdk)
2. [RTC SDK API 示例](https://docs-portal-staging.sh3.agoralab.co/reference/demo/rtc-sdk-api-example)
3. [与 RTC SDK 互通音视频数据](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtsa/build/rtc-interoperability/interoperate-rtc)
4. [实时互动 RTC 概览 → RTC 是什么？](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc#rtc-%E6%98%AF%E4%BB%80%E4%B9%88)
5. [进阶集成指引 → RTC Token](https://docs-portal-staging.sh3.agoralab.co/solutions/one-to-one-live/custom-signaling/build/customize-and-extend/integration-guideline#rtc-token)

**API 文档**

1. [rtc_channel_options_t结构体 参考](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtsa/c/structrtc-channel-options-t)
2. [rtc_service_option_t结构体 参考](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtsa/c/structrtc-service-option-t)
3. [RTC 服务端 SDK 通用错误码](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc-server-sdk/error-code)
4. [RtcConnection 类](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc-server-sdk/go-api/rtcconnection.go)
5. [RtcConnectionObserver 类](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc-server-sdk/go-api/rtcconnectionobserver.go)

**FAQ**

1. [RTC SDK 支持播放哪些格式的音频文件？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/product/audio_format)
2. [RTC SDK 最多支持多少人同时在线？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/product/capacity)
3. [如何处理 RTC 小程序 SDK 常见问题？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/mini_program)
4. [如何生成同时具备 RTC 和 RTM 权限的 Token？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/rtc_rtm_token)
5. [套餐包常见问题合集 → RTC 套餐包如何按时长收费？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/account/billing_package#rtc-%E5%A5%97%E9%A4%90%E5%8C%85%E5%A6%82%E4%BD%95%E6%8C%89%E6%97%B6%E9%95%BF%E6%94%B6%E8%B4%B9)

### old

**产品文档**

1. [产品 > RTC 服务端 SDK](https://doc.shengwang.cn/doc/rtc-server-sdk/cpp/landing-page)
2. [实时音视频（RTC） > 通话调查 > 流程总览](https://doc.shengwang.cn/doc/analytics/general/rtc/call-search/overview)
3. [实时音视频（RTC） > 通话调查 > 查看通话详情](https://doc.shengwang.cn/doc/analytics/general/rtc/call-search/call-detail)
4. [实时音视频（RTC） > 通话调查 > 案例：常见问题排查](https://doc.shengwang.cn/doc/analytics/general/rtc/call-search/troubleshooting)
5. [实时音视频（RTC） > 通话调查 > 名词解释](https://doc.shengwang.cn/doc/analytics/general/rtc/call-search/concept)

**API 文档**

1. [RtcEngine > adjustPlaybackSignalVolume](https://doc.shengwang.cn/api-ref/rtc/android/API/toc_audio_basic#api_irtcengine_adjustplaybacksignalvolume)
2. [RtcEngine > adjustUserPlaybackSignalVolume](https://doc.shengwang.cn/api-ref/rtc/android/API/toc_audio_basic#api_irtcengine_adjustuserplaybacksignalvolume)
3. [RtcEngineEx > adjustUserPlaybackSignalVolumeEx](https://doc.shengwang.cn/api-ref/rtc/android/API/toc_audio_basic#api_irtcengineex_adjustuserplaybacksignalvolumeex)
4. [RtcEngine > disableAudio](https://doc.shengwang.cn/api-ref/rtc/android/API/toc_audio_basic#api_irtcengine_disableaudio)
5. [RtcEngine > enableAudio](https://doc.shengwang.cn/api-ref/rtc/android/API/toc_audio_basic#api_irtcengine_enableaudio)

**FAQ**

1. [产品咨询类 > RTC SDK 支持播放哪些格式的音频文件？](https://doc.shengwang.cn/faq/general-product-inquiry/audio-format)
2. [产品咨询类 > RTC SDK 最多支持多少人同时在线？](https://doc.shengwang.cn/faq/general-product-inquiry/capacity)
3. [其他问题 > 使用 RTC SDK 开发的 iOS App 如何增加隐私清单？](https://doc.shengwang.cn/faq/other-issues/privacyinfo)
4. [集成类 > 如何生成同时具备 RTC 和 RTM 权限的 Token？](https://doc.shengwang.cn/faq/integration-issues/generate-token)
5. [集成类 > 如何处理 RTC 小程序 SDK 常见问题？](https://doc.shengwang.cn/faq/integration-issues/mini-program)

## 31 · SDK

两站结果宽泛，不据此判输赢。

[new](https://docs-portal-staging.sh3.agoralab.co/search?q=SDK&type=all&page=1) · [old](https://doc.shengwang.cn/search?q=SDK)

### new

**产品文档**

1. [SDK 升级后的 API 设置](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/reference/after-migrate)
2. [Fastboard SDK 概览](https://docs-portal-staging.sh3.agoralab.co/realtime-media/whiteboard/fastboard-sdk)
3. [使用 SDK 实现空间音频](https://docs-portal-staging.sh3.agoralab.co/solutions/game-voice/build/spatial-audio-sdk)
4. [Fastboard SDK 合规使用说明](https://docs-portal-staging.sh3.agoralab.co/introduction/security/sdk-compliance/fastboard-sdk)
5. [视频 SDK 合规使用说明](https://docs-portal-staging.sh3.agoralab.co/introduction/security/sdk-compliance/video-sdk)

**API 文档**

1. [Lite SDK API 列表](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/android/rtc-lite-api)
2. [Lite SDK API 列表](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/ios/rtc-lite-api)
3. [生成 SDK Token](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/whiteboard/restful/generate-sdk-token)
4. [生成 SDK Token](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/ppt-conversion-service/generate-sdk-token)
5. [Agora Web SDK API Reference](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/react-sdk/web-sdk/overview)

**FAQ**

1. [为什么 SDK 中使用的是动态库而不是静态库？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/dynamic_or_static_library)
2. [RTC SDK 支持播放哪些格式的音频文件？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/product/audio_format)
3. [RTC SDK 最多支持多少人同时在线？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/product/capacity)
4. [如何处理同时集成多个声网 SDK 时遇到的库冲突问题？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/rtm2_rtc_integration_issue)
5. [如何处理 RTC 小程序 SDK 常见问题？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/mini_program)

### old

**产品文档**

1. [产品 > RTC 服务端 SDK](https://doc.shengwang.cn/doc/rtc-server-sdk/cpp/landing-page)
2. [最佳实践 > SDK 升级后的 API 设置](https://doc.shengwang.cn/doc/rtc/android/best-practice/after-migrate)
3. [功能指南 > 使用 SDK 实现空间音频](https://doc.shengwang.cn/doc/game-voice/unity/user-guides/spatial-audio-sdk)
4. [功能指南 > 使用 SDK 实现空间音频](https://doc.shengwang.cn/doc/game-voice/unreal-cpp/user-guides/spatial-audio-sdk)

**API 文档**

1. [SDKBuildInfo](https://doc.shengwang.cn/api-ref/rtc/flutter/API/class_sdkbuildinfo#SDKBuildInfo)
2. [SDKBuildInfo > build](https://doc.shengwang.cn/api-ref/rtc/flutter/API/class_sdkbuildinfo#build)
3. [SDKBuildInfo > version](https://doc.shengwang.cn/api-ref/rtc/flutter/API/class_sdkbuildinfo#version)
4. [SDKBuildInfo](https://doc.shengwang.cn/api-ref/rtc/electron/API/class_sdkbuildinfo#SDKBuildInfo)
5. [SDKBuildInfo > build](https://doc.shengwang.cn/api-ref/rtc/electron/API/class_sdkbuildinfo#build)

**FAQ**

1. [产品咨询类 > RTC SDK 支持播放哪些格式的音频文件？](https://doc.shengwang.cn/faq/general-product-inquiry/audio-format)
2. [产品咨询类 > RTC SDK 最多支持多少人同时在线？](https://doc.shengwang.cn/faq/general-product-inquiry/capacity)
3. [集成类 > 为什么 SDK 中使用的是动态库而不是静态库？](https://doc.shengwang.cn/faq/integration-issues/dynamic-or-static-library)
4. [其他问题 > 使用 RTC SDK 开发的 iOS App 如何增加隐私清单？](https://doc.shengwang.cn/faq/other-issues/privacyinfo)
5. [其他问题 > 使用 RTM SDK 开发的 iOS App 如何增加隐私清单？](https://doc.shengwang.cn/faq/other-issues/privacyinfortm)

## 32 · API

两站结果宽泛，不据此判输赢。

[new](https://docs-portal-staging.sh3.agoralab.co/search?q=API&type=all&page=1) · [old](https://doc.shengwang.cn/search?q=API)

### new

**产品文档**

1. [API 使用限制](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtm/reference/usage-limits-and-errors/api-limits)
2. [API 调用限制](https://docs-portal-staging.sh3.agoralab.co/realtime-media/usage-analytics/reference/api-limits)
3. [调用 API 录制](https://docs-portal-staging.sh3.agoralab.co/realtime-media/local-server-recording/build/legacy/record-by-api)
4. [扩展 API 与配置](https://docs-portal-staging.sh3.agoralab.co/realtime-media/whiteboard/fastboard-sdk/build/extend-whiteboard/api-extension)
5. [新版 API 与多窗口课件控制](https://docs-portal-staging.sh3.agoralab.co/realtime-media/whiteboard/whiteboard-sdk/build/extend-whiteboard/native-api-extension)

**API 文档**

1. [服务端 API](https://docs-portal-staging.sh3.agoralab.co/api-reference/online-ktv/ios/ktv-scenario/api/music-content-center)
2. [服务端 API](https://docs-portal-staging.sh3.agoralab.co/api-reference/online-ktv/ios/online-ktv-sdk/api/music-content-center)
3. [服务端 API](https://docs-portal-staging.sh3.agoralab.co/api-reference/online-ktv/android/ktv-scenario/api/music-content-center)
4. [服务端 API](https://docs-portal-staging.sh3.agoralab.co/api-reference/online-ktv/android/online-ktv-sdk/api/music-content-center)
5. [Lite SDK API 列表](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/android/rtc-lite-api)

**FAQ**

1. [如何处理服务端 RESTful API 调用超出频率限制？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/restful_api_call_frequency)
2. [为什么无法通过浏览器调用云端录制 RESTful API？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/product/call_api_in_browser)
3. [如何设置镜像模式？ → API 参考](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/mirror_mode#api-%E5%8F%82%E8%80%83)
4. [如何使用 String 型用户 ID？ → API 参考](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/string_uid#api-%E5%8F%82%E8%80%83)
5. [如何调查首帧出图时间较长的问题？ → API 参考](https://docs-portal-staging.sh3.agoralab.co/reference/faq/quality/optimize_video_rendering#api-%E5%8F%82%E8%80%83)

### old

**产品文档**

1. [API 参考](https://doc.shengwang.cn/doc/smart-watch/iot/api/api-overview)
2. [API 参考](https://doc.shengwang.cn/doc/smart-camera/iot/api/api-overview)
3. [服务端 API > 房间相关](https://doc.shengwang.cn/doc/flexible-classroom/restful/api/api-classroom)
4. [服务端 API > 用户相关](https://doc.shengwang.cn/doc/flexible-classroom/restful/api/api-user)
5. [服务端 API > 录制相关](https://doc.shengwang.cn/doc/flexible-classroom/restful/api/api-recording)

**API 文档**

1. [ApiBase > constructor](https://doc.shengwang.cn/api-ref/flexible-classroom/javascript/classes/agora_rte_sdk_src_core_services_base_piBase#constructor)
2. [ApiBase > fetch](https://doc.shengwang.cn/api-ref/flexible-classroom/javascript/classes/agora_rte_sdk_src_core_services_base_piBase#fetch)
3. [ApiBase > fallbackRequestHandler](https://doc.shengwang.cn/api-ref/flexible-classroom/javascript/classes/agora_rte_sdk_src_core_services_base_piBase#fallbackRequestHandler)
4. [ApiBase > headers](https://doc.shengwang.cn/api-ref/flexible-classroom/javascript/classes/agora_rte_sdk_src_core_services_base_piBase#headers)
5. [ApiBase > host](https://doc.shengwang.cn/api-ref/flexible-classroom/javascript/classes/agora_rte_sdk_src_core_services_base_piBase#host)

**FAQ**

1. [集成类 > 如何处理服务端 RESTful API 调用超出频率限制？](https://doc.shengwang.cn/faq/integration-issues/restful-api-call-frequency)
2. [集成类 > 配置时报错“请先获取 RESTful API ID 和密钥”怎么办？](https://doc.shengwang.cn/faq/integration-issues/class-restapi)
3. [集成类 > 为什么无法通过浏览器调用云端录制 RESTful API？](https://doc.shengwang.cn/faq/integration-issues/call-browser)
4. [集成类 > 如何在 Android 设备上跨平台调用 C++ API？](https://doc.shengwang.cn/faq/integration-issues/java-call-cpp)
5. [集成类 > 如何设置镜像模式？ > API 参考](https://doc.shengwang.cn/faq/integration-issues/mirror-mode#api-%E5%8F%82%E8%80%83)

## 33 · screen sharing

两站产品第 2 条/篇均能找到屏幕共享，首位都不是该教程。

[new](https://docs-portal-staging.sh3.agoralab.co/search?q=screen%20sharing&type=all&page=1) · [old](https://doc.shengwang.cn/search?q=screen%20sharing)

### new

**产品文档**

1. [减小 App 体积 → Gradle 自动集成时删除插件](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/build/optimize-and-operate/reduce-app-size#gradle-%E8%87%AA%E5%8A%A8%E9%9B%86%E6%88%90%E6%97%B6%E5%88%A0%E9%99%A4%E6%8F%92%E4%BB%B6)
2. [屏幕共享 → 集成屏幕共享插件](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/build/video/screen-share#%E9%9B%86%E6%88%90%E5%B1%8F%E5%B9%95%E5%85%B1%E4%BA%AB%E6%8F%92%E4%BB%B6)
3. [SDK 升级后的 API 设置 → 集成方式](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/reference/after-migrate#%E9%9B%86%E6%88%90%E6%96%B9%E5%BC%8F)

**API 文档**

1. [Interface ScreenVideoTrackInitConfig → Optional displaySurface](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/react-sdk/web-sdk/interfaces/screenvideotrackinitconfig#optional-displaysurface)
2. [Agora Web SDK API Reference → Const SUPPORT_SCREEN_ENCODER_CONFIG_LIST](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/react-sdk/web-sdk/globals#const-support_screen_encoder_config_list)

**FAQ**

无展示结果。

### old

**产品文档**

1. [产品介绍 > 升级指南 > 从 1.1.5 升级至 2.0.0 > Screen-sharing context](https://doc.shengwang.cn/doc/flexible-classroom/android/overview/migration#screen-sharing-context)
2. [基础功能 > 屏幕共享 > 参考信息 > 示例项目](https://doc.shengwang.cn/doc/rtc/flutter/basic-features/screen-share#%E7%A4%BA%E4%BE%8B%E9%A1%B9%E7%9B%AE)
3. [基础功能 > 屏幕共享 > 集成屏幕共享插件](https://doc.shengwang.cn/doc/rtc/android/basic-features/screen-share#%E9%9B%86%E6%88%90%E5%B1%8F%E5%B9%95%E5%85%B1%E4%BA%AB%E6%8F%92%E4%BB%B6)
4. [最佳实践 > 减小 App 体积 > 删除不需要的插件 > 通过 Gradle 自动集成时删除插件](https://doc.shengwang.cn/doc/rtc/android/best-practice/reduce-app-size#%E9%80%9A%E8%BF%87-gradle-%E8%87%AA%E5%8A%A8%E9%9B%86%E6%88%90%E6%97%B6%E5%88%A0%E9%99%A4%E6%8F%92%E4%BB%B6)
5. [最佳实践 > 减小 App 体积 > 参考信息 > implementation 字段](https://doc.shengwang.cn/doc/rtc/android/best-practice/reduce-app-size#implementation-%E5%AD%97%E6%AE%B5)

**API 文档**

1. [RoomStore > isScreenSharing](https://doc.shengwang.cn/api-ref/flexible-classroom/javascript/classes/agora_edu_core_src_stores_domain_common_room_index_oomStore#isScreenSharing)
2. [RoomStore > isScreenSharing](https://doc.shengwang.cn/api-ref/flexible-classroom/electron/classes/agora_edu_core_src_stores_domain_common_room_index_oomStore#isScreenSharing)
3. [ScreenVideoTrackInitConfig > displaySurface](https://doc.shengwang.cn/api-ref/rtc/javascript/interfaces/screenvideotrackinitconfig#displaysurface)
4. [ScreenVideoTrackInitConfig > selfBrowserSurface](https://doc.shengwang.cn/api-ref/rtc/javascript/interfaces/screenvideotrackinitconfig#selfbrowsersurface)
5. [ScreenVideoTrackInitConfig > surfaceSwitching](https://doc.shengwang.cn/api-ref/rtc/javascript/interfaces/screenvideotrackinitconfig#surfaceswitching)

**FAQ**

1. [集成类 > 如何自定义课堂 UI？ > Web 端如何更改屏幕共享背景颜色？](https://doc.shengwang.cn/faq/integration-issues/class-custom-ui#web-%E7%AB%AF%E5%A6%82%E4%BD%95%E6%9B%B4%E6%94%B9%E5%B1%8F%E5%B9%95%E5%85%B1%E4%BA%AB%E8%83%8C%E6%99%AF%E9%A2%9C%E8%89%B2)
2. [集成类 > 如何自定义课堂 UI？ > Web 端如何更新房间背景颜色？](https://doc.shengwang.cn/faq/integration-issues/class-custom-ui#web-%E7%AB%AF%E5%A6%82%E4%BD%95%E6%9B%B4%E6%96%B0%E6%88%BF%E9%97%B4%E8%83%8C%E6%99%AF%E9%A2%9C%E8%89%B2)
3. [质量类 > 如何处理音视频相关问题？ > 屏幕共享带声音如何开启? > Electron 端](https://doc.shengwang.cn/faq/quality-issues/class-audio-video#electron-%E7%AB%AF)

## 34 · C++

旧站首条为 C++ SDK 下载；新站先 C 端计费，且与 C# 结果完全相同。

[new](https://docs-portal-staging.sh3.agoralab.co/search?q=C%2B%2B&type=all&page=1) · [old](https://doc.shengwang.cn/search?q=C%2B%2B)

### new

**产品文档**

1. [C 端用户计费策略推荐](https://docs-portal-staging.sh3.agoralab.co/solutions/one-to-one-live/custom-signaling/build/customize-and-extend/app-billing-policy)
2. [C 端用户计费策略推荐](https://docs-portal-staging.sh3.agoralab.co/solutions/one-to-one-live/rtm/build/customize-and-extend/app-billing-policy)
3. [跑通基于 C API 的 Linux 示例项目](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtsa/get-started/run-example)
4. [隐私白皮书 → c. 身份认证](https://docs-portal-staging.sh3.agoralab.co/introduction/security/privacy#c-%E8%BA%AB%E4%BB%BD%E8%AE%A4%E8%AF%81)
5. [下载 → 下载 C SDK](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtsa/reference/downloads#%E4%B8%8B%E8%BD%BD-c-sdk)

**API 文档**

1. [Agora Recording C++ API Reference 文档](https://docs-portal-staging.sh3.agoralab.co/api-reference/local-server-recording/cpp/legacy/overview)
2. [歌词打分组件 Objective-C API](https://docs-portal-staging.sh3.agoralab.co/api-reference/online-ktv/ios/auikaraoke/api/lyrics-api)
3. [歌词打分组件 Objective-C API](https://docs-portal-staging.sh3.agoralab.co/api-reference/online-ktv/ios/ktv-scenario/api/lyrics-api)
4. [歌词打分组件 Objective-C API](https://docs-portal-staging.sh3.agoralab.co/api-reference/online-ktv/ios/online-ktv-sdk/api/lyrics-api)
5. [服务端网关 SDK C++ API 参考 文档](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc-server-sdk/cpp/overview)

**FAQ**

1. [如何在 Android 设备上跨平台调用 C++ API？ → 问题描述](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/java_call_cpp#%E9%97%AE%E9%A2%98%E6%8F%8F%E8%BF%B0)
2. [如何处理 Token 相关错误码？ → 各语言 Token 错误码对照表](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/token_related_issues#%E5%90%84%E8%AF%AD%E8%A8%80-token-%E9%94%99%E8%AF%AF%E7%A0%81%E5%AF%B9%E7%85%A7%E8%A1%A8)
3. [如何生成同时具备 RTC 和 RTM 权限的 Token？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/rtc_rtm_token)

### old

**产品文档**

1. [下载 > 下载 SDK (C++)](https://doc.shengwang.cn/doc/rtc/windows/resources#%E4%B8%8B%E8%BD%BD-sdk-c)
2. [基础功能 > 实现极速直播 > 实现步骤](https://doc.shengwang.cn/doc/rtc/windows/basic-features/ls-quick-start#%E5%AE%9E%E7%8E%B0%E6%AD%A5%E9%AA%A4)
3. [用户指南 > 消息 > 消息负载结构化 > 推荐消息负载结构 > 文本消息](https://doc.shengwang.cn/doc/rtm2/cpp/user-guide/message/constructed#%E6%96%87%E6%9C%AC%E6%B6%88%E6%81%AF)
4. [用户指南 > 消息 > 消息负载结构化 > 推荐消息负载结构 > 多语言消息](https://doc.shengwang.cn/doc/rtm2/cpp/user-guide/message/constructed#%E5%A4%9A%E8%AF%AD%E8%A8%80%E6%B6%88%E6%81%AF)
5. [用户指南 > 消息 > 消息负载结构化 > 推荐消息负载结构 > 图片附件消息](https://doc.shengwang.cn/doc/rtm2/cpp/user-guide/message/constructed#%E5%9B%BE%E7%89%87%E9%99%84%E4%BB%B6%E6%B6%88%E6%81%AF)

**API 文档**

1. [RtcEngine > getNativeHandle](https://doc.shengwang.cn/api-ref/rtc/android/API/toc_network#api_irtcengine_getnativehandle)
2. [AgoraRtcEngineKit > getNativeHandle](https://doc.shengwang.cn/api-ref/rtc/ios/API/toc_network#api_irtcengine_getnativehandle)
3. [AgoraRtcEngineKit > getNativeHandle](https://doc.shengwang.cn/api-ref/rtc/macos/API/toc_network#api_irtcengine_getnativehandle)
4. [IRtcEngine > GetNativeHandler](https://doc.shengwang.cn/api-ref/rtc/unity/API/toc_network#api_irtcengine_getnativehandle)
5. [RtcEngine > getNativeHandle](https://doc.shengwang.cn/api-ref/rtc/flutter/API/toc_network#api_irtcengine_getnativehandle)

**FAQ**

1. [集成类 > 如何在 Android 设备上跨平台调用 C++ API？](https://doc.shengwang.cn/faq/integration-issues/java-call-cpp)
2. [集成类 > 如何使用连麦鉴权功能？ > 实现方法 > 1. 修改 Token 参数设置](https://doc.shengwang.cn/faq/integration-issues/token-cohost#1-%E4%BF%AE%E6%94%B9-token-%E5%8F%82%E6%95%B0%E8%AE%BE%E7%BD%AE)
3. [集成类 > 如何处理 Token 相关错误码？ > 各语言 Token 错误码对照表](https://doc.shengwang.cn/faq/integration-issues/token-error#%E5%90%84%E8%AF%AD%E8%A8%80-token-%E9%94%99%E8%AF%AF%E7%A0%81%E5%AF%B9%E7%85%A7%E8%A1%A8)
4. [集成类 > 如何在 Android 设备上跨平台调用 C++ API？ > 问题描述](https://doc.shengwang.cn/faq/integration-issues/java-call-cpp#%E9%97%AE%E9%A2%98%E6%8F%8F%E8%BF%B0)
5. [集成类 > 如何生成同时具备 RTC 和 RTM 权限的 Token？](https://doc.shengwang.cn/faq/integration-issues/generate-token)

## 35 · C#

旧站第 2 条为 C# NuGet 集成；新站先 C 端计费，未区分 C++。

[new](https://docs-portal-staging.sh3.agoralab.co/search?q=C%23&type=all&page=1) · [old](https://doc.shengwang.cn/search?q=C%23)

### new

**产品文档**

1. [C 端用户计费策略推荐](https://docs-portal-staging.sh3.agoralab.co/solutions/one-to-one-live/custom-signaling/build/customize-and-extend/app-billing-policy)
2. [C 端用户计费策略推荐](https://docs-portal-staging.sh3.agoralab.co/solutions/one-to-one-live/rtm/build/customize-and-extend/app-billing-policy)
3. [跑通基于 C API 的 Linux 示例项目](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtsa/get-started/run-example)
4. [隐私白皮书 → c. 身份认证](https://docs-portal-staging.sh3.agoralab.co/introduction/security/privacy#c-%E8%BA%AB%E4%BB%BD%E8%AE%A4%E8%AF%81)
5. [下载 → 下载 C SDK](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtsa/reference/downloads#%E4%B8%8B%E8%BD%BD-c-sdk)

**API 文档**

1. [Agora Recording C++ API Reference 文档](https://docs-portal-staging.sh3.agoralab.co/api-reference/local-server-recording/cpp/legacy/overview)
2. [歌词打分组件 Objective-C API](https://docs-portal-staging.sh3.agoralab.co/api-reference/online-ktv/ios/auikaraoke/api/lyrics-api)
3. [歌词打分组件 Objective-C API](https://docs-portal-staging.sh3.agoralab.co/api-reference/online-ktv/ios/ktv-scenario/api/lyrics-api)
4. [歌词打分组件 Objective-C API](https://docs-portal-staging.sh3.agoralab.co/api-reference/online-ktv/ios/online-ktv-sdk/api/lyrics-api)
5. [服务端网关 SDK C++ API 参考 文档](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc-server-sdk/cpp/overview)

**FAQ**

1. [如何在 Android 设备上跨平台调用 C++ API？ → 问题描述](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/java_call_cpp#%E9%97%AE%E9%A2%98%E6%8F%8F%E8%BF%B0)
2. [如何处理 Token 相关错误码？ → 各语言 Token 错误码对照表](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/token_related_issues#%E5%90%84%E8%AF%AD%E8%A8%80-token-%E9%94%99%E8%AF%AF%E7%A0%81%E5%AF%B9%E7%85%A7%E8%A1%A8)
3. [如何生成同时具备 RTC 和 RTM 权限的 Token？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/rtc_rtm_token)

### old

**产品文档**

1. [进阶功能 > C 端用户计费策略推荐](https://doc.shengwang.cn/doc/one-to-one-live/android/custom-signaling/advanced-features/app-billing-policy)
2. [下载 > 通过 NuGet 集成 SDK (C#)](https://doc.shengwang.cn/doc/rtc/windows/resources#%E9%80%9A%E8%BF%87-nuget-%E9%9B%86%E6%88%90-sdk-c)
3. [用户指南 > 消息 > 消息负载结构化 > 推荐消息负载结构 > 文本消息](https://doc.shengwang.cn/doc/rtm2/unity/user-guide/message/constructed#%E6%96%87%E6%9C%AC%E6%B6%88%E6%81%AF)
4. [用户指南 > 消息 > 消息负载结构化 > 推荐消息负载结构 > 多语言消息](https://doc.shengwang.cn/doc/rtm2/unity/user-guide/message/constructed#%E5%A4%9A%E8%AF%AD%E8%A8%80%E6%B6%88%E6%81%AF)
5. [用户指南 > 消息 > 消息负载结构化 > 推荐消息负载结构 > 图片附件消息](https://doc.shengwang.cn/doc/rtm2/unity/user-guide/message/constructed#%E5%9B%BE%E7%89%87%E9%99%84%E4%BB%B6%E6%B6%88%E6%81%AF)

**API 文档**

1. [FCRGroupContext > getGroupInfo](https://doc.shengwang.cn/api-ref/flexible-classroom/android/API/class_groupcontext#api_getgroupinfo)
2. [FCRGroupContext > addSubRoomList](https://doc.shengwang.cn/api-ref/flexible-classroom/android/API/class_groupcontext#api_addsubroomlist)
3. [FCRGroupContext > removeSubRoomList](https://doc.shengwang.cn/api-ref/flexible-classroom/android/API/class_groupcontext#api_removesubroomlist)
4. [FCRGroupContext > removeAllSubRoomList](https://doc.shengwang.cn/api-ref/flexible-classroom/android/API/class_groupcontext#api_removeallsubroomlist)
5. [FCRGroupContext > getSubRoomList](https://doc.shengwang.cn/api-ref/flexible-classroom/android/API/class_groupcontext#api_getsubroomlist)

**FAQ**

1. [集成类 > 如何处理 Token 相关错误码？ > 各语言 Token 错误码对照表](https://doc.shengwang.cn/faq/integration-issues/token-error#%E5%90%84%E8%AF%AD%E8%A8%80-token-%E9%94%99%E8%AF%AF%E7%A0%81%E5%AF%B9%E7%85%A7%E8%A1%A8)
2. [集成类 > 为什么媒体音量下，设置录制时允许震动不生效？ > 解决方案](https://doc.shengwang.cn/faq/integration-issues/allow-haptics#%E8%A7%A3%E5%86%B3%E6%96%B9%E6%A1%88)
3. [集成类 > 当使用命令行录制时，如何控制录制进程？ > 停止录制](https://doc.shengwang.cn/faq/integration-issues/cmd-control-record#%E5%81%9C%E6%AD%A2%E5%BD%95%E5%88%B6)
4. [集成类 > 如何获取用户的通话时长？ > 实现方法 > 使用声网 RTC SDK](https://doc.shengwang.cn/faq/integration-issues/business-billing#%E4%BD%BF%E7%94%A8%E5%A3%B0%E7%BD%91-rtc-sdk)
5. [集成类 > 如何自定义用户属性，课堂属性和 widget 属性？](https://doc.shengwang.cn/faq/integration-issues/class-properties)

## 36 · start_cloud_recording

两站有云端录制开始步骤/接口；前列仍混有回调主题。

[new](https://docs-portal-staging.sh3.agoralab.co/search?q=start_cloud_recording&type=all&page=1) · [old](https://doc.shengwang.cn/search?q=start_cloud_recording)

### new

**产品文档**

1. [录制服务事件 → 3 cloud_recording_status_update](https://docs-portal-staging.sh3.agoralab.co/realtime-media/cloud-recording/build/implement-core-features/service#3-cloud_recording_status_update)
2. [使用网易易盾音频审核 → 示例](https://docs-portal-staging.sh3.agoralab.co/realtime-media/content-moderation/build/audio-moderation-api#%E7%A4%BA%E4%BE%8B-1)
3. [实现合流录制 → 开始录制](https://docs-portal-staging.sh3.agoralab.co/realtime-media/cloud-recording/build/recording-modes/mix-mode/set-composite#%E5%BC%80%E5%A7%8B%E5%BD%95%E5%88%B6)
4. [实现页面录制 → 2. 开始录制](https://docs-portal-staging.sh3.agoralab.co/realtime-media/cloud-recording/build/recording-modes/web-mode/set-webpage-recording#2-%E5%BC%80%E5%A7%8B%E5%BD%95%E5%88%B6)

**API 文档**

1. [开始云端录制](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/cloud-recording/start)
2. [停止云端录制](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/cloud-recording/stop)
3. [获取云端录制资源](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/cloud-recording/acquire)
4. [查询云端录制状态](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/cloud-recording/query)
5. [更新云端录制设置](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/cloud-recording/update)

**FAQ**

1. [为什么成功开启云端录制后调用 query 方法返回 404？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/return_404)
2. [应用崩溃后对云端录制有什么影响？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/abnormal_exit)
3. [如何处理视频黑屏问题？ → 步骤 1：自检](https://docs-portal-staging.sh3.agoralab.co/reference/faq/quality/video_blank#%E6%AD%A5%E9%AA%A4-1%E8%87%AA%E6%A3%80)
4. [为什么部分鸿蒙版本 App 锁屏或切后台音视频采集无效？ → 解决方案](https://docs-portal-staging.sh3.agoralab.co/reference/faq/quality/harmonyos_background#%E8%A7%A3%E5%86%B3%E6%96%B9%E6%A1%88)
5. [为什么录制状态出现异常？ → 录制退出报错](https://docs-portal-staging.sh3.agoralab.co/reference/faq/quality/record_status_error#%E5%BD%95%E5%88%B6%E9%80%80%E5%87%BA%E6%8A%A5%E9%94%99)

### old

**产品文档**

1. [Webhook 回调事件 > 录制服务事件 > 3 cloud_recording_status_update](https://doc.shengwang.cn/doc/cloud-recording/restful/webhook/service#3-cloud_recording_status_update)
2. [快速开始 > 使用 Go SDK 开始云端录制 > 开始云端录制 > 开始录制](https://doc.shengwang.cn/doc/cloud-recording/restful/get-started/quick-start-go#%E5%BC%80%E5%A7%8B%E5%BD%95%E5%88%B6)
3. [快速开始 > 使用 RESTful API 开始云端录制 > 进行云端录制 > 开始录制](https://doc.shengwang.cn/doc/cloud-recording/restful/get-started/quick-start#%E5%BC%80%E5%A7%8B%E5%BD%95%E5%88%B6)
4. [功能指南 > 单流录制 > 实现单流录制 > 实现步骤 > 开始录制](https://doc.shengwang.cn/doc/cloud-recording/restful/user-guides/individual-mode/set-individual#%E5%BC%80%E5%A7%8B%E5%BD%95%E5%88%B6)
5. [功能指南 > 合流录制 > 实现合流录制 > 实现步骤 > 开始录制](https://doc.shengwang.cn/doc/cloud-recording/restful/user-guides/mix-mode/set-composite#%E5%BC%80%E5%A7%8B%E5%BD%95%E5%88%B6)

**API 文档**

1. [开始云端录制 > post > /v1/apps/{appid}/cloud_recording/resourceid/{resourceid}/mode/{mode}/start](https://doc.shengwang.cn/doc/cloud-recording/restful/cloud-recording/operations/post-v1-apps-appid-cloud_recording-resourceid-resourceid-mode-mode-start)
2. [获取云端录制资源 > post > /v1/apps/{appid}/cloud_recording/acquire](https://doc.shengwang.cn/doc/cloud-recording/restful/cloud-recording/operations/post-v1-apps-appid-cloud_recording-acquire)
3. [StartLocalAudioMixer > StartLocalAudioMixer](https://doc.shengwang.cn/api-ref/rtc/csharp/API/api_irtcengine_startlocalaudiomixer#StartLocalAudioMixer)
4. [LogReporter > start](https://doc.shengwang.cn/api-ref/flexible-classroom/javascript/classes/agora_edu_core_src_log_reporter_ogReporter#start)
5. [AgoraRteCameraVideoTrack > start](https://doc.shengwang.cn/api-ref/flexible-classroom/javascript/classes/agora_rte_sdk_src_core_media_track_goraRteCameraVideoTrack#start)

**FAQ**

1. [集成类 > 为什么成功开启云端录制后调用 query 方法返回 404？](https://doc.shengwang.cn/faq/integration-issues/return-404)
2. [集成类 > 应用崩溃后对云端录制有什么影响？](https://doc.shengwang.cn/faq/integration-issues/app-exit)
3. [质量类 > 为什么部分鸿蒙版本 App 锁屏或切后台音视频采集无效？ > 解决方案](https://doc.shengwang.cn/faq/quality-issues/harmonyos-background#%E8%A7%A3%E5%86%B3%E6%96%B9%E6%A1%88)
4. [质量类 > 为什么录制状态出现异常？ > 录制退出报错](https://doc.shengwang.cn/faq/quality-issues/record-status-error#%E5%BD%95%E5%88%B6%E9%80%80%E5%87%BA%E6%8A%A5%E9%94%99)

## 37 · zzzxqv987654321

两站均正确给出无结果状态。

[new](https://docs-portal-staging.sh3.agoralab.co/search?q=zzzxqv987654321&type=all&page=1) · [old](https://doc.shengwang.cn/search?q=zzzxqv987654321)

### new

**产品文档**

无展示结果。

**API 文档**

无展示结果。

**FAQ**

无展示结果。

### old

**产品文档**

无展示结果。

**API 文档**

无展示结果。

**FAQ**

无展示结果。

## 38 · （三个空格）

新站阻止空白提交并保留前次搜索；旧站提交空白后返回默认浏览结果。

[new](https://docs-portal-staging.sh3.agoralab.co/search?q=%20%20%20&type=all&page=1) · [old](https://doc.shengwang.cn/search?q=%20%20%20)

### new

空白未提交，URL 仍为上一条无结果查询，不能将其记作空白查询零召回。

**产品文档**

无展示结果。

**API 文档**

无展示结果。

**FAQ**

无展示结果。

### old

**产品文档**

1. [产品 > 实时互动](https://doc.shengwang.cn/doc/rtc/homepage)
2. [文档指引](https://doc.shengwang.cn/doc/rtc/android/landing-page)
3. [文档指引 > 立即体验](https://doc.shengwang.cn/doc/rtc/android/landing-page#%E7%AB%8B%E5%8D%B3%E4%BD%93%E9%AA%8C)
4. [文档指引 > 快速入门](https://doc.shengwang.cn/doc/rtc/android/landing-page#%E5%BF%AB%E9%80%9F%E5%85%A5%E9%97%A8)
5. [文档指引 > 推荐阅读](https://doc.shengwang.cn/doc/rtc/android/landing-page#%E6%8E%A8%E8%8D%90%E9%98%85%E8%AF%BB)

**API 文档**

1. [ChannelMediaRelayConfiguration > removeDestChannelInfo](https://doc.shengwang.cn/api-ref/rtc/android/API/api_channelmediarelayconfiguration_removedestchannelinfo#removeDestChannelInfo)
2. [ChannelMediaRelayConfiguration > setDestChannelInfo](https://doc.shengwang.cn/api-ref/rtc/android/API/api_channelmediarelayconfiguration_setdestchannelinfo#setDestChannelInfo)
3. [ChannelMediaRelayConfiguration > setSrcChannelInfo](https://doc.shengwang.cn/api-ref/rtc/android/API/api_channelmediarelayconfiguration_setsrcchannelinfo#setSrcChannelInfo)
4. [LiveTranscoding > addBackgroundImage](https://doc.shengwang.cn/api-ref/rtc/android/API/api_livetranscoding_addbackgroundimage#addBackgroundImage)
5. [LiveTranscoding > addUser](https://doc.shengwang.cn/api-ref/rtc/android/API/api_livetranscoding_adduser#addUser)

**FAQ**

1. [质量类 > 为什么通过系统音量无法调节背景音乐？](https://doc.shengwang.cn/faq/quality-issues/adjust-music-volume)
2. [质量类 > 为什么通过系统音量无法调节背景音乐？ > 问题描述](https://doc.shengwang.cn/faq/quality-issues/adjust-music-volume#%E9%97%AE%E9%A2%98%E6%8F%8F%E8%BF%B0)
3. [质量类 > 为什么通过系统音量无法调节背景音乐？ > 问题原因](https://doc.shengwang.cn/faq/quality-issues/adjust-music-volume#%E9%97%AE%E9%A2%98%E5%8E%9F%E5%9B%A0)
4. [质量类 > 为什么通过系统音量无法调节背景音乐？ > 解决方案](https://doc.shengwang.cn/faq/quality-issues/adjust-music-volume#%E8%A7%A3%E5%86%B3%E6%96%B9%E6%A1%88)
5. [集成类 > 为什么媒体音量下，设置录制时允许震动不生效？](https://doc.shengwang.cn/faq/integration-issues/allow-haptics)

## 39 · &lt;script&gt;alert(1)&lt;/script&gt;

两站按字面输入处理并给出无结果；不代表完成安全审计。

[new](https://docs-portal-staging.sh3.agoralab.co/search?q=%3Cscript%3Ealert%281%29%3C%2Fscript%3E&type=all&page=1) · [old](https://doc.shengwang.cn/search?q=%3Cscript%3Ealert%281%29%3C%2Fscript%3E)

### new

**产品文档**

无展示结果。

**API 文档**

无展示结果。

**FAQ**

无展示结果。

### old

**产品文档**

无展示结果。

**API 文档**

无展示结果。

**FAQ**

无展示结果。

## 40 ·   Token

两站有意义结果与 Token 查询相同。

[new](https://docs-portal-staging.sh3.agoralab.co/search?q=%20%20Token%20%20&type=all&page=1) · [old](https://doc.shengwang.cn/search?q=%20%20Token%20%20)

### new

**产品文档**

1. [部署 Token 服务器](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtm/build/authentication-and-connection/token-generation)
2. [Token 校验](https://docs-portal-staging.sh3.agoralab.co/introduction/user-guides/token-info)
3. [使用 Token 鉴权](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/build/setup-and-access/token-authentication)
4. [使用 Token 鉴权](https://docs-portal-staging.sh3.agoralab.co/realtime-media/local-server-recording/build/recording-preparation/generate-token)
5. [生成 Token](https://docs-portal-staging.sh3.agoralab.co/realtime-media/whiteboard/whiteboard-sdk/build/setup-and-access/generate-token)

**API 文档**

1. [生成 Room Token](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/whiteboard/restful/generate-room-token)
2. [生成 SDK Token](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/whiteboard/restful/generate-sdk-token)
3. [生成 Task Token](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/whiteboard/restful/generate-task-token)
4. [生成 SDK Token](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/ppt-conversion-service/generate-sdk-token)
5. [Enumeration ConnectionDisconnectedReason → TOKEN_EXPIRE](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/react-sdk/web-sdk/enums/connectiondisconnectedreason#token_expire)

**FAQ**

1. [如何升级到 Token 鉴权方案？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/appid_to_token)
2. [如何处理 Token 相关错误码？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/token_related_issues)
3. [如何生成同时具备 RTC 和 RTM 权限的 Token？](https://docs-portal-staging.sh3.agoralab.co/reference/faq/integration/rtc_rtm_token)

### old

**产品文档**

1. [功能指南 > Token 校验](https://doc.shengwang.cn/doc/console/general/user-guides/token_authentication)
2. [基础功能 > 使用 Token 鉴权](https://doc.shengwang.cn/doc/rtc/android/basic-features/token-authentication)
3. [快速开始 > 使用 Token 鉴权](https://doc.shengwang.cn/doc/rtc/mini-program/basic-features/token-authentication)
4. [基础功能 > 使用 Token 鉴权](https://doc.shengwang.cn/doc/flexible-classroom/android/basic-features/generate-token)
5. [功能指南 > 使用 Token 鉴权](https://doc.shengwang.cn/doc/recording/cpp/user-guides/generate-token)

**API 文档**

1. [生成 Token > 生成 SDK Token > post > /v5/tokens/teams](https://doc.shengwang.cn/doc/whiteboard/restful/fastboard-sdk/restful-wb/operations/post-v5-tokens-teams)
2. [生成 Token > 生成 Room Token > post > /v5/tokens/rooms/{uuid}](https://doc.shengwang.cn/doc/whiteboard/restful/fastboard-sdk/restful-wb/operations/post-v5-tokens-rooms-uuid)
3. [生成 Token > 生成 Task Token > post > /v5/tokens/tasks/{uuid}](https://doc.shengwang.cn/doc/whiteboard/restful/fastboard-sdk/restful-wb/operations/post-v5-tokens-tasks-uuid)
4. [生成 Token > 生成 SDK Token > post > /v5/tokens/teams](https://doc.shengwang.cn/doc/whiteboard/restful/whiteboard-sdk/restful-wb/operations/post-v5-tokens-teams)
5. [生成 Token > 生成 Room Token > post > /v5/tokens/rooms/{uuid}](https://doc.shengwang.cn/doc/whiteboard/restful/whiteboard-sdk/restful-wb/operations/post-v5-tokens-rooms-uuid)

**FAQ**

1. [集成类 > 如何升级到 Token 鉴权方案？](https://doc.shengwang.cn/faq/integration-issues/appid-to-token)
2. [集成类 > 如何处理 Token 相关错误码？](https://doc.shengwang.cn/faq/integration-issues/token-error)
3. [集成类 > 如何生成同时具备 RTC 和 RTM 权限的 Token？](https://doc.shengwang.cn/faq/integration-issues/generate-token)
4. [集成类 > 如何处理 JavaScript SDK 常见集成问题？ > 如何处理 Token 过期？](https://doc.shengwang.cn/faq/integration-issues/rtm2-integration-issue#%E5%A6%82%E4%BD%95%E5%A4%84%E7%90%86-token-%E8%BF%87%E6%9C%9F)
5. [集成类 > 如何处理 Token 相关错误码？ > Token 过期相关事件回调](https://doc.shengwang.cn/faq/integration-issues/token-error#token-%E8%BF%87%E6%9C%9F%E7%9B%B8%E5%85%B3%E4%BA%8B%E4%BB%B6%E5%9B%9E%E8%B0%83)
