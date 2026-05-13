import { load as parseYaml } from 'js-yaml';
import aiAgentLifecycleEnImport from '../../content/home/en/ai-agent-lifecycle.md?raw';
import aiAgentsAndRealtimeChannelsEnImport from '../../content/home/en/ai-agents-and-realtime-channels.md?raw';
import aiClientComponentApiEnImport from '../../content/home/en/ai-client-component-api.md?raw';
import aiHomeEnImport from '../../content/home/en/ai-home.md?raw';
import aiChooseYourIntegrationPathEnImport from '../../content/home/en/ai-choose-your-integration-path.md?raw';
import aiConfigureAsrAndTtsEnImport from '../../content/home/en/ai-configure-asr-and-tts.md?raw';
import aiConfigurePresetsEnImport from '../../content/home/en/ai-configure-presets.md?raw';
import aiDeviceAiEnImport from '../../content/home/en/ai-device-ai.md?raw';
import aiMobileClientEnImport from '../../content/home/en/ai-mobile-client.md?raw';
import aiModelsVoiceAndContextEnImport from '../../content/home/en/ai-models-voice-and-context.md?raw';
import aiOverviewEnImport from '../../content/home/en/ai-overview.md?raw';
import aiProductionChecklistEnImport from '../../content/home/en/ai-production-checklist.md?raw';
import aiStartWithAgentStudioEnImport from '../../content/home/en/ai-start-with-agent-studio.md?raw';
import aiTestAnAgentEnImport from '../../content/home/en/ai-test-an-agent.md?raw';
import aiWebClientEnImport from '../../content/home/en/ai-web-client.md?raw';
import rmChooseYourProductPathEnImport from '../../content/home/en/rm-choose-your-product-path.md?raw';
import rmCollaborationAndInteractionEnImport from '../../content/home/en/rm-collaboration-and-interaction.md?raw';
import rmDeviceAndIndustryEnImport from '../../content/home/en/rm-device-and-industry.md?raw';
import rmEducationClassroomsEnImport from '../../content/home/en/rm-education-classrooms.md?raw';
import rmFoundationRealtimeEnImport from '../../content/home/en/rm-foundation-realtime.md?raw';
import rmGovernanceEnImport from '../../content/home/en/rm-governance.md?raw';
import rmAnalyticsEnImport from '../../content/home/en/rm-analytics.md?raw';
import rmBillingEnImport from '../../content/home/en/rm-billing.md?raw';
import rmConsoleEnImport from '../../content/home/en/rm-console.md?raw';
import rmFusionCdnEnImport from '../../content/home/en/rm-fusion-cdn.md?raw';
import rmImEnImport from '../../content/home/en/rm-im.md?raw';
import rmLiveInteractionEnImport from '../../content/home/en/rm-live-interaction.md?raw';
import rmMarketplaceEnImport from '../../content/home/en/rm-marketplace.md?raw';
import rmMediaProcessingAndDistributionEnImport from '../../content/home/en/rm-media-processing-and-distribution.md?raw';
import rmMediaPullEnImport from '../../content/home/en/rm-media-pull.md?raw';
import rmMediaPushEnImport from '../../content/home/en/rm-media-push.md?raw';
import rmMeetingEnImport from '../../content/home/en/rm-meeting.md?raw';
import rmOverviewEnImport from '../../content/home/en/rm-overview.md?raw';
import rmRecordingEnImport from '../../content/home/en/rm-recording.md?raw';
import rmRtmEnImport from '../../content/home/en/rm-rtm.md?raw';
import rmRtcEnImport from '../../content/home/en/rm-rtc.md?raw';
import rmRtcServerSdkEnImport from '../../content/home/en/rm-rtc-server-sdk.md?raw';
import rmRtmpGatewayEnImport from '../../content/home/en/rm-rtmp-gateway.md?raw';
import rmRtsaEnImport from '../../content/home/en/rm-rtsa.md?raw';
import rmSdkExtensionsEnImport from '../../content/home/en/rm-sdk-extensions.md?raw';
import rmSecurityEnImport from '../../content/home/en/rm-security.md?raw';
import rmServerAndExtensionsEnImport from '../../content/home/en/rm-server-and-extensions.md?raw';
import rmSetupServiceAndCredentialsEnImport from '../../content/home/en/rm-setup-service-and-credentials.md?raw';
import rmSmartDevicesEnImport from '../../content/home/en/rm-smart-devices.md?raw';
import rmSpeechToTextEnImport from '../../content/home/en/rm-speech-to-text.md?raw';
import rmStatusPageEnImport from '../../content/home/en/rm-status-page.md?raw';
import rmTeleoperationEnImport from '../../content/home/en/rm-teleoperation.md?raw';
import rmTranscodingEnImport from '../../content/home/en/rm-transcoding.md?raw';
import rmVoipCallEnImport from '../../content/home/en/rm-voip-call.md?raw';
import rmWhiteboardEnImport from '../../content/home/en/rm-whiteboard.md?raw';
import overviewAiAgentsEnImport from '../../content/home/en/overview-ai-agents.md?raw';
import overviewBrowseByCapabilityEnImport from '../../content/home/en/overview-browse-by-capability.md?raw';
import overviewChooseYourPathEnImport from '../../content/home/en/overview-choose-your-path.md?raw';
import overviewHomeEnImport from '../../content/home/en/overview-home.md?raw';
import overviewMediaServicesEnImport from '../../content/home/en/overview-media-services.md?raw';
import overviewMessagingEnImport from '../../content/home/en/overview-messaging.md?raw';
import overviewPricingAccessEnImport from '../../content/home/en/overview-pricing-access.md?raw';
import overviewProductMatrixEnImport from '../../content/home/en/overview-product-matrix.md?raw';
import overviewRealtimeAudioVideoEnImport from '../../content/home/en/overview-realtime-audio-video.md?raw';
import overviewRtmEnImport from '../../content/home/en/overview-rtm.md?raw';
import overviewRtsaEnImport from '../../content/home/en/overview-rtsa.md?raw';
import overviewRtcServerSdkEnImport from '../../content/home/en/overview-rtc-server-sdk.md?raw';
import overviewReleaseNotesEnImport from '../../content/home/en/overview-release-notes.md?raw';
import overviewSecurityComplianceEnImport from '../../content/home/en/overview-security-compliance.md?raw';
import overviewSpeechToTextEnImport from '../../content/home/en/overview-speech-to-text.md?raw';
import overviewFusionCdnEnImport from '../../content/home/en/overview-fusion-cdn.md?raw';
import overviewWhiteboardEnImport from '../../content/home/en/overview-whiteboard.md?raw';
import overviewGeneralAccountEnImport from '../../content/home/en/overview-general-account.md?raw';
import overviewGeneralProjectsEnImport from '../../content/home/en/overview-general-projects.md?raw';
import overviewGeneralMembersRolesEnImport from '../../content/home/en/overview-general-members-roles.md?raw';
import overviewGeneralSecurityPrivacyEnImport from '../../content/home/en/overview-general-security-privacy.md?raw';
import overviewGeneralSupportEnImport from '../../content/home/en/overview-general-support.md?raw';
import overviewGeneralUsageAnalyticsEnImport from '../../content/home/en/overview-general-usage-analytics.md?raw';
import overviewAboutAgoraEnImport from '../../content/home/en/overview-about-agora.md?raw';
import overviewStartWithAiEnImport from '../../content/home/en/overview-start-with-ai.md?raw';
import overviewCommunityResourcesEnImport from '../../content/home/en/overview-community-resources.md?raw';
import aiAgentLifecycleZhImport from '../../content/home/zh-CN/ai-agent-lifecycle.md?raw';
import aiAgentsAndRealtimeChannelsZhImport from '../../content/home/zh-CN/ai-agents-and-realtime-channels.md?raw';
import aiClientComponentApiZhImport from '../../content/home/zh-CN/ai-client-component-api.md?raw';
import aiHomeZhImport from '../../content/home/zh-CN/ai-home.md?raw';
import aiChooseYourIntegrationPathZhImport from '../../content/home/zh-CN/ai-choose-your-integration-path.md?raw';
import aiConfigureAsrAndTtsZhImport from '../../content/home/zh-CN/ai-configure-asr-and-tts.md?raw';
import aiConfigurePresetsZhImport from '../../content/home/zh-CN/ai-configure-presets.md?raw';
import aiDeviceAiZhImport from '../../content/home/zh-CN/ai-device-ai.md?raw';
import aiMobileClientZhImport from '../../content/home/zh-CN/ai-mobile-client.md?raw';
import aiModelsVoiceAndContextZhImport from '../../content/home/zh-CN/ai-models-voice-and-context.md?raw';
import aiOverviewZhImport from '../../content/home/zh-CN/ai-overview.md?raw';
import aiProductionChecklistZhImport from '../../content/home/zh-CN/ai-production-checklist.md?raw';
import aiStartWithAgentStudioZhImport from '../../content/home/zh-CN/ai-start-with-agent-studio.md?raw';
import aiTestAnAgentZhImport from '../../content/home/zh-CN/ai-test-an-agent.md?raw';
import aiWebClientZhImport from '../../content/home/zh-CN/ai-web-client.md?raw';
import rmChooseYourProductPathZhImport from '../../content/home/zh-CN/rm-choose-your-product-path.md?raw';
import rmCollaborationAndInteractionZhImport from '../../content/home/zh-CN/rm-collaboration-and-interaction.md?raw';
import rmDeviceAndIndustryZhImport from '../../content/home/zh-CN/rm-device-and-industry.md?raw';
import rmEducationClassroomsZhImport from '../../content/home/zh-CN/rm-education-classrooms.md?raw';
import rmFoundationRealtimeZhImport from '../../content/home/zh-CN/rm-foundation-realtime.md?raw';
import rmGovernanceZhImport from '../../content/home/zh-CN/rm-governance.md?raw';
import rmAnalyticsZhImport from '../../content/home/zh-CN/rm-analytics.md?raw';
import rmBillingZhImport from '../../content/home/zh-CN/rm-billing.md?raw';
import rmConsoleZhImport from '../../content/home/zh-CN/rm-console.md?raw';
import rmFusionCdnZhImport from '../../content/home/zh-CN/rm-fusion-cdn.md?raw';
import rmImZhImport from '../../content/home/zh-CN/rm-im.md?raw';
import rmLiveInteractionZhImport from '../../content/home/zh-CN/rm-live-interaction.md?raw';
import rmMarketplaceZhImport from '../../content/home/zh-CN/rm-marketplace.md?raw';
import rmMediaProcessingAndDistributionZhImport from '../../content/home/zh-CN/rm-media-processing-and-distribution.md?raw';
import rmMediaPullZhImport from '../../content/home/zh-CN/rm-media-pull.md?raw';
import rmMediaPushZhImport from '../../content/home/zh-CN/rm-media-push.md?raw';
import rmMeetingZhImport from '../../content/home/zh-CN/rm-meeting.md?raw';
import rmOverviewZhImport from '../../content/home/zh-CN/rm-overview.md?raw';
import rmRecordingZhImport from '../../content/home/zh-CN/rm-recording.md?raw';
import rmRtmZhImport from '../../content/home/zh-CN/rm-rtm.md?raw';
import rmRtcZhImport from '../../content/home/zh-CN/rm-rtc.md?raw';
import rmRtcServerSdkZhImport from '../../content/home/zh-CN/rm-rtc-server-sdk.md?raw';
import rmRtmpGatewayZhImport from '../../content/home/zh-CN/rm-rtmp-gateway.md?raw';
import rmRtsaZhImport from '../../content/home/zh-CN/rm-rtsa.md?raw';
import rmSdkExtensionsZhImport from '../../content/home/zh-CN/rm-sdk-extensions.md?raw';
import rmSecurityZhImport from '../../content/home/zh-CN/rm-security.md?raw';
import rmServerAndExtensionsZhImport from '../../content/home/zh-CN/rm-server-and-extensions.md?raw';
import rmSetupServiceAndCredentialsZhImport from '../../content/home/zh-CN/rm-setup-service-and-credentials.md?raw';
import rmSmartDevicesZhImport from '../../content/home/zh-CN/rm-smart-devices.md?raw';
import rmSpeechToTextZhImport from '../../content/home/zh-CN/rm-speech-to-text.md?raw';
import rmStatusPageZhImport from '../../content/home/zh-CN/rm-status-page.md?raw';
import rmTeleoperationZhImport from '../../content/home/zh-CN/rm-teleoperation.md?raw';
import rmTranscodingZhImport from '../../content/home/zh-CN/rm-transcoding.md?raw';
import rmVoipCallZhImport from '../../content/home/zh-CN/rm-voip-call.md?raw';
import rmWhiteboardZhImport from '../../content/home/zh-CN/rm-whiteboard.md?raw';
import overviewAiAgentsZhImport from '../../content/home/zh-CN/overview-ai-agents.md?raw';
import overviewBrowseByCapabilityZhImport from '../../content/home/zh-CN/overview-browse-by-capability.md?raw';
import overviewChooseYourPathZhImport from '../../content/home/zh-CN/overview-choose-your-path.md?raw';
import overviewHomeZhImport from '../../content/home/zh-CN/overview-home.md?raw';
import overviewMediaServicesZhImport from '../../content/home/zh-CN/overview-media-services.md?raw';
import overviewMessagingZhImport from '../../content/home/zh-CN/overview-messaging.md?raw';
import overviewPricingAccessZhImport from '../../content/home/zh-CN/overview-pricing-access.md?raw';
import overviewProductMatrixZhImport from '../../content/home/zh-CN/overview-product-matrix.md?raw';
import overviewRealtimeAudioVideoZhImport from '../../content/home/zh-CN/overview-realtime-audio-video.md?raw';
import overviewRtmZhImport from '../../content/home/zh-CN/overview-rtm.md?raw';
import overviewRtsaZhImport from '../../content/home/zh-CN/overview-rtsa.md?raw';
import overviewRtcServerSdkZhImport from '../../content/home/zh-CN/overview-rtc-server-sdk.md?raw';
import overviewReleaseNotesZhImport from '../../content/home/zh-CN/overview-release-notes.md?raw';
import overviewSecurityComplianceZhImport from '../../content/home/zh-CN/overview-security-compliance.md?raw';
import overviewSpeechToTextZhImport from '../../content/home/zh-CN/overview-speech-to-text.md?raw';
import overviewFusionCdnZhImport from '../../content/home/zh-CN/overview-fusion-cdn.md?raw';
import overviewWhiteboardZhImport from '../../content/home/zh-CN/overview-whiteboard.md?raw';
import overviewGeneralAccountZhImport from '../../content/home/zh-CN/overview-general-account.md?raw';
import overviewGeneralProjectsZhImport from '../../content/home/zh-CN/overview-general-projects.md?raw';
import overviewGeneralMembersRolesZhImport from '../../content/home/zh-CN/overview-general-members-roles.md?raw';
import overviewGeneralSecurityPrivacyZhImport from '../../content/home/zh-CN/overview-general-security-privacy.md?raw';
import overviewGeneralSupportZhImport from '../../content/home/zh-CN/overview-general-support.md?raw';
import overviewGeneralUsageAnalyticsZhImport from '../../content/home/zh-CN/overview-general-usage-analytics.md?raw';
import overviewAboutAgoraZhImport from '../../content/home/zh-CN/overview-about-agora.md?raw';
import overviewStartWithAiZhImport from '../../content/home/zh-CN/overview-start-with-ai.md?raw';
import overviewCommunityResourcesZhImport from '../../content/home/zh-CN/overview-community-resources.md?raw';

