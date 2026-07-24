#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditDocsLinks } from './audit-doc-links.mjs';
import {
  findLegacyBodyLinks,
  reconcileMappedBodyLink,
} from './lib/api-center/legacy-links.mjs';
import {
  buildLocalFragmentIndex,
  findBestFragmentAnchor,
  insertFragmentAliases,
  rewriteLocalFragmentLinks,
  targetPathToRoute,
} from './lib/api-center/local-fragment-index.mjs';
import {
  buildLegacyRouteMap,
  loadFaqMappingRows,
  rewriteLegacyHref,
} from './lib/api-center/migration-framework.mjs';
import { parseCsv } from './lib/api-center/source-resolver.mjs';

const REPORT_PATH = 'docs/agents/reports/2026-07-23-cn-api-unresolved-links.md';
const ARCHIVE_PATH =
  'docs/agents/reports/2026-07-23-cn-api-unavailable-links.json';
const LEGACY_DOC_HOSTS = new Set([
  'doc.shengwang.cn',
  'docportal.shengwang.cn',
  'docs.agora.io',
]);
const APPROVED_LEGACY_FALLBACKS = new Set([
  'content/docs/zh-CN/realtime-media/rtc/reference/downloads/android.mdx\0https://doc.shengwang.cn/codebox/detail?demo=24&platform=2',
  'content/docs/zh-CN/realtime-media/rtc/reference/downloads/ios.mdx\0https://doc.shengwang.cn/codebox/detail?demo=24&platform=1',
  'content/docs/zh-CN/realtime-media/rtc/reference/migration-guide.mdx\0https://docportal.shengwang.cn/cn/video-legacy/release_ios_video?platform=iOS',
  'content/docs/zh-CN/realtime-media/rtc/reference/migration-guide.mdx\0https://docportal.shengwang.cn/cn/video-legacy/release_mac_video?platform=macOS',
  'content/docs/zh-CN/realtime-media/rtc/reference/migration-guide.mdx\0https://docportal.shengwang.cn/cn/video-legacy/release_windows_video?platform=Windows',
]);

