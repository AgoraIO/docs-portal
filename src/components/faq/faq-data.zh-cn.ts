import type { FaqCategoryId, FaqItem } from './faq-data';

export const FAQ_ZH_CN_ALL_PRODUCTS = '全部产品';
export const FAQ_ZH_CN_ALL_PLATFORMS = '全部平台';

export const zhCnFaqCategories: Array<{
  description: string;
  id: FaqCategoryId;
  label: string;
}> = [
  {
    description: '构建、打包、权限、SDK 设置和接入流程相关问题。',
    id: 'integration-issues',
    label: '集成类',
  },
  {
    description: '音频、视频、渲染和媒体体验相关问题。',
    id: 'quality-issues',
    label: '质量类',
  },
  {
    description: '产品能力、限制、适用场景和服务行为相关问题。',
    id: 'general-product-inquiry',
    label: '产品咨询类',
  },
  {
    description: '账单、用量、发票、套餐和账号管理相关问题。',
    id: 'account-and-billing',
    label: '账号与计费',
  },
  {
    description: '无法归入其他分类的运维或使用问题。',
    id: 'other-issues',
    label: '其他问题',
  },
];

export const zhCnFaqPlatforms = [
  '全部平台',
  'Android',
  'iOS',
  'macOS',
  'JavaScript',
  'Windows',
  'HarmonyOS',
  '小程序',
  'Electron',
  'Unity',
  'Flutter',
  'React Native',
  '服务端 Java',
  '服务端 C++',
  'Unreal (C++)',
  'Unreal (Blueprint)',
  'RESTful',
];

export const zhCnFaqProducts = [
  '全部产品',
  '实时互动',
  '实时消息',
  '灵动课堂',
  '本地服务端录制',
  '互动白板',
  '旁路推流',
  '声动语聊',
  '水晶球',
  '融合 CDN',
  '云端录制',
  '云端转码',
  '对话式 AI 引擎',
  '声网会议',
  'Fastboard',
];