export type MarkdownCard = {
  body: string;
  href: string;
  icon: string;
  title: string;
};

export type MarkdownLink = {
  href: string;
  label: string;
};

export type MarkdownSection = {
  body: string;
  links?: MarkdownLink[];
  title: string;
};

export type MarkdownPage = {
  cards?: MarkdownCard[];
  description: string;
  eyebrow?: string;
  quickstartBody?: string;
  quickstartTitle?: string;
  rawBody: string;
  sections?: MarkdownSection[];
  title: string;
};

export type HomeMarkdownPages = Record<string, Record<string, MarkdownPage>>;

type RawPage = Omit<MarkdownPage, 'sections'> & {
  sections: MarkdownSection[];
};

const pagesByLocale: HomeMarkdownPages = {
  en: {
    'ai-agent-lifecycle': parseMarkdownPage(normalizeRaw(aiAgentLifecycleEnImport)),
    'ai-agents-and-realtime-channels': parseMarkdownPage(
      normalizeRaw(aiAgentsAndRealtimeChannelsEnImport),
    ),
    'ai-choose-your-integration-path': parseMarkdownPage(
      normalizeRaw(aiChooseYourIntegrationPathEnImport),
    ),
    'ai-client-component-api': parseMarkdownPage(
      normalizeRaw(aiClientComponentApiEnImport),
    ),
    'ai-configure-asr-and-tts': parseMarkdownPage(
      normalizeRaw(aiConfigureAsrAndTtsEnImport),
    ),
    'ai-configure-presets': parseMarkdownPage(
      normalizeRaw(aiConfigurePresetsEnImport),
    ),
    'ai-device-ai': parseMarkdownPage(normalizeRaw(aiDeviceAiEnImport)),
    'ai-home': parseMarkdownPage(normalizeRaw(aiHomeEnImport)),
    'ai-mobile-client': parseMarkdownPage(normalizeRaw(aiMobileClientEnImport)),
    'ai-models-voice-and-context': parseMarkdownPage(
      normalizeRaw(aiModelsVoiceAndContextEnImport),
    ),
    'ai-overview': parseMarkdownPage(normalizeRaw(aiOverviewEnImport)),
    'ai-production-checklist': parseMarkdownPage(
      normalizeRaw(aiProductionChecklistEnImport),
    ),
    'ai-start-with-agent-studio': parseMarkdownPage(
      normalizeRaw(aiStartWithAgentStudioEnImport),
    ),
    'ai-test-an-agent': parseMarkdownPage(normalizeRaw(aiTestAnAgentEnImport)),
    'ai-web-client': parseMarkdownPage(normalizeRaw(aiWebClientEnImport)),
    'rm-choose-your-product-path': parseMarkdownPage(
      normalizeRaw(rmChooseYourProductPathEnImport),
    ),
    'rm-console': parseMarkdownPage(normalizeRaw(rmConsoleEnImport)),
    'rm-collaboration-and-interaction': parseMarkdownPage(
      normalizeRaw(rmCollaborationAndInteractionEnImport),
    ),
    'rm-device-and-industry': parseMarkdownPage(
      normalizeRaw(rmDeviceAndIndustryEnImport),
    ),
    'rm-education-classrooms': parseMarkdownPage(
      normalizeRaw(rmEducationClassroomsEnImport),
    ),
    'rm-foundation-realtime': parseMarkdownPage(
      normalizeRaw(rmFoundationRealtimeEnImport),
    ),
    'rm-fusion-cdn': parseMarkdownPage(normalizeRaw(rmFusionCdnEnImport)),
    'rm-governance': parseMarkdownPage(normalizeRaw(rmGovernanceEnImport)),
    'rm-analytics': parseMarkdownPage(normalizeRaw(rmAnalyticsEnImport)),
    'rm-billing': parseMarkdownPage(normalizeRaw(rmBillingEnImport)),
    'rm-im': parseMarkdownPage(normalizeRaw(rmImEnImport)),
    'rm-live-interaction': parseMarkdownPage(normalizeRaw(rmLiveInteractionEnImport)),
    'rm-marketplace': parseMarkdownPage(normalizeRaw(rmMarketplaceEnImport)),
    'rm-media-processing-and-distribution': parseMarkdownPage(
      normalizeRaw(rmMediaProcessingAndDistributionEnImport),
    ),
    'rm-media-pull': parseMarkdownPage(normalizeRaw(rmMediaPullEnImport)),
    'rm-media-push': parseMarkdownPage(normalizeRaw(rmMediaPushEnImport)),
    'rm-meeting': parseMarkdownPage(normalizeRaw(rmMeetingEnImport)),
    'rm-overview': parseMarkdownPage(normalizeRaw(rmOverviewEnImport)),
    'rm-recording': parseMarkdownPage(normalizeRaw(rmRecordingEnImport)),
    'rm-rtc': parseMarkdownPage(normalizeRaw(rmRtcEnImport)),
    'rm-rtc-server-sdk': parseMarkdownPage(
      normalizeRaw(rmRtcServerSdkEnImport),
    ),
    'rm-rtm': parseMarkdownPage(normalizeRaw(rmRtmEnImport)),
    'rm-rtmp-gateway': parseMarkdownPage(
      normalizeRaw(rmRtmpGatewayEnImport),
    ),
    'rm-rtsa': parseMarkdownPage(normalizeRaw(rmRtsaEnImport)),
    'rm-sdk-extensions': parseMarkdownPage(
      normalizeRaw(rmSdkExtensionsEnImport),
    ),
    'rm-security': parseMarkdownPage(normalizeRaw(rmSecurityEnImport)),
    'rm-server-and-extensions': parseMarkdownPage(
      normalizeRaw(rmServerAndExtensionsEnImport),
    ),
    'rm-setup-service-and-credentials': parseMarkdownPage(
      normalizeRaw(rmSetupServiceAndCredentialsEnImport),
    ),
    'rm-smart-devices': parseMarkdownPage(
      normalizeRaw(rmSmartDevicesEnImport),
    ),
    'rm-speech-to-text': parseMarkdownPage(
      normalizeRaw(rmSpeechToTextEnImport),
    ),
    'rm-status-page': parseMarkdownPage(normalizeRaw(rmStatusPageEnImport)),
    'rm-teleoperation': parseMarkdownPage(
      normalizeRaw(rmTeleoperationEnImport),
    ),
    'rm-transcoding': parseMarkdownPage(normalizeRaw(rmTranscodingEnImport)),
    'rm-voip-call': parseMarkdownPage(normalizeRaw(rmVoipCallEnImport)),
    'rm-whiteboard': parseMarkdownPage(normalizeRaw(rmWhiteboardEnImport)),
    'overview-ai-agents': parseMarkdownPage(normalizeRaw(overviewAiAgentsEnImport)),
    'overview-about-agora': parseMarkdownPage(normalizeRaw(overviewAboutAgoraEnImport)),
    'overview-browse-by-capability': parseMarkdownPage(
      normalizeRaw(overviewBrowseByCapabilityEnImport),
    ),
    'overview-community-resources': parseMarkdownPage(
      normalizeRaw(overviewCommunityResourcesEnImport),
    ),
    'overview-choose-your-path': parseMarkdownPage(
      normalizeRaw(overviewChooseYourPathEnImport),
    ),
    'overview-general-account': parseMarkdownPage(
      normalizeRaw(overviewGeneralAccountEnImport),
    ),
    'overview-general-members-roles': parseMarkdownPage(
      normalizeRaw(overviewGeneralMembersRolesEnImport),
    ),
    'overview-general-projects': parseMarkdownPage(
      normalizeRaw(overviewGeneralProjectsEnImport),
    ),
    'overview-general-security-privacy': parseMarkdownPage(
      normalizeRaw(overviewGeneralSecurityPrivacyEnImport),
    ),
    'overview-general-support': parseMarkdownPage(
      normalizeRaw(overviewGeneralSupportEnImport),
    ),
    'overview-general-usage-analytics': parseMarkdownPage(
      normalizeRaw(overviewGeneralUsageAnalyticsEnImport),
    ),
    'overview-home': parseMarkdownPage(normalizeRaw(overviewHomeEnImport)),
    'overview-media-services': parseMarkdownPage(
      normalizeRaw(overviewMediaServicesEnImport),
    ),
    'overview-messaging': parseMarkdownPage(
      normalizeRaw(overviewMessagingEnImport),
    ),
    'overview-pricing-access': parseMarkdownPage(
      normalizeRaw(overviewPricingAccessEnImport),
    ),
    'overview-product-matrix': parseMarkdownPage(
      normalizeRaw(overviewProductMatrixEnImport),
    ),
    'overview-realtime-audio-video': parseMarkdownPage(
      normalizeRaw(overviewRealtimeAudioVideoEnImport),
    ),
    'overview-rtm': parseMarkdownPage(normalizeRaw(overviewRtmEnImport)),
    'overview-rtsa': parseMarkdownPage(normalizeRaw(overviewRtsaEnImport)),
    'overview-rtc-server-sdk': parseMarkdownPage(
      normalizeRaw(overviewRtcServerSdkEnImport),
    ),
    'overview-release-notes': parseMarkdownPage(
      normalizeRaw(overviewReleaseNotesEnImport),
    ),
    'overview-security-compliance': parseMarkdownPage(
      normalizeRaw(overviewSecurityComplianceEnImport),
    ),
    'overview-speech-to-text': parseMarkdownPage(
      normalizeRaw(overviewSpeechToTextEnImport),
    ),
    'overview-fusion-cdn': parseMarkdownPage(
      normalizeRaw(overviewFusionCdnEnImport),
    ),
    'overview-whiteboard': parseMarkdownPage(
      normalizeRaw(overviewWhiteboardEnImport),
    ),
    'overview-start-with-ai': parseMarkdownPage(
      normalizeRaw(overviewStartWithAiEnImport),
    ),
  },
  'zh-CN': {
    'ai-agent-lifecycle': parseMarkdownPage(normalizeRaw(aiAgentLifecycleZhImport)),
    'ai-agents-and-realtime-channels': parseMarkdownPage(
      normalizeRaw(aiAgentsAndRealtimeChannelsZhImport),
    ),
    'ai-choose-your-integration-path': parseMarkdownPage(
      normalizeRaw(aiChooseYourIntegrationPathZhImport),
    ),
    'ai-client-component-api': parseMarkdownPage(
      normalizeRaw(aiClientComponentApiZhImport),
    ),
    'ai-configure-asr-and-tts': parseMarkdownPage(
      normalizeRaw(aiConfigureAsrAndTtsZhImport),
    ),
    'ai-configure-presets': parseMarkdownPage(
      normalizeRaw(aiConfigurePresetsZhImport),
    ),
    'ai-device-ai': parseMarkdownPage(normalizeRaw(aiDeviceAiZhImport)),
    'ai-home': parseMarkdownPage(normalizeRaw(aiHomeZhImport)),
    'ai-mobile-client': parseMarkdownPage(normalizeRaw(aiMobileClientZhImport)),
    'ai-models-voice-and-context': parseMarkdownPage(
      normalizeRaw(aiModelsVoiceAndContextZhImport),
    ),
    'ai-overview': parseMarkdownPage(normalizeRaw(aiOverviewZhImport)),
    'ai-production-checklist': parseMarkdownPage(
      normalizeRaw(aiProductionChecklistZhImport),
    ),
    'ai-start-with-agent-studio': parseMarkdownPage(
      normalizeRaw(aiStartWithAgentStudioZhImport),
    ),
    'ai-test-an-agent': parseMarkdownPage(normalizeRaw(aiTestAnAgentZhImport)),
    'ai-web-client': parseMarkdownPage(normalizeRaw(aiWebClientZhImport)),
    'rm-choose-your-product-path': parseMarkdownPage(
      normalizeRaw(rmChooseYourProductPathZhImport),
    ),
    'rm-console': parseMarkdownPage(normalizeRaw(rmConsoleZhImport)),
    'rm-collaboration-and-interaction': parseMarkdownPage(
      normalizeRaw(rmCollaborationAndInteractionZhImport),
    ),
    'rm-device-and-industry': parseMarkdownPage(
      normalizeRaw(rmDeviceAndIndustryZhImport),
    ),
    'rm-education-classrooms': parseMarkdownPage(
      normalizeRaw(rmEducationClassroomsZhImport),
    ),
    'rm-foundation-realtime': parseMarkdownPage(
      normalizeRaw(rmFoundationRealtimeZhImport),
    ),
    'rm-fusion-cdn': parseMarkdownPage(normalizeRaw(rmFusionCdnZhImport)),
    'rm-governance': parseMarkdownPage(normalizeRaw(rmGovernanceZhImport)),
    'rm-analytics': parseMarkdownPage(normalizeRaw(rmAnalyticsZhImport)),
    'rm-billing': parseMarkdownPage(normalizeRaw(rmBillingZhImport)),
    'rm-im': parseMarkdownPage(normalizeRaw(rmImZhImport)),
    'rm-live-interaction': parseMarkdownPage(normalizeRaw(rmLiveInteractionZhImport)),
    'rm-marketplace': parseMarkdownPage(normalizeRaw(rmMarketplaceZhImport)),
    'rm-media-processing-and-distribution': parseMarkdownPage(
      normalizeRaw(rmMediaProcessingAndDistributionZhImport),
    ),
    'rm-media-pull': parseMarkdownPage(normalizeRaw(rmMediaPullZhImport)),
    'rm-media-push': parseMarkdownPage(normalizeRaw(rmMediaPushZhImport)),
    'rm-meeting': parseMarkdownPage(normalizeRaw(rmMeetingZhImport)),
    'rm-overview': parseMarkdownPage(normalizeRaw(rmOverviewZhImport)),
    'rm-recording': parseMarkdownPage(normalizeRaw(rmRecordingZhImport)),
    'rm-rtc': parseMarkdownPage(normalizeRaw(rmRtcZhImport)),
    'rm-rtc-server-sdk': parseMarkdownPage(
      normalizeRaw(rmRtcServerSdkZhImport),
    ),
    'rm-rtm': parseMarkdownPage(normalizeRaw(rmRtmZhImport)),
    'rm-rtmp-gateway': parseMarkdownPage(
      normalizeRaw(rmRtmpGatewayZhImport),
    ),
    'rm-rtsa': parseMarkdownPage(normalizeRaw(rmRtsaZhImport)),
    'rm-sdk-extensions': parseMarkdownPage(
      normalizeRaw(rmSdkExtensionsZhImport),
    ),
    'rm-security': parseMarkdownPage(normalizeRaw(rmSecurityZhImport)),
    'rm-server-and-extensions': parseMarkdownPage(
      normalizeRaw(rmServerAndExtensionsZhImport),
    ),
    'rm-setup-service-and-credentials': parseMarkdownPage(
      normalizeRaw(rmSetupServiceAndCredentialsZhImport),
    ),
    'rm-smart-devices': parseMarkdownPage(
      normalizeRaw(rmSmartDevicesZhImport),
    ),
    'rm-speech-to-text': parseMarkdownPage(
      normalizeRaw(rmSpeechToTextZhImport),
    ),
    'rm-status-page': parseMarkdownPage(normalizeRaw(rmStatusPageZhImport)),
    'rm-teleoperation': parseMarkdownPage(
      normalizeRaw(rmTeleoperationZhImport),
    ),
    'rm-transcoding': parseMarkdownPage(normalizeRaw(rmTranscodingZhImport)),
    'rm-voip-call': parseMarkdownPage(normalizeRaw(rmVoipCallZhImport)),
    'rm-whiteboard': parseMarkdownPage(normalizeRaw(rmWhiteboardZhImport)),
    'overview-ai-agents': parseMarkdownPage(normalizeRaw(overviewAiAgentsZhImport)),
    'overview-about-agora': parseMarkdownPage(normalizeRaw(overviewAboutAgoraZhImport)),
    'overview-browse-by-capability': parseMarkdownPage(
      normalizeRaw(overviewBrowseByCapabilityZhImport),
    ),
    'overview-community-resources': parseMarkdownPage(
      normalizeRaw(overviewCommunityResourcesZhImport),
    ),
    'overview-choose-your-path': parseMarkdownPage(
      normalizeRaw(overviewChooseYourPathZhImport),
    ),
    'overview-general-account': parseMarkdownPage(
      normalizeRaw(overviewGeneralAccountZhImport),
    ),
    'overview-general-members-roles': parseMarkdownPage(
      normalizeRaw(overviewGeneralMembersRolesZhImport),
    ),
    'overview-general-projects': parseMarkdownPage(
      normalizeRaw(overviewGeneralProjectsZhImport),
    ),
    'overview-general-security-privacy': parseMarkdownPage(
      normalizeRaw(overviewGeneralSecurityPrivacyZhImport),
    ),
    'overview-general-support': parseMarkdownPage(
      normalizeRaw(overviewGeneralSupportZhImport),
    ),
    'overview-general-usage-analytics': parseMarkdownPage(
      normalizeRaw(overviewGeneralUsageAnalyticsZhImport),
    ),
    'overview-home': parseMarkdownPage(normalizeRaw(overviewHomeZhImport)),
    'overview-media-services': parseMarkdownPage(
      normalizeRaw(overviewMediaServicesZhImport),
    ),
    'overview-messaging': parseMarkdownPage(
      normalizeRaw(overviewMessagingZhImport),
    ),
    'overview-pricing-access': parseMarkdownPage(
      normalizeRaw(overviewPricingAccessZhImport),
    ),
    'overview-product-matrix': parseMarkdownPage(
      normalizeRaw(overviewProductMatrixZhImport),
    ),
    'overview-realtime-audio-video': parseMarkdownPage(
      normalizeRaw(overviewRealtimeAudioVideoZhImport),
    ),
    'overview-rtm': parseMarkdownPage(normalizeRaw(overviewRtmZhImport)),
    'overview-rtsa': parseMarkdownPage(normalizeRaw(overviewRtsaZhImport)),
    'overview-rtc-server-sdk': parseMarkdownPage(
      normalizeRaw(overviewRtcServerSdkZhImport),
    ),
    'overview-release-notes': parseMarkdownPage(
      normalizeRaw(overviewReleaseNotesZhImport),
    ),
    'overview-security-compliance': parseMarkdownPage(
      normalizeRaw(overviewSecurityComplianceZhImport),
    ),
    'overview-speech-to-text': parseMarkdownPage(
      normalizeRaw(overviewSpeechToTextZhImport),
    ),
    'overview-fusion-cdn': parseMarkdownPage(
      normalizeRaw(overviewFusionCdnZhImport),
    ),
    'overview-whiteboard': parseMarkdownPage(
      normalizeRaw(overviewWhiteboardZhImport),
    ),
    'overview-start-with-ai': parseMarkdownPage(
      normalizeRaw(overviewStartWithAiZhImport),
    ),
  },
};

