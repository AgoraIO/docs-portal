// These legacy aggregate pages default to Android, but the audited anchors
// belong to other SDK pages. Keep this compatibility list tied to real anchors.
export const LEGACY_API_HASH_TARGETS: Record<string, Record<string, string>> = {
  'whiteboard/fastboard/fastboard-api': Object.fromEntries([
    ...[
      'roomconfig',
      'region',
      'themeasset',
      'whiteboardassets',
      'controlbarassets',
      'panelitemassets',
    ].map((hash) => [hash, 'whiteboard/fastboard/ios']),
    ...[
      'fastboardoptions',
      'ui',
      'fastboardreplayoptions',
      'replayui',
      'insertdocs1',
      'createfastboard',
      'docseventoptions',
      'createui',
      'mountprops',
      'camera',
      'rectangle',
      'shape',
      'color',
      'docstatic',
      'docdynamic',
      'appintoolbar',
      'fastboarduiconfig',
      'toolbarconfig',
      'uiconfig',
      'fastboardprops',
    ].map((hash) => [hash, 'whiteboard/fastboard/web']),
  ]),
  'rtm/toc-configuration/configuration': {
    tokenevent: 'rtm/harmonyos/configuration',
    agorartmmessageevent: 'rtm/ios/configuration',
    agorartmpresenceevent: 'rtm/ios/configuration',
    agorartmtopicevent: 'rtm/ios/configuration',
    agorartmstorageevent: 'rtm/ios/configuration',
    agorartmlockevent: 'rtm/ios/configuration',
    agorartmlinkstateevent: 'rtm/ios/configuration',
  },
  'rtm/toc-storage/storage': {
    metadataitem: 'rtm/flutter/storage',
    agorartmmetadata: 'rtm/ios/storage',
  },
};

export function resolveLegacyApiHashRedirect(
  locale: string,
  tab: string,
  slugSegments: string[],
  hash: string,
) {
  if (locale !== 'zh-CN' || tab !== 'api-reference') return null;
  let fragment = hash.replace(/^#/, '');
  try {
    fragment = decodeURIComponent(fragment);
  } catch {
    return null;
  }
  const path = slugSegments.join('/');
  if (!Object.hasOwn(LEGACY_API_HASH_TARGETS, path)) return null;
  const targets = LEGACY_API_HASH_TARGETS[path];
  const target =
    targets && Object.hasOwn(targets, fragment) ? targets[fragment] : undefined;
  return target ? `/zh-CN/api-reference/${target}` : null;
}
