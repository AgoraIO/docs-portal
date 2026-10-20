export function toPublicRedirectTarget(target) {
  if (!/^\/zh-CN(?=\/|[?#]|$)/.test(target)) {
    return target;
  }

  const suffix = target.slice('/zh-CN'.length);
  return suffix.startsWith('/') ? suffix : `/${suffix}`;
}
