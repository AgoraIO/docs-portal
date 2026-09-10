import { compactSearchText } from './search-normalization';

export const PRODUCT_ALIASES = [
  'cloud recording',
  'agora cli',
  'iot sdk',
  'video sdk',
  'voice sdk',
  'real time engagement',
  'realtime engagement',
  'voice agent',
  'voice activity detection',
  'conversational ai',
  'real time transcription',
  'speech to text',
  'video calling',
  'interactive live streaming',
  'broadcast streaming',
  'flexible classroom',
] as const;

const SDK_ALIAS_SUFFIX = ' sdk';

const KNOWN_PRODUCT_IDENTITIES = new Set(
  PRODUCT_ALIASES.flatMap((alias) => [
    compactSearchText(alias),
    ...(alias.endsWith(SDK_ALIAS_SUFFIX)
      ? [compactSearchText(alias.slice(0, -SDK_ALIAS_SUFFIX.length))]
      : []),
  ]).filter(Boolean),
);

export function isKnownProductIdentity(value: string) {
  return KNOWN_PRODUCT_IDENTITIES.has(compactSearchText(value));
}