const EXACT_FRAGMENT_ALIAS_TARGETS = new Map([
  [
    'content/docs/zh-CN/api-reference/cloud-recording/java-api/individualscenario.java.mdx#queryresourceresqueryvideoscreenshot',
    'queryvideoscreenshot',
  ],
  [
    'content/docs/zh-CN/api-reference/conversational-ai/agent-go/index.mdx#newaliyun',
    'llm-vendors',
  ],
  [
    'content/docs/zh-CN/api-reference/conversational-ai/agent-go/index.mdx#newbytedance',
    'llm-vendors',
  ],
  [
    'content/docs/zh-CN/api-reference/conversational-ai/agent-go/index.mdx#newdeepseek',
    'llm-vendors',
  ],
  [
    'content/docs/zh-CN/api-reference/conversational-ai/agent-go/index.mdx#newtencentllm',
    'llm-vendors',
  ],
  [
    'content/docs/zh-CN/api-reference/conversational-ai/ios/conversationalaiapi.mdx#loadaudiosettings',
    'loadaudiosettings[1/2]',
  ],
  [
    'content/docs/zh-CN/api-reference/conversational-ai/web/conversationalaiapi.mdx#unsubscribemessage',
    'unsubscribe',
  ],
  [
    'content/docs/zh-CN/api-reference/faq/integration/console_error_web.mdx#none-ice-candidate-not-alloweda-namecandidatea',
    'none-ice-candidate-not-allowed',
  ],
  [
    'content/docs/zh-CN/api-reference/flexible-classroom/restful-api/api-sync.mdx#查询所有课堂事件',
    '查询指定类型事件',
  ],
  [
    'content/docs/zh-CN/api-reference/iot-apaas/client-api/call.mdx#accountmgr',
    'iaccountmgr',
  ],
  [
    'content/docs/zh-CN/api-reference/iot-apaas/client-api/call.mdx#callmgr',
    'icallkitmgr',
  ],
  [
    'content/docs/zh-CN/api-reference/iot-apaas/client-api/call.mdx#iagoracallkitsdkStatus',
    'sdkstatus',
  ],
  [
    'content/docs/zh-CN/api-reference/iot-apaas/client-api/call.mdx#allnotificationquery',
    'queryall',
  ],
  [
    'content/docs/zh-CN/api-reference/iot-apaas/client-api/call.mdx#devicenotificationquery',
    'querybydevice',
  ],
  [
    'content/docs/zh-CN/api-reference/iot-apaas/client-api/call.mdx#notificationdelete',
    'deletenoti',
  ],
  [
    'content/docs/zh-CN/api-reference/iot-apaas/client-api/call.mdx#notificationmark',
    'mark',
  ],
  [
    'content/docs/zh-CN/api-reference/iot-apaas/client-api/full.mdx#iagoracallkitsdkStatus',
    'sdkstatus',
  ],
  [
    'content/docs/zh-CN/api-reference/iot-apaas/client-api/full.mdx#accountmgr',
    'iaccountmgr',
  ],
  [
    'content/docs/zh-CN/api-reference/iot-apaas/client-api/full.mdx#callmgr',
    'icallkitmgr',
  ],
  [
    'content/docs/zh-CN/api-reference/iot-apaas/client-api/full.mdx#devicecancel',
    'devicecancelable',
  ],
  [
    'content/docs/zh-CN/api-reference/iot-apaas/client-api/full.mdx#allnotificationquery',
    'queryall',
  ],
  [
    'content/docs/zh-CN/api-reference/iot-apaas/client-api/full.mdx#devicenotificationquery',
    'querybydevice',
  ],
  [
    'content/docs/zh-CN/api-reference/iot-apaas/client-api/full.mdx#notificationdelete',
    'deletenoti',
  ],
  [
    'content/docs/zh-CN/api-reference/iot-apaas/client-api/full.mdx#notificationmark',
    'mark-1',
  ],
  [
    'content/docs/zh-CN/api-reference/iot-apaas/device-sdk/call/config.mdx#agora_iot_config',
    'agora_iot_config_t',
  ],
  [
    'content/docs/zh-CN/api-reference/iot-apaas/device-sdk/call/device-manager.mdx#agora_license_activate',
    'agoraiotlicenseactivate',
  ],
  [
    'content/docs/zh-CN/api-reference/iot-apaas/device-sdk/full/config.mdx#agora_iot_config',
    'agora_iot_config_t',
  ],
  [
    'content/docs/zh-CN/api-reference/iot-apaas/device-sdk/full/device-manager.mdx#agora_license_activate',
    'agoraiotlicenseactivate',
  ],
  [
    'content/docs/zh-CN/api-reference/rtc-server-sdk/go-api/videoframesender.go.mdx#videoframesender',
    'newvideoframesender',
  ],
  [
    'content/docs/zh-CN/api-reference/rtc-server-sdk/python-api/audiopcmdatasender.python.mdx#audiopcmdatasender',
    'sendaudiopcmdata',
  ],
  [
    'content/docs/zh-CN/api-reference/rtc-server-sdk/python-api/audioencodedframesender.python.mdx#audioencodedframesender',
    'sendencodedaudioframe',
  ],
  [
    'content/docs/zh-CN/api-reference/rtc-server-sdk/python-api/videoframesender.python.mdx#videoframesender',
    'sendvideoframe',
  ],
  [
    'content/docs/zh-CN/api-reference/local-server-recording/java/agoramediartcrecorder.java.mdx#initialize',
    'initialize[2/2]',
  ],
  [
    'content/docs/zh-CN/api-reference/rtc-server-sdk/cpp/(current)/classagora-1-1base-1-1-i-agora-service.mdx#a97df07f6f57f0d5b00e52a70065f1804',
    'a1c707744b5e4f06467219a25ecaeccb7',
  ],
  [
    'content/docs/zh-CN/api-reference/rtc-server-sdk/cpp/(current)/classagora-1-1rtc-1-1-i-rtc-connection.mdx#af6f657c7f744cac441f1a5518b84ce42',
    'a44ce079c780ace4b8188d59ad68d96fb',
  ],
  [
    'content/docs/zh-CN/api-reference/rtc-server-sdk/java/(current)/classio-1-1agora-1-1rtc-1-1-agora-local-user.mdx#registerAudioFrameObserver(',
    'a89d18c5cf1a58866c7d9c85e700b949f',
  ],
  [
    'content/docs/zh-CN/api-reference/rtc/android/(current)/channel.mdx#api_irtcengine_joinchannel',
    'api_irtcengine_joinchannel1',
  ],
  [
    'content/docs/zh-CN/api-reference/rtc/android/(current)/channel.mdx#api_irtcengine_setclientrole',
    'api_irtcengine_setclientrole1',
  ],
  [
    'content/docs/zh-CN/api-reference/rtc/android/(current)/channel.mdx#setclientrole',
    'api_irtcengine_setclientrole1',
  ],
  [
    'content/docs/zh-CN/api-reference/rtc/android/(current)/class-playerupdatedinfo.mdx#PlayerUpdatedInfo',
    'class_playerupdatedinfo__prototype',
  ],
  [
    'content/docs/zh-CN/api-reference/rtc/android/(current)/initialize.mdx#destroy',
    'api_irtcengine_release',
  ],
  [
    'content/docs/zh-CN/api-reference/rtc/android/(current)/play/drm.mdx#api_imusicontentcenter_preload',
    'api_imusiccontentcenter_preload',
  ],
  [
    'content/docs/zh-CN/api-reference/rtc/android/(current)/play/rte-player.mdx#api_rteexception_errorcode',
    'api_rteexception_errorcode_rteexception',
  ],
  [
    'content/docs/zh-CN/api-reference/rtc/cpp-all-platforms/(current)/audio/audio-custom-capturenrendering.mdx#api_imediaengine_pushaudioframe0',
    'api_imediaengine_pushaudioframe',
  ],
  [
    'content/docs/zh-CN/api-reference/rtc/cpp-all-platforms/(current)/audio/audio-custom-capturenrendering.mdx#api_imediaengine_setexternalaudiosource2',
    'api_imediaengine_setexternalaudiosource_imediaengine',
  ],
  [
    'content/docs/zh-CN/api-reference/rtc/cpp-all-platforms/(current)/channel.mdx#api_irtcengine_joinchannel',
    'api_irtcengine_joinchannel1',
  ],
  [
    'content/docs/zh-CN/api-reference/rtc/cpp-all-platforms/(current)/channel.mdx#api_irtcengine_setclientrole',
    'api_irtcengine_setclientrole1',
  ],
  [
    'content/docs/zh-CN/api-reference/rtc/cpp-all-platforms/(current)/channel.mdx#setclientrole',
    'api_irtcengine_setclientrole1',
  ],
  [
    'content/docs/zh-CN/api-reference/rtc/cpp-all-platforms/(current)/enum-rteabrfallbacklayer.mdx#RteAbrFallbackLayer',
    'enum_rteabrfallbacklayer__parameters',
  ],
  [
    'content/docs/zh-CN/api-reference/rtc/cpp-all-platforms/(current)/enum-rteabrsubscriptionlayer.mdx#RteAbrSubscriptionLayer',
    'enum_rteabrsubscriptionlayer__parameters',
  ],
  [
    'content/docs/zh-CN/api-reference/rtc/cpp-all-platforms/(current)/play/mediaplayer/mediaplayer-observer.mdx#api_imediaplayer_registeraudioframeobserver2',
    'api_imediaplayer_registeraudioframeobserver2_imediaplayer',
  ],
  [
    'content/docs/zh-CN/api-reference/rtc/cpp-all-platforms/(current)/play/rte-player.mdx#api_rte_setconfigs',
    'api_rte_setconfigs_rte',
  ],
  [
    'content/docs/zh-CN/api-reference/rtc/cpp-all-platforms/(current)/video/video-prenpro/virtualbackground.mdx#api_irtcengine_enablevirtualbackground2',
    'api_irtcengine_enablevirtualbackground',
  ],
  [
    'content/docs/zh-CN/api-reference/rtc/electron/(current)/audio/audio-basic.mdx#api_irtcengine_setaudioprofile2',
    'api_irtcengine_setaudioprofile',
  ],
  [
    'content/docs/zh-CN/api-reference/rtc/electron/(current)/audio/audio-prenpost/spatial-audio.mdx#destroy',
    'api_ibasespatialaudioengine_release_ibasespatialaudioengine',
  ],
  [
    'content/docs/zh-CN/api-reference/rtc/flutter/(current)/audio/audio-basic.mdx#api_irtcengine_setaudioprofile2',
    'api_irtcengine_setaudioprofile',
  ],
  [
    'content/docs/zh-CN/api-reference/rtc/flutter/(current)/network.mdx#api_irtcengine_startechotest2',
    'api_irtcengine_startechotest3',
  ],
  [
    'content/docs/zh-CN/api-reference/rtc/ios/(current)/channel.mdx#api_irtcengine_joinchannel',
    'api_irtcengine_joinchannel1',
  ],
  [
    'content/docs/zh-CN/api-reference/rtc/ios/(current)/enum-audioscenariotype.mdx#AgoraAudioScenario',
    'enum_audioscenariotype__parameters',
  ],
  [
    'content/docs/zh-CN/api-reference/rtc/macos/(current)/channel.mdx#api_irtcengine_joinchannel',
    'api_irtcengine_joinchannel1',
  ],
  [
    'content/docs/zh-CN/api-reference/rtc/react-native/(current)/audio/audio-basic.mdx#api_irtcengine_setaudioprofile2',
    'api_irtcengine_setaudioprofile',
  ],
  [
    'content/docs/zh-CN/api-reference/rtc/react-native/(current)/audio/audio-prenpost/spatial-audio.mdx#destroy',
    'api_ibasespatialaudioengine_release_ibasespatialaudioengine',
  ],
  [
    'content/docs/zh-CN/api-reference/rtc/unity/(current)/audio/audio-custom-capturenrendering.mdx#api_imediaengine_pushaudioframe0',
    'api_imediaengine_pushaudioframe',
  ],
  [
    'content/docs/zh-CN/api-reference/rtc/unity/(current)/channel.mdx#api_irtcengine_joinchannel',
    'api_irtcengine_joinchannel1',
  ],
  [
    'content/docs/zh-CN/api-reference/rtc/unity/(current)/channel.mdx#api_irtcengine_setclientrole',
    'api_irtcengine_setclientrole1',
  ],
  [
    'content/docs/zh-CN/api-reference/rtc/unity/(current)/channel.mdx#setclientrole',
    'api_irtcengine_setclientrole1',
  ],
  [
    'content/docs/zh-CN/api-reference/rtc/unity/(current)/device-management/audio-device.mdx#api_iaudiodevicemanager_startaudiodeviceloopbacktest_ng',
    'api_iaudiodevicemanager_startaudiodeviceloopbacktest',
  ],
  [
    'content/docs/zh-CN/api-reference/rtc/unity/(current)/device-management/audio-device.mdx#api_iaudiodevicemanager_startrecordingdevicetest_ng',
    'api_iaudiodevicemanager_startrecordingdevicetest',
  ],
  [
    'content/docs/zh-CN/api-reference/rtc/unity/(current)/network.mdx#api_startechotest2',
    'api_irtcengine_startechotest3',
  ],
  [
    'content/docs/zh-CN/api-reference/rtc/unity/(current)/network.mdx#callback_onlastmileproberesult',
    'callback_irtcengineeventhandler_onlastmileproberesult',
  ],
  [
    'content/docs/zh-CN/api-reference/rtc/unity/(current)/network.mdx#callback_onlastmilequality',
    'callback_irtcengineeventhandler_onlastmilequality',
  ],
  [
    'content/docs/zh-CN/api-reference/rtc/unreal-cpp/(current)/channel.mdx#setclientrole',
    'api_irtcengine_setclientrole',
  ],
  [
    'content/docs/zh-CN/api-reference/rtc/unreal-blueprint/(current)/channel.mdx#leaveChannel-[2/2]',
    'api_irtcengine_leavechannel2',
  ],
  [
    'content/docs/zh-CN/api-reference/rtc/web/interfaces/iagorartc.mdx#createmicrophoneaudiotrackm',
    'createmicrophoneaudiotrack',
  ],
  [
    'content/docs/zh-CN/api-reference/rtm/cpp/channel.mdx#IStreamChannel',
    'createstreamchannel',
  ],
  [
    'content/docs/zh-CN/api-reference/rtm/cpp/configuration.mdx#create',
    'createagorartmclient',
  ],
  [
    'content/docs/zh-CN/api-reference/rtm/cpp/configuration.mdx#异步回调5',
    '异步回调-1',
  ],
  [
    'content/docs/zh-CN/api-reference/rtm/cpp/storage.mdx#异步回调10',
    '异步回调-8',
  ],
  [
    'content/docs/zh-CN/api-reference/rtm/cpp/topic.mdx#异步回调5',
    '异步回调-4',
  ],
  [
    'content/docs/zh-CN/api-reference/rtm/flutter/configuration.mdx#create',
    '初始化',
  ],
  [
    'content/docs/zh-CN/api-reference/rtm/harmonyos/channel.mdx#StreamChannel',
    'createstreamchannel',
  ],
  [
    'content/docs/zh-CN/api-reference/rtm/harmonyos/configuration.mdx#Init',
    'rtmclient',
  ],
  [
    'content/docs/zh-CN/api-reference/rtm/harmonyos/lock.mdx#getLock',
    'getlocks',
  ],
  [
    'content/docs/zh-CN/api-reference/rtm/ios/channel.mdx#join',
    'joinwithoption',
  ],
  [
    'content/docs/zh-CN/api-reference/rtm/ios/channel.mdx#subscribe',
    'subscribewithchannel',
  ],
  [
    'content/docs/zh-CN/api-reference/rtm/ios/configuration.mdx#create',
    'initwithconfig',
  ],
  [
    'content/docs/zh-CN/api-reference/rtm/ios/configuration.mdx#lockevent',
    'agorartmlockevent',
  ],
  [
    'content/docs/zh-CN/api-reference/rtm/ios/configuration.mdx#login',
    'loginbytoken',
  ],
  [
    'content/docs/zh-CN/api-reference/rtm/ios/configuration.mdx#messageevent',
    'agorartmmessageevent',
  ],
  [
    'content/docs/zh-CN/api-reference/rtm/ios/configuration.mdx#presenceevent',
    'agorartmpresenceevent',
  ],
  [
    'content/docs/zh-CN/api-reference/rtm/ios/configuration.mdx#rtmconfig',
    'agorartmclientconfig',
  ],
  [
    'content/docs/zh-CN/api-reference/rtm/ios/configuration.mdx#storageevent',
    'agorartmstorageevent',
  ],
  [
    'content/docs/zh-CN/api-reference/rtm/ios/configuration.mdx#topicevent',
    'agorartmtopicevent',
  ],
  [
    'content/docs/zh-CN/api-reference/rtm/react-native/enumv.mdx#rtmencrptionmode',
    'rtmencryptionmode',
  ],
  [
    'content/docs/zh-CN/api-reference/rtm/swift/configuration.mdx#rtmconfig',
    'agorartmclientconfig',
  ],
  [
    'content/docs/zh-CN/api-reference/rtm/web/enumv.mdx#channeltype',
    '频道类型',
  ],
  [
    'content/docs/zh-CN/api-reference/rtm/web/enumv.mdx#rtmservicetype',
    '服务类型',
  ],
  [
    'content/docs/zh-CN/api-reference/rtm/web/enumv.mdx#presence-事件类型',
    '在线状态事件类型',
  ],
  [
    'content/docs/zh-CN/api-reference/rtc/restful/webhook/receive-webhook.mdx#用户配置',
    '开通消息通知服务',
  ],
  [
    'content/docs/zh-CN/api-reference/whiteboard/fastboard/web/index.mdx#insertdocs',
    'insertdocs1',
  ],
  [
    'content/docs/zh-CN/realtime-media/cloud-recording/reference/api-reference.mdx#录制的音视频流配置项',
    '媒体流输出模式设置',
  ],
  [
    'content/docs/zh-CN/realtime-media/cloud-recording/build/recording-modes/mix-mode/set-composite-layout.mdx#进阶功能：设置背景色或背景图',
    '进阶设置背景色或背景图',
  ],
  [
    'content/docs/zh-CN/realtime-media/local-server-recording/build/implement-core-features/legacy/set-output-video.mdx#分辨率帧率和码率对照表',
    '分辨率帧率码率对照表',
  ],
  [
    'content/docs/zh-CN/realtime-media/local-server-recording/build/setup-and-access/generate-token.mdx#token-code',
    'sample-code',
  ],
  [
    'content/docs/zh-CN/realtime-media/marketplace/reference/iflytek-asr-api.mdx#end',
    'onevent',
  ],
  [
    'content/docs/zh-CN/realtime-media/media-pull/build/setup-and-access/enable-service.mdx#开通服务',
    '开通输入在线媒体流服务',
  ],
  [
    'content/docs/zh-CN/realtime-media/media-pull/reference/quota.mdx#api-限速',
    '调用频率限制',
  ],
  [
    'content/docs/zh-CN/realtime-media/media-push/build/manage-media-streams/set-volume.mdx#更新音量',
    '更新混音音量',
  ],
  [
    'content/docs/zh-CN/realtime-media/media-push/reference/quota.mdx#api-限速',
    '调用频率限制',
  ],
  [
    'content/docs/zh-CN/realtime-media/rtc/get-started/quick-start.mdx#实现流程',
    '实现步骤',
  ],
  [
    'content/docs/zh-CN/realtime-media/rtmp-gateway/reference/quota.mdx#api-限速',
    '调用频率限制',
  ],
  [
    'content/docs/zh-CN/realtime-media/whiteboard/fastboard-sdk/build/manage-whiteboard/customize-widget.mdx#内置控件源码',
    '内置-ui-控件源码',
  ],
  [
    'content/docs/zh-CN/realtime-media/whiteboard/index.mdx#如何选择白板-sdk-和-fastboard-sdk',
    '如何选择互动白板-sdk-和-fastboard-sdk',
  ],
  [
    'content/docs/zh-CN/solutions/flexible-classroom/get-started/integrate.mdx#maven-依赖集成',
    '集成教育场景',
  ],
  [
    'content/docs/zh-CN/solutions/flexible-classroom/build/setup-and-access/enable.mdx#创建声网开发者账号',
    '登录声网控制台',
  ],
  [
    'content/docs/zh-CN/solutions/game-voice/build/setup-and-access/enable-service.mdx#创建游戏语音项目',
    '创建项目',
  ],
  [
    'content/docs/zh-CN/solutions/iot-apaas/index.mdx#设备端',
    '功能和场景',
  ],
  [
    'content/docs/zh-CN/solutions/iot-apaas/build/setup-and-access/license.mdx#license-激活',
    'activate',
  ],
  [
    'content/docs/zh-CN/solutions/meta-world/reference/meta-api.mdx#scenadiaplayconfig',
    'scenedisplayconfig',
  ],
  [
    'content/docs/zh-CN/solutions/meta-world/reference/meta-api.mdx#agorametaceneinfo',
    'agorametasceneinfo',
  ],
  [
    'content/docs/zh-CN/solutions/meta-world/reference/meta-api.mdx#agormetasceneinfo',
    'agorametasceneinfo',
  ],
  [
    'content/docs/zh-CN/solutions/showroom/build/setup-and-access/enable-service.mdx#获取客户-id-和客户密钥',
    '获取客户-id-与客户密钥',
  ],
]);