export const zhCnFaqItems: FaqItem[] = [
  {
    category: 'account-and-billing',
    href: '/zh-CN/api-reference/faq/account/billing_account',
    platforms: ['全部平台'],
    products: ['全部产品'],
    summary: '本文介绍声网的账单发布、结算方式和账户冻结规则。',
    title: '什么是账单、结算与账户冻结？',
  },
  {
    category: 'account-and-billing',
    href: '/zh-CN/api-reference/faq/account/billing_basis',
    platforms: ['全部平台'],
    products: ['全部产品', '本地服务端录制', '实时互动', '水晶球'],
    summary:
      'RTC 领域，有两种不同的计时方式：按频道人数计时和按流计时。目前声网使用的是按频道人数计时的方式。',
    title: '按频道人数计时和按流计时有什么区别？',
  },
  {
    category: 'account-and-billing',
    href: '/zh-CN/api-reference/faq/account/billing_free',
    platforms: ['全部平台'],
    products: ['全部产品', '实时互动', '云端录制'],
    summary:
      '声网会给予每个声网开发者账号每个月一万分钟的免费时长，按照以下顺序从总分钟数扣除：',
    title: '每月一万分钟免费说明',
  },
  {
    category: 'account-and-billing',
    href: '/zh-CN/api-reference/faq/account/billing_package',
    platforms: ['全部平台'],
    products: ['全部产品'],
    summary: '1. 前往控制台创建账号、登录并创建声网项目。',
    title: '套餐包常见问题合集',
  },
  {
    category: 'account-and-billing',
    href: '/zh-CN/api-reference/faq/account/console_account_faq',
    platforms: ['全部平台'],
    products: ['全部产品'],
    summary: '本文介绍如何处理控制台使用过程中的常见问题。',
    title: '如何处理声网账号问题？',
  },
  {
    category: 'account-and-billing',
    href: '/zh-CN/api-reference/faq/account/coupon_code',
    platforms: ['全部平台'],
    products: ['全部产品', '实时互动'],
    summary: '本文介绍如何在购买套餐包时使用优惠抵扣码。',
    title: '如何使用套餐包抵扣码？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/abnormal_exit',
    platforms: ['全部平台', 'RESTful'],
    products: ['全部产品', '云端录制'],
    summary:
      '集成云端录制的应用崩溃，不会影响录制进程。你仍然可以使用当前录制进程的 Resource ID 和录制 ID 控制录制实例，例如查询录制状态或者停止录制。',
    title: '应用崩溃后对云端录制有什么影响？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/acquire_file_directory',
    platforms: ['全部平台', 'RESTful'],
    products: ['全部产品', '云端录制'],
    summary:
      '完整的 M3U8 文件地址由云存储空间外链域名和 M3U8 文件名组成，一般在你的第三方云存储里可以直接复制。',
    title: '如何获取 M3U8 文件地址？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/agora_class_custom_properties',
    platforms: ['全部平台', 'Android', 'iOS', 'JavaScript', 'Electron'],
    products: ['全部产品', '灵动课堂'],
    summary:
      '灵动课堂支持自定义用户属性，课堂属性和 widget 属性。你可以结合自身的业务需求，设置任意课堂属性，灵动课堂会将这个属性的变更同步到所有端，以此来实现你自己的扩展业务。',
    title: '如何自定义用户属性，课堂属性和 widget 属性？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/allow_haptics',
    platforms: ['全部平台', 'iOS'],
    products: ['全部产品', '实时互动'],
    summary:
      '媒体音量下，调用苹果 API setAllowHapticsAndSystemSoundsDuringRecording 设置录制音频时允许震动不生效。',
    title: '为什么媒体音量下，设置录制时允许震动不生效？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/android_audio_routing_change',
    platforms: ['全部平台', 'Android'],
    products: ['全部产品', '实时互动'],
    summary:
      '在 Android 设备上使用集成了声网 RTC SDK 的 App （以下简称 SDK App）进行实时音视频互动，切换到其他有音频输入或输出的 App，再切换回 SDK App 之后 SDK 的音频路由发生改变。',
    title: '为什么在 Android 设备上切换到其他 App 会改变音频路由？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/android_startaudiomixing_permission',
    platforms: ['全部平台', 'Android'],
    products: ['全部产品', '实时互动'],
    summary:
      'Android 9 手机上，调用 startAudioMixing 或 playEffect 无法播放音频文件。',
    title:
      '为什么 Android 9 无法使用 startAudioMixing 或 playEffect 播放音频文件？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/appid_to_token',
    platforms: ['全部平台'],
    products: ['全部产品', '实时互动'],
    summary:
      '为提高项目的安全性，Agora 会逐步取消对 App ID 鉴权方案的支持。对于创建时选择 APP ID 为鉴权机制的项目，你可以参考本文升级到 Token 鉴权方案。',
    title: '如何升级到 Token 鉴权方案？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/audience_event',
    platforms: ['全部平台'],
    products: ['全部产品', '实时互动'],
    summary:
      '目前，声网没有在 RTC SDK 中提供监听远端观众加入或离开频道事件的回调。你可以通过消息通知服务提供的事件通知。',
    title: '直播场景下，如何监听远端观众角色用户加入/离开频道的事件？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/bucket_region',
    platforms: ['全部平台', 'RESTful'],
    products: ['全部产品', '云端录制'],
    summary: '目前云端录制支持以下云存储厂商：',
    title: '如何选择云存储 bucket 区域及处理跨区上传问题？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/call_duration',
    platforms: ['全部平台'],
    products: ['全部产品', '实时互动'],
    summary:
      '在一个通话中，某个用户可能多次加入和离开 RTC 频道，该用户累计在频道内的时间为该用户的通话时长。通过声网 RTC SDK 或水晶球，你可以获取用户的通话时长。',
    title: '如何获取用户的通话时长？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/camera_exposure_focus',
    platforms: ['全部平台', 'Android', 'iOS'],
    products: ['全部产品', '实时互动'],
    summary:
      '视频场景中，经常会使用到摄像头曝光和对焦的功能，帮助被拍摄物成像清晰、亮度适宜。声网 RTC SDK 在移动平台提供整套的摄像头管理方法，方便用户切换前后摄像头，并对摄像头的缩放、对焦和曝光进行设置。',
    title: '如何实现摄像头曝光和对焦？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/cant_upload_courseware',
    platforms: ['全部平台', 'Android', 'iOS', 'JavaScript', 'Electron'],
    products: ['全部产品', '灵动课堂'],
    summary:
      '如果在上传课件时收到报错 403 Forbidden，请检查是否已正确配置白板功能，并确保声网可以访问你的云存储空间，详见注意事项。',
    title: '为什么无法上传课件？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/channel',
    platforms: ['全部平台'],
    products: ['全部产品', '实时互动'],
    summary:
      'SDK 不会让用户自动退出频道，除非用户自己主动退出，例如 App 调用 leaveChannel。',
    title: '如何处理频道相关常见问题？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/chat_issues',
    platforms: ['全部平台', 'Android', 'iOS', 'JavaScript', 'Electron'],
    products: ['全部产品', '灵动课堂'],
    summary:
      '如果用户无法在课堂中使用即时聊天功能，或课堂已集成环信 IM 却无法登录系统，需要参照配置环信 IM 检查控制台中环信相关的配置是否正确。如果配置不正确，环信相关插件无法正常使用。',
    title: '如何处理 IM 相关问题？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/class_custom_ui',
    platforms: ['全部平台', 'Android', 'iOS', 'JavaScript', 'Electron'],
    products: ['全部产品', '灵动课堂'],
    summary:
      '如果想修改教室背景，例如去掉黑色背景色，可修改 packages/agora-classroom-sdk/src/infra/capabilities/containers/root-box/fixed-aspect-ratio.tsx 文件中的代码。',
    title: '如何自定义课堂 UI？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/class_packaging',
    platforms: ['全部平台', 'Electron'],
    products: ['全部产品', '灵动课堂'],
    summary: '使用 Mac 电脑打包灵动课堂 Windows 安装包的步骤如下：',
    title: 'Mac 电脑如何打包 Windows 安装包？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/class_recording_fails',
    platforms: ['全部平台', 'Android', 'iOS', 'JavaScript', 'Electron'],
    products: ['全部产品', '灵动课堂'],
    summary: '发生录制失败时，你可以参考如下步骤排查故障原因：',
    title: '课堂录制失败怎么办？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/classroom_statuses',
    platforms: ['全部平台', 'Android', 'iOS', 'JavaScript', 'Electron'],
    products: ['全部产品', '灵动课堂'],
    summary: '灵动课堂有以下几种课堂状态：',
    title: '灵动课堂有哪些课堂状态？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/cmd_control_record',
    platforms: ['全部平台', '服务端 C++', '服务端 Java'],
    products: ['全部产品', '本地服务端录制'],
    summary: '在使用命令行录制过程中，你可以参考如下内容控制录制进程。',
    title: '当使用命令行录制时，如何控制录制进程？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/cocoapods_problems',
    platforms: ['全部平台', 'iOS', 'macOS'],
    products: ['全部产品', '实时互动'],
    summary:
      '一般的原因有：未安装 CocoaPods、安装 CocoaPods 时由于网络连接问题导致操作超时、本地 CocoaPods 仓库过时。',
    title: '如何处理 CocoaPods 常见问题？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/common_mistakes_flexible_classroom',
    platforms: ['全部平台', 'Android', 'iOS', 'JavaScript', 'Electron'],
    products: ['全部产品', '灵动课堂'],
    summary: '如果你在运行灵动课堂 Web 项目时碰到以下报错：',
    title: '集成和使用灵动课堂过程中的常见错误',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/console_error_web',
    platforms: ['全部平台', 'JavaScript'],
    products: ['全部产品', '实时互动'],
    summary:
      '将 Web SDK 集成到你的 Web 应用后，遇到问题时可以通过浏览器控制台打印的日志进行调试。本文列出控制台日志中常见的错误和原因。',
    title: '如何处理常见的 Web 浏览器控制台报错？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/convoai_cloud_recording',
    platforms: ['全部平台', 'RESTful'],
    products: ['全部产品', '对话式 AI 引擎'],
    summary:
      '本文介绍在集成声网云端录制服务与声网对话式 AI 引擎时，如何通过配置解决可能出现的音频体验不一致问题。',
    title: '使用云端录制功能录制 AI 对话时，如何优化音频体验？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/dynamic_or_static_library',
    platforms: ['全部平台'],
    products: ['全部产品', '实时互动'],
    summary:
      '声网实时互动 SDK 的早期版本在部分平台提供静态库，但在实际使用过程中，我们发现使用静态库存在以下问题：',
    title: '为什么 SDK 中使用的是动态库而不是静态库？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/dynamic_storage_path',
    platforms: [
      '全部平台',
      'Android',
      'iOS',
      'JavaScript',
      'Electron',
      'macOS',
      'Windows',
      'RESTful',
    ],
    products: ['全部产品', '灵动课堂', '声网会议'],
    summary:
      '在声网控制台通过 fileNamePrefix 字段配置录制文件存储路径时，你可以使用内置变量来指定动态路径用于存储录制文件。当录制发起时，会用真实的值替换变量。目前支持固定变量和日期变量。',
    title: '如何为录制文件指定动态存储路径？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/electron_faq',
    platforms: ['全部平台', 'Electron'],
    products: ['全部产品', '实时互动'],
    summary:
      '本页介绍在开发 Electron App 的集成 SDK 阶段、编译运行阶段和打包阶段可能遇到的问题及解决方案。',
    title: 'Electron 平台常见开发问题',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/fail_to_upload',
    platforms: ['全部平台', 'RESTful'],
    products: ['全部产品', '云端录制'],
    summary:
      '录制结束后，在第三方云存储中没有找到录制文件，可能有以下几种原因：',
    title: '为什么第三方云存储中没有录制文件？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/flutter_ios_build',
    platforms: ['全部平台', 'iOS', 'Flutter'],
    products: ['全部产品', '实时互动'],
    summary:
      "在 Flutter 上打包出 iOS release 包时，初始化卡住，Xcode 报错 Unhandled exception: Invalid argument(s): Failed to lookup symbol 'InitDartApiDL': dlsym(RTLDDEFAULT, InitDartApiDL): symbol not found。",
    title:
      '如何解决 Flutter 上 iOS release 包初始化时报 symbol not found 的问题？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/flutter_pod',
    platforms: ['全部平台', 'Flutter'],
    products: ['全部产品', '实时互动'],
    summary: '在 Flutter 项目中运行 pod install 时，遇到以下错误：',
    title: '如何处理 Flutter 项目运行 pod install 命令报错？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/framework_cannot_be_opened',
    platforms: ['全部平台', 'macOS'],
    products: ['全部产品', '实时互动'],
    summary:
      '在 macOS 11.6 或更高版本系统上，使用 Xcode 集成实时互动 SDK 时，你可能在项目编译运行时遇到弹窗警告：“macOS 无法打开 ‘\\{libraryname}.framework’，因为无法验证开发者。”',
    title: '编译 Xcode 项目时遇到“无法打开 framework” 的弹窗警告怎么办？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/get_channel_info',
    platforms: ['全部平台', '服务端 Java'],
    products: ['全部产品', '实时互动'],
    summary: '声网目前只支持在服务端通过 RESTful API 获取频道相关信息。',
    title: '如何获取频道相关信息，例如频道名称，以及频道内的用户列表？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/high_availability',
    platforms: ['全部平台', 'RESTful'],
    products: ['全部产品', '云端录制'],
    summary:
      '当出现服务器断网、进程被杀时，云端录制会启用高可用机制，在 90 秒内切换到新的服务器，自动恢复录制服务。',
    title: '云端录制如何处理服务器断网、进程被杀问题？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/ios_app_unity_reports_error',
    platforms: ['全部平台', 'Unity'],
    products: ['全部产品', '实时互动'],
    summary:
      '将使用 Unity 4.x SDK 开发的 App 直接打包上传至 App Store 时，你可能会收到如下错误信息：',
    title: '为什么使用 Unity 4.x SDK 开发的 iOS App 上传到 App Store 会报错？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/ios_sign',
    platforms: [
      '全部平台',
      'iOS',
      'Flutter',
      'Unreal (C++)',
      'Unreal (Blueprint)',
      'Unity',
      'React Native',
    ],
    products: ['全部产品', '实时互动'],
    summary: '将 Xcode 项目部署到 iOS 真机进行调试时，遇到以下错误：',
    title: '如何处理开发团队配置信息缺失导致的 Xcode 项目编译失败？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/java_call_cpp',
    platforms: ['全部平台', 'Android', 'Windows'],
    products: ['全部产品', '实时互动'],
    summary:
      '直接通过 System.loadLibrary 加载 .so 文件以跨平台调用 C++ API 时，可能会遇到 App 启动报错或运行期间崩溃的问题。',
    title: '如何在 Android 设备上跨平台调用 C++ API？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/judge_voice_video_call',
    platforms: ['全部平台'],
    products: ['全部产品', '实时互动'],
    summary:
      '在实时音视频通话场景中，你可以通过声网 RTC SDK 判断一个即将开始或正在进行的通话是语音通话还是视频通话。',
    title: '如何判断一个通话是语音通话还是视频通话？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/kick_user',
    platforms: ['全部平台'],
    products: ['全部产品', '实时互动'],
    summary:
      '在实时音视频互动场景中，通常会有将指定用户移出频道的需求。声网根据实际场景需求，提供如下三种解决方案：',
    title: '如何将指定用户移出频道？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/mini_program',
    platforms: ['全部平台', '小程序'],
    products: ['全部产品', '实时互动'],
    summary: '本文汇总 RTC 小程序 SDK 常见问题和解决方法。',
    title: '如何处理 RTC 小程序 SDK 常见问题？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/mirror_mode',
    platforms: ['全部平台', 'Android', 'iOS', 'Windows', 'macOS'],
    products: ['全部产品', '实时互动'],
    summary:
      'SDK 提供不同的接口方便你在实时音视频通话的不同阶段中获取期望的视频显示效果。',
    title: '如何设置镜像模式？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/mobile_video_profile',
    platforms: ['全部平台', 'RESTful'],
    products: ['全部产品', '云端录制'],
    summary:
      '当你开启移动端网页模式并进行页面录制（mobile 为 true），声网建议你按照如下表格内的视频分辨率设置输出视频的宽和高：',
    title: '如何设置页面录制移动端网页模式的输出视频分辨率？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/mp4_cannot_play',
    platforms: ['全部平台', 'RESTful'],
    products: ['全部产品', '云端录制'],
    summary:
      '通过云端录制 NCS 4 cloudrecordingfileinfos 事件获取到的 MP4 地址无法播放。',
    title: '如何解决云端录制 NCS 事件返回的 MP4 地址无法播放？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/multi_language_support',
    platforms: ['全部平台', 'Android', 'iOS', 'JavaScript', 'Electron'],
    products: ['全部产品', '灵动课堂'],
    summary:
      '灵动课堂目前支持中文、英文和西班牙语。如果你需要添加更多语言，只需要在指定目录找到语言相关的 key 值，进行修改即可。',
    title: '灵动课堂如何支持多语言？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/multitasking',
    platforms: ['全部平台', 'iOS'],
    products: ['全部产品', '实时互动'],
    summary:
      '从 iOS 16 开始，系统允许 App 在多任务模式下继续访问摄像头，这意味着在例如分屏 (Split view)、滑动叠放 (Slide over)、画中画 (Picture in picture) 等布局下，摄像头采集可以保持运行。',
    title: '如何开启 iOS 多任务采集？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/music_pause',
    platforms: ['全部平台', 'Android'],
    products: ['全部产品', '实时互动'],
    summary:
      '在 Android 设备上调用 startAudioMixing 方法播放音乐文件，播放过程中使用系统自带的电话软件接听或者拨打了电话，挂断电话后音乐文件没有自动恢复播放。',
    title: '为什么 Android 设备上挂断系统电话后音乐文件不会自动恢复播放？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/ncs_vs_query',
    platforms: ['全部平台', 'RESTful'],
    products: ['全部产品', '云端录制', '云端转码'],
    summary:
      '为保障云端录制和云端转码服务的可用性，你可以通过 query 方法或消息通知服务来监视服务状态，并在服务状态异常时及时采取措施。本文介绍两种状态监视方案的优缺点。',
    title: '消息通知服务和 query 方法有什么区别？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/no_music_unity_objects',
    platforms: ['全部平台', 'Unity'],
    products: ['全部产品', '实时互动'],
    summary:
      '在 iOS 设备中，用 Unity 组件（AudioSource 和 AudioClip）播放背景音乐，你可能会遇到以下问题：',
    title: '为什么用 Unity 组件播放背景音乐会无声？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/obtain_restful_api_id',
    platforms: ['全部平台', 'Android', 'iOS', 'JavaScript', 'Electron'],
    products: ['全部产品', '灵动课堂'],
    summary:
      '如果你在声网控制台配置灵动课堂时，发生“请先获取 RESTful API ID 和密钥”报错，请进行以下操作：',
    title: '配置时报错“请先获取 RESTful API ID 和密钥”怎么办？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/pod_error',
    platforms: ['全部平台', 'iOS'],
    products: ['全部产品', '实时互动'],
    summary:
      '在 Xcode 12 或之后版本的环境中，如果你使用 CocoaPods 集成 3.3.0 或之后版本 iOS SDK，运行 pod lib lint 命令时，你可能会收到如下报错：',
    title: '为什么使用 CocoaPods 集成 iOS SDK 后运行 pod lib lint 命令报错？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/recording_mode',
    platforms: ['全部平台', '服务端 C++', '服务端 Java'],
    products: ['全部产品', '本地服务端录制', '云端录制'],
    summary:
      '如果你想要更灵活的处理录制文件，可以选择单流录制模式。例如，在在线课堂这一场景中，如果父母只想观看老师和自己孩子的视频，你可以选择单流模式，分别录制老师和每位学生的视频，然后将老师的视频分别与每位学生的视频合并。又比如，在内容审核场景中，如果需要识别出发布违规内容的用户 ID，你可以选择单流模式，分开录制并审核每位用户的音频和视频。',
    title: '单流录制模式和合流录制模式有什么区别？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/recording_player',
    platforms: ['全部平台', '服务端 Java', '服务端 C++'],
    products: ['全部产品', '本地服务端录制'],
    summary: '根据选择的录制模式不同，在录制结束后生成的录制文件也不一样。',
    title: '录制生成的文件支持哪些播放器？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/restful_api_call_frequency',
    platforms: ['全部平台'],
    products: ['全部产品', '实时互动', '融合 CDN'],
    summary:
      '当一个服务端 RESTful API 调用超出频率限制时，会返回状态码 429，表示请求过于频繁。你可以结合业务实际并发需求，参考以下建议，优化 API 调用频率：',
    title: '如何处理服务端 RESTful API 调用超出频率限制？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/return_404',
    platforms: ['全部平台', 'RESTful'],
    products: ['全部产品', '云端录制'],
    summary:
      '通过 start 方法成功开启云端录制后，调用 query 方法返回 404 状态码，可能原因如下：',
    title: '为什么成功开启云端录制后调用 query 方法返回 404？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/rtc_rtm_token',
    platforms: ['全部平台'],
    products: ['全部产品', '实时互动', '实时消息'],
    summary:
      '声网在 GitHub 上提供一个开源的 AgoraDynamicKey 仓库，支持使用 C++、Java、Go 等语言在你自己的服务器上生成同时具备 RTC 和 RTM 权限的 Token。示例代码如下：',
    title: '如何生成同时具备 RTC 和 RTM 权限的 Token？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/rtm2_integration_issue',
    platforms: ['全部平台', 'JavaScript'],
    products: ['全部产品', '实时消息'],
    summary:
      'Token 过期后，你需要先调用 logout 方法登出 RTM 系统，然后使用新的 Token 创建 RTM 实例，再调用 login 方法重新登录 RTM 系统。',
    title: '如何处理 JavaScript SDK 常见集成问题？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/rtm2_rtc_integration_issue',
    platforms: [
      '全部平台',
      'Windows',
      'Android',
      'iOS',
      'macOS',
      'Flutter',
      'HarmonyOS',
    ],
    products: ['全部产品', '实时消息', '实时互动'],
    summary:
      'aosl 是声网 SDK 的基础设施库，包含在 RTC SDK、RTM SDK 和即时通讯 IM SDK 等声网产品中。aosl 库在不同平台的文件名如下：',
    title: '如何处理同时集成多个声网 SDK 时遇到的库冲突问题？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/set_enabled_set_muted',
    platforms: ['全部平台', 'JavaScript'],
    products: ['全部产品', '实时互动'],
    summary:
      'Web SDK 4.x 和 3.x 均提供 API 用于控制本地音视频的采集和发送，这些 API 的区别详见下表。',
    title: 'setEnabled 和 setMuted 有什么区别？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/set_log_file',
    platforms: ['全部平台', 'iOS', 'Android', 'macOS', 'Windows', 'JavaScript'],
    products: ['全部产品', '实时互动'],
    summary:
      '声网 SDK 提供设置 SDK 的输出日志文件的功能，SDK 运行时产生的所有 log 将写入该文件。',
    title: '如何设置日志文件？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/stop_class',
    platforms: ['全部平台', 'Android', 'iOS', 'JavaScript', 'Electron'],
    products: ['全部产品', '灵动课堂'],
    summary:
      '灵动课堂中老师端点击离开教室只是暂时离开教室，老师离开后房间状态不会变化。如果想要结束课堂，可参考如下步骤：',
    title: '如何结束灵动课堂？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/string_uid',
    platforms: [
      '全部平台',
      'iOS',
      'Android',
      'macOS',
      'Windows',
      'JavaScript',
      '小程序',
    ],
    products: ['全部产品', '实时互动'],
    summary: '该功能目前正在验证阶段。如需使用，我们建议你联系声网技术支持。',
    title: '如何使用 String 型用户 ID？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/system_crash_info',
    platforms: ['全部平台', 'iOS', 'Android', 'macOS', 'Windows'],
    products: ['全部产品', '实时互动'],
    summary:
      '当应用程序发生崩溃时，操作系统会生成相应的崩溃日志或文件。以下介绍各平台获取系统崩溃信息的方法：',
    title: '如何获取崩溃信息',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/system_volume',
    platforms: ['全部平台'],
    products: ['全部产品', '实时互动'],
    summary:
      '通话音量指的是进行语音、视频通话时的音量；媒体音量指的是播放背景音乐、视频、音效的音量。通话音量和媒体音量彼此独立，一个的设置不会影响到另一个。这两种音量类型的差异如下：',
    title: '如何区分媒体音量和通话音量？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/token_cohost',
    platforms: ['全部平台'],
    products: ['全部产品', '实时互动'],
    summary:
      '连麦鉴权，主要用于控制频道内的用户是否有发布流的权限，需要开发者通过自己的业务服务端部署并生成 Token、声网服务器再对生成的 Token 校验实现。',
    title: '如何使用连麦鉴权功能？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/token_related_issues',
    platforms: ['全部平台'],
    products: ['全部产品', '实时互动'],
    summary:
      '当你的声网项目中启用了主要/次要证书且不允许仅 App ID 加入，则表示你选择使用动态密钥 Token 对用户进行鉴权。',
    title: '如何处理 Token 相关错误码？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/turn_off_3a_config',
    platforms: ['全部平台', 'Android', 'iOS', 'JavaScript', 'Electron'],
    products: ['全部产品', '灵动课堂'],
    summary:
      '如果你的课堂集成或使用了混音或其他工具，想要关闭降噪、回声消除、增益功能，可在 packages/agora-classroom-sdk/src/infra/api/index.tsx 中添加以下代码实现：',
    title: '如何关闭 3A（降噪、回声消除、增益）的配置?',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/unreal_permissions',
    platforms: ['全部平台', 'Unreal (C++)', 'Unreal (Blueprint)'],
    products: ['全部产品', '实时互动'],
    summary:
      '为了在不同的目标平台上实现实时互动功能，你需要为你的 Unreal Engine 项目添加访问摄像头、访问麦克风等权限。根据目标平台不同，你可以参考本文采取不同的步骤和配置来获取这些权限。',
    title: '如何为 Unreal Engine 项目添加实时互动所需的权限？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/video_enhancement',
    platforms: ['全部平台'],
    products: ['全部产品', '实时互动'],
    summary:
      'Video SDK v4.x 中提供了视频增强插件，可以实现美颜、暗光增强、色彩增强、视频降噪功能。',
    title: '如何使用视频增强插件？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/webgl_context',
    platforms: ['全部平台', 'Electron'],
    products: ['全部产品', '实时互动'],
    summary:
      '现象：运行 Electron App 时，控制台提示：WARNING: Too many active WebGL contexts. Oldest context will be lost.。',
    title:
      '运行 Electron App 时，控制台提示 “WARNING:Too many active WebGL contexts” 怎么办？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/whiteboard_cors',
    platforms: ['全部平台'],
    products: ['全部产品', '互动白板', 'Fastboard'],
    summary:
      '上传到白板的图片或经过转码后的 PPT 课件等资源无法在白板中正常显示，控制台可能会出现以下报错信息：',
    title: '为什么插入白板的图片或 PPT 资源无法显示？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/whiteboard_export_pdf',
    platforms: ['全部平台', 'JavaScript'],
    products: ['全部产品', '互动白板'],
    summary:
      '导出 PDF 功能需要使用 window.postMessage 事件发起导出任务。以下为详细步骤：',
    title: '如何导出 PDF？',
  },
  {
    category: 'integration-issues',
    href: '/zh-CN/api-reference/faq/integration/window_sharing_win7',
    platforms: ['全部平台', 'Windows'],
    products: ['全部产品', '实时互动'],
    summary:
      '- 在 Windows 7 版本上共享文件资源管理器窗口时，远端用户看到的共享窗口的搜索框颜色可能异常（黑色）。',
    title: '如何处理 Windows 7 窗口共享异常？',
  },
  {
    category: 'other-issues',
    href: '/zh-CN/api-reference/faq/other/android_noaudio',
    platforms: ['全部平台', 'Android'],
    products: ['全部产品', '实时互动'],
    summary: '可能是因为没有正确退出 WorkerThread 导致。',
    title: '为什么 Android 设备进入频道后耳机无声？',
  },
  {
    category: 'other-issues',
    href: '/zh-CN/api-reference/faq/other/chatroom',
    platforms: ['全部平台'],
    products: ['全部产品', '声动语聊'],
    summary: '本文总结使用声动语聊方案时可能遇到的常见问题和解决方法。',
    title: '声动语聊常见问题合集',
  },
  {
    category: 'other-issues',
    href: '/zh-CN/api-reference/faq/other/ios_privacy_manifest',
    platforms: [
      '全部平台',
      'iOS',
      'Unity',
      'Flutter',
      'React Native',
      'Unreal (C++)',
      'Unreal (Blueprint)',
    ],
    products: ['全部产品', '实时互动'],
    summary:
      '为确保终端用户的隐私安全，所有在苹果应用商店（App Store） 上架的 App 均需要按照 Apple 的要求提供一份隐私清单，描述其（包括 App 的开发代码或使用第三方 SDK 的代码）使用可能影响用户隐私的 Apple 原生 API 的必要理由，并确保 App 仅为实现预期目的使用这些 API。',
    title: '使用 RTC SDK 开发的 iOS App 如何增加隐私清单？',
  },
  {
    category: 'other-issues',
    href: '/zh-CN/api-reference/faq/other/macos_15_beta',
    platforms: ['全部平台', 'macOS'],
    products: ['全部产品', '实时互动'],
    summary:
      '在 macOS 15 Beta 系统上开发时，如果 App 的路径（以及 App 名称）包含非英文字符（例如：中文、日文、韩文等），则编译后的 Metal shader library 中可能不包含任何方法，导致 App 无法正常运行。',
    title: '如何解决 macOS 15 Beta 不支持路径中包含中文字符的 App 问题？',
  },
  {
    category: 'other-issues',
    href: '/zh-CN/api-reference/faq/other/privacyinfortm',
    platforms: ['全部平台', 'iOS', 'Unity'],
    products: ['全部产品', '实时消息'],
    summary:
      '为确保终端用户的隐私安全，所有在苹果应用商店（App Store） 上架的 App 均需要按照 Apple 的要求提供一份隐私清单，描述其（包括 App 的开发代码或使用第三方 SDK 的代码）使用可能影响用户隐私的 Apple 原生 API 的必要理由，并确保 App 仅为实现预期目的使用这些 API。',
    title: '使用 RTM SDK 开发的 iOS App 如何增加隐私清单？',
  },
  {
    category: 'general-product-inquiry',
    href: '/zh-CN/api-reference/faq/product/audio_format',
    platforms: ['全部平台'],
    products: ['全部产品', '实时互动'],
    summary:
      'RTC SDK 提供一系列对音频文件进行管理的方法，各方法对单音轨或多音轨文件的支持情况如下：',
    title: 'RTC SDK 支持播放哪些格式的音频文件？',
  },
  {
    category: 'general-product-inquiry',
    href: '/zh-CN/api-reference/faq/product/call_api_in_browser',
    platforms: ['全部平台', 'RESTful'],
    products: ['全部产品', '云端录制'],
    summary:
      '要使用云端录制 RESTful API，Web API 需要发送跨域请求。根据 CORS 规范，浏览器针对跨域请求会先发送一个 OPTIONS 请求，查询服务器是否允许跨域请求，然后才有可能发起真正的 POST 请求。但是由于云端录制 RESTful API 不支持 OPTIONS 方法，所以无法支持 Web API 调用的方式。',
    title: '为什么无法通过浏览器调用云端录制 RESTful API？',
  },
  {
    category: 'general-product-inquiry',
    href: '/zh-CN/api-reference/faq/product/capacity',
    platforms: ['全部平台'],
    products: ['全部产品', '实时互动'],
    summary:
      'RTC SDK 提供多人实时音视频服务，对并发频道数量无限制，支持单个频道内百万用户同时在线。',
    title: 'RTC SDK 最多支持多少人同时在线？',
  },
  {
    category: 'general-product-inquiry',
    href: '/zh-CN/api-reference/faq/product/differ_agora_cdn',
    platforms: ['全部平台'],
    products: ['全部产品', '实时互动'],
    summary:
      'CDN + RTMP 的直播技术使得观众在网页端就能观看直播，极大降低了观众的门槛。',
    title: '声网与一般的 CDN + RTMP 直播技术有何不同？',
  },
  {
    category: 'general-product-inquiry',
    href: '/zh-CN/api-reference/faq/product/recording_concurrence',
    platforms: ['全部平台', '服务端 Java', '服务端 C++'],
    products: ['全部产品', '本地服务端录制'],
    summary: '对于本地服务端录制，我们测试了以下云主机配置下的录制并发性能：',
    title: '本地服务端录制的并发性能如何？',
  },
  {
    category: 'general-product-inquiry',
    href: '/zh-CN/api-reference/faq/product/streaming_difference',
    platforms: ['全部平台'],
    products: ['全部产品', '实时互动'],
    summary: '你可通过下表快速了解不同直播场景的区别。',
    title: '各类直播场景有什么区别？',
  },
  {
    category: 'quality-issues',
    href: '/zh-CN/api-reference/faq/quality/adjust_music_volume',
    platforms: ['全部平台', 'iOS', 'Android'],
    products: ['全部产品', '实时互动'],
    summary:
      '在移动设备中，用户在后台播放背景音乐，加入 RTC 频道后，用户无法通过调节系统音量去改变背景音乐的音量。',
    title: '为什么通过系统音量无法调节背景音乐？',
  },
  {
    category: 'quality-issues',
    href: '/zh-CN/api-reference/faq/quality/android_background',
    platforms: ['全部平台', 'Android'],
    products: ['全部产品', '实时互动'],
    summary: '- Android 设备锁屏 1 分钟内，远端音频无声或看不到视频。',
    title:
      '为什么部分 Android 版本 App 锁屏或切后台音视频采集或播放（渲染）无效？',
  },
  {
    category: 'quality-issues',
    href: '/zh-CN/api-reference/faq/quality/audio_freeze',
    platforms: ['全部平台'],
    products: ['全部产品', '实时互动'],
    summary:
      '卡顿的问题可能涉及到网络，设备，物理环境等原因。比较常见的是客户端的网络较差导致。',
    title: '如何处理音频卡顿问题？',
  },
  {
    category: 'quality-issues',
    href: '/zh-CN/api-reference/faq/quality/audio_low',
    platforms: ['全部平台'],
    products: ['全部产品', '实时互动'],
    summary: '- 请检查接收方的系统音量是否已调大。',
    title: '如何处理音量太小问题？',
  },
  {
    category: 'quality-issues',
    href: '/zh-CN/api-reference/faq/quality/audio_noaudio',
    platforms: ['全部平台'],
    products: ['全部产品', '实时互动'],
    summary: '请依次按照以下解决方案排查问题。',
    title: '如何处理无声问题？',
  },
  {
    category: 'quality-issues',
    href: '/zh-CN/api-reference/faq/quality/audio_noise',
    platforms: ['全部平台'],
    products: ['全部产品', '实时互动'],
    summary:
      '噪声的问题一般是外部环境或者录放音设备导致的，SDK 本身一般不会主动产生噪声。',
    title: '如何处理音频噪声问题？',
  },
  {
    category: 'quality-issues',
    href: '/zh-CN/api-reference/faq/quality/audio_role',
    platforms: ['全部平台', 'iOS', 'Android'],
    products: ['全部产品', '实时互动'],
    summary:
      '为了保证不同场景下都有较好的音质体验，默认情况下，用户上下麦时，SDK 会调整底层音频的设置：',
    title: '如何避免直播上下麦音量变化？',
  },
  {
    category: 'quality-issues',
    href: '/zh-CN/api-reference/faq/quality/audio_video_issues_in_classroom',
    platforms: ['全部平台', 'Android', 'iOS', 'JavaScript', 'Electron'],
    products: ['全部产品', '灵动课堂'],
    summary: '请确认浏览器摄像头或麦克风的权限是否打开，步骤参考以下截图：',
    title: '如何处理音视频相关问题？',
  },
  {
    category: 'quality-issues',
    href: '/zh-CN/api-reference/faq/quality/device_occupied',
    platforms: ['全部平台', 'Android', 'JavaScript'],
    products: ['全部产品', '实时互动'],
    summary:
      '可能是因为第三方录音应用占用音频设备，或者在网页端通话时切换到占用音频输入设备的 App。',
    title: '为什么使用其他 App 后无法发送音视频？',
  },
  {
    category: 'quality-issues',
    href: '/zh-CN/api-reference/faq/quality/flutter_debug',
    platforms: ['全部平台', 'Flutter'],
    products: ['全部产品', '实时互动'],
    summary:
      '在 iOS 14 及以上版本的设备上，以调试模式 (Debug mode) 安装的 Flutter App 无法通过点击主屏幕图标、深度链接 (Deep link) 等方式再次打开。此外，如果 iOS App 以调试模式集成了 Flutter 模块，通过点击主屏幕图标等方式再次打开 App 时，其中集成的 Flutter 模块可能会导致 App 崩溃。',
    title:
      '为什么调试模式下在 iOS 14 及以上设备上安装的 Flutter App 无法再次打开？',
  },
  {
    category: 'quality-issues',
    href: '/zh-CN/api-reference/faq/quality/harmonyos_background',
    platforms: ['全部平台', 'HarmonyOS'],
    products: ['全部产品', '实时互动'],
    summary:
      '鸿蒙 HarmonyOS NEXT 设备锁屏一段时间或 App 在运行过程中切换到后台时，远端音频无声、看不到视频。',
    title: '为什么部分鸿蒙版本 App 锁屏或切后台音视频采集无效？',
  },
  {
    category: 'quality-issues',
    href: '/zh-CN/api-reference/faq/quality/ios_background',
    platforms: ['全部平台', 'iOS'],
    products: ['全部产品', '实时互动'],
    summary:
      'iOS 设备锁屏或将 App 切换至后台后，无法听到音频，且视频画面会卡在切换至后台前的最后一帧。',
    title: '为什么部分 iOS 版本 App 锁屏或切后台后音视频采集无效？',
  },
  {
    category: 'quality-issues',
    href: '/zh-CN/api-reference/faq/quality/ios_bluetooth',
    platforms: ['全部平台', 'Android', 'iOS'],
    products: ['全部产品', '实时互动'],
    summary:
      'iOS 或 Android 设备连接蓝牙设备后，通话时出现不能通过蓝牙设备出声的现象。具体现象如下：',
    title: '为什么 iOS 或 Android 设备连接蓝牙设备后不能通过蓝牙设备接电话？',
  },
  {
    category: 'quality-issues',
    href: '/zh-CN/api-reference/faq/quality/optimize_video_rendering',
    platforms: ['全部平台'],
    products: ['全部产品', '实时互动'],
    summary:
      '在使用声网 SDK 进行实时音视频开发时，部分开发者反馈在加入频道后远端视频首帧出图速度较慢，影响用户体验。具体表现为用户加入频道后，远端视频画面需要等待较长时间才显示出来。',
    title: '如何调查首帧出图时间较长的问题？',
  },
  {
    category: 'quality-issues',
    href: '/zh-CN/api-reference/faq/quality/record_file_issue',
    platforms: ['全部平台', '服务端 Java', '服务端 C++'],
    products: ['全部产品', '本地服务端录制'],
    summary:
      '本文包含使用本地服务端录制过程中可能出现的录制文件异常问题，及常见的解决方法。',
    title: '为什么录制文件会出现异常？',
  },
  {
    category: 'quality-issues',
    href: '/zh-CN/api-reference/faq/quality/record_split',
    platforms: ['全部平台', '服务端 Java', '服务端 C++'],
    products: ['全部产品', '本地服务端录制'],
    summary:
      '录制过程中，如果录制音视频格式不是原始音视频数据格式，以下情况均会导致录制文件截断：',
    title: '为什么录制文件会出现截断',
  },
  {
    category: 'quality-issues',
    href: '/zh-CN/api-reference/faq/quality/record_status_error',
    platforms: ['全部平台', '服务端 Java', '服务端 C++'],
    products: ['全部产品', '本地服务端录制'],
    summary:
      '本文包含在使用本地服务端录制 SDK 过程中可能会出现的状态异常，以及常见的解决方法。',
    title: '为什么录制状态出现异常？',
  },
  {
    category: 'quality-issues',
    href: '/zh-CN/api-reference/faq/quality/sei',
    platforms: ['全部平台'],
    products: ['全部产品', '实时互动', '旁路推流'],
    summary:
      '在默认情况下，声网进行服务端转码推流时，会在转码后的 H.264 或 H.265 的 SEI（Supplemental Enhancement Information）信息中，增加当前视频的编码信息。该信息为 JSON 格式的字符串，具体示例如下：',
    title: '如何处理直播 SEI 相关问题？',
  },
  {
    category: 'quality-issues',
    href: '/zh-CN/api-reference/faq/quality/video_bighead',
    platforms: ['全部平台'],
    products: ['全部产品', '实时互动'],
    summary: '这种情况一般是由于视频尺寸与显示视窗尺寸不一致，有下面几种情况：',
    title: '如何处理视频大头或黑边问题？',
  },
  {
    category: 'quality-issues',
    href: '/zh-CN/api-reference/faq/quality/video_blank',
    platforms: ['全部平台'],
    products: ['全部产品', '实时互动'],
    summary: '常见的视频黑屏问题有以下三种情况：',
    title: '如何处理视频黑屏问题？',
  },
  {
    category: 'quality-issues',
    href: '/zh-CN/api-reference/faq/quality/video_blur',
    platforms: ['全部平台'],
    products: ['全部产品', '实时互动'],
    summary: '视频模糊一般是由视频码率或分辨率过低导致。',
    title: '如何处理视频模糊问题？',
  },
  {
    category: 'quality-issues',
    href: '/zh-CN/api-reference/faq/quality/video_camera',
    platforms: ['全部平台'],
    products: ['全部产品', '实时互动'],
    summary: '摄像头打开失败有多种原因，请按以下步骤检查：',
    title: '为什么我无法打开摄像头？',
  },
  {
    category: 'quality-issues',
    href: '/zh-CN/api-reference/faq/quality/video_freeze',
    platforms: ['全部平台'],
    products: ['全部产品', '实时互动'],
    summary:
      '视频卡顿问题一般由网络、设备性能等原因造成。你可以参考以下步骤解决卡顿问题。',
    title: '为什么我的视频会出现卡顿？',
  },
];
