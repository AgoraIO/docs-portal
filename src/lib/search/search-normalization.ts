const PLATFORM_ALIASES: Readonly<Record<string, string>> = {
  'unreal-engine': 'unreal',
  reactjs: 'javascript',
};

export function stripSearchMarks(value: string) {
  return value.replace(/<\/?mark(?:\s[^>]*)?>/giu, '');
}

export function normalizeSearchText(value: string) {
  return stripSearchMarks(value)
    .normalize('NFKC')
    .trim()
    .replace(/\s+/gu, ' ')
    .toLowerCase();
}

export function tokenizeSearchText(value: string) {
  return (
    stripSearchMarks(value)
      .normalize('NFKC')
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
      .replace(/([a-z\d])([A-Z])/g, '$1 $2')
      .toLowerCase()
      .match(/[\p{L}\p{M}\p{N}]+/gu) ?? []
  );
}

export function compactSearchText(value: string) {
  return tokenizeSearchText(value).join('');
}

export function normalizeSearchPlatform(value: string) {
  const normalized = value.trim().toLowerCase();
  if (PLATFORM_ALIASES[normalized]) return PLATFORM_ALIASES[normalized];
  return normalized.startsWith('windows-') ? 'windows' : normalized;
}
