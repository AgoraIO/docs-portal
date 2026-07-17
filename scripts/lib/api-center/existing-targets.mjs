const CONVERSATIONAL_AI_ROOT =
  'content/docs/zh-CN/api-reference/conversational-ai';

const REST_CLIENT_FILES = {
  go: {
    baseresponse: 'baseresponse.go',
    basicauthcredential: 'basicauthcredential',
    client: 'client.go',
    enum: 'enum',
    listoptions: 'listoptions.go',
    overview: 'overview',
    response: 'response.go',
    samplelogger: 'samplelogger.go',
    struct: 'struct',
  },
  java: {
    basicauthcredential: 'basicauthcredential',
    convoaiclient: 'convoaiclient.java',
    enum: 'enum',
    overview: 'overview',
    struct: 'struct',
  },
};

function normalizeLegacyPath(value) {
  let pathname;
  try {
    pathname = new URL(value, 'https://doc.shengwang.cn').pathname;
  } catch {
    pathname = String(value ?? '');
  }
  pathname = decodeURIComponent(pathname).replace(/\/+$/, '');
  return pathname.endsWith('.html')
    ? pathname.slice(0, -'.html'.length)
    : pathname;
}

function targetFor(relativePath) {
  const targetPath = `${CONVERSATIONAL_AI_ROOT}/${relativePath}.mdx`;
  return targetForPath(targetPath);
}

function targetForPath(targetPath, targetRoute) {
  return {
    targetPath,
    targetRoute:
      targetRoute ??
      `/${targetPath.replace(/^content\/docs\//, '').replace(/\.mdx$/, '')}`,
  };
}

function publicPlatform(value) {
  return value === 'javascript' ? 'web' : value;
}

/**
 * Prefer already-migrated canonical MDX when the legacy repository path map
 * still points at an obsolete or duplicate destination.
 */
export function resolveExistingApiCenterTarget(value) {
  const pathname = normalizeLegacyPath(value);

  const routeAliases = {
    '/basics/glossary': 'content/docs/zh-CN/introduction/glossary.mdx',
    '/basics/security/information':
      'content/docs/zh-CN/introduction/security/information.mdx',
    '/basics/security/video-sdk':
      'content/docs/zh-CN/introduction/security/sdk-compliance/video-sdk.mdx',
    '/basics/security/voice-sdk':
      'content/docs/zh-CN/introduction/security/sdk-compliance/voice-sdk.mdx',
    '/doc/console/general/user-guides/manage_authentication':
      'content/docs/zh-CN/introduction/user-guides/manage-authentication.mdx',
    '/zh-CN/realtime-media/recording/local-server-recording/reference/billing':
      'content/docs/zh-CN/realtime-media/local-server-recording/reference/billing.mdx',
    '/zh-CN/realtime-media/rtc/build/security-and-auth/firewall':
      'content/docs/zh-CN/realtime-media/rtc/build/setup-and-access/firewall.mdx',
    '/zh-CN/realtime-media/rtc/build/security-and-auth/token-authentication':
      'content/docs/zh-CN/realtime-media/rtc/build/setup-and-access/token-authentication.mdx',
  };
  if (routeAliases[pathname]) return targetForPath(routeAliases[pathname]);

  let match = pathname.match(
    /^\/api-ref\/meeting\/(android|electron|ios)\/client-api$/i,
  );
  if (match) {
    const platform = publicPlatform(match[1].toLowerCase());
    return targetForPath(
      'content/docs/zh-CN/api-reference/meeting/client-api.mdx',
      `/zh-CN/api-reference/meeting/${platform}`,
    );
  }

  match = pathname.match(
    /^\/api-ref\/(?:fastboard|whiteboard)\/(android|ios|javascript)\/fastboard-api$/i,
  );
  if (match) {
    const platform = publicPlatform(match[1].toLowerCase());
    return targetForPath(
      'content/docs/zh-CN/api-reference/whiteboard/fastboard/fastboard-api.mdx',
      `/zh-CN/api-reference/whiteboard/fastboard/${platform}`,
    );
  }

  match = pathname.match(
    /^\/api-ref\/rtm2\/(android|flutter|harmonyos|ios|javascript|unity)\/toc-message\/enum$/i,
  );
  if (match) {
    const platform = publicPlatform(match[1].toLowerCase());
    return targetForPath(
      `content/docs/zh-CN/api-reference/rtm/${platform}/enumv.mdx`,
      `/zh-CN/api-reference/rtm/${platform}/enumv`,
    );
  }

  match = pathname.match(
    /^\/api-ref\/rtm2\/(android|flutter|harmonyos|ios|javascript|unity)\/toc-(channel|configuration|lock|message|presence|storage|token|topic)\/([^/]+)$/i,
  );
  if (match) {
    const platform = publicPlatform(match[1].toLowerCase());
    const topic = match[2].toLowerCase();
    const leaf = match[3].toLowerCase();
    if (leaf !== topic) return null;
    return targetForPath(
      `content/docs/zh-CN/api-reference/rtm/toc-${topic}/${leaf}.mdx`,
      `/zh-CN/api-reference/rtm/${platform}/${leaf}`,
    );
  }

  match = pathname.match(
    /^\/doc\/rtc\/[^/]+\/basic-features\/(firewall|token-authentication)$/i,
  );
  if (match) {
    return targetForPath(
      `content/docs/zh-CN/realtime-media/rtc/build/setup-and-access/${match[1].toLowerCase()}.mdx`,
    );
  }

  match = pathname.match(
    /^\/doc\/rtc\/[^/]+\/best-practice\/reduce-app-size$/i,
  );
  if (match) {
    return targetForPath(
      'content/docs/zh-CN/realtime-media/rtc/build/optimize-and-operate/reduce-app-size.mdx',
    );
  }

  match = pathname.match(
    /^\/doc\/online-ktv\/[^/]+\/(?:online-ktv-sdk\/)?overview\/billing$/i,
  );
  if (match) {
    return targetForPath(
      'content/docs/zh-CN/solutions/online-ktv/online-ktv-sdk/reference/billing.mdx',
    );
  }

  match = pathname.match(
    /^\/api-ref\/convoai\/(android)\/android-component\/([^/]+)$/i,
  );
  if (match) return targetFor(`android/${match[2].toLowerCase()}`);

  match = pathname.match(
    /^\/api-ref\/convoai\/(ios)\/ios-component\/([^/]+)$/i,
  );
  if (match) return targetFor(`ios/${match[2].toLowerCase()}`);

  match = pathname.match(
    /^\/api-ref\/convoai\/(?:typescript)\/web-component\/([^/]+)$/i,
  );
  if (match) return targetFor(`web/${match[1].toLowerCase()}`);

  match = pathname.match(
    /^\/api-ref\/convoai\/(go|java)\/(?:go|java)-api\/([^/]+)$/i,
  );
  if (match) {
    const language = match[1].toLowerCase();
    const basename = match[2].toLowerCase();
    const targetBasename = REST_CLIENT_FILES[language]?.[basename];
    if (targetBasename) {
      return targetFor(`restclient-${language}/${targetBasename}`);
    }
  }

  match = pathname.match(
    /^\/api-ref\/convoai\/(agent-go|agent-python|agent-typescript)\/agent-sdk-api\/overview$/i,
  );
  if (match) return targetFor(match[1].toLowerCase());

  return null;
}