export function loadHomeMarkdownPages(): HomeMarkdownPages {
  return pagesByLocale;
}

function normalizeRaw(raw: unknown): string {
  if (typeof raw === 'string') {
    return raw;
  }

  if (raw && typeof raw === 'object' && 'default' in raw) {
    const value = (raw as { default?: unknown }).default;
    return typeof value === 'string' ? value : '';
  }

  return '';
}

function parseMarkdownPage(raw: string): MarkdownPage {
  const { body, frontmatter } = splitFrontmatter(raw);
  const data = (parseYaml(frontmatter) ?? {}) as Partial<RawPage>;
  const fallbackTitle = inferMarkdownTitle(body);

  return {
    cards: data.cards ?? [],
    description: data.description ?? '',
    eyebrow: data.eyebrow,
    quickstartBody: data.quickstartBody,
    quickstartTitle: data.quickstartTitle,
    rawBody: body,
    sections: parseSections(body),
    title: data.title ?? fallbackTitle ?? 'Untitled',
  };
}

function splitFrontmatter(raw: string) {
  const normalized = raw.trimStart();
  const match = normalized.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return {
      body: normalized.trim(),
      frontmatter: '',
    };
  }

  return {
    body: match[2].trim(),
    frontmatter: match[1],
  };
}

function inferMarkdownTitle(markdown: string) {
  const match = markdown.match(/^\s{0,3}#{1,2}\s+(.+)$/m);
  return match?.[1]?.trim() || null;
}

function parseSections(markdown: string): MarkdownSection[] {
  if (!markdown.trim()) {
    return [];
  }

  const lines = markdown.split('\n');
  const sections: Array<{
    links: MarkdownLink[];
    paragraphs: string[];
    title: string;
  }> = [];

  let current: (typeof sections)[number] | null = null;
  let paragraphLines: string[] = [];

  const flushParagraph = () => {
    if (!current || paragraphLines.length === 0) {
      return;
    }

    current.paragraphs.push(paragraphLines.join(' ').trim());
    paragraphLines = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('## ')) {
      flushParagraph();
      current = {
        links: [],
        paragraphs: [],
        title: trimmed.slice(3).trim(),
      };
      sections.push(current);
      continue;
    }

    if (!current) {
      current = {
        links: [],
        paragraphs: [],
        title: '',
      };
      sections.push(current);
    }

    if (!trimmed) {
      flushParagraph();
      continue;
    }

    if (trimmed.startsWith('- ')) {
      flushParagraph();
      const link = parseMarkdownLink(trimmed.slice(2).trim());
      if (link) {
        current.links.push(link);
      } else {
        current.paragraphs.push(trimmed.slice(2).trim());
      }
      continue;
    }

    paragraphLines.push(trimmed);
  }

  flushParagraph();

  return sections
    .filter((section) => section.title || section.paragraphs.length > 0)
    .map((section) => ({
      body: section.paragraphs.join('\n\n'),
      links: section.links.length > 0 ? section.links : undefined,
      title: section.title || 'Section',
    }));
}

function parseMarkdownLink(value: string): MarkdownLink | null {
  const match = value.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
  if (!match) {
    return null;
  }

  return {
    href: match[2],
    label: match[1],
  };
}
