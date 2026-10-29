const EN_MCP_GUIDE_PATHS = new Set([
  'ai/get-started/mcp-integrate',
  'ai/device-kit/get-started/mcp',
  'realtime-media/on-premise-recording/mcp',
  'realtime-media/broadcast-streaming/mcp',
  'realtime-media/transcoding/mcp',
  'realtime-media/video/mcp',
  'realtime-media/rtc/mcp',
  'realtime-media/rtmp-gateway/build/mcp',
  'realtime-media/cloud-recording/mcp',
  'realtime-media/im/get-started/mcp',
  'realtime-media/voice/mcp',
  'realtime-media/media-pull/build/mcp',
  'realtime-media/media-push/build/mcp',
  'realtime-media/whiteboard/build/mcp',
]);

const EN_SKILLS_GUIDE_PATHS = new Set([
  'ai/get-started/skills-integrate',
  'ai/device-kit/get-started/skills',
  'realtime-media/on-premise-recording/skills',
  'realtime-media/broadcast-streaming/skills',
  'realtime-media/transcoding/skills',
  'realtime-media/video/skills',
  'realtime-media/rtc/skills',
  'realtime-media/rtmp-gateway/build/skills',
  'realtime-media/cloud-recording/skills',
  'realtime-media/im/get-started/skills',
  'realtime-media/voice/skills',
  'realtime-media/media-pull/build/skills',
  'realtime-media/media-push/build/skills',
  'realtime-media/whiteboard/build/skills',
]);

export function resolveMovedDocsRedirect(
  locale: string,
  tab: string,
  slugSegments: string[],
) {
  if (locale !== 'en') return null;
  const path = [tab, ...slugSegments].join('/');
  const suffix = path.endsWith('.md') ? '.md' : '';
  const guidePath = path.replace(/\.md$/, '');
  if (EN_MCP_GUIDE_PATHS.has(guidePath)) {
    return `/en/introduction/agora-mcp${suffix}`;
  }
  if (EN_SKILLS_GUIDE_PATHS.has(guidePath)) {
    return `/en/introduction/agora-skills${suffix}`;
  }
  return null;
}

export function isPermanentMovedDocsRedirect(
  locale: string,
  tab: string,
  slugSegments: string[],
) {
  return resolveMovedDocsRedirect(locale, tab, slugSegments) !== null;
}