const EXACT_LINK_OVERRIDES = new Map([
  [
    '/api-ref/recording//overview',
    '/zh-CN/api-reference/local-server-recording/cpp/legacy/overview',
  ],
  [
    '/api-ref/rtc/android/API/toc_mediaplayer#api_irtcengine_destroymediaplayer',
    '/zh-CN/api-reference/rtc/android/play/mediaplayer/mediaplayer-initialize#api_imediaplayer_destroy_imediaplayer',
  ],
  [
    '/api-ref/rtc/android/API/enum_musiccontentcenterstatereason',
    '/zh-CN/api-reference/rtc/android/class-musiccontentcenterstatereason',
  ],
  [
    '/api-ref/rtc/android/API/enum_musiccachestatustype',
    '/zh-CN/api-reference/rtc/android/class-musiccachestatustype',
  ],
  [
    '/api-ref/rtm2//toc-configuration/configuration#事件监听',
    '/zh-CN/api-reference/rtm/toc-configuration/configuration#事件监听',
  ],
  [
    '/api-ref/rtm2//toc-configuration/configuration',
    '/zh-CN/api-reference/rtm/toc-configuration/configuration',
  ],
  [
    '/api-ref/rtm2//toc-topic/topic',
    '/zh-CN/api-reference/rtm/toc-topic/topic',
  ],
  [
    'https://docportal.shengwang.cn/cn/Real-time-Messaging/landing-page?platform=Android',
    '/zh-CN/realtime-media/rtm',
  ],
  [
    'https://docportal.shengwang.cn/cn/Real-time-Messaging/messaging_android?platform=Android',
    '/zh-CN/realtime-media/rtm/get-started/quick-start',
  ],
  [
    'https://docportal.shengwang.cn/cn/Real-time-Messaging/api-ref?platform=All%20Platforms',
    '/zh-CN/api-reference/rtm/android',
  ],
  [
    'https://docportal.shengwang.cn/cn/Real-time-Messaging/product_rtm?platform=All%20Platforms',
    '/zh-CN/realtime-media/rtm',
  ],
  [
    'https://docportal.shengwang.cn/cn/media-push/streaming_restful?platform=All%20Platforms',
    '/zh-CN/api-reference/media-push/restful/overview/product-overview',
  ],
  [
    'https://docportal.shengwang.cn/cn/smart_doorbell/landing-page?platform=Android',
    '/zh-CN/solutions/smart-doorbell',
  ],
  [
    'https://docportal.shengwang.cn/cn/live-streaming-premium-4.x/API%20Reference/java_ng/API/toc_core_method.html#api_irtcengine_joinchannel2',
    '/zh-CN/api-reference/rtc/android/channel#api_irtcengine_joinchannel2',
  ],
  [
    'https://docportal.shengwang.cn/cn/live-streaming-premium-4.x/API%20Reference/java_ng/API/toc_core_method.html#api_irtcengine_create',
    '/zh-CN/api-reference/rtc/android/initialize#api_irtcengine_create',
  ],
  [
    'https://docportal.shengwang.cn/cn/live-streaming-premium-4.x/API%20Reference/ios_ng/API/rtc_api_overview_ng.html',
    '/zh-CN/api-reference/rtc/ios/rtc-api-overview',
  ],
  [
    'https://docportal.shengwang.cn/cn/live-streaming-premium-4.x/API%20Reference/ios_ng/API/toc_core_method.html#api_irtcengine_joinchannel',
    '/zh-CN/api-reference/rtc/ios/channel#api_irtcengine_joinchannel1',
  ],
  [
    'https://docportal.shengwang.cn/cn/live-streaming-premium-4.x/API%20Reference/ios_ng/API/toc_core_method.html#api_irtcengine_initialize',
    '/zh-CN/api-reference/rtc/ios/initialize#api_irtcengine_initialize',
  ],
  [
    'https://docs.agora.io/cn/Agora%20Platform/console_overview?platform=All%20Platforms',
    '/zh-CN/introduction/quickstart',
  ],
  [
    'https://docs.agora.io/cn/Agora%20Platform/agora_console_restapi?platform=All%20Platforms',
    '/zh-CN/api-reference/api-ref/console',
  ],
  [
    'https://docs.agora.io/cn/Agora%20Platform/firewall?platform=All%20Platforms#web-sdk',
    '/zh-CN/realtime-media/rtc/build/setup-and-access/firewall',
  ],
  [
    'https://docs.agora.io/cn/Interactive%20Broadcast/cloud_proxy_web?platform=Web',
    '/zh-CN/realtime-media/rtc/build/setup-and-access/firewall#云代理方案',
  ],
  [
    'https://docs.agora.io/cn/Agora%20Platform/security',
    '/zh-CN/introduction/security/best-practice',
  ],
  [
    'https://docs.agora.io/cn/Agora%20Platform/term_agora_rtc_sdk',
    '/zh-CN/realtime-media/rtc/reference/key-concept',
  ],
  [
    'https://docs.agora.io/cn/Agora%20Platform/token#get-an-app-id',
    '/zh-CN/introduction/quickstart#获取开发参数',
  ],
  [
    'https://docs.agora.io/cn/AgoraPlatform/sign_in_and_sign_up',
    '/zh-CN/introduction/quickstart',
  ],
  [
    'https://docs.agora.io/cn/Real-time-Messaging/product_rtm',
    '/zh-CN/realtime-media/rtm',
  ],
  [
    'https://docs.agora.io/cn/Real-time-Messaging/token2_server_rtm',
    '/zh-CN/realtime-media/rtm/build/security-and-auth/token-generation',
  ],
  [
    'https://docs.agora.io/cn/Real-time-Messaging/token2_server_rtm?platform=All%20Platforms',
    '/zh-CN/realtime-media/rtm/build/security-and-auth/token-generation',
  ],
  [
    'https://docs.agora.io/cn/cloud-recording/cloud_recording_layout?platform=Linux',
    '/zh-CN/realtime-media/cloud-recording/build/recording-modes/mix-mode/set-composite-layout',
  ],
  [
    'https://docs.agora.io/cn/cloud-recording/cloud_recording_webpage_mode',
    '/zh-CN/realtime-media/cloud-recording/build/recording-modes/web-mode/set-webpage-recording',
  ],
  [
    'https://docs.agora.io/cn/cloud-recording/cloud_recording_webpage_mode?platform=RESTful',
    '/zh-CN/realtime-media/cloud-recording/build/recording-modes/web-mode/set-webpage-recording',
  ],
  [
    'https://docs.agora.io/cn/cloud-transcoding/cloud_transcoder?platform=All%20Platforms#query：查询-cloud-transcoder-状态信息',
    '/zh-CN/api-reference/api-ref/cloud-transcoding/query',
  ],
  [
    'https://docs.agora.io/cn/live-streaming-premium-4.x/API%20Reference/ios_ng/API/rtc_api_data_type.html#class_externalvideoframe',
    '/zh-CN/api-reference/rtc/ios/class-externalvideoframe',
  ],
  [
    'https://docs.agora.io/cn/live-streaming-premium-4.x/API%20Reference/java_ng/API/rtc_api_data_type.html#class_externalvideoframe',
    '/zh-CN/api-reference/rtc/android/class-externalvideoframe',
  ],
  [
    'https://docs.agora.io/cn/live-streaming-premium-legacy/mediaplayer_win?platform=Windows',
    '/zh-CN/realtime-media/rtc/build/audio/media-player',
  ],
  [
    'https://docs.agora.io/cn/live-streaming-premium-legacy/web_sdk_compatibility?platform=Web#移动端',
    '/zh-CN/realtime-media/rtc/reference/browser-compatibility',
  ],
  [
    'https://docs.agora.io/cn/online-ktv/ktv_overview',
    '/zh-CN/solutions/online-ktv',
  ],
  [
    'https://docs.agora.io/cn/whiteboard/file_conversion_overview?platform=RESTful',
    '/zh-CN/realtime-media/whiteboard/fastboard-sdk/build/extend-whiteboard/convert-files',
  ],
  [
    'https://docs.agora.io/cn/whiteboard/whiteboard_file_conversion?platform=RESTful#查询转换任务的进度',
    '/zh-CN/api-reference/api-ref/whiteboard/restful/start-file-conversion',
  ],
  [
    '/doc/rtc/restful/channel-management/operations/get-dev-v1-channel-user-appid-channelName-hosts_only',
    '/zh-CN/api-reference/api-ref/rtc/query-host-list',
  ],
  [
    '/doc/recording/cpp/advanced-features/merge-files',
    '/zh-CN/realtime-media/local-server-recording/build/implement-core-features/legacy/merge-files',
  ],
  [
    '/doc/recording/java/advanced-features/merge-files',
    '/zh-CN/realtime-media/local-server-recording/build/implement-core-features/legacy/merge-files',
  ],
  [
    '/doc/danmaku/restful/danmaku/operations/get-cloud-game-list',
    '/zh-CN/api-reference/api-ref/danmaku/get-cloud-game-list',
  ],
  [
    '/doc/danmaku/restful/danmaku/operations/start-pc-game',
    '/zh-CN/api-reference/api-ref/danmaku/start-pc-game',
  ],
  [
    '/doc/danmaku/restful/danmaku/operations/push-message',
    '/zh-CN/api-reference/api-ref/danmaku/push-message',
  ],
  [
    '/doc/analytics/general/restful-aa/operations/get-beta-insight-quality-by_time',
    '/zh-CN/api-reference/api-ref/agora-analytics/insight-quality-time',
  ],
  [
    '/doc/analytics/general/restful-aa/operations/post-beta-insight-usage-aggregation',
    '/zh-CN/api-reference/api-ref/agora-analytics/insight-usage-aggregation',
  ],
  [
    '/doc/analytics/general/restful-aa/operations/post-beta-insight-quality-aggregation',
    '/zh-CN/api-reference/api-ref/agora-analytics/insight-quality-aggregation',
  ],
  [
    '/doc/analytics/general/restful-aa/operations/get-beta-realtime-usage-dimension-top20',
    '/zh-CN/api-reference/api-ref/agora-analytics/realtime-usage-top20',
  ],
  [
    '/doc/analytics/general/restful-aa/operations/get-beta-realtime-quality-dimension-top20',
    '/zh-CN/api-reference/api-ref/agora-analytics/realtime-quality-top20',
  ],
  [
    '/doc/speech-to-text/RESTful/v7/operations/get-task-list',
    '/zh-CN/api-reference/api-ref/speech-to-text/list',
  ],
  ['/doc/rtc/homepage', '/zh-CN/realtime-media/rtc'],
  [
    '/doc/rtc//basic-features/audio-quick-start',
    '/zh-CN/realtime-media/rtc/get-started/quick-start',
  ],
  [
    '/doc/rtc//basic-features/channel-connection',
    '/zh-CN/realtime-media/rtc/build/initialize-and-channel/channel-connection',
  ],
  [
    '/doc/rtc//basic-features/volume',
    '/zh-CN/realtime-media/rtc/build/audio/volume',
  ],
  [
    '/doc/rtc//advanced-features/in-call-quality',
    '/zh-CN/realtime-media/rtc/build/optimize-and-operate/in-call-quality',
  ],
  [
    '/doc/rtc//advanced-features/voice-changer',
    '/zh-CN/realtime-media/rtc/build/audio/voice-changer',
  ],
  [
    '/doc/rtc//advanced-features/spatial-audio',
    '/zh-CN/realtime-media/rtc/build/audio/spatial-audio',
  ],
  [
    '/doc/rtc//advanced-features/content-inspect',
    '/zh-CN/realtime-media/rtc/build/video/content-inspect',
  ],
  [
    '/doc/rtc//advanced-features/custom-video-source',
    '/zh-CN/realtime-media/rtc/build/video/custom-video-source',
  ],
  [
    '/doc/rtc//best-practice/prevent-stream-bombing',
    '/zh-CN/realtime-media/rtc/build/security-and-auth/prevent-stream-bombing',
  ],
  ['/doc/online-ktv//landing-page', '/zh-CN/solutions/online-ktv'],
  [
    '/doc/online-ktv/android/implementation/music-content-center',
    '/zh-CN/solutions/online-ktv/ktv-scenario/build/extend-karaoke/get-music',
  ],
  [
    '/doc/online-ktv/ios/implementation/music-content-center',
    '/zh-CN/solutions/online-ktv/ktv-scenario/build/extend-karaoke/get-music',
  ],
  [
    '/doc/online-ktv/android/overview/introduction#方案对比',
    '/zh-CN/solutions/online-ktv/ktv-scenario/reference/solution-compare',
  ],
  [
    '/doc/whiteboard//landing-page',
    '/zh-CN/realtime-media/whiteboard/fastboard-sdk',
  ],
  [
    '/doc/whiteboard//whiteboard-sdk/landing-page',
    '/zh-CN/realtime-media/whiteboard/whiteboard-sdk',
  ],
  [
    '/doc/whiteboard/android/overview/billing',
    '/zh-CN/realtime-media/whiteboard/fastboard-sdk/reference/billing',
  ],
]);

