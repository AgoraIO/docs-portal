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

export function resolveMovedDocsRedirect(
  locale: string,
  tab: string,
  slugSegments: string[],
) {
  if (locale !== 'en') return null;
  const path = [tab, ...slugSegments].join('/');
  const suffix = path.endsWith('.md') ? '.md' : '';
  return EN_MCP_GUIDE_PATHS.has(path.replace(/\.md$/, ''))
    ? `/en/introduction/agora-mcp${suffix}`
    : null;
}

export function isPermanentMovedDocsRedirect(
  locale: string,
  tab: string,
  slugSegments: string[],
) {
  return resolveMovedDocsRedirect(locale, tab, slugSegments) !== null;
}
