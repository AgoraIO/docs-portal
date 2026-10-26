export function toPublicRedirectTarget(target) {
  // Keep immutable migration snapshots intact while publishing canonical targets.
  target = target.replace(
    /^\/(zh-CN\/)?realtime-media\/rtc\/reference\/events(?=[?#]|$)/,
    '/$1api-reference/rtc/restful/webhook/events',
  );

  if (!/^\/zh-CN(?=\/|[?#]|$)/.test(target)) {
    return target;
  }

  const suffix = target.slice('/zh-CN'.length);
  return suffix.startsWith('/') ? suffix : `/${suffix}`;
}