const RTC_GUIDE_OVERRIDES = [
  ['start_live_', '/zh-CN/realtime-media/rtc/get-started/quick-start'],
  [
    'multiple_channel_',
    '/zh-CN/realtime-media/rtc/build/advanced-channel/multiple-channel',
  ],
  ['screensharing_', '/zh-CN/realtime-media/rtc/build/video/screen-share'],
  [
    'custom_audio_',
    '/zh-CN/realtime-media/rtc/build/audio/custom-audio-source',
  ],
  [
    'custom_video_',
    '/zh-CN/realtime-media/rtc/build/video/custom-video-source',
  ],
];

const LEGACY_PLATFORM_ROUTES = new Map([
  ['javascript', 'web'],
  ['rn', 'react-native'],
  ['unreal-blueprint', 'blueprint'],
  ['windows', 'cpp-all-platforms'],
]);

const LEGACY_PRODUCT_ROUTES = new Map([
  ['flexible-classroom', 'flexible-classroom'],
  ['recording', 'local-server-recording'],
  ['rtc', 'rtc'],
  ['rtc-server-sdk', 'rtc-server-sdk'],
  ['rtm2', 'rtm'],
  ['rtsa', 'rtsa'],
  ['whiteboard', 'whiteboard/whiteboard-sdk'],
]);

function parseArgs(argv) {
  const options = { mode: 'write' };

  for (const argument of argv) {
    if (argument === '--check') options.mode = 'check';
    else if (argument === '--archive-unresolved') options.mode = 'archive';
    else if (argument === '--help' || argument === '-h') {
      console.log(
        'Usage: node scripts/normalize-cn-api-links.mjs [--check|--archive-unresolved]',
      );
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  return options;
}

async function listMarkdownFiles(root) {
  const files = [];

  async function visit(directory) {
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);

      if (entry.isDirectory()) await visit(absolute);
      else if (/\.mdx?$/i.test(entry.name)) files.push(absolute);
    }
  }

  await visit(root);
  return files.sort();
}

function posix(value) {
  return value.split(path.sep).join('/');
}

function countOccurrences(line, href) {
  let count = 0;
  let offset = 0;
  let index = line.indexOf(href, offset);

  while (index !== -1) {
    count += 1;
    offset = index + href.length;
    index = line.indexOf(href, offset);
  }

  return count;
}

function decode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function comparisonKey(value) {
  return decode(String(value ?? ''))
    .toLowerCase()
    .replace(/\.html?$/i, '')
    .replace(/[^a-z0-9]+/g, '');
}

function legacyPageKey(value) {
  return comparisonKey(value).replace(/^toc/, '');
}

function candidatePages(fragmentIndex, targetRoot) {
  const candidates = [];

  for (const [route, page] of fragmentIndex.routes) {
    if (route === targetRoot || route.startsWith(`${targetRoot}/`)) {
      candidates.push({ ...page, route });
    }
  }

  const current = candidates.filter((candidate) =>
    candidate.targetPath.includes('/(current)/'),
  );
  return current.length > 0 ? current : candidates;
}

async function fragmentMatches(candidates, fragment, fragmentIndex) {
  const exactMatches = [];
  const fuzzyMatches = [];
  const requested = decode(fragment);
  const requestedLower = requested.toLowerCase();

  for (const candidate of candidates) {
    const anchors = await fragmentIndex.anchorsFor(candidate.route);
    if (!anchors) continue;
    const exact = [...anchors].find(
      (anchor) => anchor.toLowerCase() === requestedLower,
    );
    if (exact) {
      exactMatches.push({ anchor: exact, route: candidate.route });
      continue;
    }
    const fuzzy = findBestFragmentAnchor(anchors, requested);
    if (fuzzy) fuzzyMatches.push({ anchor: fuzzy, route: candidate.route });
  }

  return exactMatches.length > 0 ? exactMatches : fuzzyMatches;
}

export async function resolveLegacyApiReferenceHref(href, { fragmentIndex }) {
  let url;
  try {
    url = new URL(href, 'https://doc.shengwang.cn');
  } catch {
    return null;
  }

  const match = url.pathname.match(
    /^\/api-ref\/([^/]+)\/([^/]*)\/(?:API\/)?(.+)$/i,
  );
  if (!match) return null;

  const product = match[1].toLowerCase();
  const legacyPlatform = match[2].toLowerCase();
  const productRoute = LEGACY_PRODUCT_ROUTES.get(product);
  if (!productRoute || !legacyPlatform) return null;

  const platform = LEGACY_PLATFORM_ROUTES.get(legacyPlatform) ?? legacyPlatform;
  const targetRoot = `/zh-CN/api-reference/${productRoute}/${platform}`;
  const candidates = candidatePages(fragmentIndex, targetRoot);
  if (candidates.length === 0) return null;

  const legacyPage = match[3].split('/').at(-1);
  const pageKey = legacyPageKey(legacyPage);
  const fileMatches = candidates.filter(
    (candidate) =>
      legacyPageKey(
        path.posix.basename(
          candidate.targetPath,
          path.extname(candidate.targetPath),
        ),
      ) === pageKey,
  );
  const requestedFragment = url.hash ? decode(url.hash.slice(1)) : null;

  if (!requestedFragment && fileMatches.length === 1) {
    return fileMatches[0].route;
  }

  const requestedAnchor = requestedFragment ?? legacyPage;
  const preferredMatches = await fragmentMatches(
    fileMatches,
    requestedAnchor,
    fragmentIndex,
  );
  const matches =
    preferredMatches.length > 0
      ? preferredMatches
      : await fragmentMatches(candidates, requestedAnchor, fragmentIndex);

  if (matches.length === 1) {
    return `${matches[0].route}#${matches[0].anchor}`;
  }
  if (requestedFragment && fileMatches.length === 1) {
    return `${fileMatches[0].route}#${requestedFragment}`;
  }
  return null;
}

function exactOverrideForHref(href) {
  const exact = EXACT_LINK_OVERRIDES.get(href);
  if (exact) return exact;

  let url;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  if (
    url.hostname !== 'docs.agora.io' ||
    !url.pathname.startsWith('/cn/live-streaming-premium-legacy/')
  ) {
    return null;
  }

  const slug = url.pathname.split('/').at(-1)?.toLowerCase() ?? '';
  return (
    RTC_GUIDE_OVERRIDES.find(([prefix]) => slug.startsWith(prefix))?.[1] ?? null
  );
}

async function validateLocalFragment(href, fragmentIndex) {
  if (!href.startsWith('/zh-CN/') || !href.includes('#')) return href;
  const hashIndex = href.indexOf('#');
  const route = href.slice(0, hashIndex).replace(/\/$/, '');
  const requested = decode(href.slice(hashIndex + 1));
  const anchors = await fragmentIndex.anchorsFor(route);
  if (!anchors) return null;
  const mapped = findBestFragmentAnchor(anchors, requested);
  return mapped ? `${route}#${mapped}` : href;
}

async function resolveLegacyHref(href, { fragmentIndex, routeMap }) {
  let targetHref = exactOverrideForHref(href);

  if (!targetHref) {
    targetHref = await resolveLegacyApiReferenceHref(href, { fragmentIndex });
  }

  if (!targetHref) {
    const mapped = rewriteLegacyHref(href, {
      routeMap,
      sourceUrl: 'https://doc.shengwang.cn',
    });
    if (mapped.warning) return null;
    targetHref = mapped.href;
  }

  return targetHref ? validateLocalFragment(targetHref, fragmentIndex) : null;
}

async function rewriteResolvableLinks(
  source,
  { cache, fragmentIndex, routeMap, sourcePath },
) {
  const changes = [];
  let pending = source;
  const hrefs = new Set(
    findLegacyBodyLinks(source, { sourcePath })
      .filter((link) => !isApprovedLegacyFallback(sourcePath, link.href))
      .map((link) => link.href),
  );

  for (const href of hrefs) {
    if (!cache.has(href)) {
      cache.set(href, resolveLegacyHref(href, { fragmentIndex, routeMap }));
    }
    const targetHref = await cache.get(href);
    if (!targetHref) continue;

    const rewritten = reconcileMappedBodyLink(pending, {
      fromHref: href,
      sourcePath,
      toHref: targetHref,
    });
    pending = rewritten.source;
    changes.push(...rewritten.changes);
  }

  return { changes, source: pending };
}

function unresolvedLocations(source, sourcePath, links) {
  const remainingByHref = new Map();

  for (const link of links) {
    remainingByHref.set(link.href, (remainingByHref.get(link.href) ?? 0) + 1);
  }

  const locations = [];
  const lines = source.split(/\r?\n/);

  for (const [index, line] of lines.entries()) {
    for (const [href, remaining] of remainingByHref) {
      if (remaining === 0 || !line.includes(href)) continue;
      const found = Math.min(remaining, countOccurrences(line, href));

      for (let occurrence = 0; occurrence < found; occurrence += 1) {
        locations.push({ href, line: index + 1, sourcePath });
      }

      remainingByHref.set(href, remaining - found);
    }
  }

  return locations;
}

function escapeTableCell(value) {
  return String(value).replaceAll('|', '\\|');
}

function isLegacyDocHostHref(href) {
  try {
    return LEGACY_DOC_HOSTS.has(new URL(href).hostname);
  } catch {
    return false;
  }
}

export function isApprovedLegacyFallback(sourcePath, href) {
  return APPROVED_LEGACY_FALLBACKS.has(`${sourcePath}\0${href}`);
}

export function isApiRelatedMissingInternal(entry) {
  const target = entry.normalizedHref ?? entry.href ?? '';
  return (
    entry.sourcePath.startsWith('zh-CN/api-reference/') ||
    (entry.sourcePath.startsWith('openapi/') &&
      /\.zh-CN\.ya?ml$/i.test(entry.sourcePath)) ||
    /\/(?:api-reference|api-ref)(?:\/|#|$)/i.test(target)
  );
}

export function renderReport(
  entries,
  archivedEntries = [],
  approvedLegacyFallbacks = [],
) {
  const legacyHostLinks = entries.filter((entry) =>
    isLegacyDocHostHref(entry.href),
  ).length;
  const allEntries = [
    ...entries,
    ...archivedEntries,
    ...approvedLegacyFallbacks,
  ];
  const statusText =
    entries.length > 0
      ? 'Active unresolved links still exist in published content. Archived unavailable targets were removed as links while preserving their original location and URL for content-owner review.'
      : 'No active unresolved links remain in published content. Verified legacy fallbacks remain clickable by explicit content-owner request; archived unavailable targets remain as text for review.';
  const lines = [
    '# CN API unresolved links',
    '',
    '> Generated by `bun run docs:links:cn-api:normalize`. Do not edit by hand.',
    '',
    `- Active unresolved link occurrences: ${entries.length}`,
    `- Unapproved legacy doc-host link occurrences: ${legacyHostLinks}`,
    `- Approved legacy fallback link occurrences: ${approvedLegacyFallbacks.length}`,
    `- Missing local page occurrences: ${entries.filter((entry) => entry.reason === 'missing-local-page').length}`,
    `- Missing local anchor occurrences: ${entries.filter((entry) => entry.reason === 'missing-local-anchor').length}`,
    `- Archived unavailable target occurrences: ${archivedEntries.length}`,
    '',
    statusText,
    '',
    '## Locations',
    '',
  ];

  if (allEntries.length === 0) {
    lines.push('- None.', '');
    return `${lines.join('\n')}\n`;
  }

  lines.push('| Location | Link | Reason |', '| --- | --- | --- |');
  for (const entry of allEntries) {
    lines.push(
      `| \`${escapeTableCell(entry.sourcePath)}:${entry.line}\` | \`${escapeTableCell(entry.href)}\` | ${entry.reason} |`,
    );
  }
  lines.push('');
  return `${lines.join('\n')}\n`;
}

async function readArchivedUnresolved(repoRoot, archivePath = ARCHIVE_PATH) {
  try {
    const archive = JSON.parse(
      await fs.readFile(path.join(repoRoot, archivePath), 'utf8'),
    );
    if (archive.version !== 1 || !Array.isArray(archive.entries)) {
      throw new Error(`Unsupported CN API unavailable-link archive: ${archivePath}`);
    }
    return archive.entries;
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

async function writeArchivedUnresolved(
  repoRoot,
  entries,
  archivePath = ARCHIVE_PATH,
) {
  const absolute = path.join(repoRoot, archivePath);
  await fs.mkdir(path.dirname(absolute), { recursive: true });
  await fs.writeFile(
    absolute,
    `${JSON.stringify({ version: 1, entries }, null, 2)}\n`,
  );
}

export function neutralizeUnresolvedBodyLinks(
  source,
  { hrefs, sourcePath = '' },
) {
  let pending = source;
  const changes = [];

  for (const href of new Set(hrefs)) {
    const result = reconcileMappedBodyLink(pending, {
      fromHref: href,
      sourcePath,
      toHref: null,
    });
    pending = result.source;
    changes.push(...result.changes);
  }

  const remaining = findLegacyBodyLinks(pending, { sourcePath }).filter(
    (link) => hrefs.includes(link.href),
  );
  if (remaining.length > 0) {
    throw new Error(
      `Cannot safely render ${remaining.length} unresolved links as text in ${sourcePath}`,
    );
  }

  return { changes, source: pending };
}

async function archiveUnresolvedBodyLinks(entries, repoRoot) {
  const grouped = new Map();
  for (const entry of entries) {
    const hrefs = grouped.get(entry.sourcePath) ?? [];
    hrefs.push(entry.href);
    grouped.set(entry.sourcePath, hrefs);
  }

  const updates = [];
  let archivedLinks = 0;
  for (const [sourcePath, hrefs] of grouped) {
    const absolute = path.join(repoRoot, sourcePath);
    const current = await fs.readFile(absolute, 'utf8');
    const result = neutralizeUnresolvedBodyLinks(current, {
      hrefs,
      sourcePath,
    });
    if (result.source === current) continue;
    updates.push({ absolute, source: result.source, sourcePath });
    archivedLinks += result.changes.length;
  }

  await Promise.all(
    updates.map(({ absolute, source }) => fs.writeFile(absolute, source)),
  );
  return {
    archivedLinks,
    changedFiles: updates.map(({ sourcePath }) => sourcePath),
  };
}

async function buildRouteMap(repoRoot) {
  const manifest = JSON.parse(
    await fs.readFile(
      path.join(repoRoot, 'docs/migration/api-center-html-manifest.json'),
      'utf8',
    ),
  );
  const pathMapRows = parseCsv(
    await fs.readFile(
      path.join(repoRoot, 'docs/migration/path-map.csv'),
      'utf8',
    ),
  );

  return buildLegacyRouteMap(
    manifest,
    pathMapRows,
    await loadFaqMappingRows(repoRoot),
  );
}

async function collectUnresolved(files, repoRoot) {
  const entries = [];

  for (const absolute of files) {
    const source = await fs.readFile(absolute, 'utf8');
    const sourcePath = posix(path.relative(repoRoot, absolute));
    const links = findLegacyBodyLinks(source, { sourcePath }).filter(
      (link) => !isApprovedLegacyFallback(sourcePath, link.href),
    );
    entries.push(...unresolvedLocations(source, sourcePath, links));
  }

  return entries.sort(
    (left, right) =>
      left.sourcePath.localeCompare(right.sourcePath) ||
      left.line - right.line ||
      left.href.localeCompare(right.href),
  );
}

async function collectApprovedLegacyFallbacks(files, repoRoot) {
  const entries = [];

  for (const absolute of files) {
    const source = await fs.readFile(absolute, 'utf8');
    const sourcePath = posix(path.relative(repoRoot, absolute));
    const links = findLegacyBodyLinks(source, { sourcePath }).filter((link) =>
      isApprovedLegacyFallback(sourcePath, link.href),
    );
    entries.push(
      ...unresolvedLocations(source, sourcePath, links).map((entry) => ({
        ...entry,
        reason: 'verified-legacy-fallback',
      })),
    );
  }

  return sortUnresolvedEntries(entries);
}

function reportSourcePath(sourcePath) {
  return sourcePath.startsWith('openapi/')
    ? `content/${sourcePath}`
    : `content/docs/${sourcePath}`;
}

function isChineseAuditSource(sourcePath) {
  return (
    sourcePath.startsWith('zh-CN/') ||
    (sourcePath.startsWith('openapi/') && /\.zh-CN\.ya?ml$/i.test(sourcePath))
  );
}

async function collectAuditUnresolved(repoRoot) {
  const stats = auditDocsLinks({
    docsRoot: path.join(repoRoot, 'content/docs'),
    openApiRoot: path.join(repoRoot, 'content/openapi'),
  });
  const grouped = new Map();

  function add(entry, reason) {
    const sourcePath = reportSourcePath(entry.sourcePath);
    const key = `${sourcePath}\0${reason}`;
    const group = grouped.get(key) ?? { links: [], reason, sourcePath };
    group.links.push({ href: entry.href });
    grouped.set(key, group);
  }

  for (const entry of stats.invalidInternalLinks) {
    if (
      entry.reason === 'missing-internal-path' &&
      isChineseAuditSource(entry.sourcePath) &&
      isApiRelatedMissingInternal(entry)
    ) {
      add(entry, 'missing-local-page');
    }
  }

  for (const entry of stats.externalLinkCandidates) {
    const sourcePath = reportSourcePath(entry.sourcePath);
    if (
      isChineseAuditSource(entry.sourcePath) &&
      isLegacyDocHostHref(entry.href) &&
      !isApprovedLegacyFallback(sourcePath, entry.href)
    ) {
      add(entry, 'no-exact-migrated-target');
    }
  }

  const entries = [];
  for (const { links, reason, sourcePath } of grouped.values()) {
    const source = await fs.readFile(path.join(repoRoot, sourcePath), 'utf8');
    entries.push(
      ...unresolvedLocations(source, sourcePath, links).map((entry) => ({
        ...entry,
        reason,
      })),
    );
  }
  return entries;
}

function mergeUnresolvedGroups(...groups) {
  const merged = [];
  const counts = new Map();

  for (const group of groups) {
    const groupCounts = new Map();
    for (const entry of group) {
      const key = `${entry.sourcePath}\0${entry.line}\0${entry.href}`;
      const current = groupCounts.get(key) ?? { count: 0, entry };
      current.count += 1;
      groupCounts.set(key, current);
    }
    for (const [key, { count, entry }] of groupCounts) {
      const existing = counts.get(key) ?? 0;
      for (let index = existing; index < count; index += 1) {
        merged.push(entry);
      }
      counts.set(key, Math.max(existing, count));
    }
  }

  return merged;
}

function sortUnresolvedEntries(entries) {
  return entries.sort(
    (left, right) =>
      left.sourcePath.localeCompare(right.sourcePath) ||
      left.line - right.line ||
      left.href.localeCompare(right.href),
  );
}

function addAliasRequest(aliasRequests, href, sourceRoute, fragmentIndex) {
  const hashIndex = href.indexOf('#');
  if (hashIndex < 0) return;
  const route = href.startsWith('#')
    ? sourceRoute
    : href.slice(0, hashIndex).replace(/\/$/, '');
  const page = fragmentIndex.routes.get(route);
  if (!page) return;
  const requested = decode(href.slice(hashIndex + 1));
  if (!requested) return;
  const requests = aliasRequests.get(page.targetPath) ?? new Map();
  requests.set(
    requested,
    EXACT_FRAGMENT_ALIAS_TARGETS.get(`${page.targetPath}#${requested}`),
  );
  aliasRequests.set(page.targetPath, requests);
}

async function collectUnresolvedFragments(files, repoRoot, fragmentIndex) {
  const entries = [];

  for (const absolute of files) {
    const sourcePath = posix(path.relative(repoRoot, absolute));
    const source = await fs.readFile(absolute, 'utf8');
    const fragments = await rewriteLocalFragmentLinks(source, {
      fragmentIndex,
      preserveUnresolved: true,
      sourceRoute: targetPathToRoute(sourcePath),
    });
    entries.push(
      ...unresolvedLocations(
        source,
        sourcePath,
        fragments.warnings
          .filter((warning) => warning.unresolved)
          .map((warning) => ({ href: warning.from })),
      ).map((entry) => ({ ...entry, reason: 'missing-local-anchor' })),
    );
  }

  return entries;
}

export async function normalizeCnApiLinks({
  mode = 'write',
  repoRoot = process.cwd(),
  reportPath = REPORT_PATH,
  archivePath = ARCHIVE_PATH,
} = {}) {
  const root = path.resolve(repoRoot);
  const files = await listMarkdownFiles(path.join(root, 'content/docs/zh-CN'));
  const routeMap = await buildRouteMap(root);
  const fragmentIndex = await buildLocalFragmentIndex({ repoRoot: root });
  const fallbackCache = new Map();
  const aliasRequests = new Map();
  const changedFiles = new Set();
  let rewrittenLinks = 0;
  let normalizedFragments = 0;
  let insertedAliases = 0;

  for (const absolute of files) {
    const sourcePath = posix(path.relative(root, absolute));
    const current = await fs.readFile(absolute, 'utf8');
    const rewritten = await rewriteResolvableLinks(current, {
      cache: fallbackCache,
      fragmentIndex,
      routeMap,
      sourcePath,
    });
    const fragments = await rewriteLocalFragmentLinks(rewritten.source, {
      fragmentIndex,
      preserveUnresolved: true,
      sourceRoute: targetPathToRoute(sourcePath),
    });
    const pending = fragments.body;
    normalizedFragments += fragments.warnings.filter(
      (warning) => !warning.unresolved,
    ).length;
    for (const warning of fragments.warnings.filter(
      (warning) => warning.unresolved,
    )) {
      addAliasRequest(
        aliasRequests,
        warning.from,
        targetPathToRoute(sourcePath),
        fragmentIndex,
      );
    }

    if (pending === current) continue;
    changedFiles.add(sourcePath);
    rewrittenLinks += rewritten.changes.length;

    if (mode !== 'check') await fs.writeFile(absolute, pending);
  }

  for (const [targetPath, requests] of aliasRequests) {
    const absolute = path.join(root, targetPath);
    const current = await fs.readFile(absolute, 'utf8');
    const aliases = insertFragmentAliases(current, requests.keys(), {
      canonicalAnchors: new Map(
        [...requests].filter(([, canonical]) => canonical),
      ),
    });
    if (aliases.body === current) continue;
    changedFiles.add(targetPath);
    insertedAliases += aliases.inserted.length;
    if (mode !== 'check') await fs.writeFile(absolute, aliases.body);
  }

  if (mode === 'check' && changedFiles.size > 0) {
    throw new Error(
      `${changedFiles.size} Chinese docs files still contain resolvable API or anchor links.`,
    );
  }

  const finalFragmentIndex = await buildLocalFragmentIndex({ repoRoot: root });
  const unresolvedFragments = await collectUnresolvedFragments(
    files,
    root,
    finalFragmentIndex,
  );
  let unresolved = sortUnresolvedEntries(
    mergeUnresolvedGroups(
    (await collectUnresolved(files, root)).map((entry) => ({
      ...entry,
      reason: 'no-exact-migrated-target',
    })),
    unresolvedFragments,
    await collectAuditUnresolved(root),
    ),
  );
  let archivedEntries = sortUnresolvedEntries(
    await readArchivedUnresolved(root, archivePath),
  );
  let archivedLinks = 0;

  if (mode === 'archive' && unresolved.length > 0) {
    const archived = unresolved.map((entry) => ({
      ...entry,
      reason: 'missing-migrated-content',
    }));
    archivedEntries = sortUnresolvedEntries(
      mergeUnresolvedGroups(archivedEntries, archived),
    );
    const neutralized = await archiveUnresolvedBodyLinks(unresolved, root);
    await writeArchivedUnresolved(root, archivedEntries, archivePath);
    archivedLinks = neutralized.archivedLinks;
    for (const sourcePath of neutralized.changedFiles) {
      changedFiles.add(sourcePath);
    }
    unresolved = [];
  }

  const approvedLegacyFallbacks = await collectApprovedLegacyFallbacks(
    files,
    root,
  );
  const report = renderReport(
    unresolved,
    archivedEntries,
    approvedLegacyFallbacks,
  );
  const reportAbsolute = path.join(root, reportPath);

  if (mode === 'check') {
    if (unresolved.length > 0) {
      throw new Error(
        `${unresolved.length} active Chinese API links still have no valid target.`,
      );
    }
    const currentReport = await fs.readFile(reportAbsolute, 'utf8');
    if (currentReport !== report) {
      throw new Error(
        `Generated unresolved-link report is stale: ${reportPath}`,
      );
    }
  } else {
    await fs.mkdir(path.dirname(reportAbsolute), { recursive: true });
    await fs.writeFile(reportAbsolute, report);
  }

  return {
    changedFiles: [...changedFiles],
    archivedLinks,
    archivedEntries,
    approvedLegacyFallbacks,
    insertedAliases,
    normalizedFragments,
    rewrittenLinks,
    unresolved,
  };
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) ===
    path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  try {
    const result = await normalizeCnApiLinks(parseArgs(process.argv.slice(2)));
    console.log(
      `CN API links: ${result.rewrittenLinks} legacy links, ${result.normalizedFragments} fragments, and ${result.insertedAliases} aliases rewritten in ${result.changedFiles.length} files; ${result.unresolved.length} unresolved links remain.`,
    );
  } catch (error) {
    console.error(`normalize-cn-api-links: ${error.message}`);
    process.exitCode = 1;
  }
}
